import { Controller } from '@hotwired/stimulus';

/* Row-level controller. In v0.1 the grid controller handles per-row interactions
 * via event delegation on tbody (faster than mounting a controller per row).
 * This controller exists as an extension point — host apps can register their
 * own row controller for custom row-level behavior via composition. */
export default class RowController extends Controller {
  connect() {}
}
