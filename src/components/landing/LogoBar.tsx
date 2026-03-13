import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import SectionBadge from "@/components/shared/SectionBadge";
import FloatingOrb from "@/components/shared/FloatingOrb";
import ScrollReveal from "@/components/shared/ScrollReveal";

const companies = [
  { name: "TechFlow", symbol: "◆" },
  { name: "GrowthLabs", symbol: "●" },
  { name: "ScaleUp", symbol: "▲" },
  { name: "NexGen", symbol: "■" },
  { name: "Velocity", symbol: "◇" },
  { name: "Quantum", symbol: "○" },
  { name: "Apex", symbol: "△" },
];

const LogoBar = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax for background orb
  const orbY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section 
      ref={sectionRef}
      className="py-10 sm:py-16 md:py-24 relative overflow-hidden bg-gradient-to-b from-[#0f0a1f] via-[#1a1035] to-[#0f0a1f]"
    >
      {/* Subtle top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      
      {/* Subtle bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
      
      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none noise-overlay" />
      
      {/* Subtle animated glow - hidden on mobile for performance */}
      <motion.div 
        style={{ y: orbY }}
        className="absolute inset-0 pointer-events-none hidden sm:block"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[600px] h-[200px] md:h-[300px] bg-purple-600/10 rounded-full blur-3xl" />
      </motion.div>
      
      <div className="container mx-auto px-3 sm:px-6 relative z-10">
        <ScrollReveal direction="up" delay={0} duration={0.5}>
          <div className="text-center">
            <SectionBadge delay={0.1} variant="light">Trusted by 500+ US businesses</SectionBadge>
          </div>
        </ScrollReveal>
        
        {/* Marquee Container */}
        <ScrollReveal direction="up" delay={0.2} duration={0.6}>
          <div className="relative mt-6 sm:mt-10 md:mt-12">
            {/* Left gradient mask - narrower on mobile */}
            <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-20 md:w-32 bg-gradient-to-r from-[#0f0a1f] to-transparent z-10 pointer-events-none" />
            
            {/* Right gradient mask - narrower on mobile */}
            <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-20 md:w-32 bg-gradient-to-l from-[#0f0a1f] to-transparent z-10 pointer-events-none" />
            
            {/* Scrolling track */}
            <div className="overflow-hidden">
              <div className="flex animate-marquee hover:[animation-play-state:paused]">
                {/* Duplicated logos for seamless loop */}
                {[...companies, ...companies].map((company, i) => (
                  <div
                    key={`${company.name}-${i}`}
                    className="flex-shrink-0 mx-1.5 sm:mx-3 md:mx-4"
                  >
                    <div className="group flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-5 md:px-6 py-2.5 sm:py-3.5 md:py-4 bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-lg sm:rounded-xl transition-all duration-300 hover:bg-white/[0.08] hover:border-purple-400/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] cursor-default">
                      <span className="text-purple-300/60 group-hover:text-purple-300 transition-colors text-xs sm:text-base">
                        {company.symbol}
                      </span>
                      <span className="text-white/70 group-hover:text-white/90 font-display font-medium text-xs sm:text-base lg:text-lg tracking-tight whitespace-nowrap transition-colors">
                        {company.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default LogoBar;
