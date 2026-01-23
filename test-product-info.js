
const fs = require('fs');
// Simple .env parser
try {
    const envContent = fs.readFileSync('.env', 'utf8');
    envContent.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            process.env[key] = value;
        }
    });
} catch (e) { console.error('Error loading .env', e); }

async function testProductInfo() {
    const apiKey = process.env.RAPIDAPI_KEY;
    const host = 'aliexpress-true-api.p.rapidapi.com';
    const productId = '4000852782080';

    console.log('Testing product-info endpoint...');
    const url = `https://${host}/api/v3/product-info?target_currency=EUR&product_id=${productId}&ship_to_country=FR&target_language=EN`;

    try {
        const response = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': host
            }
        });

        if (!response.ok) {
            console.error('API Error:', response.status);
            console.error(await response.text());
            return;
        }

        const data = await response.json();
        console.log('Response keys:', Object.keys(data));

        // Log important fields to check structure
        const item = data.data || data;
        console.log('Title:', item.product_title || item.title);
        console.log('Price:', item.format_price || item.target_sale_price);
        console.log('Images:', item.product_small_image_urls ? item.product_small_image_urls.length : 'N/A');
        console.log('Description type:', typeof item.product_description);

        // Save sample to file for inspection if needed
        fs.writeFileSync('product-info-sample.json', JSON.stringify(data, null, 2));
        console.log('Saved sample to product-info-sample.json');

    } catch (error) {
        console.error('Exception:', error);
    }
}

testProductInfo();
