/**
 * [역할]   DOM 스타일을 캔버스 렌더링에 맞게 처리
 * [입력]   Document
 * [출력]   void (Document 직접 수정)
 * [NOTE]   html2canvas 호환성을 위한 CSS 변환
 */

import { IStyleProcessor } from './interfaces/IStyleProcessor';
import { logError, logInfo, logWarn } from '@/src/utils/logger';

export class StyleProcessor implements IStyleProcessor {
  private readonly UNSUPPORTED_CSS_FUNCTIONS = [
    'oklch', 'oklab', 'lch', 'lab', 'color(', 'var(', 'env(',
    'calc(', 'min(', 'max(', 'clamp('
  ];

  private readonly COLOR_FALLBACKS: Record<string, string> = {
    'text-gray-900': '#111827',
    'text-gray-800': '#1f2937',
    'text-gray-700': '#374151',
    'text-gray-600': '#4b5563',
    'text-gray-500': '#6b7280',
    'bg-white': '#ffffff',
    'bg-gray-50': '#f9fafb',
    'bg-gray-100': '#f3f4f6',
    'bg-blue-600': '#2563eb',
    'border-gray-200': '#e5e7eb',
    'border-gray-300': '#d1d5db',
  };

  processStyles(document: Document): void {
    this.sanitizeDocumentStyles(document);
    this.applyReportSpecificStyles(document);
  }

  private sanitizeDocumentStyles(doc: Document): void {
    const allElements = doc.querySelectorAll('*');
    
    allElements.forEach(element => {
      if (element instanceof HTMLElement) {
        this.sanitizeElementStyles(element);
      }
    });

    // SVG 요소 특별 처리
    const svgElements = doc.querySelectorAll('svg *');
    svgElements.forEach(element => {
      if (element instanceof SVGElement) {
        ['fill', 'stroke'].forEach(attr => {
          const value = element.getAttribute(attr);
          if (value && this.isUnsupportedCSSValue(value)) {
            const safeValue = this.getSafeCSSValue(attr, value, element);
            element.setAttribute(attr, safeValue);
          }
        });
      }
    });
  }

  private sanitizeElementStyles(element: HTMLElement): void {
    const computedStyle = window.getComputedStyle(element);
    
    const cssProperties = [
      'color', 'background-color', 'border-color',
      'border-top-color', 'border-right-color', 
      'border-bottom-color', 'border-left-color',
      'outline-color', 'text-decoration-color', 'fill', 'stroke'
    ];

    cssProperties.forEach(property => {
      const value = computedStyle.getPropertyValue(property);
      if (this.isUnsupportedCSSValue(value)) {
        const safeValue = this.getSafeCSSValue(property, value, element);
        element.style.setProperty(property, safeValue, 'important');
      }
    });
  }

  private applyReportSpecificStyles(doc: Document): void {
    // 다운로드 버튼 제거
    const buttonsToHide = doc.querySelectorAll('.download-button, .capture-exclude');
    buttonsToHide.forEach((btn) => btn.remove());

    // 미리보기 요소 확인 로그
    const previewElements = doc.querySelectorAll('[data-preview-content]');
    const previewGridElements = doc.querySelectorAll('.preview-grid-4');
    const previewCardElements = doc.querySelectorAll('.preview-data-card');
    
    logInfo('미리보기 요소 현황', {
      previewContainers: previewElements.length,
      previewGrids: previewGridElements.length,
      previewCards: previewCardElements.length
    });

    // HTML과 Body 크기 강제 설정
    this.setDocumentSize(doc);
    
    // 미리보기 그리드 우선 처리
    this.processPreviewGrids(doc);
    
    // 미리보기 데이터 카드 스타일 강제 적용
    this.processPreviewCards(doc);
    
    // 미리보기 컨테이너 특별 처리
    this.processPreviewContainers(doc);
    
    // 분석 및 차트 섹션 처리
    this.processAnalysisAndChartSections(doc);
    
    // 반응형 클래스를 데스크톱 클래스로 변경
    this.convertResponsiveClasses(doc);
  }

  private setDocumentSize(doc: Document): void {
    const html = doc.documentElement;
    const body = doc.body;
    
    if (html) {
      html.style.width = '1300px';  // 1200에서 1300으로 증가
      html.style.minWidth = '1300px';
      html.style.maxWidth = '1300px';
      // 모바일 스타일 강제 제거
      html.style.removeProperty('font-size');
    }
    
    if (body) {
      body.style.width = '1300px';  // 1200에서 1300으로 증가
      body.style.minWidth = '1300px';
      body.style.maxWidth = '1300px';
      body.style.margin = '0';
      body.style.padding = '0';
      // 모바일 스타일 강제 제거
      body.style.removeProperty('font-size');
    }

    // 메인 컨테이너 크기 강제 설정
    const mainContainers = doc.querySelectorAll('[data-preview-content], .report-content-for-capture');
    mainContainers.forEach((container) => {
      const htmlElement = container as HTMLElement;
      htmlElement.style.width = '1300px';  // 1200에서 1300으로 증가
      htmlElement.style.minWidth = '1300px';
      htmlElement.style.maxWidth = '1300px';
      htmlElement.style.boxSizing = 'border-box';
      htmlElement.style.padding = '2rem';
      
      // 모바일 전용 스타일 강제 제거
      htmlElement.style.removeProperty('padding-left');
      htmlElement.style.removeProperty('padding-right');
    });
    
    // 모든 미디어 쿼리 스타일 무효화
    this.disableMobileStyles(doc);
  }

  private processPreviewGrids(doc: Document): void {
    const previewGrids = doc.querySelectorAll('.preview-grid-4');
    previewGrids.forEach((grid) => {
      try {
        const element = grid as HTMLElement;
        element.style.setProperty('display', 'grid', 'important');
        element.style.setProperty('grid-template-columns', 'repeat(4, 1fr)', 'important');
        element.style.setProperty('gap', '1rem', 'important');
        element.style.setProperty('width', '100%', 'important');
        element.style.setProperty('grid-auto-rows', 'auto', 'important');
        element.style.setProperty('min-width', '1200px', 'important');
        element.style.setProperty('box-sizing', 'border-box', 'important');
        
        // 모든 반응형 클래스 제거
        element.className = element.className.replace(/\bmd:grid-cols-\d+\b/g, '');
        element.className = element.className.replace(/\blg:grid-cols-\d+\b/g, '');
        element.className = element.className.replace(/\bsm:grid-cols-\d+\b/g, '');
        element.className = element.className.replace(/\bxl:grid-cols-\d+\b/g, '');
        element.className = element.className.replace(/\bgrid-cols-[1-3]\b/g, 'grid-cols-4');
        
        logInfo('미리보기 그리드 강제 적용', { className: element.className });
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError('미리보기 그리드 처리 중 오류', errorObj);
      }
    });
    
    // 모든 그리드 컨테이너를 4열로 강제 변경
    const allGrids = doc.querySelectorAll('[class*="grid-cols-"]');
    allGrids.forEach((grid) => {
      try {
        const element = grid as HTMLElement;
        if (element.closest('.data-section') || element.closest('[data-preview-content]')) {
          element.style.setProperty('display', 'grid', 'important');
          element.style.setProperty('grid-template-columns', 'repeat(4, 1fr)', 'important');
          element.style.setProperty('gap', '1rem', 'important');
          element.style.setProperty('width', '100%', 'important');
          
          logInfo('일반 그리드를 4열로 강제 변경', { className: element.className });
        }
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError('일반 그리드 처리 중 오류', errorObj);
      }
    });
  }

  private processPreviewCards(doc: Document): void {
    const previewCards = doc.querySelectorAll('.preview-data-card');
    logInfo('발견된 미리보기 카드 수', { count: previewCards.length });
    
    previewCards.forEach((card, index) => {
      try {
        const element = card as HTMLElement;
        element.style.setProperty('background-color', 'white', 'important');
        element.style.setProperty('border', '2px solid #d1d5db', 'important');
        element.style.setProperty('border-radius', '0.5rem', 'important');
        element.style.setProperty('padding', '1rem', 'important');
        element.style.setProperty('box-shadow', '0 1px 3px 0 rgba(0, 0, 0, 0.1)', 'important');
        element.style.setProperty('position', 'relative', 'important');
        element.style.setProperty('min-height', '150px', 'important');
        element.style.setProperty('display', 'block', 'important');
        
        logInfo(`카드 ${index + 1} 스타일 적용 완료`);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError('미리보기 카드 처리 중 오류', errorObj);
      }
    });
  }

  private processPreviewContainers(doc: Document): void {
    const previewContainers = doc.querySelectorAll('[data-preview-content]');
    previewContainers.forEach((container) => {
      try {
        const element = container as HTMLElement;
        element.style.setProperty('width', '100%', 'important');
        element.style.setProperty('max-width', 'none', 'important');
        
        // 데이터 섹션 특별 처리
        this.processDataSections(element);
        
        // 하위 섹션들 처리
        this.processSubSections(element);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError('미리보기 컨테이너 처리 중 오류', errorObj);
      }
    });
  }

  private processDataSections(element: HTMLElement): void {
    const dataSections = element.querySelectorAll('.data-section');
    dataSections.forEach(dataSection => {
      try {
        const sectionElement = dataSection as HTMLElement;
        sectionElement.style.setProperty('width', '100%', 'important');
        sectionElement.style.setProperty('max-width', 'none', 'important');
        sectionElement.style.setProperty('margin-bottom', '2rem', 'important');
        
        // 데이터 섹션 내의 미리보기 그리드 처리
        const dataGrids = sectionElement.querySelectorAll('.preview-grid-4');
        dataGrids.forEach(grid => {
          const gridElement = grid as HTMLElement;
          gridElement.style.setProperty('display', 'grid', 'important');
          gridElement.style.setProperty('grid-template-columns', 'repeat(4, 1fr)', 'important');
          gridElement.style.setProperty('gap', '1rem', 'important');
          gridElement.style.setProperty('width', '100%', 'important');
          gridElement.style.setProperty('margin', '0', 'important');
          gridElement.style.setProperty('padding', '0', 'important');
        });
        
        // 데이터 섹션 내의 카드들도 처리
        const dataCards = sectionElement.querySelectorAll('.preview-data-card');
        dataCards.forEach((card, index) => {
          const cardElement = card as HTMLElement;
          cardElement.style.setProperty('background-color', 'white', 'important');
          cardElement.style.setProperty('border', '2px solid #d1d5db', 'important');
          cardElement.style.setProperty('border-radius', '0.5rem', 'important');
          cardElement.style.setProperty('padding', '1rem', 'important');
          cardElement.style.setProperty('min-height', '150px', 'important');
          cardElement.style.setProperty('display', 'block', 'important');
          cardElement.style.setProperty('box-sizing', 'border-box', 'important');
        });
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError('데이터 섹션 처리 중 오류', errorObj);
      }
    });
  }

  private processSubSections(element: HTMLElement): void {
    const sections = ['summary-section', 'analysis-section', 'chart-section'];
    sections.forEach(sectionClass => {
      const sectionElements = element.querySelectorAll(`.${sectionClass}`);
      sectionElements.forEach(section => {
        try {
          const sectionElement = section as HTMLElement;
          sectionElement.style.setProperty('width', '100%', 'important');
          sectionElement.style.setProperty('max-width', 'none', 'important');
          
          if (sectionClass === 'summary-section') {
            sectionElement.style.setProperty('text-align', 'center', 'important');
            sectionElement.style.setProperty('margin-bottom', '2rem', 'important');
            sectionElement.style.setProperty('padding-bottom', '1.5rem', 'important');
            sectionElement.style.setProperty('border-bottom', '2px solid #e5e7eb', 'important');
          } else if (sectionClass === 'chart-section') {
            sectionElement.style.setProperty('margin-bottom', '0', 'important');
          } else {
            sectionElement.style.setProperty('margin-bottom', '2rem', 'important');
          }
        } catch (error) {
          const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
          logError(`${sectionClass} 처리 중 오류`, errorObj);
        }
      });
    });
  }

  private processAnalysisAndChartSections(doc: Document): void {
    // 분석 섹션 크기 강제 설정
    const analysisSections = doc.querySelectorAll('.analysis-section');
    analysisSections.forEach((section) => {
      const element = section as HTMLElement;
      element.style.width = '100%';
      element.style.maxWidth = 'none';
      element.style.minWidth = '1200px';
      
      // 분석 섹션 내의 그리드도 데스크톱 크기로 강제
      const analysisGrids = element.querySelectorAll('[class*="grid-cols"]');
      analysisGrids.forEach((grid) => {
        const gridElement = grid as HTMLElement;
        gridElement.style.setProperty('display', 'grid', 'important');
        gridElement.style.setProperty('grid-template-columns', 'repeat(4, 1fr)', 'important');
        gridElement.style.gap = '1rem';
        gridElement.style.width = '100%';
        gridElement.style.minWidth = '1180px';
      });
      
      // 분석 섹션 내의 모든 카드들도 데스크톱 크기로 강제
      const analysisCards = element.querySelectorAll('.bg-gray-50');
      analysisCards.forEach((card) => {
        const cardElement = card as HTMLElement;
        cardElement.style.width = '100%';
        cardElement.style.minWidth = '250px';
      });
    });

    // 차트 섹션 크기 강제 설정 및 가시성 보장
    const chartSections = doc.querySelectorAll('.chart-section');
    chartSections.forEach((section) => {
      const element = section as HTMLElement;
      element.style.width = '100%';
      element.style.maxWidth = 'none';
      element.style.minWidth = '1200px';
      element.style.setProperty('visibility', 'visible', 'important');
      element.style.setProperty('opacity', '1', 'important');
      element.style.setProperty('display', 'block', 'important');
    });

    // 개별 차트 컨테이너 크기 강제 설정
    const chartContainers = doc.querySelectorAll('[class*="-chart"]');
    chartContainers.forEach((chart) => {
      const element = chart as HTMLElement;
      element.style.width = '100%';
      element.style.minWidth = '1200px';
      element.style.maxWidth = 'none';
      element.style.setProperty('visibility', 'visible', 'important');
      element.style.setProperty('opacity', '1', 'important');
    });
    
    // 아이콘 크기 조정
    this.adjustIconSizes(doc);
    
    // SVG 차트 요소들 강제 가시성 설정
    this.ensureChartVisibility(doc);
  }

  private convertResponsiveClasses(doc: Document): void {
    const allElements = doc.querySelectorAll('*');
    allElements.forEach((element) => {
      try {
        const htmlElement = element as HTMLElement;
        let className = htmlElement.className;
        
        if (typeof className !== 'string' || !className) {
          return;
        }
        
        // preview-grid-4 클래스는 유지하면서 추가 스타일만 적용
        if (className.includes('preview-grid-4')) {
          htmlElement.style.setProperty('display', 'grid', 'important');
          htmlElement.style.setProperty('grid-template-columns', 'repeat(4, 1fr)', 'important');
          htmlElement.style.setProperty('gap', '1rem', 'important');
          logInfo('preview-grid-4 클래스 발견 및 강제 스타일 적용');
        }
        
        // grid-cols 관련 클래스들을 데스크톱 버전으로 변경
        className = className.replace(/\bgrid-cols-2\b/g, 'grid-cols-4');
        className = className.replace(/\bgrid-cols-1\b/g, 'grid-cols-4');
        className = className.replace(/\bgrid-cols-3\b/g, 'grid-cols-4');
        className = className.replace(/\bmd:grid-cols-4\b/g, 'grid-cols-4');
        className = className.replace(/\blg:grid-cols-4\b/g, 'grid-cols-4');
        className = className.replace(/\bxl:grid-cols-4\b/g, 'grid-cols-4');
        className = className.replace(/\bsm:grid-cols-\d+\b/g, 'grid-cols-4');
        
        // 폰트 크기도 데스크톱 크기로
        className = className.replace(/\btext-xs\b/g, 'text-sm');
        className = className.replace(/\btext-sm\b/g, 'text-base');
        className = className.replace(/\blg:text-lg\b/g, 'text-lg');
        
        // 패딩과 마진도 데스크톱 크기로
        className = className.replace(/\bp-2\b/g, 'p-4');
        className = className.replace(/\bp-3\b/g, 'p-6');
        className = className.replace(/\bmd:p-6\b/g, 'p-6');
        className = className.replace(/\blg:p-8\b/g, 'p-8');
        
        htmlElement.className = className;
              } catch (error) {
            const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
          logError('클래스 변경 중 오류', errorObj);
        }
    });
  }

  private isUnsupportedCSSValue(value: string): boolean {
    if (!value || typeof value !== 'string') return false;
    
    return this.UNSUPPORTED_CSS_FUNCTIONS.some(func => 
      value.toLowerCase().includes(func.toLowerCase())
    );
  }

  private getSafeCSSValue(property: string, value: string, element?: Element): string {
    if (!this.isUnsupportedCSSValue(value)) {
      return value;
    }

    // 클래스 기반 대체
    if (element) {
      const classList = Array.from(element.classList);
      for (const className of classList) {
        if (this.COLOR_FALLBACKS[className]) {
          return this.COLOR_FALLBACKS[className];
        }
      }
    }

    // 속성별 기본 대체값
    switch (property) {
      case 'color':
        return '#000000';
      case 'background-color':
        return 'transparent';
      case 'border-color':
        return '#e5e7eb';
      case 'fill':
        return '#000000';
      case 'stroke':
        return '#000000';
      default:
        return 'initial';
    }
  }

  private adjustIconSizes(doc: Document): void {
    // Lucide 아이콘 클래스들의 크기 조정
    const iconSelectors = [
      '.lucide',
      '[class*="lucide-"]',
      'svg[class*="h-5"]',
      'svg[class*="w-5"]',
      'svg[class*="h-4"]',
      'svg[class*="w-4"]',
      'svg[class*="h-6"]',
      'svg[class*="w-6"]'
    ];

    iconSelectors.forEach(selector => {
      const icons = doc.querySelectorAll(selector);
      icons.forEach(icon => {
        const element = icon as HTMLElement | SVGElement;
        
        // 다운로드 이미지에서는 아이콘을 작게 조정
        element.style.setProperty('width', '16px', 'important');
        element.style.setProperty('height', '16px', 'important');
        element.style.setProperty('min-width', '16px', 'important');
        element.style.setProperty('min-height', '16px', 'important');
        element.style.setProperty('max-width', '16px', 'important');
        element.style.setProperty('max-height', '16px', 'important');
        
        // 아이콘이 포함된 컨테이너의 정렬도 조정
        const parentElement = element.parentElement;
        if (parentElement) {
          const computedStyle = window.getComputedStyle(parentElement);
          if (computedStyle.display === 'flex') {
            parentElement.style.setProperty('align-items', 'center', 'important');
            parentElement.style.setProperty('gap', '0.5rem', 'important');
          }
        }
      });
    });

    // BarChart3 특별 처리 (데이터 분석 제목의 아이콘)
    const barChartIcons = doc.querySelectorAll('svg[class*="bar-chart"], svg[data-lucide="bar-chart-3"]');
    barChartIcons.forEach(icon => {
      const element = icon as HTMLElement | SVGElement;
      element.style.setProperty('width', '18px', 'important');
      element.style.setProperty('height', '18px', 'important');
      element.style.setProperty('min-width', '18px', 'important');
      element.style.setProperty('min-height', '18px', 'important');
      element.style.setProperty('max-width', '18px', 'important');
      element.style.setProperty('max-height', '18px', 'important');
    });

    logInfo('아이콘 크기 조정 완료');
  }

  private ensureChartVisibility(doc: Document): void {
    // Recharts 래퍼 컨테이너들 가시성 설정
    const rechartsWrappers = doc.querySelectorAll('.recharts-wrapper, .recharts-surface');
    rechartsWrappers.forEach((wrapper) => {
      const element = wrapper as HTMLElement;
      element.style.setProperty('visibility', 'visible', 'important');
      element.style.setProperty('opacity', '1', 'important');
      element.style.setProperty('display', 'block', 'important');
      element.style.setProperty('width', '100%', 'important');
      element.style.setProperty('height', '400px', 'important');
    });

    // SVG 요소들 가시성 설정
    const svgElements = doc.querySelectorAll('svg');
    svgElements.forEach((svg) => {
      const element = svg as SVGElement;
      element.style.setProperty('visibility', 'visible', 'important');
      element.style.setProperty('opacity', '1', 'important');
      element.style.setProperty('display', 'block', 'important');
      element.style.setProperty('width', '100%', 'important');
      element.style.setProperty('height', '400px', 'important');
      
      // SVG 내부 요소들도 가시성 보장
      const paths = element.querySelectorAll('path, line, circle, rect');
      paths.forEach((path) => {
        const pathElement = path as SVGElement;
        pathElement.style.setProperty('visibility', 'visible', 'important');
        pathElement.style.setProperty('opacity', '1', 'important');
      });
    });

    // 차트가 포함된 div 컨테이너들 크기 설정
    const chartDivs = doc.querySelectorAll('div[class*="h-[400px]"], div[style*="height: 400px"]');
    chartDivs.forEach((div) => {
      const element = div as HTMLElement;
      element.style.setProperty('height', '400px', 'important');
      element.style.setProperty('width', '100%', 'important');
      element.style.setProperty('min-height', '400px', 'important');
      element.style.setProperty('overflow', 'visible', 'important');
    });

    logInfo('차트 가시성 설정 완료', { svgCount: svgElements.length, rechartsCount: rechartsWrappers.length });
  }

  private disableMobileStyles(doc: Document): void {
    try {
      // 스타일 시트의 미디어 쿼리 무효화
      const styleSheets = Array.from(doc.styleSheets);
      styleSheets.forEach(stylesheet => {
        try {
          if (stylesheet.cssRules) {
            Array.from(stylesheet.cssRules).forEach(rule => {
              if (rule instanceof CSSMediaRule) {
                // 모바일 미디어 쿼리 무효화
                if (rule.conditionText.includes('max-width') && rule.conditionText.includes('767px')) {
                  // @ts-ignore
                  rule.disabled = true;
                }
              }
            });
          }
        } catch (e) {
          // CORS 등의 이유로 접근할 수 없는 스타일시트는 무시
        }
      });
      
      logInfo('모바일 미디어 쿼리 무효화 완료');
          } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
        logError('미디어 쿼리 무효화 중 오류', errorObj);
      }
  }
} 