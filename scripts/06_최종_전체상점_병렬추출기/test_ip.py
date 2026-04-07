import asyncio
from playwright.async_api import async_playwright
import time

async def check_ip():
    print("🚀 IP 차단 여부 검사 시작...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
            viewport={"width": 390, "height": 844}
        )
        page = await context.new_page()
        print("네이버 플레이스 모바일 메인 진입 중...")
        response = await page.goto("https://m.place.naver.com", timeout=10000)
        
        status = response.status
        print(f"📡 응답 상태 코드: {status}")
        
        if status == 429:
            print("❌ 에러: 429 Too Many Requests (당신의 IP가 현재 네이버에 의해 일시적으로 차단된 상태입니다!)")
        elif status == 200:
            print("✅ 정상: 200 OK (IP 차단이 풀려있는 상태입니다.)")
        else:
            print(f"⚠️ 알 수 없는 상태: {status}")
            
        await page.screenshot(path="ip_check_result.png")
        print("📸 현재 화면을 ip_check_result.png 로 저장했습니다.")
        
        await browser.close()

if __name__ == "__main__":
    asyncio.run(check_ip())
