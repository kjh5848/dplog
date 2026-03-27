# D-PLOG — AI 기반 외식업 플레이스 노출 진단 솔루션

> 📄 상세 문서: [`docs/planning/`](./docs/planning/)
> 📋 로드맵: [`ROADMAP.md`](./docs/planning/ROADMAP.md) | [`ROADMAP_BACKEND.md`](./docs/planning/ROADMAP_BACKEND.md) | [`ROADMAP_FRONTEND.md`](./docs/planning/ROADMAP_FRONTEND.md)

---

## 🚀 빠른 시작

### 프론트엔드 (Next.js)

```bash
cd frontend_dplog
npm install
npm run dev          # http://localhost:3000
```

### 백엔드 — Spring Boot 메인 서버

```bash
cd backend
./gradlew bootRun    # http://localhost:8080
```

- Actuator 헬스체크: `http://localhost:8080/actuator/health`
- H2 콘솔 (dev): `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:dplog`)

### 백엔드 — FastAPI AI 워커 서버

```bash
cd ai-worker
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8001    # http://localhost:8001
```

- 헬스체크: `http://localhost:8001/health`

---

## 🏗️ 아키텍처

**투트랙 구조** (Spring Boot + Python FastAPI)

| 서버 | 기술 스택 | 역할 | 포트 |
|------|-----------|------|:----:|
| **메인 서버** | Spring Boot 4.0, Java 21 | API, 인증, 결제, CRUD | `8080` |
| **AI 워커** | Python FastAPI, Bedrock | RAG, 공공데이터, 리포트 생성 | `8001` |
| **프론트엔드** | Next.js (App Router, FSD) | 사용자 UI | `3000` |

```
┌──────────┐     ┌────────────────┐     ┌──────────────┐
│ Next.js  │────▶│  Spring Boot   │────▶│   FastAPI     │
│ :3000    │ API │  :8080         │ HTTP│   :8001       │
│          │◀────│  메인 서버      │◀────│   AI 워커     │
└──────────┘     └────────────────┘     └──────────────┘
                       │                       │
                   ┌───┴───┐             ┌─────┴─────┐
                   │ MySQL │             │  Bedrock   │
                   │ (H2)  │             │  RAG + S3  │
                   └───────┘             └───────────┘
```

---

## 📂 프로젝트 구조

```
dplog/
├── frontend_dplog/          # Next.js 프론트 (FSD 아키텍처)
├── backend/                 # Spring Boot 4.0 메인 서버
│   ├── build.gradle
│   ├── src/main/java/kr/co/nomadlab/dplog/
│   │   ├── common/          # 공통 (Security, DTO, 예외, 설정)
│   │   ├── store/           # 가게 모듈
│   │   ├── ranking/         # 키워드/순위 모듈
│   │   ├── report/          # 진단/리포트 모듈
│   │   ├── billing/         # 결제 모듈 (Phase 5)
│   │   └── integration/     # 외부 API 연동 (Phase 3)
│   └── src/main/resources/
│       ├── application.yml
│       ├── application-dev.yml
│       └── application-prod.yml
├── ai-worker/               # Python FastAPI AI 워커
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── routers/
│   │   ├── services/
│   │   └── models/
│   └── requirements.txt
├── docs/planning/           # 기획/설계 문서
└── legacy/                  # 레거시 코드 (참고용)
```

---

## 🔧 기술 스택

| 구분 | 기술 |
|------|------|
| **프론트** | Next.js 15, TypeScript, FSD 아키텍처, Zustand |
| **백엔드** | Spring Boot 4.0, Java 21, Spring Security 7, JPA, Virtual Threads |
| **AI** | Python FastAPI, AWS Bedrock, LangChain, Pandas |
| **DB** | MySQL (prod), H2 (dev) |
| **인프라** | Gradle 9, pip/venv |
