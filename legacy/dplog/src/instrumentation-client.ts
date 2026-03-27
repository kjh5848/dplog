// 이 파일은 클라이언트에서 Sentry의 라우터 전환 추적을 구성합니다.
// Sentry 초기화는 sentry.client.config.ts에서 처리됩니다.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

// 라우터 전환 시작 시 추적
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
