import SuccessClient from "./SuccessClient";

interface SuccessPageProps {
  searchParams: Promise<{
    amount?: string;
    orderId?: string;
    orderToken?: string;
    paymentKey?: string;
  }>;
}

export default async function DonateSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;

  return (
    <SuccessClient
      amount={params.amount}
      orderId={params.orderId}
      orderToken={params.orderToken}
      paymentKey={params.paymentKey}
    />
  );
}
