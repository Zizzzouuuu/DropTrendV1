'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';

export default function ProfitCalculator({ buyPrice, sellPrice }: { buyPrice: number, sellPrice: number }) {
    const [cpa, setCpa] = useState(15); // Cost Per Acquisition (Ads)
    const [price, setPrice] = useState(sellPrice);

    const margin = price - buyPrice - cpa;
    const marginPercent = ((margin / price) * 100).toFixed(1);

    return (
        <Card className="p-4 border-slate-800 bg-slate-900/50">
            <h3 className="font-bold text-white mb-4">Profit Calculator</h3>
            
            <div className="space-y-6">
                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm text-slate-400">Selling Price</span>
                        <span className="text-sm font-bold text-white">{price}€</span>
                    </div>
                    <input 
                        type="range" 
                        min={Math.ceil(buyPrice)} 
                        max={buyPrice * 5} 
                        value={price} 
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div>
                    <div className="flex justify-between mb-2">
                        <span className="text-sm text-slate-400">Ad Cost (CPA)</span>
                        <span className="text-sm font-bold text-white">{cpa}€</span>
                    </div>
                    <input 
                        type="range" 
                        min="0" 
                        max="50" 
                        value={cpa} 
                        onChange={(e) => setCpa(Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div className="pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-end">
                        <span className="text-sm text-slate-400">Net Profit</span>
                        <div className="text-right">
                            <span className={`block text-2xl font-black ${margin > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {margin.toFixed(2)}€
                            </span>
                            <span className={`text-xs font-bold ${margin > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {marginPercent}% Margin
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
