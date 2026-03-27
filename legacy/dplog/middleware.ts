import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logInfo, logWarn } from './src/utils/logger';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  logInfo(`[Middleware] 현재 경로: ${path}`);

  // API 라우트는 별도 처리하지 않음
  if (path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // 정적 파일들은 검증하지 않음
  if (path.startsWith('/_next/') || path === '/favicon.ico') {
    return NextResponse.next();
  }

  // 공개 경로: "/" "/join" "/login" "/kakao"는 항상 허용
  const PUBLIC_PATHS = ['/', '/join', '/login', '/kakao'];
  if (PUBLIC_PATHS.includes(path) || path.startsWith('/kakao/')) {
    logInfo(`[Middleware] ▶ 공개 페이지 접근 허용: ${path}`);
    return NextResponse.next();
  }

  // 보호된 경로: JSESSIONID 쿠키 존재 여부만 확인
  const sessionCookie = request.cookies.get('JSESSIONID');
  if (!sessionCookie) {
    logWarn(`[Middleware] ⚠️ 보호 페이지(${path}) → 세션 쿠키 없음 → "/"로 리다이렉트`);
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 쿠키가 있으면 통과 (실제 인증은 클라이언트에서 처리)
  logInfo(`[Middleware] ✅ 세션 쿠키 존재 → 접근 허용: ${path}`);
  return NextResponse.next();
}

// 미들웨어 적용 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
