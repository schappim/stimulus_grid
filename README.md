# stimulus_grid

[![CI](https://github.com/schappim/stimulus_grid/actions/workflows/ci.yml/badge.svg)](https://github.com/schappim/stimulus_grid/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@ninjaai/stimulus_grid?label=npm)](https://www.npmjs.com/package/@ninjaai/stimulus_grid)
[![stimulus_grid_rails gem](https://img.shields.io/gem/v/stimulus_grid_rails?label=stimulus_grid_rails)](https://rubygems.org/gems/stimulus_grid_rails)

An **HTML-first data grid for [Stimulus.js](https://stimulus.hotwired.dev/) (Hotwire)**.
Drop `data-controller="grid"` on a `<table>`, describe columns with `data-*`
attributes, and you get sort, filter, global search, single/multi selection,
pagination, inline editing, custom cell renderers **and editors**, column
resize/reorder/pin/hide (double-click a resize handle to autosize), virtual scrolling for large datasets, row grouping with per-group aggregation, a spreadsheet-style **status bar** with live range aggregates, **pivot mode** with a drag-driven **side panel** for groups/pivots/values, **multi-row column header groups** (auto-derived in pivot mode), a sticky **pinned bottom row** for grand totals, a **right-click column menu** for one-click pin/hide/group/pivot/aggregate, **persisted column state** that round-trips through `localStorage`, **master/detail rows** that expand to reveal a nested grid (orders → line items), **tree data** rendered from a self-referential `parent_id` (org charts, file trees, BOMs), **separator + merged-cell rows** for quote / invoice / report layouts, and a **library of ~200 built-in cell renderers** — from the core (email/URL/phone, currency, percent, progress bars, star ratings, country flags, ABNs, avatars, status pills, attachments, sparklines, heatmaps, masks, multi-line, address-au) through editor-renderers (select, multiselect, combobox, date/time/date-range/color pickers, slider, textarea) and row-action surfaces (action-button, menu, split-button, row-actions, drag-handle, row-number, expand-toggle) all the way to industry domains (FSM job status, SLA/DLP countdowns, AU compliance certificates — white card / blue card / WWCC / HRWL / COES / QBCC / VBA / refrigerant / asbestos / pool-safety / test-and-tag / insurance currency, BSB / ACN / TFN / Medicare, NMI / DBYD / BAL / NABERS / NCC class, insurance claims & loss adjusters, locksmith keyways / bittings / MKS / safe ratings / transponder chips / MLAA / SCEC, fleet rego & CTP & service-due, and many more) — all pre-registered and reference-able by name, plus a public
`gridApi` — no React, no build-time config object, no third-party grid framework.
With the optional [`stimulus_grid_rails`](gem/stimulus_grid_rails) companion,
edits also **stream live to every connected client over Turbo Streams** (Action
Cable) — optimistic updates, server-side validation, and undo/redo included.

The HTML is the source of truth: a `stimulus_grid` table is a real `<table>` that
renders without JS and progressively enhances.

![stimulus_grid — sortable, filterable data grid with pinned columns, custom medal renderers, multi-row selection, and pagination](docs/images/grid-overview.png)

> Prefer the Rails/Hotwire server-driven version — live multi-user editing over
> Turbo Streams, server-side search/filter, optimistic updates, and undo/redo? It
> ships as the **`stimulus_grid_rails`** gem; see the **Rails & Hotwire** section
> below, [`gem/stimulus_grid_rails`](gem/stimulus_grid_rails), and
> [`RAILS.md`](RAILS.md). LLM usage docs live in [`skills/`](skills).

---

## Install

**Option A — plain `<script>` (no bundler).** Self-contained IIFE bundle with
Stimulus included; works over `file://`, a static server, anything. Vendor the
files from `dist/`, or load them from a CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/@ninjaai/stimulus_grid/dist/stimulus_grid.css" />
<script src="https://unpkg.com/@ninjaai/stimulus_grid/dist/stimulus_grid.js"></script>
<script> StimulusGrid.start() </script>
```

**Option B — npm + a bundler (Vite, esbuild, webpack…).** Stimulus is a peer
dependency, so install it alongside:

```bash
npm install @ninjaai/stimulus_grid @hotwired/stimulus
```

```js
import { Application } from "@hotwired/stimulus"
import StimulusGrid from "@ninjaai/stimulus_grid"   // resolves to dist/stimulus_grid.esm.js
import "@ninjaai/stimulus_grid/style.css"

const app = Application.start()
StimulusGrid.start(app)                     // registers grid, header-cell, pagination, …
```

`StimulusGrid.start(app?)` registers all controllers on the given Stimulus
`Application` (or starts a new one) and returns it.

**Option C — Rails / Hotwire (gem from RubyGems).** The
[`stimulus_grid_rails`](https://rubygems.org/gems/stimulus_grid_rails) gem bundles
this grid *and* the live-sync layer, importmap-pinned — no JS build, no `dist/`
to vendor:

```bash
bundle add stimulus_grid_rails
```

Full setup (importmap, stylesheet, routes, optional migration) is in the
**Rails & Hotwire** section below.

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

## Screenshots

**Spreadsheet-style cell selection** — click for an active cell, click-drag or
shift-click for a range; `Cmd/Ctrl+C` copies the selection as TSV;
`Cmd/Ctrl+V` pastes TSV back, parsing each cell through the column
renderer's `parseValue` (a single value tiles across the selection).

![A block of cells selected by dragging, the active cell outlined and the range filled blue](docs/images/grid-cell-selection.png)

**Per-column filtering** — hover a header for the filter icon; popovers adapt to
the column type (text / number / date / boolean).

![A column filter popover open over the grid with a "contains United" condition](docs/images/grid-filter.png)

**Inline editing** — double-click an editable cell; type-aware editors commit on
Enter / Tab / blur and emit `grid:cellValueChanged`.

![A grid cell being edited inline with a focused text input](docs/images/grid-editing.png)

**Row grouping & aggregation** — group by one or more columns; each group row
rolls up per-column aggregates (sum / avg / min / max / count) in an auto **Group**
column on the left. Collapsed here to country subtotals:

![stimulus_grid grouped by country and collapsed to subtotals — the Group column on the left lists each country with its athlete count, and total medals + average age are aggregated under their headers](docs/images/grid-grouping-collapsed.png)

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
| `row-group-cols` / `agg-funcs` / `group-default-expanded` / `group-reorder-columns` | row grouping: fields to group by (JSON array), per-column aggregation `{field: fn}` (JSON), default expand depth (`-1` all · `0` none · `N` levels), and whether to float grouped columns to the front while grouping (default `true`) |
| `status-bar` / `status-bar-aggs` | enable the bottom status bar (default `false`) and pick which range aggregates to show (default `["count","sum","avg","min","max"]`) |
| `pivot-mode` / `pivot-cols` | reshape into a pivot table (default `false`); `pivot-cols` is a JSON array of fields whose unique values become columns. Requires at least one `agg-funcs` entry to populate cells |
| `side-panel` | render a right-side tool panel for drag-driven row groups / pivots / value aggregations + column visibility (default `false`) |
| `column-groups` | JSON array of multi-row header groups: `[{"headerName":"Medals","children":["gold","silver","bronze"]}]`. Pivot mode auto-derives nested headers from `pivot-cols` + `agg-funcs`; this attribute is for non-pivot grids |
| `pinned-bottom-row` | render a sticky bottom row holding grand totals over the currently filtered leaves, computed from `agg-funcs` (default `false`) |
| `persist-key` | when non-empty, auto-save/restore column order, widths, pinning, visibility, row groups, pivot, value aggregations, header groups, sort, filter and pinned-bottom-row toggle to `localStorage["sgrid:" + persistKey]` |
| `master-detail` / `detail-template` / `detail-rows-key` / `detail-row-height` | enable expandable detail rows beneath each master row. `detail-template` is the id of a `<template>` cloned into each detail panel; `detail-rows-key` is the master-row field holding the nested rows array (auto-seeds an inner `[data-controller="grid"]` inside the template). `detail-row-height` is the panel's minimum pixel height (default `240`) |
| `tree-data` / `tree-parent-field` / `tree-display-field` / `tree-default-expanded` | treat `rowData` as a self-referential parent/child tree (default `false`). `tree-parent-field` names the row attribute holding the parent's id (default `"parent_id"`). `tree-display-field` picks which column hosts the indent + chevron (default: first non-gutter column). `tree-default-expanded` is `-1` all · `0` only roots · `N` first-N levels. Mutually exclusive with row groups + pivot mode |
| `accept-files` / `attachments-field` | drag-to-attach: when `true`, every data cell becomes a file drop target and dispatches a cancellable `grid:fileAttached` event with `{rowId, colId, files, row, dataTransfer}`. If the consumer doesn't `preventDefault()`, file metadata (`{filename, byte_size, content_type, url, …}`) is appended to `row[attachments-field]` (default: the drop target's own column). Per-column opt-out: `data-header-cell-accept-files-value="false"` on the `<th>` |

## Column attributes (`data-header-cell-*-value`, on each `<th>`)

`field` · `header-name` · `type` (`text`\|`number`\|`date`\|`datetime`\|`boolean`\|`color`\|`email`\|`url`\|`tel`) ·
`sortable` · `filter` (`text`\|`number`\|`date`\|`boolean`\|`set`) · `editable` ·
`width` / `min-width` / `max-width` · `pinned` (`left`\|`right`) · `hidden` ·
`resizable` · `cell-renderer` (template id) · `cell-editor` (template id) ·
`checkbox` (selection checkbox column) · `accept-files` (`"true"`\|`"false"` — per-column opt-in / opt-out of the grid-wide drag-to-attach behaviour).

Headers whose `type` is `number` get their title text right-aligned in line
with the value cells underneath, so columns of currency / counts read with
a clean right edge.

## Public API — `element.gridApi`

Available after the `grid:ready` event. Highlights:

- **Data:** `setRowData(rows)`, `getRowData()`, `applyTransaction({add,update,remove})`, `setRowCount(total)` / `getRowCount()` (server-side)
- **Cell selection:** `getCellSelection()` (active + range), `getCellRangeValues()`, `getRangeAggregates()` (`{count,sum,avg,min,max}` for the current range, or `null`) — click for an active cell, drag/shift+click for a range, `Cmd/Ctrl+C` copies it as TSV, `Cmd/Ctrl+V` pastes back (each renderer's `copyValue` / `parseValue` keeps structured cells — selects, multi-selects, dates, JSON, addresses — round-trippable; rejected cells surface as `grid:pasteRejected`)
- **Columns:** `setColumnDefs`, `getColumnDefs`, `setColumnVisible`, `setColumnPinned`, `setColumnWidth`, `moveColumn`, `autoSizeColumn`, `autoSizeAllColumns`, `sizeColumnsToFit`
- **Sort:** `setSortModel`, `getSortModel`
- **Filter:** `setFilterModel`, `getFilterModel`, `setColumnFilter`, `setQuickFilter`, `getQuickFilter`
- **Selection:** `selectAll`, `deselectAll`, `selectRow`, `deselectRow`, `getSelectedRows`, `getSelectedRowIds`
- **Pagination:** `paginationGoToPage/FirstPage/NextPage/PreviousPage/LastPage`, `paginationSetPageSize`, `paginationGetCurrentPage/TotalPages/RowCount/PageSize`
- **Editing:** `startEditingCell({rowId, colId})`, `stopEditing(cancel?)`
- **Export:** `getDataAsCsv(opts)`, `exportDataAsCsv(opts)`
- **Row grouping:** `setRowGroupColumns([...])`, `addRowGroupColumn`, `removeRowGroupColumn`, `getRowGroupColumns`, `setColumnAggFunc(field, fn)` (`sum`/`avg`/`min`/`max`/`count`/`first`/`last`), `expandAll`, `collapseAll`
- **Pivot:** `setPivotMode(on)`, `isPivotMode()`, `setPivotColumns([...])`, `addPivotColumn`, `removePivotColumn`, `getPivotColumns`, `getPivotResultColumns()` (current synthetic pivot cols — `{field, headerName, pivotKeys, valueField, aggFunc}` — useful for driving `setSortModel` against a specific pivot)
- **Value columns** (aggregations — shared with grouping): `setValueColumns([{field,aggFunc}])`, `addValueColumn(field, aggFunc?)`, `removeValueColumn`, `getValueColumns`
- **Column header groups:** `setColumnGroups([{headerName, children:[field,...]}])`, `getColumnGroups()`
- **Pinned bottom row:** `setPinnedBottomRow(on)`, `isPinnedBottomRow()`
- **Column state:** `getColumnState()` returns a JSON-serializable snapshot (cols + groups + pivot + values + sort + filter + pinnedBottomRow); `applyColumnState(state)` restores it; with `persist-key` set, `clearPersistedState()` wipes the saved blob and `getPersistKey()` reads back the key
- **Master/detail:** `setMasterDetail(on)`, `isMasterDetail()`, `expandDetailRow(rowId)`, `collapseDetailRow(rowId)`, `toggleDetailRow(rowId)`, `expandAllDetails()`, `collapseAllDetails()`, `getDetailExpandedRowIds()`
- **Tree data:** `setTreeData(on)`, `isTreeData()`, `setTreeParentField(field)`, `expandTreeRow(rowId)`, `collapseTreeRow(rowId)`, `toggleTreeRow(rowId)`, `expandAllTreeRows()`, `collapseAllTreeRows()`, `getTreeExpandedRowIds()`

## Events (dispatched on the grid element)

`grid:ready` · `grid:rowDataChanged` · `grid:cellClicked` · `grid:rowClicked` ·
`grid:cellValueChanged` (`{rowId, colId, oldValue, newValue}`) ·
`grid:selectionChanged` · `grid:cellSelectionChanged` · `grid:rangeAggsChanged`
(`{aggs}`) · `grid:filterChanged` · `grid:sortChanged` ·
`grid:paginationChanged` · `grid:columnMoved/Pinned/Resized/Visible` ·
`grid:columnRowGroupChanged` · `grid:groupToggled` ·
`grid:columnPivotChanged` (`{pivotCols}`) · `grid:pivotModeChanged` (`{pivot}`) ·
`grid:columnValueChanged` (`{valueCols}`) ·
`grid:columnGroupsChanged` (`{columnGroups}`) ·
`grid:columnMenuOpened` (`{colId}`) · `grid:columnStateApplied` (`{state}`) ·
`grid:detailRowExpanded` / `grid:detailRowCollapsed` (`{rowId, masterRow}`) ·
`grid:detailRowMounted` (`{rowId, masterRow, detailEl, nestedGridApi}`) ·
`grid:treeRowExpanded` / `grid:treeRowCollapsed` (`{rowId, row}`) ·
`grid:treeDataChanged` (`{treeData}`) ·
`grid:fileAttached` (`{rowId, colId, files, row, dataTransfer}` — cancellable
with `preventDefault()` to suppress the built-in append-to-row default).

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

## Built-in cell renderers

**~200 functional renderers ship pre-registered** — reference them by name from
`data-header-cell-cell-renderer-value`. `cell-renderer` first resolves as a
`<template>` id (the section above); when no template matches, it falls
through to the renderer registry, so templates and named renderers coexist
without conflict. Run `listRenderers()` (or import it from
`@ninjaai/stimulus_grid`) for the full registry; the table below covers the
core / general-purpose set, and the **renderer library index** at the end
of this section catalogues the rest by domain.

![grid showing every built-in renderer in one row: avatar with initials, mailto email link, formatted phone, flag + country code, hostname-only URL, ABN with spaces (or red INVALID), USD currency, progress bar, percent, half-star rating, tag chips, plus four status pills — Subscribed/Delivered/Shopify/Express](docs/images/grid-renderers.png)

| Renderer | Use for | Notes |
|---|---|---|
| `email` | email addresses | `mailto:` anchor when valid; red text otherwise |
| `url` | links | Anchor showing `hostname[/path]`, opens in a new tab |
| `phone` | phone numbers | `tel:` anchor with AU-aware formatting |
| `currency` | money | USD by default; right-aligned, tabular-nums |
| `percent` | percentages | `N%` suffix, right-aligned |
| `progress-bar` | 0-100 values | Clamped bar; configurable colour |
| `star-rating` | ratings | Half-star precision, SVG glyphs |
| `tags` | CSV / arrays | Splits on commas → pill chips |
| `country-flag` | 2-letter ISO codes | Emoji flag + code label |
| `abn` | Australian Business Numbers | Checksum-validated → ABR lookup link; red on invalid |
| `avatar` | user references | Image (or initials) + name; reads from `window.__sgUsers`, `row[avatarField]`, or a custom `lookup` function |
| `date` | dates | `Intl.DateTimeFormat`-formatted; configurable locale + `dateStyle` |
| `datetime` | dates with time | Date + time via `Intl.DateTimeFormat`; configurable locale / `dateStyle` / `timeStyle` |
| `relative-time` | timestamps | "3 days ago" / "in 2 hours" via `Intl.RelativeTimeFormat`; absolute timestamp on hover |
| `duration` | elapsed time | `2h 14m` (compact), `02:14:32` (clock), or `2 hours 14 minutes` (words) from ms / sec / min |
| `number` | plain numbers | `Intl.NumberFormat`-formatted (comma-grouped); right-aligned, tabular-nums |
| `compact-number` | big numbers | `1.2K` / `3.4M` / `1.2B` (or `1.2 million` with `compactDisplay: 'long'`) |
| `file-size` | byte counts | Bytes → `KiB` / `MiB` / `GiB` (binary by default); pass `{ binary: false }` for `KB` / `MB` / `GB` |
| `boolean` | true / false / null | Green check / muted X / dash; recognises `true`, `1`, `"yes"`, `"on"`, etc.; `{ falseStyle: 'hidden' }` blanks false; `{ nullLabel: 'N/A' }` overrides the dash |
| `delta` | WoW / MoM / change | Signed value with up/down arrow + green/red text; `style: 'percent'` (default) / `'number'` / `'currency'`; `{ inverted: true }` flips colours for churn/error-rate columns |
| `truncate` | long text | Single-line ellipsis at the cell width, full value in `title=`; pass `{ chars: 60 }` to clip by character count instead |
| `copyable` | IDs / tokens / handles | Value + tiny copy-to-clipboard button (visible on row hover); flips to a check mark briefly on copy |
| `image` | thumbnails | Inline thumbnail (`loading="lazy"`, `decoding="async"`); `size`, `rounded: 'sm'/'lg'/'full'/'none'`, optional `clickToZoom` overlay (closes on click or Escape) |
| `color-swatch` | colours / theme tokens | Coloured chip + label; accepts any CSS colour value (hex, `rgb()`, `hsl()`, `oklch()`, named); `shape: 'circle'/'square'`, `label: 'value'/'name'/fn`, `showLabel: false` for chip-only |
| `sparkline` | numeric arrays / trends | Mini SVG `line` / `area` / `bar` chart per row; auto-scales y, or pass `baseline: 0`; configurable colour from a 7-key palette or any CSS colour; pure SVG, no library |
| `heatmap-cell` | KPIs / SLOs | Colour-grade the **cell background** on a numeric scale; configurable `min`/`max` + 2-or-3-stop palette; `inverted` flips "lower is better"; text colour auto-flips between dark + white for legibility |
| `mask` | credit cards / phones / tokens / SSNs | Mask sensitive values: format presets `cc-last4`, `cc-bin-last4`, `phone-last4`, `email`, `last4`, or a generic `{ showFirst, showLast, char }` — masking groups from the right so the visible last-N always forms a clean trailing block (handles Amex's 15-digit cards correctly). Numeric formats auto-right-align in monospace |
| `highlight` | search-result grids | Wraps matches of the grid's active `quickFilter` in `<mark>` tags so users see *why* a row matched; case-insensitive by default; pass a fixed `query` to highlight regardless of filter |
| `multi-line` | notes / descriptions / commit messages | Preserves `\n` newlines via `white-space: pre-line`; pass `{ lines: N }` for `-webkit-line-clamp` truncation with the full value in `title=`. Pair with a taller `data-grid-row-height-value` (~64 for 2 lines, 84 for 3) |
| `attachments` | files on a record (Active Storage / S3 / arbitrary) | Airtable-style strip of thumbs for images + kind-tinted icons for PDFs/docs/audio/video/zips; click an image to open a keyboard-navigable lightbox carousel; click a non-image to open in a new tab; collapses to `+N` past `maxThumbs`. Pass `{ editable: true }` to enable a popover editor (dblclick or `+` button) with drag-drop, paste, and per-file × remove; supply `onUpload(files, ctx)` / `onRemove(att, ctx)` to wire it to your server (Rails Active Storage, S3 presigned, etc.). Falls back to `URL.createObjectURL` when no callbacks are given |
| `address-au` | Australian street addresses | One-line formatted display — `12 Smith Street, Bondi NSW 2026` — with the state shown as a colour-coded badge (NSW sky, VIC navy, QLD maroon, WA gold, SA red, TAS forest, ACT ochre, NT ochre). Value shape: `{ address1, address2, address3, suburb, state, postcode, country }`. Dblclick a cell to open a multi-field popover editor with all seven fields laid out for AU conventions (state dropdown, 4-digit postcode, the third address line revealed only when needed). Commits via `applyTransaction` and fires `grid:cellValueChanged`. Pass `{ editable: false }` for display-only |
| `audio-attachment` | call recordings / voice notes / podcasts | Compact play-circle icon (+ optional filename / duration) in-cell; dblclick (or single-click) opens an anchored popover with play/pause, draggable scrub bar, current / total time, and ±10s skip buttons. Keyboard: ←/→ seek 5s (Shift = 30s), Home/End jump, Space toggles play. Value shape: a URL string, or `{ url, filename?, byte_size?, duration? }`. Uses [howler.js](https://howlerjs.com/) when `window.Howl` is defined (richer codec fallbacks + cross-browser consistency); otherwise falls back to native `<audio>` — same UI either way. Only one player is active at a time — opening a second cell closes the first. No audio is preloaded on cell render — the request fires only when the popover opens |

```html
<th data-controller="header-cell" data-header-cell-field-value="email"
    data-header-cell-cell-renderer-value="email">Email</th>
<th data-controller="header-cell" data-header-cell-field-value="rating"
    data-header-cell-cell-renderer-value="star-rating"
    data-header-cell-type-value="number">Rating</th>
<th data-controller="header-cell" data-header-cell-field-value="completion"
    data-header-cell-cell-renderer-value="progress-bar"
    data-header-cell-type-value="number">Onboarding</th>
```

### Status pills (`statusPill(colorMap, iconMap?)`)

Every "status" column in this codebase converges on the same shape — a
coloured pill with an optional icon. Register one per status column, then
reference it like any other renderer. The colour map keys are lower-cased
before lookup, so input data can be sloppy.

```js
import { registerRenderer, renderers } from "@ninjaai/stimulus_grid"

registerRenderer("subscription", renderers.statusPill({
  subscribed:       "green",
  unsubscribed:     "yellow",
  "not-subscribed": "gray",
}))

registerRenderer("fulfillment", renderers.statusPill({
  fulfilled:    "gray",  delivered: "green", "in-transit": "blue",
  pending:      "yellow", partial:   "orange", rejected:   "red",
}, {
  fulfilled:    "check-circle", delivered: "check-circle",
  "in-transit": "truck",        pending:   "clock",
  partial:      "half-circle",  rejected:  "x-circle",
}))
```

Built-in icon names: `check`, `check-circle`, `x-circle`, `clock`, `truck`,
`dot`, `circle`, `half-circle`, `alert`, `cart`. Pass a raw SVG string for
anything custom. Pill colours: `gray`, `red`, `orange`, `yellow`, `green`,
`blue`, `indigo`, `purple`, `pink`.

### Writing your own renderer

A renderer is one function. Return an element / HTML string and the grid
drops it into the `<td>`; return nothing and the renderer is assumed to
have mutated `td` directly. The grid passes the `td` so you can add
classes (right-align, etc.) without wrapping the cell content.

```js
import { registerRenderer } from "@ninjaai/stimulus_grid"

registerRenderer("severity", ({ value, td }) => {
  td.classList.add(`severity-${value}`)
  return value.toUpperCase()
})
```

See **[demo 19](demo/19-cell-renderers.html)** for every built-in side
by side.

### Structured-value renderers (`address-au`)

Most built-ins take a scalar value. `address-au` takes an **object**
and ships its own popover editor, since a multi-field form is the only
sensible edit affordance for a postal address.

![stimulus_grid address-au renderer: one-line display "12 Smith Street, Bondi NSW 2026" with the NSW state code shown as a colour-coded badge; alongside it, a multi-field popover editor titled "Edit address" with labelled inputs for address line 1, address line 2, suburb, state (dropdown), postcode, and country](docs/images/grid-address-au-editor.png)

Value shape:

```js
{
  address1: '12 Smith Street',
  address2: 'Unit 4',          // optional
  address3: 'Level 2',         // optional, revealed in the editor only when needed
  suburb:   'Bondi',
  state:    'NSW',             // NSW / VIC / QLD / WA / SA / TAS / ACT / NT
  postcode: '2026',            // 4 digits
  country:  'Australia',       // defaults to Australia; non-AU countries get a pill
}
```

Display: `address1[, address2], suburb STATE postcode` on one line —
state rendered as a colour-coded badge (each state takes its
traditional sporting / coat-of-arms colour, so locals recognise it at a
glance). The full multi-line address (including `address3`) appears in
the cell `title` for hover.

Editing: double-click any address cell to open a popover with all
seven fields. The third address line is hidden until the user types
into line 2 (or clicks "+ Add another line"). Commit with **Save** or
**Enter**; cancel with **Cancel** or **Esc**. The grid writes the new
object through `applyTransaction` and fires the standard
`grid:cellValueChanged` event — wire it to your server for
persistence:

```js
grid.addEventListener('grid:cellValueChanged', (e) => {
  if (e.detail.colId !== 'shipping_address') return
  fetch(`/customers/${e.detail.rowId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ shipping_address: e.detail.newValue }),
  })
})
```

Set `{ editable: false }` for a display-only column. See
**[demo 34](demo/34-address-au-renderer.html)** for a working example.

### Media renderers (`audio-attachment`)

`audio-attachment` is the audio counterpart of `attachments` — for the
single-file case where the cell is a recording (sales calls, voice
notes, podcast episodes) rather than an arbitrary file strip. The cell
renders as a compact play-circle icon with the filename next to it;
double-click (or single-click) the icon and a popover opens directly
under the cell with a play/pause toggle, a draggable scrub bar,
current / total time, and ±10s skip buttons. Only one player is active
at a time — opening a second cell closes the first.

Value shape:

```js
"https://cdn.example.com/calls/2026-05-22-chen.mp3"
// or
{
  url: 'https://cdn.example.com/calls/2026-05-22-chen.mp3',
  filename: 'call-chen-2026-05-22.mp3',  // shown in cell + popover header
  byte_size: 3_280_000,                  // optional — shown in popover
  duration: 204,                         // optional — populates the time
                                         //   display before audio metadata loads
}
```

**howler.js integration is opt-in by presence.** If `window.Howl` is
defined when the popover opens, the renderer delegates playback /
scrub / duration to a `Howl` instance (cross-browser consistency,
codec fallbacks, the `playing()` / `seek()` getters); otherwise it
uses a plain `new Audio()` — same player UI either way. To enable
Howler, drop in the CDN script tag before `stimulus_grid.js`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.4/howler.min.js"></script>
<script src="/path/dist/stimulus_grid.js"></script>
```

No audio is preloaded on cell render — the network request fires only
when the popover opens. A grid of 100 phone calls won't issue 100
range requests on page load.

Keyboard inside the popover: **Space** toggles play, **←/→** scrub 5s
(Shift = 30s), **Home/End** jump to start / end, **Esc** closes.

```html
<th data-controller="header-cell"
    data-header-cell-field-value="recording"
    data-header-cell-cell-renderer-value="audio-attachment">Recording</th>
```

For custom variants:

```js
registerRenderer('voicemail',
  renderers.audioAttachment({
    iconOnly: true,        // hide the filename, render the icon only
    skipSeconds: 15,       // ±15s instead of the default 10
  })
)
```

See **[demo 37](demo/37-audio-attachment-renderer.html)** for a CRM
call-log example paired with `datetime`, `duration`, and `relative-time`
columns from the date-renderers demo.

### Editing renderer cells

Every renderer except `sparkline` (multi-value) and the `statusPill`
family (no canonical input) supports inline editing. Set
`editable: true` on the column and pair the renderer with a `type` that
picks the right native input — the grid does the rest. On commit
(Enter / Tab / blur) the cell re-renders through the renderer with the
new value.

| Renderer | Column `type` | Native editor |
|---|---|---|
| `email` | `email` | `<input type="email">` |
| `url` / `image` | `url` | `<input type="url">` |
| `phone` | `tel` | `<input type="tel">` |
| `currency` / `percent` / `number` / `compact-number` / `file-size` / `progress-bar` / `star-rating` / `duration` / `delta` | `number` | `<input type="number">` |
| `date` | `date` | `<input type="date">` |
| `datetime` / `relative-time` | `datetime` | `<input type="datetime-local">` |
| `boolean` | `boolean` | `<select>` with `true`/`false`/`—` |
| `color-swatch` | `color` | `<input type="color">` |
| `tags` / `country-flag` / `abn` / `avatar` / `truncate` / `copyable` | _(default)_ | `<input type="text">` |

Native pickers auto-open on dblclick — `color`, `date`, `datetime`,
`time`, `month`, and `week` editors call `showPicker()` as soon as the
input mounts, so the user goes straight from "dblclick the cell" to "the
OS picker is up", no second click required.

### Renderer library index

The table further up covers the core renderers in detail. The rest of the
library is organised below by category, with the demo number where each is
showcased. Open `http://localhost:5173/demo/` for the live index, or jump
straight to a numbered file in `demo/`.

**Editor renderers** (popover / inline editors, single registration each):
`select` (70), `multiselect` (71), `combobox` (72), `slider` (73),
`date-picker` (74), `time-picker` (75), `date-range` (76), `color-picker` (77),
`textarea` (78).

**Row-action surfaces**: `action-button` (79), `menu` (80), `split-button` (81),
`row-actions` (82), `drag-handle` (83), `row-number` (84), `expand-toggle` (85).

**People & presence**: `avatar-stack` (86), `presence` (87), `assignee` (88),
`linked-record` (40), `mention` (53), `reactions` (63), `comment-count` (64).

**Content & document**: `markdown` (38), `json` (39), `html` (130), `yaml` (131),
`xml` (132), `code` (46), `autolink` (133), `diff` (43), `redacted` (134),
`spoiler` (135), `expand` (54).

**Numbers & math**: `ordinal` (65), `plural` (66), `fraction` (136),
`scientific` (137), `hex`/`binary`/`octal` (138), `percentile` (139),
`units` (55).

**Charts in a cell**: `bullet` (48), `donut` (49), `histogram` (50), `gauge` (105),
`win-loss` (106), `mini-bar-chart` (107), `mini-line-chart` (108), `trend` (109),
`rag` (51), `timeline-steps` (52), `waveform` (129).

**Time, schedule, lifecycle**: `time` (42), `countdown` (110), `age` (111),
`fiscal-period` (112), `timezone` (113), `cron` (114).

**Async / data-state cells**: `spinner` (115), `error` (116), `sync-status` (117),
`stale` (118), `fresh` (119), `loading-shimmer` (69), `empty` (67).

**Links & media**: `favicon` (120), `domain` (121), `social-link` (122),
`tracking-number` (123), `video-link` (124), `file` (125), `download-link` (126),
`mime-icon` (127), `gallery` (128), `audio` (61), `video` (62), `qr` (45),
`geo` (44).

**Geo / identity / regulated**: `mac-address` (100), `vin` (101), `isbn` (102),
`license-key` (103), `barcode` (104), `iban` (91), `swift` (92), `ssn` (93),
`ein` (94), `vat` (95), `nin` (UK, 96), `postal-code` (97),
`address-us` (98), `address-generic` (99), `uuid` (89), `git-sha` (90),
`credit-card` (68), `ip-address` (56), `bsb` (57), `acn` (58), `tfn` (59),
`medicare` (60), `email-thread` (200).

**Device telemetry**: `battery` (140), `signal-bars` (141), `volume` (142).

**Australian trade compliance** (143–160): `trade-licence`, `white-card`,
`blue-card`, `wwcc`, `high-risk-licence`, `coes`, `coc`, `qbcc-licence`,
`vba-licence`, `gas-certificate`, `asbestos-licence`, `refrigerant-licence`,
`pool-safety-cert`, `test-and-tag`, `insurance-cert`, `gst-status`,
`abn-status`, `hbcf-cert`.

**Field service / dispatch** (161–193): `job-status`, `arrival-window`,
`route-stop`, `travel-time`, `technician-slot`, `progress-claim`, `variation`,
`defect`/`snag`, `signature`, `job-photo`, `callout-fee`, `payment-terms`,
`invoice-status`, `retention`, `materials-pick`, `swms-status`, `jsa-status`,
`toolbox-talk`, `ppe-checklist`, `incident-severity`, `hazard-rating`,
`site-induction`, `trade-type`, `skill-endorsement`, `subcontractor`, `crew`,
`rego-plate`, `rego-status`, `ctp-status`, `service-due`, `fuel-card`,
`odometer`.

**Property / cadastral** (194–199, 242–249): `customer-type`, `strata-plan`,
`lot-plan`, `council-lga`, `region-classifier`, `suburb-postcode-au`,
`property-type`, `storeys-level-unit`, `switchboard-phase`, `hot-water-system`,
`ncc-class`, `bal-rating`, `heritage-flag`, `nabers-stars`, `watermark-rcm` (283),
`nmi` (240), `dbyd` (241).

**Quote / job workflow** (204–220, 230–239, 284–295): `sla-countdown`,
`quote-status`, `reattendance-counter`, `job-priority`, `booking-source`,
`tradie-tags`, `recurring-service`, `pc-dlp-countdown`, `inspection-result`,
`punch-list`, `timesheet-entry`, `penalty-rate`, `award-classification`,
`apprentice-supervision`, `visa-work-rights`, `lsl-portable-scheme`,
`clock-in-geostamp`, `bas-period`, `progress-claim-sop`, `refund-chargeback`,
`cost-code`, `authority-limit`, `insurance-claim`, `make-safe`,
`excess-collected`, `loss-adjuster`, `cause-of-loss`, `sms-status`,
`call-log`, `voicemail`, `portal-last-login`, `reminder-cadence`,
`group-by-date-sticky`, `saved-views-chips`, `offline-sync-row`,
`optimistic-save-cell`, `sync-conflict`, `row-freshness`, `quick-add-fab`.

**Inventory & pricing** (221–229): `idle-time`, `stock-level`,
`allocated-available`, `markup`, `uom-converter`, `supplier-price-rank`,
`special-order-eta`, `aged-receivables`, `payment-method`.

**Locksmith / physical security** (250–282): `keyway-profile`, `bitting-code`,
`pin-stack`, `cylinder-size`, `as4145-grade`, `en1303-grid`, `mks-hierarchy`,
`restricted-patent`, `key-authority-signatory`, `key-holder-register`,
`key-blank-xref`, `safe-cash-rating`, `safe-attack-rating`, `safe-fire-rating`,
`combo-change-log`, `time-lock-window`, `transponder-chip`, `cut-style`,
`fob-frequency`, `all-keys-lost`, `immobiliser-system`, `card-credential`,
`ansi-fcode`, `failsafe-rex-dps`, `loto-state`, `mlaa-membership`,
`scec-endorsement`, `probity-check`, `insurance-approved`, `lockout-urgency`,
`rekey-vs-replace`, `cylinder-condition`, `cutting-machine`.

**Other shapes**: `coloured-tags` (41), `rating` (heart / thumb / smiley / NPS — 47),
`switch` (sliding on/off pill — 36), `checkbox` (interactive — 35).

Every renderer above is a factory — call it without args for the default
shape, or pass an options object to tune it (e.g. `currency({ currency:
'EUR' })`, `rating({ icon: 'heart', max: 5 })`). The same factories are
re-exported under `renderers.*` for use in `registerRenderer('my-name',
renderers.X({…}))`.

## Row grouping & aggregation

Group rows by one or more columns and roll up per-group aggregates — turning the
grid into a lightweight reporting view. Grouping runs **client-side** and composes
with sort, filter, pagination and virtual scrolling.

![stimulus_grid grouped by country then sport — the auto Group column on the left holds the indented hierarchy with leaf counts, and per-column aggregates (medal sums, average age) line up under their headers; the grouped columns themselves are hidden from the main display](docs/images/grid-grouping.png)

Declare it on the grid element:

```html
<div data-controller="grid"
     data-grid-row-data-url-value="/athletes.json"
     data-grid-row-group-cols-value='["country", "sport"]'
     data-grid-agg-funcs-value='{"gold": "sum", "silver": "sum", "age": "avg"}'
     data-grid-group-default-expanded-value="-1">
  <!-- …columns… -->
</div>
```

| Attribute | Value |
|---|---|
| `row-group-cols` | JSON array of fields to group by, in hierarchy order (`["country","sport"]` nests sport under country) |
| `agg-funcs` | JSON map of `{ field: fn }`, where `fn` is `sum`, `avg`, `min`, `max`, `count`, `first`, or `last` |
| `group-default-expanded` | `-1` all expanded (default) · `0` all collapsed · `N` expand the first N levels |
| `group-display-type` | `'singleColumn'` (default) — auto **Group** column on the left, grouped columns hidden — or `'inline'` to put the label in the grouped column's own cell and keep it visible |
| `group-reorder-columns` | (`'inline'` mode only) float grouped columns to the front while grouping (default `true`; `false` keeps your column order) |

…or drive it at runtime through the API:

```js
const api = el.gridApi
api.setRowGroupColumns(["country"])   // [] to ungroup; multiple fields nest
api.addRowGroupColumn("sport")        // append a level
api.removeRowGroupColumn("sport")
api.setColumnAggFunc("gold", "sum")   // sum · avg · min · max · count · first · last
api.expandAll(); api.collapseAll()    // …or click a group row to toggle it
```

**How it renders.** By default the grid inserts an **auto Group column** on the
left whose cells hold the indented value + leaf `(count)` for each group row;
the columns being grouped are hidden from the main display (their values live in
the Group column). Aggregates line up under every other column on the group row.
Numeric aggregates skip non-numeric values; `count` counts leaves. Leaves stay
sorted within their group by the active sort model. Switch to
`data-grid-group-display-type-value="inline"` to put the label in the grouped
column's own cell instead and keep that column visible.

**Events:** `grid:columnRowGroupChanged` (`{ rowGroupCols }`) fires when the
grouping changes; `grid:groupToggled` (`{ groupId, expanded }`) when a group is
expanded or collapsed.

Group rows are display-only — they aren't selectable or editable, and cell
selection, CSV export and `getSelectedRows()` operate on leaf rows. Since grouping
is client-side, under the server-side row model it groups the rows currently
loaded. See **[demo 11](demo/11-row-grouping.html)** for a full example.

## Status bar

A spreadsheet-style footer that shows the row count (with the filtered/total
split when a filter is active), the selection count, and — whenever you select
a cell range — live aggregates over that range: count, sum, avg, min, max.
The same building blocks as group aggregations, scoped to the user's selection.

![stimulus_grid status bar — "Rows: 35 of 100" on the left (Country filtered to "United") and "Count: 18  Sum: 32  Avg: 1.78  Min: 0  Max: 8" on the right, computed live from a dragged Gold/Silver/Bronze selection](docs/images/grid-status-bar.png)

Enable it on the grid element:

```html
<div data-controller="grid"
     data-grid-row-data-url-value="/athletes.json"
     data-grid-status-bar-value="true"
     data-grid-status-bar-aggs-value='["count","sum","avg","min","max"]'>
  <!-- …columns… -->
</div>
```

| Attribute | Value |
|---|---|
| `status-bar` | `true` to render the footer (default `false`) |
| `status-bar-aggs` | JSON array picking which range aggregates to show, in order. Subset of `count`, `sum`, `avg`, `min`, `max` (default: all five) |

Numeric aggregates skip non-numeric cells (booleans, dates, text); `count` is
the number of non-empty cells in the selection. With multi-range selection
(`Cmd/Ctrl+click` to add ranges), the union is summarised. Group rows are not
included. Read the same numbers programmatically with `gridApi.getRangeAggregates()`
(returns `null` when there's no range), or subscribe to `grid:rangeAggsChanged`
to render your own UI. See **[demo 12](demo/12-status-bar.html)** for a working
example.

## Pivot mode & side panel

Reshape the data into a pivot table: row-group fields form the vertical axis,
the unique values of `pivot-cols` become columns, and the value fields (the
ones with an `agg-funcs` entry) aggregate into each cell. A synthetic **(All)**
totals row sits at the top; group rows underneath hold per-group aggregates;
leaf rows are aggregated away. The **side panel** on the right is a drag-driven
tool drawer that drives groups / pivot columns / value aggregations + column
visibility — the same controls as Excel pivot tables or AG-Grid's tool panel,
all going through the public `gridApi`.

![stimulus_grid in pivot mode — sport on the vertical axis, country on the horizontal, summed gold/silver/bronze in every cell; the side panel on the right shows the Columns list with PIVOT/GROUP/SUM tags, the Row Groups drop zone with "Sport", the Values zone with three SUM chips (Gold/Silver/Bronze), and the Column Labels zone with "Country"](docs/images/grid-pivot.png)

Enable both on the grid element:

```html
<div data-controller="grid"
     data-grid-row-data-url-value="/athletes.json"
     data-grid-row-group-cols-value='["country"]'
     data-grid-pivot-cols-value='["sport"]'
     data-grid-agg-funcs-value='{"gold":"sum"}'
     data-grid-pivot-mode-value="true"
     data-grid-side-panel-value="true">
  <!-- …columns… -->
</div>
```

| Attribute | Value |
|---|---|
| `pivot-mode` | `true` to pivot, `false` to render normally (default `false`). Toggle at runtime with `gridApi.setPivotMode(on)` |
| `pivot-cols` | JSON array of fields whose unique values become columns (`["sport"]` → one column per sport). Multiple fields produce one column per combination, sorted by each field in order |
| `side-panel` | `true` to render the right-side drag-driven tool panel (default `false`) |

…or drive it at runtime:

```js
const api = el.gridApi
api.setPivotMode(true)
api.setRowGroupColumns(["country"])           // rows
api.setPivotColumns(["sport"])                // columns
api.setValueColumns([                         // cells (sum of gold per cell)
  { field: "gold", aggFunc: "sum" },
])
api.addPivotColumn("medal")                   // adds a second pivot dimension
api.setColumnAggFunc("gold", "avg")           // changes the agg func for one value col
```

**How it renders.** With one value field, headers show the pivot combo only
(`"Swimming"`); with multiple, they include the agg + field
(`"Swimming · sum(gold)"`). Empty intersections render blank (not `0`),
matching Excel/Sheets conventions. Filters apply to the underlying leaf rows
before the pivot, so `country = "USA"` narrows the pivot to USA-only sports.

**Sortable pivot columns.** Click any pivot column header to sort sibling
group rows by that aggregate (asc → desc → off; shift-click to add to a
multi-sort). The synthetic **(All)** totals row stays pinned at the top
regardless. Sort is preserved across renders and round-trips through
`persist-key`, so reloads remember which pivot you sorted by.

![Pivot table with country rows × sport columns (Athletics, Cycling, Gymnastics, Swimming); Swimming column header has a descending sort indicator; USA pulled to the top with 24 in Swimming, then Australia 4, China 2, Norway 1, and Brazil + Jamaica with no swimming rows at the bottom; (All) totals row pinned above with 22/7/14/31](docs/images/grid-sortable-pivot.png)

```js
// You don't normally need this — clicks on the column header do it for you.
// Programmatic equivalent: find the synthetic field id via
// gridApi.getPivotResultColumns() then drive setSortModel directly.
const swm = api.getPivotResultColumns().find(c => c.headerName === "Swimming")
api.setSortModel([{ colId: swm.field, sort: "desc" }])
```

See **[demo 17](demo/17-sortable-pivot.html)** for a focused walk-through.

**The side panel.** Mounts as an `<aside data-controller="side-panel">` inside
`.sg-grid`. Sections (top → bottom):

- **Pivot mode** — checkbox at the top
- **Columns** — every real column with a visibility checkbox + small tags
  (`group` / `pivot` / `sum`) showing where it currently appears
- **Row Groups** — drop zone for fields used as `row-group-cols`
- **Values** — drop zone for fields with aggregations. Each chip has a click-to-cycle
  agg badge (`sum → avg → count → min → max`) and an × to remove
- **Column Labels** — drop zone for `pivot-cols` (visible only in pivot mode)

Fields drag freely between sections; dropping a chip into one section removes it
from the others (a field lives in at most one of {rowGroup, pivot, value}).
Click the tab icon on the panel's right edge to collapse to just the tab strip.

**Events:** `grid:pivotModeChanged` (`{pivot}`), `grid:columnPivotChanged`
(`{pivotCols}`) and `grid:columnValueChanged` (`{valueCols}`) fire on the matching
state changes. See **[demo 13](demo/13-pivot-side-panel.html)** for the full UX.

## Column header groups (multi-row headers) & pinned bottom row

Stacked column headers and an always-visible totals row, independently
toggled. **Column header groups** wrap one or more leaf columns under a
common parent header (`Medals` over Gold / Silver / Bronze); the grid renders
as many rows as the deepest group nesting requires. In **pivot mode** the
grid auto-derives nested headers from each pivot col's `pivotKeys` + the
value field/agg — no extra config needed. The **pinned bottom row** sticks
to the floor of the body viewport regardless of scroll position and shows
grand totals over the currently filtered leaves, using the same `agg-funcs`
declarations as group/pivot aggregations.

![stimulus_grid with three header groups — ATHLETE (Athlete + Age), ORIGIN (Country + Sport), MEDALS (Gold + Silver + Bronze) — stacked above the leaf headers, and a pinned TOTAL row at the bottom showing the grand totals (average age 26.76, gold 162, silver 36, bronze 24) over every filtered row](docs/images/grid-header-groups.png)

Declare them on the grid element:

```html
<div data-controller="grid"
     data-grid-row-data-url-value="/athletes.json"
     data-grid-agg-funcs-value='{"gold":"sum","silver":"sum","bronze":"sum","age":"avg"}'
     data-grid-pinned-bottom-row-value="true"
     data-grid-column-groups-value='[
       {"headerName":"Athlete","children":["athlete","age"]},
       {"headerName":"Origin", "children":["country","sport"]},
       {"headerName":"Medals", "children":["gold","silver","bronze"]}
     ]'>
  <!-- …columns… -->
</div>
```

| Attribute | Value |
|---|---|
| `column-groups` | JSON array of `{headerName, children: [field]}`. Each leaf column appears under at most one group; cols not in any group span all header rows. v1 supports one level of grouping; pivot-derived headers can be arbitrarily deep |
| `pinned-bottom-row` | `true` renders the sticky bottom totals row (default `false`). Filtered out in pivot mode because the `(All)` totals row already serves that role at the top |

…or drive at runtime:

```js
api.setColumnGroups([{ headerName:"Medals", children:["gold","silver","bronze"] }])
api.setPinnedBottomRow(true)
```

**Auto-grouping in pivot mode.** When a pivot would otherwise produce a busy
single-row header, header groups kick in automatically:

- 1 pivot col, 1 value → flat headers (`Swimming`, `Athletics`, …)
- 1 pivot col, *M* values → 2 rows: pivot value on top, `agg(field)` underneath
- *N* pivot cols, 1 value → *N* rows: deepest pivot field becomes the leaf label
- *N* pivot cols, *M* values → *N+1* rows: every pivot field + the value tier

The two "Gold" sub-headers under different parent years don't collapse — runs
only merge when the **full path** matches up to the row above. **Events:**
`grid:columnGroupsChanged` (`{columnGroups}`). See **[demo 14](demo/14-header-groups-pinned-totals.html)** for the user-declared groups + pinned totals.

## Right-click column menu

A one-click shortcut for the most common column operations — pin,
autosize, group, pivot, aggregate, hide — without opening the side panel
or wiring API calls. **Right-click any column header** and pick. Works
out of the box; no setup attribute required.

![stimulus_grid right-click column menu open on the Gold header, showing Pin left/right, Autosize, Group by Gold, Pivot by Gold, Aggregate (sum/avg/count/min/max with "sum" marked active), Hide column, Show all columns; the underlying grid is grouped by country with sport / age / gold / silver / bronze and the side panel visible on the right](docs/images/grid-column-menu.png)

Items are emitted only when they make sense for that column + the current
grid state, so the menu stays short:

- **Pin left / Pin right / Unpin** — depending on the col's current pin
- **Autosize this column / Autosize all columns**
- **Group by {col} / Ungroup {col}**
- **Pivot by {col} / Remove {col} from pivot** (turns pivot mode on if needed)
- **Aggregate: sum / avg / count / min / max** (shown for numeric cols or
  cols already carrying an aggregation; the active agg is marked with `✓`).
  **Remove aggregation** appears once an agg is set
- **Hide column / Show all columns**

Outside-click / `Escape` / window scroll / resize all close the menu.
Synthetic columns (row-number gutter, checkbox column, auto-Group, pivot
result) suppress the menu — they're owned by the grid and shouldn't be
poked through this surface. **Event:** `grid:columnMenuOpened` (`{colId}`)
fires every time the menu opens so analytics / docs overlays can hook in.
See **[demo 15](demo/15-context-menu-persisted-state.html)** for it in
action.

## Persisted column state

Round-trip the whole grid layout through `localStorage` so user changes
survive a page reload. Set one attribute and the grid handles the rest —
no app glue, no per-event listeners, no reload boilerplate.

```html
<div data-controller="grid"
     data-grid-row-data-url-value="/athletes.json"
     data-grid-persist-key-value="reports.athletes">
  <!-- …columns… -->
</div>
```

| Attribute | Value |
|---|---|
| `persist-key` | when non-empty, auto-save/restore the layout under `localStorage["sgrid:" + persistKey]`. Empty (default) disables persistence |

The snapshot covers everything a user can change:

- column order, widths, pinning, visibility
- row groups, pivot mode + pivot cols, value aggregations
- column header groups and the pinned-bottom-row toggle
- sort, filter and quick filter

Writes are debounced 200 ms and flushed synchronously on `beforeunload`,
so a `Cmd+R` right after a change doesn't drop state. The grid restores
once during initial load and broadcasts a single `grid:columnStateApplied`
event when it does, so subscribers (the side panel, the status bar, your
own listeners) re-render in one shot instead of reacting to every
granular change event.

Drive the same flow programmatically — useful for "save view" / "load
view" / "reset layout" buttons:

```js
const snapshot = api.getColumnState()    // JSON-safe object you can POST to your server
api.applyColumnState(snapshot)           // restore from anywhere — fires grid:columnStateApplied
api.clearPersistedState()                // wipe the localStorage blob (e.g. a "reset" button)
api.getPersistKey()                      // read back the configured key
```

See **[demo 15](demo/15-context-menu-persisted-state.html)** — change
sort / groups / pivot / values / visibility, reload, watch it stick.

## Master/detail rows

Expand any row to reveal a detail panel beneath it — a header strip, a
nested `stimulus_grid` of related rows, or arbitrary HTML cloned from a
`<template>`. The canonical use case is **orders → line items**: the master
row shows the order summary, the chevron opens a detail panel with the
line items grid and a header strip pulled from the master.

![stimulus_grid master/detail — an outer Orders grid with order #1005 expanded to reveal a header strip (status pill, customer, total) above a nested grid of three line items with a pinned bottom-totals row](docs/images/grid-master-detail.png)

Enable it on the grid element and point at a `<template>` for the detail
shell:

```html
<div data-controller="grid"
     data-grid-master-detail-value="true"
     data-grid-detail-template-value="order-detail-tpl"
     data-grid-detail-rows-key-value="lineItems"
     data-grid-detail-row-height-value="280">
  <table>
    <thead><tr><!-- order columns… --></tr></thead>
    <tbody></tbody>
  </table>
</div>

<template id="order-detail-tpl">
  <div class="order-detail">
    <header class="order-detail-head">
      <strong>Order #<span data-detail-bind="id"></span></strong>
      <span class="status"
            data-detail-bind="status"
            data-detail-bind-attr="data-status:status"></span>
      <span class="customer" data-detail-bind="customer"></span>
    </header>
    <!-- Inner grid is auto-seeded from master.lineItems (detail-rows-key). -->
    <div data-controller="grid"
         data-grid-row-height-value="28"
         data-grid-pinned-bottom-row-value="true"
         data-grid-agg-funcs-value='{"qty":"sum","lineTotal":"sum"}'>
      <table>
        <thead><tr><!-- line-item columns… --></tr></thead>
        <tbody></tbody>
      </table>
    </div>
  </div>
</template>
```

| Attribute | Value |
|---|---|
| `master-detail` | `true` to enable the expand chevron + detail row pipeline (default `false`) |
| `detail-template` | id of a `<template>` cloned into each detail panel; supports `[data-detail-bind="<field>"]` (text), `[data-detail-bind-attr="<attr>:<field>"]` (attribute), `[data-detail-if="<field>"]` (drop the node when the field is falsy) |
| `detail-rows-key` | master-row field holding the array of nested rows; if the template contains a `[data-controller~="grid"]` child, its `data-grid-row-data-value` is seeded from `master[detailRowsKey]` before Stimulus boots it |
| `detail-row-height` | minimum pixel height for the detail shell (default `240`) |

**Behaviour.** The grid prepends a 32 px pinned-left gutter column with an
expand chevron; clicking it toggles the detail panel for that row.
Expanded state lives in memory on the grid (not in `localStorage` — detail
expansion is session-scoped, not layout). Detail rows are display-only:
they don't participate in selection, CSV export, range aggregates, or
keyboard navigation. Suppressed in pivot / grouped views (the leaves they'd
hang off have been aggregated away) and incompatible with the uniform-row
virtualisation, so the grid switches to non-virtual rendering whenever
master/detail is enabled — best fit is dozens-to-hundreds of master rows.

**Drive it programmatically:**

```js
api.setMasterDetail(true)
api.expandDetailRow(orderId)               // emits grid:detailRowExpanded
api.toggleDetailRow(orderId)               // expand ↔ collapse
api.collapseAllDetails()                   // close everything
api.getDetailExpandedRowIds()              // → [1001, 1005, …]
```

**Events.** `grid:detailRowExpanded` / `grid:detailRowCollapsed`
(`{rowId, masterRow}`) fire on toggle. `grid:detailRowMounted`
(`{rowId, masterRow, detailEl, nestedGridApi}`) fires once after the
template clones into the DOM and the inner grid (if any) has its
`gridApi` hooked up — handy for adding columns or chrome imperatively.

> All grid events bubble. If you're listening on the *outer* grid and
> nest another grid inside the detail shell, scope your handler with
> `if (e.target !== grid) return` so the inner grid's `grid:ready` /
> `grid:rowDataChanged` don't trigger your outer logic.

See **[demo 16](demo/16-master-detail.html)** for the full orders ↔
line-items example with `expand all` / `collapse all` controls and a
status read-out.

## Tree data (self-referential `parent_id`)

Rows describe a real hierarchy via `parent_id` (org chart, file tree, BOM,
comment thread). The grid flattens the tree into a display list, draws an
indent + chevron on a configured **tree column**, and routes chevron
clicks back through the public `gridApi`. Unlike **row grouping** (which
synthesises a hierarchy from column values), tree data treats every row
as a real entity — leaves and branches share the same column layout.

![stimulus_grid in tree mode — an org chart with CEO at the root, two VPs indented one level, engineering managers under VP Engineering, and individual contributors at the deepest level; each row with children has a chevron pointing down; leaves reserve an empty chevron slot so all names line up](docs/images/grid-tree-data.png)

```html
<div data-controller="grid"
     data-grid-tree-data-value="true"
     data-grid-tree-parent-field-value="parent_id"
     data-grid-tree-display-field-value="name">
  <table>
    <thead>
      <tr>
        <th data-controller="header-cell" data-header-cell-field-value="name"
            data-header-cell-sortable-value="true">Name</th>
        <th data-controller="header-cell" data-header-cell-field-value="title">Title</th>
        <th data-controller="header-cell" data-header-cell-field-value="salary"
            data-header-cell-type-value="number">Salary</th>
      </tr>
    </thead>
    <tbody></tbody>
  </table>
</div>

<script>
  const grid = document.querySelector("[data-controller='grid']")
  grid.addEventListener("grid:ready", () => grid.gridApi.setRowData([
    { id: 1, parent_id: null, name: "CEO",            title: "CEO",            salary: 480 },
    { id: 2, parent_id: 1,    name: "VP Engineering", title: "VP Engineering", salary: 320 },
    { id: 3, parent_id: 2,    name: "Senior Engineer", title: "Senior Engineer", salary: 175 },
  ]))
</script>
```

| Attribute | Value |
|---|---|
| `tree-data` | `true` to flatten `rowData` as a tree (default `false`). Mutually exclusive with row groups + pivot mode |
| `tree-parent-field` | row field naming the parent row's id (default `"parent_id"`). A `null`/missing/self/orphan parent makes the row a root |
| `tree-display-field` | which column hosts the indent + chevron (default: first non-gutter column) |
| `tree-default-expanded` | `-1` all expanded · `0` only roots · `N` first-N levels expanded (default `-1`) |

**Behaviour notes.**

- **Filter pulls ancestors in.** When `quickFilter` or a column filter is
  active, a matching row keeps its **full ancestor chain** visible (so the
  user always sees the path to the match) and a matching *parent* keeps
  its **entire subtree** visible (so "this folder matched" shows what's
  inside). All kept rows are force-expanded for the duration of the filter.
- **Sort works per-sibling-set.** A `sortModel` reorders children within
  each parent — the tree shape is preserved.
- **No row mutation.** Per-row tree metadata (level / hasChildren /
  expanded) lives in a sidecar `treeMeta` Map keyed by row id;
  `JSON.stringify(row)` won't surface any of the grid's scaffolding.
- **Cycles + orphans handled.** A `parent_id` referring to a missing /
  cyclical / self row makes the row a root.
- **Mutually exclusive** with `row-group-cols` and `pivot-mode` — those
  assume a flat dataset.

**Events:** `grid:treeRowExpanded` / `grid:treeRowCollapsed` (`{rowId, row}`),
`grid:treeDataChanged` (`{treeData}`). See **[demo 18](demo/18-tree-data.html)**
for a worked org-chart example with expand/collapse, search-with-ancestor-
preservation, and salary-desc sibling sort.

## Separators &amp; merged cells (quotes, invoices, reports)

Drop **section headings**, **blank spacers**, **ruled dividers**, and
**summary rows** between data rows; let any single cell **span multiple
columns** via a per-row `__sgSpans` map. Together they cover the structural
primitives a real-world quote, invoice, contract, or report layout needs —
without forking the grid into a separate "document" component.

![stimulus_grid rendering a tax invoice with PROFESSIONAL SERVICES + HARDWARE section headings, three service line items and two hardware line items, a description-spanning note row about the Raspberry Pi delivery schedule, and a Subtotal / GST 10% / Total due summary block at the foot of the table](docs/images/invoice-separators-merged.png)

### Separator rows

A *separator* is any row in `rowData` carrying `__sgSeparator: true`. The
shape decides the variant:

```js
{ __sgSeparator: true }                                      // blank spacer
{ __sgSeparator: true, variant: 'divider' }                  // thin ruled line
{ __sgSeparator: true, label: 'Professional services' }      // section heading
{ __sgSeparator: true, label: 'Subtotal', value: '$17,364' } // summary line
{ __sgSeparator: true, variant: 'total',                     // emphasised grand-total
  label: 'Total due', value: '$19,100.40' }
{ __sgSeparator: true, variant: 'subtle', label: 'Notes' }   // muted heading
```

Variants: `heading` (default with label), `summary` (default with label+value),
`total`, `subtle`, `blank`, `divider`. The `variant` field always wins over
the auto-pick.

- **Positional anchors.** Separators always render in declared position;
  sort and filter only reorder / hide the data rows *around* them. Quote
  sections stay intact when the user clicks a header.
- **Inert.** Separators are never selected, edited, exported to CSV,
  counted in aggregates, or stepped over by keyboard navigation.
- **HTML-first too.** Server-rendered:
  ```html
  <tr data-separator="heading" data-label="Hardware"></tr>
  <tr data-separator="total" data-label="Total due" data-value="$19,100.40"></tr>
  ```

### Merged cells

Per-row `__sgSpans`: each key is a field name and each value is how many
visible columns the cell should swallow.

```js
{
  id: 6,
  description: '↪ Includes preconfigured Raspbian image + 12 months remote support.',
  total: 0,
  // The description cell covers description + qty + unit-price columns.
  __sgSpans: { description: 3 },
}
```

Server-rendered equivalent: just use the standard HTML `colspan` on the `<td>`
(or `data-spans="N"`) — the grid picks it up during `_captureInitialMarkup`.

```html
<tr data-row-id="6">
  <td data-col-id="description" colspan="3">↪ Includes preconfigured Raspbian image…</td>
  <td data-col-id="total">$0.00</td>
</tr>
```

See **[demo 33](demo/33-invoice-separators-merged.html)** for a worked tax
invoice with section headings, a description-spanning note row, and a
Subtotal / GST 10% / Total due summary block — all on the same grid that
sorts, edits, exports CSV, and (optionally) takes file drops elsewhere.

## Rails & Hotwire (`stimulus_grid_rails`)

For Rails apps, the **[`stimulus_grid_rails`](gem/stimulus_grid_rails)** gem turns
the grid into a **server-driven, multi-user editable** grid over Turbo Streams +
Action Cable — no React, no client-side grid framework, no JS build step. Because
a Rails app knows its schema, the **server** column definition does the work a
generic client grid pushes onto the browser: auth, coercion, validation, editor
selection, computed-column cascade, and broadcasting.

**Capabilities**

- **Live multi-user editing** — every create/update/destroy broadcasts cell-grained Turbo Stream actions to all connected tabs.
- **Optimistic cell edits** — a committed cell pulses pending (blue), then the server reconciles (green flash) or reverts (red + error tooltip), with `X-Optimistic-Id` echo-suppression for the originator.
- **Server-side column registry** — per-column `type`, `editable` (boolean *or* lambda), `editor`/`editor_config`, `validate`, `concurrency`, and `computed`/`depends_on`.
- **Concurrency & validation** — version-checked edits (`lock_version` → conflict), server-side validation → revert with errors, computed-column cascade replayed as a bulk stream.
- **Rows** — create / delete (single + multi-select bulk), tab/newline bulk paste, and undo/redo backed by a server-side audit log (`Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`).
- **Multi-tenancy & auth** — tenant-scoped streams (ActsAsTenant), scoped row lookups, and auth inherited from your `parent_controller`.
- **Scale** — server-side global search, per-column filtering, and a windowed server-side row model for 50–100K+ rows.

**Install** — published on RubyGems as
[`stimulus_grid_rails`](https://rubygems.org/gems/stimulus_grid_rails). Add it
with Bundler:

```bash
bundle add stimulus_grid_rails
```

```ruby
# …or pin it in your Gemfile, then run `bundle install`:
gem "stimulus_grid_rails"
```

The engine auto-registers two importmap pins (`stimulus_grid`,
`stimulus_grid_rails`) and ships the CSS, so no `bin/importmap pin` is needed:

```js
// app/javascript/application.js
import "@hotwired/turbo-rails"
import { Application } from "@hotwired/stimulus"
import StimulusGrid from "stimulus_grid"
import StimulusGridRails from "stimulus_grid_rails"

const application = Application.start()
StimulusGrid.start(application)        // grid, header-cell, pagination, …
StimulusGridRails.start(application)   // grid-sync, cell-editor + Turbo Stream actions
```

```erb
<%# app/views/layouts/application.html.erb (head) %>
<%= stylesheet_link_tag "stimulus_grid", "stimulus_grid_rails" %>
<%= javascript_importmap_tags %>
```

```ruby
# config/routes.rb
mount ActionCable.server => "/cable"
mount StimulusGridRails::Engine => StimulusGridRails.mount_path   # default "/grids"
```

Undo/redo and the audit log are opt-in — install the bundled migration when you
want them (everything else works without it):

```bash
bin/rails stimulus_grid_rails:install:migrations && bin/rails db:migrate
```

**Usage**

```ruby
# app/grids/athlete_grid.rb — one source of truth for the columns
class AthleteGrid < StimulusGridRails::Grid
  resource :athletes
  model    Athlete
  stream_name { |_user| "athletes" }

  column :athlete, type: :string,  editable: true, pinned: :left, width: 220
  column :country, type: :string,  editable: ->(row, user) { user&.admin? }   # per-row/user
  column :age,     type: :integer, editable: true, concurrency: :version_checked,
                   validate: ->(v, _r) { "must be 10–80" unless (10..80).cover?(v.to_i) }
  column :total,   type: :integer, computed: true, depends_on: %i[gold silver bronze]

  def compute_total(row) = row.gold.to_i + row.silver.to_i + row.bronze.to_i
end
```

```ruby
# app/models/athlete.rb — make the model broadcast its changes
class Athlete < ApplicationRecord
  include StimulusGridRails::Broadcastable
  broadcasts_grid AthleteGrid, stream: ->(_a) { "athletes" }
  self.locking_column = :lock_version   # needed for version-checked columns
end
```

```erb
<%# render it anywhere %>
<%= render partial: "stimulus_grid_rails/grids/grid",
           locals: { grid: AthleteGrid.new(user: current_user),
                     rows: Athlete.order(:id),
                     row_selection: "multiple", page_size: 25 } %>
```

Double-click a cell → edit → Enter commits → optimistic pending → the server
reconciles or reverts → every other connected tab updates live. A complete
runnable app is in [`gem/demo`](gem/demo); full docs in
[`gem/stimulus_grid_rails/README.md`](gem/stimulus_grid_rails/README.md) and
[`RAILS.md`](RAILS.md).

## Demos

`npm install && npx vite`, then open `http://localhost:5173/demo/` (the
root path now redirects there). **295+ demos**, indexed at `demo/index.html`:

- **01–18 — Grid mechanics**: basics, JSON data, filtering, selection,
  pagination, editing, custom-template renderers, 10k-row virtual scroll,
  everything-together, live filter, row grouping with aggregation, status
  bar, pivot mode + side panel, header groups + pinned totals, right-click
  column menu + persisted state, master/detail (nested grid), sortable
  pivot columns, and tree data (self-referential `parent_id`).
- **19–37 — Core renderer library**: the canonical built-ins
  (email/URL/phone/currency/etc.), date renderers (date / datetime /
  relative-time / duration), number renderers, boolean, delta, truncate +
  copyable, image, color swatch, sparkline, heatmap, mask, highlight,
  multi-line, attachments (Airtable-style), invoice / quote layout
  (separators + merged cells), Australian addresses with multi-field
  popover editor, checkbox, switch, and audio attachments with the
  Howler-powered scrubbing player.
- **38–99 — Extended renderers**: markdown, JSON, linked-record, coloured
  tags, time, diff, geo, QR, code, ratings, bullet/donut/histogram/RAG,
  timeline-steps, mention, expand, units, IP, BSB / ACN / TFN / Medicare,
  audio / video, reactions, comment-count, ordinal / plural / empty,
  credit-card, loading-shimmer, plus the editor renderers
  (select / multiselect / combobox / slider / date-picker / time-picker /
  date-range / color-picker / textarea), row-action surfaces
  (action-button / menu / split-button / row-actions / drag-handle /
  row-number / expand-toggle), avatar-stack / presence / assignee, and
  identity formats (UUID / git SHA / IBAN / SWIFT / SSN / EIN / VAT / NIN /
  postal-code / address-us / address-generic).
- **100–142 — Specialised renderers**: MAC / VIN / ISBN / license-key /
  barcode, gauge / win-loss / mini-bar / mini-line / trend, countdown /
  age / fiscal-period / timezone / cron, spinner / error / sync-status /
  stale / fresh, favicon / domain / social-link / tracking-number /
  video-link / file / download-link / mime-icon / gallery / waveform,
  HTML / YAML / XML / autolink / redacted / spoiler / fraction /
  scientific / radix / percentile, battery / signal-bars / volume.
- **143–199 — Australian trade compliance, FSM dispatch, vehicle &
  property**: trade licence cards (white / blue / WWCC / HRWL / COES /
  COC / QBCC / VBA / gas / asbestos / refrigerant / pool / test-and-tag /
  insurance currency / GST / ABN / HBCF), job-status / arrival-window /
  route-stop / travel-time / technician-slot, progress-claim / variation /
  defect / signature / job-photo, callout-fee / payment-terms / invoice-
  status / retention / materials-pick, SWMS / JSA / toolbox-talk /
  PPE-checklist / incident-severity / hazard-rating / site-induction,
  trade-type / skill-endorsement / subcontractor / crew, rego-plate /
  rego-status / CTP / service-due / fuel-card / odometer, customer-type /
  strata / lot-plan / council-LGA / region / suburb-postcode.
- **200–249 — Communications, headerless / mobile, quote workflow,
  property & energy**: email-thread, headerless grid, mobile-optimised
  card layout, today's-jobs mobile screen, SLA countdown, quote-status,
  reattendance-counter, job-priority, booking-source, tradie-tags,
  recurring-service, PC/DLP countdown, inspection-result, punch-list,
  timesheet-entry, penalty-rate, award-classification, apprentice-
  supervision, visa work-rights, LSL portable scheme, clock-in geo-stamp,
  idle-time, stock-level / allocated-available / markup / UOM /
  supplier-price-rank / special-order-ETA / aged-receivables /
  payment-method, BAS-period, SOP progress-claim, refund-chargeback,
  cost-code, authority-limit, insurance-claim, make-safe, excess-
  collected, loss-adjuster, cause-of-loss, NMI, DBYD, property-type,
  storeys/level/unit, switchboard-phase, hot-water-system, NCC-class,
  BAL-rating, heritage-flag, NABERS-stars.
- **250–282 — Locksmith renderers**: keyway-profile, bitting-code,
  pin-stack, cylinder-size, AS 4145 grade, EN 1303 grid, MKS hierarchy,
  restricted-patent, key-authority-signatory, key-holder-register,
  key-blank-xref, safe cash / attack / fire ratings, combo-change-log,
  time-lock-window, transponder-chip, cut-style, fob-frequency,
  all-keys-lost, immobiliser-system, card-credential, ANSI F-code,
  failsafe / REX / DPS, LOTO-state, MLAA membership, SCEC endorsement,
  probity-check, insurance-approved, lockout-urgency, rekey-vs-replace,
  cylinder-condition, cutting-machine.
- **283–295 — Compliance + sync UX**: WaterMark / RCM, SMS status,
  call-log, voicemail, portal-last-login, reminder-cadence, group-by-date
  sticky headers, saved-views chips (localStorage), offline-sync per row,
  optimistic-save per cell, sync-conflict, row-freshness, quick-add FAB.

## Build

```bash
npm run build:lib   # builds dist/stimulus_grid.js (IIFE) + dist/stimulus_grid.esm.js (ESM) + .css
```

## Tests

```bash
npm test                          # JS core: display-list pipeline (Vitest)
cd gem/demo && bin/rails test     # Rails engine: models, controllers, Turbo Streams, audit
```

Both run on every push/PR via [GitHub Actions](.github/workflows/ci.yml).

See [`DESIGN.md`](DESIGN.md) for architecture and the full API reference, and
[`skills/`](skills) for LLM-oriented usage guides.

## License

MIT.
