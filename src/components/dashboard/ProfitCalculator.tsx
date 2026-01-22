'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calculator, ArrowRight, Loader2, DollarSign, TrendingUp, AlertCircle, Package } from 'lucide-react';
import { getCalculatorData } from '@/lib/aliexpress-actions';

export default function ProfitCalculator() {
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [product, setProduct] = useState<any | null>(null);

    // Calculator State
    const [cpa, setCpa] = useState(15);
    const [shipping, setShipping] = useState(0);
    const [sellingPrice, setSellingPrice] = useState(0);

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setProduct(null);

        try {
            const result = await getCalculatorData(url);
            if (result.error) {
                setError(result.error);
            } else if (result.product) {
                setProduct(result.product);
                // Set default values based on analysis or defaults
                const suggested = result.product.suggestedPrice || (result.product.price * 2.5);
                setSellingPrice(Number(suggested.toFixed(2)));
                setCpa(15); // Default CPA
                setShipping(0); // Default Shipping
            }
        } catch (err) {
            setError("Une erreur est survenue.");
        } finally {
            setIsLoading(false);
        }
    };

    // Derived Calculations
    const buyPrice = product ? product.price : 0;
    const totalCost = buyPrice + cpa + shipping;
    const margin = sellingPrice - totalCost;
    const marginPercent = sellingPrice > 0 ? ((margin / sellingPrice) * 100) : 0;
    const roi = totalCost > 0 ? ((margin / totalCost) * 100) : 0;
    const isProfitable = margin > 0;

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-black text-white tracking-tight flex items-center justify-center gap-3">
                    <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30 backdrop-blur-md">
                        <Calculator className="w-8 h-8 text-blue-400" />
                    </div>
                    Calculatrice de Profit IA
                </h1>
                <p className="text-slate-400">Analysez la rentabilité de n'importe quel produit AliExpress en un clic.</p>
            </div>

            {/* Input Section */}
            <Card className="p-6 border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <form onSubmit={handleAnalyze} className="relative z-10 flex gap-4 flex-col md:flex-row">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Package className="h-5 w-5 text-slate-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Collez le lien AliExpress ici (ex: https://fr.aliexpress.com/item/...)"
                            className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-[58px] px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Analyse...
                            </>
                        ) : (
                            <>
                                Analyser <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </Button>
                </form>

                {error && (
                    <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}
            </Card>

            {/* Results Section */}
            {product && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Visual & Basic Info */}
                    <Card className="lg:col-span-1 p-0 overflow-hidden border border-slate-800/60 bg-slate-900/40 backdrop-blur-md flex flex-col">
                        <div className="relative aspect-square w-full bg-slate-950">
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                            <div className="absolute bottom-4 left-4 right-4">
                                <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/10 mb-2">
                                    Coût Produit: {product.price.toFixed(2)} €
                                </span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-white leading-tight mb-2 line-clamp-2">{product.name}</h3>
                            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-auto flex items-center gap-1">
                                Voir sur AliExpress <ArrowRight size={10} />
                            </a>
                        </div>
                    </Card>

                    {/* Calculator Controls */}
                    <Card className="lg:col-span-2 p-8 border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl relative overflow-hidden">
                        <div className="relative z-10 space-y-8">

                            {/* Sliders */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-bold text-slate-300">Prix de Vente</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={sellingPrice}
                                                onChange={(e) => setSellingPrice(Number(e.target.value))}
                                                className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                                            />
                                            <span className="text-slate-500 font-bold">€</span>
                                        </div>
                                    </div>
                                    <input
                                        type="range"
                                        min={Math.ceil(buyPrice)}
                                        max={Math.ceil(buyPrice * 5)}
                                        step={0.5}
                                        value={sellingPrice}
                                        onChange={(e) => setSellingPrice(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-bold text-slate-300">Budget Pub (CPA)</label>
                                        <span className="text-white font-mono font-bold">{cpa} €</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50"
                                        step={1}
                                        value={cpa}
                                        onChange={(e) => setCpa(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-colors"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <label className="text-sm font-bold text-slate-300">Frais de Livraison</label>
                                        <span className="text-white font-mono font-bold">{shipping} €</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="20"
                                        step={0.5}
                                        value={shipping}
                                        onChange={(e) => setShipping(Number(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Results Display */}
                            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800/50">
                                <div className={`p-4 rounded-xl border ${isProfitable ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'} transition-colors duration-500`}>
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>Profit Net</p>
                                    <p className={`text-3xl font-black ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {margin.toFixed(2)} €
                                    </p>
                                    <p className={`text-xs mt-1 font-medium ${isProfitable ? 'text-emerald-500/70' : 'text-red-500/70'}`}>
                                        {marginPercent.toFixed(0)}% de Marge
                                    </p>
                                </div>

                                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 flex flex-col justify-center">
                                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">R.O.I.</p>
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-black text-white">
                                            {roi.toFixed(1)}x
                                        </p>
                                        <TrendingUp className={`w-4 h-4 ${isProfitable ? 'text-emerald-500' : 'text-red-500'}`} />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-1">Multiplicateur</p>
                                </div>
                            </div>

                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
