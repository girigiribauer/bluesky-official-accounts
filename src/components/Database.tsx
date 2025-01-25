"use client";

import { NotionItem } from "src/models/Notion";
import { Category } from "src/models/Category";
import { useMemo, useState } from "react";
import { AccountList } from "./AccountList";
import { FilterRuleSet } from "src/models/FilterRuleSet";
import { FilterRuleSetConfig } from "./FilterRuleSetConfig";

import styles from "./Database.module.scss";

export type DatabaseProps = {
  items: NotionItem[];
  categoryList: Category[];
  updatedTime: string;
};

type DatabaseType = "standard" | "wants";

export const Database = ({
  items,
  categoryList,
  updatedTime,
}: DatabaseProps) => {
  const [databaseType, switchDatabase] = useState<DatabaseType>("standard");

  const defaultFilterRuleSet: FilterRuleSet = {
    time: "None",
    text: "",
    customDomain: false,
    verified: false,
  };
  const [filterRuleSet, updateFilterRuleSet] = useState<FilterRuleSet>({
    ...defaultFilterRuleSet,
    time: "New",
  });
  const oneWeekAgo = new Date(updatedTime).valueOf() - 1000 * 60 * 60 * 24 * 7;

  const handleReset = (key: keyof FilterRuleSet) => {
    const resetRule = { [key]: defaultFilterRuleSet[key] };
    updateFilterRuleSet(Object.assign({}, filterRuleSet, resetRule));
  };

  const timeFilter = (
    items: NotionItem[],
    rules: FilterRuleSet
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
    rules: FilterRuleSet
  ): NotionItem[] => {
    return rules.text !== ""
      ? items.filter((v) => {
          const words = rules.text.toLowerCase().split(" ");
          const target = `${v.name.toLowerCase()} ${v.twitter} ${v.bluesky}`;

          return words.reduce((result, word) => {
            if (result) return result;
            return target.includes(word);
          }, false);
        })
      : items;
  };

  const customDomainFilter = (items: NotionItem[], rules: FilterRuleSet) => {
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

  const verifiedFilter = (items: NotionItem[], rules: FilterRuleSet) => {
    return rules.verified
      ? items.filter((a) => {
          return a.status !== "未移行（未確認）";
        })
      : items;
  };

  const filters = [textFilter, timeFilter, customDomainFilter, verifiedFilter];

  const filteredItems = filters.reduce((items, filter) => {
    return filter(items, filterRuleSet);
  }, items);

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
          まだ来てないアカウント
        </button>
      </div>

      <div className={styles.database}>
        <FilterRuleSetConfig
          filterRuleSet={filterRuleSet}
          handleUpdateRules={(filterRuleSet) =>
            updateFilterRuleSet(filterRuleSet)
          }
        />
        <AccountList
          filterRuleSet={filterRuleSet}
          handleReset={handleReset}
          items={databaseType === "standard" ? standardItems : wantsItems}
          categoryList={categoryList}
          updatedTime={updatedTime}
        />
      </div>
    </>
  );
};
