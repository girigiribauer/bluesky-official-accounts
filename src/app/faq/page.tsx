import { Metadata } from "next";
import Image from "next/image";
import { GlobalHeader } from "src/components/GlobalHeader";
import { PageNavigation } from "src/components/PageNavigation";
import { ShareButtons } from "src/components/ShareButtons";
import { BackToTopButton } from "src/components/BackToTopButton";

import styles from "./page.module.scss";

export const metadata: Metadata = {
  title: "よくあるご質問 - Bluesky公式アカウント移行まとめ",
  description:
    "オープン・パブリックな Bluesky の世界へ移行しよう！X(Twitter)からBlueskyへ移行した公式アカウントを集約している移行まとめです。移行まとめに関するよくある質問にお答えします。",
  openGraph: {
    siteName: "Bluesky公式アカウント移行まとめ",
    title:
      "よくあるご質問 - Bluesky公式アカウント移行まとめ",
    url: "https://bluesky-official-accounts.vercel.app/faq",
    type: "article",
  },
};

export default async function FaqPage() {
  return (
    <>
      <header className="header">
        <GlobalHeader />
      </header>
      <div>
        <div className="page-hero-image">
          <Image
            src="/hero-faq.png"
            alt=""
            fill
            style={{ objectFit: "cover", objectPosition: "center" }}
            priority
          />
        </div>

        <div className="page-content">
          <section className="page-section">
            <h1>よくあるご質問</h1>
            <p>
              多く聞かれることをよくあるご質問としてまとめています。
              <br />
              困っているすべての方に個別に説明することは難しいため、困ってそうな方にこちらのリンクを共有いただけますと助かります。
            </p>
            <ol className={styles.toc}>
              <li>
                <a href="#purpose">
                  公式アカウント移行まとめはどんな目的で作られていますか？
                </a>
              </li>
              <li>
                <a href="#criteria">
                  公式アカウントの定義は何ですか？どんなものを基準としていますか？
                </a>
              </li>
              <li>
                <a href="#ownership">
                  このリストは誰のものですか？自由に活用してもいいですか？
                </a>
              </li>
              <li>
                <a href="#identification">どうやって本物と確認していますか？</a>
              </li>
              <li>
                <a href="#certification">
                  公式アカウントであることの根拠ってどう示せばいいの？
                </a>
              </li>
              <li>
                <a href="#categorize">
                  投稿するときに適切な分類が見当たらないです
                </a>
              </li>
              <li>
                <a href="#modification">投稿内容が間違ってますよ</a>
              </li>
              <li>
                <a href="#duplicate">リストに重複がありますよ</a>
              </li>
              <li>
                <a href="#status_mismatch">
                  『両方運用中』なのに Bluesky 側の投稿が止まってます
                </a>
              </li>
              <li>
                <a href="#created_account">
                  『アカウント作成済』と『両方運用中』の違いは？
                </a>
              </li>
              <li>
                <a href="#unsuitable">
                  そのアカウントは掲載基準に合ってないのでは？
                </a>
              </li>
              <li>
                <a href="#filter_by_week">
                  なんか思ってたよりも掲載数が少なくなっています
                </a>
              </li>
              <li>
                <a href="#contribution">協力したいけどどうすれば？</a>
              </li>
              <li>
                <a href="#foreign_country">
                  外国のアカウントはどこまでが対象なの？
                </a>
              </li>
            </ol>
          </section>

          <hr className="page-separator" />

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="purpose" className="page-section-title">
              公式アカウント移行まとめはどんな目的で作られていますか？
            </h2>
            <p>
              <strong>X（旧Twitter）から Bluesky への移行の促進</strong>
              を目的にまとめています。公式アカウントの移行具合を1箇所にまとめて可視化することで、企業における
              Bluesky のアカウント運用の移行検討の資料に使っていただいたり、 Bluesky
              に移行しようとする方の後押しになったりと、様々な効果があります。
            </p>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="criteria" className="page-section-title">
              公式アカウントの定義は何ですか？どんなものを基準としていますか？
            </h2>
            <p>
              <strong>
                人には人の公式アカウントがあって、まとめサイト側で定義することは困難です。
              </strong>
              あなたが「これは公式アカウントではないでしょう」と思うものも、他の誰かにとっては公式アカウントだったりするものがあります。そのため、投稿されたアカウントは
              <strong>
                できるだけ「誰かにとっての公式アカウントであろう」という前提のもと判断
              </strong>
              しています。
            </p>
            <p>
              ただし、「俺が俺の公式アカウントだ！」みたいなものを無限に受け入れてしまうと、移行まとめとして非常に見づらいものが出来上がり、結果として移行を阻害してしまうため、分類ごとに一定の基準でリストに掲載しないこともあります。
            </p>
            <p>
              なお、リストに掲載すべき、すべきでないといった基準は、分類ごとに大きく状況が異なっており、一意に示すことが難しいです。（例:
              個人クリエイターは、作品1つ作るだけで名乗れてしまう）
              そのため、こちらとしては分類ごとに基準を可視化して、それに沿ったアカウントかどうかはみなさんの判断に委ねます。
            </p>
            <p>
              つまりまとめると、
              <strong>
                基本は投稿されたものを主義・思想・分類に関係なく全て掲載しつつも、掲載することで移行の促進に反するもののみ除外する
              </strong>
              、といったあたりを基準としています。
            </p>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="ownership" className="page-section-title">
              このリストは誰のものですか？自由に活用してもいいですか？
            </h2>
            <p>
              Bluesky
              公式アカウント移行まとめはみなさんの投稿で成り立っています。そのためこのリストはみなさんの
              <strong>共有財産</strong>
              です。ここから自由にフォローするなりリストを作るなり、
              <strong>自由に活用してください。</strong>
              ただし、移行の促進という目的に反する利用は禁止とします。
            </p>
            <p>
              一方で
              <strong>投稿の内容・リストの正確さに関しては一切の責任を持ちません。</strong>
              みなさんの投稿で成り立っている移行まとめです。問題があれば自分たちで直していきましょう。
            </p>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="identification" className="page-section-title">
              どうやって本物と確認していますか？
            </h2>
            <p>
              よくある誤解ですが、
              <strong>
                まとめサイト側で本人確認をしているわけではありませんし、公式かどうかを認証する組織ではありません。
              </strong>
              あくまで移行の促進のため、X（旧Twitter）と Bluesky
              とのアカウントが同一かどうかをチェックしているだけです。
            </p>
            <p>
              同一かどうかチェックするのは投稿していただくみなさんであり、
              <strong>必ず根拠込みで投稿していただき、それを第三者がチェック</strong>することで成立しています。
              まとめサイトの内側でチェックする有志の方々は、あくまでそれの集約・取りまとめを行なっているだけです。
            </p>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="certification" className="page-section-title">
              公式アカウントであることの根拠ってどう示せばいいの？
            </h2>
            <p>いくつかのケースが挙げられます。</p>
            <ul>
              <li>カスタムドメインが設定されている場合</li>
              <li>プロフィールに Bluesky へのリンクが掲載されている場合</li>
              <li>X(Twitter) の投稿で言及されている場合</li>
              <li>公式サイトにリンクが掲載されている場合</li>
            </ul>
            <p>これらを必要に応じてURL付きで示すことができれば、同一であることの根拠になります。</p>
            <p>一方で以下のケースは根拠になりません。</p>
            <ul>
              <li>X(Twitter) と Bluesky で同じ投稿をしている場合</li>
              <li>同じアイコンが設定されている</li>
              <li>名前が同じである</li>
              <li>Bluesky の投稿で言及されている場合</li>
            </ul>
            <p>
              中にはそういった方法で本物を騙ろうとする偽アカウントも発生していますのでご注意ください。
            </p>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="categorize" className="page-section-title">
              投稿するときに適切な分類が見当たらないです
            </h2>
            <p>
              現在、これまで運用してきた分類から、<strong>分野ごとの有識者によるモデレーションシステム</strong>に段階的に移行しています。
            </p>
            <p>
              旧分類については一番近そうな分類を選択してもらいつつ、根拠の方にその旨を記載しておいてください。
              <br />
              新しい分野については一番近い分野を選択していただき、どうしても複数にまたがる場合は3つまで選んでください。
            </p>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="modification" className="page-section-title">
              投稿内容が間違ってますよ
            </h2>
            <p>
              誤りを見つけたあなたがぜひとも<strong>修正投稿</strong>をしてください。
              <br />
              みんなのリストなので責任は等しくみんなにあります。
              気づいた方で修正していきましょう。
            </p>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="duplicate" className="page-section-title">
              リストに重複がありますよ
            </h2>
            <p>
              誤りを見つけたあなたがぜひとも<strong>修正投稿</strong>をしてください。
              <br />
              重複は基本的に仕組みで弾く運用になっていますが、チェック漏れもありますので、もし見かけた場合は通常のフォーム投稿と同様に報告いただき、根拠のところに重複である点を記載してください。
            </p>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="status_mismatch" className="page-section-title">
              『両方運用中』なのに Bluesky 側の投稿が止まってます
            </h2>
            <p>
              どの程度力を入れて SNS 運用するかは各アカウントによるので、
              <strong>そこまで責任持ちません。</strong>
            </p>
            <p>
              アカウントによってほとんど毎日投稿していて、1か月も投稿していないと運用していないとみなされちゃうものや、1か月に1回しか投稿しないものなどさまざまです。まとめサイト側で区別するのは、あくまで最初の
              <strong>『アカウント作成済』</strong>の状態か、その後運用開始した
              <strong>『両方運用中』</strong>
              の状態かのどちらかまでです。その後どのような運用方針を立てていようがこちらでは関知しません。
            </p>
            <p>
              あなたが移行の促進につながる移行まとめを手伝うと、Bluesky で投稿する重要度も上がって、投稿頻度の上昇にも繋がるかもしれません。ぜひご協力をお願いします。
            </p>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="created_account" className="page-section-title">
              『アカウント作成済』と『両方運用中』の違いは？
            </h2>
            <p>
              『アカウント作成済』は確認済みのアカウントのうち投稿数ゼロか、アカウント作成時と同時に1〜数回投稿しただけの状態を指します。
              <strong>
                期間を置いてさらに投稿していた場合は投稿間隔に関わらずすべて『両方運用中』です。
              </strong>
            </p>
            <ul>
              <li>
                例: 2024/1/1 に1件投稿、その後 2024/02/01
                に1件投稿していた場合は『両方運用中』
              </li>
              <li>
                例: 2024/1/1 に5件投稿、その後投稿がない場合は『アカウント作成済』
              </li>
            </ul>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="unsuitable" className="page-section-title">
              そのアカウントは掲載基準に合ってないのでは？
            </h2>
            <p>
              まとめサイト側では、分類ごとに一定の掲載基準を示すだけなので、掲載基準に合っていないと判断されるのなら、該当アカウントに対してその旨を改めて投稿してください。
              <br />
              みんなのリストなので責任も等しくみなさんにあります。みんなでまとめリストをより良いものにしていってください。
            </p>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="filter_by_week" className="page-section-title">
              なんか思ってたよりも掲載数が少なくなっています
            </h2>
            <p>
              もしかして<strong>『1週間以内に追加があったもののみ表示する』</strong>
              の絞り込みが有効になったもので確認していませんか？
            </p>
            <p>
              あるいは、全体の更新情報だけを見て「あれ、全然更新されていないなあ？」と判断していませんか？
              <strong>投稿されたものは随時リストに追加されています。</strong>
            </p>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="contribution" className="page-section-title">
              協力したいけどどうすれば？
            </h2>
            <p>
              以下のページをご確認ください。
            </p>
            <ul>
              <li>
                <a href="/contribution">あなたが貢献できること</a>
              </li>
              <li>
                <a href="/moderation">移行まとめモデレーションサイト</a>
              </li>
            </ul>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>

          <section className={["page-section", styles.faqSection].join(" ")}>
            <h2 id="foreign_country" className="page-section-title">
              外国のアカウントはどこまでが対象なの？
            </h2>
            <p>
              <strong>
                『日本における著名アカウント、もしくは国際的な著名アカウント』
              </strong>
              を全体の掲載基準とさせてください。
            </p>
            <p>
              このまとめサイト自体も日本語のみでの提供となっている点からも、基本的には日本語話者、日本語アカウントを対象としたものとなっており、国際的に著名なアカウントを含めたとしても、他国のローカルアカウント（その国では有名みたいな類のもの）まではチェック体制がカバーしきれない現状があります。
            </p>
            <p>
              また、移行の促進という観点から考えても、日本語話者が多く閲覧するであろうまとめサイトに、他国のローカルアカウントが掲載されることにより、移行の促進に繋がるかと言われると効果は相当薄い、あるいは知らないアカウントが増えてしまって逆効果になる可能性すらあると考えます。
            </p>
            <p>
              目的は世界中の公式アカウントを綺麗にリスト化することではなく、 X （旧
              Twitter ）から Bluesky への移行を促進させることなので、
              <strong>
                『日本における著名アカウント、もしくは国際的な著名アカウント』
              </strong>
              あたりを一旦の線引きとさせてください。（これまで投稿してくださった方、申し訳ないです）
            </p>
            <p className={styles.backToTop}>
              <BackToTopButton />
            </p>
          </section>


          <footer className="page-footer">
            <PageNavigation prev="features" />
            <ShareButtons />
          </footer>

        </div>
      </div>
    </>
  );
}
