"use client";

import Image from "next/image";
import Link from "next/link";

import styles from "./GlobalHeader.module.scss";
import { useModal } from "src/hooks/useModal";

export type GlobalHeaderProps = {};

export const GlobalHeader = ({}: GlobalHeaderProps) => {
  const { updateModal, clearModal } = useModal();

  const menuList = (
    <ul className={styles.menuList}>
      <li className={styles.menuItem}>
        <Link className={styles.menuItemLink} href="/" onClick={clearModal}>
          アカウント一覧
        </Link>
      </li>
      <li className={styles.menuItem}>
        <Link
          className={styles.menuItemLink}
          href="/contribution"
          onClick={clearModal}
        >
          投稿および協力できること
        </Link>
      </li>
      <li className={styles.menuItem}>
        <Link
          className={styles.menuItemLink}
          href="/features"
          onClick={clearModal}
        >
          便利な機能
        </Link>
      </li>
      <li className={styles.menuItem}>
        <Link className={styles.menuItemLink} href="/faq" onClick={clearModal}>
          よくある質問
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
