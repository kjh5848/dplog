import asyncio
from place_detail_extractor import scrape_place_details, extract_place_id
from naver_ads_client import get_keyword_stats

async def test():
    url = "https://map.naver.com/p/smart-around/place/2040676195?c=15.00,0,0,0,dh&placePath=/home?from=map&fromPanelNum=2&timestamp=202603311650&locale=ko&svcName=map_pcv5"
    print("1. Extracting ID...")
    pid = await extract_place_id(url)
    print(f"Extracted ID: {pid}")
    
    print("2. Scraping details...")
    details = await scrape_place_details(pid)
    print(f"Details extracted. Name: {details.get('name')}")
    
    print("3. Getting keyword stats...")
    kws = details.get('suggested_keywords', [])
    try:
        stats = get_keyword_stats(kws)
        print("Stats success:", len(stats))
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(test())
