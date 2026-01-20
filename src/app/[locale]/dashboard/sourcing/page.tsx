import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import SourcingClient from './SourcingClient';
import { getTrending, ProductWithScore } from '@/lib/aliexpress-actions';

export default async function SourcingPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/fr/login');
    }

    // Load initial trending products
    const result = await getTrending(12);
    const initialProducts: ProductWithScore[] = result.products || [];

    return <SourcingClient initialProducts={initialProducts} />;
}
