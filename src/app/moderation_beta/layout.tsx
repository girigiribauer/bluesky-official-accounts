import { GlobalFooter } from "src/components/GlobalFooter";
import { GlobalHeaderServer } from "src/components/GlobalHeaderServer";
import { ModerationLogin } from "src/components/ModerationLogin";
import { getCurrentModerator } from "src/lib/auth";

export default async function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const moderator = await getCurrentModerator();

  if (!moderator) {
    return (
      <div className="moderationMain">
        <header className="header">
          <GlobalHeaderServer />
        </header>
        <div className="mainContent">
          <ModerationLogin />
        </div>
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className="moderationMain">
      <header className="header">
        <GlobalHeaderServer />
      </header>
      {children}
      <GlobalFooter />
    </div>
  );
}
