'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2, Send, Rocket, Lock } from 'lucide-react';

export default function ComingSoon() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number }>({ days: 14, hours: 0, minutes: 0, seconds: 0 });

    // Calculate 2 weeks from now (simulated fixed date for consistent countdown)
    // Or just a static countdown of 14 days that decrements
    useEffect(() => {
        // Set target date to 14 days from initial load or a fixed specific launch date
        // For this requirement: "un compteur de 2 semaines qui défile"
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 14);

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance < 0) {
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000)
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');

        try {
            const res = await fetch('/api/waiting-list', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Erreur');

            setStatus('success');
            setMessage(data.message);
            setEmail('');
        } catch (err) {
            setStatus('error');
            setMessage((err as Error).message);
        }
    };

    return (
        <div className="min-h-screen bg-[#050511] flex flex-col items-center justify-center relative overflow-hidden p-4">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-3xl w-full text-center space-y-12">

                {/* Logo / Badge */}
                <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-md mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span className="text-xs font-bold text-slate-300 tracking-wider">LANCEMENT IMMINENT</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-playfair font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-500 mb-6 drop-shadow-2xl">
                        DROPTREND
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        La première plateforme Tout-en-un pour dominer le Dropshipping. <br />
                        <span className="text-blue-400 font-bold">Produits • Analyse • Espionnage</span>
                    </p>
                </div>

                {/* Countdown */}
                <div className="grid grid-cols-4 gap-4 md:gap-8 max-w-2xl mx-auto animate-in fade-in zoom-in duration-700 delay-200">
                    {[
                        { label: 'Jours', value: timeLeft.days },
                        { label: 'Heures', value: timeLeft.hours },
                        { label: 'Minutes', value: timeLeft.minutes },
                        { label: 'Secondes', value: timeLeft.seconds }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl flex items-center justify-center shadow-2xl">
                                <span className="text-2xl md:text-4xl font-bold text-white font-mono">
                                    {String(item.value).padStart(2, '0')}
                                </span>
                            </div>
                            <span className="text-xs md:text-sm text-slate-500 font-bold uppercase tracking-widest mt-3">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Email Capture */}
                <div className="max-w-md mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                    <div className="bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-800 backdrop-blur-sm">
                        <h3 className="text-white font-bold mb-2">Rejoignez la Waiting List</h3>
                        <p className="text-slate-400 text-sm mb-6">Soyez averti dès l'ouverture et recevez un cadeau exclusif.</p>

                        <form onSubmit={handleSubmit} className="relative group">
                            <input
                                type="email"
                                required
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={status === 'loading' || status === 'success'}
                                className="w-full h-14 bg-slate-950 border border-slate-700 rounded-xl px-5 pr-14 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                            />
                            <button
                                type="submit"
                                disabled={status === 'loading' || status === 'success'}
                                className="absolute right-2 top-2 h-10 w-10 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
                            >
                                {status === 'loading' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </form>

                        {message && (
                            <div className={`mt-4 text-sm font-medium p-3 rounded-lg ${status === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                {message}
                            </div>
                        )}
                    </div>
                </div>

            </div>

            <div className="absolute bottom-6 text-slate-600 text-xs text-center w-full">
                &copy; 2026 DropTrend. Tous droits réservés. <Lock size={10} className="inline ml-1 mb-0.5" />
            </div>
        </div>
    );
}
