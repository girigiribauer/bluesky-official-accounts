"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnnotationButton } from "src/components/AnnotationButton";
import { registerContributionSchema } from "src/lib/schemas/registerContribution";
import { fetchWithTimeout } from "src/lib/fetchWithTimeout";
import { formatErrorMessage } from "src/lib/formatErrorMessage";
import { STATUS_OPTIONS, EVIDENCE_SHORTCUTS } from "src/constants/contributionForm";
import { FieldSelector } from "./FieldSelector";
import { useBlueskyCheck } from "src/hooks/useBlueskyCheck";
import styles from "./RegisterForm.module.scss";

type SubmitState = "idle" | "submitting" | "error";

export const RegisterForm = () => {
  const router = useRouter();
  const { blueskyInput, checkState, resolvedAccount, existingData, handleInputChange } = useBlueskyCheck();
  const [accountName, setAccountName] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [twitterUrl, setTwitterUrl] = useState("");
  const [migrationStatus, setMigrationStatus] = useState("");
  const [evidence, setEvidence] = useState("");
  const [evidenceShortcut, setEvidenceShortcut] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const isFormOpen = checkState === "new" || checkState === "registered";
  const canSubmit =
    isFormOpen &&
    submitState !== "submitting" &&
    registerContributionSchema.safeParse({
      did: resolvedAccount?.did ?? "",
      handle: resolvedAccount?.handle ?? "",
      accountName,
      fields: selectedFields,
      migrationStatus,
      twitterUrl,
      evidence,
    }).success;

  const handleBlueskyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(e.target.value);
    // アカウントが切り替わったらフォームをリセット
    setAccountName("");
    setTwitterUrl("");
    setMigrationStatus("");
    setEvidence("");
    setSelectedFields([]);
  };

  // checkState が new/registered に変わったとき既存データで初期値を埋める
  if (checkState === "new" && resolvedAccount && accountName === "" && resolvedAccount.displayName) {
    setAccountName(resolvedAccount.displayName);
  }
  if (checkState === "registered" && existingData && accountName === "" && existingData.name) {
    setAccountName(existingData.name);
    setTwitterUrl(existingData.twitter);
    setMigrationStatus(existingData.status);
    if (existingData.fieldId) setSelectedFields([existingData.fieldId]);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !resolvedAccount) return;

    setSubmitState("submitting");
    setErrorMessage("");

    try {
      const res = await fetchWithTimeout("/api/contribution/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          did: resolvedAccount.did,
          handle: resolvedAccount.handle,
          accountName,
          fields: selectedFields,
          migrationStatus,
          twitterUrl,
          evidence,
          website: honeypot,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "送信に失敗しました");
      }

      router.push("/contribution/register/complete");
    } catch (err) {
      setSubmitState("error");
      setErrorMessage(formatErrorMessage(err));
    }
  };

  const handleEvidenceShortcut = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = EVIDENCE_SHORTCUTS.find((s) => s.label === e.target.value);
    if (selected?.template) setEvidence(selected.template);
    setEvidenceShortcut("");
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

      {/* Bluesky アカウント */}
      <div className={styles.item}>
        <label className={styles.label} htmlFor="bluesky-account">
          Bluesky アカウント
        </label>
        <p className={styles.description}>
          Bluesky プロフィールページのURL、ハンドルネーム、DIDのいずれかをそのままコピペしてください。
        </p>
        <input
          id="bluesky-account"
          className={styles.input}
          type="text"
          placeholder="https://bsky.app/profile/bsky.app"
          value={blueskyInput}
          onChange={handleBlueskyChange}
          onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
        />
        <div aria-live="polite">
          {checkState === "new" && resolvedAccount && (
            <p className={styles.fieldSuccess}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
              </svg>
              @{resolvedAccount.handle}（新規登録）
            </p>
          )}
          {checkState === "registered" && resolvedAccount && (
            <p className={styles.fieldSuccess}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
              </svg>
              @{resolvedAccount.handle}（既存アカウントの更新）
            </p>
          )}
        </div>
        <p className={styles.otherForm}>
          Blueskyアカウントがない場合は『
          <a href="/contribution/request">来て欲しいアカウント登録フォーム</a>
          』から入力してください。
        </p>
      </div>

      {/* placeholder エリア */}
      {(checkState === "idle" || checkState === "checking" || checkState === "invalid") && (
        <div className={styles.formEmpty} aria-live="polite">
          {checkState === "idle" && (
            <p className={styles.formEmptyText}>
              先に Bluesky アカウントを入力してください
              <br />
              続けて必要な項目が表示されます
            </p>
          )}
          {checkState === "checking" && (
            <p className={styles.formEmptyText}>読み込み中です...</p>
          )}
          {checkState === "invalid" && (
            <p className={styles.formEmptyText}>
              アカウントの形式が不正です
              <br />
              URL・ハンドル・DID をご確認ください
            </p>
          )}
        </div>
      )}

      {/* アカウント確認後フォーム項目 */}
      {isFormOpen && (
        <>
          {/* アカウント名称 */}
          <div className={styles.item}>
            <label className={styles.label} htmlFor="account-name">
              アカウント名称
            </label>
            <p className={styles.description}>
              自動入力されます。Blueskyアカウントが正しいかどうかご確認ください。
              <br />
              なお、アカウント名に定常的な名称でない文言を付与している場合は、適宜削除願います。
            </p>
            <input
              id="account-name"
              className={styles.input}
              type="text"
              maxLength={100}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>

          {/* 分野 */}
          <FieldSelector
            fieldId={selectedFields[0] ?? ""}
            onFieldIdChange={(id) => setSelectedFields([id])}
          />

          {/* 移行ステータス */}
          <div className={styles.item}>
            <label className={styles.label} htmlFor="migration-status">
              移行ステータス
            </label>
            <p className={styles.description}>
              Bluesky アカウントの今の移行状態を次の中から選んでください。
            </p>
            <select
              id="migration-status"
              className={styles.select}
              value={migrationStatus}
              onChange={(e) => setMigrationStatus(e.target.value)}
            >
              {STATUS_OPTIONS.filter((opt) => opt.value !== "not_migrated" && opt.value !== "unknown").map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

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
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
            />
          </div>

          {/* 根拠 */}
          <div className={styles.item}>
            <label className={styles.label} htmlFor="evidence-text">
              根拠
            </label>
            <p className={styles.description}>
              X(Twitter) と Bluesky が同一である根拠を記入してください。
            </p>
            <div className={styles.customTextarea}>
              <div className={styles.evidenceShortcut}>
                <span>ショートカットから選択: </span>
                <select
                  className={styles.selectSmall}
                  value={evidenceShortcut}
                  onChange={handleEvidenceShortcut}
                >
                  {EVIDENCE_SHORTCUTS.map((s) => (
                    <option key={s.label} value={s.label}>{s.label}</option>
                  ))}
                </select>
              </div>
              <textarea
                id="evidence-text"
                className={styles.textarea}
                maxLength={1000}
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              />
            </div>
            {checkState === "registered" && existingData && (
              <div className={styles.readonlyItem}>
                <span className={styles.labelSmall}>投稿済みの根拠の履歴</span>
                <textarea
                  className={styles.inputReadonly}
                  value={existingData.source}
                  readOnly
                />
              </div>
            )}
          </div>
        </>
      )}

      <hr className={styles.separator} />

      <div className={styles.submitArea}>
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
      </div>
    </form>
  );
};
