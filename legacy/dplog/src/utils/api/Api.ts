// // 1. API 기본 URL을 환경 변수에서 가져옵니다.
// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// /**
//  * 서버와 클라이언트 모두에서 안전하게 API를 호출하는 fetch 래퍼 함수
//  * @param path - /api/membership/list 와 같은 API 경로
//  * @param options - fetch에 전달할 옵션 (method, headers, body 등)
//  */
// async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
//   // 2. 환경 변수가 설정되지 않았을 경우, 개발자가 실수를 빨리 알아차리도록 에러를 발생시킵니다.
//   if (!API_BASE_URL) {
//     throw new Error('환경 변수 파일(.env.local)에 NEXT_PUBLIC_API_URL이 정의되지 않았습니다.');
//   }

//   // 3. URL 객체를 사용하여 안전하게 절대 경로를 생성합니다.
//   // 예: new URL('/api/membership/list', 'http://localhost:8080')
//   // 결과 => http://localhost:8080/api/membership/list
//   const fullUrl = new URL(path, API_BASE_URL).href;

//   // 디버깅을 위해 최종 요청 URL을 로그로 남깁니다.
//   console.log(`Requesting full URL: ${fullUrl}`);

//   // 4. 생성된 절대 경로로 fetch를 실행합니다.
//   const res = await fetch(fullUrl, {
//       headers: { Accept: "application/json", ...(options?.headers || {}) },
//       cache: "no-store",
//       ...options,
//     });

//   if (!res.ok) {
//     throw new Error(`API error: ${res.status} ${res.statusText}`);
//   }

//   return res.json() as Promise<T>;
// }

// // 기존 Api 객체 구조를 유지하면서 새로운 fetch 함수를 사용하도록 합니다.
// export const Api = {
//   fetch: fetchApi,
// };