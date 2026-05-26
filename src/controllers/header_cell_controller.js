import { Controller } from '@hotwired/stimulus';
import { findParentController } from '../lib/dom.js';

export default class HeaderCellController extends Controller {
  static values = {
    field:        String,
    headerName:   { type: String, default: '' },
    type:         { type: String, default: 'text' },     // text|number|date|boolean
    sortable:     { type: Boolean, default: false },
    filter:       { type: String, default: '' },          // ''|text|number|date|boolean|set
    editable:     { type: Boolean, default: false },
    width:        { type: Number, default: 0 },
    minWidth:     { type: Number, default: 40 },
    maxWidth:     { type: Number, default: 4000 },
    pinned:       { type: String, default: '' },          // ''|left|right
    hidden:       { type: Boolean, default: false },
    resizable:    { type: Boolean, default: true },
    cellRenderer: { type: String, default: '' },
    cellEditor:   { type: String, default: '' },
    // JSON config for the cell renderer (options, colorMap, etc.). Lets
    // server-side column declarations (the Rails gem) configure built-in
    // renderers like `select` / `multiselect` without a separate JS
    // registerRenderer() call per column. Renderers read it as
    // `col.cellRendererConfig` (parsed object) inside their ctx.
    cellRendererConfig: { type: String, default: '' },
    // Server-side enum_values surface for select / multiselect / combobox.
    // JSON array of strings or { value, label, color } objects. Renderers
    // fall back to this when cellRendererConfig.options is not set.
    enumValues: { type: String, default: '' },
    checkbox:     { type: Boolean, default: false },
    rowNumber:    { type: Boolean, default: false },   // gutter: shows 1-based row number, click selects row
    // Per-column opt-out for drag-to-attach. Defaults to undefined (inherits
    // the grid-wide acceptFiles setting); explicit false suppresses the drop
    // visual + grid:fileAttached event for this column.
    acceptFiles:  { type: String, default: '' },        // '' | 'true' | 'false'
  };

  connect() {
    this.grid = findParentController(this.element, 'grid', this.application);
    if (!this.grid) return;
    // Inherit the th's existing text as the default header name.
    if (!this.headerNameValue) {
      const txt = this.element.textContent.trim();
      if (txt) this.headerNameValue = txt;
    }
    this.grid.registerColumn(this.toColumnDef(), this.element);
    // Sort/reorder mousedown — but not on a checkbox or row-number gutter
    // header (those don't sort/reorder).
    if (!this.checkboxValue && !this.rowNumberValue) {
      this.element.addEventListener('mousedown', this._onMouseDown);
    }
  }

  disconnect() {
    this.element.removeEventListener('mousedown', this._onMouseDown);
    this.grid?.unregisterColumn(this.fieldValue);
  }

  toColumnDef() {
    // 'true'/'false' opt-in/out for file drop. Undefined => inherit from
    // the grid's acceptFilesValue. Stored as a real boolean (or undefined)
    // so the grid's per-cell check is a simple `col.acceptFiles === false`.
    let acceptFiles;
    if (this.acceptFilesValue === 'true') acceptFiles = true;
    else if (this.acceptFilesValue === 'false') acceptFiles = false;
    // Parse the renderer-config JSON once at registration time so renderers
    // can read it cheaply per cell. Malformed JSON is logged and ignored
    // rather than throwing — the rest of the column should still render.
    let cellRendererConfig = null;
    if (this.cellRendererConfigValue) {
      try { cellRendererConfig = JSON.parse(this.cellRendererConfigValue); }
      catch (e) {
        console.warn(`[stimulus_grid] invalid cellRendererConfig JSON for ${this.fieldValue}:`, e);
      }
    }
    let enumValues = null;
    if (this.enumValuesValue) {
      try { enumValues = JSON.parse(this.enumValuesValue); }
      catch (e) {
        console.warn(`[stimulus_grid] invalid enumValues JSON for ${this.fieldValue}:`, e);
      }
    }
    return {
      field:        this.fieldValue,
      headerName:   this.headerNameValue || this.fieldValue,
      type:         this.typeValue,
      sortable:     this.sortableValue,
      filter:       this.filterValue || null,
      editable:     this.editableValue,
      width:        this.widthValue || undefined,
      minWidth:     this.minWidthValue,
      maxWidth:     this.maxWidthValue,
      pinned:       this.pinnedValue || null,
      hidden:       this.hiddenValue,
      resizable:    this.resizableValue,
      cellRenderer: this.cellRendererValue || null,
      cellEditor:   this.cellEditorValue || null,
      cellRendererConfig,
      enumValues,
      _isCheckbox:  this.checkboxValue,
      _isRowNumber: this.rowNumberValue,
      acceptFiles,
      sortable:     this.rowNumberValue ? false : this.sortableValue,
      resizable:    this.rowNumberValue ? false : this.resizableValue,
    };
  }

  /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
   * that moves past a small pixel threshold (→ column reorder). Lets us keep
   * sort + reorder on the same header without a separate drag handle. */
  _onMouseDown = (event) => {
    if (event.button !== 0) return;
    if (event.target.closest('.sg-resize-handle, .sg-filter-icon, .sg-reorder-handle')) return;

    const startX = event.clientX;
    const startY = event.clientY;
    let dragging = false;
    const move = (e) => {
      const dx = Math.abs(e.clientX - startX);
      const dy = Math.abs(e.clientY - startY);
      if (!dragging && (dx > 5 || dy > 5)) {
        dragging = true;
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
        this._beginReorder(startX);
      }
    };
    const up = (e) => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      if (!dragging) this.sort(e);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  };

  _beginReorder(startX) {
    if (!this.grid) return;
    const headerRow = this.element.parentElement;
    const ths = Array.from(headerRow.children);
    const fromIndex = ths.indexOf(this.element);
    let dropIndex = fromIndex;

    this.element.style.opacity = '0.5';
    this.element.style.background = 'var(--sg-bg-hover, #eef2ff)';
    document.body.style.cursor = 'grabbing';

    const move = (e) => {
      const cursorX = e.clientX;
      let best = ths.length;
      for (let i = 0; i < ths.length; i++) {
        const r = ths[i].getBoundingClientRect();
        if (cursorX < r.left + r.width / 2) { best = i; break; }
      }
      dropIndex = best > fromIndex ? best - 1 : best;
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      this.element.style.opacity = '';
      this.element.style.background = '';
      document.body.style.cursor = '';
      if (dropIndex !== fromIndex) {
        this.grid.moveColumn(this.fieldValue, dropIndex);
      }
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }

  sort(event) {
    if (!this.sortableValue || !this.grid) return;
    this.grid.toggleSort(this.fieldValue, event?.shiftKey === true);
  }

  openFilter(event) {
    event?.stopPropagation();
    if (!this.grid) return;
    this.grid.openFilterFor(this.fieldValue, this.element);
  }

  // Resize: drag handle adjusts column width live.
  startResize(event) {
    if (!this.resizableValue || !this.grid) return;
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startWidth = this.element.offsetWidth;
    const move = (e) => this.grid.setColumnWidth(this.fieldValue, startWidth + (e.clientX - startX));
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }

  // Double-click on the resize handle — autosize the column to fit
  // the widest cell. Mirrors Excel / Numbers / every spreadsheet.
  // Suppresses the click event that would otherwise bubble to the th and
  // toggle sort.
  autosizeColumn(event) {
    if (!this.resizableValue || !this.grid) return;
    event.preventDefault();
    event.stopPropagation();
    this.grid.autoSizeColumn(this.fieldValue);
  }

}
