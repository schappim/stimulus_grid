var O = Object.defineProperty;
var q = (i, n, e) => n in i ? O(i, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[n] = e;
var y = (i, n, e) => q(i, typeof n != "symbol" ? n + "" : n, e);
import { Controller as _, Application as z } from "@hotwired/stimulus";
function w(i, n) {
  return typeof n.valueGetter == "function" ? n.valueGetter(i) : i?.[n.field];
}
function v(i, n) {
  const e = w(i, n);
  return typeof n.valueFormatter == "function" ? n.valueFormatter(e, i) : e == null ? "" : n.type === "date" && e instanceof Date ? e.toLocaleDateString() : n.type === "boolean" ? e ? "✓" : "" : String(e);
}
const A = {
  contains: (i, n) => String(i ?? "").toLowerCase().includes(String(n ?? "").toLowerCase()),
  notContains: (i, n) => !String(i ?? "").toLowerCase().includes(String(n ?? "").toLowerCase()),
  equals: (i, n) => String(i ?? "").toLowerCase() === String(n ?? "").toLowerCase(),
  notEqual: (i, n) => String(i ?? "").toLowerCase() !== String(n ?? "").toLowerCase(),
  startsWith: (i, n) => String(i ?? "").toLowerCase().startsWith(String(n ?? "").toLowerCase()),
  endsWith: (i, n) => String(i ?? "").toLowerCase().endsWith(String(n ?? "").toLowerCase()),
  blank: (i) => i == null || i === "",
  notBlank: (i) => i != null && i !== ""
}, B = {
  equals: (i, n) => Number(i) === Number(n),
  notEqual: (i, n) => Number(i) !== Number(n),
  lessThan: (i, n) => Number(i) < Number(n),
  lessThanOrEqual: (i, n) => Number(i) <= Number(n),
  greaterThan: (i, n) => Number(i) > Number(n),
  greaterThanOrEqual: (i, n) => Number(i) >= Number(n),
  inRange: (i, n, e) => Number(i) >= Number(n) && Number(i) <= Number(e),
  blank: (i) => i == null || i === "",
  notBlank: (i) => i != null && i !== ""
};
function m(i) {
  if (i == null || i === "") return null;
  if (i instanceof Date) return i;
  const n = new Date(i);
  return Number.isNaN(n.valueOf()) ? null : n;
}
const W = {
  equals: (i, n) => m(i)?.toDateString() === m(n)?.toDateString(),
  notEqual: (i, n) => m(i)?.toDateString() !== m(n)?.toDateString(),
  lessThan: (i, n) => (m(i)?.valueOf() ?? -1 / 0) < (m(n)?.valueOf() ?? 1 / 0),
  greaterThan: (i, n) => (m(i)?.valueOf() ?? 1 / 0) > (m(n)?.valueOf() ?? -1 / 0),
  inRange: (i, n, e) => {
    const t = m(i)?.valueOf();
    return t != null && t >= (m(n)?.valueOf() ?? -1 / 0) && t <= (m(e)?.valueOf() ?? 1 / 0);
  },
  blank: (i) => i == null || i === "",
  notBlank: (i) => i != null && i !== ""
}, G = {
  equals: (i, n) => n === "true" ? !!i : n === "false" ? !i : !0
}, H = {
  in: (i, n) => Array.isArray(n) && n.includes(String(i ?? ""))
}, j = { text: A, number: B, date: W, boolean: G, set: H };
function U(i, n, e) {
  if (!e) return !0;
  const t = e.filterType || n.filter || "text", l = (j[t] || A)[e.type];
  if (!l) return !0;
  const r = w(i, n);
  return l(r, e.value, e.value2);
}
function P(i, n, e) {
  const t = Object.entries(n || {}).filter(([, s]) => s != null);
  return t.length === 0 ? i : i.filter((s) => t.every(([l, r]) => {
    const o = e[l];
    return o ? U(s, o, r) : !0;
  }));
}
function T(i, n, e) {
  if (!n) return i;
  const t = String(n).toLowerCase();
  return i.filter((s) => {
    for (const l of e) {
      const r = v(s, l);
      if (r && String(r).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function X(i, n, e) {
  if (i == null && n == null) return 0;
  if (i == null) return -1;
  if (n == null) return 1;
  if (e === "number") return Number(i) - Number(n);
  if (e === "date") {
    const t = m(i)?.valueOf() ?? 0, s = m(n)?.valueOf() ?? 0;
    return t - s;
  }
  return e === "boolean" ? i === n ? 0 : i ? 1 : -1 : String(i).localeCompare(String(n), void 0, { numeric: !0, sensitivity: "base" });
}
function $(i, n, e) {
  if (!n || n.length === 0) return i;
  const t = i.slice();
  return t.sort((s, l) => {
    for (const { colId: r, sort: o } of n) {
      const a = e[r];
      if (!a) continue;
      const c = w(s, a), f = w(l, a), d = typeof a.comparator == "function" ? a.comparator(c, f, s, l) : X(c, f, a.type);
      if (d !== 0) return o === "desc" ? -d : d;
    }
    return 0;
  }), t;
}
function K(i, n) {
  if (!n || !n.enabled) return { rows: i, total: i.length, pageRows: i };
  const e = i.length, t = Math.max(1, Math.ceil(e / n.pageSize)), s = Math.min(n.page, t - 1), l = s * n.pageSize, r = i.slice(l, l + n.pageSize);
  return { rows: i, total: e, totalPages: t, page: s, pageRows: r };
}
function Q(i) {
  const n = Object.fromEntries(i.columnDefs.map((l) => [l.field, l])), e = i.columnDefs.filter((l) => !l.hidden && !l._isCheckbox);
  let t = i.rowData;
  t = P(t, i.filterModel, n), t = T(t, i.quickFilter, e), t = $(t, i.sortModel, n);
  const s = K(t, i.pagination);
  return { filteredSorted: t, ...s };
}
function Y(i, n, e, t, s = 6) {
  const l = Math.ceil(n / e), r = Math.max(0, Math.floor(i / e) - s), o = Math.min(t, r + l + s * 2);
  return { first: r, last: o };
}
function Z(i) {
  return {
    // ---- Data ----
    setRowData(n) {
      i.setRowData(n);
    },
    getRowData() {
      return i.state.rowData.slice();
    },
    applyTransaction(n) {
      return i.applyTransaction(n);
    },
    // ---- Columns ----
    setColumnDefs(n) {
      i.setColumnDefs(n);
    },
    getColumnDefs() {
      return i.state.columnDefs.slice();
    },
    setColumnVisible(n, e) {
      i.setColumnVisible(n, e);
    },
    setColumnPinned(n, e) {
      i.setColumnPinned(n, e);
    },
    setColumnWidth(n, e) {
      i.setColumnWidth(n, e);
    },
    moveColumn(n, e) {
      i.moveColumn(n, e);
    },
    autoSizeColumn(n) {
      i.autoSizeColumn(n);
    },
    autoSizeAllColumns() {
      i.state.columnDefs.forEach((n) => i.autoSizeColumn(n.field));
    },
    sizeColumnsToFit() {
      i.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(n) {
      i.setSortModel(n);
    },
    getSortModel() {
      return i.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(n) {
      i.setFilterModel(n);
    },
    getFilterModel() {
      return { ...i.state.filterModel };
    },
    setColumnFilter(n, e) {
      i.setColumnFilter(n, e);
    },
    destroyFilter(n) {
      i.setColumnFilter(n, null);
    },
    setQuickFilter(n) {
      i.setQuickFilter(n);
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
    selectRow(n) {
      i.setSelected(n, !0);
    },
    deselectRow(n) {
      i.setSelected(n, !1);
    },
    getSelectedRows() {
      return i.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(i.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(n) {
      i.goToPage(n);
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
    paginationSetPageSize(n) {
      i.setPageSize(n);
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
    startEditingCell({ rowId: n, colId: e }) {
      i.startEditingCell(n, e);
    },
    stopEditing(n = !1) {
      i.stopEditing(n);
    },
    // ---- Export ----
    getDataAsCsv(n = {}) {
      return i.getDataAsCsv(n);
    },
    exportDataAsCsv(n = {}) {
      return i.exportDataAsCsv(n);
    },
    // ---- Display ----
    refreshCells(n = {}) {
      i.refresh(n);
    },
    redrawRows(n = {}) {
      i.refresh(n);
    },
    // ---- Events ----
    addEventListener(n, e) {
      i.element.addEventListener(n, e);
    },
    removeEventListener(n, e) {
      i.element.removeEventListener(n, e);
    }
  };
}
function u(i, n = {}, e = []) {
  const t = document.createElement(i);
  for (const [s, l] of Object.entries(n))
    l === !1 || l == null || (s === "class" ? t.className = l : s === "style" && typeof l == "object" ? Object.assign(t.style, l) : s.startsWith("on") && typeof l == "function" ? t.addEventListener(s.slice(2).toLowerCase(), l) : l === !0 ? t.setAttribute(s, "") : t.setAttribute(s, String(l)));
  for (const s of [].concat(e))
    s == null || s === !1 || t.appendChild(typeof s == "string" ? document.createTextNode(s) : s);
  return t;
}
function k(i, n) {
  for (const [e, t] of Object.entries(n))
    t == null || t === !1 ? i.removeAttribute(e) : t === !0 ? i.setAttribute(e, "") : i.setAttribute(e, String(t));
}
function J(i) {
  const n = document.getElementById(i);
  return !n || n.tagName !== "TEMPLATE" ? null : n.content.firstElementChild.cloneNode(!0);
}
function g(i, n, e) {
  i.dispatchEvent(new CustomEvent(n, { detail: e, bubbles: !0 }));
}
function ee(i, n, e) {
  let t = i.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(n)) {
      const l = e.getControllerForElementAndIdentifier(t, n);
      if (l) return l;
    }
    t = t.parentElement;
  }
  return null;
}
const te = 32, M = 100;
class D extends _ {
  constructor() {
    super(...arguments);
    y(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    y(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
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
      editing: null,
      pagination: { enabled: !1, page: 0, pageSize: M },
      scrollTop: 0,
      viewportHeight: 400
    }, this._displayList = { filteredSorted: [], pageRows: [], total: 0, totalPages: 1, page: 0 }, this._renderPending = !1, this._dirty = /* @__PURE__ */ new Set(), this._lastRenderedRowIds = /* @__PURE__ */ new Set(), this._runtimeOverrides = /* @__PURE__ */ Object.create(null);
  }
  connect() {
    this.element.classList.add("sg-grid"), this.heightValue && (this.element.style.height = this.heightValue), this.state.rowHeight = this.rowHeightValue, this.state.pagination = {
      enabled: this.paginationValue,
      page: 0,
      pageSize: this.pageSizeValue
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = Z(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null;
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, s) => {
      const l = {}, r = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      return l[this.getRowIdValue] = r != null ? this._coerceRowId(r) : s + 1, t.querySelectorAll("td").forEach((o) => {
        const a = o.getAttribute("data-cell-col-id-value") || o.getAttribute("data-col-id");
        a && (l[a] = o.textContent.trim());
      }), l;
    }), e.innerHTML = ""), this._initialHead = this.element.querySelector("thead");
  }
  _buildChrome() {
    let e = this.element.querySelector("table");
    if (!e) {
      e = u("table");
      const s = u("thead");
      e.appendChild(s), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = u("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const s = u("div", { class: "sg-body-viewport" });
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
    const s = this.state.filterModel[e.field] || {}, l = se(e.filter), r = u("div", { class: "sg-filter-popover" }), o = u("select");
    l.forEach((b) => o.append(new Option(b.label, b.value, !1, b.value === s.type)));
    const a = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", c = u("input", { type: a, value: s.value ?? "" }), f = u("input", { type: a, value: s.value2 ?? "", style: { display: "none" } }), d = () => {
      const b = o.value, x = b === "inRange", V = !(b === "blank" || b === "notBlank");
      c.style.display = V ? "" : "none", f.style.display = x ? "" : "none";
    };
    o.addEventListener("change", d), d();
    const h = u("div", { class: "sg-filter-actions" }), p = u("button", { type: "button" }, "Clear"), C = u("button", { type: "button", class: "primary" }, "Apply");
    h.append(p, C), p.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), C.addEventListener("click", () => {
      const b = o.value, x = b === "blank" || b === "notBlank" ? { filterType: e.filter, type: b } : { filterType: e.filter, type: b, value: c.value, value2: f.value || void 0 };
      this.setColumnFilter(e.field, x), this._closeFilterPopover();
    }), r.append(
      u("label", {}, "Condition"),
      o,
      c,
      f,
      h
    ), document.body.appendChild(r);
    const L = t.getBoundingClientRect();
    r.style.left = `${L.left + window.scrollX}px`, r.style.top = `${L.bottom + window.scrollY + 2}px`, this._filterPopover = r, document.addEventListener("mousedown", this._onDocMouseDown), c.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const s = this.state.columnDefs.findIndex((o) => o.field === e.field), l = this._runtimeOverrides[e.field] || {}, r = { ...e, ...l, _headerEl: t };
    if (s >= 0) {
      const o = this.state.columnDefs[s];
      if (o._headerEl === t && ie(o, r)) return;
      this.state.columnDefs[s] = r;
    } else
      this.state.columnDefs.push(r);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns");
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const s = this.state.sortModel.findIndex((r) => r.colId === e);
    let l;
    s === -1 ? l = { colId: e, sort: "asc" } : this.state.sortModel[s].sort === "asc" ? l = { colId: e, sort: "desc" } : l = null, t ? (s >= 0 && this.state.sortModel.splice(s, 1), l && this.state.sortModel.push(l)) : this.state.sortModel = l ? [l] : [], this.scheduleRender("sort"), g(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
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
    const s = this._displayList.filteredSorted, l = s.findIndex((c) => this._rowId(c) === e), r = s.findIndex((c) => this._rowId(c) === t);
    if (l < 0 || r < 0) return;
    const [o, a] = l <= r ? [l, r] : [r, l];
    for (let c = o; c <= a; c++) this.state.selection.add(this._rowId(s[c]));
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
    const e = Object.fromEntries(this.state.columnDefs.map((l) => [l.field, l])), t = this.state.columnDefs.filter((l) => !l.hidden && !l._isCheckbox);
    let s = P(this.state.rowData, this.state.filterModel, e);
    return s = T(s, this.state.quickFilter, t), s.length;
  }
  lastPageIndex() {
    return this.totalPages() - 1;
  }
  // ----- Editing -----
  startEditingCell(e, t) {
    const s = this.state.columnDefs.find((r) => r.field === t);
    if (!s || !s.editable) return;
    const l = this.state.rowData.find((r) => this._rowId(r) === e);
    l && (this.state.editing = { rowId: e, colId: t, originalValue: w(l, s) }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: s, originalValue: l, draftValue: r } = this.state.editing, o = this._tbody.querySelector(`tr[data-row-id="${S(t)}"] td[data-col-id="${S(s)}"]`);
    let a = l;
    if (!e && o) {
      const c = o.querySelector("input,select,textarea");
      c ? a = ne(c.value, this._colByField(s)?.type) : r !== void 0 && (a = r);
    }
    if (this.state.editing = null, !e && a !== l) {
      const c = this.state.rowData.find((d) => this._rowId(d) === t), f = c[s];
      c[s] = a, g(this.element, "grid:cellValueChanged", { rowId: t, colId: s, oldValue: f, newValue: a });
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
    const l = t || null;
    s.pinned = l, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: l }, this._reorderForPinning(), this.scheduleRender("columns"), g(this.element, "grid:columnPinned", { colId: e, pinned: l });
  }
  setColumnWidth(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const l = Math.max(s.minWidth || 40, Math.min(s.maxWidth || 4e3, t));
    s.width = l, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: l }, this.scheduleRender("columns"), g(this.element, "grid:columnResized", { colId: e, width: l });
  }
  moveColumn(e, t) {
    const s = this.state.columnDefs.findIndex((r) => r.field === e);
    if (s < 0 || s === t) return;
    const [l] = this.state.columnDefs.splice(s, 1);
    this.state.columnDefs.splice(t, 0, l), this.scheduleRender("columns"), g(this.element, "grid:columnMoved", { colId: e, fromIndex: s, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const s = (t.headerName || t.field || "").length, l = this.state.rowData.slice(0, 200);
    let r = s;
    for (const o of l) {
      const a = String(v(o, t) ?? "").length;
      a > r && (r = a);
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, r * 8 + 24)));
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), s = t.reduce((r, o) => r + (o.width || 150), 0);
    if (s === 0) return;
    const l = e / s;
    t.forEach((r) => {
      r.width = Math.max(r.minWidth || 40, Math.floor((r.width || 150) * l));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((l) => l.pinned === "left"), t = this.state.columnDefs.filter((l) => l.pinned === "right"), s = this.state.columnDefs.filter((l) => !l.pinned);
    this.state.columnDefs = [...e, ...s, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.pagination.page = 0, this.scheduleRender("data"), g(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], s = [], l = [], r = new Map(this.state.rowData.map((o) => [this._rowId(o), o]));
    return (e.remove || []).forEach((o) => {
      const a = this._rowId(o);
      r.delete(a) && l.push(o);
    }), (e.update || []).forEach((o) => {
      const a = this._rowId(o);
      r.has(a) && (r.set(a, { ...r.get(a), ...o }), s.push(o));
    }), (e.add || []).forEach((o) => {
      const a = this._rowId(o);
      r.has(a) || (r.set(a, o), t.push(o));
    }), this.state.rowData = Array.from(r.values()), this.scheduleRender("data"), g(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: s, removed: l };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const s = this._visibleCols().filter((a) => !a._isCheckbox), l = t ? this.getSelectedRows() : this._displayList.filteredSorted, r = (a) => /[",\n\r]/.test(a) ? `"${String(a).replace(/"/g, '""')}"` : String(a), o = [s.map((a) => r(a.headerName || a.field)).join(e)];
    for (const a of l)
      o.push(s.map((c) => r(v(a, c))).join(e));
    return o.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const s = this.getDataAsCsv(t), l = new Blob([s], { type: "text/csv;charset=utf-8" }), r = URL.createObjectURL(l), o = u("a", { href: r, download: e });
    return document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(r), s;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.size === 0) && (this._displayList = Q({
      rowData: this.state.rowData,
      columnDefs: this.state.columnDefs,
      sortModel: this.state.sortModel,
      filterModel: this.state.filterModel,
      quickFilter: this.state.quickFilter,
      pagination: this.state.pagination
    })), (e.has("columns") || e.has("sort") || e.has("filter") || e.has("selection")) && this._renderHeader(), this._renderBody(), this._renderPagination();
  }
  _renderHeader() {
    if (!this._thead) return;
    const e = this._visibleCols(), t = this._thead.querySelector("tr") || (() => {
      const d = u("tr");
      return this._thead.appendChild(d), d;
    })(), s = /* @__PURE__ */ new Map();
    Array.from(t.querySelectorAll("th")).forEach((d) => {
      const h = d.getAttribute("data-header-cell-field-value") || d.getAttribute("data-field");
      h && s.set(h, d);
    });
    const l = Array.from(t.children).map((d) => d.getAttribute("data-header-cell-field-value") || d.getAttribute("data-field")).filter(Boolean), r = e.map((d) => d.field);
    if (!(l.length === r.length && l.every((d, h) => d === r[h]))) {
      const d = [];
      for (const h of e) {
        let p = s.get(h.field);
        p || (p = u("th", {
          "data-field": h.field,
          "data-synth": "true"
        }, [u("div", { class: "sg-header-content" }, [
          u("span", { class: "sg-header-label" }, h.headerName || h.field || "")
        ])])), d.push(p);
      }
      t.replaceChildren(...d);
    }
    let a = this._table.querySelector("colgroup");
    a || (a = u("colgroup"), this._table.insertBefore(a, this._thead));
    const c = Array.from(a.children);
    for (e.forEach((d, h) => {
      let p = c[h];
      p || (p = u("col"), a.appendChild(p)), p.style.width = d.width ? d.width + "px" : "";
    }); a.children.length > e.length; ) a.lastElementChild.remove();
    const f = this._pinOffsets();
    for (const d of e) {
      const h = t.querySelector(`th[data-header-cell-field-value="${S(d.field)}"]`) || t.querySelector(`th[data-field="${S(d.field)}"]`);
      if (!h) continue;
      const p = this.state.sortModel.find((C) => C.colId === d.field);
      k(h, {
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
      a || (a = u("input", { type: "checkbox", "aria-label": "Select all" }), a.addEventListener("change", (d) => {
        d.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(a));
      const c = this._displayList.filteredSorted.length, f = this.state.selection.size;
      a.checked = f > 0 && f >= c, a.indeterminate = f > 0 && f < c;
      return;
    }
    let l = e.querySelector(".sg-header-content");
    if (!l) {
      const a = e.textContent.trim();
      e.textContent = "", l = u("div", { class: "sg-header-content" }, [
        u("span", { class: "sg-header-label" }, a || t.headerName || t.field || "")
      ]), e.appendChild(l);
    }
    let r = l.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (r || (r = u("span", { class: "sg-sort-icon" }), l.appendChild(r)), s && this.state.sortModel.length > 1) {
        let a = l.querySelector(".sg-sort-index");
        a || (a = u("span", { class: "sg-sort-index" }), l.appendChild(a)), a.textContent = String(this.state.sortModel.indexOf(s) + 1);
      } else
        l.querySelector(".sg-sort-index")?.remove();
    else r && r.remove();
    let o = l.querySelector(".sg-filter-icon");
    t.filter ? o || (o = u("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), l.appendChild(o)) : o && o.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(u("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._displayList.pageRows, s = this.virtualValue || t.length > 200;
    let l = t, r = 0;
    if (s) {
      const c = this._viewport?.clientHeight || 400, f = this.state.rowHeight, d = Y(this.state.scrollTop, c, f, t.length, 8);
      r = d.first, l = t.slice(d.first, d.last);
    }
    const o = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((c) => {
      const f = c.dataset.rowId;
      f != null && o.set(f, c);
    });
    const a = document.createDocumentFragment();
    if (s) {
      const c = this.state.rowHeight, f = r * c, d = (t.length - r - l.length) * c;
      a.appendChild(this._spacerRow(f, e.length));
      for (const h of l)
        a.appendChild(this._buildRow(h, e, o));
      a.appendChild(this._spacerRow(d, e.length));
    } else
      for (const c of l)
        a.appendChild(this._buildRow(c, e, o));
    this._tbody.replaceChildren(a);
  }
  _buildRow(e, t, s) {
    const l = String(this._rowId(e));
    let r = s.get(l);
    r || (r = u("tr")), r.dataset.rowId = l, r.classList.remove("sg-spacer");
    const o = this.state.selection.has(this._rowId(e));
    return k(r, { "data-selected": o ? "true" : null }), this._renderRow(r, e, t), r;
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const l = u("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return l.style.height = "0px", l.appendChild(u("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), l;
    }
    const s = u("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return s.style.height = e + "px", s.appendChild(u("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), s;
  }
  _renderRow(e, t, s) {
    e.innerHTML = "";
    const l = this._pinOffsets();
    for (const r of s) {
      const o = u("td", {
        "data-col-id": r.field,
        "data-pinned": r.pinned || null
      });
      if (r.pinned === "left" ? o.style.left = l.left[r.field] + "px" : r.pinned === "right" && (o.style.right = l.right[r.field] + "px"), r._isCheckbox) {
        o.classList.add("sg-checkbox-cell");
        const c = u("input", { type: "checkbox" });
        c.checked = this.state.selection.has(this._rowId(t)), o.appendChild(c), e.appendChild(o);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === r.field) {
        o.setAttribute("data-editing", "true");
        const c = this._buildEditorInput(r, w(t, r));
        o.appendChild(c), queueMicrotask(() => {
          c.focus(), c.select?.();
        });
      } else
        this._renderCellContent(o, t, r);
      e.appendChild(o);
    }
  }
  _renderCellContent(e, t, s) {
    if (s.cellRenderer) {
      const l = J(s.cellRenderer);
      if (l) {
        const r = w(t, s), o = v(t, s);
        (l.dataset.bind || l.dataset.bindText !== void 0) && (l.textContent = l.dataset.bind ? String(t[l.dataset.bind] ?? "") : o), l.dataset.bindAttr && l.setAttribute(l.dataset.bindAttr, r), l.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((a) => {
          a.dataset.bindText !== void 0 ? a.textContent = o : a.dataset.bind && (a.textContent = String(t[a.dataset.bind] ?? "")), a.dataset.bindAttr && a.setAttribute(a.dataset.bindAttr, r);
        }), e.appendChild(l);
        return;
      }
    }
    e.textContent = v(t, s);
  }
  _buildEditorInput(e, t) {
    let s;
    if (e.type === "number") s = u("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const l = t instanceof Date ? t : t ? new Date(t) : null, r = l ? l.toISOString().slice(0, 10) : "";
      s = u("input", { type: "date", value: r });
    } else e.type === "boolean" ? (s = u("select"), s.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : s = u("input", { type: "text", value: t ?? "" });
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
    const s = this._coerceRowId(t.dataset.rowId), l = e.target.closest("td");
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(s, "toggle");
      return;
    }
    if (l) {
      const o = this.state.rowData.find((c) => this._rowId(c) === s), a = l.dataset.colId;
      g(this.element, "grid:cellClicked", { rowId: s, colId: a, value: o?.[a], event: e });
    }
    if (this.suppressRowClickSelectionValue || this.rowSelectionValue === "") return;
    const r = e.shiftKey ? "range" : e.metaKey || e.ctrlKey || this.rowMultiSelectWithClickValue ? "toggle" : "replace";
    this.toggleRowSelection(s, r), g(this.element, "grid:rowClicked", { rowId: s, row: this.state.rowData.find((o) => this._rowId(o) === s), event: e });
  }
  _onBodyDblClick(e) {
    const t = e.target.closest("tr"), s = e.target.closest("td");
    if (!t || !s || s.dataset.editing === "true") return;
    const l = this._coerceRowId(t.dataset.rowId), r = s.dataset.colId;
    this.startEditingCell(l, r);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const s = this._visibleCols().filter((h) => h.editable && !h._isCheckbox), l = this._displayList.pageRows, r = l.findIndex((h) => this._rowId(h) === t.rowId), o = s.findIndex((h) => h.field === t.colId);
    if (!s.length || !l.length || r < 0 || o < 0) {
      this.stopEditing(!1);
      return;
    }
    const a = l.length * s.length, c = (r * s.length + o + e + a) % a, f = l[Math.floor(c / s.length)], d = s[c % s.length];
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
    for (const r of e)
      r.pinned === "left" && (t[r.field] = s, s += r.width || 150);
    const l = {};
    s = 0;
    for (let r = e.length - 1; r >= 0; r--) {
      const o = e[r];
      o.pinned === "right" && (l[o.field] = s, s += o.width || 150);
    }
    return { left: t, right: l };
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
y(D, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: M },
  rowHeight: { type: Number, default: te },
  headerHeight: { type: Number, default: 36 },
  virtual: { type: Boolean, default: !1 },
  virtualThreshold: { type: Number, default: 200 },
  height: { type: String, default: "" },
  // CSS height, e.g. '480px'
  getRowId: { type: String, default: "id" },
  // field name for row identity
  domLayout: { type: String, default: "" }
  // '' | 'autoHeight'
});
function ie(i, n) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "_isCheckbox"];
  for (const t of e) if (i[t] !== n[t]) return !1;
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
function ne(i, n) {
  if (n === "number") {
    const e = Number(i);
    return Number.isFinite(e) ? e : i;
  }
  return n === "date" ? i : n === "boolean" ? i === "true" ? !0 : i === "false" ? !1 : null : i;
}
function S(i) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(i)) : String(i).replace(/["\\\n\r]/g, (n) => "\\" + n);
}
class R extends _ {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    y(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, s = e.clientY;
      let l = !1;
      const r = (a) => {
        const c = Math.abs(a.clientX - t), f = Math.abs(a.clientY - s);
        !l && (c > 5 || f > 5) && (l = !0, document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", o), this._beginReorder(t));
      }, o = (a) => {
        document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", o), l || this.sort(a);
      };
      document.addEventListener("mousemove", r), document.addEventListener("mouseup", o);
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
      _isCheckbox: this.checkboxValue
    };
  }
  _beginReorder(e) {
    if (!this.grid) return;
    const t = this.element.parentElement, s = Array.from(t.children), l = s.indexOf(this.element);
    let r = l;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const o = (c) => {
      const f = c.clientX;
      let d = s.length;
      for (let h = 0; h < s.length; h++) {
        const p = s[h].getBoundingClientRect();
        if (f < p.left + p.width / 2) {
          d = h;
          break;
        }
      }
      r = d > l ? d - 1 : d;
    }, a = () => {
      document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", r !== l && this.grid.moveColumn(this.fieldValue, r);
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
    const t = e.clientX, s = this.element.offsetWidth, l = (o) => this.grid.setColumnWidth(this.fieldValue, s + (o.clientX - t)), r = () => {
      document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", r), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", l), document.addEventListener("mouseup", r), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
y(R, "values", {
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
  checkbox: { type: Boolean, default: !1 }
});
class F extends _ {
  connect() {
  }
}
class I extends _ {
  connect() {
  }
}
class N extends _ {
  connect() {
  }
}
class E extends _ {
  constructor() {
    super(...arguments);
    y(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), s = e.paginationGetTotalPages(), l = e.paginationGetRowCount(), r = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const o = l === 0 ? 0 : t * r + 1, a = Math.min(l, o + r - 1);
        this.pageInfoTarget.textContent = l === 0 ? "0 rows" : `${o}–${a} of ${l}`;
      }
      this.hasFirstTarget && (this.firstTarget.disabled = t === 0), this.hasPrevTarget && (this.prevTarget.disabled = t === 0), this.hasNextTarget && (this.nextTarget.disabled = t >= s - 1), this.hasLastTarget && (this.lastTarget.disabled = t >= s - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(r));
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
y(E, "outlets", ["grid"]), y(E, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
function le(i) {
  const n = i ?? z.start();
  return n.register("grid", D), n.register("header-cell", R), n.register("row", F), n.register("cell", I), n.register("filter", N), n.register("pagination", E), n;
}
const re = {
  start: le,
  GridController: D,
  HeaderCellController: R,
  RowController: F,
  CellController: I,
  FilterController: N,
  PaginationController: E
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = re);
export {
  I as CellController,
  N as FilterController,
  D as GridController,
  R as HeaderCellController,
  E as PaginationController,
  F as RowController,
  re as default,
  le as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
