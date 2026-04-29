'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Copy, Download, KeyRound, ShieldCheck, Store, XCircle } from 'lucide-react';
import * as licenseApi from '@/entities/license/api/licenseApi';
import * as ownerApi from '@/entities/owner/api/ownerApi';
import type { DownloadArtifactsResponse, LicenseStateResponse } from '@/entities/license/model/types';
import type { OwnerVerificationRequest, OwnerVerificationResponse } from '@/entities/owner/model/types';

const emptyOwnerForm: OwnerVerificationRequest = {
  businessNumber: '',
  openingDate: '',
  representativeName: '',
  placeId: '',
  placeName: '',
  category: '',
};

const statusLabels: Record<string, string> = {
  VERIFIED: '확인 완료',
  PENDING_REVIEW: '검토 중',
  REJECTED_INVALID_BUSINESS: '사업자 정보 불일치',
  REJECTED_NOT_RESTAURANT: '음식점 업종 아님',
  EXTERNAL_UNAVAILABLE: '진위확인 일시 불가',
  PENDING_ADMIN_APPROVAL: '관리자 승인 대기',
  APPROVED: '승인 완료',
  REJECTED: '반려',
};

export function DownloadClient() {
  const [licenseState, setLicenseState] = useState<LicenseStateResponse | null>(null);
  const [artifacts, setArtifacts] = useState<DownloadArtifactsResponse | null>(null);
  const [verifications, setVerifications] = useState<OwnerVerificationResponse[]>([]);
  const [ownerForm, setOwnerForm] = useState<OwnerVerificationRequest>(emptyOwnerForm);
  const [oneTimeProductKey, setOneTimeProductKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const latestVerification = verifications[0];
  const canDownload = Boolean(licenseState?.license?.status === 'ACTIVE');

  const maskedProductKey = useMemo(() => {
    const license = licenseState?.license;
    if (!license) return '-';
    return `${license.keyPrefix}-****-****-****-${license.keyLast4}`;
  }, [licenseState]);

  const refresh = async () => {
    const [nextLicenseState, nextArtifacts, nextVerifications] = await Promise.all([
      licenseApi.getLicenseState(),
      licenseApi.getDownloadArtifacts(),
      ownerApi.getMyOwnerVerifications(),
    ]);
    setLicenseState(nextLicenseState);
    setArtifacts(nextArtifacts);
    setVerifications(nextVerifications);
  };

  useEffect(() => {
    refresh()
      .catch(() => setMessage('다운로드 정보를 불러오지 못했습니다. 로그인 상태를 확인해 주세요.'))
      .finally(() => setIsLoading(false));
  }, []);

  const submitOwnerVerification = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const result = await ownerApi.submitOwnerVerification(ownerForm);
      setVerifications((prev) => [result, ...prev]);
      setOwnerForm(emptyOwnerForm);
      setMessage(statusLabels[result.status] ?? '확인 요청이 접수되었습니다.');
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '사업자 확인 요청에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestProductKey = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const license = await licenseApi.requestProductKey();
      setOneTimeProductKey(license.oneTimeProductKey ?? null);
      setLicenseState({ hasVerifiedOwner: true, license });
      setMessage(license.oneTimeProductKey ? '제품키가 발급되었습니다. 지금 한 번만 표시됩니다.' : '이미 발급된 제품키가 있습니다.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '제품키 발급에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateOwnerForm = (key: keyof OwnerVerificationRequest, value: string) => {
    setOwnerForm((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div className="text-sm text-slate-500">다운로드 정보를 확인하는 중입니다.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-blue-600">D-PLOG Desktop</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">다운로드와 제품키</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          제품키는 사업자 진위확인과 음식점 상점 확인이 끝난 사장님에게 발급됩니다. 삭제키는 상점 남용을 막기 위한 관리자 승인 키로 별도 관리됩니다.
        </p>
      </header>

      {message && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
          {message}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard
          icon={<Store className="size-5" />}
          title="사장님 확인"
          value={licenseState?.hasVerifiedOwner ? '완료' : '필요'}
          positive={licenseState?.hasVerifiedOwner}
        />
        <StatusCard
          icon={<KeyRound className="size-5" />}
          title="제품키"
          value={licenseState?.license ? maskedProductKey : '미발급'}
          positive={Boolean(licenseState?.license)}
        />
        <StatusCard
          icon={<ShieldCheck className="size-5" />}
          title="삭제키"
          value={statusLabels[licenseState?.license?.deleteKeyStatus ?? ''] ?? '승인 전'}
          positive={licenseState?.license?.deleteKeyStatus === 'APPROVED'}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">사업자 진위확인</h2>
              <p className="mt-1 text-sm text-slate-500">공공데이터포털 국세청 API와 음식점 카테고리로 확인합니다.</p>
            </div>
            {latestVerification && <Badge>{statusLabels[latestVerification.status] ?? latestVerification.status}</Badge>}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Input label="사업자등록번호" value={ownerForm.businessNumber} onChange={(value) => updateOwnerForm('businessNumber', value)} placeholder="000-00-00000" />
            <Input label="개업일자" type="date" value={ownerForm.openingDate} onChange={(value) => updateOwnerForm('openingDate', value)} />
            <Input label="대표자명" value={ownerForm.representativeName} onChange={(value) => updateOwnerForm('representativeName', value)} placeholder="홍길동" />
            <Input label="네이버 Place ID" value={ownerForm.placeId} onChange={(value) => updateOwnerForm('placeId', value)} placeholder="place/123456" />
            <Input label="상호" value={ownerForm.placeName} onChange={(value) => updateOwnerForm('placeName', value)} placeholder="예: 연산정" />
            <Input label="업종" value={ownerForm.category} onChange={(value) => updateOwnerForm('category', value)} placeholder="예: 한식, 음식점" />
          </div>

          <button
            onClick={submitOwnerVerification}
            disabled={isSubmitting}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white disabled:opacity-50 dark:bg-white dark:text-slate-950"
          >
            <ShieldCheck className="size-4" />
            사장님 확인 요청
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <h2 className="text-lg font-bold">제품키 발급</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            확인이 완료되면 제품키를 발급할 수 있습니다. 제품키 전문은 최초 발급 응답에서만 표시됩니다.
          </p>

          <button
            onClick={requestProductKey}
            disabled={isSubmitting || !licenseState?.hasVerifiedOwner}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            <KeyRound className="size-4" />
            제품키 발급 받기
          </button>

          {oneTimeProductKey && (
            <div className="mt-5 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-bold">1회 표시 제품키</p>
              <div className="mt-2 flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 font-mono text-sm">
                <span>{oneTimeProductKey}</span>
                <button onClick={() => navigator.clipboard.writeText(oneTimeProductKey)} className="text-amber-700">
                  <Copy className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="text-lg font-bold">앱 다운로드</h2>
            <p className="mt-1 text-sm text-slate-500">제품키가 활성화된 계정에서 다운로드 파일을 받을 수 있습니다.</p>
          </div>
          {!canDownload && <Badge>제품키 필요</Badge>}
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <DownloadLink href={artifacts?.macUrl} disabled={!canDownload} label="macOS 다운로드" />
          <DownloadLink href={artifacts?.windowsUrl} disabled={!canDownload} label="Windows 다운로드" />
        </div>
      </section>
    </div>
  );
}

function StatusCard({ icon, title, value, positive }: { icon: React.ReactNode; title: string; value: string; positive?: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <span className={positive ? 'text-emerald-500' : 'text-slate-400'}>{icon}</span>
        {title}
      </div>
      <div className="mt-3 flex items-center gap-2 text-lg font-black">
        {positive ? <CheckCircle2 className="size-5 text-emerald-500" /> : <XCircle className="size-5 text-slate-300" />}
        <span>{value}</span>
      </div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">{children}</span>;
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 dark:border-white/10 dark:bg-zinc-950"
      />
    </label>
  );
}

function DownloadLink({ href, disabled, label }: { href?: string; disabled: boolean; label: string }) {
  if (disabled || !href) {
    return (
      <button disabled className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-3 text-sm font-bold text-slate-400">
        <Download className="size-4" />
        {label}
      </button>
    );
  }

  return (
    <a href={href} className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700 hover:bg-blue-100">
      <Download className="size-4" />
      {label}
    </a>
  );
}
