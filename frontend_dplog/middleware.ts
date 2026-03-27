import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js 미들웨어 — JWT 기반 라우트 보호
 *
 * Zustand persist는 localStorage를 사용하므로 Edge Runtime에서 직접 접근 불가.
 * 대신 `dplog-auth-flag` 쿠키를 활용하여 인증 상태를 판별합니다.
 *
 * 쿠키 설정/삭제는 useAuthStore의 loginWithKakao/logout에서 처리합니다.
 */

/** 인증 없이 접근 가능한 경로 */
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

/** 정적 리소스 경로 패턴 */
const STATIC_PATTERNS = [
  '/_next/',
  '/favicon.ico',
  '/api/',
  '/mockServiceWorker.js',
];

/** 인증 쿠키 이름 */
const AUTH_COOKIE_NAME = 'dplog-auth-flag';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 리소스 무시
  if (STATIC_PATTERNS.some((pattern) => pathname.startsWith(pattern))) {
    return NextResponse.next();
  }

  // 공개 경로 허용
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // 보호된 경로: dplog-auth-flag 쿠키로 인증 상태 확인
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  if (!authCookie) {
    // 비로그인 상태 → 로그인 페이지로 리다이렉트 (원래 경로를 redirect 파라미터로 전달)
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 정적 파일 및 이미지 최적화를 제외한 모든 경로에 매칭:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico (파비콘)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
