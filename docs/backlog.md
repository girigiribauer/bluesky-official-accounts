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
- 完了したタスクは末尾の「完了」セクションへ移動している。

---

## 技術的なこと

### パフォーマンス

- [ ] ダッシュボードの往復回数を減らす → 描画ごとに7クエリを並列発行（`(dashboard)/layout.tsx`）。同様に集約 or `rpc()`/ビューでまとめる
  - 🟡 要確認: 集約 SQL に寄せるかビューにするか、実データを見て判断

> spike 実測（ローカル・ネットワーク遅延ゼロ / median）: supabase-js 単発 2.0ms・pg 直結 0.34ms（接続方法 6倍差）／ supabase-js 7回逐次 13.2ms・pg 1往復 0.44ms（往復まとめ 5倍差）。本番は往復回数の影響がさらに支配的。

### 認証・セキュリティ

- [ ] ⚠️ RLS ポリシーを設計する → 全テーブル RLS 有効だがポリシー未設定で、サーバーはサービスロールで全バイパス中（`initial_schema.sql`）
  - 🔴 要壁打ち: 一般開放時に「誰が何を読めるか」の公開モデルが未定。ここを決めないと書けない
- [ ] セッション cookie に有効期限を持たせる → 今は HMAC 署名のみで失効しない（`src/lib/auth.ts`）
  - 🔴 要壁打ち: 有効期限・再発行の方針が未定

### テスト・検証

- [ ] ⚠️ ロールバック手順を明文化する（postmortem 再発防止）
  - 🟢 明確: 手順を書き起こすだけ
- [ ] E2E の CI 組み込み / デプロイ前チェック運用 → 今はローカル実行のみ。GitHub Actions で回すか、デプロイ前の手動チェックリストに組み込むか
  - 🟡 要確認: CI で Supabase をどう立てるか（`supabase start` は重い）と、実行タイミングの運用を決める
- [ ] actions の unit テストを脱・実装依存にする → `actions.test.ts` は Supabase チェーンを手作りモックし呼び出し手順を assert していて脆い。承認/却下は integration に寄せ、チェーンモックを減らす
  - 🟡 要確認（**DB 接続見直しの後に**）: 直結化でモック境界が変わり作り直しになるため、先にやると無駄
- [ ] 統合テストの分離をトランザクションロールバックにする → 今は `[テスト]%` 命名＋手動 delete 頼みで壊れやすい（cleanup 漏れで実際に事故った）
  - 🟡 要確認（**DB 接続見直しの後に**）: PostgREST/HTTP では test ごとにトランザクションを張れない。直結にして初めて実現可能

### 観測性

- [ ] ヘルスチェックにマイグレーションバージョンを含める（`migration`）→ `/api/health` は `{ ok, dbLatencyMs, checkedAt }` まで実装済み。適用済みバージョンを出すには `supabase_migrations.schema_migrations` が PostgREST 非公開のため、`public.latest_migration()`（SECURITY DEFINER）を migration で1本足して `rpc()` で引く必要がある
  - 🟡 要確認: DB 関数＋migration 追加まで踏み込むか。今のリージョンずれ検知目的は現状の実装で足りている
- [ ] ヘルス値をモデレーション画面ヘッダに小さく出す（「DB OK / N ms」）→ 「ダッシュボードから DB 接続が見えない」の解消。UI 作業
  - 🟢 明確: `/api/health` を叩いて表示するだけ

### リファクタ（品質）

- [ ] DB seed を分野マスターから生成する → コード側は `src/constants/fields.ts` の `FIELDS` に一元化済み。残るは `fields` テーブルの seed（SQL）を `FIELDS` から生成する仕組み（`categories.md` は人間向けドキュメントなので対象外）
  - 🔴 要壁打ち: SQL seed をコードから生成する codegen を migration フローにどう組み込むかが未定
- [ ] エラーの握りつぶしをやめる → `catch { ... "更新に失敗しました" }` が実エラーを捨てている。ログ有無も不統一
  - 🟡 要確認: 方向は明確だが、ログ方針（何をどこに出す/何を利用者に見せる）の共通ルールを軽く決めたい
- [ ] 型の二重管理を整理する → 生成型 `database.ts` と手書き `moderation.ts` が併存し `as unknown as` の強制キャストが要る（`(dashboard)/layout.tsx`）
  - 🔴 要壁打ち: 生成型とドメイン型をどう役割分担させるか、設計論の整理が要る

---

## 設計・モデリング的なこと

- [ ] 来て欲しい一覧の「未分類」中間階層をどうするか → 来て欲しい(requests)は分野のみで分類は常に null（＝未分類固定）。今は 分野→未分類→アカウント と中間階層が1個だけ挟まる。案A: 現状維持 / 案B: 来て欲しい一覧だけ分類階層を畳む（`buildAccountRows`/核の小改修）/ 案C: 来て欲しいもモデレーターが分類できるよう拡張。機能上は困らないため後回し（本人判断: 一旦このままで様子見）
  - 🟡 要確認: 実運用を始めて「未分類階層が邪魔」と感じるか見てから決める。デプロイとは独立
- [ ] モデレーター資格の停止を実装する → 半年無活動で自動失効／管理者による解任、の2ケース（設計は `moderation.md` で決着・未実装）
  - 🟡 要確認: 自動失効の実行の仕組み（cron 等）を決める
- [ ] 権限ロール（コントリビューター/メンテナー）を実装する → 今は `is_admin` フラグだけ。「管理者以外でも捌ける」体制の核（設計は `moderation.md` で決着）
  - 🟢 明確: 設計は確定（重い操作は提案→メンテナー承認、昇格＝承認を通じた観察で数値基準なし）。あとは実装。※旧「3段階（入門/一人前/熟練）」は廃案
- [ ] サイト内通知を実装する（未実装）
  - 🔴 要壁打ち: 何を・いつ・誰に通知するかが未定
- [ ] atproto / PDS 対応（フェーズ6・将来）→ 承認時に PDS へレコードを書き込む
  - 🔴 要壁打ち: レキシコン設計から。将来テーマ
- [ ] 複製・引き込みの設計 → 1アカウントは複数分野に属せる（複製）。別分野が「うちにも欲しい」をどう起こすか（pull の設計）が未決（`moderation.md` 整理時に保留）
  - 🔴 要壁打ち: 引き込みの起こし方・UI が未設計
- [ ] 無差別ブロック対策 → モデレーションリスト等で大量ブロックするアカウントの扱い。除外か警告かで揺れて未決着（`確認不能` ステータスは廃止済み）
  - 🔴 要壁打ち: 客観的な線引きと、警告するなら見せ方が未定
- [ ] 見回りタスクの具体的な中身 → 最小版（テキスト提案＋タイマー＋完了ボタン）は設計済み。実際にどんな提案を出すか（他分野からの引き込み／フォーム投稿促進 等）が未定（`moderation.md`）
  - 🟡 要確認: 中身は使いながら決める前提

---

## デザイン・UI的なこと

- [ ] `/moderation_beta` を `/moderation` へ昇格する → 本公開時の URL・導線整理
  - 🟢 明確: ルート移動とリダイレクト。やることは自明（本公開タイミング）
- [ ] ⚠️ ダッシュボードの投稿数を実データにする → 今は `postCount={0}` のハードコード（`(dashboard)/layout.tsx`）
  - 🟡 要確認: 「投稿数」が何を指すか（申請数? 分野別? 期間?）の定義を決める
- [ ] チームメンバーのアイコンを表示する → UI 表示が未対応
  - 🟡 要確認: `moderators.avatar` がログイン時に保存されているか現状確認が先
- [ ] エンゲージメント向上の UX / 使い勝手を練る → ゲーミフィケーションで「自分の好きな分野の移行促進」に興味を持ってもらう。UI を能動的に反復する前提。Storybook 等ワークベンチ導入の是非もここで判断。関連: 「見回りタスクの具体的な中身」（設計・モデリング。ポイント制度は当面見送りで、エンゲージメントは見回りが担う想定）
  - 🔴 要壁打ち: 大テーマ。別セッションで集中議論する

---

## 運用・プロモーション的なこと

> 技術ではなく「どう人を集め、どう受け止め、どう回し続けるか」の課題。相互に絡んでいて、単独では解けない。

- [ ] ⚠️ 宣伝と受け入れ能力のジレンマを設計する → 宣伝は必要だが、今の体制で登録が一気に来ると捌けない。協力者確保が先か宣伝が先かのニワトリ卵問題。関連: 「権限ロール（コントリビューター/メンテナー）」「分野ごとの協力者を集める導線」
  - 🔴 要壁打ち: 戦略そのもの。宣伝の強度と受け入れ体制をどう噛み合わせるか要ブレスト
- [ ] 分野ごとの協力者を集める導線をつくる → 各分野を担うモデレーターがまだいない。まず「協力者が1人来たら実際に機能する」状態を整えるのが先。関連: オンボーディング
  - 🔴 要壁打ち: 募集チャネル・声かけ方・受け入れ設計が未定
- [ ] 宣伝の運用負荷を下げる → 毎回専用アカウントで告知するのがつらい
  - 🔴 要壁打ち: 省力化の打ち手（テンプレ化/自動化/他チャネル）が未定

---

## 運用メモ

- 表側は Supabase を直接見ず、`scripts/fetchAccountList.ts` が生成し GitHub `data` ブランチに置く JSON を配信している（`src/lib/fetchData.ts`）。DB 負荷は管理側に集中している。

---

## 完了

### パフォーマンス

- [x] ⚠️ Vercel Functions の region を東京（hnd1）に揃える → 遅さの主犯だった（関数が iad1=米国東海岸、DB は東京で全クエリが太平洋往復）。`vercel.json` に `"regions": ["hnd1"]` を追加しデプロイ済み。検証: `x-vercel-id` が `hnd1::hnd1` に、DB を叩く公開 API が warm 150〜185ms（推定 従来比約3倍速、逐次往復の多い承認処理はさらに大きく改善見込み）
- [x] ⚠️ 承認処理をトランザクション化する（原子性の確保）→ `approve_entry_submission` / `approve_request_submission` の plpgsql 関数（`migrations/20260706000000_...`）に一連の書き込みを閉じ込め、`actions.ts` から `supabase.rpc()` で呼ぶ。関数内は1トランザクション＝途中失敗で全ロールバック。承認のユニットは配線テストに置換。**統合テスト17件パス＋原子性テスト（UNIQUE 違反で途中失敗させ account が残らないことを確認）で実証済み**。postmortem 型の中途半端 state を構造的に解消
- [x] pg 直結 + `attachDatabasePool` は**やらない**（判断確定・再検討条件付き）→ 遅さの主犯はリージョンずれで解決済み。残る旨味は1クエリ1〜2ms のみで、移行費用（40箇所書き換え＋型＋テスト書き直し）と Supavisor×Fluid の接続増加という既知問題に見合わない。「毎回 createClient」も遅さと無関係だった（実測）
  - 再検討条件: ①rpc() 化後も本番計測で DB 待ちが支配的 ②表側が DB 直読みに変わりトラフィック激増 ③DX 目的で Drizzle 等を導入する時（その場合 attachDatabasePool は1行のおまけ）

### 観測性

- [x] ヘルスチェック `/api/health` を作る → `{ ok, dbLatencyMs, checkedAt }` を返す（`src/app/(public)/api/health/route.ts`）。`fields` テーブルへ head count クエリを1発投げて DB 往復レイテンシを実測、`dynamic = "force-dynamic"` でキャッシュ無効（毎回フレッシュに観測）、失敗時は `{ ok:false }` ＋ 503。**実機で 200・`dbLatencyMs` が呼ぶたび実測変動・`checkedAt` 更新を確認済み**。`migration` 併記とヘッダ表示は別項目に分離（観測性の未着手へ）

### テスト・検証

- [x] ⚠️ マイグレーションをデプロイに畳んで順序を構造で担保 → Vercel の `buildCommand` を `scripts/vercel-build.sh` に。production 時のみ `supabase db push --db-url --yes`（env `SUPABASE_DB_URL`=session pooler URI）してから `next build`、migrate 失敗＝デプロイ失敗。postmortem の「migrate はデプロイより先に」を運用ルールでなく構造で保証。**本番デプロイのビルドログで接続・順序を実証済み**（`Connecting to remote database... / Remote database is up to date.`）
- [x] `.github/workflows/migrate.yml` を削除する → デプロイに畳んだため役目終了（`7c0cd0d`で削除済み。現存するのは`update-data.yml`のみ）
- [x] Node を 22 に上げる → `package.json` に `engines.node: "22.x"` を追加済み。**Vercel プロジェクト設定（Build and Deployment → Node.js Version）も `22.x` を確認済み**。両側揃ったので次デプロイ以降はビルド・Serverless Functions とも Node 22 で動く。任意の付帯（`@types/node` を `^22` に上げる）は未対応だが実害なし
- [x] ⚠️ ブラウザ E2E（Playwright）を薄く1枚入れる → `tests/e2e/` に4本（登録フォーム投稿・来て欲しいフォーム投稿・重複投稿の表示・モデレーター承認）。`npm run test:e2e`（要: ローカル DB 起動。dev サーバーは自動起動）。OAuth は署名 cookie 直付けで迂回、Bluesky アカウント解決は `page.route()` で内部 API をスタブ。方針: 正常系＋ユーザーが日常的に踏むエラー表示のみ。これ以上増やさない（増やしたくなったら下の層へ）
- [x] 重複チェック表示のバグ修正 → `RequestForm` が `duplicate === true`（boolean）と比較していたが、check API の実際の返却は `"none"|"entry"|"request"`（文字列）で、**重複メッセージが一度も表示されていなかった**。E2E 追加時に発覚。route テストのモックも実契約（文字列）に修正（233件パス）
- [x] 「分類（旧）」撤去に伴うE2E破損の修正 → `tests/e2e/contribution.spec.ts` が削除済みの「分類（旧）」`<select>`を`getByRole("combobox")`で探しに行き3件タイムアウトしていた（**リリース前にE2Eで検知**）。該当の`selectOption`呼び出しを削除。あわせて`RegisterForm`の`selectedCategories`→`selectedFields`にリネーム、`moderationFlow.integration.test.ts`の`oldCategory`残置も削除、FAQページ（`/faq#categorize`）の「分類（旧）」言及・「3つまで選択可」という誤った案内を実態に合わせて修正
- [x] カバレッジ計測は一度導入→撤去 → `@vitest/coverage-v8` で盲点マップを取得（全体約35%、`lib`約80%、UI 0%）。UIの守りは E2E と決めたためグローバル%を追う意味が薄く、設定・依存ごと撤去

### データ・移行運用

- [x] fetch スクリプトを新分野ベースに更新する → `scripts/fetchAccountList.ts` から `old_category` の select・`Account.category` フィールド・カテゴリーソートキーを削除（ソートは名前のみに変更）。`Account`型からも`category`を削除（`src/models/Account.ts`）
- [x] 公開フォームの「分類（旧）」入力を廃止する → `FieldSelector`/`OLD_CATEGORIES`/`registerContribution`・`requestContribution`スキーマ・各route・`useBlueskyCheck`から`oldCategory`/`old_category`関連を削除。`RegisterForm`/`RequestForm`から「分類（旧）」欄が消えたことを目視確認済み
- [x] `old_category` カラム・`old_categories` テーブルを廃止する → migration `20260713000000_drop_old_category.sql` を用意（`approve_entry_submission`関数の`old_category`参照を除去してからカラム・テーブルをdrop）。`types/database.ts`（DB生成型を手動追従）・`types/moderation.ts`・`actions.test.ts`から参照を削除。コード側の`old_category`/`old_categor`参照はゼロ。実DBへの適用はデプロイ時の自動migrate（`scripts/vercel-build.sh`）に委ねた。**本番DB（Supabase Table Editor）で`old_categories`テーブルが消えていることを確認済み＝migration適用成功**（drop tableが最終行のため、手前のカラムdrop 3本も通っている）

### リファクタ（品質）

- [x] `actions.ts` のボイラープレートを削減 → `updateSubmission*` 6関数を `updateEntrySubmissionFields` に集約（約110行 → 約55行、tsc / ユニット32件パス）
- [x] 命名衝突を解消 → `ModerationDashboard` 内インライン `FieldSelector` を `FieldSwitcher` にリネーム（フォームの `FieldSelector` との混同を解消）
- [x] ローカル型の重複を解消 → `ModerationOnboarding` の `Result` を `types/result.ts` に統一
- [x] 分野定義の一元化（コード側）→ `FIELD_ID_LABELS` / `FIELD_DETAILS` を `fields.ts` の `FIELDS` 単一ソースから導出。import 6ファイルを整理、tsc / 232件パス（DB seed 生成は別項目）
- [x] デッドコード除去 → `betaAllowList.ts`＋テスト（`isAllowedBetaUser` はテスト以外から未参照。実ログインゲートは OAuth callback の `moderators` DID チェック）、孤児化していた `notionClient.ts`（`getNotionClient` はどこからも import されず／news・一覧とも Supabase 由来）を削除。未使用依存 `react-virtuoso`（表側は tanstack/virtual-core へ移行済み）・`@notionhq/client`（`notionClient.ts` からのみ使用）を `package.json` から撤去。`.env.local.example` の死んだ `BETA_ALLOWED_DIDS` 行も除去。tsc クリーン・参照残りゼロ

### 設計・モデリング

- [x] 旧カテゴリーから新分野への割り当て → 割り当てルールは `categories.md` に定義・適用済み。「未分類」は分野モデレーター確保後に順次拾う正規の置き場（設計課題ではなく運用課題。関連: 「分野ごとの協力者を集める導線をつくる」）
- [x] 後追いレビューの仕組みをモデル化する → **廃案**。レジリエンス（全操作ログ＋ロールバック）＋提案/承認ゲートで担保する方針にしたため、事前監視型の追認レビューは不要と決定（`moderation.md`）
- [x] 異議申し立て機能を実装する → **不要と決定**。分野ごとの編集可能なダッシュボード（メンテナー直接編集／コントリビューター提案→承認）に吸収され、専用の異議フローは要らない（`moderation.md`）
- [x] ポイント制度を実装する → **当面見送り**。体制の再設計で切り離し、`moderation.md` から削除。エンゲージメントは当面「見回り」タスク側でまかなう（関連: エンゲージメント向上 UX）

### デザイン・UI

- [x] 表側（公開ページ）を新分野・分類ベースの表示に切り替える（フェーズ4）→ `AccountDirectory` / `accountListCore` が `fields` でグルーピング。旧カテゴリー表示・`categoryList`/`Category`/`groupAccountsByCategory`・`categories.json` 生成・Notion時代の残骸（`fetchNotion.ts` 等）を削除済み
- [x] 分野バーにアイコンを追加する → `public/images/fields/{fieldId}.svg`（14分野分）を16pxで表示。分野ラベルに分類数（`classCount`）を追加し「N分類 M件」表記に。見出し色を`--color-primary-darker`に、アイコン⇄ラベルの余白を他項目より詰め、分類ヘッダーをアイコン半個分（13px）インデントして親子関係を表現
- [x] モバイルでアカウント行が折り返さず高さ固定になっていたのを修正 → 表側の脱React化（`accountListCore`）で行高が32px固定になり、スマホで X/Bluesky が見切れていた。TanStack virtual-core の `measureElement` を実際に配線（実測キャッシュキーを index → `rowKey` に変更、`render` を実測対応＝毎回 transform 更新＋再入ガードに書き換え）で可変高さ化。マークアップを main（名称・ステータス・根拠）/ socials（X・Bluesky）の2グループに包み、デスクトップは `display:contents` で従来の5列1行を完全維持、モバイル（<800px）のみ2段組: 1行目=名称（伸縮・省略）＋ステータス＋根拠、2行目=X（左半分）とBluesky（右半分）を1:1・各省略。実機確認: モバイルで2行・実測53px、長いハンドルは `text-overflow: ellipsis` で省略（例 `@asahi-commentplus.bsky.social`）、2段 sticky 見出しも追従。デスクトップは32px単一行のまま（`display:contents`＋ResizeObserver 再計測）。※根拠の名称リンク統合案は要検討で保留
  - [x] 派生バグ: リンクの背景・下線 → 脱React移植で `.alc-social a` が `background`未指定（globals の `a{background:...}` 青背景が透ける）＋`text-decoration:none`（下線消失）になっていた。旧 `.socialMedia a` に合わせ `background:none`＋下線継承に修正
  - [x] 派生バグ: モバイルで開閉時に無駄スクロール → `estimateSize` がアカウント行を常に32px想定だったが、モバイルの実高は57px。未実測行を跨ぐ位置で推定と実測がズレ、実測補正のたびにスクロールが飛んでいた（PCは32=32でズレず無症状）。推定をビューポート幅で切替（`<=799px` は57px）にして解消。実機確認: 全展開の総高さが 105556px→185556px（≈58px/行＝実測57pxと一致）、浅い開閉の offset保持は維持、PCは32pxのまま回帰なし
- [x] オンボーディング（分野選択フロー）→ `onboard/page.tsx` + `ModerationOnboarding` + `FieldChips` + `joinField`
- [x] 分野切り替え → `last_active_at` / 分野を追加メニュー / デフォルト分野リダイレクト
- [x] 既存アカウント更新の判別 → Review / Update の出し分け、旧 → 新ハンドル表示
- [x] 統合テストの整備 → 16件パス・冪等性確認済み。`cleanupAccount` が `requests` を消さず再実行で重複キー落ちしていたのを修正
