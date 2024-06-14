"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>読み込みに失敗しました。時間をおいてアクセスしてください。</h2>
      <button onClick={() => reset()}>再読み込み</button>
    </div>
  );
}
