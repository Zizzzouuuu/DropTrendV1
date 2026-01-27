import { Link } from '@/i18n/routing';
import { Sparkles } from 'lucide-react';

export function UpgradeBanner() {
    return (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-1 mb-8">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>

            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 rounded-lg bg-slate-900/40 p-6 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-400 ring-1 ring-amber-400/50">
                        <Sparkles size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Passez à la vitesse supérieure</h3>
                        <p className="text-blue-100/80">
                            Débloquez l'IA avancée, l'espionnage publicitaire et l'import Shopify illimité.
                        </p>
                    </div>
                </div>

                <Link
                    href="/pricing"
                    className="whitespace-nowrap rounded-lg bg-white px-6 py-2.5 text-sm font-bold text-blue-600 transition-transform hover:scale-105 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-95"
                >
                    Devenir Membre Pro
                </Link>
            </div>
        </div>
    );
}
