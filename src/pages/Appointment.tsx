import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { CalendarDays, Clock, Sparkles, Check, Sun, CloudSun, ArrowLeft } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useLanguage } from "@/contexts/LanguageContext";
import FloatingOrb from "@/components/shared/FloatingOrb";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";

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
    selectDate: "Choose a Date",
    morning: "Morning",
    afternoon: "Afternoon",
    selectTime: "Pick a Time",
    confirm: "Confirm Appointment",
    selected: "Selected",
    back: "Back",
    successTitle: "Appointment Booked!",
    successDesc: "We'll see you on",
  },
  fr: {
    title: "Réservez Votre",
    titleAccent: "Rendez-vous",
    subtitle: "Sélectionnez votre date et heure préférées pour une consultation",
    selectDate: "Choisir une Date",
    morning: "Matin",
    afternoon: "Après-midi",
    selectTime: "Choisir une Heure",
    confirm: "Confirmer le Rendez-vous",
    selected: "Sélectionné",
    back: "Retour",
    successTitle: "Rendez-vous Réservé!",
    successDesc: "Nous vous verrons le",
  },
  ar: {
    title: "احجز",
    titleAccent: "موعدك",
    subtitle: "اختر التاريخ والوقت المفضل لديك للاستشارة",
    selectDate: "اختر التاريخ",
    morning: "صباحاً",
    afternoon: "مساءً",
    selectTime: "اختر الوقت",
    confirm: "تأكيد الموعد",
    selected: "تم الاختيار",
    back: "رجوع",
    successTitle: "!تم حجز الموعد",
    successDesc: "سنراك في",
  },
};

const Appointment = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const orbX1 = useTransform(mouseX, [-500, 500], [-20, 20]);
  const orbY1 = useTransform(mouseY, [-500, 500], [-20, 20]);
  const orbX2 = useTransform(mouseX, [-500, 500], [15, -15]);
  const orbY2 = useTransform(mouseY, [-500, 500], [10, -10]);

  const t = translations[(language as "en" | "fr" | "ar") || "en"];
  const isRTL = language === "ar";

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    }
  };

  const morningSlots = timeSlots.filter((s) => s.period === "morning");
  const afternoonSlots = timeSlots.filter((s) => s.period === "afternoon");

  const handleConfirm = () => {
    if (selectedDate && selectedTime) {
      toast.success(t.successTitle, {
        description: `${t.successDesc} ${format(selectedDate, "PPP")} at ${selectedTime}`,
      });
      setTimeout(() => navigate("/home"), 1500);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      dir={isRTL ? "rtl" : "ltr"}
      className="relative min-h-screen bg-background overflow-hidden"
    >
      {/* === Background layers (same as Welcome) === */}
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

      {/* Dot grid */}
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

      {/* Parallax floating orbs */}
      <motion.div style={{ x: orbX1, y: orbY1 }} className="absolute inset-0 pointer-events-none">
        <FloatingOrb className="bg-primary/15 -top-20 -right-32" size="w-[200px] h-[200px] md:w-[500px] md:h-[500px]" delay={0.2} />
      </motion.div>
      <motion.div style={{ x: orbX2, y: orbY2 }} className="absolute inset-0 pointer-events-none">
        <FloatingOrb className="bg-accent/10 top-1/3 -left-40" size="w-[250px] h-[250px] lg:w-[600px] lg:h-[600px]" delay={0.5} />
      </motion.div>

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Bottom hero image */}
      <div className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent z-10" />
        <img
          src="https://ophtalmologueagadir.com/wp-content/uploads/2025/10/hero-image2.webp"
          alt=""
          className="w-full h-full object-cover object-top opacity-15 blur-sm"
        />
      </div>

      {/* === Main Content === */}
      <div className="relative z-10 flex flex-col min-h-screen px-4 sm:px-6 pt-6 pb-28">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 self-start"
        >
          <ArrowLeft className={`w-4 h-4 ${isRTL ? "rotate-180" : ""}`} />
          <span className="text-sm font-medium">{t.back}</span>
        </motion.button>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
          className="text-center mb-6"
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

        {/* Step 1: Date */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm mx-auto mb-6"
        >
          {/* Section label */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-foreground">{t.selectDate}</span>
          </div>

          {/* Glass card for calendar */}
          <div className="group relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative m-[1px] rounded-2xl bg-card/70 backdrop-blur-xl border border-border/40 group-hover:border-primary/30 transition-all duration-300 group-hover:shadow-[0_0_40px_hsl(var(--primary)/0.15)]">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-60" />
              {/* Shimmer */}
              <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
              </div>
              <div className="p-2 sm:p-3 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="pointer-events-auto"
                />
              </div>
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
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary">
                  <Check className="w-3.5 h-3.5" />
                  {format(selectedDate, "EEEE, MMM d, yyyy")}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Step 2: Time slots */}
        <AnimatePresence>
          {selectedDate && (
            <motion.div
              initial={{ opacity: 0, y: 30, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 20, height: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] }}
              className="w-full max-w-sm mx-auto overflow-hidden"
            >
              {/* Section label */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">{t.selectTime}</span>
              </div>

              {/* Morning slots */}
              <TimeGroup
                label={t.morning}
                icon={<Sun className="w-3.5 h-3.5 text-amber-500" />}
                slots={morningSlots}
                selectedTime={selectedTime}
                onSelect={setSelectedTime}
                delayOffset={0}
              />

              {/* Afternoon slots */}
              <TimeGroup
                label={t.afternoon}
                icon={<CloudSun className="w-3.5 h-3.5 text-orange-400" />}
                slots={afternoonSlots}
                selectedTime={selectedTime}
                onSelect={setSelectedTime}
                delayOffset={4}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Fixed bottom CTA */}
      <AnimatePresence>
        {selectedDate && selectedTime && (
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
                onClick={handleConfirm}
                className="relative w-full group"
              >
                {/* Gradient glow */}
                <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-300 blur-[2px] bg-[length:200%_auto] animate-gradient" />
                <div className="relative flex items-center justify-center gap-3 w-full h-14 bg-foreground text-background font-semibold text-base rounded-2xl shadow-lg">
                  <Sparkles className="w-5 h-5" />
                  {t.confirm}
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Time Group Component ── */
interface TimeGroupProps {
  label: string;
  icon: React.ReactNode;
  slots: typeof timeSlots;
  selectedTime: string | null;
  onSelect: (time: string) => void;
  delayOffset: number;
}

const TimeGroup = ({ label, icon, slots, selectedTime, onSelect, delayOffset }: TimeGroupProps) => (
  <div className="mb-4">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
    <div className="grid grid-cols-4 gap-2">
      {slots.map((slot, i) => {
        const isSelected = selectedTime === slot.time;
        return (
          <motion.button
            key={slot.time}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 + (delayOffset + i) * 0.06 }}
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(slot.time)}
            className={`group relative rounded-xl overflow-hidden transition-all duration-300 ${
              isSelected ? "ring-2 ring-primary shadow-[0_0_20px_hsl(var(--primary)/0.25)]" : ""
            }`}
          >
            {/* Hover gradient border */}
            {!isSelected && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/30 via-accent/20 to-primary/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            )}
            <div
              className={`relative m-[1px] rounded-xl py-3 text-center text-sm font-semibold transition-all duration-300 ${
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-card/70 backdrop-blur-xl border border-border/40 text-foreground group-hover:border-primary/30 group-hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]"
              }`}
            >
              {/* Shimmer */}
              {!isSelected && (
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-primary/8 to-transparent" />
                </div>
              )}
              <span className="relative z-10">{slot.time}</span>
            </div>
            {/* Selected check */}
            <AnimatePresence>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary border-2 border-background flex items-center justify-center z-20"
                >
                  <Check className="w-3 h-3 text-primary-foreground" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  </div>
);

export default Appointment;
