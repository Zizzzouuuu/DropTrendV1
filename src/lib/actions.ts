'use server';

import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

// ============================================
// PASSWORD VALIDATION
// ============================================

interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Strict password validation rules:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one special character
 * - At least one number
 */
function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('Minimum 12 caractères');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Au moins une majuscule');
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Au moins un caractère spécial (!@#$%^&*...)');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Au moins un chiffre');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    // Log the attempt for debugging
    console.log("Attempting login for:", formData.get('email'));
    // Force redirect to dashboard on success
    await signIn('credentials', {
      ...Object.fromEntries(formData),
      redirectTo: '/fr/dashboard'
    });
  } catch (error) {
    // Filter out Next.js Redirect errors by checking for AuthError
    // Next.js Redirects are thrown as errors but are NOT instances of AuthError
    if (error instanceof AuthError) {
      console.error("Login error:", error);
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          // Check if there is a cause with a specific message (e.g. from getUser)
          if (error.cause && error.cause instanceof Error) {
            return error.cause.message;
          }
          return 'Something went wrong.';
      }
    }

    // Rethrow all other errors (including Next.js Redirects)
    throw error;
  }
}

import { sendSMS } from './sms';

export async function sendRegistrationOTP(phoneNumber: string) {
  // 1. Format check
  if (!phoneNumber.startsWith('+') || phoneNumber.length < 8) {
    return { error: "Format invalide. Utilisez le format international (ex: +33...)." };
  }

  // 2. Uniqueness check
  const existingUser = await db.user.findFirst({ where: { phoneNumber } });
  if (existingUser) {
    return { error: "Ce numéro est déjà utilisé." };
  }

  // 3. Rate Limit (reuse logic or simple check on createdAt of last code)
  const lastCode = await db.phoneVerification.findUnique({ where: { phoneNumber } });
  if (lastCode) {
    const timeDiff = Date.now() - new Date(lastCode.createdAt).getTime();
    if (timeDiff < 60000) { // 60s
      return { error: "Veuillez attendre 1 minute avant de renvoyer un code." };
    }
  }

  // 4. Generate & Save
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await db.phoneVerification.upsert({
    where: { phoneNumber },
    update: { code, expiresAt: expires, createdAt: new Date() },
    create: { phoneNumber, code, expiresAt: expires }
  });

  // 5. Send SMS
  const sent = await sendSMS(phoneNumber, code);
  if (!sent.success) return { error: "Erreur d'envoi SMS." };

  return { success: true, message: "Code envoyé !" };
}

export async function register(
  prevState: string | undefined,
  formData: FormData,
) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Phone is now optional during registration (Cost Saving)
  const phoneNumber = formData.get('phoneNumber') as string;
  const otpCode = formData.get('otpCode') as string;

  if (!email || !password || !name) {
    return 'Tous les champs sont requis (Email, Mot de passe, Nom).';
  }

  // Security Rule: Bad Words Filter
  const BAD_WORDS = ['admin', 'root', 'support', 'modo', 'moderator', 'insulte', 'badword', 'hitler'];
  if (BAD_WORDS.some(word => name.toLowerCase().includes(word))) {
    return "Ce nom n'est pas autorisé.";
  }

  if (!phoneNumber || !otpCode) {
    return 'Veuillez vérifier votre numéro de téléphone.';
  }

  const verification = await db.phoneVerification.findUnique({ where: { phoneNumber } });

  if (!verification) {
    return "Code expiré ou numéro invalide.";
  }

  if (verification.code !== otpCode) {
    return "Code de vérification incorrect.";
  }

  if (new Date() > verification.expiresAt) {
    return "Le code a expiré.";
  }

  // Build password validation
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return `Mot de passe invalide: ${passwordValidation.errors.join(', ')}`;
  }

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return 'Cet email est déjà utilisé.';
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber: phoneNumber, // Phone is verified
        subscription: 'free',
        subscriptionPlan: 'monthly',
        language: 'fr',
        phoneVerifyCode: null,
        phoneVerifyExpires: null
      },
    });

  } catch (error) {
    console.error("Registration Failed:", error);
    return error instanceof Error ? error.message : 'Failed to create user.';
  }

  redirect('/fr/login?registered=true');
}

export async function toggleProductSave(productId: string) {
  const session = await auth();
  if (!session?.user?.email) return { error: "Not authenticated" };

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) return { error: "User not found" };

  const existingSave = await db.savedProduct.findUnique({
    where: {
      userId_productId: {
        userId: user.id,
        productId: productId
      }
    }
  });

  if (existingSave) {
    await db.savedProduct.delete({
      where: { id: existingSave.id }
    });
    return { saved: false };
  } else {
    await db.savedProduct.create({
      data: {
        userId: user.id,
        productId: productId
      }
    });
    return { saved: true };
  }
}
