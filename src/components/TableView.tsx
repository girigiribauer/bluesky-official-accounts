"use client";

import { NotionItem, CategorizedNotionItems } from "src/models/Notion";
import Image from "next/image";
import styles from "./TableView.module.scss";
import { extractBluesky, extractTwitter } from "src/lib/extractFromURL";
import { promoteBlueskyURL, promoteTwitterURL } from "src/lib/promotion";
// import { categoryCriteria } from "src/constants/categoryCriteria";
import { useEffect, useState } from "react";
import { ModalSource } from "./ModalSource";
import { Criteria } from "src/models/Criteria";

export type TableViewProps = {
  prefix: string;
  items: NotionItem[];
  criteriaList?: Criteria[];
  updatedTime: string;
};

export const TableView = ({
  prefix,
  items,
  criteriaList = [],
  updatedTime,
}: TableViewProps) => {
  // アカウントリストに変更があったら一旦全部閉じる
  useEffect(() => {
    setToggleStates({});
  }, [items]);

  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>({});
  const [popupID, setPopupID] = useState<string | null>(null);

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

  const blueskyAccounts = items.filter((a) => a.status !== "未移行（未確認）");
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
    element?.scrollIntoView({
      behavior: "instant",
    });
  };

  const handleShowPopup = (id: string | null) => {
    setPopupID(id);
  };

  return (
    <div className={styles.tableView}>
      <header className={styles.tableSummaryHeader}>
        <div className={styles.tableSummaryButtons}>
          <button
            className={styles.tableSummaryButton}
            onClick={handleSelectAllCategory}
          >
            <div className={styles.icon}>
              <i className="fa-solid fa-caret-down" />
            </div>
            <span className={styles.tableSummaryButtonLabel}>すべて開く</span>
          </button>
          <button
            className={styles.tableSummaryButton}
            onClick={handleUnselectAllCategory}
          >
            <div className={styles.icon}>
              <i className="fa-solid fa-caret-up" />
            </div>
            <span className={styles.tableSummaryButtonLabel}>すべて閉じる</span>
          </button>
        </div>
        <div className={styles.tableSummaryStatus}>
          <p className={styles.tableSummaryTotal}>
            {blueskyAccounts.length > 0
              ? `確認済み: ${blueskyAccounts.length} 件 / `
              : null}
            全登録数: {items.length} 件
          </p>
          <time className={styles.tableSummaryUpdate}>{time}</time>
        </div>
      </header>

      {categorizedItems.map(({ title, criteria, items }) => (
        <details
          className={styles.tableWrapper}
          id={`${prefix}_${title}`}
          key={`${prefix}_${title}`}
          open={toggleStates[`${prefix}_${title}`]}
        >
          <summary
            className={styles.tableGroupedHeader}
            onClick={(e) => {
              handleSelectCategory(`${prefix}_${title}`);
              e.preventDefault();
            }}
          >
            <div className={styles.tableGroupedLabel}>
              <h2 className={styles.tableGroupedHeading}>{title}</h2>
              <span className={styles.tableGroupedTotal}>{items.length}</span>
              {criteria ? (
                <span className={styles.tableGroupedCriteria}>
                  掲載基準: {criteria}
                </span>
              ) : null}
            </div>
            <div className={[styles.icon, styles.tableGroupedIcon].join(" ")}>
              <i className="fa-solid fa-caret-down" />
            </div>
          </summary>

          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.cellName}>名前</th>
                <th className={styles.cellStatus}>ステータス（根拠）</th>
                <th className={styles.cellTw}>X(Twitter)</th>
                <th className={styles.cellBs}>Bluesky</th>
              </tr>
            </thead>

            <tbody className={styles.tableBody}>
              {items.map((item) => {
                const { id, name, status, twitter, bluesky, source } = item;
                return (
                  <tr key={id} className={styles.item}>
                    <td className={styles.cellName}>
                      <h3 className={styles.accountName}>{name}</h3>
                    </td>
                    <td className={styles.cellStatus}>
                      <span
                        className={["status", styles.status].join(" ")}
                        data-status={status}
                        onClick={() => handleShowPopup(id)}
                      >
                        {status}
                      </span>

                      {popupID === id ? (
                        <ModalSource
                          title={`${name}の根拠`}
                          source={source}
                          handleClose={() => handleShowPopup(null)}
                        />
                      ) : null}
                    </td>
                    <td className={styles.cellLink}>
                      {twitter ? (
                        <div className={styles.cellLinkGroup}>
                          <Image
                            className={styles.cellLinkIcon}
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
                        <div className={styles.cellLinkGroup}>
                          <Image
                            className={styles.cellLinkIcon}
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
