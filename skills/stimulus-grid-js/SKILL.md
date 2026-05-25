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
`data-grid-persist-key-value` (default `""`; when set, the grid auto-saves/restores its layout to `localStorage["sgrid:" + persistKey]`) ·
`data-grid-master-detail-value` (default `false` — enable expandable detail rows) · `data-grid-detail-template-value` (id of a `<template>` cloned into each detail panel) · `data-grid-detail-rows-key-value` (master-row field holding nested rows; auto-seeds an inner `[data-controller="grid"]` inside the template) · `data-grid-detail-row-height-value` (minimum panel height in px, default `240`) ·
`data-grid-tree-data-value` (default `false` — treat `rowData` as a self-referential `parent_id` tree) · `data-grid-tree-parent-field-value` (default `"parent_id"`) · `data-grid-tree-display-field-value` (which column hosts the indent + chevron; default first non-gutter col) · `data-grid-tree-default-expanded-value` (`-1` all · `0` only roots · `N` first-N levels) ·
`data-grid-accept-files-value` (default `false` — when `true`, every data cell becomes a file drop target and dispatches a cancellable `grid:fileAttached` event; if no listener calls `preventDefault()`, file metadata is appended to `row[attachmentsField]`) · `data-grid-attachments-field-value` (which field collects appended file metadata; default is the drop-target's own column).

## Column attributes (on each `<th data-controller="header-cell">`)

`data-header-cell-field-value` (required) · `-header-name-value` ·
`-type-value` (`text`|`number`|`date`|`boolean`) · `-sortable-value` ·
`-filter-value` (`text`|`number`|`date`|`boolean`|`set`) · `-editable-value` ·
`-width-value` / `-min-width-value` / `-max-width-value` ·
`-pinned-value` (`left`|`right`) · `-hidden-value` · `-resizable-value` ·
`-cell-renderer-value` (template id) · `-cell-editor-value` (template id) ·
`-checkbox-value` (renders a selection checkbox column) ·
`-accept-files-value` (`"true"`|`"false"` — per-column opt-in/opt-out of the grid-wide drag-to-attach behaviour).

Numeric headers (`type="number"`) auto-right-align via a `data-type="number"`
attribute the grid sets on the `<th>`; values right-align as before.

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
api.getPivotResultColumns()                                      // current synthetic pivot cols: [{field, headerName, pivotKeys, valueField, aggFunc}]
api.setColumnGroups([{ headerName:"Medals", children:["gold","silver","bronze"] }])  // multi-row headers
api.setPinnedBottomRow(true)                                    // sticky grand-totals row at the bottom
api.getColumnState()                                             // JSON-serializable snapshot (cols, groups, pivot, values, sort, filter, …)
api.applyColumnState(state); api.clearPersistedState()           // restore + wipe the localStorage blob
api.setMasterDetail(true); api.expandDetailRow(rowId)             // toggle detail panels per master row
api.toggleDetailRow(rowId); api.collapseAllDetails(); api.getDetailExpandedRowIds()
api.setTreeData(true); api.setTreeParentField("parent_id")        // self-referential tree (org chart, file tree)
api.expandTreeRow(rowId); api.toggleTreeRow(rowId)
api.expandAllTreeRows(); api.collapseAllTreeRows(); api.getTreeExpandedRowIds()
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
`grid:columnMenuOpened` (`{colId}`) · `grid:columnStateApplied` (`{state}`) ·
`grid:detailRowExpanded`/`grid:detailRowCollapsed` (`{rowId, masterRow}`) ·
`grid:detailRowMounted` (`{rowId, masterRow, detailEl, nestedGridApi}`) ·
`grid:treeRowExpanded`/`grid:treeRowCollapsed` (`{rowId, row}`) ·
`grid:treeDataChanged` (`{treeData}`) ·
`grid:fileAttached` (`{rowId, colId, files, row, dataTransfer}` — cancellable;
fires when files are dropped on a cell while `accept-files` is on. Call
`preventDefault()` to take over persistence; otherwise the grid appends
`{filename, byte_size, content_type, url}` entries to `row[attachmentsField]`).

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

## Built-in cell renderers

`cell-renderer` first resolves as a `<template>` id (above); when no template
matches, it falls through to the renderer registry. Ten functional renderers
ship pre-registered:

| Name | Use for |
|---|---|
| `email` | Mailto link when valid; red text otherwise |
| `url` | Anchor showing `hostname[/path]`, new tab |
| `phone` | `tel:` anchor with AU-aware formatting |
| `currency` | USD by default, right-aligned, tabular-nums |
| `percent` | `N%` suffix, right-aligned |
| `progress-bar` | Clamped 0-100 visual bar (green default) |
| `star-rating` | Half-star precision, SVG glyphs |
| `tags` | CSV / array → pill chips |
| `country-flag` | 2-letter ISO code → emoji + code |
| `abn` | Australian Business Number; valid → ABR lookup, invalid → red |
| `avatar` | Image (or initials) + name; reads `window.__sgUsers` by default |
| `date` / `datetime` | `Intl.DateTimeFormat` — locale + `dateStyle` / `timeStyle` configurable |
| `relative-time` | "3 days ago" / "in 2 hours"; absolute timestamp on hover |
| `duration` | `2h 14m` (compact), `02:14:32` (clock), or words; ms/sec/min input |
| `number` / `compact-number` / `file-size` | `Intl.NumberFormat`-based; right-aligned tabular-nums; `compact-number` does `1.2K/3.4M/1.2B`; `file-size` does bytes → KiB/MiB/GiB (binary default) |
| `boolean` | Visual upgrade on text `✓` — green check / muted X / dash for null; recognises `true`/`1`/`"yes"`/`"on"` |
| `delta` | Signed % / number / currency with up/down arrow + green/red; `{ inverted: true }` for churn-style columns where positive is bad |
| `truncate` | Single-line ellipsis at cell width, full value in `title=`; `{ chars: N }` clips by character count |
| `copyable` | Value + tiny copy-to-clipboard button (appears on row hover); confirms with a brief green check |
| `image` | Inline thumbnail; configurable size + `rounded`; `{ clickToZoom: true }` opens a centred overlay |
| `color-swatch` | Coloured chip + label; takes any CSS colour (hex / `rgb()` / `hsl()` / `oklch()` / named); `{ shape: 'square' }`, `{ label: 'name' }`, `{ showLabel: false }` |
| `sparkline` | Mini SVG line/area/bar chart from a numeric array; auto-scales y; palette colours or any CSS colour; pure SVG, no library |
| `heatmap-cell` | Colour-graded cell **background** on a numeric scale; `min`/`max` + 2-or-3-stop palette; `inverted` flips for "lower is better" columns; text colour auto-flips dark/light for legibility |
| `mask` | Mask sensitive data — format presets `cc-last4`, `cc-bin-last4`, `phone-last4`, `email`, `last4`, or generic `{ showFirst, showLast, char }`; groups right-aligned so the visible last-N always sits as a clean trailing block (Amex-friendly); numeric formats auto-right-align in monospace |
| `highlight` | Wraps matches of the grid's active `quickFilter` in `<mark>` tags — case-insensitive by default; pass `{ query }` for a fixed search term |
| `multi-line` | Preserves `\n` newlines + optional `{ lines: N }` clamp; bump `data-grid-row-height-value` to fit |
| `attachments` | Airtable-style file strip: image thumbs + kind-tinted icons for PDFs/docs/audio/video/zips; click an image → lightbox carousel (← / → / Esc); click a file → opens in a new tab. `editable: true` enables a popover editor (dblclick or `+` button) with drag-drop, paste, and per-tile × remove; supply `onUpload(files, ctx)` / `onRemove(att, ctx)` to persist to your server. Value shape: `[{ id, filename, url, content_type, byte_size, thumb_url? }]` |
| `address-au` | One-line formatted AU street address — `12 Smith Street, Bondi NSW 2026` — with the state shown as a colour-coded badge (NSW sky · VIC navy · QLD maroon · WA gold · SA red · TAS forest · ACT/NT ochre). Dblclick opens a multi-field popover editor (address1, address2, optional address3, suburb, state dropdown, postcode, country). Commits via `applyTransaction` + fires `grid:cellValueChanged`. Value shape: `{ address1, address2?, address3?, suburb, state, postcode, country? }`; pass `{ editable: false }` for display-only |
| `checkbox` | Interactive boolean toggle — sibling of `boolean` but live: click flips the row's value. Null / undefined / `''` renders as indeterminate. Commits via `applyTransaction` + fires `grid:cellValueChanged`. Pass `{ disabled: true }` for a read-only checkbox |
| `switch` | Sliding on/off pill, same data semantics as `checkbox`. Null cycles to true on first click (avoids null → false → true two-click trap). Useful when the column reads better as a control affordance than as a logical flag. `renderers.switch(...)` is the builder name (alias for `switchRenderer` to avoid the reserved keyword) |
| `markdown` | Tiny dependency-free Markdown subset: `**bold**`, `*italic*`, `` `code` ``, `~~strike~~`, `[text](url)` (http/https/mailto only), and `-` / `1.` lists. Cell value is HTML-escaped before parsing — `<script>` survives as literal text. Pass `{ inline: true }` for a one-liner pass (no lists, no `<br>`) |
| `json` | Collapsible pretty-print for object / array values. Collapsed form is a one-line summary (`{ a: 1, b: "foo", +2 }` / `[1, 2, 3, +5]`); expand toggles a syntax-highlighted indented block via native `<details>`. Accepts a JSON string and parses it (passes through verbatim if not valid). `maxKeys` controls how many keys/items the summary shows |
| `linked-record` | Airtable-style FK chip — value is a key, resolver returns `{ name, thumb?, color?, href? }`. Same three-step lookup chain as `avatar` (function → window map → fallback). Per-entry `color` tints the chip background; `href` (string from entry or via `href: (val,row,entry) ⇒ url`) makes it an `<a>` opening in a new tab. `multiple: true` for array-of-keys columns (one chip per key) |
| `coloured-tags` | Sibling of `tags` with per-value colour mapping. `colorMap: { p0: 'red', p1: 'orange', … }` keys lower-cased before lookup. Palette names (`gray`/`red`/`orange`/`yellow`/`green`/`blue`/`indigo`/`purple`/`pink`) hit the `.sg-pill-*` tokens; raw CSS colours (`#hex`, etc.) tint inline with auto-readable foreground |
| `time` | Time-of-day-only sibling to `date` / `datetime`. Accepts `"HH:MM"`, `"HH:MM:SS"`, a full ISO timestamp, a `Date`, or seconds-since-midnight. `style: '12h'` switches to AM/PM via `Intl`; `seconds: true` adds the trailing `:SS` block |
| `diff` | Audit-log before/after. Accepts `{ from, to }` (also `{ old, new }`, `{ before, after }`, `{ previous, current }`), `[from, to]`, or a `"from → to"` string. Inline = single line, `style: 'stacked'` for two-line. One-sided changes render as a `+ added` (green) or `− removed` (red strikethrough) without the arrow |
| `geo` | Lat-lng coords + "View on Maps" link. Accepts `[lat, lng]`, `{ lat, lng }` (also `{ latitude, longitude }`, `{ lat, lon }`), or `"lat,lng"` string. `style: 'dms'` switches to surveyor / aviation `33°52'07.7"S` notation. `staticMap: (lat,lng) ⇒ url` paints a tile thumbnail beside the coords; `mapUrl` overrides the destination URL (default Google Maps) |
| `qr` | Inline SVG QR code from the cell value. Pure-JS encoder (Reed-Solomon over GF(2⁸), versions 1-10, ECC=M ≈ 15% recovery, byte mode). 213-byte cap; over-capacity values fall back to "QR · too long". `moduleSize` controls pixel density, `margin` the quiet zone, `showText: true` prints the encoded value beside the matrix |
| `code` | Dark monospace block for code-like cell values (CLI commands, snippets, SQL). Different shape from `copyable` (styled-label-with-chip) and `markdown` (`` `code` `` inline only). Pass `language: 'sh' | 'sql' | 'js' | …` for a small uppercase label in the top-right; `copy: false` to hide the copy button |

**Editable renderers.** Every renderer except `sparkline` and the
`statusPill` family supports inline editing. Set `editable: true` on the
column and the `type` attribute picks the right native input —
`type="email"` → `<input type="email">`, `type="url"` → `<input type="url">`,
`type="tel"`, `type="number"`, `type="date"`, `type="datetime"` →
`<input type="datetime-local">`, `type="color"` → `<input type="color">`,
`type="boolean"` → `<select>`. On commit the cell re-renders through the
renderer with the new value. Native pickers (color, date, datetime, time,
month, week) auto-open via `showPicker()` on dblclick — no second click.

**Structured-value renderers** (`attachments`, `address-au`) ship their
own popover editors — dblclick opens a bespoke form (file uploader,
multi-field address form) rather than the standard cell editor.
They write back via `api.applyTransaction({ update: [row] })` and fire
`grid:cellValueChanged` like the standard editor does.

```html
<th data-controller="header-cell" data-header-cell-field-value="email"
    data-header-cell-cell-renderer-value="email">Email</th>
```

For badge/pill status columns (every "status" column converges on the same
shape), use the `statusPill(colorMap, iconMap?)` builder once at app boot
and reference it by name from HTML:

```js
import { registerRenderer, renderers } from "@ninjaai/stimulus_grid"

registerRenderer("subscription", renderers.statusPill({
  subscribed: "green", unsubscribed: "yellow", "not-subscribed": "gray",
}))

registerRenderer("fulfillment", renderers.statusPill({
  fulfilled: "gray", delivered: "green", "in-transit": "blue",
  pending: "yellow", rejected: "red",
}, {
  fulfilled: "check-circle", delivered: "check-circle",
  "in-transit": "truck", pending: "clock", rejected: "x-circle",
}))
```

Pill colours: `gray`, `red`, `orange`, `yellow`, `green`, `blue`, `indigo`,
`purple`, `pink`. Built-in icon names: `check`, `check-circle`, `x-circle`,
`clock`, `truck`, `dot`, `circle`, `half-circle`, `alert`, `cart` (or pass
your own SVG string per status).

Writing your own:

```js
registerRenderer("severity", ({ value, td }) => {
  td.classList.add(`severity-${value}`)
  return value.toUpperCase()
})
```

A renderer is `({value, row, col, td, formatted}) → HTMLElement | string |
void`. Return an element/string and the grid drops it in; return nothing
and the renderer is assumed to have mutated `td` directly. See **demo 19**.

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
`grid:columnValueChanged` (`{valueCols}`). Filters apply to the underlying
leaf rows before the pivot.

**Sortable pivot columns.** Click any pivot column header to sort sibling
group rows by that aggregate (asc → desc → off; shift-click appends to a
multi-sort). The **(All)** totals row stays pinned at the top regardless.
Sort survives renders + `persist-key` reloads. To drive it from code,
discover the synthetic field id via `gridApi.getPivotResultColumns()`
(returns `[{field, headerName, pivotKeys, valueField, aggFunc}, …]` for
the current render), then feed it to `setSortModel`:

```js
const swm = api.getPivotResultColumns().find(c => c.headerName === "Swimming")
api.setSortModel([{ colId: swm.field, sort: "desc" }])
```

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

## Right-click column menu

Right-click any leaf header for a popup with pin / autosize / group /
pivot / aggregate / hide. Always on; no setup attribute. Items appear
only when they make sense for that col + the current grid state:

- Pin left / Pin right / Unpin
- Autosize this column / Autosize all columns
- Group by {col} / Ungroup {col}
- Pivot by {col} / Remove {col} from pivot (turns pivot mode on if off)
- Aggregate: sum / avg / count / min / max (with `✓` on the active one) +
  Remove aggregation
- Hide column / Show all columns

Synthetic cols (gutter, checkbox, auto-Group, pivot result) don't get the
menu. Outside-click / Escape / window resize / capture-scroll all close
it. Event: `grid:columnMenuOpened` (`{colId}`).

## Persisted column state

`data-grid-persist-key-value` auto-saves and restores the layout through
`localStorage["sgrid:" + persistKey]`:

```html
<div data-controller="grid" data-grid-persist-key-value="reports.athletes">
```

```js
api.getColumnState()        // JSON-safe snapshot of the layout
api.applyColumnState(state) // restore; fires grid:columnStateApplied
api.clearPersistedState()   // wipe the saved blob
```

The snapshot covers column order / width / pinning / visibility, row
groups, pivot mode + pivot cols, value aggregations, column header
groups, the pinned-bottom-row toggle, sort, filter and quick filter.
Writes are debounced 200 ms and flushed synchronously on `beforeunload`
so a Cmd+R right after a change doesn't drop state. Subscribers re-render
off a single `grid:columnStateApplied` event instead of every granular
event, so the side panel + status bar update in one shot.

## Master/detail rows

Expand a master row to reveal a detail panel beneath it — typically a
nested grid of related rows (orders → line items), but any HTML cloned
from a `<template>` works.

```html
<div data-controller="grid"
     data-grid-master-detail-value="true"
     data-grid-detail-template-value="order-detail-tpl"
     data-grid-detail-rows-key-value="lineItems"
     data-grid-detail-row-height-value="280">
  <table><thead><tr><!-- master columns --></tr></thead><tbody></tbody></table>
</div>

<template id="order-detail-tpl">
  <div class="detail">
    <header>
      Order #<span data-detail-bind="id"></span> ·
      <span data-detail-bind="customer"></span> ·
      <span data-detail-bind="status" data-detail-bind-attr="data-status:status"></span>
    </header>
    <!-- Inner grid is auto-seeded from master.lineItems (detail-rows-key). -->
    <div data-controller="grid" data-grid-row-height-value="28">
      <table><thead><tr><!-- line-item columns --></tr></thead><tbody></tbody></table>
    </div>
  </div>
</template>
```

- Template supports `[data-detail-bind="<field>"]` (text), `[data-detail-bind-attr="<attr>:<field>"]` (attribute), and `[data-detail-if="<field>"]` (drop the node when falsy).
- A `[data-controller~="grid"]` inside the template gets its `data-grid-row-data-value` seeded from `master[detailRowsKey]` before Stimulus boots it. The mounted nested `gridApi` arrives on the `grid:detailRowMounted` event.
- A 32 px pinned-left gutter column is prepended for the expand chevron; click it to toggle.
- Detail rows are display-only (no selection, CSV, range aggs, or keyboard nav).
- Suppressed in pivot / grouped views; the grid switches to non-virtual rendering whenever master/detail is on, so this is best for dozens-to-hundreds of master rows.
- All grid events bubble — when listening on the outer grid, scope nested-grid handlers with `if (e.target !== grid) return` or the outer `grid:ready` handler will fire from the inner grid's mount too.

```js
api.setMasterDetail(true)
api.expandDetailRow(orderId); api.toggleDetailRow(orderId)
api.expandAllDetails(); api.collapseAllDetails()
api.getDetailExpandedRowIds()
```

## Tree data (self-referential `parent_id`)

`tree-data` flattens rows whose `parent_id` (or whichever field
`tree-parent-field` names) wires the hierarchy — org charts, file trees,
BOMs, comment threads. Distinct from row grouping (which synthesises a
hierarchy from column values); here each row is a real entity. Leaves and
branches share the same column layout.

```html
<div data-controller="grid"
     data-grid-tree-data-value="true"
     data-grid-tree-parent-field-value="parent_id"
     data-grid-tree-display-field-value="name">
```

```js
api.setTreeData(true); api.setTreeParentField("parent_id")
api.expandTreeRow(rowId); api.toggleTreeRow(rowId)
api.expandAllTreeRows(); api.collapseAllTreeRows()
api.getTreeExpandedRowIds()
```

- The configured `tree-display-field` column gets an indent + chevron per
  row; leaves reserve an empty chevron slot so columns align across rows.
  Default is the first non-gutter column.
- `tree-default-expanded`: `-1` all expanded · `0` only roots · `N` first-N levels.
- **Filter behaviour:** a quick-filter or column-filter match keeps the
  row's full ancestor chain visible (you always see the path to the
  match), and a matching parent keeps its full subtree visible. Kept rows
  are force-expanded while a filter is active.
- **Sort:** `sortModel` reorders siblings inside each parent; tree shape
  is preserved.
- **No row mutation.** Tree metadata (level / hasChildren / expanded)
  lives in a sidecar `treeMeta` Map on the display list; user rows stay
  clean for `JSON.stringify`.
- **Cycles + orphans** are tolerated: a missing/cyclic/self parent makes
  the row a root.
- **Mutually exclusive** with `row-group-cols` and `pivot-mode` — both
  assume a flat dataset.
- Events: `grid:treeRowExpanded`/`grid:treeRowCollapsed`
  (`{rowId, row}`), `grid:treeDataChanged` (`{treeData}`).

## Separators & merged cells (quote/invoice/report layouts)

Two structural primitives let one grid render a real-world tax invoice or
quote without forking into a separate document component.

**Separator rows** — any `rowData` entry carrying `__sgSeparator: true`.
The shape decides the variant:

```js
{ __sgSeparator: true }                                      // blank spacer
{ __sgSeparator: true, variant: 'divider' }                  // thin ruled line
{ __sgSeparator: true, label: 'Professional services' }      // section heading
{ __sgSeparator: true, label: 'Subtotal', value: '$17,364' } // summary line
{ __sgSeparator: true, variant: 'total',
  label: 'Total due', value: '$19,100.40' }                  // emphasised grand total
{ __sgSeparator: true, variant: 'subtle', label: 'Notes' }   // muted heading
```

Variants: `heading` (auto when only `label`), `summary` (auto when `label`
+ `value`), `total`, `subtle`, `blank`, `divider`. Explicit `variant` wins
over the auto-pick.

- **Positional anchors.** Separators always render in declared position;
  sort and filter only reorder / hide the data rows *around* them. Quote
  sections stay intact when the user clicks a header to sort.
- **Inert.** Never selected, edited, exported to CSV, counted in
  aggregates, or stepped over by keyboard navigation.
- **HTML-first equivalent:** `<tr data-separator="heading"
  data-label="Hardware"></tr>` (with optional `data-value="…"`).

**Merged cells** — per-row `__sgSpans` map: each key is a field name,
each value is how many visible columns that cell should swallow.

```js
{
  id: 6,
  description: '↪ Includes preconfigured Raspbian image + 12 months remote support.',
  total: 0,
  __sgSpans: { description: 3 },   // covers description + qty + unit-price
}
```

HTML-first: standard `colspan` on the `<td>` (or `data-spans="N"`) — the
grid picks it up during initial-markup capture.

See **demo 33** (`demo/33-invoice-separators-merged.html`) for a worked
tax invoice with section headings, a description-spanning note row, and a
Subtotal / GST 10% / Total due summary block — on the same grid that
sorts, edits, and exports CSV.

## Drag-to-attach files

With `data-grid-accept-files-value="true"`, every data cell becomes a
file drop target. On drop the grid fires a cancellable
`grid:fileAttached` event with `{rowId, colId, files, row, dataTransfer}`.

- If a listener calls `preventDefault()`, the consumer takes over (e.g.,
  uploads to S3, then calls `applyTransaction` with the persisted URLs).
- Otherwise the grid synthesises `{filename, byte_size, content_type,
  url: blob://…}` entries and appends them to `row[attachmentsField]`
  (defaults to the drop target's own column, override with
  `data-grid-attachments-field-value`).
- Per-column opt-out: `data-header-cell-accept-files-value="false"` on
  the `<th>` (e.g., for read-only id columns).
- Pairs naturally with the `attachments` renderer — drop files onto an
  attachments cell and they render immediately.

```html
<div data-controller="grid"
     data-grid-accept-files-value="true"
     data-grid-attachments-field-value="files">
  <table>…</table>
</div>
```

```js
grid.addEventListener('grid:fileAttached', async (e) => {
  e.preventDefault()
  const persisted = await uploadToServer(e.detail.files)
  api.applyTransaction({ update: [{ ...e.detail.row, files: [...(e.detail.row.files || []), ...persisted] }] })
})
```

## Gotchas

- The grid manages its own `<tbody>` (re-renders rows, virtualizes). Don't mutate
  `<td>` DOM directly — change data via `gridApi`/transactions and use renderers.
- Row id type matters for `applyTransaction` and selection — keep ids consistent
  (the grid coerces numeric-looking ids from `data-row-id` to numbers).
- Set a height on the grid element or virtual scrolling has nothing to scroll.
- Quick filter + per-column filters + sort all compose; the display pipeline is
  filter → quick filter → sort → group → paginate → window.
