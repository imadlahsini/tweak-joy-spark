import { useState, useEffect, useRef, useMemo, forwardRef, type CSSProperties } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, Phone, Clock, MapPin, ChevronRight, Globe, Check } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { getClinicAvailability } from "@/lib/clinicAvailability";

const WhatsAppIcon = forwardRef<SVGSVGElement, { className?: string }>(
  ({ className, ...props }, ref) => (
    <svg ref={ref} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
);
WhatsAppIcon.displayName = "WhatsAppIcon";

type MenuLanguage = "en" | "fr" | "ar" | "zgh";

interface MenuCopy {
  lineMain: string;
  lineSupport: string;
  heroCall: string;
  heroWhatsapp: string;
  greetingOpen: string;
  greetingClosed: string;
  statusOpenShort: string;
  statusClosedShort: string;
  openNowNote: string;
  afterHoursNote: string;
  nextOpenAt: string;
  secondaryActionsLabel: string;
  directionsLabel: string;
  hoursLabel: string;
  hoursValue: string;
  hoursWeekdaysLabel: string;
  hoursWeekdaysValue: string;
  hoursSaturdayLabel: string;
  hoursSaturdayValue: string;
  languageLabel: string;
  languageHint: string;
  getStarted: string;
  openMenuAria: string;
  closeMenuAria: string;
}

const formatNextOpenLabelForMenu = (label: string, language: MenuLanguage) => {
  const match = label.match(/^([A-Za-z]{3})\s+(\d{2}:\d{2})$/);
  if (!match) {
    return { day: null as string | null, time: label, localized: false };
  }

  const [, dayToken, timeValue] = match;
  const weekdayIndexByToken: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekdayIndex = weekdayIndexByToken[dayToken];
  if (weekdayIndex === undefined) {
    return { day: null as string | null, time: timeValue, localized: false };
  }

  const localeByLanguage: Record<MenuLanguage, string> = {
    en: "en-US",
    fr: "fr-FR",
    ar: "ar-MA",
    zgh: "fr-FR",
  };
  const locale = localeByLanguage[language] ?? "en-US";

  try {
    const baseUtc = new Date(Date.UTC(2024, 0, 7));
    baseUtc.setUTCDate(baseUtc.getUTCDate() + weekdayIndex);
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "long", timeZone: "Africa/Casablanca" });
    const weekday = formatter.format(baseUtc);
    return { day: weekday, time: timeValue, localized: true };
  } catch {
    return { day: null as string | null, time: timeValue, localized: false };
  }
};

const menuTranslations: Record<MenuLanguage, MenuCopy> = {
  en: {
    lineMain: "Main line",
    lineSupport: "Support",
    heroCall: "Call now",
    heroWhatsapp: "Message on WhatsApp",
    greetingOpen: "We're open right now — want to talk?",
    greetingClosed: "We open in {{hours}} hours. Leave us a message?",
    statusOpenShort: "Open now",
    statusClosedShort: "Currently closed",
    openNowNote: "Live support is available right now.",
    afterHoursNote: "We'll reply when we open.",
    nextOpenAt: "Next opening",
    secondaryActionsLabel: "Other actions",
    directionsLabel: "Directions",
    hoursLabel: "Hours",
    hoursValue: "Mon - Fri: 09:00 - 18:00 • Sat: 09:00 - 12:00",
    hoursWeekdaysLabel: "Mon - Fri",
    hoursWeekdaysValue: "09:00 - 18:00",
    hoursSaturdayLabel: "Sat",
    hoursSaturdayValue: "09:00 - 12:00",
    languageLabel: "Language",
    languageHint: "Tap to switch",
    getStarted: "Get Started",
    openMenuAria: "Open menu",
    closeMenuAria: "Close menu",
  },
  fr: {
    lineMain: "Ligne principale",
    lineSupport: "Support",
    heroCall: "Appeler maintenant",
    heroWhatsapp: "Message WhatsApp",
    greetingOpen: "Nous sommes ouverts maintenant — on en parle ?",
    greetingClosed: "Nous ouvrons dans {{hours}} heures. Laissez-nous un message ?",
    statusOpenShort: "Ouvert",
    statusClosedShort: "Ferme maintenant",
    openNowNote: "Notre equipe est disponible immediatement.",
    afterHoursNote: "Nous vous repondrons a l'ouverture.",
    nextOpenAt: "Prochaine ouverture",
    secondaryActionsLabel: "Actions secondaires",
    directionsLabel: "Itineraire",
    hoursLabel: "Horaires",
    hoursValue: "Lun - Ven: 09:00 - 18:00 • Sam: 09:00 - 12:00",
    hoursWeekdaysLabel: "Lun - Ven",
    hoursWeekdaysValue: "09:00 - 18:00",
    hoursSaturdayLabel: "Sam",
    hoursSaturdayValue: "09:00 - 12:00",
    languageLabel: "Langue",
    languageHint: "Appuyez pour changer",
    getStarted: "Commencer",
    openMenuAria: "Ouvrir le menu",
    closeMenuAria: "Fermer le menu",
  },
  ar: {
    lineMain: "الخط الرئيسي",
    lineSupport: "الدعم",
    heroCall: "اتصل الآن",
    heroWhatsapp: "راسلنا عبر واتساب",
    greetingOpen: "نحن مفتوحون الآن — هل ترغب بالتحدث؟",
    greetingClosed: "سنفتح خلال {{hours}} ساعة. اترك لنا رسالة؟",
    statusOpenShort: "مفتوح الآن",
    statusClosedShort: "مغلق حالياً",
    openNowNote: "يمكنك التواصل معنا مباشرة الآن.",
    afterHoursNote: "سنرد عليك عند فتح العيادة.",
    nextOpenAt: "الافتتاح القادم",
    secondaryActionsLabel: "إجراءات أخرى",
    directionsLabel: "الاتجاهات",
    hoursLabel: "ساعات العمل",
    hoursValue: "الإثنين - الجمعة: 09:00 - 18:00 • السبت: 09:00 - 12:00",
    hoursWeekdaysLabel: "الإثنين - الجمعة",
    hoursWeekdaysValue: "09:00 - 18:00",
    hoursSaturdayLabel: "السبت",
    hoursSaturdayValue: "09:00 - 12:00",
    languageLabel: "اللغة",
    languageHint: "انقر للتبديل",
    getStarted: "ابدأ الآن",
    openMenuAria: "فتح القائمة",
    closeMenuAria: "إغلاق القائمة",
  },
  zgh: {
    lineMain: "ⵉⵣⵓⵏ ⴰⵎⵇⵇⵔⴰⵏ",
    lineSupport: "ⴰⵙⵙⵉⵙⵏ",
    heroCall: "ⵙⵙⵉⵡⵍ ⵖⵉⵍⴰⴷ",
    heroWhatsapp: "ⴰⵣⵏ ⴰⵙⴰⵡⴰⵍ ⵙ ⵡⴰⵜⵙⴰⴱ",
    greetingOpen: "ⵏⵍⵍⴰ ⵎⵥⵢⴰⵏ ⵖⵉⵍⴰⴷ — ⵜⵔⵉⴷ ⴰⴷ ⵏⵙⴰⵡⴰⵍ?",
    greetingClosed: "ⴰⴷ ⵏⵔⵥⵎ ⴷⴰⵖ ⴳ {{hours}} ⵙⵙⴰⵄⴰⵜ. ⴰⵣⵏ ⴰⵢⵉⵏ ⴰⵣⴳⵣⴰⵡ?",
    statusOpenShort: "ⵉⵔⵥⵎ",
    statusClosedShort: "ⵉⵎⵖⵍⵉ",
    openNowNote: "ⴰⵙⵙⵉⵙⵏ ⵉⵍⵍⴰ ⵖⵉⵍⴰⴷ.",
    afterHoursNote: "ⴰⴷ ⵏⵔⴰⵔ ⴼⵍⴰⴽ ⵎⵉⵏⵣⵉ ⴰⴷ ⵏⵔⵥⵎ.",
    nextOpenAt: "ⵓⵔⵣⵓ ⵉ ⵉⴹⴼⴼⵔⵏ",
    secondaryActionsLabel: "ⵜⵉⵙⴽⴽⴰⵔⵉⵏ ⵏⵏⵉⴹⵏ",
    directionsLabel: "ⵜⴰⵏⴰⵎⵎⴰⵙⵜ",
    hoursLabel: "ⵉⵙⵔⴰⴳⵏ",
    hoursValue: "ⴰⵢⵏⴰⵙ - ⴰⵙⵎⵉⵙ: 09:00 - 18:00 • ⴰⵙⵉⴹⵢⴰⵙ: 09:00 - 12:00",
    hoursWeekdaysLabel: "ⴰⵢⵏⴰⵙ - ⴰⵙⵎⵉⵙ",
    hoursWeekdaysValue: "09:00 - 18:00",
    hoursSaturdayLabel: "ⴰⵙⵉⴹⵢⴰⵙ",
    hoursSaturdayValue: "09:00 - 12:00",
    languageLabel: "ⵜⴰⵓⵜⵍⴰⵢⵜ",
    languageHint: "ⴰⴷ ⵜⵙⵏⴼⵍⵜ",
    getStarted: "ⴱⴷⵓ",
    openMenuAria: "ⴽⵛⵎ ⵜⴰⴳⴰⵍⵉⵙⵜ",
    closeMenuAria: "ⵇⵇⵏ ⵜⴰⴳⴰⵍⵉⵙⵜ",
  },
};

const PRIMARY_PHONE = "0528 333 836";
const PRIMARY_PHONE_HREF = "tel:0528333836";
const SECONDARY_PHONE = "0528 333 837";
const SECONDARY_PHONE_HREF = "tel:0528333837";
const WHATSAPP_HREF = "https://wa.me/212660077768";
const DIRECTIONS_HREF = "https://maps.app.goo.gl/YbKTvN8aSjoe4amUA";

const menuLanguageOptions: Array<{
  code: MenuLanguage;
  nativeLabel: string;
  englishLabel: string;
  flag: string;
  dir: "ltr" | "rtl";
  fontClass: string;
}> = [
  { code: "ar", nativeLabel: "العربية", englishLabel: "Arabic", flag: "🇲🇦", dir: "rtl", fontClass: "font-greeting-ar" },
  { code: "zgh", nativeLabel: "ⵜⴰⵎⴰⵣⵉⵖⵜ", englishLabel: "Tamazight", flag: "🇲🇦", dir: "ltr", fontClass: "font-greeting-zgh" },
  { code: "en", nativeLabel: "English", englishLabel: "English", flag: "🇬🇧", dir: "ltr", fontClass: "font-greeting-latin" },
  { code: "fr", nativeLabel: "Français", englishLabel: "French", flag: "🇫🇷", dir: "ltr", fontClass: "font-greeting-latin" },
];

const AmazighMenuFlag = () => (
  <span
    className="relative inline-flex h-[12px] w-[18px] overflow-hidden rounded-[2.5px] border border-black/15"
    aria-hidden="true"
    dir="ltr"
  >
    <span className="h-full w-1/3 bg-[#1f73b7]" />
    <span className="relative h-full w-1/3 bg-[#2fa04b]">
      <span className="absolute inset-0 flex items-center justify-center text-[9px] font-semibold leading-none text-[#d7232f]">ⵣ</span>
    </span>
    <span className="h-full w-1/3 bg-[#f2c230]" />
  </span>
);

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
    target.style.removeProperty("overscroll-behavior");
    target.removeAttribute("data-scroll-locked");
    target.classList.remove("overflow-hidden");
  });
};

interface ScrollLockSnapshot {
  scrollY: number;
  htmlOverflow: string;
  htmlPaddingRight: string;
  htmlOverscrollBehavior: string;
  bodyOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
  bodyPaddingRight: string;
  bodyTouchAction: string;
  bodyOverscrollBehavior: string;
}

const getScrollbarWidth = () =>
  typeof window === "undefined" ? 0 : window.innerWidth - document.documentElement.clientWidth;

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuNow, setMenuNow] = useState(() => new Date());
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const shouldReduceMotion = useReducedMotion();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const menuDialogRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const lockSnapshotRef = useRef<ScrollLockSnapshot | null>(null);

  const currentLanguage: MenuLanguage = (language ?? "en") as MenuLanguage;
  const t = menuTranslations[currentLanguage];
  const isRTL = currentLanguage === "ar";
  const availability = useMemo(() => getClinicAvailability(menuNow), [menuNow]);
  const isClinicOpen = availability.isOpen;
  const heroIsCall = availability.heroChannel === "call";
  const localizedHoursUntilOpen = useMemo(() => {
    if (currentLanguage !== "ar") return String(availability.hoursUntilOpen);
    try {
      return new Intl.NumberFormat("ar-MA").format(availability.hoursUntilOpen);
    } catch {
      return String(availability.hoursUntilOpen);
    }
  }, [availability.hoursUntilOpen, currentLanguage]);
  const greetingText = isClinicOpen
    ? t.greetingOpen
    : t.greetingClosed.replace("{{hours}}", localizedHoursUntilOpen);
  const nextOpenLabelParts = formatNextOpenLabelForMenu(availability.nextOpenLabel, currentLanguage);
  const statusDotClass =
    availability.statusDotColor === "teal"
      ? "bg-[hsl(170,66%,52%)]"
      : "bg-[hsl(28,10%,60%)]";
  const widgetSurfaceClass = isClinicOpen
    ? "bg-[linear-gradient(150deg,hsl(206_20%_15%),hsl(195_24%_11%))]"
    : "bg-[linear-gradient(150deg,hsl(217_16%_16%),hsl(214_14%_12%))]";
  const heroButtonClass = heroIsCall
    ? "bg-[hsl(175,64%,46%)] text-white hover:bg-[hsl(175,64%,52%)]"
    : "bg-[hsl(217,17%,42%)] text-white hover:bg-[hsl(217,17%,48%)]";
  const orbitRingMaskStyle: CSSProperties = {
    padding: "3px",
    WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
    WebkitMaskComposite: "xor",
    maskComposite: "exclude",
  };
  const orbitRingHighlightStyle: CSSProperties = {
    ...orbitRingMaskStyle,
    willChange: "transform",
  };
  const supportsMaskedOrbit = useMemo(() => {
    if (typeof window === "undefined" || typeof CSS === "undefined" || typeof CSS.supports !== "function") {
      return false;
    }
    try {
      const supportsMask =
        CSS.supports("-webkit-mask:linear-gradient(#000 0 0)") ||
        CSS.supports("mask:linear-gradient(#000 0 0)");
      const supportsComposite =
        CSS.supports("-webkit-mask-composite:xor") ||
        CSS.supports("mask-composite:exclude");
      return supportsMask && supportsComposite;
    } catch {
      return false;
    }
  }, []);

  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const heroAction = {
    label: heroIsCall ? t.heroCall : t.heroWhatsapp,
    href: heroIsCall ? PRIMARY_PHONE_HREF : WHATSAPP_HREF,
    external: !heroIsCall,
    icon: heroIsCall ? <Phone className="w-[19px] h-[19px]" /> : <WhatsAppIcon className="w-[19px] h-[19px]" />,
  };

  const secondaryActions = [
    {
      key: heroIsCall ? "whatsapp" : "call",
      label: heroIsCall ? t.heroWhatsapp : t.heroCall,
      href: heroIsCall ? WHATSAPP_HREF : PRIMARY_PHONE_HREF,
      external: heroIsCall,
      icon: heroIsCall ? <WhatsAppIcon className="w-[18px] h-[18px]" /> : <Phone className="w-[18px] h-[18px]" />,
    },
    {
      key: "directions",
      label: t.directionsLabel,
      href: DIRECTIONS_HREF,
      external: true,
      icon: <MapPin className="w-[18px] h-[18px]" />,
    },
  ] as const;
  const secondaryActionsForView = isRTL ? [...secondaryActions].reverse() : secondaryActions;

  const lockPage = () => {
    if (typeof document === "undefined" || lockSnapshotRef.current) return;
    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const scrollbarWidth = getScrollbarWidth();

    lockSnapshotRef.current = {
      scrollY,
      htmlOverflow: html.style.overflow,
      htmlPaddingRight: html.style.paddingRight,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
      bodyPaddingRight: body.style.paddingRight,
      bodyTouchAction: body.style.touchAction,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
    };

    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "contain";
    if (scrollbarWidth > 0) {
      html.style.paddingRight = `${scrollbarWidth}px`;
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.touchAction = "none";
    body.style.overscrollBehavior = "contain";
  };

  const unlockPage = (restoreFocus = true) => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    const snapshot = lockSnapshotRef.current;

    if (snapshot) {
      html.style.overflow = snapshot.htmlOverflow;
      html.style.paddingRight = snapshot.htmlPaddingRight;
      html.style.overscrollBehavior = snapshot.htmlOverscrollBehavior;
      body.style.overflow = snapshot.bodyOverflow;
      body.style.position = snapshot.bodyPosition;
      body.style.top = snapshot.bodyTop;
      body.style.left = snapshot.bodyLeft;
      body.style.right = snapshot.bodyRight;
      body.style.width = snapshot.bodyWidth;
      body.style.paddingRight = snapshot.bodyPaddingRight;
      body.style.touchAction = snapshot.bodyTouchAction;
      body.style.overscrollBehavior = snapshot.bodyOverscrollBehavior;
      window.scrollTo(0, snapshot.scrollY);
      lockSnapshotRef.current = null;
    }

    clearInteractionLocks();

    if (restoreFocus) {
      lastFocusedRef.current?.focus();
      lastFocusedRef.current = null;
    }
  };

  const openMenu = () => {
    if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
      lastFocusedRef.current = document.activeElement;
    }
    setIsOpen(true);
  };

  const closeMenu = (restoreFocus = true) => {
    setIsOpen(false);
    if (!restoreFocus) {
      lastFocusedRef.current = null;
    }
  };

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
      return;
    }
    openMenu();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setMenuNow(new Date());
    const timer = window.setInterval(() => setMenuNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      lockPage();
      const frame = window.requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
      return () => window.cancelAnimationFrame(frame);
    }

    unlockPage();
    return undefined;
  }, [isOpen]);

  useEffect(() => {
    closeMenu(false);
    unlockPage(false);
  }, [pathname]);

  useEffect(() => {
    const handlePageShow = () => {
      closeMenu(false);
      unlockPage(false);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") return;
      const container = menuDialogRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((node) => !node.hasAttribute("disabled"));

      if (focusable.length === 0) {
        event.preventDefault();
        closeButtonRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey) {
        if (active === first || !container.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    return () => unlockPage(false);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0.2 : 0.6,
          ease: [0.2, 0.65, 0.3, 0.9],
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "top-4 left-4 right-4 md:left-8 md:right-8 lg:left-auto lg:right-auto lg:max-w-4xl lg:mx-auto lg:inset-x-0"
            : ""
        }`}
      >
        <div className={`transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl shadow-elevated mx-auto"
            : ""
        }`}>
          {scrolled && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 opacity-50" />
            </div>
          )}

            <div className={`relative ${scrolled ? "px-4 md:px-6" : "container mx-auto px-6"}`}>
            <div className={`flex items-center justify-between transition-all duration-300 md:flex-row ${
              isRTL ? "flex-row-reverse" : "flex-row"
            } ${
              scrolled ? "h-14 md:h-16" : "h-16 md:h-20"
            }`}>
              <motion.button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-2.5 group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src="https://ophtalmologueagadir.com/wp-content/uploads/2025/10/cropped-sounnyfav.webp"
                  alt="Logo"
                  className="w-9 h-9 md:w-10 md:h-10 rounded-xl object-contain"
                />
              </motion.button>

              {/* Desktop CTA */}
              <motion.div
                className="hidden md:block"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <motion.div className="relative group" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-primary/50 to-primary rounded-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300 blur-[1px] group-hover:blur-0" />
                  <Button
                    onClick={() => navigate("/appointment")}
                    className="relative bg-foreground text-background hover:bg-foreground/90 text-sm font-medium px-5 h-10 gap-2 shadow-soft group-hover:shadow-prominent transition-all duration-300"
                  >
                    <Sparkles className="w-4 h-4" />
                    {t.getStarted}
                  </Button>
                </motion.div>
              </motion.div>

              {/* Mobile Menu Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:hidden relative w-12 h-12 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                onClick={toggleMenu}
                aria-label={isOpen ? t.closeMenuAria : t.openMenuAria}
                aria-expanded={isOpen}
                aria-controls="mobile-menu-dialog"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <X size={22} />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Menu size={22} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Scroll Progress */}
          <motion.div className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted/30 overflow-hidden rounded-b-2xl" style={{ opacity: scrolled ? 1 : 0 }}>
            <motion.div className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary" style={{ width: progressWidth }} />
          </motion.div>
        </div>
      </motion.nav>

      {/* Full-Screen Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.15 : 0.28 }}
            className="fixed inset-0 z-[60] md:hidden flex flex-col min-h-[100svh] h-[100dvh] bg-background/96 backdrop-blur-xl"
            id="mobile-menu-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-menu-title"
            ref={menuDialogRef}
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* Menu Header */}
            <div className="safe-top shrink-0 border-b border-border/40 px-4 sm:px-6 pt-2">
              <div className="flex min-h-16 items-center justify-between gap-3">
                <button
                  type="button"
                  className={`flex items-center gap-2.5 ${isRTL ? "text-right" : "text-left"}`}
                  onClick={() => {
                    closeMenu(false);
                    navigate("/");
                  }}
                >
                  <img
                    src="https://ophtalmologueagadir.com/wp-content/uploads/2025/10/cropped-sounnyfav.webp"
                    alt="Logo"
                    className="w-9 h-9 rounded-xl object-contain"
                  />
                  <div className={`min-w-0 ${isRTL ? "items-end" : "items-start"} flex flex-col`}>
                    <span id="mobile-menu-title" className="text-sm font-semibold text-foreground">
                      Sounny
                    </span>
                    <span className="text-[11px] leading-tight text-muted-foreground">
                      {isClinicOpen ? t.statusOpenShort : t.statusClosedShort}
                    </span>
                  </div>
                </button>
                <motion.button
                  ref={closeButtonRef}
                  className="w-12 h-12 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                  onClick={() => closeMenu()}
                  aria-label={t.closeMenuAria}
                  whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
                  type="button"
                >
                  <X size={22} />
                </motion.button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 pb-[max(env(safe-area-inset-bottom),1rem)] sm:px-6 sm:py-5">
              <div className="space-y-[24px]">
                <motion.section
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  transition={{ duration: shouldReduceMotion ? 0.14 : 0.24 }}
                  className={`relative overflow-hidden rounded-[28px] p-4 text-white shadow-none sm:p-5 ${widgetSurfaceClass}`}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/12 via-white/6 to-transparent"
                  />
                  <span
                    aria-hidden="true"
                    style={{ insetInlineStart: "-3.5rem" }}
                    className={`pointer-events-none absolute -top-14 h-32 w-32 rounded-full blur-3xl ${
                      isClinicOpen ? "bg-[hsl(175_64%_45%/0.24)]" : "bg-[hsl(217_18%_46%/0.18)]"
                    }`}
                  />

                  <div className="relative">
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0.12 : 0.2, delay: shouldReduceMotion ? 0 : 0.05 }}
                    className={`flex items-start gap-2.5 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                  >
                    <motion.span
                      aria-hidden="true"
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${statusDotClass}`}
                      animate={shouldReduceMotion ? undefined : { scale: [1, 1.3, 1], opacity: [0.86, 1, 0.9] }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    <div className={`min-w-0 flex-1 ${isRTL ? "w-full text-right" : "text-left"}`}>
                      <p className={`text-[17px] font-semibold leading-[1.32] text-white ${isRTL ? "w-full text-right" : ""}`}>
                        {greetingText}
                      </p>
                      <p className={`mt-1 text-[12px] leading-relaxed text-white/70 ${isRTL ? "w-full text-right" : ""}`}>
                        {isClinicOpen ? t.openNowNote : t.afterHoursNote}
                      </p>
                      {!isClinicOpen && (
                        <p className={`mt-0.5 text-[12px] leading-relaxed text-white/56 ${isRTL ? "w-full text-right" : ""}`}>
                          {isRTL ? (
                            <span className="block w-full text-right">
                              <span className="flex w-full max-w-full flex-wrap items-baseline justify-end gap-x-1 gap-y-0.5 text-right">
                                <span>{t.nextOpenAt}: </span>
                                {nextOpenLabelParts.localized && nextOpenLabelParts.day ? (
                                  <>
                                    <span>{nextOpenLabelParts.day}</span>
                                    <span
                                      dir="ltr"
                                      style={{ unicodeBidi: "isolate" }}
                                      className="tabular-nums whitespace-nowrap"
                                    >
                                      {nextOpenLabelParts.time}
                                    </span>
                                  </>
                                ) : (
                                  <span
                                    dir="ltr"
                                    style={{ unicodeBidi: "isolate" }}
                                    className="tabular-nums break-words"
                                  >
                                    {availability.nextOpenLabel}
                                  </span>
                                )}
                              </span>
                            </span>
                          ) : (
                            <>
                              <span>{t.nextOpenAt}: </span>
                              {nextOpenLabelParts.localized && nextOpenLabelParts.day ? (
                                <>
                                  <span>{nextOpenLabelParts.day} </span>
                                  <span
                                    dir="ltr"
                                    style={{ unicodeBidi: "isolate" }}
                                    className="tabular-nums whitespace-nowrap"
                                  >
                                    {nextOpenLabelParts.time}
                                  </span>
                                </>
                              ) : (
                                <span
                                  dir="ltr"
                                  style={{ unicodeBidi: "isolate" }}
                                  className="tabular-nums break-words"
                                >
                                  {availability.nextOpenLabel}
                                </span>
                              )}
                            </>
                          )}
                        </p>
                      )}
                    </div>
                  </motion.div>

                  <motion.a
                    href={heroAction.href}
                    target={heroAction.external ? "_blank" : undefined}
                    rel={heroAction.external ? "noopener noreferrer" : undefined}
                    onClick={() => closeMenu(false)}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0.12 : 0.2, delay: shouldReduceMotion ? 0 : 0.1 }}
                    className={`mt-4 flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-2xl px-4 py-3 font-semibold transition-all duration-200 active:scale-[0.98] ${
                      isRTL ? "text-right" : "text-left"
                    } ${heroButtonClass}`}
                  >
                    {heroAction.icon}
                    <span>{heroAction.label}</span>
                  </motion.a>

                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0.12 : 0.2, delay: shouldReduceMotion ? 0 : 0.15 }}
                    className="mt-4"
                  >
                    <p className={`text-[11px] font-medium text-white/52 ${isRTL ? "text-right tracking-normal" : "text-left tracking-[0.08em] uppercase"}`}>
                      {t.secondaryActionsLabel}
                    </p>
                    <div className={`mt-2 flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
                      {secondaryActionsForView.map((action) => (
                        <a
                          key={action.key}
                          href={action.href}
                          target={action.external ? "_blank" : undefined}
                          rel={action.external ? "noopener noreferrer" : undefined}
                          aria-label={action.label}
                          onClick={() => closeMenu(false)}
                          className={`flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-[13px] font-medium text-white/90 transition-all duration-200 active:scale-[0.98] ${
                            isRTL ? "text-right" : "text-left"
                          }`}
                        >
                          {action.icon}
                          <span className="whitespace-normal break-words text-center leading-tight">{action.label}</span>
                        </a>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: shouldReduceMotion ? 0.12 : 0.2, delay: shouldReduceMotion ? 0 : 0.2 }}
                    className="mt-4 space-y-2.5"
                  >
                    <a
                      href={PRIMARY_PHONE_HREF}
                      onClick={() => closeMenu(false)}
                      dir={isRTL ? "rtl" : "ltr"}
                      className={`w-full min-h-[54px] gap-3 rounded-2xl bg-white/9 px-3.5 py-2.5 transition-all duration-200 active:scale-[0.99] ${
                        isRTL
                          ? "grid grid-cols-[1fr_auto] items-center text-right"
                          : "flex items-center justify-between text-left"
                      }`}
                    >
                      <span className={`flex min-w-0 flex-1 flex-col ${isRTL ? "items-stretch text-right" : "items-start text-left"}`}>
                        <span className={`block w-full text-[11px] font-medium text-white/62 ${isRTL ? "text-right" : "text-left"}`}>{t.lineMain}</span>
                        <span className={`block w-full ${isRTL ? "text-right" : "text-left"}`}>
                          <span
                            dir="ltr"
                            style={{ unicodeBidi: "isolate" }}
                            className="inline-block text-[15px] font-semibold leading-tight text-white/94 tabular-nums"
                          >
                            {PRIMARY_PHONE}
                          </span>
                        </span>
                      </span>
                      <ChevronRight className={`h-4 w-4 text-white/55 ${isRTL ? "rotate-180" : ""}`} />
                    </a>

                    <a
                      href={SECONDARY_PHONE_HREF}
                      onClick={() => closeMenu(false)}
                      dir={isRTL ? "rtl" : "ltr"}
                      className={`w-full min-h-[54px] gap-3 rounded-2xl bg-white/7 px-3.5 py-2.5 transition-all duration-200 active:scale-[0.99] ${
                        isRTL
                          ? "grid grid-cols-[1fr_auto] items-center text-right"
                          : "flex items-center justify-between text-left"
                      }`}
                    >
                      <span className={`flex min-w-0 flex-1 flex-col ${isRTL ? "items-stretch text-right" : "items-start text-left"}`}>
                        <span className={`block w-full text-[11px] font-medium text-white/58 ${isRTL ? "text-right" : "text-left"}`}>{t.lineSupport}</span>
                        <span className={`block w-full ${isRTL ? "text-right" : "text-left"}`}>
                          <span
                            dir="ltr"
                            style={{ unicodeBidi: "isolate" }}
                            className="inline-block text-[15px] font-semibold leading-tight text-white/92 tabular-nums"
                          >
                            {SECONDARY_PHONE}
                          </span>
                        </span>
                      </span>
                      <ChevronRight className={`h-4 w-4 text-white/50 ${isRTL ? "rotate-180" : ""}`} />
                    </a>

                    <div
                      dir={isRTL ? "rtl" : "ltr"}
                      className={`min-h-[52px] w-full gap-3 rounded-2xl bg-white/7 px-3.5 py-2 ${
                        isRTL
                          ? "flex items-center text-right"
                          : "flex items-center justify-between text-left"
                      }`}
                    >
                      <Clock className={`h-4 w-4 shrink-0 text-white/62 ${isRTL ? "-scale-x-100" : ""}`} />
                      <span className={`flex min-w-0 flex-1 flex-col items-stretch ${isRTL ? "text-right" : "text-left"}`}>
                        <span className={`block w-full text-[11px] font-medium text-white/58 ${isRTL ? "text-right" : "text-left"}`}>
                          {t.hoursLabel}
                        </span>
                        <span
                          className={`mt-0.5 flex w-full flex-col gap-0.5 text-[12px] font-medium leading-5 text-white/82 ${
                            isRTL ? "items-end" : "items-start"
                          }`}
                        >
                          <span className={`block w-full ${isRTL ? "text-right" : "text-left"}`}>
                            <span>{t.hoursWeekdaysLabel}: </span>
                            <span
                              dir="ltr"
                              style={{ unicodeBidi: "isolate" }}
                              className="inline-block tabular-nums whitespace-nowrap align-baseline"
                            >
                              {t.hoursWeekdaysValue}
                            </span>
                          </span>
                          <span className={`block w-full ${isRTL ? "text-right" : "text-left"}`}>
                            <span>{t.hoursSaturdayLabel}: </span>
                            <span
                              dir="ltr"
                              style={{ unicodeBidi: "isolate" }}
                              className="inline-block tabular-nums whitespace-nowrap align-baseline"
                            >
                              {t.hoursSaturdayValue}
                            </span>
                          </span>
                        </span>
                      </span>
                    </div>
                  </motion.div>

                  </div>
                </motion.section>

                <motion.div
                  initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: shouldReduceMotion ? 0.12 : 0.22, delay: shouldReduceMotion ? 0 : 0.25 }}
                  className={`relative isolate overflow-hidden rounded-[22px] p-[3px] ${
                    supportsMaskedOrbit
                      ? ""
                      : "bg-[linear-gradient(145deg,rgba(58,168,160,0.48),rgba(58,168,160,0.24))]"
                  }`}
                >
                  {supportsMaskedOrbit && (
                    <>
                      <span
                        aria-hidden="true"
                        style={orbitRingMaskStyle}
                        className="pointer-events-none absolute inset-0 z-0 rounded-[22px] bg-[conic-gradient(from_0deg,rgba(58,168,160,0.5)_0deg,rgba(255,255,255,0.22)_70deg,rgba(58,168,160,0.24)_140deg,rgba(255,255,255,0.26)_215deg,rgba(58,168,160,0.34)_285deg,rgba(58,168,160,0.5)_360deg)]"
                      />
                      <motion.span
                        aria-hidden="true"
                        style={orbitRingHighlightStyle}
                        className="pointer-events-none absolute inset-0 z-0 rounded-[22px] bg-[conic-gradient(from_0deg,rgba(255,255,255,0)_0deg,rgba(255,255,255,0)_262deg,rgba(58,168,160,0.24)_286deg,rgba(58,168,160,0.78)_316deg,rgba(255,255,255,0.9)_336deg,rgba(58,168,160,0.52)_352deg,rgba(255,255,255,0)_360deg)]"
                        animate={shouldReduceMotion ? undefined : { rotate: 360 }}
                        transition={shouldReduceMotion ? undefined : { duration: 4.8, ease: "linear", repeat: Infinity }}
                      />
                    </>
                  )}

                  <div className="relative z-10 overflow-hidden rounded-[19px] border border-[rgba(255,255,255,0.78)] bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,255,255,0.78))] p-4 text-[#1a2a3a] shadow-none">
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 -z-10 rounded-[19px] bg-[radial-gradient(120%_80%_at_50%_0%,rgba(255,255,255,0.16),rgba(255,255,255,0.02)_36%,rgba(255,255,255,0)_60%)]"
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-[20%] top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(58,168,160,0.16),transparent)]"
                    />

                    <div className={`mb-3 flex items-center justify-between gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}>
                        <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[linear-gradient(145deg,rgba(58,168,160,0.1),rgba(58,168,160,0.05))]">
                          <Globe className="h-3.5 w-3.5 text-[hsl(170_52%_42%)]" />
                        </span>
                        <span className="text-[13px] font-semibold text-[#4a5568]">{t.languageLabel}</span>
                      </div>
                      <span className={`text-[11px] font-medium text-[#6b7280] ${isRTL ? "text-left" : "text-right"}`}>{t.languageHint}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {menuLanguageOptions.map((option) => {
                        const isActiveLanguage = currentLanguage === option.code;
                        return (
                          <motion.button
                            key={option.code}
                            type="button"
                            onClick={() => setLanguage(option.code)}
                            aria-pressed={isActiveLanguage}
                            className={`group relative flex min-h-[82px] flex-col justify-between overflow-hidden rounded-2xl border-[1.5px] px-3 py-2.5 transition-all duration-200 ${
                              isActiveLanguage
                                ? "border-[rgba(58,168,160,0.3)] bg-white shadow-none"
                                : "border-[rgba(0,0,0,0.04)] bg-[rgba(255,255,255,0.4)] shadow-none"
                            } ${
                              shouldReduceMotion
                                ? ""
                                : "hover:-translate-y-px hover:border-[rgba(58,168,160,0.15)]"
                            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(58,168,160,0.42)] focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-[rgba(58,168,160,0.32)] ${option.dir === "rtl" ? "text-right" : "text-left"}`}
                            whileTap={{ scale: shouldReduceMotion ? 1 : 0.985 }}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none absolute inset-0 rounded-2xl ${
                                isActiveLanguage ? "bg-[linear-gradient(145deg,rgba(255,255,255,0.96),rgba(255,255,255,0.86))]" : ""
                              }`}
                            />
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(58,168,160,0.12),rgba(58,168,160,0.03))] transition-opacity duration-200 ${
                                shouldReduceMotion ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                              }`}
                            />

                            {isActiveLanguage &&
                              (shouldReduceMotion ? (
                                <span
                                  className={`absolute top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(170_52%_42%)] text-white ${
                                    isRTL ? "left-2" : "right-2"
                                  }`}
                                >
                                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                                </span>
                              ) : (
                                <motion.span
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                  className={`absolute top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(170_52%_42%)] text-white ${
                                    isRTL ? "left-2" : "right-2"
                                  }`}
                                >
                                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                                </motion.span>
                              ))}

                            <span
                              dir={option.dir}
                              className={`relative z-10 text-[18px] font-bold leading-[1.1] ${option.fontClass} ${
                                isActiveLanguage ? "text-[#1a2a3a]" : "text-[#4a5568]"
                              }`}
                            >
                              {option.nativeLabel}
                            </span>
                            <span className="relative z-10 flex items-center gap-1 text-[11px] font-medium text-[#6b7280]">
                              {option.code === "zgh" ? (
                                <AmazighMenuFlag />
                              ) : (
                                <span className="text-[13px] leading-none" role="img" aria-hidden="true">
                                  {option.flag}
                                </span>
                              )}
                              <span>{option.englishLabel}</span>
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
