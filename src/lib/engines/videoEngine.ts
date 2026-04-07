/**
 * AI Content Detection Engine — Video Forensics (v2)
 *
 * Rule-based AI video detection via frame sampling — zero API, zero ffmpeg.
 * Detects: temporal flicker, hair/edge instability, background inconsistency,
 * abnormal symmetry, lip-sync artifacts, blink freeze, flat AI backgrounds.
 *
 * 100% Client-side. No external dependencies beyond the browser Canvas API.
 *
 * New rich API:
 *   analyzeVideoFile(file, onProgress?) → Promise<VideoAnalysisResult>
 *
 * Backward-compat API (the old shape is kept so VideoResults.tsx compiles):
 *   analyzeVideo(file, onProgress?)    → Promise<VideoAnalysisResultLegacy>
 *   analyzeVideoElement(video, onProgress?) → Promise<VideoAnalysisResultLegacy>
 */

import { analyzeImageCanvas, ImageAnalysisReport } from './imageEngine';

// ─── Rich interfaces (new API) ────────────────────────────────────────────────

export interface VideoFrame {
  timestamp: number;
  score: number;
  label: 'Human' | 'Mixed' | 'AI';
  signals: string[];
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
  framesAnalyzed: number;
  duration: number;
  frames: VideoFrame[];
  temporalInconsistency: number;
  flickerScore: number;
  hairEdgeFlicker: number;
  backgroundInconsistency: number;
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

// ─── Legacy alias (old consumers continue to work unchanged) ──────────────────

/** @deprecated Use VideoAnalysisResult — this alias exists for backward compat. */
export type VideoAnalysisResultLegacy = VideoAnalysisResult;

// ─── Frame extractor ──────────────────────────────────────────────────────────

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

// ─── Frame pixel stats ────────────────────────────────────────────────────────

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

  // Noise — std-dev of luminance
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

  // Background zone variance — 4 corner sharpness samples
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

  // Local color block count — quantise to 8×8 blocks, count distinct dominant hues
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

// ─── Per-frame scorer ─────────────────────────────────────────────────────────

function scoreFrame(
  stats: FramePixelStats,
  prevStats: FramePixelStats | null,
  prev2Stats: FramePixelStats | null,
): { score: number; signals: string[] } {
  let score = 0;
  const signals: string[] = [];

  // ── Static per-frame signals ──────────────────────────────────────────────

  if (stats.noiseLevel < 14) {
    score += 25;
    signals.push('Unnaturally smooth frame texture');
  }

  if (stats.colorUniformity > 0.76) {
    score += 20;
    signals.push('Flat/uniform background color');
  }

  if (stats.localColorBlocks < 18) {
    score += 12;
    signals.push('Low color complexity — AI-like flat background');
  }

  if (
    stats.centerSharpness > 0 &&
    stats.borderSharpness < stats.centerSharpness * 0.45
  ) {
    score += 18;
    signals.push('Unnatural subject isolation / hair edge blur');
  }

  // ── Temporal signals (require previous frame) ─────────────────────────────

  if (prevStats) {
    const brightDelta = Math.abs(stats.avgBrightness - prevStats.avgBrightness);
    if (brightDelta > 28) {
      score += 22;
      signals.push('Brightness flicker between frames');
    }

    const noiseDelta = Math.abs(stats.noiseLevel - prevStats.noiseLevel);
    if (noiseDelta > 18) {
      score += 16;
      signals.push('Texture inconsistency across frames');
    }

    const borderDelta = Math.abs(
      stats.borderSharpness - prevStats.borderSharpness,
    );
    const centerDelta = Math.abs(
      stats.centerSharpness - prevStats.centerSharpness,
    );
    if (borderDelta > 6 && centerDelta < 3) {
      score += 20;
      signals.push('Hair/edge flicker (border unstable, center stable)');
    }

    const bgDelta = Math.abs(stats.bgZoneVariance - prevStats.bgZoneVariance);
    if (bgDelta > 8) {
      score += 18;
      signals.push('Background inconsistency between frames');
    }

    const lipDelta = Math.abs(
      stats.lowerThirdMean - prevStats.lowerThirdMean,
    );
    if (lipDelta > 20) {
      score += 14;
      signals.push('Abrupt lower-face brightness jump (lip sync artifact)');
    }

    const colorDelta = Math.abs(
      stats.colorUniformity - prevStats.colorUniformity,
    );
    if (colorDelta > 0.15) {
      score += 14;
      signals.push('Background color style inconsistency');
    }

    // ── Blink proxy: eye zone frozen over 3 consecutive frames ────────────
    if (prev2Stats) {
      const upperDelta1 = Math.abs(
        stats.upperThirdMean - prevStats.upperThirdMean,
      );
      const upperDelta2 = Math.abs(
        prevStats.upperThirdMean - prev2Stats.upperThirdMean,
      );
      if (upperDelta1 < 1.5 && upperDelta2 < 1.5) {
        score += 12;
        signals.push('Eye zone frozen — no blink rhythm detected');
      }
    }
  }

  return {
    score: Math.min(100, score),
    signals: signals.length ? signals : ['No strong signals detected'],
  };
}

// ─── Main rich entry point ────────────────────────────────────────────────────

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
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;

        const sampleCount = Math.min(16, Math.max(6, Math.floor(duration / 2)));
        const timestamps = Array.from(
          { length: sampleCount },
          (_, i) => (duration / sampleCount) * i + 0.3,
        );

        const frames: VideoFrame[] = [];
        // Legacy frame reports (backward compat)
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

          frames.push({
            timestamp: t,
            score,
            label: score >= 60 ? 'AI' : score >= 30 ? 'Mixed' : 'Human',
            signals,
            thumbnail: thumb,
            stats,
          });

          // Legacy compat: build a mini ImageAnalysisReport for the frame
          const legacyReport = analyzeImageCanvas(canvas);
          frameReports.push({ timestamp: t, report: legacyReport, thumbnail: thumb });

          prev2Stats = prevStats;
          prevStats = stats;
          onProgress?.(Math.round(((i + 1) / timestamps.length) * 100));
        }

        URL.revokeObjectURL(url);

        // ── Aggregate stats ──────────────────────────────────────────────

        const scores = frames.map(f => f.score);
        const overallScore = Math.round(
          scores.reduce((a, b) => a + b, 0) / scores.length,
        );

        const scoreMean = overallScore;
        const scoreVariance =
          scores.reduce((a, b) => a + Math.pow(b - scoreMean, 2), 0) /
          scores.length;
        const temporalInconsistency = Math.round(Math.sqrt(scoreVariance));

        const flickerCount = frames.filter(f =>
          f.signals.includes('Brightness flicker between frames'),
        ).length;
        const flickerScore = Math.round((flickerCount / frames.length) * 100);

        const hairFlickerCount = frames.filter(f =>
          f.signals.includes(
            'Hair/edge flicker (border unstable, center stable)',
          ),
        ).length;
        const hairEdgeFlicker = Math.round(
          (hairFlickerCount / frames.length) * 100,
        );

        const bgScores = frames.map(f => f.stats.bgZoneVariance);
        const bgMean = bgScores.reduce((a, b) => a + b, 0) / bgScores.length;
        const backgroundInconsistency = Math.round(
          Math.sqrt(
            bgScores.reduce((a, b) => a + Math.pow(b - bgMean, 2), 0) /
            bgScores.length,
          ),
        );

        const verdict =
          overallScore >= 75
            ? 'Likely AI Generated'
            : overallScore >= 55
              ? 'Possibly AI Generated'
              : overallScore >= 30
                ? 'Mixed / Edited'
                : 'Likely Human Recorded';

        // Legacy risk mapping
        const overallRisk: 'low' | 'medium' | 'high' =
          overallScore >= 60 ? 'high' : overallScore >= 30 ? 'medium' : 'low';

        // Legacy temporalFlicker: average brightness delta across frame pairs
        let temporalFlickerSum = 0;
        for (let i = 1; i < frames.length; i++) {
          temporalFlickerSum += Math.abs(
            frames[i].stats.avgBrightness - frames[i - 1].stats.avgBrightness,
          );
        }
        const temporalFlicker =
          frames.length > 1 ? temporalFlickerSum / (frames.length - 1) : 0;

        resolve({
          // ── New rich API ──
          overallScore,
          verdict,
          framesAnalyzed: frames.length,
          duration,
          frames,
          temporalInconsistency,
          flickerScore,
          hairEdgeFlicker,
          backgroundInconsistency,
          // ── Legacy compat ──
          combinedScore: overallScore,
          overallRisk,
          temporalFlicker,
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

// ─── Backward-compat exports (old API — calls rich impl internally) ────────────

/**
 * @deprecated Prefer analyzeVideoFile. Kept for backward compatibility.
 */
export const analyzeVideo = async (
  file: File,
  onProgress?: (progress: number) => void,
): Promise<VideoAnalysisResult> => {
  return analyzeVideoFile(file, onProgress);
};

/**
 * @deprecated Prefer analyzeVideoFile with a File object.
 * This entry point still works — it creates a temporary blob URL.
 */
export const analyzeVideoElement = async (
  video: HTMLVideoElement,
  onProgress?: (progress: number) => void,
): Promise<VideoAnalysisResult> => {
  // Wrap the already-loaded video element in the new rich analyser
  return new Promise((resolve, reject) => {
    if (!video.duration || isNaN(video.duration)) {
      reject(new Error('Invalid video duration'));
      return;
    }

    (async () => {
      try {
        const duration = video.duration;
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;

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

          frames.push({
            timestamp: t,
            score,
            label: score >= 60 ? 'AI' : score >= 30 ? 'Mixed' : 'Human',
            signals,
            thumbnail: thumb,
            stats,
          });

          const legacyReport = analyzeImageCanvas(canvas);
          frameReports.push({ timestamp: t, report: legacyReport, thumbnail: thumb });

          prev2Stats = prevStats;
          prevStats = stats;
          onProgress?.(Math.round(((i + 1) / timestamps.length) * 100));
        }

        const scores = frames.map(f => f.score);
        const overallScore = Math.round(
          scores.reduce((a, b) => a + b, 0) / scores.length,
        );
        const scoreVariance =
          scores.reduce((a, b) => a + Math.pow(b - overallScore, 2), 0) /
          scores.length;
        const temporalInconsistency = Math.round(Math.sqrt(scoreVariance));

        const flickerScore = Math.round(
          (frames.filter(f =>
            f.signals.includes('Brightness flicker between frames'),
          ).length /
            frames.length) *
          100,
        );
        const hairEdgeFlicker = Math.round(
          (frames.filter(f =>
            f.signals.includes(
              'Hair/edge flicker (border unstable, center stable)',
            ),
          ).length /
            frames.length) *
          100,
        );

        const bgScores = frames.map(f => f.stats.bgZoneVariance);
        const bgMean = bgScores.reduce((a, b) => a + b, 0) / bgScores.length;
        const backgroundInconsistency = Math.round(
          Math.sqrt(
            bgScores.reduce((a, b) => a + Math.pow(b - bgMean, 2), 0) /
            bgScores.length,
          ),
        );

        const verdict =
          overallScore >= 75
            ? 'Likely AI Generated'
            : overallScore >= 55
              ? 'Possibly AI Generated'
              : overallScore >= 30
                ? 'Mixed / Edited'
                : 'Likely Human Recorded';

        const overallRisk: 'low' | 'medium' | 'high' =
          overallScore >= 60 ? 'high' : overallScore >= 30 ? 'medium' : 'low';

        let temporalFlickerSum = 0;
        for (let i = 1; i < frames.length; i++) {
          temporalFlickerSum += Math.abs(
            frames[i].stats.avgBrightness - frames[i - 1].stats.avgBrightness,
          );
        }
        const temporalFlicker =
          frames.length > 1 ? temporalFlickerSum / (frames.length - 1) : 0;

        resolve({
          overallScore,
          verdict,
          framesAnalyzed: frames.length,
          duration,
          frames,
          temporalInconsistency,
          flickerScore,
          hairEdgeFlicker,
          backgroundInconsistency,
          combinedScore: overallScore,
          overallRisk,
          temporalFlicker,
          frameReports,
        });
      } catch (e) {
        reject(e);
      }
    })();
  });
};
