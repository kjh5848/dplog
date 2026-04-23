import re
with open("domains/scraping/full_list_extractor.py", "r", encoding="utf-8") as f:
    text = f.read()

target = "if not stores:"
replacement = "print(f'Stores count: {len(stores) if stores else 0}, page content length: {len(page_text)}')\n            if not stores:"
if replacement not in text:
    text = text.replace(target, replacement)
with open("domains/scraping/full_list_extractor.py", "w", encoding="utf-8") as f:
    f.write(text)
