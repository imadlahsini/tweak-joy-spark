import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type SupportedLanguage = "en" | "fr" | "ar" | "zgh";

interface AppointmentPayload {
  clientName: string;
  clientPhone: string;
  selectedDate: string;
  selectedTime: string;
  language: SupportedLanguage;
  submittedAt: string;
}

const supportedLanguages: SupportedLanguage[] = ["en", "fr", "ar", "zgh"];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const normalizeLanguage = (value: unknown): SupportedLanguage =>
  typeof value === "string" && supportedLanguages.includes(value as SupportedLanguage)
    ? (value as SupportedLanguage)
    : "en";

const parseIso = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value: string) => {
  const parsed = parseIso(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString("fr-MA", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatDateTime = (value: string) => {
  const parsed = parseIso(value);
  if (!parsed) return value;
  return parsed.toLocaleString("fr-MA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const validatePayload = (payload: Record<string, unknown>): AppointmentPayload | null => {
  const candidate = {
    clientName: payload.clientName,
    clientPhone: payload.clientPhone,
    selectedDate: payload.selectedDate,
    selectedTime: payload.selectedTime,
    submittedAt: payload.submittedAt,
  };

  if (
    !isNonEmptyString(candidate.clientName) ||
    !isNonEmptyString(candidate.clientPhone) ||
    !isNonEmptyString(candidate.selectedDate) ||
    !isNonEmptyString(candidate.selectedTime) ||
    !isNonEmptyString(candidate.submittedAt)
  ) {
    return null;
  }

  if (!parseIso(candidate.selectedDate) || !parseIso(candidate.submittedAt)) {
    return null;
  }

  return {
    clientName: candidate.clientName.trim(),
    clientPhone: candidate.clientPhone.trim(),
    selectedDate: candidate.selectedDate,
    selectedTime: candidate.selectedTime.trim(),
    language: normalizeLanguage(payload.language),
    submittedAt: candidate.submittedAt,
  };
};

const buildTelegramMessage = (payload: AppointmentPayload) =>
  [
    "📅 New Appointment Booking",
    "",
    `👤 Name: ${payload.clientName}`,
    `📞 Phone: ${payload.clientPhone}`,
    `🗓 Date: ${formatDate(payload.selectedDate)}`,
    `⏰ Time: ${payload.selectedTime}`,
    `🌐 Language: ${payload.language.toUpperCase()}`,
    `🕒 Submitted: ${formatDateTime(payload.submittedAt)}`,
  ].join("\n");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!botToken || !chatId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "missing_telegram_secrets",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_payload" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payload = validatePayload(body as Record<string, unknown>);
    if (!payload) {
      return new Response(
        JSON.stringify({ success: false, error: "invalid_payload_fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: buildTelegramMessage(payload),
      }),
    });

    const telegramBody = await response.json().catch(() => null);

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "telegram_upstream_error",
          details: telegramBody,
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        messageId: telegramBody?.result?.message_id ?? null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("notify-appointment-telegram error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "internal_error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
