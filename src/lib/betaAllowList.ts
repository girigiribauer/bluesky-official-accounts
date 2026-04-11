export function isAllowedBetaUser(did: string): boolean {
  const allowedDids = (process.env.BETA_ALLOWED_DIDS ?? "")
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
  return allowedDids.includes(did);
}
