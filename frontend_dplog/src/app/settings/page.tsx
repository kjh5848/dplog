'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Download,
  HardDrive,
  KeyRound,
  Loader2,
  RefreshCw,
  Server,
  ShieldCheck,
  Store,
  Trash2,
} from 'lucide-react';
import { AppShell } from '@/widgets/app-shell/ui/AppShell';
import { getDatabaseBackupUrl, getSystemStatus } from '@/entities/system/api/systemApi';
import type { SystemStatus } from '@/entities/system/model/types';
import { syncStore } from '@/entities/store/api/storeApi';
import { clearLocalAppCache, formatBytes, formatDateTime } from '@/features/system-support/lib/diagnostic';
import { DiagnosticCopyButton } from '@/features/system-support/ui/DiagnosticCopyButton';

type LicenseState = {
  status: 'idle' | 'checking' | 'valid' | 'invalid';
  message: string;
  plan?: string;
  licenseId?: string;
};

function maskValue(value?: string): string {
  if (!value) return '-';
  if (value.length <= 8) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${ok ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'}`}>
      {ok ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
      {label}
    </span>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="size-4 text-blue-600 dark:text-blue-400" />
        <h2 className="text-base font-black text-slate-950 dark:text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0 dark:border-white/10">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-right text-sm font-bold text-slate-900 dark:text-white">{value}</span>
    </div>
  );
}

function SecondaryButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-zinc-950 dark:text-slate-200 dark:hover:bg-white/5"
    >
      {children}
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [license, setLicense] = useState<LicenseState>({ status: 'idle', message: '제품키가 저장되어 있으면 재검증할 수 있습니다.' });

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      setStatus(await getSystemStatus());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleSync = async () => {
    if (!status?.store?.id) return;
    setIsSyncing(true);
    setMessage('');
    try {
      await syncStore(status.store.id);
      setMessage('데이터 업데이트를 시작했습니다. 수집 상태는 잠시 후 다시 확인해 주세요.');
      await loadStatus();
    } catch {
      setMessage('데이터 업데이트 요청에 실패했습니다.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBackup = () => {
    window.location.href = getDatabaseBackupUrl();
  };

  const handleClearCache = () => {
    const removed = clearLocalAppCache();
    setMessage(`브라우저 캐시 ${removed}개를 정리했습니다.`);
  };

  const handleVerifyLicense = async () => {
    const key = getCookie('dplog_local_license');
    if (!key) {
      setLicense({ status: 'invalid', message: '저장된 제품키가 없습니다.' });
      return;
    }

    setLicense({ status: 'checking', message: '제품키를 확인하고 있습니다.' });
    try {
      const res = await fetch('/v1/auth/verify-license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: String(key) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || '제품키 확인에 실패했습니다.');
      setLicense({
        status: 'valid',
        message: data.message || '라이선스가 정상입니다.',
        plan: data.license_info?.plan,
        licenseId: data.license_info?.license_id,
      });
    } catch (error: any) {
      setLicense({ status: 'invalid', message: error.message || '제품키 확인에 실패했습니다.' });
    }
  };

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Settings</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white">설정</h1>
          </div>
          <SecondaryButton onClick={loadStatus} disabled={isLoading}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            상태 새로고침
          </SecondaryButton>
        </div>

        {message && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Section title="앱 상태" icon={Server}>
            <InfoRow label="백엔드 연결" value={<StatusPill ok={!!status?.backend.connected} label={status?.backend.connected ? '정상' : '확인 필요'} />} />
            <InfoRow label="앱 버전" value={status?.backend.version || '-'} />
            <InfoRow label="앱 모드" value={status?.backend.appMode || '-'} />
            <InfoRow label="포트" value={status?.backend.port || '-'} />
            <InfoRow label="서버 시간" value={formatDateTime(status?.backend.serverTime)} />
          </Section>

          <Section title="저장소" icon={HardDrive}>
            <InfoRow label="DB 상태" value={<StatusPill ok={!!status?.database.exists} label={status?.database.exists ? '정상' : '없음'} />} />
            <InfoRow label="DB 위치" value={status?.database.location || '-'} />
            <InfoRow label="DB 크기" value={formatBytes(status?.database.sizeBytes || 0)} />
            <InfoRow label="정적 파일" value={<StatusPill ok={!!status?.staticAssets.indexExists} label={status?.staticAssets.indexExists ? '정상' : '확인 필요'} />} />
            <InfoRow label="Next assets" value={status?.staticAssets.assetDirExists ? '있음' : '없음'} />
          </Section>

          <Section title="데이터 관리" icon={Database}>
            <InfoRow label="현재 상점" value={status?.store ? `${status.store.name} #${status.store.id}` : '등록 없음'} />
            <InfoRow label="수집 상태" value={status?.store?.scrapeStatus || '-'} />
            <InfoRow label="마지막 업데이트" value={formatDateTime(status?.store?.updatedAt)} />
            <InfoRow label="대표키워드 수" value={`${status?.store?.keywordsCount ?? 0}개`} />
            <div className="mt-4 flex flex-wrap gap-2">
              <SecondaryButton onClick={handleSync} disabled={!status?.store || isSyncing}>
                {isSyncing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                데이터 업데이트
              </SecondaryButton>
              <SecondaryButton onClick={handleBackup} disabled={!status?.database.exists}>
                <Download className="size-4" />
                DB 백업
              </SecondaryButton>
              <SecondaryButton onClick={handleClearCache}>
                <Trash2 className="size-4" />
                브라우저 캐시 정리
              </SecondaryButton>
            </div>
          </Section>

          <Section title="라이선스" icon={ShieldCheck}>
            <InfoRow label="상태" value={license.status === 'valid' ? <StatusPill ok label="정상" /> : license.status === 'invalid' ? <StatusPill ok={false} label="확인 필요" /> : '대기'} />
            <InfoRow label="플랜" value={license.plan || '-'} />
            <InfoRow label="라이선스 ID" value={maskValue(license.licenseId)} />
            <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 dark:bg-white/5 dark:text-slate-300">
              {license.message}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <SecondaryButton onClick={handleVerifyLicense} disabled={license.status === 'checking'}>
                {license.status === 'checking' ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
                제품키 재검증
              </SecondaryButton>
              <SecondaryButton onClick={() => router.push('/license')}>
                <KeyRound className="size-4" />
                제품키 다시 입력
              </SecondaryButton>
            </div>
          </Section>
        </div>

        <section className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Clock className="mt-1 size-5 text-slate-500" />
            <div>
              <h2 className="text-base font-black text-slate-950 dark:text-white">지원 정보</h2>
              <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                제품키 원문은 포함하지 않습니다.
              </p>
            </div>
          </div>
          <DiagnosticCopyButton />
        </section>
      </div>
    </AppShell>
  );
}
