# 🕰️ 레거시 스크레이핑 테스트 스크립트 모음 (Legacy Scraper Tests)

이 폴더(`tests/legacy_scrapers/`)는 네이버 모바일 플레이스 병렬 추출기(`full_list_extractor_8_threads.py`) 및 스케줄러(`scheduler.py`)가 안정화되기 전, **개발 초기에 스크롤 전략과 DOM 우회 기법을 테스트하기 위해 작성되었던 파편화된 테스트 스크립트 모음**입니다.

과거의 기술적 실험 과정과 디버깅 흔적이 남아있으며, 현재는 사용되지 않는 파일들입니다.

---

## 📂 파일별 테스트 목적 및 설명

### 1. `test_scrape.py`
- **목적:** 초기 Playwright 수집 디버깅 시작
- **내용:** `async_playwright`를 통해 헤드리스 모바일 브라우저를 띄우고 `window.scrollBy(0, 5000)` 명령어로 단순 루프 스크롤을 25회 수행하며 DOM 높이 변화를 관찰하던 가장 기초적인 스크립트.

### 2. `test_scrape2.py`
- **목적:** 스크롤 vs 화면 높이(Height) 측정 로직 디버깅
- **내용:** DOM이 로드될 때마다 증가하는 `document.body.scrollHeight` 값과 이전(Previous) 높이를 비교하기 위해 `range(40)`까지 반복하며 네이버의 스크롤 반응형(Lazy Loading) 로드 한계를 테스트.

### 3. `test_scrape4.py`
- **목적:** 스크롤 버그 픽스 (IntersectionObserver 우회)
- **내용:** 스크롤을 한 번에 너무 크게 내리면 요소(Element)가 렌더링되지 않는 현상(IntersectionObserver 버그)을 우회하기 위해, 한 번에 800px(화면 높이)씩 부드럽게 여러 번 내리며 재시도(Retries) 로직을 추가한 실험 파일.

### 4. `test_scrape_visual.py`
- **목적:** 시각적 스크롤 디버깅
- **내용:** 스크롤 높이를 `3000px`로 하향 조정하여 15회 반복하는 형태의 테스트. 가장 기본적인 렌더링 검사만 수행.

### 5. `test_scrape5.py`
- **목적:** 좌표 파라미터 제외 순수 무한 스크롤 유기적 검색 (Organic Search)
- **내용:** 기존에는 URL에 `&x=`와 `&y=` 좌표를 강제로 주입하여 특정 지역의 결과를 보장받았으나, 좌표 정보가 없는 순수 키워드(`query=전포동 이자카야` 단독)로 검색했을 때 네이버 지도가 무한 스크롤을 어떻게 지원하고 순위를 정렬하는지 검증하는 스크립트.

### 6. `test_scrape3.py`
- **목적:** `full_list_extractor_8_threads.py` 병렬 코어 통합 테스트
- **내용:** 개별 스크롤 로직이 아닌, 최종적으로 묶인 고성능 추출 엔진 모듈(`run_engine`)을 불러들여 "서면 고기집"이라는 넓은 키워드(대량 데이터 파싱)가 잘 긁어와지는지(결과 리스트 길이 반환)를 테스트하는 모듈.

### 7. `test_scheduler.py`
- **목적:** 스케줄러 수동 단독 실행 테스트
- **내용:** FastAPI 백그라운드 태스크나 Cron 타이머 없이, `scheduler.py`의 `run_scheduled_extraction()` 함수를 단일 루프로 즉시 실행해보기 위해 만든 진입점 파일(Entrypoint).

---

> [!NOTE] 
> 현재 프로덕션 코드(루트 디렉토리의 메인 모듈들)는 위 스크립트들에서 연구된 최적의 스크롤 로직(IntersectionObserver 우회, 순수 텍스트 파싱, 헤드리스 모바일 프로필)등이 모두 합쳐진 완성본입니다. 이 파일들은 단순 참고 및 역사적 보관용으로만 남겨둡니다.
