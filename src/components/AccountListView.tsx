"use client";

import { NotionItem } from "src/models/Notion";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Category } from "src/models/Category";
import { groupAccountsByCategory } from "src/lib/groupAccountsByCategory";
import type { FilterRuleSet } from "src/models/FilterRuleSet";
import { GroupedVirtuoso } from "react-virtuoso";
import { AccountGroupHeader } from "./AccountGroupHeader";
import { AccountItem } from "./AccountItem";
import { FilterRuleTags } from "./FilterRuleTags";
import { AccountSummaryHeader } from "./AccountSummaryHeader";

import styles from "./AccountListView.module.scss";

export type AccountListViewProps = {
  filterRuleSet?: FilterRuleSet | null;
  handleReset?: (key: keyof FilterRuleSet) => void;
  items: NotionItem[];
  categoryList?: Category[];
  updatedTime: string;
};

// react-virtuoso: 全グループのアイテム数が0だと警告が出るため、全閉じ時は先頭グループにダミーアイテムを1件入れて回避する
const PlaceholderItem = () => <div style={{ height: 1, overflow: "hidden" }} />;

export const AccountListView = ({
  filterRuleSet = null,
  handleReset = () => {},
  items,
  categoryList = [],
  updatedTime,
}: AccountListViewProps) => {
  const originalCategorizedItems = useMemo(
    () => groupAccountsByCategory(items, categoryList),
    [items, categoryList]
  );

  const [categoryToggleList, setCategoryToggleList] = useState<boolean[]>(
    Array.from({ length: originalCategorizedItems.length }, () => false)
  );

  const total = useMemo(() => items.length, [items]);
  const blueskyAccountsTotal = useMemo(
    () => items.filter((a) => a.status !== "not_migrated").length,
    [items]
  );

  const groupCounts = originalCategorizedItems.map((a, index) =>
    categoryToggleList[index] ? a.items.length : 0
  );

  const isAllClosed = groupCounts.every((c) => c === 0);
  const groupCountsWithPlaceholder = isAllClosed
    ? groupCounts.map((c, i) => (i === 0 ? 1 : c))
    : groupCounts;

  const filteredItems = originalCategorizedItems.reduce((acc, group, index) => {
    if (categoryToggleList[index]) {
      return [...acc, ...group.items];
    }
    return acc;
  }, [] as NotionItem[]);

  const handleSelectAllCategory = () => {
    setCategoryToggleList(
      Array.from({ length: originalCategorizedItems.length }, () => true)
    );
  };

  const handleUnselectAllCategory = useCallback(() => {
    setCategoryToggleList(
      Array.from({ length: originalCategorizedItems.length }, () => false)
    );
  }, [originalCategorizedItems]);

  const handleSelectCategory = (title: string) => {
    const newCategoryToggleList = categoryToggleList.map((a, i) => {
      if (title === originalCategorizedItems[i].title) {
        return !a;
      }
      return a;
    });

    setCategoryToggleList(newCategoryToggleList);
  };

  //アカウントリストに変更があったら一旦全部閉じる
  useEffect(() => {
    handleUnselectAllCategory();
  }, [items, handleUnselectAllCategory]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <AccountSummaryHeader
          total={total}
          blueskyAccountsTotal={blueskyAccountsTotal}
          updatedTime={updatedTime}
          handleOpen={handleSelectAllCategory}
          handleClose={handleUnselectAllCategory}
        />

        <FilterRuleTags
          filterRuleSet={filterRuleSet}
          handleReset={handleReset}
        />
      </div>

      <GroupedVirtuoso
        style={{ height: 500 }}
        className={styles.virtualScroll}
        groupCounts={groupCountsWithPlaceholder}
        groupContent={(index) => {
          if (index >= originalCategorizedItems.length) {
            return null;
          }

          const { title, total, criteria } = originalCategorizedItems[index];
          return (
            <AccountGroupHeader
              title={title}
              total={total}
              isOpen={categoryToggleList[index]}
              criteria={criteria}
              handleSelect={() => handleSelectCategory(title)}
            />
          );
        }}
        itemContent={(index) => {
          const item = filteredItems[index];
          if (!item) return <PlaceholderItem />;
          return <AccountItem item={item} />;
        }}
      />
    </div>
  );
};
