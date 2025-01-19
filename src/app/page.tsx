import { fetchAccounts, fetchCriteria, fetchNews } from "../lib/fetchNotion";
import { Metadata } from "next";
import styles from "./page.module.scss";
import { ShareButtons } from "src/components/ShareButtons";
import { NewsList } from "src/components/NewsList";
import { GlobalHeader } from "src/components/GlobalHeader";
import { TransitionStatusList } from "src/components/TransitionStatusList";
import { Database } from "src/components/Database";

export const metadata: Metadata = {
  title: "Bluesky 公式アカウント移行まとめ #青空公式アカウント",
  description:
    "もうみなさんBlueskyへ移行されてます！様々な分野の公式アカウントの移行状況のまとめサイトです！X（旧Twitter）からの移行の検討にご活用ください！",
  openGraph: {
    siteName: "Bluesky 公式アカウント移行まとめ",
    title: "Bluesky 公式アカウント移行まとめ #青空公式アカウント",
    url: "https://bluesky-official-accounts.vercel.app/",
    type: "website",
  },
};

export default async function Home() {
  const { updatedTime, items } = await fetchAccounts();
  const news = await fetchNews();
  const criteriaList = await fetchCriteria();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <GlobalHeader />
      </header>

      <h2>もうみなさんBlueskyへ移行されてます！</h2>
      <p>
        <strong>みなさんが見つけた公式アカウントを集約しています！</strong>
        <br />
        Bluesky
        への移行に踏みとどまってる方の背中を押すためにも、シェアなどの周知や各種出来ることをご協力願います！
      </p>

      <div className={styles.newsArea}>
        <h3>全体の更新情報</h3>
        <NewsList items={news} />
      </div>

      <div className={styles.statusArea}>
        <h3>
          <span>移行ステータスについて</span>
          <i className="hint">?</i>
        </h3>
        <TransitionStatusList />
      </div>

      <hr />

      <Database
        items={items}
        criteriaList={criteriaList}
        updatedTime={updatedTime}
      />

      <hr />

      <ShareButtons />
    </div>
  );
}
