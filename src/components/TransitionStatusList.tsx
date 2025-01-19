"use client";

import styles from "./TransitionStatusList.module.scss";

export type TransitionStatusListProps = {};

export const TransitionStatusList = ({}: TransitionStatusListProps) => {
  return (
    <div className={styles.container}>
      <dl className={styles.item}>
        <dt className={styles.term}>
          <span className="status" data-status="未移行（未確認）">
            未移行（未確認）
          </span>
        </dt>
        <dd className={styles.description}>
          <p className={styles.descriptionText}>
            Bluesky 上にアカウントがない or 同一性の確認が取れていない
            <br />
            <strong className={styles.attention}>
              ※本人確認が取れていないものにはご注意ください。
            </strong>
          </p>
        </dd>
      </dl>
      <dl className={styles.item}>
        <dt className={styles.term}>
          <span className="status" data-status="アカウント作成済">
            アカウント作成済
          </span>
        </dt>
        <dd className={styles.description}>
          <p className={styles.descriptionText}>
            アカウントだけが存在しているか、最初の1回程度の挨拶がされている
          </p>
        </dd>
      </dl>
      <dl className={styles.item}>
        <dt className={styles.term}>
          <span className="status" data-status="両方運用中">
            両方運用中
          </span>
        </dt>
        <dd className={styles.description}>
          <p className={styles.descriptionText}>
            X(Twitter) も Bluesky も両方運用されている状態
          </p>
        </dd>
      </dl>
      <dl className={styles.item}>
        <dt className={styles.term}>
          <span className="status" data-status="Bluesky 完全移行">
            Bluesky 完全移行
          </span>
        </dt>
        <dd className={styles.description}>
          <p className={styles.descriptionText}>
            X(Twitter) を更新停止し、完全に Bluesky に移行した状態
          </p>
        </dd>
      </dl>
      <div className={styles.noticeItem}>
        <strong className={styles.attention}>怪しいモデレーションリスト</strong>
        の利用はチェックの支障となるため、注意喚起にご協力願います
      </div>
    </div>
  );
};
