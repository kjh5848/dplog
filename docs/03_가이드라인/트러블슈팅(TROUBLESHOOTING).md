# 🛠️ D-PLOG Troubleshooting & Known Issues (장애 회고록)

이 문서는 개발 중 발생했던 **치명적인 버그, 프레임워크 호환성 에러, AI 에이전트의 반복적인 오판(환각) 사례**를 기록하는 '오답 노트' 형식의 지식 베이스입니다. 
새로운 에이전트 세션을 시작하거나 유사한 오류가 발생했을 때 이 문서를 가장 먼저 검색(RAG)하여 동일한 삽질(원점 회귀)을 방지합니다.

---

## [ISSUE-001] Next.js 16.1.6 및 Turbopack(SWC) 바인딩 오류
- **발생일**: 2026-03-24
- **증상**: 프론트엔드(`frontend_dplog`)에서 `npm run dev` 실행 시 `Could not resolve "next/dist/compiled/@next/react-refresh-utils/dist/loader"` 혹은 SWC Darwin 바인딩 실패 로그 출력.
- **근본 원인(Root Cause)**: 의존성 패키지 꼬임 및 로컬 캐시(`.next`) 충돌.
- **해결책(Resolution)**: 
  1. `rm -rf node_modules package-lock.json .next` 명령으로 클린 삭제.
  2. `npm install` 후 `npm run dev` 로 재기동.
- **교훈(Takeaway)**: Next.js + Turbopack 환경에서 원인을 알 수 없는 Native 모듈 오류가 발생하면, 코드를 디버깅하기보다 **환경 캐시를 우선 초기화**할 것.

---

## [ISSUE-002] SEO 스크래핑 봇 집단 동시접속으로 인한 네이버 IP 밴 (429 에러)
- **발생일**: 2026-04-01
- **증상**: 프론트엔드 대시보드에서 `[발굴 시작]` 버튼 클릭 시, 수십 개의 키워드에 대해 동시에 Playwright 브라우저가 기동되면서 네이버 모바일 검색 서버로부터 429 Too Many Requests 에러 및 캡챠(차단) 화면이 반환됨. 또한 100초가 넘어가는 대기열(Queue) 정체로 인해 504 Gateway Timeout 발생.
- **근본 원인(Root Cause)**: 순수 무작위 Jitter(`random.uniform(0.1, 10.0)`)를 사용했음에도, 난수가 우연히 겹쳐 동일한 0.0X초 대에 여러 브라우저가 몰리는 "군집 접속(Clustering)" 발생. 추가적으로 300위 순위를 추적하는 무거운 스크롤 로직이 동기식으로 병목을 유발함.
- **해결책(Resolution)**: 
  1. `full_list_extractor_8_threads.py` 내 Jitter 로직을 `통제된 무작위(Staggered Random Jitter: base_delay + random)` 방식으로 구조 개편하여, 브라우저 스폰(Spawn) 시 최소 0.5초의 절대 간격을 보장하도록 수정.
  2. 깊은 딥 서치(300위 확인) 로직을 되살리되, 비즈니스 가치("내 상점이 존재한다는 것 자체가 가치")를 위해 속도 저하를 감수하기로 의사 결정(결과 반환 시까지 클라이언트 측에서 대기 필요).
- **교훈(Takeaway)**: 안티봇(WAF) 사이트를 상대할 때 단순히 딜레이를 주는 것이 아니라 **순차적인 티켓 발부 형태(Staggering)의 딜레이 분산 구조**를 무조건 기초 설계에 포함할 것.

## [ISSUE-003] 프론트엔드 코드 수정 후 브라우저 화면 মি갱신 (Static Export 아키텍처 망각)
- **발생일**: 2026-04-10
- **증상**: 프론트엔드(`frontend_dplog`) 컴포넌트 코드(버튼 크기, 상태바)를 성공적으로 수정했음에도 불구하고, 브라우저 대시보드를 새로고침해도 구버전 UI가 그대로 노출됨. Next.js 개발 서버 문제로 착각하여 터미널에서 `npm run dev`를 재시작하고 웹팩 캐시를 조작하는 등 잘못된 우회 시도를 함.
- **근본 원인(Root Cause)**: D-PLOG의 런타임 아키텍처에 대한 이해 부족. 본 프로젝트는 Next.js 개발 서버(`localhost:3000`)를 띄워 렌더링하는 방식이 아니라, Next.js를 `output: "export"`로 **정적 빌드(Static Export)** 한 뒤, FastAPI 백엔드(`localhost:8000`)에서 `StaticFiles`를 이용해 빌드 산출물(`out/` 폴더)을 직접 서빙하는 구조임.
- **해결책(Resolution)**: 
  1. `cd frontend_dplog && npm run build` 명령어를 싱행하여 프론트엔드 변경 사항을 `out/` 폴더로 다시 정적 빌드(컴파일)함.
  2. 빌드 직후 브라우저(`localhost:8000`)를 강력 새로고침하자 정상적으로 수정된 UI가 렌더링됨.
- **교훈(Takeaway)**: Next.js 코드를 한 줄이라도 수정했다면 **무조건 `npm run build`를 돌려야만** 파이썬 백엔드가 변경 사항을 감지하여 브라우저에 쏠 수 있다. `npm run dev`를 띄우거나 Next.js 캐시 탓을 하지 말고 아키텍처 흐름(Next.js Build -> FastAPI Static Serve)을 가슴에 새길 것.

---

## [ISSUE-004] 데스크탑 앱 중복 실행 방지(Single Instance) 실패 및 창 겹침 현상
- **발생일**: 2026-04-22
- **증상**: 데스크탑 런처(테스트용 `test_desktop.sh` 등)를 여러 번 실행하면 기존에 띄워둔 D-PLOG 창이 닫히거나 포커스되지 않고, 똑같은 크롬 앱 창이 여러 개 중복해서 뜨는 현상이 발생함.
- **근본 원인(Root Cause)**: 
  1. 초기에는 `pkill`이나 `AppleScript`로 기존 크롬을 강제 종료하려 했으나, Mac/OS 권한 문제 및 유저의 '메인 인터넷 브라우저'까지 꺼버리는 위험성 때문에 폐기.
  2. 프론트엔드(`layout.tsx`)에서 `BroadcastChannel`을 활용해 "새 창이 열리면 기존 창이 `window.close()`로 자폭"하도록 설계함. 그러나 최신 크롬(V8) 보안 정책상, JS 코드(`window.open`)로 연 창이 아니면 `window.close()` 명령이 백그라운드에서 완전히 무시(Block)됨.
- **해결책(Resolution)**: 
  - 백엔드 `main.py`의 브라우저 실행 옵션에 `--user-data-dir=~/.dplog/chrome_profile` 인자를 추가하여 D-PLOG 전용 독립 프로필을 부여.
  - 이 옵션을 적용하면, 크롬은 내부적으로 해당 프로필에 대한 **네이티브 Single Instance(중복 실행 방지) 기능**을 자동 작동시킴. 즉, 같은 프로필의 앱을 두 번 실행해도 새 창이 뜨지 않고 **기존 창을 화면 맨 앞으로 포커스(Bring to front)** 해 줌.
- **교훈(Takeaway)**: 웹앱(Chrome App Mode) 래핑 시 중복 실행(Mutex) 문제를 자바스크립트 우회나 프로세스 킬(`pkill`) 등 위험한 외부 방식으로 풀려 하지 말고, **크롬 자체의 격리 프로필 아키텍처가 제공하는 네이티브 OS 라우팅**에 온전히 맡길 것.
