# [Spec] RAG 지식 검색/근거 계약

## 0. 메타
- 상태: TODO(할 일)
- 관련 PRD: FR-P2
- 관련 문서:
  - [`../../planning/PRD.md`](../../planning/PRD.md)
  - [`../../planning/TECHSPEC.md`](../../planning/TECHSPEC.md)
  - [`../../ddd-architecture.md`](../../ddd-architecture.md)
  - [`../../store-diagnosis-flow.md`](../../store-diagnosis-flow.md)
  - [`../reports/report-template.md`](../reports/report-template.md)

## 1. 목적
- 진단 리포트 생성에 사용되는 RAG 지식 검색을 **입력/출력/근거 표기/실패 처리**까지 표준화한다.
- “근거 기반 리포트(FR-P3)”가 흔들리지 않도록, RAG 결과를 **ReportEvidence**로 연결하는 규칙을 고정한다.

## 2. 범위
### 2.1 In scope
- RAG 검색 입력(스토어/키워드/순위 결과) → 검색 질의 구성 규칙
- 검색 결과 모델(스니펫, 출처, 신뢰도, 메타데이터)
- 근거(evidence) 연결 규칙(리포트 섹션/출처 표기)
- 타임아웃/재시도/부분 결과(`PARTIAL`) 기준
- 안전장치(프롬프트 인젝션, 민감정보, 환각 최소화 가이드)

### 2.2 Out of scope
- Knowledge Base 인덱싱 파이프라인 구현 상세(S3 업로드/청킹 설정/권한) — 운영 문서로 분리 가능

## 3. 입력(검색 컨텍스트) 정의
### 3.1 입력 소스
- Store: name/category/address/placeUrl(옵션)
- KeywordSet: 대표/희망 키워드
- RankingSnapshot: 키워드별 순위/변동/노출 위치(가능 시)

### 3.2 질의 구성(초안)
- 키워드별 질의 + 공통 질의(노출 요인 일반)로 분리
- 지역/업종 필터가 가능한 경우 metadata filter로 제한

## 4. 출력(검색 결과) 계약
> 백엔드 `ai-rag` 모듈의 “도메인 독립 결과”로 정의하고, `report` 모듈에서 `ReportEvidence`로 매핑한다.

### 4.1 Result item(초안)
- `id`: string (문서/청크 식별자)
- `sourceType`: `KB|MANUAL|OTHER`
- `title`: string (옵션)
- `snippet`: string (필수, 사용자 노출 가능한 텍스트)
- `uri`: string (옵션)
- `score`: number (옵션)
- `metadata`: object (예: category, updatedAt, tags)

### 4.2 Evidence 연결 규칙(초안)
- 리포트 섹션이 “근거”를 표시할 때, RAG 결과는 `source=RAG`로 저장
- 사용자에게는 “출처 구분”이 가능하도록 최소 필드(title/uri 또는 id)를 유지

## 5. 실패/타임아웃/부분 결과
- RAG 실패 시:
  - (권장) `PARTIAL`로 전환하고 기본 템플릿 기반 리포트 생성 + warnings 제공
- 타임아웃:
  - stage별 타임아웃 설정(예: retrieval 10s, generate 20s 등) — 확정 필요

## 6. 안전/품질 가이드(초안)
- 프롬프트 인젝션 방어:
  - 외부 텍스트(스토어 소개/리뷰 등)는 “지시”가 아니라 “데이터”로만 취급
- PII:
  - 전화번호/주소 등은 “필요 범위만” 사용하고 로그/리포트 노출 정책 확정
- 환각 최소화:
  - 근거가 없는 단정 표현 금지(리포트 템플릿에서 톤 규정)

## 7. 수용 기준(AC)
- [ ] RAG 입력/출력 모델이 FE/BE 모두 이해 가능한 형태로 문서화되어 있다.
- [ ] RAG 실패 시 사용자 경험(부분 결과/재시도/경고)이 정의되어 있다.
- [ ] RAG 결과가 `ReportEvidence`로 연결되는 규칙이 존재한다.

## 8. 오픈 이슈
- [ ] Bedrock KB 사용 방식: Retrieve vs RetrieveAndGenerate
- [ ] 메타데이터 필터(업종/지역/버전) 설계
- [ ] 비용/호출량 제한(레이트 리미트, 캐시 정책)
