"use client";

import { useState } from "react";

export function ModerationLogin() {
  const [handle, setHandle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/moderation_beta/oauth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle }),
      });
      if (!res.ok) throw new Error("ログインに失敗しました");
      const { url } = await res.json();
      window.location.href = url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "エラーが発生しました");
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>ログイン</h1>
      <p>モデレーションサイトにアクセスするには、Blueskyアカウントでログインしてください。</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Blueskyハンドル（例: example.bsky.social）"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          disabled={loading}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "ログイン中..." : "Blueskyでログイン"}
        </button>
      </form>
      {error && <p>{error}</p>}
    </main>
  );
}
