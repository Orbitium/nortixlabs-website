export const prerender = false; // This must be server-rendered

import { Resend } from 'resend';

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
            return new Response(
                JSON.stringify({ success: false, message: 'Missing required fields' }),
                { status: 400 }
            );
        }

        // Get Resend API Key from env
        const resendKey = import.meta.env.RESEND_API_KEY || locals.runtime?.env?.RESEND_API_KEY;
        const resend = new Resend(resendKey);

        const attachments = [];
        if (file && file instanceof File) {
            const arrayBuffer = await file.arrayBuffer();
            attachments.push({
                filename: file.name,
                content: Buffer.from(arrayBuffer),
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
            return new Response(
                JSON.stringify({ success: false, message: 'Failed to send application' }),
                { status: 500 }
            );
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Application submitted successfully' }),
            { status: 200 }
        );

    } catch (error) {
        console.error('Submission Error:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal Server Error' }),
            { status: 500 }
        );
    }
};
