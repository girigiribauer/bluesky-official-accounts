"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  approveRequestSubmission,
  rejectRequestSubmission,
} from "src/app/moderation_beta/actions";
import type { RequestSubmission } from "src/types/moderation";
import styles from "./ModerationDashboard.module.scss";
import panelStyles from "./ModerationReviewPanel.module.scss";

type Props = {
  submission: RequestSubmission;
};

export function RequestReviewBottomSheet({ submission }: Props) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClose = () => setIsClosing(true);

  const handleTransitionEnd = () => {
    if (!isClosing) return;
    router.push("/moderation_beta");
  };

  const handleApprove = async () => {
    const result = await approveRequestSubmission(submission.id);
    if (!result.ok) { setError(result.error); return; }
    startTransition(() => { router.refresh(); handleClose(); });
  };

  const handleReject = async () => {
    const result = await rejectRequestSubmission(submission.id);
    if (!result.ok) { setError(result.error); return; }
    startTransition(() => { router.refresh(); handleClose(); });
  };

  return (
    <div
      className={[styles.bottomSheet, isClosing ? styles.bottomSheetClosing : ""].join(" ")}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className={styles.bottomSheetHeader}>
        <h2 className={styles.bottomSheetTitle}>来て欲しい申請のレビュー</h2>
        <button className={styles.bottomSheetClose} onClick={handleClose} aria-label="閉じる">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      <div className={styles.bottomSheetBody}>
        <div className={styles.bottomSheetInner}>
          <section className={panelStyles.panel}>
            <p className={panelStyles.description}>投稿された内容を確認して、問題なければ公開してください。</p>

            <div className={panelStyles.infoCol}>
              <div className={panelStyles.infoItem}>
                <span className={panelStyles.infoText}>{submission.display_name}</span>
              </div>
              <div className={panelStyles.infoItem}>
                <a
                  className={panelStyles.infoLink}
                  href={`https://x.com/${submission.twitter_handle}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className={[panelStyles.brandIconX, panelStyles.brandIcon].join(" ")}>
                    <i className="fa-brands fa-x-twitter" />
                  </span>
                  {submission.twitter_handle}
                  <i className={["fa-solid fa-arrow-up-right-from-square", panelStyles.externalIcon].join(" ")} />
                </a>
              </div>
            </div>

            <div className={panelStyles.actions}>
              <button className={panelStyles.approveButton} onClick={handleApprove} disabled={isPending}>承認する</button>
              <button className={panelStyles.rejectButton} onClick={handleReject} disabled={isPending}>却下する</button>
            </div>

            {error && <p className={panelStyles.errorMessage}>{error}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
