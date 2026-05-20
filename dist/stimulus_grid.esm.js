var q = Object.defineProperty;
var z = (s, l, e) => l in s ? q(s, l, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[l] = e;
var m = (s, l, e) => z(s, typeof l != "symbol" ? l + "" : l, e);
import { Controller as v, Application as B } from "@hotwired/stimulus";
function y(s, l) {
  return typeof l.valueGetter == "function" ? l.valueGetter(s) : s?.[l.field];
}
function b(s, l) {
  const e = y(s, l);
  return typeof l.valueFormatter == "function" ? l.valueFormatter(e, s) : e == null ? "" : l.type === "date" && e instanceof Date ? e.toLocaleDateString() : l.type === "boolean" ? e ? "✓" : "" : String(e);
}
const A = {
  contains: (s, l) => String(s ?? "").toLowerCase().includes(String(l ?? "").toLowerCase()),
  notContains: (s, l) => !String(s ?? "").toLowerCase().includes(String(l ?? "").toLowerCase()),
  equals: (s, l) => String(s ?? "").toLowerCase() === String(l ?? "").toLowerCase(),
  notEqual: (s, l) => String(s ?? "").toLowerCase() !== String(l ?? "").toLowerCase(),
  startsWith: (s, l) => String(s ?? "").toLowerCase().startsWith(String(l ?? "").toLowerCase()),
  endsWith: (s, l) => String(s ?? "").toLowerCase().endsWith(String(l ?? "").toLowerCase()),
  blank: (s) => s == null || s === "",
  notBlank: (s) => s != null && s !== ""
}, W = {
  equals: (s, l) => Number(s) === Number(l),
  notEqual: (s, l) => Number(s) !== Number(l),
  lessThan: (s, l) => Number(s) < Number(l),
  lessThanOrEqual: (s, l) => Number(s) <= Number(l),
  greaterThan: (s, l) => Number(s) > Number(l),
  greaterThanOrEqual: (s, l) => Number(s) >= Number(l),
  inRange: (s, l, e) => Number(s) >= Number(l) && Number(s) <= Number(e),
  blank: (s) => s == null || s === "",
  notBlank: (s) => s != null && s !== ""
};
function w(s) {
  if (s == null || s === "") return null;
  if (s instanceof Date) return s;
  const l = new Date(s);
  return Number.isNaN(l.valueOf()) ? null : l;
}
const G = {
  equals: (s, l) => w(s)?.toDateString() === w(l)?.toDateString(),
  notEqual: (s, l) => w(s)?.toDateString() !== w(l)?.toDateString(),
  lessThan: (s, l) => (w(s)?.valueOf() ?? -1 / 0) < (w(l)?.valueOf() ?? 1 / 0),
  greaterThan: (s, l) => (w(s)?.valueOf() ?? 1 / 0) > (w(l)?.valueOf() ?? -1 / 0),
  inRange: (s, l, e) => {
    const t = w(s)?.valueOf();
    return t != null && t >= (w(l)?.valueOf() ?? -1 / 0) && t <= (w(e)?.valueOf() ?? 1 / 0);
  },
  blank: (s) => s == null || s === "",
  notBlank: (s) => s != null && s !== ""
}, H = {
  equals: (s, l) => l === "true" ? !!s : l === "false" ? !s : !0
}, K = {
  in: (s, l) => Array.isArray(l) && l.includes(String(s ?? ""))
}, $ = { text: A, number: W, date: G, boolean: H, set: K };
function j(s, l, e) {
  if (!e) return !0;
  const t = e.filterType || l.filter || "text", n = ($[t] || A)[e.type];
  if (!n) return !0;
  const r = y(s, l);
  return n(r, e.value, e.value2);
}
function P(s, l, e) {
  const t = Object.entries(l || {}).filter(([, i]) => i != null);
  return t.length === 0 ? s : s.filter((i) => t.every(([n, r]) => {
    const a = e[n];
    return a ? j(i, a, r) : !0;
  }));
}
function T(s, l, e) {
  if (!l) return s;
  const t = String(l).toLowerCase();
  return s.filter((i) => {
    for (const n of e) {
      const r = b(i, n);
      if (r && String(r).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function U(s, l, e) {
  if (s == null && l == null) return 0;
  if (s == null) return -1;
  if (l == null) return 1;
  if (e === "number") return Number(s) - Number(l);
  if (e === "date") {
    const t = w(s)?.valueOf() ?? 0, i = w(l)?.valueOf() ?? 0;
    return t - i;
  }
  return e === "boolean" ? s === l ? 0 : s ? 1 : -1 : String(s).localeCompare(String(l), void 0, { numeric: !0, sensitivity: "base" });
}
function X(s, l, e) {
  if (!l || l.length === 0) return s;
  const t = s.slice();
  return t.sort((i, n) => {
    for (const { colId: r, sort: a } of l) {
      const o = e[r];
      if (!o) continue;
      const c = y(i, o), u = y(n, o), d = typeof o.comparator == "function" ? o.comparator(c, u, i, n) : U(c, u, o.type);
      if (d !== 0) return a === "desc" ? -d : d;
    }
    return 0;
  }), t;
}
function Q(s, l) {
  if (!l || !l.enabled) return { rows: s, total: s.length, pageRows: s };
  const e = s.length, t = Math.max(1, Math.ceil(e / l.pageSize)), i = Math.min(l.page, t - 1), n = i * l.pageSize, r = s.slice(n, n + l.pageSize);
  return { rows: s, total: e, totalPages: t, page: i, pageRows: r };
}
function Y(s) {
  if (s.serverSide) {
    const n = s.rowData, r = s.pagination?.pageSize || n.length || 1, a = s.serverRowCount ?? n.length, o = Math.max(1, Math.ceil(a / r)), c = Math.min(s.pagination?.page || 0, o - 1);
    return { filteredSorted: n, rows: n, total: a, totalPages: o, page: c, pageRows: n };
  }
  const l = Object.fromEntries(s.columnDefs.map((n) => [n.field, n])), e = s.columnDefs.filter((n) => !n.hidden && !n._isCheckbox);
  let t = s.rowData;
  t = P(t, s.filterModel, l), t = T(t, s.quickFilter, e), t = X(t, s.sortModel, l);
  const i = Q(t, s.pagination);
  return { filteredSorted: t, ...i };
}
function Z(s, l, e, t, i = 6) {
  const n = Math.ceil(l / e), r = Math.max(0, Math.floor(s / e) - i), a = Math.min(t, r + n + i * 2);
  return { first: r, last: a };
}
function J(s) {
  return {
    // ---- Data ----
    setRowData(l) {
      s.setRowData(l);
    },
    getRowData() {
      return s.state.rowData.slice();
    },
    applyTransaction(l) {
      return s.applyTransaction(l);
    },
    // Server-side row model
    setRowCount(l) {
      s.setRowCount(l);
    },
    getRowCount() {
      return s.state.serverSide ? s.state.serverRowCount : s.state.rowData.length;
    },
    isServerSide() {
      return !!s.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(l) {
      s.setColumnDefs(l);
    },
    getColumnDefs() {
      return s.state.columnDefs.slice();
    },
    setColumnVisible(l, e) {
      s.setColumnVisible(l, e);
    },
    setColumnPinned(l, e) {
      s.setColumnPinned(l, e);
    },
    setColumnWidth(l, e) {
      s.setColumnWidth(l, e);
    },
    moveColumn(l, e) {
      s.moveColumn(l, e);
    },
    autoSizeColumn(l) {
      s.autoSizeColumn(l);
    },
    autoSizeAllColumns() {
      s.state.columnDefs.forEach((l) => s.autoSizeColumn(l.field));
    },
    sizeColumnsToFit() {
      s.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(l) {
      s.setSortModel(l);
    },
    getSortModel() {
      return s.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(l) {
      s.setFilterModel(l);
    },
    getFilterModel() {
      return { ...s.state.filterModel };
    },
    setColumnFilter(l, e) {
      s.setColumnFilter(l, e);
    },
    destroyFilter(l) {
      s.setColumnFilter(l, null);
    },
    setQuickFilter(l) {
      s.setQuickFilter(l);
    },
    getQuickFilter() {
      return s.getQuickFilter();
    },
    // ---- Selection ----
    selectAll() {
      s.selectAll();
    },
    deselectAll() {
      s.deselectAll();
    },
    selectRow(l) {
      s.setSelected(l, !0);
    },
    deselectRow(l) {
      s.setSelected(l, !1);
    },
    getSelectedRows() {
      return s.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(s.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(l) {
      s.goToPage(l);
    },
    paginationGoToFirstPage() {
      s.goToPage(0);
    },
    paginationGoToNextPage() {
      s.goToPage(s.state.pagination.page + 1);
    },
    paginationGoToPreviousPage() {
      s.goToPage(s.state.pagination.page - 1);
    },
    paginationGoToLastPage() {
      s.goToPage(s.lastPageIndex());
    },
    paginationSetPageSize(l) {
      s.setPageSize(l);
    },
    paginationGetCurrentPage() {
      return s.state.pagination.page;
    },
    paginationGetTotalPages() {
      return s.totalPages();
    },
    paginationGetRowCount() {
      return s.filteredCount();
    },
    paginationGetPageSize() {
      return s.state.pagination.pageSize;
    },
    paginationIsEnabled() {
      return s.state.pagination.enabled;
    },
    // ---- Cell selection ----
    getCellSelection() {
      return s.getCellSelectionDetail();
    },
    getCellRangeValues() {
      return s._cellRangeRows();
    },
    getCellSelectionRowIds() {
      return s.getCellSelectionRowIds();
    },
    // ---- Editing ----
    startEditingCell({ rowId: l, colId: e }) {
      s.startEditingCell(l, e);
    },
    stopEditing(l = !1) {
      s.stopEditing(l);
    },
    // ---- Export ----
    getDataAsCsv(l = {}) {
      return s.getDataAsCsv(l);
    },
    exportDataAsCsv(l = {}) {
      return s.exportDataAsCsv(l);
    },
    // ---- Display ----
    refreshCells(l = {}) {
      s.refresh(l);
    },
    redrawRows(l = {}) {
      s.refresh(l);
    },
    // ---- Events ----
    addEventListener(l, e) {
      s.element.addEventListener(l, e);
    },
    removeEventListener(l, e) {
      s.element.removeEventListener(l, e);
    }
  };
}
function f(s, l = {}, e = []) {
  const t = document.createElement(s);
  for (const [i, n] of Object.entries(l))
    n === !1 || n == null || (i === "class" ? t.className = n : i === "style" && typeof n == "object" ? Object.assign(t.style, n) : i.startsWith("on") && typeof n == "function" ? t.addEventListener(i.slice(2).toLowerCase(), n) : n === !0 ? t.setAttribute(i, "") : t.setAttribute(i, String(n)));
  for (const i of [].concat(e))
    i == null || i === !1 || t.appendChild(typeof i == "string" ? document.createTextNode(i) : i);
  return t;
}
function I(s, l) {
  for (const [e, t] of Object.entries(l))
    t == null || t === !1 ? s.removeAttribute(e) : t === !0 ? s.setAttribute(e, "") : s.setAttribute(e, String(t));
}
function L(s) {
  const l = document.getElementById(s);
  return !l || l.tagName !== "TEMPLATE" ? null : l.content.firstElementChild.cloneNode(!0);
}
function g(s, l, e) {
  s.dispatchEvent(new CustomEvent(l, { detail: e, bubbles: !0 }));
}
function ee(s, l, e) {
  let t = s.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(l)) {
      const n = e.getControllerForElementAndIdentifier(t, l);
      if (n) return n;
    }
    t = t.parentElement;
  }
  return null;
}
const te = 32, k = 100;
class D extends v {
  constructor() {
    super(...arguments);
    m(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    m(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
    });
    m(this, "_onCellMouseDown", (e) => {
      if (e.button !== 0) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      e.metaKey || e.ctrlKey ? this.state.cellSel = { anchor: t, focus: t } : e.shiftKey && this.state.cellSel.anchor ? this.state.cellSel.focus = t : (this.state.cellSel = { anchor: t, focus: t }, this._cellDragging = !0), this._cellDragMoved = !1, this._applyCellSelHighlight(), g(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    m(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const i = this.state.cellSel.focus;
      i && i.rowId === t.rowId && i.colId === t.colId || (this.state.cellSel.focus = t, this._cellDragMoved = !0, this._applyCellSelHighlight(), g(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
    });
    m(this, "_onCellMouseUp", () => {
      this._cellDragging = !1;
    });
    // Copy the selected cell range to the clipboard as TSV (rows \n, cols \t).
    m(this, "_onCopy", (e) => {
      if (this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName)) return;
      const i = this._cellSelRect();
      if (!i) return;
      const n = this._cellRangeRows(i).map((r) => r.map((a) => String(a ?? "")).join("	")).join(`
`);
      n && (e.clipboardData?.setData("text/plain", n), e.preventDefault());
    });
    m(this, "_onEditorKey", (e) => {
      this.state.editing && (e.key === "Enter" ? (e.preventDefault(), this.stopEditing(!1)) : e.key === "Escape" ? (e.preventDefault(), this.stopEditing(!0)) : e.key === "Tab" && (e.preventDefault(), this._tabToEditableCell(e.shiftKey ? -1 : 1)));
    });
    m(this, "_onEditorBlur", () => {
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
      cellSel: { anchor: null, focus: null },
      // {rowId, colId} rectangle
      editing: null,
      pagination: { enabled: !1, page: 0, pageSize: k },
      scrollTop: 0,
      viewportHeight: 400
    }, this._displayList = { filteredSorted: [], pageRows: [], total: 0, totalPages: 1, page: 0 }, this._renderPending = !1, this._dirty = /* @__PURE__ */ new Set(), this._lastRenderedRowIds = /* @__PURE__ */ new Set(), this._runtimeOverrides = /* @__PURE__ */ Object.create(null);
  }
  connect() {
    this.element.classList.add("sg-grid"), this.heightValue && (this.element.style.height = this.heightValue), this.state.rowHeight = this.rowHeightValue, this.state.pagination = {
      enabled: this.paginationValue,
      page: 0,
      pageSize: this.pageSizeValue
    }, this.state.serverSide = this.serverSideValue, this.state.serverRowCount = this.rowCountValue, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = J(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy);
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, i) => {
      const n = {}, r = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      return n[this.getRowIdValue] = r != null ? this._coerceRowId(r) : i + 1, t.querySelectorAll("td").forEach((a) => {
        const o = a.getAttribute("data-cell-col-id-value") || a.getAttribute("data-col-id");
        o && (n[o] = a.textContent.trim());
      }), n;
    }), e.innerHTML = ""), this._initialHead = this.element.querySelector("thead");
  }
  _buildChrome() {
    let e = this.element.querySelector("table");
    if (!e) {
      e = f("table");
      const i = f("thead");
      e.appendChild(i), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = f("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const i = f("div", { class: "sg-body-viewport" });
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
    this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), g(this.element, "grid:ready", { api: this.element.gridApi }), g(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
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
    const i = this.state.filterModel[e.field] || {}, n = se(e.filter), r = f("div", { class: "sg-filter-popover" }), a = f("select");
    n.forEach((_) => a.append(new Option(_.label, _.value, !1, _.value === i.type)));
    const o = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", c = f("input", { type: o, value: i.value ?? "" }), u = f("input", { type: o, value: i.value2 ?? "", style: { display: "none" } }), d = () => {
      const _ = a.value, R = _ === "inRange", O = !(_ === "blank" || _ === "notBlank");
      c.style.display = O ? "" : "none", u.style.display = R ? "" : "none";
    };
    a.addEventListener("change", d), d();
    const h = f("div", { class: "sg-filter-actions" }), p = f("button", { type: "button" }, "Clear"), C = f("button", { type: "button", class: "primary" }, "Apply");
    h.append(p, C), p.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), C.addEventListener("click", () => {
      const _ = a.value, R = _ === "blank" || _ === "notBlank" ? { filterType: e.filter, type: _ } : { filterType: e.filter, type: _, value: c.value, value2: u.value || void 0 };
      this.setColumnFilter(e.field, R), this._closeFilterPopover();
    }), r.append(
      f("label", {}, "Condition"),
      a,
      c,
      u,
      h
    ), document.body.appendChild(r);
    const M = t.getBoundingClientRect();
    r.style.left = `${M.left + window.scrollX}px`, r.style.top = `${M.bottom + window.scrollY + 2}px`, this._filterPopover = r, document.addEventListener("mousedown", this._onDocMouseDown), c.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const i = this.state.columnDefs.findIndex((a) => a.field === e.field), n = this._runtimeOverrides[e.field] || {}, r = { ...e, ...n, _headerEl: t };
    if (i >= 0) {
      const a = this.state.columnDefs[i];
      if (a._headerEl === t && ie(a, r)) return;
      this.state.columnDefs[i] = r;
    } else
      this.state.columnDefs.push(r);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns");
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const i = this.state.sortModel.findIndex((r) => r.colId === e);
    let n;
    i === -1 ? n = { colId: e, sort: "asc" } : this.state.sortModel[i].sort === "asc" ? n = { colId: e, sort: "desc" } : n = null, t ? (i >= 0 && this.state.sortModel.splice(i, 1), n && this.state.sortModel.push(n)) : this.state.sortModel = n ? [n] : [], this.scheduleRender("sort"), g(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  setSortModel(e) {
    this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), g(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  // ----- Filter -----
  setColumnFilter(e, t) {
    t == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = t, this.state.pagination.page = 0, this.scheduleRender("filter"), g(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setFilterModel(e) {
    this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), g(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setQuickFilter(e) {
    const t = e == null ? "" : String(e);
    t !== this.state.quickFilter && (this.state.quickFilter = t, this.state.pagination.page = 0, this.scheduleRender("filter"), g(this.element, "grid:filterChanged", {
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
    this.rowSelectionValue === "single" ? (i.clear(), i.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? i.has(e) ? i.delete(e) : i.add(e) : (i.clear(), i.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), g(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(i)
    });
  }
  setSelected(e, t) {
    t ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), g(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  selectAll() {
    this._displayList.filteredSorted.forEach((e) => this.state.selection.add(this._rowId(e))), this.scheduleRender("selection"), g(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  deselectAll() {
    this.state.selection.clear(), this.scheduleRender("selection"), g(this.element, "grid:selectionChanged", { selectedRows: [], selectedIds: [] });
  }
  getSelectedRows() {
    const e = this.state.selection;
    return this.state.rowData.filter((t) => e.has(this._rowId(t)));
  }
  _selectRange(e, t) {
    const i = this._displayList.filteredSorted, n = i.findIndex((c) => this._rowId(c) === e), r = i.findIndex((c) => this._rowId(c) === t);
    if (n < 0 || r < 0) return;
    const [a, o] = n <= r ? [n, r] : [r, n];
    for (let c = a; c <= o; c++) this.state.selection.add(this._rowId(i[c]));
  }
  // ----- Pagination -----
  goToPage(e) {
    const t = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(e, t)), this.scheduleRender("page"), g(this.element, "grid:paginationChanged", {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  setPageSize(e) {
    this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), g(this.element, "grid:paginationChanged", {
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
    let i = P(this.state.rowData, this.state.filterModel, e);
    return i = T(i, this.state.quickFilter, t), i.length;
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
  startEditingCell(e, t) {
    const i = this.state.columnDefs.find((r) => r.field === t);
    if (!i || !i.editable) return;
    const n = this.state.rowData.find((r) => this._rowId(r) === e);
    n && (this.state.editing = { rowId: e, colId: t, originalValue: y(n, i) }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: i, originalValue: n, draftValue: r } = this.state.editing, a = this._tbody.querySelector(`tr[data-row-id="${S(t)}"] td[data-col-id="${S(i)}"]`);
    let o = n;
    if (!e && a) {
      const c = a.querySelector("[data-editor-input]") || a.querySelector("input,select,textarea");
      c ? o = ne(c.value, this._colByField(i)?.type) : r !== void 0 && (o = r);
    }
    if (this.state.editing = null, !e && o !== n) {
      const c = this.state.rowData.find((d) => this._rowId(d) === t), u = c[i];
      c[i] = o, g(this.element, "grid:cellValueChanged", { rowId: t, colId: i, oldValue: u, newValue: o });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const i = this._colByField(e);
    i && (i.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), g(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const i = this._colByField(e);
    if (!i) return;
    const n = t || null;
    i.pinned = n, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: n }, this._reorderForPinning(), this.scheduleRender("columns"), g(this.element, "grid:columnPinned", { colId: e, pinned: n });
  }
  setColumnWidth(e, t) {
    const i = this._colByField(e);
    if (!i) return;
    const n = Math.max(i.minWidth || 40, Math.min(i.maxWidth || 4e3, t));
    i.width = n, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: n }, this.scheduleRender("columns"), g(this.element, "grid:columnResized", { colId: e, width: n });
  }
  moveColumn(e, t) {
    const i = this.state.columnDefs.findIndex((r) => r.field === e);
    if (i < 0 || i === t) return;
    const [n] = this.state.columnDefs.splice(i, 1);
    this.state.columnDefs.splice(t, 0, n), this.scheduleRender("columns"), g(this.element, "grid:columnMoved", { colId: e, fromIndex: i, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const i = (t.headerName || t.field || "").length, n = this.state.rowData.slice(0, 200);
    let r = i;
    for (const a of n) {
      const o = String(b(a, t) ?? "").length;
      o > r && (r = o);
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, r * 8 + 24)));
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), i = t.reduce((r, a) => r + (a.width || 150), 0);
    if (i === 0) return;
    const n = e / i;
    t.forEach((r) => {
      r.width = Math.max(r.minWidth || 40, Math.floor((r.width || 150) * n));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((n) => n.pinned === "left"), t = this.state.columnDefs.filter((n) => n.pinned === "right"), i = this.state.columnDefs.filter((n) => !n.pinned);
    this.state.columnDefs = [...e, ...i, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), g(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], i = [], n = [], r = new Map(this.state.rowData.map((a) => [this._rowId(a), a]));
    return (e.remove || []).forEach((a) => {
      const o = this._rowId(a);
      r.delete(o) && n.push(a);
    }), (e.update || []).forEach((a) => {
      const o = this._rowId(a);
      r.has(o) && (r.set(o, { ...r.get(o), ...a }), i.push(a));
    }), (e.add || []).forEach((a) => {
      const o = this._rowId(a);
      r.has(o) || (r.set(o, a), t.push(a));
    }), this.state.rowData = Array.from(r.values()), this.scheduleRender("data"), g(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: i, removed: n };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const i = this._visibleCols().filter((o) => !o._isCheckbox), n = t ? this.getSelectedRows() : this._displayList.filteredSorted, r = (o) => /[",\n\r]/.test(o) ? `"${String(o).replace(/"/g, '""')}"` : String(o), a = [i.map((o) => r(o.headerName || o.field)).join(e)];
    for (const o of n)
      a.push(i.map((c) => r(b(o, c))).join(e));
    return a.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const i = this.getDataAsCsv(t), n = new Blob([i], { type: "text/csv;charset=utf-8" }), r = URL.createObjectURL(n), a = f("a", { href: r, download: e });
    return document.body.appendChild(a), a.click(), a.remove(), URL.revokeObjectURL(r), i;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.size === 0) && (this._displayList = Y({
      rowData: this.state.rowData,
      columnDefs: this.state.columnDefs,
      sortModel: this.state.sortModel,
      filterModel: this.state.filterModel,
      quickFilter: this.state.quickFilter,
      pagination: this.state.pagination,
      serverSide: this.state.serverSide,
      serverRowCount: this.state.serverRowCount
    })), (e.has("columns") || e.has("sort") || e.has("filter") || e.has("selection")) && this._renderHeader(), this._renderBody(), this._renderPagination();
  }
  _renderHeader() {
    if (!this._thead) return;
    const e = this._visibleCols(), t = this._thead.querySelector("tr") || (() => {
      const d = f("tr");
      return this._thead.appendChild(d), d;
    })(), i = /* @__PURE__ */ new Map();
    Array.from(t.querySelectorAll("th")).forEach((d) => {
      const h = d.getAttribute("data-header-cell-field-value") || d.getAttribute("data-field");
      h && i.set(h, d);
    });
    const n = Array.from(t.children).map((d) => d.getAttribute("data-header-cell-field-value") || d.getAttribute("data-field")).filter(Boolean), r = e.map((d) => d.field);
    if (!(n.length === r.length && n.every((d, h) => d === r[h]))) {
      const d = [];
      for (const h of e) {
        let p = i.get(h.field);
        p || (p = f("th", {
          "data-field": h.field,
          "data-synth": "true"
        }, [f("div", { class: "sg-header-content" }, [
          f("span", { class: "sg-header-label" }, h.headerName || h.field || "")
        ])])), d.push(p);
      }
      t.replaceChildren(...d);
    }
    let o = this._table.querySelector("colgroup");
    o || (o = f("colgroup"), this._table.insertBefore(o, this._thead));
    const c = Array.from(o.children);
    for (e.forEach((d, h) => {
      let p = c[h];
      p || (p = f("col"), o.appendChild(p)), p.style.width = d.width ? d.width + "px" : "";
    }); o.children.length > e.length; ) o.lastElementChild.remove();
    const u = this._pinOffsets();
    for (const d of e) {
      const h = t.querySelector(`th[data-header-cell-field-value="${S(d.field)}"]`) || t.querySelector(`th[data-field="${S(d.field)}"]`);
      if (!h) continue;
      const p = this.state.sortModel.find((C) => C.colId === d.field);
      I(h, {
        "data-sortable": d.sortable ? "true" : null,
        "data-filterable": d.filter ? "true" : null,
        "data-filter-active": this.state.filterModel[d.field] ? "true" : null,
        "data-sort": p?.sort || null,
        "data-pinned": d.pinned || null
      }), d.width && (h.style.width = d.width + "px"), h.style.left = d.pinned === "left" ? u.left[d.field] + "px" : "", h.style.right = d.pinned === "right" ? u.right[d.field] + "px" : "", this._ensureHeaderChrome(h, d, p);
    }
  }
  _ensureHeaderChrome(e, t, i) {
    if (t._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let o = e.querySelector('input[type="checkbox"]');
      o || (o = f("input", { type: "checkbox", "aria-label": "Select all" }), o.addEventListener("change", (d) => {
        d.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(o));
      const c = this._displayList.filteredSorted.length, u = this.state.selection.size;
      o.checked = u > 0 && u >= c, o.indeterminate = u > 0 && u < c;
      return;
    }
    let n = e.querySelector(".sg-header-content");
    if (!n) {
      const o = e.textContent.trim();
      e.textContent = "", n = f("div", { class: "sg-header-content" }, [
        f("span", { class: "sg-header-label" }, o || t.headerName || t.field || "")
      ]), e.appendChild(n);
    }
    let r = n.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (r || (r = f("span", { class: "sg-sort-icon" }), n.appendChild(r)), i && this.state.sortModel.length > 1) {
        let o = n.querySelector(".sg-sort-index");
        o || (o = f("span", { class: "sg-sort-index" }), n.appendChild(o)), o.textContent = String(this.state.sortModel.indexOf(i) + 1);
      } else
        n.querySelector(".sg-sort-index")?.remove();
    else r && r.remove();
    let a = n.querySelector(".sg-filter-icon");
    t.filter ? a || (a = f("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), n.appendChild(a)) : a && a.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(f("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._displayList.pageRows;
    this._selKeys = this._computeCellSelKeys();
    const i = this.virtualValue || t.length > 200;
    let n = t, r = 0;
    if (i) {
      const c = this._viewport?.clientHeight || 400, u = this.state.rowHeight, d = Z(this.state.scrollTop, c, u, t.length, 8);
      r = d.first, n = t.slice(d.first, d.last);
    }
    const a = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((c) => {
      const u = c.dataset.rowId;
      u != null && a.set(u, c);
    });
    const o = document.createDocumentFragment();
    if (i) {
      const c = this.state.rowHeight, u = r * c, d = (t.length - r - n.length) * c;
      o.appendChild(this._spacerRow(u, e.length));
      for (const h of n)
        o.appendChild(this._buildRow(h, e, a));
      o.appendChild(this._spacerRow(d, e.length));
    } else
      for (const c of n)
        o.appendChild(this._buildRow(c, e, a));
    this._tbody.replaceChildren(o);
  }
  _buildRow(e, t, i) {
    const n = String(this._rowId(e));
    let r = i.get(n);
    r || (r = f("tr")), r.dataset.rowId = n, r.classList.remove("sg-spacer");
    const a = this.state.selection.has(this._rowId(e));
    return I(r, { "data-selected": a ? "true" : null }), this._renderRow(r, e, t), r;
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const n = f("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return n.style.height = "0px", n.appendChild(f("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), n;
    }
    const i = f("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return i.style.height = e + "px", i.appendChild(f("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), i;
  }
  _renderRow(e, t, i) {
    e.innerHTML = "";
    const n = this._pinOffsets(), r = this._selKeys || { active: null, range: null }, a = String(this._rowId(t));
    for (const o of i) {
      const c = `${a}:${o.field}`, u = f("td", {
        "data-col-id": o.field,
        "data-pinned": o.pinned || null,
        "data-cell-active": r.active === c ? "true" : null,
        "data-cell-range": r.range && r.range.has(c) ? "true" : null
      });
      if (o.pinned === "left" ? u.style.left = n.left[o.field] + "px" : o.pinned === "right" && (u.style.right = n.right[o.field] + "px"), o._isCheckbox) {
        u.classList.add("sg-checkbox-cell");
        const h = f("input", { type: "checkbox" });
        h.checked = this.state.selection.has(this._rowId(t)), u.appendChild(h), e.appendChild(u);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === o.field) {
        u.setAttribute("data-editing", "true");
        const { node: h, control: p } = this._buildEditor(o, y(t, o));
        u.appendChild(h), queueMicrotask(() => {
          p?.focus(), p?.select?.();
        });
      } else
        this._renderCellContent(u, t, o);
      e.appendChild(u);
    }
  }
  _renderCellContent(e, t, i) {
    if (i.cellRenderer) {
      const n = L(i.cellRenderer);
      if (n) {
        const r = y(t, i), a = b(t, i);
        (n.dataset.bind || n.dataset.bindText !== void 0) && (n.textContent = n.dataset.bind ? String(t[n.dataset.bind] ?? "") : a), n.dataset.bindAttr && n.setAttribute(n.dataset.bindAttr, r), n.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((o) => {
          o.dataset.bindText !== void 0 ? o.textContent = a : o.dataset.bind && (o.textContent = String(t[o.dataset.bind] ?? "")), o.dataset.bindAttr && o.setAttribute(o.dataset.bindAttr, r);
        }), e.appendChild(n);
        return;
      }
    }
    e.textContent = b(t, i);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, t) {
    if (e.cellEditor) {
      const n = L(e.cellEditor);
      if (n) {
        const r = n.matches?.("input,select,textarea") ? n : n.querySelector?.("[data-editor-input]") || n.querySelector?.("input,select,textarea");
        return r && (this._seedEditorValue(r, e, t), r.addEventListener("keydown", this._onEditorKey), r.addEventListener("blur", this._onEditorBlur)), { node: n, control: r };
      }
    }
    const i = this._buildEditorInput(e, t);
    return { node: i, control: i };
  }
  _seedEditorValue(e, t, i) {
    if (t.type === "date" && i) {
      const n = i instanceof Date ? i : new Date(i);
      e.value = Number.isNaN(n?.getTime?.()) ? i ?? "" : n.toISOString().slice(0, 10);
    } else t.type === "boolean" ? e.value = i === !0 ? "true" : i === !1 ? "false" : "" : e.value = i ?? "";
  }
  _buildEditorInput(e, t) {
    let i;
    if (e.type === "number") i = f("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const n = t instanceof Date ? t : t ? new Date(t) : null, r = n ? n.toISOString().slice(0, 10) : "";
      i = f("input", { type: "date", value: r });
    } else e.type === "boolean" ? (i = f("select"), i.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : i = f("input", { type: "text", value: t ?? "" });
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
    if (!t || e.target.closest('td[data-editing="true"]')) return;
    const i = this._coerceRowId(t.dataset.rowId), n = e.target.closest("td");
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(i, "toggle");
      return;
    }
    if (n) {
      const r = this.state.rowData.find((o) => this._rowId(o) === i), a = n.dataset.colId;
      g(this.element, "grid:cellClicked", { rowId: i, colId: a, value: r?.[a], event: e });
    }
    if (this.suppressRowClickSelectionValue || this.rowSelectionValue === "") {
      this._cellDragMoved = !1;
      return;
    }
    if (this.cellSelectionValue) {
      if (e.metaKey || e.ctrlKey) {
        this.toggleRowSelection(i, e.shiftKey ? "range" : "toggle"), this._cellDragMoved = !1, g(this.element, "grid:rowClicked", { rowId: i, row: this.state.rowData.find((r) => this._rowId(r) === i), event: e });
        return;
      }
      if (this._cellDragMoved) {
        this._cellDragMoved = !1;
        return;
      }
      !e.shiftKey && this.state.selection.size && this.deselectAll();
    } else {
      if (this._cellDragMoved) {
        this._cellDragMoved = !1;
        return;
      }
      const r = e.shiftKey ? "range" : e.metaKey || e.ctrlKey || this.rowMultiSelectWithClickValue ? "toggle" : "replace";
      this.toggleRowSelection(i, r);
    }
    g(this.element, "grid:rowClicked", { rowId: i, row: this.state.rowData.find((r) => this._rowId(r) === i), event: e });
  }
  // ----- Cell selection (click = active cell, drag / shift+click = range) -----
  _cellAt(e) {
    const t = e.closest?.("td"), i = e.closest?.("tr");
    return !t || !i || t.classList.contains("sg-checkbox-cell") || !t.dataset.colId || t.dataset.editing === "true" ? null : { rowId: this._coerceRowId(i.dataset.rowId), colId: t.dataset.colId };
  }
  // Toggle the active/range data-attrs on the existing cell DOM without
  // rebuilding the tbody (so in-flight mouse interactions aren't disrupted).
  _applyCellSelHighlight() {
    const e = this._computeCellSelKeys();
    this._selKeys = e, this._tbody && this._tbody.querySelectorAll("td[data-col-id]").forEach((t) => {
      const i = t.parentElement, n = `${i && i.dataset.rowId}:${t.dataset.colId}`;
      e.active === n ? t.setAttribute("data-cell-active", "true") : t.removeAttribute("data-cell-active"), e.range && e.range.has(n) ? t.setAttribute("data-cell-range", "true") : t.removeAttribute("data-cell-range");
    });
  }
  // Rectangle of the selection in display indices, or null.
  _cellSelRect() {
    const e = this.state.cellSel;
    if (!e?.anchor) return null;
    const t = this._displayList.pageRows, i = this._visibleCols(), n = (d) => t.findIndex((h) => this._rowId(h) === d), r = (d) => i.findIndex((h) => h.field === d), a = n(e.anchor.rowId), o = r(e.anchor.colId);
    if (a < 0 || o < 0) return null;
    const c = e.focus ? n(e.focus.rowId) : a, u = e.focus ? r(e.focus.colId) : o;
    return {
      r0: Math.min(a, c < 0 ? a : c),
      r1: Math.max(a, c < 0 ? a : c),
      c0: Math.min(o, u < 0 ? o : u),
      c1: Math.max(o, u < 0 ? o : u),
      rows: t,
      cols: i
    };
  }
  _cellRangeRows(e = this._cellSelRect()) {
    if (!e) return [];
    const t = [];
    for (let i = e.r0; i <= e.r1; i++) {
      const n = e.rows[i];
      if (!n) continue;
      const r = [];
      for (let a = e.c0; a <= e.c1; a++) {
        const o = e.cols[a];
        o && r.push(b(n, o));
      }
      t.push(r);
    }
    return t;
  }
  // Lookup used by the renderer to flag active + in-range cells.
  _computeCellSelKeys() {
    const e = this._cellSelRect(), t = this.state.cellSel;
    if (!e || !t?.anchor) return { active: null, range: null };
    const i = `${t.anchor.rowId}:${t.anchor.colId}`, n = /* @__PURE__ */ new Set();
    for (let r = e.r0; r <= e.r1; r++) {
      const a = e.rows[r];
      if (a)
        for (let o = e.c0; o <= e.c1; o++) {
          const c = e.cols[o];
          if (!c) continue;
          const u = `${this._rowId(a)}:${c.field}`;
          u !== i && n.add(u);
        }
    }
    return { active: i, range: n };
  }
  getCellSelectionDetail() {
    const e = this._cellSelRect();
    return {
      anchor: this.state.cellSel.anchor,
      focus: this.state.cellSel.focus,
      rowCount: e ? e.r1 - e.r0 + 1 : 0,
      colCount: e ? e.c1 - e.c0 + 1 : 0
    };
  }
  // Row ids covered by the current cell selection rectangle.
  getCellSelectionRowIds() {
    const e = this._cellSelRect();
    if (!e) return [];
    const t = [];
    for (let i = e.r0; i <= e.r1; i++) {
      const n = e.rows[i];
      n && t.push(this._rowId(n));
    }
    return t;
  }
  _onBodyDblClick(e) {
    const t = e.target.closest("tr"), i = e.target.closest("td");
    if (!t || !i || i.dataset.editing === "true") return;
    const n = this._coerceRowId(t.dataset.rowId), r = i.dataset.colId;
    this.startEditingCell(n, r);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const i = this._visibleCols().filter((h) => h.editable && !h._isCheckbox), n = this._displayList.pageRows, r = n.findIndex((h) => this._rowId(h) === t.rowId), a = i.findIndex((h) => h.field === t.colId);
    if (!i.length || !n.length || r < 0 || a < 0) {
      this.stopEditing(!1);
      return;
    }
    const o = n.length * i.length, c = (r * i.length + a + e + o) % o, u = n[Math.floor(c / i.length)], d = i[c % i.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(u), d.field), requestAnimationFrame(() => {
      this._navigatingEditor = !1;
    });
  }
  // Wire editor listeners whenever a cell mounts an input.
  // Done lazily via MutationObserver on tbody (cheap because tbody is small per page).
  // ----- Helpers -----
  _visibleCols() {
    return this.state.columnDefs.filter((e) => !e.hidden);
  }
  _pinOffsets() {
    const e = this._visibleCols(), t = {};
    let i = 0;
    for (const r of e)
      r.pinned === "left" && (t[r.field] = i, i += r.width || 150);
    const n = {};
    i = 0;
    for (let r = e.length - 1; r >= 0; r--) {
      const a = e[r];
      a.pinned === "right" && (n[a.field] = i, i += a.width || 150);
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
m(D, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: k },
  rowHeight: { type: Number, default: te },
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
  cellSelection: { type: Boolean, default: !0 }
  // click=cell; modifier/checkbox=row
});
function ie(s, l) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox"];
  for (const t of e) if (s[t] !== l[t]) return !1;
  return !0;
}
function se(s) {
  return s === "number" || s === "date" ? [
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "lessThan", label: "Less than" },
    { value: "greaterThan", label: "Greater than" },
    { value: "inRange", label: "In range" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" }
  ] : s === "boolean" ? [
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
function ne(s, l) {
  if (l === "number") {
    const e = Number(s);
    return Number.isFinite(e) ? e : s;
  }
  return l === "date" ? s : l === "boolean" ? s === "true" ? !0 : s === "false" ? !1 : null : s;
}
function S(s) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(s)) : String(s).replace(/["\\\n\r]/g, (l) => "\\" + l);
}
class x extends v {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    m(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, i = e.clientY;
      let n = !1;
      const r = (o) => {
        const c = Math.abs(o.clientX - t), u = Math.abs(o.clientY - i);
        !n && (c > 5 || u > 5) && (n = !0, document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", a), this._beginReorder(t));
      }, a = (o) => {
        document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", a), n || this.sort(o);
      };
      document.addEventListener("mousemove", r), document.addEventListener("mouseup", a);
    });
  }
  connect() {
    if (this.grid = ee(this.element, "grid", this.application), !!this.grid) {
      if (!this.headerNameValue) {
        const e = this.element.textContent.trim();
        e && (this.headerNameValue = e);
      }
      this.grid.registerColumn(this.toColumnDef(), this.element), this.checkboxValue || this.element.addEventListener("mousedown", this._onMouseDown);
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
      _isCheckbox: this.checkboxValue
    };
  }
  _beginReorder(e) {
    if (!this.grid) return;
    const t = this.element.parentElement, i = Array.from(t.children), n = i.indexOf(this.element);
    let r = n;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const a = (c) => {
      const u = c.clientX;
      let d = i.length;
      for (let h = 0; h < i.length; h++) {
        const p = i[h].getBoundingClientRect();
        if (u < p.left + p.width / 2) {
          d = h;
          break;
        }
      }
      r = d > n ? d - 1 : d;
    }, o = () => {
      document.removeEventListener("mousemove", a), document.removeEventListener("mouseup", o), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", r !== n && this.grid.moveColumn(this.fieldValue, r);
    };
    document.addEventListener("mousemove", a), document.addEventListener("mouseup", o);
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
    const t = e.clientX, i = this.element.offsetWidth, n = (a) => this.grid.setColumnWidth(this.fieldValue, i + (a.clientX - t)), r = () => {
      document.removeEventListener("mousemove", n), document.removeEventListener("mouseup", r), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", n), document.addEventListener("mouseup", r), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
m(x, "values", {
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
  checkbox: { type: Boolean, default: !1 }
});
class F extends v {
  connect() {
  }
}
class N extends v {
  connect() {
  }
}
class V extends v {
  connect() {
  }
}
class E extends v {
  constructor() {
    super(...arguments);
    m(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), i = e.paginationGetTotalPages(), n = e.paginationGetRowCount(), r = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const a = n === 0 ? 0 : t * r + 1, o = Math.min(n, a + r - 1);
        this.pageInfoTarget.textContent = n === 0 ? "0 rows" : `${a}–${o} of ${n}`;
      }
      this.hasFirstTarget && (this.firstTarget.disabled = t === 0), this.hasPrevTarget && (this.prevTarget.disabled = t === 0), this.hasNextTarget && (this.nextTarget.disabled = t >= i - 1), this.hasLastTarget && (this.lastTarget.disabled = t >= i - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(r));
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
m(E, "outlets", ["grid"]), m(E, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
function le(s) {
  const l = s ?? B.start();
  return l.register("grid", D), l.register("header-cell", x), l.register("row", F), l.register("cell", N), l.register("filter", V), l.register("pagination", E), l;
}
const re = {
  start: le,
  GridController: D,
  HeaderCellController: x,
  RowController: F,
  CellController: N,
  FilterController: V,
  PaginationController: E
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = re);
export {
  N as CellController,
  V as FilterController,
  D as GridController,
  x as HeaderCellController,
  E as PaginationController,
  F as RowController,
  re as default,
  le as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
