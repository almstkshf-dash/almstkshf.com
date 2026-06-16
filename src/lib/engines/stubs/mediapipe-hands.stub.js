/**
 * @mediapipe/hands — Turbopack build-time stub
 *
 * The real @mediapipe/hands package does not export `Hands` as a named
 * ESM export in a way Turbopack can statically resolve, causing the build to
 * fail when @tensorflow-models/hand-pose-detection is analysed at build time.
 *
 * This stub satisfies the static import so the build succeeds.
 * At runtime, mlHelper.ts uses dynamic import() and the real package is
 * resolved by the browser/Node.js module system directly.
 */

export let Hands = undefined;
export let HAND_CONNECTIONS = undefined;
export let VERSION = undefined;

export function updateGlobals() {
  if (typeof window !== 'undefined') {
    Hands = window.Hands;
    HAND_CONNECTIONS = window.HAND_CONNECTIONS;
    VERSION = window.VERSION;
  }
}

export default {
  get Hands() { return Hands; },
  get HAND_CONNECTIONS() { return HAND_CONNECTIONS; },
  get VERSION() { return VERSION; },
  updateGlobals,
};
