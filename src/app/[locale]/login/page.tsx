'use client';

import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { TrendingUp, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { authenticate } from '@/lib/actions';
import { useSearchParams } from 'next/navigation';

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button className="w-full h-12 mt-6" disabled={pending} type="submit">
        {pending ? 'Connexion...' : 'Se connecter'}
    </Button>
  );
}

export default function LoginPage() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered');

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950"></div>
        
        <Card className="w-full max-w-md p-8 relative z-10 border-slate-800 bg-slate-900/80">
            <div className="text-center mb-8">
                <Link href="/" className="inline-flex items-center gap-2 mb-6 group cursor-pointer">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                        <TrendingUp className="text-white" size={18} />
                    </div>
                    <span className="text-xl font-black text-white tracking-tighter uppercase italic">DropTrend</span>
                </Link>
                <h1 className="text-2xl font-bold text-white mb-2">Bon retour parmi nous</h1>
                <p className="text-slate-400 text-sm">Entrez vos identifiants pour accéder au cockpit.</p>
            </div>

            {registered && (
               <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                  Compte créé avec succès. Connectez-vous.
               </div>
            )}

            <form action={dispatch} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Email</label>
                    <input 
                        name="email"
                        type="email" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        placeholder="admin@droptrend.com"
                        required
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Mot de passe</label>
                    <input 
                        name="password"
                        type="password" 
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        placeholder="••••••••"
                        required
                        minLength={6}
                    />
                </div>

                <div 
                    className="flex h-8 items-end space-x-1"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {errorMessage && (
                    <>
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p className="text-sm text-red-500">{errorMessage}</p>
                    </>
                    )}
                </div>

                <LoginButton />
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <p className="text-slate-500 text-xs">
                    Pas encore de compte ? <Link href="/register" className="text-blue-400 hover:text-blue-300 font-bold">Créer un compte</Link>
                </p>
                <Link href="/" className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-400 text-xs font-medium mt-4 transition-colors">
                    <ArrowLeft size={12} /> Retour à l'accueil
                </Link>
            </div>
        </Card>
    </div>
  );
}
