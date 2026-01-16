import { fetchAccounts, fetchCategories, fetchNews } from "../lib/fetchNotion";
import { Metadata } from "next";
import { ShareButtons } from "src/components/ShareButtons";
import { NewsList } from "src/components/NewsList";
import { GlobalHeader } from "src/components/GlobalHeader";
import { TransitionStatusList } from "src/components/TransitionStatusList";
import { Database } from "src/components/Database";
import { ModalContents } from "src/components/ModalContents";
import { PageNavigation } from "src/components/PageNavigation";

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
  const accountList = await fetchAccounts();
  const news = await fetchNews();
  const categoryList = await fetchCategories();

  return (
    <>
      <header className="header">
        <GlobalHeader />
      </header>
      <div>
        <h1>もうみなさんBlueskyへ移行されてます！</h1>
        <p>
          <strong>みなさんが見つけた公式アカウントを集約しています！</strong>
          <br />
          Bluesky
          への移行に踏みとどまってる方の背中を押すためにも、シェアなどの周知や各種出来ることをご協力願います！
        </p>

        <NewsList items={news} />

        <TransitionStatusList />

        <hr />

        <Database accountList={accountList} categoryList={categoryList} />

        <hr />

        <PageNavigation next="contribution" />

        <hr />

        <ShareButtons />
      </div>
      <ModalContents />
    </>
  );
}
