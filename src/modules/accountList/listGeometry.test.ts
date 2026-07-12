import { describe, it, expect } from "vitest";
import { anchorTarget, activeHeaders, fieldShift, classShift } from "./listGeometry";

describe("anchorTarget", () => {
  const FIELD_H = 27;

  it("画面外(上)にピン留め中の分類を閉じたら、分野バーのすぐ下(=stickyOffset)に置く", () => {
    // before<0 = 見出しは上端より上。startAfter=189、分類なので stickyOffset=27。
    // → 189 - 27 = 162（off 27 に見える）。※これが「27pxめり込み」回帰の防波堤
    expect(anchorTarget(-400, 189, FIELD_H)).toBe(162);
  });

  it("見出しが画面内に見えている分類は、その位置を維持する", () => {
    // before=100（画面内 off100）→ startAfter-100。stickyOffset(27)より下なので維持。
    expect(anchorTarget(100, 189, FIELD_H)).toBe(89);
  });

  it("分野は上位バーが無いので絶対先頭(0)へ", () => {
    expect(anchorTarget(-400, 189, 0)).toBe(189 - Math.max(-400, 0)); // 189
  });

  it("スクロール範囲を割らない(0未満にならない)", () => {
    expect(anchorTarget(1000, 27, 27)).toBe(0);
  });
});

describe("activeHeaders", () => {
  const FIELD_H = 27;
  // 分野0(row0)＋その分類4つ(row1-4)＋分野2(row5) が開いている想定
  const measurements = [
    { start: 0 }, // row0 field
    { start: 27 }, // row1 class
    { start: 54 }, // row2 class
    { start: 81 }, // row3 class
    { start: 108 }, // row4 class
    { start: 135 }, // row5 field
  ];
  const fieldHeaderIdx = [0, 5];
  const classHeaderIdx = [1, 2, 3, 4];

  it("先頭(off 0): 分野0と最初の分類が現在", () => {
    const r = activeHeaders(measurements, 0, fieldHeaderIdx, classHeaderIdx, FIELD_H);
    expect(r).toEqual({ fi: 0, ci: 1, nextFi: 5, nextCi: 2 });
  });

  it("2つ目の分類の中に潜ると ci がその分類になる", () => {
    const r = activeHeaders(measurements, 40, fieldHeaderIdx, classHeaderIdx, FIELD_H);
    expect(r.fi).toBe(0);
    expect(r.ci).toBe(2);
    expect(r.nextCi).toBe(3);
  });

  it("次の分野に入ると fi が切り替わり、その分野に開いた分類が無ければ ci=-1", () => {
    const r = activeHeaders(measurements, 135, fieldHeaderIdx, classHeaderIdx, FIELD_H);
    expect(r.fi).toBe(5);
    expect(r.ci).toBe(-1);
    expect(r.nextFi).toBeUndefined();
    expect(r.nextCi).toBeUndefined();
  });
});

describe("fieldShift", () => {
  const FIELD_H = 27;
  it("次の分野が遠ければ押し出しなし", () => {
    expect(fieldShift(135, 100, FIELD_H)).toBe(0); // y=35 > 27
  });
  it("次の分野が上端ゾーンに迫ると押し出す", () => {
    expect(fieldShift(135, 120, FIELD_H)).toBe(12); // y=15 → 27-15
  });
  it("次の分野が無ければ0", () => {
    expect(fieldShift(undefined, 120, FIELD_H)).toBe(0);
  });
});

describe("classShift", () => {
  const FIELD_H = 27;
  const CLASS_H = 27;
  it("次の分類が迫ると分野バーの裏へスライド（部分）", () => {
    // nextCiStart=54, off=20 → y=34 < 54 → min(27, 54-34)=20
    expect(classShift(54, undefined, 20, FIELD_H, CLASS_H)).toBe(20);
  });
  it("何も迫っていなければ0", () => {
    expect(classShift(300, 300, 0, FIELD_H, CLASS_H)).toBe(0);
  });
  it("次の分野が迫るときは分類ごと退避（より大きい方を採用）", () => {
    // nextFiStart=30, off=0 → y=30 < 54 → min(54, 54-30)=24。nextCi無し。
    expect(classShift(undefined, 30, 0, FIELD_H, CLASS_H)).toBe(24);
  });
});
