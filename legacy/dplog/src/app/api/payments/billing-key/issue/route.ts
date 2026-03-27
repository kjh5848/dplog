import { NextResponse } from "next/server";
import PortoneService from "@/lib/services/portoneService";
import { logError } from "@/src/utils/logger";
import {
  ClientApiResponse,
  ManualBillingKeyIssueRequest,
  ManualBillingKeyIssueResponse,
} from "@/src/types/payment";

function normalizeIssueRequest(
  body: ManualBillingKeyIssueRequest
): ManualBillingKeyIssueRequest {
  const sanitizedCardNumber = (body.cardNumber || "").replace(/\s+/g, "");
  const sanitizedBirth =
    (body.birthOrBusinessRegistrationNumber || "").replace(/\D/g, "");
  const sanitizedPhone = (body.customerPhone || "").replace(/\D/g, "");

  return {
    issueId: body.issueId,
    issueName: body.issueName,
    customerId: body.customerId,
    customerName: body.customerName.trim(),
    customerEmail: body.customerEmail.trim(),
    customerPhone: sanitizedPhone,
    cardNumber: sanitizedCardNumber,
    expiryMonth: (body.expiryMonth || "").padStart(2, "0"),
    expiryYear: (body.expiryYear || "").padStart(2, "0"),
    birthOrBusinessRegistrationNumber: sanitizedBirth,
    passwordTwoDigits: (body.passwordTwoDigits || "").slice(0, 2),
  };
}

function validateIssueRequest(
  body: ManualBillingKeyIssueRequest
): string | null {
  if (!body.customerId) {
    return "고객 식별자가 필요합니다";
  }

  if (!body.customerName) {
    return "고객 이름이 필요합니다";
  }

  if (!body.customerEmail) {
    return "고객 이메일이 필요합니다";
  }

  const phone = (body.customerPhone || "").replace(/\D/g, "");
  if (!phone || phone.length < 9) {
    return "고객 연락처가 필요합니다";
  }

  const cardNumber = (body.cardNumber || "").replace(/\s+/g, "");
  if (!cardNumber || cardNumber.length < 14) {
    return "유효한 카드 번호를 입력해주세요";
  }

  if (!body.expiryMonth || !body.expiryYear) {
    return "유효기간을 입력해주세요";
  }

  if (!/^\d{2}$/.test(body.expiryMonth) || !/^\d{2}$/.test(body.expiryYear)) {
    return "유효기간은 2자리 숫자여야 합니다";
  }

  const birth = (body.birthOrBusinessRegistrationNumber || "").replace(
    /\D/g,
    ""
  );
  if (birth.length < 6) {
    return "생년월일(또는 사업자번호)을 정확히 입력해주세요";
  }

  if (!/^\d{2}$/.test(body.passwordTwoDigits || "")) {
    return "카드 비밀번호 앞 2자리를 입력해주세요";
  }

  return null;
}

export async function POST(
  request: Request
): Promise<NextResponse<ClientApiResponse<ManualBillingKeyIssueResponse>>> {
  try {
    const body = (await request.json()) as ManualBillingKeyIssueRequest;
    const validationError = validateIssueRequest(body);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
          code: 400,
        },
        { status: 400 }
      );
    }

    const normalized = normalizeIssueRequest(body);
    const result = await PortoneService.issueBillingKeyWithCard(normalized);

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          code: result.status,
        },
        { status: result.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logError("[BillingKeyIssueRoute] 처리 오류", error as Error);
    return NextResponse.json(
      {
        success: false,
        error: "빌링키 발급 중 오류가 발생했습니다",
        code: 500,
      },
      { status: 500 }
    );
  }
}
