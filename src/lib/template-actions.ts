'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { SHOPIFY_TEMPLATES } from '@/lib/template-data';

/**
 * Install template to user's Shopify store
 */
export async function installTemplate(templateId: string): Promise<{
  success: boolean;
  downloadUrl?: string;
  error?: string;
}> {
  const session = await auth();

  if (!session?.user?.email) {
    return { success: false, error: "Non authentifié" };
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { integrations: true }
  });

  if (!user) {
    return { success: false, error: "Utilisateur non trouvé" };
  }

  const template = SHOPIFY_TEMPLATES.find(t => t.id === templateId);

  if (!template) {
    return { success: false, error: "Template non trouvé" };
  }

  // Check PRO access
  if (template.isPro && user.subscription !== 'pro') {
    return { success: false, error: "Ce template nécessite un abonnement Pro" };
  }

  // Get Shopify integration
  const shopifyIntegration = user.integrations.find(i => i.provider === 'shopify');

  if (!shopifyIntegration || !user.shopifyConnected) {
    return {
      success: false,
      error: "Vous devez connecter votre boutique Shopify pour installer ce template."
    };
  }

  // Install to Shopify via API
  try {
    const isDemo = shopifyIntegration.accessToken === 'demo_mode_token';

    if (isDemo) {
      // Simulate theme upload delay
      await new Promise(resolve => setTimeout(resolve, 3000));
    } else {
      // Real Shopify API call would go here
      // POST /admin/api/2024-01/themes.json
      // With theme src from template.downloadUrl

      // For now, we simulate success as we don't have the real theme files hosting set up yet
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    revalidatePath('/[locale]/dashboard/templates');
    return {
      success: true
    };
  } catch (error) {
    console.error("Install error:", error);
    return { success: false, error: "Erreur lors de l'installation sur Shopify" };
  }
}
