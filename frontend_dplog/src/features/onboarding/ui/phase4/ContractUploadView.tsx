import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, UploadCloud, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/button'; // Assuming standard shadcn-like button

interface Props {
  onUpload: () => void;
}

export function ContractUploadView({ onUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerUpload = () => {
    // 실제 모바일 기기에서는 file input을 클릭하면 하단에 "사진 찍기", "보관함" 등이 뜹니다.
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // 파일이 선택되면 상위 컴포넌트로 전달 (현재는 그냥 애니메이션 데모용 호출)
      onUpload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 md:px-8 py-12 max-w-4xl mx-auto">
      
      {/* Hidden File Input for Native Camera / Gallery */}
      <input 
        type="file" 
        accept="image/*" 
        capture="environment" 
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden" 
      />
      
      {/* Header */}
      <div className="text-center mb-10 w-full space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>조물주 위 건물주, 호구가 되지 마세요</span>
        </motion.div>
        
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
          상가 계약서 <span className="text-red-500">독소조항</span> 분석
        </h1>
        <p className="text-lg text-neutral-400 max-w-xl mx-auto">
          임대차 계약서(특약사항)를 촬영하거나 앨범에서 선택해주세요. AI가 건물주에게 유리하게 작성된 함정 조항들을 찾아내어 협상 가이드를 제공합니다.
        </p>
      </div>

      {/* Upload Dropzone / Camera View */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleTriggerUpload}
        className="relative w-full max-w-md aspect-[3/4] bg-neutral-900 border-2 border-dashed border-neutral-700 rounded-3xl overflow-hidden cursor-pointer group flex flex-col items-center justify-center gap-6"
      >
        {/* Animated Corner Brackets */}
        <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-red-500/50 group-hover:border-red-500 transition-colors" />
        <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-red-500/50 group-hover:border-red-500 transition-colors" />
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-red-500/50 group-hover:border-red-500 transition-colors" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-red-500/50 group-hover:border-red-500 transition-colors" />

        <div className="flex flex-col items-center justify-center gap-4 text-neutral-500 group-hover:text-white transition-colors">
          <div className="p-4 rounded-full bg-neutral-800 group-hover:bg-red-500/20 transition-colors">
            <Camera className="w-10 h-10 group-hover:text-red-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-xl mb-1">계약서 촬영하기</p>
            <p className="text-sm">또는 앨범에서 선택</p>
          </div>
        </div>

        {/* Fake Scan Line Sweep on Hover */}
        <motion.div
          animate={{ top: ['0%', '100%', '0%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute left-0 right-0 h-1 bg-red-500/30 blur-[2px] opacity-0 group-hover:opacity-100"
        />
      </motion.div>

      {/* Alternative actions */}
      <div className="mt-8 flex gap-4 w-full max-w-md cursor-pointer">
        <Button 
          variant="outline" 
          onClick={handleTriggerUpload}
          className="flex-1 bg-neutral-900 border-neutral-700 hover:bg-neutral-800 text-white rounded-xl h-14 cursor-pointer"
        >
          <UploadCloud className="w-5 h-5 mr-2 text-neutral-400" />
          직접 촬영하기
        </Button>
        <Button 
          onClick={onUpload}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-xl h-14 shadow-[0_0_20px_rgba(220,38,38,0.3)]"
        >
          <FileText className="w-5 h-5 mr-2" />
          데모 체험하기
        </Button>
      </div>

    </div>
  );
}
