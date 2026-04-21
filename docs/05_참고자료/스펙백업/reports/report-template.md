# [Spec] 진단 리포트 템플릿/섹션 규격

## 0. 메타
- 상태: TODO(할 일)
- 관련 PRD: FR-P3
- 관련 문서:
  - [`../../planning/PRD.md`](../../planning/PRD.md)
  - [`../../planning/TECHSPEC.md`](../../planning/TECHSPEC.md)

## 1. 목적
- 리포트의 “구성/톤/섹션/근거 표기 방식”을 표준화해, 생성 품질과 FE 렌더링 안정성을 확보한다.

## 2. 범위
### 2.1 In scope
- 리포트 섹션 타입 정의(예: SUMMARY, EVIDENCE, ACTIONS, PRIORITY)
- 각 섹션의 필수 필드/출력 규칙(마크다운/리치텍스트 등)
- 근거(evidence) 링크/출처 표기 규칙(RAG/Ranking/Manual)
- “즉시 실행 항목”의 데이터 모델(체크리스트, 난이도, 예상효과 등)

### 2.2 Out of scope
- PDF 출력/프린트 레이아웃(별도 Spec)

## 3. 섹션 정의(초안)
- Summary: 3~5줄 요약 + 핵심 지표
- Evidence: 왜 그런지(요인/경쟁/콘텐츠) + 출처
- Actions: 오늘 할 일(체크리스트)
- Priority: 우선순위(impact/effort)

## 4. 데이터 모델(초안)
- `DiagnosisReport`
- `ReportSection`
- `ReportEvidence`

## 5. 수용 기준(AC)
- [ ] FE가 섹션 타입만으로 안정적으로 렌더링할 수 있다.
- [ ] 근거 표기 방식이 일관되고 출처가 구분된다.

## 6. 오픈 이슈
- [ ] 리포트 텍스트 포맷(Plain text vs Markdown vs Rich text)
- [ ] 섹션별 최대 길이/요약 규칙
