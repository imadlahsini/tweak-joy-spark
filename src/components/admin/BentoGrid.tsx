import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  BentoGrid                                                         */
/* ------------------------------------------------------------------ */

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export const BentoGrid = ({ children, className }: BentoGridProps) => (
  <div className={cn("admin-bento-grid", className)}>{children}</div>
);

/* ------------------------------------------------------------------ */
/*  BentoCell                                                         */
/* ------------------------------------------------------------------ */

interface BentoCellProps {
  /** CSS grid-area name (maps to grid-template-areas in index.css) */
  area?: string;
  /** Show accent gradient stripe at the top */
  accent?: boolean;
  className?: string;
  children: ReactNode;
}

export const BentoCell = ({ area, accent, className, children }: BentoCellProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", damping: 28, stiffness: 260 }}
    style={area ? ({ gridArea: area } as CSSProperties) : undefined}
    className={cn(
      "admin-bento-cell p-4",
      accent && "admin-bento-cell-accent",
      className,
    )}
  >
    {children}
  </motion.div>
);
