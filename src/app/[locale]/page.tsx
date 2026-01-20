'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Zap, Search, BarChart3, Layers, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col gap-24 pb-20 bg-slate-950 text-slate-200">
        {/* Hero */}
        <section className="pt-32 md:pt-48 px-4 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold mb-8 border border-blue-500/20">
            <Zap size={14} className="fill-current" /> 
            <span>BETA OUVERTE : 10 PLACES RESTANTES</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight leading-[1.1]">
            Trouvez votre prochain <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Winner E-commerce</span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Arrêtez de deviner. Accédez à une base de données de produits analysés manuellement, avec marges réelles, fournisseurs fiables et stratégies publicitaires.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/pricing">
                <Button className="h-14 px-8 text-base">
                Accéder à la plateforme <ArrowRight size={20}/>
                </Button>
            </Link>
            <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                    </div>
                ))}
                <div className="flex flex-col justify-center pl-4 text-left">
                    <span className="text-white text-xs font-bold">+1,200 membres</span>
                    <span className="text-slate-500 text-[10px]">Déjà actifs ce mois-ci</span>
                </div>
            </div>
          </div>
        </section>

        {/* Social Proof / Partners */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16 px-4 opacity-40 grayscale">
            <span className="font-bold text-xl italic text-white">Shopify</span>
            <span className="font-bold text-xl italic text-white">AliExpress</span>
            <span className="font-bold text-xl italic text-white">Meta Ads</span>
            <span className="font-bold text-xl italic text-white">TikTok</span>
        </div>

        {/* How it works */}
        <section className="px-4 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Une méthode qui fonctionne</h2>
            <p className="text-slate-400">Pourquoi perdre des milliers d'euros en tests inutiles ?</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Search />, title: "Analyse experte", desc: "Notre équipe scanne le web pour identifier les tendances avant qu'elles ne saturent." },
              { icon: <BarChart3 />, title: "Données chiffrées", desc: "Coûts, marges, prix suggérés. Tout est calculé pour votre rentabilité." },
              { icon: <Layers />, title: "Import facile", desc: "Exportez les données produits directement pour votre boutique Shopify en un clic." }
            ].map((item, i) => (
              <Card key={i} className="p-8 hover:border-blue-500/50 transition-colors group">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
