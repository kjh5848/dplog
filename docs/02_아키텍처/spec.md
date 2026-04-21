# Next.js + Python 통합 패키징 명세서 (Specification)

## 1. 개요 (Overview)
본 명세서는 분리되어 있던 Next.js 프론트엔드와 Python FastAPI 스크레이퍼를 하나의 완전한 독립형 패키지 런타임으로 결합하기 위한 아키텍처 및 요구사항을 정의합니다.

- **Objective**: Next.js 프로젝트를 순수 정적 파일(`out`)로 추출하고, 이를 Python 백엔드에 완전 임베딩하여 **단일 실행 환경(Single Server)**을 구축.
- **Benefits**: 무거운 Node.js 프로세스 불필요, 프론트/백 통신 지연 최소화, 배포 파이프라인 단일화, 데이터 완전 영속성 확보(SQLite).

---

## 2. 아키텍처 사양 (Architecture Specifications)

### 2.1 뷰 계층 (Next.js Static Export)
- 프레임워크: Next.js (CSR Mode - Single Page Application 구조)
- 빌드 방식: `next.config.ts` 의 `output: 'export'` 속성을 사용하여 Node 서버 기능 완전 제거.
- 프록시 정책: Static Export 환경에서는 `rewrites` 기능을 상실하므로 모든 API 엔드포인트는 BaseURL 설정을 통해 `/{relative_path}` 로 সরাসরি 요청하게 구상.

### 2.2 비즈니스 로직 계층 (Python FastAPI)
단일 스크립트였던 구조를 모듈러 형태로 분할합니다.

```text
backend_python/
├── main.py                 # 앱 초기화, 정적 폴더 마운트 및 라우터 바인딩
├── core/
│   ├── database.py         # SQLite3 (차후 PostgreSQL 확장) 세션
│   ├── config.py           # 환경변수 로드
│   └── security.py         # JWT 인증 및 API Key 관리 플러그인 (유료화 대응)
├── domains/                # [DDD 기반 모듈러 SaaS 아키텍처]
│   ├── stores/             # 비즈니스: 등록 상가 관리 (router, schema, service, model)
│   ├── scraping/           # 비즈니스: 네이버 크롤링 엔진 (병렬화, 프록시 어댑터)
│   ├── users/              # 비즈니스: 회원가입, 로그인, 무료/유료 권한(Tier) 관리
│   └── billing/            # 비즈니스: PortOne 결제, 구독 갱신 로직 (추후 확장)
└── static_out/             # (Next.js 가 빌드된 out 폴더가 위치할 장소)
```

### 2.3 데이터 계층 (SQLite Database)
- 엔진: SQLite3 (단일 파일 DB - `database.db` 생성)
- 주요 스키마:
  - `Store` 모델 (상가 고유정보: id, name, category, place_url 등)
  - `StoreMetrics` 모델 (각 상가의 최신 지표: 방문자 리뷰, 블로그 리뷰, 저장수 결합)

---

## 3. 기능 및 API 명세 (API Definitions)

프론트엔드 정적 파일이 정상적으로 구동되기 위해 파이썬이 즉각 구현해야 할 필수 API입니다.

| Method | Endpoint | Description | Frontend Usage |
|---|---|---|---|
| POST | `/v1/stores` | 상점 신규 등록 | Store 폼 제출 (저장 및 딥 스크랩 큐 진입) |
| GET | `/v1/stores/me` | 등록된 내 상점 목록 조회 | Dashboard 즉시 렌더링용 |
| GET | `/v1/stores/{id}` | 특정 상점 단건 조회 및 지표 반환 | 개별 상점 세부 분석 페이지용 |
| GET | `/api/store/search` | 상호 기반 네이버 자동완성 및 정보 | (기구현) 가게 등록 시 검색용 모달 지원 |

### 3.1 SPA 정적 폴더 서빙 규약
모든 API 엔드포인트(`/v1/`, `/api/`)에 매칭되지 않는 사용자의 URL 진입 요청은 `main.py`의 Fallback 라우터에 의해 항상 `static_out/index.html` (또는 경로에 매칭되는 HTML) 을 리턴해야 합니다.
