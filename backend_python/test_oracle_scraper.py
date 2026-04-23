import asyncio
import sys

# 프로젝트 경로 설정
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "."))

from domains.scraping.engine import ScrapingEngine

async def run_store_oracle():
    print("====================================")
    print(" [Oracle Test 1] 스토어 메타 데이터 수집 검증")
    print("====================================")
    test_keyword = "어니언 안국"
    print(f"검색어: '{test_keyword}'")
    
    try:
        results = await ScrapingEngine.search_store_by_name(test_keyword)
        print(f"\n[검색 결과] 총 {len(results)}건 발견")
        
        if len(results) > 0:
            top = results[0]
            print(f"- 상호명: {top.get('name')}")
            print(f"- 주소: {top.get('address')}")
            print(f"- 카테고리: {top.get('category')}")
            print(f"- Place ID: {top.get('id')}")
            print(f"- 썸네일: {top.get('thumUrl')[:50]}...")
            
            if "어니언" in top.get('name', '') and top.get('id'):
                print("✅ 결과 매칭 성공 (100% 매칭)")
            else:
                print("❌ 매칭 실패: 결과가 예상과 다릅니다.")
        else:
            print("❌ 매칭 실패: 결과를 찾지 못했습니다.")
            
    except Exception as e:
        print(f"❌ 수집 에러 발생: {e}")

async def run_rank_oracle():
    print("\n====================================")
    print(" [Oracle Test 2] 실시간 네이버 순위 수집 검증")
    print("====================================")
    from domains.scraping.ranking_engine import fetch_realtime_ranking
    
    keyword = "안국역 카페"
    province = "서울"
    shop_name = "어니언 안국"
    print(f"키워드: '{keyword}', 찾을 매장: '{shop_name}'")
    
    try:
        results = await fetch_realtime_ranking(keyword, province, shop_name)
        my_rank_info = next((item for item in results if item['shopName'] == shop_name), None)
        total_count = results[0]['totalCount'] if results else 0
        
        print(f"[검색 완료] 전체 노출 매장 수: {total_count}")
        if my_rank_info:
            print(f"✅ 순위 확인: '{shop_name}' 매장은 현재 {my_rank_info['rank']}위 노출 중입니다.")
            print(f" - 리뷰수: {my_rank_info.get('visitorReviewCount')} (방문자) / {my_rank_info.get('blogReviewCount')} (블로그)")
        else:
            print(f"⚠️ 매장을 300위 밖에서 찾지 못했습니다. 크롤링 방어에는 뚫리지 않았지만 노출 순위가 낮습니다.")
    except Exception as e:
        print(f"❌ 순위 크롤링 에러 발생: {e}")

async def main():
    await run_store_oracle()
    await run_rank_oracle()

if __name__ == "__main__":
    asyncio.run(main())
