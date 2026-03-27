"use client";

import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { logError } from "@/src/utils/logger";
import toast from "react-hot-toast";

interface PlaceData {
  url: string;
  keyword: string;
  // 추가 데이터 필드 정의 가능
}

const ReviewRequestForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [placeData, setPlaceData] = useState<PlaceData[]>([]);
  const [step, setStep] = useState(1); // 1: 파일 선택, 2: 테이블 표시

  useEffect(() => {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (e) => {
      try {
        const binaryData = e.target?.result;
        const workbook = XLSX.read(binaryData, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: ["url", "keyword"] }) as PlaceData[];
        
        // 첫 번째 행(헤더)은 건너뛰기
        const data = jsonData.slice(1);
        setPlaceData(data);
        setStep(2);
      } catch (error) {
        const errorObj = error instanceof Error ? error : new Error('Excel 파일 처리 중 오류가 발생했습니다.');
        logError("Excel 파싱 오류:", errorObj);
        toast.error(errorObj.message);
        resetState();
      }
    };

    reader.onerror = (error) => {
      const errorObj = error instanceof Error ? error : new Error('파일 읽기 중 오류가 발생했습니다.');
      logError("파일 읽기 오류:", errorObj);
      toast.error(errorObj.message);
      resetState();
    };
  }, [file]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && (selectedFile.name.endsWith(".xlsx") || selectedFile.name.endsWith(".csv"))) {
      setFile(selectedFile);
    } else {
      toast.error("엑셀(.xlsx) 또는 CSV(.csv) 파일만 업로드 가능합니다.");
      setFile(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith(".xlsx") || droppedFile.name.endsWith(".csv"))) {
      setFile(droppedFile);
    } else {
      toast.error("엑셀(.xlsx) 또는 CSV(.csv) 파일만 업로드 가능합니다.");
      setFile(null);
    }
  };

  const handleRequestReviews = () => {
    if (placeData.length === 0) {
      toast.error("요청할 데이터가 없습니다.");
      return;
    }
    // TODO: 리뷰 요청 로직 구현
    toast.success(`${placeData.length}건의 리뷰 요청이 시작되었습니다.`);
    resetState();
  };

  const resetState = () => {
    setFile(null);
    setPlaceData([]);
    setStep(1);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-r from-white to-blue-50 shadow-lg">
      <div className="p-6">
        {step === 1 ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept=".xlsx, .csv"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              {file ? (
                <p className="text-gray-700 font-semibold">{file.name}</p>
              ) : (
                <div>
                  <p className="text-gray-500">파일을 여기에 드래그하거나 클릭하여 업로드하세요.</p>
                  <p className="text-xs text-gray-400 mt-2">지원 파일: .xlsx, .csv</p>
                </div>
              )}
              <span className="mt-4 inline-block px-5 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                파일 찾아보기
              </span>
            </label>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-lg font-semibold mb-4">업로드된 데이터 확인</h3>
            <div className="max-h-96 overflow-y-auto rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      키워드
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {placeData.map((data, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate max-w-xs">
                        {data.url}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {data.keyword}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="border-t p-4 flex justify-end space-x-3">
        <button
          onClick={resetState}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleRequestReviews}
          disabled={placeData.length === 0}
          className={`px-4 py-2 rounded-lg text-white transition-colors ${
            placeData.length === 0 ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          리뷰 요청
        </button>
      </div>
    </div>
  );
};

export default ReviewRequestForm;
