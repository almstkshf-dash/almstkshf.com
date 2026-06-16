/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

'use server';

import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { getStripeProduct } from '@/lib/stripe-products';
import { auth } from '@clerk/nextjs/server';
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit';

export type Product = ReturnType<typeof getStripeProduct>;

/**
 * Create an embedded checkout session
 * Returns the client secret for the checkout session
 */
export async function startCheckoutSession(productId: string): Promise<string> {
    const rlKey = await getRateLimitKey(null, 'action:stripe-checkout');
    const limitResult = await rateLimit(rlKey, 15, 60);
    if (!limitResult.allowed) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
    }

    try {
        // Get product details
        const product = getStripeProduct(productId);

        // Create Checkout Session with embedded UI
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            redirect_on_completion: 'never',
            line_items: [
                {
                    price_data: {
                        currency: product.currency || 'usd',
                        product_data: {
                            name: product.name,
                            description: product.description,
                        },
                        unit_amount: product.priceInCents,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: {
                productId: product.id,
                userId: (await auth()).userId || null,
            },
        });

        if (!session.client_secret) {
            throw new Error('Failed to create checkout session');
        }

        return session.client_secret;
    } catch (error) {
        console.error('Error creating checkout session:', error);
        throw error;
    }
}

/**
 * Create a checkout session with custom product details
 */
export async function startCustomCheckoutSession(
    productName: string,
    productDescription: string,
    amount: number,
    currency: string = 'usd'
): Promise<string> {
    const rlKey = await getRateLimitKey(null, 'action:stripe-custom-checkout');
    const limitResult = await rateLimit(rlKey, 15, 60);
    if (!limitResult.allowed) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
    }

    try {
        const session = await stripe.checkout.sessions.create({
            ui_mode: 'embedded',
            redirect_on_completion: 'never',
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: productName,
                            description: productDescription,
                        },
                        unit_amount: formatAmountForStripe(amount, currency),
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: {
                productName,
                amount: amount.toString(),
                currency,
                userId: (await auth()).userId || null,
            },
        });

        if (!session.client_secret) {
            throw new Error('Failed to create checkout session');
        }

        return session.client_secret;
    } catch (error) {
        console.error('Error creating custom checkout session:', error);
        throw error;
    }
}

/**
 * Get the status of a checkout session
 */
export async function getCheckoutSessionStatus(sessionId: string) {
    const rlKey = await getRateLimitKey(null, 'action:stripe-status');
    const limitResult = await rateLimit(rlKey, 30, 60);
    if (!limitResult.allowed) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        return {
            status: session.status,
            customer_email: session.customer_details?.email,
            payment_status: session.payment_status,
        };
    } catch (error) {
        console.error('Error retrieving session status:', error);
        throw error;
    }
}
