import os
import shutil
import glob
import re

base_dir = "/Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog"
scripts_dir = os.path.join(base_dir, "scripts")

# ==========================================
# 1. 파일별 매핑 딕셔너리 (주석, 폴더, 엑셀명)
# ==========================================
MAPPING = {
    # 01. 실험 및 기초 테스트
    "test_map.py": {
        "folder": "01_초기_모바일DOM_탐색",
        "doc": '"""네이버 지도 모바일 버전의 DOM 구조를 파악하기 위한 기초 탐색 스크립트입니다."""\n'
    },
    "test_map_2.py": {
        "folder": "01_초기_모바일DOM_탐색",
        "doc": '"""네이버 지도 모바일 버전에서 플레이스 리스트를 순회할 수 있는지 검증하는 두번째 기초 스크립트입니다."""\n'
    },
    "probe_list.py": {
        "folder": "01_초기_모바일DOM_탐색",
        "doc": '"""GraphQL 렌더링이 아닌 실제 HTML DOM 객체에서 데이터를 파싱할 수 있는지 탐침(Probe)용으로 만든 코드입니다."""\n'
    },
    "naver_place_scraper.py": {
        "folder": "01_초기_모바일DOM_탐색",
        "doc": '"""원시적인 형태의 싱글스레드 네이버 플레이스 스크래퍼 초기버전입니다."""\n'
    },
    "naver_place_playwright.py": {
        "folder": "01_초기_모바일DOM_탐색",
        "doc": '"""Playwright의 동적 렌더링을 활용하여 자바스크립트 우회를 시도한 기초 렌더링 검증 코드입니다."""\n'
    },

    # 02. 안티봇 및 캡차 대응
    "capture_naver_captcha.py": {
        "folder": "02_안티봇_캡차_디버깅",
        "doc": '"""네이버 방화벽이 발생시키는 캡차(자동가입방지) 화면을 강제로 캡처하여 원인을 분석하기 위한 스크립트입니다."""\n'
    },
    "show_naver_captcha_live.py": {
        "folder": "02_안티봇_캡차_디버깅",
        "doc": '"""Headless 옵션을 끄고 라이브 화면을 띄워 캡차 발생 순간을 눈으로 모니터링하기 위한 도구입니다."""\n'
    },

    # 03. 랭킹 추적 엔진 코어
    "naver_map_rank_tracker.py": {
        "folder": "03_랭킹추적_코어_모듈",
        "doc": '"""단일 키워드에 대해 상점의 정확한 노출 순위를 검색해 반환하는 랭킹 추적 모듈의 심장부분입니다."""\n'
    },
    "naver_map_parallel_tracker.py": {
        "folder": "03_랭킹추적_코어_모듈",
        "doc": '"""Asyncio를 활용하여 단일 키워드의 랭커 검색을 비동기 스크래핑으로 처리하도록 최적화한 모듈입니다."""\n'
    },
    "naver_keyword_engine.py": {
        "folder": "03_랭킹추적_코어_모듈",
        "doc": '"""D-PLOG 메인 시스템에서 DB와 연동하기 위해 설계된 키워드별 연산 코어 파이썬 모듈입니다."""\n'
    },
    "dplog_store_diagnostic.py": {
        "folder": "03_랭킹추적_코어_모듈",
        "doc": '"""최종 추출된 상점 데이터를 D-PLOG 백엔드로 전송하거나 진단 보고서 규격에 맞게 포매팅하는 스크립트입니다."""\n'
    },

    # 04. WAF 안전선(Golden Ratio) 테스트
    "naver_place_parallel_extractor.py": {
        "folder": "04_병렬접속_WAF_한계테스트",
        "doc": '"""다중 접속 시 네이버 IP Block 임계점을 파악하기 위해 병렬로 타겟 상점을 추출하는 테스트용 모듈입니다."""\n',
        "excels": {"top3_ranking_pujimhan.xlsx": "타겟상점_순위추적_결과.xlsx"}
    },
    "naver_place_parallel_test.py": {
        "folder": "04_병렬접속_WAF_한계테스트",
        "doc": '"""비동기 병렬 접속(Concurrency)이 특정 개수를 넘어갈 때 서버에서 어떻게 반응하는지 관찰하는 실험 코드입니다."""\n'
    },
    "incremental_stress_test.py": {
        "folder": "04_병렬접속_WAF_한계테스트",
        "doc": '"""Semaphore의 수를 2개부터 순차적으로 증가시키며 네이버 WAF(방화벽)가 차단을 시작하는 한계점(Golden Ratio)을 자동으로 찾는 로직입니다."""\n'
    },
    "mac_16gb_stress_tester.py": {
        "folder": "04_병렬접속_WAF_한계테스트",
        "doc": '"""16GB 메모리 환경의 노트북에서 브라우저 동시 띄우기 메모리 폭발 한계를 벤치마킹하는 스크립트입니다."""\n',
        "excels": {"mac_16gb_stress_test_result.xlsx": "맥16GB_동시접속_부하테스트_결과.xlsx"}
    },

    # 05. 실전 1만개 대용량 IP 세탁 테스트
    "mobile_1000_volume_test.py": {
        "folder": "05_모바일데이터_대용량_IP세탁",
        "doc": '"""핸드폰 테더링(LTE/5G) 환경에서 1,000건의 대규모 키워드를 연속으로 찔러 IP 차단 빈도를 측정하는 스크립트입니다."""\n'
    },
    "lte_10000_volume_test.py": {
        "folder": "05_모바일데이터_대용량_IP세탁",
        "doc": '"""10,000건의 초대형 키워드를 추출하며, IP 차단 시 비행기모드로 갱신할 때까지 스크립트를 일시정지하는 극한의 생존 테스트 코드입니다."""\n'
    },
    "real_volume_excel_test.py": {
        "folder": "05_모바일데이터_대용량_IP세탁",
        "doc": '"""대용량 추출 과정에서 프로세스 강제 종료 시 데이터가 날아가는 것을 방지하기 위해 엑셀에 실시간 누적 저장(Flush)을 수행하는 코드입니다."""\n',
        "excels": {"real_volume_test_result.xlsx": "실시간저장_대용량테스트_결과.xlsx"}
    },

    # 06. 최종 완성형 (상점 목록 싹쓸이 프로덕션)
    "full_list_extractor_8_threads.py": {
        "folder": "06_최종_전체상점_병렬추출기",
        "doc": '"""[최종버전-안정성] 검색된 네이버 지도를 끝까지 스크롤하여 (이름, 카테고리, 주소, 이미지, 플레이스URL) 5가지 속성을 완벽히 쓸어담는 8스레드 병렬 코드입니다."""\n'
    },
    "full_list_extractor_10_threads.py": {
        "folder": "06_최종_전체상점_병렬추출기",
        "doc": '"""[최종버전-가속형] 8스레드 추출기와 동일하나 동시 접속을 10개로 올려 추출 속도를 올린 버전입니다. IP 차단이 잦을 수 있습니다."""\n'
    },
    "full_list_extractor_12_threads.py": {
        "folder": "06_최종_전체상점_병렬추출기",
        "doc": '"""[최종버전-초가속형] 12개의 스레드로 무자비하게 추출을 감행하는 극한 속도 버전입니다. 모바일 IP 변경이 매우 빈번히 요구됩니다."""\n'
    }
}

# ==========================================
# 2. 날짜 폴더에서 상위(scripts)로 파일 롤백하기
# ==========================================
date_dirs = ["2026-03-25", "2026-03-26"]
for dd in date_dirs:
    dp = os.path.join(scripts_dir, dd)
    if os.path.exists(dp):
        for item in os.listdir(dp):
            src = os.path.join(dp, item)
            dst = os.path.join(scripts_dir, item)
            # 중복 발생 시 덮어쓰기 (기존 것 우선)
            if os.path.isfile(src):
                shutil.move(src, dst)
        shutil.rmtree(dp)

# ==========================================
# 3. 한글 폴더 생성 및 파일 이동, 주석 추가
# ==========================================
# 한글 폴더들 미리 만들어두기
for info in MAPPING.values():
    os.makedirs(os.path.join(scripts_dir, info['folder']), exist_ok=True)
os.makedirs(os.path.join(scripts_dir, "00_기타_잔여물"), exist_ok=True)

# 루트에 있는 엑셀들을 스크립트 폴더로 옮기기 위해 검색
all_files_in_scripts = os.listdir(scripts_dir)
all_files_in_root = os.listdir(base_dir)

for py_file in glob.glob(os.path.join(scripts_dir, "*.py")):
    basename = os.path.basename(py_file)
    if basename == "organizer.py" or "korean" in basename or basename == "patch.py":
        # 이건 작업용 툴이니 00 폴더나 삭제 처리 (여기선 00번으로)
        shutil.move(py_file, os.path.join(scripts_dir, "00_기타_잔여물", basename))
        continue

    target_info = MAPPING.get(basename, None)
    
    if target_info:
        folder_path = os.path.join(scripts_dir, target_info['folder'])
        
        # 주석 주입 (첫 줄이 # 이거나 import 면 그 위에 주석을 박음)
        with open(py_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        # 이미 한글 주석이 박혀 있는지 판별
        has_doc = False
        for i in range(min(3, len(lines))):
            if "\"\"\"[" in lines[i] or "\"\"\"네이버" in lines[i] or "스크립트" in lines[i]:
                has_doc = True
                break
                
        if not has_doc:
            lines.insert(0, target_info['doc'] + "\n")
            with open(py_file, 'w', encoding='utf-8') as f:
                f.writelines(lines)
                
        # 스크립트 파일 이동
        shutil.move(py_file, os.path.join(folder_path, basename))
        
        # 고정된 영어 엑셀 이름이 있다면 한글명으로 바꿔서 폴더로 이동
        if "excels" in target_info:
            for eng_excel, kr_excel in target_info["excels"].items():
                eng_path_root = os.path.join(base_dir, eng_excel)
                eng_path_scripts = os.path.join(scripts_dir, eng_excel)
                if os.path.exists(eng_path_scripts):
                    shutil.move(eng_path_scripts, os.path.join(folder_path, kr_excel))
                elif os.path.exists(eng_path_root):
                    shutil.move(eng_path_root, os.path.join(folder_path, kr_excel))
                    
    else:
        # 매핑되지 않은 잔여 파이썬 파일
        shutil.move(py_file, os.path.join(scripts_dir, "00_기타_잔여물", basename))

# ==========================================
# 4. [특수규칙] 검색결과_*_스레드.xlsx 일괄 변환
# ==========================================
# 06번 폴더에 넣기 위해 scripts 루트에 있는 엑셀들을 스캔
target_folder = os.path.join(scripts_dir, "06_최종_전체상점_병렬추출기")
os.makedirs(target_folder, exist_ok=True)

for item in os.listdir(scripts_dir):
    if item.endswith(".xlsx") and "검색결과" in item:
        # 파일명을 조금 더 예쁘게
        # 검색결과_강남역맛집_8스레드.xlsx -> [강남역맛집]_8스레드_전체수집.xlsx
        m = re.match(r"검색결과_(.*)_(\d+스레드)\.xlsx", item)
        if m:
            kw = m.group(1)
            tr = m.group(2)
            new_name = f"[{kw}]_{tr}_전체상점수집_완료.xlsx"
            shutil.move(os.path.join(scripts_dir, item), os.path.join(target_folder, new_name))
        else:
            shutil.move(os.path.join(scripts_dir, item), os.path.join(target_folder, item))

# Probe 잔여물 등 HTML/JSON 한글 폴더로 이동
probe_files = {"probe_place_list.html": "실험용_모바일_DOM_추출본.html", "probe_apollo.json": "실험용_Apollo_추출본.json"}
probe_folder = os.path.join(scripts_dir, "01_초기_모바일DOM_탐색")
for org, kr in probe_files.items():
    src = os.path.join(scripts_dir, org)
    if os.path.exists(src):
        shutil.move(src, os.path.join(probe_folder, kr))

print("✅ 성공: 모든 영어 산출물 및 스크립트가 한글 폴더/파일명으로 깔끔하게 재분류 및 주석 처리되었습니다!")
