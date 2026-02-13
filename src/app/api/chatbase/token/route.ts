import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
    try {
        const secret = process.env.CHATBOT_IDENTITY_SECRET;

        if (!secret) {
            return NextResponse.json(
                { error: 'Chatbot identity secret not configured' },
                { status: 500 }
            );
        }

        // For now, we'll create a guest/anonymous user token
        // You can integrate with your authentication system (Clerk, Auth0, etc.) later
        const sessionId = request.cookies.get('session_id')?.value || generateSessionId();

        // Get user info from your auth system
        // For now, using anonymous/guest user
        const userPayload = {
            user_id: sessionId,
            email: 'guest@almstkshf.com',
            is_guest: true,
            // Add any custom attributes you want to pass to Chatbase
            // stripe_accounts: user.stripe_accounts,
            // subscription_tier: user.subscription_tier,
        };

        // Generate JWT token
        const token = jwt.sign(userPayload, secret, { expiresIn: '1h' });

        // Set session cookie if it doesn't exist
        const response = NextResponse.json({ token });

        try {
            if (!request.cookies.get('session_id')) {
                response.cookies.set('session_id', sessionId, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 30, // 30 days
                });
            }
        } catch (cookieError) {
            console.warn('Error setting session cookie:', cookieError);
            // Verify we can still return the token even if cookie setting fails
        }

        return response;
    } catch (error: any) {
        console.error('Error generating chatbase token:', error);
        return NextResponse.json(
            { error: 'Failed to generate token', details: error.message },
            { status: 500 }
        );
    }
}

function generateSessionId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}
