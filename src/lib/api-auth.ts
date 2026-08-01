/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import { auth } from '@clerk/nextjs/server';
import { getAuthenticatedConvex } from './gemini-key-resolver';
import { api } from '../../convex/_generated/api';
import { NextResponse } from 'next/server';

export interface AuthCheckResult {
    authorized: boolean;
    userId: string | null;
    userSettings?: any;
    errorResponse?: NextResponse;
}

/**
 * Checks if the caller is authenticated and has an active subscription/trial.
 * Optionally validates a minimum required plan tier (standard, professional, enterprise).
 */
export async function checkApiAuth(requiredPlan?: 'standard' | 'professional' | 'enterprise'): Promise<AuthCheckResult> {
    const isLocalDevelopment = process.env.NODE_ENV !== 'production' || process.env.LOCAL_DEV_BYPASS_AUTH === 'true';
    const { userId, sessionClaims } = await auth();

    if (!userId && !isLocalDevelopment) {
        return {
            authorized: false,
            userId: null,
            errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        };
    }

    const effectiveUserId = userId || 'local-dev-user';

    // Resolve admin status from Clerk claims alone — no Convex round-trip needed.
    const adminIds = (process.env.ADMIN_USER_IDS || "").split(",").map(id => id.trim()).filter(Boolean);
    const claims = sessionClaims as any;
    const role = (claims?.metadata?.role || claims?.publicMetadata?.role || claims?.role || "").toString().toLowerCase();
    const isAdmin = adminIds.includes(effectiveUserId) || ["admin", "owner", "superadmin"].includes(role);
    const isDevOrAdmin = isLocalDevelopment || isAdmin;

    // Admins and dev environments bypass the subscription check entirely.
    if (isDevOrAdmin && !requiredPlan) {
        return { authorized: true, userId: effectiveUserId };
    }

    try {
        const client = await getAuthenticatedConvex();
        const userSettings = await client.query(api.userSettings.get, { userId });
        const isSubscribed = userSettings?.isSubscribed || false;
        const isTrialActive = userSettings?.isTrialActive && userSettings?.trialEndsAt && userSettings.trialEndsAt > Date.now();

        if (!isSubscribed && !isTrialActive && !isDevOrAdmin) {
            return {
                authorized: false,
                userId,
                errorResponse: NextResponse.json({ error: 'Subscription required' }, { status: 403 })
            };
        }

        if (requiredPlan && !isDevOrAdmin) {
            const userPlan = userSettings?.plan || 'standard';
            const plans = ['standard', 'professional', 'enterprise'];
            if (plans.indexOf(userPlan) < plans.indexOf(requiredPlan)) {
                return {
                    authorized: false,
                    userId,
                    errorResponse: NextResponse.json({
                        error: `Plan upgrade required. This feature requires a ${requiredPlan} plan.`
                    }, { status: 403 })
                };
            }
        }

        return {
            authorized: true,
            userId: effectiveUserId,
            userSettings
        };
    } catch (e) {
        console.error('API auth check error:', e);
        // If the Convex query fails but the user is an admin, still allow through.
        if (isDevOrAdmin) {
            return { authorized: true, userId: effectiveUserId };
        }
        return {
            authorized: false,
            userId: effectiveUserId,
            errorResponse: NextResponse.json({ error: 'Internal auth service error' }, { status: 500 })
        };
    }
}
