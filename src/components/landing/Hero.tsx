import { motion, useMotionValue, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { useRef } from "react";
import TextReveal from "@/components/shared/TextReveal";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import FloatingOrb from "@/components/shared/FloatingOrb";
import HeroDashboard from "./HeroDashboard";
import { useCTAModal } from "@/contexts/CTAModalContext";

const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const { openModal } = useCTAModal();

  // Parallax transforms based on mouse position
  const orbX1 = useTransform(mouseX, [-500, 500], [-20, 20]);
  const orbY1 = useTransform(mouseY, [-500, 500], [-20, 20]);
  const orbX2 = useTransform(mouseX, [-500, 500], [15, -15]);
  const orbY2 = useTransform(mouseY, [-500, 500], [10, -10]);
  const shapeRotate = useTransform(mouseX, [-500, 500], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    }
  };

  const scrollToNext = () => {
    window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" });
  };

  const stats = [
    { value: 287, suffix: "%", label: "Avg. Traffic Growth" },
    { value: 43, suffix: "", label: "Page 1 Keywords" },
    { value: 127, suffix: "", label: "Happy Clients" },
  ];

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative md:min-h-[100dvh] flex flex-col items-center pt-16 sm:pt-20 md:pt-24 pb-4 sm:pb-10 md:pb-12"
    >
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            rotate: [0, -5, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-accent/15 via-transparent to-transparent blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/3 w-1/2 h-1/2 bg-gradient-radial from-primary/10 via-transparent to-transparent blur-3xl"
        />
      </div>

      {/* Background layers */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      
      {/* Floating geometric shapes */}
      <motion.div 
        style={{ rotate: shapeRotate }}
        className="absolute inset-0 pointer-events-none overflow-hidden"
      >
        {/* Triangle */}
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

        {/* Circle */}
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

        {/* Square */}
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

        {/* Ring */}
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

        {/* Plus sign */}
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
      
      {/* Floating gradient orbs with parallax */}
      <motion.div style={{ x: orbX1, y: orbY1 }} className="absolute inset-0 pointer-events-none hidden sm:block">
        <FloatingOrb 
          className="bg-primary/15 -top-20 -right-32" 
          size="w-[300px] h-[300px] md:w-[500px] md:h-[500px]"
          delay={0.2}
        />
      </motion.div>
      
      <motion.div style={{ x: orbX2, y: orbY2 }} className="absolute inset-0 pointer-events-none hidden md:block">
        <FloatingOrb 
          className="bg-accent/10 top-1/3 -left-40" 
          size="w-[400px] h-[400px] lg:w-[600px] lg:h-[600px]"
          delay={0.5}
        />
      </motion.div>

      <FloatingOrb 
        className="bg-primary/8 bottom-20 right-1/4 hidden lg:block" 
        size="w-[400px] h-[400px]"
        delay={0.8}
      />

      {/* Noise overlay */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="inline-flex items-center gap-2 bg-primary/10 text-primary font-medium text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
            AI-Powered SEO for US Businesses
          </span>
        </motion.div>

        {/* Main headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground leading-[0.95] tracking-[-0.04em] mb-3 sm:mb-4">
          <TextReveal text="Rank higher." delay={0.3} />
        </h1>
        
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] tracking-[-0.04em] mb-6 sm:mb-8">
          <motion.span
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient"
          >
            Grow faster.
          </motion.span>
        </h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-xl mb-8 sm:mb-10 leading-relaxed px-2"
        >
          We combine AI precision with human expertise to get your business 
          on page one of Google. No fluff, just results.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-12 sm:mb-16 w-full sm:w-auto px-2 sm:px-0"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative group"
          >
            {/* Animated gradient border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-lg opacity-0 group-hover:opacity-100 blur transition-all duration-500 group-hover:duration-200 animate-gradient bg-[length:200%_100%]" />
            <Button 
              onClick={openModal}
              size="lg"
              className="relative w-full sm:w-auto bg-foreground text-background hover:bg-foreground font-medium text-sm sm:text-base px-6 sm:px-10 py-5 sm:py-6 h-auto shadow-prominent hover:shadow-xl transition-all duration-300"
            >
              Get Your Free Audit
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline"
              size="lg"
              className="w-full sm:w-auto font-medium text-sm sm:text-base px-6 sm:px-10 py-5 sm:py-6 h-auto border-border/50 hover:bg-secondary/50 hover:border-primary/30 transition-all duration-300"
              onClick={() => document.querySelector("#how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            >
              See How It Works
            </Button>
          </motion.div>
        </motion.div>

        {/* Animated Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="grid grid-cols-3 gap-4 sm:gap-8 md:gap-16 w-full max-w-2xl"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 + index * 0.1 }}
              className="text-center min-w-0"
            >
              <div className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-1 truncate">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2} />
              </div>
              <div className="text-muted-foreground text-[10px] sm:text-xs md:text-sm lg:text-base truncate">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Floating SEO Dashboard Mockup */}
        <HeroDashboard />

        {/* Scroll indicator */}
        <motion.button
          onClick={scrollToNext}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ 
            opacity: { delay: 2, duration: 0.5 },
            y: { delay: 2, duration: 1.5, repeat: Infinity, ease: "easeInOut" }
          }}
          className="mt-4 sm:mt-8 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label="Scroll down"
        >
          <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8" />
        </motion.button>
      </div>
    </section>
  );
};

export default Hero;
