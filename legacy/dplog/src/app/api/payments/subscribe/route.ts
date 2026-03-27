import { NextResponse } from "next/server";

export async function POST(): Promise<Response> {
  return NextResponse.json(
    {
      success: false,
      error: "정기결제 예약 API는 현재 비활성화되어 있습니다.",
      code: 501,
    },
    { status: 501 }
  );
}
