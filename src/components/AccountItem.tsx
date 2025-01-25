"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import { NotionItem } from "src/models/Notion";
import { extractBluesky, extractTwitter } from "src/lib/extractFromURL";
import { promoteBlueskyURL, promoteTwitterURL } from "src/lib/promotion";
import { useModal } from "src/hooks/useModal";

import styles from "./AccountItem.module.scss";
import { CriteriaPopup } from "./CriteriaPopup";

export type AccountItemProps = {
  item: NotionItem;
  popupID: string | null;
  handleShowPopup: (id: string | null) => void;
};

export const AccountItem = ({
  item,
  popupID,
  handleShowPopup,
}: AccountItemProps) => {
  const { updateModal } = useModal();
  const { id, name, status, twitter, bluesky, source } = item;

  return (
    <div key={id} className={styles.container}>
      <div className={styles.columnsGroup}>
        <div className={styles.accountColumn}>
          <h3 className={styles.name}>{name}</h3>
        </div>

        <div className={styles.transitionStatusColumn}>
          <div
            className={styles.statusWithCriteria}
            onClick={() => {
              updateModal(<CriteriaPopup title={name} source={source} />);
            }}
          >
            <span className="status" data-status={status}>
              {status}
            </span>
            {source !== "" ? <i className="hint">?</i> : null}
          </div>
        </div>
      </div>

      <div className={styles.twitterColumn}>
        {twitter ? (
          <div className={styles.socialMedia}>
            <Image
              className={styles.socialMediaIcon}
              src="/icon-x.svg"
              alt="X(Twitter)"
              width={16}
              height={16}
            />
            <a href={twitter} target="_blank">
              {twitter ? extractTwitter(twitter) : ""}
            </a>
            <a
              className={styles.socialMediaPromo}
              href={twitter ? promoteTwitterURL(item) : "#"}
              target="_blank"
            >
              [宣伝]
            </a>
          </div>
        ) : null}
      </div>

      <div className={styles.blueskyColumn}>
        {bluesky ? (
          <div className={styles.socialMedia}>
            <Image
              className={styles.socialMediaIcon}
              src="/icon-bluesky.svg"
              alt="Bluesky"
              width={16}
              height={16}
            />
            <a href={bluesky} target="_blank">
              {bluesky ? extractBluesky(bluesky) : ""}
            </a>
            <a href={bluesky ? promoteBlueskyURL(item) : "#"} target="_blank">
              [宣伝]
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
};
