import type { APIRoute } from 'astro';
import { getAkademizLiveStats } from '../../lib/akademizStats';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
    const runtimeEnv = (locals as any)?.runtime?.env;
    const stats = await getAkademizLiveStats(runtimeEnv);

    return new Response(JSON.stringify(stats), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            // Cloudflare Edge Cache for 15 minutes (900 seconds)
            'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=60',
        },
    });
};
