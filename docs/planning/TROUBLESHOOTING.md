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
