import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ReservationStatus = "new" | "confirmed" | "completed" | "cancelled" | "no_show";
type ReminderType = "r24h" | "r4h";
type ReminderStatus = "pending" | "processing" | "sent" | "failed" | "skipped";
type DeliveryStatus = "unknown" | "sent" | "failed" | "skipped";

type Bucket = "upcoming" | "past";

const allowedStatuses = new Set<ReservationStatus>([
  "new",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]);

interface ReminderRow {
  id: string;
  reminder_type: ReminderType;
  status: ReminderStatus;
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
  confirmation_whatsapp_status: DeliveryStatus;
  confirmation_whatsapp_attempts: number;
  confirmation_whatsapp_sent_at: string | null;
  confirmation_whatsapp_error: string | null;
  created_at: string;
  updated_at: string;
  appointment_reminders: ReminderRow[] | null;
}

interface ReservationFilters {
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

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

const normalizeReminderMap = (reminders: ReminderRow[] | null) => {
  const defaultReminder = {
    status: "pending" as ReminderStatus,
    attempts: 0,
    scheduledFor: null as string | null,
    sentAt: null as string | null,
    lastError: null as string | null,
    updatedAt: null as string | null,
  };

  const map: Record<ReminderType, typeof defaultReminder> = {
    r24h: { ...defaultReminder },
    r4h: { ...defaultReminder },
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

const toReservationDto = (row: AppointmentRow) => ({
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

const applyReservationFilters = (query: any, filters: ReservationFilters) => {
  let next = query;

  if (filters.search) {
    next = next.or(`client_name.ilike.%${filters.search}%,client_phone.ilike.%${filters.search}%`);
  }

  if (filters.status !== "all" && allowedStatuses.has(filters.status as ReservationStatus)) {
    next = next.eq("status", filters.status);
  }

  if (filters.dateFrom) {
    next = next.gte("appointment_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    next = next.lte("appointment_date", filters.dateTo);
  }

  return next;
};

const applyBucketFilterAndSort = (query: any, bucket: Bucket, nowIso: string) => {
  if (bucket === "upcoming") {
    return query
      .gte("appointment_at", nowIso)
      .order("appointment_at", { ascending: true })
      .order("id", { ascending: true });
  }

  return query
    .lt("appointment_at", nowIso)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });
};

const fetchBucketCount = async (
  adminClient: ReturnType<typeof createClient>,
  filters: ReservationFilters,
  bucket: Bucket,
  nowIso: string,
): Promise<number> => {
  let query = adminClient.from("appointments").select("id", { count: "exact", head: true });
  query = applyReservationFilters(query, filters);
  query =
    bucket === "upcoming"
      ? query.gte("appointment_at", nowIso)
      : query.lt("appointment_at", nowIso);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
};

const fetchBucketRows = async (
  adminClient: ReturnType<typeof createClient>,
  filters: ReservationFilters,
  bucket: Bucket,
  nowIso: string,
  start: number,
  end: number,
): Promise<AppointmentRow[]> => {
  if (end < start) return [];

  let query = adminClient.from("appointments").select(APPOINTMENT_SELECT);
  query = applyReservationFilters(query, filters);
  query = applyBucketFilterAndSort(query, bucket, nowIso);

  const { data, error } = await query.range(start, end);
  if (error) throw error;

  return (data ?? []) as AppointmentRow[];
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Unauthorized");
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) {
      throw new Error("Unauthorized");
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: roleCheck, error: roleError } = await adminClient.rpc("has_role", {
      _user_id: claimsData.claims.sub,
      _role: "admin",
    });
    if (roleError || !roleCheck) {
      throw new Error("Forbidden: admin only");
    }

    const body = await req.json().catch(() => ({}));
    const page = Math.max(0, Number(body.page ?? 0) || 0);
    const pageSize = Math.min(100, Math.max(1, Number(body.pageSize ?? 20) || 20));

    const filters: ReservationFilters = {
      search: String(body.search ?? "").trim(),
      status: String(body.status ?? "all").trim(),
      dateFrom: String(body.dateFrom ?? "").trim(),
      dateTo: String(body.dateTo ?? "").trim(),
    };

    const nowIso = new Date().toISOString();

    const [upcomingTotal, pastTotal] = await Promise.all([
      fetchBucketCount(adminClient, filters, "upcoming", nowIso),
      fetchBucketCount(adminClient, filters, "past", nowIso),
    ]);

    const total = upcomingTotal + pastTotal;
    const pageStart = page * pageSize;
    const pageEndExclusive = pageStart + pageSize;

    let upcomingRows: AppointmentRow[] = [];
    if (pageStart < upcomingTotal) {
      const upcomingStart = pageStart;
      const upcomingEnd = Math.min(upcomingTotal, pageEndExclusive) - 1;
      upcomingRows = await fetchBucketRows(
        adminClient,
        filters,
        "upcoming",
        nowIso,
        upcomingStart,
        upcomingEnd,
      );
    }

    const remainingSlots = pageSize - upcomingRows.length;

    let pastRows: AppointmentRow[] = [];
    if (remainingSlots > 0 && pageEndExclusive > upcomingTotal) {
      const pastStart = Math.max(0, pageStart - upcomingTotal);
      const pastEnd = pastStart + remainingSlots - 1;
      pastRows = await fetchBucketRows(
        adminClient,
        filters,
        "past",
        nowIso,
        pastStart,
        pastEnd,
      );
    }

    const pageRows = [...upcomingRows, ...pastRows];

    return new Response(
      JSON.stringify({
        reservations: pageRows.map(toReservationDto),
        pagination: {
          page,
          pageSize,
          total,
          pageCount: Math.max(1, Math.ceil(total / pageSize)),
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: message === "Unauthorized" || message.includes("Forbidden") ? 403 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
