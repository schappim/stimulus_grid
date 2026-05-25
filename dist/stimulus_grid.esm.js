var Z = Object.defineProperty;
var J = (o, n, e) => n in o ? Z(o, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[n] = e;
var w = (o, n, e) => J(o, typeof n != "symbol" ? n + "" : n, e);
import { Controller as x, Application as ee } from "@hotwired/stimulus";
function b(o, n) {
  return typeof n.valueGetter == "function" ? n.valueGetter(o) : o?.[n.field];
}
function R(o, n) {
  const e = b(o, n);
  return typeof n.valueFormatter == "function" ? n.valueFormatter(e, o) : e == null ? "" : n.type === "date" && e instanceof Date ? e.toLocaleDateString() : n.type === "boolean" ? e ? "✓" : "" : String(e);
}
const q = {
  contains: (o, n) => String(o ?? "").toLowerCase().includes(String(n ?? "").toLowerCase()),
  notContains: (o, n) => !String(o ?? "").toLowerCase().includes(String(n ?? "").toLowerCase()),
  equals: (o, n) => String(o ?? "").toLowerCase() === String(n ?? "").toLowerCase(),
  notEqual: (o, n) => String(o ?? "").toLowerCase() !== String(n ?? "").toLowerCase(),
  startsWith: (o, n) => String(o ?? "").toLowerCase().startsWith(String(n ?? "").toLowerCase()),
  endsWith: (o, n) => String(o ?? "").toLowerCase().endsWith(String(n ?? "").toLowerCase()),
  blank: (o) => o == null || o === "",
  notBlank: (o) => o != null && o !== ""
}, te = {
  equals: (o, n) => Number(o) === Number(n),
  notEqual: (o, n) => Number(o) !== Number(n),
  lessThan: (o, n) => Number(o) < Number(n),
  lessThanOrEqual: (o, n) => Number(o) <= Number(n),
  greaterThan: (o, n) => Number(o) > Number(n),
  greaterThanOrEqual: (o, n) => Number(o) >= Number(n),
  inRange: (o, n, e) => Number(o) >= Number(n) && Number(o) <= Number(e),
  blank: (o) => o == null || o === "",
  notBlank: (o) => o != null && o !== ""
};
function y(o) {
  if (o == null || o === "") return null;
  if (o instanceof Date) return o;
  const n = new Date(o);
  return Number.isNaN(n.valueOf()) ? null : n;
}
const se = {
  equals: (o, n) => y(o)?.toDateString() === y(n)?.toDateString(),
  notEqual: (o, n) => y(o)?.toDateString() !== y(n)?.toDateString(),
  lessThan: (o, n) => (y(o)?.valueOf() ?? -1 / 0) < (y(n)?.valueOf() ?? 1 / 0),
  greaterThan: (o, n) => (y(o)?.valueOf() ?? 1 / 0) > (y(n)?.valueOf() ?? -1 / 0),
  inRange: (o, n, e) => {
    const t = y(o)?.valueOf();
    return t != null && t >= (y(n)?.valueOf() ?? -1 / 0) && t <= (y(e)?.valueOf() ?? 1 / 0);
  },
  blank: (o) => o == null || o === "",
  notBlank: (o) => o != null && o !== ""
}, ie = {
  equals: (o, n) => n === "true" ? !!o : n === "false" ? !o : !0
}, ne = {
  in: (o, n) => Array.isArray(n) && n.includes(String(o ?? ""))
}, le = { text: q, number: te, date: se, boolean: ie, set: ne };
function oe(o, n, e) {
  if (!e) return !0;
  const t = e.filterType || n.filter || "text", i = (le[t] || q)[e.type];
  if (!i) return !0;
  const l = b(o, n);
  return i(l, e.value, e.value2);
}
function $(o, n, e) {
  const t = Object.entries(n || {}).filter(([, s]) => s != null);
  return t.length === 0 ? o : o.filter((s) => t.every(([i, l]) => {
    const r = e[i];
    return r ? oe(s, r, l) : !0;
  }));
}
function K(o, n, e) {
  if (!n) return o;
  const t = String(n).toLowerCase();
  return o.filter((s) => {
    for (const i of e) {
      const l = R(s, i);
      if (l && String(l).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function L(o, n, e) {
  if (o == null && n == null) return 0;
  if (o == null) return -1;
  if (n == null) return 1;
  if (e === "number") return Number(o) - Number(n);
  if (e === "date") {
    const t = y(o)?.valueOf() ?? 0, s = y(n)?.valueOf() ?? 0;
    return t - s;
  }
  return e === "boolean" ? o === n ? 0 : o ? 1 : -1 : String(o).localeCompare(String(n), void 0, { numeric: !0, sensitivity: "base" });
}
function re(o, n, e) {
  if (!n || n.length === 0) return o;
  const t = o.slice();
  return t.sort((s, i) => {
    for (const { colId: l, sort: r } of n) {
      const a = e[l];
      if (!a) continue;
      const d = b(s, a), u = b(i, a), h = typeof a.comparator == "function" ? a.comparator(d, u, s, i) : L(d, u, a.type);
      if (h !== 0) return r === "desc" ? -h : h;
    }
    return 0;
  }), t;
}
function I(o, n) {
  if (!n || !n.enabled) return { rows: o, total: o.length, pageRows: o };
  const e = o.length, t = Math.max(1, Math.ceil(e / n.pageSize)), s = Math.min(n.page, t - 1), i = s * n.pageSize, l = o.slice(i, i + n.pageSize);
  return { rows: o, total: e, totalPages: t, page: s, pageRows: l };
}
function H(o, n, e) {
  if (o === "count") return n.length;
  const t = n.map((i) => b(i, e));
  if (o === "first") return t.length ? t[0] : null;
  if (o === "last") return t.length ? t[t.length - 1] : null;
  const s = t.map(Number).filter((i) => !Number.isNaN(i));
  switch (o) {
    case "sum":
      return s.reduce((i, l) => i + l, 0);
    case "avg":
      return s.length ? s.reduce((i, l) => i + l, 0) / s.length : null;
    case "min":
      return s.length ? Math.min(...s) : null;
    case "max":
      return s.length ? Math.max(...s) : null;
    default:
      return null;
  }
}
function M(o, n, e) {
  const t = {};
  for (const [s, i] of Object.entries(n || {})) {
    const l = e[s];
    l && (t[s] = H(i, o, l));
  }
  return t;
}
function ae(o) {
  let n = 0, e = 0, t = 0, s = 1 / 0, i = -1 / 0;
  for (const l of o) {
    if (l == null || l === "") continue;
    n += 1;
    let r = null;
    if (typeof l == "number" && Number.isFinite(l)) r = l;
    else if (typeof l == "string" && l.trim() !== "") {
      const a = Number(l);
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
function de(o, n, e, t, s = () => !0) {
  const i = (d, u, h) => {
    const c = n[u], g = /* @__PURE__ */ new Map();
    for (const f of d) {
      const _ = b(f, c), v = _ == null ? "" : String(_);
      g.has(v) || g.set(v, { value: _, rows: [] }), g.get(v).rows.push(f);
    }
    return Array.from(g.values()).sort((f, _) => L(f.value, _.value, c.type)).map(({ value: f, rows: _ }) => {
      const v = f == null ? "" : String(f), C = h ? `${h}|${c.field}=${v}` : `${c.field}=${v}`;
      return {
        __sgGroup: !0,
        level: u,
        field: c.field,
        value: f,
        groupId: C,
        count: _.length,
        aggregates: M(_, t, e),
        leaves: _,
        children: u + 1 < n.length ? i(_, u + 1, C) : null
      };
    });
  }, l = i(o, 0, ""), r = [], a = (d) => {
    for (const u of d)
      if (r.push(u), !!s(u.groupId, u.level))
        if (u.children) a(u.children);
        else for (const h of u.leaves) r.push(h);
  };
  return a(l), { displayList: r, tree: l };
}
function W(o, n, e) {
  return `__p|${e.map((s) => {
    const i = o[s.field];
    return `${s.field}=${i == null ? "" : String(i)}`;
  }).join("|")}|${n.col.field}:${n.aggFunc}`;
}
function j(o, n) {
  return n.map((e) => {
    const t = b(o, e);
    return t == null ? "" : String(t);
  }).join("");
}
function ue(o, n) {
  if (!n?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const t of o) {
    const s = j(t, n);
    if (!e.has(s)) {
      const i = {};
      n.forEach((l) => {
        const r = b(t, l);
        i[l.field] = r ?? null;
      }), e.set(s, i);
    }
  }
  return Array.from(e.values()).sort((t, s) => {
    for (const i of n) {
      const l = L(t[i.field], s[i.field], i.type);
      if (l !== 0) return l;
    }
    return 0;
  });
}
function ce(o, n, e) {
  if (!o.length || !n.length) return [];
  const t = [], s = n.length === 1;
  for (const i of o)
    for (const l of n) {
      const r = W(i, l, e), a = e.map((u) => i[u.field] == null ? "(Blank)" : String(i[u.field])).join(" · "), d = s ? a : `${a} · ${l.aggFunc}(${l.col.field})`;
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
        valueField: l.col.field,
        aggFunc: l.aggFunc,
        valueGetter: (u) => u?.__pivotValues?.[r] ?? null
      });
    }
  return t;
}
function B(o, n, e, t) {
  const s = {}, i = /* @__PURE__ */ new Map();
  for (const l of o) {
    const r = j(l, t);
    i.has(r) || i.set(r, []), i.get(r).push(l);
  }
  for (const l of n) {
    const r = t.map((d) => {
      const u = l[d.field];
      return u == null ? "" : String(u);
    }).join(""), a = i.get(r) || [];
    for (const d of e) {
      const u = W(l, d, t);
      s[u] = a.length ? H(d.aggFunc, a, d.col) : null;
    }
  }
  return s;
}
function he({ rows: o, rowGroupCols: n = [], pivotCols: e, valueConfigs: t, isExpanded: s = () => !0 }) {
  const i = ue(o, e), l = ce(i, t, e), r = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: o.length,
    aggregates: {},
    leaves: o,
    __pivotValues: B(o, i, t, e)
  };
  if (!n.length)
    return { columns: l, displayList: [r], tree: [], combos: i };
  const a = (c, g, f) => {
    const _ = n[g], v = /* @__PURE__ */ new Map();
    for (const C of c) {
      const S = b(C, _), D = S == null ? "" : String(S);
      v.has(D) || v.set(D, { value: S, rows: [] }), v.get(D).rows.push(C);
    }
    return Array.from(v.values()).sort((C, S) => L(C.value, S.value, _.type)).map(({ value: C, rows: S }) => {
      const D = C == null ? "" : String(C), T = f ? `${f}|${_.field}=${D}` : `${_.field}=${D}`;
      return {
        __sgGroup: !0,
        level: g,
        field: _.field,
        value: C,
        groupId: T,
        count: S.length,
        aggregates: {},
        leaves: S,
        __pivotValues: B(S, i, t, e),
        children: g + 1 < n.length ? a(S, g + 1, T) : null
      };
    });
  }, d = a(o, 0, ""), u = [r], h = (c) => {
    for (const g of c)
      u.push(g), s(g.groupId, g.level) && g.children && h(g.children);
  };
  return h(d), { columns: l, displayList: u, tree: d, combos: i };
}
function pe(o, { pivotCols: n = [], valueConfigs: e = [], columnGroups: t = null } = {}) {
  if (o._isPivot && n.length && o.pivotKeys)
    return ge(o, n, e);
  if (t && Array.isArray(t) && t.length && !o._isGroupCol && !o._isCheckbox && !o._isRowNumber) {
    for (const s of t)
      if (s?.children && s.children.includes(o.field))
        return [
          { kind: "group", id: `g:${s.headerName}`, label: s.headerName },
          { kind: "leaf", col: o }
        ];
  }
  return [{ kind: "leaf", col: o }];
}
function ge(o, n, e) {
  const t = (e?.length || 0) > 1, s = [];
  for (let i = 0; i < n.length; i++) {
    const l = n[i].field, r = o.pivotKeys[l];
    if (i === n.length - 1 && !t)
      return s.push({ kind: "leaf", col: o, label: r == null ? "(Blank)" : String(r) }), s;
    s.push({
      kind: "group",
      id: `p:${i}:${r == null ? "" : String(r)}`,
      label: r == null ? "(Blank)" : String(r)
    });
  }
  return s.push({ kind: "leaf", col: o, label: `${o.aggFunc}(${o.valueField})` }), s;
}
function fe(o, n = {}) {
  if (!o.length) return { rows: [[]], depth: 1 };
  const e = o.map((i) => pe(i, n).slice()), t = Math.max(1, ...e.map((i) => i.length)), s = [];
  for (let i = 0; i < t; i++) {
    const l = [];
    let r = 0;
    for (; r < e.length; ) {
      const a = e[r];
      if (i >= a.length || a[i] === null) {
        r += 1;
        continue;
      }
      const d = a[i];
      if (d.kind === "leaf") {
        l.push({ kind: "leaf", col: d.col, label: d.label, rowspan: t - i, colspan: 1 });
        for (let h = i + 1; h < t; h++) a[h] = null;
        r += 1;
        continue;
      }
      let u = r + 1;
      for (; u < e.length; ) {
        const h = e[u];
        if (i >= h.length || !h[i] || h[i].kind !== "group" || h[i].id !== d.id) break;
        let c = !0;
        for (let g = 0; g < i; g++) {
          const f = a[g]?.id ?? null, _ = h[g]?.id ?? null;
          if (f !== _) {
            c = !1;
            break;
          }
        }
        if (!c) break;
        u += 1;
      }
      l.push({ kind: "group", label: d.label, colspan: u - r, rowspan: 1 }), r = u;
    }
    s.push(l);
  }
  return { rows: s, depth: t };
}
function me(o) {
  if (o.serverSide) {
    const d = o.rowData, u = o.pagination?.pageSize || d.length || 1, h = o.serverRowCount ?? d.length, c = Math.max(1, Math.ceil(h / u)), g = Math.min(o.pagination?.page || 0, c - 1);
    return { filteredSorted: d, rows: d, total: h, totalPages: c, page: g, pageRows: d };
  }
  const n = Object.fromEntries(o.columnDefs.map((d) => [d.field, d])), e = o.columnDefs.filter((d) => !d.hidden && !d._isCheckbox);
  let t = o.rowData;
  t = $(t, o.filterModel, n), t = K(t, o.quickFilter, e), t = re(t, o.sortModel, n);
  const s = (o.rowGroupCols || []).filter((d) => n[d]), i = o.pivotMode ? (o.pivotCols || []).filter((d) => n[d]) : [], l = o.pivotMode ? Object.entries(o.aggModel || {}).filter(([d]) => n[d]).map(([d, u]) => ({ col: n[d], aggFunc: u })) : [];
  if (o.pivotMode && i.length && l.length) {
    const d = s.map((v) => n[v]), u = i.map((v) => n[v]), { columns: h, displayList: c, tree: g, combos: f } = he({
      rows: t,
      rowGroupCols: d,
      pivotCols: u,
      valueConfigs: l,
      isExpanded: o.isGroupExpanded
    }), _ = I(c, o.pagination);
    return {
      pivot: !0,
      pivotResultColumns: h,
      combos: f,
      grouped: !0,
      tree: g,
      leafCount: t.length,
      grandTotals: M(t, o.aggModel, n),
      filteredSorted: c,
      ..._
    };
  }
  if (s.length) {
    const d = s.map((g) => n[g]), { displayList: u, tree: h } = de(
      t,
      d,
      n,
      o.aggModel,
      o.isGroupExpanded
    ), c = I(u, o.pagination);
    return {
      grouped: !0,
      tree: h,
      leafCount: t.length,
      grandTotals: M(t, o.aggModel, n),
      filteredSorted: u,
      ...c
    };
  }
  const r = I(t, o.pagination), a = o.aggModel && Object.keys(o.aggModel).length ? M(t, o.aggModel, n) : null;
  return { filteredSorted: t, grandTotals: a, ...r };
}
function _e(o, n, e, t, s = 6) {
  const i = Math.ceil(n / e), l = Math.max(0, Math.floor(o / e) - s), r = Math.min(t, l + i + s * 2);
  return { first: l, last: r };
}
function ve(o) {
  return {
    // ---- Data ----
    setRowData(n) {
      o.setRowData(n);
    },
    getRowData() {
      return o.state.rowData.slice();
    },
    applyTransaction(n) {
      return o.applyTransaction(n);
    },
    // Server-side row model
    setRowCount(n) {
      o.setRowCount(n);
    },
    getRowCount() {
      return o.state.serverSide ? o.state.serverRowCount : o.state.rowData.length;
    },
    isServerSide() {
      return !!o.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(n) {
      o.setColumnDefs(n);
    },
    getColumnDefs() {
      return o.state.columnDefs.slice();
    },
    setColumnVisible(n, e) {
      o.setColumnVisible(n, e);
    },
    setColumnPinned(n, e) {
      o.setColumnPinned(n, e);
    },
    setColumnWidth(n, e) {
      o.setColumnWidth(n, e);
    },
    moveColumn(n, e) {
      o.moveColumn(n, e);
    },
    autoSizeColumn(n) {
      o.autoSizeColumn(n);
    },
    autoSizeAllColumns() {
      o.state.columnDefs.forEach((n) => o.autoSizeColumn(n.field));
    },
    sizeColumnsToFit() {
      o.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(n) {
      o.setSortModel(n);
    },
    getSortModel() {
      return o.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(n) {
      o.setFilterModel(n);
    },
    getFilterModel() {
      return { ...o.state.filterModel };
    },
    setColumnFilter(n, e) {
      o.setColumnFilter(n, e);
    },
    destroyFilter(n) {
      o.setColumnFilter(n, null);
    },
    setQuickFilter(n) {
      o.setQuickFilter(n);
    },
    getQuickFilter() {
      return o.getQuickFilter();
    },
    // ---- Selection ----
    selectAll() {
      o.selectAll();
    },
    deselectAll() {
      o.deselectAll();
    },
    selectRow(n) {
      o.setSelected(n, !0);
    },
    deselectRow(n) {
      o.setSelected(n, !1);
    },
    getSelectedRows() {
      return o.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(o.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(n) {
      o.goToPage(n);
    },
    paginationGoToFirstPage() {
      o.goToPage(0);
    },
    paginationGoToNextPage() {
      o.goToPage(o.state.pagination.page + 1);
    },
    paginationGoToPreviousPage() {
      o.goToPage(o.state.pagination.page - 1);
    },
    paginationGoToLastPage() {
      o.goToPage(o.lastPageIndex());
    },
    paginationSetPageSize(n) {
      o.setPageSize(n);
    },
    paginationGetCurrentPage() {
      return o.state.pagination.page;
    },
    paginationGetTotalPages() {
      return o.totalPages();
    },
    paginationGetRowCount() {
      return o.filteredCount();
    },
    paginationGetPageSize() {
      return o.state.pagination.pageSize;
    },
    paginationIsEnabled() {
      return o.state.pagination.enabled;
    },
    // ---- Cell selection ----
    getCellSelection() {
      return o.getCellSelectionDetail();
    },
    getCellRangeValues() {
      return o._cellRangeRows();
    },
    getCellSelectionRowIds() {
      return o.getCellSelectionRowIds();
    },
    getRangeAggregates() {
      return o.getRangeAggregates();
    },
    // ---- Editing ----
    startEditingCell({ rowId: n, colId: e }) {
      o.startEditingCell(n, e);
    },
    stopEditing(n = !1) {
      o.stopEditing(n);
    },
    // ---- Row grouping + aggregation ----
    setRowGroupColumns(n) {
      o.setRowGroupColumns(n);
    },
    addRowGroupColumn(n) {
      o.addRowGroupColumn(n);
    },
    removeRowGroupColumn(n) {
      o.removeRowGroupColumn(n);
    },
    getRowGroupColumns() {
      return o.getRowGroupColumns();
    },
    setColumnAggFunc(n, e) {
      o.setColumnAggFunc(n, e);
    },
    expandAll() {
      o.expandAll();
    },
    collapseAll() {
      o.collapseAll();
    },
    toggleGroup(n, e) {
      o.toggleGroup(n, e);
    },
    // ---- Pivot ----
    setPivotMode(n) {
      o.setPivotMode(n);
    },
    isPivotMode() {
      return o.isPivotMode();
    },
    setPivotColumns(n) {
      o.setPivotColumns(n);
    },
    addPivotColumn(n) {
      o.addPivotColumn(n);
    },
    removePivotColumn(n) {
      o.removePivotColumn(n);
    },
    getPivotColumns() {
      return o.getPivotColumns();
    },
    // ---- Value columns (aggregations; shared with grouping) ----
    setValueColumns(n) {
      o.setValueColumns(n);
    },
    addValueColumn(n, e = "sum") {
      o.addValueColumn(n, e);
    },
    removeValueColumn(n) {
      o.removeValueColumn(n);
    },
    getValueColumns() {
      return o.getValueColumns();
    },
    // ---- Column header groups (multi-row headers) ----
    setColumnGroups(n) {
      o.setColumnGroups(n);
    },
    getColumnGroups() {
      return o.getColumnGroups();
    },
    // ---- Pinned bottom row (sticky grand totals) ----
    setPinnedBottomRow(n) {
      o.setPinnedBottomRow(n);
    },
    isPinnedBottomRow() {
      return o.isPinnedBottomRow();
    },
    // ---- Master/detail ----
    setMasterDetail(n) {
      o.setMasterDetail(n);
    },
    isMasterDetail() {
      return o.isMasterDetail();
    },
    expandDetailRow(n) {
      o.expandDetailRow(n);
    },
    collapseDetailRow(n) {
      o.collapseDetailRow(n);
    },
    toggleDetailRow(n) {
      o.toggleDetailRow(n);
    },
    expandAllDetails() {
      o.expandAllDetails();
    },
    collapseAllDetails() {
      o.collapseAllDetails();
    },
    getDetailExpandedRowIds() {
      return o.getDetailExpandedRowIds();
    },
    // ---- Column state + persistence ----
    getColumnState() {
      return o.getColumnState();
    },
    applyColumnState(n) {
      o.applyColumnState(n);
    },
    clearPersistedState() {
      o.clearPersistedState();
    },
    getPersistKey() {
      return o.persistKeyValue || "";
    },
    // ---- Export ----
    getDataAsCsv(n = {}) {
      return o.getDataAsCsv(n);
    },
    exportDataAsCsv(n = {}) {
      return o.exportDataAsCsv(n);
    },
    // ---- Display ----
    refreshCells(n = {}) {
      o.refresh(n);
    },
    redrawRows(n = {}) {
      o.refresh(n);
    },
    // ---- Events ----
    addEventListener(n, e) {
      o.element.addEventListener(n, e);
    },
    removeEventListener(n, e) {
      o.element.removeEventListener(n, e);
    }
  };
}
function p(o, n = {}, e = []) {
  const t = document.createElement(o);
  for (const [s, i] of Object.entries(n))
    i === !1 || i == null || (s === "class" ? t.className = i : s === "style" && typeof i == "object" ? Object.assign(t.style, i) : s.startsWith("on") && typeof i == "function" ? t.addEventListener(s.slice(2).toLowerCase(), i) : i === !0 ? t.setAttribute(s, "") : t.setAttribute(s, String(i)));
  for (const s of [].concat(e))
    s == null || s === !1 || t.appendChild(typeof s == "string" ? document.createTextNode(s) : s);
  return t;
}
function N(o, n) {
  for (const [e, t] of Object.entries(n))
    t == null || t === !1 ? o.removeAttribute(e) : t === !0 ? o.setAttribute(e, "") : o.setAttribute(e, String(t));
}
function F(o) {
  const n = document.getElementById(o);
  return !n || n.tagName !== "TEMPLATE" ? null : n.content.firstElementChild.cloneNode(!0);
}
function m(o, n, e) {
  o.dispatchEvent(new CustomEvent(n, { detail: e, bubbles: !0 }));
}
function we(o, n, e) {
  let t = o.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(n)) {
      const i = e.getControllerForElementAndIdentifier(t, n);
      if (i) return i;
    }
    t = t.parentElement;
  }
  return null;
}
const Ce = 32, z = 100, V = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', be = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>', O = [
  "grid:columnMoved",
  "grid:columnPinned",
  "grid:columnResized",
  "grid:columnVisible",
  "grid:columnRowGroupChanged",
  "grid:columnPivotChanged",
  "grid:pivotModeChanged",
  "grid:columnValueChanged",
  "grid:columnGroupsChanged",
  "grid:sortChanged",
  "grid:filterChanged"
];
class k extends x {
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
    // ----- Right-click column menu -----
    //
    // contextmenu on a leaf <th> opens a fixed-positioned popup with quick
    // actions for that column: pin/unpin (left|right), autosize, group/pivot
    // toggles, aggregate selector, and hide. Synthetic columns (gutter,
    // checkbox, auto-Group, pivot result) suppress the menu — they're owned by
    // the grid and shouldn't be poked through this surface.
    w(this, "_onHeaderContextMenu", (e) => {
      const t = e.target.closest("th[data-field], th[data-header-cell-field-value]");
      if (!t) return;
      const s = t.getAttribute("data-field") || t.getAttribute("data-header-cell-field-value"), i = this._colByField(s);
      !i || i._isCheckbox || i._isRowNumber || i._isGroupCol || i._isPivot || (e.preventDefault(), this._showColumnMenu(i, e.clientX, e.clientY));
    });
    w(this, "_onDocMouseDownColumnMenu", (e) => {
      this._columnMenu && !this._columnMenu.contains(e.target) && this._closeColumnMenu();
    });
    w(this, "_onColumnMenuKey", (e) => {
      e.key === "Escape" && (e.stopPropagation(), this._closeColumnMenu());
    });
    w(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
    });
    w(this, "_onCellMouseDown", (e) => {
      if (e.button !== 0) return;
      if (this.rowDragValue) {
        const i = e.target.closest?.('td[data-gutter="true"]');
        if (i) {
          const l = i.closest("tr");
          this._rowDragPending = { rowId: this._coerceRowId(l.dataset.rowId), x: e.clientX, y: e.clientY }, this._rowDragMoved = !1, document.addEventListener("mousemove", this._onRowDragMove);
          return;
        }
      }
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : s ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), m(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    w(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      s && s.focus.rowId === t.rowId && s.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), m(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
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
      const i = this._cellRangeRows(s).map((l) => l.map((r) => String(r ?? "")).join("	")).join(`
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
      const l = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (l[s]) {
        e.preventDefault();
        const [r, a] = l[s];
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
      pagination: { enabled: !1, page: 0, pageSize: z },
      scrollTop: 0,
      viewportHeight: 400,
      group: { cols: [], aggs: {}, defaultExpanded: -1 }
    }, this._displayList = { filteredSorted: [], pageRows: [], total: 0, totalPages: 1, page: 0 }, this._renderPending = !1, this._dirty = /* @__PURE__ */ new Set(), this._lastRenderedRowIds = /* @__PURE__ */ new Set(), this._runtimeOverrides = /* @__PURE__ */ Object.create(null), this._groupExpanded = /* @__PURE__ */ new Map(), this._detailExpanded = /* @__PURE__ */ new Set(), this._detailGrids = /* @__PURE__ */ new Map();
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = ve(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("mousemove", this._onRowDragMove), this._thead?.removeEventListener("contextmenu", this._onHeaderContextMenu), this._closeColumnMenu(), this._teardownPersistence(), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove();
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, s) => {
      const i = {}, l = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      i[this.getRowIdValue] = l != null ? this._coerceRowId(l) : s + 1, t.querySelectorAll("td").forEach((a) => {
        const d = a.getAttribute("data-cell-col-id-value") || a.getAttribute("data-col-id");
        d && (i[d] = a.textContent.trim());
      });
      const r = t.getAttribute("data-row-detail-rows-value");
      if (r && this.detailRowsKeyValue)
        try {
          i[this.detailRowsKeyValue] = JSON.parse(r);
        } catch {
        }
      return i;
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
    this._thead?.addEventListener("contextmenu", this._onHeaderContextMenu);
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
    this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), this._restorePersistedState(), this._setupPersistence(), m(this.element, "grid:ready", { api: this.element.gridApi }), m(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
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
    const s = this.state.filterModel[e.field] || {}, i = Se(e.filter), l = p("div", { class: "sg-filter-popover" }), r = p("select");
    i.forEach((v) => r.append(new Option(v.label, v.value, !1, v.value === s.type)));
    const a = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", d = p("input", { type: a, value: s.value ?? "" }), u = p("input", { type: a, value: s.value2 ?? "", style: { display: "none" } }), h = () => {
      const v = r.value, C = v === "inRange", S = !(v === "blank" || v === "notBlank");
      d.style.display = S ? "" : "none", u.style.display = C ? "" : "none";
    };
    r.addEventListener("change", h), h();
    const c = p("div", { class: "sg-filter-actions" }), g = p("button", { type: "button" }, "Clear"), f = p("button", { type: "button", class: "primary" }, "Apply");
    c.append(g, f), g.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), f.addEventListener("click", () => {
      const v = r.value, C = v === "blank" || v === "notBlank" ? { filterType: e.filter, type: v } : { filterType: e.filter, type: v, value: d.value, value2: u.value || void 0 };
      this.setColumnFilter(e.field, C), this._closeFilterPopover();
    }), l.append(
      p("label", {}, "Condition"),
      r,
      d,
      u,
      c
    ), document.body.appendChild(l);
    const _ = t.getBoundingClientRect();
    l.style.left = `${_.left + window.scrollX}px`, l.style.top = `${_.bottom + window.scrollY + 2}px`, this._filterPopover = l, document.addEventListener("mousedown", this._onDocMouseDown), d.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const s = this.state.columnDefs.findIndex((d) => d.field === e.field), i = this._runtimeOverrides[e.field] || {}, l = s >= 0 ? this.state.columnDefs[s] : null, r = l ? {
      ...l.hidden != null ? { hidden: l.hidden } : {},
      ...l.pinned ? { pinned: l.pinned } : {},
      ...l.width != null ? { width: l.width } : {}
    } : {}, a = { ...e, ...i, ...r, _headerEl: t };
    if (s >= 0) {
      const d = this.state.columnDefs[s];
      if (d._headerEl === t && ye(d, a)) return;
      this.state.columnDefs[s] = a;
    } else
      this.state.columnDefs.push(a);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${E(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const s = this.state.sortModel.findIndex((l) => l.colId === e);
    let i;
    s === -1 ? i = { colId: e, sort: "asc" } : this.state.sortModel[s].sort === "asc" ? i = { colId: e, sort: "desc" } : i = null, t ? (s >= 0 && this.state.sortModel.splice(s, 1), i && this.state.sortModel.push(i)) : this.state.sortModel = i ? [i] : [], this.scheduleRender("sort"), m(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  setSortModel(e) {
    this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), m(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  // ----- Filter -----
  setColumnFilter(e, t) {
    t == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = t, this.state.pagination.page = 0, this.scheduleRender("filter"), m(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setFilterModel(e) {
    this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), m(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setQuickFilter(e) {
    const t = e == null ? "" : String(e);
    t !== this.state.quickFilter && (this.state.quickFilter = t, this.state.pagination.page = 0, this.scheduleRender("filter"), m(this.element, "grid:filterChanged", {
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
    this.rowSelectionValue === "single" ? (s.clear(), s.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? s.has(e) ? s.delete(e) : s.add(e) : (s.clear(), s.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), m(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(s)
    });
  }
  setSelected(e, t) {
    t ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), m(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  selectAll() {
    this._displayList.filteredSorted.forEach((e) => {
      e.__sgGroup || this.state.selection.add(this._rowId(e));
    }), this.scheduleRender("selection"), m(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  deselectAll() {
    this.state.selection.clear(), this.scheduleRender("selection"), m(this.element, "grid:selectionChanged", { selectedRows: [], selectedIds: [] });
  }
  getSelectedRows() {
    const e = this.state.selection;
    return this.state.rowData.filter((t) => e.has(this._rowId(t)));
  }
  _selectRange(e, t) {
    const s = this._displayList.filteredSorted, i = s.findIndex((d) => this._rowId(d) === e), l = s.findIndex((d) => this._rowId(d) === t);
    if (i < 0 || l < 0) return;
    const [r, a] = i <= l ? [i, l] : [l, i];
    for (let d = r; d <= a; d++)
      s[d].__sgGroup || this.state.selection.add(this._rowId(s[d]));
  }
  // ----- Pagination -----
  goToPage(e) {
    const t = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(e, t)), this.scheduleRender("page"), m(this.element, "grid:paginationChanged", {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  setPageSize(e) {
    this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), m(this.element, "grid:paginationChanged", {
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
    let s = $(this.state.rowData, this.state.filterModel, e);
    return s = K(s, this.state.quickFilter, t), s.length;
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
    const l = this.state.rowData.find((r) => this._rowId(r) === e);
    l && (this.state.editing = { rowId: e, colId: t, originalValue: b(l, i), initialValue: s }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: s, originalValue: i, draftValue: l } = this.state.editing, r = this._tbody.querySelector(`tr[data-row-id="${E(t)}"] td[data-col-id="${E(s)}"]`);
    let a = i;
    if (!e && r) {
      const d = r.querySelector("[data-editor-input]") || r.querySelector("input,select,textarea");
      d ? a = Re(d.value, this._colByField(s)?.type) : l !== void 0 && (a = l);
    }
    if (this.state.editing = null, !e && a !== i) {
      const d = this.state.rowData.find((h) => this._rowId(h) === t), u = d[s];
      d[s] = a, m(this.element, "grid:cellValueChanged", { rowId: t, colId: s, oldValue: u, newValue: a });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const s = this._colByField(e);
    s && (s.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), m(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const i = t || null;
    s.pinned = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: i }, this._reorderForPinning(), this.scheduleRender("columns"), m(this.element, "grid:columnPinned", { colId: e, pinned: i });
  }
  setColumnWidth(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const i = Math.max(s.minWidth || 40, Math.min(s.maxWidth || 4e3, t));
    s.width = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: i }, this.scheduleRender("columns"), m(this.element, "grid:columnResized", { colId: e, width: i });
  }
  moveColumn(e, t) {
    const s = this.state.columnDefs.findIndex((l) => l.field === e);
    if (s < 0 || s === t) return;
    const [i] = this.state.columnDefs.splice(s, 1);
    this.state.columnDefs.splice(t, 0, i), this.scheduleRender("columns"), m(this.element, "grid:columnMoved", { colId: e, fromIndex: s, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const s = (t.headerName || t.field || "").length, i = this.state.rowData.slice(0, 200);
    let l = s;
    for (const r of i) {
      const a = String(R(r, t) ?? "").length;
      a > l && (l = a);
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, l * 8 + 24)));
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), s = t.reduce((l, r) => l + (r.width || 150), 0);
    if (s === 0) return;
    const i = e / s;
    t.forEach((l) => {
      l.width = Math.max(l.minWidth || 40, Math.floor((l.width || 150) * i));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((i) => i.pinned === "left"), t = this.state.columnDefs.filter((i) => i.pinned === "right"), s = this.state.columnDefs.filter((i) => !i.pinned);
    this.state.columnDefs = [...e, ...s, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), m(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], s = [], i = [], l = new Map(this.state.rowData.map((r) => [this._rowId(r), r]));
    return (e.remove || []).forEach((r) => {
      const a = this._rowId(r);
      l.delete(a) && i.push(r);
    }), (e.update || []).forEach((r) => {
      const a = this._rowId(r);
      l.has(a) && (l.set(a, { ...l.get(a), ...r }), s.push(r));
    }), (e.add || []).forEach((r) => {
      const a = this._rowId(r);
      l.has(a) || (l.set(a, r), t.push(r));
    }), this.state.rowData = Array.from(l.values()), this.scheduleRender("data"), m(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: s, removed: i };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const s = this.state.columnDefs.filter((a) => !a.hidden && !a._isCheckbox), i = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((a) => !a.__sgGroup && !a.__sgDetail), l = (a) => /[",\n\r]/.test(a) ? `"${String(a).replace(/"/g, '""')}"` : String(a), r = [s.map((a) => l(a.headerName || a.field)).join(e)];
    for (const a of i)
      r.push(s.map((d) => l(R(a, d))).join(e));
    return r.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const s = this.getDataAsCsv(t), i = new Blob([s], { type: "text/csv;charset=utf-8" }), l = URL.createObjectURL(i), r = p("a", { href: l, download: e });
    return document.body.appendChild(r), r.click(), r.remove(), URL.revokeObjectURL(l), s;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.size === 0) && (this._displayList = me({
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
    const e = this._visibleCols(), t = fe(e, this._headerLayoutOpts());
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
    for (e.forEach((i, l) => {
      let r = s[l];
      r || (r = p("col"), t.appendChild(r)), r.style.width = i.width ? i.width + "px" : "";
    }); t.children.length > e.length; ) t.lastElementChild.remove();
  }
  _renderHeaderSingleRow(e) {
    if (this._thead.children.length > 1) {
      const c = this._thead.firstElementChild;
      for (let g = 1; g < this._thead.children.length; g++) {
        const f = this._thead.children[g];
        Array.from(f.children).forEach((_) => {
          (_.hasAttribute("data-header-cell-field-value") || _.hasAttribute("data-field")) && c.appendChild(_);
        });
      }
      for (; this._thead.children.length > 1; ) this._thead.lastElementChild.remove();
    }
    const t = this._thead.querySelector("tr") || (() => {
      const c = p("tr");
      return this._thead.appendChild(c), c;
    })(), s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((c) => {
      const g = c.getAttribute("data-header-cell-field-value") || c.getAttribute("data-field");
      g && s.set(g, c);
    });
    const i = new Set(e.map((c) => c.field)), l = this.state.columnDefs.filter((c) => !i.has(c.field)), r = [...e, ...l], a = Array.from(t.children).map((c) => c.getAttribute("data-header-cell-field-value") || c.getAttribute("data-field")).filter(Boolean), d = r.map((c) => c.field);
    if (a.length === d.length && a.every((c, g) => c === d[g]))
      Array.from(t.children).forEach((c) => {
        c.removeAttribute("rowspan"), c.removeAttribute("colspan");
      });
    else {
      const c = [];
      for (const g of r) {
        let f = s.get(g.field);
        f ? (f.removeAttribute("rowspan"), f.removeAttribute("colspan")) : f = p("th", {
          "data-field": g.field,
          "data-synth": "true"
        }, [p("div", { class: "sg-header-content" }, [
          p("span", { class: "sg-header-label" }, g.headerName || g.field || "")
        ])]), c.push(f);
      }
      t.replaceChildren(...c);
    }
    Array.from(t.children).forEach((c) => {
      const g = c.getAttribute("data-header-cell-field-value") || c.getAttribute("data-field");
      g != null && (c.style.display = i.has(g) ? "" : "none");
    });
    const h = this._pinOffsets();
    for (const c of e) {
      const g = t.querySelector(`th[data-header-cell-field-value="${E(c.field)}"]`) || t.querySelector(`th[data-field="${E(c.field)}"]`);
      g && this._applyLeafThState(g, c, h);
    }
  }
  // Multi-row header: <thead> gets `layout.depth` rows of group headers
  // followed by the leaf headers, then one hidden row holding any registered
  // <th>s that aren't currently visible (so their controllers stay mounted).
  _renderHeaderMultiRow(e, t) {
    const s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((u) => {
      const h = u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field");
      h && s.set(h, u);
    });
    const i = [], l = new Set(e.map((u) => u.field)), r = this._pinOffsets();
    for (const u of t.rows) {
      const h = p("tr");
      for (const c of u) {
        if (c.kind === "group") {
          h.appendChild(p("th", {
            class: "sg-header-group",
            colspan: String(c.colspan),
            "data-group-header": "true"
          }, c.label || ""));
          continue;
        }
        const g = c.col;
        let f = s.get(g.field);
        if (f || (f = p("th", {
          "data-field": g.field,
          "data-synth": "true"
        }, [p("div", { class: "sg-header-content" }, [
          p("span", { class: "sg-header-label" }, c.label || g.headerName || g.field || "")
        ])])), c.label) {
          const _ = f.querySelector(".sg-header-label");
          _ && _.textContent !== c.label && (_.textContent = c.label);
        }
        f.setAttribute("rowspan", String(c.rowspan)), f.removeAttribute("colspan"), f.style.display = "", h.appendChild(f), this._applyLeafThState(f, g, r);
      }
      i.push(h);
    }
    const a = /* @__PURE__ */ new Set();
    t.rows.forEach((u) => u.forEach((h) => {
      h.kind === "leaf" && a.add(h.col.field);
    }));
    const d = this.state.columnDefs.filter(
      (u) => !l.has(u.field) && !a.has(u.field)
    );
    if (d.length) {
      const u = p("tr", { class: "sg-hidden-header-row" });
      for (const h of d) {
        let c = s.get(h.field);
        c || (c = p("th", { "data-field": h.field, "data-synth": "true" })), c.removeAttribute("rowspan"), c.removeAttribute("colspan"), u.appendChild(c);
      }
      i.push(u);
    }
    this._thead.replaceChildren(...i);
  }
  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(e, t, s) {
    const i = this.state.sortModel.find((l) => l.colId === t.field);
    N(e, {
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
      const d = this._displayList.filteredSorted.length, u = this.state.selection.size;
      a.checked = u > 0 && u >= d, a.indeterminate = u > 0 && u < d;
      return;
    }
    let i = e.querySelector(".sg-header-content");
    if (!i) {
      const a = e.textContent.trim();
      e.textContent = "", i = p("div", { class: "sg-header-content" }, [
        p("span", { class: "sg-header-label" }, a || t.headerName || t.field || "")
      ]), e.appendChild(i);
    }
    let l = i.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (l || (l = p("span", { class: "sg-sort-icon", "aria-hidden": "true" }), l.innerHTML = V, i.appendChild(l)), s && this.state.sortModel.length > 1) {
        let a = i.querySelector(".sg-sort-index");
        a || (a = p("span", { class: "sg-sort-index" }), i.appendChild(a)), a.textContent = String(this.state.sortModel.indexOf(s) + 1);
      } else
        i.querySelector(".sg-sort-index")?.remove();
    else l && l.remove();
    let r = i.querySelector(".sg-filter-icon");
    t.filter ? r || (r = p("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), r.innerHTML = be, i.appendChild(r)) : r && r.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(p("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._withDetailRows(this._displayList.pageRows);
    this._selKeys = this._computeCellSelKeys();
    const s = !this.masterDetailValue && (this.virtualValue || t.length > 200);
    let i = t, l = 0;
    if (s) {
      const h = this._viewport?.clientHeight || 400, c = this.state.rowHeight, g = _e(this.state.scrollTop, h, c, t.length, 8);
      l = g.first, i = t.slice(g.first, g.last);
    }
    const r = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((h) => {
      const c = h.dataset.rowId;
      c != null && r.set(c, h);
    });
    const a = document.createDocumentFragment(), d = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0, u = (h) => d + l + h + 1;
    if (s) {
      const h = this.state.rowHeight, c = l * h, g = (t.length - l - i.length) * h;
      a.appendChild(this._spacerRow(c, e.length)), i.forEach((f, _) => a.appendChild(this._buildRow(f, e, r, u(_)))), a.appendChild(this._spacerRow(g, e.length));
    } else
      i.forEach((h, c) => a.appendChild(this._buildRow(h, e, r, u(c))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && a.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(a);
  }
  _buildPinnedBottomRow(e) {
    const t = p("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), s = this._pinOffsets(), i = this._displayList.grandTotals || {};
    let l = !1;
    for (const r of e) {
      const a = p("td", { "data-col-id": r.field, "data-pinned": r.pinned || null });
      r.pinned === "left" ? a.style.left = s.left[r.field] + "px" : r.pinned === "right" && (a.style.right = s.right[r.field] + "px");
      const d = i[r.field];
      d != null ? (a.classList.add("sg-agg-cell"), a.textContent = this._formatAggregate(d)) : !l && !r._isCheckbox && !r._isRowNumber && (a.classList.add("sg-pinned-bottom-label"), a.textContent = "Total", l = !0), t.appendChild(a);
    }
    return t;
  }
  _buildRow(e, t, s, i) {
    if (e.__sgGroup) return this._buildGroupRow(e, t, s);
    if (e.__sgDetail) return this._buildDetailRow(e, t, s);
    const l = String(this._rowId(e));
    let r = s.get(l);
    r || (r = p("tr")), r.dataset.rowId = l, r.classList.remove("sg-spacer");
    const a = this.state.selection.has(this._rowId(e)), d = this.masterDetailValue && this._isDetailExpanded(l);
    return N(r, {
      "data-selected": a ? "true" : null,
      "data-detail-expanded": d ? "true" : null
    }), this.masterDetailValue && r.classList.add("sg-master-row"), this._renderRow(r, e, t, i), r;
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
    const l = this._pinOffsets(), r = this._selKeys || { active: null, range: null }, a = String(this._rowId(t));
    for (const d of s) {
      const u = `${a}:${d.field}`, h = p("td", {
        "data-col-id": d.field,
        "data-pinned": d.pinned || null,
        "data-cell-active": r.active === u ? "true" : null,
        "data-cell-range": r.range && r.range.has(u) ? "true" : null
      });
      if (d.pinned === "left" ? h.style.left = l.left[d.field] + "px" : d.pinned === "right" && (h.style.right = l.right[d.field] + "px"), d._isRowNumber) {
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
      if (d._isMasterExpand) {
        h.classList.add("sg-master-expand-cell"), h.setAttribute("data-master-expand", "true"), h.removeAttribute("data-cell-active"), h.removeAttribute("data-cell-range");
        const g = this._isDetailExpanded(this._rowId(t)), f = p("span", {
          class: "sg-master-expand-caret",
          "data-expanded": g ? "true" : "false",
          "aria-hidden": "true"
        });
        f.innerHTML = V, h.appendChild(f), e.appendChild(h);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === d.field) {
        h.setAttribute("data-editing", "true");
        const g = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : b(t, d), { node: f, control: _ } = this._buildEditor(d, g);
        h.appendChild(f);
        const v = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          _?.focus(), v || _?.select?.();
        });
      } else
        this._renderCellContent(h, t, d);
      e.appendChild(h);
    }
  }
  _renderCellContent(e, t, s) {
    if (s.cellRenderer) {
      const i = F(s.cellRenderer);
      if (i) {
        const l = b(t, s), r = R(t, s);
        (i.dataset.bind || i.dataset.bindText !== void 0) && (i.textContent = i.dataset.bind ? String(t[i.dataset.bind] ?? "") : r), i.dataset.bindAttr && i.setAttribute(i.dataset.bindAttr, l), i.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((a) => {
          a.dataset.bindText !== void 0 ? a.textContent = r : a.dataset.bind && (a.textContent = String(t[a.dataset.bind] ?? "")), a.dataset.bindAttr && a.setAttribute(a.dataset.bindAttr, l);
        }), e.appendChild(i);
        return;
      }
    }
    e.textContent = R(t, s);
  }
  toggleGroup(e, t = 0) {
    this._groupExpanded.set(e, !this._isGroupExpanded(e, t)), this.scheduleRender("group"), m(this.element, "grid:groupToggled", { groupId: e, expanded: this._groupExpanded.get(e) });
  }
  expandAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = -1, this.scheduleRender("group");
  }
  collapseAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = 0, this.scheduleRender("group");
  }
  setRowGroupColumns(e) {
    this.state.group.cols = Array.isArray(e) ? e.slice() : [], this._groupExpanded.clear(), this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("group"), m(this.element, "grid:columnRowGroupChanged", { rowGroupCols: this.state.group.cols.slice() });
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
    t == null ? delete this.state.group.aggs[e] : this.state.group.aggs[e] = t, this.scheduleRender("group"), m(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  // ----- Pivot mode -----
  // Toggling pivot mode rebuilds the display list (and therefore the visible
  // column set). Clears row + cell selection since the underlying cell graph
  // changes shape entirely.
  setPivotMode(e) {
    const t = !!e;
    this.state.pivot.mode !== t && (this.state.pivot.mode = t, this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), m(this.element, "grid:pivotModeChanged", { pivot: t }));
  }
  isPivotMode() {
    return !!this.state.pivot.mode;
  }
  setPivotColumns(e) {
    this.state.pivot.cols = Array.isArray(e) ? e.slice() : [], this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), m(this.element, "grid:columnPivotChanged", { pivotCols: this.state.pivot.cols.slice() });
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
    this.state.group.aggs = t, this.scheduleRender(this.state.pivot.mode ? "pivot" : "group"), m(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  addValueColumn(e, t = "sum") {
    e && this.setColumnAggFunc(e, t);
  }
  removeValueColumn(e) {
    this.setColumnAggFunc(e, null);
  }
  // ----- Column header groups + pinned bottom row -----
  setColumnGroups(e) {
    this.columnGroupsValue = Array.isArray(e) ? e : [], this.scheduleRender("columns"), m(this.element, "grid:columnGroupsChanged", { columnGroups: this.columnGroupsValue });
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
  // ----- Column state serialization + persistence -----
  //
  // getColumnState() captures everything a user can change about the grid's
  // layout — column order/width/pinning/visibility, row groups, pivot,
  // value aggregations, header groups, the pinned bottom row toggle, and
  // the sort/filter/quick-filter model — into a plain JSON-serializable
  // object. applyColumnState() restores that snapshot, then schedules a
  // single render and emits `grid:columnStateApplied` so subscribers (e.g.
  // the side panel) refresh in one shot. With `data-grid-persist-key-value`
  // set, the same shape is round-tripped to localStorage automatically.
  getColumnState() {
    return {
      v: 1,
      cols: this.state.columnDefs.filter((e) => !e._isGroupCol && !e._isPivot).map((e) => {
        const t = { field: e.field };
        return e.width != null && (t.width = e.width), e.pinned && (t.pinned = e.pinned), e.hidden && (t.hidden = !0), t;
      }),
      rowGroupCols: this.state.group.cols.slice(),
      pivot: { mode: !!this.state.pivot.mode, cols: this.state.pivot.cols.slice() },
      values: this.getValueColumns(),
      columnGroups: this.getColumnGroups(),
      pinnedBottomRow: !!this.pinnedBottomRowValue,
      sortModel: this.state.sortModel.slice(),
      filterModel: { ...this.state.filterModel },
      quickFilter: this.state.quickFilter || ""
    };
  }
  applyColumnState(e) {
    if (!(!e || typeof e != "object")) {
      if (Array.isArray(e.cols)) {
        const t = new Map(this.state.columnDefs.map((i) => [i.field, i])), s = [];
        for (const i of e.cols) {
          const l = t.get(i.field);
          l && (i.width != null && (l.width = i.width), l.pinned = i.pinned || void 0, l.hidden = !!i.hidden, t.delete(i.field), s.push(l));
        }
        for (const i of t.values()) s.push(i);
        this.state.columnDefs = s;
      }
      if (Array.isArray(e.rowGroupCols) && (this.state.group.cols = e.rowGroupCols.slice()), e.pivot && typeof e.pivot == "object" && (this.state.pivot.cols = Array.isArray(e.pivot.cols) ? e.pivot.cols.slice() : [], this.state.pivot.mode = !!e.pivot.mode), Array.isArray(e.values)) {
        const t = {};
        for (const { field: s, aggFunc: i } of e.values) s && i && (t[s] = i);
        this.state.group.aggs = t;
      }
      Array.isArray(e.columnGroups) && (this.columnGroupsValue = e.columnGroups), typeof e.pinnedBottomRow == "boolean" && (this.pinnedBottomRowValue = e.pinnedBottomRow), Array.isArray(e.sortModel) && (this.state.sortModel = e.sortModel.slice()), e.filterModel && typeof e.filterModel == "object" && (this.state.filterModel = { ...e.filterModel }), typeof e.quickFilter == "string" && (this.state.quickFilter = e.quickFilter);
      for (const t of ["columns", "group", "pivot", "sort", "filter", "data"])
        this.scheduleRender(t);
      m(this.element, "grid:columnStateApplied", { state: e });
    }
  }
  _storageKey() {
    return `sgrid:${this.persistKeyValue}`;
  }
  _restorePersistedState() {
    if (!(!this.persistKeyValue || typeof localStorage > "u"))
      try {
        const e = localStorage.getItem(this._storageKey());
        if (!e) return;
        const t = JSON.parse(e);
        t && typeof t == "object" && this.applyColumnState(t);
      } catch (e) {
        console.warn("[stimulus_grid] failed to restore persisted state", e);
      }
  }
  _setupPersistence() {
    if (!this.persistKeyValue || typeof localStorage > "u") return;
    const e = () => {
      clearTimeout(this._persistTimer), this._persistTimer = setTimeout(() => this._persistState(), 200);
    };
    this._persistListener = e;
    for (const t of O) this.element.addEventListener(t, e);
    this._persistBeforeUnload = () => {
      this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
    }, window.addEventListener("beforeunload", this._persistBeforeUnload);
  }
  _teardownPersistence() {
    if (this._persistListener) {
      for (const e of O) this.element.removeEventListener(e, this._persistListener);
      this._persistBeforeUnload && (window.removeEventListener("beforeunload", this._persistBeforeUnload), this._persistBeforeUnload = null), this._persistTimer && (clearTimeout(this._persistTimer), this._persistState()), this._persistListener = null;
    }
  }
  _persistState() {
    if (!(!this.persistKeyValue || typeof localStorage > "u"))
      try {
        localStorage.setItem(this._storageKey(), JSON.stringify(this.getColumnState()));
      } catch (e) {
        console.warn("[stimulus_grid] failed to persist state", e);
      }
  }
  clearPersistedState() {
    if (!(!this.persistKeyValue || typeof localStorage > "u"))
      try {
        localStorage.removeItem(this._storageKey());
      } catch {
      }
  }
  _buildGroupRow(e, t, s) {
    const i = `__g:${e.groupId}`;
    let l = s.get(i);
    return l || (l = p("tr")), l.dataset.rowId = i, l.dataset.group = "true", l.dataset.groupLevel = String(e.level), l.className = "sg-group-row", this._renderGroupRow(l, e, t), l;
  }
  _renderGroupRow(e, t, s) {
    e.innerHTML = "";
    const i = this._pinOffsets(), l = this._isGroupExpanded(t.groupId, t.level), r = (this.state.group.displayType || "singleColumn") === "singleColumn", a = !!(this.state.pivot?.mode && this._displayList?.pivot), d = t.__pivotAll === !0, u = s.filter((g) => !g._isRowNumber && !g._isCheckbox && !g._isGroupCol), h = u.some((g) => g.field === t.field) ? t.field : u[0]?.field, c = Math.max(0, t.level);
    d && e.classList.add("sg-pivot-all-row");
    for (const g of s) {
      const f = p("td", { "data-col-id": g.field, "data-pinned": g.pinned || null });
      if (g.pinned === "left" ? f.style.left = i.left[g.field] + "px" : g.pinned === "right" && (f.style.right = i.right[g.field] + "px"), g._isRowNumber || g._isCheckbox) {
        f.classList.add(g._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(f);
        continue;
      }
      if (a || r ? g._isGroupCol : g.field === h) {
        if (f.classList.add("sg-group-cell"), f.style.paddingLeft = `${8 + c * 18}px`, !d) {
          const v = p("span", {
            class: "sg-group-caret",
            "data-expanded": l ? "true" : "false",
            "aria-hidden": "true"
          });
          v.innerHTML = V, f.appendChild(v);
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
      const i = F(e.cellEditor);
      if (i) {
        const l = i.matches?.("input,select,textarea") ? i : i.querySelector?.("[data-editor-input]") || i.querySelector?.("input,select,textarea");
        return l && (this._seedEditorValue(l, e, t), l.addEventListener("keydown", this._onEditorKey), l.addEventListener("blur", this._onEditorBlur)), { node: i, control: l };
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
      const i = t instanceof Date ? t : t ? new Date(t) : null, l = i ? i.toISOString().slice(0, 10) : "";
      s = p("input", { type: "date", value: l });
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
    const l = this.state.selection.size;
    l > 0 && e.appendChild(this._statusPanel("Selected", this._fmtInt(l))), t.replaceChildren();
    const r = this.getRangeAggregates();
    if (r && r.count > 0) {
      const d = (this.statusBarAggsValue || []).filter((u) => u in r);
      for (const u of d) {
        const h = r[u];
        h == null && u !== "count" || t.appendChild(this._statusPanel(this._aggLabel(u), this._fmtAgg(u, h)));
      }
    }
    const a = r ? `${r.count}|${r.sum}|${r.avg}|${r.min}|${r.max}` : "";
    a !== this._lastRangeAggs && (this._lastRangeAggs = a, m(this.element, "grid:rangeAggsChanged", { aggs: r }));
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
          const l = s.rows[i];
          if (!(!l || l.__sgGroup || l.__sgDetail))
            for (let r = s.c0; r <= s.c1; r++) {
              const a = s.cols[r];
              !a || a._isCheckbox || a._isRowNumber || a._isGroupCol || a._isMasterExpand || e.push(b(l, a));
            }
        }
    }
    return e;
  }
  getRangeAggregates() {
    return this.state.cellSel.ranges.length ? ae(this._cellRangeRawValues()) : null;
  }
  _showColumnMenu(e, t, s) {
    this._closeColumnMenu();
    const i = this._columnMenuItems(e), l = p("div", { class: "sg-column-menu", role: "menu" });
    for (const d of i) {
      if (d === "separator") {
        l.appendChild(p("div", { class: "sg-column-menu-separator", role: "separator" }));
        continue;
      }
      const u = p("button", {
        type: "button",
        class: "sg-column-menu-item" + (d.active ? " sg-column-menu-active" : ""),
        role: "menuitem"
      });
      u.append(
        p("span", { class: "sg-column-menu-label" }, d.label)
      ), d.active && u.append(p("span", { class: "sg-column-menu-check", "aria-hidden": "true" }, "✓")), u.addEventListener("click", () => {
        d.action(), this._closeColumnMenu();
      }), l.appendChild(u);
    }
    document.body.appendChild(l);
    const r = l.offsetWidth || 220, a = l.offsetHeight || 280;
    l.style.left = `${Math.min(t, window.innerWidth - r - 4)}px`, l.style.top = `${Math.min(s, window.innerHeight - a - 4)}px`, this._columnMenu = l, setTimeout(() => {
      document.addEventListener("mousedown", this._onDocMouseDownColumnMenu), document.addEventListener("keydown", this._onColumnMenuKey), window.addEventListener("resize", this._closeColumnMenuBound = () => this._closeColumnMenu(), { once: !0 }), window.addEventListener("scroll", this._closeColumnMenuBound, { once: !0, capture: !0 });
    }, 0), m(this.element, "grid:columnMenuOpened", { colId: e.field });
  }
  _closeColumnMenu() {
    this._columnMenu && (this._columnMenu.remove(), this._columnMenu = null, document.removeEventListener("mousedown", this._onDocMouseDownColumnMenu), document.removeEventListener("keydown", this._onColumnMenuKey), this._closeColumnMenuBound && (window.removeEventListener("resize", this._closeColumnMenuBound), window.removeEventListener("scroll", this._closeColumnMenuBound, { capture: !0 }), this._closeColumnMenuBound = null));
  }
  // Build the menu item list for `col` based on the current grid state. Each
  // item is { label, action, active? } or the string 'separator'. Items are
  // emitted only when they make sense (e.g. "Unpin" doesn't show on an
  // unpinned col), so the menu stays short.
  _columnMenuItems(e) {
    const t = this.element.gridApi, s = e.headerName || e.field, i = this.state.group.cols.includes(e.field), l = this.state.pivot.cols.includes(e.field), r = this.state.group.aggs[e.field], a = e.type === "number", d = [];
    if (e.pinned !== "left" && d.push({ label: "Pin left", action: () => t.setColumnPinned(e.field, "left") }), e.pinned !== "right" && d.push({ label: "Pin right", action: () => t.setColumnPinned(e.field, "right") }), e.pinned && d.push({ label: "Unpin", action: () => t.setColumnPinned(e.field, null) }), d.push("separator"), d.push({ label: "Autosize this column", action: () => t.autoSizeColumn(e.field) }), d.push({ label: "Autosize all columns", action: () => t.autoSizeAllColumns() }), d.push("separator"), d.push(i ? { label: `Ungroup ${s}`, action: () => t.removeRowGroupColumn(e.field) } : { label: `Group by ${s}`, action: () => t.addRowGroupColumn(e.field) }), d.push(l ? { label: `Remove ${s} from pivot`, action: () => t.removePivotColumn(e.field) } : { label: `Pivot by ${s}`, action: () => {
      t.isPivotMode() || t.setPivotMode(!0), t.addPivotColumn(e.field);
    } }), a || r) {
      d.push("separator");
      for (const u of ["sum", "avg", "count", "min", "max"])
        d.push({
          label: `Aggregate: ${u}`,
          active: r === u,
          action: () => t.addValueColumn(e.field, u)
        });
      r && d.push({ label: "Remove aggregation", action: () => t.removeValueColumn(e.field) });
    }
    return d.push("separator"), d.push({ label: "Hide column", action: () => t.setColumnVisible(e.field, !1) }), d.push({
      label: "Show all columns",
      action: () => {
        this.state.columnDefs.forEach((u) => {
          u.hidden && !u._isGroupCol && !u._isPivot && !u._isCheckbox && !u._isRowNumber && t.setColumnVisible(u.field, !0);
        });
      }
    }), d;
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
    if (t.classList.contains("sg-detail-row")) return;
    if (e.target.closest?.('td[data-master-expand="true"]')) {
      const a = this._coerceRowId(t.dataset.rowId);
      this.toggleDetailRow(a);
      return;
    }
    if (e.target.closest('td[data-editing="true"]')) return;
    const i = this._coerceRowId(t.dataset.rowId), l = e.target.closest("td");
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(i, "toggle");
      return;
    }
    if (l && l.dataset.gutter === "true") {
      if (this._rowDragMoved) {
        this._rowDragMoved = !1;
        return;
      }
      if (this.rowSelectionValue !== "") {
        const a = e.shiftKey ? "range" : e.metaKey || e.ctrlKey ? "toggle" : "replace";
        this.clearCellSelection(), this.toggleRowSelection(i, a), m(this.element, "grid:rowClicked", { rowId: i, row: this.state.rowData.find((d) => this._rowId(d) === i), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (l) {
      const a = this.state.rowData.find((u) => this._rowId(u) === i), d = l.dataset.colId;
      m(this.element, "grid:cellClicked", { rowId: i, colId: d, value: a?.[d], event: e });
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
    const r = e.shiftKey ? "range" : e.metaKey || e.ctrlKey || this.rowMultiSelectWithClickValue ? "toggle" : "replace";
    this.toggleRowSelection(i, r), m(this.element, "grid:rowClicked", { rowId: i, row: this.state.rowData.find((a) => this._rowId(a) === i), event: e });
  }
  // ----- Cell selection (Numbers/Sheets-style: multi-range + active cell) -----
  _cellAt(e) {
    const t = e.closest?.("td"), s = e.closest?.("tr");
    return !t || !s || s.dataset.group === "true" || s.classList.contains("sg-detail-row") || t.classList.contains("sg-checkbox-cell") || t.classList.contains("sg-group-leaf-cell") || t.classList.contains("sg-master-expand-cell") || t.dataset.gutter === "true" || !t.dataset.colId || t.dataset.editing === "true" ? null : { rowId: this._coerceRowId(s.dataset.rowId), colId: t.dataset.colId };
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
    const t = Array.from(this.state.selection).map(String), s = new Set(t.includes(String(e)) ? t : [String(e)]), i = p("div", { class: "sg-drag-ghost sg-grid" }), l = p("table"), r = p("tbody");
    let a = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((u) => {
      if (s.has(u.dataset.rowId) && a < 6) {
        const h = u.cloneNode(!0);
        h.removeAttribute("data-selected"), h.querySelectorAll("td").forEach((c) => {
          c.style.left = "", c.style.right = "", c.removeAttribute("data-pinned"), c.removeAttribute("data-cell-active"), c.removeAttribute("data-cell-range");
        }), r.appendChild(h), a += 1;
      }
    }), l.appendChild(r), i.appendChild(l), s.size > a && i.appendChild(p("div", { class: "sg-drag-ghost-more" }, `+${s.size - a} more rows`)), i.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(i);
    const d = p("div", { class: "sg-drop-indicator" });
    document.body.appendChild(d), this._rowDrag = { ids: s, ghost: i, indicator: d, dropRowId: null, dropBefore: !0 }, document.body.classList.add("sg-row-dragging");
  }
  _updateDropIndicator(e) {
    const t = Array.from(this._tbody.querySelectorAll("tr[data-row-id]"));
    let s = null, i = !0;
    for (const d of t) {
      const u = d.getBoundingClientRect();
      if (e < u.top + u.height / 2) {
        s = d, i = !0;
        break;
      }
      s = d, i = !1;
    }
    if (!s) return;
    const l = s.getBoundingClientRect(), r = this._viewport.getBoundingClientRect(), a = this._rowDrag.indicator;
    a.style.left = `${r.left}px`, a.style.width = `${r.width}px`, a.style.top = `${(i ? l.top : l.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(s.dataset.rowId), this._rowDrag.dropBefore = i;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: s, dropRowId: i, dropBefore: l } = this._rowDrag;
    if (t.remove(), s.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, i == null || e.has(String(i))) return;
    const r = this.state.rowData, a = r.filter((h) => e.has(String(this._rowId(h)))), d = r.filter((h) => !e.has(String(this._rowId(h))));
    let u = d.findIndex((h) => this._rowId(h) === i);
    u < 0 ? u = d.length : l || (u += 1), d.splice(u, 0, ...a), this.state.rowData = d, this.state.sortModel = [], this.scheduleRender("data"), m(this.element, "grid:rowDragEnd", {
      ids: a.map((h) => this._rowId(h)),
      toRowId: i,
      before: l
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
    const t = this._displayList.pageRows, s = this._visibleCols(), i = (h) => t.findIndex((c) => this._rowId(c) === h), l = (h) => s.findIndex((c) => c.field === h), r = i(e.anchor.rowId), a = l(e.anchor.colId);
    if (r < 0 || a < 0) return null;
    const d = i(e.focus.rowId), u = l(e.focus.colId);
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
      const i = e.rows[s];
      if (!i) continue;
      const l = [];
      for (let r = e.c0; r <= e.c1; r++) {
        const a = e.cols[r];
        a && l.push(R(i, a));
      }
      t.push(l);
    }
    return t;
  }
  // Active cell key + union of all ranges' cells (active stays outlined, unfilled).
  _computeCellSelKeys() {
    const e = this._activeCell();
    if (!e) return { active: null, range: null };
    const t = `${e.rowId}:${e.colId}`, s = /* @__PURE__ */ new Set();
    for (const i of this.state.cellSel.ranges) {
      const l = this._rangeRect(i);
      if (l)
        for (let r = l.r0; r <= l.r1; r++) {
          const a = l.rows[r];
          if (a)
            for (let d = l.c0; d <= l.c1; d++) {
              const u = l.cols[d];
              if (!u) continue;
              const h = `${this._rowId(a)}:${u.field}`;
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
          const l = s.rows[i];
          l && e.add(this._rowId(l));
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
    return this._visibleCols().filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol && !e._isMasterExpand);
  }
  _moveActiveCell(e, t, s) {
    const i = this._displayList.pageRows, l = this._navCols();
    if (!i.length || !l.length) return;
    const r = (c, g, f) => Math.max(g, Math.min(c, f)), a = this._activeCell(), d = () => i.findIndex((c) => !c.__sgGroup && !c.__sgDetail);
    let u = a ? i.findIndex((c) => this._rowId(c) === a.rowId) : d(), h = a ? l.findIndex((c) => c.field === a.colId) : 0;
    if (u < 0 && (u = d()), !(u < 0)) {
      if (h < 0 && (h = 0), s && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const c = this.state.cellSel.ranges[this.state.cellSel.activeIdx], g = r(i.findIndex((_) => this._rowId(_) === c.focus.rowId) + e, 0, i.length - 1), f = r(l.findIndex((_) => _.field === c.focus.colId) + t, 0, l.length - 1);
        this._extendActiveRange({ rowId: this._rowId(i[g]), colId: l[f].field });
      } else {
        let c = r(u + e, 0, i.length - 1);
        if (e !== 0) {
          for (; i[c] && (i[c].__sgGroup || i[c].__sgDetail); ) {
            const f = c + e;
            if (f < 0 || f >= i.length) break;
            c = f;
          }
          if (!i[c] || i[c].__sgGroup || i[c].__sgDetail) return;
        }
        const g = r(h + t, 0, l.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(i[c]), colId: l[g].field });
      }
      this._applyCellSelHighlight(), this._scrollActiveIntoView(), m(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
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
    }, this._applyCellSelHighlight(), m(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
  }
  // Clear the value of every selected, editable cell (Delete/Backspace).
  _clearSelectedCells() {
    let e = !1;
    for (const t of this.state.cellSel.ranges) {
      const s = this._rangeRect(t);
      if (s)
        for (let i = s.r0; i <= s.r1; i++) {
          const l = s.rows[i];
          if (!(!l || l.__sgGroup || l.__sgDetail))
            for (let r = s.c0; r <= s.c1; r++) {
              const a = s.cols[r];
              if (!a || !a.editable || a._isCheckbox || a._isRowNumber) continue;
              const d = l[a.field];
              d === "" || d == null || (l[a.field] = "", e = !0, m(this.element, "grid:cellValueChanged", { rowId: this._rowId(l), colId: a.field, oldValue: d, newValue: "" }));
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
    const i = this._coerceRowId(t.dataset.rowId), l = s.dataset.colId;
    this.startEditingCell(i, l);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const s = this._visibleCols().filter((c) => c.editable && !c._isCheckbox), i = this._displayList.pageRows, l = i.findIndex((c) => this._rowId(c) === t.rowId), r = s.findIndex((c) => c.field === t.colId);
    if (!s.length || !i.length || l < 0 || r < 0) {
      this.stopEditing(!1);
      return;
    }
    const a = i.length * s.length, d = (l * s.length + r + e + a) % a, u = i[Math.floor(d / s.length)], h = s[d % s.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(u), h.field), requestAnimationFrame(() => {
      this._navigatingEditor = !1;
    });
  }
  // Wire editor listeners whenever a cell mounts an input.
  // Done lazily via MutationObserver on tbody (cheap because tbody is small per page).
  // ----- Helpers -----
  _visibleCols() {
    const e = this.state.columnDefs.filter((a) => !a.hidden), t = this.state.group?.cols || [], s = this.masterDetailValue && !this.state.pivot?.mode && !t.length;
    if (this.state.pivot?.mode && this._displayList?.pivotResultColumns?.length)
      return [{
        field: "__group",
        headerName: t.length ? t.map((d) => this._colByField(d)?.headerName || d).join(" → ") : "",
        _isGroupCol: !0,
        width: t.length ? 220 : 90,
        sortable: !1,
        filter: null,
        resizable: !1
      }, ...this._displayList.pivotResultColumns];
    if (!t.length)
      return s ? [this._masterExpandCol(), ...e] : e;
    if ((this.state.group.displayType || "singleColumn") === "singleColumn") {
      const a = new Set(t);
      return [{
        field: "__group",
        headerName: "Group",
        _isGroupCol: !0,
        width: 240,
        sortable: !1,
        filter: null,
        resizable: !1
      }, ...e.filter((u) => !a.has(u.field))];
    }
    if (this.groupReorderColumnsValue === !1) return e;
    const l = t.map((a) => e.find((d) => d.field === a)).filter(Boolean), r = new Set(l);
    return [...l, ...e.filter((a) => !r.has(a))];
  }
  // Synthetic gutter col for the master-detail expand chevron. Returned by
  // _visibleCols when masterDetail is on; rendered specially in _renderRow.
  _masterExpandCol() {
    return {
      field: "__masterExpand",
      headerName: "",
      _isMasterExpand: !0,
      width: 32,
      pinned: "left",
      sortable: !1,
      filter: null,
      resizable: !1
    };
  }
  // ----- Master/detail rows -----
  _isDetailExpanded(e) {
    return this._detailExpanded.has(String(e));
  }
  // Splice a synthetic `__sgDetail` row in directly after each expanded master
  // in the page rows. Done after buildDisplayList so detail expansion stays
  // a UI concern — the model.js pipeline doesn't need to know about it.
  _withDetailRows(e) {
    if (!this.masterDetailValue || !this._detailExpanded.size || this.state.pivot?.mode || (this.state.group.cols || []).length) return e;
    const t = [];
    for (const s of e) {
      if (t.push(s), s.__sgGroup || s.__sgDetail) continue;
      const i = this._rowId(s);
      this._isDetailExpanded(i) && t.push({ __sgDetail: !0, master: s, masterId: i });
    }
    return t;
  }
  toggleDetailRow(e) {
    this.masterDetailValue && (this._isDetailExpanded(e) ? this.collapseDetailRow(e) : this.expandDetailRow(e));
  }
  expandDetailRow(e) {
    if (!this.masterDetailValue) return;
    const t = String(e);
    if (this._detailExpanded.has(t)) return;
    this._detailExpanded.add(t), this.scheduleRender("cells");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === t);
    m(this.element, "grid:detailRowExpanded", { rowId: e, masterRow: s });
  }
  collapseDetailRow(e) {
    if (!this.masterDetailValue) return;
    const t = String(e);
    if (!this._detailExpanded.has(t)) return;
    this._detailExpanded.delete(t), this._detailGrids.delete(t), this.scheduleRender("cells");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === t);
    m(this.element, "grid:detailRowCollapsed", { rowId: e, masterRow: s });
  }
  expandAllDetails() {
    if (this.masterDetailValue) {
      for (const e of this.state.rowData) this._detailExpanded.add(String(this._rowId(e)));
      this.scheduleRender("cells");
    }
  }
  collapseAllDetails() {
    this.masterDetailValue && (this._detailExpanded.clear(), this._detailGrids.clear(), this.scheduleRender("cells"));
  }
  getDetailExpandedRowIds() {
    return Array.from(this._detailExpanded);
  }
  setMasterDetail(e) {
    const t = !!e;
    this.masterDetailValue !== t && (this.masterDetailValue = t, t || (this._detailExpanded.clear(), this._detailGrids.clear()), this.scheduleRender("columns"));
  }
  isMasterDetail() {
    return !!this.masterDetailValue;
  }
  // Build the detail <tr>: one cell spanning the full visible width, holding a
  // padded shell that hosts either a cloned <template> or a default summary
  // pulled from the master row.
  _buildDetailRow(e, t, s) {
    const i = `__d:${e.masterId}`;
    let l = s.get(i);
    const r = String(e.masterId);
    if (l) {
      if (l.getAttribute("data-master-id") === r)
        return l.classList.remove("sg-spacer"), l;
      l = null;
    }
    l || (l = p("tr")), l.className = "sg-detail-row", l.dataset.rowId = i, l.setAttribute("data-master-id", r), l.innerHTML = "";
    const a = p("td", { colspan: String(t.length || 1), class: "sg-detail-cell" }), d = p("div", { class: "sg-detail-shell" });
    return d.style.minHeight = `${this.detailRowHeightValue}px`, a.appendChild(d), l.appendChild(a), this._populateDetailShell(d, e.master, e.masterId), l;
  }
  // Fill the detail shell. Strategy: if the grid has a detail-template value
  // pointing at an existing <template>, clone its content and run a tiny
  // data-bind pass keyed off the master row. Otherwise render a minimal
  // fallback so the panel still appears (handy when the user is wiring up
  // their first detail panel and hasn't authored a template yet).
  _populateDetailShell(e, t, s) {
    const i = this.detailTemplateValue;
    let l;
    if (i) {
      const a = document.getElementById(i);
      if (a && a.tagName === "TEMPLATE") {
        const d = a.content.cloneNode(!0);
        this._applyDetailBindings(d, t), e.appendChild(d), l = e;
      }
    }
    if (!l) {
      const a = p("div", { class: "sg-detail-fallback" }), d = Object.keys(t || {}).filter((u) => !u.startsWith("_") && !u.startsWith("__")).slice(0, 6);
      for (const u of d)
        a.append(
          p("span", { class: "sg-detail-fallback-label" }, `${u}: `),
          p("span", { class: "sg-detail-fallback-value" }, String(t[u] ?? "")),
          p("span", { class: "sg-detail-fallback-sep" }, "  ·  ")
        );
      a.lastElementChild?.remove(), e.appendChild(a);
    }
    const r = e.querySelector('[data-controller~="grid"]');
    r && this._seedNestedGrid(r, t, s), queueMicrotask(() => {
      m(this.element, "grid:detailRowMounted", {
        rowId: s,
        masterRow: t,
        detailEl: e,
        nestedGridApi: r?.gridApi || null
      });
    });
  }
  // Walk the cloned template for [data-detail-bind="<field>"] (textContent),
  // [data-detail-bind-attr="<attr>:<field>"] (attribute), and [data-detail-if="<field>"]
  // (drop the node when falsy). Tiny, on purpose — anything richer belongs in
  // the consumer's own JS via grid:detailRowMounted.
  _applyDetailBindings(e, t) {
    if (!t) return;
    e.querySelectorAll("[data-detail-bind], [data-detail-bind-attr], [data-detail-if]").forEach((i) => {
      if (i.hasAttribute("data-detail-if")) {
        const l = i.getAttribute("data-detail-if");
        if (!t[l]) {
          i.remove();
          return;
        }
      }
      if (i.hasAttribute("data-detail-bind")) {
        const l = i.getAttribute("data-detail-bind");
        i.textContent = t[l] == null ? "" : String(t[l]);
      }
      if (i.hasAttribute("data-detail-bind-attr")) {
        const l = i.getAttribute("data-detail-bind-attr"), [r, a] = l.split(":");
        r && a && i.setAttribute(r, t[a] == null ? "" : String(t[a]));
      }
    });
  }
  // Seed a nested grid with the master row's detail rows before its controller
  // boots, so its first render shows the right data without an extra round
  // through scheduleRender. Cache the inner gridApi once it appears so the
  // outer grid can refresh it later if the master data is updated.
  _seedNestedGrid(e, t, s) {
    const i = this.detailRowsKeyValue;
    if (i) {
      const l = t?.[i];
      if (Array.isArray(l))
        try {
          e.setAttribute("data-grid-row-data-value", JSON.stringify(l));
        } catch {
        }
    }
    queueMicrotask(() => {
      e.gridApi && this._detailGrids.set(String(s), e.gridApi);
    });
  }
  _pinOffsets() {
    const e = this._visibleCols(), t = {};
    let s = 0;
    for (const l of e)
      l.pinned === "left" && (t[l.field] = s, s += l.width || 150);
    const i = {};
    s = 0;
    for (let l = e.length - 1; l >= 0; l--) {
      const r = e[l];
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
w(k, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: z },
  rowHeight: { type: Number, default: Ce },
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
  pinnedBottomRow: { type: Boolean, default: !1 },
  // sticky bottom row with grand totals (from aggFuncs)
  persistKey: { type: String, default: "" },
  // when non-empty, auto-save/restore state to localStorage under sgrid:<key>
  masterDetail: { type: Boolean, default: !1 },
  // enable expandable detail rows under each master row
  detailTemplate: { type: String, default: "" },
  // id of a <template> cloned into each expanded detail row
  detailRowsKey: { type: String, default: "" },
  // master-row field holding the array of nested detail rows
  detailRowHeight: { type: Number, default: 240 }
  // CSS pixel height for the detail-row shell
});
function ye(o, n) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (o[t] !== n[t]) return !1;
  return !0;
}
function Se(o) {
  return o === "number" || o === "date" ? [
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "lessThan", label: "Less than" },
    { value: "greaterThan", label: "Greater than" },
    { value: "inRange", label: "In range" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" }
  ] : o === "boolean" ? [
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
function Re(o, n) {
  if (n === "number") {
    const e = Number(o);
    return Number.isFinite(e) ? e : o;
  }
  return n === "date" ? o : n === "boolean" ? o === "true" ? !0 : o === "false" ? !1 : null : o;
}
function E(o) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(o)) : String(o).replace(/["\\\n\r]/g, (n) => "\\" + n);
}
class G extends x {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    w(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, s = e.clientY;
      let i = !1;
      const l = (a) => {
        const d = Math.abs(a.clientX - t), u = Math.abs(a.clientY - s);
        !i && (d > 5 || u > 5) && (i = !0, document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", r), this._beginReorder(t));
      }, r = (a) => {
        document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", r), i || this.sort(a);
      };
      document.addEventListener("mousemove", l), document.addEventListener("mouseup", r);
    });
  }
  connect() {
    if (this.grid = we(this.element, "grid", this.application), !!this.grid) {
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
    let l = i;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const r = (d) => {
      const u = d.clientX;
      let h = s.length;
      for (let c = 0; c < s.length; c++) {
        const g = s[c].getBoundingClientRect();
        if (u < g.left + g.width / 2) {
          h = c;
          break;
        }
      }
      l = h > i ? h - 1 : h;
    }, a = () => {
      document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", a), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", l !== i && this.grid.moveColumn(this.fieldValue, l);
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
    const t = e.clientX, s = this.element.offsetWidth, i = (r) => this.grid.setColumnWidth(this.fieldValue, s + (r.clientX - t)), l = () => {
      document.removeEventListener("mousemove", i), document.removeEventListener("mouseup", l), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", i), document.addEventListener("mouseup", l), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
w(G, "values", {
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
class U extends x {
  connect() {
  }
}
class X extends x {
  connect() {
  }
}
class Y extends x {
  connect() {
  }
}
class A extends x {
  constructor() {
    super(...arguments);
    w(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), s = e.paginationGetTotalPages(), i = e.paginationGetRowCount(), l = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const r = i === 0 ? 0 : t * l + 1, a = Math.min(i, r + l - 1);
        this.pageInfoTarget.textContent = i === 0 ? "0 rows" : `${r}–${a} of ${i}`;
      }
      this.hasFirstTarget && (this.firstTarget.disabled = t === 0), this.hasPrevTarget && (this.prevTarget.disabled = t === 0), this.hasNextTarget && (this.nextTarget.disabled = t >= s - 1), this.hasLastTarget && (this.lastTarget.disabled = t >= s - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(l));
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
const P = ["sum", "avg", "count", "min", "max"], xe = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', De = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class Q extends x {
  connect() {
    this.grid = this.element.closest(".sg-grid"), this._activeTab = "columns", this._collapsed = !1, this._build(), this.grid?.gridApi ? this._render() : this.grid && this.grid.addEventListener("grid:ready", () => this._render(), { once: !0 }), this._gridListener = () => this._render();
    for (const n of [
      "grid:columnRowGroupChanged",
      "grid:columnPivotChanged",
      "grid:columnValueChanged",
      "grid:pivotModeChanged",
      "grid:columnVisible",
      "grid:rowDataChanged",
      "grid:columnStateApplied"
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
        "grid:rowDataChanged",
        "grid:columnStateApplied"
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
    }), this._columnsTab.innerHTML = xe, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), n.appendChild(this._columnsTab), this.element.append(this._content, n);
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
    const s = new Set(n.getRowGroupColumns()), i = new Set(n.getPivotColumns()), l = new Map(n.getValueColumns().map((r) => [r.field, r.aggFunc]));
    for (const r of this._columns()) {
      const a = p("li", { class: "sg-column-list-item", draggable: "true" });
      a.dataset.field = r.field;
      const d = p("span", { class: "sg-column-grip", "aria-hidden": "true" });
      d.innerHTML = De;
      const u = p("input", { type: "checkbox" });
      u.checked = !r.hidden, u.addEventListener("change", () => n.setColumnVisible(r.field, u.checked));
      const h = p("span", { class: "sg-column-list-label" }, r.headerName || r.field), c = p("span", { class: "sg-column-list-tags" });
      s.has(r.field) && c.appendChild(p("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), i.has(r.field) && c.appendChild(p("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), l.has(r.field) && c.appendChild(p("span", { class: "sg-tag sg-tag-value", title: `Value (${l.get(r.field)})` }, l.get(r.field))), a.append(d, u, h, c), this._wireDragSource(a, r.field), t.appendChild(a);
    }
    return this._wireDropZone(t, "columns"), e;
  }
  _renderDropSection({ title: n, placeholder: e, kind: t, fields: s }) {
    const i = p("div", { class: "sg-panel-section sg-panel-drop" });
    i.appendChild(p("div", { class: "sg-panel-section-title" }, n));
    const l = p("div", { class: "sg-drop-zone" });
    if (l.dataset.dropKind = t, !s.length)
      l.classList.add("sg-drop-zone-empty"), l.appendChild(p("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const r of s) l.appendChild(this._renderChip(t, r));
    return this._wireDropZone(l, t), i.appendChild(l), i;
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
      for (const { field: i, aggFunc: l } of s) t.appendChild(this._renderValueChip(i, l));
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
    const l = p("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return l.addEventListener("click", (r) => {
      r.stopPropagation();
      const a = P.indexOf(e), d = P[(a === -1 ? 0 : a + 1) % P.length];
      t.setColumnAggFunc(n, d);
    }), i.append(
      l,
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
function Ee(o) {
  const n = o ?? ee.start();
  return n.register("grid", k), n.register("header-cell", G), n.register("row", U), n.register("cell", X), n.register("filter", Y), n.register("pagination", A), n.register("side-panel", Q), n;
}
const Me = {
  start: Ee,
  GridController: k,
  HeaderCellController: G,
  RowController: U,
  CellController: X,
  FilterController: Y,
  PaginationController: A,
  SidePanelController: Q
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = Me);
export {
  X as CellController,
  Y as FilterController,
  k as GridController,
  G as HeaderCellController,
  A as PaginationController,
  U as RowController,
  Q as SidePanelController,
  Me as default,
  Ee as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
