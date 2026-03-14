import { Metadata } from "next";
import Image from "next/image";
import { GlobalHeader } from "src/components/GlobalHeader";
import { LinkCard } from "src/components/LinkCard";
import { ShareButtons } from "src/components/ShareButtons";

export const metadata: Metadata = {
  title:
    "Bluesky来て欲しいアカウント登録フォーム - Bluesky公式アカウント移行まとめ",
  robots: { index: false },
};

export default function RequestCompletePage() {
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
              投稿ありがとうございました！🎉
              <br />
              モデレーターの方々がチェックし問題なければリストに反映されます！
            </p>
            <div className="link">
              <a href="/contribution/request">続けてアカウントを登録する</a>
            </div>
          </section>

          <hr className="page-separator" />

          <section className="page-section">
            <h2 className="page-section-title">
              分野ごとのモデレーターとして貢献してみませんか？
            </h2>
            <p>
              アカウント投稿の延長上の協力として、投稿されたものをチェックする貢献も強く募集しています。アカウントの投稿よりもチェックする側が慢性的に足りていませんので、ぜひともご協力ください。
            </p>
            <LinkCard
              href="/moderation"
              title="移行まとめモデレーションサイト"
              description="投稿されたアカウントのチェックや、分野ごとのモデレーションを行うサイトです（構築中）"
              imageSrc="/hero-moderation.png"
            />
          </section>

          <hr className="page-separator" />

          <footer className="page-footer">
            <ShareButtons />
          </footer>

        </div>
      </div>
    </>
  );
}
