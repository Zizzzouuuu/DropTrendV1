import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import Stripe from 'stripe';

// Disable Next.js body parser (handle raw body for signature verification)
export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            // For testing without secret - careful in prod
            // event = JSON.parse(body);
            return new NextResponse("Webhook Secret Missing", { status: 400 });
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan || 'pro';
        const interval = session.metadata?.interval || 'monthly';

        if (userId) {
            await db.user.update({
                where: { id: userId },
                data: {
                    subscription: plan,
                    subscriptionPlan: interval,
                    stripeCustomerId: session.customer as string
                }
            });
            console.log(`[STRIPE] User ${userId} upgraded to ${plan} (${interval})`);
        }
    }

    return new NextResponse(null, { status: 200 });
}
