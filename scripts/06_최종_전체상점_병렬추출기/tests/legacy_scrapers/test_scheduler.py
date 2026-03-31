import asyncio
from scheduler import run_scheduled_extraction

async def test():
    print("수동 스케줄러 실행 테스트 시작...")
    try:
        await run_scheduled_extraction()
        print("스케줄러 정상 종료")
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    asyncio.run(test())
