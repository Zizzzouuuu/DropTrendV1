'use server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const name = formData.get('name') as string;
  const language = formData.get('language') as string;

  try {
    await db.user.update({
        where: { email: session.user.email },
        data: { name, language }
    });
    revalidatePath('/[locale]/dashboard/settings');
    return { success: true, message: "Profil mis à jour" };
  } catch (error) {
    return { error: "Failed to update profile" };
  }
}
