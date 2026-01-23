'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
    Search, Trophy, TrendingUp, Sparkles, Star, Package,
    Loader2, Filter, RefreshCw, Target, Users, Zap,
    ShoppingCart, ExternalLink, BookmarkPlus
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { searchAndAnalyzeProducts, getTrendingWinners, WinnersSearchResult } from '@/lib/winners-actions';
import { AnalyzedProduct } from '@/lib/ai/analyzer';
import WinnerProductCard from './WinnerProductCard';
import ProductAnalysisModal from './ProductAnalysisModal';

export default function WinnersClient() {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<WinnersSearchResult | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<AnalyzedProduct | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingTrending, setIsLoadingTrending] = useState(true);
    const [isPending, startTransition] = useTransition();

    // Load trending winners on mount
    useEffect(() => {
        loadTrendingWinners();
    }, []);

    const loadTrendingWinners = async () => {
        setIsLoadingTrending(true);
        const result = await getTrendingWinners();
        setResults(result);
        setIsLoadingTrending(false);
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        startTransition(async () => {
            const result = await searchAndAnalyzeProducts(searchQuery, { limit: 15 });
            setResults(result);
            setIsSearching(false);
        });
    };

    const isLoading = isSearching || isPending || isLoadingTrending;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500">
                            <Trophy className="text-white" size={28} />
                        </div>
                        Produits Gagnants IA
                    </h1>
                    <p className="text-slate-400 mt-2">
                        Découvrez les meilleurs produits analysés par notre IA en temps réel
                    </p>
                </div>

                {/* Stats Badges */}
                {results && !isLoading && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                            <Trophy size={18} className="text-green-400" />
                            <span className="text-green-400 font-bold">{results.stats.winners}</span>
                            <span className="text-green-400/80 text-sm">Winners</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                            <TrendingUp size={18} className="text-blue-400" />
                            <span className="text-blue-400 font-bold">{results.stats.potentials}</span>
                            <span className="text-blue-400/80 text-sm">Potentiels</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50 border border-slate-700">
                            <Package size={18} className="text-slate-400" />
                            <span className="text-white font-bold">{results.stats.total}</span>
                            <span className="text-slate-400 text-sm">Trouvés</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Search Bar */}
            <Card className="p-6 border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-800/50">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher un produit (ex: led lights, phone holder, posture corrector...)"
                            className="w-full h-14 pl-12 pr-4 rounded-xl border border-slate-700 bg-slate-800/80 text-white text-lg placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading || !searchQuery.trim()}
                        className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={22} />
                                Analyse IA...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2" size={22} />
                                Rechercher
                            </>
                        )}
                    </Button>
                </form>

                {/* Quick Search Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-slate-500 text-sm">Recherches populaires:</span>
                    {['LED Lights', 'Phone Accessories', 'Beauty Tools', 'Pet Gadgets', 'Fitness Equipment', 'Smart Home'].map(tag => (
                        <button
                            key={tag}
                            onClick={() => {
                                setSearchQuery(tag);
                                startTransition(async () => {
                                    setIsSearching(true);
                                    const result = await searchAndAnalyzeProducts(tag, { limit: 15 });
                                    setResults(result);
                                    setIsSearching(false);
                                });
                            }}
                            disabled={isLoading}
                            className="px-3 py-1 text-sm rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Loading State - Skeleton */}
            {isLoading && (
                <div className="space-y-6">
                    <div className="flex items-center justify-center gap-3 py-4">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <div>
                            <p className="text-white font-medium">Analyse IA en cours...</p>
                            <p className="text-slate-400 text-sm">Recherche des meilleurs produits</p>
                        </div>
                    </div>

                    {/* Skeleton Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Card key={i} className="p-4 border-slate-800 bg-slate-900/50 animate-pulse">
                                <div className="aspect-square rounded-xl bg-slate-800 mb-4" />
                                <div className="h-4 bg-slate-800 rounded mb-2 w-3/4" />
                                <div className="h-4 bg-slate-800 rounded mb-4 w-1/2" />
                                <div className="flex gap-2">
                                    <div className="h-8 bg-slate-800 rounded-full w-20" />
                                    <div className="h-8 bg-slate-800 rounded-full w-24" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Error State */}
            {!isLoading && results?.error && (
                <Card className="p-8 border-red-500/20 bg-red-500/5 text-center">
                    <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">{results.error}</h3>
                    <p className="text-slate-400 mb-4">Vérifiez votre connexion ou essayez un autre mot-clé</p>
                    <Button onClick={loadTrendingWinners} variant="outline">
                        <RefreshCw size={18} className="mr-2" />
                        Charger les tendances
                    </Button>
                </Card>
            )}

            {/* Results Grid */}
            {!isLoading && results && results.products.length > 0 && (
                <>
                    {/* Section Title */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Zap className="text-yellow-400" size={24} />
                            {searchQuery ? `Résultats pour "${searchQuery}"` : 'Produits Tendance du Jour'}
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={loadTrendingWinners}
                            disabled={isLoading}
                        >
                            <RefreshCw size={16} className="mr-2" />
                            Actualiser
                        </Button>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {results.products.map(product => (
                            <WinnerProductCard
                                key={product.id}
                                product={product}
                                onClick={() => setSelectedProduct(product)}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Empty State */}
            {!isLoading && results && results.products.length === 0 && !results.error && (
                <Card className="p-12 border-slate-800 bg-slate-900/50 text-center">
                    <Package className="w-20 h-20 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-semibold text-white mb-2">Aucun produit trouvé</h3>
                    <p className="text-slate-400 mb-6 max-w-md mx-auto">
                        Essayez un autre mot-clé ou modifiez vos critères de recherche
                    </p>
                    <Button onClick={loadTrendingWinners}>
                        <TrendingUp size={18} className="mr-2" />
                        Voir les tendances
                    </Button>
                </Card>
            )}

            {/* Product Analysis Modal */}
            {selectedProduct && (
                <ProductAnalysisModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
}
