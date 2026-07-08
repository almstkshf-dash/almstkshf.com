'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck, TrendingUp } from 'lucide-react';
import clsx from 'clsx';
import {
  MOTION,
  COMMON_CARD_CLASSES,
  staggerContainer,
  getMissionVisionVariants,
  getIconHoverVariants,
  missionIconHover,
  visionIconHover,
} from './motionVariants';

interface PanelItem {
  title: string;
  desc: string;
}

interface AnimatedMissionVisionProps {
  mission: PanelItem;
  vision: PanelItem;
}

export function AnimatedMissionVision({ mission, vision }: AnimatedMissionVisionProps) {
  const shouldReduceMotion = !!useReducedMotion();

  const containerVariants = staggerContainer(MOTION.staggerDelayLong, shouldReduceMotion);
  const itemVariants = getMissionVisionVariants(shouldReduceMotion);
  const missionIconVariants = getIconHoverVariants(shouldReduceMotion, missionIconHover);
  const visionIconVariants = getIconHoverVariants(shouldReduceMotion, visionIconHover);

  return (
    <motion.div 
      className="flex flex-col gap-8 justify-between"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={MOTION.viewport}
    >
      {/* Mission Panel */}
      <motion.div
        variants={itemVariants}
        whileHover="hover"
        className={clsx(
          'p-8 rounded-[30px] bg-slate-900/40 flex gap-6',
          COMMON_CARD_CLASSES
        )}
      >
        <motion.div 
          className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0"
          variants={missionIconVariants}
        >
          <ShieldCheck className="w-6 h-6" aria-hidden="true" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">{mission.title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{mission.desc}</p>
        </div>
      </motion.div>

      {/* Vision Panel */}
      <motion.div
        variants={itemVariants}
        whileHover="hover"
        className={clsx(
          'p-8 rounded-[30px] bg-slate-900/40 flex gap-6',
          COMMON_CARD_CLASSES
        )}
      >
        <motion.div 
          className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-pink-400 flex-shrink-0"
          variants={visionIconVariants}
        >
          <TrendingUp className="w-6 h-6" aria-hidden="true" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">{vision.title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{vision.desc}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
export type { PanelItem };
