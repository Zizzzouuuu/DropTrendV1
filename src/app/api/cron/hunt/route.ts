import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';
import OpenAI from 'openai';
import { db } from '@/lib/db'; // Ensure this path is correct for your Prisma instance

// Force dynamic to prevent caching
export const dynamic = 'force-dynamic';
// Vercel max duration for Pro is 300s, Free is 10s (Cron allows 60s)
export const maxDuration = 60;

// Keywords configuration
const BASE_KEYWORDS = [
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

// Seasonal Configuration (With Dropshipping Lead Time)
function getSeasonalConfig() {
    const date = new Date();
    const month = date.getMonth(); // 0 = Jan, 1 = Feb, etc.
    const day = date.getDate();

    let seasonKeywords: string[] = [];
    let seasonalContext = "";

    // SMART LOGIC: Anticipate events by 3-4 weeks for shipping time
    if (month === 0 || (month === 1 && day < 5)) {
        // Jan 1 -> Feb 5: VALENTINE RUSH
        seasonKeywords = ["valentine gift unique", "couple accessory", "romantic decor", "jewelry for her", "rose bear"];
        seasonalContext = "URGENT: La Saint Valentin approche (14 Fév). Cherche des cadeaux couples/romantiques avec livraison rapide.";
    } else if (month === 1 || month === 2) {
        // Feb 5 -> Mar 31: SPRING CLEANING & GARDEN
        seasonKeywords = ["cleaning tool", "home organization", "gardening tool", "car cleaning"];
        seasonalContext = "Le printemps arrive. Les gens veulent nettoyer, organiser et jardiner.";
    } else if (month >= 3 && month <= 5) {
        // Apr -> Jun: SUMMER PREP
        seasonKeywords = ["beach accessory", "cooling gadget", "travel bag", "swimwear trend", "bbq tool"];
        seasonalContext = "Prépare l'été ! Les gens achètent pour la plage, la chaleur et les vacances.";
    } else if (month === 8 || (month === 9 && day < 15)) {
        // Sep -> Oct 15: HALLOWEEN PREP
        seasonKeywords = ["halloween decor", "scary costume", "party led lights", "fog machine"];
        seasonalContext = "Prépare Halloween. Les gens cherchent des décos et costumes maintenant.";
    } else if (month >= 9 || month <= 10) {
        // Oct 15 -> Nov 30: CHRISTMAS / BLACK FRIDAY PREP (Golden Quarter)
        seasonKeywords = ["christmas gift ideas", "winter gadget", "kids toy trend", "warm clothing", "gift packaging"];
        seasonalContext = "C'est le Q4 (Noël) ! C'est le moment CRITIQUE pour les cadeaux viraux.";
    } else {
        // Standard (July, August, Dec post-cutoff)
        seasonKeywords = [];
        seasonalContext = "Période standard. Cherche des produits viraux génériques (Everyday winners).";
    }

    // 60% chance to pick a seasonal keyword if available (Higher probability for urgency)
    const useSeasonal = seasonKeywords.length > 0 && Math.random() < 0.6;
    const keyword = useSeasonal
        ? seasonKeywords[Math.floor(Math.random() * seasonKeywords.length)]
        : BASE_KEYWORDS[Math.floor(Math.random() * BASE_KEYWORDS.length)];

    return { keyword, seasonalContext, isSeasonal: useSeasonal };
}

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

        // 3. Select Seasonal Keyword
        const { keyword, seasonalContext, isSeasonal } = getSeasonalConfig();
        console.log(`[Cron] Hunting for keyword: "${keyword}" (Seasonal: ${isSeasonal})`);

        // 4. Run Apify Actor (piotrv1001/aliexpress-listings-scraper)
        // Requires specific URL input to work reliably
        const encodedKeyword = encodeURIComponent(keyword);
        // Added &maxPrice=50 to avoid high-ticket items
        const searchUrl = `https://www.aliexpress.com/wholesale?SearchText=${encodedKeyword}&SortType=total_tranpro_desc&maxPrice=50`;

        const run = await apify.actor("piotrv1001/aliexpress-listings-scraper").call({
            searchUrls: [searchUrl],
            maxItems: 10,
            shipTo: "US",
            currency: "USD",
            proxy: { useApifyProxy: true }
        });

        console.log(`[Cron] Apify Run Finished. Dataset: ${run.defaultDatasetId}`);
        const { items: scrapedProducts } = await apify.dataset(run.defaultDatasetId).listItems();

        let processedCount = 0;
        let winnersFound = 0;
        const processedIds = new Set<string>(); // Local deduplication set

        // 5. Process & Analyze Products
        for (const item of scrapedProducts) {
            const product = item as any; // Cast generic item

            // Console log to debug keys for the first item
            if (processedCount === 0) {
                console.log("[Cron] First Item Keys:", Object.keys(product));
                console.log("[Cron] First Item Sample:", JSON.stringify(product).substring(0, 200));
            }

            // ROBUST MAPPING: Handle various potential field names from the scraper
            const aliexpressId = String(product.id || product.productId || product.product_id || product.item_id || "");
            const title = product.title || product.name || product.subject || product.product_title || "";
            const imageUrl = product.image || product.imageUrl || product.productImage || product.imgUrl || product.product_main_image_url || "";

            // Robust Price Parsing
            let price = 0;
            if (typeof product.price === 'number') {
                price = product.price;
            } else if (typeof product.salePrice === 'number') {
                price = product.salePrice;
            } else if (product.price && typeof product.price === 'object') {
                // e.g. { amount: "10.00", currency: "USD" }
                price = parseFloat(product.price.amount || product.price.min || "0");
            } else if (product.app_sale_price) {
                price = parseFloat(String(product.app_sale_price).replace(/[^0-9.]/g, ""));
            } else {
                // Fallback string parsing
                const priceStr = String(product.price || product.salePrice || product.target_sale_price || "0");
                price = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
            }

            const orders = parseInt(String(product.sales || product.orders || product.tradeCount || product.lastest_volume || "0").replace(/[^0-9]/g, ""));

            // Skip invalid items
            if (!aliexpressId || !title || !imageUrl) {
                if (processedCount < 3) console.log(`[Cron] Skipping invalid item: ID=${aliexpressId}, Title=${!!title}, Image=${!!imageUrl}`);
                continue;
            }

            // Local Deduplication
            if (processedIds.has(aliexpressId)) {
                console.log(`[Cron] Skipping local duplicate: ${aliexpressId}`);
                continue;
            }
            processedIds.add(aliexpressId);

            // 5.1 DB Duplicate Check (via AliExpressProduct)
            const existing = await db.aliExpressProduct.findUnique({
                where: { aliexpressId }
            });

            if (existing) {
                console.log(`[Cron] Skipping DB duplicate: ${aliexpressId}`);
                continue;
            }

            // 5.2 OpenAI Analysis (GPT-4o Vision)
            const prompt = `
            Tu es un expert en Dropshipping et Viralité TikTok avec une spécialisation en sensibilité prix ET en tendances saisonnières.
            
            CONTEXTE SAISONNIER : ${seasonalContext}
            (Prends-le en compte pour le "score" et l'avis marketing).
            
            Produit à analyser :
            Titre: ${title}
            Prix: ${price} USD
            Commandes: ${orders}
            
            Tâche :
            1. Regarde l'image et le titre.
            2. Juge le rapport Qualité/Prix (Doit être < 50$ et rentable).
            3. Est-ce pertinent pour la saison actuelle (${seasonalContext}) ? ou est-ce un produit 'Wow' intemporel ?
            
            Réponds UNIQUEMENT au format JSON :
            {
                "score": number, // 0-100 (Bonus si pertinent pour la saison !)
                "isWinner": boolean, // true si score > 75
                "frenchTitle": "Titre marketing court et punchy en français",
                "frenchDescription": "Description vendeuse de 2 phrases en français",
                "marketingHook": "Phrase d'accroche pour une publicité TikTok/Facebook (Hook)",
                "niche": "Nom de la niche (ex: Cuisine, Beauté...)",
                "seasonality": "Nom de l'événement (ex: St Valentin) ou 'General'"
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
                                        url: imageUrl
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
                        name: title.substring(0, 100), // Limit length
                        description: analysis.frenchDescription || title,
                        price: price,
                        imageUrl: imageUrl,
                        productUrl: product.url || product.productUrl || `https://www.aliexpress.com/item/${aliexpressId}.html`,
                        orders: orders,

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
