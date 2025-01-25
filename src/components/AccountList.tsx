"use client";

import { NotionItem } from "src/models/Notion";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Category } from "src/models/Category";
import type { FilterRuleSet } from "src/models/FilterRuleSet";
import { GroupedVirtuoso } from "react-virtuoso";
import { AccountGroupHeader } from "./AccountGroupHeader";
import { AccountItem } from "./AccountItem";
import { FilterRuleTags } from "./FilterRuleTags";
import { AccountSummaryHeader } from "./AccountSummaryHeader";

import styles from "./AccountList.module.scss";

export type AccountListProps = {
  filterRuleSet?: FilterRuleSet | null;
  handleReset?: (key: keyof FilterRuleSet) => void;
  items: NotionItem[];
  categoryList?: Category[];
  updatedTime: string;
};

type CategoryGroup = {
  id: string;
  title: string;
  criteria: string;
  items: NotionItem[];
  total: number;
};

export const AccountList = ({
  filterRuleSet = null,
  handleReset = () => {},
  items,
  categoryList = [],
  updatedTime,
}: AccountListProps) => {
  const originalCategorizedItems: CategoryGroup[] = useMemo(
    () =>
      categoryList
        .map(({ id, title, criteria }) => {
          const categorizedItems = items.filter((a) => a.category === title);
          return {
            id,
            title,
            criteria,
            items: categorizedItems,
            total: categorizedItems.length,
          };
        })
        .filter((a) => a.total !== 0),
    [items, categoryList]
  );

  const [categoryToggleList, setCategoryToggleList] = useState<boolean[]>(
    Array.from({ length: originalCategorizedItems.length }, () => false)
  );
  const [popupID, setPopupID] = useState<string | null>(null);

  const total = useMemo(() => items.length, [items]);
  const blueskyAccountsTotal = useMemo(
    () => items.filter((a) => a.status !== "未移行（未確認）").length,
    [items]
  );

  const groupCounts = originalCategorizedItems.map((a, index) =>
    categoryToggleList[index] ? a.items.length : 0
  );

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

  const handleShowPopup = (id: string | null) => {
    setPopupID(id);
  };

  // アカウントリストに変更があったら一旦全部閉じる
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
        groupCounts={groupCounts}
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
          if (filteredItems.length <= 0) {
            return null;
          }
          const item = filteredItems[index];
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
