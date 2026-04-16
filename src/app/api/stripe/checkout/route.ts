/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getStripeProduct } from '@/lib/stripe-products';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    try {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
        const limit = await rateLimit(`stripe:checkout:${ip}`, 20, 60);
        if (!limit.allowed) {
            return NextResponse.json(
                { error: 'Rate limit exceeded' },
                { status: 429, headers: { 'Retry-After': String(limit.resetSeconds) } }
            );
        }

        const body = await request.json();
        const { productId, userId } = body;

        // Validate required fields
        if (!productId) {
            return NextResponse.json(
                { error: 'productId is required' },
                { status: 400 }
            );
        }

        let product;
        try {
            product = getStripeProduct(productId);
        } catch {
            return NextResponse.json(
                { error: 'Invalid productId' },
                { status: 400 }
            );
        }
        const baseUrl = process.env.APP_URL || request.headers.get('origin');
        if (!baseUrl) {
            return NextResponse.json(
                { error: 'APP_URL is not configured' },
                { status: 500 }
            );
        }

        // Create Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            client_reference_id: userId || undefined,
            line_items: [
                {
                    price_data: {
                        currency: product.currency,
                        product_data: {
                            name: product.name,
                            description: product.description,
                        },
                        unit_amount: product.priceInCents,
                    },
                    quantity: 1,
                },
            ],
            success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/payment/cancelled`,
            metadata: {
                productId: product.id,
                amount: product.priceInCents.toString(),
                currency: product.currency,
                userId: userId || '',
            },
        });

        return NextResponse.json({
            sessionId: checkoutSession.id,
            url: checkoutSession.url,
        });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
