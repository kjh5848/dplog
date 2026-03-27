import { ClientApiResponse } from "@/src/types/payment";
import {
  InvoiceDetailResponse,
  InvoiceListParams,
  InvoiceListResponse,
  InvoiceSummaryItem,
  InvoiceSummaryParams,
} from "@/src/types/invoice";
import { logError, logInfo } from "@/src/utils/logger";

// 클라이언트에서 App Route(`/api/invoices`)를 호출하는 Repository
class InvoiceRepository {
  private static readonly BASE_PATH = "/api/invoices";

  private static readonly FETCH_OPTIONS: RequestInit = {
    credentials: "include" as RequestCredentials,
  };

  private static buildQuery(params: InvoiceListParams = {}): string {
    const searchParams = new URLSearchParams();

    if (params.status) searchParams.set("status", params.status);
    if (params.from) searchParams.set("from", params.from);
    if (params.to) searchParams.set("to", params.to);
    if (params.userId) searchParams.set("userId", params.userId);
    if (params.subscriptionId)
      searchParams.set("subscriptionId", params.subscriptionId);
    if (params.lineType) searchParams.set("lineType", params.lineType);
    if (params.lineDescription)
      searchParams.set("lineDescription", params.lineDescription);
    if (params.format) searchParams.set("format", params.format);
    if (params.page !== undefined) searchParams.set("page", String(params.page));
    if (params.size !== undefined) searchParams.set("size", String(params.size));
    if (params.sort) searchParams.set("sort", params.sort);

    return searchParams.toString();
  }

  static async getInvoiceList(
    params: InvoiceListParams = {}
  ): Promise<ClientApiResponse<InvoiceListResponse>> {
    const query = this.buildQuery({ ...params, format: "json" });
    const url = query ? `${this.BASE_PATH}?${query}` : this.BASE_PATH;

    logInfo("[InvoiceRepository] 인보이스 목록 요청", { url, params });

    const response = await fetch(url, {
      ...this.FETCH_OPTIONS,
      headers: { Accept: "application/json" },
    });

    const payload = (await response
      .json()
      .catch(() => null)) as ClientApiResponse<InvoiceListResponse> | null;

    if (!payload) {
      logError(
        "[InvoiceRepository] 인보이스 목록 응답 파싱 실패",
        new Error("Invalid JSON"),
        { status: response.status }
      );
      return { success: false, error: "인보이스 목록을 불러오지 못했습니다." };
    }

    return payload;
  }

  static async downloadInvoiceCsv(
    params: InvoiceListParams = {}
  ): Promise<string> {
    const query = this.buildQuery({ ...params, format: "csv" });
    const url = query ? `${this.BASE_PATH}?${query}` : `${this.BASE_PATH}?format=csv`;

    logInfo("[InvoiceRepository] 인보이스 CSV 다운로드 요청", { url, params });

    const response = await fetch(url, {
      ...this.FETCH_OPTIONS,
      headers: { Accept: "text/plain" },
    });

    const text = await response.text();

    if (!response.ok) {
      logError(
        "[InvoiceRepository] 인보이스 CSV 다운로드 실패",
        new Error(text || "CSV 다운로드 실패"),
        { status: response.status }
      );
      throw new Error(text || "인보이스 CSV 다운로드에 실패했습니다.");
    }

    return text;
  }

  static async getInvoiceDetail(
    invoiceId: string
  ): Promise<ClientApiResponse<InvoiceDetailResponse>> {
    const url = `${this.BASE_PATH}/${invoiceId}`;
    logInfo("[InvoiceRepository] 인보이스 상세 요청", { url, invoiceId });

    const response = await fetch(url, {
      ...this.FETCH_OPTIONS,
      headers: { Accept: "application/json" },
    });

    const payload = (await response
      .json()
      .catch(() => null)) as ClientApiResponse<InvoiceDetailResponse> | null;

    if (!payload) {
      logError(
        "[InvoiceRepository] 인보이스 상세 응답 파싱 실패",
        new Error("Invalid JSON"),
        { status: response.status }
      );
      return { success: false, error: "인보이스 정보를 불러오지 못했습니다." };
    }

    return payload;
  }

  static async getInvoiceSummary(
    params: InvoiceSummaryParams = {}
  ): Promise<ClientApiResponse<InvoiceSummaryItem[]>> {
    const searchParams = new URLSearchParams();
    if (params.status) searchParams.set("status", params.status);
    if (params.from) searchParams.set("from", params.from);
    if (params.to) searchParams.set("to", params.to);

    const url = searchParams.toString()
      ? `${this.BASE_PATH}/summary?${searchParams.toString()}`
      : `${this.BASE_PATH}/summary`;

    logInfo("[InvoiceRepository] 인보이스 요약 요청", { url, params });

    const response = await fetch(url, {
      ...this.FETCH_OPTIONS,
      headers: { Accept: "application/json" },
    });

    const payload = (await response
      .json()
      .catch(() => null)) as ClientApiResponse<InvoiceSummaryItem[]> | null;

    if (!payload) {
      logError(
        "[InvoiceRepository] 인보이스 요약 응답 파싱 실패",
        new Error("Invalid JSON"),
        { status: response.status }
      );
      return { success: false, error: "인보이스 요약 정보를 불러오지 못했습니다." };
    }

    return payload;
  }
}

export default InvoiceRepository;
