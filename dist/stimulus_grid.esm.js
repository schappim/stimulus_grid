var Q = Object.defineProperty;
var Z = (l, i, e) => i in l ? Q(l, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[i] = e;
var w = (l, i, e) => Z(l, typeof i != "symbol" ? i + "" : i, e);
import { Controller as x, Application as J } from "@hotwired/stimulus";
function b(l, i) {
  return typeof i.valueGetter == "function" ? i.valueGetter(l) : l?.[i.field];
}
function R(l, i) {
  const e = b(l, i);
  return typeof i.valueFormatter == "function" ? i.valueFormatter(e, l) : e == null ? "" : i.type === "date" && e instanceof Date ? e.toLocaleDateString() : i.type === "boolean" ? e ? "✓" : "" : String(e);
}
const O = {
  contains: (l, i) => String(l ?? "").toLowerCase().includes(String(i ?? "").toLowerCase()),
  notContains: (l, i) => !String(l ?? "").toLowerCase().includes(String(i ?? "").toLowerCase()),
  equals: (l, i) => String(l ?? "").toLowerCase() === String(i ?? "").toLowerCase(),
  notEqual: (l, i) => String(l ?? "").toLowerCase() !== String(i ?? "").toLowerCase(),
  startsWith: (l, i) => String(l ?? "").toLowerCase().startsWith(String(i ?? "").toLowerCase()),
  endsWith: (l, i) => String(l ?? "").toLowerCase().endsWith(String(i ?? "").toLowerCase()),
  blank: (l) => l == null || l === "",
  notBlank: (l) => l != null && l !== ""
}, ee = {
  equals: (l, i) => Number(l) === Number(i),
  notEqual: (l, i) => Number(l) !== Number(i),
  lessThan: (l, i) => Number(l) < Number(i),
  lessThanOrEqual: (l, i) => Number(l) <= Number(i),
  greaterThan: (l, i) => Number(l) > Number(i),
  greaterThanOrEqual: (l, i) => Number(l) >= Number(i),
  inRange: (l, i, e) => Number(l) >= Number(i) && Number(l) <= Number(e),
  blank: (l) => l == null || l === "",
  notBlank: (l) => l != null && l !== ""
};
function y(l) {
  if (l == null || l === "") return null;
  if (l instanceof Date) return l;
  const i = new Date(l);
  return Number.isNaN(i.valueOf()) ? null : i;
}
const te = {
  equals: (l, i) => y(l)?.toDateString() === y(i)?.toDateString(),
  notEqual: (l, i) => y(l)?.toDateString() !== y(i)?.toDateString(),
  lessThan: (l, i) => (y(l)?.valueOf() ?? -1 / 0) < (y(i)?.valueOf() ?? 1 / 0),
  greaterThan: (l, i) => (y(l)?.valueOf() ?? 1 / 0) > (y(i)?.valueOf() ?? -1 / 0),
  inRange: (l, i, e) => {
    const t = y(l)?.valueOf();
    return t != null && t >= (y(i)?.valueOf() ?? -1 / 0) && t <= (y(e)?.valueOf() ?? 1 / 0);
  },
  blank: (l) => l == null || l === "",
  notBlank: (l) => l != null && l !== ""
}, se = {
  equals: (l, i) => i === "true" ? !!l : i === "false" ? !l : !0
}, ie = {
  in: (l, i) => Array.isArray(i) && i.includes(String(l ?? ""))
}, ne = { text: O, number: ee, date: te, boolean: se, set: ie };
function le(l, i, e) {
  if (!e) return !0;
  const t = e.filterType || i.filter || "text", n = (ne[t] || O)[e.type];
  if (!n) return !0;
  const o = b(l, i);
  return n(o, e.value, e.value2);
}
function q(l, i, e) {
  const t = Object.entries(i || {}).filter(([, s]) => s != null);
  return t.length === 0 ? l : l.filter((s) => t.every(([n, o]) => {
    const r = e[n];
    return r ? le(s, r, o) : !0;
  }));
}
function $(l, i, e) {
  if (!i) return l;
  const t = String(i).toLowerCase();
  return l.filter((s) => {
    for (const n of e) {
      const o = R(s, n);
      if (o && String(o).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function I(l, i, e) {
  if (l == null && i == null) return 0;
  if (l == null) return -1;
  if (i == null) return 1;
  if (e === "number") return Number(l) - Number(i);
  if (e === "date") {
    const t = y(l)?.valueOf() ?? 0, s = y(i)?.valueOf() ?? 0;
    return t - s;
  }
  return e === "boolean" ? l === i ? 0 : l ? 1 : -1 : String(l).localeCompare(String(i), void 0, { numeric: !0, sensitivity: "base" });
}
function oe(l, i, e) {
  if (!i || i.length === 0) return l;
  const t = l.slice();
  return t.sort((s, n) => {
    for (const { colId: o, sort: r } of i) {
      const a = e[o];
      if (!a) continue;
      const d = b(s, a), u = b(n, a), c = typeof a.comparator == "function" ? a.comparator(d, u, s, n) : I(d, u, a.type);
      if (c !== 0) return r === "desc" ? -c : c;
    }
    return 0;
  }), t;
}
function A(l, i) {
  if (!i || !i.enabled) return { rows: l, total: l.length, pageRows: l };
  const e = l.length, t = Math.max(1, Math.ceil(e / i.pageSize)), s = Math.min(i.page, t - 1), n = s * i.pageSize, o = l.slice(n, n + i.pageSize);
  return { rows: l, total: e, totalPages: t, page: s, pageRows: o };
}
function K(l, i, e) {
  if (l === "count") return i.length;
  const t = i.map((n) => b(n, e));
  if (l === "first") return t.length ? t[0] : null;
  if (l === "last") return t.length ? t[t.length - 1] : null;
  const s = t.map(Number).filter((n) => !Number.isNaN(n));
  switch (l) {
    case "sum":
      return s.reduce((n, o) => n + o, 0);
    case "avg":
      return s.length ? s.reduce((n, o) => n + o, 0) / s.length : null;
    case "min":
      return s.length ? Math.min(...s) : null;
    case "max":
      return s.length ? Math.max(...s) : null;
    default:
      return null;
  }
}
function V(l, i, e) {
  const t = {};
  for (const [s, n] of Object.entries(i || {})) {
    const o = e[s];
    o && (t[s] = K(n, l, o));
  }
  return t;
}
function re(l) {
  let i = 0, e = 0, t = 0, s = 1 / 0, n = -1 / 0;
  for (const o of l) {
    if (o == null || o === "") continue;
    i += 1;
    let r = null;
    if (typeof o == "number" && Number.isFinite(o)) r = o;
    else if (typeof o == "string" && o.trim() !== "") {
      const a = Number(o);
      Number.isFinite(a) && (r = a);
    }
    r != null && (e += 1, t += r, r < s && (s = r), r > n && (n = r));
  }
  return {
    count: i,
    sum: e ? t : null,
    avg: e ? t / e : null,
    min: e ? s : null,
    max: e ? n : null
  };
}
function ae(l, i, e, t, s = () => !0) {
  const n = (d, u, c) => {
    const p = i[u], f = /* @__PURE__ */ new Map();
    for (const g of d) {
      const m = b(g, p), _ = m == null ? "" : String(m);
      f.has(_) || f.set(_, { value: m, rows: [] }), f.get(_).rows.push(g);
    }
    return Array.from(f.values()).sort((g, m) => I(g.value, m.value, p.type)).map(({ value: g, rows: m }) => {
      const _ = g == null ? "" : String(g), C = c ? `${c}|${p.field}=${_}` : `${p.field}=${_}`;
      return {
        __sgGroup: !0,
        level: u,
        field: p.field,
        value: g,
        groupId: C,
        count: m.length,
        aggregates: V(m, t, e),
        leaves: m,
        children: u + 1 < i.length ? n(m, u + 1, C) : null
      };
    });
  }, o = n(l, 0, ""), r = [], a = (d) => {
    for (const u of d)
      if (r.push(u), !!s(u.groupId, u.level))
        if (u.children) a(u.children);
        else for (const c of u.leaves) r.push(c);
  };
  return a(o), { displayList: r, tree: o };
}
function H(l, i, e) {
  return `__p|${e.map((s) => {
    const n = l[s.field];
    return `${s.field}=${n == null ? "" : String(n)}`;
  }).join("|")}|${i.col.field}:${i.aggFunc}`;
}
function W(l, i) {
  return i.map((e) => {
    const t = b(l, e);
    return t == null ? "" : String(t);
  }).join("");
}
function de(l, i) {
  if (!i?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const t of l) {
    const s = W(t, i);
    if (!e.has(s)) {
      const n = {};
      i.forEach((o) => {
        const r = b(t, o);
        n[o.field] = r ?? null;
      }), e.set(s, n);
    }
  }
  return Array.from(e.values()).sort((t, s) => {
    for (const n of i) {
      const o = I(t[n.field], s[n.field], n.type);
      if (o !== 0) return o;
    }
    return 0;
  });
}
function ce(l, i, e) {
  if (!l.length || !i.length) return [];
  const t = [], s = i.length === 1;
  for (const n of l)
    for (const o of i) {
      const r = H(n, o, e), a = e.map((u) => n[u.field] == null ? "(Blank)" : String(n[u.field])).join(" · "), d = s ? a : `${a} · ${o.aggFunc}(${o.col.field})`;
      t.push({
        field: r,
        headerName: d,
        type: "number",
        width: 100,
        sortable: !1,
        // sorting on aggregated pivot cols is a future enhancement
        filter: null,
        resizable: !1,
        _isPivot: !0,
        pivotKeys: { ...n },
        valueField: o.col.field,
        aggFunc: o.aggFunc,
        valueGetter: (u) => u?.__pivotValues?.[r] ?? null
      });
    }
  return t;
}
function F(l, i, e, t) {
  const s = {}, n = /* @__PURE__ */ new Map();
  for (const o of l) {
    const r = W(o, t);
    n.has(r) || n.set(r, []), n.get(r).push(o);
  }
  for (const o of i) {
    const r = t.map((d) => {
      const u = o[d.field];
      return u == null ? "" : String(u);
    }).join(""), a = n.get(r) || [];
    for (const d of e) {
      const u = H(o, d, t);
      s[u] = a.length ? K(d.aggFunc, a, d.col) : null;
    }
  }
  return s;
}
function ue({ rows: l, rowGroupCols: i = [], pivotCols: e, valueConfigs: t, isExpanded: s = () => !0 }) {
  const n = de(l, e), o = ce(n, t, e), r = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: l.length,
    aggregates: {},
    leaves: l,
    __pivotValues: F(l, n, t, e)
  };
  if (!i.length)
    return { columns: o, displayList: [r], tree: [], combos: n };
  const a = (p, f, g) => {
    const m = i[f], _ = /* @__PURE__ */ new Map();
    for (const C of p) {
      const S = b(C, m), D = S == null ? "" : String(S);
      _.has(D) || _.set(D, { value: S, rows: [] }), _.get(D).rows.push(C);
    }
    return Array.from(_.values()).sort((C, S) => I(C.value, S.value, m.type)).map(({ value: C, rows: S }) => {
      const D = C == null ? "" : String(C), T = g ? `${g}|${m.field}=${D}` : `${m.field}=${D}`;
      return {
        __sgGroup: !0,
        level: f,
        field: m.field,
        value: C,
        groupId: T,
        count: S.length,
        aggregates: {},
        leaves: S,
        __pivotValues: F(S, n, t, e),
        children: f + 1 < i.length ? a(S, f + 1, T) : null
      };
    });
  }, d = a(l, 0, ""), u = [r], c = (p) => {
    for (const f of p)
      u.push(f), s(f.groupId, f.level) && f.children && c(f.children);
  };
  return c(d), { columns: o, displayList: u, tree: d, combos: n };
}
function he(l) {
  if (l.serverSide) {
    const a = l.rowData, d = l.pagination?.pageSize || a.length || 1, u = l.serverRowCount ?? a.length, c = Math.max(1, Math.ceil(u / d)), p = Math.min(l.pagination?.page || 0, c - 1);
    return { filteredSorted: a, rows: a, total: u, totalPages: c, page: p, pageRows: a };
  }
  const i = Object.fromEntries(l.columnDefs.map((a) => [a.field, a])), e = l.columnDefs.filter((a) => !a.hidden && !a._isCheckbox);
  let t = l.rowData;
  t = q(t, l.filterModel, i), t = $(t, l.quickFilter, e), t = oe(t, l.sortModel, i);
  const s = (l.rowGroupCols || []).filter((a) => i[a]), n = l.pivotMode ? (l.pivotCols || []).filter((a) => i[a]) : [], o = l.pivotMode ? Object.entries(l.aggModel || {}).filter(([a]) => i[a]).map(([a, d]) => ({ col: i[a], aggFunc: d })) : [];
  if (l.pivotMode && n.length && o.length) {
    const a = s.map((m) => i[m]), d = n.map((m) => i[m]), { columns: u, displayList: c, tree: p, combos: f } = ue({
      rows: t,
      rowGroupCols: a,
      pivotCols: d,
      valueConfigs: o,
      isExpanded: l.isGroupExpanded
    }), g = A(c, l.pagination);
    return {
      pivot: !0,
      pivotResultColumns: u,
      combos: f,
      grouped: !0,
      tree: p,
      leafCount: t.length,
      grandTotals: V(t, l.aggModel, i),
      filteredSorted: c,
      ...g
    };
  }
  if (s.length) {
    const a = s.map((p) => i[p]), { displayList: d, tree: u } = ae(
      t,
      a,
      i,
      l.aggModel,
      l.isGroupExpanded
    ), c = A(d, l.pagination);
    return {
      grouped: !0,
      tree: u,
      leafCount: t.length,
      grandTotals: V(t, l.aggModel, i),
      filteredSorted: d,
      ...c
    };
  }
  const r = A(t, l.pagination);
  return { filteredSorted: t, ...r };
}
function ge(l, i, e, t, s = 6) {
  const n = Math.ceil(i / e), o = Math.max(0, Math.floor(l / e) - s), r = Math.min(t, o + n + s * 2);
  return { first: o, last: r };
}
function pe(l) {
  return {
    // ---- Data ----
    setRowData(i) {
      l.setRowData(i);
    },
    getRowData() {
      return l.state.rowData.slice();
    },
    applyTransaction(i) {
      return l.applyTransaction(i);
    },
    // Server-side row model
    setRowCount(i) {
      l.setRowCount(i);
    },
    getRowCount() {
      return l.state.serverSide ? l.state.serverRowCount : l.state.rowData.length;
    },
    isServerSide() {
      return !!l.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(i) {
      l.setColumnDefs(i);
    },
    getColumnDefs() {
      return l.state.columnDefs.slice();
    },
    setColumnVisible(i, e) {
      l.setColumnVisible(i, e);
    },
    setColumnPinned(i, e) {
      l.setColumnPinned(i, e);
    },
    setColumnWidth(i, e) {
      l.setColumnWidth(i, e);
    },
    moveColumn(i, e) {
      l.moveColumn(i, e);
    },
    autoSizeColumn(i) {
      l.autoSizeColumn(i);
    },
    autoSizeAllColumns() {
      l.state.columnDefs.forEach((i) => l.autoSizeColumn(i.field));
    },
    sizeColumnsToFit() {
      l.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(i) {
      l.setSortModel(i);
    },
    getSortModel() {
      return l.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(i) {
      l.setFilterModel(i);
    },
    getFilterModel() {
      return { ...l.state.filterModel };
    },
    setColumnFilter(i, e) {
      l.setColumnFilter(i, e);
    },
    destroyFilter(i) {
      l.setColumnFilter(i, null);
    },
    setQuickFilter(i) {
      l.setQuickFilter(i);
    },
    getQuickFilter() {
      return l.getQuickFilter();
    },
    // ---- Selection ----
    selectAll() {
      l.selectAll();
    },
    deselectAll() {
      l.deselectAll();
    },
    selectRow(i) {
      l.setSelected(i, !0);
    },
    deselectRow(i) {
      l.setSelected(i, !1);
    },
    getSelectedRows() {
      return l.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(l.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(i) {
      l.goToPage(i);
    },
    paginationGoToFirstPage() {
      l.goToPage(0);
    },
    paginationGoToNextPage() {
      l.goToPage(l.state.pagination.page + 1);
    },
    paginationGoToPreviousPage() {
      l.goToPage(l.state.pagination.page - 1);
    },
    paginationGoToLastPage() {
      l.goToPage(l.lastPageIndex());
    },
    paginationSetPageSize(i) {
      l.setPageSize(i);
    },
    paginationGetCurrentPage() {
      return l.state.pagination.page;
    },
    paginationGetTotalPages() {
      return l.totalPages();
    },
    paginationGetRowCount() {
      return l.filteredCount();
    },
    paginationGetPageSize() {
      return l.state.pagination.pageSize;
    },
    paginationIsEnabled() {
      return l.state.pagination.enabled;
    },
    // ---- Cell selection ----
    getCellSelection() {
      return l.getCellSelectionDetail();
    },
    getCellRangeValues() {
      return l._cellRangeRows();
    },
    getCellSelectionRowIds() {
      return l.getCellSelectionRowIds();
    },
    getRangeAggregates() {
      return l.getRangeAggregates();
    },
    // ---- Editing ----
    startEditingCell({ rowId: i, colId: e }) {
      l.startEditingCell(i, e);
    },
    stopEditing(i = !1) {
      l.stopEditing(i);
    },
    // ---- Row grouping + aggregation ----
    setRowGroupColumns(i) {
      l.setRowGroupColumns(i);
    },
    addRowGroupColumn(i) {
      l.addRowGroupColumn(i);
    },
    removeRowGroupColumn(i) {
      l.removeRowGroupColumn(i);
    },
    getRowGroupColumns() {
      return l.getRowGroupColumns();
    },
    setColumnAggFunc(i, e) {
      l.setColumnAggFunc(i, e);
    },
    expandAll() {
      l.expandAll();
    },
    collapseAll() {
      l.collapseAll();
    },
    toggleGroup(i, e) {
      l.toggleGroup(i, e);
    },
    // ---- Pivot ----
    setPivotMode(i) {
      l.setPivotMode(i);
    },
    isPivotMode() {
      return l.isPivotMode();
    },
    setPivotColumns(i) {
      l.setPivotColumns(i);
    },
    addPivotColumn(i) {
      l.addPivotColumn(i);
    },
    removePivotColumn(i) {
      l.removePivotColumn(i);
    },
    getPivotColumns() {
      return l.getPivotColumns();
    },
    // ---- Value columns (aggregations; shared with grouping) ----
    setValueColumns(i) {
      l.setValueColumns(i);
    },
    addValueColumn(i, e = "sum") {
      l.addValueColumn(i, e);
    },
    removeValueColumn(i) {
      l.removeValueColumn(i);
    },
    getValueColumns() {
      return l.getValueColumns();
    },
    // ---- Export ----
    getDataAsCsv(i = {}) {
      return l.getDataAsCsv(i);
    },
    exportDataAsCsv(i = {}) {
      return l.exportDataAsCsv(i);
    },
    // ---- Display ----
    refreshCells(i = {}) {
      l.refresh(i);
    },
    redrawRows(i = {}) {
      l.refresh(i);
    },
    // ---- Events ----
    addEventListener(i, e) {
      l.element.addEventListener(i, e);
    },
    removeEventListener(i, e) {
      l.element.removeEventListener(i, e);
    }
  };
}
function h(l, i = {}, e = []) {
  const t = document.createElement(l);
  for (const [s, n] of Object.entries(i))
    n === !1 || n == null || (s === "class" ? t.className = n : s === "style" && typeof n == "object" ? Object.assign(t.style, n) : s.startsWith("on") && typeof n == "function" ? t.addEventListener(s.slice(2).toLowerCase(), n) : n === !0 ? t.setAttribute(s, "") : t.setAttribute(s, String(n)));
  for (const s of [].concat(e))
    s == null || s === !1 || t.appendChild(typeof s == "string" ? document.createTextNode(s) : s);
  return t;
}
function G(l, i) {
  for (const [e, t] of Object.entries(i))
    t == null || t === !1 ? l.removeAttribute(e) : t === !0 ? l.setAttribute(e, "") : l.setAttribute(e, String(t));
}
function N(l) {
  const i = document.getElementById(l);
  return !i || i.tagName !== "TEMPLATE" ? null : i.content.firstElementChild.cloneNode(!0);
}
function v(l, i, e) {
  l.dispatchEvent(new CustomEvent(i, { detail: e, bubbles: !0 }));
}
function fe(l, i, e) {
  let t = l.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(i)) {
      const n = e.getControllerForElementAndIdentifier(t, i);
      if (n) return n;
    }
    t = t.parentElement;
  }
  return null;
}
const me = 32, B = 100, z = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', _e = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>';
class P extends x {
  constructor() {
    super(...arguments);
    w(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    // ----- Row grouping + aggregation -----
    // A group is expanded if it has an explicit override; otherwise the
    // default-by-level applies (-1 = all, 0 = none, N = first N levels).
    w(this, "_isGroupExpanded", (e, t) => {
      if (this._groupExpanded.has(e)) return this._groupExpanded.get(e);
      const s = this.state.group.defaultExpanded;
      return s < 0 ? !0 : t < s;
    });
    w(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
    });
    w(this, "_onCellMouseDown", (e) => {
      if (e.button !== 0) return;
      if (this.rowDragValue) {
        const n = e.target.closest?.('td[data-gutter="true"]');
        if (n) {
          const o = n.closest("tr");
          this._rowDragPending = { rowId: this._coerceRowId(o.dataset.rowId), x: e.clientX, y: e.clientY }, this._rowDragMoved = !1, document.addEventListener("mousemove", this._onRowDragMove);
          return;
        }
      }
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : s ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), v(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    w(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      s && s.focus.rowId === t.rowId && s.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), v(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
    });
    w(this, "_onCellMouseUp", () => {
      this._cellDragging = !1, this._rowDragPending && (document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag && this._finishRowDrag(), this._rowDragPending = null);
    });
    // ----- Row drag-and-drop (reorder) with a ghost preview -----
    w(this, "_onRowDragMove", (e) => {
      const t = this._rowDragPending;
      if (t) {
        if (!this._rowDrag) {
          if (Math.abs(e.clientY - t.y) < 5 && Math.abs(e.clientX - t.x) < 5) return;
          this._startRowDrag(t.rowId);
        }
        this._rowDrag && (this._rowDragMoved = !0, this._rowDrag.ghost.style.left = `${e.clientX + 14}px`, this._rowDrag.ghost.style.top = `${e.clientY + 10}px`, this._updateDropIndicator(e.clientY));
      }
    });
    // Copy the active cell range to the clipboard as TSV (rows \n, cols \t).
    w(this, "_onCopy", (e) => {
      if (this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && !this.element.contains(t)) return;
      const s = this._activeRect();
      if (!s) return;
      const n = this._cellRangeRows(s).map((o) => o.map((r) => String(r ?? "")).join("	")).join(`
`);
      n && (e.clipboardData?.setData("text/plain", n), e.preventDefault());
    });
    w(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && this.element.contains(t)) return;
      const s = e.key, n = e.metaKey || e.ctrlKey;
      if (n && s.toLowerCase() === "a") {
        e.preventDefault(), this.rowSelectionValue !== "" ? (this.clearCellSelection(), this.deselectAll(), this.selectAll()) : this._selectAllCells();
        return;
      }
      if (n) return;
      const o = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (o[s]) {
        e.preventDefault();
        const [r, a] = o[s];
        this._moveActiveCell(r, a, e.shiftKey);
        return;
      }
      if (s === "Tab") {
        e.preventDefault(), this._moveActiveCell(0, e.shiftKey ? -1 : 1, !1);
        return;
      }
      if (s === "Enter") {
        const r = this._activeCell();
        r && (e.preventDefault(), this.startEditingCell(r.rowId, r.colId));
        return;
      }
      if (s === "Escape") {
        this.clearCellSelection();
        return;
      }
      if (s === "Delete" || s === "Backspace") {
        this._clearSelectedCells() && e.preventDefault();
        return;
      }
      if (s.length === 1 && !e.altKey) {
        const r = this._activeCell();
        if (!r) return;
        const a = this._colByField(r.colId);
        if (!a || !a.editable) return;
        e.preventDefault(), this.startEditingCell(r.rowId, r.colId, s);
      }
    });
    w(this, "_onEditorKey", (e) => {
      this.state.editing && (e.key === "Enter" ? (e.preventDefault(), this.stopEditing(!1)) : e.key === "Escape" ? (e.preventDefault(), this.stopEditing(!0)) : e.key === "Tab" && (e.preventDefault(), this._tabToEditableCell(e.shiftKey ? -1 : 1)));
    });
    w(this, "_onEditorBlur", () => {
      this._navigatingEditor || this.state.editing && this.stopEditing(!1);
    });
  }
  initialize() {
    this.state = {
      rowData: [],
      columnDefs: [],
      sortModel: [],
      filterModel: {},
      quickFilter: "",
      selection: /* @__PURE__ */ new Set(),
      focusedCell: null,
      cellSel: { ranges: [], activeIdx: -1 },
      // multi-range: [{anchor,focus}], active range
      editing: null,
      pagination: { enabled: !1, page: 0, pageSize: B },
      scrollTop: 0,
      viewportHeight: 400,
      group: { cols: [], aggs: {}, defaultExpanded: -1 }
    }, this._displayList = { filteredSorted: [], pageRows: [], total: 0, totalPages: 1, page: 0 }, this._renderPending = !1, this._dirty = /* @__PURE__ */ new Set(), this._lastRenderedRowIds = /* @__PURE__ */ new Set(), this._runtimeOverrides = /* @__PURE__ */ Object.create(null), this._groupExpanded = /* @__PURE__ */ new Map();
  }
  connect() {
    this.element.classList.add("sg-grid"), this.heightValue && (this.element.style.height = this.heightValue), this.element.hasAttribute("tabindex") || (this.element.tabIndex = 0), this.element.addEventListener("keydown", this._onGridKeydown), this.state.rowHeight = this.rowHeightValue, this.state.pagination = {
      enabled: this.paginationValue,
      page: 0,
      pageSize: this.pageSizeValue
    }, this.state.serverSide = this.serverSideValue, this.state.serverRowCount = this.rowCountValue, this.state.group = {
      cols: Array.isArray(this.rowGroupColsValue) ? this.rowGroupColsValue.slice() : [],
      aggs: { ...this.aggFuncsValue || {} },
      defaultExpanded: this.groupDefaultExpandedValue,
      displayType: this.groupDisplayTypeValue || "singleColumn"
    }, this.state.pivot = {
      mode: !!this.pivotModeValue,
      cols: Array.isArray(this.pivotColsValue) ? this.pivotColsValue.slice() : []
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = pe(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove();
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, s) => {
      const n = {}, o = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      return n[this.getRowIdValue] = o != null ? this._coerceRowId(o) : s + 1, t.querySelectorAll("td").forEach((r) => {
        const a = r.getAttribute("data-cell-col-id-value") || r.getAttribute("data-col-id");
        a && (n[a] = r.textContent.trim());
      }), n;
    }), e.innerHTML = ""), this._initialHead = this.element.querySelector("thead");
  }
  _buildChrome() {
    let e = this.element.querySelector("table");
    if (!e) {
      e = h("table");
      const s = h("thead");
      e.appendChild(s), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = h("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const s = h("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(s, e), s.appendChild(e), this._viewport = s;
    }
    if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = h("div", { class: "sg-status-bar", role: "status" }), this._statusBar.append(
      h("div", { class: "sg-status-section sg-status-left" }),
      h("div", { class: "sg-status-section sg-status-right" })
    ), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
      const s = h("div", { class: "sg-main" });
      this._viewport.parentNode.insertBefore(s, this._viewport), s.appendChild(this._viewport), this._statusBar && s.appendChild(this._statusBar), this._main = s, this._sidePanel = h("aside", {
        class: "sg-side-panel",
        "data-controller": "side-panel"
      }), this.element.appendChild(this._sidePanel), this.element.classList.add("sg-has-side-panel");
    } else
      this._main = null, this._sidePanel = null;
  }
  async _initialLoad() {
    if (this.rowDataValue && this.rowDataValue.length > 0)
      this.state.rowData = this.rowDataValue;
    else if (this.rowDataUrlValue)
      try {
        const e = await fetch(this.rowDataUrlValue);
        this.state.rowData = await e.json();
      } catch (e) {
        console.error("[stimulus_grid] failed to fetch rowDataUrl", e), this.state.rowData = [];
      }
    else this._initialRows && this._initialRows.length > 0 && (this.state.rowData = this._initialRows);
    this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), v(this.element, "grid:ready", { api: this.element.gridApi }), v(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  // Filter UI bridge — implemented by filter_controller, but the grid is the
  // single source of truth so it brokers the popover.
  openFilterFor(e, t) {
    const s = this._colByField(e);
    if (!(!s || !s.filter)) {
      this._closeFilterPopover();
      {
        this._openFallbackFilterPopover(s, t);
        return;
      }
    }
  }
  _closeFilterPopover() {
    this._filterPopover && (this._filterPopover.remove(), this._filterPopover = null, document.removeEventListener("mousedown", this._onDocMouseDown));
  }
  _openFallbackFilterPopover(e, t) {
    const s = this.state.filterModel[e.field] || {}, n = we(e.filter), o = h("div", { class: "sg-filter-popover" }), r = h("select");
    n.forEach((_) => r.append(new Option(_.label, _.value, !1, _.value === s.type)));
    const a = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", d = h("input", { type: a, value: s.value ?? "" }), u = h("input", { type: a, value: s.value2 ?? "", style: { display: "none" } }), c = () => {
      const _ = r.value, C = _ === "inRange", S = !(_ === "blank" || _ === "notBlank");
      d.style.display = S ? "" : "none", u.style.display = C ? "" : "none";
    };
    r.addEventListener("change", c), c();
    const p = h("div", { class: "sg-filter-actions" }), f = h("button", { type: "button" }, "Clear"), g = h("button", { type: "button", class: "primary" }, "Apply");
    p.append(f, g), f.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), g.addEventListener("click", () => {
      const _ = r.value, C = _ === "blank" || _ === "notBlank" ? { filterType: e.filter, type: _ } : { filterType: e.filter, type: _, value: d.value, value2: u.value || void 0 };
      this.setColumnFilter(e.field, C), this._closeFilterPopover();
    }), o.append(
      h("label", {}, "Condition"),
      r,
      d,
      u,
      p
    ), document.body.appendChild(o);
    const m = t.getBoundingClientRect();
    o.style.left = `${m.left + window.scrollX}px`, o.style.top = `${m.bottom + window.scrollY + 2}px`, this._filterPopover = o, document.addEventListener("mousedown", this._onDocMouseDown), d.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const s = this.state.columnDefs.findIndex((r) => r.field === e.field), n = this._runtimeOverrides[e.field] || {}, o = { ...e, ...n, _headerEl: t };
    if (s >= 0) {
      const r = this.state.columnDefs[s];
      if (r._headerEl === t && ve(r, o)) return;
      this.state.columnDefs[s] = o;
    } else
      this.state.columnDefs.push(o);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${E(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const s = this.state.sortModel.findIndex((o) => o.colId === e);
    let n;
    s === -1 ? n = { colId: e, sort: "asc" } : this.state.sortModel[s].sort === "asc" ? n = { colId: e, sort: "desc" } : n = null, t ? (s >= 0 && this.state.sortModel.splice(s, 1), n && this.state.sortModel.push(n)) : this.state.sortModel = n ? [n] : [], this.scheduleRender("sort"), v(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  setSortModel(e) {
    this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), v(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  // ----- Filter -----
  setColumnFilter(e, t) {
    t == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = t, this.state.pagination.page = 0, this.scheduleRender("filter"), v(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setFilterModel(e) {
    this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), v(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setQuickFilter(e) {
    const t = e == null ? "" : String(e);
    t !== this.state.quickFilter && (this.state.quickFilter = t, this.state.pagination.page = 0, this.scheduleRender("filter"), v(this.element, "grid:filterChanged", {
      filterModel: { ...this.state.filterModel },
      quickFilter: t
    }));
  }
  getQuickFilter() {
    return this.state.quickFilter;
  }
  // ----- Selection -----
  toggleRowSelection(e, t = "single") {
    if (this.rowSelectionValue === "") return;
    const s = this.state.selection;
    this.rowSelectionValue === "single" ? (s.clear(), s.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? s.has(e) ? s.delete(e) : s.add(e) : (s.clear(), s.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), v(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(s)
    });
  }
  setSelected(e, t) {
    t ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), v(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  selectAll() {
    this._displayList.filteredSorted.forEach((e) => {
      e.__sgGroup || this.state.selection.add(this._rowId(e));
    }), this.scheduleRender("selection"), v(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  deselectAll() {
    this.state.selection.clear(), this.scheduleRender("selection"), v(this.element, "grid:selectionChanged", { selectedRows: [], selectedIds: [] });
  }
  getSelectedRows() {
    const e = this.state.selection;
    return this.state.rowData.filter((t) => e.has(this._rowId(t)));
  }
  _selectRange(e, t) {
    const s = this._displayList.filteredSorted, n = s.findIndex((d) => this._rowId(d) === e), o = s.findIndex((d) => this._rowId(d) === t);
    if (n < 0 || o < 0) return;
    const [r, a] = n <= o ? [n, o] : [o, n];
    for (let d = r; d <= a; d++)
      s[d].__sgGroup || this.state.selection.add(this._rowId(s[d]));
  }
  // ----- Pagination -----
  goToPage(e) {
    const t = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(e, t)), this.scheduleRender("page"), v(this.element, "grid:paginationChanged", {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  setPageSize(e) {
    this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), v(this.element, "grid:paginationChanged", {
      page: 0,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  totalPages() {
    if (!this.state.pagination.enabled) return 1;
    const e = this.filteredCount();
    return Math.max(1, Math.ceil(e / this.state.pagination.pageSize));
  }
  filteredCount() {
    if (this.state.serverSide) return this.state.serverRowCount;
    const e = Object.fromEntries(this.state.columnDefs.map((n) => [n.field, n])), t = this.state.columnDefs.filter((n) => !n.hidden && !n._isCheckbox);
    let s = q(this.state.rowData, this.state.filterModel, e);
    return s = $(s, this.state.quickFilter, t), s.length;
  }
  // Server-side row model: set the total row count so pagination reflects the
  // full table even though only one page is loaded client-side. No event is
  // emitted (callers pair this with setRowData, whose rowDataChanged refreshes
  // the pagination UI) — emitting paginationChanged here would loop grid-sync.
  setRowCount(e) {
    this.state.serverRowCount = Math.max(0, Number(e) || 0), this.scheduleRender("page");
  }
  lastPageIndex() {
    return this.totalPages() - 1;
  }
  // ----- Editing -----
  startEditingCell(e, t, s = void 0) {
    const n = this.state.columnDefs.find((r) => r.field === t);
    if (!n || !n.editable) return;
    const o = this.state.rowData.find((r) => this._rowId(r) === e);
    o && (this.state.editing = { rowId: e, colId: t, originalValue: b(o, n), initialValue: s }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: s, originalValue: n, draftValue: o } = this.state.editing, r = this._tbody.querySelector(`tr[data-row-id="${E(t)}"] td[data-col-id="${E(s)}"]`);
    let a = n;
    if (!e && r) {
      const d = r.querySelector("[data-editor-input]") || r.querySelector("input,select,textarea");
      d ? a = Ce(d.value, this._colByField(s)?.type) : o !== void 0 && (a = o);
    }
    if (this.state.editing = null, !e && a !== n) {
      const d = this.state.rowData.find((c) => this._rowId(c) === t), u = d[s];
      d[s] = a, v(this.element, "grid:cellValueChanged", { rowId: t, colId: s, oldValue: u, newValue: a });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const s = this._colByField(e);
    s && (s.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), v(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const n = t || null;
    s.pinned = n, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: n }, this._reorderForPinning(), this.scheduleRender("columns"), v(this.element, "grid:columnPinned", { colId: e, pinned: n });
  }
  setColumnWidth(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const n = Math.max(s.minWidth || 40, Math.min(s.maxWidth || 4e3, t));
    s.width = n, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: n }, this.scheduleRender("columns"), v(this.element, "grid:columnResized", { colId: e, width: n });
  }
  moveColumn(e, t) {
    const s = this.state.columnDefs.findIndex((o) => o.field === e);
    if (s < 0 || s === t) return;
    const [n] = this.state.columnDefs.splice(s, 1);
    this.state.columnDefs.splice(t, 0, n), this.scheduleRender("columns"), v(this.element, "grid:columnMoved", { colId: e, fromIndex: s, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const s = (t.headerName || t.field || "").length, n = this.state.rowData.slice(0, 200);
    let o = s;
    for (const r of n) {
      const a = String(R(r, t) ?? "").length;
      a > o && (o = a);
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, o * 8 + 24)));
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), s = t.reduce((o, r) => o + (r.width || 150), 0);
    if (s === 0) return;
    const n = e / s;
    t.forEach((o) => {
      o.width = Math.max(o.minWidth || 40, Math.floor((o.width || 150) * n));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((n) => n.pinned === "left"), t = this.state.columnDefs.filter((n) => n.pinned === "right"), s = this.state.columnDefs.filter((n) => !n.pinned);
    this.state.columnDefs = [...e, ...s, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), v(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], s = [], n = [], o = new Map(this.state.rowData.map((r) => [this._rowId(r), r]));
    return (e.remove || []).forEach((r) => {
      const a = this._rowId(r);
      o.delete(a) && n.push(r);
    }), (e.update || []).forEach((r) => {
      const a = this._rowId(r);
      o.has(a) && (o.set(a, { ...o.get(a), ...r }), s.push(r));
    }), (e.add || []).forEach((r) => {
      const a = this._rowId(r);
      o.has(a) || (o.set(a, r), t.push(r));
    }), this.state.rowData = Array.from(o.values()), this.scheduleRender("data"), v(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: s, removed: n };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const s = this.state.columnDefs.filter((a) => !a.hidden && !a._isCheckbox), n = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((a) => !a.__sgGroup), o = (a) => /[",\n\r]/.test(a) ? `"${String(a).replace(/"/g, '""')}"` : String(a), r = [s.map((a) => o(a.headerName || a.field)).join(e)];
    for (const a of n)
      r.push(s.map((d) => o(R(a, d))).join(e));
    return r.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const s = this.getDataAsCsv(t), n = new Blob([s], { type: "text/csv;charset=utf-8" }), o = URL.createObjectURL(n), r = h("a", { href: o, download: e });
    return document.body.appendChild(r), r.click(), r.remove(), URL.revokeObjectURL(o), s;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.size === 0) && (this._displayList = he({
      rowData: this.state.rowData,
      columnDefs: this.state.columnDefs,
      sortModel: this.state.sortModel,
      filterModel: this.state.filterModel,
      quickFilter: this.state.quickFilter,
      pagination: this.state.pagination,
      serverSide: this.state.serverSide,
      serverRowCount: this.state.serverRowCount,
      rowGroupCols: this.state.group.cols,
      aggModel: this.state.group.aggs,
      isGroupExpanded: this._isGroupExpanded,
      pivotMode: this.state.pivot.mode,
      pivotCols: this.state.pivot.cols
    })), (e.has("columns") || e.has("sort") || e.has("filter") || e.has("selection") || e.has("group") || e.has("pivot")) && this._renderHeader(), this._renderBody(), this._renderPagination(), this._renderStatusBar();
  }
  _renderHeader() {
    if (!this._thead) return;
    const e = this._visibleCols(), t = this._thead.querySelector("tr") || (() => {
      const g = h("tr");
      return this._thead.appendChild(g), g;
    })(), s = /* @__PURE__ */ new Map();
    Array.from(t.querySelectorAll("th")).forEach((g) => {
      const m = g.getAttribute("data-header-cell-field-value") || g.getAttribute("data-field");
      m && s.set(m, g);
    });
    const n = new Set(e.map((g) => g.field)), o = this.state.columnDefs.filter((g) => !n.has(g.field)), r = [...e, ...o], a = Array.from(t.children).map((g) => g.getAttribute("data-header-cell-field-value") || g.getAttribute("data-field")).filter(Boolean), d = r.map((g) => g.field);
    if (!(a.length === d.length && a.every((g, m) => g === d[m]))) {
      const g = [];
      for (const m of r) {
        let _ = s.get(m.field);
        _ || (_ = h("th", {
          "data-field": m.field,
          "data-synth": "true"
        }, [h("div", { class: "sg-header-content" }, [
          h("span", { class: "sg-header-label" }, m.headerName || m.field || "")
        ])])), g.push(_);
      }
      t.replaceChildren(...g);
    }
    Array.from(t.children).forEach((g) => {
      const m = g.getAttribute("data-header-cell-field-value") || g.getAttribute("data-field");
      m != null && (g.style.display = n.has(m) ? "" : "none");
    });
    let c = this._table.querySelector("colgroup");
    c || (c = h("colgroup"), this._table.insertBefore(c, this._thead));
    const p = Array.from(c.children);
    for (e.forEach((g, m) => {
      let _ = p[m];
      _ || (_ = h("col"), c.appendChild(_)), _.style.width = g.width ? g.width + "px" : "";
    }); c.children.length > e.length; ) c.lastElementChild.remove();
    const f = this._pinOffsets();
    for (const g of e) {
      const m = t.querySelector(`th[data-header-cell-field-value="${E(g.field)}"]`) || t.querySelector(`th[data-field="${E(g.field)}"]`);
      if (!m) continue;
      const _ = this.state.sortModel.find((C) => C.colId === g.field);
      G(m, {
        "data-sortable": g.sortable ? "true" : null,
        "data-filterable": g.filter ? "true" : null,
        "data-filter-active": this.state.filterModel[g.field] ? "true" : null,
        "data-sort": _?.sort || null,
        "data-pinned": g.pinned || null
      }), g.width && (m.style.width = g.width + "px"), m.style.left = g.pinned === "left" ? f.left[g.field] + "px" : "", m.style.right = g.pinned === "right" ? f.right[g.field] + "px" : "", this._ensureHeaderChrome(m, g, _);
    }
  }
  _ensureHeaderChrome(e, t, s) {
    if (t._isRowNumber) {
      e.classList.add("sg-gutter-header"), e.textContent = "";
      return;
    }
    if (t._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let a = e.querySelector('input[type="checkbox"]');
      a || (a = h("input", { type: "checkbox", "aria-label": "Select all" }), a.addEventListener("change", (c) => {
        c.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(a));
      const d = this._displayList.filteredSorted.length, u = this.state.selection.size;
      a.checked = u > 0 && u >= d, a.indeterminate = u > 0 && u < d;
      return;
    }
    let n = e.querySelector(".sg-header-content");
    if (!n) {
      const a = e.textContent.trim();
      e.textContent = "", n = h("div", { class: "sg-header-content" }, [
        h("span", { class: "sg-header-label" }, a || t.headerName || t.field || "")
      ]), e.appendChild(n);
    }
    let o = n.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (o || (o = h("span", { class: "sg-sort-icon", "aria-hidden": "true" }), o.innerHTML = z, n.appendChild(o)), s && this.state.sortModel.length > 1) {
        let a = n.querySelector(".sg-sort-index");
        a || (a = h("span", { class: "sg-sort-index" }), n.appendChild(a)), a.textContent = String(this.state.sortModel.indexOf(s) + 1);
      } else
        n.querySelector(".sg-sort-index")?.remove();
    else o && o.remove();
    let r = n.querySelector(".sg-filter-icon");
    t.filter ? r || (r = h("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), r.innerHTML = _e, n.appendChild(r)) : r && r.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(h("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._displayList.pageRows;
    this._selKeys = this._computeCellSelKeys();
    const s = this.virtualValue || t.length > 200;
    let n = t, o = 0;
    if (s) {
      const c = this._viewport?.clientHeight || 400, p = this.state.rowHeight, f = ge(this.state.scrollTop, c, p, t.length, 8);
      o = f.first, n = t.slice(f.first, f.last);
    }
    const r = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((c) => {
      const p = c.dataset.rowId;
      p != null && r.set(p, c);
    });
    const a = document.createDocumentFragment(), d = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0, u = (c) => d + o + c + 1;
    if (s) {
      const c = this.state.rowHeight, p = o * c, f = (t.length - o - n.length) * c;
      a.appendChild(this._spacerRow(p, e.length)), n.forEach((g, m) => a.appendChild(this._buildRow(g, e, r, u(m)))), a.appendChild(this._spacerRow(f, e.length));
    } else
      n.forEach((c, p) => a.appendChild(this._buildRow(c, e, r, u(p))));
    this._tbody.replaceChildren(a);
  }
  _buildRow(e, t, s, n) {
    if (e.__sgGroup) return this._buildGroupRow(e, t, s);
    const o = String(this._rowId(e));
    let r = s.get(o);
    r || (r = h("tr")), r.dataset.rowId = o, r.classList.remove("sg-spacer");
    const a = this.state.selection.has(this._rowId(e));
    return G(r, { "data-selected": a ? "true" : null }), this._renderRow(r, e, t, n), r;
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const n = h("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return n.style.height = "0px", n.appendChild(h("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), n;
    }
    const s = h("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return s.style.height = e + "px", s.appendChild(h("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), s;
  }
  _renderRow(e, t, s, n) {
    e.innerHTML = "";
    const o = this._pinOffsets(), r = this._selKeys || { active: null, range: null }, a = String(this._rowId(t));
    for (const d of s) {
      const u = `${a}:${d.field}`, c = h("td", {
        "data-col-id": d.field,
        "data-pinned": d.pinned || null,
        "data-cell-active": r.active === u ? "true" : null,
        "data-cell-range": r.range && r.range.has(u) ? "true" : null
      });
      if (d.pinned === "left" ? c.style.left = o.left[d.field] + "px" : d.pinned === "right" && (c.style.right = o.right[d.field] + "px"), d._isRowNumber) {
        c.classList.add("sg-gutter-cell"), c.setAttribute("data-gutter", "true"), c.removeAttribute("data-cell-active"), c.removeAttribute("data-cell-range"), c.textContent = n != null ? String(n) : "", e.appendChild(c);
        continue;
      }
      if (d._isCheckbox) {
        c.classList.add("sg-checkbox-cell");
        const f = h("input", { type: "checkbox" });
        f.checked = this.state.selection.has(this._rowId(t)), c.appendChild(f), e.appendChild(c);
        continue;
      }
      if (d._isGroupCol) {
        c.classList.add("sg-group-leaf-cell"), c.removeAttribute("data-cell-active"), c.removeAttribute("data-cell-range"), e.appendChild(c);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === d.field) {
        c.setAttribute("data-editing", "true");
        const f = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : b(t, d), { node: g, control: m } = this._buildEditor(d, f);
        c.appendChild(g);
        const _ = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          m?.focus(), _ || m?.select?.();
        });
      } else
        this._renderCellContent(c, t, d);
      e.appendChild(c);
    }
  }
  _renderCellContent(e, t, s) {
    if (s.cellRenderer) {
      const n = N(s.cellRenderer);
      if (n) {
        const o = b(t, s), r = R(t, s);
        (n.dataset.bind || n.dataset.bindText !== void 0) && (n.textContent = n.dataset.bind ? String(t[n.dataset.bind] ?? "") : r), n.dataset.bindAttr && n.setAttribute(n.dataset.bindAttr, o), n.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((a) => {
          a.dataset.bindText !== void 0 ? a.textContent = r : a.dataset.bind && (a.textContent = String(t[a.dataset.bind] ?? "")), a.dataset.bindAttr && a.setAttribute(a.dataset.bindAttr, o);
        }), e.appendChild(n);
        return;
      }
    }
    e.textContent = R(t, s);
  }
  toggleGroup(e, t = 0) {
    this._groupExpanded.set(e, !this._isGroupExpanded(e, t)), this.scheduleRender("group"), v(this.element, "grid:groupToggled", { groupId: e, expanded: this._groupExpanded.get(e) });
  }
  expandAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = -1, this.scheduleRender("group");
  }
  collapseAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = 0, this.scheduleRender("group");
  }
  setRowGroupColumns(e) {
    this.state.group.cols = Array.isArray(e) ? e.slice() : [], this._groupExpanded.clear(), this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("group"), v(this.element, "grid:columnRowGroupChanged", { rowGroupCols: this.state.group.cols.slice() });
  }
  addRowGroupColumn(e) {
    !e || this.state.group.cols.includes(e) || this.setRowGroupColumns([...this.state.group.cols, e]);
  }
  removeRowGroupColumn(e) {
    this.setRowGroupColumns(this.state.group.cols.filter((t) => t !== e));
  }
  getRowGroupColumns() {
    return this.state.group.cols.slice();
  }
  setColumnAggFunc(e, t) {
    t == null ? delete this.state.group.aggs[e] : this.state.group.aggs[e] = t, this.scheduleRender("group"), v(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  // ----- Pivot mode -----
  // Toggling pivot mode rebuilds the display list (and therefore the visible
  // column set). Clears row + cell selection since the underlying cell graph
  // changes shape entirely.
  setPivotMode(e) {
    const t = !!e;
    this.state.pivot.mode !== t && (this.state.pivot.mode = t, this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), v(this.element, "grid:pivotModeChanged", { pivot: t }));
  }
  isPivotMode() {
    return !!this.state.pivot.mode;
  }
  setPivotColumns(e) {
    this.state.pivot.cols = Array.isArray(e) ? e.slice() : [], this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), v(this.element, "grid:columnPivotChanged", { pivotCols: this.state.pivot.cols.slice() });
  }
  addPivotColumn(e) {
    !e || this.state.pivot.cols.includes(e) || this.setPivotColumns([...this.state.pivot.cols, e]);
  }
  removePivotColumn(e) {
    this.setPivotColumns(this.state.pivot.cols.filter((t) => t !== e));
  }
  getPivotColumns() {
    return this.state.pivot.cols.slice();
  }
  // "Value columns" = fields with an entry in state.group.aggs. Same map as the
  // grouping aggregations — drives both the per-group totals (in plain grouping)
  // and the pivot cell aggregations (in pivot mode).
  getValueColumns() {
    return Object.entries(this.state.group.aggs).map(([e, t]) => ({ field: e, aggFunc: t }));
  }
  setValueColumns(e) {
    const t = {};
    for (const { field: s, aggFunc: n } of e || [])
      s && n && (t[s] = n);
    this.state.group.aggs = t, this.scheduleRender(this.state.pivot.mode ? "pivot" : "group"), v(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  addValueColumn(e, t = "sum") {
    e && this.setColumnAggFunc(e, t);
  }
  removeValueColumn(e) {
    this.setColumnAggFunc(e, null);
  }
  _buildGroupRow(e, t, s) {
    const n = `__g:${e.groupId}`;
    let o = s.get(n);
    return o || (o = h("tr")), o.dataset.rowId = n, o.dataset.group = "true", o.dataset.groupLevel = String(e.level), o.className = "sg-group-row", this._renderGroupRow(o, e, t), o;
  }
  _renderGroupRow(e, t, s) {
    e.innerHTML = "";
    const n = this._pinOffsets(), o = this._isGroupExpanded(t.groupId, t.level), r = (this.state.group.displayType || "singleColumn") === "singleColumn", a = !!(this.state.pivot?.mode && this._displayList?.pivot), d = t.__pivotAll === !0, u = s.filter((f) => !f._isRowNumber && !f._isCheckbox && !f._isGroupCol), c = u.some((f) => f.field === t.field) ? t.field : u[0]?.field, p = Math.max(0, t.level);
    d && e.classList.add("sg-pivot-all-row");
    for (const f of s) {
      const g = h("td", { "data-col-id": f.field, "data-pinned": f.pinned || null });
      if (f.pinned === "left" ? g.style.left = n.left[f.field] + "px" : f.pinned === "right" && (g.style.right = n.right[f.field] + "px"), f._isRowNumber || f._isCheckbox) {
        g.classList.add(f._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(g);
        continue;
      }
      if (a || r ? f._isGroupCol : f.field === c) {
        if (g.classList.add("sg-group-cell"), g.style.paddingLeft = `${8 + p * 18}px`, !d) {
          const _ = h("span", {
            class: "sg-group-caret",
            "data-expanded": o ? "true" : "false",
            "aria-hidden": "true"
          });
          _.innerHTML = z, g.appendChild(_);
        }
        g.append(
          h("span", { class: "sg-group-label" }, this._groupValueLabel(t)),
          h("span", { class: "sg-group-count" }, ` (${t.count})`)
        );
      } else if (a && f._isPivot) {
        const _ = b(t, f);
        _ != null && (g.classList.add("sg-agg-cell"), g.textContent = this._formatAggregate(_));
      } else !f._isGroupCol && t.aggregates && t.aggregates[f.field] != null && (g.classList.add("sg-agg-cell"), g.textContent = this._formatAggregate(t.aggregates[f.field]));
      e.appendChild(g);
    }
  }
  _groupValueLabel(e) {
    const t = e.value;
    if (t == null || t === "") return "(Blanks)";
    const s = this._colByField(e.field);
    return s ? R({ [e.field]: t }, s) : String(t);
  }
  _formatAggregate(e) {
    return e == null ? "" : typeof e == "number" ? Number.isInteger(e) ? String(e) : String(Math.round(e * 100) / 100) : String(e);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, t) {
    if (e.cellEditor) {
      const n = N(e.cellEditor);
      if (n) {
        const o = n.matches?.("input,select,textarea") ? n : n.querySelector?.("[data-editor-input]") || n.querySelector?.("input,select,textarea");
        return o && (this._seedEditorValue(o, e, t), o.addEventListener("keydown", this._onEditorKey), o.addEventListener("blur", this._onEditorBlur)), { node: n, control: o };
      }
    }
    const s = this._buildEditorInput(e, t);
    return { node: s, control: s };
  }
  _seedEditorValue(e, t, s) {
    if (t.type === "date" && s) {
      const n = s instanceof Date ? s : new Date(s);
      e.value = Number.isNaN(n?.getTime?.()) ? s ?? "" : n.toISOString().slice(0, 10);
    } else t.type === "boolean" ? e.value = s === !0 ? "true" : s === !1 ? "false" : "" : e.value = s ?? "";
  }
  _buildEditorInput(e, t) {
    let s;
    if (e.type === "number") s = h("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const n = t instanceof Date ? t : t ? new Date(t) : null, o = n ? n.toISOString().slice(0, 10) : "";
      s = h("input", { type: "date", value: o });
    } else e.type === "boolean" ? (s = h("select"), s.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : s = h("input", { type: "text", value: t ?? "" });
    return s.addEventListener("keydown", this._onEditorKey), s.addEventListener("blur", this._onEditorBlur), s;
  }
  _renderPagination() {
    this.state.pagination.enabled;
  }
  // ----- Status bar (rows · selection · range aggregates) -----
  _renderStatusBar() {
    if (!this._statusBar) return;
    const e = this._statusBar.querySelector(".sg-status-left"), t = this._statusBar.querySelector(".sg-status-right");
    e.replaceChildren();
    const s = this.state.serverSide ? this.state.serverRowCount : this.state.rowData.length, n = this._displayList.grouped ? this._displayList.leafCount ?? this.filteredCount() : this.filteredCount();
    e.appendChild(this._statusPanel(
      "Rows",
      this._fmtInt(n),
      n !== s ? `of ${this._fmtInt(s)}` : null
    ));
    const o = this.state.selection.size;
    o > 0 && e.appendChild(this._statusPanel("Selected", this._fmtInt(o))), t.replaceChildren();
    const r = this.getRangeAggregates();
    if (r && r.count > 0) {
      const d = (this.statusBarAggsValue || []).filter((u) => u in r);
      for (const u of d) {
        const c = r[u];
        c == null && u !== "count" || t.appendChild(this._statusPanel(this._aggLabel(u), this._fmtAgg(u, c)));
      }
    }
    const a = r ? `${r.count}|${r.sum}|${r.avg}|${r.min}|${r.max}` : "";
    a !== this._lastRangeAggs && (this._lastRangeAggs = a, v(this.element, "grid:rangeAggsChanged", { aggs: r }));
  }
  _statusPanel(e, t, s = null) {
    const n = h("div", { class: "sg-status-panel" });
    return n.append(
      h("span", { class: "sg-status-label" }, `${e}:`),
      h("span", { class: "sg-status-value" }, t)
    ), s && n.appendChild(h("span", { class: "sg-status-aside" }, s)), n;
  }
  _fmtInt(e) {
    return Number(e).toLocaleString();
  }
  _aggLabel(e) {
    return { count: "Count", sum: "Sum", avg: "Avg", min: "Min", max: "Max" }[e] || e;
  }
  _fmtAgg(e, t) {
    return t == null ? "—" : e === "count" ? this._fmtInt(t) : typeof t == "number" ? Number.isInteger(t) ? this._fmtInt(t) : (Math.round(t * 100) / 100).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(t);
  }
  // Flat list of RAW cell values across every active range — fed to
  // aggregateRange to compute the status-bar numbers. Skips group rows and
  // the structural columns (gutter / checkbox / auto-group).
  _cellRangeRawValues() {
    const e = [];
    for (const t of this.state.cellSel.ranges) {
      const s = this._rangeRect(t);
      if (s)
        for (let n = s.r0; n <= s.r1; n++) {
          const o = s.rows[n];
          if (!(!o || o.__sgGroup))
            for (let r = s.c0; r <= s.c1; r++) {
              const a = s.cols[r];
              !a || a._isCheckbox || a._isRowNumber || a._isGroupCol || e.push(b(o, a));
            }
        }
    }
    return e;
  }
  getRangeAggregates() {
    return this.state.cellSel.ranges.length ? re(this._cellRangeRawValues()) : null;
  }
  // ----- Event delegation (clicks on rendered tbody) -----
  // Stimulus actions on tbody — wired in _buildChrome by adding data-action.
  // For simplicity we add native listeners here.
  _attachBodyListeners() {
    this._listenersAttached || (this._listenersAttached = !0, this._tbody.addEventListener("click", (e) => this._onBodyClick(e)), this._tbody.addEventListener("dblclick", (e) => this._onBodyDblClick(e)), this._tbody.addEventListener("mousedown", this._onCellMouseDown), this._tbody.addEventListener("mouseover", this._onCellMouseOver), document.addEventListener("mouseup", this._onCellMouseUp), document.addEventListener("copy", this._onCopy), this._viewport.addEventListener("scroll", this._onScroll, { passive: !0 }));
  }
  _onBodyClick(e) {
    const t = e.target.closest("tr");
    if (!t) return;
    if (t.dataset.group === "true") {
      this.toggleGroup(t.dataset.rowId.replace(/^__g:/, ""), Number(t.dataset.groupLevel) || 0);
      return;
    }
    if (e.target.closest('td[data-editing="true"]')) return;
    const s = this._coerceRowId(t.dataset.rowId), n = e.target.closest("td");
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(s, "toggle");
      return;
    }
    if (n && n.dataset.gutter === "true") {
      if (this._rowDragMoved) {
        this._rowDragMoved = !1;
        return;
      }
      if (this.rowSelectionValue !== "") {
        const r = e.shiftKey ? "range" : e.metaKey || e.ctrlKey ? "toggle" : "replace";
        this.clearCellSelection(), this.toggleRowSelection(s, r), v(this.element, "grid:rowClicked", { rowId: s, row: this.state.rowData.find((a) => this._rowId(a) === s), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (n) {
      const r = this.state.rowData.find((d) => this._rowId(d) === s), a = n.dataset.colId;
      v(this.element, "grid:cellClicked", { rowId: s, colId: a, value: r?.[a], event: e });
    }
    if (this.cellSelectionValue) {
      if (this._cellDragMoved) {
        this._cellDragMoved = !1;
        return;
      }
      !e.shiftKey && !(e.metaKey || e.ctrlKey) && this.state.selection.size && this.deselectAll();
      return;
    }
    if (this.suppressRowClickSelectionValue || this.rowSelectionValue === "") {
      this._cellDragMoved = !1;
      return;
    }
    if (this._cellDragMoved) {
      this._cellDragMoved = !1;
      return;
    }
    const o = e.shiftKey ? "range" : e.metaKey || e.ctrlKey || this.rowMultiSelectWithClickValue ? "toggle" : "replace";
    this.toggleRowSelection(s, o), v(this.element, "grid:rowClicked", { rowId: s, row: this.state.rowData.find((r) => this._rowId(r) === s), event: e });
  }
  // ----- Cell selection (Numbers/Sheets-style: multi-range + active cell) -----
  _cellAt(e) {
    const t = e.closest?.("td"), s = e.closest?.("tr");
    return !t || !s || s.dataset.group === "true" || t.classList.contains("sg-checkbox-cell") || t.classList.contains("sg-group-leaf-cell") || t.dataset.gutter === "true" || !t.dataset.colId || t.dataset.editing === "true" ? null : { rowId: this._coerceRowId(s.dataset.rowId), colId: t.dataset.colId };
  }
  _activeCell() {
    const e = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
    return e ? e.anchor : null;
  }
  _setSingleCellSel(e) {
    this.state.cellSel = { ranges: [{ anchor: e, focus: e }], activeIdx: 0 };
  }
  _addCellRange(e) {
    this.state.cellSel.ranges.push({ anchor: e, focus: e }), this.state.cellSel.activeIdx = this.state.cellSel.ranges.length - 1;
  }
  _extendActiveRange(e) {
    const t = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
    t ? t.focus = e : this._setSingleCellSel(e);
  }
  clearCellSelection() {
    this.state.cellSel = { ranges: [], activeIdx: -1 }, this._applyCellSelHighlight();
  }
  _startRowDrag(e) {
    const t = Array.from(this.state.selection).map(String), s = new Set(t.includes(String(e)) ? t : [String(e)]), n = h("div", { class: "sg-drag-ghost sg-grid" }), o = h("table"), r = h("tbody");
    let a = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((u) => {
      if (s.has(u.dataset.rowId) && a < 6) {
        const c = u.cloneNode(!0);
        c.removeAttribute("data-selected"), c.querySelectorAll("td").forEach((p) => {
          p.style.left = "", p.style.right = "", p.removeAttribute("data-pinned"), p.removeAttribute("data-cell-active"), p.removeAttribute("data-cell-range");
        }), r.appendChild(c), a += 1;
      }
    }), o.appendChild(r), n.appendChild(o), s.size > a && n.appendChild(h("div", { class: "sg-drag-ghost-more" }, `+${s.size - a} more rows`)), n.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(n);
    const d = h("div", { class: "sg-drop-indicator" });
    document.body.appendChild(d), this._rowDrag = { ids: s, ghost: n, indicator: d, dropRowId: null, dropBefore: !0 }, document.body.classList.add("sg-row-dragging");
  }
  _updateDropIndicator(e) {
    const t = Array.from(this._tbody.querySelectorAll("tr[data-row-id]"));
    let s = null, n = !0;
    for (const d of t) {
      const u = d.getBoundingClientRect();
      if (e < u.top + u.height / 2) {
        s = d, n = !0;
        break;
      }
      s = d, n = !1;
    }
    if (!s) return;
    const o = s.getBoundingClientRect(), r = this._viewport.getBoundingClientRect(), a = this._rowDrag.indicator;
    a.style.left = `${r.left}px`, a.style.width = `${r.width}px`, a.style.top = `${(n ? o.top : o.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(s.dataset.rowId), this._rowDrag.dropBefore = n;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: s, dropRowId: n, dropBefore: o } = this._rowDrag;
    if (t.remove(), s.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, n == null || e.has(String(n))) return;
    const r = this.state.rowData, a = r.filter((c) => e.has(String(this._rowId(c)))), d = r.filter((c) => !e.has(String(this._rowId(c))));
    let u = d.findIndex((c) => this._rowId(c) === n);
    u < 0 ? u = d.length : o || (u += 1), d.splice(u, 0, ...a), this.state.rowData = d, this.state.sortModel = [], this.scheduleRender("data"), v(this.element, "grid:rowDragEnd", {
      ids: a.map((c) => this._rowId(c)),
      toRowId: n,
      before: o
    });
  }
  // Toggle the active/range data-attrs on the existing cell DOM without
  // rebuilding the tbody (so in-flight mouse interactions aren't disrupted).
  _applyCellSelHighlight() {
    const e = this._computeCellSelKeys();
    this._selKeys = e, this._tbody && (this._tbody.querySelectorAll("td[data-col-id]").forEach((t) => {
      const s = t.parentElement, n = `${s && s.dataset.rowId}:${t.dataset.colId}`;
      e.active === n ? t.setAttribute("data-cell-active", "true") : t.removeAttribute("data-cell-active"), e.range && e.range.has(n) ? t.setAttribute("data-cell-range", "true") : t.removeAttribute("data-cell-range");
    }), this._renderStatusBar());
  }
  // Rectangle (display indices) for a {anchor,focus} range, or null.
  _rangeRect(e) {
    if (!e) return null;
    const t = this._displayList.pageRows, s = this._visibleCols(), n = (c) => t.findIndex((p) => this._rowId(p) === c), o = (c) => s.findIndex((p) => p.field === c), r = n(e.anchor.rowId), a = o(e.anchor.colId);
    if (r < 0 || a < 0) return null;
    const d = n(e.focus.rowId), u = o(e.focus.colId);
    return {
      r0: Math.min(r, d < 0 ? r : d),
      r1: Math.max(r, d < 0 ? r : d),
      c0: Math.min(a, u < 0 ? a : u),
      c1: Math.max(a, u < 0 ? a : u),
      rows: t,
      cols: s
    };
  }
  _activeRect() {
    return this._rangeRect(this.state.cellSel.ranges[this.state.cellSel.activeIdx]);
  }
  _cellRangeRows(e = this._activeRect()) {
    if (!e) return [];
    const t = [];
    for (let s = e.r0; s <= e.r1; s++) {
      const n = e.rows[s];
      if (!n) continue;
      const o = [];
      for (let r = e.c0; r <= e.c1; r++) {
        const a = e.cols[r];
        a && o.push(R(n, a));
      }
      t.push(o);
    }
    return t;
  }
  // Active cell key + union of all ranges' cells (active stays outlined, unfilled).
  _computeCellSelKeys() {
    const e = this._activeCell();
    if (!e) return { active: null, range: null };
    const t = `${e.rowId}:${e.colId}`, s = /* @__PURE__ */ new Set();
    for (const n of this.state.cellSel.ranges) {
      const o = this._rangeRect(n);
      if (o)
        for (let r = o.r0; r <= o.r1; r++) {
          const a = o.rows[r];
          if (a)
            for (let d = o.c0; d <= o.c1; d++) {
              const u = o.cols[d];
              if (!u) continue;
              const c = `${this._rowId(a)}:${u.field}`;
              c !== t && s.add(c);
            }
        }
    }
    return { active: t, range: s };
  }
  getCellSelectionDetail() {
    const e = this._activeRect();
    return {
      active: this._activeCell(),
      ranges: this.state.cellSel.ranges.length,
      rowCount: e ? e.r1 - e.r0 + 1 : 0,
      colCount: e ? e.c1 - e.c0 + 1 : 0
    };
  }
  // Row ids covered by any cell range.
  getCellSelectionRowIds() {
    const e = /* @__PURE__ */ new Set();
    for (const t of this.state.cellSel.ranges) {
      const s = this._rangeRect(t);
      if (s)
        for (let n = s.r0; n <= s.r1; n++) {
          const o = s.rows[n];
          o && e.add(this._rowId(o));
        }
    }
    return Array.from(e);
  }
  _focusGrid() {
    if (document.activeElement !== this.element && !this.element.contains(document.activeElement))
      try {
        this.element.focus({ preventScroll: !0 });
      } catch {
      }
  }
  // ----- Keyboard navigation (Numbers/Sheets-style) -----
  _navCols() {
    return this._visibleCols().filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol);
  }
  _moveActiveCell(e, t, s) {
    const n = this._displayList.pageRows, o = this._navCols();
    if (!n.length || !o.length) return;
    const r = (p, f, g) => Math.max(f, Math.min(p, g)), a = this._activeCell(), d = () => n.findIndex((p) => !p.__sgGroup);
    let u = a ? n.findIndex((p) => this._rowId(p) === a.rowId) : d(), c = a ? o.findIndex((p) => p.field === a.colId) : 0;
    if (u < 0 && (u = d()), !(u < 0)) {
      if (c < 0 && (c = 0), s && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const p = this.state.cellSel.ranges[this.state.cellSel.activeIdx], f = r(n.findIndex((m) => this._rowId(m) === p.focus.rowId) + e, 0, n.length - 1), g = r(o.findIndex((m) => m.field === p.focus.colId) + t, 0, o.length - 1);
        this._extendActiveRange({ rowId: this._rowId(n[f]), colId: o[g].field });
      } else {
        let p = r(u + e, 0, n.length - 1);
        if (e !== 0) {
          for (; n[p] && n[p].__sgGroup; ) {
            const g = p + e;
            if (g < 0 || g >= n.length) break;
            p = g;
          }
          if (!n[p] || n[p].__sgGroup) return;
        }
        const f = r(c + t, 0, o.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(n[p]), colId: o[f].field });
      }
      this._applyCellSelHighlight(), this._scrollActiveIntoView(), v(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    }
  }
  _selectAllCells() {
    const e = this._displayList.pageRows, t = this._navCols();
    !e.length || !t.length || (this.state.cellSel = {
      ranges: [{
        anchor: { rowId: this._rowId(e[0]), colId: t[0].field },
        focus: { rowId: this._rowId(e[e.length - 1]), colId: t[t.length - 1].field }
      }],
      activeIdx: 0
    }, this._applyCellSelHighlight(), v(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
  }
  // Clear the value of every selected, editable cell (Delete/Backspace).
  _clearSelectedCells() {
    let e = !1;
    for (const t of this.state.cellSel.ranges) {
      const s = this._rangeRect(t);
      if (s)
        for (let n = s.r0; n <= s.r1; n++) {
          const o = s.rows[n];
          if (!(!o || o.__sgGroup))
            for (let r = s.c0; r <= s.c1; r++) {
              const a = s.cols[r];
              if (!a || !a.editable || a._isCheckbox || a._isRowNumber) continue;
              const d = o[a.field];
              d === "" || d == null || (o[a.field] = "", e = !0, v(this.element, "grid:cellValueChanged", { rowId: this._rowId(o), colId: a.field, oldValue: d, newValue: "" }));
            }
        }
    }
    return e && this.scheduleRender("cells"), e;
  }
  _scrollActiveIntoView() {
    this._tbody?.querySelector('td[data-cell-active="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  _onBodyDblClick(e) {
    const t = e.target.closest("tr"), s = e.target.closest("td");
    if (!t || !s || s.dataset.editing === "true") return;
    const n = this._coerceRowId(t.dataset.rowId), o = s.dataset.colId;
    this.startEditingCell(n, o);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const s = this._visibleCols().filter((p) => p.editable && !p._isCheckbox), n = this._displayList.pageRows, o = n.findIndex((p) => this._rowId(p) === t.rowId), r = s.findIndex((p) => p.field === t.colId);
    if (!s.length || !n.length || o < 0 || r < 0) {
      this.stopEditing(!1);
      return;
    }
    const a = n.length * s.length, d = (o * s.length + r + e + a) % a, u = n[Math.floor(d / s.length)], c = s[d % s.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(u), c.field), requestAnimationFrame(() => {
      this._navigatingEditor = !1;
    });
  }
  // Wire editor listeners whenever a cell mounts an input.
  // Done lazily via MutationObserver on tbody (cheap because tbody is small per page).
  // ----- Helpers -----
  _visibleCols() {
    const e = this.state.columnDefs.filter((r) => !r.hidden), t = this.state.group?.cols || [];
    if (this.state.pivot?.mode && this._displayList?.pivotResultColumns?.length)
      return [{
        field: "__group",
        headerName: t.length ? t.map((a) => this._colByField(a)?.headerName || a).join(" → ") : "",
        _isGroupCol: !0,
        width: t.length ? 220 : 90,
        sortable: !1,
        filter: null,
        resizable: !1
      }, ...this._displayList.pivotResultColumns];
    if (!t.length) return e;
    if ((this.state.group.displayType || "singleColumn") === "singleColumn") {
      const r = new Set(t);
      return [{
        field: "__group",
        headerName: "Group",
        _isGroupCol: !0,
        width: 240,
        sortable: !1,
        filter: null,
        resizable: !1
      }, ...e.filter((d) => !r.has(d.field))];
    }
    if (this.groupReorderColumnsValue === !1) return e;
    const n = t.map((r) => e.find((a) => a.field === r)).filter(Boolean), o = new Set(n);
    return [...n, ...e.filter((r) => !o.has(r))];
  }
  _pinOffsets() {
    const e = this._visibleCols(), t = {};
    let s = 0;
    for (const o of e)
      o.pinned === "left" && (t[o.field] = s, s += o.width || 150);
    const n = {};
    s = 0;
    for (let o = e.length - 1; o >= 0; o--) {
      const r = e[o];
      r.pinned === "right" && (n[r.field] = s, s += r.width || 150);
    }
    return { left: t, right: n };
  }
  _colByField(e) {
    return this.state.columnDefs.find((t) => t.field === e);
  }
  _rowId(e) {
    return e?.[this.getRowIdValue] ?? e?.id ?? e;
  }
  _coerceRowId(e) {
    if (e == null) return e;
    const t = Number(e);
    return Number.isFinite(t) && String(t) === e ? t : e;
  }
}
w(P, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: B },
  rowHeight: { type: Number, default: me },
  headerHeight: { type: Number, default: 36 },
  virtual: { type: Boolean, default: !1 },
  virtualThreshold: { type: Number, default: 200 },
  height: { type: String, default: "" },
  // CSS height, e.g. '480px'
  getRowId: { type: String, default: "id" },
  // field name for row identity
  domLayout: { type: String, default: "" },
  // '' | 'autoHeight'
  serverSide: { type: Boolean, default: !1 },
  // rowData is one server page
  rowCount: { type: Number, default: 0 },
  // total rows on the server
  cellSelection: { type: Boolean, default: !0 },
  // click=cell; modifier/checkbox=row
  rowDrag: { type: Boolean, default: !1 },
  // drag selected rows by the gutter to reorder
  rowGroupCols: { type: Array, default: [] },
  // fields to group rows by (in hierarchy order)
  aggFuncs: { type: Object, default: {} },
  // { field: 'sum'|'avg'|'min'|'max'|'count'|'first'|'last' }
  groupDefaultExpanded: { type: Number, default: -1 },
  // -1 all expanded · 0 none · N first-N levels
  groupReorderColumns: { type: Boolean, default: !0 },
  // (inline mode) float grouped columns to the front while grouping
  groupDisplayType: { type: String, default: "singleColumn" },
  // 'singleColumn' (auto Group col on left) | 'inline' (label in grouped col)
  statusBar: { type: Boolean, default: !1 },
  // bottom footer: row counts + range aggregates
  statusBarAggs: { type: Array, default: ["count", "sum", "avg", "min", "max"] },
  // which aggs to show for a cell range (subset, in order)
  pivotMode: { type: Boolean, default: !1 },
  // reshape into a pivot table (rowGroupCols × pivotCols)
  pivotCols: { type: Array, default: [] },
  // fields whose unique values become columns
  sidePanel: { type: Boolean, default: !1 }
  // right-side tool panel for groups/pivots/values
});
function ve(l, i) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (l[t] !== i[t]) return !1;
  return !0;
}
function we(l) {
  return l === "number" || l === "date" ? [
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "lessThan", label: "Less than" },
    { value: "greaterThan", label: "Greater than" },
    { value: "inRange", label: "In range" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" }
  ] : l === "boolean" ? [
    { value: "equals", label: "Equals" }
  ] : [
    { value: "contains", label: "Contains" },
    { value: "notContains", label: "Not contains" },
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "startsWith", label: "Starts with" },
    { value: "endsWith", label: "Ends with" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" }
  ];
}
function Ce(l, i) {
  if (i === "number") {
    const e = Number(l);
    return Number.isFinite(e) ? e : l;
  }
  return i === "date" ? l : i === "boolean" ? l === "true" ? !0 : l === "false" ? !1 : null : l;
}
function E(l) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(l)) : String(l).replace(/["\\\n\r]/g, (i) => "\\" + i);
}
class k extends x {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    w(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, s = e.clientY;
      let n = !1;
      const o = (a) => {
        const d = Math.abs(a.clientX - t), u = Math.abs(a.clientY - s);
        !n && (d > 5 || u > 5) && (n = !0, document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", r), this._beginReorder(t));
      }, r = (a) => {
        document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", r), n || this.sort(a);
      };
      document.addEventListener("mousemove", o), document.addEventListener("mouseup", r);
    });
  }
  connect() {
    if (this.grid = fe(this.element, "grid", this.application), !!this.grid) {
      if (!this.headerNameValue) {
        const e = this.element.textContent.trim();
        e && (this.headerNameValue = e);
      }
      this.grid.registerColumn(this.toColumnDef(), this.element), !this.checkboxValue && !this.rowNumberValue && this.element.addEventListener("mousedown", this._onMouseDown);
    }
  }
  disconnect() {
    this.element.removeEventListener("mousedown", this._onMouseDown), this.grid?.unregisterColumn(this.fieldValue);
  }
  toColumnDef() {
    return {
      field: this.fieldValue,
      headerName: this.headerNameValue || this.fieldValue,
      type: this.typeValue,
      sortable: this.sortableValue,
      filter: this.filterValue || null,
      editable: this.editableValue,
      width: this.widthValue || void 0,
      minWidth: this.minWidthValue,
      maxWidth: this.maxWidthValue,
      pinned: this.pinnedValue || null,
      hidden: this.hiddenValue,
      resizable: this.resizableValue,
      cellRenderer: this.cellRendererValue || null,
      cellEditor: this.cellEditorValue || null,
      _isCheckbox: this.checkboxValue,
      _isRowNumber: this.rowNumberValue,
      sortable: this.rowNumberValue ? !1 : this.sortableValue,
      resizable: this.rowNumberValue ? !1 : this.resizableValue
    };
  }
  _beginReorder(e) {
    if (!this.grid) return;
    const t = this.element.parentElement, s = Array.from(t.children), n = s.indexOf(this.element);
    let o = n;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const r = (d) => {
      const u = d.clientX;
      let c = s.length;
      for (let p = 0; p < s.length; p++) {
        const f = s[p].getBoundingClientRect();
        if (u < f.left + f.width / 2) {
          c = p;
          break;
        }
      }
      o = c > n ? c - 1 : c;
    }, a = () => {
      document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", a), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", o !== n && this.grid.moveColumn(this.fieldValue, o);
    };
    document.addEventListener("mousemove", r), document.addEventListener("mouseup", a);
  }
  sort(e) {
    !this.sortableValue || !this.grid || this.grid.toggleSort(this.fieldValue, e?.shiftKey === !0);
  }
  openFilter(e) {
    e?.stopPropagation(), this.grid && this.grid.openFilterFor(this.fieldValue, this.element);
  }
  // Resize: drag handle adjusts column width live.
  startResize(e) {
    if (!this.resizableValue || !this.grid) return;
    e.preventDefault(), e.stopPropagation();
    const t = e.clientX, s = this.element.offsetWidth, n = (r) => this.grid.setColumnWidth(this.fieldValue, s + (r.clientX - t)), o = () => {
      document.removeEventListener("mousemove", n), document.removeEventListener("mouseup", o), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", n), document.addEventListener("mouseup", o), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
w(k, "values", {
  field: String,
  headerName: { type: String, default: "" },
  type: { type: String, default: "text" },
  // text|number|date|boolean
  sortable: { type: Boolean, default: !1 },
  filter: { type: String, default: "" },
  // ''|text|number|date|boolean|set
  editable: { type: Boolean, default: !1 },
  width: { type: Number, default: 0 },
  minWidth: { type: Number, default: 40 },
  maxWidth: { type: Number, default: 4e3 },
  pinned: { type: String, default: "" },
  // ''|left|right
  hidden: { type: Boolean, default: !1 },
  resizable: { type: Boolean, default: !0 },
  cellRenderer: { type: String, default: "" },
  cellEditor: { type: String, default: "" },
  checkbox: { type: Boolean, default: !1 },
  rowNumber: { type: Boolean, default: !1 }
  // gutter: shows 1-based row number, click selects row
});
class j extends x {
  connect() {
  }
}
class U extends x {
  connect() {
  }
}
class X extends x {
  connect() {
  }
}
class L extends x {
  constructor() {
    super(...arguments);
    w(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), s = e.paginationGetTotalPages(), n = e.paginationGetRowCount(), o = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const r = n === 0 ? 0 : t * o + 1, a = Math.min(n, r + o - 1);
        this.pageInfoTarget.textContent = n === 0 ? "0 rows" : `${r}–${a} of ${n}`;
      }
      this.hasFirstTarget && (this.firstTarget.disabled = t === 0), this.hasPrevTarget && (this.prevTarget.disabled = t === 0), this.hasNextTarget && (this.nextTarget.disabled = t >= s - 1), this.hasLastTarget && (this.lastTarget.disabled = t >= s - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(o));
    });
  }
  connect() {
    this.element.classList.add("sg-pagination-bar"), this.hasGridOutlet && this._wire(this.gridOutletElement);
  }
  disconnect() {
    this._gridEl && this._unwire(this._gridEl);
  }
  gridOutletConnected(e, t) {
    this._wire(t);
  }
  gridOutletDisconnected(e, t) {
    this._unwire(t);
  }
  _wire(e) {
    this._gridEl = e;
    for (const t of ["grid:paginationChanged", "grid:rowDataChanged", "grid:filterChanged", "grid:ready"])
      e.addEventListener(t, this._refresh);
    e.gridApi && this._refresh();
  }
  _unwire(e) {
    for (const t of ["grid:paginationChanged", "grid:rowDataChanged", "grid:filterChanged", "grid:ready"])
      e.removeEventListener(t, this._refresh);
    this._gridEl = null;
  }
  first() {
    this._gridEl?.gridApi?.paginationGoToFirstPage();
  }
  prev() {
    this._gridEl?.gridApi?.paginationGoToPreviousPage();
  }
  next() {
    this._gridEl?.gridApi?.paginationGoToNextPage();
  }
  last() {
    this._gridEl?.gridApi?.paginationGoToLastPage();
  }
  changeSize(e) {
    const t = parseInt(e.target.value, 10);
    Number.isFinite(t) && t > 0 && this._gridEl?.gridApi?.paginationSetPageSize(t);
  }
}
w(L, "outlets", ["grid"]), w(L, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
const M = ["sum", "avg", "count", "min", "max"], be = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', ye = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class Y extends x {
  connect() {
    this.grid = this.element.closest(".sg-grid"), this._activeTab = "columns", this._collapsed = !1, this._build(), this.grid?.gridApi ? this._render() : this.grid && this.grid.addEventListener("grid:ready", () => this._render(), { once: !0 }), this._gridListener = () => this._render();
    for (const i of [
      "grid:columnRowGroupChanged",
      "grid:columnPivotChanged",
      "grid:columnValueChanged",
      "grid:pivotModeChanged",
      "grid:columnVisible",
      "grid:rowDataChanged"
    ]) this.grid?.addEventListener(i, this._gridListener);
  }
  disconnect() {
    if (!(!this.grid || !this._gridListener))
      for (const i of [
        "grid:columnRowGroupChanged",
        "grid:columnPivotChanged",
        "grid:columnValueChanged",
        "grid:pivotModeChanged",
        "grid:columnVisible",
        "grid:rowDataChanged"
      ]) this.grid.removeEventListener(i, this._gridListener);
  }
  // ----- Skeleton -----
  _build() {
    this.element.innerHTML = "", this._content = h("div", { class: "sg-side-panel-content" });
    const i = h("div", { class: "sg-side-panel-tabs" });
    this._columnsTab = h("button", {
      type: "button",
      class: "sg-side-panel-tab",
      "aria-pressed": "true",
      title: "Columns"
    }), this._columnsTab.innerHTML = be, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), i.appendChild(this._columnsTab), this.element.append(this._content, i);
  }
  _onTabClick(i) {
    this._activeTab === i && !this._collapsed ? (this._collapsed = !0, this.element.classList.add("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", "false")) : (this._collapsed = !1, this._activeTab = i, this.element.classList.remove("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", i === "columns" ? "true" : "false"), this._render());
  }
  // ----- Helpers -----
  _api() {
    return this.grid?.gridApi;
  }
  // Real (non-synthetic) columns the user can manipulate.
  _columns() {
    return (this._api()?.getColumnDefs() || []).filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol && !e._isPivot);
  }
  _colByField(i) {
    return (this._api()?.getColumnDefs() || []).find((e) => e.field === i);
  }
  // ----- Render -----
  _render() {
    if (this._collapsed || this._activeTab !== "columns") return;
    const i = this._api();
    if (!i) return;
    this._content.innerHTML = "";
    const e = h("label", { class: "sg-panel-pivot-toggle" }), t = h("input", { type: "checkbox" });
    t.checked = i.isPivotMode(), t.addEventListener("change", () => i.setPivotMode(t.checked)), e.append(t, h("span", {}, "Pivot mode")), this._content.appendChild(e), this._content.appendChild(this._renderColumnsList()), this._content.appendChild(this._renderDropSection({
      title: "Row Groups",
      placeholder: "Drag here to group rows",
      kind: "rowGroup",
      fields: i.getRowGroupColumns()
    })), this._content.appendChild(this._renderValuesSection()), i.isPivotMode() && this._content.appendChild(this._renderDropSection({
      title: "Column Labels",
      placeholder: "Drag here to pivot columns",
      kind: "pivot",
      fields: i.getPivotColumns()
    }));
  }
  _renderColumnsList() {
    const i = this._api(), e = h("div", { class: "sg-panel-section" });
    e.appendChild(h("div", { class: "sg-panel-section-title" }, "Columns"));
    const t = h("ul", { class: "sg-column-list" });
    e.appendChild(t);
    const s = new Set(i.getRowGroupColumns()), n = new Set(i.getPivotColumns()), o = new Map(i.getValueColumns().map((r) => [r.field, r.aggFunc]));
    for (const r of this._columns()) {
      const a = h("li", { class: "sg-column-list-item", draggable: "true" });
      a.dataset.field = r.field;
      const d = h("span", { class: "sg-column-grip", "aria-hidden": "true" });
      d.innerHTML = ye;
      const u = h("input", { type: "checkbox" });
      u.checked = !r.hidden, u.addEventListener("change", () => i.setColumnVisible(r.field, u.checked));
      const c = h("span", { class: "sg-column-list-label" }, r.headerName || r.field), p = h("span", { class: "sg-column-list-tags" });
      s.has(r.field) && p.appendChild(h("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), n.has(r.field) && p.appendChild(h("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), o.has(r.field) && p.appendChild(h("span", { class: "sg-tag sg-tag-value", title: `Value (${o.get(r.field)})` }, o.get(r.field))), a.append(d, u, c, p), this._wireDragSource(a, r.field), t.appendChild(a);
    }
    return this._wireDropZone(t, "columns"), e;
  }
  _renderDropSection({ title: i, placeholder: e, kind: t, fields: s }) {
    const n = h("div", { class: "sg-panel-section sg-panel-drop" });
    n.appendChild(h("div", { class: "sg-panel-section-title" }, i));
    const o = h("div", { class: "sg-drop-zone" });
    if (o.dataset.dropKind = t, !s.length)
      o.classList.add("sg-drop-zone-empty"), o.appendChild(h("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const r of s) o.appendChild(this._renderChip(t, r));
    return this._wireDropZone(o, t), n.appendChild(o), n;
  }
  _renderValuesSection() {
    const i = this._api(), e = h("div", { class: "sg-panel-section sg-panel-drop" });
    e.appendChild(h("div", { class: "sg-panel-section-title" }, "Values"));
    const t = h("div", { class: "sg-drop-zone" });
    t.dataset.dropKind = "value";
    const s = i.getValueColumns();
    if (!s.length)
      t.classList.add("sg-drop-zone-empty"), t.appendChild(h("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
    else
      for (const { field: n, aggFunc: o } of s) t.appendChild(this._renderValueChip(n, o));
    return this._wireDropZone(t, "value"), e.appendChild(t), e;
  }
  _renderChip(i, e) {
    const t = this._colByField(e), s = h("span", { class: "sg-chip", draggable: "true" });
    return s.dataset.field = e, s.dataset.fromKind = i, s.append(
      h("span", { class: "sg-chip-label" }, t?.headerName || e),
      this._removeButton(() => this._removeFrom(i, e))
    ), this._wireDragSource(s, e), s;
  }
  _renderValueChip(i, e) {
    const t = this._api(), s = this._colByField(i), n = h("span", { class: "sg-chip sg-chip-value", draggable: "true" });
    n.dataset.field = i, n.dataset.fromKind = "value";
    const o = h("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return o.addEventListener("click", (r) => {
      r.stopPropagation();
      const a = M.indexOf(e), d = M[(a === -1 ? 0 : a + 1) % M.length];
      t.setColumnAggFunc(i, d);
    }), n.append(
      o,
      h("span", { class: "sg-chip-label" }, s?.headerName || i),
      this._removeButton(() => t.removeValueColumn(i))
    ), this._wireDragSource(n, i), n;
  }
  _removeButton(i) {
    const e = h("button", { type: "button", class: "sg-chip-remove", "aria-label": "Remove", title: "Remove" });
    return e.textContent = "×", e.addEventListener("click", (t) => {
      t.stopPropagation(), i();
    }), e;
  }
  // ----- DnD plumbing -----
  _wireDragSource(i, e) {
    i.addEventListener("dragstart", (t) => {
      t.dataTransfer.effectAllowed = "move", t.dataTransfer.setData("text/plain", e), i.classList.add("sg-dragging");
    }), i.addEventListener("dragend", () => i.classList.remove("sg-dragging"));
  }
  _wireDropZone(i, e) {
    i.addEventListener("dragover", (t) => {
      t.preventDefault(), t.dataTransfer.dropEffect = "move", i.classList.add("sg-drop-over");
    }), i.addEventListener("dragleave", (t) => {
      t.target === i && i.classList.remove("sg-drop-over");
    }), i.addEventListener("drop", (t) => {
      t.preventDefault(), i.classList.remove("sg-drop-over");
      const s = t.dataTransfer.getData("text/plain");
      s && this._handleDrop(e, s);
    });
  }
  // A field lives in at most one of {rowGroup, pivot, value} at a time.
  // Dropping on a zone removes it from the others first.
  _handleDrop(i, e) {
    const t = this._api();
    if (i === "columns") {
      this._removeEverywhere(e);
      return;
    }
    this._removeEverywhere(e, i), i === "rowGroup" ? t.addRowGroupColumn(e) : i === "pivot" ? t.addPivotColumn(e) : i === "value" && t.addValueColumn(e, "sum");
  }
  _removeFrom(i, e) {
    const t = this._api();
    i === "rowGroup" ? t.removeRowGroupColumn(e) : i === "pivot" ? t.removePivotColumn(e) : i === "value" && t.removeValueColumn(e);
  }
  _removeEverywhere(i, e = null) {
    const t = this._api();
    e !== "rowGroup" && t.removeRowGroupColumn(i), e !== "pivot" && t.removePivotColumn(i), e !== "value" && t.removeValueColumn(i);
  }
}
function Se(l) {
  const i = l ?? J.start();
  return i.register("grid", P), i.register("header-cell", k), i.register("row", j), i.register("cell", U), i.register("filter", X), i.register("pagination", L), i.register("side-panel", Y), i;
}
const Re = {
  start: Se,
  GridController: P,
  HeaderCellController: k,
  RowController: j,
  CellController: U,
  FilterController: X,
  PaginationController: L,
  SidePanelController: Y
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = Re);
export {
  U as CellController,
  X as FilterController,
  P as GridController,
  k as HeaderCellController,
  L as PaginationController,
  j as RowController,
  Y as SidePanelController,
  Re as default,
  Se as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
