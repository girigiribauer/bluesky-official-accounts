"use client";

import Image from "next/image";
import Link from "next/link";
import { NotionItem } from "src/models/Notion";
import { TRANSITION_STATUS_LABELS } from "src/models/TransitionStatus";
import { extractBluesky, extractTwitter } from "src/lib/extractFromURL";

import styles from "./AccountItem.module.scss";
import { AnnotationButton } from "./AnnotationButton";

export type AccountItemProps = {
  item: NotionItem;
};

export const AccountItem = ({ item }: AccountItemProps) => {
  const { id, name, status, twitter, bluesky, source } = item;

  return (
    <div key={id} className={styles.container}>
      <div className={styles.columnsGroup}>
        <div className={styles.accountColumn}>
          <h3 className={styles.name}>{name}</h3>
        </div>

        <div className={styles.transitionStatusColumn}>
          <span className={`status ${styles.statusLabel}`} data-status={status}>
            {TRANSITION_STATUS_LABELS[status] ?? status}
          </span>
        </div>

        <div className={styles.evidenceColumn}>
          {source !== "" ? (
            <AnnotationButton
              className={styles.evidenceButton}
              label="根拠"
            >
              <section className="page-section">
                <h2 className="page-section-title">
                  <span>{name} の根拠</span>
                  <span className={[`status ${styles.statusLabel}`, styles.evidenceStatusLabel].join(" ")} data-status={status}>
                    {TRANSITION_STATUS_LABELS[status] ?? status}
                  </span>
                </h2>
                <textarea readOnly className={styles.evidenceText} defaultValue={source || "現時点で根拠はありません。（カスタムドメインなど明らかな場合には書いてないケースがあります）"} />
                <p className={styles.evidenceNote}>
                  客観的に根拠として判断でき、別の人間が目を通したものを掲載しています。ただし、有志による投稿のため、正確性は保証できません。誤りがあった場合は『<Link className={styles.menuItemLink} href="/contribution">あなたが貢献できること</Link>』から投稿をお願いします。
                </p>
              </section>
            </AnnotationButton>
          ) : null}
        </div>
      </div>

      <div className={styles.twitterColumn}>
        {twitter ? (
          <div className={styles.socialMedia}>
            <Image
              className={styles.socialMediaIcon}
              src="/images/icon-x.svg"
              alt="X(Twitter)"
              width={16}
              height={16}
            />
            <a href={twitter} target="_blank">
              {twitter ? extractTwitter(twitter) : ""}
            </a>
          </div>
        ) : null}
      </div>

      <div className={styles.blueskyColumn}>
        {bluesky ? (
          <div className={styles.socialMedia}>
            <Image
              className={styles.socialMediaIcon}
              src="/images/icon-bluesky.svg"
              alt="Bluesky"
              width={16}
              height={16}
            />
            <a href={bluesky} target="_blank">
              {bluesky ? extractBluesky(bluesky) : ""}
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
};
