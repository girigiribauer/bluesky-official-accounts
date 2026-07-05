"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Moderator } from "src/lib/auth";
import { FIELD_ID_LABELS } from "src/constants/fields";
import { calcReviewCount, calcMemberCount } from "src/lib/moderationStats";
import type { ReviewSubmission, RequestSubmission, Activity, FieldMembership, Classification } from "src/types/moderation";
import { ReviewBottomSheet } from "./ReviewBottomSheet";
import { RequestReviewBottomSheet } from "./RequestReviewBottomSheet";
import { updateFieldLastActive } from "src/app/moderation_beta/actions";
import styles from "./ModerationDashboard.module.scss";

type Props = {
  entrySubmissions: ReviewSubmission[];
  requestSubmissions: RequestSubmission[];
  moderator: Moderator;
  activities: Activity[];
  moderatorReviewFieldIds: (string | null)[];
  fieldMemberships: FieldMembership[];
  adminCount: number;
  postCount: number;
  classifications: Classification[];
};

function groupByField(
  entries: ReviewSubmission[],
  requests: RequestSubmission[]
): { fieldId: string; entries: ReviewSubmission[]; requests: RequestSubmission[] }[] {
  const fieldOrder = Object.keys(FIELD_ID_LABELS);
  const grouped: Record<string, { entries: ReviewSubmission[]; requests: RequestSubmission[] }> = {};

  for (const s of entries) {
    const fieldId = s.field_id ?? "uncategorized";
    if (!grouped[fieldId]) grouped[fieldId] = { entries: [], requests: [] };
    grouped[fieldId].entries.push(s);
  }
  for (const r of requests) {
    const fieldId = r.field_id ?? "uncategorized";
    if (!grouped[fieldId]) grouped[fieldId] = { entries: [], requests: [] };
    grouped[fieldId].requests.push(r);
  }

  return Object.entries(grouped)
    .sort(([a], [b]) => {
      const ai = fieldOrder.indexOf(a);
      const bi = fieldOrder.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    })
    .map(([fieldId, { entries, requests }]) => ({ fieldId, entries, requests }));
}

function formatJoinedDate(isoString: string): string {
  const d = new Date(isoString);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}/${m}/${day}`;
}

export function Dashboard({ entrySubmissions, requestSubmissions, moderator, activities, moderatorReviewFieldIds, fieldMemberships, adminCount, postCount, classifications }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentField = searchParams.get("field") ?? undefined;

  useEffect(() => {
    if (currentField) {
      updateFieldLastActive(currentField);
    }
  }, [currentField]);

  const requestActiveId = pathname.match(/\/review\/request\/([^/?]+)/)?.[1] ?? null;
  const entryActiveId = requestActiveId ? null : (pathname.match(/\/review\/([^/?]+)/)?.[1] ?? null);

  const activeEntry = entryActiveId ? (entrySubmissions.find(s => s.id === entryActiveId) ?? null) : null;
  const activeRequest = requestActiveId ? (requestSubmissions.find(s => s.id === requestActiveId) ?? null) : null;
  const entryClassifications = activeEntry ? classifications.filter(c => c.field_id === activeEntry.field_id) : [];

  const filteredEntries = currentField
    ? entrySubmissions.filter((s) => s.field_id === currentField)
    : entrySubmissions;

  const filteredRequests = currentField
    ? requestSubmissions.filter((s) => s.field_id === currentField)
    : requestSubmissions;

  const totalCount = filteredEntries.length + filteredRequests.length;

  const reviewCount = calcReviewCount(moderatorReviewFieldIds, currentField);
  const memberCount = calcMemberCount(fieldMemberships, adminCount, currentField);

  const isEmpty = filteredEntries.length === 0 && filteredRequests.length === 0;
  const joinedDate = formatJoinedDate(moderator.created_at);

  const getEntryCardHref = (submissionId: string) => {
    if (entryActiveId === submissionId) {
      return currentField ? `/moderation_beta?field=${encodeURIComponent(currentField)}` : "/moderation_beta";
    }
    return currentField
      ? `/moderation_beta/review/${submissionId}?field=${encodeURIComponent(currentField)}`
      : `/moderation_beta/review/${submissionId}`;
  };

  const getRequestCardHref = (submissionId: string) =>
    requestActiveId === submissionId
      ? "/moderation_beta"
      : `/moderation_beta/review/request/${submissionId}`;

  return (
    <div className={styles.container}>
      {/* ダッシュボード上部 */}
      <div className={styles.dashboard}>
        <div className={styles.dashboardInner}>

          {/* フィールドセレクター */}
          <FieldSwitcher currentField={currentField} />

          {/* rows */}
          <div className={styles.rows}>
            {/* チームエリア */}
            <div className={styles.teamArea}>
              {/* Tasks（左/上） */}
              <div className={styles.tasks}>
                {isEmpty ? (
                  <div className={styles.cardListEmpty}>
                    <Image
                      src="/images/icon-task.svg"
                      alt=""
                      width={36}
                      height={36}
                      aria-hidden="true"
                    />
                    <p className={styles.cardListEmptyText}>
                      タスクはすべて完了です！<br />
                      いつもありがとうございます！
                    </p>
                  </div>
                ) : (
                  <div className={styles.taskCards}>
                    {groupByField(filteredEntries, filteredRequests).map(({ fieldId, entries, requests }) => (
                      <div key={fieldId} className={styles.taskCardGroup}>
                        <p className={styles.taskCardGroupLabel}>{FIELD_ID_LABELS[fieldId] ?? fieldId}</p>
                        <div className={styles.taskCardRow}>
                          {entries.map((submission) => (
                            <Link
                              key={submission.id}
                              href={getEntryCardHref(submission.id)}
                              className={[styles.taskCard, entryActiveId === submission.id ? styles.taskCardActive : ""].join(" ")}
                            >
                              <span className={styles.taskCardHeader}>{submission.existing_bluesky_handle ? "Update" : "Review"}</span>
                              <span className={styles.taskCardBody}>
                                <span className={styles.taskCardName} title={submission.account_name}>{submission.account_name}</span>
                                <span className={styles.taskCardHandle} title={`@${submission.bluesky_handle}`}>@{submission.bluesky_handle}</span>
                              </span>
                            </Link>
                          ))}
                          {requests.map((submission) => (
                            <Link
                              key={submission.id}
                              href={getRequestCardHref(submission.id)}
                              className={[styles.taskCard, requestActiveId === submission.id ? styles.taskCardActive : ""].join(" ")}
                            >
                              <span className={styles.taskCardHeader}>Review</span>
                              <span className={styles.taskCardBody}>
                                <span className={styles.taskCardName} title={submission.display_name}>{submission.display_name}</span>
                                <span className={styles.taskCardHandle} title={`@${submission.twitter_handle}`}>@{submission.twitter_handle}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* FloatingText: 残りN件 */}
                <div className={styles.floatingText}>
                  <span className={styles.floatingLabel}>残り</span>
                  <strong className={styles.floatingCount}>{totalCount}</strong>
                  <span className={styles.floatingLabel}>件</span>
                </div>
              </div>

              {/* Members（右/下） */}
              <div className={styles.members}>
                <div className={styles.userList}>
                  {Array.from({ length: memberCount }).map((_, i) => (
                    <i key={i} className={["fa-solid fa-circle-user", styles.memberIcon].join(" ")} />
                  ))}
                </div>
                {/* FloatingText: 参加N名 */}
                <div className={styles.floatingText}>
                  <span className={styles.floatingLabel}>参加</span>
                  <strong className={styles.floatingCount}>{memberCount}</strong>
                  <span className={styles.floatingLabel}>名</span>
                </div>
              </div>
            </div>

            {/* columns: MySelfArea + ActivityArea */}
            <div className={styles.columns}>
              {/* MySelfArea */}
              <div className={styles.myselfArea}>
                {/* 上段: プロフィール（左）+ 参加日（右） */}
                <div className={styles.myselfTop}>
                  <div className={styles.profile}>
                    {moderator.avatar ? (
                      <Image
                        src={moderator.avatar}
                        alt=""
                        width={40}
                        height={40}
                        className={styles.avatar}
                        aria-hidden="true"
                      />
                    ) : (
                      <i className={["fa-solid fa-circle-user", styles.avatarIcon].join(" ")} />
                    )}
                    <div className={styles.profileText}>
                      <p className={styles.handle}>@{moderator.handle}</p>
                      <p className={styles.displayName}>{moderator.display_name}{moderator.is_admin && "（管理者）"}</p>
                    </div>
                  </div>
                  <p className={styles.joinedDate}>{joinedDate} 参加</p>
                </div>
                {/* 下段: レビューN回 ＋ 投稿N回 */}
                <div className={styles.myselfBottom}>
                  <div className={styles.floatingText}>
                    <span className={styles.floatingLabel}>レビュー</span>
                    <strong className={styles.floatingCount}>{reviewCount}</strong>
                    <span className={styles.floatingLabel}>回</span>
                  </div>
                  <div className={styles.floatingText}>
                    <span className={styles.floatingLabel}>投稿</span>
                    <strong className={styles.floatingCount}>{postCount}</strong>
                    <span className={styles.floatingLabel}>回</span>
                  </div>
                </div>
              </div>

              {/* ActivityArea */}
              <div className={styles.activityArea}>
                <ul className={styles.activityList}>
                  {activities.map((act) => (
                    <li key={act.id} className={styles.activityItem}>
                      <span className={styles.activityIcon} aria-hidden="true">
                        <i className="fa-solid fa-circle-user" />
                      </span>
                      [{new Date(act.created_at).toLocaleString("ja-JP")}] {act.moderators?.display_name} さんが{" "}
                      {act.payload?.display_name}を{act.action === "approve" ? "公開" : "却下"}しました
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeEntry && (
        <ReviewBottomSheet submission={activeEntry} classifications={entryClassifications} />
      )}
      {activeRequest && (
        <RequestReviewBottomSheet submission={activeRequest} />
      )}

      {/* タスクエリア（パネル未選択時のみ） */}
      {!entryActiveId && !requestActiveId && (
        <div className={styles.taskArea}>
          {isEmpty ? (
            <div className={styles.taskEmptyState}>
              <div className={styles.taskEmptyInner}>
                <Image
                  src="/images/emoji-cooperation.svg"
                  alt=""
                  width={99}
                  height={86}
                  aria-hidden="true"
                />
                <p className={styles.taskEmptyText}>
                  いつもご協力ありがとうございます！<br />
                  負荷分散しつつ協力しあっていきましょう！
                </p>
              </div>
            </div>
          ) : (
            <div className={styles.taskEmptyState}>
              <div className={styles.taskEmptyInner}>
                <Image
                  src="/images/emoji-artist.svg"
                  alt=""
                  width={99}
                  height={86}
                  aria-hidden="true"
                />
                <p className={styles.taskEmptyText}>
                  いつもご協力ありがとうございます！<br />
                  上のタスクリストから1つ選んでください！
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FieldSwitcher({ currentField }: { currentField?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className={styles.fieldSelectorWrapper} ref={ref}>
      <button
        className={styles.fieldSelector}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className={styles.fieldIcon} aria-hidden="true">
          <i className="fa-solid fa-flag" />
        </span>
        <span>
          {currentField
            ? `${FIELD_ID_LABELS[currentField] ?? currentField} チーム`
            : "すべての分野"}
        </span>
        <i className={["fa-solid", open ? "fa-chevron-up" : "fa-chevron-down"].join(" ")} />
      </button>
      {open && (
        <div className={styles.fieldMenu}>
          <Link
            href="/moderation_beta"
            className={[styles.fieldMenuItem, !currentField ? styles.fieldMenuItemActive : ""].join(" ")}
            onClick={() => setOpen(false)}
          >
            すべての分野
          </Link>
          {Object.entries(FIELD_ID_LABELS).map(([id, label]) => (
            <Link
              key={id}
              href={`/moderation_beta?field=${encodeURIComponent(id)}`}
              className={[styles.fieldMenuItem, currentField === id ? styles.fieldMenuItemActive : ""].join(" ")}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className={styles.fieldMenuSeparator} />
          <Link
            href="/moderation_beta/onboard"
            className={styles.fieldMenuItemAdd}
            onClick={() => setOpen(false)}
          >
            <i className="fa-solid fa-plus" aria-hidden="true" />
            分野を追加
          </Link>
        </div>
      )}
    </div>
  );
}
