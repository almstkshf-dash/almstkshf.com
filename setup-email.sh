#!/bin/bash

# Quick Setup Script for Email Notifications
# Run this after getting your Resend API key

echo "🚀 Setting up email notifications for ALMSTKSHF..."
echo ""
echo "📧 Please enter your Resend API key (starts with 're_'):"
read -p "API Key: " RESEND_KEY

echo ""
echo "📬 Please enter the email address to receive notifications:"
read -p "Contact Email (default: k.account@almstkshf.com): " CONTACT_EMAIL
CONTACT_EMAIL=${CONTACT_EMAIL:-k.account@almstkshf.com}

echo ""
echo "⚙️  Setting Convex environment variables..."

npx convex env set RESEND_API_KEY "$RESEND_KEY"
npx convex env set CONTACT_EMAIL "$CONTACT_EMAIL"

echo ""
echo "✅ Environment variables set successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Restart your Convex dev server (Ctrl+C then 'npx convex dev')"
echo "   2. Test the contact form at: http://localhost:3000/en/contact"
echo "   3. Test the waitlist form at: http://localhost:3000/en/case-studies/styling-assistant"
echo ""
echo "📚 For more details, see EMAIL_SETUP_GUIDE.md"
