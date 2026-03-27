/**
 * [역할]   리포트 생성의 전체 프로세스를 조율하는 Facade
 * [입력]   ReportOptions
 * [출력]   Promise<void>
 * [NOTE]   의존성 주입으로 각 단계 위임
 */

import { ICanvasRenderer, RenderOptions } from './interfaces/ICanvasRenderer';
import { IFileDownloader } from './interfaces/IFileDownloader';
import { IFileNameGenerator } from './interfaces/IFileNameGenerator';
import { logInfo, logError } from '@/src/utils/logger';

export interface ReportOptions {
  element: HTMLElement;
  baseName: string;
  startDate?: Date | null;
  endDate?: Date | null;
  renderOptions?: RenderOptions;
}

export class ReportGenerator {
  constructor(
    private canvasRenderer: ICanvasRenderer,
    private fileDownloader: IFileDownloader,
    private fileNameGenerator: IFileNameGenerator
  ) {}

  async generateReport(options: ReportOptions): Promise<void> {
    try {
      logInfo("리포트 생성 시작");
      
      const { element, baseName, startDate, endDate, renderOptions } = options;
      
      // 1. 파일명 생성
      const fileName = this.fileNameGenerator.generate(baseName, startDate, endDate);
      logInfo("생성된 파일명", { fileName });
      
      // 2. 캔버스 렌더링
      const canvas = await this.canvasRenderer.render(element, renderOptions);
      logInfo("캔버스 렌더링 완료");
      
      // 3. 파일 다운로드
      await this.fileDownloader.download(canvas, fileName);
      logInfo("리포트 생성 완료");
      
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('리포트 생성 실패', errorObj, { operation: 'generateReport' });
      throw new Error(`리포트 생성 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
  }
} 