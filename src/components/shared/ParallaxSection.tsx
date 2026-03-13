import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number; // Positive = moves up as you scroll down, Negative = moves down
  opacity?: boolean;
  scale?: boolean;
}

const ParallaxSection = ({
  children,
  className = "",
  speed = 0.3,
  opacity = false,
  scale = false,
}: ParallaxSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const y = useTransform(smoothProgress, [0, 1], [100 * speed, -100 * speed]);
  const opacityValue = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.6, 1, 1, 0.6]);
  const scaleValue = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <motion.div
      ref={ref}
      style={{
        y,
        opacity: opacity ? opacityValue : 1,
        scale: scale ? scaleValue : 1,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxSection;
