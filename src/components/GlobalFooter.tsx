import Link from "next/link";
import styles from "./GlobalFooter.module.scss";

export const GlobalFooter = () => {
  return (
    <footer className={styles.footer}>
      <nav className={styles.links}>
        <Link className={styles.link} href="/faq">
          よくあるご質問
        </Link>
        <span className={styles.separator} aria-hidden="true" />
        <Link className={styles.link} href="/terms">
          利用規約
        </Link>
      </nav>
      <Link className={styles.siteTitle} href="/">
        Bluesky公式アカウント移行まとめ
      </Link>
    </footer>
  );
};
