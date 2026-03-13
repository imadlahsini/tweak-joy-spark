import { useState, useRef, useEffect, useMemo, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { CalendarDays, Clock, Sparkles, Check, Sun, CloudSun, ArrowLeft, ArrowRight, Stethoscope, ChevronRight, ChevronLeft, User, Phone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import FloatingOrb from "@/components/shared/FloatingOrb";
import Navbar from "@/components/landing/Navbar";
import { toast } from "@/components/ui/sonner";
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
    subtitle: "Select your preferred date and time for a consultation",
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
    phonePlaceholder: "+212 6XX XXX XXX",
    nameRequired: "Name is required (min 2 characters)",
    phoneRequired: "Phone is required (min 6 digits)",
  },
  fr: {
    title: "Réservez Votre",
    titleAccent: "Rendez-vous",
    subtitle: "Sélectionnez votre date et heure préférées pour une consultation",
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
    phonePlaceholder: "+212 6XX XXX XXX",
    nameRequired: "Le nom est requis (min 2 caractères)",
    phoneRequired: "Le téléphone est requis (min 6 chiffres)",
  },
  ar: {
    title: "احجز",
    titleAccent: "موعدك",
    subtitle: "اختر التاريخ والوقت المفضل لديك للاستشارة",
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
    phonePlaceholder: "+212 6XX XXX XXX",
    nameRequired: "الاسم مطلوب (حرفان على الأقل)",
    phoneRequired: "الهاتف مطلوب (6 أرقام على الأقل)",
  },
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

  const orbX1 = useTransform(mouseX, [-500, 500], [-20, 20]);
  const orbY1 = useTransform(mouseY, [-500, 500], [-20, 20]);
  const orbX2 = useTransform(mouseX, [-500, 500], [15, -15]);
  const orbY2 = useTransform(mouseY, [-500, 500], [10, -10]);

  const t = translations[(language as "en" | "fr" | "ar") || "en"];
  const isRTL = language === "ar";
  const dateLocale = language === "fr" ? fr : language === "ar" ? arSA : undefined;

  const isNameValid = clientName.trim().length >= 2;
  const isPhoneValid = clientPhone.replace(/\D/g, "").length >= 6;
  const isFormValid = isNameValid && isPhoneValid;
  const currentStep = !selectedDate ? 1 : !selectedTime ? 2 : !isFormValid ? 3 : 4;

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
    if (selectedDate && selectedTime && detailsSectionRef.current) {
      setTimeout(() => {
        detailsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        nameInputRef.current?.focus();
      }, 400);
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
    initialScrollLeftRef.current = slider.scrollLeft;
    const handleScroll = () => {
      if (initialScrollLeftRef.current !== null) {
        const delta = Math.abs(slider.scrollLeft - initialScrollLeftRef.current);
        if (delta > 8) {
          setHasScrolled(true);
        }
      }
      const { scrollLeft, scrollWidth, clientWidth } = slider;
      if (isRTL) {
        setShowRightFade(scrollLeft < 0);
        setShowLeftFade(Math.abs(scrollLeft) + clientWidth < scrollWidth - 4);
      } else {
        setShowLeftFade(scrollLeft > 4);
        setShowRightFade(scrollLeft + clientWidth < scrollWidth - 4);
      }
    };
    handleScroll();
    slider.addEventListener("scroll", handleScroll, { passive: true });
    return () => slider.removeEventListener("scroll", handleScroll);
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
    if (selectedDate && selectedTime && isFormValid) {
      toast.success(t.successTitle, {
        description: `${clientName} — ${t.successDesc} ${formatDate(selectedDate, "PPP")} ${t.at} ${selectedTime}`,
      });
      setTimeout(() => navigate("/home"), 1500);
    }
  };

  const getEndTime = (startTime: string) => {
    const [h, m] = startTime.split(":").map(Number);
    return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // Bug 9 fix: clickable step to go back
  const handleStepClick = (step: number) => {
    if (step === 1 && currentStep > 1) {
      setSelectedTime(null);
      dateSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const timeArrow = "–";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      dir={isRTL ? "rtl" : "ltr"}
      className="relative min-h-screen bg-background overflow-hidden"
    >
      {/* === Background layers === */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -5, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-accent/15 via-transparent to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], x: [0, 50, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-1/2 h-1/2 bg-gradient-radial from-primary/10 via-transparent to-transparent blur-3xl"
        />
      </div>

      <div className="absolute inset-0 dot-grid opacity-40" />

      {/* Floating geometric shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
      <motion.div style={{ x: orbX1, y: orbY1 }} className="absolute inset-0 pointer-events-none">
        <FloatingOrb className="bg-primary/15 -top-20 -right-32" size="w-[200px] h-[200px] md:w-[500px] md:h-[500px]" delay={0.2} />
      </motion.div>
      <motion.div style={{ x: orbX2, y: orbY2 }} className="absolute inset-0 pointer-events-none">
        <FloatingOrb className="bg-accent/10 top-1/3 -left-40" size="w-[250px] h-[250px] lg:w-[600px] lg:h-[600px]" delay={0.5} />
      </motion.div>

      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Bottom hero image */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent z-10" />
        <img
          src="https://ophtalmologueagadir.com/wp-content/uploads/2025/10/hero-image2.webp"
          alt=""
          className="w-full h-full object-cover object-top opacity-5 blur-sm"
        />
      </div>

      {/* Sparkle burst overlay */}
      <AnimatePresence>
        {showSparkles && (
          <div className="fixed inset-0 z-50 pointer-events-none">
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
                exit={{ opacity: 0 }}
                transition={{ duration: 1, delay: i * 0.05 }}
                className="absolute w-2 h-2 rounded-full bg-primary"
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* === Main Content === */}
      {/* Bug 10 fix: increased pb-36 */}
      <Navbar />
      <div className="relative z-10 flex flex-col min-h-screen px-4 sm:px-6 pt-24 pb-36">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
          className="text-center mb-5"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-foreground leading-tight">
            {t.title}{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              {t.titleAccent}
            </span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            {t.subtitle}
          </p>
        </motion.div>

        {/* ── Step Progress Indicator (Bug 9: clickable) ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex items-center justify-center gap-0 mb-6 max-w-sm mx-auto w-full px-2"
        >
          {/* Step 1 — clickable */}
          <button onClick={() => handleStepClick(1)} className="flex flex-col items-center gap-1.5 relative z-10 cursor-pointer">
            <motion.div
              animate={currentStep >= 1 ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                currentStep >= 2
                  ? "bg-primary border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                  : currentStep >= 1
                  ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.25)]"
                  : "border-border bg-card/50"
              }`}
            >
              {currentStep >= 2 ? (
                <Check className="w-4 h-4 text-primary-foreground" />
              ) : (
                <CalendarDays className={`w-4 h-4 ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </motion.div>
            <span className={`text-[11px] font-semibold transition-colors duration-300 ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>
              {t.step1}
            </span>
          </button>

          {/* Connecting line 1 */}
          <div className={`flex-1 h-[2px] bg-border/50 mx-2 relative -mt-5 rounded-full overflow-hidden ${isRTL ? "direction-rtl" : ""}`}>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: currentStep >= 2 ? 1 : 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`absolute inset-0 bg-gradient-to-r from-primary to-accent ${isRTL ? "origin-right" : "origin-left"}`}
            />
          </div>

          {/* Step 2 */}
          <button onClick={() => {}} className="flex flex-col items-center gap-1.5 relative z-10 cursor-default">
            <motion.div
              animate={currentStep === 2 ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                currentStep >= 3
                  ? "bg-primary border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                  : currentStep >= 2
                  ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.25)]"
                  : "border-border bg-card/50"
              }`}
            >
              {currentStep >= 3 ? (
                <Check className="w-4 h-4 text-primary-foreground" />
              ) : (
                <Clock className={`w-4 h-4 ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </motion.div>
            <span className={`text-[11px] font-semibold transition-colors duration-300 ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>
              {t.step2}
            </span>
          </button>

          {/* Connecting line 2 */}
          <div className={`flex-1 h-[2px] bg-border/50 mx-2 relative -mt-5 rounded-full overflow-hidden ${isRTL ? "direction-rtl" : ""}`}>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: currentStep >= 3 ? 1 : 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`absolute inset-0 bg-gradient-to-r from-accent to-primary ${isRTL ? "origin-right" : "origin-left"}`}
            />
          </div>

          {/* Step 3 — Details */}
          <button onClick={() => {}} className="flex flex-col items-center gap-1.5 relative z-10 cursor-default">
            <motion.div
              animate={currentStep === 3 ? { scale: [1, 1.15, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                currentStep >= 4
                  ? "bg-primary border-primary shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                  : currentStep >= 3
                  ? "border-primary bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.25)]"
                  : "border-border bg-card/50"
              }`}
            >
              {currentStep >= 4 ? (
                <Check className="w-4 h-4 text-primary-foreground" />
              ) : (
                <User className={`w-4 h-4 ${currentStep >= 3 ? "text-primary" : "text-muted-foreground"}`} />
              )}
            </motion.div>
            <span className={`text-[11px] font-semibold transition-colors duration-300 ${currentStep >= 3 ? "text-primary" : "text-muted-foreground"}`}>
              {t.step3}
            </span>
          </button>
        </motion.div>

        {/* ── Step 1: Date — Glass Card ── */}
        <motion.div
          ref={dateSectionRef}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm mx-auto mb-5"
        >
          <div className="relative bg-card/60 backdrop-blur-2xl border border-border/30 rounded-3xl p-5 overflow-hidden">
            {/* Top gradient accent line */}
            <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            {/* Section label */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center border border-primary/20">
                <CalendarDays className="w-4 h-4 text-primary" />
              </div>
              <div>
                <span className="text-sm font-bold text-foreground">{t.selectDate}</span>
                
              </div>
            </div>

            {/* Horizontal day slider with scroll indicators (Bug 8) */}
            <div className="relative -mx-8 px-8">
              {/* Left fade */}
              {showLeftFade && (
                <div className={`absolute ${isRTL ? "right-0" : "left-0"} top-0 bottom-0 w-8 bg-gradient-to-r ${isRTL ? "from-transparent to-card/80" : "from-card/80 to-transparent"} z-10 pointer-events-none rounded-l-2xl`} />
              )}
              {/* Right fade */}
              {showRightFade && (
                <div className={`absolute ${isRTL ? "left-0" : "right-0"} top-0 bottom-0 w-8 bg-gradient-to-r ${isRTL ? "from-card/80 to-transparent" : "from-transparent to-card/80"} z-10 pointer-events-none rounded-r-2xl`} />
              )}

              {/* Bouncing scroll hint arrow */}
              {!hasScrolled && (isRTL ? showLeftFade || !showRightFade : showRightFade) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`absolute ${isRTL ? "left-1" : "right-1"} top-1/2 -translate-y-1/2 z-20`}
                >
                  <motion.div
                    animate={{ x: isRTL ? [0, -6, 0] : [0, 6, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-primary/80 text-primary-foreground rounded-full p-1.5 shadow-lg backdrop-blur-sm"
                  >
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </motion.div>
                </motion.div>
              )}
              <div
                ref={sliderRef}
                className="flex gap-2.5 overflow-x-auto p-3 snap-x snap-mandatory"
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
                      whileHover={{ scale: 1.08, y: -4 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedTime(null);
                      }}
                      className={`group relative flex-shrink-0 snap-center rounded-2xl transition-all duration-300 ${
                        isSelected ? "shadow-[0_0_30px_hsl(var(--primary)/0.35)]" : ""
                      }`}
                    >
                      {/* Pulsing glow ring for selected */}
                      {isSelected && (
                        <motion.div
                          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.05, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute -inset-[2px] rounded-2xl bg-gradient-to-br from-primary via-accent to-primary bg-[length:200%_200%] animate-gradient"
                        />
                      )}
                      {/* Hover gradient border */}
                      {!isSelected && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                      <div
                        className={`relative m-[2px] rounded-[14px] w-[68px] py-3 pb-5 flex flex-col items-center gap-1 transition-all duration-300 ${
                          isSelected
                            ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                            : "bg-card/80 backdrop-blur-xl border border-border/40 text-foreground group-hover:border-primary/30 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]"
                        }`}
                      >
                        {/* Inner shine on selected */}
                        {isSelected && (
                          <div className="absolute inset-0 rounded-[14px] bg-gradient-to-b from-white/20 via-transparent to-transparent pointer-events-none" />
                        )}
                        {/* Shimmer on hover */}
                        {!isSelected && (
                          <div className="absolute inset-0 rounded-[14px] overflow-hidden pointer-events-none">
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-primary/8 to-transparent" />
                          </div>
                        )}
                        <span className={`text-[10px] font-medium uppercase tracking-wider relative z-10 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {formatDate(day, "EEE")}
                        </span>
                        <span className="text-xl font-bold relative z-10">{formatDate(day, "d")}</span>
                        <span className={`text-[10px] font-medium relative z-10 ${isSelected ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatDate(day, "MMM")}
                        </span>
                        {/* Bug 3 fix: Today badge inside padded area, bottom-1 */}
                        {today && (
                          <span className={`absolute bottom-1 text-[7px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                            isSelected
                              ? "text-primary-foreground/80 bg-white/15"
                              : "text-accent bg-accent/10"
                          }`}>
                            {t.today}
                          </span>
                        )}
                      </div>
                      {/* Selected check badge */}
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
                {/* Spacer to prevent last card from being hidden by fade */}
                <div className="flex-shrink-0 w-6" aria-hidden="true" />
              </div>
            </div>

            {/* Selected date pill */}
            <AnimatePresence>
              {selectedDate && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="mt-3 flex justify-center"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary backdrop-blur-sm">
                    <Check className="w-3.5 h-3.5" />
                    {formatDate(selectedDate, "EEEE, MMM d, yyyy")}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
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
              <div className="relative bg-card/60 backdrop-blur-2xl border border-border/30 rounded-3xl p-5 overflow-hidden">
                {/* Top gradient accent line */}
                <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-accent/60 to-transparent" />

                {/* Section label */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent/20 to-primary/10 flex items-center justify-center border border-accent/20">
                    <Clock className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground">{t.selectTime}</span>
                    
                  </div>
                </div>

                {/* Morning */}
                <TimeGroup
                  label={t.morning}
                  icon={<Sun className="w-3.5 h-3.5 text-primary" />}
                  slots={morningSlots}
                  selectedTime={selectedTime}
                  onSelect={setSelectedTime}
                  delayOffset={0}
                  getEndTime={getEndTime}
                  timeArrow={timeArrow}
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
                  getEndTime={getEndTime}
                  timeArrow={timeArrow}
                />
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
              <div className="relative bg-card/60 backdrop-blur-2xl border border-border/30 rounded-3xl p-5 overflow-hidden">
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
                        className={`w-full h-12 rounded-xl bg-background/50 backdrop-blur-sm border px-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] ${
                          nameTouched && !isNameValid
                            ? "border-destructive focus:border-destructive"
                            : "border-border/60 focus:border-primary"
                        }`}
                      />
                    </div>
                    <AnimatePresence>
                      {nameTouched && !isNameValid && (
                        <motion.p
                          initial={{ opacity: 0, y: -4, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -4, height: 0 }}
                          className="text-xs text-destructive"
                        >
                          {t.nameRequired}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Phone input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
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
                    <div className="relative">
                      <input
                        type="tel"
                        inputMode="tel"
                        dir="ltr"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        onBlur={() => setPhoneTouched(true)}
                        placeholder={t.phonePlaceholder}
                        className={`w-full h-12 rounded-xl bg-background/50 backdrop-blur-sm border px-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all duration-300 focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] ${
                          phoneTouched && !isPhoneValid
                            ? "border-destructive focus:border-destructive"
                            : "border-border/60 focus:border-primary"
                        } ${isRTL ? "text-left" : ""}`}
                      />
                    </div>
                    <AnimatePresence>
                      {phoneTouched && !isPhoneValid && (
                        <motion.p
                          initial={{ opacity: 0, y: -4, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: -4, height: 0 }}
                          className="text-xs text-destructive"
                        >
                          {t.phoneRequired}
                        </motion.p>
                      )}
                    </AnimatePresence>
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
              className="w-full max-w-sm mx-auto mb-5"
            >
              <div className="relative rounded-3xl overflow-hidden">
                {/* Animated gradient border */}
                <motion.div
                  animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] rounded-3xl"
                />
                <div className="relative m-[1.5px] bg-card/90 backdrop-blur-2xl rounded-[22px] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">

                  <div className="divide-y divide-border/30">
                    {/* Client info row */}
                    <div className="flex items-center gap-3 py-3 first:pt-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/5 shadow-sm flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{t.step3}</p>
                        <p className="text-[15px] font-bold text-foreground truncate">{clientName}</p>
                        <p className="text-[13px] text-muted-foreground" dir="ltr">{clientPhone}</p>
                      </div>
                    </div>

                    {/* Date row */}
                    <div className="flex items-center gap-3 py-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 shadow-sm flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{t.step1}</p>
                        <p className="text-[15px] font-bold text-foreground">{formatDate(selectedDate, "EEEE, MMM d, yyyy")}</p>
                      </div>
                    </div>

                    {/* Time row */}
                    <div className="flex items-center gap-3 py-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent/15 to-accent/5 shadow-sm flex items-center justify-center">
                        <Clock className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{t.step2}</p>
                        <p className="text-[15px] font-bold text-foreground">{selectedTime} – {getEndTime(selectedTime)}</p>
                      </div>
                    </div>

                    {/* Consultation row */}
                    <div className="flex items-center gap-3 py-3 last:pb-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 shadow-sm flex items-center justify-center">
                        <Stethoscope className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{t.consultation}</p>
                        <p className="text-[15px] font-bold text-foreground">{t.duration}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Fixed bottom CTA ── */}
      <AnimatePresence>
        {selectedDate && selectedTime && isFormValid && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-6 bg-gradient-to-t from-background via-background/95 to-transparent"
          >
            <div className="max-w-sm mx-auto">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ["0 0 20px hsl(var(--primary)/0.3)", "0 0 40px hsl(var(--primary)/0.5)", "0 0 20px hsl(var(--primary)/0.3)"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                onClick={handleConfirm}
                className="relative w-full group overflow-hidden"
              >
                {/* Gradient glow */}
                <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] bg-[length:200%_auto] animate-gradient" />
                <div className="relative flex items-center justify-center gap-3 w-full h-14 bg-foreground text-background font-semibold text-base rounded-2xl overflow-hidden">
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <Sparkles className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">{t.confirm}</span>
                  <motion.div
                    className="relative z-10"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
                  </motion.div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  getEndTime: (time: string) => string;
  timeArrow: string;
}

const TimeGroup = forwardRef<HTMLDivElement, TimeGroupProps>(
  ({ label, icon, slots, selectedTime, onSelect, delayOffset, getEndTime, timeArrow }, ref) => (
    <div ref={ref}>
      <div className="flex items-center gap-2 mb-2.5">
        {icon}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
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
              className={`rounded-xl py-2.5 px-2 text-center transition-all duration-200 ${
                isSelected
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_4px_16px_hsl(var(--primary)/0.3)]"
                  : "bg-card/80 backdrop-blur-sm border border-border/50 text-foreground/70 hover:border-primary/40"
              }`}
            >
              <span className={`${isSelected ? "text-sm font-bold" : "text-sm font-semibold"}`}>
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
