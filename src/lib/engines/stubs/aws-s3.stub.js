/**
 * @aws-sdk/client-s3 — Turbopack/Webpack build-time stub
 *
 * unzipper conditionally requires @aws-sdk/client-s3 for S3 extraction support,
 * which causes Next.js/Turbopack to fail during static analysis since it's not installed.
 *
 * This stub satisfies the import so the build succeeds.
 */

export const GetObjectCommand = undefined;
export const HeadObjectCommand = undefined;
export default {};
