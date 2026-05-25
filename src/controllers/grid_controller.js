import { Controller } from '@hotwired/stimulus';
import { buildDisplayList, computeWindow, formatValue, getValue, applyFilters, applyQuickFilter, applySort, aggregateRange, buildHeaderLayout } from '../lib/model.js';
import { createGridApi } from '../lib/api.js';
import { el, setAttrs, cloneTemplate, emit } from '../lib/dom.js';

const DEFAULT_ROW_HEIGHT = 32;
const DEFAULT_PAGE_SIZE = 100;

// FontAwesome 7 glyphs used for the disclosure caret on group rows and the
// column filter button. fill="currentColor" so the colour is themable via
// CSS (default: var(--sg-icon-accent) set on .sg-grid).
const CHEVRON_SVG = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>';
const FILTER_SVG = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>';

// Events that should retrigger a save when persistKey is set. Anything the
// user changes through the UI or API and would expect to "stick" across
// reloads belongs here.
const PERSIST_EVENTS = [
  'grid:columnMoved', 'grid:columnPinned', 'grid:columnResized', 'grid:columnVisible',
  'grid:columnRowGroupChanged', 'grid:columnPivotChanged', 'grid:pivotModeChanged',
  'grid:columnValueChanged', 'grid:columnGroupsChanged',
  'grid:sortChanged', 'grid:filterChanged',
];

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
    rowGroupCols:        { type: Array,  default: [] },      // fields to group rows by (in hierarchy order)
    aggFuncs:            { type: Object, default: {} },      // { field: 'sum'|'avg'|'min'|'max'|'count'|'first'|'last' }
    groupDefaultExpanded:{ type: Number, default: -1 },      // -1 all expanded · 0 none · N first-N levels
    groupReorderColumns: { type: Boolean, default: true },   // (inline mode) float grouped columns to the front while grouping
    groupDisplayType:    { type: String,  default: 'singleColumn' }, // 'singleColumn' (auto Group col on left) | 'inline' (label in grouped col)
    statusBar:           { type: Boolean, default: false },                            // bottom footer: row counts + range aggregates
    statusBarAggs:       { type: Array,   default: ['count', 'sum', 'avg', 'min', 'max'] }, // which aggs to show for a cell range (subset, in order)
    pivotMode:           { type: Boolean, default: false },                            // reshape into a pivot table (rowGroupCols × pivotCols)
    pivotCols:           { type: Array,   default: [] },                               // fields whose unique values become columns
    sidePanel:           { type: Boolean, default: false },                            // right-side tool panel for groups/pivots/values
    columnGroups:        { type: Array,   default: [] },                               // multi-row headers: [{headerName, children:[field,...]}]
    pinnedBottomRow:     { type: Boolean, default: false },                            // sticky bottom row with grand totals (from aggFuncs)
    persistKey:          { type: String,  default: '' },                                // when non-empty, auto-save/restore state to localStorage under sgrid:<key>
    masterDetail:        { type: Boolean, default: false },                            // enable expandable detail rows under each master row
    detailTemplate:      { type: String,  default: '' },                                // id of a <template> cloned into each expanded detail row
    detailRowsKey:       { type: String,  default: '' },                                // master-row field holding the array of nested detail rows
    detailRowHeight:     { type: Number,  default: 240 },                              // CSS pixel height for the detail-row shell
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
      group: { cols: [], aggs: {}, defaultExpanded: -1 },
    };
    this._displayList = { filteredSorted: [], pageRows: [], total: 0, totalPages: 1, page: 0 };
    this._renderPending = false;
    this._dirty = new Set();
    this._lastRenderedRowIds = new Set();
    // Per-column runtime overrides applied via gridApi (pinned/hidden/width).
    // Stored separately from columnDefs so they survive a header re-registration
    // (which could happen on a render that briefly detaches the <th>).
    this._runtimeOverrides = Object.create(null);
    // Explicit per-group expand/collapse overrides (groupId -> bool); groups not
    // present here fall back to state.group.defaultExpanded by level.
    this._groupExpanded = new Map();
    // Master/detail: which master row ids currently show a detail panel
    // beneath them. Stringified ids so it survives the Number/String coercion
    // we apply on data-row-id parsing.
    this._detailExpanded = new Set();
    // gridApi handle per mounted nested detail grid, keyed by master row id.
    // Lets us cleanly tear them down on collapse / data refresh.
    this._detailGrids = new Map();
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
    this.state.group = {
      cols: Array.isArray(this.rowGroupColsValue) ? this.rowGroupColsValue.slice() : [],
      aggs: { ...(this.aggFuncsValue || {}) },
      defaultExpanded: this.groupDefaultExpandedValue,
      displayType: this.groupDisplayTypeValue || 'singleColumn',
    };
    // Pivot model lives alongside grouping: rowGroupCols are the vertical axis,
    // pivotCols the horizontal, and state.group.aggs doubles as the value
    // columns (the field → aggFunc map is reused so existing API still works).
    this.state.pivot = {
      mode: !!this.pivotModeValue,
      cols: Array.isArray(this.pivotColsValue) ? this.pivotColsValue.slice() : [],
    };

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
    this._thead?.removeEventListener('contextmenu', this._onHeaderContextMenu);
    this._closeColumnMenu();
    this._teardownPersistence();
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
        // Master/detail: server-rendered rows can carry their nested rows as a
        // JSON string in data-row-detail-rows-value. The Rails partial uses
        // this to feed an inner grid without re-fetching from JS.
        const detailRows = tr.getAttribute('data-row-detail-rows-value');
        if (detailRows && this.detailRowsKeyValue) {
          try { row[this.detailRowsKeyValue] = JSON.parse(detailRows); }
          catch (e) { /* leave row[detailRowsKey] unset */ }
        }
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

    // Optional status bar — Sheets-style footer with row counts and aggregates
    // over the active cell range. Lives at the bottom of the grid flex column,
    // so external pagination (a sibling of .sg-grid) still appears below it.
    if (this.statusBarValue) {
      this._statusBar = el('div', { class: 'sg-status-bar', role: 'status' });
      this._statusBar.append(
        el('div', { class: 'sg-status-section sg-status-left' }),
        el('div', { class: 'sg-status-section sg-status-right' }),
      );
      this.element.appendChild(this._statusBar);
      this._lastRangeAggs = null;
    } else {
      this._statusBar = null;
    }

    // Optional side panel — Excel-style tool drawer on the right edge that
    // drives row groups, pivot columns, value aggregations and column
    // visibility via drag-and-drop. When enabled we wrap the body viewport
    // (+ status bar, if any) in an .sg-main flex column, then mount the panel
    // as an <aside> sibling so .sg-grid can lay them out side-by-side.
    if (this.sidePanelValue) {
      const main = el('div', { class: 'sg-main' });
      this._viewport.parentNode.insertBefore(main, this._viewport);
      main.appendChild(this._viewport);
      if (this._statusBar) main.appendChild(this._statusBar);
      this._main = main;
      this._sidePanel = el('aside', {
        class: 'sg-side-panel',
        'data-controller': 'side-panel',
      });
      this.element.appendChild(this._sidePanel);
      this.element.classList.add('sg-has-side-panel');
    } else {
      this._main = null;
      this._sidePanel = null;
    }

    // Right-click on any leaf header opens a context menu with quick actions
    // for that column (pin / autosize / group / pivot / aggregate / hide).
    // Mounting once here is enough — the menu reads live state on each open.
    this._thead?.addEventListener('contextmenu', this._onHeaderContextMenu);
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

    // 3. Persistence (opt-in via data-grid-persist-key-value). Restore BEFORE
    // wiring the save listener so the initial restore doesn't trigger a
    // self-save loop, then attach the debounced auto-save.
    this._restorePersistedState();
    this._setupPersistence();

    // 4. Fire ready.
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
    // When a col is already registered (e.g. <th> re-attaches during a header
    // reorder, or a persisted state restore moves it), preserve any runtime
    // overrides on the existing col that the header markup doesn't carry:
    // hidden, pinned, and width are user-controlled and would otherwise get
    // clobbered back to the markup defaults.
    const old = existing >= 0 ? this.state.columnDefs[existing] : null;
    const carryover = old ? {
      ...(old.hidden != null ? { hidden: old.hidden } : {}),
      ...(old.pinned       ? { pinned: old.pinned } : {}),
      ...(old.width != null ? { width: old.width } : {}),
    } : {};
    const enriched = { ...def, ...overrides, ...carryover, _headerEl: headerEl };
    if (existing >= 0) {
      const oldRef = this.state.columnDefs[existing];
      // No-op when nothing changed — breaks any latent reconnect → re-register loop.
      if (oldRef._headerEl === headerEl && sameColDef(oldRef, enriched)) return;
      this.state.columnDefs[existing] = enriched;
    } else {
      this.state.columnDefs.push(enriched);
    }
    this.scheduleRender('columns');
  }

  unregisterColumn(field) {
    // header_cell#disconnect fires not only on real removal but also on
    // transient moves — `replaceChildren` reorders generate childList mutations
    // whose removedNodes include moved children, and Stimulus reads that as a
    // disconnect. If the <th> is still in our thead after the mutation, treat
    // this as a move and keep the column registered (otherwise columnDefs would
    // shuffle to the new DOM order on every reorder, breaking grouping which
    // relies on stable registration order).
    if (this._thead?.querySelector(`th[data-header-cell-field-value="${cssEscape(field)}"]`)) return;
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
    this._displayList.filteredSorted.forEach((r) => { if (!r.__sgGroup) this.state.selection.add(this._rowId(r)); });
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
    for (let i = a; i <= b; i++) { if (!list[i].__sgGroup) this.state.selection.add(this._rowId(list[i])); }
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
    // Use the underlying columnDefs so CSV always exports the real data columns,
    // including any grouped columns hidden by the auto group column.
    const cols = this.state.columnDefs.filter((c) => !c.hidden && !c._isCheckbox);
    const rows = (onlySelected ? this.getSelectedRows() : this._displayList.filteredSorted).filter((r) => !r.__sgGroup && !r.__sgDetail);
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
    if (dirty.has('data') || dirty.has('filter') || dirty.has('sort') || dirty.has('page') || dirty.has('group') || dirty.has('pivot') || dirty.size === 0) {
      this._displayList = buildDisplayList({
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
        pivotCols: this.state.pivot.cols,
      });
    }
    if (dirty.has('columns') || dirty.has('sort') || dirty.has('filter') || dirty.has('selection') || dirty.has('group') || dirty.has('pivot')) this._renderHeader();
    this._renderBody();
    this._renderPagination();
    this._renderStatusBar();
  }

  _renderHeader() {
    if (!this._thead) return;
    const visible = this._visibleCols();

    // Compute the header matrix. With no groups + no pivot-multi-row, depth=1
    // and we fall through to the simple single-row path that preserves
    // header-cell controllers in their natural slots. depth>1 takes the
    // multi-row path that stacks group headers above the leaf row.
    const layout = buildHeaderLayout(visible, this._headerLayoutOpts());
    if (layout.depth > 1) {
      this._renderHeaderMultiRow(visible, layout);
    } else {
      this._renderHeaderSingleRow(visible);
    }
    this._renderColgroup(visible);
  }

  // Aggregate the options we hand to buildHeaderLayout (auto-derived pivot
  // groups when in pivot mode, plus any user-declared columnGroups).
  _headerLayoutOpts() {
    const opts = { columnGroups: this.columnGroupsValue || null };
    if (this.state.pivot?.mode && this._displayList?.pivot) {
      opts.pivotCols = (this.state.pivot.cols || [])
        .map((f) => this._colByField(f))
        .filter(Boolean);
      opts.valueConfigs = Object.entries(this.state.group.aggs || {})
        .map(([field, aggFunc]) => ({ col: this._colByField(field), aggFunc }))
        .filter((vc) => vc.col);
    }
    return opts;
  }

  _renderColgroup(visible) {
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
  }

  _renderHeaderSingleRow(visible) {
    // Hoist any registered <th>s out of deeper rows into the first row BEFORE
    // collapsing — otherwise removing the deeper <tr>s would detach those
    // <th>s, fire header-cell#disconnect, and silently drop their cols from
    // state.columnDefs. Synthetic group-header <th>s (no field attr) can die
    // with their row.
    if (this._thead.children.length > 1) {
      const firstRow = this._thead.firstElementChild;
      for (let i = 1; i < this._thead.children.length; i++) {
        const tr = this._thead.children[i];
        Array.from(tr.children).forEach((th) => {
          if (th.hasAttribute('data-header-cell-field-value') || th.hasAttribute('data-field')) {
            firstRow.appendChild(th);
          }
        });
      }
      while (this._thead.children.length > 1) this._thead.lastElementChild.remove();
    }
    const row = this._thead.querySelector('tr') || (() => {
      const r = el('tr'); this._thead.appendChild(r); return r;
    })();

    const existingThs = new Map();
    Array.from(this._thead.querySelectorAll('th')).forEach((th) => {
      const colId = th.getAttribute('data-header-cell-field-value') || th.getAttribute('data-field');
      if (colId) existingThs.set(colId, th);
    });

    // Always keep every registered column's <th> in the row. Hidden cols (e.g.
    // grouped columns under singleColumn display) get `display: none` and are
    // appended at the end so their header-cell controllers stay connected —
    // a removed <th> would disconnect → unregisterColumn → drop from columnDefs
    // (then buildDisplayList's columnsByField wouldn't see the field, and group
    // resolution would silently degrade to a shorter hierarchy).
    const visibleFieldSet = new Set(visible.map((c) => c.field));
    const hiddenRegistered = this.state.columnDefs.filter((c) => !visibleFieldSet.has(c.field));
    const orderedCols = [...visible, ...hiddenRegistered];

    const currentOrder = Array.from(row.children)
      .map((th) => th.getAttribute('data-header-cell-field-value') || th.getAttribute('data-field'))
      .filter(Boolean);
    const desiredOrder = orderedCols.map((c) => c.field);
    const orderMatches = currentOrder.length === desiredOrder.length
      && currentOrder.every((f, i) => f === desiredOrder[i]);

    if (!orderMatches) {
      const ths = [];
      for (const col of orderedCols) {
        let th = existingThs.get(col.field);
        if (!th) {
          th = el('th', {
            'data-field': col.field,
            'data-synth': 'true',
          }, [el('div', { class: 'sg-header-content' }, [
            el('span', { class: 'sg-header-label' }, col.headerName || col.field || ''),
          ])]);
        } else {
          // A th coming back from a previous multi-row layout may carry stale
          // rowspan from when it lived in row 0 — clear it.
          th.removeAttribute('rowspan');
          th.removeAttribute('colspan');
        }
        ths.push(th);
      }
      row.replaceChildren(...ths);
    } else {
      // Same order; still strip any stale span attrs.
      Array.from(row.children).forEach((th) => {
        th.removeAttribute('rowspan');
        th.removeAttribute('colspan');
      });
    }
    // Apply visibility every render (covers visibility-only changes where the
    // order didn't shift).
    Array.from(row.children).forEach((th) => {
      const f = th.getAttribute('data-header-cell-field-value') || th.getAttribute('data-field');
      if (f != null) th.style.display = visibleFieldSet.has(f) ? '' : 'none';
    });

    // Always update each th's state-driven attrs + chrome (no structure churn).
    const pin = this._pinOffsets();
    for (const col of visible) {
      const th = row.querySelector(`th[data-header-cell-field-value="${cssEscape(col.field)}"]`)
        || row.querySelector(`th[data-field="${cssEscape(col.field)}"]`);
      if (!th) continue;
      this._applyLeafThState(th, col, pin);
    }
  }

  // Multi-row header: <thead> gets `layout.depth` rows of group headers
  // followed by the leaf headers, then one hidden row holding any registered
  // <th>s that aren't currently visible (so their controllers stay mounted).
  _renderHeaderMultiRow(visible, layout) {
    const existingThs = new Map();
    Array.from(this._thead.querySelectorAll('th')).forEach((th) => {
      const colId = th.getAttribute('data-header-cell-field-value') || th.getAttribute('data-field');
      if (colId) existingThs.set(colId, th);
    });

    const trs = [];
    const visibleFieldSet = new Set(visible.map((c) => c.field));
    const pin = this._pinOffsets();

    for (const rowCells of layout.rows) {
      const tr = el('tr');
      for (const cell of rowCells) {
        if (cell.kind === 'group') {
          tr.appendChild(el('th', {
            class: 'sg-header-group',
            colspan: String(cell.colspan),
            'data-group-header': 'true',
          }, cell.label || ''));
          continue;
        }
        // Leaf: reuse the existing <th> if there is one so the header-cell
        // controller stays connected; otherwise synthesize a fresh one for
        // synthetic cols (group / pivot result).
        const col = cell.col;
        let th = existingThs.get(col.field);
        if (!th) {
          th = el('th', {
            'data-field': col.field,
            'data-synth': 'true',
          }, [el('div', { class: 'sg-header-content' }, [
            el('span', { class: 'sg-header-label' }, cell.label || col.headerName || col.field || ''),
          ])]);
        }
        // When the col's effective label changed (e.g. pivot grouping pulled a
        // shorter label out), update the existing label span.
        if (cell.label) {
          const labelSpan = th.querySelector('.sg-header-label');
          if (labelSpan && labelSpan.textContent !== cell.label) labelSpan.textContent = cell.label;
        }
        th.setAttribute('rowspan', String(cell.rowspan));
        th.removeAttribute('colspan');
        th.style.display = '';
        tr.appendChild(th);
        this._applyLeafThState(th, col, pin);
      }
      trs.push(tr);
    }

    // Hidden registered cols live in a final, display:none row so their
    // header-cell controllers don't disconnect. The trs above only carry
    // visible cols; the hidden row mops up the rest.
    const usedFields = new Set();
    layout.rows.forEach((r) => r.forEach((c) => {
      if (c.kind === 'leaf') usedFields.add(c.col.field);
    }));
    const hiddenRegistered = this.state.columnDefs.filter(
      (c) => !visibleFieldSet.has(c.field) && !usedFields.has(c.field),
    );
    if (hiddenRegistered.length) {
      const hiddenTr = el('tr', { class: 'sg-hidden-header-row' });
      for (const col of hiddenRegistered) {
        let th = existingThs.get(col.field);
        if (!th) th = el('th', { 'data-field': col.field, 'data-synth': 'true' });
        th.removeAttribute('rowspan');
        th.removeAttribute('colspan');
        hiddenTr.appendChild(th);
      }
      trs.push(hiddenTr);
    }

    this._thead.replaceChildren(...trs);
  }

  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(th, col, pin) {
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
        sortIcon = el('span', { class: 'sg-sort-icon', 'aria-hidden': 'true' });
        sortIcon.innerHTML = CHEVRON_SVG;       // CSS rotates -90° (asc) / +90° (desc)
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
        filterIcon.innerHTML = FILTER_SVG;
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
    const allRows = this._withDetailRows(this._displayList.pageRows);
    this._selKeys = this._computeCellSelKeys();   // cell range highlight lookup

    // Decide whether to virtualise. Virtualisation is auto-on whenever the
    // current display list exceeds the threshold, regardless of pagination —
    // a page size larger than the viewport still benefits from windowing.
    // Master/detail forces it off: detail rows are template-driven and have
    // variable heights the uniform-row windowing can't predict.
    const virtual = !this.masterDetailValue
      && (this.virtualValue || allRows.length > 200);

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
    // Pinned bottom row (grand totals) — appended last so its sticky-bottom
    // CSS pins it to the viewport floor under all scrolled rows. Suppressed
    // in pivot mode because the synthetic "(All)" row already serves the
    // grand-totals role at the top.
    if (this.pinnedBottomRowValue
        && this._displayList.grandTotals
        && !this._displayList.pivot) {
      fragment.appendChild(this._buildPinnedBottomRow(cols));
    }
    this._tbody.replaceChildren(fragment);
  }

  _buildPinnedBottomRow(cols) {
    const tr = el('tr', { class: 'sg-pinned-bottom-row', 'aria-label': 'Grand totals' });
    const pin = this._pinOffsets();
    const totals = this._displayList.grandTotals || {};
    let labelPlaced = false;
    for (const col of cols) {
      const td = el('td', { 'data-col-id': col.field, 'data-pinned': col.pinned || null });
      if (col.pinned === 'left') td.style.left = pin.left[col.field] + 'px';
      else if (col.pinned === 'right') td.style.right = pin.right[col.field] + 'px';
      const v = totals[col.field];
      if (v != null) {
        td.classList.add('sg-agg-cell');
        td.textContent = this._formatAggregate(v);
      } else if (!labelPlaced && !col._isCheckbox && !col._isRowNumber) {
        // Drop a single "Total" tag in the first label-eligible blank cell
        // (skips the row-number / checkbox gutter so it lands on real data).
        td.classList.add('sg-pinned-bottom-label');
        td.textContent = 'Total';
        labelPlaced = true;
      }
      tr.appendChild(td);
    }
    return tr;
  }

  _buildRow(row, cols, existing, rowNum) {
    if (row.__sgGroup) return this._buildGroupRow(row, cols, existing);
    if (row.__sgDetail) return this._buildDetailRow(row, cols, existing);
    const id = String(this._rowId(row));
    let tr = existing.get(id);
    if (!tr) tr = el('tr');
    tr.dataset.rowId = id;
    tr.classList.remove('sg-spacer');
    const selected = this.state.selection.has(this._rowId(row));
    const expanded = this.masterDetailValue && this._isDetailExpanded(id);
    setAttrs(tr, {
      'data-selected': selected ? 'true' : null,
      'data-detail-expanded': expanded ? 'true' : null,
    });
    if (this.masterDetailValue) tr.classList.add('sg-master-row');
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
      if (col._isGroupCol) {
        // Auto group column: leaf rows get an empty cell (the label lives on
        // the group row above). Not selectable / not editable.
        td.classList.add('sg-group-leaf-cell');
        td.removeAttribute('data-cell-active');
        td.removeAttribute('data-cell-range');
        tr.appendChild(td);
        continue;
      }
      if (col._isMasterExpand) {
        // Master/detail gutter cell: clicking the caret toggles the detail
        // panel for this row. The chevron is a span (not a button) so it
        // can sit on top of the cell-selection layer without consuming
        // pointer events meant for the row click.
        td.classList.add('sg-master-expand-cell');
        td.setAttribute('data-master-expand', 'true');
        td.removeAttribute('data-cell-active');
        td.removeAttribute('data-cell-range');
        const expanded = this._isDetailExpanded(this._rowId(row));
        const caret = el('span', {
          class: 'sg-master-expand-caret',
          'data-expanded': expanded ? 'true' : 'false',
          'aria-hidden': 'true',
        });
        caret.innerHTML = CHEVRON_SVG;
        td.appendChild(caret);
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

  // ----- Row grouping + aggregation -----

  // A group is expanded if it has an explicit override; otherwise the
  // default-by-level applies (-1 = all, 0 = none, N = first N levels).
  _isGroupExpanded = (groupId, level) => {
    if (this._groupExpanded.has(groupId)) return this._groupExpanded.get(groupId);
    const d = this.state.group.defaultExpanded;
    return d < 0 ? true : level < d;
  };

  toggleGroup(groupId, level = 0) {
    this._groupExpanded.set(groupId, !this._isGroupExpanded(groupId, level));
    this.scheduleRender('group');
    emit(this.element, 'grid:groupToggled', { groupId, expanded: this._groupExpanded.get(groupId) });
  }

  expandAll() {
    this._groupExpanded.clear();
    this.state.group.defaultExpanded = -1;
    this.scheduleRender('group');
  }

  collapseAll() {
    this._groupExpanded.clear();
    this.state.group.defaultExpanded = 0;
    this.scheduleRender('group');
  }

  setRowGroupColumns(fields) {
    this.state.group.cols = Array.isArray(fields) ? fields.slice() : [];
    this._groupExpanded.clear();
    this.state.selection.clear();
    this.clearCellSelection();
    this.state.pagination.page = 0;
    this.scheduleRender('group');
    emit(this.element, 'grid:columnRowGroupChanged', { rowGroupCols: this.state.group.cols.slice() });
  }

  addRowGroupColumn(field) {
    if (!field || this.state.group.cols.includes(field)) return;
    this.setRowGroupColumns([...this.state.group.cols, field]);
  }

  removeRowGroupColumn(field) {
    this.setRowGroupColumns(this.state.group.cols.filter((f) => f !== field));
  }

  getRowGroupColumns() { return this.state.group.cols.slice(); }

  setColumnAggFunc(field, func) {
    if (func == null) delete this.state.group.aggs[field];
    else this.state.group.aggs[field] = func;
    this.scheduleRender('group');
    emit(this.element, 'grid:columnValueChanged', { valueCols: this.getValueColumns() });
  }

  // ----- Pivot mode -----

  // Toggling pivot mode rebuilds the display list (and therefore the visible
  // column set). Clears row + cell selection since the underlying cell graph
  // changes shape entirely.
  setPivotMode(on) {
    const next = !!on;
    if (this.state.pivot.mode === next) return;
    this.state.pivot.mode = next;
    this.state.selection.clear();
    this.clearCellSelection();
    this.state.pagination.page = 0;
    this.scheduleRender('pivot');
    emit(this.element, 'grid:pivotModeChanged', { pivot: next });
  }
  isPivotMode() { return !!this.state.pivot.mode; }

  setPivotColumns(fields) {
    this.state.pivot.cols = Array.isArray(fields) ? fields.slice() : [];
    this.clearCellSelection();
    this.state.pagination.page = 0;
    this.scheduleRender('pivot');
    emit(this.element, 'grid:columnPivotChanged', { pivotCols: this.state.pivot.cols.slice() });
  }
  addPivotColumn(field) {
    if (!field || this.state.pivot.cols.includes(field)) return;
    this.setPivotColumns([...this.state.pivot.cols, field]);
  }
  removePivotColumn(field) {
    this.setPivotColumns(this.state.pivot.cols.filter((f) => f !== field));
  }
  getPivotColumns() { return this.state.pivot.cols.slice(); }

  // "Value columns" = fields with an entry in state.group.aggs. Same map as the
  // grouping aggregations — drives both the per-group totals (in plain grouping)
  // and the pivot cell aggregations (in pivot mode).
  getValueColumns() {
    return Object.entries(this.state.group.aggs).map(([field, aggFunc]) => ({ field, aggFunc }));
  }
  setValueColumns(list) {
    const next = {};
    for (const { field, aggFunc } of (list || [])) {
      if (field && aggFunc) next[field] = aggFunc;
    }
    this.state.group.aggs = next;
    this.scheduleRender(this.state.pivot.mode ? 'pivot' : 'group');
    emit(this.element, 'grid:columnValueChanged', { valueCols: this.getValueColumns() });
  }
  addValueColumn(field, aggFunc = 'sum') {
    if (!field) return;
    this.setColumnAggFunc(field, aggFunc);
  }
  removeValueColumn(field) { this.setColumnAggFunc(field, null); }

  // ----- Column header groups + pinned bottom row -----

  setColumnGroups(groups) {
    this.columnGroupsValue = Array.isArray(groups) ? groups : [];
    this.scheduleRender('columns');
    emit(this.element, 'grid:columnGroupsChanged', { columnGroups: this.columnGroupsValue });
  }
  getColumnGroups() { return Array.isArray(this.columnGroupsValue) ? this.columnGroupsValue.slice() : []; }

  setPinnedBottomRow(on) {
    this.pinnedBottomRowValue = !!on;
    this.scheduleRender('cells');
  }
  isPinnedBottomRow() { return !!this.pinnedBottomRowValue; }

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
      cols: this.state.columnDefs
        .filter((c) => !c._isGroupCol && !c._isPivot)
        .map((c) => {
          const out = { field: c.field };
          if (c.width != null) out.width = c.width;
          if (c.pinned) out.pinned = c.pinned;
          if (c.hidden) out.hidden = true;
          return out;
        }),
      rowGroupCols: this.state.group.cols.slice(),
      pivot: { mode: !!this.state.pivot.mode, cols: this.state.pivot.cols.slice() },
      values: this.getValueColumns(),
      columnGroups: this.getColumnGroups(),
      pinnedBottomRow: !!this.pinnedBottomRowValue,
      sortModel: this.state.sortModel.slice(),
      filterModel: { ...this.state.filterModel },
      quickFilter: this.state.quickFilter || '',
    };
  }

  applyColumnState(state) {
    if (!state || typeof state !== 'object') return;
    if (Array.isArray(state.cols)) {
      const byField = new Map(this.state.columnDefs.map((c) => [c.field, c]));
      const ordered = [];
      for (const s of state.cols) {
        const c = byField.get(s.field);
        if (!c) continue;
        if (s.width != null) c.width = s.width;
        c.pinned = s.pinned || undefined;
        c.hidden = !!s.hidden;
        byField.delete(s.field);
        ordered.push(c);
      }
      // Append cols added since the snapshot was taken so they don't vanish.
      for (const c of byField.values()) ordered.push(c);
      this.state.columnDefs = ordered;
    }
    if (Array.isArray(state.rowGroupCols)) this.state.group.cols = state.rowGroupCols.slice();
    if (state.pivot && typeof state.pivot === 'object') {
      this.state.pivot.cols = Array.isArray(state.pivot.cols) ? state.pivot.cols.slice() : [];
      this.state.pivot.mode = !!state.pivot.mode;
    }
    if (Array.isArray(state.values)) {
      const next = {};
      for (const { field, aggFunc } of state.values) if (field && aggFunc) next[field] = aggFunc;
      this.state.group.aggs = next;
    }
    if (Array.isArray(state.columnGroups)) this.columnGroupsValue = state.columnGroups;
    if (typeof state.pinnedBottomRow === 'boolean') this.pinnedBottomRowValue = state.pinnedBottomRow;
    if (Array.isArray(state.sortModel)) this.state.sortModel = state.sortModel.slice();
    if (state.filterModel && typeof state.filterModel === 'object') {
      this.state.filterModel = { ...state.filterModel };
    }
    if (typeof state.quickFilter === 'string') this.state.quickFilter = state.quickFilter;
    // Dirty every stage that buildDisplayList branches on, plus 'columns' so
    // _renderHeader rebuilds the visible col set. Without 'group'/'pivot'/etc
    // the body would render off the stale display list while the header
    // already reflects the restored state.
    for (const stage of ['columns', 'group', 'pivot', 'sort', 'filter', 'data']) {
      this.scheduleRender(stage);
    }
    // Single broadcast — subscribers re-render from current API state instead
    // of subscribing to every granular event we deliberately suppressed.
    emit(this.element, 'grid:columnStateApplied', { state });
  }

  _storageKey() { return `sgrid:${this.persistKeyValue}`; }

  _restorePersistedState() {
    if (!this.persistKeyValue || typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(this._storageKey());
      if (!raw) return;
      const state = JSON.parse(raw);
      if (state && typeof state === 'object') this.applyColumnState(state);
    } catch (e) {
      console.warn('[stimulus_grid] failed to restore persisted state', e);
    }
  }

  _setupPersistence() {
    if (!this.persistKeyValue || typeof localStorage === 'undefined') return;
    const save = () => {
      clearTimeout(this._persistTimer);
      // 200ms debounce keeps localStorage writes off the hot path of column
      // resizes / sort flips while still feeling instant on reload.
      this._persistTimer = setTimeout(() => this._persistState(), 200);
    };
    this._persistListener = save;
    for (const ev of PERSIST_EVENTS) this.element.addEventListener(ev, save);
    // Flush on navigation so an in-flight debounce isn't lost when the user
    // reloads the page right after a change.
    this._persistBeforeUnload = () => {
      if (this._persistTimer) {
        clearTimeout(this._persistTimer);
        this._persistState();
      }
    };
    window.addEventListener('beforeunload', this._persistBeforeUnload);
  }

  _teardownPersistence() {
    if (!this._persistListener) return;
    for (const ev of PERSIST_EVENTS) this.element.removeEventListener(ev, this._persistListener);
    if (this._persistBeforeUnload) {
      window.removeEventListener('beforeunload', this._persistBeforeUnload);
      this._persistBeforeUnload = null;
    }
    // Flush one last time on teardown so disconnect mid-edit doesn't drop state.
    if (this._persistTimer) {
      clearTimeout(this._persistTimer);
      this._persistState();
    }
    this._persistListener = null;
  }

  _persistState() {
    if (!this.persistKeyValue || typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(this._storageKey(), JSON.stringify(this.getColumnState()));
    } catch (e) {
      console.warn('[stimulus_grid] failed to persist state', e);
    }
  }

  clearPersistedState() {
    if (!this.persistKeyValue || typeof localStorage === 'undefined') return;
    try { localStorage.removeItem(this._storageKey()); } catch { /* ignore */ }
  }

  _buildGroupRow(row, cols, existing) {
    const id = `__g:${row.groupId}`;
    let tr = existing.get(id);
    if (!tr) tr = el('tr');
    tr.dataset.rowId = id;
    tr.dataset.group = 'true';
    tr.dataset.groupLevel = String(row.level);
    tr.className = 'sg-group-row';
    this._renderGroupRow(tr, row, cols);
    return tr;
  }

  _renderGroupRow(tr, row, cols) {
    tr.innerHTML = '';
    const pin = this._pinOffsets();
    const expanded = this._isGroupExpanded(row.groupId, row.level);
    const single = (this.state.group.displayType || 'singleColumn') === 'singleColumn';
    const pivot = !!(this.state.pivot?.mode && this._displayList?.pivot);
    const isAllRow = row.__pivotAll === true;
    // Inline mode: label goes in the grouped column's own cell (or first data col).
    const dataCols = cols.filter((c) => !c._isRowNumber && !c._isCheckbox && !c._isGroupCol);
    const inlineLabelField = dataCols.some((c) => c.field === row.field) ? row.field : dataCols[0]?.field;
    // "(All)" pivot totals row: indent at level 0, no expand/collapse caret.
    const indentLevel = Math.max(0, row.level);
    if (isAllRow) tr.classList.add('sg-pivot-all-row');
    for (const col of cols) {
      const td = el('td', { 'data-col-id': col.field, 'data-pinned': col.pinned || null });
      if (col.pinned === 'left') td.style.left = pin.left[col.field] + 'px';
      else if (col.pinned === 'right') td.style.right = pin.right[col.field] + 'px';
      if (col._isRowNumber || col._isCheckbox) {
        td.classList.add(col._isRowNumber ? 'sg-gutter-cell' : 'sg-checkbox-cell');
        tr.appendChild(td);
        continue;
      }
      const isLabelCell = (pivot || single) ? col._isGroupCol : col.field === inlineLabelField;
      if (isLabelCell) {
        td.classList.add('sg-group-cell');
        td.style.paddingLeft = `${8 + indentLevel * 18}px`;
        if (!isAllRow) {
          const caret = el('span', {
            class: 'sg-group-caret',
            'data-expanded': expanded ? 'true' : 'false',
            'aria-hidden': 'true',
          });
          caret.innerHTML = CHEVRON_SVG;   // rotated via CSS when expanded
          td.appendChild(caret);
        }
        td.append(
          el('span', { class: 'sg-group-label' }, this._groupValueLabel(row)),
          el('span', { class: 'sg-group-count' }, ` (${row.count})`),
        );
      } else if (pivot && col._isPivot) {
        // Pivot cell: read through valueGetter into __pivotValues; blank if null.
        const v = getValue(row, col);
        if (v != null) {
          td.classList.add('sg-agg-cell');
          td.textContent = this._formatAggregate(v);
        }
      } else if (!col._isGroupCol && row.aggregates && row.aggregates[col.field] != null) {
        td.classList.add('sg-agg-cell');
        td.textContent = this._formatAggregate(row.aggregates[col.field]);
      }
      tr.appendChild(td);
    }
  }

  _groupValueLabel(row) {
    const val = row.value;
    if (val == null || val === '') return '(Blanks)';
    const col = this._colByField(row.field);
    return col ? formatValue({ [row.field]: val }, col) : String(val);
  }

  _formatAggregate(v) {
    if (v == null) return '';
    if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
    return String(v);
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

  // ----- Status bar (rows · selection · range aggregates) -----

  _renderStatusBar() {
    if (!this._statusBar) return;
    const left = this._statusBar.querySelector('.sg-status-left');
    const right = this._statusBar.querySelector('.sg-status-right');

    // Left section — Rows + Selected. Show "filtered from N" only when filtered.
    left.replaceChildren();
    const totalAll = this.state.serverSide
      ? this.state.serverRowCount
      : this.state.rowData.length;
    const totalShown = this._displayList.grouped
      ? (this._displayList.leafCount ?? this.filteredCount())
      : this.filteredCount();
    left.appendChild(this._statusPanel('Rows', this._fmtInt(totalShown),
      totalShown !== totalAll ? `of ${this._fmtInt(totalAll)}` : null));
    const selCount = this.state.selection.size;
    if (selCount > 0) {
      left.appendChild(this._statusPanel('Selected', this._fmtInt(selCount)));
    }

    // Right section — range aggregates. Hidden when no range or empty range.
    right.replaceChildren();
    const aggs = this.getRangeAggregates();
    if (aggs && aggs.count > 0) {
      const which = (this.statusBarAggsValue || []).filter((k) => k in aggs);
      for (const key of which) {
        const v = aggs[key];
        if (v == null && key !== 'count') continue;
        right.appendChild(this._statusPanel(this._aggLabel(key), this._fmtAgg(key, v)));
      }
    }

    // Fire grid:rangeAggsChanged on a *value* change so subscribers can render
    // their own UI without re-deriving from cellSelectionChanged + data events.
    const stamp = aggs ? `${aggs.count}|${aggs.sum}|${aggs.avg}|${aggs.min}|${aggs.max}` : '';
    if (stamp !== this._lastRangeAggs) {
      this._lastRangeAggs = stamp;
      emit(this.element, 'grid:rangeAggsChanged', { aggs });
    }
  }

  _statusPanel(label, value, aside = null) {
    const panel = el('div', { class: 'sg-status-panel' });
    panel.append(
      el('span', { class: 'sg-status-label' }, `${label}:`),
      el('span', { class: 'sg-status-value' }, value),
    );
    if (aside) panel.appendChild(el('span', { class: 'sg-status-aside' }, aside));
    return panel;
  }

  _fmtInt(n) { return Number(n).toLocaleString(); }

  _aggLabel(key) {
    return { count: 'Count', sum: 'Sum', avg: 'Avg', min: 'Min', max: 'Max' }[key] || key;
  }

  _fmtAgg(key, v) {
    if (v == null) return '—';
    if (key === 'count') return this._fmtInt(v);
    if (typeof v === 'number') {
      // Integer-valued numbers print without decimals; everything else gets two.
      if (Number.isInteger(v)) return this._fmtInt(v);
      const rounded = Math.round(v * 100) / 100;
      return rounded.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return String(v);
  }

  // Flat list of RAW cell values across every active range — fed to
  // aggregateRange to compute the status-bar numbers. Skips group rows and
  // the structural columns (gutter / checkbox / auto-group).
  _cellRangeRawValues() {
    const out = [];
    for (const rg of this.state.cellSel.ranges) {
      const rect = this._rangeRect(rg);
      if (!rect) continue;
      for (let r = rect.r0; r <= rect.r1; r++) {
        const row = rect.rows[r];
        if (!row || row.__sgGroup || row.__sgDetail) continue;
        for (let c = rect.c0; c <= rect.c1; c++) {
          const col = rect.cols[c];
          if (!col || col._isCheckbox || col._isRowNumber || col._isGroupCol || col._isMasterExpand) continue;
          out.push(getValue(row, col));
        }
      }
    }
    return out;
  }

  getRangeAggregates() {
    if (!this.state.cellSel.ranges.length) return null;
    return aggregateRange(this._cellRangeRawValues());
  }

  // ----- Right-click column menu -----
  //
  // contextmenu on a leaf <th> opens a fixed-positioned popup with quick
  // actions for that column: pin/unpin (left|right), autosize, group/pivot
  // toggles, aggregate selector, and hide. Synthetic columns (gutter,
  // checkbox, auto-Group, pivot result) suppress the menu — they're owned by
  // the grid and shouldn't be poked through this surface.
  _onHeaderContextMenu = (e) => {
    const th = e.target.closest('th[data-field], th[data-header-cell-field-value]');
    if (!th) return;
    const field = th.getAttribute('data-field') || th.getAttribute('data-header-cell-field-value');
    const col = this._colByField(field);
    if (!col || col._isCheckbox || col._isRowNumber || col._isGroupCol || col._isPivot) return;
    e.preventDefault();
    this._showColumnMenu(col, e.clientX, e.clientY);
  };

  _showColumnMenu(col, x, y) {
    this._closeColumnMenu();
    const items = this._columnMenuItems(col);
    const menu = el('div', { class: 'sg-column-menu', role: 'menu' });
    for (const item of items) {
      if (item === 'separator') {
        menu.appendChild(el('div', { class: 'sg-column-menu-separator', role: 'separator' }));
        continue;
      }
      const btn = el('button', {
        type: 'button',
        class: 'sg-column-menu-item' + (item.active ? ' sg-column-menu-active' : ''),
        role: 'menuitem',
      });
      btn.append(
        el('span', { class: 'sg-column-menu-label' }, item.label),
      );
      if (item.active) btn.append(el('span', { class: 'sg-column-menu-check', 'aria-hidden': 'true' }, '✓'));
      btn.addEventListener('click', () => { item.action(); this._closeColumnMenu(); });
      menu.appendChild(btn);
    }
    document.body.appendChild(menu);
    // Flip the menu away from any viewport edge it would overflow.
    const w = menu.offsetWidth || 220;
    const h = menu.offsetHeight || 280;
    menu.style.left = `${Math.min(x, window.innerWidth - w - 4)}px`;
    menu.style.top  = `${Math.min(y, window.innerHeight - h - 4)}px`;
    this._columnMenu = menu;
    // Defer outside-click attach so this very click doesn't immediately close it.
    setTimeout(() => {
      document.addEventListener('mousedown', this._onDocMouseDownColumnMenu);
      document.addEventListener('keydown',   this._onColumnMenuKey);
      window.addEventListener('resize',      this._closeColumnMenuBound = () => this._closeColumnMenu(), { once: true });
      window.addEventListener('scroll',      this._closeColumnMenuBound, { once: true, capture: true });
    }, 0);
    emit(this.element, 'grid:columnMenuOpened', { colId: col.field });
  }

  _closeColumnMenu() {
    if (!this._columnMenu) return;
    this._columnMenu.remove();
    this._columnMenu = null;
    document.removeEventListener('mousedown', this._onDocMouseDownColumnMenu);
    document.removeEventListener('keydown',   this._onColumnMenuKey);
    if (this._closeColumnMenuBound) {
      window.removeEventListener('resize', this._closeColumnMenuBound);
      window.removeEventListener('scroll', this._closeColumnMenuBound, { capture: true });
      this._closeColumnMenuBound = null;
    }
  }

  _onDocMouseDownColumnMenu = (e) => {
    if (this._columnMenu && !this._columnMenu.contains(e.target)) this._closeColumnMenu();
  };
  _onColumnMenuKey = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); this._closeColumnMenu(); }
  };

  // Build the menu item list for `col` based on the current grid state. Each
  // item is { label, action, active? } or the string 'separator'. Items are
  // emitted only when they make sense (e.g. "Unpin" doesn't show on an
  // unpinned col), so the menu stays short.
  _columnMenuItems(col) {
    const api = this.element.gridApi;
    const label = col.headerName || col.field;
    const isGrouped = this.state.group.cols.includes(col.field);
    const isPivot   = this.state.pivot.cols.includes(col.field);
    const aggFunc   = this.state.group.aggs[col.field];
    const isNum     = col.type === 'number';

    const items = [];
    if (col.pinned !== 'left')  items.push({ label: 'Pin left',  action: () => api.setColumnPinned(col.field, 'left') });
    if (col.pinned !== 'right') items.push({ label: 'Pin right', action: () => api.setColumnPinned(col.field, 'right') });
    if (col.pinned)             items.push({ label: 'Unpin',     action: () => api.setColumnPinned(col.field, null) });
    items.push('separator');

    items.push({ label: 'Autosize this column', action: () => api.autoSizeColumn(col.field) });
    items.push({ label: 'Autosize all columns', action: () => api.autoSizeAllColumns() });
    items.push('separator');

    items.push(isGrouped
      ? { label: `Ungroup ${label}`, action: () => api.removeRowGroupColumn(col.field) }
      : { label: `Group by ${label}`, action: () => api.addRowGroupColumn(col.field) });

    items.push(isPivot
      ? { label: `Remove ${label} from pivot`, action: () => api.removePivotColumn(col.field) }
      : { label: `Pivot by ${label}`, action: () => {
        if (!api.isPivotMode()) api.setPivotMode(true);
        api.addPivotColumn(col.field);
      } });

    // Aggregate section: only worth showing when the col is numeric (so
    // sum/avg/min/max make sense) or already carries an agg.
    if (isNum || aggFunc) {
      items.push('separator');
      for (const fn of ['sum', 'avg', 'count', 'min', 'max']) {
        items.push({
          label: `Aggregate: ${fn}`,
          active: aggFunc === fn,
          action: () => api.addValueColumn(col.field, fn),
        });
      }
      if (aggFunc) {
        items.push({ label: 'Remove aggregation', action: () => api.removeValueColumn(col.field) });
      }
    }

    items.push('separator');
    items.push({ label: 'Hide column', action: () => api.setColumnVisible(col.field, false) });
    items.push({
      label: 'Show all columns',
      action: () => {
        this.state.columnDefs.forEach((c) => {
          if (c.hidden && !c._isGroupCol && !c._isPivot && !c._isCheckbox && !c._isRowNumber) {
            api.setColumnVisible(c.field, true);
          }
        });
      },
    });

    return items;
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
    // Group header row → toggle expand/collapse (clicking anywhere on the row).
    if (tr.dataset.group === 'true') {
      this.toggleGroup(tr.dataset.rowId.replace(/^__g:/, ''), Number(tr.dataset.groupLevel) || 0);
      return;
    }
    // Detail row itself: swallow clicks so they don't trigger row/cell
    // selection on the master. The nested grid (if any) handles its own
    // interactions.
    if (tr.classList.contains('sg-detail-row')) return;
    // Master-detail expand chevron: toggle and stop here so the row's click
    // semantics (selection / range / etc) aren't also fired.
    const expandTd = e.target.closest?.('td[data-master-expand="true"]');
    if (expandTd) {
      const rowId = this._coerceRowId(tr.dataset.rowId);
      this.toggleDetailRow(rowId);
      return;
    }
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
    if (!td || !tr || tr.dataset.group === 'true' || tr.classList.contains('sg-detail-row') || td.classList.contains('sg-checkbox-cell') || td.classList.contains('sg-group-leaf-cell') || td.classList.contains('sg-master-expand-cell') || td.dataset.gutter === 'true' || !td.dataset.colId) return null;
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
    // Cell-selection changes don't go through scheduleRender (the DOM updates
    // are in-place above), so keep the status bar in sync from here.
    this._renderStatusBar();
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
    return this._visibleCols().filter((c) => !c._isCheckbox && !c._isRowNumber && !c._isGroupCol && !c._isMasterExpand);
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
    const firstLeaf = () => rows.findIndex((r) => !r.__sgGroup && !r.__sgDetail);
    let ri = active ? rows.findIndex((r) => this._rowId(r) === active.rowId) : firstLeaf();
    let ci = active ? cols.findIndex((c) => c.field === active.colId) : 0;
    if (ri < 0) ri = firstLeaf();
    if (ri < 0) return;                  // grouped view with everything collapsed
    if (ci < 0) ci = 0;
    if (extend && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
      const rg = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      const fr = clamp(rows.findIndex((r) => this._rowId(r) === rg.focus.rowId) + dr, 0, rows.length - 1);
      const fc = clamp(cols.findIndex((c) => c.field === rg.focus.colId) + dc, 0, cols.length - 1);
      this._extendActiveRange({ rowId: this._rowId(rows[fr]), colId: cols[fc].field });
    } else {
      let nr = clamp(ri + dr, 0, rows.length - 1);
      // Step over group header rows when moving vertically.
      if (dr !== 0) {
        while (rows[nr] && (rows[nr].__sgGroup || rows[nr].__sgDetail)) {
          const next = nr + dr;
          if (next < 0 || next >= rows.length) break;
          nr = next;
        }
        if (!rows[nr] || rows[nr].__sgGroup || rows[nr].__sgDetail) return;
      }
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
        if (!row || row.__sgGroup || row.__sgDetail) continue;
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
    const visible = this.state.columnDefs.filter((c) => !c.hidden);
    const groupFields = this.state.group?.cols || [];

    // Master/detail: prepend a 32px synthetic column that hosts the expand/
    // collapse chevron. Pinned left so it sticks during horizontal scroll, and
    // suppressed entirely in pivot/grouped views (where the leaf rows we'd
    // expand from have been aggregated away). The chevron is rendered in
    // _renderRow under col._isMasterExpand.
    const wantsMasterDetailGutter = this.masterDetailValue
      && !this.state.pivot?.mode
      && !groupFields.length;

    // Pivot mode: replace the data columns entirely with the synthetic pivot
    // result columns from the last buildDisplayList call. The group column on
    // the left holds the indented row-group hierarchy + counts; if there are
    // no rowGroupCols, it still appears (narrow) to host the "(All)" label.
    if (this.state.pivot?.mode && this._displayList?.pivotResultColumns?.length) {
      const groupCol = {
        field: '__group',
        headerName: groupFields.length
          ? groupFields
              .map((f) => this._colByField(f)?.headerName || f)
              .join(' → ')
          : '',
        _isGroupCol: true,
        width: groupFields.length ? 220 : 90,
        sortable: false,
        filter: null,
        resizable: false,
      };
      return [groupCol, ...this._displayList.pivotResultColumns];
    }

    if (!groupFields.length) {
      return wantsMasterDetailGutter ? [this._masterExpandCol(), ...visible] : visible;
    }
    const mode = this.state.group.displayType || 'singleColumn';
    if (mode === 'singleColumn') {
      // Auto group column on the left holds the indented hierarchy + group counts.
      // The grouped columns are hidden from the visible layout (their values live
      // in the group col), but stay in columnDefs so CSV, quick filter, etc. still
      // see them. Non-destructive: ungroup restores the original layout.
      const grouped = new Set(groupFields);
      const groupCol = {
        field: '__group',
        headerName: 'Group',
        _isGroupCol: true,
        width: 240,
        sortable: false,
        filter: null,
        resizable: false,
      };
      return [groupCol, ...visible.filter((c) => !grouped.has(c.field))];
    }
    // Inline mode: grouped cols stay visible; the label sits in their own cell.
    if (this.groupReorderColumnsValue === false) return visible;
    const grouped = groupFields.map((f) => visible.find((c) => c.field === f)).filter(Boolean);
    const groupedSet = new Set(grouped);
    return [...grouped, ...visible.filter((c) => !groupedSet.has(c))];
  }

  // Synthetic gutter col for the master-detail expand chevron. Returned by
  // _visibleCols when masterDetail is on; rendered specially in _renderRow.
  _masterExpandCol() {
    return {
      field: '__masterExpand',
      headerName: '',
      _isMasterExpand: true,
      width: 32,
      pinned: 'left',
      sortable: false,
      filter: null,
      resizable: false,
    };
  }

  // ----- Master/detail rows -----

  _isDetailExpanded(rowId) { return this._detailExpanded.has(String(rowId)); }

  // Splice a synthetic `__sgDetail` row in directly after each expanded master
  // in the page rows. Done after buildDisplayList so detail expansion stays
  // a UI concern — the model.js pipeline doesn't need to know about it.
  _withDetailRows(pageRows) {
    if (!this.masterDetailValue || !this._detailExpanded.size) return pageRows;
    // Suppress in pivot / grouped views — leaves we'd hang details off of
    // have been aggregated away there.
    if (this.state.pivot?.mode || (this.state.group.cols || []).length) return pageRows;
    const out = [];
    for (const row of pageRows) {
      out.push(row);
      if (row.__sgGroup || row.__sgDetail) continue;
      const id = this._rowId(row);
      if (this._isDetailExpanded(id)) {
        out.push({ __sgDetail: true, master: row, masterId: id });
      }
    }
    return out;
  }

  toggleDetailRow(rowId) {
    if (!this.masterDetailValue) return;
    if (this._isDetailExpanded(rowId)) this.collapseDetailRow(rowId);
    else this.expandDetailRow(rowId);
  }

  expandDetailRow(rowId) {
    if (!this.masterDetailValue) return;
    const key = String(rowId);
    if (this._detailExpanded.has(key)) return;
    this._detailExpanded.add(key);
    this.scheduleRender('cells');
    const masterRow = this.state.rowData.find((r) => String(this._rowId(r)) === key);
    emit(this.element, 'grid:detailRowExpanded', { rowId, masterRow });
  }

  collapseDetailRow(rowId) {
    if (!this.masterDetailValue) return;
    const key = String(rowId);
    if (!this._detailExpanded.has(key)) return;
    this._detailExpanded.delete(key);
    // Drop any nested-grid api reference — its host <tr> is about to be removed
    // and a fresh expand should re-mount cleanly.
    this._detailGrids.delete(key);
    this.scheduleRender('cells');
    const masterRow = this.state.rowData.find((r) => String(this._rowId(r)) === key);
    emit(this.element, 'grid:detailRowCollapsed', { rowId, masterRow });
  }

  expandAllDetails() {
    if (!this.masterDetailValue) return;
    for (const r of this.state.rowData) this._detailExpanded.add(String(this._rowId(r)));
    this.scheduleRender('cells');
  }

  collapseAllDetails() {
    if (!this.masterDetailValue) return;
    this._detailExpanded.clear();
    this._detailGrids.clear();
    this.scheduleRender('cells');
  }

  getDetailExpandedRowIds() { return Array.from(this._detailExpanded); }

  setMasterDetail(on) {
    const next = !!on;
    if (this.masterDetailValue === next) return;
    this.masterDetailValue = next;
    if (!next) {
      this._detailExpanded.clear();
      this._detailGrids.clear();
    }
    this.scheduleRender('columns');
  }
  isMasterDetail() { return !!this.masterDetailValue; }

  // Build the detail <tr>: one cell spanning the full visible width, holding a
  // padded shell that hosts either a cloned <template> or a default summary
  // pulled from the master row.
  _buildDetailRow(row, cols, existing) {
    const id = `__d:${row.masterId}`;
    let tr = existing.get(id);
    const masterKey = String(row.masterId);
    let shouldMount = true;
    if (tr) {
      // Reuse the existing <tr> when its master id matches — the nested grid
      // inside stays mounted, no re-init churn. Otherwise rebuild from scratch.
      const existingMaster = tr.getAttribute('data-master-id');
      if (existingMaster === masterKey) {
        tr.classList.remove('sg-spacer');
        return tr;
      }
      tr = null;
    }
    if (!tr) tr = el('tr');
    tr.className = 'sg-detail-row';
    tr.dataset.rowId = id;
    tr.setAttribute('data-master-id', masterKey);
    tr.innerHTML = '';

    const td = el('td', { colspan: String(cols.length || 1), class: 'sg-detail-cell' });
    const shell = el('div', { class: 'sg-detail-shell' });
    shell.style.minHeight = `${this.detailRowHeightValue}px`;
    td.appendChild(shell);
    tr.appendChild(td);

    this._populateDetailShell(shell, row.master, row.masterId);
    return tr;
  }

  // Fill the detail shell. Strategy: if the grid has a detail-template value
  // pointing at an existing <template>, clone its content and run a tiny
  // data-bind pass keyed off the master row. Otherwise render a minimal
  // fallback so the panel still appears (handy when the user is wiring up
  // their first detail panel and hasn't authored a template yet).
  _populateDetailShell(shell, masterRow, rowId) {
    const tplId = this.detailTemplateValue;
    let mounted;
    if (tplId) {
      const tpl = document.getElementById(tplId);
      if (tpl && tpl.tagName === 'TEMPLATE') {
        const frag = tpl.content.cloneNode(true);
        this._applyDetailBindings(frag, masterRow);
        shell.appendChild(frag);
        mounted = shell;
      }
    }
    if (!mounted) {
      // Fallback panel: a short summary of the master row's data + a hint to
      // wire a template. Keeps the demo / first-touch experience friendly.
      const summary = el('div', { class: 'sg-detail-fallback' });
      const fields = Object.keys(masterRow || {})
        .filter((k) => !k.startsWith('_') && !k.startsWith('__'))
        .slice(0, 6);
      for (const f of fields) {
        summary.append(
          el('span', { class: 'sg-detail-fallback-label' }, `${f}: `),
          el('span', { class: 'sg-detail-fallback-value' }, String(masterRow[f] ?? '')),
          el('span', { class: 'sg-detail-fallback-sep' }, '  ·  '),
        );
      }
      summary.lastElementChild?.remove();
      shell.appendChild(summary);
    }
    // Nested grid auto-mount: any [data-controller~="grid"] inside the shell
    // gets its rowData seeded from master[detailRowsKey] BEFORE Stimulus boots
    // it on next microtask, so the inner grid mounts with the right rows.
    const nested = shell.querySelector('[data-controller~="grid"]');
    if (nested) this._seedNestedGrid(nested, masterRow, rowId);
    // Fire after the DOM is in the document tree — caller appends shell, so
    // queueMicrotask runs after the new tbody children are attached and the
    // nested grid (if any) has had a chance to set up its gridApi.
    queueMicrotask(() => {
      emit(this.element, 'grid:detailRowMounted', {
        rowId, masterRow, detailEl: shell,
        nestedGridApi: nested?.gridApi || null,
      });
    });
  }

  // Walk the cloned template for [data-detail-bind="<field>"] (textContent),
  // [data-detail-bind-attr="<attr>:<field>"] (attribute), and [data-detail-if="<field>"]
  // (drop the node when falsy). Tiny, on purpose — anything richer belongs in
  // the consumer's own JS via grid:detailRowMounted.
  _applyDetailBindings(root, master) {
    if (!master) return;
    const nodes = root.querySelectorAll('[data-detail-bind], [data-detail-bind-attr], [data-detail-if]');
    nodes.forEach((n) => {
      if (n.hasAttribute('data-detail-if')) {
        const f = n.getAttribute('data-detail-if');
        if (!master[f]) { n.remove(); return; }
      }
      if (n.hasAttribute('data-detail-bind')) {
        const f = n.getAttribute('data-detail-bind');
        n.textContent = master[f] == null ? '' : String(master[f]);
      }
      if (n.hasAttribute('data-detail-bind-attr')) {
        const spec = n.getAttribute('data-detail-bind-attr');
        const [attr, f] = spec.split(':');
        if (attr && f) n.setAttribute(attr, master[f] == null ? '' : String(master[f]));
      }
    });
  }

  // Seed a nested grid with the master row's detail rows before its controller
  // boots, so its first render shows the right data without an extra round
  // through scheduleRender. Cache the inner gridApi once it appears so the
  // outer grid can refresh it later if the master data is updated.
  _seedNestedGrid(nested, masterRow, rowId) {
    const key = this.detailRowsKeyValue;
    if (key) {
      const rows = masterRow?.[key];
      if (Array.isArray(rows)) {
        try {
          nested.setAttribute('data-grid-row-data-value', JSON.stringify(rows));
        } catch { /* unserializable rows — caller can rebind via the event */ }
      }
    }
    // Stimulus initialisation runs in a microtask; resolve the api one tick
    // later. If the consumer needs to push data later, they can read
    // gridApi off the detail-row element directly.
    queueMicrotask(() => {
      if (nested.gridApi) this._detailGrids.set(String(rowId), nested.gridApi);
    });
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
