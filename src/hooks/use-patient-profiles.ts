import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSessionGuard } from "@/hooks/use-admin-session-guard";
import { normalizeMoroccanPhone } from "@/lib/moroccan-phone";
import { mapPatientProfileRow } from "@/lib/patient-profiles";
import {
  deliveryLabel,
  formatDateTime,
  statusLabel,
} from "@/lib/admin-constants";
import {
  formatQueueDate,
  queueStatusLabel,
  queueTypeLabel,
} from "@/lib/queue-constants";
import type { PatientProfile } from "@/types/queue";
import type {
  PatientProfileActivityBadgeTone,
  PatientProfileActivityItem,
  PatientProfileAppointmentHistoryRow,
  PatientProfileDetailPayload,
  PatientProfileDirectoryItem,
  PatientProfileQueueHistoryRow,
} from "@/types/patient-profiles";
import type { ReminderState, ReservationStatus } from "@/types/reservations";
import type { QueuePatientStatus, QueueType } from "@/types/queue";

const PROFILE_PAGE_SIZE = 25;

const APPOINTMENT_SELECT = `
  id,
  client_name,
  client_phone,
  language,
  appointment_date,
  appointment_time,
  appointment_at,
  status,
  confirmation_whatsapp_status,
  confirmation_whatsapp_attempts,
  confirmation_whatsapp_sent_at,
  confirmation_whatsapp_error,
  created_at,
  updated_at,
  appointment_reminders (
    id,
    reminder_type,
    status,
    attempts,
    scheduled_for,
    sent_at,
    last_error,
    updated_at
  )
`;

interface ReminderRow {
  reminder_type: "r24h" | "r4h";
  status: ReminderState["status"];
  attempts: number;
  scheduled_for: string;
  sent_at: string | null;
  last_error: string | null;
  updated_at: string;
}

interface AppointmentRow {
  id: string;
  client_name: string;
  client_phone: string;
  language: string;
  appointment_date: string;
  appointment_time: string;
  appointment_at: string;
  status: ReservationStatus;
  confirmation_whatsapp_status: PatientProfileAppointmentHistoryRow["confirmation"]["status"];
  confirmation_whatsapp_attempts: number;
  confirmation_whatsapp_sent_at: string | null;
  confirmation_whatsapp_error: string | null;
  created_at: string;
  updated_at: string;
  appointment_reminders: ReminderRow[] | null;
}

interface QueueHistoryRow {
  id: string;
  queue_date: string;
  queue_type: QueueType;
  status: QueuePatientStatus;
  procedure: string | null;
  follow_up: string | null;
  follow_up_date: string | null;
  notes: string | null;
  client_phone: string | null;
  checked_in_at: string;
  with_doctor_at: string | null;
  completed_at: string | null;
  no_show_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  appointment_id: string | null;
  optician: {
    name: string;
  } | null;
}

interface LinkedDirectoryQueueRow {
  patient_profile_id: string | null;
  updated_at: string;
}

interface LegacyDirectoryQueueRow {
  client_phone: string | null;
  updated_at: string;
}

interface DirectoryAppointmentRow {
  normalized_client_phone: string | null;
  updated_at: string;
}

const emptyReminder = (): ReminderState => ({
  status: "pending",
  attempts: 0,
  scheduledFor: null,
  sentAt: null,
  lastError: null,
  updatedAt: null,
});

const normalizeReminderMap = (
  reminders: ReminderRow[] | null,
): Record<"r24h" | "r4h", ReminderState> => {
  const map = {
    r24h: emptyReminder(),
    r4h: emptyReminder(),
  };

  for (const reminder of reminders ?? []) {
    map[reminder.reminder_type] = {
      status: reminder.status,
      attempts: reminder.attempts,
      scheduledFor: reminder.scheduled_for,
      sentAt: reminder.sent_at,
      lastError: reminder.last_error,
      updatedAt: reminder.updated_at,
    };
  }

  return map;
};

const mapAppointmentRow = (row: AppointmentRow): PatientProfileAppointmentHistoryRow => ({
  id: row.id,
  clientName: row.client_name,
  clientPhone: row.client_phone,
  language: row.language,
  appointmentDate: row.appointment_date,
  appointmentTime: row.appointment_time,
  appointmentAt: row.appointment_at,
  status: row.status,
  confirmation: {
    status: row.confirmation_whatsapp_status,
    attempts: row.confirmation_whatsapp_attempts,
    sentAt: row.confirmation_whatsapp_sent_at,
    error: row.confirmation_whatsapp_error,
  },
  reminders: normalizeReminderMap(row.appointment_reminders),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapQueueHistoryRow = (
  row: QueueHistoryRow,
  isLegacyPhoneMatch: boolean,
): PatientProfileQueueHistoryRow => ({
  id: row.id,
  queueDate: row.queue_date,
  queueType: row.queue_type,
  status: row.status,
  procedure: row.procedure,
  followUp: row.follow_up,
  followUpDate: row.follow_up_date,
  opticianName: row.optician?.name ?? null,
  notes: row.notes,
  clientPhone: row.client_phone,
  checkedInAt: row.checked_in_at,
  withDoctorAt: row.with_doctor_at,
  completedAt: row.completed_at,
  noShowAt: row.no_show_at,
  cancelledAt: row.cancelled_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  appointmentId: row.appointment_id,
  isLegacyPhoneMatch,
});

const sanitizeSearchTerm = (value: string) => value.replace(/,/g, " ").trim();

const applyProfileSearch = (query: any, rawSearch: string) => {
  const search = sanitizeSearchTerm(rawSearch);
  if (search === "") return query;

  const normalized = normalizeMoroccanPhone(search);
  const clauses = [
    `name.ilike.%${search}%`,
    `phone.ilike.%${search}%`,
  ];

  if (normalized !== "") {
    clauses.push(`normalized_phone.ilike.%${normalized}%`);
  }

  return query.or(clauses.join(","));
};

const mergeQueueHistory = (
  linkedRows: QueueHistoryRow[],
  legacyRows: QueueHistoryRow[],
) => {
  const seen = new Set<string>();
  const merged: PatientProfileQueueHistoryRow[] = [];

  for (const row of linkedRows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    merged.push(mapQueueHistoryRow(row, false));
  }

  for (const row of legacyRows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    merged.push(mapQueueHistoryRow(row, true));
  }

  return merged.sort((a, b) => {
    if (a.queueDate === b.queueDate) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.queueDate < b.queueDate ? 1 : -1;
  });
};

const countBy = (values: string[]) => {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
};

const latestBy = (entries: Array<{ key: string; value: string | null }>) => {
  const latest = new Map<string, string>();

  for (const entry of entries) {
    if (entry.key === "" || entry.value == null || entry.value === "") continue;
    const current = latest.get(entry.key);
    if (current == null || new Date(entry.value).getTime() > new Date(current).getTime()) {
      latest.set(entry.key, entry.value);
    }
  }

  return latest;
};

const pickLatestTimestamp = (...values: Array<string | null | undefined>) => {
  let latest: string | null = null;

  for (const value of values) {
    if (value == null || value === "") continue;
    if (latest == null || new Date(value).getTime() > new Date(latest).getTime()) {
      latest = value;
    }
  }

  return latest;
};

const fetchDirectoryActivityCounts = async (
  profiles: PatientProfile[],
): Promise<Map<string, { queueVisitCount: number; appointmentCount: number; lastActivityAt: string | null }>> => {
  const activityMap = new Map<
    string,
    { queueVisitCount: number; appointmentCount: number; lastActivityAt: string | null }
  >();

  if (profiles.length === 0) {
    return activityMap;
  }

  const profileIds = profiles.map((profile) => profile.id);
  const phones = Array.from(
    new Set(profiles.map((profile) => profile.phone).filter((phone) => phone !== "")),
  );
  const normalizedPhones = Array.from(
    new Set(
      profiles
        .map((profile) => profile.normalizedPhone)
        .filter((phone) => phone !== ""),
    ),
  );

  const linkedQueuePromise = profileIds.length
    ? supabase
        .from("queue_patients")
        .select("patient_profile_id, updated_at")
        .in("patient_profile_id", profileIds)
    : Promise.resolve({ data: [], error: null });

  const legacyQueuePromise = phones.length
    ? supabase
        .from("queue_patients")
        .select("client_phone, updated_at")
        .is("patient_profile_id", null)
        .in("client_phone", phones)
    : Promise.resolve({ data: [], error: null });

  const appointmentPromise = normalizedPhones.length
    ? supabase
        .from("appointments")
        .select("normalized_client_phone, updated_at")
        .in("normalized_client_phone", normalizedPhones)
    : Promise.resolve({ data: [], error: null });

  const [linkedQueueResult, legacyQueueResult, appointmentResult] = await Promise.all([
    linkedQueuePromise,
    legacyQueuePromise,
    appointmentPromise,
  ]);

  if (linkedQueueResult.error) throw linkedQueueResult.error;
  if (legacyQueueResult.error) throw legacyQueueResult.error;
  if (appointmentResult.error) throw appointmentResult.error;

  const linkedQueueRows = (linkedQueueResult.data ?? []) as LinkedDirectoryQueueRow[];
  const legacyQueueRows = (legacyQueueResult.data ?? []) as LegacyDirectoryQueueRow[];
  const appointmentRows = (appointmentResult.data ?? []) as DirectoryAppointmentRow[];

  const linkedCounts = countBy(
    linkedQueueRows
      .map((row) => row.patient_profile_id)
      .filter((value): value is string => value != null),
  );
  const legacyCounts = countBy(
    legacyQueueRows
      .map((row) => row.client_phone)
      .filter((value): value is string => value != null),
  );
  const appointmentCounts = countBy(
    appointmentRows
      .map((row) => row.normalized_client_phone)
      .filter((value): value is string => value != null),
  );

  const linkedLatest = latestBy(
    linkedQueueRows.map((row) => ({
      key: row.patient_profile_id ?? "",
      value: row.updated_at,
    })),
  );
  const legacyLatest = latestBy(
    legacyQueueRows.map((row) => ({
      key: row.client_phone ?? "",
      value: row.updated_at,
    })),
  );
  const appointmentLatest = latestBy(
    appointmentRows.map((row) => ({
      key: row.normalized_client_phone ?? "",
      value: row.updated_at,
    })),
  );

  for (const profile of profiles) {
    activityMap.set(profile.id, {
      queueVisitCount:
        (linkedCounts.get(profile.id) ?? 0) + (legacyCounts.get(profile.phone) ?? 0),
      appointmentCount: appointmentCounts.get(profile.normalizedPhone) ?? 0,
      lastActivityAt: pickLatestTimestamp(
        profile.updatedAt,
        linkedLatest.get(profile.id),
        legacyLatest.get(profile.phone),
        appointmentLatest.get(profile.normalizedPhone),
      ),
    });
  }

  return activityMap;
};

const queueActivityToneByStatus: Record<QueuePatientStatus, PatientProfileActivityBadgeTone> = {
  waiting: "warning",
  with_medecin: "success",
  completed: "success",
  no_show: "danger",
  cancelled: "neutral",
};

const appointmentActivityToneByStatus: Record<ReservationStatus, PatientProfileActivityBadgeTone> = {
  new: "info",
  confirmed: "success",
  completed: "success",
  cancelled: "danger",
  no_show: "warning",
};

const deliveryTone = (
  status: PatientProfileAppointmentHistoryRow["confirmation"]["status"],
): PatientProfileActivityBadgeTone => {
  if (status === "sent") return "success";
  if (status === "failed") return "danger";
  if (status === "skipped") return "warning";
  return "neutral";
};

const queueActivityTitle: Record<QueuePatientStatus, string> = {
  waiting: "Queue check-in",
  with_medecin: "With doctor",
  completed: "Completed visit",
  no_show: "Marked no show",
  cancelled: "Cancelled visit",
};

const appointmentActivityTitle: Record<ReservationStatus, string> = {
  new: "Appointment scheduled",
  confirmed: "Appointment confirmed",
  completed: "Appointment completed",
  cancelled: "Appointment cancelled",
  no_show: "Appointment no show",
};

const getQueueOccurredAt = (row: PatientProfileQueueHistoryRow) =>
  row.completedAt ??
  row.cancelledAt ??
  row.noShowAt ??
  row.withDoctorAt ??
  row.checkedInAt ??
  row.updatedAt ??
  row.createdAt;

const buildQueueActivityItem = (
  row: PatientProfileQueueHistoryRow,
): PatientProfileActivityItem => {
  const badges: PatientProfileActivityItem["badges"] = [
    {
      label: queueTypeLabel[row.queueType] ?? row.queueType,
      tone: row.queueType === "rdv" ? "info" : "warning",
    },
    {
      label: queueStatusLabel[row.status],
      tone: queueActivityToneByStatus[row.status],
    },
  ];

  if (row.isLegacyPhoneMatch) {
    badges.push({ label: "Legacy phone match", tone: "neutral" });
  }

  const meta = [
    row.procedure || "No procedure",
    row.followUp && row.followUpDate
      ? `${row.followUp} on ${formatQueueDate(row.followUpDate)}`
      : row.followUp,
    row.opticianName ? `Optician ${row.opticianName}` : null,
  ].filter((value): value is string => value != null && value !== "");

  return {
    id: `queue-${row.id}`,
    kind: "queue",
    occurredAt: getQueueOccurredAt(row),
    title: queueActivityTitle[row.status],
    subtitle: `${queueTypeLabel[row.queueType] ?? row.queueType} · ${formatQueueDate(row.queueDate)}`,
    meta,
    note: row.notes,
    badges,
  };
};

const buildAppointmentActivityItem = (
  row: PatientProfileAppointmentHistoryRow,
  isUpcoming: boolean,
): PatientProfileActivityItem => {
  const badges: PatientProfileActivityItem["badges"] = [
    {
      label: statusLabel[row.status],
      tone: appointmentActivityToneByStatus[row.status],
    },
  ];

  if (row.confirmation.status !== "unknown") {
    badges.push({
      label: `Confirmation ${deliveryLabel[row.confirmation.status]}`,
      tone: deliveryTone(row.confirmation.status),
    });
  }

  const meta = [row.language.toUpperCase(), row.clientPhone || null].filter(
    (value): value is string => value != null && value !== "",
  );

  return {
    id: `appointment-${row.id}`,
    kind: "appointment",
    occurredAt: row.appointmentAt,
    title: isUpcoming ? "Upcoming appointment" : appointmentActivityTitle[row.status],
    subtitle: formatDateTime(row.appointmentAt),
    meta,
    note: row.confirmation.error,
    badges,
  };
};

const buildActivityCollections = (
  queueHistory: PatientProfileQueueHistoryRow[],
  upcomingAppointments: PatientProfileAppointmentHistoryRow[],
  pastAppointments: PatientProfileAppointmentHistoryRow[],
) => ({
  upcomingActivity: upcomingAppointments.map((row) => buildAppointmentActivityItem(row, true)),
  recentActivity: [
    ...queueHistory.map((row) => buildQueueActivityItem(row)),
    ...pastAppointments.map((row) => buildAppointmentActivityItem(row, false)),
  ].sort(
    (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  ),
});

const decorateDirectoryProfile = (
  profile: PatientProfile,
  activityCounts: Map<string, { queueVisitCount: number; appointmentCount: number; lastActivityAt: string | null }>,
): PatientProfileDirectoryItem => ({
  ...profile,
  queueVisitCount: activityCounts.get(profile.id)?.queueVisitCount ?? 0,
  appointmentCount: activityCounts.get(profile.id)?.appointmentCount ?? 0,
  lastActivityAt: activityCounts.get(profile.id)?.lastActivityAt ?? profile.updatedAt,
});

export const usePatientProfilesDirectory = (selectedProfileId?: string) => {
  const { isSessionReady } = useAdminSessionGuard();
  const [profiles, setProfiles] = useState<PatientProfileDirectoryItem[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<PatientProfileDirectoryItem | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 220);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch]);

  useEffect(() => {
    if (isSessionReady === false) return;

    let cancelled = false;
    const shouldRefresh = hasLoadedRef.current;

    if (shouldRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    const load = async () => {
      const rangeStart = page * PROFILE_PAGE_SIZE;
      const rangeEnd = rangeStart + PROFILE_PAGE_SIZE - 1;

      let countQuery = supabase
        .from("patient_profiles")
        .select("id", { count: "exact", head: true });
      let dataQuery = supabase
        .from("patient_profiles")
        .select("id, name, phone, normalized_phone, created_at, updated_at")
        .order("updated_at", { ascending: false })
        .range(rangeStart, rangeEnd);
      const selectedQuery =
        selectedProfileId == null || selectedProfileId === ""
          ? Promise.resolve({ data: null, error: null })
          : supabase
              .from("patient_profiles")
              .select("id, name, phone, normalized_phone, created_at, updated_at")
              .eq("id", selectedProfileId)
              .maybeSingle();

      countQuery = applyProfileSearch(countQuery, debouncedSearch);
      dataQuery = applyProfileSearch(dataQuery, debouncedSearch);

      const [countResult, dataResult, selectedResult] = await Promise.all([
        countQuery,
        dataQuery,
        selectedQuery,
      ]);
      if (cancelled) return;
      if (countResult.error) throw countResult.error;
      if (dataResult.error) throw dataResult.error;
      if (selectedResult.error) throw selectedResult.error;

      const mappedProfiles = (dataResult.data ?? []).map(mapPatientProfileRow);
      const selectedMappedProfile = selectedResult.data ? mapPatientProfileRow(selectedResult.data) : null;
      const countProfiles = selectedMappedProfile
        ? mappedProfiles.some((profile) => profile.id === selectedMappedProfile.id)
          ? mappedProfiles
          : [...mappedProfiles, selectedMappedProfile]
        : mappedProfiles;
      const activityCounts = await fetchDirectoryActivityCounts(countProfiles);
      if (cancelled) return;

      const decoratedProfiles = mappedProfiles.map((profile) =>
        decorateDirectoryProfile(profile, activityCounts),
      );
      const decoratedSelectedProfile = selectedMappedProfile
        ? decorateDirectoryProfile(selectedMappedProfile, activityCounts)
        : null;

      setProfiles(decoratedProfiles);
      setSelectedProfile(decoratedSelectedProfile);
      setTotal(countResult.count ?? 0);
      setPageCount(Math.max(1, Math.ceil((countResult.count ?? 0) / PROFILE_PAGE_SIZE)));
      setLastRefreshedAt(new Date());
      hasLoadedRef.current = true;
    };

    load()
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load patient profiles.");
        setProfiles([]);
        setSelectedProfile(null);
        setTotal(0);
        setPageCount(1);
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
        setIsRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, isSessionReady, page, reloadToken, selectedProfileId]);

  const refresh = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  return {
    isSessionReady,
    profiles,
    selectedProfile,
    search,
    setSearch,
    page,
    setPage,
    total,
    pageCount,
    pageSize: PROFILE_PAGE_SIZE,
    isLoading,
    isRefreshing,
    error,
    lastRefreshedAt,
    refresh,
  };
};

export const usePatientProfileDetail = (profileId: string | undefined) => {
  const { isSessionReady } = useAdminSessionGuard();
  const [detail, setDetail] = useState<PatientProfileDetailPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [reloadToken, setReloadToken] = useState(0);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (isSessionReady === false) return;
    if (profileId == null || profileId === "") {
      setDetail(null);
      setError(null);
      setIsLoading(false);
      setIsRefreshing(false);
      hasLoadedRef.current = false;
      return;
    }

    let cancelled = false;
    const shouldRefresh = hasLoadedRef.current;

    if (shouldRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    const load = async () => {
      const { data: profileRow, error: profileError } = await supabase
        .from("patient_profiles")
        .select("id, name, phone, normalized_phone, created_at, updated_at")
        .eq("id", profileId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (profileRow == null) {
        throw new Error("Patient profile not found.");
      }

      const profile = mapPatientProfileRow(profileRow);
      const queueSelect = `
        id,
        queue_date,
        queue_type,
        status,
        procedure,
        follow_up,
        follow_up_date,
        notes,
        client_phone,
        checked_in_at,
        with_doctor_at,
        completed_at,
        no_show_at,
        cancelled_at,
        created_at,
        updated_at,
        appointment_id,
        optician:opticians(name)
      `;

      const linkedQueuePromise = supabase
        .from("queue_patients")
        .select(queueSelect)
        .eq("patient_profile_id", profile.id)
        .order("queue_date", { ascending: false })
        .order("created_at", { ascending: false });

      const legacyQueuePromise = profile.phone
        ? supabase
            .from("queue_patients")
            .select(queueSelect)
            .is("patient_profile_id", null)
            .eq("client_phone", profile.phone)
            .order("queue_date", { ascending: false })
            .order("created_at", { ascending: false })
        : Promise.resolve({ data: [], error: null });

      const appointmentsPromise = supabase
        .from("appointments")
        .select(APPOINTMENT_SELECT)
        .eq("normalized_client_phone", profile.normalizedPhone)
        .order("appointment_at", { ascending: true });

      const [linkedQueueResult, legacyQueueResult, appointmentsResult] = await Promise.all([
        linkedQueuePromise,
        legacyQueuePromise,
        appointmentsPromise,
      ]);

      if (linkedQueueResult.error) throw linkedQueueResult.error;
      if (legacyQueueResult.error) throw legacyQueueResult.error;
      if (appointmentsResult.error) throw appointmentsResult.error;

      const queueHistory = mergeQueueHistory(
        (linkedQueueResult.data ?? []) as QueueHistoryRow[],
        (legacyQueueResult.data ?? []) as QueueHistoryRow[],
      );

      const appointmentRows = ((appointmentsResult.data ?? []) as AppointmentRow[]).map(
        mapAppointmentRow,
      );
      const nowMs = Date.now();
      const upcomingAppointments = appointmentRows
        .filter((row) => new Date(row.appointmentAt).getTime() >= nowMs)
        .sort((a, b) => new Date(a.appointmentAt).getTime() - new Date(b.appointmentAt).getTime());
      const pastAppointments = appointmentRows
        .filter((row) => new Date(row.appointmentAt).getTime() < nowMs)
        .sort((a, b) => new Date(b.appointmentAt).getTime() - new Date(a.appointmentAt).getTime());
      const activities = buildActivityCollections(
        queueHistory,
        upcomingAppointments,
        pastAppointments,
      );

      if (cancelled) return;

      setDetail({
        profile,
        queueHistory,
        upcomingAppointments,
        pastAppointments,
        ...activities,
      });
      setLastRefreshedAt(new Date());
      hasLoadedRef.current = true;
    };

    load()
      .catch((err) => {
        if (cancelled) return;
        setDetail(null);
        setError(err instanceof Error ? err.message : "Failed to load patient profile.");
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
        setIsRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isSessionReady, profileId, reloadToken]);

  const refresh = useCallback(() => {
    setReloadToken((value) => value + 1);
  }, []);

  const queueVisitCount = useMemo(() => detail?.queueHistory.length ?? 0, [detail]);
  const appointmentCount = useMemo(
    () => (detail?.upcomingAppointments.length ?? 0) + (detail?.pastAppointments.length ?? 0),
    [detail],
  );

  return {
    isSessionReady,
    detail,
    isLoading,
    isRefreshing,
    error,
    lastRefreshedAt,
    refresh,
    queueVisitCount,
    appointmentCount,
  };
};
