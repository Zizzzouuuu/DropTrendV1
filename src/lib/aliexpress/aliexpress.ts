/**
 * AliExpress Product Search Service
 * 
 * Uses aliexpress-true-api.p.rapidapi.com for real product data.
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

/**
 * Search for products on AliExpress using aliexpress-true-api
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
    const { page = 1, limit = 20, minPrice, maxPrice } = options;

    if (!process.env.RAPIDAPI_KEY) {
        console.error('[AliExpress] RAPIDAPI_KEY not configured');
        return [];
    }

    try {
        const encodedQuery = encodeURIComponent(query);
        const host = 'aliexpress-true-api.p.rapidapi.com';

        // Build API URL using hot-products endpoint
        const url = `https://${host}/api/v3/hot-products?target_language=EN&keywords=${encodedQuery}&page_size=${limit}&target_currency=EUR&sort=LAST_VOLUME_DESC&page_no=${page}&ship_to_country=FR`;

        console.log('[AliExpress API] Fetching:', url);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': host
            }
        });

        if (!response.ok) {
            console.error(`[AliExpress API] Error: ${response.status} ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        console.log('[AliExpress API] Response received, records:', data.current_record_count || data.total_record_count || 0);

        // Handle various response structures very defensively
        let rawProducts: any[] = [];

        // CASE 1: Standard array
        if (Array.isArray(data.products)) {
            rawProducts = data.products;
        }
        // CASE 2: Nested in data or result
        else if (data.data?.products && Array.isArray(data.data.products)) {
            rawProducts = data.data.products;
        } else if (data.result?.products && Array.isArray(data.result.products)) {
            rawProducts = data.result.products;
        }
        // CASE 3: Object wrapper
        else if (data.products && typeof data.products === 'object') {
            if (data.products.product && Array.isArray(data.products.product)) {
                rawProducts = data.products.product;
            } else {
                // If numeric keys, values
                rawProducts = Object.values(data.products);
            }
        }

        if (rawProducts.length === 0) {
            return [];
        }

        // Flatten logic
        const flattenedItems: any[] = [];

        for (const item of rawProducts) {
            if (!item) continue;

            if (Array.isArray(item)) {
                flattenedItems.push(...item);
            } else if (item.product) {
                if (Array.isArray(item.product)) {
                    flattenedItems.push(...item.product);
                } else {
                    flattenedItems.push(item.product);
                }
            } else {
                flattenedItems.push(item);
            }
        }

        // Parse and filter products
        return flattenedItems
            .map((item: any) => parseProduct(item))
            .filter((product: AliExpressSearchResult) => {
                if (product.price <= 0) return false;
                if (minPrice && product.price < minPrice) return false;
                if (maxPrice && product.price > maxPrice) return false;
                return true;
            })
            .slice(0, limit);

    } catch (error) {
        console.error('[AliExpress API] Exception:', error);
        return [];
    }
}

/**
 * Parse product from aliexpress-true-api format
 */
function parseProduct(item: any): AliExpressSearchResult {
    // Handle nested structure
    const product = item.product?.[0] || item;

    const productId = product.product_id || product.productId || product.item_id || 'unknown';

    // Extract price
    let price = 0;
    if (product.app_sale_price) {
        price = parseFloat(product.app_sale_price);
    } else if (product.target_sale_price) {
        price = parseFloat(product.target_sale_price);
    } else if (product.sale_price) {
        price = parseFloat(product.sale_price);
    } else if (product.original_price) {
        price = parseFloat(product.original_price);
    }

    // Extract original price
    let originalPrice: number | undefined;
    if (product.original_price) {
        originalPrice = parseFloat(product.original_price);
    }

    // Extract sales/orders
    let orders = 0;
    if (product.lastest_volume) {
        orders = parseInt(product.lastest_volume) || 0;
    } else if (product.latest_volume) {
        orders = parseInt(product.latest_volume) || 0;
    }

    // Extract rating
    let rating: number | undefined;
    if (product.evaluate_rate) {
        const rateStr = String(product.evaluate_rate).replace('%', '');
        rating = parseFloat(rateStr) / 20;
    }

    const imageUrl = product.product_main_image_url ||
        product.product_small_image_urls?.[0] ||
        'https://ae01.alicdn.com/kf/placeholder.jpg';

    return {
        id: String(productId),
        name: product.product_title || product.title || 'Unknown Product',
        price: price || 0,
        originalPrice,
        imageUrl: imageUrl,
        orders: orders,
        rating,
        shippingInfo: 'Free Shipping',
        productUrl: product.product_detail_url || product.promotion_link || `https://www.aliexpress.com/item/${productId}.html`,
        supplier: product.shop_name || 'AliExpress Seller'
    };
}

/**
 * Get detailed product information
 */
export async function getAliExpressProductDetails(productId: string): Promise<AliExpressProductDetails | null> {
    if (!process.env.RAPIDAPI_KEY) return null;

    try {
        const cleanId = productId.replace(/^ali_|^mock_/, '');
        const host = 'aliexpress-true-api.p.rapidapi.com';
        const url = `https://${host}/api/v3/product-detail?product_id=${cleanId}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': host
            }
        });

        if (!response.ok) return null;

        const data = await response.json();
        const item = data.data || data.result || data;

        if (!item) return null;

        const baseProduct = parseProduct(item);

        return {
            ...baseProduct,
            description: item.product_description || baseProduct.name,
            images: item.product_small_image_urls || [baseProduct.imageUrl],
            category: item.first_level_category_name,
            specifications: {}
        };
    } catch (error) {
        console.error('[AliExpress API] Details Error:', error);
        return null;
    }
}

/**
 * Get trending products
 */
export async function getTrendingProducts(limit: number = 10): Promise<AliExpressSearchResult[]> {
    return searchAliExpressProducts("trending gadgets", { limit });
}

/**
 * Get products by category/niche
 */
export async function getProductsByNiche(niche: string, limit: number = 10): Promise<AliExpressSearchResult[]> {
    return searchAliExpressProducts(niche, { limit });
}

export function detectNiche(productName: string): string {
    const niches: Record<string, string[]> = {
        'Tech & Gadgets': ['phone', 'wireless', 'bluetooth', 'usb', 'led', 'smart', 'charger'],
        'Health & Wellness': ['posture', 'massager', 'health', 'therapy'],
        'Home & Living': ['humidifier', 'projector', 'light', 'home', 'decor'],
        'Kitchen': ['blender', 'kitchen', 'cooking', 'food'],
        'Beauty': ['beauty', 'skin', 'hair', 'massage'],
        'Pets': ['pet', 'dog', 'cat', 'animal'],
        'Fitness': ['fitness', 'exercise', 'gym', 'sport']
    };

    const name = productName.toLowerCase();
    for (const [niche, keywords] of Object.entries(niches)) {
        if (keywords.some(kw => name.includes(kw))) {
            return niche;
        }
    }
    return 'General';
}

export const AVAILABLE_NICHES = [
    'Tech & Gadgets',
    'Health & Wellness',
    'Home & Living',
    'Kitchen',
    'Beauty',
    'Pets',
    'Fitness'
];
