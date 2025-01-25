"use client";

import { useMemo } from "react";
import { FilterRuleSet } from "src/models/FilterRuleSet";

import styles from "./FilterRuleTags.module.scss";

export type FilterRuleResultsProps = {
  filterRuleSet: FilterRuleSet | null;
  handleReset: (key: keyof FilterRuleSet) => void;
};

export const FilterRuleTags = ({
  filterRuleSet,
  handleReset,
}: FilterRuleResultsProps) => {
  const filterRuleTags: {
    key: keyof FilterRuleSet;
    value: string;
  }[] = useMemo(() => {
    const tags: {
      key: keyof FilterRuleSet;
      value: string;
    }[] = [];
    if (!filterRuleSet) {
      return tags;
    }

    if (filterRuleSet.time === "New") {
      tags.push({ key: "time", value: "1週間以内の登録" });
    }
    if (filterRuleSet.time === "Update") {
      tags.push({
        key: "time",
        value: "1週間以内の登録・変更",
      });
    }

    if (filterRuleSet.text !== "") {
      const labels = filterRuleSet.text
        .split(" ")
        .map((a) => `"${a}"`)
        .join(",");
      tags.push({ key: "text", value: `${labels}を含む` });
    }

    if (filterRuleSet.customDomain) {
      tags.push({ key: "customDomain", value: "カスタムドメイン" });
    }

    if (filterRuleSet.verified) {
      tags.push({ key: "verified", value: "確認済み" });
    }

    return tags;
  }, [filterRuleSet]);

  return filterRuleTags.length > 0 ? (
    <ul className={styles.filterRuleSet}>
      {filterRuleTags.map((ruleTag, index) => {
        const classNameMapping: {
          [K in keyof FilterRuleSet]: string;
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
