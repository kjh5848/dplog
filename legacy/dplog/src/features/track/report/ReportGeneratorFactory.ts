/**
 * [역할]   ReportGenerator 객체 생성을 위한 팩토리
 * [입력]   -
 * [출력]   ReportGenerator 인스턴스
 * [NOTE]   의존성 주입 관리
 */

import { ReportGenerator } from './ReportGenerator';
import { CanvasRenderer } from './CanvasRenderer';
import { StyleProcessor } from './StyleProcessor';
import { FileDownloader } from './FileDownloader';
import { FileNameGenerator } from './FileNameGenerator';

export class ReportGeneratorFactory {
  static create(): ReportGenerator {
    // 의존성 생성
    const styleProcessor = new StyleProcessor();
    const canvasRenderer = new CanvasRenderer(styleProcessor);
    const fileDownloader = new FileDownloader();
    const fileNameGenerator = new FileNameGenerator();
    
    // ReportGenerator 생성 및 의존성 주입
    return new ReportGenerator(
      canvasRenderer,
      fileDownloader,
      fileNameGenerator
    );
  }

  static createWithCustomDependencies(
    canvasRenderer: any,
    fileDownloader: any,
    fileNameGenerator: any
  ): ReportGenerator {
    // 테스트나 특별한 경우를 위한 커스텀 의존성 주입
    return new ReportGenerator(
      canvasRenderer,
      fileDownloader,
      fileNameGenerator
    );
  }
} 