import re, os
from PIL import Image

text = """
![가게 실내 포인트 1](<./asset/철이네/KakaoTalk_Photo_2026-04-14-16-33-08 019.jpeg>)
![가게 실내 포인트 2](<./asset/철이네/KakaoTalk_Photo_2026-04-14-16-33-08 020.jpeg>)
"""

def replace_img_with_exact_size(match):
    alt = match.group(1)
    src = match.group(2)
    try:
        path = src
        if path.startswith('./'):
            path = path[2:]
        abs_path = os.path.abspath(path)
        with Image.open(abs_path) as img:
            w, h = img.size
            return f"SUCCESS: {w} {h}"
    except Exception as e:
        return f"ERROR: {str(e)}"

print(re.sub(r'!\[([^\]]*)\]\(<([^>]+)>\)', replace_img_with_exact_size, text))
