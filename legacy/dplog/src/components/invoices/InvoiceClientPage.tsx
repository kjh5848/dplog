"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import InvoiceRepository from "@/src/model/InvoiceRepository";
import LoadingFallback from "@/src/components/common/LoadingFallback";
import { loadingUtils } from "@/src/utils/loading";
import { useAuthGuard, useAuthStatus } from "@/src/utils/auth";
import {
  InvoiceDetailResponse,
  InvoiceLine,
  InvoiceLineType,
  InvoiceListParams,
  InvoiceListResponse,
  InvoiceStatus,
  InvoiceSummaryItem,
} from "@/src/types/invoice";

type FilterState = {
  status: InvoiceStatus | "";
  from: string;
  to: string;
  userId: string;
  subscriptionId: string;
  lineType: InvoiceLineType | "";
  lineDescription: string;
  sort: string;
  size: string;
};

const STATUS_OPTIONS: Array<{ value: InvoiceStatus | ""; label: string }> = [
  { value: "", label: "전체" },
  { value: "PENDING", label: "PENDING" },
  { value: "PAID", label: "PAID" },
  { value: "VOID", label: "VOID" },
  { value: "REFUNDED", label: "REFUNDED" },
];

const LINE_TYPE_OPTIONS: Array<{ value: InvoiceLineType | ""; label: string }> = [
  { value: "", label: "전체" },
  { value: "MEMBERSHIP", label: "MEMBERSHIP" },
  { value: "PRORATION", label: "PRORATION" },
  { value: "DISCOUNT", label: "DISCOUNT" },
  { value: "CREDIT", label: "CREDIT" },
  { value: "ADJUSTMENT", label: "ADJUSTMENT" },
  { value: "REFUND", label: "REFUND" },
];

const DEFAULT_FILTERS: FilterState = {
  status: "",
  from: "",
  to: "",
  userId: "",
  subscriptionId: "",
  lineType: "",
  lineDescription: "",
  sort: "issuedAt,DESC",
  size: "20",
};

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: currency || "KRW",
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("ko-KR")} ${currency}`;
  }
}

function formatDate(value?: string | null) {
  return value && value.length > 0 ? value : "-";
}

function getLineTone(lineType: InvoiceLineType) {
  if (lineType === "PRORATION") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (lineType === "CREDIT" || lineType === "REFUND") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }
  if (lineType === "DISCOUNT") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (lineType === "MEMBERSHIP") {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

function deriveLineLabel(line: InvoiceLine) {
  return line.lineTypeLabel?.trim() || line.lineType;
}

export default function InvoiceClientPage() {
  const router = useRouter();
  const { loginUser } = useAuthStatus();
  const { isLoading, isGuest, isLogoutPending } = useAuthGuard();
  const [mounted, setMounted] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<InvoiceListParams>({
    sort: "issuedAt,DESC",
    page: 0,
    size: 20,
  });

  const [listData, setListData] = useState<InvoiceListResponse | null>(null);
  const [summaryData, setSummaryData] = useState<InvoiceSummaryItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<InvoiceDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isGuest && !isLogoutPending) {
      router.push("/login");
    }
  }, [mounted, isGuest, isLogoutPending, router]);

  useEffect(() => {
    if (mounted && !isLoading && loginUser !== undefined && !hasCheckedAuth) {
      setHasCheckedAuth(true);

      if (!loginUser) {
        toast.error("로그인이 필요합니다.");
        router.push("/login");
        return;
      }

      const hasAdminAuth = loginUser.authority?.includes("ADMIN");
      if (!hasAdminAuth) {
        toast.error("관리자 권한이 필요합니다.");
        router.push("/");
      }
    }
  }, [mounted, isLoading, loginUser, hasCheckedAuth, router]);

  const appliedKey = useMemo(
    () => JSON.stringify(appliedFilters),
    [appliedFilters]
  );

  useEffect(() => {
    if (!mounted || !hasCheckedAuth || !loginUser?.authority?.includes("ADMIN")) {
      return;
    }

    const fetchList = async () => {
      setListLoading(true);
      setListError(null);
      const payload = await InvoiceRepository.getInvoiceList(appliedFilters);
      if (!payload.success || !payload.data) {
        setListError(payload.error || "인보이스 목록을 불러오지 못했습니다.");
        setListData(null);
        setListLoading(false);
        return;
      }

      setListData(payload.data);
      setListLoading(false);
    };

    const fetchSummary = async () => {
      setSummaryLoading(true);
      const payload = await InvoiceRepository.getInvoiceSummary({
        status: appliedFilters.status,
        from: appliedFilters.from,
        to: appliedFilters.to,
      });

      if (!payload.success || !payload.data) {
        setSummaryData([]);
        setSummaryLoading(false);
        return;
      }

      setSummaryData(payload.data);
      setSummaryLoading(false);
    };

    void fetchList();
    void fetchSummary();
  }, [appliedKey, mounted, hasCheckedAuth, loginUser]);

  const applyFilters = () => {
    const size = Number.parseInt(filters.size, 10);
    setAppliedFilters({
      status: filters.status || undefined,
      from: filters.from || undefined,
      to: filters.to || undefined,
      userId: filters.userId || undefined,
      subscriptionId: filters.subscriptionId || undefined,
      lineType: filters.lineType || undefined,
      lineDescription: filters.lineDescription || undefined,
      sort: filters.sort || "issuedAt,DESC",
      page: 0,
      size: Number.isNaN(size) ? 20 : size,
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setAppliedFilters({ sort: "issuedAt,DESC", page: 0, size: 20 });
  };

  const handlePageChange = (nextPage: number) => {
    setAppliedFilters((prev) => ({ ...prev, page: nextPage }));
  };

  const handleCsvDownload = async () => {
    try {
      const text = await InvoiceRepository.downloadInvoiceCsv(appliedFilters);
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const today = new Date();
      const filename = `invoices_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}.csv`;
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      toast.success("CSV 다운로드가 시작되었습니다.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "CSV 다운로드 중 오류가 발생했습니다.";
      toast.error(message);
    }
  };

  const handleSelectInvoice = async (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setDetailLoading(true);
    setDetailError(null);
    const payload = await InvoiceRepository.getInvoiceDetail(invoiceId);

    if (!payload.success || !payload.data) {
      setDetailError(payload.error || "인보이스 상세를 불러오지 못했습니다.");
      setDetailData(null);
      setDetailLoading(false);
      return;
    }

    setDetailData({
      ...payload.data,
      charges: payload.data.charges ?? [],
    });
    setDetailLoading(false);
  };

  const handleCloseDetail = () => {
    setSelectedInvoiceId(null);
    setDetailData(null);
    setDetailError(null);
  };

  if (isLoading) {
    if (isLogoutPending) {
      return <LoadingFallback config={loadingUtils.logoutAuth()} />;
    }
    return <LoadingFallback config={loadingUtils.userAuth()} />;
  }

  if (isGuest) {
    return <LoadingFallback config={loadingUtils.loginRedirect()} />;
  }

  if (!mounted || loginUser === undefined || !hasCheckedAuth) {
    return <LoadingFallback config={loadingUtils.userAuth()} />;
  }

  if (!loginUser) {
    return <LoadingFallback config={loadingUtils.loginRedirect()} />;
  }

  if (!loginUser.authority?.includes("ADMIN")) {
    return (
      <div className="min-h-screen bg-rank-light flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-rank-danger">권한이 없습니다.</div>
        </div>
      </div>
    );
  }

  const content = listData?.content ?? [];
  const totalPages = listData?.totalPages ?? 0;
  const currentPage = appliedFilters.page ?? 0;

  return (
    <main className="min-h-screen bg-rank-light">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 lg:px-10">
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            admin only
          </p>
          <h1 className="text-3xl font-bold text-slate-900">인보이스 관리</h1>
          <p className="text-sm text-slate-600">
            인보이스 목록, 상세 라인, 차지 내역을 조회하고 CSV를 다운로드합니다.
          </p>
        </header>

        <section className="card-primary mt-6 p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                상태
              </label>
              <select
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={filters.status}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: event.target.value as FilterState["status"],
                  }))
                }
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                기간(from/to)
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  type="date"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={filters.from}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, from: event.target.value }))
                  }
                />
                <input
                  type="date"
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={filters.to}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, to: event.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                사용자 ID
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={filters.userId}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, userId: event.target.value }))
                }
                placeholder="userId"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                구독 ID
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={filters.subscriptionId}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    subscriptionId: event.target.value,
                  }))
                }
                placeholder="subscriptionId"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                라인 타입
              </label>
              <select
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={filters.lineType}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    lineType: event.target.value as FilterState["lineType"],
                  }))
                }
              >
                {LINE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                라인 설명 검색
              </label>
              <input
                type="text"
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={filters.lineDescription}
                onChange={(event) =>
                  setFilters((prev) => ({
                    ...prev,
                    lineDescription: event.target.value,
                  }))
                }
                placeholder="description contains"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                정렬
              </label>
              <select
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={filters.sort}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, sort: event.target.value }))
                }
              >
                <option value="issuedAt,DESC">issuedAt DESC</option>
                <option value="issuedAt,ASC">issuedAt ASC</option>
                <option value="dueAt,DESC">dueAt DESC</option>
                <option value="dueAt,ASC">dueAt ASC</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">
                페이지 사이즈
              </label>
              <select
                className="mt-2 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={filters.size}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, size: event.target.value }))
                }
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={applyFilters}
              className="rounded-md bg-rank-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              조회
            </button>
            <button
              onClick={resetFilters}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              초기화
            </button>
            <button
              onClick={handleCsvDownload}
              className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              CSV 다운로드
            </button>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          {summaryLoading ? (
            <div className="card-primary p-4 text-sm text-slate-600">요약 로딩 중...</div>
          ) : summaryData.length === 0 ? (
            <div className="card-primary p-4 text-sm text-slate-500">
              요약 데이터가 없습니다.
            </div>
          ) : (
            summaryData.slice(0, 3).map((item) => (
              <div key={item.month} className="card-primary p-4">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  {item.month}
                </p>
                <p className="mt-2 text-lg font-semibold text-slate-900">
                  {formatCurrency(item.totalAmount, "KRW")}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.count}건
                </p>
              </div>
            ))
          )}
        </section>

        <section className="card-primary mt-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">인보이스 목록</h2>
            <span className="text-sm text-slate-500">
              총 {listData?.totalElements ?? 0}건
            </span>
          </div>

          {listLoading ? (
            <div className="mt-6 text-sm text-slate-500">목록을 불러오는 중...</div>
          ) : listError ? (
            <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {listError}
            </div>
          ) : content.length === 0 ? (
            <div className="mt-6 text-sm text-slate-500">
              조회 결과가 없습니다.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                    <th className="py-2 pr-4">인보이스 ID</th>
                    <th className="py-2 pr-4">구독 ID</th>
                    <th className="py-2 pr-4">사용자 ID</th>
                    <th className="py-2 pr-4">상태</th>
                    <th className="py-2 pr-4">금액</th>
                    <th className="py-2 pr-4">발행일</th>
                    <th className="py-2 pr-4">만기일</th>
                    <th className="py-2">납부일</th>
                  </tr>
                </thead>
                <tbody>
                  {content.map((invoice) => (
                    <tr
                      key={invoice.invoiceId}
                      className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                      onClick={() => handleSelectInvoice(invoice.invoiceId)}
                    >
                      <td className="py-3 pr-4 font-medium text-slate-900">
                        {invoice.invoiceId}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {invoice.subscriptionId || "-"}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {invoice.userId || "-"}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {invoice.status}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {formatCurrency(invoice.amountDue, invoice.currency)}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {formatDate(invoice.issuedAt)}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">
                        {formatDate(invoice.dueAt)}
                      </td>
                      <td className="py-3 text-slate-600">
                        {formatDate(invoice.paidAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
            <span>
              페이지 {totalPages === 0 ? 0 : currentPage + 1} / {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 0))}
                disabled={currentPage <= 0}
                className="rounded-md border border-slate-200 px-3 py-1 text-sm disabled:opacity-40"
              >
                이전
              </button>
              <button
                onClick={() =>
                  handlePageChange(
                    totalPages > 0 ? Math.min(currentPage + 1, totalPages - 1) : 0
                  )
                }
                disabled={totalPages === 0 || currentPage >= totalPages - 1}
                className="rounded-md border border-slate-200 px-3 py-1 text-sm disabled:opacity-40"
              >
                다음
              </button>
            </div>
          </div>
        </section>

        {selectedInvoiceId && (
          <section className="card-primary mt-6 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                인보이스 상세
              </h3>
              <button
                onClick={handleCloseDetail}
                className="text-sm text-slate-500 hover:text-slate-700"
              >
                닫기
              </button>
            </div>

            {detailLoading ? (
              <div className="mt-4 text-sm text-slate-500">
                상세 정보를 불러오는 중...
              </div>
            ) : detailError ? (
              <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {detailError}
              </div>
            ) : detailData ? (
              <div className="mt-4 space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase text-slate-500">상태</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {detailData.invoice.status}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase text-slate-500">금액</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatCurrency(
                        detailData.invoice.amountDue,
                        detailData.invoice.currency
                      )}
                    </p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase text-slate-500">발행일</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDate(detailData.invoice.issuedAt)}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700">라인</h4>
                  <div className="mt-3 space-y-3">
                    {detailData.lines.map((line) => (
                      <div
                        key={line.lineId}
                        className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-semibold ${getLineTone(
                              line.lineType
                            )}`}
                          >
                            {deriveLineLabel(line)}
                          </span>
                          <span className="text-slate-700">{line.description}</span>
                        </div>
                        <span
                          className={`font-semibold ${
                            line.lineType === "CREDIT" || line.lineType === "REFUND"
                              ? "text-rose-600"
                              : line.lineType === "PRORATION"
                                ? "text-emerald-600"
                                : "text-slate-700"
                          }`}
                        >
                          {formatCurrency(line.amount, line.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-700">차지</h4>
                  {detailData.charges.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-500">차지 내역이 없습니다.</p>
                  ) : (
                    <div className="mt-3 overflow-x-auto">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                            <th className="py-2 pr-4">paymentId</th>
                            <th className="py-2 pr-4">chargeType</th>
                            <th className="py-2 pr-4">paymentType</th>
                            <th className="py-2 pr-4">status</th>
                            <th className="py-2 pr-4">amount</th>
                            <th className="py-2">paidAt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailData.charges.map((charge) => (
                            <tr
                              key={charge.paymentId}
                              className="border-b border-slate-100"
                            >
                              <td className="py-2 pr-4 text-slate-700">
                                {charge.paymentId}
                              </td>
                              <td className="py-2 pr-4 text-slate-600">
                                {charge.chargeType ?? "-"}
                              </td>
                              <td className="py-2 pr-4 text-slate-600">
                                {charge.paymentType}
                              </td>
                              <td className="py-2 pr-4 text-slate-600">
                                {charge.status}
                              </td>
                              <td className="py-2 pr-4 text-slate-600">
                                {formatCurrency(charge.amount, charge.currency)}
                              </td>
                              <td className="py-2 text-slate-600">
                                {formatDate(charge.paidAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-slate-500">
                상세 데이터를 선택해주세요.
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
