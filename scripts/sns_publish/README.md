# Naver Blog SmartEditor Scripts

이 폴더는 `scripts/asset/<store>/blog_draft.md`를 네이버 블로그 SmartEditor에 입력하는 자동화 코드입니다.

## 운영 원칙

1. 기본값은 초안 검수입니다.
   - `--publish`를 명시하지 않으면 공개 발행 버튼을 누르지 않습니다.
   - 이유: 네이버 SmartEditor DOM과 계정 상태는 실행 시점에 바뀔 수 있어, 자동 공개 발행은 검수 없이 신뢰하기 어렵습니다.
2. live SmartEditor 동작이 최종 기준입니다.
   - HTML 미리보기는 검증 보조 도구입니다.
   - 이미지 정렬과 배치는 SmartEditor의 네이티브 업로드/정렬 동작을 우선합니다.
3. 긴 구분선 대신 인용 문단을 사용합니다.
   - 원고의 `>` 문단은 SmartEditor 인용 컴포넌트로 입력합니다.
   - 기존 `---`는 호환 목적으로만 짧은 전환 인용으로 변환됩니다.

## 준비 파일

```text
scripts/
  .env.naver
  asset/
    <store>/
      blog_draft.md
      media_index.md
      store_info.md
      images...
  sns_publish/
    open_naver.py
    naver_editor/
```

`.env.naver`에는 다음 키만 둡니다.

```dotenv
NAVER_ID=your_naver_id
NAVER_PW=your_naver_password
```

## 실행

처음 실행하는 환경에서는 스크립트 전용 venv를 준비합니다.

```bash
python3 -m venv scripts/.venv
scripts/.venv/bin/python -m pip install -r scripts/sns_publish/requirements.txt
scripts/.venv/bin/python -m playwright install chromium
```

```bash
scripts/.venv/bin/python -m scripts.sns_publish.open_naver --store <store> --format-check --keep-open-seconds 600
```

공개 발행까지 진행할 때만 아래처럼 명시합니다.

```bash
scripts/.venv/bin/python -m scripts.sns_publish.open_naver --store <store> --publish
```

## 검증

```bash
scripts/.venv/bin/python -m unittest scripts.sns_publish.tests.test_naver_editor_modules
```
