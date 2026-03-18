import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

type SupportedLanguage = "en" | "fr" | "ar" | "zgh";
type ReminderType = "r24h" | "r3h" | "r30m";

interface ClaimedReminderRow {
  reminder_id: string;
  appointment_id: string;
  reminder_type: ReminderType;
  scheduled_for: string;
  attempts: number;
  language: SupportedLanguage;
  client_name: string;
  whatsapp_chat_id: string;
  appointment_at: string;
  appointment_time: string;
}

interface WhatsappSendResult {
  ok: boolean;
  attempts: number;
  error?: string;
  details?: unknown;
  skipped?: boolean;
}

const clinicTimeZone = "Africa/Casablanca";
const DISPATCH_BATCH_SIZE = 25;
const retryDelayMs = 450;

const localeByLanguage: Record<SupportedLanguage, string> = {
  en: "en-GB",
  fr: "fr-FR",
  ar: "ar-MA",
  zgh: "fr-FR",
};

const responseHeaders = {
  "Content-Type": "application/json",
};

const isTransientWhatsappStatus = (status: number) => status === 429 || status >= 500;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const formatAppointmentDate = (value: string, language: SupportedLanguage) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString(localeByLanguage[language], {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
    timeZone: clinicTimeZone,
  });
};

const buildReminderIntro = (type: ReminderType, language: SupportedLanguage) => {
  if (language === "fr") {
    if (type === "r24h") return "⏰ Rappel: votre rendez-vous est dans 24 heures.";
    if (type === "r3h") return "⏰ Rappel: votre rendez-vous est dans 3 heures.";
    return "⏰ Rappel: votre rendez-vous est dans 30 minutes.";
  }

  if (language === "ar") {
    if (type === "r24h") return "⏰ تذكير: موعدك بعد 24 ساعة.";
    if (type === "r3h") return "⏰ تذكير: موعدك بعد 3 ساعات.";
    return "⏰ تذكير: موعدك بعد 30 دقيقة.";
  }

  if (language === "zgh") {
    if (type === "r24h") return "⏰ ⴰⵙⵎⵎⵍ: ⵓⵎⵓⵄⴷ ⵏⵏⴽ ⵢⵓⵙⵙ 24 ⵜⴰⵙⵔⴰⵖⵜ.";
    if (type === "r3h") return "⏰ ⴰⵙⵎⵎⵍ: ⵓⵎⵓⵄⴷ ⵏⵏⴽ ⵢⵓⵙⵙ 3 ⵜⴰⵙⵔⴰⵖⵜ.";
    return "⏰ ⴰⵙⵎⵎⵍ: ⵓⵎⵓⵄⴷ ⵏⵏⴽ ⵢⵓⵙⵙ 30 ⵜⵓⵙⴷⵉⴷⵜ.";
  }

  if (type === "r24h") return "⏰ Reminder: your appointment is in 24 hours.";
  if (type === "r3h") return "⏰ Reminder: your appointment is in 3 hours.";
  return "⏰ Reminder: your appointment is in 30 minutes.";
};

const buildReminderMessage = (row: ClaimedReminderRow) => {
  const dateLabel = formatAppointmentDate(row.appointment_at, row.language);
  const intro = buildReminderIntro(row.reminder_type, row.language);

  if (row.language === "fr") {
    return [
      intro,
      `👤 Nom: ${row.client_name}`,
      `🗓 Date: ${dateLabel}`,
      `⏰ Heure: ${row.appointment_time}`,
      "",
      "Si vous souhaitez modifier votre rendez-vous, répondez à ce message.",
    ].join("\n");
  }

  if (row.language === "ar") {
    return [
      intro,
      `👤 الاسم: ${row.client_name}`,
      `🗓 التاريخ: ${dateLabel}`,
      `⏰ الوقت: ${row.appointment_time}`,
      "",
      "إذا رغبت في تعديل الموعد، يمكنك الرد على هذه الرسالة.",
    ].join("\n");
  }

  if (row.language === "zgh") {
    return [
      intro,
      `👤 ⵉⵙⵎ: ${row.client_name}`,
      `🗓 ⴰⵣⵎⵣ: ${dateLabel}`,
      `⏰ ⴰⴽⵓⴷ: ${row.appointment_time}`,
      "",
      "ⵎⴰ ⵜⵔⵉⴷ ⴰⴷ ⵜⵙⵏⴼⵍⴷ ⵓⵎⵓⵄⴷ, ⵔⴰⵔ ⵉ ⵜⵉⵣⵉ.",
    ].join("\n");
  }

  return [
    intro,
    `👤 Name: ${row.client_name}`,
    `🗓 Date: ${dateLabel}`,
    `⏰ Time: ${row.appointment_time}`,
    "",
    "If you need to reschedule, just reply to this message.",
  ].join("\n");
};

const sendWhatsappViaGreenApi = async (
  chatId: string,
  message: string,
  apiUrl: string | undefined,
  idInstance: string | undefined,
  apiTokenInstance: string | undefined,
): Promise<WhatsappSendResult> => {
  if (!apiUrl || !idInstance || !apiTokenInstance) {
    return {
      ok: false,
      skipped: true,
      attempts: 0,
      error: "missing_green_api_secrets",
    };
  }

  const endpoint = `${apiUrl.replace(/\/+$/, "")}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          message,
        }),
      });

      const parsedBody = await response.json().catch(() => null);
      if (response.ok) {
        return {
          ok: true,
          attempts: attempt,
          details: { idMessage: parsedBody?.idMessage ?? null },
        };
      }

      if (attempt < maxAttempts && isTransientWhatsappStatus(response.status)) {
        await sleep(retryDelayMs);
        continue;
      }

      return {
        ok: false,
        attempts: attempt,
        error: `green_api_upstream_${response.status}`,
        details: parsedBody,
      };
    } catch (error) {
      if (attempt < maxAttempts) {
        await sleep(retryDelayMs);
        continue;
      }

      return {
        ok: false,
        attempts: attempt,
        error: "green_api_network_error",
        details: error instanceof Error ? error.message : "unknown_error",
      };
    }
  }

  return {
    ok: false,
    attempts: maxAttempts,
    error: "green_api_unknown_failure",
  };
};

const getReminderErrorText = (result: WhatsappSendResult) => {
  const rawDetails = result.details == null
    ? ""
    : typeof result.details === "string"
    ? result.details
    : JSON.stringify(result.details);

  const details = rawDetails.length > 260 ? `${rawDetails.slice(0, 260)}...` : rawDetails;
  const base = result.error ?? "unknown_dispatch_error";

  return details ? `${base}: ${details}` : base;
};

const createServiceClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: responseHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ success: false, error: "method_not_allowed" }), {
      status: 405,
      headers: responseHeaders,
    });
  }

  const expectedDispatchSecret = Deno.env.get("REMINDER_DISPATCH_SECRET");
  const providedDispatchSecret = req.headers.get("x-reminder-dispatch-secret");

  if (!expectedDispatchSecret || !providedDispatchSecret || providedDispatchSecret !== expectedDispatchSecret) {
    return new Response(JSON.stringify({ success: false, error: "unauthorized_dispatch" }), {
      status: 401,
      headers: responseHeaders,
    });
  }

  const serviceClient = createServiceClient();
  if (!serviceClient) {
    return new Response(JSON.stringify({ success: false, error: "missing_supabase_service_role_secrets" }), {
      status: 500,
      headers: responseHeaders,
    });
  }

  try {
    const { data, error } = await serviceClient.rpc("claim_due_appointment_reminders", {
      batch_size: DISPATCH_BATCH_SIZE,
    });

    if (error) {
      console.error("Failed to claim reminders:", error);
      return new Response(JSON.stringify({ success: false, error: "claim_due_failed", details: error.message }), {
        status: 500,
        headers: responseHeaders,
      });
    }

    const claimedRows = (data ?? []) as ClaimedReminderRow[];
    if (claimedRows.length === 0) {
      return new Response(JSON.stringify({ success: true, processed: 0, sent: 0, failed: 0, skipped: 0 }), {
        headers: responseHeaders,
      });
    }

    let sentCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    for (const row of claimedRows) {
      const reminderMessage = buildReminderMessage(row);
      const sendResult = await sendWhatsappViaGreenApi(
        row.whatsapp_chat_id,
        reminderMessage,
        Deno.env.get("GREEN_API_API_URL"),
        Deno.env.get("GREEN_API_ID_INSTANCE"),
        Deno.env.get("GREEN_API_API_TOKEN_INSTANCE"),
      );

      const nowIso = new Date().toISOString();
      const attempts = row.attempts + (sendResult.attempts ?? 0);

      if (sendResult.ok) {
        sentCount += 1;
        const { error: updateError } = await serviceClient
          .from("appointment_reminders")
          .update({
            status: "sent",
            attempts,
            sent_at: nowIso,
            last_error: null,
            updated_at: nowIso,
          })
          .eq("id", row.reminder_id);

        if (updateError) {
          console.error("Failed to mark reminder as sent:", updateError);
          failedCount += 1;
        }
        continue;
      }

      if (sendResult.skipped) {
        skippedCount += 1;
        const { error: updateError } = await serviceClient
          .from("appointment_reminders")
          .update({
            status: "skipped",
            attempts,
            last_error: getReminderErrorText(sendResult),
            updated_at: nowIso,
          })
          .eq("id", row.reminder_id);

        if (updateError) {
          console.error("Failed to mark reminder as skipped:", updateError);
          failedCount += 1;
        }
        continue;
      }

      failedCount += 1;
      const { error: updateError } = await serviceClient
        .from("appointment_reminders")
        .update({
          status: "failed",
          attempts,
          last_error: getReminderErrorText(sendResult),
          updated_at: nowIso,
        })
        .eq("id", row.reminder_id);

      if (updateError) {
        console.error("Failed to mark reminder as failed:", updateError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: claimedRows.length,
        sent: sentCount,
        failed: failedCount,
        skipped: skippedCount,
      }),
      {
        headers: responseHeaders,
      },
    );
  } catch (error) {
    console.error("dispatch-appointment-reminders error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "internal_error",
        details: error instanceof Error ? error.message : "unknown_error",
      }),
      {
        status: 500,
        headers: responseHeaders,
      },
    );
  }
});
