import React from 'react';
import { Star } from 'lucide-react';

const REVIEWS_DATA = [
    { name: "Sophie M.", country: "FR", rating: 5, text: "Produit incroyable, mes ventes ont explosé !", date: "2 jours" },
    { name: "John D.", country: "US", rating: 4, text: "Good quality, fast shipping. Recommended.", date: "5 jours" },
    { name: "Dimitri K.", country: "RU", rating: 5, text: "Отличный товар, спасибо!", date: "1 semaine" },
    { name: "Elena G.", country: "ES", rating: 3, text: "Bien pero el envío tardó un poco más de lo esperado.", date: "2 semaines" },
    { name: "Hans W.", country: "DE", rating: 5, text: "Sehr gut. Top qualität.", date: "3 jours" }
];

export default function ProductReviews() {
  return (
    <div className="mt-8 border-t border-slate-800 pt-6">
        <h3 className="font-bold text-white mb-4">Avis Clients (Simulés)</h3>
        <div className="space-y-4">
            {REVIEWS_DATA.map((review, i) => (
                <div key={i} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-200">{review.name}</span>
                            <span className="text-xs text-slate-500">({review.country})</span>
                        </div>
                        <span className="text-xs text-slate-600">{review.date}</span>
                    </div>
                    <div className="flex text-yellow-500 mb-2">
                        {[...Array(5)].map((_, stars) => (
                            <Star key={stars} size={12} fill={stars < review.rating ? "currentColor" : "none"} className={stars < review.rating ? "" : "text-slate-700"} />
                        ))}
                    </div>
                    <p className="text-sm text-slate-400 italic">"{review.text}"</p>
                </div>
            ))}
        </div>
    </div>
  );
}
