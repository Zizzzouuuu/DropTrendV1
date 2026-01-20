'use client';

import React, { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { addStore } from '@/lib/tracker-actions';

export default function TrackerForm() {
  const [state, dispatch] = useActionState(addStore, null);

  return (
    <form action={dispatch} className="flex gap-4">
        <div className="flex-1">
            <input 
                name="url"
                type="text" 
                placeholder="Enter Shopify Store URL (e.g., mystore.com)" 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white"
                required
            />
            {state?.error && <p className="text-red-400 text-xs mt-1">{state.error}</p>}
        </div>
        <Button type="submit"><Plus size={18} className="mr-2"/> Track Store</Button>
    </form>
  );
}
