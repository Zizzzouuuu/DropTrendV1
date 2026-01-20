'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Dashboard Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center">
                <AlertTriangle size={48} className="text-red-500" />
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                    Une erreur est survenue
                </h2>
                <p className="text-slate-400 max-w-md">
                    Nous n'avons pas pu charger le dashboard. Veuillez réessayer ou contacter le support si le problème persiste.
                </p>
                {error.digest && (
                    <p className="text-xs text-slate-600 font-mono">
                        Code: {error.digest}
                    </p>
                )}
            </div>

            <Button onClick={reset} className="gap-2">
                <RefreshCw size={18} />
                Réessayer
            </Button>
        </div>
    );
}
