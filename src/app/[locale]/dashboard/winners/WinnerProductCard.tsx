'use client';

import React from 'react';
import { Trophy, TrendingUp, Star, ShoppingCart, Sparkles, Target, DollarSign, AlertTriangle, Zap } from 'lucide-react';
import { AnalyzedProduct } from '@/lib/ai/analyzer';

interface WinnerProductCardProps {
    product: AnalyzedProduct;
    onClick: () => void;
    onImportClick?: () => void;
}

// Calculate estimated monthly profit
function calcMonthlyProfit(product: AnalyzedProduct): number {
    const salesPerDay = product.sales / 30; // Estimate daily sales
    const profitPerUnit = product.analysis.profitPerUnit;
    return Math.round(profitPerUnit * salesPerDay * 30);
}

// Get saturation level from sales count
function getSaturationLevel(sales: number): { level: string; color: string } {
    if (sales >= 50000) return { level: 'Saturé', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
    if (sales >= 20000) return { level: 'Élevée', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
    if (sales >= 5000) return { level: 'Moyenne', color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    return { level: 'Faible', color: 'bg-green-500/10 text-green-400 border-green-500/20' };
}

export default function WinnerProductCard({ product, onClick, onImportClick }: WinnerProductCardProps) {
    const estimatedMonthlyProfit = calcMonthlyProfit(product);
    const saturation = getSaturationLevel(product.sales);
    const { analysis } = product;

    const isWinner = analysis.status === 'winner';
    const isPotential = analysis.status === 'potential';

    const getStatusStyles = () => {
        if (isWinner) {
            return {
                badge: 'bg-gradient-to-r from-yellow-500 to-orange-500 shadow-lg shadow-orange-500/30',
                border: 'border-yellow-500/30 hover:border-yellow-500/50',
                glow: 'shadow-yellow-500/10'
            };
        }
        if (isPotential) {
            return {
                badge: 'bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30',
                border: 'border-blue-500/30 hover:border-blue-500/50',
                glow: 'shadow-blue-500/10'
            };
        }
        return {
            badge: 'bg-slate-600',
            border: 'border-slate-700 hover:border-slate-600',
            glow: ''
        };
    };

    const styles = getStatusStyles();

    return (
        <div
            onClick={onClick}
            className={`group relative bg-slate-900/80 border ${styles.border} rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl ${styles.glow} hover:-translate-y-2`}
        >
            {/* Winner/Potential Badge with Glow Effect */}
            <div className={`absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full ${styles.badge} text-white text-sm font-bold flex items-center gap-2`}>
                {isWinner ? <Trophy size={14} /> : <TrendingUp size={14} />}
                {isWinner ? 'WINNER' : isPotential ? 'POTENTIEL' : 'RISQUÉ'}
            </div>

            {/* Score Badge */}
            <div className="absolute top-4 right-4 z-10">
                <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm text-white font-bold`}>
                    <Sparkles size={14} className={isWinner ? 'text-yellow-400' : 'text-blue-400'} />
                    {analysis.trendScore}
                </div>
            </div>

            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-slate-800">
                <img
                    src={product.imageHd || product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />

                {/* Quick Stats Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between text-white text-sm">
                        <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                            <ShoppingCart size={12} />
                            {product.sales.toLocaleString()} vendus
                        </span>
                        <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                            <Star size={12} className="text-yellow-400 fill-yellow-400" />
                            {product.rating.toFixed(1)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Title */}
                <h3 className="text-white font-semibold text-sm line-clamp-2 mb-3 group-hover:text-blue-400 transition-colors h-10">
                    {product.title}
                </h3>

                {/* AI Analysis Insight */}
                {analysis.marketingAngles[0] && (
                    <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                        <div className="flex items-start gap-2">
                            <Target size={14} className="text-purple-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-purple-300 line-clamp-2">
                                {analysis.marketingAngles[0]}
                            </p>
                        </div>
                    </div>
                )}

                {/* Pricing Section */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-slate-800/50">
                        <div className="text-xs text-slate-500 mb-1">Prix AliExpress</div>
                        <div className="text-lg font-bold text-white">{product.price.toFixed(2)}€</div>
                    </div>
                    <div className="p-3 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                        <div className="text-xs text-green-400 mb-1">Prix conseillé</div>
                        <div className="text-lg font-bold text-green-400">{analysis.suggestedPrice.toFixed(2)}€</div>
                    </div>
                </div>

                {/* MONTHLY PROFIT - PRIORITY DISPLAY */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-green-400" />
                            <span className="text-xs text-green-400 font-medium">Profit Mensuel Estimé</span>
                        </div>
                        <div className="text-xl font-bold text-green-400">
                            {estimatedMonthlyProfit > 0 ? `+${estimatedMonthlyProfit.toLocaleString()}€` : 'N/A'}
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-green-500/20">
                        <span className="text-xs text-slate-500">Profit/unité: +{analysis.profitPerUnit.toFixed(2)}€</span>
                        <span className="text-xs text-slate-500">Marge: {analysis.profitMargin}%</span>
                    </div>
                </div>

                {/* Saturation Badge */}
                <div className="flex items-center justify-between mt-3">
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${saturation.color}`}>
                        <AlertTriangle size={12} />
                        Saturation: {saturation.level}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Zap size={12} />
                        {analysis.viralPotential === 'high' ? 'Viral ↑' : analysis.viralPotential === 'medium' ? 'Moyen' : 'Faible'}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Sparkles size={16} />
                        Voir l'analyse complète
                    </button>
                    {onImportClick && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onImportClick(); }}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-medium flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity hover:from-green-700 hover:to-emerald-700"
                        >
                            <Zap size={14} />
                            Import 1 clic
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
