import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Lock, Clock, ArrowRight, Loader2, Shield, Sparkles, User, Mail, Check, Percent } from "lucide-react";
import FloatingOrb from "@/components/shared/FloatingOrb";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { plans } from "@/data/plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const bundlePlan = plans.find((p) => p.slug === "3-months-2-websites")!;

const WEBSITE_1_PRICE = 39.99;
const WEBSITE_2_PRICE = 33.99;
const DISCOUNT_PERCENT = 15;

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Please enter a valid email").max(255),
});

type FormData = z.infer<typeof formSchema>;

const FloatingField = ({
  id,
  label,
  icon: Icon,
  placeholder,
  type = "text",
  register,
  error,
  isDirty,
  isValidField,
}: {
  id: keyof FormData;
  label: string;
  icon: React.ElementType;
  placeholder: string;
  type?: string;
  register: any;
  error?: string;
  isDirty?: boolean;
  isValidField: boolean;
}) => (
  <div className="space-y-2 relative">
    <Label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-foreground/80">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      {label}
      {isDirty && isValidField && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
          <Check className="w-3.5 h-3.5 text-green-500" />
        </motion.div>
      )}
    </Label>
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      {...register(id)}
      className={`h-11 bg-background/50 border-border/60 transition-all duration-300 focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.1)] ${
        error ? "border-destructive focus:border-destructive focus:shadow-[0_0_0_3px_hsl(var(--destructive)/0.1)]" : ""
      }`}
    />
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -4, height: 0 }}
          className="text-xs text-destructive"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const BundleCheckout = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, dirtyFields },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          priceId: bundlePlan.priceId,
          customerEmail: formData.email,
          customerName: formData.name,
          planSlug: bundlePlan.slug,
        },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
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
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
      <FloatingOrb className="bg-primary/12 -top-32 -right-32 hidden md:block" size="w-[500px] h-[500px]" delay={0} />
      <FloatingOrb className="bg-accent/8 bottom-0 -left-40 hidden md:block" size="w-[450px] h-[450px]" delay={0.4} />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-5 sm:px-6 py-8 sm:py-12 pb-32 lg:pb-12">
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

        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7, ease: [0.2, 0.65, 0.3, 0.9] }}
          className="relative max-w-5xl mx-auto mb-8 sm:mb-12"
        >
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-foreground">
            <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-3xl">
              <motion.div
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12"
              />
            </div>

            <div className="relative p-5 sm:p-8 md:p-10 lg:p-12">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", bounce: 0.5 }}
                    className="mb-3 sm:mb-4"
                  >
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full bg-primary text-primary-foreground">
                      <Sparkles className="w-3 h-3" />
                      Bundle Deal
                    </span>
                  </motion.div>

                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 text-background"
                  >
                    3 Months – 2 Websites
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.5 }}
                    className="text-sm sm:text-base md:text-lg text-background/70"
                  >
                    SEO for 2 websites — second site saves 15%
                  </motion.p>
                </div>

                {/* Price showcase */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="flex-shrink-0 text-center md:text-right"
                >
                  <div className="inline-flex flex-col items-center md:items-end gap-1 bg-background/10 backdrop-blur-sm rounded-2xl p-5 sm:p-6">
                    <span className="text-sm line-through text-background/40">
                      ${(WEBSITE_1_PRICE * 2).toFixed(2)}
                    </span>
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-background"
                    >
                      ${bundlePlan.monthlyPrice.toFixed(2)}
                    </motion.span>
                    <span className="text-sm text-background/60">one-time payment</span>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, type: "spring", bounce: 0.5 }}
                      className="inline-flex items-center gap-1 mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-green-500/15 text-green-500"
                    >
                      <Percent className="w-3 h-3" />
                      Save ${(WEBSITE_1_PRICE * 2 - bundlePlan.monthlyPrice).toFixed(2)}
                    </motion.span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Separator */}
        <div className="max-w-5xl mx-auto mb-8 sm:mb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
        </div>

        {/* Form + Order Summary */}
        <div className="grid lg:grid-cols-5 gap-6 lg:gap-12 max-w-5xl mx-auto">
          {/* Left: Form */}
          <div className="lg:col-span-3 space-y-5">
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)}>
              {/* Personal info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-4 sm:p-6 shadow-soft mb-5"
              >
                <h2 className="text-lg font-display font-semibold text-foreground mb-5">Your information</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <FloatingField
                    id="name"
                    label="Full Name"
                    icon={User}
                    placeholder="John Doe"
                    register={register}
                    error={errors.name?.message}
                    isDirty={dirtyFields.name}
                    isValidField={!!dirtyFields.name && !errors.name}
                  />
                  <FloatingField
                    id="email"
                    label="Email"
                    icon={Mail}
                    placeholder="john@company.com"
                    type="email"
                    register={register}
                    error={errors.email?.message}
                    isDirty={dirtyFields.email}
                    isValidField={!!dirtyFields.email && !errors.email}
                  />
                </div>
              </motion.div>

            </form>

            {/* Trust micro-copy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 px-1"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-primary/70" />
                <span className="text-xs">Takes less than 30 seconds</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-4 h-4 text-primary/70" />
                <span className="text-xs">Your data is encrypted & secure</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="w-4 h-4 text-primary/70" />
                <span className="text-xs">Cancel anytime</span>
              </div>
            </motion.div>
          </div>

          {/* Right: Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-5 sm:p-6 shadow-soft sticky top-8">
              <h3 className="font-display font-semibold text-foreground mb-5">Order Summary</h3>

              <div className="space-y-3 mb-5">
                {/* Website 1 line item */}
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Website 1 — 3 Months SEO</span>
                  <span className="font-medium text-foreground">${WEBSITE_1_PRICE.toFixed(2)}</span>
                </div>

                {/* Website 2 line item */}
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Website 2 — 3 Months SEO</span>
                    <Badge className="bg-green-500/15 text-green-600 border-green-500/20 text-[10px] px-1.5 py-0">
                      -{DISCOUNT_PERCENT}%
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs line-through text-muted-foreground/50">${WEBSITE_1_PRICE.toFixed(2)}</span>
                    <span className="font-medium text-foreground">${WEBSITE_2_PRICE.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border/60 mb-4" />

              {/* Savings */}
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="text-green-600 font-medium">You save</span>
                <span className="text-green-600 font-semibold">
                  -${(WEBSITE_1_PRICE * 2 - bundlePlan.monthlyPrice).toFixed(2)}
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-6">
                <span className="font-display font-semibold text-foreground">Total</span>
                <span className="font-display text-2xl font-bold text-foreground">
                  ${bundlePlan.monthlyPrice.toFixed(2)}
                </span>
              </div>

              {/* CTA */}
              <Button
                type="submit"
                form="checkout-form"
                disabled={isLoading || !isValid}
                className="w-full h-12 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 gap-2 rounded-xl hidden lg:flex"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    Continue to Payment
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="backdrop-blur-xl bg-background/80 border-t border-border/60 px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="font-display text-xl font-bold text-foreground">
                ${bundlePlan.monthlyPrice.toFixed(2)}
              </span>
            </div>
            <Button
              type="submit"
              form="checkout-form"
              disabled={isLoading || !isValid}
              className="h-11 px-6 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 gap-2 rounded-xl flex-1 max-w-[220px]"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Continue to Payment
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BundleCheckout;
