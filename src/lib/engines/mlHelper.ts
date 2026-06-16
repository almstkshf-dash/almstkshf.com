/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { createWorker } from 'tesseract.js';

// Lazily-typed references — populated by loadModels() at runtime only.
let faceModel: any = null;
let handModel: any = null;

// Map to track script loading status and prevent duplicate/overlapping requests
const loadedScripts = new Map<string, Promise<void>>();

/**
 * Dynamically loads a script in the browser environment.
 * Safe for server-side rendering (SSR) environments.
 */
function loadScript(src: string): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }
  let promise = loadedScripts.get(src);
  if (!promise) {
    promise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
    loadedScripts.set(src, promise);
  }
  return promise;
}

/**
 * Loads the face and hand models if not already loaded.
 * Uses dynamic imports and runtime CDN script loading so Turbopack/webpack
 * resolve stubs at build time, but load real engines at runtime in the browser.
 */
async function loadModels() {
  // Dynamic import keeps the TF/MediaPipe graph out of the static bundle.
  const tf = await import('@tensorflow/tfjs');
  await tf.ready();

  if (!faceModel) {
    // Load MediaPipe FaceMesh from CDN to populate window.FaceMesh etc.
    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/face_mesh.js');
    
    // Import the stub module and update its globals to bind to the CDN loaded variables
    const faceMeshStub = await import('@mediapipe/face_mesh') as any;
    if (typeof faceMeshStub.updateGlobals === 'function') {
      faceMeshStub.updateGlobals();
    }

    const faceLandmarksDetection = await import(
      '@tensorflow-models/face-landmarks-detection'
    );
    faceModel = await faceLandmarksDetection.createDetector(
      faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
      { runtime: 'tfjs', refineLandmarks: true }
    );
  }

  if (!handModel) {
    // Load MediaPipe Hands from CDN to populate window.Hands etc.
    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/hands.js');

    // Import the stub module and update its globals to bind to the CDN loaded variables
    const handsStub = await import('@mediapipe/hands') as any;
    if (typeof handsStub.updateGlobals === 'function') {
      handsStub.updateGlobals();
    }

    const handPoseDetection = await import(
      '@tensorflow-models/hand-pose-detection'
    );
    handModel = await handPoseDetection.createDetector(
      handPoseDetection.SupportedModels.MediaPipeHands,
      { runtime: 'tfjs', modelType: 'full' }
    );
  }
}

/**
 * Performs OCR and looks for garbled AI-like text artifacts.
 */
export async function analyzeOCR(canvas: HTMLCanvasElement): Promise<{
  text: string;
  isGarbled: boolean;
  confidence: number;
}> {
  const worker = await createWorker('eng');
  const { data } = await (worker.recognize(canvas) as unknown as { data: { text: string; confidence: number; words: { text?: string; confidence?: number }[] } });
  const { text, confidence, words } = data;
  await worker.terminate();

  // Heuristic for garbled text:
  // 1. Words with rare character transitions
  // 2. High ratio of symbols to letters
  // 3. Very low OCR confidence on structured areas
  const garbledWords = (words as any[]).filter((w: any) => {
    const wordText = w.text || '';
    const hasManyConsonants = /[^aeiou]{5,}/i.test(wordText);
    const hasSymbols = /[^a-z0-9]/i.test(wordText);
    const wordConfidence = w.confidence ?? 0;
    return wordConfidence < 50 || (hasManyConsonants && hasSymbols);
  });

  const isGarbled = (garbledWords.length / Math.max(1, words.length)) > 0.3 && text.length > 5;

  return { text, isGarbled, confidence };
}

export interface ForensicAnomaly {
  id: string;
  name: string;
  confidence?: number;
}

/**
 * Detects face and hand anomalies typical of AI generation.
 */
export async function detectBiometricAnomalies(canvas: HTMLCanvasElement): Promise<{
  faceAnomalies: ForensicAnomaly[];
  handAnomalies: ForensicAnomaly[];
}> {
  await loadModels();

  const faces = (faceModel && typeof faceModel.estimateFaces === 'function')
    ? await faceModel.estimateFaces(canvas)
    : [];
  const hands = (handModel && typeof handModel.estimateHands === 'function')
    ? await handModel.estimateHands(canvas)
    : [];

  const faceAnomalies: ForensicAnomaly[] = [];
  const handAnomalies: ForensicAnomaly[] = [];

  // Face heuristics: AI often has issues with pupil alignment or tooth merging.
  for (const face of faces) {
    const keypoints = face.keypoints;
    if (keypoints.length > 0) {
      const leftEye = keypoints.find((k: { name?: string; x?: number; y?: number; z?: number }) => k.name === 'leftEye');
      const rightEye = keypoints.find((k: { name?: string; x?: number; y?: number; z?: number }) => k.name === 'rightEye');
      if (leftEye && rightEye) {
        const yDiff = Math.abs(leftEye.y - rightEye.y);
        if (yDiff > 12) {
          faceAnomalies.push({ id: 'face_pupil_misalign', name: 'Pupil vertical misalignment' });
        }
      }
    }
  }

  // Hand heuristics: AI is notorious for 6 fingers or fused joints.
  for (const hand of hands) {
    if (hand.keypoints.length !== 21) {
      handAnomalies.push({ id: 'hand_count_invalid', name: 'Impossible hand keypoint count' });
    }
  }

  return { faceAnomalies, handAnomalies };
}

/**
 * Scans for specific AI watermarks (DALL-E, etc.)
 */
export function detectWatermarks(ctx: CanvasRenderingContext2D, w: number, h: number): ForensicAnomaly[] {
  const watermarks: ForensicAnomaly[] = [];

  // DALL-E Signature (5 colored squares bottom right)
  const imageData = ctx.getImageData(w - 100, h - 50, 80, 40);
  const data = imageData.data;

  let colorBlocksFound = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if ((r > 200 && g > 200 && b < 50) || 
        (r < 50 && g > 200 && b > 200) || 
        (r < 50 && g > 200 && b < 50) || 
        (r > 200 && g < 50 && b < 50)) {
      colorBlocksFound++;
    }
  }

  if (colorBlocksFound > 15) {
    watermarks.push({ id: 'watermark_dalle', name: 'DALL-E Signature Pattern' });
  }

  return watermarks;
}
