"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchSignatureSummary,
  type PublicSignature,
} from "@/lib/signatures/client";

export function usePetitionSignatureSummary() {
  const [signatureCount, setSignatureCount] = useState(0);
  const [signatures, setSignatures] = useState<PublicSignature[]>([]);
  const [loadingSignatures, setLoadingSignatures] = useState(true);

  const refreshSignatures = useCallback(async () => {
    try {
      const data = await fetchSignatureSummary();
      setSignatureCount(data.count);
      setSignatures(data.signatures);
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
