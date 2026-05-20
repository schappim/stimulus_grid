var B = Object.defineProperty;
var O = (n, l, e) => l in n ? B(n, l, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[l] = e;
var m = (n, l, e) => O(n, typeof l != "symbol" ? l + "" : l, e);
import { Controller as S, Application as z } from "@hotwired/stimulus";
function b(n, l) {
  return typeof l.valueGetter == "function" ? l.valueGetter(n) : n?.[l.field];
}
function C(n, l) {
  const e = b(n, l);
  return typeof l.valueFormatter == "function" ? l.valueFormatter(e, n) : e == null ? "" : l.type === "date" && e instanceof Date ? e.toLocaleDateString() : l.type === "boolean" ? e ? "✓" : "" : String(e);
}
const k = {
  contains: (n, l) => String(n ?? "").toLowerCase().includes(String(l ?? "").toLowerCase()),
  notContains: (n, l) => !String(n ?? "").toLowerCase().includes(String(l ?? "").toLowerCase()),
  equals: (n, l) => String(n ?? "").toLowerCase() === String(l ?? "").toLowerCase(),
  notEqual: (n, l) => String(n ?? "").toLowerCase() !== String(l ?? "").toLowerCase(),
  startsWith: (n, l) => String(n ?? "").toLowerCase().startsWith(String(l ?? "").toLowerCase()),
  endsWith: (n, l) => String(n ?? "").toLowerCase().endsWith(String(l ?? "").toLowerCase()),
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
}, K = {
  equals: (n, l) => Number(n) === Number(l),
  notEqual: (n, l) => Number(n) !== Number(l),
  lessThan: (n, l) => Number(n) < Number(l),
  lessThanOrEqual: (n, l) => Number(n) <= Number(l),
  greaterThan: (n, l) => Number(n) > Number(l),
  greaterThanOrEqual: (n, l) => Number(n) >= Number(l),
  inRange: (n, l, e) => Number(n) >= Number(l) && Number(n) <= Number(e),
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
};
function _(n) {
  if (n == null || n === "") return null;
  if (n instanceof Date) return n;
  const l = new Date(n);
  return Number.isNaN(l.valueOf()) ? null : l;
}
const G = {
  equals: (n, l) => _(n)?.toDateString() === _(l)?.toDateString(),
  notEqual: (n, l) => _(n)?.toDateString() !== _(l)?.toDateString(),
  lessThan: (n, l) => (_(n)?.valueOf() ?? -1 / 0) < (_(l)?.valueOf() ?? 1 / 0),
  greaterThan: (n, l) => (_(n)?.valueOf() ?? 1 / 0) > (_(l)?.valueOf() ?? -1 / 0),
  inRange: (n, l, e) => {
    const t = _(n)?.valueOf();
    return t != null && t >= (_(l)?.valueOf() ?? -1 / 0) && t <= (_(e)?.valueOf() ?? 1 / 0);
  },
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
}, W = {
  equals: (n, l) => l === "true" ? !!n : l === "false" ? !n : !0
}, $ = {
  in: (n, l) => Array.isArray(l) && l.includes(String(n ?? ""))
}, H = { text: k, number: K, date: G, boolean: W, set: $ };
function j(n, l, e) {
  if (!e) return !0;
  const t = e.filterType || l.filter || "text", s = (H[t] || k)[e.type];
  if (!s) return !0;
  const r = b(n, l);
  return s(r, e.value, e.value2);
}
function P(n, l, e) {
  const t = Object.entries(l || {}).filter(([, i]) => i != null);
  return t.length === 0 ? n : n.filter((i) => t.every(([s, r]) => {
    const o = e[s];
    return o ? j(i, o, r) : !0;
  }));
}
function V(n, l, e) {
  if (!l) return n;
  const t = String(l).toLowerCase();
  return n.filter((i) => {
    for (const s of e) {
      const r = C(i, s);
      if (r && String(r).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function U(n, l, e) {
  if (n == null && l == null) return 0;
  if (n == null) return -1;
  if (l == null) return 1;
  if (e === "number") return Number(n) - Number(l);
  if (e === "date") {
    const t = _(n)?.valueOf() ?? 0, i = _(l)?.valueOf() ?? 0;
    return t - i;
  }
  return e === "boolean" ? n === l ? 0 : n ? 1 : -1 : String(n).localeCompare(String(l), void 0, { numeric: !0, sensitivity: "base" });
}
function X(n, l, e) {
  if (!l || l.length === 0) return n;
  const t = n.slice();
  return t.sort((i, s) => {
    for (const { colId: r, sort: o } of l) {
      const a = e[r];
      if (!a) continue;
      const c = b(i, a), u = b(s, a), d = typeof a.comparator == "function" ? a.comparator(c, u, i, s) : U(c, u, a.type);
      if (d !== 0) return o === "desc" ? -d : d;
    }
    return 0;
  }), t;
}
function Y(n, l) {
  if (!l || !l.enabled) return { rows: n, total: n.length, pageRows: n };
  const e = n.length, t = Math.max(1, Math.ceil(e / l.pageSize)), i = Math.min(l.page, t - 1), s = i * l.pageSize, r = n.slice(s, s + l.pageSize);
  return { rows: n, total: e, totalPages: t, page: i, pageRows: r };
}
function Q(n) {
  if (n.serverSide) {
    const s = n.rowData, r = n.pagination?.pageSize || s.length || 1, o = n.serverRowCount ?? s.length, a = Math.max(1, Math.ceil(o / r)), c = Math.min(n.pagination?.page || 0, a - 1);
    return { filteredSorted: s, rows: s, total: o, totalPages: a, page: c, pageRows: s };
  }
  const l = Object.fromEntries(n.columnDefs.map((s) => [s.field, s])), e = n.columnDefs.filter((s) => !s.hidden && !s._isCheckbox);
  let t = n.rowData;
  t = P(t, n.filterModel, l), t = V(t, n.quickFilter, e), t = X(t, n.sortModel, l);
  const i = Y(t, n.pagination);
  return { filteredSorted: t, ...i };
}
function Z(n, l, e, t, i = 6) {
  const s = Math.ceil(l / e), r = Math.max(0, Math.floor(n / e) - i), o = Math.min(t, r + s + i * 2);
  return { first: r, last: o };
}
function J(n) {
  return {
    // ---- Data ----
    setRowData(l) {
      n.setRowData(l);
    },
    getRowData() {
      return n.state.rowData.slice();
    },
    applyTransaction(l) {
      return n.applyTransaction(l);
    },
    // Server-side row model
    setRowCount(l) {
      n.setRowCount(l);
    },
    getRowCount() {
      return n.state.serverSide ? n.state.serverRowCount : n.state.rowData.length;
    },
    isServerSide() {
      return !!n.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(l) {
      n.setColumnDefs(l);
    },
    getColumnDefs() {
      return n.state.columnDefs.slice();
    },
    setColumnVisible(l, e) {
      n.setColumnVisible(l, e);
    },
    setColumnPinned(l, e) {
      n.setColumnPinned(l, e);
    },
    setColumnWidth(l, e) {
      n.setColumnWidth(l, e);
    },
    moveColumn(l, e) {
      n.moveColumn(l, e);
    },
    autoSizeColumn(l) {
      n.autoSizeColumn(l);
    },
    autoSizeAllColumns() {
      n.state.columnDefs.forEach((l) => n.autoSizeColumn(l.field));
    },
    sizeColumnsToFit() {
      n.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(l) {
      n.setSortModel(l);
    },
    getSortModel() {
      return n.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(l) {
      n.setFilterModel(l);
    },
    getFilterModel() {
      return { ...n.state.filterModel };
    },
    setColumnFilter(l, e) {
      n.setColumnFilter(l, e);
    },
    destroyFilter(l) {
      n.setColumnFilter(l, null);
    },
    setQuickFilter(l) {
      n.setQuickFilter(l);
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
    selectRow(l) {
      n.setSelected(l, !0);
    },
    deselectRow(l) {
      n.setSelected(l, !1);
    },
    getSelectedRows() {
      return n.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(n.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(l) {
      n.goToPage(l);
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
    paginationSetPageSize(l) {
      n.setPageSize(l);
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
    startEditingCell({ rowId: l, colId: e }) {
      n.startEditingCell(l, e);
    },
    stopEditing(l = !1) {
      n.stopEditing(l);
    },
    // ---- Export ----
    getDataAsCsv(l = {}) {
      return n.getDataAsCsv(l);
    },
    exportDataAsCsv(l = {}) {
      return n.exportDataAsCsv(l);
    },
    // ---- Display ----
    refreshCells(l = {}) {
      n.refresh(l);
    },
    redrawRows(l = {}) {
      n.refresh(l);
    },
    // ---- Events ----
    addEventListener(l, e) {
      n.element.addEventListener(l, e);
    },
    removeEventListener(l, e) {
      n.element.removeEventListener(l, e);
    }
  };
}
function f(n, l = {}, e = []) {
  const t = document.createElement(n);
  for (const [i, s] of Object.entries(l))
    s === !1 || s == null || (i === "class" ? t.className = s : i === "style" && typeof s == "object" ? Object.assign(t.style, s) : i.startsWith("on") && typeof s == "function" ? t.addEventListener(i.slice(2).toLowerCase(), s) : s === !0 ? t.setAttribute(i, "") : t.setAttribute(i, String(s)));
  for (const i of [].concat(e))
    i == null || i === !1 || t.appendChild(typeof i == "string" ? document.createTextNode(i) : i);
  return t;
}
function A(n, l) {
  for (const [e, t] of Object.entries(l))
    t == null || t === !1 ? n.removeAttribute(e) : t === !0 ? n.setAttribute(e, "") : n.setAttribute(e, String(t));
}
function M(n) {
  const l = document.getElementById(n);
  return !l || l.tagName !== "TEMPLATE" ? null : l.content.firstElementChild.cloneNode(!0);
}
function p(n, l, e) {
  n.dispatchEvent(new CustomEvent(l, { detail: e, bubbles: !0 }));
}
function ee(n, l, e) {
  let t = n.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(l)) {
      const s = e.getControllerForElementAndIdentifier(t, l);
      if (s) return s;
    }
    t = t.parentElement;
  }
  return null;
}
const te = 32, L = 100;
class x extends S {
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
      if (this.rowDragValue) {
        const s = e.target.closest?.('td[data-gutter="true"]');
        if (s) {
          const r = s.closest("tr");
          this._rowDragPending = { rowId: this._coerceRowId(r.dataset.rowId), x: e.clientX, y: e.clientY }, this._rowDragMoved = !1, document.addEventListener("mousemove", this._onRowDragMove);
          return;
        }
      }
      const t = this._cellAt(e.target);
      if (!t) return;
      const i = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : i ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), p(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    m(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const i = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      i && i.focus.rowId === t.rowId && i.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), p(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
    });
    m(this, "_onCellMouseUp", () => {
      this._cellDragging = !1, this._rowDragPending && (document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag && this._finishRowDrag(), this._rowDragPending = null);
    });
    // ----- Row drag-and-drop (reorder) with a ghost preview -----
    m(this, "_onRowDragMove", (e) => {
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
    m(this, "_onCopy", (e) => {
      if (this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && !this.element.contains(t)) return;
      const i = this._activeRect();
      if (!i) return;
      const s = this._cellRangeRows(i).map((r) => r.map((o) => String(o ?? "")).join("	")).join(`
`);
      s && (e.clipboardData?.setData("text/plain", s), e.preventDefault());
    });
    m(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && this.element.contains(t)) return;
      const i = e.key, s = e.metaKey || e.ctrlKey;
      if (s && i.toLowerCase() === "a") {
        e.preventDefault(), this.rowSelectionValue !== "" ? (this.clearCellSelection(), this.deselectAll(), this.selectAll()) : this._selectAllCells();
        return;
      }
      if (s) return;
      const r = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (r[i]) {
        e.preventDefault();
        const [o, a] = r[i];
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
      cellSel: { ranges: [], activeIdx: -1 },
      // multi-range: [{anchor,focus}], active range
      editing: null,
      pagination: { enabled: !1, page: 0, pageSize: L },
      scrollTop: 0,
      viewportHeight: 400
    }, this._displayList = { filteredSorted: [], pageRows: [], total: 0, totalPages: 1, page: 0 }, this._renderPending = !1, this._dirty = /* @__PURE__ */ new Set(), this._lastRenderedRowIds = /* @__PURE__ */ new Set(), this._runtimeOverrides = /* @__PURE__ */ Object.create(null);
  }
  connect() {
    this.element.classList.add("sg-grid"), this.heightValue && (this.element.style.height = this.heightValue), this.element.hasAttribute("tabindex") || (this.element.tabIndex = 0), this.element.addEventListener("keydown", this._onGridKeydown), this.state.rowHeight = this.rowHeightValue, this.state.pagination = {
      enabled: this.paginationValue,
      page: 0,
      pageSize: this.pageSizeValue
    }, this.state.serverSide = this.serverSideValue, this.state.serverRowCount = this.rowCountValue, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = J(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove();
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, i) => {
      const s = {}, r = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      return s[this.getRowIdValue] = r != null ? this._coerceRowId(r) : i + 1, t.querySelectorAll("td").forEach((o) => {
        const a = o.getAttribute("data-cell-col-id-value") || o.getAttribute("data-col-id");
        a && (s[a] = o.textContent.trim());
      }), s;
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
    this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), p(this.element, "grid:ready", { api: this.element.gridApi }), p(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
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
    const i = this.state.filterModel[e.field] || {}, s = se(e.filter), r = f("div", { class: "sg-filter-popover" }), o = f("select");
    s.forEach((w) => o.append(new Option(w.label, w.value, !1, w.value === i.type)));
    const a = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", c = f("input", { type: a, value: i.value ?? "" }), u = f("input", { type: a, value: i.value2 ?? "", style: { display: "none" } }), d = () => {
      const w = o.value, I = w === "inRange", q = !(w === "blank" || w === "notBlank");
      c.style.display = q ? "" : "none", u.style.display = I ? "" : "none";
    };
    o.addEventListener("change", d), d();
    const h = f("div", { class: "sg-filter-actions" }), g = f("button", { type: "button" }, "Clear"), v = f("button", { type: "button", class: "primary" }, "Apply");
    h.append(g, v), g.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), v.addEventListener("click", () => {
      const w = o.value, I = w === "blank" || w === "notBlank" ? { filterType: e.filter, type: w } : { filterType: e.filter, type: w, value: c.value, value2: u.value || void 0 };
      this.setColumnFilter(e.field, I), this._closeFilterPopover();
    }), r.append(
      f("label", {}, "Condition"),
      o,
      c,
      u,
      h
    ), document.body.appendChild(r);
    const y = t.getBoundingClientRect();
    r.style.left = `${y.left + window.scrollX}px`, r.style.top = `${y.bottom + window.scrollY + 2}px`, this._filterPopover = r, document.addEventListener("mousedown", this._onDocMouseDown), c.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const i = this.state.columnDefs.findIndex((o) => o.field === e.field), s = this._runtimeOverrides[e.field] || {}, r = { ...e, ...s, _headerEl: t };
    if (i >= 0) {
      const o = this.state.columnDefs[i];
      if (o._headerEl === t && ie(o, r)) return;
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
    let s;
    i === -1 ? s = { colId: e, sort: "asc" } : this.state.sortModel[i].sort === "asc" ? s = { colId: e, sort: "desc" } : s = null, t ? (i >= 0 && this.state.sortModel.splice(i, 1), s && this.state.sortModel.push(s)) : this.state.sortModel = s ? [s] : [], this.scheduleRender("sort"), p(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  setSortModel(e) {
    this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), p(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  // ----- Filter -----
  setColumnFilter(e, t) {
    t == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = t, this.state.pagination.page = 0, this.scheduleRender("filter"), p(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setFilterModel(e) {
    this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), p(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setQuickFilter(e) {
    const t = e == null ? "" : String(e);
    t !== this.state.quickFilter && (this.state.quickFilter = t, this.state.pagination.page = 0, this.scheduleRender("filter"), p(this.element, "grid:filterChanged", {
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
    this.rowSelectionValue === "single" ? (i.clear(), i.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? i.has(e) ? i.delete(e) : i.add(e) : (i.clear(), i.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), p(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(i)
    });
  }
  setSelected(e, t) {
    t ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), p(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  selectAll() {
    this._displayList.filteredSorted.forEach((e) => this.state.selection.add(this._rowId(e))), this.scheduleRender("selection"), p(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  deselectAll() {
    this.state.selection.clear(), this.scheduleRender("selection"), p(this.element, "grid:selectionChanged", { selectedRows: [], selectedIds: [] });
  }
  getSelectedRows() {
    const e = this.state.selection;
    return this.state.rowData.filter((t) => e.has(this._rowId(t)));
  }
  _selectRange(e, t) {
    const i = this._displayList.filteredSorted, s = i.findIndex((c) => this._rowId(c) === e), r = i.findIndex((c) => this._rowId(c) === t);
    if (s < 0 || r < 0) return;
    const [o, a] = s <= r ? [s, r] : [r, s];
    for (let c = o; c <= a; c++) this.state.selection.add(this._rowId(i[c]));
  }
  // ----- Pagination -----
  goToPage(e) {
    const t = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(e, t)), this.scheduleRender("page"), p(this.element, "grid:paginationChanged", {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  setPageSize(e) {
    this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), p(this.element, "grid:paginationChanged", {
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
    let i = P(this.state.rowData, this.state.filterModel, e);
    return i = V(i, this.state.quickFilter, t), i.length;
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
    const r = this.state.rowData.find((o) => this._rowId(o) === e);
    r && (this.state.editing = { rowId: e, colId: t, originalValue: b(r, s), initialValue: i }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: i, originalValue: s, draftValue: r } = this.state.editing, o = this._tbody.querySelector(`tr[data-row-id="${D(t)}"] td[data-col-id="${D(i)}"]`);
    let a = s;
    if (!e && o) {
      const c = o.querySelector("[data-editor-input]") || o.querySelector("input,select,textarea");
      c ? a = ne(c.value, this._colByField(i)?.type) : r !== void 0 && (a = r);
    }
    if (this.state.editing = null, !e && a !== s) {
      const c = this.state.rowData.find((d) => this._rowId(d) === t), u = c[i];
      c[i] = a, p(this.element, "grid:cellValueChanged", { rowId: t, colId: i, oldValue: u, newValue: a });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const i = this._colByField(e);
    i && (i.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), p(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const i = this._colByField(e);
    if (!i) return;
    const s = t || null;
    i.pinned = s, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: s }, this._reorderForPinning(), this.scheduleRender("columns"), p(this.element, "grid:columnPinned", { colId: e, pinned: s });
  }
  setColumnWidth(e, t) {
    const i = this._colByField(e);
    if (!i) return;
    const s = Math.max(i.minWidth || 40, Math.min(i.maxWidth || 4e3, t));
    i.width = s, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: s }, this.scheduleRender("columns"), p(this.element, "grid:columnResized", { colId: e, width: s });
  }
  moveColumn(e, t) {
    const i = this.state.columnDefs.findIndex((r) => r.field === e);
    if (i < 0 || i === t) return;
    const [s] = this.state.columnDefs.splice(i, 1);
    this.state.columnDefs.splice(t, 0, s), this.scheduleRender("columns"), p(this.element, "grid:columnMoved", { colId: e, fromIndex: i, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const i = (t.headerName || t.field || "").length, s = this.state.rowData.slice(0, 200);
    let r = i;
    for (const o of s) {
      const a = String(C(o, t) ?? "").length;
      a > r && (r = a);
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, r * 8 + 24)));
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), i = t.reduce((r, o) => r + (o.width || 150), 0);
    if (i === 0) return;
    const s = e / i;
    t.forEach((r) => {
      r.width = Math.max(r.minWidth || 40, Math.floor((r.width || 150) * s));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((s) => s.pinned === "left"), t = this.state.columnDefs.filter((s) => s.pinned === "right"), i = this.state.columnDefs.filter((s) => !s.pinned);
    this.state.columnDefs = [...e, ...i, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), p(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], i = [], s = [], r = new Map(this.state.rowData.map((o) => [this._rowId(o), o]));
    return (e.remove || []).forEach((o) => {
      const a = this._rowId(o);
      r.delete(a) && s.push(o);
    }), (e.update || []).forEach((o) => {
      const a = this._rowId(o);
      r.has(a) && (r.set(a, { ...r.get(a), ...o }), i.push(o));
    }), (e.add || []).forEach((o) => {
      const a = this._rowId(o);
      r.has(a) || (r.set(a, o), t.push(o));
    }), this.state.rowData = Array.from(r.values()), this.scheduleRender("data"), p(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: i, removed: s };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const i = this._visibleCols().filter((a) => !a._isCheckbox), s = t ? this.getSelectedRows() : this._displayList.filteredSorted, r = (a) => /[",\n\r]/.test(a) ? `"${String(a).replace(/"/g, '""')}"` : String(a), o = [i.map((a) => r(a.headerName || a.field)).join(e)];
    for (const a of s)
      o.push(i.map((c) => r(C(a, c))).join(e));
    return o.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const i = this.getDataAsCsv(t), s = new Blob([i], { type: "text/csv;charset=utf-8" }), r = URL.createObjectURL(s), o = f("a", { href: r, download: e });
    return document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(r), i;
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
    const s = Array.from(t.children).map((d) => d.getAttribute("data-header-cell-field-value") || d.getAttribute("data-field")).filter(Boolean), r = e.map((d) => d.field);
    if (!(s.length === r.length && s.every((d, h) => d === r[h]))) {
      const d = [];
      for (const h of e) {
        let g = i.get(h.field);
        g || (g = f("th", {
          "data-field": h.field,
          "data-synth": "true"
        }, [f("div", { class: "sg-header-content" }, [
          f("span", { class: "sg-header-label" }, h.headerName || h.field || "")
        ])])), d.push(g);
      }
      t.replaceChildren(...d);
    }
    let a = this._table.querySelector("colgroup");
    a || (a = f("colgroup"), this._table.insertBefore(a, this._thead));
    const c = Array.from(a.children);
    for (e.forEach((d, h) => {
      let g = c[h];
      g || (g = f("col"), a.appendChild(g)), g.style.width = d.width ? d.width + "px" : "";
    }); a.children.length > e.length; ) a.lastElementChild.remove();
    const u = this._pinOffsets();
    for (const d of e) {
      const h = t.querySelector(`th[data-header-cell-field-value="${D(d.field)}"]`) || t.querySelector(`th[data-field="${D(d.field)}"]`);
      if (!h) continue;
      const g = this.state.sortModel.find((v) => v.colId === d.field);
      A(h, {
        "data-sortable": d.sortable ? "true" : null,
        "data-filterable": d.filter ? "true" : null,
        "data-filter-active": this.state.filterModel[d.field] ? "true" : null,
        "data-sort": g?.sort || null,
        "data-pinned": d.pinned || null
      }), d.width && (h.style.width = d.width + "px"), h.style.left = d.pinned === "left" ? u.left[d.field] + "px" : "", h.style.right = d.pinned === "right" ? u.right[d.field] + "px" : "", this._ensureHeaderChrome(h, d, g);
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
      a || (a = f("input", { type: "checkbox", "aria-label": "Select all" }), a.addEventListener("change", (d) => {
        d.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(a));
      const c = this._displayList.filteredSorted.length, u = this.state.selection.size;
      a.checked = u > 0 && u >= c, a.indeterminate = u > 0 && u < c;
      return;
    }
    let s = e.querySelector(".sg-header-content");
    if (!s) {
      const a = e.textContent.trim();
      e.textContent = "", s = f("div", { class: "sg-header-content" }, [
        f("span", { class: "sg-header-label" }, a || t.headerName || t.field || "")
      ]), e.appendChild(s);
    }
    let r = s.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (r || (r = f("span", { class: "sg-sort-icon" }), s.appendChild(r)), i && this.state.sortModel.length > 1) {
        let a = s.querySelector(".sg-sort-index");
        a || (a = f("span", { class: "sg-sort-index" }), s.appendChild(a)), a.textContent = String(this.state.sortModel.indexOf(i) + 1);
      } else
        s.querySelector(".sg-sort-index")?.remove();
    else r && r.remove();
    let o = s.querySelector(".sg-filter-icon");
    t.filter ? o || (o = f("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), s.appendChild(o)) : o && o.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(f("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._displayList.pageRows;
    this._selKeys = this._computeCellSelKeys();
    const i = this.virtualValue || t.length > 200;
    let s = t, r = 0;
    if (i) {
      const d = this._viewport?.clientHeight || 400, h = this.state.rowHeight, g = Z(this.state.scrollTop, d, h, t.length, 8);
      r = g.first, s = t.slice(g.first, g.last);
    }
    const o = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((d) => {
      const h = d.dataset.rowId;
      h != null && o.set(h, d);
    });
    const a = document.createDocumentFragment(), c = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0, u = (d) => c + r + d + 1;
    if (i) {
      const d = this.state.rowHeight, h = r * d, g = (t.length - r - s.length) * d;
      a.appendChild(this._spacerRow(h, e.length)), s.forEach((v, y) => a.appendChild(this._buildRow(v, e, o, u(y)))), a.appendChild(this._spacerRow(g, e.length));
    } else
      s.forEach((d, h) => a.appendChild(this._buildRow(d, e, o, u(h))));
    this._tbody.replaceChildren(a);
  }
  _buildRow(e, t, i, s) {
    const r = String(this._rowId(e));
    let o = i.get(r);
    o || (o = f("tr")), o.dataset.rowId = r, o.classList.remove("sg-spacer");
    const a = this.state.selection.has(this._rowId(e));
    return A(o, { "data-selected": a ? "true" : null }), this._renderRow(o, e, t, s), o;
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const s = f("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return s.style.height = "0px", s.appendChild(f("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), s;
    }
    const i = f("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return i.style.height = e + "px", i.appendChild(f("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), i;
  }
  _renderRow(e, t, i, s) {
    e.innerHTML = "";
    const r = this._pinOffsets(), o = this._selKeys || { active: null, range: null }, a = String(this._rowId(t));
    for (const c of i) {
      const u = `${a}:${c.field}`, d = f("td", {
        "data-col-id": c.field,
        "data-pinned": c.pinned || null,
        "data-cell-active": o.active === u ? "true" : null,
        "data-cell-range": o.range && o.range.has(u) ? "true" : null
      });
      if (c.pinned === "left" ? d.style.left = r.left[c.field] + "px" : c.pinned === "right" && (d.style.right = r.right[c.field] + "px"), c._isRowNumber) {
        d.classList.add("sg-gutter-cell"), d.setAttribute("data-gutter", "true"), d.removeAttribute("data-cell-active"), d.removeAttribute("data-cell-range"), d.textContent = s != null ? String(s) : "", e.appendChild(d);
        continue;
      }
      if (c._isCheckbox) {
        d.classList.add("sg-checkbox-cell");
        const g = f("input", { type: "checkbox" });
        g.checked = this.state.selection.has(this._rowId(t)), d.appendChild(g), e.appendChild(d);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === c.field) {
        d.setAttribute("data-editing", "true");
        const g = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : b(t, c), { node: v, control: y } = this._buildEditor(c, g);
        d.appendChild(v);
        const w = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          y?.focus(), w || y?.select?.();
        });
      } else
        this._renderCellContent(d, t, c);
      e.appendChild(d);
    }
  }
  _renderCellContent(e, t, i) {
    if (i.cellRenderer) {
      const s = M(i.cellRenderer);
      if (s) {
        const r = b(t, i), o = C(t, i);
        (s.dataset.bind || s.dataset.bindText !== void 0) && (s.textContent = s.dataset.bind ? String(t[s.dataset.bind] ?? "") : o), s.dataset.bindAttr && s.setAttribute(s.dataset.bindAttr, r), s.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((a) => {
          a.dataset.bindText !== void 0 ? a.textContent = o : a.dataset.bind && (a.textContent = String(t[a.dataset.bind] ?? "")), a.dataset.bindAttr && a.setAttribute(a.dataset.bindAttr, r);
        }), e.appendChild(s);
        return;
      }
    }
    e.textContent = C(t, i);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, t) {
    if (e.cellEditor) {
      const s = M(e.cellEditor);
      if (s) {
        const r = s.matches?.("input,select,textarea") ? s : s.querySelector?.("[data-editor-input]") || s.querySelector?.("input,select,textarea");
        return r && (this._seedEditorValue(r, e, t), r.addEventListener("keydown", this._onEditorKey), r.addEventListener("blur", this._onEditorBlur)), { node: s, control: r };
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
    if (e.type === "number") i = f("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const s = t instanceof Date ? t : t ? new Date(t) : null, r = s ? s.toISOString().slice(0, 10) : "";
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
        this.clearCellSelection(), this.toggleRowSelection(i, o), p(this.element, "grid:rowClicked", { rowId: i, row: this.state.rowData.find((a) => this._rowId(a) === i), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (s) {
      const o = this.state.rowData.find((c) => this._rowId(c) === i), a = s.dataset.colId;
      p(this.element, "grid:cellClicked", { rowId: i, colId: a, value: o?.[a], event: e });
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
    this.toggleRowSelection(i, r), p(this.element, "grid:rowClicked", { rowId: i, row: this.state.rowData.find((o) => this._rowId(o) === i), event: e });
  }
  // ----- Cell selection (Numbers/Sheets-style: multi-range + active cell) -----
  _cellAt(e) {
    const t = e.closest?.("td"), i = e.closest?.("tr");
    return !t || !i || t.classList.contains("sg-checkbox-cell") || t.dataset.gutter === "true" || !t.dataset.colId || t.dataset.editing === "true" ? null : { rowId: this._coerceRowId(i.dataset.rowId), colId: t.dataset.colId };
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
    const t = Array.from(this.state.selection).map(String), i = new Set(t.includes(String(e)) ? t : [String(e)]), s = f("div", { class: "sg-drag-ghost sg-grid" }), r = f("table"), o = f("tbody");
    let a = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((u) => {
      if (i.has(u.dataset.rowId) && a < 6) {
        const d = u.cloneNode(!0);
        d.removeAttribute("data-selected"), d.querySelectorAll("td").forEach((h) => {
          h.style.left = "", h.style.right = "", h.removeAttribute("data-pinned"), h.removeAttribute("data-cell-active"), h.removeAttribute("data-cell-range");
        }), o.appendChild(d), a += 1;
      }
    }), r.appendChild(o), s.appendChild(r), i.size > a && s.appendChild(f("div", { class: "sg-drag-ghost-more" }, `+${i.size - a} more rows`)), s.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(s);
    const c = f("div", { class: "sg-drop-indicator" });
    document.body.appendChild(c), this._rowDrag = { ids: i, ghost: s, indicator: c, dropRowId: null, dropBefore: !0 }, document.body.classList.add("sg-row-dragging");
  }
  _updateDropIndicator(e) {
    const t = Array.from(this._tbody.querySelectorAll("tr[data-row-id]"));
    let i = null, s = !0;
    for (const c of t) {
      const u = c.getBoundingClientRect();
      if (e < u.top + u.height / 2) {
        i = c, s = !0;
        break;
      }
      i = c, s = !1;
    }
    if (!i) return;
    const r = i.getBoundingClientRect(), o = this._viewport.getBoundingClientRect(), a = this._rowDrag.indicator;
    a.style.left = `${o.left}px`, a.style.width = `${o.width}px`, a.style.top = `${(s ? r.top : r.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(i.dataset.rowId), this._rowDrag.dropBefore = s;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: i, dropRowId: s, dropBefore: r } = this._rowDrag;
    if (t.remove(), i.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, s == null || e.has(String(s))) return;
    const o = this.state.rowData, a = o.filter((d) => e.has(String(this._rowId(d)))), c = o.filter((d) => !e.has(String(this._rowId(d))));
    let u = c.findIndex((d) => this._rowId(d) === s);
    u < 0 ? u = c.length : r || (u += 1), c.splice(u, 0, ...a), this.state.rowData = c, this.state.sortModel = [], this.scheduleRender("data"), p(this.element, "grid:rowDragEnd", {
      ids: a.map((d) => this._rowId(d)),
      toRowId: s,
      before: r
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
    const t = this._displayList.pageRows, i = this._visibleCols(), s = (d) => t.findIndex((h) => this._rowId(h) === d), r = (d) => i.findIndex((h) => h.field === d), o = s(e.anchor.rowId), a = r(e.anchor.colId);
    if (o < 0 || a < 0) return null;
    const c = s(e.focus.rowId), u = r(e.focus.colId);
    return {
      r0: Math.min(o, c < 0 ? o : c),
      r1: Math.max(o, c < 0 ? o : c),
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
      const r = [];
      for (let o = e.c0; o <= e.c1; o++) {
        const a = e.cols[o];
        a && r.push(C(s, a));
      }
      t.push(r);
    }
    return t;
  }
  // Active cell key + union of all ranges' cells (active stays outlined, unfilled).
  _computeCellSelKeys() {
    const e = this._activeCell();
    if (!e) return { active: null, range: null };
    const t = `${e.rowId}:${e.colId}`, i = /* @__PURE__ */ new Set();
    for (const s of this.state.cellSel.ranges) {
      const r = this._rangeRect(s);
      if (r)
        for (let o = r.r0; o <= r.r1; o++) {
          const a = r.rows[o];
          if (a)
            for (let c = r.c0; c <= r.c1; c++) {
              const u = r.cols[c];
              if (!u) continue;
              const d = `${this._rowId(a)}:${u.field}`;
              d !== t && i.add(d);
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
          const r = i.rows[s];
          r && e.add(this._rowId(r));
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
    return this._visibleCols().filter((e) => !e._isCheckbox && !e._isRowNumber);
  }
  _moveActiveCell(e, t, i) {
    const s = this._displayList.pageRows, r = this._navCols();
    if (!s.length || !r.length) return;
    const o = (d, h, g) => Math.max(h, Math.min(d, g)), a = this._activeCell();
    let c = a ? s.findIndex((d) => this._rowId(d) === a.rowId) : 0, u = a ? r.findIndex((d) => d.field === a.colId) : 0;
    if (c < 0 && (c = 0), u < 0 && (u = 0), i && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
      const d = this.state.cellSel.ranges[this.state.cellSel.activeIdx], h = o(s.findIndex((v) => this._rowId(v) === d.focus.rowId) + e, 0, s.length - 1), g = o(r.findIndex((v) => v.field === d.focus.colId) + t, 0, r.length - 1);
      this._extendActiveRange({ rowId: this._rowId(s[h]), colId: r[g].field });
    } else {
      const d = o(c + e, 0, s.length - 1), h = o(u + t, 0, r.length - 1);
      this._setSingleCellSel({ rowId: this._rowId(s[d]), colId: r[h].field });
    }
    this._applyCellSelHighlight(), this._scrollActiveIntoView(), p(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
  }
  _selectAllCells() {
    const e = this._displayList.pageRows, t = this._navCols();
    !e.length || !t.length || (this.state.cellSel = {
      ranges: [{
        anchor: { rowId: this._rowId(e[0]), colId: t[0].field },
        focus: { rowId: this._rowId(e[e.length - 1]), colId: t[t.length - 1].field }
      }],
      activeIdx: 0
    }, this._applyCellSelHighlight(), p(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
  }
  // Clear the value of every selected, editable cell (Delete/Backspace).
  _clearSelectedCells() {
    let e = !1;
    for (const t of this.state.cellSel.ranges) {
      const i = this._rangeRect(t);
      if (i)
        for (let s = i.r0; s <= i.r1; s++) {
          const r = i.rows[s];
          if (r)
            for (let o = i.c0; o <= i.c1; o++) {
              const a = i.cols[o];
              if (!a || !a.editable || a._isCheckbox || a._isRowNumber) continue;
              const c = r[a.field];
              c === "" || c == null || (r[a.field] = "", e = !0, p(this.element, "grid:cellValueChanged", { rowId: this._rowId(r), colId: a.field, oldValue: c, newValue: "" }));
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
    const s = this._coerceRowId(t.dataset.rowId), r = i.dataset.colId;
    this.startEditingCell(s, r);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const i = this._visibleCols().filter((h) => h.editable && !h._isCheckbox), s = this._displayList.pageRows, r = s.findIndex((h) => this._rowId(h) === t.rowId), o = i.findIndex((h) => h.field === t.colId);
    if (!i.length || !s.length || r < 0 || o < 0) {
      this.stopEditing(!1);
      return;
    }
    const a = s.length * i.length, c = (r * i.length + o + e + a) % a, u = s[Math.floor(c / i.length)], d = i[c % i.length];
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
    const s = {};
    i = 0;
    for (let r = e.length - 1; r >= 0; r--) {
      const o = e[r];
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
m(x, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: L },
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
  cellSelection: { type: Boolean, default: !0 },
  // click=cell; modifier/checkbox=row
  rowDrag: { type: Boolean, default: !1 }
  // drag selected rows by the gutter to reorder
});
function ie(n, l) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (n[t] !== l[t]) return !1;
  return !0;
}
function se(n) {
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
function ne(n, l) {
  if (l === "number") {
    const e = Number(n);
    return Number.isFinite(e) ? e : n;
  }
  return l === "date" ? n : l === "boolean" ? n === "true" ? !0 : n === "false" ? !1 : null : n;
}
function D(n) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(n)) : String(n).replace(/["\\\n\r]/g, (l) => "\\" + l);
}
class E extends S {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    m(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, i = e.clientY;
      let s = !1;
      const r = (a) => {
        const c = Math.abs(a.clientX - t), u = Math.abs(a.clientY - i);
        !s && (c > 5 || u > 5) && (s = !0, document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", o), this._beginReorder(t));
      }, o = (a) => {
        document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", o), s || this.sort(a);
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
    let r = s;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const o = (c) => {
      const u = c.clientX;
      let d = i.length;
      for (let h = 0; h < i.length; h++) {
        const g = i[h].getBoundingClientRect();
        if (u < g.left + g.width / 2) {
          d = h;
          break;
        }
      }
      r = d > s ? d - 1 : d;
    }, a = () => {
      document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", r !== s && this.grid.moveColumn(this.fieldValue, r);
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
    const t = e.clientX, i = this.element.offsetWidth, s = (o) => this.grid.setColumnWidth(this.fieldValue, i + (o.clientX - t)), r = () => {
      document.removeEventListener("mousemove", s), document.removeEventListener("mouseup", r), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", s), document.addEventListener("mouseup", r), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
m(E, "values", {
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
class T extends S {
  connect() {
  }
}
class N extends S {
  connect() {
  }
}
class F extends S {
  connect() {
  }
}
class R extends S {
  constructor() {
    super(...arguments);
    m(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), i = e.paginationGetTotalPages(), s = e.paginationGetRowCount(), r = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const o = s === 0 ? 0 : t * r + 1, a = Math.min(s, o + r - 1);
        this.pageInfoTarget.textContent = s === 0 ? "0 rows" : `${o}–${a} of ${s}`;
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
m(R, "outlets", ["grid"]), m(R, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
function le(n) {
  const l = n ?? z.start();
  return l.register("grid", x), l.register("header-cell", E), l.register("row", T), l.register("cell", N), l.register("filter", F), l.register("pagination", R), l;
}
const re = {
  start: le,
  GridController: x,
  HeaderCellController: E,
  RowController: T,
  CellController: N,
  FilterController: F,
  PaginationController: R
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = re);
export {
  N as CellController,
  F as FilterController,
  x as GridController,
  E as HeaderCellController,
  R as PaginationController,
  T as RowController,
  re as default,
  le as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
