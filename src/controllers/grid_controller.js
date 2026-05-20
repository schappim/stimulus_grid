import { Controller } from '@hotwired/stimulus';

export default class GridController extends Controller {
  connect() {
    // Stub — real implementation lands in the next commit.
    this.element.classList.add('sg-grid');
  }
}
