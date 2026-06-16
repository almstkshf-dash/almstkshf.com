/**
 * @mediapipe/face_mesh — Turbopack build-time stub
 *
 * The real @mediapipe/face_mesh package does not export `FaceMesh` as a
 * named ESM export in the version installed here, causing Turbopack to fail
 * during static analysis of @tensorflow-models/face-landmarks-detection.
 *
 * This stub satisfies the static import so the build succeeds.
 * At runtime, mlHelper.ts uses dynamic import() and the real package is
 * resolved by the browser/Node.js module system directly.
 */

export let FaceMesh = undefined;
export let FACEMESH_CONTOURS = undefined;
export let FACEMESH_FACE_OVAL = undefined;
export let FACEMESH_LEFT_EYE = undefined;
export let FACEMESH_LEFT_EYEBROW = undefined;
export let FACEMESH_LEFT_IRIS = undefined;
export let FACEMESH_RIGHT_EYE = undefined;
export let FACEMESH_RIGHT_EYEBROW = undefined;
export let FACEMESH_RIGHT_IRIS = undefined;
export let FACEMESH_LIPS = undefined;
export let FACEMESH_TESSELATION = undefined;

export function updateGlobals() {
  if (typeof window !== 'undefined') {
    FaceMesh = window.FaceMesh;
    FACEMESH_CONTOURS = window.FACEMESH_CONTOURS;
    FACEMESH_FACE_OVAL = window.FACEMESH_FACE_OVAL;
    FACEMESH_LEFT_EYE = window.FACEMESH_LEFT_EYE;
    FACEMESH_LEFT_EYEBROW = window.FACEMESH_LEFT_EYEBROW;
    FACEMESH_LEFT_IRIS = window.FACEMESH_LEFT_IRIS;
    FACEMESH_RIGHT_EYE = window.FACEMESH_RIGHT_EYE;
    FACEMESH_RIGHT_EYEBROW = window.FACEMESH_RIGHT_EYEBROW;
    FACEMESH_RIGHT_IRIS = window.FACEMESH_RIGHT_IRIS;
    FACEMESH_LIPS = window.FACEMESH_LIPS;
    FACEMESH_TESSELATION = window.FACEMESH_TESSELATION;
  }
}

export default {
  get FaceMesh() { return FaceMesh; },
  get FACEMESH_CONTOURS() { return FACEMESH_CONTOURS; },
  get FACEMESH_FACE_OVAL() { return FACEMESH_FACE_OVAL; },
  get FACEMESH_LEFT_EYE() { return FACEMESH_LEFT_EYE; },
  get FACEMESH_LEFT_EYEBROW() { return FACEMESH_LEFT_EYEBROW; },
  get FACEMESH_LEFT_IRIS() { return FACEMESH_LEFT_IRIS; },
  get FACEMESH_RIGHT_EYE() { return FACEMESH_RIGHT_EYE; },
  get FACEMESH_RIGHT_EYEBROW() { return FACEMESH_RIGHT_EYEBROW; },
  get FACEMESH_RIGHT_IRIS() { return FACEMESH_RIGHT_IRIS; },
  get FACEMESH_LIPS() { return FACEMESH_LIPS; },
  get FACEMESH_TESSELATION() { return FACEMESH_TESSELATION; },
  updateGlobals,
};
