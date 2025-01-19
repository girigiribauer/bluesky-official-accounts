"use client";

import styles from "./AccountItem.module.scss";

import { createPortal } from "react-dom";
import Image from "next/image";
import { NotionItem } from "src/models/Notion";
import { ModalSource } from "./ModalSource";
import { extractBluesky, extractTwitter } from "src/lib/extractFromURL";
import { promoteBlueskyURL, promoteTwitterURL } from "src/lib/promotion";

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
  const { id, name, status, twitter, bluesky, source } = item;

  return (
    <div key={id} className={styles.container}>
      <div className={styles.accountColumn}>
        <h3 className={styles.name}>{name}</h3>
      </div>

      <div className={styles.transitionStatusColumn}>
        <div
          className={styles.statusWithCriteria}
          onClick={() => handleShowPopup(id)}
        >
          <span className="status" data-status={status}>
            {status}
          </span>
          {source !== "" ? <i className="hint">?</i> : null}
        </div>

        {popupID === id
          ? createPortal(
              <ModalSource
                title={`${name}の根拠`}
                source={source}
                handleClose={() => handleShowPopup(null)}
              />,
              document?.body
            )
          : null}
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
