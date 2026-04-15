import { Metadata } from "next";
import Image from "next/image";
import { GlobalHeaderServer as GlobalHeader } from "src/components/GlobalHeaderServer";
import { HeroImage } from "src/components/HeroImage";
import { PageNavigation } from "src/components/PageNavigation";
import { ShareButtons } from "src/components/ShareButtons";

import styles from "./page.module.scss";

export const metadata: Metadata = {
  title:
    "企業・組織の皆様へ - Bluesky公式アカウント移行まとめ",
  description:
    "オープン・パブリックな Bluesky の世界へ移行しよう！X(Twitter)からBlueskyへ移行した公式アカウントを集約している移行まとめです。企業・組織向けに Bluesky 移行のメリットを解説しています。",
  alternates: {
    canonical: "https://bluesky-official-accounts.vercel.app/open-public",
  },
  openGraph: {
    siteName: "Bluesky公式アカウント移行まとめ",
    title:
      "企業・組織の皆様へ - Bluesky公式アカウント移行まとめ",
    description:
      "オープン・パブリックな Bluesky の世界へ移行しよう！X(Twitter)からBlueskyへ移行した公式アカウントを集約している移行まとめです。企業・組織向けに Bluesky 移行のメリットを解説しています。",
    url: "https://bluesky-official-accounts.vercel.app/open-public",
    type: "article",
  },
};

export default async function OpenPublicPage() {
  return (
    <>
      <header className="header">
        <GlobalHeader />
      </header>
      <div>
        <HeroImage id="open-public" />

        <div className="page-content">
          <section className="page-section">
            <h1>
              プラットフォームに依存しない、自社主体の「確実な情報発信」へ
            </h1>
            <p>
              SNS を特定の企業が提供する「閉じたサービス」としてではなく、公式サイトと同様の
              <strong>「開かれたインフラ」として捉え直す時期</strong>
              に来ています。{" "}
              Bluesky の基盤である{" "}
              <a href="https://atproto.com" target="_blank">
                atproto{" "}
                <i className="fa-solid fa-up-right-from-square" />
              </a>
              {" "}は、ログインの壁やアルゴリズムの不透明さを排し、組織が自らの意思で情報をコントロールできる自由な広報環境を提供します。
            </p>
          </section>

          <section className="page-section">
            <h2 className="page-section-title">
              独自ドメインで「アイデンティティ」の主権を自組織に置く
            </h2>
            <p>
              Blueskyでは、
              <strong>
                自社ドメイン（例：@example.com）をそのままハンドル名として使用できます。
              </strong>
              これはプラットフォームから付与される「バッジ」に依存せず、自ら公式性を証明する唯一無二の手段です。万が一の事態でも、あなたのデータを別のサーバーに移して使い続けられる仕組みが、長期的な情報資産を守ります。
            </p>
          </section>

          <section className="page-section">
            <h2 className="page-section-title">
              ログイン不要の「アクセシビリティ」で到達範囲を最大化する
            </h2>
            <p>
              2023年、 X(Twitter) はログイン必須化を一時導入し、外部からの閲覧が一時的に遮断されました。その後撤回されましたが、
              <strong>プラットフォームの判断ひとつで情報へのアクセスが制限されるリスクは現在も変わりません。</strong>
            </p>
            <p>
              Bluesky はWeb標準に準拠しており、アカウントを持たないユーザーや検索エンジンに対しても常に開かれています。情報の到達をプラットフォームの仕様に左右されず、公式サイトやプレスリリースと同じ透明性で届けられます。
            </p>
          </section>

          <section className="page-section">
            <h2 className="page-section-title">
              ゼロコストで RSS 連携ができます
            </h2>
            <p>
              Bluesky は全ての投稿を RSS フィードとして標準公開しているため、追加開発なしで公式サイトからの RSS フィードとしても利用可能です。（プロフィール URL に{" "}
              <strong>/rss</strong>
              {" "}とつけるだけで RSS フィードにアクセス可能です！）{" "}
              SNS を「また一つの更新作業」にするのではなく、情報配信の「起点」として活用してみるのはいかがでしょうか。
            </p>
          </section>

          <section className="page-section">
            <h1>X(Twitter) のみに依存し続ける広報リスク</h1>
            <Image
              src="/images/content-sinking-ship.png"
              alt=""
              width={1400}
              height={400}
              className={styles.contentImage}
            />
            <p>
              かつては唯一無二のインフラだったXは、今や頻繁な仕様変更や閲覧制限、アルゴリズムによる情報の選別など、発信側がコントロールできない不確実性を抱えています。{" "}
              <strong>
                広報の柱を X(Twitter) 一本に絞り続けることは、組織の言葉を外部の一企業の動向に委ねるリスクを伴います。
              </strong>
              広報においてオープンな場を確保しておくことは、現代におけるリスク分散といえるでしょう。
            </p>
          </section>

          <section className="page-section">
            <h2 className="page-section-title">
              運用負荷を最小限に抑える「クロスポスト」の選択肢
            </h2>
            <p>
              現在の運用を止める必要はありません。既存のフローに Bluesky というオープンなプラットフォームを追加し、
              <strong>クロスポストという形で段階的に移行を検討してみましょう。</strong>
              <br />
              クロスポストを低コストで加えるための、実務的なツール群を紹介します。
            </p>
            <ul>
              <li>
                <a href="https://buffer.com" target="_blank">
                  Buffer{" "}
                  <i className="fa-solid fa-up-right-from-square" />
                </a>
                {" "}: X と Bluesky に同時投稿できる定番ツール
              </li>
              <li>
                <a href="https://postpone.app" target="_blank">
                  Postpone{" "}
                  <i className="fa-solid fa-up-right-from-square" />
                </a>
                {" "}: AI が最適時間を提案するコスパ重視のスケジューラー
              </li>
              <li>
                <a href="https://ifttt.com" target="_blank">
                  IFTTT{" "}
                  <i className="fa-solid fa-up-right-from-square" />
                </a>
                {" "}/{" "}
                <a href="https://zapier.com" target="_blank">
                  Zapier{" "}
                  <i className="fa-solid fa-up-right-from-square" />
                </a>
                {" "}: ノーコードで Bluesky 投稿をほかのサービスと自動連携できるオートメーションツール
              </li>
              <li>
                <a href="https://socialbee.com" target="_blank">
                  SocialBee{" "}
                  <i className="fa-solid fa-up-right-from-square" />
                </a>
                {" "}: 過去投稿を自動で再利用できるコンテンツ管理型ツール
              </li>
            </ul>
            <p>
              まずはコストをかけずに、 Bluesky にも情報提供だけを行なってみる、というのはいかがでしょう？リスク分散の第一歩を始めてみましょう。
            </p>
          </section>

          <section className="page-section">
            <h2 className="page-section-title">
              クロスポストから始めて、徐々に Bluesky を主軸へ
            </h2>
            <p>
              <strong>
                クロスポストでの主軸を Bluesky に移し、情報提供だけを X(Twitter) で行う企業も増えてきています。
              </strong>
              <br />
              本来不必要な炎上リスクを避けつつも、ユーザーを完全に見捨てずに X で情報提供だけを行うスタイルは、現時点のSNS戦略の1つの最適解かもしれません。
            </p>
          </section>

          <section className="page-section">
            <h1>オープン・パブリックな Bluesky の世界へ移行しよう！</h1>
            <Image
              src="/images/content-noahs-ark.png"
              alt=""
              width={1400}
              height={400}
              className={styles.contentImage}
            />
            <p>
              無理に完全移行する必要はありません。まずはリスク分散の意味でも Bluesky にもチャンネルを作って情報発信から始めてみませんか？
              Bluesky ユーザーはあなたの企業・組織の情報発信をお待ちしてます！
            </p>
          </section>


          <footer className="page-footer">
            <PageNavigation prev="index" next="contribution" />
            <ShareButtons />
          </footer>

        </div>
      </div>
    </>
  );
}
