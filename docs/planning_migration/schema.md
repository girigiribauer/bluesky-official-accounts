# スキーマ設計案（MVP）

## 方針

- 分野ID (`field_id`) はコードで静的管理（テーブルは作らない）
- 旧分類 (`old_category`) は持たない。Notionからの移行時にcategories.mdのマッピングで新分野に変換し、変換できないものは未分類とする
- 匿名投稿の可否は未決定
- 来て欲しいアカウント (`requests`) と登録済みアカウント (`entries`) は別テーブルで管理。Blueskyアカウントが登録されたとき、`requests.entry_id` を紐付けることで継続性を保つ
- `twitter_handle` を `requests` の一意なIDとして扱う（同一ハンドルは重複登録不可）

---

## テーブル

### `moderators`

Blueskyアカウントでログインした協力者。

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | プライマリーキー |
| did | text | Bluesky DID、ユニーク。ハンドル変更後も同一性を保つ基準 |
| handle | text | 表示用。変更されうる |
| display_name | text | 表示用 |
| avatar | text | アバター画像URL。Bluesky APIから取得 |
| is_admin | boolean | 管理者フラグ |
| created_at | timestamptz | |
| last_active_at | timestamptz | 非活動判定用 |

### `field_memberships`

モデレーターがどの分野に参加しているか。

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | プライマリーキー |
| moderator_id | uuid | 外部キー → moderators |
| field_id | text | 分野識別子（静的管理） |
| joined_at | timestamptz | |

※ `moderators.is_admin` が true の場合、全分野を管理対象として扱う。

### `classifications`

分野内の分類。熟練モデレーターのみ追加・変更・削除可能。削除は論理削除とし、参照整合性を保つ。削除の経緯はactivitiesで追える。

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | プライマリーキー |
| field_id | text | 所属分野 |
| name | text | 分類名 |
| created_at | timestamptz | |
| deleted_at | timestamptz | 論理削除。null = 有効 |

### `requests`

来て欲しいアカウント。X(Twitter) の情報のみ持つ。`entry_id` が埋まったら登録済みになったことを示す。

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | プライマリーキー |
| twitter_handle | text | ユニーク |
| display_name | text | アカウント名 |
| submitted_by | uuid | 外部キー → moderators（null = 匿名） |
| entry_id | uuid | 外部キー → entries（null = まだ来ていない） |
| created_at | timestamptz | |

### `entries`

登録済みアカウント。Bluesky 情報は必須、X(Twitter) 情報はあれば持つ。

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | プライマリーキー |
| bluesky_did | text | ユニーク |
| bluesky_handle | text | 表示用。変更されうる |
| twitter_handle | text | null = X アカウントを持たない |
| display_name | text | 表示用。自動取得後に手動修正される場合があるため明示的に保持 |
| transition_status | text | 下記 enum 参照 |
| status | text | `pending` / `published` / `rejected` |
| submitted_by | uuid | 外部キー → moderators（null = 匿名） |
| created_at | timestamptz | |
| updated_at | timestamptz | |

#### transition_status の値

| 値 | 説明 |
|---|---|
| `not_migrated` | X あり・Bluesky 未作成 |
| `account_created` | X あり・Bluesky 作成済みだが X も継続運用中 |
| `dual_active` | X・Bluesky 両方を積極的に運用中 |
| `migrated` | X を辞めて Bluesky に完全移行。または最初から Bluesky のみで運用（後述）|
| `unverifiable` | 確認不能 |

`migrated` は現状「X から移行」と「最初から Bluesky のみ」を同じ値で管理しているが、後者が増えてきた場合は `bluesky_only` などの新規値追加を検討する。

### `entry_fields`

エントリーと分野・分類の紐付け。将来的な複数分野対応のため中間テーブルで管理。MVPでは1エントリー1分野。複数分野対応時には分野ごとにステータス管理が必要になるため、そのタイミングで`entries.status`をこのテーブルに移すことを検討する。

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | プライマリーキー |
| entry_id | uuid | 外部キー → entries |
| field_id | text | 分野識別子 |
| classification_id | uuid | 外部キー → classifications（null = 未分類） |

### `evidences`

根拠の記録。複数人が時系列で追記していく。

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | プライマリーキー |
| entry_id | uuid | 外部キー → entries |
| moderator_id | uuid | 外部キー → moderators（null = 匿名） |
| content | text | |
| created_at | timestamptz | |

### `activities`

全操作の記録。誰が何をしたかを追跡し、問題のある操作の精査・修正判断に使う。
`payload` に操作の内容をすべてJSONバイナリ（jsonb）で持つ。操作の種類によって構造が異なる。

| カラム | 型 | 備考 |
|---|---|---|
| id | uuid | プライマリーキー |
| entry_id | uuid | 外部キー → entries |
| moderator_id | uuid | 外部キー → moderators |
| action | text | `approve` / `reject` / `edit` |
| payload | jsonb | 操作内容。構造は下記参照 |
| created_at | timestamptz | |

#### payload の構造

| action | 構造 | 備考 |
|---|---|---|
| `approve` | `{}` | 承認のため差分なし |
| `reject` | `{}` | |
| `edit` | `{"display_name": {"before": "旧", "after": "新"}}` | 変更したフィールドのみ含む |

---

## 未決定事項

- 匿名投稿を許容するか（`submitted_by` が null のケース）

## 注意事項

- 来て欲しいフォームで、すでにBlueskyアカウントが存在するアカウントを弾けていない可能性がある。自前DBへの移行時に対応が必要