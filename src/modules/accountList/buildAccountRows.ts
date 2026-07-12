// 新分野・分類のグルーピングと行の平坦化（フレームワーク非依存・純粋関数）。
// 表側・裏側どちらの核からも使えるよう、React 等に一切依存しない。
import type { Account } from "src/models/Account";
import { FIELDS } from "src/constants/fields";

// 分類未定（classification_id=null）の内部キー。表示は「未分類」。
export const NO_CLASS = "__none__";
// 未分野（fields が空。現データでは 0 件だが防御的に扱う）。分野末尾に置く。
export const NO_FIELD = "__nofield__";

export type ListRow =
  | { kind: "field"; rowKey: string; fieldId: string; label: string; classCount: number; total: number }
  | { kind: "class"; rowKey: string; fieldId: string; classKey: string; name: string; total: number }
  | { kind: "account"; rowKey: string; fieldId: string; account: Account };

export type ClassBucket = {
  classKey: string; // フィールド内でユニーク（classificationId or NO_CLASS）
  classId: string | null;
  name: string;
  accounts: Account[];
};

export type FieldBucket = {
  fieldId: string;
  label: string;
  total: number;
  orderedClasses: ClassBucket[];
};

export type Grouped = { fields: FieldBucket[] };

const FIELD_SORT = new Map<string, number>(FIELDS.map((f) => [f.id, f.sortOrder]));
const FIELD_LABEL = new Map<string, string>(FIELDS.map((f) => [f.id, f.label]));

// 1アカウントが複数分野に属せる（account_fields は field ごとにユニーク）。
// その分野それぞれの下に出す。分類未定は各分野の「未分類」バケツへ。
export function groupAccounts(accounts: Account[]): Grouped {
  const fieldMap = new Map<string, FieldBucket & { classMap: Map<string, ClassBucket> }>();

  const ensureField = (fieldId: string, label: string) => {
    let fb = fieldMap.get(fieldId);
    if (!fb) {
      fb = { fieldId, label, total: 0, orderedClasses: [], classMap: new Map() };
      fieldMap.set(fieldId, fb);
    }
    return fb;
  };

  const pushAccount = (fieldId: string, label: string, classId: string | null, className: string, acc: Account) => {
    const fb = ensureField(fieldId, label);
    const classKey = classId ?? NO_CLASS;
    let cb = fb.classMap.get(classKey);
    if (!cb) {
      cb = { classKey, classId, name: className, accounts: [] };
      fb.classMap.set(classKey, cb);
    }
    cb.accounts.push(acc);
    fb.total++;
  };

  for (const acc of accounts) {
    const fields = acc.fields ?? [];
    if (fields.length === 0) {
      pushAccount(NO_FIELD, "未分野", null, "未分類", acc);
      continue;
    }
    for (const f of fields) {
      const label = f.fieldLabel || FIELD_LABEL.get(f.fieldId) || f.fieldId;
      pushAccount(f.fieldId, label, f.classificationId, f.classificationName ?? "未分類", acc);
    }
  }

  // 分野の並び: fields.ts の sortOrder。未知の分野は既知の後ろ、未分野は最後。
  const fieldRank = (fieldId: string) => {
    if (fieldId === NO_FIELD) return Number.MAX_SAFE_INTEGER;
    return FIELD_SORT.get(fieldId) ?? Number.MAX_SAFE_INTEGER - 1;
  };

  const fields: FieldBucket[] = [...fieldMap.values()]
    .sort((a, b) => fieldRank(a.fieldId) - fieldRank(b.fieldId))
    .map((fb) => {
      // 分類の並び: 件数降順。ただし「未分類」は件数に関わらず末尾。
      const orderedClasses = [...fb.classMap.values()].sort((a, b) => {
        const aNone = a.classId === null;
        const bNone = b.classId === null;
        if (aNone !== bNone) return aNone ? 1 : -1;
        if (b.accounts.length !== a.accounts.length) return b.accounts.length - a.accounts.length;
        return a.name.localeCompare(b.name, "ja");
      });
      return { fieldId: fb.fieldId, label: fb.label, total: fb.total, orderedClasses };
    });

  return { fields };
}

// 開閉状態を反映して2階層を1次元の行に潰す。畳まれた枝は含めない。
export function buildRows(
  grouped: Grouped,
  fieldOpen: Set<string>,
  classOpen: Set<string>
): ListRow[] {
  const rows: ListRow[] = [];
  for (const fb of grouped.fields) {
    rows.push({ kind: "field", rowKey: `f:${fb.fieldId}`, fieldId: fb.fieldId, label: fb.label, classCount: fb.orderedClasses.length, total: fb.total });
    if (!fieldOpen.has(fb.fieldId)) continue;
    for (const cb of fb.orderedClasses) {
      const gKey = `${fb.fieldId}::${cb.classKey}`;
      rows.push({ kind: "class", rowKey: `c:${gKey}`, fieldId: fb.fieldId, classKey: gKey, name: cb.name, total: cb.accounts.length });
      if (!classOpen.has(gKey)) continue;
      for (const acc of cb.accounts) {
        rows.push({ kind: "account", rowKey: `a:${gKey}:${acc.id}`, fieldId: fb.fieldId, account: acc });
      }
    }
  }
  return rows;
}

// openAll 用: 全分野キーと全分類グローバルキー。
export function allKeys(grouped: Grouped): { fields: string[]; classes: string[] } {
  const fields: string[] = [];
  const classes: string[] = [];
  for (const fb of grouped.fields) {
    fields.push(fb.fieldId);
    for (const cb of fb.orderedClasses) classes.push(`${fb.fieldId}::${cb.classKey}`);
  }
  return { fields, classes };
}
