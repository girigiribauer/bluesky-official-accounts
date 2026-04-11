"use client";

import { useState, useRef } from "react";
import { fetchWithTimeout } from "src/lib/fetchWithTimeout";

export type BlueskyCheckState = "idle" | "checking" | "new" | "registered" | "invalid";

export type ResolvedAccount = {
  did: string;
  handle: string;
  displayName: string;
};

export type ExistingData = {
  name: string;
  category: string;
  source: string;
  twitter: string;
  status: string;
};

export const useBlueskyCheck = () => {
  const [blueskyInput, setBlueskyInput] = useState("");
  const [checkState, setCheckState] = useState<BlueskyCheckState>("idle");
  const [resolvedAccount, setResolvedAccount] = useState<ResolvedAccount | null>(null);
  const [existingData, setExistingData] = useState<ExistingData | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runCheck = async (input: string) => {
    if (!input.trim()) return;
    setCheckState("checking");
    setResolvedAccount(null);
    setExistingData(null);
    try {
      const res = await fetchWithTimeout(
        `/api/contribution/register/check?actor=${encodeURIComponent(input.trim())}`
      );
      if (!res.ok) { setCheckState("idle"); return; }
      const data = await res.json();
      if (data.status === "new") {
        setResolvedAccount({ did: data.did, handle: data.handle, displayName: data.displayName });
        setCheckState("new");
      } else if (data.status === "registered") {
        setResolvedAccount({ did: data.did, handle: data.handle, displayName: data.displayName });
        setExistingData(data.existing);
        setCheckState("registered");
      } else {
        setCheckState("invalid");
      }
    } catch {
      setCheckState("idle");
    }
  };

  const handleInputChange = (value: string) => {
    setBlueskyInput(value);
    setCheckState("idle");
    setResolvedAccount(null);
    setExistingData(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) return;
    debounceRef.current = setTimeout(() => runCheck(value), 800);
  };

  return {
    blueskyInput,
    checkState,
    resolvedAccount,
    existingData,
    handleInputChange,
  };
};
