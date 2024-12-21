import { Metadata } from "next";
import Image from "next/image";
import styles from "./page.module.scss";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "移行まとめで協力できること - Bluesky 公式アカウント移行まとめ #青空公式アカウント",
  description:
    "X（旧Twitter）からBlueskyへの移行を促進するために、みんなで協力し合っていることをまとめてあります！ぜひご一読ください！",
  openGraph: {
    title:
      "移行まとめで協力できること - Bluesky 公式アカウント移行まとめ #青空公式アカウント",
    url: "https://bluesky-official-accounts.vercel.app/contribution",
    type: "website",
  },
};

export default async function Home() {
  return (
    <div className={styles.container}>
      <p className="back">
        <Link href={"/"}>Bluesky 公式アカウント移行まとめに戻る</Link>
      </p>

      <h1>移行まとめで協力できること</h1>

      <div className="heroimage">
        <Image
          src="/contribution/opengraph-image.jpg"
          alt="公式アカウントをみんなでまとめてリストを X(Twitter) でシェアすると、企業でアカウント運用の検討が始まる / Bluesky 上に公式アカウントが増える / Bluesky に行ってもいいかなと思う人が増える / 有志でまとめていますので、みんなで移行を促進していきましょう！"
          width={960}
          height={540}
        />
      </div>

      <ul>
        <li>
          <a href="#share">来て欲しいアカウントの宣伝</a>
        </li>
        <li>
          <a href="#post">公式アカウントのフォーム投稿</a>
        </li>
        <li>
          <a href="#identification">未移行（未確認）アカウントの同一性の確認</a>
        </li>
        <li>
          <a href="#categorize">投稿された内容のチェックと分類整理</a>
        </li>
      </ul>

      <hr />

      <h2 id="share">来て欲しいアカウントの宣伝</h2>
      <p>
        <strong>「公式アカウント来て欲しい！」</strong>
        とポストしていらっしゃる方を数多く見かけますが、具体的にアクションを取っていらっしゃる方は残念ながらほとんどいらっしゃらないです。
      </p>
      <p>
        各アカウントの横に <strong>[宣伝]</strong>{" "}
        というリンクが用意されており、ここから X(Twitter), Bluesky
        に投稿すると、 <strong>#青空公式アカウント</strong>{" "}
        という共通のハッシュタグ付きのポストを行うことができます。
      </p>

      <div className={styles.image}>
        <Image src="/appeal.png" alt="宣伝" width={600} height={400} />
      </div>

      <p>
        また、移行ステータスに応じた文言が用意されているので、ステータスが変わった際に定期的にポストしていただけると、
        <strong>数は力となって関係者の目に入る可能性がグッと高くなる</strong>
        と思います！
      </p>

      <p>
        数が多くなればなるほど、 X(Twitter) から Bluesky
        への移行も進みますので、是非ともご協力をお願いします！
      </p>

      <hr />

      <h2 id="post">公式アカウントのフォーム投稿</h2>
      <p>
        みなさんの思う公式アカウントは人それぞれ違います。様々な公式アカウントが
        Bluesky へ移行してきてるよ！というのを可視化するために、
        <strong>
          公式アカウントがあれば、ぜひともフォームから投稿してください！
        </strong>
        有志が時間差でチェックされたものが公開されます！
      </p>
      <p>
        まだ来てないけど早く来てほしい！というアカウントも、
        <span className="status" data-status="未移行（未確認）">
          未移行（未確認）
        </span>
        のステータスで登録して、是非とも宣伝に活用してください！
      </p>
      <p>
        また、すでに投稿されたものでも、本人確認が取れた、カスタムドメイン化されてアカウント名が変わった、などのステータスが変更されたものも改めて投稿をお願いします！
      </p>
      <p>
        <a
          href="https://www.notion-easy-form.com/forms/81d61322-e823-4068-afbb-ae964c2d6f3f"
          target="_blank"
        >
          →投稿用フォーム
        </a>
      </p>

      <hr />

      <h2 id="identification">未移行（未確認）アカウントの同一性の確認</h2>
      <p>
        X(Twitter), Bluesky の両方のアカウントがあるものの、ステータスが
        <span className="status" data-status="未移行（未確認）">
          未移行（未確認）
        </span>
        となっているアカウントが存在しています。これは X(Twitter) と Bluesky
        が同一かどうかの確認が取れていないアカウントを意味します。
      </p>
      <p>
        中には偽物が偽っているケースなども考えられるため、可能であれば
        <strong>同一性の確認（本人確認）</strong>をお願いしたいです。
      </p>

      <div className={styles.image}>
        <Image
          src="/verification.png"
          alt="同一性の確認"
          width={350}
          height={290}
        />
        <p>例: https://bsky.app/profile/sankei.com/post/3kmerch4mvc2d より</p>
      </div>

      <p>方法としては大きく2つあります。</p>

      <ul>
        <li>
          X（旧Twitter）側から Bluesky アカウントを言及してもらう（例:
          プロフィール追記、 Bluesky アカウント名の投稿）
        </li>
        <li>
          公式アカウントが所有しているドメインをカスタムドメインとして設定{" "}
          <a
            href="https://bsky.social/about/blog/4-28-2023-domain-handle-tutorial"
            target="_blank"
          >
            公式ブログ（英語）
          </a>
        </li>
      </ul>

      <p>
        <strong>上記を依頼する場合は丁寧なやりとりをお願いします。</strong>
        ここのページを引用しつつ、X(Twitter) 側から Bluesky
        アカウントへの言及をお願いしたり、あるいはカスタムドメインの検討を勧めたりといった、複数の選択肢を提示することをお勧めします。
      </p>

      <p>
        なお、{" "}
        <strong>
          Bluesky 側で「本物です！」と発言したり、 Bluesky
          側からX（旧Twitter）アカウントへのリンクを貼る行為は誰でも（偽物でも）できる
        </strong>
        ため、X（旧Twitter）と Bluesky
        アカウントが同一であることの証明にはなりません。
      </p>
      <p>
        「同じ発言をしているので本人です」という投稿も多いですが、それも同様です。
      </p>

      <hr />

      <h2 id="categorize">投稿された内容のチェックと分類整理</h2>
      <p>
        人によって思う公式アカウントは大きく異なるため、様々な分野での分類整理が必要となってきます。また、分類ごとに全体のバランスを見ながら細分化するしないの判断も必要になってきます。
        <br />
        面倒なタスクではありますが、1件公開するまで極力手間がかからないよう最適化してあるので、
        <strong>空き時間に時々チェック</strong>
        してくださるだけで成り立つようになっています。また、対応してくださる方が多ければ多いほど、1人あたりにかかる負担は少なくなります。
      </p>
      <p>
        協力してもいいよ！と思っていただける方は、
        <a
          href="https://bsky.app/hashtag/%E9%9D%92%E7%A9%BA%E5%85%AC%E5%BC%8F%E3%82%A2%E3%82%AB%E3%82%A6%E3%83%B3%E3%83%88"
          target="_blank"
        >
          #青空公式アカウント
        </a>
        のハッシュタグにて度々投稿されるであろう、協力募集の投稿を探して直接ご連絡ください！（なお、
        Notion のユーザー上限などの関係上、ご期待に沿えない場合もあります）
      </p>
      <p>
        なお、関係者に DM
        を送るなどの行為が散見されますので、個別の掲載内容に関する意見はお控えください。（訂正があれば投稿フォームを通してお願いします。）
      </p>

      <p className="back">
        <Link href={"/"}>Bluesky 公式アカウント移行まとめに戻る</Link>
      </p>
    </div>
  );
}
