'use client';

import React, { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { updateProfile } from '@/lib/settings-actions';

interface SettingsFormProps {
  user: {
    name: string | null;
    email: string | null;
    language: string;
  };
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [state, dispatch] = useActionState(updateProfile, null);

  return (
    <form action={dispatch} className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nom complet</label>
            <input 
                name="name"
                type="text" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white" 
                defaultValue={user.name || ''} 
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <input 
                type="email" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white opacity-50 cursor-not-allowed" 
                defaultValue={user.email || ''} 
                disabled 
            />
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Langue</label>
            <select 
                name="language"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white"
                defaultValue={user.language}
            >
                <option value="fr">Français</option>
                <option value="en">English</option>
            </select>
        </div>
        <Button type="submit" className="w-full sm:w-auto">Enregistrer</Button>
        {state?.success && <p className="text-green-400 text-sm">{state.message}</p>}
        {state?.error && <p className="text-red-400 text-sm">{state.error}</p>}
    </form>
  );
}
