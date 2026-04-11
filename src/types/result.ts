// ok: true のときは T のプロパティが展開される
// ok: false のときは error が必ず存在する
export type Result<T extends Record<string, unknown> = Record<never, never>> =
  | ({ ok: true } & T)
  | { ok: false; error: string };
