import { Metadata } from "next";
import Image from "next/image";
import { GlobalHeader } from "src/components/GlobalHeader";
import { LinkCard } from "src/components/LinkCard";
import { ShareButtons } from "src/components/ShareButtons";

export const metadata: Metadata = {
  title:
    "Bluesky公式アカウント登録フォーム - Bluesky公式アカウント移行まとめ",
  robots: { index: false },
};

export default function RegisterCompletePage() {
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
              投稿ありがとうございました！🎉
              <br />
              モデレーターの方々がチェックし問題なければリストに反映されます！
            </p>
            <div className="link">
              <a href="/contribution/register">続けてアカウントを登録する</a>
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
