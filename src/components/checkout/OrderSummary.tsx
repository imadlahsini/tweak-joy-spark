import { motion, AnimatePresence } from "framer-motion";
import { Check, Lock, Shield, ArrowRight, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/data/plans";

interface OrderSummaryProps {
  selectedPlan: Plan | null;
  isLoading: boolean;
  basePricePerMonth: number;
  isFormValid?: boolean;
  showFeatures?: boolean;
}

const ProgressStepper = ({ isFormValid }: { isFormValid: boolean }) => {
  const steps = [
    { num: 1, label: "Plan", complete: true },
    { num: 2, label: "Info", complete: isFormValid },
    { num: 3, label: "Payment", complete: false },
  ];

  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, i) => (
        <div key={step.num} className="flex items-center gap-1.5">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
              step.complete
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {step.complete ? <Check className="w-3 h-3" /> : step.num}
          </div>
          <span className={`text-xs font-medium ${step.complete ? "text-foreground" : "text-muted-foreground"}`}>
            {step.label}
          </span>
          {i < steps.length - 1 && (
            <div className="w-8 sm:w-12 h-px bg-border mx-1" />
          )}
        </div>
      ))}
    </div>
  );
};

const PaymentIcons = () => (
  <div className="flex items-center gap-2 opacity-50">
    {["Visa", "MC", "Amex", "Apple"].map((name) => (
      <div
        key={name}
        className="w-9 h-6 rounded border border-border bg-background flex items-center justify-center"
      >
        <span className="text-[8px] font-bold text-muted-foreground">{name}</span>
      </div>
    ))}
  </div>
);

const OrderSummary = ({ selectedPlan, isLoading, basePricePerMonth, isFormValid = false, showFeatures = true }: OrderSummaryProps) => {
  const months = selectedPlan
    ? selectedPlan.slug === "1-month" ? 1 : selectedPlan.slug === "3-months" ? 3 : selectedPlan.slug === "6-months" ? 6 : selectedPlan.slug === "1-year-special" ? 12 : 12
    : 1;
  const monthlyEquiv = selectedPlan ? selectedPlan.monthlyPrice / months : 0;
  const fullPrice = basePricePerMonth * months;
  const savings = selectedPlan ? fullPrice - selectedPlan.monthlyPrice : 0;

  return (
    <div className="lg:sticky lg:top-8">
      <div className="rounded-2xl sm:rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-elevated">
        {/* Gradient accent line */}
        <div className="h-1 accent-line" />

        <div className="p-5 sm:p-6 space-y-5">
          <ProgressStepper isFormValid={isFormValid} />

          <h3 className="font-display font-semibold text-foreground text-lg">Order summary</h3>

          <AnimatePresence mode="wait">
            {selectedPlan && (
              <motion.div
                key={selectedPlan.slug}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Plan name */}
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-foreground">{selectedPlan.name} Plan</p>
                    <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                  </div>
                  {selectedPlan.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                        selectedPlan.featured
                          ? "bg-primary text-primary-foreground"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      {selectedPlan.badge}
                    </span>
                  )}
                </div>

                {/* Features */}
                {showFeatures && (
                  <div className="border-t border-border/50 pt-4 space-y-2">
                    {selectedPlan.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>
                )}

                {/* Price breakdown */}
                <div className="border-t border-border/50 pt-4 space-y-2">
                  {months > 1 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          ${basePricePerMonth.toFixed(2)} × {months} months
                        </span>
                        <span className="text-muted-foreground line-through">${fullPrice.toFixed(2)}</span>
                      </div>
                      {savings > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600 font-medium">You save</span>
                          <span className="text-green-600 font-medium">-${savings.toFixed(2)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-between items-baseline pt-2">
                    <span className="text-muted-foreground font-medium">Total</span>
                    <div className="text-right">
                      <span className="font-display text-3xl font-bold text-foreground">
                        ${selectedPlan.monthlyPrice.toFixed(2)}
                      </span>
                      {months > 1 && (
                        <div className="text-xs text-muted-foreground">
                          ${monthlyEquiv.toFixed(2)}/mo
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA Button */}
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="relative group">
            {/* Animated gradient border on hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-primary rounded-xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500 group-hover:duration-200 animate-gradient bg-[length:200%_100%]" />
            <Button
              type="submit"
              form="checkout-form"
              disabled={isLoading || !selectedPlan}
              className="relative w-full h-12 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 gap-2 rounded-xl"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Continue to Payment
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </motion.div>

          {/* Trust signals */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs">30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-xs">Secure checkout powered by Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CreditCard className="w-4 h-4 text-primary" />
              <PaymentIcons />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
