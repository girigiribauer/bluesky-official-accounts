"use client";

import { NotionItem } from "src/models/Notion";
import styles from "./TableViewWithFilter.module.scss";
import { useState } from "react";
import { TableView } from "./TableView";
import { DebouncedInput } from "./DebouncedInput";

export type TableViewWithFilterProps = {
  items: NotionItem[];
  updatedTime: string;
};

export const TableViewWithFilter = ({
  items,
  updatedTime,
}: TableViewWithFilterProps) => {
  const [title, setTitle] = useState<string>("");
  const [isNewer, setNewer] = useState<boolean>(true);
  const [isUpdate, setUpdate] = useState<boolean>(false);
  const [isCustomDomain, setCustomDomain] = useState<boolean>(false);

  const titleFilter = (items: NotionItem[], title: string): NotionItem[] => {
    return title !== ""
      ? items.filter((v) => v.name.toLowerCase().includes(title.toLowerCase()))
      : items;
  };

  const newerFilter = (items: NotionItem[], isNewer: boolean): NotionItem[] => {
    const limit = new Date(updatedTime).valueOf() - 1000 * 60 * 60 * 24 * 7;

    return isNewer
      ? items.filter((a) => new Date(a.createdTime).valueOf() >= limit)
      : items;
  };

  const updateFilter = (
    items: NotionItem[],
    isUpdate: boolean
  ): NotionItem[] => {
    const limit = new Date(updatedTime).valueOf() - 1000 * 60 * 60 * 24 * 7;

    return isUpdate
      ? items.filter((a) => new Date(a.updatedTime).valueOf() >= limit)
      : items;
  };

  const customDomainFilter = (items: NotionItem[], isCustomDomain: boolean) => {
    return isCustomDomain
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

  const filteredItems = customDomainFilter(
    updateFilter(newerFilter(titleFilter(items, title), isNewer), isUpdate),
    isCustomDomain
  );

  const handleChangeTitle = (value: string) => {
    setTitle(value);
  };

  return (
    <>
      <div className={styles.filters}>
        <span className={styles.filterLabel}>
          <i className="fa-solid fa-magnifying-glass" />
          <span>絞り込み</span>
        </span>
        <ul className={styles.filterList}>
          <li className={styles.filterItem}>
            <label>
              <input
                type="checkbox"
                defaultChecked={isNewer}
                onChange={(e) => setNewer(e.target.checked)}
              />
              1週間以内に追加があったもののみ表示する
            </label>
          </li>
          <li className={styles.filterItem}>
            <label>
              <input
                type="checkbox"
                defaultChecked={isUpdate}
                onChange={(e) => setUpdate(e.target.checked)}
              />
              1週間以内に追加・変更があったもののみ表示する
            </label>
          </li>
          <li className={styles.filterItem}>
            <label>
              <DebouncedInput
                defaultValue={title}
                handleChange={handleChangeTitle}
              />
              を含むアカウントのみ表示する
            </label>
          </li>
          <li className={styles.filterItem}>
            <label>
              <input
                type="checkbox"
                defaultChecked={isCustomDomain}
                onChange={(e) => setCustomDomain(e.target.checked)}
              />
              カスタムドメインのアカウントのみ表示する
            </label>
          </li>
        </ul>
      </div>

      <TableView prefix="a" items={filteredItems} updatedTime={updatedTime} />
    </>
  );
};
