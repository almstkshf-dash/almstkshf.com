/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkApiAuth } from '@/lib/api-auth';
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit';
import { ReportGenerator } from '@/lib/reports';
import { put } from '@vercel/blob';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const auth = await checkApiAuth();
        if (!auth.authorized) {
            return auth.errorResponse!;
        }

        const rlKey = await getRateLimitKey(req, 'reports:generate', auth.userId);
        const limit = await rateLimit(rlKey, 10, 60); // Max 10 report generations per minute per user
        if (!limit.allowed) {
            return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
        }

        const body = await req.json();
        const { 
            jobId, 
            reportType, 
            format, 
            payload, 
            translations, 
            logoUrl, 
            chartImages, 
            searchKeyword, 
            customTitle 
        } = body;

        if (!reportType || !format || !payload || !translations) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        // Set Convex background job status to processing
        if (jobId) {
            await convex.mutation(api.reportJobs.updateReportJobStatus, {
                jobId,
                status: 'processing'
            });
        }

        let fileBuffer: Buffer;
        let contentType = 'application/octet-stream';
        let extension = format;

        // Perform Server-Side generation
        try {
            if (reportType === 'media_monitoring') {
                if (format === 'excel') {
                    const blob = await ReportGenerator.exportMediaMonitoringReport(
                        payload, 
                        translations, 
                        'excel', 
                        logoUrl, 
                        undefined, 
                        undefined, 
                        customTitle, 
                        true
                    );
                    fileBuffer = Buffer.from(await (blob as Blob).arrayBuffer());
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    extension = 'xlsx';
                } else {
                    const doc = await ReportGenerator.exportMediaMonitoringReport(
                        payload, 
                        translations, 
                        'pdf', 
                        logoUrl, 
                        chartImages, 
                        searchKeyword, 
                        customTitle, 
                        true
                    );
                    fileBuffer = Buffer.from((doc as any).output('arraybuffer'));
                    contentType = 'application/pdf';
                    extension = 'pdf';
                }
            } else if (reportType === 'press_release') {
                if (format === 'excel') {
                    const blob = await ReportGenerator.exportPressReleaseReport(payload, translations, 'excel', true);
                    fileBuffer = Buffer.from(await (blob as Blob).arrayBuffer());
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    extension = 'xlsx';
                } else if (format === 'csv') {
                    const generator = new ReportGenerator(payload, translations);
                    const blob = generator.generateCSV();
                    fileBuffer = Buffer.from(await blob.arrayBuffer());
                    contentType = 'text/csv';
                    extension = 'csv';
                } else {
                    const doc = await ReportGenerator.exportPressReleaseReport(payload, translations, 'pdf', true);
                    fileBuffer = Buffer.from((doc as any).output('arraybuffer'));
                    contentType = 'application/pdf';
                    extension = 'pdf';
                }
            } else if (reportType === 'deep_web') {
                const { runs, threats } = payload;
                if (format === 'excel') {
                    const blob = await ReportGenerator.exportDeepWebReport(runs, threats, translations, 'excel', true);
                    fileBuffer = Buffer.from(await (blob as Blob).arrayBuffer());
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    extension = 'xlsx';
                } else {
                    const doc = await ReportGenerator.exportDeepWebReport(runs, threats, translations, 'pdf', true);
                    fileBuffer = Buffer.from((doc as any).output('arraybuffer'));
                    contentType = 'application/pdf';
                    extension = 'pdf';
                }
            } else if (reportType === 'dark_web') {
                if (format === 'excel') {
                    const blob = await ReportGenerator.exportDarkWebReport(payload, translations, 'excel', true);
                    fileBuffer = Buffer.from(await (blob as Blob).arrayBuffer());
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    extension = 'xlsx';
                } else {
                    const doc = await ReportGenerator.exportDarkWebReport(payload, translations, 'pdf', true);
                    fileBuffer = Buffer.from((doc as any).output('arraybuffer'));
                    contentType = 'application/pdf';
                    extension = 'pdf';
                }
            } else if (reportType === 'osint') {
                if (format === 'excel') {
                    const blob = await ReportGenerator.exportOsintReport(payload, translations, 'excel', true);
                    fileBuffer = Buffer.from(await (blob as Blob).arrayBuffer());
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    extension = 'xlsx';
                } else {
                    const doc = await ReportGenerator.exportOsintReport(payload, translations, 'pdf', true);
                    fileBuffer = Buffer.from((doc as any).output('arraybuffer'));
                    contentType = 'application/pdf';
                    extension = 'pdf';
                }
            } else if (reportType === 'watchlist') {
                if (format === 'excel') {
                    const blob = await ReportGenerator.exportTerroristListReport(payload, translations, 'excel', true);
                    fileBuffer = Buffer.from(await (blob as Blob).arrayBuffer());
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    extension = 'xlsx';
                } else {
                    const doc = await ReportGenerator.exportTerroristListReport(payload, translations, 'pdf', true);
                    fileBuffer = Buffer.from((doc as any).output('arraybuffer'));
                    contentType = 'application/pdf';
                    extension = 'pdf';
                }
            } else if (reportType === 'ai_inspector') {
                const { mode, data } = payload;
                if (format === 'excel') {
                    const blob = await ReportGenerator.exportAiInspectorReport(mode, data, translations, 'excel', true);
                    fileBuffer = Buffer.from(await (blob as Blob).arrayBuffer());
                    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                    extension = 'xlsx';
                } else {
                    const doc = await ReportGenerator.exportAiInspectorReport(mode, data, translations, 'pdf', true);
                    fileBuffer = Buffer.from((doc as any).output('arraybuffer'));
                    contentType = 'application/pdf';
                    extension = 'pdf';
                }
            } else {
                throw new Error(`Unsupported report type: ${reportType}`);
            }
        } catch (genErr) {
            console.error('Report generation error:', genErr);
            if (jobId) {
                await convex.mutation(api.reportJobs.updateReportJobStatus, {
                    jobId,
                    status: 'failed',
                    error: genErr instanceof Error ? genErr.message : String(genErr)
                });
            }
            return NextResponse.json({ error: 'Report generation failed', details: String(genErr) }, { status: 500 });
        }

        // Upload output file to Vercel Blob (or fallback to base64 data URL if token is missing)
        try {
            let url: string;

            if (process.env.BLOB_READ_WRITE_TOKEN) {
                const filename = `reports/${auth.userId}/${reportType}-${Date.now()}.${extension}`;
                const blobResult = await put(filename, fileBuffer, {
                    access: 'public',
                    contentType,
                });
                url = blobResult.url;
            } else {
                console.warn('⚠️ [Reports API] BLOB_READ_WRITE_TOKEN is not configured. Falling back to base64 Data URL.');
                const base64 = fileBuffer.toString('base64');
                url = `data:${contentType};base64,${base64}`;
            }

            // Mark Convex background job as completed
            if (jobId) {
                await convex.mutation(api.reportJobs.updateReportJobStatus, {
                    jobId,
                    status: 'completed',
                    url
                });
            }

            return NextResponse.json({ success: true, url });
        } catch (uploadErr) {
            console.error('Vercel Blob upload error:', uploadErr);
            if (jobId) {
                await convex.mutation(api.reportJobs.updateReportJobStatus, {
                    jobId,
                    status: 'failed',
                    error: 'Upload to storage failed'
                });
            }
            return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 });
        }
    } catch (e) {
        console.error('Reports API handler exception:', e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
