'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
    DollarSign, ShoppingCart, Users, TrendingUp, Package,
    RefreshCw, ExternalLink, AlertTriangle, LogOut, Loader2,
    BarChart3, ArrowUp, ArrowDown, Eye
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getShopifyDashboardData, disconnectShopify, syncProductsToShopify } from '@/lib/shopify-actions';
import { useRouter } from 'next/navigation';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';

interface ShopifyDashboardClientProps {
    isDemo: boolean;
    shopUrl: string;
}

export default function ShopifyDashboardClient({ isDemo, shopUrl }: ShopifyDashboardClientProps) {
    const [data, setData] = useState<Awaited<ReturnType<typeof getShopifyDashboardData>> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [syncResult, setSyncResult] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        const result = await getShopifyDashboardData();
        setData(result);
        setIsLoading(false);
    };

    const handleSync = async () => {
        setIsSyncing(true);
        const result = await syncProductsToShopify();
        setIsSyncing(false);

        if (result.success) {
            setSyncResult(`${result.synced} produits synchronisés!`);
            setTimeout(() => setSyncResult(null), 3000);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('Êtes-vous sûr de vouloir déconnecter Shopify?')) return;

        setIsDisconnecting(true);
        await disconnectShopify();
        router.refresh();
    };

    if (isLoading || !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    const stats = [
        {
            label: 'Chiffre d\'affaires',
            value: `${data.stats.totalSales.toLocaleString('fr-FR')}€`,
            change: '+12.5%',
            positive: true,
            icon: DollarSign,
            color: 'green'
        },
        {
            label: 'Commandes',
            value: data.stats.totalOrders.toString(),
            change: '+8.2%',
            positive: true,
            icon: ShoppingCart,
            color: 'blue'
        },
        {
            label: 'Visiteurs',
            value: data.stats.visitors.toLocaleString('fr-FR'),
            change: '+15.3%',
            positive: true,
            icon: Users,
            color: 'purple'
        },
        {
            label: 'Taux de conversion',
            value: `${data.stats.conversionRate}%`,
            change: '-0.3%',
            positive: false,
            icon: TrendingUp,
            color: 'orange'
        }
    ];

    const colorClasses: Record<string, string> = {
        green: 'bg-green-500/10 text-green-400',
        blue: 'bg-blue-500/10 text-blue-400',
        purple: 'bg-purple-500/10 text-purple-400',
        orange: 'bg-orange-500/10 text-orange-400'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-white">Dashboard Shopify</h1>
                        {isDemo && (
                            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                                <Eye size={12} className="mr-1" /> Mode Démo
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <span>{shopUrl}</span>
                        <a
                            href={`https://${shopUrl}`}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-blue-400 transition-colors"
                        >
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleSync}
                        disabled={isSyncing}
                    >
                        <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
                        <span className="ml-2">{isSyncing ? 'Sync...' : 'Synchroniser'}</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDisconnect}
                        disabled={isDisconnecting}
                        className="text-red-400 hover:text-red-300 hover:border-red-500/50"
                    >
                        {isDisconnecting ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                        <span className="ml-2">Déconnecter</span>
                    </Button>
                </div>
            </div>

            {/* Demo Warning */}
            {isDemo && (
                <Card className="p-4 border-blue-500/30 bg-blue-500/5">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-blue-400 mt-0.5" size={20} />
                        <div>
                            <p className="text-blue-400 font-medium">Mode Démo Actif</p>
                            <p className="text-slate-400 text-sm">
                                Les données affichées sont simulées. Connectez votre vraie boutique pour voir vos statistiques réelles.
                            </p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Sync Success */}
            {syncResult && (
                <Card className="p-4 border-green-500/30 bg-green-500/5">
                    <p className="text-green-400 font-medium">✓ {syncResult}</p>
                </Card>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="p-5 border-slate-800 bg-slate-900/50">
                        <div className="flex items-start justify-between mb-3">
                            <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                                {stat.positive ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                                {stat.change}
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-xs text-slate-500">{stat.label}</div>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <Card className="p-5 border-slate-800 bg-slate-900/50">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <BarChart3 size={18} className="text-blue-400" />
                        Ventes (30 derniers jours)
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.salesChart}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                                <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `${v}€`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                    labelStyle={{ color: '#f1f5f9' }}
                                    formatter={(value: number) => [`${value}€`, 'Ventes']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Orders Chart */}
                <Card className="p-5 border-slate-800 bg-slate-900/50">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <ShoppingCart size={18} className="text-green-400" />
                        Commandes (30 derniers jours)
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.salesChart}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                                <YAxis stroke="#64748b" fontSize={10} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                    labelStyle={{ color: '#f1f5f9' }}
                                />
                                <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} name="Commandes" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card className="p-5 border-slate-800 bg-slate-900/50">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Package size={18} className="text-purple-400" />
                        Commandes Récentes
                    </h3>
                    <div className="space-y-3">
                        {data.recentOrders.map((order, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold text-white">
                                        {order.customer.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{order.customer}</p>
                                        <p className="text-xs text-slate-500">{order.id}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white font-bold">{order.total.toFixed(2)}€</p>
                                    <Badge className={`text-xs ${order.status === 'fulfilled' ? 'bg-green-500/10 text-green-400' :
                                            order.status === 'shipped' ? 'bg-blue-500/10 text-blue-400' :
                                                'bg-yellow-500/10 text-yellow-400'
                                        }`}>
                                        {order.status === 'fulfilled' ? 'Livré' :
                                            order.status === 'shipped' ? 'Expédié' : 'En attente'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Top Products */}
                <Card className="p-5 border-slate-800 bg-slate-900/50">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <TrendingUp size={18} className="text-yellow-400" />
                        Top Produits
                    </h3>
                    <div className="space-y-3">
                        {data.topProducts.map((product, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300">
                                        #{i + 1}
                                    </div>
                                    <p className="text-white font-medium truncate max-w-[180px]">{product.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-green-400 font-bold">{product.sales.toLocaleString('fr-FR')}€</p>
                                    <p className="text-xs text-slate-500">{product.quantity} vendus</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
