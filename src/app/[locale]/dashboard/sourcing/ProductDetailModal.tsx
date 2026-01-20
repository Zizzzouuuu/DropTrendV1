'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
    X, Star, ShoppingCart, TrendingUp, Target, Users, Lightbulb,
    ExternalLink, Bookmark, BookmarkCheck, ShoppingBag, Loader2,
    CheckCircle2, AlertTriangle, XCircle, Sparkles, Copy, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProductWithScore, getProductAnalysis, toggleSaveProduct, importToShopify } from '@/lib/aliexpress-actions';
import { ProductAnalysis } from '@/lib/ai/analyzer';

interface ProductDetailModalProps {
    product: ProductWithScore;
    onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
    const [analysis, setAnalysis] = useState<(ProductAnalysis & { product: any }) | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(product.isSaved || false);
    const [isImporting, setIsImporting] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);
    const [customPrice, setCustomPrice] = useState('');
    const [isPending, startTransition] = useTransition();
    const [activeTab, setActiveTab] = useState<'analysis' | 'marketing' | 'import'>('analysis');

    useEffect(() => {
        const loadAnalysis = async () => {
            setIsLoading(true);
            const result = await getProductAnalysis(product.id);
            if (result.analysis) {
                setAnalysis(result.analysis);
                setCustomPrice(result.analysis.suggestedPrice.toFixed(2));
            }
            setIsLoading(false);
        };
        loadAnalysis();
    }, [product.id]);

    const handleSave = () => {
        startTransition(async () => {
            const result = await toggleSaveProduct(product.id);
            if (!result.error) {
                setIsSaved(result.saved);
            }
        });
    };

    const handleImport = async () => {
        if (!customPrice) return;

        setIsImporting(true);
        const result = await importToShopify(product.id, parseFloat(customPrice));
        setIsImporting(false);

        if (result.success) {
            setImportSuccess(true);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-400';
        if (score >= 60) return 'text-blue-400';
        if (score >= 40) return 'text-yellow-400';
        return 'text-red-400';
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'winner': return <CheckCircle2 className="text-green-400" size={24} />;
            case 'potential': return <TrendingUp className="text-blue-400" size={24} />;
            case 'risky': return <AlertTriangle className="text-yellow-400" size={24} />;
            default: return <XCircle className="text-red-400" size={24} />;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-yellow-400" size={24} />
                        <h2 className="text-lg font-bold text-white">Analyse IA du Produit</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-130px)]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                            <p className="text-slate-400">Analyse IA en cours...</p>
                            <p className="text-xs text-slate-500 mt-2">Évaluation de la rentabilité, tendances et concurrence</p>
                        </div>
                    ) : analysis ? (
                        <div className="p-6">
                            {/* Product Overview */}
                            <div className="flex flex-col md:flex-row gap-6 mb-6">
                                {/* Image */}
                                <div className="w-full md:w-1/3">
                                    <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-800">
                                        <img
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Score Badge */}
                                        <div className={`absolute top-3 left-3 px-3 py-1.5 rounded-full bg-gradient-to-r ${analysis.overallScore >= 80 ? 'from-green-500 to-emerald-600' :
                                                analysis.overallScore >= 60 ? 'from-blue-500 to-cyan-600' :
                                                    'from-yellow-500 to-orange-600'
                                            } text-white font-bold flex items-center gap-2`}>
                                            {getStatusIcon(analysis.winnerStatus)}
                                            <span className="text-2xl">{analysis.overallScore}</span>
                                            <span className="text-xs opacity-80">/100</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mb-2 ${analysis.winnerStatus === 'winner' ? 'bg-green-500/10 text-green-400' :
                                                    analysis.winnerStatus === 'potential' ? 'bg-blue-500/10 text-blue-400' :
                                                        'bg-yellow-500/10 text-yellow-400'
                                                }`}>
                                                {analysis.winnerStatus === 'winner' ? '🏆 Winner' :
                                                    analysis.winnerStatus === 'potential' ? '📈 Potentiel' : '⚠️ Risqué'}
                                            </span>
                                            <h3 className="text-xl font-bold text-white">{product.name}</h3>
                                        </div>
                                        <button
                                            onClick={handleSave}
                                            disabled={isPending}
                                            className={`p-3 rounded-lg transition-colors ${isSaved ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                                                }`}
                                        >
                                            {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                                        </button>
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                        <div className="p-3 rounded-lg bg-slate-800/50">
                                            <div className="text-xs text-slate-500 mb-1">Coût</div>
                                            <div className="text-lg font-bold text-white">{product.price.toFixed(2)}€</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-800/50">
                                            <div className="text-xs text-slate-500 mb-1">Prix suggéré</div>
                                            <div className="text-lg font-bold text-green-400">{analysis.suggestedPrice.toFixed(2)}€</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-800/50">
                                            <div className="text-xs text-slate-500 mb-1">Marge</div>
                                            <div className="text-lg font-bold text-green-400">{analysis.profitMargin}%</div>
                                        </div>
                                        <div className="p-3 rounded-lg bg-slate-800/50">
                                            <div className="text-xs text-slate-500 mb-1">Profit/unité</div>
                                            <div className="text-lg font-bold text-green-400">{analysis.profitPerUnit.toFixed(2)}€</div>
                                        </div>
                                    </div>

                                    {/* Meta Info */}
                                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <ShoppingCart size={14} />
                                            {product.orders.toLocaleString()} commandes
                                        </span>
                                        {product.rating && (
                                            <span className="flex items-center gap-1">
                                                <Star size={14} className="text-yellow-400" />
                                                {product.rating}/5
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <Target size={14} />
                                            {analysis.niche}
                                        </span>
                                        <span className={`flex items-center gap-1 ${analysis.competitionLevel === 'low' ? 'text-green-400' :
                                                analysis.competitionLevel === 'medium' ? 'text-yellow-400' : 'text-red-400'
                                            }`}>
                                            Concurrence: {analysis.competitionLevel === 'low' ? 'Faible' :
                                                analysis.competitionLevel === 'medium' ? 'Moyenne' : 'Élevée'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 border-b border-slate-800 pb-4">
                                {(['analysis', 'marketing', 'import'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab
                                                ? 'bg-blue-600 text-white'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        {tab === 'analysis' && '📊 Analyse'}
                                        {tab === 'marketing' && '🎯 Marketing'}
                                        {tab === 'import' && '🛒 Import Shopify'}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'analysis' && (
                                <div className="space-y-6">
                                    {/* Score Breakdown */}
                                    <Card className="p-5 border-slate-800 bg-slate-800/30">
                                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                            <Sparkles size={18} className="text-yellow-400" />
                                            Analyse Détaillée
                                        </h4>
                                        <div className="space-y-4">
                                            {analysis.factors.map((factor, i) => (
                                                <div key={i}>
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-sm text-white font-medium flex items-center gap-2">
                                                            {factor.positive ?
                                                                <CheckCircle2 size={14} className="text-green-400" /> :
                                                                <AlertTriangle size={14} className="text-yellow-400" />
                                                            }
                                                            {factor.name}
                                                        </span>
                                                        <span className={`text-sm font-bold ${getScoreColor(factor.score)}`}>
                                                            {factor.score}/100
                                                        </span>
                                                    </div>
                                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-1">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${factor.score >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                                                                    factor.score >= 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' :
                                                                        'bg-gradient-to-r from-yellow-500 to-orange-400'
                                                                }`}
                                                            style={{ width: `${factor.score}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500">{factor.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>

                                    {/* Scores Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <Card className="p-4 border-slate-800 bg-slate-800/30 text-center">
                                            <div className={`text-3xl font-black ${getScoreColor(analysis.profitabilityScore)}`}>
                                                {analysis.profitabilityScore}
                                            </div>
                                            <div className="text-xs text-slate-500 uppercase font-bold mt-1">Rentabilité</div>
                                        </Card>
                                        <Card className="p-4 border-slate-800 bg-slate-800/30 text-center">
                                            <div className={`text-3xl font-black ${getScoreColor(analysis.trendScore)}`}>
                                                {analysis.trendScore}
                                            </div>
                                            <div className="text-xs text-slate-500 uppercase font-bold mt-1">Tendance</div>
                                        </Card>
                                        <Card className="p-4 border-slate-800 bg-slate-800/30 text-center">
                                            <div className={`text-3xl font-black ${getScoreColor(analysis.competitionScore)}`}>
                                                {analysis.competitionScore}
                                            </div>
                                            <div className="text-xs text-slate-500 uppercase font-bold mt-1">Concurrence</div>
                                        </Card>
                                        <Card className="p-4 border-slate-800 bg-slate-800/30 text-center">
                                            <div className={`text-3xl font-black ${getScoreColor(analysis.overallScore)}`}>
                                                {analysis.overallScore}
                                            </div>
                                            <div className="text-xs text-slate-500 uppercase font-bold mt-1">Score Global</div>
                                        </Card>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'marketing' && (
                                <div className="space-y-6">
                                    {/* Target Audience */}
                                    <Card className="p-5 border-slate-800 bg-slate-800/30">
                                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                            <Users size={18} className="text-blue-400" />
                                            Audience Cible
                                        </h4>
                                        <p className="text-slate-300">{analysis.targetAudience}</p>
                                    </Card>

                                    {/* Marketing Angle */}
                                    <Card className="p-5 border-slate-800 bg-slate-800/30">
                                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                            <Target size={18} className="text-purple-400" />
                                            Angle Marketing
                                        </h4>
                                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                            <p className="text-slate-300">{analysis.marketingAngle}</p>
                                            <button
                                                onClick={() => copyToClipboard(analysis.marketingAngle)}
                                                className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                            >
                                                <Copy size={12} /> Copier
                                            </button>
                                        </div>
                                    </Card>

                                    {/* Ad Hooks */}
                                    <Card className="p-5 border-slate-800 bg-slate-800/30">
                                        <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                                            <MessageSquare size={18} className="text-green-400" />
                                            Hooks Publicitaires
                                        </h4>
                                        <div className="space-y-3">
                                            {analysis.adHooks.map((hook, i) => (
                                                <div key={i} className="flex items-start gap-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                                                    <span className="text-xl">💬</span>
                                                    <div className="flex-1">
                                                        <p className="text-slate-300 text-sm">{hook}</p>
                                                        <button
                                                            onClick={() => copyToClipboard(hook)}
                                                            className="mt-1 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                                        >
                                                            <Copy size={12} /> Copier
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                </div>
                            )}

                            {activeTab === 'import' && (
                                <div className="space-y-6">
                                    {importSuccess ? (
                                        <Card className="p-8 border-green-500/20 bg-green-500/5 text-center">
                                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                            <h3 className="text-xl font-bold text-white mb-2">Produit Importé avec Succès!</h3>
                                            <p className="text-slate-400 mb-4">Le produit a été ajouté à votre boutique Shopify</p>
                                            <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                                                Fermer
                                            </Button>
                                        </Card>
                                    ) : (
                                        <>
                                            <Card className="p-5 border-slate-800 bg-slate-800/30">
                                                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                                                    <ShoppingBag size={18} className="text-green-400" />
                                                    Importer vers Shopify
                                                </h4>

                                                <div className="space-y-4">
                                                    {/* Price Input */}
                                                    <div>
                                                        <label className="text-sm text-slate-400 mb-2 block">Prix de vente (€)</label>
                                                        <input
                                                            type="number"
                                                            value={customPrice}
                                                            onChange={(e) => setCustomPrice(e.target.value)}
                                                            className="w-full h-12 px-4 rounded-lg border border-slate-700 bg-slate-800 text-white text-lg font-bold"
                                                            step="0.01"
                                                            min={product.price}
                                                        />
                                                        <p className="text-xs text-slate-500 mt-1">
                                                            Prix suggéré: {analysis.suggestedPrice.toFixed(2)}€ (marge {analysis.profitMargin}%)
                                                        </p>
                                                    </div>

                                                    {/* Profit Calculation */}
                                                    {customPrice && (
                                                        <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                                                            <div className="flex justify-between mb-2">
                                                                <span className="text-slate-400">Prix de vente</span>
                                                                <span className="text-white font-bold">{parseFloat(customPrice).toFixed(2)}€</span>
                                                            </div>
                                                            <div className="flex justify-between mb-2">
                                                                <span className="text-slate-400">Coût produit</span>
                                                                <span className="text-white">-{product.price.toFixed(2)}€</span>
                                                            </div>
                                                            <div className="border-t border-slate-700 pt-2 mt-2">
                                                                <div className="flex justify-between">
                                                                    <span className="text-slate-400">Profit par vente</span>
                                                                    <span className="text-green-400 font-bold">
                                                                        +{(parseFloat(customPrice) - product.price).toFixed(2)}€
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Import Button */}
                                                    <Button
                                                        onClick={handleImport}
                                                        disabled={isImporting || !customPrice}
                                                        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                                    >
                                                        {isImporting ? (
                                                            <>
                                                                <Loader2 className="animate-spin mr-2" size={20} />
                                                                Import en cours...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShoppingBag size={20} className="mr-2" />
                                                                Importer vers Shopify
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </Card>

                                            {/* AliExpress Link */}
                                            <Card className="p-4 border-slate-800 bg-slate-800/30">
                                                <a
                                                    href={product.productUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between text-slate-400 hover:text-white transition-colors"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <ExternalLink size={16} />
                                                        Voir sur AliExpress
                                                    </span>
                                                    <span className="text-xs">↗</span>
                                                </a>
                                            </Card>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center py-20">
                            <p className="text-slate-400">Erreur lors du chargement de l'analyse</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Fermer
                    </Button>
                </div>
            </div>
        </div>
    );
}
