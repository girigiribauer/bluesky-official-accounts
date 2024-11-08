import { fetchDuplicateAccounts } from "src/lib/fetchNotion";

export const dynamic = "force-static";

export async function GET() {
  const resultString = await fetchDuplicateAccounts();

  return Response.json({ result: resultString });
}
