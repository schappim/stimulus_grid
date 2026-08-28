# Changelog

## 0.2.0 (2026-08-28)

Ships the full cell-renderer library to Rails, adds Active Storage attachments,
and refreshes the vendored grid assets — they had drifted well behind `dist/`.

### Added

- `:attachments` column type backed by Active Storage `has_many_attached`.
  `Grid#format_cell` / `serialize_value` emit the file list as JSON (id, filename,
  url, content_type, byte_size, thumb_url, signed_id) the JS `attachments`
  renderer consumes directly. New `AttachmentsController` adds
  `POST /grids/:resource/:row_id/attachments/:column` (multipart upload OR
  signed_ids) and `DELETE /grids/:resource/:row_id/attachments/:column/:attachment_id`;
  each mutation broadcasts the new attachment payload as a `cell` Turbo Stream
  so every connected tab reconciles automatically. New `apply_attachments!`
  helper on Grid handles the attach/detach round-trip; override
  `attachment_url_for` for signed/expiring URLs or CDN hosts. The row partial
  now emits structured cell values in `data-cell-value=` (avoids the JSON
  briefly flashing as the cell's textContent on first paint). The demo app
  ships a `file_records` page wired to `FileRecord` + `FileRecordGrid`.

### Changed

- Vendored grid assets (`app/assets/javascripts/stimulus_grid.js`,
  `app/assets/stylesheets/stimulus_grid.css`) re-synced from `dist/`. They were
  last refreshed before the renderer library landed, so the engine had been
  shipping roughly half the grid: 204 KB of JS against the current 432 KB, with
  ~130 renderers missing entirely. Rails apps now get all 199 built-in
  renderers, the side panel, pivot mode, row grouping, tree data, master/detail,
  the spreadsheet selection model and the column menu — see the root
  CHANGELOG.md for the JS-side detail.

## 0.1.0 (2026-05-20)

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
- Editable custom cells: a column can declare cell_editor: (a <template>) so a
  custom-rendered cell is fully editable.
- Configurable mount path: StimulusGridRails.mount_path (default "/grids"). The
  grid builds its client endpoints from it, so the engine can be namespaced
  (e.g. "/admin/grids") without depending on the engine's route-helper name.
- Removed the unused stream_name/stream_name_for Grid API (streams are derived
  from streamables_for + tenant token since the automatic-broadcast refactor).
- Added docs/REFERENCE.md — complete API reference (Ruby API, endpoints, Turbo
  Stream protocol, client contract, config, tenancy).
- Server-side row model (RAILS.md §21) for large tables (50-100K+ rows): only
  one page is loaded client-side; rows#index returns a window (page/page_size)
  + the full total; Grid#apply_sort sorts server-side; grid-sync fetches windows
  on page/sort/filter/search; base grid gains serverSide/rowCount + setRowCount.
  Render with `server_side: true, total:` partial locals.
- Bulk paste (RAILS.md §9): paste tab/newline-separated data from an anchor cell;
  grid-sync fills the range and POSTs to /bulk.
- Full Minitest suite for the Rails side (62 examples) under demo/test.
