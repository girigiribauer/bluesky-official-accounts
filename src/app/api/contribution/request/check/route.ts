import { NextRequest, NextResponse } from "next/server";
import { checkDuplicate } from "../_checkDuplicate";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url || typeof url !== "string" || !url.trim()) {
    return NextResponse.json({ ok: false, message: "入力値が不正です" }, { status: 400 });
  }

  try {
    const duplicate = await checkDuplicate(url);
    return NextResponse.json({ duplicate });
  } catch (err) {
    console.error("Notion query error:", err);
    return NextResponse.json(
      { ok: false, message: "確認に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 }
    );
  }
}
