import { Metadata } from "next";
import Image from "next/image";
import { GlobalHeader } from "src/components/GlobalHeader";
import { ShareButtons } from "src/components/ShareButtons";
import { RegisterForm } from "./RegisterForm";

import styles from "./page.module.scss";

export const metadata: Metadata = {
  title:
    "Bluesky公式アカウント登録フォーム - Bluesky公式アカウント移行まとめ",
  description:
    "オープン・パブリックな Bluesky の世界へ移行しよう！X(Twitter)からBlueskyへ移行した公式アカウントを集約している移行まとめです。未掲載アカウントの登録フォームはこちらです。",
  openGraph: {
    siteName: "Bluesky公式アカウント移行まとめ",
    title:
      "Bluesky公式アカウント登録フォーム - Bluesky公式アカウント移行まとめ",
    url: "https://bluesky-official-accounts.vercel.app/contribution/register",
    type: "article",
    images: ["https://bluesky-official-accounts.vercel.app/contribution/opengraph-image.jpg"],
  },
};

export default function FormPage() {
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
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAKCAYAAAC0VX7mAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAeGVYSWZNTQAqAAAACAAEARoABQAAAAEAAAA+ARsABQAAAAEAAABGASgAAwAAAAEAAgAAh2kABAAAAAEAAABOAAAAAAAAAEgAAAABAAAASAAAAAEAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAFKADAAQAAAABAAAACgAAAABegu0pAAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPkZpZ21hPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgoE/1zIAAACLUlEQVQoFSWSzU4UQRSFv66u7vlxQJCAItFE48ZEE935GC5cuPcVfB+2uvAFdGNYujAGSAwSQDJqBgZmmOmZof+q2tNNJTO3UnX7nHPPqeDp+0/VWstijeHZ1ipvXt7j4CIjLzwrt6xqhQ3g8XqbrfUuo4WjY+FXP+Hk4po76klzT5KV9K9ybFg5PJYoslzOMrZ/nPP1z4xX93vsni1493yDh8sx1hoRxFQUfDue0qtZtCaLkqz0zc/5ClPmObmrqLwn1cXxcM6/JOPj/pDDcUp/XkBkmFcBH/ZGnE4KThInJSGdKESfcjbNBVgRiM6G0hdpk1ynuvRgLA+WYk4mWaNqe3fIz3HGhJDvGvH1oxWOZiVfTh0veiGbHQHHIZWAa3DrvaMoc0Ixzn1ASwRrJqAfBqRpQRpFfB5ci8jQkqLDSc5Ik+wOE45ahrdPVrnbjVnkjs3YYJMsFQTc7i0zEWCIkUtiU1VS0GmphsShmlX3rlIoHZVzssMxFng3g1C9SyIwdbqx1PkgoC2fBw5+5+B1RrcNsSLV3bJeQrfxrMIJ0BuNKYKdwYKp3Nu5zDlPFW8nijGtDk4NXQnqBYaRQBugBkyH8vgic8L1NfaNcm1kGQdJweTvgnnh2JvK93a7w8jEMtSyIbCZ0kRKNEOjTORa+qsBnMzR06j9RD43ewUyEBl6JUmulMdGGQchpRTuOyOlMl+jVKq6v1m1rHpfR1mvGrA+qM9r4KYaFc9/6/IJYcvVksUAAAAASUVORK5CYII="
          />
        </div>

        <div className="page-content">
          <section className="page-section">
            <h1>Bluesky 公式アカウント登録フォーム</h1>
            <p>
              投稿前に、『<a href="/contribution">あなたが貢献できること</a>』『
              <a href="/faq">よくあるご質問</a>
              』のページをよく読んで、掲載すべきアカウントかどうかをしっかりと確認してから投稿ください。
            </p>
            <p>
              ※フォームを内製に切り替えました。万が一正しく動かない場合は Bluesky アカウントまで直接お知らせください。
            </p>
          </section>

          <div className={styles.formArea}>
            <RegisterForm />
          </div>


          <footer className="page-footer">
            <ShareButtons />
          </footer>

        </div>
      </div>
    </>
  );
}
