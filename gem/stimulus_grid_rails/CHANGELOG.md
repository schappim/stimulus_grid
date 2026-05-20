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
