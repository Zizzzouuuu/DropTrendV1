import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// Use user's purchasing number or a default fallback if testing
// Note: Without a purchased number, this works if using a Verified Caller ID or specialized Service SID, 
// but standard API usage requires a 'From' number.
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, code: string) {
    if (!accountSid || !authToken || !fromNumber) {
        console.warn('Twilio not configured properly');
        return { success: false, error: 'Twilio configuration missing' };
    }

    try {
        const message = await client.messages.create({
            body: `Votre code de vérification DropTrend est : ${code}`,
            from: fromNumber,
            to: to
        });
        console.log('SMS sent:', message.sid);
        return { success: true };
    } catch (error) {
        console.error('Error sending SMS:', error);
        return { success: false, error: 'Failed to send SMS' };
    }
}
