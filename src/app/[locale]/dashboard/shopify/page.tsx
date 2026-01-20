import React from 'react';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import ShopifyDashboardClient from './ShopifyDashboardClient';
import ShopifyConnectClient from './ShopifyConnectClient';

export default async function ShopifyPage() {
    const session = await auth();
    const user = session?.user?.email
        ? await db.user.findUnique({
            where: { email: session.user.email },
            include: { integrations: true }
        })
        : null;

    const integration = user?.integrations?.find(i => i.provider === 'shopify');
    const isDemo = integration?.accessToken === 'demo_mode_token';

    if (!user?.shopifyConnected) {
        return <ShopifyConnectClient />;
    }

    return <ShopifyDashboardClient isDemo={isDemo} shopUrl={integration?.shopUrl || ''} />;
}
