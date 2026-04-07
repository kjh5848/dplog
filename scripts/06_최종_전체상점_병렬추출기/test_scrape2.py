import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()
        await page.goto("https://m.place.naver.com/place/list?query=서면 고기집")
        await page.wait_for_timeout(3000)
        await page.screenshot(path="scrape_test2.png")
        html = await page.content()
        with open("scrape_test2.html", "w") as f:
            f.write(html)
        await browser.close()

asyncio.run(main())
