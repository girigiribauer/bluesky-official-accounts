import Link from "next/link";
import { GlobalHeader } from "src/components/GlobalHeader";

export default function NotFound() {
  return (
    <>
      <header className="header">
        <GlobalHeader />
      </header>
      <div>
        <div
          className="page-hero-image"
          style={{ background: "linear-gradient(160deg, var(--color-primary-lighter), var(--color-secondary-lighter))" }}
        />
        <div className="page-content">
          <section className="page-section">
            <h1>ページが見つかりません</h1>
            <p>
              お探しのページは存在しないか、移動した可能性があります。
            </p>
            <Link href="/">トップへ戻る</Link>
          </section>
        </div>
      </div>
    </>
  );
}