import FailClient from "./FailClient";

interface FailPageProps {
  searchParams: Promise<{
    code?: string;
    message?: string;
  }>;
}

export default async function DonateFailPage({ searchParams }: FailPageProps) {
  const params = await searchParams;

  return <FailClient code={params.code} message={params.message} />;
}
