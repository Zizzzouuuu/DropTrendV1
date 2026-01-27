const VONAGE_API_KEY = process.env.VONAGE_API_KEY;
const VONAGE_API_SECRET = process.env.VONAGE_API_SECRET;
const FROM_NAME = "NXSMS"; // Default Vonage sender ID (safest for unregistered delivery in Turkey)

export async function sendSMS(to: string, code: string) {
    if (!VONAGE_API_KEY || !VONAGE_API_SECRET) {
        console.warn('Vonage configuration missing. Using MOCK mode.');
        console.log(`[MOCK-SMS] Code for ${to}: ${code}`);
        return { success: true };
    }

    try {
        const body = new URLSearchParams();
        body.append('api_key', VONAGE_API_KEY);
        body.append('api_secret', VONAGE_API_SECRET);
        body.append('from', FROM_NAME);
        body.append('to', to.replace('+', '')); // Vonage often prefers no plus, just digits
        body.append('text', `Your DropTrend verification code is: ${code}`);

        const response = await fetch('https://rest.nexmo.com/sms/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString()
        });

        const data = await response.json();

        if (data.messages && data.messages[0].status === '0') {
            console.log('Vonage SMS sent:', data.messages[0]['message-id']);
            return { success: true };
        } else {
            console.error('Vonage Error:', data.messages ? data.messages[0]['error-text'] : data);
            return { success: false, error: data.messages ? data.messages[0]['error-text'] : 'Failed to send' };
        }
    } catch (error) {
        console.error('Error sending SMS via Vonage:', error);
        return { success: false, error: 'Failed to send SMS' };
    }
}
