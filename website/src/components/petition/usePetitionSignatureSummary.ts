"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchSignatureSummary } from "@/lib/signatures/client";

// NOTE(Task 5 compile-keeping shim): `GET /api/signatures` no longer returns
// a `signatures[]` list (Task 3/4 moved recent-signature listing to the
// dedicated `/api/signatures/wall` endpoint). This local type + the always-
// empty `signatures` state below are a stopgap so this hook still compiles
// against the new `SignatureSummary` shape. Rewiring `RecentSignatures`/this
// hook onto `fetchSignatureWall` is Task 12's job, not done here.
interface LegacyRecentSignature {
  name: string;
  message?: string;
  created_at: string;
}

export function usePetitionSignatureSummary() {
  const [signatureCount, setSignatureCount] = useState(0);
  const [signatures] = useState<LegacyRecentSignature[]>([]);
  const [loadingSignatures, setLoadingSignatures] = useState(true);

  const refreshSignatures = useCallback(async () => {
    try {
      const data = await fetchSignatureSummary();
      setSignatureCount(data.count);
    } catch (err) {
      console.error("Failed to fetch signatures:", err);
    } finally {
      setLoadingSignatures(false);
    }
  }, []);

  useEffect(() => {
    refreshSignatures();
  }, [refreshSignatures]);

  return {
    signatureCount,
    setSignatureCount,
    signatures,
    loadingSignatures,
    refreshSignatures,
  };
}
