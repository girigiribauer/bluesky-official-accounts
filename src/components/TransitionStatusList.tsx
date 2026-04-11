import styles from "./TransitionStatusList.module.scss";
import { AnnotationButton } from "./AnnotationButton";

export type TransitionStatusListProps = {};

export const TransitionStatusList = ({}: TransitionStatusListProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.box}>
        <dl className={styles.item}>
          <dt className={styles.term}>
            <span className="status" data-status="unverified">
              未確認
            </span>
          </dt>
          <dd className={styles.description}>
            <p className={styles.descriptionText}>
              Bluesky 上にアカウントはあるが、同一性の確認が取れていない
            </p>
          </dd>
        </dl>
        <dl className={styles.item}>
          <dt className={styles.term}>
            <span className="status" data-status="account_created">
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
            <span className="status" data-status="dual_active">
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
            <span className="status" data-status="migrated">
              Bluesky 完全移行
            </span>
          </dt>
          <dd className={styles.description}>
            <p className={styles.descriptionText}>
              X(Twitter) を更新停止し、完全に Bluesky に移行した状態
            </p>
          </dd>
        </dl>

        <div className={styles.footer}>
          <AnnotationButton
            className={styles.caution}
            label="利用上の注意について"
          >
            <section className="page-section">
              <h2>同一性の確認が取れていないものにはご注意ください</h2>
              <p>
                移行ステータスが{" "}
                <span className="status" data-status="unverified">未確認</span>
                {" "}のものは X(Twitter) との同一性の確認が取れていないアカウントです。
                中には悪意のあるアカウントもありますので、同じ投稿をしているからといって無条件に信じないようにしてください。
              </p>
            </section>
            <section className="page-section">
              <h2>怪しいモデレーションリストにご注意ください</h2>
              <p>
                Bluesky には、誰もがアカウントのリストを作り、まとめてミュート、まとめてブロックなどを行えるモデレーションリストという機能があります。
              </p>
              <p>
                中には恣意的な運用をしているモデレーションリストを利用し、多くの無関係な方が意図せずブロックされるという現象が起きており、チェックにも支障が出てきています。（知り合いでもなんでもないのにブロックされて確認できないなど）
              </p>
              <p>
                やむを得ず{" "}
                <span className="status" data-status="unverifiable">確認不能</span>
                {" "}のステータスを付与しています。怪しいモデレーションリストの利用はお控えくださるよう、周りにも注意喚起をお願いします。
              </p>
            </section>
            <p>
              その他、運用の仕方についてのご質問は一通り『<a href="/faq">よくあるご質問</a>』にまとめてありますので、そちらをご参照ください。
            </p>
          </AnnotationButton>
        </div>
      </div>
    </div>
  );
};
