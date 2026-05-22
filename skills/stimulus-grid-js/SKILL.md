---
name: stimulus-grid-js
description: Use stimulus_grid, an HTML-first data grid for Stimulus.js (Hotwire). Apply when adding or editing an interactive data table/grid in a Stimulus/Hotwire (non-Rails-specific) front end — sortable/filterable columns, row selection, pagination, inline editing, custom cell renderers/editors, virtual scrolling, CSV export, or driving a grid through its gridApi. For the Rails server-driven version (Turbo Stream live sync, server-side search, undo/redo) use the stimulus-grid-rails skill instead.
---

# Using stimulus_grid (the JS library)

stimulus_grid is a client-side data grid built from Stimulus controllers. **The
HTML is the configuration** — there is no JS options object. You write a
`<table>`, annotate it with `data-*` attributes, and the controllers enhance it.

## Setup (pick one)

**Plain script (no bundler):** the IIFE bundle includes Stimulus.
```html
<link rel="stylesheet" href="/path/dist/stimulus_grid.css" />
<script src="/path/dist/stimulus_grid.js"></script>
<script>StimulusGrid.start()</script>
```

**ES module / importmap:** the ESM bundle externalizes `@hotwired/stimulus`.
```js
import { Application } from "@hotwired/stimulus"
import StimulusGrid from "stimulus_grid"
const app = Application.start()
StimulusGrid.start(app)
```

`StimulusGrid.start(app?)` registers the controllers (`grid`, `header-cell`,
`pagination`, plus `row`/`cell`/`filter` extension points) and returns the
Application. Call it once.

## Minimal grid

```html
<div data-controller="grid" data-grid-pagination-value="true"
     data-grid-page-size-value="20" style="height: 480px">
  <table>
    <thead>
      <tr>
        <th data-controller="header-cell" data-header-cell-field-value="name"
            data-header-cell-sortable-value="true"
            data-header-cell-filter-value="text"
            data-header-cell-editable-value="true">Name</th>
        <th data-controller="header-cell" data-header-cell-field-value="age"
            data-header-cell-type-value="number"
            data-header-cell-sortable-value="true"
            data-header-cell-filter-value="number">Age</th>
      </tr>
    </thead>
    <tbody><!-- server-rendered <tr data-row-id> rows OR left empty for JS data --></tbody>
  </table>
</div>
```

The grid needs a height: set `style="height:…"` (or a CSS class), or use
`data-grid-dom-layout-value="autoHeight"`.

## Three ways to provide rows

1. **Server-rendered** — put `<tr data-row-id="…">` with `<td data-col-id="field">`
   cells in the `<tbody>`. The grid parses them into its dataset on connect.
2. **JSON URL** — `data-grid-row-data-url-value="/people.json"` (array of objects).
3. **JS** — after `grid:ready`: `el.gridApi.setRowData([{id:1, name:"Ada", age:36}])`.

Each row needs a stable id. Default field is `id`; override with
`data-grid-get-row-id-value="uuid"`.

## Grid attributes (on the `data-controller="grid"` element)

`data-grid-row-data-url-value` · `data-grid-row-selection-value` (`single`|`multiple`) ·
`data-grid-row-multi-select-with-click-value` · `data-grid-suppress-row-click-selection-value` ·
`data-grid-pagination-value` · `data-grid-page-size-value` · `data-grid-row-height-value` ·
`data-grid-header-height-value` · `data-grid-virtual-value` · `data-grid-virtual-threshold-value` ·
`data-grid-height-value` · `data-grid-get-row-id-value` · `data-grid-dom-layout-value` (`autoHeight`) ·
`data-grid-row-group-cols-value` (JSON array) · `data-grid-agg-funcs-value` (JSON `{field:fn}`) · `data-grid-group-default-expanded-value` (`-1` all · `0` none · `N` levels) · `data-grid-group-reorder-columns-value` (default `true`).

## Column attributes (on each `<th data-controller="header-cell">`)

`data-header-cell-field-value` (required) · `-header-name-value` ·
`-type-value` (`text`|`number`|`date`|`boolean`) · `-sortable-value` ·
`-filter-value` (`text`|`number`|`date`|`boolean`|`set`) · `-editable-value` ·
`-width-value` / `-min-width-value` / `-max-width-value` ·
`-pinned-value` (`left`|`right`) · `-hidden-value` · `-resizable-value` ·
`-cell-renderer-value` (template id) · `-cell-editor-value` (template id) ·
`-checkbox-value` (renders a selection checkbox column).

## gridApi (on `element.gridApi`, ready after `grid:ready`)

```js
const api = document.querySelector('[data-controller~="grid"]').gridApi
api.setRowData(rows); api.getRowData(); api.applyTransaction({ add, update, remove })
api.setColumnVisible(id, bool); api.setColumnPinned(id, "left"|"right"|null); api.sizeColumnsToFit()
api.setSortModel([{ colId:"age", sort:"desc" }]); api.getSortModel()
api.setQuickFilter("text")                  // searches all columns
api.setColumnFilter("age", { filterType:"number", type:"greaterThan", value:30 })
api.setFilterModel({ age:{ filterType:"number", type:"inRange", value:20, value2:40 } })
api.selectAll(); api.getSelectedRows(); api.getSelectedRowIds()
api.paginationGoToPage(2); api.paginationGetRowCount()
api.startEditingCell({ rowId:1, colId:"name" }); api.stopEditing()
api.exportDataAsCsv({ onlySelected:false, fileName:"data.csv" })
api.setRowGroupColumns(["country","sport"])  // group rows (multi-col = nested); [] ungroups
api.setColumnAggFunc("gold","sum"); api.expandAll(); api.collapseAll()
```

`applyTransaction` matches rows by id — pass objects carrying the same id type as
the dataset (numbers stay numbers). To update one field, spread the row:
`api.applyTransaction({ update:[{ ...row, age:40 }] })`.

## Events (on the grid element)

`grid:ready` (`detail.api`) · `grid:rowDataChanged` · `grid:cellClicked`
(`{rowId,colId,value}`) · `grid:rowClicked` · `grid:cellValueChanged`
(`{rowId,colId,oldValue,newValue}`) · `grid:selectionChanged` ·
`grid:filterChanged` · `grid:sortChanged` · `grid:paginationChanged` ·
`grid:columnMoved`/`Pinned`/`Resized`/`Visible` · `grid:columnRowGroupChanged` · `grid:groupToggled`.

```js
grid.addEventListener("grid:ready", (e) => e.detail.api.setRowData(rows))
grid.addEventListener("grid:cellValueChanged", (e) => save(e.detail))
```

## Custom renderers and editors

Define `<template>` elements and reference them by id:

```html
<template id="medals">
  <span class="pill" data-bind="sport" data-bind-attr="data-sport"></span>
</template>
<template id="sport-editor">
  <select data-editor-input>
    <option>Swimming</option><option>Cycling</option>
  </select>
</template>
```

- **Renderer** (`cell-renderer`): cloned per cell. `data-bind="field"` sets the
  node's text to `row.field`; `data-bind-text` uses the formatted value;
  `data-bind-attr="name"` sets that attribute to the cell value. Applies to the
  root node and every matching descendant.
- **Editor** (`cell-editor`): cloned when editing. Mark the value control with
  `[data-editor-input]` (else the first input/select/textarea is used). It is
  seeded with the current value, focused, and read on commit. A column can have
  both a custom renderer and a custom editor.

## Editing behavior

Double-click an editable cell to edit. **Enter** commits, **Escape** cancels,
**blur** commits, **Tab/Shift+Tab** commit and move to the next/previous editable
cell (wrapping within the page). On commit the grid fires `grid:cellValueChanged`
and updates its dataset; persist by listening to that event.

## Cell selection & copy

Cells aren't browser-text-selectable; the grid has a Numbers/Sheets-style model
(default `data-grid-cell-selection-value="true"`):

Mouse (cells):
- **click** → active cell (outline; not filled)
- **shift+click / drag** → rectangular cell range
- **Cmd/Ctrl+click** → add a non-contiguous range (multi-range); **Cmd/Ctrl+drag** extends it

Keyboard:
- **arrows** move the active cell; **Shift+arrows** extend the range; **Tab/Shift+Tab** move
- **Cmd/Ctrl+A** → select all rows (grids with row selection) or all cells
- **Enter** edits the active cell; **type a character** starts editing seeded with it
- **Delete/Backspace** clears the selected editable cells; **Esc** clears the selection
- **Cmd/Ctrl+C** copies the active range as TSV

Row selection: add a **row-number gutter** column —
`<th data-controller="header-cell" data-header-cell-row-number-value="true" data-header-cell-pinned-value="left">` —
then click the number to select the row, Shift+click for a range, Cmd/Ctrl+click to add.
(Or a checkbox column via `data-header-cell-checkbox-value="true"`.) Active cell =
outline; cell range = blue; row selection = green — distinct on purpose.

Highlights are distinct: active cell = accent **outline box**; cell range = **blue**
fill (`data-cell-range`); row selection = **green** fill (`data-selected`).
`Cmd/Ctrl+C` copies the range as TSV. `gridApi.getCellSelection()` →
`{ anchor, focus, rowCount, colCount }`; `getCellRangeValues()` → 2D array;
`getCellSelectionRowIds()` → row ids in the range; `grid:cellSelectionChanged`
fires on change. Set `cell-selection-value="false"` to restore plain-click row
selection (for row-selection-centric grids).

## Server-side row model

For very large datasets, run the grid in server-side mode: set
`data-grid-server-side-value="true"` and `data-grid-row-count-value="<total>"`,
load only the current page into `rowData`, and on `grid:paginationChanged` /
`grid:sortChanged` fetch that window from your server and call
`gridApi.setRowData(window)` + `gridApi.setRowCount(total)`. Pagination math then
reflects the full server total though only one page is in the DOM. (The
`stimulus_grid_rails` gem wires this end-to-end.)

## Row grouping & aggregation

Group rows by one or more columns and roll up per-group aggregates. Declare it
on the grid element, or drive it at runtime through the API:

```html
<div data-controller="grid"
     data-grid-row-group-cols-value='["country","sport"]'
     data-grid-agg-funcs-value='{"gold":"sum","age":"avg"}'
     data-grid-group-default-expanded-value="-1">  <!-- -1 all · 0 none · N levels -->
```

```js
api.setRowGroupColumns(["country"])   // [] ungroups; multiple fields nest
api.setColumnAggFunc("gold", "sum")   // sum · avg · min · max · count · first · last
api.expandAll(); api.collapseAll()    // or click a group row to toggle it
```

Each group row shows the value + leaf `(count)` in the grouped column and the
aggregate under each aggregated column; numeric aggregates skip non-numbers.
Grouping is client-side and composes after sort, so leaves stay sorted within
their group. Grouped columns float to the front while grouping (set
`data-grid-group-reorder-columns-value="false"` to keep your column order). Group
rows aren't selectable or editable; cell selection, CSV export and
`getSelectedRows()` operate on leaf rows only.

## Gotchas

- The grid manages its own `<tbody>` (re-renders rows, virtualizes). Don't mutate
  `<td>` DOM directly — change data via `gridApi`/transactions and use renderers.
- Row id type matters for `applyTransaction` and selection — keep ids consistent
  (the grid coerces numeric-looking ids from `data-row-id` to numbers).
- Set a height on the grid element or virtual scrolling has nothing to scroll.
- Quick filter + per-column filters + sort all compose; the display pipeline is
  filter → quick filter → sort → group → paginate → window.
