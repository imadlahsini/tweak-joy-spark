import { motion } from "framer-motion";

interface SectionBadgeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variant?: "default" | "light";
}

const SectionBadge = ({ 
  children, 
  className = "",
  delay = 0,
  variant = "default"
}: SectionBadgeProps) => {
  const isLight = variant === "light";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <span className={`inline-flex items-center gap-2 font-medium text-sm px-4 py-2 rounded-full border ${
        isLight 
          ? "bg-blue-500/15 text-blue-200 border-blue-400/25 backdrop-blur-sm" 
          : "bg-primary/10 text-primary border-primary/20"
      } ${className}`}>
        <span className={`w-2 h-2 rounded-full animate-pulse ${isLight ? "bg-purple-400" : "bg-primary"}`} />
        {children}
      </span>
    </motion.div>
  );
};

export default SectionBadge;
