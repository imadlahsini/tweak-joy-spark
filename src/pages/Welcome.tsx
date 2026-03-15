import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Language, useLanguage } from "@/contexts/LanguageContext";
import LanguageFlag from "@/components/shared/LanguageFlag";

type SelectorLanguage = Exclude<Language, null>;
type GreetingScript = "ar" | "zgh" | "latin";

type LanguageOption = {
  code: SelectorLanguage;
  label: string;
  subtitle: string;
  greetingLabel: string;
};

type UiCopy = {
  chooseLanguage: string;
  changeLater: string;
};

type GreetingCycleItem = {
  value: string;
  script: GreetingScript;
};

const LOGO_SRC = "https://ophtalmologueagadir.com/wp-content/uploads/2025/10/cropped-sounnyfav.webp";

const languages: LanguageOption[] = [
  { code: "ar", label: "العربية", subtitle: "Arabic", greetingLabel: "مرحباً" },
  { code: "zgh", label: "ⵜⴰⵎⴰⵣⵉⵖⵜ", subtitle: "Tamazight", greetingLabel: "ⴰⵣⵓⵍ" },
  { code: "en", label: "English", subtitle: "English", greetingLabel: "WELCOME" },
  { code: "fr", label: "Français", subtitle: "French", greetingLabel: "BIENVENUE" },
];

const uiCopyByLanguage: Record<SelectorLanguage, UiCopy> = {
  en: {
    chooseLanguage: "Choose your language",
    changeLater: "You can always change this later",
  },
  fr: {
    chooseLanguage: "Choisissez votre langue",
    changeLater: "Vous pourrez toujours modifier cela plus tard",
  },
  ar: {
    chooseLanguage: "اختر لغتك",
    changeLater: "يمكنك دائمًا تغيير هذا لاحقًا",
  },
  zgh: {
    chooseLanguage: "ⴼⵔⵏ ⵜⵓⵜⵍⴰⵢⵜ ⵏⵏⴽ",
    changeLater: "ⵜⵣⵎⵔⴷ ⴰⴷ ⵜⵙⵏⴼⵍⴷ ⴰⵢⴰ ⴹⴰⵕⵜ",
  },
};

const greetingCycle: GreetingCycleItem[] = [
  { value: "مرحباً", script: "ar" },
  { value: "ⴰⵣⵓⵍ", script: "zgh" },
  { value: "Bienvenue", script: "latin" },
  { value: "Welcome", script: "latin" },
];

const scriptFontClass = (script: GreetingScript) => {
  if (script === "ar") return "font-greeting-ar";
  if (script === "zgh") return "font-greeting-zgh";
  return "font-greeting-latin";
};

const languageFontClass = (code: SelectorLanguage) => {
  if (code === "ar") return "font-greeting-ar";
  if (code === "zgh") return "font-greeting-zgh";
  return "font-greeting-latin";
};

const Welcome = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion() ?? false;

  const currentLanguage: SelectorLanguage = (language ?? "en") as SelectorLanguage;
  const copy = uiCopyByLanguage[currentLanguage];
  const isRTL = currentLanguage === "ar";

  const [greetingIndex, setGreetingIndex] = useState(0);
  const [greetingCycleStarted, setGreetingCycleStarted] = useState(false);

  useEffect(() => {
    if (shouldReduceMotion) {
      setGreetingCycleStarted(false);
      return;
    }

    const startTimer = window.setTimeout(() => {
      setGreetingCycleStarted(true);
    }, 700);

    return () => {
      window.clearTimeout(startTimer);
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion || !greetingCycleStarted) return;

    const interval = window.setInterval(() => {
      setGreetingIndex((prev) => (prev + 1) % greetingCycle.length);
    }, 2000);

    return () => {
      window.clearInterval(interval);
    };
  }, [greetingCycleStarted, shouldReduceMotion]);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    navigate("/appointment");
  };

  const revealTransition = (delay: number) =>
    shouldReduceMotion
      ? { duration: 0 }
      : { duration: 0.42, delay, ease: [0.2, 0.65, 0.3, 0.9] as const };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="relative min-h-[100svh] overflow-hidden bg-[linear-gradient(160deg,#eaf4fb_0%,#f0f0f8_40%,#faf5ee_100%)]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(58,168,160,0.08),transparent_62%)]" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[420px] flex-col items-center justify-center px-4 py-8">
        <header className="flex w-full flex-col items-center">
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={revealTransition(0.2)}
            className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full bg-[linear-gradient(180deg,rgba(58,168,160,0.12),rgba(58,168,160,0.04))]"
          >
            {!shouldReduceMotion && (
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 rounded-full border-[1.5px] border-[rgba(58,168,160,0.15)]"
                animate={{ scale: [1, 1.06, 1], opacity: [0.2, 0.32, 0.2] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <img
              src={LOGO_SRC}
              alt="Sounny"
              className="h-14 w-14 rounded-[14px] object-cover shadow-[0_8px_20px_rgba(26,42,58,0.18)]"
            />
          </motion.div>

          <motion.p
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={revealTransition(0.5)}
            className="mt-4 text-center text-[13px] font-semibold tracking-[2.5px] text-[#1a2a3a]"
          >
            SOUNNY
          </motion.p>

          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={revealTransition(0.6)}
            className="mt-3 h-[2px] w-8 bg-[linear-gradient(90deg,transparent,rgba(58,168,160,0.85),transparent)]"
          />

          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={revealTransition(0.7)}
            className="mt-4 flex min-h-[42px] w-full items-center justify-center"
          >
            {shouldReduceMotion ? (
              <div className="flex flex-col items-center gap-0.5 text-center">
                {greetingCycle.map((item) => (
                  <p
                    key={item.value}
                    className={`text-[20px] font-light leading-tight text-[#3aa8a0] ${scriptFontClass(item.script)}`}
                  >
                    {item.value}
                  </p>
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`${greetingCycleStarted}-${greetingCycle[greetingIndex].value}`}
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.34, ease: "easeOut" }}
                  className={`text-center text-[30px] font-light leading-none text-[#3aa8a0] ${scriptFontClass(
                    greetingCycle[greetingIndex].script
                  )}`}
                >
                  {greetingCycle[greetingIndex].value}
                </motion.p>
              </AnimatePresence>
            )}
          </motion.div>

          <motion.p
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={revealTransition(0.9)}
            className="mt-2 text-center text-[14px] font-normal text-[#9ca8b8]"
          >
            {copy.chooseLanguage}
          </motion.p>
        </header>

        <section className="mt-7 w-full max-w-[380px] space-y-3">
          {languages.map((lang, index) => {
            const arrowMotionClass = isRTL
              ? "rotate-180 group-hover:-translate-x-0.5"
              : "group-hover:translate-x-0.5";

            return (
              <motion.button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.42,
                        delay: 1.1 + index * 0.07,
                        ease: [0.2, 0.65, 0.3, 0.9],
                      }
                }
                whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="group relative w-full overflow-hidden rounded-[20px] border border-[rgba(255,255,255,0.9)] bg-[rgba(255,255,255,0.65)] backdrop-blur-[16px] shadow-[0_1px_3px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.04)] transition-all duration-250 hover:border-[rgba(58,168,160,0.25)] hover:shadow-[0_1px_3px_rgba(0,0,0,0.04),0_12px_28px_rgba(58,168,160,0.14)]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(58,168,160,0.08),rgba(58,168,160,0.02)_50%,transparent_80%)] opacity-0 transition-opacity duration-250 group-hover:opacity-100"
                />

                <div className={`relative flex min-h-[94px] items-stretch ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="relative flex w-[72px] shrink-0 items-center justify-center" dir="ltr">
                    <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] transition-transform duration-250 group-hover:scale-[1.08]">
                      <LanguageFlag code={lang.code} variant="selector-circle" className="h-11 w-11" />
                    </div>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute ${isRTL ? "left-0" : "right-0"} top-3 bottom-3 w-px bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.06),transparent)]`}
                    />
                  </div>

                  <div
                    className={`flex min-w-0 flex-1 flex-col justify-center gap-[1px] px-4 ${
                      isRTL ? "items-end text-right" : "items-start text-left"
                    }`}
                  >
                    <span className="text-[11px] font-bold tracking-[1.2px] text-[#3aa8a0]">{lang.greetingLabel}</span>
                    <span className={`text-[20px] font-bold leading-[1.12] text-[#1a2a3a] ${languageFontClass(lang.code)}`}>
                      {lang.label}
                    </span>
                    <span className="text-[12px] font-medium text-[#6f7d8f]">{lang.subtitle}</span>
                  </div>

                  <div className="flex w-[56px] shrink-0 items-center justify-center" dir="ltr">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-250 group-hover:bg-[rgba(58,168,160,0.1)]">
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 16 16"
                        fill="none"
                        className={`h-4 w-4 text-[#c0c8d4] transition-all duration-250 group-hover:text-[#3aa8a0] ${arrowMotionClass}`}
                      >
                        <path d="M4 8h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8 4.5L11.5 8L8 11.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </section>

        <motion.p
          initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={revealTransition(1.6)}
          className="mt-9 text-center text-[12px] font-normal text-[#b0bec5]"
        >
          {copy.changeLater}
        </motion.p>
      </div>
    </div>
  );
};

export default Welcome;
