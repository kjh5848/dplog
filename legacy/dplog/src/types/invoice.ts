// 인보이스/차지/구독 프런트 연동용 타입

export type InvoiceStatus = "PENDING" | "PAID" | "VOID" | "REFUNDED";

export type InvoiceLineType =
  | "MEMBERSHIP"
  | "PRORATION"
  | "DISCOUNT"
  | "CREDIT"
  | "ADJUSTMENT"
  | "REFUND";

export type InvoiceChargeType =
  | "INITIAL"
  | "RECURRING"
  | "RETRY"
  | "ONE_TIME"
  | "UPGRADE"
  | "PRORATION"
  | "ADJUSTMENT"
  | "REFUND";

export type InvoicePaymentType =
  | "INITIAL"
  | "RECURRING"
  | "RETRY"
  | "ONE_TIME"
  | "UPGRADE"
  | "DOWNGRADE";

export type InvoiceChargeStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "CANCELLED"
  | "PARTIAL_CANCELLED"
  | "REFUNDED";

export interface Invoice {
  invoiceId: string;
  subscriptionId?: string;
  userId?: string;
  status: InvoiceStatus;
  amountDue: number;
  currency: string;
  issuedAt: string; // ISO-8601 (yyyy-MM-dd)
  dueAt?: string | null; // ISO-8601
  paidAt?: string | null; // ISO-8601
}

export interface InvoiceLine {
  lineId: string;
  invoiceId: string;
  lineType: InvoiceLineType;
  lineTypeLabel?: string | null;
  description: string;
  amount: number;
  currency: string;
}

export interface InvoiceCharge {
  paymentId: string;
  invoiceId: string;
  userId?: string;
  chargeType?: InvoiceChargeType | null;
  paymentType: InvoicePaymentType;
  status: InvoiceChargeStatus;
  amount: number;
  currency: string;
  paidAt?: string | null;
}

export interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size?: number;
  number?: number;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  empty?: boolean;
}

export interface InvoiceListResponse extends PageableResponse<Invoice> {}

export interface InvoiceDetailResponse {
  invoice: Invoice;
  lines: InvoiceLine[];
  charges: InvoiceCharge[];
}

export type InvoiceListFormat = "json" | "csv";

export interface InvoiceListParams {
  status?: InvoiceStatus;
  from?: string;
  to?: string;
  userId?: string;
  subscriptionId?: string;
  lineType?: InvoiceLineType;
  lineDescription?: string;
  format?: InvoiceListFormat;
  page?: number;
  size?: number;
  sort?: string;
}

export interface InvoiceSummaryItem {
  month: string;
  totalAmount: number;
  count: number;
}

export interface InvoiceSummaryParams {
  from?: string;
  to?: string;
  status?: InvoiceStatus;
}
