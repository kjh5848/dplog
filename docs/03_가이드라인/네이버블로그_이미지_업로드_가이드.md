# 네이버 블로그 스마트에디터 ONE — 이미지 삽입 자동화 가이드

> **목적**: Playwright(Python)를 사용하여 네이버 블로그 본문에 이미지를 자동 삽입하는 방법론을 정리한다.
> **대상 스크립트**: `scripts/open_naver.py`
> **원고 형식**: `scripts/asset/*/blog_draft.md` (마크다운 이미지 문법 포함)

---

## 1. 전체 요약 — 사용 가능한 4가지 접근법

| # | 방식 | 핵심 API | 난이도 | 안정성 | 비고 |
|---|------|----------|--------|--------|------|
| **A** | 숨겨진 `<input type="file">` 직접 주입 | `locator.set_input_files()` | ⭐ 낮음 | ⭐⭐⭐ 높음 | **권장 — 가장 안정적** |
| **B** | FileChooser 이벤트 감지 | `page.expect_file_chooser()` | ⭐⭐ 중간 | ⭐⭐⭐ 높음 | `<input>` 을 못 찾을 때 폴백 |
| **C** | 드래그 앤 드롭 시뮬레이션 | `page.evaluate()` + `DataTransfer` | ⭐⭐⭐ 높음 | ⭐⭐ 중간 | 커서 위치 제어 가능 |
| **D** | 클립보드 붙여넣기 시뮬레이션 | `page.evaluate()` + `ClipboardEvent` | ⭐⭐⭐ 높음 | ⭐ 낮음 | 에디터 호환성 불확실 |

> [!IMPORTANT]
> 네이버 스마트에디터 ONE은 React 기반 동적 DOM 구조를 사용한다. 클래스명이 배포마다 변경될 수 있으며, 아래 셀렉터들은 2026-04 기준으로 확인된 것이다.

---

## 2. 스마트에디터 ONE의 DOM 구조 (사진 업로드 관련)

### 2.1 핵심 셀렉터

```
┌─ 에디터 전체 ─────────────────────────────────────────────┐
│                                                          │
│  ┌─ 툴바 (.se-toolbar) ──────────────────────────────┐   │
│  │                                                    │   │
│  │   [사진] 버튼                                      │   │
│  │   CSS: .se-toolbar-item-image                      │   │
│  │   또는: button[data-name="image"]                  │   │
│  │   또는: .se-image-toolbar-button                   │   │
│  │                                                    │   │
│  └────────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ 숨겨진 파일 input ───────────────────────────────┐   │
│  │   <input type="file"                               │   │
│  │          accept="image/*"                          │   │
│  │          multiple                                  │   │
│  │          style="display:none">                     │   │
│  │                                                    │   │
│  │   CSS 후보:                                        │   │
│  │   - input[type="file"][accept*="image"]             │   │
│  │   - .se-file-uploader input                        │   │
│  │   - input[type="file"]  (DOM 전체 검색)            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                          │
│  ┌─ 본문 (.se-main-container) ───────────────────────┐   │
│  │   contenteditable 영역                             │   │
│  │   이미지 삽입 시 <div class="se-image"> 생성       │   │
│  └────────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.2 iframe 주의사항

네이버 블로그 에디터는 `mainFrame` 이라는 이름의 iframe 내부에서 동작할 수 있다.

```python
# iframe 내부 접근
editor_frame = page
for frame in page.frames:
    if frame.name == "mainFrame":
        editor_frame = frame
        break
```

---

## 3. 방식 A — `set_input_files()` 직접 주입 (⭐ 권장)

### 원리
스마트에디터의 사진 버튼을 클릭하면 OS 파일 선택 창이 열리지만, 실제로는 숨겨진 `<input type="file">` 요소가 DOM에 존재한다. 이 요소를 찾아 Playwright의 `set_input_files()` 로 파일을 직접 주입하면 클릭 없이 업로드가 가능하다.

### 구현 코드

```python
import os

async def upload_image_via_input(editor_frame, image_path: str):
    """숨겨진 input[type="file"] 요소를 찾아 이미지를 직접 주입한다."""
    
    # 1. 숨겨진 file input 찾기 (멀티 셀렉터 폴백)
    file_input_selectors = [
        'input[type="file"][accept*="image"]',
        '.se-file-uploader input[type="file"]',
        'input[type="file"]',
    ]
    
    file_input = None
    for sel in file_input_selectors:
        try:
            loc = editor_frame.locator(sel).first
            # 숨겨진 요소도 count()로 존재 확인 가능
            if await loc.count() > 0:
                file_input = loc
                print(f"✅ file input 발견: {sel}")
                break
        except:
            continue
    
    if file_input is None:
        print("❌ file input을 찾지 못했습니다.")
        return False
    
    # 2. 파일 주입
    abs_path = os.path.abspath(image_path)
    await file_input.set_input_files(abs_path)
    print(f"📸 이미지 업로드 완료: {abs_path}")
    
    # 3. 업로드 처리 대기 (서버 전송 + DOM 삽입)
    await asyncio.sleep(3)
    return True
```

### 다중 파일 업로드

```python
# 여러 파일 한 번에 업로드
await file_input.set_input_files([
    '/path/to/image1.jpg',
    '/path/to/image2.jpg',
    '/path/to/image3.jpg',
])
```

> [!WARNING]
> `set_input_files()` 는 `<input>` 요소가 DOM에 존재해야 한다. 스마트에디터가 사진 버튼 클릭 시에만 `<input>` 을 동적으로 생성하는 경우, 먼저 사진 버튼을 클릭한 후 이 메서드를 호출해야 한다.

---

## 4. 방식 B — FileChooser 이벤트 감지 (폴백용)

### 원리
사진 버튼을 클릭하면 브라우저가 파일 선택 창을 열려고 시도한다. Playwright는 이 이벤트를 가로채서 실제 파일 선택 창 없이 파일을 주입할 수 있다.

### 구현 코드

```python
async def upload_image_via_filechooser(page, editor_frame, image_path: str):
    """사진 버튼을 클릭하고 FileChooser 이벤트를 가로채 파일을 주입한다."""
    
    # 1. 사진 버튼 찾기
    photo_btn_selectors = [
        'button[data-name="image"]',
        '.se-toolbar-item-image',
        '.se-image-toolbar-button',
        'button[title*="사진"]',
    ]
    
    photo_btn = None
    for sel in photo_btn_selectors:
        try:
            loc = editor_frame.locator(sel).first
            if await loc.is_visible(timeout=2000):
                photo_btn = loc
                print(f"✅ 사진 버튼 발견: {sel}")
                break
        except:
            continue
    
    if photo_btn is None:
        print("❌ 사진 버튼을 찾지 못했습니다.")
        return False
    
    # 2. FileChooser 이벤트 대기 + 사진 버튼 클릭 (동시 수행 필수!)
    async with page.expect_file_chooser() as fc_info:
        await photo_btn.click()
    
    file_chooser = await fc_info.value
    
    # 3. 파일 주입
    await file_chooser.set_files(image_path)
    print(f"📸 이미지 업로드 완료: {image_path}")
    
    # 4. 업로드 처리 대기
    await asyncio.sleep(3)
    return True
```

> [!TIP]
> `expect_file_chooser()` 는 반드시 사진 버튼 **클릭 전** 에 시작해야 한다. `async with` 블록 안에서 클릭을 수행하면 타이밍 이슈가 없다.

---

## 5. 방식 C — 드래그 앤 드롭 시뮬레이션

### 원리
에디터 본문 영역에 `DataTransfer` 객체를 만들어 `drop` 이벤트를 직접 디스패치한다. 커서가 위치한 곳에 이미지가 삽입되므로 **위치 제어가 가능하다.**

### 구현 코드

```python
import base64

async def upload_image_via_drop(page, editor_frame, image_path: str):
    """본문 영역에 드래그 앤 드롭 이벤트를 시뮬레이션하여 이미지를 삽입한다."""
    
    # 1. 이미지 파일을 바이트 배열로 읽기
    with open(image_path, 'rb') as f:
        file_bytes = f.read()
    
    file_name = os.path.basename(image_path)
    
    # MIME 타입 추론
    ext = os.path.splitext(file_name)[1].lower()
    mime_map = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', 
                '.png': 'image/png', '.gif': 'image/gif', '.webp': 'image/webp'}
    mime_type = mime_map.get(ext, 'image/jpeg')
    
    # 2. 브라우저 컨텍스트에서 DataTransfer 객체 생성
    data_transfer = await page.evaluate_handle("""
        ({ bufferData, fileName, mimeType }) => {
            const dt = new DataTransfer();
            const blob = new Blob([new Uint8Array(bufferData)], { type: mimeType });
            const file = new File([blob], fileName, { type: mimeType });
            dt.items.add(file);
            return dt;
        }
    """, {
        'bufferData': list(file_bytes),
        'fileName': file_name,
        'mimeType': mime_type,
    })
    
    # 3. 본문 영역에 drop 이벤트 디스패치
    drop_target = editor_frame.locator('.se-main-container').first
    await drop_target.dispatch_event('drop', {'dataTransfer': data_transfer})
    
    print(f"📸 드래그 앤 드롭 이미지 삽입: {file_name}")
    await asyncio.sleep(3)
    return True
```

> [!CAUTION]
> 이 방식은 에디터의 JavaScript 이벤트 핸들러가 `drop` 이벤트를 처리하도록 구현되어 있어야만 동작한다. 스마트에디터 ONE이 이를 지원하지 않으면 실패할 수 있다.

---

## 6. 방식 D — 클립보드 붙여넣기 시뮬레이션

### 원리
에디터 본문에 `paste` 이벤트를 시뮬레이션하여 클립보드에서 이미지를 가져오는 것처럼 동작시킨다.

### 구현 코드

```python
async def upload_image_via_paste(page, editor_frame, image_path: str):
    """클립보드 paste 이벤트를 시뮬레이션하여 이미지를 삽입한다."""
    
    with open(image_path, 'rb') as f:
        file_bytes = f.read()
    
    file_name = os.path.basename(image_path)
    b64_data = base64.b64encode(file_bytes).decode('utf-8')
    
    ext = os.path.splitext(file_name)[1].lower()
    mime_map = {'.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
                '.png': 'image/png', '.gif': 'image/gif'}
    mime_type = mime_map.get(ext, 'image/jpeg')
    
    await editor_frame.evaluate("""
        async ({ b64Data, fileName, mimeType }) => {
            // Base64 → Blob → File
            const response = await fetch('data:' + mimeType + ';base64,' + b64Data);
            const blob = await response.blob();
            const file = new File([blob], fileName, { type: mimeType });
            
            // 에디터 본문 포커스
            const target = document.querySelector('.se-main-container');
            if (!target) return;
            target.focus();
            
            // paste 이벤트 생성 및 디스패치
            const dt = new DataTransfer();
            dt.items.add(file);
            
            const pasteEvent = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData: dt,
            });
            
            target.dispatchEvent(pasteEvent);
        }
    """, {
        'b64Data': b64_data,
        'fileName': file_name,
        'mimeType': mime_type,
    })
    
    print(f"📸 붙여넣기 이미지 삽입: {file_name}")
    await asyncio.sleep(3)
    return True
```

> [!WARNING]
> 클립보드 방식은 브라우저 보안 정책에 따라 차단될 수 있다. 특히 `ClipboardEvent` 생성자에서 `clipboardData` 를 직접 설정하는 것이 일부 브라우저에서 무시될 수 있다. 가장 불안정한 방식이므로 **최후의 수단으로만 사용한다.**

---

## 7. 실전 통합 전략 — `open_naver.py` 적용 방안

### 7.1 원고(blog_draft.md)에서 이미지 위치 파싱

```python
import re

def parse_draft_with_images(draft_path: str):
    """마크다운 원고에서 텍스트와 이미지를 순서대로 파싱한다.
    
    Returns:
        list[dict]: [
            {'type': 'text', 'content': '지인 추천으로 처음 온 집...'},
            {'type': 'image', 'alt': '외관 야경', 'filename': 'photo_001.jpeg'},
            {'type': 'text', 'content': '간판이 파란 네온사인인데...'},
            ...
        ]
    """
    with open(draft_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # 첫 번째 줄은 제목
    title = lines[0].strip().replace('# ', '').replace('#', '')
    
    segments = []
    text_buffer = []
    
    for line in lines[1:]:
        stripped = line.strip()
        
        # 해시태그 줄, 구분선 건너뜀
        if stripped == '---':
            continue
        if stripped.startswith('#') and not stripped.startswith('##'):
            continue
        
        # 이미지 마크다운 감지: ![alt](filename)
        img_match = re.match(r'^!\[(.*?)\]\(<?(.*?)>?\)$', stripped)
        if img_match:
            # 지금까지 쌓인 텍스트를 먼저 flush
            if text_buffer:
                segments.append({
                    'type': 'text',
                    'content': '\n'.join(text_buffer).strip()
                })
                text_buffer = []
            
            segments.append({
                'type': 'image',
                'alt': img_match.group(1),
                'filename': img_match.group(2),
            })
        else:
            text_buffer.append(line.rstrip())
    
    # 잔여 텍스트 flush
    if text_buffer:
        segments.append({
            'type': 'text',
            'content': '\n'.join(text_buffer).strip()
        })
    
    return title, segments
```

### 7.2 텍스트-이미지 교차 입력 루프

```python
async def write_post_with_images(page, editor_frame, draft_path: str, asset_dir: str):
    """원고를 파싱하여 텍스트와 이미지를 순서대로 에디터에 입력한다."""
    
    title, segments = parse_draft_with_images(draft_path)
    modifier = "Meta" if platform.system() == "Darwin" else "Control"
    
    # 제목 입력 (기존 로직)
    # ...
    
    for seg in segments:
        if seg['type'] == 'text' and seg['content']:
            # 텍스트 입력 (줄 단위 클립보드 붙여넣기)
            for line in seg['content'].split('\n'):
                if line.strip():
                    pyperclip.copy(line)
                    await page.keyboard.press(f"{modifier}+v")
                    await asyncio.sleep(0.8)
                await page.keyboard.press("Enter")
                await asyncio.sleep(0.3)
        
        elif seg['type'] == 'image':
            image_path = os.path.join(asset_dir, seg['filename'])
            
            if not os.path.exists(image_path):
                print(f"⚠️ 이미지 파일 없음, 건너뜀: {seg['filename']}")
                continue
            
            # 방식 A 시도 → 실패 시 방식 B 폴백
            success = await upload_image_via_input(editor_frame, image_path)
            if not success:
                success = await upload_image_via_filechooser(
                    page, editor_frame, image_path
                )
            
            if success:
                print(f"✅ [{seg['alt']}] 이미지 삽입 성공")
                await asyncio.sleep(2)
                # 이미지 삽입 후 커서를 아래로 이동
                await page.keyboard.press("End")
                await page.keyboard.press("Enter")
                await asyncio.sleep(0.5)
            else:
                print(f"❌ [{seg['alt']}] 이미지 삽입 실패")
```

---

## 8. 이미지 파일 관리 규칙

### 8.1 디렉토리 구조

```
scripts/asset/
└── 철이네/
    ├── blog_draft.md             ← 원고 (이미지 참조 포함)
    ├── KakaoTalk_Photo_...001.jpeg
    ├── KakaoTalk_Photo_...002.jpeg
    ├── KakaoTalk_Video_...001.gif
    └── ...
```

### 8.2 파일명 주의사항

- 한글 파일명은 업로드 시 오류를 유발할 수 있으므로 **영문/숫자** 파일명을 권장한다.
- **공백이 포함된 파일명** 은 마크다운에서 `<angle brackets>` 로 감싸서 참조한다.
  - 예: `![alt](<KakaoTalk Photo 001.jpeg>)`
- 파일 경로는 **절대 경로** 를 사용하는 것이 안정적이다.

---

## 9. 트러블슈팅

### 9.1 `file input` 을 DOM에서 찾을 수 없는 경우

**원인**: 스마트에디터가 사진 버튼 클릭 시에만 `<input>` 을 동적으로 생성한다.

**해결**:
1. 먼저 사진 버튼을 클릭하여 `<input>` 생성을 트리거한다.
2. 또는 방식 B(FileChooser)로 전환한다.

```python
# 동적 생성 트리거
try:
    photo_btn = editor_frame.locator('button[data-name="image"]').first
    await photo_btn.click()
    await asyncio.sleep(1)
except:
    pass

# 이제 input 찾기 시도
file_input = editor_frame.locator('input[type="file"]').first
```

### 9.2 iframe 내부에서 셀렉터가 인식되지 않는 경우

```python
# page 대신 editor_frame에서 찾기
for frame in page.frames:
    try:
        loc = frame.locator('input[type="file"]').first
        if await loc.count() > 0:
            file_input = loc
            break
    except:
        continue
```

### 9.3 이미지 업로드 후 에디터에 반영되지 않는 경우

**원인**: 네이버 서버에 이미지가 업로드되고 URL을 받아와 DOM에 삽입하는 비동기 과정이 완료되지 않음.

**해결**: 대기 시간을 늘리고, 삽입된 이미지 요소 출현을 감시한다.

```python
# 이미지 DOM 삽입 완료 대기
try:
    await editor_frame.locator('.se-image').last.wait_for(
        state='visible', timeout=10000
    )
    print("✅ 이미지 DOM 삽입 확인됨")
except:
    print("⚠️ 이미지 DOM 삽입 타임아웃")
```

### 9.4 `modifier` 변수 스코프 에러

**원인**: `modifier` 변수가 조건부 블록 안에서만 정의되어, 해당 블록을 건너뛸 경우 미정의 에러가 발생한다.

**해결**: 함수 최상단 또는 공통 영역에서 `modifier` 를 미리 정의한다.

```python
# ❌ 잘못된 패턴 — 제목 else 블록 안에서만 정의
if title_locator is None:
    print("스킵")
else:
    modifier = "Meta" if platform.system() == "Darwin" else "Control"
    # ... 제목 입력 ...

# 본문에서 modifier 사용 → NameError!
pyperclip.copy(line)
await page.keyboard.press(f"{modifier}+v")  # 💥 에러

# ✅ 올바른 패턴 — 공통 영역에서 정의
modifier = "Meta" if platform.system() == "Darwin" else "Control"

if title_locator is None:
    print("스킵")
else:
    # ... 제목 입력 ...
```

---

## 10. 대안: 네이버 블로그 Open API

브라우저 자동화 대신 공식 API를 사용할 수도 있다.

### API 스펙

- **URL**: `https://openapi.naver.com/blog/writePost.json`
- **Method**: `POST` (multipart/form-data)
- **인증**: `Authorization: Bearer {ACCESS_TOKEN}`

### 이미지 포함 포스팅 예제

```python
import requests

url = "https://openapi.naver.com/blog/writePost.json"
headers = {"Authorization": "Bearer YOUR_ACCESS_TOKEN"}

# 본문에서 #0, #1 등으로 이미지 위치 지정
data = {
    "title": "장산역술집 추천 — 철이네 숯불뼈닭발",
    "contents": (
        "<p>지인 추천으로 처음 온 집.</p>"
        "<img src='#0' />"
        "<p>전형적인 노포 감성.</p>"
        "<img src='#1' />"
    ),
}

# files 리스트에서 순서대로 #0, #1에 매핑
files = [
    ("image", ("photo1.jpeg", open("photo1.jpeg", "rb"), "image/jpeg")),
    ("image", ("photo2.jpeg", open("photo2.jpeg", "rb"), "image/jpeg")),
]

response = requests.post(url, headers=headers, data=data, files=files)
print(response.json())
```

> [!NOTE]
> Open API를 사용하면 봇 탐지 문제를 완전히 회피할 수 있다. 하지만 스마트에디터 ONE의 복잡한 레이아웃(이미지 정렬, 구분선 등)을 완전히 재현하기 어려울 수 있다.

---

## 11. 참고 자료

| 항목 | URL |
|------|-----|
| Playwright 파일 업로드 공식 문서 | https://playwright.dev/python/docs/input#upload-files |
| Playwright FileChooser API | https://playwright.dev/python/docs/api/class-filechooser |
| 네이버 블로그 Open API | https://developers.naver.com/docs/blog/api/ |

---

*마지막 업데이트: 2026-04-15*
