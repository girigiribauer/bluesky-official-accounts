import { fetchAccounts, fetchCategories, fetchNews } from "../lib/fetchNotion";
import Image from "next/image";
import { Metadata } from "next";
import { ShareButtons } from "src/components/ShareButtons";
import { NewsList } from "src/components/NewsList";
import { GlobalHeader } from "src/components/GlobalHeader";
import { TransitionStatusList } from "src/components/TransitionStatusList";
import { Database } from "src/components/Database";
import { PageNavigation } from "src/components/PageNavigation";
import styles from "./page.module.scss";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Bluesky公式アカウント移行まとめ",
  description:
    "オープン・パブリックな Bluesky の世界へ移行しよう！X(Twitter)からBlueskyへ移行した公式アカウントを集約している移行まとめです。移行の検討にご活用ください。",
  openGraph: {
    siteName: "Bluesky公式アカウント移行まとめ",
    title: "Bluesky公式アカウント移行まとめ",
    url: "https://bluesky-official-accounts.vercel.app/",
    type: "website",
  },
};

export default async function Home() {
  const accountList = await fetchAccounts();
  const news = await fetchNews();
  const categoryList = await fetchCategories();

  return (
    <>
      <header className="header">
        <GlobalHeader />
      </header>
      <div className="page-hero-image">
        <Image
          src="/hero-accountlist.png"
          alt=""
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAKCAYAAAC0VX7mAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAeGVYSWZNTQAqAAAACAAEARoABQAAAAEAAAA+ARsABQAAAAEAAABGASgAAwAAAAEAAgAAh2kABAAAAAEAAABOAAAAAAAAAEgAAAABAAAASAAAAAEAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAFKADAAQAAAABAAAACgAAAABegu0pAAAACXBIWXMAAAsTAAALEwEAmpwYAAABWWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iPgogICAgICAgICA8eG1wOkNyZWF0b3JUb29sPkZpZ21hPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgoE/1zIAAACdUlEQVQoFQ2Sy47bZBiGH8e/z3ZiO8l4Jmk705ZhqpYiJFSxgBUL2HMFXAD3xDUg1kgsuqJU7aIMCBUFdaZzaE7Ednw+8G9f6Xv0Pp9e5bvvf+gNXcGxWhy9wXdboonOdOrheDabtEcTELgWmqpQ1i1pUlKWJVVdkxcNm73M8oqhIxCm0WMbLYEjYZ7CwdhhPgvxbI2iavnxZcLNvmMeVBx6Jl9GgqAuOTqe0Cuw26Uouxyz0PAcBRG4tSR3HI11osglOvTpso7Xz//in6sBm9Ed9q7BH13H5XWGsml4Um3J45xHXzymR6VRdeyqZjzUEAdBR+jr3JkHTMIht+dXvPlzTVYMqBSHUy0nlme17eBHA0wV+kXKh4trelFx8PCMcBLKV5REgY0Y+yrzuS81A/pa4+8Xa4RQ+MY2yWdfURg7XtQr3sQZpj/E+iD1hi7dTjZeFGh2yuOTGe/TgndYEjj2KITFVaFzbFs8mHYofYOuP8OvDlm/H8lm8NlTha7puK4dzpqWy33Pib2hliavkoCfLyvMwERclTq/3Ki8Kxs+jxq+9QxG+4SkfcvFrYqGy5GdEY/vYnQqy3zLPhV8dLRjtkr4aRny+3OP/7yce65U/nWls1IdPr4fkgqD37Z3+Xq9ROgxuvFS/qdjZE6xG5/EnvDMzThV13hlz78SHDtTGq1D7WBRDhAJOpY+ILJUTieWVHrKxflbTvyUw6nJQDQUqwXh9oZ7toFnKKRdyz5uWKoh5wfHbEdyMpRoMhfxvkFQcRuXqOaITycTxPATVuvXZHLISp5RAGM5rfLBQ9rlmmS9Q1EEC3GMNZuwKjJ6w+MsdPkfEBcPqcIKgwYAAAAASUVORK5CYII="
        />
      </div>

      <div className="page-content">
        <section className="page-section">
          <h1>
            <Image className={styles.butterfly} src="/butterfly.svg" alt="" width={36} height={32} aria-hidden="true" /> オープン・パブリックな Bluesky の世界へ移行しよう！
          </h1>
          <p>
            あなたの企業・組織はちゃんと<span className={styles.highlight}>オープン</span>な場で情報発信できていますか？ログインなしに情報に<span className={styles.highlight}>アクセス</span>できますか？
            <br />
            もうすでに多くのユーザーが移行している Bluesky において、<span className={styles.highlight}>あなたの企業・組織が Bluesky で情報発信を始めるのをみなさん待ち望んでいます！</span>
          </p>
          <TransitionStatusList />
        </section>

        <div className={styles.accountListArea}>
          <div className={styles.accountListInner}>
            <Database accountList={accountList} categoryList={categoryList} />
          </div>
        </div>

        <div className="page-section">
          <NewsList items={news} />
        </div>

        <footer className="page-footer">
          <PageNavigation next="open-public" />
          <ShareButtons />
        </footer>
      </div>
    </>
  );
}
