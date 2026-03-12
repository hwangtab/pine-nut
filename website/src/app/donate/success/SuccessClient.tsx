"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, ReceiptText } from "lucide-react";

interface DonationConfirmResult {
  amount: number;
  approvedAt: string | null;
  method: string | null;
  orderId: string;
  receiptUrl: string | null;
  success: true;
}

interface SuccessClientProps {
  amount: string | undefined;
  orderId: string | undefined;
  orderToken: string | undefined;
  paymentKey: string | undefined;
}

export default function SuccessClient({
  amount,
  orderId,
  orderToken,
  paymentKey,
}: SuccessClientProps) {
  const [error, setError] = useState("");
  const [result, setResult] = useState<DonationConfirmResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function confirmPayment() {
      if (!paymentKey || !orderId || !orderToken || !amount) {
        setError("결제 확인에 필요한 정보가 부족합니다.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/donations/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: Number(amount),
            orderId,
            orderToken,
            paymentKey,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "결제 승인에 실패했습니다.");
        }

        if (!cancelled) {
          setResult(data as DonationConfirmResult);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "결제 확인 중 오류가 발생했습니다."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    confirmPayment();

    return () => {
      cancelled = true;
    };
  }, [amount, orderId, orderToken, paymentKey]);

  const approvedAtText = useMemo(() => {
    if (!result?.approvedAt) return null;
    try {
      return new Date(result.approvedAt).toLocaleString("ko-KR");
    } catch {
      return result.approvedAt;
    }
  }, [result?.approvedAt]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-24">
      <div className="max-w-xl mx-auto bg-white border border-[var(--color-border)] rounded-3xl p-8 sm:p-10 text-center">
        {loading ? (
          <>
            <Loader2 className="w-10 h-10 animate-spin text-[var(--color-warm)] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">결제를 확인하는 중입니다</h1>
            <p className="text-[var(--color-text-muted)]">
              토스 결제 승인을 완료하고 있습니다. 잠시만 기다려주세요.
            </p>
          </>
        ) : error ? (
          <>
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-3">결제 확인이 완료되지 않았습니다</h1>
            <p className="text-[var(--color-text-muted)] mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/donate"
                className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-[var(--color-warm)] text-white font-semibold"
              >
                후원 페이지로 돌아가기
              </Link>
              <a
                href="tel:010-8918-8933"
                className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-[var(--color-bg-warm)] text-[var(--color-text)] font-semibold"
              >
                문의하기
              </a>
            </div>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-12 h-12 text-[var(--color-forest)] mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">후원이 완료되었습니다</h1>
            <p className="text-[var(--color-text-muted)] mb-6">
              주민들의 싸움에 힘을 보태주셔서 감사합니다.
            </p>

            <div className="bg-[var(--color-bg)] rounded-2xl px-5 py-4 text-left space-y-2 mb-6">
              <p className="text-sm text-[var(--color-text-muted)]">후원 금액</p>
              <p className="text-3xl font-black text-[var(--color-text)]">
                {result?.amount.toLocaleString("ko-KR")}원
              </p>
              {approvedAtText ? (
                <p className="text-sm text-[var(--color-text-muted)]">승인 시각: {approvedAtText}</p>
              ) : null}
              {result?.orderId ? (
                <p className="text-sm text-[var(--color-text-muted)]">주문번호: {result.orderId}</p>
              ) : null}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/share"
                className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-[var(--color-warm)] text-white font-semibold"
              >
                카드뉴스 공유하기
              </Link>
              {result?.receiptUrl ? (
                <a
                  href={result.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 rounded-xl bg-[var(--color-bg-warm)] text-[var(--color-text)] font-semibold"
                >
                  <ReceiptText className="w-4 h-4" />
                  영수증 보기
                </a>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
