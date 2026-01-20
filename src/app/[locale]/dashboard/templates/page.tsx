import React from 'react';
import { auth } from '@/auth';
import { db } from '@/lib/db';
import TemplatesClient from './TemplatesClient';
import { SHOPIFY_TEMPLATES } from '@/lib/template-data';

export default async function TemplatesPage() {
    const session = await auth();
    const user = session?.user?.email
        ? await db.user.findUnique({ where: { email: session.user.email } })
        : null;

    const isPro = user?.subscription === 'pro';
    const isShopifyConnected = user?.shopifyConnected || false;

    // Add isLocked status based on subscription
    const templatesWithAccess = SHOPIFY_TEMPLATES.map(template => ({
        ...template,
        isLocked: template.isPro && !isPro
    }));

    return (
        <TemplatesClient
            templates={templatesWithAccess}
            isPro={isPro}
            isShopifyConnected={isShopifyConnected}
        />
    );
}
