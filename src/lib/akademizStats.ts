export interface AkademizLiveStats {
    students: number;
    events: number;
    communityPosts: number;
    updatedAt?: string;
}

const DEFAULT_STATS: AkademizLiveStats = {
    students: 2480,
    events: 320,
    communityPosts: 1450,
};

// 32-character security key for backend communication
const HARDCODED_STATS_KEY = 'akz_sec_9f7a2c4e8b1d6f0a3e5c7b9d';

// Backend production endpoint via Cloudflare tunnel
const DEFAULT_API_BASE_URL = 'https://akademiz-api.nortixlabs.com';

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

let inMemoryStats: AkademizLiveStats = { ...DEFAULT_STATS };
let lastFetchedAt = 0;

/**
 * Server-side fetcher with 15-minute caching.
 * Runs exclusively on the web server (Cloudflare Worker).
 * Never leaks the key or calls from the visitor's browser.
 */
export async function getAkademizLiveStats(runtimeEnv?: Record<string, any>): Promise<AkademizLiveStats> {
    const now = Date.now();
    if (now - lastFetchedAt < CACHE_TTL_MS && lastFetchedAt > 0) {
        return inMemoryStats;
    }

    const apiKey =
        runtimeEnv?.AKADEMIZ_STATS_API_KEY ||
        import.meta.env.AKADEMIZ_STATS_API_KEY ||
        HARDCODED_STATS_KEY;

    const baseUrl =
        runtimeEnv?.AKADEMIZ_API_URL ||
        import.meta.env.AKADEMIZ_API_URL ||
        DEFAULT_API_BASE_URL;

    try {
        const targetUrl = `${baseUrl.replace(/\/+$/, '')}/api/public/stats`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const fetchInit: any = {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Accept': 'application/json',
            },
            signal: controller.signal,
        };

        // Cloudflare edge subrequest cache instruction
        fetchInit.cf = {
            cacheTtl: 900,
            cacheEverything: true,
        };

        const res = await fetch(targetUrl, fetchInit);
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (data && typeof data === 'object') {
                inMemoryStats = {
                    students: typeof data.students === 'number' ? data.students : DEFAULT_STATS.students,
                    events: typeof data.events === 'number' ? data.events : DEFAULT_STATS.events,
                    communityPosts: typeof data.communityPosts === 'number' ? data.communityPosts : DEFAULT_STATS.communityPosts,
                    updatedAt: data.updatedAt || new Date().toISOString(),
                };
                lastFetchedAt = now;
                return inMemoryStats;
            }
        }
    } catch {
        // In case of timeout or offline backend, return last known cached or baseline stats
    }

    return inMemoryStats;
}
