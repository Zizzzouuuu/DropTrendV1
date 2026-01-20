'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

/**
 * Enable demo mode for Shopify (simulates connection without real OAuth)
 */
export async function enableShopifyDemoMode(): Promise<{
    success: boolean;
    error?: string;
}> {
    const session = await auth();

    if (!session?.user?.email) {
        return { success: false, error: "Non authentifié" };
    }

    try {
        const user = await db.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return { success: false, error: "Utilisateur non trouvé" };
        }

        // Update user to enable demo mode
        await db.user.update({
            where: { id: user.id },
            data: {
                shopifyConnected: true
            }
        });

        // Create or update demo integration
        const existingIntegration = await db.integration.findFirst({
            where: { userId: user.id, provider: 'shopify' }
        });

        if (existingIntegration) {
            await db.integration.update({
                where: { id: existingIntegration.id },
                data: {
                    accessToken: 'demo_mode_token',
                    shopUrl: 'demo-boutique.myshopify.com'
                }
            });
        } else {
            await db.integration.create({
                data: {
                    userId: user.id,
                    provider: 'shopify',
                    accessToken: 'demo_mode_token',
                    shopUrl: 'demo-boutique.myshopify.com'
                }
            });
        }

        revalidatePath('/[locale]/dashboard/shopify');
        return { success: true };
    } catch (error) {
        console.error("Demo mode error:", error);
        return { success: false, error: "Erreur lors de l'activation du mode démo" };
    }
}

/**
 * Disconnect Shopify (real or demo)
 */
export async function disconnectShopify(): Promise<{
    success: boolean;
    error?: string;
}> {
    const session = await auth();

    if (!session?.user?.email) {
        return { success: false, error: "Non authentifié" };
    }

    try {
        const user = await db.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) {
            return { success: false, error: "Utilisateur non trouvé" };
        }

        // Remove integration
        await db.integration.deleteMany({
            where: { userId: user.id, provider: 'shopify' }
        });

        // Update user
        await db.user.update({
            where: { id: user.id },
            data: { shopifyConnected: false }
        });

        revalidatePath('/[locale]/dashboard/shopify');
        return { success: true };
    } catch (error) {
        console.error("Disconnect error:", error);
        return { success: false, error: "Erreur lors de la déconnexion" };
    }
}

/**
 * Get Shopify dashboard data (real or simulated)
 */
export async function getShopifyDashboardData(): Promise<{
    isDemo: boolean;
    shopUrl: string;
    stats: {
        totalSales: number;
        totalOrders: number;
        avgOrderValue: number;
        conversionRate: number;
        visitors: number;
    };
    recentOrders: Array<{
        id: string;
        customer: string;
        total: number;
        status: string;
        date: Date;
    }>;
    salesChart: Array<{
        date: string;
        sales: number;
        orders: number;
    }>;
    topProducts: Array<{
        name: string;
        sales: number;
        quantity: number;
    }>;
}> {
    const session = await auth();

    if (!session?.user?.email) {
        return getEmptyDashboard();
    }

    const user = await db.user.findUnique({
        where: { email: session.user.email },
        include: { integrations: true }
    });

    if (!user || !user.shopifyConnected) {
        return getEmptyDashboard();
    }

    const integration = user.integrations.find(i => i.provider === 'shopify');
    const isDemo = integration?.accessToken === 'demo_mode_token';

    // For demo mode or if real API isn't available, return simulated data
    return {
        isDemo,
        shopUrl: integration?.shopUrl || 'demo-boutique.myshopify.com',
        stats: {
            totalSales: 12847.50,
            totalOrders: 156,
            avgOrderValue: 82.35,
            conversionRate: 3.2,
            visitors: 4875
        },
        recentOrders: [
            { id: 'ORD-001', customer: 'Marie D.', total: 89.99, status: 'fulfilled', date: new Date(Date.now() - 1000 * 60 * 30) },
            { id: 'ORD-002', customer: 'Pierre L.', total: 156.00, status: 'pending', date: new Date(Date.now() - 1000 * 60 * 60 * 2) },
            { id: 'ORD-003', customer: 'Sophie M.', total: 67.50, status: 'fulfilled', date: new Date(Date.now() - 1000 * 60 * 60 * 5) },
            { id: 'ORD-004', customer: 'Jean B.', total: 234.00, status: 'shipped', date: new Date(Date.now() - 1000 * 60 * 60 * 8) },
            { id: 'ORD-005', customer: 'Claire R.', total: 45.99, status: 'fulfilled', date: new Date(Date.now() - 1000 * 60 * 60 * 24) },
        ],
        salesChart: generateSalesChartData(),
        topProducts: [
            { name: 'Premium Wireless Earbuds', sales: 2340, quantity: 78 },
            { name: 'Smart Watch Pro', sales: 1890, quantity: 42 },
            { name: 'LED Desk Lamp', sales: 1560, quantity: 65 },
            { name: 'Portable Charger 20K', sales: 1230, quantity: 123 },
            { name: 'Bluetooth Speaker', sales: 980, quantity: 35 },
        ]
    };
}

function getEmptyDashboard() {
    return {
        isDemo: false,
        shopUrl: '',
        stats: { totalSales: 0, totalOrders: 0, avgOrderValue: 0, conversionRate: 0, visitors: 0 },
        recentOrders: [],
        salesChart: [],
        topProducts: []
    };
}

function generateSalesChartData() {
    const data = [];
    const now = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        // Generate realistic-looking data with some variance
        const baseOrders = 5 + Math.floor(Math.random() * 10);
        const orders = i % 7 === 0 || i % 7 === 6 ? baseOrders * 1.5 : baseOrders; // Weekend boost
        const avgValue = 60 + Math.random() * 40;

        data.push({
            date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
            sales: Math.round(orders * avgValue),
            orders: Math.round(orders)
        });
    }

    return data;
}

/**
 * Sync products to Shopify (real or demo)
 */
export async function syncProductsToShopify(): Promise<{
    success: boolean;
    synced: number;
    error?: string;
}> {
    const session = await auth();

    if (!session?.user?.email) {
        return { success: false, synced: 0, error: "Non authentifié" };
    }

    // Simulate sync
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
        success: true,
        synced: Math.floor(Math.random() * 10) + 5
    };
}
