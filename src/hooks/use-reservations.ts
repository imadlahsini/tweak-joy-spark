import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import {
  getErrorMessage,
  getErrorStatusCode,
  type FetchReservationsResponse,
  type ReservationStats,
  type UpdateReservationStatusResponse,
} from "@/lib/admin-constants";
import type { ReservationRow, ReservationStatus, ReminderType } from "@/types/reservations";

export interface UseReservationsReturn {
  reservations: ReservationRow[];
  total: number;
  pageCount: number;
  lastRefreshedAt: Date | null;

  isSessionReady: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  accessDenied: boolean;
  fatalError: string | null;

  page: number;
  setPage: (page: number) => void;

  dateFrom: string;
  setDateFrom: (d: string) => void;
  dateTo: string;
  setDateTo: (d: string) => void;
  hasActiveFilters: boolean;
  clearFilters: () => void;

  draftStatusById: Record<string, ReservationStatus>;
  setDraftStatus: (id: string, status: ReservationStatus) => void;
  savingById: Record<string, boolean>;
  handleStatusSave: (reservation: ReservationRow) => Promise<void>;
  skipReminder: (reservationId: string, reminderType: ReminderType) => Promise<void>;
  resendReminder: (reservationId: string, reminderType: ReminderType) => Promise<void>;
  resendConfirmation: (reservationId: string) => Promise<void>;

  refresh: () => void;
  stats: ReservationStats;
}

export function useReservations(): UseReservationsReturn {
  const { toast } = useToast();
  const { isSessionReady } = useAdminSessionGuard();

  // Data
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [draftStatusById, setDraftStatusById] = useState<Record<string, ReservationStatus>>({});
  const [savingById, setSavingById] = useState<Record<string, boolean>>({});

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // UI
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const fetchRequestSeq = useRef(0);
  const activeFetchRequestSeq = useRef(0);

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
  }, [dateFrom, dateTo]);

  // Keep date range valid even if values are set externally.
  useEffect(() => {
    if (!dateFrom || !dateTo) return;
    if (dateFrom > dateTo) {
      setDateTo(dateFrom);
    }
  }, [dateFrom, dateTo]);

  const hasActiveFilters = useMemo(
    () => dateFrom !== "" || dateTo !== "",
    [dateFrom, dateTo],
  );

  // Fetch
  const fetchReservations = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!isSessionReady) return;
      const requestSeq = fetchRequestSeq.current + 1;
      fetchRequestSeq.current = requestSeq;
      activeFetchRequestSeq.current = requestSeq;

      if (mode === "refresh") {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const { data, error } = await supabase.functions.invoke("fetch-reservations", {
        body: {
          page,
          pageSize,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      });

      if (requestSeq !== activeFetchRequestSeq.current) {
        return;
      }

      if (mode === "refresh") {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }

      if (error) {
        const statusCode = getErrorStatusCode(error);
        if (statusCode === 401 || statusCode === 403) {
          setAccessDenied(true);
          setFatalError(null);
          return;
        }
        setFatalError(getErrorMessage(error));
        return;
      }

      setAccessDenied(false);
      setFatalError(null);

      const payload = (data ?? {
        reservations: [],
        pagination: { page: 0, pageSize, total: 0, pageCount: 1 },
      }) as FetchReservationsResponse;

      setReservations(payload.reservations);
      setTotal(payload.pagination.total);
      setPageCount(payload.pagination.pageCount);
      setLastRefreshedAt(new Date());
      setDraftStatusById((current) => {
        const next = { ...current };
        for (const reservation of payload.reservations) {
          next[reservation.id] = reservation.status;
        }
        return next;
      });
    },
    [isSessionReady, page, pageSize, dateFrom, dateTo],
  );

  // Initial fetch
  useEffect(() => {
    if (!isSessionReady || accessDenied) return;
    void fetchReservations("initial");
  }, [isSessionReady, accessDenied, fetchReservations]);

  // Auto-refresh every 45s
  useEffect(() => {
    if (!isSessionReady || accessDenied) return;
    const timer = window.setInterval(() => {
      void fetchReservations("refresh");
    }, 45_000);
    return () => window.clearInterval(timer);
  }, [isSessionReady, accessDenied, fetchReservations]);

  // Status save
  const handleStatusSave = useCallback(
    async (reservation: ReservationRow) => {
      const draftStatus = draftStatusById[reservation.id] ?? reservation.status;
      if (draftStatus === reservation.status || savingById[reservation.id]) return;

      const previousStatus = reservation.status;
      setSavingById((current) => ({ ...current, [reservation.id]: true }));
      setReservations((current) =>
        current.map((row) => (row.id === reservation.id ? { ...row, status: draftStatus } : row)),
      );

      const { data, error } = await supabase.functions.invoke("update-reservation-status", {
        body: { reservationId: reservation.id, status: draftStatus },
      });

      if (error) {
        setReservations((current) =>
          current.map((row) =>
            row.id === reservation.id ? { ...row, status: previousStatus } : row,
          ),
        );
        toast({
          title: "Status update failed",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        setSavingById((current) => ({ ...current, [reservation.id]: false }));
        return;
      }

      const payload = data as UpdateReservationStatusResponse;
      setReservations((current) =>
        current.map((row) => (row.id === reservation.id ? payload.reservation : row)),
      );
      setDraftStatusById((current) => ({
        ...current,
        [reservation.id]: payload.reservation.status,
      }));
      setSavingById((current) => ({ ...current, [reservation.id]: false }));

      toast({
        title: "Status updated",
        description:
          payload.remindersAutoSkipped > 0
            ? `Reservation saved. ${payload.remindersAutoSkipped} pending reminder(s) skipped.`
            : "Reservation status has been saved.",
      });
    },
    [draftStatusById, savingById, toast],
  );

  const skipReminder = useCallback(
    async (reservationId: string, reminderType: ReminderType) => {
      const { data, error } = await supabase.functions.invoke("manage-notification", {
        body: { action: "skip_reminder", reservationId, reminderType },
      });

      if (error) {
        toast({
          title: "Skip failed",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return;
      }

      const payload = data as { reservation: ReservationRow };
      setReservations((current) =>
        current.map((row) => (row.id === reservationId ? payload.reservation : row)),
      );
      toast({ title: "Reminder skipped", description: `The ${reminderType === "r24h" ? "24h" : "4h"} reminder has been skipped.` });
    },
    [toast],
  );

  const resendReminder = useCallback(
    async (reservationId: string, reminderType: ReminderType) => {
      const { data, error } = await supabase.functions.invoke("manage-notification", {
        body: { action: "resend_reminder", reservationId, reminderType },
      });

      if (error) {
        toast({
          title: "Resend failed",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return;
      }

      const payload = data as { reservation: ReservationRow };
      setReservations((current) =>
        current.map((row) => (row.id === reservationId ? payload.reservation : row)),
      );
      toast({ title: "Reminder queued", description: `The ${reminderType === "r24h" ? "24h" : "4h"} reminder has been re-queued for delivery.` });
    },
    [toast],
  );

  const resendConfirmation = useCallback(
    async (reservationId: string) => {
      const { data, error } = await supabase.functions.invoke("manage-notification", {
        body: { action: "resend_confirmation", reservationId },
      });

      if (error) {
        toast({
          title: "Resend failed",
          description: getErrorMessage(error),
          variant: "destructive",
        });
        return;
      }

      const payload = data as { reservation: ReservationRow; confirmationSent: boolean };
      setReservations((current) =>
        current.map((row) => (row.id === reservationId ? payload.reservation : row)),
      );

      if (payload.confirmationSent) {
        toast({ title: "Confirmation sent", description: "The WhatsApp confirmation has been re-sent." });
      } else {
        toast({
          title: "Confirmation failed",
          description: "The confirmation could not be delivered. Check the detail view for errors.",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  const clearFilters = useCallback(() => {
    setDateFrom("");
    setDateTo("");
    setPage(0);
  }, []);

  const setDraftStatus = useCallback((id: string, status: ReservationStatus) => {
    setDraftStatusById((current) => ({ ...current, [id]: status }));
  }, []);

  const refresh = useCallback(() => {
    void fetchReservations("refresh");
  }, [fetchReservations]);

  // Computed stats
  const stats = useMemo<ReservationStats>(() => {
    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Casablanca" }).format(
      new Date(),
    );
    const byStatus: Record<ReservationStatus, number> = {
      new: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      no_show: 0,
    };
    let todayCount = 0;
    for (const r of reservations) {
      byStatus[r.status]++;
      if (r.appointmentDate === todayStr) todayCount++;
    }
    return { total, todayCount, byStatus };
  }, [reservations, total]);

  return {
    reservations,
    total,
    pageCount,
    lastRefreshedAt,
    isSessionReady,
    isLoading,
    isRefreshing,
    accessDenied,
    fatalError,
    page,
    setPage,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    hasActiveFilters,
    clearFilters,
    draftStatusById,
    setDraftStatus,
    savingById,
    handleStatusSave,
    skipReminder,
    resendReminder,
    resendConfirmation,
    refresh,
    stats,
  };
}
