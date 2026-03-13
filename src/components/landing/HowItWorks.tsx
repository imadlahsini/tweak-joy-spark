import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import TextReveal from "@/components/shared/TextReveal";
import SectionBadge from "@/components/shared/SectionBadge";
import FloatingOrb from "@/components/shared/FloatingOrb";

const steps = [
  {
    number: "01",
    title: "Free SEO Audit",
    description: "We analyze your site, competitors, and opportunities. Takes 24 hours, not weeks.",
  },
  {
    number: "02",
    title: "Custom Strategy",
    description: "You get a detailed roadmap tailored to your business goals and market position.",
  },
  {
    number: "03",
    title: "Implementation",
    description: "Our team executes the strategy while keeping you informed every step of the way.",
  },
  {
    number: "04",
    title: "Growth & Reporting",
    description: "Watch your rankings climb with transparent monthly reports and ongoing optimization.",
  },
];

const HowItWorks = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="how-it-works" className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
      {/* Floating orb */}
      <FloatingOrb 
        className="bg-primary/5 top-1/2 -right-40 hidden md:block" 
        size="w-[300px] h-[300px] lg:w-[500px] lg:h-[500px]"
        delay={0.3}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-20 items-start">
          {/* Left: Title */}
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="lg:sticky lg:top-32"
          >
            <SectionBadge delay={0}>Our Process</SectionBadge>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mt-4 sm:mt-6 mb-4 sm:mb-6 md:mb-8 text-foreground">
              <TextReveal text="How we get you to page one" delay={0.1} staggerDelay={0.06} />
            </h2>
            <motion.p 
              initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
              animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-muted-foreground leading-relaxed text-base sm:text-lg"
            >
              A proven process that's helped 127 US businesses dominate their search results. 
              No long-term contracts, no hidden fees, just results.
            </motion.p>
          </motion.div>

          {/* Right: Timeline */}
          <div className="relative">
            {/* Animated vertical line */}
            <motion.div 
              initial={{ height: 0 }}
              animate={isInView ? { height: "calc(100% - 64px)" } : {}}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className="absolute left-5 sm:left-6 md:left-7 top-6 sm:top-8 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent hidden sm:block origin-top" 
            />
            
            <div className="space-y-6 sm:space-y-8 md:space-y-10">
              {steps.map((step, i) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: 30, filter: "blur(10px)" }}
                  animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.3 + i * 0.12,
                    ease: [0.2, 0.65, 0.3, 0.9]
                  }}
                  className="relative flex gap-4 sm:gap-6 md:gap-8"
                >
                  {/* Number circle */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ 
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.4 + i * 0.12
                    }}
                    className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-foreground text-background flex items-center justify-center font-display font-bold text-xs sm:text-sm relative z-10 shadow-prominent"
                  >
                    {step.number}
                  </motion.div>
                  
                  {/* Content */}
                  <div className="pt-1 sm:pt-2 md:pt-3">
                    <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 sm:mb-3">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base md:text-lg">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
