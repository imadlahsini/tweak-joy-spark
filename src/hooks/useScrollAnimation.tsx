import { useRef } from "react";
import { useScroll, useTransform, useSpring, MotionValue } from "framer-motion";

interface ScrollAnimationOptions {
  offset?: ["start end" | "start start" | "center center" | "end start" | "end end", "start end" | "start start" | "center center" | "end start" | "end end"];
  smooth?: number;
}

interface ScrollAnimationReturn {
  ref: React.RefObject<HTMLElement>;
  scrollYProgress: MotionValue<number>;
  // Parallax transforms
  parallaxY: MotionValue<number>;
  parallaxYReverse: MotionValue<number>;
  parallaxYSlow: MotionValue<number>;
  parallaxYFast: MotionValue<number>;
  // Opacity transforms
  fadeIn: MotionValue<number>;
  fadeInOut: MotionValue<number>;
  // Scale transforms
  scaleUp: MotionValue<number>;
  scaleDown: MotionValue<number>;
  // Rotation transforms
  rotateIn: MotionValue<number>;
}

export const useScrollAnimation = (options: ScrollAnimationOptions = {}): ScrollAnimationReturn => {
  const { offset = ["start end", "end start"], smooth = 0.1 } = options;
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });

  // Smoothed progress for fluid animations
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Parallax transforms (element moves opposite to scroll)
  const parallaxY = useTransform(smoothProgress, [0, 1], [100, -100]);
  const parallaxYReverse = useTransform(smoothProgress, [0, 1], [-100, 100]);
  const parallaxYSlow = useTransform(smoothProgress, [0, 1], [50, -50]);
  const parallaxYFast = useTransform(smoothProgress, [0, 1], [150, -150]);

  // Opacity transforms
  const fadeIn = useTransform(scrollYProgress, [0, 0.3], [0, 1]);
  const fadeInOut = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  // Scale transforms
  const scaleUp = useTransform(scrollYProgress, [0, 0.5], [0.8, 1]);
  const scaleDown = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  // Rotation transforms
  const rotateIn = useTransform(scrollYProgress, [0, 0.5], [-10, 0]);

  return {
    ref: ref as React.RefObject<HTMLElement>,
    scrollYProgress: smoothProgress,
    parallaxY,
    parallaxYReverse,
    parallaxYSlow,
    parallaxYFast,
    fadeIn,
    fadeInOut,
    scaleUp,
    scaleDown,
    rotateIn,
  };
};

// Stagger animation variants for children
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem = {
  hidden: { 
    opacity: 0, 
    y: 30,
    filter: "blur(10px)",
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.2, 0.65, 0.3, 0.9] as const,
    },
  },
} as const;

export const staggerItemFromLeft = {
  hidden: { 
    opacity: 0, 
    x: -50,
    filter: "blur(10px)",
  },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.2, 0.65, 0.3, 0.9] as const,
    },
  },
} as const;

export const staggerItemFromRight = {
  hidden: { 
    opacity: 0, 
    x: 50,
    filter: "blur(10px)",
  },
  visible: { 
    opacity: 1, 
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.2, 0.65, 0.3, 0.9] as const,
    },
  },
} as const;

export const scaleInVariant = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.2, 0.65, 0.3, 0.9] as const,
    },
  },
} as const;

export default useScrollAnimation;
