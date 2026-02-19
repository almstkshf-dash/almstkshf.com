"use client";

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getStripe } from '@/lib/stripe-client';
import { useAuth } from '@clerk/nextjs';

interface CheckoutButtonProps {
    productId: string;
    className?: string;
    children?: React.ReactNode;
}

export default function CheckoutButton({
    productId,
    className = '',
    children = 'Checkout',
}: CheckoutButtonProps) {
    const [loading, setLoading] = useState(false);
    const { userId } = useAuth();

    const handleCheckout = async () => {
        setLoading(true);

        try {
            // Create checkout session
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId,
                    userId,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create checkout session');
            }

            // Redirect to Stripe Checkout URL
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white rounded-xl font-semibold transition-all disabled:cursor-not-allowed ${className}`}
        >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            {loading ? 'Processing...' : children}
        </button>
    );
}
