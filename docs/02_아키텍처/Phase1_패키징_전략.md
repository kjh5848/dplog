# 패키징 전략(Packaging_Strategy)

이 문서는 D-PLOG 엣지 노드(Edge Node)의 로컬 패키징 및 배포를 위한 Phase 1 공식 아키텍처 전략입니다.

## 1. 아키텍처 개요
- **프론트엔드:** Next.js (Static Export, `out/`)
- **백엔드:** Python FastAPI (정적 파일 서빙 및 로컬 스크래핑 제어)
- **실행 환경:** 사용자 OS (Windows `.exe` / macOS `.app`) 기반 단일 실행 파일

## 2. 보안(Security) 및 난독화
Claude 및 LLM, 디컴파일러를 통한 역공학(Reverse Engineering)을 원천 차단하기 위해 다음 기술을 적용합니다.
- **Nuitka 컴파일러:** 순수 Python 코드(`.py`)를 유지하거나 단순 압축(PyInstaller)하는 대신, C/C++ 코드로 변환 후 기계어 바이너리로 완전 컴파일합니다.
- **안티 디버깅(Anti-Debugging):** 런타임 시 디버거 부착 여부를 감지하여 즉각 프로세스를 종료시킵니다.
- **프론트엔드 난독화:** Next.js 빌드 시 Webpack/Terser를 통한 강도 높은 코드 꼬임(Obfuscation) 처리 및 소스 맵(Source Map) 제거.

## 3. 데이터 영속성 (Data Persistence)
앱 재설치나 버그 픽스 업데이트 시 사용자 데이터가 소실되지 않도록, 로컬 SQLite DB의 저장 위치를 프로젝트 디렉토리 내부가 아닌 OS 표준 사용자 공간으로 강제 분리합니다.
- **Windows:** `%APPDATA%\dplog\db\dplog.sqlite`
- **macOS:** `~/Library/Application Support/dplog/db/dplog.sqlite`

## 4. 로컬 자원 최적화 (브라우저)
패키징 용량 증가(500MB 이상)를 막고 설치를 가볍게 하기 위해, 브라우저 엔진(Playwright/Selenium 등)의 바이너리를 포함하지 않습니다.
- 사용자 PC에 이미 설치된 **Chrome/Edge 브라우저**의 경로를 추적하여 제어(스텔스 크롤링)합니다.
- 브라우저 부재 시, 자체 UI 에러 팝업을 통해 "크롬 브라우저 설치 필요"를 사용자에게 안내합니다.

## 5. 테스트 범위
- **화이트박스(White-box):** 인터넷 단절 시 로컬 DB 캐시를 활용한 렌더링 무결성, 스크래퍼 API의 내부 예외 처리 로직 통과 여부.
- **블랙박스(Black-box):** 포트 충돌(8000번 등) 발생 시 동적 포트 할당 여부, 비정상 프로세스 종료 후 재실행 시 무결성 검증.
