import { FileText } from 'lucide-react';

export default function ReportPage() {
  return (
    <div className="w-full h-full min-h-[60vh] bg-transparent p-4 lg:p-8 flex items-center justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 size-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500">
          <FileText className="size-7" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          내 가게 진단은 준비중입니다
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
          실제 데이터와 근거를 연결한 뒤 사용할 수 있도록 잠시 숨겨두었습니다.
        </p>
      </div>
    </div>
  );
}
