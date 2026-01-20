'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { scrapeShopifyStore, detectBestsellers, StoreData } from '@/lib/tracker/store-scraper';

export interface TrackedStoreWithDetails {
  id: string;
  url: string;
  shopName: string | null;
  logo: string | null;
  status: string;
  totalProducts: number;
  avgProductPrice: number | null;
  minProductPrice: number | null;
  maxProductPrice: number | null;
  estimatedTraffic: string | null;
  estimatedRevenue: string | null;
  facebookPixel: boolean;
  googleAnalytics: boolean;
  tiktokPixel: boolean;
  categories: string | null;
  mainNiche: string | null;
  lastCheck: Date;
  createdAt: Date;
  productCount: number;
  recentChanges: {
    newProducts: number;
    removedProducts: number;
  };
}

/**
 * Add a new store to track
 */
export async function addStore(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const url = formData.get('url') as string;
  if (!url) return { error: "URL required" };

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "User not found" };

  // Normalize URL
  const normalizedUrl = url
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '')
    .toLowerCase();

  // Check if already tracking
  const existing = await db.trackedStore.findFirst({
    where: { userId: user.id, url: normalizedUrl }
  });

  if (existing) {
    return { error: "Vous suivez déjà cette boutique" };
  }

  try {
    // Create store with pending status
    const store = await db.trackedStore.create({
      data: {
        userId: user.id,
        url: normalizedUrl,
        status: 'scanning'
      }
    });

    // Start scanning in background
    scanStore(store.id, normalizedUrl).catch(console.error);

    revalidatePath('/[locale]/dashboard/tracker');
    return { success: true, storeId: store.id };
  } catch (error) {
    console.error("Failed to add store:", error);
    return { error: "Failed to add store" };
  }
}

/**
 * Scan/rescan a store
 */
async function scanStore(storeId: string, storeUrl: string) {
  try {
    // Scrape the store
    const storeData = await scrapeShopifyStore(storeUrl);

    if (!storeData) {
      await db.trackedStore.update({
        where: { id: storeId },
        data: { status: 'error' }
      });
      return;
    }

    // Update store with scraped data
    await db.trackedStore.update({
      where: { id: storeId },
      data: {
        status: 'active',
        shopName: storeData.shopName,
        logo: storeData.logo,
        totalProducts: storeData.stats.totalProducts,
        avgProductPrice: storeData.stats.avgPrice,
        minProductPrice: storeData.stats.minPrice,
        maxProductPrice: storeData.stats.maxPrice,
        estimatedTraffic: storeData.estimatedTraffic,
        estimatedRevenue: storeData.estimatedRevenue,
        facebookPixel: storeData.marketing.facebookPixel,
        googleAnalytics: storeData.marketing.googleAnalytics,
        tiktokPixel: storeData.marketing.tiktokPixel,
        categories: JSON.stringify(storeData.stats.categories),
        mainNiche: storeData.stats.mainNiche,
        lastCheck: new Date()
      }
    });

    // Save products
    const bestsellers = detectBestsellers(storeData.products);
    const bestsellerIds = new Set(bestsellers.map(p => p.id));

    for (const product of storeData.products.slice(0, 100)) { // Limit to 100 products
      await db.trackedProduct.upsert({
        where: {
          storeId_externalId: {
            storeId: storeId,
            externalId: product.id
          }
        },
        create: {
          storeId: storeId,
          externalId: product.id,
          name: product.title,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          imageUrl: product.imageUrl,
          productUrl: product.productUrl,
          vendor: product.vendor,
          productType: product.productType,
          isBestseller: bestsellerIds.has(product.id)
        },
        update: {
          name: product.title,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          lastSeen: new Date(),
          isBestseller: bestsellerIds.has(product.id)
        }
      });
    }

    // Create snapshot
    await db.storeSnapshot.create({
      data: {
        storeId: storeId,
        totalProducts: storeData.stats.totalProducts,
        avgPrice: storeData.stats.avgPrice
      }
    });

  } catch (error) {
    console.error("Scan error:", error);
    await db.trackedStore.update({
      where: { id: storeId },
      data: { status: 'error' }
    });
  }
}

/**
 * Refresh a store's data
 */
export async function refreshStore(storeId: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "User not found" };

  const store = await db.trackedStore.findFirst({
    where: { id: storeId, userId: user.id }
  });

  if (!store) return { error: "Store not found" };

  // Update status
  await db.trackedStore.update({
    where: { id: storeId },
    data: { status: 'scanning' }
  });

  // Start scan
  scanStore(storeId, store.url).catch(console.error);
  revalidatePath('/[locale]/dashboard/tracker');

  return { success: true };
}

/**
 * Delete a tracked store
 */
export async function deleteStore(storeId: string, prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "User not found" };

  try {
    const store = await db.trackedStore.findFirst({
      where: { id: storeId, userId: user.id }
    });

    if (!store) return { error: "Store not found or unauthorized" };

    await db.trackedStore.delete({ where: { id: storeId } });
    revalidatePath('/[locale]/dashboard/tracker');
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete store" };
  }
}

/**
 * Get all tracked stores for current user
 */
export async function getTrackedStores(): Promise<{
  stores: TrackedStoreWithDetails[];
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.email) return { stores: [], error: "Not authenticated" };

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { stores: [], error: "User not found" };

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

  return {
    stores: stores.map(store => ({
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
    }))
  };
}

/**
 * Get detailed store analytics
 */
export async function getStoreDetails(storeId: string): Promise<{
  store?: TrackedStoreWithDetails & {
    products: Array<{
      id: string;
      name: string;
      price: number;
      compareAtPrice: number | null;
      imageUrl: string | null;
      productUrl: string;
      isBestseller: boolean;
      firstSeen: Date;
      lastSeen: Date;
    }>;
    snapshots: Array<{
      totalProducts: number;
      avgPrice: number | null;
      snapshotDate: Date;
    }>;
  };
  error?: string;
}> {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "User not found" };

  const store = await db.trackedStore.findFirst({
    where: { id: storeId, userId: user.id },
    include: {
      trackedProducts: {
        orderBy: [{ isBestseller: 'desc' }, { price: 'desc' }],
        take: 50
      },
      snapshots: {
        orderBy: { snapshotDate: 'desc' },
        take: 30
      },
      _count: { select: { trackedProducts: true } }
    }
  });

  if (!store) return { error: "Store not found" };

  return {
    store: {
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
      },
      products: store.trackedProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        imageUrl: p.imageUrl,
        productUrl: p.productUrl,
        isBestseller: p.isBestseller,
        firstSeen: p.firstSeen,
        lastSeen: p.lastSeen
      })),
      snapshots: store.snapshots.map(s => ({
        totalProducts: s.totalProducts,
        avgPrice: s.avgPrice,
        snapshotDate: s.snapshotDate
      }))
    }
  };
}
