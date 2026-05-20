# stimulus_grid_rails

Rails + Hotwire bindings for [`stimulus_grid`](../../). It turns the HTML-first
stimulus_grid into a **server-driven, multi-user editable data grid** using
Turbo Streams over Action Cable — no React, no client-side grid framework, no JS
build step (importmap-pinnable).

This is the Rails-native realisation of the scope in [`RAILS.md`](../../RAILS.md):
the **server column definition does 80% of what a generic client-side grid
pushes onto the client** (auth, coercion, validation, editor selection, cascade,
broadcast), because a Rails app *knows its schema*.

> Status: **v0.1 / MVP slice.** Implemented: single-cell commit with optimistic
> update + server reconcile, the `ApplicationGrid` column registry, standard
> editors, the cell-grained Turbo Stream actions, computed-column cascade, and
> version-checked concurrency. See [Roadmap](#roadmap) for what's deferred.

---

## What you get

| RAILS.md § | Feature | Status |
|---|---|---|
| §1 | Custom Turbo Stream actions (`cell`, `cell-confirm`, `cell-revert`, `cell-conflict`, `row-insert-sorted`, `row-remove`, `aggregate`, `bulk`, `presence`), **broadcast automatically** on every create/update/destroy | ✅ |
| §2 | Tenant-scoped streams — broadcasts isolated per `ActsAsTenant.current_tenant`; scoped row lookups (no bare `Model.find`) | ✅ |
| §4 | Optimistic updates: cell marked `data-pending`, `X-Optimistic-Id` header, server `cell-confirm`/`cell-revert`, originator suppresses its own broadcast echo | ✅ |
| §7 | Server-side column registry: per-column `type`, `editable` (bool or lambda), `editor`, `editor_config`, `validate`, `concurrency`, `computed`/`depends_on` | ✅ |
| §8 | One cell-mutation endpoint `PATCH /grids/:resource/:row_id/cells/:column` | ✅ |
| §9 | Single-cell commit edit mode + Tab/Shift+Tab cell navigation + Enter/Esc | ✅ |
| §10 | Standard editors: string/text/integer/decimal/money/boolean/enum/date/datetime | ✅ (via base grid) |
| §11 | Server-side validation → `cell-revert` with `errors` payload | ✅ |
| §12 | Computed columns + cascade replayed server-side as a `bulk` stream | ✅ |
| §13 | Version-checked concurrency (`lock_version` → `cell-conflict`) | ✅ |
| §14 | Create rows: `POST /grids/:resource/rows` → `row-insert-sorted` broadcast | ✅ |
| §15 | Delete rows: per-row + multi-select bulk → `row-remove` broadcast | ✅ |
| §16 | Undo / redo: server-side audit log; `Cmd/Ctrl+Z` undo, `Cmd/Ctrl+Shift+Z` (or `Ctrl+Y`) redo; replayed as normal mutations | ✅ |
| §17 | `editable:` lambda re-checked on every PATCH; auth/tenant via inherited `parent_controller` | ✅ |
| §9 (bulk paste) | Paste tab/newline-separated data from an anchor cell → `/bulk` | ✅ |
| §21 | Server-side global search + per-column filtering, **and a server-side row model** (windowed fetch) for 50-100K+ rows | ✅ |

---

## Why Action Cable + version-checking, and not Yjs?

You asked whether collaboration should use [Yjs / `Y.Doc`](https://docs.yjs.dev/api/y.doc).
Short answer: **not for cell-grained edits — Action Cable is the right primitive
here, and Yjs is reserved as an opt-in for long-form text cells.** Reasoning:

- **CRDTs solve a problem this grid mostly doesn't have.** Yjs shines when many
  users concurrently edit the *same unstructured value* (a paragraph, a drawing)
  and you need automatic, intention-preserving merge without a server referee.
  A grid cell holding a number, enum, date, or short string has a **natural
  authority — the server** — and a dead-simple conflict story: last-write-wins,
  or `lock_version` for the few columns that need it (RAILS.md §13). You don't
  need an RGA/YATA sequence CRDT to set `age = 31`.
- **The server already owns correctness.** Permissions (`editable:` lambdas),
  type coercion, validation, computed-column cascade, and audit all live in the
  column registry and run on every PATCH. A pure-Yjs model pushes deltas
  peer-to-peer (or through a dumb relay) and **bypasses** that authority — you'd
  have to rebuild auth/validation/cascade on top of document observers anyway.
- **It's lighter.** No `y-websocket` server, no document GC tuning, no awareness
  protocol, no client-side CRDT bundle. The transport is the Action Cable you
  already run; the wire format is a tiny `<turbo-stream>` tag.

**Where Yjs *is* the right tool** is a single cell that holds **collaborative
long-form text** (a Notion-style `notes`/`description` field where two people
type in the same paragraph at once). That's a genuine sequence-merge problem.
The intended path (not yet built — see roadmap) is to make it **per-column,
opt-in**:

```ruby
column :notes, type: :text, editable: true,
       collaborative: :yjs            # mounts a Y.Text editor + y-websocket for THIS cell only
```

So the architecture is: **Action Cable + version-checking for the structured
grid (the 95% case), Yjs surgically inside text cells that need true co-editing.**
You don't pay CRDT complexity for the whole grid to get collaboration on a few
fields.

---

## Installation

```ruby
# Gemfile
gem "stimulus_grid_rails"          # from the repo: gem "stimulus_grid_rails", path: "gem/stimulus_grid_rails"
```

```bash
bundle install
```

The engine auto-registers two importmap pins (`stimulus_grid`,
`stimulus_grid_rails`) and ships the CSS, so no `bin/importmap pin` is needed.

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

### Choosing the path (e.g. namespacing under `/admin`)

The endpoints live wherever you mount the engine. Set `mount_path` and mount at
the same value — the grid builds its browser requests from `mount_path`, so they
follow automatically:

```ruby
# config/initializers/stimulus_grid_rails.rb
StimulusGridRails.mount_path = "/admin/grids"
```

## Usage

**1. Declare the grid** (one source of truth — RAILS.md §7):

```ruby
# app/grids/athlete_grid.rb
class AthleteGrid < StimulusGridRails::Grid
  resource :athletes
  model    Athlete
  stream_name { |_user| "athletes" }

  column :athlete, type: :string,  editable: true, pinned: :left, width: 220
  column :country, type: :string,  editable: ->(row, user) { user&.admin? }   # per-row/user
  column :sport,   type: :enum,    editable: true, enum_values: %w[Swimming Cycling Gymnastics]
  column :age,     type: :integer, editable: true, concurrency: :version_checked,
                   validate: ->(v, _r) { "must be 10–80" unless (10..80).cover?(v.to_i) }
  column :gold,    type: :integer, editable: true
  column :silver,  type: :integer, editable: true
  column :bronze,  type: :integer, editable: true
  column :total,   type: :integer, computed: true, depends_on: %i[gold silver bronze]

  def compute_total(row) = row.gold.to_i + row.silver.to_i + row.bronze.to_i
end
```

**2. Make the model broadcastable:**

```ruby
class Athlete < ApplicationRecord
  include StimulusGridRails::Broadcastable
  broadcasts_grid AthleteGrid, stream: ->(_a) { "athletes" }
  self.locking_column = :lock_version   # needed for version-checked columns
end
```

**3. Render it:**

```erb
<%= render partial: "stimulus_grid_rails/grids/grid",
           locals: { grid: AthleteGrid.new(user: current_user),
                     rows: Athlete.order(:id),
                     row_selection: "multiple", page_size: 25 } %>
```

That's it. Double-click a cell → edit → Enter commits → optimistic pending
(blue pulse) → server reconciles (green flash) or reverts (red + tooltip) →
every other connected tab updates live.

## Try the demo

A complete, runnable Rails app lives in [`../demo`](../demo):

```bash
cd gem/demo
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server
# open http://localhost:3000 in two windows side by side
```

Edit a cell in one window and watch the other update. Edit gold/silver/bronze
and watch **total** cascade. Set age to `999` and watch the server reject it.

## Architecture

```
 ┌─ browser tab A ─────────────┐         ┌─ browser tab B ─────────────┐
 │ grid + grid-sync controllers│         │ grid + grid-sync controllers│
 │  dblclick→edit→Enter        │         │                             │
 │  optimistic: cell pending   │         │                             │
 └──────────┬──────────────────┘         └─────────────▲───────────────┘
            │ PATCH /grids/athletes/1/cells/age         │ turbo-stream "cell"
            │ {value, optimistic_id, lock_version}      │ (Action Cable)
            ▼                                           │
 ┌─ CellsController#update (≈30 lines) ─────────────────┴──────────────┐
 │ grid = AthleteGrid.new(user:)                                       │
 │ column.editable_for?(row, user)   ← re-checked server-side (§17)    │
 │ value, err = column.coerce(raw)                                     │
 │ ok, errors, mutations = grid.apply_cell!(row, column, value)        │
 │   └─ validate → save → cascade compute_total → [confirm + cascade]  │
 │ response  : turbo-stream cell-confirm (+ bulk cascade) to originator │
 │ broadcast : turbo-stream cell (w/ optimistic_id) to "athletes"      │
 └─────────────────────────────────────────────────────────────────────┘
```

The originating client carries its own optimistic-id set and **suppresses the
broadcast echo of its own edit**, so it doesn't double-apply.

### Adding & removing rows (§14/§15)

Create and delete flow through the gem and broadcast live to every tab. Wire a
toolbar by dispatching events on the grid element:

```js
gridEl.dispatchEvent(new CustomEvent("grid-sync:add-row"))           // optional { detail: { attributes } }
gridEl.dispatchEvent(new CustomEvent("grid-sync:delete-selected"))   // deletes gridApi.getSelectedRowIds()
```

Per-row delete buttons work via a cell renderer + delegated click — declare an
action column and provide the template:

```ruby
column :_actions, type: :string, editable: false, sortable: false,
                  filterable: false, pinned: :right, cell_renderer: "sgr-row-actions"
def new_row_defaults = { athlete: "New athlete", sport: "Swimming", age: 20, gold: 0, silver: 0, bronze: 0 }
```

```erb
<template id="sgr-row-actions">
  <button data-sgr-action="delete-row" title="Delete row">×</button>
</template>
```

Create/delete broadcast automatically (see below) — the gem's controllers just
persist; the model's commit callbacks broadcast.

## Automatic broadcasts

`include StimulusGridRails::Broadcastable; broadcasts_grid YourGrid` is all the
wiring. From then on **every** create / update / destroy broadcasts the right
Turbo Stream action — no manual `broadcast_*` calls, even for changes made from
the console, a job, or another controller:

| Model event | Broadcast |
|---|---|
| `create` | `row-insert-sorted` (full row as JSON) |
| `update` | `cell` per changed registered column **+ computed cascade** |
| `destroy` | `row-remove` |

Grid edits made through the cells endpoint stash the originator's
`optimistic_id` on the record before save, so the auto-broadcast still carries
it and the originating tab suppresses its own echo (RAILS.md §4).

## Multi-tenancy & auth (Devise + ActsAsTenant)

Two things keep tenants isolated:

1. **Inherited controller.** Gem controllers inherit
   `StimulusGridRails.parent_controller` (default `"ApplicationController"`), so
   your `authenticate_user!` and `set_current_tenant_through_filter`
   before_actions run for the grid's cell/row endpoints too:

   ```ruby
   # config/initializers/stimulus_grid_rails.rb
   StimulusGridRails.parent_controller = "ApplicationController"
   ```

2. **Scoped lookups + scoped streams.** Every row is fetched through
   `grid.scope(current_user).find(...)` — never a bare `Model.find` — so a row
   outside the tenant raises `RecordNotFound` instead of leaking. Override
   `scope` for custom authorization:

   ```ruby
   class InvoiceGrid < StimulusGridRails::Grid
     def scope(user) = model_class.where(account: user.account)
   end
   ```

   Stream names are tenant-scoped automatically via `ActsAsTenant.current_tenant`
   (`StimulusGridRails.streamables_for`), so a broadcast for one tenant never
   reaches another's subscribers — even when grids share a logical stream.

## Undo / redo (RAILS.md §16)

Install the audit table, then `Cmd/Ctrl+Z` undoes and `Cmd/Ctrl+Shift+Z` (or
`Ctrl+Y`) redoes the current user's last cell mutation. Undo/redo replay the
prior/new value through `apply_cell!`, so validations re-run, computed columns
cascade, and the change broadcasts to every tab. Shortcuts are ignored while a
cell editor or text field is focused (native text undo still works there).

```bash
bin/rails stimulus_grid_rails:install:migrations   # copies the audit migration
bin/rails db:migrate
```

Until the table exists, auditing and undo/redo are a quiet no-op.

## Large tables — server-side row model (RAILS.md §21)

For 50-100K+ rows, render only the first page and let the grid fetch windows:

```ruby
def index
  @grid  = ThingGrid.new(user: current_user)
  @total = @grid.scope(current_user).count
  @rows  = @grid.scope(current_user).order(:id).limit(50)   # just page 1
end
```

```erb
<%= render partial: "stimulus_grid_rails/grids/grid",
           locals: { grid: @grid, rows: @rows, total: @total,
                     server_side: true, page_size: 50 } %>
```

Only one page is ever in the DOM. Paging, **server-side sorting**, and
search/filter all fetch a window from `GET …/rows?page=&page_size=&sort=&q=&filters=`;
the grid swaps it with `setRowData` and tracks the total via `setRowCount`. Edits
still broadcast live. See `gem/demo` (the `/big_rows` page seeds 50k rows).

## Cells: selection, copy, paste

- Cells use a **Numbers/Sheets-style selection model** (no browser text
  highlight): plain click = active cell, drag/shift+click = cell range,
  **Cmd/Ctrl+click = toggle a row**, **Cmd/Ctrl+Shift+click = row range**.
  Distinct colors — cell range is blue, the active cell is outlined, row
  selection is green. (`data-grid-cell-selection-value="false"` restores
  plain-click row selection.)
- **Copy** the range with `Cmd/Ctrl+C` (TSV).
- **Bulk paste** (§9): click an editable anchor cell, then paste tab/newline data
  (e.g. from a spreadsheet). The grid fills the range and POSTs one request to
  `/bulk`; the server validates/coerces/saves each cell and returns confirms.

## Roadmap

Deferred (PRs welcome):

- **Field-locking & presence** (§13 field-locked, §1 `presence`): the `presence`
  Turbo Stream action is wired client-side; the lock lifecycle is not.
- **Yjs text cells**: `collaborative: :yjs` per-column (see above).
- **Server-side infinite scroll** (current server-side mode is page-based).

## License

MIT.
