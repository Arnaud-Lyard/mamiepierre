import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

const locales = ['en', 'fr'];
const privateUrls = ['/admin', '/profile'];

async function importKey() {
  const alg = 'RS256';
  const spki = process.env.JWT_PUBLIC_KEY!;
  const publicKey = await jose.importSPKI(spki, alg);
  return publicKey;
}

function getLocale(request: NextRequest) {
  let headers = {
    'accept-language':
      request.headers.get('accept-language') || 'fr-FR,en;q=0.5',
  };
  let languages = new Negotiator({ headers }).languages();
  let defaultLocale = 'fr';

  return match(languages, locales, defaultLocale);
}

async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('access_token' as any)?.value;
  if (token) {
    try {
      const key = await importKey();
      const { payload } = await jose.jwtVerify(token, key);
      if (payload.sub) return NextResponse.next();
    } catch (e) {}
  }
  return NextResponse.redirect(new URL('/home', request.url));
}

async function i18nMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
}

export async function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.startsWith('/fr/user') ||
    request.nextUrl.pathname.startsWith('/en/user')
  ) {
    return await authMiddleware(request);
  }
  return await i18nMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image/assets/images|favicon.ico).*)',
    '/((?!_next).*)',
  ],
};
