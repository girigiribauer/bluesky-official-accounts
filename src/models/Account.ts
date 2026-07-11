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
  category: string;
  status: TransitionStatus;
  twitter: string;
  bluesky: string;
  source: string;
  createdTime: string;
  updatedTime: string;
  // 新分類。旧 category と並存させ、表側の切り替えが済むまで両方保持する。
  fields?: AccountField[];
};