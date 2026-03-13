import { motion, useMotionValue, useTransform, useScroll } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Search, FileText, PenTool, Link2, ArrowUpRight } from "lucide-react";
import TextReveal from "@/components/shared/TextReveal";
import SectionBadge from "@/components/shared/SectionBadge";
import FloatingOrb from "@/components/shared/FloatingOrb";
import { staggerContainer, staggerItem } from "@/hooks/useScrollAnimation";

const services = [
  {
    icon: Search,
    title: "AI SEO Audit",
    description: "Deep-dive analysis of your site's technical health, content gaps, and competitive landscape.",
    featured: true,
  },
  {
    icon: FileText,
    title: "On-Page Optimization",
    description: "Strategic keyword placement, meta optimization, and content structure improvements.",
  },
  {
    icon: PenTool,
    title: "Content Strategy",
    description: "AI-assisted content creation with human refinement for authentic, rankable content.",
  },
  {
    icon: Link2,
    title: "Link Building",
    description: "White-hat backlink acquisition from authoritative, relevant sources.",
  },
];

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

const TiltCard = ({ children, className = "" }: TiltCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [canHover, setCanHover] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setCanHover(mediaQuery.matches);
  }, []);

  const rotateX = useTransform(mouseY, [-150, 150], [8, -8]);
  const rotateY = useTransform(mouseX, [-150, 150], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canHover) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    }
  };

  const handleMouseLeave = () => {
    if (!canHover) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={canHover ? {
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      } : undefined}
      className={`relative ${className}`}
    >
      {children}
    </motion.div>
  );
};

const Services = () => {
  const ref = useRef(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax for floating orb
  const orbY = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section id="services" ref={sectionRef} className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
      {/* Parallax floating orb */}
      <motion.div style={{ y: orbY }} className="absolute inset-0 pointer-events-none">
        <FloatingOrb 
          className="bg-primary/5 -top-20 -right-40 hidden sm:block" 
          size="w-[300px] h-[300px] md:w-[500px] md:h-[500px]"
          delay={0.3}
        />
      </motion.div>
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-12 sm:mb-16 md:mb-20"
        >
          <SectionBadge delay={0}>What We Do</SectionBadge>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mt-4 sm:mt-6 text-foreground">
            <TextReveal text="Services that move the needle" delay={0.1} staggerDelay={0.06} />
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" style={{ perspective: "1000px" }}>
          {/* Featured large card */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="sm:col-span-2 lg:col-span-1 lg:row-span-2"
          >
            <TiltCard className="h-full">
              <div className="h-full bg-foreground text-background rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 flex flex-col group transition-all duration-500 shadow-prominent relative overflow-hidden">
                {/* Gradient border glow on hover */}
                <motion.div
                  className="absolute -inset-px rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ zIndex: -1 }}
                />
                
                {/* Dot grid pattern */}
                <div className="absolute inset-0 dot-grid opacity-10" />
                
                <div className="relative z-10" style={{ transform: "translateZ(40px)" }}>
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={isInView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-background/10 flex items-center justify-center mb-6 sm:mb-8 group-hover:bg-primary/20 transition-colors duration-300"
                  >
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Search className="w-6 h-6 sm:w-7 sm:h-7" />
                    </motion.div>
                  </motion.div>
                  
                  <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">
                    {services[0].title}
                  </h3>
                  
                  <p className="text-background/70 mb-6 sm:mb-8 leading-relaxed text-base sm:text-lg">
                    {services[0].description}
                  </p>

                  <ul className="space-y-2 sm:space-y-3 mb-8 sm:mb-10 flex-grow">
                    {["Technical Analysis", "Content Audit", "Competitor Research", "Keyword Mapping"].map((item, i) => (
                      <motion.li 
                        key={item} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
                        className="flex items-center gap-3 text-sm text-background/80"
                      >
                        <motion.div 
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                        />
                        {item}
                      </motion.li>
                    ))}
                  </ul>

                  <motion.div 
                    className="flex items-center gap-2 text-sm font-medium group-hover:gap-4 transition-all duration-300"
                    whileHover={{ x: 5 }}
                  >
                    Learn more <ArrowUpRight className="w-4 h-4" />
                  </motion.div>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Smaller cards */}
          {services.slice(1).map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ 
                duration: 0.6, 
                delay: 0.3 + index * 0.1,
                ease: [0.2, 0.65, 0.3, 0.9]
              }}
            >
              <TiltCard className="h-full">
                <div className="h-full bg-card border border-border rounded-2xl sm:rounded-3xl p-5 sm:p-7 group transition-all duration-500 shadow-soft hover:shadow-prominent hover:border-primary/20 relative overflow-hidden">
                  {/* Hover gradient overlay */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  
                  <div className="relative z-10" style={{ transform: "translateZ(30px)" }}>
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={isInView ? { scale: 1, opacity: 1 } : {}}
                      transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-secondary flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary/10 transition-colors duration-300"
                    >
                      <motion.div
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </motion.div>
                    </motion.div>

                    <h3 className="font-display text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-foreground">
                      {service.title}
                    </h3>

                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                      {service.description}
                    </p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;