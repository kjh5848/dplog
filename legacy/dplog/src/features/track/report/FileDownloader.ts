/**
 * [역할]   캔버스를 이미지 파일로 다운로드
 * [입력]   HTMLCanvasElement, fileName
 * [출력]   Promise<void>
 * [NOTE]   브라우저 호환성 고려한 다운로드
 */

import toast from 'react-hot-toast';
import { IFileDownloader } from './interfaces/IFileDownloader';
import { logInfo, logError } from '@/src/utils/logger';

export class FileDownloader implements IFileDownloader {
  async download(canvas: HTMLCanvasElement, fileName: string): Promise<void> {
    try {
      const dataURL = this.convertCanvasToDataURL(canvas);
      logInfo("데이터 URL 생성 완료", { dataURLLength: dataURL.length });

      await this.downloadDataURL(dataURL, fileName);
      
      logInfo("이미지 다운로드 성공");
      this.showSuccessMessage();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('파일 다운로드 실패', errorObj, { fileName });
      throw new Error(`다운로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }

  private convertCanvasToDataURL(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL("image/png", 1.0);
  }

  private async downloadDataURL(dataURL: string, fileName: string): Promise<void> {
    const sanitizedFileName = this.sanitizeFileName(fileName);
    
    if (this.isModernBrowser()) {
      await this.downloadWithHtml5(dataURL, sanitizedFileName);
    } else {
      await this.downloadWithFallback(dataURL, sanitizedFileName);
    }
  }

  private async downloadWithHtml5(dataURL: string, fileName: string): Promise<void> {
    const link = document.createElement("a");
    link.download = `${fileName}.png`;
    link.href = dataURL;
    
    document.body.appendChild(link);
    
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    
    link.dispatchEvent(clickEvent);
    
    // 정리
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(dataURL);
    }, 100);
  }

  private async downloadWithFallback(dataURL: string, fileName: string): Promise<void> {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>이미지 다운로드</title></head>
          <body>
            <img src="${dataURL}" style="max-width: 100%; height: auto;" />
            <p>이미지를 우클릭하여 '다른 이름으로 저장'을 선택해주세요.</p>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  }

  private isModernBrowser(): boolean {
    const link = document.createElement("a");
    return typeof link.download !== "undefined";
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9가-힣\.\-_\s]/g, "")
      .replace(/\s+/g, "_")
      .trim();
  }

  private showSuccessMessage(): void {
    toast.success("리포트가 성공적으로 다운로드되었습니다!");
  }
} 