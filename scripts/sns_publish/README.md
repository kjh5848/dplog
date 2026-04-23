# 📢 SNS 자동 발행 시스템

네이버 블로그, 인스타그램, Threads에 콘텐츠를 자동 발행하는 자동화 파이프라인입니다.
- **네이버/인스타**: Playwright 브라우저 자동화
- **Threads**: 공식 API (셀프 리플라이 체이닝 지원)

---

## 🚀 빠른 실행

```bash
# 네이버 블로그 발행
python -m sns_publish.open_naver --store 철이네

# 인스타그램 발행
python -m sns_publish.open_insta --store 철이네

# Threads 발행
python -m sns_publish.open_threads --store 철이네

# Threads 드라이런 (파싱만 테스트)
python -m sns_publish.open_threads --store 철이네 --dry-run
```

> `--store` 인자를 생략하면 기본값 `철이네`가 사용됩니다.

---

## 📁 디렉토리 구조

```
scripts/
├── .env.naver              # 네이버 로그인 정보 (NAVER_ID, NAVER_PW)
├── naver_session.json       # 네이버 세션 쿠키 (자동 생성)
├── insta_session.json       # 인스타그램 세션 쿠키 (대시보드에서 생성)
├── asset/
│   └── {매장명}/
│       ├── blog_draft.md    # 네이버 블로그 원고
│       ├── insta_draft.md   # 인스타그램 원고
│       ├── threads_draft.md # Threads 원고
│       ├── image1.jpeg      # 이미지 파일들
│       ├── image2.jpeg
│       └── ...
└── sns_publish/
    ├── open_naver.py        # 네이버 발행 엔진
    ├── open_insta.py        # 인스타 발행 엔진 (Playwright)
    ├── open_threads.py      # Threads 발행 엔진 (공식 API)
    └── README.md            # (이 문서)
```

---

## 📝 원고 규격

### 네이버 블로그 (`blog_draft.md`)

```markdown
# 포스트 제목

첫 번째 문단 텍스트입니다.
**볼드 텍스트**도 지원됩니다.

![이미지설명](<파일명.jpeg>)

두 번째 문단 텍스트입니다.

---

🔗 [링크 텍스트](https://example.com)

![두번째이미지](<파일명2.jpeg>)

#해시태그1 #해시태그2 #해시태그3
```

**규칙:**
- 첫 줄은 반드시 `# 제목` 형식
- 이미지는 `![alt](<파일명>)` 형식 (꺾쇠 괄호 권장)
- `---` 는 에디터에 구분선으로 삽입됨
- 해시태그는 `#태그1 #태그2` 형태로 한 줄에 작성
- URL은 자동으로 OGP 임베딩 시도 (3.5초 대기)

### 인스타그램 (`insta_draft.md`)

```markdown
![1](<image1.jpeg>)
![2](<image2.jpeg>)
![3](<image3.jpeg>)

---

📍 매장이름 | 위치정보

본문 캡션 텍스트입니다.
여러 줄로 작성 가능합니다.

#해시태그1 #해시태그2 #해시태그3
```

**규칙:**
- 이미지 **최대 10장** (인스타그램 제한)
- `---` 구분선 아래가 전체 캡션으로 사용됨
- 이미지는 정사각형(1:1) 또는 4:5 비율 권장

### Threads (`threads_draft.md`)

```markdown
## [PART 1 — 후킹] (≤500자)
어제 간 닭발집 진짜 미쳤는데
해운대 로컬들만 아는 노포

![1](<hero.jpeg>)
![2](<exterior.jpeg>)

---

## [PART 2 — 메인] (≤500자)
시그니처 숯불뼈닭발 🍗
불향 + 매콤달달 양념이 미침

![3](<action.jpeg>)

---

## [PART 3 — CTA] (≤500자)
📍 통문어 숯불닭발 철이네 (장산역)
🕐 17:00~02:00

#해운대맛집
```

**규칙:**
- `## [PART N — 제목]` 형태로 파트 구분
- 각 파트 **500자 이내** (초과 시 자동 잘림)
- 파트 간 `---` 구분선
- 이미지는 `![alt](<파일명>)` 형식 (캐러셀: 2~20장, 단일: 1장)
- 마지막 파트에 **토픽 태그** 포함 권장
- 각 파트는 **셀프 리플라이**로 체이닝됨

---

## ⚙️ 환경 설정

### 네이버 (`.env.naver`)

```env
NAVER_ID=your_naver_id
NAVER_PW=your_naver_password
```

### 인스타그램

인스타그램은 ID/PW 직접 로그인이 불가합니다 (2FA + 봇 탐지).
SNS 대시보드(`sns_dashboard_server.py`)를 통해 수동 로그인 후 자동 생성되는 `insta_session.json` 쿠키 파일을 사용합니다.

### Threads (`.env.threads`)

```env
THREADS_USER_ID=your_threads_user_id
THREADS_ACCESS_TOKEN=your_long_lived_access_token

# (선택) 이미지 호스팅용 — 없으면 0x0.st 사용
# IMGBB_API_KEY=your_imgbb_api_key
```

> **Access Token 발급:** Meta 개발자 콘솔 → 앱 설정 → Threads API → Long-lived Token 생성
> **Token 유효기간:** 60일 (만료 전 갱신 필요)

### 필수 의존성

```bash
pip install playwright pyperclip python-dotenv requests
playwright install chromium
```

---

## 🛡️ 주의사항

1. **Stealth 아키텍처**: 두 스크립트 모두 `AutomationControlled` 플래그를 비활성화하고 `navigator.webdriver`를 undefined로 위장합니다.
2. **세션 관리**: 네이버는 로그인 성공 시 자동으로 `naver_session.json`을 생성/갱신합니다.
3. **클립보드 보안**: 비밀번호 붙여넣기 후 즉시 클립보드를 비웁니다.
4. **실행 환경**: macOS 기준으로 키보드 수식어 키가 `Meta`(⌘)로 설정됩니다. Windows에서는 자동으로 `Control`로 전환됩니다.
