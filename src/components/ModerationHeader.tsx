"use client";

import Image from "next/image";
import Link from "next/link";
import { Moderator } from "src/lib/auth";
import styles from "./ModerationHeader.module.scss";

type Props = {
  moderator: Moderator;
  onLogout: () => void;
};

export function ModerationHeader({ moderator, onLogout }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Link href="/" className={styles.logoLink}>
          <Image src="/images/logo.svg" alt="移行まとめ" width={40} height={40} />
        </Link>
      </div>
      <nav className={styles.nav}>
        <Link className={styles.navItem} href="/">閲覧用ページに戻る</Link>
        <Link className={styles.navItem} href="/moderation_beta">ダッシュボード</Link>
        <form action={onLogout} style={{ display: "contents" }}>
          <button type="submit" className={styles.navItem}>ログアウト</button>
        </form>
      </nav>
    </div>
  );
}
