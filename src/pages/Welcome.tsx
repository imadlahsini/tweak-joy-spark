import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Brain, Globe } from "lucide-react";
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
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Background orbs */}
      <FloatingOrb className="bg-primary/20 -top-32 -left-32" delay={0} size="w-96 h-96" />
      <FloatingOrb className="bg-accent/15 -bottom-40 -right-40" delay={2} size="w-[30rem] h-[30rem]" />
      <FloatingOrb className="bg-purple-glow/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" delay={1} size="w-[40rem] h-[40rem]" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }}
        className="relative z-10 flex flex-col items-center gap-8 px-6"
      >
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

        {/* Welcome text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-3"
        >
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground">
            مرحباً · Welcome · Bienvenue
          </h1>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Globe className="w-4 h-4" />
            <p className="text-lg">Choose your language</p>
          </div>
        </motion.div>

        {/* Language cards */}
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
              className="group relative w-48 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 text-center cursor-pointer transition-colors hover:border-primary/50 hover:bg-card"
            >
              <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
