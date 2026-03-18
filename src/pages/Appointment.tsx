import { useState, useRef, useEffect, useMemo, useCallback, forwardRef } from "react";
import { useNavigate, useLocation, useNavigationType } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import FloatingOrb from "@/components/shared/FloatingOrb";
import Navbar from "@/components/landing/Navbar";
import UiIcon from "@/components/shared/UiIcon";
import { supabase } from "@/integrations/supabase/client";
import { addDays, format, isToday, isSameDay } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { arSA } from "date-fns/locale/ar-SA";

const timeSlots = [
  { time: "09:00", period: "morning" },
  { time: "10:00", period: "morning" },
  { time: "11:00", period: "morning" },
  { time: "12:00", period: "morning" },
  { time: "13:00", period: "afternoon" },
  { time: "14:00", period: "afternoon" },
  { time: "15:00", period: "afternoon" },
  { time: "16:00", period: "afternoon" },
];

const SATURDAY_LAST_BOOKABLE_TIME = "12:00";
const isSundayDate = (date: Date) => date.getDay() === 0;
const isSaturdayDate = (date: Date) => date.getDay() === 6;

const translations = {
  en: {
    title: "Book Your",
    titleAccent: "Appointment",
    subtitle: "Select your preferred date and time",
    step1: "Date",
    step2: "Time",
    step3: "Details",
    selectDate: "Choose a Date",
    morning: "Morning",
    afternoon: "Afternoon",
    selectTime: "Pick a Time",
    confirm: "Confirm Appointment",
    selected: "Selected",
    back: "Back",
    successTitle: "Appointment Booked!",
    successDesc: "We'll see you on",
    consultation: "Consultation",
    today: "Today",
    closed: "Closed",
    summaryTitle: "Your Appointment",
    duration: "1h • In-person",
    at: "at",
    yourDetails: "Your Details",
    nameLabel: "Full Name",
    namePlaceholder: "Enter your name",
    phoneLabel: "Phone Number",
    phonePlaceholder: "06 12 34 56 78",
    nameRequired: "Name is required (min 2 characters)",
    phoneRequired: "Enter a valid Moroccan mobile number (10 digits)",
    phoneHint: "Start with 06 or 07 (10 digits)",
    edit: "Edit",
    ctaHintDate: "Choose a date to continue",
    ctaHintTime: "Pick a time to continue",
    ctaHintDetails: "Enter your details to confirm",
    ctaTrust: "1h • In-person • Instant confirmation",
    journeyPromptStart: "Pick a day to get started",
    journeyPromptSlot: "Choose your slot",
    journeyPromptDetails: "Confirm your details",
    journeyNextTime: "Next: Pick a time",
    journeyConfirmDetails: "Confirm details",
    journeyBookNow: "Book now",
    journeyEditDateAria: "Edit selected date",
  },
  fr: {
    title: "Réservez Votre",
    titleAccent: "Rendez-vous",
    subtitle: "Sélectionnez votre date et heure préférées",
    step1: "Date",
    step2: "Heure",
    step3: "Détails",
    selectDate: "Choisir une Date",
    morning: "Matin",
    afternoon: "Après-midi",
    selectTime: "Choisir une Heure",
    confirm: "Confirmer le Rendez-vous",
    selected: "Sélectionné",
    back: "Retour",
    successTitle: "Rendez-vous Réservé!",
    successDesc: "Nous vous verrons le",
    consultation: "Consultation",
    today: "Aujourd'hui",
    closed: "Fermé",
    summaryTitle: "Votre Rendez-vous",
    duration: "1h • En personne",
    at: "à",
    yourDetails: "Vos Informations",
    nameLabel: "Nom Complet",
    namePlaceholder: "Entrez votre nom",
    phoneLabel: "Numéro de Téléphone",
    phonePlaceholder: "06 12 34 56 78",
    nameRequired: "Le nom est requis (min 2 caractères)",
    phoneRequired: "Entrez un numéro mobile marocain valide (10 chiffres)",
    phoneHint: "Commencez par 06 ou 07 (10 chiffres)",
    edit: "Modifier",
    ctaHintDate: "Choisissez une date pour continuer",
    ctaHintTime: "Choisissez une heure pour continuer",
    ctaHintDetails: "Entrez vos informations pour confirmer",
    ctaTrust: "1h • En personne • Confirmation immédiate",
    journeyPromptStart: "Choisissez un jour pour commencer",
    journeyPromptSlot: "Choisissez votre créneau",
    journeyPromptDetails: "Confirmez vos informations",
    journeyNextTime: "Suivant: Choisir l'heure",
    journeyConfirmDetails: "Confirmer les détails",
    journeyBookNow: "Réserver",
    journeyEditDateAria: "Modifier la date choisie",
  },
  ar: {
    title: "احجز",
    titleAccent: "موعدك",
    subtitle: "اختر التاريخ والوقت المفضل لديك",
    step1: "التاريخ",
    step2: "الوقت",
    step3: "البيانات",
    selectDate: "اختر التاريخ",
    morning: "صباحاً",
    afternoon: "مساءً",
    selectTime: "اختر الوقت",
    confirm: "تأكيد الموعد",
    selected: "تم الاختيار",
    back: "رجوع",
    successTitle: "!تم حجز الموعد",
    successDesc: "سنراك في",
    consultation: "استشارة",
    today: "اليوم",
    closed: "مغلق",
    summaryTitle: "موعدك",
    duration: "ساعة • حضوري",
    at: "في",
    yourDetails: "بياناتك",
    nameLabel: "الاسم الكامل",
    namePlaceholder: "أدخل اسمك",
    phoneLabel: "رقم الهاتف",
    phonePlaceholder: "06 12 34 56 78",
    nameRequired: "الاسم مطلوب (حرفان على الأقل)",
    phoneRequired: "أدخل رقم هاتف مغربي صحيح (10 أرقام)",
    phoneHint: "يبدأ بـ 06 أو 07 (10 أرقام)",
    edit: "تعديل",
    ctaHintDate: "اختر التاريخ للمتابعة",
    ctaHintTime: "اختر الوقت للمتابعة",
    ctaHintDetails: "أدخل بياناتك للتأكيد",
    ctaTrust: "ساعة • حضوري • تأكيد فوري",
    journeyPromptStart: "اختر يوماً للبدء",
    journeyPromptSlot: "اختر الوقت المناسب",
    journeyPromptDetails: "أكمل بياناتك",
    journeyNextTime: "التالي: اختر الوقت",
    journeyConfirmDetails: "تأكيد البيانات",
    journeyBookNow: "احجز الآن",
    journeyEditDateAria: "تعديل التاريخ المختار",
  },
  zgh: {
    title: "ⵃⵥⵥ",
    titleAccent: "ⴰⵎⵓⵄⴷⴽ",
    subtitle: "ⴼⵔⵏ ⴰⵣⵎⵣ ⴷ ⵓⴽⵓⴷ ⵉ ⵜⵔⵉⴷ",
    step1: "ⴰⵣⵎⵣ",
    step2: "ⴰⴽⵓⴷ",
    step3: "ⵉⵙⴼⴽⴰ",
    selectDate: "ⴼⵔⵏ ⴰⵣⵎⵣ",
    morning: "ⵜⴰⴼⴰⵡⵜ",
    afternoon: "ⵜⴰⴷⴳⴳⵯⴰⵜ",
    selectTime: "ⴼⵔⵏ ⴰⴽⵓⴷ",
    confirm: "ⵙⵙⵏⵜⵎ ⴰⵎⵓⵄⴷ",
    selected: "ⵉⵜⵜⵓⴼⵔⵏ",
    back: "ⵓⵔⴰⵔ",
    successTitle: "!ⵉⵜⵜⵓⵃⵥⵥ ⵓⵎⵓⵄⴷ",
    successDesc: "ⴰⴷ ⵏⵣⵔⴽ ⴳ",
    consultation: "ⴰⵙⵉⵡⴹ",
    today: "ⴰⵙⵙⴰ",
    closed: "ⵉⵎⵖⵍⵉ",
    summaryTitle: "ⴰⵎⵓⵄⴷⵏⵏⴽ",
    duration: "1ⵙⴰⵄⴰ • ⵙ ⵓⴷⴷⵓⵔ",
    at: "ⴳ",
    yourDetails: "ⵉⵙⴼⴽⴰⵏⵏⴽ",
    nameLabel: "ⵉⵙⵎ ⴰⴽⴰⵎⴰⵍ",
    namePlaceholder: "ⵙⴽⵛⵎ ⵉⵙⵎⵏⵏⴽ",
    phoneLabel: "ⵓⵜⵟⵓⵏ ⵏ ⵓⵟⵟⵍ",
    phonePlaceholder: "06 12 34 56 78",
    nameRequired: "ⵉⵙⵎ ⵉⵍⵍⴰ ⴰⴷ ⵉⵍⵉ (ⵙⵉⵏ ⵉⵙⴽⴽⵉⵍⵏ)",
    phoneRequired: "ⵙⴽⵛⵎ ⵓⵜⵟⵓⵏ ⵏ ⵓⵟⵟⵍ ⴰⵎⵓⵔⵓⴽⵉ ⵉⵎⵖⴰⵔ (10 ⵉⵎⵣⴳⴰⵏ)",
    phoneHint: "ⵉⵙⵙⵏⵜⵉ ⵙ 06 ⵏⵖ 07 (10 ⵉⵎⵣⴳⴰⵏ)",
    edit: "ⵙⵏⴼⵍ",
    ctaHintDate: "ⴼⵔⵏ ⴰⵣⵎⵣ ⵉ ⵜⵙⵎⴷ",
    ctaHintTime: "ⴼⵔⵏ ⴰⴽⵓⴷ ⵉ ⵜⵙⵎⴷ",
    ctaHintDetails: "ⵙⴽⵛⵎ ⵉⵙⴼⴽⴰⵏⵏⴽ ⵉ ⵜⵙⵙⵏⵜⵎ",
    ctaTrust: "1ⵙⴰⵄⴰ • ⵙ ⵓⴷⴷⵓⵔ • ⴰⵙⵙⵏⵜⵎ ⴰⵎⵉⵔⴰⵏ",
    journeyPromptStart: "ⴼⵔⵏ ⴰⵣⵎⵣ ⵉ ⵜⴱⴷⵓ",
    journeyPromptSlot: "ⴼⵔⵏ ⴰⴽⵓⴷⵏⵏⴽ",
    journeyPromptDetails: "ⵙⵙⵏⵜⵎ ⵉⵙⴼⴽⴰⵏⵏⴽ",
    journeyNextTime: "ⵉⴹⴼⴼⵔ: ⴼⵔⵏ ⴰⴽⵓⴷ",
    journeyConfirmDetails: "ⵙⵙⵏⵜⵎ ⵉⵙⴼⴽⴰ",
    journeyBookNow: "ⵃⵥⵥ ⵖⵉⵍⴰⴷ",
    journeyEditDateAria: "ⵙⵏⴼⵍ ⴰⵣⵎⵣ ⵉⵜⵜⵓⴼⵔⵏ",
  },
};

type StepConnectorState = "completed" | "active" | "pending";
type RtlScrollType = "negative" | "reverse" | "default";

interface StepConnectorProps {
  state: StepConnectorState;
  isRTL: boolean;
  reducedMotion: boolean;
  className?: string;
}

const StepConnector = ({ state, isRTL, reducedMotion, className = "" }: StepConnectorProps) => {
  const baseFill = state === "completed" ? 1 : state === "active" ? 0.62 : 0;
  const animateFill =
    reducedMotion || state !== "active"
      ? { scaleX: baseFill, opacity: baseFill === 0 ? 0 : 1 }
      : { scaleX: [0.42, 0.74, 0.42], opacity: [0.72, 1, 0.72] };

  const transition = reducedMotion || state !== "active"
    ? { duration: 0.28, ease: [0.2, 0.65, 0.3, 0.9] as const }
    : { duration: 1.8, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className={`relative h-[2px] overflow-hidden rounded-full ${className}`}>
      <div className="absolute inset-0 bg-border/55 rounded-full" />
      <motion.div
        className={`absolute inset-0 rounded-full bg-gradient-to-r from-primary/70 to-accent/80 ${
          state === "active" ? "shadow-[0_0_10px_hsl(var(--primary)/0.35)]" : ""
        }`}
        style={{ originX: isRTL ? 1 : 0 }}
        animate={animateFill}
        transition={transition}
      >
        {!reducedMotion && state === "active" && (
          <motion.span
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent mix-blend-screen"
            animate={{ x: isRTL ? ["120%", "-120%"] : ["-120%", "120%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          />
        )}
      </motion.div>
    </div>
  );
};

const ThinArrow = ({ className = "" }: { className?: string }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path d="M3 8h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const normalizeMoroccanPhone = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";

  let normalized = digitsOnly;

  if (normalized.startsWith("00212")) {
    normalized = normalized.slice(5);
  } else if (normalized.startsWith("212")) {
    normalized = normalized.slice(3);
  }

  if ((normalized.startsWith("6") || normalized.startsWith("7")) && normalized.length <= 9) {
    normalized = `0${normalized}`;
  }

  if (normalized.startsWith("00") && (normalized[2] === "6" || normalized[2] === "7")) {
    normalized = normalized.slice(1);
  }

  return normalized.slice(0, 10);
};

const formatMoroccanPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
};

const formatMoroccanPhoneDisplay = (value: string) => {
  const normalized = normalizeMoroccanPhone(value);
  return formatMoroccanPhone(normalized);
};

let cachedRtlScrollType: RtlScrollType | null = null;

const detectRtlScrollType = (): RtlScrollType => {
  if (cachedRtlScrollType) return cachedRtlScrollType;
  if (typeof document === "undefined" || !document.body) return "negative";

  const probe = document.createElement("div");
  const content = document.createElement("div");
  probe.dir = "rtl";
  probe.style.width = "4px";
  probe.style.height = "1px";
  probe.style.position = "absolute";
  probe.style.top = "-9999px";
  probe.style.overflow = "scroll";
  content.style.width = "8px";
  content.style.height = "1px";
  probe.appendChild(content);
  document.body.appendChild(probe);

  let rtlType: RtlScrollType = "reverse";
  if (probe.scrollLeft > 0) {
    rtlType = "default";
  } else {
    probe.scrollLeft = 1;
    if (probe.scrollLeft === 0) rtlType = "negative";
  }

  document.body.removeChild(probe);
  cachedRtlScrollType = rtlType;
  return rtlType;
};

const getNormalizedScrollLeft = (element: HTMLElement, isRTL: boolean) => {
  const maxScroll = Math.max(0, element.scrollWidth - element.clientWidth);
  if (!isRTL) {
    return Math.min(maxScroll, Math.max(0, element.scrollLeft));
  }

  const rtlType = detectRtlScrollType();
  const raw = element.scrollLeft;
  const normalized =
    rtlType === "negative" ? -raw : rtlType === "default" ? maxScroll - raw : raw;

  return Math.min(maxScroll, Math.max(0, normalized));
};

const APPOINTMENT_RESET_ON_RETURN_KEY = "appointment:reset-on-return";
const SELECTION_FEEDBACK_HOLD_MS = 380;
const SECTION_GLIDE_DURATION_MS = 760;
const SECTION_GLIDE_KICKOFF_DELAY_MS = 140;
const SECTION_GLIDE_TOP_OFFSET = 96;
const DETAILS_FOCUS_DELAY_MS = 220;

const smootherstepEase = (progress: number) => {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  return progress * progress * progress * (progress * (progress * 6 - 15) + 10);
};

const markAppointmentResetOnReturn = () => {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(APPOINTMENT_RESET_ON_RETURN_KEY, "1");
  }
};

const consumeAppointmentResetOnReturn = () => {
  if (typeof window === "undefined") return false;
  const shouldReset = window.sessionStorage.getItem(APPOINTMENT_RESET_ON_RETURN_KEY) === "1";
  if (shouldReset) {
    window.sessionStorage.removeItem(APPOINTMENT_RESET_ON_RETURN_KEY);
  }
  return shouldReset;
};

const clearInteractionLocks = () => {
  if (typeof document === "undefined") return;

  const targets = [document.documentElement, document.body];
  targets.forEach((target) => {
    target.style.removeProperty("overflow");
    target.style.removeProperty("pointer-events");
    target.style.removeProperty("touch-action");
    target.style.removeProperty("position");
    target.style.removeProperty("top");
    target.style.removeProperty("left");
    target.style.removeProperty("right");
    target.style.removeProperty("width");
    target.style.removeProperty("padding-right");
    target.removeAttribute("data-scroll-locked");
    target.classList.remove("overflow-hidden");
  });
};

const Appointment = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const navigationType = useNavigationType();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [detailsJourneyActive, setDetailsJourneyActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeSectionRef = useRef<HTMLDivElement>(null);
  const dateSectionRef = useRef<HTMLDivElement>(null);
  const summarySectionRef = useRef<HTMLDivElement>(null);
  const detailsSectionRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isDateToTimeTransitioning, setIsDateToTimeTransitioning] = useState(false);
  const [isTimeToDetailsTransitioning, setIsTimeToDetailsTransitioning] = useState(false);
  const [isDateSelectionFeedbackActive, setIsDateSelectionFeedbackActive] = useState(false);
  const [isTimeSelectionFeedbackActive, setIsTimeSelectionFeedbackActive] = useState(false);
  const [activeDateFeedbackKey, setActiveDateFeedbackKey] = useState<string | null>(null);
  const [activeTimeFeedbackKey, setActiveTimeFeedbackKey] = useState<string | null>(null);
  const [dateFeedbackPulseId, setDateFeedbackPulseId] = useState(0);
  const [timeFeedbackPulseId, setTimeFeedbackPulseId] = useState(0);
  const initialScrollLeftRef = useRef<number | null>(null);
  const confirmLockRef = useRef(false);
  const scrollAnimationFrameRef = useRef<number | null>(null);
  const scrollAnimationTokenRef = useRef(0);
  const dateToTimeAutoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeToDetailsAutoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const detailsFocusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dateSelectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeSelectionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const orbX1 = useTransform(mouseX, [-500, 500], [-20, 20]);
  const orbY1 = useTransform(mouseY, [-500, 500], [-20, 20]);
  const orbX2 = useTransform(mouseX, [-500, 500], [15, -15]);
  const orbY2 = useTransform(mouseY, [-500, 500], [10, -10]);

  const t = translations[(language as "en" | "fr" | "ar" | "zgh") || "en"];
  const isRTL = language === "ar";
  const dateLocale = language === "fr" || language === "zgh" ? fr : language === "ar" ? arSA : undefined;
  const sectionSwapInitial = prefersReducedMotion
    ? { opacity: 1, y: 0, scale: 1 }
    : { opacity: 0, y: 8, scale: 0.992 };
  const sectionSwapExit = prefersReducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: -8, scale: 0.985 };
  const sectionSwapTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const };
  const sectionLayoutTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

  const clearAutoAdvanceTimers = useCallback(() => {
    if (dateToTimeAutoAdvanceTimerRef.current) {
      clearTimeout(dateToTimeAutoAdvanceTimerRef.current);
      dateToTimeAutoAdvanceTimerRef.current = null;
    }
    if (timeToDetailsAutoAdvanceTimerRef.current) {
      clearTimeout(timeToDetailsAutoAdvanceTimerRef.current);
      timeToDetailsAutoAdvanceTimerRef.current = null;
    }
  }, []);

  const clearDetailsFocusTimer = useCallback(() => {
    if (detailsFocusTimerRef.current) {
      clearTimeout(detailsFocusTimerRef.current);
      detailsFocusTimerRef.current = null;
    }
  }, []);

  const cancelSectionGlide = useCallback(() => {
    if (scrollAnimationFrameRef.current !== null) {
      cancelAnimationFrame(scrollAnimationFrameRef.current);
      scrollAnimationFrameRef.current = null;
    }
    scrollAnimationTokenRef.current += 1;
  }, []);

  const getScrollTargetTop = useCallback((element: HTMLElement, block: "center" | "start" = "center") => {
    if (typeof window === "undefined" || typeof document === "undefined") return 0;

    const viewportHeight = window.innerHeight;
    const rect = element.getBoundingClientRect();
    const absoluteTop = window.scrollY + rect.top;
    const centeredTop = absoluteTop - Math.max(0, (viewportHeight - rect.height) / 2);
    const startTop = absoluteTop - SECTION_GLIDE_TOP_OFFSET;
    const desiredTop = block === "center" ? centeredTop : startTop;
    const maxScrollTop = Math.max(0, document.documentElement.scrollHeight - viewportHeight);

    return Math.min(maxScrollTop, Math.max(0, desiredTop));
  }, []);

  const animateScrollToSection = useCallback((
    element: HTMLElement | null,
    options?: {
      block?: "center" | "start";
      duration?: number;
      onComplete?: () => void;
    }
  ) => {
    const onComplete = options?.onComplete;
    const block = options?.block ?? "center";
    const duration = options?.duration ?? SECTION_GLIDE_DURATION_MS;

    if (!element || typeof window === "undefined") {
      onComplete?.();
      return;
    }

    const targetTop = getScrollTargetTop(element, block);

    if (prefersReducedMotion) {
      cancelSectionGlide();
      window.scrollTo({ top: targetTop, behavior: "auto" });
      onComplete?.();
      return;
    }

    cancelSectionGlide();
    const animationToken = scrollAnimationTokenRef.current;
    const startTop = window.scrollY;
    const distance = targetTop - startTop;

    if (Math.abs(distance) < 1) {
      onComplete?.();
      return;
    }

    const startTime = performance.now();
    const tick = (now: number) => {
      if (animationToken !== scrollAnimationTokenRef.current) return;

      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const easedProgress = smootherstepEase(progress);

      window.scrollTo({ top: startTop + distance * easedProgress, behavior: "auto" });

      if (progress < 1) {
        scrollAnimationFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      scrollAnimationFrameRef.current = null;
      onComplete?.();
    };

    scrollAnimationFrameRef.current = requestAnimationFrame(tick);
  }, [cancelSectionGlide, getScrollTargetTop, prefersReducedMotion]);

  const clearDateSelectionTimer = useCallback(() => {
    if (dateSelectionTimerRef.current) {
      clearTimeout(dateSelectionTimerRef.current);
      dateSelectionTimerRef.current = null;
    }
  }, []);

  const clearTimeSelectionTimer = useCallback(() => {
    if (timeSelectionTimerRef.current) {
      clearTimeout(timeSelectionTimerRef.current);
      timeSelectionTimerRef.current = null;
    }
  }, []);

  const clearSelectionFeedbackState = useCallback(() => {
    clearDateSelectionTimer();
    clearTimeSelectionTimer();
    setIsDateSelectionFeedbackActive(false);
    setIsTimeSelectionFeedbackActive(false);
    setActiveDateFeedbackKey(null);
    setActiveTimeFeedbackKey(null);
  }, [clearDateSelectionTimer, clearTimeSelectionTimer]);

  const clearSectionTransitionState = useCallback(() => {
    clearAutoAdvanceTimers();
    clearDetailsFocusTimer();
    cancelSectionGlide();
    setIsDateToTimeTransitioning(false);
    setIsTimeToDetailsTransitioning(false);
  }, [cancelSectionGlide, clearAutoAdvanceTimers, clearDetailsFocusTimer]);

  const resetAppointmentState = useCallback(() => {
    clearSectionTransitionState();
    clearSelectionFeedbackState();
    setSelectedDate(undefined);
    setSelectedTime(null);
    setClientName("");
    setClientPhone("");
    setNameTouched(false);
    setPhoneTouched(false);
    setShowSparkles(false);
    setIsConfirming(false);
    confirmLockRef.current = false;
    setHasScrolled(false);
    setShowLeftFade(false);
    setShowRightFade(true);
    initialScrollLeftRef.current = null;
  }, [clearSectionTransitionState, clearSelectionFeedbackState]);

  useEffect(() => {
    const shouldResetFromMarker = consumeAppointmentResetOnReturn();
    const shouldResetFromPop = navigationType === "POP";

    clearInteractionLocks();
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => clearInteractionLocks());
    }

    confirmLockRef.current = false;
    setIsConfirming(false);

    if (shouldResetFromMarker || shouldResetFromPop) {
      resetAppointmentState();
      if (typeof window !== "undefined") {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "auto" });
        });
      }
    }

    const handlePageShow = () => clearInteractionLocks();
    const handlePopState = () => clearInteractionLocks();

    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("popstate", handlePopState);
      clearInteractionLocks();
    };
  }, [location.key, navigationType, resetAppointmentState]);

  const isNameValid = clientName.trim().length >= 2;
  const isPhoneValid = /^0[67]\d{8}$/.test(clientPhone);
  const isFormValid = isNameValid && isPhoneValid;
  const formattedPhoneValue = formatMoroccanPhone(clientPhone);
  const hasDateProgressed = Boolean(selectedDate) && !isDateSelectionFeedbackActive && !isDateToTimeTransitioning;
  const hasTimeProgressed = Boolean(selectedTime) && !isTimeSelectionFeedbackActive && !isTimeToDetailsTransitioning;
  const currentStep = !selectedDate
    ? 1
    : !hasDateProgressed
    ? 1
    : !selectedTime
    ? 2
    : !hasTimeProgressed
    ? 2
    : !isFormValid
    ? 3
    : 4;
  const progressStep = Math.min(currentStep, 3);
  const isDateCollapsed = Boolean(selectedDate) && currentStep > 1 && !isDateSelectionFeedbackActive;
  const isTimeCollapsed = Boolean(selectedDate && selectedTime) && currentStep > 2 && !isTimeSelectionFeedbackActive;
  const canConfirm = Boolean(selectedDate && selectedTime && isFormValid);
  const ctaHint = !selectedDate ? t.ctaHintDate : !selectedTime ? t.ctaHintTime : t.ctaHintDetails;
  const progressItems = [
    { id: 1, label: t.step1, icon: "solar:calendar-date-bold-duotone" },
    { id: 2, label: t.step2, icon: "solar:clock-circle-bold-duotone" },
    { id: 3, label: t.step3, icon: "solar:user-bold-duotone" },
  ] as const;
  const getConnectorState = (nextStepId: number): StepConnectorState => {
    if (currentStep > nextStepId) return "completed";
    if (currentStep === nextStepId) return "active";
    return "pending";
  };
  const canNavigateToStep = (stepId: number) => {
    if (stepId === 1) return currentStep > 1;
    if (stepId === 2) return Boolean(selectedDate) && currentStep > 2;
    if (stepId === 3) return Boolean(selectedDate && selectedTime && hasTimeProgressed);
    return false;
  };

  const jumpToTimeSection = () => {
    animateScrollToSection(timeSectionRef.current, { block: "center" });
  };

  const jumpToDetailsSection = () => {
    setDetailsJourneyActive(true);
    animateScrollToSection(detailsSectionRef.current, { block: "center" });
  };

  const handleDateSelect = useCallback((day: Date) => {
    if (isSundayDate(day)) return;
    const dateKey = day.toDateString();
    clearSectionTransitionState();
    clearDateSelectionTimer();
    clearTimeSelectionTimer();
    setActiveDateFeedbackKey(dateKey);
    setDateFeedbackPulseId((value) => value + 1);
    setActiveTimeFeedbackKey(null);
    setIsDateSelectionFeedbackActive(true);
    setIsTimeSelectionFeedbackActive(false);
    setDetailsJourneyActive(false);
    setSelectedDate(day);
    setSelectedTime(null);
    dateSelectionTimerRef.current = setTimeout(() => {
      setIsDateSelectionFeedbackActive(false);
      dateSelectionTimerRef.current = null;
    }, SELECTION_FEEDBACK_HOLD_MS);
  }, [clearDateSelectionTimer, clearSectionTransitionState, clearTimeSelectionTimer]);

  const handleTimeSelect = useCallback((time: string) => {
    clearSectionTransitionState();
    clearTimeSelectionTimer();
    setActiveTimeFeedbackKey(time);
    setTimeFeedbackPulseId((value) => value + 1);
    setIsTimeSelectionFeedbackActive(true);
    setDetailsJourneyActive(false);
    setSelectedTime(time);
    timeSelectionTimerRef.current = setTimeout(() => {
      setIsTimeSelectionFeedbackActive(false);
      timeSelectionTimerRef.current = null;
    }, SELECTION_FEEDBACK_HOLD_MS);
  }, [clearSectionTransitionState, clearTimeSelectionTimer]);

  // Bug 2 fix: compute dates inside component with useMemo
  const next14Days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)), []);

  // Auto-scroll to time section when date selected
  useEffect(() => {
    if (!selectedDate || isDateSelectionFeedbackActive || !timeSectionRef.current) return;
    if (dateToTimeAutoAdvanceTimerRef.current) {
      clearTimeout(dateToTimeAutoAdvanceTimerRef.current);
      dateToTimeAutoAdvanceTimerRef.current = null;
    }

    setIsDateToTimeTransitioning(true);
    dateToTimeAutoAdvanceTimerRef.current = setTimeout(() => {
      dateToTimeAutoAdvanceTimerRef.current = null;
      animateScrollToSection(timeSectionRef.current, {
        block: "center",
        duration: SECTION_GLIDE_DURATION_MS,
        onComplete: () => setIsDateToTimeTransitioning(false),
      });
    }, SECTION_GLIDE_KICKOFF_DELAY_MS);

    return () => {
      if (dateToTimeAutoAdvanceTimerRef.current) {
        clearTimeout(dateToTimeAutoAdvanceTimerRef.current);
        dateToTimeAutoAdvanceTimerRef.current = null;
      }
    };
  }, [selectedDate, isDateSelectionFeedbackActive, animateScrollToSection]);

  // Auto-scroll to details section when time selected
  useEffect(() => {
    if (!selectedDate || !selectedTime || isTimeSelectionFeedbackActive) return;

    if (timeToDetailsAutoAdvanceTimerRef.current) {
      clearTimeout(timeToDetailsAutoAdvanceTimerRef.current);
      timeToDetailsAutoAdvanceTimerRef.current = null;
    }
    clearDetailsFocusTimer();
    setIsTimeToDetailsTransitioning(true);

    timeToDetailsAutoAdvanceTimerRef.current = setTimeout(() => {
      timeToDetailsAutoAdvanceTimerRef.current = null;
      animateScrollToSection(detailsSectionRef.current, {
        block: "center",
        duration: SECTION_GLIDE_DURATION_MS,
        onComplete: () => {
          setIsTimeToDetailsTransitioning(false);
          clearDetailsFocusTimer();
          detailsFocusTimerRef.current = setTimeout(
            () => nameInputRef.current?.focus(),
            prefersReducedMotion ? 0 : DETAILS_FOCUS_DELAY_MS
          );
        },
      });
    }, SECTION_GLIDE_KICKOFF_DELAY_MS + 20);

    return () => {
      if (timeToDetailsAutoAdvanceTimerRef.current) {
        clearTimeout(timeToDetailsAutoAdvanceTimerRef.current);
        timeToDetailsAutoAdvanceTimerRef.current = null;
      }
      clearDetailsFocusTimer();
    };
  }, [
    selectedDate,
    selectedTime,
    isTimeSelectionFeedbackActive,
    animateScrollToSection,
    clearDetailsFocusTimer,
    prefersReducedMotion,
  ]);

  // Auto-scroll to summary when form is valid
  useEffect(() => {
    if (!isFormValid || !summarySectionRef.current) return;
    const timer = setTimeout(() => {
      animateScrollToSection(summarySectionRef.current, { block: "center", duration: 560 });
    }, 300);
    return () => clearTimeout(timer);
  }, [isFormValid, animateScrollToSection]);

  // Sparkle burst when form becomes valid
  useEffect(() => {
    if (isFormValid) {
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isFormValid]);

  useEffect(() => {
    if (!selectedTime) {
      setDetailsJourneyActive(false);
      return;
    }

    if (
      isFormValid ||
      nameTouched ||
      phoneTouched ||
      clientName.trim().length > 0 ||
      clientPhone.trim().length > 0
    ) {
      setDetailsJourneyActive(true);
    }
  }, [selectedTime, isFormValid, nameTouched, phoneTouched, clientName, clientPhone]);

  // Bug 8 fix: scroll fade indicators
  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    const fadeThreshold = 4;
    const swipeThreshold = 8;
    const updateFades = (normalized?: number) => {
      const maxScroll = Math.max(0, slider.scrollWidth - slider.clientWidth);
      if (maxScroll <= 0) {
        setShowLeftFade(false);
        setShowRightFade(false);
        return;
      }

      const offset = normalized ?? getNormalizedScrollLeft(slider, isRTL);
      setShowLeftFade(offset > fadeThreshold);
      setShowRightFade(offset < maxScroll - fadeThreshold);
    };

    initialScrollLeftRef.current = getNormalizedScrollLeft(slider, isRTL);
    const handleScroll = () => {
      const normalized = getNormalizedScrollLeft(slider, isRTL);
      if (initialScrollLeftRef.current !== null) {
        const delta = Math.abs(normalized - initialScrollLeftRef.current);
        if (delta > swipeThreshold) {
          setHasScrolled(true);
        }
      }
      updateFades(normalized);
    };
    const handleResize = () => {
      updateFades();
    };

    requestAnimationFrame(() => updateFades(initialScrollLeftRef.current ?? undefined));
    slider.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      slider.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isRTL, next14Days]);


  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    }
  };

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) return [];
    if (isSundayDate(selectedDate)) return [];
    if (isSaturdayDate(selectedDate)) {
      return timeSlots.filter((slot) => slot.time <= SATURDAY_LAST_BOOKABLE_TIME);
    }
    return timeSlots;
  }, [selectedDate]);

  const morningSlots = useMemo(
    () => availableTimeSlots.filter((slot) => slot.period === "morning"),
    [availableTimeSlots]
  );
  const afternoonSlots = useMemo(
    () => availableTimeSlots.filter((slot) => slot.period === "afternoon"),
    [availableTimeSlots]
  );

  const formatDate = (date: Date, pattern: string) => format(date, pattern, { locale: dateLocale });
  const journeyDateLabel = selectedDate ? formatDate(selectedDate, "EEE d MMM") : "";
  const journeySummaryLabel = selectedDate
    ? selectedTime
      ? `${journeyDateLabel} · ${selectedTime}`
      : journeyDateLabel
    : "";

  const journeyState: "start" | "time" | "confirm-details" | "details" =
    !selectedDate || !hasDateProgressed
      ? "start"
      : !selectedTime || !hasTimeProgressed
      ? "time"
      : detailsJourneyActive || isFormValid
      ? "details"
      : "confirm-details";

  const journeyCardToneClass =
    journeyState === "start"
      ? "bg-[linear-gradient(112deg,hsl(218_22%_14%/0.82),hsl(208_28%_11%/0.8))]"
      : journeyState === "time" || journeyState === "confirm-details"
      ? "bg-[linear-gradient(112deg,hsl(216_24%_15%/0.82),hsl(205_30%_12%/0.8))]"
      : "bg-[linear-gradient(112deg,hsl(213_26%_16%/0.82),hsl(201_32%_13%/0.8))]";

  const shouldShowPulseDot = journeyState === "start" && !prefersReducedMotion;

  useEffect(() => {
    if (selectedTime && !availableTimeSlots.some((slot) => slot.time === selectedTime)) {
      clearSectionTransitionState();
      clearTimeSelectionTimer();
      setIsTimeSelectionFeedbackActive(false);
      setActiveTimeFeedbackKey(null);
      setSelectedTime(null);
    }
  }, [availableTimeSlots, selectedTime, clearSectionTransitionState, clearTimeSelectionTimer]);

  useEffect(() => {
    return () => {
      clearDateSelectionTimer();
      clearTimeSelectionTimer();
      clearAutoAdvanceTimers();
      clearDetailsFocusTimer();
      cancelSectionGlide();
    };
  }, [cancelSectionGlide, clearAutoAdvanceTimers, clearDateSelectionTimer, clearDetailsFocusTimer, clearTimeSelectionTimer]);

  const handleConfirm = () => {
    if (!isNameValid) setNameTouched(true);
    if (!isPhoneValid) setPhoneTouched(true);

    if (confirmLockRef.current || isConfirming) return;

    if (selectedDate && selectedTime && isFormValid) {
      confirmLockRef.current = true;
      setIsConfirming(true);
      const submittedAt = new Date().toISOString();
      const bookingLanguage = (language as "en" | "fr" | "ar" | "zgh") || "en";
      const confirmationState = {
        clientName,
        clientPhone,
        selectedDate: selectedDate.toISOString(),
        selectedTime,
      };

      void supabase.functions
        .invoke("notify-appointment-telegram", {
          body: {
            ...confirmationState,
            language: bookingLanguage,
            submittedAt,
          },
        })
        .then(({ data, error }) => {
          if (error) {
            console.error("Booking notifications request failed:", error);
            return;
          }

          if (!data || typeof data !== "object") {
            return;
          }

          const notificationResult = data as {
            success?: boolean;
            channels?: {
              telegram?: { ok?: boolean; error?: string };
              whatsapp?: { ok?: boolean; error?: string; skipped?: boolean; attempts?: number };
            };
          };

          const telegramResult = notificationResult.channels?.telegram;
          const whatsappResult = notificationResult.channels?.whatsapp;

          if (telegramResult && telegramResult.ok === false) {
            console.error("Telegram notification failed:", telegramResult.error ?? telegramResult);
          }

          if (whatsappResult && whatsappResult.ok === false) {
            console.error("WhatsApp confirmation failed:", whatsappResult.error ?? whatsappResult);
          }

          if (notificationResult.success === false && !telegramResult?.ok && !whatsappResult?.ok) {
            console.error("All notification channels failed:", notificationResult.channels);
          }
        })
        .catch((error) => {
          console.error("Booking notifications request error:", error);
        });

      markAppointmentResetOnReturn();
      navigate("/appointment/confirmation", {
        state: confirmationState,
      });
    }
  };

  const handleProgressStepClick = (step: number) => {
    if (step === 1 && currentStep > 1) {
      clearSectionTransitionState();
      clearSelectionFeedbackState();
      setSelectedDate(undefined);
      setSelectedTime(null);
      animateScrollToSection(dateSectionRef.current, { block: "center" });
      return;
    }

    if (step === 2 && selectedDate && currentStep > 2) {
      clearSectionTransitionState();
      clearTimeSelectionTimer();
      setIsTimeSelectionFeedbackActive(false);
      setActiveTimeFeedbackKey(null);
      setSelectedTime(null);
      animateScrollToSection(timeSectionRef.current, { block: "center" });
      return;
    }

    if (step === 3 && selectedDate && selectedTime) {
      animateScrollToSection(detailsSectionRef.current, { block: "center" });
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      dir={isRTL ? "rtl" : "ltr"}
      className="relative min-h-screen bg-background overflow-hidden"
    >
      {/* === Background layers === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="sm:hidden absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary/14 via-transparent to-transparent blur-3xl" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -5, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-accent/15 via-transparent to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="hidden sm:block absolute top-1/4 left-1/3 w-1/2 h-1/2 bg-gradient-radial from-primary/10 via-transparent to-transparent blur-3xl"
        />
      </div>

      <div className="absolute inset-0 dot-grid opacity-25 sm:opacity-40 pointer-events-none" />

      {/* Floating geometric shapes */}
      <div className="hidden md:block absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] right-[8%] w-10 h-10 md:w-14 md:h-14 border-2 border-primary/20"
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        />
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[25%] left-[5%] w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-accent/30 bg-accent/5"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[25%] right-[5%] w-14 h-14 md:w-20 md:h-20 rounded-full border-4 border-primary/15"
        />
      </div>

      {/* Parallax orbs */}
      <motion.div style={{ x: orbX1, y: orbY1 }} className="hidden lg:block absolute inset-0 pointer-events-none">
        <FloatingOrb className="bg-primary/15 -top-20 -right-32" size="w-[200px] h-[200px] md:w-[500px] md:h-[500px]" delay={0.2} />
      </motion.div>
      <motion.div style={{ x: orbX2, y: orbY2 }} className="hidden lg:block absolute inset-0 pointer-events-none">
        <FloatingOrb className="bg-accent/10 top-1/3 -left-40" size="w-[250px] h-[250px] lg:w-[600px] lg:h-[600px]" delay={0.5} />
      </motion.div>

      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Bottom hero image */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent z-10" />
        <img
          src="https://ophtalmologueagadir.com/wp-content/uploads/2025/10/hero-image2.webp"
          alt=""
          loading="lazy"
          className="w-full h-full object-cover object-top opacity-5 blur-sm"
        />
      </div>

      {/* Sparkle burst overlay */}
      <AnimatePresence>
        {showSparkles && (
          <motion.div
            key="sparkle-burst"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 1,
                  scale: 0,
                  x: "50%",
                  y: "50%",
                }}
                animate={{
                  opacity: [1, 1, 0],
                  scale: [0, 1.5, 0.5],
                  x: `${50 + (Math.random() - 0.5) * 60}%`,
                  y: `${50 + (Math.random() - 0.5) * 60}%`,
                }}
                transition={{ duration: 1, delay: i * 0.05 }}
                className="absolute w-2 h-2 rounded-full bg-primary"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Main Content === */}
      {/* Bug 10 fix: increased pb-36 */}
      <Navbar />
      <div className="relative z-10 flex flex-col min-h-screen px-4 sm:px-6 pt-20 sm:pt-24 pb-44 sm:pb-40">

        {/* Heading */}
        <div className="relative text-center mb-4 sm:mb-6">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="relative z-10"
          >
            {/* Title — stacked */}
            <h1 className="font-display font-bold text-foreground leading-tight">
              <span className="block text-base sm:text-2xl md:text-3xl font-medium text-muted-foreground">
                {t.title}
              </span>
              <span className="block text-[1.95rem] sm:text-5xl md:text-6xl mt-1 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient drop-shadow-sm">
                {t.titleAccent}
              </span>
            </h1>

            {/* Subtitle */}
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="w-8 h-px bg-border" />
              <p className="text-[13px] sm:text-sm text-muted-foreground max-w-[17rem] sm:max-w-xs">
                {t.subtitle}
              </p>
              <span className="w-8 h-px bg-border" />
            </div>
          </motion.div>
        </div>

        {/* Compact sticky progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="hidden sm:block sticky top-[4.5rem] z-30 mb-4 sm:mb-6"
        >
          <div className="max-w-sm mx-auto rounded-2xl border border-border/60 bg-background/85 backdrop-blur-xl shadow-soft px-3 py-2.5">
            <div className="flex items-center">
              {progressItems.map((step, index) => {
                const iconName = step.icon;
                const isCompleted = currentStep > step.id;
                const isActive = progressStep === step.id;
                const canJump = canNavigateToStep(step.id);
                const connectorState =
                  index < progressItems.length - 1 ? getConnectorState(progressItems[index + 1].id) : null;
                return (
                  <div key={step.id} className="flex items-center flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => handleProgressStepClick(step.id)}
                      disabled={!canJump}
                      aria-label={step.label}
                      title={step.label}
                      className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground shadow-[0_0_14px_hsl(var(--primary)/0.3)]"
                          : isActive
                          ? "border-primary text-primary bg-background shadow-[0_0_0_3px_hsl(var(--primary)/0.14)]"
                          : "border-border text-muted-foreground bg-background/60"
                      } ${canJump ? "hover:border-primary/60" : "cursor-default"}
                      ${
                        !canJump && !isActive ? "opacity-80" : ""
                      }`}
                    >
                      <UiIcon
                        icon={isCompleted ? "solar:check-circle-bold" : iconName}
                        size={18}
                        tone="current"
                        state={isCompleted ? "completed" : isActive ? "active" : "default"}
                      />
                    </button>
                    {connectorState && (
                      <StepConnector
                        state={connectorState}
                        isRTL={isRTL}
                        reducedMotion={Boolean(prefersReducedMotion)}
                        className="mx-2 flex-1"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── Step 1: Date — Glass Card ── */}
        <motion.div
          ref={dateSectionRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm mx-auto mb-5"
        >
          <div className="relative bg-card/60 backdrop-blur-2xl border border-border/30 rounded-2xl p-4 sm:p-5 overflow-hidden shadow-soft">
            {/* Left-side ambient glow */}
            <div className={`absolute top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-1/3 ${isRTL ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-primary/15 to-transparent blur-2xl pointer-events-none`} />
            {/* Top gradient accent line */}
            <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            {/* Section label */}
            <div className="flex items-center gap-2.5 mb-5">
              <UiIcon icon="solar:calendar-date-bold-duotone" size={18} tone="primary" />
              <span className="text-sm font-bold text-foreground">{t.selectDate}</span>
            </div>

            <motion.div layout transition={sectionLayoutTransition}>
              <AnimatePresence mode="wait" initial={false}>
                {isDateCollapsed && selectedDate ? (
                  <motion.div
                    key="step1-collapsed"
                    initial={sectionSwapInitial}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={sectionSwapExit}
                    transition={sectionSwapTransition}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        clearSectionTransitionState();
                        clearSelectionFeedbackState();
                        setSelectedDate(undefined);
                        setSelectedTime(null);
                        animateScrollToSection(dateSectionRef.current, { block: "center" });
                      }}
                      className="w-full mt-2 rounded-2xl border border-primary/25 bg-primary/10 px-3 py-3 flex items-center justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-primary/80">{t.step1}</p>
                        <p className="text-sm font-semibold text-foreground break-words">{formatDate(selectedDate, "EEEE, MMM d, yyyy")}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary shrink-0">
                        {t.edit}
                        <UiIcon
                          icon={isRTL ? "solar:alt-arrow-left-linear" : "solar:alt-arrow-right-linear"}
                          size={18}
                          tone="current"
                        />
                      </span>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step1-expanded"
                    initial={sectionSwapInitial}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={sectionSwapExit}
                    transition={sectionSwapTransition}
                  >
                    {/* Horizontal day slider with scroll indicators */}
                    <div className="relative -mx-8 px-8 mt-1">
                      {/* End-side magnetic rail cue */}
                      {!hasScrolled && (isRTL ? showLeftFade : showRightFade) && (
                        <div
                          className={`absolute ${isRTL ? "left-0" : "right-0"} top-0 bottom-0 w-20 z-20 pointer-events-none overflow-hidden ${
                            isRTL
                              ? "bg-gradient-to-r from-primary/28 via-primary/14 to-transparent"
                              : "bg-gradient-to-l from-primary/28 via-primary/14 to-transparent"
                          }`}
                        >
                          <motion.div
                            aria-hidden="true"
                            animate={
                              prefersReducedMotion
                                ? undefined
                                : {
                                    opacity: [0.48, 0.78, 0.48],
                                    scaleY: [0.86, 1, 0.86],
                                  }
                            }
                            transition={
                              prefersReducedMotion
                                ? undefined
                                : { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                            }
                            className={`absolute ${isRTL ? "left-[7px]" : "right-[7px]"} top-1/2 -translate-y-1/2 w-[2px] h-11 rounded-full bg-gradient-to-b from-primary/90 via-accent/80 to-primary/85 shadow-[0_0_12px_hsl(var(--primary)/0.32)]`}
                          />
                          <motion.div
                            aria-hidden="true"
                            animate={
                              prefersReducedMotion
                                ? undefined
                                : { x: isRTL ? ["110%", "-115%"] : ["-115%", "110%"] }
                            }
                            transition={
                              prefersReducedMotion
                                ? undefined
                                : { duration: 2.8, repeat: Infinity, ease: "linear" }
                            }
                            className="absolute inset-y-0 w-6 bg-gradient-to-r from-transparent via-white/28 to-transparent dark:via-white/18"
                          />
                        </div>
                      )}
                      {showLeftFade && (
                        <div className={`absolute ${isRTL ? "right-0" : "left-0"} top-0 bottom-0 w-8 bg-gradient-to-r ${isRTL ? "from-transparent to-card/80" : "from-card/80 to-transparent"} z-10 pointer-events-none rounded-l-2xl`} />
                      )}
                      {showRightFade && (
                        <div className={`absolute ${isRTL ? "left-0" : "right-0"} top-0 bottom-0 w-8 bg-gradient-to-r ${isRTL ? "from-card/80 to-transparent" : "from-transparent to-card/80"} z-10 pointer-events-none rounded-r-2xl`} />
                      )}

                      <motion.div
                        ref={sliderRef}
                        className="flex gap-2.5 overflow-x-auto p-3 snap-x snap-mandatory"
                        animate={
                          !prefersReducedMotion && !hasScrolled && (isRTL ? showLeftFade : showRightFade)
                            ? { x: isRTL ? [0, -5, 0] : [0, 5, 0] }
                            : undefined
                        }
                        transition={
                          !prefersReducedMotion && !hasScrolled && (isRTL ? showLeftFade : showRightFade)
                            ? { duration: 2.1, repeat: Infinity, ease: "easeInOut" }
                            : undefined
                        }
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch", overflowY: "visible" }}
                      >
                        {next14Days.map((day, i) => {
                          const isSunday = isSundayDate(day);
                          const isSelected = selectedDate ? isSameDay(selectedDate, day) : false;
                          const isSelectedAndOpen = isSelected && !isSunday;
                          const dateKey = day.toDateString();
                          const isDateFeedbackTarget = isDateSelectionFeedbackActive && activeDateFeedbackKey === dateKey;
                          const shouldDeEmphasizeDateCard =
                            isDateSelectionFeedbackActive && activeDateFeedbackKey !== dateKey && !isSunday;
                          const today = isToday(day);
                          const dayLabel = formatDate(day, isRTL ? "EEEE" : "EEE");
                          const dateCardWidthClass = isRTL ? "w-[88px]" : "w-[60px]";
                          const dayLabelClass = isRTL
                            ? "text-[11px] font-semibold tracking-normal whitespace-nowrap leading-none"
                            : "text-xs font-medium uppercase tracking-wider";
                          return (
                            <motion.button
                              key={day.toISOString()}
                              initial={{ opacity: 0, scale: 0.8, y: 10 }}
                              animate={
                                isDateFeedbackTarget && !prefersReducedMotion
                                  ? { opacity: 1, scale: [1, 1.06, 1], y: 0 }
                                  : { opacity: 1, scale: 1, y: 0 }
                              }
                              transition={
                                isDateFeedbackTarget && !prefersReducedMotion
                                  ? { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
                                  : { duration: 0.3, delay: i * 0.04 }
                              }
                              whileTap={isSunday || prefersReducedMotion ? undefined : { scale: 0.92 }}
                              disabled={isSunday}
                              onClick={() => handleDateSelect(day)}
                              className={`relative flex-shrink-0 snap-center flex flex-col items-center justify-center ${dateCardWidthClass} h-[76px] rounded-2xl border transform-gpu transition-all duration-300 ${
                                isSunday
                                  ? "bg-muted/35 border-border/45 text-muted-foreground/70 opacity-75 cursor-not-allowed"
                                  : isSelectedAndOpen
                                  ? "bg-gradient-to-br from-primary to-accent border-primary/60 text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.45)]"
                                  : today
                                  ? "bg-card/80 border-accent/50 text-foreground hover:border-accent/70"
                                  : "bg-card/50 border-border/30 text-foreground hover:border-primary/30 hover:bg-card/70"
                              } ${shouldDeEmphasizeDateCard ? "opacity-80 scale-[0.98]" : ""}`}
                            >
                              <AnimatePresence>
                                {isSelectedAndOpen && isDateFeedbackTarget && !prefersReducedMotion && (
                                  <motion.span
                                    key={`date-glow-${dateKey}-${dateFeedbackPulseId}`}
                                    aria-hidden="true"
                                    initial={{ opacity: 0, scale: 0.94 }}
                                    animate={{ opacity: [0.2, 0.9, 0], scale: [0.94, 1.06, 1.08] }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                                    className="pointer-events-none absolute inset-0 rounded-2xl border border-primary-foreground/70 shadow-[0_0_0_1px_hsl(var(--primary)/0.55),0_0_20px_hsl(var(--primary)/0.45)]"
                                  />
                                )}
                              </AnimatePresence>
                              <AnimatePresence>
                                {isSelectedAndOpen && isDateFeedbackTarget && !prefersReducedMotion && (
                                  <motion.span
                                    key={`date-shimmer-${dateKey}-${dateFeedbackPulseId}`}
                                    aria-hidden="true"
                                    initial={{ x: isRTL ? "125%" : "-125%", opacity: 0 }}
                                    animate={{ x: isRTL ? "-125%" : "125%", opacity: [0, 0.5, 0] }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.72, ease: "easeOut" }}
                                    className="pointer-events-none absolute inset-y-0 w-7 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                                  />
                                )}
                              </AnimatePresence>
                              {today && !isSelected && !isSunday && (
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
                              )}
                              <span className={`${dayLabelClass} ${isSelectedAndOpen ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                {dayLabel}
                              </span>
                              <span className={`text-xl font-bold leading-tight ${isSelected ? "text-primary-foreground" : ""}`}>
                                {formatDate(day, "d")}
                              </span>
                              {isSunday ? (
                                <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-destructive/80">
                                  {t.closed}
                                </span>
                              ) : (
                                <span className={`text-[11px] font-medium ${isSelectedAndOpen ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>
                                  {formatDate(day, "MMM")}
                                </span>
                              )}
                              <AnimatePresence>
                                {isSelectedAndOpen && (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 90 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-background flex items-center justify-center z-20"
                                  >
                                    <UiIcon icon="solar:check-circle-bold" size={16} className="text-accent-foreground" />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.button>
                          );
                        })}
                        <div className="flex-shrink-0 w-14" aria-hidden="true" />
                      </motion.div>
                    </div>

                    <AnimatePresence>
                      {selectedDate && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="mt-3 flex justify-center"
                        >
                          <span className="inline-flex max-w-full items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary backdrop-blur-sm text-center whitespace-normal break-words leading-snug">
                            <UiIcon icon="solar:check-circle-bold-duotone" size={16} tone="current" />
                            {formatDate(selectedDate, "EEEE, MMM d, yyyy")}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </motion.div>

        {/* ── Step 2: Time Slots — Glass Card ── */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              ref={timeSectionRef}
              initial={{ opacity: 0, y: 22, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.99 }}
              transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm mx-auto mb-5"
            >
              <div className="relative bg-card/60 backdrop-blur-2xl border border-border/30 rounded-2xl p-4 sm:p-5 overflow-hidden shadow-soft">
                {/* Top gradient accent line */}
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

                {/* Section label */}
                <div className="flex items-center gap-2.5 mb-4">
                  <UiIcon icon="solar:clock-circle-bold-duotone" size={18} tone="accent" />
                  <span className="text-sm font-bold text-foreground">{t.selectTime}</span>
                </div>

                <motion.div layout transition={sectionLayoutTransition}>
                  <AnimatePresence mode="wait" initial={false}>
                    {isTimeCollapsed && selectedTime ? (
                      <motion.div
                        key="step2-collapsed"
                        initial={sectionSwapInitial}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={sectionSwapExit}
                        transition={sectionSwapTransition}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            clearSectionTransitionState();
                            clearTimeSelectionTimer();
                            setIsTimeSelectionFeedbackActive(false);
                            setActiveTimeFeedbackKey(null);
                            setSelectedTime(null);
                            animateScrollToSection(timeSectionRef.current, { block: "center" });
                          }}
                          className="w-full mt-1 rounded-2xl border border-accent/25 bg-accent/10 px-3 py-3 flex items-center justify-between gap-3 text-left"
                        >
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-accent/80">{t.step2}</p>
                            <p className="text-sm font-semibold text-foreground break-words">{selectedTime}</p>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent shrink-0">
                            {t.edit}
                            <UiIcon
                              icon={isRTL ? "solar:alt-arrow-left-linear" : "solar:alt-arrow-right-linear"}
                              size={18}
                              tone="current"
                            />
                          </span>
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="step2-expanded"
                        initial={sectionSwapInitial}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={sectionSwapExit}
                        transition={sectionSwapTransition}
                      >
                        {morningSlots.length > 0 && (
                          <TimeGroup
                            label={t.morning}
                            icon={<UiIcon icon="solar:sun-2-bold-duotone" size={18} tone="primary" />}
                            slots={morningSlots}
                            selectedTime={selectedTime}
                            onSelect={handleTimeSelect}
                            activeFeedbackTime={activeTimeFeedbackKey}
                            isSelectionFeedbackActive={isTimeSelectionFeedbackActive}
                            feedbackPulseId={timeFeedbackPulseId}
                            prefersReducedMotion={Boolean(prefersReducedMotion)}
                            isRTL={isRTL}
                            delayOffset={0}
                          />
                        )}

                        {morningSlots.length > 0 && afternoonSlots.length > 0 && (
                          <div className="flex items-center gap-3 my-3">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                            <motion.div
                              animate={{ rotate: [0, 180, 360] }}
                              transition={{ duration: 8, ease: "linear" }}
                              className="w-5 h-5 rounded-full border border-border/50 flex items-center justify-center"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent" />
                            </motion.div>
                            <div className="flex-1 h-px bg-gradient-to-r from-border via-transparent to-transparent" />
                          </div>
                        )}

                        {afternoonSlots.length > 0 && (
                          <TimeGroup
                            label={t.afternoon}
                            icon={<UiIcon icon="solar:cloud-sun-2-bold-duotone" size={18} tone="accent" />}
                            slots={afternoonSlots}
                            selectedTime={selectedTime}
                            onSelect={handleTimeSelect}
                            activeFeedbackTime={activeTimeFeedbackKey}
                            isSelectionFeedbackActive={isTimeSelectionFeedbackActive}
                            feedbackPulseId={timeFeedbackPulseId}
                            prefersReducedMotion={Boolean(prefersReducedMotion)}
                            isRTL={isRTL}
                            delayOffset={4}
                          />
                        )}

                        {morningSlots.length === 0 && afternoonSlots.length === 0 && (
                          <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-3 py-3 text-sm font-semibold text-destructive/90 flex items-center gap-2">
                            <UiIcon icon="solar:danger-triangle-bold-duotone" size={18} tone="current" />
                            <span>{t.closed}</span>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step 3: Your Details — Glass Card ── */}
        <AnimatePresence>
          {selectedDate && selectedTime && (
            <motion.div
              ref={detailsSectionRef}
              initial={{ opacity: 0, y: 22, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.99 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-sm mx-auto mb-5"
            >
              <div className="relative bg-card/60 backdrop-blur-2xl border border-border/30 rounded-2xl p-4 sm:p-5 overflow-hidden shadow-soft">
                {/* Top gradient accent line */}
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                {/* Section label */}
                <div className="flex items-center gap-2.5 mb-5">
                  <UiIcon icon="solar:user-bold-duotone" size={18} tone="primary" />
                  <span className="text-sm font-bold text-foreground">{t.yourDetails}</span>
                </div>

                {/* Name input */}
                <div className="space-y-2.5">
                  <div className="space-y-1.5">
                    <div
                      className={`relative overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm transition-all duration-300 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] ${
                        nameTouched && !isNameValid
                          ? "border-destructive focus-within:border-destructive"
                          : "border-border/60 focus-within:border-primary"
                      }`}
                    >
                      <label
                        htmlFor="client-name"
                        className={`absolute top-2 inline-flex max-w-[calc(100%-3rem)] items-center gap-1.5 text-[11px] font-semibold text-foreground/78 ${
                          isRTL ? "right-3" : "left-3"
                        }`}
                        style={isRTL ? { direction: "ltr", unicodeBidi: "isolate" } : undefined}
                      >
                        <span className="order-1 inline-flex items-center">
                          <UiIcon
                            icon="solar:user-bold-duotone"
                            size={16}
                            tone={isNameValid ? "success" : "muted"}
                            className={isRTL ? "-scale-x-100" : ""}
                          />
                        </span>
                        <span
                          className={`order-2 leading-none ${isRTL ? "text-right" : ""}`}
                          dir={isRTL ? "rtl" : undefined}
                        >
                          {t.nameLabel}
                        </span>
                      </label>
                      {isNameValid && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                          className={`absolute top-2 ${isRTL ? "left-3" : "right-3"}`}
                        >
                          <UiIcon icon="solar:check-circle-bold" size={16} tone="success" />
                        </motion.div>
                      )}
                      <input
                        id="client-name"
                        ref={nameInputRef}
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        onFocus={() => setDetailsJourneyActive(true)}
                        onBlur={() => setNameTouched(true)}
                        aria-invalid={nameTouched && !isNameValid}
                        placeholder={t.namePlaceholder}
                        className="w-full h-14 rounded-xl bg-transparent px-3.5 pt-6 pb-2 text-base text-foreground placeholder:text-muted-foreground/60 outline-none"
                      />
                    </div>
                    <div className="min-h-6">
                      {nameTouched && !isNameValid ? (
                        <p className="text-xs leading-4 text-destructive">{t.nameRequired}</p>
                      ) : (
                        <p aria-hidden="true" className="text-xs leading-4 opacity-0 select-none">.</p>
                      )}
                    </div>
                  </div>

                  {/* Phone input */}
                  <div className="space-y-1.5">
                    <div className={`relative overflow-hidden rounded-xl border bg-background/50 backdrop-blur-sm transition-all duration-300 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] ${
                          phoneTouched && !isPhoneValid
                            ? "border-destructive focus-within:border-destructive"
                            : "border-border/60 focus-within:border-primary"
                        }`}>
                      <label
                        htmlFor="client-phone"
                        className={`absolute top-2 inline-flex max-w-[calc(100%-3rem)] items-center gap-1.5 text-[11px] font-semibold text-foreground/78 ${
                          isRTL ? "right-3" : "left-3"
                        }`}
                        style={isRTL ? { direction: "ltr", unicodeBidi: "isolate" } : undefined}
                      >
                        <span className="order-1 inline-flex items-center">
                          <UiIcon
                            icon="solar:phone-calling-rounded-bold-duotone"
                            size={16}
                            tone={isPhoneValid ? "success" : "muted"}
                            className={isRTL ? "-scale-x-100" : ""}
                          />
                        </span>
                        <span
                          className={`order-2 leading-none ${isRTL ? "text-right" : ""}`}
                          dir={isRTL ? "rtl" : undefined}
                        >
                          {t.phoneLabel}
                        </span>
                      </label>
                      {isPhoneValid && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                          className={`absolute top-2 ${isRTL ? "left-3" : "right-3"}`}
                        >
                          <UiIcon icon="solar:check-circle-bold" size={16} tone="success" />
                        </motion.div>
                      )}
                      <input
                        id="client-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        spellCheck={false}
                        aria-invalid={phoneTouched && !isPhoneValid}
                        aria-describedby="client-phone-help"
                        dir="ltr"
                        value={formattedPhoneValue}
                        onChange={(e) => {
                          setClientPhone(normalizeMoroccanPhone(e.target.value));
                        }}
                        onFocus={() => setDetailsJourneyActive(true)}
                        onBlur={() => setPhoneTouched(true)}
                        placeholder={t.phonePlaceholder}
                        maxLength={14}
                        className="w-full h-14 rounded-xl bg-transparent px-3.5 pt-6 pb-2 text-base tracking-[0.02em] text-foreground placeholder:text-muted-foreground/60 outline-none"
                      />
                    </div>
                    <div id="client-phone-help" className="min-h-6">
                      {phoneTouched && !isPhoneValid ? (
                        <p className="text-xs leading-4 text-destructive">{t.phoneRequired}</p>
                      ) : (
                        <p className="text-xs leading-4 text-muted-foreground/80">{t.phoneHint}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Summary Card ── */}
        <AnimatePresence>
          {selectedDate && selectedTime && isFormValid && (
            <motion.div
              ref={summarySectionRef}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9], delay: 0.1 }}
              className="w-full max-w-sm mx-auto mb-6 sm:mb-5"
            >
              <div className="relative rounded-3xl border border-white/35 dark:border-white/20 bg-[linear-gradient(135deg,hsl(var(--background)/0.56),hsl(var(--primary)/0.11)_54%,hsl(var(--accent)/0.08))] backdrop-blur-3xl backdrop-saturate-150 shadow-[0_20px_44px_hsl(var(--foreground)/0.18),0_8px_18px_hsl(var(--foreground)/0.1)] overflow-hidden">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/28 via-white/7 to-transparent dark:from-white/12 dark:via-white/5" />
                <div className="absolute left-4 right-4 top-[2px] h-[1px] pointer-events-none bg-gradient-to-r from-transparent via-white/85 to-transparent dark:via-white/45" />
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(120%_90%_at_20%_0%,rgba(255,255,255,0.40),rgba(255,255,255,0)_58%)] dark:bg-[radial-gradient(120%_90%_at_20%_0%,rgba(255,255,255,0.16),rgba(255,255,255,0)_58%)]" />
                <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-white/35 dark:ring-white/15" />
                {!prefersReducedMotion && (
                  <motion.div
                    aria-hidden="true"
                    className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-primary/70 to-transparent"
                    animate={{ opacity: [0.35, 0.7, 0.35], scaleX: [0.96, 1, 0.96] }}
                    transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}

                <div className="relative p-4">
                  <div className="space-y-2">
                    <div className="rounded-2xl border border-white/24 dark:border-white/10 p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] flex items-center justify-center shrink-0">
                          <UiIcon icon="solar:user-bold-duotone" size={20} tone="primary" />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className={`text-[11px] leading-[1.15] font-medium uppercase ${isRTL ? "tracking-normal" : "tracking-[0.11em]"} text-muted-foreground/72`}>
                            {t.step3}
                          </p>
                          <p className="mt-1 text-[15px] leading-[1.35] font-semibold text-foreground break-words">{clientName}</p>
                          <p className="mt-1 text-[13px] leading-[1.3] text-muted-foreground break-all" dir="ltr">
                            {formatMoroccanPhoneDisplay(clientPhone)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/20 dark:border-white/10 p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/18 to-primary/8 border border-primary/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center shrink-0">
                          <UiIcon icon="solar:calendar-date-bold-duotone" size={20} tone="primary" />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className={`text-[11px] leading-[1.15] font-medium uppercase ${isRTL ? "tracking-normal" : "tracking-[0.11em]"} text-muted-foreground/72`}>
                            {t.step1}
                          </p>
                          <p className="mt-1 text-[15px] leading-[1.35] font-semibold text-foreground break-words">
                            {formatDate(selectedDate, "EEEE, MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/20 dark:border-white/10 p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/8 border border-accent/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center shrink-0">
                          <UiIcon icon="solar:clock-circle-bold-duotone" size={20} tone="accent" />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p className={`text-[11px] leading-[1.15] font-medium uppercase ${isRTL ? "tracking-normal" : "tracking-[0.11em]"} text-muted-foreground/72`}>
                            {t.step2}
                          </p>
                          <p className="mt-1 text-[15px] leading-[1.35] font-semibold text-foreground break-words">
                            {selectedTime}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile bottom journey card ── */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        <div className="max-w-sm mx-auto">
          <div className={`relative overflow-hidden rounded-[22px] border border-white/[0.1] backdrop-blur-[20px] backdrop-saturate-150 shadow-[0_18px_36px_-20px_hsl(var(--foreground)/0.56)] ${journeyCardToneClass}`}>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent" />
            <div className="absolute left-4 right-4 top-0 h-px pointer-events-none bg-white/[0.05]" />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_1px_16px_rgba(255,255,255,0.03)]" />
            <div className="relative min-h-[62px] px-5 py-[9px] max-[360px]:px-4">
              <div className={`grid min-h-[58px] grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] items-center gap-4 max-[360px]:gap-3 ${isRTL ? "text-right" : "text-left"}`}>
                <div className="min-w-0">
                  <AnimatePresence mode="wait" initial={false}>
                    {journeyState === "start" && (
                      <motion.div
                        key="journey-left-start"
                        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`flex min-h-[44px] items-center gap-2.5 max-[360px]:gap-2 ${isRTL ? "flex-row-reverse justify-end" : ""}`}
                      >
                        <motion.span
                          aria-hidden="true"
                          className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-teal-300"
                          animate={shouldShowPulseDot ? { scale: [1, 1.08, 1], opacity: [0.88, 1, 0.88] } : { scale: 1, opacity: 1 }}
                          transition={shouldShowPulseDot ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
                        >
                          <span className="h-2 w-2 rounded-full bg-teal-300" />
                        </motion.span>
                        <span className="flex-1 min-w-0 truncate text-[13px] font-medium leading-5 text-white/[0.6]">
                          {t.journeyPromptStart}
                        </span>
                      </motion.div>
                    )}

                    {journeyState === "time" && (
                      <motion.button
                        key="journey-left-time"
                        type="button"
                        aria-label={t.journeyEditDateAria}
                        onClick={() => handleProgressStepClick(1)}
                        initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                        transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 25 }}
                        className={`flex min-h-[44px] w-full items-center gap-2.5 max-[360px]:gap-2 rounded-[11px] px-1.5 py-1 text-white/[0.96] transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                          isRTL ? "flex-row-reverse justify-end text-right" : "text-left"
                        }`}
                      >
                        <span aria-hidden="true" className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-teal-300">
                          <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                            <path d="M2.2 6.1L4.7 8.5L9.7 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="flex-1 min-w-0 truncate text-[12px] font-medium text-white" dir="ltr">{journeySummaryLabel}</span>
                      </motion.button>
                    )}

                    {journeyState === "confirm-details" && (
                      <motion.button
                        key="journey-left-confirm-details"
                        type="button"
                        aria-label={t.journeyEditDateAria}
                        onClick={() => handleProgressStepClick(1)}
                        initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                        transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 25 }}
                        className={`flex min-h-[44px] w-full items-center gap-2.5 max-[360px]:gap-2 rounded-[11px] px-1.5 py-1 text-white/[0.96] transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/20 ${
                          isRTL ? "flex-row-reverse justify-end text-right" : "text-left"
                        }`}
                      >
                        <span aria-hidden="true" className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-teal-300">
                          <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                            <path d="M2.2 6.1L4.7 8.5L9.7 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="flex-1 min-w-0 truncate text-[12px] font-medium text-white" dir="ltr">{journeySummaryLabel}</span>
                      </motion.button>
                    )}

                    {journeyState === "details" && (
                      <motion.div
                        key="journey-left-details"
                        initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                        transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 25 }}
                        className={`flex min-h-[44px] w-full items-center gap-2.5 max-[360px]:gap-2 rounded-[11px] px-1.5 py-1 ${
                          isRTL ? "flex-row-reverse justify-end text-right" : "text-left"
                        }`}
                      >
                        <span aria-hidden="true" className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-teal-300">
                          <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5">
                            <path d="M2.2 6.1L4.7 8.5L9.7 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        <span className="flex-1 min-w-0 truncate text-[12px] font-medium text-white" dir="ltr">{journeySummaryLabel}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div aria-hidden="true" className="h-10 w-px justify-self-center rounded-full bg-white/[0.08]" />

                <div className="min-w-0 flex items-center">
                  <AnimatePresence mode="wait" initial={false}>
                    {journeyState === "start" && (
                      <motion.span
                        key="journey-right-empty"
                        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="h-11 w-full"
                        aria-hidden="true"
                      />
                    )}

                    {journeyState === "time" && (
                      <motion.button
                        key="journey-right-time"
                        type="button"
                        onClick={jumpToTimeSection}
                        initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: isRTL ? -8 : 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: isRTL ? 6 : -6 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`relative inline-flex h-10 max-w-full items-center gap-1.5 rounded-[11px] bg-[hsl(177,58%,46%)] px-4 max-[360px]:px-3 text-[12px] font-semibold text-white/[0.88] shadow-[0_10px_18px_hsl(176_52%_28%/0.36)] ${
                          isRTL ? "mr-auto ml-0 flex-row-reverse" : "ml-auto mr-0"
                        }`}
                      >
                        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[11px] bg-white/[0.1]" />
                        <span className="flex-1 min-w-0 truncate">{t.journeyNextTime}</span>
                        <ThinArrow className={`h-3.5 w-3.5 shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                      </motion.button>
                    )}

                    {journeyState === "confirm-details" && (
                      <motion.button
                        key="journey-right-confirm-details"
                        type="button"
                        onClick={jumpToDetailsSection}
                        initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: isRTL ? -8 : 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: isRTL ? 6 : -6 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`relative inline-flex h-10 max-w-full items-center gap-1.5 rounded-[11px] bg-[hsl(177,58%,46%)] px-4 max-[360px]:px-3 text-[12px] font-semibold text-white/[0.88] shadow-[0_10px_18px_hsl(176_52%_28%/0.36)] ${
                          isRTL ? "mr-auto ml-0 flex-row-reverse" : "ml-auto mr-0"
                        }`}
                      >
                        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[11px] bg-white/[0.1]" />
                        <span className="flex-1 min-w-0 truncate">{t.journeyConfirmDetails}</span>
                        <ThinArrow className={`h-3.5 w-3.5 shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                      </motion.button>
                    )}

                    {journeyState === "details" && (
                      <motion.button
                        key={`journey-right-book-${canConfirm ? "ready" : "pending"}`}
                        type="button"
                        onClick={handleConfirm}
                        disabled={!canConfirm || isConfirming}
                        initial={prefersReducedMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: isRTL ? -8 : 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: isRTL ? 6 : -6 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`relative inline-flex h-11 max-w-full items-center gap-1.5 rounded-[12px] px-5 max-[360px]:px-3 text-[13px] font-semibold transition-all ${
                          canConfirm
                            ? "bg-[hsl(177,74%,50%)] text-white/[0.9] shadow-[0_12px_22px_hsl(176_64%_34%/0.48)]"
                            : "bg-white/[0.12] text-white/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                        } ${isRTL ? "mr-auto ml-0 flex-row-reverse" : "ml-auto mr-0"} disabled:cursor-not-allowed`}
                      >
                        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[12px] bg-white/[0.1]" />
                        {canConfirm && !prefersReducedMotion && (
                          <motion.span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 rounded-[12px] bg-[linear-gradient(115deg,transparent_22%,rgba(255,255,255,0.05)_50%,transparent_78%)]"
                            initial={{ x: isRTL ? "130%" : "-130%" }}
                            animate={{ x: isRTL ? "-130%" : "130%" }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        )}
                        <span className="relative z-10 flex-1 min-w-0 truncate">{t.journeyBookNow}</span>
                        <ThinArrow className={`relative z-10 h-3.5 w-3.5 shrink-0 ${isRTL ? "rotate-180" : ""}`} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Desktop fixed bottom CTA (unchanged behavior) ── */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="hidden sm:block fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-xl"
      >
        <div className="max-w-sm mx-auto">
          {!canConfirm && (
            <p className="text-[11px] text-center mb-2 font-medium text-muted-foreground">
              {ctaHint}
            </p>
          )}
          <motion.button
            whileHover={canConfirm ? { scale: 1.02 } : undefined}
            whileTap={canConfirm ? { scale: 0.97 } : undefined}
            animate={
              canConfirm
                ? { boxShadow: ["0 0 20px hsl(var(--primary)/0.3)", "0 0 40px hsl(var(--primary)/0.5)", "0 0 20px hsl(var(--primary)/0.3)"] }
                : undefined
            }
            transition={canConfirm ? { duration: 2, repeat: Infinity, ease: "easeInOut" } : undefined}
            disabled={!canConfirm || isConfirming}
            onClick={handleConfirm}
            className="relative w-full group overflow-hidden disabled:cursor-not-allowed"
          >
            {canConfirm && (
              <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] bg-[length:200%_auto] animate-gradient" />
            )}
            <div
              className={`relative flex items-center justify-center gap-3 w-full h-14 font-semibold text-base rounded-2xl overflow-hidden transition-colors ${
                canConfirm
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground border border-border/60"
              }`}
            >
              {canConfirm && (
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              )}
              <UiIcon
                icon="solar:star-shine-bold-duotone"
                size={20}
                className={`relative z-10 ${canConfirm ? "text-background" : "text-muted-foreground opacity-50"}`}
              />
              <span className="relative z-10">{t.confirm}</span>
              <motion.div
                className="relative z-10"
                animate={canConfirm ? { x: isRTL ? [0, -4, 0] : [0, 4, 0] } : undefined}
                transition={canConfirm ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : undefined}
              >
                <UiIcon
                  icon="solar:arrow-right-linear"
                  size={16}
                  className={`${isRTL ? "rotate-180" : ""} ${canConfirm ? "text-background" : "text-muted-foreground opacity-60"}`}
                />
              </motion.div>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Time Group Component (Bug 1 fix: forwardRef) ── */
interface TimeGroupProps {
  label: string;
  icon: React.ReactNode;
  slots: typeof timeSlots;
  selectedTime: string | null;
  onSelect: (time: string) => void;
  activeFeedbackTime: string | null;
  isSelectionFeedbackActive: boolean;
  feedbackPulseId: number;
  prefersReducedMotion: boolean;
  isRTL: boolean;
  delayOffset: number;
}

const TimeGroup = forwardRef<HTMLDivElement, TimeGroupProps>(
  (
    {
      label,
      icon,
      slots,
      selectedTime,
      onSelect,
      activeFeedbackTime,
      isSelectionFeedbackActive,
      feedbackPulseId,
      prefersReducedMotion,
      isRTL,
      delayOffset,
    },
    ref
  ) => (
    <div ref={ref}>
      <div className="flex items-center gap-2 mb-2.5">
        {icon}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {slots.map((slot, i) => {
          const isSelected = selectedTime === slot.time;
          const isFeedbackTarget = isSelectionFeedbackActive && activeFeedbackTime === slot.time;
          const shouldDeEmphasize = isSelectionFeedbackActive && activeFeedbackTime !== slot.time;
          return (
            <motion.button
              key={slot.time}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={
                isFeedbackTarget && !prefersReducedMotion
                  ? { opacity: 1, scale: [1, 1.05, 1] }
                  : { opacity: 1, scale: 1 }
              }
              transition={
                isFeedbackTarget && !prefersReducedMotion
                  ? { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
                  : { duration: 0.3, delay: 0.1 + (delayOffset + i) * 0.06 }
              }
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              onClick={() => onSelect(slot.time)}
              className={`relative overflow-hidden rounded-lg min-h-[44px] py-2 px-1.5 text-center transition-all duration-200 border backdrop-blur-sm transform-gpu ${
                isSelected
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground border-primary/75 shadow-[0_0_0_1px_hsl(var(--primary)/0.45),0_8px_18px_hsl(var(--primary)/0.28)]"
                  : "bg-card/70 border-border/45 text-foreground/80 hover:border-primary/45 hover:bg-card/85"
              } ${shouldDeEmphasize ? "opacity-80 scale-[0.98]" : ""}`}
            >
              <AnimatePresence>
                {isSelected && isFeedbackTarget && !prefersReducedMotion && (
                  <motion.span
                    key={`time-glow-${slot.time}-${feedbackPulseId}`}
                    aria-hidden="true"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: [0.15, 0.82, 0], scale: [0.95, 1.05, 1.08] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
                    className="pointer-events-none absolute inset-0 rounded-lg border border-primary-foreground/70 shadow-[0_0_0_1px_hsl(var(--primary)/0.45),0_0_16px_hsl(var(--primary)/0.35)]"
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {isSelected && isFeedbackTarget && !prefersReducedMotion && (
                  <motion.span
                    key={`time-shimmer-${slot.time}-${feedbackPulseId}`}
                    aria-hidden="true"
                    initial={{ x: isRTL ? "120%" : "-120%", opacity: 0 }}
                    animate={{ x: isRTL ? "-120%" : "120%", opacity: [0, 0.45, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="pointer-events-none absolute inset-y-0 w-7 bg-gradient-to-r from-transparent via-white/45 to-transparent"
                  />
                )}
              </AnimatePresence>
              <span className={`tabular-nums leading-none ${isSelected ? "text-[13px] font-bold" : "text-[13px] font-semibold"}`}>
                {slot.time}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  )
);

TimeGroup.displayName = "TimeGroup";

export default Appointment;
