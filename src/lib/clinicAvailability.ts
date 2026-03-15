export type HeroChannel = "call" | "whatsapp";
export type StatusDotColor = "teal" | "warmGray";

export interface ClinicAvailability {
  isOpen: boolean;
  hoursUntilOpen: number;
  nextOpenLabel: string;
  heroChannel: HeroChannel;
  statusDotColor: StatusDotColor;
}

const CLINIC_TIME_ZONE = "Africa/Casablanca";

interface DaySchedule {
  open: number;
  close: number;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const MINUTES_IN_DAY = 24 * 60;

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const formatClock = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const getDaySchedule = (day: number): DaySchedule | null => {
  if (day === 0) return null;
  if (day === 6) {
    return {
      open: toMinutes("09:00"),
      close: toMinutes("12:00"),
    };
  }
  return {
    open: toMinutes("09:00"),
    close: toMinutes("18:00"),
  };
};

const getCasablancaNowParts = (date: Date) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: CLINIC_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  let weekday = "Sun";
  let hour = 0;
  let minute = 0;

  for (const part of formatter.formatToParts(date)) {
    if (part.type === "weekday") weekday = part.value;
    if (part.type === "hour") hour = Number(part.value);
    if (part.type === "minute") minute = Number(part.value);
  }

  const weekdayIndex = WEEKDAY_TO_INDEX[weekday] ?? 0;
  return { weekdayIndex, hour, minute };
};

const formatNextOpenLabel = (dayIndex: number, openMinute: number) =>
  `${DAY_NAMES[dayIndex]} ${formatClock(openMinute)}`;

export const getClinicAvailability = (now = new Date()): ClinicAvailability => {
  const { weekdayIndex, hour, minute } = getCasablancaNowParts(now);
  const currentMinutes = hour * 60 + minute;
  const todaySchedule = getDaySchedule(weekdayIndex);

  if (todaySchedule && currentMinutes >= todaySchedule.open && currentMinutes < todaySchedule.close) {
    return {
      isOpen: true,
      hoursUntilOpen: 0,
      nextOpenLabel: formatNextOpenLabel(weekdayIndex, todaySchedule.open),
      heroChannel: "call",
      statusDotColor: "teal",
    };
  }

  let minutesUntilOpen = 0;
  let probeDay = weekdayIndex;
  let probeMinute = currentMinutes;
  let targetSchedule: DaySchedule | null = null;
  let targetDay = weekdayIndex;

  for (let i = 0; i < 8; i += 1) {
    const schedule = getDaySchedule(probeDay);
    if (schedule && probeMinute < schedule.open) {
      minutesUntilOpen += schedule.open - probeMinute;
      targetSchedule = schedule;
      targetDay = probeDay;
      break;
    }

    minutesUntilOpen += MINUTES_IN_DAY - probeMinute;
    probeMinute = 0;
    probeDay = (probeDay + 1) % 7;
  }

  const fallbackSchedule = getDaySchedule(1);
  const openSchedule = targetSchedule ?? fallbackSchedule ?? { open: toMinutes("09:00"), close: toMinutes("18:00") };
  const nextOpenLabel = formatNextOpenLabel(targetDay, openSchedule.open);

  return {
    isOpen: false,
    hoursUntilOpen: Math.max(1, Math.ceil(minutesUntilOpen / 60)),
    nextOpenLabel,
    heroChannel: "whatsapp",
    statusDotColor: "warmGray",
  };
};

