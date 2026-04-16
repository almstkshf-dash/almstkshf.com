/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

// Type declaration for the jsPDF UMD fallback bundle used in exportUtils.ts
declare module 'jspdf/dist/jspdf.umd.min.js' {
    export * from 'jspdf';
    export { jsPDF } from 'jspdf';
}
