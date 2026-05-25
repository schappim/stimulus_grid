/* Factory for the public gridApi exposed on the grid element. */

export function createGridApi(grid) {
  return {
    // ---- Data ----
    setRowData(rows) { grid.setRowData(rows); },
    getRowData() { return grid.state.rowData.slice(); },
    applyTransaction(tx) { return grid.applyTransaction(tx); },

    // Server-side row model
    setRowCount(total) { grid.setRowCount(total); },
    getRowCount() { return grid.state.serverSide ? grid.state.serverRowCount : grid.state.rowData.length; },
    isServerSide() { return !!grid.state.serverSide; },

    // ---- Columns ----
    setColumnDefs(defs) { grid.setColumnDefs(defs); },
    getColumnDefs() { return grid.state.columnDefs.slice(); },
    setColumnVisible(colId, visible) { grid.setColumnVisible(colId, visible); },
    setColumnPinned(colId, pinned) { grid.setColumnPinned(colId, pinned); },
    setColumnWidth(colId, w) { grid.setColumnWidth(colId, w); },
    moveColumn(colId, toIndex) { grid.moveColumn(colId, toIndex); },
    autoSizeColumn(colId) { grid.autoSizeColumn(colId); },
    autoSizeAllColumns() { grid.state.columnDefs.forEach((c) => grid.autoSizeColumn(c.field)); },
    sizeColumnsToFit() { grid.sizeColumnsToFit(); },

    // ---- Sort ----
    setSortModel(model) { grid.setSortModel(model); },
    getSortModel() { return grid.state.sortModel.slice(); },

    // ---- Filter ----
    setFilterModel(model) { grid.setFilterModel(model); },
    getFilterModel() { return { ...grid.state.filterModel }; },
    setColumnFilter(colId, filter) { grid.setColumnFilter(colId, filter); },
    destroyFilter(colId) { grid.setColumnFilter(colId, null); },
    setQuickFilter(text) { grid.setQuickFilter(text); },
    getQuickFilter() { return grid.getQuickFilter(); },

    // ---- Selection ----
    selectAll() { grid.selectAll(); },
    deselectAll() { grid.deselectAll(); },
    selectRow(rowId) { grid.setSelected(rowId, true); },
    deselectRow(rowId) { grid.setSelected(rowId, false); },
    getSelectedRows() { return grid.getSelectedRows(); },
    getSelectedRowIds() { return Array.from(grid.state.selection); },

    // ---- Pagination ----
    paginationGoToPage(n) { grid.goToPage(n); },
    paginationGoToFirstPage() { grid.goToPage(0); },
    paginationGoToNextPage() { grid.goToPage(grid.state.pagination.page + 1); },
    paginationGoToPreviousPage() { grid.goToPage(grid.state.pagination.page - 1); },
    paginationGoToLastPage() { grid.goToPage(grid.lastPageIndex()); },
    paginationSetPageSize(n) { grid.setPageSize(n); },
    paginationGetCurrentPage() { return grid.state.pagination.page; },
    paginationGetTotalPages() { return grid.totalPages(); },
    paginationGetRowCount() { return grid.filteredCount(); },
    paginationGetPageSize() { return grid.state.pagination.pageSize; },
    paginationIsEnabled() { return grid.state.pagination.enabled; },

    // ---- Cell selection ----
    getCellSelection() { return grid.getCellSelectionDetail(); },
    getCellRangeValues() { return grid._cellRangeRows(); },
    getCellSelectionRowIds() { return grid.getCellSelectionRowIds(); },
    getRangeAggregates() { return grid.getRangeAggregates(); },

    // ---- Editing ----
    startEditingCell({ rowId, colId }) { grid.startEditingCell(rowId, colId); },
    stopEditing(cancel = false) { grid.stopEditing(cancel); },

    // ---- Row grouping + aggregation ----
    setRowGroupColumns(fields) { grid.setRowGroupColumns(fields); },
    addRowGroupColumn(field) { grid.addRowGroupColumn(field); },
    removeRowGroupColumn(field) { grid.removeRowGroupColumn(field); },
    getRowGroupColumns() { return grid.getRowGroupColumns(); },
    setColumnAggFunc(field, func) { grid.setColumnAggFunc(field, func); },
    expandAll() { grid.expandAll(); },
    collapseAll() { grid.collapseAll(); },
    toggleGroup(groupId, level) { grid.toggleGroup(groupId, level); },

    // ---- Pivot ----
    setPivotMode(on) { grid.setPivotMode(on); },
    isPivotMode() { return grid.isPivotMode(); },
    setPivotColumns(fields) { grid.setPivotColumns(fields); },
    addPivotColumn(field) { grid.addPivotColumn(field); },
    removePivotColumn(field) { grid.removePivotColumn(field); },
    getPivotColumns() { return grid.getPivotColumns(); },
    // Synthetic pivot result columns from the most recent render. Each entry
    // is { field, headerName, pivotKeys, valueField, aggFunc } — useful for
    // discovering the field id of a pivot col to feed to setSortModel / for
    // building a custom column visibility UI.
    getPivotResultColumns() {
      const cols = grid._displayList?.pivotResultColumns || [];
      return cols.map((c) => ({
        field: c.field,
        headerName: c.headerName,
        pivotKeys: { ...(c.pivotKeys || {}) },
        valueField: c.valueField,
        aggFunc: c.aggFunc,
      }));
    },

    // ---- Value columns (aggregations; shared with grouping) ----
    setValueColumns(list) { grid.setValueColumns(list); },
    addValueColumn(field, aggFunc = 'sum') { grid.addValueColumn(field, aggFunc); },
    removeValueColumn(field) { grid.removeValueColumn(field); },
    getValueColumns() { return grid.getValueColumns(); },

    // ---- Column header groups (multi-row headers) ----
    setColumnGroups(groups) { grid.setColumnGroups(groups); },
    getColumnGroups() { return grid.getColumnGroups(); },

    // ---- Pinned bottom row (sticky grand totals) ----
    setPinnedBottomRow(on) { grid.setPinnedBottomRow(on); },
    isPinnedBottomRow() { return grid.isPinnedBottomRow(); },

    // ---- Master/detail ----
    setMasterDetail(on) { grid.setMasterDetail(on); },
    isMasterDetail() { return grid.isMasterDetail(); },
    expandDetailRow(rowId) { grid.expandDetailRow(rowId); },
    collapseDetailRow(rowId) { grid.collapseDetailRow(rowId); },
    toggleDetailRow(rowId) { grid.toggleDetailRow(rowId); },
    expandAllDetails() { grid.expandAllDetails(); },
    collapseAllDetails() { grid.collapseAllDetails(); },
    getDetailExpandedRowIds() { return grid.getDetailExpandedRowIds(); },

    // ---- Column state + persistence ----
    getColumnState() { return grid.getColumnState(); },
    applyColumnState(state) { grid.applyColumnState(state); },
    clearPersistedState() { grid.clearPersistedState(); },
    getPersistKey() { return grid.persistKeyValue || ''; },

    // ---- Export ----
    getDataAsCsv(opts = {}) { return grid.getDataAsCsv(opts); },
    exportDataAsCsv(opts = {}) { return grid.exportDataAsCsv(opts); },

    // ---- Display ----
    refreshCells(opts = {}) { grid.refresh(opts); },
    redrawRows(opts = {}) { grid.refresh(opts); },

    // ---- Events ----
    addEventListener(type, handler) { grid.element.addEventListener(type, handler); },
    removeEventListener(type, handler) { grid.element.removeEventListener(type, handler); },
  };
}
