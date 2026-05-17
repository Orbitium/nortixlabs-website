import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const host = context.url.hostname.toLowerCase();
  const pathname = context.url.pathname;

  if (host === 'akademiz.nortixlabs.com') {
    const isStaticAsset =
      pathname.startsWith('/_astro/') ||
      pathname.startsWith('/.well-known/') ||
      pathname.startsWith('/akademiz/') ||
      pathname === '/favicon.ico' ||
      pathname === '/favicon.png' ||
      pathname === '/favicon.svg' ||
      pathname === '/robots.txt' ||
      /\.[a-z0-9]+$/i.test(pathname);

    if (!isStaticAsset) {
      const prefersTurkish = (context.request.headers.get('accept-language') ?? '')
        .toLowerCase()
        .includes('tr');
      const rewriteUrl = new URL(
        prefersTurkish ? '/tr/akademiz/get' : '/akademiz/get',
        context.url,
      );
      rewriteUrl.searchParams.set('target', `${pathname}${context.url.search}`);
      return context.rewrite(rewriteUrl);
    }
  }

  const response = await next();

  if (context.url.pathname.startsWith('/akademiz/admin')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
});
