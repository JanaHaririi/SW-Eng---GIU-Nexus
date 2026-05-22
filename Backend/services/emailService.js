// services/emailService.js
//
// Email is sent via Resend's HTTPS API instead of SMTP. Render's free tier
// blocks outbound SMTP (ports 25/465/587), so SMTP-based transports like
// nodemailer cannot deliver mail from there — HTTP/443 to api.resend.com
// works fine.

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const sendEmail = async (options) => {

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
        const err = new Error('RESEND_API_KEY is not configured');
        console.error('Email sending failed:', err.message);
        throw err;
    }

    const payload = {
        from: process.env.EMAIL_FROM || 'GIU Nexus <onboarding@resend.dev>',
        to: [options.email],
        subject: options.subject,
        text: options.text || options.message,
        html: options.html
    };

    let response;
    try {
        response = await fetch(RESEND_ENDPOINT, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
    } catch (error) {
        console.error('Email sending failed (network):', error.message);
        throw new Error(`Email could not be sent: ${error.message}`);
    }

    if (!response.ok) {
        const body = await response.text();
        console.error(
            'Email sending failed:',
            response.status,
            body
        );
        throw new Error(`Email could not be sent: ${response.status} ${body}`);
    }

    const data = await response.json();
    console.log('Email sent:', data.id);
};

module.exports = sendEmail;
