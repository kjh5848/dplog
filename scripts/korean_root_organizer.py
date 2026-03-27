import os
import shutil

base_dir = "/Users/nomadlab/Desktop/김주혁/workspace/eo-website/dplog"
scripts_dir = os.path.join(base_dir, "scripts")

# 대상 폴더 지정
data_folder = os.path.join(scripts_dir, "00_검색_데이터_세트")
dom_folder = os.path.join(scripts_dir, "01_초기_모바일DOM_탐색")

os.makedirs(data_folder, exist_ok=True)
os.makedirs(dom_folder, exist_ok=True)

# 루트 폴더에 방치된 데이터/산출물 매핑 (원문 파일명 -> (이동할 폴더, 한글 새 파일명))
ROOT_MAPPING = {
    # 1. 키워드 CSV 모음 (00_검색_데이터_세트)
    "busan_keywords.csv": (data_folder, "[키워드]_부산_기본.csv"),
    "busan_keywords_deep.csv": (data_folder, "[키워드]_부산_심층.csv"),
    "busan_keywords_ultimate.csv": (data_folder, "[키워드]_부산_궁극.csv"),
    "store_diagnosis_pujimhan.csv": (data_folder, "[키워드]_푸짐한뒷고기_진단용.csv"),
    "store_diagnosis_pujimhan_vertical.csv": (data_folder, "[키워드]_푸짐한뒷고기_진단용_세로포맷.csv"),
    
    # 2. 초기 실험용 더미 데이터들 (01_초기_모바일DOM_탐색)
    "naver_place_apollo.json": (dom_folder, "실험잔해_아폴로상태.json"),
    "naver_place_blocked.html": (dom_folder, "실험잔해_차단화면_덤프.html"),
    "naver_place_extracted.json": (dom_folder, "실험잔해_데이터추출_결과.json"),
    "naver_place_state.json": (dom_folder, "실험잔해_내부상태_덤프.json")
}

count = 0
for original_name, (target_dir, new_name) in ROOT_MAPPING.items():
    src_path = os.path.join(base_dir, original_name)
    
    if os.path.exists(src_path):
        dst_path = os.path.join(target_dir, new_name)
        shutil.move(src_path, dst_path)
        count += 1
        print(f"✅ 이동 완료: {original_name} -> {new_name} ({os.path.basename(target_dir)} 폴더)")

print(f"\n🎉 총 {count} 개의 잔여 데이터 파일이 한글명으로 깔끔하게 폴더링 되었습니다!")
print("📌 (참고) README.md 와 skills-lock.json 등은 프로젝트 필수 시스템 파일이므로 이동하지 않고 루트에 보존했습니다.")
