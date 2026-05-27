---
name: stimulus-grid-rails-cookbook
description: Wire-format reference + first-time integration recipe for stimulus_grid_rails. Read this whenever you need exact HTTP request/response shapes, Turbo Stream action attributes, optimistic-id reconciliation, schema requirements, or you're debugging why a fresh integration didn't work first time. Companion to skills/stimulus-grid-rails/SKILL.md and the gem-internal docs/REFERENCE.md.
---

# stimulus_grid_rails — wire-format cookbook

This file is the **load-bearing spec** for the Rails ↔ JS contract. The
companion [`SKILL.md`](./SKILL.md) gives the high-level setup story; the
gem-internal [`REFERENCE.md`](../../gem/stimulus_grid_rails/docs/REFERENCE.md)
is the Ruby API surface; this file is what you read when the bytes on
the wire matter or your first-time integration didn't behave the way
you expect.

If you're integrating into a fresh Rails app and want a working two-tab
live grid on the first try, jump to the
[End-to-end first-time recipe](#end-to-end-first-time-recipe) and come
back here for any detail that surprises you.

## Table of contents

1. [Architecture in 60 seconds](#architecture-in-60-seconds)
2. [Schema requirements](#schema-requirements)
3. [HTTP surface — full request/response](#http-surface)
4. [Turbo Stream wire format](#turbo-stream-wire-format)
5. [Optimistic-id reconciliation lifecycle](#optimistic-id-reconciliation-lifecycle)
6. [Packet trace — one cross-tab cell edit, ms-by-ms](#packet-trace)
7. [Row payload + field-type serialization](#row-payload-shape)
8. [Computed-column cascade contract](#computed-column-cascade-contract)
9. [Error + conflict responses](#error--conflict-responses)
10. [Tenant scoping mechanics](#tenant-scoping-mechanics)
11. [Bulk paste + bulk delete atomicity](#bulk-paste--bulk-delete-atomicity)
12. [Audit + undo/redo table shape](#audit--undoredo-table-shape)
13. [Wiring pre-flight checklist (silent-failure warnings)](#wiring-pre-flight-checklist)
14. [End-to-end first-time recipe](#end-to-end-first-time-recipe)
15. [Common first-time failures + diagnoses](#common-first-time-failures)
16. [Where to look in the gem](#where-to-look-in-the-gem)

## Architecture in 60 seconds

Three pieces, one stream — same shape as `stimulus_kanban_rails`, but
cell-grained instead of card-grained:

```
                       Action Cable (Turbo Streams)
   ┌─────────────────┐  ────────────────────────►   ┌─────────────────┐
   │  Tab A (browser)│                               │  Tab B (browser)│
   │  data-controller│                               │  data-controller│
   │   ="grid        │                               │   ="grid        │
   │    grid-sync"   │                               │    grid-sync"   │
   └────────┬────────┘                               └────────┬────────┘
            │ PATCH /grids/:resource/:row_id/cells/:column     ▲
            │ X-Optimistic-Id: <uuid>                          │
            │ body: { value, optimistic_id, lock_version? }    │ broadcast
            ▼                                                  │ (turbo-stream)
   ┌───────────────────────────────────────────────────────────┴────────┐
   │  Rails (gem/stimulus_grid_rails)                                   │
   │                                                                    │
   │   CellsController#update                                           │
   │     ├─ column.editable_for?(row, user)        → 403 if false       │
   │     ├─ stale_version?                          → cell-conflict     │
   │     ├─ column.coerce(raw_value)                → cell-revert if bad │
   │     └─ grid.apply_cell!(row, col, value)                           │
   │          ├─ validate ok? assign + save!                            │
   │          ├─ cascade compute_<deps>             → cell mutations    │
   │          └─ on save: after_update_commit                           │
   │              └─► Broadcastable.stimulus_grid_broadcast_changes     │
   │                  ─► <turbo-stream action="cell" …>                 │
   │                       broadcast_stream_to(*streamables)            │
   │                                                                    │
   │   Originator response: cell-confirm + cascaded cell streams        │
   │   (status 200 turbo-stream)                                        │
   └────────────────────────────────────────────────────────────────────┘
```

Per cell edit:

1. JS optimistically marks the cell `data-pending` (blue pulse) and
   stashes the prior value in `data-prior-value`.
2. `grid-sync` PATCHes Rails with `X-Optimistic-Id` and (for
   `:version_checked` columns) `lock_version`.
3. `apply_cell!` coerces → validates → assigns → recomputes any
   `depends_on` cascade → saves.
4. `after_update_commit` broadcasts ONE `cell` turbo-stream per changed
   registered column (direct + cascade) to every tab's
   `turbo_stream_from`, including the originator. Each stream carries
   the originator's `optimistic_id` in the `optimistic-id` attribute.
5. Originator gets a direct `cell-confirm` response (green flash) and
   suppresses its own broadcast echoes.
6. Other tabs apply each broadcast stream via the registered
   `cell` / `bulk` / `row-insert-sorted` / `row-remove` StreamAction
   handlers.
7. On 4xx, the originator gets `cell-revert` (red outline + error text)
   or `cell-conflict` (amber dashed). Server value is restored.

## Schema requirements

### Your row model

Stimulus_grid_rails has **no required schema columns** — your model can
be anything. The defaults work for a standard Active Record table where
the grid edits scalar columns.

You only need extra columns for opt-in features:

| Column         | Type      | Required for                                                       |
|----------------|-----------|--------------------------------------------------------------------|
| `lock_version` | `integer` | Any column declared `concurrency: :version_checked` (the cell sends `lock_version` and the controller rejects stale writes with `cell-conflict`). |
| (your fields)  | any       | One column per non-computed `column` you declare on the Grid.      |

Computed columns aren't DB columns — they're derived in `compute_<name>(row)`.

Minimal migration:

```ruby
class CreateAthletes < ActiveRecord::Migration[7.2]
  def change
    create_table :athletes do |t|
      t.string  :athlete,      null: false
      t.string  :country
      t.string  :sport
      t.integer :age
      t.date    :date
      t.integer :gold,         null: false, default: 0
      t.integer :silver,       null: false, default: 0
      t.integer :bronze,       null: false, default: 0
      t.integer :lock_version, null: false, default: 0
      t.timestamps
    end
  end
end
```

> If you want undo/redo, also install the audit table — see
> [Audit + undo/redo table shape](#audit--undoredo-table-shape).

### Host-app prerequisites

- Rails 7.0+ (engine targets 7.2 in tests; uses Turbo Streams).
- `turbo-rails`, `stimulus-rails`, `importmap-rails` in the host Gemfile.
- `<%= csrf_meta_tags %>` in the layout — the JS sync controller reads
  the meta tag for `X-CSRF-Token` on every PATCH (forgery protection is
  **not** skipped on grid endpoints).
- An Action Cable mount: `mount ActionCable.server => "/cable"`.
- A `current_user` method on `parent_controller` if you want per-user
  authorization to work (Devise gives you this).

## HTTP surface

All endpoints live under `StimulusGridRails.mount_path` (default
`/grids`). All requests carry the CSRF token in `X-CSRF-Token`. All
PATCHes also carry `X-Optimistic-Id`. Responses are
`text/vnd.turbo-stream.html` (custom actions) **or** JSON
(`/rows?…` index returns JSON).

### PATCH `/:resource/:row_id/cells/:column` — cell update

The dominant endpoint. One cell, one PATCH.

**Headers:**
```
Content-Type:     application/json
Accept:           text/vnd.turbo-stream.html
X-CSRF-Token:     <from meta>
X-Optimistic-Id:  <uuid>
```

**Request body:**
```json
{
  "value":          31,
  "optimistic_id":  "op-…",
  "lock_version":   null   // or integer for :version_checked columns
}
```

**Response 200 (`cell-confirm` + any computed cascade as plain `cell` streams):**
```html
<turbo-stream grid="athletes" row-id="7" column="age" optimistic-id="op-…" action="cell-confirm">
  <template>31</template>
</turbo-stream>
```

Or, when the edit cascades through a computed column (e.g. editing
`gold` recomputes `total`):

```html
<turbo-stream grid="athletes" action="bulk">
  <template>
    <turbo-stream grid="athletes" row-id="7" column="gold"  optimistic-id="op-…" action="cell-confirm"><template>4</template></turbo-stream>
    <turbo-stream grid="athletes" row-id="7" column="total" optimistic-id="op-…" action="cell"        ><template>9</template></turbo-stream>
  </template>
</turbo-stream>
```

**Response 422 on validation/coerce error (`cell-revert`):**
```html
<turbo-stream grid="athletes" row-id="7" column="age" optimistic-id="op-…"
              errors='["must be between 10 and 80"]' action="cell-revert">
  <template>30</template>   <!-- server's prior value, restored -->
</turbo-stream>
```

**Response 200 on stale version (`cell-conflict`):**
```html
<turbo-stream grid="athletes" row-id="7" column="age" optimistic-id="op-…"
              server-value="32" client-value="31" action="cell-conflict">
</turbo-stream>
```

**Response 403** (empty body) if `column.editable_for?(row, current_user)`
returns false.

### POST `/:resource/bulk` — bulk cell paste (fill-down / TSV paste)

Fires from `Cmd/Ctrl+V` over a rectangular range with tab/newline data.

**Request body:**
```json
{
  "optimistic_id": "op-…",
  "mutations": [
    { "row_id": 7, "column": "gold",   "value": 4 },
    { "row_id": 7, "column": "silver", "value": 2 },
    { "row_id": 8, "column": "gold",   "value": 1 }
  ]
}
```

**Response 200 — `bulk` of `cell-confirm` streams, skipping rejected cells:**

```html
<turbo-stream grid="athletes" action="bulk">
  <template>
    <turbo-stream grid="athletes" row-id="7" column="gold"   optimistic-id="op-…" action="cell-confirm"><template>4</template></turbo-stream>
    <turbo-stream grid="athletes" row-id="7" column="silver" optimistic-id="op-…" action="cell-confirm"><template>2</template></turbo-stream>
    <turbo-stream grid="athletes" row-id="8" column="gold"   optimistic-id="op-…" action="cell-confirm"><template>1</template></turbo-stream>
  </template>
</turbo-stream>
```

> Unlike single-cell PATCH, bulk **silently skips** non-editable
> columns, coerce failures, and rows outside scope. No partial-fail
> response — the originator just doesn't see those cells confirm.

### GET `/:resource/rows?q=&filters=&page=&page_size=&sort=` — search/filter

**Query params:**

| Param        | Shape                                          | Notes                            |
|--------------|------------------------------------------------|----------------------------------|
| `q`          | string                                         | global case-insensitive search across `searchable?` columns |
| `filters`    | JSON `{ "<column>": { "type": "<op>", "value": …, "value2"? } }` | per-column filters       |
| `sort`       | JSON `[{ "colId": "<col>", "sort": "asc"\|"desc" }, …]` | server-side sort (Arel)  |
| `page`       | integer (0-indexed)                            | server-side row model only       |
| `page_size`  | integer (clamped 1..1000)                      | server-side row model only       |

**Response 200 (client-side row model, no `page` param):**
```json
{ "rows": [ { "id": 1, "athlete": "…", "gold": 3, "total": 9 }, … ],
  "total": 142,
  "limited": false }
```

`limited` is `true` if the full filtered relation exceeded
`RowsController::MAX_ROWS = 5_000`.

**Response 200 (server-side row model, `page` present):**
```json
{ "rows": [...],
  "total": 142,
  "page": 0,
  "page_size": 25,
  "limited": false }
```

Filter `criteria` operators per column type:

| Column type    | Operators                                                                                                  |
|----------------|------------------------------------------------------------------------------------------------------------|
| text/enum      | `contains` (default) · `equals` · `notEqual` · `startsWith` · `endsWith` · `blank` · `notBlank`            |
| number         | `equals` (default) · `greaterThan` · `greaterThanOrEqual` · `lessThan` · `lessThanOrEqual` · `notEqual` · `inRange` (uses `value` and `value2`) |
| date/datetime  | `equals` (default) · `greaterThan` · `lessThan` · `notEqual` · `inRange`                                   |
| boolean        | `equals`                                                                                                   |

### POST `/:resource/rows` — create row

**Request body:**
```json
{ "attributes": { "athlete": "Ada", "country": "GB", "sport": "Cycling" } }
```

Server merges `grid.new_row_defaults` under your `attributes`.

**Response 200** (empty body — the after_create_commit broadcasts
`row-insert-sorted` to everyone including the originator).

**Response 422 on validation error:**
```json
{ "errors": ["Athlete can't be blank"] }
```

> The originator does **not** receive a direct response with the row
> body. It waits for the broadcast. Round-trip is typically ~50ms.

### DELETE `/:resource/rows/:row_id` — destroy one

**Response 200** (empty body — after_destroy_commit broadcasts
`row-remove`).

### DELETE `/:resource/rows/bulk` — destroy many

**Request body:**
```json
{ "ids": [7, 8, 9] }
```

The controller does `grid.scope(user).where(id: ids).find_each(&:destroy)`
— so ids outside the user's scope are silently skipped. Each destroy
fires its own broadcast.

**Response 200** (empty body).

### POST `/:resource/undo` / `/:resource/redo` — history

**Request body:** none.

**Responses:**

| Status | Body                                | Meaning                                                       |
|--------|-------------------------------------|---------------------------------------------------------------|
| 200    | turbo-stream (replayed cell mutation) | undid/redid one mutation through the normal save path        |
| 204    | empty                               | nothing to undo/redo                                          |
| 501    | empty                               | `stimulus_grid_audits` table doesn't exist (migration not run) |

Undo/redo replays through `apply_cell!` so it re-validates, cascades,
and broadcasts like any other edit.

### POST `/:resource/:row_id/attachments/:column` — attachment upload

Multipart form upload for `:attachments` columns. One blob per request.

```
Content-Type: multipart/form-data; boundary=…
X-CSRF-Token: <from meta>

file=<binary>
```

Returns a turbo-stream that updates the attachments-cell renderer with
the new blob list.

### DELETE `/:resource/:row_id/attachments/:column/:attachment_id`

Detaches one blob. Returns a turbo-stream that removes the blob from
the cell.

## Turbo Stream wire format

The gem registers nine custom `<turbo-stream action="…">` types. JS
handlers for all of them are in
`gem/stimulus_grid_rails/app/assets/javascripts/stimulus_grid_rails.js`.

| `action=`              | Attributes                                                                       | Has `<template>` payload | Client effect                                                  |
|------------------------|----------------------------------------------------------------------------------|--------------------------|----------------------------------------------------------------|
| `cell`                 | `grid`, `row-id`, `column`, `optimistic-id?`                                     | value as text            | Update cell DOM + gridApi. Originator suppresses if own id.    |
| `cell-attr`            | `grid`, `row-id`, `column`, `attr`, `value`                                      | —                        | Set one attribute on the cell element.                         |
| `cell-confirm`         | `grid`, `row-id`, `column`, `optimistic-id`                                      | value as text            | Clear pending + green flash + apply value.                     |
| `cell-revert`          | `grid`, `row-id`, `column`, `optimistic-id`, `errors` (JSON array string)        | server's prior value     | Restore value + red outline + `grid:cellError` event.          |
| `cell-conflict`        | `grid`, `row-id`, `column`, `optimistic-id`, `server-value`, `client-value`      | —                        | Amber dashed outline + `grid:cellConflict` event.              |
| `row-insert-sorted`    | `grid`, `row-id`                                                                 | full row JSON            | Idempotent insert respecting current sort.                     |
| `row-remove`           | `grid`, `row-id`                                                                 | —                        | Remove the row.                                                |
| `bulk`                 | `grid`                                                                           | concatenated streams     | Apply N inner streams in one DOM reflow.                       |
| `aggregate`            | `grid`, `column`, `kind`                                                         | aggregate value as text  | Update `[data-grid-aggregate="<grid>:<column>:<kind>"]`.       |
| `presence`             | `grid`, `row-id`, `column`, `user-id`, `user-label`, `active`                    | —                        | Show/hide per-user editing badge on the cell.                  |

**Attribute name convention:** Ruby keyword args use underscores
(`row_id:`), the emitted HTML attribute uses dashes (`row-id`). The
`tag` helper in `turbo_streams_helper.rb` does this translation.

**Where streams come from:**
- The cells controller returns `cell-confirm` / `cell-revert` /
  `cell-conflict` **directly to the originator** as the HTTP response.
- The Broadcastable concern's after_commit callbacks emit `cell`
  (update), `row-insert-sorted` (create), `row-remove` (destroy) to
  **every subscriber including the originator** via Action Cable.
- The originator's `grid-sync` controller suppresses any broadcast whose
  `optimistic-id` matches its own (it already saw the direct response).

## Optimistic-id reconciliation lifecycle

```
Tab A                                Server                              Tab B
─────                                ──────                              ─────
edit cell (age = 31)
  ├─ DOM: data-pending, blue pulse
  ├─ stash prior value
  └─ grid:cellValueChanged fired
       │
       └─► grid-sync._onCellChange
             mints OID = "op-…"
             stash in originator's set (with 30s TTL)
             PATCH /grids/athletes/7/cells/age
             X-Optimistic-Id: op-…
             body: { value: 31, optimistic_id: "op-…", lock_version: 2 }
                                     │
                                     │ CellsController#update
                                     │   editable_for? → true
                                     │   stale_version? → false
                                     │   coerce → 31
                                     │   row._sgr_optimistic_id = "op-…"
                                     │   apply_cell! → save!
                                     │     after_update_commit:
                                     │       Broadcastable.stimulus_grid_broadcast_changes
                                     │         <turbo-stream action="cell"
                                     │            grid="athletes" row-id="7"
                                     │            column="age" optimistic-id="op-…">
                                     │           <template>31</template>
                                     │         </turbo-stream>
                                     │
                                     │ HTTP 200 reply (direct, NOT broadcast):
                                     │   <turbo-stream action="cell-confirm"
                                     │      grid="athletes" row-id="7"
                                     │      column="age" optimistic-id="op-…">
                                     │     <template>31</template>
                                     │   </turbo-stream>
                                     ▼
   ────────────────────────── Turbo Streams fanout to BOTH tabs ───────────────────────
                                     │
   Tab A receives the BROADCAST:     │       Tab B receives the BROADCAST:
   <cell optimistic-id="op-…">       │       <cell optimistic-id="op-…">
     handler: optimistic-id is mine  │         handler: optimistic-id not mine
       → DROP (already applied)      │         → apply: set cell text to 31
                                     │           → grid:cellChanged
   Tab A's HTTP response runs        │
     handler: cell-confirm           │
       → remove .sgr-cell-pending    │
       → add .sgr-cell-just-confirmed│
       → green flash 0.5s            │
```

**TTL guard:** each minted id is dropped from the originator's set
after 30s so a hung request never leaks. If a broadcast arrives after
30s the originator will redundantly re-apply — correct, but you'll see
a flicker.

**Cascade case** (editing `gold` recomputes `total`):
- Server returns a `bulk` of `cell-confirm` (gold) + `cell` (total)
  with the **same** `optimistic-id` for both. Originator absorbs both
  as part of "its own edit."
- Other tabs receive **two separate** `cell` broadcasts (one per
  changed column), same `optimistic-id`. They apply both normally
  (they're not the originator).

**Custom-client warning:** any non-Rails client that PATCHes
`/cells/:column` MUST send `X-Optimistic-Id` (and echo it in the
broadcast). Without it, the originator will visibly re-apply its own
edit and flicker.

## Packet trace — one cross-tab cell edit, ms-by-ms

User in Tab A edits `athletes[7].age` from 30 → 31. Tab B is open
viewing the same grid. Times are wall-clock from Tab A's keystroke.

```
t = 0 ms     Tab A    user presses Enter in editor
                      base grid fires grid:cellValueChanged
                      grid-sync._onCellChange:
                        td.dataset.priorValue = "30"
                        td.classList.add("sgr-cell-pending")
                        optimisticId = "op-2bfc-…"
                        myOptimisticIds.add(optimisticId)   [TTL 30s]
                      fetch PATCH /grids/athletes/7/cells/age

t = ~12 ms   Server   CellsController#update
                        editable_for?(row, current_user) → true
                        stale_version?                   → false
                        coerce("31") → 31, nil
                        row._sgr_optimistic_id = "op-2bfc-…"
                        apply_cell!:
                          validate → nil
                          row.age = 31
                          row.save!
                          after_update_commit fires:
                            Broadcastable.stimulus_grid_broadcast_changes
                              broadcast <turbo-stream action="cell" …
                                          optimistic-id="op-2bfc-…">
                        record_audit (if table installed)
                        build_response_stream:
                          cell-confirm (age=31)
                      render plain: turbo-stream

t = ~20 ms   Tab A    PATCH 200 OK arrives
                      Turbo.renderStreamMessage parses
                        cell-confirm StreamAction:
                          set cell text to "31"
                          remove .sgr-cell-pending
                          add .sgr-cell-just-confirmed (0.5s green flash)

t = ~25 ms   Tab A    Action Cable delivers BROADCAST cell stream
                      cell StreamAction:
                        optimistic-id = "op-2bfc-…" ∈ myOptimisticIds → DROP
                        myOptimisticIds.delete("op-2bfc-…")

t = ~25 ms   Tab B    Action Cable delivers BROADCAST cell stream
                      cell StreamAction:
                        optimistic-id = "op-2bfc-…" ∉ myOptimisticIds
                        find <td data-row-id="7" data-col-id="age">
                        set textContent = "31"
                        update gridApi row data: { id: 7, age: 31 }
                        (no pending/confirm pulse — that's only for own edits)

t = ~525 ms  Tab A    green flash fades
```

If the same edit cascaded (e.g. editing `gold` recomputes `total`),
swap the singleton response for a `bulk` of `[cell-confirm gold,
cell total]` and the broadcast for two `cell` events (one per changed
column).

## Row payload shape

`Grid#row_to_h(row)` is the canonical serializer. Output:

```json
{
  "id":       <row.id>,
  "<col>":    <serialize_value(cell_value(row, col), col)>,
  ...
}
```

- Columns whose name starts with `_` (e.g. `:_actions`, `:_medals`) are
  **excluded** from the payload and from search/filter — they exist
  only as client-side renderers.
- Computed columns ARE included — `cell_value` runs `compute_<name>(row)`.

Field-type serialization (`Grid#serialize_value`):

| `column type:`        | JSON output                                                  |
|-----------------------|--------------------------------------------------------------|
| `:integer`, `:bigint` | integer                                                      |
| `:decimal`, `:money`  | number (BigDecimal → Float — lossy; use `:string` if you need exact decimal precision) |
| `:boolean`            | `true`/`false`                                               |
| `:date`               | ISO-8601 date string                                         |
| `:datetime`           | ISO-8601 datetime string                                     |
| `:string`, `:text`, `:enum`, `:reference` | passthrough                              |

`row-insert-sorted` broadcasts use `row_to_json(row)` — same shape,
JSON-encoded in the `<template>` payload.

## Computed-column cascade contract

```ruby
column :total, type: :integer, computed: true, depends_on: %i[gold silver bronze]
def compute_total(row) = row.gold.to_i + row.silver.to_i + row.bronze.to_i
```

When ANY of `gold`/`silver`/`bronze` is edited:

1. `apply_cell!` returns a `mutations` array: the originating cell
   first, then every computed column whose `depends_on` intersects the
   changed column.
2. The HTTP response to the originator is a `bulk` containing
   `cell-confirm` for the original cell + plain `cell` for each
   cascaded computed cell.
3. The Broadcastable after_commit fires ONE `cell` broadcast per
   changed registered column. For computed columns, the trigger is
   `(column.depends_on & previous_changes.keys.map(&:to_sym)).any?`.

> **Implication:** if your computed column depends on a column that's
> NOT in the registry (e.g. a counter cache), the cascade won't fire.
> Add the dependency as a (possibly non-editable, non-displayed)
> registered column to trigger the cascade. Or trigger the broadcast
> manually from a model callback.

Computed columns are **display-only by default** — they're recomputed,
serialized, and broadcast, but never persisted unless the underlying
model also has the attribute and writes it itself.

## Error + conflict responses

### Validation / coerce failure → `cell-revert` (HTTP 422)

```html
<turbo-stream grid="athletes" row-id="7" column="age" optimistic-id="op-…"
              errors='["must be between 10 and 80"]' action="cell-revert">
  <template>30</template>
</turbo-stream>
```

Client effect:
- Cell value reverts to the server's prior.
- `.sgr-cell-error` class added (red outline, 4s).
- `title` attribute set to the first error string.
- `grid:cellError` event dispatched with `{ rowId, column, errors }`.

### Stale lock_version → `cell-conflict` (HTTP 200)

```html
<turbo-stream grid="athletes" row-id="7" column="age" optimistic-id="op-…"
              server-value="32" client-value="31" action="cell-conflict">
</turbo-stream>
```

Client effect:
- `.sgr-cell-conflict` class added (amber dashed outline).
- `grid:cellConflict` event dispatched with `{ rowId, column,
  serverValue, clientValue, optimisticId }`.
- The user (or your host code) decides how to resolve — re-apply,
  abandon, merge.

### Not editable → 403, empty body

Originator's cell stays in its optimistic state with no class change.
Host code can listen for `grid-sync` console warnings or wrap the
fetch.

### Network error → local rollback

```js
} catch (err) {
  console.error("[stimulus_grid_rails] PATCH failed:", err)
  this._gridEl.gridApi?.applyTransaction({
    update: [{ id: rowId, [colId]: oldValue }],
  })
  td.classList.remove("sgr-cell-pending")
  td.removeAttribute("data-pending")
}
```

No broadcast, no audit row, optimistic state cleared.

### `rows#create` validation error → JSON `{ errors }` (HTTP 422)

Not a turbo-stream — JSON. Host code must handle the response if you
want to show errors for create.

## Tenant scoping mechanics

`StimulusGridRails.tenant_stream_token` reads `ActsAsTenant.current_tenant`
and returns `"sgr-tenant:<Class>:<id>"`. It's `nil` when ActsAsTenant
isn't loaded or no tenant is set, in which case tenant scoping is a
no-op.

Two things need to match:

1. **Broadcast token** (sent by `Broadcastable.stimulus_grid_broadcast_*`
   on the model after_commit).
2. **Subscription token** (rendered by `turbo_stream_from(*streamables)`
   inside the `_grid.html.erb` partial when the page is rendered).

Both go through the same `streamables_for(resource)` helper, so they
always agree **as long as `ActsAsTenant.current_tenant` is set the
same way at broadcast time as at render time.** For background jobs
that update rows, wrap with `ActsAsTenant.with_tenant(tenant) {
record.update!(…) }`.

**`Grid#scope(user)`** is the orthogonal axis — it constrains *which
rows the controller can find*, regardless of stream topology.
`BaseController#find_row!` calls `grid.scope(current_grid_user).find(id)`,
so any default scope or `where` clause applies. The default returns
`model_class.all` (i.e. ActsAsTenant's default_scope is the only guard
unless you override).

Override `Grid#scope` for explicit auth:

```ruby
def scope(user) = model_class.where(account_id: user.account_id)
```

> See `gem/stimulus_grid_rails/RAILS.md` §2 / §17 for the canonical
> tenant-isolation discussion (referenced inline in the gem source).

## Bulk paste + bulk delete atomicity

### Bulk paste (`POST /:resource/bulk`)

- **NOT a transaction.** Each cell is processed in sequence. A
  per-cell coerce failure or non-editable column is silently skipped
  — the response is the `bulk` of confirmations for the cells that
  did persist.
- All successful writes carry the same `optimistic_id` so the
  originator absorbs all broadcasts.
- Audit rows are written per successful cell.

> If you need transactional bulk-paste semantics, write your own
> `POST /…/bulk_atomic` endpoint that wraps the iteration in
> `model_class.transaction { … }` and raises on any failure.

### Bulk delete (`DELETE /:resource/rows/bulk`)

- **NOT a transaction.** `find_each(&:destroy)` iterates one record
  at a time. A destroy callback raising mid-batch leaves the
  previously-destroyed rows gone.
- Each destroy fires its own `row-remove` broadcast.
- Ids outside the user's scope are silently filtered by the
  `grid.scope(user).where(id: ids)` query.

## Audit + undo/redo table shape

Run the bundled migration:

```bash
bin/rails stimulus_grid_rails:install:migrations
bin/rails db:migrate
```

Creates `stimulus_grid_audits`:

| Column         | Type     | Purpose                                        |
|----------------|----------|------------------------------------------------|
| `resource`     | string   | grid's `resource_name`                         |
| `row_id`       | string   | the row's PK as a string                       |
| `column`       | string   | the column name                                |
| `prior_value`  | string   | string-coerced prior value (`nil` if blank)    |
| `new_value`    | string   | string-coerced new value                       |
| `user_id`      | string   | originator's `current_user.id` (nullable)      |
| `undone`       | boolean  | true once redone via `/redo`                   |
| `undone_at`    | datetime | when it was undone                             |
| timestamps     |          |                                                |

Until the table exists, `record_audit` is a quiet no-op and `/undo` /
`/redo` return `501 Not Implemented`.

Undo replays the prior value through the **normal** cells#update path
(via the history controller) so validation, cascade, and broadcasts
all fire as if the user typed it.

## Wiring pre-flight checklist

These all fail silently — i.e. no error in console, no error in the
Rails log, but live-sync just doesn't work or visibly flickers.

| Check | Why it matters |
|-------|----------------|
| ☐ `<%= csrf_meta_tags %>` in `<head>` | Without it `X-CSRF-Token` is empty → 422 on every PATCH |
| ☐ `mount ActionCable.server => "/cable"` | Without it broadcasts go nowhere; the originator's own response still works so single-tab "looks fine" |
| ☐ `import "@hotwired/turbo-rails"` in app.js | Without it `Turbo.renderStreamMessage` is undefined → cell-confirm doesn't apply |
| ☐ `StimulusGridRails.start(app)` called | Otherwise grid-sync controller never registers; clicking a cell does nothing |
| ☐ `StimulusGridRails.mount_path` matches the `mount` line | Mismatch → 404 on every PATCH; symptom = cell stays blue-pulsing then network rollback |
| ☐ Board class is referenced from a view before a PATCH arrives | Otherwise `StimulusGridRails.lookup_grid` raises ArgumentError on first request |
| ☐ `parent_controller` includes session/cookie auth | Otherwise `current_user` is `nil` and per-user `editable: ->` lambdas can't authorize |
| ☐ Model includes `StimulusGridRails::Broadcastable` AND calls `broadcasts_grid YourGrid` | Without `broadcasts_grid` the include is dead code; no broadcasts fire |
| ☐ `self.locking_column = :lock_version` if any column is `concurrency: :version_checked` | Without it the stale-write check no-ops; concurrent edits silently overwrite |
| ☐ When using ActsAsTenant: jobs/scripts wrap writes in `ActsAsTenant.with_tenant(tenant)` | Otherwise the broadcaster reads a `nil` tenant at after_commit and the broadcast streams don't match the view's subscription |

## End-to-end first-time recipe

Run this in order against a fresh Rails 7.2 app. If every step
succeeds, two browser windows side-by-side will mirror each other's
cell edits within ~50ms.

### 1. Gemfile

```ruby
gem "turbo-rails"
gem "stimulus-rails"
gem "importmap-rails"
gem "stimulus_grid_rails"
```

```bash
bundle install
bin/rails stimulus_grid_rails:install:migrations   # audit table (optional but recommended)
bin/rails db:migrate
```

### 2. Migration for your row model

```ruby
class CreateAthletes < ActiveRecord::Migration[7.2]
  def change
    create_table :athletes do |t|
      t.string  :athlete,      null: false
      t.string  :country
      t.string  :sport
      t.integer :age
      t.integer :gold,         null: false, default: 0
      t.integer :silver,       null: false, default: 0
      t.integer :bronze,       null: false, default: 0
      t.integer :lock_version, null: false, default: 0
      t.timestamps
    end
  end
end
```

```bash
bin/rails db:migrate
```

### 3. Initializer (optional)

```ruby
# config/initializers/stimulus_grid_rails.rb
StimulusGridRails.parent_controller = "ApplicationController"   # default
StimulusGridRails.mount_path        = "/grids"                   # default
```

### 4. Routes

```ruby
# config/routes.rb
Rails.application.routes.draw do
  mount ActionCable.server       => "/cable"
  mount StimulusGridRails::Engine => StimulusGridRails.mount_path

  root "athletes#index"
  resources :athletes, only: %i[index]
end
```

### 5. Grid class

```ruby
# app/grids/athlete_grid.rb
class AthleteGrid < StimulusGridRails::Grid
  resource :athletes
  model    Athlete

  column :athlete, type: :string,  editable: true, width: 200, pinned: :left
  column :country, type: :string,  editable: true, width: 160
  column :sport,   type: :enum,    editable: true, width: 140,
                   enum_values: %w[Swimming Cycling Athletics]
  column :age,     type: :integer, editable: true, width: 80,
                   concurrency: :version_checked,
                   validate: ->(v, _) { "must be 10–80" unless (10..80).cover?(v.to_i) }
  column :gold,    type: :integer, editable: true, width: 70
  column :silver,  type: :integer, editable: true, width: 70
  column :bronze,  type: :integer, editable: true, width: 70
  column :total,   type: :integer, computed: true, depends_on: %i[gold silver bronze]

  def compute_total(row) = row.gold.to_i + row.silver.to_i + row.bronze.to_i

  def new_row_defaults = { athlete: "New", sport: "Swimming", age: 20, gold: 0, silver: 0, bronze: 0 }
end
```

> Eager-load if your grids live outside the default autoload paths:
> `config.autoload_paths += %W[#{Rails.root}/app/grids]`

### 6. Model with Broadcastable

```ruby
# app/models/athlete.rb
class Athlete < ApplicationRecord
  include StimulusGridRails::Broadcastable
  broadcasts_grid AthleteGrid
  self.locking_column = :lock_version
end
```

### 7. View + layout

```erb
<%# app/views/layouts/application.html.erb (head) %>
<%= csrf_meta_tags %>
<%= stylesheet_link_tag "stimulus_grid", "stimulus_grid_rails" %>
<%= javascript_importmap_tags %>
```

```erb
<%# app/views/athletes/index.html.erb %>
<div style="height: 90vh; padding: 1rem;">
  <%= render partial: "stimulus_grid_rails/grids/grid", locals: {
        grid: AthleteGrid.new(user: current_user),
        rows: Athlete.order(:id),
        row_selection: "multiple",
        page_size: 25,
      } %>
</div>
```

### 8. JS bootstrap

```js
// app/javascript/application.js
import "@hotwired/turbo-rails"
import { Application }      from "@hotwired/stimulus"
import StimulusGrid         from "stimulus_grid"
import StimulusGridRails    from "stimulus_grid_rails"

const application = Application.start()
StimulusGrid.start(application)
StimulusGridRails.start(application)
```

### 9. Seed + smoke test

```bash
bin/rails console
> 3.times { |i| Athlete.create!(athlete: "Demo #{i}", sport: "Swimming", age: 25 + i, gold: i, silver: 0, bronze: 0) }
exit
bin/rails server
```

Open `http://localhost:3000` in two browser windows side-by-side:

- Double-click any cell in window 1, type, press Enter. Window 1 shows
  the blue → green confirm flash; window 2 updates within ~50ms.
- Try setting `age = 5` — window 1 should show a red revert with the
  validation message; window 2 stays unchanged.
- Edit `gold` — window 1 confirms the gold cell AND the `total` cell
  in the same response (cascade); window 2 sees both `cell` events.
- Open DevTools → Network in window 1 and watch
  `PATCH /grids/athletes/:id/cells/:col` (request 200 with
  `text/vnd.turbo-stream.html`).

If any of those fails, jump to the next section.

## Common first-time failures

| Symptom | Likely cause | Fix |
|---|---|---|
| Cell stays blue-pulsing then snaps back | 404 or 500 on PATCH | Check `StimulusGridRails.mount_path` matches the route mount; check `current_user` isn't nil if `editable: ->` |
| Window 1 confirms but window 2 doesn't update | Action Cable not mounted, or `turbo-rails` not imported | `mount ActionCable.server => "/cable"`; `import "@hotwired/turbo-rails"` |
| Every PATCH returns 422 with `errors: []` | CSRF check failed (empty token) | Add `<%= csrf_meta_tags %>` to the layout `<head>` |
| Originator's cell visibly re-applies its own edit (flicker) | `X-Optimistic-Id` header missing (custom client) OR mismatch in broadcast | Confirm the JS PATCH sends `X-Optimistic-Id` AND the body includes `optimistic_id`; both flow to `_sgr_optimistic_id` on the model |
| 403 on edit | `column.editable` lambda returned falsy | Open `editable: ->(row, user) { … }` — `user` may be nil if `parent_controller` doesn't authenticate |
| `cell-conflict` on every edit | Stale `lock_version` in DOM | Use the gem's `_grid.html.erb` partial (emits `data-lock-version`); custom partials must emit it on the `<tr>` |
| Editing one cell doesn't update the computed `total` | `depends_on` missing or column not in registry | Check `depends_on: %i[gold silver bronze]` on `:total`; ensure each dep is declared as a `column` |
| Filter / search returns nothing despite matches | Column is `_*` (renderer-only, excluded from search) or `searchable: false` | Rename the column without leading `_`, or set `searchable: true` explicitly |
| Undo/redo silent — no error, no replay | Audit table not installed → controller returns 501 | `bin/rails stimulus_grid_rails:install:migrations && bin/rails db:migrate` |
| `No grid registered for resource :athletes` | Grid class autoloaded too late | Reference `AthleteGrid` from your view (the partial does); or add `Rails.application.config.to_prepare { AthleteGrid }` |
| Multi-tenant: tenant A sees tenant B's broadcast | Background job not wrapped in `ActsAsTenant.with_tenant` | Wrap any non-request writes; the broadcaster reads `ActsAsTenant.current_tenant` at after_commit time |
| Server-side mode pages don't load past page 1 | Passing the full relation instead of one page as `rows:` | In server-side mode pass only the first page; the grid fetches subsequent windows via `GET /rows?page=` |
| `:version_checked` doesn't reject stale writes | `self.locking_column` not set on the model | Add `self.locking_column = :lock_version` |

## Where to look in the gem

| File                                                                                       | What's in it                                          |
|--------------------------------------------------------------------------------------------|-------------------------------------------------------|
| [`gem/stimulus_grid_rails/docs/REFERENCE.md`](../../gem/stimulus_grid_rails/docs/REFERENCE.md) | **Authoritative Ruby API surface** — Grid DSL, column options, types, operators, helpers |
| `lib/stimulus_grid_rails.rb`                                                               | module config, registry, `streamables_for`            |
| `lib/stimulus_grid_rails/grid.rb`                                                          | DSL + `apply_cell!` / `row_to_h` / search/filter/sort  |
| `lib/stimulus_grid_rails/concerns/broadcastable.rb`                                        | after_commit broadcaster + `_sgr_optimistic_id` stamp |
| `lib/stimulus_grid_rails/turbo_streams_helper.rb`                                          | the `<turbo-stream>` action builders                  |
| `app/controllers/stimulus_grid_rails/cells_controller.rb`                                  | `update` / `bulk`                                     |
| `app/controllers/stimulus_grid_rails/rows_controller.rb`                                   | `index` / `create` / `destroy` / `destroy_bulk`       |
| `app/controllers/stimulus_grid_rails/history_controller.rb`                                | `undo` / `redo`                                       |
| `app/controllers/stimulus_grid_rails/attachments_controller.rb`                            | upload / detach for `:attachments` columns            |
| `app/controllers/stimulus_grid_rails/base_controller.rb`                                   | parent controller + `find_row!` + `record_audit`      |
| `app/views/stimulus_grid_rails/grids/_grid.html.erb`                                       | the grid partial                                      |
| `app/assets/javascripts/stimulus_grid_rails.js`                                            | `grid-sync` controller + custom StreamAction handlers |
| `config/routes.rb`                                                                         | engine routes                                         |
| `gem/demo/`                                                                                | a complete working Rails 7.2 host app                 |

Cross-references:

- High-level setup story: [`SKILL.md`](./SKILL.md)
- JS-side `gridApi` + events + renderer library: [`../stimulus-grid-js/SKILL.md`](../stimulus-grid-js/SKILL.md)
- Authoritative Ruby API: [`../../gem/stimulus_grid_rails/docs/REFERENCE.md`](../../gem/stimulus_grid_rails/docs/REFERENCE.md)
- Gem README: [`../../gem/stimulus_grid_rails/README.md`](../../gem/stimulus_grid_rails/README.md)
