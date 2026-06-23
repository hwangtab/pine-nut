"use client";

import { useEffect, useRef, useState } from "react";
import {
  fetchSignatureSummary,
  type PublicSignature,
} from "@/lib/signatures/client";

const MAX_TOASTS = 5;
const INITIAL_DELAY_MS = 5000;
const TOAST_INTERVAL_MS = 8000;
const TOAST_DISPLAY_MS = 4000;

export function useHomeSignatureActivity() {
  const [signatureCount, setSignatureCount] = useState<number | null>(null);
  const [recentSignatures, setRecentSignatures] = useState<PublicSignature[]>([]);
  const [toastName, setToastName] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const toastCountRef = useRef(0);

  useEffect(() => {
    fetchSignatureSummary()
      .then((data) => {
        setSignatureCount(data.count);
        if (data.signatures.length > 0) setRecentSignatures(data.signatures);
      })
      .catch(() => {
        /* graceful degradation: hide signature count and social proof */
      });
  }, []);

  useEffect(() => {
    if (recentSignatures.length === 0) return;

    const showToast = () => {
      if (toastCountRef.current >= MAX_TOASTS) return;
      const randomSig =
        recentSignatures[Math.floor(Math.random() * recentSignatures.length)];
      setToastName(randomSig.name);
      setToastVisible(true);
      toastCountRef.current += 1;

      setTimeout(() => {
        setToastVisible(false);
      }, TOAST_DISPLAY_MS);
    };

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const initialTimer = setTimeout(() => {
      showToast();
      intervalId = setInterval(() => {
        if (toastCountRef.current >= MAX_TOASTS) {
          if (intervalId) clearInterval(intervalId);
          return;
        }
        showToast();
      }, TOAST_INTERVAL_MS);
    }, INITIAL_DELAY_MS);

    return () => {
      clearTimeout(initialTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [recentSignatures]);

  return {
    signatureCount,
    setSignatureCount,
    toastName,
    toastVisible,
  };
}
