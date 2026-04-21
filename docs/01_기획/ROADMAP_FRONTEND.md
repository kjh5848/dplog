# D-PLOG 프론트엔드 로드맵 (상세)

> 통합 로드맵: [`ROADMAP.md`](./ROADMAP.md)
> 백엔드 로드맵: [`ROADMAP_BACKEND.md`](./ROADMAP_BACKEND.md)
> 워크플로우: `/implement-fsd-feature` (`.agent/workflows/implement-fsd-feature.md`)
> 스킬 가이드: `.agent/skills/implement-fsd-feature/SKILL.md`
> 마지막 업데이트: 2026-03-04

---

## ⚠️ 이관 원칙

> [!IMPORTANT]
> 레거시 프론트엔드(`legacy/dplog`)의 **UI/비즈니스 로직은 최대한 활용** 하되,
> 현재 `frontend_dplog`의 **FSD(Feature-Sliced Design) 아키텍처 구조에 맞게 재구성** 해야 합니다.

| 항목 | 레거시 (`legacy/dplog`) | 현재 (`frontend_dplog`) |
|------|------------------------|------------------------|
| 아키텍처 | 플랫 구조 (components/, features/, hooks/) | **FSD** (app/, features/, entities/, shared/) |
| 컴포넌트 배치 | `components/nplrace/rank/` 등 도메인별 | `features/{domain}/ui/` 하위에 배치 |
| 상태 관리 | `store/` (19개, Zustand) | `features/{domain}/store/` 또는 `features/{domain}/model/` |
| 뷰모델 | `viewModel/` (13개) | `features/{domain}/model/` 에 통합 |
| API 호출 | `app/api/` (Next.js Route Handler) | `features/{domain}/api/` + `shared/api/` |
| 훅 | `hooks/` (7개, 글로벌) | `shared/hooks/` 또는 `features/{domain}/` 내부 |
| 유틸 | `utils/` (19개, 글로벌) | `shared/lib/` 또는 `shared/utils/` |
| 타입 | `types/` (16개, 글로벌) | `features/{domain}/model/types.ts` 또는 `shared/types/` |
| 스타일 | Tailwind CSS (tailwind.config.ts) | Vanilla CSS + Deep Tech 디자인 시스템 |

**이관 규칙:**
1. 레거시 컴포넌트의 **UI 디자인과 비즈니스 로직** 을 참고하여 구현
2. **FSD 레이어 규칙** 을 준수하여 배치 (`app` → `features` → `entities` → `shared`)
3. 레거시의 Tailwind CSS → 현재 프로젝트의 **Vanilla CSS + 디자인 토큰** 으로 변환
4. 레거시의 글로벌 `store/`, `hooks/`, `utils/` → **feature 내부로 캡슐화** (공통인 것만 `shared/`)
5. 레거시의 `viewModel/` 패턴 → FSD의 `model/` 레이어로 통합
6. 새 기능 구현 시 **`/implement-fsd-feature` 워크플로우** 를 반드시 따를 것

**참고 레퍼런스:**
| 문서 | 경로 | 내용 |
|------|------|------|
| FSD 아키텍처 | `.agent/skills/implement-fsd-feature/references/01_architecture_fsd.md` | FSD 레이어 계층, 단방향 의존성, ViewModel 분리 |
| 디자인 시스템 | `.agent/skills/implement-fsd-feature/references/02_ui_design_system.md` | Deep Tech SaaS 브랜드, 다크모드, 글래스모피즘 |
| 백엔드 연동 | `.agent/skills/implement-fsd-feature/references/03_backend_integration.md` | REST API 통신, 비동기 폴링, 롱폴링 상태 관리 |
| 레거시 마이그레이션 | `.agent/skills/implement-fsd-feature/references/04_legacy_migration.md` | 레거시 컴포넌트 해체 → FSD 리팩토링 가이드 |

---

## 각 Phase 구현 순서

> 모든 feature는 다음 순서를 따른다:
> **타입 정의 → API 클라이언트 → ViewModel/Store → UI 컴포넌트 → 페이지 라우트 → 테스트**

---

## Phase 0: 인프라 셋업 (1~2일)

1. **공통 API 클라이언트 셋업** (`shared/api/`)
   - Axios/fetch 래퍼 + 인터셉터 (baseURL, Authorization 헤더)
   - `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_KAKAO_CLIENT_ID` 환경변수 바인딩
   - 공통 에러 핸들러 (`shared/api/error-handler.ts`)
2. **공통 타입 정의** (`shared/types/`)
   - `ResDTO<T>` 응답 타입 (백엔드 래퍼 대응)
   - API 에러 타입, 페이지네이션 타입
3. **환경변수 정리** (`.env.local`, `.env.production`)
4. **MSW(Mock Service Worker) 셋업**
   - 백엔드 API 명세 기반 목 핸들러 작성
   - `shared/mocks/handlers.ts` — Phase별로 핸들러 추가
5. **레거시 공통 컴포넌트 분석 및 FSD 이관 대상 선정**
   - `legacy/dplog/components/common/` (25개) → `shared/ui/` 로 이식 검토
   - Tailwind → Vanilla CSS + 디자인 토큰 변환 규칙 확정

---

## Phase 1: 인증 시스템 (3~4일)

> 레거시 참고: `legacy/dplog/src/app/(home)/(auth)`

1. **타입 정의** (`features/auth/model/types.ts`)
   - `User`, `LoginRequest`, `LoginResponse`, `TokenPair` 타입
2. **API 클라이언트** (`features/auth/api/`)
   - `authApi.ts` — `POST /v1/auth/kakao/login`, `GET /v1/auth/me`, `POST /v1/auth/logout`, `POST /v1/auth/refresh`
3. **상태 관리** (`features/auth/model/`)
   - `useAuthStore.ts` — JWT 토큰 저장/갱신/삭제, 유저 상태
   - 토큰 저장 전략: httpOnly cookie 또는 메모리
4. **API 인터셉터 설정** (`shared/api/`)
   - Authorization 헤더 자동 추가
   - 401 응답 시 토큰 갱신 → 실패 시 로그아웃
5. **UI 컴포넌트** (`features/auth/ui/`)
   - `KakaoLoginButton.tsx` — 카카오 OIDC 로그인 버튼
   - `LoginForm.tsx` — 로그인 페이지 UI
   - `SignupForm.tsx` — 회원가입 UI (기존 구현 수정)
6. **페이지 라우트** (`app/(auth)/`)
   - `login/page.tsx`, `signup/page.tsx`
   - 카카오 콜백 처리 페이지
7. **이용약관/개인정보처리방침** (`app/(home)/`)
   - 레거시 참고: `(home)/TermsOfService/`, `(home)/privacyPolicy/`
8. **Next.js 미들웨어** (`middleware.ts`)
   - 인증 필요 페이지 보호 (레거시 `middleware.ts` 참고)
   - 미로그인 시 리다이렉트

---

## Phase 2: 가게 등록 + 키워드 (3~5일)

> ⚠️ 백엔드 API 상태: CRUD ✅ 완료 / 내순이 연동 ❌ 미완 / nsearchad ❌ 미완
> 자세한 내용: [`ROADMAP_BACKEND.md` Phase 2](./ROADMAP_BACKEND.md#phase-2-가게-등록--키워드-35일)

1. **타입 정의** (`features/store/model/types.ts`)
   - `Store`, `StoreCreateRequest`, `KeywordSet`, `KeywordSuggestion` 타입
2. **API 클라이언트** (`features/store/api/`)
   - `storeApi.ts`:
     - `POST /v1/stores` — 가게 등록 ✅ 백엔드 완료
     - `GET /v1/stores/{id}` — 가게 조회 ✅ 백엔드 완료
     - `PUT /v1/stores/{id}` — 가게 수정 ✅ 백엔드 완료
     - `GET /v1/stores/me` — 내 가게 목록 ✅ 백엔드 완료 (보너스)
   - `keywordApi.ts`:
     - `POST /v1/stores/{id}/keyword-sets` — 키워드 저장 ✅ 백엔드 완료
     - `GET /v1/stores/{id}/keyword-sets` — 키워드 목록 ✅ 백엔드 완료 (보너스)
3. **ViewModel** (`features/store/model/`)
   - `useStoreRegistration.ts` — 가게 등록 폼 로직, 플레이스 URL 파싱
   - `useKeywordInput.ts` — 키워드 입력/검색/추천 로직
4. **온보딩 API 연동** (`features/onboarding/`)
   - `BusinessInfoStep` → `POST /v1/stores` (MSW 목 → 실제 API 교체)
   - `KeywordStrategyStep` → `POST /v1/stores/{storeId}/keyword-sets`
5. **키워드 검색/추천 UI** (`features/store/ui/`)
   - `KeywordSearchInput.tsx` — 검색어 입력 + 자동완성
   - `KeywordSuggestionList.tsx` — 네이버 검색광고 연관 키워드 표시
   - 레거시 참고: `components/nplrace/keywordSearch/`
6. **로딩/에러 상태 처리**
   - 스켈레턴 로더, 에러 토스트, 재시도 버튼
7. **내순이 연동 후 UX 변경 예정** ⏳
   - 가게 등록 폼: placeUrl만 입력 → 내순이 `getTrackable` → 가게명/카테고리/주소/이미지 자동 채움
   - 수동 입력 → 자동 채움 전환 UX (로딩 스피너 + 편집 가능 필드)

---

## Phase 3: 순위 조회 + 비동기 잡 (5~7일)

> 레거시 참고: `components/nplrace/rank/` (40개 컴포넌트)

1. **타입 정의** (`features/diagnosis/model/types.ts`)
   - `DiagnosisRequest`, `DiagnosisStatus`, `RankingSnapshot`, `RankingItem` 타입
2. **API 클라이언트** (`features/diagnosis/api/`)
   - `diagnosisApi.ts` — `POST /v1/diagnosis`, `GET /v1/diagnosis/{jobId}/status`, `GET /v1/diagnosis/{jobId}`
3. **비동기 폴링 훅** (`features/diagnosis/model/`)
   - `useDiagnosisPolling.ts` — `jobId` 기반 상태 폴링 (레퍼런스 `03_backend_integration.md` 참고)
   - 폴링 간격: 2초 → RUNNING 시 1초 → 완료 시 중단
   - `useDiagnosisResult.ts` — 진단 결과 데이터 가공
4. **온보딩 API 연동** (`features/onboarding/`)
   - Phase 3~4 스텝에서 `POST /v1/diagnosis` 호출
5. **상태 폴링 UI** (`features/diagnosis/ui/`)
   - `DiagnosisProgress.tsx` — 프로그레스 바 + 단계별 상태 표시 (PENDING/RUNNING/SUCCESS)
   - `DiagnosisStatusCard.tsx` — 현재 작업 상태 카드
6. **순위 결과 시각화** (`features/ranking/ui/`)
   - `RankingTable.tsx` — 키워드별 순위 테이블 + 변동(delta) 표시
   - `RankingCard.tsx` — 개별 키워드 순위 카드
   - `RankingChart.tsx` — 순위 추이 차트 (Chart.js 또는 Recharts)
   - 레거시 참고: `components/nplrace/rank/`
7. **순위 트래킹 feature** (`features/tracking/`)
   - `features/tracking/model/types.ts` — 트래킹 데이터 타입
   - `features/tracking/ui/TrackingDashboard.tsx` — 키워드 트래킹 대시보드
   - 레거시 참고: `features/track/` (14개 파일)

---

## Phase 4: AI 리포트 (7~10일)

1. **타입 정의** (`features/report/model/types.ts`)
   - `DiagnosisReport`, `ReportSection`, `ReportEvidence`, `ReportSectionType` 타입
2. **API 클라이언트** (`features/report/api/`)
   - `reportApi.ts` — `GET /v1/reports/{reportId}`, `GET /v1/stores/{storeId}/reports`
3. **ViewModel** (`features/report/model/`)
   - `useReportDetail.ts` — 리포트 상세 데이터 + 섹션별 렌더링 로직
   - `useReportHistory.ts` — 리포트 목록 + 비교 로직
4. **리포트 결과 UI** (`features/report/ui/`)
   - `ReportSummaryCard.tsx` — 점수 + 핵심 인사이트 요약
   - `ReportEvidenceSection.tsx` — RAG 출처 근거 표시
   - `ReportActionList.tsx` — 개선 포인트 + 우선순위 매트릭스
   - `ReportChecklist.tsx` — 즉시 실행 체크리스트 (체크 가능 인터랙션)
   - `ReportPriorityMatrix.tsx` — 우선순위 시각화
5. **페이지 라우트** (`app/(app)/reports/`)
   - `[reportId]/page.tsx` — 리포트 상세 페이지
   - 온보딩 완료 → 리포트 페이지 라우팅
6. **리포트 히스토리/비교 UI** (`features/report/ui/`)
   - `ReportHistoryTimeline.tsx` — 타임라인 형식
   - `ReportDiffView.tsx` — 이전 vs 최신 순위 변동 diff
7. **PDF 다운로드**
   - `useReportExport.ts` — 클라이언트 사이드 PDF 생성 (html2canvas + jsPDF)

---

## Phase 5: 결제 시스템 (5~7일) [Post-MVP]

> 레거시 참고: `(home)/payment/`

1. **타입 정의** (`features/billing/model/types.ts`)
   - `Plan`, `Subscription`, `PaymentPreRegister`, `BillingKeyResult`, `Invoice` 타입
2. **API 클라이언트** (`features/billing/api/`)
   - `billingApi.ts` — `GET /v1/billing/plans`, `GET /v1/billing/subscription`
   - `paymentApi.ts` — `POST /v1/billing/payments/pre-register`, `POST .../billing-key/complete`
   - `subscriptionApi.ts` — `POST /v1/billing/subscriptions`, `DELETE /v1/billing/subscriptions`
3. **ViewModel** (`features/billing/model/`)
   - `usePaymentFlow.ts` — 플랜 선택 → 카드 등록 → 빌링키 발급 → 첫 결제 플로우
   - `useSubscription.ts` — 구독 상태/업그레이드/해지
   - 레거시 참고: `PaymentClientPage.tsx` (64KB) 로직 분해
4. **결제 플로우 UI** (`features/billing/ui/`)
   - `PlanSelector.tsx` — 플랜 비교표 + 선택
   - `PaymentForm.tsx` — PortOne 웹컴포넌트 연동
   - `PaymentResult.tsx` — 성공/실패 결과 표시
5. **결제 결과 페이지** (`app/(home)/payment/`)
   - `billing-success/page.tsx`, `billing-fail/page.tsx`
   - `success/page.tsx`, `fail/page.tsx`
6. **구독 관리 UI** (`features/billing/ui/`)
   - `SubscriptionStatus.tsx` — 현재 플랜, 다음 결제일
   - `UpgradeModal.tsx` — 업/다운그레이드 선택
   - `CancelSubscriptionModal.tsx` — 해지 확인
   - 레거시 참고: `features/subscription/`
7. **멤버십 가격 페이지** (`app/(home)/membership/`)
   - 레거시 참고: `(home)/membership/`
8. **청구서/영수증** (`features/billing/ui/`)
   - `InvoiceList.tsx`, `InvoiceDetail.tsx`
   - 레거시 참고: `(dplog)/invoices/`, `components/invoices/`

---

## Phase 6: 대시보드 완성 (5~7일) [Post-MVP]

> 레거시 참고: `legacy/dplog/src/app/(dplog)/` 전체

### 대시보드 레이아웃
1. **대시보드 레이아웃** (`app/(app)/dashboard/layout.tsx`)
   - 사이드바 네비게이션 (`features/dashboard/ui/Sidebar.tsx`)
   - 헤더 + 유저 메뉴 (`features/dashboard/ui/DashboardHeader.tsx`)
   - 레거시 참고: `(dplog)/layout.tsx`
2. **내 매장 목록** (`features/store/ui/`)
   - `StoreListPage.tsx` — 매장 카드 그리드
   - `StoreDetailPage.tsx` — 매장 상세 + CRUD
   - `StoreFormModal.tsx` — 매장 추가/수정 모달

### 순위/분석 (레거시 `(dplog)/(nplace)/(rank)/` 7페이지 참고)
3. **키워드 순위 대시보드** (`features/ranking/ui/`)
   - `RankingDashboard.tsx` — 실시간 순위 모니터링 개요
   - `RankingOverviewCard.tsx` — 순위 요약 카드
4. **순위 트렌드 차트** (`features/ranking/ui/`)
   - `RankingTrendChart.tsx` — 키워드별 순위 추이 그래프 (Recharts)
5. **순위 히스토리 테이블** (`features/ranking/ui/`)
   - `RankingHistoryTable.tsx` — 날짜별 순위 비교 테이블
   - 레거시 참고: `components/nplrace/rank/` (40개)

### 리포트
6. **리포트 히스토리** (`features/report/ui/`)
   - `ReportHistoryPage.tsx` — 타임라인 형식 리포트 목록
7. **리포트 비교 뷰** (`features/report/ui/`)
   - `ReportCompareView.tsx` — 이전 vs 최신 리포트 diff

### 유저/프로필
8. **프로필 페이지** (`features/user/ui/`)
   - `ProfilePage.tsx` — 유저 정보 조회/수정
   - 레거시 참고: `(dplog)/profile/`, `components/profile/`
9. **유저 관리 페이지** (`features/user/ui/`)
   - `UserManagePage.tsx` — 계정 관리, 비밀번호 변경, 탈퇴
   - `UserModals/` — 경고/확인 모달 (5개)
   - 레거시 참고: `components/user/UserClientPage.tsx` (43KB) 로직 분해

### 알림/기타
10. **알림 시스템** (`features/notification/`)
    - `notificationApi.ts`, `NotificationList.tsx`, `NotificationBadge.tsx`
    - 레거시 `04_20251201_알림설계.md` 참고
11. **N블로그 관리** (옵션, `features/nblog/`)
    - 레거시 참고: `(dplog)/(nblog)/`, `components/nblog/` (4개)

---

## Phase 7: 운영 안정화 (3~5일) [Post-MVP]

1. **접근성 점검**
   - 키보드 포커스 표시 확인
   - 색상 대비 4.5:1 준수 확인
   - `prefers-reduced-motion` 비활성화 대응
2. **SEO 메타 태그** (`app/layout.tsx`, 각 `page.tsx`)
   - `title`, `description`, `og:image` 등 메타데이터
   - Next.js `generateMetadata()` 활용
3. **에러 바운더리 + 폴백 UI**
   - `global-error.tsx` — 전체 에러 바운더리
   - `not-found.tsx` — 404 페이지
   - 각 feature별 로딩/에러 상태 UI
   - 레거시 참고: `global-error.tsx`, `not-found.tsx`
4. **Sentry 프론트엔드 연동**
   - `instrumentation-client.ts` — 클라이언트 사이드 에러 추적
   - `instrumentation.ts` — 서버 사이드 에러 추적
   - 레거시 참고: `instrumentation-client.ts`, `instrumentation.ts`
5. **성능 최적화**
   - 번들 분석 (`@next/bundle-analyzer`)
   - 이미지 최적화 (Next.js `Image` 컴포넌트)
   - 동적 import + 코드 스플리팅 (`React.lazy`, `dynamic()`)
   - 불필요 리렌더링 방지 (`React.memo`, `useMemo`)

---

## 📂 레거시 이관 체크리스트 (`legacy/dplog`)

- [ ] `components/nplrace/rank/` (40개) — 순위 카드, 차트, 비교 UI
- [ ] `components/nplrace/reply/` (5개) — 댓글 관리 UI
- [ ] `components/nplrace/keywordSearch/` — 키워드 검색 UI
- [ ] `components/user/UserClientPage.tsx` (43KB) — 유저 관리 전체 페이지
- [ ] `components/user/modals/` (5개) — 유저 관련 모달
- [x] `components/common/` (25개) — 공통 UI (버튼, 모달, 레이아웃)
- [x] `components/home/` (11개) — 랜딩 페이지 컴포넌트
- [ ] `(home)/payment/PaymentClientPage.tsx` (64KB) — 결제 전체 플로우
- [ ] `features/track/` (14개) — 키워드 트래킹 기능
- [ ] `features/subscription/` — 구독 관리
- [x] `store/` (19개) — Zustand 등 상태관리 스토어
- [x] `viewModel/` (13개) — 뷰모델 패턴
- [x] `hooks/` (7개) — 커스텀 훅
- [x] `utils/` (19개) — 유틸리티 함수
- [ ] `middleware.ts` — Next.js 미들웨어 (인증 리다이렉트 등)
