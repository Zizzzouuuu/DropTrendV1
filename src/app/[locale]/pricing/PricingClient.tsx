'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, ChevronRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useRouter } from 'next/navigation';

interface PricingClientProps {
    user: {
        id: string;
        phoneNumber: string | null;
        subscription: string;
    } | null;
}

export default function PricingClient({ user }: PricingClientProps) {
    console.log('[PricingClient] Received User Prop:', user);
    const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');
    const router = useRouter();

    const monthlyPrice = 29;
    const yearlyPrice = 29 * 12 * 0.7; // 30% discount
    const yearlyPricePerMonth = yearlyPrice / 12;

    const handleUpgrade = async () => {
        if (!user) {
            router.push('/fr/login');
            return;
        }

        if (!user.phoneNumber) {
            if (confirm("Pour accéder aux fonctionnalités Pro et à l'import Shopify, nous devons vérifier votre numéro de téléphone.\n\nCliquez sur OK pour le vérifier maintenant.")) {
                router.push('/fr/dashboard/settings?verify=true');
            }
            return;
        }

        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: 'pro', interval: billingInterval }),
            });
            const data = await res.json();
            if (data.url) window.location.href = data.url;
            else alert('Erreur lors de la création du paiement.');
        } catch (e) {
            alert('Erreur réseau.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Navbar />

            <main className="pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Investissez dans votre réussite</h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Un seul outil pour remplacer toutes vos dépenses inutiles. Rentabilisé en une seule vente.
                    </p>

                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={`text-sm font-bold ${billingInterval === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Mensuel</span>
                        <button
                            onClick={() => setBillingInterval(billingInterval === 'monthly' ? 'yearly' : 'monthly')}
                            className="w-14 h-8 bg-slate-800 rounded-full relative transition-colors"
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-blue-600 rounded-full transition-all ${billingInterval === 'yearly' ? 'left-7' : 'left-1'}`}></div>
                        </button>
                        <span className={`text-sm font-bold ${billingInterval === 'yearly' ? 'text-white' : 'text-slate-500'}`}>Annuel <span className="text-emerald-400">(-30%)</span></span>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                    {/* Starter Plan */}
                    <Card className="p-8 border-slate-800 bg-slate-900/50 hover:border-slate-700 transition-colors relative">
                        <h3 className="text-xl font-bold text-white mb-2">Starter (Free)</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-white">0€</span>
                            <span className="text-slate-500">/mois</span>
                        </div>
                        <p className="text-slate-400 mb-8">Pour découvrir la plateforme et voir quelques produits.</p>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-slate-300">
                                <CheckCircle size={18} className="text-blue-500" /> 3 Produits gagnants / jour
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <CheckCircle size={18} className="text-blue-500" /> Analyse basique
                            </li>
                            <li className="flex items-center gap-3 text-slate-500">
                                <CheckCircle size={18} className="text-slate-700" /> Pas d'outils spy
                            </li>
                        </ul>

                        <Link href="/login">
                            <Button variant="outline" className="w-full">Commencer gratuitement</Button>
                        </Link>
                    </Card>

                    {/* Pro Plan */}
                    <Card className="p-8 border-blue-600/50 bg-blue-900/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">Populaire</div>
                        <h3 className="text-xl font-bold text-white mb-2">Pro {billingInterval === 'yearly' ? 'Yearly' : ''}</h3>
                        <div className="mb-6">
                            <span className="text-4xl font-black text-white">{billingInterval === 'yearly' ? yearlyPrice.toFixed(0) + '€' : monthlyPrice + '€'}</span>
                            <span className="text-slate-500">/{billingInterval === 'yearly' ? 'an' : 'mois'}</span>
                            {billingInterval === 'yearly' && <p className="text-emerald-400 text-xs mt-1">Soit {yearlyPricePerMonth.toFixed(2)}€/mois</p>}
                        </div>
                        <p className="text-blue-200 mb-8">Accès illimité à tous les outils et produits gagnants.</p>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-white">
                                <CheckCircle size={18} className="text-blue-400" /> Accès illimité aux produits
                            </li>
                            <li className="flex items-center gap-3 text-white">
                                <CheckCircle size={18} className="text-blue-400" /> Spy Ads & Tracker boutique
                            </li>
                            <li className="flex items-center gap-3 text-white">
                                <CheckCircle size={18} className="text-blue-400" /> Connexion Shopify & Import
                            </li>
                            <li className="flex items-center gap-3 text-white">
                                <CheckCircle size={18} className="text-blue-400" /> Templates premium
                            </li>
                        </ul>

                        <div className="space-y-3">
                            <Button
                                onClick={handleUpgrade}
                                className="w-full bg-blue-600 hover:bg-blue-500 border-none h-12 text-lg font-semibold"
                            >
                                Devenir Membre Pro
                            </Button>

                            {!user?.phoneNumber && (
                                <p className="text-xs text-center text-blue-300/70 flex items-center justify-center gap-1">
                                    <ShieldCheck size={12} />
                                    Vérification mobile requise
                                </p>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="max-w-3xl mx-auto mt-20 text-center">
                    <div className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-full border border-slate-800 mb-6">
                        <ShieldCheck size={16} className="text-emerald-500" />
                        <span className="text-sm font-medium text-slate-300">Garantie satisfait ou remboursé 14 jours</span>
                    </div>
                    <p className="text-slate-500 text-sm">Paiement sécurisé via Stripe. Annulation possible à tout moment.</p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
