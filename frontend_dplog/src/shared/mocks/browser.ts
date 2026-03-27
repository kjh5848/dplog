import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/**
 * 브라우저 환경 MSW 워커
 *
 * Service Worker를 등록하여 브라우저에서 API 요청을 가로챕니다.
 */
export const worker = setupWorker(...handlers);
