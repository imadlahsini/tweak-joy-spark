import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, CalendarDays, Clock, User, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import FloatingOrb from "@/components/shared/FloatingOrb";
import Navbar from "@/components/landing/Navbar";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";
import { arSA } from "date-fns/locale/ar-SA";

const translations = {
  en: {
    title: "Appointment Confirmed!",
    subtitle: "Your booking has been successfully scheduled",
    date: "Date",
    time: "Time",
    consultation: "Consultation",
    duration: "1h • In-person",
    client: "Client",
    phone: "Phone",
    details: "Appointment Details",
    seeYou: "We look forward to seeing you!",
    whatsapp: "WhatsApp",
    call: "Call",
    directions: "Directions",
  },
  fr: {
    title: "Rendez-vous Confirmé!",
    subtitle: "Votre réservation a été planifiée avec succès",
    date: "Date",
    time: "Heure",
    consultation: "Consultation",
    duration: "1h • En personne",
    client: "Client",
    phone: "Téléphone",
    details: "Détails du Rendez-vous",
    seeYou: "Nous avons hâte de vous voir!",
    whatsapp: "WhatsApp",
    call: "Appeler",
    directions: "Itinéraire",
  },
  ar: {
    title: "!تم تأكيد الموعد",
    subtitle: "تم جدولة حجزك بنجاح",
    date: "التاريخ",
    time: "الوقت",
    consultation: "استشارة",
    duration: "ساعة • حضوري",
    client: "العميل",
    phone: "الهاتف",
    details: "تفاصيل الموعد",
    seeYou: "!نتطلع لرؤيتك",
    whatsapp: "واتساب",
    call: "اتصال",
    directions: "الاتجاهات",
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
    
  ];

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={`min-h-screen bg-background relative overflow-hidden ${isRTL ? "rtl" : ""}`}>
      <Navbar />

      {/* Animated gradient mesh background */}
      <div className="fixed inset-0">
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

      <div className="fixed inset-0 dot-grid opacity-40" />

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

      {/* Floating orbs */}
      <FloatingOrb className="bg-primary/15 -top-20 -right-32" size="w-[200px] h-[200px] md:w-[500px] md:h-[500px]" delay={0.2} />
      <FloatingOrb className="bg-accent/10 top-1/3 -left-40" size="w-[250px] h-[250px] lg:w-[600px] lg:h-[600px]" delay={0.5} />

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

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-start sm:justify-center min-h-[100dvh] px-5 pt-24 pb-40 sm:pb-32">
        
        {/* Animated Checkmark */}
        <div className="relative mb-8">
          {/* Confetti particles */}
          {Array.from({ length: 30 }).map((_, i) => (
            <Particle key={i} index={i} />
          ))}

          {/* Green success glow halo */}
          <motion.div
            animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.15, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 -m-8 rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(142 71% 45% / 0.25) 0%, transparent 70%)",
            }}
          />

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

              {/* Shimmer sweep */}
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(105deg, transparent 40%, hsl(0 0% 100% / 0.06) 45%, hsl(0 0% 100% / 0.1) 50%, hsl(0 0% 100% / 0.06) 55%, transparent 60%)",
                }}
              />

              {/* Header */}
              <div className="relative px-5 pt-5 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className={`text-xs font-semibold uppercase ${isRTL ? "tracking-normal" : "tracking-[0.12em]"} text-green-500`}>
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
                        <p className={`text-xs font-medium uppercase ${isRTL ? "tracking-normal" : "tracking-[0.1em]"} text-muted-foreground`}>
                          {row.label}
                        </p>
                        <p className="text-sm font-semibold text-foreground break-words leading-snug">
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
          className="text-muted-foreground text-center mt-6 mb-6 text-sm"
        >
          {t.seeYou}
        </motion.p>

      </div>

      {/* Floating Action Bar */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="fixed bottom-6 left-4 right-4 z-50 max-w-sm mx-auto"
      >
        <div className="relative bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl shadow-elevated py-2 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          {/* Gradient overlay */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-accent/10 pointer-events-none" />

          <div className="relative grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-1">
            {[
              { label: t.whatsapp, href: "https://wa.me/212XXXXXXXXX", color: "text-green-500", type: "whatsapp" as const },
              { label: t.call, href: "tel:+212XXXXXXXXX", color: "text-primary", type: "phone" as const },
              { label: t.directions, href: "https://maps.google.com/?q=placeholder", color: "text-accent-foreground", type: "map" as const },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center justify-center">
                <motion.a
                  href={item.href}
                  target={item.type === "map" ? "_blank" : undefined}
                  rel={item.type === "map" ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 + i * 0.1 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl min-h-[44px] px-3 py-2.5 transition-colors hover:bg-muted/50"
                >
                  {item.type === "whatsapp" ? (
                    <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  ) : item.type === "phone" ? (
                    <Phone className={`w-5 h-5 ${item.color}`} />
                  ) : (
                    <MapPin className={`w-5 h-5 ${item.color}`} />
                  )}
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                </motion.a>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AppointmentConfirmation;
