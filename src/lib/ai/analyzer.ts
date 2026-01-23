/**
 * AI Product Analyzer
 * 
 * Uses OpenAI GPT-4o-mini to analyze products and determine their winning potential.
 * Provides trend scores, pricing recommendations, and marketing angles.
 */

import { AliExpressProduct } from '@/lib/api/aliexpress';

export interface AIProductAnalysis {
    // Core Scores
    trendScore: number; // 0-100
    status: 'winner' | 'potential' | 'risky';

    // Pricing Analysis
    suggestedPrice: number;
    profitPerUnit: number;
    profitMargin: number;

    // Marketing Insights
    marketingAngles: string[];
    targetAudience: string;
    targetDemographic: {
        ageRange: string;
        gender: string;
        interests: string[];
    };

    // Additional Insights
    trendReason: string;
    competitionLevel: 'low' | 'medium' | 'high';
    viralPotential: 'low' | 'medium' | 'high';
}

// Legacy interface for backward compatibility with existing code
export interface ProductAnalysis {
    overallScore: number;
    profitabilityScore: number;
    trendScore: number;
    competitionScore: number;
    winnerStatus: 'winner' | 'potential' | 'risky' | 'rejected';
    suggestedPrice: number;
    profitMargin: number;
    profitPerUnit: number;
    niche: string;
    targetAudience: string;
    marketingAngle: string;
    marketingAngles: string[];
    adHooks: string[];
    competitionLevel: 'low' | 'medium' | 'high';
    competitors: string[];
    factors: {
        name: string;
        score: number;
        description: string;
        positive: boolean;
    }[];
}

export interface AnalyzedProduct extends AliExpressProduct {
    analysis: AIProductAnalysis;
}

/**
 * Analyze a single product using GPT-4o-mini
 */
export async function analyzeProductWithAI(product: AliExpressProduct): Promise<AIProductAnalysis> {
    // Default fallback analysis
    const defaultAnalysis = createFallbackAnalysis(product);

    if (!process.env.OPENAI_API_KEY) {
        console.warn('OPENAI_API_KEY not configured, using fallback analysis');
        return defaultAnalysis;
    }

    try {
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
                        content: `Tu es un expert en Dropshipping avec 10 ans d'expérience. Tu analyses des produits pour déterminer leur potentiel de vente.

Pour chaque produit, tu dois fournir une analyse complète en JSON avec:
- trendScore: Score de tendance de 0 à 100 (80+ = Winner, 60-79 = Potentiel, <60 = Risqué)
- suggestedPrice: Prix de vente conseillé (généralement marge x3 du prix fournisseur)
- marketingAngles: Les 3 meilleurs angles marketing en français (max 15 mots chacun)
- targetAudience: Description de la cible en une phrase
- targetDemographic: { ageRange: "18-35", gender: "mixte/homme/femme", interests: ["intérêt1", "intérêt2"] }
- trendReason: Pourquoi ce score de tendance (1 phrase)
- competitionLevel: "low", "medium" ou "high"
- viralPotential: "low", "medium" ou "high"

Réponds UNIQUEMENT en JSON valide, sans markdown.`
                    },
                    {
                        role: 'user',
                        content: `Analyse ce produit :
Titre: "${product.title}"
Prix fournisseur: ${product.price}€
Ventes: ${product.sales} ventes
Note: ${product.rating}/5 (${product.reviews} avis)
Catégorie: ${product.category || 'Général'}

Donne ton analyse complète.`
                    }
                ],
                response_format: { type: 'json_object' },
                max_tokens: 600,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            console.error('OpenAI API Error:', await response.text());
            return defaultAnalysis;
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            return defaultAnalysis;
        }

        const aiResult = JSON.parse(content);

        // Calculate derived values
        const trendScore = Math.min(100, Math.max(0, aiResult.trendScore || 50));
        const suggestedPrice = aiResult.suggestedPrice || product.price * 3;
        const profitPerUnit = suggestedPrice - product.price;
        const profitMargin = Math.round((profitPerUnit / suggestedPrice) * 100);

        // Determine status based on score
        let status: 'winner' | 'potential' | 'risky';
        if (trendScore >= 80) status = 'winner';
        else if (trendScore >= 60) status = 'potential';
        else status = 'risky';

        return {
            trendScore,
            status,
            suggestedPrice,
            profitPerUnit,
            profitMargin,
            marketingAngles: aiResult.marketingAngles || defaultAnalysis.marketingAngles,
            targetAudience: aiResult.targetAudience || defaultAnalysis.targetAudience,
            targetDemographic: aiResult.targetDemographic || defaultAnalysis.targetDemographic,
            trendReason: aiResult.trendReason || defaultAnalysis.trendReason,
            competitionLevel: aiResult.competitionLevel || 'medium',
            viralPotential: aiResult.viralPotential || 'medium'
        };

    } catch (error) {
        console.error('AI Analysis Error:', error);
        return defaultAnalysis;
    }
}

/**
 * Batch analyze multiple products
 */
export async function analyzeProductsBatch(
    products: AliExpressProduct[],
    onProgress?: (current: number, total: number) => void
): Promise<AnalyzedProduct[]> {
    const analyzedProducts: AnalyzedProduct[] = [];
    const total = products.length;

    for (let i = 0; i < products.length; i++) {
        const product = products[i];

        try {
            const analysis = await analyzeProductWithAI(product);
            analyzedProducts.push({ ...product, analysis });
        } catch (error) {
            console.error(`Error analyzing product ${product.id}:`, error);
            analyzedProducts.push({
                ...product,
                analysis: createFallbackAnalysis(product)
            });
        }

        // Report progress
        if (onProgress) {
            onProgress(i + 1, total);
        }

        // Rate limiting: wait 200ms between requests to avoid hitting limits
        if (i < products.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    // Sort by trend score descending
    analyzedProducts.sort((a, b) => b.analysis.trendScore - a.analysis.trendScore);

    return analyzedProducts;
}

/**
 * Quick batch analyze using a single API call (more efficient for many products)
 */
export async function quickBatchAnalyze(
    products: AliExpressProduct[]
): Promise<AnalyzedProduct[]> {
    if (!process.env.OPENAI_API_KEY || products.length === 0) {
        return products.map(p => ({ ...p, analysis: createFallbackAnalysis(p) }));
    }

    try {
        // Prepare product summaries
        const productList = products.slice(0, 15).map((p, i) =>
            `${i + 1}. "${p.title}" - ${p.price}€, ${p.sales} ventes, ${p.rating}/5`
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
                        content: `Tu es un expert Dropshipping. Analyse ces produits et donne un score de tendance (0-100) + une raison courte pour chacun.

Score 80+ = Winner (fort potentiel viral)
Score 60-79 = Potentiel (peut marcher avec bonne stratégie)
Score <60 = Risqué

Réponds en JSON: { "analyses": [{ "index": 1, "score": 85, "reason": "...", "angles": ["angle1", "angle2", "angle3"], "audience": "..." }, ...] }`
                    },
                    {
                        role: 'user',
                        content: `Voici les produits:\n\n${productList}\n\nAnalyse chacun.`
                    }
                ],
                response_format: { type: 'json_object' },
                max_tokens: 1500,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('OpenAI API Error');
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        const analyses = content.analyses || [];

        // Map analyses back to products
        return products.map((product, index) => {
            const aiAnalysis = analyses.find((a: any) => a.index === index + 1);

            if (aiAnalysis) {
                const trendScore = Math.min(100, Math.max(0, aiAnalysis.score || 50));
                const suggestedPrice = product.price * 3;
                const profitPerUnit = suggestedPrice - product.price;
                const profitMargin = Math.round((profitPerUnit / suggestedPrice) * 100);

                let status: 'winner' | 'potential' | 'risky';
                if (trendScore >= 80) status = 'winner';
                else if (trendScore >= 60) status = 'potential';
                else status = 'risky';

                return {
                    ...product,
                    analysis: {
                        trendScore,
                        status,
                        suggestedPrice,
                        profitPerUnit,
                        profitMargin,
                        marketingAngles: aiAnalysis.angles || createDefaultAngles(product),
                        targetAudience: aiAnalysis.audience || 'Consommateurs en ligne',
                        targetDemographic: {
                            ageRange: '18-45',
                            gender: 'mixte',
                            interests: ['shopping en ligne', 'nouveautés']
                        },
                        trendReason: aiAnalysis.reason || 'Produit tendance',
                        competitionLevel: 'medium' as const,
                        viralPotential: trendScore >= 80 ? 'high' as const : 'medium' as const
                    }
                };
            }

            return { ...product, analysis: createFallbackAnalysis(product) };
        });

    } catch (error) {
        console.error('Quick Batch Analyze Error:', error);
        return products.map(p => ({ ...p, analysis: createFallbackAnalysis(p) }));
    }
}

/**
 * Create a fallback analysis based on product metrics
 */
function createFallbackAnalysis(product: AliExpressProduct): AIProductAnalysis {
    // Calculate trend score based on metrics
    let trendScore = 50;

    // Boost for high sales
    if (product.sales >= 10000) trendScore += 20;
    else if (product.sales >= 5000) trendScore += 15;
    else if (product.sales >= 1000) trendScore += 10;

    // Boost for high rating
    if (product.rating >= 4.8) trendScore += 15;
    else if (product.rating >= 4.5) trendScore += 10;
    else if (product.rating >= 4.0) trendScore += 5;

    // Boost for good price point (sweet spot $5-$25)
    if (product.price >= 5 && product.price <= 25) trendScore += 10;

    // Cap at 100
    trendScore = Math.min(100, trendScore);

    const suggestedPrice = product.price * 3;
    const profitPerUnit = suggestedPrice - product.price;
    const profitMargin = Math.round((profitPerUnit / suggestedPrice) * 100);

    let status: 'winner' | 'potential' | 'risky';
    if (trendScore >= 80) status = 'winner';
    else if (trendScore >= 60) status = 'potential';
    else status = 'risky';

    return {
        trendScore,
        status,
        suggestedPrice,
        profitPerUnit,
        profitMargin,
        marketingAngles: createDefaultAngles(product),
        targetAudience: 'Acheteurs en ligne recherchant des produits innovants',
        targetDemographic: {
            ageRange: '18-45',
            gender: 'mixte',
            interests: ['shopping en ligne', 'produits tendance', 'bonnes affaires']
        },
        trendReason: `${product.sales}+ ventes et note de ${product.rating}/5`,
        competitionLevel: product.sales > 20000 ? 'high' : product.sales > 5000 ? 'medium' : 'low',
        viralPotential: trendScore >= 80 ? 'high' : trendScore >= 60 ? 'medium' : 'low'
    };
}

/**
 * Create default marketing angles based on product title
 */
function createDefaultAngles(product: AliExpressProduct): string[] {
    const title = product.title.toLowerCase();
    const angles: string[] = [];

    if (title.includes('led') || title.includes('light')) {
        angles.push('Transformez votre espace avec cet éclairage unique');
    }
    if (title.includes('smart') || title.includes('wireless')) {
        angles.push('La technologie qui simplifie votre quotidien');
    }
    if (title.includes('portable') || title.includes('mini')) {
        angles.push('Compact et pratique, emportez-le partout');
    }

    // Fill with generic angles if needed
    while (angles.length < 3) {
        const genericAngles = [
            'Le produit viral que tout le monde veut',
            'Qualité premium à prix accessible',
            'La solution que vous cherchiez enfin disponible'
        ];
        angles.push(genericAngles[angles.length]);
    }

    return angles.slice(0, 3);
}

// ============================================
// LEGACY FUNCTIONS FOR BACKWARD COMPATIBILITY
// ============================================

// Legacy type for AliExpressSearchResult compatibility
interface LegacyProduct {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    orders: number;
    rating?: number;
    shippingInfo?: string;
    imageUrl: string;
    productUrl: string;
    supplier?: string;
    description?: string;
    images?: string[];
    category?: string;
}

/**
 * Legacy function: Quick score calculation
 */
export function quickScore(product: LegacyProduct): number {
    let score = 50;

    // Boost for high sales
    if (product.orders >= 10000) score += 20;
    else if (product.orders >= 5000) score += 15;
    else if (product.orders >= 1000) score += 10;

    // Boost for high rating
    if (product.rating && product.rating >= 4.8) score += 15;
    else if (product.rating && product.rating >= 4.5) score += 10;
    else if (product.rating && product.rating >= 4.0) score += 5;

    // Boost for good price point
    if (product.price >= 5 && product.price <= 25) score += 10;

    return Math.min(100, score);
}

/**
 * Legacy function: Analyze product (for backward compatibility)
 */
export async function analyzeProduct(product: LegacyProduct): Promise<ProductAnalysis> {
    const niche = detectNiche(product.name);
    const trendScore = quickScore(product);
    const profitabilityScore = calculateProfitabilityScore(product.price);
    const competitionScore = calculateCompetitionScore(product.orders);

    const overallScore = Math.round(
        profitabilityScore * 0.25 +
        trendScore * 0.30 +
        (product.rating ? product.rating * 20 : 80) * 0.15 +
        calculatePricePointScore(product.price) * 0.15 +
        competitionScore * 0.15
    );

    let winnerStatus: 'winner' | 'potential' | 'risky' | 'rejected';
    if (overallScore >= 80) winnerStatus = 'winner';
    else if (overallScore >= 60) winnerStatus = 'potential';
    else if (overallScore >= 40) winnerStatus = 'risky';
    else winnerStatus = 'rejected';

    const markupMultiplier = 2.5 + (overallScore / 100) * 1.5;
    const suggestedPrice = Math.round(product.price * markupMultiplier * 100) / 100;
    const profitPerUnit = suggestedPrice - product.price;
    const profitMargin = Math.round((profitPerUnit / suggestedPrice) * 100);

    return {
        overallScore,
        profitabilityScore,
        trendScore,
        competitionScore,
        winnerStatus,
        suggestedPrice,
        profitMargin,
        profitPerUnit,
        niche,
        targetAudience: 'Acheteurs en ligne recherchant des produits innovants',
        marketingAngle: 'Produit tendance avec fort potentiel viral',
        marketingAngles: [
            'Le produit viral que tout le monde veut',
            'Qualité premium à prix accessible',
            'La solution que vous cherchiez'
        ],
        adHooks: [
            `\"Je ne savais pas que j'en avais besoin...\"`,
            `\"${product.orders.toLocaleString()}+ personnes ne peuvent pas se tromper\"`,
            `\"Seulement ${suggestedPrice.toFixed(2)}€ pour résoudre ce problème\"`
        ],
        competitionLevel: competitionScore >= 70 ? 'low' : competitionScore >= 40 ? 'medium' : 'high',
        competitors: ['AliExpress sellers', 'Amazon sellers'],
        factors: [
            {
                name: 'Marge de profit',
                score: profitabilityScore,
                description: product.price <= 10 ? 'Excellent coût d\'achat' : 'Coût modéré',
                positive: profitabilityScore >= 70
            },
            {
                name: 'Tendance',
                score: trendScore,
                description: `${product.orders.toLocaleString()} commandes`,
                positive: trendScore >= 65
            },
            {
                name: 'Concurrence',
                score: competitionScore,
                description: competitionScore >= 70 ? 'Marché peu saturé' : 'Marché compétitif',
                positive: competitionScore >= 55
            }
        ]
    };
}

function detectNiche(productName: string): string {
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

function calculateProfitabilityScore(price: number): number {
    if (price <= 5) return 95;
    if (price <= 10) return 85;
    if (price <= 15) return 75;
    if (price <= 25) return 60;
    if (price <= 40) return 45;
    return 30;
}

function calculateCompetitionScore(orders: number): number {
    if (orders < 5000) return 85;
    if (orders < 15000) return 70;
    if (orders < 30000) return 55;
    if (orders < 50000) return 40;
    return 25;
}

function calculatePricePointScore(price: number): number {
    const estimatedSellingPrice = price * 3;
    if (estimatedSellingPrice >= 20 && estimatedSellingPrice <= 60) return 90;
    if (estimatedSellingPrice >= 15 && estimatedSellingPrice <= 80) return 75;
    if (estimatedSellingPrice < 15) return 50;
    return 40;
}
