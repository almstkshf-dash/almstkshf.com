import { Variants } from 'framer-motion';

export const MOTION = {
  spring: {
    stiffness: 100,
    damping: 15,
  },
  springSubtle: {
    stiffness: 80,
    damping: 15,
  },
  hoverLift: -6,
  hoverLiftSubtle: -4,
  hoverScale: 1.02,
  hoverScaleSubtle: 1.01,
  viewport: {
    once: true,
    margin: '-50px' as const,
  },
  staggerDelay: 0.15,
  staggerDelayLong: 0.2,
};

export const COMMON_CARD_CLASSES = 'border border-slate-800/80 hover:border-slate-700/80 transition-colors duration-300 relative group overflow-hidden';

export const staggerContainer = (delay = MOTION.staggerDelay, shouldReduceMotion = false): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: shouldReduceMotion ? 0 : delay,
    },
  },
});

export const getSpringUpVariants = (shouldReduceMotion = false): Variants => ({
  hidden: {
    opacity: 0,
    y: shouldReduceMotion ? 0 : 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: shouldReduceMotion
      ? { duration: 0.2 }
      : {
          type: 'spring' as const,
          stiffness: MOTION.spring.stiffness,
          damping: MOTION.spring.damping,
        },
  },
  hover: shouldReduceMotion
    ? {}
    : {
        y: MOTION.hoverLift,
        scale: MOTION.hoverScale,
        transition: {
          type: 'spring' as const,
          stiffness: 300,
          damping: 20,
        },
      },
});

export const getStoryVariants = (shouldReduceMotion = false): Variants => ({
  hidden: {
    opacity: 0,
    x: shouldReduceMotion ? 0 : -35,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: shouldReduceMotion
      ? { duration: 0.2 }
      : {
          type: 'spring' as const,
          stiffness: MOTION.springSubtle.stiffness,
          damping: MOTION.springSubtle.damping,
          duration: 0.6,
        },
  },
  hover: shouldReduceMotion
    ? {}
    : {
        y: MOTION.hoverLiftSubtle,
        scale: MOTION.hoverScaleSubtle,
        transition: {
          type: 'spring' as const,
          stiffness: 300,
          damping: 20,
        },
      },
});

export const getMissionVisionVariants = (shouldReduceMotion = false): Variants => ({
  hidden: {
    opacity: 0,
    x: shouldReduceMotion ? 0 : 35,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: shouldReduceMotion
      ? { duration: 0.2 }
      : {
          type: 'spring' as const,
          stiffness: MOTION.springSubtle.stiffness,
          damping: MOTION.springSubtle.damping,
        },
  },
  hover: shouldReduceMotion
    ? {}
    : {
        y: MOTION.hoverLiftSubtle,
        scale: MOTION.hoverScaleSubtle,
        transition: {
          type: 'spring' as const,
          stiffness: 300,
          damping: 20,
        },
      },
});

export const getIconHoverVariants = (shouldReduceMotion = false, hoverEffect: any): Variants => ({
  hover: shouldReduceMotion ? {} : hoverEffect,
});

export const statsIconHover = {
  scale: 1.15,
  rotate: [0, -5, 5, 0],
  transition: { duration: 0.4 },
};

export const storyIconHover = {
  rotate: 360,
  transition: { duration: 0.8, ease: 'easeInOut' as const },
};

export const missionIconHover = {
  scale: 1.15,
  rotate: 15,
};

export const visionIconHover = {
  scale: 1.15,
  y: -2,
};

export const capabilitiesIconHover = {
  scale: 1.15,
  x: 2,
  transition: { duration: 0.2 },
};
