/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright (c) 2026 [Tamer Younes/Almstkshf for media monitoring]. All rights reserved.
 */

export interface StripeProduct {
    id: string;
    name: string;
    description: string;
    priceInCents: number;
    currency: string;
}

const PRODUCTS: Record<string, StripeProduct> = {
    "monthly-analysis-report": {
        id: "monthly-analysis-report",
        name: "Monthly Analysis Report",
        description: "Tailor-made reports tailored to your specifications.",
        priceInCents: 2900 * 100,
        currency: "aed",
    },
    "broadcast-monitoring": {
        id: "broadcast-monitoring",
        name: "Broadcast Monitoring",
        description: "Ongoing monitoring for Radio & TV channels.",
        priceInCents: 2990 * 100,
        currency: "aed",
    },
    "online-media-monitoring": {
        id: "online-media-monitoring",
        name: "Online Media Monitoring",
        description: "Comprehensive coverage for Gulf & UAE regions.",
        priceInCents: 3200 * 100,
        currency: "aed",
    },
    "social-media-monitoring": {
        id: "social-media-monitoring",
        name: "Social Media Monitoring",
        description: "Curated tracking for major social platforms.",
        priceInCents: 5300 * 100,
        currency: "aed",
    },
};

export function getStripeProduct(productId: string): StripeProduct {
    const product = PRODUCTS[productId];
    if (!product) {
        throw new Error(`Unknown productId: ${productId}`);
    }
    return product;
}

export function listStripeProducts(): StripeProduct[] {
    return Object.values(PRODUCTS);
}
