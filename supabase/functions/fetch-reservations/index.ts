import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ReservationStatus = "new" | "confirmed" | "completed" | "cancelled" | "no_show";
type ReminderType = "r24h" | "r3h" | "r30m";
type ReminderStatus = "pending" | "processing" | "sent" | "failed" | "skipped";
type DeliveryStatus = "unknown" | "sent" | "failed" | "skipped";

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
    r3h: { ...defaultReminder },
    r30m: { ...defaultReminder },
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

const isUpcoming = (appointmentAt: string) => new Date(appointmentAt).getTime() >= Date.now();

const sortReservations = (rows: AppointmentRow[]) => {
  return [...rows].sort((a, b) => {
    const aUpcoming = isUpcoming(a.appointment_at);
    const bUpcoming = isUpcoming(b.appointment_at);

    if (aUpcoming !== bUpcoming) {
      return aUpcoming ? -1 : 1;
    }

    if (aUpcoming && bUpcoming) {
      return new Date(a.appointment_at).getTime() - new Date(b.appointment_at).getTime();
    }

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
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
    const search = String(body.search ?? "").trim();
    const status = String(body.status ?? "all").trim();
    const dateFrom = String(body.dateFrom ?? "").trim();
    const dateTo = String(body.dateTo ?? "").trim();

    let query = adminClient
      .from("appointments")
      .select(`
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
      `);

    if (search) {
      query = query.or(`client_name.ilike.%${search}%,client_phone.ilike.%${search}%`);
    }

    if (status !== "all" && allowedStatuses.has(status as ReservationStatus)) {
      query = query.eq("status", status);
    }

    if (dateFrom) {
      query = query.gte("appointment_date", dateFrom);
    }

    if (dateTo) {
      query = query.lte("appointment_date", dateTo);
    }

    const { data, error } = await query.limit(1000);
    if (error) {
      throw error;
    }

    const sortedRows = sortReservations((data ?? []) as AppointmentRow[]);
    const total = sortedRows.length;
    const start = page * pageSize;
    const end = start + pageSize;
    const pagedRows = sortedRows.slice(start, end);

    return new Response(
      JSON.stringify({
        reservations: pagedRows.map(toReservationDto),
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
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: message === "Unauthorized" || message.includes("Forbidden") ? 403 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
