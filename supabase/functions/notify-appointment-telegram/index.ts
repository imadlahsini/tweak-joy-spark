import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const baseCorsHeaders = {
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type SupportedLanguage = "en" | "fr" | "ar" | "zgh";
type ReminderType = "r24h" | "r4h";
type ConfirmationDeliveryStatus = "unknown" | "sent" | "failed" | "skipped";

interface AppointmentPayload {
  clientName: string;
  clientPhone: string;
  normalizedClientPhone: string;
  whatsappChatId: string;
  selectedDate: string;
  selectedTime: string;
  language: SupportedLanguage;
  submittedAt: string;
}

interface ChannelResult {
  ok: boolean;
  error?: string;
  details?: unknown;
  attempts?: number;
  skipped?: boolean;
}

interface ReminderSkipItem {
  type: ReminderType;
  reason: "scheduled_in_past" | "scheduled_after_appointment";
}

interface ReminderQueueResult {
  queued: number;
  skipped: ReminderSkipItem[];
  errors: string[];
  appointmentId?: string;
  duplicate?: boolean;
}

interface BookingPersistenceMeta {
  bookingPersisted: boolean;
  appointmentId: string | null;
  bookingError?: string;
}

interface TimeParts {
  hour: number;
  minute: number;
}

interface DateParts {
  year: number;
  month: number;
  day: number;
}

interface ZonedParts extends DateParts {
  hour: number;
  minute: number;
  second: number;
}

const BOOKING_REQUEST_COOLDOWN_MS = 15_000;
const requestCooldownBySource = new Map<string, number>();
const supportedLanguages: SupportedLanguage[] = ["en", "fr", "ar", "zgh"];
const clinicTimeZone = "Africa/Casablanca";
const QUIET_HOUR_START = 8;
const QUIET_HOUR_END = 21;

const reminderDefinitions: Array<{ type: ReminderType; offsetMs: number }> = [
  { type: "r24h", offsetMs: 24 * 60 * 60 * 1000 },
  { type: "r4h", offsetMs: 4 * 60 * 60 * 1000 },
];

const localeByLanguage: Record<SupportedLanguage, string> = {
  en: "en-GB",
  fr: "fr-FR",
  ar: "ar-MA",
  zgh: "fr-FR",
};

const confirmationErrorMaxLength = 500;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const normalizeLanguage = (value: unknown): SupportedLanguage =>
  typeof value === "string" && supportedLanguages.includes(value as SupportedLanguage)
    ? (value as SupportedLanguage)
    : "en";

const parseAllowedOrigins = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

const getCorsHeaders = (origin: string | null, allowedOrigins: string[]) => {
  const allowOrigin =
    allowedOrigins.length === 0
      ? origin ?? "*"
      : origin && allowedOrigins.includes(origin)
      ? origin
      : "null";

  return {
    ...baseCorsHeaders,
    "Access-Control-Allow-Origin": allowOrigin,
    Vary: "Origin",
  };
};

const isOriginAllowed = (origin: string | null, allowedOrigins: string[]) => {
  if (allowedOrigins.length === 0) return true;
  return Boolean(origin && allowedOrigins.includes(origin));
};

const getRequesterIp = (req: Request) => {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp) return cfIp;

  return "unknown";
};

const cleanupCooldownMap = (now: number) => {
  if (requestCooldownBySource.size <= 500) return;

  for (const [key, timestamp] of requestCooldownBySource.entries()) {
    if (now - timestamp > BOOKING_REQUEST_COOLDOWN_MS) {
      requestCooldownBySource.delete(key);
    }
  }
};

const isCooldownActive = (key: string, now: number) => {
  const lastSeen = requestCooldownBySource.get(key);
  if (!lastSeen) return false;
  return now - lastSeen < BOOKING_REQUEST_COOLDOWN_MS;
};

const markCooldown = (key: string, now: number) => {
  requestCooldownBySource.set(key, now);
  cleanupCooldownMap(now);
};

const parseIso = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const parseTimeParts = (value: string): TimeParts | null => {
  const match = value.trim().match(/^([01]\d|2[0-3]):([0-5]\d)$/);
  if (!match) return null;

  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
};

const getZonedParts = (date: Date, timeZone: string): ZonedParts => {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(byType.year),
    month: Number(byType.month),
    day: Number(byType.day),
    hour: Number(byType.hour),
    minute: Number(byType.minute),
    second: Number(byType.second),
  };
};

const getDatePartsInTimeZone = (value: string, timeZone: string): DateParts | null => {
  const parsed = parseIso(value);
  if (!parsed) return null;

  const parts = getZonedParts(parsed, timeZone);
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
  };
};

const getTimeZoneOffsetMs = (date: Date, timeZone: string) => {
  const parts = getZonedParts(date, timeZone);
  const asUtcMs = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
  return asUtcMs - date.getTime();
};

const zonedDateTimeToUtc = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
) => {
  const utcGuessMs = Date.UTC(year, month - 1, day, hour, minute, 0);

  const firstGuess = new Date(utcGuessMs);
  const firstOffset = getTimeZoneOffsetMs(firstGuess, timeZone);
  const firstResult = new Date(utcGuessMs - firstOffset);

  const secondOffset = getTimeZoneOffsetMs(firstResult, timeZone);
  if (secondOffset === firstOffset) {
    return firstResult;
  }

  return new Date(utcGuessMs - secondOffset);
};

const getNextDayInTimeZone = (parts: DateParts, timeZone: string): DateParts => {
  const noonUtc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12, 0, 0));
  const next = new Date(noonUtc.getTime() + 24 * 60 * 60 * 1000);
  const nextParts = getZonedParts(next, timeZone);

  return {
    year: nextParts.year,
    month: nextParts.month,
    day: nextParts.day,
  };
};

const applyQuietHours = (candidate: Date): Date => {
  const parts = getZonedParts(candidate, clinicTimeZone);

  if (parts.hour < QUIET_HOUR_START) {
    return zonedDateTimeToUtc(
      parts.year,
      parts.month,
      parts.day,
      QUIET_HOUR_START,
      0,
      clinicTimeZone,
    );
  }

  const isAfterQuietEnd =
    parts.hour > QUIET_HOUR_END ||
    (parts.hour === QUIET_HOUR_END && (parts.minute > 0 || parts.second > 0));

  if (isAfterQuietEnd) {
    const nextDay = getNextDayInTimeZone(parts, clinicTimeZone);
    return zonedDateTimeToUtc(
      nextDay.year,
      nextDay.month,
      nextDay.day,
      QUIET_HOUR_START,
      0,
      clinicTimeZone,
    );
  }

  return candidate;
};

const formatDate = (value: string, language: SupportedLanguage) => {
  const parsed = parseIso(value);
  if (!parsed) return value;
  return parsed.toLocaleDateString(localeByLanguage[language], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "2-digit",
    timeZone: clinicTimeZone,
  });
};

const formatDateTime = (value: string, language: SupportedLanguage) => {
  const parsed = parseIso(value);
  if (!parsed) return value;
  return parsed.toLocaleString(localeByLanguage[language], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: clinicTimeZone,
  });
};

const normalizeMoroccanPhone = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return null;

  let normalized = digitsOnly;

  if (normalized.startsWith("00212")) {
    normalized = normalized.slice(5);
  } else if (normalized.startsWith("212")) {
    normalized = normalized.slice(3);
  }

  if ((normalized.startsWith("6") || normalized.startsWith("7")) && normalized.length === 9) {
    normalized = `0${normalized}`;
  }

  if (!/^0[67]\d{8}$/.test(normalized)) {
    return null;
  }

  return normalized;
};

const buildWhatsappChatId = (normalizedMoroccanPhone: string) =>
  `212${normalizedMoroccanPhone.slice(1)}@c.us`;

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

  if (!parseTimeParts(candidate.selectedTime)) {
    return null;
  }

  const normalizedPhone = normalizeMoroccanPhone(candidate.clientPhone);
  if (!normalizedPhone) {
    return null;
  }

  return {
    clientName: candidate.clientName.trim(),
    clientPhone: candidate.clientPhone.trim(),
    normalizedClientPhone: normalizedPhone,
    whatsappChatId: buildWhatsappChatId(normalizedPhone),
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
    `🗓 Date: ${formatDate(payload.selectedDate, payload.language)}`,
    `⏰ Time: ${payload.selectedTime}`,
    `🌐 Language: ${payload.language.toUpperCase()}`,
    `🕒 Submitted: ${formatDateTime(payload.submittedAt, payload.language)}`,
  ].join("\n");

const CLINIC_MAPS_URL = "https://maps.app.goo.gl/Sx2ygnM6Ksh9Qwcy7";

const buildWhatsappMessage = (payload: AppointmentPayload) => {
  const dateLabel = formatDate(payload.selectedDate, payload.language);
  const name = payload.clientName;
  const time = payload.selectedTime;

  if (payload.language === "fr") {
    return [
      `✅ Bonjour ${name} ! Votre rendez-vous est confirmé pour le ${dateLabel} à ${time}.`,
      "",
      "Si vous avez besoin de modifier ou annuler, répondez simplement à ce message.",
      "",
      `📍 Cabinet d'Ophtalmologie Dr. Sounny, Agadir`,
      CLINIC_MAPS_URL,
    ].join("\n");
  }

  if (payload.language === "ar") {
    return [
      `✅ مرحباً ${name}! تم تأكيد موعدك يوم ${dateLabel} على الساعة ${time}.`,
      "",
      "إذا رغبتم في التعديل أو الإلغاء، يمكنكم الرد على هذه الرسالة.",
      "",
      `📍 عيادة طب العيون د. الصوني، أكادير`,
      CLINIC_MAPS_URL,
    ].join("\n");
  }

  if (payload.language === "zgh") {
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

const getAppointmentDateTime = (payload: AppointmentPayload) => {
  const dateParts = getDatePartsInTimeZone(payload.selectedDate, clinicTimeZone);
  const timeParts = parseTimeParts(payload.selectedTime);
  if (!dateParts || !timeParts) {
    return null;
  }

  const appointmentAt = zonedDateTimeToUtc(
    dateParts.year,
    dateParts.month,
    dateParts.day,
    timeParts.hour,
    timeParts.minute,
    clinicTimeZone,
  );

  const appointmentDate = `${dateParts.year}-${String(dateParts.month).padStart(2, "0")}-${String(
    dateParts.day,
  ).padStart(2, "0")}`;
  const appointmentTime = `${String(timeParts.hour).padStart(2, "0")}:${String(timeParts.minute).padStart(
    2,
    "0",
  )}`;

  return {
    appointmentDate,
    appointmentTime,
    appointmentAt,
  };
};

const planReminderSchedule = (appointmentAt: Date, now: Date) => {
  const queued: Array<{ type: ReminderType; scheduledFor: Date }> = [];
  const skipped: ReminderSkipItem[] = [];

  for (const definition of reminderDefinitions) {
    const baseScheduledFor = new Date(appointmentAt.getTime() - definition.offsetMs);
    const scheduledFor = applyQuietHours(baseScheduledFor);

    if (scheduledFor.getTime() <= now.getTime()) {
      skipped.push({ type: definition.type, reason: "scheduled_in_past" });
      continue;
    }

    if (scheduledFor.getTime() >= appointmentAt.getTime()) {
      skipped.push({ type: definition.type, reason: "scheduled_after_appointment" });
      continue;
    }

    queued.push({
      type: definition.type,
      scheduledFor,
    });
  }

  return { queued, skipped };
};

const createServiceClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

const persistAppointmentAndReminders = async (
  payload: AppointmentPayload,
): Promise<ReminderQueueResult> => {
  const result: ReminderQueueResult = {
    queued: 0,
    skipped: [],
    errors: [],
  };

  try {
    const serviceClient = createServiceClient();
    if (!serviceClient) {
      result.errors.push("missing_supabase_service_role_secrets");
      return result;
    }

    const appointmentDateTime = getAppointmentDateTime(payload);
    if (!appointmentDateTime) {
      result.errors.push("invalid_appointment_datetime");
      return result;
    }

    const now = new Date();
    const plannedReminders = planReminderSchedule(appointmentDateTime.appointmentAt, now);
    result.skipped = plannedReminders.skipped;

    const { data: appointmentRow, error: appointmentError } = await serviceClient
      .from("appointments")
      .upsert(
        {
          client_name: payload.clientName,
          client_phone: payload.clientPhone,
          normalized_client_phone: payload.normalizedClientPhone,
          whatsapp_chat_id: payload.whatsappChatId,
          language: payload.language,
          appointment_date: appointmentDateTime.appointmentDate,
          appointment_time: appointmentDateTime.appointmentTime,
          appointment_at: appointmentDateTime.appointmentAt.toISOString(),
        },
        {
          onConflict: "normalized_client_phone,appointment_date,appointment_time",
          ignoreDuplicates: true,
        },
      )
      .select("id")
      .maybeSingle();

    if (appointmentError) {
      result.errors.push(`appointment_insert_failed:${appointmentError.message}`);
      return result;
    }

    if (!appointmentRow?.id) {
      // Duplicate booking — same phone+date+time already exists
      result.duplicate = true;
      return result;
    }

    result.appointmentId = appointmentRow.id;

    let patientProfileId: string | null = null;

    if (payload.normalizedClientPhone) {
      const { data: profileRow, error: profileError } = await serviceClient
        .from("patient_profiles")
        .upsert(
          {
            name: payload.clientName,
            phone: payload.clientPhone,
            normalized_phone: payload.normalizedClientPhone,
          },
          {
            onConflict: "normalized_phone",
          },
        )
        .select("id")
        .single();

      if (profileError) {
        result.errors.push(`patient_profile_upsert_failed:${profileError.message}`);
      } else {
        patientProfileId = profileRow.id;
      }
    }

    // Auto-populate queue after appointment creation so appointment_id can link
    // rows and deduplicate queue creation across retries.
    const { data: maxPosRow, error: maxPosError } = await serviceClient
      .from("queue_patients")
      .select("position")
      .eq("queue_date", appointmentDateTime.appointmentDate)
      .eq("queue_type", "rdv")
      .eq("status", "waiting")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxPosError) {
      result.errors.push(`queue_position_lookup_failed:${maxPosError.message}`);
    } else {
      const nextPosition = (maxPosRow?.position ?? -1) + 1;

      const { error: queueError } = await serviceClient
        .from("queue_patients")
        .upsert(
          {
            queue_date: appointmentDateTime.appointmentDate,
            queue_type: "rdv",
            status: "waiting",
            client_name: payload.clientName,
            client_phone: payload.clientPhone || null,
            patient_profile_id: patientProfileId,
            notes: `Rendez-vous à ${appointmentDateTime.appointmentTime}`,
            position: nextPosition,
            appointment_id: appointmentRow.id,
          },
          {
            onConflict: "appointment_id",
            ignoreDuplicates: true,
          },
        );

      if (queueError) {
        result.errors.push(`queue_insert_failed:${queueError.message}`);
      }
    }

    if (plannedReminders.queued.length === 0) {
      return result;
    }

    const reminderRows = plannedReminders.queued.map((item) => ({
      appointment_id: appointmentRow.id,
      reminder_type: item.type,
      scheduled_for: item.scheduledFor.toISOString(),
      status: "pending",
      attempts: 0,
    }));

    const { error: remindersInsertError } = await serviceClient
      .from("appointment_reminders")
      .upsert(reminderRows, {
        onConflict: "appointment_id,reminder_type",
        ignoreDuplicates: true,
      });

    if (remindersInsertError) {
      result.errors.push(`reminders_insert_failed:${remindersInsertError.message}`);
      return result;
    }

    result.queued = reminderRows.length;
    return result;
  } catch (error) {
    result.errors.push(
      `reminder_queue_unexpected:${error instanceof Error ? error.message : "unknown_error"}`,
    );
    return result;
  }
};

const buildBookingPersistenceMeta = (
  reminderQueueResult: ReminderQueueResult,
): BookingPersistenceMeta => {
  const appointmentId = reminderQueueResult.appointmentId ?? null;
  const bookingPersisted = Boolean(appointmentId);

  if (bookingPersisted) {
    return {
      bookingPersisted,
      appointmentId,
    };
  }

  const preferredError =
    reminderQueueResult.errors.find((entry) => entry.startsWith("appointment_insert_failed:")) ??
    reminderQueueResult.errors.find((entry) => entry.startsWith("reminder_queue_unexpected:")) ??
    reminderQueueResult.errors.find((entry) => entry === "invalid_appointment_datetime") ??
    reminderQueueResult.errors.find((entry) => entry === "missing_supabase_service_role_secrets") ??
    reminderQueueResult.errors[0];

  return {
    bookingPersisted,
    appointmentId,
    bookingError: preferredError ?? "booking_not_persisted",
  };
};

const mapConfirmationStatus = (whatsappResult: ChannelResult): ConfirmationDeliveryStatus => {
  if (whatsappResult.ok) return "sent";
  if (whatsappResult.skipped) return "skipped";
  if (whatsappResult.error) return "failed";
  return "unknown";
};

const getConfirmationErrorText = (whatsappResult: ChannelResult) => {
  if (!whatsappResult.error) return null;

  const details = whatsappResult.details == null
    ? ""
    : typeof whatsappResult.details === "string"
    ? whatsappResult.details
    : JSON.stringify(whatsappResult.details);
  const composite = details ? `${whatsappResult.error}: ${details}` : whatsappResult.error;

  if (composite.length <= confirmationErrorMaxLength) return composite;
  return `${composite.slice(0, confirmationErrorMaxLength)}...`;
};

const persistWhatsappConfirmationStatus = async (
  appointmentId: string,
  whatsappResult: ChannelResult,
) => {
  const serviceClient = createServiceClient();
  if (!serviceClient) {
    return "missing_supabase_service_role_secrets";
  }

  const payload = {
    confirmation_whatsapp_status: mapConfirmationStatus(whatsappResult),
    confirmation_whatsapp_attempts: whatsappResult.attempts ?? 0,
    confirmation_whatsapp_sent_at: whatsappResult.ok ? new Date().toISOString() : null,
    confirmation_whatsapp_error: getConfirmationErrorText(whatsappResult),
    updated_at: new Date().toISOString(),
  };

  const { error } = await serviceClient
    .from("appointments")
    .update(payload)
    .eq("id", appointmentId);

  return error ? error.message : null;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const sendTelegram = async (
  payload: AppointmentPayload,
  botToken: string | undefined,
  chatId: string | undefined,
): Promise<ChannelResult> => {
  if (!botToken || !chatId) {
    return { ok: false, error: "missing_telegram_secrets" };
  }

  try {
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
      return {
        ok: false,
        error: `telegram_upstream_${response.status}`,
        details: telegramBody,
      };
    }

    return {
      ok: true,
      details: { messageId: telegramBody?.result?.message_id ?? null },
    };
  } catch (error) {
    return {
      ok: false,
      error: "telegram_network_error",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

const isTransientWhatsappStatus = (status: number) => status === 429 || status >= 500;

const sendWhatsappViaGreenApi = async (
  payload: AppointmentPayload,
  apiUrl: string | undefined,
  idInstance: string | undefined,
  apiTokenInstance: string | undefined,
): Promise<ChannelResult> => {
  if (!apiUrl || !idInstance || !apiTokenInstance) {
    return {
      ok: false,
      skipped: true,
      error: "missing_green_api_secrets",
      attempts: 0,
    };
  }

  const trimmedApiUrl = apiUrl.replace(/\/+$/, "");
  const endpoint = `${trimmedApiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
  const message = buildWhatsappMessage(payload);
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: payload.whatsappChatId,
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
        await sleep(450);
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
        await sleep(450);
        continue;
      }

      return {
        ok: false,
        attempts: attempt,
        error: "green_api_network_error",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  return {
    ok: false,
    attempts: maxAttempts,
    error: "green_api_unknown_failure",
  };
};

serve(async (req) => {
  const allowedOrigins = parseAllowedOrigins(Deno.env.get("BOOKING_ALLOWED_ORIGINS"));
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin, allowedOrigins);

  if (req.method === "OPTIONS") {
    if (!isOriginAllowed(origin, allowedOrigins)) {
      return new Response(
        JSON.stringify({ success: false, error: "blocked_origin" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({
        success: false,
        error: "method_not_allowed",
        bookingPersisted: false,
        appointmentId: null,
        bookingError: "method_not_allowed",
      }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  if (!isOriginAllowed(origin, allowedOrigins)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "blocked_origin",
        bookingPersisted: false,
        appointmentId: null,
        bookingError: "blocked_origin",
      }),
      {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "invalid_payload",
          bookingPersisted: false,
          appointmentId: null,
          bookingError: "invalid_payload",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const payload = validatePayload(body as Record<string, unknown>);
    if (!payload) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "invalid_payload_fields",
          bookingPersisted: false,
          appointmentId: null,
          bookingError: "invalid_payload_fields",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const requesterIp = getRequesterIp(req);
    const cooldownKey = `${requesterIp}:${payload.normalizedClientPhone}`;
    const now = Date.now();
    if (isCooldownActive(cooldownKey, now)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "cooldown_active",
          retryAfterMs: BOOKING_REQUEST_COOLDOWN_MS,
          bookingPersisted: false,
          appointmentId: null,
          bookingError: "cooldown_active",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    markCooldown(cooldownKey, now);

    // Step 1: Persist appointment + reminders FIRST (before sending any messages)
    const reminderQueueResult = await persistAppointmentAndReminders(payload);
    const bookingMeta = buildBookingPersistenceMeta(reminderQueueResult);

    // Step 2: If duplicate booking (same phone+date+time), skip messaging entirely
    if (reminderQueueResult.duplicate) {
      return new Response(
        JSON.stringify({
          success: true,
          duplicate: true,
          bookingPersisted: false,
          appointmentId: null,
          bookingError: null,
          channels: {
            telegram: { ok: false, error: "skipped_duplicate" },
            whatsapp: { ok: false, error: "skipped_duplicate" },
          },
          reminders: reminderQueueResult,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Bug C fix: Don't send messages if appointment wasn't persisted (non-duplicate failure)
    if (!bookingMeta.bookingPersisted) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "booking_not_persisted",
          bookingPersisted: false,
          appointmentId: null,
          bookingError: bookingMeta.bookingError ?? "unknown_persistence_error",
          channels: {
            telegram: { ok: false, error: "skipped_no_booking" },
            whatsapp: { ok: false, error: "skipped_no_booking" },
          },
          reminders: reminderQueueResult,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Step 3: Send Telegram + WhatsApp confirmation in parallel (only if appointment was created)
    const [telegramResult, whatsappResult] = await Promise.all([
      sendTelegram(
        payload,
        Deno.env.get("TELEGRAM_BOT_TOKEN"),
        Deno.env.get("TELEGRAM_CHAT_ID"),
      ),
      sendWhatsappViaGreenApi(
        payload,
        Deno.env.get("GREEN_API_API_URL"),
        Deno.env.get("GREEN_API_ID_INSTANCE"),
        Deno.env.get("GREEN_API_API_TOKEN_INSTANCE"),
      ),
    ]);

    // Step 4: Persist WhatsApp confirmation status on the appointment row
    if (reminderQueueResult.appointmentId) {
      const persistenceError = await persistWhatsappConfirmationStatus(
        reminderQueueResult.appointmentId,
        whatsappResult,
      );
      if (persistenceError) {
        reminderQueueResult.errors.push(`confirmation_status_update_failed:${persistenceError}`);
      }
    }

    const success = telegramResult.ok || whatsappResult.ok;

    return new Response(
      JSON.stringify({
        success,
        bookingPersisted: bookingMeta.bookingPersisted,
        appointmentId: bookingMeta.appointmentId,
        bookingError: bookingMeta.bookingError,
        channels: {
          telegram: telegramResult,
          whatsapp: whatsappResult,
        },
        reminders: reminderQueueResult,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("notify-appointment-telegram error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "internal_error",
        details: error instanceof Error ? error.message : "Unknown error",
        bookingPersisted: false,
        appointmentId: null,
        bookingError: "internal_error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
