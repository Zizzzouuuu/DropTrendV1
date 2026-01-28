'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    TrendingUp, Calculator, Package, Store,
    ArrowRight, Trophy, Zap, Search, Eye
} from 'lucide-react';
import { Link } from '@/i18n/routing';

interface DashboardOverviewProps {
    userName: string;
    isPro: boolean;
}

export default function DashboardOverview({ userName, isPro }: DashboardOverviewProps) {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Bonjour, {userName.split(' ')[0]} 👋
                    </h1>
                    <p className="text-slate-400">
                        Voici votre aperçu DropTrend pour aujourd'hui.
                    </p>
                </div>
                {!isPro && (
                    <Link href="/pricing">
                        <Button className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/20">
                            <Zap size={18} className="mr-2" />
                            Passer PRO
                        </Button>
                    </Link>
                )}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/dashboard/winners" className="group">
                    <Card className="p-4 h-full border-slate-800 bg-slate-900/50 hover:border-blue-500/50 transition-all group-hover:shadow-lg group-hover:shadow-blue-500/10">
                        <div className="p-3 rounded-xl bg-blue-500/10 w-fit mb-4 group-hover:bg-blue-500/20 transition-colors">
                            <Trophy className="text-blue-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Produits Gagnants</h3>
                        <p className="text-sm text-slate-400">Voir les tendances du jour</p>
                    </Card>
                </Link>

                <Link href="/dashboard/sourcing" className="group">
                    <Card className="p-4 h-full border-slate-800 bg-slate-900/50 hover:border-purple-500/50 transition-all group-hover:shadow-lg group-hover:shadow-purple-500/10">
                        <div className="p-3 rounded-xl bg-purple-500/10 w-fit mb-4 group-hover:bg-purple-500/20 transition-colors">
                            <Search className="text-purple-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Recherche IA</h3>
                        <p className="text-sm text-slate-400">Analyser un produit ou une niche</p>
                    </Card>
                </Link>

                <Link href="/dashboard/calculator" className="group">
                    <Card className="p-4 h-full border-slate-800 bg-slate-900/50 hover:border-emerald-500/50 transition-all group-hover:shadow-lg group-hover:shadow-emerald-500/10">
                        <div className="p-3 rounded-xl bg-emerald-500/10 w-fit mb-4 group-hover:bg-emerald-500/20 transition-colors">
                            <Calculator className="text-emerald-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Calculatrice</h3>
                        <p className="text-sm text-slate-400">Estimer vos profits nets</p>
                    </Card>
                </Link>

                <Link href="/dashboard/shopify" className="group">
                    <Card className="p-4 h-full border-slate-800 bg-slate-900/50 hover:border-orange-500/50 transition-all group-hover:shadow-lg group-hover:shadow-orange-500/10">
                        <div className="p-3 rounded-xl bg-orange-500/10 w-fit mb-4 group-hover:bg-orange-500/20 transition-colors">
                            <Store className="text-orange-400" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Mon Shopify</h3>
                        <p className="text-sm text-slate-400">Gérer vos imports</p>
                    </Card>
                </Link>
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Quick Search & Feature Highlight */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Search Bar Shortcut */}
                    <Card className="p-6 border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800/80">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Search className="text-blue-400" size={20} />
                            Recherche Rapide
                        </h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Collez un lien AliExpress ou tapez un mot-clé..."
                                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <Link href="/dashboard/sourcing">
                                <Button className="h-full px-6 bg-blue-600 hover:bg-blue-700">
                                    Analyser
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    {/* Stats / Graph Placeholder */}
                    <Card className="p-6 border-slate-800 bg-slate-900/50">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <TrendingUp className="text-green-400" size={20} />
                                Performance de la semaine
                            </h3>
                            <select className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1 text-sm text-slate-400">
                                <option>Derniers 7 jours</option>
                            </select>
                        </div>

                        <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
                            <div className="text-center">
                                <p className="text-slate-500 mb-2">Connectez votre boutique pour voir vos stats</p>
                                <Link href="/dashboard/shopify">
                                    <Button size="sm" variant="outline">Connecter Shopify</Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Winner of the Day Teaser */}
                <div className="space-y-6">
                    <Card className="p-6 border-yellow-500/20 bg-gradient-to-b from-slate-900 to-yellow-900/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-50">
                            <Trophy size={100} className="text-yellow-500/10 rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-bold mb-4">
                                <Zap size={12} fill="currentColor" />
                                WINNER DU JOUR
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">
                                Découvrez le produit viral du moment
                            </h3>

                            <p className="text-slate-400 text-sm mb-6">
                                Analysé par notre IA avec un score de potentiel élevé. Ne ratez pas cette opportunité.
                            </p>

                            <Link href="/dashboard/winners">
                                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold group-hover:shadow-lg group-hover:shadow-yellow-500/20 transition-all">
                                    Voir le Winner <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>
                    </Card>

                    <Card className="p-6 border-slate-800 bg-slate-900/50">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">
                            Nouveautés DropTrend
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-3 items-start">
                                <div className="w-2 h-2 mt-2 rounded-full bg-green-500 shrink-0" />
                                <div>
                                    <p className="text-sm text-white font-medium">Nouveaux Templates ajoutés</p>
                                    <p className="text-xs text-slate-500">3 thèmes premium disponibles</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start">
                                <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
                                <div>
                                    <p className="text-sm text-white font-medium">IA Sourcing améliorée</p>
                                    <p className="text-xs text-slate-500">Algorithme de détection plus précis</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
