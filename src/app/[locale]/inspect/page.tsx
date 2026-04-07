'use client';

/**
 * AI Inspector Main Page
 * 
 * 100% Client-side privacy-first AI forensic suite.
 * Detects synthetic text, images, and video without API calls.
 */

import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, 
  Type, 
  Image as ImageIcon, 
  Film, 
  Upload, 
  Fingerprint, 
  Trash2, 
  ChevronRight,
  Download,
  Info,
  Layers,
  Activity,
  Scan,
  RefreshCw,
  Search
} from 'lucide-react';

// Engines & Components
import { analyzeText, TextAnalysisResult } from '@/lib/engines/textEngine';
import { analyzeImageCanvas, ImageAnalysisReport } from '@/lib/engines/imageEngine';
import { analyzeVideoElement, VideoAnalysisResult } from '@/lib/engines/videoEngine';
import TextResults from '@/components/analyzers/TextResults';
import ImageResults from '@/components/analyzers/ImageResults';
import VideoResults from '@/components/analyzers/VideoResults';

type DetectionMode = 'text' | 'image' | 'video';

export default function AIInspectorPage() {
  const t = useTranslations('AiInspector');
  const [mode, setMode] = useState<DetectionMode>('text');
  
  // State for content
  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // State for analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [textResult, setTextResult] = useState<TextAnalysisResult | null>(null);
  const [imageResult, setImageResult] = useState<ImageAnalysisReport | null>(null);
  const [videoResult, setVideoResult] = useState<VideoAnalysisResult | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Switch mode cleaning
  useEffect(() => {
    resetAnalysis();
  }, [mode]);

  const resetAnalysis = () => {
    setTextResult(null);
    setImageResult(null);
    setVideoResult(null);
    setIsAnalyzing(false);
    setProgress(0);
    // don't clear file yet as user might be switching tabs to see what happens
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (prev) => setFilePreview(prev.target?.result as string);
    reader.readAsDataURL(file);
    resetAnalysis();
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(10);

    try {
      if (mode === 'text' && inputText) {
        const result = analyzeText(inputText);
        setTextResult(result);
      } 
      else if (mode === 'image' && filePreview) {
        const img = new Image();
        img.src = filePreview;
        await new Promise((resolve) => {
          img.onload = () => {
            if (canvasRef.current) {
              const canvas = canvasRef.current;
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0);
              const result = analyzeImageCanvas(canvas);
              setImageResult(result);
              resolve(true);
            }
          };
        });
      }
      else if (mode === 'video' && filePreview) {
        if (videoRef.current) {
          const result = await analyzeVideoElement(videoRef.current, (p) => setProgress(p));
          setVideoResult(result);
        }
      }
    } catch (err) {
      console.error('Forensic analysis failed:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 md:p-8 lg:p-12 relative overflow-hidden">
      
      {/* Dynamic Background Noise/Artifacts */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07]">
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 pt-12">
        
        {/* Header Section */}
        <header className="mb-12 space-y-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex items-center gap-2 px-3 py-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg w-fit text-[10px] font-black uppercase tracking-widest"
           >
             <ShieldAlert className="w-3 h-3" />
             Forensic Privacy Safe
           </motion.div>
           <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter uppercase leading-[0.9]">
             {t('title')}
           </h1>
           <p className="text-zinc-500 max-w-xl text-sm md:text-base font-medium leading-relaxed">
             {t('subtitle')}
           </p>
        </header>

        {/* Mode Selector */}
        <div className="flex flex-wrap gap-2 mb-12 bg-zinc-200/50 dark:bg-zinc-900/50 p-1.5 rounded-2xl w-fit border border-zinc-200 dark:border-zinc-800 backdrop-blur-xl">
          {[
            { id: 'text', icon: Type, label: t('modes.text') },
            { id: 'image', icon: ImageIcon, label: t('modes.image') },
            { id: 'video', icon: Film, label: t('modes.video') }
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id as DetectionMode)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 ${mode === m.id ? 'bg-white dark:bg-zinc-100 text-zinc-900 shadow-xl shadow-zinc-200 dark:shadow-none' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              <m.icon className="w-4 h-4" />
              {m.label}
            </button>
          ))}
        </div>

        {/* Action Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 whitespace-pre-wrap">
          
          <div className="lg:col-span-12">
            {!textResult && !imageResult && !videoResult ? (
              <motion.div 
                layout
                className="bg-white dark:bg-zinc-950 p-1 rounded-[40px] border border-zinc-200 dark:border-zinc-800 shadow-2xl shadow-zinc-200/50 dark:shadow-none overflow-hidden"
              >
                <div className="p-8 md:p-12">
                  <AnimatePresence mode="wait">
                    {mode === 'text' ? (
                      <motion.div key="text-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <textarea
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder={t('text.placeholder')}
                          className="w-full h-80 bg-transparent border-none focus:ring-0 text-2xl md:text-3xl font-medium placeholder:text-zinc-300 dark:placeholder:text-zinc-800 text-zinc-800 dark:text-zinc-200 resize-none font-sans"
                        />
                      </motion.div>
                    ) : (
                      <motion.div key="file-input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="relative group/upload h-[400px] flex flex-col items-center justify-center border-4 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[32px] hover:border-zinc-200 dark:hover:border-zinc-800 transition-all cursor-pointer">
                          <input 
                            type="file" 
                            accept={mode === 'image' ? "image/*" : "video/*"}
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          />
                          {uploadedFile ? (
                            <div className="flex flex-col items-center">
                              <div className="p-6 rounded-3xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 mb-6 shadow-2xl">
                                {mode === 'image' ? <ImageIcon className="w-12 h-12" /> : <Film className="w-12 h-12" />}
                              </div>
                              <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 truncate max-w-xs">{uploadedFile.name}</h4>
                              <p className="text-zinc-500 font-mono text-xs uppercase mt-2">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                              <button onClick={() => setUploadedFile(null)} className="mt-8 text-rose-500 hover:text-rose-600 font-bold uppercase tracking-widest text-xs flex items-center gap-1.5 z-20 relative">
                                <Trash2 className="w-4 h-4" />
                                {t('start_over')}
                              </button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center text-center px-6">
                              <div className="p-8 rounded-full bg-zinc-50 dark:bg-zinc-900 mb-8 group-hover/upload:scale-110 transition-transform">
                                <Upload className="w-16 h-16 text-zinc-400 dark:text-zinc-700" />
                              </div>
                              <h4 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 mb-4">{t('upload.title')}</h4>
                              <p className="text-sm text-zinc-500 max-w-xs font-medium leading-relaxed">
                                {t(mode === 'image' ? 'upload.image_desc' : 'upload.video_desc')}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-6 ml-6">
                     <div className="hidden md:flex items-center gap-2 text-zinc-400">
                        <Layers className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Multi-Engine Forensic Mode</span>
                     </div>
                  </div>
                  
                  <button
                    disabled={isAnalyzing || (mode === 'text' ? !inputText : !uploadedFile)}
                    onClick={runAnalysis}
                    className="group relative overflow-hidden flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-3xl text-sm font-black uppercase tracking-widest disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-zinc-900/20 dark:shadow-white/20"
                  >
                    <AnimatePresence mode="wait">
                      {isAnalyzing ? (
                        <motion.div key="analyzing" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          {t('analyzing')}
                        </motion.div>
                      ) : (
                        <motion.div key="cta" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3">
                          {t(mode === 'text' ? 'text.cta' : 'analyzing')}
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900">
                       <Scan className="w-6 h-6" />
                     </div>
                     <div>
                       <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tighter">{t('results_summary')}</h2>
                       <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{uploadedFile?.name || 'Local Buffer'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                     <button onClick={resetAnalysis} className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-zinc-500">
                       <RefreshCw className="w-5 h-5" />
                     </button>
                     <button className="flex items-center gap-2 px-6 py-3 bg-zinc-200 dark:bg-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
                       <Download className="w-4 h-4" />
                       {t('export_pdf')}
                     </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {mode === 'text' && textResult && (
                    <TextResults result={textResult} rawText={inputText} />
                  )}
                  {mode === 'image' && imageResult && filePreview && (
                    <ImageResults report={imageResult} originalImage={filePreview} />
                  )}
                  {mode === 'video' && videoResult && (
                    <VideoResults result={videoResult} />
                  )}
                </AnimatePresence>
                
                <div className="h-40" /> {/* Extra padding for footer etc */}
              </div>
            )}
          </div>
        </div>

        {/* Footer Forensic Info */}
        <footer className="border-t border-zinc-200 dark:border-zinc-800 pt-12 pb-24 grid grid-cols-1 md:grid-cols-3 gap-12">
           <div className="space-y-2">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="w-3 h-3" />
                Zero-API Policy
              </span>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">{t('browser_only')}</p>
           </div>
           <div className="space-y-2">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Info className="w-3 h-3" />
                Methodology
              </span>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">{t('footer_disclaimer')}</p>
           </div>
           <div className="flex items-start justify-end">
              <img src="/logo.png" alt="ALMSTKSHF" className="h-8 grayscale opacity-20" />
           </div>
        </footer>
      </div>

      {/* Hidden processing elements */}
      <div className="sr-only">
        {mode === 'video' && filePreview && (
           <video ref={videoRef} src={filePreview} muted className="hidden" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

    </div>
  );
}
