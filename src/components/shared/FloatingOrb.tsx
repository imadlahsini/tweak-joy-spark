import { motion } from "framer-motion";

interface FloatingOrbProps {
  className?: string;
  delay?: number;
  size?: string;
}

const FloatingOrb = ({ 
  className = "", 
  delay = 0,
  size = "w-96 h-96"
}: FloatingOrbProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ 
        opacity: 1, 
        scale: 1,
      }}
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
      }}
      viewport={{ once: true }}
      transition={{
        opacity: { duration: 1, delay },
        scale: { duration: 1, delay },
        y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay },
        x: { duration: 10, repeat: Infinity, ease: "easeInOut", delay: delay + 1 },
      }}
      className={`absolute rounded-full blur-3xl pointer-events-none ${size} ${className}`}
    />
  );
};

export default FloatingOrb;
