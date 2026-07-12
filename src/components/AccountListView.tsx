"use client";

import { useEffect, useRef } from "react";
import { Account } from "src/models/Account";
import type { FilterRuleSet } from "src/models/FilterRuleSet";
import { TRANSITION_STATUS_LABELS } from "src/models/TransitionStatus";
import { useModal } from "src/hooks/useModal";
import { createAccountList, type AccountListController } from "src/modules/accountList/accountListCore";
import { FilterRuleTags } from "./FilterRuleTags";
import { AccountSummaryHeader } from "./AccountSummaryHeader";

import styles from "./AccountListView.module.scss";

export type AccountListViewProps = {
  filterRuleSet?: FilterRuleSet | null;
  handleReset?: (key: keyof FilterRuleSet) => void;
  items: Account[];
  updatedTime: string;
};

// 「根拠」モーダルの中身（React のまま。核はクリックを onEvidence で伝えるだけ）
const EvidenceContent = ({ account }: { account: Account }) => {
  const label = TRANSITION_STATUS_LABELS[account.status] ?? account.status;
  return (
    <section className={styles.evidence}>
      <h2 className={styles.evidenceTitle}>
        <span>{account.name} の根拠</span>
        <span className="status" data-status={account.status}>
          {label}
        </span>
      </h2>
      <textarea
        readOnly
        className={styles.evidenceText}
        defaultValue={
          account.source ||
          "現時点で根拠はありません。（カスタムドメインなど明らかな場合には書いてないケースがあります）"
        }
      />
    </section>
  );
};

export const AccountListView = ({
  filterRuleSet = null,
  handleReset = () => {},
  items,
  updatedTime,
}: AccountListViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ctrlRef = useRef<AccountListController | null>(null);
  const { updateModal } = useModal();

  // 最新の onEvidence を ref 経由で核へ渡す（核は一度だけ生成し、以後作り直さない）。
  // ref の書き込みは render 中でなく effect で行う（render 中の ref 更新は禁止）。
  const onEvidenceRef = useRef<(a: Account) => void>(() => {});
  useEffect(() => {
    onEvidenceRef.current = (a) => updateModal(<EvidenceContent account={a} />);
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const ctrl = createAccountList(containerRef.current, {
      height: 500,
      onEvidence: (a) => onEvidenceRef.current(a),
    });
    ctrlRef.current = ctrl;
    return () => {
      ctrl.destroy();
      ctrlRef.current = null;
    };
  }, []);

  // items（絞り込み済み）が変わったら核へ流し込む
  useEffect(() => {
    ctrlRef.current?.setAccounts(items);
  }, [items]);

  const total = items.length;
  const blueskyAccountsTotal = items.filter((a) => a.status !== "not_migrated").length;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <AccountSummaryHeader
          total={total}
          blueskyAccountsTotal={blueskyAccountsTotal}
          updatedTime={updatedTime}
          handleOpen={() => ctrlRef.current?.openAll()}
          handleClose={() => ctrlRef.current?.closeAll()}
        />

        <FilterRuleTags filterRuleSet={filterRuleSet} handleReset={handleReset} />
      </div>

      <div ref={containerRef} className={styles.listMount} />
    </div>
  );
};
