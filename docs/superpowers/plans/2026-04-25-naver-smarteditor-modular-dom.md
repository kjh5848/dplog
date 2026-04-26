# Naver SmartEditor Modular DOM Automation Plan

## 목표

- 네이버 SmartEditor 자동 입력을 DOM 역할별 모듈로 분리한다.
- `scripts/sns_publish/open_naver.py`는 로그인, 원고 파싱, 세그먼트 순회, CLI 옵션 처리만 담당한다.
- 기본 실행은 공개 발행이 아니라 초안 입력 후 사용자 검수 대기다.

## 설계 원칙

- DOM selector 변경 대응의 1차 수정 지점은 `scripts/sns_publish/naver_editor/selectors.py`로 제한한다.
- 제목, 본문 입력, H2/H3, 인용, 볼드, 밑줄, 이미지/GIF, 지도, 구분선, 발행 조작은 독립 모듈에 둔다.
- DOM 직접 스타일 주입은 사용하지 않고 SmartEditor 상태 동기화를 위해 클릭, 단축키, 붙여넣기만 사용한다.
- 모듈 간 import는 단방향으로 유지하고 `media.py`, `map.py`, `publish.py`는 서로 import하지 않는다.

## 모듈 책임

- `selectors.py`: 역할별 selector registry
- `context.py`: editor frame 탐색, visible locator 탐색, 팝업/도움말 제거
- `typing.py`: 클립보드 입력, human paste, inline bold/underline token 처리
- `formatting.py`: 제목, heading, quote, horizontal line 적용
- `media.py`: 이미지/GIF 업로드
- `map.py`: 장소 첨부
- `probe.py`: DOM 후보와 서식 evidence 수집
- `publish.py`: 발행 버튼 클릭
- `types.py`: 공통 결과 타입

## CLI 계약

- `--store 이조갈비`: 대상 원고 폴더 선택
- `--draft-only`: 기본값, 공개 발행 없음
- `--publish`: 사용자 검수 후 최종 공개 발행
- `--format-check`: 입력 후 서식 evidence 출력
- `--probe-editor-dom`: 에디터 DOM 후보 출력 후 종료
- `--keep-open-seconds 600`: 초안 검수용 브라우저 유지 시간

## 검증

- 정적 검사: `PYTHONPYCACHEPREFIX=/tmp/dplog_pycache scripts/.venv/bin/python -m py_compile scripts/sns_publish/open_naver.py scripts/sns_publish/naver_editor/*.py`
- 단위 테스트: `scripts/.venv/bin/python -m unittest scripts.sns_publish.tests.test_naver_editor_modules`
- diff 검사: `git diff --check`
- 실제 초안 드라이런은 사용자 승인 후 `scripts/.venv/bin/python scripts/sns_publish/open_naver.py --store 이조갈비 --format-check --keep-open-seconds 600`로 수행한다.
