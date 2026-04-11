import { Metadata } from "next";
import { GlobalHeaderServer as GlobalHeader } from "src/components/GlobalHeaderServer";
import { HeroImage } from "src/components/HeroImage";
import { ShareButtons } from "src/components/ShareButtons";
import { RequestForm } from "src/components/RequestForm";

import styles from "./page.module.scss";

export const metadata: Metadata = {
  title:
    "Bluesky来て欲しいアカウント登録フォーム - Bluesky公式アカウント移行まとめ",
  description:
    "オープン・パブリックな Bluesky の世界へ移行しよう！X(Twitter)からBlueskyへ移行した公式アカウントを集約している移行まとめです。Bluesky に来て欲しいアカウントのリクエストフォームはこちらです。",
  alternates: {
    canonical: "https://bluesky-official-accounts.vercel.app/contribution/request",
  },
  openGraph: {
    siteName: "Bluesky公式アカウント移行まとめ",
    title:
      "Bluesky来て欲しいアカウント登録フォーム - Bluesky公式アカウント移行まとめ",
    description:
      "オープン・パブリックな Bluesky の世界へ移行しよう！X(Twitter)からBlueskyへ移行した公式アカウントを集約している移行まとめです。Bluesky に来て欲しいアカウントのリクエストフォームはこちらです。",
    url: "https://bluesky-official-accounts.vercel.app/contribution/request",
    type: "article",
    images: ["https://bluesky-official-accounts.vercel.app/contribution/opengraph-image.jpg"],
  },
};

export default function RequestPage() {
  return (
    <>
      <header className="header">
        <GlobalHeader />
      </header>
      <div>
        <HeroImage id="contribution" />

        <div className="page-content">
          <section className="page-section">
            <h1>来て欲しいアカウント登録フォーム</h1>
            <p>
              投稿前に、『<a href="/contribution">あなたが貢献できること</a>』『
              <a href="/faq">よくあるご質問</a>
              』のページをよく読んで、掲載すべきアカウントかどうかをしっかりと確認してから投稿ください。
            </p>
            <p>
              ※フォームを内製に切り替えました。万が一正しく動かない場合は Bluesky アカウントまで直接お知らせください。
            </p>
          </section>

          <div className={styles.formArea}>
            <RequestForm />
          </div>


          <footer className="page-footer">
            <ShareButtons />
          </footer>

        </div>
      </div>
    </>
  );
}
