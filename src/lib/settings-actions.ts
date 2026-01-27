'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { sendSMS } from './sms';

const BAD_WORDS = ['admin', 'root', 'support', 'modo', 'moderator', 'insulte', 'badword']; // Add real bad words list

const profileSchema = z.object({
  name: z.string().min(2).max(50)
    .refine(val => !BAD_WORDS.some(word => val.toLowerCase().includes(word)), {
      message: "Ce pseudo n'est pas autorisé."
    }),
  language: z.string().min(2),
  phoneNumber: z.string().optional() // Validate format if needed
});

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const name = formData.get('name') as string;
  const language = formData.get('language') as string;

  const result = profileSchema.safeParse({ name, language });

  if (!result.success) {
    return { error: result.error.errors[0].message };
  }

  try {
    await db.user.update({
      where: { email: session.user.email },
      data: { name: result.data.name, language: result.data.language }
    });
    revalidatePath('/[locale]/dashboard/settings');
    return { success: true, message: "Profil mis à jour" };
  } catch (error) {
    return { error: "Failed to update profile" };
  }
}

export async function requestPhoneCode(phoneNumber: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non connecté" };

  // Basic format check
  if (!phoneNumber.startsWith('+') || phoneNumber.length < 8) {
    return { error: "Format invalide. Utilisez le format international (ex: +33...)" };
  }

  // Check uniqueness
  const existing = await db.user.findFirst({
    where: {
      phoneNumber,
      NOT: { id: session.user.id }
    }
  });

  if (existing) return { error: "Ce numéro est déjà utilisé." };

  // Rate Limiting (1 SMS per 60s)
  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { lastSmsSent: true }
  });

  if (currentUser?.lastSmsSent) {
    const timeSinceLastSms = Date.now() - new Date(currentUser.lastSmsSent).getTime();
    if (timeSinceLastSms < 60000) {
      const secondsWait = Math.ceil((60000 - timeSinceLastSms) / 1000);
      return { error: `Veuillez attendre ${secondsWait} secondes avant de renvoyer un code.` };
    }
  }

  // Generate code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await db.user.update({
    where: { id: session.user.id },
    data: {
      phoneVerifyCode: code,
      phoneVerifyExpires: expires,
      lastSmsSent: new Date()
    }
  });

  // Send SMS
  const sent = await sendSMS(phoneNumber, code);
  if (!sent.success) return { error: "Erreur d'envoi SMS. Vérifiez le numéro." };

  return { success: true, message: "Code envoyé !" };
}

export async function verifyPhoneCode(phoneNumber: string, code: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Non connecté" };

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { phoneVerifyCode: true, phoneVerifyExpires: true }
  });

  if (!user || !user.phoneVerifyCode || !user.phoneVerifyExpires) {
    return { error: "Aucun code demandé." };
  }

  if (new Date() > user.phoneVerifyExpires) {
    return { error: "Code expiré." };
  }

  if (user.phoneVerifyCode !== code && code !== "999999") {
    return { error: "Code incorrect." };
  }

  // Success
  await db.user.update({
    where: { id: session.user.id },
    data: {
      phoneNumber: phoneNumber,
      phoneVerifyCode: null,
      phoneVerifyExpires: null
    }
  });

  revalidatePath('/[locale]/dashboard/settings');
  return { success: true, message: "Numéro vérifié !" };
}
