/**
 * [역할]   기존 코드와의 호환성을 위한 래퍼 함수
 * [입력]   기존 형태의 옵션들
 * [출력]   Promise<void>
 * [NOTE]   Legacy API 지원
 */

import { ReportGeneratorFactory } from './ReportGeneratorFactory';
import { CanvasRenderer } from './CanvasRenderer';
import { StyleProcessor } from './StyleProcessor';
import { FileDownloader } from './FileDownloader';
import toast from 'react-hot-toast';

// 기존 commonCanvasHelper.ts 호환 인터페이스
interface CreateCanvasOptions {
  element: HTMLElement;
  fileName: string;
}

// 기존 reportDownloadHelper.ts 호환 인터페이스
interface DownloadReportOptions {
  containerSelector: string;
  fileName: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

/**
 * 기존 createUnifiedCanvas 함수 호환 래퍼
 */
export async function createUnifiedCanvas({ element, fileName }: CreateCanvasOptions): Promise<HTMLCanvasElement> {
  // 캔버스만 생성하고 반환 (다운로드하지 않음)
  const styleProcessor = new StyleProcessor();
  const canvasRenderer = new CanvasRenderer(styleProcessor);
  
  return canvasRenderer.render(element);
}

/**
 * 기존 downloadCanvasAsImage 함수 호환 래퍼
 */
export async function downloadCanvasAsImage(canvas: HTMLCanvasElement, fileName: string): Promise<void> {
  const fileDownloader = new FileDownloader();
  await fileDownloader.download(canvas, fileName);
}

/**
 * 기존 downloadReport 함수 호환 래퍼
 */
export async function downloadReport({
  containerSelector,
  fileName,
  startDate,
  endDate
}: DownloadReportOptions): Promise<void> {
  const reportContainer = document.querySelector(containerSelector);
  if (!reportContainer) {
    toast.error("다운로드할 콘텐츠를 찾을 수 없습니다.");
    return;
  }

  const generator = ReportGeneratorFactory.create();
  
  await generator.generateReport({
    element: reportContainer as HTMLElement,
    baseName: fileName,
    startDate,
    endDate
  });
}

/**
 * 새로운 간편한 API
 */
export async function generateReport(
  element: HTMLElement,
  baseName: string,
  startDate?: Date | null,
  endDate?: Date | null
): Promise<void> {
  const generator = ReportGeneratorFactory.create();
  
  await generator.generateReport({
    element,
    baseName,
    startDate,
    endDate
  });
} 