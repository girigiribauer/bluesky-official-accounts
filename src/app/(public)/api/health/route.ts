import { NextResponse } from "next/server";
import { getSupabaseClient } from "src/lib/supabaseClient";

// ヘルスチェックは常に最新の状態を返す（キャッシュされると観測の意味がなくなる）
export const dynamic = "force-dynamic";

export async function GET() {
  const checkedAt = new Date().toISOString();

  try {
    const supabase = getSupabaseClient();
    // DB へ軽いクエリを1発投げて往復レイテンシを実測する
    const start = performance.now();
    const { error } = await supabase
      .from("fields")
      .select("id", { count: "exact", head: true });
    const dbLatencyMs = Math.round(performance.now() - start);

    if (error) throw error;

    return NextResponse.json({ ok: true, dbLatencyMs, checkedAt });
  } catch (err) {
    console.error("Health check error:", err);
    return NextResponse.json(
      { ok: false, message: "DB 接続の確認に失敗しました", checkedAt },
      { status: 503 }
    );
  }
}
