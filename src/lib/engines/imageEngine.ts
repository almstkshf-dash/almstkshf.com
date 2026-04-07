/**
 * AI Content Detection Engine — Image Forensics
 *
 * Rule-based AI image detection via canvas pixel analysis — zero API, fully client-side.
 * Detects: synthetic grain absence, skin airbrushing, lighting uniformity, AI bokeh,
 * symmetry bias, color flatness, edge dissolution, aspect ratio fingerprints, EXIF heuristics.
 *
 * Exports (new API):
 *   analyzeImageFile(file: File): Promise<ImageAnalysisResult>
 *
 * Legacy backward-compat exports (existing consumers unchanged):
 *   analyzeImage(img: HTMLImageElement): Promise<ImageAnalysisReport>
 *   analyzeImageCanvas(canvas: HTMLCanvasElement): ImageAnalysisReport
 *   ImageAnalysisReport
 */

// ─── New rich interfaces ──────────────────────────────────────────────────────

export interface ImageSignal {
  name: string;
  detected: boolean;
  weight: number;
  description: string;
  category: "texture" | "structure" | "lighting" | "artifact" | "metadata";
}

export interface ChecklistItem {
  label: string;
  passed: boolean;
  note: string;
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
  signals: ImageSignal[];
  checklist: ChecklistItem[];
  stats: PixelStats;
}

// ─── Legacy interface (kept for backward compat) ──────────────────────────────

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

// ─── Main entry (new API) ─────────────────────────────────────────────────────

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

        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const stats = computePixelStats(imageData, canvas.width, canvas.height, img.width, img.height, file);
        const result = buildImageResult(stats, file);

        URL.revokeObjectURL(url);
        resolve(result);
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

// ─── Legacy entry points (backward compat) ────────────────────────────────────

export const analyzeImage = async (img: HTMLImageElement): Promise<ImageAnalysisReport> => {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(img, 0, 0);
  return analyzeImageCanvas(canvas);
};

export const analyzeImageCanvas = (canvas: HTMLCanvasElement): ImageAnalysisReport => {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas context unavailable");

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // ── Noise floor (local luminance variance) ────────────────────────────────
  let varianceSum = 0;
  const sampleDensity = 1000;
  for (let i = 0; i < sampleDensity; i++) {
    const x = Math.floor(Math.random() * (width - 1));
    const y = Math.floor(Math.random() * (height - 1));
    const idx = (y * width + x) * 4;
    const nextIdx = (y * width + (x + 1)) * 4;
    const l1 = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
    const l2 = data[nextIdx] * 0.299 + data[nextIdx + 1] * 0.587 + data[nextIdx + 2] * 0.114;
    varianceSum += Math.abs(l1 - l2);
  }
  const avgVariance = varianceSum / sampleDensity;

  // ── Entropy (color distribution) ──────────────────────────────────────────
  const colorBaskets = new Int32Array(256);
  for (let i = 0; i < data.length; i += Math.floor(data.length / 2000) * 4) {
    const l = Math.floor(data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
    colorBaskets[l]++;
  }
  let entropy = 0;
  const totalSamples = colorBaskets.reduce((a, b) => a + b, 0);
  for (let i = 0; i < 256; i++) {
    if (colorBaskets[i] > 0) {
      const p = colorBaskets[i] / totalSamples;
      entropy -= p * Math.log2(p);
    }
  }

  // Now compute full rich stats for the legacy report too
  const dummyFile = new File([], "canvas.png", { type: "image/png" });
  const stats = computePixelStats(imageData, width, height, width, height, dummyFile);
  const richResult = buildImageResult(stats, dummyFile);

  // ── Scoring ───────────────────────────────────────────────────────────────
  let riskScore = 0;
  const signals: ImageAnalysisReport["pixelLogicSignals"] = [];

  if (avgVariance < 1.2) {
    riskScore += 45;
    signals.push({
      id: "low_noise",
      label: "Synthetic Grain",
      description: "Lack of natural sensor noise detected in pixel transitions.",
      detectedValue: avgVariance.toFixed(2),
      threshold: "1.20",
      risk: "flag",
    });
  } else {
    signals.push({
      id: "natural_grain",
      label: "Natural Grain",
      description: "Sensor grain levels consistent with realistic photography.",
      detectedValue: avgVariance.toFixed(2),
      threshold: "1.20",
      risk: "none",
    });
  }

  if (entropy < 4.5) {
    riskScore += 30;
    signals.push({
      id: "low_entropy",
      label: "Color Entropy",
      description: "Uniformity in color distribution suggests artificial rendering.",
      detectedValue: entropy.toFixed(2),
      threshold: "4.50+",
      risk: "concern",
    });
  }

  // Surface high-weight rich signals into legacy format
  for (const sig of richResult.signals) {
    if (sig.detected && sig.weight >= 14) {
      const alreadyMapped = signals.some(
        (s) => s.label.toLowerCase().includes(sig.name.substring(0, 8).toLowerCase())
      );
      if (!alreadyMapped) {
        riskScore += Math.round(sig.weight * 0.5);
        signals.push({
          id: sig.name.replace(/\s+/g, "_").toLowerCase().slice(0, 32),
          label: sig.name,
          description: sig.description,
          detectedValue: sig.category,
          threshold: "-",
          risk: sig.weight >= 18 ? "flag" : "concern",
        });
      }
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
};

// ─── Pixel computation ────────────────────────────────────────────────────────

function computePixelStats(
  data: ImageData,
  w: number,
  h: number,
  origW: number,
  origH: number,
  file: File
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

  // Local contrast variance across 3×3 zones
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

// ─── Signal builder ───────────────────────────────────────────────────────────

function buildImageResult(stats: PixelStats, file: File): ImageAnalysisResult {
  const signals: ImageSignal[] = [

    // ── TEXTURE ────────────────────────────────────────────────────────────
    {
      name: "Unnaturally smooth texture / skin",
      detected: stats.noiseLevel < 16 || stats.skinSmoothness > 0.82,
      weight: 22,
      category: "texture",
      description:
        "AI images lack camera sensor noise; skin in AI portraits is airbrushed-perfect.",
    },
    {
      name: "Low saturation variance",
      detected: stats.saturationVariance < 0.11,
      weight: 14,
      category: "texture",
      description:
        "Human photos have chaotic, uneven colour across regions — AI flattens it.",
    },

    // ── STRUCTURE ──────────────────────────────────────────────────────────
    {
      name: "Suspicious bilateral symmetry",
      detected: stats.symmetryScore > 0.84,
      weight: 14,
      category: "structure",
      description:
        "AI faces and compositions trend toward near-perfect symmetry — real life doesn't.",
    },
    {
      name: "Over-uniform color distribution",
      detected: stats.colorUniformity > 0.74,
      weight: 16,
      category: "structure",
      description:
        "Real photos have varied R/G/B distribution; AI flattens it uniformly.",
    },

    // ── LIGHTING ───────────────────────────────────────────────────────────
    {
      name: "Unnaturally uniform lighting",
      detected: stats.localContrastVariance < 8,
      weight: 18,
      category: "lighting",
      description:
        "Real scenes have uneven light (shadows, reflections, highlights). AI lighting is studio-perfect.",
    },
    {
      name: "Artificial subject / background separation",
      detected: stats.backgroundBlur > 0.55 && stats.centerEdgeDelta > 10,
      weight: 12,
      category: "lighting",
      description:
        "AI aggressively isolates subjects from backgrounds with unnatural bokeh-like blur.",
    },

    // ── ARTIFACT ───────────────────────────────────────────────────────────
    {
      name: "Blurred / dissolving edge detail",
      detected: stats.edgeSharpness < 7,
      weight: 16,
      category: "artifact",
      description:
        "Hair edges, fingers, background transitions — AI smears fine detail.",
    },
    {
      name: "Suspicious common AI aspect ratio",
      detected: [1.0, 1.5, 1.77, 0.666, 0.75].some(
        (r) => Math.abs(stats.aspectRatio - r) < 0.04
      ),
      weight: 6,
      category: "artifact",
      description:
        "Midjourney, DALL-E, Stable Diffusion default to specific ratios (1:1, 3:2, 16:9, 3:4).",
    },
    {
      name: "Suspiciously round megapixel count",
      detected: [1, 2, 4, 8, 16].some((mp) => Math.abs(stats.megapixels - mp) < 0.15),
      weight: 4,
      category: "artifact",
      description:
        "AI generators output exact round megapixel counts — cameras don't.",
    },

    // ── METADATA ───────────────────────────────────────────────────────────
    {
      name: "No EXIF / camera metadata (inferred)",
      detected: file.size < 200_000 && stats.megapixels > 1,
      weight: 8,
      category: "metadata",
      description:
        "Real camera photos embed EXIF data, making files larger relative to resolution.",
    },
  ];

  const detectedWeight = signals.filter((s) => s.detected).reduce((a, s) => a + s.weight, 0);
  const totalWeight = signals.reduce((a, s) => a + s.weight, 0);
  const overallScore = Math.round((detectedWeight / totalWeight) * 100);

  const checklist: ChecklistItem[] = [
    {
      label: "Natural sensor noise present",
      passed: stats.noiseLevel >= 16,
      note: `Noise: ${stats.noiseLevel.toFixed(1)} (≥16 = real camera)`,
    },
    {
      label: "Skin texture has imperfection",
      passed: stats.skinSmoothness <= 0.82,
      note: `Skin smoothness: ${(stats.skinSmoothness * 100).toFixed(0)}% (≤82% = natural)`,
    },
    {
      label: "Uneven lighting across scene",
      passed: stats.localContrastVariance >= 8,
      note: `Zone contrast variance: ${stats.localContrastVariance.toFixed(1)}`,
    },
    {
      label: "Natural edge detail at periphery",
      passed: stats.backgroundBlur <= 0.55,
      note: `Background blur ratio: ${(stats.backgroundBlur * 100).toFixed(0)}%`,
    },
    {
      label: "Asymmetric composition",
      passed: stats.symmetryScore <= 0.84,
      note: `Symmetry: ${(stats.symmetryScore * 100).toFixed(0)}%`,
    },
    {
      label: "Rich saturation variance",
      passed: stats.saturationVariance >= 0.11,
      note: `Sat variance: ${stats.saturationVariance.toFixed(3)}`,
    },
    {
      label: "Sharp fine detail",
      passed: stats.edgeSharpness >= 7,
      note: `Edge sharpness: ${stats.edgeSharpness.toFixed(1)}`,
    },
  ];

  const verdict =
    overallScore >= 75 ? "Likely AI Generated" :
      overallScore >= 52 ? "Possibly AI Generated" :
        overallScore >= 28 ? "Likely Human / Edited" :
          "Likely Human Photo";

  return { overallScore, verdict, signals, checklist, stats };
}
