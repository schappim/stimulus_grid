import { Application } from '@hotwired/stimulus';
import './styles/grid.css';
import GridController from './controllers/grid_controller.js';
import HeaderCellController from './controllers/header_cell_controller.js';
import RowController from './controllers/row_controller.js';
import CellController from './controllers/cell_controller.js';
import FilterController from './controllers/filter_controller.js';
import PaginationController from './controllers/pagination_controller.js';

export {
  GridController,
  HeaderCellController,
  RowController,
  CellController,
  FilterController,
  PaginationController,
};

export function start(app) {
  const application = app ?? Application.start();
  application.register('grid', GridController);
  application.register('header-cell', HeaderCellController);
  application.register('row', RowController);
  application.register('cell', CellController);
  application.register('filter', FilterController);
  application.register('pagination', PaginationController);
  return application;
}

const StimulusGrid = {
  start,
  GridController,
  HeaderCellController,
  RowController,
  CellController,
  FilterController,
  PaginationController,
};

export default StimulusGrid;

if (typeof window !== 'undefined' && !window.__stimulusGridStarted) {
  window.__stimulusGridStarted = true;
  window.StimulusGrid = StimulusGrid;
}
