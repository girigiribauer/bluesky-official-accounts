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
  source: string;
  createdTime: string;
  updatedTime: string;
  fields?: AccountField[];
};