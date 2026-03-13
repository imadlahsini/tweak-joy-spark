import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, CalendarDays, Clock, User, Phone, Stethoscope, Home } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import FloatingOrb from "@/components/shared/FloatingOrb";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { arSA } from "date-fns/locale/ar-SA";

const translations = {
  en: {
    title: "Appointment Confirmed!",
    subtitle: "Your booking has been successfully scheduled",
    backHome: "Back to Home",
    date: "Date",
    time: "Time",
    consultation: "Consultation",
    duration: "1h • In-person",
    client: "Client",
    phone: "Phone",
    details: "Appointment Details",
    seeYou: "We look forward to seeing you!",
  },
  fr: {
    title: "Rendez-vous Confirmé!",
    subtitle: "Votre réservation a été planifiée avec succès",
    backHome: "Retour à l'accueil",
    date: "Date",
    time: "Heure",
    consultation: "Consultation",
    duration: "1h • En personne",
    client: "Client",
    phone: "Téléphone",
    details: "Détails du Rendez-vous",
    seeYou: "Nous avons hâte de vous voir!",
  },
  ar: {
    title: "!تم تأكيد الموعد",
    subtitle: "تم جدولة حجزك بنجاح",
    backHome: "العودة للرئيسية",
    date: "التاريخ",
    time: "الوقت",
    consultation: "استشارة",
    duration: "ساعة • حضوري",
    client: "العميل",
    phone: "الهاتف",
    details: "تفاصيل الموعد",
    seeYou: "!نتطلع لرؤيتك",
  },
};

// Confetti particle component
const Particle = ({ index }: { index: number }) => {
  const colors = [
    "hsl(var(--primary))",
    "hsl(var(--accent))",
    "hsl(142 71% 45%)",
    "hsl(48 96% 53%)",
    "hsl(var(--primary) / 0.6)",
  ];
  const color = colors[index % colors.length];
  const angle = (index / 20) * 360;
  const distance = 80 + Math.random() * 120;
  const x = Math.cos((angle * Math.PI) / 180) * distance;
  const y = Math.sin((angle * Math.PI) / 180) * distance;
  const size = 4 + Math.random() * 6;

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{ opacity: 0, x, y, scale: 0 }}
      transition={{ duration: 1.2 + Math.random() * 0.8, delay: 0.3 + Math.random() * 0.3, ease: "easeOut" }}
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        top: "50%",
        left: "50%",
      }}
    />
  );
};

const AppointmentConfirmation = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    clientName: string;
    clientPhone: string;
    selectedDate: string;
    selectedTime: string;
  } | null;

  const lang = language || "en";
  const t = translations[lang];
  const isRTL = lang === "ar";

  const dateLocale = useMemo(() => {
    if (lang === "fr") return fr;
    if (lang === "ar") return arSA;
    return undefined;
  }, [lang]);

  useEffect(() => {
    if (!state) navigate("/appointment", { replace: true });
  }, [state, navigate]);

  if (!state) return null;

  const date = new Date(state.selectedDate);
  const formattedDate = format(date, "EEEE, d MMMM yyyy", { locale: dateLocale });

  const getEndTime = (startTime: string) => {
    const [h, m] = startTime.split(":").map(Number);
    return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const rows = [
    { icon: User, label: t.client, value: state.clientName },
    { icon: Phone, label: t.phone, value: `+212 ${state.clientPhone}` },
    { icon: CalendarDays, label: t.date, value: formattedDate },
    { icon: Clock, label: t.time, value: `${state.selectedTime} — ${getEndTime(state.selectedTime)}` },
    { icon: Stethoscope, label: t.consultation, value: t.duration },
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`min-h-screen bg-background relative overflow-hidden ${isRTL ? "rtl" : ""}`}>
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      <div className="fixed inset-0 dot-grid opacity-30" />
      <FloatingOrb className="bg-primary/8 -top-32 -right-32" delay={0} />
      <FloatingOrb className="bg-accent/6 -bottom-40 -left-40" delay={2} size="w-[500px] h-[500px]" />
      <FloatingOrb className="bg-primary/5 top-1/2 right-1/4" delay={4} size="w-64 h-64" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-5 py-12">
        
        {/* Animated Checkmark */}
        <div className="relative mb-8">
          {/* Confetti particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <Particle key={i} index={i} />
          ))}

          {/* Outer ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="relative"
          >
            <motion.div
              animate={{ boxShadow: ["0 0 0px hsl(142 71% 45% / 0.3)", "0 0 40px hsl(142 71% 45% / 0.2)", "0 0 0px hsl(142 71% 45% / 0.3)"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, hsl(142 71% 45%), hsl(142 71% 35%))",
              }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 0.5, type: "spring", stiffness: 200 }}
              >
                <Check className="w-14 h-14 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-3xl font-display font-bold text-foreground text-center mb-2"
        >
          {t.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="text-muted-foreground text-center mb-8 text-sm"
        >
          {t.subtitle}
        </motion.p>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.7, ease: [0.2, 0.65, 0.3, 0.9] }}
          className="w-full max-w-sm"
        >
          {/* Animated gradient border wrapper */}
          <div className="relative rounded-2xl p-[1px] overflow-hidden">
            <motion.div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: "conic-gradient(from 0deg, hsl(var(--primary)/0.4), hsl(var(--accent)/0.3), hsl(var(--primary)/0.2), hsl(var(--accent)/0.4), hsl(var(--primary)/0.4))",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative rounded-2xl bg-card/95 backdrop-blur-xl overflow-hidden">
              {/* Inner glass highlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.03] pointer-events-none" />

              {/* Header */}
              <div className="relative px-5 pt-5 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className={`text-[10px] font-semibold uppercase ${isRTL ? "tracking-normal" : "tracking-[0.15em]"} text-green-500`}>
                    {t.details}
                  </span>
                </div>
              </div>

              {/* Rows */}
              <div className="px-5 pb-5 space-y-0">
                {rows.map((row, index) => (
                  <motion.div
                    key={row.label}
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                  >
                    {index > 0 && (
                      <div className="h-px bg-border/50 my-3" />
                    )}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center shrink-0">
                        <row.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] font-medium uppercase ${isRTL ? "tracking-normal" : "tracking-[0.12em]"} text-muted-foreground`}>
                          {row.label}
                        </p>
                        <p className="text-sm font-semibold text-foreground truncate">
                          {row.value}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* See you message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="text-muted-foreground text-center mt-6 mb-6 text-xs"
        >
          {t.seeYou}
        </motion.p>

        {/* Back to Home button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/home")}
          className="relative group overflow-hidden w-full max-w-sm h-12 rounded-xl font-display font-semibold text-sm bg-primary text-primary-foreground shadow-elevated"
        >
          {/* Shimmer sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
            animate={{ x: isRTL ? ["150%", "-150%"] : ["-150%", "150%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
          />
          <span className="relative z-10 flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            {t.backHome}
          </span>
        </motion.button>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
