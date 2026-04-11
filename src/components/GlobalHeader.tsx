"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Moderator } from "src/lib/auth";
import { logoutAction } from "src/lib/authActions";

import styles from "./GlobalHeader.module.scss";
import { useModal } from "src/hooks/useModal";

type Props = {
  moderator?: Moderator | null;
};

export const GlobalHeader = ({ moderator }: Props) => {
  const { updateModal } = useModal();
  const pathname = usePathname();
  const isModeration = pathname.startsWith("/moderation_beta");
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
        <Link className={styles.menuItemLink} href="/moderation">
          モデレーション
        </Link>
      </li>
    </ul>
  );

  const modalMenuList = (
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
      <li className={[styles.menuItem, styles.modalSubItem].join(" ")}>
        <Link className={styles.menuItemLink} href="/contribution/register">
          Bluesky公式アカウント登録フォーム
        </Link>
      </li>
      <li className={[styles.menuItem, styles.modalSubItem].join(" ")}>
        <Link className={styles.menuItemLink} href="/contribution/request">
          来て欲しいアカウント登録フォーム
        </Link>
      </li>
      <li className={styles.menuItem}>
        <Link className={styles.menuItemLink} href="/moderation">
          モデレーション
        </Link>
      </li>
      {moderator && (
        <>
          <li className={styles.menuItem}>
            <Link className={styles.menuItemLink} href="/moderation_beta">
              ダッシュボード
            </Link>
          </li>
          <li className={styles.menuItem}>
            <form action={logoutAction} style={{ display: "contents" }}>
              <input type="hidden" name="returnTo" value={pathname} />
              <button type="submit" className={styles.menuItemLink}>ログアウト</button>
            </form>
          </li>
        </>
      )}
    </ul>
  );

  return (
    <div className={[styles.container, isModeration ? styles.containerModeration : ""].join(" ")}>
      <h1 className={styles.logo}>
        <Link className={styles.logoLink} href="/">
          <Image
            className={styles.cellLinkIcon}
            src="/images/logo.svg"
            alt="Bluesky公式アカウント移行まとめ"
            width={40}
            height={40}
          />
        </Link>
      </h1>
      <div className={styles.menu}>
        <div className={styles.headerWrapped}>{menuList}</div>
        <div className={styles.right}>
          {moderator && (
            <div className={styles.userMenu} ref={userRef}>
              <button
                type="button"
                className={styles.userButton}
                onClick={() => setUserOpen((v) => !v)}
                aria-expanded={userOpen}
              >
                {moderator.avatar ? (
                  <Image src={moderator.avatar} alt="" width={30} height={30} className={styles.avatar} />
                ) : (
                  <i className="fa-solid fa-circle-user" />
                )}
              </button>
              {userOpen && (
                <ul className={styles.userDropdown}>
                  <li>
                    <Link className={styles.submenuItem} href="/moderation_beta" onClick={() => setUserOpen(false)}>
                      ダッシュボード
                    </Link>
                  </li>
                  <li>
                    <form action={logoutAction} style={{ display: "contents" }}>
                      <input type="hidden" name="returnTo" value={pathname} />
                      <button type="submit" className={styles.submenuItem}>ログアウト</button>
                    </form>
                  </li>
                </ul>
              )}
            </div>
          )}
          <button
            type="button"
            className={styles.menuButton}
            aria-label="メニューを開く"
            onClick={() => {
              updateModal(
                <div className={styles.modalWrapped}>{modalMenuList}</div>,
                "#fff"
              );
            }}
          >
            <i className="fa-solid fa-bars" />
          </button>
        </div>
      </div>
    </div>
  );
};
