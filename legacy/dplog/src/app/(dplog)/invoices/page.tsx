import { Metadata } from "next";
import InvoiceClientPage from "@/src/components/invoices/InvoiceClientPage";

export const metadata: Metadata = {
  title: "인보이스 관리 | D-PLOG",
  description: "관리자 전용 인보이스/차지/구독 청구 내역 페이지",
};

export default function InvoicesPage() {
  return <InvoiceClientPage />;
}
