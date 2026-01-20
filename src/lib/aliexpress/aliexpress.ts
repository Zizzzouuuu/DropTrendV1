/**
 * AliExpress Product Scraper Service
 * 
 * This service provides methods to search and scrape product data from AliExpress.
 * Note: This uses web scraping techniques and should be used responsibly.
 */

export interface AliExpressSearchResult {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    orders: number;
    rating?: number;
    shippingInfo?: string;
    productUrl: string;
    supplier?: string;
}

export interface AliExpressProductDetails extends AliExpressSearchResult {
    description: string;
    images: string[];
    category?: string;
    specifications?: Record<string, string>;
}

// Removing MOCK_PRODUCTS to force real API usage
/* const MOCK_PRODUCTS = [...]; removed */

const NICHE_KEYWORDS: Record<string, string[]> = {
    // Keeping keywords for fallback niche detection
    "Tech & Gadgets": ["phone", "wireless", "bluetooth", "usb", "led", "smart", "charger"],
    "Health & Wellness": ["posture", "massager", "health", "therapy"],
    "Home & Living": ["humidifier", "projector", "light", "home", "decor"],
    "Kitchen": ["blender", "kitchen", "cooking", "food"],
    "Beauty": ["beauty", "skin", "hair", "massage"],
    "Pets": ["pet", "dog", "cat", "animal"],
    "Fitness": ["fitness", "exercise", "gym", "sport"],
    "Fashion": ["fashion", "jewelry", "watch", "bag"]
};

/**
 * Search for products on AliExpress using RapidAPI
 */
export async function searchAliExpressProducts(
    query: string,
    options: {
        minPrice?: number;
        maxPrice?: number;
        minOrders?: number;
        minRating?: number;
        page?: number;
        limit?: number;
    } = {}
): Promise<AliExpressSearchResult[]> {

    // Real API Call
    if (process.env.RAPIDAPI_KEY) {
        try {
            const encodedQuery = encodeURIComponent(query);
            const page = options.page || 1;
            const sort = "default"; // or orders_desc

            // Using AliExpress DataHub API endpoints
            const url = `https://${process.env.RAPIDAPI_HOST || 'aliexpress-datahub.p.rapidapi.com'}/item_search?q=${encodedQuery}&page=${page}&sort=ordersDesc`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
                    'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'aliexpress-datahub.p.rapidapi.com'
                }
            });

            if (!response.ok) {
                console.error(`RapidAPI Error: ${response.status} ${response.statusText} - Check RapidAPI Subscription`);
                return [];
            }

            const data = await response.json();
            // DataHub structure (based on typical DataHub response): 
            // result: { resultList: [ ... ] }
            const items = data.result?.resultList || [];

            return items.map((item: any) => ({
                id: item.itemId || item.item_id,
                name: item.title,
                price: item.sku?.def?.price ? parseFloat(item.sku.def.price) : (item.price?.current_price || 0),
                originalPrice: item.sku?.def?.promotionPrice ? parseFloat(item.sku.def.promotionPrice) : undefined,
                imageUrl: item.image || item.mainImage || "https://via.placeholder.com/300",
                orders: item.sales || item.trade?.tradeDesc ? parseInt(item.trade.tradeDesc.replace(/\D/g, '')) : 0,
                rating: item.evaluation?.starRating || 0,
                shippingInfo: "Shipping Info N/A",
                productUrl: `https://www.aliexpress.com/item/${item.itemId || item.item_id}.html`,
                supplier: item.store?.storeName || "AliExpress Seller"
            })).slice(0, options.limit || 20);

        } catch (error) {
            console.error("AliExpress Search Failed:", error);
            return []; // Return empty regarding error
        }
    }

    return []; // Return empty if no key
}

/**
 * Get detailed product information
 * (Kept as Best Effort / Mock for now as user only requested Real Search)
 */
export async function getAliExpressProductDetails(productId: string): Promise<AliExpressProductDetails | null> {
    if (!process.env.RAPIDAPI_KEY) return null;

    try {
        // Clean ID if necessary (sometimes comes as ali_123 or just 123)
        const cleanId = productId.replace(/^ali_/, '');

        const url = `https://${process.env.RAPIDAPI_HOST || 'aliexpress-datahub.p.rapidapi.com'}/item_detail_2?itemId=${cleanId}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': process.env.RAPIDAPI_HOST || 'aliexpress-datahub.p.rapidapi.com'
            }
        });

        if (!response.ok) return null;

        const data = await response.json();
        const item = data.result?.item;

        if (!item) return null;

        return {
            id: item.itemId,
            name: item.title,
            price: item.sku?.def?.price ? parseFloat(item.sku.def.price) : (item.price?.current_price || 0),
            originalPrice: item.sku?.def?.promotionPrice ? parseFloat(item.sku.def.promotionPrice) : undefined,
            imageUrl: item.image || item.mainImage || "https://via.placeholder.com/300",
            orders: item.sales || 0,
            rating: item.evaluation?.starRating || 0,
            shippingInfo: "Shipping Info Available",
            productUrl: `https://www.aliexpress.com/item/${item.itemId}.html`,
            supplier: item.store?.storeName || "AliExpress Seller",
            // Detail fields
            description: item.description?.text || item.title, // Fallback as full description text is often separate or HTML
            images: item.images || [item.image],
            category: "General",
            specifications: item.sku?.props ?
                item.sku.props.reduce((acc: any, prop: any) => {
                    acc[prop.name] = prop.value;
                    return acc;
                }, {}) : {}
        };

    } catch (error) {
        console.error("AliExpress Details Fetch Failed:", error);
        return null;
    }
}

/**
 * Get trending products (Simulated via generic search)
 */
export async function getTrendingProducts(limit: number = 10): Promise<AliExpressSearchResult[]> {
    return searchAliExpressProducts("trending products", { limit });
}

/**
 * Get products by category/niche (Real search)
 */
export async function getProductsByNiche(niche: string, limit: number = 10): Promise<AliExpressSearchResult[]> {
    return searchAliExpressProducts(niche, { limit });
}

function generateProductDescription(productName: string): string {
    return `Product: ${productName}. Description fetched from AliExpress.`;
}

export function detectNiche(productName: string): string {
    for (const [niche, keywords] of Object.entries(NICHE_KEYWORDS)) {
        if (keywords.some(kw => productName.toLowerCase().includes(kw))) {
            return niche;
        }
    }
    return "General";
}

export const AVAILABLE_NICHES = Object.keys(NICHE_KEYWORDS);
