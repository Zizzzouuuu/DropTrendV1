
const fs = require('fs');

// Simple .env parser to get key
let apiKey = '';
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    const match = envContent.match(/RAPIDAPI_KEY="([^"]+)"/);
    if (match) apiKey = match[1];
} catch (e) { }

async function debugApi() {
    const host = 'aliexpress-true-api.p.rapidapi.com';
    const query = 'gadgets';

    console.log('Fetching raw API response...');
    const url = `https://${host}/api/v3/hot-products?target_language=EN&keywords=${query}&page_size=3&target_currency=EUR&sort=LAST_VOLUME_DESC&page_no=1&ship_to_country=FR`;

    try {
        const response = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': host
            }
        });

        const data = await response.json();

        console.log('--- ROOT KEYS ---');
        console.log(Object.keys(data));

        console.log('--- PRODUCTS TYPE ---');
        console.log(typeof data.products, Array.isArray(data.products));

        if (data.products && typeof data.products === 'object') {
            console.log('--- PRODUCTS KEYS ---');
            console.log(Object.keys(data.products));

            // Dump first item/key content structure without full dump
            const keys = Object.keys(data.products);
            if (keys.length > 0) {
                const firstKey = keys[0];
                const firstVal = data.products[firstKey];
                console.log(`--- CONTENT OF products['${firstKey}'] ---`);
                console.log('Type:', typeof firstVal, 'IsArray:', Array.isArray(firstVal));
                if (typeof firstVal === 'object') {
                    console.log('Keys:', Object.keys(firstVal));
                    if (firstVal.product) {
                        console.log('Has .product key!');
                    }
                }
            }
        }

        // Save raw dump
        fs.writeFileSync('api-dump.json', JSON.stringify(data, null, 2));
        console.log('Saved full dump to api-dump.json');

    } catch (error) {
        console.error('Error:', error);
    }
}

debugApi();
