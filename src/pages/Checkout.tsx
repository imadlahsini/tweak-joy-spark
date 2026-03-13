import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import FloatingOrb from "@/components/shared/FloatingOrb";
import PlanCard from "@/components/checkout/PlanCard";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { plans, type Plan } from "@/data/plans";

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
  company: z.string().trim().max(100).optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

const BASE_PRICE_PER_MONTH = plans[0].monthlyPrice; // 1-month plan as baseline

const Checkout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  useEffect(() => {
    const planSlug = searchParams.get("plan");
    if (planSlug) {
      const found = plans.find((p) => p.slug === planSlug);
      if (found) setSelectedPlan(found);
    }
    if (!planSlug) {
      setSelectedPlan(plans.find((p) => p.featured) || plans[0]);
    }
  }, [searchParams]);

  const onSubmit = async (formData: FormData) => {
    if (!selectedPlan) {
      toast.error("Please select a plan first.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          priceId: selectedPlan.priceId,
          customerEmail: formData.email,
          customerName: formData.name,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-radial from-primary/15 via-transparent to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -5, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-radial from-accent/10 via-transparent to-transparent blur-3xl"
        />
      </div>

      {/* Background layers */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />

      {/* Floating orbs */}
      <FloatingOrb className="bg-primary/12 -top-32 -right-32 hidden md:block" size="w-[500px] h-[500px]" delay={0} />
      <FloatingOrb className="bg-accent/8 bottom-0 -left-40 hidden md:block" size="w-[450px] h-[450px]" delay={0.4} />
      <FloatingOrb className="bg-primary/6 top-1/2 right-1/4 hidden lg:block" size="w-[350px] h-[350px]" delay={0.8} />

      {/* Floating geometric shapes */}
      <motion.div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Triangle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="absolute top-[12%] left-[8%] hidden lg:block"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="w-14 h-14 border-2 border-primary/20"
            style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
          />
        </motion.div>

        {/* Circle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute top-[20%] right-[12%] hidden md:block"
        >
          <motion.div
            animate={{ y: [-10, 10, -10] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-full border-2 border-accent/30 bg-accent/5"
          />
        </motion.div>

        {/* Ring */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1.2, delay: 1.1 }}
          className="absolute bottom-[25%] right-[8%] hidden md:block"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full border-4 border-primary/15"
          />
        </motion.div>

        {/* Plus */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 1.3 }}
          className="absolute bottom-[40%] left-[5%] hidden lg:block"
        >
          <motion.div
            animate={{ rotate: [0, 90, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-7 h-7"
          >
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-accent/25 -translate-y-1/2" />
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-accent/25 -translate-x-1/2" />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group text-sm"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to home
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
            Complete your order
          </h1>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto text-base sm:text-lg">
            Choose your plan and let's get your SEO growing.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {/* Left: Plan Selection + Form */}
          <div className="lg:col-span-3 space-y-6">
            {/* Plan Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                Select your plan
              </h2>
              <div className="grid gap-2">
                {plans.map((plan, i) => (
                  <PlanCard
                    key={plan.slug}
                    plan={plan}
                    isSelected={selectedPlan?.slug === plan.slug}
                    onSelect={() => setSelectedPlan(plan)}
                    index={i}
                    basePricePerMonth={BASE_PRICE_PER_MONTH}
                  />
                ))}
              </div>
            </motion.div>

            {/* User Info Form */}
            <div>
              <h2 className="text-lg font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                Your information
              </h2>
              <form id="checkout-form" onSubmit={handleSubmit(onSubmit)}>
              <CheckoutForm
                register={register}
                errors={errors}
                dirtyFields={dirtyFields}
                isValid={isValid}
              />
              </form>
            </div>
          </div>

          {/* Right: Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <OrderSummary
              selectedPlan={selectedPlan}
              isLoading={isLoading}
              basePricePerMonth={BASE_PRICE_PER_MONTH}
              isFormValid={isValid}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
