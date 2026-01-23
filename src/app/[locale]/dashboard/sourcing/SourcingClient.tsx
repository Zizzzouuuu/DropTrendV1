'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { Search, Filter, TrendingUp, Sparkles, Star, Package, Bookmark, BookmarkCheck, Loader2, Trophy, Flame } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ProductCard from './ProductCard';
import ProductDetailModal from './ProductDetailModal';
import { searchProducts, getTrending, getWinnersOfTheDay, getSavedProducts, ProductWithScore, SearchFilters } from '@/lib/aliexpress-actions';

interface SourcingClientProps {
    initialProducts: ProductWithScore[];
}

type TabType = 'winners' | 'search' | 'saved';

const NICHES = [
    "Tous", "Tech & Gadgets", "Health & Wellness", "Home & Living",
    "Kitchen", "Beauty", "Pets", "Fitness", "Fashion"
];

const SCORE_FILTERS = [
    { label: "Tous", value: 0 },
    { label: "Potentiels (60+)", value: 60 },
    { label: "Winners (80+)", value: 80 }
];

export default function SourcingClient({ initialProducts }: SourcingClientProps) {
    const [activeTab, setActiveTab] = useState<TabType>('winners');
    const [products, setProducts] = useState<ProductWithScore[]>(initialProducts);
    const [winnersProducts, setWinnersProducts] = useState<ProductWithScore[]>([]);
    const [savedProductsList, setSavedProductsList] = useState<ProductWithScore[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNiche, setSelectedNiche] = useState('Tous');
    const [minScore, setMinScore] = useState(0);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50]);
    const [selectedProduct, setSelectedProduct] = useState<ProductWithScore | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isSearching, setIsSearching] = useState(false);
    const [isLoadingWinners, setIsLoadingWinners] = useState(true);

    // Load Winners on mount
    useEffect(() => {
        const loadWinners = async () => {
            setIsLoadingWinners(true);
            const result = await getWinnersOfTheDay();
            if (result.products) {
                setWinnersProducts(result.products);
            }
            setIsLoadingWinners(false);
        };
        loadWinners();
    }, []);

    // Load saved products when tab changes
    const handleTabChange = async (tab: TabType) => {
        setActiveTab(tab);
        if (tab === 'saved') {
            startTransition(async () => {
                const result = await getSavedProducts();
                if (result.products) {
                    setSavedProductsList(result.products as ProductWithScore[]);
                }
            });
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!searchQuery.trim() && selectedNiche === 'Tous') {
            // Load trending if no specific search
            setIsSearching(true);
            startTransition(async () => {
                const result = await getTrending(20);
                if (result.products) {
                    setProducts(result.products);
                }
                setIsSearching(false);
            });
            return;
        }

        setIsSearching(true);
        const filters: SearchFilters = {
            query: searchQuery || selectedNiche,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            minScore: minScore > 0 ? minScore : undefined,
            limit: 24
        };

        startTransition(async () => {
            const result = await searchProducts(filters);
            if (result.products) {
                setProducts(result.products);
            }
            setIsSearching(false);
        });
    };

    const handleNicheClick = (niche: string) => {
        setSelectedNiche(niche);
        if (niche !== 'Tous') {
            setSearchQuery(niche);
        }

        startTransition(async () => {
            const result = await searchProducts({
                query: niche === 'Tous' ? '' : niche,
                minScore: minScore > 0 ? minScore : undefined,
                limit: 24
            });
            if (result.products) {
                setProducts(result.products);
            }
        });
    };

    const filteredProducts = products.filter(p =>
        p.quickScore >= minScore
    );

    const winnerCount = products.filter(p => p.quickScore >= 80).length;
    const potentialCount = products.filter(p => p.quickScore >= 60 && p.quickScore < 80).length;

    // Get current products based on tab
    const currentProducts = activeTab === 'winners'
        ? winnersProducts
        : activeTab === 'saved'
            ? savedProductsList
            : filteredProducts;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="text-yellow-400" size={28} />
                        Produits Gagnants IA
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Découvrez les meilleurs produits dropshipping analysés par notre IA
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-green-400 text-sm font-medium">{winnersProducts.length} Winners</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <span className="text-blue-400 text-sm font-medium">{potentialCount} Potentiels</span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-800 pb-4">
                <button
                    onClick={() => handleTabChange('winners')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'winners'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-orange-500/25'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                >
                    <Trophy size={18} />
                    Winners du Jour
                    {winnersProducts.length > 0 && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{winnersProducts.length}</span>
                    )}
                </button>
                <button
                    onClick={() => handleTabChange('search')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'search'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                >
                    <Search size={18} />
                    Rechercher
                </button>
                <button
                    onClick={() => handleTabChange('saved')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${activeTab === 'saved'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                        }`}
                >
                    <Bookmark size={18} />
                    Sauvegardés
                    {savedProductsList.length > 0 && (
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">{savedProductsList.length}</span>
                    )}
                </button>
            </div>

            {/* Search Bar */}
            <Card className="p-4 border-slate-800 bg-slate-900/50">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher un produit (ex: phone holder, led light...)"
                            className="w-full h-12 pl-10 pr-4 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                            className="h-12 px-4"
                        >
                            <Filter size={18} />
                            <span className="ml-2 hidden sm:inline">Filtres</span>
                        </Button>
                        <Button type="submit" className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                            {isSearching ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                            <span className="ml-2">Rechercher</span>
                        </Button>
                    </div>
                </form>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Score Filter */}
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Score minimum</label>
                            <div className="flex gap-2">
                                {SCORE_FILTERS.map(filter => (
                                    <button
                                        key={filter.value}
                                        onClick={() => setMinScore(filter.value)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${minScore === filter.value
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                            }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Prix (coût AliExpress)</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    value={priceRange[0]}
                                    onChange={(e) => setPriceRange([parseFloat(e.target.value) || 0, priceRange[1]])}
                                    className="w-20 h-9 px-2 rounded-md border border-slate-700 bg-slate-800 text-white text-sm"
                                    min={0}
                                />
                                <span className="text-slate-500">à</span>
                                <input
                                    type="number"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([priceRange[0], parseFloat(e.target.value) || 100])}
                                    className="w-20 h-9 px-2 rounded-md border border-slate-700 bg-slate-800 text-white text-sm"
                                    min={0}
                                />
                                <span className="text-slate-500">€</span>
                            </div>
                        </div>

                        {/* Min Orders */}
                        <div>
                            <label className="text-xs text-slate-500 uppercase font-bold mb-2 block">Commandes minimum</label>
                            <select className="w-full h-9 px-2 rounded-md border border-slate-700 bg-slate-800 text-white text-sm">
                                <option value="0">Tous</option>
                                <option value="1000">1,000+</option>
                                <option value="5000">5,000+</option>
                                <option value="10000">10,000+</option>
                                <option value="25000">25,000+</option>
                            </select>
                        </div>
                    </div>
                )}
            </Card>

            {/* Niche Tags */}
            <div className="flex flex-wrap gap-2">
                {NICHES.map(niche => (
                    <button
                        key={niche}
                        onClick={() => handleNicheClick(niche)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedNiche === niche
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                            }`}
                    >
                        {niche}
                    </button>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Package size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{products.length}</div>
                            <div className="text-xs text-slate-500">Produits trouvés</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <TrendingUp size={20} className="text-green-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{winnerCount}</div>
                            <div className="text-xs text-slate-500">Winners (80+)</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                            <Star size={20} className="text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{potentialCount}</div>
                            <div className="text-xs text-slate-500">Potentiels (60+)</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Bookmark size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{products.filter(p => p.isSaved).length}</div>
                            <div className="text-xs text-slate-500">Sauvegardés</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Products Grid */}
            {(isPending || isSearching || (activeTab === 'winners' && isLoadingWinners)) ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-400">
                            {activeTab === 'winners' ? '🏆 Chargement des Winners du jour...' : 'Analyse des produits en cours...'}
                        </p>
                    </div>
                </div>
            ) : currentProducts.length === 0 ? (
                <div className="text-center py-20">
                    <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                        {activeTab === 'saved' ? 'Aucun produit sauvegardé' : 'Aucun produit trouvé'}
                    </h3>
                    <p className="text-slate-400">
                        {activeTab === 'saved'
                            ? 'Sauvegardez des produits pour les retrouver ici'
                            : 'Essayez de modifier vos filtres ou votre recherche'}
                    </p>
                </div>
            ) : (
                <>
                    {activeTab === 'winners' && (
                        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
                            <div className="flex items-center gap-2">
                                <Trophy className="text-yellow-400" size={20} />
                                <span className="text-yellow-400 font-medium">Winners du Jour</span>
                            </div>
                            <p className="text-slate-400 text-sm mt-1">
                                Ces produits ont un score IA de 80+ et sont sélectionnés parmi les tendances actuelles
                            </p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {currentProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => setSelectedProduct(product)}
                            />
                        ))}
                    </div>
                </>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
}
