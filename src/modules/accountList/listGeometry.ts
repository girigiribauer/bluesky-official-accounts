// 2段リストの「幾何」計算（純関数・DOM非依存）。
// ここが今回バグの温床だった箇所（アンカーのオフセット・吸着見出しの選択・押し出し）なので、
// DOM 配線から切り離してユニットテストできる形にしている。

// 開閉トグル時に、対象見出しを「元の画面内位置」に留めるためのスクロール位置。
// - before: トグル直前の見出しの画面内オフセット（start - scrollTop）。負なら画面上端より上（＝吸着でピン留め中）。
// - startAfter: トグル後の見出しの絶対開始座標。
// - stickyOffset: その見出しの上に吸着している上位バーの高さ（分類なら分野バー分、分野なら0）。
// 見出しが吸着スロットより上にあった場合は、スロット位置（stickyOffset）に置く。
export function anchorTarget(before: number, startAfter: number, stickyOffset: number): number {
  return Math.max(0, startAfter - Math.max(before, stickyOffset));
}

type Measured = { start: number };

// 吸着中に「今どの分野／分類の中にいるか」を、見出しの開始座標とスクロール位置から求める。
// - fi: 上端(off)を最後に越えた分野見出しの行 index（無ければ -1）
// - ci: 分野バー下端ライン(off+fieldH)を最後に越えた、現分野内の分類見出し（無ければ -1）
// - nextFi / nextCi: 押し出し計算に使う「次に迫ってくる」見出し
export function activeHeaders(
  measurements: readonly Measured[],
  off: number,
  fieldHeaderIdx: readonly number[],
  classHeaderIdx: readonly number[],
  fieldH: number
): { fi: number; ci: number; nextFi: number | undefined; nextCi: number | undefined } {
  const startOf = (i: number) => measurements[i]?.start ?? Infinity;

  let fi = -1;
  for (const i of fieldHeaderIdx) {
    if (startOf(i) <= off + 1) fi = i;
    else break;
  }
  const nextFi = fieldHeaderIdx.find((i) => i > fi);

  let ci = -1;
  for (const i of classHeaderIdx) {
    if (startOf(i) <= off + fieldH + 1) {
      if (i > fi && (nextFi === undefined || i < nextFi)) ci = i;
    } else break;
  }
  const nextCi =
    ci >= 0
      ? classHeaderIdx.find((i) => i > ci && (nextFi === undefined || i < nextFi))
      : undefined;

  return { fi, ci, nextFi, nextCi };
}

// 分野バーの押し出し量。次の分野見出しが上端ゾーン(fieldH)に迫ったらバーごと上へ退避する。
export function fieldShift(nextFiStart: number | undefined, off: number, fieldH: number): number {
  if (nextFiStart === undefined) return 0;
  const y = nextFiStart - off;
  return y < fieldH ? Math.min(fieldH, fieldH - y) : 0;
}

// 分類バーの押し出し量。次の分類が迫れば分野バーの裏へスライド、次の分野が迫れば分類ごと退避。
export function classShift(
  nextCiStart: number | undefined,
  nextFiStart: number | undefined,
  off: number,
  fieldH: number,
  classH: number
): number {
  let shift = 0;
  if (nextCiStart !== undefined) {
    const y = nextCiStart - off;
    if (y < fieldH + classH) shift = Math.min(classH, fieldH + classH - y);
  }
  if (nextFiStart !== undefined) {
    const y = nextFiStart - off;
    if (y < fieldH + classH) shift = Math.max(shift, Math.min(fieldH + classH, fieldH + classH - y));
  }
  return shift;
}
