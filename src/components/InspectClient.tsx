/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';

// Types from Engines
import type { TextAnalysisResult } from '@/lib/engines/textEngine';
import type { ImageAnalysisReport } from '@/lib/engines/imageEngine';
import type { VideoAnalysisResult } from '@/lib/engines/videoEngine';

// Subcomponents
import { InspectorHeader } from './inspect/InspectorHeader';
import { ModeSelector } from './inspect/ModeSelector';
import { UploadPanel } from './inspect/UploadPanel';
import { ResultsPanel } from './inspect/ResultsPanel';
import { InspectorFooter } from './inspect/InspectorFooter';

type DetectionMode = 'text' | 'image' | 'video';

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB

export default function InspectClient() {
  const t = useTranslations('AiInspector');
  const [mode, setMode] = useState<DetectionMode>('text');

  // State for content
  const [inputText, setInputText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // State for analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [textResult, setTextResult] = useState<TextAnalysisResult | null>(null);
  const [imageResult, setImageResult] = useState<ImageAnalysisReport | null>(null);
  const [videoResult, setVideoResult] = useState<VideoAnalysisResult | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Race condition tracker
  const analysisId = useRef(0);

  // Revoke object URL on cleanup
  useEffect(() => {
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);

  // Switch mode cleaning
  useEffect(() => {
    setUploadedFile(null);
    setFilePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setTextResult(null);
    setImageResult(null);
    setVideoResult(null);
    setIsAnalyzing(false);
    setProgress(0);
    setError(null);
    analysisId.current++; // Invalidate running analysis
  }, [mode]);

  const resetAnalysis = () => {
    analysisId.current++; // Invalidate running analysis
    setTextResult(null);
    setImageResult(null);
    setVideoResult(null);
    setIsAnalyzing(false);
    setProgress(0);
    setError(null);
  };

  const handleStartOver = () => {
    setUploadedFile(null);
    setFilePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    resetAnalysis();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const maxSize = mode === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      setError(t(mode === 'image' ? 'image_too_large' : 'video_too_large'));
      return;
    }

    setFilePreview((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return URL.createObjectURL(file);
    });
    setUploadedFile(file);
    resetAnalysis();
  };

  const runAnalysis = async () => {
    setError(null);
    
    // Explicit Validation Check
    if (mode === 'text' && !inputText.trim()) {
      return;
    }
    if (mode !== 'text' && !uploadedFile) {
      return;
    }

    setIsAnalyzing(true);
    setProgress(10);

    const id = ++analysisId.current;

    try {
      if (mode === 'text') {
        const { analyzeText } = await import('@/lib/engines/textEngine');
        const result = analyzeText(inputText);
        if (id !== analysisId.current) return;
        setTextResult(result);
      }
      else if (mode === 'image' && (uploadedFile || filePreview)) {
        const { analyzeImageFile, finalizeReport } = await import('@/lib/engines/imageEngine');
        if (uploadedFile) {
          const result = await analyzeImageFile(uploadedFile);
          const report = finalizeReport(result);
          if (id !== analysisId.current) return;
          setImageResult(report);
        } else {
          const img = new Image();
          img.src = filePreview!;
          await new Promise((resolve, reject) => {
            img.onload = async () => {
              try {
                if (canvasRef.current) {
                  const canvas = canvasRef.current;
                  canvas.width = img.width;
                  canvas.height = img.height;
                  const ctx = canvas.getContext('2d');
                  ctx?.drawImage(img, 0, 0);
                  const { analyzeImageCanvasDeep } = await import('@/lib/engines/imageEngine');
                  const result = await analyzeImageCanvasDeep(canvas);
                  if (id !== analysisId.current) {
                    resolve(false);
                    return;
                  }
                  setImageResult(result);
                  resolve(true);
                } else {
                  resolve(false);
                }
              } catch (e) {
                reject(e);
              }
            };
            img.onerror = reject;
          });
        }
      }
      else if (mode === 'video' && filePreview) {
        if (videoRef.current) {
          const { analyzeVideoElement } = await import('@/lib/engines/videoEngine');
          const result = await analyzeVideoElement(videoRef.current, (p) => {
            if (id === analysisId.current) {
              setProgress(p);
            }
          });
          if (id !== analysisId.current) return;
          setVideoResult(result);
        }
      }
    } catch (err) {
      if (id === analysisId.current) {
        console.error('Forensic analysis failed:', err);
      }
    } finally {
      if (id === analysisId.current) {
        setIsAnalyzing(false);
      }
    }
  };

  const hasResult = !!(textResult || imageResult || videoResult);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 md:p-8 lg:p-12 relative overflow-hidden">
      {/* Dynamic Background Noise/Artifacts */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.07]">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      </div>

      <div className="max-w-6xl mx-auto relative z-10 pt-12">
        <InspectorHeader />

        <ModeSelector mode={mode} setMode={setMode} />

        {/* Action Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20 whitespace-pre-wrap">
          <div className="lg:col-span-12">
            {!hasResult ? (
              <UploadPanel
                mode={mode}
                inputText={inputText}
                setInputText={setInputText}
                uploadedFile={uploadedFile}
                handleFileUpload={handleFileUpload}
                handleStartOver={handleStartOver}
                isAnalyzing={isAnalyzing}
                runAnalysis={runAnalysis}
                progress={progress}
                error={error}
              />
            ) : (
              <ResultsPanel
                mode={mode}
                textResult={textResult}
                imageResult={imageResult}
                videoResult={videoResult}
                inputText={inputText}
                filePreview={filePreview}
                uploadedFileName={uploadedFile?.name}
                resetAnalysis={resetAnalysis}
              />
            )}
          </div>
        </div>

        <InspectorFooter />
      </div>

      {/* Hidden processing elements */}
      <div className="sr-only">
        {mode === 'video' && filePreview && (
          <video
            ref={videoRef}
            src={filePreview}
            muted
            className="absolute w-px h-px opacity-0 pointer-events-none"
            crossOrigin="anonymous"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
