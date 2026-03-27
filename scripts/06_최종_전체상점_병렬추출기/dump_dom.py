import asyncio
from playwright.async_api import async_playwright

async def dump_html():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 390, 'height': 844}, user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1")
        await page.goto("https://m.place.naver.com/restaurant/1607631456/home", wait_until="networkidle")
        await page.wait_for_timeout(6000)
        html = await page.content()
        await page.screenshot(path="minam_sushi_screenshot.png")
        with open("minam_sushi_dump.html", "w", encoding="utf-8") as f:
            f.write(html)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(dump_html())
