"use client";

import React from "react";
import html2canvas from "html2canvas";
import { logError } from "@/src/utils/logger";

/** ------------------------------------------------------------------
 *  개선된 ImageCapture 컴포넌트
 *  - SVG 차트 호환성 개선
 *  - 안정적인 다운로드 처리
 *  - 에러 핸들링 강화
 *  ---------------------------------------------------------------
 *  사용 방법:
 *  <ImageCapture>
 *     <div ref={captureRef}>  // 캡처하고 싶은 영역
 *        ...리포트 콘텐트...
 *     </div>
 *  </ImageCapture>
 *  ----------------------------------------------------------------*/

interface ImageCaptureProps {
  children: React.ReactNode;
  fileName?: string;
  quality?: number;
  scale?: number;
  backgroundColor?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function ImageCapture({
  children,
  fileName = "report_capture",
  quality = 0.9,
  scale = 2,
  backgroundColor = "white",
  onSuccess,
  onError,
}: ImageCaptureProps) {
  /** 1) 캡처 대상 DOM */
  const captureRef = React.useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  /** 2) 개선된 다운로드 트리거 */
  const handleDownload = async () => {
    if (!captureRef.current) {
      const error = new Error("캡처할 요소를 찾을 수 없습니다.");
      onError?.(error);
      return;
    }

    setIsDownloading(true);

    try {
      /** 3) 충분한 렌더링 대기 시간 (차트 로딩 완료 대기) */
      await new Promise((resolve) => setTimeout(resolve, 500));

      /** 4) 개선된 html2canvas 옵션 */
      const canvas = await html2canvas(captureRef.current, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: backgroundColor,
        logging: false, // 콘솔 로그 비활성화
        width: captureRef.current.scrollWidth,
        height: captureRef.current.scrollHeight,
        // SVG 처리 개선
        foreignObjectRendering: true,
        imageTimeout: 15000,
        removeContainer: true,
        // 다운로드 버튼 제외
        ignoreElements: (element) => {
          return (
            element.classList.contains('download-button') ||
            element.classList.contains('capture-exclude') ||
            (element.tagName === 'BUTTON' && element.textContent?.includes('다운로드') === true)
          );
        },
        onclone: (clonedDoc, element) => {
          // 다운로드 버튼과 관련 요소들 숨기기
          const buttonsToHide = clonedDoc.querySelectorAll(
            '.download-button, .capture-exclude, button'
          );
          buttonsToHide.forEach((btn) => {
            (btn as HTMLElement).style.display = 'none';
          });

          // SVG 차트 요소들의 스타일 보정
          const svgElements = clonedDoc.querySelectorAll('svg');
          svgElements.forEach((svg) => {
            svg.style.backgroundColor = 'transparent';
            svg.style.display = 'block';
            
            // Recharts SVG 요소들의 경우 크기 명시적 설정
            if (svg.parentElement) {
              const parent = svg.parentElement;
              const computedStyle = window.getComputedStyle(parent);
              svg.setAttribute('width', computedStyle.width);
              svg.setAttribute('height', computedStyle.height);
            }
          });

          // 텍스트와 색상 보정
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const element = el as HTMLElement;
            const computedStyle = window.getComputedStyle(el);
            
            // CSS 변수 해결
            if (computedStyle.color && computedStyle.color.includes('var(')) {
              element.style.color = '#000000';
            }
            if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('var(')) {
              element.style.backgroundColor = 'transparent';
            }
            if (computedStyle.borderColor && computedStyle.borderColor.includes('var(')) {
              element.style.borderColor = '#e5e5e5';
            }
          });

          return element;
        },
      });

      /** 5) 안정적인 파일 다운로드 (JPG 형식으로 변경) */
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 10);
      link.download = `${fileName}_${timestamp}.jpg`;
      
      // JPG로 변환 (더 안정적인 브라우저 지원)
      link.href = canvas.toDataURL("image/jpeg", quality);
      
      // 임시로 DOM에 추가 후 클릭
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      onSuccess?.();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("이미지 생성 중 오류 발생:", errorObj);
      const errorMessage = error instanceof Error ? error : new Error("알 수 없는 오류가 발생했습니다.");
      onError?.(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      {/* 캡처 영역 */}
      <div ref={captureRef}>{children}</div>

      {/* 개선된 다운로드 버튼 */}
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="download-button mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isDownloading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>이미지 생성 중...</span>
          </>
        ) : (
          <span>이미지 저장</span>
        )}
      </button>
    </>
  );
} 