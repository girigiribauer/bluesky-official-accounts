"use client";

import { useModal } from "src/hooks/useModal";

import styles from "./TransitionStatusList.module.scss";
import { CriteriaPopup } from "./CriteriaPopup";

export type TransitionStatusListProps = {};

export const TransitionStatusList = ({}: TransitionStatusListProps) => {
  const { updateModal } = useModal();

  const title = "移行ステータスについて";
  const description = `ユーザーから投稿されたものがステータスとして表示されています。
  投稿フォームへは根拠付きで投稿してもらっているため、なぜその移行ステータスになっているかは、ステータスラベルを選択すると詳しく確認できます。\n\nまた、可能な限りミスのないよう運用していますが、投稿してくださる方もチェックしている方も人間です。根拠が間違っているなどのケースがあった場合は、みんなで作っているリストなので、文句を言うだけに留まらずに、修正投稿をフォームよりしていただけると嬉しいです。（Wikipedia などと同様です）\n\nなお、怪しいモデレーションリストを使用しているアカウントに関しては、チェックした方がブロックされており投稿を確認しようがないため、やむを得ず『確認不能』の移行ステータスをつけています。意図せず無関係の他者をブロックしていることに気づいてない可能性が高いため、別の方からの注意喚起をお願いします。`;
  return (
    <div className={styles.container}>
      <h2
        className={styles.heading}
        onClick={() => {
          updateModal(<CriteriaPopup title={title} source={description} />);
        }}
      >
        <span>移行ステータスについて</span>
        <i className="hint">?</i>
      </h2>

      <div className={styles.box}>
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
          <strong className={styles.attention}>
            怪しいモデレーションリスト
          </strong>
          の利用はチェックの支障となるため、注意喚起にご協力願います
        </div>
      </div>
    </div>
  );
};
