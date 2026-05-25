var Q = Object.defineProperty;
var Z = (l, n, e) => n in l ? Q(l, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[n] = e;
var w = (l, n, e) => Z(l, typeof n != "symbol" ? n + "" : n, e);
import { Controller as x, Application as J } from "@hotwired/stimulus";
function b(l, n) {
  return typeof n.valueGetter == "function" ? n.valueGetter(l) : l?.[n.field];
}
function R(l, n) {
  const e = b(l, n);
  return typeof n.valueFormatter == "function" ? n.valueFormatter(e, l) : e == null ? "" : n.type === "date" && e instanceof Date ? e.toLocaleDateString() : n.type === "boolean" ? e ? "✓" : "" : String(e);
}
const z = {
  contains: (l, n) => String(l ?? "").toLowerCase().includes(String(n ?? "").toLowerCase()),
  notContains: (l, n) => !String(l ?? "").toLowerCase().includes(String(n ?? "").toLowerCase()),
  equals: (l, n) => String(l ?? "").toLowerCase() === String(n ?? "").toLowerCase(),
  notEqual: (l, n) => String(l ?? "").toLowerCase() !== String(n ?? "").toLowerCase(),
  startsWith: (l, n) => String(l ?? "").toLowerCase().startsWith(String(n ?? "").toLowerCase()),
  endsWith: (l, n) => String(l ?? "").toLowerCase().endsWith(String(n ?? "").toLowerCase()),
  blank: (l) => l == null || l === "",
  notBlank: (l) => l != null && l !== ""
}, ee = {
  equals: (l, n) => Number(l) === Number(n),
  notEqual: (l, n) => Number(l) !== Number(n),
  lessThan: (l, n) => Number(l) < Number(n),
  lessThanOrEqual: (l, n) => Number(l) <= Number(n),
  greaterThan: (l, n) => Number(l) > Number(n),
  greaterThanOrEqual: (l, n) => Number(l) >= Number(n),
  inRange: (l, n, e) => Number(l) >= Number(n) && Number(l) <= Number(e),
  blank: (l) => l == null || l === "",
  notBlank: (l) => l != null && l !== ""
};
function y(l) {
  if (l == null || l === "") return null;
  if (l instanceof Date) return l;
  const n = new Date(l);
  return Number.isNaN(n.valueOf()) ? null : n;
}
const te = {
  equals: (l, n) => y(l)?.toDateString() === y(n)?.toDateString(),
  notEqual: (l, n) => y(l)?.toDateString() !== y(n)?.toDateString(),
  lessThan: (l, n) => (y(l)?.valueOf() ?? -1 / 0) < (y(n)?.valueOf() ?? 1 / 0),
  greaterThan: (l, n) => (y(l)?.valueOf() ?? 1 / 0) > (y(n)?.valueOf() ?? -1 / 0),
  inRange: (l, n, e) => {
    const t = y(l)?.valueOf();
    return t != null && t >= (y(n)?.valueOf() ?? -1 / 0) && t <= (y(e)?.valueOf() ?? 1 / 0);
  },
  blank: (l) => l == null || l === "",
  notBlank: (l) => l != null && l !== ""
}, se = {
  equals: (l, n) => n === "true" ? !!l : n === "false" ? !l : !0
}, ie = {
  in: (l, n) => Array.isArray(n) && n.includes(String(l ?? ""))
}, ne = { text: z, number: ee, date: te, boolean: se, set: ie };
function le(l, n, e) {
  if (!e) return !0;
  const t = e.filterType || n.filter || "text", i = (ne[t] || z)[e.type];
  if (!i) return !0;
  const o = b(l, n);
  return i(o, e.value, e.value2);
}
function q(l, n, e) {
  const t = Object.entries(n || {}).filter(([, s]) => s != null);
  return t.length === 0 ? l : l.filter((s) => t.every(([i, o]) => {
    const r = e[i];
    return r ? le(s, r, o) : !0;
  }));
}
function $(l, n, e) {
  if (!n) return l;
  const t = String(n).toLowerCase();
  return l.filter((s) => {
    for (const i of e) {
      const o = R(s, i);
      if (o && String(o).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function I(l, n, e) {
  if (l == null && n == null) return 0;
  if (l == null) return -1;
  if (n == null) return 1;
  if (e === "number") return Number(l) - Number(n);
  if (e === "date") {
    const t = y(l)?.valueOf() ?? 0, s = y(n)?.valueOf() ?? 0;
    return t - s;
  }
  return e === "boolean" ? l === n ? 0 : l ? 1 : -1 : String(l).localeCompare(String(n), void 0, { numeric: !0, sensitivity: "base" });
}
function oe(l, n, e) {
  if (!n || n.length === 0) return l;
  const t = l.slice();
  return t.sort((s, i) => {
    for (const { colId: o, sort: r } of n) {
      const a = e[o];
      if (!a) continue;
      const d = b(s, a), c = b(i, a), h = typeof a.comparator == "function" ? a.comparator(d, c, s, i) : I(d, c, a.type);
      if (h !== 0) return r === "desc" ? -h : h;
    }
    return 0;
  }), t;
}
function M(l, n) {
  if (!n || !n.enabled) return { rows: l, total: l.length, pageRows: l };
  const e = l.length, t = Math.max(1, Math.ceil(e / n.pageSize)), s = Math.min(n.page, t - 1), i = s * n.pageSize, o = l.slice(i, i + n.pageSize);
  return { rows: l, total: e, totalPages: t, page: s, pageRows: o };
}
function H(l, n, e) {
  if (l === "count") return n.length;
  const t = n.map((i) => b(i, e));
  if (l === "first") return t.length ? t[0] : null;
  if (l === "last") return t.length ? t[t.length - 1] : null;
  const s = t.map(Number).filter((i) => !Number.isNaN(i));
  switch (l) {
    case "sum":
      return s.reduce((i, o) => i + o, 0);
    case "avg":
      return s.length ? s.reduce((i, o) => i + o, 0) / s.length : null;
    case "min":
      return s.length ? Math.min(...s) : null;
    case "max":
      return s.length ? Math.max(...s) : null;
    default:
      return null;
  }
}
function L(l, n, e) {
  const t = {};
  for (const [s, i] of Object.entries(n || {})) {
    const o = e[s];
    o && (t[s] = H(i, l, o));
  }
  return t;
}
function re(l) {
  let n = 0, e = 0, t = 0, s = 1 / 0, i = -1 / 0;
  for (const o of l) {
    if (o == null || o === "") continue;
    n += 1;
    let r = null;
    if (typeof o == "number" && Number.isFinite(o)) r = o;
    else if (typeof o == "string" && o.trim() !== "") {
      const a = Number(o);
      Number.isFinite(a) && (r = a);
    }
    r != null && (e += 1, t += r, r < s && (s = r), r > i && (i = r));
  }
  return {
    count: n,
    sum: e ? t : null,
    avg: e ? t / e : null,
    min: e ? s : null,
    max: e ? i : null
  };
}
function ae(l, n, e, t, s = () => !0) {
  const i = (d, c, h) => {
    const u = n[c], g = /* @__PURE__ */ new Map();
    for (const f of d) {
      const m = b(f, u), v = m == null ? "" : String(m);
      g.has(v) || g.set(v, { value: m, rows: [] }), g.get(v).rows.push(f);
    }
    return Array.from(g.values()).sort((f, m) => I(f.value, m.value, u.type)).map(({ value: f, rows: m }) => {
      const v = f == null ? "" : String(f), C = h ? `${h}|${u.field}=${v}` : `${u.field}=${v}`;
      return {
        __sgGroup: !0,
        level: c,
        field: u.field,
        value: f,
        groupId: C,
        count: m.length,
        aggregates: L(m, t, e),
        leaves: m,
        children: c + 1 < n.length ? i(m, c + 1, C) : null
      };
    });
  }, o = i(l, 0, ""), r = [], a = (d) => {
    for (const c of d)
      if (r.push(c), !!s(c.groupId, c.level))
        if (c.children) a(c.children);
        else for (const h of c.leaves) r.push(h);
  };
  return a(o), { displayList: r, tree: o };
}
function K(l, n, e) {
  return `__p|${e.map((s) => {
    const i = l[s.field];
    return `${s.field}=${i == null ? "" : String(i)}`;
  }).join("|")}|${n.col.field}:${n.aggFunc}`;
}
function W(l, n) {
  return n.map((e) => {
    const t = b(l, e);
    return t == null ? "" : String(t);
  }).join("");
}
function de(l, n) {
  if (!n?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const t of l) {
    const s = W(t, n);
    if (!e.has(s)) {
      const i = {};
      n.forEach((o) => {
        const r = b(t, o);
        i[o.field] = r ?? null;
      }), e.set(s, i);
    }
  }
  return Array.from(e.values()).sort((t, s) => {
    for (const i of n) {
      const o = I(t[i.field], s[i.field], i.type);
      if (o !== 0) return o;
    }
    return 0;
  });
}
function ue(l, n, e) {
  if (!l.length || !n.length) return [];
  const t = [], s = n.length === 1;
  for (const i of l)
    for (const o of n) {
      const r = K(i, o, e), a = e.map((c) => i[c.field] == null ? "(Blank)" : String(i[c.field])).join(" · "), d = s ? a : `${a} · ${o.aggFunc}(${o.col.field})`;
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
        pivotKeys: { ...i },
        valueField: o.col.field,
        aggFunc: o.aggFunc,
        valueGetter: (c) => c?.__pivotValues?.[r] ?? null
      });
    }
  return t;
}
function T(l, n, e, t) {
  const s = {}, i = /* @__PURE__ */ new Map();
  for (const o of l) {
    const r = W(o, t);
    i.has(r) || i.set(r, []), i.get(r).push(o);
  }
  for (const o of n) {
    const r = t.map((d) => {
      const c = o[d.field];
      return c == null ? "" : String(c);
    }).join(""), a = i.get(r) || [];
    for (const d of e) {
      const c = K(o, d, t);
      s[c] = a.length ? H(d.aggFunc, a, d.col) : null;
    }
  }
  return s;
}
function ce({ rows: l, rowGroupCols: n = [], pivotCols: e, valueConfigs: t, isExpanded: s = () => !0 }) {
  const i = de(l, e), o = ue(i, t, e), r = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: l.length,
    aggregates: {},
    leaves: l,
    __pivotValues: T(l, i, t, e)
  };
  if (!n.length)
    return { columns: o, displayList: [r], tree: [], combos: i };
  const a = (u, g, f) => {
    const m = n[g], v = /* @__PURE__ */ new Map();
    for (const C of u) {
      const S = b(C, m), D = S == null ? "" : String(S);
      v.has(D) || v.set(D, { value: S, rows: [] }), v.get(D).rows.push(C);
    }
    return Array.from(v.values()).sort((C, S) => I(C.value, S.value, m.type)).map(({ value: C, rows: S }) => {
      const D = C == null ? "" : String(C), G = f ? `${f}|${m.field}=${D}` : `${m.field}=${D}`;
      return {
        __sgGroup: !0,
        level: g,
        field: m.field,
        value: C,
        groupId: G,
        count: S.length,
        aggregates: {},
        leaves: S,
        __pivotValues: T(S, i, t, e),
        children: g + 1 < n.length ? a(S, g + 1, G) : null
      };
    });
  }, d = a(l, 0, ""), c = [r], h = (u) => {
    for (const g of u)
      c.push(g), s(g.groupId, g.level) && g.children && h(g.children);
  };
  return h(d), { columns: o, displayList: c, tree: d, combos: i };
}
function he(l, { pivotCols: n = [], valueConfigs: e = [], columnGroups: t = null } = {}) {
  if (l._isPivot && n.length && l.pivotKeys)
    return ge(l, n, e);
  if (t && Array.isArray(t) && t.length && !l._isGroupCol && !l._isCheckbox && !l._isRowNumber) {
    for (const s of t)
      if (s?.children && s.children.includes(l.field))
        return [
          { kind: "group", id: `g:${s.headerName}`, label: s.headerName },
          { kind: "leaf", col: l }
        ];
  }
  return [{ kind: "leaf", col: l }];
}
function ge(l, n, e) {
  const t = (e?.length || 0) > 1, s = [];
  for (let i = 0; i < n.length; i++) {
    const o = n[i].field, r = l.pivotKeys[o];
    if (i === n.length - 1 && !t)
      return s.push({ kind: "leaf", col: l, label: r == null ? "(Blank)" : String(r) }), s;
    s.push({
      kind: "group",
      id: `p:${i}:${r == null ? "" : String(r)}`,
      label: r == null ? "(Blank)" : String(r)
    });
  }
  return s.push({ kind: "leaf", col: l, label: `${l.aggFunc}(${l.valueField})` }), s;
}
function pe(l, n = {}) {
  if (!l.length) return { rows: [[]], depth: 1 };
  const e = l.map((i) => he(i, n).slice()), t = Math.max(1, ...e.map((i) => i.length)), s = [];
  for (let i = 0; i < t; i++) {
    const o = [];
    let r = 0;
    for (; r < e.length; ) {
      const a = e[r];
      if (i >= a.length || a[i] === null) {
        r += 1;
        continue;
      }
      const d = a[i];
      if (d.kind === "leaf") {
        o.push({ kind: "leaf", col: d.col, label: d.label, rowspan: t - i, colspan: 1 });
        for (let h = i + 1; h < t; h++) a[h] = null;
        r += 1;
        continue;
      }
      let c = r + 1;
      for (; c < e.length; ) {
        const h = e[c];
        if (i >= h.length || !h[i] || h[i].kind !== "group" || h[i].id !== d.id) break;
        let u = !0;
        for (let g = 0; g < i; g++) {
          const f = a[g]?.id ?? null, m = h[g]?.id ?? null;
          if (f !== m) {
            u = !1;
            break;
          }
        }
        if (!u) break;
        c += 1;
      }
      o.push({ kind: "group", label: d.label, colspan: c - r, rowspan: 1 }), r = c;
    }
    s.push(o);
  }
  return { rows: s, depth: t };
}
function fe(l) {
  if (l.serverSide) {
    const d = l.rowData, c = l.pagination?.pageSize || d.length || 1, h = l.serverRowCount ?? d.length, u = Math.max(1, Math.ceil(h / c)), g = Math.min(l.pagination?.page || 0, u - 1);
    return { filteredSorted: d, rows: d, total: h, totalPages: u, page: g, pageRows: d };
  }
  const n = Object.fromEntries(l.columnDefs.map((d) => [d.field, d])), e = l.columnDefs.filter((d) => !d.hidden && !d._isCheckbox);
  let t = l.rowData;
  t = q(t, l.filterModel, n), t = $(t, l.quickFilter, e), t = oe(t, l.sortModel, n);
  const s = (l.rowGroupCols || []).filter((d) => n[d]), i = l.pivotMode ? (l.pivotCols || []).filter((d) => n[d]) : [], o = l.pivotMode ? Object.entries(l.aggModel || {}).filter(([d]) => n[d]).map(([d, c]) => ({ col: n[d], aggFunc: c })) : [];
  if (l.pivotMode && i.length && o.length) {
    const d = s.map((v) => n[v]), c = i.map((v) => n[v]), { columns: h, displayList: u, tree: g, combos: f } = ce({
      rows: t,
      rowGroupCols: d,
      pivotCols: c,
      valueConfigs: o,
      isExpanded: l.isGroupExpanded
    }), m = M(u, l.pagination);
    return {
      pivot: !0,
      pivotResultColumns: h,
      combos: f,
      grouped: !0,
      tree: g,
      leafCount: t.length,
      grandTotals: L(t, l.aggModel, n),
      filteredSorted: u,
      ...m
    };
  }
  if (s.length) {
    const d = s.map((g) => n[g]), { displayList: c, tree: h } = ae(
      t,
      d,
      n,
      l.aggModel,
      l.isGroupExpanded
    ), u = M(c, l.pagination);
    return {
      grouped: !0,
      tree: h,
      leafCount: t.length,
      grandTotals: L(t, l.aggModel, n),
      filteredSorted: c,
      ...u
    };
  }
  const r = M(t, l.pagination), a = l.aggModel && Object.keys(l.aggModel).length ? L(t, l.aggModel, n) : null;
  return { filteredSorted: t, grandTotals: a, ...r };
}
function me(l, n, e, t, s = 6) {
  const i = Math.ceil(n / e), o = Math.max(0, Math.floor(l / e) - s), r = Math.min(t, o + i + s * 2);
  return { first: o, last: r };
}
function _e(l) {
  return {
    // ---- Data ----
    setRowData(n) {
      l.setRowData(n);
    },
    getRowData() {
      return l.state.rowData.slice();
    },
    applyTransaction(n) {
      return l.applyTransaction(n);
    },
    // Server-side row model
    setRowCount(n) {
      l.setRowCount(n);
    },
    getRowCount() {
      return l.state.serverSide ? l.state.serverRowCount : l.state.rowData.length;
    },
    isServerSide() {
      return !!l.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(n) {
      l.setColumnDefs(n);
    },
    getColumnDefs() {
      return l.state.columnDefs.slice();
    },
    setColumnVisible(n, e) {
      l.setColumnVisible(n, e);
    },
    setColumnPinned(n, e) {
      l.setColumnPinned(n, e);
    },
    setColumnWidth(n, e) {
      l.setColumnWidth(n, e);
    },
    moveColumn(n, e) {
      l.moveColumn(n, e);
    },
    autoSizeColumn(n) {
      l.autoSizeColumn(n);
    },
    autoSizeAllColumns() {
      l.state.columnDefs.forEach((n) => l.autoSizeColumn(n.field));
    },
    sizeColumnsToFit() {
      l.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(n) {
      l.setSortModel(n);
    },
    getSortModel() {
      return l.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(n) {
      l.setFilterModel(n);
    },
    getFilterModel() {
      return { ...l.state.filterModel };
    },
    setColumnFilter(n, e) {
      l.setColumnFilter(n, e);
    },
    destroyFilter(n) {
      l.setColumnFilter(n, null);
    },
    setQuickFilter(n) {
      l.setQuickFilter(n);
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
    selectRow(n) {
      l.setSelected(n, !0);
    },
    deselectRow(n) {
      l.setSelected(n, !1);
    },
    getSelectedRows() {
      return l.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(l.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(n) {
      l.goToPage(n);
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
    paginationSetPageSize(n) {
      l.setPageSize(n);
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
    startEditingCell({ rowId: n, colId: e }) {
      l.startEditingCell(n, e);
    },
    stopEditing(n = !1) {
      l.stopEditing(n);
    },
    // ---- Row grouping + aggregation ----
    setRowGroupColumns(n) {
      l.setRowGroupColumns(n);
    },
    addRowGroupColumn(n) {
      l.addRowGroupColumn(n);
    },
    removeRowGroupColumn(n) {
      l.removeRowGroupColumn(n);
    },
    getRowGroupColumns() {
      return l.getRowGroupColumns();
    },
    setColumnAggFunc(n, e) {
      l.setColumnAggFunc(n, e);
    },
    expandAll() {
      l.expandAll();
    },
    collapseAll() {
      l.collapseAll();
    },
    toggleGroup(n, e) {
      l.toggleGroup(n, e);
    },
    // ---- Pivot ----
    setPivotMode(n) {
      l.setPivotMode(n);
    },
    isPivotMode() {
      return l.isPivotMode();
    },
    setPivotColumns(n) {
      l.setPivotColumns(n);
    },
    addPivotColumn(n) {
      l.addPivotColumn(n);
    },
    removePivotColumn(n) {
      l.removePivotColumn(n);
    },
    getPivotColumns() {
      return l.getPivotColumns();
    },
    // ---- Value columns (aggregations; shared with grouping) ----
    setValueColumns(n) {
      l.setValueColumns(n);
    },
    addValueColumn(n, e = "sum") {
      l.addValueColumn(n, e);
    },
    removeValueColumn(n) {
      l.removeValueColumn(n);
    },
    getValueColumns() {
      return l.getValueColumns();
    },
    // ---- Column header groups (multi-row headers) ----
    setColumnGroups(n) {
      l.setColumnGroups(n);
    },
    getColumnGroups() {
      return l.getColumnGroups();
    },
    // ---- Pinned bottom row (sticky grand totals) ----
    setPinnedBottomRow(n) {
      l.setPinnedBottomRow(n);
    },
    isPinnedBottomRow() {
      return l.isPinnedBottomRow();
    },
    // ---- Export ----
    getDataAsCsv(n = {}) {
      return l.getDataAsCsv(n);
    },
    exportDataAsCsv(n = {}) {
      return l.exportDataAsCsv(n);
    },
    // ---- Display ----
    refreshCells(n = {}) {
      l.refresh(n);
    },
    redrawRows(n = {}) {
      l.refresh(n);
    },
    // ---- Events ----
    addEventListener(n, e) {
      l.element.addEventListener(n, e);
    },
    removeEventListener(n, e) {
      l.element.removeEventListener(n, e);
    }
  };
}
function p(l, n = {}, e = []) {
  const t = document.createElement(l);
  for (const [s, i] of Object.entries(n))
    i === !1 || i == null || (s === "class" ? t.className = i : s === "style" && typeof i == "object" ? Object.assign(t.style, i) : s.startsWith("on") && typeof i == "function" ? t.addEventListener(s.slice(2).toLowerCase(), i) : i === !0 ? t.setAttribute(s, "") : t.setAttribute(s, String(i)));
  for (const s of [].concat(e))
    s == null || s === !1 || t.appendChild(typeof s == "string" ? document.createTextNode(s) : s);
  return t;
}
function F(l, n) {
  for (const [e, t] of Object.entries(n))
    t == null || t === !1 ? l.removeAttribute(e) : t === !0 ? l.setAttribute(e, "") : l.setAttribute(e, String(t));
}
function B(l) {
  const n = document.getElementById(l);
  return !n || n.tagName !== "TEMPLATE" ? null : n.content.firstElementChild.cloneNode(!0);
}
function _(l, n, e) {
  l.dispatchEvent(new CustomEvent(n, { detail: e, bubbles: !0 }));
}
function ve(l, n, e) {
  let t = l.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(n)) {
      const i = e.getControllerForElementAndIdentifier(t, n);
      if (i) return i;
    }
    t = t.parentElement;
  }
  return null;
}
const we = 32, N = 100, O = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', Ce = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>';
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
        const i = e.target.closest?.('td[data-gutter="true"]');
        if (i) {
          const o = i.closest("tr");
          this._rowDragPending = { rowId: this._coerceRowId(o.dataset.rowId), x: e.clientX, y: e.clientY }, this._rowDragMoved = !1, document.addEventListener("mousemove", this._onRowDragMove);
          return;
        }
      }
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : s ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), _(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    w(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      s && s.focus.rowId === t.rowId && s.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), _(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
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
      const i = this._cellRangeRows(s).map((o) => o.map((r) => String(r ?? "")).join("	")).join(`
`);
      i && (e.clipboardData?.setData("text/plain", i), e.preventDefault());
    });
    w(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && this.element.contains(t)) return;
      const s = e.key, i = e.metaKey || e.ctrlKey;
      if (i && s.toLowerCase() === "a") {
        e.preventDefault(), this.rowSelectionValue !== "" ? (this.clearCellSelection(), this.deselectAll(), this.selectAll()) : this._selectAllCells();
        return;
      }
      if (i) return;
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
      pagination: { enabled: !1, page: 0, pageSize: N },
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = _e(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove();
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, s) => {
      const i = {}, o = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      return i[this.getRowIdValue] = o != null ? this._coerceRowId(o) : s + 1, t.querySelectorAll("td").forEach((r) => {
        const a = r.getAttribute("data-cell-col-id-value") || r.getAttribute("data-col-id");
        a && (i[a] = r.textContent.trim());
      }), i;
    }), e.innerHTML = ""), this._initialHead = this.element.querySelector("thead");
  }
  _buildChrome() {
    let e = this.element.querySelector("table");
    if (!e) {
      e = p("table");
      const s = p("thead");
      e.appendChild(s), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = p("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const s = p("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(s, e), s.appendChild(e), this._viewport = s;
    }
    if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = p("div", { class: "sg-status-bar", role: "status" }), this._statusBar.append(
      p("div", { class: "sg-status-section sg-status-left" }),
      p("div", { class: "sg-status-section sg-status-right" })
    ), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
      const s = p("div", { class: "sg-main" });
      this._viewport.parentNode.insertBefore(s, this._viewport), s.appendChild(this._viewport), this._statusBar && s.appendChild(this._statusBar), this._main = s, this._sidePanel = p("aside", {
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
    this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), _(this.element, "grid:ready", { api: this.element.gridApi }), _(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
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
    const s = this.state.filterModel[e.field] || {}, i = ye(e.filter), o = p("div", { class: "sg-filter-popover" }), r = p("select");
    i.forEach((v) => r.append(new Option(v.label, v.value, !1, v.value === s.type)));
    const a = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", d = p("input", { type: a, value: s.value ?? "" }), c = p("input", { type: a, value: s.value2 ?? "", style: { display: "none" } }), h = () => {
      const v = r.value, C = v === "inRange", S = !(v === "blank" || v === "notBlank");
      d.style.display = S ? "" : "none", c.style.display = C ? "" : "none";
    };
    r.addEventListener("change", h), h();
    const u = p("div", { class: "sg-filter-actions" }), g = p("button", { type: "button" }, "Clear"), f = p("button", { type: "button", class: "primary" }, "Apply");
    u.append(g, f), g.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), f.addEventListener("click", () => {
      const v = r.value, C = v === "blank" || v === "notBlank" ? { filterType: e.filter, type: v } : { filterType: e.filter, type: v, value: d.value, value2: c.value || void 0 };
      this.setColumnFilter(e.field, C), this._closeFilterPopover();
    }), o.append(
      p("label", {}, "Condition"),
      r,
      d,
      c,
      u
    ), document.body.appendChild(o);
    const m = t.getBoundingClientRect();
    o.style.left = `${m.left + window.scrollX}px`, o.style.top = `${m.bottom + window.scrollY + 2}px`, this._filterPopover = o, document.addEventListener("mousedown", this._onDocMouseDown), d.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const s = this.state.columnDefs.findIndex((r) => r.field === e.field), i = this._runtimeOverrides[e.field] || {}, o = { ...e, ...i, _headerEl: t };
    if (s >= 0) {
      const r = this.state.columnDefs[s];
      if (r._headerEl === t && be(r, o)) return;
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
    let i;
    s === -1 ? i = { colId: e, sort: "asc" } : this.state.sortModel[s].sort === "asc" ? i = { colId: e, sort: "desc" } : i = null, t ? (s >= 0 && this.state.sortModel.splice(s, 1), i && this.state.sortModel.push(i)) : this.state.sortModel = i ? [i] : [], this.scheduleRender("sort"), _(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  setSortModel(e) {
    this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), _(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  // ----- Filter -----
  setColumnFilter(e, t) {
    t == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = t, this.state.pagination.page = 0, this.scheduleRender("filter"), _(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setFilterModel(e) {
    this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), _(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setQuickFilter(e) {
    const t = e == null ? "" : String(e);
    t !== this.state.quickFilter && (this.state.quickFilter = t, this.state.pagination.page = 0, this.scheduleRender("filter"), _(this.element, "grid:filterChanged", {
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
    this.rowSelectionValue === "single" ? (s.clear(), s.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? s.has(e) ? s.delete(e) : s.add(e) : (s.clear(), s.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), _(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(s)
    });
  }
  setSelected(e, t) {
    t ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), _(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  selectAll() {
    this._displayList.filteredSorted.forEach((e) => {
      e.__sgGroup || this.state.selection.add(this._rowId(e));
    }), this.scheduleRender("selection"), _(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  deselectAll() {
    this.state.selection.clear(), this.scheduleRender("selection"), _(this.element, "grid:selectionChanged", { selectedRows: [], selectedIds: [] });
  }
  getSelectedRows() {
    const e = this.state.selection;
    return this.state.rowData.filter((t) => e.has(this._rowId(t)));
  }
  _selectRange(e, t) {
    const s = this._displayList.filteredSorted, i = s.findIndex((d) => this._rowId(d) === e), o = s.findIndex((d) => this._rowId(d) === t);
    if (i < 0 || o < 0) return;
    const [r, a] = i <= o ? [i, o] : [o, i];
    for (let d = r; d <= a; d++)
      s[d].__sgGroup || this.state.selection.add(this._rowId(s[d]));
  }
  // ----- Pagination -----
  goToPage(e) {
    const t = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(e, t)), this.scheduleRender("page"), _(this.element, "grid:paginationChanged", {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  setPageSize(e) {
    this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), _(this.element, "grid:paginationChanged", {
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
    const e = Object.fromEntries(this.state.columnDefs.map((i) => [i.field, i])), t = this.state.columnDefs.filter((i) => !i.hidden && !i._isCheckbox);
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
    const i = this.state.columnDefs.find((r) => r.field === t);
    if (!i || !i.editable) return;
    const o = this.state.rowData.find((r) => this._rowId(r) === e);
    o && (this.state.editing = { rowId: e, colId: t, originalValue: b(o, i), initialValue: s }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: s, originalValue: i, draftValue: o } = this.state.editing, r = this._tbody.querySelector(`tr[data-row-id="${E(t)}"] td[data-col-id="${E(s)}"]`);
    let a = i;
    if (!e && r) {
      const d = r.querySelector("[data-editor-input]") || r.querySelector("input,select,textarea");
      d ? a = Se(d.value, this._colByField(s)?.type) : o !== void 0 && (a = o);
    }
    if (this.state.editing = null, !e && a !== i) {
      const d = this.state.rowData.find((h) => this._rowId(h) === t), c = d[s];
      d[s] = a, _(this.element, "grid:cellValueChanged", { rowId: t, colId: s, oldValue: c, newValue: a });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const s = this._colByField(e);
    s && (s.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), _(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const i = t || null;
    s.pinned = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: i }, this._reorderForPinning(), this.scheduleRender("columns"), _(this.element, "grid:columnPinned", { colId: e, pinned: i });
  }
  setColumnWidth(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const i = Math.max(s.minWidth || 40, Math.min(s.maxWidth || 4e3, t));
    s.width = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: i }, this.scheduleRender("columns"), _(this.element, "grid:columnResized", { colId: e, width: i });
  }
  moveColumn(e, t) {
    const s = this.state.columnDefs.findIndex((o) => o.field === e);
    if (s < 0 || s === t) return;
    const [i] = this.state.columnDefs.splice(s, 1);
    this.state.columnDefs.splice(t, 0, i), this.scheduleRender("columns"), _(this.element, "grid:columnMoved", { colId: e, fromIndex: s, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const s = (t.headerName || t.field || "").length, i = this.state.rowData.slice(0, 200);
    let o = s;
    for (const r of i) {
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
    const i = e / s;
    t.forEach((o) => {
      o.width = Math.max(o.minWidth || 40, Math.floor((o.width || 150) * i));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((i) => i.pinned === "left"), t = this.state.columnDefs.filter((i) => i.pinned === "right"), s = this.state.columnDefs.filter((i) => !i.pinned);
    this.state.columnDefs = [...e, ...s, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), _(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], s = [], i = [], o = new Map(this.state.rowData.map((r) => [this._rowId(r), r]));
    return (e.remove || []).forEach((r) => {
      const a = this._rowId(r);
      o.delete(a) && i.push(r);
    }), (e.update || []).forEach((r) => {
      const a = this._rowId(r);
      o.has(a) && (o.set(a, { ...o.get(a), ...r }), s.push(r));
    }), (e.add || []).forEach((r) => {
      const a = this._rowId(r);
      o.has(a) || (o.set(a, r), t.push(r));
    }), this.state.rowData = Array.from(o.values()), this.scheduleRender("data"), _(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: s, removed: i };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const s = this.state.columnDefs.filter((a) => !a.hidden && !a._isCheckbox), i = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((a) => !a.__sgGroup), o = (a) => /[",\n\r]/.test(a) ? `"${String(a).replace(/"/g, '""')}"` : String(a), r = [s.map((a) => o(a.headerName || a.field)).join(e)];
    for (const a of i)
      r.push(s.map((d) => o(R(a, d))).join(e));
    return r.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const s = this.getDataAsCsv(t), i = new Blob([s], { type: "text/csv;charset=utf-8" }), o = URL.createObjectURL(i), r = p("a", { href: o, download: e });
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
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.size === 0) && (this._displayList = fe({
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
    const e = this._visibleCols(), t = pe(e, this._headerLayoutOpts());
    t.depth > 1 ? this._renderHeaderMultiRow(e, t) : this._renderHeaderSingleRow(e), this._renderColgroup(e);
  }
  // Aggregate the options we hand to buildHeaderLayout (auto-derived pivot
  // groups when in pivot mode, plus any user-declared columnGroups).
  _headerLayoutOpts() {
    const e = { columnGroups: this.columnGroupsValue || null };
    return this.state.pivot?.mode && this._displayList?.pivot && (e.pivotCols = (this.state.pivot.cols || []).map((t) => this._colByField(t)).filter(Boolean), e.valueConfigs = Object.entries(this.state.group.aggs || {}).map(([t, s]) => ({ col: this._colByField(t), aggFunc: s })).filter((t) => t.col)), e;
  }
  _renderColgroup(e) {
    let t = this._table.querySelector("colgroup");
    t || (t = p("colgroup"), this._table.insertBefore(t, this._thead));
    const s = Array.from(t.children);
    for (e.forEach((i, o) => {
      let r = s[o];
      r || (r = p("col"), t.appendChild(r)), r.style.width = i.width ? i.width + "px" : "";
    }); t.children.length > e.length; ) t.lastElementChild.remove();
  }
  _renderHeaderSingleRow(e) {
    if (this._thead.children.length > 1) {
      const u = this._thead.firstElementChild;
      for (let g = 1; g < this._thead.children.length; g++) {
        const f = this._thead.children[g];
        Array.from(f.children).forEach((m) => {
          (m.hasAttribute("data-header-cell-field-value") || m.hasAttribute("data-field")) && u.appendChild(m);
        });
      }
      for (; this._thead.children.length > 1; ) this._thead.lastElementChild.remove();
    }
    const t = this._thead.querySelector("tr") || (() => {
      const u = p("tr");
      return this._thead.appendChild(u), u;
    })(), s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((u) => {
      const g = u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field");
      g && s.set(g, u);
    });
    const i = new Set(e.map((u) => u.field)), o = this.state.columnDefs.filter((u) => !i.has(u.field)), r = [...e, ...o], a = Array.from(t.children).map((u) => u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field")).filter(Boolean), d = r.map((u) => u.field);
    if (a.length === d.length && a.every((u, g) => u === d[g]))
      Array.from(t.children).forEach((u) => {
        u.removeAttribute("rowspan"), u.removeAttribute("colspan");
      });
    else {
      const u = [];
      for (const g of r) {
        let f = s.get(g.field);
        f ? (f.removeAttribute("rowspan"), f.removeAttribute("colspan")) : f = p("th", {
          "data-field": g.field,
          "data-synth": "true"
        }, [p("div", { class: "sg-header-content" }, [
          p("span", { class: "sg-header-label" }, g.headerName || g.field || "")
        ])]), u.push(f);
      }
      t.replaceChildren(...u);
    }
    Array.from(t.children).forEach((u) => {
      const g = u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field");
      g != null && (u.style.display = i.has(g) ? "" : "none");
    });
    const h = this._pinOffsets();
    for (const u of e) {
      const g = t.querySelector(`th[data-header-cell-field-value="${E(u.field)}"]`) || t.querySelector(`th[data-field="${E(u.field)}"]`);
      g && this._applyLeafThState(g, u, h);
    }
  }
  // Multi-row header: <thead> gets `layout.depth` rows of group headers
  // followed by the leaf headers, then one hidden row holding any registered
  // <th>s that aren't currently visible (so their controllers stay mounted).
  _renderHeaderMultiRow(e, t) {
    const s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((c) => {
      const h = c.getAttribute("data-header-cell-field-value") || c.getAttribute("data-field");
      h && s.set(h, c);
    });
    const i = [], o = new Set(e.map((c) => c.field)), r = this._pinOffsets();
    for (const c of t.rows) {
      const h = p("tr");
      for (const u of c) {
        if (u.kind === "group") {
          h.appendChild(p("th", {
            class: "sg-header-group",
            colspan: String(u.colspan),
            "data-group-header": "true"
          }, u.label || ""));
          continue;
        }
        const g = u.col;
        let f = s.get(g.field);
        if (f || (f = p("th", {
          "data-field": g.field,
          "data-synth": "true"
        }, [p("div", { class: "sg-header-content" }, [
          p("span", { class: "sg-header-label" }, u.label || g.headerName || g.field || "")
        ])])), u.label) {
          const m = f.querySelector(".sg-header-label");
          m && m.textContent !== u.label && (m.textContent = u.label);
        }
        f.setAttribute("rowspan", String(u.rowspan)), f.removeAttribute("colspan"), f.style.display = "", h.appendChild(f), this._applyLeafThState(f, g, r);
      }
      i.push(h);
    }
    const a = /* @__PURE__ */ new Set();
    t.rows.forEach((c) => c.forEach((h) => {
      h.kind === "leaf" && a.add(h.col.field);
    }));
    const d = this.state.columnDefs.filter(
      (c) => !o.has(c.field) && !a.has(c.field)
    );
    if (d.length) {
      const c = p("tr", { class: "sg-hidden-header-row" });
      for (const h of d) {
        let u = s.get(h.field);
        u || (u = p("th", { "data-field": h.field, "data-synth": "true" })), u.removeAttribute("rowspan"), u.removeAttribute("colspan"), c.appendChild(u);
      }
      i.push(c);
    }
    this._thead.replaceChildren(...i);
  }
  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(e, t, s) {
    const i = this.state.sortModel.find((o) => o.colId === t.field);
    F(e, {
      "data-sortable": t.sortable ? "true" : null,
      "data-filterable": t.filter ? "true" : null,
      "data-filter-active": this.state.filterModel[t.field] ? "true" : null,
      "data-sort": i?.sort || null,
      "data-pinned": t.pinned || null
    }), t.width && (e.style.width = t.width + "px"), e.style.left = t.pinned === "left" ? s.left[t.field] + "px" : "", e.style.right = t.pinned === "right" ? s.right[t.field] + "px" : "", this._ensureHeaderChrome(e, t, i);
  }
  _ensureHeaderChrome(e, t, s) {
    if (t._isRowNumber) {
      e.classList.add("sg-gutter-header"), e.textContent = "";
      return;
    }
    if (t._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let a = e.querySelector('input[type="checkbox"]');
      a || (a = p("input", { type: "checkbox", "aria-label": "Select all" }), a.addEventListener("change", (h) => {
        h.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(a));
      const d = this._displayList.filteredSorted.length, c = this.state.selection.size;
      a.checked = c > 0 && c >= d, a.indeterminate = c > 0 && c < d;
      return;
    }
    let i = e.querySelector(".sg-header-content");
    if (!i) {
      const a = e.textContent.trim();
      e.textContent = "", i = p("div", { class: "sg-header-content" }, [
        p("span", { class: "sg-header-label" }, a || t.headerName || t.field || "")
      ]), e.appendChild(i);
    }
    let o = i.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (o || (o = p("span", { class: "sg-sort-icon", "aria-hidden": "true" }), o.innerHTML = O, i.appendChild(o)), s && this.state.sortModel.length > 1) {
        let a = i.querySelector(".sg-sort-index");
        a || (a = p("span", { class: "sg-sort-index" }), i.appendChild(a)), a.textContent = String(this.state.sortModel.indexOf(s) + 1);
      } else
        i.querySelector(".sg-sort-index")?.remove();
    else o && o.remove();
    let r = i.querySelector(".sg-filter-icon");
    t.filter ? r || (r = p("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), r.innerHTML = Ce, i.appendChild(r)) : r && r.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(p("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._displayList.pageRows;
    this._selKeys = this._computeCellSelKeys();
    const s = this.virtualValue || t.length > 200;
    let i = t, o = 0;
    if (s) {
      const h = this._viewport?.clientHeight || 400, u = this.state.rowHeight, g = me(this.state.scrollTop, h, u, t.length, 8);
      o = g.first, i = t.slice(g.first, g.last);
    }
    const r = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((h) => {
      const u = h.dataset.rowId;
      u != null && r.set(u, h);
    });
    const a = document.createDocumentFragment(), d = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0, c = (h) => d + o + h + 1;
    if (s) {
      const h = this.state.rowHeight, u = o * h, g = (t.length - o - i.length) * h;
      a.appendChild(this._spacerRow(u, e.length)), i.forEach((f, m) => a.appendChild(this._buildRow(f, e, r, c(m)))), a.appendChild(this._spacerRow(g, e.length));
    } else
      i.forEach((h, u) => a.appendChild(this._buildRow(h, e, r, c(u))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && a.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(a);
  }
  _buildPinnedBottomRow(e) {
    const t = p("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), s = this._pinOffsets(), i = this._displayList.grandTotals || {};
    let o = !1;
    for (const r of e) {
      const a = p("td", { "data-col-id": r.field, "data-pinned": r.pinned || null });
      r.pinned === "left" ? a.style.left = s.left[r.field] + "px" : r.pinned === "right" && (a.style.right = s.right[r.field] + "px");
      const d = i[r.field];
      d != null ? (a.classList.add("sg-agg-cell"), a.textContent = this._formatAggregate(d)) : !o && !r._isCheckbox && !r._isRowNumber && (a.classList.add("sg-pinned-bottom-label"), a.textContent = "Total", o = !0), t.appendChild(a);
    }
    return t;
  }
  _buildRow(e, t, s, i) {
    if (e.__sgGroup) return this._buildGroupRow(e, t, s);
    const o = String(this._rowId(e));
    let r = s.get(o);
    r || (r = p("tr")), r.dataset.rowId = o, r.classList.remove("sg-spacer");
    const a = this.state.selection.has(this._rowId(e));
    return F(r, { "data-selected": a ? "true" : null }), this._renderRow(r, e, t, i), r;
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const i = p("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return i.style.height = "0px", i.appendChild(p("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), i;
    }
    const s = p("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return s.style.height = e + "px", s.appendChild(p("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), s;
  }
  _renderRow(e, t, s, i) {
    e.innerHTML = "";
    const o = this._pinOffsets(), r = this._selKeys || { active: null, range: null }, a = String(this._rowId(t));
    for (const d of s) {
      const c = `${a}:${d.field}`, h = p("td", {
        "data-col-id": d.field,
        "data-pinned": d.pinned || null,
        "data-cell-active": r.active === c ? "true" : null,
        "data-cell-range": r.range && r.range.has(c) ? "true" : null
      });
      if (d.pinned === "left" ? h.style.left = o.left[d.field] + "px" : d.pinned === "right" && (h.style.right = o.right[d.field] + "px"), d._isRowNumber) {
        h.classList.add("sg-gutter-cell"), h.setAttribute("data-gutter", "true"), h.removeAttribute("data-cell-active"), h.removeAttribute("data-cell-range"), h.textContent = i != null ? String(i) : "", e.appendChild(h);
        continue;
      }
      if (d._isCheckbox) {
        h.classList.add("sg-checkbox-cell");
        const g = p("input", { type: "checkbox" });
        g.checked = this.state.selection.has(this._rowId(t)), h.appendChild(g), e.appendChild(h);
        continue;
      }
      if (d._isGroupCol) {
        h.classList.add("sg-group-leaf-cell"), h.removeAttribute("data-cell-active"), h.removeAttribute("data-cell-range"), e.appendChild(h);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === d.field) {
        h.setAttribute("data-editing", "true");
        const g = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : b(t, d), { node: f, control: m } = this._buildEditor(d, g);
        h.appendChild(f);
        const v = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          m?.focus(), v || m?.select?.();
        });
      } else
        this._renderCellContent(h, t, d);
      e.appendChild(h);
    }
  }
  _renderCellContent(e, t, s) {
    if (s.cellRenderer) {
      const i = B(s.cellRenderer);
      if (i) {
        const o = b(t, s), r = R(t, s);
        (i.dataset.bind || i.dataset.bindText !== void 0) && (i.textContent = i.dataset.bind ? String(t[i.dataset.bind] ?? "") : r), i.dataset.bindAttr && i.setAttribute(i.dataset.bindAttr, o), i.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((a) => {
          a.dataset.bindText !== void 0 ? a.textContent = r : a.dataset.bind && (a.textContent = String(t[a.dataset.bind] ?? "")), a.dataset.bindAttr && a.setAttribute(a.dataset.bindAttr, o);
        }), e.appendChild(i);
        return;
      }
    }
    e.textContent = R(t, s);
  }
  toggleGroup(e, t = 0) {
    this._groupExpanded.set(e, !this._isGroupExpanded(e, t)), this.scheduleRender("group"), _(this.element, "grid:groupToggled", { groupId: e, expanded: this._groupExpanded.get(e) });
  }
  expandAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = -1, this.scheduleRender("group");
  }
  collapseAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = 0, this.scheduleRender("group");
  }
  setRowGroupColumns(e) {
    this.state.group.cols = Array.isArray(e) ? e.slice() : [], this._groupExpanded.clear(), this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("group"), _(this.element, "grid:columnRowGroupChanged", { rowGroupCols: this.state.group.cols.slice() });
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
    t == null ? delete this.state.group.aggs[e] : this.state.group.aggs[e] = t, this.scheduleRender("group"), _(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  // ----- Pivot mode -----
  // Toggling pivot mode rebuilds the display list (and therefore the visible
  // column set). Clears row + cell selection since the underlying cell graph
  // changes shape entirely.
  setPivotMode(e) {
    const t = !!e;
    this.state.pivot.mode !== t && (this.state.pivot.mode = t, this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), _(this.element, "grid:pivotModeChanged", { pivot: t }));
  }
  isPivotMode() {
    return !!this.state.pivot.mode;
  }
  setPivotColumns(e) {
    this.state.pivot.cols = Array.isArray(e) ? e.slice() : [], this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), _(this.element, "grid:columnPivotChanged", { pivotCols: this.state.pivot.cols.slice() });
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
    for (const { field: s, aggFunc: i } of e || [])
      s && i && (t[s] = i);
    this.state.group.aggs = t, this.scheduleRender(this.state.pivot.mode ? "pivot" : "group"), _(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  addValueColumn(e, t = "sum") {
    e && this.setColumnAggFunc(e, t);
  }
  removeValueColumn(e) {
    this.setColumnAggFunc(e, null);
  }
  // ----- Column header groups + pinned bottom row -----
  setColumnGroups(e) {
    this.columnGroupsValue = Array.isArray(e) ? e : [], this.scheduleRender("columns"), _(this.element, "grid:columnGroupsChanged", { columnGroups: this.columnGroupsValue });
  }
  getColumnGroups() {
    return Array.isArray(this.columnGroupsValue) ? this.columnGroupsValue.slice() : [];
  }
  setPinnedBottomRow(e) {
    this.pinnedBottomRowValue = !!e, this.scheduleRender("cells");
  }
  isPinnedBottomRow() {
    return !!this.pinnedBottomRowValue;
  }
  _buildGroupRow(e, t, s) {
    const i = `__g:${e.groupId}`;
    let o = s.get(i);
    return o || (o = p("tr")), o.dataset.rowId = i, o.dataset.group = "true", o.dataset.groupLevel = String(e.level), o.className = "sg-group-row", this._renderGroupRow(o, e, t), o;
  }
  _renderGroupRow(e, t, s) {
    e.innerHTML = "";
    const i = this._pinOffsets(), o = this._isGroupExpanded(t.groupId, t.level), r = (this.state.group.displayType || "singleColumn") === "singleColumn", a = !!(this.state.pivot?.mode && this._displayList?.pivot), d = t.__pivotAll === !0, c = s.filter((g) => !g._isRowNumber && !g._isCheckbox && !g._isGroupCol), h = c.some((g) => g.field === t.field) ? t.field : c[0]?.field, u = Math.max(0, t.level);
    d && e.classList.add("sg-pivot-all-row");
    for (const g of s) {
      const f = p("td", { "data-col-id": g.field, "data-pinned": g.pinned || null });
      if (g.pinned === "left" ? f.style.left = i.left[g.field] + "px" : g.pinned === "right" && (f.style.right = i.right[g.field] + "px"), g._isRowNumber || g._isCheckbox) {
        f.classList.add(g._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(f);
        continue;
      }
      if (a || r ? g._isGroupCol : g.field === h) {
        if (f.classList.add("sg-group-cell"), f.style.paddingLeft = `${8 + u * 18}px`, !d) {
          const v = p("span", {
            class: "sg-group-caret",
            "data-expanded": o ? "true" : "false",
            "aria-hidden": "true"
          });
          v.innerHTML = O, f.appendChild(v);
        }
        f.append(
          p("span", { class: "sg-group-label" }, this._groupValueLabel(t)),
          p("span", { class: "sg-group-count" }, ` (${t.count})`)
        );
      } else if (a && g._isPivot) {
        const v = b(t, g);
        v != null && (f.classList.add("sg-agg-cell"), f.textContent = this._formatAggregate(v));
      } else !g._isGroupCol && t.aggregates && t.aggregates[g.field] != null && (f.classList.add("sg-agg-cell"), f.textContent = this._formatAggregate(t.aggregates[g.field]));
      e.appendChild(f);
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
      const i = B(e.cellEditor);
      if (i) {
        const o = i.matches?.("input,select,textarea") ? i : i.querySelector?.("[data-editor-input]") || i.querySelector?.("input,select,textarea");
        return o && (this._seedEditorValue(o, e, t), o.addEventListener("keydown", this._onEditorKey), o.addEventListener("blur", this._onEditorBlur)), { node: i, control: o };
      }
    }
    const s = this._buildEditorInput(e, t);
    return { node: s, control: s };
  }
  _seedEditorValue(e, t, s) {
    if (t.type === "date" && s) {
      const i = s instanceof Date ? s : new Date(s);
      e.value = Number.isNaN(i?.getTime?.()) ? s ?? "" : i.toISOString().slice(0, 10);
    } else t.type === "boolean" ? e.value = s === !0 ? "true" : s === !1 ? "false" : "" : e.value = s ?? "";
  }
  _buildEditorInput(e, t) {
    let s;
    if (e.type === "number") s = p("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const i = t instanceof Date ? t : t ? new Date(t) : null, o = i ? i.toISOString().slice(0, 10) : "";
      s = p("input", { type: "date", value: o });
    } else e.type === "boolean" ? (s = p("select"), s.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : s = p("input", { type: "text", value: t ?? "" });
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
    const s = this.state.serverSide ? this.state.serverRowCount : this.state.rowData.length, i = this._displayList.grouped ? this._displayList.leafCount ?? this.filteredCount() : this.filteredCount();
    e.appendChild(this._statusPanel(
      "Rows",
      this._fmtInt(i),
      i !== s ? `of ${this._fmtInt(s)}` : null
    ));
    const o = this.state.selection.size;
    o > 0 && e.appendChild(this._statusPanel("Selected", this._fmtInt(o))), t.replaceChildren();
    const r = this.getRangeAggregates();
    if (r && r.count > 0) {
      const d = (this.statusBarAggsValue || []).filter((c) => c in r);
      for (const c of d) {
        const h = r[c];
        h == null && c !== "count" || t.appendChild(this._statusPanel(this._aggLabel(c), this._fmtAgg(c, h)));
      }
    }
    const a = r ? `${r.count}|${r.sum}|${r.avg}|${r.min}|${r.max}` : "";
    a !== this._lastRangeAggs && (this._lastRangeAggs = a, _(this.element, "grid:rangeAggsChanged", { aggs: r }));
  }
  _statusPanel(e, t, s = null) {
    const i = p("div", { class: "sg-status-panel" });
    return i.append(
      p("span", { class: "sg-status-label" }, `${e}:`),
      p("span", { class: "sg-status-value" }, t)
    ), s && i.appendChild(p("span", { class: "sg-status-aside" }, s)), i;
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
        for (let i = s.r0; i <= s.r1; i++) {
          const o = s.rows[i];
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
    const s = this._coerceRowId(t.dataset.rowId), i = e.target.closest("td");
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(s, "toggle");
      return;
    }
    if (i && i.dataset.gutter === "true") {
      if (this._rowDragMoved) {
        this._rowDragMoved = !1;
        return;
      }
      if (this.rowSelectionValue !== "") {
        const r = e.shiftKey ? "range" : e.metaKey || e.ctrlKey ? "toggle" : "replace";
        this.clearCellSelection(), this.toggleRowSelection(s, r), _(this.element, "grid:rowClicked", { rowId: s, row: this.state.rowData.find((a) => this._rowId(a) === s), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (i) {
      const r = this.state.rowData.find((d) => this._rowId(d) === s), a = i.dataset.colId;
      _(this.element, "grid:cellClicked", { rowId: s, colId: a, value: r?.[a], event: e });
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
    this.toggleRowSelection(s, o), _(this.element, "grid:rowClicked", { rowId: s, row: this.state.rowData.find((r) => this._rowId(r) === s), event: e });
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
    const t = Array.from(this.state.selection).map(String), s = new Set(t.includes(String(e)) ? t : [String(e)]), i = p("div", { class: "sg-drag-ghost sg-grid" }), o = p("table"), r = p("tbody");
    let a = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((c) => {
      if (s.has(c.dataset.rowId) && a < 6) {
        const h = c.cloneNode(!0);
        h.removeAttribute("data-selected"), h.querySelectorAll("td").forEach((u) => {
          u.style.left = "", u.style.right = "", u.removeAttribute("data-pinned"), u.removeAttribute("data-cell-active"), u.removeAttribute("data-cell-range");
        }), r.appendChild(h), a += 1;
      }
    }), o.appendChild(r), i.appendChild(o), s.size > a && i.appendChild(p("div", { class: "sg-drag-ghost-more" }, `+${s.size - a} more rows`)), i.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(i);
    const d = p("div", { class: "sg-drop-indicator" });
    document.body.appendChild(d), this._rowDrag = { ids: s, ghost: i, indicator: d, dropRowId: null, dropBefore: !0 }, document.body.classList.add("sg-row-dragging");
  }
  _updateDropIndicator(e) {
    const t = Array.from(this._tbody.querySelectorAll("tr[data-row-id]"));
    let s = null, i = !0;
    for (const d of t) {
      const c = d.getBoundingClientRect();
      if (e < c.top + c.height / 2) {
        s = d, i = !0;
        break;
      }
      s = d, i = !1;
    }
    if (!s) return;
    const o = s.getBoundingClientRect(), r = this._viewport.getBoundingClientRect(), a = this._rowDrag.indicator;
    a.style.left = `${r.left}px`, a.style.width = `${r.width}px`, a.style.top = `${(i ? o.top : o.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(s.dataset.rowId), this._rowDrag.dropBefore = i;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: s, dropRowId: i, dropBefore: o } = this._rowDrag;
    if (t.remove(), s.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, i == null || e.has(String(i))) return;
    const r = this.state.rowData, a = r.filter((h) => e.has(String(this._rowId(h)))), d = r.filter((h) => !e.has(String(this._rowId(h))));
    let c = d.findIndex((h) => this._rowId(h) === i);
    c < 0 ? c = d.length : o || (c += 1), d.splice(c, 0, ...a), this.state.rowData = d, this.state.sortModel = [], this.scheduleRender("data"), _(this.element, "grid:rowDragEnd", {
      ids: a.map((h) => this._rowId(h)),
      toRowId: i,
      before: o
    });
  }
  // Toggle the active/range data-attrs on the existing cell DOM without
  // rebuilding the tbody (so in-flight mouse interactions aren't disrupted).
  _applyCellSelHighlight() {
    const e = this._computeCellSelKeys();
    this._selKeys = e, this._tbody && (this._tbody.querySelectorAll("td[data-col-id]").forEach((t) => {
      const s = t.parentElement, i = `${s && s.dataset.rowId}:${t.dataset.colId}`;
      e.active === i ? t.setAttribute("data-cell-active", "true") : t.removeAttribute("data-cell-active"), e.range && e.range.has(i) ? t.setAttribute("data-cell-range", "true") : t.removeAttribute("data-cell-range");
    }), this._renderStatusBar());
  }
  // Rectangle (display indices) for a {anchor,focus} range, or null.
  _rangeRect(e) {
    if (!e) return null;
    const t = this._displayList.pageRows, s = this._visibleCols(), i = (h) => t.findIndex((u) => this._rowId(u) === h), o = (h) => s.findIndex((u) => u.field === h), r = i(e.anchor.rowId), a = o(e.anchor.colId);
    if (r < 0 || a < 0) return null;
    const d = i(e.focus.rowId), c = o(e.focus.colId);
    return {
      r0: Math.min(r, d < 0 ? r : d),
      r1: Math.max(r, d < 0 ? r : d),
      c0: Math.min(a, c < 0 ? a : c),
      c1: Math.max(a, c < 0 ? a : c),
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
      const i = e.rows[s];
      if (!i) continue;
      const o = [];
      for (let r = e.c0; r <= e.c1; r++) {
        const a = e.cols[r];
        a && o.push(R(i, a));
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
    for (const i of this.state.cellSel.ranges) {
      const o = this._rangeRect(i);
      if (o)
        for (let r = o.r0; r <= o.r1; r++) {
          const a = o.rows[r];
          if (a)
            for (let d = o.c0; d <= o.c1; d++) {
              const c = o.cols[d];
              if (!c) continue;
              const h = `${this._rowId(a)}:${c.field}`;
              h !== t && s.add(h);
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
        for (let i = s.r0; i <= s.r1; i++) {
          const o = s.rows[i];
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
    const i = this._displayList.pageRows, o = this._navCols();
    if (!i.length || !o.length) return;
    const r = (u, g, f) => Math.max(g, Math.min(u, f)), a = this._activeCell(), d = () => i.findIndex((u) => !u.__sgGroup);
    let c = a ? i.findIndex((u) => this._rowId(u) === a.rowId) : d(), h = a ? o.findIndex((u) => u.field === a.colId) : 0;
    if (c < 0 && (c = d()), !(c < 0)) {
      if (h < 0 && (h = 0), s && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const u = this.state.cellSel.ranges[this.state.cellSel.activeIdx], g = r(i.findIndex((m) => this._rowId(m) === u.focus.rowId) + e, 0, i.length - 1), f = r(o.findIndex((m) => m.field === u.focus.colId) + t, 0, o.length - 1);
        this._extendActiveRange({ rowId: this._rowId(i[g]), colId: o[f].field });
      } else {
        let u = r(c + e, 0, i.length - 1);
        if (e !== 0) {
          for (; i[u] && i[u].__sgGroup; ) {
            const f = u + e;
            if (f < 0 || f >= i.length) break;
            u = f;
          }
          if (!i[u] || i[u].__sgGroup) return;
        }
        const g = r(h + t, 0, o.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(i[u]), colId: o[g].field });
      }
      this._applyCellSelHighlight(), this._scrollActiveIntoView(), _(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
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
    }, this._applyCellSelHighlight(), _(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
  }
  // Clear the value of every selected, editable cell (Delete/Backspace).
  _clearSelectedCells() {
    let e = !1;
    for (const t of this.state.cellSel.ranges) {
      const s = this._rangeRect(t);
      if (s)
        for (let i = s.r0; i <= s.r1; i++) {
          const o = s.rows[i];
          if (!(!o || o.__sgGroup))
            for (let r = s.c0; r <= s.c1; r++) {
              const a = s.cols[r];
              if (!a || !a.editable || a._isCheckbox || a._isRowNumber) continue;
              const d = o[a.field];
              d === "" || d == null || (o[a.field] = "", e = !0, _(this.element, "grid:cellValueChanged", { rowId: this._rowId(o), colId: a.field, oldValue: d, newValue: "" }));
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
    const i = this._coerceRowId(t.dataset.rowId), o = s.dataset.colId;
    this.startEditingCell(i, o);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const s = this._visibleCols().filter((u) => u.editable && !u._isCheckbox), i = this._displayList.pageRows, o = i.findIndex((u) => this._rowId(u) === t.rowId), r = s.findIndex((u) => u.field === t.colId);
    if (!s.length || !i.length || o < 0 || r < 0) {
      this.stopEditing(!1);
      return;
    }
    const a = i.length * s.length, d = (o * s.length + r + e + a) % a, c = i[Math.floor(d / s.length)], h = s[d % s.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(c), h.field), requestAnimationFrame(() => {
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
    const i = t.map((r) => e.find((a) => a.field === r)).filter(Boolean), o = new Set(i);
    return [...i, ...e.filter((r) => !o.has(r))];
  }
  _pinOffsets() {
    const e = this._visibleCols(), t = {};
    let s = 0;
    for (const o of e)
      o.pinned === "left" && (t[o.field] = s, s += o.width || 150);
    const i = {};
    s = 0;
    for (let o = e.length - 1; o >= 0; o--) {
      const r = e[o];
      r.pinned === "right" && (i[r.field] = s, s += r.width || 150);
    }
    return { left: t, right: i };
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
  pageSize: { type: Number, default: N },
  rowHeight: { type: Number, default: we },
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
  sidePanel: { type: Boolean, default: !1 },
  // right-side tool panel for groups/pivots/values
  columnGroups: { type: Array, default: [] },
  // multi-row headers: [{headerName, children:[field,...]}]
  pinnedBottomRow: { type: Boolean, default: !1 }
  // sticky bottom row with grand totals (from aggFuncs)
});
function be(l, n) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (l[t] !== n[t]) return !1;
  return !0;
}
function ye(l) {
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
function Se(l, n) {
  if (n === "number") {
    const e = Number(l);
    return Number.isFinite(e) ? e : l;
  }
  return n === "date" ? l : n === "boolean" ? l === "true" ? !0 : l === "false" ? !1 : null : l;
}
function E(l) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(l)) : String(l).replace(/["\\\n\r]/g, (n) => "\\" + n);
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
      let i = !1;
      const o = (a) => {
        const d = Math.abs(a.clientX - t), c = Math.abs(a.clientY - s);
        !i && (d > 5 || c > 5) && (i = !0, document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", r), this._beginReorder(t));
      }, r = (a) => {
        document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", r), i || this.sort(a);
      };
      document.addEventListener("mousemove", o), document.addEventListener("mouseup", r);
    });
  }
  connect() {
    if (this.grid = ve(this.element, "grid", this.application), !!this.grid) {
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
    const t = this.element.parentElement, s = Array.from(t.children), i = s.indexOf(this.element);
    let o = i;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const r = (d) => {
      const c = d.clientX;
      let h = s.length;
      for (let u = 0; u < s.length; u++) {
        const g = s[u].getBoundingClientRect();
        if (c < g.left + g.width / 2) {
          h = u;
          break;
        }
      }
      o = h > i ? h - 1 : h;
    }, a = () => {
      document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", a), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", o !== i && this.grid.moveColumn(this.fieldValue, o);
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
    const t = e.clientX, s = this.element.offsetWidth, i = (r) => this.grid.setColumnWidth(this.fieldValue, s + (r.clientX - t)), o = () => {
      document.removeEventListener("mousemove", i), document.removeEventListener("mouseup", o), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", i), document.addEventListener("mouseup", o), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
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
class A extends x {
  constructor() {
    super(...arguments);
    w(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), s = e.paginationGetTotalPages(), i = e.paginationGetRowCount(), o = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const r = i === 0 ? 0 : t * o + 1, a = Math.min(i, r + o - 1);
        this.pageInfoTarget.textContent = i === 0 ? "0 rows" : `${r}–${a} of ${i}`;
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
w(A, "outlets", ["grid"]), w(A, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
const V = ["sum", "avg", "count", "min", "max"], Re = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', xe = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class Y extends x {
  connect() {
    this.grid = this.element.closest(".sg-grid"), this._activeTab = "columns", this._collapsed = !1, this._build(), this.grid?.gridApi ? this._render() : this.grid && this.grid.addEventListener("grid:ready", () => this._render(), { once: !0 }), this._gridListener = () => this._render();
    for (const n of [
      "grid:columnRowGroupChanged",
      "grid:columnPivotChanged",
      "grid:columnValueChanged",
      "grid:pivotModeChanged",
      "grid:columnVisible",
      "grid:rowDataChanged"
    ]) this.grid?.addEventListener(n, this._gridListener);
  }
  disconnect() {
    if (!(!this.grid || !this._gridListener))
      for (const n of [
        "grid:columnRowGroupChanged",
        "grid:columnPivotChanged",
        "grid:columnValueChanged",
        "grid:pivotModeChanged",
        "grid:columnVisible",
        "grid:rowDataChanged"
      ]) this.grid.removeEventListener(n, this._gridListener);
  }
  // ----- Skeleton -----
  _build() {
    this.element.innerHTML = "", this._content = p("div", { class: "sg-side-panel-content" });
    const n = p("div", { class: "sg-side-panel-tabs" });
    this._columnsTab = p("button", {
      type: "button",
      class: "sg-side-panel-tab",
      "aria-pressed": "true",
      title: "Columns"
    }), this._columnsTab.innerHTML = Re, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), n.appendChild(this._columnsTab), this.element.append(this._content, n);
  }
  _onTabClick(n) {
    this._activeTab === n && !this._collapsed ? (this._collapsed = !0, this.element.classList.add("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", "false")) : (this._collapsed = !1, this._activeTab = n, this.element.classList.remove("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", n === "columns" ? "true" : "false"), this._render());
  }
  // ----- Helpers -----
  _api() {
    return this.grid?.gridApi;
  }
  // Real (non-synthetic) columns the user can manipulate.
  _columns() {
    return (this._api()?.getColumnDefs() || []).filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol && !e._isPivot);
  }
  _colByField(n) {
    return (this._api()?.getColumnDefs() || []).find((e) => e.field === n);
  }
  // ----- Render -----
  _render() {
    if (this._collapsed || this._activeTab !== "columns") return;
    const n = this._api();
    if (!n) return;
    this._content.innerHTML = "";
    const e = p("label", { class: "sg-panel-pivot-toggle" }), t = p("input", { type: "checkbox" });
    t.checked = n.isPivotMode(), t.addEventListener("change", () => n.setPivotMode(t.checked)), e.append(t, p("span", {}, "Pivot mode")), this._content.appendChild(e), this._content.appendChild(this._renderColumnsList()), this._content.appendChild(this._renderDropSection({
      title: "Row Groups",
      placeholder: "Drag here to group rows",
      kind: "rowGroup",
      fields: n.getRowGroupColumns()
    })), this._content.appendChild(this._renderValuesSection()), n.isPivotMode() && this._content.appendChild(this._renderDropSection({
      title: "Column Labels",
      placeholder: "Drag here to pivot columns",
      kind: "pivot",
      fields: n.getPivotColumns()
    }));
  }
  _renderColumnsList() {
    const n = this._api(), e = p("div", { class: "sg-panel-section" });
    e.appendChild(p("div", { class: "sg-panel-section-title" }, "Columns"));
    const t = p("ul", { class: "sg-column-list" });
    e.appendChild(t);
    const s = new Set(n.getRowGroupColumns()), i = new Set(n.getPivotColumns()), o = new Map(n.getValueColumns().map((r) => [r.field, r.aggFunc]));
    for (const r of this._columns()) {
      const a = p("li", { class: "sg-column-list-item", draggable: "true" });
      a.dataset.field = r.field;
      const d = p("span", { class: "sg-column-grip", "aria-hidden": "true" });
      d.innerHTML = xe;
      const c = p("input", { type: "checkbox" });
      c.checked = !r.hidden, c.addEventListener("change", () => n.setColumnVisible(r.field, c.checked));
      const h = p("span", { class: "sg-column-list-label" }, r.headerName || r.field), u = p("span", { class: "sg-column-list-tags" });
      s.has(r.field) && u.appendChild(p("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), i.has(r.field) && u.appendChild(p("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), o.has(r.field) && u.appendChild(p("span", { class: "sg-tag sg-tag-value", title: `Value (${o.get(r.field)})` }, o.get(r.field))), a.append(d, c, h, u), this._wireDragSource(a, r.field), t.appendChild(a);
    }
    return this._wireDropZone(t, "columns"), e;
  }
  _renderDropSection({ title: n, placeholder: e, kind: t, fields: s }) {
    const i = p("div", { class: "sg-panel-section sg-panel-drop" });
    i.appendChild(p("div", { class: "sg-panel-section-title" }, n));
    const o = p("div", { class: "sg-drop-zone" });
    if (o.dataset.dropKind = t, !s.length)
      o.classList.add("sg-drop-zone-empty"), o.appendChild(p("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const r of s) o.appendChild(this._renderChip(t, r));
    return this._wireDropZone(o, t), i.appendChild(o), i;
  }
  _renderValuesSection() {
    const n = this._api(), e = p("div", { class: "sg-panel-section sg-panel-drop" });
    e.appendChild(p("div", { class: "sg-panel-section-title" }, "Values"));
    const t = p("div", { class: "sg-drop-zone" });
    t.dataset.dropKind = "value";
    const s = n.getValueColumns();
    if (!s.length)
      t.classList.add("sg-drop-zone-empty"), t.appendChild(p("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
    else
      for (const { field: i, aggFunc: o } of s) t.appendChild(this._renderValueChip(i, o));
    return this._wireDropZone(t, "value"), e.appendChild(t), e;
  }
  _renderChip(n, e) {
    const t = this._colByField(e), s = p("span", { class: "sg-chip", draggable: "true" });
    return s.dataset.field = e, s.dataset.fromKind = n, s.append(
      p("span", { class: "sg-chip-label" }, t?.headerName || e),
      this._removeButton(() => this._removeFrom(n, e))
    ), this._wireDragSource(s, e), s;
  }
  _renderValueChip(n, e) {
    const t = this._api(), s = this._colByField(n), i = p("span", { class: "sg-chip sg-chip-value", draggable: "true" });
    i.dataset.field = n, i.dataset.fromKind = "value";
    const o = p("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return o.addEventListener("click", (r) => {
      r.stopPropagation();
      const a = V.indexOf(e), d = V[(a === -1 ? 0 : a + 1) % V.length];
      t.setColumnAggFunc(n, d);
    }), i.append(
      o,
      p("span", { class: "sg-chip-label" }, s?.headerName || n),
      this._removeButton(() => t.removeValueColumn(n))
    ), this._wireDragSource(i, n), i;
  }
  _removeButton(n) {
    const e = p("button", { type: "button", class: "sg-chip-remove", "aria-label": "Remove", title: "Remove" });
    return e.textContent = "×", e.addEventListener("click", (t) => {
      t.stopPropagation(), n();
    }), e;
  }
  // ----- DnD plumbing -----
  _wireDragSource(n, e) {
    n.addEventListener("dragstart", (t) => {
      t.dataTransfer.effectAllowed = "move", t.dataTransfer.setData("text/plain", e), n.classList.add("sg-dragging");
    }), n.addEventListener("dragend", () => n.classList.remove("sg-dragging"));
  }
  _wireDropZone(n, e) {
    n.addEventListener("dragover", (t) => {
      t.preventDefault(), t.dataTransfer.dropEffect = "move", n.classList.add("sg-drop-over");
    }), n.addEventListener("dragleave", (t) => {
      t.target === n && n.classList.remove("sg-drop-over");
    }), n.addEventListener("drop", (t) => {
      t.preventDefault(), n.classList.remove("sg-drop-over");
      const s = t.dataTransfer.getData("text/plain");
      s && this._handleDrop(e, s);
    });
  }
  // A field lives in at most one of {rowGroup, pivot, value} at a time.
  // Dropping on a zone removes it from the others first.
  _handleDrop(n, e) {
    const t = this._api();
    if (n === "columns") {
      this._removeEverywhere(e);
      return;
    }
    this._removeEverywhere(e, n), n === "rowGroup" ? t.addRowGroupColumn(e) : n === "pivot" ? t.addPivotColumn(e) : n === "value" && t.addValueColumn(e, "sum");
  }
  _removeFrom(n, e) {
    const t = this._api();
    n === "rowGroup" ? t.removeRowGroupColumn(e) : n === "pivot" ? t.removePivotColumn(e) : n === "value" && t.removeValueColumn(e);
  }
  _removeEverywhere(n, e = null) {
    const t = this._api();
    e !== "rowGroup" && t.removeRowGroupColumn(n), e !== "pivot" && t.removePivotColumn(n), e !== "value" && t.removeValueColumn(n);
  }
}
function De(l) {
  const n = l ?? J.start();
  return n.register("grid", P), n.register("header-cell", k), n.register("row", j), n.register("cell", U), n.register("filter", X), n.register("pagination", A), n.register("side-panel", Y), n;
}
const Ee = {
  start: De,
  GridController: P,
  HeaderCellController: k,
  RowController: j,
  CellController: U,
  FilterController: X,
  PaginationController: A,
  SidePanelController: Y
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = Ee);
export {
  U as CellController,
  X as FilterController,
  P as GridController,
  k as HeaderCellController,
  A as PaginationController,
  j as RowController,
  Y as SidePanelController,
  Ee as default,
  De as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
