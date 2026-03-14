import { fetchAccounts, fetchCategories, fetchNews } from "../lib/fetchNotion";
import Image from "next/image";
import { Metadata } from "next";
import { ShareButtons } from "src/components/ShareButtons";
import { NewsList } from "src/components/NewsList";
import { GlobalHeader } from "src/components/GlobalHeader";
import { TransitionStatusList } from "src/components/TransitionStatusList";
import { Database } from "src/components/Database";
import { PageNavigation } from "src/components/PageNavigation";
import styles from "./page.module.scss";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Bluesky公式アカウント移行まとめ",
  description:
    "オープン・パブリックな Bluesky の世界へ移行しよう！X(Twitter)からBlueskyへ移行した公式アカウントを集約している移行まとめです。移行の検討にご活用ください。",
  openGraph: {
    siteName: "Bluesky公式アカウント移行まとめ",
    title: "Bluesky公式アカウント移行まとめ",
    url: "https://bluesky-official-accounts.vercel.app/",
    type: "website",
  },
};

export default async function Home() {
  const accountList = await fetchAccounts();
  const news = await fetchNews();
  const categoryList = await fetchCategories();

  return (
    <>
      <header className="header">
        <GlobalHeader />
      </header>
      <div className="page-hero-image">
        <Image
          src="/hero-accountlist.png"
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
        />
      </div>

      <div className="page-content">
        <section className="page-section">
          <h1>
            <Image className={styles.butterfly} src="/butterfly.svg" alt="" width={36} height={32} aria-hidden="true" /> オープン・パブリックな Bluesky の世界へ移行しよう！
          </h1>
          <p>
            あなたの企業・組織はちゃんと<span className={styles.highlight}>オープン</span>な場で情報発信できていますか？ログインなしに情報に<span className={styles.highlight}>アクセス</span>できますか？
            <br />
            もうすでに多くのユーザーが移行している Bluesky において、<span className={styles.highlight}>あなたの企業・組織が Bluesky で情報発信を始めるのをみなさん待ち望んでいます！</span>
          </p>
          <TransitionStatusList />
        </section>

        <div className={styles.accountListArea}>
          <div className={styles.accountListInner}>
            <Database accountList={accountList} categoryList={categoryList} />
          </div>
        </div>

        <div className="page-section">
          <NewsList items={news} />
        </div>

        <footer className="page-footer">
          <PageNavigation next="open-public" />
          <ShareButtons />
        </footer>
      </div>
    </>
  );
}
