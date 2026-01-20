'use client';

import React, { useState, useTransition } from 'react';
import {
    ShoppingBag, Zap, Eye, Store, ArrowRight, Loader2, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { enableShopifyDemoMode } from '@/lib/shopify-actions';
import { useRouter } from 'next/navigation';

export default function ShopifyConnectClient() {
    const [shopUrl, setShopUrl] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isDemoLoading, setIsDemoLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleDemoMode = async () => {
        setIsDemoLoading(true);
        setError('');

        const result = await enableShopifyDemoMode();

        if (result.success) {
            router.refresh();
        } else {
            setError(result.error || 'Erreur');
            setIsDemoLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 px-4">
            {/* Logo */}
            <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mb-2">
                <ShoppingBag size={48} className="text-green-500" />
            </div>

            <div>
                <h1 className="text-3xl font-bold text-white mb-3">Connectez votre boutique Shopify</h1>
                <p className="text-slate-400 max-w-md mx-auto">
                    Importez vos produits, synchronisez vos stocks et analysez vos ventes directement depuis DropTrend.
                </p>
            </div>

            {/* Connection Options */}
            <div className="w-full max-w-xl space-y-6">
                {/* Real Connection */}
                <Card className="p-6 border-slate-800 bg-slate-900/50">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Store size={20} className="text-green-400" />
                        Connexion Réelle
                    </h3>
                    <form
                        action="/api/shopify/connect"
                        method="GET"
                        className="space-y-4"
                        onSubmit={() => setIsConnecting(true)}
                    >
                        <div>
                            <input
                                type="text"
                                name="shop"
                                value={shopUrl}
                                onChange={(e) => setShopUrl(e.target.value)}
                                placeholder="mon-magasin.myshopify.com"
                                className="w-full h-12 px-4 rounded-lg border border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                                required
                            />
                            <p className="text-xs text-slate-500 mt-2">
                                Entrez le nom de votre boutique ou l'URL complète
                            </p>
                        </div>
                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-[#95BF47] hover:bg-[#83A83D] text-white font-bold"
                            disabled={isConnecting}
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 size={20} className="mr-2 animate-spin" />
                                    Connexion...
                                </>
                            ) : (
                                <>
                                    Connecter Shopify
                                    <ArrowRight size={20} className="ml-2" />
                                </>
                            )}
                        </Button>
                    </form>
                </Card>

                {/* Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-slate-800"></div>
                    <span className="text-slate-500 text-sm font-medium">OU</span>
                    <div className="flex-1 h-px bg-slate-800"></div>
                </div>

                {/* Demo Mode */}
                <Card className="p-6 border-slate-800 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-500/30">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-blue-500/10">
                            <Zap size={24} className="text-blue-400" />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="text-lg font-bold text-white mb-1">Mode Démo</h3>
                            <p className="text-slate-400 text-sm mb-4">
                                Testez le dashboard Shopify avec des données simulées. Parfait pour découvrir les fonctionnalités avant de connecter votre vraie boutique.
                            </p>
                            <Button
                                onClick={handleDemoMode}
                                disabled={isDemoLoading}
                                className="bg-blue-600 hover:bg-blue-500"
                            >
                                {isDemoLoading ? (
                                    <>
                                        <Loader2 size={18} className="mr-2 animate-spin" />
                                        Activation...
                                    </>
                                ) : (
                                    <>
                                        <Eye size={18} className="mr-2" />
                                        Essayer en mode démo
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </Card>

                {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mt-8">
                {[
                    { icon: '📦', title: 'Import Produits', desc: 'Importez vos winners en 1 clic' },
                    { icon: '📊', title: 'Analytics', desc: 'Suivez vos ventes en temps réel' },
                    { icon: '🔄', title: 'Sync Auto', desc: 'Stocks synchronisés automatiquement' }
                ].map((feature, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-800/50 text-center">
                        <div className="text-2xl mb-2">{feature.icon}</div>
                        <h4 className="font-bold text-white text-sm">{feature.title}</h4>
                        <p className="text-slate-500 text-xs">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
