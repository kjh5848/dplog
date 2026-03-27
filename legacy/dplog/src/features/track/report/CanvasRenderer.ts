/**
 * [역할]   HTML 요소를 캔버스로 렌더링
 * [입력]   HTMLElement, RenderOptions
 * [출력]   Promise<HTMLCanvasElement>
 * [NOTE]   html2canvas 라이브러리 사용
 */

import html2canvas from 'html2canvas';
import { ICanvasRenderer, RenderOptions } from './interfaces/ICanvasRenderer';
import { IStyleProcessor } from './interfaces/IStyleProcessor';
import { logInfo, logWarn } from '@/src/utils/logger';

export class CanvasRenderer implements ICanvasRenderer {
  constructor(private styleProcessor: IStyleProcessor) {}

  async render(element: HTMLElement, options: RenderOptions = {}): Promise<HTMLCanvasElement> {
    const {
      width = 1300,  // 1200에서 1300으로 증가하여 가로 여유 확보
      height = this.calculateOptimalHeight(element),
      scale = 2,
      backgroundColor = "#ffffff"
    } = options;

    // 차트 렌더링 완료 대기
    await this.waitForChartRendering();
    
    logInfo("캔버스 렌더링 시작");
    logInfo("캡처 영역 크기", {
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor,
      logging: false,
      width: 1300,  // 1200에서 1300으로 증가
      height,
      windowWidth: 1300,  // 윈도우 너비도 1300으로 증가
      windowHeight: height,
      ignoreElements: this.shouldIgnoreElement.bind(this),
      onclone: this.processClonedDocument.bind(this),
    });

    logInfo("캔버스 생성 완료", { width: canvas.width, height: canvas.height });

    this.validateCanvas(canvas);
    return canvas;
  }

  private async waitForChartRendering(): Promise<void> {
    // 차트가 완전히 로드될 때까지 더 긴 시간 대기
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Recharts 차트가 완전히 렌더링될 때까지 대기
    await this.waitForRechartsElements();
    
    // SVG 요소가 완전히 로드될 때까지 추가 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  private async waitForRechartsElements(): Promise<void> {
    return new Promise((resolve) => {
      let attempts = 0;
      const maxAttempts = 50; // 5초 최대 대기
      
      const checkCharts = () => {
        const svgElements = document.querySelectorAll('svg');
        const chartContainers = document.querySelectorAll('.recharts-wrapper');
        
        logInfo(`차트 로딩 체크 ${attempts + 1}/${maxAttempts}`, {
          svgCount: svgElements.length,
          chartContainers: chartContainers.length
        });
        
        // SVG 차트가 있고 내용이 있는지 확인
        let allChartsReady = true;
        svgElements.forEach((svg, index) => {
          const hasContent = svg.children.length > 0;
          const hasPath = svg.querySelector('path') !== null;
          const hasLine = svg.querySelector('line') !== null;
          
          if (!hasContent && !hasPath && !hasLine) {
            allChartsReady = false;
            logInfo(`차트 ${index + 1}이 아직 로딩 중`);
          }
        });
        
        if (allChartsReady && svgElements.length > 0) {
          logInfo('모든 차트 로딩 완료');
          resolve();
        } else if (attempts >= maxAttempts) {
          logWarn('차트 로딩 시간 초과, 강제 진행');
          resolve();
        } else {
          attempts++;
          setTimeout(checkCharts, 100);
        }
      };
      
      checkCharts();
    });
  }

  private shouldIgnoreElement(element: Element): boolean {
    return element.classList.contains('download-button') || 
           element.classList.contains('capture-exclude');
  }

  private processClonedDocument(clonedDoc: Document): HTMLElement {
    logInfo("DOM 복제 완료, 스타일 처리 시작");
    
    // 스타일 처리 위임
    this.styleProcessor.processStyles(clonedDoc);
    
    logInfo("스타일 처리 완료");
    return clonedDoc.documentElement;
  }

  private calculateOptimalHeight(element: HTMLElement): number {
    // 기본 높이는 요소의 현재 scrollHeight
    let calculatedHeight = element.scrollHeight;
    
    logInfo("기본 높이 계산", { height: calculatedHeight });
    
    // 차트 개수를 확인하여 추가 높이 계산
    const chartElements = element.querySelectorAll(
      '.rank-chart, .visitor-review-chart, .blog-review-chart, .save-count-chart, [class*="-chart"]'
    );
    const chartCount = chartElements.length;
    
    // 분석 섹션 높이 추가 계산
    const analysisSections = element.querySelectorAll('.analysis-section');
    let analysisSectionHeight = 0;
    analysisSections.forEach(section => {
      const sectionElement = section as HTMLElement;
      analysisSectionHeight += sectionElement.scrollHeight || 300; // 최소 300px
    });
    
    // 데이터 섹션 높이 추가 계산
    const dataSections = element.querySelectorAll('.data-section');
    let dataSectionHeight = 0;
    dataSections.forEach(section => {
      const sectionElement = section as HTMLElement;
      dataSectionHeight += sectionElement.scrollHeight || 200; // 최소 200px
    });
    
    // 차트당 최소 500px 보장 (제목 + 패딩 + 차트 영역)
    const minChartHeight = chartCount * 500;
    
    // 여유 공간 추가 (헤더, 푸터, 여백 등)
    const bufferHeight = 400;
    
    // 최종 높이 계산 (여러 계산값 중 최대값 사용)
    const heightOptions = [
      calculatedHeight,
      minChartHeight + analysisSectionHeight + dataSectionHeight + bufferHeight,
      2000 // 최소 보장 높이
    ];
    
    const finalHeight = Math.max(...heightOptions);
    
    logInfo('높이 계산 결과', {
      기본높이: calculatedHeight,
      차트개수: chartCount,
      최소차트높이: minChartHeight,
      분석섹션높이: analysisSectionHeight,
      데이터섹션높이: dataSectionHeight,
      버퍼높이: bufferHeight,
      최종높이: finalHeight
    });
    
    return finalHeight;
  }

  private validateCanvas(canvas: HTMLCanvasElement): void {
    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error("캔버스 크기가 0입니다. 요소가 올바르게 렌더링되지 않았습니다.");
    }
  }
} 