/* Display-list pipeline: rowData → filter → sort → page → window.
 * Pure functions, no DOM. Consumed by grid_controller. */

export function getValue(row, col) {
  if (typeof col.valueGetter === 'function') return col.valueGetter(row);
  return row?.[col.field];
}

export function formatValue(row, col) {
  const v = getValue(row, col);
  if (typeof col.valueFormatter === 'function') return col.valueFormatter(v, row);
  if (v == null) return '';
  if (col.type === 'date' && v instanceof Date) return v.toLocaleDateString();
  if (col.type === 'boolean') return v ? '✓' : '';
  return String(v);
}

/* -------- Filtering -------- */

const TEXT_OPS = {
  contains:    (v, q) => String(v ?? '').toLowerCase().includes(String(q ?? '').toLowerCase()),
  notContains: (v, q) => !String(v ?? '').toLowerCase().includes(String(q ?? '').toLowerCase()),
  equals:      (v, q) => String(v ?? '').toLowerCase() === String(q ?? '').toLowerCase(),
  notEqual:    (v, q) => String(v ?? '').toLowerCase() !== String(q ?? '').toLowerCase(),
  startsWith:  (v, q) => String(v ?? '').toLowerCase().startsWith(String(q ?? '').toLowerCase()),
  endsWith:    (v, q) => String(v ?? '').toLowerCase().endsWith(String(q ?? '').toLowerCase()),
  blank:       (v)    => v == null || v === '',
  notBlank:    (v)    => v != null && v !== '',
};

const NUM_OPS = {
  equals:               (v, q) => Number(v) === Number(q),
  notEqual:             (v, q) => Number(v) !== Number(q),
  lessThan:             (v, q) => Number(v) < Number(q),
  lessThanOrEqual:      (v, q) => Number(v) <= Number(q),
  greaterThan:          (v, q) => Number(v) > Number(q),
  greaterThanOrEqual:   (v, q) => Number(v) >= Number(q),
  inRange:              (v, q, q2) => Number(v) >= Number(q) && Number(v) <= Number(q2),
  blank:                (v) => v == null || v === '',
  notBlank:             (v) => v != null && v !== '',
};

function toDate(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return Number.isNaN(d.valueOf()) ? null : d;
}

const DATE_OPS = {
  equals:             (v, q) => toDate(v)?.toDateString() === toDate(q)?.toDateString(),
  notEqual:           (v, q) => toDate(v)?.toDateString() !== toDate(q)?.toDateString(),
  lessThan:           (v, q) => (toDate(v)?.valueOf() ?? -Infinity) < (toDate(q)?.valueOf() ?? Infinity),
  greaterThan:        (v, q) => (toDate(v)?.valueOf() ?? Infinity) > (toDate(q)?.valueOf() ?? -Infinity),
  inRange:            (v, q, q2) => {
    const t = toDate(v)?.valueOf();
    return t != null && t >= (toDate(q)?.valueOf() ?? -Infinity) && t <= (toDate(q2)?.valueOf() ?? Infinity);
  },
  blank:              (v) => v == null || v === '',
  notBlank:           (v) => v != null && v !== '',
};

const BOOL_OPS = {
  equals: (v, q) => (q === 'true' ? !!v : q === 'false' ? !v : true),
};

const SET_OPS = {
  in: (v, q) => Array.isArray(q) && q.includes(String(v ?? '')),
};

const OPS_BY_TYPE = { text: TEXT_OPS, number: NUM_OPS, date: DATE_OPS, boolean: BOOL_OPS, set: SET_OPS };

function passesFilter(row, col, filter) {
  if (!filter) return true;
  const type = filter.filterType || col.filter || 'text';
  const ops = OPS_BY_TYPE[type] || TEXT_OPS;
  const op = ops[filter.type];
  if (!op) return true;
  const v = getValue(row, col);
  return op(v, filter.value, filter.value2);
}

export function applyFilters(rows, filterModel, columnsByField) {
  const entries = Object.entries(filterModel || {}).filter(([, f]) => f != null);
  if (entries.length === 0) return rows;
  return rows.filter((row) => entries.every(([colId, f]) => {
    const col = columnsByField[colId];
    return col ? passesFilter(row, col, f) : true;
  }));
}

/* Quick filter: case-insensitive substring match across all visible column
 * values for a row. Used for "search everything" UI. */
export function applyQuickFilter(rows, query, visibleCols) {
  if (!query) return rows;
  const q = String(query).toLowerCase();
  return rows.filter((row) => {
    for (const col of visibleCols) {
      const v = formatValue(row, col);
      if (v && String(v).toLowerCase().includes(q)) return true;
    }
    return false;
  });
}

/* -------- Sorting -------- */

function defaultComparator(a, b, type) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (type === 'number') return Number(a) - Number(b);
  if (type === 'date') {
    const da = toDate(a)?.valueOf() ?? 0;
    const db = toDate(b)?.valueOf() ?? 0;
    return da - db;
  }
  if (type === 'boolean') return (a === b) ? 0 : (a ? 1 : -1);
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

export function applySort(rows, sortModel, columnsByField) {
  if (!sortModel || sortModel.length === 0) return rows;
  const sorted = rows.slice();
  sorted.sort((ra, rb) => {
    for (const { colId, sort } of sortModel) {
      const col = columnsByField[colId];
      if (!col) continue;
      const a = getValue(ra, col);
      const b = getValue(rb, col);
      const cmp = typeof col.comparator === 'function'
        ? col.comparator(a, b, ra, rb)
        : defaultComparator(a, b, col.type);
      if (cmp !== 0) return sort === 'desc' ? -cmp : cmp;
    }
    return 0;
  });
  return sorted;
}

/* -------- Pagination -------- */

export function applyPagination(rows, pagination) {
  if (!pagination || !pagination.enabled) return { rows, total: rows.length, pageRows: rows };
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pagination.pageSize));
  const page = Math.min(pagination.page, totalPages - 1);
  const start = page * pagination.pageSize;
  const pageRows = rows.slice(start, start + pagination.pageSize);
  return { rows, total, totalPages, page, pageRows };
}

/* -------- Top-level pipeline -------- */

export function buildDisplayList(state) {
  const columnsByField = Object.fromEntries(state.columnDefs.map((c) => [c.field, c]));
  const visibleCols = state.columnDefs.filter((c) => !c.hidden && !c._isCheckbox);
  let rows = state.rowData;
  rows = applyFilters(rows, state.filterModel, columnsByField);
  rows = applyQuickFilter(rows, state.quickFilter, visibleCols);
  rows = applySort(rows, state.sortModel, columnsByField);
  const paged = applyPagination(rows, state.pagination);
  return { filteredSorted: rows, ...paged };
}

/* -------- Virtual window -------- */

export function computeWindow(scrollTop, viewportHeight, rowHeight, totalRows, buffer = 6) {
  const visible = Math.ceil(viewportHeight / rowHeight);
  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const last = Math.min(totalRows, first + visible + buffer * 2);
  return { first, last };
}
