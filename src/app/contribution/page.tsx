import { Metadata } from "next";
import Image from "next/image";
import { GlobalHeader } from "src/components/GlobalHeader";

import styles from "./page.module.scss";
import { ModalContents } from "src/components/ModalContents";
import { ShareButtons } from "src/components/ShareButtons";

export const metadata: Metadata = {
  title:
    "投稿および協力できること - Bluesky 公式アカウント移行まとめ #青空公式アカウント",
  description:
    "誰も投稿してない公式アカウントを見つけたら、フォームから投稿してください！他にも協力できることがたくさんあります！",
  openGraph: {
    siteName: "Bluesky 公式アカウント移行まとめ",
    title:
      "投稿および協力できること - Bluesky 公式アカウント移行まとめ #青空公式アカウント",
    url: "https://bluesky-official-accounts.vercel.app/contribution",
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
        <h1>投稿および協力できること</h1>

        <h2 id="account-form">公式アカウント登録フォーム</h2>

        <a
          className={styles.image}
          href="https://www.notion-easy-form.com/forms/81d61322-e823-4068-afbb-ae964c2d6f3f"
          target="_blank"
        >
          <Image src="/account-form.jpg" alt="" width={400} height={225} />
          <p>→公式アカウント登録フォーム</p>
        </a>

        <p>募集しているものは以下のものです。</p>

        <h3>未登録の公式アカウント</h3>
        <ul>
          <li>X(Twitter) と Bluesky アカウントの URL を用意してください</li>
          <li>
            <span className="status" data-status="未移行（未確認）">
              未移行（未確認）
            </span>
            以外のものは根拠の項目に同一である理由を書いてください
          </li>
          <li>
            投稿前によくある質問を一通り読んだ上で判断してください（随時アップデートされます）
          </li>
        </ul>

        <h3>登録済みのアカウントの修正・削除</h3>
        <ul>
          <li>
            新規投稿のときと同じ情報を入れて、変更があるところだけ変えて投稿してください
          </li>
          <li>
            誰の目からも明らかに公式アカウントではないものがあれば、根拠にその点を書いて削除依頼してください
          </li>
        </ul>

        <h3>来て欲しいアカウント</h3>
        <ul>
          <li>X(Twitter) アカウントの URL のみ用意してください</li>
          <li>来て欲しいことを可視化して宣伝に活用できます</li>
        </ul>

        <p className={styles.link}>
          <a
            href="https://www.notion-easy-form.com/forms/81d61322-e823-4068-afbb-ae964c2d6f3f"
            target="_blank"
          >
            →公式アカウント登録フォーム
          </a>
        </p>

        <hr />

        <h2 id="category-form">アカウント分類草案フォーム</h2>

        <a
          className={styles.image}
          href="https://www.notion-easy-form.com/forms/155ec3b2-73dd-801f-af2c-c11b5da5f597"
          target="_blank"
        >
          <Image src="/category-form.jpg" alt="" width={400} height={225} />
          <p>→アカウント分類草案フォーム</p>
        </a>

        <p>参考意見として分類草案を募集しています！</p>

        <ul>
          <li>
            あくまで移行の促進が目的で、綺麗に並べることが目的ではありません
          </li>
          <li>
            特にその他に入っている分類は、適切な興味分野が切り出せていないものです
          </li>
          <li>
            興味を持った分野ごとに切り出すと、公式アカウントの登録がしやすくなります
          </li>
        </ul>

        <p className={styles.link}>
          <a
            href="https://www.notion-easy-form.com/forms/155ec3b2-73dd-801f-af2c-c11b5da5f597"
            target="_blank"
          >
            →アカウント分類草案フォーム
          </a>
        </p>

        <hr />

        <h2 id="inside">Notion 上での投稿チェック、分類整理</h2>
        <p>
          まとめサイトの情報は共有財産なので、投稿されたものは投稿した人の責任ですが、公開までに最低限の人の目を通しています。
        </p>

        <Image src="/check.jpg" alt="" width={400} height={225} />
        <p>以下の条件で協力できる方を募集しています。</p>
        <ul>
          <li>
            Notion 上に<strong>アカウントを作れる方</strong>
            （操作は慣れてなくても OK です）
            <ul>
              <li>チェックは慣れれば1件あたり1分もかかりません</li>
              <li>1回あたり10件〜数十件程度チェックしてくださると助かります</li>
            </ul>
          </li>
          <li>
            データベースを自分の好き勝手にいじろうとしない方、
            <strong>私物化しない方</strong>
            <ul>
              <li>
                上記理由から、 Bluesky
                にアカウントを作りたての方はお断りする可能性があります
              </li>
            </ul>
          </li>
          <li>
            いつチェックするかはお任せしますが、ちゃんと
            <strong>負荷分散につながる方</strong>
            <ul>
              <li>
                特定の人に負荷がかからないよう、みんなで負荷分散していきたいです
              </li>
              <li>
                1週間に1回、1回1件程度のチェックだと、コミュニケーションコストの方が高くなるので、やっていただく際にはある程度まとめてチェックしていただくことを想定しています
              </li>
            </ul>
          </li>
        </ul>
        <p>
          チェックに加えて、余裕があれば分類整理の方に加わっていただけるとありがたいです。
          <br />
          <strong>手伝っていただければ移行の促進につながります！</strong>
          興味がありましたら以下のアカウントに連絡をお願いします。
        </p>

        <p className={styles.link}>
          <a
            href="https://bsky.app/profile/official-accounts.bsky.social"
            target="_blank"
          >
            →公式アカウント移行まとめ（仮運用中）
          </a>
        </p>

        <hr />

        <h2 id="share">各種シェアのお手伝い</h2>
        <Image src="/share.jpg" alt="" width={400} height={225} />
        <p>
          最近は「公式アカウントどこー？」とポストする方も少なくなってきましたが、定期的に話題に上がってないと、新規で参加されてる方々が再び迷子になりかねません。
          あなたにとっては既知の情報でも、知らない方に向けて
          <strong>定期的にシェア</strong>
          してくださると非常に助かります！（リストの充実、移行の促進にもつながります！）
        </p>

        <ul>
          <li>
            ハッシュタグは
            <a
              href="https://bsky.app/search?q=%23%E9%9D%92%E7%A9%BA%E5%85%AC%E5%BC%8F%E3%82%A2%E3%82%AB%E3%82%A6%E3%83%B3%E3%83%88"
              target="_blank"
            >
              #青空公式アカウント
            </a>
            です
          </li>
          <li>
            アカウントリストの各行に <strong>[宣伝]</strong>{" "}
            というリンクがあり、 X(Twitter) や Bluesky にシェアできます
          </li>
        </ul>

        <hr />

        <ShareButtons />
      </div>
      <ModalContents />
    </>
  );
}
