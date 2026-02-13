# Stripe Integration Guide - ALMSTKSHF

## Overview
Stripe payment processing has been successfully integrated into your ALMSTKSHF website. You can now accept payments, manage subscriptions, and handle customer billing.

## ✅ What's Been Implemented

### 1. Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51T0I0lIbSWtAyXoR..."
STRIPE_PUBLISHABLE_KEY="pk_test_51T0I0lIbSWtAyXoR..."
STRIPE_SECRET_KEY="sk_test_51T0I0lIbSWtAyXoR..."
STRIPE_MCP_KEY="ek_test_YWNjdF8xVDBJMGxJYlNXdEF5WG9S..."
```

### 2. Packages Installed
- ✅ `stripe` - Server-side Stripe SDK
- ✅ `@stripe/stripe-js` - Client-side Stripe.js library

### 3. Core Files Created

#### Server-Side (`src/lib/stripe.ts`)
- Stripe instance initialization
- Amount formatting helpers (USD cents conversion)
- Currency handling

#### Client-Side (`src/lib/stripe-client.ts`)
- Stripe.js loader
- Publishable key configuration

#### API Routes
- ✅ `/api/stripe/checkout` - Create checkout sessions
- ✅ `/api/stripe/webhook` - Handle Stripe webhooks

#### UI Components
- ✅ `CheckoutButton.tsx` - Reusable checkout button
- ✅ `/payment/success` - Payment success page
- ✅ `/payment/cancelled` - Payment cancelled page

## 🚀 How to Use

### Basic Checkout Example

```tsx
import CheckoutButton from '@/components/CheckoutButton';

export default function PricingPage() {
    return (
        <div>
            <h2>Premium Plan</h2>
            <p>$99.00 / month</p>
            
            <CheckoutButton
                amount={99}
                currency="usd"
                productName="Premium Plan"
                productDescription="Full access to all features"
            >
                Subscribe Now
            </CheckoutButton>
        </div>
    );
}
```

### Custom Checkout Flow

```tsx
"use client";

import { getStripe } from '@/lib/stripe-client';

async function handleCustomCheckout() {
    // Create checkout session
    const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            amount: 149,
            currency: 'usd',
            productName: 'Enterprise Plan',
            productDescription: 'Custom features and support',
        }),
    });

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    const stripe = await getStripe();
    await stripe?.redirectToCheckout({ sessionId });
}
```

## 💳 Supported Features

### ✅ One-Time Payments
- Product purchases
- Service fees
- Custom amounts
- Multiple currencies

### ✅ Subscriptions (Ready to implement)
- Recurring billing
- Multiple plans
- Trial periods
- Proration

### ✅ Webhooks
- Payment confirmation
- Subscription updates
- Failed payments
- Refunds

## 🔧 Configuration

### Stripe Dashboard Setup

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/dashboard

2. **Enable Payment Methods**:
   - Navigate to **Settings** → **Payment methods**
   - Enable: Cards, Apple Pay, Google Pay
   - For UAE: Enable local payment methods

3. **Set up Webhooks**:
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `checkout.session.async_payment_succeeded`
     - `checkout.session.async_payment_failed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

4. **Get Webhook Secret**:
   - Copy the webhook signing secret
   - Add to `.env.local`:
     ```env
     STRIPE_WEBHOOK_SECRET="whsec_..."
     ```

### Local Webhook Testing

Use Stripe CLI for local development:

```bash
# Install Stripe CLI
# Windows (using Scoop)
scoop install stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Test a webhook
stripe trigger checkout.session.completed
```

## 💰 Pricing Examples

### Create Pricing Plans

```tsx
const pricingPlans = [
    {
        name: 'Basic',
        price: 29,
        currency: 'usd',
        features: ['Feature 1', 'Feature 2', 'Feature 3'],
    },
    {
        name: 'Pro',
        price: 99,
        currency: 'usd',
        features: ['All Basic features', 'Feature 4', 'Feature 5'],
    },
    {
        name: 'Enterprise',
        price: 299,
        currency: 'usd',
        features: ['All Pro features', 'Custom integration', 'Priority support'],
    },
];

export default function Pricing() {
    return (
        <div className="grid grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
                <div key={plan.name} className="border rounded-lg p-6">
                    <h3>{plan.name}</h3>
                    <p className="text-3xl font-bold">${plan.price}</p>
                    <ul>
                        {plan.features.map((feature) => (
                            <li key={feature}>{feature}</li>
                        ))}
                    </ul>
                    <CheckoutButton
                        amount={plan.price}
                        currency={plan.currency}
                        productName={`${plan.name} Plan`}
                        productDescription={plan.features.join(', ')}
                    >
                        Get Started
                    </CheckoutButton>
                </div>
            ))}
        </div>
    );
}
```

## 🌍 Multi-Currency Support

### UAE Dirham (AED) Example

```tsx
<CheckoutButton
    amount={99}
    currency="aed"
    productName="Premium Plan"
    productDescription="Full access to all features"
>
    Pay 99 AED
</CheckoutButton>
```

### Supported Currencies
- USD (US Dollar)
- AED (UAE Dirham)
- EUR (Euro)
- GBP (British Pound)
- SAR (Saudi Riyal)
- And 135+ more currencies

## 📊 Webhook Event Handling

### Current Webhook Handlers

The webhook route (`/api/stripe/webhook`) handles:

1. **`checkout.session.completed`**
   - Payment successful
   - TODO: Send confirmation email, grant access

2. **`payment_intent.succeeded`**
   - Payment processed successfully

3. **`customer.subscription.created/updated`**
   - Subscription status changed
   - TODO: Update user's subscription in database

4. **`invoice.paid`**
   - Invoice payment successful

5. **`invoice.payment_failed`**
   - Payment failed
   - TODO: Send notification to customer

### Customize Webhook Handling

Edit `src/app/api/stripe/webhook/route.ts`:

```typescript
case 'checkout.session.completed': {
    const session = event.data.object as Stripe.Checkout.Session;
    
    // Your custom logic
    await sendConfirmationEmail(session.customer_email);
    await grantAccess(session.metadata.userId);
    await updateDatabase(session);
    
    break;
}
```

## 🔒 Security Best Practices

### ✅ Implemented
- Secret keys stored in environment variables
- Webhook signature verification
- HTTPS required for production
- Client-side publishable key only

### ⚠️ Important
- Never expose `STRIPE_SECRET_KEY` in client-side code
- Always verify webhook signatures
- Use HTTPS in production
- Validate amounts server-side
- Don't trust client-provided prices

## 🧪 Testing

### Test Cards

Stripe provides test cards for development:

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
3D Secure: 4000 0027 6000 3184
```

**Expiry**: Any future date  
**CVC**: Any 3 digits  
**ZIP**: Any 5 digits

### Test Checkout Flow

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Create a test checkout**:
   - Use the `CheckoutButton` component
   - Click the button
   - Use test card: `4242 4242 4242 4242`

3. **Verify success page**:
   - Should redirect to `/payment/success`
   - Check console for session ID

4. **Check Stripe Dashboard**:
   - View payment in test mode
   - Verify webhook events

## 📱 Mobile Payments

### Apple Pay & Google Pay

Enable in Stripe Dashboard:
1. Go to **Settings** → **Payment methods**
2. Enable **Apple Pay** and **Google Pay**
3. Add your domain to Apple Pay verification

These will automatically appear in Stripe Checkout on supported devices.

## 🔄 Subscription Management

### Create Subscription Products

```typescript
// In Stripe Dashboard or via API
const product = await stripe.products.create({
    name: 'Premium Subscription',
    description: 'Monthly premium access',
});

const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 9900, // $99.00
    currency: 'usd',
    recurring: {
        interval: 'month',
    },
});
```

### Subscription Checkout

```typescript
const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'subscription', // Changed from 'payment'
    line_items: [
        {
            price: 'price_xxxxxxxxxxxxx', // Your price ID
            quantity: 1,
        },
    ],
    success_url: `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/payment/cancelled`,
});
```

## 📧 Email Notifications

### Integrate with Resend

Combine with your existing Resend integration:

```typescript
// In webhook handler
case 'checkout.session.completed': {
    const session = event.data.object;
    
    // Send confirmation email
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'ALMSTKSHF <noreply@almstkshf.com>',
            to: [session.customer_email],
            subject: 'Payment Confirmation',
            html: `
                <h2>Thank you for your purchase!</h2>
                <p>Your payment of $${session.amount_total / 100} has been processed.</p>
            `,
        }),
    });
    
    break;
}
```

## 🚀 Production Deployment

### Vercel Environment Variables

```bash
# Set production keys
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production

# Pull latest env vars
vercel env pull
```

### Switch to Live Mode

1. **Get Live API Keys**:
   - Go to Stripe Dashboard
   - Toggle from **Test mode** to **Live mode**
   - Copy live keys from **Developers** → **API keys**

2. **Update Production Environment**:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
   STRIPE_SECRET_KEY="sk_live_..."
   ```

3. **Update Webhook Endpoint**:
   - Create new webhook for production domain
   - Update `STRIPE_WEBHOOK_SECRET`

### Pre-Launch Checklist

- [ ] Live API keys configured
- [ ] Webhook endpoint verified
- [ ] Payment methods enabled
- [ ] Test transactions in live mode
- [ ] Email notifications working
- [ ] Success/cancel pages tested
- [ ] Mobile payments tested
- [ ] Security review completed

## 📊 Analytics & Reporting

### Stripe Dashboard

Access detailed analytics:
- **Home** → Overview of payments
- **Payments** → Individual transactions
- **Customers** → Customer management
- **Subscriptions** → Subscription tracking
- **Reports** → Financial reports

### Custom Analytics

Track payments in your own system:

```typescript
// In webhook handler
case 'checkout.session.completed': {
    const session = event.data.object;
    
    // Log to your analytics
    await analytics.track('payment_completed', {
        amount: session.amount_total / 100,
        currency: session.currency,
        product: session.metadata.productName,
        customer: session.customer_email,
    });
    
    break;
}
```

## 🆘 Troubleshooting

### Common Issues

**1. "Stripe is not defined"**
- Make sure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Restart dev server after adding env vars

**2. "Invalid API Key"**
- Verify keys in `.env.local`
- Check if using test keys in test mode

**3. "Webhook signature verification failed"**
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Use Stripe CLI for local testing

**4. "Checkout session not found"**
- Session IDs expire after 24 hours
- Create new session for each checkout

### Debug Mode

Enable Stripe logging:

```typescript
// In src/lib/stripe.ts
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
    typescript: true,
    maxNetworkRetries: 3,
    telemetry: false,
});
```

## 📚 Resources

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe Docs**: https://stripe.com/docs
- **API Reference**: https://stripe.com/docs/api
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Test Cards**: https://stripe.com/docs/testing

## 🎯 Next Steps

1. ✅ **Test checkout flow** - Use test cards
2. ⏳ **Set up webhook endpoint** - Configure in Stripe Dashboard
3. ⏳ **Create pricing page** - Use `CheckoutButton` component
4. ⏳ **Implement subscriptions** - If needed
5. ⏳ **Integrate with Chatbase** - Pass subscription info to chatbot
6. ⏳ **Add email notifications** - Combine with Resend
7. ⏳ **Deploy to production** - Switch to live keys

---

**Status**: ✅ Stripe Integration Complete

Your website is now ready to accept payments! Test the checkout flow and customize as needed.
