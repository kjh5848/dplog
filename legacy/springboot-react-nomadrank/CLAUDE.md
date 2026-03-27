# CLAUDE.md

이 파일은 이 저장소에서 코드 작업을 할 때 Claude Code (claude.ai/code)에 대한 가이드를 제공합니다.

## 개발 명령어

### 프론트엔드 (React + Vite)
- React 개발을 위해서는 `src/frontend`로 이동
- `npm run dev` - 개발 서버 시작 (포트 5173)
- `npm run build` - 프로덕션 빌드
- `npm run lint` - ESLint로 코드 품질 검사
- `npm run preview` - 프로덕션 빌드 미리보기

### 백엔드 (Spring Boot)
- Spring Boot 개발은 루트 디렉토리 사용
- `./gradlew bootRun` - Spring Boot 애플리케이션 시작 (포트 8081)
- `./gradlew test` - 테스트 실행
- `./gradlew clean build` - 클린 및 빌드
- Spring Boot 빌드 시 React 프론트엔드 빌드가 자동으로 포함됨

### 데이터베이스
- 개발환경은 AWS RDS MySQL 데이터베이스 사용: `nesoone_dev_v2`
- H2 설정은 주석 처리되어 있지만 로컬 개발용으로 사용 가능
- JPA with Hibernate DDL auto: `update`

## 아키텍처 개요

### 패키지 구조
프로젝트는 도메인 주도 설계를 따르며 다음과 같은 주요 도메인을 가집니다:
- **auth**: 인증 및 권한 관리 (JWT 토큰 기반)
- **user**: 권한 역할을 가진 사용자 관리
- **notice**: 공지사항 시스템
- **group**: 상점 그룹 기능
- **distributor**: 유통업체 관리
- **nplace**: 네이버 플레이스 관련 기능 (순위, 리워드, 캠페인)
- **nstore**: 네이버 스토어 기능
- **product**: 상품 관리
- **membership**: 멤버십 관리
- **google**: 구글 시트 연동

### 주요 기술
- **백엔드**: Spring Boot 3.2.5, Java 21, Spring Security, JPA/Hibernate
- **프론트엔드**: React 18, Vite, Bootstrap, Chart.js, React Router
- **데이터베이스**: MySQL (개발), H2 (옵션)
- **인증**: 커스텀 보안 설정을 통한 세션 기반
- **외부 API**: 네이버 검색광고 API, 구글 시트 API

### 보안 설정
- 세션 관리를 포함한 커스텀 JWT 토큰 제공자
- 요청 인증을 위한 보안 필터
- 크로스 도메인 요청을 위한 CORS 설정
- 세션 타임아웃: 2600000ms (43분 이상)

### 프론트엔드 아키텍처
- 별도의 Style.jsx 파일을 가진 컴포넌트 구조
- Zustand 스타일 상태 관리 (StoreProvider, AuthStore, UtilStore)
- react-responsive를 사용한 반응형 디자인
- 전체적으로 모달 기반 UI 패턴

### 주요 기능
- **네이버 플레이스**: 순위 추적, 키워드 분석, 리워드 캠페인
- **네이버 스토어**: 스토어 순위 및 키워드 관리
- **캠페인 관리**: 블로그 작가 캠페인 및 플레이스 기반 캠페인
- **리포트**: 실시간 순위 및 성과 분석
- **관리자**: 사용자 관리, 그룹 관리, 유통업체 관리

### 설정 파일
- `application.yml`: 프로파일 선택 (dev/prod)
- `application-dev.yml`: 개발 데이터베이스, 외부 API 설정
- 두 환경 모두 네이버 검색광고 및 외부 서비스용 민감한 API 키 포함

### 빌드 프로세스
Gradle 빌드에는 커스텀 태스크가 포함됩니다:
- `copyReactBuild`: React 빌드 결과물을 Spring Boot 정적 리소스로 복사
- `processResources`: React 빌드 복사에 의존
- 통합 빌드 프로세스로 프론트엔드 자산이 Spring Boot JAR에 포함되도록 보장

## 개발 참고사항

- 프로젝트는 UI와 비즈니스 로직에서 한국어를 광범위하게 사용
- nomadscrap 서버와 네이버 검색광고 API를 포함한 외부 연동
- 데이터 가져오기/내보내기 기능을 위한 구글 시트 연동
- 순위 업데이트를 위한 스케줄러 기반 백그라운드 작업