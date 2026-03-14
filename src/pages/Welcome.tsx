import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import FloatingOrb from "@/components/shared/FloatingOrb";
import LanguageFlag from "@/components/shared/LanguageFlag";

type LanguageOption = {
  code: Exclude<Language, null>;
  label: string;
  subtitle: string;
  greeting: string;
};

const languages: LanguageOption[] = [
  { code: "ar", label: "العربية", subtitle: "Arabic", greeting: "مرحباً" },
  { code: "zgh", label: "ⵜⴰⵎⴰⵣⵉⵖⵜ", subtitle: "Tamazight", greeting: "ⴰⵣⵓⵍ" },
  { code: "en", label: "English", subtitle: "English", greeting: "Hello" },
  { code: "fr", label: "Français", subtitle: "French", greeting: "Bonjour" },
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


  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    navigate("/appointment");
  };

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

      {/* Bottom background image — faded & blurred */}
      <div className="absolute bottom-0 left-0 right-0 h-[50%] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent z-10" />
        <img
          src="https://ophtalmologueagadir.com/wp-content/uploads/2025/10/hero-image2.webp"
          alt=""
          loading="lazy"
          className="w-full h-full object-cover object-top opacity-20 blur-sm"
        />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 px-5 w-full max-w-lg sm:max-w-none"
      >
        {/* Language cards */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 w-full sm:w-auto">
          {languages.map((lang, i) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.08, ease: [0.2, 0.65, 0.3, 0.9] }}
              whileHover={{ scale: 1.04, y: -6 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(lang.code)}
              className="group relative w-full sm:w-56 rounded-2xl cursor-pointer overflow-hidden"
            >
              {/* Animated gradient border */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/15 to-primary/20 bg-[length:200%_200%] animate-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-accent/20 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Card inner */}
	              <div className="relative m-[1px] rounded-2xl bg-card/70 backdrop-blur-xl border border-border/40 overflow-hidden group-hover:border-primary/30 transition-all duration-300 group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.1)]">
                {/* Shimmer sweep */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
                </div>

                {/* Top gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

	                <div className="relative z-10 flex items-stretch">
	                  <div className="relative z-[1] w-[42%] sm:w-[40%] shrink-0 pointer-events-none overflow-hidden">
	                    <LanguageFlag code={lang.code} variant="embed" className="h-full w-full opacity-[0.84] saturate-[1.04]" />
	                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,transparent_22%,hsl(var(--card)/0.22)_52%,hsl(var(--card)/0.62)_72%,hsl(var(--card)/0.92)_88%,hsl(var(--card))_100%)]" />
	                  </div>

	                  <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5 sm:px-5 sm:py-4">
	                    {/* Text content */}
	                    <div className="min-w-0 flex-1 text-left">
	                    <span className="block text-[11px] text-primary/80 font-medium tracking-wider uppercase mb-0.5">
	                      {lang.greeting}
	                    </span>
	                    <span className={`block text-lg sm:text-xl leading-tight font-bold text-foreground font-display ${lang.code === "ar" || lang.code === "zgh" ? "font-sans" : ""}`}>
	                      {lang.label}
                    </span>
                    <span className="block text-[11px] text-muted-foreground mt-0">
                      {lang.subtitle}
                    </span>
	                    </div>

	                    {/* Arrow — slides in on hover */}
	                    <div className="flex-shrink-0 sm:hidden">
	                      <div className="w-8 h-8 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-all duration-300">
	                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all duration-300" />
	                      </div>
	                    </div>
	                    <div className="hidden sm:block">
	                      <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-all duration-300" />
	                    </div>
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
