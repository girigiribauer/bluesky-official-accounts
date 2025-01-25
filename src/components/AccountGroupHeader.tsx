"use client";

export type AccountGroupHeaderProps = {
  title: string;
  total: number;
  isOpen: boolean;
  criteria?: string;
  handleSelect: () => void;
};

import styles from "./AccountGroupHeader.module.scss";

export const AccountGroupHeader = ({
  title,
  total,
  isOpen,
  criteria = "",
  handleSelect,
}: AccountGroupHeaderProps) => {
  return (
    <div
      className={styles.container}
      onClick={(e) => {
        handleSelect();
        e.preventDefault();
      }}
    >
      <div className={styles.groupTitle}>
        <h2 className={styles.heading}>{title}</h2>
        <span className={styles.total}>{total}</span>
        {criteria ? (
          <span className={styles.criteria}>掲載基準: {criteria}</span>
        ) : null}
      </div>

      <div className={[styles.icon, isOpen ? styles.iconOpen : ""].join(" ")}>
        <i className="fa-solid fa-caret-down" />
      </div>
    </div>
  );
};
