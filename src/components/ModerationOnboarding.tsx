"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FIELD_ID_LABELS, FIELD_DETAILS } from "src/constants/fields";
import { FieldChips } from "./FieldChips";
import type { Result } from "src/types/result";
import styles from "./ModerationOnboarding.module.scss";

type Props = {
  joinedFieldIds?: string[];
  onJoin?: (fieldId: string) => Promise<Result>;
};

export function ModerationOnboarding({ joinedFieldIds = [], onJoin }: Props) {
  const router = useRouter();
  const [selectedField, setSelectedField] = useState<string | null>(null);

  // ヒーローの上端が画面の縦中央を越えた瞬間に一度だけぽわんと出す。下部に置いたため mount 発火では画面外で消費されてしまう。
  // rootMargin の下 -50% で判定領域を画面上半分に縮め、threshold:0 と合わせて「上端が中央線を越えた瞬間」を発火点にする。
  const heroRef = useRef<HTMLDivElement>(null);
  const [heroSeen, setHeroSeen] = useState(false);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeroSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -50% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const detail = selectedField ? FIELD_DETAILS[selectedField] : null;
  const selectedLabel = selectedField ? FIELD_ID_LABELS[selectedField] : null;
  const isJoined = selectedField !== null && joinedFieldIds.includes(selectedField);
  // 参加済みでも無効化しない。この画面から当該分野へ行く導線が他に無く、無効ボタンだと手詰まりになるため。
  const canSubmit = selectedField !== null;

  // この分野が扱うものの「方向性」（運営が定める安定した基準。DBの可変な分類ではない）。
  const clusters = detail ? detail.clusters : [];

  return (
    <div className={styles.contents}>
      <div className={styles.formArea}>
        <div className={styles.form}>
          <h1 className={styles.title}>自分の好きな分野を選んでください</h1>
          <div className={styles.textBlock}>
            <p className={styles.subtitle}>
              モデレーションサイトの利用は『<Link href="/terms" className={styles.termLink}>利用規約</Link>』に同意したとみなします。
            </p>
            <p className={styles.subtitle}>
              モデレーションは、あなた自身の好き嫌いや主義主張から切り離して行ってください。自分と考えが真逆のアカウントであっても、同じ基準で公平・公正に扱うことを心がけてください。あなたの知らないアカウントであっても、きっと誰かの公式アカウントです。
            </p>
          </div>

          <FieldChips
            fieldId={selectedField}
            onFieldIdChange={setSelectedField}
          />

          {detail && selectedLabel ? (
            <div className={styles.fieldPickupBoard}>
              <span className={[styles.notJoinBadge, isJoined ? styles.notJoinBadgeJoined : ""].join(" ")}>
                <span className={[styles.notJoinIcon, isJoined ? styles.notJoinIconJoined : ""].join(" ")} aria-hidden="true">
                  {isJoined && <i className="fa-solid fa-check" />}
                </span>
                {isJoined ? "参加済み" : "未参加"}
              </span>
              <div className={styles.pickupHeading}>
                <Image
                  className={styles.pickupFieldImg}
                  src={`/images/fields/${selectedField}.svg`}
                  alt=""
                  width={28}
                  height={28}
                  aria-hidden="true"
                />
                <span className={styles.pickupTitle}>{selectedLabel}</span>
              </div>
              <div className={styles.pickupSeparator} />
              <div className={styles.pickupBoxes}>
                <div className={styles.pickupBox}>
                  <span className={styles.pickupLabel}>興味の向き</span>
                  <span className={styles.pickupContent}>{detail.interest}</span>
                </div>
                <div className={styles.pickupBox}>
                  <span className={styles.pickupLabel}>この分野が扱うもの</span>
                  <ul className={styles.clusterList}>
                    {clusters.map((name) => (
                      <li key={name} className={styles.clusterItem}>{name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.needField}>
              <p className={styles.needFieldText}>
                先に分野を選択してください<br />
                詳しい説明が表示されます
              </p>
            </div>
          )}

          <div className={styles.separator} />

          <div className={styles.hero} ref={heroRef}>
            <Image
              className={styles.heroBg}
              src="/images/bg-onboarding.png"
              alt=""
              fill
              sizes="700px"
              style={{ objectFit: "cover" }}
              aria-hidden
            />
            <Image
              className={[styles.heroItem, heroSeen ? styles.heroItemVisible : ""].join(" ")}
              src="/images/item-onboarding.svg"
              alt="あなたが盛り上げると、分野・移行が進む"
              width={560}
              height={218}
              unoptimized
            />
          </div>

          <p className={styles.note}>
            あなたが自身の興味分野に協力することで、その分野が盛り上がっていることが可視化されて、
            <strong>あなたの興味分野への移行の促進に大きく繋がります！</strong>
            <br />
            また、盛り上がってない分野ほど効果が大きくなります。
            <strong>選択した分野は後で自由に変更可能・同時に複数参加可能</strong>
            ですので、ぜひともお気軽にご参加ください！
          </p>

          <div className={styles.center}>
            <button
              type="button"
              className={[styles.selectFieldButton, canSubmit ? styles.selectFieldEnabled : styles.selectFieldDisabled].join(" ")}
              disabled={!canSubmit}
              onClick={async () => {
                if (!selectedField) return;
                if (isJoined) {
                  router.push(`/moderation_beta?field=${encodeURIComponent(selectedField)}`);
                  return;
                }
                const result = await onJoin?.(selectedField);
                if (result?.ok) {
                  router.push(`/moderation_beta?field=${encodeURIComponent(selectedField)}`);
                }
              }}
            >
              {isJoined ? "選択済みの分野に移動する" : "選択した分野に参加する"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
