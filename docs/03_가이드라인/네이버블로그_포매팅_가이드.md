# 네이버 블로그 스마트에디터 ONE — 서식 자동화 가이드

> **목적**: Playwright(Python)를 사용하여 네이버 블로그 본문의 서식(제목, 소제목, 인용문, 볼드, 글자색, 배경색, 구분선 등)을 자동 적용하는 방법론을 정리한다.
> **핵심 원칙**: DOM 직접 조작이 아닌 **"사용자 동작 시뮬레이션"** 방식이 가장 안정적이다.

---

## 목차

1. [핵심 원칙](#1-핵심-원칙)
2. [제목 설정](#2-제목-설정)
3. [소제목 (Heading)](#3-소제목-heading)
4. [볼드 (굵게)](#4-볼드-굵게)
5. [인용문 (Quotation)](#5-인용문-quotation)
6. [글자색 변경](#6-글자색-변경)
7. [배경색 (하이라이트) 변경](#7-배경색-하이라이트-변경)
8. [구분선 삽입](#8-구분선-삽입)
9. [단축키 종합표](#9-단축키-종합표)
10. [유틸리티 함수 모음](#10-유틸리티-함수-모음)

---

## 1. 핵심 원칙

### 1.1 왜 DOM 직접 조작이 안 되는가

스마트에디터 ONE은 React 기반 컴포넌트 구조로, 내부 상태(State)를 별도로 관리한다.

```
❌ 실패하는 접근법
─────────────────
page.evaluate("document.querySelector('.se-text').style.fontWeight = 'bold'")
→ 에디터 내부 상태와 동기화되지 않아 저장·발행 시 서식이 날아감

✅ 성공하는 접근법
─────────────────
1. 텍스트를 선택(Selection)한다
2. 툴바 버튼을 클릭하거나 키보드 단축키를 누른다
→ 에디터가 자체 이벤트 핸들러를 통해 DOM과 상태를 동시에 업데이트
```

### 1.2 공통 준비 코드

```python
import asyncio
import platform
import pyperclip

# OS별 수식어 키 (Mac: Meta, Windows/Linux: Control)
MODIFIER = "Meta" if platform.system() == "Darwin" else "Control"

# iframe 내부 에디터 프레임 획득
async def get_editor_frame(page):
    """스마트에디터가 iframe 안에 있을 경우 해당 프레임을 반환한다."""
    editor_frame = page
    for frame in page.frames:
        if frame.name == "mainFrame":
            editor_frame = frame
            break
    return editor_frame
```

### 1.3 텍스트 선택 유틸리티

서식 적용의 전제조건은 **텍스트가 선택된 상태** 이다.

```python
async def select_current_line(page):
    """현재 줄 전체를 선택한다."""
    await page.keyboard.press("Home")       # 줄 처음으로
    await page.keyboard.down("Shift")
    await page.keyboard.press("End")        # Shift 누른 채 줄 끝까지
    await page.keyboard.up("Shift")

async def select_last_pasted_text(page, text_length: int):
    """방금 붙여넣은 텍스트를 역방향으로 선택한다."""
    await page.keyboard.down("Shift")
    for _ in range(text_length):
        await page.keyboard.press("ArrowLeft")
    await page.keyboard.up("Shift")

async def select_all_text(page):
    """본문 전체를 선택한다."""
    await page.keyboard.press(f"{MODIFIER}+a")
```

---

## 2. 제목 설정

### 2.1 DOM 구조

```
┌─ 제목 영역 ──────────────────────────────────────────┐
│                                                      │
│  셀렉터 후보 (우선순위순):                            │
│  1. .se-title-input                                  │
│  2. [placeholder='제목']                             │
│  3. .se-placeholder                                  │
│  4. div[contenteditable='true']  (첫 번째)            │
│                                                      │
│  ※ contenteditable 영역이므로 fill() 사용 불가        │
│  ※ 클립보드 붙여넣기(Cmd+V) 방식 사용 필수            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 2.2 구현 코드

```python
async def set_post_title(page, editor_frame, title: str):
    """블로그 포스트 제목을 설정한다."""
    
    title_selectors = [
        ".se-title-input",
        "[placeholder='제목']",
        ".se-placeholder",
        "div[contenteditable='true']",
    ]
    
    title_locator = None
    for sel in title_selectors:
        try:
            loc = editor_frame.locator(sel).first
            if await loc.is_visible(timeout=3000):
                title_locator = loc
                print(f"✅ 제목 요소 발견: {sel}")
                break
        except:
            continue
    
    if title_locator is None:
        print("❌ 제목 요소를 찾지 못했습니다.")
        return False
    
    # 제목 영역 클릭 → 포커스 확보
    await title_locator.click()
    await asyncio.sleep(0.5)
    
    # 기존 제목이 있을 수 있으므로 전체 선택 후 덮어쓰기
    await page.keyboard.press(f"{MODIFIER}+a")
    await asyncio.sleep(0.2)
    
    # 클립보드 붙여넣기 (한글 IME 이슈 우회)
    pyperclip.copy(title)
    await page.keyboard.press(f"{MODIFIER}+v")
    await asyncio.sleep(1)
    
    print(f"✅ 제목 설정 완료: {title}")
    return True
```

> [!TIP]
> 제목 입력 후 `Enter` 를 누르면 커서가 자동으로 본문 영역으로 이동한다. 별도의 본문 포커스 클릭이 필요 없다.

---

## 3. 소제목 (Heading)

### 3.1 원리

스마트에디터 ONE의 소제목은 툴바의 **"본문"** 드롭다운에서 선택한다.
- **제목 (h2)**: SEO에 매우 중요. `se-section-title` 클래스 적용
- **소제목 (h3)**: 하위 구조화용. `se-section-subtitle` 또는 유사 클래스

### 3.2 접근법 — 툴바 드롭다운 클릭

```python
async def apply_heading(page, editor_frame, level: str = "heading2"):
    """현재 줄에 소제목 스타일을 적용한다.
    
    Args:
        level: "heading2" (제목) 또는 "heading3" (소제목)
    """
    # 1. 현재 줄 전체 선택
    await select_current_line(page)
    await asyncio.sleep(0.3)
    
    # 2. 툴바의 "본문" 드롭다운 버튼 클릭
    paragraph_btn_selectors = [
        'button[data-name="paragraph"]',
        '.se-toolbar-item-paragraph',
        '.se-text-paragraph-button',
    ]
    
    for sel in paragraph_btn_selectors:
        try:
            btn = editor_frame.locator(sel).first
            if await btn.is_visible(timeout=2000):
                await btn.click()
                print(f"✅ 문단 드롭다운 열림: {sel}")
                break
        except:
            continue
    
    await asyncio.sleep(0.5)
    
    # 3. 드롭다운 메뉴에서 해당 레벨 선택
    heading_selectors = {
        "heading2": ['[data-value="heading2"]', ':text("제목")', '.se-item-heading2'],
        "heading3": ['[data-value="heading3"]', ':text("소제목")', '.se-item-heading3'],
    }
    
    for sel in heading_selectors.get(level, []):
        try:
            item = editor_frame.locator(sel).first
            if await item.is_visible(timeout=2000):
                await item.click()
                print(f"✅ {level} 적용 완료")
                return True
        except:
            continue
    
    print(f"⚠️ {level} 메뉴 항목을 찾지 못했습니다.")
    return False
```

> [!IMPORTANT]
> 소제목은 **줄 단위** 로 적용된다. 반드시 커서가 해당 줄에 위치하거나 해당 줄이 선택된 상태에서 적용해야 한다.

---

## 4. 볼드 (굵게)

### 4.1 방법 A — 키보드 단축키 (⭐ 권장)

가장 간단하고 안정적인 방법이다.

```python
async def apply_bold(page, text: str = None):
    """텍스트에 볼드 서식을 적용한다.
    
    Args:
        text: None이면 현재 선택된 텍스트에 적용.
              문자열이면 볼드로 입력 후 해제.
    """
    if text:
        # 볼드 ON → 텍스트 입력 → 볼드 OFF
        await page.keyboard.press(f"{MODIFIER}+b")
        await asyncio.sleep(0.2)
        
        pyperclip.copy(text)
        await page.keyboard.press(f"{MODIFIER}+v")
        await asyncio.sleep(0.5)
        
        await page.keyboard.press(f"{MODIFIER}+b")  # 볼드 해제
        await asyncio.sleep(0.2)
    else:
        # 현재 선택된 텍스트에 볼드 토글
        await page.keyboard.press(f"{MODIFIER}+b")
        await asyncio.sleep(0.3)
    
    print("✅ 볼드 적용 완료")
```

### 4.2 방법 B — 툴바 버튼 클릭

```python
async def apply_bold_via_toolbar(page, editor_frame):
    """툴바의 굵게(B) 버튼을 클릭하여 볼드를 적용한다."""
    bold_selectors = [
        'button[data-name="bold"]',
        '.se-toolbar-item-bold',
        'button[title*="굵게"]',
    ]
    
    for sel in bold_selectors:
        try:
            btn = editor_frame.locator(sel).first
            if await btn.is_visible(timeout=2000):
                await btn.click()
                print(f"✅ 볼드 버튼 클릭: {sel}")
                return True
        except:
            continue
    
    print("⚠️ 볼드 버튼을 찾지 못했습니다. 단축키로 폴백합니다.")
    await page.keyboard.press(f"{MODIFIER}+b")
    return True
```

### 4.3 사용 패턴 — "텍스트 입력 후 볼드 적용"

```python
# 패턴 1: 볼드 텍스트를 직접 입력
await apply_bold(page, text="중요한 내용")

# 패턴 2: 이미 입력한 텍스트를 선택 후 볼드 적용
pyperclip.copy("일반 텍스트")
await page.keyboard.press(f"{MODIFIER}+v")
await select_last_pasted_text(page, len("일반 텍스트"))
await apply_bold(page)  # text=None → 선택 영역에 적용
```

---

## 5. 인용문 (Quotation)

### 5.1 DOM 구조

```
┌─ 인용문 컴포넌트 ────────────────────────────────────┐
│  <div class="se-component se-quotation">             │
│    <blockquote class="se-quote">                     │
│      <div class="se-text-paragraph">                 │
│        <span>인용 텍스트 내용</span>                  │
│      </div>                                          │
│    </blockquote>                                     │
│  </div>                                              │
└──────────────────────────────────────────────────────┘
```

### 5.2 접근법 — 툴바 인용구 버튼 클릭

```python
async def insert_quotation(page, editor_frame, text: str):
    """인용문을 삽입한다.
    
    전략: 툴바의 인용구 버튼 클릭 → 생성된 영역에 텍스트 입력
    """
    # 1. 인용구 버튼 찾기 및 클릭
    quote_btn_selectors = [
        'button[data-name="quotation"]',
        '.se-toolbar-item-quotation',
        'button[title*="인용"]',
    ]
    
    quote_btn = None
    for sel in quote_btn_selectors:
        try:
            btn = editor_frame.locator(sel).first
            if await btn.is_visible(timeout=2000):
                quote_btn = btn
                print(f"✅ 인용구 버튼 발견: {sel}")
                break
        except:
            continue
    
    if quote_btn is None:
        print("❌ 인용구 버튼을 찾지 못했습니다.")
        return False
    
    await quote_btn.click()
    await asyncio.sleep(1)  # 인용문 컴포넌트 생성 대기
    
    # 2. 생성된 인용문 영역에 텍스트 입력
    # 버튼 클릭 후 커서가 자동으로 인용문 내부로 이동해야 함
    pyperclip.copy(text)
    await page.keyboard.press(f"{MODIFIER}+v")
    await asyncio.sleep(0.8)
    
    print(f"✅ 인용문 삽입 완료: {text[:30]}...")
    
    # 3. 인용문 밖으로 커서 이동 (아래 화살표 or Enter 2회)
    await page.keyboard.press("ArrowDown")
    await asyncio.sleep(0.3)
    await page.keyboard.press("Enter")
    await asyncio.sleep(0.3)
    
    return True
```

### 5.3 대안 — '+' 버튼 메뉴에서 인용구 선택

에디터 본문에서 커서를 두면 나타나는 '+' 버튼을 통해서도 인용구를 삽입할 수 있다.

```python
async def insert_quotation_via_plus_btn(page, editor_frame, text: str):
    """'+' 버튼 메뉴에서 인용구를 삽입한다."""
    
    # 1. '+' 버튼 클릭
    plus_btn_selectors = [
        '.se-component-add-button',
        'button[data-name="component-add"]',
        '.se-add-button',
    ]
    
    for sel in plus_btn_selectors:
        try:
            btn = editor_frame.locator(sel).first
            if await btn.is_visible(timeout=3000):
                await btn.click()
                print(f"✅ '+' 버튼 클릭: {sel}")
                break
        except:
            continue
    
    await asyncio.sleep(0.5)
    
    # 2. 인용구 메뉴 항목 클릭
    quote_menu_selectors = [
        ':text("인용구")',
        '[data-name="quotation"]',
        '.se-popup-component-quotation',
    ]
    
    for sel in quote_menu_selectors:
        try:
            item = editor_frame.locator(sel).first
            if await item.is_visible(timeout=2000):
                await item.click()
                break
        except:
            continue
    
    await asyncio.sleep(1)
    
    # 3. 텍스트 입력
    pyperclip.copy(text)
    await page.keyboard.press(f"{MODIFIER}+v")
    await asyncio.sleep(0.8)
    
    # 4. 인용문 밖으로 나가기
    await page.keyboard.press("Escape")
    await asyncio.sleep(0.3)
    await page.keyboard.press("ArrowDown")
    await asyncio.sleep(0.3)
    
    return True
```

---

## 6. 글자색 변경

### 6.1 DOM 구조 — 색상 선택 팝업

```
┌─ 툴바 ──────────────────────────────────────────────┐
│                                                      │
│  [A] 글자색 버튼                                     │
│   셀렉터: button[data-name="fontColor"]              │
│           .se-toolbar-item-font-color                │
│           button[title*="글자색"]                     │
│                                                      │
│  클릭 시 팝업 ↓                                      │
│  ┌─ 색상 팔레트 (.se-color-picker) ─────────────┐   │
│  │  ┌───┬───┬───┬───┬───┬───┬───┬───┐          │   │
│  │  │   │   │   │   │   │   │   │   │  색상들  │   │
│  │  └───┴───┴───┴───┴───┴───┴───┴───┘          │   │
│  │                                               │   │
│  │  각 색상 셀:                                  │   │
│  │  button[data-color="#FF0000"]                  │   │
│  │  또는 style="background-color: rgb(...)"      │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### 6.2 구현 코드

```python
async def apply_font_color(page, editor_frame, color_hex: str):
    """선택된 텍스트의 글자색을 변경한다.
    
    Args:
        color_hex: "#FF0000" 형식의 HEX 색상값
    """
    # 1. 글자색 버튼 클릭 → 팝업 열기
    color_btn_selectors = [
        'button[data-name="fontColor"]',
        '.se-toolbar-item-font-color',
        'button[title*="글자색"]',
        'button[title*="글꼴 색"]',
    ]
    
    for sel in color_btn_selectors:
        try:
            btn = editor_frame.locator(sel).first
            if await btn.is_visible(timeout=2000):
                await btn.click()
                print(f"✅ 글자색 버튼 클릭: {sel}")
                break
        except:
            continue
    
    await asyncio.sleep(0.5)
    
    # 2. 색상 팔레트에서 원하는 색상 선택
    color_selectors = [
        f'button[data-color="{color_hex}"]',
        f'button[data-color="{color_hex.lower()}"]',
        f'[style*="background-color: {color_hex}"]',
        f'[data-value="{color_hex}"]',
    ]
    
    for sel in color_selectors:
        try:
            color_cell = editor_frame.locator(sel).first
            if await color_cell.is_visible(timeout=2000):
                await color_cell.click()
                print(f"✅ 글자색 적용 완료: {color_hex}")
                return True
        except:
            continue
    
    # 3. 팔레트에서 못찾으면 → 직접 입력 (커스텀 색상)
    try:
        custom_input = editor_frame.locator(
            'input[type="text"].se-color-input, input[placeholder*="색상"]'
        ).first
        if await custom_input.is_visible(timeout=2000):
            await custom_input.fill(color_hex.replace("#", ""))
            await page.keyboard.press("Enter")
            print(f"✅ 커스텀 글자색 적용 완료: {color_hex}")
            return True
    except:
        pass
    
    print(f"⚠️ 색상 {color_hex}를 적용하지 못했습니다.")
    # 팝업 닫기
    await page.keyboard.press("Escape")
    return False
```

### 6.3 자주 사용하는 색상 상수

```python
# 네이버 블로그에서 자주 사용하는 글자색
COLORS = {
    "검정":     "#000000",
    "빨강":     "#FF0000",
    "파랑":     "#0000FF",
    "초록":     "#008000",
    "주황":     "#FF6600",
    "보라":     "#800080",
    "회색":     "#808080",
    "네이버녹색": "#03C75A",
}
```

---

## 7. 배경색 (하이라이트) 변경

### 7.1 원리

글자색과 동일한 패턴이지만, **배경색(하이라이트)** 전용 버튼을 사용한다.

### 7.2 구현 코드

```python
async def apply_highlight_color(page, editor_frame, color_hex: str):
    """선택된 텍스트의 배경색(하이라이트)을 변경한다.
    
    Args:
        color_hex: "#FFFF00" 형식의 HEX 색상값
    """
    # 1. 배경색 버튼 클릭 → 팝업 열기
    bg_btn_selectors = [
        'button[data-name="backgroundColor"]',
        'button[data-name="highlight"]',
        '.se-toolbar-item-background-color',
        'button[title*="배경색"]',
        'button[title*="형광펜"]',
    ]
    
    for sel in bg_btn_selectors:
        try:
            btn = editor_frame.locator(sel).first
            if await btn.is_visible(timeout=2000):
                await btn.click()
                print(f"✅ 배경색 버튼 클릭: {sel}")
                break
        except:
            continue
    
    await asyncio.sleep(0.5)
    
    # 2. 색상 선택 (글자색과 동일한 로직)
    color_selectors = [
        f'button[data-color="{color_hex}"]',
        f'button[data-color="{color_hex.lower()}"]',
        f'[data-value="{color_hex}"]',
    ]
    
    for sel in color_selectors:
        try:
            color_cell = editor_frame.locator(sel).first
            if await color_cell.is_visible(timeout=2000):
                await color_cell.click()
                print(f"✅ 배경색 적용 완료: {color_hex}")
                return True
        except:
            continue
    
    print(f"⚠️ 배경색 {color_hex}를 적용하지 못했습니다.")
    await page.keyboard.press("Escape")
    return False
```

### 7.3 자주 사용하는 배경색 상수

```python
# 네이버 블로그에서 자주 사용하는 배경(하이라이트)색
HIGHLIGHT_COLORS = {
    "노랑":     "#FFFF00",
    "연두":     "#CCFF66",
    "하늘":     "#66CCFF",
    "분홍":     "#FF99CC",
    "연보라":   "#CC99FF",
    "연회색":   "#E0E0E0",
}
```

---

## 8. 구분선 삽입

### 8.1 접근법 — '+' 버튼 → 구분선

스마트에디터 ONE에서 구분선은 툴바가 아닌 **'+' 버튼 메뉴** 에서 삽입한다.

```python
async def insert_horizontal_line(page, editor_frame):
    """본문에 구분선(수평선)을 삽입한다."""
    
    # 1. '+' 버튼 클릭
    plus_btn_selectors = [
        '.se-component-add-button',
        'button[data-name="component-add"]',
        '.se-add-button',
    ]
    
    for sel in plus_btn_selectors:
        try:
            btn = editor_frame.locator(sel).first
            if await btn.is_visible(timeout=3000):
                await btn.click()
                break
        except:
            continue
    
    await asyncio.sleep(0.5)
    
    # 2. 구분선 메뉴 클릭
    hr_menu_selectors = [
        ':text("구분선")',
        '[data-name="horizontalLine"]',
        '.se-popup-component-hr',
        'button[title*="구분선"]',
    ]
    
    for sel in hr_menu_selectors:
        try:
            item = editor_frame.locator(sel).first
            if await item.is_visible(timeout=2000):
                await item.click()
                print("✅ 구분선 삽입 완료")
                await asyncio.sleep(1)
                return True
        except:
            continue
    
    print("⚠️ 구분선 메뉴를 찾지 못했습니다.")
    await page.keyboard.press("Escape")
    return False
```

### 8.2 대안 — 텍스트 기반 시각적 구분

구분선 삽입이 실패할 경우, 텍스트로 시각적 구분을 대신할 수 있다.

```python
async def insert_text_divider(page):
    """텍스트 기반 시각적 구분자를 입력한다."""
    pyperclip.copy("━━━━━━━━━━━━━━━━━━━━")
    await page.keyboard.press(f"{MODIFIER}+v")
    await asyncio.sleep(0.5)
    await page.keyboard.press("Enter")
```

---

## 9. 단축키 종합표

| 기능 | Windows/Linux | macOS | Playwright 코드 |
|------|-------------|-------|-----------------|
| **굵게 (볼드)** | `Ctrl+B` | `⌘+B` | `page.keyboard.press(f"{MODIFIER}+b")` |
| **기울임 (이탤릭)** | `Ctrl+I` | `⌘+I` | `page.keyboard.press(f"{MODIFIER}+i")` |
| **밑줄** | `Ctrl+U` | `⌘+U` | `page.keyboard.press(f"{MODIFIER}+u")` |
| **취소선** | `Ctrl+D` | `⌘+D` | `page.keyboard.press(f"{MODIFIER}+d")` |
| **실행 취소** | `Ctrl+Z` | `⌘+Z` | `page.keyboard.press(f"{MODIFIER}+z")` |
| **다시 실행** | `Ctrl+Y` | `⌘+Y` | `page.keyboard.press(f"{MODIFIER}+y")` |
| **전체 선택** | `Ctrl+A` | `⌘+A` | `page.keyboard.press(f"{MODIFIER}+a")` |
| **복사** | `Ctrl+C` | `⌘+C` | `page.keyboard.press(f"{MODIFIER}+c")` |
| **붙여넣기** | `Ctrl+V` | `⌘+V` | `page.keyboard.press(f"{MODIFIER}+v")` |

> [!NOTE]
> 글자색, 배경색, 소제목, 인용문은 전용 단축키가 없다. 반드시 **툴바 버튼 클릭** 으로 처리해야 한다.

---

## 10. 유틸리티 함수 모음

### 10.1 서식이 있는 텍스트 한 줄 입력

```python
async def type_formatted_line(page, editor_frame, text: str, 
                               bold=False, color=None, highlight=None):
    """서식이 적용된 텍스트 한 줄을 입력한다.
    
    Args:
        text:      입력할 텍스트
        bold:      볼드 적용 여부
        color:     글자색 HEX (예: "#FF0000")
        highlight: 배경색 HEX (예: "#FFFF00")
    """
    # 1. 볼드 ON (필요 시)
    if bold:
        await page.keyboard.press(f"{MODIFIER}+b")
        await asyncio.sleep(0.2)
    
    # 2. 텍스트 입력
    pyperclip.copy(text)
    await page.keyboard.press(f"{MODIFIER}+v")
    await asyncio.sleep(0.8)
    
    # 3. 방금 입력한 텍스트 선택 (색상 적용 위해)
    if color or highlight:
        await select_last_pasted_text(page, len(text))
        await asyncio.sleep(0.3)
    
    # 4. 글자색 적용
    if color:
        await apply_font_color(page, editor_frame, color)
        await asyncio.sleep(0.3)
    
    # 5. 배경색 적용
    if highlight:
        await apply_highlight_color(page, editor_frame, highlight)
        await asyncio.sleep(0.3)
    
    # 6. 볼드 OFF (다음 텍스트에 영향 안 주기 위해)
    if bold:
        # 선택 해제 후 볼드 토글
        await page.keyboard.press("End")
        await page.keyboard.press(f"{MODIFIER}+b")
        await asyncio.sleep(0.2)
    
    # 7. 줄바꿈
    await page.keyboard.press("Enter")
    await asyncio.sleep(0.3)
```

### 10.2 원고 마크다운 서식 파서

```python
import re

def parse_markdown_formatting(text: str):
    """마크다운 서식을 파싱하여 청크 리스트로 반환한다.
    
    지원: **볼드**, *이탤릭*, ==하이라이트==
    
    Returns:
        list[dict]: [
            {'text': '일반 텍스트', 'bold': False, 'italic': False, 'highlight': False},
            {'text': '강조 텍스트', 'bold': True, 'italic': False, 'highlight': False},
            ...
        ]
    """
    chunks = []
    # 간단한 **볼드** 파싱 예시
    parts = re.split(r'(\*\*.*?\*\*)', text)
    
    for part in parts:
        if part.startswith('**') and part.endswith('**'):
            chunks.append({
                'text': part[2:-2],
                'bold': True,
                'italic': False,
                'highlight': False,
            })
        else:
            chunks.append({
                'text': part,
                'bold': False,
                'italic': False,
                'highlight': False,
            })
    
    return chunks
```

### 10.3 서식 적용 통합 루프

```python
async def write_formatted_body(page, editor_frame, segments: list):
    """파싱된 세그먼트 리스트를 순서대로 에디터에 입력한다.
    
    Args:
        segments: parse_draft_with_images()의 반환값
                  각 세그먼트는 {'type': 'text'|'image'|'quote'|'heading'|'hr', ...}
    """
    for seg in segments:
        seg_type = seg.get('type', 'text')
        
        if seg_type == 'text':
            lines = seg['content'].split('\n')
            for line in lines:
                if line.strip():
                    pyperclip.copy(line)
                    await page.keyboard.press(f"{MODIFIER}+v")
                    await asyncio.sleep(0.8)
                await page.keyboard.press("Enter")
                await asyncio.sleep(0.3)
        
        elif seg_type == 'heading':
            pyperclip.copy(seg['content'])
            await page.keyboard.press(f"{MODIFIER}+v")
            await asyncio.sleep(0.5)
            await apply_heading(page, editor_frame, seg.get('level', 'heading2'))
            await page.keyboard.press("Enter")
            await asyncio.sleep(0.5)
        
        elif seg_type == 'quote':
            await insert_quotation(page, editor_frame, seg['content'])
        
        elif seg_type == 'bold_text':
            await type_formatted_line(
                page, editor_frame,
                text=seg['content'],
                bold=True,
                color=seg.get('color'),
                highlight=seg.get('highlight'),
            )
        
        elif seg_type == 'hr':
            await insert_horizontal_line(page, editor_frame)
        
        elif seg_type == 'image':
            # NAVER_BLOG_IMAGE_UPLOAD.md 참조
            pass
```

---

## 11. 트러블슈팅

### 11.1 서식 버튼이 비활성화되어 있는 경우

**원인**: 커서가 본문 편집 영역에 포커스되지 않았거나, 인용문/이미지 등 특수 컴포넌트 안에 있음.

**해결**:
```python
# 본문 메인 컨테이너로 포커스 강제 이동
await editor_frame.locator('.se-main-container').click(
    position={"x": 50, "y": 150},
    timeout=3000
)
await asyncio.sleep(0.5)
```

### 11.2 색상 팔레트가 열리지 않는 경우

**원인**: 툴바가 접혀 있거나, 글자색 버튼 옆의 드롭다운 화살표를 클릭해야 함.

**해결**:
```python
# 버튼 옆 드롭다운 화살표 클릭 시도
dropdown_arrow = editor_frame.locator(
    'button[data-name="fontColor"] + .se-toolbar-item-arrow, '
    '.se-toolbar-item-font-color .se-toolbar-dropdown-arrow'
).first
await dropdown_arrow.click(timeout=2000)
```

### 11.3 선택 범위가 적용되지 않는 경우

**원인**: `select_last_pasted_text()` 에서 한글 글자 수와 커서 이동 횟수가 불일치.

**해결**: 한글은 조합 문자이므로 ArrowLeft 한 번이 한 글자를 이동한다. `len()` 으로 글자 수를 세는 것은 정상 동작한다. 하지만 이모지나 특수문자가 포함된 경우 불일치가 발생할 수 있다.

```python
# 안전한 대안: Home → Shift+End 로 줄 전체 선택
await page.keyboard.press("Home")
await page.keyboard.down("Shift")
await page.keyboard.press("End")
await page.keyboard.up("Shift")
```

---

## 12. 참고 자료

| 항목 | URL |
|------|-----|
| 이미지 삽입 가이드 | [NAVER_BLOG_IMAGE_UPLOAD.md](./NAVER_BLOG_IMAGE_UPLOAD.md) |
| Playwright 키보드 API | https://playwright.dev/python/docs/input#keys-and-shortcuts |
| Playwright Selection API | https://playwright.dev/python/docs/input#type-characters |

---

*마지막 업데이트: 2026-04-15*
