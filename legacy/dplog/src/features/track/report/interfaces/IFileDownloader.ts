/**
 * [역할]   캔버스를 이미지 파일로 다운로드하는 인터페이스
 * [입력]   HTMLCanvasElement, fileName
 * [출력]   Promise<void>
 */

export interface IFileDownloader {
  download(canvas: HTMLCanvasElement, fileName: string): Promise<void>;
} 