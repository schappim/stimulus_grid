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

/* -------- Pivoting --------
 *
 * Pivot mode reshapes the data into a wide layout: unique combinations of one
 * or more `pivotCols` field values become columns, while `rowGroupCols` form
 * the rows. Each cell aggregates a value column over the rows that match its
 * (row group · pivot combo) bucket. Leaf rows are aggregated away — pivot
 * mode always shows group rows only (+ an "(All)" totals row at the top).
 *
 * The whole thing is pure: caller supplies filtered/sorted leaves + the col
 * defs + a list of value configs ({col, aggFunc}); we return the synthetic
 * pivot columns to render, the flattened display list, and the group tree. */

// Stable, unique synthetic field id for a pivot column. Encodes the pivot
// combo + the value field + the agg func, so different aggregations over the
// same value field produce distinct columns.
function pivotFieldId(combo, valueConfig, pivotCols) {
  const parts = pivotCols.map((c) => {
    const v = combo[c.field];
    return `${c.field}=${v == null ? '' : String(v)}`;
  });
  return `__p|${parts.join('|')}|${valueConfig.col.field}:${valueConfig.aggFunc}`;
}

// Bucket key for a single row's pivot combo. Uses U+001F (unit separator) as
// the delimiter so it can't collide with rendered values.
function pivotComboKey(row, pivotCols) {
  return pivotCols.map((c) => {
    const v = getValue(row, c);
    return v == null ? '' : String(v);
  }).join('\x1F');
}

// Returns the sorted, deduped list of pivot value combinations seen in `rows`.
// Each entry is an object keyed by pivot field, e.g. { sport: 'Swimming' } or
// { year: 2020, medal: 'Gold' }. Sorted by each pivot col in declaration order
// using the column's type-aware comparator.
export function collectPivotKeys(rows, pivotCols) {
  if (!pivotCols?.length) return [];
  const seen = new Map();
  for (const row of rows) {
    const k = pivotComboKey(row, pivotCols);
    if (!seen.has(k)) {
      const combo = {};
      pivotCols.forEach((c) => {
        const v = getValue(row, c);
        combo[c.field] = v == null ? null : v;
      });
      seen.set(k, combo);
    }
  }
  return Array.from(seen.values()).sort((a, b) => {
    for (const col of pivotCols) {
      const cmp = defaultComparator(a[col.field], b[col.field], col.type);
      if (cmp !== 0) return cmp;
    }
    return 0;
  });
}

// Build the synthetic column defs for a pivot. One column per
// (combo × valueConfig). Each col reads its value from row.__pivotValues[field].
// With a single value config, headers show just the combo (e.g. "Swimming");
// with several, they include the agg + value field ("Swimming · sum(gold)").
// Sortable: clicking a pivot column header sorts sibling group rows by that
// agg value (handled in buildPivotModel via sortModel; see siblingComparator).
export function buildPivotColumns(combos, valueConfigs, pivotCols) {
  if (!combos.length || !valueConfigs.length) return [];
  const cols = [];
  const single = valueConfigs.length === 1;
  for (const combo of combos) {
    for (const vc of valueConfigs) {
      const field = pivotFieldId(combo, vc, pivotCols);
      const comboLabel = pivotCols
        .map((c) => combo[c.field] == null ? '(Blank)' : String(combo[c.field]))
        .join(' · ');
      const headerName = single
        ? comboLabel
        : `${comboLabel} · ${vc.aggFunc}(${vc.col.field})`;
      cols.push({
        field,
        headerName,
        type: 'number',
        width: 100,
        sortable: true,
        filter: null,
        resizable: false,
        _isPivot: true,
        pivotKeys: { ...combo },
        valueField: vc.col.field,
        aggFunc: vc.aggFunc,
        valueGetter: (row) => row?.__pivotValues?.[field] ?? null,
      });
    }
  }
  return cols;
}

// Identify a synthetic pivot field id ("__p|...") quickly without parsing.
// Matches the encoding produced by pivotFieldId.
export function isPivotField(colId) {
  return typeof colId === 'string' && colId.startsWith('__p|');
}

// Comparator factory for sibling group nodes inside a pivot tree level.
// Entries in sortModel are walked in order: pivot-field entries compare
// the corresponding __pivotValues numerically; an entry whose colId matches
// the row-group field at this level compares the group `value` with its
// column type. Anything else is ignored at this level. The fallback (no
// sort entries match, or the matched entries all tie) is alphabetic by
// group value — the same behaviour the pivot tree had before sorting was
// wired up. Treating ties this way keeps the visual order stable when the
// user picks a pivot col whose agg values collide (lots of zeros, etc.).
function makePivotSiblingComparator(sortModel, levelCol) {
  const entries = Array.isArray(sortModel)
    ? sortModel.filter((e) => e && e.colId && e.sort) : [];
  return (a, b) => {
    for (const entry of entries) {
      const dir = entry.sort === 'desc' ? -1 : 1;
      if (isPivotField(entry.colId)) {
        const va = a.__pivotValues ? a.__pivotValues[entry.colId] : null;
        const vb = b.__pivotValues ? b.__pivotValues[entry.colId] : null;
        const cmp = defaultComparator(va, vb, 'number');
        if (cmp !== 0) return dir * cmp;
        continue;
      }
      if (levelCol && entry.colId === levelCol.field) {
        const cmp = defaultComparator(a.value, b.value, levelCol.type);
        if (cmp !== 0) return dir * cmp;
        continue;
      }
      // Sort entry targets some other column — irrelevant at this group level.
    }
    return defaultComparator(a.value, b.value, levelCol?.type);
  };
}

// Compute the __pivotValues map for a set of leaf rows: for each combo × value
// config, run the configured aggregator over the subset of leaves matching
// that combo. Buckets the leaves once up front so the loop is O(leaves + combos).
function computePivotValues(leaves, combos, valueConfigs, pivotCols) {
  const out = {};
  const buckets = new Map();
  for (const row of leaves) {
    const k = pivotComboKey(row, pivotCols);
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(row);
  }
  for (const combo of combos) {
    const k = pivotCols.map((c) => {
      const v = combo[c.field];
      return v == null ? '' : String(v);
    }).join('\x1F');
    const subset = buckets.get(k) || [];
    for (const vc of valueConfigs) {
      const field = pivotFieldId(combo, vc, pivotCols);
      // Empty intersections render as blanks (Excel/Sheets pivot convention),
      // not as 0 from sum-of-empty. Keeps the table visually quiet.
      out[field] = subset.length ? aggregateValue(vc.aggFunc, subset, vc.col) : null;
    }
  }
  return out;
}

// Build the pivot model: synthetic pivot columns + a flattened display list of
// group rows enriched with __pivotValues. A synthetic "(All)" row at the top
// holds totals across every leaf. Children honour `isExpanded(groupId, level)`.
// Without rowGroupCols, the only row is "(All)".
//
// `sortModel` (optional) lets pivot-column entries reorder sibling group nodes
// by their aggregate values: an entry whose colId is a synthetic pivot field
// sorts siblings by `node.__pivotValues[colId]`; an entry matching the row-
// group field at a level sorts that level by group value. The "(All)" totals
// row is emitted outside the tree walk so it stays pinned at the top
// regardless of the active sort.
export function buildPivotModel({ rows, rowGroupCols = [], pivotCols, valueConfigs, isExpanded = () => true, sortModel = [] }) {
  const combos = collectPivotKeys(rows, pivotCols);
  const columns = buildPivotColumns(combos, valueConfigs, pivotCols);

  const allRow = {
    __sgGroup: true,
    __pivotAll: true,
    level: -1,
    field: null,
    value: '(All)',
    groupId: '__pivotAll',
    count: rows.length,
    aggregates: {},
    leaves: rows,
    __pivotValues: computePivotValues(rows, combos, valueConfigs, pivotCols),
  };

  if (!rowGroupCols.length) {
    return { columns, displayList: [allRow], tree: [], combos };
  }

  const build = (leaves, level, parentId) => {
    const col = rowGroupCols[level];
    const buckets = new Map();
    for (const row of leaves) {
      const value = getValue(row, col);
      const k = value == null ? '' : String(value);
      if (!buckets.has(k)) buckets.set(k, { value, rows: [] });
      buckets.get(k).rows.push(row);
    }
    // Map each bucket to a fully-built node BEFORE sorting — the comparator
    // needs each node's __pivotValues to compare across pivot-col sorts.
    const nodes = Array.from(buckets.values()).map(({ value, rows: groupLeaves }) => {
      const keyStr = value == null ? '' : String(value);
      const groupId = parentId ? `${parentId}|${col.field}=${keyStr}` : `${col.field}=${keyStr}`;
      return {
        __sgGroup: true,
        level,
        field: col.field,
        value,
        groupId,
        count: groupLeaves.length,
        aggregates: {},
        leaves: groupLeaves,
        __pivotValues: computePivotValues(groupLeaves, combos, valueConfigs, pivotCols),
        children: level + 1 < rowGroupCols.length ? build(groupLeaves, level + 1, groupId) : null,
      };
    });
    const siblingCmp = makePivotSiblingComparator(sortModel, col);
    return nodes.sort(siblingCmp);
  };

  const tree = build(rows, 0, '');
  const out = [allRow];
  const walk = (nodes) => {
    for (const node of nodes) {
      out.push(node);
      if (!isExpanded(node.groupId, node.level)) continue;
      if (node.children) walk(node.children);
      // Leaves are intentionally not emitted — pivot mode aggregates them away.
    }
  };
  walk(tree);
  return { columns, displayList: out, tree, combos };
}

/* -------- Header layout (multi-row column header groups) --------
 *
 * Build an N×K matrix of header cells with colspan/rowspan, given the visible
 * columns and either user-declared `columnGroups` or auto-derived pivot groups
 * (built from each pivot col's `pivotKeys` + `valueField`/`aggFunc`). The
 * algorithm is intentionally simple — compute a "path" through the header rows
 * for each col (a sequence of group/leaf descriptors), then walk the matrix
 * row-by-row merging consecutive cols whose path-prefixes match.
 *
 * Pivot path shapes:
 *   1 pivot col, 1 value  → [leaf(pivotValue)]                       depth 1
 *   1 pivot col, M value  → [group(pivotValue), leaf(agg(field))]    depth 2
 *   N pivot cols, 1 value → [group, …, group, leaf(lastPivotValue)]  depth N
 *   N pivot cols, M value → [group, …, group, group, leaf(agg(f))]   depth N+1
 *
 * User-declared groups (v1: one level): each visible col can appear under at
 * most one group, declared as { headerName, children:[fieldNames] }. */

function colHeaderPath(col, { pivotCols = [], valueConfigs = [], columnGroups = null } = {}) {
  if (col._isPivot && pivotCols.length && col.pivotKeys) {
    return pivotColHeaderPath(col, pivotCols, valueConfigs);
  }
  if (columnGroups && Array.isArray(columnGroups) && columnGroups.length
      && !col._isGroupCol && !col._isCheckbox && !col._isRowNumber) {
    for (const g of columnGroups) {
      if (g?.children && g.children.includes(col.field)) {
        return [
          { kind: 'group', id: `g:${g.headerName}`, label: g.headerName },
          { kind: 'leaf', col },
        ];
      }
    }
  }
  return [{ kind: 'leaf', col }];
}

function pivotColHeaderPath(col, pivotCols, valueConfigs) {
  const multiValue = (valueConfigs?.length || 0) > 1;
  const path = [];
  for (let i = 0; i < pivotCols.length; i++) {
    const field = pivotCols[i].field;
    const val = col.pivotKeys[field];
    const isLastPivot = i === pivotCols.length - 1;
    // Last pivot field becomes the leaf when there's only one value config —
    // (saves a row, since "sum(gold)" is redundant when there's nothing else).
    if (isLastPivot && !multiValue) {
      path.push({ kind: 'leaf', col, label: val == null ? '(Blank)' : String(val) });
      return path;
    }
    path.push({
      kind: 'group',
      id: `p:${i}:${val == null ? '' : String(val)}`,
      label: val == null ? '(Blank)' : String(val),
    });
  }
  // Multi-value: the bottom row holds the value-field/agg as the leaf label.
  path.push({ kind: 'leaf', col, label: `${col.aggFunc}(${col.valueField})` });
  return path;
}

// Walk row-by-row, merging runs of cols whose path[0..r] match (same group ids
// up to row r). Leaves that land above the bottom row carry rowspan to fill
// the remainder.
export function buildHeaderLayout(visibleCols, opts = {}) {
  if (!visibleCols.length) return { rows: [[]], depth: 1 };
  const paths = visibleCols.map((c) => colHeaderPath(c, opts).slice());
  const depth = Math.max(1, ...paths.map((p) => p.length));
  const rows = [];

  for (let r = 0; r < depth; r++) {
    const row = [];
    let c = 0;
    while (c < paths.length) {
      const p = paths[c];
      if (r >= p.length || p[r] === null) { c += 1; continue; }
      const cell = p[r];
      if (cell.kind === 'leaf') {
        row.push({ kind: 'leaf', col: cell.col, label: cell.label, rowspan: depth - r, colspan: 1 });
        // Cells below this leaf in the same column are already covered.
        for (let rr = r + 1; rr < depth; rr++) p[rr] = null;
        c += 1;
        continue;
      }
      // Group cell — extend the run as long as the prefix + current id match.
      let end = c + 1;
      while (end < paths.length) {
        const pn = paths[end];
        if (r >= pn.length || !pn[r] || pn[r].kind !== 'group' || pn[r].id !== cell.id) break;
        let prefixMatches = true;
        for (let pr = 0; pr < r; pr++) {
          const a = p[pr]?.id ?? null;
          const b = pn[pr]?.id ?? null;
          if (a !== b) { prefixMatches = false; break; }
        }
        if (!prefixMatches) break;
        end += 1;
      }
      row.push({ kind: 'group', label: cell.label, colspan: end - c, rowspan: 1 });
      c = end;
    }
    rows.push(row);
  }
  return { rows, depth };
}

/* -------- Tree data (self-referential parent_id) --------
 *
 * Flatten a tree built from `parent_id`-style references into a display list of
 * the original row objects, plus a parallel `treeMeta` Map keyed by row id with
 * `{ level, hasChildren, expanded }`. We DON'T mutate user rows — the metadata
 * lives entirely in the sidecar Map, so callers can `JSON.stringify(row)` and
 * not see any of our scaffolding.
 *
 * Filter: a row is "kept" when it directly passes `passesFilter(row)` OR any
 * descendant does. So a search hit deep in the tree pulls its full ancestor
 * chain into the visible list (the user always sees the path to the match) —
 * AND, when a parent matches, its full subtree is shown (an intuitive "this
 * folder matched, here's what's inside"). When `passesFilter` is `null`, every
 * row passes (no filter active).
 *
 * Sort: siblings at each level are sorted by `siblingComparator(a, b)` when
 * supplied; otherwise input order is preserved.
 *
 * Cycles: detected via an ancestor chain set; a row already on the current
 * chain is skipped (so A → B → A produces a single A → B path, not infinite
 * recursion). Rows whose `parent_id` points at a non-existent / self id are
 * treated as roots.
 */
export function buildTreeDisplayList({
  rows,
  parentField = 'parent_id',
  getRowId = (r) => r?.id,
  passesFilter = null,
  siblingComparator = null,
  isExpanded = () => true,
} = {}) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { displayList: [], treeMeta: new Map() };
  }

  const idOf = (r) => {
    const id = getRowId(r);
    return id == null ? null : String(id);
  };

  // Index rows by id and bucket children by parent id.
  const byId = new Map();
  for (const r of rows) {
    const id = idOf(r);
    if (id != null) byId.set(id, r);
  }
  const childrenByParent = new Map();
  const roots = [];
  for (const r of rows) {
    const id = idOf(r);
    const pid = r?.[parentField];
    const pidStr = pid == null ? null : String(pid);
    // Roots: missing parent, self-referential, or parent id that isn't in the
    // dataset (orphan). Orphan-as-root means the user sees the row even if its
    // parent is filtered out upstream or just missing.
    if (pidStr == null || pidStr === id || !byId.has(pidStr)) {
      roots.push(r);
    } else {
      if (!childrenByParent.has(pidStr)) childrenByParent.set(pidStr, []);
      childrenByParent.get(pidStr).push(r);
    }
  }

  // Pre-compute direct matches when a filter is active; otherwise everything
  // is kept and we skip the per-row callback.
  const directMatch = passesFilter
    ? new Map(rows.map((r) => [idOf(r), !!passesFilter(r)]))
    : null;

  // descendantMatch[id] = does this row (or any descendant) directly match?
  // Computed lazily with cycle-safe DFS. Used to keep parents of matches in.
  const descendantMatch = new Map();
  const computeDescendantMatch = (r, chain) => {
    const id = idOf(r);
    if (id == null) return false;
    if (descendantMatch.has(id)) return descendantMatch.get(id);
    if (chain.has(id)) return false;            // cycle — stop the walk
    chain.add(id);
    let m = !!directMatch.get(id);
    const childs = childrenByParent.get(id) || [];
    for (const c of childs) m = computeDescendantMatch(c, chain) || m;
    chain.delete(id);
    descendantMatch.set(id, m);
    return m;
  };
  if (directMatch) {
    for (const r of roots) computeDescendantMatch(r, new Set());
  }

  const displayList = [];
  const treeMeta = new Map();

  // `ancestorMatched` is true when any ancestor of the current row directly
  // matched the filter — in that case its entire subtree is shown ("this
  // folder matched, here's what's inside"). When false, we still show a row
  // if it (or a descendant) matches, so the path to a deeper match is
  // preserved.
  const walk = (siblings, level, chain, ancestorMatched) => {
    const kept = directMatch
      ? siblings.filter((r) => ancestorMatched || descendantMatch.get(idOf(r)))
      : siblings.slice();
    if (siblingComparator) kept.sort(siblingComparator);
    for (const r of kept) {
      const id = idOf(r);
      if (id == null || chain.has(id)) continue;
      const allChildren = childrenByParent.get(id) || [];
      const childAncestorMatched = ancestorMatched
        || (directMatch ? !!directMatch.get(id) : false);
      const visibleChildren = directMatch
        ? allChildren.filter((c) => childAncestorMatched || descendantMatch.get(idOf(c)))
        : allChildren;
      const hasChildren = visibleChildren.length > 0;
      // When a filter is active, force every kept row open so matches deeper
      // in the tree stay reachable without manual expansion. Otherwise honour
      // the caller's isExpanded predicate.
      const expanded = hasChildren && (directMatch ? true : !!isExpanded(id, level));
      treeMeta.set(id, { level, hasChildren, expanded });
      displayList.push(r);
      if (expanded) {
        chain.add(id);
        walk(visibleChildren, level + 1, chain, childAncestorMatched);
        chain.delete(id);
      }
    }
  };
  walk(roots, 0, new Set(), false);

  return { displayList, treeMeta };
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

  // Tree data mode: rows reference each other via parent_id (or whichever
  // field `treeParentField` names). The tree itself is the source of truth, so
  // filter/sort run *inside* the flatten — filtering with ancestor preservation
  // (matches pull their parents into view), sort applied per-sibling-set. This
  // path is mutually exclusive with pivot mode and explicit rowGroupCols (both
  // assume a flat dataset).
  const groupFieldsForTree = (state.rowGroupCols || []).filter((f) => columnsByField[f]);
  if (state.treeData && !state.pivotMode && groupFieldsForTree.length === 0) {
    const parentField = state.treeParentField || 'parent_id';
    const filterEntries = Object.entries(state.filterModel || {}).filter(([, f]) => f != null);
    const q = state.quickFilter ? String(state.quickFilter).toLowerCase() : '';
    const filterActive = filterEntries.length > 0 || q !== '';
    const rowPasses = filterActive
      ? (row) => {
          for (const [colId, f] of filterEntries) {
            const col = columnsByField[colId];
            if (col && !passesFilter(row, col, f)) return false;
          }
          if (q) {
            let any = false;
            for (const col of visibleCols) {
              const v = formatValue(row, col);
              if (v && String(v).toLowerCase().includes(q)) { any = true; break; }
            }
            if (!any) return false;
          }
          return true;
        }
      : null;
    const sortEntries = Array.isArray(state.sortModel) ? state.sortModel : [];
    const siblingComparator = sortEntries.length
      ? (a, b) => {
          for (const { colId, sort } of sortEntries) {
            const col = columnsByField[colId];
            if (!col) continue;
            const va = getValue(a, col);
            const vb = getValue(b, col);
            const cmp = typeof col.comparator === 'function'
              ? col.comparator(va, vb, a, b)
              : defaultComparator(va, vb, col.type);
            if (cmp !== 0) return sort === 'desc' ? -cmp : cmp;
          }
          return 0;
        }
      : null;
    const getRowId = state.getRowId || ((r) => r?.id);
    const { displayList, treeMeta } = buildTreeDisplayList({
      rows: state.rowData,
      parentField,
      getRowId,
      passesFilter: rowPasses,
      siblingComparator,
      isExpanded: state.isTreeRowExpanded || (() => true),
    });
    const paged = applyPagination(displayList, state.pagination);
    return {
      tree: true,
      treeData: true,
      treeMeta,
      treeParentField: parentField,
      filteredSorted: displayList,
      ...paged,
    };
  }

  let rows = state.rowData;
  rows = applyFilters(rows, state.filterModel, columnsByField);
  rows = applyQuickFilter(rows, state.quickFilter, visibleCols);
  rows = applySort(rows, state.sortModel, columnsByField);

  const groupFields = groupFieldsForTree;

  // Pivot mode: reshape into a wide layout, with rowGroupCols on the vertical
  // axis and unique pivot combos on the horizontal. Requires at least one
  // pivot col and at least one value column (aggModel entry); otherwise we
  // silently fall through to plain grouping below.
  const pivotFields = state.pivotMode
    ? (state.pivotCols || []).filter((f) => columnsByField[f]) : [];
  const valueConfigs = state.pivotMode
    ? Object.entries(state.aggModel || {})
        .filter(([f]) => columnsByField[f])
        .map(([f, aggFunc]) => ({ col: columnsByField[f], aggFunc }))
    : [];
  if (state.pivotMode && pivotFields.length && valueConfigs.length) {
    const rowGroupColDefs = groupFields.map((f) => columnsByField[f]);
    const pivotColDefs = pivotFields.map((f) => columnsByField[f]);
    const { columns: pivotResultColumns, displayList, tree, combos } = buildPivotModel({
      rows,
      rowGroupCols: rowGroupColDefs,
      pivotCols: pivotColDefs,
      valueConfigs,
      isExpanded: state.isGroupExpanded,
      sortModel: state.sortModel,
    });
    const paged = applyPagination(displayList, state.pagination);
    return {
      pivot: true,
      pivotResultColumns,
      combos,
      grouped: true,
      tree,
      leafCount: rows.length,
      grandTotals: computeAggregates(rows, state.aggModel, columnsByField),
      filteredSorted: displayList,
      ...paged,
    };
  }

  // Row grouping: replace the flat leaf list with a flattened tree of group
  // rows + the leaf rows of expanded groups. Aggregates are computed over each
  // group's leaves; pagination/windowing then run on the flattened list.
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
  // Compute grand totals on the flat path too (when aggModel has any entries),
  // so a pinned bottom row can render even outside grouped/pivot views.
  const grandTotals = state.aggModel && Object.keys(state.aggModel).length
    ? computeAggregates(rows, state.aggModel, columnsByField) : null;
  return { filteredSorted: rows, grandTotals, ...paged };
}

/* -------- Virtual window -------- */

export function computeWindow(scrollTop, viewportHeight, rowHeight, totalRows, buffer = 6) {
  const visible = Math.ceil(viewportHeight / rowHeight);
  const first = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const last = Math.min(totalRows, first + visible + buffer * 2);
  return { first, last };
}
