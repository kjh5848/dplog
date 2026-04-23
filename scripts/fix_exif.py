import os
import glob
from PIL import Image, ImageOps

def fix_exif_rotation(folder_path):
    files = glob.glob(os.path.join(folder_path, '*.jpeg')) + glob.glob(os.path.join(folder_path, '*.jpg'))
    count = 0
    
    print(f"📸 이미지 가로세로(EXIF) 회전 교정 시작: 총 {len(files)}개 이미지 스캔 중...")
    for filepath in files:
        try:
            img = Image.open(filepath)
            
            # EXIF 메타데이터를 읽어서 실제로 이미지를 회전(Transposing) 시킴
            img_fixed = ImageOps.exif_transpose(img)
            
            # 원본과 회전본의 픽셀 방향이 다르거나 메타데이터가 적용되었다면
            if img != img_fixed:
                img_fixed.save(filepath, quality=95)
                count += 1
                print(f"🔄 회전 교정됨: {os.path.basename(filepath)}")
        except Exception as e:
            pass
            
    print(f"\n✅ 완료! 총 {count}개의 이미지가 올바른 방향으로 회전/저장되었습니다.")

if __name__ == "__main__":
    fix_exif_rotation("asset/철이네")
