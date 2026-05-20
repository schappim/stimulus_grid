var q = Object.defineProperty;
var z = (i, r, e) => r in i ? q(i, r, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[r] = e;
var w = (i, r, e) => z(i, typeof r != "symbol" ? r + "" : r, e);
import { Controller as _, Application as B } from "@hotwired/stimulus";
function y(i, r) {
  return typeof r.valueGetter == "function" ? r.valueGetter(i) : i?.[r.field];
}
function v(i, r) {
  const e = y(i, r);
  return typeof r.valueFormatter == "function" ? r.valueFormatter(e, i) : e == null ? "" : r.type === "date" && e instanceof Date ? e.toLocaleDateString() : r.type === "boolean" ? e ? "✓" : "" : String(e);
}
const P = {
  contains: (i, r) => String(i ?? "").toLowerCase().includes(String(r ?? "").toLowerCase()),
  notContains: (i, r) => !String(i ?? "").toLowerCase().includes(String(r ?? "").toLowerCase()),
  equals: (i, r) => String(i ?? "").toLowerCase() === String(r ?? "").toLowerCase(),
  notEqual: (i, r) => String(i ?? "").toLowerCase() !== String(r ?? "").toLowerCase(),
  startsWith: (i, r) => String(i ?? "").toLowerCase().startsWith(String(r ?? "").toLowerCase()),
  endsWith: (i, r) => String(i ?? "").toLowerCase().endsWith(String(r ?? "").toLowerCase()),
  blank: (i) => i == null || i === "",
  notBlank: (i) => i != null && i !== ""
}, W = {
  equals: (i, r) => Number(i) === Number(r),
  notEqual: (i, r) => Number(i) !== Number(r),
  lessThan: (i, r) => Number(i) < Number(r),
  lessThanOrEqual: (i, r) => Number(i) <= Number(r),
  greaterThan: (i, r) => Number(i) > Number(r),
  greaterThanOrEqual: (i, r) => Number(i) >= Number(r),
  inRange: (i, r, e) => Number(i) >= Number(r) && Number(i) <= Number(e),
  blank: (i) => i == null || i === "",
  notBlank: (i) => i != null && i !== ""
};
function m(i) {
  if (i == null || i === "") return null;
  if (i instanceof Date) return i;
  const r = new Date(i);
  return Number.isNaN(r.valueOf()) ? null : r;
}
const G = {
  equals: (i, r) => m(i)?.toDateString() === m(r)?.toDateString(),
  notEqual: (i, r) => m(i)?.toDateString() !== m(r)?.toDateString(),
  lessThan: (i, r) => (m(i)?.valueOf() ?? -1 / 0) < (m(r)?.valueOf() ?? 1 / 0),
  greaterThan: (i, r) => (m(i)?.valueOf() ?? 1 / 0) > (m(r)?.valueOf() ?? -1 / 0),
  inRange: (i, r, e) => {
    const t = m(i)?.valueOf();
    return t != null && t >= (m(r)?.valueOf() ?? -1 / 0) && t <= (m(e)?.valueOf() ?? 1 / 0);
  },
  blank: (i) => i == null || i === "",
  notBlank: (i) => i != null && i !== ""
}, H = {
  equals: (i, r) => r === "true" ? !!i : r === "false" ? !i : !0
}, j = {
  in: (i, r) => Array.isArray(r) && r.includes(String(i ?? ""))
}, U = { text: P, number: W, date: G, boolean: H, set: j };
function X(i, r, e) {
  if (!e) return !0;
  const t = e.filterType || r.filter || "text", n = (U[t] || P)[e.type];
  if (!n) return !0;
  const l = y(i, r);
  return n(l, e.value, e.value2);
}
function T(i, r, e) {
  const t = Object.entries(r || {}).filter(([, s]) => s != null);
  return t.length === 0 ? i : i.filter((s) => t.every(([n, l]) => {
    const o = e[n];
    return o ? X(s, o, l) : !0;
  }));
}
function I(i, r, e) {
  if (!r) return i;
  const t = String(r).toLowerCase();
  return i.filter((s) => {
    for (const n of e) {
      const l = v(s, n);
      if (l && String(l).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function $(i, r, e) {
  if (i == null && r == null) return 0;
  if (i == null) return -1;
  if (r == null) return 1;
  if (e === "number") return Number(i) - Number(r);
  if (e === "date") {
    const t = m(i)?.valueOf() ?? 0, s = m(r)?.valueOf() ?? 0;
    return t - s;
  }
  return e === "boolean" ? i === r ? 0 : i ? 1 : -1 : String(i).localeCompare(String(r), void 0, { numeric: !0, sensitivity: "base" });
}
function K(i, r, e) {
  if (!r || r.length === 0) return i;
  const t = i.slice();
  return t.sort((s, n) => {
    for (const { colId: l, sort: o } of r) {
      const a = e[l];
      if (!a) continue;
      const u = y(s, a), f = y(n, a), d = typeof a.comparator == "function" ? a.comparator(u, f, s, n) : $(u, f, a.type);
      if (d !== 0) return o === "desc" ? -d : d;
    }
    return 0;
  }), t;
}
function Q(i, r) {
  if (!r || !r.enabled) return { rows: i, total: i.length, pageRows: i };
  const e = i.length, t = Math.max(1, Math.ceil(e / r.pageSize)), s = Math.min(r.page, t - 1), n = s * r.pageSize, l = i.slice(n, n + r.pageSize);
  return { rows: i, total: e, totalPages: t, page: s, pageRows: l };
}
function Y(i) {
  if (i.serverSide) {
    const n = i.rowData, l = i.pagination?.pageSize || n.length || 1, o = i.serverRowCount ?? n.length, a = Math.max(1, Math.ceil(o / l)), u = Math.min(i.pagination?.page || 0, a - 1);
    return { filteredSorted: n, rows: n, total: o, totalPages: a, page: u, pageRows: n };
  }
  const r = Object.fromEntries(i.columnDefs.map((n) => [n.field, n])), e = i.columnDefs.filter((n) => !n.hidden && !n._isCheckbox);
  let t = i.rowData;
  t = T(t, i.filterModel, r), t = I(t, i.quickFilter, e), t = K(t, i.sortModel, r);
  const s = Q(t, i.pagination);
  return { filteredSorted: t, ...s };
}
function Z(i, r, e, t, s = 6) {
  const n = Math.ceil(r / e), l = Math.max(0, Math.floor(i / e) - s), o = Math.min(t, l + n + s * 2);
  return { first: l, last: o };
}
function J(i) {
  return {
    // ---- Data ----
    setRowData(r) {
      i.setRowData(r);
    },
    getRowData() {
      return i.state.rowData.slice();
    },
    applyTransaction(r) {
      return i.applyTransaction(r);
    },
    // Server-side row model
    setRowCount(r) {
      i.setRowCount(r);
    },
    getRowCount() {
      return i.state.serverSide ? i.state.serverRowCount : i.state.rowData.length;
    },
    isServerSide() {
      return !!i.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(r) {
      i.setColumnDefs(r);
    },
    getColumnDefs() {
      return i.state.columnDefs.slice();
    },
    setColumnVisible(r, e) {
      i.setColumnVisible(r, e);
    },
    setColumnPinned(r, e) {
      i.setColumnPinned(r, e);
    },
    setColumnWidth(r, e) {
      i.setColumnWidth(r, e);
    },
    moveColumn(r, e) {
      i.moveColumn(r, e);
    },
    autoSizeColumn(r) {
      i.autoSizeColumn(r);
    },
    autoSizeAllColumns() {
      i.state.columnDefs.forEach((r) => i.autoSizeColumn(r.field));
    },
    sizeColumnsToFit() {
      i.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(r) {
      i.setSortModel(r);
    },
    getSortModel() {
      return i.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(r) {
      i.setFilterModel(r);
    },
    getFilterModel() {
      return { ...i.state.filterModel };
    },
    setColumnFilter(r, e) {
      i.setColumnFilter(r, e);
    },
    destroyFilter(r) {
      i.setColumnFilter(r, null);
    },
    setQuickFilter(r) {
      i.setQuickFilter(r);
    },
    getQuickFilter() {
      return i.getQuickFilter();
    },
    // ---- Selection ----
    selectAll() {
      i.selectAll();
    },
    deselectAll() {
      i.deselectAll();
    },
    selectRow(r) {
      i.setSelected(r, !0);
    },
    deselectRow(r) {
      i.setSelected(r, !1);
    },
    getSelectedRows() {
      return i.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(i.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(r) {
      i.goToPage(r);
    },
    paginationGoToFirstPage() {
      i.goToPage(0);
    },
    paginationGoToNextPage() {
      i.goToPage(i.state.pagination.page + 1);
    },
    paginationGoToPreviousPage() {
      i.goToPage(i.state.pagination.page - 1);
    },
    paginationGoToLastPage() {
      i.goToPage(i.lastPageIndex());
    },
    paginationSetPageSize(r) {
      i.setPageSize(r);
    },
    paginationGetCurrentPage() {
      return i.state.pagination.page;
    },
    paginationGetTotalPages() {
      return i.totalPages();
    },
    paginationGetRowCount() {
      return i.filteredCount();
    },
    paginationGetPageSize() {
      return i.state.pagination.pageSize;
    },
    paginationIsEnabled() {
      return i.state.pagination.enabled;
    },
    // ---- Editing ----
    startEditingCell({ rowId: r, colId: e }) {
      i.startEditingCell(r, e);
    },
    stopEditing(r = !1) {
      i.stopEditing(r);
    },
    // ---- Export ----
    getDataAsCsv(r = {}) {
      return i.getDataAsCsv(r);
    },
    exportDataAsCsv(r = {}) {
      return i.exportDataAsCsv(r);
    },
    // ---- Display ----
    refreshCells(r = {}) {
      i.refresh(r);
    },
    redrawRows(r = {}) {
      i.refresh(r);
    },
    // ---- Events ----
    addEventListener(r, e) {
      i.element.addEventListener(r, e);
    },
    removeEventListener(r, e) {
      i.element.removeEventListener(r, e);
    }
  };
}
function c(i, r = {}, e = []) {
  const t = document.createElement(i);
  for (const [s, n] of Object.entries(r))
    n === !1 || n == null || (s === "class" ? t.className = n : s === "style" && typeof n == "object" ? Object.assign(t.style, n) : s.startsWith("on") && typeof n == "function" ? t.addEventListener(s.slice(2).toLowerCase(), n) : n === !0 ? t.setAttribute(s, "") : t.setAttribute(s, String(n)));
  for (const s of [].concat(e))
    s == null || s === !1 || t.appendChild(typeof s == "string" ? document.createTextNode(s) : s);
  return t;
}
function M(i, r) {
  for (const [e, t] of Object.entries(r))
    t == null || t === !1 ? i.removeAttribute(e) : t === !0 ? i.setAttribute(e, "") : i.setAttribute(e, String(t));
}
function k(i) {
  const r = document.getElementById(i);
  return !r || r.tagName !== "TEMPLATE" ? null : r.content.firstElementChild.cloneNode(!0);
}
function g(i, r, e) {
  i.dispatchEvent(new CustomEvent(r, { detail: e, bubbles: !0 }));
}
function ee(i, r, e) {
  let t = i.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(r)) {
      const n = e.getControllerForElementAndIdentifier(t, r);
      if (n) return n;
    }
    t = t.parentElement;
  }
  return null;
}
const te = 32, A = 100;
class x extends _ {
  constructor() {
    super(...arguments);
    w(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    w(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
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
      editing: null,
      pagination: { enabled: !1, page: 0, pageSize: A },
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
    this.element.gridApi = null;
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, s) => {
      const n = {}, l = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      return n[this.getRowIdValue] = l != null ? this._coerceRowId(l) : s + 1, t.querySelectorAll("td").forEach((o) => {
        const a = o.getAttribute("data-cell-col-id-value") || o.getAttribute("data-col-id");
        a && (n[a] = o.textContent.trim());
      }), n;
    }), e.innerHTML = ""), this._initialHead = this.element.querySelector("thead");
  }
  _buildChrome() {
    let e = this.element.querySelector("table");
    if (!e) {
      e = c("table");
      const s = c("thead");
      e.appendChild(s), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = c("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const s = c("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(s, e), s.appendChild(e), this._viewport = s;
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
    const s = this.state.filterModel[e.field] || {}, n = se(e.filter), l = c("div", { class: "sg-filter-popover" }), o = c("select");
    n.forEach((b) => o.append(new Option(b.label, b.value, !1, b.value === s.type)));
    const a = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", u = c("input", { type: a, value: s.value ?? "" }), f = c("input", { type: a, value: s.value2 ?? "", style: { display: "none" } }), d = () => {
      const b = o.value, R = b === "inRange", O = !(b === "blank" || b === "notBlank");
      u.style.display = O ? "" : "none", f.style.display = R ? "" : "none";
    };
    o.addEventListener("change", d), d();
    const h = c("div", { class: "sg-filter-actions" }), p = c("button", { type: "button" }, "Clear"), C = c("button", { type: "button", class: "primary" }, "Apply");
    h.append(p, C), p.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), C.addEventListener("click", () => {
      const b = o.value, R = b === "blank" || b === "notBlank" ? { filterType: e.filter, type: b } : { filterType: e.filter, type: b, value: u.value, value2: f.value || void 0 };
      this.setColumnFilter(e.field, R), this._closeFilterPopover();
    }), l.append(
      c("label", {}, "Condition"),
      o,
      u,
      f,
      h
    ), document.body.appendChild(l);
    const L = t.getBoundingClientRect();
    l.style.left = `${L.left + window.scrollX}px`, l.style.top = `${L.bottom + window.scrollY + 2}px`, this._filterPopover = l, document.addEventListener("mousedown", this._onDocMouseDown), u.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const s = this.state.columnDefs.findIndex((o) => o.field === e.field), n = this._runtimeOverrides[e.field] || {}, l = { ...e, ...n, _headerEl: t };
    if (s >= 0) {
      const o = this.state.columnDefs[s];
      if (o._headerEl === t && ie(o, l)) return;
      this.state.columnDefs[s] = l;
    } else
      this.state.columnDefs.push(l);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns");
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const s = this.state.sortModel.findIndex((l) => l.colId === e);
    let n;
    s === -1 ? n = { colId: e, sort: "asc" } : this.state.sortModel[s].sort === "asc" ? n = { colId: e, sort: "desc" } : n = null, t ? (s >= 0 && this.state.sortModel.splice(s, 1), n && this.state.sortModel.push(n)) : this.state.sortModel = n ? [n] : [], this.scheduleRender("sort"), g(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
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
    const s = this.state.selection;
    this.rowSelectionValue === "single" ? (s.clear(), s.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? s.has(e) ? s.delete(e) : s.add(e) : (s.clear(), s.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), g(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(s)
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
    const s = this._displayList.filteredSorted, n = s.findIndex((u) => this._rowId(u) === e), l = s.findIndex((u) => this._rowId(u) === t);
    if (n < 0 || l < 0) return;
    const [o, a] = n <= l ? [n, l] : [l, n];
    for (let u = o; u <= a; u++) this.state.selection.add(this._rowId(s[u]));
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
    let s = T(this.state.rowData, this.state.filterModel, e);
    return s = I(s, this.state.quickFilter, t), s.length;
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
    const s = this.state.columnDefs.find((l) => l.field === t);
    if (!s || !s.editable) return;
    const n = this.state.rowData.find((l) => this._rowId(l) === e);
    n && (this.state.editing = { rowId: e, colId: t, originalValue: y(n, s) }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: s, originalValue: n, draftValue: l } = this.state.editing, o = this._tbody.querySelector(`tr[data-row-id="${S(t)}"] td[data-col-id="${S(s)}"]`);
    let a = n;
    if (!e && o) {
      const u = o.querySelector("[data-editor-input]") || o.querySelector("input,select,textarea");
      u ? a = ne(u.value, this._colByField(s)?.type) : l !== void 0 && (a = l);
    }
    if (this.state.editing = null, !e && a !== n) {
      const u = this.state.rowData.find((d) => this._rowId(d) === t), f = u[s];
      u[s] = a, g(this.element, "grid:cellValueChanged", { rowId: t, colId: s, oldValue: f, newValue: a });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const s = this._colByField(e);
    s && (s.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), g(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const n = t || null;
    s.pinned = n, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: n }, this._reorderForPinning(), this.scheduleRender("columns"), g(this.element, "grid:columnPinned", { colId: e, pinned: n });
  }
  setColumnWidth(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const n = Math.max(s.minWidth || 40, Math.min(s.maxWidth || 4e3, t));
    s.width = n, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: n }, this.scheduleRender("columns"), g(this.element, "grid:columnResized", { colId: e, width: n });
  }
  moveColumn(e, t) {
    const s = this.state.columnDefs.findIndex((l) => l.field === e);
    if (s < 0 || s === t) return;
    const [n] = this.state.columnDefs.splice(s, 1);
    this.state.columnDefs.splice(t, 0, n), this.scheduleRender("columns"), g(this.element, "grid:columnMoved", { colId: e, fromIndex: s, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const s = (t.headerName || t.field || "").length, n = this.state.rowData.slice(0, 200);
    let l = s;
    for (const o of n) {
      const a = String(v(o, t) ?? "").length;
      a > l && (l = a);
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, l * 8 + 24)));
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), s = t.reduce((l, o) => l + (o.width || 150), 0);
    if (s === 0) return;
    const n = e / s;
    t.forEach((l) => {
      l.width = Math.max(l.minWidth || 40, Math.floor((l.width || 150) * n));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((n) => n.pinned === "left"), t = this.state.columnDefs.filter((n) => n.pinned === "right"), s = this.state.columnDefs.filter((n) => !n.pinned);
    this.state.columnDefs = [...e, ...s, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), g(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], s = [], n = [], l = new Map(this.state.rowData.map((o) => [this._rowId(o), o]));
    return (e.remove || []).forEach((o) => {
      const a = this._rowId(o);
      l.delete(a) && n.push(o);
    }), (e.update || []).forEach((o) => {
      const a = this._rowId(o);
      l.has(a) && (l.set(a, { ...l.get(a), ...o }), s.push(o));
    }), (e.add || []).forEach((o) => {
      const a = this._rowId(o);
      l.has(a) || (l.set(a, o), t.push(o));
    }), this.state.rowData = Array.from(l.values()), this.scheduleRender("data"), g(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: s, removed: n };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const s = this._visibleCols().filter((a) => !a._isCheckbox), n = t ? this.getSelectedRows() : this._displayList.filteredSorted, l = (a) => /[",\n\r]/.test(a) ? `"${String(a).replace(/"/g, '""')}"` : String(a), o = [s.map((a) => l(a.headerName || a.field)).join(e)];
    for (const a of n)
      o.push(s.map((u) => l(v(a, u))).join(e));
    return o.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const s = this.getDataAsCsv(t), n = new Blob([s], { type: "text/csv;charset=utf-8" }), l = URL.createObjectURL(n), o = c("a", { href: l, download: e });
    return document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(l), s;
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
      const d = c("tr");
      return this._thead.appendChild(d), d;
    })(), s = /* @__PURE__ */ new Map();
    Array.from(t.querySelectorAll("th")).forEach((d) => {
      const h = d.getAttribute("data-header-cell-field-value") || d.getAttribute("data-field");
      h && s.set(h, d);
    });
    const n = Array.from(t.children).map((d) => d.getAttribute("data-header-cell-field-value") || d.getAttribute("data-field")).filter(Boolean), l = e.map((d) => d.field);
    if (!(n.length === l.length && n.every((d, h) => d === l[h]))) {
      const d = [];
      for (const h of e) {
        let p = s.get(h.field);
        p || (p = c("th", {
          "data-field": h.field,
          "data-synth": "true"
        }, [c("div", { class: "sg-header-content" }, [
          c("span", { class: "sg-header-label" }, h.headerName || h.field || "")
        ])])), d.push(p);
      }
      t.replaceChildren(...d);
    }
    let a = this._table.querySelector("colgroup");
    a || (a = c("colgroup"), this._table.insertBefore(a, this._thead));
    const u = Array.from(a.children);
    for (e.forEach((d, h) => {
      let p = u[h];
      p || (p = c("col"), a.appendChild(p)), p.style.width = d.width ? d.width + "px" : "";
    }); a.children.length > e.length; ) a.lastElementChild.remove();
    const f = this._pinOffsets();
    for (const d of e) {
      const h = t.querySelector(`th[data-header-cell-field-value="${S(d.field)}"]`) || t.querySelector(`th[data-field="${S(d.field)}"]`);
      if (!h) continue;
      const p = this.state.sortModel.find((C) => C.colId === d.field);
      M(h, {
        "data-sortable": d.sortable ? "true" : null,
        "data-filterable": d.filter ? "true" : null,
        "data-filter-active": this.state.filterModel[d.field] ? "true" : null,
        "data-sort": p?.sort || null,
        "data-pinned": d.pinned || null
      }), d.width && (h.style.width = d.width + "px"), h.style.left = d.pinned === "left" ? f.left[d.field] + "px" : "", h.style.right = d.pinned === "right" ? f.right[d.field] + "px" : "", this._ensureHeaderChrome(h, d, p);
    }
  }
  _ensureHeaderChrome(e, t, s) {
    if (t._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let a = e.querySelector('input[type="checkbox"]');
      a || (a = c("input", { type: "checkbox", "aria-label": "Select all" }), a.addEventListener("change", (d) => {
        d.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(a));
      const u = this._displayList.filteredSorted.length, f = this.state.selection.size;
      a.checked = f > 0 && f >= u, a.indeterminate = f > 0 && f < u;
      return;
    }
    let n = e.querySelector(".sg-header-content");
    if (!n) {
      const a = e.textContent.trim();
      e.textContent = "", n = c("div", { class: "sg-header-content" }, [
        c("span", { class: "sg-header-label" }, a || t.headerName || t.field || "")
      ]), e.appendChild(n);
    }
    let l = n.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (l || (l = c("span", { class: "sg-sort-icon" }), n.appendChild(l)), s && this.state.sortModel.length > 1) {
        let a = n.querySelector(".sg-sort-index");
        a || (a = c("span", { class: "sg-sort-index" }), n.appendChild(a)), a.textContent = String(this.state.sortModel.indexOf(s) + 1);
      } else
        n.querySelector(".sg-sort-index")?.remove();
    else l && l.remove();
    let o = n.querySelector(".sg-filter-icon");
    t.filter ? o || (o = c("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), n.appendChild(o)) : o && o.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(c("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._displayList.pageRows, s = this.virtualValue || t.length > 200;
    let n = t, l = 0;
    if (s) {
      const u = this._viewport?.clientHeight || 400, f = this.state.rowHeight, d = Z(this.state.scrollTop, u, f, t.length, 8);
      l = d.first, n = t.slice(d.first, d.last);
    }
    const o = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((u) => {
      const f = u.dataset.rowId;
      f != null && o.set(f, u);
    });
    const a = document.createDocumentFragment();
    if (s) {
      const u = this.state.rowHeight, f = l * u, d = (t.length - l - n.length) * u;
      a.appendChild(this._spacerRow(f, e.length));
      for (const h of n)
        a.appendChild(this._buildRow(h, e, o));
      a.appendChild(this._spacerRow(d, e.length));
    } else
      for (const u of n)
        a.appendChild(this._buildRow(u, e, o));
    this._tbody.replaceChildren(a);
  }
  _buildRow(e, t, s) {
    const n = String(this._rowId(e));
    let l = s.get(n);
    l || (l = c("tr")), l.dataset.rowId = n, l.classList.remove("sg-spacer");
    const o = this.state.selection.has(this._rowId(e));
    return M(l, { "data-selected": o ? "true" : null }), this._renderRow(l, e, t), l;
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const n = c("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return n.style.height = "0px", n.appendChild(c("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), n;
    }
    const s = c("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return s.style.height = e + "px", s.appendChild(c("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), s;
  }
  _renderRow(e, t, s) {
    e.innerHTML = "";
    const n = this._pinOffsets();
    for (const l of s) {
      const o = c("td", {
        "data-col-id": l.field,
        "data-pinned": l.pinned || null
      });
      if (l.pinned === "left" ? o.style.left = n.left[l.field] + "px" : l.pinned === "right" && (o.style.right = n.right[l.field] + "px"), l._isCheckbox) {
        o.classList.add("sg-checkbox-cell");
        const u = c("input", { type: "checkbox" });
        u.checked = this.state.selection.has(this._rowId(t)), o.appendChild(u), e.appendChild(o);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === l.field) {
        o.setAttribute("data-editing", "true");
        const { node: u, control: f } = this._buildEditor(l, y(t, l));
        o.appendChild(u), queueMicrotask(() => {
          f?.focus(), f?.select?.();
        });
      } else
        this._renderCellContent(o, t, l);
      e.appendChild(o);
    }
  }
  _renderCellContent(e, t, s) {
    if (s.cellRenderer) {
      const n = k(s.cellRenderer);
      if (n) {
        const l = y(t, s), o = v(t, s);
        (n.dataset.bind || n.dataset.bindText !== void 0) && (n.textContent = n.dataset.bind ? String(t[n.dataset.bind] ?? "") : o), n.dataset.bindAttr && n.setAttribute(n.dataset.bindAttr, l), n.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((a) => {
          a.dataset.bindText !== void 0 ? a.textContent = o : a.dataset.bind && (a.textContent = String(t[a.dataset.bind] ?? "")), a.dataset.bindAttr && a.setAttribute(a.dataset.bindAttr, l);
        }), e.appendChild(n);
        return;
      }
    }
    e.textContent = v(t, s);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, t) {
    if (e.cellEditor) {
      const n = k(e.cellEditor);
      if (n) {
        const l = n.matches?.("input,select,textarea") ? n : n.querySelector?.("[data-editor-input]") || n.querySelector?.("input,select,textarea");
        return l && (this._seedEditorValue(l, e, t), l.addEventListener("keydown", this._onEditorKey), l.addEventListener("blur", this._onEditorBlur)), { node: n, control: l };
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
    if (e.type === "number") s = c("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const n = t instanceof Date ? t : t ? new Date(t) : null, l = n ? n.toISOString().slice(0, 10) : "";
      s = c("input", { type: "date", value: l });
    } else e.type === "boolean" ? (s = c("select"), s.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : s = c("input", { type: "text", value: t ?? "" });
    return s.addEventListener("keydown", this._onEditorKey), s.addEventListener("blur", this._onEditorBlur), s;
  }
  _renderPagination() {
    this.state.pagination.enabled;
  }
  // ----- Event delegation (clicks on rendered tbody) -----
  // Stimulus actions on tbody — wired in _buildChrome by adding data-action.
  // For simplicity we add native listeners here.
  _attachBodyListeners() {
    this._listenersAttached || (this._listenersAttached = !0, this._tbody.addEventListener("click", (e) => this._onBodyClick(e)), this._tbody.addEventListener("dblclick", (e) => this._onBodyDblClick(e)), this._viewport.addEventListener("scroll", this._onScroll, { passive: !0 }));
  }
  _onBodyClick(e) {
    const t = e.target.closest("tr");
    if (!t || e.target.closest('td[data-editing="true"]')) return;
    const s = this._coerceRowId(t.dataset.rowId), n = e.target.closest("td");
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(s, "toggle");
      return;
    }
    if (n) {
      const o = this.state.rowData.find((u) => this._rowId(u) === s), a = n.dataset.colId;
      g(this.element, "grid:cellClicked", { rowId: s, colId: a, value: o?.[a], event: e });
    }
    if (this.suppressRowClickSelectionValue || this.rowSelectionValue === "") return;
    const l = e.shiftKey ? "range" : e.metaKey || e.ctrlKey || this.rowMultiSelectWithClickValue ? "toggle" : "replace";
    this.toggleRowSelection(s, l), g(this.element, "grid:rowClicked", { rowId: s, row: this.state.rowData.find((o) => this._rowId(o) === s), event: e });
  }
  _onBodyDblClick(e) {
    const t = e.target.closest("tr"), s = e.target.closest("td");
    if (!t || !s || s.dataset.editing === "true") return;
    const n = this._coerceRowId(t.dataset.rowId), l = s.dataset.colId;
    this.startEditingCell(n, l);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const s = this._visibleCols().filter((h) => h.editable && !h._isCheckbox), n = this._displayList.pageRows, l = n.findIndex((h) => this._rowId(h) === t.rowId), o = s.findIndex((h) => h.field === t.colId);
    if (!s.length || !n.length || l < 0 || o < 0) {
      this.stopEditing(!1);
      return;
    }
    const a = n.length * s.length, u = (l * s.length + o + e + a) % a, f = n[Math.floor(u / s.length)], d = s[u % s.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(f), d.field), requestAnimationFrame(() => {
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
    let s = 0;
    for (const l of e)
      l.pinned === "left" && (t[l.field] = s, s += l.width || 150);
    const n = {};
    s = 0;
    for (let l = e.length - 1; l >= 0; l--) {
      const o = e[l];
      o.pinned === "right" && (n[o.field] = s, s += o.width || 150);
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
w(x, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: A },
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
  rowCount: { type: Number, default: 0 }
  // total rows on the server
});
function ie(i, r) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox"];
  for (const t of e) if (i[t] !== r[t]) return !1;
  return !0;
}
function se(i) {
  return i === "number" || i === "date" ? [
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "lessThan", label: "Less than" },
    { value: "greaterThan", label: "Greater than" },
    { value: "inRange", label: "In range" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" }
  ] : i === "boolean" ? [
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
function ne(i, r) {
  if (r === "number") {
    const e = Number(i);
    return Number.isFinite(e) ? e : i;
  }
  return r === "date" ? i : r === "boolean" ? i === "true" ? !0 : i === "false" ? !1 : null : i;
}
function S(i) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(i)) : String(i).replace(/["\\\n\r]/g, (r) => "\\" + r);
}
class D extends _ {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    w(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, s = e.clientY;
      let n = !1;
      const l = (a) => {
        const u = Math.abs(a.clientX - t), f = Math.abs(a.clientY - s);
        !n && (u > 5 || f > 5) && (n = !0, document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", o), this._beginReorder(t));
      }, o = (a) => {
        document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", o), n || this.sort(a);
      };
      document.addEventListener("mousemove", l), document.addEventListener("mouseup", o);
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
    const t = this.element.parentElement, s = Array.from(t.children), n = s.indexOf(this.element);
    let l = n;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const o = (u) => {
      const f = u.clientX;
      let d = s.length;
      for (let h = 0; h < s.length; h++) {
        const p = s[h].getBoundingClientRect();
        if (f < p.left + p.width / 2) {
          d = h;
          break;
        }
      }
      l = d > n ? d - 1 : d;
    }, a = () => {
      document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", l !== n && this.grid.moveColumn(this.fieldValue, l);
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
    const t = e.clientX, s = this.element.offsetWidth, n = (o) => this.grid.setColumnWidth(this.fieldValue, s + (o.clientX - t)), l = () => {
      document.removeEventListener("mousemove", n), document.removeEventListener("mouseup", l), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", n), document.addEventListener("mouseup", l), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
w(D, "values", {
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
class F extends _ {
  connect() {
  }
}
class N extends _ {
  connect() {
  }
}
class V extends _ {
  connect() {
  }
}
class E extends _ {
  constructor() {
    super(...arguments);
    w(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), s = e.paginationGetTotalPages(), n = e.paginationGetRowCount(), l = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const o = n === 0 ? 0 : t * l + 1, a = Math.min(n, o + l - 1);
        this.pageInfoTarget.textContent = n === 0 ? "0 rows" : `${o}–${a} of ${n}`;
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
w(E, "outlets", ["grid"]), w(E, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
function re(i) {
  const r = i ?? B.start();
  return r.register("grid", x), r.register("header-cell", D), r.register("row", F), r.register("cell", N), r.register("filter", V), r.register("pagination", E), r;
}
const le = {
  start: re,
  GridController: x,
  HeaderCellController: D,
  RowController: F,
  CellController: N,
  FilterController: V,
  PaginationController: E
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = le);
export {
  N as CellController,
  V as FilterController,
  x as GridController,
  D as HeaderCellController,
  E as PaginationController,
  F as RowController,
  le as default,
  re as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
