'use client';

/**
 * Text Forensics Result Component — v2
 *
 * Surfaces the full TextAnalysisResult from textEngine.ts:
 *  • Overall AI-probability score + verdict badge
 *  • 6 aggregate linguistic metrics (burstiness, TTR, passive voice, etc.)
 *  • Named signal chips (severity-coloured, grouped)
 *  • Per-sentence breakdown list (click to highlight)
 *  • Colour-coded forensic text view (opener / transition / hedge / closer / human)
 *  • Footer disclaimer
 */

import { TextAnalysisResult, SentenceResult, HighlightedRange } from '@/lib/engines/textEngine';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Info,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Fingerprint,
  BarChart3,
  Activity,
  BookOpen,
  Type,
  AlignLeft,
  Zap,
  Wind,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';

// ─── Props ────────────────────────────────────────────────────────────────────

interface TextResultsProps {
  result: TextAnalysisResult;
  rawText: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreMeta(score: number) {
  if (score >= 70)
    return { text: 'text-rose-500', bg: 'bg-rose-500/5', border: 'border-rose-500/20', bar: 'bg-rose-500', labelKey: 'score_fully_ai' as const };
  if (score >= 50)
    return { text: 'text-orange-500', bg: 'bg-orange-500/5', border: 'border-orange-500/20', bar: 'bg-orange-400', labelKey: 'score_mostly_ai' as const };
  if (score >= 30)
    return { text: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20', bar: 'bg-amber-400', labelKey: 'score_mixed' as const };
  return { text: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', bar: 'bg-emerald-500', labelKey: 'score_likely_human' as const };
}

function sentenceMeta(s: SentenceResult) {
  if (s.label === 'AI') return { bar: 'bg-rose-500', ring: 'border-rose-500/40', badge: 'bg-rose-500 text-white' };
  if (s.label === 'Mixed') return { bar: 'bg-amber-400', ring: 'border-amber-400/40', badge: 'bg-amber-400 text-black' };
  return { bar: 'bg-emerald-500', ring: 'border-emerald-500/40', badge: 'bg-emerald-500 text-white' };
}

function severityStyle(sev: string) {
  if (sev === 'high') return 'bg-rose-500/15 border-rose-500/30 text-rose-500 dark:text-rose-400 font-bold';
  if (sev === 'medium') return 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold';
  return 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold';
}

// Highlight type colours
const HIGHLIGHT_STYLE: Record<HighlightedRange['type'], string> = {
  opener: 'bg-rose-400/25 border-b-2 border-rose-500/60 text-rose-900 dark:text-rose-200',
  closer: 'bg-rose-400/20 border-b-2 border-rose-400/50 text-rose-900 dark:text-rose-200',
  transition: 'bg-amber-400/20 border-b-2 border-amber-500/50 text-amber-900 dark:text-amber-200',
  hedge: 'bg-purple-400/15 border-b-2 border-purple-400/40 text-purple-900 dark:text-purple-200',
  human: 'bg-emerald-400/20 border-b-2 border-emerald-500/50 text-emerald-900 dark:text-emerald-300',
  marker: 'bg-zinc-400/15 border-b border-zinc-400/40 text-zinc-700 dark:text-zinc-300',
};

// ─── Highlighted text renderer ────────────────────────────────────────────────

function HighlightedText({
  rawText,
  ranges,
  activeStart,
  activeEnd,
}: {
  rawText: string;
  ranges: HighlightedRange[];
  activeStart?: number;
  activeEnd?: number;
}) {
  if (!ranges.length) {
    return (
      <p className="text-zinc-600 dark:text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
        {rawText}
      </p>
    );
  }

  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const segments: React.ReactNode[] = [];
  let last = 0;

  sorted.forEach((range, idx) => {
    if (range.start > last) {
      const plain = rawText.slice(last, range.start);
      segments.push(<span key={`p-${idx}`}>{plain}</span>);
    }
    const isActive =
      activeStart !== undefined &&
      activeEnd !== undefined &&
      range.start >= activeStart &&
      range.end <= activeEnd;

    segments.push(
      <motion.span
        key={`h-${idx}`}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        className={`px-0.5 rounded font-medium ${HIGHLIGHT_STYLE[range.type]} ${isActive ? 'ring-2 ring-zinc-900/30 dark:ring-zinc-100/30' : ''}`}
        title={range.type}
      >
        {rawText.slice(range.start, range.end)}
      </motion.span>,
    );
    last = range.end;
  });

  if (last < rawText.length) {
    segments.push(<span key="p-final">{rawText.slice(last)}</span>);
  }

  return (
    <div className="text-zinc-600 dark:text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm">
      {segments}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TextResults({ result, rawText }: TextResultsProps) {
  const t = useTranslations('AiInspector.text');
  const tCommon = useTranslations('AiInspector');
  const [selectedSentence, setSelectedSentence] = useState<number | null>(null);

  const risk = scoreMeta(result.score);
  const sel: SentenceResult | null =
    selectedSentence !== null ? (result.sentences[selectedSentence] ?? null) : null;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── Row 1 : Score + 6 aggregate metrics ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Score card */}
        <div className={`p-8 ${risk.bg} rounded-3xl border ${risk.border} flex flex-col items-center justify-center text-center relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Fingerprint className="w-24 h-24" />
          </div>
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">
            {tCommon('results_summary')}
          </h3>
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
            className={`text-8xl font-black tracking-tighter ${risk.text}`}
          >
            {result.score}%
          </motion.div>
          <p className={`mt-4 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${risk.bg} ${risk.border} ${risk.text}`}>
            {result.verdictKey ? t(result.verdictKey) : t(risk.labelKey)}
          </p>

          {/* Mini stats */}
          <div className="mt-6 w-full space-y-1.5 text-left">
            {[
              { icon: Type, label: t('words'), value: String(result.wordCount), key: 'words' },
              { icon: AlignLeft, label: t('sentences'), value: String(result.sentences.length), key: 'sentences' },
              { icon: BookOpen, label: t('language'), value: result.isArabicDominant ? t('lang_arabic') : t('lang_english'), key: 'language' },
            ].map(({ icon: Icon, label, value, key }) => (
              <div key={key} className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span className="text-[10px] text-zinc-500 truncate">
                  {label}:{' '}
                  <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">{value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Aggregate metrics (2/3 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
            <BarChart3 className="w-4 h-4" />
            {t('forensic_metrics')}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: Activity,
                label: t('burstiness'),
                value: result.burstinessScore,
                unit: '/100',
                desc: t('burstiness_desc'),
                warn: result.burstinessScore < 30,
                key: 'burstiness',
              },
              {
                icon: BookOpen,
                label: t('vocabulary_richness'),
                value: result.vocabularyRichness,
                unit: '%',
                desc: t('vocabulary_richness_desc'),
                warn: result.wordCount > 50 && result.vocabularyRichness < 35,
                key: 'vocabulary',
              },
              {
                icon: Wind,
                label: t('passive_voice'),
                value: result.passiveVoiceRatio,
                unit: '%',
                desc: t('passive_voice_desc'),
                warn: result.passiveVoiceRatio > 50,
                key: 'passive',
              },
              {
                icon: Zap,
                label: t('contraction_rate'),
                value: result.contractionRatio,
                unit: '%',
                desc: t('contraction_rate_desc'),
                warn: !result.isArabicDominant && result.contractionRatio < 1,
                key: 'contraction',
              },
              {
                icon: AlignLeft,
                label: t('list_density'),
                value: result.listDensity,
                unit: '%',
                desc: t('list_density_desc'),
                warn: result.listDensity > 40,
                key: 'list',
              },
              {
                icon: MessageSquare,
                label: t('avg_sentence_length'),
                value: result.avgSentenceLength,
                unit: ` ${t('words')}`,
                desc: t('avg_sentence_length_desc'),
                warn: result.avgSentenceLength >= 15 && result.avgSentenceLength <= 28,
                key: 'avglen',
              },
            ].map(({ icon: Icon, label, value, unit, desc, warn, key }) => (
              <motion.div
                key={key}
                whileHover={{ y: -2 }}
                className={`p-5 rounded-2xl border bg-card dark:bg-muted/50 shadow-sm shadow-zinc-200/50 dark:shadow-none ${warn ? 'border-rose-500/20' : 'border-zinc-200 dark:border-zinc-800'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-1.5 rounded-lg ${warn ? 'bg-rose-500/10 border border-rose-500/20' : 'bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800'}`}>
                    <Icon className={`w-3.5 h-3.5 ${warn ? 'text-rose-500' : 'text-zinc-500'}`} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
                </div>
                <p className={`text-2xl font-black font-mono ${warn ? 'text-rose-500' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {value}<span className="text-sm">{unit}</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 2 : Named signals ─────────────────────────────────────────── */}
      {result.signals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
            <Info className="w-4 h-4" />
            {t('detailed_breakdown')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.signals.map(sig => (
              <motion.div
                key={sig.id}
                whileHover={{ y: -2 }}
                className={`p-5 rounded-2xl border flex items-start gap-3 bg-white dark:bg-muted shadow-sm shadow-zinc-200/50 dark:shadow-none ${severityStyle(sig.severity).includes('rose') ? 'border-rose-500/15' : sig.severity === 'medium' ? 'border-amber-500/15' : 'border-zinc-200 dark:border-zinc-800'}`}
              >
                <div className={`mt-0.5 flex-shrink-0 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${severityStyle(sig.severity)}`}>
                  {sig.severity}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    {sig.labelKey ? t(sig.labelKey) : sig.label}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                    {sig.descKey ? t(sig.descKey) : sig.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No signals — clean pass */}
      {result.signals.length === 0 && (
        <div className="flex flex-col items-center justify-center p-10 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 gap-3">
          <ShieldCheck className="w-12 h-12" />
          <span className="text-sm font-bold uppercase tracking-widest">{t('low_ai_probability')}</span>
        </div>
      )}

      {/* ── Row 3 : Sentence timeline ─────────────────────────────────────── */}
      {result.sentences.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 ml-1">
            <Activity className="w-4 h-4" />
            {t('sentence_breakdown')}
          </h3>

          {/* Score bar strip */}
          <div className="h-16 flex items-end gap-0.5 px-1">
            {result.sentences.map((s, idx) => {
              const meta = sentenceMeta(s);
              return (
                <motion.button
                  key={idx}
                  title={`Sentence ${idx + 1} — ${s.label} (${s.score}%)\n${s.text.slice(0, 80)}…`}
                  onClick={() => setSelectedSentence(selectedSentence === idx ? null : idx)}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: `${Math.max(6, s.score)}%`, opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={{ scaleY: 1.12 }}
                  className={`flex-1 min-w-[6px] rounded-t origin-bottom ${meta.bar} ${selectedSentence === idx ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 ring-offset-1' : ''}`}
                />
              );
            })}
          </div>

          {/* Sentence list */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-hide">
            {result.sentences.map((s, idx) => {
              const meta = sentenceMeta(s);
              const isSelected = selectedSentence === idx;
              return (
                <motion.button
                  key={idx}
                  onClick={() => setSelectedSentence(isSelected ? null : idx)}
                  whileHover={{ x: 2 }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 ${isSelected ? `${meta.ring} bg-zinc-50 dark:bg-zinc-900` : 'border-zinc-100 dark:border-zinc-900 bg-card dark:bg-muted/50'}`}
                >
                  <span className={`flex-shrink-0 text-[9px] font-black px-1.5 py-0.5 rounded font-mono mt-0.5 ${meta.badge}`}>
                    {s.score}%
                  </span>
                  <p className="text-xs text-zinc-600 dark:text-muted-foreground leading-snug line-clamp-2">
                    {s.text}
                  </p>
                  <span className={`ml-auto flex-shrink-0 text-[9px] font-black uppercase tracking-wider ${meta.badge.replace('bg-', 'text-').replace(' text-white', '').replace(' text-black', '')}`}>
                    {t(`label_${s.label.toLowerCase()}`)}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Selected sentence detail */}
          <AnimatePresence mode="wait">
            {sel && (
              <motion.div
                key={selectedSentence}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-6 bg-card dark:bg-muted/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-lg shadow-zinc-200/40 dark:shadow-none space-y-4"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {t('sentence_detail', { num: String((selectedSentence ?? 0) + 1) })}
                  </span>
                </div>
                <blockquote className="text-sm text-zinc-700 dark:text-zinc-300 italic border-l-2 border-zinc-300 dark:border-zinc-700 pl-4 leading-relaxed">
                  {sel.text}
                </blockquote>
                <div className="flex flex-wrap gap-2">
                  {sel.signals.map(sig => {
                    const clean = sig === 'No strong signals';
                    // Try to resolve via i18n using the signal string as a key stub
                    const sigKey = `signal_${sig.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_label`;
                    const displayLabel = !clean && t.has(sigKey) ? t(sigKey) : sig;
                    return (
                      <span
                        key={sig}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black border shadow-sm ${clean
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/15 border-rose-500/30 text-rose-500 dark:text-rose-400'}`}
                      >
                        {clean ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                        {displayLabel}
                      </span>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Row 4 : Forensic highlight view ──────────────────────────────── */}
      <div className="p-10 bg-card dark:bg-muted/50 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Search className="w-32 h-32" />
        </div>

        {/* Scanning line */}
        <motion.div
          initial={{ top: '-100%' }}
          animate={{ top: '110%' }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 w-full h-px bg-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.5)] z-20 pointer-events-none"
        />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <Search className="w-4 h-4" />
              {t('source_view')}
            </h3>
            <span className="text-[10px] font-mono font-bold px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 rounded-full flex items-center gap-1.5 uppercase tracking-tighter">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {t('live_overlay')}
            </span>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3">
            {[
              { type: 'opener', labelKey: 'legend_opener', color: 'bg-rose-400' },
              { type: 'closer', labelKey: 'legend_closer', color: 'bg-rose-300' },
              { type: 'transition', labelKey: 'legend_transition', color: 'bg-amber-400' },
              { type: 'hedge', labelKey: 'legend_hedge', color: 'bg-purple-400' },
              { type: 'human', labelKey: 'legend_human', color: 'bg-emerald-400' },
            ].map(({ type, labelKey, color }) => (
              <span key={type} className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-500">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                {t(labelKey)}
              </span>
            ))}
          </div>

          <HighlightedText
            rawText={rawText}
            ranges={result.highlightedRanges}
            activeStart={sel?.startIndex}
            activeEnd={sel?.endIndex}
          />
        </div>
      </div>

      {/* ── Footer disclaimer ──────────────────────────────────────────────── */}
      <p className="text-xs text-muted-foreground leading-relaxed italic text-center max-w-2xl mx-auto">
        {tCommon('footer_disclaimer')}
      </p>

    </div>
  );
}
