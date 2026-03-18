import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import TextReveal from "@/components/shared/TextReveal";
import SectionBadge from "@/components/shared/SectionBadge";
import FloatingOrb from "@/components/shared/FloatingOrb";

const testimonials = [
  {
    id: 1,
    quote: "287% increase in organic traffic within 4 months. The AI-powered approach identified opportunities we never would have found manually.",
    name: "Sarah Chen",
    title: "Marketing Director",
    company: "GrowthLabs",
    initials: "SC",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: 2,
    quote: "From page 3 to position 1 for our main keyword. The ROI has been incredible — best marketing investment we've made.",
    name: "Michael Rodriguez",
    title: "Founder",
    company: "LocalBite",
    initials: "MR",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: 3,
    quote: "Their technical SEO audit uncovered issues 3 previous agencies missed. Site speed improved 2x and rankings followed.",
    name: "Emily Watson",
    title: "CEO",
    company: "StyleHouse",
    initials: "EW",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: 4,
    quote: "Transparent reporting and real results. 43 keywords now ranking on page 1, up from just 5 when we started.",
    name: "David Park",
    title: "VP Marketing",
    company: "TechScale",
    initials: "DP",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    id: 5,
    quote: "Finally an SEO partner that delivers what they promise. Our lead generation is up 180% year over year.",
    name: "Jessica Thompson",
    title: "Owner",
    company: "HomeGlow Services",
    initials: "JT",
    gradient: "from-rose-500 to-pink-500",
  },
];

const Testimonial = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const next = () => setActive((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const getImageStyle = (index: number) => {
    const diff = index - active;
    const absDiff = Math.abs(diff);
    
    if (index === active) {
      return {
        zIndex: 10,
        scale: 1,
        y: 0,
        rotate: 0,
        opacity: 1,
      };
    }
    
    // Stack behind
    const direction = diff > 0 ? 1 : -1;
    return {
      zIndex: 10 - absDiff,
      scale: 1 - absDiff * 0.08,
      y: absDiff * 20,
      rotate: direction * absDiff * 4,
      opacity: Math.max(0, 1 - absDiff * 0.3),
    };
  };

  return (
    <section 
      className="py-16 sm:py-20 md:py-28 bg-gradient-to-b from-background via-secondary/20 to-background overflow-hidden relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Floating orb */}
      <FloatingOrb 
        className="bg-primary/5 top-0 right-0 hidden sm:block" 
        size="w-[300px] h-[300px] md:w-[500px] md:h-[500px]"
        delay={0.3}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-16 md:mb-20"
        >
          <SectionBadge delay={0}>Testimonials</SectionBadge>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mt-4 sm:mt-6 text-foreground">
            <TextReveal text="What Our Clients Say" delay={0.1} staggerDelay={0.08} />
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-24 items-center max-w-6xl mx-auto">
          {/* Left - Image Stack */}
          <motion.div
            initial={{ opacity: 0, x: -50, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="relative h-[280px] sm:h-[320px] md:h-[400px] flex items-center justify-center"
          >
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 rounded-2xl sm:rounded-3xl" />
            
            {/* Quote icon background */}
            <Quote className="absolute top-4 sm:top-8 left-4 sm:left-8 w-16 h-16 sm:w-24 sm:h-24 text-primary/10" />
            
            {/* Image stack */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  animate={getImageStyle(index)}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => setActive(index)}
                >
                  <div 
                    className={`w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-br ${testimonial.gradient} shadow-2xl flex items-center justify-center border-2 sm:border-4 border-background`}
                  >
                    <span className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-white">
                      {testimonial.initials}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Content */}
          <motion.div
            initial={{ opacity: 0, x: 50, filter: "blur(10px)" }}
            animate={isInView ? { opacity: 1, x: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="relative"
          >
            {/* Stars */}
            <div className="flex gap-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <Star className="w-6 h-6 fill-primary text-primary" />
                </motion.div>
              ))}
            </div>

            {/* Quote */}
            <div className="min-h-[140px] sm:min-h-[160px] md:min-h-[180px] mb-6 sm:mb-8 md:mb-10">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={active}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-foreground leading-relaxed"
                >
                  <span className="text-primary">"</span>
                  {testimonials[active].quote.split(" ").map((word, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ 
                        delay: i * 0.02, 
                        duration: 0.3,
                        ease: "easeOut"
                      }}
                      className="inline-block mr-[0.25em]"
                    >
                      {word}
                    </motion.span>
                  ))}
                  <span className="text-primary">"</span>
                </motion.blockquote>
              </AnimatePresence>
            </div>

            {/* Author */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mb-10"
              >
                <div className="font-semibold text-xl text-foreground">
                  {testimonials[active].name}
                </div>
                <div className="text-muted-foreground text-lg">
                  {testimonials[active].title}, {testimonials[active].company}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              {/* Arrows */}
              <div className="flex gap-2 sm:gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prev}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 border-border/50 hover:border-primary hover:bg-primary/10 transition-all min-h-[44px]"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={next}
                  className="rounded-full w-10 h-10 sm:w-12 sm:h-12 border-border/50 hover:border-primary hover:bg-primary/10 transition-all min-h-[44px]"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>

              {/* Dots */}
              <div className="flex gap-1.5 sm:gap-2 ml-2 sm:ml-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActive(index)}
                    className="group relative p-1.5 min-h-[44px] min-w-[28px] sm:min-w-0 flex items-center justify-center"
                  >
                    <div
                      className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
                        index === active 
                          ? "bg-primary scale-125" 
                          : "bg-muted-foreground/30 group-hover:bg-muted-foreground/50"
                      }`}
                    />
                    {index === active && (
                      <motion.div
                        layoutId="activeDot"
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-primary" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>

              {/* Counter */}
              <div className="ml-auto text-xs sm:text-sm text-muted-foreground">
                <span className="text-foreground font-medium text-base sm:text-lg">{active + 1}</span>
                <span className="mx-1">/</span>
                <span>{testimonials.length}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonial;
