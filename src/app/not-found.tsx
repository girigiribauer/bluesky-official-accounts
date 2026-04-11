import Link from "next/link";
import { GlobalHeaderServer as GlobalHeader } from "src/components/GlobalHeaderServer";
import { HeroImage } from "src/components/HeroImage";

export default function NotFound() {
  return (
    <>
      <header className="header">
        <GlobalHeader />
      </header>
      <div className="mainContent">
        <HeroImage id="notfound" />
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