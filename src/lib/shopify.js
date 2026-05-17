const DEFAULT_API_VERSION = '2025-07';

function getShopifyConfig(locals) {
    const env = locals.runtime?.env;
    const domain = import.meta.env.SHOPIFY_STORE_DOMAIN || env?.SHOPIFY_STORE_DOMAIN;
    const storefrontToken = import.meta.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || env?.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
    const apiVersion = import.meta.env.SHOPIFY_STOREFRONT_API_VERSION || env?.SHOPIFY_STOREFRONT_API_VERSION || DEFAULT_API_VERSION;

    if (!domain || !storefrontToken) {
        throw new Error('Missing Shopify configuration. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.');
    }

    const normalizedDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
    return {
        domain: normalizedDomain,
        storefrontToken,
        apiVersion,
    };
}

async function shopifyRequest(locals, query, variables = {}) {
    const { domain, storefrontToken, apiVersion } = getShopifyConfig(locals);
    const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Storefront-Access-Token': storefrontToken,
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`Shopify request failed with status ${response.status}: ${text}`);
    }

    const payload = await response.json();
    if (payload.errors?.length) {
        throw new Error(payload.errors.map((error) => error.message).join('; '));
    }

    return payload.data;
}

function stripHtml(value = '') {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

const CART_FIELDS = `
    id
    checkoutUrl
    totalQuantity
    cost {
        subtotalAmount {
            amount
            currencyCode
        }
    }
    lines(first: 20) {
        nodes {
            id
            quantity
            merchandise {
                ... on ProductVariant {
                    id
                    title
                    product {
                        title
                        handle
                    }
                    price {
                        amount
                        currencyCode
                    }
                    image {
                        url
                        altText
                    }
                }
            }
        }
    }
`;

export async function getCart(locals, cartId) {
    const data = await shopifyRequest(locals, `
        query GetCart($cartId: ID!) {
            cart(id: $cartId) {
                ${CART_FIELDS}
            }
        }
    `, { cartId });

    return data.cart;
}

export async function getProducts(locals, limit = 12) {
    const data = await shopifyRequest(locals, `
        query GetProducts($first: Int!) {
            products(first: $first, sortKey: BEST_SELLING) {
                nodes {
                    id
                    handle
                    title
                    description
                    featuredImage {
                        url
                        altText
                    }
                    priceRange {
                        minVariantPrice {
                            amount
                            currencyCode
                        }
                    }
                    variants(first: 10) {
                        nodes {
                            id
                            title
                            availableForSale
                            image {
                                url
                                altText
                            }
                        }
                    }
                }
            }
        }
    `, { first: limit });

    return data.products.nodes
        .map((product) => {
            const firstAvailableVariant = product.variants.nodes.find((variant) => variant.availableForSale);
            const featuredImage = firstAvailableVariant?.image || product.featuredImage;

            return {
                id: product.id,
                name: product.title,
                priceAmount: product.priceRange?.minVariantPrice?.amount || null,
                currencyCode: product.priceRange?.minVariantPrice?.currencyCode || null,
                description: stripHtml(product.description).slice(0, 140),
                image: featuredImage?.url || null,
                imageAlt: featuredImage?.altText || product.title,
                shopifyHandle: product.handle,
                availableForSale: Boolean(firstAvailableVariant),
            };
        })
        .filter((product) => product.availableForSale);
}

export async function getVariantByHandle(locals, handle) {
    const data = await shopifyRequest(locals, `
        query GetProductVariantByHandle($handle: String!) {
            product(handle: $handle) {
                title
                handle
                variants(first: 10) {
                    nodes {
                        id
                        title
                        availableForSale
                        price {
                            amount
                            currencyCode
                        }
                        image {
                            url
                            altText
                        }
                    }
                }
            }
        }
    `, { handle });

    const product = data.product;
    if (!product) {
        return null;
    }

    const variant = product.variants.nodes.find((item) => item.availableForSale) || product.variants.nodes[0];
    if (!variant) {
        return null;
    }

    return {
        productTitle: product.title,
        productHandle: product.handle,
        variant,
    };
}

export async function createCart(locals, merchandiseId, quantity) {
    const data = await shopifyRequest(locals, `
        mutation CreateCart($lines: [CartLineInput!]) {
            cartCreate(input: { lines: $lines }) {
                cart {
                    ${CART_FIELDS}
                }
                userErrors {
                    field
                    message
                }
                warnings {
                    code
                    message
                }
            }
        }
    `, {
        lines: [{ merchandiseId, quantity }],
    });

    return data.cartCreate;
}

export async function addCartLines(locals, cartId, merchandiseId, quantity) {
    const data = await shopifyRequest(locals, `
        mutation AddCartLines($cartId: ID!, $lines: [CartLineInput!]!) {
            cartLinesAdd(cartId: $cartId, lines: $lines) {
                cart {
                    ${CART_FIELDS}
                }
                userErrors {
                    field
                    message
                }
                warnings {
                    code
                    message
                }
            }
        }
    `, {
        cartId,
        lines: [{ merchandiseId, quantity }],
    });

    return data.cartLinesAdd;
}
