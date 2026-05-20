import { Controller } from '@hotwired/stimulus';

/* Cell-level controller. In v0.1 the grid controller handles per-cell interactions
 * (click/dblclick/edit) via tbody delegation. Kept as an extension point for
 * downstream apps that want to attach behavior to individual cells. */
export default class CellController extends Controller {
  connect() {}
}
