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
    const reservationId = String(body.reservationId ?? "").trim();
    const status = String(body.status ?? "").trim() as ReservationStatus;

    if (!reservationId) {
      return new Response(JSON.stringify({ error: "reservationId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!allowedStatuses.has(status)) {
      return new Response(JSON.stringify({ error: "invalid_status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: skippedCount, error: rpcError } = await adminClient.rpc(
      "update_reservation_status_atomic",
      {
        _reservation_id: reservationId,
        _status: status,
      },
    );
    if (rpcError) {
      throw rpcError;
    }
    const remindersAutoSkipped =
      typeof skippedCount === "number"
        ? skippedCount
        : Number(skippedCount ?? 0) || 0;

    const { data: appointment, error: fetchError } = await adminClient
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
      `)
      .eq("id", reservationId)
      .single();

    if (fetchError || !appointment) {
      throw fetchError ?? new Error("reservation_not_found");
    }

    return new Response(
      JSON.stringify({
        reservation: toReservationDto(appointment as AppointmentRow),
        remindersAutoSkipped,
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
