"use client";

import { FieldChips } from "./FieldChips";
import styles from "./FieldSelector.module.scss";

type Props = {
  fieldId: string;
  onFieldIdChange: (id: string) => void;
};

export function FieldSelector({ fieldId, onFieldIdChange }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.item}>
        <span className={styles.label}>分野</span>
        <p className={styles.description}>
          そのアカウントの興味分野が一番近いものを1つ選んでください。
        </p>
        <FieldChips fieldId={fieldId} onFieldIdChange={onFieldIdChange} />
      </div>
    </div>
  );
}
