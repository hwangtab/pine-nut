import "server-only";

import { createHmac, randomUUID } from "crypto";

const ORDER_TOKEN_MAX_AGE_MS = 1000 * 60 * 30;
const MIN_DONATION_AMOUNT = 1000;
const MAX_DONATION_AMOUNT = 500000;

interface DonationOrderPayload {
  amount: number;
  createdAt: number;
  orderId: string;
}

function getRequiredEnv(name: "TOSS_PAYMENTS_SECRET_KEY" | "TOSS_PAYMENTS_ORDER_SECRET") {
  const fallback =
    name === "TOSS_PAYMENTS_ORDER_SECRET"
      ? process.env.TOSS_PAYMENTS_ORDER_SECRET || process.env.TOSS_PAYMENTS_SECRET_KEY
      : process.env.TOSS_PAYMENTS_SECRET_KEY;

  const value = fallback?.trim();
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function toBase64Url(value: string) {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

function signPayload(payload: DonationOrderPayload) {
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = createHmac("sha256", getRequiredEnv("TOSS_PAYMENTS_ORDER_SECRET"))
    .update(encodedPayload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  return `${encodedPayload}.${signature}`;
}

export function validateDonationAmount(rawAmount: unknown) {
  const amount = typeof rawAmount === "number" ? rawAmount : Number(rawAmount);

  if (!Number.isInteger(amount)) {
    throw new Error("후원 금액은 정수여야 합니다.");
  }
  if (amount < MIN_DONATION_AMOUNT) {
    throw new Error(`후원 금액은 최소 ${MIN_DONATION_AMOUNT.toLocaleString("ko-KR")}원부터 가능합니다.`);
  }
  if (amount > MAX_DONATION_AMOUNT) {
    throw new Error(`후원 금액은 최대 ${MAX_DONATION_AMOUNT.toLocaleString("ko-KR")}원까지 가능합니다.`);
  }

  return amount;
}

export function createDonationOrder(amount: number) {
  const orderId = `donation_${randomUUID()}`;
  const orderName = "풍천리 주민 후원";
  const orderToken = signPayload({
    amount,
    createdAt: Date.now(),
    orderId,
  });

  return {
    amount,
    orderId,
    orderName,
    orderToken,
  };
}

export function verifyDonationOrderToken(orderToken: string) {
  const [encodedPayload, providedSignature] = orderToken.split(".");

  if (!encodedPayload || !providedSignature) {
    throw new Error("유효하지 않은 주문 토큰입니다.");
  }

  const expectedSignature = createHmac("sha256", getRequiredEnv("TOSS_PAYMENTS_ORDER_SECRET"))
    .update(encodedPayload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  if (expectedSignature !== providedSignature) {
    throw new Error("주문 토큰 검증에 실패했습니다.");
  }

  let payload: DonationOrderPayload;
  try {
    payload = JSON.parse(fromBase64Url(encodedPayload)) as DonationOrderPayload;
  } catch {
    throw new Error("주문 토큰을 해석할 수 없습니다.");
  }

  if (!payload.orderId || !payload.createdAt || !payload.amount) {
    throw new Error("주문 토큰 값이 올바르지 않습니다.");
  }

  if (Date.now() - payload.createdAt > ORDER_TOKEN_MAX_AGE_MS) {
    throw new Error("주문 토큰이 만료되었습니다. 다시 시도해주세요.");
  }

  return payload;
}

export function getTossSecretKey() {
  return getRequiredEnv("TOSS_PAYMENTS_SECRET_KEY");
}
