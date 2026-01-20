'use client';

import React, { useState, useTransition } from 'react';
import { Star, ShoppingCart, Bookmark, BookmarkCheck, Sparkles, TrendingUp } from 'lucide-react';
import { ProductWithScore, toggleSaveProduct } from '@/lib/aliexpress-actions';

interface ProductCardProps {
    product: ProductWithScore;
    onClick: () => void;
}

export default function ProductCard({ product, onClick }: ProductCardProps) {
    const [isSaved, setIsSaved] = useState(product.isSaved || false);
    const [isPending, startTransition] = useTransition();

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();
        startTransition(async () => {
            const result = await toggleSaveProduct(product.id);
            if (!result.error) {
                setIsSaved(result.saved);
            }
        });
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'from-green-500 to-emerald-600';
        if (score >= 60) return 'from-blue-500 to-cyan-600';
        if (score >= 40) return 'from-yellow-500 to-orange-600';
        return 'from-red-500 to-rose-600';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Winner';
        if (score >= 60) return 'Potentiel';
        if (score >= 40) return 'Risqué';
        return 'Faible';
    };

    const suggestedPrice = (product.price * 3).toFixed(2);
    const profitMargin = Math.round((1 - product.price / parseFloat(suggestedPrice)) * 100);

    return (
        <div
            onClick={onClick}
            className="group relative bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
        >
            {/* Score Badge */}
            <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-gradient-to-r ${getScoreColor(product.quickScore)} text-white text-xs font-bold flex items-center gap-1 shadow-lg`}>
                <Sparkles size={12} />
                {product.quickScore}
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                disabled={isPending}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
            >
                {isSaved ? (
                    <BookmarkCheck size={18} className="text-blue-400" />
                ) : (
                    <Bookmark size={18} />
                )}
            </button>

            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-slate-800">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Quick Stats Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex justify-between text-xs text-white">
                        <span className="flex items-center gap-1">
                            <ShoppingCart size={12} />
                            {product.orders.toLocaleString()} vendus
                        </span>
                        {product.rating && (
                            <span className="flex items-center gap-1">
                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                {product.rating}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Status Tag */}
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${product.quickScore >= 80
                            ? 'bg-green-500/10 text-green-400'
                            : product.quickScore >= 60
                                ? 'bg-blue-500/10 text-blue-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                        {getScoreLabel(product.quickScore)}
                    </span>
                    {product.orders >= 10000 && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 flex items-center gap-1">
                            <TrendingUp size={10} />
                            Trending
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="text-white font-medium text-sm line-clamp-2 mb-3 group-hover:text-blue-400 transition-colors">
                    {product.name}
                </h3>

                {/* Pricing */}
                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-xs text-slate-500 mb-0.5">Coût AliExpress</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-white">{product.price.toFixed(2)}€</span>
                            {product.originalPrice && (
                                <span className="text-sm text-slate-500 line-through">{product.originalPrice.toFixed(2)}€</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500 mb-0.5">Prix suggéré</div>
                        <div className="text-lg font-bold text-green-400">{suggestedPrice}€</div>
                    </div>
                </div>

                {/* Profit Bar */}
                <div className="mt-3 pt-3 border-t border-slate-800">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Marge estimée</span>
                        <span className="text-green-400 font-bold">{profitMargin}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all"
                            style={{ width: `${profitMargin}%` }}
                        />
                    </div>
                </div>

                {/* Shipping */}
                {product.shippingInfo && (
                    <div className="mt-2 text-xs text-slate-500">
                        🚚 {product.shippingInfo}
                    </div>
                )}
            </div>
        </div>
    );
}
