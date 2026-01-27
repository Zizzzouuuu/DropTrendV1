import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

// Force dynamic to prevent caching of Cron results
export const dynamic = 'force-dynamic';
// Increase timeout for long scraping jobs (Vercel max is usually 10s on free, 60s on Pro, configurable for Crons)
export const maxDuration = 300;

export async function GET(req: Request) {
    // Check for secret if needed (Vercel Crons automatically secure this, but good practice)
    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        // Optional: return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword') || "kitchen gadget";

    if (!process.env.APIFY_API_TOKEN) {
        return NextResponse.json({ error: "APIFY_API_TOKEN missing" }, { status: 500 });
    }

    try {
        const client = new ApifyClient({
            token: process.env.APIFY_API_TOKEN,
        });

        console.log(`[Cron] Starting Apify hunt for: ${keyword}`);

        // Actor: latitudetech/aliexpress-scraper
        // Documentation inputs: https://apify.com/latitudetech/aliexpress-scraper/input-schema
        const input = {
            search: keyword,
            sort: "ordersDesc", // Sort by orders
            shipTo: "US",       // Ship to USA
            maxItems: 20,       // Efficiency limit
            language: "en_US",
            currency: "USD",
            proxy: { useApifyProxy: true }
        };

        // Run the actor and wait for it to finish
        const run = await client.actor("latitudetech/aliexpress-scraper").call(input);

        console.log(`[Cron] Apify run finished. Dataset ID: ${run.defaultDatasetId}`);

        // Fetch results from the dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();

        return NextResponse.json({
            success: true,
            runId: run.id,
            count: items.length,
            data: items
        });

    } catch (error) {
        console.error("[Cron] Apify Hunt Error:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
