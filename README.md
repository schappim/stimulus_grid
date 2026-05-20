# stimulus_grid

An **HTML-first data grid for [Stimulus.js](https://stimulus.hotwired.dev/) (Hotwire)**.
Drop `data-controller="grid"` on a `<table>`, describe columns with `data-*`
attributes, and you get sort, filter, global search, single/multi selection,
pagination, inline editing, custom cell renderers **and editors**, column
resize/reorder/pin/hide, virtual scrolling for large datasets, and a public
`gridApi` — no React, no build-time config object, no third-party grid framework.

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

## Screenshots

**Spreadsheet-style cell selection** — click for an active cell, click-drag or
shift-click for a range; `Cmd/Ctrl+C` copies the selection as TSV.

![A block of cells selected by dragging, the active cell outlined and the range filled blue](docs/images/grid-cell-selection.png)

**Per-column filtering** — hover a header for the filter icon; popovers adapt to
the column type (text / number / date / boolean).

![A column filter popover open over the grid with a "contains United" condition](docs/images/grid-filter.png)

**Inline editing** — double-click an editable cell; type-aware editors commit on
Enter / Tab / blur and emit `grid:cellValueChanged`.

![A grid cell being edited inline with a focused text input](docs/images/grid-editing.png)

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

**Install**

```ruby
# Gemfile
gem "stimulus_grid_rails"
```

```bash
bundle install
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
