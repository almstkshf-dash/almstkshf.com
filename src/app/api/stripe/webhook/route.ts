/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '../../../../lib/stripe';
import Stripe from 'stripe';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../../convex/_generated/api';
import { rateLimit, getRateLimitKey } from '@/lib/rateLimit';

// Stripe webhook secret (required in production)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    const rlKey = await getRateLimitKey(request, 'stripe:webhook');
    const limitResult = await rateLimit(rlKey, 100, 60);
    if (!limitResult.allowed) {
        return NextResponse.json(
            { error: 'Rate limit exceeded' },
            { status: 429, headers: { 'Retry-After': String(limitResult.resetSeconds) } }
        );
    }

    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'No signature provided' },
            { status: 400 }
        );
    }

    if (!webhookSecret) {
        const isProd = process.env.NODE_ENV === 'production';
        if (isProd) {
            console.error('CRITICAL: STRIPE_WEBHOOK_SECRET is missing in production.');
            return NextResponse.json(
                { error: 'Webhook secret not configured' },
                { status: 500 }
            );
        }
    }

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        if (!webhookSecret) {
            // Allow local development without signature verification
            event = JSON.parse(body);
        } else {
            event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        }
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return NextResponse.json(
            { error: 'Webhook signature verification failed' },
            { status: 400 }
        );
    }

    // Handle the event
    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log('✅ Payment successful:', session.id);

                // Initialize Convex Client
                const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

                // Record the payment in Convex
                await convex.mutation(api.payments.recordPayment, {
                    stripeSessionId: session.id,
                    userId: session.client_reference_id || session.metadata?.userId,
                    amount: (session.amount_total || 0) / 100, // Convert back from cents
                    currency: session.currency || 'usd',
                    status: 'paid',
                    productName: session.metadata?.productName || 'Default Product',
                    customerEmail: session.customer_details?.email || undefined,
                });

                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('📋 Subscription updated:', subscription.id);

                const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

                const userId = subscription.metadata?.userId;
                if (!userId) {
                    console.error('❌ No userId found in subscription metadata:', subscription.id);
                    break;
                }

                const plan = subscription.metadata?.planId as "standard" | "professional" | "enterprise" | undefined;

                await convex.mutation(api.payments.syncSubscription, {
                    userId,
                    stripeSubscriptionId: subscription.id,
                    stripePriceId: subscription.items.data[0].price.id,
                    stripeCustomerId: subscription.customer as string,
                    status: subscription.status,
                    currentPeriodEnd: ((subscription as unknown as { current_period_end?: number }).current_period_end ?? 0) * 1000,
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                    plan: plan,
                });

                // Trigger email notification via Convex Action
                try {
                    if (subscription.status === 'active' || subscription.status === 'trialing') {
                        let customerEmail = "";
                        try {
                            const customer = await stripe.customers.retrieve(subscription.customer as string);
                            if (customer && !customer.deleted) {
                                customerEmail = customer.email || "";
                            }
                        } catch (err) {
                            console.error("Failed to retrieve customer for email:", err);
                        }

                        await convex.action(api.emails.sendSubscriptionEmail as any, {
                            to: customerEmail,
                            subject: subscription.status === 'trialing' ? "Welcome to your 15-day Free Trial!" : "Your Almstkshf Subscription is Active!",
                            userName: (subscription.metadata as any)?.userName || "Subscriber",
                            planName: (subscription.metadata as any)?.planName || "Selected Plan",
                            type: "activation",
                        } as any);
                    }
                } catch (emailErr) {
                    console.error("Failed to send subscription email:", emailErr);
                }

                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('🗑️ Subscription cancelled:', subscription.id);

                const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

                const userId = subscription.metadata?.userId;
                if (userId) {
                    await convex.mutation(api.payments.syncSubscription, {
                        userId,
                        stripeSubscriptionId: subscription.id,
                        stripePriceId: subscription.items.data[0].price.id,
                        stripeCustomerId: subscription.customer as string,
                        status: 'canceled',
                        currentPeriodEnd: ((subscription as unknown as { current_period_end?: number }).current_period_end ?? 0) * 1000,
                        cancelAtPeriodEnd: true,
                    });
                }

                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log('❌ Invoice payment failed:', invoice.id);

                const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

                let userId = invoice.metadata?.userId;

                if (!userId && (invoice as unknown as { subscription?: string }).subscription) {
                    try {
                        const sub = await stripe.subscriptions.retrieve((invoice as unknown as { subscription: string }).subscription);
                        userId = sub.metadata.userId;
                    } catch (e) {
                        console.error("Failed to fetch subscription for invoice fail", e);
                    }
                }

                if (userId) {
                    await convex.mutation(api.payments.createBillingNotification, {
                        userId: userId as string,
                        title: "Payment Failed",
                        message: `Payment failed for your subscription. Please update your billing info to avoid service interruption.`,
                    });
                }

                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error('Error processing webhook:', err);
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
