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
