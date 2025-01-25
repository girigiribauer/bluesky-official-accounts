import { Metadata } from "next";
import { GlobalHeader } from "src/components/GlobalHeader";
import { ModalContents } from "src/components/ModalContents";
import { ShareButtons } from "src/components/ShareButtons";

import styles from "./page.module.scss";
import Image from "next/image";

export const metadata: Metadata = {
  title: "便利な機能 - Bluesky 公式アカウント移行まとめ #青空公式アカウント",
  description:
    "誰も投稿してない公式アカウントを見つけたら、フォームから投稿してください！他にも協力できることがたくさんあります！",
  openGraph: {
    siteName: "Bluesky 公式アカウント移行まとめ",
    title: "便利な機能 - Bluesky 公式アカウント移行まとめ #青空公式アカウント",
    url: "https://bluesky-official-accounts.vercel.app/features",
    type: "website",
  },
};

export default async function Home() {
  return (
    <>
      <header className="header">
        <GlobalHeader />
      </header>
      <div className={styles.container}>
        <h1>便利な機能</h1>

        <h2>移行まとめサイトアカウント</h2>
        <a
          className={styles.image}
          href="https://bsky.app/profile/official-accounts.bsky.social"
          target="_blank"
        >
          <Image src="/account.jpg" alt="" width={400} height={225} />
          <p>→公式アカウント移行まとめ（仮運用中）</p>
        </a>
        <p>
          定期的に更新情報や移行具合をお知らせしていくアカウントです。
          <br />
          よろしければフォローしてください！
        </p>
        <p>今後 Bluesky アカウントを活用した他機能も提供していきます。</p>

        <p className={styles.link}>
          <a
            href="https://bsky.app/profile/official-accounts.bsky.social"
            target="_blank"
          >
            →公式アカウント移行まとめ（仮運用中）
          </a>
        </p>

        <hr />

        <ShareButtons />
      </div>
      <ModalContents />
    </>
  );
}
