import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Brain, ArrowRight } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import FloatingOrb from "@/components/shared/FloatingOrb";

const languages: { code: Language; label: string; subtitle: string; flag: string; greeting: string }[] = [
  { code: "ar", label: "العربية", subtitle: "Arabic", flag: "🇸🇦", greeting: "مرحباً" },
  { code: "en", label: "English", subtitle: "English", flag: "🇺🇸", greeting: "Hello" },
  { code: "fr", label: "Français", subtitle: "French", flag: "🇫🇷", greeting: "Bonjour" },
];

const Welcome = () => {
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const orbX1 = useTransform(mouseX, [-500, 500], [-20, 20]);
  const orbY1 = useTransform(mouseY, [-500, 500], [-20, 20]);
  const orbX2 = useTransform(mouseX, [-500, 500], [15, -15]);
  const orbY2 = useTransform(mouseY, [-500, 500], [10, -10]);
  const shapeRotate = useTransform(mouseX, [-500, 500], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    }
  };

  useEffect(() => {
    if (language) {
      navigate("/home", { replace: true });
    }
  }, [language, navigate]);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    navigate("/home");
  };

  if (language) return null;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden"
    >
      {/* Animated gradient mesh background */}
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
      <motion.div style={{ rotate: shapeRotate }} className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute top-[15%] left-[10%]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 md:w-16 md:h-16 border-2 border-primary/20"
            style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute top-[20%] right-[12%]"
        >
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-accent/30 bg-accent/5"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, rotate: -45 }}
          animate={{ opacity: 0.4, rotate: 45 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="absolute bottom-[30%] left-[8%] hidden md:block"
        >
          <motion.div
            animate={{ rotate: [45, 135, 45] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 border-2 border-primary/20 bg-primary/5"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          className="absolute bottom-[20%] right-[10%]"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 md:w-20 md:h-20 rounded-full border-4 border-primary/15"
          />
        </motion.div>
      </motion.div>

      {/* Parallax floating orbs — visible on mobile too */}
      <motion.div style={{ x: orbX1, y: orbY1 }} className="absolute inset-0 pointer-events-none">
        <FloatingOrb className="bg-primary/15 -top-20 -right-32" size="w-[200px] h-[200px] md:w-[500px] md:h-[500px]" delay={0.2} />
      </motion.div>
      <motion.div style={{ x: orbX2, y: orbY2 }} className="absolute inset-0 pointer-events-none">
        <FloatingOrb className="bg-accent/10 top-1/3 -left-40" size="w-[250px] h-[250px] lg:w-[600px] lg:h-[600px]" delay={0.5} />
      </motion.div>

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="relative z-10 flex flex-col items-center gap-5 sm:gap-8 px-5 w-full max-w-lg sm:max-w-none"
      >
        {/* Next-level animated logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
          className="relative flex flex-col items-center gap-5"
        >
          {/* Icon with layered rings */}
          <div className="relative flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36">
            {/* Outer rotating dashed ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
            />
            {/* Second ring rotating opposite */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border border-accent/20"
            />
            {/* Middle pulsing glow */}
            <div className="absolute inset-4 rounded-full bg-primary/20 blur-xl animate-pulse" />
            {/* Inner glass container */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-primary/20 via-card/80 to-accent/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center shadow-[0_0_60px_hsl(var(--primary)/0.3)]">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10" />
              <Brain className="relative w-10 h-10 sm:w-12 sm:h-12 text-primary drop-shadow-lg" />
            </div>

            {/* Orbital dots */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.6)]" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-2 h-2 rounded-full bg-accent shadow-[0_0_10px_hsl(var(--accent)/0.6)]" />
            </motion.div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-foreground/50 shadow-[0_0_8px_hsl(var(--foreground)/0.3)]" />
            </motion.div>
          </div>

          {/* Text below — stacked */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col items-center gap-1"
          >
            <div className="flex items-baseline gap-2 font-display">
              <span className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight">Junior</span>
              <span className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient tracking-tight">AI</span>
            </div>
            {/* Accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="w-16 h-[2px] mt-2 rounded-full bg-gradient-to-r from-primary to-accent"
            />
          </motion.div>
        </motion.div>

        {/* Language cards */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full sm:w-auto">
          {languages.map((lang, i) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, delay: 0.7 + i * 0.12, ease: [0.2, 0.65, 0.3, 0.9] }}
              whileHover={{ scale: 1.04, y: -6 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(lang.code)}
              className="group relative w-full sm:w-56 rounded-2xl cursor-pointer overflow-hidden"
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/40 via-accent/30 to-primary/40 bg-[length:200%_200%] animate-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Card inner */}
              <div className="relative m-[1px] rounded-2xl bg-card/70 backdrop-blur-xl border border-border/40 group-hover:border-primary/30 transition-all duration-300 group-hover:shadow-[0_0_40px_hsl(var(--primary)/0.2),0_0_80px_hsl(var(--primary)/0.08)]">
                {/* Shimmer sweep */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                </div>

                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative flex items-center gap-4 px-5 py-5 sm:flex-col sm:items-center sm:gap-3 sm:px-6 sm:py-7">
                  {/* Flag with glow */}
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 scale-150 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="relative text-5xl sm:text-6xl block leading-none drop-shadow-lg">
                      {lang.flag}
                    </span>
                  </div>

                  {/* Text content */}
                  <div className="flex-1 text-left sm:text-center min-w-0">
                    <span className="block text-xs text-primary/80 font-medium tracking-wider uppercase mb-0.5">
                      {lang.greeting}
                    </span>
                    <span className={`block text-xl sm:text-2xl font-bold text-foreground font-display ${lang.code === 'ar' ? 'font-sans' : ''}`}>
                      {lang.label}
                    </span>
                    <span className="block text-xs text-muted-foreground mt-0.5">
                      {lang.subtitle}
                    </span>
                  </div>

                  {/* Arrow — slides in on hover */}
                  <div className="flex-shrink-0 sm:hidden">
                    <ArrowRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                  <div className="hidden sm:block">
                    <ArrowRight className="w-4 h-4 text-muted-foreground/0 group-hover:text-primary transition-all duration-300 translate-y-1 group-hover:translate-y-0" />
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Welcome;
