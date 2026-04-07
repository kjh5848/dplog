# 프로젝트 이행 태스크 (Task Checklist)

해당 문서는 `phase.md` 기반의 체크리스트입니다. 완료된 항목은 `[x]`, 진행중인 항목은 `[/]`로 갱신하여 진척도를 트래킹합니다.

### Phase 1: 뷰 계층 (Next.js) 정적 추출 전환
- [x] 프론트엔드 이미지 최적화 및 동적 패키지 점검
- [x] `next.config.ts` 에 `output: 'export'` 속성 추가
- [x] 기존 Python Proxy 설정(`rewrites`) 제거
- [x] `npm run build` 명령어 파이프라인 무결성 확인 및 `out` 디렉터리 추출 확인.
- [x] API 호출 유틸 컴포넌트(`storeApi.ts` 등)의 상대 경로 BaseURL(`v1 / api`) 테스트 연동 확인.
- [x] `npm run build` 실행 시 떨어지는 동적 요소 오류(에러) 트러블슈팅.
- [x] `out` 폴더 산출물의 정상 여부 육안 확인 (HTML/CSS 등 렌더링).

## Phase 2: Python 백엔드 스캐폴딩
- [ ] 신규 루트 프로젝트 디렉터리에 `backend_python` 폴더 구조 생성.
- [ ] `main.py` 파일 생성 및 FastAPI 라우터 모듈 인클루드 선언.
- [ ] SQLite 데이터베이스 생성 스크립트 작성 (`core/database.py`).
- [ ] 데이터베이스 기반 `stores` 및 `metrics` 스키마 생성(SQLAlchemy/Raw).
- [ ] `preview_server.py`의 핵심 딥-스크래핑 유틸 메서드들을 `services/scraper_service.py` 로 이관.

## Phase 3: 기능 API 융합 구현
- [ ] HTTP Request (Pydantic DTO) 페이로드 체계 셋업.
- [ ] `api/routes/stores.py` 모듈 생성.
- [ ] `GET /api/store/search` 앤드포인트 마이그레이션 (방금 구현한 로직 이식).
- [ ] `POST /v1/stores` 가게 등록 + DB Insert 쿼리 + Deep-Scrape Call 구현.
- [ ] `GET /v1/stores/me` 리스트 즉시 반환 쿼리 구현.
- [ ] 대시보드 뷰에서 Python 서버 API 데이터를 제대로 파싱하여 렌더하는지 연동 테스트.

## Phase 4: 단일 패키징 모드 통합
- [ ] Python 서버 내 정적 파일 패키징 마운트 옵션(`StaticFiles` 등) 반영.
- [ ] React SPA 히스토리 모드에 대응하는 `/*` Catch-all 와일드카드 처리 추가.
- [ ] Frontend 빌드 디렉터리와 파이썬 디렉터리 간의 배포 파이프라인 자동 로직(cp 명령 설정 묶음) 구축.
- [ ] 단일 포트(통합 패키지) 테스트 진행 후 이슈 사항 기록.
