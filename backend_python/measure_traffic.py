import asyncio
from playwright.async_api import async_playwright

async def measure_scenario(name, url, is_scroll=False, block_resources=False):
    total_bytes = 0

    def handle_response(response):
        nonlocal total_bytes
        try:
            size_str = response.headers.get("content-length")
            if size_str:
                total_bytes += int(size_str)
        except Exception:
            pass

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={'width': 390, 'height': 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
        )
        page = await context.new_page()
        page.on("response", handle_response)

        if block_resources:
            async def intercept_route(route):
                if route.request.resource_type in ["image", "media", "font", "stylesheet"]:
                    await route.abort()
                else:
                    await route.continue_()
            await page.route("**/*", intercept_route)

        await page.goto(url, wait_until="networkidle" if not is_scroll else "domcontentloaded")

        if is_scroll:
            for _ in range(5):
                await page.evaluate("window.scrollTo(0, document.body.scrollHeight);")
                await page.wait_for_timeout(800)

        await browser.close()

    kb = total_bytes / 1024
    mb = kb / 1024
    mode = "ON (최적화)" if block_resources else "OFF (비최적화)"
    print(f"[{name}] 이미지 차단 {mode} -> {kb:.2f} KB ({mb:.2f} MB)")

async def main():
    print("🚀 트래픽 측정 시작...")
    
    # 기능 1: 단건 조회 (기본 스크래핑)
    url_single = "https://m.place.naver.com/place/list?query=대전%20성심당"
    print("\n--- 1. 스토어 기본 검색 (단건 조회) ---")
    await measure_scenario("기본검색", url_single, is_scroll=False, block_resources=False)
    await measure_scenario("기본검색", url_single, is_scroll=False, block_resources=True)

    # 기능 2: 순위 추적 (무한 스크롤)
    url_scroll = "https://m.place.naver.com/place/list?query=대전은행동맛집"
    print("\n--- 2. 순위 추적 (스크롤 5회 진행) ---")
    await measure_scenario("순위추적", url_scroll, is_scroll=True, block_resources=False)
    await measure_scenario("순위추적", url_scroll, is_scroll=True, block_resources=True)

    print("\n✅ 측정 완료!")

if __name__ == "__main__":
    asyncio.run(main())
