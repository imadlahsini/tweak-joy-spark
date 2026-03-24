import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getTodayStr } from "@/lib/queue-constants";
import type { QueuePatient, QueuePatientStatus, QueueType } from "@/types/queue";
import type { Optician } from "@/types/queue";

/* ------------------------------------------------------------------ */
/*  Row → domain mapper (mirrors use-queue.ts)                        */
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
  opticianId: row.optician_id,
  optician: row.optician
    ? ({
        id: row.optician.id,
        name: row.optician.name,
        phone: row.optician.phone,
        address: row.optician.address,
        mapLink: row.optician.map_link,
        isActive: row.optician.is_active,
        createdAt: row.optician.created_at,
      } as Optician)
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

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

/**
 * Public, read-only hook for the TV waiting-room display.
 * No auth guard — works with the anon Supabase role once the
 * `queue_patients_anon_today_read` RLS policy is applied.
 */
export const useQueueDisplay = () => {
  const today = getTodayStr();
  const [patients, setPatients] = useState<QueuePatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  /* ---------- Fetch ---------- */

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("queue_patients")
        .select("*, optician:opticians(*)")
        .eq("queue_date", today)
        .in("status", ["waiting", "with_medecin"])
        .order("position", { ascending: true });

      if (!err && data) {
        setPatients(data.map(mapRow));
      } else {
        setPatients([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [today]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  /* ---------- Realtime subscription ---------- */

  useEffect(() => {
    const channel = supabase
      .channel("queue-display-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_patients",
          filter: `queue_date=eq.${today}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            supabase
              .from("queue_patients")
              .select("*, optician:opticians(*)")
              .eq("id", (payload.new as { id: string }).id)
              .single()
              .then(({ data }) => {
                if (data && ["waiting", "with_medecin"].includes(data.status)) {
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
                if (!data) return;
                if (["waiting", "with_medecin"].includes(data.status)) {
                  setPatients((prev) => {
                    const exists = prev.some((p) => p.id === data.id);
                    if (exists) {
                      return prev.map((p) => (p.id === data.id ? mapRow(data) : p));
                    }
                    return [...prev, mapRow(data)];
                  });
                } else {
                  // Patient moved to completed / no_show / cancelled — remove from display
                  setPatients((prev) => prev.filter((p) => p.id !== data.id));
                }
              });
          } else if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id: string }).id;
            setPatients((prev) => prev.filter((p) => p.id !== deletedId));
          }
        },
      )
      .subscribe((status) => {
        setIsConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [today]);

  /* ---------- Derived columns ---------- */

  const columns = useMemo(
    () => ({
      rdv: patients
        .filter((p) => p.queueType === "rdv" && p.status === "waiting")
        .sort((a, b) => a.position - b.position),
      sans_rdv: patients
        .filter((p) => p.queueType === "sans_rdv" && p.status === "waiting")
        .sort((a, b) => a.position - b.position),
      with_medecin: patients
        .filter((p) => p.status === "with_medecin")
        .sort((a, b) => {
          const aT = a.withDoctorAt ? new Date(a.withDoctorAt).getTime() : 0;
          const bT = b.withDoctorAt ? new Date(b.withDoctorAt).getTime() : 0;
          return aT - bT;
        }),
    }),
    [patients],
  );

  const counts = useMemo(
    () => ({
      waiting: patients.filter((p) => p.status === "waiting").length,
      withDoctor: patients.filter((p) => p.status === "with_medecin").length,
    }),
    [patients],
  );

  return { columns, counts, isLoading, isConnected, dateStr: today };
};
