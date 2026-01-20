'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/routing';
import { Menu, X, TrendingUp } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                    <TrendingUp className="text-white" size={20} />
                </div>
                <span className="font-black text-xl tracking-tighter text-slate-900 dark:text-white uppercase italic">DropTrend</span>
            </Link>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link href="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
                <Link href="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Tarifs</Link>
                <a href="#" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">Ressources</a>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link href="/login" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-sm font-bold transition-colors">Connexion</Link>
            <Link href="/register" className="bg-white dark:bg-slate-100 text-blue-600 px-4 py-2 rounded-full text-sm font-bold hover:bg-slate-100 dark:hover:bg-white transition-colors shadow-lg shadow-white/10">Essai Gratuit</Link>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/dashboard" className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Dashboard</Link>
            <Link href="/pricing" className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Tarifs</Link>
            <Link href="/login" className="text-slate-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium">Connexion</Link>
          </div>
        </div>
      )}
    </nav>
  );
};
