# 📡 ALMSTKSHF (المستكشف)

**ALMSTKSHF** is a cutting-edge Media Monitoring and Analysis platform designed to provide real-time insights, sentiment analysis, and crisis management solutions. Built with a focus on speed, security, and scalability.

## 🚀 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org) - React 19
- **Backend**: [Convex](https://convex.dev) - Real-time serverless database and functions
- **Authentication**: [Clerk](https://clerk.com) - Secure identity management
- **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/) - RTL/LTR support (English & Arabic)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) - Modern, utility-first CSS
- **AI Integration**: Google Gemini & Chatbase
- **Payments**: Stripe (Embedded Checkout)
- **Monitoring**: Vercel Analytics & OpenTelemetry

## 📂 Key Features

- **Media Pulse Dashboard**: Real-time tracking of media mentions and sentiment.
- **Lexcura Lawyer**: AI-powered legal document analysis and assistance.
- **Smart Media Assistant**: Automated crisis management and strategic communication plans.
- **Multi-locale Support**: Seamless Arabic and English user experience.

## 🛠️ Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Mode**:
   ```bash
   npm run dev
   ```
   *This starts both the Next.js frontend and the Convex backend concurrently.*

3. **Environment Setup**:
   Copy `.env.local.example` (if available) or ensure Clerk and Convex keys are set correctly.

## 📄 Documentation

- [Setup Guide](./SETUP_GUIDE.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Development Speed](./docs/DEVELOPMENT_SPEED.md)
- [Stripe Integration](./STRIPE_INTEGRATION_GUIDE.md)

## ⚖️ License

Private - All rights reserved.
