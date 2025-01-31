import styles from "./PageNavigation.module.scss";

export type Page = "index" | "contribution" | "features" | "faq";

export type PageNavigationProps = {
  prev?: Page;
  next?: Page;
};

const PageTitles: Record<Page, string> = {
  index: "アカウント一覧",
  contribution: "投稿および協力できること",
  features: "便利な機能",
  faq: "よくある質問",
};
const PageLinks: Record<Page, string> = {
  index: "/",
  contribution: "/contribution",
  features: "/features",
  faq: "/faq",
};

export const PageNavigation = ({ prev, next }: PageNavigationProps) => {
  if (!prev && !next) return;

  return (
    <div className={styles.container}>
      {prev ? (
        <a
          className={[styles.link, styles.linkPrev].join(" ")}
          href={PageLinks[prev]}
        >
          <span className={styles.direction}>PREV</span>
          <span className={styles.label}>{PageTitles[prev]}</span>
        </a>
      ) : null}
      {next ? (
        <a
          className={[styles.link, styles.linkNext].join(" ")}
          href={PageLinks[next]}
        >
          <span className={styles.direction}>NEXT</span>
          <span className={styles.label}>{PageTitles[next]}</span>
        </a>
      ) : null}
    </div>
  );
};
