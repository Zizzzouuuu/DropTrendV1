'use client';

import React, { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { register } from '@/lib/actions';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

function RegisterButton() {
    const { pending } = useFormStatus();
    return (
        <Button className="w-full h-12 mt-6" disabled={pending} type="submit">
            {pending ? 'Création...' : 'Créer mon compte'}
        </Button>
    );
}

export default function RegisterPage() {
    const [errorMessage, dispatch] = useActionState(register, undefined);
    const [phoneValue, setPhoneValue] = useState<string | undefined>();

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0f1c] relative overflow-hidden font-sans">
            {/* Modern Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,_var(--tw-gradient-stops))] from-blue-600/10 via-[#0a0f1c] to-[#0a0f1c]"></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-600/5 via-transparent to-transparent blur-3xl"></div>

            <Card className="w-full max-w-md p-8 relative z-10 border border-slate-800/60 bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-blue-900/10">
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-8 group cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                            <TrendingUp className="text-white" size={18} />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">DropTrend</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Créer un compte</h1>
                    <p className="text-slate-400 text-sm">Accédez à la suite d'outils DropTrend.</p>
                </div>

                <form action={dispatch} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nom complet</label>
                        <input
                            name="name"
                            type="text"
                            className="w-full bg-slate-950/50 border border-slate-800/80 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm placeholder:text-slate-600"
                            placeholder="Jean Dupont"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Téléphone</label>
                        <div className="phone-input-dark-theme">
                            <PhoneInput
                                placeholder="Numéro de téléphone"
                                value={phoneValue}
                                onChange={setPhoneValue}
                                defaultCountry="FR"
                                className="flex gap-2"
                                numberInputProps={{
                                    className: "w-full bg-slate-950/50 border border-slate-800/80 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm placeholder:text-slate-600"
                                }}
                            />
                        </div>
                        <input type="hidden" name="phoneNumber" value={phoneValue || ''} />
                        <p className="text-[10px] text-slate-500 px-1">Un numéro unique est requis par compte.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email</label>
                        <input
                            name="email"
                            type="email"
                            className="w-full bg-slate-950/50 border border-slate-800/80 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm placeholder:text-slate-600"
                            placeholder="jean@exemple.com"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mot de passe</label>
                            <span className="text-[10px] text-blue-400/80">12 char. min</span>
                        </div>
                        <input
                            name="password"
                            type="password"
                            className="w-full bg-slate-950/50 border border-slate-800/80 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all text-sm placeholder:text-slate-600"
                            placeholder="••••••••••••"
                            required
                            minLength={12}
                        />
                    </div>

                    <div
                        className="flex min-h-[20px] items-end space-x-1"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {errorMessage && (
                            <div className="flex items-center gap-2 p-3 w-full bg-red-500/10 border border-red-500/20 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                                <p className="text-xs text-red-300 font-medium">{errorMessage}</p>
                            </div>
                        )}
                    </div>

                    <RegisterButton />
                </form>

                <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
                    <p className="text-slate-500 text-xs mb-4">
                        Déjà membre ? <Link href="/login" className="text-white hover:text-blue-400 font-semibold transition-colors">Connexion</Link>
                    </p>
                    <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-xs font-medium transition-colors">
                        <ArrowLeft size={12} /> Retour à l'accueil
                    </Link>
                </div>
            </Card>
        </div>
    );
}
