"use client";

import { NotionItem, CategorizedNotionItems } from "src/models/Notion";
import { useEffect, useState, useId } from "react";
import { Criteria } from "src/models/Criteria";
import type { FilterRules } from "src/models/FilterRules";
import { GroupedVirtuoso } from "react-virtuoso";
import { AccountGroupHeader } from "./AccountGroupHeader";
import { AccountItem } from "./AccountItem";
import { FilterRuleResults } from "./FilterRuleResults";
import { AccountSummaryHeader } from "./AccountSummaryHeader";

import styles from "./AccountList.module.scss";

export type AccountListProps = {
  filterRules?: FilterRules | null;
  handleReset?: (key: keyof FilterRules) => void;
  items: NotionItem[];
  criteriaList?: Criteria[];
  updatedTime: string;
};

export const AccountList = ({
  filterRules = null,
  handleReset = () => {},
  items,
  criteriaList = [],
  updatedTime,
}: AccountListProps) => {
  const prefix = useId();

  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});
  const [popupID, setPopupID] = useState<string | null>(null);

  const blueskyAccountsTotal = items.filter(
    (a) => a.status !== "未移行（未確認）"
  ).length;
  const categorizedItems = items.reduce<CategorizedNotionItems[]>(
    (acc, item) => {
      let found = acc.find((v) => v.title === item.category);
      if (!found) {
        const criteria =
          criteriaList.find(({ category }) => category === item.category)
            ?.criteria ?? "";
        found = { title: item.category, criteria, items: [] };
        acc.push(found);
      }
      found.items.push(item);
      return acc;
    },
    []
  );

  const groupCounts = categorizedItems.map((a) => a.items.length);

  const handleSelectAllCategory = () => {
    const categoryTitles = categorizedItems.reduce((acc, item) => {
      return { ...acc, [`${prefix}_${item.title}`]: true };
    }, {});
    setToggleStates(categoryTitles);
  };

  const handleUnselectAllCategory = () => {
    setToggleStates({});
  };

  const handleSelectCategory = (titleWithPrefix: string) => {
    const newToggleStates = { ...toggleStates };

    if (titleWithPrefix in toggleStates) {
      delete newToggleStates[titleWithPrefix];
    } else {
      newToggleStates[titleWithPrefix] = true;
    }
    setToggleStates(newToggleStates);

    const element = document.getElementById(titleWithPrefix);
    if (!element) return;
    element.scrollIntoView({ behavior: "instant" });
  };

  const handleShowPopup = (id: string | null) => {
    setPopupID(id);
  };

  // アカウントリストに変更があったら一旦全部閉じる
  useEffect(() => {
    setToggleStates({});
  }, [items]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <AccountSummaryHeader
          total={items.length}
          blueskyAccountsTotal={blueskyAccountsTotal}
          updatedTime={updatedTime}
          handleOpen={handleSelectAllCategory}
          handleClose={handleUnselectAllCategory}
        />

        <FilterRuleResults
          filterRules={filterRules}
          handleReset={handleReset}
        />
      </div>

      <GroupedVirtuoso
        style={{ height: 400 }}
        className={styles.virtualScroll}
        groupCounts={groupCounts}
        groupContent={(index) => {
          const { title, items, criteria } = categorizedItems[index];
          const total = items.length;
          return (
            <AccountGroupHeader
              title={title}
              total={total}
              criteria={criteria}
              handleSelect={() => handleSelectCategory(`${prefix}_${title}`)}
            />
          );
        }}
        itemContent={(index) => {
          const item = items[index];
          return (
            <AccountItem
              item={item}
              popupID={popupID}
              handleShowPopup={handleShowPopup}
            />
          );
        }}
      />
    </div>
  );
};
