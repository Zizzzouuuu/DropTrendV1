import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const { plan, interval } = await req.json(); // plan='pro', interval='monthly'|'yearly'

        if (plan !== 'pro') {
            return new NextResponse("Invalid plan", { status: 400 });
        }

        const price = interval === 'yearly'
            ? 24300 // 243.00 EUR
            : 2900; // 29.00 EUR

        const productName = interval === 'yearly' ? 'DropTrend Pro (Yearly)' : 'DropTrend Pro (Monthly)';

        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: productName,
                            description: 'Access to all DropTrend features: AI Sourcing, Spy Tool, Shopify Import.',
                        },
                        unit_amount: price,
                        recurring: {
                            interval: interval === 'yearly' ? 'year' : 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId: user.id,
                plan: plan,
                interval: interval,
            },
            customer_email: user.email!, // Pre-fill email
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/fr/dashboard?payment=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/fr/pricing?canceled=true`,
        });

        return NextResponse.json({ url: checkoutSession.url });

    } catch (error) {
        console.error("[STRIPE_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
