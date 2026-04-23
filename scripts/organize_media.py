import os
import glob
from PIL import Image, ImageOps
from PIL.ExifTags import TAGS

def get_exif_datetime(filepath):
    try:
        img = Image.open(filepath)
        exif = img._getexif()
        if exif:
            for tag, value in exif.items():
                decoded = TAGS.get(tag, tag)
                if decoded == "DateTimeOriginal":
                    return value
    except Exception:
        pass
    return None

def organize_media(folder_path):
    print(f"[{folder_path}] 미디어 정리 시작...")
    
    # 1. 이미지 처리
    images = glob.glob(os.path.join(folder_path, '*.jpeg')) + \
             glob.glob(os.path.join(folder_path, '*.jpg')) + \
             glob.glob(os.path.join(folder_path, '*.png'))
    
    img_data = []
    for filepath in images:
        # EXIF 회전 교정
        try:
            img = Image.open(filepath)
            img_fixed = ImageOps.exif_transpose(img)
            if img != img_fixed:
                img_fixed.save(filepath, quality=95)
                print(f"🔄 회전 교정됨: {os.path.basename(filepath)}")
        except Exception:
            pass
        
        # 날짜 추출
        dt = get_exif_datetime(filepath)
        mtime = os.path.getmtime(filepath)
        img_data.append({
            'path': filepath,
            'exif_dt': dt or "",
            'mtime': mtime
        })
        
    # EXIF 시간, 그 다음 수정 시간 기준으로 정렬
    img_data.sort(key=lambda x: (x['exif_dt'], x['mtime']))
    
    # 파일명 일괄 정리 전에 임시 이름으로 변경 (충돌 방지)
    for i, data in enumerate(img_data):
        ext = os.path.splitext(data['path'])[1].lower()
        if ext == '.jpg': ext = '.jpeg'
        temp_path = os.path.join(folder_path, f"temp_img_{i:03d}{ext}")
        os.rename(data['path'], temp_path)
        data['path'] = temp_path
        
    # 최종 이름으로 변경
    for i, data in enumerate(img_data):
        ext = os.path.splitext(data['path'])[1].lower()
        new_name = f"img_{i+1:03d}{ext}"
        new_path = os.path.join(folder_path, new_name)
        os.rename(data['path'], new_path)
        print(f"📸 {new_name} 정렬 완료")

    # 2. 동영상 처리
    videos = glob.glob(os.path.join(folder_path, '*.mp4')) + \
             glob.glob(os.path.join(folder_path, '*.mov'))
             
    # test_desktop.mp4 제외
    videos = [v for v in videos if "test_desktop" not in os.path.basename(v)]
             
    vid_data = []
    for filepath in videos:
        vid_data.append({
            'path': filepath,
            'mtime': os.path.getmtime(filepath)
        })
        
    vid_data.sort(key=lambda x: x['mtime'])
    
    for i, data in enumerate(vid_data):
        ext = os.path.splitext(data['path'])[1].lower()
        temp_path = os.path.join(folder_path, f"temp_vid_{i:03d}{ext}")
        os.rename(data['path'], temp_path)
        data['path'] = temp_path
        
    for i, data in enumerate(vid_data):
        ext = os.path.splitext(data['path'])[1].lower()
        new_name = f"vid_{i+1:03d}{ext}"
        new_path = os.path.join(folder_path, new_name)
        os.rename(data['path'], new_path)
        print(f"🎬 {new_name} 정렬 완료")

if __name__ == "__main__":
    organize_media("asset/이조갈비")
