"use client";

import { Category } from "src/models/Category";
import { useMemo, useState } from "react";
import { AccountListView } from "./AccountListView";
import { FilterRuleSet } from "src/models/FilterRuleSet";
import { FilterRuleSetConfig } from "./FilterRuleSetConfig";
import { applyFilters } from "src/lib/accountFilters";

import styles from "./AccountDirectory.module.scss";
import { AccountList } from "src/models/AccountList";

export type AccountDirectoryProps = {
  accountList: AccountList;
  categoryList: Category[];
};

// 表示するアカウント種別（移行済み / 来て欲しい）
type ListKind = "standard" | "wants";

export const AccountDirectory = ({ accountList, categoryList }: AccountDirectoryProps) => {
  const { updatedTime, accounts } = accountList;
  const [listKind, setListKind] = useState<ListKind>("standard");

  const defaultFilterRuleSet: FilterRuleSet = {
    time: "None",
    text: "",
    customDomain: false,
    verified: false,
  };
  const [filterRuleSet, updateFilterRuleSet] =
    useState<FilterRuleSet>(defaultFilterRuleSet);
  const oneWeekAgo = new Date(updatedTime).valueOf() - 1000 * 60 * 60 * 24 * 7;

  const handleReset = (key: keyof FilterRuleSet) => {
    const resetRule = { [key]: defaultFilterRuleSet[key] };
    updateFilterRuleSet(Object.assign({}, filterRuleSet, resetRule));
  };

  const filteredAccounts = applyFilters(accounts, filterRuleSet, oneWeekAgo);

  const standardItems = useMemo(
    () => filteredAccounts.filter((a) => a.status !== "not_migrated"),
    [filteredAccounts]
  );

  const wantsItems = useMemo(
    () => filteredAccounts.filter((a) => a.status === "not_migrated"),
    [filteredAccounts]
  );

  return (
    <>
      <div className={styles.kindSwitch}>
        <select
          className={styles.kindSelect}
          value={listKind}
          onChange={(e) => setListKind(e.currentTarget.value as ListKind)}
        >
          <option value="standard">移行アカウント一覧</option>
          <option value="wants">来て欲しいアカウント一覧</option>
        </select>
      </div>

      <div className={styles.directory}>
        <FilterRuleSetConfig
          filterRuleSet={filterRuleSet}
          handleUpdateRules={(filterRuleSet) =>
            updateFilterRuleSet(filterRuleSet)
          }
        />
        <AccountListView
          filterRuleSet={filterRuleSet}
          handleReset={handleReset}
          items={listKind === "standard" ? standardItems : wantsItems}
          categoryList={categoryList}
          updatedTime={updatedTime}
        />
      </div>
    </>
  );
};
