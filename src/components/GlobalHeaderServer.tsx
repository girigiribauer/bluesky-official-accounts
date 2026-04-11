import { getCurrentModerator } from "src/lib/auth";
import { GlobalHeader } from "./GlobalHeader";

export async function GlobalHeaderServer() {
  const moderator = await getCurrentModerator();
  return <GlobalHeader moderator={moderator} />;
}
