"use client";

import styles from "./ModalSource.module.scss";

export type ModalSourceProps = {
  title: string;
  source: string;
  handleClose: () => void;
};

export const ModalSource = ({
  title,
  source,
  handleClose,
}: ModalSourceProps) => {
  return (
    <>
      <div className={styles.modalBackground} onClick={handleClose} />
      <div className={styles.modalContents}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <pre className={styles.modalContentsInside}>
          {source !== "" ? source : "現時点で根拠はありません。"}
        </pre>
        <button className={styles.modalClose} onClick={handleClose}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
    </>
  );
};
