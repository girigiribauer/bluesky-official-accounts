"use client";

import { FIELD_ID_LABELS } from "src/constants/contributionForm";
import styles from "./FieldChips.module.scss";

type Props = {
  fieldId: string | null;
  onFieldIdChange: (id: string) => void;
};

export function FieldChips({ fieldId, onFieldIdChange }: Props) {
  return (
    <div className={styles.chips}>
      {Object.entries(FIELD_ID_LABELS).map(([id, label]) => {
        const isSelected = fieldId === id;
        return (
          <button
            key={id}
            type="button"
            className={[styles.chip, isSelected ? styles.chipSelected : ""].join(" ")}
            onClick={() => onFieldIdChange(id)}
            aria-pressed={isSelected}
          >
            <span className={styles.chipIcon}>{isSelected && "✓"}</span>
            {label}
          </button>
        );
      })}
    </div>
  );
}
