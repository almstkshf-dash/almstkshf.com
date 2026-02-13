"use client";

import { useState } from 'react';
import Container from '@/components/ui/Container';
import EmbeddedCheckoutComponent from '@/components/EmbeddedCheckout';
import CustomEmbeddedCheckout from '@/components/CustomEmbeddedCheckout';
import { Check, ArrowLeft } from 'lucide-react';

const pricingPlans = [
    {
        id: 'basic-plan',
        name: 'Basic Plan',
        price: 29,
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
        id: 'pro-plan',
        name: 'Professional Plan',
        price: 99,
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
        id: 'enterprise-plan',
        name: 'Enterprise Plan',
        price: 299,
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

export default function EmbeddedCheckoutExamplePage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    const handleSelectPlan = (planId: string) => {
        setSelectedPlan(planId);
    };

    const handleBack = () => {
        setSelectedPlan(null);
    };

    if (selectedPlan) {
        const plan = pricingPlans.find(p => p.id === selectedPlan);

        return (
            <main className="min-h-screen bg-slate-950 py-20">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to plans
                        </button>

                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">
                                {plan?.name}
                            </h2>
                            <p className="text-slate-400 mb-4">
                                {plan?.description}
                            </p>
                            <div className="text-4xl font-bold text-white">
                                ${plan?.price} <span className="text-lg text-slate-400">/ month</span>
                            </div>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                            <h3 className="text-xl font-bold text-white mb-6">
                                Complete your purchase
                            </h3>

                            {/* Embedded Checkout */}
                            <EmbeddedCheckoutComponent productId={selectedPlan} />
                        </div>
                    </div>
                </Container>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-950 py-20">
            <Container>
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Embedded Checkout Demo
                    </h1>
                    <p className="text-xl text-slate-400">
                        Checkout happens right on this page - no redirects!
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {pricingPlans.map((plan) => (
                        <div
                            key={plan.id}
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

                            <button
                                onClick={() => handleSelectPlan(plan.id)}
                                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-colors"
                            >
                                Get Started
                            </button>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-3xl mx-auto">
                        <h3 className="text-xl font-bold text-white mb-4">
                            🎯 Embedded Checkout Benefits
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                            <div>
                                <div className="text-blue-400 font-bold mb-2">✨ No Redirects</div>
                                <p className="text-slate-400 text-sm">
                                    Checkout happens right on your page
                                </p>
                            </div>
                            <div>
                                <div className="text-blue-400 font-bold mb-2">🎨 Customizable</div>
                                <p className="text-slate-400 text-sm">
                                    Matches your brand perfectly
                                </p>
                            </div>
                            <div>
                                <div className="text-blue-400 font-bold mb-2">🔒 Secure</div>
                                <p className="text-slate-400 text-sm">
                                    PCI compliant, Stripe-hosted
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    );
}
