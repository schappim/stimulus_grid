import { Controller } from '@hotwired/stimulus';
import { el } from '../lib/dom.js';

/* Tool-panel Stimulus controller — mounts as an <aside> inside .sg-grid.
 * Renders a vertical tab strip on the right edge and a sliding content drawer
 * to its left. Today there's one tool panel, "Columns", which drives the
 * column visibility, row groups, pivot columns and value aggregations through
 * the public gridApi. Drag-and-drop moves fields between the Columns list and
 * the Row Groups / Values / Column Labels drop zones.
 *
 * The panel is event-driven: it listens for state-change events on the grid
 * and re-renders, never touching the grid's internals directly. */

const AGG_CYCLE = ['sum', 'avg', 'count', 'min', 'max'];

// Tiny SVG glyphs — recoloured by `fill="currentColor"` from CSS.
const COLUMNS_ICON = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>';
const GRIP_ICON    = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';

export default class SidePanelController extends Controller {
  connect() {
    this.grid = this.element.closest('.sg-grid');
    this._activeTab = 'columns';
    this._collapsed = false;
    this._build();

    // Defer the first content render until gridApi is up (which happens after
    // the grid's connect() finishes). Most of the time the panel mounts as a
    // child of an already-built grid, so api is already there.
    if (this.grid?.gridApi) {
      this._render();
    } else if (this.grid) {
      this.grid.addEventListener('grid:ready', () => this._render(), { once: true });
    }

    // Re-render whenever state we depend on changes.
    this._gridListener = () => this._render();
    for (const ev of [
      'grid:columnRowGroupChanged', 'grid:columnPivotChanged',
      'grid:columnValueChanged',   'grid:pivotModeChanged',
      'grid:columnVisible',        'grid:rowDataChanged',
    ]) this.grid?.addEventListener(ev, this._gridListener);
  }

  disconnect() {
    if (!this.grid || !this._gridListener) return;
    for (const ev of [
      'grid:columnRowGroupChanged', 'grid:columnPivotChanged',
      'grid:columnValueChanged',   'grid:pivotModeChanged',
      'grid:columnVisible',        'grid:rowDataChanged',
    ]) this.grid.removeEventListener(ev, this._gridListener);
  }

  // ----- Skeleton -----

  _build() {
    this.element.innerHTML = '';
    this._content = el('div', { class: 'sg-side-panel-content' });

    const tabs = el('div', { class: 'sg-side-panel-tabs' });
    this._columnsTab = el('button', {
      type: 'button',
      class: 'sg-side-panel-tab',
      'aria-pressed': 'true',
      title: 'Columns',
    });
    this._columnsTab.innerHTML = COLUMNS_ICON;
    this._columnsTab.addEventListener('click', () => this._onTabClick('columns'));
    tabs.appendChild(this._columnsTab);

    this.element.append(this._content, tabs);
  }

  _onTabClick(tab) {
    if (this._activeTab === tab && !this._collapsed) {
      // Same tab → collapse.
      this._collapsed = true;
      this.element.classList.add('sg-side-panel-collapsed');
      this._columnsTab.setAttribute('aria-pressed', 'false');
    } else {
      this._collapsed = false;
      this._activeTab = tab;
      this.element.classList.remove('sg-side-panel-collapsed');
      this._columnsTab.setAttribute('aria-pressed', tab === 'columns' ? 'true' : 'false');
      this._render();
    }
  }

  // ----- Helpers -----

  _api() { return this.grid?.gridApi; }

  // Real (non-synthetic) columns the user can manipulate.
  _columns() {
    const defs = this._api()?.getColumnDefs() || [];
    return defs.filter((c) => !c._isCheckbox && !c._isRowNumber && !c._isGroupCol && !c._isPivot);
  }

  _colByField(field) {
    return (this._api()?.getColumnDefs() || []).find((c) => c.field === field);
  }

  // ----- Render -----

  _render() {
    if (this._collapsed || this._activeTab !== 'columns') return;
    const api = this._api();
    if (!api) return;
    this._content.innerHTML = '';

    // Pivot mode toggle.
    const pivot = el('label', { class: 'sg-panel-pivot-toggle' });
    const cb = el('input', { type: 'checkbox' });
    cb.checked = api.isPivotMode();
    cb.addEventListener('change', () => api.setPivotMode(cb.checked));
    pivot.append(cb, el('span', {}, 'Pivot mode'));
    this._content.appendChild(pivot);

    // Columns list section (drag source + drop-back-to-remove).
    this._content.appendChild(this._renderColumnsList());

    // Row groups (always shown).
    this._content.appendChild(this._renderDropSection({
      title: 'Row Groups',
      placeholder: 'Drag here to group rows',
      kind: 'rowGroup',
      fields: api.getRowGroupColumns(),
    }));

    // Values (always shown).
    this._content.appendChild(this._renderValuesSection());

    // Column Labels (pivot mode only).
    if (api.isPivotMode()) {
      this._content.appendChild(this._renderDropSection({
        title: 'Column Labels',
        placeholder: 'Drag here to pivot columns',
        kind: 'pivot',
        fields: api.getPivotColumns(),
      }));
    }
  }

  _renderColumnsList() {
    const api = this._api();
    const section = el('div', { class: 'sg-panel-section' });
    section.appendChild(el('div', { class: 'sg-panel-section-title' }, 'Columns'));
    const list = el('ul', { class: 'sg-column-list' });
    section.appendChild(list);

    const rowGroups = new Set(api.getRowGroupColumns());
    const pivots    = new Set(api.getPivotColumns());
    const values    = new Map(api.getValueColumns().map((v) => [v.field, v.aggFunc]));

    for (const col of this._columns()) {
      const li = el('li', { class: 'sg-column-list-item', draggable: 'true' });
      li.dataset.field = col.field;

      const grip = el('span', { class: 'sg-column-grip', 'aria-hidden': 'true' });
      grip.innerHTML = GRIP_ICON;

      const visCb = el('input', { type: 'checkbox' });
      visCb.checked = !col.hidden;
      visCb.addEventListener('change', () => api.setColumnVisible(col.field, visCb.checked));

      const label = el('span', { class: 'sg-column-list-label' }, col.headerName || col.field);

      const tags = el('span', { class: 'sg-column-list-tags' });
      if (rowGroups.has(col.field)) tags.appendChild(el('span', { class: 'sg-tag sg-tag-group', title: 'Row group' }, 'group'));
      if (pivots.has(col.field))    tags.appendChild(el('span', { class: 'sg-tag sg-tag-pivot', title: 'Pivot column' }, 'pivot'));
      if (values.has(col.field))    tags.appendChild(el('span', { class: 'sg-tag sg-tag-value', title: `Value (${values.get(col.field)})` }, values.get(col.field)));

      li.append(grip, visCb, label, tags);
      this._wireDragSource(li, col.field);
      list.appendChild(li);
    }

    this._wireDropZone(list, 'columns');     // dropping back to the list removes from everywhere
    return section;
  }

  _renderDropSection({ title, placeholder, kind, fields }) {
    const section = el('div', { class: 'sg-panel-section sg-panel-drop' });
    section.appendChild(el('div', { class: 'sg-panel-section-title' }, title));
    const zone = el('div', { class: 'sg-drop-zone' });
    zone.dataset.dropKind = kind;
    if (!fields.length) {
      zone.classList.add('sg-drop-zone-empty');
      zone.appendChild(el('span', { class: 'sg-drop-placeholder' }, placeholder));
    } else {
      for (const field of fields) zone.appendChild(this._renderChip(kind, field));
    }
    this._wireDropZone(zone, kind);
    section.appendChild(zone);
    return section;
  }

  _renderValuesSection() {
    const api = this._api();
    const section = el('div', { class: 'sg-panel-section sg-panel-drop' });
    section.appendChild(el('div', { class: 'sg-panel-section-title' }, 'Values'));
    const zone = el('div', { class: 'sg-drop-zone' });
    zone.dataset.dropKind = 'value';
    const values = api.getValueColumns();
    if (!values.length) {
      zone.classList.add('sg-drop-zone-empty');
      zone.appendChild(el('span', { class: 'sg-drop-placeholder' }, 'Drag here to aggregate'));
    } else {
      for (const { field, aggFunc } of values) zone.appendChild(this._renderValueChip(field, aggFunc));
    }
    this._wireDropZone(zone, 'value');
    section.appendChild(zone);
    return section;
  }

  _renderChip(kind, field) {
    const col = this._colByField(field);
    const chip = el('span', { class: 'sg-chip', draggable: 'true' });
    chip.dataset.field = field;
    chip.dataset.fromKind = kind;
    chip.append(
      el('span', { class: 'sg-chip-label' }, col?.headerName || field),
      this._removeButton(() => this._removeFrom(kind, field)),
    );
    this._wireDragSource(chip, field);
    return chip;
  }

  _renderValueChip(field, aggFunc) {
    const api = this._api();
    const col = this._colByField(field);
    const chip = el('span', { class: 'sg-chip sg-chip-value', draggable: 'true' });
    chip.dataset.field = field;
    chip.dataset.fromKind = 'value';
    const aggBtn = el('button', {
      type: 'button', class: 'sg-chip-agg',
      title: 'Click to cycle: sum → avg → count → min → max',
    }, aggFunc);
    aggBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = AGG_CYCLE.indexOf(aggFunc);
      const next = AGG_CYCLE[(idx === -1 ? 0 : idx + 1) % AGG_CYCLE.length];
      api.setColumnAggFunc(field, next);
    });
    chip.append(
      aggBtn,
      el('span', { class: 'sg-chip-label' }, col?.headerName || field),
      this._removeButton(() => api.removeValueColumn(field)),
    );
    this._wireDragSource(chip, field);
    return chip;
  }

  _removeButton(onClick) {
    const btn = el('button', { type: 'button', class: 'sg-chip-remove', 'aria-label': 'Remove', title: 'Remove' });
    btn.textContent = '×';
    btn.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
    return btn;
  }

  // ----- DnD plumbing -----

  _wireDragSource(node, field) {
    node.addEventListener('dragstart', (e) => {
      // Stash the field name on the dataTransfer so drop targets can read it.
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', field);
      node.classList.add('sg-dragging');
    });
    node.addEventListener('dragend', () => node.classList.remove('sg-dragging'));
  }

  _wireDropZone(zone, kind) {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      zone.classList.add('sg-drop-over');
    });
    zone.addEventListener('dragleave', (e) => {
      // dragleave fires for child entries too; only clear when leaving the zone itself.
      if (e.target === zone) zone.classList.remove('sg-drop-over');
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('sg-drop-over');
      const field = e.dataTransfer.getData('text/plain');
      if (!field) return;
      this._handleDrop(kind, field);
    });
  }

  // A field lives in at most one of {rowGroup, pivot, value} at a time.
  // Dropping on a zone removes it from the others first.
  _handleDrop(kind, field) {
    const api = this._api();
    if (kind === 'columns') { this._removeEverywhere(field); return; }
    this._removeEverywhere(field, kind);
    if (kind === 'rowGroup') api.addRowGroupColumn(field);
    else if (kind === 'pivot')    api.addPivotColumn(field);
    else if (kind === 'value')    api.addValueColumn(field, 'sum');
  }

  _removeFrom(kind, field) {
    const api = this._api();
    if (kind === 'rowGroup') api.removeRowGroupColumn(field);
    else if (kind === 'pivot')    api.removePivotColumn(field);
    else if (kind === 'value')    api.removeValueColumn(field);
  }

  _removeEverywhere(field, except = null) {
    const api = this._api();
    if (except !== 'rowGroup') api.removeRowGroupColumn(field);
    if (except !== 'pivot')    api.removePivotColumn(field);
    if (except !== 'value')    api.removeValueColumn(field);
  }
}
