import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { Plan } from "@/data/plans";

interface PlanCardProps {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  basePricePerMonth: number;
}

const PlanCard = ({ plan, isSelected, onSelect, index, basePricePerMonth }: PlanCardProps) => {
  const months = plan.slug === "1-month" ? 1 : plan.slug === "3-months" ? 3 : plan.slug === "6-months" ? 6 : 12;
  const perMonth = plan.monthlyPrice / months;
  const savingsPercent = months > 1 ? Math.round((1 - perMonth / basePricePerMonth) * 100) : 0;

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.08, duration: 0.5, ease: [0.2, 0.65, 0.3, 0.9] }}
      onClick={onSelect}
      className={`relative w-full text-left rounded-xl border-2 transition-all duration-300 overflow-hidden group ${
        isSelected
          ? "border-primary shadow-elevated"
          : "border-border hover:border-primary/30 hover:shadow-soft"
      }`}
    >
      {/* Gradient left accent */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
          isSelected ? "accent-line opacity-100" : "bg-border opacity-0 group-hover:opacity-50"
        }`}
      />

      {/* Card content */}
      <div className={`relative px-4 py-3 pl-5 ${isSelected ? "bg-primary/5" : "bg-card"}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Radio indicator */}
            <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                isSelected
                  ? "border-primary bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
                  : "border-muted-foreground/30 group-hover:border-primary/50"
              }`}
            >
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", bounce: 0.5 }}
                  >
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-semibold text-foreground">{plan.name}</span>
                {plan.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${
                      plan.featured
                        ? "bg-primary text-primary-foreground"
                        : "bg-accent/15 text-accent"
                    }`}
                  >
                    {plan.badge}
                  </span>
                )}
                {savingsPercent > 0 && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600">
                    Save {savingsPercent}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <span className="font-display text-lg font-bold text-foreground">
              ${plan.monthlyPrice}
            </span>
            {months > 1 && (
              <div className="text-[11px] text-muted-foreground">
                ${perMonth.toFixed(2)}/mo
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default PlanCard;
