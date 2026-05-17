export const prerender = false;

import { addCartLines, createCart, getCart, getVariantByHandle } from '../../../lib/shopify.js';

function json(data, status = 200) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

function normalizeCart(cart) {
    if (!cart) {
        return null;
    }

    return {
        id: cart.id,
        checkoutUrl: cart.checkoutUrl,
        totalQuantity: cart.totalQuantity,
        subtotal: cart.cost?.subtotalAmount || null,
        lines: cart.lines?.nodes?.map((line) => ({
            id: line.id,
            quantity: line.quantity,
            merchandiseId: line.merchandise?.id,
            title: line.merchandise?.product?.title,
            handle: line.merchandise?.product?.handle,
            variantTitle: line.merchandise?.title,
            image: line.merchandise?.image?.url || null,
            price: line.merchandise?.price || null,
        })) || [],
    };
}

function collectMessages(result) {
    const errors = result.userErrors?.map((item) => item.message) || [];
    const warnings = result.warnings?.map((item) => item.message) || [];
    return [...errors, ...warnings].filter(Boolean);
}

export const GET = async ({ url, locals }) => {
    const cartId = url.searchParams.get('cartId');

    if (!cartId) {
        return json({ cart: null });
    }

    try {
        const cart = await getCart(locals, cartId);
        return json({ cart: normalizeCart(cart) });
    } catch (error) {
        console.error('Shopify cart fetch failed:', error);
        return json({ success: false, message: 'Failed to fetch cart.' }, 500);
    }
};

export const POST = async ({ request, locals }) => {
    try {
        const body = await request.json();
        const handle = body.handle;
        const quantity = Number(body.quantity) > 0 ? Number(body.quantity) : 1;
        const cartId = body.cartId || null;

        if (!handle) {
            return json({ success: false, message: 'Missing product handle.' }, 400);
        }

        const product = await getVariantByHandle(locals, handle);
        if (!product?.variant?.id) {
            return json({ success: false, message: 'Could not find a purchasable variant for that product.' }, 404);
        }

        const result = cartId
            ? await addCartLines(locals, cartId, product.variant.id, quantity)
            : await createCart(locals, product.variant.id, quantity);

        const messages = collectMessages(result);
        if (messages.length > 0 && !result.cart) {
            return json({ success: false, message: messages[0] }, 400);
        }

        return json({
            success: true,
            message: messages[0] || `${product.productTitle} added to cart.`,
            cart: normalizeCart(result.cart),
        });
    } catch (error) {
        console.error('Shopify cart mutation failed:', error);
        return json({
            success: false,
            message: error instanceof Error ? error.message : 'Failed to update cart.',
        }, 500);
    }
};
