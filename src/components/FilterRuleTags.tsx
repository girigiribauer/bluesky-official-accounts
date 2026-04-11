"use client";

import { useMemo } from "react";
import { FilterRuleSet } from "src/models/FilterRuleSet";
import { buildFilterRuleTags } from "src/lib/filterRuleTags";

import styles from "./FilterRuleTags.module.scss";

export type FilterRuleResultsProps = {
  filterRuleSet: FilterRuleSet | null;
  handleReset: (key: keyof FilterRuleSet) => void;
};

export const FilterRuleTags = ({
  filterRuleSet,
  handleReset,
}: FilterRuleResultsProps) => {
  const filterRuleTags = useMemo(() => buildFilterRuleTags(filterRuleSet), [filterRuleSet]);

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
