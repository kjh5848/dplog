---
description: D-PLOG 에픽 및 페이즈 파이프라인 수행 가이드 (Next.js + Python 엣지 런타임)
---

이 워크플로우는 D-PLOG 프로젝트의 에이전트(AI)가 [Next.js + Python 엣지 노드 및 SaaS 플랫폼 아키텍처] 개발에 투입될 때 반드시 따라야 하는 행동 강령입니다. 대화 세션이 끊어지더라도 이 워크플로우를 호출하면 프로젝트의 흐름이 끊기지 않고 재개됩니다.

## Step 1. 코어 문서 열람 및 상태 진단
AI는 코딩을 시작하기 전, 반드시 다음 4개의 파일을 `view_file` 도구로 열람하여 전체 아키텍처와 현재 진척도를 동기화해야 합니다.
- `/docs/next_python_packaging/architecture.md` (시스템 구조 및 도메인 분리 룰 확인)
- `/docs/next_python_packaging/spec.md` (기술 스택 및 API 렌더링 규약 확인)
- `/docs/next_python_packaging/phase.md` (우리가 달성해야 할 Epic 및 진행 단계 확인)
- `/docs/next_python_packaging/task.md` (가장 마이크로한 체크리스트 확인)

## Step 2. 다음 진격 목표(Task) 선정
- `task.md` 를 읽은 뒤, 아직 체크(`[x]`) 처리되지 않은 위에서부터 가장 가까운 작업을 최우선 목표로 선정합니다.
- 만약 목표가 불분명하다면 사용자(User)에게 "문서를 확인해 본 결과, 현재 남은 작업은 [XX] 입니다. 바로 시작할까요?" 라고 확인을 받습니다.

## Step 3. DDD 및 SQLModel 기반의 엄격한 구현
새로운 파이썬 코드를 작성할 때는 `architecture.md`의 규칙을 절대 엄수해야 합니다.
- **도메인 분리**: 모든 비즈니스 로직은 `backend_python/domains/{stores, scraping, users, billing}` 하위에 쪼개어 작성하십시오.
- **SQLModel 강제**: FastAPI의 데이터베이스(`database.py`)와 DTO는 무조건 Pydantic과 SQLAlchemy가 결합된 `SQLModel` 스키마로 선언하십시오.

## Step 4. 무결성 테스트
- 뷰(View) 수정 시: `cd frontend_dplog && npm run build` 가 문제 없이 `out` 폴더를 뱉어내는지 확인.
- 로직 수정 시: 백그라운드 구동 환경 등을 고려하여 스크래핑 엔진 등 파이썬 로직 테스트 진행.

## Step 5. 진척도 로깅 (문서 현행화)
- 태스크 구현을 마쳤다면, 제일 먼저 해야 할 일은 `task.md`로 돌아가 해당 항목을 `[x]` 처리하는 것입니다.
- 만약 중대한 디자인 변경이 발생했다면 `architecture.md`나 `phase.md`를 함께 업데이트합니다.
- 완료 후 사용자에게 성과를 브리핑하고 다음 페이즈 전개를 제안합니다.
