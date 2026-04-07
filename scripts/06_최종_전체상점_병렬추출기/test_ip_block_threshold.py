import asyncio
import sys
from playwright.async_api import async_playwright

async def measure_threshold(concurrency: int, total_requests: int = 150):
    keywords = [f"서울 맛집 {i}" for i in range(1, total_requests + 1)]
    
    blocked = False
    success_count = 0
    fail_count = 0
    
    print(f"\n🚀 네이버 플레이스 임계점 브루트포스 테스트 시작")
    print(f"👉 설정된 동시성(Thread): {concurrency}개 병렬")
    print(f"👉 최대 시도 횟수: {total_requests}번\n")
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--disable-blink-features=AutomationControlled', '--no-sandbox']
        )
        
        sem = asyncio.Semaphore(concurrency)
        
        async def fetch_one(kw, index):
            nonlocal blocked, success_count, fail_count
            if blocked:
                return
            
            # 기획서 기준: 1초당 2~2.5개 생성 (약 0.4초 ~ 0.5초 간격)
            # 순차적으로 출발하도록 index에 비례한 지연 시간 추가 (Jitter)
            delay = (index % concurrency) * 0.5
            await asyncio.sleep(delay)
            
            context = await browser.new_context()
            page = await context.new_page()
            url = f"https://m.place.naver.com/place/list?query={kw}"
            
            try:
                # DOMContentLoaded까지만 대기하여 최고 속도로 서버 핑
                await page.goto(url, wait_until='domcontentloaded', timeout=15000)
                await asyncio.sleep(1) # 차단 렌더링용 1초 대기
                
                content = await page.content()
                
                # 차단 감지 로직 (네이버 안티봇 WAF)
                if "서비스 이용이 제한되었습니다" in content or "과도한 접근" in content:
                    if not blocked: # 첫 번째 블록 감지 시
                        print(f"🚨 [종료] 네이버 WAF IP 차단 발생 (과도한 접근 감지됨)")
                        print(f"   ► 현재 위치: {index}번째 요청 타격 지점")
                        blocked = True
                        
                        try:
                            # 증거 스크린샷 캡처
                            await page.screenshot(path="artifacts/blocked_evidence.png")
                            print("   ► 증거 화면이 'artifacts/blocked_evidence.png'에 저장되었습니다.")
                        except Exception as p_e:
                            await page.screenshot(path="blocked_evidence.png")
                            print("   ► 증거 화면 저장 완료 (루트폴더)")
                else:
                    if not blocked:
                        success_count += 1
                        sys.stdout.write(f"✅ {index} ")
                        sys.stdout.flush()
                        
            except Exception as e:
                if not blocked:
                    fail_count += 1
                    sys.stdout.write(f"❌ {index} ")
                    sys.stdout.flush()
            finally:
                try:
                    await page.close()
                    await context.close()
                except:
                    pass

        async def fetch_with_sem(kw, index):
            async with sem:
                await fetch_one(kw, index)
                
        tasks = []
        for i, kw in enumerate(keywords):
            if blocked:
                break
            tasks.append(fetch_with_sem(kw, i+1))
            
        await asyncio.gather(*tasks)
        await browser.close()
        
    print(f"\n\n=============================================")
    print(f"🛑 [테스트 종료] 데이터 수집 요약")
    print(f"=============================================")
    print(f"- 동시성(Concurrency) 옵션: {concurrency}")
    print(f"- 최종 무사 통과 건수       : {success_count}건")
    print(f"- 네트워크/타임아웃 에러 건수: {fail_count}건")
    if blocked:
        print(f"👉 결론: 현재 IP에서는 동시성 {concurrency} 기준으로 연속 요청 시, 약 {success_count + fail_count}번 전후로 WAF 차단 임계점에 도달합니다.")
    else:
        print(f"👉 결론: 최대 {total_requests}번을 모두 뚫었고, 아직 차단되지 않았습니다! (현재 환경이 매우 강력함)")
    print(f"=============================================\n")

if __name__ == "__main__":
    import asyncio
    concurrency_level = int(sys.argv[1]) if len(sys.argv) > 1 else 8
    asyncio.run(measure_threshold(concurrency_level))
