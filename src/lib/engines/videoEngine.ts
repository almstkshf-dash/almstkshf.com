/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { ForensicAnomaly } from './mlHelper';
import { ImageAnalysisReport, analyzeImageCanvas, analyzeImageCanvasDeep } from './imageEngine';

export interface VideoFrameSignal {
  id: string;
  name: string;
  nameKey: string; // i18n key
  detected: boolean;
}

export interface VideoFrame {
  timestamp: number;
  score: number;
  label: string;
  labelKey: string; // i18n key
  signals: VideoFrameSignal[];
  thumbnail: string;
  stats: FramePixelStats;
}

export interface FramePixelStats {
  noiseLevel: number;
  colorUniformity: number;
  edgeSharpness: number;
  avgBrightness: number;
  centerSharpness: number;
  borderSharpness: number;
  upperThirdMean: number;
  lowerThirdMean: number;
  bgZoneVariance: number;
  localColorBlocks: number;
}

export interface VideoAnalysisResult {
  overallScore: number;
  verdict: string;
  verdictKey: string;
  framesAnalyzed: number;
  duration: number;
  frames: VideoFrame[];
  temporalInconsistency: number;
  flickerScore: number;
  hairEdgeFlicker: number;
  backgroundInconsistency: number;
  deepMl?: {
    ocr: { text: string; isGarbled: boolean; confidence: number };
    biometrics: { faceAnomalies: ForensicAnomaly[]; handAnomalies: ForensicAnomaly[] };
    watermarks: ForensicAnomaly[];
  };
  // Legacy compat fields so any existing consumer still works
  combinedScore: number;
  overallRisk: 'low' | 'medium' | 'high';
  temporalFlicker: number;
  frameReports: Array<{
    timestamp: number;
    report: ImageAnalysisReport;
    thumbnail: string;
  }>;
}

// â”€â”€â”€ Legacy alias (old consumers continue to work unchanged) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** @deprecated Use VideoAnalysisResult â€” this alias exists for backward compat. */
export type VideoAnalysisResultLegacy = VideoAnalysisResult;

// â”€â”€â”€ Frame extractor â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function extractFrame(
  video: HTMLVideoElement,
  time: number,
  canvas: HTMLCanvasElement,
): Promise<ImageData | null> {
  return new Promise(resolve => {
    video.currentTime = time;
    const onSeeked = () => {
      video.removeEventListener('seeked', onSeeked);
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
    video.addEventListener('seeked', onSeeked);
  });
}

function getThumbnail(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/jpeg', 0.42);
}

// â”€â”€â”€ Frame pixel stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function analyzeFrameData(data: ImageData): FramePixelStats {
  const px = data.data;
  const w = data.width;
  const h = data.height;
  const total = w * h;
  const grays: number[] = new Array(total);

  let sumBright = 0;
  for (let i = 0; i < total; i++) {
    const pi = i * 4;
    const gray =
      0.299 * px[pi] + 0.587 * px[pi + 1] + 0.114 * px[pi + 2];
    grays[i] = gray;
    sumBright += gray;
  }
  const avgBrightness = sumBright / total;

  // Noise â€” std-dev of luminance
  const grayVariance =
    grays.reduce((a, b) => a + Math.pow(b - avgBrightness, 2), 0) / total;
  const noiseLevel = Math.sqrt(grayVariance);

  // Color uniformity (R channel std-dev proxy)
  const step = 4;
  const rSample: number[] = [];
  for (let i = 0; i < total; i += step * 4) rSample.push(px[i * 4] || 0);
  const rMean = rSample.reduce((a, b) => a + b, 0) / rSample.length;
  const rStd = Math.sqrt(
    rSample.reduce((a, b) => a + Math.pow(b - rMean, 2), 0) / rSample.length,
  );
  const colorUniformity = Math.max(0, 1 - rStd / 128);

  // Sobel edge helper (zone-based)
  function zoneEdge(x0: number, y0: number, x1: number, y1: number): number {
    let sum = 0,
      count = 0;
    for (let y = Math.max(1, y0); y < Math.min(h - 1, y1); y += step) {
      for (let x = Math.max(1, x0); x < Math.min(w - 1, x1); x += step) {
        const idx = y * w + x;
        const gx = grays[idx + 1] - grays[idx - 1];
        const gy = grays[idx + w] - grays[idx - w];
        sum += Math.sqrt(gx * gx + gy * gy);
        count++;
      }
    }
    return count > 0 ? sum / count : 0;
  }

  const margin = Math.floor(Math.min(w, h) * 0.22);
  const centerSharpness = zoneEdge(margin, margin, w - margin, h - margin);
  const borderSharpness =
    (zoneEdge(0, 0, w, margin) +
      zoneEdge(0, h - margin, w, h) +
      zoneEdge(0, 0, margin, h) +
      zoneEdge(w - margin, 0, w, h)) /
    4;
  const edgeSharpness = zoneEdge(1, 1, w - 1, h - 1);

  // Thirds brightness (lip-sync / blink proxy)
  const third = Math.floor(h / 3);
  let upSum = 0,
    upCount = 0,
    lowSum = 0,
    lowCount = 0;
  for (let y = 0; y < third; y++) {
    for (let x = 0; x < w; x++) {
      upSum += grays[y * w + x];
      upCount++;
    }
  }
  for (let y = third * 2; y < h; y++) {
    for (let x = 0; x < w; x++) {
      lowSum += grays[y * w + x];
      lowCount++;
    }
  }
  const upperThirdMean = upCount > 0 ? upSum / upCount : 0;
  const lowerThirdMean = lowCount > 0 ? lowSum / lowCount : 0;

  // Background zone variance â€” 4 corner sharpness samples
  const cz = Math.floor(Math.min(w, h) * 0.15);
  const corners = [
    zoneEdge(0, 0, cz, cz),
    zoneEdge(w - cz, 0, w, cz),
    zoneEdge(0, h - cz, cz, h),
    zoneEdge(w - cz, h - cz, w, h),
  ];
  const cornerMean = corners.reduce((a, b) => a + b, 0) / 4;
  const bgZoneVariance = Math.sqrt(
    corners.reduce((a, b) => a + Math.pow(b - cornerMean, 2), 0) / 4,
  );

  // Local color block count â€” quantise to 8Ã—8 blocks, count distinct dominant hues
  const blockW = Math.floor(w / 8),
    blockH = Math.floor(h / 8);
  const blockHues = new Set<number>();
  for (let by = 0; by < 8; by++) {
    for (let bx = 0; bx < 8; bx++) {
      const pi = (by * blockH * w + bx * blockW) * 4;
      const r = px[pi],
        g = px[pi + 1],
        b = px[pi + 2];
      const hue = Math.round(
        Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 10,
      );
      blockHues.add(hue);
    }
  }
  const localColorBlocks = blockHues.size;

  return {
    noiseLevel,
    colorUniformity,
    edgeSharpness,
    avgBrightness,
    centerSharpness,
    borderSharpness,
    upperThirdMean,
    lowerThirdMean,
    bgZoneVariance,
    localColorBlocks,
  };
}

// â”€â”€â”€ Per-frame scorer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function scoreFrame(
  stats: FramePixelStats,
  prevStats: FramePixelStats | null,
  prev2Stats: FramePixelStats | null,
): { score: number; signals: VideoFrameSignal[] } {
  let score = 0;
  const signals: VideoFrameSignal[] = [];

  // â”€â”€ Static per-frame signals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const s_smooth = stats.noiseLevel < 14;
  if (s_smooth) score += 25;
  signals.push({ id: 'v_smooth_texture', name: 'Unnaturally smooth frame texture', nameKey: 'signal_v_smooth_texture_name', detected: s_smooth });

  const s_flat = stats.colorUniformity > 0.76;
  if (s_flat) score += 20;
  signals.push({ id: 'v_flat_bg', name: 'Flat/uniform background color', nameKey: 'signal_v_flat_bg_name', detected: s_flat });

  const s_low_complexity = stats.localColorBlocks < 18;
  if (s_low_complexity) score += 15;
  signals.push({ id: 'v_low_complexity', name: 'Low color complexity â€” AI background', nameKey: 'signal_v_low_complexity_name', detected: s_low_complexity });

  const s_hair_blur = stats.centerSharpness > 0 && stats.borderSharpness < stats.centerSharpness * 0.45;
  if (s_hair_blur) score += 20;
  signals.push({ id: 'v_hair_blur', name: 'Unnatural subject isolation / hair edge blur', nameKey: 'signal_v_hair_blur_name', detected: s_hair_blur });

  // â”€â”€ Temporal signals (require previous frame) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  if (prevStats) {
    const s_flicker = Math.abs(stats.avgBrightness - prevStats.avgBrightness) > 28;
    if (s_flicker) score += 25;
    signals.push({ id: 'v_flicker', name: 'Brightness flicker between frames', nameKey: 'signal_v_flicker_name', detected: s_flicker });

    const s_texture_variance = Math.abs(stats.noiseLevel - prevStats.noiseLevel) > 18;
    if (s_texture_variance) score += 15;
    signals.push({ id: 'v_texture_variance', name: 'Texture inconsistency across frames', nameKey: 'signal_v_texture_variance_name', detected: s_texture_variance });

    const borderDelta = Math.abs(stats.borderSharpness - prevStats.borderSharpness);
    const centerDelta = Math.abs(stats.centerSharpness - prevStats.centerSharpness);
    const s_hair_edge_flicker = borderDelta > 6 && centerDelta < 3;
    if (s_hair_edge_flicker) score += 25;
    signals.push({ id: 'v_hair_edge_flicker', name: 'Hair/edge flicker (border unstable)', nameKey: 'signal_v_hair_edge_flicker_name', detected: s_hair_edge_flicker });

    const s_bg_inconsistent = Math.abs(stats.bgZoneVariance - prevStats.bgZoneVariance) > 8;
    if (s_bg_inconsistent) score += 15;
    signals.push({ id: 'v_bg_inconsistent', name: 'Background inconsistency between frames', nameKey: 'signal_v_bg_inconsistent_name', detected: s_bg_inconsistent });

    const s_lip_sync = Math.abs(stats.lowerThirdMean - prevStats.lowerThirdMean) > 20;
    if (s_lip_sync) score += 15;
    signals.push({ id: 'v_lip_sync', name: 'Abrupt lower-face brightness jump', nameKey: 'signal_v_lip_sync_name', detected: s_lip_sync });

    const s_bg_color_variance = Math.abs(stats.colorUniformity - prevStats.colorUniformity) > 0.15;
    if (s_bg_color_variance) score += 15;
    signals.push({ id: 'v_bg_color_variance', name: 'Background color style inconsistency', nameKey: 'signal_v_bg_color_variance_name', detected: s_bg_color_variance });

    // â”€â”€ Blink proxy: eye zone frozen over 3 consecutive frames â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (prev2Stats) {
      const upperDelta1 = Math.abs(stats.upperThirdMean - prevStats.upperThirdMean);
      const upperDelta2 = Math.abs(prevStats.upperThirdMean - prev2Stats.upperThirdMean);
      const s_blink_freeze = upperDelta1 < 1.5 && upperDelta2 < 1.5;
      if (s_blink_freeze) score += 15;
      signals.push({ id: 'v_blink_freeze', name: 'Eye zone frozen â€” no blink rhythm', nameKey: 'signal_v_blink_freeze_name', detected: s_blink_freeze });
    }

    const s_edge_jitter = Math.abs(stats.edgeSharpness - prevStats.edgeSharpness) > 15;
    if (s_edge_jitter) score += 20;
    signals.push({ id: 'v_edge_jitter', name: 'Temporal edge jitter â€” flickering detail', nameKey: 'signal_v_edge_jitter_name', detected: s_edge_jitter });

    const s_static_bg = stats.bgZoneVariance < 2 && prevStats.bgZoneVariance < 2;
    if (s_static_bg) score += 10;
    signals.push({ id: 'v_static_bg', name: 'Suspiciously static backdrop', nameKey: 'signal_v_static_bg_name', detected: s_static_bg });
  }

  return {
    score: Math.min(100, score),
    signals
  };
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Map a [0-100] score to a localized frame label + its i18n key. */
function buildFrameLabel(score: number): { label: string; labelKey: string } {
  if (score >= 60) return { label: 'AI',    labelKey: 'label_ai' };
  if (score >= 30) return { label: 'Mixed', labelKey: 'label_mixed' };
  return              { label: 'Human', labelKey: 'label_human' };
}

/**
 * Compute a set of sample timestamps using adaptive scene-change detection.
 *
 * Strategy:
 *  1. Start with a baseline of evenly-spaced timestamps (one per â‰ˆ2 s, capped at `baseMax`).
 *  2. Pre-scan every second to measure frame-to-frame brightness delta.
 *  3. Insert an extra keyframe around each detected scene cut (delta > `cutThreshold`).
 *  4. De-duplicate and sort, capping the final list at `hardMax`.
 */
async function computeAdaptiveTimestamps(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  duration: number,
  baseMax: number = 16,
  hardMax: number = 24,
  cutThreshold: number = 30,
): Promise<number[]> {
  // --- Baseline uniform grid ---
  const baseCount = Math.min(baseMax, Math.max(6, Math.floor(duration / 2)));
  const base = Array.from(
    { length: baseCount },
    (_, i) => (duration / baseCount) * i + 0.3,
  );

  // --- Scene-cut scan (1-FPS lightweight pass) ---
  const scanStep = Math.max(1, Math.floor(duration / 60)); // â‰¤60 probes
  const scanTimes: number[] = [];
  for (let t = scanStep; t < duration - 0.5; t += scanStep) {
    scanTimes.push(parseFloat(t.toFixed(2)));
  }

  let prevBrightness: number | null = null;
  const cutTimes: number[] = [];

  for (const t of scanTimes) {
    const data = await extractFrame(video, t, canvas);
    if (!data) { prevBrightness = null; continue; }
    const px = data.data;
    const total = data.width * data.height;
    let sum = 0;
    for (let i = 0; i < total; i++) {
      const pi = i * 4;
      sum += 0.299 * px[pi] + 0.587 * px[pi + 1] + 0.114 * px[pi + 2];
    }
    const brightness = sum / total;
    if (prevBrightness !== null && Math.abs(brightness - prevBrightness) > cutThreshold) {
      // Capture one frame just before and just after the cut
      cutTimes.push(Math.max(0.1, t - scanStep * 0.5));
      cutTimes.push(Math.min(duration - 0.1, t + scanStep * 0.5));
    }
    prevBrightness = brightness;
  }

  // --- Merge, de-duplicate (within 0.5 s), sort, cap ---
  const merged = [...base, ...cutTimes].sort((a, b) => a - b);
  const deduped: number[] = [];
  for (const t of merged) {
    if (deduped.length === 0 || t - deduped[deduped.length - 1] > 0.5) {
      deduped.push(t);
    }
  }
  return deduped.slice(0, hardMax);
}

/** Compute aggregate temporal metrics from a set of frames. */
function computeAggregates(frames: VideoFrame[]): {
  temporalInconsistency: number;
  flickerScore: number;
  hairEdgeFlicker: number;
  backgroundInconsistency: number;
  temporalFlicker: number;
} {
  if (frames.length === 0) {
    return { temporalInconsistency: 0, flickerScore: 0, hairEdgeFlicker: 0, backgroundInconsistency: 0, temporalFlicker: 0 };
  }
  const scores = frames.map(f => f.score);
  const scoreMean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const temporalInconsistency = Math.round(
    Math.sqrt(scores.reduce((a, b) => a + Math.pow(b - scoreMean, 2), 0) / scores.length),
  );

  const flickerCount = frames.filter(f => f.signals.some(s => s.id === 'v_flicker' && s.detected)).length;
  const flickerScore = Math.round((flickerCount / frames.length) * 100);

  const hairFlickerCount = frames.filter(f => f.signals.some(s => s.id === 'v_hair_edge_flicker' && s.detected)).length;
  const hairEdgeFlicker = Math.round((hairFlickerCount / frames.length) * 100);

  const bgScores = frames.map(f => f.stats.bgZoneVariance);
  const bgMean = bgScores.reduce((a, b) => a + b, 0) / bgScores.length;
  const backgroundInconsistency = Math.round(
    Math.sqrt(bgScores.reduce((a, b) => a + Math.pow(b - bgMean, 2), 0) / bgScores.length),
  );

  let temporalFlickerSum = 0;
  for (let i = 1; i < frames.length; i++) {
    temporalFlickerSum += Math.abs(frames[i].stats.avgBrightness - frames[i - 1].stats.avgBrightness);
  }
  const temporalFlicker = temporalFlickerSum / Math.max(1, frames.length - 1);

  return { temporalInconsistency, flickerScore, hairEdgeFlicker, backgroundInconsistency, temporalFlicker };
}

/** Build a typed VerdictKey from an overall score. */
function buildVerdictKey(overallScore: number): { verdict: string; verdictKey: string } {
  if (overallScore >= 75) return { verdict: 'Likely AI Generated',   verdictKey: 'verdict_likely_ai' };
  if (overallScore >= 55) return { verdict: 'Possibly AI Generated', verdictKey: 'verdict_possibly_ai' };
  if (overallScore >= 30) return { verdict: 'Mixed / Edited',        verdictKey: 'verdict_mixed' };
  return                         { verdict: 'Likely Human Recorded', verdictKey: 'verdict_human' };
}


export async function analyzeVideoFile(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<VideoAnalysisResult> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.muted = true;
    video.preload = 'metadata';
    const url = URL.createObjectURL(file);

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration;
        // 480Ã—270 gives richer spatial signal without excessive memory pressure
        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 270;

        // â”€â”€ Adaptive sampling: uniform baseline + scene-cut keyframes â”€â”€
        onProgress?.(2);
        const timestamps = await computeAdaptiveTimestamps(video, canvas, duration);

        const frames: VideoFrame[] = [];
        const frameReports: VideoAnalysisResult['frameReports'] = [];

        let prevStats: FramePixelStats | null = null;
        let prev2Stats: FramePixelStats | null = null;
        let capturedDeepMl: VideoAnalysisResult['deepMl'] | undefined;

        // Run the single deep-ML pass at the video midpoint
        const deepMlIdx = Math.floor(timestamps.length / 2);

        for (let i = 0; i < timestamps.length; i++) {
          const t = timestamps[i];
          const imageData = await extractFrame(video, t, canvas);
          if (!imageData) continue;

          // â”€â”€ Fast pixel heuristics â”€â”€
          const stats = analyzeFrameData(imageData);
          const { score: ruleScore, signals: ruleSignals } = scoreFrame(stats, prevStats, prev2Stats);
          const thumb = getThumbnail(canvas);

          // â”€â”€ Deep ML (once, at midpoint) â”€â”€
          let deepReport: ImageAnalysisReport | null = null;
          if (i === deepMlIdx) {
            deepReport = await analyzeImageCanvasDeep(canvas);
            capturedDeepMl = deepReport?.richResult?.deepMl;
          }

          const combinedScore = deepReport
            ? Math.max(ruleScore, deepReport.richResult?.overallScore ?? 0)
            : ruleScore;

          const { label, labelKey } = buildFrameLabel(combinedScore);

          const mlSignals: VideoFrameSignal[] = deepReport
            ? (deepReport.richResult?.signals
                .filter(s => s.detected)
                .map(s => ({
                  id: `img_${s.id}`,
                  name: s.name,
                  nameKey: `signal_${s.id}_name`,
                  detected: true,
                })) ?? [])
            : [];

          frames.push({
            timestamp: t,
            score: combinedScore,
            label,
            labelKey,
            signals: [...ruleSignals, ...mlSignals],
            thumbnail: thumb,
            stats,
          });

          const legacyReport = deepReport ?? analyzeImageCanvas(canvas);
          frameReports.push({ timestamp: t, report: legacyReport, thumbnail: thumb });

          prev2Stats = prevStats;
          prevStats = stats;
          onProgress?.(5 + Math.round(((i + 1) / timestamps.length) * 90));
        }

        URL.revokeObjectURL(url);

        const overallScore = frames.length
          ? Math.round(frames.reduce((a, f) => a + f.score, 0) / frames.length)
          : 0;

        const { verdict, verdictKey } = buildVerdictKey(overallScore);
        const aggregates = computeAggregates(frames);
        const overallRisk: 'low' | 'medium' | 'high' =
          overallScore >= 60 ? 'high' : overallScore >= 30 ? 'medium' : 'low';

        onProgress?.(100);
        resolve({
          overallScore,
          verdict,
          verdictKey,
          framesAnalyzed: frames.length,
          duration,
          frames,
          ...aggregates,
          deepMl: capturedDeepMl,
          combinedScore: overallScore,
          overallRisk,
          frameReports,
        });
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Video load failed'));
    };

    video.src = url;
  });
}

/** Legacy alias wrappers */
export const analyzeVideo = async (file: File, p?: (n: number) => void) => analyzeVideoFile(file, p);

/**
 * Analyse a pre-loaded HTMLVideoElement.
 * Produces the same rich VideoAnalysisResult as analyzeVideoFile, including
 * all aggregate metrics. Deep ML is skipped to keep latency low for realtime use.
 */
export const analyzeVideoElement = async (
  video: HTMLVideoElement,
  onProgress?: (progress: number) => void,
): Promise<VideoAnalysisResult> => {
  return new Promise((resolve, reject) => {
    if (!video.duration || isNaN(video.duration)) {
      reject(new Error('Invalid video duration'));
      return;
    }

    (async () => {
      try {
        const duration = video.duration;
        const canvas = document.createElement('canvas');
        canvas.width = 480;
        canvas.height = 270;

        // Adaptive sampling reuses the same helper (no deep-ML scan pass here)
        const sampleCount = Math.min(16, Math.max(6, Math.floor(duration / 2)));
        const timestamps = Array.from(
          { length: sampleCount },
          (_, i) => (duration / sampleCount) * i + 0.3,
        );

        const frames: VideoFrame[] = [];
        const frameReports: VideoAnalysisResult['frameReports'] = [];
        let prevStats: FramePixelStats | null = null;
        let prev2Stats: FramePixelStats | null = null;

        for (let i = 0; i < timestamps.length; i++) {
          const t = timestamps[i];
          const imageData = await extractFrame(video, t, canvas);
          if (!imageData) continue;

          const stats = analyzeFrameData(imageData);
          const { score, signals } = scoreFrame(stats, prevStats, prev2Stats);
          const thumb = getThumbnail(canvas);
          const { label, labelKey } = buildFrameLabel(score);

          frames.push({ timestamp: t, score, label, labelKey, signals, thumbnail: thumb, stats });

          const legacyReport = analyzeImageCanvas(canvas);
          frameReports.push({ timestamp: t, report: legacyReport, thumbnail: thumb });

          prev2Stats = prevStats;
          prevStats = stats;
          onProgress?.(Math.round(((i + 1) / timestamps.length) * 100));
        }

        const overallScore = frames.length
          ? Math.round(frames.reduce((a, f) => a + f.score, 0) / frames.length)
          : 0;

        const { verdict, verdictKey } = buildVerdictKey(overallScore);
        const aggregates = computeAggregates(frames);
        const overallRisk: 'low' | 'medium' | 'high' =
          overallScore >= 60 ? 'high' : overallScore >= 30 ? 'medium' : 'low';

        resolve({
          overallScore,
          verdict,
          verdictKey,
          framesAnalyzed: frames.length,
          duration,
          frames,
          ...aggregates,
          combinedScore: overallScore,
          overallRisk,
          frameReports,
        });
      } catch (e) {
        reject(e);
      }
    })();
  });
};
