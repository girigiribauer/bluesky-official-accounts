import { NextRequest } from "next/server";

/**
 * Origin ヘッダーがリクエスト先ホストと一致するか検証する。
 * ブラウザはクロスオリジンPOSTに必ず Origin を付与するため、
 * 不一致の場合は別オリジンからの CSRF リクエストとみなす。
 * Origin ヘッダーがない場合（curl等）は通過させる。
 */
export const checkOrigin = (req: NextRequest): boolean => {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  const host = req.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};
