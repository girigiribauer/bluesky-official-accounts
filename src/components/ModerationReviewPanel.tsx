"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveEntry,
  rejectEntry,
  addEvidence,
  updateEntryName,
  updateEntryTwitterHandle,
  updateEntryBlueskyHandle,
  updateEntryStatus,
  setEntryClassification,
} from "src/app/moderation_beta/actions";
import { useModal } from "src/hooks/useModal";
import { STATUS_OPTIONS } from "src/constants/contributionForm";
import { formatEvidenceMeta } from "src/lib/formatEvidenceMeta";
import { sortEvidences } from "src/lib/sortEvidences";
import type { ReviewEntry, Classification } from "src/types/moderation";
import styles from "./ModerationReviewPanel.module.scss";

export type { ReviewEntry, Classification };

type EditField = "display_name" | "twitter_handle" | "bluesky_handle" | "transition_status" | "classification" | "evidence";

type Props = {
  entry: ReviewEntry;
  classifications: Classification[];
  moderatorHandle: string;
  onClose: () => void;
};

const editFieldLabels: Record<EditField, string> = {
  display_name: "アカウント名の修正",
  twitter_handle: "X(Twitter) ハンドルの修正",
  bluesky_handle: "Bluesky ハンドルの修正",
  transition_status: "移行ステータスの修正",
  classification: "分類の修正",
  evidence: "根拠の追記",
};



export function ModerationReviewPanel({ entry, classifications, moderatorHandle, onClose }: Props) {
  const router = useRouter();
  const { updateModal, clearModal } = useModal();
  const [localEntry, setLocalEntry] = useState(entry);
  const [activeEditField, setActiveEditField] = useState<EditField | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // account_id / entry id を束縛したクロージャ
  const editFieldActions: Record<Exclude<EditField, "evidence">, (value: string) => Promise<{ ok: boolean; error?: string }>> = {
    display_name:      (value) => updateEntryName(localEntry.account_id, value),
    twitter_handle:    (value) => updateEntryTwitterHandle(localEntry.id, localEntry.account_id, value),
    bluesky_handle:    (value) => updateEntryBlueskyHandle(localEntry.id, localEntry.account_id, value),
    transition_status: (value) => updateEntryStatus(localEntry.id, localEntry.account_id, value),
    classification:    (value) => setEntryClassification(localEntry.account_id, value),
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
      const result = await addEvidence(localEntry.account_id, editValue);
      if (!result.ok) { setError(result.error); return; }
      setLocalEntry((prev) => ({
        ...prev,
        accounts: {
          ...prev.accounts,
          evidences: [
            {
              id: result.id,
              content: editValue.trim(),
              created_at: new Date().toISOString(),
              moderators: { handle: moderatorHandle, display_name: moderatorHandle },
            },
            ...prev.accounts.evidences,
          ],
        },
      }));
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
      setLocalEntry((prev) => ({
        ...prev,
        accounts: {
          ...prev.accounts,
          account_fields: [{ ...prev.accounts.account_fields[0], classification_id: editValue || null, classifications: cls ? { id: cls.id, name: cls.name } : null }],
        },
      }));
    } else if (activeEditField === "display_name") {
      setLocalEntry((prev) => ({ ...prev, accounts: { ...prev.accounts, display_name: editValue } }));
    } else {
      setLocalEntry((prev) => ({ ...prev, [activeEditField]: editValue }));
    }
    setActiveEditField(null);
    setError(null);
    startTransition(() => router.refresh());
  };

  const handleApprove = async () => {
    const result = await approveEntry(localEntry.id, localEntry.account_id);
    if (!result.ok) { setError(result.error); return; }
    startTransition(() => { router.refresh(); onClose(); });
  };

  const handleRejectClick = () => {
    updateModal(<RejectModal entryId={localEntry.id} accountId={localEntry.account_id} onSuccess={() => { clearModal(); onClose(); }} />);
  };

  const evidenceText = sortEvidences(localEntry.accounts.evidences)
    .map((e) => `${formatEvidenceMeta(e)}\n${e.content}`)
    .join("\n\n");
  const currentClassification = localEntry.accounts.account_fields[0]?.classifications ?? null;
  const currentClassificationId = localEntry.accounts.account_fields[0]?.classification_id ?? "";

  return (
    <section className={styles.panel}>
      <p className={styles.description}>投稿された内容を確認して、問題なければ公開してください。</p>

      {/* Figma: row（Large: row / Small: column）→ 左col（情報）+ 右col（根拠） */}
      <div className={styles.infoRow}>
        {/* 左col: 情報アイテム群 */}
        <div className={styles.infoCol}>
          {/* アカウント名 */}
          <div className={[styles.infoItem, activeEditField === "display_name" ? styles.infoItemActive : ""].join(" ")}>
            <button
              className={styles.editIconButton}
              onClick={() => handleEditToggle("display_name", localEntry.accounts.display_name)}
              aria-label="アカウント名を修正"
            >
              <i className="fa-solid fa-pencil" />
            </button>
            <span className={styles.infoText}>{localEntry.accounts.display_name}</span>
          </div>

          {/* X(Twitter) */}
          {localEntry.twitter_handle && (
            <div className={[styles.infoItem, activeEditField === "twitter_handle" ? styles.infoItemActive : ""].join(" ")}>
              <button
                className={styles.editIconButton}
                onClick={() => handleEditToggle("twitter_handle", localEntry.twitter_handle ?? "")}
                aria-label="X(Twitter)ハンドルを修正"
              >
                <i className="fa-solid fa-pencil" />
              </button>
              <a
                className={styles.infoLink}
                href={`https://x.com/${localEntry.twitter_handle}`}
                target="_blank"
                rel="noreferrer"
              >
                <span className={[styles.brandIconX, styles.brandIcon].join(" ")}>
                  <i className="fa-brands fa-x-twitter" />
                </span>
                {localEntry.twitter_handle}
                <i className={["fa-solid fa-arrow-up-right-from-square", styles.externalIcon].join(" ")} />
              </a>
            </div>
          )}

          {/* Bluesky */}
          <div className={[styles.infoItem, activeEditField === "bluesky_handle" ? styles.infoItemActive : ""].join(" ")}>
            <button
              className={styles.editIconButton}
              onClick={() => handleEditToggle("bluesky_handle", localEntry.bluesky_handle)}
              aria-label="Blueskyハンドルを修正"
            >
              <i className="fa-solid fa-pencil" />
            </button>
            <a
              className={styles.infoLink}
              href={`https://bsky.app/profile/${localEntry.bluesky_handle}`}
              target="_blank"
              rel="noreferrer"
            >
              <span className={[styles.brandIconBsky, styles.brandIcon].join(" ")}>
                <i className="fa-brands fa-bluesky" />
              </span>
              {localEntry.bluesky_handle}
              <i className={["fa-solid fa-arrow-up-right-from-square", styles.externalIcon].join(" ")} />
            </a>
          </div>

          {/* 移行ステータス */}
          <div className={[styles.infoItem, activeEditField === "transition_status" ? styles.infoItemActive : ""].join(" ")}>
            <button
              className={styles.editIconButton}
              onClick={() => handleEditToggle("transition_status", localEntry.transition_status)}
              aria-label="移行ステータスを修正"
            >
              <i className="fa-solid fa-pencil" />
            </button>
            <span className="status" data-status={localEntry.transition_status}>
              {STATUS_OPTIONS.find(o => o.value === localEntry.transition_status)?.label ?? localEntry.transition_status}
            </span>
          </div>

          {/* 分類 */}
          <div className={[styles.infoItem, activeEditField === "classification" ? styles.infoItemActive : ""].join(" ")}>
            <button
              className={styles.editIconButton}
              onClick={() => handleEditToggle("classification", currentClassificationId)}
              aria-label="分類を修正"
            >
              <i className="fa-solid fa-pencil" />
            </button>
            {currentClassification
              ? <span className={styles.infoText}>{currentClassification.name}</span>
              : <span className={styles.infoTextMuted}>（未分類）</span>
            }
          </div>
        </div>

        {/* 右col: 根拠（ReviewItem、height:80px固定） */}
        <div className={styles.evidenceCol}>
          <div className={[styles.infoItem, activeEditField === "evidence" ? styles.infoItemActive : ""].join(" ")}>
            <button
              className={styles.editIconButton}
              onClick={() => handleEditToggle("evidence", "")}
              aria-label="根拠を追記"
            >
              <i className="fa-solid fa-pencil" />
            </button>
            <div className={styles.evidenceBox}>{evidenceText}</div>
          </div>
        </div>
      </div>

      {/* アクション */}
      <div className={styles.actions}>
        <button className={styles.approveButton} onClick={handleApprove} disabled={isPending}>承認する</button>
        <button className={styles.rejectButton} onClick={handleRejectClick} disabled={isPending}>却下する</button>
      </div>

      {/* 修正エリア — grid trick で高さをeasingアニメーション */}
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
                  placeholder="追記する根拠を入力してください"
                />
              ) : (
                <input
                  className={styles.editInput}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              )}
              <button className={styles.submitButton} onClick={handleEditSubmit}>
                {activeEditField === "evidence" ? "追記する" : "修正する"}
              </button>
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
        </div>
      </div>

      {error && !activeEditField && <p className={styles.errorMessage}>{error}</p>}
    </section>
  );
}

function RejectModal({ entryId, accountId, onSuccess }: { entryId: string; accountId: string; onSuccess: () => void }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const result = await rejectEntry(entryId, accountId, reason);
    if (!result.ok) { setError(result.error); return; }
    onSuccess();
  };

  return (
    <div className={styles.rejectModal}>
      <h2 className={styles.rejectModalTitle}>却下理由</h2>
      <textarea
        className={styles.rejectTextarea}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="却下理由（任意）"
      />
      {error && <p className={styles.errorMessage}>{error}</p>}
      <button className={styles.rejectSubmitButton} onClick={handleSubmit}>却下する</button>
    </div>
  );
}
