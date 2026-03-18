import { type ReactNode } from "react";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.96 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, ease: [0.2, 0.65, 0.3, 0.9] }}
    className="admin-glass-panel-soft rounded-2xl py-16 px-8 text-center"
  >
    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-border/80 bg-white/40">
      <Icon className="h-[52px] w-[52px] text-muted-foreground stroke-[1.2]" />
    </div>
    <h2 className="mt-5 text-lg font-semibold text-foreground">{title}</h2>
    <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </motion.div>
);

export default EmptyState;
