export const prerender = false;

import { Resend } from 'resend';

export const POST = async ({ request, locals }) => {
    try {
        const data = await request.formData();
        const name = data.get('name');
        const email = data.get('email');
        const message = data.get('message');

        if (!name || !email || !message) {
            return new Response(
                JSON.stringify({ success: false, message: 'Missing required fields' }),
                { status: 400 }
            );
        }

        // Get Resend API Key from env
        const resendKey = import.meta.env.RESEND_API_KEY || locals.runtime?.env?.RESEND_API_KEY;
        const resend = new Resend(resendKey);

        const { data: emailData, error } = await resend.emails.send({
            from: 'Nortixlabs Contact <onboarding@resend.dev>', // Replace with your verified domain
            to: ['hello@nortixlabs.com'], // Replace with your recipient
            reply_to: email,
            subject: `New Contact Form Submission: ${name}`,
            text: `
                Name: ${name}
                Email: ${email}
                Message: ${message}
            `,
        });

        if (error) {
            console.error('Resend Error:', error);
            return new Response(
                JSON.stringify({ success: false, message: 'Failed to send email' }),
                { status: 500 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Message sent successfully' }),
            { status: 200 }
        );

    } catch (error) {
        console.error('Contact API Error:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error' }),
            { status: 500 }
        );
    }
};
