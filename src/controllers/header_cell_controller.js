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
    // Auto-bind sort click (so users don't need to add data-action manually).
    if (this.sortableValue) {
      this.element.addEventListener('click', this._onClick);
    }
  }

  disconnect() {
    this.element.removeEventListener('click', this._onClick);
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

  // Stimulus actions (wired via data-action on chrome we render). Manual entrypoint
  // for sort lives in #_onClick so users don't have to write data-action="...sort".
  _onClick = (event) => {
    if (event.target.closest('.sg-resize-handle, .sg-filter-icon, .sg-reorder-handle')) return;
    this.sort(event);
  };

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

  // Column reorder (drag header to a new position).
  startReorder(event) {
    if (!this.grid) return;
    event.preventDefault();
    const startX = event.clientX;
    const fromIndex = this.grid.state.columnDefs.findIndex((c) => c.field === this.fieldValue);
    let dropIndex = fromIndex;
    const cols = Array.from(this.element.parentElement.children);
    const move = (e) => {
      const dx = e.clientX - startX;
      const rect = this.element.getBoundingClientRect();
      const cursor = rect.left + dx + rect.width / 2;
      let bestIdx = fromIndex;
      cols.forEach((c, i) => {
        const r = c.getBoundingClientRect();
        if (cursor > r.left + r.width / 2) bestIdx = i + 1;
      });
      dropIndex = Math.min(cols.length - 1, Math.max(0, bestIdx));
      this.element.style.opacity = '0.6';
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      this.element.style.opacity = '';
      this.grid.moveColumn(this.fieldValue, dropIndex);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  }
}
