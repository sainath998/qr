// app/api/subscription/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const signature = request.headers.get('x-razorpay-signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

        if (!signature) {
            return NextResponse.json(
                { error: 'Webhook signature missing' },
                { status: 400 }
            );
        }

        const event = await request.json();
        const generatedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(event))
            .digest('hex');

        if (generatedSignature !== signature) {
            return NextResponse.json(
                { error: 'Invalid webhook signature' },
                { status: 400 }
            );
        }

        // Handle different webhook events
        switch (event.event) {
            case 'subscription.charged':
                // Handle successful payment
                break;
            case 'subscription.created':
                // Handle new subscription
                break;
            case 'subscription.cancelled':
                // Handle cancellation
                break;
            case 'subscription.paused':
                // Handle pause
                break;
            case 'subscription.resumed':
                // Handle resume
                break;
            default:
                return NextResponse.json(
                    { error: 'Unknown event type' },
                    { status: 400 }
                );
        }

        return NextResponse.json({ message: 'Webhook processed successfully' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Webhook processing failed' },
            { status: 500 }
        );
    }
}