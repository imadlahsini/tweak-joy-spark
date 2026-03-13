import { motion, useMotionValue, useTransform, useScroll } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";
import TextReveal from "@/components/shared/TextReveal";
import FloatingOrb from "@/components/shared/FloatingOrb";
import { useToast } from "@/hooks/use-toast";

// Telegram Bot Configuration - Replace with your actual values
const TELEGRAM_BOT_TOKEN = "YOUR_BOT_TOKEN";
const TELEGRAM_CHAT_ID = "YOUR_CHAT_ID";

const CTA = () => {
  const ref = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Scroll-based parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const orbScrollY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const bgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1, 1.1]);
  const dotOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.02, 0.05, 0.05, 0.02]);

  // Mouse-based parallax
  const orbX = useTransform(mouseX, [-500, 500], [-30, 30]);
  const orbY = useTransform(mouseY, [-500, 500], [-30, 30]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !website.trim()) {
      toast({
        title: "Missing information",
        description: "Please fill in both your email and website URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const message = `🆕 New SEO Audit Request\n\n📧 Email: ${email}\n🌐 Website: ${website}\n📅 Date: ${new Date().toLocaleString()}`;

      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || "Telegram API error");
      }

      setIsSubmitted(true);
      setEmail("");
      setWebsite("");
      
      toast({
        title: "Request submitted!",
        description: "We'll reach out to you within 24 hours.",
      });

      // Reset success state after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error: any) {
      console.error("Telegram error:", error);
      toast({
        title: "Something went wrong",
        description: error?.message || "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      id="cta" 
      ref={sectionRef}
      className="py-16 sm:py-24 md:py-32 bg-foreground text-background relative overflow-hidden noise-overlay"
    >
      {/* Combined scroll + mouse parallax orb */}
      <motion.div 
        style={{ x: orbX, y: orbScrollY }}
        className="absolute inset-0 pointer-events-none"
      >
        <motion.div style={{ scale: bgScale }}>
          <FloatingOrb 
            className="bg-primary/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
            size="w-[400px] h-[300px] sm:w-[600px] sm:h-[400px] md:w-[800px] md:h-[500px]"
            delay={0.2}
          />
        </motion.div>
      </motion.div>

      {/* Dot grid with parallax opacity */}
      <motion.div 
        style={{ opacity: dotOpacity }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 dot-grid" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)' }} />
      </motion.div>
      
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="container mx-auto px-4 sm:px-6 relative z-10"
      >
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6">
            <TextReveal text="Ready to rank higher?" delay={0.1} staggerDelay={0.08} />
          </h2>
          <motion.p 
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-background/70 mb-8 sm:mb-12 text-base sm:text-lg md:text-xl leading-relaxed"
          >
            Get your free AI-powered SEO audit and see exactly what's holding your site back.
          </motion.p>

          <motion.form 
            onSubmit={handleSubmit}
            className="space-y-4 sm:space-y-5"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Input
                type="email"
                name="user_email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 bg-background/10 border-background/20 text-background placeholder:text-background/50 h-12 sm:h-14 rounded-lg sm:rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
              />
              <Input
                type="url"
                name="user_website"
                placeholder="Your website URL"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 bg-background/10 border-background/20 text-background placeholder:text-background/50 h-12 sm:h-14 rounded-lg sm:rounded-xl text-sm sm:text-base focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
              />
            </div>
            <Button 
              type="submit"
              size="lg"
              disabled={isSubmitting || isSubmitted}
              className="w-full sm:w-auto bg-background text-foreground hover:bg-background/90 font-medium px-8 sm:px-12 h-12 sm:h-14 text-sm sm:text-base group shadow-prominent hover:shadow-xl transition-all duration-300 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Submitting...
                </>
              ) : isSubmitted ? (
                <>
                  <CheckCircle className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Submitted!
                </>
              ) : (
                <>
                  Get My Free Audit
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </motion.form>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="text-background/50 text-xs sm:text-sm mt-6 sm:mt-8"
          >
            Free audit • No commitment • Results in 24 hours
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
