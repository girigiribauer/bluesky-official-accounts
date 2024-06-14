import { NotionItem } from "src/models/Notion";
import { fetchNotion } from "../lib/fetchNotion";
import { Metadata } from "next";
import Image from "next/image";
import styles from "./page.module.scss";
import { extractBluesky, extractTwitter } from "src/lib/extractFromURL";

type NotionItemsWithLabel = {
  label: string;
  items: NotionItem[];
};

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Bluesky 公式アカウント移行まとめ",
  description:
    "X（Twitter）からBlueskyへの移行を促進するために、公式アカウントの移行状況をまとめています。有志でまとめていますので、みんなで移行を促進していきましょう！",
};

export default async function Home() {
  const data = await fetchNotion(10000);
  const blueskyAccounts = data.items.filter(
    (a) => a.status !== "未移行（未確認）"
  );

  const categorizedData = data.items.reduce<NotionItemsWithLabel[]>(
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
    <main className={styles.main}>
      <h1 className={styles.title}>
        <div className={styles.hero}>
          <Image
            src="/bluesky-official-accounts.jpg"
            alt="Bluesky 公式アカウント移行まとめ - X(Twitter) から Bluesky への移行状況をまとめ、移行を促進しています"
            width={1600}
            height={900}
          />
        </div>
      </h1>
      <h2 className={styles.heading}>公式アカウントの投稿をお願いします！</h2>
      <p>
        みなさんの思う公式アカウントは人それぞれです。最大公約数の公式アカウントの移行リストをみんなで作るために、
        <strong>
          公式アカウントがあれば、ぜひともフォームから投稿してください！
        </strong>
        有志が時間差でチェックされたものが公開されます！
      </p>
      <p>
        また、カスタムドメイン化など、ステータスが変更されたものも改めて投稿お願いします！
      </p>
      <a
        href="https://www.notion-easy-form.com/forms/81d61322-e823-4068-afbb-ae964c2d6f3f"
        target="_blank"
      >
        https://www.notion-easy-form.com/forms/81d61322-e823-4068-afbb-ae964c2d6f3f
      </a>

      <h2 className={styles.heading}>アカウントの移行ステータスについて</h2>
      <ul className={styles.statusList}>
        <li>
          <span className={styles.status} data-status="未移行（未確認）">
            未移行（未確認）
          </span>
          Bluesky 上にアカウントが存在していない or 本物の確認が取れていない
        </li>
        <li>
          <span className={styles.status} data-status="アカウント作成済">
            アカウント作成済
          </span>
          アカウントだけが存在しているか、最初の1回程度の挨拶がされている
        </li>
        <li>
          <span className={styles.status} data-status="両方運用中">
            両方運用中
          </span>
          X(Twitter) も Bluesky も両方運用されている状態
        </li>
        <li>
          <span className={styles.status} data-status="Bluesky 完全移行">
            Bluesky 完全移行
          </span>
          X(Twitter) の運用を停止し、完全に Bluesky に移行した状態
        </li>
      </ul>
      <hr className={styles.separator} />
      <ul className={styles.databaseMeta}>
        <li>
          <time>
            {new Date(data.updatedTime).toLocaleDateString("ja-JP")}{" "}
            時点の最新データ
          </time>
        </li>
        <li>
          合計: {data.items.length} 件（Bluesky
          アカウントの本人確認が取れたもの:
          {blueskyAccounts.length} 件）
        </li>
      </ul>
      <div className={styles.database}>
        {categorizedData.map(({ label, items }) => (
          <section key={label}>
            <details className={styles.databaseDetails} open>
              <summary className={styles.databaseSummary}>
                <h2 className={styles.databaseHeading}>{label}</h2>
                <span className={styles.databaseTotal}>{items.length}</span>
              </summary>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.tableName}>名前</th>
                    <th className={styles.tableStatus}>ステータス</th>
                    <th className={styles.tableTw}>X(Twitter)</th>
                    <th className={styles.tableBs}>Bluesky</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(({ id, name, status, twitter, bluesky }) => (
                    <tr key={id} className={styles.item}>
                      <td className={styles.tableName}>
                        <h3 className={styles.itemName}>{name}</h3>
                      </td>
                      <td className={styles.tableStatus}>
                        <span className={styles.status} data-status={status}>
                          {status}
                        </span>
                      </td>
                      <td className={styles.tableTw}>
                        <a
                          className={styles.itemLink}
                          href={twitter}
                          target="_blank"
                        >
                          {twitter ? extractTwitter(twitter) : ""}
                        </a>
                      </td>
                      <td className={styles.tableBs}>
                        <a
                          className={styles.itemLink}
                          href={bluesky}
                          target="_blank"
                        >
                          {bluesky ? extractBluesky(bluesky) : ""}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </section>
        ))}
      </div>
    </main>
  );
}
