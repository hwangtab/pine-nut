import { NextRequest, NextResponse } from "next/server";
import {
  getTossSecretKey,
  validateDonationAmount,
  verifyDonationOrderToken,
} from "@/lib/toss-payments";

interface TossConfirmResponse {
  approvedAt?: string;
  method?: string;
  orderId: string;
  receipt?: { url?: string };
  totalAmount?: number;
}

export async function POST(request: NextRequest) {
  let body: {
    amount?: number;
    orderId?: string;
    orderToken?: string;
    paymentKey?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const orderId = body.orderId?.trim();
  const orderToken = body.orderToken?.trim();
  const paymentKey = body.paymentKey?.trim();

  if (!orderId || !orderToken || !paymentKey) {
    return NextResponse.json({ error: "결제 확인 정보가 부족합니다." }, { status: 400 });
  }

  let amount: number;
  try {
    amount = validateDonationAmount(body.amount);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "후원 금액이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  let tokenPayload: ReturnType<typeof verifyDonationOrderToken>;
  try {
    tokenPayload = verifyDonationOrderToken(orderToken);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "주문 토큰 검증에 실패했습니다." },
      { status: 400 }
    );
  }

  if (tokenPayload.orderId !== orderId || tokenPayload.amount !== amount) {
    return NextResponse.json(
      { error: "결제 금액 또는 주문번호가 준비된 주문과 일치하지 않습니다." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${getTossSecretKey()}:`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        orderId,
        paymentKey,
      }),
      cache: "no-store",
    });

    const data = (await response.json()) as
      | TossConfirmResponse
      | { code?: string; message?: string };

    if (!response.ok) {
      return NextResponse.json(
        {
          code: "code" in data ? data.code : undefined,
          error: "message" in data && data.message ? data.message : "토스 결제 승인에 실패했습니다.",
        },
        { status: response.status }
      );
    }

    const confirmed = data as TossConfirmResponse;

    return NextResponse.json({
      amount: confirmed.totalAmount ?? amount,
      approvedAt: confirmed.approvedAt ?? null,
      method: confirmed.method ?? null,
      orderId: confirmed.orderId,
      receiptUrl: confirmed.receipt?.url ?? null,
      success: true,
    });
  } catch (error) {
    console.error("Failed to confirm toss payment:", error);
    return NextResponse.json(
      { error: "결제 승인 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
