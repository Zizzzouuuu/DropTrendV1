'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PlayCircle, ThumbsUp, Share2, Eye } from 'lucide-react';

const MOCK_ADS = [
    { id: 1, title: "Posture Corrector Viral", platform: "TikTok", likes: "125K", shares: "42K", views: "1.2M", thumbnail: "https://images.unsplash.com/photo-1594751414186-fd2f46ed8ee9?auto=format&fit=crop&q=80&w=300" },
    { id: 2, title: "Galaxy Lamp Wow Effect", platform: "Facebook", likes: "45K", shares: "12K", views: "450K", thumbnail: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=300" },
    { id: 3, title: "Cat Brush Satisfaction", platform: "Instagram", likes: "89K", shares: "15K", views: "890K", thumbnail: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=300" },
    { id: 4, title: "BlendJet Competitor", platform: "TikTok", likes: "210K", shares: "65K", views: "2.5M", thumbnail: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=300" },
    { id: 5, title: "Sunset Lamp Aesthetics", platform: "Pinterest", likes: "34K", shares: "8K", views: "340K", thumbnail: "https://images.unsplash.com/photo-1616489953125-c586d60c7f2d?auto=format&fit=crop&q=80&w=300" },
    { id: 6, title: "Jewelry Cleaner ASMR", platform: "TikTok", likes: "1.5M", shares: "200K", views: "15M", thumbnail: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=300" },
    { id: 7, title: "Back Stretcher", platform: "Facebook", likes: "67K", shares: "21K", views: "700K", thumbnail: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=300" },
    { id: 8, title: "Shark Slippers", platform: "TikTok", likes: "450K", shares: "120K", views: "5M", thumbnail: "https://images.unsplash.com/photo-1576426863863-189689a797c2?auto=format&fit=crop&q=80&w=300" },
];

export default function AdsSpyPage() {
  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Ad Spy Tool (Dernières 24h)</h1>
        <p className="text-slate-400">Découvrez les publicités les plus performantes du moment.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_ADS.map(ad => (
                <Card key={ad.id} className="overflow-hidden group hover:border-blue-500/50 transition-colors">
                    <div className="relative h-48 bg-slate-900 cursor-pointer">
                        <img src={ad.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <PlayCircle size={48} className="text-white opacity-80 group-hover:scale-110 transition-transform"/>
                        </div>
                        <Badge className="absolute top-2 right-2" type="info">{ad.platform}</Badge>
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-white mb-2 line-clamp-1">{ad.title}</h3>
                        <div className="grid grid-cols-3 gap-2 text-slate-400 text-xs text-center border-t border-slate-800 pt-3">
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-white">{ad.likes}</span>
                                <span className="text-[10px] uppercase">Likes</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-white">{ad.shares}</span>
                                <span className="text-[10px] uppercase">Shares</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-white">{ad.views}</span>
                                <span className="text-[10px] uppercase">Views</span>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    </div>
  );
}
