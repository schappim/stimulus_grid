var $ = Object.defineProperty;
var K = (n, r, e) => r in n ? $(n, r, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[r] = e;
var y = (n, r, e) => K(n, typeof r != "symbol" ? r + "" : r, e);
import { Controller as R, Application as W } from "@hotwired/stimulus";
function b(n, r) {
  return typeof r.valueGetter == "function" ? r.valueGetter(n) : n?.[r.field];
}
function S(n, r) {
  const e = b(n, r);
  return typeof r.valueFormatter == "function" ? r.valueFormatter(e, n) : e == null ? "" : r.type === "date" && e instanceof Date ? e.toLocaleDateString() : r.type === "boolean" ? e ? "✓" : "" : String(e);
}
const T = {
  contains: (n, r) => String(n ?? "").toLowerCase().includes(String(r ?? "").toLowerCase()),
  notContains: (n, r) => !String(n ?? "").toLowerCase().includes(String(r ?? "").toLowerCase()),
  equals: (n, r) => String(n ?? "").toLowerCase() === String(r ?? "").toLowerCase(),
  notEqual: (n, r) => String(n ?? "").toLowerCase() !== String(r ?? "").toLowerCase(),
  startsWith: (n, r) => String(n ?? "").toLowerCase().startsWith(String(r ?? "").toLowerCase()),
  endsWith: (n, r) => String(n ?? "").toLowerCase().endsWith(String(r ?? "").toLowerCase()),
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
}, H = {
  equals: (n, r) => Number(n) === Number(r),
  notEqual: (n, r) => Number(n) !== Number(r),
  lessThan: (n, r) => Number(n) < Number(r),
  lessThanOrEqual: (n, r) => Number(n) <= Number(r),
  greaterThan: (n, r) => Number(n) > Number(r),
  greaterThanOrEqual: (n, r) => Number(n) >= Number(r),
  inRange: (n, r, e) => Number(n) >= Number(r) && Number(n) <= Number(e),
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
};
function C(n) {
  if (n == null || n === "") return null;
  if (n instanceof Date) return n;
  const r = new Date(n);
  return Number.isNaN(r.valueOf()) ? null : r;
}
const j = {
  equals: (n, r) => C(n)?.toDateString() === C(r)?.toDateString(),
  notEqual: (n, r) => C(n)?.toDateString() !== C(r)?.toDateString(),
  lessThan: (n, r) => (C(n)?.valueOf() ?? -1 / 0) < (C(r)?.valueOf() ?? 1 / 0),
  greaterThan: (n, r) => (C(n)?.valueOf() ?? 1 / 0) > (C(r)?.valueOf() ?? -1 / 0),
  inRange: (n, r, e) => {
    const t = C(n)?.valueOf();
    return t != null && t >= (C(r)?.valueOf() ?? -1 / 0) && t <= (C(e)?.valueOf() ?? 1 / 0);
  },
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
}, U = {
  equals: (n, r) => r === "true" ? !!n : r === "false" ? !n : !0
}, X = {
  in: (n, r) => Array.isArray(r) && r.includes(String(n ?? ""))
}, Y = { text: T, number: H, date: j, boolean: U, set: X };
function Q(n, r, e) {
  if (!e) return !0;
  const t = e.filterType || r.filter || "text", s = (Y[t] || T)[e.type];
  if (!s) return !0;
  const l = b(n, r);
  return s(l, e.value, e.value2);
}
function N(n, r, e) {
  const t = Object.entries(r || {}).filter(([, i]) => i != null);
  return t.length === 0 ? n : n.filter((i) => t.every(([s, l]) => {
    const o = e[s];
    return o ? Q(i, o, l) : !0;
  }));
}
function F(n, r, e) {
  if (!r) return n;
  const t = String(r).toLowerCase();
  return n.filter((i) => {
    for (const s of e) {
      const l = S(i, s);
      if (l && String(l).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function G(n, r, e) {
  if (n == null && r == null) return 0;
  if (n == null) return -1;
  if (r == null) return 1;
  if (e === "number") return Number(n) - Number(r);
  if (e === "date") {
    const t = C(n)?.valueOf() ?? 0, i = C(r)?.valueOf() ?? 0;
    return t - i;
  }
  return e === "boolean" ? n === r ? 0 : n ? 1 : -1 : String(n).localeCompare(String(r), void 0, { numeric: !0, sensitivity: "base" });
}
function Z(n, r, e) {
  if (!r || r.length === 0) return n;
  const t = n.slice();
  return t.sort((i, s) => {
    for (const { colId: l, sort: o } of r) {
      const a = e[l];
      if (!a) continue;
      const d = b(i, a), u = b(s, a), c = typeof a.comparator == "function" ? a.comparator(d, u, i, s) : G(d, u, a.type);
      if (c !== 0) return o === "desc" ? -c : c;
    }
    return 0;
  }), t;
}
function A(n, r) {
  if (!r || !r.enabled) return { rows: n, total: n.length, pageRows: n };
  const e = n.length, t = Math.max(1, Math.ceil(e / r.pageSize)), i = Math.min(r.page, t - 1), s = i * r.pageSize, l = n.slice(s, s + r.pageSize);
  return { rows: n, total: e, totalPages: t, page: i, pageRows: l };
}
function J(n, r, e) {
  if (n === "count") return r.length;
  const t = r.map((s) => b(s, e));
  if (n === "first") return t.length ? t[0] : null;
  if (n === "last") return t.length ? t[t.length - 1] : null;
  const i = t.map(Number).filter((s) => !Number.isNaN(s));
  switch (n) {
    case "sum":
      return i.reduce((s, l) => s + l, 0);
    case "avg":
      return i.length ? i.reduce((s, l) => s + l, 0) / i.length : null;
    case "min":
      return i.length ? Math.min(...i) : null;
    case "max":
      return i.length ? Math.max(...i) : null;
    default:
      return null;
  }
}
function P(n, r, e) {
  const t = {};
  for (const [i, s] of Object.entries(r || {})) {
    const l = e[i];
    l && (t[i] = J(s, n, l));
  }
  return t;
}
function ee(n, r, e, t, i = () => !0) {
  const s = (d, u, c) => {
    const f = r[u], m = /* @__PURE__ */ new Map();
    for (const h of d) {
      const p = b(h, f), _ = p == null ? "" : String(p);
      m.has(_) || m.set(_, { value: p, rows: [] }), m.get(_).rows.push(h);
    }
    return Array.from(m.values()).sort((h, p) => G(h.value, p.value, f.type)).map(({ value: h, rows: p }) => {
      const _ = h == null ? "" : String(h), v = c ? `${c}|${f.field}=${_}` : `${f.field}=${_}`;
      return {
        __sgGroup: !0,
        level: u,
        field: f.field,
        value: h,
        groupId: v,
        count: p.length,
        aggregates: P(p, t, e),
        leaves: p,
        children: u + 1 < r.length ? s(p, u + 1, v) : null
      };
    });
  }, l = s(n, 0, ""), o = [], a = (d) => {
    for (const u of d)
      if (o.push(u), !!i(u.groupId, u.level))
        if (u.children) a(u.children);
        else for (const c of u.leaves) o.push(c);
  };
  return a(l), { displayList: o, tree: l };
}
function te(n) {
  if (n.serverSide) {
    const l = n.rowData, o = n.pagination?.pageSize || l.length || 1, a = n.serverRowCount ?? l.length, d = Math.max(1, Math.ceil(a / o)), u = Math.min(n.pagination?.page || 0, d - 1);
    return { filteredSorted: l, rows: l, total: a, totalPages: d, page: u, pageRows: l };
  }
  const r = Object.fromEntries(n.columnDefs.map((l) => [l.field, l])), e = n.columnDefs.filter((l) => !l.hidden && !l._isCheckbox);
  let t = n.rowData;
  t = N(t, n.filterModel, r), t = F(t, n.quickFilter, e), t = Z(t, n.sortModel, r);
  const i = (n.rowGroupCols || []).filter((l) => r[l]);
  if (i.length) {
    const l = i.map((u) => r[u]), { displayList: o, tree: a } = ee(
      t,
      l,
      r,
      n.aggModel,
      n.isGroupExpanded
    ), d = A(o, n.pagination);
    return {
      grouped: !0,
      tree: a,
      leafCount: t.length,
      grandTotals: P(t, n.aggModel, r),
      filteredSorted: o,
      ...d
    };
  }
  const s = A(t, n.pagination);
  return { filteredSorted: t, ...s };
}
function ie(n, r, e, t, i = 6) {
  const s = Math.ceil(r / e), l = Math.max(0, Math.floor(n / e) - i), o = Math.min(t, l + s + i * 2);
  return { first: l, last: o };
}
function se(n) {
  return {
    // ---- Data ----
    setRowData(r) {
      n.setRowData(r);
    },
    getRowData() {
      return n.state.rowData.slice();
    },
    applyTransaction(r) {
      return n.applyTransaction(r);
    },
    // Server-side row model
    setRowCount(r) {
      n.setRowCount(r);
    },
    getRowCount() {
      return n.state.serverSide ? n.state.serverRowCount : n.state.rowData.length;
    },
    isServerSide() {
      return !!n.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(r) {
      n.setColumnDefs(r);
    },
    getColumnDefs() {
      return n.state.columnDefs.slice();
    },
    setColumnVisible(r, e) {
      n.setColumnVisible(r, e);
    },
    setColumnPinned(r, e) {
      n.setColumnPinned(r, e);
    },
    setColumnWidth(r, e) {
      n.setColumnWidth(r, e);
    },
    moveColumn(r, e) {
      n.moveColumn(r, e);
    },
    autoSizeColumn(r) {
      n.autoSizeColumn(r);
    },
    autoSizeAllColumns() {
      n.state.columnDefs.forEach((r) => n.autoSizeColumn(r.field));
    },
    sizeColumnsToFit() {
      n.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(r) {
      n.setSortModel(r);
    },
    getSortModel() {
      return n.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(r) {
      n.setFilterModel(r);
    },
    getFilterModel() {
      return { ...n.state.filterModel };
    },
    setColumnFilter(r, e) {
      n.setColumnFilter(r, e);
    },
    destroyFilter(r) {
      n.setColumnFilter(r, null);
    },
    setQuickFilter(r) {
      n.setQuickFilter(r);
    },
    getQuickFilter() {
      return n.getQuickFilter();
    },
    // ---- Selection ----
    selectAll() {
      n.selectAll();
    },
    deselectAll() {
      n.deselectAll();
    },
    selectRow(r) {
      n.setSelected(r, !0);
    },
    deselectRow(r) {
      n.setSelected(r, !1);
    },
    getSelectedRows() {
      return n.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(n.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(r) {
      n.goToPage(r);
    },
    paginationGoToFirstPage() {
      n.goToPage(0);
    },
    paginationGoToNextPage() {
      n.goToPage(n.state.pagination.page + 1);
    },
    paginationGoToPreviousPage() {
      n.goToPage(n.state.pagination.page - 1);
    },
    paginationGoToLastPage() {
      n.goToPage(n.lastPageIndex());
    },
    paginationSetPageSize(r) {
      n.setPageSize(r);
    },
    paginationGetCurrentPage() {
      return n.state.pagination.page;
    },
    paginationGetTotalPages() {
      return n.totalPages();
    },
    paginationGetRowCount() {
      return n.filteredCount();
    },
    paginationGetPageSize() {
      return n.state.pagination.pageSize;
    },
    paginationIsEnabled() {
      return n.state.pagination.enabled;
    },
    // ---- Cell selection ----
    getCellSelection() {
      return n.getCellSelectionDetail();
    },
    getCellRangeValues() {
      return n._cellRangeRows();
    },
    getCellSelectionRowIds() {
      return n.getCellSelectionRowIds();
    },
    // ---- Editing ----
    startEditingCell({ rowId: r, colId: e }) {
      n.startEditingCell(r, e);
    },
    stopEditing(r = !1) {
      n.stopEditing(r);
    },
    // ---- Row grouping + aggregation ----
    setRowGroupColumns(r) {
      n.setRowGroupColumns(r);
    },
    addRowGroupColumn(r) {
      n.addRowGroupColumn(r);
    },
    removeRowGroupColumn(r) {
      n.removeRowGroupColumn(r);
    },
    getRowGroupColumns() {
      return n.getRowGroupColumns();
    },
    setColumnAggFunc(r, e) {
      n.setColumnAggFunc(r, e);
    },
    expandAll() {
      n.expandAll();
    },
    collapseAll() {
      n.collapseAll();
    },
    toggleGroup(r, e) {
      n.toggleGroup(r, e);
    },
    // ---- Export ----
    getDataAsCsv(r = {}) {
      return n.getDataAsCsv(r);
    },
    exportDataAsCsv(r = {}) {
      return n.exportDataAsCsv(r);
    },
    // ---- Display ----
    refreshCells(r = {}) {
      n.refresh(r);
    },
    redrawRows(r = {}) {
      n.refresh(r);
    },
    // ---- Events ----
    addEventListener(r, e) {
      n.element.addEventListener(r, e);
    },
    removeEventListener(r, e) {
      n.element.removeEventListener(r, e);
    }
  };
}
function g(n, r = {}, e = []) {
  const t = document.createElement(n);
  for (const [i, s] of Object.entries(r))
    s === !1 || s == null || (i === "class" ? t.className = s : i === "style" && typeof s == "object" ? Object.assign(t.style, s) : i.startsWith("on") && typeof s == "function" ? t.addEventListener(i.slice(2).toLowerCase(), s) : s === !0 ? t.setAttribute(i, "") : t.setAttribute(i, String(s)));
  for (const i of [].concat(e))
    i == null || i === !1 || t.appendChild(typeof i == "string" ? document.createTextNode(i) : i);
  return t;
}
function L(n, r) {
  for (const [e, t] of Object.entries(r))
    t == null || t === !1 ? n.removeAttribute(e) : t === !0 ? n.setAttribute(e, "") : n.setAttribute(e, String(t));
}
function M(n) {
  const r = document.getElementById(n);
  return !r || r.tagName !== "TEMPLATE" ? null : r.content.firstElementChild.cloneNode(!0);
}
function w(n, r, e) {
  n.dispatchEvent(new CustomEvent(r, { detail: e, bubbles: !0 }));
}
function ne(n, r, e) {
  let t = n.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(r)) {
      const s = e.getControllerForElementAndIdentifier(t, r);
      if (s) return s;
    }
    t = t.parentElement;
  }
  return null;
}
const le = 32, k = 100, V = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', re = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>';
class E extends R {
  constructor() {
    super(...arguments);
    y(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    // ----- Row grouping + aggregation -----
    // A group is expanded if it has an explicit override; otherwise the
    // default-by-level applies (-1 = all, 0 = none, N = first N levels).
    y(this, "_isGroupExpanded", (e, t) => {
      if (this._groupExpanded.has(e)) return this._groupExpanded.get(e);
      const i = this.state.group.defaultExpanded;
      return i < 0 ? !0 : t < i;
    });
    y(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
    });
    y(this, "_onCellMouseDown", (e) => {
      if (e.button !== 0) return;
      if (this.rowDragValue) {
        const s = e.target.closest?.('td[data-gutter="true"]');
        if (s) {
          const l = s.closest("tr");
          this._rowDragPending = { rowId: this._coerceRowId(l.dataset.rowId), x: e.clientX, y: e.clientY }, this._rowDragMoved = !1, document.addEventListener("mousemove", this._onRowDragMove);
          return;
        }
      }
      const t = this._cellAt(e.target);
      if (!t) return;
      const i = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : i ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), w(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    y(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const i = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      i && i.focus.rowId === t.rowId && i.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), w(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
    });
    y(this, "_onCellMouseUp", () => {
      this._cellDragging = !1, this._rowDragPending && (document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag && this._finishRowDrag(), this._rowDragPending = null);
    });
    // ----- Row drag-and-drop (reorder) with a ghost preview -----
    y(this, "_onRowDragMove", (e) => {
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
    y(this, "_onCopy", (e) => {
      if (this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && !this.element.contains(t)) return;
      const i = this._activeRect();
      if (!i) return;
      const s = this._cellRangeRows(i).map((l) => l.map((o) => String(o ?? "")).join("	")).join(`
`);
      s && (e.clipboardData?.setData("text/plain", s), e.preventDefault());
    });
    y(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && this.element.contains(t)) return;
      const i = e.key, s = e.metaKey || e.ctrlKey;
      if (s && i.toLowerCase() === "a") {
        e.preventDefault(), this.rowSelectionValue !== "" ? (this.clearCellSelection(), this.deselectAll(), this.selectAll()) : this._selectAllCells();
        return;
      }
      if (s) return;
      const l = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (l[i]) {
        e.preventDefault();
        const [o, a] = l[i];
        this._moveActiveCell(o, a, e.shiftKey);
        return;
      }
      if (i === "Tab") {
        e.preventDefault(), this._moveActiveCell(0, e.shiftKey ? -1 : 1, !1);
        return;
      }
      if (i === "Enter") {
        const o = this._activeCell();
        o && (e.preventDefault(), this.startEditingCell(o.rowId, o.colId));
        return;
      }
      if (i === "Escape") {
        this.clearCellSelection();
        return;
      }
      if (i === "Delete" || i === "Backspace") {
        this._clearSelectedCells() && e.preventDefault();
        return;
      }
      if (i.length === 1 && !e.altKey) {
        const o = this._activeCell();
        if (!o) return;
        const a = this._colByField(o.colId);
        if (!a || !a.editable) return;
        e.preventDefault(), this.startEditingCell(o.rowId, o.colId, i);
      }
    });
    y(this, "_onEditorKey", (e) => {
      this.state.editing && (e.key === "Enter" ? (e.preventDefault(), this.stopEditing(!1)) : e.key === "Escape" ? (e.preventDefault(), this.stopEditing(!0)) : e.key === "Tab" && (e.preventDefault(), this._tabToEditableCell(e.shiftKey ? -1 : 1)));
    });
    y(this, "_onEditorBlur", () => {
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
      pagination: { enabled: !1, page: 0, pageSize: k },
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = se(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove();
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, i) => {
      const s = {}, l = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      return s[this.getRowIdValue] = l != null ? this._coerceRowId(l) : i + 1, t.querySelectorAll("td").forEach((o) => {
        const a = o.getAttribute("data-cell-col-id-value") || o.getAttribute("data-col-id");
        a && (s[a] = o.textContent.trim());
      }), s;
    }), e.innerHTML = ""), this._initialHead = this.element.querySelector("thead");
  }
  _buildChrome() {
    let e = this.element.querySelector("table");
    if (!e) {
      e = g("table");
      const i = g("thead");
      e.appendChild(i), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = g("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const i = g("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(i, e), i.appendChild(e), this._viewport = i;
    }
    this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null;
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
    this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), w(this.element, "grid:ready", { api: this.element.gridApi }), w(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  // Filter UI bridge — implemented by filter_controller, but the grid is the
  // single source of truth so it brokers the popover.
  openFilterFor(e, t) {
    const i = this._colByField(e);
    if (!(!i || !i.filter)) {
      this._closeFilterPopover();
      {
        this._openFallbackFilterPopover(i, t);
        return;
      }
    }
  }
  _closeFilterPopover() {
    this._filterPopover && (this._filterPopover.remove(), this._filterPopover = null, document.removeEventListener("mousedown", this._onDocMouseDown));
  }
  _openFallbackFilterPopover(e, t) {
    const i = this.state.filterModel[e.field] || {}, s = ae(e.filter), l = g("div", { class: "sg-filter-popover" }), o = g("select");
    s.forEach((_) => o.append(new Option(_.label, _.value, !1, _.value === i.type)));
    const a = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", d = g("input", { type: a, value: i.value ?? "" }), u = g("input", { type: a, value: i.value2 ?? "", style: { display: "none" } }), c = () => {
      const _ = o.value, v = _ === "inRange", q = !(_ === "blank" || _ === "notBlank");
      d.style.display = q ? "" : "none", u.style.display = v ? "" : "none";
    };
    o.addEventListener("change", c), c();
    const f = g("div", { class: "sg-filter-actions" }), m = g("button", { type: "button" }, "Clear"), h = g("button", { type: "button", class: "primary" }, "Apply");
    f.append(m, h), m.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), h.addEventListener("click", () => {
      const _ = o.value, v = _ === "blank" || _ === "notBlank" ? { filterType: e.filter, type: _ } : { filterType: e.filter, type: _, value: d.value, value2: u.value || void 0 };
      this.setColumnFilter(e.field, v), this._closeFilterPopover();
    }), l.append(
      g("label", {}, "Condition"),
      o,
      d,
      u,
      f
    ), document.body.appendChild(l);
    const p = t.getBoundingClientRect();
    l.style.left = `${p.left + window.scrollX}px`, l.style.top = `${p.bottom + window.scrollY + 2}px`, this._filterPopover = l, document.addEventListener("mousedown", this._onDocMouseDown), d.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const i = this.state.columnDefs.findIndex((o) => o.field === e.field), s = this._runtimeOverrides[e.field] || {}, l = { ...e, ...s, _headerEl: t };
    if (i >= 0) {
      const o = this.state.columnDefs[i];
      if (o._headerEl === t && oe(o, l)) return;
      this.state.columnDefs[i] = l;
    } else
      this.state.columnDefs.push(l);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${x(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const i = this.state.sortModel.findIndex((l) => l.colId === e);
    let s;
    i === -1 ? s = { colId: e, sort: "asc" } : this.state.sortModel[i].sort === "asc" ? s = { colId: e, sort: "desc" } : s = null, t ? (i >= 0 && this.state.sortModel.splice(i, 1), s && this.state.sortModel.push(s)) : this.state.sortModel = s ? [s] : [], this.scheduleRender("sort"), w(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  setSortModel(e) {
    this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), w(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  // ----- Filter -----
  setColumnFilter(e, t) {
    t == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = t, this.state.pagination.page = 0, this.scheduleRender("filter"), w(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setFilterModel(e) {
    this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), w(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setQuickFilter(e) {
    const t = e == null ? "" : String(e);
    t !== this.state.quickFilter && (this.state.quickFilter = t, this.state.pagination.page = 0, this.scheduleRender("filter"), w(this.element, "grid:filterChanged", {
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
    const i = this.state.selection;
    this.rowSelectionValue === "single" ? (i.clear(), i.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? i.has(e) ? i.delete(e) : i.add(e) : (i.clear(), i.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), w(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(i)
    });
  }
  setSelected(e, t) {
    t ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), w(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  selectAll() {
    this._displayList.filteredSorted.forEach((e) => {
      e.__sgGroup || this.state.selection.add(this._rowId(e));
    }), this.scheduleRender("selection"), w(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  deselectAll() {
    this.state.selection.clear(), this.scheduleRender("selection"), w(this.element, "grid:selectionChanged", { selectedRows: [], selectedIds: [] });
  }
  getSelectedRows() {
    const e = this.state.selection;
    return this.state.rowData.filter((t) => e.has(this._rowId(t)));
  }
  _selectRange(e, t) {
    const i = this._displayList.filteredSorted, s = i.findIndex((d) => this._rowId(d) === e), l = i.findIndex((d) => this._rowId(d) === t);
    if (s < 0 || l < 0) return;
    const [o, a] = s <= l ? [s, l] : [l, s];
    for (let d = o; d <= a; d++)
      i[d].__sgGroup || this.state.selection.add(this._rowId(i[d]));
  }
  // ----- Pagination -----
  goToPage(e) {
    const t = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(e, t)), this.scheduleRender("page"), w(this.element, "grid:paginationChanged", {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  setPageSize(e) {
    this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), w(this.element, "grid:paginationChanged", {
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
    const e = Object.fromEntries(this.state.columnDefs.map((s) => [s.field, s])), t = this.state.columnDefs.filter((s) => !s.hidden && !s._isCheckbox);
    let i = N(this.state.rowData, this.state.filterModel, e);
    return i = F(i, this.state.quickFilter, t), i.length;
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
  startEditingCell(e, t, i = void 0) {
    const s = this.state.columnDefs.find((o) => o.field === t);
    if (!s || !s.editable) return;
    const l = this.state.rowData.find((o) => this._rowId(o) === e);
    l && (this.state.editing = { rowId: e, colId: t, originalValue: b(l, s), initialValue: i }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: i, originalValue: s, draftValue: l } = this.state.editing, o = this._tbody.querySelector(`tr[data-row-id="${x(t)}"] td[data-col-id="${x(i)}"]`);
    let a = s;
    if (!e && o) {
      const d = o.querySelector("[data-editor-input]") || o.querySelector("input,select,textarea");
      d ? a = de(d.value, this._colByField(i)?.type) : l !== void 0 && (a = l);
    }
    if (this.state.editing = null, !e && a !== s) {
      const d = this.state.rowData.find((c) => this._rowId(c) === t), u = d[i];
      d[i] = a, w(this.element, "grid:cellValueChanged", { rowId: t, colId: i, oldValue: u, newValue: a });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const i = this._colByField(e);
    i && (i.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), w(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const i = this._colByField(e);
    if (!i) return;
    const s = t || null;
    i.pinned = s, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: s }, this._reorderForPinning(), this.scheduleRender("columns"), w(this.element, "grid:columnPinned", { colId: e, pinned: s });
  }
  setColumnWidth(e, t) {
    const i = this._colByField(e);
    if (!i) return;
    const s = Math.max(i.minWidth || 40, Math.min(i.maxWidth || 4e3, t));
    i.width = s, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: s }, this.scheduleRender("columns"), w(this.element, "grid:columnResized", { colId: e, width: s });
  }
  moveColumn(e, t) {
    const i = this.state.columnDefs.findIndex((l) => l.field === e);
    if (i < 0 || i === t) return;
    const [s] = this.state.columnDefs.splice(i, 1);
    this.state.columnDefs.splice(t, 0, s), this.scheduleRender("columns"), w(this.element, "grid:columnMoved", { colId: e, fromIndex: i, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const i = (t.headerName || t.field || "").length, s = this.state.rowData.slice(0, 200);
    let l = i;
    for (const o of s) {
      const a = String(S(o, t) ?? "").length;
      a > l && (l = a);
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, l * 8 + 24)));
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), i = t.reduce((l, o) => l + (o.width || 150), 0);
    if (i === 0) return;
    const s = e / i;
    t.forEach((l) => {
      l.width = Math.max(l.minWidth || 40, Math.floor((l.width || 150) * s));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((s) => s.pinned === "left"), t = this.state.columnDefs.filter((s) => s.pinned === "right"), i = this.state.columnDefs.filter((s) => !s.pinned);
    this.state.columnDefs = [...e, ...i, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), w(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], i = [], s = [], l = new Map(this.state.rowData.map((o) => [this._rowId(o), o]));
    return (e.remove || []).forEach((o) => {
      const a = this._rowId(o);
      l.delete(a) && s.push(o);
    }), (e.update || []).forEach((o) => {
      const a = this._rowId(o);
      l.has(a) && (l.set(a, { ...l.get(a), ...o }), i.push(o));
    }), (e.add || []).forEach((o) => {
      const a = this._rowId(o);
      l.has(a) || (l.set(a, o), t.push(o));
    }), this.state.rowData = Array.from(l.values()), this.scheduleRender("data"), w(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: i, removed: s };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const i = this.state.columnDefs.filter((a) => !a.hidden && !a._isCheckbox), s = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((a) => !a.__sgGroup), l = (a) => /[",\n\r]/.test(a) ? `"${String(a).replace(/"/g, '""')}"` : String(a), o = [i.map((a) => l(a.headerName || a.field)).join(e)];
    for (const a of s)
      o.push(i.map((d) => l(S(a, d))).join(e));
    return o.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const i = this.getDataAsCsv(t), s = new Blob([i], { type: "text/csv;charset=utf-8" }), l = URL.createObjectURL(s), o = g("a", { href: l, download: e });
    return document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(l), i;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.size === 0) && (this._displayList = te({
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
      isGroupExpanded: this._isGroupExpanded
    })), (e.has("columns") || e.has("sort") || e.has("filter") || e.has("selection") || e.has("group")) && this._renderHeader(), this._renderBody(), this._renderPagination();
  }
  _renderHeader() {
    if (!this._thead) return;
    const e = this._visibleCols(), t = this._thead.querySelector("tr") || (() => {
      const h = g("tr");
      return this._thead.appendChild(h), h;
    })(), i = /* @__PURE__ */ new Map();
    Array.from(t.querySelectorAll("th")).forEach((h) => {
      const p = h.getAttribute("data-header-cell-field-value") || h.getAttribute("data-field");
      p && i.set(p, h);
    });
    const s = new Set(e.map((h) => h.field)), l = this.state.columnDefs.filter((h) => !s.has(h.field)), o = [...e, ...l], a = Array.from(t.children).map((h) => h.getAttribute("data-header-cell-field-value") || h.getAttribute("data-field")).filter(Boolean), d = o.map((h) => h.field);
    if (!(a.length === d.length && a.every((h, p) => h === d[p]))) {
      const h = [];
      for (const p of o) {
        let _ = i.get(p.field);
        _ || (_ = g("th", {
          "data-field": p.field,
          "data-synth": "true"
        }, [g("div", { class: "sg-header-content" }, [
          g("span", { class: "sg-header-label" }, p.headerName || p.field || "")
        ])])), h.push(_);
      }
      t.replaceChildren(...h);
    }
    Array.from(t.children).forEach((h) => {
      const p = h.getAttribute("data-header-cell-field-value") || h.getAttribute("data-field");
      p != null && (h.style.display = s.has(p) ? "" : "none");
    });
    let c = this._table.querySelector("colgroup");
    c || (c = g("colgroup"), this._table.insertBefore(c, this._thead));
    const f = Array.from(c.children);
    for (e.forEach((h, p) => {
      let _ = f[p];
      _ || (_ = g("col"), c.appendChild(_)), _.style.width = h.width ? h.width + "px" : "";
    }); c.children.length > e.length; ) c.lastElementChild.remove();
    const m = this._pinOffsets();
    for (const h of e) {
      const p = t.querySelector(`th[data-header-cell-field-value="${x(h.field)}"]`) || t.querySelector(`th[data-field="${x(h.field)}"]`);
      if (!p) continue;
      const _ = this.state.sortModel.find((v) => v.colId === h.field);
      L(p, {
        "data-sortable": h.sortable ? "true" : null,
        "data-filterable": h.filter ? "true" : null,
        "data-filter-active": this.state.filterModel[h.field] ? "true" : null,
        "data-sort": _?.sort || null,
        "data-pinned": h.pinned || null
      }), h.width && (p.style.width = h.width + "px"), p.style.left = h.pinned === "left" ? m.left[h.field] + "px" : "", p.style.right = h.pinned === "right" ? m.right[h.field] + "px" : "", this._ensureHeaderChrome(p, h, _);
    }
  }
  _ensureHeaderChrome(e, t, i) {
    if (t._isRowNumber) {
      e.classList.add("sg-gutter-header"), e.textContent = "";
      return;
    }
    if (t._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let a = e.querySelector('input[type="checkbox"]');
      a || (a = g("input", { type: "checkbox", "aria-label": "Select all" }), a.addEventListener("change", (c) => {
        c.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(a));
      const d = this._displayList.filteredSorted.length, u = this.state.selection.size;
      a.checked = u > 0 && u >= d, a.indeterminate = u > 0 && u < d;
      return;
    }
    let s = e.querySelector(".sg-header-content");
    if (!s) {
      const a = e.textContent.trim();
      e.textContent = "", s = g("div", { class: "sg-header-content" }, [
        g("span", { class: "sg-header-label" }, a || t.headerName || t.field || "")
      ]), e.appendChild(s);
    }
    let l = s.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (l || (l = g("span", { class: "sg-sort-icon", "aria-hidden": "true" }), l.innerHTML = V, s.appendChild(l)), i && this.state.sortModel.length > 1) {
        let a = s.querySelector(".sg-sort-index");
        a || (a = g("span", { class: "sg-sort-index" }), s.appendChild(a)), a.textContent = String(this.state.sortModel.indexOf(i) + 1);
      } else
        s.querySelector(".sg-sort-index")?.remove();
    else l && l.remove();
    let o = s.querySelector(".sg-filter-icon");
    t.filter ? o || (o = g("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), o.innerHTML = re, s.appendChild(o)) : o && o.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(g("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._displayList.pageRows;
    this._selKeys = this._computeCellSelKeys();
    const i = this.virtualValue || t.length > 200;
    let s = t, l = 0;
    if (i) {
      const c = this._viewport?.clientHeight || 400, f = this.state.rowHeight, m = ie(this.state.scrollTop, c, f, t.length, 8);
      l = m.first, s = t.slice(m.first, m.last);
    }
    const o = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((c) => {
      const f = c.dataset.rowId;
      f != null && o.set(f, c);
    });
    const a = document.createDocumentFragment(), d = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0, u = (c) => d + l + c + 1;
    if (i) {
      const c = this.state.rowHeight, f = l * c, m = (t.length - l - s.length) * c;
      a.appendChild(this._spacerRow(f, e.length)), s.forEach((h, p) => a.appendChild(this._buildRow(h, e, o, u(p)))), a.appendChild(this._spacerRow(m, e.length));
    } else
      s.forEach((c, f) => a.appendChild(this._buildRow(c, e, o, u(f))));
    this._tbody.replaceChildren(a);
  }
  _buildRow(e, t, i, s) {
    if (e.__sgGroup) return this._buildGroupRow(e, t, i);
    const l = String(this._rowId(e));
    let o = i.get(l);
    o || (o = g("tr")), o.dataset.rowId = l, o.classList.remove("sg-spacer");
    const a = this.state.selection.has(this._rowId(e));
    return L(o, { "data-selected": a ? "true" : null }), this._renderRow(o, e, t, s), o;
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const s = g("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return s.style.height = "0px", s.appendChild(g("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), s;
    }
    const i = g("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return i.style.height = e + "px", i.appendChild(g("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), i;
  }
  _renderRow(e, t, i, s) {
    e.innerHTML = "";
    const l = this._pinOffsets(), o = this._selKeys || { active: null, range: null }, a = String(this._rowId(t));
    for (const d of i) {
      const u = `${a}:${d.field}`, c = g("td", {
        "data-col-id": d.field,
        "data-pinned": d.pinned || null,
        "data-cell-active": o.active === u ? "true" : null,
        "data-cell-range": o.range && o.range.has(u) ? "true" : null
      });
      if (d.pinned === "left" ? c.style.left = l.left[d.field] + "px" : d.pinned === "right" && (c.style.right = l.right[d.field] + "px"), d._isRowNumber) {
        c.classList.add("sg-gutter-cell"), c.setAttribute("data-gutter", "true"), c.removeAttribute("data-cell-active"), c.removeAttribute("data-cell-range"), c.textContent = s != null ? String(s) : "", e.appendChild(c);
        continue;
      }
      if (d._isCheckbox) {
        c.classList.add("sg-checkbox-cell");
        const m = g("input", { type: "checkbox" });
        m.checked = this.state.selection.has(this._rowId(t)), c.appendChild(m), e.appendChild(c);
        continue;
      }
      if (d._isGroupCol) {
        c.classList.add("sg-group-leaf-cell"), c.removeAttribute("data-cell-active"), c.removeAttribute("data-cell-range"), e.appendChild(c);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === d.field) {
        c.setAttribute("data-editing", "true");
        const m = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : b(t, d), { node: h, control: p } = this._buildEditor(d, m);
        c.appendChild(h);
        const _ = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          p?.focus(), _ || p?.select?.();
        });
      } else
        this._renderCellContent(c, t, d);
      e.appendChild(c);
    }
  }
  _renderCellContent(e, t, i) {
    if (i.cellRenderer) {
      const s = M(i.cellRenderer);
      if (s) {
        const l = b(t, i), o = S(t, i);
        (s.dataset.bind || s.dataset.bindText !== void 0) && (s.textContent = s.dataset.bind ? String(t[s.dataset.bind] ?? "") : o), s.dataset.bindAttr && s.setAttribute(s.dataset.bindAttr, l), s.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((a) => {
          a.dataset.bindText !== void 0 ? a.textContent = o : a.dataset.bind && (a.textContent = String(t[a.dataset.bind] ?? "")), a.dataset.bindAttr && a.setAttribute(a.dataset.bindAttr, l);
        }), e.appendChild(s);
        return;
      }
    }
    e.textContent = S(t, i);
  }
  toggleGroup(e, t = 0) {
    this._groupExpanded.set(e, !this._isGroupExpanded(e, t)), this.scheduleRender("group"), w(this.element, "grid:groupToggled", { groupId: e, expanded: this._groupExpanded.get(e) });
  }
  expandAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = -1, this.scheduleRender("group");
  }
  collapseAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = 0, this.scheduleRender("group");
  }
  setRowGroupColumns(e) {
    this.state.group.cols = Array.isArray(e) ? e.slice() : [], this._groupExpanded.clear(), this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("group"), w(this.element, "grid:columnRowGroupChanged", { rowGroupCols: this.state.group.cols.slice() });
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
    t == null ? delete this.state.group.aggs[e] : this.state.group.aggs[e] = t, this.scheduleRender("group");
  }
  _buildGroupRow(e, t, i) {
    const s = `__g:${e.groupId}`;
    let l = i.get(s);
    return l || (l = g("tr")), l.dataset.rowId = s, l.dataset.group = "true", l.dataset.groupLevel = String(e.level), l.className = "sg-group-row", this._renderGroupRow(l, e, t), l;
  }
  _renderGroupRow(e, t, i) {
    e.innerHTML = "";
    const s = this._pinOffsets(), l = this._isGroupExpanded(t.groupId, t.level), o = (this.state.group.displayType || "singleColumn") === "singleColumn", a = i.filter((u) => !u._isRowNumber && !u._isCheckbox && !u._isGroupCol), d = a.some((u) => u.field === t.field) ? t.field : a[0]?.field;
    for (const u of i) {
      const c = g("td", { "data-col-id": u.field, "data-pinned": u.pinned || null });
      if (u.pinned === "left" ? c.style.left = s.left[u.field] + "px" : u.pinned === "right" && (c.style.right = s.right[u.field] + "px"), u._isRowNumber || u._isCheckbox) {
        c.classList.add(u._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(c);
        continue;
      }
      if (o ? u._isGroupCol : u.field === d) {
        c.classList.add("sg-group-cell"), c.style.paddingLeft = `${8 + t.level * 18}px`;
        const m = g("span", {
          class: "sg-group-caret",
          "data-expanded": l ? "true" : "false",
          "aria-hidden": "true"
        });
        m.innerHTML = V, c.append(
          m,
          g("span", { class: "sg-group-label" }, this._groupValueLabel(t)),
          g("span", { class: "sg-group-count" }, ` (${t.count})`)
        );
      } else !u._isGroupCol && t.aggregates && t.aggregates[u.field] != null && (c.classList.add("sg-agg-cell"), c.textContent = this._formatAggregate(t.aggregates[u.field]));
      e.appendChild(c);
    }
  }
  _groupValueLabel(e) {
    const t = e.value;
    if (t == null || t === "") return "(Blanks)";
    const i = this._colByField(e.field);
    return i ? S({ [e.field]: t }, i) : String(t);
  }
  _formatAggregate(e) {
    return e == null ? "" : typeof e == "number" ? Number.isInteger(e) ? String(e) : String(Math.round(e * 100) / 100) : String(e);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, t) {
    if (e.cellEditor) {
      const s = M(e.cellEditor);
      if (s) {
        const l = s.matches?.("input,select,textarea") ? s : s.querySelector?.("[data-editor-input]") || s.querySelector?.("input,select,textarea");
        return l && (this._seedEditorValue(l, e, t), l.addEventListener("keydown", this._onEditorKey), l.addEventListener("blur", this._onEditorBlur)), { node: s, control: l };
      }
    }
    const i = this._buildEditorInput(e, t);
    return { node: i, control: i };
  }
  _seedEditorValue(e, t, i) {
    if (t.type === "date" && i) {
      const s = i instanceof Date ? i : new Date(i);
      e.value = Number.isNaN(s?.getTime?.()) ? i ?? "" : s.toISOString().slice(0, 10);
    } else t.type === "boolean" ? e.value = i === !0 ? "true" : i === !1 ? "false" : "" : e.value = i ?? "";
  }
  _buildEditorInput(e, t) {
    let i;
    if (e.type === "number") i = g("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const s = t instanceof Date ? t : t ? new Date(t) : null, l = s ? s.toISOString().slice(0, 10) : "";
      i = g("input", { type: "date", value: l });
    } else e.type === "boolean" ? (i = g("select"), i.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : i = g("input", { type: "text", value: t ?? "" });
    return i.addEventListener("keydown", this._onEditorKey), i.addEventListener("blur", this._onEditorBlur), i;
  }
  _renderPagination() {
    this.state.pagination.enabled;
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
    const i = this._coerceRowId(t.dataset.rowId), s = e.target.closest("td");
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(i, "toggle");
      return;
    }
    if (s && s.dataset.gutter === "true") {
      if (this._rowDragMoved) {
        this._rowDragMoved = !1;
        return;
      }
      if (this.rowSelectionValue !== "") {
        const o = e.shiftKey ? "range" : e.metaKey || e.ctrlKey ? "toggle" : "replace";
        this.clearCellSelection(), this.toggleRowSelection(i, o), w(this.element, "grid:rowClicked", { rowId: i, row: this.state.rowData.find((a) => this._rowId(a) === i), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (s) {
      const o = this.state.rowData.find((d) => this._rowId(d) === i), a = s.dataset.colId;
      w(this.element, "grid:cellClicked", { rowId: i, colId: a, value: o?.[a], event: e });
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
    const l = e.shiftKey ? "range" : e.metaKey || e.ctrlKey || this.rowMultiSelectWithClickValue ? "toggle" : "replace";
    this.toggleRowSelection(i, l), w(this.element, "grid:rowClicked", { rowId: i, row: this.state.rowData.find((o) => this._rowId(o) === i), event: e });
  }
  // ----- Cell selection (Numbers/Sheets-style: multi-range + active cell) -----
  _cellAt(e) {
    const t = e.closest?.("td"), i = e.closest?.("tr");
    return !t || !i || i.dataset.group === "true" || t.classList.contains("sg-checkbox-cell") || t.classList.contains("sg-group-leaf-cell") || t.dataset.gutter === "true" || !t.dataset.colId || t.dataset.editing === "true" ? null : { rowId: this._coerceRowId(i.dataset.rowId), colId: t.dataset.colId };
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
    const t = Array.from(this.state.selection).map(String), i = new Set(t.includes(String(e)) ? t : [String(e)]), s = g("div", { class: "sg-drag-ghost sg-grid" }), l = g("table"), o = g("tbody");
    let a = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((u) => {
      if (i.has(u.dataset.rowId) && a < 6) {
        const c = u.cloneNode(!0);
        c.removeAttribute("data-selected"), c.querySelectorAll("td").forEach((f) => {
          f.style.left = "", f.style.right = "", f.removeAttribute("data-pinned"), f.removeAttribute("data-cell-active"), f.removeAttribute("data-cell-range");
        }), o.appendChild(c), a += 1;
      }
    }), l.appendChild(o), s.appendChild(l), i.size > a && s.appendChild(g("div", { class: "sg-drag-ghost-more" }, `+${i.size - a} more rows`)), s.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(s);
    const d = g("div", { class: "sg-drop-indicator" });
    document.body.appendChild(d), this._rowDrag = { ids: i, ghost: s, indicator: d, dropRowId: null, dropBefore: !0 }, document.body.classList.add("sg-row-dragging");
  }
  _updateDropIndicator(e) {
    const t = Array.from(this._tbody.querySelectorAll("tr[data-row-id]"));
    let i = null, s = !0;
    for (const d of t) {
      const u = d.getBoundingClientRect();
      if (e < u.top + u.height / 2) {
        i = d, s = !0;
        break;
      }
      i = d, s = !1;
    }
    if (!i) return;
    const l = i.getBoundingClientRect(), o = this._viewport.getBoundingClientRect(), a = this._rowDrag.indicator;
    a.style.left = `${o.left}px`, a.style.width = `${o.width}px`, a.style.top = `${(s ? l.top : l.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(i.dataset.rowId), this._rowDrag.dropBefore = s;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: i, dropRowId: s, dropBefore: l } = this._rowDrag;
    if (t.remove(), i.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, s == null || e.has(String(s))) return;
    const o = this.state.rowData, a = o.filter((c) => e.has(String(this._rowId(c)))), d = o.filter((c) => !e.has(String(this._rowId(c))));
    let u = d.findIndex((c) => this._rowId(c) === s);
    u < 0 ? u = d.length : l || (u += 1), d.splice(u, 0, ...a), this.state.rowData = d, this.state.sortModel = [], this.scheduleRender("data"), w(this.element, "grid:rowDragEnd", {
      ids: a.map((c) => this._rowId(c)),
      toRowId: s,
      before: l
    });
  }
  // Toggle the active/range data-attrs on the existing cell DOM without
  // rebuilding the tbody (so in-flight mouse interactions aren't disrupted).
  _applyCellSelHighlight() {
    const e = this._computeCellSelKeys();
    this._selKeys = e, this._tbody && this._tbody.querySelectorAll("td[data-col-id]").forEach((t) => {
      const i = t.parentElement, s = `${i && i.dataset.rowId}:${t.dataset.colId}`;
      e.active === s ? t.setAttribute("data-cell-active", "true") : t.removeAttribute("data-cell-active"), e.range && e.range.has(s) ? t.setAttribute("data-cell-range", "true") : t.removeAttribute("data-cell-range");
    });
  }
  // Rectangle (display indices) for a {anchor,focus} range, or null.
  _rangeRect(e) {
    if (!e) return null;
    const t = this._displayList.pageRows, i = this._visibleCols(), s = (c) => t.findIndex((f) => this._rowId(f) === c), l = (c) => i.findIndex((f) => f.field === c), o = s(e.anchor.rowId), a = l(e.anchor.colId);
    if (o < 0 || a < 0) return null;
    const d = s(e.focus.rowId), u = l(e.focus.colId);
    return {
      r0: Math.min(o, d < 0 ? o : d),
      r1: Math.max(o, d < 0 ? o : d),
      c0: Math.min(a, u < 0 ? a : u),
      c1: Math.max(a, u < 0 ? a : u),
      rows: t,
      cols: i
    };
  }
  _activeRect() {
    return this._rangeRect(this.state.cellSel.ranges[this.state.cellSel.activeIdx]);
  }
  _cellRangeRows(e = this._activeRect()) {
    if (!e) return [];
    const t = [];
    for (let i = e.r0; i <= e.r1; i++) {
      const s = e.rows[i];
      if (!s) continue;
      const l = [];
      for (let o = e.c0; o <= e.c1; o++) {
        const a = e.cols[o];
        a && l.push(S(s, a));
      }
      t.push(l);
    }
    return t;
  }
  // Active cell key + union of all ranges' cells (active stays outlined, unfilled).
  _computeCellSelKeys() {
    const e = this._activeCell();
    if (!e) return { active: null, range: null };
    const t = `${e.rowId}:${e.colId}`, i = /* @__PURE__ */ new Set();
    for (const s of this.state.cellSel.ranges) {
      const l = this._rangeRect(s);
      if (l)
        for (let o = l.r0; o <= l.r1; o++) {
          const a = l.rows[o];
          if (a)
            for (let d = l.c0; d <= l.c1; d++) {
              const u = l.cols[d];
              if (!u) continue;
              const c = `${this._rowId(a)}:${u.field}`;
              c !== t && i.add(c);
            }
        }
    }
    return { active: t, range: i };
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
      const i = this._rangeRect(t);
      if (i)
        for (let s = i.r0; s <= i.r1; s++) {
          const l = i.rows[s];
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
    return this._visibleCols().filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol);
  }
  _moveActiveCell(e, t, i) {
    const s = this._displayList.pageRows, l = this._navCols();
    if (!s.length || !l.length) return;
    const o = (f, m, h) => Math.max(m, Math.min(f, h)), a = this._activeCell(), d = () => s.findIndex((f) => !f.__sgGroup);
    let u = a ? s.findIndex((f) => this._rowId(f) === a.rowId) : d(), c = a ? l.findIndex((f) => f.field === a.colId) : 0;
    if (u < 0 && (u = d()), !(u < 0)) {
      if (c < 0 && (c = 0), i && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const f = this.state.cellSel.ranges[this.state.cellSel.activeIdx], m = o(s.findIndex((p) => this._rowId(p) === f.focus.rowId) + e, 0, s.length - 1), h = o(l.findIndex((p) => p.field === f.focus.colId) + t, 0, l.length - 1);
        this._extendActiveRange({ rowId: this._rowId(s[m]), colId: l[h].field });
      } else {
        let f = o(u + e, 0, s.length - 1);
        if (e !== 0) {
          for (; s[f] && s[f].__sgGroup; ) {
            const h = f + e;
            if (h < 0 || h >= s.length) break;
            f = h;
          }
          if (!s[f] || s[f].__sgGroup) return;
        }
        const m = o(c + t, 0, l.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(s[f]), colId: l[m].field });
      }
      this._applyCellSelHighlight(), this._scrollActiveIntoView(), w(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
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
    }, this._applyCellSelHighlight(), w(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
  }
  // Clear the value of every selected, editable cell (Delete/Backspace).
  _clearSelectedCells() {
    let e = !1;
    for (const t of this.state.cellSel.ranges) {
      const i = this._rangeRect(t);
      if (i)
        for (let s = i.r0; s <= i.r1; s++) {
          const l = i.rows[s];
          if (!(!l || l.__sgGroup))
            for (let o = i.c0; o <= i.c1; o++) {
              const a = i.cols[o];
              if (!a || !a.editable || a._isCheckbox || a._isRowNumber) continue;
              const d = l[a.field];
              d === "" || d == null || (l[a.field] = "", e = !0, w(this.element, "grid:cellValueChanged", { rowId: this._rowId(l), colId: a.field, oldValue: d, newValue: "" }));
            }
        }
    }
    return e && this.scheduleRender("cells"), e;
  }
  _scrollActiveIntoView() {
    this._tbody?.querySelector('td[data-cell-active="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  _onBodyDblClick(e) {
    const t = e.target.closest("tr"), i = e.target.closest("td");
    if (!t || !i || i.dataset.editing === "true") return;
    const s = this._coerceRowId(t.dataset.rowId), l = i.dataset.colId;
    this.startEditingCell(s, l);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const i = this._visibleCols().filter((f) => f.editable && !f._isCheckbox), s = this._displayList.pageRows, l = s.findIndex((f) => this._rowId(f) === t.rowId), o = i.findIndex((f) => f.field === t.colId);
    if (!i.length || !s.length || l < 0 || o < 0) {
      this.stopEditing(!1);
      return;
    }
    const a = s.length * i.length, d = (l * i.length + o + e + a) % a, u = s[Math.floor(d / i.length)], c = i[d % i.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(u), c.field), requestAnimationFrame(() => {
      this._navigatingEditor = !1;
    });
  }
  // Wire editor listeners whenever a cell mounts an input.
  // Done lazily via MutationObserver on tbody (cheap because tbody is small per page).
  // ----- Helpers -----
  _visibleCols() {
    const e = this.state.columnDefs.filter((o) => !o.hidden), t = this.state.group?.cols || [];
    if (!t.length) return e;
    if ((this.state.group.displayType || "singleColumn") === "singleColumn") {
      const o = new Set(t);
      return [{
        field: "__group",
        headerName: "Group",
        _isGroupCol: !0,
        width: 240,
        sortable: !1,
        filter: null,
        resizable: !1
      }, ...e.filter((d) => !o.has(d.field))];
    }
    if (this.groupReorderColumnsValue === !1) return e;
    const s = t.map((o) => e.find((a) => a.field === o)).filter(Boolean), l = new Set(s);
    return [...s, ...e.filter((o) => !l.has(o))];
  }
  _pinOffsets() {
    const e = this._visibleCols(), t = {};
    let i = 0;
    for (const l of e)
      l.pinned === "left" && (t[l.field] = i, i += l.width || 150);
    const s = {};
    i = 0;
    for (let l = e.length - 1; l >= 0; l--) {
      const o = e[l];
      o.pinned === "right" && (s[o.field] = i, i += o.width || 150);
    }
    return { left: t, right: s };
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
y(E, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: k },
  rowHeight: { type: Number, default: le },
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
  groupDisplayType: { type: String, default: "singleColumn" }
  // 'singleColumn' (auto Group col on left) | 'inline' (label in grouped col)
});
function oe(n, r) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (n[t] !== r[t]) return !1;
  return !0;
}
function ae(n) {
  return n === "number" || n === "date" ? [
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "lessThan", label: "Less than" },
    { value: "greaterThan", label: "Greater than" },
    { value: "inRange", label: "In range" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" }
  ] : n === "boolean" ? [
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
function de(n, r) {
  if (r === "number") {
    const e = Number(n);
    return Number.isFinite(e) ? e : n;
  }
  return r === "date" ? n : r === "boolean" ? n === "true" ? !0 : n === "false" ? !1 : null : n;
}
function x(n) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(n)) : String(n).replace(/["\\\n\r]/g, (r) => "\\" + r);
}
class I extends R {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    y(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, i = e.clientY;
      let s = !1;
      const l = (a) => {
        const d = Math.abs(a.clientX - t), u = Math.abs(a.clientY - i);
        !s && (d > 5 || u > 5) && (s = !0, document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", o), this._beginReorder(t));
      }, o = (a) => {
        document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", o), s || this.sort(a);
      };
      document.addEventListener("mousemove", l), document.addEventListener("mouseup", o);
    });
  }
  connect() {
    if (this.grid = ne(this.element, "grid", this.application), !!this.grid) {
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
    const t = this.element.parentElement, i = Array.from(t.children), s = i.indexOf(this.element);
    let l = s;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const o = (d) => {
      const u = d.clientX;
      let c = i.length;
      for (let f = 0; f < i.length; f++) {
        const m = i[f].getBoundingClientRect();
        if (u < m.left + m.width / 2) {
          c = f;
          break;
        }
      }
      l = c > s ? c - 1 : c;
    }, a = () => {
      document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", l !== s && this.grid.moveColumn(this.fieldValue, l);
    };
    document.addEventListener("mousemove", o), document.addEventListener("mouseup", a);
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
    const t = e.clientX, i = this.element.offsetWidth, s = (o) => this.grid.setColumnWidth(this.fieldValue, i + (o.clientX - t)), l = () => {
      document.removeEventListener("mousemove", s), document.removeEventListener("mouseup", l), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", s), document.addEventListener("mouseup", l), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
y(I, "values", {
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
class B extends R {
  connect() {
  }
}
class O extends R {
  connect() {
  }
}
class z extends R {
  connect() {
  }
}
class D extends R {
  constructor() {
    super(...arguments);
    y(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), i = e.paginationGetTotalPages(), s = e.paginationGetRowCount(), l = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const o = s === 0 ? 0 : t * l + 1, a = Math.min(s, o + l - 1);
        this.pageInfoTarget.textContent = s === 0 ? "0 rows" : `${o}–${a} of ${s}`;
      }
      this.hasFirstTarget && (this.firstTarget.disabled = t === 0), this.hasPrevTarget && (this.prevTarget.disabled = t === 0), this.hasNextTarget && (this.nextTarget.disabled = t >= i - 1), this.hasLastTarget && (this.lastTarget.disabled = t >= i - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(l));
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
y(D, "outlets", ["grid"]), y(D, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
function ce(n) {
  const r = n ?? W.start();
  return r.register("grid", E), r.register("header-cell", I), r.register("row", B), r.register("cell", O), r.register("filter", z), r.register("pagination", D), r;
}
const ue = {
  start: ce,
  GridController: E,
  HeaderCellController: I,
  RowController: B,
  CellController: O,
  FilterController: z,
  PaginationController: D
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = ue);
export {
  O as CellController,
  z as FilterController,
  E as GridController,
  I as HeaderCellController,
  D as PaginationController,
  B as RowController,
  ue as default,
  ce as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
