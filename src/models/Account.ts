import { TransitionStatus } from "./TransitionStatus";

// 新分類（分野→分類）の割り当て。1アカウントが複数分野に属せる。
// classification が未定のケースは classificationId/Name が null になる。
export type AccountField = {
  fieldId: string;
  fieldLabel: string;
  classificationId: string | null;
  classificationName: string | null;
};

export type Account = {
  id: string;
  name: string;
  status: TransitionStatus;
  twitter: string;
  bluesky: string;
  // Bluesky の安定識別子（DID）。ハンドルは改名されるため、復元・名寄せの基準はこちら。
  // requests（来て欲しい＝未登録）は DID を持たないので空文字。
  blueskyDid: string;
  source: string;
  createdTime: string;
  updatedTime: string;
  fields?: AccountField[];
};