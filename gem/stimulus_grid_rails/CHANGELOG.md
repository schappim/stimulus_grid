# Changelog

## 0.1.0 (unreleased)

Initial MVP slice of the Rails + Hotwire bindings for stimulus_grid.

- `StimulusGridRails::Grid` — server-side column definition registry (RAILS.md §7)
  with per-column `type`, `editable` (bool or `(row, user)` lambda), `editor`,
  `editor_config`, `validate`, `concurrency`, and `computed`/`depends_on`.
- `StimulusGridRails::Column` — coercion, validation, editor selection, and the
  data-attributes emitted into headers/cells.
- Custom Turbo Stream actions (RAILS.md §1), server helpers + client handlers:
  `cell`, `cell-attr`, `cell-confirm`, `cell-revert`, `cell-conflict`,
  `row-insert-sorted`, `row-remove`, `aggregate`, `bulk`, `presence`.
- `CellsController#update` — single PATCH cell-mutation endpoint (§8) with
  optimistic-id reconciliation (§4), server-side `editable?` re-check (§17),
  version-checked concurrency (§13), and computed-column cascade replayed as a
  `bulk` stream (§12).
- `StimulusGridRails::Broadcastable` — model concern for cell + row-remove
  broadcasts over Turbo::StreamsChannel.
- Importmap-pinnable JS (`stimulus_grid`, `stimulus_grid_rails`) + shipped CSS;
  no JS build step required in host apps.
- `grid-sync` Stimulus controller — turns base-grid `cellValueChanged` events
  into optimistic PATCHes and reconciles the response; suppresses the
  originating client's own broadcast echo.
- Row create/destroy (RAILS.md §14/§15): `RowsController` with create,
  destroy, and bulk-destroy; `Grid#new_row_defaults`/`build_new_row`/`row_to_json`;
  `Column` `sortable:`/`filterable:` options for action columns; grid-sync
  `addRow`/`removeRow`/`deleteSelected` via `grid-sync:add-row` /
  `grid-sync:delete-selected` events + delegated per-row delete buttons.
- Editor cell navigation: Tab / Shift+Tab move the open editor to the next /
  previous editable cell (wraps within the page), committing as they go.
- Server-side global search + per-column filtering (RAILS.md §21): Column
  searchable:/search_predicate/filter_predicate (Arel), Grid scope/search_and_filter,
  GET /grids/:resource/rows JSON endpoint, grid-sync debounced fetch → setRowData.
- New :bigint column type (alongside :integer).
- Automatic broadcasts (RAILS.md §1/§4): Broadcastable auto-broadcasts
  create/update/destroy (incl. computed cascade) from commit callbacks;
  broadcasts_grid now takes only the grid class.
- Tenant/auth safety (RAILS.md §2/§17): controllers inherit
  StimulusGridRails.parent_controller (Devise + ActsAsTenant before_actions);
  scoped row lookups (grid.scope(user).find); tenant-scoped stream names.
- Undo/redo (RAILS.md §16): StimulusGridRails::Audit + migration; per cell-commit
  recording; POST /undo and /redo replay via apply_cell!; Cmd/Ctrl+Z and
  Cmd/Ctrl+Shift+Z (Ctrl+Y) shortcuts in grid-sync.
