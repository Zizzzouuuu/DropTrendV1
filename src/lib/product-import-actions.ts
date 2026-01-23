'use server';

/**
 * Product Import Actions
 * 
 * Handles 1-click product import to Shopify with AI-generated content:
 * - SEO-optimized descriptions
 * - Product specifications
 * - Direct push to Shopify via Admin API
 */

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { AliExpressProduct } from '@/lib/api/aliexpress';

// ============================================
// INTERFACES
// ============================================

export interface GeneratedProductContent {
    title: string;
    description: string;
    seoDescription: string;
    bulletPoints: string[];
    tags: string[];
}

export interface ProductImportResult {
    success: boolean;
    shopifyProductId?: string;
    productUrl?: string;
    error?: string;
}

// ============================================
// AI CONTENT GENERATION
// ============================================

export async function generateProductDescription(
    product: AliExpressProduct,
    suggestedPrice: number
): Promise<GeneratedProductContent> {
    const defaultContent = createDefaultContent(product);

    if (!process.env.OPENAI_API_KEY) {
        return defaultContent;
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `Tu es un expert copywriter spécialisé dans le e-commerce et le dropshipping.
Tu crées des fiches produits qui CONVERTISSENT. Ton style est:
- Professionnel mais engageant
- Axé sur les BÉNÉFICES (pas juste les caractéristiques)
- Optimisé SEO avec des mots-clés naturels
- Persuasif sans être agressif

Réponds UNIQUEMENT en JSON valide avec cette structure:
{
  "title": "Titre optimisé (max 60 chars)",
  "description": "Description marketing complète en HTML (3-4 paragraphes)",
  "seoDescription": "Meta description SEO (max 160 chars)",
  "bulletPoints": ["Bénéfice 1", "Bénéfice 2", "Bénéfice 3", "Bénéfice 4", "Bénéfice 5"],
  "tags": ["tag1", "tag2", "tag3"]
}`
                    },
                    {
                        role: 'user',
                        content: `Crée une fiche produit complète pour:

Produit: "${product.title}"
Prix de vente: ${suggestedPrice}€
Catégorie: ${product.category || 'Général'}
Note clients: ${product.rating}/5 (${product.reviews} avis)
Ventes: ${product.sales}+

La description doit:
1. Attirer l'attention immédiatement
2. Présenter les bénéfices clés
3. Créer un sentiment d'urgence
4. Rassurer sur la qualité`
                    }
                ],
                response_format: { type: 'json_object' },
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            console.error('OpenAI API error:', await response.text());
            return defaultContent;
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0]?.message?.content || '{}');

        return {
            title: content.title || defaultContent.title,
            description: content.description || defaultContent.description,
            seoDescription: content.seoDescription || defaultContent.seoDescription,
            bulletPoints: content.bulletPoints || defaultContent.bulletPoints,
            tags: content.tags || defaultContent.tags
        };

    } catch (error) {
        console.error('Content generation error:', error);
        return defaultContent;
    }
}

function createDefaultContent(product: AliExpressProduct): GeneratedProductContent {
    const cleanTitle = product.title.slice(0, 60).trim();

    return {
        title: cleanTitle,
        description: `
<div class="product-description">
    <h3>🌟 ${cleanTitle}</h3>
    <p>Découvrez ce produit exceptionnel, déjà adopté par <strong>${product.sales.toLocaleString()}+ clients satisfaits</strong>.</p>
    
    <h4>✨ Pourquoi vous allez l'adorer :</h4>
    <ul>
        <li>Qualité premium garantie</li>
        <li>Note exceptionnelle : ${product.rating}/5 ⭐</li>
        <li>Livraison rapide et soignée</li>
        <li>Satisfaction garantie ou remboursé</li>
    </ul>
    
    <p><strong>⚡ Stock limité</strong> - Commandez maintenant pour profiter de cette offre !</p>
</div>
        `.trim(),
        seoDescription: `${cleanTitle} - Qualité premium, ${product.sales}+ ventes, ${product.rating}/5 ⭐. Livraison rapide. Commandez maintenant !`,
        bulletPoints: [
            'Qualité premium garantie',
            `${product.sales.toLocaleString()}+ clients satisfaits`,
            `Note: ${product.rating}/5 étoiles`,
            'Livraison rapide et suivie',
            'Service client réactif'
        ],
        tags: ['tendance', 'qualité', 'bestseller']
    };
}

// ============================================
// SHOPIFY PRODUCT IMPORT
// ============================================

export async function importProductToShopify(
    product: AliExpressProduct,
    suggestedPrice: number,
    customTitle?: string
): Promise<ProductImportResult> {
    const session = await auth();

    if (!session?.user?.email) {
        return { success: false, error: "Non authentifié" };
    }

    try {
        // Get user and Shopify integration
        const user = await db.user.findUnique({
            where: { email: session.user.email },
            include: { integrations: true }
        });

        if (!user) {
            return { success: false, error: "Utilisateur non trouvé" };
        }

        const shopifyIntegration = user.integrations.find(i => i.provider === 'shopify');

        if (!shopifyIntegration || !user.shopifyConnected) {
            return { success: false, error: "Shopify non connecté. Connectez votre boutique d'abord." };
        }

        const isDemo = shopifyIntegration.accessToken === 'demo_mode_token';

        // Generate AI content
        const content = await generateProductDescription(product, suggestedPrice);

        // Check if product was already imported
        const existingImport = await db.shopifyImport.findFirst({
            where: {
                userId: user.id,
                aliProduct: {
                    aliexpressId: product.id
                }
            }
        });

        if (existingImport?.shopifyProductId) {
            return {
                success: true,
                shopifyProductId: existingImport.shopifyProductId,
                error: "Ce produit a déjà été importé"
            };
        }

        // Prepare product data
        const productData = {
            product: {
                title: customTitle || content.title,
                body_html: content.description,
                vendor: 'DropTrend Import',
                product_type: product.category || 'Général',
                tags: content.tags.join(', '),
                images: [
                    { src: product.imageHd || product.imageUrl }
                ],
                variants: [
                    {
                        price: suggestedPrice.toFixed(2),
                        compare_at_price: (suggestedPrice * 1.3).toFixed(2),
                        inventory_management: null,
                        requires_shipping: true,
                        taxable: true
                    }
                ],
                metafields: [
                    {
                        namespace: 'droptrend',
                        key: 'source_id',
                        value: product.id,
                        type: 'single_line_text_field'
                    },
                    {
                        namespace: 'droptrend',
                        key: 'supplier_price',
                        value: product.price.toString(),
                        type: 'number_decimal'
                    }
                ]
            }
        };

        let shopifyProductId: string;
        let productUrl: string;

        if (isDemo) {
            // Demo mode - simulate import
            await new Promise(resolve => setTimeout(resolve, 2000));
            shopifyProductId = `demo_${Date.now()}`;
            productUrl = `https://${shopifyIntegration.shopUrl}/products/demo-product`;
        } else {
            // Real Shopify API call
            const shopifyResponse = await fetch(
                `https://${shopifyIntegration.shopUrl}/admin/api/2024-01/products.json`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Shopify-Access-Token': shopifyIntegration.accessToken
                    },
                    body: JSON.stringify(productData)
                }
            );

            if (!shopifyResponse.ok) {
                const errorText = await shopifyResponse.text();
                console.error('Shopify API error:', errorText);
                return { success: false, error: "Erreur lors de l'import vers Shopify" };
            }

            const result = await shopifyResponse.json();
            shopifyProductId = result.product.id.toString();
            productUrl = `https://${shopifyIntegration.shopUrl}/products/${result.product.handle}`;
        }

        // Save or update AliExpressProduct in database
        let aliProduct = await db.aliExpressProduct.findUnique({
            where: { aliexpressId: product.id }
        });

        if (!aliProduct) {
            aliProduct = await db.aliExpressProduct.create({
                data: {
                    aliexpressId: product.id,
                    name: product.title,
                    description: content.description,
                    price: product.price,
                    rating: product.rating,
                    orders: product.sales,
                    imageUrl: product.imageUrl,
                    productUrl: product.productUrl,
                    category: product.category,
                    suggestedPrice: suggestedPrice,
                    aiScore: 0,
                    winnerStatus: 'analyzing'
                }
            });
        }

        // Record the import
        await db.shopifyImport.create({
            data: {
                userId: user.id,
                aliProductId: aliProduct.id,
                shopifyProductId,
                sellingPrice: suggestedPrice,
                status: 'success'
            }
        });

        revalidatePath('/[locale]/dashboard/winners');
        revalidatePath('/[locale]/dashboard/shopify');

        return {
            success: true,
            shopifyProductId,
            productUrl
        };

    } catch (error) {
        console.error('Import error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Erreur lors de l'import"
        };
    }
}

// ============================================
// BULK IMPORT
// ============================================

export async function importMultipleProducts(
    products: Array<{ product: AliExpressProduct; suggestedPrice: number }>
): Promise<{
    successful: number;
    failed: number;
    results: ProductImportResult[];
}> {
    const results: ProductImportResult[] = [];
    let successful = 0;
    let failed = 0;

    for (const item of products) {
        const result = await importProductToShopify(item.product, item.suggestedPrice);
        results.push(result);

        if (result.success) {
            successful++;
        } else {
            failed++;
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    return { successful, failed, results };
}
