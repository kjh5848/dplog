import asyncio
import os
from playwright.async_api import async_playwright

async def capture():
    print("📸 네이버 429 차단 실제 화면 증거 채집 중...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=['--disable-blink-features=AutomationControlled'])
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15",
            viewport={'width': 390, 'height': 844},
            is_mobile=True, has_touch=True
        )
        page = await context.new_page()
        try:
            await page.goto("https://m.place.naver.com/place/list?query=연산동 쪽갈비", wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(3000)
            
            # Save to the artifacts directly and print path
            out_path = "/Users/nomadlab/.gemini/antigravity/brain/7e79d334-d3b1-41a2-99eb-db98e814ada9/artifacts/evidence_429.png"
            # Ensure dir exists
            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            await page.screenshot(path=out_path)
            print(f"✅ 증거 샷 캡처 완료: {out_path}")
        except Exception as e:
            print(f"❌ 캡처 에러: {e}")
        finally:
            await browser.close()

if __name__ == '__main__':
    asyncio.run(capture())
