import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Brain, Globe, Sparkles } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import FloatingOrb from "@/components/shared/FloatingOrb";

const languages: { code: Language; label: string; subtitle: string }[] = [
  { code: "ar", label: "العربية", subtitle: "Arabic" },
  { code: "en", label: "English", subtitle: "English" },
  { code: "fr", label: "Français", subtitle: "French" },
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
          className="absolute top-[15%] left-[10%] hidden lg:block"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-2 border-primary/20"
            style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.5, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute top-[25%] right-[15%] hidden md:block"
        >
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-12 h-12 rounded-full border-2 border-accent/30 bg-accent/5"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, rotate: -45 }}
          animate={{ opacity: 0.4, rotate: 45 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="absolute bottom-[30%] left-[8%] hidden lg:block"
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
          className="absolute bottom-[20%] right-[10%] hidden md:block"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-full border-4 border-primary/15"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: 0.5, rotate: 180 }}
          transition={{ duration: 1.5, delay: 1.3 }}
          className="absolute top-[60%] right-[25%] hidden lg:block"
        >
          <motion.div
            animate={{ rotate: [0, 90, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-8 h-8"
          >
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-accent/30 -translate-y-1/2" />
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-accent/30 -translate-x-1/2" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Parallax floating orbs */}
      <motion.div style={{ x: orbX1, y: orbY1 }} className="absolute inset-0 pointer-events-none hidden sm:block">
        <FloatingOrb className="bg-primary/15 -top-20 -right-32" size="w-[300px] h-[300px] md:w-[500px] md:h-[500px]" delay={0.2} />
      </motion.div>
      <motion.div style={{ x: orbX2, y: orbY2 }} className="absolute inset-0 pointer-events-none hidden md:block">
        <FloatingOrb className="bg-accent/10 top-1/3 -left-40" size="w-[400px] h-[400px] lg:w-[600px] lg:h-[600px]" delay={0.5} />
      </motion.div>
      <FloatingOrb className="bg-primary/8 bottom-20 right-1/4 hidden lg:block" size="w-[400px] h-[400px]" delay={0.8} />

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="relative z-10 flex flex-col items-center gap-8 px-6"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary font-medium text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-primary/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
            Choose Your Experience
          </span>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-2xl blur-xl" />
            <div className="relative bg-primary rounded-2xl p-3">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <span className="font-display text-3xl font-bold text-foreground tracking-tight">
            Junior AI
          </span>
        </motion.div>

        {/* Welcome text with gradient */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-3"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-[0.95] tracking-[-0.04em]">
            <span className="text-foreground">مرحباً · </span>
            <motion.span
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, delay: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
              className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient"
            >
              Welcome
            </motion.span>
            <span className="text-foreground"> · Bienvenue</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Globe className="w-4 h-4" />
            <p className="text-lg">Choose your language</p>
          </div>
        </motion.div>

        {/* Language cards with glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mt-4"
        >
          {languages.map((lang, i) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(lang.code)}
              className="group relative w-48 rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md p-8 text-center cursor-pointer transition-all duration-300 hover:border-primary/50 hover:bg-card/80 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative space-y-2">
                <span className={`block text-2xl font-bold text-foreground font-display ${lang.code === 'ar' ? 'font-sans' : ''}`}>
                  {lang.label}
                </span>
                <span className="block text-sm text-muted-foreground">
                  {lang.subtitle}
                </span>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Welcome;
