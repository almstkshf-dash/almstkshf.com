'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Activity, ShieldCheck, TrendingUp, LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { CardGlow } from './CardGlow';
import {
  MOTION,
  COMMON_CARD_CLASSES,
  staggerContainer,
  getSpringUpVariants,
  getIconHoverVariants,
  capabilitiesIconHover,
} from './motionVariants';

const featuresIconMap = {
  monitoring: Activity,
  compliance: ShieldCheck,
  analytics: TrendingUp,
} satisfies Record<string, LucideIcon>;

export interface FeatureItemInput {
  key: keyof typeof featuresIconMap;
  title: string;
  desc: string;
  color: string;
}

interface AnimatedCapabilitiesGridProps {
  features: FeatureItemInput[];
}

export function AnimatedCapabilitiesGrid({ features }: AnimatedCapabilitiesGridProps) {
  const shouldReduceMotion = !!useReducedMotion();

  const containerVariants = staggerContainer(MOTION.staggerDelay, shouldReduceMotion);
  const itemVariants = getSpringUpVariants(shouldReduceMotion);
  const iconVariants = getIconHoverVariants(shouldReduceMotion, capabilitiesIconHover);

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={MOTION.viewport}
    >
      {features.map((feat) => {
        const Icon = featuresIconMap[feat.key];
        return (
          <motion.div
            key={`${feat.key}-${feat.title}`}
            variants={itemVariants}
            whileHover="hover"
            className={clsx(
              'p-8 rounded-[30px] bg-slate-900/30',
              COMMON_CARD_CLASSES
            )}
          >
            <CardGlow className="bg-gradient-to-br from-slate-900/40 via-slate-800/10 to-transparent" />

            <div className="space-y-4">
              <motion.div
                className="w-fit"
                variants={iconVariants}
              >
                <Icon 
                  className={clsx(
                    'w-8 h-8 text-slate-500 transition-colors duration-300',
                    feat.color
                  )} 
                  aria-hidden="true"
                />
              </motion.div>
              <h3 className="text-lg font-bold text-white">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
export type { featuresIconMap };
