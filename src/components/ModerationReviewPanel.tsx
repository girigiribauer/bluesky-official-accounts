"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveEntrySubmission,
  rejectEntrySubmission,
  updateSubmissionName,
  updateSubmissionTwitterUrl,
  updateSubmissionBlueskyHandle,
  updateSubmissionTransitionStatus,
  updateSubmissionEvidence,
  setSubmissionClassification,
} from "src/app/moderation_beta/actions";
import { useModal } from "src/hooks/useModal";
import { STATUS_OPTIONS } from "src/constants/contributionForm";
import type { ReviewSubmission, Classification } from "src/types/moderation";
import styles from "./ModerationReviewPanel.module.scss";

type EditField = "account_name" | "twitter_url" | "bluesky_handle" | "transition_status" | "classification" | "evidence";

type Props = {
  submission: ReviewSubmission;
  classifications: Classification[];
  onClose: () => void;
};

const editFieldLabels: Record<EditField, string> = {
  account_name: "アカウント名の修正",
  twitter_url: "X(Twitter) URLの修正",
  bluesky_handle: "Bluesky ハンドルの修正",
  transition_status: "移行ステータスの修正",
  classification: "分類の修正",
  evidence: "根拠の修正",
};

function extractTwitterHandle(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/^https?:\/\/(x|twitter)\.com\/([A-Za-z0-9_]+)/);
  return match?.[2] ?? null;
}

export function ModerationReviewPanel({ submission, classifications, onClose }: Props) {
  const router = useRouter();
  const { updateModal, clearModal } = useModal();
  const [local, setLocal] = useState(submission);
  const [activeEditField, setActiveEditField] = useState<EditField | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const editFieldActions: Record<Exclude<EditField, "evidence">, (value: string) => Promise<{ ok: boolean; error?: string }>> = {
    account_name:      (value) => updateSubmissionName(local.id, value),
    twitter_url:       (value) => updateSubmissionTwitterUrl(local.id, value),
    bluesky_handle:    (value) => updateSubmissionBlueskyHandle(local.id, value),
    transition_status: (value) => updateSubmissionTransitionStatus(local.id, value),
    classification:    (value) => setSubmissionClassification(local.id, value),
  };

  const handleEditToggle = (field: EditField, currentValue: string) => {
    if (activeEditField === field) {
      setActiveEditField(null);
    } else {
      setActiveEditField(field);
      setEditValue(currentValue);
      setError(null);
    }
  };

  const handleEditSubmit = async () => {
    if (!activeEditField) return;

    if (activeEditField === "evidence") {
      const result = await updateSubmissionEvidence(local.id, editValue);
      if (!result.ok) { setError(result.error); return; }
      setLocal((prev) => ({ ...prev, evidence: editValue.trim() || null }));
      setActiveEditField(null);
      setEditValue("");
      setError(null);
      startTransition(() => router.refresh());
      return;
    }

    const result = await editFieldActions[activeEditField](editValue);
    if (!result.ok) { setError(result.error ?? null); return; }

    if (activeEditField === "classification") {
      const cls = classifications.find((c) => c.id === editValue) ?? null;
      setLocal((prev) => ({
        ...prev,
        classification_id: editValue || null,
        classifications: cls ? { id: cls.id, name: cls.name } : null,
      }));
    } else {
      setLocal((prev) => ({ ...prev, [activeEditField]: editValue }));
    }
    setActiveEditField(null);
    setError(null);
    startTransition(() => router.refresh());
  };

  const handleApprove = async () => {
    const result = await approveEntrySubmission(local.id);
    if (!result.ok) { setError(result.error); return; }
    startTransition(() => { router.refresh(); onClose(); });
  };

  const handleRejectClick = () => {
    updateModal(<RejectModal submissionId={local.id} onSuccess={() => { clearModal(); onClose(); }} />);
  };

  const twitterHandle = extractTwitterHandle(local.twitter_url);

  return (
    <section className={styles.panel}>
      <p className={styles.description}>投稿された内容を確認して、問題なければ公開してください。</p>

      <div className={styles.infoRow}>
        {/* 左col: 情報アイテム群 */}
        <div className={styles.infoCol}>
          {/* アカウント名 */}
          <div className={[styles.infoItem, activeEditField === "account_name" ? styles.infoItemActive : ""].join(" ")}>
            <button
              className={styles.editIconButton}
              onClick={() => handleEditToggle("account_name", local.account_name)}
              aria-label="アカウント名を修正"
            >
              <i className="fa-solid fa-pencil" />
            </button>
            <span className={styles.infoText}>{local.account_name}</span>
          </div>

          {/* X(Twitter) */}
          {twitterHandle && (
            <div className={[styles.infoItem, activeEditField === "twitter_url" ? styles.infoItemActive : ""].join(" ")}>
              <button
                className={styles.editIconButton}
                onClick={() => handleEditToggle("twitter_url", local.twitter_url ?? "")}
                aria-label="X(Twitter)URLを修正"
              >
                <i className="fa-solid fa-pencil" />
              </button>
              <a
                className={styles.infoLink}
                href={`https://x.com/${twitterHandle}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className={[styles.brandIconX, styles.brandIcon].join(" ")}>
                  <i className="fa-brands fa-x-twitter" />
                </span>
                {twitterHandle}
                <i className={["fa-solid fa-arrow-up-right-from-square", styles.externalIcon].join(" ")} />
              </a>
            </div>
          )}

          {/* Bluesky */}
          <div className={[styles.infoItem, activeEditField === "bluesky_handle" ? styles.infoItemActive : ""].join(" ")}>
            <button
              className={styles.editIconButton}
              onClick={() => handleEditToggle("bluesky_handle", local.bluesky_handle)}
              aria-label="Blueskyハンドルを修正"
            >
              <i className="fa-solid fa-pencil" />
            </button>
            <a
              className={styles.infoLink}
              href={`https://bsky.app/profile/${local.bluesky_handle}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className={[styles.brandIconBsky, styles.brandIcon].join(" ")}>
                <i className="fa-brands fa-bluesky" />
              </span>
              {local.bluesky_handle}
              <i className={["fa-solid fa-arrow-up-right-from-square", styles.externalIcon].join(" ")} />
            </a>
          </div>

          {/* 移行ステータス */}
          <div className={[styles.infoItem, activeEditField === "transition_status" ? styles.infoItemActive : ""].join(" ")}>
            <button
              className={styles.editIconButton}
              onClick={() => handleEditToggle("transition_status", local.transition_status)}
              aria-label="移行ステータスを修正"
            >
              <i className="fa-solid fa-pencil" />
            </button>
            <span className="status" data-status={local.transition_status}>
              {STATUS_OPTIONS.find(o => o.value === local.transition_status)?.label ?? local.transition_status}
            </span>
          </div>

          {/* 分類 */}
          <div className={[styles.infoItem, activeEditField === "classification" ? styles.infoItemActive : ""].join(" ")}>
            <button
              className={styles.editIconButton}
              onClick={() => handleEditToggle("classification", local.classification_id ?? "")}
              aria-label="分類を修正"
            >
              <i className="fa-solid fa-pencil" />
            </button>
            {local.classifications
              ? <span className={styles.infoText}>{local.classifications.name}</span>
              : <span className={styles.infoTextMuted}>（未分類）</span>
            }
          </div>
        </div>

        {/* 右col: 根拠 */}
        <div className={styles.evidenceCol}>
          <div className={[styles.infoItem, activeEditField === "evidence" ? styles.infoItemActive : ""].join(" ")}>
            <button
              className={styles.editIconButton}
              onClick={() => handleEditToggle("evidence", local.evidence ?? "")}
              aria-label="根拠を修正"
            >
              <i className="fa-solid fa-pencil" />
            </button>
            <div className={styles.evidenceBox}>{local.evidence ?? ""}</div>
          </div>
        </div>
      </div>

      {/* アクション */}
      <div className={styles.actions}>
        <button className={styles.approveButton} onClick={handleApprove} disabled={isPending}>承認する</button>
        <button className={styles.rejectButton} onClick={handleRejectClick} disabled={isPending}>却下する</button>
      </div>

      {/* 修正エリア */}
      <div className={[styles.editAreaOuter, activeEditField ? styles.editAreaOuterOpen : ""].join(" ")}>
        <div className={styles.editAreaInner}>
          <div className={styles.editArea}>
            <p className={styles.editAreaLabel}>{activeEditField ? editFieldLabels[activeEditField] : ""}</p>
            <div className={styles.editAreaRow}>
              {activeEditField === "transition_status" ? (
                <select
                  className={styles.editSelect}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                >
                  {STATUS_OPTIONS.filter((o) => o.value !== "").map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : activeEditField === "classification" ? (
                <select
                  className={styles.editSelect}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                >
                  <option value="">（未分類）</option>
                  {classifications.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              ) : activeEditField === "evidence" ? (
                <textarea
                  className={styles.editTextarea}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="根拠を入力してください"
                />
              ) : (
                <input
                  className={styles.editInput}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              )}
              <button className={styles.submitButton} onClick={handleEditSubmit}>修正する</button>
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
        </div>
      </div>

      {error && !activeEditField && <p className={styles.errorMessage}>{error}</p>}
    </section>
  );
}

function RejectModal({ submissionId, onSuccess }: { submissionId: string; onSuccess: () => void }) {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const result = await rejectEntrySubmission(submissionId);
    if (!result.ok) { setError(result.error); return; }
    onSuccess();
  };

  return (
    <div className={styles.rejectModal}>
      <h2 className={styles.rejectModalTitle}>申請を却下する</h2>
      <p>この申請を却下しますか？</p>
      {error && <p className={styles.errorMessage}>{error}</p>}
      <button className={styles.rejectSubmitButton} onClick={handleSubmit}>却下する</button>
    </div>
  );
}
