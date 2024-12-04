"use client";

import { News } from "src/models/News";
import styles from "./NewsList.module.scss";
import { useState } from "react";

export type NewsListProps = {
  items: News[];
};

export const NewsList = ({ items }: NewsListProps) => {
  return items.length > 0 ? (
    <div className={styles.container}>
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
    "更新情報はありません"
  );
};
