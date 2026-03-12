import { NextRequest, NextResponse } from "next/server";
import { createDonationOrder, validateDonationAmount } from "@/lib/toss-payments";

export async function POST(request: NextRequest) {
  let body: { amount?: number };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  try {
    const amount = validateDonationAmount(body.amount);
    const order = createDonationOrder(amount);

    return NextResponse.json(order, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "후원 주문 생성에 실패했습니다.",
      },
      { status: 400 }
    );
  }
}
