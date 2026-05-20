/*  stimulus_grid_rails — Rails + Hotwire bindings for stimulus_grid.
 *
 *  Loaded via importmap. Exports `start()` which:
 *    - registers Stimulus controllers: `grid-sync`, `cell-editor`
 *    - registers Turbo Stream actions: cell, cell-attr, cell-confirm,
 *      cell-revert, cell-conflict, row-insert-sorted, row-remove, bulk,
 *      aggregate, presence
 *
 *  Usage in app/javascript/application.js:
 *
 *      import "@hotwired/turbo-rails"
 *      import { Application } from "@hotwired/stimulus"
 *      import StimulusGrid from "stimulus_grid"
 *      import StimulusGridRails from "stimulus_grid_rails"
 *
 *      const app = Application.start()
 *      StimulusGrid.start(app)
 *      StimulusGridRails.start(app)
 */

import { Controller } from "@hotwired/stimulus"

// ---------- helpers ----------

function gridById(name) {
  const el = document.querySelector(`[data-grid-name="${name}"]`)
  if (!el) console.warn(`[stimulus_grid_rails] no grid element found for grid="${name}"`)
  return el
}

function findCell(gridEl, rowId, column) {
  return gridEl?.querySelector(
    `tr[data-row-id="${CSS.escape(String(rowId))}"] td[data-col-id="${CSS.escape(String(column))}"]`
  )
}

function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content || ""
}

function debounce(fn, ms) {
  let t = null
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
}

// ---------- Stimulus: GridSyncController ----------
// Mount on the same element as data-controller="grid". Listens for
// `grid:cellValueChanged` from the base grid controller and converts edits
// into a PATCH /grids/:resource/:row_id/cells/:column with an optimistic id.
// Marks the cell `data-pending` until the server confirms.

class GridSyncController extends Controller {
  static values = {
    resource:        String,
    cellsPathTemplate: String,   // "/grids/:resource/:row_id/cells/:column"
    rowsPath:          String,   // "/grids/:resource/rows"
    rowPathTemplate:   String,   // "/grids/:resource/rows/:row_id"
    bulkRowsPath:      String,   // "/grids/:resource/rows/bulk"
    cellsBulkPath:     String,   // "/grids/:resource/bulk"
    undoPath:          String,   // "/grids/:resource/undo"
    redoPath:          String,   // "/grids/:resource/redo"
    serverSide:        Boolean,  // server-side row model (windowed fetch)
    optimisticIdPrefix: { type: String, default: "" },
  }

  connect() {
    this._gridEl = this.element
    this._gridEl.dataset.gridName = this.resourceValue
    this._onCellChange = this._onCellChange.bind(this)
    this._gridEl.addEventListener("grid:cellValueChanged", this._onCellChange)

    // Row add/delete are driven by events dispatched on the grid element, so a
    // toolbar living anywhere in the page can trigger them without being inside
    // this controller's Stimulus scope:
    //   gridEl.dispatchEvent(new CustomEvent("grid-sync:add-row", { detail: { attributes } }))
    //   gridEl.dispatchEvent(new CustomEvent("grid-sync:delete-selected"))
    this._onAddRow = (e) => this.addRow(e?.detail?.attributes || {})
    this._onDeleteSelected = () => this.deleteSelected()
    this._gridEl.addEventListener("grid-sync:add-row", this._onAddRow)
    this._gridEl.addEventListener("grid-sync:delete-selected", this._onDeleteSelected)

    // Per-row delete buttons rendered by a cell renderer live inside the grid,
    // so a single delegated listener handles them.
    this._onDelegatedClick = (e) => {
      const btn = e.target.closest('[data-sgr-action="delete-row"]')
      if (!btn) return
      e.preventDefault()
      const tr = btn.closest("tr[data-row-id]")
      if (tr) this.removeRow(tr.dataset.rowId)
    }
    this._gridEl.addEventListener("click", this._onDelegatedClick)

    // Bulk paste (RAILS.md §9). Track the last-clicked cell as the paste anchor;
    // a multi-cell clipboard paste fills from there and POSTs to /bulk.
    this._onCellClicked = (e) => { this._anchor = { rowId: e.detail.rowId, colId: e.detail.colId } }
    this._gridEl.addEventListener("grid:cellClicked", this._onCellClicked)
    this._onPaste = (e) => this._handlePaste(e)
    document.addEventListener("paste", this._onPaste)

    // Server-side search / filtering. The grid fetches matching rows from the
    // index endpoint and swaps the dataset via setRowData. Driven by events:
    //   gridEl.dispatchEvent(new CustomEvent("grid-sync:search", { detail: { q } }))
    //   gridEl.dispatchEvent(new CustomEvent("grid-sync:filter", { detail: { column, criteria } }))  // criteria=null clears
    //   gridEl.dispatchEvent(new CustomEvent("grid-sync:clear-filters"))
    this._query = { q: "", filters: {}, sort: [] }
    // In server-side mode, a query change resets to page 0 (debounced); the
    // resulting paginationChanged is the single trigger that fetches a window.
    // In client mode, a query change refetches the (capped) full set directly.
    this._afterQueryChange = this.serverSideValue
      ? debounce(() => this._gridEl.gridApi?.paginationGoToFirstPage(), 200)
      : debounce(() => this._fetchRows(), 200)
    this._onSearch = (e) => { this._query.q = e?.detail?.q ?? ""; this._afterQueryChange() }
    this._onFilter = (e) => {
      const { column, criteria } = e?.detail || {}
      if (!column) return
      if (criteria == null || criteria === "") delete this._query.filters[column]
      else this._query.filters[column] = criteria
      this._afterQueryChange()
    }
    this._onClearFilters = () => {
      this._query = { q: "", filters: {}, sort: this._query.sort }
      this.serverSideValue ? this._gridEl.gridApi?.paginationGoToFirstPage() : this._fetchRows()
    }
    this._gridEl.addEventListener("grid-sync:search", this._onSearch)
    this._gridEl.addEventListener("grid-sync:filter", this._onFilter)
    this._gridEl.addEventListener("grid-sync:clear-filters", this._onClearFilters)

    // Server-side row model: paginationChanged (page click / size change / a
    // reset from above) fetches that window; sortChanged sorts on the server.
    if (this.serverSideValue) {
      this._onSrvPage = () => this._fetchRows()
      this._onSrvSort = (e) => {
        this._query.sort = e?.detail?.sortModel || []
        this._gridEl.gridApi?.paginationGoToFirstPage()   // → paginationChanged → fetch
      }
      this._gridEl.addEventListener("grid:paginationChanged", this._onSrvPage)
      this._gridEl.addEventListener("grid:sortChanged", this._onSrvSort)
    }

    // Undo / redo keyboard shortcuts (RAILS.md §16). Cmd/Ctrl+Z undoes,
    // Cmd/Ctrl+Shift+Z (or Cmd/Ctrl+Y) redoes. Skipped while a cell editor or
    // any text field is focused, so native text undo still works there.
    this._onKeydown = (e) => {
      const mod = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()
      if (!mod || (key !== "z" && key !== "y")) return
      const ae = document.activeElement
      if (ae && /^(input|textarea|select)$/i.test(ae.tagName)) return
      if (this._gridEl.querySelector('td[data-editing="true"]')) return
      const isRedo = key === "y" || (key === "z" && e.shiftKey)
      e.preventDefault()
      isRedo ? this.redo() : this.undo()
    }
    document.addEventListener("keydown", this._onKeydown)

    this._opCounter = 0
  }

  disconnect() {
    this._gridEl.removeEventListener("grid:cellValueChanged", this._onCellChange)
    this._gridEl.removeEventListener("grid-sync:add-row", this._onAddRow)
    this._gridEl.removeEventListener("grid-sync:delete-selected", this._onDeleteSelected)
    this._gridEl.removeEventListener("click", this._onDelegatedClick)
    this._gridEl.removeEventListener("grid-sync:search", this._onSearch)
    this._gridEl.removeEventListener("grid-sync:filter", this._onFilter)
    this._gridEl.removeEventListener("grid-sync:clear-filters", this._onClearFilters)
    if (this._onSrvPage) this._gridEl.removeEventListener("grid:paginationChanged", this._onSrvPage)
    if (this._onSrvSort) this._gridEl.removeEventListener("grid:sortChanged", this._onSrvSort)
    this._gridEl.removeEventListener("grid:cellClicked", this._onCellClicked)
    document.removeEventListener("keydown", this._onKeydown)
    document.removeEventListener("paste", this._onPaste)
  }

  // Bulk paste: parse TSV from the clipboard and fill cells from the anchor
  // (last-clicked cell) rightward + downward across editable columns and the
  // loaded rows, then POST one /bulk request. The server validates + coerces +
  // saves each mutation and returns cell-confirms (which fill the cells).
  _handlePaste(e) {
    if (!this._anchor || !this.hasCellsBulkPathValue) return
    if (this._gridEl.querySelector('td[data-editing="true"]')) return   // editing → native paste
    const ae = document.activeElement
    if (ae && /^(input|textarea|select)$/i.test(ae.tagName) && !this._gridEl.contains(ae)) return

    const text = e.clipboardData?.getData("text/plain")
    if (!text) return
    const grid = text.replace(/\r\n?/g, "\n").replace(/\n$/, "")
      .split("\n").map((line) => line.split("\t"))
    if (!grid.length) return

    const api = this._gridEl.gridApi
    const cols = api.getColumnDefs().filter((c) =>
      c.editable && !c.hidden && !c._isCheckbox && !String(c.field).startsWith("_"))
    const rows = api.getRowData()
    const colStart = cols.findIndex((c) => c.field === this._anchor.colId)
    const rowStart = rows.findIndex((r) => String(r.id) === String(this._anchor.rowId))
    if (colStart < 0 || rowStart < 0) return   // anchor must be an editable cell

    e.preventDefault()
    const mutations = []
    grid.forEach((line, r) => {
      const row = rows[rowStart + r]
      if (!row) return
      line.forEach((value, c) => {
        const col = cols[colStart + c]
        if (col) mutations.push({ row_id: row.id, column: col.field, value })
      })
    })
    if (!mutations.length) return

    const optimisticId = this._nextOptimisticId()
    ;(this._gridEl.__sgrOwnOps ||= new Set()).add(optimisticId)   // suppress broadcast echo
    fetch(this.cellsBulkPathValue, {
      method: "POST", credentials: "same-origin", headers: this._headers(),
      body: JSON.stringify({ mutations, optimistic_id: optimisticId }),
    })
      .then((res) => res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`)))
      .then((html) => { if (html.trim()) window.Turbo?.renderStreamMessage(html) })
      .catch((err) => console.error("[stimulus_grid_rails] bulk paste failed:", err))
  }

  // POST /grids/:resource/undo (or /redo). The server replays the inverse /
  // forward value as a normal mutation, which auto-broadcasts back to this tab.
  async undo() { return this._history(this.hasUndoPathValue && this.undoPathValue) }
  async redo() { return this._history(this.hasRedoPathValue && this.redoPathValue) }

  async _history(path) {
    if (!path) return
    try {
      const res = await fetch(path, {
        method: "POST", credentials: "same-origin", headers: this._headers(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const html = await res.text()
      if (html.trim()) window.Turbo?.renderStreamMessage(html)
    } catch (err) {
      console.error("[stimulus_grid_rails] history failed:", err)
    }
  }

  // GET /grids/:resource/rows?q=&filters= — server applies the global search +
  // per-column filters via the column registry, returns matching rows, and we
  // swap the grid's dataset. This is the scalable path for large tables.
  async fetchRows() { return this._fetchRows() }

  async _fetchRows() {
    if (!this.hasRowsPathValue) return
    const api = this._gridEl.gridApi
    if (!api) return
    const url = new URL(this.rowsPathValue, window.location.origin)
    if (this._query.q) url.searchParams.set("q", this._query.q)
    if (Object.keys(this._query.filters).length) {
      url.searchParams.set("filters", JSON.stringify(this._query.filters))
    }
    if (this.serverSideValue) {
      url.searchParams.set("page", api.paginationGetCurrentPage())
      url.searchParams.set("page_size", api.paginationGetPageSize())
      if (this._query.sort.length) url.searchParams.set("sort", JSON.stringify(this._query.sort))
    }
    try {
      const res = await fetch(url, {
        method: "GET", credentials: "same-origin",
        headers: { "Accept": "application/json", "X-CSRF-Token": csrfToken() },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      // setRowCount first so the pagination refresh (fired by setRowData's
      // rowDataChanged) reads the new total.
      if (this.serverSideValue) api.setRowCount(data.total)
      api.setRowData(data.rows)
      this._gridEl.dispatchEvent(new CustomEvent("grid-sync:rows-fetched", {
        detail: { total: data.total, shown: data.rows.length, limited: data.limited },
        bubbles: true,
      }))
    } catch (err) {
      console.error("[stimulus_grid_rails] fetchRows failed:", err)
    }
  }

  _headers(extra = {}) {
    return {
      "Content-Type":  "application/json",
      "Accept":        "text/vnd.turbo-stream.html",
      "X-CSRF-Token":  csrfToken(),
      ...extra,
    }
  }

  // POST /grids/:resource/rows — create a row with the grid's server defaults
  // (optionally merged with `attributes`). Server returns + broadcasts a
  // row-insert-sorted, which adds the persisted row (real id) to the grid.
  async addRow(attributes = {}) {
    if (!this.hasRowsPathValue) return
    try {
      const res = await fetch(this.rowsPathValue, {
        method: "POST", credentials: "same-origin",
        headers: this._headers(),
        body: JSON.stringify({ attributes }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const html = await res.text()
      window.Turbo?.renderStreamMessage(html)
    } catch (err) {
      console.error("[stimulus_grid_rails] addRow failed:", err)
    }
  }

  // DELETE a single row by id.
  async removeRow(rowId) {
    if (!this.hasRowPathTemplateValue) return
    const path = this.rowPathTemplateValue.replace(":row_id", encodeURIComponent(String(rowId)))
    try {
      const res = await fetch(path, {
        method: "DELETE", credentials: "same-origin", headers: this._headers(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const html = await res.text()
      if (html.trim()) window.Turbo?.renderStreamMessage(html)
    } catch (err) {
      console.error("[stimulus_grid_rails] removeRow failed:", err)
    }
  }

  // DELETE every selected row in one bulk request.
  async deleteSelected() {
    const api = this._gridEl.gridApi
    if (!api) return
    const ids = api.getSelectedRowIds ? api.getSelectedRowIds() : []
    if (!ids.length) return
    if (this.hasBulkRowsPathValue) {
      try {
        const res = await fetch(this.bulkRowsPathValue, {
          method: "DELETE", credentials: "same-origin",
          headers: this._headers(),
          body: JSON.stringify({ ids }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const html = await res.text()
        if (html.trim()) window.Turbo?.renderStreamMessage(html)
      } catch (err) {
        console.error("[stimulus_grid_rails] deleteSelected failed:", err)
      }
    } else {
      for (const id of ids) await this.removeRow(id)
    }
  }

  _nextOptimisticId() {
    this._opCounter += 1
    return `${this.optimisticIdPrefixValue || "op"}-${Date.now()}-${this._opCounter}`
  }

  async _onCellChange(e) {
    const { rowId, colId, newValue, oldValue } = e.detail
    const td = findCell(this._gridEl, rowId, colId)
    if (!td) return
    const optimisticId = this._nextOptimisticId()
    // Remember our own optimistic ids so the broadcast echo of this very edit
    // can be suppressed on this client (RAILS.md §4). Other clients don't have
    // the id in their set, so they apply the broadcast normally.
    ;(this._gridEl.__sgrOwnOps ||= new Set()).add(optimisticId)
    td.dataset.pending = optimisticId
    td.dataset.priorValue = String(oldValue ?? "")
    td.classList.add("sgr-cell-pending")

    const path = this.cellsPathTemplateValue
      .replace(":resource", encodeURIComponent(this.resourceValue))
      .replace(":row_id",   encodeURIComponent(String(rowId)))
      .replace(":column",   encodeURIComponent(String(colId)))

    try {
      const res = await fetch(path, {
        method:  "PATCH",
        credentials: "same-origin",
        headers: {
          "Content-Type":      "application/json",
          "Accept":            "text/vnd.turbo-stream.html",
          "X-CSRF-Token":      csrfToken(),
          "X-Optimistic-Id":   optimisticId,
        },
        body: JSON.stringify({
          value: newValue,
          optimistic_id: optimisticId,
          lock_version: td.dataset.lockVersion ? Number(td.dataset.lockVersion) : null,
        }),
      })
      if (!res.ok && res.status !== 422) {
        throw new Error(`HTTP ${res.status}`)
      }
      const html = await res.text()
      // Hand the response off to Turbo so any <turbo-stream> tags in the
      // body run through the registered StreamActions below.
      if (window.Turbo?.renderStreamMessage) {
        window.Turbo.renderStreamMessage(html)
      }
    } catch (err) {
      console.error("[stimulus_grid_rails] PATCH failed:", err)
      // Network failure → roll back locally to prior value.
      this._gridEl.gridApi?.applyTransaction({
        update: [{ id: rowId, [colId]: oldValue }],
      })
      td.classList.remove("sgr-cell-pending")
      td.removeAttribute("data-pending")
    }
  }
}

// ---------- Stimulus: CellEditorController ----------
// Currently a placeholder — the base grid uses its own editor. This controller
// is reserved for custom column editors (autocomplete, picker, etc.) that
// hosts can register via column(editor: "sku-autocomplete").

class CellEditorController extends Controller {
  static values = {
    column: String,
    editor: String,
  }
}

// ---------- Turbo StreamActions ----------

function registerStreamActions() {
  const Turbo = window.Turbo
  if (!Turbo?.StreamActions) {
    console.warn("[stimulus_grid_rails] Turbo not loaded — Stream actions skipped")
    return
  }

  // cell: replace cell content + update underlying gridApi row.
  Turbo.StreamActions.cell = function () {
    const gridEl = gridById(this.getAttribute("grid"))
    const rowId  = this.getAttribute("row-id")
    const column = this.getAttribute("column")
    const value  = this.templateContent.textContent
    const opId   = this.getAttribute("optimistic-id")
    // Suppress the originating client's own echo — it already applied this
    // edit optimistically and gets a cell-confirm via the PATCH response.
    if (opId && gridEl?.__sgrOwnOps?.has(opId)) return
    applyCellUpdate(gridEl, rowId, column, value, { confirm: false })
  }

  // cell-attr: set a single attribute on the cell.
  Turbo.StreamActions["cell-attr"] = function () {
    const gridEl = gridById(this.getAttribute("grid"))
    const td = findCell(gridEl, this.getAttribute("row-id"), this.getAttribute("column"))
    if (!td) return
    td.setAttribute(this.getAttribute("attr"), this.getAttribute("value"))
  }

  // cell-confirm: own-echo of an optimistic update — clear pending state.
  Turbo.StreamActions["cell-confirm"] = function () {
    const gridEl = gridById(this.getAttribute("grid"))
    const rowId  = this.getAttribute("row-id")
    const column = this.getAttribute("column")
    const value  = this.templateContent.textContent
    const opId   = this.getAttribute("optimistic-id")
    const td = findCell(gridEl, rowId, column)
    if (!td) return
    if (opId && td.dataset.pending && td.dataset.pending !== opId) {
      // A newer optimistic edit superseded this one — leave the cell alone.
      return
    }
    if (opId) gridEl?.__sgrOwnOps?.delete(opId)
    applyCellUpdate(gridEl, rowId, column, value, { confirm: true })
  }

  // cell-revert: restore prior value + show error.
  Turbo.StreamActions["cell-revert"] = function () {
    const gridEl = gridById(this.getAttribute("grid"))
    const rowId  = this.getAttribute("row-id")
    const column = this.getAttribute("column")
    const serverValue = this.templateContent.textContent
    const errors = JSON.parse(this.getAttribute("errors") || "[]")
    applyCellUpdate(gridEl, rowId, column, serverValue, { confirm: true })
    // applyCellUpdate schedules an async re-render that rebuilds the <td>, so
    // style the cell after the render settles — otherwise the class lands on
    // the node about to be replaced and is lost.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const td = findCell(gridEl, rowId, column)
      if (!td) return
      td.classList.add("sgr-cell-error")
      td.title = errors.join("\n")
      setTimeout(() => {
        td.classList.remove("sgr-cell-error")
        td.removeAttribute("title")
      }, 4000)
    }))
    // Toast-style event for the host app to handle however it likes.
    gridEl?.dispatchEvent(new CustomEvent("grid:cellError", {
      detail: { rowId, column, errors }, bubbles: true,
    }))
  }

  // cell-conflict: server-vs-client value mismatch.
  Turbo.StreamActions["cell-conflict"] = function () {
    const gridEl = gridById(this.getAttribute("grid"))
    const detail = {
      rowId:        this.getAttribute("row-id"),
      column:       this.getAttribute("column"),
      serverValue:  this.getAttribute("server-value"),
      clientValue:  this.getAttribute("client-value"),
      optimisticId: this.getAttribute("optimistic-id"),
    }
    const td = findCell(gridEl, detail.rowId, detail.column)
    td?.classList.add("sgr-cell-conflict")
    gridEl?.dispatchEvent(new CustomEvent("grid:cellConflict", {
      detail, bubbles: true,
    }))
  }

  // row-insert-sorted: insert respecting client's current sort.
  Turbo.StreamActions["row-insert-sorted"] = function () {
    const gridEl = gridById(this.getAttribute("grid"))
    if (!gridEl?.gridApi) return
    // The <template> payload may be either rendered <tr>...</tr> HTML or a
    // JSON-encoded row object. We support both — JSON is preferred.
    const raw = this.templateContent.textContent.trim()
    let rowObj = null
    try { rowObj = JSON.parse(raw) } catch { /* not JSON */ }
    if (rowObj) {
      gridEl.gridApi.applyTransaction({ add: [rowObj] })
    } else {
      console.warn("[stimulus_grid_rails] row-insert-sorted: HTML payload not yet supported")
    }
  }

  // row-remove: drop a row by id.
  Turbo.StreamActions["row-remove"] = function () {
    const gridEl = gridById(this.getAttribute("grid"))
    const rowId  = this.getAttribute("row-id")
    if (!gridEl?.gridApi) return
    const rows = gridEl.gridApi.getRowData()
    const victim = rows.find(r => String(r.id) === String(rowId))
    if (victim) gridEl.gridApi.applyTransaction({ remove: [victim] })
  }

  // bulk: atomic batch. The inner <turbo-stream> nodes live inside a
  // <template>, so they are NOT upgraded custom elements and lack
  // `templateContent`. Re-serialize the fragment and feed it back through
  // Turbo, which parses + upgrades + executes each inner stream.
  Turbo.StreamActions.bulk = function () {
    const tmp = document.createElement("div")
    tmp.appendChild(this.templateContent.cloneNode(true))
    window.Turbo.renderStreamMessage(tmp.innerHTML)
  }

  // aggregate: update a footer cell. Target element matches
  // [data-grid-aggregate="<grid>:<column>:<kind>"].
  Turbo.StreamActions.aggregate = function () {
    const grid   = this.getAttribute("grid")
    const column = this.getAttribute("column")
    const kind   = this.getAttribute("kind")
    const value  = this.templateContent.textContent
    document
      .querySelectorAll(`[data-grid-aggregate="${grid}:${column}:${kind}"]`)
      .forEach(el => { el.textContent = value })
  }

  // presence: per-user editing indicator badge.
  Turbo.StreamActions.presence = function () {
    const gridEl = gridById(this.getAttribute("grid"))
    const td = findCell(gridEl, this.getAttribute("row-id"), this.getAttribute("column"))
    if (!td) return
    const userId = this.getAttribute("user-id")
    const label  = this.getAttribute("user-label")
    const active = this.getAttribute("active") === "true"
    const existing = td.querySelector(`.sgr-presence[data-user-id="${CSS.escape(userId)}"]`)
    if (active && !existing) {
      const badge = document.createElement("span")
      badge.className = "sgr-presence"
      badge.dataset.userId = userId
      badge.title = `${label} is editing`
      badge.textContent = label.slice(0, 2).toUpperCase()
      td.appendChild(badge)
    } else if (!active && existing) {
      existing.remove()
    }
  }
}

// Apply a server-pushed cell value into both the DOM and the underlying
// gridApi's row data so future renders show the right value.
function applyCellUpdate(gridEl, rowId, column, value, { confirm }) {
  if (!gridEl?.gridApi) return
  const rows = gridEl.gridApi.getRowData()
  const row = rows.find(r => String(r.id) === String(rowId))
  if (!row) return
  const coerced = coerceFromString(value, typeof row[column])
  if (row[column] !== coerced) {
    // Spread the found row so the transaction carries the row's own id type
    // (number vs string) — applyTransaction matches rows by their id, and a
    // raw attribute string won't match a numerically-keyed row.
    gridEl.gridApi.applyTransaction({ update: [{ ...row, [column]: coerced }] })
  }
  const td = findCell(gridEl, rowId, column)
  if (!td) return
  if (confirm) {
    td.classList.remove("sgr-cell-pending")
    td.removeAttribute("data-pending")
    td.removeAttribute("data-prior-value")
    td.classList.add("sgr-cell-just-confirmed")
    setTimeout(() => td.classList.remove("sgr-cell-just-confirmed"), 500)
  }
}

function coerceFromString(s, existingType) {
  if (existingType === "number") {
    const n = Number(s)
    return Number.isFinite(n) ? n : s
  }
  if (existingType === "boolean") return s === "true"
  return s
}

// ---------- entry ----------

function start(application) {
  if (!application) {
    throw new Error("[stimulus_grid_rails] start(application) requires a Stimulus Application")
  }
  application.register("grid-sync",   GridSyncController)
  application.register("cell-editor", CellEditorController)
  registerStreamActions()
  return application
}

export { start, GridSyncController, CellEditorController, registerStreamActions }
export default { start }
