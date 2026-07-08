'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Building2 } from 'lucide-react';
import clsx from 'clsx';
import {
  MOTION,
  COMMON_CARD_CLASSES,
  getStoryVariants,
  getIconHoverVariants,
  storyIconHover,
} from './motionVariants';

interface AnimatedStoryPanelProps {
  title: string;
  desc: string;
  footer: string;
}

export function AnimatedStoryPanel({ title, desc, footer }: AnimatedStoryPanelProps) {
  const shouldReduceMotion = !!useReducedMotion();

  const cardVariants = getStoryVariants(shouldReduceMotion);
  const iconVariants = getIconHoverVariants(shouldReduceMotion, storyIconHover);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={MOTION.viewport}
      whileHover="hover"
      className={clsx(
        'p-10 md:p-12 rounded-[40px] bg-slate-900/40 flex flex-col justify-between',
        COMMON_CARD_CLASSES
      )}
    >
      {/* Background ambient glow - static, not hover */}
      <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 blur-3xl opacity-50 pointer-events-none" aria-hidden="true" />
      
      <div className="space-y-6 relative z-10">
        <motion.div 
          className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-primary"
          variants={iconVariants}
        >
          <Building2 className="w-6 h-6" aria-hidden="true" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
        <p className="text-slate-400 text-base leading-relaxed">{desc}</p>
      </div>
      
      <div className="pt-8 border-t border-slate-800/50 mt-8 relative z-10">
        <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">
          {footer}
        </p>
      </div>
    </motion.div>
  );
}
