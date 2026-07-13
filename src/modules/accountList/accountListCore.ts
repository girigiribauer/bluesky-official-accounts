// フレームワーク非依存の2段リスト核。
// @tanstack/virtual-core を直接ドライブし、分野→分類→アカウントの2段 sticky を実現する。
// React 等に一切依存せず、コンテナ要素・データ・コールバックだけを受け取る。
// （PoC: tanstack-2level-sticky-poc を実データ・新タクソノミー向けに移植）
import {
  Virtualizer,
  elementScroll,
  observeElementOffset,
  observeElementRect,
  measureElement,
} from "@tanstack/virtual-core";
import type { Account } from "src/models/Account";
import { FIELDS } from "src/constants/fields";
import { TRANSITION_STATUS_LABELS } from "src/models/TransitionStatus";
import { extractTwitter, extractBluesky } from "src/lib/extractFromURL";
import {
  groupAccounts,
  buildRows,
  allKeys,
  type Grouped,
  type ListRow,
} from "./buildAccountRows";
import { anchorTarget, activeHeaders, fieldShift, classShift } from "./listGeometry";
import "./accountListCore.css";

// 行の固定高さ（CSS と厳密に一致させること。measureElement を使わず estimate だけで確定する）。
// 分野・分類バーは 27px（min-height:22 + padding:2*2 + border:1）、アカウント行は 32px。
// 分野・分類は色だけ差で寸法は同一。
const ROW_H = { field: 27, class: 27, account: 32 } as const;

export type AccountListOptions = {
  height?: number;
  onEvidence?: (account: Account) => void;
};

export type AccountListController = {
  setAccounts: (accounts: Account[]) => void;
  openAll: () => void;
  closeAll: () => void;
  destroy: () => void;
};

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );

// 分野アイコン（public/images/fields/{fieldId}.svg）。未分野（NO_FIELD）等、対応ファイルがない場合は空文字。
const FIELD_ICON_IDS = new Set<string>(FIELDS.map((f) => f.id));
const fieldIconSrc = (fieldId: string): string =>
  FIELD_ICON_IDS.has(fieldId) ? `/images/fields/${fieldId}.svg` : "";

export function createAccountList(
  container: HTMLElement,
  options: AccountListOptions = {}
): AccountListController {
  container.classList.add("alc-root");
  container.innerHTML = `
    <div class="alc-scroller">
      <div class="alc-inner">
        <div class="alc-bar alc-bar-field" style="display:none">
          <img class="alc-field-icon" src="" width="16" height="16" alt="" style="display:none">
          <span class="alc-field-label"></span><span class="alc-field-classcount"></span><span class="alc-count"></span>
          <span class="alc-chev"><i class="fa-solid fa-caret-down"></i></span>
        </div>
        <div class="alc-bar alc-bar-class" style="display:none">
          <span class="alc-class-name"></span><span class="alc-count"></span>
          <span class="alc-chev"><i class="fa-solid fa-caret-down"></i></span>
        </div>
      </div>
    </div>`;

  const scroller = container.querySelector<HTMLElement>(".alc-scroller")!;
  const inner = container.querySelector<HTMLElement>(".alc-inner")!;
  const fieldBar = container.querySelector<HTMLElement>(".alc-bar-field")!;
  const classBar = container.querySelector<HTMLElement>(".alc-bar-class")!;
  const viewportH = options.height ?? 500;
  scroller.style.height = `${viewportH}px`;

  // ---- 状態（クロージャに閉じ込め）----
  let grouped: Grouped = groupAccounts([]);
  const fieldOpen = new Set<string>();
  const classOpen = new Set<string>();
  let rows: ListRow[] = [];
  let fieldHeaderIdx: number[] = [];
  let classHeaderIdx: number[] = [];
  const pool = new Map<number, HTMLElement>();

  const estimate = (index: number) => ROW_H[rows[index]?.kind ?? "account"];

  const virtualizer = new Virtualizer<HTMLElement, HTMLElement>({
    count: 0,
    getScrollElement: () => scroller,
    estimateSize: estimate,
    overscan: 12,
    scrollToFn: elementScroll,
    observeElementRect,
    observeElementOffset,
    measureElement,
    // 実測キャッシュのキーは index ではなく論理行の rowKey にする。
    // ツリー開閉で index と行内容の対応が入れ替わっても、実測した高さが別の行に化けない。
    getItemKey: (index) => rows[index]?.rowKey ?? index,
    onChange: () => render(),
  });

  function reindexHeaders() {
    fieldHeaderIdx = [];
    classHeaderIdx = [];
    rows.forEach((r, i) => {
      if (r.kind === "field") fieldHeaderIdx.push(i);
      else if (r.kind === "class") classHeaderIdx.push(i);
    });
  }

  function accountInner(account: Account): string {
    const label = TRANSITION_STATUS_LABELS[account.status] ?? account.status;
    const x = account.twitter
      ? `<span class="alc-social"><img class="alc-social-icon" src="/images/icon-x.svg" width="16" height="16" alt="X"><a href="${esc(account.twitter)}" target="_blank" rel="noreferrer">${esc(extractTwitter(account.twitter))}</a></span>`
      : "";
    const bsky = account.bluesky
      ? `<span class="alc-social"><img class="alc-social-icon" src="/images/icon-bluesky.svg" width="16" height="16" alt="Bluesky"><a href="${esc(account.bluesky)}" target="_blank" rel="noreferrer">${esc(extractBluesky(account.bluesky))}</a></span>`
      : "";
    const evidence = account.source
      ? `<button class="alc-evidence-btn" type="button">根拠 <i class="hint">?</i></button>`
      : "";
    // main（名称・ステータス・根拠）と socials（X・Bluesky）の2グループに分ける。
    // デスクトップは CSS の display:contents でグループを透過させ、従来通り5列の1行に並べる。
    // モバイルは main→1行目 / socials→2行目 の2段組にする。
    return (
      `<div class="alc-acc-main">` +
        `<div class="alc-acc-name">${esc(account.name)}</div>` +
        `<div class="alc-acc-status"><span class="status" data-status="${esc(account.status)}">${esc(label)}</span></div>` +
        `<div class="alc-acc-evidence">${evidence}</div>` +
      `</div>` +
      `<div class="alc-acc-socials">` +
        `<div class="alc-acc-col alc-acc-x">${x}</div>` +
        `<div class="alc-acc-col alc-acc-bsky">${bsky}</div>` +
      `</div>`
    );
  }

  function renderRowContent(el: HTMLElement, row: ListRow, index: number) {
    el.className = `alc-row alc-row-${row.kind}`;
    el.dataset.index = String(index);
    if (row.kind === "field") {
      const iconSrc = fieldIconSrc(row.fieldId);
      el.innerHTML =
        (iconSrc ? `<img class="alc-field-icon" src="${iconSrc}" width="16" height="16" alt="">` : "") +
        `<span class="alc-field-label">${esc(row.label)}</span>` +
        `<span class="alc-field-classcount">${row.classCount}分類</span>` +
        `<span class="alc-count">${row.total}件</span>` +
        `<span class="alc-chev${fieldOpen.has(row.fieldId) ? " alc-open" : ""}"><i class="fa-solid fa-caret-down"></i></span>`;
      el.onclick = () => toggleField(row.fieldId);
    } else if (row.kind === "class") {
      el.innerHTML =
        `<span class="alc-class-name">${esc(row.name)}</span>` +
        `<span class="alc-count">${row.total}件</span>` +
        `<span class="alc-chev${classOpen.has(row.classKey) ? " alc-open" : ""}"><i class="fa-solid fa-caret-down"></i></span>`;
      el.onclick = () => toggleClass(row.classKey);
    } else {
      el.innerHTML = accountInner(row.account);
      el.onclick = null;
      const btn = el.querySelector<HTMLButtonElement>(".alc-evidence-btn");
      if (btn) {
        const acc = row.account;
        btn.onclick = (e) => {
          e.stopPropagation();
          options.onEvidence?.(acc);
        };
      }
    }
  }

  // 実測（measureElement）は resizeItem → onChange → render を同期で呼び戻すことがある。
  // 再入すると DOM 追加ループの途中で位置が変わるため、フラグで直列化し末尾でまとめて再描画する。
  let renderRunning = false;
  let renderScheduled = false;
  function render() {
    if (renderRunning) {
      renderScheduled = true;
      return;
    }
    renderRunning = true;
    try {
      do {
        renderScheduled = false;
        renderOnce();
      } while (renderScheduled);
    } finally {
      renderRunning = false;
    }
  }

  function renderOnce() {
    const totalH = `${virtualizer.getTotalSize()}px`;
    if (inner.style.height !== totalH) inner.style.height = totalH;

    const items = virtualizer.getVirtualItems();
    const seen = new Set<number>();
    let removed = false;
    for (const vi of items) {
      seen.add(vi.index);
      let el = pool.get(vi.index);
      if (!el) {
        el = document.createElement("div");
        renderRowContent(el, rows[vi.index], vi.index);
        pool.set(vi.index, el);
        inner.appendChild(el);
        // 実測を有効化（ResizeObserver 登録＋即時計測）。可変高さはここが拾う。
        virtualizer.measureElement(el);
      }
      // 位置は毎回更新する。可変高さでは計測で後続行の start が動くため。
      const t = `translateY(${vi.start}px)`;
      if (el.style.transform !== t) el.style.transform = t;
    }
    for (const [idx, el] of pool) {
      if (!seen.has(idx)) {
        el.remove();
        pool.delete(idx);
        removed = true;
      }
    }
    // 画面外に消えた行の ResizeObserver を掃除する（切断済みノードを unobserve）。
    if (removed) virtualizer.measureElement(null as unknown as HTMLElement);
    updateActiveBars(scroller.scrollTop);
  }

  // ---- 2段 sticky バーの中身更新（吸着自体は CSS position:sticky 任せ）----
  const setText = (el: Element, sel: string, val: string) => {
    const n = el.querySelector(sel);
    if (n && n.textContent !== val) n.textContent = val;
  };
  const setStyle = (el: HTMLElement, prop: "display" | "transform", val: string) => {
    if (el.style[prop] !== val) el.style[prop] = val;
  };
  const setChev = (bar: HTMLElement, open: boolean) => {
    const chev = bar.querySelector(".alc-chev");
    if (chev) chev.classList.toggle("alc-open", open);
  };
  const setFieldIcon = (bar: HTMLElement, fieldId: string) => {
    const icon = bar.querySelector<HTMLImageElement>(".alc-field-icon");
    if (!icon) return;
    const src = fieldIconSrc(fieldId);
    if (src) {
      if (icon.getAttribute("src") !== src) icon.setAttribute("src", src);
      setStyle(icon, "display", "");
    } else {
      setStyle(icon, "display", "none");
    }
  };

  function updateActiveBars(off: number) {
    const m = virtualizer.measurementsCache;
    if (m.length === 0) {
      setStyle(fieldBar, "display", "none");
      setStyle(classBar, "display", "none");
      return;
    }
    const fieldH = ROW_H.field;
    const classH = ROW_H.class;

    const { fi, ci, nextFi, nextCi } = activeHeaders(
      m,
      off,
      fieldHeaderIdx,
      classHeaderIdx,
      fieldH
    );

    if (fi >= 0) {
      const row = rows[fi] as Extract<ListRow, { kind: "field" }>;
      setStyle(fieldBar, "display", "");
      setFieldIcon(fieldBar, row.fieldId);
      setText(fieldBar, ".alc-field-label", row.label);
      setText(fieldBar, ".alc-field-classcount", `${row.classCount}分類`);
      setText(fieldBar, ".alc-count", `${row.total}件`);
      setChev(fieldBar, fieldOpen.has(row.fieldId));
      fieldBar.onclick = () => toggleField(row.fieldId);
      const shift = fieldShift(nextFi !== undefined ? m[nextFi]?.start : undefined, off, fieldH);
      setStyle(fieldBar, "transform", shift > 0 ? `translateY(${-shift}px)` : "");
    } else {
      setStyle(fieldBar, "display", "none");
      setStyle(fieldBar, "transform", "");
    }

    if (ci >= 0) {
      const row = rows[ci] as Extract<ListRow, { kind: "class" }>;
      setStyle(classBar, "display", "");
      setText(classBar, ".alc-class-name", row.name);
      setText(classBar, ".alc-count", `${row.total}件`);
      setChev(classBar, classOpen.has(row.classKey));
      classBar.onclick = () => toggleClass(row.classKey);
      const shift = classShift(
        nextCi !== undefined ? m[nextCi]?.start : undefined,
        nextFi !== undefined ? m[nextFi]?.start : undefined,
        off,
        fieldH,
        classH
      );
      setStyle(classBar, "transform", shift > 0 ? `translateY(${-shift}px)` : "");
    } else {
      setStyle(classBar, "display", "none");
      setStyle(classBar, "transform", "");
    }
  }

  // ---- バー追従は rAF ループ（scroll イベントより滑らか）----
  let barRaf = 0;
  let barIdle = 0;
  const tickBars = () => {
    updateActiveBars(scroller.scrollTop);
    barRaf = requestAnimationFrame(tickBars);
  };
  const onScroll = () => {
    if (!barRaf) barRaf = requestAnimationFrame(tickBars);
    clearTimeout(barIdle);
    barIdle = window.setTimeout(() => {
      cancelAnimationFrame(barRaf);
      barRaf = 0;
      updateActiveBars(scroller.scrollTop);
    }, 150);
  };
  scroller.addEventListener("scroll", onScroll, { passive: true });

  // ---- ツリー変更 → 作り直し ----
  function rebuildRows() {
    rows = buildRows(grouped, fieldOpen, classOpen);
    reindexHeaders();
    for (const [, el] of pool) el.remove();
    pool.clear();
    // 消したノードの ResizeObserver 登録を掃除（切断済みを unobserve）。
    virtualizer.measureElement(null as unknown as HTMLElement);
    virtualizer.setOptions({ ...virtualizer.options, count: rows.length });
    virtualizer._willUpdate();
    virtualizer.measure();
    render();
  }

  // 開閉時にツリーが伸縮してもスクロールが飛ばないよう、トグルした見出しを
  // 元の画面内オフセットに固定する（画面上へ上がっていた場合は先頭へ寄せる）。
  function anchorToggle(match: (r: ListRow) => boolean, toggle: () => void) {
    const oldIdx = rows.findIndex(match);
    const before = (virtualizer.measurementsCache[oldIdx]?.start ?? 0) - scroller.scrollTop;
    toggle();
    rebuildRows();
    const newIdx = rows.findIndex(match);
    if (newIdx < 0) return;
    // 分類の上には分野バー(ROW_H.field)が吸着している。その下端が分類にとっての「見かけの先頭」。
    // 分野には上位バーが無いので 0。
    const stickyOffset = rows[newIdx].kind === "class" ? ROW_H.field : 0;
    const startAfter = virtualizer.measurementsCache[newIdx]?.start ?? 0;
    virtualizer.scrollToOffset(anchorTarget(before, startAfter, stickyOffset));
  }

  function toggleField(fieldId: string) {
    anchorToggle(
      (r) => r.kind === "field" && r.fieldId === fieldId,
      () => void (fieldOpen.has(fieldId) ? fieldOpen.delete(fieldId) : fieldOpen.add(fieldId))
    );
  }
  function toggleClass(classKey: string) {
    anchorToggle(
      (r) => r.kind === "class" && r.classKey === classKey,
      () => void (classOpen.has(classKey) ? classOpen.delete(classKey) : classOpen.add(classKey))
    );
  }

  // ---- マウント（バニラでは _willUpdate を自分で呼ぶ必要がある）----
  const cleanup = virtualizer._didMount();
  virtualizer._willUpdate();

  return {
    setAccounts(accounts: Account[]) {
      grouped = groupAccounts(accounts);
      fieldOpen.clear();
      classOpen.clear();
      scroller.scrollTop = 0;
      rebuildRows();
    },
    openAll() {
      const { fields, classes } = allKeys(grouped);
      fields.forEach((f) => fieldOpen.add(f));
      classes.forEach((c) => classOpen.add(c));
      rebuildRows();
    },
    closeAll() {
      fieldOpen.clear();
      classOpen.clear();
      rebuildRows();
    },
    destroy() {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(barRaf);
      clearTimeout(barIdle);
      cleanup?.();
      pool.clear();
      container.innerHTML = "";
      container.classList.remove("alc-root");
    },
  };
}
