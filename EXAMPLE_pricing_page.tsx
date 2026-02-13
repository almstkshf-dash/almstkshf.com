"use client";

import Container from '@/components/ui/Container';
import CheckoutButton from '@/components/CheckoutButton';
import { Check } from 'lucide-react';

const pricingPlans = [
    {
        name: 'Basic',
        price: 29,
        currency: 'usd',
        description: 'Perfect for small businesses',
        features: [
            'Media Monitoring',
            'Basic Analytics',
            'Email Reports',
            '24/7 Support',
            '10 Users',
        ],
    },
    {
        name: 'Professional',
        price: 99,
        currency: 'usd',
        description: 'For growing organizations',
        features: [
            'Everything in Basic',
            'Advanced Analytics',
            'Custom Reports',
            'API Access',
            'Unlimited Users',
            'Priority Support',
        ],
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 299,
        currency: 'usd',
        description: 'For large enterprises',
        features: [
            'Everything in Professional',
            'Custom Integration',
            'Dedicated Account Manager',
            'SLA Guarantee',
            'White Label Options',
            'Custom Training',
        ],
    },
];

export default function PricingExamplePage() {
    return (
        <main className="min-h-screen bg-slate-950 py-20">
            <Container>
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-slate-400">
                        Choose the perfect plan for your needs
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {pricingPlans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative bg-slate-900 border ${plan.popular
                                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20'
                                    : 'border-slate-800'
                                } rounded-3xl p-8 flex flex-col`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold text-white mb-2">
                                    {plan.name}
                                </h3>
                                <p className="text-slate-400 text-sm">
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold text-white">
                                        ${plan.price}
                                    </span>
                                    <span className="text-slate-400">/month</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8 flex-grow">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-start gap-3">
                                        <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-slate-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <CheckoutButton
                                amount={plan.price}
                                currency={plan.currency}
                                productName={`${plan.name} Plan`}
                                productDescription={plan.features.join(', ')}
                                className="w-full"
                            >
                                Get Started
                            </CheckoutButton>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-slate-400 mb-4">
                        All plans include a 14-day free trial. No credit card required.
                    </p>
                    <p className="text-slate-500 text-sm">
                        Need a custom plan? <a href="/en/contact" className="text-blue-400 hover:text-blue-300">Contact us</a>
                    </p>
                </div>
            </Container>
        </main>
    );
}
