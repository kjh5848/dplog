import { http, HttpResponse, type RequestHandler } from 'msw';

/**
 * MSW 핸들러 정의
 *
 * Phase별로 핸들러를 추가합니다:
 * - Phase 0: 기본 헬스체크
 * - Phase 1: 인증 API (authHandlers)
 * - Phase 2: 가게/키워드 API (storeHandlers)
 * - Phase 3: 진단/순위 API
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

// ─── 기본 핸들러 (헬스체크) ──────────────────────────────────

const baseHandlers: RequestHandler[] = [
  http.get(`${API_BASE}/health`, () => {
    return HttpResponse.json({
      success: true,
      data: { status: 'UP', timestamp: new Date().toISOString() },
      timestamp: new Date().toISOString(),
    });
  }),
];

// ─── Phase 1: 인증 핸들러 ───────────────────────────────────

/** 목 유저 데이터 */
const MOCK_USER = {
  id: 'user-001',
  email: 'owner@dplog.co.kr',
  nickname: '사장님',
  name: '김디플',
  profileImageUrl: null,
  provider: 'KAKAO' as const,
  providerId: 'kakao-12345',
  createdAt: '2026-01-15T09:00:00Z',
};

/** 목 JWT 토큰 */
const MOCK_TOKENS = {
  accessToken: 'mock-access-token-xxxxxxxx',
  refreshToken: 'mock-refresh-token-yyyyyyyy',
};

const authHandlers: RequestHandler[] = [
  // 카카오 로그인
  http.post(`${API_BASE}/v1/auth/kakao/login`, async () => {
    return HttpResponse.json({
      success: true,
      data: {
        tokens: MOCK_TOKENS,
        user: MOCK_USER,
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 현재 유저 정보 조회
  http.get(`${API_BASE}/v1/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'AUTH_001', message: '인증이 필요합니다.' },
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: MOCK_USER,
      timestamp: new Date().toISOString(),
    });
  }),

  // 토큰 갱신
  http.post(`${API_BASE}/v1/auth/refresh`, async () => {
    return HttpResponse.json({
      success: true,
      data: {
        tokens: {
          accessToken: `mock-access-token-${Date.now()}`,
          refreshToken: `mock-refresh-token-${Date.now()}`,
        },
      },
      timestamp: new Date().toISOString(),
    });
  }),

  // 로그아웃
  http.post(`${API_BASE}/v1/auth/logout`, async () => {
    return HttpResponse.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }),
];

// ─── Phase 2: 가게/키워드 핸들러 ────────────────────────────

/** 목 가게 저장소 (인메모리) */
let mockStoreIdCounter = 1;
const mockStores: Record<number, {
  id: number;
  name: string;
  category: string;
  address: string;
  placeUrl: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}> = {};

/** 목 키워드 세트 저장소 */
let mockKeywordSetIdCounter = 1;
const mockKeywordSets: Record<number, {
  id: number;
  storeId: number;
  keywords: string;
  validationInfo: string | null;
  createdAt: string;
}[]> = {};

const storeHandlers: RequestHandler[] = [
  // 가게 등록
  http.post(`${API_BASE}/v1/stores`, async ({ request }) => {
    const body = await request.json() as Record<string, string>;
    const now = new Date().toISOString();
    const store = {
      id: mockStoreIdCounter++,
      name: body.name,
      category: body.category,
      address: body.address,
      placeUrl: body.placeUrl || null,
      phone: body.phone || null,
      createdAt: now,
      updatedAt: now,
    };
    mockStores[store.id] = store;
    return HttpResponse.json(
      { success: true, data: store, timestamp: now },
      { status: 201 },
    );
  }),

  // 내 가게 목록 조회
  http.get(`${API_BASE}/v1/stores/me`, () => {
    const stores = Object.values(mockStores);
    return HttpResponse.json({
      success: true,
      data: stores,
      timestamp: new Date().toISOString(),
    });
  }),

  // 가게 단건 조회
  http.get(`${API_BASE}/v1/stores/:storeId`, ({ params }) => {
    const storeId = Number(params.storeId);
    const store = mockStores[storeId];

    if (!store) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'STORE_NOT_FOUND', message: '가게를 찾을 수 없습니다.' },
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    return HttpResponse.json({
      success: true,
      data: store,
      timestamp: new Date().toISOString(),
    });
  }),

  // 가게 수정
  http.put(`${API_BASE}/v1/stores/:storeId`, async ({ params, request }) => {
    const storeId = Number(params.storeId);
    const store = mockStores[storeId];

    if (!store) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'STORE_NOT_FOUND', message: '가게를 찾을 수 없습니다.' },
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }

    const body = await request.json() as Record<string, string>;
    const now = new Date().toISOString();

    // 부분 수정: null이 아닌 필드만 업데이트
    if (body.name !== undefined) store.name = body.name;
    if (body.category !== undefined) store.category = body.category;
    if (body.address !== undefined) store.address = body.address;
    if (body.placeUrl !== undefined) store.placeUrl = body.placeUrl || null;
    if (body.phone !== undefined) store.phone = body.phone || null;
    store.updatedAt = now;

    return HttpResponse.json({
      success: true,
      data: store,
      timestamp: now,
    });
  }),

  // 키워드 세트 생성
  http.post(`${API_BASE}/v1/stores/:storeId/keyword-sets`, async ({ params, request }) => {
    const storeId = Number(params.storeId);
    const body = await request.json() as Record<string, string>;
    const now = new Date().toISOString();

    const keywordSet = {
      id: mockKeywordSetIdCounter++,
      storeId,
      keywords: body.keywords,
      validationInfo: null,
      createdAt: now,
    };

    if (!mockKeywordSets[storeId]) {
      mockKeywordSets[storeId] = [];
    }
    mockKeywordSets[storeId].push(keywordSet);

    return HttpResponse.json(
      { success: true, data: keywordSet, timestamp: now },
      { status: 201 },
    );
  }),

  // 키워드 세트 조회
  http.get(`${API_BASE}/v1/stores/:storeId/keyword-sets`, ({ params }) => {
    const storeId = Number(params.storeId);
    const sets = mockKeywordSets[storeId] ?? [];

    return HttpResponse.json({
      success: true,
      data: sets,
      timestamp: new Date().toISOString(),
    });
  }),
];

// ─── Phase 2: 키워드 추천 핸들러 ─────────────────────────────

const keywordSuggestHandlers: RequestHandler[] = [
  // 연관 키워드 추천
  http.get(`${API_BASE}/v1/keywords/suggest`, ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword') ?? '';

    // 키워드에 기반한 목 추천 데이터
    const suggestions = [
      { keyword: `${keyword} 맛집`, monthlyPcSearchCount: '12400', monthlyMobileSearchCount: '45600', competitionIndex: '높음' },
      { keyword: `${keyword} 추천`, monthlyPcSearchCount: '8200', monthlyMobileSearchCount: '32100', competitionIndex: '중간' },
      { keyword: `${keyword} 인기`, monthlyPcSearchCount: '5600', monthlyMobileSearchCount: '21800', competitionIndex: '낮음' },
      { keyword: `${keyword} 순위`, monthlyPcSearchCount: '3200', monthlyMobileSearchCount: '15400', competitionIndex: '중간' },
      { keyword: `${keyword} 후기`, monthlyPcSearchCount: '7800', monthlyMobileSearchCount: '28900', competitionIndex: '높음' },
    ];

    return HttpResponse.json({
      success: true,
      data: { hintKeyword: keyword, keywords: suggestions },
      timestamp: new Date().toISOString(),
    });
  }),
];

// ─── Phase 3: 순위 핸들러 (MSW 목데이터) ──────────────────

/** 목 키워드 순위 데이터 */
const MOCK_RANKING_KEYWORDS = ['강남 맛집', '강남역 점심', '테헤란로 카페', '역삼동 술집', '강남 데이트'];

/** 순위 랜덤 생성 유틸 */
function mockRank(base: number, variance: number): number {
  return Math.max(1, Math.min(50, base + Math.floor(Math.random() * variance * 2) - variance));
}

const rankingHandlers: RequestHandler[] = [
  // 최신 순위 스냅샷
  http.get(`${API_BASE}/v1/stores/:storeId/rankings`, () => {
    const now = new Date().toISOString();
    const items = MOCK_RANKING_KEYWORDS.map((keyword, idx) => {
      const rank = [3, 7, 2, 12, 5][idx];
      const delta = [2, -1, 0, 3, -2][idx];
      const searchVolume = [58000, 32000, 15400, 8200, 42000][idx];
      const competition: ('높음' | '중간' | '낮음')[] = ['높음', '중간', '낮음', '낮음', '높음'];
      return {
        keyword,
        rank,
        delta,
        searchVolume,
        competition: competition[idx],
        bestRank: Math.min(rank, rank - Math.abs(delta)),
        lastCheckedAt: now,
      };
    });

    return HttpResponse.json({
      success: true,
      data: {
        storeId: 1,
        storeName: '디플로그 강남점',
        items,
        checkedAt: now,
      },
      timestamp: now,
    });
  }),

  // 순위 추이 (7일간)
  http.get(`${API_BASE}/v1/stores/:storeId/rankings/history`, () => {
    const today = new Date();
    const baseRanks = [3, 7, 2, 12, 5];
    const trends = Array.from({ length: 7 }, (_, dayIdx) => {
      const date = new Date(today);
      date.setDate(date.getDate() - (6 - dayIdx));
      const dateStr = date.toISOString().split('T')[0];
      
      const point: Record<string, string | number> = { date: dateStr };
      MOCK_RANKING_KEYWORDS.forEach((kw, kwIdx) => {
        point[kw] = mockRank(baseRanks[kwIdx], 3);
      });
      return point;
    });

    // 마지막 날은 현재 순위로 고정
    const lastDay = trends[trends.length - 1];
    MOCK_RANKING_KEYWORDS.forEach((kw, idx) => {
      lastDay[kw] = baseRanks[idx];
    });

    return HttpResponse.json({
      success: true,
      data: {
        storeId: 1,
        keywords: MOCK_RANKING_KEYWORDS,
        trends,
      },
      timestamp: new Date().toISOString(),
    });
  }),
];

// ─── 모든 핸들러 병합 ────────────────────────────────────────

export const handlers: RequestHandler[] = [
  ...baseHandlers,
  ...authHandlers,
  ...storeHandlers,
  ...keywordSuggestHandlers,
  ...rankingHandlers,
];
