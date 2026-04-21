# D-PLOG Design Tokens (Toss UI Style)

이 문서는 D-PLOG 프론트엔드 프로젝트에 적용되는 **토스(Toss) 스타일 다자인 토큰 및 UI 컴포넌트 시스템**의 기준을 정의합니다.

## 1. Typography (폰트 및 타이포그래피)

- **기본 폰트**: `Pretendard` (프리텐다드)
  - 폴백: `-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif`
  - 특징: 깨끗하고 중립적인 산세리프 폰트로, 숫자의 간격과 영문/한글 혼용 시의 가독성이 뛰어납니다.

- **한국어 웹 타이포그래피 규칙 (Korean Typography)**:
  - `word-break: keep-all;`: 한글 텍스트에서 단어 단위로 줄바꿈을 강제하여 문장에 뚝뚝 끊기는 느낌을 방지합니다.
  - `overflow-wrap: break-word;`

## 2. Color System (색상 시스템)

토스 특유의 차분하면서도 명도가 높은 포인트 컬러를 사용합니다.

### 2.1. Grayscale & Text (무채색 및 텍스트)
| Token | Hex | Tailwind | 용도 |
| :--- | :--- | :--- | :--- |
| **Title** | `#191F28` | `text-[#191F28]` | 최상위 헤딩, 화면 타이틀 (h1, h2) |
| **Body** | `#333D4B` | `text-[#333D4B]` | 일반적인 본문 텍스트 (p, span) |
| **Subtext** | `#4E5968` | `text-[#4E5968]` | 부가적인 텍스트, 라벨, 캡션 |
| **Muted** | `#8B95A1` | `text-[#8B95A1]` | 덜 중요한 정보, 비활성화 텍스트 |
| **Border / Divider** | `#E5E8EB` | `border-slate-200` | 선, 경계선, 인풋 테두리 |
| **Background (Card)** | `#FFFFFF` | `bg-white` | 카드의 기본 백그라운드 |
| **Background (Body)** | `#F2F4F6` | `bg-[#F2F4F6]` | 화면의 가장 밑단 배경이나 섹션 분리 배경 |

### 2.2. Brand & Semantic Colors (브랜드 및 의미 폰트)
| Token | Hex | Tailwind | 용도 |
| :--- | :--- | :--- | :--- |
| **Primary (Blue)** | `#3182F6` | `bg-[#3182F6]` | 가장 중요한 CTA 버튼, 메인 브랜드 포인트 |
| **Primary Hover** | `#1B64DA` | `bg-[#1B64DA]` | Primary 버튼 호버 |
| **Success / Positive** | `#10B981` | `text-emerald-500` | 긍정 지표 (순위 상승, 수익 증가 등) |
| **Alert / Warning**| `#F04452` | `text-rose-500` | 경고 지표 (순위 하락, 악플러, 경고 등) |

## 3. UI Components & Glassmorphism

### 3.1. Surface & Cards
- **기본 카드 (Solid)**: `bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 rounded-[24px]`
- **글래스모피즘 카드 (Glass)**: `bg-white/70 backdrop-blur-xl border border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)]`
- **강조 CTA 영역**: `bg-[#F2F4F6] hover:bg-[#E5E8EB] active:bg-[#D1D6DB]`

### 3.2. Scrollbar (커스텀 스크롤바)
토스 특유의 얇고 매끈한 스크롤바.
- Width: `6px`
- Track: `#f1f5f9`
- Thumb: `#cbd5e1` (Hover: `#94a3b8`)
- Radius: `3px`

## 4. Animations & Micro-Interactions

화면 진입 시와 카드에 마우스를 올렸을 때의 역동성을 부여합니다.

### 4.1. Enter Animations (진입 모션)
- `animate-slide-in-up`: 아래에서 위로 `50px` 이동하며 서서히 나타나는 (`fade-in`) 애니메이션 (대시보드 카드 등장 시 활용).
- `animate-fade-in-scale`: 크기가 80%에서 100%로 커지며 나타나는 효과 (모달, 팝업 등에 사용).

### 4.2. Hover Effects (호버 인포 모션)
- `enhanced-hover`: 요소를 부드럽게 위로 살짝 띄우며 그림자를 진하게 만드는 모션.
  - `transform: translateY(-5px) scale(1.02);`
  - `transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);`

## 5. CSS Utility Classes (Tailwind Layer)

Tailwind `@layer components` 및 `@layer utilities`에 다음과 같은 클래스가 추가되어야 합니다.

- `.word-break-keep`: 한국어 문장 뚝 끊김 방지
- `.text-korean`: 한국어 완전 최적화 세트 (line-break, hyphens 포함)
- `.toss-title`, `.toss-body`, `.toss-subtext` (선택적) 
