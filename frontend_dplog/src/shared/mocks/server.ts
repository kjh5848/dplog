import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * Node.js(SSR) 환경 MSW 서버
 *
 * Server-Side Rendering 시 API 요청을 가로챕니다.
 * 테스트 환경에서도 활용됩니다.
 */
export const server = setupServer(...handlers);
