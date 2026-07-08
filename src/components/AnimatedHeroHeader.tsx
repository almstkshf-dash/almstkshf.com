'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedHeroHeaderProps {
  badge: string;
  title: string;
  subtitle: string;
}

export function AnimatedHeroHeader({ badge, title, subtitle }: AnimatedHeroHeaderProps) {
  const shouldReduceMotion = useReducedMotion();

  // Animation values
  const badgeInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 };
  const textInitial = shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 15 };

  const badgeAnimate = { opacity: 1, scale: 1 };
  const textAnimate = { opacity: 1, y: 0 };

  return (
    <header className="text-center space-y-6 max-w-3xl mx-auto" aria-labelledby="about-us-hero-title">
      <motion.div 
        initial={badgeInitial}
        animate={badgeAnimate}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-primary uppercase tracking-wider"
      >
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true"></span>
        {badge}
      </motion.div>
      <motion.h1 
        id="about-us-hero-title"
        initial={textInitial}
        animate={textAnimate}
        transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.1, ease: 'easeOut' }}
        className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight md:leading-none"
      >
        {title}
      </motion.h1>
      <motion.p 
        initial={textInitial}
        animate={textAnimate}
        transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
        className="text-lg sm:text-xl leading-relaxed text-slate-400"
      >
        {subtitle}
      </motion.p>
    </header>
  );
}
