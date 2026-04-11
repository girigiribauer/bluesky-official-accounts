import { GlobalFooter } from "src/components/GlobalFooter";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="main">
      <div className="mainContent">{children}</div>
      <GlobalFooter />
    </div>
  );
}
