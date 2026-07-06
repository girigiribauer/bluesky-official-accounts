#!/usr/bin/env bash
# Vercel のビルドコマンド。
# 本番デプロイ時のみ、マイグレーションを先に適用してから next build する。
#
# - production 以外（プレビュー等）では本番DBに一切触らない
# - マイグレーション失敗時は set -e でビルドごと落とし、デプロイを止める
#   （＝「migrate だけコケてコードは本番反映」を構造的に防ぐ）
# - 接続は SUPABASE_DB_URL 1本（Vercel の環境変数・Production スコープに設定）
#   ※ マイグレーション用途なので direct connection / session pooler(5432) の URI を使う
#     （transaction pooler(6543) は DDL に向かない）
set -euo pipefail

if [ "${VERCEL_ENV:-}" = "production" ]; then
  echo "▶ production: applying migrations before build"
  npx supabase db push --db-url "$SUPABASE_DB_URL" --yes
else
  echo "▶ ${VERCEL_ENV:-unknown}: skip migrations (non-production)"
fi

npx next build
