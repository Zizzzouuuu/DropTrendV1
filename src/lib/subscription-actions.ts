'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function cancelSubscription() {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  try {
    const user = await db.user.findUnique({ where: { email: session.user.email } });
    if (user?.subscriptionPlan === 'monthly') {
        await db.user.update({
            where: { email: session.user.email },
            data: { subscription: 'free', subscriptionPlan: 'none' }
        });
        revalidatePath('/[locale]/dashboard/settings');
        return { success: true, message: "Abonnement annulé." };
    } else {
        return { error: "Seuls les abonnements mensuels sont annulables en ligne." };
    }
  } catch (error) {
    return { error: "Erreur lors de l'annulation" };
  }
}
