import { Metadata } from "next";
import Image from "next/image";
import { GlobalHeader } from "src/components/GlobalHeader";
import { ShareButtons } from "src/components/ShareButtons";
import { RequestForm } from "./RequestForm";

import styles from "./page.module.scss";

export const metadata: Metadata = {
  title:
    "Bluesky来て欲しいアカウント登録フォーム - Bluesky公式アカウント移行まとめ",
  description:
    "オープン・パブリックな Bluesky の世界へ移行しよう！X(Twitter)からBlueskyへ移行した公式アカウントを集約している移行まとめです。Bluesky に来て欲しいアカウントのリクエストフォームはこちらです。",
  openGraph: {
    siteName: "Bluesky公式アカウント移行まとめ",
    title:
      "Bluesky来て欲しいアカウント登録フォーム - Bluesky公式アカウント移行まとめ",
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
        <div className="page-hero-image">
          <Image
            src="/hero-contribution.png"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
          />
        </div>

        <div className="page-content">
          <section className="page-section">
            <h1>来て欲しいアカウント登録フォーム</h1>
            <p>
              投稿前に、『<a href="/contribution">あなたが貢献できること</a>』『
              <a href="/faq">よくあるご質問</a>
              』のページをよく読んで、掲載すべきアカウントかどうかをしっかりと確認してから投稿ください。
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
