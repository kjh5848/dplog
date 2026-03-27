'use client';

import React, { useRef, useState } from 'react';
import { format } from 'date-fns';
import { X, Download } from 'lucide-react';
import { TrackData } from '@/src/model/TrackRepository';
import { createUnifiedCanvas, downloadCanvasAsImage } from '@/src/features/track/report/reportHelper';
import TrackReportView from './TrackReportView';
import { logError, logger, logInfo } from '@/src/utils/logger';
import toast from 'react-hot-toast';

interface DownloadOptions {
  rankChart: boolean;
  visitorReviewChart: boolean;
  blogReviewChart: boolean;
  saveCountChart: boolean;
  includeAnalysis: boolean;
  includeDetailData: boolean;
  hideGridControls: boolean;
}

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  trackList: TrackData[];
  shopName: string;
  keyword: string;
  shopId: string;
  startDate: Date | null;
  endDate: Date | null;
  viewMode: 'grid' | 'list';
  downloadOptions: DownloadOptions;
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  trackList,
  shopName,
  keyword,
  shopId,
  startDate,
  endDate,
  viewMode,
  downloadOptions,
}: ReportPreviewModalProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadMode, setIsDownloadMode] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!previewRef.current) {
      toast.error("캡처할 요소를 찾을 수 없습니다.");
      return;
    }

    setIsDownloading(true);
    setIsDownloadMode(true); // 다운로드 모드 활성화
    
    try {
      logInfo("미리보기 통일된 다운로드 시작...");
      
      // DOM 업데이트를 위해 잠시 대기
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 파일명에 날짜 추가
      const dateStr = startDate && endDate 
        ? `${format(startDate, 'yyyyMMdd')}-${format(endDate, 'yyyyMMdd')}`
        : format(new Date(), 'yyyyMMdd');
      const fullFileName = `${shopName}_${keyword}_리포트_${dateStr}`;

      // 공통 캔버스 생성 함수 사용
      const canvas = await createUnifiedCanvas({
        element: previewRef.current,
        fileName: fullFileName
      });

      // 공통 다운로드 함수 사용
      await downloadCanvasAsImage(canvas, fullFileName);
      
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError('미리보기 다운로드 실패:', errorObj);
      toast.error(`미리보기 다운로드 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    } finally {
      setIsDownloading(false);
      setIsDownloadMode(false); // 다운로드 모드 비활성화
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg max-w-6xl max-h-[90vh] overflow-auto w-full"
        onClick={handleModalClick}
      >
        {/* 모달 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="download-button capture-exclude flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? '다운로드 중...' : '다운로드'}</span>
            </button>
            <button
              onClick={onClose}
              className="capture-exclude p-2 text-gray-400 hover:text-gray-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TrackReportView 재사용 */}
        <div ref={previewRef} className="p-8 bg-white" data-preview-content>
          <TrackReportView
            trackList={trackList}
            shopName={shopName}
            keyword={keyword}
            shopId={shopId}
            isPreviewMode={true}
            downloadOptions={downloadOptions}
            viewMode={viewMode}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>
    </div>
  );
} 