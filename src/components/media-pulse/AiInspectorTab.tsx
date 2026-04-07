"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  FileText, Image as ImageIcon, Video as VideoIcon,
  Upload, Search, Fingerprint, Loader2, RefreshCw, AlertCircle, Download, FileText as FileTextIcon
} from "lucide-react";

import { ReportGenerator } from "@/lib/report-generator";

// Components
import TextResults from "@/components/analyzers/TextResults";
import ImageResults from "@/components/analyzers/ImageResults";
import VideoResults from "@/components/analyzers/VideoResults";

// Engines
import { analyzeText, TextAnalysisResult } from "@/lib/engines/textEngine";
import { analyzeImageFile, ImageAnalysisReport } from "@/lib/engines/imageEngine";
import { analyzeVideo, VideoAnalysisResult } from "@/lib/engines/videoEngine";

type Mode = "text" | "image" | "video";

export default function AiInspectorTab() {
  const t = useTranslations("AiInspector");
  const [mode, setMode] = useState<Mode>("text");
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState("");

  // Results
  const [textResults, setTextResults] = useState<TextAnalysisResult | null>(null);
  const [imageResults, setImageResults] = useState<ImageAnalysisReport | null>(null);
  const [videoResults, setVideoResults] = useState<VideoAnalysisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [isExporting, setIsExporting] = useState<'pdf' | 'excel' | null>(null);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setIsExporting(format);
    try {
      // In a real scenario, ReportGenerator.exportAiInspectorReport would process the specific results.
      // For this step, we invoke the export method with the available active result.
      const activeData = mode === 'text' ? textResults : mode === 'image' ? imageResults : videoResults;
      if (!activeData) return;

      // Fallback to browser print if specifically requesting visual layout
      if (format === 'pdf') {
        window.print();
      } else {
        alert(t("export_not_supported_excel") || "Excel export is coming soon for AI Forensics.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(null);
    }
  };

  const reset = () => {
    setTextResults(null);
    setImageResults(null);
    setVideoResults(null);
    setPreviewUrl(null);
    setLoading(false);
  };

  const handleTextAnalyze = () => {
    if (!textInput.trim()) return;

    if (textInput.trim().length < 50) {
      alert(t("text_validation_error") || "Please provide at least 50 characters for an accurate forensic analysis.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const results = analyzeText(textInput);
      setTextResults(results);
      setLoading(false);
    }, 1500); // UI feel
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Data validation: Max file size 50MB
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(t("file_validation_error") || "File exceeds 50MB maximum size limit.");
      return;
    }

    setLoading(true);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    try {
      if (mode === "image") {
        const rich = await analyzeImageFile(file);
        // Bridge rich result into the legacy report shape ImageResults understands
        const res: ImageAnalysisReport = {
          overallRisk: rich.overallScore >= 75 ? "high" : rich.overallScore >= 52 ? "medium" : "low",
          confidenceScore: rich.overallScore,
          pixelLogicSignals: rich.signals.map((s) => ({
            id: s.name.replace(/\s+/g, "_").toLowerCase().slice(0, 32),
            label: s.name,
            description: s.description,
            detectedValue: s.category,
            threshold: "-",
            risk: s.detected ? (s.weight >= 18 ? "flag" : "concern") : "none",
          })),
          richResult: rich,
        };
        setImageResults(res);
      } else if (mode === "video") {
        const res = await analyzeVideo(file);
        setVideoResults(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">

      {/* Header Info Banner */}
      <section className="glass-card p-8 rounded-[2.5rem] bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity pointer-events-none group-hover:scale-110 duration-700">
          <Fingerprint className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shadow-inner">
                <Fingerprint className="w-5 h-5 text-blue-500 animate-pulse" />
              </div>
              <h2 className="text-2xl font-black text-foreground tracking-tight uppercase italic">{t("title")}</h2>
            </div>
            <p className="text-muted-foreground font-medium text-sm leading-relaxed">
              {t("subtitle")}
            </p>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-blue-500/60 dark:text-blue-400/60">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/5 rounded-lg border border-blue-500/10 transition-colors">
                <ShieldCheck className="w-3 h-3" />
                {t("browser_only")}
              </div>
              <span>{t("zero_api_notice") || "100% Client-Side Processing"}</span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1.5 bg-muted/30 backdrop-blur-md rounded-2xl border border-border/50 shadow-inner h-fit">
            {[
              { id: "text", icon: FileText, label: t("modes.text") },
              { id: "image", icon: ImageIcon, label: t("modes.image") },
              { id: "video", icon: VideoIcon, label: t("modes.video") },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => { setMode(item.id as Mode); reset(); }}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${mode === item.id
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Interface */}
      <main className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {!textResults && !imageResults && !videoResults ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto"
            >
              {mode === "text" ? (
                <div className="space-y-6">
                  <div className="relative group">
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder={t("text.placeholder")}
                      className="w-full h-80 bg-card border border-border rounded-[2.5rem] p-10 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all resize-none text-lg font-medium leading-relaxed shadow-sm transition-all"
                    />
                    <div className="absolute bottom-10 right-10">
                      <button
                        onClick={handleTextAnalyze}
                        disabled={loading || !textInput.trim()}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                        {t("text.cta")}
                      </button>
                    </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-4">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 dark:text-blue-200/60 font-medium leading-relaxed">
                      {t("privacy_notice") || "ALMSTKSHF uses on-device linguistic analysis. Your text never leaves your browser, ensuring total confidentiality and compliance with secure data handling standards."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <label className="block w-full cursor-pointer">
                    <div className="border-4 border-dashed border-border/50 bg-card/60 backdrop-blur-sm rounded-[3rem] p-24 flex flex-col items-center gap-6 hover:bg-card hover:border-primary/30 transition-all group shadow-xl">
                      <div className="w-24 h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:scale-110 group-hover:bg-primary/10 group-hover:border-primary/30 transition-all shadow-inner">
                        <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-2xl font-black tracking-tight text-foreground">{t("upload.title")}</p>
                        <p className="text-muted-foreground font-medium text-sm tracking-wide">{t(`upload.${mode}_desc`)}</p>
                      </div>
                      <div className="mt-4 px-8 py-3 bg-muted rounded-full text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary/50 transition-all">
                        {t("select_file") || "Browse Local Storage"}
                      </div>
                      <input
                        type="file"
                        accept={mode === "image" ? "image/*" : "video/*"}
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={loading}
                      />
                    </div>
                  </label>
                  {loading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-md rounded-[3rem] flex flex-col items-center justify-center gap-6 z-50">
                      <Loader2 className="w-16 h-16 text-primary animate-spin" />
                      <div className="text-center space-y-1">
                        <p className="font-black tracking-[0.3em] text-sm uppercase text-primary animate-pulse">{t("analyzing")}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60 tracking-wider">
                          {mode === "video" ? t("video_processing_wasm") || "Running FFmpeg on WASM Core..." : t("processing_local") || "Computing Visual Signals..."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-10"
            >
              {/* Results Control Bar */}
              <div className="flex items-center justify-between glass-card px-8 py-4 rounded-3xl border border-border/50">
                <h2 className="text-xl font-black flex items-center gap-4 text-foreground tracking-tight">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  {t("results_summary")}
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={!!isExporting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-[11px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 transition-all shadow-sm disabled:opacity-50"
                  >
                    {isExporting === 'pdf' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    {t("export_pdf") || "Export PDF"}
                  </button>
                  <button
                    onClick={reset}
                    className="flex items-center gap-2 px-5 py-2.5 bg-muted hover:bg-border rounded-xl text-[11px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4 transition-transform group-hover:rotate-180" />
                    {t("start_over")}
                  </button>
                </div>
              </div>

              {textResults && <TextResults result={textResults} rawText={textInput} />}

              {imageResults && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  <div className="lg:col-span-4 lg:sticky lg:top-8">
                    <div className="space-y-6">
                      <div className="aspect-square rounded-[2.5rem] overflow-hidden border border-border shadow-2xl bg-card">
                        <img src={previewUrl!} className="w-full h-full object-cover" alt="Source" />
                      </div>
                      <div className="p-8 rounded-[2rem] bg-card border border-border shadow-sm">
                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-3 opacity-60 italic">{t("file_info")}</p>
                        <p className="text-sm font-bold truncate text-foreground/80">{previewUrl?.split('/').pop()}</p>
                        <div className="mt-6 pt-6 border-t border-border flex items-center gap-3">
                          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Analysis Valid</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="lg:col-span-8">
                    <ImageResults report={imageResults} originalImage={previewUrl!} />
                  </div>
                </div>
              )}

              {videoResults && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="aspect-video rounded-[2.5rem] overflow-hidden border border-border bg-black relative group shadow-2xl">
                      <video src={previewUrl!} controls className="w-full h-full object-contain" />
                    </div>
                    <div className="flex flex-col justify-center space-y-6 lg:pl-10">
                      <div className="space-y-3">
                        <div className="inline-block px-4 py-1 bg-primary/10 rounded-full border border-primary/20 text-[10px] font-black text-primary tracking-widest uppercase">
                          Forensic Extraction
                        </div>
                        <h3 className="text-4xl font-black tracking-tighter text-foreground">{t("video.analysis_report")}</h3>
                        <p className="text-muted-foreground font-medium leading-relaxed">{t("video.report_desc")}</p>
                      </div>
                    </div>
                  </div>
                  <VideoResults result={videoResults} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer Info Section */}
      <footer className="glass-card p-10 rounded-[2.5rem] border border-border/50 text-center space-y-4">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-px bg-border flex-1 max-w-[100px]" />
          <ShieldCheck className="w-6 h-6 text-emerald-500/50" />
          <div className="h-px bg-border flex-1 max-w-[100px]" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60">{t("verification_protocol") || "Verified ALMSTKSHF Local Forensic Protocol v1.4"}</p>
        <p className="text-sm font-medium text-muted-foreground/70 max-w-2xl mx-auto leading-relaxed">{t("footer_disclaimer")}</p>
      </footer>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
