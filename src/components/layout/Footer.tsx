import React from 'react';
import { Link } from '@/i18n/routing';
import { TrendingUp, Zap, Layers, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-900 py-16 px-6 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="text-white" size={18} />
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter uppercase italic">DropTrend</span>
                </div>
                <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                    L'intelligence artificielle et l'expertise humaine au service de votre rentabilité e-commerce. Rejoignez l'élite des dropshippers.
                </p>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors cursor-pointer border border-slate-800">
                        <Zap size={18} />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 hover:text-blue-400 transition-colors cursor-pointer border border-slate-800">
                        <Layers size={18} />
                    </div>
                </div>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Plateforme</h4>
                <ul className="space-y-3 text-slate-500 text-sm font-medium">
                    <li className="hover:text-blue-400 transition-colors cursor-pointer">Base Winners</li>
                    <li className="hover:text-blue-400 transition-colors cursor-pointer">Recherche Niche</li>
                    <li className="hover:text-blue-400 transition-colors cursor-pointer">Analyse Publicitaire</li>
                </ul>
            </div>
            <div>
                <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Légal</h4>
                <ul className="space-y-3 text-slate-500 text-sm font-medium">
                    <li className="hover:text-blue-400 transition-colors cursor-pointer">Conditions</li>
                    <li className="hover:text-blue-400 transition-colors cursor-pointer">Confidentialité</li>
                    <li className="hover:text-blue-400 transition-colors cursor-pointer">Contact</li>
                </ul>
            </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-600 text-xs font-medium uppercase tracking-widest">
            <span>© {new Date().getFullYear()} DropTrend Inc. - TOUS DROITS RÉSERVÉS</span>
            <span className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-blue-500" />
                Paiement 100% sécurisé
            </span>
        </div>
    </footer>
  );
};
