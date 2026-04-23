import asyncio
from playwright.async_api import async_playwright
import json

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            viewport={'width': 390, 'height': 844},
            is_mobile=True, has_touch=True,
        )
        page = await context.new_page()
        
        found_data = []
        
        async def handle_response(response):
            if response.url and "graphql" in response.url.lower():
                try:
                    if response.request.method == "OPTIONS": return
                    data = await response.json()
                    payloads = data if isinstance(data, list) else [data]
                    for p in payloads:
                        if not p or "data" not in p or not p["data"]: continue
                        root = p["data"]
                        def find_biz(obj):
                            found = []
                            if isinstance(obj, dict):
                                biz_node = obj.get("businesses")
                                if isinstance(biz_node, dict) and isinstance(biz_node.get("items"), list):
                                    for b in biz_node["items"]:
                                        if isinstance(b, dict) and b.get("id"):
                                            found.append(b)
                                else:
                                    for k, v in obj.items():
                                        if k != "adBusinesses":
                                            found.extend(find_biz(v))
                            elif isinstance(obj, list):
                                for item in obj:
                                    found.extend(find_biz(item))
                            return found
                        extracted = find_biz(root)
                        if extracted:
                            found_data.extend(extracted)
                except Exception as e:
                    pass

        page.on("response", handle_response)
        await page.goto("https://m.place.naver.com/place/list?query=강남 빵집", wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(3000)
        await browser.close()
        
        if len(found_data) > 0:
            print("SAMPLE BIZ KEYS:", found_data[0].keys())
            for key in ["name", "visitorReviewCount", "blogArticleCount", "blogReviewCount", "reviewCount"]:
                print(f"{key}: {found_data[0].get(key)}")
            # Show all keys containing 'review' or 'blog'
            for k in found_data[0].keys():
                if 'review' in k.lower() or 'blog' in k.lower() or 'count' in k.lower():
                    print(f"Possible match: {k} = {found_data[0][k]}")

asyncio.run(run())
