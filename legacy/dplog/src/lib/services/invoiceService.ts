import { proxyBackendJson, proxyToBackend } from "@/src/utils/server/apiProxy";
import { logError, logInfo } from "@/src/utils/logger";
import { BackendApiResponse } from "@/src/types/payment";
import {
  InvoiceDetailResponse,
  InvoiceListFormat,
  InvoiceListResponse,
  InvoiceLineType,
  InvoiceStatus,
  InvoiceSummaryItem,
} from "@/src/types/invoice";

type InvoiceListSuccess =
  | { ok: true; status: number; format: "json"; data: InvoiceListResponse }
  | { ok: true; status: number; format: "csv"; text: string };

type InvoiceListFailure = { ok: false; status: number; message: string };

type InvoiceDetailResult =
  | { ok: true; status: number; data: InvoiceDetailResponse }
  | { ok: false; status: number; message: string };

type InvoiceSummaryResult =
  | { ok: true; status: number; data: InvoiceSummaryItem[] }
  | { ok: false; status: number; message: string };

const ALLOWED_STATUS: InvoiceStatus[] = ["PENDING", "PAID", "VOID", "REFUNDED"];
const ALLOWED_LINE_TYPES: InvoiceLineType[] = [
  "MEMBERSHIP",
  "PRORATION",
  "DISCOUNT",
  "CREDIT",
  "ADJUSTMENT",
  "REFUND",
];

function isIsoDate(value: string | null): value is string {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function normalizeFormat(value: string | null): InvoiceListFormat {
  if (!value) return "json";
  return value.toLowerCase() === "csv" ? "csv" : "json";
}

function parseInteger(value: string | null): number | undefined {
  if (value === null) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export class InvoiceService {
  private static readonly BASE_PATH = "/v1/invoices";

  private static parseListQuery(
    request: Request
  ):
    | { ok: true; format: InvoiceListFormat; search: string }
    | InvoiceListFailure {
    const url = new URL(request.url);
    const params = url.searchParams;

    const format = normalizeFormat(params.get("format"));
    const status = params.get("status");
    const from = params.get("from");
    const to = params.get("to");
    const userId = params.get("userId");
    const subscriptionId = params.get("subscriptionId");
    const lineType = params.get("lineType");
    const lineDescription = params.get("lineDescription");
    const sort = params.get("sort");
    const page = parseInteger(params.get("page"));
    const size = parseInteger(params.get("size"));

    if (status && !ALLOWED_STATUS.includes(status as InvoiceStatus)) {
      return { ok: false, status: 400, message: "유효하지 않은 status 값입니다." };
    }

    if (from && !isIsoDate(from)) {
      return { ok: false, status: 400, message: "from 값은 yyyy-MM-dd 형식이어야 합니다." };
    }

    if (to && !isIsoDate(to)) {
      return { ok: false, status: 400, message: "to 값은 yyyy-MM-dd 형식이어야 합니다." };
    }

    if (lineType && !ALLOWED_LINE_TYPES.includes(lineType as InvoiceLineType)) {
      return { ok: false, status: 400, message: "유효하지 않은 lineType 값입니다." };
    }

    if (page !== undefined && page < 0) {
      return { ok: false, status: 400, message: "page 값은 0 이상이어야 합니다." };
    }

    if (size !== undefined && size <= 0) {
      return { ok: false, status: 400, message: "size 값은 1 이상이어야 합니다." };
    }

    const normalized = new URLSearchParams();

    if (status) normalized.set("status", status);
    if (from) normalized.set("from", from);
    if (to) normalized.set("to", to);
    if (userId) normalized.set("userId", userId);
    if (subscriptionId) normalized.set("subscriptionId", subscriptionId);
    if (lineType) normalized.set("lineType", lineType);
    if (lineDescription) normalized.set("lineDescription", lineDescription);
    if (sort) normalized.set("sort", sort);
    if (page !== undefined) normalized.set("page", String(page));
    if (size !== undefined) normalized.set("size", String(size));
    normalized.set("format", format);

    return { ok: true, format, search: normalized.toString() };
  }

  private static parseSummaryQuery(
    request: Request
  ): { ok: true; search: string } | InvoiceListFailure {
    const url = new URL(request.url);
    const params = url.searchParams;

    const status = params.get("status");
    const from = params.get("from");
    const to = params.get("to");

    if (status && !ALLOWED_STATUS.includes(status as InvoiceStatus)) {
      return { ok: false, status: 400, message: "유효하지 않은 status 값입니다." };
    }

    if (from && !isIsoDate(from)) {
      return { ok: false, status: 400, message: "from 값은 yyyy-MM-dd 형식이어야 합니다." };
    }

    if (to && !isIsoDate(to)) {
      return { ok: false, status: 400, message: "to 값은 yyyy-MM-dd 형식이어야 합니다." };
    }

    const normalized = new URLSearchParams();
    if (status) normalized.set("status", status);
    if (from) normalized.set("from", from);
    if (to) normalized.set("to", to);

    return { ok: true, search: normalized.toString() };
  }

  static async getInvoices(request: Request): Promise<InvoiceListSuccess | InvoiceListFailure> {
    const parsed = this.parseListQuery(request);

    if (!parsed.ok) {
      return parsed;
    }

    const targetPath = parsed.search
      ? `${this.BASE_PATH}?${parsed.search}`
      : this.BASE_PATH;

    if (parsed.format === "csv") {
      const upstream = await proxyToBackend(targetPath, {
        method: "GET",
        headers: { Accept: "text/plain" },
        cache: "no-store",
        label: "invoice-list-csv",
      });

      const text = await upstream.text();

      if (!upstream.ok) {
        logError(
          "[InvoiceService] 인보이스 CSV 조회 실패",
          new Error(text || "Upstream CSV error"),
          { status: upstream.status }
        );

        return {
          ok: false,
          status: upstream.status || 500,
          message: text || "인보이스 CSV를 가져오지 못했습니다.",
        };
      }

      logInfo("[InvoiceService] 인보이스 CSV 조회 성공", {
        status: upstream.status,
      });

      return { ok: true, status: upstream.status || 200, format: "csv", text };
    }

    const upstream = await proxyBackendJson<BackendApiResponse<InvoiceListResponse>>(
      targetPath,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        label: "invoice-list",
      }
    );

    const payload = (upstream.data as any) ?? null;
    const data = payload?.data ?? payload;

    if (!upstream.ok || !data?.content) {
      logError(
        "[InvoiceService] 인보이스 목록 조회 실패",
        new Error("Upstream error"),
        { status: upstream.status, body: upstream.text }
      );

      const message =
        (payload && (payload.message || payload.error)) ||
        upstream.text ||
        "인보이스 목록을 가져오지 못했습니다.";

      return {
        ok: false,
        status: upstream.status || 500,
        message,
      };
    }

    logInfo("[InvoiceService] 인보이스 목록 조회 성공", {
      count: Array.isArray(data.content) ? data.content.length : 0,
    });

    return {
      ok: true,
      status: upstream.status || 200,
      format: "json",
      data: data as InvoiceListResponse,
    };
  }

  static async getInvoiceDetail(
    invoiceId: string
  ): Promise<InvoiceDetailResult> {
    if (!invoiceId || typeof invoiceId !== "string") {
      return { ok: false, status: 400, message: "invoiceId가 필요합니다." };
    }

    const targetPath = `${this.BASE_PATH}/${encodeURIComponent(invoiceId)}`;

    const upstream = await proxyBackendJson<BackendApiResponse<InvoiceDetailResponse>>(
      targetPath,
      {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
        label: "invoice-detail",
      }
    );

    const payload = (upstream.data as any) ?? null;
    const data = payload?.data ?? payload;

    if (!upstream.ok || !data?.invoice) {
      logError(
        "[InvoiceService] 인보이스 상세 조회 실패",
        new Error("Upstream error"),
        { status: upstream.status, body: upstream.text }
      );

      const status = upstream.status || 500;
      const message =
        (payload && (payload.message || payload.error)) ||
        upstream.text ||
        "인보이스 정보를 불러오지 못했습니다.";

      return { ok: false, status, message };
    }

    logInfo("[InvoiceService] 인보이스 상세 조회 성공", {
      invoiceId: data.invoice?.invoiceId,
      lineCount: Array.isArray(data.lines) ? data.lines.length : 0,
    });

    return {
      ok: true,
      status: upstream.status || 200,
      data: data as InvoiceDetailResponse,
    };
  }

  static async getInvoiceSummary(request: Request): Promise<InvoiceSummaryResult> {
    const parsed = this.parseSummaryQuery(request);

    if (!parsed.ok) {
      return parsed;
    }

    const targetPath = parsed.search
      ? `${this.BASE_PATH}/summary?${parsed.search}`
      : `${this.BASE_PATH}/summary`;

    const upstream = await proxyBackendJson<
      BackendApiResponse<InvoiceSummaryItem[]>
    >(targetPath, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      label: "invoice-summary",
    });

    const payload = (upstream.data as any) ?? null;
    const data = payload?.data ?? payload;

    if (!upstream.ok || !Array.isArray(data)) {
      logError(
        "[InvoiceService] 인보이스 요약 조회 실패",
        new Error("Upstream error"),
        { status: upstream.status, body: upstream.text }
      );

      const message =
        (payload && (payload.message || payload.error)) ||
        upstream.text ||
        "인보이스 요약을 가져오지 못했습니다.";

      return {
        ok: false,
        status: upstream.status || 500,
        message,
      };
    }

    logInfo("[InvoiceService] 인보이스 요약 조회 성공", {
      count: data.length,
    });

    return {
      ok: true,
      status: upstream.status || 200,
      data: data as InvoiceSummaryItem[],
    };
  }
}
