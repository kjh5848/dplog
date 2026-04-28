'use client';

import { useState } from 'react';
import { CheckCircle2, ClipboardCopy, Loader2 } from 'lucide-react';
import { getSystemStatus } from '@/entities/system/api/systemApi';
import { buildDiagnosticText } from '../lib/diagnostic';

export function DiagnosticCopyButton({ className = '' }: { className?: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'copied' | 'failed'>('idle');

  const handleCopy = async () => {
    setState('loading');
    try {
      const status = await getSystemStatus();
      await navigator.clipboard.writeText(buildDiagnosticText(status));
      setState('copied');
      setTimeout(() => setState('idle'), 2200);
    } catch {
      setState('failed');
      setTimeout(() => setState('idle'), 2200);
    }
  };

  return (
    <button
      onClick={handleCopy}
      disabled={state === 'loading'}
      className={`inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200 ${className}`}
    >
      {state === 'loading' ? <Loader2 className="size-4 animate-spin" /> : state === 'copied' ? <CheckCircle2 className="size-4" /> : <ClipboardCopy className="size-4" />}
      {state === 'copied' ? '복사 완료' : state === 'failed' ? '복사 실패' : '진단 정보 복사'}
    </button>
  );
}
