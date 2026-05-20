# Hotwire-Native Grid: Build Checklist

A scoping checklist for building a spreadsheet-grade editable data grid on top of Rails, Stimulus, Turbo Streams, and Action Cable. Designed for dense tabular data with frequent partial updates, multi-user live edits, and server-driven schema.

---

## 1. Custom Turbo Stream Actions

Built-in actions are row-oriented; grids need cell- and structure-oriented actions.

- [ ] `cell` — update a single cell by `row-id` + `column` (avoids shipping a full `<tr>`)
- [ ] `cell-attr` — set an attribute on a cell (e.g. `data-dirty="false"`)
- [ ] `cell-confirm` — clear pending/optimistic state after server reconcile
- [ ] `cell-revert` — restore prior value + render inline validation error
- [ ] `cell-conflict` — render conflict UI with `server-value` vs `client-value`
- [ ] `row-insert-sorted` — insert respecting client's current sort order
- [ ] `row-remove` — delete a row by id (soft- or hard-delete aware)
- [ ] `row-confirm` / `row-revert` — atomic row-edit-mode outcomes
- [ ] `aggregate` — update footer totals (`sum`, `avg`, `count`, etc.) independently of rows
- [ ] `bulk` — atomic batched stream of inner actions (single DOM reflow for N updates)
- [ ] `presence` — render per-user editing indicators on a cell
- [ ] `column-show` / `column-hide` — toggle column visibility server-side

---

## 2. Broadcast Scoping

Naive `broadcasts_to :grid` firehoses every row to every subscriber. Fix the predicate layer.

- [ ] **Signed view streams** — server mints stream name encoding the view's filter/sort/columns
- [ ] **Server-side predicate evaluation** — only broadcast rows matching a subscriber's view
- [ ] **`broadcasts_grid_to` DSL** with `scope:` lambda and declared `view_predicates`
- [ ] **Viewport awareness** — Stimulus reports visible row range over cable (throttled)
- [ ] **Out-of-viewport suppression** — bump a stale version stamp instead of broadcasting
- [ ] **Lazy hydration on scroll** — rows scrolling into view request fresh HTML via turbo-frame
- [ ] **Per-cell channels for hot cells** — narrow channels for high-frequency fields (status, ETA, counters)

---

## 3. Morphing as the Default

Turbo 8 morph makes inline editing tolerable — make it the default merge strategy for row replacements.

- [ ] Currently-focused cell keeps focus through a row update
- [ ] Open dropdowns/date pickers survive the morph
- [ ] Multi-select state survives a server update
- [ ] Scroll position untouched
- [ ] CSS transitions fire on changed cells (DOM nodes persist)
- [ ] Cheap `cell` action available for the single-field hot path (no morph cost)

---

## 4. Optimistic Updates with Server Reconciliation

- [ ] Stimulus marks cell `data-pending` and applies new value immediately
- [ ] PATCH includes an `X-Optimistic-Id` header
- [ ] Server responds with `cell-confirm` or `cell-revert` (+ validation errors)
- [ ] Originating client suppresses its own echo by matching the optimistic id
- [ ] Other clients receive normal `cell` broadcasts

---

## 5. Subscription Lifecycle

- [ ] **Reconnect replay** — client sends last-seen version stamp; server replays missed deltas as `bulk`
- [ ] **Filter-change handoff** — subscribe new view, wait for initial render, then tear down old (no empty flash)
- [ ] **Backpressure / coalescing** — collapse multiple pending updates for the same `(row, column)` to the latest only

---

## 6. Stimulus Surface

- [ ] Primary `grid` controller with outlets to satellite controllers (toolbar, filter bar, column chooser, export)
- [ ] View state as Stimulus values (sort, filters, columns, viewport, row-id-attribute)
- [ ] View state serializable into the signed stream name
- [ ] Resource name as a Stimulus value (drives endpoint paths)

---

## 7. Server-Side Column Definition Registry

One source of truth per resource — auth, coercion, validation, cascade, broadcast, editor selection all flow from here.

- [ ] `ApplicationGrid` base class
- [ ] Per-column `type:` (string, text, integer, decimal, money, boolean, enum, date, datetime, reference)
- [ ] Per-column `editable:` — boolean or lambda `(row, user) -> bool`
- [ ] Per-column `editor:` — references a registered Stimulus editor controller
- [ ] Per-column `editor_config:` — serialized into cell `data-*` attributes
- [ ] Per-column `validate` block — server-side validators
- [ ] Per-column `concurrency:` — `:last_write_wins`, `:version_checked`, `:field_locked`
- [ ] Per-column `computed:` flag + `depends_on:` array for cascade invalidation
- [ ] Server re-checks `editable:` on every PATCH (never trust the client)
- [ ] Row template emits editor data attributes only for columns the user can edit

---

## 8. Cell Mutation Endpoint

- [ ] `PATCH /grids/:resource/:row_id/cells/:column` — single endpoint, not per-column controllers
- [ ] Request body: `{ value, optimistic_id, version }`
- [ ] Response: always a turbo stream (`cell-confirm`, `cell-revert`, or `bulk` with cascades)
- [ ] Controller stays thin (~10 lines); grid class does the work

---

## 9. Edit Modes

### Single-cell commit (default, 90% path)
- [ ] Click → edit → Tab/Enter commits, Esc reverts
- [ ] PATCH on commit with optimistic update
- [ ] Tab moves to next editable cell, Shift+Tab previous, Enter moves down
- [ ] Arrow keys at field boundaries delegate to grid navigation

### Row edit mode
- [ ] "Edit row" button toggles all editable cells in the row into editors
- [ ] Save/Cancel commits as one transaction (one PATCH to `/grids/:resource/:row_id`)
- [ ] Server returns `row-confirm` or `row-revert` with per-field error annotations
- [ ] Supports cross-field validation (e.g. `start_date < end_date`)

### Fill-down / bulk paste
- [ ] Range selection + type-and-Enter applies to all selected cells
- [ ] Excel paste detection (multi-cell, multi-row)
- [ ] PATCH to `/grids/:resource/bulk` with `{ mutations: [...] }`
- [ ] Server processes in a transaction
- [ ] Response is a `bulk` stream with per-mutation confirm/revert
- [ ] Partial-success UI: "47 updated, 3 failed" toast with scroll-to-failed affordance

---

## 10. Cell Editor Components

- [ ] Editor registry keyed by column type — `GridEditors.register("sku", SkuAutocompleteController)`
- [ ] Default editors: `string`, `text`, `integer`, `decimal`, `money`, `boolean`, `enum`, `date`, `datetime`, `reference`
- [ ] Each editor controller:
  - [ ] Mounts in place of cell display content
  - [ ] Captures focus and selects existing value on mount
  - [ ] Handles Tab / Shift+Tab / Enter / Esc / arrow keys
  - [ ] Emits `cell:commit` or `cell:revert` events for the grid to consume
- [ ] `editor_config` flows from server column definition into editor's data attributes

---

## 11. Validation

### Client-side (ergonomics)
- [ ] Runs in the editor controller before commit
- [ ] No PATCH sent if it fails — cell stays in edit mode with error visible
- [ ] Covers: format, range, required, enum membership

### Server-side (correctness)
- [ ] Runs in column definition / model
- [ ] On failure: `cell-revert` carries an `errors` payload
- [ ] Reverted value = current server value (not client's pre-edit value — may have drifted)
- [ ] Single `errors` payload shape consumed by cell-level, row-level, and bulk error UIs

---

## 12. Computed Columns & Cascades

- [ ] Server determines the cascade — client does not recompute
- [ ] PATCH response is a `bulk` stream containing the original confirm + all dependent cell updates + any affected aggregates
- [ ] `depends_on: [:quantity, :unit_price]` declared on the computed column
- [ ] Cascade computed once on the server, applied atomically on the client

---

## 13. Concurrency Strategies (per-column)

- [ ] **Last-write-wins** (default) — simplest, fine for status/notes/etc.
- [ ] **Version-checked** — PATCH carries `lock_version`; stale request returns `cell-conflict` with "Keep mine / Use theirs" UI
- [ ] **Field-locked** — presence broadcast on edit-mode entry; other clients blocked from editor; released on commit/blur/30s heartbeat timeout
- [ ] Strategy is declared per-column, used sparingly for field-lock

---

## 14. Create

### Inline new row
- [ ] Sentinel row pinned top or bottom, all editable cells in edit mode
- [ ] Temporary client-side id
- [ ] First commit triggers `POST /grids/:resource` with the partial record
- [ ] Server returns a stream replacing the sentinel with the persisted row (real id, computed columns filled)
- [ ] Subsequent edits PATCH as normal

### Modal/drawer fallback
- [ ] For resources with many required fields, fall back to a regular Turbo Frame form

---

## 15. Delete

- [ ] Per-row delete (toolbar button or context menu) with confirm
- [ ] Single broadcast: `row-remove`
- [ ] Multi-select + Delete key: `DELETE /grids/:resource/bulk` with ids array
- [ ] Bulk response is a single `bulk` stream of `row-remove` actions
- [ ] Soft-delete vs hard-delete configurable at grid-class level
- [ ] Soft-deleted rows: `row-remove` to user views, `cell` updates to admin views that show them

---

## 16. Undo / Redo

- [ ] Server-side audit row per mutation with `prior_value`, `new_value`, `row_id`, `column`, `user_id`, `created_at`
- [ ] `Cmd+Z` sends `POST /grids/:resource/undo` with last un-undone mutation id
- [ ] Server applies the inverse as a normal mutation (broadcasts fire, validations re-run, cascades cascade)
- [ ] Redo is symmetric
- [ ] Scope: per-user, per-grid, last N mutations within last M minutes (not global)

---

## 17. Permissions

- [ ] `editable:` accepts a lambda `(row, user) -> bool`, evaluated server-side
- [ ] Non-editable cells render without `data-editable="true"` (Stimulus won't enter edit mode)
- [ ] Server re-checks on every PATCH
- [ ] Partial permissions per row supported (e.g. user can edit `notes` but not `status`)

---

## 18. Error UI

- [ ] **Cell-level** — red border + hover tooltip with message; cleared on next successful commit
- [ ] **Row-level** — banner above row with field highlighting (row edit mode cross-field errors)
- [ ] **Bulk operation summary** — toast with "view errors" affordance scrolling to highlighted failed cells
- [ ] All three driven by the same `errors` payload shape — one error handler in the grid controller

---

## 19. What NOT to Build (Out of Scope)

- [ ] ~~Pivot tables~~
- [ ] ~~Full 100% enterprise data-grid feature parity~~

Resist generality. A generic client-side grid is general because it doesn't know your schema. A Rails-native grid *does* know the schema, so the column definition does 80% of what a generic grid pushes onto the client.

---

## 20. MVP Build Order

For shipping into a real product (e.g. Struth), build in this order:

1. [ ] Single-cell commit with optimistic update + server reconcile
2. [ ] Column definition registry
3. [ ] Standard editors: `string`, `integer`, `money`, `enum`, `date`
4. [ ] Computed columns + cascade
5. [ ] Bulk paste
6. [ ] Version-checked concurrency
7. [ ] Row edit mode
8. [ ] Undo / redo
9. [ ] Field-locking (last — high effort, narrow benefit)
10. [ ] Presence indicators (last — high effort, narrow benefit)

---

## 21. The 80% Feature Set

What every editable grid actually needs:

- [ ] Virtualized scroll
- [ ] Inline edit
- [ ] Multi-user live updates
- [ ] Server-side filtering / sorting
- [ ] Grouping
- [ ] Good keyboard navigation
