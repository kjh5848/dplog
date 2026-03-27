# 디자인 시스템 마스터 파일

> **로직:** 특정 페이지를 만들 때는 먼저 `design-system/pages/[page-name].md`를 확인합니다.
> 해당 파일이 있으면 그 규칙이 이 마스터 파일을 **우선**합니다.
> 없으면 아래 규칙을 그대로 따릅니다.

---

**프로젝트:** D-PLOG
**생성:** 2026-02-07 14:35:08
**카테고리:** 마이크로 SaaS

---

## 전역 규칙

### 색상 팔레트

| 역할 | Hex | CSS 변수 |
|------|-----|---------|
| Primary | `#6366F1` | `--color-primary` |
| Secondary | `#818CF8` | `--color-secondary` |
| CTA/Accent | `#10B981` | `--color-cta` |
| Background | `#F5F3FF` | `--color-background` |
| Text | `#1E1B4B` | `--color-text` |

**색상 노트:** 인디고 기본 + 에메랄드 CTA

### 타이포그래피

- **헤딩 폰트:** Poppins
- **바디 폰트:** Open Sans
- **무드:** modern, professional, clean, corporate, friendly, approachable
- **Google Fonts:** [Poppins + Open Sans](https://fonts.google.com/share?selection.family=Open+Sans:wght@300;400;500;600;700|Poppins:wght@400;500;600;700)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap');
```

### 간격(Spacing) 변수

| 토큰 | 값 | 용도 |
|------|----|------|
| `--space-xs` | `4px` / `0.25rem` | 촘촘한 간격 |
| `--space-sm` | `8px` / `0.5rem` | 아이콘/인라인 간격 |
| `--space-md` | `16px` / `1rem` | 기본 패딩 |
| `--space-lg` | `24px` / `1.5rem` | 섹션 패딩 |
| `--space-xl` | `32px` / `2rem` | 큰 간격 |
| `--space-2xl` | `48px` / `3rem` | 섹션 마진 |
| `--space-3xl` | `64px` / `4rem` | 히어로 패딩 |

### 그림자(Shadow) 단계

| 레벨 | 값 | 용도 |
|------|----|------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | 약한 띄움 |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | 카드, 버튼 |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | 모달, 드롭다운 |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | 히어로 이미지, 피처 카드 |

---

## 컴포넌트 사양

### 버튼

```css
/* Primary Button */
.btn-primary {
  background: #10B981;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #6366F1;
  border: 2px solid #6366F1;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### 카드

```css
.card {
  background: #F5F3FF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### 입력(Input)

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #6366F1;
  outline: none;
  box-shadow: 0 0 0 3px #6366F120;
}
```

### 모달

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## 스타일 가이드

**스타일:** Flat Design

**키워드:** 2D, minimalist, bold colors, no shadows, clean lines, simple shapes, typography-focused, modern, icon-heavy

**적합 대상:** 웹 앱, 모바일 앱, 크로스플랫폼, 스타트업 MVP, 사용자 친화 서비스, SaaS, 대시보드, 기업 서비스

**핵심 효과:** 그라데이션/강한 그림자 배제, 컬러/투명도 중심의 단순 호버, 빠른 로딩, 150-200ms 전환, 최소한의 아이콘

### 페이지 패턴

**패턴 이름:** Funnel (3-Step Conversion)

- **전환 전략:** 단계별 핵심 정보만 노출, 진행 상태 표시, 복수 CTA 구성
- **CTA 배치:** 각 단계 미니 CTA, 마지막 단계 메인 CTA
- **섹션 순서:** 1. Hero, 2. Step 1 (문제), 3. Step 2 (해결), 4. Step 3 (행동), 5. CTA 진행

---

## 금지 패턴 (사용 금지)

- ❌ 복잡한 온보딩 플로우
- ❌ 과도한 정보 밀도/혼잡한 레이아웃

### 추가 금지 항목

- ❌ **이모지 아이콘 사용 금지** — SVG 아이콘만 사용 (Heroicons/Lucide/Simple Icons)
- ❌ **cursor:pointer 누락 금지** — 모든 클릭 요소에 cursor:pointer 지정
- ❌ **레이아웃 흔들림 호버 금지** — 레이아웃을 흔드는 scale 변형 금지
- ❌ **낮은 대비 텍스트 금지** — 최소 4.5:1 대비 유지
- ❌ **즉시 상태 변화 금지** — 150-300ms 전환 필수
- ❌ **포커스 상태 숨김 금지** — 키보드 포커스가 반드시 보여야 함

---

## 사전 체크리스트

코드 전달 전 반드시 확인:

- [ ] 이모지 아이콘 미사용 (SVG 아이콘만 사용)
- [ ] 아이콘 세트 일관성 유지 (Heroicons/Lucide)
- [ ] 모든 클릭 요소에 `cursor-pointer`
- [ ] 호버/상태 전환 150-300ms 적용
- [ ] 라이트 모드 텍스트 대비 4.5:1 이상
- [ ] 키보드 내비게이션 포커스 상태 명확
- [ ] `prefers-reduced-motion` 반영
- [ ] 반응형: 375px, 768px, 1024px, 1440px
- [ ] 고정 네비게이션에 컨텐츠가 가려지지 않음
- [ ] 모바일 가로 스크롤 없음
