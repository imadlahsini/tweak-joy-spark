import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import { useOpticians } from "@/hooks/use-opticians";
import {
  getTodayStr,
  getWaitMinutes,
  type QueueStats,
} from "@/lib/queue-constants";
import {
  isValidMoroccanPhone,
  normalizeMoroccanPhone,
} from "@/lib/moroccan-phone";
import type {
  QueueColumnId,
  PatientProfile,
  QueuePatient,
  QueuePatientStatus,
  QueueType,
} from "@/types/queue";

/* ------------------------------------------------------------------ */
/*  Row → domain mapper                                                */
/* ------------------------------------------------------------------ */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapRow = (row: any): QueuePatient => ({
  id: row.id,
  queueDate: row.queue_date,
  queueType: row.queue_type as QueueType,
  clientName: row.client_name,
  clientPhone: row.client_phone,
  status: row.status as QueuePatientStatus,
  notes: row.notes,
  procedure: row.procedure,
  procedureAt: row.procedure_at,
  followUp: row.follow_up,
  followUpDate: row.follow_up_date,
  followUpQueuePatientId: row.follow_up_queue_patient_id,
  patientProfileId: row.patient_profile_id,
  opticianId: row.optician_id,
  optician: row.optician
    ? {
        id: row.optician.id,
        name: row.optician.name,
        phone: row.optician.phone,
        address: row.optician.address,
        mapLink: row.optician.map_link,
        isActive: row.optician.is_active,
        createdAt: row.optician.created_at,
      }
    : null,
  position: row.position,
  checkedInAt: row.checked_in_at,
  withDoctorAt: row.with_doctor_at,
  completedAt: row.completed_at,
  noShowAt: row.no_show_at,
  cancelledAt: row.cancelled_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const isMissingQueueSchemaError = (err: {
  code?: string | null;
  message?: string | null;
  details?: string | null;
}) => {
  const msg = (err.message ?? "").toLowerCase();
  const details = (err.details ?? "").toLowerCase();

  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    (err.code === "PGRST204" &&
      (msg.includes("queue_patients") || details.includes("queue_patients"))) ||
    msg.includes('relation "queue_patients" does not exist')
  );
};

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export const useQueue = () => {
  const { isSessionReady } = useAdminSessionGuard();
  const [selectedDate, setSelectedDate] = useState(getTodayStr);
  const [patients, setPatients] = useState<QueuePatient[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const pendingOps = useRef(new Set<string>());
  const fetchRequestSeq = useRef(0);
  const activeFetchRequestSeq = useRef(0);
  const {
    opticians,
    refresh: refreshOpticians,
    addOptician,
    toggleOptician,
  } = useOpticians({ enabled: isSessionReady });

  const isToday = selectedDate === getTodayStr();

  /* ---------- Fetch patients ---------- */

  const fetchPatients = useCallback(async (date: string) => {
    const requestSeq = fetchRequestSeq.current + 1;
    fetchRequestSeq.current = requestSeq;
    activeFetchRequestSeq.current = requestSeq;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase
        .from("queue_patients")
        .select("*, optician:opticians(*)")
        .eq("queue_date", date)
        .order("position", { ascending: true });

      if (requestSeq !== activeFetchRequestSeq.current) return;

      if (err) {
        if (isMissingQueueSchemaError(err)) {
          setPatients([]);
          setError(
            "Queue system is not set up yet. Apply queue migrations and reload this page.",
          );
        } else {
          throw err;
        }
      } else {
        setPatients((data ?? []).map(mapRow));
        setLastUpdatedAt(new Date());
      }
    } catch (e) {
      if (requestSeq !== activeFetchRequestSeq.current) return;
      setError(e instanceof Error ? e.message : "Failed to fetch queue");
    } finally {
      if (requestSeq !== activeFetchRequestSeq.current) return;
      setIsLoading(false);
    }
  }, []);

  /* ---------- Initial fetch ---------- */

  useEffect(() => {
    if (!isSessionReady) return;
    void fetchPatients(selectedDate);
  }, [isSessionReady, selectedDate, fetchPatients]);

  /* ---------- Realtime subscription (today only) ---------- */

  useEffect(() => {
    if (!isSessionReady || !isToday) return;

    const channel = supabase
      .channel("queue-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_patients",
          filter: `queue_date=eq.${selectedDate}`,
        },
        (payload) => {
          // Skip if we have a pending optimistic update for this record
          const id =
            (payload.new as { id?: string })?.id ??
            (payload.old as { id?: string })?.id;
          if (id && pendingOps.current.has(id)) return;
          setLastUpdatedAt(new Date());

          if (payload.eventType === "INSERT") {
            // Fetch the full row with optician join
            supabase
              .from("queue_patients")
              .select("*, optician:opticians(*)")
              .eq("id", (payload.new as { id: string }).id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setPatients((prev) => {
                    if (prev.some((p) => p.id === data.id)) return prev;
                    return [...prev, mapRow(data)];
                  });
                }
              });
          } else if (payload.eventType === "UPDATE") {
            supabase
              .from("queue_patients")
              .select("*, optician:opticians(*)")
              .eq("id", (payload.new as { id: string }).id)
              .single()
              .then(({ data }) => {
                if (data) {
                  setPatients((prev) =>
                    prev.map((p) => (p.id === data.id ? mapRow(data) : p)),
                  );
                }
              });
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id: string }).id;
            setPatients((prev) => prev.filter((p) => p.id !== deletedId));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isSessionReady, isToday, selectedDate]);

  /* ---------- Derived columns ---------- */

  const columns = useMemo(() => {
    const filtered = search
      ? patients.filter((p) =>
          p.clientName.toLowerCase().includes(search.toLowerCase()),
        )
      : patients;

    return {
      rdv: filtered
        .filter((p) => p.queueType === "rdv" && p.status === "waiting")
        .sort((a, b) => a.position - b.position),
      sans_rdv: filtered
        .filter((p) => p.queueType === "sans_rdv" && p.status === "waiting")
        .sort((a, b) => a.position - b.position),
      with_medecin: filtered
        .filter((p) => p.status === "with_medecin")
        .sort((a, b) => {
          const aT = a.withDoctorAt ? new Date(a.withDoctorAt).getTime() : 0;
          const bT = b.withDoctorAt ? new Date(b.withDoctorAt).getTime() : 0;
          return aT - bT;
        }),
    };
  }, [patients, search]);

  /* ---------- Stats ---------- */

  const stats = useMemo<QueueStats>(() => {
    const waiting = patients.filter((p) => p.status === "waiting").length;
    const withDoctor = patients.filter((p) => p.status === "with_medecin").length;
    const completed = patients.filter((p) => p.status === "completed").length;
    const noShow = patients.filter((p) => p.status === "no_show").length;

    // Average wait time for completed patients (check-in to with-doctor)
    const completedWithTimes = patients.filter(
      (p) =>
        (p.status === "completed" || p.status === "with_medecin") &&
        p.withDoctorAt &&
        p.checkedInAt,
    );
    const avgWaitMinutes =
      completedWithTimes.length > 0
        ? Math.round(
            completedWithTimes.reduce((sum, p) => {
              const wait =
                new Date(p.withDoctorAt!).getTime() -
                new Date(p.checkedInAt).getTime();
              return sum + wait / 60_000;
            }, 0) / completedWithTimes.length,
          )
        : 0;

    return { waiting, withDoctor, completed, noShow, avgWaitMinutes };
  }, [patients]);

  const criticalWaitingCount = useMemo(
    () =>
      patients.filter(
        (patient) =>
          patient.status === "waiting" &&
          getWaitMinutes(patient.checkedInAt) >= 4 * 60,
      ).length,
    [patients],
  );

  /* ---------- Mutations ---------- */

  const addPatient = useCallback(
    async (data: {
      clientName: string;
      clientPhone: string;
      queueType: QueueType;
      notes?: string;
    }): Promise<QueuePatient> => {
      const { data: row, error: err } = await supabase.rpc("add_queue_patient_atomic", {
        _queue_date: selectedDate,
        _queue_type: data.queueType,
        _client_name: data.clientName.trim(),
        _client_phone: data.clientPhone.trim(),
        _notes: data.notes?.trim() || null,
      });

      if (err) throw err;
      if (!row) {
        throw new Error("Queue add returned no patient record.");
      }

      const mappedPatient = mapRow(row);
      setPatients((prev) => {
        const existingIndex = prev.findIndex((patient) => patient.id === mappedPatient.id);
        if (existingIndex >= 0) {
          return prev.map((patient) =>
            patient.id === mappedPatient.id ? mappedPatient : patient,
          );
        }
        return [...prev, mappedPatient];
      });
      setLastUpdatedAt(new Date());
      return mappedPatient;
    },
    [selectedDate],
  );

  const findPatientProfileByPhone = useCallback(
    async (phone: string): Promise<PatientProfile | null> => {
      const normalizedPhone = normalizeMoroccanPhone(phone);
      if (!isValidMoroccanPhone(normalizedPhone)) {
        return null;
      }

      const { data, error: err } = await supabase
        .from("patient_profiles")
        .select("id, name, phone, normalized_phone, created_at, updated_at")
        .eq("normalized_phone", normalizedPhone)
        .maybeSingle();

      if (err) throw err;
      if (!data) return null;

      return {
        id: data.id,
        name: data.name,
        phone: data.phone,
        normalizedPhone: data.normalized_phone,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    },
    [],
  );

  const movePatient = useCallback(
    async (patientId: string, targetColumn: QueueColumnId) => {
      const sourcePatient = patients.find((p) => p.id === patientId);
      const isValidSource =
        sourcePatient?.status === "waiting" &&
        (sourcePatient.queueType === "rdv" ||
          sourcePatient.queueType === "sans_rdv");
      const isValidTarget = targetColumn === "with_medecin";

      // Hard one-way guardrails for drag/drop safety.
      if (!sourcePatient || !isValidSource || !isValidTarget) {
        return;
      }

      const withDoctorAt = new Date().toISOString();
      pendingOps.current.add(patientId);

      // Optimistic update
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id !== patientId) return p;
          return {
            ...p,
            status: "with_medecin" as QueuePatientStatus,
            withDoctorAt,
          };
        }),
      );

      try {
        const { error: err } = await supabase.rpc(
          "move_queue_patient_to_medecin_atomic",
          {
            _patient_id: patientId,
          },
        );

        if (err) throw err;
        setLastUpdatedAt(new Date());
        if (!isToday) {
          await fetchPatients(selectedDate);
        }
      } catch {
        // Revert on failure
        await fetchPatients(selectedDate);
      } finally {
        pendingOps.current.delete(patientId);
      }
    },
    [patients, selectedDate, isToday, fetchPatients],
  );

  const updatePatient = useCallback(
    async (id: string, updates: Record<string, unknown>) => {
      const dbUpdates: Record<string, unknown> = {};
      // Map camelCase to snake_case
      const keyMap: Record<string, string> = {
        clientName: "client_name",
        clientPhone: "client_phone",
        notes: "notes",
        procedure: "procedure",
        procedureAt: "procedure_at",
        followUp: "follow_up",
        opticianId: "optician_id",
        status: "status",
      };
      for (const [k, v] of Object.entries(updates)) {
        dbUpdates[keyMap[k] ?? k] = v;
      }

      const { error: err } = await supabase
        .from("queue_patients")
        .update(dbUpdates)
        .eq("id", id);

      if (err) throw err;
      setLastUpdatedAt(new Date());
      if (!isToday) await fetchPatients(selectedDate);
    },
    [isToday, selectedDate, fetchPatients],
  );

  const setPatientFollowUp = useCallback(
    async (id: string, followUp: string, followUpDate: string) => {
      const sourcePatient = patients.find((patient) => patient.id === id);
      const previousFollowUpDate = sourcePatient?.followUpDate ?? null;

      const { data: row, error: err } = await supabase.rpc(
        "set_queue_patient_follow_up_atomic",
        {
          _source_queue_patient_id: id,
          _follow_up: followUp,
          _follow_up_date: followUpDate,
        },
      );

      if (err) throw err;
      if (!row) {
        throw new Error("Follow-up scheduling returned no patient record.");
      }

      const mappedPatient = mapRow(row);
      setPatients((prev) =>
        prev.map((patient) =>
          patient.id === id
            ? {
                ...patient,
                followUp: mappedPatient.followUp,
                followUpDate: mappedPatient.followUpDate,
                followUpQueuePatientId: mappedPatient.followUpQueuePatientId,
                updatedAt: mappedPatient.updatedAt,
              }
            : patient,
        ),
      );
      setLastUpdatedAt(new Date());

      if (previousFollowUpDate === selectedDate || mappedPatient.followUpDate === selectedDate) {
        await fetchPatients(selectedDate);
      }

      return mappedPatient;
    },
    [patients, selectedDate, fetchPatients],
  );

  const completePatient = useCallback(
    async (id: string) => {
      pendingOps.current.add(id);
      setPatients((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: "completed" as QueuePatientStatus, completedAt: new Date().toISOString() }
            : p,
        ),
      );

      try {
        const { error: err } = await supabase
          .from("queue_patients")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", id);
        if (err) throw err;
        setLastUpdatedAt(new Date());
      } catch {
        await fetchPatients(selectedDate);
      } finally {
        pendingOps.current.delete(id);
      }
    },
    [selectedDate, fetchPatients],
  );

  const markNoShow = useCallback(
    async (id: string) => {
      pendingOps.current.add(id);
      setPatients((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: "no_show" as QueuePatientStatus, noShowAt: new Date().toISOString() }
            : p,
        ),
      );

      try {
        const { error: err } = await supabase
          .from("queue_patients")
          .update({ status: "no_show", no_show_at: new Date().toISOString() })
          .eq("id", id);
        if (err) throw err;
        setLastUpdatedAt(new Date());
      } catch {
        await fetchPatients(selectedDate);
      } finally {
        pendingOps.current.delete(id);
      }
    },
    [selectedDate, fetchPatients],
  );

  const refresh = useCallback(() => {
    void fetchPatients(selectedDate);
    void refreshOpticians();
  }, [fetchPatients, refreshOpticians, selectedDate]);

  return {
    isSessionReady,
    selectedDate,
    setSelectedDate,
    patients,
    opticians,
    columns,
    stats,
    search,
    setSearch,
    isLoading,
    error,
    lastUpdatedAt,
    criticalWaitingCount,
    isToday,
    addPatient,
    findPatientProfileByPhone,
    movePatient,
    updatePatient,
    setPatientFollowUp,
    completePatient,
    markNoShow,
    addOptician,
    toggleOptician,
    refreshOpticians,
    refresh,
  };
};
