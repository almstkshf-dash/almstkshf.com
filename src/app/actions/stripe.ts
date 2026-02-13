'use server';

import { stripe, formatAmountForStripe } from '@/lib/stripe';

export interface Product {
    id: string;
    name: string;
    description: string;
    priceInCents: number;
    currency?: string;
}

// Example product catalog - Replace with your actual product lookup
async function getProduct(productId: string): Promise<Product> {
    // TODO: Replace with your actual product database/catalog lookup
    const products: Record<string, Product> = {
        'basic-plan': {
            id: 'basic-plan',
            name: 'Basic Plan',
            description: 'Perfect for small businesses',
            priceInCents: 2900, // $29.00
            currency: 'usd',
        },
        'pro-plan': {
            id: 'pro-plan',
            name: 'Professional Plan',
            description: 'For growing organizations',
            priceInCents: 9900, // $99.00
            currency: 'usd',
        },
        'enterprise-plan': {
            id: 'enterprise-plan',
            name: 'Enterprise Plan',
            description: 'For large enterprises',
            priceInCents: 29900, // $299.00
            currency: 'usd',
        },
    };

    const product = products[productId];

    if (!product) {
        throw new Error(`Product not found: ${productId}`);
    }

    return product;
}

/**
 * Create an embedded checkout session
 * Returns the client secret for the checkout session
 */
export async function startCheckoutSession(productId: string): Promise<string> {
    try {
        // Get product details
        const product = await getProduct(productId);

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
