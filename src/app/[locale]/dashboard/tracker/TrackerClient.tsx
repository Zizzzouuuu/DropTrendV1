'use client';

import React, { useState, useTransition, useActionState } from 'react';
import {
    Plus, ExternalLink, RefreshCw, Trash2, Store, Package,
    TrendingUp, DollarSign, Eye, BarChart3, Loader2,
    Facebook, Activity, Music2, CheckCircle2, AlertCircle, Clock
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { addStore, deleteStore, refreshStore, TrackedStoreWithDetails } from '@/lib/tracker-actions';
import Link from 'next/link';

interface TrackerClientProps {
    initialStores: TrackedStoreWithDetails[];
}

export default function TrackerClient({ initialStores }: TrackerClientProps) {
    const [stores, setStores] = useState(initialStores);
    const [showAddForm, setShowAddForm] = useState(false);
    const [addState, addAction, isAddPending] = useActionState(addStore, null);
    const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());

    const handleRefresh = async (storeId: string) => {
        setRefreshingIds(prev => new Set(prev).add(storeId));
        await refreshStore(storeId);
        // Update local state
        setStores(prev => prev.map(s =>
            s.id === storeId ? { ...s, status: 'scanning' } : s
        ));
        setTimeout(() => {
            setRefreshingIds(prev => {
                const next = new Set(prev);
                next.delete(storeId);
                return next;
            });
        }, 3000);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                        <CheckCircle2 size={12} /> Actif
                    </span>
                );
            case 'scanning':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                        <Loader2 size={12} className="animate-spin" /> Scan...
                    </span>
                );
            case 'error':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-xs font-medium">
                        <AlertCircle size={12} /> Erreur
                    </span>
                );
            default:
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
                        <Clock size={12} /> En attente
                    </span>
                );
        }
    };

    const getTrafficBadge = (traffic: string | null) => {
        const colors: Record<string, string> = {
            'very_high': 'bg-purple-500/10 text-purple-400',
            'high': 'bg-green-500/10 text-green-400',
            'medium': 'bg-yellow-500/10 text-yellow-400',
            'low': 'bg-slate-500/10 text-slate-400'
        };
        const labels: Record<string, string> = {
            'very_high': 'Très élevé',
            'high': 'Élevé',
            'medium': 'Moyen',
            'low': 'Faible'
        };
        const color = colors[traffic || 'low'] || colors.low;
        const label = labels[traffic || 'low'] || 'Inconnu';

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
                {label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Eye className="text-blue-400" size={28} />
                        Tracker de Boutiques
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Surveillez vos concurrents et analysez leurs stratégies
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                    <Plus size={18} />
                    <span className="ml-2">Ajouter une boutique</span>
                </Button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <Card className="p-6 border-slate-800 bg-slate-900/50 border-l-4 border-l-blue-500">
                    <form action={addAction} className="space-y-4">
                        <div>
                            <label className="text-sm text-slate-400 mb-2 block">URL de la boutique Shopify</label>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    name="url"
                                    placeholder="exemple.myshopify.com ou exemple.com"
                                    className="flex-1 h-12 px-4 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    required
                                />
                                <Button type="submit" disabled={isAddPending} className="h-12 px-6">
                                    {isAddPending ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <Plus size={18} />
                                            <span className="ml-2">Ajouter</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                            {addState?.error && (
                                <p className="text-red-400 text-sm mt-2">{addState.error}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-2">
                                💡 Entrez l'URL d'une boutique Shopify pour commencer à la suivre
                            </p>
                        </div>
                    </form>
                </Card>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Store size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{stores.length}</div>
                            <div className="text-xs text-slate-500">Boutiques suivies</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <Package size={20} className="text-green-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">
                                {stores.reduce((sum, s) => sum + s.totalProducts, 0).toLocaleString()}
                            </div>
                            <div className="text-xs text-slate-500">Produits trackés</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <TrendingUp size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">
                                {stores.filter(s => s.status === 'active').length}
                            </div>
                            <div className="text-xs text-slate-500">Actives</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                            <BarChart3 size={20} className="text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">
                                {stores.reduce((sum, s) => sum + s.recentChanges.newProducts, 0)}
                            </div>
                            <div className="text-xs text-slate-500">Nouveaux produits</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Stores List */}
            {stores.length === 0 ? (
                <Card className="p-12 border-slate-800 bg-slate-900/50 text-center">
                    <Store className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Aucune boutique suivie</h3>
                    <p className="text-slate-400 mb-4">Ajoutez une boutique concurrente pour commencer l'analyse</p>
                    <Button onClick={() => setShowAddForm(true)}>
                        <Plus size={18} className="mr-2" />
                        Ajouter ma première boutique
                    </Button>
                </Card>
            ) : (
                <div className="space-y-4">
                    {stores.map(store => (
                        <StoreCard
                            key={store.id}
                            store={store}
                            onRefresh={() => handleRefresh(store.id)}
                            isRefreshing={refreshingIds.has(store.id)}
                            getStatusBadge={getStatusBadge}
                            getTrafficBadge={getTrafficBadge}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

interface StoreCardProps {
    store: TrackedStoreWithDetails;
    onRefresh: () => void;
    isRefreshing: boolean;
    getStatusBadge: (status: string) => React.ReactNode;
    getTrafficBadge: (traffic: string | null) => React.ReactNode;
}

function StoreCard({ store, onRefresh, isRefreshing, getStatusBadge, getTrafficBadge }: StoreCardProps) {
    const [deleteState, deleteAction, isDeleting] = useActionState(
        deleteStore.bind(null, store.id),
        null
    );

    return (
        <Card className="p-5 border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Store Info */}
                <div className="flex items-center gap-4 flex-1">
                    {/* Logo */}
                    <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0">
                        {store.logo ? (
                            <img src={store.logo} alt={store.shopName || ''} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Store className="text-slate-600" size={24} />
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-bold truncate">
                                {store.shopName || store.url}
                            </h3>
                            <a
                                href={`https://${store.url}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-500 hover:text-blue-400 transition-colors"
                            >
                                <ExternalLink size={14} />
                            </a>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {getStatusBadge(store.status)}
                            {store.mainNiche && (
                                <span className="px-2 py-1 rounded-full bg-slate-800 text-slate-400 text-xs">
                                    {store.mainNiche}
                                </span>
                            )}
                            {getTrafficBadge(store.estimatedTraffic)}
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">{store.totalProducts}</div>
                        <div className="text-[10px] text-slate-500 uppercase">Produits</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-white">
                            {store.avgProductPrice ? `${store.avgProductPrice.toFixed(0)}€` : '-'}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">Prix moyen</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-green-400">
                            +{store.recentChanges.newProducts}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">Nouveaux</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xl font-bold text-red-400">
                            -{store.recentChanges.removedProducts}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase">Retirés</div>
                    </div>
                </div>

                {/* Marketing Pixels */}
                <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${store.facebookPixel ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-600'}`} title="Facebook Pixel">
                        <Facebook size={16} />
                    </div>
                    <div className={`p-2 rounded-lg ${store.googleAnalytics ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-600'}`} title="Google Analytics">
                        <Activity size={16} />
                    </div>
                    <div className={`p-2 rounded-lg ${store.tiktokPixel ? 'bg-pink-500/10 text-pink-400' : 'bg-slate-800 text-slate-600'}`} title="TikTok Pixel">
                        <Music2 size={16} />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <Link href={`/fr/dashboard/tracker/${store.id}`}>
                        <Button variant="outline" size="sm" className="h-9">
                            <BarChart3 size={16} />
                            <span className="ml-1.5 hidden sm:inline">Détails</span>
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={onRefresh}
                        disabled={isRefreshing || store.status === 'scanning'}
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                    </Button>
                    <form action={deleteAction}>
                        <Button
                            type="submit"
                            variant="outline"
                            size="sm"
                            className="h-9 text-red-400 hover:text-red-300 hover:border-red-500/50"
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </Button>
                    </form>
                </div>
            </div>

            {/* Last Check */}
            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span>Dernière vérification: {store.lastCheck.toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</span>
                {store.estimatedRevenue && (
                    <span className="flex items-center gap-1 text-green-400">
                        <DollarSign size={12} />
                        CA estimé: {store.estimatedRevenue}
                    </span>
                )}
            </div>
        </Card>
    );
}
