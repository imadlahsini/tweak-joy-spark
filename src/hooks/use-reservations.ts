import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import {
  getErrorMessage,
  getErrorStatusCode,
  statusLabel,
  type FetchReservationsResponse,
  type ReservationStats,
  type UpdateReservationStatusResponse,
} from "@/lib/admin-constants";
import type { ReservationRow, ReservationStatus } from "@/types/reservations";

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

  search: string;
  setSearch: (s: string) => void;
  statusFilter: "all" | ReservationStatus;
  setStatusFilter: (s: "all" | ReservationStatus) => void;
  dateFrom: string;
  setDateFrom: (d: string) => void;
  dateTo: string;
  setDateTo: (d: string) => void;
  activeFiltersSummary: string;
  hasActiveFilters: boolean;
  clearFilters: () => void;

  draftStatusById: Record<string, ReservationStatus>;
  setDraftStatus: (id: string, status: ReservationStatus) => void;
  savingById: Record<string, boolean>;
  handleStatusSave: (reservation: ReservationRow) => Promise<void>;

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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ReservationStatus>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // UI
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(0);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setPage(0);
  }, [statusFilter, dateFrom, dateTo]);

  const hasActiveFilters = useMemo(
    () => debouncedSearch !== "" || statusFilter !== "all" || dateFrom !== "" || dateTo !== "",
    [debouncedSearch, statusFilter, dateFrom, dateTo],
  );

  const activeFiltersSummary = useMemo(() => {
    const parts: string[] = [];
    if (debouncedSearch) parts.push(`Search: ${debouncedSearch}`);
    if (statusFilter !== "all") parts.push(`Status: ${statusLabel[statusFilter]}`);
    if (dateFrom) parts.push(`From: ${dateFrom}`);
    if (dateTo) parts.push(`To: ${dateTo}`);
    return parts.length > 0 ? parts.join(" · ") : "All reservations";
  }, [debouncedSearch, statusFilter, dateFrom, dateTo]);

  // Fetch
  const fetchReservations = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!isSessionReady) return;

      if (mode === "refresh") {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const { data, error } = await supabase.functions.invoke("fetch-reservations", {
        body: {
          page,
          pageSize,
          search: debouncedSearch,
          status: statusFilter,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        },
      });

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
    [isSessionReady, page, pageSize, debouncedSearch, statusFilter, dateFrom, dateTo],
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

  const clearFilters = useCallback(() => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
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
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    activeFiltersSummary,
    hasActiveFilters,
    clearFilters,
    draftStatusById,
    setDraftStatus,
    savingById,
    handleStatusSave,
    refresh,
    stats,
  };
}
