# Email Notifications Setup Guide

## Overview
Your contact form and waitlist forms now have email notification functionality implemented using Resend.

## What's Been Implemented

### 1. Contact Form (`convex/contact.ts`)
- ✅ Stores submissions in the database
- ✅ Sends email notification to admin with:
  - Sender's name, email, subject, and message
  - Submission ID and timestamp
  - Reply-to set to sender's email for easy response

### 2. Waitlist Form (`convex/waitlist.ts`)
- ✅ Stores waitlist entries in the database
- ✅ Sends confirmation email to the user
- ✅ Sends notification email to admin
- ✅ Prevents duplicate signups for the same service

## Setup Instructions

### Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

### Step 2: Get Your API Key

1. Log in to your Resend dashboard
2. Navigate to **API Keys** in the sidebar
3. Click **Create API Key**
4. Give it a name (e.g., "ALMSTKSHF Production")
5. Copy the API key (it starts with `re_`)

### Step 3: Add Environment Variables

#### For Local Development:

Add these lines to your `.env.local` file:

```env
# Resend Email Configuration
RESEND_API_KEY=re_your_api_key_here
CONTACT_EMAIL=k.account@almstkshf.com
```

#### For Convex Deployment:

You need to add these environment variables to your Convex deployment:

```bash
npx convex env set RESEND_API_KEY re_your_api_key_here
npx convex env set CONTACT_EMAIL k.account@almstkshf.com
```

### Step 4: Verify Domain (Optional but Recommended)

For production use, you should verify your domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain: `almstkshf.com`
4. Add the DNS records provided by Resend to your domain's DNS settings
5. Wait for verification (usually takes a few minutes)

Once verified, update the `from` field in the code:
- Change from: `"ALMSTKSHF <onboarding@resend.dev>"`
- To: `"ALMSTKSHF <noreply@almstkshf.com>"`

### Step 5: Test the Forms

1. **Restart your Convex dev server** to pick up the new environment variables:
   ```bash
   # Stop the current convex dev (Ctrl+C)
   npx convex dev
   ```

2. Test the contact form at: `http://localhost:3000/en/contact`
3. Test the waitlist form at: `http://localhost:3000/en/case-studies/styling-assistant`

## Email Templates

### Contact Form Email
- **To:** Your configured CONTACT_EMAIL
- **Subject:** "New Contact Form Submission: [Subject]"
- **Contains:** Name, email, subject, message, submission ID, timestamp
- **Reply-to:** Sender's email (for easy response)

### Waitlist Confirmation Email (to user)
- **To:** User's email
- **Subject:** "Welcome to [Service] Waitlist!"
- **Contains:** Personalized welcome message, service name, next steps

### Waitlist Notification Email (to admin)
- **To:** Your configured CONTACT_EMAIL
- **Subject:** "New Waitlist Signup: [Service]"
- **Contains:** Service name, user's name, email, timestamp

## Resend Free Tier Limits

- **100 emails per day** (free tier)
- **3,000 emails per month** (free tier)
- For higher limits, upgrade to a paid plan

## Troubleshooting

### Emails Not Sending?

1. **Check environment variables:**
   ```bash
   npx convex env list
   ```
   Make sure `RESEND_API_KEY` and `CONTACT_EMAIL` are set.

2. **Check Convex logs:**
   - Look for warnings like "RESEND_API_KEY not configured"
   - Check for any error messages

3. **Verify API key:**
   - Make sure the API key is correct
   - Check if it's active in Resend dashboard

4. **Check spam folder:**
   - Emails might be in spam, especially if domain is not verified

### Form Submits But No Email?

- The form will still work and save to database even if email fails
- Check Convex logs for error messages
- Verify your Resend API key is valid

## Production Deployment

When deploying to production:

1. Set environment variables in your Convex production deployment:
   ```bash
   npx convex deploy --prod
   npx convex env set --prod RESEND_API_KEY re_your_api_key_here
   npx convex env set --prod CONTACT_EMAIL k.account@almstkshf.com
   ```

2. Verify your domain in Resend for better deliverability

3. Consider setting up a dedicated email address like `noreply@almstkshf.com`

## Security Notes

- ✅ API keys are stored as environment variables (not in code)
- ✅ Email sending happens server-side (Convex functions)
- ✅ User emails are validated before processing
- ✅ Form submissions are still saved even if email fails
- ✅ Duplicate waitlist signups are prevented

## Next Steps

1. Get your Resend API key
2. Add environment variables to Convex
3. Restart Convex dev server
4. Test both forms
5. Verify you receive emails

## Support

If you need help:
- Resend Documentation: https://resend.com/docs
- Convex Environment Variables: https://docs.convex.dev/production/environment-variables
