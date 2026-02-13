import { NextRequest, NextResponse } from 'next/server';
import { stripe, formatAmountForStripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, currency = 'usd', productName, productDescription } = body;

        // Validate required fields
        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        if (!productName) {
            return NextResponse.json(
                { error: 'Product name is required' },
                { status: 400 }
            );
        }

        // Create Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: {
                            name: productName,
                            description: productDescription || '',
                        },
                        unit_amount: formatAmountForStripe(amount, currency),
                    },
                    quantity: 1,
                },
            ],
            success_url: `${request.headers.get('origin')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get('origin')}/payment/cancelled`,
            metadata: {
                productName,
                amount: amount.toString(),
                currency,
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
