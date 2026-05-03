/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { analyzeOCR, detectBiometricAnomalies, detectWatermarks, ForensicAnomaly } from './mlHelper';

export interface ImageSignal {
  id: string;
  name: string;
  detected: boolean;
  weight: number;
  description: string;
  labelKey: string;   // i18n key
  descKey: string;    // i18n key
  category: "texture" | "structure" | "lighting" | "artifact" | "metadata";
}

export interface ChecklistItem {
  id: string;
  label: string;
  labelKey: string;  // i18n key
  passed: boolean;
  note: string;
  val?: string | number;
}

export interface PixelStats {
  noiseLevel: number;
  edgeSharpness: number;
  colorUniformity: number;
  symmetryScore: number;
  saturationVariance: number;
  skinSmoothness: number;       // 0-1, high = suspiciously smooth
  backgroundBlur: number;       // 0-1, high = bg much blurrier than centre (AI bokeh)
  centerEdgeDelta: number;      // sharpness delta centre vs edges
  localContrastVariance: number;// low = uniform lighting = AI-like
  aspectRatio: number;
  megapixels: number;
}

export interface ImageAnalysisResult {
  overallScore: number;
  verdict: string;
  verdictKey: string;
  signals: ImageSignal[];
  checklist: ChecklistItem[];
  stats: PixelStats;
  deepMl?: {
    ocr: { text: string; isGarbled: boolean; confidence: number };
    biometrics: { faceAnomalies: ForensicAnomaly[]; handAnomalies: ForensicAnomaly[] };
    watermarks: ForensicAnomaly[];
  };
}

// â”€â”€â”€ Legacy interface (kept for backward compat) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ImageAnalysisReport {
  overallRisk: "low" | "medium" | "high";
  confidenceScore: number;
  pixelLogicSignals: Array<{
    id: string;
    label: string;
    description: string;
    detectedValue: number | string;
    threshold: number | string;
    risk: "none" | "concern" | "flag";
  }>;
  /** Rich result attached for consumers that want to upgrade */
  richResult?: ImageAnalysisResult;
}

// â”€â”€â”€ Main entry (new API) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function analyzeImageFile(file: File): Promise<ImageAnalysisResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const MAX = 640;
        const scale = Math.min(MAX / img.width, MAX / img.height, 1);
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);

        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // â”€â”€ Standard pixel heuristics â”€â”€
        const stats = computePixelStats(imageData, canvas.width, canvas.height, img.width, img.height);
        
        // â”€â”€ Deep ML Analysis (Async) â”€â”€
        (async () => {
          try {
            const ocrResult = await analyzeOCR(canvas);
            const biometricResult = await detectBiometricAnomalies(canvas);
            const watermarkResult = detectWatermarks(ctx, canvas.width, canvas.height);

            const result = buildImageResult(stats, file, {
              ocr: ocrResult,
              biometrics: biometricResult,
              watermarks: watermarkResult
            });

            URL.revokeObjectURL(url);
            resolve(result);
          } catch {
            // Fallback to basic results if ML fails
            const result = buildImageResult(stats, file);
            URL.revokeObjectURL(url);
            resolve(result);
          }
        })();
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image load failed"));
    };
    img.src = url;
  });
}

// â”€â”€â”€ Legacy entry points (backward compat) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const analyzeImage = async (img: HTMLImageElement): Promise<ImageAnalysisReport> => {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(img, 0, 0);
  return analyzeImageCanvasDeep(canvas); // Upgrade to deep analysis
};

export const analyzeImageCanvasDeep = async (canvas: HTMLCanvasElement): Promise<ImageAnalysisReport> => {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context unavailable");

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);

  const stats = computePixelStats(imageData, width, height, width, height);
  
  const ocrResult = await analyzeOCR(canvas);
  const biometricResult = await detectBiometricAnomalies(canvas);
  const watermarkResult = detectWatermarks(ctx, width, height);

  const richResult = buildImageResult(stats, new File([], "canvas.png"), {
    ocr: ocrResult,
    biometrics: biometricResult,
    watermarks: watermarkResult
  });

  return finalizeReport(richResult);
};

// Helper to consolidate scoring logic
export function finalizeReport(richResult: ImageAnalysisResult): ImageAnalysisReport {
  const riskScore = richResult.overallScore;
  const signals: ImageAnalysisReport["pixelLogicSignals"] = [];

  for (const sig of richResult.signals) {
    if (sig.detected) {
      signals.push({
        id: sig.id,
        label: sig.name,
        description: sig.description,
        detectedValue: "detected",
        threshold: "-",
        risk: sig.weight >= 20 ? "flag" : "concern",
      });
    }
  }

  const overallRisk: "low" | "medium" | "high" =
    riskScore > 60 ? "high" : riskScore > 30 ? "medium" : "low";

  return {
    overallRisk,
    confidenceScore: Math.min(riskScore + 10, 95),
    pixelLogicSignals: signals,
    richResult,
  };
}

export const analyzeImageCanvas = (canvas: HTMLCanvasElement): ImageAnalysisReport => {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context unavailable");

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);

  // Now compute full rich stats for the legacy report too
  const dummyFile = new File([], "canvas.png", { type: "image/png" });
  const stats = computePixelStats(imageData, width, height, width, height);
  const richResult = buildImageResult(stats, dummyFile);

  return finalizeReport(richResult);
};

// â”€â”€â”€ Pixel computation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function computePixelStats(
  data: ImageData,
  w: number,
  h: number,
  origW: number,
  origH: number
): PixelStats {
  const px = data.data;
  const total = w * h;

  const grays: number[] = new Array(total);
  const sats: number[] = new Array(total);
  let sumBright = 0;

  for (let i = 0; i < total; i++) {
    const pi = i * 4;
    const r = px[pi], g = px[pi + 1], b = px[pi + 2];
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    grays[i] = gray;
    sumBright += gray;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    sats[i] = max === 0 ? 0 : (max - min) / max;
  }

  const meanGray = sumBright / total;

  // Noise = std dev of gray
  const grayVariance = grays.reduce((a, v) => a + Math.pow(v - meanGray, 2), 0) / total;
  const noiseLevel = Math.sqrt(grayVariance);

  // Edge sharpness (Sobel approximation)
  let edgeSum = 0, edgeCount = 0;
  const step = 4;
  for (let y = 1; y < h - 1; y += step) {
    for (let x = 1; x < w - 1; x += step) {
      const idx = y * w + x;
      const gx = grays[idx + 1] - grays[idx - 1];
      const gy = grays[idx + w] - grays[idx - w];
      edgeSum += Math.sqrt(gx * gx + gy * gy);
      edgeCount++;
    }
  }
  const edgeSharpness = edgeCount > 0 ? edgeSum / edgeCount : 0;

  // Color uniformity (red channel std-dev proxy)
  const rVals = Array.from({ length: Math.min(1500, total) }, (_, i) => px[i * 4]);
  const rStd = stdDev(rVals);
  const colorUniformity = Math.max(0, 1 - rStd / 128);

  // Saturation variance
  const satVariance = stdDev(sats.slice(0, Math.min(2000, total)));

  // Symmetry: left vs right half brightness
  const half = Math.floor(w / 2);
  let leftSum = 0, rightSum = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < half; x++) {
      leftSum += grays[y * w + x] || 0;
      rightSum += grays[y * w + (w - 1 - x)] || 0;
    }
  }
  const symDiff = Math.abs(leftSum - rightSum) / (half * h * 255);
  const symmetryScore = Math.max(0, 1 - symDiff * 10);

  // Skin smoothness: centre region, skin-tone heuristic
  const cx = Math.floor(w / 4), cy = Math.floor(h / 4);
  const cw = Math.floor(w / 2), ch = Math.floor(h / 2);
  const skinGrays: number[] = [];
  for (let y = cy; y < cy + ch; y += 3) {
    for (let x = cx; x < cx + cw; x += 3) {
      const pi = (y * w + x) * 4;
      const r = px[pi], g = px[pi + 1], b = px[pi + 2];
      if (r > 130 && g > 90 && b > 70 && r > g && g > b && r - b < 120) {
        skinGrays.push(grays[y * w + x]);
      }
    }
  }
  const skinSmoothness =
    skinGrays.length > 20 ? Math.max(0, 1 - stdDev(skinGrays) / 30) : 0.5;

  // Background blur (centre vs border edge sharpness)
  let centerEdge = 0, borderEdge = 0, centerCount = 0, borderCount = 0;
  const margin = Math.floor(Math.min(w, h) * 0.2);
  for (let y = 1; y < h - 1; y += step) {
    for (let x = 1; x < w - 1; x += step) {
      const idx = y * w + x;
      const gxV = grays[idx + 1] - grays[idx - 1];
      const gyV = grays[idx + w] - grays[idx - w];
      const mag = Math.sqrt(gxV * gxV + gyV * gyV);
      if (x > margin && x < w - margin && y > margin && y < h - margin) {
        centerEdge += mag; centerCount++;
      } else {
        borderEdge += mag; borderCount++;
      }
    }
  }
  const centerAvg = centerCount > 0 ? centerEdge / centerCount : 0;
  const borderAvg = borderCount > 0 ? borderEdge / borderCount : 0;
  const centerEdgeDelta = centerAvg - borderAvg;
  const backgroundBlur =
    centerAvg > 0 ? Math.min(1, Math.max(0, centerEdgeDelta / centerAvg)) : 0;

  // Local contrast variance across 3\u00D73 zones
  const zoneW = Math.floor(w / 3), zoneH = Math.floor(h / 3);
  const zoneMeans: number[] = [];
  for (let zy = 0; zy < 3; zy++) {
    for (let zx = 0; zx < 3; zx++) {
      let zSum = 0, zCount = 0;
      for (let y = zy * zoneH; y < (zy + 1) * zoneH; y += 2) {
        for (let x = zx * zoneW; x < (zx + 1) * zoneW; x += 2) {
          zSum += grays[y * w + x] || 0;
          zCount++;
        }
      }
      zoneMeans.push(zCount > 0 ? zSum / zCount : 0);
    }
  }
  const localContrastVariance = stdDev(zoneMeans);

  return {
    noiseLevel,
    edgeSharpness,
    colorUniformity,
    symmetryScore,
    saturationVariance: satVariance,
    skinSmoothness,
    backgroundBlur,
    centerEdgeDelta,
    localContrastVariance,
    aspectRatio: origW / origH,
    megapixels: (origW * origH) / 1_000_000,
  };
}

function stdDev(arr: number[]): number {
  if (arr.length === 0) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length);
}

// â”€â”€â”€ Signal builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function buildImageResult(
  stats: PixelStats, 
  file: File,
  deepMl?: {
    ocr: { text: string; isGarbled: boolean; confidence: number };
    biometrics: { faceAnomalies: ForensicAnomaly[]; handAnomalies: ForensicAnomaly[] };
    watermarks: ForensicAnomaly[];
  }
): ImageAnalysisResult {
  const signals: ImageSignal[] = [
    {
      id: "smooth_texture",
      name: "Unnaturally smooth texture / skin",
      detected: stats.noiseLevel < 15 || stats.skinSmoothness > 0.85,
      weight: 60,
      category: "texture",
      description: "AI images lack camera sensor noise; skin in AI portraits is airbrushed-perfect.",
      labelKey: "signal_smooth_texture_name",
      descKey: "signal_smooth_texture_desc",
    },
    {
      id: "low_sat",
      name: "Low saturation variance",
      detected: stats.saturationVariance < 0.10,
      weight: 20,
      category: "texture",
      description: "Human photos have chaotic, uneven colour across regions â€” AI flattens it.",
      labelKey: "signal_low_sat_name",
      descKey: "signal_low_sat_desc",
    },
    {
      id: "symmetry",
      name: "Suspicious bilateral symmetry",
      detected: stats.symmetryScore > 0.88,
      weight: 35,
      category: "structure",
      description: "AI faces and compositions trend toward near-perfect symmetry.",
      labelKey: "signal_symmetry_name",
      descKey: "signal_symmetry_desc",
    },
    {
      id: "uniform_color",
      name: "Over-uniform color distribution",
      detected: stats.colorUniformity > 0.75,
      weight: 30,
      category: "structure",
      description: "Real photos have varied R/G/B distribution; AI flattens it uniformly.",
      labelKey: "signal_uniform_color_name",
      descKey: "signal_uniform_color_desc",
    },
    {
      id: "uniform_lighting",
      name: "Unnaturally uniform lighting",
      detected: stats.localContrastVariance < 8.5,
      weight: 50,
      category: "lighting",
      description: "Real scenes have uneven light. AI lighting is studio-perfect.",
      labelKey: "signal_uniform_lighting_name",
      descKey: "signal_uniform_lighting_desc",
    },
    {
      id: "bg_separation",
      name: "Artificial subject / background separation",
      detected: stats.backgroundBlur > 0.65 && stats.centerEdgeDelta > 20,
      weight: 25,
      category: "lighting",
      description: "AI aggressively isolates subjects with unnatural bokeh.",
      labelKey: "signal_bg_separation_name",
      descKey: "signal_bg_separation_desc",
    },
    {
      id: "blurred_edges",
      name: "Blurred / dissolving edge detail",
      detected: stats.edgeSharpness < 6.8,
      weight: 40,
      category: "artifact",
      description: "AI often smears fine detail like hair edges and fingers.",
      labelKey: "signal_blurred_edges_name",
      descKey: "signal_blurred_edges_desc",
    },
    {
      id: "ai_aspect_ratio",
      name: "Suspicious common AI aspect ratio",
      detected: [1.0, 1.5, 1.77, 0.666, 0.75].some(r => Math.abs(stats.aspectRatio - r) < 0.001),
      weight: 15,
      category: "artifact",
      description: "Defaults for MJ, DALL-E, SD often hit specific exact ratios.",
      labelKey: "signal_ai_aspect_ratio_name",
      descKey: "signal_ai_aspect_ratio_desc",
    },
    {
      id: "round_mp",
      name: "Suspiciously round megapixel count",
      detected: [1, 2, 4, 8, 16].some(mp => Math.abs(stats.megapixels - mp) < 0.02),
      weight: 15,
      category: "artifact",
      description: "AI generators output exact round megapixel counts â€” cameras don't.",
      labelKey: "signal_round_mp_name",
      descKey: "signal_round_mp_desc",
    },
    {
      id: "no_exif",
      name: "No EXIF / camera metadata",
      detected: file.size < 400_000 && stats.megapixels > 0.5,
      weight: 25,
      category: "metadata",
      description: "Real camera photos embed EXIF data.",
      labelKey: "signal_no_exif_name",
      descKey: "signal_no_exif_desc",
    },
    {
      id: "vibrant_palette",
      name: "Synthetic / Vibrant color palette",
      detected: stats.saturationVariance > 0.38 && stats.colorUniformity > 0.78,
      weight: 25,
      category: "artifact",
      description: "AI models often default to vibrant, high-contrast color mapping.",
      labelKey: "signal_vibrant_palette_name",
      descKey: "signal_vibrant_palette_desc",
    },
    {
      id: "uniform_focus",
      name: "Suspiciously uniform edge focus",
      detected: Math.abs(stats.centerEdgeDelta) < 1.0 && stats.edgeSharpness > 15,
      weight: 25,
      category: "artifact",
      description: "Real lenses have focus falloff; AI often sharpens frame-wide.",
      labelKey: "signal_uniform_focus_name",
      descKey: "signal_uniform_focus_desc",
    },
    {
      id: "biometric_anomalies",
      name: "Biometric / Anatomy anomalies",
      detected: (deepMl?.biometrics.faceAnomalies.length || 0) > 0 || (deepMl?.biometrics.handAnomalies.length || 0) > 0,
      weight: 95,
      category: "artifact",
      description: "Detected impossible anatomy or structural biological errors.",
      labelKey: "signal_biometric_anomalies_name",
      descKey: "signal_biometric_anomalies_desc",
    },
    {
      id: "garbled_text",
      name: "Garbled / Unreadable text artifacts",
      detected: deepMl?.ocr.isGarbled || false,
      weight: 85,
      category: "artifact",
      description: "Presence of nonsensical or distorted text patterns.",
      labelKey: "signal_garbled_text_name",
      descKey: "signal_garbled_text_desc",
    },
    {
      id: "ai_watermark",
      name: "Identified AI signature / Watermark",
      detected: (deepMl?.watermarks.length || 0) > 0,
      weight: 100,
      category: "artifact",
      description: "Found hardcoded pixel patterns matching AI generator signatures.",
      labelKey: "signal_ai_watermark_name",
      descKey: "signal_ai_watermark_desc",
    },
  ];

  let rawWeightsSum = 0;
  let detectedCount = 0;
  const activeIds = new Set<string>();

  signals.forEach(s => { 
    if (s.detected) {
      rawWeightsSum += s.weight;
      detectedCount++;
      activeIds.add(s.id);
    }
  });

  // \u2500\u2500\u2500 Integrated Algorithm Boosts \u2500\u2500\u2500
  // combinations that are virtually impossible in real-world photography
  let integratedMultiplier = 1.0;

  // 1. Textures & Lighting: Smooth skin + studio lighting in the same region
  if (activeIds.has("smooth_texture") && activeIds.has("uniform_lighting")) integratedMultiplier += 0.35;

  // 2. High Detail + No Noise: Sharp focus but lacks grain entirely (typical upscaled AI)
  if (activeIds.has("uniform_focus") && activeIds.has("smooth_texture")) integratedMultiplier += 0.25;

  // 3. Digital Signature: Aspect ratio + Round Megapixels + No EXIF
  if (activeIds.has("ai_aspect_ratio") && activeIds.has("round_mp") && activeIds.has("no_exif")) integratedMultiplier += 0.30;

  // 4. Structural Uniformity: Symmetry + Uniform Color
  if (activeIds.has("symmetry") && activeIds.has("uniform_color")) integratedMultiplier += 0.25;

  // 5. Artifact Multiplier: The more types of technical artifacts, the higher the integration
  if (detectedCount >= 4) integratedMultiplier += 0.2;
  if (detectedCount >= 6) integratedMultiplier += 0.4;
  
  // Biometric/Watermark triggers should be nearly definitive
  if (activeIds.has("biometric_anomalies") || activeIds.has("ai_watermark")) {
    integratedMultiplier = Math.max(integratedMultiplier, 2.0); 
  }

  const overallScore = Math.min(100, Math.round(rawWeightsSum * integratedMultiplier));

  const checklist: ChecklistItem[] = [
    { id: "noise", label: "Natural sensor noise present", labelKey: "check_noise_label", passed: stats.noiseLevel >= 16, note: `Noise: ${(stats.noiseLevel ?? 0).toFixed(1)}`, val: (stats.noiseLevel ?? 0).toFixed(1) },
    { id: "skin", label: "Skin texture has imperfection", labelKey: "check_skin_label", passed: stats.skinSmoothness <= 0.82, note: `Smoothness: ${((stats.skinSmoothness ?? 0) * 100).toFixed(0)}%`, val: ((stats.skinSmoothness ?? 0) * 100).toFixed(0) },
    { id: "lighting", label: "Uneven lighting across scene", labelKey: "check_lighting_label", passed: stats.localContrastVariance >= 8, note: `Variance: ${(stats.localContrastVariance ?? 0).toFixed(1)}`, val: (stats.localContrastVariance ?? 0).toFixed(1) },
    { id: "edge", label: "Natural edge detail at periphery", labelKey: "check_edge_label", passed: stats.backgroundBlur <= 0.55, note: `Blur: ${((stats.backgroundBlur ?? 0) * 100).toFixed(0)}%`, val: ((stats.backgroundBlur ?? 0) * 100).toFixed(0) },
    { id: "symmetry", label: "Asymmetric composition", labelKey: "check_symmetry_label", passed: stats.symmetryScore <= 0.86, note: `Symmetry: ${((stats.symmetryScore ?? 0) * 100).toFixed(0)}%`, val: ((stats.symmetryScore ?? 0) * 100).toFixed(0) },
    { id: "saturation", label: "Rich saturation variance", labelKey: "check_saturation_label", passed: stats.saturationVariance >= 0.11, note: `Var: ${(stats.saturationVariance ?? 0).toFixed(3)}`, val: (stats.saturationVariance ?? 0).toFixed(3) },
    { id: "sharpness", label: "Sharp fine detail", labelKey: "check_sharpness_label", passed: stats.edgeSharpness >= 7, note: `Sharp: ${(stats.edgeSharpness ?? 0).toFixed(1)}`, val: (stats.edgeSharpness ?? 0).toFixed(1) },
  ];

  const verdictKey =
    overallScore >= 70 ? "verdict_likely_ai" :
      overallScore >= 45 ? "verdict_possibly_ai" :
        overallScore >= 20 ? "verdict_likely_edited" : "verdict_likely_human";

  // Use keys in English by default, but UI should prefer verdictKey for i18n
  const verdict = overallScore >= 70 ? "Likely AI Generated" : overallScore >= 45 ? "Possibly AI Generated" : "Likely Human Photo";

  return { overallScore, verdict, verdictKey, signals, checklist, stats, deepMl };
}
