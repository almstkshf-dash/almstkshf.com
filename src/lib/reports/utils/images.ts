/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { isSafeUrl } from '@/utils/ssrf';

/**
 * Safely fetches an image and converts it into a Base64 data URL.
 * Prevents SSRF attacks by running the URL through the DNS-backed isSafeUrl guard.
 * Reads public files directly from the local disk when running on the server.
 */
export async function fetchImageAsBase64(imageUrl: string): Promise<string | null> {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('data:')) return imageUrl;

    const formattedUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
    
    // Enforce SSRF protection for outbound network requests
    if (formattedUrl.startsWith('http')) {
        const isSafe = await isSafeUrl(formattedUrl);
        if (!isSafe) {
            console.warn(`[SSRF Guard] Blocked unsafe image fetch for report: ${formattedUrl}`);
            return null;
        }
    }

    try {
        const isRelative = !formattedUrl.startsWith('http');
        if (isRelative && typeof window === 'undefined') {
            const fs = eval('require')('fs');
            const path = eval('require')('path');
            
            // Clean up relative path query params/hashes if any
            const cleanRelPath = formattedUrl.split('?')[0].split('#')[0];
            const localPath = path.join(
                process.cwd(), 
                'public', 
                cleanRelPath.startsWith('/') ? cleanRelPath.substring(1) : cleanRelPath
            );
            
            if (fs.existsSync(localPath)) {
                const fileBuffer = fs.readFileSync(localPath);
                const ext = path.extname(localPath).toLowerCase();
                const contentType = ext === '.png' ? 'image/png' : ext === '.svg' ? 'image/svg+xml' : 'image/jpeg';
                return `data:${contentType};base64,${fileBuffer.toString('base64')}`;
            }
        }

        // On the client or fallback to external HTTP fetch
        const response = await fetch(formattedUrl);
        if (!response.ok) return null;

        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        let base64 = '';
        if (typeof Buffer !== 'undefined') {
            base64 = Buffer.from(buffer).toString('base64');
        } else {
            const bytes = new Uint8Array(buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            base64 = btoa(binary);
        }
        return `data:${contentType};base64,${base64}`;
    } catch (err) {
        console.warn('Failed to load image as base64:', imageUrl, err);
        return null;
    }
}
