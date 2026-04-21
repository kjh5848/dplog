# [Spec] 랜딩/온보딩 상세 명세

## 0. 메타
- 상태: TODO(할 일)
- 관련 PRD: FR-L1, FR-L2, FR-L3
- 관련 문서:
  - [`../../planning/PRD.md`](../../planning/PRD.md)
  - [`../../frontend-architecture.md`](../../frontend-architecture.md)

## 1. 목적
- 랜딩에서 “무료로 진단 시작” 전환을 극대화하고, 신뢰(보안/데이터 처리) 메시지를 제공한다.

## 2. 범위
### 2.1 In scope
- 랜딩 섹션 구성(헤더/히어로/가치/작동 방식/핵심 기능/FAQ/푸터)
- CTA 동작(진단 플로우 진입)
- 보안/민감정보 처리 안내 카피(최소)
- 측정 이벤트(전환/스크롤/CTA 클릭)

### 2.2 Out of scope
- SEO 고도화(SSG/SSR 분리) — 필요 시 별도 Spec/ADR
- 광고/UTM 기반 퍼널 최적화 자동화

## 3. 사용자 시나리오
- Happy path: 랜딩 진입 → 가치 이해 → CTA 클릭 → `/diagnosis/new` 진입
- 예외: 모바일에서 헤더/CTA 접근성 저하, 스크롤 길이로 이탈

## 4. UX / 화면
- 라우트: `/`
- 필수 섹션(초안)
  - Hero: “플레이스 노출 진단” + 1줄 설명 + Primary CTA
  - Why: 문제/대상
  - How: 3-step
  - Features: 기능 카드
  - FAQ: 최소 4개
  - Security: “민감정보는 서버에서만 처리” 안내

## 5. 측정(이벤트)
- `landing_view`
- `landing_cta_click` (위치: header/hero/bottom)
- `landing_section_view` (why/how/features/faq)

## 6. 수용 기준(AC)
- [ ] 랜딩에서 CTA 클릭 시 진단 플로우로 진입한다.
- [ ] 보안/민감정보 처리 원칙이 최소 1곳 이상 노출된다.
- [ ] 핵심 이벤트 2~3개가 정의되어 있고 추후 구현 가능하다.

## 7. 오픈 이슈
- [ ] SEO가 필요한 시점/범위(Next.js 분리 여부)
- [ ] 로그인/회원가입이 필요한 시점(베타 정책)
