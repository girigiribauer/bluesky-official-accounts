"use client";

import { useEffect, useState } from "react";
import styles from "./HealthIndicator.module.scss";

type Health = { ok: boolean; dbLatencyMs?: number };

export function HealthIndicator() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    let aborted = false;

    (async () => {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const data = await res.json();
        if (!aborted) {
          setHealth({ ok: res.ok && data.ok === true, dbLatencyMs: data.dbLatencyMs });
        }
      } catch {
        if (!aborted) setHealth({ ok: false });
      }
    })();

    return () => {
      aborted = true;
    };
  }, []);

  // 取得できるまでは何も出さない
  if (!health) return null;

  const label = health.ok
    ? `DB 接続 OK（往復 ${health.dbLatencyMs}ms）`
    : "DB 接続を確認できません";

  return (
    <span
      className={[styles.dot, health.ok ? styles.ok : styles.ng].join(" ")}
      title={label}
      role="img"
      aria-label={label}
    />
  );
}
