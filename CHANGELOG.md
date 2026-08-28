# Changelog

All notable changes to the `@ninjaai/stimulus_grid` JS package. The Rails
engine has its own log at `gem/stimulus_grid_rails/CHANGELOG.md`.

## 0.2.0 (2026-08-28)

The renderer release. 0.1.0 shipped the grid core; this turns it into a
batteries-included grid — 199 built-in cell renderers, most of them editable —
and adds grouping, pivoting, tree data, master/detail and a spreadsheet-faithful
selection model.

### Added

- **Cell renderer library + registry** — 199 built-in renderers, none of which
  existed in 0.1.0, plus a public registry: `registerRenderer`, `getRenderer`,
  `listRenderers` and the `renderers` map are exported from the package root.
  Coverage spans general-purpose formatting (dates, numbers, currency, booleans,
  masks, markdown, JSON, YAML, XML, code, diff, geo, QR), charts (sparkline,
  bullet, donut, histogram, gauge, win-loss, mini bar/line, trend), identifiers
  (UUID, git SHA, MAC, VIN, ISBN, IBAN, SWIFT, SSN, EIN, VAT, NIN, ABN, ACN,
  TFN, Medicare, BSB), and a deep field-service / trade vertical (licences and
  compliance certificates, job status, SWMS/JSA, PPE, hazard ratings, vehicle
  rego, progress claims, variations, defects, retention).
- **Editable renderer cells** — component-style cell editors per column `type`,
  with native pickers auto-opening on double-click. Dedicated popover editors for
  `select`, `multiselect`, `combobox`, `slider`, `date-picker`, `time-picker`,
  `date-range`, `color-picker`, `textarea` and `signature` (which has a built-in
  mouse/touch/stylus pad). Popovers are kept fully on-screen.
- **Row grouping & aggregation** — with an auto "Group" column pinned left and
  grouped columns floated to the front while grouping is active.
- **Pivot mode + drag-driven side panel** — new `side_panel_controller`;
  pivot columns are sortable.
- **Tree data** via a self-referential `parent_id`.
- **Master/detail rows** — expandable nested grids.
- **Spreadsheet selection model** — multi-range cell selection, a row gutter
  (`numbers` or `checkbox` style), full keyboard navigation, `Cmd+A` to select
  all rows, `Cmd+Shift+click` row ranges, and distinct cell vs row highlight
  colours. Native text highlighting is suppressed so drag-select behaves.
- **Clipboard contract** — `copyValue` / `parseValue` on every renderer; copy
  uses the renderer's `copyValue`, and paste routes through `parseValue`.
- **Bulk paste** — tab/newline-separated data pasted from an anchor cell fills
  the range.
- **Drag selected rows to reorder**, with a ghost preview.
- **Column header groups** (multi-row headers) and a **pinned bottom row**.
- **Right-click column menu** and **persisted column state** via `persist_key`.
- **Bottom status bar** — row counts plus aggregates over the selected range.
- **Server-side row model** for 50–100K+ row tables: `serverSide` / `rowCount`
  options and a `setRowCount` API; only the current window is held client-side.
- **Separators and merged cells** for quote / invoice style layouts.
- Pure-JS QR encoder (`lib/qr.js`) backing the `qr` renderer.

### Changed

- Column sizing: double-clicking a resize handle autosizes the column,
  autosize measures rendered DOM rather than text length, declared widths are
  respected instead of stretching to fill, and a synthetic trailing spacer
  column absorbs leftover viewport width.
- Sort and filter glyphs are now SVG (rotated chevrons) rather than text carets.
- `CHANGELOG.md` is included in the published tarball.

### Fixed

- Auto-resize sandbox clones no longer carry `data-controller`, so their
  `disconnect()` can't unregister the real column.
- `setRowData` auto-assigns row ids, keeping selection keys distinct for rows
  with no id field.
- `countdown` self-stops on disconnect; timezone offsets are visible;
  `mini-line-chart` fills the cell width.
- Editors preserve cursor position when clicked into.

### Security

- Dev-dependency advisories cleared: form-data 4.0.5 → 4.0.6
  ([GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx)) and
  nanoid 3.3.16 → 3.3.18
  ([GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8)).
  Both are dev-only transitives and never reached the published bundle; the
  package still declares no runtime dependencies.

## 0.1.0 (2026-05-22)

Initial release — grid core.

- Stimulus controllers for grid, header cell, cell, row, filter and pagination.
- Sorting, per-column filtering, global quick filter, selection, pagination,
  inline editing, custom cell renderers/editors and row virtualization.
- Public grid API (`gridApi`) over the display-list pipeline.
- IIFE + ESM bundles for CDN and importmap use.
