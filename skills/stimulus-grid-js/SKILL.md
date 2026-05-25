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
`data-grid-row-group-cols-value` (JSON array) · `data-grid-agg-funcs-value` (JSON `{field:fn}`) · `data-grid-group-default-expanded-value` (`-1` all · `0` none · `N` levels) · `data-grid-group-display-type-value` (`'singleColumn'` default · `'inline'`) · `data-grid-group-reorder-columns-value` (inline mode only, default `true`) ·
`data-grid-status-bar-value` (default `false`) · `data-grid-status-bar-aggs-value` (JSON array, default `["count","sum","avg","min","max"]`) ·
`data-grid-pivot-mode-value` (default `false`) · `data-grid-pivot-cols-value` (JSON array of fields whose unique values become columns) ·
`data-grid-side-panel-value` (default `false` — render the right-side drag-driven groups/pivots/values panel) ·
`data-grid-column-groups-value` (JSON array of multi-row header groups: `[{headerName, children:[field,...]}]`) ·
`data-grid-pinned-bottom-row-value` (default `false` — sticky bottom row with grand totals computed from `agg-funcs`) ·
`data-grid-persist-key-value` (default `""`; when set, the grid auto-saves/restores its layout to `localStorage["sgrid:" + persistKey]`).

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
api.getRangeAggregates()                       // {count,sum,avg,min,max} for the active cell range, or null
api.setPivotMode(true); api.setPivotColumns(["sport"])          // reshape into a pivot table
api.setValueColumns([{ field:"gold", aggFunc:"sum" }])          // cell aggregations (also drives group totals)
api.getPivotColumns(); api.getValueColumns(); api.isPivotMode() // read pivot/value state
api.setColumnGroups([{ headerName:"Medals", children:["gold","silver","bronze"] }])  // multi-row headers
api.setPinnedBottomRow(true)                                    // sticky grand-totals row at the bottom
api.getColumnState()                                             // JSON-serializable snapshot (cols, groups, pivot, values, sort, filter, …)
api.applyColumnState(state); api.clearPersistedState()           // restore + wipe the localStorage blob
```

`applyTransaction` matches rows by id — pass objects carrying the same id type as
the dataset (numbers stay numbers). To update one field, spread the row:
`api.applyTransaction({ update:[{ ...row, age:40 }] })`.

## Events (on the grid element)

`grid:ready` (`detail.api`) · `grid:rowDataChanged` · `grid:cellClicked`
(`{rowId,colId,value}`) · `grid:rowClicked` · `grid:cellValueChanged`
(`{rowId,colId,oldValue,newValue}`) · `grid:selectionChanged` ·
`grid:cellSelectionChanged` · `grid:rangeAggsChanged` (`{aggs}` — fires when the
status-bar aggregates change) · `grid:filterChanged` · `grid:sortChanged` ·
`grid:paginationChanged` · `grid:columnMoved`/`Pinned`/`Resized`/`Visible` ·
`grid:columnRowGroupChanged` · `grid:groupToggled` ·
`grid:pivotModeChanged` (`{pivot}`) · `grid:columnPivotChanged` (`{pivotCols}`) ·
`grid:columnValueChanged` (`{valueCols}`) · `grid:columnGroupsChanged` (`{columnGroups}`) ·
`grid:columnMenuOpened` (`{colId}`) · `grid:columnStateApplied` (`{state}`).

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

By default the grid renders an **auto Group column** on the left with the
indented hierarchy + leaf `(count)`; the grouped columns themselves are hidden
from the main display and each row's aggregates line up under the remaining
columns. Numeric aggregates skip non-numbers. Set
`data-grid-group-display-type-value="inline"` to put the label in the grouped
column's own cell instead (keeping it visible). Grouping is client-side and
composes after sort. Group rows aren't selectable or editable; cell selection,
CSV export and `getSelectedRows()` operate on leaf rows only.

## Status bar

A spreadsheet-style footer at the bottom of the grid. Off by default; turn it
on with `data-grid-status-bar-value="true"`. Shows the row count (with the
`X of Y` split when a filter is active), the selection count (when any rows
are selected), and live aggregates over the active cell range — same building
blocks as group aggregations, but scoped to the user's selection:

```html
<div data-controller="grid"
     data-grid-row-data-url-value="/athletes.json"
     data-grid-status-bar-value="true"
     data-grid-status-bar-aggs-value='["count","sum","avg","min","max"]'>
```

`status-bar-aggs` defaults to all five (`count`, `sum`, `avg`, `min`, `max`)
and can be subset/reordered. `count` is the number of non-empty cells in the
selection; the numeric aggs skip non-numerics (booleans, dates, text). Multi-
range selections (`Cmd/Ctrl+click` to add ranges) are unioned. Read the same
numbers with `gridApi.getRangeAggregates()` (returns `null` when no range), or
listen for `grid:rangeAggsChanged` to render your own UI.

## Pivot mode & side panel

`pivot-mode` reshapes the data: `row-group-cols` form the vertical axis,
`pivot-cols` (unique values become columns) the horizontal, and `agg-funcs`
entries are the value aggregations. A synthetic **(All)** totals row sits
at the top; leaf rows are aggregated away. Empty intersections render blank
(not `0`). With one value field, headers show the pivot combo (`"Swimming"`);
with multiple, they include the agg + field (`"Swimming · sum(gold)"`).

```html
<div data-controller="grid"
     data-grid-row-data-url-value="/athletes.json"
     data-grid-row-group-cols-value='["country"]'
     data-grid-pivot-cols-value='["sport"]'
     data-grid-agg-funcs-value='{"gold":"sum"}'
     data-grid-pivot-mode-value="true"
     data-grid-side-panel-value="true">
```

```js
api.setPivotMode(true)
api.setRowGroupColumns(["country"])
api.setPivotColumns(["sport"])
api.setValueColumns([{ field:"gold", aggFunc:"sum" }])
api.setColumnAggFunc("gold", "avg")     // change agg func at runtime
```

`side-panel` mounts an `<aside data-controller="side-panel">` inside `.sg-grid`
that drives groups / pivot columns / value aggregations + column visibility
via drag-and-drop. Sections: **Pivot mode** (toggle) · **Columns** (every real
column with visibility checkbox + group/pivot/sum tags) · **Row Groups** ·
**Values** (each chip has a click-to-cycle agg badge: sum → avg → count → min
→ max) · **Column Labels** (pivot mode only). A field lives in at most one of
{rowGroup, pivot, value} — dropping into a section removes it from the others.
Click the tab icon on the panel's right edge to collapse to just the tab strip.

Events: `grid:pivotModeChanged` · `grid:columnPivotChanged` (`{pivotCols}`) ·
`grid:columnValueChanged` (`{valueCols}`). Sorting on the synthetic pivot
columns is disabled in this release; filters still apply to the underlying
leaf rows before the pivot.

## Column header groups & pinned bottom row

Two independent layout features. **Column header groups** stack a row of
parent headers above the leaf headers; **pinned bottom row** glues a grand-
totals row to the bottom of the viewport.

```html
<div data-controller="grid"
     data-grid-agg-funcs-value='{"gold":"sum","silver":"sum","age":"avg"}'
     data-grid-pinned-bottom-row-value="true"
     data-grid-column-groups-value='[
       {"headerName":"Medals","children":["gold","silver","bronze"]}
     ]'>
```

```js
api.setColumnGroups([{ headerName:"Medals", children:["gold","silver","bronze"] }])
api.setPinnedBottomRow(true)
```

Pivot mode **auto-derives** nested headers from each pivot col's `pivotKeys` +
the value field/agg — no extra config needed. The header gets one row per
pivot field (plus one for the value tier when there are multiple value
configs). Same-labelled sub-groups under different parents don't merge.

The pinned bottom row uses `grandTotals` from the configured `agg-funcs` over
the currently filtered leaves; it's suppressed in pivot mode because the
`(All)` totals row already serves that role at the top. Event:
`grid:columnGroupsChanged` (`{columnGroups}`). v1 limits user-declared
groups to one level; pivot-derived groups can be arbitrarily deep.

## Right-click column menu & persisted state

**Right-click any leaf header** opens a popup with: Pin left/right/Unpin,
Autosize, Group/Ungroup, Pivot/Unpivot, Aggregate (sum/avg/count/min/max
with the active one marked `✓`) and Remove aggregation, Hide column, Show
all columns. Items only appear when they make sense for the col + grid
state. Synthetic cols (gutter, checkbox, auto-Group, pivot result) don't
get the menu. Event: `grid:columnMenuOpened` (`{colId}`).

`data-grid-persist-key-value` enables auto-save/restore through
`localStorage["sgrid:" + persistKey]`:

```html
<div data-controller="grid" data-grid-persist-key-value="reports.athletes">
```

```js
api.getColumnState()        // captures everything below into a JSON-safe object
api.applyColumnState(state) // restores; fires grid:columnStateApplied
api.clearPersistedState()   // wipes the saved blob
```

The serialised state covers col order/width/pinning/visibility, row groups,
pivot mode + pivot cols, value aggregations, header groups, the pinned
bottom row toggle, sort, filter and quick filter. Writes are debounced 200
ms and flushed on `beforeunload` so a Cmd+R right after a change doesn't
drop state. Subscribers re-render off one `grid:columnStateApplied` event
instead of every granular event, so the side panel + status bar update in
one shot.

## Gotchas

- The grid manages its own `<tbody>` (re-renders rows, virtualizes). Don't mutate
  `<td>` DOM directly — change data via `gridApi`/transactions and use renderers.
- Row id type matters for `applyTransaction` and selection — keep ids consistent
  (the grid coerces numeric-looking ids from `data-row-id` to numbers).
- Set a height on the grid element or virtual scrolling has nothing to scroll.
- Quick filter + per-column filters + sort all compose; the display pipeline is
  filter → quick filter → sort → group → paginate → window.
