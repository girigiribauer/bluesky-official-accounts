# バックログ

このファイルは「**いま何が残っているか**」を管理する生きたタスク一覧です。
「あるべき姿（仕様・設計）」は別ドキュメント（`docs/planning_migration/` など）に置き、ここには進捗と残作業だけを書きます。両者を混在させない。

セクションは単なる分類で、並び順に優先度の意味はありません。代わりに各タスクへ**曖昧度**（そのまま着手できるか）を付け、着手前に明らかにすべきものを早めに壁打ちで潰せるようにしています。

- 状態: `[ ]` 未着手 / `[~]` 進行中 / `[x]` 完了
- 曖昧度（2段目に理由）:
  - 🟢 **明確** … 何をやるか決まっていて着手できる
  - 🟡 **要確認** … 大枠は明確。着手前に小さな確認・調査だけ要る
  - 🔴 **要壁打ち** … 方針・設計が未確定。着手前に壁打ちして明らかにする（＝早めにやる価値がある）
- `⚠️` = 本公開（`/moderation` 一般開放）のブロッカー（事実タグ。優先度ではない）
- `→` = 背景・参照先

---

## 技術的なこと

### パフォーマンス

- [x] ⚠️ Vercel Functions の region を東京（hnd1）に揃える → 遅さの主犯だった（関数が iad1=米国東海岸、DB は東京で全クエリが太平洋往復）。`vercel.json` に `"regions": ["hnd1"]` を追加しデプロイ済み。検証: `x-vercel-id` が `hnd1::hnd1` に、DB を叩く公開 API が warm 150〜185ms（推定 従来比約3倍速、逐次往復の多い承認処理はさらに大きく改善見込み）
- [x] ⚠️ 承認処理をトランザクション化する（原子性の確保）→ `approve_entry_submission` / `approve_request_submission` の plpgsql 関数（`migrations/20260706000000_...`）に一連の書き込みを閉じ込め、`actions.ts` から `supabase.rpc()` で呼ぶ。関数内は1トランザクション＝途中失敗で全ロールバック。承認のユニットは配線テストに置換。**統合テスト17件パス＋原子性テスト（UNIQUE 違反で途中失敗させ account が残らないことを確認）で実証済み**。postmortem 型の中途半端 state を構造的に解消
- [ ] ダッシュボードの往復回数を減らす → 描画ごとに7クエリを並列発行（`(dashboard)/layout.tsx`）。同様に集約 or `rpc()`/ビューでまとめる
  - 🟡 要確認: 集約 SQL に寄せるかビューにするか、実データを見て判断
- [x] pg 直結 + `attachDatabasePool` は**やらない**（判断確定・再検討条件付き）→ 遅さの主犯はリージョンずれで解決済み。残る旨味は1クエリ1〜2ms のみで、移行費用（40箇所書き換え＋型＋テスト書き直し）と Supavisor×Fluid の接続増加という既知問題に見合わない。「毎回 createClient」も遅さと無関係だった（実測）
  - 再検討条件: ①rpc() 化後も本番計測で DB 待ちが支配的 ②表側が DB 直読みに変わりトラフィック激増 ③DX 目的で Drizzle 等を導入する時（その場合 attachDatabasePool は1行のおまけ）

> spike 実測（ローカル・ネットワーク遅延ゼロ / median）: supabase-js 単発 2.0ms・pg 直結 0.34ms（接続方法 6倍差）／ supabase-js 7回逐次 13.2ms・pg 1往復 0.44ms（往復まとめ 5倍差）。本番は往復回数の影響がさらに支配的。

### 認証・セキュリティ

- [ ] ⚠️ RLS ポリシーを設計する → 全テーブル RLS 有効だがポリシー未設定で、サーバーはサービスロールで全バイパス中（`initial_schema.sql`）
  - 🔴 要壁打ち: 一般開放時に「誰が何を読めるか」の公開モデルが未定。ここを決めないと書けない
- [ ] セッション cookie に有効期限を持たせる → 今は HMAC 署名のみで失効しない（`src/lib/auth.ts`）
  - 🔴 要壁打ち: 有効期限・再発行の方針が未定
- [ ] betaAllowList を撤去 / 置換する → 一般開放時に不要（`src/lib/betaAllowList.ts`）
  - 🟢 明確: やることは自明。一般開放のタイミング待ち

### テスト・検証

- [x] ⚠️ マイグレーションをデプロイに畳んで順序を構造で担保 → Vercel の `buildCommand` を `scripts/vercel-build.sh` に。production 時のみ `supabase db push --db-url --yes`（env `SUPABASE_DB_URL`=session pooler URI）してから `next build`、migrate 失敗＝デプロイ失敗。postmortem の「migrate はデプロイより先に」を運用ルールでなく構造で保証。**本番デプロイのビルドログで接続・順序を実証済み**（`Connecting to remote database... / Remote database is up to date.`）
- [x] `.github/workflows/migrate.yml` を削除する → デプロイに畳んだため役目終了（`7c0cd0d`で削除済み。現存するのは`update-data.yml`のみ）
- [~] Node を 22 に上げる → `package.json` に `engines.node: "22.x"` を追加済み（Vercel はこれを見てランタイムを選ぶ）。残り: 次デプロイのビルドログで Node 22 になっているか確認。必要なら Vercel プロジェクト設定側の Node バージョンも 22 に。ローカルが Node 20 なら `npm install` で engines 警告が出るが実害なし（`@types/node` も ^22 に上げると尚良い）
- [ ] ⚠️ ロールバック手順を明文化する（postmortem 再発防止）
  - 🟢 明確: 手順を書き起こすだけ
- [x] ⚠️ ブラウザ E2E（Playwright）を薄く1枚入れる → `tests/e2e/` に4本（登録フォーム投稿・来て欲しいフォーム投稿・重複投稿の表示・モデレーター承認）。`npm run test:e2e`（要: ローカル DB 起動。dev サーバーは自動起動）。OAuth は署名 cookie 直付けで迂回、Bluesky アカウント解決は `page.route()` で内部 API をスタブ。方針: 正常系＋ユーザーが日常的に踏むエラー表示のみ。これ以上増やさない（増やしたくなったら下の層へ）
- [x] 重複チェック表示のバグ修正 → `RequestForm` が `duplicate === true`（boolean）と比較していたが、check API の実際の返却は `"none"|"entry"|"request"`（文字列）で、**重複メッセージが一度も表示されていなかった**。E2E 追加時に発覚。route テストのモックも実契約（文字列）に修正（233件パス）
- [x] 「分類（旧）」撤去に伴うE2E破損の修正 → `tests/e2e/contribution.spec.ts` が削除済みの「分類（旧）」`<select>`を`getByRole("combobox")`で探しに行き3件タイムアウトしていた（**リリース前にE2Eで検知**）。該当の`selectOption`呼び出しを削除。あわせて`RegisterForm`の`selectedCategories`→`selectedFields`にリネーム、`moderationFlow.integration.test.ts`の`oldCategory`残置も削除、FAQページ（`/faq#categorize`）の「分類（旧）」言及・「3つまで選択可」という誤った案内を実態に合わせて修正
- [ ] E2E の CI 組み込み / デプロイ前チェック運用 → 今はローカル実行のみ。GitHub Actions で回すか、デプロイ前の手動チェックリストに組み込むか
  - 🟡 要確認: CI で Supabase をどう立てるか（`supabase start` は重い）と、実行タイミングの運用を決める
- [ ] actions の unit テストを脱・実装依存にする → `actions.test.ts` は Supabase チェーンを手作りモックし呼び出し手順を assert していて脆い。承認/却下は integration に寄せ、チェーンモックを減らす
  - 🟡 要確認（**DB 接続見直しの後に**）: 直結化でモック境界が変わり作り直しになるため、先にやると無駄
- [ ] 統合テストの分離をトランザクションロールバックにする → 今は `[テスト]%` 命名＋手動 delete 頼みで壊れやすい（cleanup 漏れで実際に事故った）
  - 🟡 要確認（**DB 接続見直しの後に**）: PostgREST/HTTP では test ごとにトランザクションを張れない。直結にして初めて実現可能
- [x] カバレッジ計測は一度導入→撤去 → `@vitest/coverage-v8` で盲点マップを取得（全体約35%、`lib`約80%、UI 0%）。UIの守りは E2E と決めたためグローバル%を追う意味が薄く、設定・依存ごと撤去

### 観測性

- [ ] ヘルスチェック `/api/health` を作る → DB に軽いクエリを1発投げ `{ ok, dbLatencyMs, migration }` 等を返す。デプロイ後に叩けば「DB 接続・レイテンシ」を推測でなく**観測**できる（今回のリージョンずれのような遅延劣化も即検知できたはず）。将来は Uptime 監視からも叩ける
  - 🟢 明確: エンドポイント1本。任意拡張として、値をモデレーション画面ヘッダに「DB OK / N ms」と小さく出すと「ダッシュボードから DB 接続が見えない」も解消（こちらは UI 作業）

### データ・移行運用

- [x] fetch スクリプトを新分野ベースに更新する → `scripts/fetchAccountList.ts` から `old_category` の select・`Account.category` フィールド・カテゴリーソートキーを削除（ソートは名前のみに変更）。`Account`型からも`category`を削除（`src/models/Account.ts`）
- [x] 公開フォームの「分類（旧）」入力を廃止する → `FieldSelector`/`OLD_CATEGORIES`/`registerContribution`・`requestContribution`スキーマ・各route・`useBlueskyCheck`から`oldCategory`/`old_category`関連を削除。`RegisterForm`/`RequestForm`から「分類（旧）」欄が消えたことを目視確認済み
- [x] `old_category` カラム・`old_categories` テーブルを廃止する → migration `20260713000000_drop_old_category.sql` を用意（`approve_entry_submission`関数の`old_category`参照を除去してからカラム・テーブルをdrop）。`types/database.ts`（DB生成型を手動追従）・`types/moderation.ts`・`actions.test.ts`から参照を削除。コード側の`old_category`/`old_categor`参照はゼロ。実DBへの適用はデプロイ時の自動migrate（`scripts/vercel-build.sh`）に委ねる

### リファクタ（品質）

- [ ] DB seed を分野マスターから生成する → コード側は `src/constants/fields.ts` の `FIELDS` に一元化済み。残るは `fields` テーブルの seed（SQL）を `FIELDS` から生成する仕組み（`categories.md` は人間向けドキュメントなので対象外）
  - 🔴 要壁打ち: SQL seed をコードから生成する codegen を migration フローにどう組み込むかが未定
- [ ] エラーの握りつぶしをやめる → `catch { ... "更新に失敗しました" }` が実エラーを捨てている。ログ有無も不統一
  - 🟡 要確認: 方向は明確だが、ログ方針（何をどこに出す/何を利用者に見せる）の共通ルールを軽く決めたい
- [ ] 型の二重管理を整理する → 生成型 `database.ts` と手書き `moderation.ts` が併存し `as unknown as` の強制キャストが要る（`(dashboard)/layout.tsx`）
  - 🔴 要壁打ち: 生成型とドメイン型をどう役割分担させるか、設計論の整理が要る
- [x] `actions.ts` のボイラープレートを削減 → `updateSubmission*` 6関数を `updateEntrySubmissionFields` に集約（約110行 → 約55行、tsc / ユニット32件パス）
- [x] 命名衝突を解消 → `ModerationDashboard` 内インライン `FieldSelector` を `FieldSwitcher` にリネーム（フォームの `FieldSelector` との混同を解消）
- [x] ローカル型の重複を解消 → `ModerationOnboarding` の `Result` を `types/result.ts` に統一
- [x] 分野定義の一元化（コード側）→ `FIELD_ID_LABELS` / `FIELD_DETAILS` を `fields.ts` の `FIELDS` 単一ソースから導出。import 6ファイルを整理、tsc / 232件パス（DB seed 生成は別項目）

---

## 設計・モデリング的なこと

- [x] 旧カテゴリーから新分野への割り当て → 割り当てルールは `categories.md` に定義・適用済み。「未分類」は分野モデレーター確保後に順次拾う正規の置き場（設計課題ではなく運用課題。関連: 「分野ごとの協力者を集める導線をつくる」）
- [ ] モデレーターのライフサイクルを実装する → 半年無活動で権限失効など（未実装）
  - 🟡 要確認: 概念は明確。失効の正確なルールと自動実行の仕組み（cron 等）を決める
- [ ] 段階制度（3段階の権限）を実装する → 入門 / 一人前 / 熟練。今は `is_admin` フラグだけ。「管理者以外でも捌ける」体制の核（`moderation.md`）
  - 🔴 要壁打ち: 昇格条件の具体値・UI が未確定（`moderation.md` にも「数値は別途設計」とある）
- [ ] 後追いレビューの仕組みをモデル化する → 入門者の操作を一人前以上が追認。タスクとして積む形（未実装）
  - 🔴 要壁打ち: タスクの積み方・UI・データモデルが未設計
- [ ] 異議申し立て機能を実装する → モデレーターからの異議を熟練が対応（`moderation.md`）
  - 🔴 要壁打ち: フロー・データモデルが未設計
- [ ] サイト内通知を実装する（未実装）
  - 🔴 要壁打ち: 何を・いつ・誰に通知するかが未定
- [ ] ポイント制度を実装する → ゲーミフィケーション（`moderation.md`）
  - 🔴 要壁打ち: 名称・配分ともに未確定
- [ ] atproto / PDS 対応（フェーズ6・将来）→ 承認時に PDS へレコードを書き込む
  - 🔴 要壁打ち: レキシコン設計から。将来テーマ

---

## デザイン・UI的なこと

- [ ] `/moderation_beta` を `/moderation` へ昇格する → 本公開時の URL・導線整理
  - 🟢 明確: ルート移動とリダイレクト。やることは自明（本公開タイミング）
- [ ] ⚠️ ダッシュボードの投稿数を実データにする → 今は `postCount={0}` のハードコード（`(dashboard)/layout.tsx`）
  - 🟡 要確認: 「投稿数」が何を指すか（申請数? 分野別? 期間?）の定義を決める
- [ ] チームメンバーのアイコンを表示する → UI 表示が未対応
  - 🟡 要確認: `moderators.avatar` がログイン時に保存されているか現状確認が先
- [x] 表側（公開ページ）を新分野・分類ベースの表示に切り替える（フェーズ4）→ `AccountDirectory` / `accountListCore` が `fields` でグルーピング。旧カテゴリー表示・`categoryList`/`Category`/`groupAccountsByCategory`・`categories.json` 生成・Notion時代の残骸（`fetchNotion.ts` 等）を削除済み
- [x] 分野バーにアイコンを追加する → `public/images/fields/{fieldId}.svg`（14分野分）を16pxで表示。分野ラベルに分類数（`classCount`）を追加し「N分類 M件」表記に。見出し色を`--color-primary-darker`に、アイコン⇄ラベルの余白を他項目より詰め、分類ヘッダーをアイコン半個分（13px）インデントして親子関係を表現
- [ ] エンゲージメント向上の UX / 使い勝手を練る → ゲーミフィケーションで「自分の好きな分野の移行促進」に興味を持ってもらう。UI を能動的に反復する前提。Storybook 等ワークベンチ導入の是非もここで判断。関連: 「ポイント制度」（設計・モデリング）
  - 🔴 要壁打ち: 大テーマ。別セッションで集中議論する
- [x] オンボーディング（分野選択フロー）→ `onboard/page.tsx` + `ModerationOnboarding` + `FieldChips` + `joinField`
- [x] 分野切り替え → `last_active_at` / 分野を追加メニュー / デフォルト分野リダイレクト
- [x] 既存アカウント更新の判別 → Review / Update の出し分け、旧 → 新ハンドル表示
- [x] 統合テストの整備 → 16件パス・冪等性確認済み。`cleanupAccount` が `requests` を消さず再実行で重複キー落ちしていたのを修正

---

## 運用・プロモーション的なこと

> 技術ではなく「どう人を集め、どう受け止め、どう回し続けるか」の課題。相互に絡んでいて、単独では解けない。

- [ ] ⚠️ 宣伝と受け入れ能力のジレンマを設計する → 宣伝は必要だが、今の体制で登録が一気に来ると捌けない。協力者確保が先か宣伝が先かのニワトリ卵問題。関連: 「段階制度」「後追いレビュー」
  - 🔴 要壁打ち: 戦略そのもの。宣伝の強度と受け入れ体制をどう噛み合わせるか要ブレスト
- [ ] 分野ごとの協力者を集める導線をつくる → 各分野を担うモデレーターがまだいない。まず「協力者が1人来たら実際に機能する」状態を整えるのが先。関連: オンボーディング
  - 🔴 要壁打ち: 募集チャネル・声かけ方・受け入れ設計が未定
- [ ] 宣伝の運用負荷を下げる → 毎回専用アカウントで告知するのがつらい
  - 🔴 要壁打ち: 省力化の打ち手（テンプレ化/自動化/他チャネル）が未定

---

## 運用メモ

- 表側は Supabase を直接見ず、`scripts/fetchAccountList.ts` が生成し GitHub `data` ブランチに置く JSON を配信している（`src/lib/fetchData.ts`）。DB 負荷は管理側に集中している。
