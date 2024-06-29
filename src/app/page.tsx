import { NotionItemsWithLabel } from "src/models/Notion";
import { fetchNotion } from "../lib/fetchNotion";
import { Metadata } from "next";
import Image from "next/image";
import styles from "./page.module.scss";
import { TableView } from "src/components/TableView";
import Link from "next/link";
import { ShareButtons } from "src/components/ShareButtons";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Bluesky 公式アカウント移行まとめ",
  description:
    "X（Twitter）からBlueskyへの移行を促進するために、公式アカウントの移行状況をまとめています。有志でまとめていますので、みんなで移行を促進していきましょう！",
};

export default async function Home() {
  const { updatedTime, items } = await fetchNotion(10000);

  return (
    <div className={styles.container}>
      <h1 className={styles.heroTitle}>
        <Image
          src="/opengraph-image.jpg"
          alt="Bluesky 公式アカウント移行まとめ - X(Twitter) から Bluesky への移行状況をまとめ、移行を促進しています"
          width={800}
          height={450}
        />
      </h1>
      <h2>公式アカウントの投稿をお願いします！</h2>
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

      <p>
        また、合わせて{" "}
        <Link href={"/contribution"}>移行まとめで協力できること</Link>{" "}
        もご覧ください。
      </p>

      <ShareButtons />

      <hr />

      <h2>アカウントの移行ステータスについて</h2>

      <div className={styles.statusSamples}>
        <dl>
          <dt>
            <span className="status" data-status="未移行（未確認）">
              未移行（未確認）
            </span>
          </dt>
          <dd>
            <p className={styles.description}>
              Bluesky 上にアカウントが存在していない or 本物の確認が取れていない
              <br />
              ※特にマスメディアアカウントで本人確認が取れていないものにはご注意ください。
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

      <hr />

      <p>
        HTML 出力日時テスト{" "}
        {new Intl.DateTimeFormat("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Tokyo",
        }).format(new Date())}
        <br />
        1日2回、06:00と18:00に最新が反映されてるはず...
      </p>
      <TableView updatedTime={updatedTime} items={items} />

      <hr />

      <p>
        <Link href={"/contribution"}>移行まとめで協力できること</Link>
      </p>

      <ShareButtons />
    </div>
  );
}
