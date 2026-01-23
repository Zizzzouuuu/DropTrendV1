/**
 * AliExpress API Service
 * 
 * Uses aliexpress-true-api.p.rapidapi.com for real product data.
 */

export interface AliExpressProduct {
    id: string;
    title: string;
    imageUrl: string;
    imageHd: string;
    price: number;
    originalPrice?: number;
    sales: number;
    rating: number;
    reviews: number;
    supplier: string;
    shippingInfo: string;
    productUrl: string;
    category?: string;
}

export interface SearchOptions {
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    minSales?: number;
    page?: number;
    limit?: number;
    sort?: 'default' | 'price_asc' | 'price_desc' | 'orders_desc' | 'rating_desc';
}

export interface SearchResult {
    products: AliExpressProduct[];
    totalCount: number;
    page: number;
    hasMore: boolean;
}

/**
 * Search products on AliExpress via RapidAPI
 * Using aliexpress-true-api.p.rapidapi.com
 */
export async function searchAliExpressProducts(
    query: string,
    options: SearchOptions = {}
): Promise<SearchResult> {
    const {
        minPrice,
        maxPrice,
        page = 1,
        limit = 20,
        sort = 'orders_desc'
    } = options;

    if (!process.env.RAPIDAPI_KEY) {
        console.error('[AliExpress API] RAPIDAPI_KEY not configured');
        return { products: [], totalCount: 0, page: 1, hasMore: false };
    }

    try {
        const encodedQuery = encodeURIComponent(query);
        const host = 'aliexpress-true-api.p.rapidapi.com';

        // Map sort options
        let sortParam = 'LAST_VOLUME_DESC';
        if (sort === 'orders_desc') sortParam = 'LAST_VOLUME_DESC';
        else if (sort === 'price_asc') sortParam = 'SALE_PRICE_ASC';
        else if (sort === 'price_desc') sortParam = 'SALE_PRICE_DESC';

        // Build API URL
        const url = `https://${host}/api/v3/hot-products?target_language=EN&keywords=${encodedQuery}&page_size=${limit}&target_currency=EUR&sort=${sortParam}&page_no=${page}&ship_to_country=FR`;

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
            return { products: [], totalCount: 0, page, hasMore: false };
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
        // CASE 3: Object wrapper (encountered in debug: { products: { product: [...] } })
        else if (data.products && typeof data.products === 'object') {
            // Check if it has a 'product' array inside
            if (data.products.product && Array.isArray(data.products.product)) {
                console.log('[AliExpress API] Detected nested products.product array');
                rawProducts = data.products.product;
            }
            // Or just values (e.g. { products: { "0": {...}, "1": {...} } })
            else {
                console.log('[AliExpress API] Detected object products, extracting values');
                rawProducts = Object.values(data.products);
            }
        }

        console.log('[AliExpress API] Raw products count:', rawProducts.length);

        if (rawProducts.length === 0) {
            console.log('[AliExpress API] No products found for query:', query);
            // Log for debug
            if (data.products) console.log('Products keys:', Object.keys(data.products));
            return { products: [], totalCount: 0, page, hasMore: false };
        }

        const totalCount = data.total_record_count || data.current_record_count || rawProducts.length;

        // Flatten logic: ensure we have a list of PRODUCT OBJECTS, not arrays of products
        const flattenedItems: any[] = [];

        for (const item of rawProducts) {
            if (!item) continue;

            // If item is itself an array of products (some weird API responses)
            if (Array.isArray(item)) {
                flattenedItems.push(...item);
            }
            // If item is a wrapper { product: [...] } or { product: {...} }
            else if (item.product) {
                if (Array.isArray(item.product)) {
                    flattenedItems.push(...item.product);
                } else {
                    flattenedItems.push(item.product);
                }
            }
            // Otherwise assume item is the product
            else {
                flattenedItems.push(item);
            }
        }

        console.log('[AliExpress API] Flattened items:', flattenedItems.length);

        // Parse products
        const products: AliExpressProduct[] = flattenedItems
            .map((item: any) => parseAliExpressItem(item))
            .filter((product: AliExpressProduct) => {
                if (product.price <= 0) return false;
                if (minPrice && product.price < minPrice) return false;
                if (maxPrice && product.price > maxPrice) return false;
                return true;
            })
            .slice(0, limit);

        console.log('[AliExpress API] Final products:', products.length);

        return {
            products,
            totalCount,
            page,
            hasMore: rawProducts.length >= limit
        };

    } catch (error) {
        console.error('[AliExpress API] Exception:', error);
        return { products: [], totalCount: 0, page, hasMore: false };
    }
}

/**
 * Parse item from aliexpress-true-api format
 */
function parseAliExpressItem(item: any): AliExpressProduct {
    // Handle both nested and flat structures
    const product = item.product?.[0] || item;

    const productId = product.product_id || product.productId || product.item_id || 'unknown';

    // Extract price - try multiple fields
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
    } else if (product.target_original_price) {
        originalPrice = parseFloat(product.target_original_price);
    }

    // Extract sales
    let sales = 0;
    if (product.lastest_volume) {
        sales = parseInt(product.lastest_volume) || 0;
    } else if (product.latest_volume) {
        sales = parseInt(product.latest_volume) || 0;
    } else if (product.orders) {
        sales = parseInt(product.orders) || 0;
    }

    // Extract rating (usually percentage like "95.0%")
    let rating = 0;
    if (product.evaluate_rate) {
        const rateStr = String(product.evaluate_rate).replace('%', '');
        rating = parseFloat(rateStr) / 20; // Convert from 100 to 5 scale
    }

    // Get image
    const imageUrl = product.product_main_image_url ||
        product.product_small_image_urls?.[0] ||
        product.image_url ||
        'https://ae01.alicdn.com/kf/placeholder.jpg';

    return {
        id: String(productId),
        title: product.product_title || product.title || 'Unknown Product',
        imageUrl: imageUrl,
        imageHd: imageUrl,
        price: price || 0,
        originalPrice,
        sales: sales,
        rating: rating || 4.5,
        reviews: 0,
        supplier: product.shop_name || 'AliExpress Seller',
        shippingInfo: 'Free Shipping',
        productUrl: product.product_detail_url || product.promotion_link || `https://www.aliexpress.com/item/${productId}.html`,
        category: product.first_level_category_name || product.second_level_category_name || undefined
    };
}

/**
 * Get product details by ID using product-info endpoint
 */
export async function getProductDetails(productId: string): Promise<AliExpressProduct | null> {
    if (!process.env.RAPIDAPI_KEY) {
        return null;
    }

    try {
        const cleanId = productId.replace(/^ali_|^mock_/, '');
        const host = 'aliexpress-true-api.p.rapidapi.com';
        // Using product-info endpoint as requested
        const url = `https://${host}/api/v3/product-info?product_id=${cleanId}&target_currency=EUR&ship_to_country=FR&target_language=EN`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': host
            }
        });

        if (!response.ok) return null;

        const data = await response.json();
        // product-info might return an array with one item or the item directly
        let item = data.data || data.result || data;

        if (Array.isArray(item)) {
            item = item[0];
        }

        if (!item) return null;

        return parseAliExpressItem(item);
    } catch (error) {
        console.error('[AliExpress API] Details Error:', error);
        return null;
    }
}

/**
 * Get trending products by category
 */
export async function getTrendingByCategory(
    category: string,
    limit: number = 10
): Promise<AliExpressProduct[]> {
    const result = await searchAliExpressProducts(category, {
        sort: 'orders_desc',
        limit
    });
    return result.products;
}
