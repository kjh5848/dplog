import traceback
import sys
print(sys.executable)
try:
    from PyQt6.QtWebEngineWidgets import QWebEngineView
    print('SUCCESS')
except Exception as e:
    print('ERROR:', e)
    traceback.print_exc()
