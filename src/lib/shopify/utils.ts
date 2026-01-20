import crypto from 'crypto';

export const SHOPIFY_API_VERSION = '2024-01';

export function getShopifyAuthUrl(shop: string) {
    const scopes = process.env.SHOPIFY_SCOPES || 'read_products,write_products';
    const redirectUri = process.env.SHOPIFY_REDIRECT_URI;
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    // Use cryptographically secure random bytes for nonce
    const nonce = crypto.randomBytes(16).toString('hex');

    if (!clientId || !redirectUri) {
        throw new Error("Missing Shopify Environment Variables");
    }

    return `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}&state=${nonce}`;
}

export function verifyShopifyHmac(queryParams: URLSearchParams): boolean {
    const hmac = queryParams.get('hmac');
    const secret = process.env.SHOPIFY_CLIENT_SECRET;

    if (!hmac || !secret) return false;

    // Remove hmac from params to recreate the message
    const params = new URLSearchParams(queryParams);
    params.delete('hmac');

    // Sort keys lexically
    const message = Array.from(params.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

    const generatedHmac = crypto
        .createHmac('sha256', secret)
        .update(message)
        .digest('hex');

    // Timing safe comparison
    try {
        return crypto.timingSafeEqual(
            Buffer.from(generatedHmac),
            Buffer.from(hmac)
        );
    } catch (e) {
        return false;
    }
}

export async function exchangeShopifyToken(shop: string, code: string) {
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

    const body = {
        client_id: clientId,
        client_secret: clientSecret,
        code,
    };

    const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(`Shopify Token Exchange Failed: ${response.statusText}`);
    }

    return response.json();
}
