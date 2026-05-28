export const prerender = false; // This must be server-rendered

import { Resend } from 'resend';

const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
        },
    });

const toBase64 = (arrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    return btoa(binary);
};

export const POST = async ({ request, locals }) => {
    try {
        const data = await request.formData();
        const position = data.get('position');
        const firstName = data.get('firstName');
        const lastName = data.get('lastName');
        const email = data.get('email');
        const portfolio = data.get('portfolio');
        const message = data.get('message');
        const file = data.get('file');

        // Basic Validation
        if (!email || !firstName) {
            return json({ success: false, message: 'Missing required fields' }, 400);
        }

        // Get Resend API Key from env
        const resendKey = import.meta.env.RESEND_API_KEY || locals.runtime?.env?.RESEND_API_KEY;
        const resend = new Resend(resendKey);

        const attachments = [];
        if (file && file instanceof File) {
            const arrayBuffer = await file.arrayBuffer();
            attachments.push({
                filename: file.name,
                content: toBase64(arrayBuffer),
                contentType: file.type || undefined,
            });
        }

        const { data: emailData, error } = await resend.emails.send({
            from: 'Nortix Careers <onboarding@resend.dev>',
            to: ['careers@nortixlabs.com'], // Or wherever you want applications
            reply_to: email,
            subject: `New Application: ${position} - ${firstName} ${lastName}`,
            text: `
                Position: ${position}
                Name: ${firstName} ${lastName}
                Email: ${email}
                Portfolio: ${portfolio || 'N/A'}
                
                Message:
                ${message || 'No message provided.'}
            `,
            attachments,
        });

        if (error) {
            console.error('Resend Error:', error);
            return json({ success: false, message: 'Failed to send application' }, 500);
        }

        return json({ success: true, message: 'Application submitted successfully' }, 200);

    } catch (error) {
        console.error('Submission Error:', error);
        return json({ success: false, message: 'Internal Server Error' }, 500);
    }
};
