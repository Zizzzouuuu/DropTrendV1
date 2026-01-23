'use server';

import { auth } from '@/auth';
import { searchAliExpressProducts, AliExpressProduct, SearchOptions } from '@/lib/api/aliexpress';
import { analyzeProductsBatch, quickBatchAnalyze, AnalyzedProduct } from '@/lib/ai/analyzer';
import { analyzeProductsBatchWithChain, FullAnalyzedProduct } from '@/lib/ai/chain-analyzer';

export interface WinnersSearchResult {
    products: AnalyzedProduct[];
    stats: {
        total: number;
        winners: number;
        potentials: number;
        risky: number;
    };
    error?: string;
}

/**
 * Search and analyze products - Main function for Winners page
 */
export async function searchAndAnalyzeProducts(
    query: string,
    options?: SearchOptions
): Promise<WinnersSearchResult> {
    try {
        // Verify authentication
        const session = await auth();
        if (!session?.user?.email) {
            return {
                products: [],
                stats: { total: 0, winners: 0, potentials: 0, risky: 0 },
                error: "Non authentifié"
            };
        }

        // Search on AliExpress with filters
        const searchResult = await searchAliExpressProducts(query, {
            minRating: 4.5,
            minSales: 100,
            limit: options?.limit || 15,
            sort: 'orders_desc',
            ...options
        });

        if (searchResult.products.length === 0) {
            return {
                products: [],
                stats: { total: 0, winners: 0, potentials: 0, risky: 0 },
                error: "Aucun produit trouvé. Essayez un autre mot-clé."
            };
        }

        // Analyze products with new Chain-of-Thought Analyzer
        const chainResults = await analyzeProductsBatchWithChain(searchResult.products);

        // Map to legacy AnalyzedProduct structure for frontend compatibility
        const products = chainResults.map(p => ({
            ...p,
            analysis: {
                trendScore: p.chainAnalysis.finalScore,
                status: p.chainAnalysis.status,
                suggestedPrice: p.chainAnalysis.profitability.suggestedPrice,
                profitPerUnit: p.chainAnalysis.profitability.netMarginPerUnit,
                profitMargin: p.chainAnalysis.profitability.profitMarginPercent,
                marketingAngles: [
                    'Produit à fort momentum',
                    'Potentiel de marge élevé',
                    'Opportunité de marché'
                ], // Default angles, ideally we'd generate these
                targetAudience: 'Acheteurs impulsifs & Passionnés',
                targetDemographic: {
                    ageRange: '25-45',
                    gender: 'mixte',
                    interests: ['lifestyle', 'trends']
                },
                trendReason: p.chainAnalysis.reasoning[0] || 'Analyse positive',
                competitionLevel: p.chainAnalysis.saturation.level === 'saturated' ? 'high' : p.chainAnalysis.saturation.level === 'low' ? 'low' : 'medium',
                viralPotential: p.chainAnalysis.finalScore > 80 ? 'high' : 'medium'
            }
        })) as AnalyzedProduct[];

        // Calculate stats
        const stats = {
            total: products.length,
            winners: products.filter(p => p.analysis.status === 'winner').length,
            potentials: products.filter(p => p.analysis.status === 'potential').length,
            risky: products.filter(p => p.analysis.status === 'risky').length
        };

        return { products, stats };

    } catch (error) {
        console.error('Search and Analyze Error:', error);
        return {
            products: [],
            stats: { total: 0, winners: 0, potentials: 0, risky: 0 },
            error: "Erreur lors de la recherche. Veuillez réessayer."
        };
    }
}

/**
 * Get trending winners of the day
 */
export async function getTrendingWinners(): Promise<WinnersSearchResult> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return {
                products: [],
                stats: { total: 0, winners: 0, potentials: 0, risky: 0 },
                error: "Non authentifié"
            };
        }

        // Search multiple trending categories
        const categories = [
            'gadgets 2024',
            'smart home devices',
            'beauty tools',
            'pet accessories',
            'fitness equipment'
        ];

        const allProducts: AliExpressProduct[] = [];

        for (const category of categories) {
            const result = await searchAliExpressProducts(category, {
                minRating: 4.5,
                minSales: 1000,
                limit: 5,
                sort: 'orders_desc'
            });
            allProducts.push(...result.products);
        }

        if (allProducts.length === 0) {
            return {
                products: [],
                stats: { total: 0, winners: 0, potentials: 0, risky: 0 },
                error: "Impossible de charger les tendances. Réessayez plus tard."
            };
        }

        // Remove duplicates by ID
        const uniqueProducts = allProducts.filter((product, index, self) =>
            index === self.findIndex(p => p.id === product.id)
        );

        // Analyze with AI
        const analyzedProducts = await quickBatchAnalyze(uniqueProducts.slice(0, 15));

        // Filter only winners and potentials for trending
        const filteredProducts = analyzedProducts.filter(
            p => p.analysis.status === 'winner' || p.analysis.status === 'potential'
        );

        const stats = {
            total: filteredProducts.length,
            winners: filteredProducts.filter(p => p.analysis.status === 'winner').length,
            potentials: filteredProducts.filter(p => p.analysis.status === 'potential').length,
            risky: 0
        };

        return { products: filteredProducts, stats };

    } catch (error) {
        console.error('Trending Winners Error:', error);
        return {
            products: [],
            stats: { total: 0, winners: 0, potentials: 0, risky: 0 },
            error: "Erreur lors du chargement des tendances."
        };
    }
}

/**
 * Analyze a single product in detail
 */
export async function analyzeProductDetail(productId: string): Promise<{
    product?: AnalyzedProduct;
    error?: string;
}> {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { error: "Non authentifié" };
        }

        // Import the detailed analyzer
        const { getProductDetails } = await import('@/lib/api/aliexpress');
        const { analyzeProductWithAI } = await import('@/lib/ai/analyzer');

        const product = await getProductDetails(productId);
        if (!product) {
            return { error: "Produit non trouvé" };
        }

        const analysis = await analyzeProductWithAI(product);

        return {
            product: { ...product, analysis }
        };

    } catch (error) {
        console.error('Product Detail Error:', error);
        return { error: "Erreur lors de l'analyse du produit" };
    }
}
