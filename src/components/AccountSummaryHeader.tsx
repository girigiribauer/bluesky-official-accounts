"use client";

import styles from "./AccountSummaryHeader.module.scss";

export type AccountSummaryHeaderProps = {
  total: number;
  blueskyAccountsTotal: number;
  updatedTime: string;
  handleOpen: () => void;
  handleClose: () => void;
};

export const AccountSummaryHeader = ({
  total,
  blueskyAccountsTotal,
  updatedTime,
  handleOpen,
  handleClose,
}: AccountSummaryHeaderProps) => {
  const time = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(new Date(updatedTime));

  return (
    <header className={styles.header}>
      <div className={styles.buttons}>
        <button className={styles.button} onClick={handleOpen}>
          <div className={styles.icon}>
            <i className="fa-solid fa-caret-down" />
          </div>
          <span className={styles.buttonLabel}>すべて開く</span>
        </button>
        <button className={styles.button} onClick={handleClose}>
          <div className={styles.icon}>
            <i className="fa-solid fa-caret-up" />
          </div>
          <span className={styles.buttonLabel}>すべて閉じる</span>
        </button>
      </div>

      <div className={styles.status}>
        <p className={styles.total}>
          {blueskyAccountsTotal > 0
            ? `確認済み: ${blueskyAccountsTotal} 件 / `
            : null}
          {`全 ${total} 件`}
        </p>
        <time className={styles.updatedTime}>{time}</time>
      </div>
    </header>
  );
};
