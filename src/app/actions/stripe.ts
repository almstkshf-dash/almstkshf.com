'use server';

import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { getStripeProduct } from '@/lib/stripe-products';
import { auth } from '@clerk/nextjs/server';

export type Product = ReturnType<typeof getStripeProduct>;

/**
 * Create an embedded checkout session
 * Returns the client secret for the checkout session
 */
export async function startCheckoutSession(productId: string): Promise<string> {
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
