import { TransitionStatus } from "./TransitionStatus";

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
};