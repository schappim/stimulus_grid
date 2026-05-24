import { describe, it, expect } from 'vitest';
import {
  getValue,
  formatValue,
  applyFilters,
  applyQuickFilter,
  applySort,
  applyPagination,
  buildDisplayList,
  computeWindow,
  aggregateValue,
  computeAggregates,
  aggregateRange,
  groupRows,
} from '../src/lib/model.js';

/* ----------------------------------------------------------------------------
 * Shared fixtures
 * ------------------------------------------------------------------------- */

const athletes = [
  { id: 1, name: 'Alice', country: 'USA', gold: 3, born: '1990-05-01', active: true },
  { id: 2, name: 'Bob', country: 'Canada', gold: 0, born: '1985-12-20', active: false },
  { id: 3, name: 'Carlos', country: 'USA', gold: 10, born: '1992-01-15', active: true },
  { id: 4, name: 'Dana', country: 'Brazil', gold: 1, born: null, active: false },
];

// columnsByField map used by applyFilters / applySort. `filter` sets the filter
// op family; `type` drives sort comparison and value formatting.
const cols = {
  name: { field: 'name' },
  country: { field: 'country' },
  gold: { field: 'gold', filter: 'number', type: 'number' },
  born: { field: 'born', filter: 'date', type: 'date' },
  active: { field: 'active', filter: 'boolean', type: 'boolean' },
};

const ids = (rows) => rows.map((r) => r.id);

/* ----------------------------------------------------------------------------
 * getValue
 * ------------------------------------------------------------------------- */

describe('getValue', () => {
  it('reads a plain field', () => {
    expect(getValue({ a: 7 }, { field: 'a' })).toBe(7);
  });

  it('prefers a valueGetter over the field', () => {
    const col = { field: 'a', valueGetter: (row) => row.a * 2 };
    expect(getValue({ a: 7 }, col)).toBe(14);
  });

  it('returns undefined for a missing field or null row', () => {
    expect(getValue({}, { field: 'a' })).toBeUndefined();
    expect(getValue(null, { field: 'a' })).toBeUndefined();
  });
});

/* ----------------------------------------------------------------------------
 * formatValue
 * ------------------------------------------------------------------------- */

describe('formatValue', () => {
  it('renders null/undefined as an empty string', () => {
    expect(formatValue({ a: null }, { field: 'a' })).toBe('');
    expect(formatValue({}, { field: 'a' })).toBe('');
  });

  it('stringifies plain values', () => {
    expect(formatValue({ a: 42 }, { field: 'a' })).toBe('42');
  });

  it('renders booleans as a check mark or blank', () => {
    expect(formatValue({ a: true }, { field: 'a', type: 'boolean' })).toBe('✓');
    expect(formatValue({ a: false }, { field: 'a', type: 'boolean' })).toBe('');
  });

  it('localizes Date instances for date columns', () => {
    const d = new Date(2024, 0, 15);
    expect(formatValue({ a: d }, { field: 'a', type: 'date' })).toBe(d.toLocaleDateString());
  });

  it('does not localize non-Date values on date columns', () => {
    expect(formatValue({ a: '2024-01-15' }, { field: 'a', type: 'date' })).toBe('2024-01-15');
  });

  it('lets a valueFormatter win, even over the null short-circuit', () => {
    const col = { field: 'a', valueFormatter: (v) => (v == null ? 'N/A' : `$${v}`) };
    expect(formatValue({ a: 5 }, col)).toBe('$5');
    expect(formatValue({ a: null }, col)).toBe('N/A');
  });
});

/* ----------------------------------------------------------------------------
 * applyFilters
 * ------------------------------------------------------------------------- */

describe('applyFilters', () => {
  it('returns the input untouched when the model is empty or null', () => {
    expect(applyFilters(athletes, {}, cols)).toBe(athletes);
    expect(applyFilters(athletes, null, cols)).toBe(athletes);
  });

  it('matches text contains case-insensitively', () => {
    const out = applyFilters(athletes, { name: { type: 'contains', value: 'a' } }, cols);
    expect(ids(out)).toEqual([1, 3, 4]); // alice, carlos, dana
  });

  it('matches text equals case-insensitively', () => {
    const out = applyFilters(athletes, { country: { type: 'equals', value: 'usa' } }, cols);
    expect(ids(out)).toEqual([1, 3]);
  });

  it('applies number comparisons via the column filter family', () => {
    const out = applyFilters(athletes, { gold: { type: 'greaterThanOrEqual', value: 3 } }, cols);
    expect(ids(out)).toEqual([1, 3]);
  });

  it('supports number inRange with value2', () => {
    const out = applyFilters(athletes, { gold: { type: 'inRange', value: 1, value2: 3 } }, cols);
    expect(ids(out)).toEqual([1, 4]); // gold 3 and 1
  });

  it('honors filterType on the filter over the column default', () => {
    // gold column defaults to number, but a text "contains 1" should still work
    const out = applyFilters(athletes, { gold: { filterType: 'text', type: 'contains', value: '1' } }, cols);
    expect(ids(out)).toEqual([3, 4]); // "10" and "1"
  });

  it('matches boolean equals true/false', () => {
    expect(ids(applyFilters(athletes, { active: { type: 'equals', value: 'true' } }, cols))).toEqual([1, 3]);
    expect(ids(applyFilters(athletes, { active: { type: 'equals', value: 'false' } }, cols))).toEqual([2, 4]);
  });

  it('matches date inRange and excludes null dates', () => {
    const out = applyFilters(
      athletes,
      { born: { type: 'inRange', value: '1985-01-01', value2: '1991-01-01' } },
      cols,
    );
    expect(ids(out)).toEqual([1, 2]); // dana's null born is excluded
  });

  it('supports blank / notBlank', () => {
    expect(ids(applyFilters(athletes, { born: { type: 'blank' } }, cols))).toEqual([4]);
    expect(ids(applyFilters(athletes, { born: { type: 'notBlank' } }, cols))).toEqual([1, 2, 3]);
  });

  it('ANDs multiple column filters together', () => {
    const out = applyFilters(
      athletes,
      { country: { type: 'equals', value: 'usa' }, gold: { type: 'greaterThan', value: 5 } },
      cols,
    );
    expect(ids(out)).toEqual([3]); // USA AND gold>5 -> Carlos only
  });

  it('passes rows through for an unknown operator', () => {
    const out = applyFilters(athletes, { name: { type: 'noSuchOp', value: 'x' } }, cols);
    expect(ids(out)).toEqual([1, 2, 3, 4]);
  });

  it('passes rows through for a filter on an unknown column', () => {
    const out = applyFilters(athletes, { missing: { type: 'contains', value: 'z' } }, cols);
    expect(ids(out)).toEqual([1, 2, 3, 4]);
  });

  it('ignores null filter entries', () => {
    const out = applyFilters(athletes, { name: null, country: { type: 'equals', value: 'usa' } }, cols);
    expect(ids(out)).toEqual([1, 3]);
  });

  it('does not mutate the input array', () => {
    const copy = athletes.slice();
    applyFilters(athletes, { country: { type: 'equals', value: 'usa' } }, cols);
    expect(athletes).toEqual(copy);
  });
});

/* ----------------------------------------------------------------------------
 * applyQuickFilter
 * ------------------------------------------------------------------------- */

describe('applyQuickFilter', () => {
  const visible = [cols.name, cols.country, cols.gold, cols.active];

  it('returns the input untouched for an empty query', () => {
    expect(applyQuickFilter(athletes, '', visible)).toBe(athletes);
    expect(applyQuickFilter(athletes, null, visible)).toBe(athletes);
  });

  it('matches across visible columns, case-insensitively', () => {
    expect(ids(applyQuickFilter(athletes, 'usa', visible))).toEqual([1, 3]);
    expect(ids(applyQuickFilter(athletes, 'ALICE', visible))).toEqual([1]);
  });

  it('searches the formatted value, including numbers', () => {
    expect(ids(applyQuickFilter(athletes, '10', visible))).toEqual([3]);
  });

  it('searches the formatted boolean glyph', () => {
    // active=true formats to "✓"; only those rows match
    expect(ids(applyQuickFilter(athletes, '✓', visible))).toEqual([1, 3]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(applyQuickFilter(athletes, 'zzz', visible)).toEqual([]);
  });
});

/* ----------------------------------------------------------------------------
 * applySort
 * ------------------------------------------------------------------------- */

describe('applySort', () => {
  it('returns the input untouched for an empty model', () => {
    expect(applySort(athletes, [], cols)).toBe(athletes);
    expect(applySort(athletes, null, cols)).toBe(athletes);
  });

  it('sorts numbers ascending and descending', () => {
    expect(ids(applySort(athletes, [{ colId: 'gold', sort: 'asc' }], cols))).toEqual([2, 4, 1, 3]);
    expect(ids(applySort(athletes, [{ colId: 'gold', sort: 'desc' }], cols))).toEqual([3, 1, 4, 2]);
  });

  it('uses numeric-aware, case-insensitive string comparison', () => {
    const rows = [{ n: 'item10' }, { n: 'item2' }, { n: 'Item1' }];
    const c = { n: { field: 'n' } };
    const out = applySort(rows, [{ colId: 'n', sort: 'asc' }], c).map((r) => r.n);
    expect(out).toEqual(['Item1', 'item2', 'item10']);
  });

  it('orders nulls first when ascending', () => {
    const rows = [{ id: 1, g: 3 }, { id: 2, g: null }, { id: 3, g: 1 }];
    const c = { g: { field: 'g', type: 'number' } };
    expect(ids(applySort(rows, [{ colId: 'g', sort: 'asc' }], c))).toEqual([2, 3, 1]);
  });

  it('breaks ties with secondary sort keys', () => {
    // country asc, then gold desc within each country
    const out = applySort(
      athletes,
      [{ colId: 'country', sort: 'asc' }, { colId: 'gold', sort: 'desc' }],
      cols,
    );
    expect(ids(out)).toEqual([4, 2, 3, 1]); // Brazil, Canada, then USA(Carlos>Alice)
  });

  it('uses a column comparator (with row args) when provided', () => {
    const c = { gold: { field: 'gold', comparator: (a, b, ra, rb) => ra.id - rb.id } };
    // comparator sorts by id regardless of gold value
    expect(ids(applySort(athletes, [{ colId: 'gold', sort: 'asc' }], c))).toEqual([1, 2, 3, 4]);
  });

  it('does not mutate the input array', () => {
    const copy = athletes.slice();
    const out = applySort(athletes, [{ colId: 'gold', sort: 'asc' }], cols);
    expect(athletes).toEqual(copy);
    expect(out).not.toBe(athletes);
  });
});

/* ----------------------------------------------------------------------------
 * applyPagination
 * ------------------------------------------------------------------------- */

describe('applyPagination', () => {
  it('passes everything through when pagination is disabled', () => {
    const out = applyPagination(athletes, { enabled: false, pageSize: 2, page: 0 });
    expect(out.total).toBe(4);
    expect(out.pageRows).toBe(athletes);
  });

  it('passes everything through when pagination is absent', () => {
    const out = applyPagination(athletes, null);
    expect(out.total).toBe(4);
    expect(out.pageRows).toBe(athletes);
  });

  it('slices the requested page', () => {
    const p0 = applyPagination(athletes, { enabled: true, pageSize: 2, page: 0 });
    expect(p0.totalPages).toBe(2);
    expect(p0.page).toBe(0);
    expect(ids(p0.pageRows)).toEqual([1, 2]);

    const p1 = applyPagination(athletes, { enabled: true, pageSize: 2, page: 1 });
    expect(ids(p1.pageRows)).toEqual([3, 4]);
  });

  it('clamps an out-of-range page to the last page', () => {
    const out = applyPagination(athletes, { enabled: true, pageSize: 2, page: 99 });
    expect(out.page).toBe(1);
    expect(ids(out.pageRows)).toEqual([3, 4]);
  });

  it('handles a page size larger than the row count', () => {
    const out = applyPagination(athletes, { enabled: true, pageSize: 100, page: 0 });
    expect(out.totalPages).toBe(1);
    expect(ids(out.pageRows)).toEqual([1, 2, 3, 4]);
  });
});

/* ----------------------------------------------------------------------------
 * buildDisplayList
 * ------------------------------------------------------------------------- */

describe('buildDisplayList', () => {
  const columnDefs = [{ field: 'name' }, { field: 'country' }, { field: 'gold', type: 'number' }];

  it('runs the full client pipeline: filter -> sort -> paginate', () => {
    const out = buildDisplayList({
      columnDefs,
      rowData: athletes,
      filterModel: { country: { type: 'equals', value: 'USA' } },
      quickFilter: '',
      sortModel: [{ colId: 'gold', sort: 'desc' }],
      pagination: { enabled: true, pageSize: 1, page: 0 },
    });
    expect(ids(out.filteredSorted)).toEqual([3, 1]); // Carlos, Alice
    expect(ids(out.pageRows)).toEqual([3]); // first page = Carlos
    expect(out.total).toBe(2);
    expect(out.totalPages).toBe(2);
  });

  it('excludes hidden and checkbox columns from the quick filter', () => {
    const base = {
      rowData: [{ id: 1, name: 'Alice', secret: 'findme', sel: 'findme' }],
      filterModel: {},
      sortModel: [],
      pagination: { enabled: false },
      quickFilter: 'findme',
    };
    const hidden = buildDisplayList({ ...base, columnDefs: [{ field: 'name' }, { field: 'secret', hidden: true }] });
    expect(hidden.filteredSorted).toHaveLength(0);

    const checkbox = buildDisplayList({ ...base, columnDefs: [{ field: 'name' }, { field: 'sel', _isCheckbox: true }] });
    expect(checkbox.filteredSorted).toHaveLength(0);
  });

  it('bypasses the client pipeline in server-side mode', () => {
    const pageRows = athletes.slice(0, 3);
    const out = buildDisplayList({
      serverSide: true,
      rowData: pageRows,
      serverRowCount: 1000,
      pagination: { enabled: true, pageSize: 50, page: 2 },
      // a filter/sort that WOULD change things client-side, but must be ignored:
      filterModel: { name: { type: 'equals', value: 'NOPE' } },
      sortModel: [{ colId: 'name', sort: 'asc' }],
      columnDefs: [{ field: 'name' }],
    });
    expect(out.rows).toBe(pageRows); // untouched
    expect(out.pageRows).toBe(pageRows);
    expect(out.filteredSorted).toBe(pageRows);
    expect(out.total).toBe(1000);
    expect(out.totalPages).toBe(20); // ceil(1000 / 50)
    expect(out.page).toBe(2);
  });
});

/* ----------------------------------------------------------------------------
 * computeWindow
 * ------------------------------------------------------------------------- */

describe('computeWindow', () => {
  it('computes the window at the top with the default buffer', () => {
    // visible = ceil(300/30) = 10; first = max(0, 0 - 6) = 0; last = min(100, 0+10+12) = 22
    expect(computeWindow(0, 300, 30, 100)).toEqual({ first: 0, last: 22 });
  });

  it('shifts the window down as you scroll', () => {
    // floor(600/30) = 20; first = 20-6 = 14; last = min(100, 14+10+12) = 36
    expect(computeWindow(600, 300, 30, 100)).toEqual({ first: 14, last: 36 });
  });

  it('clamps the last index to the total row count', () => {
    // floor(3000/30) = 100; first = 94; last = min(100, 94+22) = 100
    expect(computeWindow(3000, 300, 30, 100)).toEqual({ first: 94, last: 100 });
  });

  it('respects a custom buffer of zero', () => {
    // first = max(0, floor(300/30) - 0) = 10; last = min(100, 10+10+0) = 20
    expect(computeWindow(300, 300, 30, 100, 0)).toEqual({ first: 10, last: 20 });
  });
});

/* ----------------------------------------------------------------------------
 * Grouping + aggregation
 * ------------------------------------------------------------------------- */

describe('aggregateValue', () => {
  const gold = { field: 'gold', type: 'number' };
  const name = { field: 'name' };

  it('counts leaves regardless of column', () => {
    expect(aggregateValue('count', athletes, name)).toBe(4);
    expect(aggregateValue('count', [], name)).toBe(0);
  });

  it('sums / averages / mins / maxes numeric columns', () => {
    expect(aggregateValue('sum', athletes, gold)).toBe(14); // 3+0+10+1
    expect(aggregateValue('avg', athletes, gold)).toBe(3.5);
    expect(aggregateValue('min', athletes, gold)).toBe(0);
    expect(aggregateValue('max', athletes, gold)).toBe(10);
  });

  it('skips non-numeric values in numeric aggregates', () => {
    expect(aggregateValue('sum', athletes, name)).toBe(0); // no numeric names
  });

  it('returns null for numeric aggregates over no numbers', () => {
    expect(aggregateValue('avg', [], gold)).toBeNull();
    expect(aggregateValue('min', [], gold)).toBeNull();
  });

  it('takes first / last in display order', () => {
    expect(aggregateValue('first', athletes, name)).toBe('Alice');
    expect(aggregateValue('last', athletes, name)).toBe('Dana');
  });
});

describe('computeAggregates', () => {
  it('aggregates each field by its declared func', () => {
    expect(computeAggregates(athletes, { gold: 'sum', name: 'count' }, cols)).toEqual({ gold: 14, name: 4 });
  });

  it('ignores fields with no matching column', () => {
    expect(computeAggregates(athletes, { nope: 'sum' }, cols)).toEqual({});
  });
});

describe('groupRows', () => {
  const allExpanded = () => true;

  it('groups by one column, key-sorted, each group followed by its leaves', () => {
    const { displayList } = groupRows(athletes, [cols.country], cols, { gold: 'sum' }, allExpanded);
    const shape = displayList.map((r) => (r.__sgGroup ? `G:${r.value}(${r.count})` : `L:${r.id}`));
    expect(shape).toEqual(['G:Brazil(1)', 'L:4', 'G:Canada(1)', 'L:2', 'G:USA(2)', 'L:1', 'L:3']);
  });

  it('computes per-group aggregates over the group leaves', () => {
    const { displayList } = groupRows(athletes, [cols.country], cols, { gold: 'sum' }, allExpanded);
    const usa = displayList.find((r) => r.__sgGroup && r.value === 'USA');
    expect(usa.aggregates).toEqual({ gold: 13 }); // Alice 3 + Carlos 10
  });

  it('omits leaves of a collapsed group but keeps the group row', () => {
    const collapseUSA = (groupId) => groupId !== 'country=USA';
    const { displayList } = groupRows(athletes, [cols.country], cols, {}, collapseUSA);
    const shape = displayList.map((r) => (r.__sgGroup ? `G:${r.value}` : `L:${r.id}`));
    expect(shape).toEqual(['G:Brazil', 'L:4', 'G:Canada', 'L:2', 'G:USA']); // no L:1 / L:3
  });

  it('supports multi-level grouping with stable nested group ids', () => {
    const { displayList } = groupRows(athletes, [cols.country, cols.active], cols, {}, allExpanded);
    const groups = displayList.filter((r) => r.__sgGroup);
    expect(groups).toHaveLength(6); // 3 level-0 + 3 level-1
    const usaActive = groups.find((g) => g.groupId === 'country=USA|active=true');
    expect(usaActive.level).toBe(1);
    expect(usaActive.count).toBe(2);
  });
});

describe('buildDisplayList (grouped)', () => {
  const columnDefs = [
    { field: 'name' }, { field: 'country' },
    { field: 'gold', type: 'number' }, { field: 'active', type: 'boolean' },
  ];
  const base = {
    columnDefs, rowData: athletes, filterModel: {}, quickFilter: '', sortModel: [],
    pagination: { enabled: false },
  };

  it('flattens groups into pageRows and reports grand totals', () => {
    const out = buildDisplayList({ ...base, rowGroupCols: ['country'], aggModel: { gold: 'sum' } });
    expect(out.grouped).toBe(true);
    expect(out.leafCount).toBe(4);
    expect(out.grandTotals).toEqual({ gold: 14 });
    expect(out.pageRows[0].__sgGroup).toBe(true);
    expect(out.pageRows[0].value).toBe('Brazil');
  });

  it('sorts leaves within each group by the sort model', () => {
    const out = buildDisplayList({
      ...base, rowGroupCols: ['country'], aggModel: {}, sortModel: [{ colId: 'gold', sort: 'desc' }],
    });
    const usaIdx = out.pageRows.findIndex((r) => r.__sgGroup && r.value === 'USA');
    expect(out.pageRows[usaIdx + 1].id).toBe(3); // Carlos (10)
    expect(out.pageRows[usaIdx + 2].id).toBe(1); // Alice (3)
  });

  it('honors isGroupExpanded to collapse groups', () => {
    const out = buildDisplayList({
      ...base, rowGroupCols: ['country'], aggModel: {},
      isGroupExpanded: (gid) => gid !== 'country=USA',
    });
    expect(out.pageRows.some((r) => r.__sgGroup && r.value === 'USA')).toBe(true);
    expect(out.pageRows.some((r) => !r.__sgGroup && (r.id === 1 || r.id === 3))).toBe(false);
  });

  it('drops groups left empty after filtering', () => {
    const out = buildDisplayList({
      ...base, rowGroupCols: ['country'], aggModel: {},
      filterModel: { gold: { filterType: 'number', type: 'greaterThan', value: 0 } },
    });
    expect(out.leafCount).toBe(3); // Bob (gold 0) filtered out
    expect(out.pageRows.some((r) => r.__sgGroup && r.value === 'Canada')).toBe(false);
    expect(out.pageRows.some((r) => r.__sgGroup && r.value === 'USA')).toBe(true);
  });
});

/* ----------------------------------------------------------------------------
 * aggregateRange — used by the status bar to summarise the cell selection
 * ------------------------------------------------------------------------- */

describe('aggregateRange', () => {
  it('returns all-null aggs and count=0 for an empty input', () => {
    expect(aggregateRange([])).toEqual({ count: 0, sum: null, avg: null, min: null, max: null });
  });

  it('counts and sums plain numbers', () => {
    expect(aggregateRange([1, 2, 3, 4])).toEqual({
      count: 4, sum: 10, avg: 2.5, min: 1, max: 4,
    });
  });

  it('parses numeric strings into the numeric aggs', () => {
    expect(aggregateRange(['1', ' 2 ', '3.5'])).toEqual({
      count: 3, sum: 6.5, avg: 6.5 / 3, min: 1, max: 3.5,
    });
  });

  it('skips empty values (null, undefined, "") from count and numeric aggs', () => {
    expect(aggregateRange([null, undefined, '', 0, 5])).toEqual({
      count: 2, sum: 5, avg: 2.5, min: 0, max: 5,
    });
  });

  it('counts non-numeric values but excludes them from numeric aggs', () => {
    expect(aggregateRange(['hello', true, false, 10, 20])).toEqual({
      count: 5, sum: 30, avg: 15, min: 10, max: 20,
    });
  });

  it('returns null numeric aggs when no numerics are present', () => {
    expect(aggregateRange(['a', 'b', true])).toEqual({
      count: 3, sum: null, avg: null, min: null, max: null,
    });
  });

  it('excludes NaN, Infinity, -Infinity, and Date instances from numeric aggs', () => {
    const d = new Date(2024, 0, 1);
    const out = aggregateRange([NaN, Infinity, -Infinity, d, 7]);
    expect(out.count).toBe(5);
    expect(out.sum).toBe(7);
    expect(out.min).toBe(7);
    expect(out.max).toBe(7);
  });
});
