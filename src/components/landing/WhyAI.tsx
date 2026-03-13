import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X, Clock, Users, BarChart2, Eye, FileText, Zap, Brain, TrendingUp, Target, Sparkles } from "lucide-react";
import TextReveal from "@/components/shared/TextReveal";
import SectionBadge from "@/components/shared/SectionBadge";
import FloatingOrb from "@/components/shared/FloatingOrb";

const comparison = [
  {
    traditional: "Manual keyword research taking weeks",
    ai: "AI analyzes millions of keywords in minutes",
    iconOld: Clock,
    iconNew: Zap,
  },
  {
    traditional: "Generic content that sounds like everyone else",
    ai: "Data-driven content optimized for your specific audience",
    iconOld: Users,
    iconNew: Brain,
  },
  {
    traditional: "Slow to adapt to algorithm changes",
    ai: "Real-time adaptation to search engine updates",
    iconOld: BarChart2,
    iconNew: TrendingUp,
  },
  {
    traditional: "Limited competitor monitoring",
    ai: "24/7 competitor tracking and opportunity detection",
    iconOld: Eye,
    iconNew: Target,
  },
  {
    traditional: "Inconsistent reporting and insights",
    ai: "Predictive analytics and actionable recommendations",
    iconOld: FileText,
    iconNew: Sparkles,
  },
];

const WhyAI = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="why-ai" className="py-16 sm:py-20 md:py-28 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-grid opacity-30" />
      
      {/* Floating orbs */}
      <FloatingOrb 
        className="bg-destructive/5 -top-20 -left-20 hidden md:block" 
        size="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px]"
        delay={0.2}
      />
      <FloatingOrb 
        className="bg-primary/10 -bottom-40 -right-40 hidden md:block" 
        size="w-[400px] h-[400px] lg:w-[600px] lg:h-[600px]"
        delay={0.4}
      />
      
      {/* Gradient mesh */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-primary/5 via-transparent to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16 md:mb-20"
        >
          <SectionBadge delay={0}>The Difference</SectionBadge>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mt-4 sm:mt-6 text-foreground">
            <TextReveal text="Why AI-powered SEO wins" delay={0.1} staggerDelay={0.06} />
          </h2>
        </motion.div>

        {/* Desktop Split Layout */}
        <div className="hidden md:grid grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 max-w-6xl mx-auto items-start">
          {/* Traditional SEO Column */}
          <motion.div
            initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-muted/80 text-muted-foreground px-5 py-2.5 rounded-full text-sm font-medium border border-border/50">
                <X className="w-4 h-4 text-destructive/70" />
                Traditional SEO
              </div>
            </div>
            
            {comparison.map((item, i) => {
              const IconOld = item.iconOld;
              return (
                <motion.div
                  key={`traditional-${i}`}
                  initial={{ opacity: 0, x: -30, filter: "blur(8px)" }}
                  animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.4 + i * 0.1,
                    ease: [0.2, 0.65, 0.3, 0.9]
                  }}
                  className="group relative"
                >
                  <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-5 transition-all duration-300 hover:bg-muted/30 opacity-80 hover:opacity-90">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center">
                        <IconOld className="w-5 h-5 text-muted-foreground/70" />
                      </div>
                      <p className="text-muted-foreground text-sm lg:text-base leading-relaxed pt-1.5 line-through decoration-muted-foreground/30">
                        {item.traditional}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Central VS Divider */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.25, type: "spring", stiffness: 200 }}
            className="flex flex-col items-center justify-center h-full py-16"
          >
            {/* Top line */}
            <motion.div 
              initial={{ height: 0 }}
              animate={isInView ? { height: "100%" } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="w-px bg-gradient-to-b from-transparent via-border to-primary/50 flex-1 min-h-[60px]"
            />
            
            {/* VS Badge */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={isInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.35, type: "spring", stiffness: 200 }}
              className="relative my-4"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-primary via-primary to-accent flex items-center justify-center shadow-[0_0_40px_-10px_hsl(var(--primary))]">
                <span className="font-display font-bold text-primary-foreground text-lg lg:text-xl">VS</span>
              </div>
            </motion.div>
            
            {/* Bottom line */}
            <motion.div 
              initial={{ height: 0 }}
              animate={isInView ? { height: "100%" } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="w-px bg-gradient-to-b from-primary/50 via-border to-transparent flex-1 min-h-[60px]"
            />
          </motion.div>

          {/* AI-Powered SEO Column */}
          <motion.div
            initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="space-y-4"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium shadow-[0_0_20px_-5px_hsl(var(--primary))]">
                <Check className="w-4 h-4" />
                AI-Powered SEO
              </div>
            </div>
            
            {comparison.map((item, i) => {
              const IconNew = item.iconNew;
              return (
                <motion.div
                  key={`ai-${i}`}
                  initial={{ opacity: 0, x: 30, filter: "blur(8px)" }}
                  animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
                  transition={{ 
                    duration: 0.5, 
                    delay: 0.4 + i * 0.1,
                    ease: [0.2, 0.65, 0.3, 0.9]
                  }}
                  className="group relative"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-px bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                  
                  <div className="relative bg-card/80 backdrop-blur-sm border border-primary/20 rounded-2xl p-5 transition-all duration-300 hover:border-primary/40 hover:shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)] group-hover:bg-card">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
                        <IconNew className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-foreground text-sm lg:text-base leading-relaxed pt-1.5">
                        {item.ai}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {/* Mobile header badges */}
          <div className="flex justify-center gap-3 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center gap-1.5 bg-muted/80 text-muted-foreground px-3 py-1.5 rounded-full text-xs font-medium"
            >
              <X className="w-3 h-3 text-destructive/70" />
              Traditional
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.25 }}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-bold"
            >
              VS
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="flex items-center gap-1.5 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium"
            >
              <Check className="w-3 h-3" />
              AI-Powered
            </motion.div>
          </div>

          {comparison.map((item, i) => {
            const IconOld = item.iconOld;
            const IconNew = item.iconNew;
            return (
              <motion.div
                key={`mobile-${i}`}
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
                transition={{ 
                  duration: 0.5, 
                  delay: 0.3 + i * 0.08,
                  ease: [0.2, 0.65, 0.3, 0.9]
                }}
                className="relative"
              >
                <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-4 space-y-3">
                  {/* Traditional row */}
                  <div className="flex items-start gap-3 opacity-70">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center">
                      <IconOld className="w-4 h-4 text-muted-foreground/70" />
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed pt-1 line-through decoration-muted-foreground/30">
                      {item.traditional}
                    </p>
                  </div>
                  
                  {/* Divider */}
                  <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  
                  {/* AI row */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/20">
                      <IconNew className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-foreground text-sm leading-relaxed pt-1">
                      {item.ai}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyAI;
