import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import FloatingOrb from "@/components/shared/FloatingOrb";
import Navbar from "@/components/landing/Navbar";
import UiIcon from "@/components/shared/UiIcon";
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
  zgh: {
    title: "!ⵉⵜⵜⵓⵙⵙⵏⵜⵎ ⵓⵎⵓⵄⴷ",
    subtitle: "ⵉⵜⵜⵓⵙⴽⵔ ⵓⵃⵊⵊⴰⴽ ⵙ ⵓⵙⵎⵉⴷ",
    date: "ⴰⵣⵎⵣ",
    time: "ⴰⴽⵓⴷ",
    consultation: "ⴰⵙⵉⵡⴹ",
    duration: "1ⵙⴰⵄⴰ • ⵙ ⵓⴷⴷⵓⵔ",
    client: "ⴰⵎⵙⵎⵔⵙ",
    phone: "ⵓⵜⵟⵓⵏ ⵏ ⵓⵟⵟⵍ",
    details: "ⵉⵙⴼⴽⴰ ⵏ ⵓⵎⵓⵄⴷ",
    seeYou: "!ⴰⴷ ⵏⵣⵔⴽ ⵙ ⵍⴼⵔⴰⵃ",
    whatsapp: "ⵡⴰⵜⵙⴰⴱ",
    call: "ⴰⵙⵉⵡⵍ",
    directions: "ⵜⴰⵏⴰⵎⵎⴰⵙⵜ",
  },
};

type ConnectorState = "active" | "idle";

const ActionConnector = ({
  state,
  isRTL,
  reducedMotion,
  className = "",
}: {
  state: ConnectorState;
  isRTL: boolean;
  reducedMotion: boolean;
  className?: string;
}) => {
  const fill =
    state === "active"
      ? reducedMotion
        ? { scaleX: 1, opacity: 1 }
        : { scaleX: [0.45, 1, 0.45], opacity: [0.78, 1, 0.78] }
      : { scaleX: 0.25, opacity: 0.45 };

  return (
    <div className={`relative h-[2px] overflow-hidden rounded-full ${className}`}>
      <div className="absolute inset-0 rounded-full bg-white/35 dark:bg-white/20" />
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/75 to-accent/80 shadow-[0_0_10px_hsl(var(--primary)/0.28)]"
        style={{ originX: isRTL ? 1 : 0 }}
        animate={fill}
        transition={
          state === "active" && !reducedMotion
            ? { duration: 1.9, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.25, ease: [0.2, 0.65, 0.3, 0.9] }
        }
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
  const prefersReducedMotion = useReducedMotion();

  const dateLocale = useMemo(() => {
    if (lang === "fr" || lang === "zgh") return fr;
    if (lang === "ar") return arSA;
    return undefined;
  }, [lang]);

  useEffect(() => {
    if (!state) navigate("/appointment", { replace: true });
  }, [state, navigate]);

  if (!state) return null;

  const date = new Date(state.selectedDate);
  const formattedDate = format(date, "EEEE, d MMMM yyyy", { locale: dateLocale });

  const formattedClientPhone = formatMoroccanPhoneDisplay(state.clientPhone);

  const rows = [
    { icon: "solar:user-bold-duotone", label: t.client, value: state.clientName },
    { icon: "solar:phone-calling-rounded-bold-duotone", label: t.phone, value: formattedClientPhone },
    { icon: "solar:calendar-date-bold-duotone", label: t.date, value: formattedDate },
    { icon: "solar:clock-circle-bold-duotone", label: t.time, value: state.selectedTime },
    
  ];
  const actionItems = [
    { label: t.whatsapp, href: "https://wa.me/212660077768", type: "whatsapp" as const, icon: "solar:chat-round-line-bold-duotone" },
    { label: t.call, href: "tel:0528333836", type: "phone" as const, icon: "solar:phone-calling-rounded-bold-duotone" },
    { label: t.directions, href: "https://maps.app.goo.gl/YbKTvN8aSjoe4amUA", type: "map" as const, icon: "solar:map-point-wave-bold-duotone" },
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
                <UiIcon icon="solar:check-circle-bold" size={20} className="w-14 h-14 text-white" />
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
                        <UiIcon icon={row.icon} size={18} tone="primary" />
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
        <div className="relative rounded-3xl border border-white/35 dark:border-white/20 bg-[linear-gradient(135deg,hsl(var(--background)/0.46),hsl(var(--primary)/0.12)_52%,hsl(var(--accent)/0.10))] backdrop-blur-3xl backdrop-saturate-150 shadow-[0_24px_56px_hsl(var(--foreground)/0.22),0_10px_24px_hsl(var(--foreground)/0.14)] overflow-hidden py-2.5 px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/35 via-white/10 to-transparent dark:from-white/16 dark:via-white/6" />
          <div className="absolute left-3 right-3 top-[2px] h-[1px] pointer-events-none bg-gradient-to-r from-transparent via-white/85 to-transparent dark:via-white/45" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(120%_90%_at_20%_0%,rgba(255,255,255,0.45),rgba(255,255,255,0)_55%)] dark:bg-[radial-gradient(120%_90%_at_20%_0%,rgba(255,255,255,0.22),rgba(255,255,255,0)_55%)]" />
          <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-white/38 dark:ring-white/16" />

          <div className="relative mx-auto flex w-fit items-center justify-center gap-1.5">
            {actionItems.map((item, i) => {
              const connectorState: ConnectorState = i < actionItems.length - 1 ? "active" : "idle";
              return (
                <div key={item.label} className="flex items-center justify-center">
                  <motion.a
                    href={item.href}
                    aria-label={item.label}
                    title={item.label}
                    target={item.type === "map" ? "_blank" : undefined}
                    rel={item.type === "map" ? "noopener noreferrer" : undefined}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.8 + i * 0.08 }}
                    whileTap={{ scale: 0.94 }}
                    whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
                    className={`w-12 h-12 min-h-[48px] rounded-full border flex items-center justify-center transition-colors ${
                      item.type === "whatsapp"
                        ? "bg-green-500/15 border-green-400/60 text-green-500 shadow-[0_0_14px_hsl(142_71%_45%/0.3)]"
                        : item.type === "phone"
                        ? "bg-primary/14 border-primary/85 text-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.14)]"
                        : "bg-accent/14 border-accent/70 text-accent"
                    }`}
                  >
                    <UiIcon icon={item.icon} size={22} tone="current" />
                  </motion.a>
                  {i < actionItems.length - 1 && (
                    <ActionConnector
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
        </div>
      </motion.div>
    </div>
  );
};

export default AppointmentConfirmation;
