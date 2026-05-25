var Ji = Object.defineProperty;
var Qi = (t, s, e) => s in t ? Ji(t, s, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[s] = e;
var H = (t, s, e) => Qi(t, typeof s != "symbol" ? s + "" : s, e);
import { Controller as ie, Application as eo } from "@hotwired/stimulus";
function j(t, s) {
  return typeof s.valueGetter == "function" ? s.valueGetter(t) : t?.[s.field];
}
function ne(t, s) {
  const e = j(t, s);
  return typeof s.valueFormatter == "function" ? s.valueFormatter(e, t) : e == null ? "" : s.type === "date" && e instanceof Date ? e.toLocaleDateString() : s.type === "boolean" ? e ? "✓" : "" : String(e);
}
const un = {
  contains: (t, s) => String(t ?? "").toLowerCase().includes(String(s ?? "").toLowerCase()),
  notContains: (t, s) => !String(t ?? "").toLowerCase().includes(String(s ?? "").toLowerCase()),
  equals: (t, s) => String(t ?? "").toLowerCase() === String(s ?? "").toLowerCase(),
  notEqual: (t, s) => String(t ?? "").toLowerCase() !== String(s ?? "").toLowerCase(),
  startsWith: (t, s) => String(t ?? "").toLowerCase().startsWith(String(s ?? "").toLowerCase()),
  endsWith: (t, s) => String(t ?? "").toLowerCase().endsWith(String(s ?? "").toLowerCase()),
  blank: (t) => t == null || t === "",
  notBlank: (t) => t != null && t !== ""
}, to = {
  equals: (t, s) => Number(t) === Number(s),
  notEqual: (t, s) => Number(t) !== Number(s),
  lessThan: (t, s) => Number(t) < Number(s),
  lessThanOrEqual: (t, s) => Number(t) <= Number(s),
  greaterThan: (t, s) => Number(t) > Number(s),
  greaterThanOrEqual: (t, s) => Number(t) >= Number(s),
  inRange: (t, s, e) => Number(t) >= Number(s) && Number(t) <= Number(e),
  blank: (t) => t == null || t === "",
  notBlank: (t) => t != null && t !== ""
};
function Y(t) {
  if (t == null || t === "") return null;
  if (t instanceof Date) return t;
  const s = new Date(t);
  return Number.isNaN(s.valueOf()) ? null : s;
}
const no = {
  equals: (t, s) => Y(t)?.toDateString() === Y(s)?.toDateString(),
  notEqual: (t, s) => Y(t)?.toDateString() !== Y(s)?.toDateString(),
  lessThan: (t, s) => (Y(t)?.valueOf() ?? -1 / 0) < (Y(s)?.valueOf() ?? 1 / 0),
  greaterThan: (t, s) => (Y(t)?.valueOf() ?? 1 / 0) > (Y(s)?.valueOf() ?? -1 / 0),
  inRange: (t, s, e) => {
    const n = Y(t)?.valueOf();
    return n != null && n >= (Y(s)?.valueOf() ?? -1 / 0) && n <= (Y(e)?.valueOf() ?? 1 / 0);
  },
  blank: (t) => t == null || t === "",
  notBlank: (t) => t != null && t !== ""
}, ro = {
  equals: (t, s) => s === "true" ? !!t : s === "false" ? !t : !0
}, so = {
  in: (t, s) => Array.isArray(s) && s.includes(String(t ?? ""))
}, io = { text: un, number: to, date: no, boolean: ro, set: so };
function pn(t, s, e) {
  if (!e) return !0;
  const n = e.filterType || s.filter || "text", i = (io[n] || un)[e.type];
  if (!i) return !0;
  const o = j(t, s);
  return i(o, e.value, e.value2);
}
function fn(t, s, e) {
  const n = Object.entries(s || {}).filter(([, r]) => r != null);
  return n.length === 0 ? t : t.filter((r) => r && r.__sgSeparator ? !0 : n.every(([i, o]) => {
    const a = e[i];
    return a ? pn(r, a, o) : !0;
  }));
}
function gn(t, s, e) {
  if (!s) return t;
  const n = String(s).toLowerCase();
  return t.filter((r) => {
    if (r && r.__sgSeparator) return !0;
    for (const i of e) {
      const o = ne(r, i);
      if (o && String(o).toLowerCase().includes(n)) return !0;
    }
    return !1;
  });
}
function se(t, s, e) {
  if (t == null && s == null) return 0;
  if (t == null) return -1;
  if (s == null) return 1;
  if (e === "number") return Number(t) - Number(s);
  if (e === "date") {
    const n = Y(t)?.valueOf() ?? 0, r = Y(s)?.valueOf() ?? 0;
    return n - r;
  }
  return e === "boolean" ? t === s ? 0 : t ? 1 : -1 : String(t).localeCompare(String(s), void 0, { numeric: !0, sensitivity: "base" });
}
function oo(t, s, e) {
  if (!s || s.length === 0) return t;
  const n = (l, c) => {
    for (const { colId: d, sort: p } of s) {
      const f = e[d];
      if (!f) continue;
      const g = j(l, f), h = j(c, f), b = typeof f.comparator == "function" ? f.comparator(g, h, l, c) : se(g, h, f.type);
      if (b !== 0) return p === "desc" ? -b : b;
    }
    return 0;
  };
  if (!t.some((l) => l && l.__sgSeparator)) return t.slice().sort(n);
  const i = [];
  let o = [];
  const a = () => {
    if (o.length) {
      o.sort(n);
      for (const l of o) i.push(l);
      o = [];
    }
  };
  for (const l of t)
    l && l.__sgSeparator ? (a(), i.push(l)) : o.push(l);
  return a(), i;
}
function Ee(t, s) {
  if (!s || !s.enabled) return { rows: t, total: t.length, pageRows: t };
  const e = t.length, n = Math.max(1, Math.ceil(e / s.pageSize)), r = Math.min(s.page, n - 1), i = r * s.pageSize, o = t.slice(i, i + s.pageSize);
  return { rows: t, total: e, totalPages: n, page: r, pageRows: o };
}
function hn(t, s, e) {
  if (t === "count") return s.length;
  const n = s.map((i) => j(i, e));
  if (t === "first") return n.length ? n[0] : null;
  if (t === "last") return n.length ? n[n.length - 1] : null;
  const r = n.map(Number).filter((i) => !Number.isNaN(i));
  switch (t) {
    case "sum":
      return r.reduce((i, o) => i + o, 0);
    case "avg":
      return r.length ? r.reduce((i, o) => i + o, 0) / r.length : null;
    case "min":
      return r.length ? Math.min(...r) : null;
    case "max":
      return r.length ? Math.max(...r) : null;
    default:
      return null;
  }
}
function Ve(t, s, e) {
  const n = {};
  for (const [r, i] of Object.entries(s || {})) {
    const o = e[r];
    o && (n[r] = hn(i, t, o));
  }
  return n;
}
function ao(t) {
  let s = 0, e = 0, n = 0, r = 1 / 0, i = -1 / 0;
  for (const o of t) {
    if (o == null || o === "") continue;
    s += 1;
    let a = null;
    if (typeof o == "number" && Number.isFinite(o)) a = o;
    else if (typeof o == "string" && o.trim() !== "") {
      const l = Number(o);
      Number.isFinite(l) && (a = l);
    }
    a != null && (e += 1, n += a, a < r && (r = a), a > i && (i = a));
  }
  return {
    count: s,
    sum: e ? n : null,
    avg: e ? n / e : null,
    min: e ? r : null,
    max: e ? i : null
  };
}
function lo(t, s, e, n, r = () => !0) {
  const i = (c, d, p) => {
    const f = s[d], g = /* @__PURE__ */ new Map();
    for (const h of c) {
      const b = j(h, f), m = b == null ? "" : String(b);
      g.has(m) || g.set(m, { value: b, rows: [] }), g.get(m).rows.push(h);
    }
    return Array.from(g.values()).sort((h, b) => se(h.value, b.value, f.type)).map(({ value: h, rows: b }) => {
      const m = h == null ? "" : String(h), _ = p ? `${p}|${f.field}=${m}` : `${f.field}=${m}`;
      return {
        __sgGroup: !0,
        level: d,
        field: f.field,
        value: h,
        groupId: _,
        count: b.length,
        aggregates: Ve(b, n, e),
        leaves: b,
        children: d + 1 < s.length ? i(b, d + 1, _) : null
      };
    });
  }, o = i(t, 0, ""), a = [], l = (c) => {
    for (const d of c)
      if (a.push(d), !!r(d.groupId, d.level))
        if (d.children) l(d.children);
        else for (const p of d.leaves) a.push(p);
  };
  return l(o), { displayList: a, tree: o };
}
function mn(t, s, e) {
  return `__p|${e.map((r) => {
    const i = t[r.field];
    return `${r.field}=${i == null ? "" : String(i)}`;
  }).join("|")}|${s.col.field}:${s.aggFunc}`;
}
function bn(t, s) {
  return s.map((e) => {
    const n = j(t, e);
    return n == null ? "" : String(n);
  }).join("");
}
function co(t, s) {
  if (!s?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const n of t) {
    const r = bn(n, s);
    if (!e.has(r)) {
      const i = {};
      s.forEach((o) => {
        const a = j(n, o);
        i[o.field] = a ?? null;
      }), e.set(r, i);
    }
  }
  return Array.from(e.values()).sort((n, r) => {
    for (const i of s) {
      const o = se(n[i.field], r[i.field], i.type);
      if (o !== 0) return o;
    }
    return 0;
  });
}
function uo(t, s, e) {
  if (!t.length || !s.length) return [];
  const n = [], r = s.length === 1;
  for (const i of t)
    for (const o of s) {
      const a = mn(i, o, e), l = e.map((d) => i[d.field] == null ? "(Blank)" : String(i[d.field])).join(" · "), c = r ? l : `${l} · ${o.aggFunc}(${o.col.field})`;
      n.push({
        field: a,
        headerName: c,
        type: "number",
        width: 100,
        sortable: !0,
        filter: null,
        resizable: !1,
        _isPivot: !0,
        pivotKeys: { ...i },
        valueField: o.col.field,
        aggFunc: o.aggFunc,
        valueGetter: (d) => d?.__pivotValues?.[a] ?? null
      });
    }
  return n;
}
function po(t) {
  return typeof t == "string" && t.startsWith("__p|");
}
function fo(t, s) {
  const e = Array.isArray(t) ? t.filter((n) => n && n.colId && n.sort) : [];
  return (n, r) => {
    for (const i of e) {
      const o = i.sort === "desc" ? -1 : 1;
      if (po(i.colId)) {
        const a = n.__pivotValues ? n.__pivotValues[i.colId] : null, l = r.__pivotValues ? r.__pivotValues[i.colId] : null, c = se(a, l, "number");
        if (c !== 0) return o * c;
        continue;
      }
      if (s && i.colId === s.field) {
        const a = se(n.value, r.value, s.type);
        if (a !== 0) return o * a;
        continue;
      }
    }
    return se(n.value, r.value, s?.type);
  };
}
function Ot(t, s, e, n) {
  const r = {}, i = /* @__PURE__ */ new Map();
  for (const o of t) {
    const a = bn(o, n);
    i.has(a) || i.set(a, []), i.get(a).push(o);
  }
  for (const o of s) {
    const a = n.map((c) => {
      const d = o[c.field];
      return d == null ? "" : String(d);
    }).join(""), l = i.get(a) || [];
    for (const c of e) {
      const d = mn(o, c, n);
      r[d] = l.length ? hn(c.aggFunc, l, c.col) : null;
    }
  }
  return r;
}
function go({ rows: t, rowGroupCols: s = [], pivotCols: e, valueConfigs: n, isExpanded: r = () => !0, sortModel: i = [] }) {
  const o = co(t, e), a = uo(o, n, e), l = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: t.length,
    aggregates: {},
    leaves: t,
    __pivotValues: Ot(t, o, n, e)
  };
  if (!s.length)
    return { columns: a, displayList: [l], tree: [], combos: o };
  const c = (g, h, b) => {
    const m = s[h], _ = /* @__PURE__ */ new Map();
    for (const x of g) {
      const S = j(x, m), N = S == null ? "" : String(S);
      _.has(N) || _.set(N, { value: S, rows: [] }), _.get(N).rows.push(x);
    }
    const y = Array.from(_.values()).map(({ value: x, rows: S }) => {
      const N = x == null ? "" : String(x), T = b ? `${b}|${m.field}=${N}` : `${m.field}=${N}`;
      return {
        __sgGroup: !0,
        level: h,
        field: m.field,
        value: x,
        groupId: T,
        count: S.length,
        aggregates: {},
        leaves: S,
        __pivotValues: Ot(S, o, n, e),
        children: h + 1 < s.length ? c(S, h + 1, T) : null
      };
    }), w = fo(i, m);
    return y.sort(w);
  }, d = c(t, 0, ""), p = [l], f = (g) => {
    for (const h of g)
      p.push(h), r(h.groupId, h.level) && h.children && f(h.children);
  };
  return f(d), { columns: a, displayList: p, tree: d, combos: o };
}
function ho(t, { pivotCols: s = [], valueConfigs: e = [], columnGroups: n = null } = {}) {
  if (t._isPivot && s.length && t.pivotKeys)
    return mo(t, s, e);
  if (n && Array.isArray(n) && n.length && !t._isGroupCol && !t._isCheckbox && !t._isRowNumber) {
    for (const r of n)
      if (r?.children && r.children.includes(t.field))
        return [
          { kind: "group", id: `g:${r.headerName}`, label: r.headerName },
          { kind: "leaf", col: t }
        ];
  }
  return [{ kind: "leaf", col: t }];
}
function mo(t, s, e) {
  const n = (e?.length || 0) > 1, r = [];
  for (let i = 0; i < s.length; i++) {
    const o = s[i].field, a = t.pivotKeys[o];
    if (i === s.length - 1 && !n)
      return r.push({ kind: "leaf", col: t, label: a == null ? "(Blank)" : String(a) }), r;
    r.push({
      kind: "group",
      id: `p:${i}:${a == null ? "" : String(a)}`,
      label: a == null ? "(Blank)" : String(a)
    });
  }
  return r.push({ kind: "leaf", col: t, label: `${t.aggFunc}(${t.valueField})` }), r;
}
function bo(t, s = {}) {
  if (!t.length) return { rows: [[]], depth: 1 };
  const e = t.map((i) => ho(i, s).slice()), n = Math.max(1, ...e.map((i) => i.length)), r = [];
  for (let i = 0; i < n; i++) {
    const o = [];
    let a = 0;
    for (; a < e.length; ) {
      const l = e[a];
      if (i >= l.length || l[i] === null) {
        a += 1;
        continue;
      }
      const c = l[i];
      if (c.kind === "leaf") {
        o.push({ kind: "leaf", col: c.col, label: c.label, rowspan: n - i, colspan: 1 });
        for (let p = i + 1; p < n; p++) l[p] = null;
        a += 1;
        continue;
      }
      let d = a + 1;
      for (; d < e.length; ) {
        const p = e[d];
        if (i >= p.length || !p[i] || p[i].kind !== "group" || p[i].id !== c.id) break;
        let f = !0;
        for (let g = 0; g < i; g++) {
          const h = l[g]?.id ?? null, b = p[g]?.id ?? null;
          if (h !== b) {
            f = !1;
            break;
          }
        }
        if (!f) break;
        d += 1;
      }
      o.push({ kind: "group", label: c.label, colspan: d - a, rowspan: 1 }), a = d;
    }
    r.push(o);
  }
  return { rows: r, depth: n };
}
function yo({
  rows: t,
  parentField: s = "parent_id",
  getRowId: e = (o) => o?.id,
  passesFilter: n = null,
  siblingComparator: r = null,
  isExpanded: i = () => !0
} = {}) {
  if (!Array.isArray(t) || t.length === 0)
    return { displayList: [], treeMeta: /* @__PURE__ */ new Map() };
  const o = (m) => {
    const _ = e(m);
    return _ == null ? null : String(_);
  }, a = /* @__PURE__ */ new Map();
  for (const m of t) {
    const _ = o(m);
    _ != null && a.set(_, m);
  }
  const l = /* @__PURE__ */ new Map(), c = [];
  for (const m of t) {
    const _ = o(m), y = m?.[s], w = y == null ? null : String(y);
    w == null || w === _ || !a.has(w) ? c.push(m) : (l.has(w) || l.set(w, []), l.get(w).push(m));
  }
  const d = n ? new Map(t.map((m) => [o(m), !!n(m)])) : null, p = /* @__PURE__ */ new Map(), f = (m, _) => {
    const y = o(m);
    if (y == null) return !1;
    if (p.has(y)) return p.get(y);
    if (_.has(y)) return !1;
    _.add(y);
    let w = !!d.get(y);
    const x = l.get(y) || [];
    for (const S of x) w = f(S, _) || w;
    return _.delete(y), p.set(y, w), w;
  };
  if (d)
    for (const m of c) f(m, /* @__PURE__ */ new Set());
  const g = [], h = /* @__PURE__ */ new Map(), b = (m, _, y, w) => {
    const x = d ? m.filter((S) => w || p.get(o(S))) : m.slice();
    r && x.sort(r);
    for (const S of x) {
      const N = o(S);
      if (N == null || y.has(N)) continue;
      const T = l.get(N) || [], k = w || (d ? !!d.get(N) : !1), $ = d ? T.filter((V) => k || p.get(o(V))) : T, M = $.length > 0, D = M && (d ? !0 : !!i(N, _));
      h.set(N, { level: _, hasChildren: M, expanded: D }), g.push(S), D && (y.add(N), b($, _ + 1, y, k), y.delete(N));
    }
  };
  return b(c, 0, /* @__PURE__ */ new Set(), !1), { displayList: g, treeMeta: h };
}
function wo(t) {
  if (t.serverSide) {
    const d = t.rowData, p = t.pagination?.pageSize || d.length || 1, f = t.serverRowCount ?? d.length, g = Math.max(1, Math.ceil(f / p)), h = Math.min(t.pagination?.page || 0, g - 1);
    return { filteredSorted: d, rows: d, total: f, totalPages: g, page: h, pageRows: d };
  }
  const s = Object.fromEntries(t.columnDefs.map((d) => [d.field, d])), e = t.columnDefs.filter((d) => !d.hidden && !d._isCheckbox), n = (t.rowGroupCols || []).filter((d) => s[d]);
  if (t.treeData && !t.pivotMode && n.length === 0) {
    const d = t.treeParentField || "parent_id", p = Object.entries(t.filterModel || {}).filter(([, S]) => S != null), f = t.quickFilter ? String(t.quickFilter).toLowerCase() : "", h = p.length > 0 || f !== "" ? (S) => {
      for (const [N, T] of p) {
        const k = s[N];
        if (k && !pn(S, k, T)) return !1;
      }
      if (f) {
        let N = !1;
        for (const T of e) {
          const k = ne(S, T);
          if (k && String(k).toLowerCase().includes(f)) {
            N = !0;
            break;
          }
        }
        if (!N) return !1;
      }
      return !0;
    } : null, b = Array.isArray(t.sortModel) ? t.sortModel : [], m = b.length ? (S, N) => {
      for (const { colId: T, sort: k } of b) {
        const $ = s[T];
        if (!$) continue;
        const M = j(S, $), D = j(N, $), V = typeof $.comparator == "function" ? $.comparator(M, D, S, N) : se(M, D, $.type);
        if (V !== 0) return k === "desc" ? -V : V;
      }
      return 0;
    } : null, _ = t.getRowId || ((S) => S?.id), { displayList: y, treeMeta: w } = yo({
      rows: t.rowData,
      parentField: d,
      getRowId: _,
      passesFilter: h,
      siblingComparator: m,
      isExpanded: t.isTreeRowExpanded || (() => !0)
    }), x = Ee(y, t.pagination);
    return {
      tree: !0,
      treeData: !0,
      treeMeta: w,
      treeParentField: d,
      filteredSorted: y,
      ...x
    };
  }
  let r = t.rowData;
  r = fn(r, t.filterModel, s), r = gn(r, t.quickFilter, e), r = oo(r, t.sortModel, s);
  const i = n, o = t.pivotMode ? (t.pivotCols || []).filter((d) => s[d]) : [], a = t.pivotMode ? Object.entries(t.aggModel || {}).filter(([d]) => s[d]).map(([d, p]) => ({ col: s[d], aggFunc: p })) : [];
  if (t.pivotMode && o.length && a.length) {
    const d = i.map((_) => s[_]), p = o.map((_) => s[_]), { columns: f, displayList: g, tree: h, combos: b } = go({
      rows: r,
      rowGroupCols: d,
      pivotCols: p,
      valueConfigs: a,
      isExpanded: t.isGroupExpanded,
      sortModel: t.sortModel
    }), m = Ee(g, t.pagination);
    return {
      pivot: !0,
      pivotResultColumns: f,
      combos: b,
      grouped: !0,
      tree: h,
      leafCount: r.length,
      grandTotals: Ve(r, t.aggModel, s),
      filteredSorted: g,
      ...m
    };
  }
  if (i.length) {
    const d = i.map((h) => s[h]), { displayList: p, tree: f } = lo(
      r,
      d,
      s,
      t.aggModel,
      t.isGroupExpanded
    ), g = Ee(p, t.pagination);
    return {
      grouped: !0,
      tree: f,
      leafCount: r.length,
      grandTotals: Ve(r, t.aggModel, s),
      filteredSorted: p,
      ...g
    };
  }
  const l = Ee(r, t.pagination), c = t.aggModel && Object.keys(t.aggModel).length ? Ve(r, t.aggModel, s) : null;
  return { filteredSorted: r, grandTotals: c, ...l };
}
function vo(t, s, e, n, r = 6) {
  const i = Math.ceil(s / e), o = Math.max(0, Math.floor(t / e) - r), a = Math.min(n, o + i + r * 2);
  return { first: o, last: a };
}
function _o(t) {
  return {
    // ---- Data ----
    setRowData(s) {
      t.setRowData(s);
    },
    getRowData() {
      return t.state.rowData.slice();
    },
    applyTransaction(s) {
      return t.applyTransaction(s);
    },
    // Server-side row model
    setRowCount(s) {
      t.setRowCount(s);
    },
    getRowCount() {
      return t.state.serverSide ? t.state.serverRowCount : t.state.rowData.length;
    },
    isServerSide() {
      return !!t.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(s) {
      t.setColumnDefs(s);
    },
    getColumnDefs() {
      return t.state.columnDefs.slice();
    },
    setColumnVisible(s, e) {
      t.setColumnVisible(s, e);
    },
    setColumnPinned(s, e) {
      t.setColumnPinned(s, e);
    },
    setColumnWidth(s, e) {
      t.setColumnWidth(s, e);
    },
    moveColumn(s, e) {
      t.moveColumn(s, e);
    },
    autoSizeColumn(s) {
      t.autoSizeColumn(s);
    },
    autoSizeAllColumns() {
      t.state.columnDefs.forEach((s) => t.autoSizeColumn(s.field));
    },
    sizeColumnsToFit() {
      t.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(s) {
      t.setSortModel(s);
    },
    getSortModel() {
      return t.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(s) {
      t.setFilterModel(s);
    },
    getFilterModel() {
      return { ...t.state.filterModel };
    },
    setColumnFilter(s, e) {
      t.setColumnFilter(s, e);
    },
    destroyFilter(s) {
      t.setColumnFilter(s, null);
    },
    setQuickFilter(s) {
      t.setQuickFilter(s);
    },
    getQuickFilter() {
      return t.getQuickFilter();
    },
    // ---- Selection ----
    selectAll() {
      t.selectAll();
    },
    deselectAll() {
      t.deselectAll();
    },
    selectRow(s) {
      t.setSelected(s, !0);
    },
    deselectRow(s) {
      t.setSelected(s, !1);
    },
    getSelectedRows() {
      return t.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(t.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(s) {
      t.goToPage(s);
    },
    paginationGoToFirstPage() {
      t.goToPage(0);
    },
    paginationGoToNextPage() {
      t.goToPage(t.state.pagination.page + 1);
    },
    paginationGoToPreviousPage() {
      t.goToPage(t.state.pagination.page - 1);
    },
    paginationGoToLastPage() {
      t.goToPage(t.lastPageIndex());
    },
    paginationSetPageSize(s) {
      t.setPageSize(s);
    },
    paginationGetCurrentPage() {
      return t.state.pagination.page;
    },
    paginationGetTotalPages() {
      return t.totalPages();
    },
    paginationGetRowCount() {
      return t.filteredCount();
    },
    paginationGetPageSize() {
      return t.state.pagination.pageSize;
    },
    paginationIsEnabled() {
      return t.state.pagination.enabled;
    },
    // ---- Cell selection ----
    getCellSelection() {
      return t.getCellSelectionDetail();
    },
    getCellRangeValues() {
      return t._cellRangeRows();
    },
    getCellSelectionRowIds() {
      return t.getCellSelectionRowIds();
    },
    getRangeAggregates() {
      return t.getRangeAggregates();
    },
    // ---- Editing ----
    startEditingCell({ rowId: s, colId: e }) {
      t.startEditingCell(s, e);
    },
    stopEditing(s = !1) {
      t.stopEditing(s);
    },
    // ---- Row grouping + aggregation ----
    setRowGroupColumns(s) {
      t.setRowGroupColumns(s);
    },
    addRowGroupColumn(s) {
      t.addRowGroupColumn(s);
    },
    removeRowGroupColumn(s) {
      t.removeRowGroupColumn(s);
    },
    getRowGroupColumns() {
      return t.getRowGroupColumns();
    },
    setColumnAggFunc(s, e) {
      t.setColumnAggFunc(s, e);
    },
    expandAll() {
      t.expandAll();
    },
    collapseAll() {
      t.collapseAll();
    },
    toggleGroup(s, e) {
      t.toggleGroup(s, e);
    },
    // ---- Pivot ----
    setPivotMode(s) {
      t.setPivotMode(s);
    },
    isPivotMode() {
      return t.isPivotMode();
    },
    setPivotColumns(s) {
      t.setPivotColumns(s);
    },
    addPivotColumn(s) {
      t.addPivotColumn(s);
    },
    removePivotColumn(s) {
      t.removePivotColumn(s);
    },
    getPivotColumns() {
      return t.getPivotColumns();
    },
    // Synthetic pivot result columns from the most recent render. Each entry
    // is { field, headerName, pivotKeys, valueField, aggFunc } — useful for
    // discovering the field id of a pivot col to feed to setSortModel / for
    // building a custom column visibility UI.
    getPivotResultColumns() {
      return (t._displayList?.pivotResultColumns || []).map((e) => ({
        field: e.field,
        headerName: e.headerName,
        pivotKeys: { ...e.pivotKeys || {} },
        valueField: e.valueField,
        aggFunc: e.aggFunc
      }));
    },
    // ---- Value columns (aggregations; shared with grouping) ----
    setValueColumns(s) {
      t.setValueColumns(s);
    },
    addValueColumn(s, e = "sum") {
      t.addValueColumn(s, e);
    },
    removeValueColumn(s) {
      t.removeValueColumn(s);
    },
    getValueColumns() {
      return t.getValueColumns();
    },
    // ---- Column header groups (multi-row headers) ----
    setColumnGroups(s) {
      t.setColumnGroups(s);
    },
    getColumnGroups() {
      return t.getColumnGroups();
    },
    // ---- Pinned bottom row (sticky grand totals) ----
    setPinnedBottomRow(s) {
      t.setPinnedBottomRow(s);
    },
    isPinnedBottomRow() {
      return t.isPinnedBottomRow();
    },
    // ---- Tree data (self-referential parent_id) ----
    setTreeData(s) {
      t.setTreeData(s);
    },
    isTreeData() {
      return t.isTreeData();
    },
    setTreeParentField(s) {
      t.setTreeParentField(s);
    },
    expandTreeRow(s) {
      t.expandTreeRow(s);
    },
    collapseTreeRow(s) {
      t.collapseTreeRow(s);
    },
    toggleTreeRow(s) {
      t.toggleTreeRow(s);
    },
    expandAllTreeRows() {
      t.expandAllTreeRows();
    },
    collapseAllTreeRows() {
      t.collapseAllTreeRows();
    },
    getTreeExpandedRowIds() {
      return t.getTreeExpandedRowIds();
    },
    // ---- Master/detail ----
    setMasterDetail(s) {
      t.setMasterDetail(s);
    },
    isMasterDetail() {
      return t.isMasterDetail();
    },
    expandDetailRow(s) {
      t.expandDetailRow(s);
    },
    collapseDetailRow(s) {
      t.collapseDetailRow(s);
    },
    toggleDetailRow(s) {
      t.toggleDetailRow(s);
    },
    expandAllDetails() {
      t.expandAllDetails();
    },
    collapseAllDetails() {
      t.collapseAllDetails();
    },
    getDetailExpandedRowIds() {
      return t.getDetailExpandedRowIds();
    },
    // ---- Column state + persistence ----
    getColumnState() {
      return t.getColumnState();
    },
    applyColumnState(s) {
      t.applyColumnState(s);
    },
    clearPersistedState() {
      t.clearPersistedState();
    },
    getPersistKey() {
      return t.persistKeyValue || "";
    },
    // ---- Export ----
    getDataAsCsv(s = {}) {
      return t.getDataAsCsv(s);
    },
    exportDataAsCsv(s = {}) {
      return t.exportDataAsCsv(s);
    },
    // ---- Display ----
    refreshCells(s = {}) {
      t.refresh(s);
    },
    redrawRows(s = {}) {
      t.refresh(s);
    },
    // ---- Events ----
    addEventListener(s, e) {
      t.element.addEventListener(s, e);
    },
    removeEventListener(s, e) {
      t.element.removeEventListener(s, e);
    }
  };
}
function C(t, s = {}, e = []) {
  const n = document.createElement(t);
  for (const [r, i] of Object.entries(s))
    i === !1 || i == null || (r === "class" ? n.className = i : r === "style" && typeof i == "object" ? Object.assign(n.style, i) : r.startsWith("on") && typeof i == "function" ? n.addEventListener(r.slice(2).toLowerCase(), i) : i === !0 ? n.setAttribute(r, "") : n.setAttribute(r, String(i)));
  for (const r of [].concat(e))
    r == null || r === !1 || n.appendChild(typeof r == "string" ? document.createTextNode(r) : r);
  return n;
}
function Gt(t, s) {
  for (const [e, n] of Object.entries(s))
    n == null || n === !1 ? t.removeAttribute(e) : n === !0 ? t.setAttribute(e, "") : t.setAttribute(e, String(n));
}
function jt(t) {
  const s = document.getElementById(t);
  return !s || s.tagName !== "TEMPLATE" ? null : s.content.firstElementChild.cloneNode(!0);
}
function P(t, s, e) {
  t.dispatchEvent(new CustomEvent(s, { detail: e, bubbles: !0 }));
}
function xo(t, s, e) {
  let n = t.parentElement;
  for (; n; ) {
    if ((n.getAttribute("data-controller") || "").split(/\s+/).includes(s)) {
      const i = e.getControllerForElementAndIdentifier(n, s);
      if (i) return i;
    }
    n = n.parentElement;
  }
  return null;
}
const zt = [
  [16, 10, 1],
  // v1   ≤ 14 bytes after the 4-bit mode + 8-bit length header
  [28, 16, 1],
  // v2   ≤ 26
  [44, 26, 1],
  // v3   ≤ 42
  [64, 18, 2],
  // v4   ≤ 62
  [86, 24, 2],
  // v5   ≤ 84
  [108, 16, 4],
  // v6   ≤ 106
  [124, 18, 4],
  // v7   ≤ 122
  [154, 22, 4],
  // v8   ≤ 152
  [182, 22, 5],
  // v9   ≤ 180
  [216, 26, 5]
  // v10  ≤ 213
], Co = [
  21522,
  20773,
  24188,
  23371,
  17913,
  16590,
  20375,
  19104
], Fe = new Uint8Array(512), _t = new Uint8Array(256);
(function() {
  let s = 1;
  for (let e = 0; e < 255; e++)
    Fe[e] = s, _t[s] = e, s <<= 1, s & 256 && (s ^= 285);
  for (let e = 255; e < 512; e++) Fe[e] = Fe[e - 255];
})();
function xt(t, s) {
  return t === 0 || s === 0 ? 0 : Fe[_t[t] + _t[s]];
}
function So(t) {
  const s = new Uint8Array(t);
  s[t - 1] = 1;
  let e = 1;
  for (let n = 0; n < t; n++) {
    for (let r = 0; r < t; r++)
      s[r] = xt(s[r], e), r + 1 < t && (s[r] ^= s[r + 1]);
    e = xt(e, 2);
  }
  return s;
}
function Lo(t, s) {
  const e = new Uint8Array(s.length);
  for (const n of t) {
    const r = n ^ e[0];
    e.copyWithin(0, 1), e[e.length - 1] = 0;
    for (let i = 0; i < s.length; i++)
      e[i] ^= xt(s[i], r);
  }
  return e;
}
class ko {
  constructor() {
    this.bits = [];
  }
  append(s, e) {
    for (let n = e - 1; n >= 0; n--) this.bits.push(s >>> n & 1);
  }
  toBytes() {
    for (; this.bits.length % 8 !== 0; ) this.bits.push(0);
    const s = new Uint8Array(this.bits.length / 8);
    for (let e = 0; e < s.length; e++) {
      let n = 0;
      for (let r = 0; r < 8; r++) n = n << 1 | this.bits[e * 8 + r];
      s[e] = n;
    }
    return s;
  }
}
function Eo(t) {
  const s = new TextEncoder().encode(String(t));
  let e = 0;
  for (let k = 1; k <= 10; k++) {
    const M = 4 + (k < 10 ? 8 : 16) + s.length * 8, D = zt[k - 1][0] * 8;
    if (M <= D) {
      e = k;
      break;
    }
  }
  if (e === 0)
    throw new Error(`qr: data too long for v10 ECC=M (${s.length} bytes; max 213)`);
  const [n, r, i] = zt[e - 1], o = new ko();
  o.append(4, 4), o.append(s.length, e < 10 ? 8 : 16);
  for (const k of s) o.append(k, 8);
  const a = n * 8;
  o.append(0, Math.min(4, Math.max(0, a - o.bits.length)));
  const l = o.toBytes(), c = new Uint8Array(n);
  c.set(l);
  const d = [236, 17];
  for (let k = l.length; k < n; k++) c[k] = d[(k - l.length) % 2];
  const p = Math.floor(n / i), f = n - p * i, g = [], h = So(r);
  let b = 0;
  for (let k = 0; k < i; k++) {
    const $ = k < i - f ? p : p + 1, M = c.slice(b, b + $);
    b += $, g.push({ data: M, ecc: Lo(M, h) });
  }
  const m = [], _ = p + 1;
  for (let k = 0; k < _; k++)
    for (const $ of g) k < $.data.length && m.push($.data[k]);
  for (let k = 0; k < r; k++)
    for (const $ of g) m.push($.ecc[k]);
  const y = 17 + e * 4, w = new Uint8Array(y * y), x = new Uint8Array(y * y);
  $o(w, x, y), To(w, x, y), No(w, x, y, e), e >= 7 && Mo(w, x, y, e), Do(w, x, y, m);
  let S = 0, N = 1 / 0;
  const T = new Uint8Array(w);
  for (let k = 0; k < 8; k++) {
    T.set(w), Kt(T, x, y, k), Ut(T, y, k);
    const $ = Ro(T, y);
    $ < N && (N = $, S = k);
  }
  return Kt(w, x, y, S), Ut(w, y, S), { size: y, matrix: w };
}
function K(t, s, e, n, r) {
  t[n * s + e] = r ? 1 : 0;
}
function $o(t, s, e) {
  const n = [[0, 0], [e - 7, 0], [0, e - 7]];
  for (const [r, i] of n)
    for (let o = -1; o <= 7; o++)
      for (let a = -1; a <= 7; a++) {
        const l = r + a, c = i + o;
        if (l < 0 || c < 0 || l >= e || c >= e) continue;
        const p = a >= 0 && a < 7 && o >= 0 && o < 7 && (a === 0 || a === 6 || o === 0 || o === 6 || // outer ring
        a >= 2 && a <= 4 && o >= 2 && o <= 4);
        K(t, e, l, c, p), s[c * e + l] = 1;
      }
  for (let r = 0; r < 9; r++)
    s[r * e + 8] = 1, s[8 * e + r] = 1;
  for (let r = 0; r < 8; r++)
    s[(e - 1 - r) * e + 8] = 1, s[8 * e + (e - 1 - r)] = 1;
  K(t, e, 8, e - 8, 1), s[(e - 8) * e + 8] = 1;
}
function To(t, s, e) {
  for (let n = 8; n < e - 8; n++)
    K(t, e, n, 6, n % 2 === 0), K(t, e, 6, n, n % 2 === 0), s[6 * e + n] = 1, s[n * e + 6] = 1;
}
const Ao = [
  null,
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50]
];
function No(t, s, e, n) {
  const r = Ao[n];
  if (r) {
    for (const i of r)
      for (const o of r)
        if (!(o === 6 && i === 6 || o === e - 7 && i === 6 || o === 6 && i === e - 7))
          for (let l = -2; l <= 2; l++)
            for (let c = -2; c <= 2; c++) {
              const d = Math.max(Math.abs(c), Math.abs(l)) !== 1;
              K(t, e, o + c, i + l, d), s[(i + l) * e + (o + c)] = 1;
            }
  }
}
function Mo(t, s, e, n) {
  let r = n, i = r;
  for (let a = 0; a < 12; a++)
    i = i << 1 ^ (i >>> 11) * 7973;
  const o = r << 12 | i;
  for (let a = 0; a < 18; a++) {
    const l = o >>> a & 1, c = Math.floor(a / 3), d = a % 3 + e - 11;
    K(t, e, c, d, l), s[d * e + c] = 1, K(t, e, d, c, l), s[c * e + d] = 1;
  }
}
function Ut(t, s, e) {
  const n = Co[e];
  for (let r = 0; r < 15; r++) {
    const i = (n >>> r & 1) === 1;
    r < 6 ? K(t, s, 8, r, i) : r < 8 ? K(t, s, 8, r + 1, i) : r < 9 ? K(t, s, 7, 8, i) : K(t, s, 14 - r, 8, i), r < 8 ? K(t, s, s - 1 - r, 8, i) : K(t, s, 8, s - 15 + r, i);
  }
  K(t, s, 8, s - 8, 1);
}
function Do(t, s, e, n) {
  let r = 0, i = -1;
  for (let o = e - 1; o > 0; o -= 2) {
    o === 6 && o--;
    for (let a = 0; a < e; a++) {
      const l = i < 0 ? e - 1 - a : a;
      for (let c = 0; c < 2; c++) {
        const d = o - c;
        if (s[l * e + d]) continue;
        const p = r < n.length * 8 ? n[r >>> 3] >>> 7 - (r & 7) & 1 : 0;
        t[l * e + d] = p, r++;
      }
    }
    i = -i;
  }
}
function Kt(t, s, e, n) {
  for (let r = 0; r < e; r++)
    for (let i = 0; i < e; i++) {
      if (s[r * e + i]) continue;
      let o = !1;
      switch (n) {
        case 0:
          o = (i + r & 1) === 0;
          break;
        case 1:
          o = (r & 1) === 0;
          break;
        case 2:
          o = i % 3 === 0;
          break;
        case 3:
          o = (i + r) % 3 === 0;
          break;
        case 4:
          o = (Math.floor(r / 2) + Math.floor(i / 3) & 1) === 0;
          break;
        case 5:
          o = i * r % 2 + i * r % 3 === 0;
          break;
        case 6:
          o = (i * r % 2 + i * r % 3 & 1) === 0;
          break;
        case 7:
          o = ((i + r) % 2 + i * r % 3 & 1) === 0;
          break;
      }
      o && (t[r * e + i] ^= 1);
    }
}
function Ro(t, s) {
  let e = 0;
  for (let n = 0; n < s; n++) {
    let r = 1, i = -1;
    for (let o = 0; o < s; o++) {
      const a = t[n * s + o];
      a === i ? (r++, r === 5 ? e += 3 : r > 5 && (e += 1)) : (i = a, r = 1);
    }
  }
  for (let n = 0; n < s; n++) {
    let r = 1, i = -1;
    for (let o = 0; o < s; o++) {
      const a = t[o * s + n];
      a === i ? (r++, r === 5 ? e += 3 : r > 5 && (e += 1)) : (i = a, r = 1);
    }
  }
  for (let n = 0; n < s - 1; n++)
    for (let r = 0; r < s - 1; r++) {
      const i = t[n * s + r];
      t[n * s + r + 1] === i && t[(n + 1) * s + r] === i && t[(n + 1) * s + r + 1] === i && (e += 3);
    }
  return e;
}
function Po({ size: t, matrix: s }, e = {}) {
  const {
    moduleSize: n = 4,
    margin: r = 2,
    background: i = "#fff",
    foreground: o = "#111827"
  } = e, a = (t + r * 2) * n;
  let l = "";
  for (let c = 0; c < t; c++)
    for (let d = 0; d < t; d++)
      if (s[c * t + d]) {
        const p = (d + r) * n, f = (c + r) * n;
        l += `M${p},${f}h${n}v${n}h-${n}z`;
      }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a} ${a}" width="${a}" height="${a}" shape-rendering="crispEdges" aria-hidden="true"><rect width="${a}" height="${a}" fill="${i}"/><path d="${l}" fill="${o}"/></svg>`;
}
const yn = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.1 297.4z"/></svg>', Lt = /* @__PURE__ */ new Map();
function v(t, s) {
  if (typeof t != "string" || !t) throw new Error("registerRenderer: name must be a non-empty string");
  if (typeof s != "function") throw new Error("registerRenderer: fn must be a function");
  Lt.set(t, s);
}
function xe(t) {
  return Lt.get(t) || null;
}
function Io() {
  return Array.from(Lt.keys());
}
function Vo(t, { copy: s, parse: e } = {}) {
  return typeof s == "function" && (t.copyValue = s), typeof e == "function" && (t.parseValue = e), t;
}
const wn = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on", "✓", "checked"]), vn = /* @__PURE__ */ new Set(["0", "false", "f", "no", "n", "off", "✗", "unchecked", "-", "—"]);
function Fo(t, s) {
  const e = String(t ?? "");
  if (e === "") return "";
  switch (s?.type) {
    case "number": {
      const n = e.replace(/[,$£€¥\s]/g, "").replace(/%$/, ""), r = Number(n);
      return Number.isFinite(r) ? r : void 0;
    }
    case "boolean": {
      const n = e.trim().toLowerCase();
      return wn.has(n) ? !0 : vn.has(n) ? !1 : void 0;
    }
    case "date": {
      const n = new Date(e);
      return Number.isNaN(n.valueOf()) ? void 0 : e;
    }
    default:
      return e;
  }
}
function Bo(t, s, e) {
  return e != null && e !== "" ? e : t == null ? "" : String(t);
}
function lt(t) {
  if (t == null || t === "") return;
  const s = String(t).replace(/[,$£€¥\s]/g, "").replace(/%$/, "");
  if (s === "" || s === "-" || s === ".") return;
  const e = Number(s);
  return Number.isFinite(e) ? e : void 0;
}
function Ho(t) {
  const s = String(t ?? "").trim().toLowerCase();
  if (s !== "") {
    if (wn.has(s)) return !0;
    if (vn.has(s)) return !1;
  }
}
function u(t, s = {}, e = null) {
  const n = document.createElement(t);
  for (const [r, i] of Object.entries(s))
    i == null || i === !1 || (r === "class" ? n.className = i : n.setAttribute(r, i === !0 ? "" : String(i)));
  return e == null || (Array.isArray(e) ? e.forEach((r) => n.append(r)) : typeof e == "string" ? n.innerHTML = e : n.append(e)), n;
}
const L = (t) => t == null || t === "", Oo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function _n() {
  return ({ value: t }) => {
    if (L(t)) return "";
    const s = String(t);
    return Oo.test(s) ? u("a", {
      class: "sg-renderer-link",
      href: `mailto:${s}`,
      title: "Send email"
    }, document.createTextNode(s)) : u("span", { class: "sg-renderer-invalid", title: "Invalid email" }, document.createTextNode(s));
  };
}
function xn({ newTab: t = !0 } = {}) {
  return ({ value: s }) => {
    if (L(s)) return "";
    const e = String(s);
    let n;
    try {
      n = new URL(e);
    } catch {
      return document.createTextNode(e);
    }
    return u("a", {
      class: "sg-renderer-link",
      href: e,
      target: t ? "_blank" : null,
      rel: t ? "noopener noreferrer" : null,
      title: e
    }, document.createTextNode(n.hostname + (n.pathname !== "/" ? n.pathname : "")));
  };
}
function Cn({ defaultRegion: t = "AU" } = {}) {
  return ({ value: s }) => {
    if (L(s)) return "";
    const e = String(s).trim(), n = e.replace(/\D/g, "");
    if (!n) return document.createTextNode(e);
    let r = e;
    return t === "AU" && (/^04\d{8}$/.test(n) ? r = `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}` : /^0[2378]\d{8}$/.test(n) ? r = `(${n.slice(0, 2)}) ${n.slice(2, 6)} ${n.slice(6)}` : /^1[38]00\d{6}$/.test(n) ? r = `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}` : n.length === 8 && (r = `${n.slice(0, 4)} ${n.slice(4)}`)), u("a", { class: "sg-renderer-link", href: `tel:${n}` }, document.createTextNode(r));
  };
}
function Sn({ currency: t = "USD", locale: s = "en-US", decimals: e } = {}) {
  return ({ value: n, td: r }) => {
    if (r && r.classList.add("sg-renderer-number"), L(n)) return "";
    const i = Number(n);
    if (!Number.isFinite(i)) return String(n);
    const o = { style: "currency", currency: t };
    return e != null && (o.minimumFractionDigits = e, o.maximumFractionDigits = e), i.toLocaleString(s, o);
  };
}
function Ln({ decimals: t = 0, scale: s = "as-is" } = {}) {
  return ({ value: e, td: n }) => {
    if (n && n.classList.add("sg-renderer-number"), L(e)) return "";
    let r = Number(e);
    return Number.isFinite(r) ? (s === "fraction" && (r *= 100), `${r.toFixed(t)}%`) : String(e);
  };
}
function U(t) {
  if (t == null || t === "") return null;
  if (t instanceof Date) return Number.isNaN(t.valueOf()) ? null : t;
  const s = new Date(t);
  return Number.isNaN(s.valueOf()) ? null : s;
}
function kn({ locale: t = void 0, dateStyle: s = "medium", ...e } = {}) {
  const n = new Intl.DateTimeFormat(t, { dateStyle: s, ...e });
  return ({ value: r }) => {
    const i = U(r);
    return i ? n.format(i) : "";
  };
}
function En({ locale: t = void 0, dateStyle: s = "medium", timeStyle: e = "short", ...n } = {}) {
  const r = new Intl.DateTimeFormat(t, { dateStyle: s, timeStyle: e, ...n });
  return ({ value: i }) => {
    const o = U(i);
    return o ? r.format(o) : "";
  };
}
const ft = [
  { unit: "second", ms: 1e3, cutoff: 60 * 1e3 },
  { unit: "minute", ms: 60 * 1e3, cutoff: 3600 * 1e3 },
  { unit: "hour", ms: 3600 * 1e3, cutoff: 1440 * 60 * 1e3 },
  { unit: "day", ms: 1440 * 60 * 1e3, cutoff: 10080 * 60 * 1e3 },
  { unit: "week", ms: 10080 * 60 * 1e3, cutoff: 720 * 60 * 60 * 1e3 },
  { unit: "month", ms: 720 * 60 * 60 * 1e3, cutoff: 365 * 24 * 60 * 60 * 1e3 },
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1e3, cutoff: 1 / 0 }
];
function $n({ locale: t = void 0, numeric: s = "auto", style: e = "long" } = {}) {
  const n = new Intl.RelativeTimeFormat(t, { numeric: s, style: e });
  return ({ value: r }) => {
    const i = U(r);
    if (!i) return "";
    const o = i.getTime() - Date.now(), a = Math.abs(o), l = ft.find((p) => a < p.cutoff) || ft[ft.length - 1], c = Math.round(o / l.ms), d = u("span", { class: "sg-renderer-relative-time", title: i.toLocaleString() });
    return d.textContent = n.format(c, l.unit), d;
  };
}
const Go = { ms: 1, sec: 1e3, second: 1e3, min: 6e4, minute: 6e4, hr: 36e5, hour: 36e5 };
function Tn({ unit: t = "ms", style: s = "compact" } = {}) {
  const e = Go[t] ?? 1;
  return ({ value: n, td: r }) => {
    if (r && r.classList.add("sg-renderer-number"), L(n)) return "";
    const i = Number(n) * e;
    if (!Number.isFinite(i)) return String(n);
    const o = i < 0 ? "-" : "", a = Math.abs(i), l = Math.floor(a / 36e5), c = Math.floor(a % 36e5 / 6e4), d = Math.floor(a % 6e4 / 1e3);
    if (s === "clock") {
      const f = (g) => String(g).padStart(2, "0");
      return o + (l > 0 ? `${f(l)}:${f(c)}:${f(d)}` : `${f(c)}:${f(d)}`);
    }
    if (s === "words") {
      const f = [];
      return l && f.push(`${l} ${l === 1 ? "hour" : "hours"}`), c && f.push(`${c} ${c === 1 ? "minute" : "minutes"}`), !l && d && f.push(`${d} ${d === 1 ? "second" : "seconds"}`), o + (f.join(" ") || "0 seconds");
    }
    const p = [];
    return l && p.push(`${l}h`), c && p.push(`${c}m`), !l && d && p.push(`${d}s`), o + (p.join(" ") || "0s");
  };
}
function An({ locale: t = void 0, decimals: s, ...e } = {}) {
  const n = { ...e };
  s != null && (n.minimumFractionDigits = s, n.maximumFractionDigits = s);
  const r = new Intl.NumberFormat(t, n);
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), L(i)) return "";
    const a = Number(i);
    return Number.isFinite(a) ? r.format(a) : String(i);
  };
}
function Nn({ locale: t = void 0, compactDisplay: s = "short", maximumFractionDigits: e = 1 } = {}) {
  const n = new Intl.NumberFormat(t, {
    notation: "compact",
    compactDisplay: s,
    maximumFractionDigits: e
  });
  return ({ value: r, td: i }) => {
    if (i && i.classList.add("sg-renderer-number"), L(r)) return "";
    const o = Number(r);
    return Number.isFinite(o) ? n.format(o) : String(r);
  };
}
function Mn({ binary: t = !0, decimals: s = 1, locale: e = void 0 } = {}) {
  const n = t ? 1024 : 1e3, r = t ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"], i = new Intl.NumberFormat(e, {
    minimumFractionDigits: s,
    maximumFractionDigits: s
  });
  return ({ value: o, td: a }) => {
    if (a && a.classList.add("sg-renderer-number"), L(o)) return "";
    let l = Number(o);
    if (!Number.isFinite(l)) return String(o);
    const c = l < 0 ? "-" : "";
    l = Math.abs(l);
    let d = 0;
    for (; l >= n && d < r.length - 1; )
      l /= n, d += 1;
    const p = d === 0 ? String(Math.round(l)) : i.format(l);
    return `${c}${p} ${r[d]}`;
  };
}
const jo = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on"]);
function kt(t) {
  return t === !0 || t === 1 ? !0 : t == null || t === "" || t === !1 || t === 0 ? !1 : jo.has(String(t).toLowerCase());
}
const zo = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>', Uo = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
function Dn({
  truthy: t = kt,
  nullLabel: s = "—",
  falseStyle: e = "icon"
  // 'icon' | 'hidden'
} = {}) {
  return ({ value: n }) => {
    if (n == null || n === "")
      return u("span", { class: "sg-renderer-bool-null" }, document.createTextNode(s));
    if (t(n)) {
      const i = u("span", { class: "sg-renderer-bool is-true", "aria-label": "true" });
      return i.innerHTML = zo, i;
    }
    if (e === "hidden") return "";
    const r = u("span", { class: "sg-renderer-bool is-false", "aria-label": "false" });
    return r.innerHTML = Uo, r;
  };
}
const Ko = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>', Wo = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.7 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>', qo = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M64 256a32 32 0 1 0 0-64H384V160c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9S384 364.9 384 352V320H64z"/></svg>';
function Rn({
  style: t = "percent",
  // 'percent' | 'number' | 'currency'
  decimals: s = 1,
  locale: e = void 0,
  currency: n = "USD",
  inverted: r = !1,
  showSign: i = !0
} = {}) {
  let o;
  return t === "currency" ? o = new Intl.NumberFormat(e, {
    style: "currency",
    currency: n,
    minimumFractionDigits: s,
    maximumFractionDigits: s,
    signDisplay: i ? "always" : "auto"
  }) : o = new Intl.NumberFormat(e, {
    minimumFractionDigits: s,
    maximumFractionDigits: s,
    signDisplay: i ? "always" : "auto"
  }), ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-number"), L(a)) return "";
    const c = Number(a);
    if (!Number.isFinite(c)) return String(a);
    let d = "is-flat", p = qo;
    const f = !r;
    c > 0 ? (d = f ? "is-up" : "is-down", p = Ko) : c < 0 && (d = f ? "is-down" : "is-up", p = Wo);
    const g = u("span", { class: `sg-renderer-delta ${d}` }), h = u("span", { class: "sg-renderer-delta-icon", "aria-hidden": "true" });
    h.innerHTML = p;
    const b = t === "percent" ? `${o.format(c)}%` : o.format(c);
    return g.append(h), g.append(u("span", { class: "sg-renderer-delta-value" }, document.createTextNode(b))), g;
  };
}
function Pn({ chars: t = null } = {}) {
  return ({ value: s, td: e }) => {
    if (L(s)) return "";
    const n = String(s);
    let r = n, i = !1;
    return t && n.length > t && (r = n.slice(0, t) + "…", i = !0), e && (e.classList.add("sg-renderer-truncate"), e.setAttribute("title", n)), i ? r : n;
  };
}
const st = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>', In = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';
function Vn({ position: t = "after" } = {}) {
  return ({ value: s }) => {
    if (L(s)) return "";
    const e = String(s), n = u("span", { class: "sg-renderer-copyable" }), r = u("span", { class: "sg-renderer-copyable-value" }, document.createTextNode(e)), i = u("button", {
      type: "button",
      class: "sg-renderer-copyable-btn",
      title: "Copy",
      "aria-label": `Copy ${e}`
    });
    return i.innerHTML = st, i.addEventListener("click", async (o) => {
      o.stopPropagation(), o.preventDefault();
      try {
        navigator.clipboard?.writeText ? await navigator.clipboard.writeText(e) : Fn(e), i.innerHTML = In, i.classList.add("is-copied"), setTimeout(() => {
          i.innerHTML = st, i.classList.remove("is-copied");
        }, 1200);
      } catch {
      }
    }), t === "before" ? n.append(i, r) : n.append(r, i), n;
  };
}
function Fn(t) {
  const s = document.createElement("textarea");
  s.value = t, s.style.position = "fixed", s.style.left = "-9999px", document.body.appendChild(s), s.select();
  try {
    document.execCommand("copy");
  } catch {
  }
  document.body.removeChild(s);
}
function Bn({
  size: t = 36,
  rounded: s = "sm",
  // 'sm' = 4px, 'lg' = 8px, 'full' = circle, 'none'
  altField: e = "alt",
  clickToZoom: n = !1
} = {}) {
  const r = s === "full" ? "999px" : s === "lg" ? "8px" : s === "none" ? "0" : "4px";
  return ({ value: i, row: o }) => {
    if (L(i)) return "";
    const a = String(i), l = o?.[e] ?? "", c = u("img", {
      src: a,
      alt: l,
      class: "sg-renderer-image",
      width: String(t),
      height: String(t),
      style: `border-radius: ${r};`,
      loading: "lazy",
      decoding: "async"
    });
    return n && (c.style.cursor = "zoom-in", c.addEventListener("click", (d) => {
      d.stopPropagation(), Yo(a, l);
    })), c;
  };
}
function Yo(t, s) {
  const e = u("div", { class: "sg-image-zoom" }), n = () => {
    e.remove(), document.removeEventListener("keydown", r);
  }, r = (i) => {
    i.key === "Escape" && n();
  };
  e.addEventListener("click", n), document.addEventListener("keydown", r), e.append(u("img", { src: t, alt: s || "", class: "sg-image-zoom-img" })), document.body.appendChild(e);
}
function Hn({
  showLabel: t = !0,
  label: s = "value",
  // 'value' | 'name' | (value, row) => string
  shape: e = "circle",
  // 'circle' | 'square'
  size: n = 14
} = {}) {
  return ({ value: r, row: i }) => {
    if (L(r)) return "";
    const o = String(r).trim(), a = u("span", { class: "sg-renderer-swatch" }), l = u("span", {
      class: `sg-renderer-swatch-chip is-${e}`,
      style: `width: ${n}px; height: ${n}px; background: ${o};`,
      "aria-hidden": "true"
    });
    if (a.append(l), t) {
      const c = typeof s == "function" ? s(r, i) : s === "name" ? i?.name ?? o : o;
      a.append(u("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(c)));
    }
    return a;
  };
}
const Et = {
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  orange: "#f97316",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#6b7280"
};
function On({
  type: t = "line",
  // 'line' | 'area' | 'bar'
  width: s = 80,
  height: e = 24,
  color: n = "blue",
  // palette key OR raw CSS colour
  baseline: r = null,
  // null = auto-min, 0 = lock min at zero, N = lock at N
  showLast: i = !0
  // small dot on the last point (line / area only)
} = {}) {
  const o = Et[n] || n;
  return ({ value: a }) => {
    if (!Array.isArray(a) || a.length === 0) return "";
    const l = a.map(Number).filter((w) => Number.isFinite(w));
    if (l.length === 0) return "";
    const c = r ?? Math.min(...l), p = Math.max(...l, r ?? -1 / 0) - c || 1, f = 1.5, g = 2.5, h = s - f * 2, b = e - g * 2, m = (w) => f + (l.length === 1 ? h / 2 : w / (l.length - 1) * h), _ = (w) => g + b - (w - c) / p * b;
    let y = "";
    if (t === "bar") {
      const x = Math.max(1, (h - (l.length - 1) * 1) / l.length);
      for (let S = 0; S < l.length; S++) {
        const N = l[S], T = f + S * (x + 1), k = _(N), $ = g + b - k;
        y += `<rect x="${T.toFixed(2)}" y="${k.toFixed(2)}" width="${x.toFixed(2)}" height="${$.toFixed(2)}" fill="${o}"/>`;
      }
    } else {
      let w = "";
      for (let x = 0; x < l.length; x++)
        w += `${x === 0 ? "M" : "L"} ${m(x).toFixed(2)} ${_(l[x]).toFixed(2)} `;
      if (t === "area") {
        const x = w + ` L ${m(l.length - 1).toFixed(2)} ${(g + b).toFixed(2)} L ${m(0).toFixed(2)} ${(g + b).toFixed(2)} Z`;
        y += `<path d="${x}" fill="${o}" fill-opacity="0.18" stroke="none"/>`;
      }
      if (y += `<path d="${w.trim()}" fill="none" stroke="${o}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`, i) {
        const x = m(l.length - 1), S = _(l[l.length - 1]);
        y += `<circle cx="${x.toFixed(2)}" cy="${S.toFixed(2)}" r="1.8" fill="${o}"/>`;
      }
    }
    return `<svg class="sg-renderer-sparkline is-${t}" viewBox="0 0 ${s} ${e}" width="${s}" height="${e}" preserveAspectRatio="none" aria-hidden="true">` + y + "</svg>";
  };
}
function Gn(t) {
  if (typeof t != "string") return null;
  let s = t.trim().replace(/^#/, "");
  return s.length === 3 && (s = s.split("").map((e) => e + e).join("")), /^[0-9a-f]{6}$/i.test(s) ? [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)] : null;
}
function Zo(t, s, e) {
  const n = (r) => Math.max(0, Math.min(255, Math.round(r))).toString(16).padStart(2, "0");
  return `#${n(t)}${n(s)}${n(e)}`;
}
function Xo(t, s, e) {
  return [t[0] + (s[0] - t[0]) * e, t[1] + (s[1] - t[1]) * e, t[2] + (s[2] - t[2]) * e];
}
function jn([t, s, e]) {
  return 0.299 * t + 0.587 * s + 0.114 * e >= 145;
}
function zn({
  min: t = 0,
  max: s = 100,
  colors: e = ["#dcfce7", "#fef3c7", "#fecaca"],
  inverted: n = !1,
  showValue: r = !0,
  format: i = null
  // (value) => string for custom labels
} = {}) {
  const o = e.map(Gn).filter(Boolean);
  if (o.length < 2) throw new Error("heatmap: need at least two valid hex colours");
  return ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-heatmap"), L(a)) return "";
    let c = Number(a);
    if (!Number.isFinite(c)) return String(a);
    let d = s - t === 0 ? 0.5 : (c - t) / (s - t);
    d = Math.max(0, Math.min(1, d)), n && (d = 1 - d);
    const p = d * (o.length - 1), f = Math.min(o.length - 2, Math.floor(p)), g = p - f, h = Xo(o[f], o[f + 1], g);
    return l && (l.style.backgroundColor = Zo(...h), l.style.color = jn(h) ? "#111827" : "#ffffff"), r ? typeof i == "function" ? i(a) : String(a) : "";
  };
}
const Jo = {
  // Credit card: 16 digits grouped 4-4-4-4, last 4 visible. Handles 13-19
  // digit lengths gracefully (Amex 15, others 16). Non-digits are stripped.
  "cc-last4": (t, s) => Wt(t.replace(/\D/g, ""), 4, 4, s, " "),
  // BIN + last4: show the first 6 + last 4, mask the middle (PCI-friendly).
  "cc-bin-last4": (t, s) => Wt(t.replace(/\D/g, ""), 4, 4, s, " ", 6),
  // Phone: show the last 4 digits, mask the rest as a single bullet
  // block ("•••••• 1234"). Sidesteps the country-specific 3-3-4 / 4-3-3
  // grouping ambiguity — register your own variant if you need a
  // region-specific layout.
  "phone-last4": (t, s) => {
    const e = t.replace(/\D/g, "");
    return e ? e.length <= 4 ? e : s.repeat(e.length - 4) + " " + e.slice(-4) : t;
  },
  // Email: show first char + domain ("a••••@example.com").
  email: (t, s) => {
    const e = String(t).match(/^([^@\s]+)(@.+)$/);
    return e ? e[1][0] + s.repeat(Math.max(1, e[1].length - 1)) + e[2] : t;
  },
  // SSN / ABN-style: show last 4.
  last4: (t, s) => Qo(t, 4, s)
};
function Qo(t, s, e) {
  const n = String(t);
  return n.length <= s ? n : e.repeat(n.length - s) + n.slice(-s);
}
function Wt(t, s, e, n, r, i = 0) {
  if (!t) return "";
  const o = t.length, a = t.split("").map((c, d) => d < i || d >= o - e ? c : n).join(""), l = [];
  for (let c = a.length; c > 0; c -= s)
    l.unshift(a.slice(Math.max(0, c - s), c));
  return l.join(r);
}
const ea = /* @__PURE__ */ new Set(["cc-last4", "cc-bin-last4", "phone-last4", "last4"]);
function Un({
  format: t = null,
  showFirst: s = 0,
  showLast: e = 4,
  char: n = "•",
  align: r = null
  // 'left' | 'right' | null (auto)
} = {}) {
  const i = t ? Jo[t] : null, o = t ? ea.has(t) : !1, a = r === "right" || r !== "left" && o;
  return ({ value: l, td: c }) => {
    if (c && a && c.classList.add("sg-renderer-mask-numeric"), L(l)) return "";
    const d = String(l);
    if (i) return i(d, n);
    const p = d.slice(0, s), f = e > 0 ? d.slice(-e) : "", g = Math.max(0, d.length - s - e);
    return p + n.repeat(g) + f;
  };
}
function Kn({
  query: t = null,
  caseSensitive: s = !1,
  className: e = "sg-renderer-mark"
} = {}) {
  return ({ value: n, api: r }) => {
    if (L(n)) return "";
    const i = String(n), o = t != null ? String(t) : r?.getQuickFilter?.() || "";
    return o ? ta(i, o, s, e) : document.createTextNode(i);
  };
}
function ta(t, s, e, n) {
  const r = e ? t : t.toLowerCase(), i = e ? s : s.toLowerCase(), o = document.createElement("span");
  let a = 0;
  for (; a < t.length; ) {
    const l = r.indexOf(i, a);
    if (l === -1) {
      o.appendChild(document.createTextNode(t.slice(a)));
      break;
    }
    l > a && o.appendChild(document.createTextNode(t.slice(a, l)));
    const c = document.createElement("mark");
    c.className = n, c.textContent = t.slice(l, l + s.length), o.appendChild(c), a = l + s.length;
  }
  return o;
}
function Wn({ lines: t = null, separator: s = `
` } = {}) {
  return ({ value: e, td: n }) => {
    if (L(e)) return "";
    const r = String(e), i = s === `
` ? r : r.split(s).join(`
`);
    if (n) {
      n.classList.add("sg-renderer-multiline"), n.setAttribute("title", i);
      const o = n.parentElement;
      o && o.tagName === "TR" && o.classList.add("sg-has-multiline");
    }
    if (t != null && t > 0) {
      const o = document.createElement("div");
      return o.className = "sg-renderer-multiline-clamp", o.style.setProperty("--sg-clamp", String(t)), o.textContent = i, o;
    }
    return i;
  };
}
function ke(t) {
  if (t == null || !Number.isFinite(Number(t))) return "";
  let s = Number(t);
  if (s < 1024) return `${s} B`;
  const e = ["KB", "MB", "GB", "TB"];
  let n = -1;
  do
    s /= 1024, n++;
  while (s >= 1024 && n < e.length - 1);
  return `${s.toFixed(s < 10 ? 1 : 0)} ${e[n]}`;
}
const na = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "ico"]);
function re(t) {
  if (!t) return !1;
  if (typeof t.content_type == "string" && t.content_type.startsWith("image/")) return !0;
  const s = String(t.filename || "").split(".").pop()?.toLowerCase();
  return s ? na.has(s) : !1;
}
const it = {
  pdf: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM88 304h32c30.9 0 56 25.1 56 56s-25.1 56-56 56h-16v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V320c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24h-16v48h16zm72-64c0-8.8 7.2-16 16-16h24c26.5 0 48 21.5 48 48v48c0 26.5-21.5 48-48 48H208c-8.8 0-16-7.2-16-16V320zm32 16v80h8c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16h-8z"/></svg>',
  doc: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM104 280c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24zm0 80c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24z"/></svg>',
  sheet: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zm192 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16v128c0 8.8-7.2 16-16 16H112c-8.8 0-16-7.2-16-16V272c0-8.8 7.2-16 16-16zm16 32v32h48V288H128zm80 0v32h48V288H208zm-80 64v32h48V352H128zm80 0v32h48V352H208z"/></svg>',
  zip: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H160V64H224V0H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM160 64v32h64V64H160zm0 96v32h64V160H160zm0 96v32h64V256H160zm0 96c-17.7 0-32 14.3-32 32v48c0 8.8 7.2 16 16 16h96c8.8 0 16-7.2 16-16V384c0-17.7-14.3-32-32-32H160z"/></svg>',
  audio: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM160 288c-8.8 0-16 7.2-16 16v89c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V362.5l64-21.3V388c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V304c0-5.1-2.5-10-6.6-13s-9.5-3.9-14.5-2.3L160 309.8V304c0-8.8-7.2-16-16-16z"/></svg>',
  video: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM64 288c0-17.7 14.3-32 32-32H224c17.7 0 32 14.3 32 32V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V288zm259.7-11.3c5.2 2.7 8.3 8 8.3 13.8v123c0 5.8-3.2 11.2-8.3 13.8s-11.3 2.3-16.1-.9L256 392.7V312l51.5-32.6c4.9-3.1 11-3.4 16.1-.8z"/></svg>',
  code: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM200.4 281.7c5.8 6.7 5.2 16.8-1.5 22.6L165.5 333l33.4 28.7c6.7 5.8 7.4 15.9 1.6 22.6s-15.9 7.4-22.6 1.6l-48-41.2c-3.5-3-5.5-7.4-5.5-12s2-9 5.5-12l48-41.2c6.7-5.8 16.8-5.2 22.6 1.5zM226 281.7c5.8-6.7 15.9-7.4 22.6-1.5l48 41.2c3.5 3 5.5 7.4 5.5 12s-2 9-5.5 12l-48 41.2c-6.7 5.8-16.8 5.2-22.6-1.6s-5.2-16.8 1.5-22.6L260.5 333 227.5 304.4c-6.7-5.8-7.4-15.9-1.5-22.6z"/></svg>',
  file: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0z"/></svg>'
}, qn = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>', $t = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>', ra = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>', sa = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 105.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>', ia = /* @__PURE__ */ new Set(["mp3", "wav", "flac", "m4a", "ogg", "aac", "opus"]), oa = /* @__PURE__ */ new Set(["mp4", "mov", "webm", "mkv", "avi", "m4v"]);
function Yn(t) {
  const s = String(t?.content_type || "").toLowerCase(), e = String(t?.filename || "").split(".").pop()?.toLowerCase() || "";
  return s.includes("pdf") || e === "pdf" ? "pdf" : s.startsWith("audio/") || ia.has(e) ? "audio" : s.startsWith("video/") || oa.has(e) ? "video" : s.includes("zip") || ["zip", "tar", "gz", "7z", "rar"].includes(e) ? "zip" : s.includes("sheet") || s.includes("excel") || s.includes("csv") || ["xls", "xlsx", "csv", "numbers"].includes(e) ? "sheet" : s.includes("word") || s.includes("document") || ["doc", "docx", "txt", "md", "rtf"].includes(e) ? "doc" : ["js", "ts", "rb", "py", "go", "rs", "java", "json", "xml", "html", "css", "sh", "sql"].includes(e) ? "code" : "file";
}
function ct(t) {
  if (t == null || t === "") return [];
  let s = t;
  if (typeof s == "string")
    try {
      s = JSON.parse(s);
    } catch {
      return [];
    }
  return Array.isArray(s) || (s = [s]), s.filter((e) => e && (e.url || e.signed_id)).map((e, n) => ({
    id: e.id != null ? String(e.id) : `att_${n}`,
    filename: e.filename || e.name || `attachment-${n + 1}`,
    url: e.url || "#",
    content_type: e.content_type || e.contentType || e.mime_type || "",
    byte_size: e.byte_size ?? e.byteSize ?? e.size ?? null,
    preview_url: e.preview_url || e.previewUrl || (re(e) ? e.url : null),
    thumb_url: e.thumb_url || e.thumbUrl || (re(e) ? e.url : null),
    signed_id: e.signed_id || e.signedId || null
  }));
}
function Zn({
  thumbSize: t = 28,
  maxThumbs: s = 4,
  empty: e = "",
  editable: n = !1,
  accept: r = null,
  multiple: i = !0,
  download: o = !1,
  onUpload: a = null,
  onRemove: l = null
} = {}) {
  return (c) => {
    const { value: d, td: p, row: f, col: g } = c, h = ct(d);
    if (p && (p.classList.add("sg-renderer-attachments-cell"), p.dataset.attachmentCount = String(h.length), p._sgAttachments = h), h.length === 0 && !n)
      return e ? document.createTextNode(e) : "";
    const b = u("div", { class: "sg-renderer-attachments", role: "group" }), m = h.slice(0, s), _ = Math.max(0, h.length - m.length);
    if (m.forEach((y) => b.append(aa(y, t, h, o))), _ > 0) {
      const y = u(
        "span",
        { class: "sg-attach-more", title: `${_} more` },
        document.createTextNode(`+${_}`)
      );
      y.addEventListener("click", (w) => {
        w.stopPropagation(), Xn(h, h[m.length]);
      }), b.append(y);
    }
    if (n) {
      const y = u("button", {
        type: "button",
        class: "sg-attach-add",
        title: "Add files",
        "aria-label": "Add attachments",
        "data-sg-attach": "add"
      });
      y.innerHTML = qn, y.addEventListener("click", (w) => {
        w.stopPropagation(), qt(p, c, { thumbSize: t, accept: r, multiple: i, onUpload: a, onRemove: l });
      }), b.append(y), la(p, c, { onUpload: a }), p.addEventListener("dblclick", (w) => {
        w._sgAttachmentHandled || (w._sgAttachmentHandled = !0, w.stopPropagation(), qt(p, c, { thumbSize: t, accept: r, multiple: i, onUpload: a, onRemove: l }));
      }, { once: !1 });
    }
    return b;
  };
}
function aa(t, s, e, n) {
  const r = u("button", {
    type: "button",
    class: "sg-attach-thumb",
    title: `${t.filename}${t.byte_size != null ? " · " + ke(t.byte_size) : ""}`,
    "data-attachment-id": t.id,
    "data-attachment-kind": re(t) ? "image" : "file",
    "aria-label": t.filename,
    style: `width: ${s}px; height: ${s}px;`
  });
  if (re(t) && t.thumb_url)
    r.append(u("img", {
      src: t.thumb_url,
      alt: t.filename,
      loading: "lazy",
      decoding: "async",
      width: String(s),
      height: String(s)
    }));
  else {
    const i = Yn(t), o = u("span", { class: `sg-attach-icon is-${i}`, "aria-hidden": "true" });
    o.innerHTML = it[i] || it.file, r.append(o);
  }
  return r.addEventListener("click", (i) => {
    if (i.stopPropagation(), re(t)) {
      const o = e.filter(re);
      Xn(o.length ? o : [t], t);
    } else if (n) {
      const o = document.createElement("a");
      o.href = t.url, o.download = t.filename, document.body.appendChild(o), o.click(), o.remove();
    } else
      window.open(t.url, "_blank", "noopener,noreferrer");
  }), r;
}
let we = null;
function Xn(t, s) {
  gt();
  const e = t.filter(re);
  if (e.length === 0) return;
  let n = Math.max(0, e.findIndex((g) => g.id === s?.id));
  n < 0 && (n = 0);
  const r = u("div", { class: "sg-image-zoom sg-attach-lightbox", role: "dialog", "aria-modal": "true" }), i = u("div", { class: "sg-attach-lightbox-stage" }), o = u("img", { class: "sg-image-zoom-img", alt: "" }), a = u("div", { class: "sg-attach-lightbox-caption" }), l = u("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-prev",
    "aria-label": "Previous attachment"
  }), c = u("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-next",
    "aria-label": "Next attachment"
  });
  l.innerHTML = ra, c.innerHTML = sa;
  function d() {
    const g = e[n];
    o.src = g.preview_url || g.url, o.alt = g.filename, a.textContent = `${g.filename}${g.byte_size != null ? " · " + ke(g.byte_size) : ""} (${n + 1}/${e.length})`, l.style.visibility = e.length > 1 ? "visible" : "hidden", c.style.visibility = e.length > 1 ? "visible" : "hidden";
  }
  function p(g) {
    n = (n + g + e.length) % e.length, d();
  }
  function f(g) {
    g.key === "Escape" ? gt() : g.key === "ArrowLeft" ? p(-1) : g.key === "ArrowRight" && p(1);
  }
  r.addEventListener("click", (g) => {
    (g.target === r || g.target === i) && gt();
  }), l.addEventListener("click", (g) => {
    g.stopPropagation(), p(-1);
  }), c.addEventListener("click", (g) => {
    g.stopPropagation(), p(1);
  }), document.addEventListener("keydown", f), i.append(l, o, c), r.append(i, a), document.body.appendChild(r), we = { overlay: r, onKey: f }, d();
}
function gt() {
  we && (document.removeEventListener("keydown", we.onKey), we.overlay.remove(), we = null);
}
let Be = null;
function la(t, s, { onUpload: e }) {
  t._sgAttachDropBound || (t._sgAttachDropBound = !0, t.addEventListener("dragover", (n) => {
    n.dataTransfer?.types?.includes("Files") && (n.preventDefault(), t.classList.add("is-drop-target"));
  }), t.addEventListener("dragleave", () => t.classList.remove("is-drop-target")), t.addEventListener("drop", async (n) => {
    if (!n.dataTransfer?.files?.length) return;
    n.preventDefault(), t.classList.remove("is-drop-target");
    const r = Array.from(n.dataTransfer.files);
    await He(t, s, r, e);
  }));
}
function qt(t, s, e) {
  $e();
  const { thumbSize: n, accept: r, multiple: i, onUpload: o, onRemove: a } = e, l = t._sgAttachments || ct(s.value), c = u("div", { class: "sg-attach-editor", role: "dialog", "aria-modal": "false" });
  c.addEventListener("mousedown", (y) => y.stopPropagation());
  const d = u("div", { class: "sg-attach-editor-header" }, [
    u(
      "span",
      { class: "sg-attach-editor-title" },
      document.createTextNode(l.length === 1 ? "1 attachment" : `${l.length} attachments`)
    ),
    (() => {
      const y = u("button", {
        type: "button",
        class: "sg-attach-editor-close",
        "aria-label": "Close"
      });
      return y.innerHTML = $t, y.addEventListener("click", $e), y;
    })()
  ]), p = u("div", { class: "sg-attach-editor-grid" });
  function f() {
    const y = t._sgAttachments || [];
    p.replaceChildren(), y.forEach((w) => p.append(ca(w, t, s, a, n))), d.firstChild.textContent = y.length === 1 ? "1 attachment" : `${y.length} attachments`;
  }
  f(), t._sgAttachRepaint = f;
  const g = u("label", { class: "sg-attach-dropzone", tabindex: "0" });
  g.innerHTML = `
    <span class="sg-attach-dropzone-icon" aria-hidden="true">${qn}</span>
    <span class="sg-attach-dropzone-text">Drop files, paste, or <strong>browse</strong></span>
  `;
  const h = u("input", { type: "file", multiple: i ? "" : null, accept: r || null });
  h.style.display = "none", g.append(h), h.addEventListener("change", async () => {
    h.files?.length && (await He(t, s, Array.from(h.files), o), h.value = "", f());
  }), g.addEventListener("dragover", (y) => {
    y.dataTransfer?.types?.includes("Files") && (y.preventDefault(), g.classList.add("is-drop-target"));
  }), g.addEventListener("dragleave", () => g.classList.remove("is-drop-target")), g.addEventListener("drop", async (y) => {
    y.dataTransfer?.files?.length && (y.preventDefault(), g.classList.remove("is-drop-target"), await He(t, s, Array.from(y.dataTransfer.files), o), f());
  });
  function b(y) {
    const w = Array.from(y.clipboardData?.files || []);
    w.length !== 0 && (y.preventDefault(), He(t, s, w, o).then(f));
  }
  c.addEventListener("paste", b);
  function m(y) {
    y.key === "Escape" && $e();
  }
  function _(y) {
    !c.contains(y.target) && !t.contains(y.target) && $e();
  }
  document.addEventListener("keydown", m), setTimeout(() => document.addEventListener("mousedown", _), 0), c.append(d, p, g), document.body.appendChild(c), z(c, t), g.focus(), Be = { pop: c, onKey: m, onDocClick: _, anchor: t };
}
function $e() {
  if (!Be) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Be;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), n && delete n._sgAttachRepaint, Be = null;
}
function ca(t, s, e, n, r) {
  const i = u("div", { class: "sg-attach-editor-tile", "data-attachment-id": t.id }), o = u("div", {
    class: "sg-attach-editor-preview",
    style: `width: ${r * 2}px; height: ${r * 2}px;`
  });
  if (re(t) && t.thumb_url)
    o.append(u("img", {
      src: t.thumb_url,
      alt: t.filename,
      width: String(r * 2),
      height: String(r * 2)
    }));
  else {
    const c = Yn(t), d = u("span", { class: `sg-attach-icon is-${c}`, "aria-hidden": "true" });
    d.innerHTML = it[c] || it.file, o.append(d);
  }
  const a = u("div", { class: "sg-attach-editor-meta" }, [
    u(
      "div",
      { class: "sg-attach-editor-name", title: t.filename },
      document.createTextNode(t.filename)
    ),
    u(
      "div",
      { class: "sg-attach-editor-size" },
      document.createTextNode(t.byte_size != null ? ke(t.byte_size) : "")
    )
  ]), l = u("button", {
    type: "button",
    class: "sg-attach-editor-remove",
    title: "Remove",
    "aria-label": `Remove ${t.filename}`,
    "data-sg-attach": "remove",
    "data-attachment-id": t.id
  });
  return l.innerHTML = $t, l.addEventListener("click", async (c) => {
    c.stopPropagation(), await da(s, e, t, n);
  }), i.append(o, a, l), i;
}
function z(t, s) {
  const e = s.getBoundingClientRect();
  t.style.position = "fixed", t.style.left = `${Math.max(8, Math.min(window.innerWidth - 360, e.left))}px`, window.innerHeight - e.bottom > 280 ? t.style.top = `${e.bottom + 4}px` : t.style.top = `${Math.max(8, e.top - t.offsetHeight - 4)}px`;
}
async function He(t, s, e, n) {
  if (e.length) {
    t.classList.add("is-uploading");
    try {
      let r;
      if (typeof n == "function") {
        const i = await n(e, s);
        r = Array.isArray(i) ? i : (t._sgAttachments || []).concat(Yt(e));
      } else
        r = (t._sgAttachments || []).concat(Yt(e));
      Jn(t, s, ct(r));
    } finally {
      t.classList.remove("is-uploading");
    }
  }
}
async function da(t, s, e, n) {
  let r;
  if (typeof n == "function") {
    const i = await n(e, s);
    r = Array.isArray(i) ? i : (t._sgAttachments || []).filter((o) => o.id !== e.id);
  } else
    r = (t._sgAttachments || []).filter((i) => i.id !== e.id);
  Jn(t, s, ct(r));
}
function Yt(t) {
  return t.map((s, e) => ({
    id: `local_${Date.now()}_${e}`,
    filename: s.name,
    url: URL.createObjectURL(s),
    content_type: s.type || "",
    byte_size: s.size,
    preview_url: s.type?.startsWith("image/") ? URL.createObjectURL(s) : null,
    thumb_url: s.type?.startsWith("image/") ? URL.createObjectURL(s) : null
  }));
}
function Jn(t, s, e) {
  const { row: n, col: r, api: i } = s;
  n && r?.field != null && (n[r.field] = e), t._sgAttachments = e, i?.applyTransaction ? i.applyTransaction({ update: [n] }) : i?.refreshCells && i.refreshCells({ rowIds: [n?.id ?? n?._sg_id] }), t._sgAttachRepaint && t._sgAttachRepaint();
}
const Qn = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"], Tt = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory"
};
function ua(t) {
  if (t == null || t === "") return null;
  if (typeof t == "string") return { _raw: t };
  if (typeof t != "object") return null;
  const s = t.state ? String(t.state).trim().toUpperCase() : "";
  return {
    address1: t.address1 ? String(t.address1) : "",
    address2: t.address2 ? String(t.address2) : "",
    address3: t.address3 ? String(t.address3) : "",
    suburb: t.suburb ? String(t.suburb) : "",
    state: s,
    postcode: t.postcode != null ? String(t.postcode) : "",
    country: t.country ? String(t.country) : ""
  };
}
function pa(t) {
  if (!t || t._raw) return t?._raw || "";
  const s = [t.address1, t.address2, t.address3].filter(Boolean), e = [t.suburb, t.state, t.postcode].filter(Boolean).join(" ");
  return e && s.push(e), t.country && t.country.toLowerCase() !== "australia" && s.push(t.country), s.join(`
`);
}
function er({ editable: t = !0, empty: s = "" } = {}) {
  return (e) => {
    const { value: n, td: r } = e, i = ua(n);
    if (r && (r.classList.add("sg-renderer-address-au-cell"), r._sgAddress = i), !i) return s ? document.createTextNode(s) : "";
    t && r && !r._sgAddressEditBound && (r._sgAddressEditBound = !0, r.addEventListener("dblclick", (c) => {
      c._sgAddressHandled || (c._sgAddressHandled = !0, c.stopPropagation(), fa(r, e));
    }));
    const o = u("div", {
      class: "sg-renderer-address-au",
      title: pa(i)
    });
    if (i._raw)
      return o.append(document.createTextNode(i._raw)), o;
    const a = [i.address1, i.address2].filter(Boolean).join(", "), l = i.suburb || i.state || i.postcode;
    return a && o.append(u("span", { class: "sg-address-au-street" }, document.createTextNode(a))), a && l && o.append(u("span", { class: "sg-address-au-sep" }, document.createTextNode(", "))), i.suburb && o.append(document.createTextNode(i.suburb)), i.state && (i.suburb && o.append(document.createTextNode(" ")), o.append(u("span", {
      class: `sg-address-au-state is-${i.state.toLowerCase()}`,
      title: Tt[i.state] || i.state
    }, document.createTextNode(i.state)))), i.postcode && ((i.suburb || i.state) && o.append(document.createTextNode(" ")), o.append(u(
      "span",
      { class: "sg-address-au-postcode" },
      document.createTextNode(i.postcode)
    ))), i.country && i.country.toLowerCase() !== "australia" && (o.append(document.createTextNode(" ")), o.append(u(
      "span",
      { class: "sg-address-au-country" },
      document.createTextNode(i.country)
    ))), o;
  };
}
let Oe = null;
function fa(t, s) {
  ge();
  const e = t._sgAddress && !t._sgAddress._raw ? { ...t._sgAddress } : { address1: "", address2: "", address3: "", suburb: "", state: "", postcode: "", country: "Australia" };
  e.country || (e.country = "Australia");
  const n = u("div", { class: "sg-address-au-editor", role: "dialog", "aria-modal": "false" });
  n.addEventListener("mousedown", (M) => M.stopPropagation());
  const r = u("div", { class: "sg-address-au-editor-header" });
  r.append(
    u("span", { class: "sg-address-au-editor-title" }, document.createTextNode("Edit address"))
  );
  const i = u("form", { class: "sg-address-au-editor-form", novalidate: "novalidate" });
  function o({ label: M, name: D, type: V = "text", value: I = "", maxlength: B, inputmode: F, placeholder: q, autocomplete: ee }) {
    const X = u("label", { class: "sg-address-au-editor-field", "data-field": D });
    X.append(u("span", { class: "sg-address-au-editor-label" }, document.createTextNode(M)));
    const te = u("input", {
      type: V,
      name: D,
      value: I || "",
      maxlength: B || null,
      inputmode: F || null,
      placeholder: q || null,
      autocomplete: ee || null,
      class: "sg-address-au-editor-input"
    });
    return X.append(te), { wrap: X, input: te };
  }
  const a = o({
    label: "Address line 1",
    name: "address1",
    value: e.address1,
    placeholder: "12 Smith Street",
    autocomplete: "address-line1"
  }), l = o({
    label: "Address line 2",
    name: "address2",
    value: e.address2,
    placeholder: "Unit / suite (optional)",
    autocomplete: "address-line2"
  }), c = u("div", { class: "sg-address-au-editor-line3-wrap" }), d = o({
    label: "Address line 3",
    name: "address3",
    value: e.address3,
    placeholder: "Level / building (optional)",
    autocomplete: "address-line3"
  });
  c.append(d.wrap);
  const p = u("button", {
    type: "button",
    class: "sg-address-au-editor-add-line"
  }, document.createTextNode("+ Add another line"));
  function f() {
    const M = !!(l.input.value.trim() || d.input.value.trim());
    c.hidden = !M, p.hidden = M;
  }
  l.input.addEventListener("input", f), p.addEventListener("click", () => {
    c.hidden = !1, p.hidden = !0, d.input.focus();
  });
  const g = o({
    label: "Suburb",
    name: "suburb",
    value: e.suburb,
    placeholder: "Bondi",
    autocomplete: "address-level2"
  }), h = u("label", { class: "sg-address-au-editor-field", "data-field": "state" });
  h.append(u("span", { class: "sg-address-au-editor-label" }, document.createTextNode("State")));
  const b = u("select", {
    name: "state",
    class: "sg-address-au-editor-input sg-address-au-editor-state",
    autocomplete: "address-level1"
  });
  b.append(u("option", { value: "" }, document.createTextNode("—")));
  for (const M of Qn) {
    const D = u(
      "option",
      { value: M, selected: e.state === M ? "" : null },
      document.createTextNode(`${M} — ${Tt[M]}`)
    );
    b.append(D);
  }
  h.append(b);
  const m = o({
    label: "Postcode",
    name: "postcode",
    type: "text",
    value: e.postcode,
    maxlength: 4,
    inputmode: "numeric",
    placeholder: "2026",
    autocomplete: "postal-code"
  });
  m.input.classList.add("sg-address-au-editor-postcode"), m.input.addEventListener("input", () => {
    m.input.value = m.input.value.replace(/\D/g, "").slice(0, 4);
  });
  const _ = o({
    label: "Country",
    name: "country",
    value: e.country,
    autocomplete: "country-name"
  }), y = u("div", { class: "sg-address-au-editor-grid" });
  y.append(a.wrap), y.append(l.wrap, p), y.append(c), y.append(g.wrap, h, m.wrap), y.append(_.wrap);
  const w = u("div", { class: "sg-address-au-editor-footer" }), x = u(
    "button",
    { type: "button", class: "sg-address-au-editor-cancel" },
    document.createTextNode("Cancel")
  ), S = u(
    "button",
    { type: "submit", class: "sg-address-au-editor-save" },
    document.createTextNode("Save")
  );
  w.append(x, S), i.append(y, w), n.append(r, i);
  function N() {
    return {
      address1: a.input.value.trim(),
      address2: l.input.value.trim(),
      address3: c.hidden ? "" : d.input.value.trim(),
      suburb: g.input.value.trim(),
      state: b.value,
      postcode: m.input.value.trim(),
      country: _.input.value.trim() || "Australia"
    };
  }
  function T() {
    const M = N(), D = !M.address1 && !M.suburb && !M.state && !M.postcode;
    ga(t, s, D ? null : M), ge();
  }
  i.addEventListener("submit", (M) => {
    M.preventDefault(), T();
  }), x.addEventListener("click", () => ge());
  function k(M) {
    M.key === "Escape" && (M.stopPropagation(), ge());
  }
  function $(M) {
    !n.contains(M.target) && !t.contains(M.target) && ge();
  }
  document.addEventListener("keydown", k), setTimeout(() => document.addEventListener("mousedown", $), 0), document.body.appendChild(n), z(n, t), f(), a.input.focus(), a.input.select(), Oe = { pop: n, onKey: k, onDocClick: $ };
}
function ge() {
  if (!Oe) return;
  const { pop: t, onKey: s, onDocClick: e } = Oe;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Oe = null;
}
function ga(t, s, e) {
  const { row: n, col: r, api: i } = s, o = n && r?.field != null ? n[r.field] : null;
  n && r?.field != null && (n[r.field] = e), t._sgAddress = e, i?.applyTransaction ? i.applyTransaction({ update: [n] }) : i?.refreshCells && i.refreshCells({ rowIds: [n?.id ?? n?._sg_id] });
  const a = t.closest('[data-controller~="grid"]');
  a && a.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
    bubbles: !0,
    detail: { rowId: n?.id ?? n?._sg_id, colId: r?.field, oldValue: o, newValue: e }
  }));
}
function tr({ color: t = "green", showValue: s = !1 } = {}) {
  return ({ value: e }) => {
    let n = Number(e);
    Number.isFinite(n) || (n = 0), n = Math.max(0, Math.min(100, n));
    const r = u("div", { class: "sg-renderer-progress" }, [
      u("div", { class: `sg-renderer-progress-fill sg-fill-${t}`, style: `width: ${n}%;` })
    ]);
    return s ? u("div", { class: "sg-renderer-progress-wrap" }, [
      r,
      u("span", { class: "sg-renderer-progress-label" }, document.createTextNode(`${Math.round(n)}%`))
    ]) : r;
  };
}
const ve = '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>';
function nr({ max: t = 5, precision: s = 0.5 } = {}) {
  const e = s > 0 ? 1 / s : 2;
  return ({ value: n }) => {
    let r = parseFloat(n);
    Number.isFinite(r) || (r = 0), r = Math.max(0, Math.min(t, r)), r = Math.round(r * e) / e;
    const i = u("div", {
      class: "sg-renderer-stars",
      role: "img",
      "aria-label": `${r} out of ${t} stars`
    });
    for (let o = 1; o <= t; o++)
      if (r >= o)
        i.append(u("span", { class: "sg-renderer-star is-full", "aria-hidden": "true" }, ve));
      else if (r > o - 1) {
        const a = Math.round((r - (o - 1)) * 100);
        i.append(u(
          "span",
          { class: "sg-renderer-star is-partial", "aria-hidden": "true" },
          `${ve}<span class="sg-star-clip" style="width: ${a}%;">${ve}</span>`
        ));
      } else
        i.append(u("span", { class: "sg-renderer-star is-empty", "aria-hidden": "true" }, ve));
    return i;
  };
}
function rr({ separator: t = "," } = {}) {
  return ({ value: s }) => {
    if (L(s)) return "";
    const e = Array.isArray(s) ? s : String(s).split(t), n = u("div", { class: "sg-renderer-tags" });
    for (const r of e) {
      const i = String(r).trim();
      i && n.append(u("span", { class: "sg-renderer-tag" }, document.createTextNode(i)));
    }
    return n;
  };
}
function sr({ showCode: t = !0, fallback: s = null } = {}) {
  return ({ value: e }) => {
    if (L(e)) return "";
    const n = String(e).trim().toUpperCase();
    if (n.length !== 2 || !/^[A-Z]{2}$/.test(n))
      return s ?? document.createTextNode(String(e));
    const r = String.fromCodePoint(
      127462 + n.charCodeAt(0) - 65,
      127462 + n.charCodeAt(1) - 65
    ), i = u("span", { class: "sg-renderer-country" });
    return i.append(u("span", { class: "sg-renderer-flag", "aria-hidden": "true" }, document.createTextNode(r))), t && i.append(u("span", { class: "sg-renderer-country-code" }, document.createTextNode(n))), i;
  };
}
function ha(t) {
  const s = String(t).replace(/\s+/g, "");
  if (s.length !== 11 || !/^\d{11}$/.test(s)) return !1;
  const e = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19], n = parseInt(s[0], 10) - 1 + s.slice(1);
  let r = 0;
  for (let i = 0; i < 11; i++) r += parseInt(n[i], 10) * e[i];
  return r % 89 === 0;
}
function ma(t) {
  const s = String(t).replace(/\D/g, "");
  return s.length !== 11 ? String(t) : `${s.slice(0, 2)} ${s.slice(2, 5)} ${s.slice(5, 8)} ${s.slice(8)}`;
}
function ir() {
  return ({ value: t }) => {
    if (L(t)) return "";
    if (!ha(t))
      return u("span", { class: "sg-renderer-invalid", title: "Invalid ABN" }, document.createTextNode(String(t)));
    const s = String(t).replace(/\s+/g, "");
    return u("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/ABN/View?id=${s}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(ma(t)));
  };
}
function or({
  lookup: t = null,
  nameField: s = null,
  avatarField: e = null,
  windowKey: n = "__sgUsers",
  size: r = 22
} = {}) {
  return ({ value: i, row: o }) => {
    if (L(i)) return "";
    let a = null;
    if (typeof t == "function" && (a = t(i, o) || null), !a && s && (a = { name: o?.[s], avatarUrl: e ? o?.[e] : null }), !a && typeof window < "u" && window[n]) {
      const d = window[n];
      d instanceof Map ? a = d.get(i) || d.get(String(i)) || null : Array.isArray(d) && (a = d.find((p) => `${p.id}` == `${i}`) || null);
    }
    const l = a?.name ?? String(i), c = u("span", { class: "sg-renderer-avatar" });
    if (a?.avatarUrl)
      c.append(u("img", {
        class: "sg-renderer-avatar-img",
        src: a.avatarUrl,
        width: String(r),
        height: String(r),
        alt: ""
      }));
    else {
      const d = String(l).split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
      c.append(u("span", {
        class: "sg-renderer-avatar-initials",
        style: `width: ${r}px; height: ${r}px;`
      }, document.createTextNode(d)));
    }
    return c.append(u("span", { class: "sg-renderer-avatar-name" }, document.createTextNode(l))), c;
  };
}
const ba = {
  check: '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>',
  "check-circle": '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>',
  "x-circle": '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>',
  clock: '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120v136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>',
  truck: '<svg viewBox="0 0 640 512" aria-hidden="true"><path fill="currentColor" d="M48 0C21.5 0 0 21.5 0 48V368c0 26.5 21.5 48 48 48H64c0 53 43 96 96 96s96-43 96-96H384c0 53 43 96 96 96s96-43 96-96h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V288 256 237.3c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7H416V48c0-26.5-21.5-48-48-48H48zM416 160h50.7L544 237.3V256H416V160zM112 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm368-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>',
  dot: '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z"/></svg>',
  circle: '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>',
  "half-circle": '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M448 256c0-106-86-192-192-192V448c106 0 192-86 192-192z"/></svg>',
  alert: '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 32C141.1 32 48 125.1 48 240V384c0 17.7 14.3 32 32 32H432c17.7 0 32-14.3 32-32V240C464 125.1 370.9 32 256 32zM232 152c0-13.3 10.7-24 24-24s24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152zM256 304a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>',
  cart: '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>'
};
function Se(t) {
  return String(t).toLowerCase().split(/[\s_-]+/).map((s) => s && s[0].toUpperCase() + s.slice(1)).join(" ");
}
function dt(t = {}, s = null, e = {}) {
  const { titleCase: n = !0, defaultColor: r = "gray" } = e, i = {};
  for (const [a, l] of Object.entries(t)) i[String(a).toLowerCase()] = l;
  const o = {};
  if (s) for (const [a, l] of Object.entries(s)) o[String(a).toLowerCase()] = l;
  return ({ value: a }) => {
    if (L(a)) return "";
    const l = String(a).toLowerCase(), c = i[l] || r, d = n ? Se(a) : String(a), p = u("span", { class: `sg-pill sg-pill-${c}` });
    if (s) {
      const f = o[l], g = f ? ba[f] || f : null;
      if (g) {
        const h = u("span", { class: "sg-pill-icon", "aria-hidden": "true" });
        h.innerHTML = g, p.append(h);
      }
    }
    return p.append(u("span", { class: "sg-pill-label" }, document.createTextNode(d))), p;
  };
}
function ar({
  truthy: t = kt,
  disabled: s = !1
} = {}) {
  return (e) => {
    const { value: n, row: r, col: i, api: o, td: a } = e;
    a && a.classList.add("sg-renderer-checkbox-cell");
    const l = u("span", { class: "sg-renderer-checkbox" }), c = u("input", {
      type: "checkbox",
      class: "sg-renderer-checkbox-input",
      disabled: s ? "" : null,
      "aria-label": i?.field || "toggle"
    });
    return n == null || n === "" ? c.indeterminate = !0 : c.checked = t(n), c.addEventListener("click", (d) => d.stopPropagation()), c.addEventListener("change", (d) => {
      if (s) {
        d.preventDefault();
        return;
      }
      const p = c.checked, f = r && i?.field != null ? r[i.field] : null;
      r && i?.field != null && (r[i.field] = p), o?.applyTransaction && o.applyTransaction({ update: [r] });
      const g = a?.closest('[data-controller~="grid"]');
      g && g.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: r?.id ?? r?._sg_id, colId: i?.field, oldValue: f, newValue: p }
      }));
    }), l.append(c), l;
  };
}
const ya = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z"/></svg>', ht = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>', wa = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>', va = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/></svg>', _a = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/></svg>', xa = $t;
function lr(t) {
  if (t == null || t === "") return null;
  if (typeof t == "string") {
    const e = t.trim();
    if (!e) return null;
    const n = e.split("/").pop()?.match(/^[^?#]+/)?.[0] || "";
    return { url: e, filename: n || "audio", byte_size: null, duration: null };
  }
  if (typeof t != "object") return null;
  const s = t.url || t.src || t.href;
  return s ? {
    url: String(s),
    filename: t.filename || t.name || String(s).split("/").pop()?.split("?")[0] || "audio",
    byte_size: t.byte_size ?? t.byteSize ?? t.size ?? null,
    duration: Number.isFinite(t.duration) ? Number(t.duration) : null,
    content_type: t.content_type || t.contentType || t.mime_type || ""
  } : null;
}
function _e(t) {
  (!Number.isFinite(t) || t < 0) && (t = 0);
  const s = Math.floor(t), e = Math.floor(s / 3600), n = Math.floor(s % 3600 / 60), r = s % 60, i = (o) => String(o).padStart(2, "0");
  return e > 0 ? `${e}:${i(n)}:${i(r)}` : `${n}:${i(r)}`;
}
function cr({
  showFilename: t = !0,
  iconOnly: s = !1,
  empty: e = "",
  preferHowler: n = !0,
  skipSeconds: r = 10
} = {}) {
  return (i) => {
    const { value: o, td: a } = i, l = lr(o);
    if (a && (a.classList.add("sg-renderer-audio-cell"), a._sgAudio = l, a._sgAudioOpts = { preferHowler: n, skipSeconds: r }), !l) return e ? document.createTextNode(e) : "";
    a && !a._sgAudioDblBound && (a._sgAudioDblBound = !0, a.addEventListener("dblclick", (p) => {
      p._sgAudioHandled || (p._sgAudioHandled = !0, p.stopPropagation(), p.preventDefault(), Zt(a, i));
    }));
    const c = u("div", { class: "sg-renderer-audio" }), d = u("button", {
      type: "button",
      class: "sg-audio-icon",
      title: `${l.filename}${l.byte_size != null ? " · " + ke(l.byte_size) : ""} — double-click to play`,
      "aria-label": `Play ${l.filename}`,
      "data-sg-audio": "open"
    });
    if (d.innerHTML = ya, d.addEventListener("click", (p) => {
      p.stopPropagation(), Zt(a, i);
    }), d.addEventListener("dblclick", (p) => {
      p._sgAudioHandled = !0, p.stopPropagation();
    }), c.append(d), t && !s) {
      const p = u(
        "span",
        { class: "sg-audio-name" },
        document.createTextNode(l.filename)
      );
      c.append(p), l.duration != null && c.append(u(
        "span",
        { class: "sg-audio-duration" },
        document.createTextNode(_e(l.duration))
      ));
    }
    return c;
  };
}
function Ca(t, { preferHowler: s } = {}) {
  return s && typeof window < "u" && window.Howl ? new La(t) : new Sa(t);
}
class Sa {
  constructor(s) {
    this.audio = new Audio(), this.audio.preload = "metadata", this.audio.src = s, this._evMap = { load: "loadedmetadata", end: "ended", play: "play", pause: "pause", error: "error" }, this._handlers = /* @__PURE__ */ new Map();
  }
  play() {
    return this.audio.play();
  }
  pause() {
    this.audio.pause();
  }
  seek(s) {
    if (s == null) return this.audio.currentTime || 0;
    this.audio.currentTime = Math.max(0, s);
  }
  duration() {
    const s = this.audio.duration;
    return Number.isFinite(s) ? s : 0;
  }
  isPlaying() {
    return !this.audio.paused && !this.audio.ended;
  }
  on(s, e) {
    const n = this._evMap[s] || s;
    this.audio.addEventListener(n, e), this._handlers.set(e, [n, e]);
  }
  off(s, e) {
    const n = this._handlers.get(e);
    n && this.audio.removeEventListener(n[0], n[1]), this._handlers.delete(e);
  }
  destroy() {
    try {
      this.audio.pause();
    } catch {
    }
    this.audio.src = "", this._handlers.clear();
  }
  backendName() {
    return "native";
  }
}
class La {
  constructor(s) {
    this.howl = new window.Howl({ src: [s], html5: !0, preload: !0 });
  }
  play() {
    this.howl.play();
  }
  pause() {
    this.howl.pause();
  }
  seek(s) {
    if (s == null) {
      const e = this.howl.seek();
      return typeof e == "number" ? e : 0;
    }
    this.howl.seek(Math.max(0, s));
  }
  duration() {
    return this.howl.duration() || 0;
  }
  isPlaying() {
    return this.howl.playing();
  }
  on(s, e) {
    this.howl.on(s, e);
  }
  off(s, e) {
    this.howl.off(s, e);
  }
  destroy() {
    try {
      this.howl.unload();
    } catch {
    }
  }
  backendName() {
    return "howler";
  }
}
let Ge = null;
function Zt(t, s) {
  Te();
  const e = t._sgAudio || lr(s.value);
  if (!e) return;
  const n = t._sgAudioOpts || { preferHowler: !0, skipSeconds: 10 }, r = Ca(e.url, n), i = u("div", { class: "sg-audio-player", role: "dialog", "aria-label": "Audio player" });
  i.addEventListener("mousedown", (R) => R.stopPropagation());
  const o = u("div", { class: "sg-audio-player-header" }), a = u(
    "div",
    { class: "sg-audio-player-name", title: e.filename },
    document.createTextNode(e.filename)
  ), l = u("div", { class: "sg-audio-player-meta" }), c = [];
  e.byte_size != null && c.push(ke(e.byte_size)), r.backendName() === "howler" && c.push("howler.js"), l.textContent = c.join(" · ");
  const d = u("button", {
    type: "button",
    class: "sg-audio-player-close",
    "aria-label": "Close player"
  });
  d.innerHTML = xa, d.addEventListener("click", Te), o.append(a, l, d);
  const p = u("div", {
    class: "sg-audio-track",
    role: "slider",
    "aria-label": "Seek",
    tabindex: "0",
    "aria-valuemin": "0",
    "aria-valuemax": "0",
    "aria-valuenow": "0"
  }), f = u("div", { class: "sg-audio-track-fill" }), g = u("div", { class: "sg-audio-track-thumb" });
  p.append(f, g);
  const h = u("div", { class: "sg-audio-times" }), b = u("span", { class: "sg-audio-time-current" }, document.createTextNode("0:00")), m = u(
    "span",
    { class: "sg-audio-time-total" },
    document.createTextNode(e.duration ? _e(e.duration) : "--:--")
  );
  h.append(b, m);
  const _ = u("div", { class: "sg-audio-transport" }), y = u("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Back ${n.skipSeconds}s`,
    "aria-label": `Back ${n.skipSeconds} seconds`
  });
  y.innerHTML = va;
  const w = u("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-play",
    title: "Play / pause (Space)",
    "aria-label": "Play",
    "data-state": "paused"
  });
  w.innerHTML = ht;
  const x = u("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Forward ${n.skipSeconds}s`,
    "aria-label": `Forward ${n.skipSeconds} seconds`
  });
  x.innerHTML = _a, _.append(y, w, x), i.append(o, p, h, _);
  let S = e.duration ?? 0, N = !1, T = null;
  function k(R) {
    const G = Math.max(0, Math.min(100, R));
    f.style.width = G + "%", g.style.left = G + "%";
  }
  function $() {
    const R = r.seek(), Q = r.duration() || 0 || S || 0;
    if (Q > 0 && Q !== S && (S = Q, m.textContent = _e(S), p.setAttribute("aria-valuemax", String(Math.floor(S)))), !N) {
      const J = S > 0 ? R / S * 100 : 0;
      k(J), b.textContent = _e(R), p.setAttribute("aria-valuenow", String(Math.floor(R)));
    }
  }
  function M() {
    $(), r.isPlaying() ? T = requestAnimationFrame(M) : T = null;
  }
  function D() {
    T == null && (T = requestAnimationFrame(M));
  }
  function V() {
    T != null && cancelAnimationFrame(T), T = null;
  }
  const I = () => {
    S = r.duration(), $();
  }, B = () => {
    w.dataset.state = "playing", w.innerHTML = wa, w.setAttribute("aria-label", "Pause"), D();
  }, F = () => {
    w.dataset.state = "paused", w.innerHTML = ht, w.setAttribute("aria-label", "Play"), V(), $();
  }, q = () => {
    w.dataset.state = "paused", w.innerHTML = ht, w.setAttribute("aria-label", "Play"), V(), r.seek(0), $();
  };
  r.on("load", I), r.on("play", B), r.on("pause", F), r.on("end", q), w.addEventListener("click", (R) => {
    R.stopPropagation(), r.isPlaying() ? r.pause() : r.play();
  }), y.addEventListener("click", (R) => {
    R.stopPropagation(), r.seek(Math.max(0, r.seek() - n.skipSeconds)), $();
  }), x.addEventListener("click", (R) => {
    R.stopPropagation();
    const G = r.duration();
    r.seek(Math.min(G || 1 / 0, r.seek() + n.skipSeconds)), $();
  });
  function ee(R) {
    const G = p.getBoundingClientRect(), Q = (R.clientX ?? 0) - G.left, J = Math.max(0, Math.min(1, Q / G.width)), Bt = r.duration() || S;
    if (!Bt) return;
    const Ht = J * Bt;
    r.seek(Ht), k(J * 100), b.textContent = _e(Ht);
  }
  p.addEventListener("pointerdown", (R) => {
    R.preventDefault(), N = !0, p.setPointerCapture?.(R.pointerId), p.classList.add("is-dragging"), ee(R);
  }), p.addEventListener("pointermove", (R) => {
    N && ee(R);
  });
  const X = (R) => {
    if (N) {
      N = !1, p.classList.remove("is-dragging");
      try {
        p.releasePointerCapture?.(R.pointerId);
      } catch {
      }
    }
  };
  p.addEventListener("pointerup", X), p.addEventListener("pointercancel", X), p.addEventListener("keydown", (R) => {
    const G = r.duration() || S;
    if (!G) return;
    const Q = R.shiftKey ? 30 : 5;
    let J = null;
    R.key === "ArrowLeft" ? J = Math.max(0, r.seek() - Q) : R.key === "ArrowRight" ? J = Math.min(G, r.seek() + Q) : R.key === "Home" ? J = 0 : R.key === "End" && (J = G), J != null && (R.preventDefault(), r.seek(J), $());
  });
  function te(R) {
    R.key === "Escape" ? (R.preventDefault(), Te()) : (R.key === " " || R.code === "Space") && i.contains(document.activeElement) && (R.preventDefault(), r.isPlaying() ? r.pause() : r.play());
  }
  function O(R) {
    !i.contains(R.target) && !t.contains(R.target) && Te();
  }
  document.addEventListener("keydown", te), setTimeout(() => document.addEventListener("mousedown", O), 0), document.body.appendChild(i), z(i, t), $(), w.focus(), Ge = {
    pop: i,
    backend: r,
    onKey: te,
    onDocClick: O,
    cleanup: () => {
      V();
      try {
        r.off("load", I), r.off("play", B), r.off("pause", F), r.off("end", q);
      } catch {
      }
      r.destroy();
    }
  };
}
function Te() {
  if (!Ge) return;
  const { pop: t, onKey: s, onDocClick: e, cleanup: n } = Ge;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), n(), t.remove(), Ge = null;
}
function dr({
  truthy: t = kt,
  disabled: s = !1
} = {}) {
  return (e) => {
    const { value: n, row: r, col: i, api: o, td: a } = e;
    a && a.classList.add("sg-renderer-switch-cell");
    const l = n == null || n === "", c = !l && t(n), d = u("button", {
      type: "button",
      class: `sg-renderer-switch${c ? " is-on" : ""}${l ? " is-null" : ""}`,
      role: "switch",
      "aria-checked": l ? "mixed" : c ? "true" : "false",
      "aria-label": i?.field || "toggle",
      disabled: s ? "" : null
    });
    return d.append(u("span", { class: "sg-renderer-switch-thumb", "aria-hidden": "true" })), d.addEventListener("click", (p) => {
      if (p.stopPropagation(), s) return;
      const f = l ? !0 : !c, g = r && i?.field != null ? r[i.field] : null;
      r && i?.field != null && (r[i.field] = f), o?.applyTransaction && o.applyTransaction({ update: [r] });
      const h = a?.closest('[data-controller~="grid"]');
      h && h.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: r?.id ?? r?._sg_id, colId: i?.field, oldValue: g, newValue: f }
      }));
    }), d;
  };
}
const ka = /^(https?:\/\/|mailto:)/i;
function Le(t) {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Ct(t) {
  let s = t;
  return s = s.replace(/`([^`\n]+)`/g, (e, n) => `<code>${n}</code>`), s = s.replace(/\[([^\]\n]+)\]\(([^)\n]+)\)/g, (e, n, r) => ka.test(r) ? `<a href="${r}" target="_blank" rel="noopener noreferrer">${n}</a>` : e), s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>"), s = s.replace(/__([^_\n]+)__/g, "<strong>$1</strong>"), s = s.replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), s = s.replace(/(^|[\s(])_([^_\n]+?)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), s = s.replace(/~~([^~\n]+)~~/g, "<del>$1</del>"), s;
}
function Ea(t) {
  const s = t.split(`
`), e = [];
  let n = null, r = [];
  const i = () => {
    n && (e.push(`<${n}>${r.map((o) => `<li>${Ct(o)}</li>`).join("")}</${n}>`), n = null, r = []);
  };
  for (const o of s) {
    const a = /^\s*[-*]\s+(.+)$/.exec(o), l = /^\s*\d+\.\s+(.+)$/.exec(o);
    a ? (n && n !== "ul" && i(), n = "ul", r.push(a[1])) : l ? (n && n !== "ol" && i(), n = "ol", r.push(l[1])) : (i(), o.trim() === "" ? e.push("") : e.push(Ct(o)));
  }
  return i(), e.join("<br>").replace(/(<br>){2,}/g, "<br><br>");
}
function ur({ inline: t = !1 } = {}) {
  return ({ value: s, td: e }) => {
    if (L(s)) return "";
    const n = Le(s), r = t ? Ct(n) : Ea(n);
    if (e) {
      e.classList.add("sg-renderer-markdown-cell");
      const o = e.parentElement;
      o && o.tagName === "TR" && o.classList.add("sg-has-multiline");
    }
    const i = u("div", { class: `sg-renderer-markdown${t ? " is-inline" : ""}` });
    return i.innerHTML = r, i;
  };
}
function $a(t) {
  return Le(t).replace(/(&quot;(?:[^&\\]|\\.)*?&quot;)\s*:/g, '<span class="sg-json-key">$1</span>:').replace(/:\s*(&quot;(?:[^&\\]|\\.)*?&quot;)/g, ': <span class="sg-json-string">$1</span>').replace(/(?<=[\s:,\[])(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)(?=[\s,\]\}\n])/g, '<span class="sg-json-number">$1</span>').replace(/(?<=[\s:,\[])(true|false)(?=[\s,\]\}\n])/g, '<span class="sg-json-bool">$1</span>').replace(/(?<=[\s:,\[])(null)(?=[\s,\]\}\n])/g, '<span class="sg-json-null">$1</span>');
}
function Ta(t, s) {
  const e = Array.isArray(t), n = e ? t : Object.entries(t), r = n.slice(0, s), i = n.length - r.length, o = (c) => {
    if (c == null) return "null";
    const d = typeof c;
    return d === "string" ? c.length > 18 ? `"${c.slice(0, 15)}…"` : `"${c}"` : d === "number" || d === "boolean" ? String(c) : Array.isArray(c) ? `[${c.length}]` : d === "object" ? "{…}" : String(c);
  }, a = e ? r.map(o).join(", ") : r.map(([c, d]) => `${c}: ${o(d)}`).join(", "), l = i > 0 ? `, +${i}` : "";
  return e ? `[${a}${l}]` : `{ ${a}${l} }`;
}
function pr({ maxKeys: t = 3, indent: s = 2 } = {}) {
  return ({ value: e, td: n }) => {
    if (e == null || e === "") return "";
    let r = e;
    if (typeof e == "string")
      try {
        r = JSON.parse(e);
      } catch {
        return String(e);
      }
    if (r == null)
      return u("span", { class: "sg-renderer-json-scalar sg-json-null" }, document.createTextNode("null"));
    if (typeof r != "object") {
      const c = typeof r, d = c === "string" ? "sg-json-string" : c === "number" ? "sg-json-number" : "sg-json-bool", p = c === "string" ? `"${r}"` : String(r);
      return u("span", { class: `sg-renderer-json-scalar ${d}` }, document.createTextNode(p));
    }
    const i = document.createElement("details");
    i.className = "sg-renderer-json";
    const o = document.createElement("summary");
    o.className = "sg-renderer-json-summary";
    const a = u("span", { class: "sg-renderer-json-chevron", "aria-hidden": "true" });
    a.innerHTML = yn, o.append(a), o.append(u(
      "span",
      { class: "sg-renderer-json-summary-text" },
      document.createTextNode(Ta(r, t))
    ));
    const l = document.createElement("pre");
    if (l.className = "sg-renderer-json-pre", l.innerHTML = $a(JSON.stringify(r, null, s)), i.append(o, l), o.addEventListener("click", (c) => c.stopPropagation()), n) {
      n.classList.add("sg-renderer-json-cell");
      const c = n.parentElement;
      c && c.tagName === "TR" && c.classList.add("sg-has-multiline");
    }
    return i;
  };
}
function fr({
  lookup: t = null,
  windowKey: s = "__sgLinks",
  showThumb: e = !0,
  href: n = null,
  multiple: r = !1,
  fallback: i = (o) => String(o)
} = {}) {
  return ({ value: o, row: a }) => {
    if (L(o)) return "";
    const l = r ? Array.isArray(o) ? o : String(o).split(",").map((d) => d.trim()).filter(Boolean) : [o], c = u("span", { class: "sg-renderer-linked-records" });
    for (const d of l) {
      const p = Aa(d, a, t, s);
      c.append(Na(d, a, p, { showThumb: e, href: n, fallback: i }));
    }
    return c;
  };
}
function Aa(t, s, e, n) {
  if (typeof e == "function") return e(t, s) || null;
  if (typeof window > "u") return null;
  const r = window[n];
  return r ? r instanceof Map ? r.get(t) || r.get(String(t)) || null : typeof r == "object" ? r[t] ?? r[String(t)] ?? null : null : null;
}
function Na(t, s, e, { showThumb: n, href: r, fallback: i }) {
  const o = e?.name ?? i(t), a = typeof r == "function" ? r(t, s, e) : e?.href || null, l = document.createElement(a ? "a" : "span");
  if (l.className = "sg-renderer-linked-record", a && (l.href = a, l.target = "_blank", l.rel = "noopener noreferrer", l.addEventListener("click", (c) => c.stopPropagation())), e?.color && l.style.setProperty("--lr-tint", e.color), n && e?.thumb)
    l.append(u("img", {
      src: e.thumb,
      alt: "",
      class: "sg-renderer-linked-record-thumb",
      loading: "lazy",
      decoding: "async"
    }));
  else if (n && o) {
    const c = String(o).split(/\s+/).filter(Boolean).slice(0, 2).map((d) => d[0]?.toUpperCase() || "").join("");
    c && l.append(u("span", {
      class: "sg-renderer-linked-record-initials",
      "aria-hidden": "true"
    }, document.createTextNode(c)));
  }
  return l.append(u(
    "span",
    { class: "sg-renderer-linked-record-name" },
    document.createTextNode(o)
  )), l;
}
function gr({
  separator: t = ",",
  colorMap: s = {},
  defaultColor: e = "gray"
} = {}) {
  const n = {};
  for (const [r, i] of Object.entries(s)) n[String(r).toLowerCase()] = i;
  return ({ value: r }) => {
    if (L(r)) return "";
    const i = Array.isArray(r) ? r : String(r).split(t), o = u("div", { class: "sg-renderer-coloured-tags" });
    for (const a of i) {
      const l = String(a).trim();
      if (!l) continue;
      const c = n[l.toLowerCase()] || e, d = u(
        "span",
        { class: "sg-renderer-coloured-tag" },
        document.createTextNode(l)
      );
      /^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/.test(c) ? d.classList.add(`sg-pill-${c}`) : (d.style.background = c, d.style.color = hr(c)), o.append(d);
    }
    return o;
  };
}
function hr(t) {
  const s = Gn(t);
  return s ? jn(s) ? "#1f2937" : "#ffffff" : "inherit";
}
function At(t) {
  if (t == null || t === "") return null;
  if (t instanceof Date)
    return Number.isNaN(t.valueOf()) ? null : { h: t.getHours(), m: t.getMinutes(), s: t.getSeconds() };
  if (typeof t == "number" && Number.isFinite(t)) {
    const r = (t % 86400 + 86400) % 86400;
    return { h: Math.floor(r / 3600), m: Math.floor(r % 3600 / 60), s: Math.floor(r % 60) };
  }
  const s = String(t).trim(), e = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/.exec(s);
  if (e)
    return { h: parseInt(e[1], 10), m: parseInt(e[2], 10), s: e[3] ? parseInt(e[3], 10) : 0 };
  const n = new Date(s);
  return Number.isNaN(n.valueOf()) ? null : { h: n.getHours(), m: n.getMinutes(), s: n.getSeconds() };
}
function mr({
  style: t = "24h",
  // '24h' | '12h'
  seconds: s = !1,
  locale: e = void 0
} = {}) {
  return ({ value: n }) => {
    const r = At(n);
    if (!r) return "";
    if (t === "12h") {
      const a = /* @__PURE__ */ new Date(0);
      return a.setHours(r.h, r.m, r.s), new Intl.DateTimeFormat(e, {
        hour: "numeric",
        minute: "2-digit",
        ...s ? { second: "2-digit" } : {},
        hour12: !0
      }).format(a);
    }
    const i = (a) => String(a).padStart(2, "0"), o = s ? `:${i(r.s)}` : "";
    return `${i(r.h)}:${i(r.m)}${o}`;
  };
}
function Ma(t) {
  if (Array.isArray(t)) return { from: t[0], to: t[1] };
  if (t && typeof t == "object")
    return {
      from: t.from ?? t.old ?? t.before ?? t.previous ?? null,
      to: t.to ?? t.new ?? t.after ?? t.current ?? null
    };
  const s = String(t), e = /^(.*?)\s*(?:→|->|=>|—>)\s*(.+)$/.exec(s);
  return e ? { from: e[1].trim(), to: e[2].trim() } : { from: null, to: s };
}
function br({
  style: t = "inline",
  // 'inline' | 'stacked'
  arrow: s = "→",
  showArrow: e = !0
} = {}) {
  return ({ value: n }) => {
    if (L(n)) return "";
    const { from: r, to: i } = Ma(n), o = (l) => l == null || l === "";
    if (o(r) && o(i)) return "";
    if (o(r))
      return u(
        "span",
        { class: "sg-renderer-diff is-added" },
        u("span", { class: "sg-diff-to" }, document.createTextNode(String(i)))
      );
    if (o(i))
      return u(
        "span",
        { class: "sg-renderer-diff is-removed" },
        u("span", { class: "sg-diff-from" }, document.createTextNode(String(r)))
      );
    const a = u("span", { class: `sg-renderer-diff is-${t}` });
    return a.append(u("span", { class: "sg-diff-from" }, document.createTextNode(String(r)))), e && a.append(u(
      "span",
      { class: "sg-diff-arrow", "aria-hidden": "true" },
      document.createTextNode(s)
    )), a.append(u("span", { class: "sg-diff-to" }, document.createTextNode(String(i)))), a;
  };
}
function Da(t) {
  if (t == null || t === "") return null;
  if (Array.isArray(t)) {
    const r = Number(t[0]), i = Number(t[1]);
    return Number.isFinite(r) && Number.isFinite(i) ? { lat: r, lng: i } : null;
  }
  if (typeof t == "object") {
    const r = Number(t.lat ?? t.latitude), i = Number(t.lng ?? t.long ?? t.lon ?? t.longitude);
    return Number.isFinite(r) && Number.isFinite(i) ? { lat: r, lng: i } : null;
  }
  const s = String(t).split(",");
  if (s.length !== 2) return null;
  const e = Number(s[0].trim()), n = Number(s[1].trim());
  return Number.isFinite(e) && Number.isFinite(n) ? { lat: e, lng: n } : null;
}
function Xt(t, s) {
  const e = t >= 0 ? 1 : -1, n = Math.abs(t), r = Math.floor(n), i = (n - r) * 60, o = Math.floor(i), a = (i - o) * 60, l = s ? e > 0 ? "N" : "S" : e > 0 ? "E" : "W";
  return `${r}°${String(o).padStart(2, "0")}'${a.toFixed(1)}"${l}`;
}
function yr({
  decimals: t = 4,
  style: s = "decimal",
  // 'decimal' | 'dms'
  mapUrl: e = (o, a) => `https://www.google.com/maps?q=${o},${a}`,
  linkText: n = "View on Maps",
  staticMap: r = null,
  // (lat, lng) => url
  staticSize: i = 72
} = {}) {
  return ({ value: o }) => {
    const a = Da(o);
    if (!a) return "";
    const l = u("span", { class: "sg-renderer-geo" });
    if (typeof r == "function") {
      const p = r(a.lat, a.lng);
      p && l.append(u("img", {
        src: p,
        alt: "",
        class: "sg-renderer-geo-thumb",
        width: String(i),
        height: String(i),
        loading: "lazy",
        decoding: "async"
      }));
    }
    const c = s === "dms" ? `${Xt(a.lat, !0)} ${Xt(a.lng, !1)}` : `${a.lat.toFixed(t)}, ${a.lng.toFixed(t)}`;
    l.append(u("span", { class: "sg-renderer-geo-coords" }, document.createTextNode(c)));
    const d = e(a.lat, a.lng);
    if (d) {
      const p = u("a", {
        class: "sg-renderer-geo-link sg-renderer-link",
        href: d,
        target: "_blank",
        rel: "noopener noreferrer",
        title: "Open in maps"
      }, document.createTextNode(n));
      p.addEventListener("click", (f) => f.stopPropagation()), l.append(p);
    }
    return l;
  };
}
function wr({
  moduleSize: t = 3,
  margin: s = 2,
  background: e = "#fff",
  foreground: n = "#111827",
  showText: r = !1
} = {}) {
  return ({ value: i }) => {
    if (L(i)) return "";
    const o = String(i);
    let a;
    try {
      const c = Eo(o);
      a = Po(c, { moduleSize: t, margin: s, background: e, foreground: n });
    } catch {
      return u(
        "span",
        { class: "sg-renderer-qr-overflow", title: o },
        document.createTextNode("QR · too long")
      );
    }
    const l = u("span", { class: "sg-renderer-qr" });
    return l.innerHTML = a, r && l.append(u("span", { class: "sg-renderer-qr-text" }, document.createTextNode(o))), l;
  };
}
function vr({
  language: t = null,
  copy: s = !0
} = {}) {
  return ({ value: e, td: n }) => {
    if (L(e)) return "";
    const r = String(e);
    if (n) {
      n.classList.add("sg-renderer-code-cell");
      const a = n.parentElement;
      a && a.tagName === "TR" && a.classList.add("sg-has-multiline");
    }
    const i = u("div", { class: "sg-renderer-code" });
    if (t && i.append(u(
      "span",
      { class: "sg-renderer-code-lang" },
      document.createTextNode(String(t))
    )), s) {
      const a = u("button", {
        type: "button",
        class: "sg-renderer-code-copy",
        title: "Copy",
        "aria-label": "Copy code"
      });
      a.innerHTML = st, a.addEventListener("click", async (l) => {
        l.stopPropagation();
        try {
          navigator.clipboard?.writeText ? await navigator.clipboard.writeText(r) : Fn(r), a.innerHTML = In, a.classList.add("is-copied"), setTimeout(() => {
            a.innerHTML = st, a.classList.remove("is-copied");
          }, 1200);
        } catch {
        }
      }), i.append(a);
    }
    const o = u("pre", { class: "sg-renderer-code-pre" });
    return o.textContent = r, i.append(o), i;
  };
}
const Ra = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M225.8 468.2L46.9 295.4C18.9 268.2 0 230.1 0 187.8C0 117.4 56.1 60 125.7 60c25.3 0 51 9.2 70.3 25.4L256 138l60-52.6C335.3 69.2 361 60 386.3 60C455.9 60 512 117.4 512 187.8c0 42.3-18.9 80.4-46.9 107.6L286.2 468.2c-7.2 7.4-17.1 11.8-27.6 11.8c-10.5 0-20.4-4.4-27.6-11.8z"/></svg>', Pa = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75.1c16.3-13.2 28.9-30.4 36.6-50l8.1-20.3c5-12.4 11.3-24.2 19-35.2l4.4-6.3 0 0c1.4-2 1.1-4.7-.6-6.4l0 0c-3.8-3.8-9.9-3.8-13.7 0L208.8 84.9c-3 3-7 4.7-11.3 4.7c-8.8 0-16-7.2-16-16V63.4c0-8.8 7.2-16 16-16h.5c8.8 0 16 7.2 16 16v6.2c34-2.4 71-13 100-25.6c11-4.8 22.1-9.3 33-13.6l1-.4c12-4.6 27.3-9.3 41.4-9.3z"/></svg>', Ia = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75.1c16.3 13.2 28.9 30.4 36.6 50l8.1 20.3c5 12.4 11.3 24.2 19 35.2l4.4 6.3c1.4 2 1.1 4.7-.6 6.4c-3.8 3.8-9.9 3.8-13.7 0L208.8 427.1c-3-3-7-4.7-11.3-4.7c-8.8 0-16 7.2-16 16v10.2c0 8.8 7.2 16 16 16h.5c8.8 0 16-7.2 16-16v-6.2c34 2.4 71 13 100 25.6c11 4.8 22.1 9.3 33 13.6l1 .4c12 4.6 27.3 9.3 41.4 9.3z"/></svg>', mt = ["😞", "😕", "😐", "🙂", "😄"], Jt = {
  star: ve,
  heart: Ra
}, Qt = {
  star: "#f59e0b",
  heart: "#ec4899"
};
function _r({
  icon: t = "heart",
  max: s = 5,
  precision: e = 0.5,
  color: n = null
} = {}) {
  if (t === "smiley") return Va({ max: s });
  if (t === "thumb") return Fa();
  if (t === "nps") return Ba();
  const r = Jt[t] || Jt.heart, i = n || Qt[t] || Qt.heart, o = e > 0 ? 1 / e : 2;
  return ({ value: a }) => {
    let l = parseFloat(a);
    Number.isFinite(l) || (l = 0), l = Math.max(0, Math.min(s, l)), l = Math.round(l * o) / o;
    const c = u("div", {
      class: `sg-renderer-rating is-${t}`,
      style: `--rating-color: ${i};`,
      role: "img",
      "aria-label": `${l} out of ${s}`
    });
    for (let d = 1; d <= s; d++)
      if (l >= d)
        c.append(u("span", { class: "sg-renderer-rating-glyph is-full" }, r));
      else if (l > d - 1) {
        const p = Math.round((l - (d - 1)) * 100);
        c.append(u(
          "span",
          { class: "sg-renderer-rating-glyph is-partial" },
          `${r}<span class="sg-rating-clip" style="width:${p}%;">${r}</span>`
        ));
      } else
        c.append(u("span", { class: "sg-renderer-rating-glyph is-empty" }, r));
    return c;
  };
}
function Va({ max: t = 5 } = {}) {
  return ({ value: s }) => {
    let e = parseFloat(s);
    if (!Number.isFinite(e)) return "";
    e = Math.max(1, Math.min(t, Math.round(e)));
    const n = Math.min(
      mt.length - 1,
      Math.floor((e - 1) / (t - 1 || 1) * (mt.length - 1))
    );
    return u("span", {
      class: "sg-renderer-rating-smiley",
      title: `${e}/${t}`
    }, document.createTextNode(mt[n]));
  };
}
function Fa() {
  return ({ value: t }) => {
    if (t == null || t === "") return "";
    const s = Number(t);
    if (!Number.isFinite(s)) return "";
    const e = u("span", { class: "sg-renderer-rating-thumb" });
    return s > 0 ? (e.classList.add("is-up"), e.title = "Thumbs up", e.innerHTML = Pa) : s < 0 ? (e.classList.add("is-down"), e.title = "Thumbs down", e.innerHTML = Ia) : (e.classList.add("is-neutral"), e.title = "Neutral", e.append(document.createTextNode("—"))), e;
  };
}
function Ba() {
  return ({ value: t }) => {
    const s = parseFloat(t);
    if (!Number.isFinite(s)) return "";
    const e = Math.max(0, Math.min(10, Math.round(s))), n = e <= 6 ? "detractor" : e <= 8 ? "passive" : "promoter", r = n === "detractor" ? "Detractor" : n === "passive" ? "Passive" : "Promoter";
    return u("span", {
      class: `sg-renderer-rating-nps is-${n}`,
      title: `${e}/10 · ${r}`
    }, document.createTextNode(String(e)));
  };
}
const Ha = ["#e5e7eb", "#d1d5db", "#9ca3af"];
function xr({
  min: t = 0,
  max: s = 100,
  target: e = null,
  ranges: n = null,
  // [a] | [a, b] | [a, b, c]
  rangeColors: r = Ha,
  barColor: i = "#111827",
  targetColor: o = "#111827",
  width: a = 120,
  height: l = 16
} = {}) {
  return ({ value: c }) => {
    let d, p, f;
    if (c && typeof c == "object" && !Array.isArray(c) ? (d = Number(c.value), p = c.target != null ? Number(c.target) : e, f = c.ranges || n) : (d = Number(c), p = e, f = n), !Number.isFinite(d)) return "";
    const g = s - t || 1, h = (S) => Math.max(t, Math.min(s, S)), b = (S) => (h(S) - t) / g * a, m = f && f.length ? f.map(Number) : [t + g * 0.6, t + g * 0.8], _ = [t, ...m, s];
    let y = "";
    for (let S = 0; S < _.length - 1; S++) {
      const N = b(_[S]), T = b(_[S + 1]) - N, k = r[S] || r[r.length - 1];
      y += `<rect x="${N.toFixed(2)}" y="0" width="${T.toFixed(2)}" height="${l}" fill="${k}"/>`;
    }
    const w = l * 0.42, x = (l - w) / 2;
    if (y += `<rect x="0" y="${x.toFixed(2)}" width="${b(d).toFixed(2)}" height="${w.toFixed(2)}" fill="${i}"/>`, p != null && Number.isFinite(p)) {
      const S = b(p), N = l * 0.85, T = (l - N) / 2;
      y += `<rect x="${(S - 1).toFixed(2)}" y="${T.toFixed(2)}" width="2" height="${N.toFixed(2)}" fill="${o}"/>`;
    }
    return `<svg class="sg-renderer-bullet" viewBox="0 0 ${a} ${l}" width="${a}" height="${l}" preserveAspectRatio="none" aria-hidden="true">` + y + "</svg>";
  };
}
function Cr({
  size: t = 28,
  thickness: s = 5,
  color: e = "green",
  background: n = "#e5e7eb",
  showValue: r = !0,
  inline: i = !1
} = {}) {
  const o = Et[e] || e;
  return ({ value: a }) => {
    let l = Number(a);
    if (!Number.isFinite(l)) return "";
    l = Math.max(0, Math.min(100, l));
    const c = (t - s) / 2, d = t / 2, p = t / 2, f = 2 * Math.PI * c, g = f * (1 - l / 100), h = `<text x="${d}" y="${p + 0.5}" text-anchor="middle" dominant-baseline="middle" font-size="${(t * 0.32).toFixed(1)}" font-weight="600" fill="currentColor">${Math.round(l)}</text>`, b = `<svg class="sg-renderer-donut" viewBox="0 0 ${t} ${t}" width="${t}" height="${t}" aria-hidden="true"><circle cx="${d}" cy="${p}" r="${c}" fill="none" stroke="${n}" stroke-width="${s}"/><circle cx="${d}" cy="${p}" r="${c}" fill="none" stroke="${o}" stroke-width="${s}" stroke-dasharray="${f.toFixed(2)}" stroke-dashoffset="${g.toFixed(2)}" stroke-linecap="round" transform="rotate(-90 ${d} ${p})"/>` + (r && !i ? h : "") + "</svg>";
    return i && r ? `<span class="sg-renderer-donut-wrap">${b}<span class="sg-renderer-donut-label">${Math.round(l)}%</span></span>` : b;
  };
}
function Sr({
  width: t = 120,
  height: s = 32,
  color: e = "blue",
  highlightMax: n = !1,
  gap: r = 1,
  binLabels: i = null,
  showCount: o = !1
} = {}) {
  const a = Et[e] || e;
  return ({ value: l, td: c }) => {
    if (l == null || l === "") return "";
    c && c.classList.add("sg-renderer-histogram-cell");
    let d = l, p = i;
    if (l && typeof l == "object" && !Array.isArray(l) && (d = l.counts, p = l.labels || i), !Array.isArray(d)) return "";
    const f = d.map(Number).filter(Number.isFinite);
    if (f.length === 0) return "";
    const g = Math.max(...f, 1), h = f.reduce((k, $) => k + $, 0), b = p && p.length ? 10 : 0, m = 1, _ = 1, y = t - m * 2, w = s - _ * 2 - b, x = Math.max(1, (y - (f.length - 1) * r) / f.length);
    let S = "";
    for (let k = 0; k < f.length; k++) {
      const $ = f[k], M = $ / g * w, D = m + k * (x + r), V = _ + w - M, I = n ? $ === g ? 1 : 0.45 : 0.85, B = p && p[k] != null ? `${p[k]}: ${$}` : `Bin ${k + 1}: ${$}`;
      S += `<rect x="${D.toFixed(2)}" y="${V.toFixed(2)}" width="${x.toFixed(2)}" height="${M.toFixed(2)}" fill="${a}" fill-opacity="${I}"><title>${Le(B)}</title></rect>`;
    }
    let N = "";
    if (p && p.length)
      for (let k = 0; k < f.length && k < p.length; k++) {
        const $ = m + k * (x + r) + x / 2;
        N += `<text x="${$.toFixed(2)}" y="${(s - 1).toFixed(2)}" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.65">${Le(p[k])}</text>`;
      }
    const T = `<svg class="sg-renderer-histogram" viewBox="0 0 ${t} ${s}" width="${t}" height="${s}" preserveAspectRatio="none" aria-hidden="true">` + S + N + "</svg>";
    return o ? `<span class="sg-renderer-histogram-wrap">${T}<span class="sg-renderer-histogram-total">n=${h}</span></span>` : T;
  };
}
const St = {
  red: "red",
  r: "red",
  critical: "red",
  high: "red",
  detractor: "red",
  danger: "red",
  amber: "amber",
  a: "amber",
  warn: "amber",
  medium: "amber",
  passive: "amber",
  yellow: "amber",
  green: "green",
  g: "green",
  ok: "green",
  low: "green",
  promoter: "green",
  safe: "green"
}, Oa = { red: "#ef4444", amber: "#f59e0b", green: "#10b981" };
function Lr({
  size: t = 10,
  thresholds: s = null,
  inverted: e = !1,
  showLabel: n = !1
} = {}) {
  return ({ value: r }) => {
    if (L(r)) return "";
    let i;
    if (s && Number.isFinite(Number(r))) {
      const a = Number(r), l = e ? s[1] : s[0], c = e ? s[0] : s[1];
      e ? i = a >= l ? "red" : a >= c ? "amber" : "green" : i = a <= l ? "red" : a <= c ? "amber" : "green";
    } else if (i = St[String(r).toLowerCase()] || null, !i) return "";
    const o = u("span", {
      class: `sg-renderer-rag is-${i}`,
      title: n ? null : i.charAt(0).toUpperCase() + i.slice(1)
    });
    return o.append(u("span", {
      class: "sg-renderer-rag-dot",
      style: `width:${t}px; height:${t}px; background:${Oa[i]};`,
      "aria-label": i
    })), n && o.append(u(
      "span",
      { class: "sg-renderer-rag-label" },
      document.createTextNode(i.charAt(0).toUpperCase() + i.slice(1))
    )), o;
  };
}
function kr({
  steps: t = ["Pending", "Shipped", "Delivered"],
  color: s = "#2563eb",
  showLabels: e = !1
} = {}) {
  return ({ value: n, td: r }) => {
    if (L(n)) return "";
    r && r.classList.add("sg-renderer-timeline-cell");
    let i = -1;
    if (Number.isFinite(Number(n)))
      i = Math.max(0, Math.min(t.length - 1, Math.floor(Number(n))));
    else {
      const a = String(n).toLowerCase();
      i = t.findIndex((l) => String(l).toLowerCase() === a);
    }
    if (i < 0) return "";
    const o = u("div", {
      class: `sg-renderer-timeline${e ? " has-labels" : ""}`,
      style: `--ts-color: ${s};`,
      role: "list",
      "aria-label": `Step ${i + 1} of ${t.length}: ${t[i]}`
    });
    for (let a = 0; a < t.length; a++) {
      const l = a < i ? "past" : a === i ? "current" : "future", c = u("span", { class: `sg-timeline-step is-${l}`, role: "listitem" });
      if (c.append(u("span", { class: "sg-timeline-dot", title: t[a], "aria-label": t[a] })), e && c.append(u("span", { class: "sg-timeline-label" }, document.createTextNode(t[a]))), o.append(c), a < t.length - 1) {
        const d = a < i ? "past" : "future";
        o.append(u("span", { class: `sg-timeline-line is-${d}`, "aria-hidden": "true" }));
      }
    }
    return o;
  };
}
const Ga = /([@#][a-zA-Z0-9_\-]+)/g;
function Er({
  mentionHref: t = null,
  tagHref: s = null
} = {}) {
  return ({ value: e }) => {
    if (L(e)) return "";
    const n = String(e), r = u("span", { class: "sg-renderer-mentions" }), i = n.split(Ga);
    for (const o of i)
      if (o)
        if (o[0] === "@") {
          const a = o.slice(1), l = typeof t == "function" ? t(a) : null;
          r.append(en(o, l, "sg-renderer-mention"));
        } else if (o[0] === "#") {
          const a = o.slice(1), l = typeof s == "function" ? s(a) : null;
          r.append(en(o, l, "sg-renderer-hashtag"));
        } else
          r.append(document.createTextNode(o));
    return r;
  };
}
function en(t, s, e) {
  const n = s ? u("a", { href: s, target: "_blank", rel: "noopener noreferrer", class: e }) : u("span", { class: e });
  return s && n.addEventListener("click", (r) => r.stopPropagation()), n.append(document.createTextNode(t)), n;
}
function $r({
  chars: t = null,
  lines: s = null,
  moreLabel: e = "Read more",
  lessLabel: n = "Show less"
} = {}) {
  return ({ value: r, td: i }) => {
    if (L(r)) return "";
    const o = String(r), a = t && o.length > t;
    if (!a && !s) return o;
    if (i) {
      i.classList.add("sg-renderer-expand-cell");
      const d = i.parentElement;
      d && d.tagName === "TR" && d.classList.add("sg-has-multiline");
    }
    const l = u("div", { class: "sg-renderer-expand" });
    let c = !1;
    if (a) {
      const d = o.slice(0, t).trimEnd() + "…", p = u(
        "span",
        { class: "sg-renderer-expand-short" },
        document.createTextNode(d)
      ), f = u(
        "span",
        { class: "sg-renderer-expand-full", hidden: "" },
        document.createTextNode(o)
      ), g = u(
        "button",
        { type: "button", class: "sg-renderer-expand-toggle" },
        document.createTextNode(e)
      );
      g.addEventListener("click", (h) => {
        h.stopPropagation(), c = !c, p.hidden = c, f.hidden = !c, g.textContent = c ? n : e;
      }), l.append(p, f, document.createTextNode(" "), g);
    } else {
      const d = u("div", { class: "sg-renderer-expand-clamp" });
      d.style.setProperty("--sg-clamp", String(s)), d.textContent = o;
      const p = u(
        "button",
        { type: "button", class: "sg-renderer-expand-toggle" },
        document.createTextNode(e)
      );
      p.addEventListener("click", (f) => {
        f.stopPropagation(), c = !c, d.classList.toggle("is-expanded", c), p.textContent = c ? n : e;
      }), l.append(d, p);
    }
    return l;
  };
}
function Tr({
  unit: t = "kilometer",
  unitDisplay: s = "short",
  decimals: e,
  locale: n = void 0,
  ...r
} = {}) {
  const i = { style: "unit", unit: t, unitDisplay: s, ...r };
  e != null && (i.minimumFractionDigits = e, i.maximumFractionDigits = e);
  let o;
  try {
    o = new Intl.NumberFormat(n, i);
  } catch {
    const l = e != null ? { minimumFractionDigits: e, maximumFractionDigits: e } : {};
    o = new Intl.NumberFormat(n, l);
  }
  return ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-number"), L(a)) return "";
    const c = Number(a);
    return Number.isFinite(c) ? o.format(c) : String(a);
  };
}
const ja = /^((25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(25[0-5]|2[0-4]\d|[01]?\d?\d)$/, za = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|:(:[0-9a-fA-F]{1,4}){1,7}|::)$/;
function Ua(t) {
  return ja.test(t);
}
function Ka(t) {
  return za.test(t);
}
function Ar({
  countryField: t = null
} = {}) {
  return ({ value: s, row: e }) => {
    if (L(s)) return "";
    const n = String(s).trim(), r = Ua(n), i = !r && Ka(n);
    if (!r && !i)
      return u("span", {
        class: "sg-renderer-ip is-invalid",
        title: "Invalid IP address"
      }, document.createTextNode(n));
    const o = u("span", {
      class: `sg-renderer-ip ${i ? "is-v6" : "is-v4"}`,
      title: r ? "IPv4" : "IPv6"
    });
    if (t && e?.[t]) {
      const a = String(e[t]).trim().toUpperCase();
      if (/^[A-Z]{2}$/.test(a)) {
        const l = String.fromCodePoint(
          127462 + a.charCodeAt(0) - 65,
          127462 + a.charCodeAt(1) - 65
        );
        o.append(u("span", {
          class: "sg-renderer-ip-flag",
          "aria-hidden": "true"
        }, document.createTextNode(l)));
      }
    }
    return o.append(u(
      "span",
      { class: "sg-renderer-ip-text" },
      document.createTextNode(n)
    )), o;
  };
}
const Wa = {
  "01": "ANZ",
  "03": "Westpac",
  "06": "CBA",
  "08": "NAB",
  11: "St.George",
  12: "BankSA",
  18: "Macquarie",
  76: "BoQ",
  80: "Cuscal",
  93: "RBA",
  94: "Bendigo",
  96: "Citibank",
  53: "PayPal AU",
  63: "Bendigo",
  73: "AMP",
  92: "Beyond Bank",
  "07": "Westpac",
  "09": "NAB"
};
function Nr({
  banks: t = Wa,
  showBank: s = !0
} = {}) {
  return ({ value: e }) => {
    if (L(e)) return "";
    const n = String(e).trim(), r = n.replace(/\D/g, "");
    if (r.length !== 6)
      return u("span", {
        class: "sg-renderer-invalid",
        title: "Invalid BSB — must be 6 digits"
      }, document.createTextNode(n));
    const i = `${r.slice(0, 3)}-${r.slice(3)}`, o = r.slice(0, 2), a = t[o], l = u("span", { class: "sg-renderer-bsb" });
    return l.append(u(
      "span",
      { class: "sg-renderer-bsb-number sg-renderer-mono" },
      document.createTextNode(i)
    )), s && a && l.append(u(
      "span",
      { class: "sg-renderer-bsb-bank" },
      document.createTextNode(a)
    )), l;
  };
}
function qa(t) {
  const s = String(t).replace(/\s+/g, "");
  if (s.length !== 9 || !/^\d{9}$/.test(s)) return !1;
  const e = [8, 7, 6, 5, 4, 3, 2, 1];
  let n = 0;
  for (let r = 0; r < 8; r++) n += parseInt(s[r], 10) * e[r];
  return parseInt(s[8], 10) === (10 - n % 10) % 10;
}
function Ya(t) {
  const s = String(t).replace(/\D/g, "");
  return s.length !== 9 ? String(t) : `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6)}`;
}
function Mr() {
  return ({ value: t }) => {
    if (L(t)) return "";
    if (!qa(t))
      return u("span", {
        class: "sg-renderer-invalid",
        title: "Invalid ACN (checksum failed)"
      }, document.createTextNode(String(t)));
    const s = String(t).replace(/\s+/g, "");
    return u("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/Search/ResultsActiveASIC?SearchText=${s}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(Ya(t)));
  };
}
function Dr() {
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-mask-numeric"), L(t)) return "";
    const e = String(t), n = e.replace(/\D/g, "");
    if (n.length < 8 || n.length > 9)
      return u("span", {
        class: "sg-renderer-invalid",
        title: "Invalid TFN — must be 8 or 9 digits"
      }, document.createTextNode(e));
    const r = n.slice(-3), i = n.length - 3, o = "•".repeat(i);
    return n.length === 9 ? `${o.slice(0, 3)} ${o.slice(3)} ${r}` : `${o.slice(0, 2)} ${o.slice(2)} ${r}`;
  };
}
function Za(t) {
  if (t.length !== 10 || !/^[2-6]\d{9}$/.test(t)) return !1;
  const s = [1, 3, 7, 9, 1, 3, 7, 9];
  let e = 0;
  for (let n = 0; n < 8; n++) e += parseInt(t[n], 10) * s[n];
  return e % 10 === parseInt(t[8], 10);
}
function Rr() {
  return ({ value: t }) => {
    if (L(t)) return "";
    const s = String(t).trim().replace(/\s+/g, ""), e = /^(\d{10})(?:[\/-]?(\d))?$/.exec(s);
    if (!e || !Za(e[1]))
      return u("span", {
        class: "sg-renderer-invalid",
        title: e ? "Invalid Medicare (checksum failed)" : "Invalid Medicare format"
      }, document.createTextNode(String(t)));
    const n = e[1], r = e[2], i = `${n.slice(0, 4)} ${n.slice(4, 9)} ${n.slice(9)}` + (r ? ` / ${r}` : "");
    return u(
      "span",
      { class: "sg-renderer-medicare sg-renderer-mono" },
      document.createTextNode(i)
    );
  };
}
function Pr({ preload: t = "none" } = {}) {
  return ({ value: s }) => L(s) ? "" : u("audio", {
    class: "sg-renderer-audio",
    controls: "",
    preload: t,
    src: String(s).trim()
  });
}
function Ir({ width: t = 200, preload: s = "metadata" } = {}) {
  return ({ value: e }) => L(e) ? "" : u("video", {
    class: "sg-renderer-video",
    controls: "",
    preload: s,
    src: String(e).trim(),
    width: String(t)
  });
}
function Vr({ sort: t = "count" } = {}) {
  return ({ value: s }) => {
    if (L(s)) return "";
    let e = [];
    if (Array.isArray(s))
      e = s.map((r) => Array.isArray(r) ? r : [r.emoji ?? r.name ?? "?", r.count ?? r.n ?? 0]);
    else if (typeof s == "object")
      e = Object.entries(s);
    else
      return "";
    if (e = e.filter(([, r]) => Number.isFinite(Number(r)) && Number(r) > 0), t === "count" && e.sort((r, i) => Number(i[1]) - Number(r[1])), e.length === 0) return "";
    const n = u("span", { class: "sg-renderer-reactions" });
    for (const [r, i] of e) {
      const o = u("span", { class: "sg-reaction", title: `${i} ${r}` });
      o.append(u("span", { class: "sg-reaction-emoji" }, document.createTextNode(String(r)))), o.append(u("span", { class: "sg-reaction-count" }, document.createTextNode(String(i)))), n.append(o);
    }
    return n;
  };
}
function Fr({ icon: t = "💬" } = {}) {
  return ({ value: s }) => {
    if (L(s)) return "";
    let e = "", n = null;
    typeof s == "object" ? (e = s.value ?? s.text ?? "", n = s.count ?? s.comments ?? null) : Number.isFinite(Number(s)) && typeof s != "string" ? n = Number(s) : e = String(s);
    const r = u("span", { class: "sg-renderer-comment-count" });
    if (e && r.append(u("span", { class: "sg-cc-value" }, document.createTextNode(String(e)))), n != null && Number(n) > 0) {
      const i = u("span", {
        class: "sg-cc-badge",
        title: `${n} comment${Number(n) === 1 ? "" : "s"}`
      }), o = u("span", { class: "sg-cc-icon", "aria-hidden": "true" });
      typeof t == "string" && t.trimStart().startsWith("<svg") ? o.innerHTML = t : o.append(document.createTextNode(String(t))), i.append(o), i.append(u("span", { class: "sg-cc-num" }, document.createTextNode(String(n)))), r.append(i);
    }
    return r;
  };
}
function Br({ locale: t = void 0 } = {}) {
  const e = new Intl.Locale(t || Intl.NumberFormat().resolvedOptions().locale).language === "en", n = e ? new Intl.PluralRules(t, { type: "ordinal" }) : null, r = { one: "st", two: "nd", few: "rd", other: "th" };
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), L(i)) return "";
    const a = Number(i);
    return Number.isInteger(a) ? e ? `${a}${r[n.select(a)]}` : String(a) : String(i);
  };
}
function Hr({
  one: t = "item",
  other: s = "items",
  zero: e = null,
  locale: n = void 0
} = {}) {
  const r = new Intl.PluralRules(n);
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), L(i)) return "";
    const a = Number(i);
    return Number.isFinite(a) ? a === 0 && e ? `${a} ${e}` : r.select(a) === "one" ? `${a} ${t}` : `${a} ${s}` : String(i);
  };
}
const Xa = /* @__PURE__ */ new Set(["", "null", "nil", "none", "n/a", "na", "-", "—"]);
function Or({
  placeholder: t = "—",
  emptyOnTokens: s = !0
} = {}) {
  return ({ value: e }) => e == null || typeof e == "string" && (e === "" || s && Xa.has(e.trim().toLowerCase())) ? u(
    "span",
    { class: "sg-renderer-empty", title: "Empty" },
    document.createTextNode(t)
  ) : String(e);
}
function Ja(t) {
  let s = 0, e = !1;
  for (let n = t.length - 1; n >= 0; n--) {
    let r = parseInt(t[n], 10);
    e && (r *= 2, r > 9 && (r -= 9)), s += r, e = !e;
  }
  return s % 10 === 0;
}
function Qa(t) {
  return /^4\d{12}(\d{3,6})?$/.test(t) ? "visa" : /^(5[1-5]\d{14}|2(2[2-9]|[3-6]\d|7[01]|720)\d{12})$/.test(t) ? "mastercard" : /^3[47]\d{13}$/.test(t) ? "amex" : /^(6011\d{12,15}|65\d{14,17}|64[4-9]\d{13}|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9([01]\d|2[0-5]))\d{10,13})$/.test(t) ? "discover" : /^35(2[89]|[3-8]\d)\d{12}$/.test(t) ? "jcb" : /^3(0[0-5]|[68]\d|9\d)\d{11}$/.test(t) ? "diners" : null;
}
function Gr({ mask: t = !0 } = {}) {
  return ({ value: s, td: e }) => {
    if (e && e.classList.add("sg-renderer-number"), L(s)) return "";
    const n = String(s).replace(/\D/g, ""), r = n.length >= 13 && n.length <= 19, i = r && Ja(n), o = r ? Qa(n) : null, a = u("span", { class: `sg-renderer-card${i ? "" : " is-invalid"}` });
    o && a.append(u("span", {
      class: `sg-renderer-card-brand is-${o}`,
      title: o[0].toUpperCase() + o.slice(1)
    }, document.createTextNode(o === "mastercard" ? "MC" : o.toUpperCase())));
    let l;
    if (!r)
      l = String(s);
    else {
      const c = t ? "•".repeat(n.length - 4) + n.slice(-4) : n;
      o === "amex" || o === "diners" ? l = `${c.slice(0, 4)} ${c.slice(4, 10)} ${c.slice(10)}` : l = c.match(/.{1,4}/g).join(" ");
    }
    return a.append(u(
      "span",
      { class: "sg-renderer-card-num sg-renderer-mono" },
      document.createTextNode(l)
    )), a;
  };
}
function jr({
  width: t = "70%",
  height: s = "12px"
} = {}) {
  return ({ value: e }) => e != null && e !== "" && e !== "loading" && e !== "…" ? String(e) : u("span", {
    class: "sg-renderer-shimmer",
    style: `width: ${t}; height: ${s};`,
    "aria-label": "Loading"
  });
}
function ue(t) {
  return Array.isArray(t) ? t.map((s) => s == null ? null : typeof s == "object" ? { value: s.value, label: s.label ?? String(s.value), color: s.color || null, icon: s.icon || null } : { value: s, label: String(s), color: null, icon: null }).filter(Boolean) : [];
}
function pe(t, s) {
  const e = u("span", { class: "sg-renderer-select-pill" });
  return t.color ? s.test(t.color) ? e.classList.add(`sg-pill-${t.color}`) : (e.style.background = t.color, e.style.color = hr(t.color)) : e.classList.add("sg-renderer-select-pill-bare"), t.icon && e.append(u("span", { class: "sg-renderer-select-pill-icon", "aria-hidden": "true" }, t.icon)), e.append(u(
    "span",
    { class: "sg-renderer-select-pill-label" },
    document.createTextNode(t.label)
  )), e;
}
const fe = /^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/;
function Nt(t, s) {
  const e = t?.col?.cellRendererConfig || null, n = t?.col?.enumValues || null;
  return {
    options: s.options.length ? s.options : e?.options || n || [],
    placeholder: e?.placeholder ?? s.placeholder,
    clearable: e?.clearable ?? s.clearable,
    colorMap: e?.colorMap ?? s.colorMap,
    editable: e?.editable ?? s.editable,
    separator: e?.separator ?? s.separator
  };
}
function zr({
  options: t = [],
  placeholder: s = "Select…",
  editable: e = !0,
  clearable: n = !1,
  colorMap: r = null
} = {}) {
  const i = ue(t);
  if (r && typeof r == "object")
    for (const o of i)
      !o.color && Object.prototype.hasOwnProperty.call(r, o.value) && (o.color = r[o.value]);
  return (o) => {
    const { value: a, td: l } = o, c = Nt(o, { options: i, placeholder: s, clearable: n, colorMap: r, editable: e });
    let d = i;
    if (i.length === 0 && c.options.length && (d = ue(c.options), c.colorMap && typeof c.colorMap == "object"))
      for (const f of d)
        !f.color && Object.prototype.hasOwnProperty.call(c.colorMap, f.value) && (f.color = c.colorMap[f.value]);
    l && (l.classList.add("sg-renderer-select-cell"), l._sgSelectOpts = d, l._sgSelectClearable = c.clearable), c.editable && l && !l._sgSelectEditBound && (l._sgSelectEditBound = !0, l.addEventListener("dblclick", (f) => {
      f._sgSelectHandled || (f._sgSelectHandled = !0, f.stopPropagation(), Ur(l, o));
    }));
    const p = d.find((f) => String(f.value) === String(a)) || null;
    return p ? pe(p, fe) : L(a) ? u(
      "span",
      { class: "sg-renderer-select-placeholder" },
      document.createTextNode(c.placeholder)
    ) : u("span", { class: "sg-renderer-select-bare" }, document.createTextNode(String(a)));
  };
}
function Z(t) {
  if (!t) return;
  const s = t.closest('[data-controller~="grid"]');
  if (s)
    try {
      s.focus({ preventScroll: !0 });
    } catch {
    }
}
let je = null;
function Ur(t, s) {
  Ae();
  const e = t._sgSelectOpts || [], n = t._sgSelectClearable, { row: r, col: i } = s, o = r && i?.field != null ? r[i.field] : null, a = u("div", { class: "sg-renderer-select-popover", role: "listbox" });
  a.addEventListener("mousedown", (p) => p.stopPropagation());
  function l(p) {
    const { api: f } = s, g = r && i?.field != null ? r[i.field] : null;
    r && i?.field != null && (r[i.field] = p), f?.applyTransaction && f.applyTransaction({ update: [r] });
    const h = t.closest('[data-controller~="grid"]');
    h && h.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: r?.id ?? r?._sg_id, colId: i?.field, oldValue: g, newValue: p }
    })), Ae();
  }
  if (n) {
    const p = u("button", {
      type: "button",
      class: "sg-renderer-select-option sg-renderer-select-option-none",
      role: "option"
    }, document.createTextNode("(none)"));
    p.addEventListener("click", () => l(null)), a.append(p);
  }
  for (const p of e) {
    const f = u("button", {
      type: "button",
      class: `sg-renderer-select-option${String(p.value) === String(o) ? " is-selected" : ""}`,
      role: "option"
    });
    f.append(pe(p, fe)), f.addEventListener("click", () => l(p.value)), a.append(f);
  }
  function c(p) {
    p.key === "Escape" && (p.stopPropagation(), Ae());
  }
  function d(p) {
    !a.contains(p.target) && !t.contains(p.target) && Ae();
  }
  document.addEventListener("keydown", c), setTimeout(() => document.addEventListener("mousedown", d), 0), document.body.appendChild(a), z(a, t), je = { pop: a, onKey: c, onDocClick: d, anchor: t };
}
function Ae() {
  if (!je) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = je;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), je = null, Z(n);
}
function Kr(t) {
  return t == null || t === "" ? [] : Array.isArray(t) ? t.map(String) : String(t).split(",").map((s) => s.trim()).filter(Boolean);
}
function Wr({
  options: t = [],
  separator: s = ",",
  placeholder: e = "Add tags…",
  editable: n = !0,
  colorMap: r = null
} = {}) {
  const i = ue(t);
  if (r && typeof r == "object")
    for (const o of i)
      !o.color && Object.prototype.hasOwnProperty.call(r, o.value) && (o.color = r[o.value]);
  return (o) => {
    const { value: a, td: l } = o, c = Nt(o, { options: i, placeholder: e, colorMap: r, editable: n, separator: s });
    let d = i;
    if (i.length === 0 && c.options.length && (d = ue(c.options), c.colorMap && typeof c.colorMap == "object"))
      for (const g of d)
        !g.color && Object.prototype.hasOwnProperty.call(c.colorMap, g.value) && (g.color = c.colorMap[g.value]);
    l && (l.classList.add("sg-renderer-multiselect-cell"), l._sgMultiOpts = d, l._sgMultiSep = c.separator), c.editable && l && !l._sgMultiEditBound && (l._sgMultiEditBound = !0, l.addEventListener("dblclick", (g) => {
      g._sgMultiHandled || (g._sgMultiHandled = !0, g.stopPropagation(), el(l, o));
    }));
    const p = Kr(a);
    if (!p.length)
      return u(
        "span",
        { class: "sg-renderer-multiselect-placeholder" },
        document.createTextNode(c.placeholder)
      );
    const f = u("div", { class: "sg-renderer-multiselect" });
    for (const g of p) {
      const h = d.find((b) => String(b.value) === String(g)) || { label: g, color: null, icon: null };
      f.append(pe(h, fe));
    }
    return f;
  };
}
let ze = null;
function el(t, s) {
  bt();
  const e = t._sgMultiOpts || [], n = t._sgMultiSep || ",", { row: r, col: i } = s, o = Kr(r && i?.field != null ? r[i.field] : null), a = new Set(o), l = u("div", { class: "sg-renderer-multiselect-popover", role: "listbox", "aria-multiselectable": "true" });
  l.addEventListener("mousedown", (h) => h.stopPropagation());
  function c(h) {
    const b = a.has(String(h.value)), m = u("button", {
      type: "button",
      class: `sg-renderer-multiselect-option${b ? " is-selected" : ""}`,
      role: "option",
      "aria-selected": b ? "true" : "false"
    });
    return m.append(u(
      "span",
      { class: `sg-renderer-multiselect-check${b ? " is-on" : ""}` },
      document.createTextNode(b ? "✓" : "")
    )), m.append(pe(h, fe)), m.addEventListener("click", () => {
      a.has(String(h.value)) ? a.delete(String(h.value)) : a.add(String(h.value)), l.replaceChildren(), d();
    }), m;
  }
  function d() {
    for (const h of e) l.append(c(h));
  }
  d();
  function p() {
    const { api: h } = s, b = Array.from(a), m = r && i?.field != null ? r[i.field] : null, _ = Array.isArray(m) || m == null ? b : b.join(n), y = m;
    r && i?.field != null && (r[i.field] = _), h?.applyTransaction && h.applyTransaction({ update: [r] });
    const w = t.closest('[data-controller~="grid"]');
    w && w.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: r?.id ?? r?._sg_id, colId: i?.field, oldValue: y, newValue: _ }
    })), bt();
  }
  function f(h) {
    h.key === "Escape" && (h.stopPropagation(), bt()), h.key === "Enter" && (h.stopPropagation(), h.preventDefault(), p());
  }
  function g(h) {
    !l.contains(h.target) && !t.contains(h.target) && p();
  }
  document.addEventListener("keydown", f), setTimeout(() => document.addEventListener("mousedown", g), 0), document.body.appendChild(l), z(l, t), ze = { pop: l, onKey: f, onDocClick: g, anchor: t };
}
function bt() {
  if (!ze) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = ze;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), ze = null, Z(n);
}
function qr({
  options: t = [],
  placeholder: s = "Search…",
  editable: e = !0,
  allowCustom: n = !1,
  colorMap: r = null
} = {}) {
  const i = ue(t);
  if (r && typeof r == "object")
    for (const o of i)
      !o.color && Object.prototype.hasOwnProperty.call(r, o.value) && (o.color = r[o.value]);
  return (o) => {
    const { value: a, td: l } = o, c = Nt(o, { options: i, placeholder: s, colorMap: r, editable: e }), d = o?.col?.cellRendererConfig?.allowCustom ?? n;
    let p = i;
    if (i.length === 0 && c.options.length && (p = ue(c.options), c.colorMap && typeof c.colorMap == "object"))
      for (const g of p)
        !g.color && Object.prototype.hasOwnProperty.call(c.colorMap, g.value) && (g.color = c.colorMap[g.value]);
    l && (l.classList.add("sg-renderer-combobox-cell"), l._sgComboOpts = p, l._sgComboAllowCustom = d, l._sgComboPlaceholder = c.placeholder), c.editable && l && !l._sgComboEditBound && (l._sgComboEditBound = !0, l.addEventListener("dblclick", (g) => {
      g._sgComboHandled || (g._sgComboHandled = !0, g.stopPropagation(), tl(l, o));
    }));
    const f = p.find((g) => String(g.value) === String(a)) || null;
    return f ? pe(f, fe) : L(a) ? u(
      "span",
      { class: "sg-renderer-select-placeholder" },
      document.createTextNode(c.placeholder)
    ) : u("span", { class: "sg-renderer-select-bare" }, document.createTextNode(String(a)));
  };
}
let Ue = null;
function tl(t, s) {
  he();
  const e = t._sgComboOpts || [], n = !!t._sgComboAllowCustom, r = t._sgComboPlaceholder || "Search…", { row: i, col: o } = s;
  let a = "", l = 0;
  const c = u("div", { class: "sg-renderer-combobox-popover", role: "combobox" });
  c.addEventListener("mousedown", (y) => y.stopPropagation());
  const d = u("input", {
    type: "search",
    class: "sg-renderer-combobox-input",
    placeholder: r,
    autocomplete: "off"
  });
  c.append(d);
  const p = u("div", { class: "sg-renderer-combobox-list", role: "listbox" });
  c.append(p);
  function f(y) {
    const { api: w } = s, x = i && o?.field != null ? i[o.field] : null;
    i && o?.field != null && (i[o.field] = y), w?.applyTransaction && w.applyTransaction({ update: [i] });
    const S = t.closest('[data-controller~="grid"]');
    S && S.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: i?.id ?? i?._sg_id, colId: o?.field, oldValue: x, newValue: y }
    })), he();
  }
  function g() {
    const y = a.trim().toLowerCase();
    return y ? e.filter((w) => String(w.label).toLowerCase().includes(y)) : e;
  }
  function h() {
    p.replaceChildren();
    const y = g();
    if (l >= y.length && (l = Math.max(0, y.length - 1)), y.forEach((w, x) => {
      const S = u("button", {
        type: "button",
        class: `sg-renderer-combobox-option${x === l ? " is-highlighted" : ""}`,
        role: "option",
        "aria-selected": x === l ? "true" : "false"
      });
      S.append(pe(w, fe)), S.addEventListener("mouseenter", () => {
        l = x, b();
      }), S.addEventListener("click", () => f(w.value)), p.append(S);
    }), y.length === 0) {
      const w = u("div", { class: "sg-renderer-combobox-empty" });
      n && a.trim() ? w.append(document.createTextNode(`Press Enter to add "${a.trim()}"`)) : w.append(document.createTextNode("No matches")), p.append(w);
    }
  }
  function b() {
    p.querySelectorAll(".sg-renderer-combobox-option").forEach((y, w) => {
      y.classList.toggle("is-highlighted", w === l), y.setAttribute("aria-selected", w === l ? "true" : "false");
    });
  }
  d.addEventListener("input", () => {
    a = d.value, l = 0, h();
  }), d.addEventListener("keydown", (y) => {
    const w = g();
    y.key === "ArrowDown" ? (y.preventDefault(), l = Math.min(w.length - 1, l + 1), b()) : y.key === "ArrowUp" ? (y.preventDefault(), l = Math.max(0, l - 1), b()) : y.key === "Enter" ? (y.preventDefault(), w[l] ? f(w[l].value) : n && a.trim() && f(a.trim())) : y.key === "Escape" && (y.stopPropagation(), he());
  });
  function m(y) {
    y.key === "Escape" && (y.stopPropagation(), he());
  }
  function _(y) {
    !c.contains(y.target) && !t.contains(y.target) && he();
  }
  document.addEventListener("keydown", m), setTimeout(() => document.addEventListener("mousedown", _), 0), document.body.appendChild(c), z(c, t), h(), setTimeout(() => d.focus(), 0), Ue = { pop: c, onKey: m, onDocClick: _, anchor: t };
}
function he() {
  if (!Ue) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Ue;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Ue = null, Z(n);
}
function Ce(t) {
  if (!t) return "";
  const s = t.getFullYear(), e = String(t.getMonth() + 1).padStart(2, "0"), n = String(t.getDate()).padStart(2, "0");
  return `${s}-${e}-${n}`;
}
function de(t, s) {
  return t && s && t.getFullYear() === s.getFullYear() && t.getMonth() === s.getMonth() && t.getDate() === s.getDate();
}
function Yr({
  locale: t = void 0,
  dateStyle: s = "medium",
  editable: e = !0,
  empty: n = "",
  min: r = null,
  max: i = null,
  firstDayOfWeek: o = 1
  // 0 = Sunday, 1 = Monday (default)
} = {}) {
  const a = new Intl.DateTimeFormat(t, { dateStyle: s });
  return (l) => {
    const { value: c, td: d } = l, p = l?.col?.cellRendererConfig || {}, f = p.min ? U(p.min) : r ? U(r) : null, g = p.max ? U(p.max) : i ? U(i) : null, h = p.firstDayOfWeek ?? o, b = p.editable ?? e;
    d && (d.classList.add("sg-renderer-datepicker-cell"), d._sgDatePickerMin = f, d._sgDatePickerMax = g, d._sgDatePickerFdow = h), b && d && !d._sgDatePickerBound && (d._sgDatePickerBound = !0, d.addEventListener("dblclick", (_) => {
      _._sgDatePickerHandled || (_._sgDatePickerHandled = !0, _.stopPropagation(), rl(d, l));
    }));
    const m = U(c);
    return m ? u(
      "span",
      { class: "sg-renderer-datepicker-value" },
      document.createTextNode(a.format(m))
    ) : n ? document.createTextNode(n) : "";
  };
}
let Ke = null;
const Zr = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
], Xr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function nl(t, s, e, n, r, i, o) {
  const a = u("div", { class: "sg-renderer-datepicker-cal" }), l = u("div", { class: "sg-renderer-datepicker-head" }), c = u(
    "button",
    { type: "button", class: "sg-renderer-datepicker-nav", "aria-label": "Previous month" },
    document.createTextNode("‹")
  ), d = u(
    "span",
    { class: "sg-renderer-datepicker-title" },
    document.createTextNode(`${Zr[s]} ${t}`)
  ), p = u(
    "button",
    { type: "button", class: "sg-renderer-datepicker-nav", "aria-label": "Next month" },
    document.createTextNode("›")
  );
  l.append(c, d, p);
  const f = u("div", { class: "sg-renderer-datepicker-dows" });
  for (let y = 0; y < 7; y++)
    f.append(u(
      "span",
      { class: "sg-renderer-datepicker-dow" },
      document.createTextNode(Xr[(y + o) % 7])
    ));
  const g = u("div", { class: "sg-renderer-datepicker-grid" }), b = (new Date(t, s, 1).getDay() - o + 7) % 7, m = new Date(t, s, 1 - b), _ = /* @__PURE__ */ new Date();
  for (let y = 0; y < 42; y++) {
    const w = new Date(m.getFullYear(), m.getMonth(), m.getDate() + y), x = w.getMonth() === s, S = de(w, e), N = de(w, _), T = r && w < r || i && w > i, k = ["sg-renderer-datepicker-day"];
    x || k.push("is-other-month"), S && k.push("is-selected"), N && k.push("is-today"), T && k.push("is-disabled");
    const $ = u("button", {
      type: "button",
      class: k.join(" "),
      disabled: T ? "" : null,
      title: Ce(w)
    }, document.createTextNode(String(w.getDate())));
    $.addEventListener("click", () => n(w)), g.append($);
  }
  return a.append(l, f, g), { wrap: a, prev: c, next: p, title: d };
}
function rl(t, s) {
  Ne();
  const { row: e, col: n } = s, r = U(e && n?.field != null ? e[n.field] : null);
  let i = (r || /* @__PURE__ */ new Date()).getFullYear(), o = (r || /* @__PURE__ */ new Date()).getMonth(), a = r;
  const l = t._sgDatePickerMin || null, c = t._sgDatePickerMax || null, d = t._sgDatePickerFdow ?? 1, p = u("div", { class: "sg-renderer-datepicker-popover", role: "dialog" });
  p.addEventListener("mousedown", (m) => m.stopPropagation());
  function f(m) {
    const { api: _ } = s, y = e && n?.field != null ? e[n.field] : null, w = m ? Ce(m) : null;
    e && n?.field != null && (e[n.field] = w), _?.applyTransaction && _.applyTransaction({ update: [e] });
    const x = t.closest('[data-controller~="grid"]');
    x && x.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: e?.id ?? e?._sg_id, colId: n?.field, oldValue: y, newValue: w }
    })), Ne();
  }
  function g() {
    p.replaceChildren();
    const { wrap: m, prev: _, next: y } = nl(i, o, a, f, l, c, d);
    _.addEventListener("click", () => {
      o === 0 ? (o = 11, i -= 1) : o -= 1, g();
    }), y.addEventListener("click", () => {
      o === 11 ? (o = 0, i += 1) : o += 1, g();
    });
    const w = u("div", { class: "sg-renderer-datepicker-footer" }), x = u(
      "button",
      { type: "button", class: "sg-renderer-datepicker-today" },
      document.createTextNode("Today")
    );
    x.addEventListener("click", () => f(/* @__PURE__ */ new Date()));
    const S = u(
      "button",
      { type: "button", class: "sg-renderer-datepicker-clear" },
      document.createTextNode("Clear")
    );
    S.addEventListener("click", () => f(null)), w.append(x, S), p.append(m, w);
  }
  function h(m) {
    m.key === "Escape" && (m.stopPropagation(), Ne());
  }
  function b(m) {
    !p.contains(m.target) && !t.contains(m.target) && Ne();
  }
  document.addEventListener("keydown", h), setTimeout(() => document.addEventListener("mousedown", b), 0), document.body.appendChild(p), g(), z(p, t), Ke = { pop: p, onKey: h, onDocClick: b, anchor: t };
}
function Ne() {
  if (!Ke) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Ke;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Ke = null, Z(n);
}
function Jr({
  style: t = "24h",
  // '24h' | '12h'
  minuteStep: s = 5,
  editable: e = !0,
  empty: n = "—"
} = {}) {
  return (r) => {
    const { value: i, td: o } = r, a = r?.col?.cellRendererConfig || {}, l = a.style ?? t, c = a.minuteStep ?? s, d = a.editable ?? e;
    o && (o.classList.add("sg-renderer-timepicker-cell"), o._sgTimePickerStyle = l, o._sgTimePickerStep = c), d && o && !o._sgTimePickerBound && (o._sgTimePickerBound = !0, o.addEventListener("dblclick", (f) => {
      f._sgTimePickerHandled || (f._sgTimePickerHandled = !0, f.stopPropagation(), il(o, r));
    }));
    const p = At(i);
    return p ? u(
      "span",
      { class: "sg-renderer-timepicker-value" },
      document.createTextNode(sl(p, l))
    ) : n;
  };
}
function sl(t, s) {
  const e = String(t.m).padStart(2, "0");
  if (s === "12h") {
    const n = t.h >= 12 ? "PM" : "AM";
    return `${t.h % 12 || 12}:${e} ${n}`;
  }
  return `${String(t.h).padStart(2, "0")}:${e}`;
}
let We = null;
function il(t, s) {
  me();
  const e = t._sgTimePickerStyle || "24h", n = t._sgTimePickerStep || 5, { row: r, col: i } = s, o = At(r && i?.field != null ? r[i.field] : null) || { h: 9, m: 0 };
  let a = o.h, l = Math.round(o.m / n) * n;
  l >= 60 && (l = 0);
  const c = u("div", { class: "sg-renderer-timepicker-popover", role: "dialog" });
  c.addEventListener("mousedown", ($) => $.stopPropagation());
  function d($) {
    const { api: M } = s, D = r && i?.field != null ? r[i.field] : null;
    r && i?.field != null && (r[i.field] = $), M?.applyTransaction && M.applyTransaction({ update: [r] });
    const V = t.closest('[data-controller~="grid"]');
    V && V.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: r?.id ?? r?._sg_id, colId: i?.field, oldValue: D, newValue: $ }
    })), me();
  }
  function p() {
    const $ = String(a).padStart(2, "0"), M = String(l).padStart(2, "0");
    d(`${$}:${M}`);
  }
  const f = u("div", { class: "sg-renderer-timepicker-col" });
  f.append(u(
    "div",
    { class: "sg-renderer-timepicker-col-label" },
    document.createTextNode("Hour")
  ));
  const g = u("div", { class: "sg-renderer-timepicker-list" });
  f.append(g);
  function h() {
    g.replaceChildren();
    const $ = e === "12h" ? Array.from({ length: 12 }, (M, D) => D === 0 ? 12 : D) : Array.from({ length: 24 }, (M, D) => D);
    for (const M of $) {
      const D = e === "12h" ? a >= 12 ? M === 12 ? 12 : M + 12 : M === 12 ? 0 : M : M, V = D === a, I = u("button", {
        type: "button",
        class: `sg-renderer-timepicker-item${V ? " is-selected" : ""}`
      }, document.createTextNode(e === "12h" ? String(M) : String(M).padStart(2, "0")));
      I.addEventListener("click", () => {
        a = D, h();
      }), I.addEventListener("dblclick", () => {
        a = D, p();
      }), g.append(I), V && setTimeout(() => I.scrollIntoView({ block: "nearest" }), 0);
    }
  }
  const b = u("div", { class: "sg-renderer-timepicker-col" });
  b.append(u(
    "div",
    { class: "sg-renderer-timepicker-col-label" },
    document.createTextNode("Min")
  ));
  const m = u("div", { class: "sg-renderer-timepicker-list" });
  b.append(m);
  function _() {
    m.replaceChildren();
    for (let $ = 0; $ < 60; $ += n) {
      const M = $ === l, D = u("button", {
        type: "button",
        class: `sg-renderer-timepicker-item${M ? " is-selected" : ""}`
      }, document.createTextNode(String($).padStart(2, "0")));
      D.addEventListener("click", () => {
        l = $, _();
      }), D.addEventListener("dblclick", () => {
        l = $, p();
      }), m.append(D), M && setTimeout(() => D.scrollIntoView({ block: "nearest" }), 0);
    }
  }
  const y = u("div", { class: "sg-renderer-timepicker-cols" });
  if (y.append(f, b), e === "12h") {
    const $ = u("div", { class: "sg-renderer-timepicker-col" });
    $.append(u(
      "div",
      { class: "sg-renderer-timepicker-col-label" },
      document.createTextNode(" ")
    ));
    const M = u("div", { class: "sg-renderer-timepicker-list" });
    for (const D of ["AM", "PM"]) {
      const V = D === "AM" && a < 12 || D === "PM" && a >= 12, I = u("button", {
        type: "button",
        class: `sg-renderer-timepicker-item${V ? " is-selected" : ""}`
      }, document.createTextNode(D));
      I.addEventListener("click", () => {
        D === "AM" && a >= 12 && (a -= 12), D === "PM" && a < 12 && (a += 12), h(), M.querySelectorAll(".sg-renderer-timepicker-item").forEach((B, F) => {
          B.classList.toggle("is-selected", F === 0 && a < 12 || F === 1 && a >= 12);
        });
      }), M.append(I);
    }
    $.append(M), y.append($);
  }
  const w = u("div", { class: "sg-renderer-timepicker-footer" }), x = u(
    "button",
    { type: "button", class: "sg-renderer-timepicker-cancel" },
    document.createTextNode("Cancel")
  ), S = u(
    "button",
    { type: "button", class: "sg-renderer-timepicker-ok" },
    document.createTextNode("Set")
  ), N = u(
    "button",
    { type: "button", class: "sg-renderer-timepicker-clear" },
    document.createTextNode("Clear")
  );
  x.addEventListener("click", () => me()), N.addEventListener("click", () => d(null)), S.addEventListener("click", () => p()), w.append(N, x, S), c.append(y, w);
  function T($) {
    $.key === "Escape" && ($.stopPropagation(), me()), $.key === "Enter" && ($.stopPropagation(), $.preventDefault(), p());
  }
  function k($) {
    !c.contains($.target) && !t.contains($.target) && me();
  }
  document.addEventListener("keydown", T), setTimeout(() => document.addEventListener("mousedown", k), 0), document.body.appendChild(c), h(), _(), z(c, t), We = { pop: c, onKey: T, onDocClick: k, anchor: t };
}
function me() {
  if (!We) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = We;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), We = null, Z(n);
}
function Qr(t) {
  if (t == null || t === "") return null;
  let s, e;
  if (Array.isArray(t))
    [s, e] = t;
  else if (typeof t == "object")
    s = t.start || t.from, e = t.end || t.to;
  else if (typeof t == "string") {
    const i = t.split(/\s*\/\s*|\s*[–-]\s*/);
    [s, e] = i.length >= 2 ? i : [t, t];
  }
  const n = U(s), r = U(e);
  return !n && !r ? null : { start: n, end: r };
}
function ol(t, s) {
  if (!t) return "";
  const { start: e, end: n } = t;
  if (!e && !n) return "";
  if (!n || e && de(e, n))
    return new Intl.DateTimeFormat(s, { month: "short", day: "numeric", year: "numeric" }).format(e);
  if (!e)
    return `… – ${new Intl.DateTimeFormat(s, { month: "short", day: "numeric", year: "numeric" }).format(n)}`;
  const r = e.getFullYear() === n.getFullYear();
  if (r && e.getMonth() === n.getMonth()) {
    const a = new Intl.DateTimeFormat(s, { month: "short", day: "numeric" }).format(e), l = new Intl.DateTimeFormat(s, { day: "numeric", year: "numeric" }).format(n);
    return `${a} – ${l}`;
  }
  if (r) {
    const a = new Intl.DateTimeFormat(s, { month: "short", day: "numeric" }).format(e), l = new Intl.DateTimeFormat(s, { month: "short", day: "numeric", year: "numeric" }).format(n);
    return `${a} – ${l}`;
  }
  const o = new Intl.DateTimeFormat(s, { month: "short", day: "numeric", year: "numeric" });
  return `${o.format(e)} – ${o.format(n)}`;
}
function es({
  locale: t = void 0,
  editable: s = !0,
  empty: e = "—",
  firstDayOfWeek: n = 1
} = {}) {
  return (r) => {
    const { value: i, td: o } = r, a = r?.col?.cellRendererConfig || {}, l = a.firstDayOfWeek ?? n, c = a.editable ?? s;
    o && (o.classList.add("sg-renderer-daterange-cell"), o._sgRangeFdow = l), c && o && !o._sgRangeBound && (o._sgRangeBound = !0, o.addEventListener("dblclick", (p) => {
      p._sgRangeHandled || (p._sgRangeHandled = !0, p.stopPropagation(), al(o, r));
    }));
    const d = Qr(i);
    return d ? u(
      "span",
      { class: "sg-renderer-daterange-value" },
      document.createTextNode(ol(d, t))
    ) : e;
  };
}
let qe = null;
function al(t, s) {
  Me();
  const { row: e, col: n } = s, r = Qr(e && n?.field != null ? e[n.field] : null) || { start: null, end: null };
  let i = r.start, o = r.end, a = (i || /* @__PURE__ */ new Date()).getFullYear(), l = (i || /* @__PURE__ */ new Date()).getMonth();
  const c = t._sgRangeFdow ?? 1, d = u("div", { class: "sg-renderer-daterange-popover", role: "dialog" });
  d.addEventListener("mousedown", (_) => _.stopPropagation());
  function p() {
    const { api: _ } = s, y = e && n?.field != null ? e[n.field] : null, w = i || o ? { start: i ? Ce(i) : null, end: o ? Ce(o) : null } : null;
    e && n?.field != null && (e[n.field] = w), _?.applyTransaction && _.applyTransaction({ update: [e] });
    const x = t.closest('[data-controller~="grid"]');
    x && x.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: e?.id ?? e?._sg_id, colId: n?.field, oldValue: y, newValue: w }
    })), Me();
  }
  function f(_) {
    !i || i && o ? (i = _, o = null) : _ < i ? (o = i, i = _) : o = _, h();
  }
  function g(_, y) {
    const w = u("div", { class: "sg-renderer-datepicker-cal" }), x = u("div", { class: "sg-renderer-datepicker-head" }), S = u(
      "button",
      { type: "button", class: "sg-renderer-datepicker-nav" },
      document.createTextNode("‹")
    ), N = u(
      "span",
      { class: "sg-renderer-datepicker-title" },
      document.createTextNode(`${Zr[y]} ${_}`)
    ), T = u(
      "button",
      { type: "button", class: "sg-renderer-datepicker-nav" },
      document.createTextNode("›")
    );
    x.append(S, N, T);
    const k = u("div", { class: "sg-renderer-datepicker-dows" });
    for (let B = 0; B < 7; B++)
      k.append(u(
        "span",
        { class: "sg-renderer-datepicker-dow" },
        document.createTextNode(Xr[(B + c) % 7])
      ));
    const $ = u("div", { class: "sg-renderer-datepicker-grid" }), D = (new Date(_, y, 1).getDay() - c + 7) % 7, V = new Date(_, y, 1 - D), I = /* @__PURE__ */ new Date();
    for (let B = 0; B < 42; B++) {
      const F = new Date(V.getFullYear(), V.getMonth(), V.getDate() + B), q = F.getMonth() === y, ee = de(F, i), X = de(F, o), te = i && o && F > i && F < o, O = de(F, I), R = ["sg-renderer-datepicker-day"];
      q || R.push("is-other-month"), (ee || X) && R.push("is-selected"), te && R.push("is-in-range"), O && R.push("is-today");
      const G = u(
        "button",
        { type: "button", class: R.join(" "), title: Ce(F) },
        document.createTextNode(String(F.getDate()))
      );
      G.addEventListener("click", () => f(F)), $.append(G);
    }
    return w.append(x, k, $), { wrap: w, prev: S, next: T };
  }
  function h() {
    d.replaceChildren();
    const _ = u("div", { class: "sg-renderer-daterange-months" }), y = l === 11 ? a + 1 : a, w = (l + 1) % 12, x = g(a, l), S = g(y, w);
    x.prev.addEventListener("click", () => {
      l === 0 ? (l = 11, a -= 1) : l -= 1, h();
    }), S.next.addEventListener("click", () => {
      l === 11 ? (l = 0, a += 1) : l += 1, h();
    }), x.next.style.visibility = "hidden", S.prev.style.visibility = "hidden", _.append(x.wrap, S.wrap);
    const N = u("div", { class: "sg-renderer-datepicker-footer" }), T = u(
      "button",
      { type: "button", class: "sg-renderer-datepicker-clear" },
      document.createTextNode("Clear")
    ), k = u(
      "button",
      { type: "button", class: "sg-renderer-timepicker-ok" },
      document.createTextNode("Set")
    );
    T.addEventListener("click", () => {
      i = null, o = null, p();
    }), k.addEventListener("click", p), N.append(T, k), d.append(_, N);
  }
  function b(_) {
    _.key === "Escape" && (_.stopPropagation(), Me()), _.key === "Enter" && (_.stopPropagation(), _.preventDefault(), p());
  }
  function m(_) {
    !d.contains(_.target) && !t.contains(_.target) && Me();
  }
  document.addEventListener("keydown", b), setTimeout(() => document.addEventListener("mousedown", m), 0), document.body.appendChild(d), h(), z(d, t), qe = { pop: d, onKey: b, onDocClick: m, anchor: t };
}
function Me() {
  if (!qe) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = qe;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), qe = null, Z(n);
}
const ts = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#6b7280",
  "#1f2937",
  "#ffffff"
];
function ns({
  palette: t = ts,
  shape: s = "circle",
  showLabel: e = !1,
  size: n = 14,
  editable: r = !0,
  empty: i = "—"
} = {}) {
  return (o) => {
    const { value: a, td: l } = o, c = o?.col?.cellRendererConfig || {}, d = c.palette || t, p = c.shape ?? s, f = c.showLabel ?? e, g = c.size ?? n, h = c.editable ?? r;
    if (l && (l.classList.add("sg-renderer-colorpicker-cell"), l._sgPickerPalette = d), h && l && !l._sgPickerBound && (l._sgPickerBound = !0, l.addEventListener("dblclick", (_) => {
      _._sgPickerHandled || (_._sgPickerHandled = !0, _.stopPropagation(), ll(l, o));
    })), L(a)) return i;
    const b = u("span", { class: "sg-renderer-swatch" }), m = String(a).toLowerCase() === "#ffffff" ? " border: 1px solid #d1d5db;" : "";
    return b.append(u("span", {
      class: `sg-renderer-swatch-chip is-${p}`,
      style: `width: ${g}px; height: ${g}px; background: ${a};${m}`,
      title: a
    })), f && b.append(u("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(a))), b;
  };
}
let Ye = null;
function ll(t, s) {
  De();
  const e = t._sgPickerPalette || ts, { row: n, col: r } = s, i = n && r?.field != null ? n[r.field] : null, o = u("div", { class: "sg-renderer-colorpicker-popover", role: "dialog" });
  o.addEventListener("mousedown", (m) => m.stopPropagation());
  function a(m) {
    const { api: _ } = s, y = n && r?.field != null ? n[r.field] : null;
    n && r?.field != null && (n[r.field] = m), _?.applyTransaction && _.applyTransaction({ update: [n] });
    const w = t.closest('[data-controller~="grid"]');
    w && w.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: n?.id ?? n?._sg_id, colId: r?.field, oldValue: y, newValue: m }
    })), De();
  }
  const l = u("div", { class: "sg-renderer-colorpicker-grid" });
  for (const m of e) {
    const _ = String(i).toLowerCase() === String(m).toLowerCase(), y = u("button", {
      type: "button",
      class: `sg-renderer-colorpicker-swatch${_ ? " is-selected" : ""}`,
      style: `background: ${m};`,
      title: m,
      "aria-label": m
    });
    y.addEventListener("click", () => a(m)), l.append(y);
  }
  const c = u("div", { class: "sg-renderer-colorpicker-custom" }), d = u("input", {
    type: "color",
    class: "sg-renderer-colorpicker-native",
    value: /^#[0-9a-fA-F]{6}$/.test(i || "") ? i : "#3b82f6"
  }), p = u("input", {
    type: "text",
    class: "sg-renderer-colorpicker-hex",
    value: i || "",
    placeholder: "#rrggbb"
  });
  d.addEventListener("input", () => {
    p.value = d.value;
  }), p.addEventListener("input", () => {
    /^#[0-9a-fA-F]{6}$/.test(p.value) && (d.value = p.value);
  });
  const f = u(
    "button",
    { type: "button", class: "sg-renderer-timepicker-ok" },
    document.createTextNode("Set")
  ), g = u(
    "button",
    { type: "button", class: "sg-renderer-timepicker-clear" },
    document.createTextNode("Clear")
  );
  g.addEventListener("click", () => a(null)), f.addEventListener("click", () => {
    const m = /^#[0-9a-fA-F]{6}$/.test(p.value) ? p.value : d.value;
    a(m);
  }), c.append(d, p, g, f), o.append(l, c);
  function h(m) {
    if (m.key === "Escape" && (m.stopPropagation(), De()), m.key === "Enter") {
      m.stopPropagation();
      const _ = /^#[0-9a-fA-F]{6}$/.test(p.value) ? p.value : d.value;
      a(_);
    }
  }
  function b(m) {
    !o.contains(m.target) && !t.contains(m.target) && De();
  }
  document.addEventListener("keydown", h), setTimeout(() => document.addEventListener("mousedown", b), 0), document.body.appendChild(o), z(o, t), Ye = { pop: o, onKey: h, onDocClick: b, anchor: t };
}
function De() {
  if (!Ye) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Ye;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Ye = null, Z(n);
}
function rs({
  lines: t = 3,
  rows: s = 6,
  cols: e = 48,
  separator: n = `
`,
  editable: r = !0,
  empty: i = ""
} = {}) {
  return (o) => {
    const { value: a, td: l } = o, c = o?.col?.cellRendererConfig || {}, d = c.lines ?? t, p = c.rows ?? s, f = c.cols ?? e, g = c.separator ?? n, h = c.editable ?? r;
    if (l && (l.classList.add("sg-renderer-multiline"), l._sgTextareaRows = p, l._sgTextareaCols = f, l._sgTextareaSep = g), h && l && !l._sgTextareaBound && (l._sgTextareaBound = !0, l.addEventListener("dblclick", (m) => {
      m._sgTextareaHandled || (m._sgTextareaHandled = !0, m.stopPropagation(), Mt(l, o));
    })), L(a)) return i;
    const b = String(a);
    if (d != null && d > 0) {
      const m = u("div", {
        class: "sg-renderer-multiline-clamp",
        style: `--sg-multiline-lines: ${d};`,
        title: b
      });
      return m.textContent = b, m;
    }
    return b;
  };
}
let Ze = null;
function Mt(t, s) {
  oe();
  const e = t._sgTextareaRows || 6, n = t._sgTextareaCols || 48, { row: r, col: i } = s, o = r && i?.field != null ? r[i.field] : "", a = u("div", { class: "sg-renderer-textarea-popover", role: "dialog" });
  a.addEventListener("mousedown", (m) => m.stopPropagation());
  const l = u("textarea", { class: "sg-renderer-textarea-input", rows: e, cols: n });
  l.value = o == null ? "" : String(o);
  function c() {
    const { api: m } = s, _ = l.value, y = r && i?.field != null ? r[i.field] : null;
    r && i?.field != null && (r[i.field] = _), m?.applyTransaction && m.applyTransaction({ update: [r] });
    const w = t.closest('[data-controller~="grid"]');
    w && w.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: r?.id ?? r?._sg_id, colId: i?.field, oldValue: y, newValue: _ }
    })), oe();
  }
  const d = u("div", { class: "sg-renderer-textarea-footer" }), p = u(
    "span",
    { class: "sg-renderer-textarea-hint" },
    document.createTextNode("⌘/Ctrl + Enter to save · Esc to cancel")
  ), f = u(
    "button",
    { type: "button", class: "sg-renderer-timepicker-cancel" },
    document.createTextNode("Cancel")
  ), g = u(
    "button",
    { type: "button", class: "sg-renderer-timepicker-ok" },
    document.createTextNode("Save")
  );
  f.addEventListener("click", () => oe()), g.addEventListener("click", c), d.append(p, f, g), a.append(l, d), l.addEventListener("keydown", (m) => {
    m.key === "Enter" && (m.metaKey || m.ctrlKey) ? (m.preventDefault(), c()) : m.key === "Escape" && (m.stopPropagation(), oe());
  });
  function h(m) {
    m.key === "Escape" && (m.stopPropagation(), oe());
  }
  function b(m) {
    !a.contains(m.target) && !t.contains(m.target) && oe();
  }
  document.addEventListener("keydown", h), setTimeout(() => document.addEventListener("mousedown", b), 0), document.body.appendChild(a), z(a, t), setTimeout(() => {
    l.focus(), l.setSelectionRange(l.value.length, l.value.length);
  }, 0), Ze = { pop: a, onKey: h, onDocClick: b, anchor: t };
}
function oe() {
  if (!Ze) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Ze;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Ze = null, Z(n);
}
function ut(t, s, e, n) {
  const r = t?.closest('[data-controller~="grid"]');
  r && r.dispatchEvent(new CustomEvent("grid:rowAction", {
    bubbles: !0,
    detail: {
      action: e,
      rowId: s.row?.id ?? s.row?._sg_id,
      row: s.row,
      col: s.col,
      ...n
    }
  }));
}
function ss({
  label: t = "Go",
  icon: s = null,
  variant: e = "primary",
  action: n = null,
  onClick: r = null,
  disabled: i = !1
} = {}) {
  return (o) => {
    const { td: a, row: l } = o, c = o?.col?.cellRendererConfig || {}, d = c.label ?? t, p = c.icon ?? s, f = c.variant ?? e, g = c.action ?? n, h = typeof i == "function" ? i(l) : c.disabled ?? i;
    a && a.classList.add("sg-renderer-action-cell");
    const b = u("button", {
      type: "button",
      class: `sg-renderer-action-btn is-${f}`,
      disabled: h ? "" : null
    });
    return p && b.append(u("span", { class: "sg-renderer-action-icon", "aria-hidden": "true" }, p)), b.append(u("span", { class: "sg-renderer-action-label" }, document.createTextNode(d))), b.addEventListener("click", (m) => {
      m.stopPropagation(), !h && (typeof r == "function" && r(l, o), g && ut(a, o, g));
    }), b;
  };
}
const cl = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="3" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="13" r="1.5" fill="currentColor"/></svg>';
function is({
  items: t = [],
  icon: s = cl,
  ariaLabel: e = "Open menu"
} = {}) {
  return (n) => {
    const { td: r } = n, i = n?.col?.cellRendererConfig || {}, o = i.items || t, a = i.icon ?? s;
    r && (r.classList.add("sg-renderer-menu-cell"), r._sgMenuItems = o);
    const l = u("button", {
      type: "button",
      class: "sg-renderer-menu-trigger",
      "aria-label": i.ariaLabel ?? e
    }, a);
    return l.addEventListener("click", (c) => {
      c.stopPropagation(), os(r, n, o);
    }), l;
  };
}
let Xe = null;
function os(t, s, e) {
  Re();
  const n = u("div", { class: "sg-renderer-menu-popover", role: "menu" });
  n.addEventListener("mousedown", (o) => o.stopPropagation());
  for (const o of e) {
    if (o === "---" || o === null) {
      n.append(u("div", { class: "sg-renderer-menu-sep", role: "separator" }));
      continue;
    }
    const a = typeof o == "string" ? { label: o, action: o } : o, l = ["sg-renderer-menu-item"];
    a.danger && l.push("is-danger"), a.disabled && l.push("is-disabled");
    const c = u("button", {
      type: "button",
      class: l.join(" "),
      role: "menuitem",
      disabled: a.disabled ? "" : null
    });
    a.icon && c.append(u("span", { class: "sg-renderer-menu-icon", "aria-hidden": "true" }, a.icon)), c.append(u("span", { class: "sg-renderer-menu-label" }, document.createTextNode(a.label))), a.shortcut && c.append(u("span", { class: "sg-renderer-menu-shortcut" }, document.createTextNode(a.shortcut))), c.addEventListener("click", () => {
      a.disabled || (Re(), typeof a.onClick == "function" && a.onClick(s.row, s), a.action && ut(t, s, a.action));
    }), n.append(c);
  }
  function r(o) {
    o.key === "Escape" && (o.stopPropagation(), Re());
  }
  function i(o) {
    !n.contains(o.target) && !t.contains(o.target) && Re();
  }
  document.addEventListener("keydown", r), setTimeout(() => document.addEventListener("mousedown", i), 0), document.body.appendChild(n), z(n, t), Xe = { pop: n, onKey: r, onDocClick: i, anchor: t };
}
function Re() {
  if (!Xe) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Xe;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Xe = null, Z(n);
}
function as({
  primary: t = { label: "Go", action: null, icon: null },
  items: s = [],
  variant: e = "primary"
} = {}) {
  return (n) => {
    const { td: r } = n, i = n?.col?.cellRendererConfig || {}, o = i.primary || t, a = i.items || s, l = i.variant ?? e;
    r && r.classList.add("sg-renderer-splitbtn-cell");
    const c = u("span", { class: `sg-renderer-splitbtn is-${l}`, role: "group" }), d = u("button", { type: "button", class: "sg-renderer-splitbtn-main" });
    o.icon && d.append(u("span", { class: "sg-renderer-action-icon", "aria-hidden": "true" }, o.icon)), d.append(u("span", { class: "sg-renderer-action-label" }, document.createTextNode(o.label))), d.addEventListener("click", (f) => {
      f.stopPropagation(), typeof o.onClick == "function" && o.onClick(n.row, n), o.action && ut(r, n, o.action);
    });
    const p = u(
      "button",
      { type: "button", class: "sg-renderer-splitbtn-caret", "aria-label": "More actions" },
      document.createTextNode("▾")
    );
    return p.addEventListener("click", (f) => {
      f.stopPropagation(), os(p, n, a);
    }), c.append(d, p), c;
  };
}
const dl = [
  { name: "edit", label: "Edit", icon: "✎" },
  { name: "duplicate", label: "Duplicate", icon: "⧉" },
  { name: "delete", label: "Delete", icon: "✕", danger: !0 }
];
function ls({
  actions: t = dl
} = {}) {
  return (s) => {
    const { td: e } = s, r = (s?.col?.cellRendererConfig || {}).actions || t;
    e && e.classList.add("sg-renderer-rowactions-cell");
    const i = u("span", { class: "sg-renderer-rowactions" });
    for (const o of r) {
      const a = u("button", {
        type: "button",
        class: `sg-renderer-rowactions-btn${o.danger ? " is-danger" : ""}`,
        title: o.label,
        "aria-label": o.label
      }, o.icon || o.label);
      a.addEventListener("click", (l) => {
        l.stopPropagation(), typeof o.onClick == "function" && o.onClick(s.row, s), o.name && ut(e, s, o.name);
      }), i.append(a);
    }
    return i;
  };
}
const ul = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6" cy="3" r="1.2" fill="currentColor"/><circle cx="10" cy="3" r="1.2" fill="currentColor"/><circle cx="6" cy="8" r="1.2" fill="currentColor"/><circle cx="10" cy="8" r="1.2" fill="currentColor"/><circle cx="6" cy="13" r="1.2" fill="currentColor"/><circle cx="10" cy="13" r="1.2" fill="currentColor"/></svg>';
function cs({ label: t = "Drag to reorder" } = {}) {
  return (s) => {
    const { td: e } = s;
    e && e.classList.add("sg-renderer-draghandle-cell");
    const n = u("span", {
      class: "sg-renderer-draghandle",
      title: t,
      "aria-label": t,
      role: "button",
      tabindex: 0,
      draggable: "true"
    }, ul);
    return n.addEventListener("mousedown", (r) => {
      r.stopPropagation();
      const i = e?.closest('[data-controller~="grid"]');
      i && i.dispatchEvent(new CustomEvent("grid:rowDragStart", {
        bubbles: !0,
        detail: { rowId: s.row?.id ?? s.row?._sg_id, row: s.row, event: r }
      }));
    }), n;
  };
}
function ds({ startAt: t = 1, padTo: s = 0 } = {}) {
  return (e) => {
    const { td: n, rowNum: r } = e, o = (typeof r == "number" ? r : t) + (t - 1);
    n && n.classList.add("sg-renderer-rownumber-cell");
    const a = s > 0 ? String(o).padStart(s, "0") : String(o);
    return u("span", { class: "sg-renderer-rownumber" }, document.createTextNode(a));
  };
}
function us() {
  return (t) => {
    const { td: s, row: e } = t;
    s && s.classList.add("sg-renderer-expandtoggle-cell");
    const n = !!(e && e._sg_expanded), r = u("button", {
      type: "button",
      class: `sg-renderer-expandtoggle${n ? " is-open" : ""}`,
      "aria-label": n ? "Collapse row" : "Expand row",
      "aria-expanded": n ? "true" : "false"
    });
    return r.innerHTML = yn, r.addEventListener("mousedown", (i) => i.stopPropagation()), r.addEventListener("click", (i) => {
      i.stopPropagation();
      const a = !!!(e && e._sg_expanded);
      e && (e._sg_expanded = a), r.classList.toggle("is-open", a), r.setAttribute("aria-expanded", a ? "true" : "false"), r.setAttribute("aria-label", a ? "Collapse row" : "Expand row");
      const l = (s || r).closest('[data-controller~="grid"]');
      l && l.dispatchEvent(new CustomEvent("grid:rowToggleExpand", {
        bubbles: !0,
        detail: { rowId: e?.id ?? e?._sg_id, row: e, expanded: a }
      }));
    }), r;
  };
}
const pl = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
function fl(t) {
  const s = String(t).toLowerCase();
  return s.length <= 13 ? s : `${s.slice(0, 8)}…${s.slice(-4)}`;
}
function ps({ short: t = !0, copy: s = !0 } = {}) {
  return ({ value: e, td: n }) => {
    if (L(e)) return "";
    n && n.classList.add("sg-renderer-uuid-cell");
    const r = String(e), i = pl.test(r), o = t ? fl(r) : r, a = u("span", {
      class: `sg-renderer-uuid${i ? "" : " is-invalid"}`,
      title: r
    });
    if (a.append(u(
      "code",
      { class: "sg-renderer-uuid-mono" },
      document.createTextNode(o)
    )), s) {
      const l = u("button", {
        type: "button",
        class: "sg-renderer-copyable-btn",
        title: "Copy",
        "aria-label": "Copy UUID"
      }, document.createTextNode("⧉"));
      l.addEventListener("click", (c) => {
        c.stopPropagation(), navigator.clipboard?.writeText && navigator.clipboard.writeText(r).then(() => {
          l.classList.add("is-copied"), setTimeout(() => l.classList.remove("is-copied"), 900);
        });
      }), a.append(l);
    }
    return a;
  };
}
const gl = /^[0-9a-f]{4,64}$/i;
function fs({ length: t = 7, href: s = null, copy: e = !0 } = {}) {
  return ({ value: n, td: r }) => {
    if (L(n)) return "";
    r && r.classList.add("sg-renderer-gitsha-cell"), r?._sgPickerPalette;
    const i = String(n).trim(), o = gl.test(i), a = o ? i.slice(0, t) : i, l = u("span", {
      class: `sg-renderer-uuid${o ? "" : " is-invalid"}`,
      title: i
    }), c = s ? u("a", { class: "sg-renderer-uuid-mono", href: typeof s == "function" ? s(i) : `${s}${i}`, target: "_blank", rel: "noopener noreferrer" }) : u("code", { class: "sg-renderer-uuid-mono" });
    if (c.append(document.createTextNode(a)), l.append(c), e) {
      const d = u("button", {
        type: "button",
        class: "sg-renderer-copyable-btn",
        title: "Copy",
        "aria-label": "Copy SHA"
      }, document.createTextNode("⧉"));
      d.addEventListener("click", (p) => {
        p.stopPropagation(), navigator.clipboard?.writeText && navigator.clipboard.writeText(i).then(() => {
          d.classList.add("is-copied"), setTimeout(() => d.classList.remove("is-copied"), 900);
        });
      }), l.append(d);
    }
    return l;
  };
}
const hl = /^(?:[0-9a-f]{2}[:-]?){5}[0-9a-f]{2}$|^(?:[0-9a-f]{4}\.){2}[0-9a-f]{4}$/i;
function gs({ vendorLookup: t = null } = {}) {
  return ({ value: s, td: e }) => {
    if (L(s)) return "";
    e && e.classList.add("sg-renderer-mac-cell");
    const n = String(s).trim(), r = hl.test(n), i = n.replace(/[^0-9a-f]/gi, "").toLowerCase(), o = i.length === 12 ? `${i.slice(0, 2)}:${i.slice(2, 4)}:${i.slice(4, 6)}:${i.slice(6, 8)}:${i.slice(8, 10)}:${i.slice(10, 12)}` : n, a = i.slice(0, 6), l = typeof t == "function" ? t(a) : null;
    return u("span", {
      class: `sg-renderer-uuid${r ? "" : " is-invalid"}`,
      title: l ? `${o} — ${l}` : o
    }, u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(o)));
  };
}
function hs({ groups: t = 4, groupLen: s = 4, mask: e = !1 } = {}) {
  return ({ value: n, td: r }) => {
    if (L(n)) return "";
    r && r.classList.add("sg-renderer-license-cell");
    const i = r?._sgLicCfg || {}, o = i.groups || t, a = i.groupLen || s, l = String(n).replace(/[^a-z0-9]/gi, "").toUpperCase(), c = [];
    for (let f = 0; f < l.length; f += a) c.push(l.slice(f, f + a));
    const d = c.slice(0, o).join("-"), p = e ? d.split("-").map((f, g) => g === c.length - 1 ? f : f.replace(/./g, "•")).join("-") : d;
    return u(
      "span",
      { class: "sg-renderer-uuid", title: d },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(p))
    );
  };
}
const ml = /^[A-HJ-NPR-Z0-9]{17}$/;
function ms({} = {}) {
  return ({ value: t, td: s }) => {
    if (L(t)) return "";
    s && s.classList.add("sg-renderer-vin-cell");
    const e = String(t).trim().toUpperCase(), n = ml.test(e), r = n ? `${e.slice(0, 3)} ${e.slice(3, 9)} ${e.slice(9)}` : e;
    return u(
      "span",
      { class: `sg-renderer-uuid${n ? "" : " is-invalid"}`, title: e },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(r))
    );
  };
}
function bl(t) {
  return t.length !== 13 ? t : `${t.slice(0, 3)}-${t.slice(3, 4)}-${t.slice(4, 8)}-${t.slice(8, 12)}-${t.slice(12)}`;
}
function yl(t) {
  return t.length !== 10 ? t : `${t.slice(0, 1)}-${t.slice(1, 4)}-${t.slice(4, 9)}-${t.slice(9)}`;
}
function bs({} = {}) {
  return ({ value: t, td: s }) => {
    if (L(t)) return "";
    s && s.classList.add("sg-renderer-isbn-cell");
    const e = String(t).replace(/[^\dXx]/g, "");
    let n, r;
    return e.length === 13 ? (n = bl(e), r = /^\d{13}$/.test(e)) : e.length === 10 ? (n = yl(e), r = /^\d{9}[\dXx]$/.test(e)) : (n = String(t), r = !1), u(
      "span",
      { class: `sg-renderer-uuid${r ? "" : " is-invalid"}`, title: String(t) },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(n))
    );
  };
}
const wl = /* @__PURE__ */ new Set(["B", "I", "EM", "STRONG", "U", "S", "DEL", "CODE", "A", "BR", "SPAN"]);
function vl(t) {
  const s = document.createElement("template");
  s.innerHTML = t;
  function e(n) {
    const r = Array.from(n.childNodes);
    for (const i of r) {
      if (i.nodeType === 3) continue;
      if (i.nodeType !== 1) {
        i.remove();
        continue;
      }
      const o = i.tagName;
      if (!wl.has(o)) {
        const a = document.createTextNode(i.textContent || "");
        i.replaceWith(a);
        continue;
      }
      [...i.attributes].forEach((a) => {
        const l = a.name.toLowerCase();
        o === "A" && l === "href" && /^(https?:|mailto:)/i.test(a.value) || i.removeAttribute(l);
      }), o === "A" && (i.setAttribute("target", "_blank"), i.setAttribute("rel", "noopener noreferrer")), e(i);
    }
  }
  return e(s.content), s.innerHTML;
}
function ys({ editable: t = !1, rows: s = 8, cols: e = 60 } = {}) {
  return (n) => {
    const { value: r, td: i } = n;
    if (i && (i.classList.add("sg-renderer-html-cell"), t && !i._sgHtmlBound && (i._sgHtmlBound = !0, i._sgTextareaRows = s, i._sgTextareaCols = e, i.addEventListener("dblclick", (a) => {
      a._sgTextareaHandled || (a._sgTextareaHandled = !0, a.stopPropagation(), Mt(i, n));
    }))), L(r)) return "";
    const o = u("span", { class: "sg-renderer-html" });
    return o.innerHTML = vl(String(r)), o;
  };
}
function ws({ maxLines: t = 4, editable: s = !1, rows: e = 12, cols: n = 60 } = {}) {
  return (r) => {
    const { value: i, td: o } = r;
    if (o && (o.classList.add("sg-renderer-yaml-cell"), s && !o._sgYamlBound && (o._sgYamlBound = !0, o._sgTextareaRows = e, o._sgTextareaCols = n, o.addEventListener("dblclick", (c) => {
      c._sgTextareaHandled || (c._sgTextareaHandled = !0, c.stopPropagation(), Mt(o, r));
    }))), L(i)) return "";
    const a = typeof i == "string" ? i : JSON.stringify(i, null, 2), l = u("pre", {
      class: "sg-renderer-yaml",
      style: `--sg-multiline-lines: ${t};`,
      title: a
    });
    return l.textContent = a, l;
  };
}
function vs({ maxLines: t = 4 } = {}) {
  return ({ value: s, td: e }) => {
    if (L(s)) return "";
    e && e.classList.add("sg-renderer-xml-cell");
    const n = String(s), r = u("pre", {
      class: "sg-renderer-yaml",
      // share the yaml mono style
      style: `--sg-multiline-lines: ${t};`,
      title: n
    });
    return r.textContent = n, r;
  };
}
const _l = /\bhttps?:\/\/[^\s<>"']+/g, xl = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g;
function _s({} = {}) {
  return ({ value: t, td: s }) => {
    if (L(t)) return "";
    s && s.classList.add("sg-renderer-autolink-cell");
    let e = Le(String(t));
    e = e.replace(_l, (r) => `<a class="sg-renderer-link" href="${r}" target="_blank" rel="noopener noreferrer">${r}</a>`), e = e.replace(xl, (r) => `<a class="sg-renderer-link" href="mailto:${r}">${r}</a>`);
    const n = u("span", { class: "sg-renderer-autolink" });
    return n.innerHTML = e, n;
  };
}
function xs({
  revealOnHold: t = !0
} = {}) {
  return ({ value: s, td: e }) => {
    if (e && e.classList.add("sg-renderer-redacted-cell"), L(s)) return "";
    const n = String(s), r = u("span", { class: "sg-renderer-redacted", title: t ? "Hold to reveal" : "" });
    if (r.append(u(
      "span",
      { class: "sg-renderer-redacted-text", "aria-hidden": "true" },
      document.createTextNode(n)
    )), t) {
      r.addEventListener("mousedown", (o) => {
        o.stopPropagation(), r.classList.add("is-revealed");
      });
      const i = () => r.classList.remove("is-revealed");
      document.addEventListener("mouseup", i), r.addEventListener("mouseleave", i);
    }
    return r;
  };
}
function Cs({} = {}) {
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-spoiler-cell"), L(t)) return "";
    const e = String(t), n = u("span", { class: "sg-renderer-spoiler", title: "Click to reveal" });
    return n.append(u(
      "span",
      { class: "sg-renderer-spoiler-text", "aria-hidden": "true" },
      document.createTextNode(e)
    )), n.addEventListener("click", (r) => {
      r.stopPropagation(), n.classList.add("is-revealed");
    }), n;
  };
}
function Ss(t, s) {
  return s === 0 ? t : Ss(s, t % s);
}
function Cl(t, s = 16) {
  if (!Number.isFinite(t)) return null;
  const e = t < 0 ? "-" : "";
  t = Math.abs(t);
  const n = Math.floor(t), r = t - n;
  if (r < 1 / (s * 2)) return `${e}${n}`;
  let i = 1, o = 1, a = 1 / 0;
  for (let p = 1; p <= s; p++) {
    const f = Math.round(r * p), g = Math.abs(r - f / p);
    g < a && (i = f, o = p, a = g);
  }
  if (i === 0) return `${e}${n}`;
  if (i === o) return `${e}${n + 1}`;
  const l = Ss(i, o), c = i / l, d = o / l;
  return n === 0 ? `${e}${c}/${d}` : `${e}${n} ${c}/${d}`;
}
function Ls({ maxDenom: t = 16 } = {}) {
  return ({ value: s, td: e }) => {
    if (e && e.classList.add("sg-renderer-number"), L(s)) return "";
    const n = Number(s);
    return Number.isFinite(n) && Cl(n, t) || String(s);
  };
}
const Sl = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
function Ll(t) {
  return String(t).split("").map((s) => s === "-" ? "⁻" : Sl[Number(s)] || s).join("");
}
function ks({
  decimals: t = 2,
  pretty: s = !0
} = {}) {
  return ({ value: e, td: n }) => {
    if (n && n.classList.add("sg-renderer-number"), L(e)) return "";
    const r = Number(e);
    if (!Number.isFinite(r)) return String(e);
    if (r === 0) return "0";
    const i = Math.floor(Math.log10(Math.abs(r))), a = (r / Math.pow(10, i)).toFixed(t);
    return s ? `${a} × 10${Ll(i)}` : r.toExponential(t);
  };
}
function pt({
  base: t = 16,
  prefix: s = !0,
  uppercase: e = !0,
  pad: n = 0
} = {}) {
  const r = { 2: "0b", 8: "0o", 16: "0x" };
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), L(i)) return "";
    const a = Number(i);
    if (!Number.isFinite(a) || !Number.isInteger(a)) return String(i);
    let l = Math.abs(a).toString(t);
    return e && (l = l.toUpperCase()), n > 0 && (l = l.padStart(n, "0")), s && r[t] && (l = r[t] + l), (a < 0 ? "-" : "") + l;
  };
}
function Es({
  population: t = null,
  decimals: s = 0
} = {}) {
  return ({ value: e, row: n, col: r, td: i }) => {
    if (i && i.classList.add("sg-renderer-percentile-cell"), L(e)) return "";
    const o = Number(e);
    if (!Number.isFinite(o)) return String(e);
    const a = typeof t == "function" ? t(n, r) : t;
    if (!Array.isArray(a) || a.length === 0) return String(e);
    const l = a.slice().sort((f, g) => f - g);
    let c = 0;
    for (const f of l) f < o && c++;
    const d = c / l.length * 100, p = u("span", { class: "sg-renderer-percentile" });
    return p.append(document.createTextNode(String(e))), p.append(u(
      "span",
      { class: "sg-renderer-percentile-tag" },
      document.createTextNode(`p${d.toFixed(s)}`)
    )), p;
  };
}
function $s({
  showValue: t = !0
} = {}) {
  return ({ value: s, td: e }) => {
    if (e && e.classList.add("sg-renderer-battery-cell"), L(s)) return "";
    let n = Number(s);
    if (!Number.isFinite(n)) return String(s);
    n = Math.max(0, Math.min(100, n));
    const r = n < 15 ? "#ef4444" : n < 35 ? "#f59e0b" : "#22c55e", i = u("span", { class: "sg-renderer-battery", title: `${Math.round(n)}%` }), o = u("span", { class: "sg-renderer-battery-icon", "aria-hidden": "true" });
    return o.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 12" width="24" height="12"><rect x="0.5" y="0.5" width="20" height="11" rx="2" fill="none" stroke="#9ca3af"/><rect x="20.5" y="3" width="2.5" height="6" rx="0.5" fill="#9ca3af"/><rect x="2" y="2" width="${n / 100 * 17}" height="8" fill="${r}"/></svg>`, i.append(o), t && i.append(u(
      "span",
      { class: "sg-renderer-battery-pct" },
      document.createTextNode(`${Math.round(n)}%`)
    )), i;
  };
}
function Ts({
  bars: t = 4
} = {}) {
  return ({ value: s, td: e }) => {
    if (e && e.classList.add("sg-renderer-signal-cell"), L(s)) return "";
    const n = Number(s);
    if (!Number.isFinite(n)) return String(s);
    const r = n <= t ? Math.round(n) : Math.round(n / 100 * t), i = u("span", { class: "sg-renderer-signal", title: `${r}/${t}` });
    for (let o = 1; o <= t; o++)
      i.append(u("span", {
        class: `sg-renderer-signal-bar${o <= r ? " is-on" : ""}`,
        style: `height: ${4 + o * 2}px;`
      }));
    return i;
  };
}
const kl = '<path fill="currentColor" d="M3 6v4h3l4 3V3L6 6H3z"/>', yt = '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M12 6.5q1 1 0 3"/>', tn = '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M14 5q2 2 0 6"/>', El = '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M16 3.5q3 3 0 9"/>', $l = '<line x1="13" y1="4" x2="17" y2="9" stroke="currentColor" stroke-width="1.4"/><line x1="17" y1="4" x2="13" y2="9" stroke="currentColor" stroke-width="1.4"/>';
function As({
  showValue: t = !1,
  editable: s = !1
} = {}) {
  return (e) => {
    const { value: n, td: r } = e;
    if (r && (r.classList.add("sg-renderer-volume-cell"), s && !r._sgVolumeBound && (r._sgVolumeBound = !0, r.addEventListener("dblclick", (c) => {
      c._sgVolumeHandled || (c._sgVolumeHandled = !0, c.stopPropagation(), Tl(r, e));
    }))), L(n)) return "";
    let i = Number(n);
    if (!Number.isFinite(i)) return String(n);
    i = Math.max(0, Math.min(100, i));
    let o = "";
    i === 0 ? o = $l : i < 33 ? o = yt : i < 66 ? o = yt + tn : o = yt + tn + El;
    const a = u("span", { class: "sg-renderer-volume", title: `${Math.round(i)}%` }), l = u("span", { class: "sg-renderer-volume-icon", "aria-hidden": "true" });
    return l.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 16" width="20" height="14">${kl}${o}</svg>`, a.append(l), t && a.append(u(
      "span",
      { class: "sg-renderer-volume-pct" },
      document.createTextNode(`${Math.round(i)}%`)
    )), a;
  };
}
let Je = null;
function be() {
  if (!Je) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Je;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Je = null, Z(n);
}
function Tl(t, s) {
  be();
  const { row: e, col: n } = s, r = Math.max(0, Math.min(100, Number(e && n?.field != null ? e[n.field] : 0) || 0)), i = u("div", { class: "sg-renderer-volume-popover", role: "dialog" });
  i.addEventListener("mousedown", (p) => p.stopPropagation());
  const o = u("input", {
    type: "range",
    min: "0",
    max: "100",
    step: "1",
    value: String(r),
    class: "sg-renderer-volume-slider"
  }), a = u(
    "span",
    { class: "sg-renderer-volume-popover-value" },
    document.createTextNode(`${r}%`)
  );
  o.addEventListener("input", () => {
    a.textContent = `${o.value}%`;
  });
  function l() {
    const { api: p } = s, f = Number(o.value), g = e && n?.field != null ? e[n.field] : null;
    e && n?.field != null && (e[n.field] = f), p?.applyTransaction && p.applyTransaction({ update: [e] });
    const h = t.closest('[data-controller~="grid"]');
    h && h.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: e?.id ?? e?._sg_id, colId: n?.field, oldValue: g, newValue: f }
    })), be();
  }
  i.append(o, a), o.addEventListener("keydown", (p) => {
    p.key === "Enter" ? (p.preventDefault(), l()) : p.key === "Escape" && (p.stopPropagation(), be());
  }), o.addEventListener("change", l);
  function c(p) {
    p.key === "Escape" && (p.stopPropagation(), be());
  }
  function d(p) {
    !i.contains(p.target) && !t.contains(p.target) && be();
  }
  document.addEventListener("keydown", c), setTimeout(() => document.addEventListener("mousedown", d), 0), document.body.appendChild(i), z(i, t), setTimeout(() => o.focus(), 0), Je = { pop: i, onKey: c, onDocClick: d, anchor: t };
}
const Al = [
  { match: /^image\//, icon: "🖼️" },
  { match: /^audio\//, icon: "🎵" },
  { match: /^video\//, icon: "🎬" },
  { match: /pdf$/, icon: "📕" },
  { match: /(zip|tar|gz|7z|rar)$/, icon: "🗜️" },
  { match: /(xls|xlsx|csv|sheet)$/, icon: "📊" },
  { match: /(doc|docx|wordprocessing)$/, icon: "📄" },
  { match: /(ppt|pptx|presentation)$/, icon: "📊" },
  { match: /(txt|md|markdown|plain)$/, icon: "📝" },
  { match: /(js|ts|jsx|tsx|py|rb|go|rs|java|cpp|c|h|html|css|json|yaml|yml|toml)$/, icon: "📜" }
];
function Ns(t, s) {
  const e = String(s || "").toLowerCase(), n = (t || "").toLowerCase().split(".").pop();
  for (const r of Al)
    if (e && r.match.test(e) || n && r.match.test(n)) return r.icon;
  return "📎";
}
function Ms(t) {
  if (!Number.isFinite(t)) return "";
  const s = ["B", "KB", "MB", "GB", "TB"];
  let e = 0;
  for (; t >= 1024 && e < s.length - 1; )
    t /= 1024, e++;
  return `${e === 0 ? t : t.toFixed(1)} ${s[e]}`;
}
function Ds(t) {
  return t == null || t === "" ? null : typeof t == "string" ? { url: t, filename: t.split("/").pop()?.split("?")[0] || t } : {
    url: t.url || t.src || t.href,
    filename: t.filename || t.name || (t.url ? t.url.split("/").pop()?.split("?")[0] : ""),
    content_type: t.content_type || t.contentType || t.mime_type || "",
    byte_size: t.byte_size ?? t.byteSize ?? t.size
  };
}
function Rs({
  showSize: t = !1
} = {}) {
  return ({ value: s, td: e }) => {
    e && e.classList.add("sg-renderer-file-cell");
    const n = Ds(s);
    if (!n) return "";
    const r = Ns(n.filename, n.content_type), i = u("a", {
      class: "sg-renderer-file",
      href: n.url || "#",
      target: "_blank",
      rel: "noopener noreferrer",
      title: n.filename
    });
    return i.append(u(
      "span",
      { class: "sg-renderer-file-icon", "aria-hidden": "true" },
      document.createTextNode(r)
    )), i.append(u(
      "span",
      { class: "sg-renderer-file-name" },
      document.createTextNode(n.filename || "file")
    )), t && n.byte_size && i.append(u(
      "span",
      { class: "sg-renderer-file-size" },
      document.createTextNode(Ms(n.byte_size))
    )), i;
  };
}
const Nl = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1a1 1 0 011 1v6.586l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L7 8.586V2a1 1 0 011-1zm-6 11a1 1 0 011 1v1h10v-1a1 1 0 112 0v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2a1 1 0 011-1z"/></svg>';
function Ps({
  label: t = "Download"
} = {}) {
  return ({ value: s, td: e }) => {
    e && e.classList.add("sg-renderer-download-cell");
    const n = Ds(s);
    if (!n) return "";
    const r = u("a", {
      class: "sg-renderer-link sg-renderer-download",
      href: n.url || "#",
      download: n.filename || "",
      title: n.filename
    }), i = u("span", { class: "sg-renderer-download-icon", "aria-hidden": "true" });
    i.innerHTML = Nl, r.append(i);
    let o = t;
    return n.byte_size && (o += ` (${Ms(n.byte_size)})`), r.append(u("span", {}, document.createTextNode(o))), r;
  };
}
function Is({ size: t = 18 } = {}) {
  return ({ value: s, td: e }) => {
    if (e && e.classList.add("sg-renderer-mime-icon-cell"), L(s)) return "";
    const n = typeof s == "object" ? s : { content_type: String(s), filename: String(s) }, r = Ns(n.filename, n.content_type);
    return u("span", {
      class: "sg-renderer-mime-icon",
      style: `font-size: ${t}px;`,
      title: n.content_type || n.filename || ""
    }, document.createTextNode(r));
  };
}
function Vs({
  max: t = 5,
  thumbSize: s = 40,
  popoverThumbSize: e = 96
} = {}) {
  return (n) => {
    const { value: r, td: i } = n;
    if (i && i.classList.add("sg-renderer-gallery-cell"), L(r)) return "";
    const o = (Array.isArray(r) ? r : [r]).map((d) => typeof d == "string" ? { url: d } : d).filter((d) => d && d.url);
    if (!o.length) return "";
    i && !i._sgGalleryBound && (i._sgGalleryBound = !0, i.addEventListener("dblclick", (d) => {
      d._sgGalleryHandled || (d._sgGalleryHandled = !0, d.stopPropagation(), Ml(i, o, e));
    }));
    const a = u("span", { class: "sg-renderer-gallery" }), l = o.slice(0, t);
    for (const d of l)
      a.append(u("img", {
        src: d.url,
        alt: d.alt || "",
        class: "sg-renderer-gallery-thumb",
        loading: "lazy",
        decoding: "async",
        style: `width: ${s}px; height: ${s}px;`
      }));
    const c = o.length - l.length;
    return c > 0 && a.append(u("span", {
      class: "sg-renderer-gallery-more",
      style: `width: ${s}px; height: ${s}px; font-size: ${s / 3}px;`,
      title: o.slice(t).map((d) => d.alt).filter(Boolean).join(", ")
    }, document.createTextNode(`+${c}`))), a;
  };
}
let Qe = null;
function wt() {
  if (!Qe) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Qe;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Qe = null, Z(n);
}
function Ml(t, s, e) {
  wt();
  const n = u("div", { class: "sg-renderer-gallery-popover", role: "dialog" });
  n.addEventListener("mousedown", (o) => o.stopPropagation());
  for (const o of s) {
    const a = u("a", {
      href: o.url,
      target: "_blank",
      rel: "noopener noreferrer",
      class: "sg-renderer-gallery-popover-item",
      title: o.alt || o.filename || ""
    });
    a.append(u("img", {
      src: o.url,
      alt: o.alt || "",
      loading: "lazy",
      decoding: "async",
      style: `width: ${e}px; height: ${e}px;`
    })), (o.alt || o.filename) && a.append(u(
      "span",
      { class: "sg-renderer-gallery-popover-label" },
      document.createTextNode(o.alt || o.filename)
    )), n.append(a);
  }
  function r(o) {
    o.key === "Escape" && (o.stopPropagation(), wt());
  }
  function i(o) {
    !n.contains(o.target) && !t.contains(o.target) && wt();
  }
  document.addEventListener("keydown", r), setTimeout(() => document.addEventListener("mousedown", i), 0), document.body.appendChild(n), z(n, t), Qe = { pop: n, onKey: r, onDocClick: i, anchor: t };
}
function Dl(t) {
  let s = 0;
  for (let e = 0; e < t.length; e++) s = (s << 5) - s + t.charCodeAt(e);
  return () => (s = (s * 9301 + 49297) % 233280, s / 233280);
}
function Fs({
  width: t = 100,
  height: s = 24,
  bars: e = 28,
  color: n = "#3b82f6",
  fill: r = !0
} = {}) {
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-waveform-cell"), L(i)) return "";
    let a;
    if (Array.isArray(i))
      a = i.map(Number);
    else {
      const h = Dl(String(i));
      a = Array.from({ length: e }, () => 0.2 + h() * 0.8);
    }
    const l = Math.min(e, a.length), c = t / l, d = Math.max(0.6, c * 0.25);
    let p = "";
    for (let h = 0; h < l; h++) {
      const m = Math.max(0.05, Math.min(1, a[h])) * s, _ = h * c + d / 2, y = (s - m) / 2;
      p += `<rect x="${_.toFixed(2)}" y="${y.toFixed(2)}" width="${(c - d).toFixed(2)}" height="${m.toFixed(2)}" rx="0.6" fill="${n}"/>`;
    }
    const f = u("span", { class: `sg-renderer-waveform${r ? " is-fill" : ""}` }), g = r ? "100%" : String(t);
    return f.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${s}" preserveAspectRatio="none" width="${g}" height="${s}">${p}</svg>`, f;
  };
}
function Bs({
  newTab: t = !0,
  size: s = 14,
  faviconUrl: e = (n) => `https://www.google.com/s2/favicons?domain=${n}&sz=64`
} = {}) {
  return ({ value: n }) => {
    if (L(n)) return "";
    const r = String(n);
    let i;
    try {
      i = new URL(r);
    } catch {
      return document.createTextNode(r);
    }
    const o = u("a", {
      class: "sg-renderer-link sg-renderer-favicon",
      href: r,
      target: t ? "_blank" : null,
      rel: t ? "noopener noreferrer" : null,
      title: r
    });
    return o.append(u("img", {
      src: e(i.hostname),
      alt: "",
      width: s,
      height: s,
      loading: "lazy",
      decoding: "async",
      class: "sg-renderer-favicon-img"
    })), o.append(u(
      "span",
      { class: "sg-renderer-favicon-host" },
      document.createTextNode(i.hostname + (i.pathname !== "/" ? i.pathname : ""))
    )), o;
  };
}
function Hs({
  stripWww: t = !0,
  link: s = !0,
  newTab: e = !0
} = {}) {
  return ({ value: n }) => {
    if (L(n)) return "";
    const r = String(n);
    let i;
    try {
      i = new URL(/^https?:/.test(r) ? r : `http://${r}`);
    } catch {
      return document.createTextNode(r);
    }
    let o = i.hostname;
    return t && (o = o.replace(/^www\./, "")), s ? u("a", {
      class: "sg-renderer-link",
      href: i.toString(),
      target: e ? "_blank" : null,
      rel: e ? "noopener noreferrer" : null,
      title: r
    }, document.createTextNode(o)) : o;
  };
}
const nn = {
  "twitter.com": { name: "Twitter", icon: "𝕏" },
  "x.com": { name: "X", icon: "𝕏" },
  "linkedin.com": { name: "LinkedIn", icon: "in" },
  "github.com": { name: "GitHub", icon: "⌥" },
  "youtube.com": { name: "YouTube", icon: "▶" },
  "instagram.com": { name: "Instagram", icon: "📷" },
  "mastodon.social": { name: "Mastodon", icon: "🐘" },
  "bsky.app": { name: "Bluesky", icon: "☁" },
  "threads.net": { name: "Threads", icon: "@" },
  "tiktok.com": { name: "TikTok", icon: "♪" },
  "reddit.com": { name: "Reddit", icon: "r" },
  "medium.com": { name: "Medium", icon: "M" },
  "substack.com": { name: "Substack", icon: "S" }
};
function Os({} = {}) {
  return ({ value: t }) => {
    if (L(t)) return "";
    const s = String(t);
    let e;
    try {
      e = new URL(/^https?:/.test(s) ? s : `https://${s}`);
    } catch {
      return document.createTextNode(s);
    }
    const n = e.hostname.replace(/^www\./, ""), r = nn[n] || Object.entries(nn).find(([l]) => n.endsWith(`.${l}`))?.[1], i = e.pathname.replace(/^\//, "").split("/")[0] || n, o = r ? `@${i}` : e.hostname + e.pathname, a = u("a", {
      class: "sg-renderer-link sg-renderer-social",
      href: e.toString(),
      target: "_blank",
      rel: "noopener noreferrer",
      title: `${r?.name || n} — ${s}`
    });
    return r && a.append(u(
      "span",
      { class: "sg-renderer-social-icon", "aria-hidden": "true" },
      document.createTextNode(r.icon)
    )), a.append(u(
      "span",
      { class: "sg-renderer-social-label" },
      document.createTextNode(o)
    )), a;
  };
}
const rn = {
  auspost: { name: "AusPost", re: /^([A-Z]{2}\d{9,12}AU|[A-Z0-9]{12,14})$/, track: (t) => `https://auspost.com.au/mypost/track/#/details/${t}` },
  usps: { name: "USPS", re: /^(94|93|92|94|95)\d{20,22}$/, track: (t) => `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${t}` },
  fedex: { name: "FedEx", re: /^(\d{12}|\d{15}|\d{20})$/, track: (t) => `https://www.fedex.com/fedextrack/?tracknumbers=${t}` },
  ups: { name: "UPS", re: /^1Z[A-Z0-9]{16}$/i, track: (t) => `https://www.ups.com/track?tracknum=${t}` },
  dhl: { name: "DHL", re: /^\d{10,11}$/, track: (t) => `https://www.dhl.com/au-en/home/tracking/tracking-express.html?submit=1&tracking-id=${t}` },
  royalmail: { name: "Royal Mail", re: /^[A-Z]{2}\d{9}GB$/, track: (t) => `https://www.royalmail.com/track-your-item#/tracking-results/${t}` }
};
function Gs({
  carrier: t = null
} = {}) {
  return ({ value: s, row: e, td: n }) => {
    if (L(s)) return "";
    n && n.classList.add("sg-renderer-tracking-cell");
    const r = String(s).trim().toUpperCase(), i = (t || e && e.carrier)?.toString().toLowerCase();
    let o = i ? rn[i] : null;
    if (!o) {
      for (const l of Object.values(rn))
        if (l.re.test(r)) {
          o = l;
          break;
        }
    }
    const a = u("span", { class: "sg-renderer-tracking" });
    return o ? (a.append(u(
      "span",
      { class: "sg-pill sg-pill-gray sg-renderer-tracking-carrier" },
      document.createTextNode(o.name)
    )), a.append(u("a", {
      class: "sg-renderer-link sg-renderer-uuid-mono",
      href: o.track(r),
      target: "_blank",
      rel: "noopener noreferrer"
    }, document.createTextNode(r)))) : a.append(u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(r))), a;
  };
}
function Rl(t) {
  try {
    const s = new URL(t), e = s.hostname.replace(/^www\./, "");
    if (e === "youtube.com" || e === "m.youtube.com") {
      const n = s.searchParams.get("v");
      if (n) return { provider: "youtube", id: n };
    }
    if (e === "youtu.be") {
      const n = s.pathname.slice(1);
      if (n) return { provider: "youtube", id: n };
    }
    if (e === "vimeo.com") {
      const n = s.pathname.replace(/^\//, "").split("/")[0];
      if (/^\d+$/.test(n)) return { provider: "vimeo", id: n };
    }
    return null;
  } catch {
    return null;
  }
}
function js({} = {}) {
  return ({ value: t, row: s, td: e }) => {
    if (L(t)) return "";
    e && e.classList.add("sg-renderer-videolink-cell");
    const n = Rl(String(t));
    if (!n) return u(
      "a",
      { class: "sg-renderer-link", href: String(t), target: "_blank", rel: "noopener noreferrer" },
      document.createTextNode(String(t))
    );
    const r = u("a", {
      class: "sg-renderer-link sg-renderer-videolink",
      href: String(t),
      target: "_blank",
      rel: "noopener noreferrer"
    }), i = n.provider === "youtube" ? `https://i.ytimg.com/vi/${n.id}/default.jpg` : null;
    i ? r.append(u("img", {
      src: i,
      alt: "",
      class: "sg-renderer-videolink-thumb",
      loading: "lazy",
      decoding: "async"
    })) : r.append(u(
      "span",
      { class: "sg-pill sg-pill-blue sg-renderer-videolink-provider" },
      document.createTextNode(n.provider === "vimeo" ? "Vimeo" : "YouTube")
    ));
    const o = s?.title || n.id;
    return r.append(u(
      "span",
      { class: "sg-renderer-videolink-title" },
      document.createTextNode(o)
    )), s?.duration && r.append(u(
      "span",
      { class: "sg-renderer-videolink-duration" },
      document.createTextNode(String(s.duration))
    )), r;
  };
}
function zs({
  size: t = 12,
  color: s = "#9ca3af",
  label: e = "Loading"
} = {}) {
  return ({ value: n }) => n != null && n !== "" && n !== "loading" && n !== "…" ? String(n) : u("span", {
    class: "sg-renderer-spinner",
    style: `width: ${t}px; height: ${t}px; border-color: ${s}; border-top-color: transparent;`,
    "aria-label": e,
    role: "progressbar"
  });
}
const Pl = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zm0 3a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0V5.25A.75.75 0 008 4.5zm0 6.5a1 1 0 100 2 1 1 0 000-2z"/></svg>';
function Us({
  icon: t = Pl,
  retryLabel: s = "Retry"
} = {}) {
  return (e) => {
    const { value: n, td: r } = e;
    if (L(n)) return "";
    r && r.classList.add("sg-renderer-error-cell");
    let i, o = null;
    n instanceof Error ? i = n.message : typeof n == "object" ? (i = n.message || String(n), o = n.retry) : i = String(n);
    const a = u("span", { class: "sg-renderer-error", title: i }), l = u("span", { class: "sg-renderer-error-icon", "aria-hidden": "true" });
    if (l.innerHTML = t, a.append(l), a.append(u("span", { class: "sg-renderer-error-msg" }, document.createTextNode(i))), typeof o == "function") {
      const c = u(
        "button",
        { type: "button", class: "sg-renderer-error-retry" },
        document.createTextNode(s)
      );
      c.addEventListener("click", (d) => {
        d.stopPropagation(), o(e.row, e);
      }), a.append(c);
    }
    return a;
  };
}
const Il = {
  synced: { color: "green", icon: "✓", label: "Synced" },
  syncing: { color: "blue", icon: "↻", label: "Syncing", spin: !0 },
  pending: { color: "orange", icon: "◔", label: "Pending" },
  error: { color: "red", icon: "✕", label: "Sync error" },
  conflict: { color: "orange", icon: "⚡", label: "Conflict" },
  offline: { color: "gray", icon: "⌧", label: "Offline" }
};
function Ks({} = {}) {
  return ({ value: t, td: s }) => {
    if (L(t)) return "";
    s && s.classList.add("sg-renderer-sync-cell");
    const e = String(t).toLowerCase(), n = Il[e] || { color: "gray", icon: "·", label: String(t) }, r = u("span", { class: `sg-pill sg-pill-${n.color}`, title: n.label });
    return r.append(u("span", {
      class: `sg-renderer-sync-icon${n.spin ? " is-spinning" : ""}`,
      "aria-hidden": "true"
    }, document.createTextNode(n.icon))), r.append(u("span", { class: "sg-pill-label" }, document.createTextNode(n.label))), r;
  };
}
function Ws({
  timestampField: t = "updated_at",
  threshold: s = 3600 * 1e3,
  // 1 hour
  inner: e = null
  // wrap value via this child renderer
} = {}) {
  return (n) => {
    const { row: r, value: i, td: o } = n;
    o && o.classList.add("sg-renderer-stale-cell");
    const a = r && t ? U(r[t]) : null, l = a ? Date.now() - a.getTime() > s : !1, c = u("span", { class: `sg-renderer-stale${l ? " is-stale" : ""}` });
    if (typeof e == "function") {
      const d = e(n);
      d != null && (typeof d == "string" ? c.innerHTML = d : d instanceof Node ? c.append(d) : c.append(document.createTextNode(String(d))));
    } else
      c.append(document.createTextNode(i == null ? "" : String(i)));
    return l && c.append(u(
      "span",
      { class: "sg-renderer-stale-tag", title: a ? `Last updated ${a.toLocaleString()}` : "stale" },
      document.createTextNode("stale")
    )), c;
  };
}
function qs({
  timestampField: t = "updated_at",
  freshFor: s = 5 * 1e3,
  inner: e = null
} = {}) {
  return (n) => {
    const { row: r, value: i, td: o } = n;
    o && o.classList.add("sg-renderer-fresh-cell");
    const a = r && t ? U(r[t]) : null, l = a ? Date.now() - a.getTime() < s : !1, c = u("span", { class: `sg-renderer-fresh${l ? " is-fresh" : ""}` });
    if (typeof e == "function") {
      const d = e(n);
      d != null && (typeof d == "string" ? c.innerHTML = d : d instanceof Node ? c.append(d) : c.append(document.createTextNode(String(d))));
    } else
      c.append(document.createTextNode(i == null ? "" : String(i)));
    return l && o && setTimeout(() => c.classList.remove("is-fresh"), s), c;
  };
}
function Vl(t) {
  if (t <= 0) return "expired";
  const s = Math.floor(t / 1e3), e = Math.floor(s / 86400), n = Math.floor(s % 86400 / 3600), r = Math.floor(s % 3600 / 60), i = s % 60;
  return e > 0 ? `${e}d ${n}h ${r}m` : n > 0 ? `${n}h ${r}m ${i}s` : r > 0 ? `${r}m ${i}s` : `${i}s`;
}
function Ys({
  interval: t = 1e3,
  expiredText: s = "expired"
} = {}) {
  return ({ value: e, td: n }) => {
    if (n && n.classList.add("sg-renderer-countdown-cell"), L(e)) return "";
    const r = U(e);
    if (!r) return String(e);
    const i = u("span", { class: "sg-renderer-countdown", title: r.toLocaleString() }), o = () => {
      const l = r.getTime() - Date.now();
      i.textContent = l <= 0 ? s : Vl(l), i.classList.toggle("is-expired", l <= 0);
    };
    o();
    const a = setInterval(() => {
      i.isConnected ? o() : clearInterval(a);
    }, t);
    return i;
  };
}
function Zs({
  asOfField: t = "as_of",
  unit: s = "years"
} = {}) {
  return ({ value: e, row: n, td: r }) => {
    if (r && r.classList.add("sg-renderer-age-cell"), L(e)) return "";
    const i = U(e);
    if (!i) return String(e);
    const o = n && t && n[t] ? U(n[t]) || /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(), a = o.getFullYear() - i.getFullYear() - (o.getMonth() < i.getMonth() || o.getMonth() === i.getMonth() && o.getDate() < i.getDate() ? 1 : 0);
    return String(a);
  };
}
function Fl(t) {
  const s = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()));
  s.setUTCDate(s.getUTCDate() + 4 - (s.getUTCDay() || 7));
  const e = new Date(Date.UTC(s.getUTCFullYear(), 0, 1));
  return Math.ceil(((s - e) / 864e5 + 1) / 7);
}
function Xs({
  unit: t = "quarter",
  fiscalStartMonth: s = 7,
  format: e = null
} = {}) {
  return ({ value: n, td: r }) => {
    if (r && r.classList.add("sg-renderer-fiscal-cell"), L(n)) return "";
    const i = U(n);
    if (!i) return String(n);
    let o;
    switch (t) {
      case "week":
        o = `W${String(Fl(i)).padStart(2, "0")} ${i.getFullYear()}`;
        break;
      case "month":
        o = new Intl.DateTimeFormat(void 0, { month: "short", year: "numeric" }).format(i);
        break;
      case "quarter": {
        o = `Q${Math.floor(i.getMonth() / 3) + 1} ${i.getFullYear()}`;
        break;
      }
      case "fiscalYear": {
        const a = s - 1, l = i.getMonth() >= a ? i.getFullYear() + 1 : i.getFullYear();
        o = `FY${String(l).slice(-2)}`;
        break;
      }
      default:
        o = i.toISOString().slice(0, 10);
    }
    return typeof e == "function" && (o = e(o, i)), u("span", { class: "sg-pill sg-pill-blue" }, document.createTextNode(o));
  };
}
function sn(t, s = /* @__PURE__ */ new Date()) {
  try {
    return (new Intl.DateTimeFormat("en-US", { timeZone: t, timeZoneName: "shortOffset" }).formatToParts(s).find((i) => i.type === "timeZoneName")?.value || "").replace(/^GMT/, "UTC");
  } catch {
    return "";
  }
}
const Bl = [
  "Pacific/Auckland",
  "Pacific/Fiji",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Brisbane",
  "Australia/Adelaide",
  "Australia/Perth",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "Europe/Dublin",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Berlin",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Africa/Johannesburg",
  "Africa/Lagos",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Phoenix",
  "America/Los_Angeles",
  "America/Anchorage",
  "Pacific/Honolulu",
  "UTC"
];
function Js({
  withCity: t = !0,
  editable: s = !1,
  options: e = null
} = {}) {
  return (n) => {
    const { value: r, td: i } = n;
    if (i && (i.classList.add("sg-renderer-tz-cell"), s && !i._sgTzBound)) {
      i._sgTzBound = !0;
      const d = e || Bl;
      i._sgSelectOpts = d.map((p) => {
        const f = sn(p), g = p.split("/").pop().replace(/_/g, " ");
        return { value: p, label: `${g} (${f || "?"}) — ${p}` };
      }), i._sgSelectClearable = !1, i.addEventListener("dblclick", (p) => {
        p._sgSelectHandled || (p._sgSelectHandled = !0, p.stopPropagation(), Ur(i, n));
      });
    }
    if (L(r)) return "";
    const o = String(r), a = sn(o), l = t ? o.split("/").pop().replace(/_/g, " ") : o, c = u("span", { class: "sg-renderer-tz", title: o });
    return c.append(u("span", { class: "sg-renderer-tz-city" }, document.createTextNode(l))), c.append(" "), c.append(u("span", { class: "sg-renderer-tz-offset" }, document.createTextNode(a ? `(${a})` : ""))), c;
  };
}
function Hl(t) {
  const s = String(t).trim().split(/\s+/);
  if (s.length !== 5) return null;
  const [e, n, r, i, o] = s, a = e === "*" && n === "*" && r === "*" && i === "*" && o === "*", l = /^\d+$/.test(e) && n === "*" && r === "*" && i === "*" && o === "*", c = /^\d+$/.test(e) && /^\d+$/.test(n) && r === "*" && i === "*" && o === "*", d = e === "0" && /^\*\/\d+$/.test(n) && r === "*" && i === "*" && o === "*", p = /^\d+$/.test(e) && /^\d+$/.test(n) && r === "*" && i === "*" && /^[0-6]$/.test(o), f = /^\d+$/.test(e) && /^\d+$/.test(n) && /^\d+$/.test(r) && i === "*" && o === "*", g = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return a ? "Every minute" : l ? `Hourly at :${e.padStart(2, "0")}` : d ? `Every ${n.split("/")[1]} hours` : c ? `Daily at ${n.padStart(2, "0")}:${e.padStart(2, "0")}` : p ? `Weekly on ${g[Number(o)]} at ${n.padStart(2, "0")}:${e.padStart(2, "0")}` : f ? `Monthly on day ${r} at ${n.padStart(2, "0")}:${e.padStart(2, "0")}` : null;
}
function Qs({} = {}) {
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-cron-cell"), L(t)) return "";
    const e = String(t).trim(), n = Hl(e), r = u("span", { class: "sg-renderer-cron" });
    return n ? (r.append(u("span", { class: "sg-renderer-cron-human" }, document.createTextNode(n))), r.append(u(
      "code",
      { class: "sg-renderer-uuid-mono sg-renderer-cron-expr" },
      document.createTextNode(e)
    ))) : r.append(u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(e))), r.title = e, r;
  };
}
function ei({
  min: t = 0,
  max: s = 100,
  width: e = 56,
  height: n = 32,
  thickness: r = 6,
  color: i = "#3b82f6",
  trackColor: o = "#e5e7eb",
  showValue: a = !0,
  format: l = null
} = {}) {
  return ({ value: c, td: d }) => {
    if (d && d.classList.add("sg-renderer-gauge-cell"), L(c)) return "";
    let p = Number(c);
    if (!Number.isFinite(p)) return String(c);
    p = Math.max(t, Math.min(s, p));
    const f = (p - t) / Math.max(1e-9, s - t), g = r / 2 + 1, h = e / 2, b = n - g, m = Math.min(h - g, b - g), _ = (T) => {
      if (T <= 0) return "";
      const k = h - m, $ = b, M = h, D = b - m;
      if (T >= 1) {
        const F = h + m;
        return `M ${k},${$} A ${m},${m} 0 0 1 ${M},${D} A ${m},${m} 0 0 1 ${F},${$}`;
      }
      const V = Math.PI + Math.PI * T, I = h + m * Math.cos(V), B = b + m * Math.sin(V);
      return T <= 0.5 ? `M ${k},${$} A ${m},${m} 0 0 1 ${I},${B}` : `M ${k},${$} A ${m},${m} 0 0 1 ${M},${D} A ${m},${m} 0 0 1 ${I},${B}`;
    }, y = _(1), w = _(f), x = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    x.setAttribute("viewBox", `0 0 ${e} ${n}`), x.setAttribute("width", e), x.setAttribute("height", n);
    const S = document.createElementNS("http://www.w3.org/2000/svg", "path");
    if (S.setAttribute("d", y), S.setAttribute("stroke", o), S.setAttribute("stroke-width", r), S.setAttribute("fill", "none"), S.setAttribute("stroke-linecap", "round"), x.append(S), w) {
      const T = document.createElementNS("http://www.w3.org/2000/svg", "path");
      T.setAttribute("d", w), T.setAttribute("stroke", i), T.setAttribute("stroke-width", r), T.setAttribute("fill", "none"), T.setAttribute("stroke-linecap", "round"), x.append(T);
    }
    const N = u("span", { class: "sg-renderer-gauge" });
    if (N.append(x), a) {
      const T = l || ((k) => String(k));
      N.append(u(
        "span",
        { class: "sg-renderer-gauge-value" },
        document.createTextNode(T(p))
      ));
    }
    return N;
  };
}
function ti({
  width: t = 80,
  height: s = 18,
  winColor: e = "#22c55e",
  lossColor: n = "#ef4444",
  drawColor: r = "#9ca3af"
} = {}) {
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-winloss-cell"), L(i)) return "";
    const a = Array.isArray(i) ? i : String(i).split(",").map((g) => g.trim());
    if (!a.length) return "";
    const l = t / a.length, c = Math.max(0.5, l * 0.2), d = s / 2;
    let p = "";
    a.forEach((g, h) => {
      const b = typeof g == "number" ? g : g === "W" || g === "w" || g === "1" || g === !0 ? 1 : g === "L" || g === "l" || g === "-1" || g === !1 ? -1 : 0, m = h * l + c / 2, _ = l - c;
      b > 0 ? p += `<rect x="${m}" y="0" width="${_}" height="${d - 1}" fill="${e}"/>` : b < 0 ? p += `<rect x="${m}" y="${d + 1}" width="${_}" height="${d - 1}" fill="${n}"/>` : p += `<rect x="${m}" y="${d - 0.5}" width="${_}" height="1" fill="${r}"/>`;
    });
    const f = u("span", { class: "sg-renderer-winloss" });
    return f.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${s}" width="${t}" height="${s}">${p}</svg>`, f;
  };
}
function ni({
  width: t = 100,
  height: s = 24,
  color: e = "#3b82f6",
  showLabels: n = !1
} = {}) {
  return ({ value: r, td: i }) => {
    if (i && i.classList.add("sg-renderer-minibar-cell"), L(r)) return "";
    const o = Array.isArray(r) ? r.map((h) => typeof h == "object" ? h : { value: Number(h) }) : [];
    if (!o.length) return "";
    const a = o.map((h) => Number(h.value) || 0), l = Math.max(1, ...a), c = o.length, d = t / c, p = Math.max(1, d * 0.18);
    let f = "";
    o.forEach((h, b) => {
      const m = b * d + p / 2, _ = d - p, w = (Number(h.value) || 0) / l * s;
      f += `<rect x="${m}" y="${s - w}" width="${_}" height="${w}" fill="${h.color || e}"/>`, n && h.label && (f += `<text x="${m + _ / 2}" y="${s - 1}" font-size="7" fill="#fff" text-anchor="middle">${String(h.label).slice(0, 3)}</text>`);
    });
    const g = u("span", { class: "sg-renderer-minibar" });
    return g.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${s}" width="${t}" height="${s}">${f}</svg>`, g;
  };
}
function ri({
  width: t = 100,
  height: s = 24,
  palette: e = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ef4444"],
  smooth: n = !1,
  fill: r = !0
} = {}) {
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-miniline-cell"), L(i)) return "";
    let a = [];
    if (Array.isArray(i) && Array.isArray(i[0]) ? a = i.map((x, S) => ({ color: e[S % e.length], data: x })) : i && Array.isArray(i.series) ? a = i.series.map((x, S) => ({ color: x.color || e[S % e.length], data: x.data })) : Array.isArray(i) && (a = [{ color: e[0], data: i }]), !a.length) return "";
    const l = a.flatMap((x) => x.data.map(Number).filter(Number.isFinite)), c = Math.max(...l), d = Math.min(...l), p = Math.max(1e-9, c - d), f = 1.2, g = f, h = s - f, b = h - g;
    let m = "";
    for (const x of a) {
      const S = x.data.map((N, T) => {
        const k = T / Math.max(1, x.data.length - 1) * t, $ = h - (Number(N) - d) / p * b;
        return `${k.toFixed(2)},${$.toFixed(2)}`;
      });
      m += `<polyline fill="none" stroke="${x.color}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" points="${S.join(" ")}"/>`;
    }
    const _ = u("span", { class: `sg-renderer-miniline${r ? " is-fill" : ""}` }), y = r ? "100%" : String(t), w = String(s);
    return _.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${s}" preserveAspectRatio="none" width="${y}" height="${w}">${m}</svg>`, _;
  };
}
const Ol = '<svg viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M6 2l4 6H2z"/></svg>', Gl = '<svg viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M6 10L2 4h8z"/></svg>', jl = '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="5" width="8" height="2" fill="currentColor"/></svg>';
function si({
  width: t = 60,
  height: s = 16,
  showValue: e = !0,
  format: n = null
} = {}) {
  return ({ value: r, td: i }) => {
    if (i && i.classList.add("sg-renderer-trend-cell"), L(r)) return "";
    const o = typeof r == "object" ? r : { change: 0, series: [] }, a = Number(o.change ?? 0), l = a > 0 ? "up" : a < 0 ? "down" : "flat", c = u("span", { class: `sg-renderer-trend is-${l}` }), d = u("span", { class: "sg-renderer-trend-icon", "aria-hidden": "true" });
    if (d.innerHTML = l === "up" ? Ol : l === "down" ? Gl : jl, c.append(d), e) {
      const p = n || ((f) => `${f > 0 ? "+" : ""}${Number(f).toFixed(1)}%`);
      c.append(u(
        "span",
        { class: "sg-renderer-trend-pct" },
        document.createTextNode(p(a))
      ));
    }
    if (Array.isArray(o.series) && o.series.length) {
      const p = Math.max(...o.series), f = Math.min(...o.series), g = Math.max(1e-9, p - f), h = o.series.map((_, y) => {
        const w = y / Math.max(1, o.series.length - 1) * t, x = s - (Number(_) - f) / g * s;
        return `${w.toFixed(2)},${x.toFixed(2)}`;
      }).join(" "), b = l === "up" ? "#10b981" : l === "down" ? "#ef4444" : "#9ca3af", m = u("span", { class: "sg-renderer-trend-spark" });
      m.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${s}" width="${t}" height="${s}"><polyline fill="none" stroke="${b}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" points="${h}"/></svg>`, c.append(m);
    }
    return c;
  };
}
function zl(t, s) {
  const e = String(t).trim(), n = (s || "").toString().toUpperCase(), r = e.replace(/\D/g, "");
  switch (n) {
    case "AU":
    case "AUSTRALIA":
      return r.length === 4 ? r : e;
    case "US":
    case "USA":
    case "UNITED STATES":
      return r.length === 5 ? r : r.length === 9 ? `${r.slice(0, 5)}-${r.slice(5)}` : e;
    case "CA":
    case "CANADA": {
      const i = e.replace(/\s+/g, "").toUpperCase();
      return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(i) ? `${i.slice(0, 3)} ${i.slice(3)}` : e;
    }
    case "GB":
    case "UK":
    case "UNITED KINGDOM": {
      const i = e.replace(/\s+/g, "").toUpperCase(), o = /^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/.exec(i);
      return o ? `${o[1]} ${o[2]}` : e;
    }
    default:
      return e;
  }
}
function ii({
  country: t = null,
  countryField: s = "country"
} = {}) {
  return ({ value: e, row: n, td: r }) => {
    if (L(e)) return "";
    r && r.classList.add("sg-renderer-postal-cell");
    const i = t || (n && s ? n[s] : null), o = zl(e, i);
    return u(
      "span",
      { class: "sg-renderer-uuid", title: o },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(o))
    );
  };
}
let et = null;
function ae() {
  if (!et) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = et;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), et = null, Z(n);
}
function Ul(t, s) {
  ae();
  const { row: e, col: n } = s, r = e && n?.field != null ? e[n.field] : null;
  let i = { street: "", street2: "", city: "", state: "", zip: "" };
  r && typeof r == "object" ? i = {
    street: r.street || r.address1 || "",
    street2: r.street2 || r.address2 || "",
    city: r.city || "",
    state: (r.state || "").toUpperCase(),
    zip: r.zip || r.postcode || r.postal_code || ""
  } : typeof r == "string" && r.trim() && (i.street = r.trim());
  const o = u("div", { class: "sg-renderer-address-popover", role: "dialog" });
  o.addEventListener("mousedown", (T) => T.stopPropagation());
  const a = (T, k, $ = {}) => {
    const M = u("label", { class: "sg-renderer-address-field" });
    M.append(u("span", { class: "sg-renderer-address-label" }, document.createTextNode(T)));
    const D = u("input", { type: "text", class: "sg-renderer-address-input", ...$ });
    return D.value = i[k] || "", D.dataset.key = k, M.append(D), { wrap: M, input: D };
  }, l = a("Street", "street"), c = a("Apt/Ste", "street2"), d = a("City", "city"), p = a("State", "state", { maxlength: 2 }), f = a("ZIP", "zip", { maxlength: 10 }), g = u("div", { class: "sg-renderer-address-row" });
  g.append(l.wrap);
  const h = u("div", { class: "sg-renderer-address-row" });
  h.append(c.wrap);
  const b = u("div", { class: "sg-renderer-address-row sg-renderer-address-row-3" });
  b.append(d.wrap, p.wrap, f.wrap);
  function m() {
    const { api: T } = s, k = {
      street: l.input.value.trim(),
      street2: c.input.value.trim(),
      city: d.input.value.trim(),
      state: p.input.value.trim().toUpperCase(),
      zip: f.input.value.trim()
    };
    k.street2 || delete k.street2;
    const $ = e && n?.field != null ? e[n.field] : null;
    e && n?.field != null && (e[n.field] = k), T?.applyTransaction && T.applyTransaction({ update: [e] });
    const M = t.closest('[data-controller~="grid"]');
    M && M.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: e?.id ?? e?._sg_id, colId: n?.field, oldValue: $, newValue: k }
    })), ae();
  }
  const _ = u("div", { class: "sg-renderer-textarea-footer" }), y = u(
    "span",
    { class: "sg-renderer-textarea-hint" },
    document.createTextNode("Enter to save · Esc to cancel")
  ), w = u(
    "button",
    { type: "button", class: "sg-renderer-timepicker-cancel" },
    document.createTextNode("Cancel")
  ), x = u(
    "button",
    { type: "button", class: "sg-renderer-timepicker-ok" },
    document.createTextNode("Save")
  );
  w.addEventListener("click", () => ae()), x.addEventListener("click", m), _.append(y, w, x), o.append(g, h, b, _), o.addEventListener("keydown", (T) => {
    T.key === "Enter" && T.target.tagName === "INPUT" ? (T.preventDefault(), m()) : T.key === "Escape" && (T.stopPropagation(), ae());
  });
  function S(T) {
    T.key === "Escape" && (T.stopPropagation(), ae());
  }
  function N(T) {
    !o.contains(T.target) && !t.contains(T.target) && ae();
  }
  document.addEventListener("keydown", S), setTimeout(() => document.addEventListener("mousedown", N), 0), document.body.appendChild(o), z(o, t), setTimeout(() => l.input.focus(), 0), et = { pop: o, onKey: S, onDocClick: N, anchor: t };
}
function Kl(t) {
  return t == null || t === "" ? null : typeof t == "string" ? { _raw: t.trim() } : typeof t != "object" ? null : {
    street: t.street || t.address1 || "",
    street2: t.street2 || t.address2 || "",
    city: t.city || "",
    state: (t.state || "").toUpperCase(),
    zip: t.zip || t.postcode || t.postal_code || ""
  };
}
function oi({ empty: t = "", editable: s = !1 } = {}) {
  return (e) => {
    const { value: n, td: r } = e;
    r && (r.classList.add("sg-renderer-address-cell"), s && !r._sgAddrBound && (r._sgAddrBound = !0, r._sgTextareaRows = 6, r._sgTextareaCols = 36, r.addEventListener("dblclick", (c) => {
      c._sgTextareaHandled || (c._sgTextareaHandled = !0, c.stopPropagation(), Ul(r, e));
    })));
    const i = Kl(n);
    if (!i) return t;
    if (i._raw)
      return u("span", { class: "sg-renderer-address" }, document.createTextNode(i._raw));
    const o = u("div", { class: "sg-renderer-address sg-renderer-address-us" }), a = [i.street, i.street2].filter(Boolean).join(", ");
    a && o.append(u("span", { class: "sg-address-line" }, document.createTextNode(a)));
    const l = [i.city, i.state].filter(Boolean).join(", ") + (i.zip ? ` ${i.zip}` : "");
    return l.trim() && (a && o.append(u("span", { class: "sg-address-sep" }, document.createTextNode(" · "))), o.append(u("span", { class: "sg-address-line" }, document.createTextNode(l.trim())))), o;
  };
}
function Wl(t) {
  return t == null || t === "" ? null : typeof t == "string" ? { _raw: t.trim() } : typeof t != "object" ? null : {
    line1: t.line1 || t.address1 || t.street || "",
    line2: t.line2 || t.address2 || t.street2 || "",
    city: t.city || "",
    region: t.region || t.state || "",
    postal_code: t.postal_code || t.postcode || t.zip || "",
    country: t.country || ""
  };
}
function ai({ empty: t = "", multiline: s = !1 } = {}) {
  return ({ value: e, td: n }) => {
    n && n.classList.add("sg-renderer-address-cell");
    const r = Wl(e);
    if (!r) return t;
    if (r._raw) return u("span", { class: "sg-renderer-address" }, document.createTextNode(r._raw));
    const i = [];
    r.line1 && i.push(r.line1), r.line2 && i.push(r.line2);
    const o = [r.city, r.region, r.postal_code].filter(Boolean).join(" ");
    if (o && i.push(o), r.country && i.push(r.country), s) {
      const a = u("div", { class: "sg-renderer-address sg-renderer-address-multi" });
      return i.forEach((l, c) => {
        c > 0 && a.append(u("br")), a.append(document.createTextNode(l));
      }), a;
    }
    return u(
      "span",
      { class: "sg-renderer-address" },
      document.createTextNode(i.join(" · "))
    );
  };
}
const ql = [
  "11011001100",
  "11001101100",
  "11001100110",
  "10010011000",
  "10010001100",
  "10001001100",
  "10011001000",
  "10011000100",
  "10001100100",
  "11001001000",
  "11001000100",
  "11000100100",
  "10110011100",
  "10011011100",
  "10011001110",
  "10111001100",
  "10011101100",
  "10011100110",
  "11001110010",
  "11001011100",
  "11001001110",
  "11011100100",
  "11001110100",
  "11101101110",
  "11101001100",
  "11100101100",
  "11100100110",
  "11101100100",
  "11100110100",
  "11100110010",
  "11011011000",
  "11011000110",
  "11000110110",
  "10100011000",
  "10001011000",
  "10001000110",
  "10110001000",
  "10001101000",
  "10001100010",
  "11010001000",
  "11000101000",
  "11000100010",
  "10110111000",
  "10110001110",
  "10001101110",
  "10111011000",
  "10111000110",
  "10001110110",
  "11101110110",
  "11010001110",
  "11000101110",
  "11011101000",
  "11011100010",
  "11011101110",
  "11101011000",
  "11101000110",
  "11100010110",
  "11101101000",
  "11101100010",
  "11100011010",
  "11101111010",
  "11001000010",
  "11110001010",
  "10100110000",
  "10100001100",
  "10010110000",
  "10010000110",
  "10000101100",
  "10000100110",
  "10110010000",
  "10110000100",
  "10011010000",
  "10011000010",
  "10000110100",
  "10000110010",
  "11000010010",
  "11001010000",
  "11110111010",
  "11000010100",
  "10001111010",
  "10100111100",
  "10010111100",
  "10010011110",
  "10111100100",
  "10011110100",
  "10011110010",
  "11110100100",
  "11110010100",
  "11110010010",
  "11011011110",
  "11011110110",
  "11110110110",
  "10101111000",
  "10100011110",
  "10001011110",
  "10111101000",
  "10111100010",
  "11110101000",
  "11110100010",
  "10111011110",
  "10111101110",
  "11101011110",
  "11110101110",
  "11010000100",
  "11010010000",
  "11010011100"
], Yl = 32, on = 104, Zl = 106;
function Xl(t) {
  const s = [on];
  let e = on;
  for (let n = 0; n < t.length; n++) {
    const r = t.charCodeAt(n);
    if (r < 32 || r > 126) continue;
    const i = r - Yl;
    s.push(i), e += i * (n + 1);
  }
  return s.push(e % 103), s.push(Zl), s.map((n) => ql[n]).join("") + "11";
}
function li({
  height: t = 32,
  showText: s = !0,
  moduleWidth: e = 1.4
} = {}) {
  return ({ value: n, td: r }) => {
    if (L(n)) return "";
    r && r.classList.add("sg-renderer-barcode-cell");
    const i = String(n), o = Xl(i), a = o.length * e, l = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a} ${t}" width="${a}" height="${t}" aria-label="barcode ${i}">`;
    let c = 0, d = "";
    for (let f = 0; f < o.length; f++)
      o[f] === "1" && (d += `<rect x="${c}" y="0" width="${e}" height="${t}" fill="currentColor"/>`), c += e;
    const p = u("span", { class: "sg-renderer-barcode", title: i });
    return p.innerHTML = `${l}${d}</svg>`, s && p.append(u(
      "span",
      { class: "sg-renderer-barcode-text" },
      document.createTextNode(i)
    )), p;
  };
}
const Dt = {
  AT: "Austria",
  AU: "Australia",
  BE: "Belgium",
  CH: "Switzerland",
  DE: "Germany",
  DK: "Denmark",
  ES: "Spain",
  FI: "Finland",
  FR: "France",
  GB: "United Kingdom",
  IE: "Ireland",
  IT: "Italy",
  NL: "Netherlands",
  NO: "Norway",
  NZ: "New Zealand",
  PT: "Portugal",
  SE: "Sweden",
  US: "United States"
};
function ci({} = {}) {
  return ({ value: t, td: s }) => {
    if (L(t)) return "";
    s && s.classList.add("sg-renderer-iban-cell");
    const e = String(t).replace(/\s+/g, "").toUpperCase(), n = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(e), r = e.match(/.{1,4}/g)?.join(" ") || e, i = e.slice(0, 2), o = Dt[i];
    return u(
      "span",
      { class: `sg-renderer-uuid${n ? "" : " is-invalid"}`, title: o ? `${r} — ${o}` : r },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(r))
    );
  };
}
function di({} = {}) {
  return ({ value: t, td: s }) => {
    if (L(t)) return "";
    s && s.classList.add("sg-renderer-swift-cell");
    const e = String(t).replace(/\s+/g, "").toUpperCase(), n = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(e);
    let r;
    n ? r = e.length === 8 ? `${e.slice(0, 4)} ${e.slice(4, 6)} ${e.slice(6, 8)}` : `${e.slice(0, 4)} ${e.slice(4, 6)} ${e.slice(6, 8)} ${e.slice(8, 11)}` : r = e;
    const i = e.slice(4, 6), o = Dt[i];
    return u(
      "span",
      { class: `sg-renderer-uuid${n ? "" : " is-invalid"}`, title: o ? `${r} — ${o}` : r },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(r))
    );
  };
}
function ui({} = {}) {
  return ({ value: t, td: s }) => {
    if (L(t)) return "";
    s && s.classList.add("sg-renderer-mask-numeric");
    const e = String(t).replace(/\D/g, "");
    if (e.length !== 9)
      return u(
        "span",
        { class: "sg-renderer-uuid is-invalid" },
        u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(String(t)))
      );
    const n = `•••-••-${e.slice(5)}`;
    return u(
      "span",
      { class: "sg-renderer-uuid", title: "SSN (masked)" },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(n))
    );
  };
}
function pi({} = {}) {
  return ({ value: t, td: s }) => {
    if (L(t)) return "";
    s && s.classList.add("sg-renderer-ein-cell");
    const e = String(t).replace(/\D/g, ""), n = e.length === 9, r = n ? `${e.slice(0, 2)}-${e.slice(2)}` : String(t);
    return u(
      "span",
      { class: `sg-renderer-uuid${n ? "" : " is-invalid"}`, title: r },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(r))
    );
  };
}
function fi({} = {}) {
  return ({ value: t, td: s }) => {
    if (L(t)) return "";
    s && s.classList.add("sg-renderer-vat-cell");
    const e = String(t).replace(/\s+/g, "").toUpperCase(), n = /^[A-Z]{2}[A-Z0-9]{2,15}$/.test(e), r = e.slice(0, 2), i = Dt[r];
    return u(
      "span",
      { class: `sg-renderer-uuid${n ? "" : " is-invalid"}`, title: i ? `${e} — ${i}` : e },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(e))
    );
  };
}
const Jl = /^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[A-D]$/i;
function gi({} = {}) {
  return ({ value: t, td: s }) => {
    if (L(t)) return "";
    s && s.classList.add("sg-renderer-nin-cell");
    const e = String(t).replace(/\s+/g, "").toUpperCase(), n = Jl.test(e), r = n ? `${e.slice(0, 2)} ${e.slice(2, 4)} ${e.slice(4, 6)} ${e.slice(6, 8)} ${e.slice(8)}` : e;
    return u(
      "span",
      { class: `sg-renderer-uuid${n ? "" : " is-invalid"}`, title: e },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(r))
    );
  };
}
const an = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6"
];
function Ql(t) {
  let s = 0;
  for (let e = 0; e < t.length; e++)
    s = (s << 5) - s + t.charCodeAt(e), s |= 0;
  return Math.abs(s);
}
function ec(t) {
  return String(t).split(/\s+/).filter(Boolean).slice(0, 2).map((s) => (s[0] || "").toUpperCase()).join("") || "?";
}
function Rt(t, s = 24) {
  const e = u("span", {
    class: "sg-renderer-avatar-stack-chip",
    style: `width: ${s}px; height: ${s}px; font-size: ${Math.round(s * 0.42)}px;`,
    title: t.name || t.label || ""
  });
  if (t.avatar)
    e.append(u("img", { src: t.avatar, alt: "", loading: "lazy", decoding: "async" }));
  else {
    const n = t.name || t.label || "?", r = t.color || an[Ql(n) % an.length];
    e.style.background = r, e.append(u(
      "span",
      { class: "sg-renderer-avatar-stack-initials" },
      document.createTextNode(ec(n))
    ));
  }
  return e;
}
function hi({
  max: t = 4,
  size: s = 24,
  showOverflow: e = !0
} = {}) {
  return (n) => {
    const { value: r } = n, i = n?.col?.cellRendererConfig || {}, o = i.max ?? t, a = i.size ?? s, l = i.showOverflow ?? e;
    if (L(r)) return "";
    const c = (Array.isArray(r) ? r : String(r).split(",")).map((g) => typeof g == "string" ? { name: g.trim() } : g).filter((g) => g && (g.name || g.avatar));
    if (!c.length) return "";
    const d = c.slice(0, o), p = c.length - d.length, f = u("span", { class: "sg-renderer-avatar-stack" });
    for (const g of d) f.append(Rt(g, a));
    return l && p > 0 && f.append(u("span", {
      class: "sg-renderer-avatar-stack-chip is-overflow",
      style: `width: ${a}px; height: ${a}px; font-size: ${Math.round(a * 0.36)}px;`,
      title: c.slice(o).map((g) => g.name).filter(Boolean).join(", ")
    }, document.createTextNode(`+${p}`))), f;
  };
}
const ot = {
  online: { color: "#22c55e", label: "Online" },
  away: { color: "#f59e0b", label: "Away" },
  busy: { color: "#ef4444", label: "Busy" },
  dnd: { color: "#ef4444", label: "Do not disturb" },
  offline: { color: "#9ca3af", label: "Offline" },
  invisible: { color: "transparent", label: "Invisible" }
};
function mi({
  showLabel: t = !1,
  size: s = 8
} = {}) {
  return (e) => {
    const { value: n } = e, r = e?.col?.cellRendererConfig || {}, i = r.showLabel ?? t, o = r.size ?? s;
    if (n == null || n === "") return "";
    let a = null;
    n === !0 ? a = "online" : n === !1 ? a = "offline" : typeof n == "object" ? a = n.status || n.state : a = String(n).toLowerCase();
    const l = ot[a] || ot.offline, c = typeof n == "object" && n.label || l.label, d = u("span", { class: "sg-renderer-presence", title: c });
    return d.append(u("span", {
      class: `sg-renderer-presence-dot is-${a}`,
      style: `width: ${o}px; height: ${o}px; background: ${l.color}; ${l.color === "transparent" ? "border: 1px solid #9ca3af;" : ""}`,
      "aria-hidden": "true"
    })), i && d.append(u(
      "span",
      { class: "sg-renderer-presence-label" },
      document.createTextNode(c)
    )), d;
  };
}
function bi({
  showPresence: t = !0,
  showAvatar: s = !0,
  size: e = 20,
  editable: n = !1,
  options: r = null,
  clearable: i = !0
} = {}) {
  return (o) => {
    const { value: a, td: l } = o, c = o?.col?.cellRendererConfig || {}, d = c.showPresence ?? t, p = c.showAvatar ?? s, f = c.size ?? e, g = c.editable ?? n, h = c.options ?? r, b = c.clearable ?? i;
    if (l && g && !l._sgAssigneeBound && (l._sgAssigneeBound = !0, l._sgAssigneeOpts = h || [], l._sgAssigneeClearable = b, l.addEventListener("dblclick", (x) => {
      x._sgAssigneeHandled || (x._sgAssigneeHandled = !0, x.stopPropagation(), tc(l, o));
    })), L(a)) return u(
      "span",
      { class: "sg-renderer-assignee-empty" },
      document.createTextNode("Unassigned")
    );
    const m = typeof a == "string" ? { name: a } : a, _ = m.name || m.label || "";
    if (!_ && !m.avatar) return "";
    const y = u("span", { class: "sg-renderer-assignee" });
    p && y.append(Rt(m, f));
    const w = u(
      "span",
      { class: "sg-renderer-assignee-name" },
      document.createTextNode(_)
    );
    if (d && m.presence) {
      const x = String(m.presence).toLowerCase(), S = ot[x] || ot.offline;
      w.prepend(u("span", {
        class: `sg-renderer-presence-dot is-${x}`,
        style: `width: 7px; height: 7px; background: ${S.color}; margin-right: 6px; ${S.color === "transparent" ? "border: 1px solid #9ca3af;" : ""}`,
        "aria-hidden": "true",
        title: S.label
      }));
    }
    return y.append(w), y;
  };
}
let tt = null;
function Pe() {
  if (!tt) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = tt;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), tt = null, Z(n);
}
function tc(t, s) {
  Pe();
  const e = t._sgAssigneeOpts || [], n = t._sgAssigneeClearable, { row: r, col: i } = s, o = r && i?.field != null ? r[i.field] : null, a = (typeof o == "string" ? o : o?.name) || "", l = u("div", { class: "sg-renderer-assignee-popover", role: "listbox" });
  l.addEventListener("mousedown", (f) => f.stopPropagation());
  function c(f) {
    const { api: g } = s, h = r && i?.field != null ? r[i.field] : null;
    r && i?.field != null && (r[i.field] = f), g?.applyTransaction && g.applyTransaction({ update: [r] });
    const b = t.closest('[data-controller~="grid"]');
    b && b.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: r?.id ?? r?._sg_id, colId: i?.field, oldValue: h, newValue: f }
    })), Pe();
  }
  if (n) {
    const f = u(
      "button",
      { type: "button", class: "sg-renderer-assignee-option sg-renderer-assignee-option-none", role: "option" },
      document.createTextNode("Unassigned")
    );
    f.addEventListener("click", () => c(null)), l.append(f);
  }
  if (!e.length) {
    const f = u(
      "div",
      { class: "sg-renderer-assignee-option-empty" },
      document.createTextNode("No people configured")
    );
    l.append(f);
  }
  for (const f of e) {
    const g = typeof f == "string" ? { name: f } : f, h = u("button", {
      type: "button",
      class: `sg-renderer-assignee-option${g.name === a ? " is-selected" : ""}`,
      role: "option"
    });
    h.append(Rt(g, 20)), h.append(u(
      "span",
      { class: "sg-renderer-assignee-option-name" },
      document.createTextNode(g.name || g.label || "")
    )), h.addEventListener("click", () => c(g)), l.append(h);
  }
  function d(f) {
    f.key === "Escape" && (f.stopPropagation(), Pe());
  }
  function p(f) {
    !l.contains(f.target) && !t.contains(f.target) && Pe();
  }
  document.addEventListener("keydown", d), setTimeout(() => document.addEventListener("mousedown", p), 0), document.body.appendChild(l), z(l, t), tt = { pop: l, onKey: d, onDocClick: p, anchor: t };
}
function yi({
  min: t = 0,
  max: s = 100,
  step: e = 1,
  format: n = null,
  color: r = "#3b82f6",
  editable: i = !0,
  range: o = !1,
  showValue: a = !0
} = {}) {
  return (l) => {
    const { value: c, row: d, col: p, api: f, td: g } = l, h = l?.col?.cellRendererConfig || {}, b = h.min ?? t, m = h.max ?? s, _ = h.step ?? e, y = h.range ?? o, w = n || (($) => String($)), x = h.showValue ?? a, S = h.color || r, N = h.editable ?? i;
    if (g && g.classList.add("sg-renderer-slider-cell"), L(c) && !y)
      return u(
        "span",
        { class: "sg-renderer-slider-placeholder" },
        document.createTextNode("—")
      );
    const T = u("div", { class: "sg-renderer-slider" });
    function k($) {
      const M = d && p?.field != null ? d[p.field] : null;
      d && p?.field != null && (d[p.field] = $), f?.applyTransaction && f.applyTransaction({ update: [d] });
      const D = g?.closest('[data-controller~="grid"]');
      D && D.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: d?.id ?? d?._sg_id, colId: p?.field, oldValue: M, newValue: $ }
      }));
    }
    if (y) {
      let X = function() {
        let O = Number(F.value), R = Number(q.value);
        O > R && ([O, R] = [R, O]);
        const G = (O - b) / D * 100, Q = (R - b) / D * 100;
        B.style.left = `${G}%`, B.style.width = `${Math.max(0, Q - G)}%`, ee.textContent = `${w(O)} – ${w(R)}`;
      }, te = function() {
        let O = Number(F.value), R = Number(q.value);
        O > R && ([O, R] = [R, O]), X(), k([O, R]);
      };
      const [$, M] = Array.isArray(c) ? c : [b, m], D = Math.max(1, m - b), V = u("div", { class: "sg-renderer-slider-range-stack" }), I = u("div", { class: "sg-renderer-slider-range-rail" }), B = u("div", { class: "sg-renderer-slider-range-fill", style: `background:${S};` }), F = u("input", {
        type: "range",
        class: "sg-renderer-slider-input sg-renderer-slider-range-low",
        min: b,
        max: m,
        step: _,
        value: $,
        disabled: N ? null : ""
      }), q = u("input", {
        type: "range",
        class: "sg-renderer-slider-input sg-renderer-slider-range-high",
        min: b,
        max: m,
        step: _,
        value: M,
        disabled: N ? null : ""
      });
      V.style.setProperty("--sg-slider-accent", S);
      const ee = u(
        "span",
        { class: "sg-renderer-slider-value" },
        document.createTextNode(`${w($)} – ${w(M)}`)
      );
      [F, q].forEach((O) => {
        O.addEventListener("click", (R) => R.stopPropagation()), O.addEventListener("input", X), O.addEventListener("change", te);
      }), V.append(I, B, F, q), T.append(V), x && T.append(ee), X();
    } else {
      const $ = Number(c), M = Number.isFinite($) ? $ : b, D = u("input", {
        type: "range",
        class: "sg-renderer-slider-input",
        min: b,
        max: m,
        step: _,
        value: M,
        disabled: N ? null : "",
        style: `accent-color: ${S};`
      }), V = u(
        "span",
        { class: "sg-renderer-slider-value" },
        document.createTextNode(w(M))
      );
      D.addEventListener("click", (I) => I.stopPropagation()), D.addEventListener("input", () => {
        V.textContent = w(Number(D.value));
      }), D.addEventListener("change", () => k(Number(D.value))), T.append(D), x && T.append(V);
    }
    return T;
  };
}
const nc = {
  NSW: { bg: "#1e3a8a", fg: "#ffffff" },
  VIC: { bg: "#1e3a8a", fg: "#ffffff" },
  QLD: { bg: "#7c2d12", fg: "#ffffff" },
  SA: { bg: "#7f1d1d", fg: "#ffffff" },
  WA: { bg: "#ca8a04", fg: "#ffffff" },
  TAS: { bg: "#14532d", fg: "#ffffff" },
  NT: { bg: "#9a3412", fg: "#ffffff" },
  ACT: { bg: "#374151", fg: "#facc15" }
};
function wi(t, s = nc) {
  const e = String(t || "").toUpperCase();
  if (!e) return null;
  const n = s[e] || { bg: "#6b7280", fg: "#ffffff" };
  return u("span", {
    class: "sg-renderer-state-badge",
    style: `background:${n.bg};color:${n.fg};`,
    title: e
  }, document.createTextNode(e));
}
function rc(t) {
  if (!t) return null;
  const s = t instanceof Date ? t : new Date(t);
  if (Number.isNaN(s.valueOf())) return null;
  const e = new Date(s.getFullYear(), s.getMonth(), s.getDate()).getTime(), n = /* @__PURE__ */ new Date(), r = new Date(n.getFullYear(), n.getMonth(), n.getDate()).getTime();
  return Math.round((e - r) / 864e5);
}
function sc(t) {
  return t == null ? null : t < 0 ? "is-expired" : t < 30 ? "is-soon" : t < 90 ? "is-warning" : "is-current";
}
function Pt(t, { label: s = "exp" } = {}) {
  if (!t) return null;
  const e = rc(t);
  if (e == null) return null;
  const n = sc(e), r = t instanceof Date ? t : new Date(t), i = `${String(r.getMonth() + 1).padStart(2, "0")}/${r.getFullYear()}`, o = e < 0 ? `expired ${i}` : `${s} ${i}`, a = e < 0 ? `Expired ${Math.abs(e)} day${Math.abs(e) === 1 ? "" : "s"} ago` : e === 0 ? "Expires today" : `Expires in ${e} day${e === 1 ? "" : "s"}`;
  return u("span", {
    class: `sg-renderer-expiry ${n}`,
    title: a
  }, document.createTextNode(o));
}
function vi({ editable: t = !0 } = {}) {
  return (s) => {
    const { value: e, td: n } = s;
    if (n && (n.classList.add("sg-renderer-licence-cell"), n._sgLicence = e, t && !n._sgLicenceEditBound && (n._sgLicenceEditBound = !0, n.addEventListener("dblclick", (o) => {
      o._sgLicenceHandled || (o._sgLicenceHandled = !0, o.stopPropagation(), _i(n, s));
    }))), L(e)) return "";
    if (typeof e == "string")
      return u(
        "span",
        { class: "sg-renderer-compliance" },
        u("span", { class: "sg-renderer-mono" }, document.createTextNode(e))
      );
    const r = u("span", { class: "sg-renderer-compliance" });
    e.state && r.append(wi(e.state)), e.number && r.append(u(
      "span",
      { class: "sg-renderer-mono" },
      document.createTextNode(String(e.number))
    )), e.class && r.append(u(
      "span",
      { class: "sg-renderer-compliance-class" },
      document.createTextNode(String(e.class))
    ));
    const i = Pt(e.expires);
    return i && r.append(i), r;
  };
}
let nt = null;
function ye() {
  if (!nt) return;
  const { pop: t, onKey: s, onDocClick: e } = nt;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), nt = null;
}
function _i(t, s) {
  ye();
  const e = t._sgLicence, n = e && typeof e == "object" ? { state: e.state || "", number: e.number ?? "", class: e.class ?? "", expires: e.expires || "" } : { state: "", number: typeof e == "string" ? e : "", class: "", expires: "" }, r = u("div", { class: "sg-licence-editor", role: "dialog" });
  r.addEventListener("mousedown", (w) => w.stopPropagation());
  const i = u(
    "div",
    { class: "sg-licence-editor-header" },
    document.createTextNode("Edit licence")
  ), o = u("form", { class: "sg-licence-editor-form", novalidate: "novalidate" }), a = u("div", { class: "sg-licence-editor-grid" });
  function l(w, x, S) {
    const N = u("label", { class: "sg-licence-editor-field", "data-field": x });
    return N.append(u("span", { class: "sg-licence-editor-label" }, document.createTextNode(w))), N.append(S), N;
  }
  const c = u("select", { name: "state", class: "sg-licence-editor-input" });
  c.append(u("option", { value: "" }, document.createTextNode("—")));
  for (const w of Qn)
    c.append(u(
      "option",
      { value: w, selected: n.state === w ? "" : null },
      document.createTextNode(`${w} — ${Tt[w]}`)
    ));
  const d = u("input", {
    type: "text",
    name: "number",
    class: "sg-licence-editor-input sg-renderer-mono",
    value: n.number,
    placeholder: "EC234567C"
  }), p = u("input", {
    type: "text",
    name: "class",
    class: "sg-licence-editor-input",
    value: n.class,
    placeholder: "Electrical"
  }), f = u("input", {
    type: "date",
    name: "expires",
    class: "sg-licence-editor-input",
    value: n.expires ? String(n.expires).slice(0, 10) : ""
  });
  a.append(
    l("State", "state", c),
    l("Licence #", "number", d),
    l("Class", "class", p),
    l("Expires", "expires", f)
  );
  const g = u("div", { class: "sg-licence-editor-footer" }), h = u(
    "button",
    { type: "button", class: "sg-licence-editor-cancel" },
    document.createTextNode("Cancel")
  ), b = u(
    "button",
    { type: "submit", class: "sg-licence-editor-save" },
    document.createTextNode("Save")
  );
  g.append(h, b), o.append(a, g), r.append(i, o);
  function m() {
    const w = {
      state: c.value || "",
      number: d.value.trim(),
      class: p.value.trim(),
      expires: f.value || ""
    }, x = !w.state && !w.number && !w.class && !w.expires;
    ic(t, s, x ? null : w), ye();
  }
  o.addEventListener("submit", (w) => {
    w.preventDefault(), m();
  }), h.addEventListener("click", () => ye());
  function _(w) {
    w.key === "Escape" && (w.stopPropagation(), ye());
  }
  function y(w) {
    !r.contains(w.target) && !t.contains(w.target) && ye();
  }
  document.addEventListener("keydown", _), setTimeout(() => document.addEventListener("mousedown", y), 0), document.body.appendChild(r), z(r, t), d.focus(), d.select(), nt = { pop: r, onKey: _, onDocClick: y };
}
function ic(t, s, e) {
  const { row: n, col: r, api: i } = s, o = n && r?.field != null ? n[r.field] : null;
  n && r?.field != null && (n[r.field] = e), t._sgLicence = e, i?.applyTransaction && i.applyTransaction({ update: [n] });
  const a = t.closest('[data-controller~="grid"]');
  a && a.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
    bubbles: !0,
    detail: { rowId: n?.id ?? n?._sg_id, colId: r?.field, oldValue: o, newValue: e }
  }));
}
function W({
  prefix: t = null,
  classLabel: s = null,
  expiryLabel: e = "exp",
  editable: n = !0
} = {}) {
  return (r) => {
    const { value: i, td: o } = r;
    if (o && (o.classList.add("sg-renderer-licence-cell"), o._sgLicence = i, n && !o._sgLicenceEditBound && (o._sgLicenceEditBound = !0, o.addEventListener("dblclick", (d) => {
      d._sgLicenceHandled || (d._sgLicenceHandled = !0, d.stopPropagation(), _i(o, r));
    }))), L(i)) return "";
    const a = u("span", { class: "sg-renderer-compliance" });
    if (typeof i == "string")
      return t && a.append(u(
        "span",
        { class: "sg-renderer-compliance-prefix" },
        document.createTextNode(t)
      )), a.append(u("span", { class: "sg-renderer-mono" }, document.createTextNode(i))), a;
    i.state ? a.append(wi(i.state)) : t && a.append(u(
      "span",
      { class: "sg-renderer-compliance-prefix" },
      document.createTextNode(t)
    )), i.number && a.append(u(
      "span",
      { class: "sg-renderer-mono" },
      document.createTextNode(String(i.number))
    ));
    const l = i.class ?? s;
    l && a.append(u(
      "span",
      { class: "sg-renderer-compliance-class" },
      document.createTextNode(String(l))
    ));
    const c = Pt(i.expires, { label: e });
    return c && a.append(c), a;
  };
}
function xi(t = {}) {
  return W({ prefix: "CIC", classLabel: "White Card", ...t });
}
function Ci(t = {}) {
  return W({ prefix: "BC", classLabel: "Blue Card (QLD)", ...t });
}
function Si(t = {}) {
  return W({ prefix: "WWCC", ...t });
}
function Li(t = {}) {
  return W({ prefix: "HRWL", ...t });
}
function ki(t = {}) {
  return W({ prefix: "COES", classLabel: "Electrical Safety", ...t });
}
function Ei(t = {}) {
  return W({ prefix: "COC", classLabel: "Compliance", ...t });
}
function $i(t = {}) {
  return W({ prefix: "QBCC", ...t });
}
function Ti(t = {}) {
  return W({ prefix: "VBA", ...t });
}
function Ai(t = {}) {
  return W({ prefix: "Gas", classLabel: "Type A", ...t });
}
function Ni(t = {}) {
  return W({ prefix: "Asbestos", classLabel: "Class B", ...t });
}
function Mi(t = {}) {
  return W({ prefix: "ARC RHL", ...t });
}
function Di(t = {}) {
  return W({ prefix: "PSC", classLabel: "Pool Safety", ...t });
}
function Ri(t = {}) {
  return W({ prefix: "T&T", expiryLabel: "next", ...t });
}
function Pi() {
  return dt({
    registered: "green",
    "not-registered": "gray",
    pending: "orange"
  }, { registered: "check-circle", "not-registered": "circle", pending: "clock" });
}
function Ii() {
  return dt({
    active: "green",
    cancelled: "red",
    suspended: "orange",
    pending: "gray"
  }, { active: "check-circle", cancelled: "x-circle", suspended: "alert", pending: "clock" });
}
function Vi(t = {}) {
  return W({ prefix: "HBCF", ...t });
}
function Fi() {
  return dt({
    quoted: "gray",
    scheduled: "blue",
    dispatched: "indigo",
    "on-site": "purple",
    completed: "green",
    invoiced: "orange",
    paid: "green",
    "on-hold": "yellow",
    cancelled: "red",
    "no-show": "red"
  }, {
    quoted: "circle",
    scheduled: "clock",
    dispatched: "truck",
    "on-site": "dot",
    completed: "check-circle",
    invoiced: "cart",
    paid: "check-circle",
    "on-hold": "clock",
    cancelled: "x-circle",
    "no-show": "alert"
  });
}
function Bi({ width: t = 60, height: s = 60 } = {}) {
  const e = { before: "gray", during: "blue", after: "green" };
  return ({ value: n }) => {
    if (L(n)) return "";
    const r = typeof n == "string" ? { url: n } : n;
    if (!r.url) return "";
    const i = u("span", { class: "sg-renderer-job-photo" }), o = u("a", {
      class: "sg-renderer-job-photo-link",
      href: r.url,
      target: "_blank",
      rel: "noopener noreferrer",
      title: r.caption || r.stage || "Open photo"
    });
    if (o.append(u("img", {
      class: "sg-renderer-job-photo-img",
      src: r.url,
      width: t,
      height: s,
      alt: r.caption || r.stage || "Job photo"
    })), r.stage) {
      const a = String(r.stage).toLowerCase(), l = e[a] || "gray";
      o.append(u("span", {
        class: `sg-renderer-job-photo-badge sg-pill sg-pill-${l}`
      }, document.createTextNode(Se(r.stage))));
    }
    return i.append(o), i;
  };
}
function Hi({ width: t = 80, height: s = 32, editable: e = !0 } = {}) {
  return (n) => {
    const { value: r, td: i } = n;
    if (i && (i.classList.add("sg-renderer-signature-cell"), i._sgSignature = r, e && !i._sgSignatureEditBound && (i._sgSignatureEditBound = !0, i.addEventListener("dblclick", (c) => {
      c._sgSignatureHandled || (c._sgSignatureHandled = !0, c.stopPropagation(), oc(i, n));
    }))), L(r)) return u(
      "span",
      { class: "sg-renderer-signature is-empty" },
      document.createTextNode(e ? "dbl-click to sign" : "— unsigned —")
    );
    const o = typeof r == "string" ? { url: r } : r;
    if (!o.url) return "";
    const a = u("span", { class: "sg-renderer-signature" }), l = u("a", {
      class: "sg-renderer-signature-link",
      href: o.url,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Open signature"
    });
    if (l.append(u("img", {
      class: "sg-renderer-signature-img",
      src: o.url,
      width: t,
      height: s,
      alt: o.signedBy ? `Signed by ${o.signedBy}` : "Signature"
    })), a.append(l), o.signedBy || o.signedAt) {
      const c = u("span", { class: "sg-renderer-signature-meta" });
      if (o.signedBy && c.append(u(
        "span",
        { class: "sg-renderer-signature-by" },
        document.createTextNode(String(o.signedBy))
      )), o.signedAt) {
        const d = new Date(o.signedAt), p = Number.isNaN(d.valueOf()) ? String(o.signedAt) : `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
        c.append(u(
          "span",
          { class: "sg-renderer-signature-when" },
          document.createTextNode(p)
        ));
      }
      a.append(c);
    }
    return a;
  };
}
let rt = null;
function le() {
  if (!rt) return;
  const { pop: t, onKey: s, onDocClick: e } = rt;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), rt = null;
}
function oc(t, s) {
  le();
  const e = t._sgSignature, n = e && typeof e == "object", r = n && e.signedBy || "", i = u("div", { class: "sg-signature-editor", role: "dialog" });
  i.addEventListener("mousedown", (I) => I.stopPropagation());
  const o = u(
    "div",
    { class: "sg-signature-editor-header" },
    document.createTextNode("Sign here")
  ), a = 380, l = 140, c = Math.min(window.devicePixelRatio || 1, 2), d = u("canvas", {
    class: "sg-signature-editor-canvas",
    width: a * c,
    height: l * c,
    style: `width:${a}px;height:${l}px;`
  }), p = d.getContext("2d");
  p.scale(c, c), p.lineWidth = 2, p.lineCap = "round", p.lineJoin = "round", p.strokeStyle = "#111827";
  let f = !1, g = 0, h = 0, b = !1;
  function m(I) {
    const B = d.getBoundingClientRect(), F = I.touches ? I.touches[0] : I;
    return [F.clientX - B.left, F.clientY - B.top];
  }
  function _(I) {
    I.preventDefault(), f = !0, [g, h] = m(I);
  }
  function y(I) {
    if (!f) return;
    I.preventDefault();
    const [B, F] = m(I);
    p.beginPath(), p.moveTo(g, h), p.lineTo(B, F), p.stroke(), g = B, h = F, b = !0;
  }
  function w() {
    f = !1;
  }
  d.addEventListener("mousedown", _), d.addEventListener("mousemove", y), window.addEventListener("mouseup", w), d.addEventListener("touchstart", _, { passive: !1 }), d.addEventListener("touchmove", y, { passive: !1 }), d.addEventListener("touchend", w);
  const x = u("label", { class: "sg-signature-editor-by" });
  x.append(u(
    "span",
    { class: "sg-signature-editor-by-label" },
    document.createTextNode("Signed by")
  ));
  const S = u("input", {
    type: "text",
    value: r,
    placeholder: "Customer name",
    class: "sg-signature-editor-by-input"
  });
  x.append(S);
  const N = u("div", { class: "sg-signature-editor-footer" }), T = u(
    "button",
    { type: "button", class: "sg-signature-editor-clear" },
    document.createTextNode("Clear")
  ), k = u(
    "button",
    { type: "button", class: "sg-signature-editor-cancel" },
    document.createTextNode("Cancel")
  ), $ = u(
    "button",
    { type: "button", class: "sg-signature-editor-save" },
    document.createTextNode("Save")
  );
  N.append(T, k, $), i.append(o, d, x, N), T.addEventListener("click", () => {
    p.clearRect(0, 0, a, l), b = !1;
  }), k.addEventListener("click", () => le());
  function M() {
    if (!b) {
      ln(t, s, null), le();
      return;
    }
    const B = ac(d, c).toDataURL("image/png"), F = S.value.trim() || n && e.signedBy || "", q = (typeof e == "string" || e == null) && !F ? B : { url: B, signedBy: F || null, signedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) };
    ln(t, s, q), le();
  }
  $.addEventListener("click", M);
  function D(I) {
    I.key === "Escape" && (I.stopPropagation(), le()), I.key === "Enter" && (I.metaKey || I.ctrlKey) && (I.preventDefault(), M());
  }
  function V(I) {
    !i.contains(I.target) && !t.contains(I.target) && le();
  }
  document.addEventListener("keydown", D), setTimeout(() => document.addEventListener("mousedown", V), 0), document.body.appendChild(i), z(i, t), rt = { pop: i, onKey: D, onDocClick: V };
}
function ac(t, s) {
  const e = t.width, n = t.height, r = t.getContext("2d").getImageData(0, 0, e, n).data;
  let i = e, o = n, a = 0, l = 0;
  for (let g = 0; g < n; g++)
    for (let h = 0; h < e; h++)
      r[(g * e + h) * 4 + 3] > 0 && (h < i && (i = h), h > a && (a = h), g < o && (o = g), g > l && (l = g));
  if (a < i) return t;
  const c = 4 * s;
  i = Math.max(0, i - c), o = Math.max(0, o - c), a = Math.min(e - 1, a + c), l = Math.min(n - 1, l + c);
  const d = a - i + 1, p = l - o + 1, f = document.createElement("canvas");
  return f.width = d, f.height = p, f.getContext("2d").drawImage(t, i, o, d, p, 0, 0, d, p), f;
}
function ln(t, s, e) {
  const { row: n, col: r, api: i } = s, o = n && r?.field != null ? n[r.field] : null;
  n && r?.field != null && (n[r.field] = e), t._sgSignature = e, i?.applyTransaction && i.applyTransaction({ update: [n] });
  const a = t.closest('[data-controller~="grid"]');
  a && a.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
    bubbles: !0,
    detail: { rowId: n?.id ?? n?._sg_id, colId: r?.field, oldValue: o, newValue: e }
  }));
}
function It() {
  const t = { critical: "red", major: "orange", minor: "yellow", cosmetic: "gray" };
  return ({ value: s }) => {
    if (L(s)) return "";
    const e = typeof s == "object" ? s : { title: String(s) }, n = u("span", { class: "sg-renderer-defect" }), r = e.severity ? String(e.severity).toLowerCase() : "minor", i = t[r] || "gray";
    if (n.append(u("span", {
      class: `sg-pill sg-pill-${i} sg-renderer-defect-sev`
    }, document.createTextNode(Se(r)))), e.title && n.append(u(
      "span",
      { class: "sg-renderer-defect-title" },
      document.createTextNode(String(e.title))
    )), e.status) {
      const o = String(e.status).toLowerCase();
      n.append(u(
        "span",
        { class: `sg-renderer-defect-status is-${o}` },
        document.createTextNode(Se(o))
      ));
    }
    return n;
  };
}
function Oi({ currency: t = "AUD", locale: s = "en-AU" } = {}) {
  const e = { approved: "green", pending: "orange", rejected: "red", draft: "gray" };
  return ({ value: n }) => {
    if (L(n)) return "";
    const r = typeof n == "object" ? n : { id: String(n) }, i = u("span", { class: "sg-renderer-variation" });
    if (r.id && i.append(u(
      "span",
      { class: "sg-renderer-variation-id sg-renderer-mono" },
      document.createTextNode(String(r.id))
    )), r.delta != null && Number.isFinite(+r.delta)) {
      const o = +r.delta, a = Math.abs(o).toLocaleString(s, { style: "currency", currency: t }), l = o > 0 ? "+" : o < 0 ? "-" : "";
      i.append(u("span", {
        class: `sg-renderer-variation-delta ${o >= 0 ? "is-up" : "is-down"}`
      }, document.createTextNode(`${l}${a}`)));
    }
    if (r.status) {
      const o = String(r.status).toLowerCase(), a = e[o] || "gray";
      i.append(u("span", {
        class: `sg-pill sg-pill-${a} sg-renderer-variation-status`
      }, document.createTextNode(Se(r.status))));
    }
    return i;
  };
}
function Gi() {
  return ({ value: t }) => {
    if (L(t)) return "";
    const s = typeof t == "object" ? t : { percent: Number(t) }, e = +s.index || null, n = +s.total || null;
    let r = s.percent != null ? Number(s.percent) : null;
    r == null && e && n && (r = e / n * 100), r != null && (r = Math.max(0, Math.min(100, r)));
    const i = u("span", { class: "sg-renderer-progress-claim" });
    if (e && n && i.append(u(
      "span",
      { class: "sg-renderer-progress-claim-step" },
      document.createTextNode(`Claim ${e} of ${n}`)
    )), r != null) {
      const o = u("span", { class: "sg-renderer-progress-claim-bar" });
      o.append(u("span", {
        class: "sg-renderer-progress-claim-bar-fill",
        style: `width: ${r.toFixed(1)}%;`
      })), i.append(o), i.append(u(
        "span",
        { class: "sg-renderer-progress-claim-pct" },
        document.createTextNode(`${Math.round(r)}%`)
      ));
    }
    return i;
  };
}
function ji() {
  return ({ value: t }) => {
    if (L(t)) return "";
    if (typeof t == "string")
      return u(
        "span",
        { class: "sg-renderer-tech-slot sg-pill sg-pill-blue" },
        document.createTextNode(t)
      );
    const s = t.color || "blue", e = u("span", { class: `sg-renderer-tech-slot sg-pill sg-pill-${s}` });
    if (t.start || t.end) {
      const n = [t.start, t.end].filter(Boolean).join("–");
      e.append(u(
        "span",
        { class: "sg-renderer-tech-slot-time" },
        document.createTextNode(n)
      ));
    }
    return t.label && e.append(u(
      "span",
      { class: "sg-renderer-tech-slot-label" },
      document.createTextNode(String(t.label))
    )), e;
  };
}
function zi() {
  const t = { light: "#22c55e", moderate: "#f59e0b", heavy: "#ef4444" };
  return ({ value: s }) => {
    if (L(s)) return "";
    let e = null, n = null, r = null;
    if (typeof s == "number" ? e = s : typeof s == "object" && (e = +s.minutes, n = s.distance, r = s.traffic ? String(s.traffic).toLowerCase() : null), !Number.isFinite(e)) return String(s);
    const i = u("span", { class: "sg-renderer-travel-time" });
    r && t[r] && i.append(u("span", {
      class: "sg-renderer-travel-time-dot",
      title: `${r} traffic`,
      style: `background:${t[r]};`
    }));
    const o = [];
    return o.push(`${e} min`), n && o.push(String(n).includes("km") ? n : `${n} km`), i.append(u(
      "span",
      { class: "sg-renderer-travel-time-text" },
      document.createTextNode(o.join(" · "))
    )), i;
  };
}
function Ui({ maxDots: t = 10 } = {}) {
  return ({ value: s }) => {
    if (L(s)) return "";
    let e = 0, n = 0;
    if (Array.isArray(s) ? (e = +s[0] || 0, n = +s[1] || 0) : typeof s == "object" ? (e = +s.position || 0, n = +s.total || 0) : typeof s == "number" && (e = s), !n || !Number.isFinite(n)) return String(e || "");
    const r = u("span", { class: "sg-renderer-route-stop" }), i = u("span", { class: "sg-renderer-route-stop-dots" }), o = Math.min(n, t);
    for (let a = 1; a <= o; a++)
      i.append(u("span", {
        class: `sg-renderer-route-stop-dot${a <= e ? " is-on" : ""}`
      }));
    return r.append(i), r.append(u(
      "span",
      { class: "sg-renderer-route-stop-label" },
      document.createTextNode(`${e} of ${n}`)
    )), r;
  };
}
function Ki({ now: t = () => /* @__PURE__ */ new Date() } = {}) {
  const s = (r) => {
    let i = r.getHours();
    const o = r.getMinutes(), a = i >= 12 ? "pm" : "am";
    return i = i % 12 || 12, o === 0 ? `${i}${a}` : `${i}:${String(o).padStart(2, "0")}${a}`;
  }, e = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], n = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return ({ value: r }) => {
    if (L(r)) return "";
    let i = null, o = null;
    if (typeof r == "string")
      return u(
        "span",
        { class: "sg-renderer-arrival-window" },
        document.createTextNode(r)
      );
    Array.isArray(r) ? [i, o] = r : typeof r == "object" && (i = r.start, o = r.end);
    const a = i ? new Date(i) : null, l = o ? new Date(o) : null;
    if (!a || Number.isNaN(a.valueOf())) return "";
    const c = t(), d = a.toDateString() === c.toDateString(), p = l && !Number.isNaN(l.valueOf()) ? `${s(a)}–${s(l)}` : s(a), f = d ? "today" : `${e[a.getDay()]} ${a.getDate()} ${n[a.getMonth()]}`;
    let g = "is-future";
    const h = a.getTime(), b = l && !Number.isNaN(l.valueOf()) ? l.getTime() : h + 3600 * 1e3, m = c.getTime();
    m > b + 1800 * 1e3 ? g = "is-late" : m > b ? g = "is-overdue" : m >= h && (g = "is-open");
    const _ = u("span", { class: `sg-renderer-arrival-window ${g}` });
    return _.append(u(
      "span",
      { class: "sg-renderer-arrival-window-time" },
      document.createTextNode(p)
    )), _.append(u(
      "span",
      { class: "sg-renderer-arrival-window-date" },
      document.createTextNode(f)
    )), _;
  };
}
function Wi() {
  return ({ value: t }) => {
    if (L(t)) return "";
    const s = u("span", { class: "sg-renderer-compliance" });
    if (typeof t == "string")
      return s.append(u(
        "span",
        { class: "sg-renderer-compliance-prefix" },
        document.createTextNode("Cert")
      )), s.append(u("span", { class: "sg-renderer-mono" }, document.createTextNode(t))), s;
    t.issuer && s.append(u(
      "span",
      { class: "sg-renderer-compliance-prefix" },
      document.createTextNode(String(t.issuer))
    )), t.class && s.append(u(
      "span",
      { class: "sg-renderer-compliance-class" },
      document.createTextNode(String(t.class))
    )), t.number && s.append(u(
      "span",
      { class: "sg-renderer-mono" },
      document.createTextNode(String(t.number))
    ));
    const e = Pt(t.expires);
    return e && s.append(e), s;
  };
}
v("email", _n());
v("url", xn());
v("phone", Cn());
v("currency", Sn());
v("percent", Ln());
v("progress-bar", tr());
v("star-rating", nr());
v("tags", rr());
v("country-flag", sr());
v("abn", ir());
v("avatar", or());
v("date", kn());
v("datetime", En());
v("relative-time", $n());
v("duration", Tn());
v("number", An());
v("compact-number", Nn());
v("file-size", Mn());
v("boolean", Dn());
v("delta", Rn());
v("truncate", Pn());
v("copyable", Vn());
v("image", Bn());
v("color-swatch", Hn());
v("sparkline", On());
v("heatmap-cell", zn());
v("mask", Un());
v("highlight", Kn());
v("multi-line", Wn());
v("attachments", Zn());
v("address-au", er());
v("checkbox", ar());
v("switch", dr());
v("markdown", ur());
v("json", pr());
v("linked-record", fr());
v("coloured-tags", gr());
v("time", mr());
v("diff", br());
v("geo", yr());
v("qr", wr());
v("code", vr());
v("rating", _r());
v("bullet", xr());
v("donut", Cr());
v("histogram", Sr());
v("rag", Lr());
v("timeline-steps", kr());
v("mention", Er());
v("expand", $r());
v("units", Tr());
v("ip-address", Ar());
v("bsb", Nr());
v("acn", Mr());
v("tfn", Dr());
v("medicare", Rr());
v("audio", Pr());
v("video", Ir());
v("reactions", Vr());
v("comment-count", Fr());
v("ordinal", Br());
v("plural", Hr());
v("empty", Or());
v("credit-card", Gr());
v("loading-shimmer", jr());
v("audio-attachment", cr());
v("select", zr());
v("multiselect", Wr());
v("combobox", qr());
v("slider", yi());
v("date-picker", Yr());
v("time-picker", Jr());
v("date-range", es());
v("color-picker", ns());
v("textarea", rs());
v("action-button", ss());
v("menu", is());
v("split-button", as());
v("row-actions", ls());
v("drag-handle", cs());
v("row-number", ds());
v("expand-toggle", us());
v("avatar-stack", hi());
v("presence", mi());
v("assignee", bi());
v("uuid", ps());
v("git-sha", fs());
v("mac-address", gs());
v("license-key", hs());
v("vin", ms());
v("isbn", bs());
v("iban", ci());
v("swift", di());
v("ssn", ui());
v("ein", pi());
v("vat", fi());
v("nin", gi());
v("postal-code", ii());
v("address-us", oi());
v("address-generic", ai());
v("barcode", li());
v("gauge", ei());
v("win-loss", ti());
v("mini-bar-chart", ni());
v("mini-line-chart", ri());
v("trend", si());
v("countdown", Ys());
v("age", Zs());
v("fiscal-period", Xs());
v("timezone", Js());
v("cron", Qs());
v("spinner", zs());
v("error", Us());
v("sync-status", Ks());
v("stale", Ws());
v("fresh", qs());
v("favicon", Bs());
v("domain", Hs());
v("social-link", Os());
v("tracking-number", Gs());
v("video-link", js());
v("file", Rs());
v("download-link", Ps());
v("mime-icon", Is());
v("gallery", Vs());
v("waveform", Fs());
v("html", ys());
v("yaml", ws());
v("xml", vs());
v("autolink", _s());
v("redacted", xs());
v("spoiler", Cs());
v("fraction", Ls());
v("scientific", ks());
v("hex", pt({ base: 16 }));
v("binary", pt({ base: 2 }));
v("octal", pt({ base: 8 }));
v("percentile", Es());
v("battery", $s());
v("signal-bars", Ts());
v("volume", As());
v("trade-licence", vi());
v("white-card", xi());
v("blue-card", Ci());
v("wwcc", Si());
v("high-risk-licence", Li());
v("coes", ki());
v("coc", Ei());
v("qbcc-licence", $i());
v("vba-licence", Ti());
v("gas-certificate", Ai());
v("asbestos-licence", Ni());
v("refrigerant-licence", Mi());
v("pool-safety-cert", Di());
v("test-and-tag", Ri());
v("insurance-cert", Wi());
v("gst-status", Pi());
v("abn-status", Ii());
v("hbcf-cert", Vi());
v("job-status", Fi());
v("arrival-window", Ki());
v("route-stop", Ui());
v("travel-time", zi());
v("technician-slot", ji());
v("progress-claim", Gi());
v("variation", Oi());
v("defect", It());
v("snag", It());
v("signature", Hi());
v("job-photo", Bi());
const A = {
  // Plain text. The 99% case.
  text: {
    copy: ({ value: t }) => t == null ? "" : String(t),
    parse: (t) => String(t ?? "")
  },
  // Numeric — strips currency / percent / commas before Number().
  number: {
    copy: ({ value: t }) => t == null || t === "" ? "" : String(t),
    parse: lt
  },
  // Boolean — true / false / yes / no / 1 / 0 / on / off / ✓ / ✗.
  boolean: {
    copy: ({ value: t }) => t === !0 ? "true" : t === !1 ? "false" : t == null ? "" : String(t),
    parse: Ho
  },
  // ISO date (YYYY-MM-DD). Date objects normalise to ISO on copy;
  // already-string values round-trip as supplied so existing
  // "2026-05-25" strings come back exactly as they went out.
  date: {
    copy: ({ value: t }) => {
      if (t == null || t === "") return "";
      if (t instanceof Date && !Number.isNaN(t.valueOf())) {
        const s = t.getFullYear(), e = String(t.getMonth() + 1).padStart(2, "0"), n = String(t.getDate()).padStart(2, "0");
        return `${s}-${e}-${n}`;
      }
      return String(t);
    },
    parse: (t) => {
      const s = String(t ?? "");
      if (s === "") return "";
      const e = new Date(s);
      return Number.isNaN(e.valueOf()) ? void 0 : s;
    }
  },
  // ISO datetime (full ISO 8601).
  datetime: {
    copy: ({ value: t }) => t == null || t === "" ? "" : t instanceof Date && !Number.isNaN(t.valueOf()) ? t.toISOString() : String(t),
    parse: (t) => {
      const s = String(t ?? "");
      if (s === "") return "";
      const e = new Date(s);
      return Number.isNaN(e.valueOf()) ? void 0 : s;
    }
  },
  // Comma-separated strings. Preserves array-ness if the original was
  // an array (the renderer's display call has its own normalisation).
  stringList: {
    copy: ({ value: t }) => Array.isArray(t) ? t.join(", ") : L(t) ? "" : String(t),
    parse: (t) => {
      const s = String(t ?? "").trim();
      return s === "" ? [] : s.split(/\s*,\s*/).filter(Boolean);
    }
  },
  // Comma-separated numbers (sparkline / histogram).
  numberList: {
    copy: ({ value: t }) => Array.isArray(t) ? t.join(", ") : "",
    parse: (t) => {
      const s = String(t ?? "").trim();
      if (s === "") return [];
      const e = s.split(/\s*,\s*/).filter(Boolean).map(Number);
      return e.some((n) => !Number.isFinite(n)) ? void 0 : e;
    }
  },
  // JSON for object / array values. Non-JSON text passes through as a
  // string — the renderer may still know what to do with it.
  json: {
    copy: ({ value: t }) => {
      if (t == null || t === "") return "";
      if (typeof t == "string") return t;
      try {
        return JSON.stringify(t);
      } catch {
        return String(t);
      }
    },
    parse: (t) => {
      const s = String(t ?? "").trim();
      if (s === "") return "";
      try {
        return JSON.parse(s);
      } catch {
        return;
      }
    }
  },
  // Strip non-digit chars on parse; pass the raw value through on copy
  // (renderer formats it). Used by abn / acn / bsb / medicare /
  // credit-card / phone — anything where the persisted form is digits.
  digits: {
    copy: ({ value: t }) => t == null ? "" : String(t).trim(),
    parse: (t) => {
      const s = String(t ?? "");
      return s === "" ? "" : s.replace(/\D/g, "") || s;
    }
  }
};
function E(t, s) {
  const e = xe(t);
  e && Vo(e, s);
}
E("email", { copy: A.text.copy, parse: (t) => String(t ?? "").trim() });
E("url", { copy: A.text.copy, parse: (t) => String(t ?? "").trim() });
E("phone", A.digits);
E("currency", A.number);
E("percent", {
  copy: A.number.copy,
  parse: (t) => lt(String(t ?? "").replace(/%$/, ""))
});
E("progress-bar", A.number);
E("star-rating", A.number);
E("tags", A.stringList);
E("country-flag", {
  copy: ({ value: t }) => t == null ? "" : String(t).trim().toUpperCase(),
  parse: (t) => {
    const s = String(t ?? "").trim().toUpperCase();
    return /^[A-Z]{2}$/.test(s) ? s : void 0;
  }
});
E("abn", A.digits);
E("avatar", A.text);
E("date", A.date);
E("datetime", A.datetime);
E("relative-time", A.datetime);
E("duration", {
  copy: A.number.copy,
  // Accept either a bare number ("125000") OR a human form ("2h 5m" /
  // "02:05:00"). The parsed value is in milliseconds — most columns
  // already use that; the renderer's `unit` option converts on display.
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return "";
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    const e = /^(\d+):(\d+)(?::(\d+))?$/.exec(s);
    if (e) {
      const a = +e[1], l = +e[2], c = e[3] ? +e[3] : 0;
      return (e[3] ? a * 3600 + l * 60 + c : a * 60 + l) * 1e3;
    }
    let n = 0, r = !1;
    const i = /(-?\d+(?:\.\d+)?)\s*(ms|milliseconds?|s|sec|seconds?|m|min|minutes?|h|hr|hours?|d|days?)\b/gi;
    let o;
    for (; (o = i.exec(s)) !== null; ) {
      const a = Number(o[1]), l = o[2].toLowerCase();
      l.startsWith("ms") || l.startsWith("milli") ? n += a : l === "s" || l.startsWith("sec") ? n += a * 1e3 : l === "m" || l.startsWith("min") ? n += a * 6e4 : l.startsWith("h") ? n += a * 36e5 : l.startsWith("d") && (n += a * 864e5), r = !0;
    }
    return r ? n : void 0;
  }
});
E("number", A.number);
E("compact-number", {
  copy: A.number.copy,
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return "";
    const e = /^(-?\d+(?:\.\d+)?)\s*([kmbt])$/i.exec(s);
    if (e) {
      const n = Number(e[1]), r = e[2].toLowerCase(), i = r === "k" ? 1e3 : r === "m" ? 1e6 : r === "b" ? 1e9 : 1e12;
      return Number.isFinite(n) ? n * i : void 0;
    }
    return lt(s);
  }
});
E("file-size", {
  copy: A.number.copy,
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return "";
    const e = /^(-?\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb|pb|kib|mib|gib|tib|pib)?$/i.exec(s);
    if (!e) return lt(s);
    const n = Number(e[1]);
    if (!Number.isFinite(n)) return;
    const r = (e[2] || "b").toLowerCase(), i = r.endsWith("ib") ? 1024 : 1e3, o = r.endsWith("ib") ? r.slice(0, -2) + "b" : r, a = { b: 1, kb: i, mb: i ** 2, gb: i ** 3, tb: i ** 4, pb: i ** 5 };
    return n * (a[o] ?? 1);
  }
});
E("boolean", A.boolean);
E("delta", A.number);
E("truncate", A.text);
E("copyable", A.text);
E("image", { copy: A.text.copy, parse: (t) => String(t ?? "").trim() });
E("color-swatch", { copy: A.text.copy, parse: (t) => String(t ?? "").trim() });
E("sparkline", A.numberList);
E("heatmap-cell", A.number);
E("mask", A.text);
E("highlight", A.text);
E("multi-line", A.text);
E("attachments", {
  copy: A.json.copy,
  parse: (t) => {
    const s = A.json.parse(t);
    if (s !== void 0)
      return s === "" || s == null ? [] : Array.isArray(s) ? s : void 0;
  }
});
E("address-au", {
  copy: ({ value: t }) => {
    if (t == null || t === "") return "";
    if (typeof t == "string") return t;
    if (typeof t != "object") return String(t);
    try {
      return JSON.stringify(t);
    } catch {
      return String(t);
    }
  },
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return null;
    if (s.startsWith("{"))
      try {
        return JSON.parse(s);
      } catch {
      }
    return s;
  }
});
E("checkbox", A.boolean);
E("switch", A.boolean);
E("markdown", A.text);
E("json", A.json);
E("linked-record", {
  copy: ({ value: t }) => t == null || t === "" ? "" : Array.isArray(t) ? t.join(", ") : String(t),
  parse: (t) => {
    const s = String(t ?? "");
    return s === "" ? "" : s.includes(",") ? s.split(/\s*,\s*/).filter(Boolean) : s;
  }
});
E("coloured-tags", A.stringList);
E("time", {
  copy: ({ value: t }) => t == null ? "" : String(t).trim(),
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return "";
    const e = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)$/i.exec(s);
    if (e) {
      let n = parseInt(e[1], 10);
      const r = e[2], i = e[3];
      return e[4].toLowerCase() === "pm" && n < 12 && (n += 12), e[4].toLowerCase() === "am" && n === 12 && (n = 0), `${String(n).padStart(2, "0")}:${r}${i ? ":" + i : ""}`;
    }
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) return s;
    if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
  }
});
E("diff", {
  copy: ({ value: t }) => {
    if (t == null || t === "") return "";
    if (typeof t == "string") return t;
    if (Array.isArray(t)) return `${t[0] ?? ""} → ${t[1] ?? ""}`;
    const s = t.from ?? t.old ?? t.before ?? t.previous ?? null, e = t.to ?? t.new ?? t.after ?? t.current ?? null;
    return s == null && e == null ? "" : `${s ?? ""} → ${e ?? ""}`;
  },
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return null;
    const e = /^(.*?)\s*(?:→|->|=>|—>)\s*(.+)$/.exec(s);
    return e ? { from: e[1].trim(), to: e[2].trim() } : { from: null, to: s };
  }
});
E("geo", {
  copy: ({ value: t }) => {
    if (t == null || t === "") return "";
    if (Array.isArray(t)) return `${t[0]}, ${t[1]}`;
    if (typeof t == "object") {
      const s = t.lat ?? t.latitude, e = t.lng ?? t.long ?? t.lon ?? t.longitude;
      return `${s}, ${e}`;
    }
    return String(t);
  },
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return null;
    const e = s.split(/\s*,\s*/);
    if (e.length !== 2) return;
    const n = Number(e[0]), r = Number(e[1]);
    if (!(!Number.isFinite(n) || !Number.isFinite(r)))
      return { lat: n, lng: r };
  }
});
E("qr", A.text);
E("code", A.text);
E("rating", A.number);
E("bullet", A.number);
E("donut", A.number);
E("histogram", A.numberList);
E("rag", {
  // RAG_TOKENS lookup keeps "high" / "low" / "critical" / "ok" /
  // "passive" / "detractor" all parseable to the three canonical bands.
  copy: ({ value: t }) => t == null ? "" : String(t).trim().toLowerCase(),
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return "";
    const e = s.toLowerCase();
    if (St[e]) return St[e];
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  }
});
E("timeline-steps", A.text);
E("mention", A.text);
E("expand", A.text);
E("units", A.number);
E("ip-address", { copy: A.text.copy, parse: (t) => String(t ?? "").trim() });
E("bsb", A.digits);
E("acn", A.digits);
E("tfn", A.digits);
E("medicare", A.digits);
E("audio", { copy: A.text.copy, parse: (t) => String(t ?? "").trim() });
E("video", { copy: A.text.copy, parse: (t) => String(t ?? "").trim() });
E("reactions", A.json);
E("comment-count", {
  copy: ({ value: t }) => {
    if (t == null || t === "") return "";
    if (typeof t == "object") {
      const s = t.value ?? t.text ?? "", e = t.count ?? t.comments ?? null;
      return e != null && s ? `${s} (${e})` : e != null ? String(e) : String(s);
    }
    return String(t);
  },
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return "";
    const e = /^(.*?)\s*\((\d+)\)$/.exec(s);
    return e ? { value: e[1].trim(), count: Number(e[2]) } : /^\d+$/.test(s) ? Number(s) : s;
  }
});
E("ordinal", {
  copy: A.number.copy,
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return "";
    const e = /^(-?\d+)(?:st|nd|rd|th)?$/i.exec(s);
    return e ? Number(e[1]) : void 0;
  }
});
E("plural", A.number);
E("empty", A.text);
E("credit-card", A.digits);
E("loading-shimmer", A.text);
E("audio-attachment", {
  copy: ({ value: t }) => t == null || t === "" ? "" : typeof t == "string" ? t : typeof t == "object" ? t.url || JSON.stringify(t) : String(t),
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return null;
    if (s.startsWith("{"))
      try {
        return JSON.parse(s);
      } catch {
      }
    return s;
  }
});
E("select", {
  copy: ({ value: t }) => t == null || t === "" ? "" : String(t),
  parse: (t, s) => {
    const e = String(t ?? "");
    if (e === "") return null;
    const n = s?.col?.cellRendererConfig?.options || s?.col?.enumValues || [];
    if (!Array.isArray(n) || n.length === 0) return e;
    const r = (o) => String(o).trim().toLowerCase(), i = r(e);
    for (const o of n) {
      const a = typeof o == "object" ? o.value : o, l = typeof o == "object" ? o.label ?? a : o;
      if (r(a) === i || r(l) === i) return a;
    }
  }
});
E("multiselect", {
  copy: ({ value: t }) => Array.isArray(t) ? t.join(", ") : L(t) ? "" : String(t),
  parse: (t, s) => {
    const e = String(t ?? "").trim();
    if (e === "") return [];
    const n = e.split(/\s*,\s*/).filter(Boolean), r = s?.col?.cellRendererConfig?.options || s?.col?.enumValues || [];
    if (!Array.isArray(r) || r.length === 0) return n;
    const i = (a) => String(a).trim().toLowerCase(), o = [];
    for (const a of n) {
      const l = i(a), c = r.find((d) => {
        const p = typeof d == "object" ? d.value : d, f = typeof d == "object" ? d.label ?? p : d;
        return i(p) === l || i(f) === l;
      });
      if (!c) return;
      o.push(typeof c == "object" ? c.value : c);
    }
    return o;
  }
});
E("combobox", {
  copy: ({ value: t }) => t == null || t === "" ? "" : String(t),
  parse: (t, s) => {
    const e = String(t ?? "");
    if (e === "") return null;
    const n = s?.col?.cellRendererConfig?.options || s?.col?.enumValues || [], r = !!s?.col?.cellRendererConfig?.allowCustom;
    if (Array.isArray(n) && n.length > 0) {
      const i = (a) => String(a).trim().toLowerCase(), o = i(e);
      for (const a of n) {
        const l = typeof a == "object" ? a.value : a, c = typeof a == "object" ? a.label ?? l : a;
        if (i(l) === o || i(c) === o) return l;
      }
      return r ? e : void 0;
    }
    return e;
  }
});
E("slider", A.number);
E("date-picker", A.date);
E("time-picker", {
  // The picker commits HH:MM (24-hour) regardless of display style, so
  // clipboard round-trips do the same.
  copy: ({ value: t }) => t == null ? "" : String(t),
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return "";
    const e = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(s);
    if (e) {
      let n = parseInt(e[1], 10);
      return e[3].toLowerCase() === "pm" && n < 12 && (n += 12), e[3].toLowerCase() === "am" && n === 12 && (n = 0), `${String(n).padStart(2, "0")}:${e[2]}`;
    }
    if (/^\d{1,2}:\d{2}$/.test(s)) {
      const [n, r] = s.split(":");
      return `${n.padStart(2, "0")}:${r}`;
    }
  }
});
E("date-range", {
  copy: ({ value: t }) => {
    if (t == null || t === "") return "";
    let s, e;
    if (Array.isArray(t)) [s, e] = t;
    else if (typeof t == "object")
      s = t.start || t.from, e = t.end || t.to;
    else return String(t);
    const n = (r) => {
      if (!r) return "";
      const i = r instanceof Date ? r : new Date(r);
      if (Number.isNaN(i.valueOf())) return String(r);
      const o = i.getFullYear(), a = String(i.getMonth() + 1).padStart(2, "0"), l = String(i.getDate()).padStart(2, "0");
      return `${o}-${a}-${l}`;
    };
    return `${n(s)}/${n(e)}`;
  },
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return null;
    const e = s.split(/\s*\/\s*|\s*[–]\s*|\s+-\s+/);
    if (e.length < 2) return;
    const [n, r] = e, i = (o) => o === "" || !Number.isNaN(new Date(o).valueOf());
    if (!(!i(n) || !i(r)))
      return [n, r];
  }
});
E("color-picker", { copy: A.text.copy, parse: (t) => String(t ?? "").trim() });
E("textarea", A.text);
E("action-button", A.text);
E("menu", A.text);
E("split-button", A.text);
E("row-actions", A.text);
E("trade-licence", A.json);
E("white-card", A.json);
E("blue-card", A.json);
E("wwcc", A.json);
E("high-risk-licence", A.json);
E("coes", A.json);
E("coc", A.json);
E("qbcc-licence", A.json);
E("vba-licence", A.json);
E("gas-certificate", A.json);
E("asbestos-licence", A.json);
E("refrigerant-licence", A.json);
E("pool-safety-cert", A.json);
E("test-and-tag", A.json);
E("insurance-cert", A.json);
E("gst-status", A.text);
E("abn-status", A.text);
E("hbcf-cert", A.json);
E("job-status", A.text);
E("arrival-window", A.json);
E("route-stop", A.json);
E("travel-time", A.json);
E("technician-slot", A.json);
E("progress-claim", A.json);
E("variation", A.json);
E("defect", A.json);
E("snag", A.json);
E("signature", A.json);
E("job-photo", A.json);
const lc = {
  email: _n,
  url: xn,
  phone: Cn,
  currency: Sn,
  percent: Ln,
  progressBar: tr,
  starRating: nr,
  tags: rr,
  countryFlag: sr,
  abn: ir,
  avatar: or,
  statusPill: dt,
  date: kn,
  datetime: En,
  relativeTime: $n,
  duration: Tn,
  number: An,
  compactNumber: Nn,
  fileSize: Mn,
  boolean: Dn,
  delta: Rn,
  truncate: Pn,
  copyable: Vn,
  image: Bn,
  colorSwatch: Hn,
  sparkline: On,
  heatmap: zn,
  mask: Un,
  highlight: Kn,
  multiLine: Wn,
  attachments: Zn,
  addressAu: er,
  checkbox: ar,
  switch: dr,
  markdown: ur,
  json: pr,
  linkedRecord: fr,
  colouredTags: gr,
  time: mr,
  diff: br,
  geo: yr,
  qr: wr,
  code: vr,
  rating: _r,
  bullet: xr,
  donut: Cr,
  histogram: Sr,
  rag: Lr,
  timelineSteps: kr,
  mention: Er,
  expand: $r,
  units: Tr,
  ipAddress: Ar,
  bsb: Nr,
  acn: Mr,
  tfn: Dr,
  medicare: Rr,
  audio: Pr,
  video: Ir,
  reactions: Vr,
  commentCount: Fr,
  ordinal: Br,
  plural: Hr,
  empty: Or,
  creditCard: Gr,
  loadingShimmer: jr,
  audioAttachment: cr,
  select: zr,
  multiselect: Wr,
  combobox: qr,
  slider: yi,
  datePicker: Yr,
  timePicker: Jr,
  dateRange: es,
  colorPicker: ns,
  textarea: rs,
  actionButton: ss,
  menu: is,
  splitButton: as,
  rowActions: ls,
  dragHandle: cs,
  rowNumber: ds,
  expandToggle: us,
  avatarStack: hi,
  presence: mi,
  assignee: bi,
  uuid: ps,
  gitSha: fs,
  macAddress: gs,
  licenseKey: hs,
  vin: ms,
  isbn: bs,
  iban: ci,
  swift: di,
  ssn: ui,
  ein: pi,
  vat: fi,
  nin: gi,
  postalCode: ii,
  addressUs: oi,
  addressGeneric: ai,
  barcode: li,
  gauge: ei,
  winLoss: ti,
  miniBarChart: ni,
  miniLineChart: ri,
  trend: si,
  countdown: Ys,
  age: Zs,
  fiscalPeriod: Xs,
  timezone: Js,
  cron: Qs,
  spinner: zs,
  errorCell: Us,
  syncStatus: Ks,
  staleCell: Ws,
  freshCell: qs,
  favicon: Bs,
  domain: Hs,
  socialLink: Os,
  trackingNumber: Gs,
  videoLink: js,
  file: Rs,
  downloadLink: Ps,
  mimeIcon: Is,
  gallery: Vs,
  waveform: Fs,
  html: ys,
  yaml: ws,
  xml: vs,
  autolink: _s,
  redacted: xs,
  spoiler: Cs,
  fraction: Ls,
  scientific: ks,
  radix: pt,
  percentile: Es,
  battery: $s,
  signalBars: Ts,
  volumeIndicator: As,
  tradeLicence: vi,
  whiteCard: xi,
  blueCard: Ci,
  wwcc: Si,
  highRiskLicence: Li,
  coes: ki,
  coc: Ei,
  qbccLicence: $i,
  vbaLicence: Ti,
  gasCertificate: Ai,
  asbestosLicence: Ni,
  refrigerantLicence: Mi,
  poolSafetyCert: Di,
  testAndTag: Ri,
  insuranceCert: Wi,
  gstStatus: Pi,
  abnStatus: Ii,
  hbcfCert: Vi,
  jobStatus: Fi,
  arrivalWindow: Ki,
  routeStop: Ui,
  travelTime: zi,
  technicianSlot: ji,
  progressClaim: Gi,
  variation: Oi,
  defect: It,
  signature: Hi,
  jobPhoto: Bi
}, cc = 32, cn = 100, Ie = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', dc = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>', uc = /* @__PURE__ */ new Set([
  "number",
  "currency",
  "percent",
  "compactNumber",
  "fileSize",
  "duration",
  // The kebab-case names too, since data-header-cell-cell-renderer-value
  // uses the registry key (kebab) and not the camelCase export name.
  "compact-number",
  "file-size",
  "credit-card"
]), pc = /* @__PURE__ */ new Set([
  "color",
  "date",
  "datetime-local",
  "time",
  "month",
  "week"
]);
function fc(t) {
  const s = String(t ?? "");
  return s === "" ? "" : /[\t\n\r"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function gc(t) {
  const s = [];
  let e = [], n = "", r = !1;
  for (let i = 0; i < t.length; i++) {
    const o = t[i];
    if (r) {
      if (o === '"') {
        if (t[i + 1] === '"') {
          n += '"', i++;
          continue;
        }
        r = !1;
        continue;
      }
      n += o;
    } else {
      if (o === '"' && n === "") {
        r = !0;
        continue;
      }
      if (o === "	") {
        e.push(n), n = "";
        continue;
      }
      if (o === "\r")
        continue;
      if (o === `
`) {
        e.push(n), s.push(e), e = [], n = "";
        continue;
      }
      n += o;
    }
  }
  return (n !== "" || e.length > 0) && (e.push(n), s.push(e)), s;
}
const dn = [
  "grid:columnMoved",
  "grid:columnPinned",
  "grid:columnResized",
  "grid:columnVisible",
  "grid:columnRowGroupChanged",
  "grid:columnPivotChanged",
  "grid:pivotModeChanged",
  "grid:columnValueChanged",
  "grid:columnGroupsChanged",
  "grid:sortChanged",
  "grid:filterChanged"
];
class Vt extends ie {
  constructor() {
    super(...arguments);
    H(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    // ----- Row grouping + aggregation -----
    // A group is expanded if it has an explicit override; otherwise the
    // default-by-level applies (-1 = all, 0 = none, N = first N levels).
    H(this, "_isGroupExpanded", (e, n) => {
      if (this._groupExpanded.has(e)) return this._groupExpanded.get(e);
      const r = this.state.group.defaultExpanded;
      return r < 0 ? !0 : n < r;
    });
    // Delegated click handler for synthetic <th>s that don't have a
    // HeaderCellController of their own (pivot result cols today). Mirrors the
    // user-defined header path: bare click toggles sort, shift-click appends to
    // a multi-sort. Resize handles / filter icons short-circuit.
    H(this, "_onSynthHeaderClick", (e) => {
      const n = e.target.closest('th[data-synth="true"][data-sortable="true"]');
      if (!n || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const r = n.getAttribute("data-field");
      r && this.toggleSort(r, e.shiftKey === !0);
    });
    // ----- Right-click column menu -----
    //
    // contextmenu on a leaf <th> opens a fixed-positioned popup with quick
    // actions for that column: pin/unpin (left|right), autosize, group/pivot
    // toggles, aggregate selector, and hide. Synthetic columns (gutter,
    // checkbox, auto-Group, pivot result) suppress the menu — they're owned by
    // the grid and shouldn't be poked through this surface.
    H(this, "_onHeaderContextMenu", (e) => {
      const n = e.target.closest("th[data-field], th[data-header-cell-field-value]");
      if (!n) return;
      const r = n.getAttribute("data-field") || n.getAttribute("data-header-cell-field-value"), i = this._colByField(r);
      !i || i._isCheckbox || i._isRowNumber || i._isGroupCol || i._isPivot || i._isSpacer || (e.preventDefault(), this._showColumnMenu(i, e.clientX, e.clientY));
    });
    H(this, "_onDocMouseDownColumnMenu", (e) => {
      this._columnMenu && !this._columnMenu.contains(e.target) && this._closeColumnMenu();
    });
    H(this, "_onColumnMenuKey", (e) => {
      e.key === "Escape" && (e.stopPropagation(), this._closeColumnMenu());
    });
    H(this, "_onCellDragEnter", (e) => {
      if (!this._isFileDrag(e)) return;
      const n = this._dropTarget(e.target);
      n && (e.preventDefault(), this._dropHotCell && this._dropHotCell !== n.td && this._dropHotCell.classList.remove("sg-drop-target"), n.td.classList.add("sg-drop-target"), this._dropHotCell = n.td);
    });
    H(this, "_onCellDragOver", (e) => {
      if (!this._isFileDrag(e)) return;
      const n = this._dropTarget(e.target);
      n && (e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "copy"), this._dropHotCell !== n.td && (this._dropHotCell?.classList.remove("sg-drop-target"), n.td.classList.add("sg-drop-target"), this._dropHotCell = n.td));
    });
    H(this, "_onCellDragLeave", (e) => {
      this._dropHotCell && !this._dropHotCell.contains(e.relatedTarget) && (this._dropHotCell.classList.remove("sg-drop-target"), this._dropHotCell = null);
    });
    H(this, "_onCellDrop", (e) => {
      if (!this._isFileDrag(e)) return;
      const n = this._dropTarget(e.target);
      if (!n) return;
      e.preventDefault(), this._dropHotCell?.classList.remove("sg-drop-target"), this._dropHotCell = null;
      const r = Array.from(e.dataTransfer?.files || []);
      if (!r.length) return;
      const i = this.state.rowData.find((p) => this._rowId(p) === n.rowId), o = { rowId: n.rowId, colId: n.colId, files: r, row: i, dataTransfer: e.dataTransfer }, a = new CustomEvent("grid:fileAttached", { detail: o, bubbles: !0, cancelable: !0 });
      if (!this.element.dispatchEvent(a) || !i) return;
      const c = this.attachmentsFieldValue || n.colId, d = Array.isArray(i[c]) ? i[c].slice() : [];
      for (const p of r) {
        let f = "";
        try {
          f = URL.createObjectURL(p);
        } catch {
        }
        d.push({
          id: `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
          filename: p.name,
          name: p.name,
          byte_size: p.size,
          size: p.size,
          content_type: p.type || "application/octet-stream",
          url: f,
          thumb_url: p.type?.startsWith("image/") ? f : null,
          preview_url: p.type?.startsWith("image/") ? f : null
        });
      }
      i[c] = d, this.scheduleRender("cells"), P(this.element, "grid:cellValueChanged", {
        rowId: n.rowId,
        colId: c,
        oldValue: null,
        newValue: d
      });
    });
    H(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
    });
    H(this, "_onCellMouseDown", (e) => {
      if (e.button !== 0) return;
      if (this.rowDragValue) {
        const i = e.target.closest?.('td[data-gutter="true"]');
        if (i) {
          const o = i.closest("tr");
          this._rowDragPending = { rowId: this._coerceRowId(o.dataset.rowId), x: e.clientX, y: e.clientY }, this._rowDragMoved = !1, document.addEventListener("mousemove", this._onRowDragMove);
          return;
        }
      }
      if (e.target.closest?.('[data-tree-toggle="true"]')) return;
      const n = this._cellAt(e.target);
      if (!n) return;
      const r = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(n) : r ? (this._addCellRange(n), this._cellDragging = !0) : (this._setSingleCellSel(n), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), P(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    H(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const n = this._cellAt(e.target);
      if (!n) return;
      const r = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      r && r.focus.rowId === n.rowId && r.focus.colId === n.colId || (this._extendActiveRange(n), this._cellDragMoved = !0, this._applyCellSelHighlight(), P(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
    });
    H(this, "_onCellMouseUp", () => {
      this._cellDragging = !1, this._rowDragPending && (document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag && this._finishRowDrag(), this._rowDragPending = null);
    });
    // ----- Row drag-and-drop (reorder) with a ghost preview -----
    H(this, "_onRowDragMove", (e) => {
      const n = this._rowDragPending;
      if (n) {
        if (!this._rowDrag) {
          if (Math.abs(e.clientY - n.y) < 5 && Math.abs(e.clientX - n.x) < 5) return;
          this._startRowDrag(n.rowId);
        }
        this._rowDrag && (this._rowDragMoved = !0, this._rowDrag.ghost.style.left = `${e.clientX + 14}px`, this._rowDrag.ghost.style.top = `${e.clientY + 10}px`, this._updateDropIndicator(e.clientY));
      }
    });
    // Copy the active cell range to the clipboard. For a single-cell copy we
    // put the raw value on the clipboard so a multi-line markdown / note cell
    // pastes verbatim into a text editor, email, chat, etc. For multi-cell
    // ranges we TSV-escape (quote + double up embedded quotes) so the value
    // still round-trips into Excel / Sheets / Numbers without rows splitting.
    H(this, "_onCopy", (e) => {
      if (this.state.editing) return;
      const n = document.activeElement;
      if (n && /^(input|textarea|select)$/i.test(n.tagName) && !this.element.contains(n)) return;
      const r = this._activeRect();
      if (!r) return;
      const i = this._cellRangeRows(r);
      if (!i.length) return;
      const a = i.length === 1 && i[0].length === 1 ? String(i[0][0] ?? "") : i.map((l) => l.map((c) => fc(c)).join("	")).join(`
`);
      a !== "" && (e.clipboardData?.setData("text/plain", a), e.preventDefault());
    });
    // Paste clipboard TSV starting at the active cell. Each cell goes through
    // the column's renderer.parseValue (or defaultParseValue for unrendered
    // columns); cells the renderer rejects (returns `undefined`) are skipped
    // and reported via `grid:pasteRejected`. Editable columns only — pastes
    // onto non-editable cells (gutters, checkbox columns, computed columns)
    // are reported as `not-editable` rejections but never silently mutate.
    //
    // Single-value pastes tile across the whole selection (Sheets convention),
    // so "Cmd+C a single price → Cmd+V on a 5-row selection" fills five rows.
    H(this, "_onPaste", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const n = document.activeElement;
      if (n && /^(input|textarea|select)$/i.test(n.tagName) && !this.element.contains(n)) return;
      const r = this._activeRect();
      if (!r) return;
      const i = e.clipboardData?.getData("text/plain");
      if (i == null || i === "") return;
      e.preventDefault();
      const o = gc(i);
      if (!o.length || (o.length > 1 && o[o.length - 1].length === 1 && o[o.length - 1][0] === "" && o.pop(), !o.length)) return;
      const a = o.length === 1 && o[0].length === 1, l = a ? r.r1 - r.r0 + 1 : o.length, c = a ? r.c1 - r.c0 + 1 : o[0].length, d = r.rows, p = r.cols, f = [];
      let g = !1;
      for (let h = 0; h < l; h++) {
        const b = r.r0 + h;
        if (b >= d.length) break;
        const m = d[b];
        if (!m || m.__sgGroup || m.__sgDetail || m.__sgSeparator) continue;
        const _ = a ? o[0] : o[h];
        for (let y = 0; y < c; y++) {
          const w = r.c0 + y;
          if (w >= p.length) break;
          const x = p[w];
          if (!x) continue;
          if (!x.editable || x._isCheckbox || x._isRowNumber || x._isGroupCol || x._isMasterExpand || x._isSpacer) {
            f.push({ rowId: this._rowId(m), colId: x.field || "", reason: "not-editable" });
            continue;
          }
          const S = a ? _[0] : _[y] ?? "", N = this._parsePasteValue(S, m, x);
          if (N === void 0) {
            f.push({ rowId: this._rowId(m), colId: x.field, reason: "parse-failed", text: S });
            continue;
          }
          const T = m[x.field];
          N !== T && (m[x.field] = N, g = !0, P(this.element, "grid:cellValueChanged", {
            rowId: this._rowId(m),
            colId: x.field,
            oldValue: T,
            newValue: N,
            source: "paste"
          }));
        }
      }
      g && this.scheduleRender("cells"), (f.length || g) && P(this.element, "grid:pasteApplied", { appliedCount: g ? 1 : 0, rejectedCount: f.length }), f.length && P(this.element, "grid:pasteRejected", { rejected: f });
    });
    H(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const n = document.activeElement;
      if (n && /^(input|textarea|select)$/i.test(n.tagName) && this.element.contains(n)) return;
      const r = e.key, i = e.metaKey || e.ctrlKey;
      if (i && r.toLowerCase() === "a") {
        e.preventDefault(), this.rowSelectionValue !== "" ? (this.clearCellSelection(), this.deselectAll(), this.selectAll()) : this._selectAllCells();
        return;
      }
      if (i) return;
      const o = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (o[r]) {
        e.preventDefault();
        const [a, l] = o[r];
        this._moveActiveCell(a, l, e.shiftKey);
        return;
      }
      if (r === "Tab") {
        e.preventDefault(), this._moveActiveCell(0, e.shiftKey ? -1 : 1, !1);
        return;
      }
      if (r === "Enter") {
        const a = this._activeCell();
        a && (e.preventDefault(), this.startEditingCell(a.rowId, a.colId));
        return;
      }
      if (r === "Escape") {
        this.clearCellSelection();
        return;
      }
      if (r === "Delete" || r === "Backspace") {
        this._clearSelectedCells() && e.preventDefault();
        return;
      }
      if (r.length === 1 && !e.altKey) {
        const a = this._activeCell();
        if (!a) return;
        const l = this._colByField(a.colId);
        if (!l || !l.editable) return;
        e.preventDefault(), this.startEditingCell(a.rowId, a.colId, r);
      }
    });
    H(this, "_onEditorKey", (e) => {
      this.state.editing && (e.key === "Enter" ? (e.preventDefault(), this.stopEditing(!1)) : e.key === "Escape" ? (e.preventDefault(), this.stopEditing(!0)) : e.key === "Tab" && (e.preventDefault(), this._tabToEditableCell(e.shiftKey ? -1 : 1)));
    });
    H(this, "_onEditorBlur", () => {
      this._navigatingEditor || this.state.editing && this.stopEditing(!1);
    });
    // ----- Tree data (self-referential parent_id) -----
    //
    // The model layer flattens the tree and hands us back a Map of per-row
    // metadata (level, hasChildren, expanded). The controller owns the
    // expanded/collapsed override Map; the model just calls back through
    // `isTreeRowExpanded` to ask which state a given row is in. Everything
    // else (filter, sort, paginate) flows through the normal pipeline.
    H(this, "_isTreeRowExpanded", (e, n) => {
      const r = String(e);
      if (this._treeExpanded.has(r)) return this._treeExpanded.get(r);
      const i = this.state.tree?.defaultExpanded ?? -1;
      return i < 0 ? !0 : n < i;
    });
  }
  initialize() {
    this.state = {
      rowData: [],
      columnDefs: [],
      sortModel: [],
      filterModel: {},
      quickFilter: "",
      selection: /* @__PURE__ */ new Set(),
      focusedCell: null,
      cellSel: { ranges: [], activeIdx: -1 },
      // multi-range: [{anchor,focus}], active range
      editing: null,
      pagination: { enabled: !1, page: 0, pageSize: cn },
      scrollTop: 0,
      viewportHeight: 400,
      group: { cols: [], aggs: {}, defaultExpanded: -1 }
    }, this._displayList = { filteredSorted: [], pageRows: [], total: 0, totalPages: 1, page: 0 }, this._renderPending = !1, this._dirty = /* @__PURE__ */ new Set(), this._lastRenderedRowIds = /* @__PURE__ */ new Set(), this._runtimeOverrides = /* @__PURE__ */ Object.create(null), this._groupExpanded = /* @__PURE__ */ new Map(), this._detailExpanded = /* @__PURE__ */ new Set(), this._detailGrids = /* @__PURE__ */ new Map(), this._treeExpanded = /* @__PURE__ */ new Map();
  }
  connect() {
    this.element.classList.add("sg-grid"), this.heightValue && (this.element.style.height = this.heightValue), this.element.hasAttribute("tabindex") || (this.element.tabIndex = 0), this.element.addEventListener("keydown", this._onGridKeydown), this.state.rowHeight = this.rowHeightValue, this.state.pagination = {
      enabled: this.paginationValue,
      page: 0,
      pageSize: this.pageSizeValue
    }, this.state.serverSide = this.serverSideValue, this.state.serverRowCount = this.rowCountValue, this.state.group = {
      cols: Array.isArray(this.rowGroupColsValue) ? this.rowGroupColsValue.slice() : [],
      aggs: { ...this.aggFuncsValue || {} },
      defaultExpanded: this.groupDefaultExpandedValue,
      displayType: this.groupDisplayTypeValue || "singleColumn"
    }, this.state.pivot = {
      mode: !!this.pivotModeValue,
      cols: Array.isArray(this.pivotColsValue) ? this.pivotColsValue.slice() : []
    }, this.state.tree = {
      enabled: !!this.treeDataValue,
      parentField: this.treeParentFieldValue || "parent_id",
      displayField: this.treeDisplayFieldValue || "",
      defaultExpanded: this.treeDefaultExpandedValue
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = _o(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("paste", this._onPaste), document.removeEventListener("mousemove", this._onRowDragMove), this._thead?.removeEventListener("contextmenu", this._onHeaderContextMenu), this._thead?.removeEventListener("click", this._onSynthHeaderClick), this._tbody?.removeEventListener("dragenter", this._onCellDragEnter), this._tbody?.removeEventListener("dragover", this._onCellDragOver), this._tbody?.removeEventListener("dragleave", this._onCellDragLeave), this._tbody?.removeEventListener("drop", this._onCellDrop), this._closeColumnMenu(), this._teardownPersistence(), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove(), this._resizeObserver?.disconnect(), this._resizeObserver = null;
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((n, r) => {
      if (n.hasAttribute("data-separator")) {
        const c = n.getAttribute("data-separator"), d = { __sgSeparator: !0 };
        c && c !== "" && c !== "true" && (d.variant = c);
        const p = n.getAttribute("data-label"), f = n.getAttribute("data-value");
        return p != null && (d.label = p), f != null && (d.value = f), d;
      }
      const i = {}, o = n.getAttribute("data-row-id") || n.getAttribute("data-row-row-id-value");
      i[this.getRowIdValue] = o != null ? this._coerceRowId(o) : r + 1;
      const a = {};
      n.querySelectorAll("td").forEach((c) => {
        const d = c.getAttribute("data-cell-col-id-value") || c.getAttribute("data-col-id");
        if (!d) return;
        const p = c.getAttribute("data-cell-value");
        if (p != null)
          try {
            i[d] = JSON.parse(p);
          } catch {
            i[d] = p;
          }
        else
          i[d] = c.textContent.trim();
        const f = Number(c.getAttribute("data-spans") || c.getAttribute("colspan") || 1);
        f > 1 && (a[d] = f);
      }), Object.keys(a).length && (i.__sgSpans = a);
      const l = n.getAttribute("data-row-detail-rows-value");
      if (l && this.detailRowsKeyValue)
        try {
          i[this.detailRowsKeyValue] = JSON.parse(l);
        } catch {
        }
      return i;
    }), e.innerHTML = ""), this._initialHead = this.element.querySelector("thead");
  }
  _buildChrome() {
    let e = this.element.querySelector("table");
    if (!e) {
      e = C("table");
      const r = C("thead");
      e.appendChild(r), this.element.appendChild(e);
    }
    let n = e.querySelector("tbody");
    if (n || (n = C("tbody"), e.appendChild(n)), n.dataset.gridTarget = "body", this._tbody = n, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const r = C("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(r, e), r.appendChild(e), this._viewport = r;
    }
    if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = C("div", { class: "sg-status-bar", role: "status" }), this._statusBar.append(
      C("div", { class: "sg-status-section sg-status-left" }),
      C("div", { class: "sg-status-section sg-status-right" })
    ), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
      const r = C("div", { class: "sg-main" });
      this._viewport.parentNode.insertBefore(r, this._viewport), r.appendChild(this._viewport), this._statusBar && r.appendChild(this._statusBar), this._main = r, this._sidePanel = C("aside", {
        class: "sg-side-panel",
        "data-controller": "side-panel"
      }), this.element.appendChild(this._sidePanel), this.element.classList.add("sg-has-side-panel");
    } else
      this._main = null, this._sidePanel = null;
    this._thead?.addEventListener("contextmenu", this._onHeaderContextMenu), this._thead?.addEventListener("click", this._onSynthHeaderClick), typeof ResizeObserver < "u" && this._viewport && (this._resizeObserver = new ResizeObserver(() => {
      this._table?.isConnected && this._renderColgroup(this._visibleCols());
    }), this._resizeObserver.observe(this._viewport));
  }
  async _initialLoad() {
    if (this.rowDataValue && this.rowDataValue.length > 0)
      this.state.rowData = this.rowDataValue;
    else if (this.rowDataUrlValue)
      try {
        const e = await fetch(this.rowDataUrlValue);
        this.state.rowData = await e.json();
      } catch (e) {
        console.error("[stimulus_grid] failed to fetch rowDataUrl", e), this.state.rowData = [];
      }
    else this._initialRows && this._initialRows.length > 0 && (this.state.rowData = this._initialRows);
    this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), this._restorePersistedState(), this._setupPersistence(), P(this.element, "grid:ready", { api: this.element.gridApi }), P(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  // Filter UI bridge — implemented by filter_controller, but the grid is the
  // single source of truth so it brokers the popover.
  openFilterFor(e, n) {
    const r = this._colByField(e);
    if (!(!r || !r.filter)) {
      this._closeFilterPopover();
      {
        this._openFallbackFilterPopover(r, n);
        return;
      }
    }
  }
  _closeFilterPopover() {
    this._filterPopover && (this._filterPopover.remove(), this._filterPopover = null, document.removeEventListener("mousedown", this._onDocMouseDown));
  }
  _openFallbackFilterPopover(e, n) {
    const r = this.state.filterModel[e.field] || {}, i = mc(e.filter), o = C("div", { class: "sg-filter-popover" }), a = C("select");
    i.forEach((m) => a.append(new Option(m.label, m.value, !1, m.value === r.type)));
    const l = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", c = C("input", { type: l, value: r.value ?? "" }), d = C("input", { type: l, value: r.value2 ?? "", style: { display: "none" } }), p = () => {
      const m = a.value, _ = m === "inRange", y = !(m === "blank" || m === "notBlank");
      c.style.display = y ? "" : "none", d.style.display = _ ? "" : "none";
    };
    a.addEventListener("change", p), p();
    const f = C("div", { class: "sg-filter-actions" }), g = C("button", { type: "button" }, "Clear"), h = C("button", { type: "button", class: "primary" }, "Apply");
    f.append(g, h), g.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), h.addEventListener("click", () => {
      const m = a.value, _ = m === "blank" || m === "notBlank" ? { filterType: e.filter, type: m } : { filterType: e.filter, type: m, value: c.value, value2: d.value || void 0 };
      this.setColumnFilter(e.field, _), this._closeFilterPopover();
    }), o.append(
      C("label", {}, "Condition"),
      a,
      c,
      d,
      f
    ), document.body.appendChild(o);
    const b = n.getBoundingClientRect();
    o.style.left = `${b.left + window.scrollX}px`, o.style.top = `${b.bottom + window.scrollY + 2}px`, this._filterPopover = o, document.addEventListener("mousedown", this._onDocMouseDown), c.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, n) {
    const r = this.state.columnDefs.findIndex((c) => c.field === e.field), i = this._runtimeOverrides[e.field] || {}, o = r >= 0 ? this.state.columnDefs[r] : null, a = o ? {
      ...o.hidden != null ? { hidden: o.hidden } : {},
      ...o.pinned ? { pinned: o.pinned } : {},
      ...o.width != null ? { width: o.width } : {}
    } : {}, l = { ...e, ...i, ...a, _headerEl: n };
    if (r >= 0) {
      const c = this.state.columnDefs[r];
      if (c._headerEl === n && hc(c, l)) return;
      this.state.columnDefs[r] = l;
    } else
      this.state.columnDefs.push(l);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${ce(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((n) => n.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, n = !1) {
    const r = this.state.sortModel.findIndex((o) => o.colId === e);
    let i;
    r === -1 ? i = { colId: e, sort: "asc" } : this.state.sortModel[r].sort === "asc" ? i = { colId: e, sort: "desc" } : i = null, n ? (r >= 0 && this.state.sortModel.splice(r, 1), i && this.state.sortModel.push(i)) : this.state.sortModel = i ? [i] : [], this.scheduleRender("sort"), P(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  setSortModel(e) {
    this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), P(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  // ----- Filter -----
  setColumnFilter(e, n) {
    n == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = n, this.state.pagination.page = 0, this.scheduleRender("filter"), P(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setFilterModel(e) {
    this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), P(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setQuickFilter(e) {
    const n = e == null ? "" : String(e);
    n !== this.state.quickFilter && (this.state.quickFilter = n, this.state.pagination.page = 0, this.scheduleRender("filter"), P(this.element, "grid:filterChanged", {
      filterModel: { ...this.state.filterModel },
      quickFilter: n
    }));
  }
  getQuickFilter() {
    return this.state.quickFilter;
  }
  // ----- Selection -----
  toggleRowSelection(e, n = "single") {
    if (this.rowSelectionValue === "") return;
    const r = this.state.selection;
    this.rowSelectionValue === "single" ? (r.clear(), r.add(e)) : n === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : n === "toggle" ? r.has(e) ? r.delete(e) : r.add(e) : (r.clear(), r.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), P(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(r)
    });
  }
  setSelected(e, n) {
    n ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), P(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  selectAll() {
    this._displayList.filteredSorted.forEach((e) => {
      !e.__sgGroup && !e.__sgSeparator && this.state.selection.add(this._rowId(e));
    }), this.scheduleRender("selection"), P(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  deselectAll() {
    this.state.selection.clear(), this.scheduleRender("selection"), P(this.element, "grid:selectionChanged", { selectedRows: [], selectedIds: [] });
  }
  getSelectedRows() {
    const e = this.state.selection;
    return this.state.rowData.filter((n) => e.has(this._rowId(n)));
  }
  _selectRange(e, n) {
    const r = this._displayList.filteredSorted, i = r.findIndex((c) => this._rowId(c) === e), o = r.findIndex((c) => this._rowId(c) === n);
    if (i < 0 || o < 0) return;
    const [a, l] = i <= o ? [i, o] : [o, i];
    for (let c = a; c <= l; c++)
      !r[c].__sgGroup && !r[c].__sgSeparator && this.state.selection.add(this._rowId(r[c]));
  }
  // ----- Pagination -----
  goToPage(e) {
    const n = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(e, n)), this.scheduleRender("page"), P(this.element, "grid:paginationChanged", {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  setPageSize(e) {
    this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), P(this.element, "grid:paginationChanged", {
      page: 0,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  totalPages() {
    if (!this.state.pagination.enabled) return 1;
    const e = this.filteredCount();
    return Math.max(1, Math.ceil(e / this.state.pagination.pageSize));
  }
  filteredCount() {
    if (this.state.serverSide) return this.state.serverRowCount;
    const e = Object.fromEntries(this.state.columnDefs.map((i) => [i.field, i])), n = this.state.columnDefs.filter((i) => !i.hidden && !i._isCheckbox);
    let r = fn(this.state.rowData, this.state.filterModel, e);
    return r = gn(r, this.state.quickFilter, n), r.length;
  }
  // Server-side row model: set the total row count so pagination reflects the
  // full table even though only one page is loaded client-side. No event is
  // emitted (callers pair this with setRowData, whose rowDataChanged refreshes
  // the pagination UI) — emitting paginationChanged here would loop grid-sync.
  setRowCount(e) {
    this.state.serverRowCount = Math.max(0, Number(e) || 0), this.scheduleRender("page");
  }
  lastPageIndex() {
    return this.totalPages() - 1;
  }
  // ----- Editing -----
  startEditingCell(e, n, r = void 0) {
    const i = this.state.columnDefs.find((a) => a.field === n);
    if (!i || !i.editable) return;
    const o = this.state.rowData.find((a) => this._rowId(a) === e);
    o && (this.state.editing = { rowId: e, colId: n, originalValue: j(o, i), initialValue: r }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: n, colId: r, originalValue: i, draftValue: o } = this.state.editing, a = this._tbody.querySelector(`tr[data-row-id="${ce(n)}"] td[data-col-id="${ce(r)}"]`);
    let l = i;
    if (!e && a) {
      const c = a.firstElementChild, d = c?.matches?.("[data-editor-input],input,select,textarea") ? c : a.querySelector("[data-editor-input]") || a.querySelector("input,select,textarea");
      d ? l = bc(d.value, this._colByField(r)?.type) : o !== void 0 && (l = o);
    }
    if (this.state.editing = null, !e && l !== i) {
      const c = this.state.rowData.find((p) => this._rowId(p) === n), d = c[r];
      c[r] = l, P(this.element, "grid:cellValueChanged", { rowId: n, colId: r, oldValue: d, newValue: l });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, n) {
    const r = this._colByField(e);
    r && (r.hidden = !n, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !n }, this.scheduleRender("columns"), P(this.element, "grid:columnVisible", { colId: e, visible: n }));
  }
  setColumnPinned(e, n) {
    const r = this._colByField(e);
    if (!r) return;
    const i = n || null;
    r.pinned = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: i }, this._reorderForPinning(), this.scheduleRender("columns"), P(this.element, "grid:columnPinned", { colId: e, pinned: i });
  }
  setColumnWidth(e, n) {
    const r = this._colByField(e);
    if (!r) return;
    const i = Math.max(r.minWidth || 40, Math.min(r.maxWidth || 4e3, n));
    r.width = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: i }, this.scheduleRender("columns"), P(this.element, "grid:columnResized", { colId: e, width: i });
  }
  moveColumn(e, n) {
    const r = this.state.columnDefs.findIndex((o) => o.field === e);
    if (r < 0 || r === n) return;
    const [i] = this.state.columnDefs.splice(r, 1);
    this.state.columnDefs.splice(n, 0, i), this.scheduleRender("columns"), P(this.element, "grid:columnMoved", { colId: e, fromIndex: r, toIndex: n });
  }
  autoSizeColumn(e) {
    const n = this._colByField(e);
    if (!n) return;
    const r = ce(e), i = this._thead?.querySelector(
      `th[data-header-cell-field-value="${r}"], th[data-field="${r}"]`
    ), o = Array.from(
      this._tbody?.querySelectorAll(`td[data-col-id="${r}"]`) || []
    ).filter((l) => !l.closest("tr")?.classList?.contains("sg-spacer"));
    let a = 0;
    if ((i || o.length) && (a = this._measureColumnContentWidth(i, o)), !a) {
      const l = (n.headerName || n.field || "").length, c = this.state.rowData.slice(0, 200);
      let d = l;
      for (const p of c) {
        const f = String(ne(p, n) ?? "").length;
        f > d && (d = f);
      }
      a = d * 8;
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, a + 16)));
  }
  // Build an off-screen single-column <table table-layout:auto> with clones
  // of the header + a sample of body cells, mount it inside .sg-grid so
  // scoped CSS still applies, read the natural td widths, return the max.
  _measureColumnContentWidth(e, n, r = 50) {
    const i = document.createElement("table");
    i.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;table-layout:auto;width:auto;border-collapse:separate;border-spacing:0;";
    const o = document.createElement("tbody");
    i.appendChild(o);
    const a = (c) => {
      if (!c) return;
      const d = document.createElement("tr"), p = c.cloneNode(!0);
      p.removeAttribute("style"), p.removeAttribute("data-controller"), p.querySelectorAll("[data-controller]").forEach((f) => f.removeAttribute("data-controller")), d.appendChild(p), o.appendChild(d);
    };
    if (a(e), n.slice(0, r).forEach(a), !o.children.length) return 0;
    this.element.appendChild(i);
    let l = 0;
    for (const c of o.children) {
      const d = c.firstElementChild;
      d && d.offsetWidth > l && (l = d.offsetWidth);
    }
    return this.element.removeChild(i), l;
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const n = this._visibleCols().filter((o) => !o._isSpacer), r = n.reduce((o, a) => o + (a.width || 150), 0);
    if (r === 0) return;
    const i = e / r;
    n.forEach((o) => {
      o.width = Math.max(o.minWidth || 40, Math.floor((o.width || 150) * i));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((i) => i.pinned === "left"), n = this.state.columnDefs.filter((i) => i.pinned === "right"), r = this.state.columnDefs.filter((i) => !i.pinned);
    this.state.columnDefs = [...e, ...r, ...n];
  }
  // ----- Data mutations -----
  setRowData(e) {
    const n = Array.isArray(e) ? e : [], r = this.getRowIdValue;
    n.forEach((i, o) => {
      i && (i[r] === void 0 || i[r] === null || i[r] === "") && (i[r] = o + 1);
    }), this.state.rowData = n, this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), P(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const n = [], r = [], i = [], o = new Map(this.state.rowData.map((a) => [this._rowId(a), a]));
    return (e.remove || []).forEach((a) => {
      const l = this._rowId(a);
      o.delete(l) && i.push(a);
    }), (e.update || []).forEach((a) => {
      const l = this._rowId(a);
      o.has(l) && (o.set(l, { ...o.get(l), ...a }), r.push(a));
    }), (e.add || []).forEach((a) => {
      const l = this._rowId(a);
      o.has(l) || (o.set(l, a), n.push(a));
    }), this.state.rowData = Array.from(o.values()), this.scheduleRender("data"), P(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: n, updated: r, removed: i };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((n) => ({ ...n })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: n = !1 } = {}) {
    const r = this.state.columnDefs.filter((l) => !l.hidden && !l._isCheckbox), i = (n ? this.getSelectedRows() : this._displayList.filteredSorted).filter((l) => !l.__sgGroup && !l.__sgDetail && !l.__sgSeparator), o = (l) => /[",\n\r]/.test(l) ? `"${String(l).replace(/"/g, '""')}"` : String(l), a = [r.map((l) => o(l.headerName || l.field)).join(e)];
    for (const l of i)
      a.push(r.map((c) => o(ne(l, c))).join(e));
    return a.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...n } = {}) {
    const r = this.getDataAsCsv(n), i = new Blob([r], { type: "text/csv;charset=utf-8" }), o = URL.createObjectURL(i), a = C("a", { href: o, download: e });
    return document.body.appendChild(a), a.click(), a.remove(), URL.revokeObjectURL(o), r;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.has("tree") || e.size === 0) && (this._displayList = wo({
      rowData: this.state.rowData,
      columnDefs: this.state.columnDefs,
      sortModel: this.state.sortModel,
      filterModel: this.state.filterModel,
      quickFilter: this.state.quickFilter,
      pagination: this.state.pagination,
      serverSide: this.state.serverSide,
      serverRowCount: this.state.serverRowCount,
      rowGroupCols: this.state.group.cols,
      aggModel: this.state.group.aggs,
      isGroupExpanded: this._isGroupExpanded,
      pivotMode: this.state.pivot.mode,
      pivotCols: this.state.pivot.cols,
      treeData: this.state.tree?.enabled,
      treeParentField: this.state.tree?.parentField,
      isTreeRowExpanded: this._isTreeRowExpanded,
      getRowId: (n) => this._rowId(n)
    })), (e.has("columns") || e.has("sort") || e.has("filter") || e.has("selection") || e.has("group") || e.has("pivot") || e.has("tree")) && this._renderHeader(), this._renderBody(), this._renderPagination(), this._renderStatusBar();
  }
  _renderHeader() {
    if (!this._thead) return;
    const e = this._visibleCols(), n = bo(e, this._headerLayoutOpts());
    n.depth > 1 ? this._renderHeaderMultiRow(e, n) : this._renderHeaderSingleRow(e), this._renderColgroup(e);
  }
  // Aggregate the options we hand to buildHeaderLayout (auto-derived pivot
  // groups when in pivot mode, plus any user-declared columnGroups).
  _headerLayoutOpts() {
    const e = { columnGroups: this.columnGroupsValue || null };
    return this.state.pivot?.mode && this._displayList?.pivot && (e.pivotCols = (this.state.pivot.cols || []).map((n) => this._colByField(n)).filter(Boolean), e.valueConfigs = Object.entries(this.state.group.aggs || {}).map(([n, r]) => ({ col: this._colByField(n), aggFunc: r })).filter((n) => n.col)), e;
  }
  _renderColgroup(e) {
    let n = this._table.querySelector("colgroup");
    n || (n = C("colgroup"), this._table.insertBefore(n, this._thead));
    const r = Array.from(n.children);
    for (e.forEach((c, d) => {
      let p = r[d];
      p || (p = C("col"), n.appendChild(p)), p.style.width = c.width ? c.width + "px" : "";
    }); n.children.length > e.length; ) n.lastElementChild.remove();
    const i = e.findIndex((c) => c._isSpacer), o = i >= 0 ? n.children[i] : null, a = e.filter((c) => !c._isSpacer);
    if (a.some((c) => !c.width))
      o && (o.style.width = "0px"), this._table.style.width = "100%";
    else {
      const c = a.reduce((f, g) => f + (Number(g.width) || 0), 0), d = this._viewport?.clientWidth || 0, p = d && c < d ? d - c : 0;
      o && (o.style.width = p + "px"), this._table.style.width = c + p + "px";
    }
  }
  _renderHeaderSingleRow(e) {
    if (this._thead.children.length > 1) {
      const f = this._thead.firstElementChild;
      for (let g = 1; g < this._thead.children.length; g++) {
        const h = this._thead.children[g];
        Array.from(h.children).forEach((b) => {
          (b.hasAttribute("data-header-cell-field-value") || b.hasAttribute("data-field")) && f.appendChild(b);
        });
      }
      for (; this._thead.children.length > 1; ) this._thead.lastElementChild.remove();
    }
    const n = this._thead.querySelector("tr") || (() => {
      const f = C("tr");
      return this._thead.appendChild(f), f;
    })(), r = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((f) => {
      const g = f.getAttribute("data-header-cell-field-value") || f.getAttribute("data-field");
      g && r.set(g, f);
    });
    const i = new Set(e.map((f) => f.field)), o = this.state.columnDefs.filter((f) => !i.has(f.field)), a = [...e, ...o], l = Array.from(n.children).map((f) => f.getAttribute("data-header-cell-field-value") || f.getAttribute("data-field")).filter(Boolean), c = a.map((f) => f.field);
    if (l.length === c.length && l.every((f, g) => f === c[g]))
      Array.from(n.children).forEach((f) => {
        f.removeAttribute("rowspan"), f.removeAttribute("colspan");
      });
    else {
      const f = [];
      for (const g of a) {
        let h = r.get(g.field);
        h ? (h.removeAttribute("rowspan"), h.removeAttribute("colspan")) : h = C("th", {
          "data-field": g.field,
          "data-synth": "true"
        }, [C("div", { class: "sg-header-content" }, [
          C("span", { class: "sg-header-label" }, g.headerName || g.field || "")
        ])]), f.push(h);
      }
      n.replaceChildren(...f);
    }
    Array.from(n.children).forEach((f) => {
      const g = f.getAttribute("data-header-cell-field-value") || f.getAttribute("data-field");
      g != null && (f.style.display = i.has(g) ? "" : "none");
    });
    const p = this._pinOffsets();
    for (const f of e) {
      const g = n.querySelector(`th[data-header-cell-field-value="${ce(f.field)}"]`) || n.querySelector(`th[data-field="${ce(f.field)}"]`);
      g && this._applyLeafThState(g, f, p);
    }
  }
  // Multi-row header: <thead> gets `layout.depth` rows of group headers
  // followed by the leaf headers, then one hidden row holding any registered
  // <th>s that aren't currently visible (so their controllers stay mounted).
  _renderHeaderMultiRow(e, n) {
    const r = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((d) => {
      const p = d.getAttribute("data-header-cell-field-value") || d.getAttribute("data-field");
      p && r.set(p, d);
    });
    const i = [], o = new Set(e.map((d) => d.field)), a = this._pinOffsets();
    for (const d of n.rows) {
      const p = C("tr");
      for (const f of d) {
        if (f.kind === "group") {
          p.appendChild(C("th", {
            class: "sg-header-group",
            colspan: String(f.colspan),
            "data-group-header": "true"
          }, f.label || ""));
          continue;
        }
        const g = f.col;
        let h = r.get(g.field);
        if (h || (h = C("th", {
          "data-field": g.field,
          "data-synth": "true"
        }, [C("div", { class: "sg-header-content" }, [
          C("span", { class: "sg-header-label" }, f.label || g.headerName || g.field || "")
        ])])), f.label) {
          const b = h.querySelector(".sg-header-label");
          b && b.textContent !== f.label && (b.textContent = f.label);
        }
        h.setAttribute("rowspan", String(f.rowspan)), h.removeAttribute("colspan"), h.style.display = "", p.appendChild(h), this._applyLeafThState(h, g, a);
      }
      i.push(p);
    }
    const l = /* @__PURE__ */ new Set();
    n.rows.forEach((d) => d.forEach((p) => {
      p.kind === "leaf" && l.add(p.col.field);
    }));
    const c = this.state.columnDefs.filter(
      (d) => !o.has(d.field) && !l.has(d.field)
    );
    if (c.length) {
      const d = C("tr", { class: "sg-hidden-header-row" });
      for (const p of c) {
        let f = r.get(p.field);
        f || (f = C("th", { "data-field": p.field, "data-synth": "true" })), f.removeAttribute("rowspan"), f.removeAttribute("colspan"), d.appendChild(f);
      }
      i.push(d);
    }
    this._thead.replaceChildren(...i);
  }
  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(e, n, r) {
    const i = this.state.sortModel.find((o) => o.colId === n.field);
    Gt(e, {
      "data-sortable": n.sortable ? "true" : null,
      "data-filterable": n.filter ? "true" : null,
      "data-filter-active": this.state.filterModel[n.field] ? "true" : null,
      "data-sort": i?.sort || null,
      "data-pinned": n.pinned || null,
      // Carry the column's value-type onto the <th> so CSS can right-align
      // numeric headers (matching the right-aligned numeric body cells from
      // currency/number/percent renderers and from the `type: 'number'`
      // formatter path).
      "data-type": n.type && n.type !== "text" ? n.type : null,
      // Derived alignment so the header text mirrors whatever its body cells
      // do, even when alignment comes from a renderer rather than col.type.
      // See _columnAlignment for the resolution rules.
      "data-align": this._columnAlignment(n)
    }), n.width && (e.style.width = n.width + "px"), e.style.left = n.pinned === "left" ? r.left[n.field] + "px" : "", e.style.right = n.pinned === "right" ? r.right[n.field] + "px" : "", this._ensureHeaderChrome(e, n, i);
  }
  // Resolve a column's intended text alignment so the header can mirror its
  // body cells. Explicit col.align (or col.headerAlign) wins; otherwise the
  // value-type or a known right-aligning renderer drives the default. Returns
  // 'right' | 'center' | 'left' | null. Returning null leaves the th alone
  // (the default text/start alignment from base CSS still applies).
  _columnAlignment(e) {
    if (e.headerAlign) return e.headerAlign;
    if (e.align) return e.align;
    if (e.type === "number") return "right";
    const n = e.cellRenderer;
    return typeof n == "string" && uc.has(n) ? "right" : null;
  }
  _ensureHeaderChrome(e, n, r) {
    if (n._isSpacer) {
      e.classList.add("sg-spacer-header"), e.textContent = "";
      return;
    }
    if (n._isRowNumber) {
      e.classList.add("sg-gutter-header"), e.textContent = "";
      return;
    }
    if (n._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let l = e.querySelector('input[type="checkbox"]');
      l || (l = C("input", { type: "checkbox", "aria-label": "Select all" }), l.addEventListener("change", (p) => {
        p.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(l));
      const c = this._displayList.filteredSorted.length, d = this.state.selection.size;
      l.checked = d > 0 && d >= c, l.indeterminate = d > 0 && d < c;
      return;
    }
    let i = e.querySelector(".sg-header-content");
    if (!i) {
      const l = e.textContent.trim();
      e.textContent = "", i = C("div", { class: "sg-header-content" }, [
        C("span", { class: "sg-header-label" }, l || n.headerName || n.field || "")
      ]), e.appendChild(i);
    }
    let o = i.querySelector(".sg-sort-icon");
    if (n.sortable)
      if (o || (o = C("span", { class: "sg-sort-icon", "aria-hidden": "true" }), o.innerHTML = Ie, i.appendChild(o)), r && this.state.sortModel.length > 1) {
        let l = i.querySelector(".sg-sort-index");
        l || (l = C("span", { class: "sg-sort-index" }), i.appendChild(l)), l.textContent = String(this.state.sortModel.indexOf(r) + 1);
      } else
        i.querySelector(".sg-sort-index")?.remove();
    else o && o.remove();
    let a = i.querySelector(".sg-filter-icon");
    n.filter ? a || (a = C("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), a.innerHTML = dc, i.appendChild(a)) : a && a.remove(), n.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !n._isCheckbox && e.appendChild(C("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), n = this._withDetailRows(this._displayList.pageRows);
    this._selKeys = this._computeCellSelKeys();
    const r = !this.masterDetailValue && (this.virtualValue || n.length > 200);
    let i = n, o = 0;
    if (r) {
      const f = this._viewport?.clientHeight || 400, g = this.state.rowHeight, h = vo(this.state.scrollTop, f, g, n.length, 8);
      o = h.first, i = n.slice(h.first, h.last);
    }
    const a = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((f) => {
      const g = f.dataset.rowId;
      g != null && a.set(g, f);
    });
    const l = document.createDocumentFragment(), c = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0;
    let d = 0;
    for (let f = 0; f < o; f++) {
      const g = n[f];
      g && !g.__sgGroup && !g.__sgDetail && !g.__sgSeparator && (d += 1);
    }
    const p = (f) => !f || f.__sgGroup || f.__sgDetail || f.__sgSeparator ? null : (d += 1, c + d);
    if (r) {
      const f = this.state.rowHeight, g = o * f, h = (n.length - o - i.length) * f;
      l.appendChild(this._spacerRow(g, e.length)), i.forEach((b) => l.appendChild(this._buildRow(b, e, a, p(b)))), l.appendChild(this._spacerRow(h, e.length));
    } else
      i.forEach((f) => l.appendChild(this._buildRow(f, e, a, p(f))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && l.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(l);
  }
  _buildPinnedBottomRow(e) {
    const n = C("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), r = this._pinOffsets(), i = this._displayList.grandTotals || {};
    let o = !1;
    for (const a of e) {
      if (a._isSpacer) {
        n.appendChild(C("td", { class: "sg-spacer-cell", "aria-hidden": "true" }));
        continue;
      }
      const l = C("td", { "data-col-id": a.field, "data-pinned": a.pinned || null });
      a.pinned === "left" ? l.style.left = r.left[a.field] + "px" : a.pinned === "right" && (l.style.right = r.right[a.field] + "px");
      const c = i[a.field];
      c != null ? (l.classList.add("sg-agg-cell"), l.textContent = this._formatAggregate(c)) : !o && !a._isCheckbox && !a._isRowNumber && (l.classList.add("sg-pinned-bottom-label"), l.textContent = "Total", o = !0), n.appendChild(l);
    }
    return n;
  }
  _buildRow(e, n, r, i) {
    if (e.__sgGroup) return this._buildGroupRow(e, n, r);
    if (e.__sgDetail) return this._buildDetailRow(e, n, r);
    if (e.__sgSeparator) return this._buildSeparatorRow(e, n, r);
    const o = String(this._rowId(e));
    let a = r.get(o);
    a || (a = C("tr")), a.dataset.rowId = o, a.classList.remove("sg-spacer");
    const l = this.state.selection.has(this._rowId(e)), c = this.masterDetailValue && this._isDetailExpanded(o);
    return Gt(a, {
      "data-selected": l ? "true" : null,
      "data-detail-expanded": c ? "true" : null
    }), this.masterDetailValue && a.classList.add("sg-master-row"), this._renderRow(a, e, n, i), a;
  }
  // Separator rows are positional anchors in the body — section headings,
  // subtotal / total lines on an invoice, blank spacers between groups of
  // line items. They're not data: not selectable, not editable, never sorted
  // or filtered. The shape on the row decides the visual variant:
  //   { __sgSeparator: true }                                    → blank spacer
  //   { __sgSeparator: true, variant: 'divider' }                → thin ruled line
  //   { __sgSeparator: true, label: 'Services' }                 → section heading
  //   { __sgSeparator: true, label: 'Subtotal', value: '$1,200' } → summary line
  //   { __sgSeparator: true, label: 'Total',    value: '$1,320', variant: 'total' }
  // An explicit `variant` always wins over the auto-pick.
  _buildSeparatorRow(e, n, r) {
    const i = `__s:${e.__sgSeparatorId ?? this._separatorKey(e)}`;
    let o = r.get(i);
    o || (o = C("tr")), o.dataset.rowId = i, o.dataset.separator = "true", o.className = "", o.removeAttribute("data-selected"), o.removeAttribute("data-detail-expanded");
    const a = e.variant || (e.value != null ? "summary" : e.label != null ? "heading" : "blank");
    o.classList.add("sg-separator-row", `sg-separator-${a}`), e.className && o.classList.add(e.className), o.innerHTML = "";
    const l = (p) => p._isCheckbox || p._isRowNumber || p._isGroupCol || p._isMasterExpand || p._isSpacer, d = n.filter((p) => !l(p)).length || n.length || 1;
    for (const p of n) {
      if (p._isSpacer) {
        o.appendChild(C("td", { class: "sg-spacer-cell", "aria-hidden": "true" }));
        continue;
      }
      if (l(p)) {
        const g = C("td", { "data-col-id": p.field, class: "sg-separator-gutter" });
        o.appendChild(g);
        continue;
      }
      const f = C("td", {
        "data-col-id": p.field,
        colspan: String(d),
        class: "sg-separator-cell"
      });
      this._renderSeparatorContent(f, e, a), o.appendChild(f);
      break;
    }
    return o;
  }
  _renderSeparatorContent(e, n, r) {
    if (r === "blank" || r === "divider")
      return;
    const i = C("div", { class: "sg-separator-content" });
    n.label != null && i.appendChild(C("span", { class: "sg-separator-label" }, String(n.label))), n.value != null && i.appendChild(C("span", { class: "sg-separator-value" }, String(n.value))), e.appendChild(i);
  }
  _separatorKey(e) {
    return [e.variant || "", e.label || "", e.value || ""].join("|");
  }
  _spacerRow(e, n) {
    if (e <= 0) {
      const i = C("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return i.style.height = "0px", i.appendChild(C("td", { colspan: String(n), style: { height: "0px", padding: "0", border: "0" } })), i;
    }
    const r = C("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return r.style.height = e + "px", r.appendChild(C("td", { colspan: String(n), style: { height: e + "px", padding: "0", border: "0" } })), r;
  }
  _renderRow(e, n, r, i) {
    e.innerHTML = "";
    const o = this._pinOffsets(), a = this._selKeys || { active: null, range: null }, l = String(this._rowId(n)), c = this._displayList?.treeMeta, d = c ? c.get(l) : null, p = d ? this._treeDisplayColField() : null, f = n && n.__sgSpans || null;
    let g = 0;
    for (let h = 0; h < r.length; h++) {
      const b = r[h];
      if (g > 0) {
        g -= 1;
        continue;
      }
      const m = b._isRowNumber || b._isCheckbox || b._isGroupCol || b._isMasterExpand || b._isSpacer;
      if (b._isSpacer) {
        const N = C("td", { class: "sg-spacer-cell", "aria-hidden": "true" });
        e.appendChild(N);
        continue;
      }
      const _ = f && !m ? Number(f[b.field]) : 0, y = Math.max(1, Math.min(_ || 1, r.length - h));
      y > 1 && (g = y - 1);
      const w = `${l}:${b.field}`, x = C("td", {
        "data-col-id": b.field,
        "data-pinned": b.pinned || null,
        "data-cell-active": a.active === w ? "true" : null,
        "data-cell-range": a.range && a.range.has(w) ? "true" : null,
        colspan: y > 1 ? String(y) : null
      });
      if (y > 1 && x.classList.add("sg-merged-cell"), b.type === "number" && x.classList.add("sg-renderer-number"), b.pinned === "left" ? x.style.left = o.left[b.field] + "px" : b.pinned === "right" && (x.style.right = o.right[b.field] + "px"), b._isRowNumber) {
        x.classList.add("sg-gutter-cell"), x.setAttribute("data-gutter", "true"), x.removeAttribute("data-cell-active"), x.removeAttribute("data-cell-range"), x.textContent = i != null ? String(i) : "", e.appendChild(x);
        continue;
      }
      if (b._isCheckbox) {
        x.classList.add("sg-checkbox-cell");
        const N = C("input", { type: "checkbox" });
        N.checked = this.state.selection.has(this._rowId(n)), x.appendChild(N), e.appendChild(x);
        continue;
      }
      if (b._isGroupCol) {
        x.classList.add("sg-group-leaf-cell"), x.removeAttribute("data-cell-active"), x.removeAttribute("data-cell-range"), e.appendChild(x);
        continue;
      }
      if (b._isMasterExpand) {
        x.classList.add("sg-master-expand-cell"), x.setAttribute("data-master-expand", "true"), x.removeAttribute("data-cell-active"), x.removeAttribute("data-cell-range");
        const N = this._isDetailExpanded(this._rowId(n)), T = C("span", {
          class: "sg-master-expand-caret",
          "data-expanded": N ? "true" : "false",
          "aria-hidden": "true"
        });
        T.innerHTML = Ie, x.appendChild(T), e.appendChild(x);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(n) && this.state.editing.colId === b.field) {
        x.setAttribute("data-editing", "true");
        const N = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : j(n, b), { node: T, control: k } = this._buildEditor(b, N);
        x.appendChild(T);
        const $ = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          if (k?.focus(), $ || k?.select?.(), k?.type && pc.has(k.type))
            try {
              k.showPicker?.();
            } catch {
            }
        });
      } else
        this._renderCellContent(x, n, b, i);
      d && b.field === p && this._decorateTreeCell(x, d), e.appendChild(x);
    }
  }
  // Prepend an indent spacer + a chevron (when the row has children) to the
  // tree column's <td>. The chevron carries data-tree-toggle so the body
  // click handler can route it back to toggleTreeRow without conflicting
  // with cell selection or row click handlers.
  _decorateTreeCell(e, n) {
    if (e.classList.add("sg-tree-cell"), e.setAttribute("data-tree-level", String(n.level)), e.style.paddingLeft = `${8 + n.level * 18}px`, n.hasChildren) {
      const r = C("span", {
        class: "sg-tree-chevron",
        "data-tree-toggle": "true",
        "data-expanded": n.expanded ? "true" : "false",
        "aria-hidden": "true"
      });
      r.innerHTML = Ie, e.insertBefore(r, e.firstChild);
    } else {
      const r = C("span", { class: "sg-tree-chevron sg-tree-chevron-leaf", "aria-hidden": "true" });
      e.insertBefore(r, e.firstChild);
    }
  }
  _renderCellContent(e, n, r, i = null) {
    if (r.cellRenderer) {
      const o = jt(r.cellRenderer);
      if (o) {
        const l = j(n, r), c = ne(n, r);
        (o.dataset.bind || o.dataset.bindText !== void 0) && (o.textContent = o.dataset.bind ? String(n[o.dataset.bind] ?? "") : c), o.dataset.bindAttr && o.setAttribute(o.dataset.bindAttr, l), o.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((d) => {
          d.dataset.bindText !== void 0 ? d.textContent = c : d.dataset.bind && (d.textContent = String(n[d.dataset.bind] ?? "")), d.dataset.bindAttr && d.setAttribute(d.dataset.bindAttr, l);
        }), e.appendChild(o);
        return;
      }
      const a = xe(r.cellRenderer);
      if (typeof a == "function") {
        const l = j(n, r), c = ne(n, r), d = a({ value: l, row: n, col: r, td: e, formatted: c, rowNum: i, api: this.element.gridApi });
        if (d == null) return;
        if (typeof d == "string") {
          e.innerHTML = d;
          return;
        }
        if (d instanceof Node) {
          e.appendChild(d);
          return;
        }
        e.textContent = String(d);
        return;
      }
    }
    e.textContent = ne(n, r);
  }
  toggleGroup(e, n = 0) {
    this._groupExpanded.set(e, !this._isGroupExpanded(e, n)), this.scheduleRender("group"), P(this.element, "grid:groupToggled", { groupId: e, expanded: this._groupExpanded.get(e) });
  }
  expandAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = -1, this.scheduleRender("group");
  }
  collapseAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = 0, this.scheduleRender("group");
  }
  setRowGroupColumns(e) {
    this.state.group.cols = Array.isArray(e) ? e.slice() : [], this._groupExpanded.clear(), this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("group"), P(this.element, "grid:columnRowGroupChanged", { rowGroupCols: this.state.group.cols.slice() });
  }
  addRowGroupColumn(e) {
    !e || this.state.group.cols.includes(e) || this.setRowGroupColumns([...this.state.group.cols, e]);
  }
  removeRowGroupColumn(e) {
    this.setRowGroupColumns(this.state.group.cols.filter((n) => n !== e));
  }
  getRowGroupColumns() {
    return this.state.group.cols.slice();
  }
  setColumnAggFunc(e, n) {
    n == null ? delete this.state.group.aggs[e] : this.state.group.aggs[e] = n, this.scheduleRender("group"), P(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  // ----- Pivot mode -----
  // Toggling pivot mode rebuilds the display list (and therefore the visible
  // column set). Clears row + cell selection since the underlying cell graph
  // changes shape entirely.
  setPivotMode(e) {
    const n = !!e;
    this.state.pivot.mode !== n && (this.state.pivot.mode = n, this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), P(this.element, "grid:pivotModeChanged", { pivot: n }));
  }
  isPivotMode() {
    return !!this.state.pivot.mode;
  }
  setPivotColumns(e) {
    this.state.pivot.cols = Array.isArray(e) ? e.slice() : [], this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), P(this.element, "grid:columnPivotChanged", { pivotCols: this.state.pivot.cols.slice() });
  }
  addPivotColumn(e) {
    !e || this.state.pivot.cols.includes(e) || this.setPivotColumns([...this.state.pivot.cols, e]);
  }
  removePivotColumn(e) {
    this.setPivotColumns(this.state.pivot.cols.filter((n) => n !== e));
  }
  getPivotColumns() {
    return this.state.pivot.cols.slice();
  }
  // "Value columns" = fields with an entry in state.group.aggs. Same map as the
  // grouping aggregations — drives both the per-group totals (in plain grouping)
  // and the pivot cell aggregations (in pivot mode).
  getValueColumns() {
    return Object.entries(this.state.group.aggs).map(([e, n]) => ({ field: e, aggFunc: n }));
  }
  setValueColumns(e) {
    const n = {};
    for (const { field: r, aggFunc: i } of e || [])
      r && i && (n[r] = i);
    this.state.group.aggs = n, this.scheduleRender(this.state.pivot.mode ? "pivot" : "group"), P(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  addValueColumn(e, n = "sum") {
    e && this.setColumnAggFunc(e, n);
  }
  removeValueColumn(e) {
    this.setColumnAggFunc(e, null);
  }
  // ----- Column header groups + pinned bottom row -----
  setColumnGroups(e) {
    this.columnGroupsValue = Array.isArray(e) ? e : [], this.scheduleRender("columns"), P(this.element, "grid:columnGroupsChanged", { columnGroups: this.columnGroupsValue });
  }
  getColumnGroups() {
    return Array.isArray(this.columnGroupsValue) ? this.columnGroupsValue.slice() : [];
  }
  setPinnedBottomRow(e) {
    this.pinnedBottomRowValue = !!e, this.scheduleRender("cells");
  }
  isPinnedBottomRow() {
    return !!this.pinnedBottomRowValue;
  }
  // ----- Column state serialization + persistence -----
  //
  // getColumnState() captures everything a user can change about the grid's
  // layout — column order/width/pinning/visibility, row groups, pivot,
  // value aggregations, header groups, the pinned bottom row toggle, and
  // the sort/filter/quick-filter model — into a plain JSON-serializable
  // object. applyColumnState() restores that snapshot, then schedules a
  // single render and emits `grid:columnStateApplied` so subscribers (e.g.
  // the side panel) refresh in one shot. With `data-grid-persist-key-value`
  // set, the same shape is round-tripped to localStorage automatically.
  getColumnState() {
    return {
      v: 1,
      cols: this.state.columnDefs.filter((e) => !e._isGroupCol && !e._isPivot).map((e) => {
        const n = { field: e.field };
        return e.width != null && (n.width = e.width), e.pinned && (n.pinned = e.pinned), e.hidden && (n.hidden = !0), n;
      }),
      rowGroupCols: this.state.group.cols.slice(),
      pivot: { mode: !!this.state.pivot.mode, cols: this.state.pivot.cols.slice() },
      values: this.getValueColumns(),
      columnGroups: this.getColumnGroups(),
      pinnedBottomRow: !!this.pinnedBottomRowValue,
      sortModel: this.state.sortModel.slice(),
      filterModel: { ...this.state.filterModel },
      quickFilter: this.state.quickFilter || ""
    };
  }
  applyColumnState(e) {
    if (!(!e || typeof e != "object")) {
      if (Array.isArray(e.cols)) {
        const n = new Map(this.state.columnDefs.map((i) => [i.field, i])), r = [];
        for (const i of e.cols) {
          const o = n.get(i.field);
          o && (i.width != null && (o.width = i.width), o.pinned = i.pinned || void 0, o.hidden = !!i.hidden, n.delete(i.field), r.push(o));
        }
        for (const i of n.values()) r.push(i);
        this.state.columnDefs = r;
      }
      if (Array.isArray(e.rowGroupCols) && (this.state.group.cols = e.rowGroupCols.slice()), e.pivot && typeof e.pivot == "object" && (this.state.pivot.cols = Array.isArray(e.pivot.cols) ? e.pivot.cols.slice() : [], this.state.pivot.mode = !!e.pivot.mode), Array.isArray(e.values)) {
        const n = {};
        for (const { field: r, aggFunc: i } of e.values) r && i && (n[r] = i);
        this.state.group.aggs = n;
      }
      Array.isArray(e.columnGroups) && (this.columnGroupsValue = e.columnGroups), typeof e.pinnedBottomRow == "boolean" && (this.pinnedBottomRowValue = e.pinnedBottomRow), Array.isArray(e.sortModel) && (this.state.sortModel = e.sortModel.slice()), e.filterModel && typeof e.filterModel == "object" && (this.state.filterModel = { ...e.filterModel }), typeof e.quickFilter == "string" && (this.state.quickFilter = e.quickFilter);
      for (const n of ["columns", "group", "pivot", "sort", "filter", "data"])
        this.scheduleRender(n);
      P(this.element, "grid:columnStateApplied", { state: e });
    }
  }
  _storageKey() {
    return `sgrid:${this.persistKeyValue}`;
  }
  _restorePersistedState() {
    if (!(!this.persistKeyValue || typeof localStorage > "u"))
      try {
        const e = localStorage.getItem(this._storageKey());
        if (!e) return;
        const n = JSON.parse(e);
        n && typeof n == "object" && this.applyColumnState(n);
      } catch (e) {
        console.warn("[stimulus_grid] failed to restore persisted state", e);
      }
  }
  _setupPersistence() {
    if (!this.persistKeyValue || typeof localStorage > "u") return;
    const e = () => {
      clearTimeout(this._persistTimer), this._persistTimer = setTimeout(() => this._persistState(), 200);
    };
    this._persistListener = e;
    for (const n of dn) this.element.addEventListener(n, e);
    this._persistBeforeUnload = () => {
      this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
    }, window.addEventListener("beforeunload", this._persistBeforeUnload);
  }
  _teardownPersistence() {
    if (this._persistListener) {
      for (const e of dn) this.element.removeEventListener(e, this._persistListener);
      this._persistBeforeUnload && (window.removeEventListener("beforeunload", this._persistBeforeUnload), this._persistBeforeUnload = null), this._persistTimer && (clearTimeout(this._persistTimer), this._persistState()), this._persistListener = null;
    }
  }
  _persistState() {
    if (!(!this.persistKeyValue || typeof localStorage > "u"))
      try {
        localStorage.setItem(this._storageKey(), JSON.stringify(this.getColumnState()));
      } catch (e) {
        console.warn("[stimulus_grid] failed to persist state", e);
      }
  }
  clearPersistedState() {
    if (!(!this.persistKeyValue || typeof localStorage > "u"))
      try {
        localStorage.removeItem(this._storageKey());
      } catch {
      }
  }
  _buildGroupRow(e, n, r) {
    const i = `__g:${e.groupId}`;
    let o = r.get(i);
    return o || (o = C("tr")), o.dataset.rowId = i, o.dataset.group = "true", o.dataset.groupLevel = String(e.level), o.className = "sg-group-row", this._renderGroupRow(o, e, n), o;
  }
  _renderGroupRow(e, n, r) {
    e.innerHTML = "";
    const i = this._pinOffsets(), o = this._isGroupExpanded(n.groupId, n.level), a = (this.state.group.displayType || "singleColumn") === "singleColumn", l = !!(this.state.pivot?.mode && this._displayList?.pivot), c = n.__pivotAll === !0, d = r.filter((g) => !g._isRowNumber && !g._isCheckbox && !g._isGroupCol && !g._isSpacer), p = d.some((g) => g.field === n.field) ? n.field : d[0]?.field, f = Math.max(0, n.level);
    c && e.classList.add("sg-pivot-all-row");
    for (const g of r) {
      if (g._isSpacer) {
        e.appendChild(C("td", { class: "sg-spacer-cell", "aria-hidden": "true" }));
        continue;
      }
      const h = C("td", { "data-col-id": g.field, "data-pinned": g.pinned || null });
      if (g.pinned === "left" ? h.style.left = i.left[g.field] + "px" : g.pinned === "right" && (h.style.right = i.right[g.field] + "px"), g._isRowNumber || g._isCheckbox) {
        h.classList.add(g._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(h);
        continue;
      }
      if (l || a ? g._isGroupCol : g.field === p) {
        if (h.classList.add("sg-group-cell"), h.style.paddingLeft = `${8 + f * 18}px`, !c) {
          const m = C("span", {
            class: "sg-group-caret",
            "data-expanded": o ? "true" : "false",
            "aria-hidden": "true"
          });
          m.innerHTML = Ie, h.appendChild(m);
        }
        h.append(
          C("span", { class: "sg-group-label" }, this._groupValueLabel(n)),
          C("span", { class: "sg-group-count" }, ` (${n.count})`)
        );
      } else if (l && g._isPivot) {
        const m = j(n, g);
        m != null && (h.classList.add("sg-agg-cell"), h.textContent = this._formatAggregate(m));
      } else !g._isGroupCol && n.aggregates && n.aggregates[g.field] != null && (h.classList.add("sg-agg-cell"), h.textContent = this._formatAggregate(n.aggregates[g.field]));
      e.appendChild(h);
    }
  }
  _groupValueLabel(e) {
    const n = e.value;
    if (n == null || n === "") return "(Blanks)";
    const r = this._colByField(e.field);
    return r ? ne({ [e.field]: n }, r) : String(n);
  }
  _formatAggregate(e) {
    return e == null ? "" : typeof e == "number" ? Number.isInteger(e) ? String(e) : String(Math.round(e * 100) / 100) : String(e);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, n) {
    if (e.cellEditor) {
      const i = jt(e.cellEditor);
      if (i) {
        const o = i.matches?.("input,select,textarea,[data-editor-input]") ? i : i.querySelector?.("[data-editor-input]") || i.querySelector?.("input,select,textarea");
        return o && (this._seedEditorValue(o, e, n), o.addEventListener("keydown", this._onEditorKey), o.addEventListener("blur", this._onEditorBlur)), { node: i, control: o };
      }
    }
    const r = this._buildEditorInput(e, n);
    return { node: r, control: r };
  }
  _seedEditorValue(e, n, r) {
    if (n.type === "date" && r) {
      const i = r instanceof Date ? r : new Date(r);
      e.value = Number.isNaN(i?.getTime?.()) ? r ?? "" : i.toISOString().slice(0, 10);
    } else if (n.type === "datetime" && r) {
      const i = r instanceof Date ? r : new Date(r);
      if (Number.isNaN(i?.getTime?.()))
        e.value = r ?? "";
      else {
        const o = i.getTimezoneOffset() * 6e4;
        e.value = new Date(i.getTime() - o).toISOString().slice(0, 16);
      }
    } else n.type === "boolean" ? e.value = r === !0 ? "true" : r === !1 ? "false" : "" : e.value = r ?? "";
  }
  // Native input type per column `type`. HTML5 already covers most of what
  // the built-in renderers need (color picker, date picker, datetime-local
  // picker, native email/url/tel validation) — we just have to ask for the
  // right input type. Anything outside the known list falls through to a
  // plain text input, which is what cellEditor templates wrap when a column
  // wants something fancier.
  _buildEditorInput(e, n) {
    let r;
    if (e.type === "number") r = C("input", { type: "number", value: n ?? "" });
    else if (e.type === "date") {
      const i = n instanceof Date ? n : n ? new Date(n) : null, o = i ? i.toISOString().slice(0, 10) : "";
      r = C("input", { type: "date", value: o });
    } else if (e.type === "datetime") {
      const i = n instanceof Date ? n : n ? new Date(n) : null;
      let o = "";
      if (i && !Number.isNaN(i.getTime())) {
        const a = i.getTimezoneOffset() * 6e4;
        o = new Date(i.getTime() - a).toISOString().slice(0, 16);
      }
      r = C("input", { type: "datetime-local", value: o });
    } else if (e.type === "color") {
      const i = /^#[0-9a-f]{6}$/i.test(String(n ?? "")) ? n : "#000000";
      r = C("input", { type: "color", value: i });
    } else e.type === "email" ? r = C("input", { type: "email", value: n ?? "" }) : e.type === "url" ? r = C("input", { type: "url", value: n ?? "" }) : e.type === "tel" ? r = C("input", { type: "tel", value: n ?? "" }) : e.type === "boolean" ? (r = C("select"), r.append(
      new Option("—", ""),
      new Option("true", "true", n === !0, n === !0),
      new Option("false", "false", n === !1, n === !1)
    )) : r = C("input", { type: "text", value: n ?? "" });
    return r.addEventListener("keydown", this._onEditorKey), r.addEventListener("blur", this._onEditorBlur), r;
  }
  _renderPagination() {
    this.state.pagination.enabled;
  }
  // ----- Status bar (rows · selection · range aggregates) -----
  _renderStatusBar() {
    if (!this._statusBar) return;
    const e = this._statusBar.querySelector(".sg-status-left"), n = this._statusBar.querySelector(".sg-status-right");
    e.replaceChildren();
    const r = this.state.serverSide ? this.state.serverRowCount : this.state.rowData.length, i = this._displayList.grouped ? this._displayList.leafCount ?? this.filteredCount() : this.filteredCount();
    e.appendChild(this._statusPanel(
      "Rows",
      this._fmtInt(i),
      i !== r ? `of ${this._fmtInt(r)}` : null
    ));
    const o = this.state.selection.size;
    o > 0 && e.appendChild(this._statusPanel("Selected", this._fmtInt(o))), n.replaceChildren();
    const a = this.getRangeAggregates();
    if (a && a.count > 0) {
      const c = (this.statusBarAggsValue || []).filter((d) => d in a);
      for (const d of c) {
        const p = a[d];
        p == null && d !== "count" || n.appendChild(this._statusPanel(this._aggLabel(d), this._fmtAgg(d, p)));
      }
    }
    const l = a ? `${a.count}|${a.sum}|${a.avg}|${a.min}|${a.max}` : "";
    l !== this._lastRangeAggs && (this._lastRangeAggs = l, P(this.element, "grid:rangeAggsChanged", { aggs: a }));
  }
  _statusPanel(e, n, r = null) {
    const i = C("div", { class: "sg-status-panel" });
    return i.append(
      C("span", { class: "sg-status-label" }, `${e}:`),
      C("span", { class: "sg-status-value" }, n)
    ), r && i.appendChild(C("span", { class: "sg-status-aside" }, r)), i;
  }
  _fmtInt(e) {
    return Number(e).toLocaleString();
  }
  _aggLabel(e) {
    return { count: "Count", sum: "Sum", avg: "Avg", min: "Min", max: "Max" }[e] || e;
  }
  _fmtAgg(e, n) {
    return n == null ? "—" : e === "count" ? this._fmtInt(n) : typeof n == "number" ? Number.isInteger(n) ? this._fmtInt(n) : (Math.round(n * 100) / 100).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(n);
  }
  // Flat list of RAW cell values across every active range — fed to
  // aggregateRange to compute the status-bar numbers. Skips group rows and
  // the structural columns (gutter / checkbox / auto-group).
  _cellRangeRawValues() {
    const e = [];
    for (const n of this.state.cellSel.ranges) {
      const r = this._rangeRect(n);
      if (r)
        for (let i = r.r0; i <= r.r1; i++) {
          const o = r.rows[i];
          if (!(!o || o.__sgGroup || o.__sgDetail || o.__sgSeparator))
            for (let a = r.c0; a <= r.c1; a++) {
              const l = r.cols[a];
              !l || l._isCheckbox || l._isRowNumber || l._isGroupCol || l._isMasterExpand || l._isSpacer || e.push(j(o, l));
            }
        }
    }
    return e;
  }
  getRangeAggregates() {
    return this.state.cellSel.ranges.length ? ao(this._cellRangeRawValues()) : null;
  }
  _showColumnMenu(e, n, r) {
    this._closeColumnMenu();
    const i = this._columnMenuItems(e), o = C("div", { class: "sg-column-menu", role: "menu" });
    for (const c of i) {
      if (c === "separator") {
        o.appendChild(C("div", { class: "sg-column-menu-separator", role: "separator" }));
        continue;
      }
      const d = C("button", {
        type: "button",
        class: "sg-column-menu-item" + (c.active ? " sg-column-menu-active" : ""),
        role: "menuitem"
      });
      d.append(
        C("span", { class: "sg-column-menu-label" }, c.label)
      ), c.active && d.append(C("span", { class: "sg-column-menu-check", "aria-hidden": "true" }, "✓")), d.addEventListener("click", () => {
        c.action(), this._closeColumnMenu();
      }), o.appendChild(d);
    }
    document.body.appendChild(o);
    const a = o.offsetWidth || 220, l = o.offsetHeight || 280;
    o.style.left = `${Math.min(n, window.innerWidth - a - 4)}px`, o.style.top = `${Math.min(r, window.innerHeight - l - 4)}px`, this._columnMenu = o, setTimeout(() => {
      document.addEventListener("mousedown", this._onDocMouseDownColumnMenu), document.addEventListener("keydown", this._onColumnMenuKey), window.addEventListener("resize", this._closeColumnMenuBound = () => this._closeColumnMenu(), { once: !0 }), window.addEventListener("scroll", this._closeColumnMenuBound, { once: !0, capture: !0 });
    }, 0), P(this.element, "grid:columnMenuOpened", { colId: e.field });
  }
  _closeColumnMenu() {
    this._columnMenu && (this._columnMenu.remove(), this._columnMenu = null, document.removeEventListener("mousedown", this._onDocMouseDownColumnMenu), document.removeEventListener("keydown", this._onColumnMenuKey), this._closeColumnMenuBound && (window.removeEventListener("resize", this._closeColumnMenuBound), window.removeEventListener("scroll", this._closeColumnMenuBound, { capture: !0 }), this._closeColumnMenuBound = null));
  }
  // Build the menu item list for `col` based on the current grid state. Each
  // item is { label, action, active? } or the string 'separator'. Items are
  // emitted only when they make sense (e.g. "Unpin" doesn't show on an
  // unpinned col), so the menu stays short.
  _columnMenuItems(e) {
    const n = this.element.gridApi, r = e.headerName || e.field, i = this.state.group.cols.includes(e.field), o = this.state.pivot.cols.includes(e.field), a = this.state.group.aggs[e.field], l = e.type === "number", c = [];
    if (e.pinned !== "left" && c.push({ label: "Pin left", action: () => n.setColumnPinned(e.field, "left") }), e.pinned !== "right" && c.push({ label: "Pin right", action: () => n.setColumnPinned(e.field, "right") }), e.pinned && c.push({ label: "Unpin", action: () => n.setColumnPinned(e.field, null) }), c.push("separator"), c.push({ label: "Autosize this column", action: () => n.autoSizeColumn(e.field) }), c.push({ label: "Autosize all columns", action: () => n.autoSizeAllColumns() }), c.push("separator"), c.push(i ? { label: `Ungroup ${r}`, action: () => n.removeRowGroupColumn(e.field) } : { label: `Group by ${r}`, action: () => n.addRowGroupColumn(e.field) }), c.push(o ? { label: `Remove ${r} from pivot`, action: () => n.removePivotColumn(e.field) } : { label: `Pivot by ${r}`, action: () => {
      n.isPivotMode() || n.setPivotMode(!0), n.addPivotColumn(e.field);
    } }), l || a) {
      c.push("separator");
      for (const d of ["sum", "avg", "count", "min", "max"])
        c.push({
          label: `Aggregate: ${d}`,
          active: a === d,
          action: () => n.addValueColumn(e.field, d)
        });
      a && c.push({ label: "Remove aggregation", action: () => n.removeValueColumn(e.field) });
    }
    return c.push("separator"), c.push({ label: "Hide column", action: () => n.setColumnVisible(e.field, !1) }), c.push({
      label: "Show all columns",
      action: () => {
        this.state.columnDefs.forEach((d) => {
          d.hidden && !d._isGroupCol && !d._isPivot && !d._isCheckbox && !d._isRowNumber && n.setColumnVisible(d.field, !0);
        });
      }
    }), c;
  }
  // ----- Event delegation (clicks on rendered tbody) -----
  // Stimulus actions on tbody — wired in _buildChrome by adding data-action.
  // For simplicity we add native listeners here.
  _attachBodyListeners() {
    this._listenersAttached || (this._listenersAttached = !0, this._tbody.addEventListener("click", (e) => this._onBodyClick(e)), this._tbody.addEventListener("dblclick", (e) => this._onBodyDblClick(e)), this._tbody.addEventListener("mousedown", this._onCellMouseDown), this._tbody.addEventListener("mouseover", this._onCellMouseOver), document.addEventListener("mouseup", this._onCellMouseUp), document.addEventListener("copy", this._onCopy), document.addEventListener("paste", this._onPaste), this._viewport.addEventListener("scroll", this._onScroll, { passive: !0 }), this.acceptFilesValue && (this._tbody.addEventListener("dragenter", this._onCellDragEnter), this._tbody.addEventListener("dragover", this._onCellDragOver), this._tbody.addEventListener("dragleave", this._onCellDragLeave), this._tbody.addEventListener("drop", this._onCellDrop)));
  }
  // ----- Drag-to-attach files on cells -----
  //
  // Lightweight, render-loop-friendly drop handling: we don't decorate every
  // <td> with attributes on render (that would balloon the row payload).
  // Instead we listen at the tbody level and check each event's target on
  // the fly. The cell gets `.sg-drop-target` class while the user is hovering
  // a file, and `grid:fileAttached` fires when they release.
  //
  // Per-column opt-out: a column can set `acceptFiles: false` (or a column
  // type that's clearly not file-friendly like `_isCheckbox`) to skip the
  // drop visual / event.
  _dropTarget(e) {
    const n = e?.closest?.("td"), r = e?.closest?.("tr");
    if (!n || !r || r.dataset.group === "true" || r.dataset.separator === "true" || r.classList.contains("sg-detail-row") || n.classList.contains("sg-checkbox-cell") || n.classList.contains("sg-group-leaf-cell") || n.classList.contains("sg-master-expand-cell") || n.dataset.gutter === "true" || !n.dataset.colId) return null;
    const i = n.dataset.colId, o = this._colByField(i);
    return o && o.acceptFiles === !1 ? null : { td: n, tr: r, colId: i, rowId: this._coerceRowId(r.dataset.rowId), col: o };
  }
  _isFileDrag(e) {
    const n = e.dataTransfer?.types;
    return n ? Array.from(n).includes("Files") : !1;
  }
  _onBodyClick(e) {
    const n = e.target.closest("tr");
    if (!n) return;
    if (n.dataset.group === "true") {
      this.toggleGroup(n.dataset.rowId.replace(/^__g:/, ""), Number(n.dataset.groupLevel) || 0);
      return;
    }
    if (n.dataset.separator === "true" || n.classList.contains("sg-detail-row")) return;
    if (e.target.closest?.('td[data-master-expand="true"]')) {
      const c = this._coerceRowId(n.dataset.rowId);
      this.toggleDetailRow(c);
      return;
    }
    const i = e.target.closest?.('[data-tree-toggle="true"]');
    if (i && n.contains(i)) {
      const c = this._coerceRowId(n.dataset.rowId);
      this.toggleTreeRow(c);
      return;
    }
    if (e.target.closest('td[data-editing="true"]')) return;
    const o = this._coerceRowId(n.dataset.rowId), a = e.target.closest("td");
    if (a?.classList.contains("sg-spacer-cell")) return;
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(o, "toggle");
      return;
    }
    if (a && a.dataset.gutter === "true") {
      if (this._rowDragMoved) {
        this._rowDragMoved = !1;
        return;
      }
      if (this.rowSelectionValue !== "") {
        const c = e.shiftKey ? "range" : e.metaKey || e.ctrlKey ? "toggle" : "replace";
        this.clearCellSelection(), this.toggleRowSelection(o, c), P(this.element, "grid:rowClicked", { rowId: o, row: this.state.rowData.find((d) => this._rowId(d) === o), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (a) {
      const c = this.state.rowData.find((p) => this._rowId(p) === o), d = a.dataset.colId;
      P(this.element, "grid:cellClicked", { rowId: o, colId: d, value: c?.[d], event: e });
    }
    if (this.cellSelectionValue) {
      if (this._cellDragMoved) {
        this._cellDragMoved = !1;
        return;
      }
      !e.shiftKey && !(e.metaKey || e.ctrlKey) && this.state.selection.size && this.deselectAll();
      return;
    }
    if (this.suppressRowClickSelectionValue || this.rowSelectionValue === "") {
      this._cellDragMoved = !1;
      return;
    }
    if (this._cellDragMoved) {
      this._cellDragMoved = !1;
      return;
    }
    const l = e.shiftKey ? "range" : e.metaKey || e.ctrlKey || this.rowMultiSelectWithClickValue ? "toggle" : "replace";
    this.toggleRowSelection(o, l), P(this.element, "grid:rowClicked", { rowId: o, row: this.state.rowData.find((c) => this._rowId(c) === o), event: e });
  }
  // ----- Cell selection (Numbers/Sheets-style: multi-range + active cell) -----
  _cellAt(e) {
    const n = e.closest?.("td"), r = e.closest?.("tr");
    return !n || !r || r.dataset.group === "true" || r.dataset.separator === "true" || r.classList.contains("sg-detail-row") || n.classList.contains("sg-checkbox-cell") || n.classList.contains("sg-group-leaf-cell") || n.classList.contains("sg-master-expand-cell") || n.classList.contains("sg-spacer-cell") || n.dataset.gutter === "true" || !n.dataset.colId || n.dataset.editing === "true" ? null : { rowId: this._coerceRowId(r.dataset.rowId), colId: n.dataset.colId };
  }
  _activeCell() {
    const e = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
    return e ? e.anchor : null;
  }
  _setSingleCellSel(e) {
    this.state.cellSel = { ranges: [{ anchor: e, focus: e }], activeIdx: 0 };
  }
  _addCellRange(e) {
    this.state.cellSel.ranges.push({ anchor: e, focus: e }), this.state.cellSel.activeIdx = this.state.cellSel.ranges.length - 1;
  }
  _extendActiveRange(e) {
    const n = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
    n ? n.focus = e : this._setSingleCellSel(e);
  }
  clearCellSelection() {
    this.state.cellSel = { ranges: [], activeIdx: -1 }, this._applyCellSelHighlight();
  }
  _startRowDrag(e) {
    const n = Array.from(this.state.selection).map(String), r = new Set(n.includes(String(e)) ? n : [String(e)]), i = C("div", { class: "sg-drag-ghost sg-grid" }), o = C("table"), a = C("tbody");
    let l = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((d) => {
      if (r.has(d.dataset.rowId) && l < 6) {
        const p = d.cloneNode(!0);
        p.removeAttribute("data-selected"), p.querySelectorAll("td").forEach((f) => {
          f.style.left = "", f.style.right = "", f.removeAttribute("data-pinned"), f.removeAttribute("data-cell-active"), f.removeAttribute("data-cell-range");
        }), a.appendChild(p), l += 1;
      }
    }), o.appendChild(a), i.appendChild(o), r.size > l && i.appendChild(C("div", { class: "sg-drag-ghost-more" }, `+${r.size - l} more rows`)), i.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(i);
    const c = C("div", { class: "sg-drop-indicator" });
    document.body.appendChild(c), this._rowDrag = { ids: r, ghost: i, indicator: c, dropRowId: null, dropBefore: !0 }, document.body.classList.add("sg-row-dragging");
  }
  _updateDropIndicator(e) {
    const n = Array.from(this._tbody.querySelectorAll("tr[data-row-id]"));
    let r = null, i = !0;
    for (const c of n) {
      const d = c.getBoundingClientRect();
      if (e < d.top + d.height / 2) {
        r = c, i = !0;
        break;
      }
      r = c, i = !1;
    }
    if (!r) return;
    const o = r.getBoundingClientRect(), a = this._viewport.getBoundingClientRect(), l = this._rowDrag.indicator;
    l.style.left = `${a.left}px`, l.style.width = `${a.width}px`, l.style.top = `${(i ? o.top : o.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(r.dataset.rowId), this._rowDrag.dropBefore = i;
  }
  _finishRowDrag() {
    const { ids: e, ghost: n, indicator: r, dropRowId: i, dropBefore: o } = this._rowDrag;
    if (n.remove(), r.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, i == null || e.has(String(i))) return;
    const a = this.state.rowData, l = a.filter((p) => e.has(String(this._rowId(p)))), c = a.filter((p) => !e.has(String(this._rowId(p))));
    let d = c.findIndex((p) => this._rowId(p) === i);
    d < 0 ? d = c.length : o || (d += 1), c.splice(d, 0, ...l), this.state.rowData = c, this.state.sortModel = [], this.scheduleRender("data"), P(this.element, "grid:rowDragEnd", {
      ids: l.map((p) => this._rowId(p)),
      toRowId: i,
      before: o
    });
  }
  // Toggle the active/range data-attrs on the existing cell DOM without
  // rebuilding the tbody (so in-flight mouse interactions aren't disrupted).
  _applyCellSelHighlight() {
    const e = this._computeCellSelKeys();
    this._selKeys = e, this._tbody && (this._tbody.querySelectorAll("td[data-col-id]").forEach((n) => {
      const r = n.parentElement, i = `${r && r.dataset.rowId}:${n.dataset.colId}`;
      e.active === i ? n.setAttribute("data-cell-active", "true") : n.removeAttribute("data-cell-active"), e.range && e.range.has(i) ? n.setAttribute("data-cell-range", "true") : n.removeAttribute("data-cell-range");
    }), this._renderStatusBar());
  }
  // Resolve a single cell's pasted text → value (or `undefined` to reject).
  // Renderer-defined `parseValue` wins; otherwise we fall back to the type-
  // aware default that knows how to coerce numbers, booleans, dates.
  _parsePasteValue(e, n, r) {
    if (r.cellRenderer) {
      const i = xe(r.cellRenderer);
      if (i && typeof i.parseValue == "function")
        try {
          return i.parseValue(String(e ?? ""), {
            row: n,
            col: r,
            api: this.element.gridApi
          });
        } catch {
          return;
        }
    }
    return Fo(e, r);
  }
  // The clipboard-bound flip side of _parsePasteValue. Returns a string;
  // empty string is fine ("…\t\t…"). Renderer-defined `copyValue` wins;
  // otherwise we use the model's formatted display string (existing
  // behaviour — keeps non-renderer columns identical to v0).
  _copyCellValue(e, n) {
    const r = j(e, n), i = ne(e, n);
    if (n.cellRenderer) {
      const o = xe(n.cellRenderer);
      if (o && typeof o.copyValue == "function")
        try {
          const a = o.copyValue({
            value: r,
            row: e,
            col: n,
            formatted: i,
            api: this.element.gridApi
          });
          return a == null ? "" : String(a);
        } catch {
        }
    }
    return Bo(r, n, i);
  }
  // Rectangle (display indices) for a {anchor,focus} range, or null.
  _rangeRect(e) {
    if (!e) return null;
    const n = this._displayList.pageRows, r = this._visibleCols(), i = (p) => n.findIndex((f) => this._rowId(f) === p), o = (p) => r.findIndex((f) => f.field === p), a = i(e.anchor.rowId), l = o(e.anchor.colId);
    if (a < 0 || l < 0) return null;
    const c = i(e.focus.rowId), d = o(e.focus.colId);
    return {
      r0: Math.min(a, c < 0 ? a : c),
      r1: Math.max(a, c < 0 ? a : c),
      c0: Math.min(l, d < 0 ? l : d),
      c1: Math.max(l, d < 0 ? l : d),
      rows: n,
      cols: r
    };
  }
  _activeRect() {
    return this._rangeRect(this.state.cellSel.ranges[this.state.cellSel.activeIdx]);
  }
  _cellRangeRows(e = this._activeRect()) {
    if (!e) return [];
    const n = [];
    for (let r = e.r0; r <= e.r1; r++) {
      const i = e.rows[r];
      if (!i) continue;
      const o = [];
      for (let a = e.c0; a <= e.c1; a++) {
        const l = e.cols[a];
        l && o.push(this._copyCellValue(i, l));
      }
      n.push(o);
    }
    return n;
  }
  // Active cell key + union of all ranges' cells (active stays outlined, unfilled).
  _computeCellSelKeys() {
    const e = this._activeCell();
    if (!e) return { active: null, range: null };
    const n = `${e.rowId}:${e.colId}`, r = /* @__PURE__ */ new Set();
    for (const i of this.state.cellSel.ranges) {
      const o = this._rangeRect(i);
      if (o)
        for (let a = o.r0; a <= o.r1; a++) {
          const l = o.rows[a];
          if (l)
            for (let c = o.c0; c <= o.c1; c++) {
              const d = o.cols[c];
              if (!d) continue;
              const p = `${this._rowId(l)}:${d.field}`;
              p !== n && r.add(p);
            }
        }
    }
    return { active: n, range: r };
  }
  getCellSelectionDetail() {
    const e = this._activeRect();
    return {
      active: this._activeCell(),
      ranges: this.state.cellSel.ranges.length,
      rowCount: e ? e.r1 - e.r0 + 1 : 0,
      colCount: e ? e.c1 - e.c0 + 1 : 0
    };
  }
  // Row ids covered by any cell range.
  getCellSelectionRowIds() {
    const e = /* @__PURE__ */ new Set();
    for (const n of this.state.cellSel.ranges) {
      const r = this._rangeRect(n);
      if (r)
        for (let i = r.r0; i <= r.r1; i++) {
          const o = r.rows[i];
          o && e.add(this._rowId(o));
        }
    }
    return Array.from(e);
  }
  _focusGrid() {
    if (document.activeElement !== this.element && !this.element.contains(document.activeElement))
      try {
        this.element.focus({ preventScroll: !0 });
      } catch {
      }
  }
  // ----- Keyboard navigation (Numbers/Sheets-style) -----
  _navCols() {
    return this._visibleCols().filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol && !e._isMasterExpand && !e._isSpacer);
  }
  _moveActiveCell(e, n, r) {
    const i = this._displayList.pageRows, o = this._navCols();
    if (!i.length || !o.length) return;
    const a = (f, g, h) => Math.max(g, Math.min(f, h)), l = this._activeCell(), c = () => i.findIndex((f) => !f.__sgGroup && !f.__sgDetail && !f.__sgSeparator);
    let d = l ? i.findIndex((f) => this._rowId(f) === l.rowId) : c(), p = l ? o.findIndex((f) => f.field === l.colId) : 0;
    if (d < 0 && (d = c()), !(d < 0)) {
      if (p < 0 && (p = 0), r && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const f = this.state.cellSel.ranges[this.state.cellSel.activeIdx], g = a(i.findIndex((b) => this._rowId(b) === f.focus.rowId) + e, 0, i.length - 1), h = a(o.findIndex((b) => b.field === f.focus.colId) + n, 0, o.length - 1);
        this._extendActiveRange({ rowId: this._rowId(i[g]), colId: o[h].field });
      } else {
        let f = a(d + e, 0, i.length - 1);
        if (e !== 0) {
          for (; i[f] && (i[f].__sgGroup || i[f].__sgDetail || i[f].__sgSeparator); ) {
            const h = f + e;
            if (h < 0 || h >= i.length) break;
            f = h;
          }
          if (!i[f] || i[f].__sgGroup || i[f].__sgDetail || i[f].__sgSeparator) return;
        }
        const g = a(p + n, 0, o.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(i[f]), colId: o[g].field });
      }
      this._applyCellSelHighlight(), this._scrollActiveIntoView(), P(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    }
  }
  _selectAllCells() {
    const e = this._displayList.pageRows, n = this._navCols();
    !e.length || !n.length || (this.state.cellSel = {
      ranges: [{
        anchor: { rowId: this._rowId(e[0]), colId: n[0].field },
        focus: { rowId: this._rowId(e[e.length - 1]), colId: n[n.length - 1].field }
      }],
      activeIdx: 0
    }, this._applyCellSelHighlight(), P(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
  }
  // Clear the value of every selected, editable cell (Delete/Backspace).
  _clearSelectedCells() {
    let e = !1;
    for (const n of this.state.cellSel.ranges) {
      const r = this._rangeRect(n);
      if (r)
        for (let i = r.r0; i <= r.r1; i++) {
          const o = r.rows[i];
          if (!(!o || o.__sgGroup || o.__sgDetail || o.__sgSeparator))
            for (let a = r.c0; a <= r.c1; a++) {
              const l = r.cols[a];
              if (!l || !l.editable || l._isCheckbox || l._isRowNumber || l._isSpacer) continue;
              const c = o[l.field];
              c === "" || c == null || (o[l.field] = "", e = !0, P(this.element, "grid:cellValueChanged", { rowId: this._rowId(o), colId: l.field, oldValue: c, newValue: "" }));
            }
        }
    }
    return e && this.scheduleRender("cells"), e;
  }
  _scrollActiveIntoView() {
    this._tbody?.querySelector('td[data-cell-active="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  _onBodyDblClick(e) {
    const n = e.target.closest("tr"), r = e.target.closest("td");
    if (!n || !r || r.dataset.editing === "true") return;
    const i = this._coerceRowId(n.dataset.rowId), o = r.dataset.colId;
    this.startEditingCell(i, o);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const n = this.state.editing;
    if (!n) return;
    const r = this._visibleCols().filter((f) => f.editable && !f._isCheckbox), i = this._displayList.pageRows, o = i.findIndex((f) => this._rowId(f) === n.rowId), a = r.findIndex((f) => f.field === n.colId);
    if (!r.length || !i.length || o < 0 || a < 0) {
      this.stopEditing(!1);
      return;
    }
    const l = i.length * r.length, c = (o * r.length + a + e + l) % l, d = i[Math.floor(c / r.length)], p = r[c % r.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(d), p.field), requestAnimationFrame(() => {
      this._navigatingEditor = !1;
    });
  }
  // Wire editor listeners whenever a cell mounts an input.
  // Done lazily via MutationObserver on tbody (cheap because tbody is small per page).
  // ----- Helpers -----
  _visibleCols() {
    const e = this._visibleColsCore(), n = this._spacerCol(), r = e.findIndex((i) => i.pinned === "right");
    return r < 0 ? e.push(n) : e.splice(r, 0, n), e;
  }
  _visibleColsCore() {
    const e = this.state.columnDefs.filter((l) => !l.hidden), n = this.state.group?.cols || [], r = this.masterDetailValue && !this.state.pivot?.mode && !n.length;
    if (this.state.pivot?.mode && this._displayList?.pivotResultColumns?.length)
      return [{
        field: "__group",
        headerName: n.length ? n.map((c) => this._colByField(c)?.headerName || c).join(" → ") : "",
        _isGroupCol: !0,
        width: n.length ? 220 : 90,
        sortable: !1,
        filter: null,
        resizable: !1
      }, ...this._displayList.pivotResultColumns];
    if (!n.length)
      return r ? [this._masterExpandCol(), ...e] : e;
    if ((this.state.group.displayType || "singleColumn") === "singleColumn") {
      const l = new Set(n);
      return [{
        field: "__group",
        headerName: "Group",
        _isGroupCol: !0,
        width: 240,
        sortable: !1,
        filter: null,
        resizable: !1
      }, ...e.filter((d) => !l.has(d.field))];
    }
    if (this.groupReorderColumnsValue === !1) return e;
    const o = n.map((l) => e.find((c) => c.field === l)).filter(Boolean), a = new Set(o);
    return [...o, ...e.filter((l) => !a.has(l))];
  }
  // Synthetic gutter col for the master-detail expand chevron. Returned by
  // _visibleCols when masterDetail is on; rendered specially in _renderRow.
  _masterExpandCol() {
    return {
      field: "__masterExpand",
      headerName: "",
      _isMasterExpand: !0,
      width: 32,
      pinned: "left",
      sortable: !1,
      filter: null,
      resizable: !1
    };
  }
  // Synthetic trailing spacer column. Width is set by _renderColgroup to
  // `viewport - sum(other widths)` (or 0 when columns already overflow), so
  // the spacer absorbs leftover horizontal space without disturbing declared
  // column widths. Marked with _isSpacer so every structural-flag check (cell
  // selection, paste, CSV export, header chrome, …) can skip it.
  _spacerCol() {
    return {
      field: "__spacer",
      headerName: "",
      _isSpacer: !0,
      width: 0,
      sortable: !1,
      filter: null,
      resizable: !1,
      editable: !1
    };
  }
  // ----- Master/detail rows -----
  _isDetailExpanded(e) {
    return this._detailExpanded.has(String(e));
  }
  // Splice a synthetic `__sgDetail` row in directly after each expanded master
  // in the page rows. Done after buildDisplayList so detail expansion stays
  // a UI concern — the model.js pipeline doesn't need to know about it.
  _withDetailRows(e) {
    if (!this.masterDetailValue || !this._detailExpanded.size || this.state.pivot?.mode || (this.state.group.cols || []).length) return e;
    const n = [];
    for (const r of e) {
      if (n.push(r), r.__sgGroup || r.__sgDetail || r.__sgSeparator) continue;
      const i = this._rowId(r);
      this._isDetailExpanded(i) && n.push({ __sgDetail: !0, master: r, masterId: i });
    }
    return n;
  }
  toggleDetailRow(e) {
    this.masterDetailValue && (this._isDetailExpanded(e) ? this.collapseDetailRow(e) : this.expandDetailRow(e));
  }
  expandDetailRow(e) {
    if (!this.masterDetailValue) return;
    const n = String(e);
    if (this._detailExpanded.has(n)) return;
    this._detailExpanded.add(n), this.scheduleRender("cells");
    const r = this.state.rowData.find((i) => String(this._rowId(i)) === n);
    P(this.element, "grid:detailRowExpanded", { rowId: e, masterRow: r });
  }
  collapseDetailRow(e) {
    if (!this.masterDetailValue) return;
    const n = String(e);
    if (!this._detailExpanded.has(n)) return;
    this._detailExpanded.delete(n), this._detailGrids.delete(n), this.scheduleRender("cells");
    const r = this.state.rowData.find((i) => String(this._rowId(i)) === n);
    P(this.element, "grid:detailRowCollapsed", { rowId: e, masterRow: r });
  }
  expandAllDetails() {
    if (this.masterDetailValue) {
      for (const e of this.state.rowData) this._detailExpanded.add(String(this._rowId(e)));
      this.scheduleRender("cells");
    }
  }
  collapseAllDetails() {
    this.masterDetailValue && (this._detailExpanded.clear(), this._detailGrids.clear(), this.scheduleRender("cells"));
  }
  getDetailExpandedRowIds() {
    return Array.from(this._detailExpanded);
  }
  setMasterDetail(e) {
    const n = !!e;
    this.masterDetailValue !== n && (this.masterDetailValue = n, n || (this._detailExpanded.clear(), this._detailGrids.clear()), this.scheduleRender("columns"));
  }
  isMasterDetail() {
    return !!this.masterDetailValue;
  }
  toggleTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const n = String(e), r = this._isTreeRowExpanded(n, 0);
    this._treeExpanded.set(n, !r), this.scheduleRender("tree");
    const i = this.state.rowData.find((o) => String(this._rowId(o)) === n);
    P(this.element, r ? "grid:treeRowCollapsed" : "grid:treeRowExpanded", { rowId: e, row: i });
  }
  expandTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const n = String(e);
    if (this._isTreeRowExpanded(n, 0)) return;
    this._treeExpanded.set(n, !0), this.scheduleRender("tree");
    const r = this.state.rowData.find((i) => String(this._rowId(i)) === n);
    P(this.element, "grid:treeRowExpanded", { rowId: e, row: r });
  }
  collapseTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const n = String(e);
    if (!this._isTreeRowExpanded(n, 0)) return;
    this._treeExpanded.set(n, !1), this.scheduleRender("tree");
    const r = this.state.rowData.find((i) => String(this._rowId(i)) === n);
    P(this.element, "grid:treeRowCollapsed", { rowId: e, row: r });
  }
  expandAllTreeRows() {
    this.state.tree?.enabled && (this._treeExpanded.clear(), this.state.tree.defaultExpanded = -1, this.scheduleRender("tree"));
  }
  collapseAllTreeRows() {
    this.state.tree?.enabled && (this._treeExpanded.clear(), this.state.tree.defaultExpanded = 0, this.scheduleRender("tree"));
  }
  getTreeExpandedRowIds() {
    return Array.from(this._treeExpanded.entries()).filter(([, e]) => e === !0).map(([e]) => e);
  }
  setTreeData(e) {
    const n = !!e;
    this.treeDataValue !== n && (this.treeDataValue = n, this.state.tree.enabled = n, n || this._treeExpanded.clear(), this.scheduleRender("tree"), P(this.element, "grid:treeDataChanged", { treeData: n }));
  }
  isTreeData() {
    return !!this.state.tree?.enabled;
  }
  setTreeParentField(e) {
    const n = e || "parent_id";
    this.state.tree.parentField !== n && (this.state.tree.parentField = n, this.treeParentFieldValue = n, this.scheduleRender("tree"));
  }
  // Which leaf column hosts the tree indent + chevron? Defaults to the first
  // visible non-synthetic, non-gutter column when treeDisplayField isn't set.
  _treeDisplayColField() {
    const e = this.state.tree?.displayField;
    return e || this._visibleCols().find((i) => !i._isCheckbox && !i._isRowNumber && !i._isGroupCol && !i._isMasterExpand && !i._isSpacer)?.field || null;
  }
  // Build the detail <tr>: one cell spanning the full visible width, holding a
  // padded shell that hosts either a cloned <template> or a default summary
  // pulled from the master row.
  _buildDetailRow(e, n, r) {
    const i = `__d:${e.masterId}`;
    let o = r.get(i);
    const a = String(e.masterId);
    if (o) {
      if (o.getAttribute("data-master-id") === a)
        return o.classList.remove("sg-spacer"), o;
      o = null;
    }
    o || (o = C("tr")), o.className = "sg-detail-row", o.dataset.rowId = i, o.setAttribute("data-master-id", a), o.innerHTML = "";
    const l = C("td", { colspan: String(n.length || 1), class: "sg-detail-cell" }), c = C("div", { class: "sg-detail-shell" });
    return c.style.minHeight = `${this.detailRowHeightValue}px`, l.appendChild(c), o.appendChild(l), this._populateDetailShell(c, e.master, e.masterId), o;
  }
  // Fill the detail shell. Strategy: if the grid has a detail-template value
  // pointing at an existing <template>, clone its content and run a tiny
  // data-bind pass keyed off the master row. Otherwise render a minimal
  // fallback so the panel still appears (handy when the user is wiring up
  // their first detail panel and hasn't authored a template yet).
  _populateDetailShell(e, n, r) {
    const i = this.detailTemplateValue;
    let o;
    if (i) {
      const l = document.getElementById(i);
      if (l && l.tagName === "TEMPLATE") {
        const c = l.content.cloneNode(!0);
        this._applyDetailBindings(c, n), e.appendChild(c), o = e;
      }
    }
    if (!o) {
      const l = C("div", { class: "sg-detail-fallback" }), c = Object.keys(n || {}).filter((d) => !d.startsWith("_") && !d.startsWith("__")).slice(0, 6);
      for (const d of c)
        l.append(
          C("span", { class: "sg-detail-fallback-label" }, `${d}: `),
          C("span", { class: "sg-detail-fallback-value" }, String(n[d] ?? "")),
          C("span", { class: "sg-detail-fallback-sep" }, "  ·  ")
        );
      l.lastElementChild?.remove(), e.appendChild(l);
    }
    const a = e.querySelector('[data-controller~="grid"]');
    a && this._seedNestedGrid(a, n, r), queueMicrotask(() => {
      P(this.element, "grid:detailRowMounted", {
        rowId: r,
        masterRow: n,
        detailEl: e,
        nestedGridApi: a?.gridApi || null
      });
    });
  }
  // Walk the cloned template for [data-detail-bind="<field>"] (textContent),
  // [data-detail-bind-attr="<attr>:<field>"] (attribute), and [data-detail-if="<field>"]
  // (drop the node when falsy). Tiny, on purpose — anything richer belongs in
  // the consumer's own JS via grid:detailRowMounted.
  _applyDetailBindings(e, n) {
    if (!n) return;
    e.querySelectorAll("[data-detail-bind], [data-detail-bind-attr], [data-detail-if]").forEach((i) => {
      if (i.hasAttribute("data-detail-if")) {
        const o = i.getAttribute("data-detail-if");
        if (!n[o]) {
          i.remove();
          return;
        }
      }
      if (i.hasAttribute("data-detail-bind")) {
        const o = i.getAttribute("data-detail-bind");
        i.textContent = n[o] == null ? "" : String(n[o]);
      }
      if (i.hasAttribute("data-detail-bind-attr")) {
        const o = i.getAttribute("data-detail-bind-attr"), [a, l] = o.split(":");
        a && l && i.setAttribute(a, n[l] == null ? "" : String(n[l]));
      }
    });
  }
  // Seed a nested grid with the master row's detail rows before its controller
  // boots, so its first render shows the right data without an extra round
  // through scheduleRender. Cache the inner gridApi once it appears so the
  // outer grid can refresh it later if the master data is updated.
  _seedNestedGrid(e, n, r) {
    const i = this.detailRowsKeyValue;
    if (i) {
      const o = n?.[i];
      if (Array.isArray(o))
        try {
          e.setAttribute("data-grid-row-data-value", JSON.stringify(o));
        } catch {
        }
    }
    queueMicrotask(() => {
      e.gridApi && this._detailGrids.set(String(r), e.gridApi);
    });
  }
  _pinOffsets() {
    const e = this._visibleCols(), n = {};
    let r = 0;
    for (const o of e)
      o.pinned === "left" && (n[o.field] = r, r += o.width || 150);
    const i = {};
    r = 0;
    for (let o = e.length - 1; o >= 0; o--) {
      const a = e[o];
      a.pinned === "right" && (i[a.field] = r, r += a.width || 150);
    }
    return { left: n, right: i };
  }
  _colByField(e) {
    return this.state.columnDefs.find((n) => n.field === e);
  }
  _rowId(e) {
    return e?.[this.getRowIdValue] ?? e?.id ?? e;
  }
  _coerceRowId(e) {
    if (e == null) return e;
    const n = Number(e);
    return Number.isFinite(n) && String(n) === e ? n : e;
  }
}
H(Vt, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: cn },
  rowHeight: { type: Number, default: cc },
  headerHeight: { type: Number, default: 36 },
  virtual: { type: Boolean, default: !1 },
  virtualThreshold: { type: Number, default: 200 },
  height: { type: String, default: "" },
  // CSS height, e.g. '480px'
  getRowId: { type: String, default: "id" },
  // field name for row identity
  domLayout: { type: String, default: "" },
  // '' | 'autoHeight'
  serverSide: { type: Boolean, default: !1 },
  // rowData is one server page
  rowCount: { type: Number, default: 0 },
  // total rows on the server
  cellSelection: { type: Boolean, default: !0 },
  // click=cell; modifier/checkbox=row
  rowDrag: { type: Boolean, default: !1 },
  // drag selected rows by the gutter to reorder
  rowGroupCols: { type: Array, default: [] },
  // fields to group rows by (in hierarchy order)
  aggFuncs: { type: Object, default: {} },
  // { field: 'sum'|'avg'|'min'|'max'|'count'|'first'|'last' }
  groupDefaultExpanded: { type: Number, default: -1 },
  // -1 all expanded · 0 none · N first-N levels
  groupReorderColumns: { type: Boolean, default: !0 },
  // (inline mode) float grouped columns to the front while grouping
  groupDisplayType: { type: String, default: "singleColumn" },
  // 'singleColumn' (auto Group col on left) | 'inline' (label in grouped col)
  statusBar: { type: Boolean, default: !1 },
  // bottom footer: row counts + range aggregates
  statusBarAggs: { type: Array, default: ["count", "sum", "avg", "min", "max"] },
  // which aggs to show for a cell range (subset, in order)
  pivotMode: { type: Boolean, default: !1 },
  // reshape into a pivot table (rowGroupCols × pivotCols)
  pivotCols: { type: Array, default: [] },
  // fields whose unique values become columns
  sidePanel: { type: Boolean, default: !1 },
  // right-side tool panel for groups/pivots/values
  columnGroups: { type: Array, default: [] },
  // multi-row headers: [{headerName, children:[field,...]}]
  pinnedBottomRow: { type: Boolean, default: !1 },
  // sticky bottom row with grand totals (from aggFuncs)
  persistKey: { type: String, default: "" },
  // when non-empty, auto-save/restore state to localStorage under sgrid:<key>
  masterDetail: { type: Boolean, default: !1 },
  // enable expandable detail rows under each master row
  detailTemplate: { type: String, default: "" },
  // id of a <template> cloned into each expanded detail row
  detailRowsKey: { type: String, default: "" },
  // master-row field holding the array of nested detail rows
  detailRowHeight: { type: Number, default: 240 },
  // CSS pixel height for the detail-row shell
  treeData: { type: Boolean, default: !1 },
  // treat rowData as a self-referential parent/child tree
  treeParentField: { type: String, default: "parent_id" },
  // row field naming the parent row's id (default 'parent_id')
  treeDisplayField: { type: String, default: "" },
  // column whose cell carries the indent + chevron (default: first non-gutter col)
  treeDefaultExpanded: { type: Number, default: -1 },
  // -1 all expanded · 0 only roots · N first-N levels expanded
  acceptFiles: { type: Boolean, default: !1 },
  // wire every data cell as a file drop target; emits grid:fileAttached
  attachmentsField: { type: String, default: "" }
  // when set, dropped files are auto-appended to row[<field>] as { name, size, type } objects (the default behaviour when no consumer calls preventDefault on the event)
});
function hc(t, s) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const n of e) if (t[n] !== s[n]) return !1;
  return !0;
}
function mc(t) {
  return t === "number" || t === "date" ? [
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "lessThan", label: "Less than" },
    { value: "greaterThan", label: "Greater than" },
    { value: "inRange", label: "In range" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" }
  ] : t === "boolean" ? [
    { value: "equals", label: "Equals" }
  ] : [
    { value: "contains", label: "Contains" },
    { value: "notContains", label: "Not contains" },
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "startsWith", label: "Starts with" },
    { value: "endsWith", label: "Ends with" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" }
  ];
}
function bc(t, s) {
  if (s === "number") {
    const e = Number(t);
    return Number.isFinite(e) ? e : t;
  }
  if (s === "date") return t;
  if (s === "datetime") {
    if (!t) return t;
    const e = new Date(t);
    return Number.isNaN(e.getTime()) ? t : e.toISOString();
  }
  return s === "boolean" ? t === "true" ? !0 : t === "false" ? !1 : null : t;
}
function ce(t) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(t)) : String(t).replace(/["\\\n\r]/g, (s) => "\\" + s);
}
class Ft extends ie {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    H(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const n = e.clientX, r = e.clientY;
      let i = !1;
      const o = (l) => {
        const c = Math.abs(l.clientX - n), d = Math.abs(l.clientY - r);
        !i && (c > 5 || d > 5) && (i = !0, document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), this._beginReorder(n));
      }, a = (l) => {
        document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), i || this.sort(l);
      };
      document.addEventListener("mousemove", o), document.addEventListener("mouseup", a);
    });
  }
  connect() {
    if (this.grid = xo(this.element, "grid", this.application), !!this.grid) {
      if (!this.headerNameValue) {
        const e = this.element.textContent.trim();
        e && (this.headerNameValue = e);
      }
      this.grid.registerColumn(this.toColumnDef(), this.element), !this.checkboxValue && !this.rowNumberValue && this.element.addEventListener("mousedown", this._onMouseDown);
    }
  }
  disconnect() {
    this.element.removeEventListener("mousedown", this._onMouseDown), this.grid?.unregisterColumn(this.fieldValue);
  }
  toColumnDef() {
    let e;
    this.acceptFilesValue === "true" ? e = !0 : this.acceptFilesValue === "false" && (e = !1);
    let n = null;
    if (this.cellRendererConfigValue)
      try {
        n = JSON.parse(this.cellRendererConfigValue);
      } catch (i) {
        console.warn(`[stimulus_grid] invalid cellRendererConfig JSON for ${this.fieldValue}:`, i);
      }
    let r = null;
    if (this.enumValuesValue)
      try {
        r = JSON.parse(this.enumValuesValue);
      } catch (i) {
        console.warn(`[stimulus_grid] invalid enumValues JSON for ${this.fieldValue}:`, i);
      }
    return {
      field: this.fieldValue,
      headerName: this.headerNameValue || this.fieldValue,
      type: this.typeValue,
      sortable: this.sortableValue,
      filter: this.filterValue || null,
      editable: this.editableValue,
      width: this.widthValue || void 0,
      minWidth: this.minWidthValue,
      maxWidth: this.maxWidthValue,
      pinned: this.pinnedValue || null,
      hidden: this.hiddenValue,
      resizable: this.resizableValue,
      cellRenderer: this.cellRendererValue || null,
      cellEditor: this.cellEditorValue || null,
      cellRendererConfig: n,
      enumValues: r,
      _isCheckbox: this.checkboxValue,
      _isRowNumber: this.rowNumberValue,
      acceptFiles: e,
      sortable: this.rowNumberValue ? !1 : this.sortableValue,
      resizable: this.rowNumberValue ? !1 : this.resizableValue
    };
  }
  _beginReorder(e) {
    if (!this.grid) return;
    const n = this.element.parentElement, r = Array.from(n.children), i = r.indexOf(this.element);
    let o = i;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const a = (c) => {
      const d = c.clientX;
      let p = r.length;
      for (let f = 0; f < r.length; f++) {
        const g = r[f].getBoundingClientRect();
        if (d < g.left + g.width / 2) {
          p = f;
          break;
        }
      }
      o = p > i ? p - 1 : p;
    }, l = () => {
      document.removeEventListener("mousemove", a), document.removeEventListener("mouseup", l), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", o !== i && this.grid.moveColumn(this.fieldValue, o);
    };
    document.addEventListener("mousemove", a), document.addEventListener("mouseup", l);
  }
  sort(e) {
    !this.sortableValue || !this.grid || this.grid.toggleSort(this.fieldValue, e?.shiftKey === !0);
  }
  openFilter(e) {
    e?.stopPropagation(), this.grid && this.grid.openFilterFor(this.fieldValue, this.element);
  }
  // Resize: drag handle adjusts column width live.
  startResize(e) {
    if (!this.resizableValue || !this.grid) return;
    e.preventDefault(), e.stopPropagation();
    const n = e.clientX, r = this.element.offsetWidth, i = (a) => this.grid.setColumnWidth(this.fieldValue, r + (a.clientX - n)), o = () => {
      document.removeEventListener("mousemove", i), document.removeEventListener("mouseup", o), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", i), document.addEventListener("mouseup", o), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
H(Ft, "values", {
  field: String,
  headerName: { type: String, default: "" },
  type: { type: String, default: "text" },
  // text|number|date|boolean
  sortable: { type: Boolean, default: !1 },
  filter: { type: String, default: "" },
  // ''|text|number|date|boolean|set
  editable: { type: Boolean, default: !1 },
  width: { type: Number, default: 0 },
  minWidth: { type: Number, default: 40 },
  maxWidth: { type: Number, default: 4e3 },
  pinned: { type: String, default: "" },
  // ''|left|right
  hidden: { type: Boolean, default: !1 },
  resizable: { type: Boolean, default: !0 },
  cellRenderer: { type: String, default: "" },
  cellEditor: { type: String, default: "" },
  // JSON config for the cell renderer (options, colorMap, etc.). Lets
  // server-side column declarations (the Rails gem) configure built-in
  // renderers like `select` / `multiselect` without a separate JS
  // registerRenderer() call per column. Renderers read it as
  // `col.cellRendererConfig` (parsed object) inside their ctx.
  cellRendererConfig: { type: String, default: "" },
  // Server-side enum_values surface for select / multiselect / combobox.
  // JSON array of strings or { value, label, color } objects. Renderers
  // fall back to this when cellRendererConfig.options is not set.
  enumValues: { type: String, default: "" },
  checkbox: { type: Boolean, default: !1 },
  rowNumber: { type: Boolean, default: !1 },
  // gutter: shows 1-based row number, click selects row
  // Per-column opt-out for drag-to-attach. Defaults to undefined (inherits
  // the grid-wide acceptFiles setting); explicit false suppresses the drop
  // visual + grid:fileAttached event for this column.
  acceptFiles: { type: String, default: "" }
  // '' | 'true' | 'false'
});
class qi extends ie {
  connect() {
  }
}
class Yi extends ie {
  connect() {
  }
}
class Zi extends ie {
  connect() {
  }
}
class at extends ie {
  constructor() {
    super(...arguments);
    H(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const n = e.paginationGetCurrentPage(), r = e.paginationGetTotalPages(), i = e.paginationGetRowCount(), o = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const a = i === 0 ? 0 : n * o + 1, l = Math.min(i, a + o - 1);
        this.pageInfoTarget.textContent = i === 0 ? "0 rows" : `${a}–${l} of ${i}`;
      }
      this.hasFirstTarget && (this.firstTarget.disabled = n === 0), this.hasPrevTarget && (this.prevTarget.disabled = n === 0), this.hasNextTarget && (this.nextTarget.disabled = n >= r - 1), this.hasLastTarget && (this.lastTarget.disabled = n >= r - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(o));
    });
  }
  connect() {
    this.element.classList.add("sg-pagination-bar"), this.hasGridOutlet && this._wire(this.gridOutletElement);
  }
  disconnect() {
    this._gridEl && this._unwire(this._gridEl);
  }
  gridOutletConnected(e, n) {
    this._wire(n);
  }
  gridOutletDisconnected(e, n) {
    this._unwire(n);
  }
  _wire(e) {
    this._gridEl = e;
    for (const n of ["grid:paginationChanged", "grid:rowDataChanged", "grid:filterChanged", "grid:ready"])
      e.addEventListener(n, this._refresh);
    e.gridApi && this._refresh();
  }
  _unwire(e) {
    for (const n of ["grid:paginationChanged", "grid:rowDataChanged", "grid:filterChanged", "grid:ready"])
      e.removeEventListener(n, this._refresh);
    this._gridEl = null;
  }
  first() {
    this._gridEl?.gridApi?.paginationGoToFirstPage();
  }
  prev() {
    this._gridEl?.gridApi?.paginationGoToPreviousPage();
  }
  next() {
    this._gridEl?.gridApi?.paginationGoToNextPage();
  }
  last() {
    this._gridEl?.gridApi?.paginationGoToLastPage();
  }
  changeSize(e) {
    const n = parseInt(e.target.value, 10);
    Number.isFinite(n) && n > 0 && this._gridEl?.gridApi?.paginationSetPageSize(n);
  }
}
H(at, "outlets", ["grid"]), H(at, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
const vt = ["sum", "avg", "count", "min", "max"], yc = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', wc = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class Xi extends ie {
  connect() {
    this.grid = this.element.closest(".sg-grid"), this._activeTab = "columns", this._collapsed = !1, this._build(), this.grid?.gridApi ? this._render() : this.grid && this.grid.addEventListener("grid:ready", () => this._render(), { once: !0 }), this._gridListener = () => this._render();
    for (const s of [
      "grid:columnRowGroupChanged",
      "grid:columnPivotChanged",
      "grid:columnValueChanged",
      "grid:pivotModeChanged",
      "grid:columnVisible",
      "grid:rowDataChanged",
      "grid:columnStateApplied"
    ]) this.grid?.addEventListener(s, this._gridListener);
  }
  disconnect() {
    if (!(!this.grid || !this._gridListener))
      for (const s of [
        "grid:columnRowGroupChanged",
        "grid:columnPivotChanged",
        "grid:columnValueChanged",
        "grid:pivotModeChanged",
        "grid:columnVisible",
        "grid:rowDataChanged",
        "grid:columnStateApplied"
      ]) this.grid.removeEventListener(s, this._gridListener);
  }
  // ----- Skeleton -----
  _build() {
    this.element.innerHTML = "", this._content = C("div", { class: "sg-side-panel-content" });
    const s = C("div", { class: "sg-side-panel-tabs" });
    this._columnsTab = C("button", {
      type: "button",
      class: "sg-side-panel-tab",
      "aria-pressed": "true",
      title: "Columns"
    }), this._columnsTab.innerHTML = yc, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), s.appendChild(this._columnsTab), this.element.append(this._content, s);
  }
  _onTabClick(s) {
    this._activeTab === s && !this._collapsed ? (this._collapsed = !0, this.element.classList.add("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", "false")) : (this._collapsed = !1, this._activeTab = s, this.element.classList.remove("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", s === "columns" ? "true" : "false"), this._render());
  }
  // ----- Helpers -----
  _api() {
    return this.grid?.gridApi;
  }
  // Real (non-synthetic) columns the user can manipulate.
  _columns() {
    return (this._api()?.getColumnDefs() || []).filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol && !e._isPivot);
  }
  _colByField(s) {
    return (this._api()?.getColumnDefs() || []).find((e) => e.field === s);
  }
  // ----- Render -----
  _render() {
    if (this._collapsed || this._activeTab !== "columns") return;
    const s = this._api();
    if (!s) return;
    this._content.innerHTML = "";
    const e = C("label", { class: "sg-panel-pivot-toggle" }), n = C("input", { type: "checkbox" });
    n.checked = s.isPivotMode(), n.addEventListener("change", () => s.setPivotMode(n.checked)), e.append(n, C("span", {}, "Pivot mode")), this._content.appendChild(e), this._content.appendChild(this._renderColumnsList()), this._content.appendChild(this._renderDropSection({
      title: "Row Groups",
      placeholder: "Drag here to group rows",
      kind: "rowGroup",
      fields: s.getRowGroupColumns()
    })), this._content.appendChild(this._renderValuesSection()), s.isPivotMode() && this._content.appendChild(this._renderDropSection({
      title: "Column Labels",
      placeholder: "Drag here to pivot columns",
      kind: "pivot",
      fields: s.getPivotColumns()
    }));
  }
  _renderColumnsList() {
    const s = this._api(), e = C("div", { class: "sg-panel-section" });
    e.appendChild(C("div", { class: "sg-panel-section-title" }, "Columns"));
    const n = C("ul", { class: "sg-column-list" });
    e.appendChild(n);
    const r = new Set(s.getRowGroupColumns()), i = new Set(s.getPivotColumns()), o = new Map(s.getValueColumns().map((a) => [a.field, a.aggFunc]));
    for (const a of this._columns()) {
      const l = C("li", { class: "sg-column-list-item", draggable: "true" });
      l.dataset.field = a.field;
      const c = C("span", { class: "sg-column-grip", "aria-hidden": "true" });
      c.innerHTML = wc;
      const d = C("input", { type: "checkbox" });
      d.checked = !a.hidden, d.addEventListener("change", () => s.setColumnVisible(a.field, d.checked));
      const p = C("span", { class: "sg-column-list-label" }, a.headerName || a.field), f = C("span", { class: "sg-column-list-tags" });
      r.has(a.field) && f.appendChild(C("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), i.has(a.field) && f.appendChild(C("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), o.has(a.field) && f.appendChild(C("span", { class: "sg-tag sg-tag-value", title: `Value (${o.get(a.field)})` }, o.get(a.field))), l.append(c, d, p, f), this._wireDragSource(l, a.field), n.appendChild(l);
    }
    return this._wireDropZone(n, "columns"), e;
  }
  _renderDropSection({ title: s, placeholder: e, kind: n, fields: r }) {
    const i = C("div", { class: "sg-panel-section sg-panel-drop" });
    i.appendChild(C("div", { class: "sg-panel-section-title" }, s));
    const o = C("div", { class: "sg-drop-zone" });
    if (o.dataset.dropKind = n, !r.length)
      o.classList.add("sg-drop-zone-empty"), o.appendChild(C("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const a of r) o.appendChild(this._renderChip(n, a));
    return this._wireDropZone(o, n), i.appendChild(o), i;
  }
  _renderValuesSection() {
    const s = this._api(), e = C("div", { class: "sg-panel-section sg-panel-drop" });
    e.appendChild(C("div", { class: "sg-panel-section-title" }, "Values"));
    const n = C("div", { class: "sg-drop-zone" });
    n.dataset.dropKind = "value";
    const r = s.getValueColumns();
    if (!r.length)
      n.classList.add("sg-drop-zone-empty"), n.appendChild(C("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
    else
      for (const { field: i, aggFunc: o } of r) n.appendChild(this._renderValueChip(i, o));
    return this._wireDropZone(n, "value"), e.appendChild(n), e;
  }
  _renderChip(s, e) {
    const n = this._colByField(e), r = C("span", { class: "sg-chip", draggable: "true" });
    return r.dataset.field = e, r.dataset.fromKind = s, r.append(
      C("span", { class: "sg-chip-label" }, n?.headerName || e),
      this._removeButton(() => this._removeFrom(s, e))
    ), this._wireDragSource(r, e), r;
  }
  _renderValueChip(s, e) {
    const n = this._api(), r = this._colByField(s), i = C("span", { class: "sg-chip sg-chip-value", draggable: "true" });
    i.dataset.field = s, i.dataset.fromKind = "value";
    const o = C("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return o.addEventListener("click", (a) => {
      a.stopPropagation();
      const l = vt.indexOf(e), c = vt[(l === -1 ? 0 : l + 1) % vt.length];
      n.setColumnAggFunc(s, c);
    }), i.append(
      o,
      C("span", { class: "sg-chip-label" }, r?.headerName || s),
      this._removeButton(() => n.removeValueColumn(s))
    ), this._wireDragSource(i, s), i;
  }
  _removeButton(s) {
    const e = C("button", { type: "button", class: "sg-chip-remove", "aria-label": "Remove", title: "Remove" });
    return e.textContent = "×", e.addEventListener("click", (n) => {
      n.stopPropagation(), s();
    }), e;
  }
  // ----- DnD plumbing -----
  _wireDragSource(s, e) {
    s.addEventListener("dragstart", (n) => {
      n.dataTransfer.effectAllowed = "move", n.dataTransfer.setData("text/plain", e), s.classList.add("sg-dragging");
    }), s.addEventListener("dragend", () => s.classList.remove("sg-dragging"));
  }
  _wireDropZone(s, e) {
    s.addEventListener("dragover", (n) => {
      n.preventDefault(), n.dataTransfer.dropEffect = "move", s.classList.add("sg-drop-over");
    }), s.addEventListener("dragleave", (n) => {
      n.target === s && s.classList.remove("sg-drop-over");
    }), s.addEventListener("drop", (n) => {
      n.preventDefault(), s.classList.remove("sg-drop-over");
      const r = n.dataTransfer.getData("text/plain");
      r && this._handleDrop(e, r);
    });
  }
  // A field lives in at most one of {rowGroup, pivot, value} at a time.
  // Dropping on a zone removes it from the others first.
  _handleDrop(s, e) {
    const n = this._api();
    if (s === "columns") {
      this._removeEverywhere(e);
      return;
    }
    this._removeEverywhere(e, s), s === "rowGroup" ? n.addRowGroupColumn(e) : s === "pivot" ? n.addPivotColumn(e) : s === "value" && n.addValueColumn(e, "sum");
  }
  _removeFrom(s, e) {
    const n = this._api();
    s === "rowGroup" ? n.removeRowGroupColumn(e) : s === "pivot" ? n.removePivotColumn(e) : s === "value" && n.removeValueColumn(e);
  }
  _removeEverywhere(s, e = null) {
    const n = this._api();
    e !== "rowGroup" && n.removeRowGroupColumn(s), e !== "pivot" && n.removePivotColumn(s), e !== "value" && n.removeValueColumn(s);
  }
}
function vc(t) {
  const s = t ?? eo.start();
  return s.register("grid", Vt), s.register("header-cell", Ft), s.register("row", qi), s.register("cell", Yi), s.register("filter", Zi), s.register("pagination", at), s.register("side-panel", Xi), s;
}
const _c = {
  start: vc,
  GridController: Vt,
  HeaderCellController: Ft,
  RowController: qi,
  CellController: Yi,
  FilterController: Zi,
  PaginationController: at,
  SidePanelController: Xi,
  registerRenderer: v,
  getRenderer: xe,
  listRenderers: Io,
  renderers: lc
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = _c);
export {
  Yi as CellController,
  Zi as FilterController,
  Vt as GridController,
  Ft as HeaderCellController,
  at as PaginationController,
  qi as RowController,
  Xi as SidePanelController,
  _c as default,
  xe as getRenderer,
  Io as listRenderers,
  v as registerRenderer,
  lc as renderers,
  vc as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
