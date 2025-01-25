import styles from "./CriteriaPopup.module.scss";

export type CriteriaPopupProps = {
  title: string;
  source: string;
};

export const CriteriaPopup = ({ title, source }: CriteriaPopupProps) => {
  const emptystate =
    "現時点で根拠はありません。（カスタムドメインなど明らかな場合には書いてないケースがあります）";

  return (
    <div className={styles.container}>
      <h2 className={styles.modalTitle}>{title}</h2>
      <pre className={styles.modalContentsInside}>
        {source ? source : emptystate}
      </pre>
    </div>
  );
};
