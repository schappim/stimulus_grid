# stimulus_grid_rails — API Reference

Complete reference for the gem's Ruby API, HTTP endpoints, client-side contract,
Turbo Stream protocol, and configuration. For a narrative getting-started guide
see [`../README.md`](../README.md); for an LLM-oriented usage guide see
[`../../../skills/stimulus-grid-rails/SKILL.md`](../../../skills/stimulus-grid-rails/SKILL.md).

- [Setup](#setup)
- [Module configuration — `StimulusGridRails`](#module-configuration--stimulusgridrails)
- [`StimulusGridRails::Grid`](#stimulusgridrailsgrid)
- [`column` options](#column-options)
- [Column types](#column-types)
- [Search & filter operators](#search--filter-operators)
- [`StimulusGridRails::Broadcastable`](#stimulusgridrailsbroadcastable)
- [`StimulusGridRails::TurboStreams`](#stimulusgridrailsturbostreams)
- [`StimulusGridRails::Audit`](#stimulusgridrailsaudit)
- [HTTP endpoints](#http-endpoints)
- [Client-side contract (`grid-sync`)](#client-side-contract-grid-sync)
- [Custom cell renderers & editors](#custom-cell-renderers--editors)
- [View partials](#view-partials)
- [CSS classes](#css-classes)
- [Multi-tenancy & auth](#multi-tenancy--auth)

---

## Setup

```ruby
# Gemfile
gem "turbo-rails"
gem "stimulus-rails"
gem "importmap-rails"
gem "stimulus_grid_rails"
```

```ruby
# config/initializers/stimulus_grid_rails.rb (optional)
StimulusGridRails.parent_controller = "ApplicationController"   # default
StimulusGridRails.mount_path        = "/grids"                  # default; e.g. "/admin/grids"
```

```ruby
# config/routes.rb — mount at the configured path so client requests + routes match
mount ActionCable.server => "/cable"
mount StimulusGridRails::Engine => StimulusGridRails.mount_path, as: :stimulus_grid_rails
```

To namespace the endpoints (e.g. under `/admin`), set `mount_path` and mount at
it — the `_grid` partial builds every client endpoint from `mount_path`, so the
browser requests follow automatically, independent of the engine's route-helper
name.

```js
// app/javascript/application.js
import "@hotwired/turbo-rails"
import { Application } from "@hotwired/stimulus"
import StimulusGrid from "stimulus_grid"
import StimulusGridRails from "stimulus_grid_rails"
const app = Application.start()
StimulusGrid.start(app)
StimulusGridRails.start(app)
```

```erb
<%# layout <head> %>
<%= stylesheet_link_tag "stimulus_grid", "stimulus_grid_rails" %>
<%= javascript_importmap_tags %>
```

Undo/redo additionally needs the audit table:

```bash
bin/rails stimulus_grid_rails:install:migrations
bin/rails db:migrate
```

The engine auto-registers the importmap pins (`stimulus_grid`,
`stimulus_grid_rails`), precompiles the CSS, and prepends the gem's view path.

---

## Module configuration — `StimulusGridRails`

| Member | Signature | Description |
|---|---|---|
| `.parent_controller` | `=> String` (default `"ApplicationController"`) | Base class the gem's controllers inherit from. Set to your authenticated/tenant-scoped base controller so Devise + ActsAsTenant `before_action`s run on grid endpoints. |
| `.parent_controller=` | `(String)` | Setter for the above. Set in an initializer. |
| `.mount_path` | `=> String` (default `"/grids"`) | Where the engine is mounted; the grid's client endpoints are built from it. Set it and mount the engine at the same value. |
| `.mount_path=` | `(String)` | Setter (trailing slashes stripped). e.g. `"/admin/grids"`. |
| `.register_grid` | `(resource, klass)` | Registers a `Grid` subclass under `resource`. Called automatically by `Grid.resource`. |
| `.lookup_grid` | `(resource) => Class` | Resolves `:resource` (from a URL) to its `Grid` subclass; raises `ArgumentError` if unregistered. |
| `.registry` | `=> Hash` | The `{ resource => Grid subclass }` map. |
| `.tenant_stream_token` | `=> String \| nil` | Per-tenant stream token from `ActsAsTenant.current_tenant`; `nil` when not multi-tenant. |
| `.streamables_for` | `(resource, *extra) => Array` | The streamables a grid's broadcasts + subscription share: `[tenant_token, "sgr-grid:#{resource}", *extra].compact`. |

---

## `StimulusGridRails::Grid`

Base class for a grid. Subclass it, declare a `resource`, a `model`, and
`column`s.

### Class DSL

| Method | Signature | Description |
|---|---|---|
| `resource` | `(name)` | Sets the URL segment + registry key (string). Required. |
| `model` | `(klass)` | The Active Record class backing the grid. Required. |
| `column` | `(name, **opts)` | Declares a column. See [`column` options](#column-options). |
| `resolve_column!` | `(col_id) => Column` | Looks up a column by id; raises if unknown. |
| `columns_registry` | `=> { Symbol => Column }` | Ordered column map. |
| `resource_name` / `model_class` | readers | The declared resource + model. |

### Instance API

Constructed as `YourGrid.new(user: current_user)`.

| Method | Signature | Description |
|---|---|---|
| `scope` | `(user = self.user) => Relation` | **Override for authorization.** The base relation every lookup + search runs against. Default `model_class.all`. e.g. `model_class.where(account: user.account)`. |
| `columns` | `=> [Column]` | All columns in declaration order. |
| `cell_value` | `(row, column) => Object` | The Ruby value for a cell; runs `compute_<name>(row)` for computed columns. |
| `format_cell` | `(row, column) => String` | The display string rendered server-side (money/date/datetime/boolean formatting). Override for richer formatting. |
| `serialize_value` | `(value, column) => Object` | JSON-friendly value used by `row_to_h` (numbers numeric, dates ISO). |
| `row_to_h` | `(row) => Hash` | `{ "id" =>, "<col>" => … }` for all non-`_` columns incl. computed — the client row shape. |
| `row_to_json` | `(row) => String` | `row_to_h` as JSON (used for `row-insert-sorted`). |
| `apply_cell!` | `(row, column, value) => [ok, errors, mutations]` | Validates → assigns → recomputes dependent computed columns → saves. `mutations` is `[[row_id, col, value, opts], …]` (originating cell first, then cascades). On failure restores the prior value. |
| `new_row_defaults` | `=> Hash` | **Override.** Default attributes for a created row. Default `{}`. |
| `build_new_row` | `(overrides = {}) => Model` | Unsaved instance: `new_row_defaults.merge(overrides)`. |
| `search_and_filter` | `(relation, q:, filters:) => Relation` | Applies global search + per-column filters. |
| `apply_search` | `(relation, q) => Relation` | OR of each searchable column's `search_predicate`. |
| `apply_filters` | `(relation, filters) => Relation` | AND of each column's `filter_predicate`. |
| `apply_sort` | `(relation, sort_model) => Relation` | Server-side sort (Arel) from `[{ "colId":, "sort":"asc"|"desc" }]`; real columns only. |
| `row_id` | `(row) => Object` | `row.id` (or `row[:id]`). |

### Computed columns

Declare `computed: true, depends_on: %i[a b]` and define `compute_<name>(row)`:

```ruby
column :total, type: :integer, computed: true, depends_on: %i[gold silver bronze]
def compute_total(row) = row.gold.to_i + row.silver.to_i + row.bronze.to_i
```

The server computes the cascade on any edit to a `depends_on` column and pushes
the recomputed value in the same response + broadcast. Computed columns are
display/serialize-only (not persisted unless the model also has the attribute).

---

## `column` options

```ruby
column :name, type: :string, editable: true, …
```

| Option | Type / values | Default | Meaning |
|---|---|---|---|
| `type:` | symbol (see [types](#column-types)) | — (required) | Drives coercion, default editor, filter UI, JSON serialization. |
| `editable:` | `bool` or `->(row, user)` | `false` | Whether the cell can be edited. Lambda is re-evaluated server-side on **every** PATCH. |
| `editor:` | string | by type | Client editor key (informational; the base grid picks an input by `type`). |
| `editor_config:` | hash | `{}` | Serialized into the cell's `data-editor-config`. |
| `enum_values:` | array | `nil` | Allowed values for `:enum`; serialized into `data-enum-values`. |
| `concurrency:` | `:last_write_wins` \| `:version_checked` \| `:field_locked` | `:last_write_wins` | `:version_checked` compares `lock_version` and returns `cell-conflict` on mismatch. |
| `computed:` | bool | `false` | Marks a computed column (needs `compute_<name>`). |
| `depends_on:` | `[Symbol]` | `[]` | Columns whose change triggers recompute of this computed column. |
| `validate:` | `->(value, row)` | `nil` | Server validator. Return `nil`/`true` (ok), a `String`, or `[String]` (errors). |
| `header:` | string | humanized name | Header label. |
| `width:` | integer | — | Pixel width. |
| `pinned:` | `:left` \| `:right` | `nil` | Pin the column. |
| `cell_renderer:` | string (template id) | `nil` | Custom display template. See [renderers](#custom-cell-renderers--editors). |
| `cell_editor:` | string (template id) | `nil` | Custom editor template. |
| `sortable:` | bool | `true` | Header sort affordance. |
| `filterable:` | bool | `true` | Header filter affordance. |
| `searchable:` | bool | `true` for text-ish types | Whether the global search term matches this column. |

Columns whose name starts with `_` (e.g. `:_actions`, `:_medals`) are
renderer-only: excluded from `row_to_h`, search, and filtering.

---

## Column types

`string` · `text` · `integer` · `bigint` · `decimal` · `money` · `boolean` ·
`enum` · `date` · `datetime` · `reference`.

| Type | Coercion | Client filter / editor |
|---|---|---|
| `string` / `text` / `enum` / `reference` | `to_s` | text filter, text editor (enum → choose from `enum_values`) |
| `integer` / `bigint` | `Integer()` | number filter, number editor |
| `decimal` / `money` | `BigDecimal()` | number filter, number editor |
| `boolean` | truthy set (`1/true/yes/on/t`) | boolean filter, select editor |
| `date` | `Date.parse` | date filter, date editor |
| `datetime` | `Time.zone.parse` | date filter, datetime-local editor |

---

## Search & filter operators

A per-column filter `criteria` is `{ "type" => <op>, "value" => …, "value2" => … }`.
Unknown columns / unparseable values are ignored. Predicates are built with Arel
(no string interpolation of column names).

| Column type | Operators |
|---|---|
| text/enum | `contains` (default) · `equals` · `notEqual` · `startsWith` · `endsWith` · `blank` · `notBlank` (case-insensitive) |
| number | `equals` (default) · `greaterThan` · `greaterThanOrEqual` · `lessThan` · `lessThanOrEqual` · `notEqual` · `inRange` (`value`..`value2`) |
| date/datetime | `equals` (default) · `greaterThan` · `lessThan` · `notEqual` · `inRange` |
| boolean | `equals` |

Global search (`q`) does a case-insensitive `contains` OR across every
`searchable?` column.

---

## `StimulusGridRails::Broadcastable`

`include` it in the model and call `broadcasts_grid YourGrid`.

| Member | Signature | Description |
|---|---|---|
| `broadcasts_grid` | `(grid_class)` (class method) | Wires `after_create_commit` → `row-insert-sorted`, `after_update_commit` → `cell` (per changed registered column + computed cascade), `after_destroy_commit` → `row-remove`. All tenant-scoped. |
| `_sgr_optimistic_id` | accessor | Set by the cells controller before a grid save so the auto-broadcast carries the originator's optimistic id (it then suppresses its own echo). `nil` for non-grid changes (console/jobs → broadcast to all). |
| `stimulus_grid_class` | class reader | The wired grid class. |

```ruby
class Athlete < ApplicationRecord
  include StimulusGridRails::Broadcastable
  broadcasts_grid AthleteGrid
  self.locking_column = :lock_version   # for :version_checked columns
end
```

---

## `StimulusGridRails::TurboStreams`

Module functions that build `<turbo-stream>` markup with custom `action=`s. Each
is broadcast (by `Broadcastable`) or returned directly (by controllers); the
matching client handlers are registered by `stimulus_grid_rails.js`.

| Function | Signature | Produces / client effect |
|---|---|---|
| `cell` | `(grid:, row_id:, column:, value:, optimistic_id: nil)` | Set a cell's value (DOM + gridApi). Originator suppresses if `optimistic-id` is its own. |
| `cell_attr` | `(grid:, row_id:, column:, attr:, value:)` | Set one attribute on a cell. |
| `cell_confirm` | `(grid:, row_id:, column:, value:, optimistic_id:)` | Clear pending state (green flash) + set value. |
| `cell_revert` | `(grid:, row_id:, column:, value:, errors:, optimistic_id:)` | Restore server value + red error styling + `grid:cellError` event. |
| `cell_conflict` | `(grid:, row_id:, column:, server_value:, client_value:, optimistic_id:)` | Conflict styling + `grid:cellConflict` event. |
| `row_insert_sorted` | `(grid:, row_id:, payload:)` | Add a row from a JSON `payload` (idempotent by id). |
| `row_remove` | `(grid:, row_id:)` | Remove a row by id. |
| `aggregate` | `(grid:, column:, kind:, value:)` | Update `[data-grid-aggregate="<grid>:<column>:<kind>"]`. |
| `bulk` | `(grid:, streams:)` | Wrap an array of stream strings; applied in one reflow. |
| `presence` | `(grid:, row_id:, column:, user_id:, user_label:, active:)` | Add/remove a per-user editing badge. |

Wire format example (`cell`):

```html
<turbo-stream grid="athletes" row-id="1" column="age" optimistic-id="op-…" action="cell">
  <template>31</template>
</turbo-stream>
```

---

## `StimulusGridRails::Audit`

Table `stimulus_grid_audits` (install via the engine migration). One row per
successful cell mutation; undo/redo replay prior/new values.

**Columns:** `resource`, `row_id`, `column`, `prior_value`, `new_value`,
`user_id`, `undone` (bool), `undone_at`, timestamps.

| Method | Description |
|---|---|
| `.available?` | `true` once the table exists (auditing/undo are no-ops until then). |
| `.undoable(resource, user_id)` | Not-yet-undone mutations, newest first. |
| `.redoable(resource, user_id)` | Undone mutations, most-recently-undone first. |

---

## HTTP endpoints

Paths below are relative to `StimulusGridRails.mount_path` (default `/grids`; the
demo uses `/admin/grids`). All mutating requests require the CSRF token in
`X-CSRF-Token` (sent automatically by `grid-sync`).

| Verb | Path | Action | Body | Response |
|---|---|---|---|---|
| PATCH | `/:resource/:row_id/cells/:column` | `cells#update` | `{ value, optimistic_id, lock_version? }` | `200` turbo-stream `cell-confirm` (+ `bulk` cascade); `422` `cell-revert`; `200` `cell-conflict` on stale version; `403` if not editable |
| POST | `/:resource/bulk` | `cells#bulk` | `{ mutations: [{row_id, column, value}], optimistic_id }` | `200` `bulk` of `cell-confirm` |
| GET | `/:resource/rows?q=&filters=&page=&page_size=&sort=` | `rows#index` | query params (`filters`/`sort` are JSON) | `200` JSON `{ rows, total, page?, page_size?, limited }`. With `page` → a window; without → the capped (`MAX_ROWS=5000`) full set |
| POST | `/:resource/rows` | `rows#create` | `{ attributes: {…} }` | `200` (empty; auto-broadcasts `row-insert-sorted`); `422` JSON `{ errors }` |
| DELETE | `/:resource/rows/:row_id` | `rows#destroy` | — | `200` (auto-broadcasts `row-remove`) |
| DELETE | `/:resource/rows/bulk` | `rows#destroy_bulk` | `{ ids: [...] }` | `200` |
| POST | `/:resource/undo` | `history#undo` | — | `200` ok / `204` nothing / `501` no audit table |
| POST | `/:resource/redo` | `history#redo_change` | — | `200` / `204` / `501` |

**Path helpers** (via `stimulus_grid_rails.` in the host, after `mount … as:` —
the engine names them `cell`, `bulk`, `index_rows`, `rows`, `bulk_rows`, `row`,
`undo`, `redo`). All take `resource:` (and `row_id:`/`column:` where present).

All lookups go through `grid.scope(current_user).find(...)`, so out-of-scope rows
raise `RecordNotFound`. The `current_user` comes from Devise when present.

---

## Client-side contract (`grid-sync`)

The `grid-sync` Stimulus controller is mounted on the grid element by the `_grid`
partial alongside `grid`.

### Values (set by the partial)

`resource` · `cellsPathTemplate` · `rowsPath` · `rowPathTemplate` ·
`bulkRowsPath` · `undoPath` · `redoPath` · `optimisticIdPrefix`.

### Events it listens for (dispatch on the grid element)

| Event | `detail` | Effect |
|---|---|---|
| `grid-sync:add-row` | `{ attributes? }` | POST create |
| `grid-sync:delete-selected` | — | bulk-delete `getSelectedRowIds()` |
| `grid-sync:search` | `{ q }` | server search (debounced 200ms) → `setRowData` |
| `grid-sync:filter` | `{ column, criteria }` (criteria `null` clears) | server filter (debounced) |
| `grid-sync:clear-filters` | — | reset search + filters |

### Events it emits / re-emits

- `grid-sync:rows-fetched` — `{ total, shown, limited }` after a search/filter.
- `grid:cellError` — `{ rowId, column, errors }` on revert.
- `grid:cellConflict` — `{ rowId, column, serverValue, clientValue, optimisticId }`.

### Public methods

`addRow(attributes = {})` · `removeRow(rowId)` · `deleteSelected()` ·
`undo()` · `redo()` · `fetchRows()`.

### Keyboard

`Cmd/Ctrl+Z` → undo · `Cmd/Ctrl+Shift+Z` / `Ctrl+Y` → redo. Ignored while a
text field or cell editor is focused.

### Delegated DOM hooks

A `<button data-sgr-action="delete-row">` anywhere inside a row triggers
`removeRow` for that row.

### Registered Turbo Stream actions (client)

`cell` · `cell-attr` · `cell-confirm` · `cell-revert` · `cell-conflict` ·
`row-insert-sorted` · `row-remove` · `bulk` · `aggregate` · `presence` — see the
[TurboStreams](#stimulusgridrailsturbostreams) table for attributes.

---

## Custom cell renderers & editors

Define `<template>` elements on the page; reference by id from the column.

**Renderer** (`cell_renderer:`) — cloned per cell:
- `data-bind="field"` → element text = `row.field`
- `data-bind-text` → formatted value
- `data-bind-attr="name"` → set attribute `name` to the cell value

**Editor** (`cell_editor:`) — cloned on edit. The control marked
`[data-editor-input]` (else the first `input`/`select`/`textarea`) is seeded with
the current value, focused, and read on commit. A column may declare both.

```erb
<template id="sgr-sport">
  <span class="pill" data-bind="sport" data-bind-attr="data-sport"></span>
</template>
<template id="sgr-sport-editor">
  <select data-editor-input>
    <% AthleteGrid.columns_registry[:sport].enum_values.each do |s| %><option><%= s %></option><% end %>
  </select>
</template>
```

---

## View partials

`render partial: "stimulus_grid_rails/grids/grid", locals: { … }`

| Local | Required | Default | Meaning |
|---|---|---|---|
| `grid:` | yes | — | A `Grid` instance (`YourGrid.new(user:)`). |
| `rows:` | yes | — | The collection to render server-side. |
| `id:` | no | `"<resource>-grid"` | DOM id of the grid element. |
| `css_class:` | no | — | Extra classes on the wrapper. |
| `pagination:` | no | `true` | Render the pagination nav. |
| `page_size:` | no | `25` | Rows per page. |
| `row_selection:` | no | `nil` | `"single"` \| `"multiple"`. |
| `server_side:` | no | `false` | Server-side row model: render only the first page as `rows:`; the grid fetches windows. |
| `total:` | no | `rows.size` | Full server row count (required when `server_side:` is true) — drives pagination. |

The partial renders the table + columns + rows, the pagination nav, and a
tenant-scoped `turbo_stream_from(*StimulusGridRails.streamables_for(resource))`.
The internal `_row` partial emits `data-row-id`, `data-lock-version` (when the
model supports it), and per-cell editor/data attributes.

---

## CSS classes

Shipped in `stimulus_grid_rails.css` (load alongside `stimulus_grid.css`):

| Class | Applied when |
|---|---|
| `.sgr-cell-pending` | optimistic edit in flight (blue pulse) |
| `.sgr-cell-just-confirmed` | server confirmed (green flash, 0.5s) |
| `.sgr-cell-error` | server rejected (red outline + `title` tooltip, 4s) |
| `.sgr-cell-conflict` | version conflict (amber dashed outline) |
| `.sgr-presence` | per-user editing badge |

---

## Multi-tenancy & auth

Three layers keep tenants isolated (RAILS.md §2/§17):

1. **Inherited controller** — gem controllers subclass
   `StimulusGridRails.parent_controller` (default `"ApplicationController"`), so
   your `authenticate_user!` and ActsAsTenant `set_current_tenant_through_filter`
   `before_action`s run on grid endpoints.
2. **Scoped lookups** — every row is fetched via `grid.scope(current_user).find`,
   never a bare `Model.find`. Override `scope(user)` for custom authorization;
   with ActsAsTenant the relation is auto-tenant-scoped.
3. **Tenant-scoped streams** — broadcast + subscription streamables include
   `StimulusGridRails.tenant_stream_token` (from `ActsAsTenant.current_tenant`),
   so one tenant never receives another's broadcasts. No-op when not multi-tenant.
