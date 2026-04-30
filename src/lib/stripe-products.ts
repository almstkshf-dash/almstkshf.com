export interface StripeProduct {
    id: string;
    name: string;
    description: string;
    priceInCents: number;
    currency: string;
}

const PRODUCTS: Record<string, StripeProduct> = {
    "standard": {
        id: "standard",
        name: "Standard Plan",
        description: "Essential media monitoring for individuals and small teams.",
        priceInCents: 199 * 100,
        currency: "aed",
    },
    "professional": {
        id: "professional",
        name: "Professional Plan",
        description: "Advanced tools for growing companies and PR agencies.",
        priceInCents: 299 * 100,
        currency: "aed",
    },
    "enterprise": {
        id: "enterprise",
        name: "Enterprise Plan",
        description: "Complete intelligence suite for elite organizations.",
        priceInCents: 399 * 100,
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
