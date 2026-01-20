import React from 'react';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { db } from '@/lib/db';
import StoreDetailClient from './StoreDetailClient';

interface Props {
    params: Promise<{ storeId: string }>;
}

export default async function StoreDetailPage({ params }: Props) {
    const { storeId } = await params;

    const session = await auth();

    if (!session?.user?.email) {
        redirect('/fr/login');
    }

    const user = await db.user.findUnique({
        where: { email: session.user.email }
    });

    if (!user) {
        redirect('/fr/login');
    }

    // Get store with full details
    const store = await db.trackedStore.findFirst({
        where: {
            id: storeId,
            userId: user.id
        },
        include: {
            trackedProducts: {
                orderBy: [{ isBestseller: 'desc' }, { price: 'desc' }],
                take: 100
            },
            snapshots: {
                orderBy: { snapshotDate: 'desc' },
                take: 30
            },
            _count: { select: { trackedProducts: true } }
        }
    });

    if (!store) {
        notFound();
    }

    const storeData = {
        id: store.id,
        url: store.url,
        shopName: store.shopName,
        logo: store.logo,
        status: store.status,
        totalProducts: store.totalProducts,
        avgProductPrice: store.avgProductPrice,
        minProductPrice: store.minProductPrice,
        maxProductPrice: store.maxProductPrice,
        estimatedTraffic: store.estimatedTraffic,
        estimatedRevenue: store.estimatedRevenue,
        facebookPixel: store.facebookPixel,
        googleAnalytics: store.googleAnalytics,
        tiktokPixel: store.tiktokPixel,
        categories: store.categories ? JSON.parse(store.categories) : [],
        mainNiche: store.mainNiche,
        lastCheck: store.lastCheck,
        createdAt: store.createdAt,
        firstSeen: store.firstSeen,
        products: store.trackedProducts.map(p => ({
            id: p.id,
            externalId: p.externalId,
            name: p.name,
            price: p.price,
            compareAtPrice: p.compareAtPrice,
            imageUrl: p.imageUrl,
            productUrl: p.productUrl,
            vendor: p.vendor,
            productType: p.productType,
            isBestseller: p.isBestseller,
            firstSeen: p.firstSeen,
            lastSeen: p.lastSeen,
            isActive: p.isActive
        })),
        snapshots: store.snapshots.map(s => ({
            totalProducts: s.totalProducts,
            avgPrice: s.avgPrice,
            newProducts: s.newProducts,
            removedProducts: s.removedProducts,
            snapshotDate: s.snapshotDate
        }))
    };

    return <StoreDetailClient store={storeData} />;
}
