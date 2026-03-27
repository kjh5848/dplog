# D-PLOG Frontend (frontend_dplog)

D-PLOG의 새로운 Next.js 프론트엔드 프로젝트입니다.
`legacy/dplog` (v13)의 기능을 계승하며, **Feature-Sliced Design (FSD)** 아키텍처를 기반으로 재구축되었습니다.

## 🚀 시작하기

```bash
cd frontend_dplog
npm install
npm run dev
```

## 🏗️ 아키텍처 (FSD)

이 프로젝트는 `docs/frontend-architecture.md`에 정의된 FSD 구조를 따릅니다.

- **`app/`**: Next.js App Router (라우팅, 레이아웃)
- **`features/`**: 비즈니스 기능 단위 (예: `landing`, `dashboard`, `auth`)
- **`entities/`**: 비즈니스 데이터 모델 (예: `user`, `report`)
- **`shared/`**: 재사용 가능한 UI, 로직, 스타일 (예: `ui`, `lib`, `api`)

## 🎨 디자인 시스템

- **스타일**: Tailwind CSS + shadcn/ui
- **컨셉**: Deep Tech SaaS (Glassmorphism, Dark Mode)
- **아이콘**: `lucide-react` (권장)

## 📝 작업 워크플로우

새로운 기능을 추가할 때는 `.agent/workflows/implement-fsd-feature.md` 워크플로우를 참고하세요.

### 주요 작업 내역

- [x] 프로젝트 초기화 및 `frontend_dplog` 생성
- [x] v13 랜딩 페이지 마이그레이션 및 스타일 복구
- [x] Tailwind CSS v4 + PostCSS 설정 완료 (`postcss.config.mjs`)
- [ ] 인증 페이지 (로그인/회원가입) 구현 예정
