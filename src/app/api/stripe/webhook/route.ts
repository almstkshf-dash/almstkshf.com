export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';

// Stripe webhook secret (required in production)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
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
                const { ConvexHttpClient } = await import('convex/browser');
                const { api } = await import('../../../../../convex/_generated/api');
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

            case 'checkout.session.async_payment_succeeded': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log('✅ Async payment successful:', session.id);

                // TODO: Fulfill the purchase

                break;
            }

            case 'checkout.session.async_payment_failed': {
                const session = event.data.object as Stripe.Checkout.Session;
                console.log('❌ Async payment failed:', session.id);

                // TODO: Handle failed payment
                // - Send notification email
                // - Log the failure

                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log('✅ PaymentIntent successful:', paymentIntent.id);
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log('❌ PaymentIntent failed:', paymentIntent.id);
                break;
            }

            case 'customer.subscription.created':
            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('📝 Subscription updated:', subscription.id);

                const { ConvexHttpClient } = await import('convex/browser');
                const { api } = await import('../../../../../convex/_generated/api');
                const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

                const userId = subscription.metadata?.userId;
                if (!userId) {
                    console.error('❌ No userId found in subscription metadata:', subscription.id);
                    break;
                }

                await convex.mutation(api.payments.syncSubscription, {
                    userId,
                    stripeSubscriptionId: subscription.id,
                    stripePriceId: subscription.items.data[0].price.id,
                    stripeCustomerId: subscription.customer as string,
                    status: subscription.status,
                    currentPeriodEnd: subscription.current_period_end * 1000, // Stripe uses seconds
                    cancelAtPeriodEnd: subscription.cancel_at_period_end,
                });

                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                console.log('🗑️ Subscription cancelled:', subscription.id);

                const { ConvexHttpClient } = await import('convex/browser');
                const { api } = await import('../../../../../convex/_generated/api');
                const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

                const userId = subscription.metadata?.userId;
                if (userId) {
                    await convex.mutation(api.payments.syncSubscription, {
                        userId,
                        stripeSubscriptionId: subscription.id,
                        stripePriceId: subscription.items.data[0].price.id,
                        stripeCustomerId: subscription.customer as string,
                        status: 'canceled',
                        currentPeriodEnd: subscription.current_period_end * 1000,
                        cancelAtPeriodEnd: true,
                    });
                }

                break;
            }

            case 'invoice.paid': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log('✅ Invoice paid:', invoice.id);
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                console.log('❌ Invoice payment failed:', invoice.id);

                // For subscriptions, this will eventually trigger customer.subscription.updated with status 'unpaid' or 'past_due'
                // But we can proactively log or notify here if needed.

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
