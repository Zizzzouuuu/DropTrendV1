'use client';

import React, { useState, useTransition } from 'react';
import {
    X, Trophy, TrendingUp, Star, ShoppingCart, Target, Users,
    Sparkles, ExternalLink, Copy, CheckCircle2, Zap, MessageSquare,
    DollarSign, AlertTriangle, Loader2, Upload, Store
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AnalyzedProduct } from '@/lib/ai/analyzer';
import { importProductToShopify } from '@/lib/product-import-actions';

interface ProductAnalysisModalProps {
    product: AnalyzedProduct;
    onClose: () => void;
    isShopifyConnected?: boolean;
}

export default function ProductAnalysisModal({ product, onClose, isShopifyConnected = false }: ProductAnalysisModalProps) {
    const [isImporting, setIsImporting] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const { analysis } = product;
    const isWinner = analysis.status === 'winner';

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // Calculate estimated monthly profit
    const estimatedMonthlyProfit = Math.round((product.analysis.profitPerUnit * (product.sales / 30)) * 30);

    // Handle 1-click import
    const handleImport = async () => {
        if (!isShopifyConnected) return;

        setIsImporting(true);
        setImportError(null);

        try {
            const result = await importProductToShopify(
                product,
                product.analysis.suggestedPrice
            );

            if (result.success) {
                setImportSuccess(true);
            } else {
                setImportError(result.error || "Erreur lors de l'import");
            }
        } catch (error) {
            setImportError("Une erreur est survenue");
        } finally {
            setIsImporting(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-blue-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getCompetitionColor = (level: string) => {
        if (level === 'low') return 'text-green-400 bg-green-500/10';
        if (level === 'medium') return 'text-yellow-400 bg-yellow-500/10';
        return 'text-red-400 bg-red-500/10';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isWinner ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
                            {isWinner ? <Trophy size={24} className="text-white" /> : <TrendingUp size={24} className="text-white" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Analyse IA Complète</h2>
                            <span className={`text-sm ${isWinner ? 'text-yellow-400' : 'text-blue-400'}`}>
                                {isWinner ? '🏆 Produit Winner' : '📈 Produit Potentiel'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                    {/* Product Overview */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        {/* Image */}
                        <div className="w-full md:w-1/3">
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-800">
                                <img
                                    src={product.imageHd || product.imageUrl}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                />
                                {/* Score Badge */}
                                <div className={`absolute top-4 left-4 px-4 py-2 rounded-full ${isWinner ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'} text-white font-bold flex items-center gap-2`}>
                                    <Sparkles size={18} />
                                    <span className="text-2xl">{analysis.trendScore}</span>
                                    <span className="text-xs opacity-80">/100</span>
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-4">{product.title}</h3>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                <div className="p-3 rounded-xl bg-slate-800/50">
                                    <div className="text-xs text-slate-500 mb-1">Prix AliExpress</div>
                                    <div className="text-lg font-bold text-white">{product.price.toFixed(2)}€</div>
                                </div>
                                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <div className="text-xs text-green-400 mb-1">Prix conseillé</div>
                                    <div className="text-lg font-bold text-green-400">{analysis.suggestedPrice.toFixed(2)}€</div>
                                </div>
                                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <div className="text-xs text-green-400 mb-1">Marge</div>
                                    <div className="text-lg font-bold text-green-400">{analysis.profitMargin}%</div>
                                </div>
                                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                                    <div className="text-xs text-green-400 mb-1">Profit/unité</div>
                                    <div className="text-lg font-bold text-green-400">+{analysis.profitPerUnit.toFixed(2)}€</div>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                <span className="flex items-center gap-1">
                                    <ShoppingCart size={14} />
                                    {product.sales.toLocaleString()} ventes
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star size={14} className="text-yellow-400" />
                                    {product.rating}/5 ({product.reviews} avis)
                                </span>
                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded ${getCompetitionColor(analysis.competitionLevel)}`}>
                                    Concurrence: {analysis.competitionLevel === 'low' ? 'Faible' : analysis.competitionLevel === 'medium' ? 'Moyenne' : 'Élevée'}
                                </span>
                                <span className={`flex items-center gap-1 px-2 py-0.5 rounded ${analysis.viralPotential === 'high' ? 'text-green-400 bg-green-500/10' : 'text-blue-400 bg-blue-500/10'}`}>
                                    <Zap size={12} />
                                    Viral: {analysis.viralPotential === 'high' ? 'Fort' : analysis.viralPotential === 'medium' ? 'Moyen' : 'Faible'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* AI Analysis Reason */}
                    <Card className="p-5 border-slate-800 bg-gradient-to-r from-purple-500/5 to-blue-500/5 mb-6">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Sparkles size={18} className="text-purple-400" />
                            Analyse IA
                        </h4>
                        <p className="text-slate-300">{analysis.trendReason}</p>
                    </Card>

                    {/* MONTHLY PROFIT - PRIORITY SECTION */}
                    <Card className="p-5 border-green-500/30 bg-gradient-to-r from-green-500/5 to-emerald-500/5 mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-bold flex items-center gap-2">
                                <DollarSign size={18} className="text-green-400" />
                                Profit Mensuel Potentiel
                            </h4>
                            <span className="text-3xl font-bold text-green-400">
                                +{estimatedMonthlyProfit.toLocaleString()}€
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 rounded-lg bg-slate-800/50">
                                <div className="text-lg font-bold text-white">+{product.analysis.profitPerUnit.toFixed(2)}€</div>
                                <div className="text-xs text-slate-500">Profit/unité</div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-800/50">
                                <div className="text-lg font-bold text-white">{product.analysis.profitMargin}%</div>
                                <div className="text-xs text-slate-500">Marge nette</div>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-800/50">
                                <div className="text-lg font-bold text-white">~{Math.round(product.sales / 30)}/j</div>
                                <div className="text-xs text-slate-500">Ventes estimées</div>
                            </div>
                        </div>

                        {/* Ad Difficulty Gauge */}
                        <div className="mt-4 pt-4 border-t border-slate-700">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-slate-400 flex items-center gap-2">
                                    <AlertTriangle size={14} />
                                    Difficulté Pub
                                </span>
                                <span className={`text-sm font-bold ${product.sales >= 50000 ? 'text-red-400' :
                                        product.sales >= 20000 ? 'text-orange-400' :
                                            product.sales >= 5000 ? 'text-yellow-400' : 'text-green-400'
                                    }`}>
                                    {product.sales >= 50000 ? 'Très difficile' :
                                        product.sales >= 20000 ? 'Difficile' :
                                            product.sales >= 5000 ? 'Modérée' : 'Facile'}
                                </span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${product.sales >= 50000 ? 'bg-red-500 w-full' :
                                            product.sales >= 20000 ? 'bg-orange-500 w-3/4' :
                                                product.sales >= 5000 ? 'bg-yellow-500 w-1/2' : 'bg-green-500 w-1/4'
                                        }`}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Target Audience */}
                    <Card className="p-5 border-slate-800 bg-slate-800/30 mb-6">
                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                            <Users size={18} className="text-blue-400" />
                            Cible Démographique
                        </h4>
                        <p className="text-slate-300 mb-4">{analysis.targetAudience}</p>
                        <div className="flex flex-wrap gap-3">
                            <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-sm">
                                👤 {analysis.targetDemographic.ageRange} ans
                            </span>
                            <span className="px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 text-sm">
                                {analysis.targetDemographic.gender === 'mixte' ? '👥' : analysis.targetDemographic.gender === 'femme' ? '👩' : '👨'} {analysis.targetDemographic.gender}
                            </span>
                            {analysis.targetDemographic.interests.slice(0, 3).map((interest, i) => (
                                <span key={i} className="px-3 py-1.5 rounded-full bg-slate-700 text-slate-300 text-sm">
                                    {interest}
                                </span>
                            ))}
                        </div>
                    </Card>

                    {/* Marketing Angles */}
                    <Card className="p-5 border-slate-800 bg-slate-800/30 mb-6">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Target size={18} className="text-green-400" />
                            Angles Marketing
                        </h4>
                        <div className="space-y-3">
                            {analysis.marketingAngles.map((angle, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold shrink-0">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-slate-300">{angle}</p>
                                        <button
                                            onClick={() => copyToClipboard(angle)}
                                            className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                        >
                                            <Copy size={12} /> Copier
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        {/* 1-Click Import Button */}
                        <Button
                            className={`w-full h-14 text-lg ${importSuccess ? 'bg-green-600' :
                                    isShopifyConnected ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' :
                                        'bg-slate-700'
                                }`}
                            onClick={handleImport}
                            disabled={isImporting || !isShopifyConnected || importSuccess}
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 size={20} className="mr-2 animate-spin" />
                                    Import en cours...
                                </>
                            ) : importSuccess ? (
                                <>
                                    <CheckCircle2 size={20} className="mr-2" />
                                    Importé avec succès!
                                </>
                            ) : isShopifyConnected ? (
                                <>
                                    <Upload size={20} className="mr-2" />
                                    Importer vers ma boutique
                                </>
                            ) : (
                                <>
                                    <Store size={20} className="mr-2" />
                                    Connectez Shopify pour importer
                                </>
                            )}
                        </Button>

                        {importError && (
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                <AlertTriangle size={16} />
                                {importError}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <a
                                href={product.productUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1"
                            >
                                <Button variant="outline" className="w-full h-12">
                                    <ExternalLink size={18} className="mr-2" />
                                    AliExpress
                                </Button>
                            </a>
                            <Button variant="outline" className="flex-1 h-12">
                                <MessageSquare size={18} className="mr-2" />
                                Générer fiche
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Fermer
                    </Button>
                </div>
            </div>
        </div>
    );
}
