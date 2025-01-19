"use client";

import Image from "next/image";
import Link from "next/link";

import styles from "./GlobalHeader.module.scss";

export type GlobalHeaderProps = {};

export const GlobalHeader = ({}: GlobalHeaderProps) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.logo}>
        <Image
          className={styles.cellLinkIcon}
          src="/logo.svg"
          alt="Bluesky公式アカウント移行まとめ"
          width={40}
          height={40}
        />
      </h1>
      <div className={styles.menu}>
        <ul className={styles.menuList}>
          <li className={styles.menuItem}>
            <Link className={styles.menuItemLink} href="/">
              アカウント一覧
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link className={styles.menuItemLink} href="/contribution">
              投稿および協力できること
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link className={styles.menuItemLink} href="/features">
              便利な機能
            </Link>
          </li>
          <li className={styles.menuItem}>
            <Link className={styles.menuItemLink} href="/faq">
              よくある質問
            </Link>
          </li>
        </ul>
        <button type="button" className={styles.menuButton}>
          <i className="fa-solid fa-bars" />
        </button>
      </div>
    </div>
  );
};
