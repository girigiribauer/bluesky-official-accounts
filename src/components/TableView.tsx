import { NotionItemsWithLabel } from "src/models/Notion";
import Image from "next/image";
import styles from "./TableView.module.scss";
import { extractBluesky, extractTwitter } from "src/lib/extractFromURL";
import { promoteBlueskyURL, promoteTwitterURL } from "src/lib/promotion";

export type TableViewProps = {
  categorizedData: NotionItemsWithLabel[];
};

export const TableView = ({ categorizedData }: TableViewProps) => {
  return (
    <div className={styles.tableView}>
      {categorizedData.map(({ label, items }) => (
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
