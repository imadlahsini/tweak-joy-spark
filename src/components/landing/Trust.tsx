import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Flag, ShieldCheck, Eye } from "lucide-react";
import FloatingOrb from "@/components/shared/FloatingOrb";
import SectionBadge from "@/components/shared/SectionBadge";
import { staggerContainer, staggerItem } from "@/hooks/useScrollAnimation";

const trustPoints = [
  {
    icon: Flag,
    title: "US-Focused",
    description: "We specialize in the US market and understand local SEO nuances",
  },
  {
    icon: ShieldCheck,
    title: "White-Hat Only",
    description: "No shortcuts, no penalties—sustainable strategies that last",
  },
  {
    icon: Eye,
    title: "Full Transparency",
    description: "Clear reporting so you always know exactly what we're doing",
  },
];

const Trust = () => {
  const ref = useRef(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax for background elements
  const orbY1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const orbY2 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const gradientScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.1, 0.8]);

  return (
    <section ref={sectionRef} className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 dot-grid opacity-30" />
      
      {/* Parallax gradient mesh corners */}
      <motion.div 
        style={{ scale: gradientScale }}
        className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" 
      />
      <motion.div 
        style={{ scale: gradientScale }}
        className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-accent/5 to-transparent rounded-full blur-3xl" 
      />
      
      {/* Parallax floating orbs */}
      <motion.div style={{ y: orbY1 }} className="absolute inset-0 pointer-events-none">
        <FloatingOrb 
          className="bg-primary/5 top-1/2 left-1/4 -translate-y-1/2 hidden lg:block" 
          size="w-[300px] h-[200px]"
          delay={0.2}
        />
      </motion.div>
      <motion.div style={{ y: orbY2 }} className="absolute inset-0 pointer-events-none">
        <FloatingOrb 
          className="bg-accent/5 top-1/3 right-1/4 hidden lg:block" 
          size="w-[250px] h-[150px]"
          delay={0.4}
        />
      </motion.div>

      {/* Animated top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Animated bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-12 md:mb-16"
        >
          <SectionBadge>Our Promise</SectionBadge>
        </motion.div>

        {/* Cards Grid with Stagger */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto"
        >
          {trustPoints.map((point, i) => (
            <motion.div
              key={point.title}
              variants={staggerItem}
              whileHover={{ 
                y: -8,
                transition: { duration: 0.3 }
              }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative h-full p-6 sm:p-8 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/50 transition-all duration-500 hover:border-primary/30 hover:shadow-elevated hover:-translate-y-2">
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={isInView ? { x: "200%", opacity: [0, 0.5, 0] } : {}}
                    transition={{ 
                      duration: 1.5, 
                      delay: 0.5 + i * 0.2,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                  />
                </div>

                <div className="relative z-10 flex flex-row md:flex-col items-center md:items-center gap-4 sm:gap-5 text-left md:text-center">
                  {/* Icon Container */}
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.2 + i * 0.15
                    }}
                    className="relative flex-shrink-0"
                  >
                    {/* Pulsing ring */}
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                      className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30"
                    />
                    
                    {/* Icon box */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center group-hover:border-primary/40 transition-all duration-300 group-hover:scale-110">
                      <point.icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  </motion.div>

                  {/* Text Content */}
                  <div className="flex-1 md:flex-none">
                    <h3 className="font-display font-bold text-foreground text-lg sm:text-xl mb-1 sm:mb-2">
                      {point.title}
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Connecting dots - Desktop only */}
        <div className="hidden md:flex justify-center items-center gap-0 mt-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center">
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={isInView ? { scale: 1, opacity: 1 } : {}}
                transition={{ delay: 0.8 + i * 0.15, duration: 0.3 }}
                className="relative"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4
                  }}
                  className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent"
                />
              </motion.div>
              {i < 2 && (
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={isInView ? { scaleX: 1 } : {}}
                  transition={{ delay: 0.9 + i * 0.15, duration: 0.4 }}
                  className="w-24 lg:w-32 h-px bg-gradient-to-r from-primary/50 to-accent/50 origin-left"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Trust;
