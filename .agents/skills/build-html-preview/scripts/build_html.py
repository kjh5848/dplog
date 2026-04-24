import os
import sys
import argparse
import html
import re
from pathlib import Path

# 워크스페이스 루트 경로 계산
# 현재 파일: dplog/.agents/skills/build-html-preview/scripts/build_html.py
# 루트 경로: dplog/
SKILL_SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
WORKSPACE_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(SKILL_SCRIPTS_DIR))))

def parse_draft(draft_path: str):
    """마크다운 원고를 파싱하여 제목, 해시태그, 본문 세그먼트로 분리"""
    with open(draft_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    title = lines[0].strip().replace("# ", "").replace("#", "")

    hashtags = ""
    hashtag_pattern = re.compile(r'^#\S+(\s+#\S+)*\s*$')

    segments = []
    text_buffer = []

    def flush_text():
        nonlocal text_buffer
        joined = "\n".join(text_buffer).strip()
        if joined:
            segments.append({"type": "text", "content": joined})
        text_buffer = []

    for line in lines[1:]:
        stripped = line.strip()

        if not stripped:
            text_buffer.append("")
            continue

        if hashtag_pattern.match(stripped):
            hashtags = stripped
            continue

        if stripped == "---":
            flush_text()
            segments.append({"type": "hr"})
            continue

        heading_match = re.match(r'^(#{2,3})\s+(.+)$', stripped)
        if heading_match:
            flush_text()
            segments.append({
                "type": "heading",
                "level": len(heading_match.group(1)),
                "content": heading_match.group(2),
            })
            continue

        quote_match = re.match(r'^>\s?(.*)$', stripped)
        if quote_match:
            flush_text()
            segments.append({"type": "quote", "content": quote_match.group(1)})
            continue

        map_match = re.match(r'^!\[map\]\((.*?)\)$', stripped)
        if map_match:
            flush_text()
            segments.append({"type": "map", "name": map_match.group(1)})
            continue

        img_match = re.match(r'^!\[(.*?)\]\(<?(.*?)>?\)$', stripped)
        if img_match:
            flush_text()
            segments.append({"type": "image", "alt": img_match.group(1), "filename": img_match.group(2)})
            continue

        link_match = re.match(r'^\S*\s*\[(.*?)\]\((https?://\S+)\)\s*$', stripped)
        if link_match:
            flush_text()
            segments.append({"type": "url", "label": stripped, "url": link_match.group(2)})
            continue

        url_match = re.search(r'(https?://\S+)', stripped)
        if url_match:
            flush_text()
            segments.append({"type": "url", "label": stripped, "url": url_match.group(1)})
            continue

        text_buffer.append(line.rstrip())

    flush_text()
    return title, hashtags, segments

def to_html_media_src(filename: str, asset_dir: str, build_dir: str):
    if os.path.isabs(filename):
        try:
            common_path = os.path.commonpath([os.path.abspath(filename), os.path.abspath(asset_dir)])
            if common_path == os.path.abspath(asset_dir):
                return os.path.relpath(filename, build_dir)
        except ValueError:
            pass
        return Path(filename).as_uri()
    return f"../{filename}"

def is_video_file(filename: str):
    return filename.lower().endswith((".mp4", ".mov", ".avi", ".webm"))

def render_inline(text: str):
    rendered = html.escape(text)
    rendered = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', rendered)
    rendered = re.sub(r'__(.*?)__', r'<u>\1</u>', rendered)
    return rendered

def append_image_block(html_content, seg, asset_dir: str, build_dir: str):
    filename = seg["filename"]
    alt = seg["alt"]
    media_src = to_html_media_src(filename, asset_dir, build_dir)
    html_content.append("        <div class='content-block image-block'>")
    html_content.append(f"            <img src='{media_src}' alt='{alt}'>")
    html_content.append(f"            <div class='image-caption'>{alt}</div>")
    html_content.append("        </div>")

def append_video_block(html_content, seg, asset_dir: str, build_dir: str):
    filename = seg["filename"]
    alt = seg["alt"]
    media_src = to_html_media_src(filename, asset_dir, build_dir)
    html_content.append("        <div class='content-block video-block'>")
    html_content.append(f"            <video controls autoplay muted loop><source src='{media_src}' type='video/mp4'></video>")
    html_content.append(f"            <div class='image-caption'>{alt} (동영상)</div>")
    html_content.append("        </div>")

def append_gallery_block(html_content, image_segments, asset_dir: str, build_dir: str):
    if len(image_segments) >= 5:
        gallery_class = "gallery-strip"
    elif len(image_segments) == 3:
        gallery_class = "gallery-grid gallery-3col"
    else:
        gallery_class = "gallery-grid gallery-2col"
    html_content.append(f"        <div class='content-block {gallery_class}' aria-label='이미지 묶음 {len(image_segments)}장'>")
    for seg in image_segments:
        media_src = to_html_media_src(seg["filename"], asset_dir, build_dir)
        alt = seg["alt"]
        html_content.append("            <figure class='image-card'>")
        html_content.append(f"                <img src='{media_src}' alt='{alt}'>")
        html_content.append(f"                <figcaption>{alt}</figcaption>")
        html_content.append("            </figure>")
    html_content.append("        </div>")

def build_html(store_name: str):
    asset_dir = os.path.join(WORKSPACE_ROOT, "scripts", "asset", store_name)
    draft_path = os.path.join(asset_dir, "blog_draft.md")
    build_dir = os.path.join(asset_dir, "build")

    if not os.path.exists(draft_path):
        print(f"❌ 초안을 찾을 수 없습니다: {draft_path}")
        return 1

    os.makedirs(build_dir, exist_ok=True)

    title, hashtags, segments = parse_draft(draft_path)

    # HTML 템플릿 기본 골격
    html_content = [
        "<!DOCTYPE html>",
        "<html lang='ko'>",
        "<head>",
        "    <meta charset='UTF-8'>",
        "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>",
        f"    <title>{title}</title>",
        "    <style>",
        "        body { font-family: 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif; background-color: #f9f9f9; margin: 0; padding: 20px; color: #333; line-height: 1.8; }",
        "        .container { max-width: 800px; margin: 0 auto; background: #fff; padding: 40px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); }",
        "        h1 { font-size: 28px; border-bottom: 2px solid #03c75a; padding-bottom: 12px; margin-top: 0; color: #111; font-weight: 800; }",
        "        .hashtags { color: #03c75a; font-weight: bold; margin-bottom: 40px; font-size: 15px; }",
        "        .content-block { margin-bottom: 24px; }",
        "        .text-block { white-space: pre-wrap; font-size: 16px; color: #444; word-break: keep-all; }",
        "        .section-heading { margin: 54px 0 18px; padding: 0 0 10px; border-bottom: 2px solid #111; font-size: 24px; line-height: 1.35; color: #111; font-weight: 800; }",
        "        .section-subheading { margin: 38px 0 16px; padding-left: 12px; border-left: 4px solid #03c75a; font-size: 19px; line-height: 1.45; color: #222; font-weight: 800; }",
        "        .quote-block { margin: 30px 0; padding: 20px 22px; border-left: 4px solid #03c75a; background: #f6fff9; color: #2f4f3a; font-size: 16px; font-weight: 700; border-radius: 0 12px 12px 0; }",
        "        .image-block { text-align: center; margin: 40px 0; }",
        "        .image-block img { max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }",
        "        .image-caption { font-size: 13px; color: #888; margin-top: 10px; }",
        "        .gallery-grid { display: grid; gap: 14px; margin: 34px 0; }",
        "        .gallery-2col { grid-template-columns: repeat(2, minmax(0, 1fr)); }",
        "        .gallery-3col { grid-template-columns: repeat(3, minmax(0, 1fr)); }",
        "        .gallery-strip { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(220px, 42%); gap: 14px; margin: 34px 0; overflow-x: auto; padding-bottom: 12px; scroll-snap-type: x mandatory; }",
        "        .image-card { margin: 0; border: 1px solid #eee; border-radius: 12px; overflow: hidden; background: #fff; box-shadow: 0 4px 14px rgba(0,0,0,0.08); scroll-snap-align: start; }",
        "        .image-card img { display: block; width: 100%; height: 220px; object-fit: cover; }",
        "        .gallery-2col .image-card img { height: 280px; }",
        "        .gallery-3col .image-card img { height: 220px; }",
        "        .gallery-strip .image-card img { height: 260px; }",
        "        .image-card figcaption { padding: 9px 10px 11px; font-size: 12px; color: #777; line-height: 1.35; }",
        "        .video-block { text-align: center; margin: 40px 0; }",
        "        .video-block video { max-width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }",
        "        hr { border: 0; height: 1px; background: #e0e0e0; margin: 50px 0; }",
        "        .map-block { background: #f0fdf4; border: 2px dashed #03c75a; padding: 20px; border-radius: 8px; text-align: center; font-weight: bold; margin: 40px 0; color: #029443; }",
        "        a { color: #03c75a; text-decoration: none; }",
        "        a:hover { text-decoration: underline; }",
        "        strong { color: #000; background: rgba(3, 199, 90, 0.1); padding: 2px 4px; border-radius: 4px; }",
        "        u { text-decoration-color: #03c75a; text-decoration-thickness: 2px; text-underline-offset: 3px; }",
        "        @media (max-width: 680px) { body { padding: 10px; } .container { padding: 24px; } .gallery-2col, .gallery-3col { grid-template-columns: 1fr; } .gallery-strip { grid-auto-columns: 82%; } .image-card img, .gallery-strip .image-card img { height: 200px; } }",
        "    </style>",
        "</head>",
        "<body>",
        "    <div class='container'>",
        f"        <h1>{title}</h1>",
        f"        <div class='hashtags'>{hashtags}</div>"
    ]

    # 세그먼트 변환
    index = 0
    while index < len(segments):
        seg = segments[index]
        seg_type = seg["type"]
        if seg_type == "text":
            text = render_inline(seg["content"])
            html_content.append(f"        <div class='content-block text-block'>{text}</div>")

        elif seg_type == "heading":
            tag = "h2" if seg["level"] == 2 else "h3"
            css_class = "section-heading" if seg["level"] == 2 else "section-subheading"
            html_content.append(f"        <{tag} class='{css_class}'>{render_inline(seg['content'])}</{tag}>")

        elif seg_type == "quote":
            html_content.append(f"        <blockquote class='content-block quote-block'>{render_inline(seg['content'])}</blockquote>")

        elif seg_type == "image":
            if is_video_file(seg["filename"]):
                append_video_block(html_content, seg, asset_dir, build_dir)
            else:
                image_group = [seg]
                next_index = index + 1
                while (
                    next_index < len(segments)
                    and segments[next_index]["type"] == "image"
                    and not is_video_file(segments[next_index]["filename"])
                ):
                    image_group.append(segments[next_index])
                    next_index += 1
                if len(image_group) == 1:
                    append_image_block(html_content, seg, asset_dir, build_dir)
                else:
                    append_gallery_block(html_content, image_group, asset_dir, build_dir)
                index = next_index
                continue

        elif seg_type == "map":
            html_content.append(f"        <div class='content-block map-block'>📍 네이버 지도 자동 삽입 예정 위치: [{seg['name']}]</div>")

        elif seg_type == "url":
            url = seg["url"]
            label = seg["label"]
            html_content.append(f"        <div class='content-block'><a href='{url}' target='_blank'>🔗 {label}</a></div>")

        elif seg_type == "hr":
            html_content.append("        <hr>")

        index += 1

    html_content.extend([
        "    </div>",
        "</body>",
        "</html>"
    ])

    output_path = os.path.join(build_dir, "index.html")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(html_content))

    print(f"✅ HTML 빌드 완료!")
    abs_path = os.path.abspath(output_path)
    print(f"\n🌐 브라우저에서 열기 (아래 링크를 클릭하세요):")
    print(f"👉 file://{abs_path}\n")
    return 0

def main():
    parser = argparse.ArgumentParser(description="마크다운 초안 HTML 뷰어 빌더")
    parser.add_argument("--store", "-s", default="이조갈비", help="발행할 매장명 (기본값: 이조갈비)")
    args = parser.parse_args()

    sys.exit(build_html(args.store))

if __name__ == "__main__":
    main()
