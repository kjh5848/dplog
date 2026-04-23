"""
Threads 자동 발행 스크립트 — 공식 API 기반
셀프 리플라이 체이닝으로 멀티 파트 스레드를 생성합니다.

사용법:
  python -m sns_publish.open_threads --store 철이네
"""

import os
import sys
import re
import json
import time
import argparse
import requests
from http.server import HTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from dotenv import load_dotenv

# ──────────────────────────────────────────────
# 환경 설정
# ──────────────────────────────────────────────
SNS_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(SNS_DIR)

# 기본 매장명 (CLI 인자로 오버라이드 가능)
DEFAULT_STORE = "철이네"

# Threads API 엔드포인트
THREADS_API_BASE = "https://graph.threads.net/v1.0"


def load_threads_env():
    """Threads API 환경 변수를 로드합니다."""
    env_file = os.path.join(BASE_DIR, ".env.threads")
    if not os.path.exists(env_file):
        print(f"❌ 환경 파일을 찾을 수 없습니다: {env_file}")
        print("📝 .env.threads 파일에 다음 항목을 설정하세요:")
        print("   THREADS_USER_ID=your_user_id")
        print("   THREADS_ACCESS_TOKEN=your_access_token")
        return None, None

    load_dotenv(env_file)
    user_id = os.getenv("THREADS_USER_ID")
    access_token = os.getenv("THREADS_ACCESS_TOKEN")

    if not user_id or not access_token:
        print("❌ THREADS_USER_ID 또는 THREADS_ACCESS_TOKEN이 .env.threads에 없습니다.")
        return None, None

    return user_id, access_token


# ──────────────────────────────────────────────
# 임시 이미지 호스팅 (로컬 → 공개 URL)
# ──────────────────────────────────────────────

def upload_image_to_imgbb(image_path: str, api_key: str) -> str | None:
    """이미지를 imgbb에 업로드하여 공개 URL을 반환합니다."""
    try:
        with open(image_path, "rb") as f:
            import base64
            image_data = base64.b64encode(f.read()).decode("utf-8")

        resp = requests.post(
            "https://api.imgbb.com/1/upload",
            data={"key": api_key, "image": image_data},
            timeout=30
        )
        if resp.status_code == 200:
            url = resp.json()["data"]["url"]
            print(f"   📤 이미지 업로드 완료: {os.path.basename(image_path)} → {url[:60]}...")
            return url
        else:
            print(f"   ⚠️ imgbb 업로드 실패 ({resp.status_code}): {os.path.basename(image_path)}")
            return None
    except Exception as e:
        print(f"   ⚠️ 이미지 업로드 에러: {e}")
        return None


def upload_image_to_0x0(image_path: str) -> str | None:
    """이미지를 0x0.st에 업로드하여 공개 URL을 반환합니다 (API 키 불필요)."""
    try:
        with open(image_path, "rb") as f:
            resp = requests.post(
                "https://0x0.st",
                files={"file": (os.path.basename(image_path), f)},
                timeout=30
            )
        if resp.status_code == 200:
            url = resp.text.strip()
            print(f"   📤 이미지 업로드 완료: {os.path.basename(image_path)} → {url[:60]}...")
            return url
        else:
            print(f"   ⚠️ 0x0.st 업로드 실패 ({resp.status_code})")
            return None
    except Exception as e:
        print(f"   ⚠️ 이미지 업로드 에러: {e}")
        return None


def upload_image(image_path: str) -> str | None:
    """이미지를 공개 URL로 업로드합니다. imgbb 키가 있으면 우선 사용, 없으면 0x0.st."""
    imgbb_key = os.getenv("IMGBB_API_KEY")
    if imgbb_key:
        return upload_image_to_imgbb(image_path, imgbb_key)
    return upload_image_to_0x0(image_path)


# ──────────────────────────────────────────────
# threads_draft.md 파서
# ──────────────────────────────────────────────

def parse_threads_draft(draft_file: str, asset_dir: str):
    """
    threads_draft.md를 파싱하여 PART별 리스트를 반환합니다.

    반환 형식:
    [
        {"title": "후킹", "text": "본문...", "images": ["/abs/path/1.jpeg", ...]},
        {"title": "메인", "text": "본문...", "images": []},
        ...
    ]
    """
    if not os.path.exists(draft_file):
        print(f"❌ 원고 파일을 찾을 수 없습니다: {draft_file}")
        return None

    with open(draft_file, "r", encoding="utf-8") as f:
        content = f.read()

    # PART 분리: ## [PART N — 제목] 또는 --- 로 구분
    # 먼저 ## [PART 헤더로 분리 시도
    part_pattern = r'##\s*\[PART\s+\d+[^]]*\].*?\n'
    headers = list(re.finditer(part_pattern, content, re.IGNORECASE))

    parts = []

    if headers:
        # ## [PART N — 제목] 기반 분리
        for i, header_match in enumerate(headers):
            start = header_match.end()
            end = headers[i + 1].start() if i + 1 < len(headers) else len(content)
            body = content[start:end].strip()

            # 제목 추출
            title_match = re.search(r'—\s*(.+?)\]', header_match.group())
            title = title_match.group(1).strip() if title_match else f"Part {i+1}"

            # 이미지 추출
            images = []
            for img_match in re.finditer(r'!\[.*?\]\(<?(.+?)>?\)', body):
                img_path = img_match.group(1).strip()
                full_path = os.path.join(asset_dir, img_path)
                if os.path.exists(full_path):
                    images.append(full_path)

            # 이미지 마크다운과 구분선 제거하여 순수 텍스트 추출
            text = re.sub(r'!\[.*?\]\(<?.*?>?\)\n?', '', body)
            text = re.sub(r'^---\s*$', '', text, flags=re.MULTILINE)
            text = text.strip()

            if text:  # 빈 파트는 건너뛰기
                parts.append({
                    "title": title,
                    "text": text,
                    "images": images
                })
    else:
        # --- 구분선 기반 분리 (폴백)
        sections = content.split("---")
        for i, section in enumerate(sections):
            section = section.strip()
            if not section:
                continue

            # 제목 행 제거 (# 으로 시작하는 줄)
            lines = section.split("\n")
            text_lines = []
            images = []

            for line in lines:
                img_match = re.match(r'!\[.*?\]\(<?(.+?)>?\)', line)
                if img_match:
                    img_path = img_match.group(1).strip()
                    full_path = os.path.join(asset_dir, img_path)
                    if os.path.exists(full_path):
                        images.append(full_path)
                elif line.startswith("# "):
                    continue  # 최상위 제목 스킵
                else:
                    text_lines.append(line)

            text = "\n".join(text_lines).strip()
            if text:
                parts.append({
                    "title": f"Part {i+1}",
                    "text": text,
                    "images": images
                })

    return parts


# ──────────────────────────────────────────────
# Threads API 호출
# ──────────────────────────────────────────────

def create_text_container(user_id: str, token: str, text: str, reply_to_id: str = None) -> str | None:
    """텍스트 전용 미디어 컨테이너를 생성합니다."""
    params = {
        "media_type": "TEXT",
        "text": text,
        "access_token": token,
    }
    if reply_to_id:
        params["reply_to_id"] = reply_to_id

    resp = requests.post(f"{THREADS_API_BASE}/{user_id}/threads", data=params, timeout=30)

    if resp.status_code == 200:
        return resp.json().get("id")
    else:
        print(f"   ❌ 컨테이너 생성 실패: {resp.status_code} — {resp.text}")
        return None


def create_image_container(user_id: str, token: str, image_url: str, text: str = None, reply_to_id: str = None) -> str | None:
    """이미지 미디어 컨테이너를 생성합니다."""
    params = {
        "media_type": "IMAGE",
        "image_url": image_url,
        "access_token": token,
    }
    if text:
        params["text"] = text
    if reply_to_id:
        params["reply_to_id"] = reply_to_id

    resp = requests.post(f"{THREADS_API_BASE}/{user_id}/threads", data=params, timeout=30)

    if resp.status_code == 200:
        return resp.json().get("id")
    else:
        print(f"   ❌ 이미지 컨테이너 생성 실패: {resp.status_code} — {resp.text}")
        return None


def create_carousel_item(user_id: str, token: str, image_url: str) -> str | None:
    """캐러셀 아이템 컨테이너를 생성합니다."""
    params = {
        "media_type": "IMAGE",
        "image_url": image_url,
        "is_carousel_item": "true",
        "access_token": token,
    }

    resp = requests.post(f"{THREADS_API_BASE}/{user_id}/threads", data=params, timeout=30)

    if resp.status_code == 200:
        return resp.json().get("id")
    else:
        print(f"   ❌ 캐러셀 아이템 생성 실패: {resp.status_code} — {resp.text}")
        return None


def create_carousel_container(user_id: str, token: str, children_ids: list, text: str = None, reply_to_id: str = None) -> str | None:
    """캐러셀 컨테이너를 생성합니다."""
    params = {
        "media_type": "CAROUSEL",
        "children": ",".join(children_ids),
        "access_token": token,
    }
    if text:
        params["text"] = text
    if reply_to_id:
        params["reply_to_id"] = reply_to_id

    resp = requests.post(f"{THREADS_API_BASE}/{user_id}/threads", data=params, timeout=30)

    if resp.status_code == 200:
        return resp.json().get("id")
    else:
        print(f"   ❌ 캐러셀 컨테이너 생성 실패: {resp.status_code} — {resp.text}")
        return None


def publish_container(user_id: str, token: str, creation_id: str) -> str | None:
    """미디어 컨테이너를 발행합니다."""
    params = {
        "creation_id": creation_id,
        "access_token": token,
    }

    resp = requests.post(f"{THREADS_API_BASE}/{user_id}/threads_publish", data=params, timeout=60)

    if resp.status_code == 200:
        return resp.json().get("id")
    else:
        print(f"   ❌ 발행 실패: {resp.status_code} — {resp.text}")
        return None


def check_container_status(user_id: str, token: str, container_id: str) -> str:
    """미디어 컨테이너의 처리 상태를 확인합니다."""
    params = {
        "fields": "status",
        "access_token": token,
    }
    resp = requests.get(f"{THREADS_API_BASE}/{container_id}", params=params, timeout=15)
    if resp.status_code == 200:
        return resp.json().get("status", "UNKNOWN")
    return "ERROR"


# ──────────────────────────────────────────────
# 메인 발행 로직
# ──────────────────────────────────────────────

def publish_part(user_id: str, token: str, part: dict, reply_to_id: str = None) -> str | None:
    """
    단일 PART를 발행합니다.

    이미지가 없으면 텍스트 포스트,
    이미지가 1장이면 단일 이미지 포스트,
    이미지가 2장 이상이면 캐러셀 포스트.
    """
    text = part["text"]
    images = part["images"]

    # 글자 수 검증 (500자 제한)
    if len(text) > 500:
        print(f"   ⚠️ 텍스트가 {len(text)}자입니다 (제한 500자). 잘라서 발행합니다.")
        text = text[:497] + "..."

    container_id = None

    if not images:
        # 텍스트만
        print(f"   📝 텍스트 포스트 생성 중... ({len(text)}자)")
        container_id = create_text_container(user_id, token, text, reply_to_id)

    elif len(images) == 1:
        # 단일 이미지 + 텍스트
        print(f"   🖼️ 이미지 업로드 중... ({os.path.basename(images[0])})")
        image_url = upload_image(images[0])
        if image_url:
            container_id = create_image_container(user_id, token, image_url, text, reply_to_id)
        else:
            print("   ⚠️ 이미지 업로드 실패. 텍스트만 발행합니다.")
            container_id = create_text_container(user_id, token, text, reply_to_id)

    else:
        # 캐러셀 (2장 이상)
        print(f"   🎠 캐러셀 생성 중... ({len(images)}장)")
        children_ids = []
        for img_path in images[:20]:  # 최대 20장
            image_url = upload_image(img_path)
            if image_url:
                # 캐러셀 아이템은 서버 처리 시간 필요
                time.sleep(2)
                item_id = create_carousel_item(user_id, token, image_url)
                if item_id:
                    children_ids.append(item_id)

        if len(children_ids) >= 2:
            # 아이템 처리 대기
            time.sleep(10)
            container_id = create_carousel_container(user_id, token, children_ids, text, reply_to_id)
        elif len(children_ids) == 1:
            print("   ⚠️ 캐러셀은 최소 2장 필요. 단일 이미지로 전환합니다.")
            # 단일 이미지로 다시 생성
            image_url = upload_image(images[0])
            if image_url:
                container_id = create_image_container(user_id, token, image_url, text, reply_to_id)
        else:
            print("   ⚠️ 이미지 업로드 모두 실패. 텍스트만 발행합니다.")
            container_id = create_text_container(user_id, token, text, reply_to_id)

    if not container_id:
        return None

    # 서버 처리 대기 (권장 30초)
    print("   ⏳ 서버 처리 대기 (30초)...")
    time.sleep(30)

    # 상태 확인
    status = check_container_status(user_id, token, container_id)
    if status == "ERROR":
        print(f"   ❌ 컨테이너 처리 실패 (status={status})")
        return None
    elif status != "FINISHED":
        print(f"   ⏳ 아직 처리 중 (status={status}). 추가 20초 대기...")
        time.sleep(20)

    # 발행
    media_id = publish_container(user_id, token, container_id)
    return media_id


def publish_to_threads(store_name: str = "철이네") -> int:
    """Threads에 멀티 파트 스레드를 발행합니다."""
    # 환경 로드
    user_id, access_token = load_threads_env()
    if not user_id:
        return 1

    # 동적 경로 설정
    asset_dir = os.path.join(BASE_DIR, "asset", store_name)
    draft_file = os.path.join(asset_dir, "threads_draft.md")

    if not os.path.isdir(asset_dir):
        print(f"❌ 매장 폴더가 존재하지 않습니다: {asset_dir}")
        return 1

    print(f"🏪 대상 매장: {store_name}")
    print(f"📄 원고 파일: {draft_file}")

    # 1. 원고 파싱
    parts = parse_threads_draft(draft_file, asset_dir)
    if not parts:
        print("❌ 파싱된 파트가 없습니다.")
        return 1

    print(f"\n📊 파싱 결과:")
    for i, part in enumerate(parts):
        img_count = len(part["images"])
        char_count = len(part["text"])
        img_info = f" + 이미지 {img_count}장" if img_count else ""
        print(f"   Part {i+1} [{part['title']}] — {char_count}자{img_info}")

    print(f"\n🚀 총 {len(parts)}개 파트를 체이닝 발행합니다.\n")

    # 2. 순차 발행 (셀프 리플라이 체이닝)
    previous_media_id = None
    published_ids = []

    for i, part in enumerate(parts):
        part_num = i + 1
        print(f"━━━ PART {part_num}/{len(parts)}: [{part['title']}] ━━━")

        media_id = publish_part(
            user_id,
            access_token,
            part,
            reply_to_id=previous_media_id
        )

        if media_id:
            print(f"   ✅ 발행 완료! (media_id: {media_id})")
            published_ids.append(media_id)
            previous_media_id = media_id
        else:
            print(f"   ❌ PART {part_num} 발행 실패. 체이닝을 중단합니다.")
            break

        # 파트 간 간격 (API 레이트 리밋 방지)
        if i < len(parts) - 1:
            print(f"   💤 다음 파트까지 5초 대기...\n")
            time.sleep(5)

    # 3. 결과 요약
    print(f"\n{'='*50}")
    if len(published_ids) == len(parts):
        print(f"🎉 Threads 스레드 발행 완료! ({len(published_ids)}개 파트)")
        print(f"   🔗 첫 번째 포스트: https://www.threads.net/post/{published_ids[0]}")
        return 0
    elif published_ids:
        print(f"⚠️ 부분 발행 완료 ({len(published_ids)}/{len(parts)}개 파트)")
        return 1
    else:
        print("❌ 발행 실패. 환경 설정과 토큰을 확인하세요.")
        return 1


# ──────────────────────────────────────────────
# CLI 진입점
# ──────────────────────────────────────────────

def main():
    """CLI 진입점: --store 인자로 매장명을 지정할 수 있습니다."""
    parser = argparse.ArgumentParser(description="Threads 스레드 자동 발행 (공식 API)")
    parser.add_argument(
        "--store", "-s",
        default=DEFAULT_STORE,
        help=f"발행할 매장명 (scripts/asset/ 하위 폴더명, 기본값: {DEFAULT_STORE})"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="실제 발행 없이 원고 파싱만 테스트합니다"
    )
    args = parser.parse_args()

    if args.dry_run:
        # 드라이런: 파싱만 테스트
        asset_dir = os.path.join(BASE_DIR, "asset", args.store)
        draft_file = os.path.join(asset_dir, "threads_draft.md")
        print(f"🧪 드라이런 모드 — 파싱만 테스트합니다.\n")
        parts = parse_threads_draft(draft_file, asset_dir)
        if parts:
            for i, part in enumerate(parts):
                print(f"━━━ PART {i+1}: [{part['title']}] ━━━")
                print(f"   텍스트 ({len(part['text'])}자): {part['text'][:100]}...")
                print(f"   이미지: {len(part['images'])}장")
                for img in part['images']:
                    print(f"     - {os.path.basename(img)}")
                print()
            print(f"✅ 총 {len(parts)}개 파트 파싱 완료.")
        else:
            print("❌ 파싱 실패.")
        sys.exit(0)

    exit_code = publish_to_threads(store_name=args.store)
    sys.exit(exit_code)


if __name__ == "__main__":
    main()
