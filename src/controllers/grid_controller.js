import { Controller } from '@hotwired/stimulus';
import { buildDisplayList, computeWindow, formatValue, getValue, applyFilters, applyQuickFilter, applySort } from '../lib/model.js';
import { createGridApi } from '../lib/api.js';
import { el, setAttrs, cloneTemplate, emit } from '../lib/dom.js';

const DEFAULT_ROW_HEIGHT = 32;
const DEFAULT_PAGE_SIZE = 100;

export default class GridController extends Controller {
  static values = {
    rowData:        { type: Array, default: [] },
    rowDataUrl:     { type: String, default: '' },
    rowSelection:   { type: String, default: '' },          // '', 'single', 'multiple'
    rowMultiSelectWithClick: { type: Boolean, default: false },
    suppressRowClickSelection: { type: Boolean, default: false },
    pagination:     { type: Boolean, default: false },
    pageSize:       { type: Number, default: DEFAULT_PAGE_SIZE },
    rowHeight:      { type: Number, default: DEFAULT_ROW_HEIGHT },
    headerHeight:   { type: Number, default: 36 },
    virtual:        { type: Boolean, default: false },
    virtualThreshold: { type: Number, default: 200 },
    height:         { type: String, default: '' },          // CSS height, e.g. '480px'
    getRowId:       { type: String, default: 'id' },        // field name for row identity
    domLayout:      { type: String, default: '' },          // '' | 'autoHeight'
    serverSide:     { type: Boolean, default: false },       // rowData is one server page
    rowCount:       { type: Number, default: 0 },            // total rows on the server
    cellSelection:  { type: Boolean, default: true },        // click=cell; modifier/checkbox=row
    rowDrag:        { type: Boolean, default: false },        // drag selected rows by the gutter to reorder
  };

  initialize() {
    this.state = {
      rowData: [],
      columnDefs: [],
      sortModel: [],
      filterModel: {},
      quickFilter: '',
      selection: new Set(),
      focusedCell: null,
      cellSel: { ranges: [], activeIdx: -1 },   // multi-range: [{anchor,focus}], active range
      editing: null,
      pagination: { enabled: false, page: 0, pageSize: DEFAULT_PAGE_SIZE },
      scrollTop: 0,
      viewportHeight: 400,
    };
    this._displayList = { filteredSorted: [], pageRows: [], total: 0, totalPages: 1, page: 0 };
    this._renderPending = false;
    this._dirty = new Set();
    this._lastRenderedRowIds = new Set();
    // Per-column runtime overrides applied via gridApi (pinned/hidden/width).
    // Stored separately from columnDefs so they survive a header re-registration
    // (which could happen on a render that briefly detaches the <th>).
    this._runtimeOverrides = Object.create(null);
  }

  connect() {
    this.element.classList.add('sg-grid');
    if (this.heightValue) this.element.style.height = this.heightValue;
    // Make the grid focusable so it can receive keyboard navigation.
    if (!this.element.hasAttribute('tabindex')) this.element.tabIndex = 0;
    this.element.addEventListener('keydown', this._onGridKeydown);

    this.state.rowHeight = this.rowHeightValue;
    this.state.pagination = {
      enabled: this.paginationValue,
      page: 0,
      pageSize: this.pageSizeValue,
    };
    this.state.serverSide = this.serverSideValue;
    this.state.serverRowCount = this.rowCountValue;

    // Snapshot any user-supplied initial markup before we restructure.
    this._captureInitialMarkup();

    // Build the chrome (header/body viewport/footer skeleton).
    this._buildChrome();

    // Expose public API.
    this.element.gridApi = createGridApi(this);

    // Defer first render until child header-cell controllers have registered.
    queueMicrotask(() => this._initialLoad());
  }

  disconnect() {
    this.element.gridApi = null;
    this.element.removeEventListener('keydown', this._onGridKeydown);
    document.removeEventListener('mouseup', this._onCellMouseUp);
    document.removeEventListener('copy', this._onCopy);
    document.removeEventListener('mousemove', this._onRowDragMove);
    this._rowDrag?.ghost?.remove();
    this._rowDrag?.indicator?.remove();
  }

  // ----- Initial data + setup -----

  _captureInitialMarkup() {
    // If the user provided <thead> + <tbody> rows server-side, capture row data
    // from text content keyed by data-cell-col-id-value on each <td>.
    const existingTbody = this.element.querySelector('tbody');
    if (existingTbody) {
      this._initialBodyHTML = existingTbody.innerHTML;
      this._initialRows = Array.from(existingTbody.querySelectorAll('tr')).map((tr, idx) => {
        const row = {};
        const idAttr = tr.getAttribute('data-row-id') || tr.getAttribute('data-row-row-id-value');
        // Coerce the parsed id the same way event handlers coerce data-row-id,
        // so row lookups (edit, select) match. Otherwise a string "1" parsed
        // here never equals the numeric 1 produced by _coerceRowId on click.
        row[this.getRowIdValue] = idAttr != null ? this._coerceRowId(idAttr) : idx + 1;
        tr.querySelectorAll('td').forEach((td) => {
          const colId = td.getAttribute('data-cell-col-id-value') || td.getAttribute('data-col-id');
          if (colId) row[colId] = td.textContent.trim();
        });
        return row;
      });
      existingTbody.innerHTML = '';
    }
    // Snapshot pre-existing thead for later header rebuild.
    this._initialHead = this.element.querySelector('thead');
  }

  _buildChrome() {
    // Strategy: leave any user-supplied <table> in place (headers are controllers
    // attached to its <th> nodes), but ensure there is a <tbody data-grid-target="body">
    // and a viewport wrapping the table. Footer for pagination is appended after.
    let table = this.element.querySelector('table');
    if (!table) {
      table = el('table');
      const thead = el('thead');
      table.appendChild(thead);
      this.element.appendChild(table);
    }

    let tbody = table.querySelector('tbody');
    if (!tbody) {
      tbody = el('tbody');
      table.appendChild(tbody);
    }
    tbody.dataset.gridTarget = 'body';
    this._tbody = tbody;
    this._table = table;
    this._thead = table.querySelector('thead');

    // Wrap table in a scrollable viewport (so <thead> stays sticky inside it).
    if (!table.parentElement.classList.contains('sg-body-viewport')) {
      const viewport = el('div', { class: 'sg-body-viewport' });
      table.parentNode.insertBefore(viewport, table);
      viewport.appendChild(table);
      this._viewport = viewport;
    } else {
      this._viewport = table.parentElement;
    }

    if (this.domLayoutValue === 'autoHeight') {
      this._viewport.style.overflow = 'visible';
      this.element.style.height = 'auto';
    }

    // Pagination footer is rendered later; consumers may also bring their own.
    this._footer = null;
  }

  async _initialLoad() {
    // 1. Load data: rowData value > rowDataUrl > captured inline rows > [].
    if (this.rowDataValue && this.rowDataValue.length > 0) {
      this.state.rowData = this.rowDataValue;
    } else if (this.rowDataUrlValue) {
      try {
        const res = await fetch(this.rowDataUrlValue);
        this.state.rowData = await res.json();
      } catch (e) {
        console.error('[stimulus_grid] failed to fetch rowDataUrl', e);
        this.state.rowData = [];
      }
    } else if (this._initialRows && this._initialRows.length > 0) {
      this.state.rowData = this._initialRows;
    }

    // 2. Render. Headers are already there; refresh their visual state then build body.
    this._dirty.add('data');
    this._dirty.add('columns');
    this._render();
    this._attachBodyListeners();

    // 3. Fire ready.
    emit(this.element, 'grid:ready', { api: this.element.gridApi });
    emit(this.element, 'grid:rowDataChanged', { rows: this.state.rowData });
  }

  // Filter UI bridge — implemented by filter_controller, but the grid is the
  // single source of truth so it brokers the popover.
  openFilterFor(colId, anchorEl) {
    const col = this._colByField(colId);
    if (!col || !col.filter) return;
    // Close any existing popover.
    this._closeFilterPopover();
    const FilterPopover = require_filter_popover();
    if (!FilterPopover) {
      // Lazy import surface; we expose a minimal popover here as a fallback
      // so the grid stays usable even without filter_controller wired.
      this._openFallbackFilterPopover(col, anchorEl);
      return;
    }
  }

  _closeFilterPopover() {
    if (this._filterPopover) {
      this._filterPopover.remove();
      this._filterPopover = null;
      document.removeEventListener('mousedown', this._onDocMouseDown);
    }
  }

  _onDocMouseDown = (e) => {
    if (this._filterPopover && !this._filterPopover.contains(e.target)
        && !e.target.closest('.sg-filter-icon')) {
      this._closeFilterPopover();
    }
  };

  _openFallbackFilterPopover(col, anchorEl) {
    // Built-in popover so v0.1 has filters even before filter_controller binds.
    const current = this.state.filterModel[col.field] || {};
    const opts = filterOptionsFor(col.filter);
    const pop = el('div', { class: 'sg-filter-popover' });

    const select = el('select');
    opts.forEach((o) => select.append(new Option(o.label, o.value, false, o.value === current.type)));

    const inputType = col.filter === 'number' ? 'number'
      : col.filter === 'date' ? 'date'
      : 'text';
    const input = el('input', { type: inputType, value: current.value ?? '' });
    const input2 = el('input', { type: inputType, value: current.value2 ?? '', style: { display: 'none' } });

    const updateInputs = () => {
      const t = select.value;
      const needs2 = t === 'inRange';
      const needs1 = !(t === 'blank' || t === 'notBlank');
      input.style.display = needs1 ? '' : 'none';
      input2.style.display = needs2 ? '' : 'none';
    };
    select.addEventListener('change', updateInputs);
    updateInputs();

    const actions = el('div', { class: 'sg-filter-actions' });
    const clear = el('button', { type: 'button' }, 'Clear');
    const apply = el('button', { type: 'button', class: 'primary' }, 'Apply');
    actions.append(clear, apply);

    clear.addEventListener('click', () => {
      this.setColumnFilter(col.field, null);
      this._closeFilterPopover();
    });
    apply.addEventListener('click', () => {
      const t = select.value;
      const filter = (t === 'blank' || t === 'notBlank')
        ? { filterType: col.filter, type: t }
        : { filterType: col.filter, type: t, value: input.value, value2: input2.value || undefined };
      this.setColumnFilter(col.field, filter);
      this._closeFilterPopover();
    });

    pop.append(
      el('label', {}, 'Condition'),
      select,
      input,
      input2,
      actions,
    );

    document.body.appendChild(pop);
    const rect = anchorEl.getBoundingClientRect();
    pop.style.left = `${rect.left + window.scrollX}px`;
    pop.style.top = `${rect.bottom + window.scrollY + 2}px`;
    this._filterPopover = pop;
    document.addEventListener('mousedown', this._onDocMouseDown);
    input.focus();
  }

  // ----- Column registration (called by header_cell_controller) -----

  registerColumn(def, headerEl) {
    const existing = this.state.columnDefs.findIndex((c) => c.field === def.field);
    const overrides = this._runtimeOverrides[def.field] || {};
    const enriched = { ...def, ...overrides, _headerEl: headerEl };
    if (existing >= 0) {
      const old = this.state.columnDefs[existing];
      // No-op when nothing changed — breaks any latent reconnect → re-register loop.
      if (old._headerEl === headerEl && sameColDef(old, enriched)) return;
      this.state.columnDefs[existing] = enriched;
    } else {
      this.state.columnDefs.push(enriched);
    }
    this.scheduleRender('columns');
  }

  unregisterColumn(field) {
    this.state.columnDefs = this.state.columnDefs.filter((c) => c.field !== field);
    this.scheduleRender('columns');
  }

  // ----- Sort -----

  toggleSort(colId, append = false) {
    const idx = this.state.sortModel.findIndex((s) => s.colId === colId);
    let next;
    if (idx === -1) next = { colId, sort: 'asc' };
    else if (this.state.sortModel[idx].sort === 'asc') next = { colId, sort: 'desc' };
    else next = null;

    if (append) {
      if (idx >= 0) this.state.sortModel.splice(idx, 1);
      if (next) this.state.sortModel.push(next);
    } else {
      this.state.sortModel = next ? [next] : [];
    }
    this.scheduleRender('sort');
    emit(this.element, 'grid:sortChanged', { sortModel: this.state.sortModel });
  }

  setSortModel(model) {
    this.state.sortModel = Array.isArray(model) ? model.slice() : [];
    this.scheduleRender('sort');
    emit(this.element, 'grid:sortChanged', { sortModel: this.state.sortModel });
  }

  // ----- Filter -----

  setColumnFilter(colId, filter) {
    if (filter == null) delete this.state.filterModel[colId];
    else this.state.filterModel[colId] = filter;
    this.state.pagination.page = 0;
    this.scheduleRender('filter');
    emit(this.element, 'grid:filterChanged', { filterModel: { ...this.state.filterModel } });
  }

  setFilterModel(model) {
    this.state.filterModel = { ...(model || {}) };
    this.state.pagination.page = 0;
    this.scheduleRender('filter');
    emit(this.element, 'grid:filterChanged', { filterModel: { ...this.state.filterModel } });
  }

  setQuickFilter(text) {
    const next = (text == null ? '' : String(text));
    if (next === this.state.quickFilter) return;
    this.state.quickFilter = next;
    this.state.pagination.page = 0;
    this.scheduleRender('filter');
    emit(this.element, 'grid:filterChanged', {
      filterModel: { ...this.state.filterModel },
      quickFilter: next,
    });
  }

  getQuickFilter() { return this.state.quickFilter; }

  // ----- Selection -----

  toggleRowSelection(rowId, mode = 'single') {
    if (this.rowSelectionValue === '') return;
    const sel = this.state.selection;
    if (this.rowSelectionValue === 'single') {
      sel.clear();
      sel.add(rowId);
    } else if (mode === 'range' && this._lastSelectedId != null) {
      this._selectRange(this._lastSelectedId, rowId);
    } else if (mode === 'toggle') {
      if (sel.has(rowId)) sel.delete(rowId); else sel.add(rowId);
    } else {
      sel.clear();
      sel.add(rowId);
    }
    this._lastSelectedId = rowId;
    this.scheduleRender('selection');
    emit(this.element, 'grid:selectionChanged', {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(sel),
    });
  }

  setSelected(rowId, selected) {
    if (selected) this.state.selection.add(rowId);
    else this.state.selection.delete(rowId);
    this.scheduleRender('selection');
    emit(this.element, 'grid:selectionChanged', {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection),
    });
  }

  selectAll() {
    this._displayList.filteredSorted.forEach((r) => this.state.selection.add(this._rowId(r)));
    this.scheduleRender('selection');
    emit(this.element, 'grid:selectionChanged', {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection),
    });
  }

  deselectAll() {
    this.state.selection.clear();
    this.scheduleRender('selection');
    emit(this.element, 'grid:selectionChanged', { selectedRows: [], selectedIds: [] });
  }

  getSelectedRows() {
    const idSet = this.state.selection;
    return this.state.rowData.filter((r) => idSet.has(this._rowId(r)));
  }

  _selectRange(fromId, toId) {
    const list = this._displayList.filteredSorted;
    const fromIdx = list.findIndex((r) => this._rowId(r) === fromId);
    const toIdx = list.findIndex((r) => this._rowId(r) === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [a, b] = fromIdx <= toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
    for (let i = a; i <= b; i++) this.state.selection.add(this._rowId(list[i]));
  }

  // ----- Pagination -----

  goToPage(n) {
    const last = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(n, last));
    this.scheduleRender('page');
    emit(this.element, 'grid:paginationChanged', {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages(),
    });
  }

  setPageSize(n) {
    this.state.pagination.pageSize = Math.max(1, n);
    this.state.pagination.page = 0;
    this.scheduleRender('page');
    emit(this.element, 'grid:paginationChanged', {
      page: 0,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages(),
    });
  }

  totalPages() {
    if (!this.state.pagination.enabled) return 1;
    const fc = this.filteredCount();
    return Math.max(1, Math.ceil(fc / this.state.pagination.pageSize));
  }

  filteredCount() {
    // Server-side: the total lives on the server, not in rowData.
    if (this.state.serverSide) return this.state.serverRowCount;
    // Compute on-demand so consumers reading inside grid:filterChanged handlers
    // (which fire before the next render) get up-to-date counts.
    const cols = Object.fromEntries(this.state.columnDefs.map((c) => [c.field, c]));
    const visible = this.state.columnDefs.filter((c) => !c.hidden && !c._isCheckbox);
    let rows = applyFilters(this.state.rowData, this.state.filterModel, cols);
    rows = applyQuickFilter(rows, this.state.quickFilter, visible);
    return rows.length;
  }

  // Server-side row model: set the total row count so pagination reflects the
  // full table even though only one page is loaded client-side. No event is
  // emitted (callers pair this with setRowData, whose rowDataChanged refreshes
  // the pagination UI) — emitting paginationChanged here would loop grid-sync.
  setRowCount(n) {
    this.state.serverRowCount = Math.max(0, Number(n) || 0);
    this.scheduleRender('page');
  }

  lastPageIndex() { return this.totalPages() - 1; }

  // ----- Editing -----

  startEditingCell(rowId, colId, initialValue = undefined) {
    const col = this.state.columnDefs.find((c) => c.field === colId);
    if (!col || !col.editable) return;
    const row = this.state.rowData.find((r) => this._rowId(r) === rowId);
    if (!row) return;
    // `initialValue` (e.g. from type-to-edit) seeds the editor instead of the
    // current cell value.
    this.state.editing = { rowId, colId, originalValue: getValue(row, col), initialValue };
    this.scheduleRender('cells');
  }

  stopEditing(cancel = false) {
    if (!this.state.editing) return;
    const { rowId, colId, originalValue, draftValue } = this.state.editing;
    const td = this._tbody.querySelector(`tr[data-row-id="${cssEscape(rowId)}"] td[data-col-id="${cssEscape(colId)}"]`);
    let newValue = originalValue;
    if (!cancel && td) {
      const input = td.querySelector('[data-editor-input]') || td.querySelector('input,select,textarea');
      if (input) newValue = coerceByType(input.value, this._colByField(colId)?.type);
      else if (draftValue !== undefined) newValue = draftValue;
    }
    this.state.editing = null;
    if (!cancel && newValue !== originalValue) {
      const row = this.state.rowData.find((r) => this._rowId(r) === rowId);
      const oldValue = row[colId];
      row[colId] = newValue;
      emit(this.element, 'grid:cellValueChanged', { rowId, colId, oldValue, newValue });
    }
    this.scheduleRender('cells');
  }

  // ----- Column-level mutations from API or interactions -----

  setColumnVisible(colId, visible) {
    const c = this._colByField(colId);
    if (!c) return;
    c.hidden = !visible;
    this._runtimeOverrides[colId] = { ...(this._runtimeOverrides[colId] || {}), hidden: !visible };
    this.scheduleRender('columns');
    emit(this.element, 'grid:columnVisible', { colId, visible });
  }

  setColumnPinned(colId, pinned) {
    const c = this._colByField(colId);
    if (!c) return;
    const next = pinned || null;
    c.pinned = next;
    this._runtimeOverrides[colId] = { ...(this._runtimeOverrides[colId] || {}), pinned: next };
    this._reorderForPinning();
    this.scheduleRender('columns');
    emit(this.element, 'grid:columnPinned', { colId, pinned: next });
  }

  setColumnWidth(colId, width) {
    const c = this._colByField(colId);
    if (!c) return;
    const w = Math.max(c.minWidth || 40, Math.min(c.maxWidth || 4000, width));
    c.width = w;
    this._runtimeOverrides[colId] = { ...(this._runtimeOverrides[colId] || {}), width: w };
    this.scheduleRender('columns');
    emit(this.element, 'grid:columnResized', { colId, width: w });
  }

  moveColumn(colId, toIndex) {
    const fromIndex = this.state.columnDefs.findIndex((c) => c.field === colId);
    if (fromIndex < 0 || fromIndex === toIndex) return;
    const [m] = this.state.columnDefs.splice(fromIndex, 1);
    this.state.columnDefs.splice(toIndex, 0, m);
    this.scheduleRender('columns');
    emit(this.element, 'grid:columnMoved', { colId, fromIndex, toIndex });
  }

  autoSizeColumn(colId) {
    const c = this._colByField(colId);
    if (!c) return;
    const headerLen = (c.headerName || c.field || '').length;
    const sample = this.state.rowData.slice(0, 200);
    let maxLen = headerLen;
    for (const r of sample) {
      const len = String(formatValue(r, c) ?? '').length;
      if (len > maxLen) maxLen = len;
    }
    this.setColumnWidth(colId, Math.min(400, Math.max(60, maxLen * 8 + 24)));
  }

  sizeColumnsToFit() {
    const total = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!total) return;
    const visible = this._visibleCols();
    const sumWidth = visible.reduce((s, c) => s + (c.width || 150), 0);
    if (sumWidth === 0) return;
    const ratio = total / sumWidth;
    visible.forEach((c) => {
      c.width = Math.max(c.minWidth || 40, Math.floor((c.width || 150) * ratio));
    });
    this.scheduleRender('columns');
  }

  _reorderForPinning() {
    const left = this.state.columnDefs.filter((c) => c.pinned === 'left');
    const right = this.state.columnDefs.filter((c) => c.pinned === 'right');
    const center = this.state.columnDefs.filter((c) => !c.pinned);
    this.state.columnDefs = [...left, ...center, ...right];
  }

  // ----- Data mutations -----

  setRowData(rows) {
    this.state.rowData = Array.isArray(rows) ? rows : [];
    this.state.selection.clear();
    // Server-side: rowData is just the current page; grid-sync owns the page
    // index, so don't reset it here (that would fight server pagination).
    if (!this.state.serverSide) this.state.pagination.page = 0;
    this.scheduleRender('data');
    emit(this.element, 'grid:rowDataChanged', { rows: this.state.rowData });
  }

  applyTransaction(tx) {
    const added = []; const updated = []; const removed = [];
    const byId = new Map(this.state.rowData.map((r) => [this._rowId(r), r]));
    (tx.remove || []).forEach((r) => {
      const id = this._rowId(r);
      if (byId.delete(id)) removed.push(r);
    });
    (tx.update || []).forEach((r) => {
      const id = this._rowId(r);
      if (byId.has(id)) { byId.set(id, { ...byId.get(id), ...r }); updated.push(r); }
    });
    (tx.add || []).forEach((r) => {
      const id = this._rowId(r);
      if (!byId.has(id)) { byId.set(id, r); added.push(r); }
    });
    this.state.rowData = Array.from(byId.values());
    this.scheduleRender('data');
    emit(this.element, 'grid:rowDataChanged', { rows: this.state.rowData });
    return { added, updated, removed };
  }

  setColumnDefs(defs) {
    this.state.columnDefs = defs.map((d) => ({ ...d }));
    this.scheduleRender('columns');
  }

  refresh() { this.scheduleRender('cells'); }

  // ----- Export -----

  getDataAsCsv({ columnSeparator = ',', onlySelected = false } = {}) {
    const cols = this._visibleCols().filter((c) => !c._isCheckbox);
    const rows = onlySelected ? this.getSelectedRows() : this._displayList.filteredSorted;
    const escape = (s) => /[",\n\r]/.test(s) ? `"${String(s).replace(/"/g, '""')}"` : String(s);
    const lines = [cols.map((c) => escape(c.headerName || c.field)).join(columnSeparator)];
    for (const r of rows) {
      lines.push(cols.map((c) => escape(formatValue(r, c))).join(columnSeparator));
    }
    return lines.join('\n');
  }

  exportDataAsCsv({ fileName = 'export.csv', ...rest } = {}) {
    const csv = this.getDataAsCsv(rest);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = el('a', { href: url, download: fileName });
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    return csv;
  }

  // ----- Render pipeline -----

  scheduleRender(stage) {
    this._dirty.add(stage);
    if (this._renderPending) return;
    this._renderPending = true;
    requestAnimationFrame(() => {
      this._renderPending = false;
      this._render();
    });
  }

  _render() {
    const dirty = this._dirty;
    this._dirty = new Set();
    // Anything affecting rows requires recomputing the display list.
    if (dirty.has('data') || dirty.has('filter') || dirty.has('sort') || dirty.has('page') || dirty.size === 0) {
      this._displayList = buildDisplayList({
        rowData: this.state.rowData,
        columnDefs: this.state.columnDefs,
        sortModel: this.state.sortModel,
        filterModel: this.state.filterModel,
        quickFilter: this.state.quickFilter,
        pagination: this.state.pagination,
        serverSide: this.state.serverSide,
        serverRowCount: this.state.serverRowCount,
      });
    }
    if (dirty.has('columns') || dirty.has('sort') || dirty.has('filter') || dirty.has('selection')) this._renderHeader();
    this._renderBody();
    this._renderPagination();
  }

  _renderHeader() {
    if (!this._thead) return;
    const visible = this._visibleCols();
    const row = this._thead.querySelector('tr') || (() => {
      const r = el('tr'); this._thead.appendChild(r); return r;
    })();

    const existingThs = new Map();
    Array.from(row.querySelectorAll('th')).forEach((th) => {
      const colId = th.getAttribute('data-header-cell-field-value') || th.getAttribute('data-field');
      if (colId) existingThs.set(colId, th);
    });

    // Only mutate DOM structure when the visible column ORDER or SET differs
    // from what's already in the row. Avoids detaching + reattaching <th>
    // controllers on every render (which would trigger Stimulus disconnect →
    // header_cell.disconnect → unregisterColumn → scheduleRender → loop).
    const currentOrder = Array.from(row.children)
      .map((th) => th.getAttribute('data-header-cell-field-value') || th.getAttribute('data-field'))
      .filter(Boolean);
    const desiredOrder = visible.map((c) => c.field);
    const orderMatches = currentOrder.length === desiredOrder.length
      && currentOrder.every((f, i) => f === desiredOrder[i]);

    if (!orderMatches) {
      // Detach without using innerHTML='' so the elements aren't fully removed
      // mid-tick (which Stimulus could observe as a disconnect/connect cycle).
      const ths = [];
      for (const col of visible) {
        let th = existingThs.get(col.field);
        if (!th) {
          th = el('th', {
            'data-field': col.field,
            'data-synth': 'true',
          }, [el('div', { class: 'sg-header-content' }, [
            el('span', { class: 'sg-header-label' }, col.headerName || col.field || ''),
          ])]);
        }
        ths.push(th);
      }
      row.replaceChildren(...ths);
    }

    // Always refresh the colgroup so col widths reflect current state.
    let colgroup = this._table.querySelector('colgroup');
    if (!colgroup) {
      colgroup = el('colgroup');
      this._table.insertBefore(colgroup, this._thead);
    }
    const cols = Array.from(colgroup.children);
    visible.forEach((col, i) => {
      let colNode = cols[i];
      if (!colNode) { colNode = el('col'); colgroup.appendChild(colNode); }
      colNode.style.width = col.width ? col.width + 'px' : '';
    });
    while (colgroup.children.length > visible.length) colgroup.lastElementChild.remove();

    // Always update each th's state-driven attrs + chrome (no structure churn).
    const pin = this._pinOffsets();
    for (const col of visible) {
      const th = row.querySelector(`th[data-header-cell-field-value="${cssEscape(col.field)}"]`)
        || row.querySelector(`th[data-field="${cssEscape(col.field)}"]`);
      if (!th) continue;
      const sortEntry = this.state.sortModel.find((s) => s.colId === col.field);
      setAttrs(th, {
        'data-sortable': col.sortable ? 'true' : null,
        'data-filterable': col.filter ? 'true' : null,
        'data-filter-active': this.state.filterModel[col.field] ? 'true' : null,
        'data-sort': sortEntry?.sort || null,
        'data-pinned': col.pinned || null,
      });
      if (col.width) th.style.width = col.width + 'px';
      th.style.left = col.pinned === 'left' ? pin.left[col.field] + 'px' : '';
      th.style.right = col.pinned === 'right' ? pin.right[col.field] + 'px' : '';
      this._ensureHeaderChrome(th, col, sortEntry);
    }
  }

  _ensureHeaderChrome(th, col, sortEntry) {
    if (col._isRowNumber) {
      th.classList.add('sg-gutter-header');
      th.textContent = '';   // blank corner, like a spreadsheet
      return;
    }
    if (col._isCheckbox) {
      th.classList.add('sg-checkbox-header');
      let cb = th.querySelector('input[type="checkbox"]');
      if (!cb) {
        cb = el('input', { type: 'checkbox', 'aria-label': 'Select all' });
        cb.addEventListener('change', (e) => {
          if (e.target.checked) this.selectAll();
          else this.deselectAll();
        });
        th.textContent = '';
        th.appendChild(cb);
      }
      const total = this._displayList.filteredSorted.length;
      const selCount = this.state.selection.size;
      cb.checked = selCount > 0 && selCount >= total;
      cb.indeterminate = selCount > 0 && selCount < total;
      return;
    }
    let content = th.querySelector('.sg-header-content');
    if (!content) {
      const userText = th.textContent.trim();
      th.textContent = '';
      content = el('div', { class: 'sg-header-content' }, [
        el('span', { class: 'sg-header-label' }, userText || col.headerName || col.field || ''),
      ]);
      th.appendChild(content);
    }
    let sortIcon = content.querySelector('.sg-sort-icon');
    if (col.sortable) {
      if (!sortIcon) {
        sortIcon = el('span', { class: 'sg-sort-icon' });
        content.appendChild(sortIcon);
      }
      if (sortEntry && this.state.sortModel.length > 1) {
        let idx = content.querySelector('.sg-sort-index');
        if (!idx) { idx = el('span', { class: 'sg-sort-index' }); content.appendChild(idx); }
        idx.textContent = String(this.state.sortModel.indexOf(sortEntry) + 1);
      } else {
        content.querySelector('.sg-sort-index')?.remove();
      }
    } else if (sortIcon) {
      sortIcon.remove();
    }
    let filterIcon = content.querySelector('.sg-filter-icon');
    if (col.filter) {
      if (!filterIcon) {
        filterIcon = el('span', {
          class: 'sg-filter-icon',
          'data-action': 'click->header-cell#openFilter',
          title: 'Filter',
        });
        content.appendChild(filterIcon);
      }
    } else if (filterIcon) {
      filterIcon.remove();
    }
    if (col.resizable !== false && !th.querySelector('.sg-resize-handle') && !col._isCheckbox) {
      th.appendChild(el('span', {
        class: 'sg-resize-handle',
        'data-action': 'mousedown->header-cell#startResize',
      }));
    }
  }

  _renderBody() {
    if (!this._tbody) return;
    const cols = this._visibleCols();
    const allRows = this._displayList.pageRows;
    this._selKeys = this._computeCellSelKeys();   // cell range highlight lookup

    // Decide whether to virtualise. Virtualisation is auto-on whenever the
    // current display list exceeds the threshold, regardless of pagination —
    // a page size larger than the viewport still benefits from windowing.
    const virtual = this.virtualValue || allRows.length > 200;

    let windowed = allRows;
    let firstIdx = 0;
    if (virtual) {
      const viewportHeight = this._viewport?.clientHeight || 400;
      const rh = this.state.rowHeight;
      const win = computeWindow(this.state.scrollTop, viewportHeight, rh, allRows.length, 8);
      firstIdx = win.first;
      windowed = allRows.slice(win.first, win.last);
    }

    const existing = new Map();
    Array.from(this._tbody.children).forEach((tr) => {
      const id = tr.dataset.rowId;
      if (id != null) existing.set(id, tr);
    });

    const fragment = document.createDocumentFragment();
    // 1-based row number shown in the gutter: pagination page offset + virtual
    // window offset + position. (Server-side keeps pagination.enabled + page.)
    const pageOffset = this.state.pagination.enabled
      ? this.state.pagination.page * this.state.pagination.pageSize : 0;
    const rowNumOf = (i) => pageOffset + firstIdx + i + 1;

    if (virtual) {
      const rh = this.state.rowHeight;
      const topPx = firstIdx * rh;
      const bottomPx = (allRows.length - firstIdx - windowed.length) * rh;
      fragment.appendChild(this._spacerRow(topPx, cols.length));
      windowed.forEach((row, i) => fragment.appendChild(this._buildRow(row, cols, existing, rowNumOf(i))));
      fragment.appendChild(this._spacerRow(bottomPx, cols.length));
    } else {
      windowed.forEach((row, i) => fragment.appendChild(this._buildRow(row, cols, existing, rowNumOf(i))));
    }
    this._tbody.replaceChildren(fragment);
  }

  _buildRow(row, cols, existing, rowNum) {
    const id = String(this._rowId(row));
    let tr = existing.get(id);
    if (!tr) tr = el('tr');
    tr.dataset.rowId = id;
    tr.classList.remove('sg-spacer');
    const selected = this.state.selection.has(this._rowId(row));
    setAttrs(tr, { 'data-selected': selected ? 'true' : null });
    this._renderRow(tr, row, cols, rowNum);
    return tr;
  }

  _spacerRow(heightPx, colSpan) {
    if (heightPx <= 0) {
      // Still need a 0-height marker so we keep tbody children counts stable.
      const tr = el('tr', { class: 'sg-spacer', 'aria-hidden': 'true' });
      tr.style.height = '0px';
      tr.appendChild(el('td', { colspan: String(colSpan), style: { height: '0px', padding: '0', border: '0' } }));
      return tr;
    }
    const tr = el('tr', { class: 'sg-spacer', 'aria-hidden': 'true' });
    tr.style.height = heightPx + 'px';
    tr.appendChild(el('td', { colspan: String(colSpan), style: { height: heightPx + 'px', padding: '0', border: '0' } }));
    return tr;
  }

  _renderRow(tr, row, cols, rowNum) {
    // Rebuild cells in column order. Cheap because table-layout is fixed.
    tr.innerHTML = '';
    const pin = this._pinOffsets();
    const selKeys = this._selKeys || { active: null, range: null };
    const rowKey = String(this._rowId(row));
    for (const col of cols) {
      const key = `${rowKey}:${col.field}`;
      const td = el('td', {
        'data-col-id': col.field,
        'data-pinned': col.pinned || null,
        'data-cell-active': selKeys.active === key ? 'true' : null,
        'data-cell-range': selKeys.range && selKeys.range.has(key) ? 'true' : null,
      });
      if (col.pinned === 'left') td.style.left = pin.left[col.field] + 'px';
      else if (col.pinned === 'right') td.style.right = pin.right[col.field] + 'px';
      if (col._isRowNumber) {
        // Spreadsheet-style gutter: shows the 1-based row number; clicking it
        // selects the row (handled in _onBodyClick via data-gutter).
        td.classList.add('sg-gutter-cell');
        td.setAttribute('data-gutter', 'true');
        td.removeAttribute('data-cell-active');
        td.removeAttribute('data-cell-range');
        td.textContent = rowNum != null ? String(rowNum) : '';
        tr.appendChild(td);
        continue;
      }
      if (col._isCheckbox) {
        td.classList.add('sg-checkbox-cell');
        const cb = el('input', { type: 'checkbox' });
        cb.checked = this.state.selection.has(this._rowId(row));
        td.appendChild(cb);
        tr.appendChild(td);
        continue;
      }
      const editing = this.state.editing &&
        this.state.editing.rowId === this._rowId(row) &&
        this.state.editing.colId === col.field;
      if (editing) {
        td.setAttribute('data-editing', 'true');
        const seed = this.state.editing.initialValue !== undefined
          ? this.state.editing.initialValue : getValue(row, col);
        const { node, control } = this._buildEditor(col, seed);
        td.appendChild(node);
        const typed = this.state.editing.initialValue !== undefined;
        queueMicrotask(() => { control?.focus(); if (typed) { /* cursor at end */ } else control?.select?.(); });
      } else {
        this._renderCellContent(td, row, col);
      }
      tr.appendChild(td);
    }
  }

  _renderCellContent(td, row, col) {
    if (col.cellRenderer) {
      const node = cloneTemplate(col.cellRenderer);
      if (node) {
        // Simple data-binding: any descendant with [data-bind="<key>"] gets the value
        // of that key from the row; a node with [data-bind-text] gets formatted value;
        // a node with [data-bind-attr="<name>"] gets value as attribute.
        const value = getValue(row, col);
        const formatted = formatValue(row, col);
        if (node.dataset.bind || node.dataset.bindText !== undefined) {
          node.textContent = node.dataset.bind ? String(row[node.dataset.bind] ?? '') : formatted;
        }
        if (node.dataset.bindAttr) node.setAttribute(node.dataset.bindAttr, value);
        node.querySelectorAll('[data-bind], [data-bind-attr], [data-bind-text]').forEach((n) => {
          if (n.dataset.bindText !== undefined) n.textContent = formatted;
          else if (n.dataset.bind) n.textContent = String(row[n.dataset.bind] ?? '');
          if (n.dataset.bindAttr) n.setAttribute(n.dataset.bindAttr, value);
        });
        td.appendChild(node);
        return;
      }
    }
    td.textContent = formatValue(row, col);
  }

  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(col, value) {
    if (col.cellEditor) {
      const node = cloneTemplate(col.cellEditor);
      if (node) {
        const control = node.matches?.('input,select,textarea')
          ? node
          : (node.querySelector?.('[data-editor-input]') || node.querySelector?.('input,select,textarea'));
        if (control) {
          this._seedEditorValue(control, col, value);
          control.addEventListener('keydown', this._onEditorKey);
          control.addEventListener('blur', this._onEditorBlur);
        }
        return { node, control };
      }
    }
    const input = this._buildEditorInput(col, value);
    return { node: input, control: input };
  }

  _seedEditorValue(control, col, value) {
    if (col.type === 'date' && value) {
      const d = value instanceof Date ? value : new Date(value);
      control.value = Number.isNaN(d?.getTime?.()) ? (value ?? '') : d.toISOString().slice(0, 10);
    } else if (col.type === 'boolean') {
      control.value = value === true ? 'true' : value === false ? 'false' : '';
    } else {
      control.value = value ?? '';
    }
  }

  _buildEditorInput(col, value) {
    let input;
    if (col.type === 'number') input = el('input', { type: 'number', value: value ?? '' });
    else if (col.type === 'date') {
      const d = value instanceof Date ? value : (value ? new Date(value) : null);
      const iso = d ? d.toISOString().slice(0, 10) : '';
      input = el('input', { type: 'date', value: iso });
    } else if (col.type === 'boolean') {
      input = el('select');
      input.append(new Option('—', ''),
        new Option('true', 'true', value === true, value === true),
        new Option('false', 'false', value === false, value === false));
    } else {
      input = el('input', { type: 'text', value: value ?? '' });
    }
    input.addEventListener('keydown', this._onEditorKey);
    input.addEventListener('blur', this._onEditorBlur);
    return input;
  }

  _renderPagination() {
    if (!this.state.pagination.enabled) return;
    // Update any pagination_controllers via outlet by simply re-emitting state.
    // (The pagination_controller listens for grid:paginationChanged.)
  }

  // ----- Event delegation (clicks on rendered tbody) -----

  // Stimulus actions on tbody — wired in _buildChrome by adding data-action.
  // For simplicity we add native listeners here.
  _attachBodyListeners() {
    if (this._listenersAttached) return;
    this._listenersAttached = true;
    this._tbody.addEventListener('click', (e) => this._onBodyClick(e));
    this._tbody.addEventListener('dblclick', (e) => this._onBodyDblClick(e));
    this._tbody.addEventListener('mousedown', this._onCellMouseDown);
    this._tbody.addEventListener('mouseover', this._onCellMouseOver);
    document.addEventListener('mouseup', this._onCellMouseUp);
    document.addEventListener('copy', this._onCopy);
    this._viewport.addEventListener('scroll', this._onScroll, { passive: true });
  }

  _onScroll = () => {
    this.state.scrollTop = this._viewport.scrollTop;
    if (this.virtualValue || this._displayList.pageRows.length > 200) {
      this.scheduleRender('scroll');
    }
  };

  _onBodyClick(e) {
    const tr = e.target.closest('tr');
    if (!tr) return;
    // Clicks inside an active editor must not trigger selection. Selection
    // toggles render the row, which rebuilds the cell and destroys the live
    // <input>, so the user can't position their cursor in the editor.
    if (e.target.closest('td[data-editing="true"]')) return;
    const rowId = this._coerceRowId(tr.dataset.rowId);
    const td = e.target.closest('td');
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(rowId, 'toggle');
      return;
    }
    // Row-number gutter → ROW selection (click=replace, shift=range, cmd=toggle),
    // exactly like a spreadsheet row header.
    if (td && td.dataset.gutter === 'true') {
      // A row drag shouldn't also fire a select-click.
      if (this._rowDragMoved) { this._rowDragMoved = false; return; }
      if (this.rowSelectionValue !== '') {
        const mode = e.shiftKey ? 'range' : (e.metaKey || e.ctrlKey) ? 'toggle' : 'replace';
        this.clearCellSelection();
        this.toggleRowSelection(rowId, mode);
        emit(this.element, 'grid:rowClicked', { rowId, row: this.state.rowData.find((r) => this._rowId(r) === rowId), event: e });
      }
      this._cellDragMoved = false;
      return;
    }
    if (td) {
      const row = this.state.rowData.find((r) => this._rowId(r) === rowId);
      const colId = td.dataset.colId;
      emit(this.element, 'grid:cellClicked', { rowId, colId, value: row?.[colId], event: e });
    }
    if (this.cellSelectionValue) {
      // Cell selection is handled on mousedown/drag. A plain click also clears
      // any row selection (fresh cell focus). Cmd/Shift build CELL ranges and
      // must not touch row selection. Row selection lives on the gutter.
      if (this._cellDragMoved) { this._cellDragMoved = false; return; }
      const plain = !e.shiftKey && !(e.metaKey || e.ctrlKey);
      if (plain && this.state.selection.size) this.deselectAll();
      return;
    }
    // Legacy row-click selection (cell-selection disabled).
    if (this.suppressRowClickSelectionValue || this.rowSelectionValue === '') {
      this._cellDragMoved = false;
      return;
    }
    if (this._cellDragMoved) { this._cellDragMoved = false; return; }
    const mode = e.shiftKey ? 'range' : (e.metaKey || e.ctrlKey || this.rowMultiSelectWithClickValue) ? 'toggle' : 'replace';
    this.toggleRowSelection(rowId, mode);
    emit(this.element, 'grid:rowClicked', { rowId, row: this.state.rowData.find((r) => this._rowId(r) === rowId), event: e });
  }

  // ----- Cell selection (Numbers/Sheets-style: multi-range + active cell) -----

  _cellAt(target) {
    const td = target.closest?.('td');
    const tr = target.closest?.('tr');
    if (!td || !tr || td.classList.contains('sg-checkbox-cell') || td.dataset.gutter === 'true' || !td.dataset.colId) return null;
    if (td.dataset.editing === 'true') return null;
    return { rowId: this._coerceRowId(tr.dataset.rowId), colId: td.dataset.colId };
  }

  _activeCell() {
    const r = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
    return r ? r.anchor : null;
  }

  _setSingleCellSel(cell) { this.state.cellSel = { ranges: [{ anchor: cell, focus: cell }], activeIdx: 0 }; }
  _addCellRange(cell) {
    this.state.cellSel.ranges.push({ anchor: cell, focus: cell });
    this.state.cellSel.activeIdx = this.state.cellSel.ranges.length - 1;
  }
  _extendActiveRange(cell) {
    const r = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
    if (r) r.focus = cell; else this._setSingleCellSel(cell);
  }
  clearCellSelection() {
    this.state.cellSel = { ranges: [], activeIdx: -1 };
    this._applyCellSelHighlight();
  }

  _onCellMouseDown = (e) => {
    if (e.button !== 0) return;
    // Row drag: grabbing a gutter cell starts a potential row move.
    if (this.rowDragValue) {
      const gutterTd = e.target.closest?.('td[data-gutter="true"]');
      if (gutterTd) {
        const tr = gutterTd.closest('tr');
        this._rowDragPending = { rowId: this._coerceRowId(tr.dataset.rowId), x: e.clientX, y: e.clientY };
        this._rowDragMoved = false;
        document.addEventListener('mousemove', this._onRowDragMove);
        return;   // don't start a cell selection from the gutter
      }
    }
    const cell = this._cellAt(e.target);
    if (!cell) return;
    const mod = e.metaKey || e.ctrlKey;
    if (e.shiftKey && this._activeCell()) {
      this._extendActiveRange(cell);            // Shift → extend the active range
    } else if (mod) {
      this._addCellRange(cell);                  // Cmd/Ctrl → new non-contiguous range
      this._cellDragging = true;
    } else {
      this._setSingleCellSel(cell);              // plain → single cell
      this._cellDragging = true;
    }
    this._cellDragMoved = false;
    this._focusGrid();
    // Update the highlight IN PLACE — re-rendering the tbody here would detach
    // the just-pressed cell before the click fires and can swallow the click.
    this._applyCellSelHighlight();
    emit(this.element, 'grid:cellSelectionChanged', this.getCellSelectionDetail());
  };

  _onCellMouseOver = (e) => {
    if (!this._cellDragging) return;
    const cell = this._cellAt(e.target);
    if (!cell) return;
    const r = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
    if (r && r.focus.rowId === cell.rowId && r.focus.colId === cell.colId) return;
    this._extendActiveRange(cell);
    this._cellDragMoved = true;
    this._applyCellSelHighlight();
    emit(this.element, 'grid:cellSelectionChanged', this.getCellSelectionDetail());
  };

  _onCellMouseUp = () => {
    this._cellDragging = false;
    if (this._rowDragPending) {
      document.removeEventListener('mousemove', this._onRowDragMove);
      if (this._rowDrag) this._finishRowDrag();
      this._rowDragPending = null;
    }
  };

  // ----- Row drag-and-drop (reorder) with a ghost preview -----

  _onRowDragMove = (e) => {
    const pend = this._rowDragPending;
    if (!pend) return;
    if (!this._rowDrag) {
      if (Math.abs(e.clientY - pend.y) < 5 && Math.abs(e.clientX - pend.x) < 5) return;
      this._startRowDrag(pend.rowId);
    }
    if (this._rowDrag) {
      this._rowDragMoved = true;
      this._rowDrag.ghost.style.left = `${e.clientX + 14}px`;
      this._rowDrag.ghost.style.top = `${e.clientY + 10}px`;
      this._updateDropIndicator(e.clientY);
    }
  };

  _startRowDrag(grabbedId) {
    // Drag the whole selection if the grabbed row is in it, else just that row.
    const selIds = Array.from(this.state.selection).map(String);
    const ids = new Set(selIds.includes(String(grabbedId)) ? selIds : [String(grabbedId)]);

    // Ghost: a floating clone of the dragged rows' cells (capped).
    const ghost = el('div', { class: 'sg-drag-ghost sg-grid' });
    const table = el('table');
    const tbody = el('tbody');
    let shown = 0;
    this._tbody.querySelectorAll('tr[data-row-id]').forEach((tr) => {
      if (ids.has(tr.dataset.rowId) && shown < 6) {
        const clone = tr.cloneNode(true);
        clone.removeAttribute('data-selected');
        clone.querySelectorAll('td').forEach((td) => {
          td.style.left = ''; td.style.right = '';
          td.removeAttribute('data-pinned');
          td.removeAttribute('data-cell-active');
          td.removeAttribute('data-cell-range');
        });
        tbody.appendChild(clone);
        shown += 1;
      }
    });
    table.appendChild(tbody);
    ghost.appendChild(table);
    if (ids.size > shown) ghost.appendChild(el('div', { class: 'sg-drag-ghost-more' }, `+${ids.size - shown} more rows`));
    ghost.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`;
    document.body.appendChild(ghost);

    const indicator = el('div', { class: 'sg-drop-indicator' });
    document.body.appendChild(indicator);

    this._rowDrag = { ids, ghost, indicator, dropRowId: null, dropBefore: true };
    document.body.classList.add('sg-row-dragging');
  }

  _updateDropIndicator(y) {
    const rowsEls = Array.from(this._tbody.querySelectorAll('tr[data-row-id]'));
    let target = null;
    let before = true;
    for (const tr of rowsEls) {
      const r = tr.getBoundingClientRect();
      if (y < r.top + r.height / 2) { target = tr; before = true; break; }
      target = tr; before = false;
    }
    if (!target) return;
    const r = target.getBoundingClientRect();
    const bodyRect = this._viewport.getBoundingClientRect();
    const ind = this._rowDrag.indicator;
    ind.style.left = `${bodyRect.left}px`;
    ind.style.width = `${bodyRect.width}px`;
    ind.style.top = `${(before ? r.top : r.bottom) - 1}px`;
    this._rowDrag.dropRowId = this._coerceRowId(target.dataset.rowId);
    this._rowDrag.dropBefore = before;
  }

  _finishRowDrag() {
    const { ids, ghost, indicator, dropRowId, dropBefore } = this._rowDrag;
    ghost.remove();
    indicator.remove();
    document.body.classList.remove('sg-row-dragging');
    this._rowDrag = null;
    if (dropRowId == null || ids.has(String(dropRowId))) return;   // dropped onto self / nowhere

    const data = this.state.rowData;
    const dragged = data.filter((r) => ids.has(String(this._rowId(r))));
    const rest = data.filter((r) => !ids.has(String(this._rowId(r))));
    let idx = rest.findIndex((r) => this._rowId(r) === dropRowId);
    if (idx < 0) idx = rest.length; else if (!dropBefore) idx += 1;
    rest.splice(idx, 0, ...dragged);
    this.state.rowData = rest;
    // Manual order now governs — drop any active sort so the reorder sticks.
    this.state.sortModel = [];
    this.scheduleRender('data');
    emit(this.element, 'grid:rowDragEnd', {
      ids: dragged.map((r) => this._rowId(r)), toRowId: dropRowId, before: dropBefore,
    });
  }

  // Toggle the active/range data-attrs on the existing cell DOM without
  // rebuilding the tbody (so in-flight mouse interactions aren't disrupted).
  _applyCellSelHighlight() {
    const keys = this._computeCellSelKeys();
    this._selKeys = keys;
    if (!this._tbody) return;
    this._tbody.querySelectorAll('td[data-col-id]').forEach((td) => {
      const tr = td.parentElement;
      const key = `${tr && tr.dataset.rowId}:${td.dataset.colId}`;
      if (keys.active === key) td.setAttribute('data-cell-active', 'true');
      else td.removeAttribute('data-cell-active');
      if (keys.range && keys.range.has(key)) td.setAttribute('data-cell-range', 'true');
      else td.removeAttribute('data-cell-range');
    });
  }

  // Copy the active cell range to the clipboard as TSV (rows \n, cols \t).
  _onCopy = (e) => {
    if (this.state.editing) return;
    const ae = document.activeElement;
    if (ae && /^(input|textarea|select)$/i.test(ae.tagName) && !this.element.contains(ae)) return;
    const rect = this._activeRect();
    if (!rect) return;
    const tsv = this._cellRangeRows(rect)
      .map((r) => r.map((v) => String(v ?? '')).join('\t')).join('\n');
    if (!tsv) return;
    e.clipboardData?.setData('text/plain', tsv);
    e.preventDefault();
  };

  // Rectangle (display indices) for a {anchor,focus} range, or null.
  _rangeRect(range) {
    if (!range) return null;
    const rows = this._displayList.pageRows;
    const cols = this._visibleCols();
    const ri = (id) => rows.findIndex((r) => this._rowId(r) === id);
    const ci = (f) => cols.findIndex((c) => c.field === f);
    const ar = ri(range.anchor.rowId), ac = ci(range.anchor.colId);
    if (ar < 0 || ac < 0) return null;
    const fr = ri(range.focus.rowId), fc = ci(range.focus.colId);
    return {
      r0: Math.min(ar, fr < 0 ? ar : fr), r1: Math.max(ar, fr < 0 ? ar : fr),
      c0: Math.min(ac, fc < 0 ? ac : fc), c1: Math.max(ac, fc < 0 ? ac : fc),
      rows, cols,
    };
  }

  _activeRect() { return this._rangeRect(this.state.cellSel.ranges[this.state.cellSel.activeIdx]); }

  _cellRangeRows(rect = this._activeRect()) {
    if (!rect) return [];
    const out = [];
    for (let r = rect.r0; r <= rect.r1; r++) {
      const row = rect.rows[r];
      if (!row) continue;
      const line = [];
      for (let c = rect.c0; c <= rect.c1; c++) {
        const col = rect.cols[c];
        if (col) line.push(formatValue(row, col));
      }
      out.push(line);
    }
    return out;
  }

  // Active cell key + union of all ranges' cells (active stays outlined, unfilled).
  _computeCellSelKeys() {
    const active = this._activeCell();
    if (!active) return { active: null, range: null };
    const activeKey = `${active.rowId}:${active.colId}`;
    const range = new Set();
    for (const rg of this.state.cellSel.ranges) {
      const rect = this._rangeRect(rg);
      if (!rect) continue;
      for (let r = rect.r0; r <= rect.r1; r++) {
        const row = rect.rows[r];
        if (!row) continue;
        for (let c = rect.c0; c <= rect.c1; c++) {
          const col = rect.cols[c];
          if (!col) continue;
          const key = `${this._rowId(row)}:${col.field}`;
          if (key !== activeKey) range.add(key);
        }
      }
    }
    return { active: activeKey, range };
  }

  getCellSelectionDetail() {
    const rect = this._activeRect();
    return {
      active: this._activeCell(),
      ranges: this.state.cellSel.ranges.length,
      rowCount: rect ? rect.r1 - rect.r0 + 1 : 0,
      colCount: rect ? rect.c1 - rect.c0 + 1 : 0,
    };
  }

  // Row ids covered by any cell range.
  getCellSelectionRowIds() {
    const ids = new Set();
    for (const rg of this.state.cellSel.ranges) {
      const rect = this._rangeRect(rg);
      if (!rect) continue;
      for (let r = rect.r0; r <= rect.r1; r++) {
        const row = rect.rows[r];
        if (row) ids.add(this._rowId(row));
      }
    }
    return Array.from(ids);
  }

  _focusGrid() {
    // For keyboard navigation: make sure the grid (not the page) holds focus.
    if (document.activeElement !== this.element && !this.element.contains(document.activeElement)) {
      try { this.element.focus({ preventScroll: true }); } catch { /* ignore */ }
    }
  }

  // ----- Keyboard navigation (Numbers/Sheets-style) -----

  _navCols() {
    return this._visibleCols().filter((c) => !c._isCheckbox && !c._isRowNumber);
  }

  _onGridKeydown = (e) => {
    if (!this.cellSelectionValue) return;
    if (this.state.editing) return;                 // editor handles its own keys
    const ae = document.activeElement;
    if (ae && /^(input|textarea|select)$/i.test(ae.tagName) && this.element.contains(ae)) return;

    const key = e.key;
    const mod = e.metaKey || e.ctrlKey;

    if (mod && key.toLowerCase() === 'a') {           // select all
      e.preventDefault();
      if (this.rowSelectionValue !== '') {            // grids with row selection → all rows
        this.clearCellSelection();
        this.deselectAll();
        this.selectAll();
      } else {
        this._selectAllCells();                        // otherwise → all cells
      }
      return;
    }
    if (mod) return;                                  // leave Cmd+C/V/Z to their handlers

    const DIRS = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (DIRS[key]) {
      e.preventDefault();
      const [dr, dc] = DIRS[key];
      this._moveActiveCell(dr, dc, e.shiftKey);
      return;
    }
    if (key === 'Tab') { e.preventDefault(); this._moveActiveCell(0, e.shiftKey ? -1 : 1, false); return; }
    if (key === 'Enter') {                            // edit the active cell
      const a = this._activeCell();
      if (a) { e.preventDefault(); this.startEditingCell(a.rowId, a.colId); }
      return;
    }
    if (key === 'Escape') { this.clearCellSelection(); return; }
    if (key === 'Delete' || key === 'Backspace') {
      if (this._clearSelectedCells()) e.preventDefault();
      return;
    }
    // A printable character starts editing the active cell, seeded with it.
    if (key.length === 1 && !e.altKey) {
      const a = this._activeCell();
      if (!a) return;
      const col = this._colByField(a.colId);
      if (!col || !col.editable) return;
      e.preventDefault();
      this.startEditingCell(a.rowId, a.colId, key);
    }
  };

  _moveActiveCell(dr, dc, extend) {
    const rows = this._displayList.pageRows;
    const cols = this._navCols();
    if (!rows.length || !cols.length) return;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, hi));
    const active = this._activeCell();
    let ri = active ? rows.findIndex((r) => this._rowId(r) === active.rowId) : 0;
    let ci = active ? cols.findIndex((c) => c.field === active.colId) : 0;
    if (ri < 0) ri = 0;
    if (ci < 0) ci = 0;
    if (extend && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
      const rg = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      const fr = clamp(rows.findIndex((r) => this._rowId(r) === rg.focus.rowId) + dr, 0, rows.length - 1);
      const fc = clamp(cols.findIndex((c) => c.field === rg.focus.colId) + dc, 0, cols.length - 1);
      this._extendActiveRange({ rowId: this._rowId(rows[fr]), colId: cols[fc].field });
    } else {
      const nr = clamp(ri + dr, 0, rows.length - 1);
      const nc = clamp(ci + dc, 0, cols.length - 1);
      this._setSingleCellSel({ rowId: this._rowId(rows[nr]), colId: cols[nc].field });
    }
    this._applyCellSelHighlight();
    this._scrollActiveIntoView();
    emit(this.element, 'grid:cellSelectionChanged', this.getCellSelectionDetail());
  }

  _selectAllCells() {
    const rows = this._displayList.pageRows;
    const cols = this._navCols();
    if (!rows.length || !cols.length) return;
    this.state.cellSel = {
      ranges: [{
        anchor: { rowId: this._rowId(rows[0]), colId: cols[0].field },
        focus: { rowId: this._rowId(rows[rows.length - 1]), colId: cols[cols.length - 1].field },
      }],
      activeIdx: 0,
    };
    this._applyCellSelHighlight();
    emit(this.element, 'grid:cellSelectionChanged', this.getCellSelectionDetail());
  }

  // Clear the value of every selected, editable cell (Delete/Backspace).
  _clearSelectedCells() {
    let any = false;
    for (const rg of this.state.cellSel.ranges) {
      const rect = this._rangeRect(rg);
      if (!rect) continue;
      for (let r = rect.r0; r <= rect.r1; r++) {
        const row = rect.rows[r];
        if (!row) continue;
        for (let c = rect.c0; c <= rect.c1; c++) {
          const col = rect.cols[c];
          if (!col || !col.editable || col._isCheckbox || col._isRowNumber) continue;
          const oldValue = row[col.field];
          if (oldValue === '' || oldValue == null) continue;
          row[col.field] = '';
          any = true;
          emit(this.element, 'grid:cellValueChanged', { rowId: this._rowId(row), colId: col.field, oldValue, newValue: '' });
        }
      }
    }
    if (any) this.scheduleRender('cells');
    return any;
  }

  _scrollActiveIntoView() {
    const td = this._tbody?.querySelector('td[data-cell-active="true"]');
    td?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  _onBodyDblClick(e) {
    const tr = e.target.closest('tr');
    const td = e.target.closest('td');
    if (!tr || !td) return;
    // Dblclick inside the active editor should select a word, not restart editing
    // (which would re-render and lose the input).
    if (td.dataset.editing === 'true') return;
    const rowId = this._coerceRowId(tr.dataset.rowId);
    const colId = td.dataset.colId;
    this.startEditingCell(rowId, colId);
  }

  _onEditorKey = (e) => {
    if (!this.state.editing) return;
    if (e.key === 'Enter') { e.preventDefault(); this.stopEditing(false); }
    else if (e.key === 'Escape') { e.preventDefault(); this.stopEditing(true); }
    else if (e.key === 'Tab') { e.preventDefault(); this._tabToEditableCell(e.shiftKey ? -1 : 1); }
  };

  _onEditorBlur = () => {
    // Suppress the blur that fires when a Tab move detaches the old editor —
    // otherwise it would immediately close the editor we're moving into.
    if (this._navigatingEditor) return;
    if (this.state.editing) this.stopEditing(false);
  };

  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(dir) {
    const cur = this.state.editing;
    if (!cur) return;
    const cols = this._visibleCols().filter((c) => c.editable && !c._isCheckbox);
    const rows = this._displayList.pageRows;
    const rowIdx = rows.findIndex((r) => this._rowId(r) === cur.rowId);
    const colIdx = cols.findIndex((c) => c.field === cur.colId);
    if (!cols.length || !rows.length || rowIdx < 0 || colIdx < 0) {
      this.stopEditing(false);
      return;
    }
    const n = rows.length * cols.length;
    const flat = (rowIdx * cols.length + colIdx + dir + n) % n;
    const nextRow = rows[Math.floor(flat / cols.length)];
    const nextCol = cols[flat % cols.length];

    this._navigatingEditor = true;
    this.stopEditing(false);                                  // commit current cell
    this.startEditingCell(this._rowId(nextRow), nextCol.field); // open the adjacent one
    // Clear the guard after the render (scheduled above via rAF) has run, so
    // the detach-blur of the old input is suppressed but real blurs aren't.
    requestAnimationFrame(() => { this._navigatingEditor = false; });
  }

  // Wire editor listeners whenever a cell mounts an input.
  // Done lazily via MutationObserver on tbody (cheap because tbody is small per page).

  // ----- Helpers -----

  _visibleCols() {
    return this.state.columnDefs.filter((c) => !c.hidden);
  }

  _pinOffsets() {
    const cols = this._visibleCols();
    const left = {};
    let off = 0;
    for (const c of cols) {
      if (c.pinned === 'left') { left[c.field] = off; off += (c.width || 150); }
    }
    const right = {};
    off = 0;
    for (let i = cols.length - 1; i >= 0; i--) {
      const c = cols[i];
      if (c.pinned === 'right') { right[c.field] = off; off += (c.width || 150); }
    }
    return { left, right };
  }

  _colByField(field) {
    return this.state.columnDefs.find((c) => c.field === field);
  }

  _rowId(row) {
    return row?.[this.getRowIdValue] ?? row?.id ?? row;
  }

  _coerceRowId(s) {
    if (s == null) return s;
    const n = Number(s);
    return Number.isFinite(n) && String(n) === s ? n : s;
  }
}

function sameColDef(a, b) {
  const keys = ['headerName','type','sortable','filter','editable','width','minWidth','maxWidth','pinned','hidden','resizable','cellRenderer','cellEditor','_isCheckbox','_isRowNumber'];
  for (const k of keys) if (a[k] !== b[k]) return false;
  return true;
}

function filterOptionsFor(type) {
  if (type === 'number' || type === 'date') {
    return [
      { value: 'equals', label: 'Equals' },
      { value: 'notEqual', label: 'Not equal' },
      { value: 'lessThan', label: 'Less than' },
      { value: 'greaterThan', label: 'Greater than' },
      { value: 'inRange', label: 'In range' },
      { value: 'blank', label: 'Blank' },
      { value: 'notBlank', label: 'Not blank' },
    ];
  }
  if (type === 'boolean') {
    return [
      { value: 'equals', label: 'Equals' },
    ];
  }
  return [
    { value: 'contains', label: 'Contains' },
    { value: 'notContains', label: 'Not contains' },
    { value: 'equals', label: 'Equals' },
    { value: 'notEqual', label: 'Not equal' },
    { value: 'startsWith', label: 'Starts with' },
    { value: 'endsWith', label: 'Ends with' },
    { value: 'blank', label: 'Blank' },
    { value: 'notBlank', label: 'Not blank' },
  ];
}

function require_filter_popover() {
  // Reserved: filter_controller may register a richer popover. For v0.1 we use
  // the grid's built-in fallback unconditionally.
  return null;
}

function coerceByType(value, type) {
  if (type === 'number') {
    const n = Number(value);
    return Number.isFinite(n) ? n : value;
  }
  if (type === 'date') return value;
  if (type === 'boolean') return value === 'true' ? true : value === 'false' ? false : null;
  return value;
}

// Minimal CSS.escape polyfill so attribute selectors with numeric/string ids work.
function cssEscape(v) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(String(v));
  return String(v).replace(/["\\\n\r]/g, (c) => '\\' + c);
}
