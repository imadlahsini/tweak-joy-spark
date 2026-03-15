import { describe, expect, it } from "vitest";
import { getClinicAvailability } from "@/lib/clinicAvailability";

const CLINIC_TIME_ZONE = "Africa/Casablanca";
const WEEKDAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

const getZonedParts = (date: Date) => {
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

  return {
    weekdayIndex: WEEKDAY_TO_INDEX[weekday] ?? 0,
    hour,
    minute,
  };
};

const findZonedDate = (weekdayIndex: number, hour: number, minute: number) => {
  const start = Date.UTC(2026, 0, 1, 0, 0, 0);
  const stepMs = 30 * 60 * 1000;
  const maxSteps = 24 * 220;

  for (let i = 0; i < maxSteps; i += 1) {
    const candidate = new Date(start + i * stepMs);
    const parts = getZonedParts(candidate);
    if (parts.weekdayIndex === weekdayIndex && parts.hour === hour && parts.minute === minute) {
      return candidate;
    }
  }

  throw new Error(`Unable to find date for weekday=${weekdayIndex} hour=${hour}:${minute}`);
};

describe("getClinicAvailability", () => {
  it("returns open state and call hero during weekday opening hours", () => {
    const mondayAt10 = findZonedDate(1, 10, 0);
    const result = getClinicAvailability(mondayAt10);

    expect(result.isOpen).toBe(true);
    expect(result.heroChannel).toBe("call");
    expect(result.statusDotColor).toBe("teal");
    expect(result.hoursUntilOpen).toBe(0);
  });

  it("returns closed state with saturday opening after friday closing time", () => {
    const fridayAt19 = findZonedDate(5, 19, 0);
    const result = getClinicAvailability(fridayAt19);

    expect(result.isOpen).toBe(false);
    expect(result.heroChannel).toBe("whatsapp");
    expect(result.statusDotColor).toBe("warmGray");
    expect(result.hoursUntilOpen).toBeGreaterThan(0);
    expect(result.nextOpenLabel).toBe("Sat 09:00");
  });

  it("returns monday opening after saturday cutoff", () => {
    const saturdayAt13 = findZonedDate(6, 13, 0);
    const result = getClinicAvailability(saturdayAt13);

    expect(result.isOpen).toBe(false);
    expect(result.heroChannel).toBe("whatsapp");
    expect(result.statusDotColor).toBe("warmGray");
    expect(result.nextOpenLabel).toBe("Mon 09:00");
  });

  it("returns monday opening while sunday is closed", () => {
    const sundayAt11 = findZonedDate(0, 11, 0);
    const result = getClinicAvailability(sundayAt11);

    expect(result.isOpen).toBe(false);
    expect(result.heroChannel).toBe("whatsapp");
    expect(result.statusDotColor).toBe("warmGray");
    expect(result.nextOpenLabel).toBe("Mon 09:00");
  });
});

