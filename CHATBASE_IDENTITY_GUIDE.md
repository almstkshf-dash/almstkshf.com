# Chatbase Secure Identity Integration Guide

## Overview
Your Chatbase chatbot now supports **secure user identification** using JWT tokens. This enables personalized chat experiences and allows the chatbot to access user-specific information.

## What's Been Implemented

### 1. Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_CHATBOT_ID="WGKAf1CTHsc-9QcuWv6ZX"
CHATBOT_IDENTITY_SECRET="h2ax7gd1icx41i3kh26bgabo0oj5l0ta"
```

### 2. API Route (`src/app/api/chatbase/token/route.ts`)
- ✅ Generates JWT tokens for user identification
- ✅ Currently supports anonymous/guest users
- ✅ Session tracking with cookies
- ✅ Ready to integrate with authentication systems

### 3. Enhanced ChatbaseWidget (`src/components/ChatbaseWidget.tsx`)
- ✅ Automatically fetches JWT token
- ✅ Identifies users with Chatbase
- ✅ Handles initialization timing
- ✅ Graceful error handling

## How It Works

### Current Flow (Anonymous Users):

1. User visits your website
2. ChatbaseWidget loads
3. Widget fetches JWT token from `/api/chatbase/token`
4. API generates token with guest session ID
5. Widget identifies user with Chatbase using the token
6. Chatbot can now track conversation history per session

### User Payload Structure:

```typescript
{
    user_id: "guest_1234567890_abc123",
    email: "guest@almstkshf.com",
    is_guest: true,
    // Add custom attributes here
}
```

## Integration with Authentication Systems

### Option 1: Clerk Integration

If you're using Clerk (already in your dependencies):

```typescript
// src/app/api/chatbase/token/route.ts
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
    const { userId } = await auth();
    const user = await currentUser();
    
    const secret = process.env.CHATBOT_IDENTITY_SECRET;
    
    if (!secret) {
        return NextResponse.json({ error: 'Secret not configured' }, { status: 500 });
    }

    // If user is authenticated
    if (userId && user) {
        const userPayload = {
            user_id: userId,
            email: user.emailAddresses[0]?.emailAddress || '',
            name: `${user.firstName} ${user.lastName}`,
            is_guest: false,
            // Add custom attributes
            created_at: user.createdAt,
        };

        const token = jwt.sign(userPayload, secret, { expiresIn: '1h' });
        return NextResponse.json({ token });
    }

    // Guest user fallback
    const sessionId = generateSessionId();
    const guestPayload = {
        user_id: sessionId,
        email: 'guest@almstkshf.com',
        is_guest: true,
    };

    const token = jwt.sign(guestPayload, secret, { expiresIn: '1h' });
    return NextResponse.json({ token });
}
```

### Option 2: Custom Authentication

If you have your own auth system:

```typescript
// src/app/api/chatbase/token/route.ts
import { getSession } from '@/lib/auth'; // Your auth library

export async function GET(request: NextRequest) {
    const session = await getSession(request);
    const secret = process.env.CHATBOT_IDENTITY_SECRET;
    
    if (!secret) {
        return NextResponse.json({ error: 'Secret not configured' }, { status: 500 });
    }

    if (session?.user) {
        const userPayload = {
            user_id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            is_guest: false,
            // Add any custom attributes
            subscription_tier: session.user.subscriptionTier,
            stripe_customer_id: session.user.stripeCustomerId,
        };

        const token = jwt.sign(userPayload, secret, { expiresIn: '1h' });
        return NextResponse.json({ token });
    }

    // Guest fallback...
}
```

## Custom Attributes

You can pass any custom attributes to Chatbase. These can be used for:
- Personalization
- Access control
- Integration with other services (Stripe, etc.)
- Analytics

### Example Custom Attributes:

```typescript
const userPayload = {
    user_id: user.id,
    email: user.email,
    
    // Subscription info
    subscription_tier: 'premium',
    subscription_status: 'active',
    
    // Stripe integration
    stripe_customer_id: 'cus_123456',
    stripe_accounts: ['acct_123', 'acct_456'],
    
    // User metadata
    company: 'ALMSTKSHF',
    role: 'admin',
    language: 'ar',
    
    // Custom fields
    total_reports: 150,
    last_login: new Date().toISOString(),
};
```

## Chatbase Dashboard Configuration

### Enable Identity Verification:

1. Go to your Chatbase dashboard
2. Navigate to **Settings** → **Security**
3. Enable **Identity Verification**
4. Your secret key is: `h2ax7gd1icx41i3kh26bgabo0oj5l0ta`

### Use Custom Attributes:

In your Chatbase agent configuration, you can now:

1. **Personalize responses** based on user attributes
2. **Conditional logic** (e.g., different responses for premium users)
3. **Access user data** in custom actions
4. **Track conversations** per user

### Example Chatbase Prompt:

```
You are a helpful assistant for ALMSTKSHF.

User Information:
- Email: {{email}}
- Subscription: {{subscription_tier}}
- Language: {{language}}

If the user is a premium subscriber, offer advanced features.
If the user is a guest, encourage them to sign up.
```

## Security Best Practices

### ✅ DO:
- Store `CHATBOT_IDENTITY_SECRET` as an environment variable
- Use HTTPS in production
- Set appropriate token expiration (1 hour recommended)
- Validate user sessions before generating tokens
- Use `httpOnly` cookies for session management

### ❌ DON'T:
- Expose the secret in client-side code
- Include sensitive data in JWT payload (passwords, credit cards, etc.)
- Use long expiration times (> 24 hours)
- Trust client-provided user data without validation

## Testing

### Test Anonymous User:

1. Open your website in incognito mode
2. Open browser console (F12)
3. Look for: `Chatbase: User identified successfully`
4. Open chatbot and start a conversation
5. Refresh page - conversation history should persist

### Test Authenticated User (after integration):

1. Log in to your application
2. Open browser console
3. Verify user identification
4. Check that chatbot has access to user info
5. Test personalized responses

### Verify JWT Token:

```bash
# In browser console
fetch('/api/chatbase/token')
  .then(res => res.json())
  .then(data => console.log(data.token))
```

Copy the token and decode it at [jwt.io](https://jwt.io) to verify the payload.

## Troubleshooting

### Token Not Generated?

1. Check environment variable:
   ```bash
   echo $CHATBOT_IDENTITY_SECRET
   ```

2. Verify API route is accessible:
   ```bash
   curl http://localhost:3000/api/chatbase/token
   ```

3. Check server logs for errors

### User Not Identified?

1. Open browser console
2. Look for Chatbase-related errors
3. Verify token is being fetched:
   ```javascript
   // In console
   fetch('/api/chatbase/token').then(r => r.json()).then(console.log)
   ```

4. Check Network tab for `/api/chatbase/token` request

### Conversation History Not Persisting?

1. Verify user identification is working
2. Check that `user_id` is consistent across sessions
3. Clear cookies and test again
4. Verify Chatbase dashboard settings

## Advanced Features

### Programmatic Control:

```javascript
// Open chat for specific user
window.chatbase('open');

// Send a message programmatically
window.chatbase('sendMessage', 'Hello!');

// Update user attributes
window.chatbase('identify', { 
    token: newToken,
    // Additional attributes
});

// Track custom events
window.chatbase('track', 'subscription_upgraded', {
    plan: 'premium',
    amount: 99
});
```

### Integration with Stripe:

```typescript
// In your API route
const userPayload = {
    user_id: user.id,
    email: user.email,
    stripe_customer_id: user.stripeCustomerId,
    stripe_accounts: user.stripeAccounts,
    subscription_status: user.subscriptionStatus,
};
```

Then in Chatbase, you can create actions that:
- Check subscription status
- Upgrade/downgrade plans
- View billing history
- Manage payment methods

## Production Deployment

### Vercel Environment Variables:

```bash
# Set production secret
vercel env add CHATBOT_IDENTITY_SECRET production

# Pull latest env vars
vercel env pull
```

### Security Checklist:

- [ ] `CHATBOT_IDENTITY_SECRET` is set in production
- [ ] Secret is different from development
- [ ] HTTPS is enabled
- [ ] Cookies are set with `secure: true`
- [ ] Token expiration is appropriate
- [ ] User data validation is in place
- [ ] Error handling doesn't leak sensitive info

## Next Steps

1. ✅ **Test anonymous user identification** - Already working!
2. ⏳ **Integrate with your auth system** (Clerk, Auth0, custom)
3. ⏳ **Add custom user attributes** relevant to your business
4. ⏳ **Configure Chatbase dashboard** to use user data
5. ⏳ **Create personalized chat experiences**
6. ⏳ **Set up Stripe integration** (if needed)

## Support

### Resources:
- Chatbase Identity Docs: https://docs.chatbase.co/identity
- JWT.io (token decoder): https://jwt.io
- Your implementation: `src/app/api/chatbase/token/route.ts`

### Files Modified:
- `.env.local` - Added `CHATBOT_IDENTITY_SECRET`
- `src/app/api/chatbase/token/route.ts` - JWT token generation
- `src/components/ChatbaseWidget.tsx` - User identification logic

---

**Status**: ✅ Secure Identity Verification Implemented

Anonymous users are now being identified and tracked. Ready to integrate with your authentication system for personalized experiences!
