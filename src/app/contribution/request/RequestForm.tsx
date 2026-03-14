"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";

const isValidTwitterUrl = (url: string) =>
  /^https:\/\/(x|twitter)\.com\/[A-Za-z0-9_]{1,15}(\/.*)?$/.test(url.trim());

const normalizeUrl = (url: string) =>
  url
    .replace(/^http:\/\//, "https://")
    .replace(/^https:\/\/twitter\.com\//, "https://x.com/");

const FETCH_TIMEOUT_MS = 10000;

const fetchWithTimeout = async (url: string, options?: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

type UrlCheckState = "idle" | "checking" | "valid" | "duplicate";
type SubmitState = "idle" | "submitting" | "error";

export const RequestForm = () => {
  const router = useRouter();
  const [twitterUrl, setTwitterUrl] = useState("");
  const [twitterName, setTwitterName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [twitterUrlTouched, setTwitterUrlTouched] = useState(false);
  const [twitterUrlFocused, setTwitterUrlFocused] = useState(false);
  const [urlCheckState, setUrlCheckState] = useState<UrlCheckState>("idle");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const urlFormatError = twitterUrlTouched && !twitterUrlFocused && twitterUrl.length > 0 && !isValidTwitterUrl(twitterUrl);
  const urlHasError = urlFormatError || urlCheckState === "duplicate";
  const canSubmit =
    urlCheckState === "valid" &&
    twitterName.trim().length > 0 &&
    submitState !== "submitting";

  const runCheck = async (url: string) => {
    const normalized = normalizeUrl(url);
    if (!isValidTwitterUrl(normalized)) return;

    setUrlCheckState("checking");
    try {
      const res = await fetchWithTimeout(`/api/contribution/request/check?url=${encodeURIComponent(normalized.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setUrlCheckState(data.duplicate === true ? "duplicate" : "valid");
      }
    } catch {
      // チェック失敗は無視（submit 時に再チェックされる）
      setUrlCheckState("idle");
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTwitterUrl(value);
    setUrlCheckState("idle");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) return;

    debounceRef.current = setTimeout(() => runCheck(value), 800);
  };

  const handleUrlBlur = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const normalized = normalizeUrl(twitterUrl);
    setTwitterUrl(normalized);
    setTwitterUrlTouched(true);
    setTwitterUrlFocused(false);
    if (urlCheckState === "idle") runCheck(normalized);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitState("submitting");
    setErrorMessage("");

    try {
      const res = await fetchWithTimeout("/api/contribution/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ twitterUrl: twitterUrl.trim(), twitterName: twitterName.trim(), website: honeypot }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "送信に失敗しました");
      }

      router.push("/contribution/request/complete");
    } catch (err) {
      setSubmitState("error");
      setErrorMessage(
        err instanceof Error && err.name === "AbortError"
          ? "タイムアウトしました。時間をおいて再度お試しください。"
          : err instanceof Error
          ? err.message
          : "送信に失敗しました。時間をおいて再度お試しください。"
      );
    }
  };

  const isSubmitting = submitState === "submitting";

  return (
    <form
      className={[styles.form, isSubmitting ? styles.formSubmitting : ""].join(" ")}
      onSubmit={handleSubmit}
    >
      {/* ハニーポット（ボット対策・非表示） */}
      <input
        type="text"
        name="website"
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0 }}
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
      />

      {/* X(Twitter) プロフィールURL */}
      <div className={styles.item}>
        <label className={styles.label} htmlFor="twitter-url">
          X(Twitter) プロフィールURL
        </label>
        <p className={styles.description}>
          X(Twitter) のプロフィールURLをそのままコピペしてください。
        </p>
        <input
          id="twitter-url"
          className={styles.input}
          type="text"
          inputMode="url"
          placeholder="https://x.com/bluesky"
          maxLength={150}
          aria-invalid={urlHasError}
          aria-describedby="twitter-url-message"
          value={twitterUrl}
          onChange={handleUrlChange}
          onFocus={() => setTwitterUrlFocused(true)}
          onBlur={handleUrlBlur}
        />
        <div id="twitter-url-message" aria-live="polite">
          {urlCheckState === "checking" && (
            <p className={styles.fieldChecking}>アカウントを確認中...</p>
          )}
          {urlCheckState === "valid" && (
            <p className={styles.fieldSuccess}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
              </svg>
              登録可能です
            </p>
          )}
          {urlFormatError && (
            <p className={styles.fieldError}>
              正しい X(Twitter) プロフィールURL を入力してください（例: https://x.com/bluesky）
            </p>
          )}
          {urlCheckState === "duplicate" && (
            <p className={styles.fieldError}>
              このアカウントはすでに登録されています
            </p>
          )}
        </div>
        <p className={styles.otherForm}>
          Blueskyアカウントがある場合は『
          <a href="/contribution/register">Bluesky 公式アカウント登録フォーム</a>
          』から入力してください。
        </p>
      </div>

      {/* X(Twitter) アカウント名称 */}
      <div className={styles.item}>
        <label className={styles.label} htmlFor="twitter-name">
          X(Twitter) アカウント名称
        </label>
        <p className={styles.description}>
          X(Twitter) のアカウント名称をそのままコピペしてください。
          <br />
          なお、アカウント名に定常的な名称でない文言を付与している場合は、適宜削除願います。
        </p>
        <input
          id="twitter-name"
          className={styles.input}
          type="text"
          maxLength={100}
          value={twitterName}
          onChange={(e) => setTwitterName(e.target.value)}
        />
      </div>

      <hr className={styles.separator} />

      {submitState === "error" && (
        <p className={styles.submitError} role="alert">{errorMessage}</p>
      )}

      <button
        type="submit"
        className={[
          styles.submitButton,
          canSubmit ? styles.submitButtonActive : "",
        ].join(" ")}
        disabled={!canSubmit}
      >
        {isSubmitting ? "送信中..." : "投稿する"}
      </button>
    </form>
  );
};
