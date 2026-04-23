---
description: Threads 스레드 자동 발행 파이프라인 — 원고 검증부터 셀프 리플라이 체이닝까지
---

이 워크플로우는 Threads 공식 API를 통해 멀티 파트 스레드를 자동 발행하는 파이프라인입니다.
에이전트는 아래 단계를 **순서대로** 수행하십시오.

## Step 1. 매장명 확인

사용자에게 어떤 매장의 원고를 발행할지 확인합니다.
- 사용자가 매장명을 명시하지 않았다면: `scripts/asset/` 하위 디렉토리를 `list_dir`로 조회하여 목록을 보여주고 선택하게 합니다.
- 매장명이 확인되면 이후 모든 Step에서 `STORE_NAME` 변수로 사용합니다.

## Step 2. 원고 파일 검증

`scripts/asset/{STORE_NAME}/threads_draft.md` 파일을 `view_file`로 열어 다음을 확인합니다:

1. **PART 구조** 존재 여부 (`## [PART N — 제목]` 형태)
2. **각 PART 글자 수** 검증: 파트당 500자 이내
3. **이미지 참조** 검증: `![alt](<파일명>)` 형태의 이미지들이 실제 존재하는지 교차 확인
4. **토픽 태그** 존재 여부 (마지막 파트에 포함 권장)

> [!WARNING]
> 각 PART는 500자 제한이 있습니다. 초과 시 자동으로 잘리므로 사전에 조정하세요.

## Step 3. 환경 설정 점검

다음 환경 요소들을 점검합니다:

1. **`.env.threads`** 파일 (`scripts/` 디렉토리): `THREADS_USER_ID`와 `THREADS_ACCESS_TOKEN` 키가 존재하는지 확인 (값은 출력 금지)
2. **(선택) `IMGBB_API_KEY`**: 이미지가 포함된 파트가 있을 경우, 이미지 호스팅용 API 키 존재 여부 확인
3. **requests 패키지** 설치 여부: `python -c "import requests; print('OK')"` 로 임포트 테스트

## Step 4. 드라이런 테스트

// turbo
```bash
cd /Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/scripts && python -m sns_publish.open_threads --store {STORE_NAME} --dry-run
```

- 실제 발행 없이 원고 파싱만 테스트합니다.
- 파트별 글자 수, 이미지 수가 정상적으로 표시되는지 확인합니다.

## Step 5. 발행 스크립트 실행

```bash
cd /Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog/scripts && python -m sns_publish.open_threads --store {STORE_NAME}
```

- `{STORE_NAME}` 자리에 Step 1에서 확인한 매장명을 치환합니다.
- 각 PART 발행 후 30초 대기 (Threads API 서버 처리 시간)
- 전체 3파트 기준 약 2~3분 소요됩니다.

## Step 6. 결과 확인 및 후처리

콘솔 출력을 확인하여 발행 성공 여부를 판단합니다:

| 출력 메시지 | 의미 |
|---|---|
| `🎉 Threads 스레드 발행 완료!` | ✅ 전체 성공 |
| `⚠️ 부분 발행 완료 (N/M개 파트)` | ⚠️ 일부 실패 — 수동 확인 필요 |
| `❌ 발행 실패` | ❌ 환경 설정 재점검 |
| `❌ 컨테이너 생성 실패` | ❌ Access Token 만료 또는 API 권한 부족 |

**성공 시:**
1. 사용자에게 Threads 스레드 URL을 안내합니다.
2. 다른 SNS 발행 여부를 제안합니다: "네이버에도 발행하시겠습니까? (`/publish-naver`)"

**실패 시:**
1. 에러 로그를 분석하여 원인을 안내합니다.
2. Access Token 갱신이 필요한 경우 갱신 절차를 안내합니다.
