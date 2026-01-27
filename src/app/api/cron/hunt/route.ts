import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import OpenAI from 'openai';
import { db } from '@/lib/db'; // Ensure this path is correct for your Prisma instance

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';
// Vercel max duration for Pro is 300s, Free is 10s (Cron allows 60s)
export const maxDuration = 60;

// Keywords configuration
const KEYWORDS = [
    "kitchen gadget",
    "pet accessory",
    "car cleaning tool",
    "beauty device",
    "home organizer",
    "fitness gear home",
    "smart home gadget",
    "baby safety product",
    "iphone accessory unique",
    "travel essential"
];

export async function GET(req: Request) {
    // 1. Security Check
    const authHeader = req.headers.get('Authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow running without auth in dev if needed, or enforce strict
        if (process.env.NODE_ENV === 'production') {
            return new NextResponse('Unauthorized', { status: 401 });
        }
    }

    if (!process.env.APIFY_API_TOKEN || !process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: "Missing API Keys (Apify or OpenAI)" }, { status: 500 });
    }

    try {
        // 2. Initialize Clients
        const apify = new ApifyClient({ token: process.env.APIFY_API_TOKEN });
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // 3. Select Random Keyword
        const keyword = KEYWORDS[Math.floor(Math.random() * KEYWORDS.length)];
        console.log(`[Cron] Hunting for keyword: "${keyword}"`);

        // 4. Run Apify Actor (latitudetech/aliexpress-scraper)
        // Note: Inputs depend on the specific actor version. 
        const run = await apify.actor("latitudetech/aliexpress-scraper").call({
            search: keyword,
            sort: "ordersDesc",
            shipTo: "US",
            maxItems: 10,
            currency: "USD",
            language: "en_US",
            proxy: { useApifyProxy: true }
        });

        console.log(`[Cron] Apify Run Finished. Dataset: ${run.defaultDatasetId}`);
        const { items: scrapedProducts } = await apify.dataset(run.defaultDatasetId).listItems();

        let processedCount = 0;
        let winnersFound = 0;

        // 5. Process & Analyze Products
        for (const item of scrapedProducts) {
            const product = item as any; // Cast generic item
            const aliexpressId = String(product.id || product.productId);

            // Skip invalid items
            if (!aliexpressId || !product.title || !product.image) continue;

            // 5.1 Duplicate Check (via AliExpressProduct)
            const existing = await db.aliExpressProduct.findUnique({
                where: { aliexpressId }
            });

            if (existing) {
                console.log(`[Cron] Skipping duplicate: ${aliexpressId}`);
                continue;
            }

            // 5.2 OpenAI Analysis (GPT-4o Vision)
            const prompt = `
            Tu es un expert en Dropshipping et Viralité TikTok. Analyse ce produit.
            
            Titre: ${product.title}
            Prix: ${product.price?.amount || product.salePrice || 'N/A'} ${product.currency || 'USD'}
            Commandes: ${product.sales || product.orders || 0}
            
            Tâche :
            1. Regarde l'image et le titre.
            2. Est-ce visuellement satisfaisant ? (Quality)
            3. Résout-il un problème évident ? (Pain point)
            4. Est-ce un produit 'Wow' ? (Viral potential)
            
            Réponds UNIQUEMENT au format JSON :
            {
                "score": number, // 0-100
                "isWinner": boolean, // true si score > 75
                "frenchTitle": "Titre marketing court et punchy en français",
                "frenchDescription": "Description vendeuse de 2 phrases en français",
                "marketingHook": "Phrase d'accroche pour une publicité TikTok/Facebook (Hook)",
                "niche": "Nom de la niche (ex: Cuisine, Beauté...)",
                "competitionLevel": "low" | "medium" | "high"
            }
            `;

            try {
                const aiResponse = await openai.chat.completions.create({
                    model: "gpt-4o",
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: prompt },
                                {
                                    type: "image_url",
                                    image_url: {
                                        url: product.image || product.productUrl // Assuming image/productUrl is the main image
                                    }
                                }
                            ]
                        }
                    ],
                    response_format: { type: "json_object" }
                });

                const analysis = JSON.parse(aiResponse.choices[0].message.content || "{}");

                // 5.3 Save to AliExpressProduct (History)
                await db.aliExpressProduct.create({
                    data: {
                        aliexpressId,
                        name: product.title.substring(0, 100), // Limit length
                        description: analysis.frenchDescription || product.title,
                        price: parseFloat(product.price?.amount || product.salePrice || "0"),
                        imageUrl: product.image || "",
                        productUrl: product.url || product.productUrl || "",
                        orders: parseInt(product.sales || product.orders || "0"),

                        // AI Data
                        aiScore: analysis.score || 0,
                        winnerStatus: analysis.isWinner ? "winner" : "rejected",
                        niche: analysis.niche,
                        marketingAngle: analysis.marketingHook,
                        analyzedAt: new Date()
                    }
                });

                // 5.4 Conditional Save to Product Table (Winners Only)
                if (analysis.isWinner && analysis.score > 75) {
                    await db.product.create({
                        data: {
                            name: analysis.frenchTitle,
                            description: analysis.frenchDescription,
                            price: parseFloat(product.price?.amount || product.salePrice || "0") * 2.5, // Simple markup x2.5
                            cost: parseFloat(product.price?.amount || product.salePrice || "0"),
                            margin: (parseFloat(product.price?.amount || product.salePrice || "0") * 1.5),
                            supplier: "AliExpress",
                            niche: analysis.niche || "General",
                            image: product.image || "",
                            score: analysis.score,
                            status: "Winner",

                            // JSON Fields
                            competitors: JSON.stringify([{ source: "AliExpress", url: product.url }]),
                            marketing: JSON.stringify({
                                hook: analysis.marketingHook,
                                angle: "Viral/Problem Solver"
                            })
                        }
                    });
                    winnersFound++;
                    console.log(`[Cron] Winner saved: ${analysis.frenchTitle}`);
                }

                processedCount++;

            } catch (aiError) {
                console.error(`[Cron] Analysis Failed for ${aliexpressId}:`, aiError);
            }
        }

        return NextResponse.json({
            success: true,
            keyword,
            scraped: scrapedProducts.length,
            processed: processedCount,
            winners: winnersFound
        });

    } catch (error) {
        console.error("[Cron] Critical Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
