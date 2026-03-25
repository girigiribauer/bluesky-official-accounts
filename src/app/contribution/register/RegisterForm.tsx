"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnnotationButton } from "src/components/AnnotationButton";
import { registerContributionSchema } from "src/lib/schemas/registerContribution";
import styles from "./RegisterForm.module.scss";

type BlueskyCheckState = "idle" | "checking" | "new" | "registered" | "invalid";
type SubmitState = "idle" | "submitting" | "error";

type ResolvedAccount = {
  did: string;
  handle: string;
  displayName: string;
};

type ExistingData = {
  name: string;
  category: string;
  source: string;
  twitter: string;
  status: string;
};

const FETCH_TIMEOUT_MS = 10000;

const fetchWithTimeout = async (url: string, options?: RequestInit) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const FIELDS = [
  "公共・報道・インフラ",
  "企業・ブランド・サービス",
  "IT・テック・Web",
  "漫画・イラスト・アート",
  "映像作品（実写・アニメ）",
  "ゲーム・玩具・キャラクター",
  "音楽・声優・サウンド",
  "芸能・タレント・配信",
  "出版・文芸",
  "スポーツ・公営競技",
  "飲食・観光・地域文化",
  "美容・ファッション・装い",
  "暮らし・趣味・こだわり",
  "bot・定期配信",
];

const OLD_CATEGORIES = [
  "政府・省庁・国会議員",
  "地方自治体・地方議員",
  "権利・社会",
  "福祉・ボランティア",
  "教育機関",
  "学者・研究者・科学者",
  "学生活動",
  "気象・災害",
  "報道（マスメディア）",
  "報道（個人・その他団体）",
  "ネットメディア",
  "水族館・動植物園",
  "博物館・美術館・展覧会",
  "美術家・芸術家",
  "写真・カメラ（個人・団体）",
  "映像制作（個人・団体）",
  "アニメ（作品）",
  "アニメ（個人・団体）",
  "漫画家・イラストレーター",
  "漫画作品",
  "小説家・作家",
  "出版・書店",
  "文房具・事務用品",
  "同人活動（個人・団体）",
  "ゲーム（個人・団体）",
  "おもちゃ",
  "音楽（個人・団体）",
  "声優",
  "テレビ番組・実写映画",
  "ラジオ番組・その他放送",
  "タレント・モデル",
  "テクノロジー（個人・団体・技術領域）",
  "ネットサービス",
  "配信系",
  "飲食",
  "動物カフェ・いきものアカウント",
  "キャラクター・マスコット",
  "観光",
  "交通・乗り物",
  "神社仏閣・宗教",
  "医療・ヘルスケア（個人・団体）",
  "美容・ファッション",
  "雑貨・インテリア",
  "スポーツ",
  "その他著名人",
  "その他企業・団体",
  "その他サービス・作品",
];

const STATUS_OPTIONS = [
  { value: "", label: "（選択してください）" },
  { value: "未移行（未確認）", label: "未確認" },
  { value: "アカウント作成済", label: "アカウント作成済" },
  { value: "両方運用中", label: "両方運用中" },
  { value: "Bluesky 完全移行", label: "Bluesky 完全移行" },
];

const EVIDENCE_SHORTCUTS: { label: string; template: string | null }[] = [
  { label: "（選択してください）", template: null },
  { label: "カスタムドメインのため", template: "カスタムドメインのため" },
  { label: "X/Twitter プロフィールに記載あり", template: "X/Twitter プロフィールに記載あり" },
  { label: "X/Twitter での言及", template: "X/Twitter での言及あり\nURLは\n\nです。" },
  { label: "公式サイトにリンクあり", template: "公式サイトにリンクあり\nURLは\n\nです。" },
  { label: "その他", template: "同一だとわかる客観的根拠として\n\nがあります。" },
];

export const RegisterForm = () => {
  const router = useRouter();
  const [blueskyInput, setBlueskyInput] = useState("");
  const [blueskyCheckState, setBlueskyCheckState] = useState<BlueskyCheckState>("idle");
  const [resolvedAccount, setResolvedAccount] = useState<ResolvedAccount | null>(null);
  const [existingData, setExistingData] = useState<ExistingData | null>(null);
  const [accountName, setAccountName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [oldCategory, setOldCategory] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [migrationStatus, setMigrationStatus] = useState("");
  const [evidence, setEvidence] = useState("");
  const [evidenceShortcut, setEvidenceShortcut] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isFormOpen = blueskyCheckState === "new" || blueskyCheckState === "registered";
  const canSubmit =
    isFormOpen &&
    submitState !== "submitting" &&
    registerContributionSchema.safeParse({
      did: resolvedAccount?.did ?? "",
      handle: resolvedAccount?.handle ?? "",
      accountName,
      oldCategory,
      fields: selectedCategories,
      migrationStatus,
      twitterUrl,
      evidence,
    }).success;

  const runCheck = async (input: string) => {
    if (!input.trim()) return;
    setBlueskyCheckState("checking");
    setResolvedAccount(null);
    setExistingData(null);
    try {
      const res = await fetchWithTimeout(
        `/api/contribution/register/check?actor=${encodeURIComponent(input.trim())}`
      );
      if (!res.ok) {
        setBlueskyCheckState("idle");
        return;
      }
      const data = await res.json();
      if (data.status === "new") {
        setResolvedAccount({ did: data.did, handle: data.handle, displayName: data.displayName });
        setAccountName(data.displayName);
        setOldCategory("");
        setTwitterUrl("");
        setMigrationStatus("");
        setEvidence("");
        setSelectedCategories([]);
        setBlueskyCheckState("new");
      } else if (data.status === "registered") {
        setResolvedAccount({ did: data.did, handle: data.handle, displayName: data.displayName });
        setExistingData(data.existing);
        setAccountName(data.existing.name);
        setOldCategory(data.existing.category);
        setTwitterUrl(data.existing.twitter);
        setMigrationStatus(data.existing.status);
        setEvidence("");
        setSelectedCategories([]);
        setBlueskyCheckState("registered");
      } else {
        setBlueskyCheckState("invalid");
      }
    } catch {
      setBlueskyCheckState("idle");
    }
  };

  const handleBlueskyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBlueskyInput(value);
    setBlueskyCheckState("idle");
    setResolvedAccount(null);
    setExistingData(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) return;

    debounceRef.current = setTimeout(() => runCheck(value), 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !resolvedAccount) return;

    setSubmitState("submitting");
    setErrorMessage("");

    try {
      const res = await fetchWithTimeout("/api/contribution/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          did: resolvedAccount.did,
          handle: resolvedAccount.handle,
          accountName: accountName.trim(),
          oldCategory,
          fields: selectedCategories,
          migrationStatus,
          twitterUrl: twitterUrl.trim(),
          evidence: evidence.trim(),
          website: honeypot,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "送信に失敗しました");
      }

      router.push("/contribution/register/complete");
    } catch (err) {
      setSubmitState("error");
      setErrorMessage(
        err instanceof Error && err.name === "AbortError"
          ? "タイムアウトしました。時間をおいて再度お試しください。"
          : err instanceof Error
          ? err.message
          : "送信に失敗しました。時間をおいて再度お試しください。"
      );
    }
  };

  const isSubmitting = submitState === "submitting";

  const handleEvidenceShortcut = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = EVIDENCE_SHORTCUTS.find((s) => s.label === e.target.value);
    if (selected?.template) setEvidence(selected.template);
    setEvidenceShortcut("");
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(cat)) return prev.filter((c) => c !== cat);
      if (prev.length >= 3) return prev;
      return [...prev, cat];
    });
  };

  return (
    <form
      className={[styles.form, isSubmitting ? styles.formSubmitting : ""].join(" ")}
      onSubmit={handleSubmit}
    >
      {/* ハニーポット（ボット対策・非表示） */}
      <input
        type="text"
        name="website"
        aria-hidden="true"
        tabIndex={-1}
        style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0 }}
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
      />

      {/* Bluesky アカウント */}
      <div className={styles.item}>
        <label className={styles.label} htmlFor="bluesky-account">
          Bluesky アカウント
        </label>
        <p className={styles.description}>
          Bluesky プロフィールページのURL、ハンドルネーム、DIDのいずれかをそのままコピペしてください。
        </p>
        <input
          id="bluesky-account"
          className={styles.input}
          type="text"
          placeholder="https://bsky.app/profile/bsky.app"
          value={blueskyInput}
          onChange={handleBlueskyChange}
        />
        <div aria-live="polite">
          {blueskyCheckState === "new" && resolvedAccount && (
            <p className={styles.fieldSuccess}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
              </svg>
              @{resolvedAccount.handle}（新規登録）
            </p>
          )}
          {blueskyCheckState === "registered" && resolvedAccount && (
            <p className={styles.fieldSuccess}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="14" height="14" fill="currentColor" aria-hidden="true">
                <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
              </svg>
              @{resolvedAccount.handle}（既存アカウントの更新）
            </p>
          )}
        </div>
        <p className={styles.otherForm}>
          Blueskyアカウントがない場合は『
          <a href="/contribution/request">来て欲しいアカウント登録フォーム</a>
          』から入力してください。
        </p>
      </div>

      {/* placeholder エリア */}
      {(blueskyCheckState === "idle" || blueskyCheckState === "checking" || blueskyCheckState === "invalid") && (
        <div className={styles.formEmpty} aria-live="polite">
          {blueskyCheckState === "idle" && (
            <p className={styles.formEmptyText}>
              先に Bluesky アカウントを入力してください
              <br />
              続けて必要な項目が表示されます
            </p>
          )}
          {blueskyCheckState === "checking" && (
            <p className={styles.formEmptyText}>読み込み中です...</p>
          )}
          {blueskyCheckState === "invalid" && (
            <p className={styles.formEmptyText}>
              アカウントの形式が不正です
              <br />
              URL・ハンドル・DID をご確認ください
            </p>
          )}
        </div>
      )}

      {/* アカウント確認後フォーム項目 */}
      {isFormOpen && (
        <>
          {/* アカウント名称 */}
          <div className={styles.item}>
            <label className={styles.label} htmlFor="account-name">
              アカウント名称
            </label>
            <p className={styles.description}>
              自動入力されます。Blueskyアカウントが正しいかどうかご確認ください。
              <br />
              なお、アカウント名に定常的な名称でない文言を付与している場合は、適宜削除願います。
            </p>
            <input
              id="account-name"
              className={styles.input}
              type="text"
              maxLength={100}
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
          </div>

          {/* 旧分類 */}
          <div className={styles.item}>
            <label className={styles.label} htmlFor="old-category">
              分類(旧)
            </label>
            <p className={styles.description}>
              そのアカウントの興味分野が一番近い分類を選んでください。（以下の分野に移行予定）
            </p>
            <select
              id="old-category"
              className={styles.select}
              value={oldCategory}
              onChange={(e) => setOldCategory(e.target.value)}
            >
              <option value="">（選択してください）</option>
              {OLD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 分野 */}
          <div className={styles.item}>
            <div className={styles.labelRow}>
              <span className={styles.label}>分野</span>
              <AnnotationButton label="分野・分類について" className={styles.cautionButton}>
                <section className="page-section">
                  <h2>分野・分類について</h2>
                  <p>
                    現在、新たなモデレーションサイト構築に向けて、旧分類を見直し、新たな分野・分類として紐付け直しを図っています。
                    <br />
                    新しい分野では、分野ごとに有識者の方々が集まり、その中での分類作成や分類分けなどのモデレーションを行っていただくことを想定しています。
                  </p>
                  <p>
                    これまで旧分類同士でどちらに属するのか曖昧になるケースが存在していましたが、<strong>新たな分野については、異なる分野で重複を許容するシステム</strong>にしていくつもりです。（例: 任天堂株式会社さんであれば、ゲームの興味分野とビジネスの興味分野のそれぞれに属する形）
                  </p>
                  <p>
                    しばらく移行期間中は新旧両方を指定していただくことになるかと思います。お手数をおかけしますが、ご協力をよろしくお願いします。
                  </p>
                </section>
              </AnnotationButton>
            </div>
            <p className={styles.description}>
              そのアカウントの興味分野が一番近いものを選んでください。
              <br />
              <strong>どうしても迷った場合のみ複数選択</strong>してください。（最大3つ）
            </p>
            <div className={styles.chips}>
              {FIELDS.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                const isDisabled = !isSelected && selectedCategories.length >= 3;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={[
                      styles.chip,
                      isSelected ? styles.chipSelected : "",
                      isDisabled ? styles.chipDisabled : "",
                    ].join(" ")}
                    onClick={() => toggleCategory(cat)}
                    disabled={isDisabled}
                  >
                    <span className={styles.chipIcon}>{isSelected && "✓"}</span>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 移行ステータス */}
          <div className={styles.item}>
            <label className={styles.label} htmlFor="migration-status">
              移行ステータス
            </label>
            <p className={styles.description}>
              Bluesky アカウントの今の移行状態を次の中から選んでください。
            </p>
            <select
              id="migration-status"
              className={styles.select}
              value={migrationStatus}
              onChange={(e) => setMigrationStatus(e.target.value)}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* X(Twitter) プロフィールURL */}
          <div className={styles.item}>
            <label className={styles.label} htmlFor="twitter-url">
              X(Twitter) プロフィールURL
            </label>
            <p className={styles.description}>
              X(Twitter) のプロフィールURLをそのままコピペしてください。
            </p>
            <input
              id="twitter-url"
              className={styles.input}
              type="text"
              inputMode="url"
              placeholder="https://x.com/bluesky"
              maxLength={150}
              value={twitterUrl}
              onChange={(e) => setTwitterUrl(e.target.value)}
            />
          </div>

          {/* 根拠 */}
          <div className={styles.item}>
            <label className={styles.label} htmlFor="evidence-text">
              根拠
            </label>
            <p className={styles.description}>
              X(Twitter) と Bluesky が同一である根拠を記入してください。
            </p>
            <div className={styles.customTextarea}>
              <div className={styles.evidenceShortcut}>
                <span>ショートカットから選択: </span>
                <select
                  className={styles.selectSmall}
                  value={evidenceShortcut}
                  onChange={handleEvidenceShortcut}
                >
                  {EVIDENCE_SHORTCUTS.map((s) => (
                    <option key={s.label} value={s.label}>{s.label}</option>
                  ))}
                </select>
              </div>
              <textarea
                id="evidence-text"
                className={styles.textarea}
                maxLength={1000}
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
              />
            </div>
            {blueskyCheckState === "registered" && existingData && (
              <div className={styles.readonlyItem}>
                <span className={styles.labelSmall}>投稿済みの根拠の履歴</span>
                <textarea
                  className={styles.inputReadonly}
                  value={existingData.source}
                  readOnly
                />
              </div>
            )}
          </div>
        </>
      )}

      <hr className={styles.separator} />

      {submitState === "error" && (
        <p className={styles.submitError} role="alert">{errorMessage}</p>
      )}

      <button
        type="submit"
        className={[
          styles.submitButton,
          canSubmit ? styles.submitButtonActive : "",
        ].join(" ")}
        disabled={!canSubmit}
      >
        {isSubmitting ? "送信中..." : "投稿する"}
      </button>
    </form>
  );
};
