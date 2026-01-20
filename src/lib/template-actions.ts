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
    // Generate download URL for manual installation
    const downloadUrl = `/api/templates/download/${templateId}`;
    return {
      success: true,
      downloadUrl,
      error: "Shopify non connecté - Téléchargement manuel disponible"
    };
  }

  // Install to Shopify via API (Simulated)
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    revalidatePath('/[locale]/dashboard/templates');
    return {
      success: true,
      downloadUrl: `/api/templates/download/${templateId}`
    };
  } catch (error) {
    console.error("Install error:", error);
    return { success: false, error: "Erreur lors de l'installation" };
  }
}
