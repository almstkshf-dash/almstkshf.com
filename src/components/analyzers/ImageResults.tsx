"use client";

/**
 * Image Forensics Result Component — expanded view
 *
 * Surfaces all 10 pixel-logic signals (grouped by category), the verification
 * checklist, raw pixel stats, and the forensic scan overlay.
 * Works with both the legacy ImageAnalysisReport (via richResult) and the
 * new ImageAnalysisResult returned by analyzeImageFile().
 */

import { ImageAnalysisReport, ImageAnalysisResult, ImageSignal } from "@/lib/engines/imageEngine";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Eye, ShieldCheck, AlertCircle, Fingerprint, Activity,
  BarChart3, Scan, Layers, Lightbulb, Cpu, Info, CheckCircle2, XCircle,
} from "lucide-react";

// ─── Props accept either report shape ────────────────────────────────────────

interface ImageResultsProps {
  report: ImageAnalysisReport;
  originalImage: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORY_META: Record<
  ImageSignal["category"],
  { label: string; icon: React.ElementType; color: string }
> = {
  texture: { label: "Texture", icon: Layers, color: "violet" },
  structure: { label: "Structure", icon: Cpu, color: "blue" },
  lighting: { label: "Lighting", icon: Lightbulb, color: "amber" },
  artifact: { label: "Artifact", icon: AlertCircle, color: "rose" },
  metadata: { label: "Metadata", icon: Info, color: "slate" },
};

const SIGNAL_COLORS = {
  detected: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
  clean: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
};

function riskMeta(overallRisk: "low" | "medium" | "high") {
  if (overallRisk === "high") return { text: "text-rose-500", bg: "bg-rose-500/5 border-rose-500/10", label: "HIGH RISK" };
  if (overallRisk === "medium") return { text: "text-amber-500", bg: "bg-amber-500/5 border-amber-500/10", label: "POSSIBLE AI" };
  return { text: "text-emerald-500", bg: "bg-emerald-500/5 border-emerald-500/10", label: "LIKELY REAL" };
}

function SignalIcon({ risk }: { risk: string }) {
  if (risk === "none") return <ShieldCheck className="w-4 h-4 text-emerald-500" />;
  if (risk === "concern") return <Activity className="w-4 h-4 text-amber-500" />;
  if (risk === "flag") return <AlertCircle className="w-4 h-4 text-rose-500" />;
  return <Scan className="w-4 h-4 text-zinc-500" />;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageResults({ report, originalImage }: ImageResultsProps) {
  const t = useTranslations("AiInspector.image");
  const tCommon = useTranslations("AiInspector");

  // Prefer rich result when available (analyzeImage / analyzeImageCanvas attach it)
  const rich: ImageAnalysisResult | undefined = report.richResult;

  const { text: riskText, bg: riskBg, label: riskLabel } = riskMeta(report.overallRisk);

  // Map signals by category for grouped rendering
  const byCategory = rich
    ? (Object.keys(CATEGORY_META) as ImageSignal["category"][]).map((cat) => ({
      cat,
      signals: rich.signals.filter((s) => s.category === cat),
    }))
    : [];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">

      {/* ── Top row: Score + (if rich) verdict ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Score card */}
        <div className={`lg:col-span-1 p-8 ${riskBg} rounded-3xl border flex flex-col items-center justify-center text-center relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Fingerprint className="w-24 h-24" />
          </div>
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">
            {t("ai_probability")}
          </h3>

          {rich ? (
            <>
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: "spring" }}
                className={`text-8xl font-black tracking-tighter ${riskText}`}
              >
                {rich.overallScore}%
              </motion.div>
              <p className={`mt-4 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${riskBg} ${riskText}`}>
                {rich.verdict}
              </p>

              {/* Mini checklist summary */}
              <div className="mt-6 w-full space-y-1.5">
                {rich.checklist.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-left">
                    {item.passed
                      ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      : <XCircle className="w-3.5 h-3.5 text-rose-500    shrink-0" />}
                    <span className="text-[10px] text-zinc-500 truncate">{item.label}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={`text-8xl font-black tracking-tighter ${riskText}`}
              >
                {report.confidenceScore}%
              </motion.div>
              <p className={`mt-4 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${riskBg} ${riskText}`}>
                {riskLabel}
              </p>
            </>
          )}
        </div>

        {/* Signals panel */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {t("pixel_signals")}
          </h3>

          {rich ? (
            /* ── Rich grouped signals ──────────────────────────────────── */
            <div className="space-y-4">
              {byCategory.map(({ cat, signals }) => {
                const meta = CATEGORY_META[cat];
                const Icon = meta.icon as React.ComponentType<{ className?: string }>;
                const anyDetected = signals.some((s) => s.detected);
                return (
                  <motion.div
                    key={cat}
                    whileHover={{ y: -2 }}
                    className={`p-5 rounded-2xl border bg-white dark:bg-zinc-950 shadow-sm shadow-zinc-200/50 dark:shadow-none ${anyDetected ? "border-rose-500/20" : "border-zinc-200 dark:border-zinc-800"}`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1.5 rounded-lg bg-${meta.color}-500/10 border border-${meta.color}-500/20`}>
                        <Icon className={`w-3.5 h-3.5 text-${meta.color}-500`} />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
                        {meta.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {signals.map((sig) => (
                        <div
                          key={sig.name}
                          className={`flex items-start gap-2 p-3 rounded-xl border text-[11px] ${sig.detected ? SIGNAL_COLORS.detected : SIGNAL_COLORS.clean}`}
                        >
                          {sig.detected
                            ? <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            : <ShieldCheck className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                          <div>
                            <p className="font-bold leading-tight">{sig.name}</p>
                            <p className="opacity-60 mt-0.5 leading-snug">{sig.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* ── Legacy flat signal list ───────────────────────────────── */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.pixelLogicSignals.map((signal) => (
                <motion.div
                  key={signal.id}
                  whileHover={{ y: -2 }}
                  className="p-5 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm shadow-zinc-200/50 dark:shadow-none"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900">
                      <SignalIcon risk={signal.risk} />
                    </div>
                    <span className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-full ${signal.risk === "none" ? "bg-emerald-500/10 text-emerald-600" : signal.risk === "concern" ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600"}`}>
                      VAL: {signal.detectedValue}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{signal.label}</h4>
                  <p className="text-xs text-zinc-500 mt-1 leading-snug">{signal.description}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Pixel Stats Bar (only when rich data available) ─────────────── */}
      {rich && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "Noise", value: rich.stats.noiseLevel.toFixed(1), unit: "" },
            { label: "Edge Detail", value: rich.stats.edgeSharpness.toFixed(1), unit: "" },
            { label: "Symmetry", value: (rich.stats.symmetryScore * 100).toFixed(0), unit: "%" },
            { label: "Skin Smooth", value: (rich.stats.skinSmoothness * 100).toFixed(0), unit: "%" },
            { label: "BG Blur", value: (rich.stats.backgroundBlur * 100).toFixed(0), unit: "%" },
            { label: "Sat. Var.", value: rich.stats.saturationVariance.toFixed(3), unit: "" },
            { label: "Megapix", value: rich.stats.megapixels.toFixed(2), unit: "MP" },
          ].map(({ label, value, unit }) => (
            <div key={label} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
              <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">{label}</span>
              <span className="block font-mono text-lg font-bold text-zinc-900 dark:text-zinc-100">{value}{unit}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Forensic Visualization ───────────────────────────────────────── */}
      <div className="p-10 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden group">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Forensic Visualization View
          </h3>
          <span className="text-[10px] font-mono font-bold px-3 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 rounded-full flex items-center gap-1.5 uppercase tracking-tighter">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live Logic Overlay Active
          </span>
        </div>

        <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          {/* Scanning line */}
          <motion.div
            initial={{ top: "-100%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 w-full h-px bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-20 pointer-events-none"
          />
          <img
            src={originalImage}
            alt="Analyzed content"
            className="w-full h-full object-contain grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700"
          />

          {/* Diagnostic overlay */}
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-start gap-12 text-white/90">
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-white/40">Noise Level</span>
              <span className="block font-mono text-xl">
                {rich
                  ? rich.stats.noiseLevel.toFixed(1)
                  : report.pixelLogicSignals.find((s) => s.id === "low_noise" || s.id === "natural_grain")?.detectedValue ?? "0.00"}
              </span>
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-white/40">
                {rich ? "Verdict" : "Entropy Factor"}
              </span>
              <span className="block font-mono text-xl">
                {rich
                  ? rich.verdict
                  : report.pixelLogicSignals.find((s) => s.id === "low_entropy")?.detectedValue ?? "0.00"}
              </span>
            </div>
            {rich && (
              <div className="space-y-1">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-white/40">AI Score</span>
                <span className="block font-mono text-xl">{rich.overallScore}%</span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-8 text-xs text-zinc-400 leading-relaxed italic text-center max-w-2xl mx-auto">
          {tCommon("footer_disclaimer")}
        </p>
      </div>

    </div>
  );
}
