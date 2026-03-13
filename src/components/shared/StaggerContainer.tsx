import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode, Children, isValidElement, cloneElement } from "react";

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  initialDelay?: number;
  once?: boolean;
  threshold?: number;
  direction?: "up" | "down" | "left" | "right";
}

const StaggerContainer = ({
  children,
  className = "",
  staggerDelay = 0.1,
  initialDelay = 0.1,
  once = true,
  threshold = 0.1,
  direction = "up",
}: StaggerContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    once,
    amount: threshold,
    margin: "-50px 0px -50px 0px",
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: initialDelay,
      },
    },
  };

  const getItemVariants = (): Variants => {
    const directionMap = {
      up: { y: 40, x: 0 },
      down: { y: -40, x: 0 },
      left: { x: 40, y: 0 },
      right: { x: -40, y: 0 },
    };

    const { x, y } = directionMap[direction];

    return {
      hidden: {
        opacity: 0,
        x,
        y,
        filter: "blur(10px)",
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        filter: "blur(0px)",
        transition: {
          duration: 0.6,
          ease: [0.2, 0.65, 0.3, 0.9],
        },
      },
    };
  };

  const itemVariants = getItemVariants();

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {Children.map(children, (child, index) => {
        if (isValidElement(child)) {
          return (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          );
        }
        return child;
      })}
    </motion.div>
  );
};

export default StaggerContainer;
