import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useRef } from "react";
import AnimatedCounter from "@/components/shared/AnimatedCounter";
import FloatingOrb from "@/components/shared/FloatingOrb";
import { staggerContainer, staggerItem } from "@/hooks/useScrollAnimation";

const stats = [
  { value: 287, suffix: "%", label: "Average Traffic Growth" },
  { value: 43, suffix: "", label: "Page 1 Rankings (Avg)" },
  { value: 127, suffix: "", label: "Happy Clients" },
];

const StatsStrip = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax effects
  const orbY = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.02, 0.05, 0.05, 0.02]);

  return (
    <section 
      ref={sectionRef}
      className="py-10 sm:py-14 md:py-20 bg-foreground text-background relative overflow-hidden"
    >
      {/* Subtle pattern with parallax opacity */}
      <motion.div 
        style={{ opacity: bgOpacity }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 dot-grid" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)' }} />
      </motion.div>
      
      {/* Parallax floating orb */}
      <motion.div 
        style={{ y: orbY }}
        className="absolute inset-0 pointer-events-none"
      >
        <FloatingOrb 
          className="bg-primary/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
          size="w-[400px] h-[200px] md:w-[800px] md:h-[300px]"
          delay={0.2}
        />
      </motion.div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-12 md:gap-20 lg:gap-32"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className="text-center"
            >
              <div className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-2 sm:mb-3">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} duration={2.5} />
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                className="text-background/60 text-xs sm:text-sm md:text-base tracking-wide"
              >
                {stat.label}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatsStrip;
