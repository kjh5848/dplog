---
name: optimize
description: 로딩 속도, 렌더링, 애니메이션, 이미지, 그리고 번들 사이즈에 걸친 인터페이스 성능을 개선합니다. 사용자 경험을 더 빠르고 매끄럽게 만듭니다.
user-invocable: true
argument-hint: [TARGET=<value>]
---

사용자 경험을 기절할 만큼 빠르고 버터처럼 매끄럽게 만들기 위해 성능 병목 현상을 진단하고 뜯어고칩니다.

## 성능 질병 진단 (Assess Performance Issues)

현재 상태를 파악하고 썩어가는 부위를 도려내기 전 체계적인 검사를 실시하십시오:

1. **현재 상태의 정량적 측정 (Measure current state)**:
   - **코어 웹 바이탈 (Core Web Vitals)**: LCP(최대 콘텐츠 풀 페인트), FID/INP(상호작용 지연), CLS(누적 레이아웃 이동) 점수 측정
   - **로딩 타임라인 (Load time)**: TTI(상호작용 도달 시간), FCP(최초 콘텐츠 풀 페인트)
   - **초고도 비만도 (Bundle size)**: 무식하게 부풀어 오른 JavaScript, CSS, 거대 이미지 파일 용량
   - **런타임 체력 (Runtime performance)**: 프레임 레이트(FPS), 메모리 누수 점유율, CPU 갉아먹는 수치
   - **통신망 부하 (Network)**: 미친 듯이 찔러대는 API Request 횟수, 무거운 페이로드(Payload) 크기, 네트워크 폭포(Waterfall) 현상

2. **암 덩어리 적발 (Identify bottlenecks)**:
   - 도대체 어디서 느려 터지는가? (초기 접속 시? 클릭할 때? 스크롤 애니메이션 뛸 때?)
   - 주범은 누구인가? (20MB짜리 무손실 이미지? 쓸데없이 무거운 JS 라이브러리? DOM 레이아웃 스래싱?)
   - 체감상 얼마나 끔찍한가? (티도 안 나는 수준? 묘하게 거슬림? 아예 브라우저가 굳어버림?)
   - 누가 고통받는가? (모든 유저? 구형 똥폰 쓰는 모바일 유저? 인터넷 느린 지하철 유저?)

**절대 강령 (CRITICAL)**: 칼을 대기 전에 무조건 수치부터 재십시오(Measure before and after). 감에 의존한 섣부른 최적화(Premature optimization)는 시간 낭비의 주범입니다. 진짜로 체감되는 '진짜 병목'만 타격하십시오.

## 전방위 최적화 수술 계획 (Optimization Strategy)

시스템을 쾌적하게 뚫어버릴 체계적인 개선 플랜을 가동합니다:

### 로딩 퍼포먼스 (Loading Performance)

**애물단지 이미지 최적화 (Optimize Images)**:
- 시대에 뒤떨어진 JPG/PNG 버리고 무조건 차세대 포맷(WebP, AVIF)으로 강제 변환
- 자기 분수에 맞는 사이즈 구비 (모바일 화면 300px 짜리에 3000px 원본 이미지 때려 박는 미친 짓 금지)
- 스크롤 내려야 보이는 밑바닥 이미지들은 철저히 레이지 로딩(`loading="lazy"`) 적용
- 화면 크기별로 골라 먹이는 반응형 이미지 소스 세팅 (`srcset`, `picture` 태그)
- 자비 없는 썸네일 압축 (품질을 80-85%로 후려쳐도 인간의 육안으로는 절대 구분 못 함)
- 빛의 속도로 꽂아주는 CDN(Content Delivery Network) 탑승

```html
<img 
  src="hero.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  loading="lazy"
  alt="메인 히어로 이미지"
/>
```

**JavaScript 번들 다이어트 (Reduce JavaScript Bundle)**:
- 코드 스플리팅 (Code splitting): 한 번에 다 받지 말고 라우트(Route) 단위, 컴포넌트 단위로 쪼개서 배달
- 가지치기 (Tree shaking): 임포트 해놓고 단 한 번도 안 쓴 죽은 코드들(Dead code) 모조리 벌목
- 안 쓰는 무거운 서드파티 의존성 패키지(Dependencies) 색출 및 숙청
- 지금 당장 안 쓰는 비핵심 코드는 뒤로 미루기 (Lazy load)
- 화면 무자비하게 잡아먹는 거대 컴포넌트는 다이나믹 임포트(Dynamic imports)로 격리

```javascript
// 무거운 차트 컴포넌트는 사용자가 클릭할 때까지 절대 로드하지 않음 (Lazy load)
const HeavyChart = lazy(() => import('./HeavyChart'));
```

**CSS 다이어트 (Optimize CSS)**:
- 안 쓰는 유령 CSS 클래스 모조리 청소
- 페이지 뜰 때 당장 눈에 띄는 크리티컬(Critical) CSS는 인라인으로 바르고, 나머지는 비동기(Async)로 뒤에서 조용히 부르기
- 무식하게 분할된 CSS 파일 하나로 병합 후 압축(Minify)
- 독립된 구역엔 CSS `contain` 속성을 걸어 브라우저 렌더링 부하 차단

**타이포그래피 로딩 (Optimize Fonts)**:
- 글꼴 늦게 뜬다고 화면 백지로 두지 말고 폰트 스왑(`font-display: swap` 또는 `optional`) 투입
- 안 쓰는 한자/외계어 빼고 서브셋(Subset) 폰트로 경량화 (필요한 문자만 추출)
- 제일 중요한 헤드라인 폰트는 미리 당겨오기 (Preload)
- 웬만하면 구글 폰트 말고 사용자 기기에 이미 깔린 시스템 폰트(System fonts) 적극 기용
- 100부터 900까지 폰트 굵기 종류 다 불러오는 멍청한 짓 멈추고 딱 쓰는 2개만 선별 로드

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* 커스텀 폰트 뜰 때까지 브라우저 기본 폰트 먼저 띄워서 텍스트 노출 */
  unicode-range: U+0020-007F; /* 라틴어 기본 영역만 로컬 캐싱 */
}
```

**전략적 로딩 사령부 (Optimize Loading Strategy)**:
- 렌더링 막는 JS 쓰레기들은 `async/defer` 달아서 뒤로 치워버리고 크리티컬 리소스 먼저 통과
- 다음에 유저가 100% 누를 것 같은 예상 페이지 리소스는 몰래 미리 당겨오기 (Prefetch)
- 오프라인 탈주자를 대비한 서비스 워커(Service worker) 캐싱망 구축
- 우르르 한 번에 다 받는 병렬 통신 고속도로 (HTTP/2 또는 HTTP/3) 개통

### 렌더링 퍼포먼스 (Rendering Performance)

**DOM 레이아웃 스래싱 학살 (Avoid Layout Thrashing)**:
```javascript
// ❌ 최악의 짓: 읽고(Read) 쓰고(Write)를 핑퐁치면 브라우저가 레이아웃을 계속 새로 그리느라 피를 토함 (Reflow 지옥)
elements.forEach(el => {
  const height = el.offsetHeight; // 읽기 (레이아웃 계산 강제)
  el.style.height = height * 2; // 쓰기 (DOM 조작)
});

// ✅ 구원: 읽기 턴에 다 같이 한 번에 읽고, 쓰기 턴에 다 같이 한 번에 쓴다 (Batching)
const heights = elements.map(el => el.offsetHeight); // 읽기 싹 다 몰아서
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2; // 쓰기 싹 다 몰아서
});
```

**렌더링 병목 타파 (Optimize Rendering)**:
- 지들끼리 독립된 박스는 CSS `contain` 걸어서 딴 놈들 렌더링할 때 엮이지 않게 쉴드 치기
- DOM 트리 깊이를 무자비하게 펴버리기 (Flatter is faster. div 안의 div 안의 div 구조 파괴)
- DOM 노드 개수 다이어트 (안 쓰는 빈깡통 태그들 싹 다 숙청)
- 리스트가 1만 개면 화면 밖 리스트는 보이지 않게 숨통 끊기 (`content-visibility: auto`)
- 미친 듯이 스크롤 긴 놈들은 가상화 스크롤(Virtual scrolling: react-window, react-virtualized)로 화면에 보이는 10개만 돌려막기

**페인트 & 컴포지트 부하 절감 (Reduce Paint & Composite)**:
- 애니메이션 줄 때 절대 `width, height, top, left` 건드려서 브라우저 생고생시키지 말 것
- 무조건 GPU가 공짜로 처리해 주는 `transform` 과 `opacity` 만 가지고 애니메이션 조립 (GPU-accelerated)
- 나중에 빡세게 변할 것 같은 요소만 골라서 `will-change` 딱지 살포시 붙여놓기 (남발 금지)
- 한 번 스크롤 내릴 때 다시 칠해야 하는 영역(Paint area)을 극한으로 조각조각 쪼개버리기

### 애니메이션 퍼포먼스 (Animation Performance)

**GPU 가속 버퍼링 (GPU Acceleration)**:
```css
/* ✅ 천국: GPU가 알아서 스무스하게 밀어주는 갓-가속 (빠름) */
.animated {
  transform: translateX(100px);
  opacity: 0.5;
}

/* ❌ 지옥: 메인 CPU가 1픽셀씩 일일이 포토샵으로 옮겨서 그리는 막노동 (끊김, 느려 터짐) */
.animated {
  left: 100px;
  width: 300px;
}
```

**스무스 60프레임 사수 (Smooth 60fps)**:
- 1프레임당 무조건 16ms(밀리초) 안에 렌더링 턴을 완료해 60fps 절대 사수
- 자바스크립트로 강제로 애니메이션 줄 땐 `setTimeout` 따위 버리고 무조건 `requestAnimationFrame` 탑승
- 스크롤 내를 때마다 함수 100번씩 쏘는 미친 짓 막기 위해 디바운스(Debounce)/스로틀(Throttle) 자물쇠 채우기
- 자바스크립트 버리고 웬만하면 영혼을 담은 CSS 애니메이션으로 퉁치기
- 화면 이쁘게 날아가고 있는데 그 사이에서 돌아가는 무거운 뒤끝 로직 함수들 싹 다 애니메이션 끝날 때까지 대기(Pause) 시키기

**인터섹션 옵저버 스나이핑 (Intersection Observer)**:
```javascript
// 스크롤 좌표 1px마다 계산하는 똥멍청이 짓 금지. 요소가 화면에 '뿅' 나타났을 때만 총 쏘기
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // 컴포넌트 눈에 띄었다! 이 순간 레이지 로딩이나 애니메이션 격발
    }
  });
});
```

### 프레임워크 최적화 (React/Framework Optimization)

**리액트 전용 처방전 (React-specific)**:
- 무식하게 렌더링할 때마다 계산하는 미친 놈은 `memo()`로 결과값 박제시켜 놓기
- 돈 많이 드는 비싼 연산은 `useMemo()`와 `useCallback()` 금고에 가둬두기
- 천 개, 만 개짜리 배열은 무조건 가상 머신(Virtualize) 리스트로 렌더링
- 한 번에 다 갖다 바치지 말고 라우트(Routes) 쪼개서 로딩(Code splitting)
- `render()` 함수나 리턴문 안에서 일회용 익명 함수 만들어대는 짓 금지 (매번 번지수(참조) 바뀌어서 렌더링 낭비)
- 툭하면 React DevTools Profiler 켜서 뻘겋게 열받는 컴포넌트 족치기

**모든 프레임워크 공통 (Framework-agnostic)**:
- 쓸데없는 헛스윙 리렌더링(re-renders) 철저한 통제
- 1초에 100번 불리는 함수는 스로틀/디바운스로 쿨타임(Debounce) 먹이기
- 두 번 계산하지 말고 산출된 값 영구보존(Memoize)
- 귀찮은 라우트와 무거운 화면은 뒤로 싹 다 미루기 (Lazy load)

### 네트워크 최적화 (Network Optimization)

**통신 횟수 난도질 (Reduce Requests)**:
- 조무래기 파일들 한 덩어리로 묶어서 보내기
- 아이콘 100개마다 요청 보내지 말고 SVG 스프라이트(Sprites)로 압축팩 하나로 퉁치기
- 콩알만 한 에셋은 아예 코드 안에 문신 새겨버리기 (Inline base64)
- 1년 전에 깔고 아무도 안 쓰는 구글 애널리틱스나 망한 플러그인(Third-party scripts) 찌꺼기 싹 다 소각

**API 통신 최적화 (Optimize APIs)**:
- 10만 개 다 달라고 떼쓰지 말고 10개씩 쪼개 바치는 무한 스크롤(Pagination) 장착
- RestAPI로 쓰레기 데이터까지 긁어오지 말고 GraphQL로 딱 쓸 것만 핀셋 주문
- 서버에서 던질 때 무조건 압축 머신(gzip, brotli) 돌려서 응답
- HTTP 캐시 헤더(HTTP caching headers) 영리하게 세팅해서 두 번 통신 안 하게 막기

**거북이 망(3G) 대응 전술 (Optimize for Slow Connections)**:
- 인질방패(navigator.connection) 세워서 접속자 폰 인터넷 구리면 해상도 꾸진 거 던져주는 적응적 로딩(Adaptive loading)
- 서버 응답 오기 전부터 이미 저장된 척 눈속임하는 긍정적 UI (Optimistic UI updates)
- 중요한 놈부터 먼저 렌더링 살려주는 요청 우선순위(Request prioritization) 배정
- 일단 버튼부터 숨 쉬게 해놓고 디자인은 나중에 입히는 점진적 향상(Progressive enhancement) 기조

## 코어 웹 바이탈 타격 (Core Web Vitals Optimization)

### LCP 2.5초 방어 (Largest Contentful Paint < 2.5s)
- 화면 켜자마자 제일 큰 비중을 차지하는 왕건이 히어로(Hero) 이미지를 빛의 속도로 튜닝
- 눈에 보이는 위쪽 크리티컬 CSS는 HTML 헤더에 인라인으로 꽂아버리기
- 제일 중요한 소스는 브라우저 멱살 잡고 `Preload` 시키기
- SSR 서버 사이드 렌더링 병용

### FID 100ms / INP 200ms 한계 돌파 (First Input Delay / Interaction to Next Paint)
- 미친듯이 꼬여서 브라우저 멈추게 하는 긴 자바스크립트 로직(Long tasks)을 잘게 쪼개서 숨통 틔우기
- 쓸데없는 자스는 전부 다 렌더링 이후로 유배(Defer)
- 무거운 수학 계산은 메인 스레드 건드리지 말고 하청업체(Web Workers)로 토스

### CLS 0.1 퍼펙트 무빙 (Cumulative Layout Shift < 0.1)
- 덜컥! 하고 레이아웃 무너지는 꼴 보기 싫으면 모든 이미지와 동영상에 무조건 가로세로 규격(Dimensions) 박아놓기
- 유저가 이미 뭐 읽고 있는데 그 위에 뜬금없이 광고나 배너 훅 끼워 넣는 양아치 짓 금지
- 뼈대부터 잡는 `aspect-ratio` CSS 속성 풀가동
- 광고(Ads)나 외부 임베드 박힐 자리 미리 스폰지처럼 예약 확보(Reserve space)해 두기
- 레이아웃(Layout) 자체를 흔들어대는 어설픈 애니메이션 사형

```css
/* 유튜브나 이미지 뜰 자리 미리 자리 잡아놔서 로딩 다 돼도 화면 안 밀리게 방어 */
.image-container {
  aspect-ratio: 16 / 9;
}
```

## 현미경 감시망 (Performance Monitoring)

**사용 무기 (Tools to use)**:
- 브라우저 외과용 메스 (Chrome DevTools: Lighthouse, Performance panel)
- 웹 페이지 글로벌 X-ray (WebPageTest)
- 실체 체감 데이터 팩폭 (Chrome UX Report, Core Web Vitals)
- 번들 비만도 스캐너 (webpack-bundle-analyzer)
- 라이브 감시 CCTV (Sentry, DataDog, New Relic)

**반드시 지표로 남길 것 (Key metrics)**:
- 3대 웹 바이탈장 (LCP, FID/INP, CLS)
- 상호작용 개시 시간 (Time to Interactive - TTI)
- 최초의 빛줄기 (First Contentful Paint - FCP)
- 막혀서 숨 못 쉰 시간 (Total Blocking Time - TBT)

**결정적 경고 (IMPORTANT)**: M3 맥북 프로 꽂은 빵빵한 사내 기가 와이파이 환경에서 테스트하고 자위하지 마십시오. 지하철에서 끊기는 3년 된 안드로이드 보급형 폰(Real network conditions)으로 돌려보는 게 진짜 현실입니다.

**절대로 하면 관짝 들어가는 짓 (NEVER)**:
- 수치(Measure)도 안 재보고 무쌍 찍으며 일단 소스코드부터 갈아엎는 조급증 (Premature optimization)
- 1ms 빨리 돌리겠다고 시각 장애인 접근성(Accessibility) 탭 내비게이션 다 박살 내버리기
- 최적화한답시고 멀쩡히 돌아가던 코어 비즈니스 로직(Functionality) 부숴먹기
- 가속한답시고 모든 것에 `will-change` 발라서 메모리 누수 지옥 만들기
- 첫 화면에 떡하니 나와야 할 상단 콘텐츠(Above-fold)에 레이지 로딩(`loading="lazy"`) 걸어버리는 바보짓
- 20MB짜리 썩은 이미지가 문제인데 1KB 줄이는 자바스크립트 변수명 축소(Micro-optimizations)에 목숨 거는 방향 상실
- 폰(Mobile) 환경은 개무시하고 와이드 스크린에서만 쾌적하게 깎아놓는 자기 기만

## 최후의 승전 점검 (Verify Improvements)

최적화 수술이 성공했음을 어떻게 입증할 것인가:

- **비포 & 애프터 검증 (Before/after metrics)**: 수술 전 라이트하우스(Lighthouse) 50점짜리가 수술 후 95점이 되었는지 수치로 타격
- **리얼 월드 체감 (Real user monitoring)**: 진짜 라이브 서버에 붙은 현지 유저들의 지표가 떡상했는가?
- **고철폰 테스트 (Different devices)**: 최고급 아이폰 말고 굴러다니는 구형 안드로이드 똥폰에서도 버벅임이 없는가?
- **지옥불 네트워크 (Slow connections)**: 크롬 네트워크 탭 3G로 걸어 잠그고 돌려봐도 숨통이 트이는가?
- **아군(기능) 피해 확인 (No regressions)**: 최적화한답시고 결제 버튼이나 핵심 워크플로우를 부러뜨리지 않았는가?
- **본능적 감각 (User perception)**: 그냥 마우스 슥 긁었을 때... **확실히 더럽게 빠르다고 '체감(Feel)'이 오는가?**

잊지 마십시오: '성능' 그 자체가 최고의 '기능(Feature)'이자 위대한 인터페이스 디자인입니다. 0.1초의 거침없는 반응 속도야말로 사용자에게 깊은 안도감, 압도적인 세련미, 프로페셔널한 브랜드 가치를 뇌리에 꽂아 넣는 가장 강력한 무기임을 명심하십시오. 무자비하게 측정하고, 타협 없이 깎아내어 최고의 퍼포먼스를 조각해 내십시오.