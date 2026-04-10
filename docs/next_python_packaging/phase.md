# D-PLOG: 모듈러 SaaS 및 엣지 노드 페이즈 (Phases & Epics)

에픽(Epic)은 '달성하고자 하는 거대한 비즈니스 목표'이며, 페이즈(Phase)는 특정 에픽을 완수하기 위해 순차적으로 밟아나가는 '시간적 진행 단계'를 의미합니다. 본 문서는 DDD 통합 아키텍처 구축을 위한 페이즈 세부 계획입니다.

---

## [Epic 1] View-Core 단일 구동 환경 구축 (인프라 통합)
프론트엔드(Next.js)와 백엔드(Python)를 하나로 묶어 로컬 PC에서 1개의 프로그램으로 동작할 수 있도록 인프라를 합치는 최초의 에픽입니다.

- **Phase 1: Next.js 정적 빌드 마이그레이션 (Frontend)**
  - (완료) `next.config.ts` 의 API 프록시 정책 제거 및 `output: 'export'` 설정 완료.
  - (완료) `npm run build` 스크립트를 통한 무결점 정적 뷰(`out` 폴더) 추출.
- **Phase 1.5: FastAPI 베이스 스캐폴딩 (Backend)**
  - (완료) `backend_python/main.py` 라우팅 생성 (SPA Fallback, Next.js CSS 마운트).
  - (진행 여부) 로컬 8000 포트로 UI에 정상 접속되는지 브라우저 테스트.

---

## [Epic 2] 도메인 기반 스크래퍼 통합 (스크래퍼 이관)
기존의 복잡했던 플레이라이트(Playwright) 기반 크롤링 서버를 DDD(도메인 주도 설계) 규격에 맞추어 이식하는 메인 에픽입니다.

- **Phase 2.1: DB 코어 및 모델 정의 (Data Layer)**
  - (완료) `database.py` 생성 (SQLModel + aiosqlite 비동기 채택).
  - (진행 예정) `domains/stores/model.py` 에 SQLModel 기반 상가(Store) 데이터 형태 작성.
- **Phase 2.2: 스크래핑 로직 이관 (Logic Layer)**
  - (진행 예정) 구 스크립트(`preview_server.py`)의 난해한 엔진을 `domains/scraping/engine.py` 로 모듈화(캡슐화).
- **Phase 2.3: 프론트엔드 - 백엔드 연동 (Integration)**
  - (완료) Next.js의 대시보드 저장 요청을 파이썬 라우터(`domains/stores/router.py`)가 실제로 받아 로컬 SQLite에 적재.
- **Phase 2.4: SEO 차세대 순위 추적 모듈 (Tracking Engine)**
  - (완료) `domains/scraping/ranking_engine.py` 구축 (노드 풀-파싱).
  - (완료) `TrackedKeyword`, `KeywordRankHistory` DB 데이터 모델 추가.
  - (완료) 실시간 단건 조회 및 일일 추적 키워드 스냅샷(수동 동기화 기반) API 구축.
  - (완료) `StoreDetail` 대시보드 하단에 실시간 조회 모듈, 황금키워드 모듈, 대시보드 모듈 임베딩 통합 완료.

---

## [Epic 3] 분산 엣지 노드망 구성 (Beta Release)
설치형 에이전트(사용자 PC)가 로컬 IP로 수집한 알짜 데이터를 중앙 망으로 몰래 보내는 "토렌트 방식"의 엣지망 구축 에픽입니다.

- **Phase 3.1: 오프라인 엣지 백그라운드 큐 구축**
  - (완료) 프론트엔드 대시보드 응답(0.01초)을 지연시키지 않도록 백그라운드 태스크(Task) 연동.
- **Phase 3.2: AWS 데이터 포워딩 연동 (V2/SaaS 전환 기획)**
  - (보류) 로컬 SQLite에 쌓인 지표를 중앙 허브(AWS PostgreSQL DB)로 이관(Sync)하는 스케줄러 구현.

---

## [Epic 4] 단일 데스크톱 앱(Executable) 패키징 파이프라인 구축
현재의 로컬 코드를 일반 가맹점주들이 원클릭으로 설치할 수 있는 데스크톱 프로그램(.exe, .app)으로 묶어내는 핵심 배포 파이프라인 에픽(로컬 MVP 완료 단계)입니다.

- **Phase 4.1: PyInstaller 인프라 세팅 및 번들링**
  - (진행 예정) Playwright 브라우저 바이너리와 Next.js `out/` 정적 폴더 번들링 스크립트 작성.
- **Phase 4.2: 백그라운드 스텔스 트레이 패키징**
  - (진행 예정) 사용자가 앱을 인식하지 않아도 트레이에 상주하며 엔진을 구동시키는 기능 설계 지원.

---

## [Epic 5] 유료화 시스템 적용 및 고급 분석망 (SaaS 플랫폼화 V2)
오프라인 로컬 기반에서 중앙 관제형 멀티태스킹 클라우드로 전환하며 결제와 고급 로직을 덧대는 에픽입니다.

- **Phase 5.1: Auth 및 Tier 제어**
  - 회원가입 구현 및 유저 등급(Free/Premium/Enterprise)별 커스텀 API 제한.
- **Phase 5.2: 황금 키워드 블로그 체험단 매칭 추천 시스템 (Pro)**
  - 발굴된 키워드 중 검색량 대비 경쟁도가 매우 낮아 '블로그 체험단을 태울 경우 상위 노출 확률'이 높은 핵심 키워드를 인공지능이 역산환하여 [✨블로그 체험단 타겟 추천] 배지를 달아주는 특수 엔진 적용 예정.
