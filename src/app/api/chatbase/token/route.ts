/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { rateLimit } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const limit = await rateLimit(`chatbase:token:${ip}`, 60, 60);
        if (!limit.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(limit.resetSeconds) } }
            );
        }

        const secret = process.env.CHATBOT_IDENTITY_SECRET;

        if (!secret) {
            return NextResponse.json(
                { error: 'Chatbot identity secret not configured' },
                { status: 500 }
            );
        }

        // For now, we'll create a guest/anonymous user token
        const sessionId = request.cookies.get('session_id')?.value || generateSessionId();

        // Get user info from your auth system
        const userPayload = {
            user_id: sessionId,
            email: 'guest@almstkshf.com',
            is_guest: true,
        };

        // Generate JWT token
        const token = jwt.sign(userPayload, secret, { expiresIn: '1h' });

        // Set session cookie if it doesn't exist
        const response = NextResponse.json(
            { token },
            {
                headers: {
                    "Cache-Control": "private, max-age=0, must-revalidate",
                },
            }
        );

        try {
            if (!request.cookies.get('session_id')) {
                response.cookies.set('session_id', sessionId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                });
            }
        } catch (cookieError) {
            console.warn('Error setting session cookie:', cookieError);
        }

        return response;
    } catch (error: any) {
        console.error('Error generating chatbase token:', error);
        return NextResponse.json(
            { error: 'Failed to generate token', details: error.message },
            { status: 500 }
        );
    }
}

function generateSessionId(): string {
    const rand = typeof crypto?.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    return `guest_${Date.now()}_${rand}`;
}
