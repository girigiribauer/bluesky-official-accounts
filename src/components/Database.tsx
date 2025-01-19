"use client";

import { NotionItem } from "src/models/Notion";
import { Criteria } from "src/models/Criteria";
import { useMemo, useState } from "react";
import { AccountList } from "./AccountList";

import styles from "./Database.module.scss";
import { FilterRules } from "src/models/FilterRules";
import { FilterRulesConfig } from "./FilterRulesConfig";

export type DatabaseProps = {
  items: NotionItem[];
  criteriaList: Criteria[];
  updatedTime: string;
};

type DatabaseType = "standard" | "wants";

export const Database = ({
  items,
  criteriaList,
  updatedTime,
}: DatabaseProps) => {
  const [databaseType, switchDatabase] = useState<DatabaseType>("standard");

  const defaultFilterRules: FilterRules = {
    time: "None",
    text: "",
    customDomain: false,
    verified: false,
  };
  const [filterRules, setFilterRules] = useState<FilterRules>({
    ...defaultFilterRules,
    // time: "New",
  });
  const oneWeekAgo = new Date(updatedTime).valueOf() - 1000 * 60 * 60 * 24 * 7;

  const handleReset = (key: keyof FilterRules) => {
    const resetRule = { [key]: defaultFilterRules[key] };
    console.log(resetRule);
    setFilterRules(Object.assign({}, filterRules, resetRule));
  };

  const timeFilter = (
    items: NotionItem[],
    rules: FilterRules
  ): NotionItem[] => {
    switch (rules.time) {
      case "New":
        return items.filter(
          (a) => new Date(a.createdTime).valueOf() >= oneWeekAgo
        );
      case "Update":
        return items.filter(
          (a) => new Date(a.updatedTime).valueOf() >= oneWeekAgo
        );
      case "None":
        return items;
    }
  };

  const textFilter = (
    items: NotionItem[],
    rules: FilterRules
  ): NotionItem[] => {
    return rules.text !== ""
      ? items.filter((v) =>
          v.name.toLowerCase().includes(rules.text.toLowerCase())
        )
      : items;
  };

  const customDomainFilter = (items: NotionItem[], rules: FilterRules) => {
    return rules.customDomain
      ? items.filter((a) => {
          return (
            a.bluesky !== null &&
            !a.bluesky
              .replace(".bsky.social/", ".bsky.social")
              .endsWith(".bsky.social")
          );
        })
      : items;
  };

  const verifiedFilter = (items: NotionItem[], rules: FilterRules) => {
    return rules.verified
      ? items.filter((a) => {
          return a.status !== "未移行（未確認）";
        })
      : items;
  };

  const filters = [textFilter, timeFilter, customDomainFilter, verifiedFilter];

  const filteredItems = useMemo(
    () =>
      filters.reduce((items, filter) => {
        return filter(items, filterRules);
      }, items),
    [items]
  );

  const standardItems = useMemo(
    () =>
      filteredItems.filter(
        (a) =>
          (a !== null && a.status !== "未移行（未確認）") ||
          (a.status === "未移行（未確認）" &&
            a.bluesky !== null &&
            a.bluesky !== "")
      ),
    [filteredItems]
  );

  const wantsItems = useMemo(
    () =>
      filteredItems.filter(
        (a) =>
          a !== null &&
          a.status === "未移行（未確認）" &&
          (a.bluesky === null || a.bluesky === "")
      ),
    [filteredItems]
  );

  return (
    <>
      <div className={styles.databaseType}>
        <button
          type="button"
          className={[
            styles.databaseTypeButton,
            databaseType === "standard" ? styles.active : undefined,
          ].join(" ")}
          onClick={() => switchDatabase("standard")}
        >
          投稿されたアカウント
        </button>
        <button
          type="button"
          className={[
            styles.databaseTypeButton,
            databaseType === "wants" ? styles.active : undefined,
          ].join(" ")}
          onClick={() => switchDatabase("wants")}
        >
          来てほしいアカウント
        </button>
      </div>

      <div className={styles.database}>
        <FilterRulesConfig
          filterRules={filterRules}
          handleUpdateRules={(filterRules) => setFilterRules(filterRules)}
        />
        <AccountList
          filterRules={filterRules}
          handleReset={handleReset}
          items={databaseType === "standard" ? standardItems : wantsItems}
          criteriaList={criteriaList}
          updatedTime={updatedTime}
        />
      </div>
    </>
  );
};
