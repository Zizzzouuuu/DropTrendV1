'use client';

import React, { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { cancelSubscription } from '@/lib/subscription-actions';

export default function SubscriptionSection({ plan, cycle }: { plan: string, cycle: string }) {
  const [state, dispatch] = useActionState(cancelSubscription, null);

  if (plan === 'free') return <p className="text-slate-400">Plan Gratuit actif.</p>;

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <div>
                <p className="text-white font-bold capitalize">{plan}</p>
                <p className="text-sm text-slate-400 capitalize">{cycle}</p>
            </div>
            <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">Actif</span>
        </div>
        
        {cycle === 'monthly' && (
            <form action={dispatch}>
                <Button variant="outline" className="w-full text-red-400 border-red-900/50 hover:bg-red-900/10">
                    Annuler l'abonnement
                </Button>
                {state?.success && <p className="text-green-400 text-xs mt-2">{state.message}</p>}
                {state?.error && <p className="text-red-400 text-xs mt-2">{state.error}</p>}
            </form>
        )}
        {cycle === 'yearly' && (
            <p className="text-xs text-slate-500">Contactez le support pour annuler un plan annuel.</p>
        )}
    </div>
  );
}
