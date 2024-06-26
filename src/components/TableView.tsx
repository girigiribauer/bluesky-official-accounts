"use client";

import { NotionItem, NotionItemsWithLabel } from "src/models/Notion";
import Image from "next/image";
import styles from "./TableView.module.scss";
import { extractBluesky, extractTwitter } from "src/lib/extractFromURL";
import { promoteBlueskyURL, promoteTwitterURL } from "src/lib/promotion";
import { useState } from "react";

export type TableViewProps = {
  updatedTime: string;
  items: NotionItem[];
};

export const TableView = ({ updatedTime, items }: TableViewProps) => {
  const [filter, setFilter] = useState<string>("");

  const blueskyAccounts = items.filter((a) => a.status !== "未移行（未確認）");
  const filteredItems =
    filter !== "" ? items.filter((v) => v.name.includes(filter)) : items;
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

  const time = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Tokyo",
  }).format(new Date(updatedTime));

  return (
    <>
      <ul className={styles.databaseMeta}>
        <li>
          <time>{time} 時点の最新データ</time>
        </li>
        <li>
          本人確認済み:
          {blueskyAccounts.length} 件 / 全登録数: {items.length} 件
        </li>
        <li>
          <input
            type="text"
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
            }}
          />
          <span>で絞り込み</span>
          {filter !== "" ? <span>: {filteredItems.length} 件</span> : null}
        </li>
      </ul>

      <div className={styles.tableView}>
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
    </>
  );
};
