'use client';

/**
 * Video Forensics Result Component — v2
 *
 * Surfaces the full VideoAnalysisResult from the expanded videoEngine:
 *  • Overall AI-probability score + verdict
 *  • 4 aggregate forensic metrics (temporal inconsistency, flicker %, hair-edge %, bg inconsistency)
 *  • Score-bar timeline (one bar per frame, coloured by label)
 *  • Clickable frame scrubber with thumbnail + signal chips
 *  • Selected-frame pixel-stat strip
 *  • Legacy fallback if only old `combinedScore` data is present
 */

import {
  VideoAnalysisResult,
  VideoFrame,
  FramePixelStats,
} from '@/lib/engines/videoEngine';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Film,
  Activity,
  History,
  Search,
  AlertTriangle,
  ShieldCheck,
  Layers,
  Scan,
  Zap,
  Eye,
  Wind,
  Fingerprint,
  CheckCircle2,
  XCircle,
  BarChart3,
  AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

// ─── Props ────────────────────────────────────────────────────────────────────

interface VideoResultsProps {
  result: VideoAnalysisResult;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function riskMeta(score: number) {
  if (score >= 60)
    return {
      text: 'text-rose-500',
      border: 'border-rose-500/20',
      bg: 'bg-rose-500/5',
      label: 'HIGHLY SUSPICIOUS',
      bar: 'bg-rose-500',
    };
  if (score >= 30)
    return {
      text: 'text-amber-500',
      border: 'border-amber-500/20',
      bg: 'bg-amber-500/5',
      label: 'POSSIBLY MANIPULATED',
      bar: 'bg-amber-500',
    };
  return {
    text: 'text-emerald-500',
    border: 'border-emerald-500/20',
    bg: 'bg-emerald-500/5',
    label: 'APPEARS NATURAL',
    bar: 'bg-emerald-500',
  };
}

function frameMeta(frame: VideoFrame) {
  if (frame.label === 'AI')
    return { bar: 'bg-rose-500', ring: 'border-rose-500' };
  if (frame.label === 'Mixed')
    return { bar: 'bg-amber-400', ring: 'border-amber-400' };
  return { bar: 'bg-emerald-500', ring: 'border-emerald-500' };
}

function StatPill({
  label,
  value,
  unit = '',
  warn,
}: {
  label: string;
  value: string;
  unit?: string;
  warn?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-2xl border text-center ${warn
          ? 'bg-rose-500/5 border-rose-500/15'
          : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
        }`}
    >
      <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">
        {label}
      </span>
      <span
        className={`block font-mono text-lg font-bold ${warn ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100'
          }`}
      >
        {value}
        {unit}
      </span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function VideoResults({ result }: VideoResultsProps) {
  const t = useTranslations('AiInspector.video');
  const tCommon = useTranslations('AiInspector');
  const [selectedFrame, setSelectedFrame] = useState(0);

  // Resolve whether we have the new rich frames array
  const hasRichFrames =
    Array.isArray(result.frames) && result.frames.length > 0;

  // Use overallScore (v2) or fall back to combinedScore (v1)
  const displayScore = result.overallScore ?? result.combinedScore;
  const risk = riskMeta(displayScore);

  const currentFrame: VideoFrame | undefined = hasRichFrames
    ? result.frames[selectedFrame]
    : undefined;

  const currentStats: FramePixelStats | undefined = currentFrame?.stats;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">

      {/* ── Row 1 : Score + 4 aggregate metrics ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Score card */}
        <div
          className={`p-8 ${risk.bg} rounded-3xl border ${risk.border} flex flex-col items-center justify-center text-center relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Fingerprint className="w-24 h-24" />
          </div>
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">
            {t('video_probability')}
          </h3>

          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className={`text-8xl font-black tracking-tighter ${risk.text}`}
          >
            {displayScore}%
          </motion.div>

          <p
            className={`mt-4 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${risk.bg} ${risk.border} ${risk.text}`}
          >
            {result.verdict ?? risk.label}
          </p>

          {/* Mini duration / frames info */}
          <div className="mt-6 w-full space-y-1.5 text-left">
            {[
              {
                icon: Film,
                label: 'Duration',
                value: `${result.duration?.toFixed(1) ?? '?'}s`,
              },
              {
                icon: Layers,
                label: 'Frames sampled',
                value: `${result.framesAnalyzed ?? result.frameReports.length}`,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="text-[10px] text-zinc-500 truncate">
                  {label}: <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Aggregate metrics (2 cols) */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 ml-1">
            <BarChart3 className="w-4 h-4" />
            Temporal Forensic Metrics
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: Activity,
                label: 'Temporal Inconsistency',
                value: result.temporalInconsistency ?? '—',
                unit: ' σ',
                desc: 'Score standard-deviation across frames. High = AI temporal instability.',
                warn: (result.temporalInconsistency ?? 0) > 20,
              },
              {
                icon: Zap,
                label: 'Brightness Flicker',
                value: result.flickerScore ?? Math.round(result.temporalFlicker),
                unit: '%',
                desc: 'Percentage of frames with unnatural brightness jumps.',
                warn: (result.flickerScore ?? 0) > 30,
              },
              {
                icon: Wind,
                label: 'Hair / Edge Flicker',
                value: result.hairEdgeFlicker ?? '—',
                unit: '%',
                desc: 'Frames where border sharpness unstable while center stays fixed.',
                warn: (result.hairEdgeFlicker ?? 0) > 25,
              },
              {
                icon: Scan,
                label: 'Background Inconsistency',
                value: result.backgroundInconsistency ?? '—',
                unit: '',
                desc: 'Variance in background zone sharpness across frames.',
                warn: (result.backgroundInconsistency ?? 0) > 8,
              },
            ].map(({ icon: Icon, label, value, unit, desc, warn }) => (
              <motion.div
                key={label}
                whileHover={{ y: -2 }}
                className={`p-5 rounded-2xl border bg-white dark:bg-zinc-950 shadow-sm shadow-zinc-200/50 dark:shadow-none ${warn
                    ? 'border-rose-500/20'
                    : 'border-zinc-200 dark:border-zinc-800'
                  }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`p-1.5 rounded-lg ${warn
                        ? 'bg-rose-500/10 border border-rose-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'
                      }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${warn ? 'text-rose-500' : 'text-zinc-500'}`}
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    {label}
                  </span>
                </div>
                <p
                  className={`text-2xl font-black font-mono ${warn ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100'
                    }`}
                >
                  {value}
                  <span className="text-sm">{unit}</span>
                </p>
                <p className="text-[10px] text-zinc-400 mt-1 leading-snug">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2 : Score-bar timeline ───────────────────────────────────── */}
      {hasRichFrames && (
        <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {t('temporal_flicker')}
            </h3>
            <span className="text-[10px] font-mono text-zinc-500 bg-zinc-200/50 dark:bg-zinc-800 px-2 py-0.5 rounded italic">
              {result.temporalFlicker?.toFixed(4) ?? '—'} Variance Coeff
            </span>
          </div>

          {/* Score bars */}
          <div className="h-28 flex items-end gap-1.5 px-2 mb-4">
            {result.frames.map((frame, idx) => {
              const meta = frameMeta(frame);
              return (
                <motion.button
                  key={idx}
                  title={`${frame.timestamp.toFixed(2)}s — ${frame.label} (${frame.score}%)`}
                  onClick={() => setSelectedFrame(idx)}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: `${Math.max(6, frame.score)}%`,
                    opacity: 1,
                  }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ scaleY: 1.08 }}
                  className={`flex-1 rounded-t-lg origin-bottom ${meta.bar} ${selectedFrame === idx ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-1' : ''
                    }`}
                />
              );
            })}
          </div>

          {/* X-axis timestamps */}
          <div className="flex justify-between px-2">
            <span className="text-[9px] font-mono text-zinc-400">0s</span>
            <span className="text-[9px] font-mono text-zinc-400">
              {result.duration?.toFixed(1) ?? '?'}s
            </span>
          </div>

          <p className="text-xs text-zinc-500 leading-relaxed mt-4 max-w-sm ml-auto text-right italic">
            {t('flicker_info')}
          </p>
        </div>
      )}

      {/* Legacy score-bar (no rich frames) */}
      {!hasRichFrames && result.frameReports.length > 0 && (
        <div className="p-8 bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="w-4 h-4" />
              {t('temporal_flicker')}
            </h3>
          </div>
          <div className="h-24 flex items-end gap-1.5 px-4 mb-6">
            {result.frameReports.map((report, idx) => (
              <motion.div
                key={idx}
                initial={{ height: 0 }}
                animate={{ height: `${(report.report.confidenceScore / 100) * 100}%` }}
                transition={{ delay: idx * 0.05 }}
                className={`flex-1 rounded-t-lg ${report.report.overallRisk === 'high'
                    ? 'bg-rose-500'
                    : report.report.overallRisk === 'medium'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Row 3 : Frame thumbnail scrubber ────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 ml-1">
          <History className="w-4 h-4" />
          {t('frame_timeline')}
        </h3>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {(hasRichFrames ? result.frames : result.frameReports).map(
            (item, idx) => {
              const isRich = hasRichFrames;
              const frame = isRich ? (item as VideoFrame) : null;
              const legacy = !isRich
                ? (item as VideoAnalysisResult['frameReports'][0])
                : null;

              const thumb = frame?.thumbnail ?? legacy?.thumbnail ?? '';
              const ts = frame?.timestamp ?? legacy?.timestamp ?? 0;
              const isHigh = frame
                ? frame.label === 'AI'
                : legacy?.report.overallRisk === 'high';
              const isLow = frame
                ? frame.label === 'Human'
                : legacy?.report.overallRisk === 'low';
              const ringClass = frame
                ? frameMeta(frame as VideoFrame).ring
                : isHigh
                  ? 'border-rose-500'
                  : 'border-emerald-500';

              return (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedFrame(idx)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex-shrink-0 w-44 aspect-video rounded-xl overflow-hidden border-2 transition-all snap-start ${selectedFrame === idx
                      ? `${ringClass} ring-4 ring-zinc-900/10 dark:ring-zinc-100/10`
                      : 'border-zinc-200 dark:border-zinc-800'
                    }`}
                >
                  <img
                    src={thumb}
                    className="w-full h-full object-cover"
                    alt={`Frame at ${ts}s`}
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {isHigh && (
                      <AlertTriangle className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                    )}
                    {isLow && (
                      <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
                    )}
                  </div>
                  {frame && (
                    <div className="absolute top-2 left-2">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-full font-mono ${frame.label === 'AI'
                            ? 'bg-rose-500 text-white'
                            : frame.label === 'Mixed'
                              ? 'bg-amber-400 text-black'
                              : 'bg-emerald-500 text-white'
                          }`}
                      >
                        {frame.score}%
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-[10px] font-mono text-white/80">
                      {ts.toFixed(2)}s
                    </span>
                  </div>
                </motion.button>
              );
            },
          )}
        </div>
      </div>

      {/* ── Row 4 : Selected frame detail panel ─────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedFrame}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="p-8 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 rounded-full bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">
                {t('analysis_report')}{' '}
                <span className="text-zinc-400 opacity-50 ml-2">
                  #{String(selectedFrame + 1).padStart(2, '0')}
                </span>
              </h4>
              <p className="text-xs text-zinc-500 font-medium">
                {t('report_desc')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Thumbnail + scan overlay */}
            <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-video relative group">
              <img
                src={
                  currentFrame?.thumbnail ??
                  result.frameReports[selectedFrame]?.thumbnail ??
                  ''
                }
                className="w-full h-full object-cover grayscale-[0.25] transition-all group-hover:grayscale-0 duration-500"
                alt="Selected frame"
              />
              {/* Scan line */}
              <motion.div
                initial={{ top: '-100%' }}
                animate={{ top: '110%' }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 w-full h-px bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-20 pointer-events-none"
              />
              <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <Search className="w-12 h-12 text-white/50" />
              </div>
              {currentFrame && (
                <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-end gap-6 text-white/90">
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-white/40">
                      AI Score
                    </span>
                    <span className="block font-mono text-2xl font-black">
                      {currentFrame.score}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-white/40">
                      Label
                    </span>
                    <span className="block font-mono text-lg font-black">
                      {currentFrame.label}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-white/40">
                      Timestamp
                    </span>
                    <span className="block font-mono text-lg">
                      {currentFrame.timestamp.toFixed(2)}s
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Signals + stats */}
            <div className="space-y-6">
              {/* Signal chips */}
              {currentFrame && (
                <div className="space-y-3">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                    Detected Signals
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentFrame.signals.map(sig => {
                      const clean = sig === 'No strong signals detected';
                      return (
                        <span
                          key={sig}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${clean
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                            }`}
                        >
                          {clean ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {sig}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Legacy signals fallback */}
              {!currentFrame &&
                result.frameReports[selectedFrame]?.report.pixelLogicSignals && (
                  <div>
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3">
                      Signal Methodology
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      {result.frameReports[
                        selectedFrame
                      ].report.pixelLogicSignals.map(sig => (
                        <div
                          key={sig.id}
                          className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-900 flex flex-col justify-center items-center text-center"
                        >
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">
                            {sig.label}
                          </span>
                          <span
                            className={`text-sm font-black font-mono ${sig.risk === 'flag'
                                ? 'text-rose-500'
                                : sig.risk === 'concern'
                                  ? 'text-amber-500'
                                  : 'text-emerald-500'
                              }`}
                          >
                            {sig.detectedValue}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Pixel stats strip */}
              {currentStats && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                    Frame Pixel Stats
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        label: 'Noise',
                        value: currentStats.noiseLevel.toFixed(1),
                        warn: currentStats.noiseLevel < 14,
                      },
                      {
                        label: 'Uniformity',
                        value: (currentStats.colorUniformity * 100).toFixed(0),
                        unit: '%',
                        warn: currentStats.colorUniformity > 0.76,
                      },
                      {
                        label: 'Edge Sharp',
                        value: currentStats.edgeSharpness.toFixed(1),
                        warn: currentStats.edgeSharpness < 7,
                      },
                      {
                        label: 'Brightness',
                        value: currentStats.avgBrightness.toFixed(0),
                      },
                      {
                        label: 'Center Sharp',
                        value: currentStats.centerSharpness.toFixed(1),
                      },
                      {
                        label: 'Border Sharp',
                        value: currentStats.borderSharpness.toFixed(1),
                        warn:
                          currentStats.centerSharpness > 0 &&
                          currentStats.borderSharpness <
                          currentStats.centerSharpness * 0.45,
                      },
                      {
                        label: 'Color Blocks',
                        value: String(currentStats.localColorBlocks),
                        warn: currentStats.localColorBlocks < 18,
                      },
                      {
                        label: 'BG Variance',
                        value: currentStats.bgZoneVariance.toFixed(1),
                        warn: currentStats.bgZoneVariance > 8,
                      },
                    ].map(({ label, value, unit = '', warn }) => (
                      <StatPill
                        key={label}
                        label={label}
                        value={value}
                        unit={unit}
                        warn={warn}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Footer disclaimer ──────────────────────────────────────────────── */}
      <p className="text-xs text-zinc-400 leading-relaxed italic text-center max-w-2xl mx-auto">
        {tCommon('footer_disclaimer')}
      </p>

    </div>
  );
}
