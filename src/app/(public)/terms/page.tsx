import { Metadata } from "next";
import { GlobalHeaderServer as GlobalHeader } from "src/components/GlobalHeaderServer";
import { HeroImage } from "src/components/HeroImage";
import { ShareButtons } from "src/components/ShareButtons";

export const metadata: Metadata = {
  title: "利用規約 - Bluesky公式アカウント移行まとめ",
  description:
    "Bluesky公式アカウント移行まとめの利用規約およびクレジットです。",
  alternates: {
    canonical: "https://bluesky-official-accounts.vercel.app/terms",
  },
  openGraph: {
    siteName: "Bluesky公式アカウント移行まとめ",
    title: "利用規約 - Bluesky公式アカウント移行まとめ",
    description: "Bluesky公式アカウント移行まとめの利用規約およびクレジットです。",
    url: "https://bluesky-official-accounts.vercel.app/terms",
    type: "article",
  },
};

export default function TermsPage() {
  return (
    <>
      <header className="header">
        <GlobalHeader />
      </header>
      <div>
        <HeroImage id="terms" />

        <div className="page-content">
          <section className="page-section">
            <h1>利用規約</h1>
            <h2 className="page-section-title">サービスについて</h2>
            <p>
              本サービスは、X（旧Twitter）からBlueskyへ移行した公式アカウント・団体アカウントの情報を収集・掲載するリストサービスです。
            </p>
          </section>

          <section className="page-section">
            <h2 className="page-section-title">掲載情報について</h2>
            <p>
              掲載情報はボランティアのモデレーターによって管理されています。情報の正確性・完全性・最新性を保証するものではありません。掲載内容に誤りがある場合は、フォームよりご連絡ください。
            </p>
          </section>

          <section className="page-section">
            <h2 className="page-section-title">申請・投稿について</h2>
            <p>
              アカウントの登録申請およびリクエストを行う場合、虚偽の情報を送信することを禁止します。スパムや嫌がらせを目的とした申請は削除し、以降の申請をお断りする場合があります。
            </p>
          </section>

          <section className="page-section">
            <h2 className="page-section-title">禁止事項</h2>
            <p>本サービスの利用にあたり、以下の行為を禁止します。</p>
            <ul>
              <li>虚偽の情報による申請</li>
              <li>本サービスへの不正アクセスや妨害行為</li>
              <li>自動化ツールによる過度なアクセス</li>
            </ul>
          </section>

          <section className="page-section">
            <h2 className="page-section-title">免責事項</h2>
            <p>
              本サービスの利用によって生じたいかなる損害についても、運営者は責任を負いません。
            </p>
          </section>

          <section className="page-section">
            <h2 className="page-section-title">変更・終了</h2>
            <p>
              本サービスおよび本規約は、予告なく変更または終了する場合があります。
            </p>
            <p>最終更新日：2026年3月28日</p>
          </section>

          <hr className="page-separator" />

          <section className="page-section">
            <h1>クレジット</h1>
            <p>本サービスでは以下の素材を使用しています。</p>
            <ul>
              <li>
                <a href="https://fontawesome.com">Font Awesome 6 Free</a>
              </li>
              <li>
                <a href="https://github.com/googlefonts/noto-emoji">
                  Noto Emoji
                </a>
              </li>
              <li>
                <a href="https://unsplash.com">Unsplash</a>
              </li>
            </ul>
          </section>

          <footer className="page-footer">
            <ShareButtons />
          </footer>
        </div>
      </div>
    </>
  );
}