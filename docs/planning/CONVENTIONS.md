# 📝 D-PLOG Coding Conventions & Rules

본 문서는 프로젝트의 코딩 표준, UI/UX 디자인 원칙 특이점 및 오류 방지 규칙을 다룹니다. AI 에이전트는 코드 작성 시 이 규약을 반드시 준수해야 합니다.

## 1. UI/UX "Hyper-Deep Tech" 스타일 원칙

D-PLOG의 프론트엔드는 흔한 템플릿 느낌을 벗어나 **프리미엄, 세련됨, 약간의 야심찬 테크적 요소**를 갖추어야 합니다.
- **폰트**: 기본적으로 `Inter`나 `Roboto` 대신 영문 핵심 타이틀에 `Syne` 또는 `Plus Jakarta Sans`, 한글에는 `Pretendard`를 혼용합니다.
- **색상 팔레트**: 원색(순수 빨강/파랑) 사용을 지양하고, HSL 기반의 세련된 그라이언트와 Dark Mode (글래스모피즘, #0A0A0A 배경)를 적극 사용하십시오.
- **테두리(Border)**: 사각형 각진 테두리보다는 `rounded-2xl`을 쓰고, 컴포넌트 내부에 Inner Overlay(빛반사) 효과나 노이즈 입자를 포함해 깊이감을 줍니다.
- **인터랙션**: 단순 Hover에 상태 변경만 주지 않고, 미세한 `.scale-95` 축소/확장이나 부드러운 `transition-all duration-300`을 적용합니다.

## 2. 프론트엔드 (React / Next.js) 코딩 컨벤션

- **조건부 렌더링 주의 (`&&` 금지, 3항 연산자 사용)**:
  React에서 배열 길이(`0`)나 값이 비어 있을 때 `&&`를 사용하면 UI에 `0`이나 `NaN` 문자가 노출되는 버그가 발생합니다.
  - ❌ **오답**: `{items.length && <List />}`
  - ✅ **정답**: `{items.length > 0 ? <List /> : null}` 혹은 `{Boolean(items.length) && <List />}`
- **클라이언트 컴포넌트 선언**: `useState`, `useEffect`, `onClick` 등 이벤트 및 상태 관리가 들어가는 UI 계층 파일 최상단에는 반드시 `"use client";`를 명시합니다.
- **Vercel 성능 최적화 권장 방식 사용**: 데이터 패칭 시 단순히 `useEffect` 내장 `fetch` 대신 컴포넌트 상단 파싱 로직, SWR, Next.js Server Components, React `cache()` 활용을 적극 고려합니다.

## 3. 백엔드 (Java Spring Boot) 코딩 컨벤션

- **불변 객체 (DTO)**: 컨트롤러와 서비스 계층 간 데이터 전달용 DTO는 모두 Java 14+ `record` 문법으로 작성합니다.
  - ✅ `public record LoginRequestDto(String username, String password) {}`
- **의존성 주입**: 필드 주입(`@Autowired`)을 금지하고, 반드시 롬복(`@RequiredArgsConstructor`)을 활용한 생성자 주입 방식을 사용합니다.
- **타임존 규약**: 모든 날짜와 시각 스탬프는 `OffsetDateTime`(UTC 기준) 또는 명확히 KST를 가리키는 `ZonedDateTime` 구조를 사용하고 프론트에서 변환하여 렌더링합니다.

## 4. 커밋 및 주석 컨벤션

- **주석 언어 규칙**: 모든 소스코드 내 주석은 **한국어**로 작성합니다. AI는 영어 주석 생성을 멈춰야 합니다.
- **Git Commit 메시지**: 
  - `feat: [도메인명] 짧은 작업 설명` (기능 구현 시)
  - `fix: [UI] 로그인 화면 0 렌더링 버그 수정` (버그 수정 시)
  - `refactor: [FSD] auth 기능 features 폴더 이관` (내부 구조 개선 시)
