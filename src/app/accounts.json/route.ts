import { NextResponse } from "next/server";
import { fetchAccounts } from "src/lib/fetchNotion";

export const dynamic = "force-static";

export const GET = async () => {
  return NextResponse.json(await fetchAccounts());
};
