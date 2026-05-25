---
name: stimulus-grid-rails
description: Use the stimulus_grid_rails gem to build a server-driven, multi-user editable data grid in a Rails + Hotwire app. Apply when adding an editable table backed by Active Record with live cross-tab/cross-user updates over Turbo Streams + Action Cable, server-side global search/filtering, optimistic cell edits with server reconcile, computed columns, add/remove rows, undo/redo, per-column permissions, or multi-tenant isolation. For a purely client-side grid with no Rails backend, use the stimulus-grid-js skill instead.
---

# Using stimulus_grid_rails (the Rails engine)

A Rails grid where **the server column definition is the source of truth**
(auth, coercion, validation, editor choice, cascade, broadcast). The browser
runs the `stimulus_grid` JS; the gem adds a Stimulus `grid-sync` layer + custom
Turbo Stream actions so edits broadcast live to every tab.

## Setup

```ruby
# Gemfile
gem "turbo-rails"
gem "stimulus-rails"
gem "importmap-rails"
gem "stimulus_grid_rails"   # or: path: "…/gem/stimulus_grid_rails"
```

```js
// app/javascript/application.js
import "@hotwired/turbo-rails"
import { Application } from "@hotwired/stimulus"
import StimulusGrid from "stimulus_grid"
import StimulusGridRails from "stimulus_grid_rails"
const app = Application.start()
StimulusGrid.start(app)        // base grid controllers
StimulusGridRails.start(app)   // grid-sync, cell-editor + Turbo Stream actions
```

```erb
<%# app/views/layouts/application.html.erb <head> %>
<%= stylesheet_link_tag "stimulus_grid", "stimulus_grid_rails" %>
<%= javascript_importmap_tags %>
```

```ruby
# config/routes.rb
mount ActionCable.server => "/cable"
mount StimulusGridRails::Engine => StimulusGridRails.mount_path   # default "/grids"
```

To namespace the endpoints, set the path and mount at it (the grid builds its
client requests from `mount_path`, so they follow automatically):

```ruby
# config/initializers/stimulus_grid_rails.rb
StimulusGridRails.mount_path = "/admin/grids"
# StimulusGridRails.parent_controller = "ApplicationController"   # Devise/ActsAsTenant
```

The engine auto-pins `stimulus_grid` + `stimulus_grid_rails` via importmap and
ships the CSS; host apps need no JS build step.

## 1. Declare the grid (server-side column registry)

```ruby
# app/grids/athlete_grid.rb
class AthleteGrid < StimulusGridRails::Grid
  resource :athletes      # the URL segment + registry key
  model    Athlete

  column :name,    type: :string,  editable: true, pinned: :left, width: 200
  column :country, type: :string,  editable: ->(row, user) { user&.admin? }   # per-row/user
  column :sport,   type: :enum,    editable: true,
                   enum_values: %w[Swimming Cycling Gymnastics],
                   cell_renderer: "sgr-sport", cell_editor: "sgr-sport-editor"  # custom cell + editor
  column :age,     type: :integer, editable: true, concurrency: :version_checked,
                   validate: ->(v, _row) { "must be 10–80" unless (10..80).cover?(v.to_i) }
  column :views,   type: :bigint,  editable: true
  column :gold,    type: :integer, editable: true
  column :silver,  type: :integer, editable: true
  column :total,   type: :integer, computed: true, depends_on: %i[gold silver]
  column :_actions, type: :string, editable: false, sortable: false,
                    filterable: false, pinned: :right, cell_renderer: "sgr-row-actions"

  def compute_total(row) = row.gold.to_i + row.silver.to_i

  # Optional: authorization / tenant scoping. Used for every lookup + search.
  def scope(user) = model_class.all          # e.g. model_class.where(account: user.account)

  # Optional: defaults for the "+ Add row" button.
  def new_row_defaults = { name: "New", sport: "Swimming", age: 20, gold: 0, silver: 0 }
end
```

**Column types:** `string text integer bigint decimal money boolean enum date datetime reference`.
**Column options:** `editable:` (bool or `->(row, user)`), `editor:`, `editor_config:`,
`enum_values:`, `concurrency:` (`:last_write_wins` default | `:version_checked` | `:field_locked`),
`computed:` + `depends_on:`, `validate:` (`->(value, row)` → error string/array/nil),
`header:`, `width:`, `pinned:`, `cell_renderer:`, `cell_editor:`, `sortable:`,
`filterable:`, `searchable:` (defaults true for text-ish columns). Columns whose
name starts with `_` are renderer-only (excluded from data + search).

## 2. Make the model broadcastable

```ruby
class Athlete < ApplicationRecord
  include StimulusGridRails::Broadcastable
  broadcasts_grid AthleteGrid                 # auto create/update/destroy streams
  self.locking_column = :lock_version          # required for :version_checked columns
end
```

After this, **every** create/update/destroy automatically broadcasts the right
Turbo Stream action (`row-insert-sorted` / `cell` + computed cascade /
`row-remove`) to the grid's tenant-scoped stream — including changes made from
the console, jobs, or other controllers. No manual broadcast calls.

## 3. Render

```erb
<%= render partial: "stimulus_grid_rails/grids/grid",
           locals: { grid: AthleteGrid.new(user: current_user),
                     rows: Athlete.order(:id),
                     row_selection: "multiple", page_size: 25 } %>
```

Optional locals: `id:`, `css_class:`, `pagination:` (default true),
`status_bar:` (default false — spreadsheet-style footer showing row counts and
live aggregates over the selected cell range), `status_bar_aggs:` (array
subset/reorder of `count`, `sum`, `avg`, `min`, `max`),
`pivot_mode:` (default false — reshape into a pivot table; the value cells use
the grid class's `agg_funcs` declarations), `pivot_cols:` (array of fields
whose unique values become columns), `side_panel:` (default false — render the
right-side drag-driven panel that drives row groups / pivot columns / value
aggregations + column visibility through the public `gridApi`),
`column_groups:` (array of multi-row header group defs
`[{ headerName:, children: [field…] }]`; pivot mode auto-derives nested
headers from `pivot_cols` so this is for non-pivot grids),
`pinned_bottom_row:` (default false — sticky bottom row holding grand totals
computed from the grid class's `agg_funcs`, over the currently filtered
leaves), `persist_key:` (default `""`; when set, the grid auto-saves/restores
column order/width/pin/visibility + groups/pivot/values + sort/filter to
`localStorage["sgrid:" + persistKey]`),
`master_detail:` (default false — expandable detail rows; see below),
`detail_template:` (id of a `<template>` cloned into each detail panel),
`detail_rows_key:` (master-row attribute/method whose value, `as_json`'d,
seeds the inner grid inside the template), `detail_row_height:` (min panel
height in px, default `240`). Right-click any column header to
open a quick-actions menu (pin / autosize / group / pivot / aggregate /
hide) — no extra setup required. The partial renders the table, columns,
rows, pagination nav, and the `turbo_stream_from` subscription. Wrap or
style `.sgr-panel` to give it a height.

## What you get out of the box

- **Inline edit → optimistic PATCH → reconcile.** Double-click a cell → edit →
  Enter/Tab. `grid-sync` PATCHes `/grids/:resource/:row_id/cells/:column` with an
  `optimistic_id`; the cell shows a pending pulse, then a green confirm or a red
  revert (with the server's `errors`). Other tabs get the broadcast.
- **Validation + permissions** run server-side on every PATCH (`editable_for?`,
  `validate`). Never trusts the client.
- **Computed cascade:** editing a `depends_on` column recomputes the computed
  column and pushes it in the same response/broadcast.
- **Version-checked concurrency:** `:version_checked` columns send `lock_version`;
  a stale write returns a `cell-conflict` (listen for `grid:cellConflict`).

## Toolbar actions (dispatch events on the grid element)

The grid element is `#<resource>-grid` (or the `id:` local). A toolbar anywhere
on the page drives it via events:

```js
const grid = document.getElementById("athletes-grid")
grid.dispatchEvent(new CustomEvent("grid-sync:add-row"))                       // create
grid.dispatchEvent(new CustomEvent("grid-sync:add-row", { detail:{ attributes:{ sport:"Cycling" } } }))
grid.dispatchEvent(new CustomEvent("grid-sync:delete-selected"))               // delete getSelectedRowIds()
grid.dispatchEvent(new CustomEvent("grid-sync:search", { detail:{ q:"phelps" } }))
grid.dispatchEvent(new CustomEvent("grid-sync:filter", { detail:{ column:"gold", criteria:{ type:"greaterThanOrEqual", value:5 } } }))
grid.dispatchEvent(new CustomEvent("grid-sync:filter", { detail:{ column:"gold", criteria:null } })) // clear one
grid.dispatchEvent(new CustomEvent("grid-sync:clear-filters"))
```

- **Per-row delete button:** put a `<button data-sgr-action="delete-row">` inside
  a cell renderer; `grid-sync` deletes that row (delegated click).
- **Search/filter** is server-side: it GETs `/grids/:resource/rows?q=&filters=`
  (debounced 200ms), the server builds the query from the column registry, and
  the grid swaps the dataset via `setRowData`. Listen for `grid-sync:rows-fetched`
  (`{total, shown, limited}`) to update a count. Filter `criteria` shape:
  `{ type: <op>, value:, value2? }` — text ops `contains`(default)/`equals`/
  `startsWith`/`endsWith`/`blank`/`notBlank`; number ops `equals`/`greaterThan`/
  `greaterThanOrEqual`/`lessThan`/`lessThanOrEqual`/`notEqual`/`inRange`; date ops
  `greaterThan`/`lessThan`/`inRange`.

## Custom cells (renderer + editor)

Define `<template>`s on the page; reference them from the column. Renderer uses
`data-bind="field"` / `data-bind-attr="name"`; editor marks its control with
`[data-editor-input]`:

```erb
<template id="sgr-sport"><span class="pill" data-bind="sport" data-bind-attr="data-sport"></span></template>
<template id="sgr-sport-editor">
  <select data-editor-input>
    <% AthleteGrid.columns_registry[:sport].enum_values.each do |s| %><option><%= s %></option><% end %>
  </select>
</template>
<template id="sgr-row-actions"><button data-sgr-action="delete-row" title="Delete">×</button></template>
```

A column can have a renderer, an editor, or both — so a custom-rendered cell is
still fully editable.

## Undo / redo

Install the audit table, then `Cmd/Ctrl+Z` undoes and `Cmd/Ctrl+Shift+Z` (or
`Ctrl+Y`) redoes the current user's last cell mutation — replayed through the
normal save path so it re-validates, cascades, and broadcasts. Shortcuts are
ignored while a text field/cell editor is focused.

```bash
bin/rails stimulus_grid_rails:install:migrations   # or copy the gem's audit migration
bin/rails db:migrate
```

Until the table exists, auditing + undo/redo are a quiet no-op.

## Large tables — server-side row model (50-100K+ rows)

Render only the first page and pass `server_side: true` + `total:`; the grid
fetches windows as the user pages/sorts/searches (only one page is ever in the
DOM):

```ruby
def index
  @grid  = ThingGrid.new(user: current_user)
  @total = @grid.scope(current_user).count
  @rows  = @grid.scope(current_user).order(:id).limit(50)
end
```
```erb
<%= render partial: "stimulus_grid_rails/grids/grid",
           locals: { grid: @grid, rows: @rows, total: @total, server_side: true, page_size: 50 } %>
```

The grid fetches `GET …/rows?page=&page_size=&sort=&q=&filters=` and applies it
with `setRowData` + `setRowCount`. Sorting is server-side (`Grid#apply_sort`).
Don't pass the full relation as `rows` in server-side mode — pass one page.

## Cells: selection, copy, paste

- Cells aren't browser-text-selectable; click = active cell, drag/shift+click =
  rectangular range (highlighted).
- `Cmd/Ctrl+C` copies the range as TSV.
- **Bulk paste** (§9): click an editable anchor cell, paste tab/newline data; the
  grid fills the range and POSTs one `/bulk` request (server validates each cell).

## Multi-tenancy & auth (Devise + ActsAsTenant) — avoid data leaks

```ruby
# config/initializers/stimulus_grid_rails.rb
StimulusGridRails.parent_controller = "ApplicationController"
```

This makes the gem's controllers inherit your base controller, so your
`authenticate_user!` and `set_current_tenant_through_filter` before_actions run
on the grid endpoints too. Combined with:

- **scoped lookups** — every row is fetched via `grid.scope(current_user).find`,
  so a row outside the user's/tenant's scope raises `RecordNotFound`; override
  `scope(user)` for custom authorization, and
- **tenant-scoped streams** — broadcasts are keyed by `ActsAsTenant.current_tenant`,

…one tenant never sees another tenant's data or broadcasts. Without ActsAsTenant
the tenant scoping is a no-op and `scope` defaults to `model_class.all`.

## Master/detail rows

Expand a master row to reveal a detail panel beneath it — typically a nested
grid of related rows (orders → line items). The nested rows ride along on the
master row's `<tr>` as `data-row-detail-rows-value` (JSON-serialised), so the
client doesn't refetch on expand. Eager-load the association on the server.

```ruby
# app/controllers/orders_controller.rb
class OrdersController < ApplicationController
  def index
    @grid = OrderGrid.new(user: current_user)
    @rows = Order.includes(:line_items).order(:id)
  end
end
```

```erb
<%# app/views/orders/index.html.erb %>
<%= render partial: "stimulus_grid_rails/grids/grid", locals: {
      grid: @grid, rows: @rows,
      master_detail:    true,
      detail_template:  "order-detail-tpl",
      detail_rows_key:  "line_items",        # matches Order#line_items
      detail_row_height: 280,
    } %>

<template id="order-detail-tpl">
  <div class="order-detail">
    <header>
      Order #<span data-detail-bind="id"></span> ·
      <span data-detail-bind="customer"></span> ·
      <span data-detail-bind="status" data-detail-bind-attr="data-status:status"></span>
    </header>
    <%# Inner grid — auto-seeded from master.line_items via detail_rows_key. %>
    <div data-controller="grid"
         data-grid-row-height-value="28"
         data-grid-pinned-bottom-row-value="true"
         data-grid-agg-funcs-value='{"qty":"sum","line_total":"sum"}'>
      <table>
        <thead>
          <tr>
            <th data-controller="header-cell" data-header-cell-field-value="sku"      data-header-cell-width-value="120">SKU</th>
            <th data-controller="header-cell" data-header-cell-field-value="product"  data-header-cell-width-value="280">Product</th>
            <th data-controller="header-cell" data-header-cell-field-value="qty"        data-header-cell-type-value="number" data-header-cell-width-value="80">Qty</th>
            <th data-controller="header-cell" data-header-cell-field-value="unit_price" data-header-cell-type-value="number" data-header-cell-width-value="110">Unit price</th>
            <th data-controller="header-cell" data-header-cell-field-value="line_total" data-header-cell-type-value="number" data-header-cell-width-value="120">Line total</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  </div>
</template>
```

Trim the JSON payload by overriding `as_json` on the nested model:

```ruby
class LineItem < ApplicationRecord
  belongs_to :order
  def as_json(_opts = {})
    super(only: %i[id sku product qty unit_price line_total])
  end
end
```

The outer Order grid still gets every live-edit Rails capability (validation,
optimistic updates, broadcasts, undo/redo). The inner line-items grid is
client-side over the embedded array. If you need the inner grid editable too,
declare a second `LineItemGrid` and render its own
`stimulus_grid_rails/grids/grid` partial inside the template — it gets its
own broadcast stream.

Events bubble: when listening on the outer grid, scope handlers with
`if (e.target !== grid) return` or the nested grid's `grid:ready` /
`grid:rowDataChanged` will fire your outer handlers too.

## Tree data (`acts_as_tree`-style `parent_id`)

`tree_data: true` flattens a self-referential hierarchy: each row's
`parent_id` (or whichever field `tree_parent_field` names) wires the
tree, and the grid renders it as an indented list with chevrons on one
configured column. Distinct from row groups (which synthesise a hierarchy
from column values); here every row is a real entity.

```ruby
# Org chart fed straight from acts_as_tree / belongs_to :parent.
class EmployeesController < ApplicationController
  def index
    @grid = EmployeeGrid.new(user: current_user)
    @rows = Employee.order(:id)
  end
end
```

```erb
<%= render partial: "stimulus_grid_rails/grids/grid", locals: {
      grid: @grid, rows: @rows,
      tree_data:           true,
      tree_parent_field:   "parent_id",
      tree_display_field:  "name",
      tree_default_expanded: -1,
    } %>
```

Locals: `tree_data:`, `tree_parent_field:` (default `"parent_id"`),
`tree_display_field:` (default: first non-gutter column),
`tree_default_expanded:` (`-1` all · `0` only roots · `N` first-N levels).
The grid class is unchanged from a flat list — columns + editability +
broadcasts work the same way.

Filter pulls a row's full ancestor chain in (so search results show the
path), and a matching parent pulls its full subtree in. Sort entries
reorder siblings within each parent — tree shape is preserved. Cycles,
self-parents, and orphan rows become roots. Mutually exclusive with
`row_group_cols` and `pivot_mode`.

## Pivot mode (with sortable pivot columns)

`pivot_mode: true` reshapes the data into a pivot table — `row_group_cols`
form the vertical axis, unique `pivot_cols` values become columns, the grid
class's `agg_funcs` are the value aggregations. A synthetic `(All)` totals
row pins to the top; leaf rows are aggregated away.

```erb
<%= render partial: "stimulus_grid_rails/grids/grid", locals: {
      grid: MedalsGrid.new(user: current_user),
      rows: @medals,
      pivot_mode: true,
      pivot_cols: ["sport"],
    } %>
```

```ruby
class MedalsGrid < ApplicationGrid
  resource :medal
  row_group_cols ["country"]
  agg_funcs gold: "sum"
  column :country
  column :sport
  column :gold, type: :integer
end
```

Click any pivot column header to **sort sibling group rows by that
aggregate** (asc → desc → off; shift-click for multi-sort). The `(All)`
totals row stays pinned at the top no matter the sort. From JS, discover
the synthetic pivot field id via `gridApi.getPivotResultColumns()` and pass
it to `setSortModel`. Sort persists across renders + `persist_key:` reloads.

## Endpoints (provided by the engine under the mount point)

`PATCH /grids/:resource/:row_id/cells/:column` (edit) ·
`GET /grids/:resource/rows?q=&filters=` (search/filter, JSON) ·
`POST /grids/:resource/rows` (create) ·
`DELETE /grids/:resource/rows/:row_id` and `/rows/bulk` (delete) ·
`POST /grids/:resource/undo` and `/redo` · `POST /grids/:resource/bulk` (cell bulk).

## Gotchas

- `broadcasts_grid` takes only the grid class (stream is derived + tenant-scoped).
- `:version_checked` needs `self.locking_column` on the model.
- Computed columns aren't DB columns — define `compute_<name>(row)` on the grid;
  they're recomputed for display, cascade, and search JSON.
- The grid manages its own `<tbody>`; per-row buttons must come from a cell
  renderer (server-rendered button HTML is replaced on first render).
- Create/delete return `204` and rely on the auto-broadcast; the originating tab
  applies the change when the broadcast lands (~50ms).
