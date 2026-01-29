'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function submitTeamCode(formData: FormData) {
    const code = formData.get('code') as string;

    if (code === 'MERGUEZ') {
        const cookieStore = await cookies();
        // Set cookie for 30 days
        cookieStore.set('team_access', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        // Determine locale to redirect to (defaulting to fr if not detectable here, 
        // but usually we might want to reload or go to dashboard. 
        // Since this action is called from the landing page, we can just redirect to /dashboard
        // The middleware will handle the locale redirect if needed, or we can just refresh.
        // However, server actions redirect is the best way.

        // We'll redirect to /fr/dashboard which should now be accessible
        redirect('/fr/dashboard');
    }

    return { error: 'Code incorrect' };
}
