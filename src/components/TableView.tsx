"use client";

import { NotionItem, NotionItemsWithLabel } from "src/models/Notion";
import Image from "next/image";
import styles from "./TableView.module.scss";
import { extractBluesky, extractTwitter } from "src/lib/extractFromURL";
import { promoteBlueskyURL, promoteTwitterURL } from "src/lib/promotion";
import { useState } from "react";

export type TableViewProps = {
  title: string;
  items: NotionItem[];
  isFiltered?: boolean;
};

export const TableView = ({
  title,
  items,
  isFiltered = false,
}: TableViewProps) => {
  const [filter, setFilter] = useState<string>("");

  const blueskyAccounts = items.filter((a) => a.status !== "未移行（未確認）");
  const filteredItems =
    isFiltered && filter !== ""
      ? items.filter((v) => v.name.toLowerCase().includes(filter.toLowerCase()))
      : items;
  const categorizedItems = filteredItems.reduce<NotionItemsWithLabel[]>(
    (acc, item) => {
      let found = acc.find((v) => v.label === item.category);
      if (!found) {
        found = { label: item.category, items: [] };
        acc.push(found);
      }
      found.items.push(item);
      return acc;
    },
    []
  );

  return (
    <div className={styles.tableView}>
      <header className={styles.tableHeader}>
        <h3 className={styles.tableTitle}>{title}</h3>
        <p className={styles.tableDesc}>
          本人確認済み:
          {blueskyAccounts.length} 件 / 全登録数: {items.length} 件
        </p>
      </header>

      {isFiltered ? (
        <div className={styles.filterBlock}>
          <input
            type="text"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
            }}
          />
          <span>で絞り込み</span>
          {filter !== "" ? <span>: {filteredItems.length} 件</span> : null}
        </div>
      ) : null}

      {categorizedItems.map(({ label, items }) => (
        <details className={styles.databaseDetails} key={label}>
          <summary className={styles.header}>
            <h2 className={styles.heading}>{label}</h2>
            <span className={styles.total}>{items.length}</span>
          </summary>
          <table>
            <thead>
              <tr>
                <th className={styles.cellName}>名前</th>
                <th className={styles.cellStatus}>ステータス</th>
                <th className={styles.cellTw}>X(Twitter)</th>
                <th className={styles.cellBs}>Bluesky</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const { id, name, status, twitter, bluesky } = item;
                return (
                  <tr key={id} className={styles.item}>
                    <td className={styles.cellName}>
                      <h3 className={styles.accountName}>{name}</h3>
                    </td>
                    <td className={styles.cellStatus}>
                      <span className="status" data-status={status}>
                        {status}
                      </span>
                    </td>
                    <td className={styles.cellLink}>
                      {twitter ? (
                        <div className={styles.link}>
                          <Image
                            className={styles.icon}
                            src="/icon-x.svg"
                            alt="X(Twitter)"
                            width={16}
                            height={16}
                          />
                          <a href={twitter} target="_blank">
                            {twitter ? extractTwitter(twitter) : ""}
                          </a>
                          <a
                            href={twitter ? promoteTwitterURL(item) : "#"}
                            target="_blank"
                          >
                            [宣伝]
                          </a>
                        </div>
                      ) : null}
                    </td>
                    <td className={styles.cellLink}>
                      {bluesky ? (
                        <div className={styles.link}>
                          <Image
                            className={styles.icon}
                            src="/icon-bluesky.svg"
                            alt="Bluesky"
                            width={16}
                            height={16}
                          />
                          <a href={bluesky} target="_blank">
                            {bluesky ? extractBluesky(bluesky) : ""}
                          </a>
                          <a
                            href={bluesky ? promoteBlueskyURL(item) : "#"}
                            target="_blank"
                          >
                            [宣伝]
                          </a>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </details>
      ))}
    </div>
  );
};
