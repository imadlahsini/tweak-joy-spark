import { useState, useEffect, forwardRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles, Phone, Clock } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

const WhatsAppIcon = forwardRef<SVGSVGElement, { className?: string }>(
  ({ className, ...props }, ref) => (
    <svg ref={ref} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
);
WhatsAppIcon.displayName = "WhatsAppIcon";

const contactItems = [
  { type: "phone" as const, label: "Téléphone", value: "0528 333 836", href: "tel:0528333836", icon: Phone },
  { type: "phone" as const, label: "Téléphone", value: "0528 333 837", href: "tel:0528333837", icon: Phone },
  { type: "whatsapp" as const, label: "WhatsApp", value: "0660 077 768", href: "https://wa.me/212660077768", icon: null },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

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
          {scrolled && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 opacity-50" />
            </div>
          )}

          <div className={`relative ${scrolled ? "px-4 md:px-6" : "container mx-auto px-6"}`}>
            <div className={`flex items-center justify-between transition-all duration-300 ${
              scrolled ? "h-14 md:h-16" : "h-16 md:h-20"
            }`}>
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
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] md:hidden flex flex-col h-[100dvh] bg-background"
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between px-6 h-20 shrink-0 border-b border-border/40">
              <a href="#" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                <img
                  src="https://ophtalmologueagadir.com/wp-content/uploads/2025/10/cropped-sounnyfav.webp"
                  alt="Logo"
                  className="w-9 h-9 rounded-xl object-contain"
                />
              </a>
              <motion.button
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                whileTap={{ scale: 0.9 }}
              >
                <X size={22} />
              </motion.button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-3">
              {contactItems.map((item, i) => {
                const isWhatsApp = item.type === "whatsapp";
                return (
                  <motion.a
                    key={item.value}
                    href={item.href}
                    target={isWhatsApp ? "_blank" : undefined}
                    rel={isWhatsApp ? "noopener noreferrer" : undefined}
                    onClick={() => setIsOpen(false)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.25, delay: 0.05 + i * 0.06 }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 active:scale-[0.98] min-h-[72px] ${
                      isWhatsApp
                        ? "bg-[hsl(142,70%,96%)] border-[hsl(142,50%,80%)] hover:border-[hsl(142,60%,60%)] hover:shadow-md"
                        : "bg-card border-border/60 hover:border-primary/40 hover:shadow-md"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                      isWhatsApp
                        ? "bg-[hsl(142,70%,40%)] text-white shadow-sm"
                        : "bg-primary/10 text-primary"
                    }`}>
                      {isWhatsApp ? <WhatsAppIcon className="w-5 h-5" /> : <item.icon className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.label}</span>
                      <span className="text-base font-semibold text-foreground">{item.value}</span>
                    </div>
                  </motion.a>
                );
              })}

              {/* Working Hours */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.25, delay: 0.25 }}
                className="flex items-center gap-4 p-4 rounded-2xl border border-border/60 bg-card min-h-[72px]"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-accent/50 text-accent-foreground">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Horaires</span>
                  <span className="text-base font-semibold text-foreground">Lun – Ven : 9h – 18h</span>
                </div>
              </motion.div>
            </div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="shrink-0 px-6 pb-8 pt-4 border-t border-border/40 safe-bottom"
            >
              <Button
                asChild
                className="w-full h-14 bg-foreground text-background hover:bg-foreground/90 font-semibold text-base gap-3 rounded-2xl shadow-prominent"
                onClick={() => setIsOpen(false)}
              >
                <a href="tel:0528333836">
                  <Phone className="w-5 h-5" />
                  Appeler maintenant
                </a>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
