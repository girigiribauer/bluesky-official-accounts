"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModerationReviewPanel } from "./ModerationReviewPanel";
import type { ReviewSubmission, Classification } from "src/types/moderation";
import styles from "./ModerationDashboard.module.scss";

type Props = {
  submission: ReviewSubmission;
  classifications: Classification[];
};

export function ReviewBottomSheet({ submission, classifications }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => setIsClosing(true);

  const handleTransitionEnd = () => {
    if (!isClosing) return;
    const field = searchParams.get("field");
    router.push(field ? `/moderation_beta?field=${encodeURIComponent(field)}` : "/moderation_beta");
  };

  return (
    <div
      className={[styles.bottomSheet, isClosing ? styles.bottomSheetClosing : ""].join(" ")}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className={styles.bottomSheetHeader}>
        <h2 className={styles.bottomSheetTitle}>レビュー</h2>
        <button className={styles.bottomSheetClose} onClick={handleClose} aria-label="閉じる">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      <div className={styles.bottomSheetBody}>
        <div className={styles.bottomSheetInner}>
          <ModerationReviewPanel
            key={submission.id}
            submission={submission}
            classifications={classifications}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
