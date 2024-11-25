import { fetchAccounts, fetchNews } from "../lib/fetchNotion";
import { Metadata } from "next";
import Image from "next/image";
import styles from "./page.module.scss";
import { TableView } from "src/components/TableView";
import Link from "next/link";
import { ShareButtons } from "src/components/ShareButtons";
import { News } from "src/models/News";
import { TableViewWithFilter } from "src/components/TableViewWithFilter";

export const metadata: Metadata = {
  title: "Bluesky 公式アカウント移行まとめ",
  description:
    "X（Twitter）からBlueskyへの移行を促進するために、公式アカウントの移行状況をまとめています。有志でまとめていますので、みんなで移行を促進していきましょう！",
  openGraph: {
    title: "Bluesky 公式アカウント移行まとめ #青空公式アカウント",
  },
};

export default async function Home() {
  const { updatedTime, items } = await fetchAccounts(10000);
  const news = await fetchNews();

  const wantsItems = items.filter(
    (a) =>
      a !== null &&
      a.status === "未移行（未確認）" &&
      (a.bluesky === null || a.bluesky === "")
  );
  const withoutWantsItems = items.filter(
    (a) =>
      (a !== null && a.status !== "未移行（未確認）") ||
      (a.status === "未移行（未確認）" &&
        a.bluesky !== null &&
        a.bluesky !== "")
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.heroTitle}>
        <Image
          src="/opengraph-image.jpg"
          alt="Bluesky 公式アカウント移行まとめ - X(Twitter) から Bluesky への移行状況をまとめ、移行を促進しています"
          width={960}
          height={540}
        />
      </h1>

      <div className={styles.shareButtons}>
        <ShareButtons />
      </div>

      <h2>公式アカウントの投稿をお願いします！</h2>
      <p>
        人には人の公式アカウントがあります。
        <br />
        様々な公式アカウントが Bluesky
        へ移行してきてるよ！というのを可視化し、移行を促進するために、あなたが見つけた
        <strong>
          公式アカウントをフォームから投稿してまとめにご協力ください！
        </strong>
        有志にてチェックされたものが時間差で公開されます！
        <br />
        なお、投稿の際は <Link href="/faq">よくある質問</Link>、
        <Link href="/contribution">移行まとめで協力できること</Link>
        をよく読んだ上で
        <strong>重複投稿のないよう投稿ください！</strong>
      </p>

      <p className={styles.linkForm}>
        <a
          href="https://www.notion-easy-form.com/forms/81d61322-e823-4068-afbb-ae964c2d6f3f"
          target="_blank"
        >
          →投稿用フォーム
        </a>
      </p>

      {/*
      <div className={styles.attention}>
        <p>
          現在投稿が急増してチェックが追いついてません！以下を十分確認の上ご投稿ください！
        </p>
        <ul>
          <li>
            すでに登録してあるアカウントの重複投稿（ステータス変更を除く）
          </li>
          <li>
            『漫画家・イラストレーター』や『小説家・作家』などで、明らかに趣味と判断されるアカウントの自薦含む投稿（目安として何らか商業に関わるか否か）
          </li>
        </ul>
      </div>
      */}

      <div className={styles.news}>
        <h3>全体の更新情報</h3>
        {news.length > 0 ? (
          <ul>
            {news.map((a: News) => (
              <li key={a.id}>
                {a.date} {a.name}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <hr />

      <h2>公式アカウント一覧</h2>

      <p>
        おおむね3時間おきに最新化されます。
        <br />
        全体を見たい方は<strong>1週間以内に追加されたアカウント</strong>
        の絞り込みを変更してください。
      </p>

      <div className={styles.statusSamples}>
        <h3>移行ステータスについて</h3>
        <dl>
          <dt>
            <span className="status" data-status="未移行（未確認）">
              未移行（未確認）
            </span>
          </dt>
          <dd>
            <p className={styles.description}>
              Bluesky 上にアカウントが存在していない or
              同一性の確認が取れていない
              <br />
              <strong>
                ※特にマスメディアアカウントで確認が取れていないものにはご注意ください。
              </strong>
            </p>
          </dd>
        </dl>
        <dl>
          <dt>
            <span className="status" data-status="アカウント作成済">
              アカウント作成済
            </span>
          </dt>
          <dd>
            <p className={styles.description}>
              アカウントだけが存在しているか、最初の1回程度の挨拶がされている
            </p>
          </dd>
        </dl>
        <dl>
          <dt>
            <span className="status" data-status="両方運用中">
              両方運用中
            </span>
          </dt>
          <dd>
            <p className={styles.description}>
              X(Twitter) も Bluesky も両方運用されている状態
            </p>
          </dd>
        </dl>
        <dl>
          <dt>
            <span className="status" data-status="Bluesky 完全移行">
              Bluesky 完全移行
            </span>
          </dt>
          <dd>
            <p className={styles.description}>
              完全に Bluesky に移行した状態 or Bluesky
              にしかアカウントが存在していない
            </p>
          </dd>
        </dl>
      </div>

      <div className={styles.table}>
        <TableViewWithFilter
          items={withoutWantsItems}
          updatedTime={updatedTime}
        />
      </div>

      <hr />

      <h2>来て欲しいアカウント一覧</h2>
      <p>
        まだ来てないけど早く来てほしい！というアカウントも、
        <span className="status" data-status="未移行（未確認）">
          未移行（未確認）
        </span>
        のステータスで登録して、是非とも宣伝に活用してください！
        条件なしで全部表示しています。
      </p>

      <div className={styles.table}>
        <TableView items={wantsItems} updatedTime={updatedTime} />
      </div>

      <hr />

      <ul>
        <li>
          <Link href={"/faq"}>よくある質問</Link>
        </li>
        <li>
          <Link href={"/contribution"}>移行まとめで協力できること</Link>
        </li>
      </ul>

      <ShareButtons />
    </div>
  );
}
