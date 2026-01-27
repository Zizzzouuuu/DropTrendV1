import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { auth } from '@/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user || user.subscription === 'free') {
            return NextResponse.redirect(new URL('/pricing', req.url));
        }

        let customerId = user.stripeCustomerId;

        // Validation: If no customer ID but subscription is not free, we have a data sync issue.
        // Attempt to find customer by email
        if (!customerId) {
            const customers = await stripe.customers.list({ email: user.email, limit: 1 });
            if (customers.data.length > 0) {
                customerId = customers.data[0].id;
                // Sync back to DB
                await db.user.update({
                    where: { id: user.id },
                    data: { stripeCustomerId: customerId }
                });
            } else {
                // Should not happen if they are really Pro
                console.error("User marked as Pro but no Stripe Customer found.");
                return NextResponse.redirect(new URL('/pricing', req.url));
            }
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`,
        });

        return NextResponse.redirect(portalSession.url);

    } catch (error) {
        console.error("Stripe Portal Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
