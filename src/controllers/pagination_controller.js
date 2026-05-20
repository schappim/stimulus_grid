import { Controller } from '@hotwired/stimulus';

/* Renders a pagination UI bound to a grid via a Stimulus outlet.
 *
 * Usage:
 *   <nav data-controller="pagination"
 *        data-pagination-grid-outlet="[data-controller~='grid']">
 *     <button data-pagination-target="first" data-action="pagination#first">«</button>
 *     <button data-pagination-target="prev"  data-action="pagination#prev">‹</button>
 *     <span   data-pagination-target="pageInfo">Page 1 of 1</span>
 *     <button data-pagination-target="next"  data-action="pagination#next">›</button>
 *     <button data-pagination-target="last"  data-action="pagination#last">»</button>
 *     <select data-pagination-target="pageSize"
 *             data-action="change->pagination#changeSize">
 *       <option>20</option><option>50</option><option>100</option>
 *     </select>
 *   </nav>
 */
export default class PaginationController extends Controller {
  static outlets = ['grid'];
  static targets = ['first', 'prev', 'next', 'last', 'pageInfo', 'pageSize'];

  connect() {
    this.element.classList.add('sg-pagination-bar');
    if (this.hasGridOutlet) this._wire(this.gridOutletElement);
  }

  disconnect() {
    if (this._gridEl) this._unwire(this._gridEl);
  }

  gridOutletConnected(_controller, gridEl) { this._wire(gridEl); }
  gridOutletDisconnected(_controller, gridEl) { this._unwire(gridEl); }

  _wire(gridEl) {
    this._gridEl = gridEl;
    for (const ev of ['grid:paginationChanged', 'grid:rowDataChanged', 'grid:filterChanged', 'grid:ready']) {
      gridEl.addEventListener(ev, this._refresh);
    }
    if (gridEl.gridApi) this._refresh();
  }

  _unwire(gridEl) {
    for (const ev of ['grid:paginationChanged', 'grid:rowDataChanged', 'grid:filterChanged', 'grid:ready']) {
      gridEl.removeEventListener(ev, this._refresh);
    }
    this._gridEl = null;
  }

  _refresh = () => {
    const api = this._gridEl?.gridApi;
    if (!api) return;
    const cur = api.paginationGetCurrentPage();
    const total = api.paginationGetTotalPages();
    const rowCount = api.paginationGetRowCount();
    const size = api.paginationGetPageSize() || 1;
    if (this.hasPageInfoTarget) {
      const start = rowCount === 0 ? 0 : cur * size + 1;
      const end = Math.min(rowCount, start + size - 1);
      this.pageInfoTarget.textContent = rowCount === 0
        ? '0 rows'
        : `${start}–${end} of ${rowCount}`;
    }
    if (this.hasFirstTarget) this.firstTarget.disabled = cur === 0;
    if (this.hasPrevTarget)  this.prevTarget.disabled  = cur === 0;
    if (this.hasNextTarget)  this.nextTarget.disabled  = cur >= total - 1;
    if (this.hasLastTarget)  this.lastTarget.disabled  = cur >= total - 1;
    if (this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget) {
      this.pageSizeTarget.value = String(size);
    }
  };

  first()    { this._gridEl?.gridApi?.paginationGoToFirstPage(); }
  prev()     { this._gridEl?.gridApi?.paginationGoToPreviousPage(); }
  next()     { this._gridEl?.gridApi?.paginationGoToNextPage(); }
  last()     { this._gridEl?.gridApi?.paginationGoToLastPage(); }
  changeSize(event) {
    const n = parseInt(event.target.value, 10);
    if (Number.isFinite(n) && n > 0) this._gridEl?.gridApi?.paginationSetPageSize(n);
  }
}
