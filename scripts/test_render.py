import markdown
import re

with open('manuscript.md', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(
    r'!\[([^\]]*)\]\(<([^>]+)>\)', 
    r'<p align="center" style="margin: 0; padding: 0;"><img src="\2" width="600"></p>', 
    text
)

html = markdown.markdown(text, extensions=['tables', 'fenced_code'])

with open('debug_output.html', 'w', encoding='utf-8') as f:
    f.write(html)
