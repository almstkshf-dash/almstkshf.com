'use client';

import { useCallback } from 'react';
import {
    EmbeddedCheckout,
    EmbeddedCheckoutProvider
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { startCustomCheckoutSession } from '@/app/actions/stripe';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CustomEmbeddedCheckoutProps {
    productName: string;
    productDescription: string;
    amount: number;
    currency?: string;
}

export default function CustomEmbeddedCheckout({
    productName,
    productDescription,
    amount,
    currency = 'usd',
}: CustomEmbeddedCheckoutProps) {
    const fetchClientSecret = useCallback(
        () => startCustomCheckoutSession(productName, productDescription, amount, currency),
        [productName, productDescription, amount, currency]
    );

    return (
        <div id="checkout" className="w-full">
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ fetchClientSecret }}
            >
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    );
}
