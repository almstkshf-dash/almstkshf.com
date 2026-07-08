'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Activity, Globe, Award, LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { CardGlow } from './CardGlow';
import {
  MOTION,
  COMMON_CARD_CLASSES,
  staggerContainer,
  getSpringUpVariants,
  getIconHoverVariants,
  statsIconHover,
} from './motionVariants';

const statsIconMap = {
  channels: Activity,
  countries: Globe,
  accuracy: Award,
} satisfies Record<string, LucideIcon>;

export interface StatItemInput {
  key: keyof typeof statsIconMap;
  value: string;
  desc: string;
  color: string;
}

interface AnimatedStatsGridProps {
  stats: StatItemInput[];
}

export function AnimatedStatsGrid({ stats }: AnimatedStatsGridProps) {
  const shouldReduceMotion = !!useReducedMotion();

  const containerVariants = staggerContainer(MOTION.staggerDelay, shouldReduceMotion);
  const cardVariants = getSpringUpVariants(shouldReduceMotion);
  const iconVariants = getIconHoverVariants(shouldReduceMotion, statsIconHover);

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={MOTION.viewport}
    >
      {stats.map((stat) => {
        const Icon = statsIconMap[stat.key];
        return (
          <motion.div
            key={`${stat.key}-${stat.value}`}
            variants={cardVariants}
            whileHover="hover"
            className={clsx(
              'p-8 rounded-[30px] bg-slate-900/30',
              COMMON_CARD_CLASSES
            )}
          >
            <CardGlow />
            
            <motion.div
              className={clsx(
                'w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6',
                stat.color
              )}
              variants={iconVariants}
            >
              <Icon className="w-7 h-7" aria-hidden="true" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-white mb-2">{stat.value}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{stat.desc}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
export type { statsIconMap };
