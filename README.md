# stimulus_grid

An **HTML-first data grid for [Stimulus.js](https://stimulus.hotwired.dev/) (Hotwire)**.
Drop `data-controller="grid"` on a `<table>`, describe columns with `data-*`
attributes, and you get sort, filter, global search, single/multi selection,
pagination, inline editing, custom cell renderers **and editors**, column
resize/reorder/pin/hide, virtual scrolling for large datasets, and a public
`gridApi` — no React, no build-time config object, no third-party grid framework.

The HTML is the source of truth: a `stimulus_grid` table is a real `<table>` that
renders without JS and progressively enhances.

> Looking for the Rails/Hotwire server-driven version (live multi-user editing
> over Turbo Streams, server-side search/filter, optimistic updates, undo/redo)?
> See [`gem/stimulus_grid_rails`](gem/stimulus_grid_rails). LLM usage docs live
> in [`skills/`](skills).

---

## Install

**Option A — plain `<script>` (no bundler).** Self-contained IIFE bundle with
Stimulus included; works over `file://`, a static server, anything:

```html
<link rel="stylesheet" href="dist/stimulus_grid.css" />
<script src="dist/stimulus_grid.js"></script>
<script> StimulusGrid.start() </script>
```

**Option B — ES module / importmaps.** `dist/stimulus_grid.esm.js` externalizes
`@hotwired/stimulus` (pin it yourself):

```js
import { Application } from "@hotwired/stimulus"
import StimulusGrid from "stimulus_grid"   // dist/stimulus_grid.esm.js

const app = Application.start()
StimulusGrid.start(app)                     // registers grid, header-cell, pagination, …
```

`StimulusGrid.start(app?)` registers all controllers on the given Stimulus
`Application` (or starts a new one) and returns it.

## Quick start

```html
<link rel="stylesheet" href="dist/stimulus_grid.css" />

<div data-controller="grid"
     data-grid-pagination-value="true"
     data-grid-page-size-value="20"
     style="height: 480px">
  <table>
    <thead>
      <tr>
        <th data-controller="header-cell" data-header-cell-field-value="name"
            data-header-cell-sortable-value="true" data-header-cell-filter-value="text"
            data-header-cell-editable-value="true">Name</th>
        <th data-controller="header-cell" data-header-cell-field-value="age"
            data-header-cell-type-value="number" data-header-cell-sortable-value="true"
            data-header-cell-filter-value="number">Age</th>
      </tr>
    </thead>
    <tbody>
      <tr data-row-id="1"><td data-col-id="name">Ada</td><td data-col-id="age">36</td></tr>
      <tr data-row-id="2"><td data-col-id="name">Linus</td><td data-col-id="age">54</td></tr>
    </tbody>
  </table>
</div>

<script src="dist/stimulus_grid.js"></script>
<script>StimulusGrid.start()</script>
```

Rows can be **server-rendered** (as above — parsed into the dataset on connect),
loaded from a **URL** (`data-grid-row-data-url-value="/data.json"`), or set in JS
via `element.gridApi.setRowData([...])`.

## Grid attributes (`data-grid-*-value`)

| Attribute | Meaning |
|---|---|
| `row-data-url` | URL returning a JSON array of row objects |
| `row-selection` | `""` \| `"single"` \| `"multiple"` |
| `row-multi-select-with-click` | multi-select on plain click (no modifier) |
| `suppress-row-click-selection` | don't select on row click |
| `pagination` / `page-size` | enable paging + rows per page |
| `row-height` / `header-height` | pixel sizes |
| `virtual` / `virtual-threshold` | force virtual scrolling / auto-on threshold |
| `height` | CSS height of the scroll viewport (e.g. `"480px"`) |
| `get-row-id` | row-object field used as identity (default `id`) |
| `dom-layout` | `""` \| `"autoHeight"` |
| `server-side` / `row-count` | server-side row model: `rowData` is one page; `row-count` is the server total (drives pagination) |

## Column attributes (`data-header-cell-*-value`, on each `<th>`)

`field` · `header-name` · `type` (`text`\|`number`\|`date`\|`boolean`) ·
`sortable` · `filter` (`text`\|`number`\|`date`\|`boolean`\|`set`) · `editable` ·
`width` / `min-width` / `max-width` · `pinned` (`left`\|`right`) · `hidden` ·
`resizable` · `cell-renderer` (template id) · `cell-editor` (template id) ·
`checkbox` (selection checkbox column).

## Public API — `element.gridApi`

Available after the `grid:ready` event. Highlights:

- **Data:** `setRowData(rows)`, `getRowData()`, `applyTransaction({add,update,remove})`, `setRowCount(total)` / `getRowCount()` (server-side)
- **Cell selection:** `getCellSelection()` (active + range), `getCellRangeValues()` — click for an active cell, drag/shift+click for a range, `Cmd/Ctrl+C` copies it as TSV
- **Columns:** `setColumnDefs`, `getColumnDefs`, `setColumnVisible`, `setColumnPinned`, `setColumnWidth`, `moveColumn`, `autoSizeColumn`, `autoSizeAllColumns`, `sizeColumnsToFit`
- **Sort:** `setSortModel`, `getSortModel`
- **Filter:** `setFilterModel`, `getFilterModel`, `setColumnFilter`, `setQuickFilter`, `getQuickFilter`
- **Selection:** `selectAll`, `deselectAll`, `selectRow`, `deselectRow`, `getSelectedRows`, `getSelectedRowIds`
- **Pagination:** `paginationGoToPage/FirstPage/NextPage/PreviousPage/LastPage`, `paginationSetPageSize`, `paginationGetCurrentPage/TotalPages/RowCount/PageSize`
- **Editing:** `startEditingCell({rowId, colId})`, `stopEditing(cancel?)`
- **Export:** `getDataAsCsv(opts)`, `exportDataAsCsv(opts)`

## Events (dispatched on the grid element)

`grid:ready` · `grid:rowDataChanged` · `grid:cellClicked` · `grid:rowClicked` ·
`grid:cellValueChanged` (`{rowId, colId, oldValue, newValue}`) ·
`grid:selectionChanged` · `grid:filterChanged` · `grid:sortChanged` ·
`grid:paginationChanged` · `grid:columnMoved/Pinned/Resized/Visible`.

```js
grid.addEventListener("grid:ready", (e) => e.detail.api.setRowData(rows))
grid.addEventListener("grid:cellValueChanged", (e) => console.log(e.detail))
```

## Custom cell renderers & editors (via `<template>`)

```html
<template id="badge">
  <span class="badge" data-bind="status" data-bind-attr="data-status"></span>
</template>
<template id="status-editor">
  <select data-editor-input>
    <option>active</option><option>paused</option>
  </select>
</template>

<th data-controller="header-cell" data-header-cell-field-value="status"
    data-header-cell-editable-value="true"
    data-header-cell-cell-renderer-value="badge"
    data-header-cell-cell-editor-value="status-editor">Status</th>
```

- **Renderer** clones the template per cell. `data-bind="field"` → element text =
  `row.field`; `data-bind-text` → formatted value; `data-bind-attr="name"` → set
  attribute to the cell value. Works on the root node and any descendant.
- **Editor** clones the template on edit. The control marked `[data-editor-input]`
  (or the first `input`/`select`/`textarea`) is seeded with the current value,
  focused, and read back on commit (Enter / Tab / blur).

## Demos

`npm install && npx vite`, then open `http://localhost:5173/demo/` — 10 demos
covering basics, JSON data, filtering, selection, pagination, editing, custom
renderers, 10k-row virtual scroll, everything-together, and live filtering.

## Build

```bash
npm run build:lib   # builds dist/stimulus_grid.js (IIFE) + dist/stimulus_grid.esm.js (ESM) + .css
```

See [`DESIGN.md`](DESIGN.md) for architecture and the full API reference, and
[`skills/`](skills) for LLM-oriented usage guides.

## License

MIT.
