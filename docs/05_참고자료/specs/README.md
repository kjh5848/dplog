# 상세 명세(Specs) 운영 가이드

위치: `d-plog/docs/specs/`

이 폴더는 `PRD.md`의 요구사항을 **구현 가능한 수준의 “상세 명세서”** 로 쪼개서 관리합니다.

상태 값: `TODO(할 일) | WIP(진행 중) | DONE(완료)`

## 1) 원칙
- PRD는 **왜/무엇(What/Why)**, Spec은 **어떻게 만들 것인지(How, 계약/규칙/흐름)** 까지 포함합니다.
- Spec 1개 = “하나의 기능/규칙/계약”을 끝까지 설명합니다. (너무 큰 문서는 분할)
- PRD 요구사항 ID(FR-*, NFR-*)를 Spec 상단에 반드시 매핑합니다.
- UI에서 `fetch()` 같은 구현 디테일은 Spec에서 **API 계약**으로만 정의하고, 실제 코드는 `TECHSPEC.md`/코드로 이동합니다.

## 2) 폴더 구조
```text
d-plog/docs/specs/
  WORKLIST.md               # 지금 만들어야 할 Spec 작업 리스트(SSoT)
  _templates/               # Spec/ADR 템플릿
  adr/                      # 중요한 결정 기록(선택)
  landing/                  # 랜딩/온보딩 상세
  diagnosis/                # 진단 플로우(키워드/잡/연동 계약 등)
  reports/                  # 리포트 템플릿/조회/비교
  shared/                   # 공통 규격(에러/응답/이벤트 등)
```

## 3) 파일 네이밍 규칙
- 소문자 kebab-case: `report-history-and-compare.md`
- 기능이 커지면 폴더 추가: `reports/history.md`처럼 분리 가능

## 4) Spec 작성 방법(권장 플로우)
1. `WORKLIST.md`에서 작업을 하나 선택하고 status를 `WIP(진행 중)`로 변경
2. `_templates/SPEC_TEMPLATE.md`를 복사해 문서 생성
3. 최소한 아래 7가지는 채우기
   - 목적/범위(In/Out)
   - PRD 요구사항 매핑(FR/NFR)
   - 사용자 흐름(성공/실패/재시도)
   - API 계약(요청/응답/에러/아이템포턴시)
   - 데이터/상태 모델(필드 정의)
   - 수용 기준(AC)
   - 오픈이슈/결정 필요(필요하면 ADR 작성)
4. 완료 시 `WORKLIST.md`를 `DONE(완료)`으로 변경하고, 관련 문서(PRD/TECHSPEC)에 링크를 추가(선택)

## 5) 완료(DoD) 기준
- 구현자(프론트/백) 관점에서 “질문 없이 구현 시작” 가능한 수준
- 예외/에러 코드/재시도 정책이 빠지지 않음
- 이벤트/로그/추적(최소) 정의가 포함됨(운영 전제)
