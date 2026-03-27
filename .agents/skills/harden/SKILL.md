---
name: harden
description: 오류 처리, 다국어(i18n) 지원, 텍스트 넘침 처리 및 예외 상황 관리를 개선하여 인터페이스의 복원력을 높입니다. 인터페이스를 이상적인 디자인에서 벗어나 견고한 프로덕션급으로 만듭니다.
user-invocable: true
argument-hint: [TARGET=<value>]
---

예외 상황(Edge cases), 각종 에러, 다국어 번역 이슈 및 완벽하게 통제된 디자인 시안을 박살 내버리는 현실 세계의 온갖 악의적 사용 시나리오에 맞서 인터페이스의 방어력을 극한으로 끌어올리십시오.

## 결함 및 취약점 평가 (Assess Hardening Needs)

시스템의 약점과 구멍(Edge cases)을 식별합니다:

1. **극단적인 입력(Extreme inputs) 테스트**:
   - 미친 듯이 긴 텍스트 (이름, 상세 설명, 제목)
   - 너무 짧은 텍스트 (아예 값이 없거나 1글자짜리)
   - 특수 문자 및 기호 (이모지, RTL(우측에서 좌측으로 읽는) 텍스트, 억양 기호)
   - 천문학적인 숫자 (수백만, 수십억 단위)
   - 데이터 과부하 (1000개 이상의 리스트 아이템, 50개 이상의 셀렉트 옵션)
   - 텅 빈 데이터 (데이터가 하나도 없는 빈 화면)

2. **재난 및 에러 시나리오 (Error scenarios) 테스트**:
   - 네트워크 연결 붕괴 (오프라인, 극심한 지연, 타임아웃)
   - API 통신 에러 (400, 401, 403, 404, 500)
   - 폼 입력 검증(Validation) 실패
   - 권한 부족(Permission) 에러
   - API 호출 제한(Rate limiting) 초과
   - 동시 다발적인 요청(Concurrent) 충돌

3. **글로벌 다국어 (Internationalization) 테스트**:
   - 텍스트 팽창 (독일어는 영어보다 텍스트 길이가 무려 30%나 더 깁니다)
   - RTL 언어 (아랍어, 히브리어)
   - 다양한 문자셋 (중국어, 일본어, 한국어(CJK), 이모지)
   - 국가별 날짜 및 시간 표기법 차이
   - 국가별 숫자 표기법 차이 (1,000 vs 1.000)
   - 세계 각국의 화폐 기호

**매우 중요한 원칙 (CRITICAL)**: 오직 '완벽하게 정제된 데이터'에서만 예쁘게 보이는 디자인은 프로덕션 앱이 아닙니다. 처참한 현실 세계의 데이터 난장에 맞서 코드를 단단하게 경화(Harden) 시키십시오.

## 회복 전술 (Hardening Dimensions)

다음 목록을 참고하여 시스템의 복원력을 체계적으로 보강합니다:

### 텍스트 범람 및 줄바꿈 통제 (Text Overflow & Wrapping)

**긴 텍스트 방어막**:
```css
/* 1줄 텍스트가 넘칠 시 말줄임표(...) 처리 */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* N줄 텍스트가 넘칠 시 말줄임표 처리 (line-clamp) */
.line-clamp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 텍스트가 컨테이너를 스를 찢고 나가지 못하도록 강제 줄바꿈 */
.wrap {
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto; /* 하이픈 처리를 통한 부드러운 단어 쪼개기 */
}
```

**Flex/Grid에서의 박스 이탈(Overflow) 방지**:
```css
/* Flex 자식 요소가 부모 박스를 비집고 나가지 못하게 통제 */
.flex-item {
  min-width: 0; /* 콘텐츠 크기보다 작아질 수 있도록 허용 (가장 흔한 버그 원인) */
  overflow: hidden;
}

/* Grid 자식 요소가 그리드 트랙을 파괴하지 못하게 통제 */
.grid-item {
  min-width: 0;
  min-height: 0;
}
```

**반응형 텍스트 크기 조정**:
- `clamp()` 함수를 사용하여 뷰포트에 따라 늘어나는 유체(Fluid) 타이포그래피 설계
- 아무리 작아져도 읽을 수 있는 최소 크기 하한선 방어 (모바일 기준 최소 14px)
- 사용자가 200% 확대한 극단적인 줌(Zoom) 환경 상정 및 테스트
- 텍스트 길이가 늘어나면 부모 컨테이너도 찢어지지 않고 유연하게 함께 늘어날 수 있도록 설계

### 국제화 완벽 대응 (Internationalization - i18n)

**텍스트 부피 팽창 대비**:
- 외국어 번역 시 글자가 길어질 것을 대비해 30-40%의 여유 공간(Space budget) 할당
- 고정 픽셀(Fixed width)이 아니라, 내용물에 따라 늘어나는 Flexbox/Grid 레이아웃 규격 사용
- 세상에서 제일 긴 언어(주로 독일어)가 들어왔다고 가정하고 레이아웃 테스트
- 번거롭더라도 텍스트를 감싸는 상자에 고정 넓이(Fixed widths) 쥐여주지 말 것

```jsx
// ❌ 최악: 글자가 짧은 영어일 때만 우연히 작동하는 고정 픽셀 박스
<button className="w-24">Submit</button>

// ✅ 합격: 글자가 길어지면 박스도 양옆으로 같이 늘어남
<button className="px-4 py-2">Submit</button>
```

**오른쪽에서 왼쪽으로 읽는 (RTL) 언어 지원**:
```css
/* left/right 같은 절대 방향 대신, 논리적(Logical) 속성을 지정할 것 */
margin-inline-start: 1rem; /* margin-left (X) */
padding-inline: 1rem; /* padding-left/right (X) */
border-inline-end: 1px solid; /* border-right (X) */

/* 혹은 커스텀 디렉션 [dir='rtl'] 타겟팅 속성을 걸어 화살표 등의 그래픽 아이콘 방향을 뒤집기 */
[dir="rtl"] .arrow { transform: scaleX(-1); }
```

**문자 다형성 (Character set) 지원**:
- 인코딩 체계는 무조건 UTF-8로 전역 통일
- 한중일(CJK) 더블 바이트 문자 입력 환경 테스트
- 바이트 용량을 엄청나게 잡아먹는 이모지(2-4 바이트) 입력 시 DB 스키마 에러 여부 점검
- 라틴어, 키릴어, 아랍어 등 기상천외한 스크립트 대응

**날짜 및 시간 포맷 현지화**:
```javascript
// ✅ 어설프게 문자열 자르고 붙이지 말고, Intl 명세 API를 깔끔하게 쓸 것
new Intl.DateTimeFormat('en-US').format(date); // 1/15/2024
new Intl.DateTimeFormat('de-DE').format(date); // 15.1.2024

// 화폐 기호와 콤마도 마찬가지
new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD' 
}).format(1234.56); // $1,234.56
```

**단복수(Pluralization) 처리 체계**:
```javascript
// ❌ 끔찍함: 라틴계 언어나 복잡한 룰을 가진 언어에서는 이따위 하드코딩 삼항 연산자는 바로 망합니다
`${count} item${count !== 1 ? 's' : ''}`

// ✅ 합격: 세계관 확장을 위해 제대로 된 i18n 라이브러리의 복수형 룰 엔진을 태우세요
t('items', { count }) 
```

### 전방위 오류 처리 (Error Handling)

**네트워크 붕괴 시**:
- 개발자 에러 코드가 아니라, 인간이 알아먹을 수 있는 명확한 원인 메시지 송출
- 재도전(Retry) 버튼 동봉
- 왜 여기까지 왔는지 친절한 설명
- 인터넷 렌선이 뽑혔을 때를 대비한 오프라인 모드 화면 가동
- API 호출이 무한정 길어질 때 끊어버리는 타임아웃(Timeout) 뷰 세팅

```jsx
// 복구 액션이 포함된 모범적인 에러 스테이트
{error && (
  <ErrorMessage>
    <p>데이터를 불러오지 못했습니다. {error.message}</p>
    <button onClick={retry}>다시 시도하기</button>
  </ErrorMessage>
)}
```

**폼(Form) 입력 검증 에러**:
- 에러 원인을 상단에 몰아넣지 말고, 문제를 일으킨 바로 그 인풋 박스 옆에 인라인(Inline)으로 띄우기
- 모호하게 "오류"가 아니라, 정확히 무얼 어겼는지 구체적으로 적시할 것
- 어떻게 하면 고칠 수 있는지 답안지를 줄 것
- 유효성 뚫리지도 않았는데 억지로 전송되게 방치하지 말 것
- 에러가 났다고 해서 지금까지 유저가 기껏 타이핑 쳐놓은 데이터를 자비 없이 다 날려버리지 말 것 (입력값 보존 필수)

**상태 코드별 API 대응 전략**:
- 400 (Bad Request): 입력값이 이상해서 서버가 거부함 (폼 검증 에러 띄우기)
- 401 (Unauthorized): 로그인이 풀리거나 인증 토큰 만료됨 (로그인 페이지로 멱살 잡고 끌고 가기)
- 403 (Forbidden): 권한 없는 쪼렙 유저가 관리자 메뉴 접근함 (권한 부족 에러 메시지 띄우기)
- 404 (Not Found): 삭제되거나 세상에 존재하지 않는 URL (NotFound 빈 상태 화면 띄우기)
- 429 (Too Many Requests): 유저가 미친 듯이 버튼 연타해서 서버가 차단함 (잠시 후 다시 시도하라는 경고 띄우기)
- 500 (Internal Server Error): 백엔드 서버가 터져서 뻗었음 (범용적인 치명적 에러 화면 띄우고 고객센터 연결 넘기기)

**우아한 기능 저하 (Graceful degradation)**:
- 자바스크립트가 완전히 박살 난 환경에서도 브라우저의 코어 기능 자체는 숨을 쉬도록 설계
- 모든 이미지가 엑스박스 떠도 시각장애인이나 크롤러를 위한 대체 텍스트(alt text) 구비
- 점진적 향상(Progressive enhancement) 기법 준수
- 구형 브라우저에서 안 돌아가는 삐까뻔쩍한 CSS는 부드럽게 Fallback UI로 전환

### 모서리 케이스 방어막 (Edge Cases & Boundary Conditions)

**텅 빈 우주 (Empty states)**:
- 리스트에 데이터가 단 한 개도 없을 때
- 검색어가 너무 변태 같아서 결과가 없을 때
- 알림(Notification)이 단 한 줄도 없을 때
- 그냥 아예 아무 데이터도 없을 때
- 이 텅 빈 공간에서 당장 무얼 눌러야 탈출할 수 있는지 강력한 넥스트 액션 유도

**기다림의 미학 (Loading states)**:
- 맨 처음 화면 렌더링 시 (Initial load)
- 페이징 처리로 추가 데이터 불러올 때
- 강제 새로고침(Refresh) 때리거나
- 그냥 빙빙 도는 스피너 말고, "당신의 소중한 프로젝트 목록을 쓸어 담는 중입니다..." 처럼 유머러스하고 안도감 주는 진짜 멘트 치기
- 로딩이 너무 길어지면 남은 예상 시간 체감 게이지 알려주기

**거대한 데이터 쓰나미 (Large datasets)**:
- 데이터가 1만 개라고 한 번에 렌더링 해서 브라우저 터뜨리지 말고 무조건 페이징(Pagination)이나 인피니트 스크롤(Virtual scrolling) 도입
- 방대한 데이터를 제어할 수 있는 검색(Search)/필터(Filter) 컨트롤 타워 장착
- 메모리 누수 방지 등 프론트엔드 퍼포먼스 최적화 방어

**동시 다발적 연타 (Concurrent operations)**:
- 성격 급한 한국인이 결제 버튼 10번 광클할 때 중복 결제 안터지게 로딩 중 버튼 클릭 비활성화(Disable) 락 걸기
- 서로 다른 요청이 꼬이는 레이스 컨디션(Race conditions) 차단
- 로딩 없이 완료된 척 눈속임하는 긍정적 UI(Optimistic updates) 적용 시 서버 터지면 슬그머니 롤백(Rollback)하는 방어 로직 설계
- 데이터 충돌(Conflict resolution) 무마

**보안 등급 통제 (Permission states)**:
- 볼펜 들 권한조차 없는 읽기 시도 차단
- 남의 글 고치려는 얌체 같은 수정 시도 차단
- 안전한 감옥인 읽기 전용(Read-only) 모드 제공
- 왜 당신이 이 버튼을 못 누르고 쫓겨나는지 친절명확한 사유 공개

**크로스 브라우징 생존 (Browser compatibility)**:
- IE 시절 할아버지 브라우저를 멱살 잡고 끌고 오는 폴리필(Polyfills) 수혈
- 호환 안되는 최신 CSS를 위한 튼튼한 대피소(Fallbacks)
- 브라우저 이름으로 조건식 짜는 미개한 짓 말고 철저한 기능(Feature) 감지 로직 구사

### 철벽 검증 및 소독 (Input Validation & Sanitization)

**클라이언트단 방어벽 (Client-side validation)**:
- 빈칸 허용 불가 (Required)
- 이메일, 전화번호 뚫리지 않는 포맷 검증 정규식(Pattern matching)
- 글자 수 제한 안전망 묶기 (Length limits)
- 요상한 특수 문자 블락 치는 자체 커스텀 검증 룰

**서버단 최후의 방어선 (Server-side validation) (선택이 아니라 절대 의무)**:
- 프론트엔드에서 보낸 데이터는 무조건 해커의 조작본이라 의심하고 절대 믿지 말 것
- 들어오는 모든 인풋에 락스 들이붓기 (Sanitize)
- SQL Injection 및 XSS 공격 무력화 쉴드전개
- API 연타로 서버 마비 시키는 짓 막기 위한 Rate limiting

**웹 표준 제약 조건 선언 (Constraint handling)**:
```html
<!-- 날 것의 자바스크립트에 의존하기 전, HTML 스펙 자체에서 숨 막히는 제약을 걸어주세요 -->
<input 
  type="text"
  maxlength="100"
  pattern="[A-Za-z0-9]+"
  required
  aria-describedby="username-hint"
/>
<small id="username-hint">
  영문자와 숫자만 사용, 최대 100자까지 허용됩니다.
</small>
```

### 접근성 생존 (Accessibility Resilience)

**키보드 무투파 지원 (Keyboard navigation)**:
- 마우스 집어 던지고 오직 탭(Tab) 키보드만으로 앱의 처음 끝까지 완벽 종주가 가능하도록 설계
- 역행하지 않고 물 흐르듯 이어지는 논리적인 탭 포커스 오더(Tab order)
- 모달(Modal) 창 띄웠을 때 밖으로 포커스 안 새어나가게 그물 쳐서 가두기 (Focus management)
- 귀찮은 내비게이션 바 건너뛰고 본문으로 직행하는 '스킵 링크(Skip links)' 매설

**시각 장애우 지원 (Screen reader support)**:
- 기계가 완벽히 소리 내어 읽어줄 수 있도록 성실한 ARIA 라벨 부착
- 화면 어딘가 몰래 바뀌는 동적 상태(Live regions)를 스피커로 중계해주기
- 그림과 사진을 묘사해 주는 섬세한 Alt Text 구비
- div 떡칠이 아닌 영혼이 깃든 시맨틱(Semantic) 태그 작성

**모션 멀미 스위치 (Motion sensitivity)**:
```css
/* OS 설정에서 '애니메이션 줄이기'를 켠 멀미 호소 환자들을 위해 모든 애니메이션을 즉각 정지시킬 것 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**고대비 모드 방어 (High contrast mode)**:
- 윈도우(Windows)의 고대비 테마 모드에서도 시인성이 생존하는지 체크
- '색깔' 에만 유일하게 의존해서 뜻을 구별하게 만들지 마세요 (어두워져도 형태가 살아야 함)
- 테두리 선이나 형태 같은 튼튼한 시각적 단서를 병행 제공

### 피지컬 한계 돌파 (Performance Resilience)

**최악의 인터넷 환경 (Slow connections)**:
- 3G 환경에서도 점진적으로 렌더링되며 뼈태부터 그려지는 점진적 이미지 로딩 채용
- 텅 빈 백지가 아닌 스켈레톤(Skeleton UI) 스크린으로 기대감 부여
- 성공할 거라 짬짜미 치고 화면부터 바꿔버리는 긍정적 UI(Optimistic UI) 업데이트
- 오프라인 지하철에서도 캐시 물고 돌아가는 서비스 워커(Service workers) 구축

**메모리 좀비 사냥 (Memory leaks)**:
- 마운트 해제될 때 똥싸지 말고 이벤트 리스너(Event listeners) 제발 다 치울 것
- 살아 숨 쉬는 구독(Subscriptions) 연결 싹 다 수거
- 깜빡이는 타이머/인터벌(Intervals) 잔재 지우기
- 페이지 넘길 때 뒤에서 여전히 돌고 있는 API 미결 요청(pending)들 목 쳐서 중단(Abort)시키기

**광클 및 연타 방어 (Throttling & Debouncing)**:
```javascript
// 서치바에 1글자 칠때마다 서버 치는 미친 짓을 막고, 마지막 타자 치고 0.3초 쉰 다음에 서버 치게 묶어두기 (Debounce)
const debouncedSearch = debounce(handleSearch, 300);

// 스크롤 한 틱 내릴 때마다 함수 100번 호출되는 지옥을 0.1초 쿨타임 걸어서 막아내기 (Throttle)
const throttledScroll = throttle(handleScroll, 100);
```

## 전투 시뮬레이션 (Testing Strategies)

**인간의 수동 난도질 (Manual testing)**:
- 비정상적인 극단치 데이터(초절정 롱, 글자 없음) 억지로 때려 박기
- 구글 번역기 돌려서 언어 환경 다 깨버려 보기
- 와이파이 확 끄고 앱 조작해 보기
- 브라우저 디버거 켜고 3G 모드로 조작해 보기
- 화면 끄고 스크린 리더 음성만 들으며 사이트 탈출해 보기
- 마우스 박살 내고 키보드 탭 키로만 회원가입 해보기
- 크롬 버리고 구식 브라우저에서 돌려보기

**자동화 로봇 테스트 (Automated testing)**:
- 개별 모듈의 비정상 값 방어를 점검하는 단위 테스트(Unit tests)
- 에러 상황 연출에 촛점을 맞춘 통합 테스트(Integration tests)
- 유저 동선 최중요 척추 라인을 지키는 종단 간(E2E) 테스트
- 1픽셀 틀어지는 것도 잡아내는 컴포넌트 시각 회귀 테스트 (Visual regression)
- 기계적으로 돌려보는 접근성 점검 봇 (axe, WAVE 등)

**절대 잊지 마십시오 (IMPORTANT)**: 시스템 경화(Hardening)의 본질은 '상상도 못 한 짓'을 대비하는 태도입니다. 현실 세계의 유저들은 당신이 상상조차 하지 못한 끔찍하고 해괴한 방식으로 앱을 박살 낼 것입니다.

**절대로 하면 관짝 들어가는 짓 (NEVER)**:
- "유저들이 알아서 예쁜 데이터만 넣겠지" 하는 낭만적인 착각 (Validate everything)
- "나만 좋으면 돼" 라며 글로벌 대비(Internationalization) 다 내다 버리는 방관
- 에러 사유가 백 개인데 그냥 퉁쳐서 "에러 발생" 4글자로 끝내버리는 양아치 근성
- 휴대폰 기지국 안 터지는 지하 터널의 절망감(Offline)을 상상조차 안 해본 태만
- 서버 단 검증 다 생략하고 얄팍한 클라이언트 막에만 모든 보안을 넘기는 직무 유기
- 텍스트 박스 크기를 무식한 고정 픽셀(Fixed widths) 로 묶어서 다 깨지게 만들기
- 모든 언어의 길이가 무조건 '영어(English)' 사이즈와 동일할 것이란 우물 안 개구리식 망상
- 저기 구석에 하찮은 위젯 하나 박살 났다고 사이트 전체가 하얀 화면(White Screen of Death) 뿜으며 동반 자살하게 두는 에러 바운더리(Error boundary) 결여

## 최후의 복원력 심사 (Verify Hardening)

다음과 같은 악마의 시나리오 통과 여부를 검증하십시오:

- **긴 텍스트 공세**: 이름 표기란에 100자가 넘는 문자열 투여
- **이모지 폭격**: 모든 인풋 폼에 외계인 이모지 10개씩 박아넣기
- **방향 교란**: 국가 설정을 아랍어나 히브리어로 꺾었을 때 좌우 정렬 깨짐 확인
- **CJK 렌더링**: 중국어/일본어/한국어 문자열의 행간 폭발 확인
- **랜선 단절**: 인터넷 차단 후 조작, 초저속 통신 환경 흉내 내어 조작
- **데이터 폭식**: 1,000개 이상의 배열을 리스트 컴포넌트에 통째로 쏟아버리기
- **빛의 속도 연타**: 저장 버튼을 1초 안에 10번 광클했을 때의 서버 뻗음 여부
- **가짜 에러 발동**: 백엔드 응답을 강제로 조작하여 기상천외한 에러 코드별 복원 화면 출력 체크
- **초토화 작전**: DB 데이터를 강제로 다 지워버린 후 튀어나오는 모든 빈 화면(Empty states) 방어선 구축 확인

기억하세요: 당신은 언제 터질지 모르는 프로덕션 지뢰밭을 걷기 위해 시스템에 방탄조끼를 입히고 있는 것입니다. 전시회용 데모 앱이 아닙니다. 사용자들은 외계어를 입력할 것이고, 결제 중간에 전화기가 끊길 것이며, 당신이 쳐둔 기획 의도를 처참히 짓밟을 것입니다. 모든 작은 컴포넌트 하나에도 불사조와 같은 엄청난 자기 복원성(Resilience)을 욱여넣으십시오.