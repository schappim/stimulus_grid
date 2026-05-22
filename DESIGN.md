# stimulus_grid — Design Doc

A Stimulus-first, HTML-first data grid. Clean-room — no third-party grid source
is read or copied; we take API-shape inspiration from common JS data grids only.

> Status: design draft, v0.1
> Owner: Marcus
> Last updated: 2026-05-20

---

## 1. Goal

Bring the *feel* of a full-featured data grid — sortable, filterable, editable, selectable,
paginated, virtualised, with a rich public API — to a Stimulus.js codebase, without React, without
a build-time configuration object, and without a third-party grid dependency.

> "A grid you can render from the server, that progressively enhances into a full-featured,
> interactive data grid."

The library exports a small bundle of Stimulus controllers. A consumer drops table-like HTML
on a page, annotates it with `data-controller="grid"` and a handful of `data-grid-*` attributes,
and gets the grid behaviour automatically.

## 2. Non-goals (for the initial release)

These features are deliberately deferred so v0.1 ships something coherent:

- Server-side row model (infinite/paged remote loading) — v0.2 ✓ **shipped** (paged; infinite scroll still deferred)
- Row grouping & aggregation — v0.3 ✓ **shipped** (single + multi-column, per-group aggregates)
- Pivoting — out of scope until grouping lands
- Master/detail (expandable detail rows) — v0.3
- Tree data — v0.3
- Built-in CSV/Excel/clipboard interop — v0.2 ✓ **shipped** (CSV export + clipboard copy/paste)
- Integrated charts — out of scope
- Sparklines — out of scope
- Enterprise-style filters (set filter / advanced filter builder UI) — set-filter **engine** shipped; distinct-values UI still deferred

What we *do* commit to in v0.1: columns, rows, sort, filter (text/number/date), single + multi
row selection, pagination, inline cell editing, column resize/reorder/pin/hide, virtual row
scrolling, and a public `gridApi` covering the most-used data-grid methods.

## 3. Philosophy: Stimulus-first

Most JS data grids start from a JS configuration object. Stimulus inverts that: **the HTML is the
configuration**. Three rules follow:

1. **HTML works without JS.** A `stimulus_grid` table is a real `<table>` (or `role="grid"` div
   layout) that the browser can render unstyled and a screen reader can navigate before any JS
   loads. JS only *enhances* — sort, filter, virtualisation, etc.
2. **Configuration lives in `data-*` attributes.** Column types, filterable, sortable, editable,
   pinned, row data source, pagination size — all expressed on the HTML, not in a JS init blob.
   No `gridOptions = {...}; new Grid(div, gridOptions)` ceremony.
3. **Behaviour decomposes into small controllers wired with outlets.** One mega-controller is
   not the Stimulus way. The grid controller is the brain; per-column/header/row/cell behaviour
   lives in dedicated leaf controllers that talk back via outlets.

The public API surface uses familiar data-grid method names: `grid.api.setRowData(...)`,
`grid.api.getSelectedRows()`, `grid.api.exportDataAsCsv()`, etc. The mental model is
"a data grid with HTML as the source of truth and Stimulus as the binding layer."

## 4. Architecture overview

```
            ┌─────────────────────────────────────────────┐
            │  <div data-controller="grid">               │  <-- mounting element
            │                                             │      hosts public api: el.gridApi
            │  ┌──────────────────────────────────────┐   │
            │  │ <header-row>                         │   │  <-- header_cell controllers
            │  │   header-cell  header-cell  ...      │   │      (sort/resize/reorder/filter trigger)
            │  └──────────────────────────────────────┘   │
            │  ┌──────────────────────────────────────┐   │
            │  │ <body viewport>  (scroll container)  │   │
            │  │  ┌────────────────────────────────┐  │   │
            │  │  │ canvas (height = totalRows*H)  │  │   │  <-- virtual scroll spacer
            │  │  │  ┌──────────────────────────┐  │  │   │
            │  │  │  │ window of <row> elements │  │  │   │  <-- row + cell controllers
            │  │  │  │ (absolute positioned)    │  │  │   │      (selection/editing)
            │  │  │  └──────────────────────────┘  │  │   │
            │  │  └────────────────────────────────┘  │   │
            │  └──────────────────────────────────────┘   │
            │  ┌──────────────────────────────────────┐   │
            │  │ pagination_controller (optional)     │   │  <-- pagination_controller
            │  └──────────────────────────────────────┘   │
            └─────────────────────────────────────────────┘
```

Data flow: user interaction → leaf controller → outlet call to grid controller → grid updates
its state → grid re-renders the affected region (header / row window / pagination). No virtual
DOM. The render loop computes a *display list* (after sort + filter + paging + virtualisation)
and synchronises `tbody` (or `[data-grid-target="body"]`) to it.

## 5. Data model

```js
// internal shape
{
  // immutable until setRowData()
  rowData: [{id, ...fields}, ...],       // user rows; identity by `id` or row-index

  // declarative column defs, gathered from <th data-controller="header-cell"> elements
  columnDefs: [
    {
      field: 'athlete', headerName: 'Athlete',
      sortable: true, filter: 'text', editable: false,
      width: 180, minWidth: 60, maxWidth: 600,
      pinned: null,        // 'left' | 'right' | null
      hidden: false,
      type: 'text',        // 'text' | 'number' | 'date' | 'boolean'
      valueGetter: null,   // optional fn(row) -> any
      valueFormatter: null,// optional fn(value, row) -> string
      cellRenderer: null,  // optional template id (see §7.6)
      comparator: null,    // optional fn(a, b) -> int
    },
    ...
  ],

  // view state
  sortModel:   [{colId: 'athlete', sort: 'asc'}, ...],   // multi-col supported
  filterModel: {athlete: {type: 'contains', value: 'mi'}, age: {type: 'gte', value: 25}, ...},
  selection:   Set<rowId>,
  focusedCell: {rowId, colId} | null,
  pagination:  {page: 0, pageSize: 50, total: <derived>},
  scrollTop:   <px>,
}
```

A *display list* is derived from this on every relevant change:
`rowData → filter() → sort() → paginate() → virtualWindow(scrollTop)`. Each stage is
memoised on its input identity, so a sort-only change skips the filter pass.

## 6. Controller catalog

### 6.1 `grid_controller` — orchestrator

- Lifecycle: `connect()` collects `columnDefs` from child `header-cell` controllers, reads
  `rowData` from `data-grid-row-data-value` (JSON) or `[data-grid-target="rowTemplate"]`
  (HTML rows), builds initial display list, paints viewport.
- State: full data model (§5). Re-renders on mutation.
- Public API: exposes `this.element.gridApi = {...}` (see §8).
- Outlets: `header-cell`, `row`, `cell`, `pagination`, `filter`. (Child controllers also use
  `outlets` to call back into `grid`.)

### 6.2 `header_cell_controller` — per-column header

- Targets: `label`, `sortIcon`, `filterIcon`, `resizeHandle`, `menuButton`.
- Values: `field`, `headerName`, `sortable`, `filter`, `editable`, `type`, `width`, `minWidth`,
  `maxWidth`, `pinned`, `hidden`.
- Actions:
  - `click->header-cell#sort` (with shift for multi-sort)
  - `mousedown->header-cell#startResize`
  - `mousedown->header-cell#startReorder` (on label drag handle)
  - `click->header-cell#openFilter`
  - `click->header-cell#openMenu`
- On `connect()`, registers itself with the parent grid via outlet:
  `this.gridOutlet.registerColumn(this.toColumnDef())`.

### 6.3 `row_controller` — per-row behaviour

- Values: `rowId`, `index`, `selected`, `pinned`.
- Actions: `click->row#toggleSelect`, `keydown->row#navigate`.
- Talks to grid via outlet for selection state.

### 6.4 `cell_controller` — per-cell behaviour

- Values: `rowId`, `colId`, `editable`, `editing`.
- Actions: `dblclick->cell#startEdit`, `keydown->cell#handleKey`.
- On `startEdit`, mounts the editor (default `<input>`, or a template referenced by the
  column's `cellEditor` attr).

### 6.5 `filter_controller` — per-column filter popover

- Renders the filter UI based on the column's `filter` type:
  - `text` → input + condition select (contains, equals, startsWith, endsWith, blank, notBlank)
  - `number` → input + condition select (=, !=, <, ≤, >, ≥, in-range)
  - `date` → date input + condition select (=, !=, <, >, between)
  - `boolean` → toggle
  - `set` → checkbox list of distinct values (engine supports `set`/`in`; UI not yet built)
- Action: `change` → `gridOutlet.setColumnFilter(colId, filterModel)`.

### 6.6 `pagination_controller`

- Targets: `first`, `prev`, `next`, `last`, `pageSize`, `pageInfo`.
- Actions: `click` on buttons → `gridOutlet.goToPage(...)`.
- Outlets back to `grid` to read page state for re-render.

### 6.7 `selection_controller` (logic lives in grid; this is the UI for the checkbox column)

If the grid is configured with `data-grid-row-selection-value="multiple"` and includes
`<th data-controller="header-cell" data-header-cell-checkbox-value="true">`, a checkbox column
is rendered. Shift-click selects ranges; ⌘/Ctrl-click toggles.

## 7. HTML configuration patterns

### 7.1 Minimum viable grid (server-rendered rows)

```html
<div data-controller="grid">
  <table>
    <thead>
      <tr>
        <th data-controller="header-cell" data-header-cell-field-value="athlete">Athlete</th>
        <th data-controller="header-cell" data-header-cell-field-value="age"
            data-header-cell-type-value="number">Age</th>
        <th data-controller="header-cell" data-header-cell-field-value="country">Country</th>
      </tr>
    </thead>
    <tbody data-grid-target="body">
      <tr data-controller="row" data-row-row-id-value="1">
        <td data-controller="cell" data-cell-col-id-value="athlete">Michael Phelps</td>
        <td data-controller="cell" data-cell-col-id-value="age">23</td>
        <td data-controller="cell" data-cell-col-id-value="country">United States</td>
      </tr>
      <!-- ...more rows... -->
    </tbody>
  </table>
</div>
```

The grid reads cell text on `connect()` to build its internal data model. No JS data hand-off
needed — server can render thousands of rows and the grid takes over from there.

### 7.2 JSON data (no rendered rows)

```html
<div data-controller="grid"
     data-grid-row-data-value='[{"id":1,"athlete":"Michael Phelps","age":23,"country":"United States"}, ...]'>
  <table>
    <thead>
      <tr>
        <th data-controller="header-cell" data-header-cell-field-value="athlete">Athlete</th>
        <th data-controller="header-cell" data-header-cell-field-value="age" data-header-cell-type-value="number">Age</th>
        <th data-controller="header-cell" data-header-cell-field-value="country">Country</th>
      </tr>
    </thead>
    <tbody data-grid-target="body"></tbody>
  </table>
</div>
```

### 7.3 Async/fetch data

```html
<div data-controller="grid"
     data-grid-row-data-url-value="/api/athletes.json">
  ...
</div>
```

### 7.4 Sort, filter, editable, resizable

```html
<th data-controller="header-cell"
    data-header-cell-field-value="age"
    data-header-cell-type-value="number"
    data-header-cell-sortable-value="true"
    data-header-cell-filter-value="number"
    data-header-cell-editable-value="true"
    data-header-cell-resizable-value="true"
    data-header-cell-width-value="120">
  Age
</th>
```

### 7.5 Pagination

```html
<div data-controller="grid"
     data-grid-pagination-value="true"
     data-grid-page-size-value="25">
  ...
  <nav data-controller="pagination"
       data-pagination-grid-outlet="[data-controller~=grid]">
    <button data-action="pagination#first">«</button>
    <button data-action="pagination#prev">‹</button>
    <span data-pagination-target="pageInfo"></span>
    <button data-action="pagination#next">›</button>
    <button data-action="pagination#last">»</button>
    <select data-action="change->pagination#changeSize" data-pagination-target="pageSize">
      <option>25</option><option>50</option><option>100</option>
    </select>
  </nav>
</div>
```

### 7.6 Custom cell rendering (via `<template>`)

```html
<th data-controller="header-cell" data-header-cell-field-value="status"
    data-header-cell-cell-renderer-value="status-pill">Status</th>

<template id="status-pill">
  <span class="pill" data-status="">
    <span class="dot"></span>
    <span class="label"></span>
  </span>
</template>
```

The grid clones the template, fills `data-status` and `.label` from the row's value. No JSX,
no virtual DOM — just a template clone with data-binding hooks.

### 7.7 Single-row vs multi-row selection

```html
<div data-controller="grid"
     data-grid-row-selection-value="multiple"
     data-grid-suppress-row-click-selection-value="false">
```

## 8. Public API — `gridApi`

After `connect()`, `element.gridApi` is the public surface. Names follow common data-grid
conventions where they make sense.

```ts
interface GridApi {
  // Data
  setRowData(rows: object[]): void
  getRowData(): object[]
  applyTransaction(t: {add?, update?, remove?}): {added, updated, removed}

  // Columns
  setColumnDefs(defs: ColumnDef[]): void
  getColumnDefs(): ColumnDef[]
  setColumnVisible(colId: string, visible: boolean): void
  setColumnPinned(colId: string, pinned: 'left'|'right'|null): void
  setColumnWidth(colId: string, width: number): void
  moveColumn(colId: string, toIndex: number): void
  autoSizeColumn(colId: string): void
  autoSizeAllColumns(): void

  // Sort
  setSortModel(model: SortModel[]): void
  getSortModel(): SortModel[]

  // Filter
  setFilterModel(model: FilterModel): void
  getFilterModel(): FilterModel
  setColumnFilter(colId: string, filter: ColFilter | null): void
  destroyFilter(colId: string): void

  // Selection
  selectAll(): void
  deselectAll(): void
  selectRow(rowId: string | number): void
  deselectRow(rowId: string | number): void
  getSelectedRows(): object[]
  getSelectedRowIds(): (string|number)[]

  // Pagination
  paginationGoToPage(n: number): void
  paginationGoToFirstPage(): void
  paginationGoToNextPage(): void
  paginationGoToPreviousPage(): void
  paginationGoToLastPage(): void
  paginationSetPageSize(n: number): void
  paginationGetCurrentPage(): number
  paginationGetTotalPages(): number
  paginationGetRowCount(): number

  // Editing
  startEditingCell(p: {rowId, colId}): void
  stopEditing(cancel?: boolean): void

  // Export
  exportDataAsCsv(opts?: {fileName?, columnSeparator?, onlySelected?}): void
  getDataAsCsv(opts?: {...}): string

  // Display
  refreshCells(p?: {rowIds?, colIds?, force?}): void
  redrawRows(p?: {rowIds?}): void
  sizeColumnsToFit(): void

  // Events
  addEventListener(type: string, handler: (e) => void): void
  removeEventListener(type: string, handler: (e) => void): void
}
```

## 9. Events

Dispatched on the grid element as `CustomEvent`s with the prefix `grid:`. Listeners can use
either `el.addEventListener('grid:rowSelected', ...)` or Stimulus actions
(`data-action="grid:rowSelected->mything#handler"`).

| Event                  | Detail                                  |
|------------------------|-----------------------------------------|
| `grid:ready`           | `{api}`                                 |
| `grid:rowDataChanged`  | `{rows}`                                |
| `grid:sortChanged`     | `{sortModel}`                           |
| `grid:filterChanged`   | `{filterModel}`                         |
| `grid:selectionChanged`| `{selectedRows, selectedIds}`           |
| `grid:cellValueChanged`| `{rowId, colId, oldValue, newValue}`    |
| `grid:cellClicked`     | `{rowId, colId, value, event}`          |
| `grid:rowClicked`      | `{rowId, row, event}`                   |
| `grid:paginationChanged`| `{page, pageSize, totalPages}`         |
| `grid:columnResized`   | `{colId, width}`                        |
| `grid:columnMoved`     | `{colId, fromIndex, toIndex}`           |
| `grid:columnPinned`    | `{colId, pinned}`                       |
| `grid:columnVisible`   | `{colId, visible}`                      |

## 10. Render pipeline

```
mutation (api call or interaction)
   ↓
markDirty(stage)   // 'data' | 'filter' | 'sort' | 'page' | 'scroll' | 'cells'
   ↓
requestAnimationFrame coalesce
   ↓
recompute display list from earliest dirty stage:
   data → filter → sort → page → virtualWindow
   ↓
sync DOM:
   - header attrs (sort icons, width, pinned, hidden)
   - body window (only rows in visible range; reuse existing <tr> nodes by rowId)
   - pagination footer
   - dispatch corresponding events
```

The body sync reuses row nodes by `rowId`: nodes leaving the window are returned to a small
pool; entering rows pull from the pool first, fall back to clone. This keeps churn low and
focus/selection styling stable during scroll.

## 11. Feature scope & roadmap

### v0.1 (this build)

- [x] Columns from declarative HTML
- [x] Data: inline HTML rows, JSON value, fetch URL
- [x] Sort: single + multi (shift-click)
- [x] Filter: text / number / date / boolean
- [x] Selection: single + multi + checkbox column + shift-range
- [x] Pagination
- [x] Inline cell editing (text, number, date)
- [x] Column resize, reorder, pin (left/right), hide/show
- [x] Virtual row scrolling
- [x] Custom cell renderers via `<template>`
- [x] Public `gridApi`
- [x] CustomEvents
- [x] Themes via CSS custom properties

### v0.2

- [ ] Set filter (distinct-values checkbox UI) — engine supports `set`/`in`; UI not yet built
- [x] CSV export
- [x] Clipboard copy/paste (range select)
- [x] Server-side row model (paged; `getRows`-style infinite scroll still deferred)
- [ ] Column groups (grouped header cells)

### v0.3

- [x] Row grouping + aggregation (single + multi-column; per-group sum/avg/min/max/count/first/last)
- [ ] Tree data
- [ ] Master/detail

### Out of scope

- Integrated charts
- Sparklines
- Pivoting

## 12. Migration cheatsheet (from a React data grid)

| Typical React data-grid concept          | stimulus_grid equivalent                                              |
|------------------------------------------|-----------------------------------------------------------------------|
| `<DataGrid rowData={...} columnDefs={...} />` | `<div data-controller="grid" data-grid-row-data-value="...">` + `<th data-controller="header-cell">` |
| `gridOptions`                            | `data-grid-*-value` attributes                                        |
| `columnDef.field`                        | `data-header-cell-field-value`                                        |
| `columnDef.sortable / filter / editable` | `data-header-cell-{sortable,filter,editable}-value`                   |
| `columnDef.cellRenderer`                 | `data-header-cell-cell-renderer-value` → `<template id="...">`        |
| `gridApi.setRowData()`                   | `el.gridApi.setRowData()`                                             |
| `gridApi.exportDataAsCsv()`              | `el.gridApi.exportDataAsCsv()`                                        |
| `onCellValueChanged` prop                | `grid:cellValueChanged` CustomEvent                                   |
| `rowSelection: 'multiple'`               | `data-grid-row-selection-value="multiple"`                            |
| `pagination: true, paginationPageSize: 50` | `data-grid-pagination-value="true" data-grid-page-size-value="50"`  |
| `domLayout: 'autoHeight'`                | `data-grid-dom-layout-value="autoHeight"`                             |
| `rowHeight: 32`                          | `data-grid-row-height-value="32"`                                     |
| Themes (a vendor theme class)            | `class="grid-theme-default"` + CSS custom properties                  |

## 13. File layout

```
stimulus_grid/
├── DESIGN.md                  ← this file
├── package.json
├── vite.config.js
├── src/
│   ├── index.js               ← public entry: registers all controllers
│   ├── controllers/
│   │   ├── grid_controller.js
│   │   ├── header_cell_controller.js
│   │   ├── row_controller.js
│   │   ├── cell_controller.js
│   │   ├── filter_controller.js
│   │   └── pagination_controller.js
│   ├── lib/
│   │   ├── model.js           ← display-list pipeline (filter/sort/page/window)
│   │   ├── api.js             ← gridApi factory
│   │   └── dom.js             ← small DOM helpers (clone template, attrs)
│   │                            (CSV export lives in grid_controller.js)
│   └── styles/
│       └── grid.css           ← default theme via CSS custom properties
├── demo/
│   ├── index.html             ← demo hub linking to all scenarios
│   ├── 01-basic.html
│   ├── 02-json-data.html
│   ├── 03-filtering.html
│   ├── 04-selection.html
│   ├── 05-pagination.html
│   ├── 06-editing.html
│   ├── 07-custom-renderer.html
│   ├── 08-virtual-scroll-10k.html
│   └── data/
│       └── olympic-athletes.json
└── README.md
```

## 14. Open questions / tradeoffs

- **`<table>` vs `role="grid"` div layout.** A real `<table>` is more accessible by default and
  works server-rendered. A div layout is more flexible for pinning/virtualisation. **Decision:**
  start with `<table>` for v0.1; revisit if pinning/virtual columns get awkward.
- **Multiple controllers vs single controller with rich targets.** Picked multiple (per §3).
  Risk: outlet plumbing. Mitigation: leaf controllers only call grid via outlet — no peer-to-peer.
- **Data identity.** Need stable row IDs for selection persistence across sort/filter/page.
  Default: row's `id` field; configurable via `data-grid-get-row-id-value` (name of field) or
  a callback registered against `gridApi`.
- **Rebuild vs diff on data change.** No diff library; we keep node identity by `rowId` in a
  pool, swap in/out by index. Good enough for our scale; can swap in a real diff later.
