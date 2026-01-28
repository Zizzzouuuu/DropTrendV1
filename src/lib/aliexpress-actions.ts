'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import {
    searchAliExpressProducts,
    getAliExpressProductDetails,
    getTrendingProducts,
    AliExpressSearchResult
} from '@/lib/aliexpress/aliexpress';
import { MOCK_PRODUCTS } from '@/lib/aliexpress/mock-data';
import { analyzeProduct, quickScore, ProductAnalysis } from '@/lib/ai/analyzer';

export interface SearchFilters {
    query: string;
    minPrice?: number;
    maxPrice?: number;
    minOrders?: number;
    minRating?: number;
    minScore?: number;
    limit?: number;
}

export interface ProductWithScore extends AliExpressSearchResult {
    quickScore: number;
    isSaved?: boolean;
}

/**
 * Search AliExpress products with quick scoring
 */
export async function searchProducts(filters: SearchFilters): Promise<{
    products: ProductWithScore[];
    error?: string
}> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { products: [], error: "Non authentifié" };
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
            include: { savedAliProducts: true }
        });

        if (!user) {
            return { products: [], error: "Utilisateur non trouvé" };
        }

        // Search products
        const results = await searchAliExpressProducts(filters.query, {
            minPrice: filters.minPrice,
            maxPrice: filters.maxPrice,
            minOrders: filters.minOrders,
            minRating: filters.minRating,
            limit: filters.limit || 20
        });

        // Add quick scores and saved status
        const productsWithScores: ProductWithScore[] = results.map(product => {
            const score = quickScore(product);
            const savedProduct = user.savedAliProducts.find(sp =>
                sp.productId.includes(product.id)
            );

            return {
                ...product,
                quickScore: score,
                isSaved: !!savedProduct
            };
        });

        // Filter by minimum score if specified
        const filtered = filters.minScore
            ? productsWithScores.filter(p => p.quickScore >= filters.minScore!)
            : productsWithScores;

        // Sort by score descending
        filtered.sort((a, b) => b.quickScore - a.quickScore);

        return { products: filtered };
    } catch (error) {
        console.error("Search error:", error);
        return { products: [], error: "Erreur lors de la recherche" };
    }
}

/**
 * Get trending products with scores
 */
export async function getTrending(limit: number = 10): Promise<{
    products: ProductWithScore[];
    error?: string
}> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { products: [], error: "Non authentifié" };
        }

        const results = await getTrendingProducts(limit);

        const productsWithScores: ProductWithScore[] = results.map(product => ({
            ...product,
            quickScore: quickScore(product)
        }));

        productsWithScores.sort((a, b) => b.quickScore - a.quickScore);

        return { products: productsWithScores };
    } catch (error) {
        console.error("Trending error:", error);
        return { products: [], error: "Erreur lors de la récupération des tendances" };
    }
}

/**
 * Get Winners of the Day - Products analyzed by AI (OpenAI GPT-4o-mini)
 * Real AI analysis to determine winning products
 */
export async function getWinnersOfTheDay(): Promise<{
    products: (ProductWithScore & { aiAnalysis?: string })[];
    error?: string;
}> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { products: [], error: "Non authentifié" };
        }

        // First, check if we have cached winners from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const cachedWinners = await db.aliExpressProduct.findMany({
            where: {
                winnerStatus: 'winner',
                analyzedAt: { gte: today }
            },
            orderBy: { aiScore: 'desc' },
            take: 12
        });

        // If we have cached winners from today, return them
        if (cachedWinners.length >= 6) {
            const products: (ProductWithScore & { aiAnalysis?: string })[] = cachedWinners.map(p => ({
                id: p.aliexpressId,
                name: p.name,
                price: p.price,
                originalPrice: p.originalPrice || undefined,
                imageUrl: p.imageUrl,
                orders: p.orders,
                rating: p.rating || undefined,
                shippingInfo: p.shippingInfo || undefined,
                productUrl: p.productUrl,
                supplier: p.supplier || undefined,
                quickScore: p.aiScore,
                aiAnalysis: p.marketingAngle || undefined
            }));
            return { products };
        }

        // Fetch fresh products from multiple categories
        const categories = ['gadgets', 'smart home', 'beauty tools', 'pet supplies', 'fitness equipment'];
        const candidateProducts: AliExpressSearchResult[] = [];

        for (const category of categories) {
            try {
                const results = await searchAliExpressProducts(category, {
                    minOrders: 3000,
                    limit: 6
                });
                candidateProducts.push(...results);
            } catch (err) {
                console.error(`Error fetching ${category}:`, err);
            }
        }

        if (candidateProducts.length === 0) {
            console.log("No live products found, using mocks.");
            candidateProducts.push(...MOCK_PRODUCTS);
        }

        // Use AI to analyze and select the best winners
        const analyzedProducts: (ProductWithScore & { aiAnalysis?: string })[] = [];

        // Batch analyze with OpenAI - ask AI to pick the best winners
        if (process.env.OPENAI_API_KEY) {
            try {
                // Prepare product summaries for AI
                const productSummaries = candidateProducts.slice(0, 20).map((p, i) =>
                    `${i + 1}. "${p.name}" - Prix: ${p.price}€, Commandes: ${p.orders}, Note: ${p.rating || 'N/A'}`
                ).join('\n');

                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [
                            {
                                role: 'system',
                                content: `Tu es un expert en dropshipping. Analyse cette liste de produits et sélectionne les 8 meilleurs "Winners" (produits à fort potentiel de vente).

Critères d'un Winner:
- Résout un problème clair
- Prix permettant une marge x3 minimum
- Fort potentiel viral (TikTok, Instagram)
- Pas trop de concurrence saturée
- "Wow factor" élevé

Retourne un JSON avec exactement ce format:
{
  "winners": [
    {"index": 1, "score": 85, "reason": "Courte raison en français"},
    ...
  ]
}
Où "index" est le numéro du produit dans la liste, "score" est un score de 0-100, et "reason" est une courte explication.`
                            },
                            {
                                role: 'user',
                                content: `Voici les produits à analyser:\n\n${productSummaries}\n\nSélectionne les 8 meilleurs Winners.`
                            }
                        ],
                        response_format: { type: 'json_object' },
                        max_tokens: 1000,
                        temperature: 0.7
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const aiResult = JSON.parse(data.choices[0].message.content);

                    if (aiResult.winners && Array.isArray(aiResult.winners)) {
                        for (const winner of aiResult.winners) {
                            const productIndex = winner.index - 1;
                            if (productIndex >= 0 && productIndex < candidateProducts.length) {
                                const product = candidateProducts[productIndex];

                                // Save to database with AI analysis
                                try {
                                    await db.aliExpressProduct.upsert({
                                        where: { aliexpressId: product.id },
                                        update: {
                                            aiScore: winner.score,
                                            winnerStatus: winner.score >= 80 ? 'winner' : 'potential',
                                            marketingAngle: winner.reason,
                                            analyzedAt: new Date()
                                        },
                                        create: {
                                            aliexpressId: product.id,
                                            name: product.name,
                                            description: product.name, // Use name as fallback since AliExpressSearchResult doesn't have description
                                            price: product.price,
                                            originalPrice: product.originalPrice,
                                            rating: product.rating,
                                            orders: product.orders,
                                            imageUrl: product.imageUrl,
                                            productUrl: product.productUrl,
                                            aiScore: winner.score,
                                            winnerStatus: winner.score >= 80 ? 'winner' : 'potential',
                                            marketingAngle: winner.reason,
                                            analyzedAt: new Date()
                                        }
                                    });
                                } catch (dbError) {
                                    console.error('DB save error:', dbError);
                                }

                                analyzedProducts.push({
                                    ...product,
                                    quickScore: winner.score,
                                    aiAnalysis: winner.reason
                                });
                            }
                        }
                    }
                }
            } catch (aiError) {
                console.error('AI Analysis error:', aiError);
            }
        }

        // Fallback to mathematical scoring if AI fails
        if (analyzedProducts.length === 0) {
            for (const product of candidateProducts.slice(0, 12)) {
                const analysis = await analyzeProduct(product);
                if (analysis.winnerStatus === 'winner' || analysis.winnerStatus === 'potential') {
                    analyzedProducts.push({
                        ...product,
                        quickScore: analysis.overallScore,
                        aiAnalysis: analysis.marketingAngle
                    });
                }
            }
        }

        // Sort by score and return top winners
        analyzedProducts.sort((a, b) => b.quickScore - a.quickScore);

        return { products: analyzedProducts.slice(0, 12) };
    } catch (error) {
        console.error("Winners error:", error);
        return { products: [], error: "Erreur lors de la récupération des winners" };
    }
}

/**
 * Get full AI analysis for a product
 */
export async function getProductAnalysis(productId: string): Promise<{
    analysis?: ProductAnalysis & { product: AliExpressSearchResult };
    error?: string
}> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { error: "Non authentifié" };
        }

        // Get product details
        const product = await getAliExpressProductDetails(productId);
        if (!product) {
            return { error: "Produit non trouvé" };
        }

        // Run AI analysis
        const analysis = await analyzeProduct(product);

        // Store in database for caching
        const existingProduct = await db.aliExpressProduct.findUnique({
            where: { aliexpressId: productId }
        });

        if (!existingProduct) {
            await db.aliExpressProduct.create({
                data: {
                    aliexpressId: product.id,
                    name: product.name,
                    description: product.description || "",
                    price: product.price,
                    originalPrice: product.originalPrice,
                    rating: product.rating,
                    orders: product.orders,
                    imageUrl: product.imageUrl,
                    images: JSON.stringify(product.images || []),
                    supplier: product.supplier,
                    shippingInfo: product.shippingInfo,
                    productUrl: product.productUrl,
                    category: product.category,
                    aiScore: analysis.overallScore,
                    winnerStatus: analysis.winnerStatus,
                    niche: analysis.niche,
                    trendScore: analysis.trendScore,
                    competitionLevel: analysis.competitionLevel,
                    profitMargin: analysis.profitMargin,
                    suggestedPrice: analysis.suggestedPrice,
                    marketingAngle: analysis.marketingAngle,
                    targetAudience: analysis.targetAudience,
                    analyzedAt: new Date()
                }
            });
        } else {
            await db.aliExpressProduct.update({
                where: { aliexpressId: productId },
                data: {
                    aiScore: analysis.overallScore,
                    winnerStatus: analysis.winnerStatus,
                    niche: analysis.niche,
                    trendScore: analysis.trendScore,
                    competitionLevel: analysis.competitionLevel,
                    profitMargin: analysis.profitMargin,
                    suggestedPrice: analysis.suggestedPrice,
                    marketingAngle: analysis.marketingAngle,
                    analyzedAt: new Date()
                }
            });
        }

        return {
            analysis: {
                ...analysis,
                product
            }
        };
    } catch (error) {
        console.error("Analysis error:", error);
        return { error: "Erreur lors de l'analyse" };
    }
}

/**
 * Save/Unsave a product
 */
export async function toggleSaveProduct(aliexpressId: string): Promise<{
    saved: boolean;
    error?: string
}> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { saved: false, error: "Non authentifié" };
        }

        const user = await db.user.findUnique({ where: { email: session.user.email } });
        if (!user) {
            return { saved: false, error: "Utilisateur non trouvé" };
        }

        // Ensure product exists in DB
        let dbProduct = await db.aliExpressProduct.findUnique({
            where: { aliexpressId }
        });

        if (!dbProduct) {
            // Fetch and create
            const product = await getAliExpressProductDetails(aliexpressId);
            if (!product) {
                return { saved: false, error: "Produit non trouvé" };
            }

            dbProduct = await db.aliExpressProduct.create({
                data: {
                    aliexpressId: product.id,
                    name: product.name,
                    description: product.description || "",
                    price: product.price,
                    originalPrice: product.originalPrice,
                    rating: product.rating,
                    orders: product.orders,
                    imageUrl: product.imageUrl,
                    productUrl: product.productUrl,
                    category: product.category
                }
            });
        }

        // Check if already saved
        const existing = await db.savedAliProduct.findUnique({
            where: {
                userId_productId: {
                    userId: user.id,
                    productId: dbProduct.id
                }
            }
        });

        if (existing) {
            // Unsave
            await db.savedAliProduct.delete({ where: { id: existing.id } });
            revalidatePath('/[locale]/dashboard/sourcing');
            return { saved: false };
        } else {
            // Save
            await db.savedAliProduct.create({
                data: {
                    userId: user.id,
                    productId: dbProduct.id
                }
            });
            revalidatePath('/[locale]/dashboard/sourcing');
            return { saved: true };
        }
    } catch (error) {
        console.error("Save error:", error);
        return { saved: false, error: "Erreur lors de la sauvegarde" };
    }
}

/**
 * Import product to Shopify store
 */
export async function importToShopify(
    aliexpressId: string,
    sellingPrice: number,
    customTitle?: string
): Promise<{
    success: boolean;
    shopifyProductId?: string;
    error?: string
}> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, error: "Non authentifié" };
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
            include: { integrations: true }
        });

        if (!user) {
            return { success: false, error: "Utilisateur non trouvé" };
        }

        // Check Shopify connection
        const shopifyIntegration = user.integrations.find(i => i.provider === 'shopify');
        if (!shopifyIntegration || !user.shopifyConnected) {
            return { success: false, error: "Boutique Shopify non connectée" };
        }

        // Get product from DB
        const dbProduct = await db.aliExpressProduct.findUnique({
            where: { aliexpressId }
        });

        if (!dbProduct) {
            return { success: false, error: "Produit non trouvé dans la base de données" };
        }

        // Create import record
        const importRecord = await db.shopifyImport.create({
            data: {
                userId: user.id,
                aliProductId: dbProduct.id,
                status: 'importing',
                sellingPrice
            }
        });

        try {
            // Create product in Shopify
            const shopifyProduct = await createShopifyProduct(
                shopifyIntegration.accessToken,
                shopifyIntegration.shopUrl!,
                {
                    title: customTitle || dbProduct.name,
                    body_html: dbProduct.description,
                    vendor: dbProduct.supplier || "DropTrend Import",
                    product_type: dbProduct.niche || dbProduct.category || "General",
                    images: dbProduct.images ? JSON.parse(dbProduct.images).map((url: string) => ({ src: url })) : [{ src: dbProduct.imageUrl }],
                    variants: [{
                        price: sellingPrice.toString(),
                        compare_at_price: (sellingPrice * 1.5).toFixed(2),
                        inventory_management: null,
                        requires_shipping: true
                    }]
                }
            );

            // Update import record
            await db.shopifyImport.update({
                where: { id: importRecord.id },
                data: {
                    status: 'success',
                    shopifyProductId: shopifyProduct.id
                }
            });

            revalidatePath('/[locale]/dashboard/shopify');
            return { success: true, shopifyProductId: shopifyProduct.id };

        } catch (shopifyError) {
            // Update import record with error
            await db.shopifyImport.update({
                where: { id: importRecord.id },
                data: {
                    status: 'failed',
                    error: shopifyError instanceof Error ? shopifyError.message : 'Unknown error'
                }
            });

            return { success: false, error: "Erreur lors de l'import Shopify" };
        }
    } catch (error) {
        console.error("Import error:", error);
        return { success: false, error: "Erreur lors de l'import" };
    }
}

/**
 * Get saved products for current user
 */
export async function getSavedProducts(): Promise<{
    products: (ProductWithScore & { savedAt: Date; dbId: string })[];
    error?: string;
}> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { products: [], error: "Non authentifié" };
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email },
            include: {
                savedAliProducts: {
                    include: { product: true },
                    orderBy: { savedAt: 'desc' }
                }
            }
        });

        if (!user) {
            return { products: [], error: "Utilisateur non trouvé" };
        }

        const products = user.savedAliProducts.map(sp => ({
            id: sp.product.aliexpressId,
            dbId: sp.product.id,
            name: sp.product.name,
            price: sp.product.price,
            originalPrice: sp.product.originalPrice || undefined,
            imageUrl: sp.product.imageUrl,
            orders: sp.product.orders,
            rating: sp.product.rating || undefined,
            shippingInfo: sp.product.shippingInfo || undefined,
            productUrl: sp.product.productUrl,
            supplier: sp.product.supplier || undefined,
            quickScore: sp.product.aiScore,
            isSaved: true,
            savedAt: sp.savedAt
        }));

        return { products };
    } catch (error) {
        console.error("Get saved error:", error);
        return { products: [], error: "Erreur lors de la récupération" };
    }
}

/**
 * Get import history for current user
 */
export async function getImportHistory(): Promise<{
    imports: Array<{
        id: string;
        productName: string;
        productImage: string;
        sellingPrice: number | null;
        status: string;
        shopifyProductId: string | null;
        importedAt: Date;
    }>;
    error?: string;
}> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { imports: [], error: "Non authentifié" };
        }

        const user = await db.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return { imports: [], error: "Utilisateur non trouvé" };
        }

        const imports = await db.shopifyImport.findMany({
            where: { userId: user.id },
            include: { aliProduct: true },
            orderBy: { importedAt: 'desc' },
            take: 50
        });

        return {
            imports: imports.map(i => ({
                id: i.id,
                productName: i.aliProduct.name,
                productImage: i.aliProduct.imageUrl,
                sellingPrice: i.sellingPrice,
                status: i.status,
                shopifyProductId: i.shopifyProductId,
                importedAt: i.importedAt
            }))
        };
    } catch (error) {
        console.error("Get history error:", error);
        return { imports: [], error: "Erreur lors de la récupération" };
    }
}

// Helper function to create product in Shopify
async function createShopifyProduct(
    accessToken: string,
    shopUrl: string,
    productData: {
        title: string;
        body_html: string;
        vendor: string;
        product_type: string;
        images: { src: string }[];
        variants: {
            price: string;
            compare_at_price: string;
            inventory_management: null;
            requires_shipping: boolean;
        }[];
    }
): Promise<{ id: string }> {
    // In production, this would call Shopify API
    // For demo, we simulate success
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if we have valid credentials (non-mock)
    if (!accessToken.includes('mock')) {
        const response = await fetch(
            `https://${shopUrl}/admin/api/2024-01/products.json`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Shopify-Access-Token': accessToken
                },
                body: JSON.stringify({ product: productData })
            }
        );

        if (!response.ok) {
            throw new Error(`Shopify API error: ${response.statusText}`);
        }

        const data = await response.json();
        return { id: data.product.id.toString() };
    }

    // Mock response for demo
    return { id: `mock_${Date.now()}` };
}

/**
 * Get data for Profit Calculator from URL
 */
export async function getCalculatorData(url: string): Promise<{
    product?: {
        id: string;
        name: string;
        price: number;
        imageUrl: string;
        suggestedPrice?: number;
    };
    error?: string;
}> {
    try {
        // 1. Extract ID from URL
        // Regex supports:
        // - Standard: aliexpress.com/item/123456789.html
        // - Short: aliexpress.com/item/123456789.html?params...
        // - Params: productId=123456789
        // - ID only: 123456789
        const idMatch = url.match(/\/item\/(\d+)\.html/) ||
            url.match(/productId=(\d+)/) ||
            url.match(/(\d{10,})/); // Fallback for raw ID

        if (!idMatch) {
            return { error: "Format de lien non reconnu. Utilisez un lien complet (ex: https://fr.aliexpress.com/item/10050012345678.html)" };
        }
        const productId = idMatch[1];

        // 2. Fetch Analysis (which includes details)
        const result = await getProductAnalysis(productId);

        if (result.error || !result.analysis) {
            return { error: result.error || "Impossible de récupérer les infos du produit." };
        }

        const { product, suggestedPrice } = result.analysis; // CORRECTED PROPERTY

        return {
            product: {
                id: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                suggestedPrice: suggestedPrice // CORRECTED USAGE
            }
        };

    } catch (error) {
        console.error("Calculator Error:", error);
        return { error: "Erreur technique lors de l'analyse." };
    }
}
