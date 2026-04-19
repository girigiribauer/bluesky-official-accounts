export function isAllowedBetaUser(did: string): boolean {
  const raw = process.env.BETA_ALLOWED_DIDS ?? "";
  if (!raw.trim()) return false;
  const allowed = raw.split(",").map((d) => d.trim());
  return allowed.includes(did);
}
