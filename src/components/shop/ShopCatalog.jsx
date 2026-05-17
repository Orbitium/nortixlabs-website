import React, { useEffect, useState } from 'react';

const CART_STORAGE_KEY = 'nortixlabs-shopify-cart-id';
const FALLBACK_IMAGE = '/og-image.png';

export default function ShopCatalog({ products, labels }) {
    const [cart, setCart] = useState(null);
    const [pendingHandle, setPendingHandle] = useState('');
    const [status, setStatus] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const cartId = window.localStorage.getItem(CART_STORAGE_KEY);
        if (!cartId) {
            return;
        }

        let isMounted = true;

        fetch(`/api/shopify/cart?cartId=${encodeURIComponent(cartId)}`)
            .then(async (response) => {
                const payload = await response.json();
                if (!response.ok) {
                    throw new Error(payload.message || 'Failed to load cart.');
                }

                if (!isMounted) {
                    return;
                }

                setCart(payload.cart);
                if (!payload.cart) {
                    window.localStorage.removeItem(CART_STORAGE_KEY);
                }
            })
            .catch(() => {
                if (!isMounted) {
                    return;
                }

                window.localStorage.removeItem(CART_STORAGE_KEY);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const addToCart = async (handle) => {
        setPendingHandle(handle);
        setStatus('');
        setError('');

        try {
            const response = await fetch('/api/shopify/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    handle,
                    quantity: 1,
                    cartId: cart?.id || window.localStorage.getItem(CART_STORAGE_KEY),
                }),
            });

            const payload = await response.json();
            if (!response.ok || !payload.success) {
                throw new Error(payload.message || labels.errorFallback);
            }

            setCart(payload.cart);
            setStatus(payload.message || labels.addedToCart);
            if (payload.cart?.id) {
                window.localStorage.setItem(CART_STORAGE_KEY, payload.cart.id);
            }
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : labels.errorFallback);
        } finally {
            setPendingHandle('');
        }
    };

    return (
        <div className="relative">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => {
                    const isPending = pendingHandle === product.shopifyHandle;

                    return (
                        <article key={product.shopifyHandle} className="glass-card overflow-hidden rounded-[28px]">
                            <div className="aspect-[4/3] overflow-hidden bg-slate-900">
                                <img
                                    src={product.image || FALLBACK_IMAGE}
                                    alt={product.imageAlt || product.name}
                                    className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                                    loading="lazy"
                                />
                            </div>

                            <div className="space-y-4 p-5">
                                <div className="flex items-end justify-between gap-4">
                                    <h2 className="text-xl font-semibold text-white">{product.name}</h2>
                                    <p className="text-lg font-semibold text-cyan-300">
                                        {product.priceAmount && product.currencyCode
                                            ? new Intl.NumberFormat(undefined, {
                                                style: 'currency',
                                                currency: product.currencyCode,
                                            }).format(Number(product.priceAmount))
                                            : ''}
                                    </p>
                                </div>

                                <p className="text-sm leading-6 text-slate-400">
                                    {product.description}
                                </p>

                                <button
                                    type="button"
                                    className="w-full rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/60 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    onClick={() => addToCart(product.shopifyHandle)}
                                    disabled={isPending}
                                >
                                    {isPending ? labels.adding : labels.addToCart}
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            {(status || error) && (
                <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${error ? 'border-rose-400/30 bg-rose-400/10 text-rose-100' : 'border-cyan-400/30 bg-cyan-400/10 text-cyan-50'}`}>
                    {error || status}
                </div>
            )}

            {cart?.checkoutUrl && (
                <div className="fixed bottom-5 right-5 z-40 w-[min(22rem,calc(100%-2rem))] rounded-[24px] border border-white/10 bg-slate-950/92 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
                                {labels.cartLabel}
                            </p>
                            <p className="mt-2 text-lg font-semibold text-white">
                                {cart.totalQuantity} {cart.totalQuantity === 1 ? labels.itemSingular : labels.itemPlural}
                            </p>
                            {cart.subtotal?.amount && (
                                <p className="mt-1 text-sm text-slate-400">
                                    {labels.subtotal}: {new Intl.NumberFormat(undefined, {
                                        style: 'currency',
                                        currency: cart.subtotal.currencyCode,
                                    }).format(Number(cart.subtotal.amount))}
                                </p>
                            )}
                        </div>

                        <a
                            href={cart.checkoutUrl}
                            className="rounded-full border border-cyan-400/40 bg-cyan-400/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-cyan-300/70 hover:bg-cyan-400/25"
                        >
                            {labels.checkout}
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}
