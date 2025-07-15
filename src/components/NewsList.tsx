"use client";

import { News } from "src/models/News";
import styles from "./NewsList.module.scss";

export type NewsListProps = {
  items: News[];
};

export const NewsList = ({ items }: NewsListProps) => {
  return (
    <div className={styles.container}>
      <h2>更新情報</h2>
      <p>
        投稿されたアカウントは随時反映されています！全体の更新情報のみこちらをご覧ください！
      </p>

      {items.length > 0 ? (
        <div className={styles.box}>
          <ul className={styles.list}>
            {items.map((a: News) => (
              <li className={styles.item} key={a.id}>
                <div className={styles.newsDate}>{a.date}</div>
                <div className={styles.newsContent}>{a.name}</div>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>更新情報はありません</p>
      )}
    </div>
  );
};
