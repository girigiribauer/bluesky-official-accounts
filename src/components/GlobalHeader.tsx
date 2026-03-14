"use client";

import Image from "next/image";
import Link from "next/link";

import styles from "./GlobalHeader.module.scss";
import { useModal } from "src/hooks/useModal";

export type GlobalHeaderProps = {};

export const GlobalHeader = ({}: GlobalHeaderProps) => {
  const { updateModal } = useModal();

  const menuList = (
    <ul className={styles.menuList}>
      <li className={styles.menuItem}>
        <Link className={styles.menuItemLink} href="/">
          アカウント一覧
        </Link>
      </li>
      <li className={styles.menuItem}>
        <Link className={styles.menuItemLink} href="/open-public">
          企業・組織の皆様へ
        </Link>
      </li>
      <li className={styles.menuItem}>
        <Link className={styles.menuItemLink} href="/contribution">
          あなたが貢献できること
        </Link>
      </li>
      <li className={styles.menuItem}>
        <Link className={styles.menuItemLink} href="/faq">
          よくあるご質問
        </Link>
      </li>
      <li className={styles.menuItem}>
        <Link className={styles.menuItemLink} href="/moderation">
          モデレーション
        </Link>
      </li>
    </ul>
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.logo}>
        <Link className={styles.logoLink} href="/">
          <Image
            className={styles.cellLinkIcon}
            src="/logo.svg"
            alt="Bluesky公式アカウント移行まとめ"
            width={40}
            height={40}
          />
        </Link>
      </h1>
      <div className={styles.menu}>
        <div className={styles.headerWrapped}>{menuList}</div>
        <button
          type="button"
          className={styles.menuButton}
          aria-label="メニューを開く"
          onClick={() => {
            updateModal(
              <div className={styles.modalWrapped}>{menuList}</div>,
              "#fff"
            );
          }}
        >
          <i className="fa-solid fa-bars" />
        </button>
      </div>
    </div>
  );
};
