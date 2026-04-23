import sys
import os
import subprocess
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QTextEdit, QPushButton, QMessageBox, QFrame, QSplitter,
    QListWidget, QListWidgetItem, QListView, QSizePolicy
)
from PyQt6.QtCore import Qt, QTimer, QSize
from PyQt6.QtGui import QPixmap, QFont, QIcon
from PyQt6.QtWebEngineWidgets import QWebEngineView

class ImageDropList(QListWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setAcceptDrops(True)
        self.setViewMode(QListView.ViewMode.IconMode)
        self.setIconSize(QSize(150, 150)) # 썸네일 크기
        self.setResizeMode(QListView.ResizeMode.Adjust) # 가로 너비에 맞춰 자동 줄바꿈
        self.setSpacing(10)
        self.setDragDropMode(QListView.DragDropMode.DropOnly)
        self.setStyleSheet("""
            QListWidget {
                border: 2px dashed #666;
                border-radius: 10px;
                background-color: #2b2b2b;
                padding: 10px;
                color: #aaaaaa;
                font-size: 14px;
            }
            QListWidget:hover {
                border: 2px dashed #007aff;
                background-color: #333333;
            }
            QListWidget::item {
                background-color: #1e1e1e;
                border: 1px solid #444;
                border-radius: 8px;
                padding: 5px;
            }
            QListWidget::item:selected {
                border: 2px solid #007aff;
            }
        """)

        # 초기 안내 문구를 위한 더미 아이템
        self.placeholder_text = "📸 여기에 여러 이미지를\n드래그 앤 드롭 하세요\n\n(여러 개의 이미지를\n순서대로 담을 수 있습니다)"
        self.addItem(self.placeholder_text)

    def dragEnterEvent(self, event):
        if event.mimeData().hasUrls():
            event.accept()
        else:
            event.ignore()

    def dragMoveEvent(self, event):
        if event.mimeData().hasUrls():
            event.accept()
        else:
            event.ignore()

    def dropEvent(self, event):
        urls = event.mimeData().urls()
        if urls:
            # 플레이스홀더 텍스트가 있으면 삭제
            if self.count() == 1 and self.item(0).text() == self.placeholder_text:
                self.takeItem(0)

            for url in urls:
                if url.isLocalFile():
                    file_path = url.toLocalFile()
                    if file_path.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.gif')):
                        # QIcon으로 썸네일 생성
                        icon = QIcon(file_path)
                        # 파일명을 텍스트로 가지는 아이템 추가
                        item = QListWidgetItem(icon, os.path.basename(file_path))
                        # 텍스트가 아이콘 아래에 중앙 정렬되도록 타겟팅
                        item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
                        self.addItem(item)
                        
            # 테두리 디자인 원상태 복구용
            self.setStyleSheet("""
                QListWidget {
                    border: 2px solid #007aff;
                    border-radius: 10px;
                    background-color: #1e1e1e;
                    padding: 10px;
                    color: white;
                }
            """)

class DplogMainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("D-PLOG Naver Publisher 🚀")
        self.setGeometry(100, 100, 1500, 850) # 화면 크기 시원하게 대폭 확대!
        
        # 시스템 기본 다크모드 무드를 위한 스타일시트
        self.setStyleSheet("""
            QMainWindow, QWidget {
                background-color: #1e1e1e;
                color: #e0e0e0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            QTextEdit {
                background-color: #2b2b2b;
                border: 1px solid #444;
                border-radius: 8px;
                padding: 10px;
                color: #ffffff;
                font-size: 14px;
                line-height: 1.6;
            }
            QPushButton {
                background-color: #007aff;
                color: white;
                border-radius: 8px;
                padding: 12px 20px;
                font-size: 14px;
                font-weight: bold;
                border: none;
            }
            QPushButton:hover {
                background-color: #006ae6;
            }
            QPushButton#saveBtn {
                background-color: #333333;
                border: 1px solid #555;
            }
            QPushButton#saveBtn:hover {
                background-color: #444444;
            }
            QPushButton#btnClear {
                background-color: #e54d4d;
                padding: 8px;
            }
            QPushButton#btnClear:hover {
                background-color: #cc4444;
            }
        """)
        
        self.manuscript_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "manuscript.md")
        self.init_ui()
        self.load_manuscript()

    def init_ui(self):
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        main_layout = QHBoxLayout(central_widget)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(20)

        # QSplitter로 화면을 동적으로 분할 (Mac 네이티브 느낌)
        splitter = QSplitter(Qt.Orientation.Horizontal)
        
        # 1. 좌측 프레임: 갤러리 뷰 (여러 이미지 지원)
        left_widget = QWidget()
        left_layout = QVBoxLayout(left_widget)
        left_layout.setContentsMargins(0, 0, 0, 0)
        
        # 좌측 상단 헤더 컨테이너
        left_header_layout = QHBoxLayout()
        lbl_img_title = QLabel("📸 업로드 이미지 (복수 선택)")
        lbl_img_title.setFont(QFont("Arial", 16, QFont.Weight.Bold))
        left_header_layout.addWidget(lbl_img_title)
        
        self.btn_clear_imgs = QPushButton("지우기")
        self.btn_clear_imgs.setObjectName("btnClear")
        self.btn_clear_imgs.setMaximumWidth(80)
        self.btn_clear_imgs.clicked.connect(self.clear_images)
        left_header_layout.addWidget(self.btn_clear_imgs)
        
        left_layout.addLayout(left_header_layout)

        # 다중 이미지가 들어가는 QListWidget
        self.img_drop_zone = ImageDropList()
        left_layout.addWidget(self.img_drop_zone)
        
        splitter.addWidget(left_widget)

        # 2. 우측 프레임: 원고 최종 렌더링 미리보기
        right_widget = QWidget()
        right_layout = QVBoxLayout(right_widget)
        right_layout.setContentsMargins(10, 0, 10, 0)
        right_layout.setSpacing(10)
        
        lbl_txt_title = QLabel("✨ 네이버 블로그 최종 포스팅 미리보기")
        lbl_txt_title.setFont(QFont("Arial", 18, QFont.Weight.Bold))
        # 텍스트 라벨이 세로 공간을 과도하게 차지하지 않고 상단에 밀접하도록 정책 변경
        lbl_txt_title.setSizePolicy(QSizePolicy.Policy.Preferred, QSizePolicy.Policy.Maximum)
        right_layout.addWidget(lbl_txt_title)
        
        self.preview_browser = QWebEngineView()
        # 브라우저가 화면 전체를 시원하게 채우도록 SizePolicy Expanding 설정
        self.preview_browser.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Expanding)
        self.preview_browser.setStyleSheet("""
            QWebEngineView {
                border-radius: 12px;
                border: 1px solid #444;
            }
        """)
        
        right_layout.addWidget(self.preview_browser)
        
        # 버튼 영역
        btn_layout = QHBoxLayout()
        
        self.btn_reload = QPushButton("🔄 외부 원고(VSCode) 수동 새로고침")
        self.btn_reload.setObjectName("saveBtn")
        self.btn_reload.clicked.connect(self.load_manuscript)
        btn_layout.addWidget(self.btn_reload)
        
        self.btn_publish = QPushButton("🚀 네이버 블로그에 최종 발행하기")
        self.btn_publish.clicked.connect(self.run_publish_script)
        btn_layout.addWidget(self.btn_publish)
        
        right_layout.addLayout(btn_layout)
        
        splitter.addWidget(right_widget)
        
        # 스플리터 비율 설정: 좌측 갤러리 존을 줄이고 우측 미리보기 존 극대화
        splitter.setSizes([300, 1200])
        main_layout.addWidget(splitter)

    def clear_images(self):
        self.img_drop_zone.clear()
        self.img_drop_zone.addItem(self.img_drop_zone.placeholder_text)
        self.img_drop_zone.setStyleSheet("""
            QListWidget {
                border: 2px dashed #666;
                border-radius: 10px;
                background-color: #2b2b2b;
                padding: 10px;
                color: #aaaaaa;
                font-size: 14px;
            }
            QListWidget:hover {
                border: 2px dashed #007aff;
                background-color: #333333;
            }
        """)

    def load_manuscript(self):
        try:
            if os.path.exists(self.manuscript_path):
                with open(self.manuscript_path, "r", encoding="utf-8") as f:
                    self.manuscript_text = f.read()
            else:
                self.manuscript_text = "# [여기에 제목을 입력하세요]\n\n여기에 본문을 시작합니다."
            
            # 버튼 텍스트 깜빡임 시각 피드백 (수동 새로고침용)
            self.btn_reload.setText("✅ 원고 렌더링 동기화 완료!")
            QTimer.singleShot(1500, lambda: self.btn_reload.setText("🔄 외부 원고(VSCode) 수동 새로고침"))
            
            self.update_preview()
        except Exception as e:
            pass

    def update_preview(self):
        try:
            import markdown
            import os
            from PyQt6.QtCore import QUrl

            text = self.manuscript_text

            # QWebEngineView 로 마이그레이션 했으므로 파이썬으로 억지 계산할 필요 없이 모던 CSS로 화면의 95% 퀄리티업
            html = markdown.markdown(text, extensions=['tables', 'fenced_code'])
            
            styled_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{
                        font-family: 'Pretendard', 'Malgun Gothic', -apple-system, sans-serif;
                        line-height: 1.8;
                        color: #202124;
                        background-color: #fbfbfb;
                        padding: 40px 60px;
                        font-size: 16px;
                        margin: 0 auto;
                        max-width: 900px;
                    }}
                    h1 {{ color: #1a1a1a; font-size: 28px; font-weight: 800; border-bottom: 2px solid #eaeaea; padding-bottom: 15px; margin-top: 20px; margin-bottom: 25px; letter-spacing: -0.5px; }}
                    h2 {{ color: #007aff; font-size: 22px; font-weight: 700; margin-top: 50px; margin-bottom: 20px; }}
                    hr {{ border: 0; border-top: 1px solid #e0e0e0; margin: 40px 0; }}
                    p {{ margin-bottom: 20px; text-align: left; word-break: keep-all; letter-spacing: -0.4px; }}
                    
                    /* 최신 브라우저를 위한 완벽한 이미지 정렬 및 연속 배치 압축 CSS */
                    p img {{
                        display: block;
                        width: 600px;
                        height: auto;
                        margin: 4px auto; /* 중앙 정렬과 위아래 밀착 */
                        border-radius: 10px;
                        box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                        border: 1px solid #eee;
                    }}
                </style>
            </head>
            <body>
                {html}
            </body>
            </html>
            """
            
            # Base URL 을 스크립트 실행 경로로 지정하여 로컬 이미지 로딩 보장
            base_url = QUrl.fromLocalFile(os.path.abspath(os.path.dirname(__file__)) + "/")
            self.preview_browser.setHtml(styled_html, base_url)
        except Exception as e:
            self.preview_browser.setHtml(f"<p style='color:red;'>미리보기 로딩 오류: {e}</p>")

    def run_publish_script(self):
        reply = QMessageBox.question(
            self, "발행 확인",
            "주의: 자동으로 네이버 브라우저가 화면에 띄워지며 키보드/마우스가 동작합니다.\n안전을 위해 진행하는 동안 PC 클릭을 최소화해주세요.\n\n발행을 시작하시겠습니까?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            venv_python = os.path.join("..", "backend_python", "venv", "bin", "python")
            target_script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "open_naver.py")
            
            try:
                subprocess.Popen([venv_python, target_script])
                QMessageBox.information(self, "파이프라인 가동", "🚀 자동 블로그 발행 봇 가동 완료!\n블로그 브라우저 창이 곧 호출됩니다.")
            except Exception as e:
                QMessageBox.critical(self, "실행 오류", f"봇을 실행하는데 실패했습니다:\n{e}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = DplogMainWindow()
    window.show()
    sys.exit(app.exec())
