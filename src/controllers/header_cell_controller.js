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
    checkbox:     { type: Boolean, default: false },
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
    // One mousedown handler dispatches to sort (bare click) or reorder (drag).
    this.element.addEventListener('mousedown', this._onMouseDown);
  }

  disconnect() {
    this.element.removeEventListener('mousedown', this._onMouseDown);
    this.grid?.unregisterColumn(this.fieldValue);
  }

  toColumnDef() {
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
      _isCheckbox:  this.checkboxValue,
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

}
