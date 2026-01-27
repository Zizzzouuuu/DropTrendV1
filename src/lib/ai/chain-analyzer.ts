/**
 * Chain-of-Thought AI Analyzer
 * 
 * Implements the 4-step analysis protocol:
 * 1. Momentum Analysis - Sales vs Store Age
 * 2. Quality Gate - Hard Rules (rating < 4.7 or feedback < 95% = rejection)
 * 3. Safety Margin Calculation - Suggested price, net margin, monthly profit
 * 4. Saturation Check - Cross-reference with tracked stores
 */

import { AliExpressProduct } from '@/lib/api/aliexpress';
import { db } from '@/lib/db';

// ============================================
// INTERFACES
// ============================================

export interface MomentumAnalysis {
    status: 'explosive' | 'strong' | 'moderate' | 'weak';
    salesPerDay: number;
    storeAgeDays: number;
    reason: string;
    score: number; // 0-100
}

export interface QualityGate {
    passed: boolean;
    rating: number;
    positiveFeedback: number;
    rejectionReason?: string;
}

export interface ProfitabilityAnalysis {
    supplierPrice: number;
    suggestedPrice: number;
    shippingCost: number;
    estimatedCPA: number;
    netMarginPerUnit: number;
    estimatedMonthlyProfit: number;
    profitMarginPercent: number;
    dailySalesEstimate: number;
}

export interface SaturationAnalysis {
    level: 'low' | 'medium' | 'high' | 'saturated';
    competitorCount: number;
    scoreImpact: number;
    foundInStores: string[];
}

export interface ChainOfThoughtAnalysis {
    // Step 1
    momentum: MomentumAnalysis;
    // Step 2
    qualityGate: QualityGate;
    // Step 3
    profitability: ProfitabilityAnalysis;
    // Step 4
    saturation: SaturationAnalysis;
    // Final Output
    finalScore: number;
    status: 'winner' | 'potential' | 'risky' | 'rejected';
    reasoning: string[];
    estimatedMonthlyProfit: number;
    adDifficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
}

export interface FullAnalyzedProduct extends AliExpressProduct {
    chainAnalysis: ChainOfThoughtAnalysis;
}

// ============================================
// STEP 1: MOMENTUM ANALYSIS
// ============================================

// ============================================
// STEP 1: MOMENTUM ANALYSIS
// ============================================

export function analyzeMomentum(
    totalSales: number,
    storeAgeDays: number = 30 // Default 30 days if unknown
): MomentumAnalysis {
    // Calculate sales per day
    const salesPerDay = storeAgeDays > 0 ? totalSales / storeAgeDays : totalSales;

    let status: MomentumAnalysis['status'];
    let score: number;
    let reason: string;

    if (salesPerDay >= 100) {
        status = 'explosive';
        score = 95;
        reason = `Momentum explosif: ${Math.round(salesPerDay)} ventes/jour en ${storeAgeDays} jours`;
    } else if (salesPerDay >= 40) {
        status = 'strong';
        score = 80;
        reason = `Momentum fort: ${Math.round(salesPerDay)} ventes/jour, tendance confirmée`;
    } else if (salesPerDay >= 10) {
        status = 'moderate';
        score = 60;
        reason = `Momentum modéré: ${Math.round(salesPerDay)} ventes/jour, potentiel à valider`;
    } else {
        status = 'weak';
        score = 30;
        reason = `Momentum faible: ${Math.round(salesPerDay)} ventes/jour, risque élevé`;
    }

    return {
        status,
        salesPerDay: Math.round(salesPerDay * 10) / 10,
        storeAgeDays,
        reason,
        score
    };
}

// ============================================
// STEP 2: QUALITY GATE (HARD RULES)
// ============================================

export function checkQualityGate(
    rating: number,
    positiveFeedback: number = 95 // Default to 95% if unknown
): QualityGate {
    const minRating = 4.8; // Increased strictness
    const minFeedback = 95;

    const ratingPassed = rating >= minRating;
    const feedbackPassed = positiveFeedback >= minFeedback;
    const passed = ratingPassed && feedbackPassed;

    let rejectionReason: string | undefined;

    if (!ratingPassed && !feedbackPassed) {
        rejectionReason = `Note (${rating}/5) et feedback (${positiveFeedback}%) insuffisants`;
    } else if (!ratingPassed) {
        rejectionReason = `Note insuffisante: ${rating}/5 (minimum requis: ${minRating})`;
    } else if (!feedbackPassed) {
        rejectionReason = `Feedback vendeur insuffisant: ${positiveFeedback}% (minimum requis: ${minFeedback}%)`;
    }

    return {
        passed,
        rating,
        positiveFeedback,
        rejectionReason
    };
}

// ============================================
// STEP 3: PROFITABILITY CALCULATION
// ============================================

export function calculateProfitability(
    supplierPrice: number,
    estimatedDailySales: number
): ProfitabilityAnalysis {
    // Constants
    const SHIPPING_COST = 3; // €3 shipping estimate
    const ESTIMATED_CPA = 15; // €15 estimated cost per acquisition
    const MARKUP_MULTIPLIER = 3; // x3 markup rule

    // Calculate prices
    const suggestedPrice = Math.round(supplierPrice * MARKUP_MULTIPLIER * 100) / 100;

    // Calculate margins
    const netMarginPerUnit = suggestedPrice - supplierPrice - SHIPPING_COST - ESTIMATED_CPA;
    const profitMarginPercent = Math.round((netMarginPerUnit / suggestedPrice) * 100);

    // Estimate monthly profit
    const estimatedMonthlyProfit = Math.round(netMarginPerUnit * estimatedDailySales * 30);

    return {
        supplierPrice,
        suggestedPrice,
        shippingCost: SHIPPING_COST,
        estimatedCPA: ESTIMATED_CPA,
        netMarginPerUnit: Math.round(netMarginPerUnit * 100) / 100,
        estimatedMonthlyProfit: Math.max(0, estimatedMonthlyProfit),
        profitMarginPercent,
        dailySalesEstimate: estimatedDailySales
    };
}

// ============================================
// STEP 4: SATURATION CHECK
// ============================================

export async function checkSaturation(
    productTitle: string,
    productPrice: number
): Promise<SaturationAnalysis> {
    try {
        // Extract keywords from title
        const keywords = productTitle
            .toLowerCase()
            .split(/\s+/)
            .filter(word => word.length > 3)
            .slice(0, 5);

        if (keywords.length === 0) {
            return {
                level: 'low',
                competitorCount: 0,
                scoreImpact: 0,
                foundInStores: []
            };
        }

        // Search in tracked products for similar items
        const trackedProducts = await db.trackedProduct.findMany({
            where: {
                OR: keywords.map(kw => ({
                    name: { contains: kw, mode: 'insensitive' as const }
                })),
                isActive: true
            },
            include: {
                store: {
                    select: { shopName: true, url: true }
                }
            },
            take: 50
        });

        // Count unique stores
        const uniqueStores = new Set(trackedProducts.map(p => p.storeId));
        const competitorCount = uniqueStores.size;

        // Determine saturation level and score impact
        let level: SaturationAnalysis['level'];
        let scoreImpact: number;

        if (competitorCount >= 20) {
            level = 'saturated';
            scoreImpact = -30;
        } else if (competitorCount >= 10) {
            level = 'high';
            scoreImpact = -20;
        } else if (competitorCount >= 5) {
            level = 'medium';
            scoreImpact = -10;
        } else {
            level = 'low';
            scoreImpact = 0;
        }

        // Get store names for display
        const foundInStores = trackedProducts
            .map(p => p.store.shopName || p.store.url)
            .filter((name, index, arr) => arr.indexOf(name) === index)
            .slice(0, 5);

        return {
            level,
            competitorCount,
            scoreImpact,
            foundInStores
        };
    } catch (error) {
        console.error('Saturation check error:', error);
        // Return default values on error
        return {
            level: 'low',
            competitorCount: 0,
            scoreImpact: 0,
            foundInStores: []
        };
    }
}

// ============================================
// MAIN CHAIN-OF-THOUGHT ANALYZER
// ============================================

export async function analyzeWithChainOfThought(
    product: AliExpressProduct
): Promise<ChainOfThoughtAnalysis> {
    const reasoning: string[] = [];

    // STEP 1: Momentum Analysis
    // Estimate store age at 30 days if unknown
    const storeAgeDays = 30;
    const momentum = analyzeMomentum(product.sales, storeAgeDays);
    reasoning.push(`📈 Étape 1 - Momentum: ${momentum.reason}`);

    // STEP 2: Quality Gate
    // Use rating from product, estimate 96% positive feedback if unknown
    const estimatedFeedback = product.rating >= 4.8 ? 98 : product.rating >= 4.5 ? 96 : 93;
    const qualityGate = checkQualityGate(product.rating, estimatedFeedback);

    if (!qualityGate.passed) {
        reasoning.push(`❌ Étape 2 - Quality Gate: REJET - ${qualityGate.rejectionReason}`);

        // Return rejected analysis
        return {
            momentum,
            qualityGate,
            profitability: calculateProfitability(product.price, 0),
            saturation: { level: 'low', competitorCount: 0, scoreImpact: 0, foundInStores: [] },
            finalScore: 0,
            status: 'rejected',
            reasoning,
            estimatedMonthlyProfit: 0,
            adDifficulty: 'very_hard'
        };
    }

    reasoning.push(`✅ Étape 2 - Quality Gate: PASSÉ (${product.rating}/5, ${estimatedFeedback}% feedback)`);

    // STEP 3: Profitability Calculation
    const profitability = calculateProfitability(product.price, momentum.salesPerDay);

    if (profitability.netMarginPerUnit < 15) {
        reasoning.push(`❌ Étape 3 - Marge: REJET - ${profitability.netMarginPerUnit.toFixed(2)}€/unité (< 15€ requis)`);

        // Return rejected analysis due to low margin
        return {
            momentum,
            qualityGate,
            profitability,
            saturation: { level: 'low', competitorCount: 0, scoreImpact: 0, foundInStores: [] },
            finalScore: 0,
            status: 'rejected',
            reasoning,
            estimatedMonthlyProfit: 0,
            adDifficulty: 'hard'
        };
    } else {
        reasoning.push(`💰 Étape 3 - Marge: ${profitability.netMarginPerUnit.toFixed(2)}€/unité, Profit mensuel estimé: ${profitability.estimatedMonthlyProfit}€`);
    }

    // STEP 4: Saturation Check
    const saturation = await checkSaturation(product.title, product.price);

    if (saturation.level === 'saturated') {
        reasoning.push(`🔴 Étape 4 - Saturation: SATURÉ (${saturation.competitorCount} boutiques concurrentes)`);
    } else if (saturation.level === 'high') {
        reasoning.push(`🟠 Étape 4 - Saturation: ÉLEVÉE (${saturation.competitorCount} boutiques)`);
    } else if (saturation.level === 'medium') {
        reasoning.push(`🟡 Étape 4 - Saturation: MOYENNE (${saturation.competitorCount} boutiques)`);
    } else {
        reasoning.push(`🟢 Étape 4 - Saturation: FAIBLE - Opportunité Blue Ocean!`);
    }

    // CALCULATE FINAL SCORE
    let baseScore = momentum.score;

    // Profitability bonus/malus
    if (profitability.netMarginPerUnit >= 25) baseScore += 10;
    else if (profitability.netMarginPerUnit >= 15) baseScore += 5;
    else if (profitability.netMarginPerUnit < 10) baseScore -= 15;

    // Saturation impact
    baseScore += saturation.scoreImpact;

    // Cap score
    const finalScore = Math.min(100, Math.max(0, baseScore));

    // Determine status
    let status: ChainOfThoughtAnalysis['status'];
    if (finalScore >= 80) status = 'winner';
    else if (finalScore >= 60) status = 'potential';
    else status = 'risky';

    // Determine ad difficulty
    let adDifficulty: ChainOfThoughtAnalysis['adDifficulty'];
    if (saturation.level === 'saturated') adDifficulty = 'very_hard';
    else if (saturation.level === 'high') adDifficulty = 'hard';
    else if (saturation.level === 'medium') adDifficulty = 'medium';
    else adDifficulty = 'easy';

    return {
        momentum,
        qualityGate,
        profitability,
        saturation,
        finalScore,
        status,
        reasoning,
        estimatedMonthlyProfit: profitability.estimatedMonthlyProfit,
        adDifficulty
    };
}

// ============================================
// BATCH ANALYZER WITH CHAIN-OF-THOUGHT
// ============================================

export async function analyzeProductsBatchWithChain(
    products: AliExpressProduct[]
): Promise<FullAnalyzedProduct[]> {
    const results: FullAnalyzedProduct[] = [];

    for (const product of products) {
        try {
            const chainAnalysis = await analyzeWithChainOfThought(product);
            results.push({ ...product, chainAnalysis });
        } catch (error) {
            console.error(`Error analyzing product ${product.id}:`, error);
            // Create fallback analysis
            const fallback = createFallbackChainAnalysis(product);
            results.push({ ...product, chainAnalysis: fallback });
        }
    }

    // Sort by final score descending
    results.sort((a, b) => b.chainAnalysis.finalScore - a.chainAnalysis.finalScore);

    return results;
}

// ============================================
// FALLBACK ANALYSIS
// ============================================

function createFallbackChainAnalysis(product: AliExpressProduct): ChainOfThoughtAnalysis {
    const momentum = analyzeMomentum(product.sales, 30);
    const qualityGate = checkQualityGate(product.rating, 95);
    const profitability = calculateProfitability(product.price, momentum.salesPerDay);

    return {
        momentum,
        qualityGate,
        profitability,
        saturation: { level: 'medium', competitorCount: 10, scoreImpact: -10, foundInStores: [] },
        finalScore: momentum.score - 10,
        status: momentum.score >= 70 ? 'potential' : 'risky',
        reasoning: ['⚠️ Analyse simplifiée (données de saturation non disponibles)'],
        estimatedMonthlyProfit: profitability.estimatedMonthlyProfit,
        adDifficulty: 'medium'
    };
}
