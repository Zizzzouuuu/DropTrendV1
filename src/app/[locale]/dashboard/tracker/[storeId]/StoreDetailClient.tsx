'use client';

import React, { useState, useTransition } from 'react';
import {
    ArrowLeft, ExternalLink, RefreshCw, TrendingUp, TrendingDown,
    Package, DollarSign, BarChart3, Star, Clock, Calendar,
    Facebook, Activity, Music2, Tag, Eye, ShoppingCart, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { refreshStore } from '@/lib/tracker-actions';

interface StoreProduct {
    id: string;
    externalId: string;
    name: string;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string | null;
    productUrl: string;
    vendor: string | null;
    productType: string | null;
    isBestseller: boolean;
    firstSeen: Date;
    lastSeen: Date;
    isActive: boolean;
}

interface StoreSnapshot {
    totalProducts: number;
    avgPrice: number | null;
    newProducts: number;
    removedProducts: number;
    snapshotDate: Date;
}

interface StoreData {
    id: string;
    url: string;
    shopName: string | null;
    logo: string | null;
    status: string;
    totalProducts: number;
    avgProductPrice: number | null;
    minProductPrice: number | null;
    maxProductPrice: number | null;
    estimatedTraffic: string | null;
    estimatedRevenue: string | null;
    facebookPixel: boolean;
    googleAnalytics: boolean;
    tiktokPixel: boolean;
    categories: string[];
    mainNiche: string | null;
    lastCheck: Date;
    createdAt: Date;
    firstSeen: Date;
    products: StoreProduct[];
    snapshots: StoreSnapshot[];
}

interface StoreDetailClientProps {
    store: StoreData;
}

export default function StoreDetailClient({ store }: StoreDetailClientProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'history'>('overview');
    const [isPending, startTransition] = useTransition();
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        startTransition(async () => {
            await refreshStore(store.id);
            setTimeout(() => setIsRefreshing(false), 3000);
        });
    };

    // Prepare chart data
    const chartData = store.snapshots
        .slice()
        .reverse()
        .map(s => ({
            date: new Date(s.snapshotDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            products: s.totalProducts,
            price: s.avgPrice || 0
        }));

    // Get price distribution
    const priceRanges = [
        { range: '0-20€', count: store.products.filter(p => p.price <= 20).length },
        { range: '20-50€', count: store.products.filter(p => p.price > 20 && p.price <= 50).length },
        { range: '50-100€', count: store.products.filter(p => p.price > 50 && p.price <= 100).length },
        { range: '100€+', count: store.products.filter(p => p.price > 100).length }
    ];

    // Get bestsellers
    const bestsellers = store.products.filter(p => p.isBestseller);

    // Get recent products (first seen in last 7 days)
    const recentProducts = store.products
        .filter(p => {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            return new Date(p.firstSeen) > sevenDaysAgo;
        })
        .slice(0, 10);

    const getTrafficColor = (traffic: string | null) => {
        switch (traffic) {
            case 'very_high': return 'text-purple-400 bg-purple-500/10';
            case 'high': return 'text-green-400 bg-green-500/10';
            case 'medium': return 'text-yellow-400 bg-yellow-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    const getTrafficLabel = (traffic: string | null) => {
        switch (traffic) {
            case 'very_high': return 'Très élevé';
            case 'high': return 'Élevé';
            case 'medium': return 'Moyen';
            default: return 'Faible';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/fr/dashboard/tracker">
                        <Button variant="outline" size="sm">
                            <ArrowLeft size={16} />
                        </Button>
                    </Link>

                    {/* Store Logo & Name */}
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden">
                            {store.logo ? (
                                <img src={store.logo} alt={store.shopName || ''} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xl font-bold">
                                    {(store.shopName || store.url).charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                {store.shopName || store.url}
                                <a
                                    href={`https://${store.url}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-slate-500 hover:text-blue-400 transition-colors"
                                >
                                    <ExternalLink size={18} />
                                </a>
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTrafficColor(store.estimatedTraffic)}`}>
                                    Trafic: {getTrafficLabel(store.estimatedTraffic)}
                                </span>
                                {store.mainNiche && (
                                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-xs">
                                        {store.mainNiche}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        <span className="ml-2">Actualiser</span>
                    </Button>
                </div>
            </div>

            {/* Marketing Pixels */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-slate-500">Pixels détectés:</span>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${store.facebookPixel ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-600'}`}>
                    <Facebook size={16} />
                    <span className="text-xs font-medium">Facebook</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${store.googleAnalytics ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-600'}`}>
                    <Activity size={16} />
                    <span className="text-xs font-medium">Google Analytics</span>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${store.tiktokPixel ? 'bg-pink-500/10 text-pink-400' : 'bg-slate-800 text-slate-600'}`}>
                    <Music2 size={16} />
                    <span className="text-xs font-medium">TikTok</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Package size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{store.totalProducts}</div>
                            <div className="text-xs text-slate-500">Produits</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <DollarSign size={20} className="text-green-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">
                                {store.avgProductPrice ? `${store.avgProductPrice.toFixed(0)}€` : '-'}
                            </div>
                            <div className="text-xs text-slate-500">Prix moyen</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <TrendingUp size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">
                                {store.minProductPrice ? `${store.minProductPrice.toFixed(0)}€` : '-'}
                            </div>
                            <div className="text-xs text-slate-500">Prix min</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                            <TrendingDown size={20} className="text-orange-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">
                                {store.maxProductPrice ? `${store.maxProductPrice.toFixed(0)}€` : '-'}
                            </div>
                            <div className="text-xs text-slate-500">Prix max</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                            <Star size={20} className="text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">{bestsellers.length}</div>
                            <div className="text-xs text-slate-500">Bestsellers</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-4">
                {(['overview', 'products', 'history'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === tab
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        {tab === 'overview' && '📊 Vue d\'ensemble'}
                        {tab === 'products' && '📦 Produits'}
                        {tab === 'history' && '📈 Historique'}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Products Evolution Chart */}
                    <Card className="p-5 border-slate-800 bg-slate-900/50">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <BarChart3 size={18} className="text-blue-400" />
                            Évolution des produits
                        </h3>
                        <div className="h-[250px]">
                            {chartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                                        <YAxis stroke="#64748b" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                            labelStyle={{ color: '#f1f5f9' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="products"
                                            stroke="#3b82f6"
                                            strokeWidth={2}
                                            fillOpacity={1}
                                            fill="url(#colorProducts)"
                                            name="Produits"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500">
                                    Pas encore de données historiques
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Price Distribution */}
                    <Card className="p-5 border-slate-800 bg-slate-900/50">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <DollarSign size={18} className="text-green-400" />
                            Distribution des prix
                        </h3>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={priceRanges}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="range" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                        labelStyle={{ color: '#f1f5f9' }}
                                    />
                                    <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="Produits" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Categories */}
                    <Card className="p-5 border-slate-800 bg-slate-900/50">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Tag size={18} className="text-purple-400" />
                            Catégories
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {store.categories.length > 0 ? (
                                store.categories.map((cat, i) => (
                                    <span
                                        key={i}
                                        className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 text-sm"
                                    >
                                        {cat}
                                    </span>
                                ))
                            ) : (
                                <span className="text-slate-500">Aucune catégorie détectée</span>
                            )}
                        </div>
                    </Card>

                    {/* Recent Products */}
                    <Card className="p-5 border-slate-800 bg-slate-900/50">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-yellow-400" />
                            Produits récents
                        </h3>
                        {recentProducts.length > 0 ? (
                            <div className="space-y-3">
                                {recentProducts.slice(0, 5).map(product => (
                                    <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                                        <div className="w-10 h-10 rounded bg-slate-700 overflow-hidden flex-shrink-0">
                                            {product.imageUrl && (
                                                <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">{product.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(product.firstSeen).toLocaleDateString('fr-FR')}
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-green-400">{product.price.toFixed(2)}€</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-slate-500">Aucun produit récent</span>
                        )}
                    </Card>
                </div>
            )}

            {activeTab === 'products' && (
                <div>
                    {/* Bestsellers Section */}
                    {bestsellers.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Star className="text-yellow-400" size={20} />
                                Bestsellers Potentiels
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {bestsellers.slice(0, 8).map(product => (
                                    <ProductCard key={product.id} product={product} isBestseller />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Products */}
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Package className="text-blue-400" size={20} />
                        Tous les produits ({store.products.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {store.products.slice(0, 20).map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                    {store.products.length > 20 && (
                        <div className="mt-6 text-center">
                            <p className="text-slate-500">
                                Affichage de 20 produits sur {store.products.length}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <Card className="p-5 border-slate-800 bg-slate-900/50">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Calendar size={18} className="text-blue-400" />
                        Historique des snapshots
                    </h3>
                    {store.snapshots.length > 0 ? (
                        <div className="space-y-3">
                            {store.snapshots.map((snapshot, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-slate-400">
                                            {new Date(snapshot.snapshotDate).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <span className="block text-lg font-bold text-white">{snapshot.totalProducts}</span>
                                            <span className="text-xs text-slate-500">Produits</span>
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-lg font-bold text-white">
                                                {snapshot.avgPrice ? `${snapshot.avgPrice.toFixed(0)}€` : '-'}
                                            </span>
                                            <span className="text-xs text-slate-500">Prix moyen</span>
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-lg font-bold text-green-400">+{snapshot.newProducts}</span>
                                            <span className="text-xs text-slate-500">Nouveaux</span>
                                        </div>
                                        <div className="text-center">
                                            <span className="block text-lg font-bold text-red-400">-{snapshot.removedProducts}</span>
                                            <span className="text-xs text-slate-500">Retirés</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-slate-500">
                            Aucun historique disponible
                        </div>
                    )}
                </Card>
            )}

            {/* Info Footer */}
            <Card className="p-4 border-slate-800 bg-slate-900/30">
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-4">
                        <span>Suivi depuis: {new Date(store.firstSeen).toLocaleDateString('fr-FR')}</span>
                        <span>•</span>
                        <span>Dernière mise à jour: {new Date(store.lastCheck).toLocaleString('fr-FR')}</span>
                    </div>
                    {store.estimatedRevenue && (
                        <span className="text-green-400 font-medium">
                            CA estimé: {store.estimatedRevenue}
                        </span>
                    )}
                </div>
            </Card>
        </div>
    );
}

// Product Card Component
function ProductCard({ product, isBestseller = false }: { product: StoreProduct; isBestseller?: boolean }) {
    return (
        <a
            href={product.productUrl}
            target="_blank"
            rel="noreferrer"
            className="group block bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-all"
        >
            {/* Image */}
            <div className="relative aspect-square bg-slate-800">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="text-slate-600" size={32} />
                    </div>
                )}
                {isBestseller && (
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-yellow-500/90 text-black text-xs font-bold flex items-center gap-1">
                        <Star size={10} /> Bestseller
                    </div>
                )}
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold">
                        -{Math.round((1 - product.price / product.compareAtPrice) * 100)}%
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3">
                <p className="text-sm text-white font-medium line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                    {product.name}
                </p>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-white">{product.price.toFixed(2)}€</span>
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <span className="text-sm text-slate-500 line-through">{product.compareAtPrice.toFixed(2)}€</span>
                    )}
                </div>
                {product.vendor && (
                    <p className="text-xs text-slate-500 mt-1">{product.vendor}</p>
                )}
            </div>
        </a>
    );
}
