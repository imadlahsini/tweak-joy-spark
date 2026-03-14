import { useState, useRef, useEffect, useMemo, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, useReducedMotion } from "framer-motion";
import { CalendarDays, Clock, Sparkles, Check, Sun, CloudSun, ArrowRight, ChevronRight, ChevronLeft, User, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import FloatingOrb from "@/components/shared/FloatingOrb";
import Navbar from "@/components/landing/Navbar";
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
    summaryTitle: "Your Appointment",
    duration: "1h • In-person",
    at: "at",
    yourDetails: "Your Details",
    nameLabel: "Full Name",
    namePlaceholder: "Enter your name",
    phoneLabel: "Phone Number",
    phonePlaceholder: "6XX XXX XXX",
    nameRequired: "Name is required (min 2 characters)",
    phoneRequired: "Enter a valid Moroccan mobile number",
    phoneHint: "Start with 6 or 7 (9 digits)",
    edit: "Edit",
    ctaHintDate: "Choose a date to continue",
    ctaHintTime: "Pick a time to continue",
    ctaHintDetails: "Enter your details to confirm",
    ctaTrust: "1h • In-person • Instant confirmation",
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
    summaryTitle: "Votre Rendez-vous",
    duration: "1h • En personne",
    at: "à",
    yourDetails: "Vos Informations",
    nameLabel: "Nom Complet",
    namePlaceholder: "Entrez votre nom",
    phoneLabel: "Numéro de Téléphone",
    phonePlaceholder: "6XX XXX XXX",
    nameRequired: "Le nom est requis (min 2 caractères)",
    phoneRequired: "Entrez un numéro mobile marocain valide",
    phoneHint: "Commencez par 6 ou 7 (9 chiffres)",
    edit: "Modifier",
    ctaHintDate: "Choisissez une date pour continuer",
    ctaHintTime: "Choisissez une heure pour continuer",
    ctaHintDetails: "Entrez vos informations pour confirmer",
    ctaTrust: "1h • En personne • Confirmation immédiate",
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
    summaryTitle: "موعدك",
    duration: "ساعة • حضوري",
    at: "في",
    yourDetails: "بياناتك",
    nameLabel: "الاسم الكامل",
    namePlaceholder: "أدخل اسمك",
    phoneLabel: "رقم الهاتف",
    phonePlaceholder: "6XX XXX XXX",
    nameRequired: "الاسم مطلوب (حرفان على الأقل)",
    phoneRequired: "أدخل رقم هاتف مغربي صحيح",
    phoneHint: "يبدأ بـ 6 أو 7 (9 أرقام)",
    edit: "تعديل",
    ctaHintDate: "اختر التاريخ للمتابعة",
    ctaHintTime: "اختر الوقت للمتابعة",
    ctaHintDetails: "أدخل بياناتك للتأكيد",
    ctaTrust: "ساعة • حضوري • تأكيد فوري",
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

const normalizeMoroccanPhone = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) return "";

  let normalized = digitsOnly;

  if (normalized.startsWith("00212")) {
    normalized = normalized.slice(5);
  } else if (normalized.startsWith("212")) {
    normalized = normalized.slice(3);
  }

  if (normalized.startsWith("0")) {
    normalized = normalized.slice(1);
  }

  return normalized.slice(0, 9);
};

const formatMoroccanPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
};

const formatMoroccanPhoneDisplay = (value: string) => {
  const formatted = formatMoroccanPhone(value);
  return formatted ? `+212 ${formatted}` : "+212";
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

const Appointment = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
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
  const initialScrollLeftRef = useRef<number | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const orbX1 = useTransform(mouseX, [-500, 500], [-20, 20]);
  const orbY1 = useTransform(mouseY, [-500, 500], [-20, 20]);
  const orbX2 = useTransform(mouseX, [-500, 500], [15, -15]);
  const orbY2 = useTransform(mouseY, [-500, 500], [10, -10]);

  const t = translations[(language as "en" | "fr" | "ar") || "en"];
  const isRTL = language === "ar";
  const dateLocale = language === "fr" ? fr : language === "ar" ? arSA : undefined;

  const isNameValid = clientName.trim().length >= 2;
  const isPhoneValid = /^(6|7)\d{8}$/.test(clientPhone);
  const isFormValid = isNameValid && isPhoneValid;
  const formattedPhoneValue = formatMoroccanPhone(clientPhone);
  const currentStep = !selectedDate ? 1 : !selectedTime ? 2 : !isFormValid ? 3 : 4;
  const progressStep = Math.min(currentStep, 3);
  const isDateCollapsed = Boolean(selectedDate) && currentStep > 1;
  const isTimeCollapsed = Boolean(selectedDate && selectedTime) && currentStep > 2;
  const canConfirm = Boolean(selectedDate && selectedTime && isFormValid);
  const ctaHint = !selectedDate ? t.ctaHintDate : !selectedTime ? t.ctaHintTime : t.ctaHintDetails;
  const progressItems = [
    { id: 1, label: t.step1, icon: CalendarDays },
    { id: 2, label: t.step2, icon: Clock },
    { id: 3, label: t.step3, icon: User },
  ] as const;
  const getConnectorState = (nextStepId: number): StepConnectorState => {
    if (currentStep > nextStepId) return "completed";
    if (currentStep === nextStepId) return "active";
    return "pending";
  };
  const canNavigateToStep = (stepId: number) => {
    if (stepId === 1) return currentStep > 1;
    if (stepId === 2) return Boolean(selectedDate) && currentStep > 2;
    if (stepId === 3) return Boolean(selectedDate && selectedTime);
    return false;
  };

  // Bug 2 fix: compute dates inside component with useMemo
  const next14Days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)), []);

  // Auto-scroll to time section when date selected
  useEffect(() => {
    if (selectedDate && timeSectionRef.current) {
      setTimeout(() => {
        timeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [selectedDate]);

  // Auto-scroll to details section when time selected
  useEffect(() => {
    if (selectedDate && selectedTime) {
      setTimeout(() => {
        detailsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => nameInputRef.current?.focus(), 300);
      }, 600);
    }
  }, [selectedTime]);

  // Auto-scroll to summary when form is valid
  useEffect(() => {
    if (isFormValid && summarySectionRef.current) {
      setTimeout(() => {
        summarySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [isFormValid]);

  // Sparkle burst when form becomes valid
  useEffect(() => {
    if (isFormValid) {
      setShowSparkles(true);
      const timer = setTimeout(() => setShowSparkles(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isFormValid]);

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

  const morningSlots = timeSlots.filter((s) => s.period === "morning");
  const afternoonSlots = timeSlots.filter((s) => s.period === "afternoon");

  const formatDate = (date: Date, pattern: string) => format(date, pattern, { locale: dateLocale });

  const handleConfirm = () => {
    if (!isNameValid) setNameTouched(true);
    if (!isPhoneValid) setPhoneTouched(true);

    if (selectedDate && selectedTime && isFormValid) {
      navigate("/appointment/confirmation", {
        state: {
          clientName,
          clientPhone,
          selectedDate: selectedDate.toISOString(),
          selectedTime,
        },
      });
    }
  };

  const handleProgressStepClick = (step: number) => {
    if (step === 1 && currentStep > 1) {
      setSelectedDate(undefined);
      setSelectedTime(null);
      dateSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (step === 2 && selectedDate && currentStep > 2) {
      setSelectedTime(null);
      timeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (step === 3 && selectedDate && selectedTime) {
      detailsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
      <div className="absolute inset-0 overflow-hidden">
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

      <div className="absolute inset-0 dot-grid opacity-25 sm:opacity-40" />

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
        <div className="relative text-center mb-3 sm:mb-5">
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
                const Icon = step.icon;
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
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
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
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center border border-primary/20">
                <CalendarDays className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-bold text-foreground">{t.selectDate}</span>
            </div>

            {isDateCollapsed && selectedDate ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(undefined);
                  setSelectedTime(null);
                  dateSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="w-full mt-1 rounded-2xl border border-primary/25 bg-primary/10 px-3 py-3 flex items-center justify-between gap-3 text-left"
              >
                <div className="min-w-0">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-primary/80">{t.step1}</p>
                  <p className="text-sm font-semibold text-foreground break-words">{formatDate(selectedDate, "EEEE, MMM d, yyyy")}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary shrink-0">
                  {t.edit}
                  {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </span>
              </button>
            ) : (
              <>
                {/* Horizontal day slider with scroll indicators */}
                <div className="relative -mx-8 px-8">
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
                      const isSelected = selectedDate ? isSameDay(selectedDate, day) : false;
                      const today = isToday(day);
                      return (
                        <motion.button
                          key={day.toISOString()}
                          initial={{ opacity: 0, scale: 0.8, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.04 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => {
                            setSelectedDate(day);
                            setSelectedTime(null);
                          }}
                          className={`relative flex-shrink-0 snap-center flex flex-col items-center justify-center w-[60px] h-[76px] rounded-2xl border transition-all duration-300 ${
                            isSelected
                              ? "bg-gradient-to-br from-primary to-accent border-primary/60 text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.45)]"
                              : today
                              ? "bg-card/80 border-accent/50 text-foreground hover:border-accent/70"
                              : "bg-card/50 border-border/30 text-foreground hover:border-primary/30 hover:bg-card/70"
                          }`}
                        >
                          {today && !isSelected && (
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent" />
                          )}
                          <span className={`text-xs font-medium uppercase tracking-wider ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                            {formatDate(day, "EEE")}
                          </span>
                          <span className={`text-xl font-bold leading-tight ${isSelected ? "text-primary-foreground" : ""}`}>
                            {formatDate(day, "d")}
                          </span>
                          <span className={`text-[11px] font-medium ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground/70"}`}>
                            {formatDate(day, "MMM")}
                          </span>
                          <AnimatePresence>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, rotate: -90 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 90 }}
                                transition={{ type: "spring", stiffness: 500, damping: 20 }}
                                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent border-2 border-background flex items-center justify-center z-20"
                              >
                                <Check className="w-3 h-3 text-accent-foreground" />
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
                        <Check className="w-3.5 h-3.5" />
                        {formatDate(selectedDate, "EEEE, MMM d, yyyy")}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        </motion.div>

        {/* ── Step 2: Time Slots — Glass Card ── */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              ref={timeSectionRef}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] }}
              className="w-full max-w-sm mx-auto mb-5"
            >
              <div className="relative bg-card/60 backdrop-blur-2xl border border-border/30 rounded-2xl p-4 sm:p-5 overflow-hidden shadow-soft">
                {/* Top gradient accent line */}
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

                {/* Section label */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center border border-accent/20">
                    <Clock className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm font-bold text-foreground">{t.selectTime}</span>
                </div>

                {isTimeCollapsed && selectedTime ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTime(null);
                      timeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="w-full mt-1 rounded-2xl border border-accent/25 bg-accent/10 px-3 py-3 flex items-center justify-between gap-3 text-left"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium uppercase tracking-wide text-accent/80">{t.step2}</p>
                      <p className="text-sm font-semibold text-foreground break-words">{selectedTime}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent shrink-0">
                      {t.edit}
                      {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                ) : (
                  <>
                    {/* Morning */}
                    <TimeGroup
                      label={t.morning}
                      icon={<Sun className="w-3.5 h-3.5 text-primary" />}
                      slots={morningSlots}
                      selectedTime={selectedTime}
                      onSelect={setSelectedTime}
                      delayOffset={0}
                    />

                    {/* Gradient divider */}
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

                    {/* Afternoon */}
                    <TimeGroup
                      label={t.afternoon}
                      icon={<CloudSun className="w-3.5 h-3.5 text-accent" />}
                      slots={afternoonSlots}
                      selectedTime={selectedTime}
                      onSelect={setSelectedTime}
                      delayOffset={4}
                    />
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Step 3: Your Details — Glass Card ── */}
        <AnimatePresence>
          {selectedDate && selectedTime && (
            <motion.div
              ref={detailsSectionRef}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] }}
              className="w-full max-w-sm mx-auto mb-5"
            >
              <div className="relative bg-card/60 backdrop-blur-2xl border border-border/30 rounded-2xl p-4 sm:p-5 overflow-hidden shadow-soft">
                {/* Top gradient accent line */}
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

                {/* Section label */}
                <div className="flex items-center gap-2.5 mb-5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center border border-primary/20">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-bold text-foreground">{t.yourDetails}</span>
                </div>

                {/* Name input */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      {t.nameLabel}
                      {isNameValid && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                        >
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        </motion.div>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        ref={nameInputRef}
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        onBlur={() => setNameTouched(true)}
                        placeholder={t.namePlaceholder}
                        className={`w-full h-12 rounded-xl bg-background/50 backdrop-blur-sm border px-4 text-base text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] ${
                          nameTouched && !isNameValid
                            ? "border-destructive focus:border-destructive"
                            : "border-border/60 focus:border-primary"
                        }`}
                      />
                    </div>
                    <div className="min-h-[18px]">
                      {nameTouched && !isNameValid ? (
                        <p className="text-xs text-destructive">{t.nameRequired}</p>
                      ) : (
                        <p aria-hidden="true" className="text-xs opacity-0 select-none">.</p>
                      )}
                    </div>
                  </div>

                  {/* Phone input */}
                  <div className="space-y-2">
                    <label htmlFor="client-phone" className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      {t.phoneLabel}
                      {isPhoneValid && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                        >
                          <Check className="w-3.5 h-3.5 text-green-500" />
                        </motion.div>
                      )}
                    </label>
                    <div className={`relative flex items-center h-12 rounded-xl bg-background/60 backdrop-blur-sm border overflow-hidden transition-all duration-300 focus-within:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] ${
                          phoneTouched && !isPhoneValid
                            ? "border-destructive focus-within:border-destructive"
                            : "border-border/60 focus-within:border-primary"
                        }`} dir="ltr">
                      <div className="flex items-center gap-1.5 px-3.5 h-full border-r border-border/45 bg-gradient-to-b from-muted/55 to-muted/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] select-none shrink-0">
                        <span className="text-base leading-none">🇲🇦</span>
                        <span className="text-sm font-semibold text-foreground/85 tracking-[0.01em]">+212</span>
                      </div>
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
                        onBlur={() => setPhoneTouched(true)}
                        placeholder={t.phonePlaceholder}
                        maxLength={11}
                        className="flex-1 h-full px-3.5 text-base tracking-[0.02em] text-foreground bg-transparent placeholder:text-muted-foreground/55 outline-none"
                      />
                    </div>
                    <div id="client-phone-help" className="min-h-[18px]">
                      {phoneTouched && !isPhoneValid ? (
                        <p className="text-xs text-destructive">{t.phoneRequired}</p>
                      ) : (
                        <p className="text-xs text-muted-foreground/80">{t.phoneHint}</p>
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
                    <div className="rounded-2xl border border-white/35 dark:border-white/16 bg-background/42 dark:bg-background/28 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.24)]">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] flex items-center justify-center shrink-0">
                          <User className="w-[18px] h-[18px] text-primary" />
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

                    <div className="rounded-2xl border border-white/30 dark:border-white/14 bg-background/38 dark:bg-background/25 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/18 to-primary/8 border border-primary/18 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center shrink-0">
                          <CalendarDays className="w-[18px] h-[18px] text-primary" />
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

                    <div className="rounded-2xl border border-white/30 dark:border-white/14 bg-background/38 dark:bg-background/25 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/8 border border-accent/24 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] flex items-center justify-center shrink-0">
                          <Clock className="w-[18px] h-[18px] text-accent" />
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

      {/* ── Mobile bottom rail: progress -> CTA swap ── */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        <div className="max-w-sm mx-auto">
          <div className="relative rounded-3xl border border-white/35 dark:border-white/20 bg-[linear-gradient(135deg,hsl(var(--background)/0.46),hsl(var(--primary)/0.12)_52%,hsl(var(--accent)/0.10))] backdrop-blur-3xl backdrop-saturate-150 shadow-[0_24px_56px_hsl(var(--foreground)/0.22),0_10px_24px_hsl(var(--foreground)/0.14)] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/35 via-white/10 to-transparent dark:from-white/16 dark:via-white/6" />
            <div className="absolute left-3 right-3 top-[2px] h-[1px] pointer-events-none bg-gradient-to-r from-transparent via-white/85 to-transparent dark:via-white/45" />
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(120%_90%_at_20%_0%,rgba(255,255,255,0.45),rgba(255,255,255,0)_55%)] dark:bg-[radial-gradient(120%_90%_at_20%_0%,rgba(255,255,255,0.22),rgba(255,255,255,0)_55%)]" />
            <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-white/38 dark:ring-white/16" />
            <AnimatePresence mode="wait" initial={false}>
              {canConfirm ? (
                <motion.div
                  key="mobile-confirm"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="relative p-2.5"
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  animate={{
                    boxShadow: [
                        "0 0 20px hsl(var(--primary)/0.3)",
                        "0 0 40px hsl(var(--primary)/0.5)",
                        "0 0 20px hsl(var(--primary)/0.3)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    onClick={handleConfirm}
                    className="relative w-full group overflow-hidden"
                  >
                    <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-70 transition-opacity duration-300 blur-[2px] bg-[length:200%_auto] animate-gradient" />
                    <div className="relative flex min-h-[56px] items-center justify-center gap-3 w-full font-semibold text-base rounded-2xl overflow-hidden transition-colors bg-foreground text-background">
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <Sparkles className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">{t.confirm}</span>
                      <motion.div
                        className="relative z-10"
                        animate={{ x: isRTL ? [0, -4, 0] : [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                      </motion.div>
                    </div>
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="mobile-progress"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="relative p-2.5"
                >
                  <div className="mx-auto flex w-fit items-center justify-center gap-1.5">
                    {progressItems.map((step, index) => {
                      const Icon = step.icon;
                      const isCompleted = currentStep > step.id;
                      const isActive = progressStep === step.id;
                      const canJump = canNavigateToStep(step.id);
                      const connectorState =
                        index < progressItems.length - 1 ? getConnectorState(progressItems[index + 1].id) : null;
                      return (
                        <div key={`mobile-${step.id}`} className="flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => handleProgressStepClick(step.id)}
                            disabled={!canJump}
                            aria-label={step.label}
                            className={`w-12 h-12 min-h-[48px] rounded-full border flex items-center justify-center transition-colors ${
                              isCompleted
                                ? "bg-primary border-primary text-primary-foreground shadow-[0_0_16px_hsl(var(--primary)/0.32)]"
                                : isActive
                                ? "bg-primary/12 border-primary/90 text-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.14)]"
                                : "bg-white/40 dark:bg-white/5 border-white/50 dark:border-white/20 text-foreground/75 dark:text-foreground/70"
                            } ${canJump ? "hover:border-primary/50" : "cursor-default"} ${
                              !canJump && !isActive ? "opacity-85" : ""
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                          </button>
                          {connectorState && (
                            <StepConnector
                              state={connectorState}
                              isRTL={isRTL}
                              reducedMotion={Boolean(prefersReducedMotion)}
                              className="mx-1.5 w-10 shrink-0"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
            disabled={!canConfirm}
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
              <Sparkles className={`w-5 h-5 relative z-10 ${canConfirm ? "" : "opacity-50"}`} />
              <span className="relative z-10">{t.confirm}</span>
              <motion.div
                className="relative z-10"
                animate={canConfirm ? { x: isRTL ? [0, -4, 0] : [0, 4, 0] } : undefined}
                transition={canConfirm ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : undefined}
              >
                <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
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
  delayOffset: number;
}

const TimeGroup = forwardRef<HTMLDivElement, TimeGroupProps>(
  ({ label, icon, slots, selectedTime, onSelect, delayOffset }, ref) => (
    <div ref={ref}>
      <div className="flex items-center gap-2 mb-2.5">
        {icon}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {slots.map((slot, i) => {
          const isSelected = selectedTime === slot.time;
          return (
            <motion.button
              key={slot.time}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 + (delayOffset + i) * 0.06 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(slot.time)}
              className={`rounded-lg min-h-[44px] py-2 px-1.5 text-center transition-all duration-200 border backdrop-blur-sm ${
                isSelected
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground border-primary/75 shadow-[0_0_0_1px_hsl(var(--primary)/0.45),0_8px_18px_hsl(var(--primary)/0.28)]"
                  : "bg-card/70 border-border/45 text-foreground/80 hover:border-primary/45 hover:bg-card/85"
              }`}
            >
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
