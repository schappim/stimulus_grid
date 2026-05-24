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

/* -------- Grouping + aggregation -------- */

// Aggregate a column over a set of leaf rows. `count` ignores the column;
// `sum`/`avg`/`min`/`max` coerce to Number and skip non-numerics; `first`/`last`
// take the raw value in display order. Unknown funcs return null.
export function aggregateValue(func, leaves, col) {
  if (func === 'count') return leaves.length;
  const raw = leaves.map((r) => getValue(r, col));
  if (func === 'first') return raw.length ? raw[0] : null;
  if (func === 'last') return raw.length ? raw[raw.length - 1] : null;
  const nums = raw.map(Number).filter((n) => !Number.isNaN(n));
  switch (func) {
    case 'sum': return nums.reduce((a, b) => a + b, 0);
    case 'avg': return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    case 'min': return nums.length ? Math.min(...nums) : null;
    case 'max': return nums.length ? Math.max(...nums) : null;
    default: return null;
  }
}

// { field: aggFunc } → { field: value } over the given leaf rows.
export function computeAggregates(leaves, aggModel, columnsByField) {
  const out = {};
  for (const [field, func] of Object.entries(aggModel || {})) {
    const col = columnsByField[field];
    if (col) out[field] = aggregateValue(func, leaves, col);
  }
  return out;
}

// Roll up a flat list of cell values (e.g. the user's cell-range selection) into
// {count,sum,avg,min,max}. `count` is non-empty cells; numeric aggs are computed
// over the numeric subset (numbers + numeric strings) and are null when no
// numerics are present. Booleans, dates and other non-numerics count toward
// `count` but not toward the numeric aggregates — matching the status-bar
// behaviour users expect from Sheets/Excel.
export function aggregateRange(values) {
  let count = 0;
  let numericCount = 0;
  let sum = 0;
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v == null || v === '') continue;
    count += 1;
    let n = null;
    if (typeof v === 'number' && Number.isFinite(v)) n = v;
    else if (typeof v === 'string' && v.trim() !== '') {
      const parsed = Number(v);
      if (Number.isFinite(parsed)) n = parsed;
    }
    if (n != null) {
      numericCount += 1;
      sum += n;
      if (n < min) min = n;
      if (n > max) max = n;
    }
  }
  return {
    count,
    sum: numericCount ? sum : null,
    avg: numericCount ? sum / numericCount : null,
    min: numericCount ? min : null,
    max: numericCount ? max : null,
  };
}

// Group leaf rows by `groupCols` (column objects, in hierarchy order) into a
// tree, then flatten to a display list of group rows + the leaf rows of any
// expanded group. `isExpanded(groupId, level)` decides expansion (default: all
// expanded). Group rows are tagged `__sgGroup: true` and carry `level`, `value`,
// `groupId` (a stable path like `country=USA|sport=Swimming`), deep `count`, and
// `aggregates`. Leaf rows pass through unchanged.
export function groupRows(rows, groupCols, columnsByField, aggModel, isExpanded = () => true) {
  const build = (leaves, level, parentId) => {
    const col = groupCols[level];
    const buckets = new Map();
    for (const row of leaves) {
      const value = getValue(row, col);
      const k = value == null ? '' : String(value);
      if (!buckets.has(k)) buckets.set(k, { value, rows: [] });
      buckets.get(k).rows.push(row);
    }
    return Array.from(buckets.values())
      .sort((a, b) => defaultComparator(a.value, b.value, col.type))
      .map(({ value, rows: groupLeaves }) => {
        const keyStr = value == null ? '' : String(value);
        const groupId = parentId ? `${parentId}|${col.field}=${keyStr}` : `${col.field}=${keyStr}`;
        return {
          __sgGroup: true,
          level,
          field: col.field,
          value,
          groupId,
          count: groupLeaves.length,
          aggregates: computeAggregates(groupLeaves, aggModel, columnsByField),
          leaves: groupLeaves,
          children: level + 1 < groupCols.length ? build(groupLeaves, level + 1, groupId) : null,
        };
      });
  };

  const tree = build(rows, 0, '');
  const out = [];
  const walk = (nodes) => {
    for (const node of nodes) {
      out.push(node);
      if (!isExpanded(node.groupId, node.level)) continue;
      if (node.children) walk(node.children);
      else for (const leaf of node.leaves) out.push(leaf);
    }
  };
  walk(tree);
  return { displayList: out, tree };
}

/* -------- Top-level pipeline -------- */

export function buildDisplayList(state) {
  // Server-side row model: rowData IS the current page already filtered/sorted
  // by the server. Skip the client pipeline; pagination metadata comes from the
  // server-provided total row count.
  if (state.serverSide) {
    const rows = state.rowData;
    const pageSize = state.pagination?.pageSize || rows.length || 1;
    const total = state.serverRowCount ?? rows.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(state.pagination?.page || 0, totalPages - 1);
    return { filteredSorted: rows, rows, total, totalPages, page, pageRows: rows };
  }

  const columnsByField = Object.fromEntries(state.columnDefs.map((c) => [c.field, c]));
  const visibleCols = state.columnDefs.filter((c) => !c.hidden && !c._isCheckbox);
  let rows = state.rowData;
  rows = applyFilters(rows, state.filterModel, columnsByField);
  rows = applyQuickFilter(rows, state.quickFilter, visibleCols);
  rows = applySort(rows, state.sortModel, columnsByField);

  // Row grouping: replace the flat leaf list with a flattened tree of group
  // rows + the leaf rows of expanded groups. Aggregates are computed over each
  // group's leaves; pagination/windowing then run on the flattened list.
  const groupFields = (state.rowGroupCols || []).filter((f) => columnsByField[f]);
  if (groupFields.length) {
    const groupCols = groupFields.map((f) => columnsByField[f]);
    const { displayList, tree } = groupRows(
      rows, groupCols, columnsByField, state.aggModel, state.isGroupExpanded,
    );
    const paged = applyPagination(displayList, state.pagination);
    return {
      grouped: true,
      tree,
      leafCount: rows.length,
      grandTotals: computeAggregates(rows, state.aggModel, columnsByField),
      filteredSorted: displayList,
      ...paged,
    };
  }

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
