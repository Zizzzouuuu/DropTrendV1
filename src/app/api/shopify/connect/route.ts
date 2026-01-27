import { NextRequest, NextResponse } from 'next/server';
import { getShopifyAuthUrl } from '@/lib/shopify/utils';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    let shop = searchParams.get('shop');

    if (!shop) {
        // Fallback or explicit error - User asked to eliminate 404s.
        // If no shop, we redirect to a manual entry form or Settings
        return NextResponse.redirect(new URL('/fr/dashboard/settings?error=missing_shop', req.url));
    }

    // Normalize shop URL
    shop = shop.trim().replace(/^https?:\/\//, '').replace(/\/$/, '');
    if (!shop.includes('.')) {
        shop += '.myshopify.com';
    }
    // Ensure shop is just domain, not full url path
    shop = shop.split('/')[0];

    try {
        const authUrl = getShopifyAuthUrl(shop);
        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error("Shopify Auth Error:", error);
        return NextResponse.redirect(new URL('/fr/dashboard/settings?error=config_error', req.url));
    }
}
