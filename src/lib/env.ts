import { z } from 'zod';

/**
 * Environment variable validation schema.
 * This ensures all required env vars are present and valid at build/start time.
 */
const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

    // Authentication
    AUTH_SECRET: z.string().min(16, 'AUTH_SECRET must be at least 16 characters'),
    AUTH_URL: z.string().url().optional(),

    // Shopify Integration
    SHOPIFY_CLIENT_ID: z.string().min(1, 'SHOPIFY_CLIENT_ID is required'),
    SHOPIFY_CLIENT_SECRET: z.string().min(1, 'SHOPIFY_CLIENT_SECRET is required'),
    SHOPIFY_REDIRECT_URI: z.string().url('SHOPIFY_REDIRECT_URI must be a valid URL'),
    SHOPIFY_SCOPES: z.string().default('read_products,write_products'),
});

/**
 * Validated environment variables.
 * Will throw at startup if any required vars are missing or invalid.
 */
function validateEnv() {
    const parsed = envSchema.safeParse(process.env);

    if (!parsed.success) {
        console.error('❌ Invalid environment variables:');
        console.error(parsed.error.flatten().fieldErrors);
        throw new Error('Invalid environment variables');
    }

    return parsed.data;
}

export const env = validateEnv();
