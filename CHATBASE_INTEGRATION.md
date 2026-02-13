# Chatbase Integration Guide

## Overview
Chatbase chatbot has been successfully integrated into your ALMSTKSHF website. The chatbot will appear on all pages and provide AI-powered customer support.

## What's Been Implemented

### 1. Environment Variables (`.env.local`)
```env
NEXT_PUBLIC_CHATBASE_HOST="https://www.chatbase.co/"
NEXT_PUBLIC_CHATBOT_ID="WGKAf1CTHsc-9QcuWv6ZX"
```

### 2. ChatbaseWidget Component (`src/components/ChatbaseWidget.tsx`)
- ✅ Client-side component using Next.js Script component
- ✅ Lazy loading strategy for optimal performance
- ✅ Proper environment variable handling
- ✅ Graceful fallback if chatbot ID is not configured

### 3. Layout Integration (`src/app/[locale]/layout.tsx`)
- ✅ ChatbaseWidget added to root layout
- ✅ Appears on all pages across the application
- ✅ Loads after main content (lazyOnload strategy)

## Features

### ✅ What the Chatbot Does:
- Provides 24/7 AI-powered customer support
- Answers questions about your services
- Helps visitors navigate your website
- Can be trained on your custom data
- Supports multiple languages (including Arabic)

### ✅ Performance Optimizations:
- **Lazy Loading**: Script loads after page content
- **Deferred Execution**: Doesn't block page rendering
- **Conditional Loading**: Only loads if chatbot ID is configured
- **Proxy Pattern**: Queues interactions before script loads

## Configuration

### Current Setup:
- **Chatbot ID**: `WGKAf1CTHsc-9QcuWv6ZX`
- **Host**: `https://www.chatbase.co/`
- **Loading Strategy**: `lazyOnload` (best for performance)

### Customization Options:

You can customize the chatbot appearance and behavior in your Chatbase dashboard:

1. **Appearance**:
   - Widget position (bottom-right, bottom-left, etc.)
   - Color scheme
   - Widget icon
   - Welcome message

2. **Behavior**:
   - Auto-open settings
   - Greeting message
   - Response style
   - Language preferences

3. **Training**:
   - Upload documents
   - Add FAQs
   - Connect to website content
   - Custom responses

## Vercel Deployment

### For Production:

When deploying to Vercel, the environment variables are automatically synced from the Vercel Marketplace integration.

To manually verify or update:

```bash
# Pull latest environment variables from Vercel
vercel env pull

# Or set them manually
vercel env add NEXT_PUBLIC_CHATBASE_HOST
vercel env add NEXT_PUBLIC_CHATBOT_ID
```

## Testing

### Local Testing:

1. **Restart your development server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Visit any page**: `http://localhost:3000`

3. **Look for the chatbot widget** in the bottom-right corner

4. **Test the chatbot**:
   - Click to open
   - Ask a question
   - Verify responses

### What to Check:

- ✅ Widget appears on all pages
- ✅ Widget is clickable and opens chat interface
- ✅ Messages can be sent and received
- ✅ Widget doesn't block page content
- ✅ Widget works on mobile devices

## Troubleshooting

### Chatbot Not Appearing?

1. **Check environment variables**:
   ```bash
   # View .env.local
   cat .env.local
   ```
   Make sure `NEXT_PUBLIC_CHATBOT_ID` is set correctly.

2. **Check browser console**:
   - Open DevTools (F12)
   - Look for any Chatbase-related errors
   - Check Network tab for script loading

3. **Verify script loading**:
   - View page source
   - Search for "chatbase"
   - Confirm script tag is present

4. **Clear cache**:
   - Hard refresh (Ctrl+Shift+R)
   - Clear browser cache
   - Try incognito mode

### Script Not Loading?

If you see "Chatbase: NEXT_PUBLIC_CHATBOT_ID is not configured" in console:

1. Verify `.env.local` has the correct chatbot ID
2. Restart your development server
3. Clear Next.js cache: `rm -rf .next`

## Advanced Configuration

### Custom Styling:

You can add custom CSS to style the chatbot widget:

```css
/* In your globals.css */
#chatbase-bubble-button {
  /* Custom styles for the chat bubble */
  bottom: 20px !important;
  right: 20px !important;
}

#chatbase-bubble-window {
  /* Custom styles for the chat window */
  max-height: 600px !important;
}
```

### Programmatic Control:

You can control the chatbot programmatically:

```javascript
// Open chatbot
window.chatbase('open');

// Close chatbot
window.chatbase('close');

// Send a message
window.chatbase('sendMessage', 'Hello!');

// Get chatbot state
const state = window.chatbase('getState');
```

### RTL Support:

The chatbot automatically detects RTL languages. For Arabic pages, it will:
- Position itself appropriately
- Adjust text direction
- Mirror the interface

## Analytics

### Tracking Conversations:

In your Chatbase dashboard, you can:
- View conversation history
- Analyze common questions
- Track user satisfaction
- Export conversation data
- Generate reports

### Integration with Analytics:

You can integrate Chatbase with Google Analytics or other tools to track:
- Chatbot engagement
- Conversion rates
- User journey
- Popular topics

## Security & Privacy

### Data Handling:
- ✅ Conversations are encrypted in transit
- ✅ Data stored securely on Chatbase servers
- ✅ GDPR compliant
- ✅ Can be configured for data retention policies

### Best Practices:
- Don't collect sensitive personal information
- Include privacy notice in chat interface
- Provide opt-out options
- Regular review of conversation logs

## Maintenance

### Regular Tasks:

1. **Update Training Data**:
   - Add new FAQs
   - Update product information
   - Refine responses based on user feedback

2. **Monitor Performance**:
   - Check response accuracy
   - Review conversation logs
   - Analyze user satisfaction

3. **Optimize**:
   - Improve response quality
   - Add new capabilities
   - Update knowledge base

## Support

### Chatbase Resources:
- Dashboard: https://www.chatbase.co/dashboard
- Documentation: https://docs.chatbase.co
- Support: support@chatbase.co

### Implementation Files:
- Component: `src/components/ChatbaseWidget.tsx`
- Layout: `src/app/[locale]/layout.tsx`
- Environment: `.env.local`

## Next Steps

1. ✅ **Test the chatbot** on your local development server
2. ⏳ **Train the chatbot** with your content in Chatbase dashboard
3. ⏳ **Customize appearance** to match your brand
4. ⏳ **Deploy to production** via Vercel
5. ⏳ **Monitor and optimize** based on user interactions

---

**Status**: ✅ Fully Implemented and Ready to Use

The chatbot should now be visible on all pages of your website. Visit any page and look for the chat widget in the bottom-right corner!
