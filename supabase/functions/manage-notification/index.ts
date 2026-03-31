import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type ReminderType = "r24h" | "r4h";
type ReminderStatus = "pending" | "processing" | "sent" | "failed" | "skipped";
type DeliveryStatus = "unknown" | "sent" | "failed" | "skipped";
type SupportedLanguage = "en" | "fr" | "ar" | "zgh";
type Action = "skip_reminder" | "resend_reminder" | "resend_confirmation";

const allowedActions = new Set<Action>(["skip_reminder", "resend_reminder", "resend_confirmation"]);
const allowedReminderTypes = new Set<ReminderType>(["r24h", "r4h"]);
const terminalStatuses = new Set(["completed", "cancelled", "no_show"]);

const clinicTimeZone = "Africa/Casablanca";

const localeByLanguage: Record<SupportedLanguage, string> = {
  en: "en-GB",
  fr: "fr-FR",
  ar: "ar-MA",
  zgh: "fr-FR",
};

const CLINIC_MAPS_URL = "https://maps.app.goo.gl/Sx2ygnM6Ksh9Qwcy7";

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
  normalized_client_phone: string;
  whatsapp_chat_id: string;
  language: string;
  appointment_date: string;
  appointment_time: string;
  appointment_at: string;
  status: string;
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

const fetchFullReservation = async (adminClient: ReturnType<typeof createClient>, reservationId: string) => {
  const { data, error } = await adminClient
    .from("appointments")
    .select(`
      id, client_name, client_phone, normalized_client_phone, whatsapp_chat_id,
      language, appointment_date, appointment_time, appointment_at, status,
      confirmation_whatsapp_status, confirmation_whatsapp_attempts,
      confirmation_whatsapp_sent_at, confirmation_whatsapp_error,
      created_at, updated_at,
      appointment_reminders (
        id, reminder_type, status, attempts, scheduled_for, sent_at, last_error, updated_at
      )
    `)
    .eq("id", reservationId)
    .single();

  if (error || !data) throw error ?? new Error("reservation_not_found");
  return data as AppointmentRow;
};

const formatDate = (value: string, language: SupportedLanguage) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(localeByLanguage[language], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    timeZone: clinicTimeZone,
  });
};

const buildWhatsappConfirmation = (row: AppointmentRow) => {
  const lang = (row.language || "en") as SupportedLanguage;
  const dateLabel = formatDate(row.appointment_at, lang);
  const name = row.client_name;
  const time = row.appointment_time;

  if (lang === "fr") {
    return [
      `✅ Bonjour ${name} ! Votre rendez-vous est confirmé pour le ${dateLabel} à ${time}.`,
      "",
      "Si vous avez besoin de modifier ou annuler, répondez simplement à ce message.",
      "",
      `📍 Cabinet d'Ophtalmologie Dr. Sounny, Agadir`,
      CLINIC_MAPS_URL,
    ].join("\n");
  }

  if (lang === "ar") {
    return [
      `✅ مرحباً ${name}! تم تأكيد موعدك يوم ${dateLabel} على الساعة ${time}.`,
      "",
      "إذا رغبتم في التعديل أو الإلغاء، يمكنكم الرد على هذه الرسالة.",
      "",
      `📍 عيادة طب العيون د. الصوني، أكادير`,
      CLINIC_MAPS_URL,
    ].join("\n");
  }

  if (lang === "zgh") {
    return [
      `✅ ⴰⵣⵓⵍ ${name}! ⵉⵜⵜⵓⵙⵙⵏⵜⵎ ⵓⵎⵓⵄⴷ ⵏⵏⴽ ⴰⵙⵙ ⵏ ${dateLabel} ⴳ ${time}.`,
      "",
      "ⵎⴰ ⵜⵔⵉⴷ ⴰⴷ ⵜⵙⵏⴼⵍⴷ ⵏⵖ ⴰⴷ ⵜⵙⵔⴳⵍⴷ, ⵔⴰⵔ ⵉ ⵜⵉⵣⵉ ⴰⴷ.",
      "",
      `📍 ⴰⵅⵅⴰⵎ ⵏ ⵓⵎⵙⵙⵓⴼⵖ Dr. Sounny, ⴰⴳⴰⴷⵉⵔ`,
      CLINIC_MAPS_URL,
    ].join("\n");
  }

  return [
    `✅ Hi ${name}! Your appointment is confirmed for ${dateLabel} at ${time}.`,
    "",
    "If you need to reschedule or cancel, simply reply to this message.",
    "",
    `📍 Dr. Sounny Ophthalmology Clinic, Agadir`,
    CLINIC_MAPS_URL,
  ].join("\n");
};

const isTransientWhatsappStatus = (status: number) => status === 429 || status >= 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sendWhatsappViaGreenApi = async (
  chatId: string,
  message: string,
): Promise<{ ok: boolean; attempts: number; error?: string; details?: unknown; skipped?: boolean }> => {
  const apiUrl = Deno.env.get("GREEN_API_API_URL");
  const idInstance = Deno.env.get("GREEN_API_ID_INSTANCE");
  const apiTokenInstance = Deno.env.get("GREEN_API_API_TOKEN_INSTANCE");

  if (!apiUrl || !idInstance || !apiTokenInstance) {
    return { ok: false, skipped: true, attempts: 0, error: "missing_green_api_secrets" };
  }

  const endpoint = `${apiUrl.replace(/\/+$/, "")}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatId, message }),
      });

      const parsedBody = await response.json().catch(() => null);
      if (response.ok) {
        return { ok: true, attempts: attempt, details: { idMessage: parsedBody?.idMessage ?? null } };
      }

      if (attempt < maxAttempts && isTransientWhatsappStatus(response.status)) {
        await sleep(450);
        continue;
      }

      return { ok: false, attempts: attempt, error: `green_api_upstream_${response.status}`, details: parsedBody };
    } catch (error) {
      if (attempt < maxAttempts) {
        await sleep(450);
        continue;
      }
      return { ok: false, attempts: attempt, error: "green_api_network_error", details: error instanceof Error ? error.message : "unknown_error" };
    }
  }

  return { ok: false, attempts: maxAttempts, error: "green_api_unknown_failure" };
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
    // Auth: same pattern as update-reservation-status
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims?.sub) throw new Error("Unauthorized");

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: roleCheck, error: roleError } = await adminClient.rpc("has_role", {
      _user_id: claimsData.claims.sub,
      _role: "admin",
    });
    if (roleError || !roleCheck) throw new Error("Forbidden: admin only");

    // Parse body
    const body = await req.json().catch(() => ({}));
    const action = String(body.action ?? "").trim() as Action;
    const reservationId = String(body.reservationId ?? "").trim();
    const reminderType = String(body.reminderType ?? "").trim() as ReminderType;

    if (!reservationId) {
      return new Response(JSON.stringify({ error: "reservationId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!allowedActions.has(action)) {
      return new Response(JSON.stringify({ error: "invalid_action", allowed: [...allowedActions] }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nowIso = new Date().toISOString();

    // ─── skip_reminder ─────────────────────────────────────────
    if (action === "skip_reminder") {
      if (!allowedReminderTypes.has(reminderType)) {
        return new Response(JSON.stringify({ error: "invalid_reminder_type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: updated, error: updateError } = await adminClient
        .from("appointment_reminders")
        .update({
          status: "skipped",
          last_error: "skipped_by_admin",
          updated_at: nowIso,
        })
        .eq("appointment_id", reservationId)
        .eq("reminder_type", reminderType)
        .in("status", ["pending", "processing"])
        .select("id");

      if (updateError) throw updateError;
      const skippedCount = updated?.length ?? 0;

      const reservation = await fetchFullReservation(adminClient, reservationId);

      return new Response(
        JSON.stringify({ reservation: toReservationDto(reservation), remindersSkipped: skippedCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ─── resend_reminder ───────────────────────────────────────
    if (action === "resend_reminder") {
      if (!allowedReminderTypes.has(reminderType)) {
        return new Response(JSON.stringify({ error: "invalid_reminder_type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Check appointment isn't in terminal state
      const { data: appt, error: apptError } = await adminClient
        .from("appointments")
        .select("status")
        .eq("id", reservationId)
        .single();
      if (apptError || !appt) throw apptError ?? new Error("reservation_not_found");
      if (terminalStatuses.has(appt.status)) {
        return new Response(
          JSON.stringify({ error: "cannot_resend_terminal_status", status: appt.status }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const { data: updated, error: updateError } = await adminClient
        .from("appointment_reminders")
        .update({
          status: "pending",
          attempts: 0,
          last_error: null,
          sent_message_id: null,
          sent_at: null,
          updated_at: nowIso,
        })
        .eq("appointment_id", reservationId)
        .eq("reminder_type", reminderType)
        .in("status", ["failed", "skipped"])
        .select("id");

      if (updateError) throw updateError;
      const resetCount = updated?.length ?? 0;

      const reservation = await fetchFullReservation(adminClient, reservationId);

      return new Response(
        JSON.stringify({ reservation: toReservationDto(reservation), remindersReset: resetCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ─── resend_confirmation ───────────────────────────────────
    if (action === "resend_confirmation") {
      const appointment = await fetchFullReservation(adminClient, reservationId);

      if (terminalStatuses.has(appointment.status) && appointment.status !== "completed") {
        return new Response(
          JSON.stringify({ error: "cannot_resend_terminal_status", status: appointment.status }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const message = buildWhatsappConfirmation(appointment);
      const sendResult = await sendWhatsappViaGreenApi(appointment.whatsapp_chat_id, message);

      const confirmationPayload: Record<string, unknown> = {
        confirmation_whatsapp_attempts: (appointment.confirmation_whatsapp_attempts ?? 0) + (sendResult.attempts ?? 0),
        updated_at: nowIso,
      };

      if (sendResult.ok) {
        confirmationPayload.confirmation_whatsapp_status = "sent";
        confirmationPayload.confirmation_whatsapp_sent_at = nowIso;
        confirmationPayload.confirmation_whatsapp_error = null;
      } else if (sendResult.skipped) {
        confirmationPayload.confirmation_whatsapp_status = "skipped";
        confirmationPayload.confirmation_whatsapp_error = sendResult.error ?? "skipped";
      } else {
        confirmationPayload.confirmation_whatsapp_status = "failed";
        const rawDetails = sendResult.details == null ? "" : typeof sendResult.details === "string" ? sendResult.details : JSON.stringify(sendResult.details);
        const details = rawDetails.length > 260 ? `${rawDetails.slice(0, 260)}...` : rawDetails;
        confirmationPayload.confirmation_whatsapp_error = details ? `${sendResult.error}: ${details}` : (sendResult.error ?? "unknown");
      }

      const { error: persistError } = await adminClient
        .from("appointments")
        .update(confirmationPayload)
        .eq("id", reservationId);

      if (persistError) {
        console.error("Failed to persist confirmation status:", persistError);
      }

      const updatedReservation = await fetchFullReservation(adminClient, reservationId);

      return new Response(
        JSON.stringify({
          reservation: toReservationDto(updatedReservation),
          confirmationSent: sendResult.ok,
          confirmationError: sendResult.ok ? null : (sendResult.error ?? "unknown"),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ error: "unhandled_action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: message === "Unauthorized" || message.includes("Forbidden") ? 403 : 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
