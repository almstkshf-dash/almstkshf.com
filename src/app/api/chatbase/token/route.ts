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
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    try {
        const rlKey = await getRateLimitKey(request, 'chatbase:token');
        const limit = await rateLimit(rlKey, 60, 60);
        if (!limit.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(limit.resetSeconds) } }
            );
        }

        const secret = process.env.CHATBOT_IDENTITY_SECRET;

        if (!secret) {
            return NextResponse.json(
                { token: null, error: 'Chatbot identity secret not configured', is_guest: true },
                {
                    status: 200,
                    headers: {
                        "Cache-Control": "private, max-age=0, must-revalidate",
                    },
                }
            );
        }

        // Check user authentication via Clerk
        const authData = await auth();
        const userId = authData?.userId;

        // If the user is not logged in, return token: null to prevent Chatbase verify-token 400 errors
        if (!userId) {
            return NextResponse.json(
                { token: null, is_guest: true },
                {
                    headers: {
                        "Cache-Control": "private, max-age=0, must-revalidate",
                    },
                }
            );
        }

        // Retrieve the current user details for the JWT payload
        const user = await currentUser();
        if (!user) {
            return NextResponse.json(
                { token: null, is_guest: true },
                {
                    headers: {
                        "Cache-Control": "private, max-age=0, must-revalidate",
                    },
                }
            );
        }

        const userPayload = {
            user_id: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            is_guest: false,
        };

        // Generate JWT token signed with the secret key
        const token = jwt.sign(userPayload, secret, { expiresIn: '1h' });

        return NextResponse.json(
            { token, is_guest: false },
            {
                headers: {
                    "Cache-Control": "private, max-age=0, must-revalidate",
                },
            }
        );
    } catch (error: unknown) {
        console.error('Error generating chatbase token:', error);
        return NextResponse.json(
            { error: 'Failed to generate token', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

