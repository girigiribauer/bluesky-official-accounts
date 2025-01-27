"use client";

import { FilterRuleSet } from "src/models/FilterRuleSet";
import { ChangeEvent, KeyboardEvent, useState } from "react";

import styles from "./FilterRuleSetConfig.module.scss";

export type FilterRuleSetConfigProps = {
  filterRuleSet: FilterRuleSet;
  handleUpdateRules: (ruleSet: FilterRuleSet) => void;
};

export const FilterRuleSetConfig = ({
  filterRuleSet,
  handleUpdateRules,
}: FilterRuleSetConfigProps) => {
  const [text, setText] = useState<string>("");

  const handleUpdate = (rules: Partial<FilterRuleSet>) => {
    const newRules = Object.assign({}, filterRuleSet, rules);
    handleUpdateRules(newRules);
  };

  const handleChangeText = (e: ChangeEvent<HTMLInputElement>) => {
    setText(e.currentTarget.value);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== "Escape") {
      return;
    }
    e.preventDefault();

    if (e.key === "Enter" && e.nativeEvent.isComposing) {
      return;
    }

    const currentText = text;
    setText("");
    const textGroup = new Set(
      [...filterRuleSet.text.split(" "), ...currentText.split(" ")].filter(
        (a) => a !== ""
      )
    );
    if (e.key === "Enter") {
      handleUpdate({ text: Array.from(textGroup).join(" ") });
    }
  };

  return (
    <div className={styles.filters}>
      <span className={styles.filterLabel}>
        <i
          className={[
            "fa-solid fa-magnifying-glass",
            styles.filterLabelIcon,
          ].join(" ")}
        />
        <span className={styles.filterLabelText}>絞り込み</span>
      </span>
      <ul className={styles.filterList}>
        <li className={styles.filterItem}>
          <i
            className={["fa-solid fa-clock", styles.filterItemIcon].join(" ")}
          />
          <button
            className={styles.filterSelectable}
            onClick={() => handleUpdate({ time: "New" })}
          >
            新規追加のみ
          </button>
          <span className={styles.filterItemText}>/</span>
          <button
            className={styles.filterSelectable}
            onClick={() => handleUpdate({ time: "Update" })}
          >
            新規追加・変更
          </button>
        </li>
        <li className={styles.filterItem}>
          <i className={["fa-solid fa-pen", styles.filterItemIcon].join(" ")} />
          <input
            type="text"
            className={styles.filterItemInput}
            onChange={handleChangeText}
            onKeyDown={handleKeyDown}
            value={text}
          />
          <span className={styles.filterItemText}>で絞る</span>
          <span className={styles.filterItemNote}>
            （半角スペースでOR検索）
          </span>
        </li>
        <li className={styles.filterItem}>
          <i
            className={["fa-solid fa-globe", styles.filterItemIcon].join(" ")}
          />
          <button
            className={styles.filterSelectable}
            onClick={() => handleUpdate({ customDomain: true })}
          >
            カスタムドメインのみ
          </button>
        </li>
        <li className={styles.filterItem}>
          <i
            className={["fa-solid fa-check", styles.filterItemIcon].join(" ")}
          />
          <button
            className={styles.filterSelectable}
            onClick={() => handleUpdate({ verified: true })}
          >
            確認済みのみ
          </button>
          <span className={styles.filterItemNote}>
            （移行ステータスの未移行・未確認を除外）
          </span>
        </li>
      </ul>
    </div>
  );
};
