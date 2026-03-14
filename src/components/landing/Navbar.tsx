import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, Phone, MapPin, Clock } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useCTAModal } from "@/contexts/CTAModalContext";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const contactItems = [
  { type: "phone", label: "0528 333 836", href: "tel:0528333836", icon: Phone },
  { type: "phone", label: "0528 333 837", href: "tel:0528333837", icon: Phone },
  { type: "whatsapp", label: "0660 077 768", href: "https://wa.me/212660077768", icon: null },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const { openModal } = useCTAModal();
  const navigate = useNavigate();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsOpen(false);
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
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
          {/* Animated gradient border when scrolled */}
          {scrolled && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 opacity-50" />
            </div>
          )}
          
          <div className={`relative ${scrolled ? "px-4 md:px-6" : "container mx-auto px-6"}`}>
            <div className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? "h-14 md:h-16" : "h-16 md:h-20"
            }`}>
              {/* Animated Logo */}
              <motion.a 
                href="#" 
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
              </motion.a>

              {/* Desktop nav links hidden per design */}

              {/* Desktop CTA Button */}
              <motion.div 
                className="hidden md:block"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <motion.div
                  className="relative group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Animated gradient border */}
                  <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-primary/50 to-primary rounded-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300 blur-[1px] group-hover:blur-0" />
                  <Button 
                    onClick={() => navigate("/appointment")}
                    className="relative bg-foreground text-background hover:bg-foreground/90 text-sm font-medium px-5 h-10 gap-2 shadow-soft group-hover:shadow-prominent transition-all duration-300"
                  >
                    <Sparkles className="w-4 h-4" />
                    Get Started
                  </Button>
                </motion.div>
              </motion.div>

              {/* Mobile Menu Button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="md:hidden relative w-12 h-12 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={22} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={22} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>

          {/* Scroll Progress Bar */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted/30 overflow-hidden rounded-b-2xl"
            style={{ opacity: scrolled ? 1 : 0 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary"
              style={{ width: progressWidth }}
            />
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Menu Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative h-full flex flex-col pt-24 pb-8 px-6 safe-top safe-bottom"
            >
              {/* Gradient accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
              
              {/* Dot grid pattern */}
              <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

              {/* Navigation Links */}
              <nav className="flex-1 flex flex-col gap-2 relative z-10">
                {navLinks.map((link, i) => {
                  const Icon = link.icon;
                  const isActive = activeSection === link.href.replace("#", "");
                  
                  return (
                    <motion.button
                      key={link.name}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 30 }}
                      transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
                      onClick={() => scrollToSection(link.href)}
                      className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all duration-300 min-h-[64px] ${
                        isActive 
                          ? "bg-primary/10 border border-primary/20" 
                          : "bg-muted/30 hover:bg-muted/50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          isActive 
                            ? "bg-gradient-to-br from-primary to-primary/60 text-primary-foreground shadow-soft" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-lg font-medium ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {link.name}
                        </span>
                      </div>
                      <ArrowRight className={`w-5 h-5 transition-transform duration-300 ${
                        isActive ? "text-primary translate-x-1" : "text-muted-foreground"
                      }`} />
                    </motion.button>
                  );
                })}
              </nav>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="relative z-10 mb-8"
              >
                <div className="relative group">
                  {/* Animated gradient border */}
                  <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-primary/50 to-primary rounded-2xl opacity-70 blur-[2px]" />
                  <Button 
                    onClick={() => { navigate("/appointment"); setIsOpen(false); }}
                    className="relative w-full h-16 bg-foreground text-background hover:bg-foreground/90 font-semibold text-lg gap-3 rounded-2xl shadow-prominent"
                  >
                    <Sparkles className="w-5 h-5" />
                    Get Started
                  </Button>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="relative z-10 flex items-center justify-center gap-4"
              >
                {socialLinks.map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                      className="w-12 h-12 rounded-xl bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all duration-300"
                      aria-label={social.label}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.a>
                  );
                })}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
