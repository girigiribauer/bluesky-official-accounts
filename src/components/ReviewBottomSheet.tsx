"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ModerationReviewPanel, type ReviewEntry, type Classification } from "./ModerationReviewPanel";
import styles from "./ModerationDashboard.module.scss";

type Props = {
  entry: ReviewEntry;
  classifications: Classification[];
  moderatorHandle: string;
};

export function ReviewBottomSheet({ entry, classifications, moderatorHandle }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      const field = searchParams.get("field");
      router.push(field ? `/moderation_beta?field=${encodeURIComponent(field)}` : "/moderation_beta");
    }, 220);
  };

  return (
    <div className={[styles.bottomSheet, isClosing ? styles.bottomSheetClosing : ""].join(" ")}>
      <div className={styles.bottomSheetHeader}>
        <h2 className={styles.bottomSheetTitle}>レビュー</h2>
        <button className={styles.bottomSheetClose} onClick={handleClose} aria-label="閉じる">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      <div className={styles.bottomSheetBody}>
        <div className={styles.bottomSheetInner}>
          <ModerationReviewPanel
            key={entry.id}
            entry={entry}
            classifications={classifications}
            moderatorHandle={moderatorHandle}
            onClose={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
