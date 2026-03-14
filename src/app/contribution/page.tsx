import { Metadata } from "next";
import Image from "next/image";
import { GlobalHeader } from "src/components/GlobalHeader";
import { LinkCard } from "src/components/LinkCard";
import { PageNavigation } from "src/components/PageNavigation";
import { ShareButtons } from "src/components/ShareButtons";

export const metadata: Metadata = {
  title:
    "あなたが貢献できること - Bluesky公式アカウント移行まとめ",
  description:
    "オープン・パブリックな Bluesky の世界へ移行しよう！X(Twitter)からBlueskyへ移行した公式アカウントを集約している移行まとめです。移行まとめへの貢献方法を紹介しています。",
  openGraph: {
    siteName: "Bluesky公式アカウント移行まとめ",
    title:
      "あなたが貢献できること - Bluesky公式アカウント移行まとめ",
    url: "https://bluesky-official-accounts.vercel.app/contribution",
    type: "article",
  },
};

export default async function ContributionPage() {
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
            <h1>あなたの貢献が移行の促進に繋がります</h1>
            <p>
              2024年1月より『Bluesky公式アカウント移行まとめ』を提供してきました。
              みなさんの協力のおかげで移行の促進に一役買っています。
              Wikipedia と同じように、
              <strong>
                こちらはみなさんの共有財産です。
              </strong>
              まとめページのさらなる充実のために、引き続きみなさんのご協力をよろしくお願いします。
            </p>
            <LinkCard
              href="/contribution/register"
              title="Bluesky 公式アカウント登録フォーム"
              description={"リストにない公式アカウントを見つけたら投稿してください。来て欲しいアカウントもこちらから"}
              imageSrc="/hero-contribution.png"
            />
          </section>

          <section className="page-section">
            <h2 className="page-section-title">
              <span>分野ごとのモデレーターを募集しています</span>
            </h2>
            <p>
              <strong>現在、新たなモデレーションサイト構築に向けて、旧分類を見直し、新たな分野・分類として紐付け直しを図っています。</strong>
              <br />
              新しい分野では、分野ごとに有識者の方々が集まり、その中での分類作成や分類分けなどのモデレーションを行っていただくことを想定しています。
            </p>
            <p>
              これまで旧分類同士でどちらに属するのか曖昧になるケースが存在していましたが、<strong>新たな分野については、異なる分野で重複を許容するシステム</strong>にしていくつもりです。（例: 任天堂株式会社さんであれば、ゲームの興味分野とビジネスの興味分野のそれぞれに属する形）
            </p>
            <p>
              しばらく移行期間中は新旧両方を指定していただくことになるかと思います。お手数をおかけしますが、ご協力をよろしくお願いします。
            </p>
            <p>
              以下の URL にモデレーションサイトを構築する予定です。しばしお待ちください。
            </p>
            <LinkCard
              href="/moderation"
              title="移行まとめモデレーションサイト"
              description="投稿されたアカウントのチェックや、分野ごとのモデレーションを行うサイトです（構築中）"
              imageSrc="/hero-moderation.png"
            />
            {/*
            <div className={styles.placeholder} />
            */}
          </section>

          <section className="page-section">
            <h2 className="page-section-title">
              移行まとめを知らない方へのシェアをお願いします
            </h2>
            <p>
              Bluesky では、 X(Twitter)
              に比べると共通の話題でバズりづらい側面があります。あなたにとって既知の情報でも、知らない方にとってはまとめサイトがあることすら知りません。
            </p>
            <p>
              <strong>
                「公式アカウントどこ？」「公式全然いないんだけど」とポストしている方を見かけましたら、移行まとめの積極的なご紹介をお願いします。
              </strong>{" "}
              リストの充実、移行の促進にも繋がりますので、定期的にシェアしてくださると非常に助かります。
            </p>
            <p>
              ハッシュタグは{" "}
              <a href="https://bsky.app/search?q=%23%E7%A7%BB%E8%A1%8C%E3%81%BE%E3%81%A8%E3%82%81" target="_blank">
                #移行まとめ{" "}
                <i className="fa-solid fa-up-right-from-square" />
              </a>
              {" "}です。
            </p>
          </section>


          <footer className="page-footer">
            <PageNavigation prev="open-public" next="faq" />
            <ShareButtons />
          </footer>

        </div>
      </div>
    </>
  );
}
