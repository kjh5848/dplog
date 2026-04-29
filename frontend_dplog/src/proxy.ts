import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Proxy - account and local app route protection.
 *
 * Zustand persist uses localStorage and is not readable at request time.
 * Use either the HttpOnly `DPL_SESSION` cookie from the Spring backend or
 * the lightweight `dplog-auth-flag` cookie used for client-side transitions.
 */

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/kakao/callback',
  '/terms',
  '/privacy',
  '/marketing',
  '/showcase',
  '/phase1-setup',
  '/phase2-simulator',
  '/phase3-location',
  '/phase4-contract',
  '/phase4-roadmap',
  '/phase5-dday',
];

const STATIC_PATTERNS = [
  '/_next/',
  '/favicon.ico',
  '/api/',
  '/mockServiceWorker.js',
];

const AUTH_COOKIE_NAME = 'dplog-auth-flag';
const SESSION_COOKIE_NAME = 'DPL_SESSION';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_PATTERNS.some((pattern) => pathname.startsWith(pattern))) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!authCookie && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
