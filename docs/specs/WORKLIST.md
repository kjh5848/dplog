# 상세 명세 작업 리스트 (SSoT)

> 이 리스트는 “지금 작성해야 하는 상세 명세서”의 **단일 소스 오브 트루스**입니다.  
> 상태 값: `TODO(할 일) | WIP(진행 중) | DONE(완료)`

## 1) 우선순위 작업(현재 PRD 기준)

| 우선 | 작업(ID) | 상태 | PRD 매핑 | 문서 |
|---:|---|---|---|---|
| P0 | 랜딩/온보딩 상세 명세 | TODO(할 일) | FR-L1~L3 | [`landing/landing-onboarding.md`](landing/landing-onboarding.md) |
| P0 | 비동기 진단 잡(jobId) 상세 명세 | TODO(할 일) | FR-J1~J3 | [`diagnosis/async-diagnosis-job.md`](diagnosis/async-diagnosis-job.md) |
| P0 | RAG 지식 검색/근거 계약 | TODO(할 일) | FR-P2 | [`diagnosis/rag-knowledge-search.md`](diagnosis/rag-knowledge-search.md) |
| P0 | 리포트 템플릿/섹션 규격 | TODO(할 일) | FR-P3 | [`reports/report-template.md`](reports/report-template.md) |
| P0 | 리포트 저장/조회/히스토리/비교 | TODO(할 일) | FR-P4, G4 | [`reports/report-history-and-compare.md`](reports/report-history-and-compare.md) |
| P1 | KB 인제스트/메타데이터/버전 운영 | TODO(할 일) | FR-P2, NFR-2 | [`diagnosis/kb-ingestion-and-metadata.md`](diagnosis/kb-ingestion-and-metadata.md) |
| P1 | 키워드 정책(유효성/정규화/금칙어) | TODO(할 일) | FR-K2 | [`diagnosis/keyword-policy.md`](diagnosis/keyword-policy.md) |
| P1 | 내순이(순위) 연동 API 계약 | TODO(할 일) | FR-R1~R3 | [`diagnosis/nomadscrap-api-contract.md`](diagnosis/nomadscrap-api-contract.md) |
| P1 | 공통 응답/에러 규격(ApiError) | TODO(할 일) | NFR-4, API 안정성 | [`shared/api-error-and-response.md`](shared/api-error-and-response.md) |

## 2) 작성 순서(추천)
1. `async-diagnosis-job.md` (상태/계약이 잡히면 FE/BE가 같이 움직이기 쉬움)
2. `nomadscrap-api-contract.md` + `keyword-policy.md` (입력/연동 규칙 확정)
3. `report-template.md` → `report-history-and-compare.md` (출력/저장/조회 확정)
4. `landing-onboarding.md` (전환/측정 이벤트 포함)

## 3) 새 Spec 추가 규칙
- 반드시 PRD 요구사항 ID(FR/NFR)와 연결
- 문서 경로를 이 표에 추가하고, 템플릿 기반으로 작성
