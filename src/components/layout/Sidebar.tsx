'use client';

import React from 'react';
import { TrendingUp, LayoutDashboard, BarChart3, Zap, LogOut, Settings, LayoutTemplate, Store, HelpCircle, FileText, Shield, Sparkles, Calculator, Trophy } from 'lucide-react';
import { Link, usePathname } from '@/i18n/routing';
import { handleSignOut } from '@/lib/auth-actions';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Sidebar = () => {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', label: 'Calculatrice Profit', icon: Calculator },
        { href: '/dashboard/winners', label: 'Produits Gagnants IA', icon: Trophy },
        { href: '/dashboard/sourcing', label: 'Recherche Produits', icon: Sparkles },
        { href: '/dashboard/tracker', label: 'Tracker Boutique', icon: BarChart3 },
        { href: '/dashboard/ads', label: 'Analyse Publicitaire', icon: Zap },
        { href: '/dashboard/shopify', label: 'Mon Shopify', icon: Store },
        { href: '/dashboard/templates', label: 'Templates', icon: LayoutTemplate },
        { href: '/dashboard/settings', label: 'Paramètres', icon: Settings },
    ];

    const footerLinks = [
        { href: '/legal/terms', label: 'Légal', icon: FileText },
        { href: '/legal/privacy', label: 'Confidentialité', icon: Shield },
        { href: 'https://discord.gg/jKgsxvSdRG', label: 'Support / Contact', icon: HelpCircle, external: true },
    ];

    return (
        <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border hidden lg:flex flex-col p-6 z-50 text-foreground">
            <div className="flex items-center justify-between mb-10 px-2 min-h-[40px]">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-primary rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                        <TrendingUp size={20} className="text-primary-foreground" />
                    </div>
                    <span className="text-lg font-black tracking-tight text-foreground">DropTrend</span>
                </Link>
                <ThemeToggle />
            </div>

            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${isActive ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                        >
                            <item.icon size={18} /> {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="pt-6 border-t border-border space-y-4">
                <div className="space-y-1">
                    {footerLinks.map((item) => (
                        item.external ? (
                            <a
                                key={item.label}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <item.icon size={14} /> {item.label}
                            </a>
                        ) : (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg font-medium text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                            >
                                <item.icon size={14} /> {item.label}
                            </Link>
                        )
                    ))}
                </div>

                <form action={handleSignOut}>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg font-medium text-sm transition-colors cursor-pointer">
                        <LogOut size={18} /> Déconnexion
                    </button>
                </form>
            </div>
        </aside>
    );
};
