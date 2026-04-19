"use client";

import Link from "next/link";
import { GlobalHeader } from "src/components/GlobalHeader";
import { ModalProvider } from "src/components/ModalProvider";
import { ModalContents } from "src/components/ModalContents";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ModalProvider>
      <header className="header">
        <GlobalHeader />
      </header>
      <div className="mainContent">
        <div
          className="page-hero-image"
          style={{ background: "linear-gradient(160deg, var(--color-primary-lighter), var(--color-secondary-lighter))" }}
        />
        <div className="page-content">
          <section className="page-section">
            <h1>エラーが発生しました</h1>
            <p>
              ページの読み込み中にエラーが発生しました。時間をおいて再度お試しください。
            </p>
            <div>
              <button onClick={reset}>再読み込み</button>
              <Link href="/">トップへ戻る</Link>
            </div>
          </section>
        </div>
      </div>
      <ModalContents />
    </ModalProvider>
  );
}