'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { submitTeamCode } from '@/app/actions/team-access';
import { Button } from '@/components/ui/Button';

export default function TeamAccessModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(formData: FormData) {
        const result = await submitTeamCode(formData);
        if (result?.error) {
            setError(result.error);
        }
    }

    // Very subtle button in the bottom right corner
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 text-slate-800 hover:text-slate-600 dark:text-slate-900 dark:hover:text-slate-800 text-xs transition-colors z-50 opacity-50 hover:opacity-100"
            >
                Team Access
            </button>
        );
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl">
                <h2 className="text-xl font-bold text-white mb-4">Team Access</h2>
                <form action={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-slate-400 mb-1">
                            Secret Code
                        </label>
                        <input
                            type="password"
                            name="code"
                            id="code"
                            placeholder="Enter access code"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            Access Dashboard
                        </Button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
