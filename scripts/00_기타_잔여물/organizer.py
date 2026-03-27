import os
import shutil

base_dir = "/Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog"
scripts_dir = os.path.join(base_dir, "scripts")

dir_25 = os.path.join(scripts_dir, "2026-03-25")
dir_26 = os.path.join(scripts_dir, "2026-03-26")

os.makedirs(dir_25, exist_ok=True)
os.makedirs(dir_26, exist_ok=True)

to_25 = [
    "naver_keyword_engine.py", "dplog_store_diagnostic.py", "naver_place_parallel_extractor.py",
    "naver_place_parallel_test.py", "naver_place_playwright.py", "naver_place_scraper.py",
    "capture_naver_captcha.py", "show_naver_captcha_live.py", "naver_map_rank_tracker.py",
    "naver_map_parallel_tracker.py", "mac_16gb_stress_tester.py", "incremental_stress_test.py",
    "test_map.py", "test_map_2.py"
]

for item in to_25:
    src = os.path.join(scripts_dir, item)
    if os.path.exists(src):
        shutil.move(src, os.path.join(dir_25, item))

to_26 = [
    "mobile_1000_volume_test.py", "lte_10000_volume_test.py", "real_volume_excel_test.py",
    "probe_list.py", "probe_place_list.html", "probe_apollo.json"
]

for item in to_26:
    src = os.path.join(scripts_dir, item)
    if os.path.exists(src):
        shutil.move(src, os.path.join(dir_26, item))

roots_25 = [
    "mac_16gb_stress_test_result.xlsx", "top3_ranking_pujimhan.xlsx", "naver_place_apollo.json",
    "naver_place_blocked.html", "naver_place_extracted.json", "naver_place_state.json"
]

for item in roots_25:
    src = os.path.join(base_dir, item)
    if os.path.exists(src):
        shutil.move(src, os.path.join(dir_25, item))

# Remove pycache
pycache = os.path.join(scripts_dir, "__pycache__")
if os.path.exists(pycache):
    shutil.rmtree(pycache)

print("Python Shutil Move Success!")
