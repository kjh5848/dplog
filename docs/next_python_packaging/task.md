# 프로젝트 이행 태스크 (Task Checklist)

본 문서는 `phase.md` 기반의 체크리스트입니다. 완료된 항목은 `[x]`, 진행중인 항목은 `[/]`로 갱신하여 진척도를 트래킹합니다. 언제든 `/execute-next-python-epics` 워크플로우를 호출하면 이 문서의 빈칸을 이어서 작업합니다.

## [Epic 1] View-Core 단일 구동 환경
- [x] `next.config.ts` 에 API 프록시(`rewrites`) 제거 및 `output: 'export'` 속성 추가.
- [x] 프론트엔드 이미지 최적화 옵션 해제 및 추출 테스트.
- [x] `npm run build` 스크립트를 통한 무결점 정적 뷰 추출.
- [x] 신규 폴더 `backend_python` 스캐폴딩 구조 셋업 (DDD 아키텍처).
- [x] `main.py` 파일 생성 및 SPA 라우팅(Fallback) 대응 와일드카드 추가.

## [Epic 2] 스크래퍼 통합 (현재 진행 중)
- [x] **(Phase 2.1)** `database.py` 생성 및 SQLite 비동기 엔진 연동(`aiosqlite`).
- [x] **(Phase 2.1)** `domains/stores/model.py` 에 SQLModel 기반 프론트엔드 검증 스키마 작성.
- [x] **(Phase 2.2)** `preview_server.py`의 핵심 딥-스크래핑 유틸 메서드들을 `domains/scraping/engine.py` 로 모듈화(이관).
- [x] **(Phase 2.3)** `domains/stores/router.py` 엔드포인트 생성 (`GET /v1/stores` 등).
- [x] **(Phase 2.3)** UI에서 가게 정보 패치 시 파이썬 DB에서 데이터를 서빙하는 통합 테스트 진행.
- [x] **(UI 동기화)** `StoreDetail.tsx`의 리뷰, 키워드 디자인 포맷을 `register_section.html`의 요구사항에 맞게 동기화.

## [Epic 3] 엣지 큐잉 & 동기화 (Beta Release)
- [x] FastAPI `BackgroundTasks`를 활용한 0.01초 API 논블로킹 응답 시스템 구축. (가게 등록, 스크래핑 PENDING 상태 표기)
- [ ] 백엔드와 중앙 클라우드 간의 스케줄러(Sync) 모듈 셋업. *(개발 보류: 우선 완전 오프라인 로컬 실행 기반으로 론칭 결정)*
- [x] 백그라운드 황금키워드 발굴 모듈 구현 및 `StoreDetail` 실시간 반영 완료.
- [x] **(New Task)** `StoreDetail`의 하단부에 실시간 순위 조회 및 황금키워드 모듈 임베딩 처리 완료.
- [x] **(New Task)** 글로벌(GNB) 실시간, 순위 대시보드 뷰에서 접속 유저의 Store ID 자동 선택 및 상태 동기화 처리 완료.

## [Epic 4] 단일 데스크톱 앱(Executable) 패키징 단계
- [ ] 파이썬 서버 엔진 PyInstaller 1-Click 실행 빌드 구성.
- [ ] Next.js `out/` 결과물을 스태틱 폴더로 묶어서 단일 바이너리(또는 인스톨러)에 포함할 스크립트 작성 (macOS `.app` / Windows `.exe`).
- [ ] Playwright 브라우저 바이너리(Chromium) 스텔스(포터블) 패키징 연결.

## [Epic 5] 비즈니스 인프라 결합 (SaaS 빌드업)
- [ ] `core/security.py` 로그인 발급 및 다운로드 등급별 제한. *(추후 유료화 배포 패키지 업데이트 시점 도입)*
- [ ] `domains/billing` PortOne 구독 스키마 작성 및 검증 서버 오픈. *(개발 보류)*
- [ ] **(Pro Feature)** 발굴된 황금 키워드 풀 안에서 '블로그 체험단' 투입 대비 효과가 압도적인 키워드를 선별하는 AI 매칭/추천 기능 구현.
