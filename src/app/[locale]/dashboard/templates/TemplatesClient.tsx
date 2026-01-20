'use client';

import React, { useState, useTransition } from 'react';
import {
    Download, Eye, Star, Lock, Check, X, ExternalLink,
    Loader2, Palette, Layout, Code, ShoppingBag, Sparkles,
    Filter, Crown
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@/i18n/routing';
import { ShopifyTemplate } from '@/lib/template-data';
import { installTemplate } from '@/lib/template-actions';
import { getTemplatePreviewHtml } from '@/lib/template-utils';

interface TemplatesClientProps {
    templates: (ShopifyTemplate & { isLocked: boolean })[];
    isPro: boolean;
    isShopifyConnected: boolean;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
    basic: { label: 'Basique', color: 'bg-slate-500/10 text-slate-400' },
    tech: { label: 'Tech', color: 'bg-cyan-500/10 text-cyan-400' },
    fashion: { label: 'Mode', color: 'bg-pink-500/10 text-pink-400' },
    beauty: { label: 'Beauté', color: 'bg-rose-500/10 text-rose-400' },
    home: { label: 'Maison', color: 'bg-amber-500/10 text-amber-400' },
    sport: { label: 'Sport', color: 'bg-red-500/10 text-red-400' },
    luxury: { label: 'Luxe', color: 'bg-yellow-500/10 text-yellow-400' },
    hacking: { label: 'Hacking', color: 'bg-green-500/10 text-green-400' }
};

export default function TemplatesClient({ templates, isPro, isShopifyConnected }: TemplatesClientProps) {
    const [selectedTemplate, setSelectedTemplate] = useState<(ShopifyTemplate & { isLocked: boolean }) | null>(null);
    const [previewMode, setPreviewMode] = useState<'details' | 'live'>('details');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [showProOnly, setShowProOnly] = useState(false);
    const [isInstalling, setIsInstalling] = useState(false);
    const [installSuccess, setInstallSuccess] = useState(false);
    const [isPending, startTransition] = useTransition();

    const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

    const filteredTemplates = templates.filter(t => {
        const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
        const matchesPro = !showProOnly || t.isPro;
        return matchesCategory && matchesPro;
    });

    const freeTemplates = templates.filter(t => !t.isPro);
    const proTemplates = templates.filter(t => t.isPro);

    const handleInstall = async (templateId: string) => {
        setIsInstalling(true);
        const result = await installTemplate(templateId);
        setIsInstalling(false);

        if (result.success) {
            setInstallSuccess(true);
            if (result.downloadUrl) {
                // Trigger download
                window.open(result.downloadUrl, '_blank');
            }
            setTimeout(() => setInstallSuccess(false), 3000);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Palette className="text-purple-400" size={28} />
                        Templates Shopify
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {templates.length} thèmes optimisés pour la conversion • {freeTemplates.length} gratuits, {proTemplates.length} PRO
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {!isPro && (
                        <Link href="/pricing">
                            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                                <Crown size={16} className="mr-2" />
                                Débloquer tous les templates
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4 border-slate-800 bg-slate-900/50">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-500" />
                        <span className="text-sm text-slate-400">Catégorie:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${categoryFilter === cat
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                {cat === 'all' ? 'Tous' : CATEGORY_LABELS[cat]?.label || cat}
                            </button>
                        ))}
                    </div>
                    <div className="md:ml-auto">
                        <button
                            onClick={() => setShowProOnly(!showProOnly)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${showProOnly
                                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                                }`}
                        >
                            <Crown size={14} />
                            PRO uniquement
                        </button>
                    </div>
                </div>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Layout size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{templates.length}</div>
                            <div className="text-xs text-slate-500">Templates</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <Check size={20} className="text-green-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{freeTemplates.length}</div>
                            <div className="text-xs text-slate-500">Gratuits</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Crown size={20} className="text-purple-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">{proTemplates.length}</div>
                            <div className="text-xs text-slate-500">PRO</div>
                        </div>
                    </div>
                </Card>
                <Card className="p-4 border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                            <Star size={20} className="text-yellow-400" />
                        </div>
                        <div>
                            <div className="text-xl font-bold text-white">4.8</div>
                            <div className="text-xs text-slate-500">Note moyenne</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template) => (
                    <Card
                        key={template.id}
                        className={`overflow-hidden group hover:border-blue-500/50 transition-all ${template.isLocked ? 'relative' : ''}`}
                    >
                        {/* Locked Overlay */}
                        {template.isLocked && (
                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-6 text-center">
                                <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-full mb-3 shadow-xl">
                                    <Lock size={24} className="text-white" />
                                </div>
                                <h3 className="text-white font-bold mb-1">Template PRO</h3>
                                <p className="text-slate-400 text-sm mb-4">Passez Pro pour accéder à ce template premium</p>
                                <Link href="/pricing">
                                    <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600">
                                        <Crown size={14} className="mr-1" />
                                        Débloquer
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {/* Image */}
                        <div className={`h-48 overflow-hidden relative ${template.isLocked ? 'blur-[2px]' : ''}`}>
                            <img
                                src={template.thumbnail}
                                alt={template.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${CATEGORY_LABELS[template.category]?.color || 'bg-slate-500/10 text-slate-400'}`}>
                                    {CATEGORY_LABELS[template.category]?.label || template.category}
                                </span>
                                {template.isPro && (
                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center gap-1">
                                        <Crown size={10} /> PRO
                                    </span>
                                )}
                            </div>

                            {/* Rating */}
                            <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-yellow-400 flex items-center gap-1">
                                <Star size={10} fill="currentColor" /> {template.rating}
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button size="sm" onClick={() => { setSelectedTemplate(template); setPreviewMode('details'); }}>
                                    <Eye size={16} className="mr-1" /> Aperçu
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className={`p-4 ${template.isLocked ? 'blur-[2px]' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-white">{template.name}</h3>
                                <span className="text-xs text-slate-500">{template.downloads.toLocaleString()} téléchargements</span>
                            </div>
                            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{template.description}</p>

                            {/* Features Preview */}
                            <div className="flex flex-wrap gap-1 mb-4">
                                {template.features.slice(0, 3).map((feature, i) => (
                                    <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                                        {feature}
                                    </span>
                                ))}
                                {template.features.length > 3 && (
                                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-500">
                                        +{template.features.length - 3}
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    className="flex-1"
                                    onClick={() => { setSelectedTemplate(template); setPreviewMode('details'); }}
                                    disabled={template.isLocked}
                                >
                                    <Eye size={16} className="mr-1" /> Détails
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => handleInstall(template.id)}
                                    disabled={template.isLocked}
                                >
                                    <Download size={16} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* No Results */}
            {filteredTemplates.length === 0 && (
                <Card className="p-12 border-slate-800 bg-slate-900/50 text-center">
                    <Layout className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Aucun template trouvé</h3>
                    <p className="text-slate-400">Essayez de modifier vos filtres</p>
                </Card>
            )}

            {/* Template Detail Modal */}
            {selectedTemplate && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    onClick={() => setSelectedTemplate(null)}
                >
                    <div
                        className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-white">{selectedTemplate.name}</h2>
                                {selectedTemplate.isPro && (
                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white flex items-center gap-1">
                                        <Crown size={10} /> PRO
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setPreviewMode('details')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${previewMode === 'details' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                                        }`}
                                >
                                    Détails
                                </button>
                                <button
                                    onClick={() => setPreviewMode('live')}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${previewMode === 'live' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                                        }`}
                                >
                                    Preview Live
                                </button>
                                <button
                                    onClick={() => setSelectedTemplate(null)}
                                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto">
                            {previewMode === 'details' ? (
                                <div className="grid md:grid-cols-2 gap-6 p-6">
                                    {/* Image Gallery */}
                                    <div className="space-y-4">
                                        <div className="aspect-video rounded-xl overflow-hidden bg-slate-800">
                                            <img
                                                src={selectedTemplate.previewImages[0] || selectedTemplate.thumbnail}
                                                alt={selectedTemplate.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {selectedTemplate.previewImages.slice(0, 3).map((img, i) => (
                                                <div key={i} className="aspect-video rounded-lg overflow-hidden bg-slate-800">
                                                    <img src={img} alt="" className="w-full h-full object-cover opacity-70 hover:opacity-100 cursor-pointer transition-opacity" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-6">
                                        <div>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 ${CATEGORY_LABELS[selectedTemplate.category]?.color}`}>
                                                {CATEGORY_LABELS[selectedTemplate.category]?.label}
                                            </span>
                                            <h3 className="text-2xl font-bold text-white mb-2">{selectedTemplate.name}</h3>
                                            <p className="text-slate-400">{selectedTemplate.description}</p>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex gap-6">
                                            <div>
                                                <div className="flex items-center gap-1 text-yellow-400">
                                                    <Star size={16} fill="currentColor" />
                                                    <span className="font-bold">{selectedTemplate.rating}</span>
                                                </div>
                                                <span className="text-xs text-slate-500">Note</span>
                                            </div>
                                            <div>
                                                <div className="font-bold text-white">{selectedTemplate.downloads.toLocaleString()}</div>
                                                <span className="text-xs text-slate-500">Téléchargements</span>
                                            </div>
                                        </div>

                                        {/* Features */}
                                        <div>
                                            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Fonctionnalités</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                {selectedTemplate.features.map((feature, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                                        <Check size={14} className="text-green-400" />
                                                        {feature}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Theme Info */}
                                        <div>
                                            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Personnalisation</h4>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-6 h-6 rounded border border-slate-700"
                                                        style={{ background: selectedTemplate.themeColor }}
                                                    />
                                                    <span className="text-sm text-slate-400">Couleur principale</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-6 h-6 rounded border border-slate-700"
                                                        style={{ background: selectedTemplate.accentColor }}
                                                    />
                                                    <span className="text-sm text-slate-400">Couleur d'accent</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Code size={16} className="text-slate-500" />
                                                    <span className="text-sm text-slate-400">Police: {selectedTemplate.fontFamily}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="space-y-3 pt-4 border-t border-slate-800">
                                            {selectedTemplate.isLocked ? (
                                                <Link href="/pricing" className="block">
                                                    <Button className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600">
                                                        <Crown size={18} className="mr-2" />
                                                        Débloquer avec PRO
                                                    </Button>
                                                </Link>
                                            ) : (
                                                <>
                                                    <Button
                                                        className="w-full h-12"
                                                        onClick={() => handleInstall(selectedTemplate.id)}
                                                        disabled={isInstalling}
                                                    >
                                                        {isInstalling ? (
                                                            <>
                                                                <Loader2 size={18} className="mr-2 animate-spin" />
                                                                Installation...
                                                            </>
                                                        ) : installSuccess ? (
                                                            <>
                                                                <Check size={18} className="mr-2" />
                                                                Téléchargé!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Download size={18} className="mr-2" />
                                                                {isShopifyConnected ? 'Installer sur Shopify' : 'Télécharger le template'}
                                                            </>
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="w-full"
                                                        onClick={() => setPreviewMode('live')}
                                                    >
                                                        <Eye size={18} className="mr-2" />
                                                        Voir la preview live
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* Live Preview */
                                <div className="h-[70vh]">
                                    <iframe
                                        srcDoc={getTemplatePreviewHtml(selectedTemplate)}
                                        className="w-full h-full border-0"
                                        title={`Preview ${selectedTemplate.name}`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
