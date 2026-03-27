# frontend_next

## Routes
- `/` → `/landing/dplog-alt`
- `/landing/dplog-alt`
- `/pricing`
- `/success-stories`
- `/dashboard`
- `/content-factory`
- `/diagnosis/new`
- `/diagnosis/new/age-group`
- `/diagnosis/new/business-duration`
- `/diagnosis/new/region-selection`
- `/diagnosis/new/grant-results`
- `/diagnosis/new/ai-interview`

## Navigation Flow
```mermaid
flowchart LR
  root["홈 /"] --> landing["랜딩 /landing/dplog-alt"]

  landing -->|시작| diagStart["진단 시작 /diagnosis/new"]
  landing -->|요금제| pricing["요금제 /pricing"]
  landing -->|사례| stories["성공 사례 /success-stories"]

  pricing -->|무료 시작| diagStart
  pricing -->|랜딩으로| landing
  pricing -->|대시보드| dashboard["대시보드 /dashboard"]

  stories -->|데모 신청| diagStart
  stories -->|랜딩으로| landing
  stories -->|대시보드| dashboard

  diagStart -->|계속| age["연령대 /diagnosis/new/age-group"]
  age -->|이전| diagStart
  age -->|다음| duration["사업 기간 /diagnosis/new/business-duration"]
  duration -->|이전| age
  duration -->|다음| region["지역 선택 /diagnosis/new/region-selection"]
  region -->|이전| duration
  region -->|다음| results["지원금 결과 /diagnosis/new/grant-results"]

  results -->|사업계획서 시작| interview["AI 인터뷰 /diagnosis/new/ai-interview"]
  results -->|전체 보기| dashboard
  results -->|내 프로필| dashboard

  interview -->|종료/저장/전송/완료| dashboard

  dashboard -->|콘텐츠 팩토리| content["콘텐츠 팩토리 /content-factory"]
  dashboard -->|진단 시작| diagStart
  dashboard -->|요금제| pricing
  dashboard -->|사례| stories

  content -->|뒤로/발행/전송| dashboard
```

## Notes
- 모든 이동은 UI 링크로만 구성되어 있습니다. (입력값 없이 이동 가능)
- 실제 데이터 흐름/검증 로직은 아직 연결되지 않았습니다.
