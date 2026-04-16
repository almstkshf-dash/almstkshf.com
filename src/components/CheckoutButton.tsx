/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

"use client";

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { getStripe } from '@/lib/stripe-client';
import { useAuth } from '@clerk/nextjs';
import Button from '@/components/ui/Button';

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
        <Button
            onClick={handleCheckout}
            isLoading={loading}
            className={clsx("h-auto", className)}
        >
            {loading ? 'Processing...' : children}
        </Button>
    );
}
