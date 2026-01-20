/**
 * Shopify Store Scraper Service
 * 
 * Scrapes publicly available data from Shopify stores via their products.json endpoint.
 * This is a legitimate API endpoint that Shopify exposes for all stores.
 */

export interface ScrapedProduct {
    id: string;
    title: string;
    vendor: string;
    productType: string;
    price: number;
    compareAtPrice?: number;
    imageUrl?: string;
    productUrl: string;
    createdAt: string;
    updatedAt: string;
}

export interface StoreData {
    shopName: string;
    url: string;
    logo?: string;
    products: ScrapedProduct[];
    stats: {
        totalProducts: number;
        avgPrice: number;
        minPrice: number;
        maxPrice: number;
        categories: string[];
        mainNiche: string;
        vendors: string[];
    };
    marketing: {
        facebookPixel: boolean;
        googleAnalytics: boolean;
        tiktokPixel: boolean;
    };
    estimatedTraffic: 'low' | 'medium' | 'high' | 'very_high';
    estimatedRevenue: string;
}

// Removing MOCK_STORES
/*
const MOCK_STORES... removed
function generateStoreFromUrl... removed
*/

/**
 * Scrape a Shopify store
 */
export async function scrapeShopifyStore(storeUrl: string): Promise<StoreData | null> {
    try {
        let url = storeUrl.trim();
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }
        // Normalize: remove trailing slash
        url = url.replace(/\/$/, '');

        // Construct products.json URL
        const productsUrl = `${url}/products.json?limit=10`;

        const response = await fetch(productsUrl);
        if (!response.ok) {
            console.error(`Failed to fetch ${productsUrl}: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const products = data.products || [];

        // Map to internal format
        const scrapedProducts: ScrapedProduct[] = products.map((p: any) => ({
            id: p.id.toString(),
            title: p.title,
            vendor: p.vendor,
            productType: p.product_type,
            price: parseFloat(p.variants?.[0]?.price || "0"),
            compareAtPrice: p.variants?.[0]?.compare_at_price ? parseFloat(p.variants[0].compare_at_price) : undefined,
            imageUrl: p.images?.[0]?.src || null,
            productUrl: `${url}/products/${p.handle}`,
            createdAt: p.created_at,
            updatedAt: p.updated_at
        }));

        // Calculate basic stats
        const vendors = [...new Set(scrapedProducts.map(p => p.vendor))];
        const prices = scrapedProducts.map(p => p.price);
        const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

        return {
            shopName: url.replace('https://', '').split('.')[0], // simple extraction
            url: url,
            logo: `https://ui-avatars.com/api/?name=${url.replace('https://', '')}&background=random&size=100`, // fallback
            products: scrapedProducts,
            stats: {
                totalProducts: scrapedProducts.length, // limitation of scraping limit=10
                avgPrice: Math.round(avgPrice * 100) / 100,
                minPrice: Math.min(...prices),
                maxPrice: Math.max(...prices),
                categories: [...new Set(scrapedProducts.map(p => p.productType))],
                mainNiche: scrapedProducts[0]?.productType || "General",
                vendors: vendors
            },
            marketing: {
                facebookPixel: false, // Cannot detect via server-side fetch easily
                googleAnalytics: false,
                tiktokPixel: false
            },
            estimatedTraffic: 'medium', // Cannot estimate without more data
            estimatedRevenue: 'N/A'
        };

    } catch (error) {
        console.error('Store scraping error:', error);
        return null;
    }
}

/**
 * Detect bestsellers based on product data (Simulated logic on real data)
 */
export function detectBestsellers(products: ScrapedProduct[]): ScrapedProduct[] {
    // Basic logic: older products might be bestsellers? Or rely on 'sold_out'?
    // Real Shopify scraping usually implies 'bestselling' sort order if not specified? 
    // Usually /collections/all?sort_by=best-selling works but requires HTML parsing.
    // products.json returns default sort (often creation date).

    // We just return top 3 for now
    return products.slice(0, 3);
}

// Keep helper functions if they don't depend on mocks
export function analyzePriceChanges(oldProducts: ScrapedProduct[], newProducts: ScrapedProduct[]) {
    // ... existing logic ...
    const oldMap = new Map(oldProducts.map(p => [p.id, p]));
    const newMap = new Map(newProducts.map(p => [p.id, p]));

    const increased: { product: ScrapedProduct; oldPrice: number; newPrice: number }[] = [];
    const decreased: { product: ScrapedProduct; oldPrice: number; newPrice: number }[] = [];
    const addedProducts: ScrapedProduct[] = [];
    const removedProducts: ScrapedProduct[] = [];

    for (const [id, newProduct] of newMap) {
        const oldProduct = oldMap.get(id);
        if (oldProduct) {
            if (newProduct.price > oldProduct.price) {
                increased.push({ product: newProduct, oldPrice: oldProduct.price, newPrice: newProduct.price });
            } else if (newProduct.price < oldProduct.price) {
                decreased.push({ product: newProduct, oldPrice: oldProduct.price, newPrice: newProduct.price });
            }
        } else {
            addedProducts.push(newProduct);
        }
    }

    // Find removed products
    for (const [id, oldProduct] of oldMap) {
        if (!newMap.has(id)) {
            removedProducts.push(oldProduct);
        }
    }

    return { increased, decreased, newProducts: addedProducts, removedProducts };
}

export function estimateTrafficLevel(store: StoreData): 'low' | 'medium' | 'high' | 'very_high' {
    return 'medium'; // Placeholder
}
