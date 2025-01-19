"use client";

import { useMemo } from "react";
import { FilterRules } from "src/models/FilterRules";

import styles from "./FilterRuleResults.module.scss";

export type FilterRuleResultsProps = {
  filterRules: FilterRules | null;
  handleReset: (key: keyof FilterRules) => void;
};

export const FilterRuleResults = ({
  filterRules,
  handleReset,
}: FilterRuleResultsProps) => {
  const filterRuleTags: {
    key: keyof FilterRules;
    value: string;
  }[] = useMemo(() => {
    const tags: {
      key: keyof FilterRules;
      value: string;
    }[] = [];
    if (!filterRules) {
      return tags;
    }

    if (filterRules.time === "New") {
      tags.push({ key: "time", value: "1週間以内の登録" });
    }
    if (filterRules.time === "Update") {
      tags.push({
        key: "time",
        value: "1週間以内の登録・変更",
      });
    }

    if (filterRules.text !== "") {
      tags.push({ key: "text", value: `${filterRules.text}を含む` });
    }

    if (filterRules.customDomain) {
      tags.push({ key: "customDomain", value: "カスタムドメイン" });
    }

    if (filterRules.verified) {
      tags.push({ key: "verified", value: "確認済み" });
    }

    return tags;
  }, [filterRules]);

  return filterRuleTags.length > 0 ? (
    <ul className={styles.filterRules}>
      {filterRuleTags.map((ruleTag, index) => {
        const classNameMapping: {
          [K in keyof FilterRules]: string;
        } = {
          time: "fa-solid fa-clock",
          text: "fa-solid fa-pen",
          customDomain: "fa-solid fa-globe",
          verified: "fa-solid fa-check",
        };
        return (
          <li
            key={`rule${index}`}
            className={styles.filterRule}
            onClick={() => handleReset(ruleTag.key)}
          >
            <i
              className={[
                classNameMapping[ruleTag.key],
                styles.filterRuleIcon,
              ].join(" ")}
            />
            <span className={styles.filterRuleText}>{ruleTag.value}</span>
            <i
              className={["fa-solid fa-xmark", styles.filterRuleClose].join(
                " "
              )}
            />
          </li>
        );
      })}
    </ul>
  ) : null;
};
