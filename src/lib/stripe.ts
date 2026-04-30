/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

import 'server-only';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    console.error('CRITICAL: STRIPE_SECRET_KEY is missing from environment variables.');
    throw new Error('STRIPE_SECRET_KEY is not set. Please add it to your environment variables.');
}

// Initialize Stripe with a standard stable API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    // @ts-expect-error - using latest acacia version not in types
    apiVersion: '2025-01-27.acacia',
    typescript: true,
});

// Helper function to format amount for Stripe (convert to cents)
export function formatAmountForStripe(amount: number, currency: string): number {
    const numberFormat = new Intl.NumberFormat(['en-US'], {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'symbol',
    });

    const parts = numberFormat.formatToParts(amount);
    let zeroDecimalCurrency = true;

    for (const part of parts) {
        if (part.type === 'decimal') {
            zeroDecimalCurrency = false;
        }
    }

    return zeroDecimalCurrency ? amount : Math.round(amount * 100);
}

// Helper function to format amount from Stripe (convert from cents)
export function formatAmountFromStripe(amount: number, currency: string): number {
    const numberFormat = new Intl.NumberFormat(['en-US'], {
        style: 'currency',
        currency: currency,
        currencyDisplay: 'symbol',
    });

    const parts = numberFormat.formatToParts(amount);
    let zeroDecimalCurrency = true;

    for (const part of parts) {
        if (part.type === 'decimal') {
            zeroDecimalCurrency = false;
        }
    }

    return zeroDecimalCurrency ? amount : amount / 100;
}
