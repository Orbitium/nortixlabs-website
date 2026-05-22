const SHOPIER_API_BASE = 'https://api.shopier.com/v1';

function getShopierToken(locals) {
    const env = locals.runtime?.env;
    return (
        import.meta.env.SHOPIER_PAT ||
        import.meta.env.SHOPIER_ACCESS_TOKEN ||
        import.meta.env.SHOPIER_PERSONAL_ACCESS_TOKEN ||
        env?.SHOPIER_PAT ||
        env?.SHOPIER_ACCESS_TOKEN ||
        env?.SHOPIER_PERSONAL_ACCESS_TOKEN ||
        ''
    ).trim();
}

function stripHtml(value = '') {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getPrimaryMedia(product) {
    const media = Array.isArray(product?.media) ? product.media : [];
    return media.find((item) => Number(item?.placement) === 1) || media[0] || null;
}

function normalizeProduct(product) {
    const primaryMedia = getPrimaryMedia(product);
    const priceData = product?.priceData || {};
    const categories = Array.isArray(product?.categories) ? product.categories : [];
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const hasDiscount = Boolean(priceData.discount && priceData.discountedPrice);

    return {
        id: String(product?.id || ''),
        name: product?.title || 'Untitled product',
        description: stripHtml(product?.description || '').slice(0, 180),
        image: primaryMedia?.url || null,
        imageAlt: product?.title || 'Product image',
        url: product?.url || null,
        currencyCode: priceData.currency || 'TRY',
        priceAmount: priceData.price || null,
        discountedPriceAmount: hasDiscount ? priceData.discountedPrice : null,
        shippingPriceAmount: priceData.shippingPrice || null,
        stockStatus: product?.stockStatus || 'outOfStock',
        stockQuantity: Number.isFinite(product?.stockQuantity) ? product.stockQuantity : null,
        shippingPayer: product?.shippingPayer || null,
        categories: categories.map((category) => category?.title).filter(Boolean),
        variantCount: variants.length,
        hasVariants: variants.length > 0,
    };
}

function extractCollection(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (Array.isArray(payload?.items)) {
        return payload.items;
    }

    if (Array.isArray(payload?.results)) {
        return payload.results;
    }

    return [];
}

async function shopierRequest(locals, path, searchParams = {}) {
    const token = getShopierToken(locals);
    if (!token) {
        throw new Error('Missing Shopier API token. Set SHOPIER_PAT, SHOPIER_ACCESS_TOKEN, or SHOPIER_PERSONAL_ACCESS_TOKEN.');
    }

    const url = new URL(`${SHOPIER_API_BASE}${path}`);
    for (const [key, value] of Object.entries(searchParams)) {
        if (value === undefined || value === null || value === '') {
            continue;
        }

        url.searchParams.set(key, String(value));
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            accept: 'application/json',
            authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Shopier request failed with status ${response.status}: ${text}`);
    }

    return response.json();
}

export async function getProducts(locals, options = {}) {
    const {
        limit = 12,
        page = 1,
        sort = 'dateDesc',
    } = options;

    const payload = await shopierRequest(locals, '/products', {
        limit,
        page,
        sort,
    });

    return extractCollection(payload).map(normalizeProduct);
}
