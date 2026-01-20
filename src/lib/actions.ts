'use server';
 
import { signIn, auth } from '@/auth';
import { AuthError } from 'next-auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';

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

export async function register(
  prevState: string | undefined,
  formData: FormData,
) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password || !name) {
    return 'Missing fields';
  }

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return 'Email already in use.';
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        subscription: 'free',
        subscriptionPlan: 'monthly', // Explicitly set default
        language: 'fr' // Explicitly set default
      },
    });

  } catch (error) {
    console.error("Registration Failed:", error);
    return error instanceof Error ? error.message : 'Failed to create user.';
  }
  
  // Default to French for redirection after server action
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
