import os
import glob
import PIL.Image
if not hasattr(PIL.Image, 'ANTIALIAS'):
    PIL.Image.ANTIALIAS = PIL.Image.LANCZOS
from moviepy.editor import VideoFileClip, concatenate_videoclips

def convert_to_gif(mp4_path, gif_path, fps=12, resize=0.5, speedx=1.2):
    """단일 MP4 영상을 블로그 최적화용 움짤(GIF)로 변환"""
    print(f"\n🔄 [단일 변환 시작] {os.path.basename(mp4_path)}")
    try:
        # 배속(1.2x)을 주어 블로그에서 더 역동적이고 맛있게 보이게 유도
        clip = VideoFileClip(mp4_path).speedx(speedx)
        if resize != 1.0:
            clip = clip.resize(resize)  # 용량 다이어트 (가로세로 50% 축소)
            
        clip.write_gif(gif_path, fps=fps)
        print("✅ [변환 완료] ->", os.path.basename(gif_path))
    except Exception as e:
        print(f"❌ 변환 실패: {e}")

def create_montage_gif(mp4_paths, gif_path, fps=10, resize=0.5, duration_per_clip=1.5):
    """여러 영상을 짜깁기하여 하나의 역동적인 하이라이트 GIF로 묶어줌"""
    print(f"\n🎬 [몽타주 생성] {len(mp4_paths)}개의 영상 합치기 시작...")
    clips = []
    
    try:
        for path in mp4_paths:
            clip = VideoFileClip(path)
            # 각 영상의 가장 핵심인 앞부분(설정 초 단위)만 추출해서 지루함 방지
            sub_duration = min(clip.duration, duration_per_clip)
            sub_clip = clip.subclip(0, sub_duration)
            clips.append(sub_clip)
            
        final_clip = concatenate_videoclips(clips, method="compose")
        if resize != 1.0:
            final_clip = final_clip.resize(resize)
            
        # 블로그 용량 제한(보통 10MB~20MB 이하 선호)을 감안해 적정 프레임으로 export
        final_clip.write_gif(gif_path, fps=fps)
        print("✅ [몽타주 생성 완료] ->", os.path.basename(gif_path))
    except Exception as e:
        print(f"❌ 몽타주 생성 실패: {e}")

if __name__ == "__main__":
    asset_dir = "asset/철이네"
    
    print("=" * 50)
    print("🚀 D-PLOG 미디어 GIF 변환 엔진 구동 준비")
    print("=" * 50)

    # 1. 본문 핵심용 단일 GIF 생성 (원고에 이미 들어간 오징어순대 젓가락 샷)
    target_mp4 = os.path.join(asset_dir, "KakaoTalk_Video_2026-04-14-16-32-07.mp4")
    target_gif = target_mp4.replace(".mp4", ".gif")
    
    if os.path.exists(target_mp4):
        convert_to_gif(target_mp4, target_gif, fps=12, resize=0.5, speedx=1.2)
    else:
        print("⚠️ 타겟 영상을 찾을 수 없습니다:", target_mp4)

    # 2. 현장 분위기 및 하이라이트 (몽타주 GIF 변환)
    # 여러 구도의 남은 영상들을 교차편집(짜깁기)해서 간판용/티저용으로 사용
    all_videos = sorted(glob.glob(os.path.join(asset_dir, "*.mp4")))
    montage_gif = os.path.join(asset_dir, "montage_highlight.gif")
    
    # 4개 정도 가장 역동적인 영상을 앞에서부터 선별하여 1.5초 단위로 이어붙임
    if len(all_videos) > 1:
        select_videos = [v for v in all_videos if v != target_mp4][:4]
        if select_videos:
            create_montage_gif(select_videos, montage_gif, fps=10, resize=0.5, duration_per_clip=1.5)
    
    print("\n🎉 모든 미디어 변환 프로세스가 종료되었습니다!")
