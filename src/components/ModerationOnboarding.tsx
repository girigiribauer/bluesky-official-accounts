"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
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

  const detail = selectedField ? FIELD_DETAILS[selectedField] : null;
  const selectedLabel = selectedField ? FIELD_ID_LABELS[selectedField] : null;
  const isJoined = selectedField !== null && joinedFieldIds.includes(selectedField);
  const canJoin = selectedField !== null && !isJoined;

  return (
    <div className={styles.contents}>
      <div className={styles.formArea}>
        <div className={styles.form}>
          <h1 className={styles.title}>自分の好きな分野を選んでください</h1>
          <p className={styles.subtitle}>
            モデレーションサイトの利用は<Link href="/terms" className={styles.termLink}>『利用規約』</Link>に同意したとみなします。
          </p>

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
                <span className={styles.pickupFieldIcon} aria-hidden="true">
                  <i className="fa-solid fa-flag" />
                </span>
                <span className={styles.pickupTitle}>{selectedLabel}</span>
              </div>
              <div className={styles.pickupSeparator} />
              <div className={styles.pickupBoxes}>
                <div className={styles.pickupBox}>
                  <span className={styles.pickupLabel}>興味の向き</span>
                  <span className={styles.pickupContent}>{detail.interest}</span>
                </div>
                <div className={styles.pickupBox}>
                  <span className={styles.pickupLabel}>対象</span>
                  <span className={styles.pickupContent}>{detail.target}</span>
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

          <p className={styles.note}>選択した分野は後で自由に変更可能・同時に複数参加可能です。</p>

          <div className={styles.separator} />

          <div className={styles.center}>
            <button
              type="button"
              className={[styles.selectFieldButton, canJoin ? styles.selectFieldEnabled : styles.selectFieldDisabled].join(" ")}
              disabled={!canJoin}
              onClick={async () => {
                if (!canJoin || !selectedField) return;
                const result = await onJoin?.(selectedField);
                if (result?.ok) {
                  router.push(`/moderation_beta?field=${encodeURIComponent(selectedField)}`);
                }
              }}
            >
              選択した分野のチームに参加する
            </button>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <p className={styles.sectionText}>
          どうぞお気軽にご参加ください！<br />
          <span className={styles.sectionTextBlue}>あなたの好きな分野の移行促進を手伝って、自分の周りに好きな分野の話題をどんどん広げていきましょう！</span>
        </p>
      </div>
    </div>
  );
}
