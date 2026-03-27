import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { motion } from "framer-motion";
import { logError } from "@/src/utils/logger";
import toast from "react-hot-toast";

interface ExcelUploadModalProps {
  show: boolean;
  handleClose: () => void;
}

const ExcelUploadModal = ({ show, handleClose }: ExcelUploadModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [urlData, setUrlData] = useState<string[]>([]);
  const [step, setStep] = useState(1); // 1: 파일 선택, 2: 테이블 표시

  useEffect(() => {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);

    reader.onload = (e) => {
      const binaryData = e.target?.result;
      const workbook = XLSX.read(binaryData, { type: "array" });
      const sheetName = workbook.SheetNames[0]; // 첫 번째 시트
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][]; // 배열로 변환
      const filteredData = jsonData.slice(1).map((row) => row[0] as string); // A2부터 읽기
     
      setUrlData(filteredData);
    };

    reader.onerror = (error) => {
      const errorObj = error instanceof Error ? error : new Error('Unknown error occurred');
      logError("파일 읽기 오류:", errorObj);
    };

    // filterdData를 이용해서 플레이스 정보 호출 및 보여주기
    setStep(2);
  }, [file]);

  useEffect(() => {
    if (urlData.length === 0) {
      return;
    }
  }, [urlData]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith(".xlsx")) {
      setFile(selectedFile);
    } else {
      toast.error("엑셀(.xlsx) 파일만 업로드 가능합니다.");
      setFile(null);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".xlsx")) {
      setFile(droppedFile);
    } else {
      toast.error("엑셀(.xlsx) 파일만 업로드 가능합니다.");
      setFile(null);
    }
  };

  const handleUpload = () => {
    if (!file) {
      toast.error("파일을 선택해주세요.");
      return;
    }
    
    handleClose(); // 모달 닫기
  };

  // 모달 닫을 때 초기화
  const handleModalClose = () => {
    setFile(null);
    setUrlData([]);
    setStep(1);
    handleClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl overflow-hidden">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold">엑셀 업로드</h3>
          <button 
            onClick={handleModalClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* 모달 본문 */}
        <div className="p-6">
          {step === 1 ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-smp-6 text-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              {file ? (
                <p className="text-gray-700">{file.name}</p>
              ) : (
                <p className="text-gray-500">파일을 여기에 드래그하거나 찾아보기를 클릭하세요.</p>
              )}
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="hidden"
                id="fileInput"
              />
              <label 
                htmlFor="fileInput" 
                className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-smhover:bg-blue-600 cursor-pointer"
              >
                찾아보기
              </label>
            </div>
          ) : (
            <motion.div
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0 }}
            >
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      URL
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {urlData.map((url, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {url}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </div>
        
        {/* 모달 푸터 */}
        <div className="border-t p-4 flex justify-end space-x-2">
          <button
            onClick={handleModalClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
          >
            닫기
          </button>
          <button
            onClick={handleUpload}
            disabled={!file}
            className={`px-4 py-2 rounded-smtext-white ${
              !file ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            업로드
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelUploadModal; 