'use client';

import { useEffect, useState } from 'react';
import { KeyRound, ShieldAlert, UsersRound } from 'lucide-react';
import * as licenseApi from '@/entities/license/api/licenseApi';
import type {
  AdminDashboardSummary,
  AdminDeleteKeyRequestDto,
  AdminLicenseDto,
} from '@/entities/license/model/types';

export function AdminDashboardClient() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [licenses, setLicenses] = useState<AdminLicenseDto[]>([]);
  const [deleteKeyRequests, setDeleteKeyRequests] = useState<AdminDeleteKeyRequestDto[]>([]);
  const [oneTimeDeleteKey, setOneTimeDeleteKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    const [nextSummary, nextLicenses, nextDeleteKeyRequests] = await Promise.all([
      licenseApi.getAdminSummary(),
      licenseApi.getAdminLicenses(),
      licenseApi.getAdminDeleteKeyRequests(),
    ]);
    setSummary(nextSummary);
    setLicenses(nextLicenses);
    setDeleteKeyRequests(nextDeleteKeyRequests);
  };

  useEffect(() => {
    refresh()
      .catch(() => setMessage('관리자 권한이 없거나 세션이 만료되었습니다.'))
      .finally(() => setIsLoading(false));
  }, []);

  const revoke = async (licenseId: string) => {
    setMessage(null);
    try {
      await licenseApi.revokeLicense(licenseId);
      await refresh();
      setMessage('라이선스를 폐기했습니다.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '라이선스 폐기에 실패했습니다.');
    }
  };

  const approveDeleteKey = async (requestId: string) => {
    setMessage(null);
    setOneTimeDeleteKey(null);
    try {
      const response = await licenseApi.approveDeleteKey(requestId);
      setOneTimeDeleteKey(response.oneTimeDeleteKey);
      await refresh();
      setMessage('삭제키를 승인했습니다. 삭제키는 지금 한 번만 표시됩니다.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '삭제키 승인에 실패했습니다.');
    }
  };

  if (isLoading) {
    return <div className="text-sm text-slate-500">관리자 정보를 불러오는 중입니다.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-blue-600">Admin</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-950 dark:text-white">라이선스 모니터링</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          제품키 발급 현황, 삭제키 승인 대기, 데스크톱 활성화 상태를 확인합니다.
        </p>
      </header>

      {message && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
          {message}
        </div>
      )}

      {oneTimeDeleteKey && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
          <p className="font-bold">1회 표시 삭제키</p>
          <p className="mt-1 font-mono">{oneTimeDeleteKey}</p>
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <Metric icon={<KeyRound className="size-5" />} label="활성 제품키" value={summary?.activeLicenses ?? 0} />
        <Metric icon={<ShieldAlert className="size-5" />} label="삭제키 승인 대기" value={summary?.pendingDeleteKeys ?? 0} />
        <Metric icon={<UsersRound className="size-5" />} label="기기 활성화" value={summary?.totalActivations ?? 0} />
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <h2 className="text-lg font-bold">삭제키 승인 대기</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500 dark:bg-white/5">
              <tr>
                <th className="px-5 py-3">소유자</th>
                <th className="px-5 py-3">라이선스</th>
                <th className="px-5 py-3">상태</th>
                <th className="px-5 py-3">요청일</th>
                <th className="px-5 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {deleteKeyRequests.map((request) => (
                <tr key={request.requestId}>
                  <td className="px-5 py-4 font-medium">{request.ownerEmail}</td>
                  <td className="px-5 py-4 font-mono">{request.licenseId.slice(0, 8)}</td>
                  <td className="px-5 py-4">{request.status}</td>
                  <td className="px-5 py-4">{new Date(request.requestedAt).toLocaleDateString('ko-KR')}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => approveDeleteKey(request.requestId)}
                      disabled={request.status !== 'PENDING_ADMIN_APPROVAL'}
                      className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-600 disabled:border-slate-200 disabled:text-slate-300"
                    >
                      승인
                    </button>
                  </td>
                </tr>
              ))}
              {deleteKeyRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                    삭제키 요청이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="border-b border-slate-200 px-5 py-4 dark:border-white/10">
          <h2 className="text-lg font-bold">제품키 목록</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase text-slate-500 dark:bg-white/5">
              <tr>
                <th className="px-5 py-3">소유자</th>
                <th className="px-5 py-3">제품키</th>
                <th className="px-5 py-3">플랜</th>
                <th className="px-5 py-3">상태</th>
                <th className="px-5 py-3">발급일</th>
                <th className="px-5 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/10">
              {licenses.map((license) => (
                <tr key={license.licenseId}>
                  <td className="px-5 py-4 font-medium">{license.ownerEmail}</td>
                  <td className="px-5 py-4 font-mono">{license.keyPrefix}-****-****-****-{license.keyLast4}</td>
                  <td className="px-5 py-4">{license.plan}</td>
                  <td className="px-5 py-4">{license.status}</td>
                  <td className="px-5 py-4">{new Date(license.issuedAt).toLocaleDateString('ko-KR')}</td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => revoke(license.licenseId)}
                      disabled={license.status !== 'ACTIVE'}
                      className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 disabled:border-slate-200 disabled:text-slate-300"
                    >
                      폐기
                    </button>
                  </td>
                </tr>
              ))}
              {licenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-500">
                    발급된 제품키가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <span className="text-blue-600">{icon}</span>
        {label}
      </div>
      <div className="mt-3 text-3xl font-black">{value.toLocaleString('ko-KR')}</div>
    </div>
  );
}
