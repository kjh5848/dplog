# 🏗️ D-PLOG System Architecture

본 문서는 프로젝트의 전체적인 시스템 흐름과 프론트엔드/백엔드 아키텍처 구조를 정의합니다. AI 에이전트 및 개발자가 새로운 기능을 구현할 때 반드시 이 구조에 알맞게 코드를 배치해야 합니다.

## 1. High-Level System Design (투트랙 백엔드 아키텍처)

D-PLOG 프로젝트는 SEO 진단 및 F&B 가게 성장을 돕기 위해 **투트랙(Two-Track) 서버 아키텍처**를 채택했습니다. 

1. **Frontend (Next.js 16)**: 메인 UI/UX 및 클라이언트 상호작용
2. **Main Backend (Spring Boot 4.0)**: 비즈니스 로직, 회원 관리, 결제 기능(포트원), 데이터 영속성 관리
3. **AI-Worker (Python FastAPI)**: 데이터 스크래핑(NomadScrap 연동), SEO 진단 리포트 생성, AWS Bedrock 기반 LLM RAG 처리 엔진

- **통신 규칙**: 프론트엔드는 100% Main Backend(Spring Boot)와만 통신합니다. AI 분석 지연 작업(Heavy Task)이 필요한 경우 Main Backend가 메세지 큐 또는 비동기 HTTP 호출을 통해 Python AI-Worker로 작업을 위임합니다.

## 2. Frontend Architecture: FSD (Feature-Sliced Design)

프론트엔드 코드(`frontend_dplog/src`)는 강력한 관심사 분리를 위해 **FSD 방법론**을 엄격히 따릅니다.

- **`app/`**: 라우팅 진입점, 글로벌 설정(Next.js App Router), 전역 프로바이더
- **`pages/`**: 페이지 레벨 컴포넌트 조합 (e.g., `HomePage`, `LoginPage`)
- **`widgets/`**: 여러 기능을 조합해 만든 독립적인 UI 블록 (e.g., `Header`, `Footer`, `DiagnosticDashboard`)
- **`features/`**: 비즈니스 로직과 사용자 상호작용 (e.g., `auth/ui/LoginForm`, `store/model/useStoreViewModel`)
- **`entities/`**: 비즈니스 도메인 모델, 타입 및 기본 UI 단위 (e.g., `types.ts`, `api.ts`)
- **`shared/`**: 재사용 가능한 범용 UI(Shadcn 컴포넌트), 유틸리티, 훅, axios 클라이언트

> **[경고] 의존성 방향 규칙**: 높은 계층(위쪽)은 낮은 계층(아래쪽)을 `import` 할 수 있지만, 그 반대(낮은 계층에서 높은 계층 `import`)는 절대 금지됩니다. (예: `shared/` 하위 파일에서 `features/` 하위 파일을 가져오면 안 됩니다.)

## 3. Backend Architecture: Spring Boot + Virtual Threads

`backend/src/main/java` 하위의 코드는 **도메인 중심 헥사고날/클린 아키텍처 뉘앙스**의 계층형 구조를 사용합니다.

- **`controller/`**: REST API 엔드포인트 노출 (Spring Security 적용 구역)
- **`service/`**: 코어 비즈니스 로직. 도메인 간의 분리 유지
- **`repository/`**: Spring Data JPA 접근 계층
- **`domain/` (혹은 `entity/`)**: JPA 엔티티 및 핵심 도메인 규칙
- **`dto/`**: 요청/응답 규격 (Java `record` 타입 권장)

기본적으로 I/O 지연이 많은 레포트 생성 및 외부 스크래퍼 통신의 응답성을 높이기 위해 **Java 21의 Virtual Threads** 기능을 활성화(`spring.threads.virtual.enabled=true`)하여 사용합니다.

## 4. 데이터베이스 및 주요 도메인 개요

- **`User`**: 계정, 멤버십 권한, 결제 관리 상태 보유
- **`Store` / `Merchant`**: 가게 식별자, 사업자 등록 정보 보유
- **`Diagnosis` / `Keyword`**: 주간/월간 노출 순위, SEO 성과 및 AI 분석 피드백 리포트 내역
- 데이터베이스 엔진: PostgreSQL (Docker 기반)
