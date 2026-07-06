'use client';

import { motion } from 'framer-motion';
import { Activity, Globe, Award, ShieldCheck, TrendingUp, Building2 } from 'lucide-react';

/* --- Animated Hero Header Component --- */
interface AnimatedHeroHeaderProps {
  badge: string;
  title: string;
  subtitle: string;
}

export function AnimatedHeroHeader({ badge, title, subtitle }: AnimatedHeroHeaderProps) {
  return (
    <div className="text-center space-y-6 max-w-3xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-primary uppercase tracking-wider"
      >
        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" aria-hidden="true"></span>
        {badge}
      </motion.div>
      <motion.h1 
        id="about-us-hero-title"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-tight md:leading-none"
      >
        {title}
      </motion.h1>
      <motion.p 
        id="about-us-hero-desc"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="text-lg sm:text-xl leading-relaxed text-slate-400"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}

/* --- Animated Stats Grid Component --- */
const statsIconMap = {
  channels: Activity,
  countries: Globe,
  accuracy: Award,
};

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
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      id="about-us-stats-grid"
      className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {stats.map((stat) => {
        const Icon = statsIconMap[stat.key];
        return (
          <motion.div
            key={stat.key}
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            className="p-8 rounded-[30px] bg-slate-900/30 border border-slate-800/80 hover:border-slate-700/80 transition-colors duration-300 relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/50 via-slate-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />
            
            <motion.div
              className={`w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 ${stat.color}`}
              whileHover={{ 
                scale: 1.15,
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.4 } 
              }}
            >
              <Icon className="w-7 h-7" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-white mb-2">{stat.value}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{stat.desc}</p>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* --- Animated Story Panel Component --- */
interface AnimatedStoryPanelProps {
  title: string;
  desc: string;
  footer: string;
}

export function AnimatedStoryPanel({ title, desc, footer }: AnimatedStoryPanelProps) {
  return (
    <motion.div
      id="about-us-story-panel"
      initial={{ opacity: 0, x: -35 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, type: 'spring' as const, stiffness: 80, damping: 15 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="p-10 md:p-12 rounded-[40px] bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-colors duration-300 flex flex-col justify-between relative group overflow-hidden"
    >
      <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/5 via-transparent to-purple-500/5 blur-3xl opacity-50"></div>
      <div className="space-y-6 relative z-10">
        <motion.div 
          className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-primary"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <Building2 className="w-6 h-6" />
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

/* --- Animated Mission & Vision Panels Component --- */
interface PanelItem {
  title: string;
  desc: string;
}

interface AnimatedMissionVisionProps {
  mission: PanelItem;
  vision: PanelItem;
}

export function AnimatedMissionVision({ mission, vision }: AnimatedMissionVisionProps) {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 35 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 80,
        damping: 15,
      },
    },
  };

  return (
    <motion.div 
      className="flex flex-col gap-8 justify-between"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {/* Mission Panel */}
      <motion.div
        id="about-us-mission-panel"
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.01 }}
        className="p-8 rounded-[30px] bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-colors duration-300 flex gap-6 relative group overflow-hidden"
      >
        <motion.div 
          className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400 flex-shrink-0"
          whileHover={{ scale: 1.15, rotate: 15 }}
        >
          <ShieldCheck className="w-6 h-6" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">{mission.title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{mission.desc}</p>
        </div>
      </motion.div>

      {/* Vision Panel */}
      <motion.div
        id="about-us-vision-panel"
        variants={itemVariants}
        whileHover={{ y: -4, scale: 1.01 }}
        className="p-8 rounded-[30px] bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 transition-colors duration-300 flex gap-6 relative group overflow-hidden"
      >
        <motion.div 
          className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-pink-400 flex-shrink-0"
          whileHover={{ scale: 1.15, y: -2 }}
        >
          <TrendingUp className="w-6 h-6" />
        </motion.div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">{vision.title}</h2>
          <p className="text-slate-400 text-sm leading-relaxed">{vision.desc}</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* --- Animated Capabilities Grid Component --- */
const featuresIconMap = {
  monitoring: Activity,
  compliance: ShieldCheck,
  analytics: TrendingUp,
};

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
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <motion.div
      id="about-us-capabilities-grid"
      className="grid grid-cols-1 md:grid-cols-3 gap-8"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
    >
      {features.map((feat) => {
        const Icon = featuresIconMap[feat.key];
        return (
          <motion.div
            key={feat.key}
            variants={itemVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            className="p-8 rounded-[30px] bg-slate-900/30 border border-slate-800/80 hover:border-slate-700/80 transition-colors duration-300 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/40 via-slate-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />

            <div className="space-y-4">
              <motion.div
                whileHover={{ scale: 1.15, x: 2 }}
                transition={{ duration: 0.2 }}
                className="w-fit"
              >
                <Icon className={`w-8 h-8 text-slate-500 transition-colors duration-300 ${feat.color}`} />
              </motion.div>
              <h3 className="text-lg font-bold text-white">{feat.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
