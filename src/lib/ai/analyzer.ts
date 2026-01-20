/**
 * AI Product Analyzer
 * 
 * Analyzes products and provides winning potential scores based on multiple factors.
 * Uses a rule-based scoring system optimized for dropshipping criteria.
 */

import { AliExpressSearchResult, detectNiche } from '@/lib/aliexpress/aliexpress';

export interface ProductAnalysis {
    // Scores (0-100)
    overallScore: number;
    profitabilityScore: number;
    trendScore: number;
    competitionScore: number;

    // Classification
    winnerStatus: 'winner' | 'potential' | 'risky' | 'rejected';

    // Financial Analysis
    suggestedPrice: number;
    profitMargin: number;
    profitPerUnit: number;

    // Marketing Insights
    niche: string;
    targetAudience: string;
    marketingAngle: string;
    marketingAngles: string[];
    adHooks: string[];

    // Competition Analysis
    competitionLevel: 'low' | 'medium' | 'high';
    competitors: string[];

    // Factors
    factors: {
        name: string;
        score: number;
        description: string;
        positive: boolean;
    }[];
}


// Scoring weights
const WEIGHTS = {
    profitMargin: 0.25,
    orderVolume: 0.20,
    rating: 0.10,
    pricePoint: 0.15,
    wowFactor: 0.15,
    nichePotential: 0.15
};

// Niche-specific multipliers and audiences
const NICHE_DATA: Record<string, { multiplier: number; audience: string; adAngles: string[] }> = {
    "Tech & Gadgets": {
        multiplier: 1.1,
        audience: "Tech enthusiasts, young professionals, early adopters",
        adAngles: ["Problem solver", "Time saver", "Must-have gadget"]
    },
    "Health & Wellness": {
        multiplier: 1.2,
        audience: "Health-conscious individuals, office workers, seniors",
        adAngles: ["Pain relief", "Better posture", "Wellness upgrade"]
    },
    "Home & Living": {
        multiplier: 1.15,
        audience: "Homeowners, apartment dwellers, interior design enthusiasts",
        adAngles: ["Home upgrade", "Cozy vibes", "Modern living"]
    },
    "Kitchen": {
        multiplier: 1.1,
        audience: "Home cooks, health enthusiasts, busy parents",
        adAngles: ["Kitchen hack", "Healthy lifestyle", "Time saver"]
    },
    "Beauty": {
        multiplier: 1.25,
        audience: "Women 18-45, beauty enthusiasts, skincare lovers",
        adAngles: ["Self-care routine", "Spa at home", "Beauty secret"]
    },
    "Pets": {
        multiplier: 1.3,
        audience: "Pet owners, dog/cat lovers, new pet parents",
        adAngles: ["Happy pet", "Pet parent must-have", "Fur baby approved"]
    },
    "Fitness": {
        multiplier: 1.1,
        audience: "Fitness enthusiasts, gym goers, athletes",
        adAngles: ["Level up workout", "Home gym essential", "Fitness hack"]
    },
    "Fashion": {
        multiplier: 1.0,
        audience: "Fashion-conscious shoppers, trend followers",
        adAngles: ["Trending now", "Style upgrade", "Affordable luxury"]
    },
    "General": {
        multiplier: 1.0,
        audience: "General consumers, impulse buyers",
        adAngles: ["Must-have item", "Viral product", "Limited stock"]
    }
};

/**
 * Analyze a product and return comprehensive scoring
 */
/**
 * Analyze a product and return comprehensive scoring using OpenAI GPT-4o-mini
 */
export async function analyzeProduct(product: AliExpressSearchResult): Promise<ProductAnalysis> {
    const niche = detectNiche(product.name);
    const nicheData = NICHE_DATA[niche] || NICHE_DATA["General"];

    // Default values if AI fails
    let aiData = {
        trendScore: 50,
        marketingAngles: nicheData.adAngles,
        targetAudience: nicheData.audience
    };

    // Real AI Analysis
    try {
        if (process.env.OPENAI_API_KEY) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert dropshipping product researcher. Analyze the product and return a valid JSON object."
                        },
                        {
                            role: "user",
                            content: `Analyze this product:
Title: "${product.name}"
Price: ${product.price}

Return a JSON object with strictly these fields (all values in French):
- trendScore: number (0-100), prediction of viral potential
- marketingAngles: string[] (array of 3 short, punchy marketing hooks/angles)
- targetAudience: string (concise description of the ideal customer persona)

Output ONLY valid JSON.`
                        }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            if (response.ok) {
                const data = await response.json();
                const content = JSON.parse(data.choices[0].message.content);
                if (content.trendScore) aiData.trendScore = content.trendScore;
                if (content.marketingAngles) aiData.marketingAngles = content.marketingAngles;
                if (content.targetAudience) aiData.targetAudience = content.targetAudience;
            } else {
                console.error("OpenAI API Error:", await response.text());
            }
        }
    } catch (error) {
        console.error("AI Analysis Failed:", error);
    }

    // Mathematical calculations (Reliable logic)
    const profitabilityScore = calculateProfitabilityScore(product);
    const trendScore = aiData.trendScore; // Use AI trend score
    const competitionScore = calculateCompetitionScore(product);
    const wowScore = calculateWowFactorScore(product);
    const nicheScore = Math.round(70 + nicheData.multiplier * 20);

    // Calculate weighted overall score
    const overallScore = Math.round(
        profitabilityScore * WEIGHTS.profitMargin +
        trendScore * WEIGHTS.orderVolume + // Use AI trend score weight
        (product.rating ? product.rating * 20 : 80) * WEIGHTS.rating +
        calculatePricePointScore(product) * WEIGHTS.pricePoint +
        wowScore * WEIGHTS.wowFactor +
        nicheScore * WEIGHTS.nichePotential
    );

    // Determine winner status
    let winnerStatus: 'winner' | 'potential' | 'risky' | 'rejected';
    if (overallScore >= 80) winnerStatus = 'winner';
    else if (overallScore >= 60) winnerStatus = 'potential';
    else if (overallScore >= 40) winnerStatus = 'risky';
    else winnerStatus = 'rejected';

    // Financials
    const markupMultiplier = 2.5 + (overallScore / 100) * 1.5;
    const suggestedPrice = Math.round(product.price * markupMultiplier * 100) / 100;
    const profitPerUnit = suggestedPrice - product.price;
    const profitMargin = Math.round((profitPerUnit / suggestedPrice) * 100);

    const competitionLevel = competitionScore >= 70 ? 'low' : competitionScore >= 40 ? 'medium' : 'high';

    // Generate factors
    const factors = generateFactors(product, profitabilityScore, trendScore, competitionScore, wowScore);

    // Generate ad hooks (mix of AI and template)
    const adHooks = generateAdHooks(product, nicheData);

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
        targetAudience: aiData.targetAudience, // AI
        marketingAngle: aiData.marketingAngles[0] || "Produit Tendance", // AI
        marketingAngles: aiData.marketingAngles, // AI
        adHooks,
        competitionLevel,
        competitors: ['AliExpress sellers', 'Amazon sellers'], // Could ask AI for this too but keep simple
        factors
    };
}

function calculateProfitabilityScore(product: AliExpressSearchResult): number {
    // Low cost products with high perceived value score better
    const baseCost = product.price;

    if (baseCost <= 5) return 95;
    if (baseCost <= 10) return 85;
    if (baseCost <= 15) return 75;
    if (baseCost <= 25) return 60;
    if (baseCost <= 40) return 45;
    return 30;
}

function calculateTrendScore(product: AliExpressSearchResult): number {
    // Based on order volume
    const orders = product.orders;

    if (orders >= 50000) return 95;
    if (orders >= 20000) return 85;
    if (orders >= 10000) return 75;
    if (orders >= 5000) return 65;
    if (orders >= 1000) return 55;
    return 40;
}

function calculateCompetitionScore(product: AliExpressSearchResult): number {
    // Inverse of order volume - very popular = more competition
    // But also consider price - unique price points may have less competition
    const orders = product.orders;

    if (orders < 5000) return 85;  // Less known = less competition
    if (orders < 15000) return 70;
    if (orders < 30000) return 55;
    if (orders < 50000) return 40;
    return 25; // Very popular = high competition
}

function calculatePricePointScore(product: AliExpressSearchResult): number {
    // Sweet spot for dropshipping is $20-60 selling price
    const estimatedSellingPrice = product.price * 3;

    if (estimatedSellingPrice >= 20 && estimatedSellingPrice <= 60) return 90;
    if (estimatedSellingPrice >= 15 && estimatedSellingPrice <= 80) return 75;
    if (estimatedSellingPrice < 15) return 50; // Too cheap, low perceived value
    return 40; // Too expensive for impulse buy
}

function calculateWowFactorScore(product: AliExpressSearchResult): number {
    // Based on product name keywords that indicate uniqueness
    const wowKeywords = ['smart', 'led', 'magnetic', 'automatic', 'portable', 'wireless',
        'foldable', 'rechargeable', '360', 'mini', 'anti-gravity', 'galaxy'];
    const name = product.name.toLowerCase();

    let matches = 0;
    for (const keyword of wowKeywords) {
        if (name.includes(keyword)) matches++;
    }

    return Math.min(95, 50 + matches * 15);
}

function generateFactors(
    product: AliExpressSearchResult,
    profitabilityScore: number,
    trendScore: number,
    competitionScore: number,
    wowScore: number
): ProductAnalysis['factors'] {
    const factors: ProductAnalysis['factors'] = [];

    // Profitability factor
    factors.push({
        name: "Marge de profit",
        score: profitabilityScore,
        description: product.price <= 10
            ? "Excellent coût d'achat permettant une marge élevée"
            : "Coût d'achat modéré, marge correcte",
        positive: profitabilityScore >= 70
    });

    // Trend factor
    factors.push({
        name: "Tendance du marché",
        score: trendScore,
        description: product.orders >= 20000
            ? `${product.orders.toLocaleString()} commandes - Forte demande prouvée`
            : `${product.orders.toLocaleString()} commandes - Demande en croissance`,
        positive: trendScore >= 65
    });

    // Competition factor
    factors.push({
        name: "Niveau de concurrence",
        score: competitionScore,
        description: competitionScore >= 70
            ? "Marché peu saturé, opportunité de différenciation"
            : "Marché compétitif, nécessite une bonne stratégie marketing",
        positive: competitionScore >= 55
    });

    // Wow factor
    factors.push({
        name: "Facteur Wow",
        score: wowScore,
        description: wowScore >= 70
            ? "Produit unique avec fort potentiel viral"
            : "Produit standard, moins de potentiel viral",
        positive: wowScore >= 65
    });

    // Rating factor
    if (product.rating) {
        const ratingScore = Math.round(product.rating * 20);
        factors.push({
            name: "Avis clients",
            score: ratingScore,
            description: `Note de ${product.rating}/5 - ${product.rating >= 4.5 ? 'Excellente satisfaction client' : 'Bonne satisfaction client'}`,
            positive: product.rating >= 4.3
        });
    }

    // Shipping factor
    factors.push({
        name: "Livraison",
        score: product.shippingInfo?.includes("Free") ? 85 : 60,
        description: product.shippingInfo?.includes("Free")
            ? "Livraison gratuite disponible"
            : "Frais de livraison à prévoir",
        positive: product.shippingInfo?.includes("Free") ?? false
    });

    return factors;
}

function generateMarketingAngle(
    product: AliExpressSearchResult,
    nicheData: { multiplier: number; audience: string; adAngles: string[] }
): string {
    const angles = nicheData.adAngles;
    const selectedAngle = angles[Math.floor(Math.random() * angles.length)];

    const templates = [
        `🎯 ${selectedAngle}: "${product.name.split(' ').slice(0, 4).join(' ')}" - Le produit que tout le monde veut!`,
        `⚡ Découvrez le secret des top sellers: Ce ${product.name.split(' ').slice(0, 3).join(' ')} fait fureur sur TikTok!`,
        `💡 ${selectedAngle} - Plus de ${product.orders.toLocaleString()} personnes l'ont déjà adopté!`,
        `🔥 VIRAL: Ce produit résout un problème que 90% des gens ignorent!`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
}

function generateAdHooks(
    product: AliExpressSearchResult,
    nicheData: { multiplier: number; audience: string; adAngles: string[] }
): string[] {
    const hooks = [
        `"Je ne savais pas que j'en avais besoin jusqu'à ce que je l'essaie..."`,
        `"Pourquoi personne ne m'a parlé de ça avant?!"`,
        `"${product.orders.toLocaleString()}+ personnes ne peuvent pas se tromper"`,
        `"Le produit qui a changé ma routine quotidienne"`,
        `"Seulement ${((product.price * 3)).toFixed(2)}€ pour résoudre ce problème"`,
        `"Stop scrolling - Tu vas vouloir voir ça!"`
    ];

    return hooks.sort(() => Math.random() - 0.5).slice(0, 3);
}

/**
 * Quick score calculation without full analysis
 */
export function quickScore(product: AliExpressSearchResult): number {
    const profitability = calculateProfitabilityScore(product);
    const trend = calculateTrendScore(product);
    const wow = calculateWowFactorScore(product);

    return Math.round((profitability + trend + wow) / 3);
}

/**
 * Batch analyze multiple products
 */
export async function batchAnalyze(products: AliExpressSearchResult[]): Promise<Map<string, ProductAnalysis>> {
    const results = new Map<string, ProductAnalysis>();

    for (const product of products) {
        const analysis = await analyzeProduct(product);
        results.set(product.id, analysis);
    }

    return results;
}
