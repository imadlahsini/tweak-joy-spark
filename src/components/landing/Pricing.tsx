import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Shield } from "lucide-react";
import TextReveal from "@/components/shared/TextReveal";
import SectionBadge from "@/components/shared/SectionBadge";
import FloatingOrb from "@/components/shared/FloatingOrb";
import { plans } from "@/data/plans";

const Pricing = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = useState<"one-time" | "subscription">("one-time");

  return (
    <section id="pricing" className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
      <FloatingOrb 
        className="bg-accent/10 -top-40 left-1/4 hidden md:block" 
        size="w-[400px] h-[400px] lg:w-[600px] lg:h-[600px]"
        delay={0.3}
      />
      <FloatingOrb 
        className="bg-primary/5 bottom-0 -right-40 hidden sm:block" 
        size="w-[300px] h-[300px] md:w-[400px] md:h-[400px]"
        delay={0.5}
      />
      
      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-16 md:mb-20"
        >
          <SectionBadge delay={0}>Pricing</SectionBadge>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mt-4 sm:mt-6 text-foreground">
            <TextReveal text="Simple, transparent pricing" delay={0.1} staggerDelay={0.06} />
          </h2>
          <motion.p 
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-muted-foreground mt-4 sm:mt-6 max-w-lg mx-auto text-base sm:text-lg"
          >
            No hidden fees. No long-term contracts. Cancel anytime.
          </motion.p>

          {/* Payment type toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-6 sm:mt-8 inline-flex items-center rounded-full border border-border bg-card p-1 shadow-soft"
          >
            <button
              onClick={() => setPaymentType("one-time")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                paymentType === "one-time"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              One-time
            </button>
            <button
              onClick={() => setPaymentType("subscription")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                paymentType === "subscription"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Subscription
            </button>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
          {plans.filter((p) => !p.hidden).map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
              transition={{ 
                duration: 0.6, 
                delay: 0.2 + i * 0.1,
                ease: [0.2, 0.65, 0.3, 0.9]
              }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className={`relative rounded-2xl sm:rounded-3xl transition-all duration-500 group ${
                plan.featured 
                  ? "bg-foreground text-background shadow-prominent" 
                  : "bg-card border border-border shadow-soft hover:shadow-prominent hover:border-primary/20"
              }`}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden">
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3, repeat: Infinity, repeatDelay: 5, ease: "easeInOut" }}
                  className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
                />
              </div>

              {/* Glowing ring for featured */}
              {plan.featured && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -inset-px rounded-2xl sm:rounded-3xl bg-gradient-to-r from-primary via-accent to-primary opacity-75"
                  style={{ zIndex: -1 }}
                />
              )}

              <div className="relative p-5 sm:p-7">
                {plan.badge && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                  >
                    <span className={`text-xs font-medium px-4 py-1.5 rounded-full ${
                      plan.featured 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-accent text-accent-foreground"
                    }`}>
                      {plan.badge}
                    </span>
                  </motion.div>
                )}

                <div className="mb-6">
                  <h3 className={`font-display text-xl font-bold mb-2 ${
                    plan.featured ? "text-background" : "text-foreground"
                  }`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm ${
                    plan.featured ? "text-background/70" : "text-muted-foreground"
                  }`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-4 sm:mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`font-display text-3xl sm:text-4xl font-bold ${
                      plan.featured ? "text-background" : "text-foreground"
                    }`}>
                      ${plan.monthlyPrice}
                    </span>
                    {paymentType === "subscription" && plan.subscriptionInterval && (
                      <span className={`text-sm ${
                        plan.featured ? "text-background/60" : "text-muted-foreground"
                      }`}>
                        /{plan.subscriptionInterval}
                      </span>
                    )}
                  </div>
                  {paymentType === "subscription" && (
                    <span className={`text-xs mt-1 inline-block ${
                      plan.featured ? "text-background/50" : "text-muted-foreground/70"
                    }`}>
                      Recurring • Cancel anytime
                    </span>
                  )}
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {plan.features.map((feature, j) => (
                    <motion.li 
                      key={feature} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.3, delay: 0.5 + i * 0.1 + j * 0.05 }}
                      className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={isInView ? { scale: 1 } : {}}
                        transition={{ type: "spring", delay: 0.6 + i * 0.1 + j * 0.05 }}
                      >
                        <Check className={`w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0 ${
                          plan.featured ? "text-primary" : "text-primary"
                        }`} />
                      </motion.div>
                      <span className={plan.featured ? "text-background/90" : "text-foreground/80"}>
                        {feature}
                      </span>
                    </motion.li>
                  ))}
                </ul>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => navigate(`/checkout/${plan.slug}${paymentType === "subscription" ? "?type=subscription" : ""}`)}
                    className={`w-full group h-11 sm:h-12 text-sm ${
                      plan.featured 
                        ? "bg-background text-foreground hover:bg-background/90" 
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Satisfaction guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-sm">30-day money-back guarantee</span>
          </div>
          <span className="hidden sm:block text-muted-foreground/50">•</span>
          <span className="text-sm text-muted-foreground">
            All plans include a free SEO audit to get started
          </span>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
