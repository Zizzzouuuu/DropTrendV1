'use client';

import React, { useState, useMemo } from 'react';
import {
    Search,
    Filter,
    Download,
    ShoppingCart,
    Eye,
    X,
    ExternalLink,
    Bookmark,
    Lock
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { toggleProductSave } from '@/lib/actions';
import ProfitCalculator from '@/components/ProfitCalculator';
import ProductReviews from '@/components/dashboard/ProductReviews';

// Define the UI Product type based on what we need
export interface UIProduct {
    id: string;
    name: string;
    niche: string;
    buyPrice: number;
    sellPrice: number;
    margin: number;
    competition: string; // "Faible", "Moyenne", "Élevée" (derived or stored)
    platform: string;
    supplier: string;
    analysis: string;
    image: string;
    status: string;
}

interface DashboardClientProps {
    products: UIProduct[];
    userSubscription: string;
    savedProductIds: string[];
}

export default function DashboardClient({ products, userSubscription, savedProductIds }: DashboardClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [nicheFilter, setNicheFilter] = useState("Toutes");
    const [favoritesFilter, setFavoritesFilter] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<UIProduct | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set(savedProductIds));

    // Derive niches from actual data
    const niches = useMemo(() => ["Toutes", ...Array.from(new Set(products.map(p => p.niche)))], [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesNiche = nicheFilter === "Toutes" || p.niche === nicheFilter;
            const matchesFav = favoritesFilter ? savedIds.has(p.id) : true;
            return matchesSearch && matchesNiche && matchesFav;
        });
    }, [searchTerm, nicheFilter, products, favoritesFilter, savedIds]);

    // Handle Free Plan Restrictions
    // Instead of hiding products, we lock them after the first 3
    const displayedProducts = useMemo(() => {
        if (userSubscription === 'pro') return filteredProducts;
        return filteredProducts.map((p, index) => {
            if (index < 3) return p;
            return { ...p, isLocked: true };
        });
    }, [filteredProducts, userSubscription]);

    const handleExport = (name: string) => {
        setIsExporting(true);
        // Simulate API call to backend export
        setTimeout(() => {
            setIsExporting(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }, 1500);
    };

    const handleSave = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newSet = new Set(savedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSavedIds(newSet);
        await toggleProductSave(id);
    };

    return (
        <>
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed bottom-8 right-8 z-[100] bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
                    <Download size={20} />
                    <span className="font-bold">Produit exporté avec succès vers Shopify !</span>
                </div>
            )}

            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Product Explorer</h1>
                    <p className="text-sm text-muted-foreground">Analyses en temps réel des produits à haut potentiel.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-card border border-border rounded-lg px-3 py-2 flex items-center gap-3 shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold overflow-hidden">
                            <img src={`https://ui-avatars.com/api/?background=random&color=fff&name=${userSubscription}`} alt="Avatar" />
                        </div>
                        <span className="text-xs font-bold text-foreground">Membre {userSubscription === 'pro' ? 'Pro' : 'Starter'}</span>
                    </div>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Chercher un produit ou une niche..."
                        className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors text-sm shadow-sm placeholder:text-muted-foreground"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
                    <select
                        className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-foreground appearance-none focus:outline-none focus:border-primary text-sm cursor-pointer shadow-sm"
                        value={nicheFilter}
                        onChange={(e) => setNicheFilter(e.target.value)}
                    >
                        {niches.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFavoritesFilter(!favoritesFilter)}
                        className={`h-full aspect-square rounded-xl border flex items-center justify-center transition-all ${favoritesFilter ? 'bg-primary border-primary text-primary-foreground' : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted shadow-sm'}`}
                        title="Voir mes favoris"
                    >
                        <Bookmark size={20} fill={favoritesFilter ? "currentColor" : "none"} />
                    </button>
                    <div className="flex-1 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="text-xs text-primary font-bold uppercase tracking-widest">Winners</span>
                        <span className="text-xl font-black text-foreground">{filteredProducts.length}</span>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {userSubscription === 'free' && filteredProducts.length > 0 && (
                <div className="bg-blue-600/10 border border-blue-600/20 p-4 rounded-xl mb-6 flex items-center justify-between">
                    <span className="text-blue-400 font-bold">Mode Gratuit : Affichage limité à 3 produits.</span>
                    <Link href="/pricing" className="text-white bg-blue-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500">Passer Pro</Link>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedProducts.map((product: any) => (
                    <Card key={product.id} className={`group hover:border-slate-600 transition-all ${product.isLocked ? 'opacity-70 pointer-events-none select-none relative overflow-hidden' : ''}`}>
                        {product.isLocked && (
                            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-sm p-6 text-center">
                                <div className="bg-slate-900 p-4 rounded-full mb-3 shadow-xl border border-slate-700">
                                    <Lock size={24} className="text-blue-400" />
                                </div>
                                <h3 className="text-white font-bold mb-2">Produit Pro</h3>
                                <p className="text-slate-300 text-sm mb-4">Passez Pro pour voir l'analyse complète</p>
                                <Link href="/pricing" className="pointer-events-auto">
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500">Débloquer</Button>
                                </Link>
                            </div>
                        )}
                        <div className="h-48 overflow-hidden relative">
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                            <div className="absolute top-3 left-3 flex gap-2">
                                <Badge type="info">{product.niche}</Badge>
                                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/50">AI Score: {90 + (product.id.charCodeAt(0) % 10)}/100</Badge>
                            </div>
                            <button
                                onClick={(e) => handleSave(product.id, e)}
                                className={`absolute top-3 right-3 w-8 h-8 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors z-20 ${savedIds.has(product.id) ? 'bg-blue-600 text-white' : 'bg-slate-950/50 text-white hover:bg-slate-800'}`}
                            >
                                <Bookmark size={14} fill={savedIds.has(product.id) ? "currentColor" : "none"} />
                            </button>
                            <div className="absolute bottom-3 right-3">
                                <Badge type={product.competition === 'Faible' ? 'success' : 'warning'}>
                                    Conc. {product.competition}
                                </Badge>
                            </div>
                        </div>
                        <div className={`p-5 ${product.isLocked ? 'blur-sm' : ''}`}>
                            <h3 className="text-lg font-bold text-white mb-4 line-clamp-1">{product.name}</h3>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Prix Vente</span>
                                    <span className="text-lg font-black text-white">{product.sellPrice.toFixed(2)}€</span>
                                </div>
                                <div className="bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10">
                                    <span className="text-[10px] text-emerald-500 font-bold uppercase block mb-1">Marge Est.</span>
                                    <span className="text-lg font-black text-emerald-400">+{product.margin.toFixed(2)}€</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button className="flex-1 py-2 text-xs" onClick={() => setSelectedProduct(product)}>
                                    <Eye size={16} /> Détails
                                </Button>
                                <Button variant="outline" className="px-3" onClick={() => handleExport(product.name)}>
                                    <ShoppingCart size={16} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
                <div className="py-20 text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-700">
                        <Search size={32} />
                    </div>
                    <h3 className="text-white font-bold text-lg">Aucun produit trouvé</h3>
                    <p className="text-slate-500">Essayez de modifier vos filtres ou votre recherche.</p>
                </div>
            )}

            {/* Product Detail Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)}></div>
                    <Card className="w-full max-w-3xl relative z-10 max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-300">
                        <div className="grid md:grid-cols-2">
                            <div className="h-64 md:h-auto overflow-hidden">
                                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <Badge type="info" className="mb-2 inline-block">{selectedProduct.niche}</Badge>
                                        <h2 className="text-2xl font-bold text-white">{selectedProduct.name}</h2>
                                    </div>
                                    <button onClick={() => setSelectedProduct(null)} className="text-slate-500 hover:text-white cursor-pointer">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center justify-between text-sm py-2 border-b border-slate-800">
                                        <span className="text-slate-400">Achat fournisseur</span>
                                        <span className="text-white font-bold">{selectedProduct.buyPrice.toFixed(2)}€</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm py-2 border-b border-slate-800">
                                        <span className="text-slate-400">Canal recommandé</span>
                                        <span className="text-white font-bold">{selectedProduct.platform}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-slate-500 uppercase font-black block mb-2 tracking-widest">Analyse Expert</span>
                                        <p className="text-slate-300 text-sm leading-relaxed italic">
                                            "{selectedProduct.analysis}"
                                        </p>
                                    </div>

                                    {/* Profit Calculator Integration */}
                                    <ProfitCalculator buyPrice={selectedProduct.buyPrice} sellPrice={selectedProduct.sellPrice} />

                                    <ProductReviews />
                                </div>

                                <div className="space-y-3">
                                    <Button className="w-full h-12" onClick={() => handleExport(selectedProduct.name)}>
                                        {isExporting ? (
                                            <span className="flex items-center gap-2">Génération CSV...</span>
                                        ) : (
                                            <span className="flex items-center gap-2 font-bold uppercase tracking-wider"><Download size={18} /> Exporter vers Shopify</span>
                                        )}
                                    </Button>
                                    <a href={selectedProduct.supplier} target="_blank" rel="noreferrer">
                                        <Button variant="outline" className="w-full h-12">
                                            <ExternalLink size={18} /> Voir le Fournisseur
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </>
    );
}
