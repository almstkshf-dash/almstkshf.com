# Stripe Embedded Checkout Guide

## Overview
Stripe Embedded Checkout has been successfully implemented! This modern approach embeds the checkout form directly on your page instead of redirecting users to Stripe's hosted checkout page.

## ✅ What's Been Implemented

### 1. Additional Package Installed
- ✅ `@stripe/react-stripe-js` - React components for Stripe

### 2. Core Files Created

#### Server-Side
- ✅ `src/lib/stripe.ts` - Updated with 'server-only' import
- ✅ `src/app/actions/stripe.ts` - Server actions for checkout

#### Client-Side Components
- ✅ `src/components/EmbeddedCheckout.tsx` - Predefined products
- ✅ `src/components/CustomEmbeddedCheckout.tsx` - Custom products

#### Examples
- ✅ `EXAMPLE_embedded_checkout_page.tsx` - Full demo page

## 🎯 Key Differences: Embedded vs Redirect Checkout

### Embedded Checkout (NEW)
- ✅ Checkout happens **on your page**
- ✅ No redirects - better UX
- ✅ Seamless brand experience
- ✅ `ui_mode: 'embedded'`
- ✅ `redirect_on_completion: 'never'`

### Redirect Checkout (Previous)
- Redirects to Stripe's hosted page
- Returns to your site after payment
- `mode: 'payment'` with success/cancel URLs

## 🚀 Usage Examples

### Example 1: Predefined Products

```tsx
import EmbeddedCheckoutComponent from '@/components/EmbeddedCheckout';

export default function CheckoutPage() {
    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1>Complete Your Purchase</h1>
            
            {/* Product ID must match your catalog in stripe.ts */}
            <EmbeddedCheckoutComponent productId="pro-plan" />
        </div>
    );
}
```

### Example 2: Custom Product Details

```tsx
import CustomEmbeddedCheckout from '@/components/CustomEmbeddedCheckout';

export default function CustomCheckoutPage() {
    return (
        <div className="max-w-4xl mx-auto p-8">
            <h1>Custom Checkout</h1>
            
            <CustomEmbeddedCheckout
                productName="Premium Consultation"
                productDescription="1-hour strategy session"
                amount={199}
                currency="usd"
            />
        </div>
    );
}
```

### Example 3: Dynamic Pricing Page

```tsx
"use client";

import { useState } from 'react';
import EmbeddedCheckoutComponent from '@/components/EmbeddedCheckout';

export default function PricingPage() {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

    if (selectedPlan) {
        return (
            <div>
                <button onClick={() => setSelectedPlan(null)}>
                    ← Back
                </button>
                <EmbeddedCheckoutComponent productId={selectedPlan} />
            </div>
        );
    }

    return (
        <div>
            <button onClick={() => setSelectedPlan('basic-plan')}>
                Buy Basic - $29
            </button>
            <button onClick={() => setSelectedPlan('pro-plan')}>
                Buy Pro - $99
            </button>
        </div>
    );
}
```

## 📦 Product Catalog

### Current Products (in `src/app/actions/stripe.ts`)

```typescript
'basic-plan': {
    name: 'Basic Plan',
    description: 'Perfect for small businesses',
    priceInCents: 2900, // $29.00
},
'pro-plan': {
    name: 'Professional Plan',
    description: 'For growing organizations',
    priceInCents: 9900, // $99.00
},
'enterprise-plan': {
    name: 'Enterprise Plan',
    description: 'For large enterprises',
    priceInCents: 29900, // $299.00
},
```

### Add Your Own Products

Edit `src/app/actions/stripe.ts`:

```typescript
async function getProduct(productId: string): Promise<Product> {
    const products: Record<string, Product> = {
        'your-product-id': {
            id: 'your-product-id',
            name: 'Your Product Name',
            description: 'Your product description',
            priceInCents: 4999, // $49.99
            currency: 'usd',
        },
        // Add more products...
    };

    return products[productId];
}
```

## 🎨 Styling the Embedded Checkout

### Default Styling

The embedded checkout automatically inherits your page's theme. It's responsive and works on all devices.

### Custom CSS

You can customize the checkout appearance:

```css
/* In your globals.css */
#checkout {
    /* Container styles */
    max-width: 600px;
    margin: 0 auto;
}

/* Stripe's embedded checkout respects your page's color scheme */
```

### Dark Mode

The checkout automatically adapts to dark mode based on your page's background color.

## 🔄 Payment Flow

### User Journey

1. **User selects product** → Clicks "Get Started"
2. **Embedded checkout loads** → Shows payment form on your page
3. **User enters details** → Card info, email, etc.
4. **Payment processes** → Stripe handles securely
5. **Success/Error shown** → Right on your page, no redirect!

### Server Actions Flow

```
Client Component
    ↓
fetchClientSecret() callback
    ↓
startCheckoutSession() server action
    ↓
stripe.checkout.sessions.create()
    ↓
Returns client_secret
    ↓
EmbeddedCheckout renders with secret
```

## 🧪 Testing

### Test the Embedded Checkout

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Use the example page**: `EXAMPLE_embedded_checkout_page.tsx`

3. **Select a plan** and click "Get Started"

4. **Embedded checkout appears** on the same page

5. **Use test card**: `4242 4242 4242 4242`

6. **Complete payment** - Success shown inline!

### Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

## 🔔 Handling Payment Completion

### Option 1: Webhook (Recommended)

Your existing webhook handler (`/api/stripe/webhook`) will receive the `checkout.session.completed` event:

```typescript
case 'checkout.session.completed': {
    const session = event.data.object;
    
    // Grant access to product
    await grantAccess(session.metadata.productId);
    
    // Send confirmation email
    await sendEmail(session.customer_email);
    
    break;
}
```

### Option 2: Client-Side Status Check

```tsx
"use client";

import { useEffect, useState } from 'react';
import { getCheckoutSessionStatus } from '@/app/actions/stripe';

export default function CheckoutStatus({ sessionId }: { sessionId: string }) {
    const [status, setStatus] = useState<string>('loading');

    useEffect(() => {
        async function checkStatus() {
            const result = await getCheckoutSessionStatus(sessionId);
            setStatus(result.status);
        }
        checkStatus();
    }, [sessionId]);

    if (status === 'complete') {
        return <div>✅ Payment successful!</div>;
    }

    return <div>Processing...</div>;
}
```

## 🌍 Multi-Currency Support

### Use Different Currencies

```tsx
<CustomEmbeddedCheckout
    productName="Premium Plan"
    productDescription="Full access"
    amount={99}
    currency="aed" // UAE Dirham
/>
```

### Supported Currencies
- `usd` - US Dollar
- `aed` - UAE Dirham
- `eur` - Euro
- `gbp` - British Pound
- `sar` - Saudi Riyal
- And 135+ more

## 📱 Mobile Optimization

### Responsive Design

The embedded checkout is fully responsive and works perfectly on:
- ✅ Desktop browsers
- ✅ Mobile browsers (iOS Safari, Chrome)
- ✅ Tablets
- ✅ All screen sizes

### Mobile Payments

Automatically supports:
- ✅ Apple Pay (on supported devices)
- ✅ Google Pay (on supported devices)
- ✅ Link (Stripe's one-click checkout)

## 🔒 Security

### Built-in Security Features

- ✅ **PCI DSS Compliant** - Stripe handles card data
- ✅ **3D Secure** - Automatic fraud prevention
- ✅ **Server-only imports** - Secrets never exposed
- ✅ **HTTPS required** - Encrypted communication

### Best Practices

```typescript
// ✅ DO: Use 'server-only' import
import 'server-only';
import { stripe } from '@/lib/stripe';

// ❌ DON'T: Import stripe in client components
// This will cause build errors with 'server-only'
```

## 🎯 Advanced Features

### Add Coupons/Discounts

```typescript
const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [...],
    mode: 'payment',
    discounts: [{
        coupon: 'SUMMER2024', // Your coupon code
    }],
});
```

### Collect Shipping Address

```typescript
const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [...],
    mode: 'payment',
    shipping_address_collection: {
        allowed_countries: ['US', 'AE', 'SA'],
    },
});
```

### Add Tax Calculation

```typescript
const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [...],
    mode: 'payment',
    automatic_tax: {
        enabled: true,
    },
});
```

## 🔄 Subscriptions with Embedded Checkout

### Create Subscription Checkout

```typescript
export async function startSubscriptionCheckout(priceId: string) {
    const session = await stripe.checkout.sessions.create({
        ui_mode: 'embedded',
        redirect_on_completion: 'never',
        line_items: [
            {
                price: priceId, // Your Stripe Price ID
                quantity: 1,
            },
        ],
        mode: 'subscription', // Changed from 'payment'
    });

    return session.client_secret;
}
```

### Usage

```tsx
<EmbeddedCheckoutComponent productId="monthly-subscription" />
```

## 📊 Analytics Integration

### Track Checkout Events

```tsx
"use client";

import { useEffect } from 'react';

export default function CheckoutWithAnalytics({ productId }: { productId: string }) {
    useEffect(() => {
        // Track checkout started
        analytics.track('checkout_started', {
            product_id: productId,
        });
    }, [productId]);

    return <EmbeddedCheckoutComponent productId={productId} />;
}
```

## 🆘 Troubleshooting

### Common Issues

**1. "Cannot find module 'server-only'"**
```bash
npm install server-only
```

**2. "Stripe is not defined"**
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Restart dev server

**3. "Product not found"**
- Check product ID matches your catalog
- Verify spelling and case

**4. Checkout not loading**
- Check browser console for errors
- Verify API key is correct
- Check network tab for failed requests

### Debug Mode

```typescript
// In your component
console.log('Product ID:', productId);
console.log('Stripe Key:', process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.slice(0, 10) + '...');
```

## 📚 Comparison: Both Checkout Methods

### When to Use Embedded Checkout

✅ **Use Embedded Checkout when:**
- You want seamless UX (no redirects)
- You need full brand control
- You want to track user behavior
- You're building a modern SaaS app

### When to Use Redirect Checkout

✅ **Use Redirect Checkout when:**
- You want the simplest setup
- You don't need custom styling
- You're okay with redirects
- You want Stripe to handle everything

### You Can Use Both!

Your implementation supports both methods:

```tsx
// Embedded checkout
<EmbeddedCheckoutComponent productId="pro-plan" />

// Redirect checkout
<CheckoutButton amount={99} productName="Pro Plan" />
```

## 🚀 Production Deployment

### Pre-Launch Checklist

- [ ] Test embedded checkout with test cards
- [ ] Verify webhook handling
- [ ] Test on mobile devices
- [ ] Check all product IDs
- [ ] Verify email notifications
- [ ] Test error scenarios
- [ ] Update to live API keys

### Switch to Live Mode

1. Get live API keys from Stripe Dashboard
2. Update environment variables
3. Test with real card (small amount)
4. Monitor Stripe Dashboard

## 📈 Next Steps

1. ✅ **Test embedded checkout** - Use example page
2. ⏳ **Customize product catalog** - Add your products
3. ⏳ **Create pricing page** - Use embedded checkout
4. ⏳ **Set up webhooks** - Handle payment events
5. ⏳ **Add email notifications** - Confirm purchases
6. ⏳ **Deploy to production** - Go live!

---

**Status**: ✅ Embedded Checkout Fully Implemented

You now have both embedded and redirect checkout options. Choose the one that fits your needs best!
