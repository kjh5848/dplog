import asyncio
from playwright.async_api import async_playwright
import psutil
import os

def get_total_memory_mb():
    try:
        p_main = psutil.Process(os.getpid())
        total_rss = p_main.memory_info().rss
        
        # Get all child processes (Playwright spawns chromium as children)
        for child in p_main.children(recursive=True):
            try:
                total_rss += child.memory_info().rss
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                pass
                
        return total_rss / (1024 * 1024)
    except Exception:
        return 0

async def worker(playwright):
    browser = await playwright.chromium.launch(headless=True)
    context = await browser.new_context(
        user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    )
    page = await context.new_page()
    try:
        # Load naver place exactly like the real crawler to simulate Real-World memory footprint
        await page.goto("https://m.place.naver.com/place/list?query=%EB%B6%80%EC%82%B0%EC%8B%9C%EC%B2%AD%EB%A7%9B%EC%A7%91", timeout=15000)
        # Scroll simulation wait to let DOM build
        await asyncio.sleep(5) 
    except Exception as e:
        pass
    
    return browser

async def main():
    levels = [1, 3, 5, 8]
    print("🚀 Playwright Concurrency Memory Stress Test 🚀")
    print("-" * 50)
    
    base_memory = get_total_memory_mb()
    print(f"Base Memory (Before any browsers): {base_memory:.2f} MB\\n")
    
    async with async_playwright() as p:
        for workers in levels:
            print(f"⏳ Launching {workers} concurrent browsers...")
            tasks = [worker(p) for _ in range(workers)]
            
            # Gather all browsers
            browsers = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Measure Peak Working Set
            await asyncio.sleep(2) # Stabilize DOM
            peak_memory = get_total_memory_mb()
            used_by_browsers = peak_memory - base_memory
            avg_per_browser = used_by_browsers / workers if workers > 0 else 0
            
            print(f"✅ {workers} Browsers Finished Loading:")
            print(f"  - Peak Total Memory: {peak_memory:.2f} MB")
            print(f"  - Working Set (Used by browsers): {used_by_browsers:.2f} MB")
            print(f"  - Average Memory per Headless Instance: {avg_per_browser:.2f} MB\\n")
            
            # Teardown
            print("Cleaning up...")
            for b in browsers:
                if not isinstance(b, Exception):
                    try:
                        await b.close()
                    except:
                        pass
            
            # Wait for processes to die
            await asyncio.sleep(3)
            base_memory = get_total_memory_mb() # Update baseline for next round

if __name__ == "__main__":
    asyncio.run(main())
