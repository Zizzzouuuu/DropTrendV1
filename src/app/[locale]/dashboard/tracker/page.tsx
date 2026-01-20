import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import TrackerClient from './TrackerClient';
import { TrackedStoreWithDetails } from '@/lib/tracker-actions';

export default async function TrackerPage() {
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

    // Get tracked stores with details
    const stores = await db.trackedStore.findMany({
        where: { userId: user.id },
        include: {
            _count: { select: { trackedProducts: true } },
            snapshots: {
                orderBy: { snapshotDate: 'desc' },
                take: 2
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    const storesWithDetails: TrackedStoreWithDetails[] = stores.map(store => ({
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
        categories: store.categories,
        mainNiche: store.mainNiche,
        lastCheck: store.lastCheck,
        createdAt: store.createdAt,
        productCount: store._count.trackedProducts,
        recentChanges: {
            newProducts: store.snapshots[0]?.newProducts || 0,
            removedProducts: store.snapshots[0]?.removedProducts || 0
        }
    }));

    return <TrackerClient initialStores={storesWithDetails} />;
}
