"use client";

import { FIELD_ID_LABELS, OLD_CATEGORIES } from "src/constants/contributionForm";
import styles from "./FieldSelector.module.scss";

const FIELD_OPTIONS = Object.entries(FIELD_ID_LABELS).map(([id, label]) => ({ id, label }));

type Props = {
  fieldId: string;
  onFieldIdChange: (id: string) => void;
  oldCategory: string;
  onOldCategoryChange: (cat: string) => void;
};

export function FieldSelector({ fieldId, onFieldIdChange, oldCategory, onOldCategoryChange }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.item}>
        <span className={styles.label}>分類（旧）</span>
        <p className={styles.description}>
          そのアカウントの興味分野が一番近い分類を選んでください。（以下の分野に移行予定）
        </p>
        <select
          className={styles.select}
          value={oldCategory}
          onChange={(e) => onOldCategoryChange(e.target.value)}
        >
          <option value="">（選択してください）</option>
          {OLD_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.item}>
        <span className={styles.label}>分野</span>
        <p className={styles.description}>
          そのアカウントの興味分野が一番近いものを1つ選んでください。
        </p>
        <div className={styles.chips}>
          {FIELD_OPTIONS.map(({ id, label }) => {
            const isSelected = fieldId === id;
            return (
              <button
                key={id}
                type="button"
                className={[styles.chip, isSelected ? styles.chipSelected : ""].join(" ")}
                onClick={() => onFieldIdChange(id)}
              >
                <span className={styles.chipIcon}>{isSelected && "✓"}</span>
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
