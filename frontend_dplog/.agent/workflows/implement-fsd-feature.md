---
description: FSD 아키텍처와 Deep Tech 디자인 시스템 기반의 새로운 기능(페이지) 구현 가이드
---

# FSD 기능 구현 워크플로우

이 워크플로우는 D-PLOG 프론트엔드(`frontend_dplog`)에 새로운 기능을 추가할 때 사용하는 표준 절차입니다.

## 1. 사전 준비 (Planning)

- [ ] 구현할 기능의 범위를 정의하세요. (예: "로그인 페이지", "대시보드 위젯")
- [ ] **참고 레거시 코드**: `legacy/dplog/src/components/...` 확인
- [ ] **디자인 컨셉**: Deep Tech SaaS (Glassmorphism, Dark Mode) 확인

## 2. FSD 폴더 구조 생성

`frontend_dplog/src` 내 적절한 위치에 코드를 배치하세요.

- **페이지 라우트**: `app/(group)/[page]/page.tsx`
- **기능 컴포넌트**: `features/[feature-name]/components/...`
- **비즈니스 로직**: `features/[feature-name]/model/use[Feature]ViewModel.ts`
- **데이터 모델**: `entities/[entity-name]/ui/...`

## 3. UI 구현 (shadcn/ui + Tailwind)

`frontend_dplog/src/shared/ui`의 shadcn 컴포넌트를 활용하세요.

```tsx
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

// Glassmorphism 예시
<div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6">
  <h2 className="text-white text-xl font-bold">Title</h2>
  <Button className="bg-blue-600 hover:bg-blue-700">Action</Button>
</div>;
```

## 4. 로직 마이그레이션

레거시 코드의 로직을 가져올 때는 다음 원칙을 따릅니다:

- `useClient` 등의 훅은 `features/.../model` 또는 `hooks`로 분리
- API 호출은 `shared/api` 또는 `features/.../api`로 분리
- **TypeScript 타입**을 명확히 정의

## 5. 검증 (Verification)

- [ ] `npm run dev`로 서버 실행
- [ ] 스타일 깨짐 확인 (Tailwind, PostCSS 확인)
- [ ] 콘솔 에러 확인
