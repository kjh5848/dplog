/**
 * MSW 초기화 함수
 *
 * 환경변수 NEXT_PUBLIC_MSW_ENABLED가 'true'일 때만 활성화됩니다.
 * 브라우저/서버 환경을 자동으로 감지하여 적절한 워커를 시작합니다.
 */
export async function initMocks(): Promise<void> {
  const isMswEnabled = process.env.NEXT_PUBLIC_MSW_ENABLED === 'true';

  if (!isMswEnabled) {
    return;
  }

  if (typeof window !== 'undefined') {
    // 브라우저 환경: Service Worker 등록
    const { worker } = await import('./browser');
    await worker.start({
      onUnhandledRequest: 'bypass', // 미등록 요청은 실제 서버로 전달
    });
    console.log('[MSW] 브라우저 목킹이 활성화되었습니다.');
  } else {
    // Node.js(SSR) 환경: 서버 수신 시작
    const { server } = await import('./server');
    server.listen({
      onUnhandledRequest: 'bypass',
    });
    console.log('[MSW] 서버 사이드 목킹이 활성화되었습니다.');
  }
}
