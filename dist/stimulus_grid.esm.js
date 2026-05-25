var Qn = Object.defineProperty;
var Jn = (n, r, e) => r in n ? Qn(n, r, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[r] = e;
var N = (n, r, e) => Jn(n, typeof r != "symbol" ? r + "" : r, e);
import { Controller as K, Application as Zn } from "@hotwired/stimulus";
function V(n, r) {
  return typeof r.valueGetter == "function" ? r.valueGetter(n) : n?.[r.field];
}
function G(n, r) {
  const e = V(n, r);
  return typeof r.valueFormatter == "function" ? r.valueFormatter(e, n) : e == null ? "" : r.type === "date" && e instanceof Date ? e.toLocaleDateString() : r.type === "boolean" ? e ? "✓" : "" : String(e);
}
const ut = {
  contains: (n, r) => String(n ?? "").toLowerCase().includes(String(r ?? "").toLowerCase()),
  notContains: (n, r) => !String(n ?? "").toLowerCase().includes(String(r ?? "").toLowerCase()),
  equals: (n, r) => String(n ?? "").toLowerCase() === String(r ?? "").toLowerCase(),
  notEqual: (n, r) => String(n ?? "").toLowerCase() !== String(r ?? "").toLowerCase(),
  startsWith: (n, r) => String(n ?? "").toLowerCase().startsWith(String(r ?? "").toLowerCase()),
  endsWith: (n, r) => String(n ?? "").toLowerCase().endsWith(String(r ?? "").toLowerCase()),
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
}, es = {
  equals: (n, r) => Number(n) === Number(r),
  notEqual: (n, r) => Number(n) !== Number(r),
  lessThan: (n, r) => Number(n) < Number(r),
  lessThanOrEqual: (n, r) => Number(n) <= Number(r),
  greaterThan: (n, r) => Number(n) > Number(r),
  greaterThanOrEqual: (n, r) => Number(n) >= Number(r),
  inRange: (n, r, e) => Number(n) >= Number(r) && Number(n) <= Number(e),
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
};
function B(n) {
  if (n == null || n === "") return null;
  if (n instanceof Date) return n;
  const r = new Date(n);
  return Number.isNaN(r.valueOf()) ? null : r;
}
const ts = {
  equals: (n, r) => B(n)?.toDateString() === B(r)?.toDateString(),
  notEqual: (n, r) => B(n)?.toDateString() !== B(r)?.toDateString(),
  lessThan: (n, r) => (B(n)?.valueOf() ?? -1 / 0) < (B(r)?.valueOf() ?? 1 / 0),
  greaterThan: (n, r) => (B(n)?.valueOf() ?? 1 / 0) > (B(r)?.valueOf() ?? -1 / 0),
  inRange: (n, r, e) => {
    const t = B(n)?.valueOf();
    return t != null && t >= (B(r)?.valueOf() ?? -1 / 0) && t <= (B(e)?.valueOf() ?? 1 / 0);
  },
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
}, ns = {
  equals: (n, r) => r === "true" ? !!n : r === "false" ? !n : !0
}, ss = {
  in: (n, r) => Array.isArray(r) && r.includes(String(n ?? ""))
}, rs = { text: ut, number: es, date: ts, boolean: ns, set: ss };
function pt(n, r, e) {
  if (!e) return !0;
  const t = e.filterType || r.filter || "text", i = (rs[t] || ut)[e.type];
  if (!i) return !0;
  const o = V(n, r);
  return i(o, e.value, e.value2);
}
function ft(n, r, e) {
  const t = Object.entries(r || {}).filter(([, s]) => s != null);
  return t.length === 0 ? n : n.filter((s) => s && s.__sgSeparator ? !0 : t.every(([i, o]) => {
    const a = e[i];
    return a ? pt(s, a, o) : !0;
  }));
}
function ht(n, r, e) {
  if (!r) return n;
  const t = String(r).toLowerCase();
  return n.filter((s) => {
    if (s && s.__sgSeparator) return !0;
    for (const i of e) {
      const o = G(s, i);
      if (o && String(o).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function j(n, r, e) {
  if (n == null && r == null) return 0;
  if (n == null) return -1;
  if (r == null) return 1;
  if (e === "number") return Number(n) - Number(r);
  if (e === "date") {
    const t = B(n)?.valueOf() ?? 0, s = B(r)?.valueOf() ?? 0;
    return t - s;
  }
  return e === "boolean" ? n === r ? 0 : n ? 1 : -1 : String(n).localeCompare(String(r), void 0, { numeric: !0, sensitivity: "base" });
}
function is(n, r, e) {
  if (!r || r.length === 0) return n;
  const t = (l, d) => {
    for (const { colId: c, sort: u } of r) {
      const p = e[c];
      if (!p) continue;
      const f = V(l, p), g = V(d, p), _ = typeof p.comparator == "function" ? p.comparator(f, g, l, d) : j(f, g, p.type);
      if (_ !== 0) return u === "desc" ? -_ : _;
    }
    return 0;
  };
  if (!n.some((l) => l && l.__sgSeparator)) return n.slice().sort(t);
  const i = [];
  let o = [];
  const a = () => {
    if (o.length) {
      o.sort(t);
      for (const l of o) i.push(l);
      o = [];
    }
  };
  for (const l of n)
    l && l.__sgSeparator ? (a(), i.push(l)) : o.push(l);
  return a(), i;
}
function ce(n, r) {
  if (!r || !r.enabled) return { rows: n, total: n.length, pageRows: n };
  const e = n.length, t = Math.max(1, Math.ceil(e / r.pageSize)), s = Math.min(r.page, t - 1), i = s * r.pageSize, o = n.slice(i, i + r.pageSize);
  return { rows: n, total: e, totalPages: t, page: s, pageRows: o };
}
function gt(n, r, e) {
  if (n === "count") return r.length;
  const t = r.map((i) => V(i, e));
  if (n === "first") return t.length ? t[0] : null;
  if (n === "last") return t.length ? t[t.length - 1] : null;
  const s = t.map(Number).filter((i) => !Number.isNaN(i));
  switch (n) {
    case "sum":
      return s.reduce((i, o) => i + o, 0);
    case "avg":
      return s.length ? s.reduce((i, o) => i + o, 0) / s.length : null;
    case "min":
      return s.length ? Math.min(...s) : null;
    case "max":
      return s.length ? Math.max(...s) : null;
    default:
      return null;
  }
}
function ge(n, r, e) {
  const t = {};
  for (const [s, i] of Object.entries(r || {})) {
    const o = e[s];
    o && (t[s] = gt(i, n, o));
  }
  return t;
}
function os(n) {
  let r = 0, e = 0, t = 0, s = 1 / 0, i = -1 / 0;
  for (const o of n) {
    if (o == null || o === "") continue;
    r += 1;
    let a = null;
    if (typeof o == "number" && Number.isFinite(o)) a = o;
    else if (typeof o == "string" && o.trim() !== "") {
      const l = Number(o);
      Number.isFinite(l) && (a = l);
    }
    a != null && (e += 1, t += a, a < s && (s = a), a > i && (i = a));
  }
  return {
    count: r,
    sum: e ? t : null,
    avg: e ? t / e : null,
    min: e ? s : null,
    max: e ? i : null
  };
}
function as(n, r, e, t, s = () => !0) {
  const i = (d, c, u) => {
    const p = r[c], f = /* @__PURE__ */ new Map();
    for (const g of d) {
      const _ = V(g, p), y = _ == null ? "" : String(_);
      f.has(y) || f.set(y, { value: _, rows: [] }), f.get(y).rows.push(g);
    }
    return Array.from(f.values()).sort((g, _) => j(g.value, _.value, p.type)).map(({ value: g, rows: _ }) => {
      const y = g == null ? "" : String(g), L = u ? `${u}|${p.field}=${y}` : `${p.field}=${y}`;
      return {
        __sgGroup: !0,
        level: c,
        field: p.field,
        value: g,
        groupId: L,
        count: _.length,
        aggregates: ge(_, t, e),
        leaves: _,
        children: c + 1 < r.length ? i(_, c + 1, L) : null
      };
    });
  }, o = i(n, 0, ""), a = [], l = (d) => {
    for (const c of d)
      if (a.push(c), !!s(c.groupId, c.level))
        if (c.children) l(c.children);
        else for (const u of c.leaves) a.push(u);
  };
  return l(o), { displayList: a, tree: o };
}
function mt(n, r, e) {
  return `__p|${e.map((s) => {
    const i = n[s.field];
    return `${s.field}=${i == null ? "" : String(i)}`;
  }).join("|")}|${r.col.field}:${r.aggFunc}`;
}
function bt(n, r) {
  return r.map((e) => {
    const t = V(n, e);
    return t == null ? "" : String(t);
  }).join("");
}
function ls(n, r) {
  if (!r?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const t of n) {
    const s = bt(t, r);
    if (!e.has(s)) {
      const i = {};
      r.forEach((o) => {
        const a = V(t, o);
        i[o.field] = a ?? null;
      }), e.set(s, i);
    }
  }
  return Array.from(e.values()).sort((t, s) => {
    for (const i of r) {
      const o = j(t[i.field], s[i.field], i.type);
      if (o !== 0) return o;
    }
    return 0;
  });
}
function ds(n, r, e) {
  if (!n.length || !r.length) return [];
  const t = [], s = r.length === 1;
  for (const i of n)
    for (const o of r) {
      const a = mt(i, o, e), l = e.map((c) => i[c.field] == null ? "(Blank)" : String(i[c.field])).join(" · "), d = s ? l : `${l} · ${o.aggFunc}(${o.col.field})`;
      t.push({
        field: a,
        headerName: d,
        type: "number",
        width: 100,
        sortable: !0,
        filter: null,
        resizable: !1,
        _isPivot: !0,
        pivotKeys: { ...i },
        valueField: o.col.field,
        aggFunc: o.aggFunc,
        valueGetter: (c) => c?.__pivotValues?.[a] ?? null
      });
    }
  return t;
}
function cs(n) {
  return typeof n == "string" && n.startsWith("__p|");
}
function us(n, r) {
  const e = Array.isArray(n) ? n.filter((t) => t && t.colId && t.sort) : [];
  return (t, s) => {
    for (const i of e) {
      const o = i.sort === "desc" ? -1 : 1;
      if (cs(i.colId)) {
        const a = t.__pivotValues ? t.__pivotValues[i.colId] : null, l = s.__pivotValues ? s.__pivotValues[i.colId] : null, d = j(a, l, "number");
        if (d !== 0) return o * d;
        continue;
      }
      if (r && i.colId === r.field) {
        const a = j(t.value, s.value, r.type);
        if (a !== 0) return o * a;
        continue;
      }
    }
    return j(t.value, s.value, r?.type);
  };
}
function Xe(n, r, e, t) {
  const s = {}, i = /* @__PURE__ */ new Map();
  for (const o of n) {
    const a = bt(o, t);
    i.has(a) || i.set(a, []), i.get(a).push(o);
  }
  for (const o of r) {
    const a = t.map((d) => {
      const c = o[d.field];
      return c == null ? "" : String(c);
    }).join(""), l = i.get(a) || [];
    for (const d of e) {
      const c = mt(o, d, t);
      s[c] = l.length ? gt(d.aggFunc, l, d.col) : null;
    }
  }
  return s;
}
function ps({ rows: n, rowGroupCols: r = [], pivotCols: e, valueConfigs: t, isExpanded: s = () => !0, sortModel: i = [] }) {
  const o = ls(n, e), a = ds(o, t, e), l = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: n.length,
    aggregates: {},
    leaves: n,
    __pivotValues: Xe(n, o, t, e)
  };
  if (!r.length)
    return { columns: a, displayList: [l], tree: [], combos: o };
  const d = (f, g, _) => {
    const y = r[g], L = /* @__PURE__ */ new Map();
    for (const w of f) {
      const S = V(w, y), A = S == null ? "" : String(S);
      L.has(A) || L.set(A, { value: S, rows: [] }), L.get(A).rows.push(w);
    }
    const m = Array.from(L.values()).map(({ value: w, rows: S }) => {
      const A = w == null ? "" : String(w), k = _ ? `${_}|${y.field}=${A}` : `${y.field}=${A}`;
      return {
        __sgGroup: !0,
        level: g,
        field: y.field,
        value: w,
        groupId: k,
        count: S.length,
        aggregates: {},
        leaves: S,
        __pivotValues: Xe(S, o, t, e),
        children: g + 1 < r.length ? d(S, g + 1, k) : null
      };
    }), v = us(i, y);
    return m.sort(v);
  }, c = d(n, 0, ""), u = [l], p = (f) => {
    for (const g of f)
      u.push(g), s(g.groupId, g.level) && g.children && p(g.children);
  };
  return p(c), { columns: a, displayList: u, tree: c, combos: o };
}
function fs(n, { pivotCols: r = [], valueConfigs: e = [], columnGroups: t = null } = {}) {
  if (n._isPivot && r.length && n.pivotKeys)
    return hs(n, r, e);
  if (t && Array.isArray(t) && t.length && !n._isGroupCol && !n._isCheckbox && !n._isRowNumber) {
    for (const s of t)
      if (s?.children && s.children.includes(n.field))
        return [
          { kind: "group", id: `g:${s.headerName}`, label: s.headerName },
          { kind: "leaf", col: n }
        ];
  }
  return [{ kind: "leaf", col: n }];
}
function hs(n, r, e) {
  const t = (e?.length || 0) > 1, s = [];
  for (let i = 0; i < r.length; i++) {
    const o = r[i].field, a = n.pivotKeys[o];
    if (i === r.length - 1 && !t)
      return s.push({ kind: "leaf", col: n, label: a == null ? "(Blank)" : String(a) }), s;
    s.push({
      kind: "group",
      id: `p:${i}:${a == null ? "" : String(a)}`,
      label: a == null ? "(Blank)" : String(a)
    });
  }
  return s.push({ kind: "leaf", col: n, label: `${n.aggFunc}(${n.valueField})` }), s;
}
function gs(n, r = {}) {
  if (!n.length) return { rows: [[]], depth: 1 };
  const e = n.map((i) => fs(i, r).slice()), t = Math.max(1, ...e.map((i) => i.length)), s = [];
  for (let i = 0; i < t; i++) {
    const o = [];
    let a = 0;
    for (; a < e.length; ) {
      const l = e[a];
      if (i >= l.length || l[i] === null) {
        a += 1;
        continue;
      }
      const d = l[i];
      if (d.kind === "leaf") {
        o.push({ kind: "leaf", col: d.col, label: d.label, rowspan: t - i, colspan: 1 });
        for (let u = i + 1; u < t; u++) l[u] = null;
        a += 1;
        continue;
      }
      let c = a + 1;
      for (; c < e.length; ) {
        const u = e[c];
        if (i >= u.length || !u[i] || u[i].kind !== "group" || u[i].id !== d.id) break;
        let p = !0;
        for (let f = 0; f < i; f++) {
          const g = l[f]?.id ?? null, _ = u[f]?.id ?? null;
          if (g !== _) {
            p = !1;
            break;
          }
        }
        if (!p) break;
        c += 1;
      }
      o.push({ kind: "group", label: d.label, colspan: c - a, rowspan: 1 }), a = c;
    }
    s.push(o);
  }
  return { rows: s, depth: t };
}
function ms({
  rows: n,
  parentField: r = "parent_id",
  getRowId: e = (o) => o?.id,
  passesFilter: t = null,
  siblingComparator: s = null,
  isExpanded: i = () => !0
} = {}) {
  if (!Array.isArray(n) || n.length === 0)
    return { displayList: [], treeMeta: /* @__PURE__ */ new Map() };
  const o = (y) => {
    const L = e(y);
    return L == null ? null : String(L);
  }, a = /* @__PURE__ */ new Map();
  for (const y of n) {
    const L = o(y);
    L != null && a.set(L, y);
  }
  const l = /* @__PURE__ */ new Map(), d = [];
  for (const y of n) {
    const L = o(y), m = y?.[r], v = m == null ? null : String(m);
    v == null || v === L || !a.has(v) ? d.push(y) : (l.has(v) || l.set(v, []), l.get(v).push(y));
  }
  const c = t ? new Map(n.map((y) => [o(y), !!t(y)])) : null, u = /* @__PURE__ */ new Map(), p = (y, L) => {
    const m = o(y);
    if (m == null) return !1;
    if (u.has(m)) return u.get(m);
    if (L.has(m)) return !1;
    L.add(m);
    let v = !!c.get(m);
    const w = l.get(m) || [];
    for (const S of w) v = p(S, L) || v;
    return L.delete(m), u.set(m, v), v;
  };
  if (c)
    for (const y of d) p(y, /* @__PURE__ */ new Set());
  const f = [], g = /* @__PURE__ */ new Map(), _ = (y, L, m, v) => {
    const w = c ? y.filter((S) => v || u.get(o(S))) : y.slice();
    s && w.sort(s);
    for (const S of w) {
      const A = o(S);
      if (A == null || m.has(A)) continue;
      const k = l.get(A) || [], C = v || (c ? !!c.get(A) : !1), T = c ? k.filter((P) => C || u.get(o(P))) : k, R = T.length > 0, $ = R && (c ? !0 : !!i(A, L));
      g.set(A, { level: L, hasChildren: R, expanded: $ }), f.push(S), $ && (m.add(A), _(T, L + 1, m, C), m.delete(A));
    }
  };
  return _(d, 0, /* @__PURE__ */ new Set(), !1), { displayList: f, treeMeta: g };
}
function bs(n) {
  if (n.serverSide) {
    const c = n.rowData, u = n.pagination?.pageSize || c.length || 1, p = n.serverRowCount ?? c.length, f = Math.max(1, Math.ceil(p / u)), g = Math.min(n.pagination?.page || 0, f - 1);
    return { filteredSorted: c, rows: c, total: p, totalPages: f, page: g, pageRows: c };
  }
  const r = Object.fromEntries(n.columnDefs.map((c) => [c.field, c])), e = n.columnDefs.filter((c) => !c.hidden && !c._isCheckbox), t = (n.rowGroupCols || []).filter((c) => r[c]);
  if (n.treeData && !n.pivotMode && t.length === 0) {
    const c = n.treeParentField || "parent_id", u = Object.entries(n.filterModel || {}).filter(([, S]) => S != null), p = n.quickFilter ? String(n.quickFilter).toLowerCase() : "", g = u.length > 0 || p !== "" ? (S) => {
      for (const [A, k] of u) {
        const C = r[A];
        if (C && !pt(S, C, k)) return !1;
      }
      if (p) {
        let A = !1;
        for (const k of e) {
          const C = G(S, k);
          if (C && String(C).toLowerCase().includes(p)) {
            A = !0;
            break;
          }
        }
        if (!A) return !1;
      }
      return !0;
    } : null, _ = Array.isArray(n.sortModel) ? n.sortModel : [], y = _.length ? (S, A) => {
      for (const { colId: k, sort: C } of _) {
        const T = r[k];
        if (!T) continue;
        const R = V(S, T), $ = V(A, T), P = typeof T.comparator == "function" ? T.comparator(R, $, S, A) : j(R, $, T.type);
        if (P !== 0) return C === "desc" ? -P : P;
      }
      return 0;
    } : null, L = n.getRowId || ((S) => S?.id), { displayList: m, treeMeta: v } = ms({
      rows: n.rowData,
      parentField: c,
      getRowId: L,
      passesFilter: g,
      siblingComparator: y,
      isExpanded: n.isTreeRowExpanded || (() => !0)
    }), w = ce(m, n.pagination);
    return {
      tree: !0,
      treeData: !0,
      treeMeta: v,
      treeParentField: c,
      filteredSorted: m,
      ...w
    };
  }
  let s = n.rowData;
  s = ft(s, n.filterModel, r), s = ht(s, n.quickFilter, e), s = is(s, n.sortModel, r);
  const i = t, o = n.pivotMode ? (n.pivotCols || []).filter((c) => r[c]) : [], a = n.pivotMode ? Object.entries(n.aggModel || {}).filter(([c]) => r[c]).map(([c, u]) => ({ col: r[c], aggFunc: u })) : [];
  if (n.pivotMode && o.length && a.length) {
    const c = i.map((L) => r[L]), u = o.map((L) => r[L]), { columns: p, displayList: f, tree: g, combos: _ } = ps({
      rows: s,
      rowGroupCols: c,
      pivotCols: u,
      valueConfigs: a,
      isExpanded: n.isGroupExpanded,
      sortModel: n.sortModel
    }), y = ce(f, n.pagination);
    return {
      pivot: !0,
      pivotResultColumns: p,
      combos: _,
      grouped: !0,
      tree: g,
      leafCount: s.length,
      grandTotals: ge(s, n.aggModel, r),
      filteredSorted: f,
      ...y
    };
  }
  if (i.length) {
    const c = i.map((g) => r[g]), { displayList: u, tree: p } = as(
      s,
      c,
      r,
      n.aggModel,
      n.isGroupExpanded
    ), f = ce(u, n.pagination);
    return {
      grouped: !0,
      tree: p,
      leafCount: s.length,
      grandTotals: ge(s, n.aggModel, r),
      filteredSorted: u,
      ...f
    };
  }
  const l = ce(s, n.pagination), d = n.aggModel && Object.keys(n.aggModel).length ? ge(s, n.aggModel, r) : null;
  return { filteredSorted: s, grandTotals: d, ...l };
}
function _s(n, r, e, t, s = 6) {
  const i = Math.ceil(r / e), o = Math.max(0, Math.floor(n / e) - s), a = Math.min(t, o + i + s * 2);
  return { first: o, last: a };
}
function ys(n) {
  return {
    // ---- Data ----
    setRowData(r) {
      n.setRowData(r);
    },
    getRowData() {
      return n.state.rowData.slice();
    },
    applyTransaction(r) {
      return n.applyTransaction(r);
    },
    // Server-side row model
    setRowCount(r) {
      n.setRowCount(r);
    },
    getRowCount() {
      return n.state.serverSide ? n.state.serverRowCount : n.state.rowData.length;
    },
    isServerSide() {
      return !!n.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(r) {
      n.setColumnDefs(r);
    },
    getColumnDefs() {
      return n.state.columnDefs.slice();
    },
    setColumnVisible(r, e) {
      n.setColumnVisible(r, e);
    },
    setColumnPinned(r, e) {
      n.setColumnPinned(r, e);
    },
    setColumnWidth(r, e) {
      n.setColumnWidth(r, e);
    },
    moveColumn(r, e) {
      n.moveColumn(r, e);
    },
    autoSizeColumn(r) {
      n.autoSizeColumn(r);
    },
    autoSizeAllColumns() {
      n.state.columnDefs.forEach((r) => n.autoSizeColumn(r.field));
    },
    sizeColumnsToFit() {
      n.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(r) {
      n.setSortModel(r);
    },
    getSortModel() {
      return n.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(r) {
      n.setFilterModel(r);
    },
    getFilterModel() {
      return { ...n.state.filterModel };
    },
    setColumnFilter(r, e) {
      n.setColumnFilter(r, e);
    },
    destroyFilter(r) {
      n.setColumnFilter(r, null);
    },
    setQuickFilter(r) {
      n.setQuickFilter(r);
    },
    getQuickFilter() {
      return n.getQuickFilter();
    },
    // ---- Selection ----
    selectAll() {
      n.selectAll();
    },
    deselectAll() {
      n.deselectAll();
    },
    selectRow(r) {
      n.setSelected(r, !0);
    },
    deselectRow(r) {
      n.setSelected(r, !1);
    },
    getSelectedRows() {
      return n.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(n.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(r) {
      n.goToPage(r);
    },
    paginationGoToFirstPage() {
      n.goToPage(0);
    },
    paginationGoToNextPage() {
      n.goToPage(n.state.pagination.page + 1);
    },
    paginationGoToPreviousPage() {
      n.goToPage(n.state.pagination.page - 1);
    },
    paginationGoToLastPage() {
      n.goToPage(n.lastPageIndex());
    },
    paginationSetPageSize(r) {
      n.setPageSize(r);
    },
    paginationGetCurrentPage() {
      return n.state.pagination.page;
    },
    paginationGetTotalPages() {
      return n.totalPages();
    },
    paginationGetRowCount() {
      return n.filteredCount();
    },
    paginationGetPageSize() {
      return n.state.pagination.pageSize;
    },
    paginationIsEnabled() {
      return n.state.pagination.enabled;
    },
    // ---- Cell selection ----
    getCellSelection() {
      return n.getCellSelectionDetail();
    },
    getCellRangeValues() {
      return n._cellRangeRows();
    },
    getCellSelectionRowIds() {
      return n.getCellSelectionRowIds();
    },
    getRangeAggregates() {
      return n.getRangeAggregates();
    },
    // ---- Editing ----
    startEditingCell({ rowId: r, colId: e }) {
      n.startEditingCell(r, e);
    },
    stopEditing(r = !1) {
      n.stopEditing(r);
    },
    // ---- Row grouping + aggregation ----
    setRowGroupColumns(r) {
      n.setRowGroupColumns(r);
    },
    addRowGroupColumn(r) {
      n.addRowGroupColumn(r);
    },
    removeRowGroupColumn(r) {
      n.removeRowGroupColumn(r);
    },
    getRowGroupColumns() {
      return n.getRowGroupColumns();
    },
    setColumnAggFunc(r, e) {
      n.setColumnAggFunc(r, e);
    },
    expandAll() {
      n.expandAll();
    },
    collapseAll() {
      n.collapseAll();
    },
    toggleGroup(r, e) {
      n.toggleGroup(r, e);
    },
    // ---- Pivot ----
    setPivotMode(r) {
      n.setPivotMode(r);
    },
    isPivotMode() {
      return n.isPivotMode();
    },
    setPivotColumns(r) {
      n.setPivotColumns(r);
    },
    addPivotColumn(r) {
      n.addPivotColumn(r);
    },
    removePivotColumn(r) {
      n.removePivotColumn(r);
    },
    getPivotColumns() {
      return n.getPivotColumns();
    },
    // Synthetic pivot result columns from the most recent render. Each entry
    // is { field, headerName, pivotKeys, valueField, aggFunc } — useful for
    // discovering the field id of a pivot col to feed to setSortModel / for
    // building a custom column visibility UI.
    getPivotResultColumns() {
      return (n._displayList?.pivotResultColumns || []).map((e) => ({
        field: e.field,
        headerName: e.headerName,
        pivotKeys: { ...e.pivotKeys || {} },
        valueField: e.valueField,
        aggFunc: e.aggFunc
      }));
    },
    // ---- Value columns (aggregations; shared with grouping) ----
    setValueColumns(r) {
      n.setValueColumns(r);
    },
    addValueColumn(r, e = "sum") {
      n.addValueColumn(r, e);
    },
    removeValueColumn(r) {
      n.removeValueColumn(r);
    },
    getValueColumns() {
      return n.getValueColumns();
    },
    // ---- Column header groups (multi-row headers) ----
    setColumnGroups(r) {
      n.setColumnGroups(r);
    },
    getColumnGroups() {
      return n.getColumnGroups();
    },
    // ---- Pinned bottom row (sticky grand totals) ----
    setPinnedBottomRow(r) {
      n.setPinnedBottomRow(r);
    },
    isPinnedBottomRow() {
      return n.isPinnedBottomRow();
    },
    // ---- Tree data (self-referential parent_id) ----
    setTreeData(r) {
      n.setTreeData(r);
    },
    isTreeData() {
      return n.isTreeData();
    },
    setTreeParentField(r) {
      n.setTreeParentField(r);
    },
    expandTreeRow(r) {
      n.expandTreeRow(r);
    },
    collapseTreeRow(r) {
      n.collapseTreeRow(r);
    },
    toggleTreeRow(r) {
      n.toggleTreeRow(r);
    },
    expandAllTreeRows() {
      n.expandAllTreeRows();
    },
    collapseAllTreeRows() {
      n.collapseAllTreeRows();
    },
    getTreeExpandedRowIds() {
      return n.getTreeExpandedRowIds();
    },
    // ---- Master/detail ----
    setMasterDetail(r) {
      n.setMasterDetail(r);
    },
    isMasterDetail() {
      return n.isMasterDetail();
    },
    expandDetailRow(r) {
      n.expandDetailRow(r);
    },
    collapseDetailRow(r) {
      n.collapseDetailRow(r);
    },
    toggleDetailRow(r) {
      n.toggleDetailRow(r);
    },
    expandAllDetails() {
      n.expandAllDetails();
    },
    collapseAllDetails() {
      n.collapseAllDetails();
    },
    getDetailExpandedRowIds() {
      return n.getDetailExpandedRowIds();
    },
    // ---- Column state + persistence ----
    getColumnState() {
      return n.getColumnState();
    },
    applyColumnState(r) {
      n.applyColumnState(r);
    },
    clearPersistedState() {
      n.clearPersistedState();
    },
    getPersistKey() {
      return n.persistKeyValue || "";
    },
    // ---- Export ----
    getDataAsCsv(r = {}) {
      return n.getDataAsCsv(r);
    },
    exportDataAsCsv(r = {}) {
      return n.exportDataAsCsv(r);
    },
    // ---- Display ----
    refreshCells(r = {}) {
      n.refresh(r);
    },
    redrawRows(r = {}) {
      n.refresh(r);
    },
    // ---- Events ----
    addEventListener(r, e) {
      n.element.addEventListener(r, e);
    },
    removeEventListener(r, e) {
      n.element.removeEventListener(r, e);
    }
  };
}
function b(n, r = {}, e = []) {
  const t = document.createElement(n);
  for (const [s, i] of Object.entries(r))
    i === !1 || i == null || (s === "class" ? t.className = i : s === "style" && typeof i == "object" ? Object.assign(t.style, i) : s.startsWith("on") && typeof i == "function" ? t.addEventListener(s.slice(2).toLowerCase(), i) : i === !0 ? t.setAttribute(s, "") : t.setAttribute(s, String(i)));
  for (const s of [].concat(e))
    s == null || s === !1 || t.appendChild(typeof s == "string" ? document.createTextNode(s) : s);
  return t;
}
function Ye(n, r) {
  for (const [e, t] of Object.entries(r))
    t == null || t === !1 ? n.removeAttribute(e) : t === !0 ? n.setAttribute(e, "") : n.setAttribute(e, String(t));
}
function Qe(n) {
  const r = document.getElementById(n);
  return !r || r.tagName !== "TEMPLATE" ? null : r.content.firstElementChild.cloneNode(!0);
}
function M(n, r, e) {
  n.dispatchEvent(new CustomEvent(r, { detail: e, bubbles: !0 }));
}
function vs(n, r, e) {
  let t = n.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(r)) {
      const i = e.getControllerForElementAndIdentifier(t, r);
      if (i) return i;
    }
    t = t.parentElement;
  }
  return null;
}
const Je = [
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
], ws = [
  21522,
  20773,
  24188,
  23371,
  17913,
  16590,
  20375,
  19104
], me = new Uint8Array(512), Ve = new Uint8Array(256);
(function() {
  let r = 1;
  for (let e = 0; e < 255; e++)
    me[e] = r, Ve[r] = e, r <<= 1, r & 256 && (r ^= 285);
  for (let e = 255; e < 512; e++) me[e] = me[e - 255];
})();
function Ie(n, r) {
  return n === 0 || r === 0 ? 0 : me[Ve[n] + Ve[r]];
}
function Cs(n) {
  const r = new Uint8Array(n);
  r[n - 1] = 1;
  let e = 1;
  for (let t = 0; t < n; t++) {
    for (let s = 0; s < n; s++)
      r[s] = Ie(r[s], e), s + 1 < n && (r[s] ^= r[s + 1]);
    e = Ie(e, 2);
  }
  return r;
}
function Ss(n, r) {
  const e = new Uint8Array(r.length);
  for (const t of n) {
    const s = t ^ e[0];
    e.copyWithin(0, 1), e[e.length - 1] = 0;
    for (let i = 0; i < r.length; i++)
      e[i] ^= Ie(r[i], s);
  }
  return e;
}
class xs {
  constructor() {
    this.bits = [];
  }
  append(r, e) {
    for (let t = e - 1; t >= 0; t--) this.bits.push(r >>> t & 1);
  }
  toBytes() {
    for (; this.bits.length % 8 !== 0; ) this.bits.push(0);
    const r = new Uint8Array(this.bits.length / 8);
    for (let e = 0; e < r.length; e++) {
      let t = 0;
      for (let s = 0; s < 8; s++) t = t << 1 | this.bits[e * 8 + s];
      r[e] = t;
    }
    return r;
  }
}
function Ls(n) {
  const r = new TextEncoder().encode(String(n));
  let e = 0;
  for (let C = 1; C <= 10; C++) {
    const R = 4 + (C < 10 ? 8 : 16) + r.length * 8, $ = Je[C - 1][0] * 8;
    if (R <= $) {
      e = C;
      break;
    }
  }
  if (e === 0)
    throw new Error(`qr: data too long for v10 ECC=M (${r.length} bytes; max 213)`);
  const [t, s, i] = Je[e - 1], o = new xs();
  o.append(4, 4), o.append(r.length, e < 10 ? 8 : 16);
  for (const C of r) o.append(C, 8);
  const a = t * 8;
  o.append(0, Math.min(4, Math.max(0, a - o.bits.length)));
  const l = o.toBytes(), d = new Uint8Array(t);
  d.set(l);
  const c = [236, 17];
  for (let C = l.length; C < t; C++) d[C] = c[(C - l.length) % 2];
  const u = Math.floor(t / i), p = t - u * i, f = [], g = Cs(s);
  let _ = 0;
  for (let C = 0; C < i; C++) {
    const T = C < i - p ? u : u + 1, R = d.slice(_, _ + T);
    _ += T, f.push({ data: R, ecc: Ss(R, g) });
  }
  const y = [], L = u + 1;
  for (let C = 0; C < L; C++)
    for (const T of f) C < T.data.length && y.push(T.data[C]);
  for (let C = 0; C < s; C++)
    for (const T of f) y.push(T.ecc[C]);
  const m = 17 + e * 4, v = new Uint8Array(m * m), w = new Uint8Array(m * m);
  As(v, w, m), Es(v, w, m), Ts(v, w, m, e), e >= 7 && Rs(v, w, m, e), ks(v, w, m, y);
  let S = 0, A = 1 / 0;
  const k = new Uint8Array(v);
  for (let C = 0; C < 8; C++) {
    k.set(v), et(k, w, m, C), Ze(k, m, C);
    const T = Ds(k, m);
    T < A && (A = T, S = C);
  }
  return et(v, w, m, S), Ze(v, m, S), { size: m, matrix: v };
}
function I(n, r, e, t, s) {
  n[t * r + e] = s ? 1 : 0;
}
function As(n, r, e) {
  const t = [[0, 0], [e - 7, 0], [0, e - 7]];
  for (const [s, i] of t)
    for (let o = -1; o <= 7; o++)
      for (let a = -1; a <= 7; a++) {
        const l = s + a, d = i + o;
        if (l < 0 || d < 0 || l >= e || d >= e) continue;
        const u = a >= 0 && a < 7 && o >= 0 && o < 7 && (a === 0 || a === 6 || o === 0 || o === 6 || // outer ring
        a >= 2 && a <= 4 && o >= 2 && o <= 4);
        I(n, e, l, d, u), r[d * e + l] = 1;
      }
  for (let s = 0; s < 9; s++)
    r[s * e + 8] = 1, r[8 * e + s] = 1;
  for (let s = 0; s < 8; s++)
    r[(e - 1 - s) * e + 8] = 1, r[8 * e + (e - 1 - s)] = 1;
  I(n, e, 8, e - 8, 1), r[(e - 8) * e + 8] = 1;
}
function Es(n, r, e) {
  for (let t = 8; t < e - 8; t++)
    I(n, e, t, 6, t % 2 === 0), I(n, e, 6, t, t % 2 === 0), r[6 * e + t] = 1, r[t * e + 6] = 1;
}
const Ms = [
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
function Ts(n, r, e, t) {
  const s = Ms[t];
  if (s) {
    for (const i of s)
      for (const o of s)
        if (!(o === 6 && i === 6 || o === e - 7 && i === 6 || o === 6 && i === e - 7))
          for (let l = -2; l <= 2; l++)
            for (let d = -2; d <= 2; d++) {
              const c = Math.max(Math.abs(d), Math.abs(l)) !== 1;
              I(n, e, o + d, i + l, c), r[(i + l) * e + (o + d)] = 1;
            }
  }
}
function Rs(n, r, e, t) {
  let s = t, i = s;
  for (let a = 0; a < 12; a++)
    i = i << 1 ^ (i >>> 11) * 7973;
  const o = s << 12 | i;
  for (let a = 0; a < 18; a++) {
    const l = o >>> a & 1, d = Math.floor(a / 3), c = a % 3 + e - 11;
    I(n, e, d, c, l), r[c * e + d] = 1, I(n, e, c, d, l), r[d * e + c] = 1;
  }
}
function Ze(n, r, e) {
  const t = ws[e];
  for (let s = 0; s < 15; s++) {
    const i = (t >>> s & 1) === 1;
    s < 6 ? I(n, r, 8, s, i) : s < 8 ? I(n, r, 8, s + 1, i) : s < 9 ? I(n, r, 7, 8, i) : I(n, r, 14 - s, 8, i), s < 8 ? I(n, r, r - 1 - s, 8, i) : I(n, r, 8, r - 15 + s, i);
  }
  I(n, r, 8, r - 8, 1);
}
function ks(n, r, e, t) {
  let s = 0, i = -1;
  for (let o = e - 1; o > 0; o -= 2) {
    o === 6 && o--;
    for (let a = 0; a < e; a++) {
      const l = i < 0 ? e - 1 - a : a;
      for (let d = 0; d < 2; d++) {
        const c = o - d;
        if (r[l * e + c]) continue;
        const u = s < t.length * 8 ? t[s >>> 3] >>> 7 - (s & 7) & 1 : 0;
        n[l * e + c] = u, s++;
      }
    }
    i = -i;
  }
}
function et(n, r, e, t) {
  for (let s = 0; s < e; s++)
    for (let i = 0; i < e; i++) {
      if (r[s * e + i]) continue;
      let o = !1;
      switch (t) {
        case 0:
          o = (i + s & 1) === 0;
          break;
        case 1:
          o = (s & 1) === 0;
          break;
        case 2:
          o = i % 3 === 0;
          break;
        case 3:
          o = (i + s) % 3 === 0;
          break;
        case 4:
          o = (Math.floor(s / 2) + Math.floor(i / 3) & 1) === 0;
          break;
        case 5:
          o = i * s % 2 + i * s % 3 === 0;
          break;
        case 6:
          o = (i * s % 2 + i * s % 3 & 1) === 0;
          break;
        case 7:
          o = ((i + s) % 2 + i * s % 3 & 1) === 0;
          break;
      }
      o && (n[s * e + i] ^= 1);
    }
}
function Ds(n, r) {
  let e = 0;
  for (let t = 0; t < r; t++) {
    let s = 1, i = -1;
    for (let o = 0; o < r; o++) {
      const a = n[t * r + o];
      a === i ? (s++, s === 5 ? e += 3 : s > 5 && (e += 1)) : (i = a, s = 1);
    }
  }
  for (let t = 0; t < r; t++) {
    let s = 1, i = -1;
    for (let o = 0; o < r; o++) {
      const a = n[o * r + t];
      a === i ? (s++, s === 5 ? e += 3 : s > 5 && (e += 1)) : (i = a, s = 1);
    }
  }
  for (let t = 0; t < r - 1; t++)
    for (let s = 0; s < r - 1; s++) {
      const i = n[t * r + s];
      n[t * r + s + 1] === i && n[(t + 1) * r + s] === i && n[(t + 1) * r + s + 1] === i && (e += 3);
    }
  return e;
}
function Ns({ size: n, matrix: r }, e = {}) {
  const {
    moduleSize: t = 4,
    margin: s = 2,
    background: i = "#fff",
    foreground: o = "#111827"
  } = e, a = (n + s * 2) * t;
  let l = "";
  for (let d = 0; d < n; d++)
    for (let c = 0; c < n; c++)
      if (r[d * n + c]) {
        const u = (c + s) * t, p = (d + s) * t;
        l += `M${u},${p}h${t}v${t}h-${t}z`;
      }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a} ${a}" width="${a}" height="${a}" shape-rendering="crispEdges" aria-hidden="true"><rect width="${a}" height="${a}" fill="${i}"/><path d="${l}" fill="${o}"/></svg>`;
}
const $s = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.1 297.4z"/></svg>', Fe = /* @__PURE__ */ new Map();
function x(n, r) {
  if (typeof n != "string" || !n) throw new Error("registerRenderer: name must be a non-empty string");
  if (typeof r != "function") throw new Error("registerRenderer: fn must be a function");
  Fe.set(n, r);
}
function _t(n) {
  return Fe.get(n) || null;
}
function Vs() {
  return Array.from(Fe.keys());
}
function h(n, r = {}, e = null) {
  const t = document.createElement(n);
  for (const [s, i] of Object.entries(r))
    i == null || i === !1 || (s === "class" ? t.className = i : t.setAttribute(s, i === !0 ? "" : String(i)));
  return e == null || (Array.isArray(e) ? e.forEach((s) => t.append(s)) : typeof e == "string" ? t.innerHTML = e : t.append(e)), t;
}
const E = (n) => n == null || n === "", Is = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function yt() {
  return ({ value: n }) => {
    if (E(n)) return "";
    const r = String(n);
    return Is.test(r) ? h("a", {
      class: "sg-renderer-link",
      href: `mailto:${r}`,
      title: "Send email"
    }, document.createTextNode(r)) : h("span", { class: "sg-renderer-invalid", title: "Invalid email" }, document.createTextNode(r));
  };
}
function vt({ newTab: n = !0 } = {}) {
  return ({ value: r }) => {
    if (E(r)) return "";
    const e = String(r);
    let t;
    try {
      t = new URL(e);
    } catch {
      return document.createTextNode(e);
    }
    return h("a", {
      class: "sg-renderer-link",
      href: e,
      target: n ? "_blank" : null,
      rel: n ? "noopener noreferrer" : null,
      title: e
    }, document.createTextNode(t.hostname + (t.pathname !== "/" ? t.pathname : "")));
  };
}
function wt({ defaultRegion: n = "AU" } = {}) {
  return ({ value: r }) => {
    if (E(r)) return "";
    const e = String(r).trim(), t = e.replace(/\D/g, "");
    if (!t) return document.createTextNode(e);
    let s = e;
    return n === "AU" && (/^04\d{8}$/.test(t) ? s = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : /^0[2378]\d{8}$/.test(t) ? s = `(${t.slice(0, 2)}) ${t.slice(2, 6)} ${t.slice(6)}` : /^1[38]00\d{6}$/.test(t) ? s = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : t.length === 8 && (s = `${t.slice(0, 4)} ${t.slice(4)}`)), h("a", { class: "sg-renderer-link", href: `tel:${t}` }, document.createTextNode(s));
  };
}
function Ct({ currency: n = "USD", locale: r = "en-US", decimals: e } = {}) {
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-number"), E(t)) return "";
    const i = Number(t);
    if (!Number.isFinite(i)) return String(t);
    const o = { style: "currency", currency: n };
    return e != null && (o.minimumFractionDigits = e, o.maximumFractionDigits = e), i.toLocaleString(r, o);
  };
}
function St({ decimals: n = 0, scale: r = "as-is" } = {}) {
  return ({ value: e, td: t }) => {
    if (t && t.classList.add("sg-renderer-number"), E(e)) return "";
    let s = Number(e);
    return Number.isFinite(s) ? (r === "fraction" && (s *= 100), `${s.toFixed(n)}%`) : String(e);
  };
}
function Be(n) {
  if (n == null || n === "") return null;
  if (n instanceof Date) return Number.isNaN(n.valueOf()) ? null : n;
  const r = new Date(n);
  return Number.isNaN(r.valueOf()) ? null : r;
}
function xt({ locale: n = void 0, dateStyle: r = "medium", ...e } = {}) {
  const t = new Intl.DateTimeFormat(n, { dateStyle: r, ...e });
  return ({ value: s }) => {
    const i = Be(s);
    return i ? t.format(i) : "";
  };
}
function Lt({ locale: n = void 0, dateStyle: r = "medium", timeStyle: e = "short", ...t } = {}) {
  const s = new Intl.DateTimeFormat(n, { dateStyle: r, timeStyle: e, ...t });
  return ({ value: i }) => {
    const o = Be(i);
    return o ? s.format(o) : "";
  };
}
const Te = [
  { unit: "second", ms: 1e3, cutoff: 60 * 1e3 },
  { unit: "minute", ms: 60 * 1e3, cutoff: 3600 * 1e3 },
  { unit: "hour", ms: 3600 * 1e3, cutoff: 1440 * 60 * 1e3 },
  { unit: "day", ms: 1440 * 60 * 1e3, cutoff: 10080 * 60 * 1e3 },
  { unit: "week", ms: 10080 * 60 * 1e3, cutoff: 720 * 60 * 60 * 1e3 },
  { unit: "month", ms: 720 * 60 * 60 * 1e3, cutoff: 365 * 24 * 60 * 60 * 1e3 },
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1e3, cutoff: 1 / 0 }
];
function At({ locale: n = void 0, numeric: r = "auto", style: e = "long" } = {}) {
  const t = new Intl.RelativeTimeFormat(n, { numeric: r, style: e });
  return ({ value: s }) => {
    const i = Be(s);
    if (!i) return "";
    const o = i.getTime() - Date.now(), a = Math.abs(o), l = Te.find((u) => a < u.cutoff) || Te[Te.length - 1], d = Math.round(o / l.ms), c = h("span", { class: "sg-renderer-relative-time", title: i.toLocaleString() });
    return c.textContent = t.format(d, l.unit), c;
  };
}
const Ps = { ms: 1, sec: 1e3, second: 1e3, min: 6e4, minute: 6e4, hr: 36e5, hour: 36e5 };
function Et({ unit: n = "ms", style: r = "compact" } = {}) {
  const e = Ps[n] ?? 1;
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-number"), E(t)) return "";
    const i = Number(t) * e;
    if (!Number.isFinite(i)) return String(t);
    const o = i < 0 ? "-" : "", a = Math.abs(i), l = Math.floor(a / 36e5), d = Math.floor(a % 36e5 / 6e4), c = Math.floor(a % 6e4 / 1e3);
    if (r === "clock") {
      const p = (f) => String(f).padStart(2, "0");
      return o + (l > 0 ? `${p(l)}:${p(d)}:${p(c)}` : `${p(d)}:${p(c)}`);
    }
    if (r === "words") {
      const p = [];
      return l && p.push(`${l} ${l === 1 ? "hour" : "hours"}`), d && p.push(`${d} ${d === 1 ? "minute" : "minutes"}`), !l && c && p.push(`${c} ${c === 1 ? "second" : "seconds"}`), o + (p.join(" ") || "0 seconds");
    }
    const u = [];
    return l && u.push(`${l}h`), d && u.push(`${d}m`), !l && c && u.push(`${c}s`), o + (u.join(" ") || "0s");
  };
}
function Mt({ locale: n = void 0, decimals: r, ...e } = {}) {
  const t = { ...e };
  r != null && (t.minimumFractionDigits = r, t.maximumFractionDigits = r);
  const s = new Intl.NumberFormat(n, t);
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), E(i)) return "";
    const a = Number(i);
    return Number.isFinite(a) ? s.format(a) : String(i);
  };
}
function Tt({ locale: n = void 0, compactDisplay: r = "short", maximumFractionDigits: e = 1 } = {}) {
  const t = new Intl.NumberFormat(n, {
    notation: "compact",
    compactDisplay: r,
    maximumFractionDigits: e
  });
  return ({ value: s, td: i }) => {
    if (i && i.classList.add("sg-renderer-number"), E(s)) return "";
    const o = Number(s);
    return Number.isFinite(o) ? t.format(o) : String(s);
  };
}
function Rt({ binary: n = !0, decimals: r = 1, locale: e = void 0 } = {}) {
  const t = n ? 1024 : 1e3, s = n ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"], i = new Intl.NumberFormat(e, {
    minimumFractionDigits: r,
    maximumFractionDigits: r
  });
  return ({ value: o, td: a }) => {
    if (a && a.classList.add("sg-renderer-number"), E(o)) return "";
    let l = Number(o);
    if (!Number.isFinite(l)) return String(o);
    const d = l < 0 ? "-" : "";
    l = Math.abs(l);
    let c = 0;
    for (; l >= t && c < s.length - 1; )
      l /= t, c += 1;
    const u = c === 0 ? String(Math.round(l)) : i.format(l);
    return `${d}${u} ${s[c]}`;
  };
}
const Fs = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on"]);
function He(n) {
  return n === !0 || n === 1 ? !0 : n == null || n === "" || n === !1 || n === 0 ? !1 : Fs.has(String(n).toLowerCase());
}
const Bs = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>', Hs = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
function kt({
  truthy: n = He,
  nullLabel: r = "—",
  falseStyle: e = "icon"
  // 'icon' | 'hidden'
} = {}) {
  return ({ value: t }) => {
    if (t == null || t === "")
      return h("span", { class: "sg-renderer-bool-null" }, document.createTextNode(r));
    if (n(t)) {
      const i = h("span", { class: "sg-renderer-bool is-true", "aria-label": "true" });
      return i.innerHTML = Bs, i;
    }
    if (e === "hidden") return "";
    const s = h("span", { class: "sg-renderer-bool is-false", "aria-label": "false" });
    return s.innerHTML = Hs, s;
  };
}
const Gs = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>', Os = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.7 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>', zs = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M64 256a32 32 0 1 0 0-64H384V160c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9S384 364.9 384 352V320H64z"/></svg>';
function Dt({
  style: n = "percent",
  // 'percent' | 'number' | 'currency'
  decimals: r = 1,
  locale: e = void 0,
  currency: t = "USD",
  inverted: s = !1,
  showSign: i = !0
} = {}) {
  let o;
  return n === "currency" ? o = new Intl.NumberFormat(e, {
    style: "currency",
    currency: t,
    minimumFractionDigits: r,
    maximumFractionDigits: r,
    signDisplay: i ? "always" : "auto"
  }) : o = new Intl.NumberFormat(e, {
    minimumFractionDigits: r,
    maximumFractionDigits: r,
    signDisplay: i ? "always" : "auto"
  }), ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-number"), E(a)) return "";
    const d = Number(a);
    if (!Number.isFinite(d)) return String(a);
    let c = "is-flat", u = zs;
    const p = !s;
    d > 0 ? (c = p ? "is-up" : "is-down", u = Gs) : d < 0 && (c = p ? "is-down" : "is-up", u = Os);
    const f = h("span", { class: `sg-renderer-delta ${c}` }), g = h("span", { class: "sg-renderer-delta-icon", "aria-hidden": "true" });
    g.innerHTML = u;
    const _ = n === "percent" ? `${o.format(d)}%` : o.format(d);
    return f.append(g), f.append(h("span", { class: "sg-renderer-delta-value" }, document.createTextNode(_))), f;
  };
}
function Nt({ chars: n = null } = {}) {
  return ({ value: r, td: e }) => {
    if (E(r)) return "";
    const t = String(r);
    let s = t, i = !1;
    return n && t.length > n && (s = t.slice(0, n) + "…", i = !0), e && (e.classList.add("sg-renderer-truncate"), e.setAttribute("title", t)), i ? s : t;
  };
}
const xe = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>', $t = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';
function Vt({ position: n = "after" } = {}) {
  return ({ value: r }) => {
    if (E(r)) return "";
    const e = String(r), t = h("span", { class: "sg-renderer-copyable" }), s = h("span", { class: "sg-renderer-copyable-value" }, document.createTextNode(e)), i = h("button", {
      type: "button",
      class: "sg-renderer-copyable-btn",
      title: "Copy",
      "aria-label": `Copy ${e}`
    });
    return i.innerHTML = xe, i.addEventListener("click", async (o) => {
      o.stopPropagation(), o.preventDefault();
      try {
        navigator.clipboard?.writeText ? await navigator.clipboard.writeText(e) : It(e), i.innerHTML = $t, i.classList.add("is-copied"), setTimeout(() => {
          i.innerHTML = xe, i.classList.remove("is-copied");
        }, 1200);
      } catch {
      }
    }), n === "before" ? t.append(i, s) : t.append(s, i), t;
  };
}
function It(n) {
  const r = document.createElement("textarea");
  r.value = n, r.style.position = "fixed", r.style.left = "-9999px", document.body.appendChild(r), r.select();
  try {
    document.execCommand("copy");
  } catch {
  }
  document.body.removeChild(r);
}
function Pt({
  size: n = 36,
  rounded: r = "sm",
  // 'sm' = 4px, 'lg' = 8px, 'full' = circle, 'none'
  altField: e = "alt",
  clickToZoom: t = !1
} = {}) {
  const s = r === "full" ? "999px" : r === "lg" ? "8px" : r === "none" ? "0" : "4px";
  return ({ value: i, row: o }) => {
    if (E(i)) return "";
    const a = String(i), l = o?.[e] ?? "", d = h("img", {
      src: a,
      alt: l,
      class: "sg-renderer-image",
      width: String(n),
      height: String(n),
      style: `border-radius: ${s};`,
      loading: "lazy",
      decoding: "async"
    });
    return t && (d.style.cursor = "zoom-in", d.addEventListener("click", (c) => {
      c.stopPropagation(), js(a, l);
    })), d;
  };
}
function js(n, r) {
  const e = h("div", { class: "sg-image-zoom" }), t = () => {
    e.remove(), document.removeEventListener("keydown", s);
  }, s = (i) => {
    i.key === "Escape" && t();
  };
  e.addEventListener("click", t), document.addEventListener("keydown", s), e.append(h("img", { src: n, alt: r || "", class: "sg-image-zoom-img" })), document.body.appendChild(e);
}
function Ft({
  showLabel: n = !0,
  label: r = "value",
  // 'value' | 'name' | (value, row) => string
  shape: e = "circle",
  // 'circle' | 'square'
  size: t = 14
} = {}) {
  return ({ value: s, row: i }) => {
    if (E(s)) return "";
    const o = String(s).trim(), a = h("span", { class: "sg-renderer-swatch" }), l = h("span", {
      class: `sg-renderer-swatch-chip is-${e}`,
      style: `width: ${t}px; height: ${t}px; background: ${o};`,
      "aria-hidden": "true"
    });
    if (a.append(l), n) {
      const d = typeof r == "function" ? r(s, i) : r === "name" ? i?.name ?? o : o;
      a.append(h("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(d)));
    }
    return a;
  };
}
const Ge = {
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  orange: "#f97316",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#6b7280"
};
function Bt({
  type: n = "line",
  // 'line' | 'area' | 'bar'
  width: r = 80,
  height: e = 24,
  color: t = "blue",
  // palette key OR raw CSS colour
  baseline: s = null,
  // null = auto-min, 0 = lock min at zero, N = lock at N
  showLast: i = !0
  // small dot on the last point (line / area only)
} = {}) {
  const o = Ge[t] || t;
  return ({ value: a }) => {
    if (!Array.isArray(a) || a.length === 0) return "";
    const l = a.map(Number).filter((v) => Number.isFinite(v));
    if (l.length === 0) return "";
    const d = s ?? Math.min(...l), u = Math.max(...l, s ?? -1 / 0) - d || 1, p = 1.5, f = 2.5, g = r - p * 2, _ = e - f * 2, y = (v) => p + (l.length === 1 ? g / 2 : v / (l.length - 1) * g), L = (v) => f + _ - (v - d) / u * _;
    let m = "";
    if (n === "bar") {
      const w = Math.max(1, (g - (l.length - 1) * 1) / l.length);
      for (let S = 0; S < l.length; S++) {
        const A = l[S], k = p + S * (w + 1), C = L(A), T = f + _ - C;
        m += `<rect x="${k.toFixed(2)}" y="${C.toFixed(2)}" width="${w.toFixed(2)}" height="${T.toFixed(2)}" fill="${o}"/>`;
      }
    } else {
      let v = "";
      for (let w = 0; w < l.length; w++)
        v += `${w === 0 ? "M" : "L"} ${y(w).toFixed(2)} ${L(l[w]).toFixed(2)} `;
      if (n === "area") {
        const w = v + ` L ${y(l.length - 1).toFixed(2)} ${(f + _).toFixed(2)} L ${y(0).toFixed(2)} ${(f + _).toFixed(2)} Z`;
        m += `<path d="${w}" fill="${o}" fill-opacity="0.18" stroke="none"/>`;
      }
      if (m += `<path d="${v.trim()}" fill="none" stroke="${o}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`, i) {
        const w = y(l.length - 1), S = L(l[l.length - 1]);
        m += `<circle cx="${w.toFixed(2)}" cy="${S.toFixed(2)}" r="1.8" fill="${o}"/>`;
      }
    }
    return `<svg class="sg-renderer-sparkline is-${n}" viewBox="0 0 ${r} ${e}" width="${r}" height="${e}" preserveAspectRatio="none" aria-hidden="true">` + m + "</svg>";
  };
}
function Ht(n) {
  if (typeof n != "string") return null;
  let r = n.trim().replace(/^#/, "");
  return r.length === 3 && (r = r.split("").map((e) => e + e).join("")), /^[0-9a-f]{6}$/i.test(r) ? [parseInt(r.slice(0, 2), 16), parseInt(r.slice(2, 4), 16), parseInt(r.slice(4, 6), 16)] : null;
}
function Ks(n, r, e) {
  const t = (s) => Math.max(0, Math.min(255, Math.round(s))).toString(16).padStart(2, "0");
  return `#${t(n)}${t(r)}${t(e)}`;
}
function qs(n, r, e) {
  return [n[0] + (r[0] - n[0]) * e, n[1] + (r[1] - n[1]) * e, n[2] + (r[2] - n[2]) * e];
}
function Gt([n, r, e]) {
  return 0.299 * n + 0.587 * r + 0.114 * e >= 145;
}
function Ot({
  min: n = 0,
  max: r = 100,
  colors: e = ["#dcfce7", "#fef3c7", "#fecaca"],
  inverted: t = !1,
  showValue: s = !0,
  format: i = null
  // (value) => string for custom labels
} = {}) {
  const o = e.map(Ht).filter(Boolean);
  if (o.length < 2) throw new Error("heatmap: need at least two valid hex colours");
  return ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-heatmap"), E(a)) return "";
    let d = Number(a);
    if (!Number.isFinite(d)) return String(a);
    let c = r - n === 0 ? 0.5 : (d - n) / (r - n);
    c = Math.max(0, Math.min(1, c)), t && (c = 1 - c);
    const u = c * (o.length - 1), p = Math.min(o.length - 2, Math.floor(u)), f = u - p, g = qs(o[p], o[p + 1], f);
    return l && (l.style.backgroundColor = Ks(...g), l.style.color = Gt(g) ? "#111827" : "#ffffff"), s ? typeof i == "function" ? i(a) : String(a) : "";
  };
}
const Us = {
  // Credit card: 16 digits grouped 4-4-4-4, last 4 visible. Handles 13-19
  // digit lengths gracefully (Amex 15, others 16). Non-digits are stripped.
  "cc-last4": (n, r) => tt(n.replace(/\D/g, ""), 4, 4, r, " "),
  // BIN + last4: show the first 6 + last 4, mask the middle (PCI-friendly).
  "cc-bin-last4": (n, r) => tt(n.replace(/\D/g, ""), 4, 4, r, " ", 6),
  // Phone: show the last 4 digits, mask the rest as a single bullet
  // block ("•••••• 1234"). Sidesteps the country-specific 3-3-4 / 4-3-3
  // grouping ambiguity — register your own variant if you need a
  // region-specific layout.
  "phone-last4": (n, r) => {
    const e = n.replace(/\D/g, "");
    return e ? e.length <= 4 ? e : r.repeat(e.length - 4) + " " + e.slice(-4) : n;
  },
  // Email: show first char + domain ("a••••@example.com").
  email: (n, r) => {
    const e = String(n).match(/^([^@\s]+)(@.+)$/);
    return e ? e[1][0] + r.repeat(Math.max(1, e[1].length - 1)) + e[2] : n;
  },
  // SSN / ABN-style: show last 4.
  last4: (n, r) => Ws(n, 4, r)
};
function Ws(n, r, e) {
  const t = String(n);
  return t.length <= r ? t : e.repeat(t.length - r) + t.slice(-r);
}
function tt(n, r, e, t, s, i = 0) {
  if (!n) return "";
  const o = n.length, a = n.split("").map((d, c) => c < i || c >= o - e ? d : t).join(""), l = [];
  for (let d = a.length; d > 0; d -= r)
    l.unshift(a.slice(Math.max(0, d - r), d));
  return l.join(s);
}
const Xs = /* @__PURE__ */ new Set(["cc-last4", "cc-bin-last4", "phone-last4", "last4"]);
function zt({
  format: n = null,
  showFirst: r = 0,
  showLast: e = 4,
  char: t = "•",
  align: s = null
  // 'left' | 'right' | null (auto)
} = {}) {
  const i = n ? Us[n] : null, o = n ? Xs.has(n) : !1, a = s === "right" || s !== "left" && o;
  return ({ value: l, td: d }) => {
    if (d && a && d.classList.add("sg-renderer-mask-numeric"), E(l)) return "";
    const c = String(l);
    if (i) return i(c, t);
    const u = c.slice(0, r), p = e > 0 ? c.slice(-e) : "", f = Math.max(0, c.length - r - e);
    return u + t.repeat(f) + p;
  };
}
function jt({
  query: n = null,
  caseSensitive: r = !1,
  className: e = "sg-renderer-mark"
} = {}) {
  return ({ value: t, api: s }) => {
    if (E(t)) return "";
    const i = String(t), o = n != null ? String(n) : s?.getQuickFilter?.() || "";
    return o ? Ys(i, o, r, e) : document.createTextNode(i);
  };
}
function Ys(n, r, e, t) {
  const s = e ? n : n.toLowerCase(), i = e ? r : r.toLowerCase(), o = document.createElement("span");
  let a = 0;
  for (; a < n.length; ) {
    const l = s.indexOf(i, a);
    if (l === -1) {
      o.appendChild(document.createTextNode(n.slice(a)));
      break;
    }
    l > a && o.appendChild(document.createTextNode(n.slice(a, l)));
    const d = document.createElement("mark");
    d.className = t, d.textContent = n.slice(l, l + r.length), o.appendChild(d), a = l + r.length;
  }
  return o;
}
function Kt({ lines: n = null, separator: r = `
` } = {}) {
  return ({ value: e, td: t }) => {
    if (E(e)) return "";
    const s = String(e), i = r === `
` ? s : s.split(r).join(`
`);
    if (t) {
      t.classList.add("sg-renderer-multiline"), t.setAttribute("title", i);
      const o = t.parentElement;
      o && o.tagName === "TR" && o.classList.add("sg-has-multiline");
    }
    if (n != null && n > 0) {
      const o = document.createElement("div");
      return o.className = "sg-renderer-multiline-clamp", o.style.setProperty("--sg-clamp", String(n)), o.textContent = i, o;
    }
    return i;
  };
}
function oe(n) {
  if (n == null || !Number.isFinite(Number(n))) return "";
  let r = Number(n);
  if (r < 1024) return `${r} B`;
  const e = ["KB", "MB", "GB", "TB"];
  let t = -1;
  do
    r /= 1024, t++;
  while (r >= 1024 && t < e.length - 1);
  return `${r.toFixed(r < 10 ? 1 : 0)} ${e[t]}`;
}
const Qs = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "ico"]);
function z(n) {
  if (!n) return !1;
  if (typeof n.content_type == "string" && n.content_type.startsWith("image/")) return !0;
  const r = String(n.filename || "").split(".").pop()?.toLowerCase();
  return r ? Qs.has(r) : !1;
}
const Le = {
  pdf: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM88 304h32c30.9 0 56 25.1 56 56s-25.1 56-56 56h-16v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V320c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24h-16v48h16zm72-64c0-8.8 7.2-16 16-16h24c26.5 0 48 21.5 48 48v48c0 26.5-21.5 48-48 48H208c-8.8 0-16-7.2-16-16V320zm32 16v80h8c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16h-8z"/></svg>',
  doc: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM104 280c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24zm0 80c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24z"/></svg>',
  sheet: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zm192 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16v128c0 8.8-7.2 16-16 16H112c-8.8 0-16-7.2-16-16V272c0-8.8 7.2-16 16-16zm16 32v32h48V288H128zm80 0v32h48V288H208zm-80 64v32h48V352H128zm80 0v32h48V352H208z"/></svg>',
  zip: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H160V64H224V0H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM160 64v32h64V64H160zm0 96v32h64V160H160zm0 96v32h64V256H160zm0 96c-17.7 0-32 14.3-32 32v48c0 8.8 7.2 16 16 16h96c8.8 0 16-7.2 16-16V384c0-17.7-14.3-32-32-32H160z"/></svg>',
  audio: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM160 288c-8.8 0-16 7.2-16 16v89c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V362.5l64-21.3V388c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V304c0-5.1-2.5-10-6.6-13s-9.5-3.9-14.5-2.3L160 309.8V304c0-8.8-7.2-16-16-16z"/></svg>',
  video: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM64 288c0-17.7 14.3-32 32-32H224c17.7 0 32 14.3 32 32V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V288zm259.7-11.3c5.2 2.7 8.3 8 8.3 13.8v123c0 5.8-3.2 11.2-8.3 13.8s-11.3 2.3-16.1-.9L256 392.7V312l51.5-32.6c4.9-3.1 11-3.4 16.1-.8z"/></svg>',
  code: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM200.4 281.7c5.8 6.7 5.2 16.8-1.5 22.6L165.5 333l33.4 28.7c6.7 5.8 7.4 15.9 1.6 22.6s-15.9 7.4-22.6 1.6l-48-41.2c-3.5-3-5.5-7.4-5.5-12s2-9 5.5-12l48-41.2c6.7-5.8 16.8-5.2 22.6 1.5zM226 281.7c5.8-6.7 15.9-7.4 22.6-1.5l48 41.2c3.5 3 5.5 7.4 5.5 12s-2 9-5.5 12l-48 41.2c-6.7 5.8-16.8 5.2-22.6-1.6s-5.2-16.8 1.5-22.6L260.5 333 227.5 304.4c-6.7-5.8-7.4-15.9-1.5-22.6z"/></svg>',
  file: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0z"/></svg>'
}, qt = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>', Oe = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>', Js = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>', Zs = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 105.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>', er = /* @__PURE__ */ new Set(["mp3", "wav", "flac", "m4a", "ogg", "aac", "opus"]), tr = /* @__PURE__ */ new Set(["mp4", "mov", "webm", "mkv", "avi", "m4v"]);
function Ut(n) {
  const r = String(n?.content_type || "").toLowerCase(), e = String(n?.filename || "").split(".").pop()?.toLowerCase() || "";
  return r.includes("pdf") || e === "pdf" ? "pdf" : r.startsWith("audio/") || er.has(e) ? "audio" : r.startsWith("video/") || tr.has(e) ? "video" : r.includes("zip") || ["zip", "tar", "gz", "7z", "rar"].includes(e) ? "zip" : r.includes("sheet") || r.includes("excel") || r.includes("csv") || ["xls", "xlsx", "csv", "numbers"].includes(e) ? "sheet" : r.includes("word") || r.includes("document") || ["doc", "docx", "txt", "md", "rtf"].includes(e) ? "doc" : ["js", "ts", "rb", "py", "go", "rs", "java", "json", "xml", "html", "css", "sh", "sql"].includes(e) ? "code" : "file";
}
function Me(n) {
  if (n == null || n === "") return [];
  let r = n;
  if (typeof r == "string")
    try {
      r = JSON.parse(r);
    } catch {
      return [];
    }
  return Array.isArray(r) || (r = [r]), r.filter((e) => e && (e.url || e.signed_id)).map((e, t) => ({
    id: e.id != null ? String(e.id) : `att_${t}`,
    filename: e.filename || e.name || `attachment-${t + 1}`,
    url: e.url || "#",
    content_type: e.content_type || e.contentType || e.mime_type || "",
    byte_size: e.byte_size ?? e.byteSize ?? e.size ?? null,
    preview_url: e.preview_url || e.previewUrl || (z(e) ? e.url : null),
    thumb_url: e.thumb_url || e.thumbUrl || (z(e) ? e.url : null),
    signed_id: e.signed_id || e.signedId || null
  }));
}
function Wt({
  thumbSize: n = 28,
  maxThumbs: r = 4,
  empty: e = "",
  editable: t = !1,
  accept: s = null,
  multiple: i = !0,
  download: o = !1,
  onUpload: a = null,
  onRemove: l = null
} = {}) {
  return (d) => {
    const { value: c, td: u, row: p, col: f } = d, g = Me(c);
    if (u && (u.classList.add("sg-renderer-attachments-cell"), u.dataset.attachmentCount = String(g.length), u._sgAttachments = g), g.length === 0 && !t)
      return e ? document.createTextNode(e) : "";
    const _ = h("div", { class: "sg-renderer-attachments", role: "group" }), y = g.slice(0, r), L = Math.max(0, g.length - y.length);
    if (y.forEach((m) => _.append(nr(m, n, g, o))), L > 0) {
      const m = h(
        "span",
        { class: "sg-attach-more", title: `${L} more` },
        document.createTextNode(`+${L}`)
      );
      m.addEventListener("click", (v) => {
        v.stopPropagation(), Xt(g, g[y.length]);
      }), _.append(m);
    }
    if (t) {
      const m = h("button", {
        type: "button",
        class: "sg-attach-add",
        title: "Add files",
        "aria-label": "Add attachments",
        "data-sg-attach": "add"
      });
      m.innerHTML = qt, m.addEventListener("click", (v) => {
        v.stopPropagation(), nt(u, d, { thumbSize: n, accept: s, multiple: i, onUpload: a, onRemove: l });
      }), _.append(m), sr(u, d, { onUpload: a }), u.addEventListener("dblclick", (v) => {
        v._sgAttachmentHandled || (v._sgAttachmentHandled = !0, v.stopPropagation(), nt(u, d, { thumbSize: n, accept: s, multiple: i, onUpload: a, onRemove: l }));
      }, { once: !1 });
    }
    return _;
  };
}
function nr(n, r, e, t) {
  const s = h("button", {
    type: "button",
    class: "sg-attach-thumb",
    title: `${n.filename}${n.byte_size != null ? " · " + oe(n.byte_size) : ""}`,
    "data-attachment-id": n.id,
    "data-attachment-kind": z(n) ? "image" : "file",
    "aria-label": n.filename,
    style: `width: ${r}px; height: ${r}px;`
  });
  if (z(n) && n.thumb_url)
    s.append(h("img", {
      src: n.thumb_url,
      alt: n.filename,
      loading: "lazy",
      decoding: "async",
      width: String(r),
      height: String(r)
    }));
  else {
    const i = Ut(n), o = h("span", { class: `sg-attach-icon is-${i}`, "aria-hidden": "true" });
    o.innerHTML = Le[i] || Le.file, s.append(o);
  }
  return s.addEventListener("click", (i) => {
    if (i.stopPropagation(), z(n)) {
      const o = e.filter(z);
      Xt(o.length ? o : [n], n);
    } else if (t) {
      const o = document.createElement("a");
      o.href = n.url, o.download = n.filename, document.body.appendChild(o), o.click(), o.remove();
    } else
      window.open(n.url, "_blank", "noopener,noreferrer");
  }), s;
}
let se = null;
function Xt(n, r) {
  Re();
  const e = n.filter(z);
  if (e.length === 0) return;
  let t = Math.max(0, e.findIndex((f) => f.id === r?.id));
  t < 0 && (t = 0);
  const s = h("div", { class: "sg-image-zoom sg-attach-lightbox", role: "dialog", "aria-modal": "true" }), i = h("div", { class: "sg-attach-lightbox-stage" }), o = h("img", { class: "sg-image-zoom-img", alt: "" }), a = h("div", { class: "sg-attach-lightbox-caption" }), l = h("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-prev",
    "aria-label": "Previous attachment"
  }), d = h("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-next",
    "aria-label": "Next attachment"
  });
  l.innerHTML = Js, d.innerHTML = Zs;
  function c() {
    const f = e[t];
    o.src = f.preview_url || f.url, o.alt = f.filename, a.textContent = `${f.filename}${f.byte_size != null ? " · " + oe(f.byte_size) : ""} (${t + 1}/${e.length})`, l.style.visibility = e.length > 1 ? "visible" : "hidden", d.style.visibility = e.length > 1 ? "visible" : "hidden";
  }
  function u(f) {
    t = (t + f + e.length) % e.length, c();
  }
  function p(f) {
    f.key === "Escape" ? Re() : f.key === "ArrowLeft" ? u(-1) : f.key === "ArrowRight" && u(1);
  }
  s.addEventListener("click", (f) => {
    (f.target === s || f.target === i) && Re();
  }), l.addEventListener("click", (f) => {
    f.stopPropagation(), u(-1);
  }), d.addEventListener("click", (f) => {
    f.stopPropagation(), u(1);
  }), document.addEventListener("keydown", p), i.append(l, o, d), s.append(i, a), document.body.appendChild(s), se = { overlay: s, onKey: p }, c();
}
function Re() {
  se && (document.removeEventListener("keydown", se.onKey), se.overlay.remove(), se = null);
}
let be = null;
function sr(n, r, { onUpload: e }) {
  n._sgAttachDropBound || (n._sgAttachDropBound = !0, n.addEventListener("dragover", (t) => {
    t.dataTransfer?.types?.includes("Files") && (t.preventDefault(), n.classList.add("is-drop-target"));
  }), n.addEventListener("dragleave", () => n.classList.remove("is-drop-target")), n.addEventListener("drop", async (t) => {
    if (!t.dataTransfer?.files?.length) return;
    t.preventDefault(), n.classList.remove("is-drop-target");
    const s = Array.from(t.dataTransfer.files);
    await _e(n, r, s, e);
  }));
}
function nt(n, r, e) {
  ue();
  const { thumbSize: t, accept: s, multiple: i, onUpload: o, onRemove: a } = e, l = n._sgAttachments || Me(r.value), d = h("div", { class: "sg-attach-editor", role: "dialog", "aria-modal": "false" });
  d.addEventListener("mousedown", (m) => m.stopPropagation());
  const c = h("div", { class: "sg-attach-editor-header" }, [
    h(
      "span",
      { class: "sg-attach-editor-title" },
      document.createTextNode(l.length === 1 ? "1 attachment" : `${l.length} attachments`)
    ),
    (() => {
      const m = h("button", {
        type: "button",
        class: "sg-attach-editor-close",
        "aria-label": "Close"
      });
      return m.innerHTML = Oe, m.addEventListener("click", ue), m;
    })()
  ]), u = h("div", { class: "sg-attach-editor-grid" });
  function p() {
    const m = n._sgAttachments || [];
    u.replaceChildren(), m.forEach((v) => u.append(rr(v, n, r, a, t))), c.firstChild.textContent = m.length === 1 ? "1 attachment" : `${m.length} attachments`;
  }
  p(), n._sgAttachRepaint = p;
  const f = h("label", { class: "sg-attach-dropzone", tabindex: "0" });
  f.innerHTML = `
    <span class="sg-attach-dropzone-icon" aria-hidden="true">${qt}</span>
    <span class="sg-attach-dropzone-text">Drop files, paste, or <strong>browse</strong></span>
  `;
  const g = h("input", { type: "file", multiple: i ? "" : null, accept: s || null });
  g.style.display = "none", f.append(g), g.addEventListener("change", async () => {
    g.files?.length && (await _e(n, r, Array.from(g.files), o), g.value = "", p());
  }), f.addEventListener("dragover", (m) => {
    m.dataTransfer?.types?.includes("Files") && (m.preventDefault(), f.classList.add("is-drop-target"));
  }), f.addEventListener("dragleave", () => f.classList.remove("is-drop-target")), f.addEventListener("drop", async (m) => {
    m.dataTransfer?.files?.length && (m.preventDefault(), f.classList.remove("is-drop-target"), await _e(n, r, Array.from(m.dataTransfer.files), o), p());
  });
  function _(m) {
    const v = Array.from(m.clipboardData?.files || []);
    v.length !== 0 && (m.preventDefault(), _e(n, r, v, o).then(p));
  }
  d.addEventListener("paste", _);
  function y(m) {
    m.key === "Escape" && ue();
  }
  function L(m) {
    !d.contains(m.target) && !n.contains(m.target) && ue();
  }
  document.addEventListener("keydown", y), setTimeout(() => document.addEventListener("mousedown", L), 0), d.append(c, u, f), document.body.appendChild(d), Q(d, n), f.focus(), be = { pop: d, onKey: y, onDocClick: L, anchor: n };
}
function ue() {
  if (!be) return;
  const { pop: n, onKey: r, onDocClick: e, anchor: t } = be;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), n.remove(), t && delete t._sgAttachRepaint, be = null;
}
function rr(n, r, e, t, s) {
  const i = h("div", { class: "sg-attach-editor-tile", "data-attachment-id": n.id }), o = h("div", {
    class: "sg-attach-editor-preview",
    style: `width: ${s * 2}px; height: ${s * 2}px;`
  });
  if (z(n) && n.thumb_url)
    o.append(h("img", {
      src: n.thumb_url,
      alt: n.filename,
      width: String(s * 2),
      height: String(s * 2)
    }));
  else {
    const d = Ut(n), c = h("span", { class: `sg-attach-icon is-${d}`, "aria-hidden": "true" });
    c.innerHTML = Le[d] || Le.file, o.append(c);
  }
  const a = h("div", { class: "sg-attach-editor-meta" }, [
    h(
      "div",
      { class: "sg-attach-editor-name", title: n.filename },
      document.createTextNode(n.filename)
    ),
    h(
      "div",
      { class: "sg-attach-editor-size" },
      document.createTextNode(n.byte_size != null ? oe(n.byte_size) : "")
    )
  ]), l = h("button", {
    type: "button",
    class: "sg-attach-editor-remove",
    title: "Remove",
    "aria-label": `Remove ${n.filename}`,
    "data-sg-attach": "remove",
    "data-attachment-id": n.id
  });
  return l.innerHTML = Oe, l.addEventListener("click", async (d) => {
    d.stopPropagation(), await ir(r, e, n, t);
  }), i.append(o, a, l), i;
}
function Q(n, r) {
  const e = r.getBoundingClientRect();
  n.style.position = "fixed", n.style.left = `${Math.max(8, Math.min(window.innerWidth - 360, e.left))}px`, window.innerHeight - e.bottom > 280 ? n.style.top = `${e.bottom + 4}px` : n.style.top = `${Math.max(8, e.top - n.offsetHeight - 4)}px`;
}
async function _e(n, r, e, t) {
  if (e.length) {
    n.classList.add("is-uploading");
    try {
      let s;
      if (typeof t == "function") {
        const i = await t(e, r);
        s = Array.isArray(i) ? i : (n._sgAttachments || []).concat(st(e));
      } else
        s = (n._sgAttachments || []).concat(st(e));
      Yt(n, r, Me(s));
    } finally {
      n.classList.remove("is-uploading");
    }
  }
}
async function ir(n, r, e, t) {
  let s;
  if (typeof t == "function") {
    const i = await t(e, r);
    s = Array.isArray(i) ? i : (n._sgAttachments || []).filter((o) => o.id !== e.id);
  } else
    s = (n._sgAttachments || []).filter((i) => i.id !== e.id);
  Yt(n, r, Me(s));
}
function st(n) {
  return n.map((r, e) => ({
    id: `local_${Date.now()}_${e}`,
    filename: r.name,
    url: URL.createObjectURL(r),
    content_type: r.type || "",
    byte_size: r.size,
    preview_url: r.type?.startsWith("image/") ? URL.createObjectURL(r) : null,
    thumb_url: r.type?.startsWith("image/") ? URL.createObjectURL(r) : null
  }));
}
function Yt(n, r, e) {
  const { row: t, col: s, api: i } = r;
  t && s?.field != null && (t[s.field] = e), n._sgAttachments = e, i?.applyTransaction ? i.applyTransaction({ update: [t] }) : i?.refreshCells && i.refreshCells({ rowIds: [t?.id ?? t?._sg_id] }), n._sgAttachRepaint && n._sgAttachRepaint();
}
const or = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"], Qt = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory"
};
function ar(n) {
  if (n == null || n === "") return null;
  if (typeof n == "string") return { _raw: n };
  if (typeof n != "object") return null;
  const r = n.state ? String(n.state).trim().toUpperCase() : "";
  return {
    address1: n.address1 ? String(n.address1) : "",
    address2: n.address2 ? String(n.address2) : "",
    address3: n.address3 ? String(n.address3) : "",
    suburb: n.suburb ? String(n.suburb) : "",
    state: r,
    postcode: n.postcode != null ? String(n.postcode) : "",
    country: n.country ? String(n.country) : ""
  };
}
function lr(n) {
  if (!n || n._raw) return n?._raw || "";
  const r = [n.address1, n.address2, n.address3].filter(Boolean), e = [n.suburb, n.state, n.postcode].filter(Boolean).join(" ");
  return e && r.push(e), n.country && n.country.toLowerCase() !== "australia" && r.push(n.country), r.join(`
`);
}
function Jt({ editable: n = !0, empty: r = "" } = {}) {
  return (e) => {
    const { value: t, td: s } = e, i = ar(t);
    if (s && (s.classList.add("sg-renderer-address-au-cell"), s._sgAddress = i), !i) return r ? document.createTextNode(r) : "";
    n && s && !s._sgAddressEditBound && (s._sgAddressEditBound = !0, s.addEventListener("dblclick", (d) => {
      d._sgAddressHandled || (d._sgAddressHandled = !0, d.stopPropagation(), dr(s, e));
    }));
    const o = h("div", {
      class: "sg-renderer-address-au",
      title: lr(i)
    });
    if (i._raw)
      return o.append(document.createTextNode(i._raw)), o;
    const a = [i.address1, i.address2].filter(Boolean).join(", "), l = i.suburb || i.state || i.postcode;
    return a && o.append(h("span", { class: "sg-address-au-street" }, document.createTextNode(a))), a && l && o.append(h("span", { class: "sg-address-au-sep" }, document.createTextNode(", "))), i.suburb && o.append(document.createTextNode(i.suburb)), i.state && (i.suburb && o.append(document.createTextNode(" ")), o.append(h("span", {
      class: `sg-address-au-state is-${i.state.toLowerCase()}`,
      title: Qt[i.state] || i.state
    }, document.createTextNode(i.state)))), i.postcode && ((i.suburb || i.state) && o.append(document.createTextNode(" ")), o.append(h(
      "span",
      { class: "sg-address-au-postcode" },
      document.createTextNode(i.postcode)
    ))), i.country && i.country.toLowerCase() !== "australia" && (o.append(document.createTextNode(" ")), o.append(h(
      "span",
      { class: "sg-address-au-country" },
      document.createTextNode(i.country)
    ))), o;
  };
}
let ye = null;
function dr(n, r) {
  te();
  const e = n._sgAddress && !n._sgAddress._raw ? { ...n._sgAddress } : { address1: "", address2: "", address3: "", suburb: "", state: "", postcode: "", country: "Australia" };
  e.country || (e.country = "Australia");
  const t = h("div", { class: "sg-address-au-editor", role: "dialog", "aria-modal": "false" });
  t.addEventListener("mousedown", (R) => R.stopPropagation());
  const s = h("div", { class: "sg-address-au-editor-header" });
  s.append(
    h("span", { class: "sg-address-au-editor-title" }, document.createTextNode("Edit address"))
  );
  const i = h("form", { class: "sg-address-au-editor-form", novalidate: "novalidate" });
  function o({ label: R, name: $, type: P = "text", value: q = "", maxlength: U, inputmode: ae, placeholder: le, autocomplete: de }) {
    const W = h("label", { class: "sg-address-au-editor-field", "data-field": $ });
    W.append(h("span", { class: "sg-address-au-editor-label" }, document.createTextNode(R)));
    const ee = h("input", {
      type: P,
      name: $,
      value: q || "",
      maxlength: U || null,
      inputmode: ae || null,
      placeholder: le || null,
      autocomplete: de || null,
      class: "sg-address-au-editor-input"
    });
    return W.append(ee), { wrap: W, input: ee };
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
  }), d = h("div", { class: "sg-address-au-editor-line3-wrap" }), c = o({
    label: "Address line 3",
    name: "address3",
    value: e.address3,
    placeholder: "Level / building (optional)",
    autocomplete: "address-line3"
  });
  d.append(c.wrap);
  const u = h("button", {
    type: "button",
    class: "sg-address-au-editor-add-line"
  }, document.createTextNode("+ Add another line"));
  function p() {
    const R = !!(l.input.value.trim() || c.input.value.trim());
    d.hidden = !R, u.hidden = R;
  }
  l.input.addEventListener("input", p), u.addEventListener("click", () => {
    d.hidden = !1, u.hidden = !0, c.input.focus();
  });
  const f = o({
    label: "Suburb",
    name: "suburb",
    value: e.suburb,
    placeholder: "Bondi",
    autocomplete: "address-level2"
  }), g = h("label", { class: "sg-address-au-editor-field", "data-field": "state" });
  g.append(h("span", { class: "sg-address-au-editor-label" }, document.createTextNode("State")));
  const _ = h("select", {
    name: "state",
    class: "sg-address-au-editor-input sg-address-au-editor-state",
    autocomplete: "address-level1"
  });
  _.append(h("option", { value: "" }, document.createTextNode("—")));
  for (const R of or) {
    const $ = h(
      "option",
      { value: R, selected: e.state === R ? "" : null },
      document.createTextNode(`${R} — ${Qt[R]}`)
    );
    _.append($);
  }
  g.append(_);
  const y = o({
    label: "Postcode",
    name: "postcode",
    type: "text",
    value: e.postcode,
    maxlength: 4,
    inputmode: "numeric",
    placeholder: "2026",
    autocomplete: "postal-code"
  });
  y.input.classList.add("sg-address-au-editor-postcode"), y.input.addEventListener("input", () => {
    y.input.value = y.input.value.replace(/\D/g, "").slice(0, 4);
  });
  const L = o({
    label: "Country",
    name: "country",
    value: e.country,
    autocomplete: "country-name"
  }), m = h("div", { class: "sg-address-au-editor-grid" });
  m.append(a.wrap), m.append(l.wrap, u), m.append(d), m.append(f.wrap, g, y.wrap), m.append(L.wrap);
  const v = h("div", { class: "sg-address-au-editor-footer" }), w = h(
    "button",
    { type: "button", class: "sg-address-au-editor-cancel" },
    document.createTextNode("Cancel")
  ), S = h(
    "button",
    { type: "submit", class: "sg-address-au-editor-save" },
    document.createTextNode("Save")
  );
  v.append(w, S), i.append(m, v), t.append(s, i);
  function A() {
    return {
      address1: a.input.value.trim(),
      address2: l.input.value.trim(),
      address3: d.hidden ? "" : c.input.value.trim(),
      suburb: f.input.value.trim(),
      state: _.value,
      postcode: y.input.value.trim(),
      country: L.input.value.trim() || "Australia"
    };
  }
  function k() {
    const R = A(), $ = !R.address1 && !R.suburb && !R.state && !R.postcode;
    cr(n, r, $ ? null : R), te();
  }
  i.addEventListener("submit", (R) => {
    R.preventDefault(), k();
  }), w.addEventListener("click", () => te());
  function C(R) {
    R.key === "Escape" && (R.stopPropagation(), te());
  }
  function T(R) {
    !t.contains(R.target) && !n.contains(R.target) && te();
  }
  document.addEventListener("keydown", C), setTimeout(() => document.addEventListener("mousedown", T), 0), document.body.appendChild(t), Q(t, n), p(), a.input.focus(), a.input.select(), ye = { pop: t, onKey: C, onDocClick: T };
}
function te() {
  if (!ye) return;
  const { pop: n, onKey: r, onDocClick: e } = ye;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), n.remove(), ye = null;
}
function cr(n, r, e) {
  const { row: t, col: s, api: i } = r, o = t && s?.field != null ? t[s.field] : null;
  t && s?.field != null && (t[s.field] = e), n._sgAddress = e, i?.applyTransaction ? i.applyTransaction({ update: [t] }) : i?.refreshCells && i.refreshCells({ rowIds: [t?.id ?? t?._sg_id] });
  const a = n.closest('[data-controller~="grid"]');
  a && a.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
    bubbles: !0,
    detail: { rowId: t?.id ?? t?._sg_id, colId: s?.field, oldValue: o, newValue: e }
  }));
}
function Zt({ color: n = "green", showValue: r = !1 } = {}) {
  return ({ value: e }) => {
    let t = Number(e);
    Number.isFinite(t) || (t = 0), t = Math.max(0, Math.min(100, t));
    const s = h("div", { class: "sg-renderer-progress" }, [
      h("div", { class: `sg-renderer-progress-fill sg-fill-${n}`, style: `width: ${t}%;` })
    ]);
    return r ? h("div", { class: "sg-renderer-progress-wrap" }, [
      s,
      h("span", { class: "sg-renderer-progress-label" }, document.createTextNode(`${Math.round(t)}%`))
    ]) : s;
  };
}
const re = '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>';
function en({ max: n = 5, precision: r = 0.5 } = {}) {
  const e = r > 0 ? 1 / r : 2;
  return ({ value: t }) => {
    let s = parseFloat(t);
    Number.isFinite(s) || (s = 0), s = Math.max(0, Math.min(n, s)), s = Math.round(s * e) / e;
    const i = h("div", {
      class: "sg-renderer-stars",
      role: "img",
      "aria-label": `${s} out of ${n} stars`
    });
    for (let o = 1; o <= n; o++)
      if (s >= o)
        i.append(h("span", { class: "sg-renderer-star is-full", "aria-hidden": "true" }, re));
      else if (s > o - 1) {
        const a = Math.round((s - (o - 1)) * 100);
        i.append(h(
          "span",
          { class: "sg-renderer-star is-partial", "aria-hidden": "true" },
          `${re}<span class="sg-star-clip" style="width: ${a}%;">${re}</span>`
        ));
      } else
        i.append(h("span", { class: "sg-renderer-star is-empty", "aria-hidden": "true" }, re));
    return i;
  };
}
function tn({ separator: n = "," } = {}) {
  return ({ value: r }) => {
    if (E(r)) return "";
    const e = Array.isArray(r) ? r : String(r).split(n), t = h("div", { class: "sg-renderer-tags" });
    for (const s of e) {
      const i = String(s).trim();
      i && t.append(h("span", { class: "sg-renderer-tag" }, document.createTextNode(i)));
    }
    return t;
  };
}
function nn({ showCode: n = !0, fallback: r = null } = {}) {
  return ({ value: e }) => {
    if (E(e)) return "";
    const t = String(e).trim().toUpperCase();
    if (t.length !== 2 || !/^[A-Z]{2}$/.test(t))
      return r ?? document.createTextNode(String(e));
    const s = String.fromCodePoint(
      127462 + t.charCodeAt(0) - 65,
      127462 + t.charCodeAt(1) - 65
    ), i = h("span", { class: "sg-renderer-country" });
    return i.append(h("span", { class: "sg-renderer-flag", "aria-hidden": "true" }, document.createTextNode(s))), n && i.append(h("span", { class: "sg-renderer-country-code" }, document.createTextNode(t))), i;
  };
}
function ur(n) {
  const r = String(n).replace(/\s+/g, "");
  if (r.length !== 11 || !/^\d{11}$/.test(r)) return !1;
  const e = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19], t = parseInt(r[0], 10) - 1 + r.slice(1);
  let s = 0;
  for (let i = 0; i < 11; i++) s += parseInt(t[i], 10) * e[i];
  return s % 89 === 0;
}
function pr(n) {
  const r = String(n).replace(/\D/g, "");
  return r.length !== 11 ? String(n) : `${r.slice(0, 2)} ${r.slice(2, 5)} ${r.slice(5, 8)} ${r.slice(8)}`;
}
function sn() {
  return ({ value: n }) => {
    if (E(n)) return "";
    if (!ur(n))
      return h("span", { class: "sg-renderer-invalid", title: "Invalid ABN" }, document.createTextNode(String(n)));
    const r = String(n).replace(/\s+/g, "");
    return h("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/ABN/View?id=${r}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(pr(n)));
  };
}
function rn({
  lookup: n = null,
  nameField: r = null,
  avatarField: e = null,
  windowKey: t = "__sgUsers",
  size: s = 22
} = {}) {
  return ({ value: i, row: o }) => {
    if (E(i)) return "";
    let a = null;
    if (typeof n == "function" && (a = n(i, o) || null), !a && r && (a = { name: o?.[r], avatarUrl: e ? o?.[e] : null }), !a && typeof window < "u" && window[t]) {
      const c = window[t];
      c instanceof Map ? a = c.get(i) || c.get(String(i)) || null : Array.isArray(c) && (a = c.find((u) => `${u.id}` == `${i}`) || null);
    }
    const l = a?.name ?? String(i), d = h("span", { class: "sg-renderer-avatar" });
    if (a?.avatarUrl)
      d.append(h("img", {
        class: "sg-renderer-avatar-img",
        src: a.avatarUrl,
        width: String(s),
        height: String(s),
        alt: ""
      }));
    else {
      const c = String(l).split(/\s+/).filter(Boolean).slice(0, 2).map((u) => u[0]?.toUpperCase() || "").join("");
      d.append(h("span", {
        class: "sg-renderer-avatar-initials",
        style: `width: ${s}px; height: ${s}px;`
      }, document.createTextNode(c)));
    }
    return d.append(h("span", { class: "sg-renderer-avatar-name" }, document.createTextNode(l))), d;
  };
}
const fr = {
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
function hr(n) {
  return String(n).toLowerCase().split(/[\s_-]+/).map((r) => r && r[0].toUpperCase() + r.slice(1)).join(" ");
}
function gr(n = {}, r = null, e = {}) {
  const { titleCase: t = !0, defaultColor: s = "gray" } = e, i = {};
  for (const [a, l] of Object.entries(n)) i[String(a).toLowerCase()] = l;
  const o = {};
  if (r) for (const [a, l] of Object.entries(r)) o[String(a).toLowerCase()] = l;
  return ({ value: a }) => {
    if (E(a)) return "";
    const l = String(a).toLowerCase(), d = i[l] || s, c = t ? hr(a) : String(a), u = h("span", { class: `sg-pill sg-pill-${d}` });
    if (r) {
      const p = o[l], f = p ? fr[p] || p : null;
      if (f) {
        const g = h("span", { class: "sg-pill-icon", "aria-hidden": "true" });
        g.innerHTML = f, u.append(g);
      }
    }
    return u.append(h("span", { class: "sg-pill-label" }, document.createTextNode(c))), u;
  };
}
function on({
  truthy: n = He,
  disabled: r = !1
} = {}) {
  return (e) => {
    const { value: t, row: s, col: i, api: o, td: a } = e;
    a && a.classList.add("sg-renderer-checkbox-cell");
    const l = h("span", { class: "sg-renderer-checkbox" }), d = h("input", {
      type: "checkbox",
      class: "sg-renderer-checkbox-input",
      disabled: r ? "" : null,
      "aria-label": i?.field || "toggle"
    });
    return t == null || t === "" ? d.indeterminate = !0 : d.checked = n(t), d.addEventListener("click", (c) => c.stopPropagation()), d.addEventListener("change", (c) => {
      if (r) {
        c.preventDefault();
        return;
      }
      const u = d.checked, p = s && i?.field != null ? s[i.field] : null;
      s && i?.field != null && (s[i.field] = u), o?.applyTransaction && o.applyTransaction({ update: [s] });
      const f = a?.closest('[data-controller~="grid"]');
      f && f.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: s?.id ?? s?._sg_id, colId: i?.field, oldValue: p, newValue: u }
      }));
    }), l.append(d), l;
  };
}
const mr = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z"/></svg>', ke = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>', br = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>', _r = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/></svg>', yr = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/></svg>', vr = Oe;
function an(n) {
  if (n == null || n === "") return null;
  if (typeof n == "string") {
    const e = n.trim();
    if (!e) return null;
    const t = e.split("/").pop()?.match(/^[^?#]+/)?.[0] || "";
    return { url: e, filename: t || "audio", byte_size: null, duration: null };
  }
  if (typeof n != "object") return null;
  const r = n.url || n.src || n.href;
  return r ? {
    url: String(r),
    filename: n.filename || n.name || String(r).split("/").pop()?.split("?")[0] || "audio",
    byte_size: n.byte_size ?? n.byteSize ?? n.size ?? null,
    duration: Number.isFinite(n.duration) ? Number(n.duration) : null,
    content_type: n.content_type || n.contentType || n.mime_type || ""
  } : null;
}
function ie(n) {
  (!Number.isFinite(n) || n < 0) && (n = 0);
  const r = Math.floor(n), e = Math.floor(r / 3600), t = Math.floor(r % 3600 / 60), s = r % 60, i = (o) => String(o).padStart(2, "0");
  return e > 0 ? `${e}:${i(t)}:${i(s)}` : `${t}:${i(s)}`;
}
function ln({
  showFilename: n = !0,
  iconOnly: r = !1,
  empty: e = "",
  preferHowler: t = !0,
  skipSeconds: s = 10
} = {}) {
  return (i) => {
    const { value: o, td: a } = i, l = an(o);
    if (a && (a.classList.add("sg-renderer-audio-cell"), a._sgAudio = l, a._sgAudioOpts = { preferHowler: t, skipSeconds: s }), !l) return e ? document.createTextNode(e) : "";
    a && !a._sgAudioDblBound && (a._sgAudioDblBound = !0, a.addEventListener("dblclick", (u) => {
      u._sgAudioHandled || (u._sgAudioHandled = !0, u.stopPropagation(), u.preventDefault(), rt(a, i));
    }));
    const d = h("div", { class: "sg-renderer-audio" }), c = h("button", {
      type: "button",
      class: "sg-audio-icon",
      title: `${l.filename}${l.byte_size != null ? " · " + oe(l.byte_size) : ""} — double-click to play`,
      "aria-label": `Play ${l.filename}`,
      "data-sg-audio": "open"
    });
    if (c.innerHTML = mr, c.addEventListener("click", (u) => {
      u.stopPropagation(), rt(a, i);
    }), c.addEventListener("dblclick", (u) => {
      u._sgAudioHandled = !0, u.stopPropagation();
    }), d.append(c), n && !r) {
      const u = h(
        "span",
        { class: "sg-audio-name" },
        document.createTextNode(l.filename)
      );
      d.append(u), l.duration != null && d.append(h(
        "span",
        { class: "sg-audio-duration" },
        document.createTextNode(ie(l.duration))
      ));
    }
    return d;
  };
}
function wr(n, { preferHowler: r } = {}) {
  return r && typeof window < "u" && window.Howl ? new Sr(n) : new Cr(n);
}
class Cr {
  constructor(r) {
    this.audio = new Audio(), this.audio.preload = "metadata", this.audio.src = r, this._evMap = { load: "loadedmetadata", end: "ended", play: "play", pause: "pause", error: "error" }, this._handlers = /* @__PURE__ */ new Map();
  }
  play() {
    return this.audio.play();
  }
  pause() {
    this.audio.pause();
  }
  seek(r) {
    if (r == null) return this.audio.currentTime || 0;
    this.audio.currentTime = Math.max(0, r);
  }
  duration() {
    const r = this.audio.duration;
    return Number.isFinite(r) ? r : 0;
  }
  isPlaying() {
    return !this.audio.paused && !this.audio.ended;
  }
  on(r, e) {
    const t = this._evMap[r] || r;
    this.audio.addEventListener(t, e), this._handlers.set(e, [t, e]);
  }
  off(r, e) {
    const t = this._handlers.get(e);
    t && this.audio.removeEventListener(t[0], t[1]), this._handlers.delete(e);
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
class Sr {
  constructor(r) {
    this.howl = new window.Howl({ src: [r], html5: !0, preload: !0 });
  }
  play() {
    this.howl.play();
  }
  pause() {
    this.howl.pause();
  }
  seek(r) {
    if (r == null) {
      const e = this.howl.seek();
      return typeof e == "number" ? e : 0;
    }
    this.howl.seek(Math.max(0, r));
  }
  duration() {
    return this.howl.duration() || 0;
  }
  isPlaying() {
    return this.howl.playing();
  }
  on(r, e) {
    this.howl.on(r, e);
  }
  off(r, e) {
    this.howl.off(r, e);
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
let ve = null;
function rt(n, r) {
  pe();
  const e = n._sgAudio || an(r.value);
  if (!e) return;
  const t = n._sgAudioOpts || { preferHowler: !0, skipSeconds: 10 }, s = wr(e.url, t), i = h("div", { class: "sg-audio-player", role: "dialog", "aria-label": "Audio player" });
  i.addEventListener("mousedown", (D) => D.stopPropagation());
  const o = h("div", { class: "sg-audio-player-header" }), a = h(
    "div",
    { class: "sg-audio-player-name", title: e.filename },
    document.createTextNode(e.filename)
  ), l = h("div", { class: "sg-audio-player-meta" }), d = [];
  e.byte_size != null && d.push(oe(e.byte_size)), s.backendName() === "howler" && d.push("howler.js"), l.textContent = d.join(" · ");
  const c = h("button", {
    type: "button",
    class: "sg-audio-player-close",
    "aria-label": "Close player"
  });
  c.innerHTML = vr, c.addEventListener("click", pe), o.append(a, l, c);
  const u = h("div", {
    class: "sg-audio-track",
    role: "slider",
    "aria-label": "Seek",
    tabindex: "0",
    "aria-valuemin": "0",
    "aria-valuemax": "0",
    "aria-valuenow": "0"
  }), p = h("div", { class: "sg-audio-track-fill" }), f = h("div", { class: "sg-audio-track-thumb" });
  u.append(p, f);
  const g = h("div", { class: "sg-audio-times" }), _ = h("span", { class: "sg-audio-time-current" }, document.createTextNode("0:00")), y = h(
    "span",
    { class: "sg-audio-time-total" },
    document.createTextNode(e.duration ? ie(e.duration) : "--:--")
  );
  g.append(_, y);
  const L = h("div", { class: "sg-audio-transport" }), m = h("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Back ${t.skipSeconds}s`,
    "aria-label": `Back ${t.skipSeconds} seconds`
  });
  m.innerHTML = _r;
  const v = h("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-play",
    title: "Play / pause (Space)",
    "aria-label": "Play",
    "data-state": "paused"
  });
  v.innerHTML = ke;
  const w = h("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Forward ${t.skipSeconds}s`,
    "aria-label": `Forward ${t.skipSeconds} seconds`
  });
  w.innerHTML = yr, L.append(m, v, w), i.append(o, u, g, L);
  let S = e.duration ?? 0, A = !1, k = null;
  function C(D) {
    const F = Math.max(0, Math.min(100, D));
    p.style.width = F + "%", f.style.left = F + "%";
  }
  function T() {
    const D = s.seek(), O = s.duration() || 0 || S || 0;
    if (O > 0 && O !== S && (S = O, y.textContent = ie(S), u.setAttribute("aria-valuemax", String(Math.floor(S)))), !A) {
      const H = S > 0 ? D / S * 100 : 0;
      C(H), _.textContent = ie(D), u.setAttribute("aria-valuenow", String(Math.floor(D)));
    }
  }
  function R() {
    T(), s.isPlaying() ? k = requestAnimationFrame(R) : k = null;
  }
  function $() {
    k == null && (k = requestAnimationFrame(R));
  }
  function P() {
    k != null && cancelAnimationFrame(k), k = null;
  }
  const q = () => {
    S = s.duration(), T();
  }, U = () => {
    v.dataset.state = "playing", v.innerHTML = br, v.setAttribute("aria-label", "Pause"), $();
  }, ae = () => {
    v.dataset.state = "paused", v.innerHTML = ke, v.setAttribute("aria-label", "Play"), P(), T();
  }, le = () => {
    v.dataset.state = "paused", v.innerHTML = ke, v.setAttribute("aria-label", "Play"), P(), s.seek(0), T();
  };
  s.on("load", q), s.on("play", U), s.on("pause", ae), s.on("end", le), v.addEventListener("click", (D) => {
    D.stopPropagation(), s.isPlaying() ? s.pause() : s.play();
  }), m.addEventListener("click", (D) => {
    D.stopPropagation(), s.seek(Math.max(0, s.seek() - t.skipSeconds)), T();
  }), w.addEventListener("click", (D) => {
    D.stopPropagation();
    const F = s.duration();
    s.seek(Math.min(F || 1 / 0, s.seek() + t.skipSeconds)), T();
  });
  function de(D) {
    const F = u.getBoundingClientRect(), O = (D.clientX ?? 0) - F.left, H = Math.max(0, Math.min(1, O / F.width)), Ue = s.duration() || S;
    if (!Ue) return;
    const We = H * Ue;
    s.seek(We), C(H * 100), _.textContent = ie(We);
  }
  u.addEventListener("pointerdown", (D) => {
    D.preventDefault(), A = !0, u.setPointerCapture?.(D.pointerId), u.classList.add("is-dragging"), de(D);
  }), u.addEventListener("pointermove", (D) => {
    A && de(D);
  });
  const W = (D) => {
    if (A) {
      A = !1, u.classList.remove("is-dragging");
      try {
        u.releasePointerCapture?.(D.pointerId);
      } catch {
      }
    }
  };
  u.addEventListener("pointerup", W), u.addEventListener("pointercancel", W), u.addEventListener("keydown", (D) => {
    const F = s.duration() || S;
    if (!F) return;
    const O = D.shiftKey ? 30 : 5;
    let H = null;
    D.key === "ArrowLeft" ? H = Math.max(0, s.seek() - O) : D.key === "ArrowRight" ? H = Math.min(F, s.seek() + O) : D.key === "Home" ? H = 0 : D.key === "End" && (H = F), H != null && (D.preventDefault(), s.seek(H), T());
  });
  function ee(D) {
    D.key === "Escape" ? (D.preventDefault(), pe()) : (D.key === " " || D.code === "Space") && i.contains(document.activeElement) && (D.preventDefault(), s.isPlaying() ? s.pause() : s.play());
  }
  function qe(D) {
    !i.contains(D.target) && !n.contains(D.target) && pe();
  }
  document.addEventListener("keydown", ee), setTimeout(() => document.addEventListener("mousedown", qe), 0), document.body.appendChild(i), Q(i, n), T(), v.focus(), ve = {
    pop: i,
    backend: s,
    onKey: ee,
    onDocClick: qe,
    cleanup: () => {
      P();
      try {
        s.off("load", q), s.off("play", U), s.off("pause", ae), s.off("end", le);
      } catch {
      }
      s.destroy();
    }
  };
}
function pe() {
  if (!ve) return;
  const { pop: n, onKey: r, onDocClick: e, cleanup: t } = ve;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), t(), n.remove(), ve = null;
}
function dn({
  truthy: n = He,
  disabled: r = !1
} = {}) {
  return (e) => {
    const { value: t, row: s, col: i, api: o, td: a } = e;
    a && a.classList.add("sg-renderer-switch-cell");
    const l = t == null || t === "", d = !l && n(t), c = h("button", {
      type: "button",
      class: `sg-renderer-switch${d ? " is-on" : ""}${l ? " is-null" : ""}`,
      role: "switch",
      "aria-checked": l ? "mixed" : d ? "true" : "false",
      "aria-label": i?.field || "toggle",
      disabled: r ? "" : null
    });
    return c.append(h("span", { class: "sg-renderer-switch-thumb", "aria-hidden": "true" })), c.addEventListener("click", (u) => {
      if (u.stopPropagation(), r) return;
      const p = l ? !0 : !d, f = s && i?.field != null ? s[i.field] : null;
      s && i?.field != null && (s[i.field] = p), o?.applyTransaction && o.applyTransaction({ update: [s] });
      const g = a?.closest('[data-controller~="grid"]');
      g && g.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: s?.id ?? s?._sg_id, colId: i?.field, oldValue: f, newValue: p }
      }));
    }), c;
  };
}
const xr = /^(https?:\/\/|mailto:)/i;
function Ae(n) {
  return String(n).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Pe(n) {
  let r = n;
  return r = r.replace(/`([^`\n]+)`/g, (e, t) => `<code>${t}</code>`), r = r.replace(/\[([^\]\n]+)\]\(([^)\n]+)\)/g, (e, t, s) => xr.test(s) ? `<a href="${s}" target="_blank" rel="noopener noreferrer">${t}</a>` : e), r = r.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>"), r = r.replace(/__([^_\n]+)__/g, "<strong>$1</strong>"), r = r.replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), r = r.replace(/(^|[\s(])_([^_\n]+?)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), r = r.replace(/~~([^~\n]+)~~/g, "<del>$1</del>"), r;
}
function Lr(n) {
  const r = n.split(`
`), e = [];
  let t = null, s = [];
  const i = () => {
    t && (e.push(`<${t}>${s.map((o) => `<li>${Pe(o)}</li>`).join("")}</${t}>`), t = null, s = []);
  };
  for (const o of r) {
    const a = /^\s*[-*]\s+(.+)$/.exec(o), l = /^\s*\d+\.\s+(.+)$/.exec(o);
    a ? (t && t !== "ul" && i(), t = "ul", s.push(a[1])) : l ? (t && t !== "ol" && i(), t = "ol", s.push(l[1])) : (i(), o.trim() === "" ? e.push("") : e.push(Pe(o)));
  }
  return i(), e.join("<br>").replace(/(<br>){2,}/g, "<br><br>");
}
function cn({ inline: n = !1 } = {}) {
  return ({ value: r, td: e }) => {
    if (E(r)) return "";
    const t = Ae(r), s = n ? Pe(t) : Lr(t);
    if (e) {
      e.classList.add("sg-renderer-markdown-cell");
      const o = e.parentElement;
      o && o.tagName === "TR" && o.classList.add("sg-has-multiline");
    }
    const i = h("div", { class: `sg-renderer-markdown${n ? " is-inline" : ""}` });
    return i.innerHTML = s, i;
  };
}
function Ar(n) {
  return Ae(n).replace(/(&quot;(?:[^&\\]|\\.)*?&quot;)\s*:/g, '<span class="sg-json-key">$1</span>:').replace(/:\s*(&quot;(?:[^&\\]|\\.)*?&quot;)/g, ': <span class="sg-json-string">$1</span>').replace(/(?<=[\s:,\[])(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)(?=[\s,\]\}\n])/g, '<span class="sg-json-number">$1</span>').replace(/(?<=[\s:,\[])(true|false)(?=[\s,\]\}\n])/g, '<span class="sg-json-bool">$1</span>').replace(/(?<=[\s:,\[])(null)(?=[\s,\]\}\n])/g, '<span class="sg-json-null">$1</span>');
}
function Er(n, r) {
  const e = Array.isArray(n), t = e ? n : Object.entries(n), s = t.slice(0, r), i = t.length - s.length, o = (d) => {
    if (d == null) return "null";
    const c = typeof d;
    return c === "string" ? d.length > 18 ? `"${d.slice(0, 15)}…"` : `"${d}"` : c === "number" || c === "boolean" ? String(d) : Array.isArray(d) ? `[${d.length}]` : c === "object" ? "{…}" : String(d);
  }, a = e ? s.map(o).join(", ") : s.map(([d, c]) => `${d}: ${o(c)}`).join(", "), l = i > 0 ? `, +${i}` : "";
  return e ? `[${a}${l}]` : `{ ${a}${l} }`;
}
function un({ maxKeys: n = 3, indent: r = 2 } = {}) {
  return ({ value: e, td: t }) => {
    if (e == null || e === "") return "";
    let s = e;
    if (typeof e == "string")
      try {
        s = JSON.parse(e);
      } catch {
        return String(e);
      }
    if (s == null)
      return h("span", { class: "sg-renderer-json-scalar sg-json-null" }, document.createTextNode("null"));
    if (typeof s != "object") {
      const d = typeof s, c = d === "string" ? "sg-json-string" : d === "number" ? "sg-json-number" : "sg-json-bool", u = d === "string" ? `"${s}"` : String(s);
      return h("span", { class: `sg-renderer-json-scalar ${c}` }, document.createTextNode(u));
    }
    const i = document.createElement("details");
    i.className = "sg-renderer-json";
    const o = document.createElement("summary");
    o.className = "sg-renderer-json-summary";
    const a = h("span", { class: "sg-renderer-json-chevron", "aria-hidden": "true" });
    a.innerHTML = $s, o.append(a), o.append(h(
      "span",
      { class: "sg-renderer-json-summary-text" },
      document.createTextNode(Er(s, n))
    ));
    const l = document.createElement("pre");
    if (l.className = "sg-renderer-json-pre", l.innerHTML = Ar(JSON.stringify(s, null, r)), i.append(o, l), o.addEventListener("click", (d) => d.stopPropagation()), t) {
      t.classList.add("sg-renderer-json-cell");
      const d = t.parentElement;
      d && d.tagName === "TR" && d.classList.add("sg-has-multiline");
    }
    return i;
  };
}
function pn({
  lookup: n = null,
  windowKey: r = "__sgLinks",
  showThumb: e = !0,
  href: t = null,
  multiple: s = !1,
  fallback: i = (o) => String(o)
} = {}) {
  return ({ value: o, row: a }) => {
    if (E(o)) return "";
    const l = s ? Array.isArray(o) ? o : String(o).split(",").map((c) => c.trim()).filter(Boolean) : [o], d = h("span", { class: "sg-renderer-linked-records" });
    for (const c of l) {
      const u = Mr(c, a, n, r);
      d.append(Tr(c, a, u, { showThumb: e, href: t, fallback: i }));
    }
    return d;
  };
}
function Mr(n, r, e, t) {
  if (typeof e == "function") return e(n, r) || null;
  if (typeof window > "u") return null;
  const s = window[t];
  return s ? s instanceof Map ? s.get(n) || s.get(String(n)) || null : typeof s == "object" ? s[n] ?? s[String(n)] ?? null : null : null;
}
function Tr(n, r, e, { showThumb: t, href: s, fallback: i }) {
  const o = e?.name ?? i(n), a = typeof s == "function" ? s(n, r, e) : e?.href || null, l = document.createElement(a ? "a" : "span");
  if (l.className = "sg-renderer-linked-record", a && (l.href = a, l.target = "_blank", l.rel = "noopener noreferrer", l.addEventListener("click", (d) => d.stopPropagation())), e?.color && l.style.setProperty("--lr-tint", e.color), t && e?.thumb)
    l.append(h("img", {
      src: e.thumb,
      alt: "",
      class: "sg-renderer-linked-record-thumb",
      loading: "lazy",
      decoding: "async"
    }));
  else if (t && o) {
    const d = String(o).split(/\s+/).filter(Boolean).slice(0, 2).map((c) => c[0]?.toUpperCase() || "").join("");
    d && l.append(h("span", {
      class: "sg-renderer-linked-record-initials",
      "aria-hidden": "true"
    }, document.createTextNode(d)));
  }
  return l.append(h(
    "span",
    { class: "sg-renderer-linked-record-name" },
    document.createTextNode(o)
  )), l;
}
function fn({
  separator: n = ",",
  colorMap: r = {},
  defaultColor: e = "gray"
} = {}) {
  const t = {};
  for (const [s, i] of Object.entries(r)) t[String(s).toLowerCase()] = i;
  return ({ value: s }) => {
    if (E(s)) return "";
    const i = Array.isArray(s) ? s : String(s).split(n), o = h("div", { class: "sg-renderer-coloured-tags" });
    for (const a of i) {
      const l = String(a).trim();
      if (!l) continue;
      const d = t[l.toLowerCase()] || e, c = h(
        "span",
        { class: "sg-renderer-coloured-tag" },
        document.createTextNode(l)
      );
      /^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/.test(d) ? c.classList.add(`sg-pill-${d}`) : (c.style.background = d, c.style.color = hn(d)), o.append(c);
    }
    return o;
  };
}
function hn(n) {
  const r = Ht(n);
  return r ? Gt(r) ? "#1f2937" : "#ffffff" : "inherit";
}
function Rr(n) {
  if (n == null || n === "") return null;
  if (n instanceof Date)
    return Number.isNaN(n.valueOf()) ? null : { h: n.getHours(), m: n.getMinutes(), s: n.getSeconds() };
  if (typeof n == "number" && Number.isFinite(n)) {
    const s = (n % 86400 + 86400) % 86400;
    return { h: Math.floor(s / 3600), m: Math.floor(s % 3600 / 60), s: Math.floor(s % 60) };
  }
  const r = String(n).trim(), e = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/.exec(r);
  if (e)
    return { h: parseInt(e[1], 10), m: parseInt(e[2], 10), s: e[3] ? parseInt(e[3], 10) : 0 };
  const t = new Date(r);
  return Number.isNaN(t.valueOf()) ? null : { h: t.getHours(), m: t.getMinutes(), s: t.getSeconds() };
}
function gn({
  style: n = "24h",
  // '24h' | '12h'
  seconds: r = !1,
  locale: e = void 0
} = {}) {
  return ({ value: t }) => {
    const s = Rr(t);
    if (!s) return "";
    if (n === "12h") {
      const a = /* @__PURE__ */ new Date(0);
      return a.setHours(s.h, s.m, s.s), new Intl.DateTimeFormat(e, {
        hour: "numeric",
        minute: "2-digit",
        ...r ? { second: "2-digit" } : {},
        hour12: !0
      }).format(a);
    }
    const i = (a) => String(a).padStart(2, "0"), o = r ? `:${i(s.s)}` : "";
    return `${i(s.h)}:${i(s.m)}${o}`;
  };
}
function kr(n) {
  if (Array.isArray(n)) return { from: n[0], to: n[1] };
  if (n && typeof n == "object")
    return {
      from: n.from ?? n.old ?? n.before ?? n.previous ?? null,
      to: n.to ?? n.new ?? n.after ?? n.current ?? null
    };
  const r = String(n), e = /^(.*?)\s*(?:→|->|=>|—>)\s*(.+)$/.exec(r);
  return e ? { from: e[1].trim(), to: e[2].trim() } : { from: null, to: r };
}
function mn({
  style: n = "inline",
  // 'inline' | 'stacked'
  arrow: r = "→",
  showArrow: e = !0
} = {}) {
  return ({ value: t }) => {
    if (E(t)) return "";
    const { from: s, to: i } = kr(t), o = (l) => l == null || l === "";
    if (o(s) && o(i)) return "";
    if (o(s))
      return h(
        "span",
        { class: "sg-renderer-diff is-added" },
        h("span", { class: "sg-diff-to" }, document.createTextNode(String(i)))
      );
    if (o(i))
      return h(
        "span",
        { class: "sg-renderer-diff is-removed" },
        h("span", { class: "sg-diff-from" }, document.createTextNode(String(s)))
      );
    const a = h("span", { class: `sg-renderer-diff is-${n}` });
    return a.append(h("span", { class: "sg-diff-from" }, document.createTextNode(String(s)))), e && a.append(h(
      "span",
      { class: "sg-diff-arrow", "aria-hidden": "true" },
      document.createTextNode(r)
    )), a.append(h("span", { class: "sg-diff-to" }, document.createTextNode(String(i)))), a;
  };
}
function Dr(n) {
  if (n == null || n === "") return null;
  if (Array.isArray(n)) {
    const s = Number(n[0]), i = Number(n[1]);
    return Number.isFinite(s) && Number.isFinite(i) ? { lat: s, lng: i } : null;
  }
  if (typeof n == "object") {
    const s = Number(n.lat ?? n.latitude), i = Number(n.lng ?? n.long ?? n.lon ?? n.longitude);
    return Number.isFinite(s) && Number.isFinite(i) ? { lat: s, lng: i } : null;
  }
  const r = String(n).split(",");
  if (r.length !== 2) return null;
  const e = Number(r[0].trim()), t = Number(r[1].trim());
  return Number.isFinite(e) && Number.isFinite(t) ? { lat: e, lng: t } : null;
}
function it(n, r) {
  const e = n >= 0 ? 1 : -1, t = Math.abs(n), s = Math.floor(t), i = (t - s) * 60, o = Math.floor(i), a = (i - o) * 60, l = r ? e > 0 ? "N" : "S" : e > 0 ? "E" : "W";
  return `${s}°${String(o).padStart(2, "0")}'${a.toFixed(1)}"${l}`;
}
function bn({
  decimals: n = 4,
  style: r = "decimal",
  // 'decimal' | 'dms'
  mapUrl: e = (o, a) => `https://www.google.com/maps?q=${o},${a}`,
  linkText: t = "View on Maps",
  staticMap: s = null,
  // (lat, lng) => url
  staticSize: i = 72
} = {}) {
  return ({ value: o }) => {
    const a = Dr(o);
    if (!a) return "";
    const l = h("span", { class: "sg-renderer-geo" });
    if (typeof s == "function") {
      const u = s(a.lat, a.lng);
      u && l.append(h("img", {
        src: u,
        alt: "",
        class: "sg-renderer-geo-thumb",
        width: String(i),
        height: String(i),
        loading: "lazy",
        decoding: "async"
      }));
    }
    const d = r === "dms" ? `${it(a.lat, !0)} ${it(a.lng, !1)}` : `${a.lat.toFixed(n)}, ${a.lng.toFixed(n)}`;
    l.append(h("span", { class: "sg-renderer-geo-coords" }, document.createTextNode(d)));
    const c = e(a.lat, a.lng);
    if (c) {
      const u = h("a", {
        class: "sg-renderer-geo-link sg-renderer-link",
        href: c,
        target: "_blank",
        rel: "noopener noreferrer",
        title: "Open in maps"
      }, document.createTextNode(t));
      u.addEventListener("click", (p) => p.stopPropagation()), l.append(u);
    }
    return l;
  };
}
function _n({
  moduleSize: n = 3,
  margin: r = 2,
  background: e = "#fff",
  foreground: t = "#111827",
  showText: s = !1
} = {}) {
  return ({ value: i }) => {
    if (E(i)) return "";
    const o = String(i);
    let a;
    try {
      const d = Ls(o);
      a = Ns(d, { moduleSize: n, margin: r, background: e, foreground: t });
    } catch {
      return h(
        "span",
        { class: "sg-renderer-qr-overflow", title: o },
        document.createTextNode("QR · too long")
      );
    }
    const l = h("span", { class: "sg-renderer-qr" });
    return l.innerHTML = a, s && l.append(h("span", { class: "sg-renderer-qr-text" }, document.createTextNode(o))), l;
  };
}
function yn({
  language: n = null,
  copy: r = !0
} = {}) {
  return ({ value: e, td: t }) => {
    if (E(e)) return "";
    const s = String(e);
    if (t) {
      t.classList.add("sg-renderer-code-cell");
      const a = t.parentElement;
      a && a.tagName === "TR" && a.classList.add("sg-has-multiline");
    }
    const i = h("div", { class: "sg-renderer-code" });
    if (n && i.append(h(
      "span",
      { class: "sg-renderer-code-lang" },
      document.createTextNode(String(n))
    )), r) {
      const a = h("button", {
        type: "button",
        class: "sg-renderer-code-copy",
        title: "Copy",
        "aria-label": "Copy code"
      });
      a.innerHTML = xe, a.addEventListener("click", async (l) => {
        l.stopPropagation();
        try {
          navigator.clipboard?.writeText ? await navigator.clipboard.writeText(s) : It(s), a.innerHTML = $t, a.classList.add("is-copied"), setTimeout(() => {
            a.innerHTML = xe, a.classList.remove("is-copied");
          }, 1200);
        } catch {
        }
      }), i.append(a);
    }
    const o = h("pre", { class: "sg-renderer-code-pre" });
    return o.textContent = s, i.append(o), i;
  };
}
const Nr = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M225.8 468.2L46.9 295.4C18.9 268.2 0 230.1 0 187.8C0 117.4 56.1 60 125.7 60c25.3 0 51 9.2 70.3 25.4L256 138l60-52.6C335.3 69.2 361 60 386.3 60C455.9 60 512 117.4 512 187.8c0 42.3-18.9 80.4-46.9 107.6L286.2 468.2c-7.2 7.4-17.1 11.8-27.6 11.8c-10.5 0-20.4-4.4-27.6-11.8z"/></svg>', $r = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75.1c16.3-13.2 28.9-30.4 36.6-50l8.1-20.3c5-12.4 11.3-24.2 19-35.2l4.4-6.3 0 0c1.4-2 1.1-4.7-.6-6.4l0 0c-3.8-3.8-9.9-3.8-13.7 0L208.8 84.9c-3 3-7 4.7-11.3 4.7c-8.8 0-16-7.2-16-16V63.4c0-8.8 7.2-16 16-16h.5c8.8 0 16 7.2 16 16v6.2c34-2.4 71-13 100-25.6c11-4.8 22.1-9.3 33-13.6l1-.4c12-4.6 27.3-9.3 41.4-9.3z"/></svg>', Vr = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75.1c16.3 13.2 28.9 30.4 36.6 50l8.1 20.3c5 12.4 11.3 24.2 19 35.2l4.4 6.3c1.4 2 1.1 4.7-.6 6.4c-3.8 3.8-9.9 3.8-13.7 0L208.8 427.1c-3-3-7-4.7-11.3-4.7c-8.8 0-16 7.2-16 16v10.2c0 8.8 7.2 16 16 16h.5c8.8 0 16-7.2 16-16v-6.2c34 2.4 71 13 100 25.6c11 4.8 22.1 9.3 33 13.6l1 .4c12 4.6 27.3 9.3 41.4 9.3z"/></svg>', De = ["😞", "😕", "😐", "🙂", "😄"], ot = {
  star: re,
  heart: Nr
}, at = {
  star: "#f59e0b",
  heart: "#ec4899"
};
function vn({
  icon: n = "heart",
  max: r = 5,
  precision: e = 0.5,
  color: t = null
} = {}) {
  if (n === "smiley") return Ir({ max: r });
  if (n === "thumb") return Pr();
  if (n === "nps") return Fr();
  const s = ot[n] || ot.heart, i = t || at[n] || at.heart, o = e > 0 ? 1 / e : 2;
  return ({ value: a }) => {
    let l = parseFloat(a);
    Number.isFinite(l) || (l = 0), l = Math.max(0, Math.min(r, l)), l = Math.round(l * o) / o;
    const d = h("div", {
      class: `sg-renderer-rating is-${n}`,
      style: `--rating-color: ${i};`,
      role: "img",
      "aria-label": `${l} out of ${r}`
    });
    for (let c = 1; c <= r; c++)
      if (l >= c)
        d.append(h("span", { class: "sg-renderer-rating-glyph is-full" }, s));
      else if (l > c - 1) {
        const u = Math.round((l - (c - 1)) * 100);
        d.append(h(
          "span",
          { class: "sg-renderer-rating-glyph is-partial" },
          `${s}<span class="sg-rating-clip" style="width:${u}%;">${s}</span>`
        ));
      } else
        d.append(h("span", { class: "sg-renderer-rating-glyph is-empty" }, s));
    return d;
  };
}
function Ir({ max: n = 5 } = {}) {
  return ({ value: r }) => {
    let e = parseFloat(r);
    if (!Number.isFinite(e)) return "";
    e = Math.max(1, Math.min(n, Math.round(e)));
    const t = Math.min(
      De.length - 1,
      Math.floor((e - 1) / (n - 1 || 1) * (De.length - 1))
    );
    return h("span", {
      class: "sg-renderer-rating-smiley",
      title: `${e}/${n}`
    }, document.createTextNode(De[t]));
  };
}
function Pr() {
  return ({ value: n }) => {
    if (n == null || n === "") return "";
    const r = Number(n);
    if (!Number.isFinite(r)) return "";
    const e = h("span", { class: "sg-renderer-rating-thumb" });
    return r > 0 ? (e.classList.add("is-up"), e.title = "Thumbs up", e.innerHTML = $r) : r < 0 ? (e.classList.add("is-down"), e.title = "Thumbs down", e.innerHTML = Vr) : (e.classList.add("is-neutral"), e.title = "Neutral", e.append(document.createTextNode("—"))), e;
  };
}
function Fr() {
  return ({ value: n }) => {
    const r = parseFloat(n);
    if (!Number.isFinite(r)) return "";
    const e = Math.max(0, Math.min(10, Math.round(r))), t = e <= 6 ? "detractor" : e <= 8 ? "passive" : "promoter", s = t === "detractor" ? "Detractor" : t === "passive" ? "Passive" : "Promoter";
    return h("span", {
      class: `sg-renderer-rating-nps is-${t}`,
      title: `${e}/10 · ${s}`
    }, document.createTextNode(String(e)));
  };
}
const Br = ["#e5e7eb", "#d1d5db", "#9ca3af"];
function wn({
  min: n = 0,
  max: r = 100,
  target: e = null,
  ranges: t = null,
  // [a] | [a, b] | [a, b, c]
  rangeColors: s = Br,
  barColor: i = "#111827",
  targetColor: o = "#111827",
  width: a = 120,
  height: l = 16
} = {}) {
  return ({ value: d }) => {
    let c, u, p;
    if (d && typeof d == "object" && !Array.isArray(d) ? (c = Number(d.value), u = d.target != null ? Number(d.target) : e, p = d.ranges || t) : (c = Number(d), u = e, p = t), !Number.isFinite(c)) return "";
    const f = r - n || 1, g = (S) => Math.max(n, Math.min(r, S)), _ = (S) => (g(S) - n) / f * a, y = p && p.length ? p.map(Number) : [n + f * 0.6, n + f * 0.8], L = [n, ...y, r];
    let m = "";
    for (let S = 0; S < L.length - 1; S++) {
      const A = _(L[S]), k = _(L[S + 1]) - A, C = s[S] || s[s.length - 1];
      m += `<rect x="${A.toFixed(2)}" y="0" width="${k.toFixed(2)}" height="${l}" fill="${C}"/>`;
    }
    const v = l * 0.42, w = (l - v) / 2;
    if (m += `<rect x="0" y="${w.toFixed(2)}" width="${_(c).toFixed(2)}" height="${v.toFixed(2)}" fill="${i}"/>`, u != null && Number.isFinite(u)) {
      const S = _(u), A = l * 0.85, k = (l - A) / 2;
      m += `<rect x="${(S - 1).toFixed(2)}" y="${k.toFixed(2)}" width="2" height="${A.toFixed(2)}" fill="${o}"/>`;
    }
    return `<svg class="sg-renderer-bullet" viewBox="0 0 ${a} ${l}" width="${a}" height="${l}" preserveAspectRatio="none" aria-hidden="true">` + m + "</svg>";
  };
}
function Cn({
  size: n = 28,
  thickness: r = 5,
  color: e = "green",
  background: t = "#e5e7eb",
  showValue: s = !0,
  inline: i = !1
} = {}) {
  const o = Ge[e] || e;
  return ({ value: a }) => {
    let l = Number(a);
    if (!Number.isFinite(l)) return "";
    l = Math.max(0, Math.min(100, l));
    const d = (n - r) / 2, c = n / 2, u = n / 2, p = 2 * Math.PI * d, f = p * (1 - l / 100), g = `<text x="${c}" y="${u + 0.5}" text-anchor="middle" dominant-baseline="middle" font-size="${(n * 0.32).toFixed(1)}" font-weight="600" fill="currentColor">${Math.round(l)}</text>`, _ = `<svg class="sg-renderer-donut" viewBox="0 0 ${n} ${n}" width="${n}" height="${n}" aria-hidden="true"><circle cx="${c}" cy="${u}" r="${d}" fill="none" stroke="${t}" stroke-width="${r}"/><circle cx="${c}" cy="${u}" r="${d}" fill="none" stroke="${o}" stroke-width="${r}" stroke-dasharray="${p.toFixed(2)}" stroke-dashoffset="${f.toFixed(2)}" stroke-linecap="round" transform="rotate(-90 ${c} ${u})"/>` + (s && !i ? g : "") + "</svg>";
    return i && s ? `<span class="sg-renderer-donut-wrap">${_}<span class="sg-renderer-donut-label">${Math.round(l)}%</span></span>` : _;
  };
}
function Sn({
  width: n = 120,
  height: r = 32,
  color: e = "blue",
  highlightMax: t = !1,
  gap: s = 1,
  binLabels: i = null,
  showCount: o = !1
} = {}) {
  const a = Ge[e] || e;
  return ({ value: l, td: d }) => {
    if (l == null || l === "") return "";
    d && d.classList.add("sg-renderer-histogram-cell");
    let c = l, u = i;
    if (l && typeof l == "object" && !Array.isArray(l) && (c = l.counts, u = l.labels || i), !Array.isArray(c)) return "";
    const p = c.map(Number).filter(Number.isFinite);
    if (p.length === 0) return "";
    const f = Math.max(...p, 1), g = p.reduce((C, T) => C + T, 0), _ = u && u.length ? 10 : 0, y = 1, L = 1, m = n - y * 2, v = r - L * 2 - _, w = Math.max(1, (m - (p.length - 1) * s) / p.length);
    let S = "";
    for (let C = 0; C < p.length; C++) {
      const T = p[C], R = T / f * v, $ = y + C * (w + s), P = L + v - R, q = t ? T === f ? 1 : 0.45 : 0.85, U = u && u[C] != null ? `${u[C]}: ${T}` : `Bin ${C + 1}: ${T}`;
      S += `<rect x="${$.toFixed(2)}" y="${P.toFixed(2)}" width="${w.toFixed(2)}" height="${R.toFixed(2)}" fill="${a}" fill-opacity="${q}"><title>${Ae(U)}</title></rect>`;
    }
    let A = "";
    if (u && u.length)
      for (let C = 0; C < p.length && C < u.length; C++) {
        const T = y + C * (w + s) + w / 2;
        A += `<text x="${T.toFixed(2)}" y="${(r - 1).toFixed(2)}" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.65">${Ae(u[C])}</text>`;
      }
    const k = `<svg class="sg-renderer-histogram" viewBox="0 0 ${n} ${r}" width="${n}" height="${r}" preserveAspectRatio="none" aria-hidden="true">` + S + A + "</svg>";
    return o ? `<span class="sg-renderer-histogram-wrap">${k}<span class="sg-renderer-histogram-total">n=${g}</span></span>` : k;
  };
}
const Hr = {
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
}, Gr = { red: "#ef4444", amber: "#f59e0b", green: "#10b981" };
function xn({
  size: n = 10,
  thresholds: r = null,
  inverted: e = !1,
  showLabel: t = !1
} = {}) {
  return ({ value: s }) => {
    if (E(s)) return "";
    let i;
    if (r && Number.isFinite(Number(s))) {
      const a = Number(s), l = e ? r[1] : r[0], d = e ? r[0] : r[1];
      e ? i = a >= l ? "red" : a >= d ? "amber" : "green" : i = a <= l ? "red" : a <= d ? "amber" : "green";
    } else if (i = Hr[String(s).toLowerCase()] || null, !i) return "";
    const o = h("span", {
      class: `sg-renderer-rag is-${i}`,
      title: t ? null : i.charAt(0).toUpperCase() + i.slice(1)
    });
    return o.append(h("span", {
      class: "sg-renderer-rag-dot",
      style: `width:${n}px; height:${n}px; background:${Gr[i]};`,
      "aria-label": i
    })), t && o.append(h(
      "span",
      { class: "sg-renderer-rag-label" },
      document.createTextNode(i.charAt(0).toUpperCase() + i.slice(1))
    )), o;
  };
}
function Ln({
  steps: n = ["Pending", "Shipped", "Delivered"],
  color: r = "#2563eb",
  showLabels: e = !1
} = {}) {
  return ({ value: t, td: s }) => {
    if (E(t)) return "";
    s && s.classList.add("sg-renderer-timeline-cell");
    let i = -1;
    if (Number.isFinite(Number(t)))
      i = Math.max(0, Math.min(n.length - 1, Math.floor(Number(t))));
    else {
      const a = String(t).toLowerCase();
      i = n.findIndex((l) => String(l).toLowerCase() === a);
    }
    if (i < 0) return "";
    const o = h("div", {
      class: `sg-renderer-timeline${e ? " has-labels" : ""}`,
      style: `--ts-color: ${r};`,
      role: "list",
      "aria-label": `Step ${i + 1} of ${n.length}: ${n[i]}`
    });
    for (let a = 0; a < n.length; a++) {
      const l = a < i ? "past" : a === i ? "current" : "future", d = h("span", { class: `sg-timeline-step is-${l}`, role: "listitem" });
      if (d.append(h("span", { class: "sg-timeline-dot", title: n[a], "aria-label": n[a] })), e && d.append(h("span", { class: "sg-timeline-label" }, document.createTextNode(n[a]))), o.append(d), a < n.length - 1) {
        const c = a < i ? "past" : "future";
        o.append(h("span", { class: `sg-timeline-line is-${c}`, "aria-hidden": "true" }));
      }
    }
    return o;
  };
}
const Or = /([@#][a-zA-Z0-9_\-]+)/g;
function An({
  mentionHref: n = null,
  tagHref: r = null
} = {}) {
  return ({ value: e }) => {
    if (E(e)) return "";
    const t = String(e), s = h("span", { class: "sg-renderer-mentions" }), i = t.split(Or);
    for (const o of i)
      if (o)
        if (o[0] === "@") {
          const a = o.slice(1), l = typeof n == "function" ? n(a) : null;
          s.append(lt(o, l, "sg-renderer-mention"));
        } else if (o[0] === "#") {
          const a = o.slice(1), l = typeof r == "function" ? r(a) : null;
          s.append(lt(o, l, "sg-renderer-hashtag"));
        } else
          s.append(document.createTextNode(o));
    return s;
  };
}
function lt(n, r, e) {
  const t = r ? h("a", { href: r, target: "_blank", rel: "noopener noreferrer", class: e }) : h("span", { class: e });
  return r && t.addEventListener("click", (s) => s.stopPropagation()), t.append(document.createTextNode(n)), t;
}
function En({
  chars: n = null,
  lines: r = null,
  moreLabel: e = "Read more",
  lessLabel: t = "Show less"
} = {}) {
  return ({ value: s, td: i }) => {
    if (E(s)) return "";
    const o = String(s), a = n && o.length > n;
    if (!a && !r) return o;
    if (i) {
      i.classList.add("sg-renderer-expand-cell");
      const c = i.parentElement;
      c && c.tagName === "TR" && c.classList.add("sg-has-multiline");
    }
    const l = h("div", { class: "sg-renderer-expand" });
    let d = !1;
    if (a) {
      const c = o.slice(0, n).trimEnd() + "…", u = h(
        "span",
        { class: "sg-renderer-expand-short" },
        document.createTextNode(c)
      ), p = h(
        "span",
        { class: "sg-renderer-expand-full", hidden: "" },
        document.createTextNode(o)
      ), f = h(
        "button",
        { type: "button", class: "sg-renderer-expand-toggle" },
        document.createTextNode(e)
      );
      f.addEventListener("click", (g) => {
        g.stopPropagation(), d = !d, u.hidden = d, p.hidden = !d, f.textContent = d ? t : e;
      }), l.append(u, p, document.createTextNode(" "), f);
    } else {
      const c = h("div", { class: "sg-renderer-expand-clamp" });
      c.style.setProperty("--sg-clamp", String(r)), c.textContent = o;
      const u = h(
        "button",
        { type: "button", class: "sg-renderer-expand-toggle" },
        document.createTextNode(e)
      );
      u.addEventListener("click", (p) => {
        p.stopPropagation(), d = !d, c.classList.toggle("is-expanded", d), u.textContent = d ? t : e;
      }), l.append(c, u);
    }
    return l;
  };
}
function Mn({
  unit: n = "kilometer",
  unitDisplay: r = "short",
  decimals: e,
  locale: t = void 0,
  ...s
} = {}) {
  const i = { style: "unit", unit: n, unitDisplay: r, ...s };
  e != null && (i.minimumFractionDigits = e, i.maximumFractionDigits = e);
  let o;
  try {
    o = new Intl.NumberFormat(t, i);
  } catch {
    const l = e != null ? { minimumFractionDigits: e, maximumFractionDigits: e } : {};
    o = new Intl.NumberFormat(t, l);
  }
  return ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-number"), E(a)) return "";
    const d = Number(a);
    return Number.isFinite(d) ? o.format(d) : String(a);
  };
}
const zr = /^((25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(25[0-5]|2[0-4]\d|[01]?\d?\d)$/, jr = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|:(:[0-9a-fA-F]{1,4}){1,7}|::)$/;
function Kr(n) {
  return zr.test(n);
}
function qr(n) {
  return jr.test(n);
}
function Tn({
  countryField: n = null
} = {}) {
  return ({ value: r, row: e }) => {
    if (E(r)) return "";
    const t = String(r).trim(), s = Kr(t), i = !s && qr(t);
    if (!s && !i)
      return h("span", {
        class: "sg-renderer-ip is-invalid",
        title: "Invalid IP address"
      }, document.createTextNode(t));
    const o = h("span", {
      class: `sg-renderer-ip ${i ? "is-v6" : "is-v4"}`,
      title: s ? "IPv4" : "IPv6"
    });
    if (n && e?.[n]) {
      const a = String(e[n]).trim().toUpperCase();
      if (/^[A-Z]{2}$/.test(a)) {
        const l = String.fromCodePoint(
          127462 + a.charCodeAt(0) - 65,
          127462 + a.charCodeAt(1) - 65
        );
        o.append(h("span", {
          class: "sg-renderer-ip-flag",
          "aria-hidden": "true"
        }, document.createTextNode(l)));
      }
    }
    return o.append(h(
      "span",
      { class: "sg-renderer-ip-text" },
      document.createTextNode(t)
    )), o;
  };
}
const Ur = {
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
function Rn({
  banks: n = Ur,
  showBank: r = !0
} = {}) {
  return ({ value: e }) => {
    if (E(e)) return "";
    const t = String(e).trim(), s = t.replace(/\D/g, "");
    if (s.length !== 6)
      return h("span", {
        class: "sg-renderer-invalid",
        title: "Invalid BSB — must be 6 digits"
      }, document.createTextNode(t));
    const i = `${s.slice(0, 3)}-${s.slice(3)}`, o = s.slice(0, 2), a = n[o], l = h("span", { class: "sg-renderer-bsb" });
    return l.append(h(
      "span",
      { class: "sg-renderer-bsb-number sg-renderer-mono" },
      document.createTextNode(i)
    )), r && a && l.append(h(
      "span",
      { class: "sg-renderer-bsb-bank" },
      document.createTextNode(a)
    )), l;
  };
}
function Wr(n) {
  const r = String(n).replace(/\s+/g, "");
  if (r.length !== 9 || !/^\d{9}$/.test(r)) return !1;
  const e = [8, 7, 6, 5, 4, 3, 2, 1];
  let t = 0;
  for (let s = 0; s < 8; s++) t += parseInt(r[s], 10) * e[s];
  return parseInt(r[8], 10) === (10 - t % 10) % 10;
}
function Xr(n) {
  const r = String(n).replace(/\D/g, "");
  return r.length !== 9 ? String(n) : `${r.slice(0, 3)} ${r.slice(3, 6)} ${r.slice(6)}`;
}
function kn() {
  return ({ value: n }) => {
    if (E(n)) return "";
    if (!Wr(n))
      return h("span", {
        class: "sg-renderer-invalid",
        title: "Invalid ACN (checksum failed)"
      }, document.createTextNode(String(n)));
    const r = String(n).replace(/\s+/g, "");
    return h("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/Search/ResultsActiveASIC?SearchText=${r}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(Xr(n)));
  };
}
function Dn() {
  return ({ value: n, td: r }) => {
    if (r && r.classList.add("sg-renderer-mask-numeric"), E(n)) return "";
    const e = String(n), t = e.replace(/\D/g, "");
    if (t.length < 8 || t.length > 9)
      return h("span", {
        class: "sg-renderer-invalid",
        title: "Invalid TFN — must be 8 or 9 digits"
      }, document.createTextNode(e));
    const s = t.slice(-3), i = t.length - 3, o = "•".repeat(i);
    return t.length === 9 ? `${o.slice(0, 3)} ${o.slice(3)} ${s}` : `${o.slice(0, 2)} ${o.slice(2)} ${s}`;
  };
}
function Yr(n) {
  if (n.length !== 10 || !/^[2-6]\d{9}$/.test(n)) return !1;
  const r = [1, 3, 7, 9, 1, 3, 7, 9];
  let e = 0;
  for (let t = 0; t < 8; t++) e += parseInt(n[t], 10) * r[t];
  return e % 10 === parseInt(n[8], 10);
}
function Nn() {
  return ({ value: n }) => {
    if (E(n)) return "";
    const r = String(n).trim().replace(/\s+/g, ""), e = /^(\d{10})(?:[\/-]?(\d))?$/.exec(r);
    if (!e || !Yr(e[1]))
      return h("span", {
        class: "sg-renderer-invalid",
        title: e ? "Invalid Medicare (checksum failed)" : "Invalid Medicare format"
      }, document.createTextNode(String(n)));
    const t = e[1], s = e[2], i = `${t.slice(0, 4)} ${t.slice(4, 9)} ${t.slice(9)}` + (s ? ` / ${s}` : "");
    return h(
      "span",
      { class: "sg-renderer-medicare sg-renderer-mono" },
      document.createTextNode(i)
    );
  };
}
function $n({ preload: n = "none" } = {}) {
  return ({ value: r }) => E(r) ? "" : h("audio", {
    class: "sg-renderer-audio",
    controls: "",
    preload: n,
    src: String(r).trim()
  });
}
function Vn({ width: n = 200, preload: r = "metadata" } = {}) {
  return ({ value: e }) => E(e) ? "" : h("video", {
    class: "sg-renderer-video",
    controls: "",
    preload: r,
    src: String(e).trim(),
    width: String(n)
  });
}
function In({ sort: n = "count" } = {}) {
  return ({ value: r }) => {
    if (E(r)) return "";
    let e = [];
    if (Array.isArray(r))
      e = r.map((s) => Array.isArray(s) ? s : [s.emoji ?? s.name ?? "?", s.count ?? s.n ?? 0]);
    else if (typeof r == "object")
      e = Object.entries(r);
    else
      return "";
    if (e = e.filter(([, s]) => Number.isFinite(Number(s)) && Number(s) > 0), n === "count" && e.sort((s, i) => Number(i[1]) - Number(s[1])), e.length === 0) return "";
    const t = h("span", { class: "sg-renderer-reactions" });
    for (const [s, i] of e) {
      const o = h("span", { class: "sg-reaction", title: `${i} ${s}` });
      o.append(h("span", { class: "sg-reaction-emoji" }, document.createTextNode(String(s)))), o.append(h("span", { class: "sg-reaction-count" }, document.createTextNode(String(i)))), t.append(o);
    }
    return t;
  };
}
function Pn({ icon: n = "💬" } = {}) {
  return ({ value: r }) => {
    if (E(r)) return "";
    let e = "", t = null;
    typeof r == "object" ? (e = r.value ?? r.text ?? "", t = r.count ?? r.comments ?? null) : Number.isFinite(Number(r)) && typeof r != "string" ? t = Number(r) : e = String(r);
    const s = h("span", { class: "sg-renderer-comment-count" });
    if (e && s.append(h("span", { class: "sg-cc-value" }, document.createTextNode(String(e)))), t != null && Number(t) > 0) {
      const i = h("span", {
        class: "sg-cc-badge",
        title: `${t} comment${Number(t) === 1 ? "" : "s"}`
      }), o = h("span", { class: "sg-cc-icon", "aria-hidden": "true" });
      typeof n == "string" && n.trimStart().startsWith("<svg") ? o.innerHTML = n : o.append(document.createTextNode(String(n))), i.append(o), i.append(h("span", { class: "sg-cc-num" }, document.createTextNode(String(t)))), s.append(i);
    }
    return s;
  };
}
function Fn({ locale: n = void 0 } = {}) {
  const e = new Intl.Locale(n || Intl.NumberFormat().resolvedOptions().locale).language === "en", t = e ? new Intl.PluralRules(n, { type: "ordinal" }) : null, s = { one: "st", two: "nd", few: "rd", other: "th" };
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), E(i)) return "";
    const a = Number(i);
    return Number.isInteger(a) ? e ? `${a}${s[t.select(a)]}` : String(a) : String(i);
  };
}
function Bn({
  one: n = "item",
  other: r = "items",
  zero: e = null,
  locale: t = void 0
} = {}) {
  const s = new Intl.PluralRules(t);
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), E(i)) return "";
    const a = Number(i);
    return Number.isFinite(a) ? a === 0 && e ? `${a} ${e}` : s.select(a) === "one" ? `${a} ${n}` : `${a} ${r}` : String(i);
  };
}
const Qr = /* @__PURE__ */ new Set(["", "null", "nil", "none", "n/a", "na", "-", "—"]);
function Hn({
  placeholder: n = "—",
  emptyOnTokens: r = !0
} = {}) {
  return ({ value: e }) => e == null || typeof e == "string" && (e === "" || r && Qr.has(e.trim().toLowerCase())) ? h(
    "span",
    { class: "sg-renderer-empty", title: "Empty" },
    document.createTextNode(n)
  ) : String(e);
}
function Jr(n) {
  let r = 0, e = !1;
  for (let t = n.length - 1; t >= 0; t--) {
    let s = parseInt(n[t], 10);
    e && (s *= 2, s > 9 && (s -= 9)), r += s, e = !e;
  }
  return r % 10 === 0;
}
function Zr(n) {
  return /^4\d{12}(\d{3,6})?$/.test(n) ? "visa" : /^(5[1-5]\d{14}|2(2[2-9]|[3-6]\d|7[01]|720)\d{12})$/.test(n) ? "mastercard" : /^3[47]\d{13}$/.test(n) ? "amex" : /^(6011\d{12,15}|65\d{14,17}|64[4-9]\d{13}|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9([01]\d|2[0-5]))\d{10,13})$/.test(n) ? "discover" : /^35(2[89]|[3-8]\d)\d{12}$/.test(n) ? "jcb" : /^3(0[0-5]|[68]\d|9\d)\d{11}$/.test(n) ? "diners" : null;
}
function Gn({ mask: n = !0 } = {}) {
  return ({ value: r, td: e }) => {
    if (e && e.classList.add("sg-renderer-number"), E(r)) return "";
    const t = String(r).replace(/\D/g, ""), s = t.length >= 13 && t.length <= 19, i = s && Jr(t), o = s ? Zr(t) : null, a = h("span", { class: `sg-renderer-card${i ? "" : " is-invalid"}` });
    o && a.append(h("span", {
      class: `sg-renderer-card-brand is-${o}`,
      title: o[0].toUpperCase() + o.slice(1)
    }, document.createTextNode(o === "mastercard" ? "MC" : o.toUpperCase())));
    let l;
    if (!s)
      l = String(r);
    else {
      const d = n ? "•".repeat(t.length - 4) + t.slice(-4) : t;
      o === "amex" || o === "diners" ? l = `${d.slice(0, 4)} ${d.slice(4, 10)} ${d.slice(10)}` : l = d.match(/.{1,4}/g).join(" ");
    }
    return a.append(h(
      "span",
      { class: "sg-renderer-card-num sg-renderer-mono" },
      document.createTextNode(l)
    )), a;
  };
}
function On({
  width: n = "70%",
  height: r = "12px"
} = {}) {
  return ({ value: e }) => e != null && e !== "" && e !== "loading" && e !== "…" ? String(e) : h("span", {
    class: "sg-renderer-shimmer",
    style: `width: ${n}; height: ${r};`,
    "aria-label": "Loading"
  });
}
function Y(n) {
  return Array.isArray(n) ? n.map((r) => r == null ? null : typeof r == "object" ? { value: r.value, label: r.label ?? String(r.value), color: r.color || null, icon: r.icon || null } : { value: r, label: String(r), color: null, icon: null }).filter(Boolean) : [];
}
function J(n, r) {
  const e = h("span", { class: "sg-renderer-select-pill" });
  return n.color ? r.test(n.color) ? e.classList.add(`sg-pill-${n.color}`) : (e.style.background = n.color, e.style.color = hn(n.color)) : e.classList.add("sg-renderer-select-pill-bare"), n.icon && e.append(h("span", { class: "sg-renderer-select-pill-icon", "aria-hidden": "true" }, n.icon)), e.append(h(
    "span",
    { class: "sg-renderer-select-pill-label" },
    document.createTextNode(n.label)
  )), e;
}
const Z = /^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/;
function ze(n, r) {
  const e = n?.col?.cellRendererConfig || null, t = n?.col?.enumValues || null;
  return {
    options: r.options.length ? r.options : e?.options || t || [],
    placeholder: e?.placeholder ?? r.placeholder,
    clearable: e?.clearable ?? r.clearable,
    colorMap: e?.colorMap ?? r.colorMap,
    editable: e?.editable ?? r.editable,
    separator: e?.separator ?? r.separator
  };
}
function zn({
  options: n = [],
  placeholder: r = "Select…",
  editable: e = !0,
  clearable: t = !1,
  colorMap: s = null
} = {}) {
  const i = Y(n);
  if (s && typeof s == "object")
    for (const o of i)
      !o.color && Object.prototype.hasOwnProperty.call(s, o.value) && (o.color = s[o.value]);
  return (o) => {
    const { value: a, td: l } = o, d = ze(o, { options: i, placeholder: r, clearable: t, colorMap: s, editable: e });
    let c = i;
    if (i.length === 0 && d.options.length && (c = Y(d.options), d.colorMap && typeof d.colorMap == "object"))
      for (const p of c)
        !p.color && Object.prototype.hasOwnProperty.call(d.colorMap, p.value) && (p.color = d.colorMap[p.value]);
    l && (l.classList.add("sg-renderer-select-cell"), l._sgSelectOpts = c, l._sgSelectClearable = d.clearable), d.editable && l && !l._sgSelectEditBound && (l._sgSelectEditBound = !0, l.addEventListener("dblclick", (p) => {
      p._sgSelectHandled || (p._sgSelectHandled = !0, p.stopPropagation(), ei(l, o));
    }));
    const u = c.find((p) => String(p.value) === String(a)) || null;
    return u ? J(u, Z) : E(a) ? h(
      "span",
      { class: "sg-renderer-select-placeholder" },
      document.createTextNode(d.placeholder)
    ) : h("span", { class: "sg-renderer-select-bare" }, document.createTextNode(String(a)));
  };
}
let we = null;
function ei(n, r) {
  fe();
  const e = n._sgSelectOpts || [], t = n._sgSelectClearable, { row: s, col: i } = r, o = s && i?.field != null ? s[i.field] : null, a = h("div", { class: "sg-renderer-select-popover", role: "listbox" });
  a.addEventListener("mousedown", (u) => u.stopPropagation());
  function l(u) {
    const { api: p } = r, f = s && i?.field != null ? s[i.field] : null;
    s && i?.field != null && (s[i.field] = u), p?.applyTransaction && p.applyTransaction({ update: [s] });
    const g = n.closest('[data-controller~="grid"]');
    g && g.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: s?.id ?? s?._sg_id, colId: i?.field, oldValue: f, newValue: u }
    })), fe();
  }
  if (t) {
    const u = h("button", {
      type: "button",
      class: "sg-renderer-select-option sg-renderer-select-option-none",
      role: "option"
    }, document.createTextNode("(none)"));
    u.addEventListener("click", () => l(null)), a.append(u);
  }
  for (const u of e) {
    const p = h("button", {
      type: "button",
      class: `sg-renderer-select-option${String(u.value) === String(o) ? " is-selected" : ""}`,
      role: "option"
    });
    p.append(J(u, Z)), p.addEventListener("click", () => l(u.value)), a.append(p);
  }
  function d(u) {
    u.key === "Escape" && (u.stopPropagation(), fe());
  }
  function c(u) {
    !a.contains(u.target) && !n.contains(u.target) && fe();
  }
  document.addEventListener("keydown", d), setTimeout(() => document.addEventListener("mousedown", c), 0), document.body.appendChild(a), Q(a, n), we = { pop: a, onKey: d, onDocClick: c };
}
function fe() {
  if (!we) return;
  const { pop: n, onKey: r, onDocClick: e } = we;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), n.remove(), we = null;
}
function jn(n) {
  return n == null || n === "" ? [] : Array.isArray(n) ? n.map(String) : String(n).split(",").map((r) => r.trim()).filter(Boolean);
}
function Kn({
  options: n = [],
  separator: r = ",",
  placeholder: e = "Add tags…",
  editable: t = !0,
  colorMap: s = null
} = {}) {
  const i = Y(n);
  if (s && typeof s == "object")
    for (const o of i)
      !o.color && Object.prototype.hasOwnProperty.call(s, o.value) && (o.color = s[o.value]);
  return (o) => {
    const { value: a, td: l } = o, d = ze(o, { options: i, placeholder: e, colorMap: s, editable: t, separator: r });
    let c = i;
    if (i.length === 0 && d.options.length && (c = Y(d.options), d.colorMap && typeof d.colorMap == "object"))
      for (const f of c)
        !f.color && Object.prototype.hasOwnProperty.call(d.colorMap, f.value) && (f.color = d.colorMap[f.value]);
    l && (l.classList.add("sg-renderer-multiselect-cell"), l._sgMultiOpts = c, l._sgMultiSep = d.separator), d.editable && l && !l._sgMultiEditBound && (l._sgMultiEditBound = !0, l.addEventListener("dblclick", (f) => {
      f._sgMultiHandled || (f._sgMultiHandled = !0, f.stopPropagation(), ti(l, o));
    }));
    const u = jn(a);
    if (!u.length)
      return h(
        "span",
        { class: "sg-renderer-multiselect-placeholder" },
        document.createTextNode(d.placeholder)
      );
    const p = h("div", { class: "sg-renderer-multiselect" });
    for (const f of u) {
      const g = c.find((_) => String(_.value) === String(f)) || { label: f, color: null, icon: null };
      p.append(J(g, Z));
    }
    return p;
  };
}
let Ce = null;
function ti(n, r) {
  Ne();
  const e = n._sgMultiOpts || [], t = n._sgMultiSep || ",", { row: s, col: i } = r, o = jn(s && i?.field != null ? s[i.field] : null), a = new Set(o), l = h("div", { class: "sg-renderer-multiselect-popover", role: "listbox", "aria-multiselectable": "true" });
  l.addEventListener("mousedown", (g) => g.stopPropagation());
  function d(g) {
    const _ = a.has(String(g.value)), y = h("button", {
      type: "button",
      class: `sg-renderer-multiselect-option${_ ? " is-selected" : ""}`,
      role: "option",
      "aria-selected": _ ? "true" : "false"
    });
    return y.append(h(
      "span",
      { class: `sg-renderer-multiselect-check${_ ? " is-on" : ""}` },
      document.createTextNode(_ ? "✓" : "")
    )), y.append(J(g, Z)), y.addEventListener("click", () => {
      a.has(String(g.value)) ? a.delete(String(g.value)) : a.add(String(g.value)), l.replaceChildren(), c();
    }), y;
  }
  function c() {
    for (const g of e) l.append(d(g));
  }
  c();
  function u() {
    const { api: g } = r, _ = Array.from(a), y = s && i?.field != null ? s[i.field] : null, L = Array.isArray(y) || y == null ? _ : _.join(t), m = y;
    s && i?.field != null && (s[i.field] = L), g?.applyTransaction && g.applyTransaction({ update: [s] });
    const v = n.closest('[data-controller~="grid"]');
    v && v.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: s?.id ?? s?._sg_id, colId: i?.field, oldValue: m, newValue: L }
    })), Ne();
  }
  function p(g) {
    g.key === "Escape" && (g.stopPropagation(), Ne()), g.key === "Enter" && (g.stopPropagation(), g.preventDefault(), u());
  }
  function f(g) {
    !l.contains(g.target) && !n.contains(g.target) && u();
  }
  document.addEventListener("keydown", p), setTimeout(() => document.addEventListener("mousedown", f), 0), document.body.appendChild(l), Q(l, n), Ce = { pop: l, onKey: p, onDocClick: f };
}
function Ne() {
  if (!Ce) return;
  const { pop: n, onKey: r, onDocClick: e } = Ce;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), n.remove(), Ce = null;
}
function qn({
  options: n = [],
  placeholder: r = "Search…",
  editable: e = !0,
  allowCustom: t = !1,
  colorMap: s = null
} = {}) {
  const i = Y(n);
  if (s && typeof s == "object")
    for (const o of i)
      !o.color && Object.prototype.hasOwnProperty.call(s, o.value) && (o.color = s[o.value]);
  return (o) => {
    const { value: a, td: l } = o, d = ze(o, { options: i, placeholder: r, colorMap: s, editable: e }), c = o?.col?.cellRendererConfig?.allowCustom ?? t;
    let u = i;
    if (i.length === 0 && d.options.length && (u = Y(d.options), d.colorMap && typeof d.colorMap == "object"))
      for (const f of u)
        !f.color && Object.prototype.hasOwnProperty.call(d.colorMap, f.value) && (f.color = d.colorMap[f.value]);
    l && (l.classList.add("sg-renderer-combobox-cell"), l._sgComboOpts = u, l._sgComboAllowCustom = c, l._sgComboPlaceholder = d.placeholder), d.editable && l && !l._sgComboEditBound && (l._sgComboEditBound = !0, l.addEventListener("dblclick", (f) => {
      f._sgComboHandled || (f._sgComboHandled = !0, f.stopPropagation(), ni(l, o));
    }));
    const p = u.find((f) => String(f.value) === String(a)) || null;
    return p ? J(p, Z) : E(a) ? h(
      "span",
      { class: "sg-renderer-select-placeholder" },
      document.createTextNode(d.placeholder)
    ) : h("span", { class: "sg-renderer-select-bare" }, document.createTextNode(String(a)));
  };
}
let Se = null;
function ni(n, r) {
  ne();
  const e = n._sgComboOpts || [], t = !!n._sgComboAllowCustom, s = n._sgComboPlaceholder || "Search…", { row: i, col: o } = r;
  let a = "", l = 0;
  const d = h("div", { class: "sg-renderer-combobox-popover", role: "combobox" });
  d.addEventListener("mousedown", (m) => m.stopPropagation());
  const c = h("input", {
    type: "search",
    class: "sg-renderer-combobox-input",
    placeholder: s,
    autocomplete: "off"
  });
  d.append(c);
  const u = h("div", { class: "sg-renderer-combobox-list", role: "listbox" });
  d.append(u);
  function p(m) {
    const { api: v } = r, w = i && o?.field != null ? i[o.field] : null;
    i && o?.field != null && (i[o.field] = m), v?.applyTransaction && v.applyTransaction({ update: [i] });
    const S = n.closest('[data-controller~="grid"]');
    S && S.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: i?.id ?? i?._sg_id, colId: o?.field, oldValue: w, newValue: m }
    })), ne();
  }
  function f() {
    const m = a.trim().toLowerCase();
    return m ? e.filter((v) => String(v.label).toLowerCase().includes(m)) : e;
  }
  function g() {
    u.replaceChildren();
    const m = f();
    if (l >= m.length && (l = Math.max(0, m.length - 1)), m.forEach((v, w) => {
      const S = h("button", {
        type: "button",
        class: `sg-renderer-combobox-option${w === l ? " is-highlighted" : ""}`,
        role: "option",
        "aria-selected": w === l ? "true" : "false"
      });
      S.append(J(v, Z)), S.addEventListener("mouseenter", () => {
        l = w, _();
      }), S.addEventListener("click", () => p(v.value)), u.append(S);
    }), m.length === 0) {
      const v = h("div", { class: "sg-renderer-combobox-empty" });
      t && a.trim() ? v.append(document.createTextNode(`Press Enter to add "${a.trim()}"`)) : v.append(document.createTextNode("No matches")), u.append(v);
    }
  }
  function _() {
    u.querySelectorAll(".sg-renderer-combobox-option").forEach((m, v) => {
      m.classList.toggle("is-highlighted", v === l), m.setAttribute("aria-selected", v === l ? "true" : "false");
    });
  }
  c.addEventListener("input", () => {
    a = c.value, l = 0, g();
  }), c.addEventListener("keydown", (m) => {
    const v = f();
    m.key === "ArrowDown" ? (m.preventDefault(), l = Math.min(v.length - 1, l + 1), _()) : m.key === "ArrowUp" ? (m.preventDefault(), l = Math.max(0, l - 1), _()) : m.key === "Enter" ? (m.preventDefault(), v[l] ? p(v[l].value) : t && a.trim() && p(a.trim())) : m.key === "Escape" && (m.stopPropagation(), ne());
  });
  function y(m) {
    m.key === "Escape" && (m.stopPropagation(), ne());
  }
  function L(m) {
    !d.contains(m.target) && !n.contains(m.target) && ne();
  }
  document.addEventListener("keydown", y), setTimeout(() => document.addEventListener("mousedown", L), 0), document.body.appendChild(d), Q(d, n), g(), setTimeout(() => c.focus(), 0), Se = { pop: d, onKey: y, onDocClick: L };
}
function ne() {
  if (!Se) return;
  const { pop: n, onKey: r, onDocClick: e } = Se;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), n.remove(), Se = null;
}
x("email", yt());
x("url", vt());
x("phone", wt());
x("currency", Ct());
x("percent", St());
x("progress-bar", Zt());
x("star-rating", en());
x("tags", tn());
x("country-flag", nn());
x("abn", sn());
x("avatar", rn());
x("date", xt());
x("datetime", Lt());
x("relative-time", At());
x("duration", Et());
x("number", Mt());
x("compact-number", Tt());
x("file-size", Rt());
x("boolean", kt());
x("delta", Dt());
x("truncate", Nt());
x("copyable", Vt());
x("image", Pt());
x("color-swatch", Ft());
x("sparkline", Bt());
x("heatmap-cell", Ot());
x("mask", zt());
x("highlight", jt());
x("multi-line", Kt());
x("attachments", Wt());
x("address-au", Jt());
x("checkbox", on());
x("switch", dn());
x("markdown", cn());
x("json", un());
x("linked-record", pn());
x("coloured-tags", fn());
x("time", gn());
x("diff", mn());
x("geo", bn());
x("qr", _n());
x("code", yn());
x("rating", vn());
x("bullet", wn());
x("donut", Cn());
x("histogram", Sn());
x("rag", xn());
x("timeline-steps", Ln());
x("mention", An());
x("expand", En());
x("units", Mn());
x("ip-address", Tn());
x("bsb", Rn());
x("acn", kn());
x("tfn", Dn());
x("medicare", Nn());
x("audio", $n());
x("video", Vn());
x("reactions", In());
x("comment-count", Pn());
x("ordinal", Fn());
x("plural", Bn());
x("empty", Hn());
x("credit-card", Gn());
x("loading-shimmer", On());
x("audio-attachment", ln());
x("select", zn());
x("multiselect", Kn());
x("combobox", qn());
const si = {
  email: yt,
  url: vt,
  phone: wt,
  currency: Ct,
  percent: St,
  progressBar: Zt,
  starRating: en,
  tags: tn,
  countryFlag: nn,
  abn: sn,
  avatar: rn,
  statusPill: gr,
  date: xt,
  datetime: Lt,
  relativeTime: At,
  duration: Et,
  number: Mt,
  compactNumber: Tt,
  fileSize: Rt,
  boolean: kt,
  delta: Dt,
  truncate: Nt,
  copyable: Vt,
  image: Pt,
  colorSwatch: Ft,
  sparkline: Bt,
  heatmap: Ot,
  mask: zt,
  highlight: jt,
  multiLine: Kt,
  attachments: Wt,
  addressAu: Jt,
  checkbox: on,
  switch: dn,
  markdown: cn,
  json: un,
  linkedRecord: pn,
  colouredTags: fn,
  time: gn,
  diff: mn,
  geo: bn,
  qr: _n,
  code: yn,
  rating: vn,
  bullet: wn,
  donut: Cn,
  histogram: Sn,
  rag: xn,
  timelineSteps: Ln,
  mention: An,
  expand: En,
  units: Mn,
  ipAddress: Tn,
  bsb: Rn,
  acn: kn,
  tfn: Dn,
  medicare: Nn,
  audio: $n,
  video: Vn,
  reactions: In,
  commentCount: Pn,
  ordinal: Fn,
  plural: Bn,
  empty: Hn,
  creditCard: Gn,
  loadingShimmer: On,
  audioAttachment: ln,
  select: zn,
  multiselect: Kn,
  combobox: qn
}, ri = 32, dt = 100, he = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', ii = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>', oi = /* @__PURE__ */ new Set([
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
]), ai = /* @__PURE__ */ new Set([
  "color",
  "date",
  "datetime-local",
  "time",
  "month",
  "week"
]), ct = [
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
class je extends K {
  constructor() {
    super(...arguments);
    N(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    // ----- Row grouping + aggregation -----
    // A group is expanded if it has an explicit override; otherwise the
    // default-by-level applies (-1 = all, 0 = none, N = first N levels).
    N(this, "_isGroupExpanded", (e, t) => {
      if (this._groupExpanded.has(e)) return this._groupExpanded.get(e);
      const s = this.state.group.defaultExpanded;
      return s < 0 ? !0 : t < s;
    });
    // Delegated click handler for synthetic <th>s that don't have a
    // HeaderCellController of their own (pivot result cols today). Mirrors the
    // user-defined header path: bare click toggles sort, shift-click appends to
    // a multi-sort. Resize handles / filter icons short-circuit.
    N(this, "_onSynthHeaderClick", (e) => {
      const t = e.target.closest('th[data-synth="true"][data-sortable="true"]');
      if (!t || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const s = t.getAttribute("data-field");
      s && this.toggleSort(s, e.shiftKey === !0);
    });
    // ----- Right-click column menu -----
    //
    // contextmenu on a leaf <th> opens a fixed-positioned popup with quick
    // actions for that column: pin/unpin (left|right), autosize, group/pivot
    // toggles, aggregate selector, and hide. Synthetic columns (gutter,
    // checkbox, auto-Group, pivot result) suppress the menu — they're owned by
    // the grid and shouldn't be poked through this surface.
    N(this, "_onHeaderContextMenu", (e) => {
      const t = e.target.closest("th[data-field], th[data-header-cell-field-value]");
      if (!t) return;
      const s = t.getAttribute("data-field") || t.getAttribute("data-header-cell-field-value"), i = this._colByField(s);
      !i || i._isCheckbox || i._isRowNumber || i._isGroupCol || i._isPivot || (e.preventDefault(), this._showColumnMenu(i, e.clientX, e.clientY));
    });
    N(this, "_onDocMouseDownColumnMenu", (e) => {
      this._columnMenu && !this._columnMenu.contains(e.target) && this._closeColumnMenu();
    });
    N(this, "_onColumnMenuKey", (e) => {
      e.key === "Escape" && (e.stopPropagation(), this._closeColumnMenu());
    });
    N(this, "_onCellDragEnter", (e) => {
      if (!this._isFileDrag(e)) return;
      const t = this._dropTarget(e.target);
      t && (e.preventDefault(), this._dropHotCell && this._dropHotCell !== t.td && this._dropHotCell.classList.remove("sg-drop-target"), t.td.classList.add("sg-drop-target"), this._dropHotCell = t.td);
    });
    N(this, "_onCellDragOver", (e) => {
      if (!this._isFileDrag(e)) return;
      const t = this._dropTarget(e.target);
      t && (e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "copy"), this._dropHotCell !== t.td && (this._dropHotCell?.classList.remove("sg-drop-target"), t.td.classList.add("sg-drop-target"), this._dropHotCell = t.td));
    });
    N(this, "_onCellDragLeave", (e) => {
      this._dropHotCell && !this._dropHotCell.contains(e.relatedTarget) && (this._dropHotCell.classList.remove("sg-drop-target"), this._dropHotCell = null);
    });
    N(this, "_onCellDrop", (e) => {
      if (!this._isFileDrag(e)) return;
      const t = this._dropTarget(e.target);
      if (!t) return;
      e.preventDefault(), this._dropHotCell?.classList.remove("sg-drop-target"), this._dropHotCell = null;
      const s = Array.from(e.dataTransfer?.files || []);
      if (!s.length) return;
      const i = this.state.rowData.find((u) => this._rowId(u) === t.rowId), o = { rowId: t.rowId, colId: t.colId, files: s, row: i, dataTransfer: e.dataTransfer }, a = new CustomEvent("grid:fileAttached", { detail: o, bubbles: !0, cancelable: !0 });
      if (!this.element.dispatchEvent(a) || !i) return;
      const d = this.attachmentsFieldValue || t.colId, c = Array.isArray(i[d]) ? i[d].slice() : [];
      for (const u of s) {
        let p = "";
        try {
          p = URL.createObjectURL(u);
        } catch {
        }
        c.push({
          id: `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
          filename: u.name,
          name: u.name,
          byte_size: u.size,
          size: u.size,
          content_type: u.type || "application/octet-stream",
          url: p,
          thumb_url: u.type?.startsWith("image/") ? p : null,
          preview_url: u.type?.startsWith("image/") ? p : null
        });
      }
      i[d] = c, this.scheduleRender("cells"), M(this.element, "grid:cellValueChanged", {
        rowId: t.rowId,
        colId: d,
        oldValue: null,
        newValue: c
      });
    });
    N(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
    });
    N(this, "_onCellMouseDown", (e) => {
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
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : s ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), M(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    N(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      s && s.focus.rowId === t.rowId && s.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), M(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
    });
    N(this, "_onCellMouseUp", () => {
      this._cellDragging = !1, this._rowDragPending && (document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag && this._finishRowDrag(), this._rowDragPending = null);
    });
    // ----- Row drag-and-drop (reorder) with a ghost preview -----
    N(this, "_onRowDragMove", (e) => {
      const t = this._rowDragPending;
      if (t) {
        if (!this._rowDrag) {
          if (Math.abs(e.clientY - t.y) < 5 && Math.abs(e.clientX - t.x) < 5) return;
          this._startRowDrag(t.rowId);
        }
        this._rowDrag && (this._rowDragMoved = !0, this._rowDrag.ghost.style.left = `${e.clientX + 14}px`, this._rowDrag.ghost.style.top = `${e.clientY + 10}px`, this._updateDropIndicator(e.clientY));
      }
    });
    // Copy the active cell range to the clipboard as TSV (rows \n, cols \t).
    N(this, "_onCopy", (e) => {
      if (this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && !this.element.contains(t)) return;
      const s = this._activeRect();
      if (!s) return;
      const i = this._cellRangeRows(s).map((o) => o.map((a) => String(a ?? "")).join("	")).join(`
`);
      i && (e.clipboardData?.setData("text/plain", i), e.preventDefault());
    });
    N(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && this.element.contains(t)) return;
      const s = e.key, i = e.metaKey || e.ctrlKey;
      if (i && s.toLowerCase() === "a") {
        e.preventDefault(), this.rowSelectionValue !== "" ? (this.clearCellSelection(), this.deselectAll(), this.selectAll()) : this._selectAllCells();
        return;
      }
      if (i) return;
      const o = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (o[s]) {
        e.preventDefault();
        const [a, l] = o[s];
        this._moveActiveCell(a, l, e.shiftKey);
        return;
      }
      if (s === "Tab") {
        e.preventDefault(), this._moveActiveCell(0, e.shiftKey ? -1 : 1, !1);
        return;
      }
      if (s === "Enter") {
        const a = this._activeCell();
        a && (e.preventDefault(), this.startEditingCell(a.rowId, a.colId));
        return;
      }
      if (s === "Escape") {
        this.clearCellSelection();
        return;
      }
      if (s === "Delete" || s === "Backspace") {
        this._clearSelectedCells() && e.preventDefault();
        return;
      }
      if (s.length === 1 && !e.altKey) {
        const a = this._activeCell();
        if (!a) return;
        const l = this._colByField(a.colId);
        if (!l || !l.editable) return;
        e.preventDefault(), this.startEditingCell(a.rowId, a.colId, s);
      }
    });
    N(this, "_onEditorKey", (e) => {
      this.state.editing && (e.key === "Enter" ? (e.preventDefault(), this.stopEditing(!1)) : e.key === "Escape" ? (e.preventDefault(), this.stopEditing(!0)) : e.key === "Tab" && (e.preventDefault(), this._tabToEditableCell(e.shiftKey ? -1 : 1)));
    });
    N(this, "_onEditorBlur", () => {
      this._navigatingEditor || this.state.editing && this.stopEditing(!1);
    });
    // ----- Tree data (self-referential parent_id) -----
    //
    // The model layer flattens the tree and hands us back a Map of per-row
    // metadata (level, hasChildren, expanded). The controller owns the
    // expanded/collapsed override Map; the model just calls back through
    // `isTreeRowExpanded` to ask which state a given row is in. Everything
    // else (filter, sort, paginate) flows through the normal pipeline.
    N(this, "_isTreeRowExpanded", (e, t) => {
      const s = String(e);
      if (this._treeExpanded.has(s)) return this._treeExpanded.get(s);
      const i = this.state.tree?.defaultExpanded ?? -1;
      return i < 0 ? !0 : t < i;
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
      pagination: { enabled: !1, page: 0, pageSize: dt },
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = ys(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("mousemove", this._onRowDragMove), this._thead?.removeEventListener("contextmenu", this._onHeaderContextMenu), this._thead?.removeEventListener("click", this._onSynthHeaderClick), this._tbody?.removeEventListener("dragenter", this._onCellDragEnter), this._tbody?.removeEventListener("dragover", this._onCellDragOver), this._tbody?.removeEventListener("dragleave", this._onCellDragLeave), this._tbody?.removeEventListener("drop", this._onCellDrop), this._closeColumnMenu(), this._teardownPersistence(), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove(), this._resizeObserver?.disconnect(), this._resizeObserver = null;
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, s) => {
      if (t.hasAttribute("data-separator")) {
        const d = t.getAttribute("data-separator"), c = { __sgSeparator: !0 };
        d && d !== "" && d !== "true" && (c.variant = d);
        const u = t.getAttribute("data-label"), p = t.getAttribute("data-value");
        return u != null && (c.label = u), p != null && (c.value = p), c;
      }
      const i = {}, o = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      i[this.getRowIdValue] = o != null ? this._coerceRowId(o) : s + 1;
      const a = {};
      t.querySelectorAll("td").forEach((d) => {
        const c = d.getAttribute("data-cell-col-id-value") || d.getAttribute("data-col-id");
        if (!c) return;
        const u = d.getAttribute("data-cell-value");
        if (u != null)
          try {
            i[c] = JSON.parse(u);
          } catch {
            i[c] = u;
          }
        else
          i[c] = d.textContent.trim();
        const p = Number(d.getAttribute("data-spans") || d.getAttribute("colspan") || 1);
        p > 1 && (a[c] = p);
      }), Object.keys(a).length && (i.__sgSpans = a);
      const l = t.getAttribute("data-row-detail-rows-value");
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
      e = b("table");
      const s = b("thead");
      e.appendChild(s), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = b("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const s = b("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(s, e), s.appendChild(e), this._viewport = s;
    }
    if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = b("div", { class: "sg-status-bar", role: "status" }), this._statusBar.append(
      b("div", { class: "sg-status-section sg-status-left" }),
      b("div", { class: "sg-status-section sg-status-right" })
    ), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
      const s = b("div", { class: "sg-main" });
      this._viewport.parentNode.insertBefore(s, this._viewport), s.appendChild(this._viewport), this._statusBar && s.appendChild(this._statusBar), this._main = s, this._sidePanel = b("aside", {
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
    this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), this._restorePersistedState(), this._setupPersistence(), M(this.element, "grid:ready", { api: this.element.gridApi }), M(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  // Filter UI bridge — implemented by filter_controller, but the grid is the
  // single source of truth so it brokers the popover.
  openFilterFor(e, t) {
    const s = this._colByField(e);
    if (!(!s || !s.filter)) {
      this._closeFilterPopover();
      {
        this._openFallbackFilterPopover(s, t);
        return;
      }
    }
  }
  _closeFilterPopover() {
    this._filterPopover && (this._filterPopover.remove(), this._filterPopover = null, document.removeEventListener("mousedown", this._onDocMouseDown));
  }
  _openFallbackFilterPopover(e, t) {
    const s = this.state.filterModel[e.field] || {}, i = di(e.filter), o = b("div", { class: "sg-filter-popover" }), a = b("select");
    i.forEach((y) => a.append(new Option(y.label, y.value, !1, y.value === s.type)));
    const l = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", d = b("input", { type: l, value: s.value ?? "" }), c = b("input", { type: l, value: s.value2 ?? "", style: { display: "none" } }), u = () => {
      const y = a.value, L = y === "inRange", m = !(y === "blank" || y === "notBlank");
      d.style.display = m ? "" : "none", c.style.display = L ? "" : "none";
    };
    a.addEventListener("change", u), u();
    const p = b("div", { class: "sg-filter-actions" }), f = b("button", { type: "button" }, "Clear"), g = b("button", { type: "button", class: "primary" }, "Apply");
    p.append(f, g), f.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), g.addEventListener("click", () => {
      const y = a.value, L = y === "blank" || y === "notBlank" ? { filterType: e.filter, type: y } : { filterType: e.filter, type: y, value: d.value, value2: c.value || void 0 };
      this.setColumnFilter(e.field, L), this._closeFilterPopover();
    }), o.append(
      b("label", {}, "Condition"),
      a,
      d,
      c,
      p
    ), document.body.appendChild(o);
    const _ = t.getBoundingClientRect();
    o.style.left = `${_.left + window.scrollX}px`, o.style.top = `${_.bottom + window.scrollY + 2}px`, this._filterPopover = o, document.addEventListener("mousedown", this._onDocMouseDown), d.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const s = this.state.columnDefs.findIndex((d) => d.field === e.field), i = this._runtimeOverrides[e.field] || {}, o = s >= 0 ? this.state.columnDefs[s] : null, a = o ? {
      ...o.hidden != null ? { hidden: o.hidden } : {},
      ...o.pinned ? { pinned: o.pinned } : {},
      ...o.width != null ? { width: o.width } : {}
    } : {}, l = { ...e, ...i, ...a, _headerEl: t };
    if (s >= 0) {
      const d = this.state.columnDefs[s];
      if (d._headerEl === t && li(d, l)) return;
      this.state.columnDefs[s] = l;
    } else
      this.state.columnDefs.push(l);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${X(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const s = this.state.sortModel.findIndex((o) => o.colId === e);
    let i;
    s === -1 ? i = { colId: e, sort: "asc" } : this.state.sortModel[s].sort === "asc" ? i = { colId: e, sort: "desc" } : i = null, t ? (s >= 0 && this.state.sortModel.splice(s, 1), i && this.state.sortModel.push(i)) : this.state.sortModel = i ? [i] : [], this.scheduleRender("sort"), M(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  setSortModel(e) {
    this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), M(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  // ----- Filter -----
  setColumnFilter(e, t) {
    t == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = t, this.state.pagination.page = 0, this.scheduleRender("filter"), M(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setFilterModel(e) {
    this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), M(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setQuickFilter(e) {
    const t = e == null ? "" : String(e);
    t !== this.state.quickFilter && (this.state.quickFilter = t, this.state.pagination.page = 0, this.scheduleRender("filter"), M(this.element, "grid:filterChanged", {
      filterModel: { ...this.state.filterModel },
      quickFilter: t
    }));
  }
  getQuickFilter() {
    return this.state.quickFilter;
  }
  // ----- Selection -----
  toggleRowSelection(e, t = "single") {
    if (this.rowSelectionValue === "") return;
    const s = this.state.selection;
    this.rowSelectionValue === "single" ? (s.clear(), s.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? s.has(e) ? s.delete(e) : s.add(e) : (s.clear(), s.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), M(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(s)
    });
  }
  setSelected(e, t) {
    t ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), M(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  selectAll() {
    this._displayList.filteredSorted.forEach((e) => {
      !e.__sgGroup && !e.__sgSeparator && this.state.selection.add(this._rowId(e));
    }), this.scheduleRender("selection"), M(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  deselectAll() {
    this.state.selection.clear(), this.scheduleRender("selection"), M(this.element, "grid:selectionChanged", { selectedRows: [], selectedIds: [] });
  }
  getSelectedRows() {
    const e = this.state.selection;
    return this.state.rowData.filter((t) => e.has(this._rowId(t)));
  }
  _selectRange(e, t) {
    const s = this._displayList.filteredSorted, i = s.findIndex((d) => this._rowId(d) === e), o = s.findIndex((d) => this._rowId(d) === t);
    if (i < 0 || o < 0) return;
    const [a, l] = i <= o ? [i, o] : [o, i];
    for (let d = a; d <= l; d++)
      !s[d].__sgGroup && !s[d].__sgSeparator && this.state.selection.add(this._rowId(s[d]));
  }
  // ----- Pagination -----
  goToPage(e) {
    const t = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(e, t)), this.scheduleRender("page"), M(this.element, "grid:paginationChanged", {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  setPageSize(e) {
    this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), M(this.element, "grid:paginationChanged", {
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
    const e = Object.fromEntries(this.state.columnDefs.map((i) => [i.field, i])), t = this.state.columnDefs.filter((i) => !i.hidden && !i._isCheckbox);
    let s = ft(this.state.rowData, this.state.filterModel, e);
    return s = ht(s, this.state.quickFilter, t), s.length;
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
  startEditingCell(e, t, s = void 0) {
    const i = this.state.columnDefs.find((a) => a.field === t);
    if (!i || !i.editable) return;
    const o = this.state.rowData.find((a) => this._rowId(a) === e);
    o && (this.state.editing = { rowId: e, colId: t, originalValue: V(o, i), initialValue: s }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: s, originalValue: i, draftValue: o } = this.state.editing, a = this._tbody.querySelector(`tr[data-row-id="${X(t)}"] td[data-col-id="${X(s)}"]`);
    let l = i;
    if (!e && a) {
      const d = a.firstElementChild, c = d?.matches?.("[data-editor-input],input,select,textarea") ? d : a.querySelector("[data-editor-input]") || a.querySelector("input,select,textarea");
      c ? l = ci(c.value, this._colByField(s)?.type) : o !== void 0 && (l = o);
    }
    if (this.state.editing = null, !e && l !== i) {
      const d = this.state.rowData.find((u) => this._rowId(u) === t), c = d[s];
      d[s] = l, M(this.element, "grid:cellValueChanged", { rowId: t, colId: s, oldValue: c, newValue: l });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const s = this._colByField(e);
    s && (s.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), M(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const i = t || null;
    s.pinned = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: i }, this._reorderForPinning(), this.scheduleRender("columns"), M(this.element, "grid:columnPinned", { colId: e, pinned: i });
  }
  setColumnWidth(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const i = Math.max(s.minWidth || 40, Math.min(s.maxWidth || 4e3, t));
    s.width = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: i }, this.scheduleRender("columns"), M(this.element, "grid:columnResized", { colId: e, width: i });
  }
  moveColumn(e, t) {
    const s = this.state.columnDefs.findIndex((o) => o.field === e);
    if (s < 0 || s === t) return;
    const [i] = this.state.columnDefs.splice(s, 1);
    this.state.columnDefs.splice(t, 0, i), this.scheduleRender("columns"), M(this.element, "grid:columnMoved", { colId: e, fromIndex: s, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const s = X(e), i = this._thead?.querySelector(
      `th[data-header-cell-field-value="${s}"], th[data-field="${s}"]`
    ), o = Array.from(
      this._tbody?.querySelectorAll(`td[data-col-id="${s}"]`) || []
    ).filter((l) => !l.closest("tr")?.classList?.contains("sg-spacer"));
    let a = 0;
    if ((i || o.length) && (a = this._measureColumnContentWidth(i, o)), !a) {
      const l = (t.headerName || t.field || "").length, d = this.state.rowData.slice(0, 200);
      let c = l;
      for (const u of d) {
        const p = String(G(u, t) ?? "").length;
        p > c && (c = p);
      }
      a = c * 8;
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, a + 16)));
  }
  // Build an off-screen single-column <table table-layout:auto> with clones
  // of the header + a sample of body cells, mount it inside .sg-grid so
  // scoped CSS still applies, read the natural td widths, return the max.
  _measureColumnContentWidth(e, t, s = 50) {
    const i = document.createElement("table");
    i.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;table-layout:auto;width:auto;border-collapse:separate;border-spacing:0;";
    const o = document.createElement("tbody");
    i.appendChild(o);
    const a = (d) => {
      if (!d) return;
      const c = document.createElement("tr"), u = d.cloneNode(!0);
      u.removeAttribute("style"), c.appendChild(u), o.appendChild(c);
    };
    if (a(e), t.slice(0, s).forEach(a), !o.children.length) return 0;
    this.element.appendChild(i);
    let l = 0;
    for (const d of o.children) {
      const c = d.firstElementChild;
      c && c.offsetWidth > l && (l = c.offsetWidth);
    }
    return this.element.removeChild(i), l;
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), s = t.reduce((o, a) => o + (a.width || 150), 0);
    if (s === 0) return;
    const i = e / s;
    t.forEach((o) => {
      o.width = Math.max(o.minWidth || 40, Math.floor((o.width || 150) * i));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((i) => i.pinned === "left"), t = this.state.columnDefs.filter((i) => i.pinned === "right"), s = this.state.columnDefs.filter((i) => !i.pinned);
    this.state.columnDefs = [...e, ...s, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), M(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], s = [], i = [], o = new Map(this.state.rowData.map((a) => [this._rowId(a), a]));
    return (e.remove || []).forEach((a) => {
      const l = this._rowId(a);
      o.delete(l) && i.push(a);
    }), (e.update || []).forEach((a) => {
      const l = this._rowId(a);
      o.has(l) && (o.set(l, { ...o.get(l), ...a }), s.push(a));
    }), (e.add || []).forEach((a) => {
      const l = this._rowId(a);
      o.has(l) || (o.set(l, a), t.push(a));
    }), this.state.rowData = Array.from(o.values()), this.scheduleRender("data"), M(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: s, removed: i };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const s = this.state.columnDefs.filter((l) => !l.hidden && !l._isCheckbox), i = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((l) => !l.__sgGroup && !l.__sgDetail && !l.__sgSeparator), o = (l) => /[",\n\r]/.test(l) ? `"${String(l).replace(/"/g, '""')}"` : String(l), a = [s.map((l) => o(l.headerName || l.field)).join(e)];
    for (const l of i)
      a.push(s.map((d) => o(G(l, d))).join(e));
    return a.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const s = this.getDataAsCsv(t), i = new Blob([s], { type: "text/csv;charset=utf-8" }), o = URL.createObjectURL(i), a = b("a", { href: o, download: e });
    return document.body.appendChild(a), a.click(), a.remove(), URL.revokeObjectURL(o), s;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.has("tree") || e.size === 0) && (this._displayList = bs({
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
      getRowId: (t) => this._rowId(t)
    })), (e.has("columns") || e.has("sort") || e.has("filter") || e.has("selection") || e.has("group") || e.has("pivot") || e.has("tree")) && this._renderHeader(), this._renderBody(), this._renderPagination(), this._renderStatusBar();
  }
  _renderHeader() {
    if (!this._thead) return;
    const e = this._visibleCols(), t = gs(e, this._headerLayoutOpts());
    t.depth > 1 ? this._renderHeaderMultiRow(e, t) : this._renderHeaderSingleRow(e), this._renderColgroup(e);
  }
  // Aggregate the options we hand to buildHeaderLayout (auto-derived pivot
  // groups when in pivot mode, plus any user-declared columnGroups).
  _headerLayoutOpts() {
    const e = { columnGroups: this.columnGroupsValue || null };
    return this.state.pivot?.mode && this._displayList?.pivot && (e.pivotCols = (this.state.pivot.cols || []).map((t) => this._colByField(t)).filter(Boolean), e.valueConfigs = Object.entries(this.state.group.aggs || {}).map(([t, s]) => ({ col: this._colByField(t), aggFunc: s })).filter((t) => t.col)), e;
  }
  _renderColgroup(e) {
    let t = this._table.querySelector("colgroup");
    t || (t = b("colgroup"), this._table.insertBefore(t, this._thead));
    const s = Array.from(t.children);
    for (e.forEach((o, a) => {
      let l = s[a];
      l || (l = b("col"), t.appendChild(l)), l.style.width = o.width ? o.width + "px" : "";
    }); t.children.length > e.length; ) t.lastElementChild.remove();
    if (e.some((o) => !o.width))
      this._table.style.width = "100%";
    else {
      const o = e.reduce((l, d) => l + (Number(d.width) || 0), 0), a = this._viewport?.clientWidth || 0;
      if (a && o < a && e.length > 0) {
        const l = t.lastElementChild, d = Number(e[e.length - 1].width) || 0, c = o - d;
        l.style.width = a - c + "px", this._table.style.width = a + "px";
      } else
        this._table.style.width = o + "px";
    }
  }
  _renderHeaderSingleRow(e) {
    if (this._thead.children.length > 1) {
      const p = this._thead.firstElementChild;
      for (let f = 1; f < this._thead.children.length; f++) {
        const g = this._thead.children[f];
        Array.from(g.children).forEach((_) => {
          (_.hasAttribute("data-header-cell-field-value") || _.hasAttribute("data-field")) && p.appendChild(_);
        });
      }
      for (; this._thead.children.length > 1; ) this._thead.lastElementChild.remove();
    }
    const t = this._thead.querySelector("tr") || (() => {
      const p = b("tr");
      return this._thead.appendChild(p), p;
    })(), s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((p) => {
      const f = p.getAttribute("data-header-cell-field-value") || p.getAttribute("data-field");
      f && s.set(f, p);
    });
    const i = new Set(e.map((p) => p.field)), o = this.state.columnDefs.filter((p) => !i.has(p.field)), a = [...e, ...o], l = Array.from(t.children).map((p) => p.getAttribute("data-header-cell-field-value") || p.getAttribute("data-field")).filter(Boolean), d = a.map((p) => p.field);
    if (l.length === d.length && l.every((p, f) => p === d[f]))
      Array.from(t.children).forEach((p) => {
        p.removeAttribute("rowspan"), p.removeAttribute("colspan");
      });
    else {
      const p = [];
      for (const f of a) {
        let g = s.get(f.field);
        g ? (g.removeAttribute("rowspan"), g.removeAttribute("colspan")) : g = b("th", {
          "data-field": f.field,
          "data-synth": "true"
        }, [b("div", { class: "sg-header-content" }, [
          b("span", { class: "sg-header-label" }, f.headerName || f.field || "")
        ])]), p.push(g);
      }
      t.replaceChildren(...p);
    }
    Array.from(t.children).forEach((p) => {
      const f = p.getAttribute("data-header-cell-field-value") || p.getAttribute("data-field");
      f != null && (p.style.display = i.has(f) ? "" : "none");
    });
    const u = this._pinOffsets();
    for (const p of e) {
      const f = t.querySelector(`th[data-header-cell-field-value="${X(p.field)}"]`) || t.querySelector(`th[data-field="${X(p.field)}"]`);
      f && this._applyLeafThState(f, p, u);
    }
  }
  // Multi-row header: <thead> gets `layout.depth` rows of group headers
  // followed by the leaf headers, then one hidden row holding any registered
  // <th>s that aren't currently visible (so their controllers stay mounted).
  _renderHeaderMultiRow(e, t) {
    const s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((c) => {
      const u = c.getAttribute("data-header-cell-field-value") || c.getAttribute("data-field");
      u && s.set(u, c);
    });
    const i = [], o = new Set(e.map((c) => c.field)), a = this._pinOffsets();
    for (const c of t.rows) {
      const u = b("tr");
      for (const p of c) {
        if (p.kind === "group") {
          u.appendChild(b("th", {
            class: "sg-header-group",
            colspan: String(p.colspan),
            "data-group-header": "true"
          }, p.label || ""));
          continue;
        }
        const f = p.col;
        let g = s.get(f.field);
        if (g || (g = b("th", {
          "data-field": f.field,
          "data-synth": "true"
        }, [b("div", { class: "sg-header-content" }, [
          b("span", { class: "sg-header-label" }, p.label || f.headerName || f.field || "")
        ])])), p.label) {
          const _ = g.querySelector(".sg-header-label");
          _ && _.textContent !== p.label && (_.textContent = p.label);
        }
        g.setAttribute("rowspan", String(p.rowspan)), g.removeAttribute("colspan"), g.style.display = "", u.appendChild(g), this._applyLeafThState(g, f, a);
      }
      i.push(u);
    }
    const l = /* @__PURE__ */ new Set();
    t.rows.forEach((c) => c.forEach((u) => {
      u.kind === "leaf" && l.add(u.col.field);
    }));
    const d = this.state.columnDefs.filter(
      (c) => !o.has(c.field) && !l.has(c.field)
    );
    if (d.length) {
      const c = b("tr", { class: "sg-hidden-header-row" });
      for (const u of d) {
        let p = s.get(u.field);
        p || (p = b("th", { "data-field": u.field, "data-synth": "true" })), p.removeAttribute("rowspan"), p.removeAttribute("colspan"), c.appendChild(p);
      }
      i.push(c);
    }
    this._thead.replaceChildren(...i);
  }
  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(e, t, s) {
    const i = this.state.sortModel.find((o) => o.colId === t.field);
    Ye(e, {
      "data-sortable": t.sortable ? "true" : null,
      "data-filterable": t.filter ? "true" : null,
      "data-filter-active": this.state.filterModel[t.field] ? "true" : null,
      "data-sort": i?.sort || null,
      "data-pinned": t.pinned || null,
      // Carry the column's value-type onto the <th> so CSS can right-align
      // numeric headers (matching the right-aligned numeric body cells from
      // currency/number/percent renderers and from the `type: 'number'`
      // formatter path).
      "data-type": t.type && t.type !== "text" ? t.type : null,
      // Derived alignment so the header text mirrors whatever its body cells
      // do, even when alignment comes from a renderer rather than col.type.
      // See _columnAlignment for the resolution rules.
      "data-align": this._columnAlignment(t)
    }), t.width && (e.style.width = t.width + "px"), e.style.left = t.pinned === "left" ? s.left[t.field] + "px" : "", e.style.right = t.pinned === "right" ? s.right[t.field] + "px" : "", this._ensureHeaderChrome(e, t, i);
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
    const t = e.cellRenderer;
    return typeof t == "string" && oi.has(t) ? "right" : null;
  }
  _ensureHeaderChrome(e, t, s) {
    if (t._isRowNumber) {
      e.classList.add("sg-gutter-header"), e.textContent = "";
      return;
    }
    if (t._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let l = e.querySelector('input[type="checkbox"]');
      l || (l = b("input", { type: "checkbox", "aria-label": "Select all" }), l.addEventListener("change", (u) => {
        u.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(l));
      const d = this._displayList.filteredSorted.length, c = this.state.selection.size;
      l.checked = c > 0 && c >= d, l.indeterminate = c > 0 && c < d;
      return;
    }
    let i = e.querySelector(".sg-header-content");
    if (!i) {
      const l = e.textContent.trim();
      e.textContent = "", i = b("div", { class: "sg-header-content" }, [
        b("span", { class: "sg-header-label" }, l || t.headerName || t.field || "")
      ]), e.appendChild(i);
    }
    let o = i.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (o || (o = b("span", { class: "sg-sort-icon", "aria-hidden": "true" }), o.innerHTML = he, i.appendChild(o)), s && this.state.sortModel.length > 1) {
        let l = i.querySelector(".sg-sort-index");
        l || (l = b("span", { class: "sg-sort-index" }), i.appendChild(l)), l.textContent = String(this.state.sortModel.indexOf(s) + 1);
      } else
        i.querySelector(".sg-sort-index")?.remove();
    else o && o.remove();
    let a = i.querySelector(".sg-filter-icon");
    t.filter ? a || (a = b("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), a.innerHTML = ii, i.appendChild(a)) : a && a.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(b("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._withDetailRows(this._displayList.pageRows);
    this._selKeys = this._computeCellSelKeys();
    const s = !this.masterDetailValue && (this.virtualValue || t.length > 200);
    let i = t, o = 0;
    if (s) {
      const p = this._viewport?.clientHeight || 400, f = this.state.rowHeight, g = _s(this.state.scrollTop, p, f, t.length, 8);
      o = g.first, i = t.slice(g.first, g.last);
    }
    const a = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((p) => {
      const f = p.dataset.rowId;
      f != null && a.set(f, p);
    });
    const l = document.createDocumentFragment(), d = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0;
    let c = 0;
    for (let p = 0; p < o; p++) {
      const f = t[p];
      f && !f.__sgGroup && !f.__sgDetail && !f.__sgSeparator && (c += 1);
    }
    const u = (p) => !p || p.__sgGroup || p.__sgDetail || p.__sgSeparator ? null : (c += 1, d + c);
    if (s) {
      const p = this.state.rowHeight, f = o * p, g = (t.length - o - i.length) * p;
      l.appendChild(this._spacerRow(f, e.length)), i.forEach((_) => l.appendChild(this._buildRow(_, e, a, u(_)))), l.appendChild(this._spacerRow(g, e.length));
    } else
      i.forEach((p) => l.appendChild(this._buildRow(p, e, a, u(p))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && l.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(l);
  }
  _buildPinnedBottomRow(e) {
    const t = b("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), s = this._pinOffsets(), i = this._displayList.grandTotals || {};
    let o = !1;
    for (const a of e) {
      const l = b("td", { "data-col-id": a.field, "data-pinned": a.pinned || null });
      a.pinned === "left" ? l.style.left = s.left[a.field] + "px" : a.pinned === "right" && (l.style.right = s.right[a.field] + "px");
      const d = i[a.field];
      d != null ? (l.classList.add("sg-agg-cell"), l.textContent = this._formatAggregate(d)) : !o && !a._isCheckbox && !a._isRowNumber && (l.classList.add("sg-pinned-bottom-label"), l.textContent = "Total", o = !0), t.appendChild(l);
    }
    return t;
  }
  _buildRow(e, t, s, i) {
    if (e.__sgGroup) return this._buildGroupRow(e, t, s);
    if (e.__sgDetail) return this._buildDetailRow(e, t, s);
    if (e.__sgSeparator) return this._buildSeparatorRow(e, t, s);
    const o = String(this._rowId(e));
    let a = s.get(o);
    a || (a = b("tr")), a.dataset.rowId = o, a.classList.remove("sg-spacer");
    const l = this.state.selection.has(this._rowId(e)), d = this.masterDetailValue && this._isDetailExpanded(o);
    return Ye(a, {
      "data-selected": l ? "true" : null,
      "data-detail-expanded": d ? "true" : null
    }), this.masterDetailValue && a.classList.add("sg-master-row"), this._renderRow(a, e, t, i), a;
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
  _buildSeparatorRow(e, t, s) {
    const i = `__s:${e.__sgSeparatorId ?? this._separatorKey(e)}`;
    let o = s.get(i);
    o || (o = b("tr")), o.dataset.rowId = i, o.dataset.separator = "true", o.className = "", o.removeAttribute("data-selected"), o.removeAttribute("data-detail-expanded");
    const a = e.variant || (e.value != null ? "summary" : e.label != null ? "heading" : "blank");
    o.classList.add("sg-separator-row", `sg-separator-${a}`), e.className && o.classList.add(e.className), o.innerHTML = "";
    const l = (u) => u._isCheckbox || u._isRowNumber || u._isGroupCol || u._isMasterExpand, c = t.filter((u) => !l(u)).length || t.length || 1;
    for (const u of t) {
      if (l(u)) {
        const f = b("td", { "data-col-id": u.field, class: "sg-separator-gutter" });
        o.appendChild(f);
        continue;
      }
      const p = b("td", {
        "data-col-id": u.field,
        colspan: String(c),
        class: "sg-separator-cell"
      });
      this._renderSeparatorContent(p, e, a), o.appendChild(p);
      break;
    }
    return o;
  }
  _renderSeparatorContent(e, t, s) {
    if (s === "blank" || s === "divider")
      return;
    const i = b("div", { class: "sg-separator-content" });
    t.label != null && i.appendChild(b("span", { class: "sg-separator-label" }, String(t.label))), t.value != null && i.appendChild(b("span", { class: "sg-separator-value" }, String(t.value))), e.appendChild(i);
  }
  _separatorKey(e) {
    return [e.variant || "", e.label || "", e.value || ""].join("|");
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const i = b("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return i.style.height = "0px", i.appendChild(b("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), i;
    }
    const s = b("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return s.style.height = e + "px", s.appendChild(b("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), s;
  }
  _renderRow(e, t, s, i) {
    e.innerHTML = "";
    const o = this._pinOffsets(), a = this._selKeys || { active: null, range: null }, l = String(this._rowId(t)), d = this._displayList?.treeMeta, c = d ? d.get(l) : null, u = c ? this._treeDisplayColField() : null, p = t && t.__sgSpans || null;
    let f = 0;
    for (let g = 0; g < s.length; g++) {
      const _ = s[g];
      if (f > 0) {
        f -= 1;
        continue;
      }
      const y = _._isRowNumber || _._isCheckbox || _._isGroupCol || _._isMasterExpand, L = p && !y ? Number(p[_.field]) : 0, m = Math.max(1, Math.min(L || 1, s.length - g));
      m > 1 && (f = m - 1);
      const v = `${l}:${_.field}`, w = b("td", {
        "data-col-id": _.field,
        "data-pinned": _.pinned || null,
        "data-cell-active": a.active === v ? "true" : null,
        "data-cell-range": a.range && a.range.has(v) ? "true" : null,
        colspan: m > 1 ? String(m) : null
      });
      if (m > 1 && w.classList.add("sg-merged-cell"), _.pinned === "left" ? w.style.left = o.left[_.field] + "px" : _.pinned === "right" && (w.style.right = o.right[_.field] + "px"), _._isRowNumber) {
        w.classList.add("sg-gutter-cell"), w.setAttribute("data-gutter", "true"), w.removeAttribute("data-cell-active"), w.removeAttribute("data-cell-range"), w.textContent = i != null ? String(i) : "", e.appendChild(w);
        continue;
      }
      if (_._isCheckbox) {
        w.classList.add("sg-checkbox-cell");
        const A = b("input", { type: "checkbox" });
        A.checked = this.state.selection.has(this._rowId(t)), w.appendChild(A), e.appendChild(w);
        continue;
      }
      if (_._isGroupCol) {
        w.classList.add("sg-group-leaf-cell"), w.removeAttribute("data-cell-active"), w.removeAttribute("data-cell-range"), e.appendChild(w);
        continue;
      }
      if (_._isMasterExpand) {
        w.classList.add("sg-master-expand-cell"), w.setAttribute("data-master-expand", "true"), w.removeAttribute("data-cell-active"), w.removeAttribute("data-cell-range");
        const A = this._isDetailExpanded(this._rowId(t)), k = b("span", {
          class: "sg-master-expand-caret",
          "data-expanded": A ? "true" : "false",
          "aria-hidden": "true"
        });
        k.innerHTML = he, w.appendChild(k), e.appendChild(w);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === _.field) {
        w.setAttribute("data-editing", "true");
        const A = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : V(t, _), { node: k, control: C } = this._buildEditor(_, A);
        w.appendChild(k);
        const T = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          if (C?.focus(), T || C?.select?.(), C?.type && ai.has(C.type))
            try {
              C.showPicker?.();
            } catch {
            }
        });
      } else
        this._renderCellContent(w, t, _);
      c && _.field === u && this._decorateTreeCell(w, c), e.appendChild(w);
    }
  }
  // Prepend an indent spacer + a chevron (when the row has children) to the
  // tree column's <td>. The chevron carries data-tree-toggle so the body
  // click handler can route it back to toggleTreeRow without conflicting
  // with cell selection or row click handlers.
  _decorateTreeCell(e, t) {
    if (e.classList.add("sg-tree-cell"), e.setAttribute("data-tree-level", String(t.level)), e.style.paddingLeft = `${8 + t.level * 18}px`, t.hasChildren) {
      const s = b("span", {
        class: "sg-tree-chevron",
        "data-tree-toggle": "true",
        "data-expanded": t.expanded ? "true" : "false",
        "aria-hidden": "true"
      });
      s.innerHTML = he, e.insertBefore(s, e.firstChild);
    } else {
      const s = b("span", { class: "sg-tree-chevron sg-tree-chevron-leaf", "aria-hidden": "true" });
      e.insertBefore(s, e.firstChild);
    }
  }
  _renderCellContent(e, t, s) {
    if (s.cellRenderer) {
      const i = Qe(s.cellRenderer);
      if (i) {
        const a = V(t, s), l = G(t, s);
        (i.dataset.bind || i.dataset.bindText !== void 0) && (i.textContent = i.dataset.bind ? String(t[i.dataset.bind] ?? "") : l), i.dataset.bindAttr && i.setAttribute(i.dataset.bindAttr, a), i.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((d) => {
          d.dataset.bindText !== void 0 ? d.textContent = l : d.dataset.bind && (d.textContent = String(t[d.dataset.bind] ?? "")), d.dataset.bindAttr && d.setAttribute(d.dataset.bindAttr, a);
        }), e.appendChild(i);
        return;
      }
      const o = _t(s.cellRenderer);
      if (typeof o == "function") {
        const a = V(t, s), l = G(t, s), d = o({ value: a, row: t, col: s, td: e, formatted: l, api: this.element.gridApi });
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
    e.textContent = G(t, s);
  }
  toggleGroup(e, t = 0) {
    this._groupExpanded.set(e, !this._isGroupExpanded(e, t)), this.scheduleRender("group"), M(this.element, "grid:groupToggled", { groupId: e, expanded: this._groupExpanded.get(e) });
  }
  expandAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = -1, this.scheduleRender("group");
  }
  collapseAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = 0, this.scheduleRender("group");
  }
  setRowGroupColumns(e) {
    this.state.group.cols = Array.isArray(e) ? e.slice() : [], this._groupExpanded.clear(), this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("group"), M(this.element, "grid:columnRowGroupChanged", { rowGroupCols: this.state.group.cols.slice() });
  }
  addRowGroupColumn(e) {
    !e || this.state.group.cols.includes(e) || this.setRowGroupColumns([...this.state.group.cols, e]);
  }
  removeRowGroupColumn(e) {
    this.setRowGroupColumns(this.state.group.cols.filter((t) => t !== e));
  }
  getRowGroupColumns() {
    return this.state.group.cols.slice();
  }
  setColumnAggFunc(e, t) {
    t == null ? delete this.state.group.aggs[e] : this.state.group.aggs[e] = t, this.scheduleRender("group"), M(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  // ----- Pivot mode -----
  // Toggling pivot mode rebuilds the display list (and therefore the visible
  // column set). Clears row + cell selection since the underlying cell graph
  // changes shape entirely.
  setPivotMode(e) {
    const t = !!e;
    this.state.pivot.mode !== t && (this.state.pivot.mode = t, this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), M(this.element, "grid:pivotModeChanged", { pivot: t }));
  }
  isPivotMode() {
    return !!this.state.pivot.mode;
  }
  setPivotColumns(e) {
    this.state.pivot.cols = Array.isArray(e) ? e.slice() : [], this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), M(this.element, "grid:columnPivotChanged", { pivotCols: this.state.pivot.cols.slice() });
  }
  addPivotColumn(e) {
    !e || this.state.pivot.cols.includes(e) || this.setPivotColumns([...this.state.pivot.cols, e]);
  }
  removePivotColumn(e) {
    this.setPivotColumns(this.state.pivot.cols.filter((t) => t !== e));
  }
  getPivotColumns() {
    return this.state.pivot.cols.slice();
  }
  // "Value columns" = fields with an entry in state.group.aggs. Same map as the
  // grouping aggregations — drives both the per-group totals (in plain grouping)
  // and the pivot cell aggregations (in pivot mode).
  getValueColumns() {
    return Object.entries(this.state.group.aggs).map(([e, t]) => ({ field: e, aggFunc: t }));
  }
  setValueColumns(e) {
    const t = {};
    for (const { field: s, aggFunc: i } of e || [])
      s && i && (t[s] = i);
    this.state.group.aggs = t, this.scheduleRender(this.state.pivot.mode ? "pivot" : "group"), M(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  addValueColumn(e, t = "sum") {
    e && this.setColumnAggFunc(e, t);
  }
  removeValueColumn(e) {
    this.setColumnAggFunc(e, null);
  }
  // ----- Column header groups + pinned bottom row -----
  setColumnGroups(e) {
    this.columnGroupsValue = Array.isArray(e) ? e : [], this.scheduleRender("columns"), M(this.element, "grid:columnGroupsChanged", { columnGroups: this.columnGroupsValue });
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
        const t = { field: e.field };
        return e.width != null && (t.width = e.width), e.pinned && (t.pinned = e.pinned), e.hidden && (t.hidden = !0), t;
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
        const t = new Map(this.state.columnDefs.map((i) => [i.field, i])), s = [];
        for (const i of e.cols) {
          const o = t.get(i.field);
          o && (i.width != null && (o.width = i.width), o.pinned = i.pinned || void 0, o.hidden = !!i.hidden, t.delete(i.field), s.push(o));
        }
        for (const i of t.values()) s.push(i);
        this.state.columnDefs = s;
      }
      if (Array.isArray(e.rowGroupCols) && (this.state.group.cols = e.rowGroupCols.slice()), e.pivot && typeof e.pivot == "object" && (this.state.pivot.cols = Array.isArray(e.pivot.cols) ? e.pivot.cols.slice() : [], this.state.pivot.mode = !!e.pivot.mode), Array.isArray(e.values)) {
        const t = {};
        for (const { field: s, aggFunc: i } of e.values) s && i && (t[s] = i);
        this.state.group.aggs = t;
      }
      Array.isArray(e.columnGroups) && (this.columnGroupsValue = e.columnGroups), typeof e.pinnedBottomRow == "boolean" && (this.pinnedBottomRowValue = e.pinnedBottomRow), Array.isArray(e.sortModel) && (this.state.sortModel = e.sortModel.slice()), e.filterModel && typeof e.filterModel == "object" && (this.state.filterModel = { ...e.filterModel }), typeof e.quickFilter == "string" && (this.state.quickFilter = e.quickFilter);
      for (const t of ["columns", "group", "pivot", "sort", "filter", "data"])
        this.scheduleRender(t);
      M(this.element, "grid:columnStateApplied", { state: e });
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
        const t = JSON.parse(e);
        t && typeof t == "object" && this.applyColumnState(t);
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
    for (const t of ct) this.element.addEventListener(t, e);
    this._persistBeforeUnload = () => {
      this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
    }, window.addEventListener("beforeunload", this._persistBeforeUnload);
  }
  _teardownPersistence() {
    if (this._persistListener) {
      for (const e of ct) this.element.removeEventListener(e, this._persistListener);
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
  _buildGroupRow(e, t, s) {
    const i = `__g:${e.groupId}`;
    let o = s.get(i);
    return o || (o = b("tr")), o.dataset.rowId = i, o.dataset.group = "true", o.dataset.groupLevel = String(e.level), o.className = "sg-group-row", this._renderGroupRow(o, e, t), o;
  }
  _renderGroupRow(e, t, s) {
    e.innerHTML = "";
    const i = this._pinOffsets(), o = this._isGroupExpanded(t.groupId, t.level), a = (this.state.group.displayType || "singleColumn") === "singleColumn", l = !!(this.state.pivot?.mode && this._displayList?.pivot), d = t.__pivotAll === !0, c = s.filter((f) => !f._isRowNumber && !f._isCheckbox && !f._isGroupCol), u = c.some((f) => f.field === t.field) ? t.field : c[0]?.field, p = Math.max(0, t.level);
    d && e.classList.add("sg-pivot-all-row");
    for (const f of s) {
      const g = b("td", { "data-col-id": f.field, "data-pinned": f.pinned || null });
      if (f.pinned === "left" ? g.style.left = i.left[f.field] + "px" : f.pinned === "right" && (g.style.right = i.right[f.field] + "px"), f._isRowNumber || f._isCheckbox) {
        g.classList.add(f._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(g);
        continue;
      }
      if (l || a ? f._isGroupCol : f.field === u) {
        if (g.classList.add("sg-group-cell"), g.style.paddingLeft = `${8 + p * 18}px`, !d) {
          const y = b("span", {
            class: "sg-group-caret",
            "data-expanded": o ? "true" : "false",
            "aria-hidden": "true"
          });
          y.innerHTML = he, g.appendChild(y);
        }
        g.append(
          b("span", { class: "sg-group-label" }, this._groupValueLabel(t)),
          b("span", { class: "sg-group-count" }, ` (${t.count})`)
        );
      } else if (l && f._isPivot) {
        const y = V(t, f);
        y != null && (g.classList.add("sg-agg-cell"), g.textContent = this._formatAggregate(y));
      } else !f._isGroupCol && t.aggregates && t.aggregates[f.field] != null && (g.classList.add("sg-agg-cell"), g.textContent = this._formatAggregate(t.aggregates[f.field]));
      e.appendChild(g);
    }
  }
  _groupValueLabel(e) {
    const t = e.value;
    if (t == null || t === "") return "(Blanks)";
    const s = this._colByField(e.field);
    return s ? G({ [e.field]: t }, s) : String(t);
  }
  _formatAggregate(e) {
    return e == null ? "" : typeof e == "number" ? Number.isInteger(e) ? String(e) : String(Math.round(e * 100) / 100) : String(e);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, t) {
    if (e.cellEditor) {
      const i = Qe(e.cellEditor);
      if (i) {
        const o = i.matches?.("input,select,textarea,[data-editor-input]") ? i : i.querySelector?.("[data-editor-input]") || i.querySelector?.("input,select,textarea");
        return o && (this._seedEditorValue(o, e, t), o.addEventListener("keydown", this._onEditorKey), o.addEventListener("blur", this._onEditorBlur)), { node: i, control: o };
      }
    }
    const s = this._buildEditorInput(e, t);
    return { node: s, control: s };
  }
  _seedEditorValue(e, t, s) {
    if (t.type === "date" && s) {
      const i = s instanceof Date ? s : new Date(s);
      e.value = Number.isNaN(i?.getTime?.()) ? s ?? "" : i.toISOString().slice(0, 10);
    } else if (t.type === "datetime" && s) {
      const i = s instanceof Date ? s : new Date(s);
      if (Number.isNaN(i?.getTime?.()))
        e.value = s ?? "";
      else {
        const o = i.getTimezoneOffset() * 6e4;
        e.value = new Date(i.getTime() - o).toISOString().slice(0, 16);
      }
    } else t.type === "boolean" ? e.value = s === !0 ? "true" : s === !1 ? "false" : "" : e.value = s ?? "";
  }
  // Native input type per column `type`. HTML5 already covers most of what
  // the built-in renderers need (color picker, date picker, datetime-local
  // picker, native email/url/tel validation) — we just have to ask for the
  // right input type. Anything outside the known list falls through to a
  // plain text input, which is what cellEditor templates wrap when a column
  // wants something fancier.
  _buildEditorInput(e, t) {
    let s;
    if (e.type === "number") s = b("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const i = t instanceof Date ? t : t ? new Date(t) : null, o = i ? i.toISOString().slice(0, 10) : "";
      s = b("input", { type: "date", value: o });
    } else if (e.type === "datetime") {
      const i = t instanceof Date ? t : t ? new Date(t) : null;
      let o = "";
      if (i && !Number.isNaN(i.getTime())) {
        const a = i.getTimezoneOffset() * 6e4;
        o = new Date(i.getTime() - a).toISOString().slice(0, 16);
      }
      s = b("input", { type: "datetime-local", value: o });
    } else if (e.type === "color") {
      const i = /^#[0-9a-f]{6}$/i.test(String(t ?? "")) ? t : "#000000";
      s = b("input", { type: "color", value: i });
    } else e.type === "email" ? s = b("input", { type: "email", value: t ?? "" }) : e.type === "url" ? s = b("input", { type: "url", value: t ?? "" }) : e.type === "tel" ? s = b("input", { type: "tel", value: t ?? "" }) : e.type === "boolean" ? (s = b("select"), s.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : s = b("input", { type: "text", value: t ?? "" });
    return s.addEventListener("keydown", this._onEditorKey), s.addEventListener("blur", this._onEditorBlur), s;
  }
  _renderPagination() {
    this.state.pagination.enabled;
  }
  // ----- Status bar (rows · selection · range aggregates) -----
  _renderStatusBar() {
    if (!this._statusBar) return;
    const e = this._statusBar.querySelector(".sg-status-left"), t = this._statusBar.querySelector(".sg-status-right");
    e.replaceChildren();
    const s = this.state.serverSide ? this.state.serverRowCount : this.state.rowData.length, i = this._displayList.grouped ? this._displayList.leafCount ?? this.filteredCount() : this.filteredCount();
    e.appendChild(this._statusPanel(
      "Rows",
      this._fmtInt(i),
      i !== s ? `of ${this._fmtInt(s)}` : null
    ));
    const o = this.state.selection.size;
    o > 0 && e.appendChild(this._statusPanel("Selected", this._fmtInt(o))), t.replaceChildren();
    const a = this.getRangeAggregates();
    if (a && a.count > 0) {
      const d = (this.statusBarAggsValue || []).filter((c) => c in a);
      for (const c of d) {
        const u = a[c];
        u == null && c !== "count" || t.appendChild(this._statusPanel(this._aggLabel(c), this._fmtAgg(c, u)));
      }
    }
    const l = a ? `${a.count}|${a.sum}|${a.avg}|${a.min}|${a.max}` : "";
    l !== this._lastRangeAggs && (this._lastRangeAggs = l, M(this.element, "grid:rangeAggsChanged", { aggs: a }));
  }
  _statusPanel(e, t, s = null) {
    const i = b("div", { class: "sg-status-panel" });
    return i.append(
      b("span", { class: "sg-status-label" }, `${e}:`),
      b("span", { class: "sg-status-value" }, t)
    ), s && i.appendChild(b("span", { class: "sg-status-aside" }, s)), i;
  }
  _fmtInt(e) {
    return Number(e).toLocaleString();
  }
  _aggLabel(e) {
    return { count: "Count", sum: "Sum", avg: "Avg", min: "Min", max: "Max" }[e] || e;
  }
  _fmtAgg(e, t) {
    return t == null ? "—" : e === "count" ? this._fmtInt(t) : typeof t == "number" ? Number.isInteger(t) ? this._fmtInt(t) : (Math.round(t * 100) / 100).toLocaleString(void 0, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(t);
  }
  // Flat list of RAW cell values across every active range — fed to
  // aggregateRange to compute the status-bar numbers. Skips group rows and
  // the structural columns (gutter / checkbox / auto-group).
  _cellRangeRawValues() {
    const e = [];
    for (const t of this.state.cellSel.ranges) {
      const s = this._rangeRect(t);
      if (s)
        for (let i = s.r0; i <= s.r1; i++) {
          const o = s.rows[i];
          if (!(!o || o.__sgGroup || o.__sgDetail || o.__sgSeparator))
            for (let a = s.c0; a <= s.c1; a++) {
              const l = s.cols[a];
              !l || l._isCheckbox || l._isRowNumber || l._isGroupCol || l._isMasterExpand || e.push(V(o, l));
            }
        }
    }
    return e;
  }
  getRangeAggregates() {
    return this.state.cellSel.ranges.length ? os(this._cellRangeRawValues()) : null;
  }
  _showColumnMenu(e, t, s) {
    this._closeColumnMenu();
    const i = this._columnMenuItems(e), o = b("div", { class: "sg-column-menu", role: "menu" });
    for (const d of i) {
      if (d === "separator") {
        o.appendChild(b("div", { class: "sg-column-menu-separator", role: "separator" }));
        continue;
      }
      const c = b("button", {
        type: "button",
        class: "sg-column-menu-item" + (d.active ? " sg-column-menu-active" : ""),
        role: "menuitem"
      });
      c.append(
        b("span", { class: "sg-column-menu-label" }, d.label)
      ), d.active && c.append(b("span", { class: "sg-column-menu-check", "aria-hidden": "true" }, "✓")), c.addEventListener("click", () => {
        d.action(), this._closeColumnMenu();
      }), o.appendChild(c);
    }
    document.body.appendChild(o);
    const a = o.offsetWidth || 220, l = o.offsetHeight || 280;
    o.style.left = `${Math.min(t, window.innerWidth - a - 4)}px`, o.style.top = `${Math.min(s, window.innerHeight - l - 4)}px`, this._columnMenu = o, setTimeout(() => {
      document.addEventListener("mousedown", this._onDocMouseDownColumnMenu), document.addEventListener("keydown", this._onColumnMenuKey), window.addEventListener("resize", this._closeColumnMenuBound = () => this._closeColumnMenu(), { once: !0 }), window.addEventListener("scroll", this._closeColumnMenuBound, { once: !0, capture: !0 });
    }, 0), M(this.element, "grid:columnMenuOpened", { colId: e.field });
  }
  _closeColumnMenu() {
    this._columnMenu && (this._columnMenu.remove(), this._columnMenu = null, document.removeEventListener("mousedown", this._onDocMouseDownColumnMenu), document.removeEventListener("keydown", this._onColumnMenuKey), this._closeColumnMenuBound && (window.removeEventListener("resize", this._closeColumnMenuBound), window.removeEventListener("scroll", this._closeColumnMenuBound, { capture: !0 }), this._closeColumnMenuBound = null));
  }
  // Build the menu item list for `col` based on the current grid state. Each
  // item is { label, action, active? } or the string 'separator'. Items are
  // emitted only when they make sense (e.g. "Unpin" doesn't show on an
  // unpinned col), so the menu stays short.
  _columnMenuItems(e) {
    const t = this.element.gridApi, s = e.headerName || e.field, i = this.state.group.cols.includes(e.field), o = this.state.pivot.cols.includes(e.field), a = this.state.group.aggs[e.field], l = e.type === "number", d = [];
    if (e.pinned !== "left" && d.push({ label: "Pin left", action: () => t.setColumnPinned(e.field, "left") }), e.pinned !== "right" && d.push({ label: "Pin right", action: () => t.setColumnPinned(e.field, "right") }), e.pinned && d.push({ label: "Unpin", action: () => t.setColumnPinned(e.field, null) }), d.push("separator"), d.push({ label: "Autosize this column", action: () => t.autoSizeColumn(e.field) }), d.push({ label: "Autosize all columns", action: () => t.autoSizeAllColumns() }), d.push("separator"), d.push(i ? { label: `Ungroup ${s}`, action: () => t.removeRowGroupColumn(e.field) } : { label: `Group by ${s}`, action: () => t.addRowGroupColumn(e.field) }), d.push(o ? { label: `Remove ${s} from pivot`, action: () => t.removePivotColumn(e.field) } : { label: `Pivot by ${s}`, action: () => {
      t.isPivotMode() || t.setPivotMode(!0), t.addPivotColumn(e.field);
    } }), l || a) {
      d.push("separator");
      for (const c of ["sum", "avg", "count", "min", "max"])
        d.push({
          label: `Aggregate: ${c}`,
          active: a === c,
          action: () => t.addValueColumn(e.field, c)
        });
      a && d.push({ label: "Remove aggregation", action: () => t.removeValueColumn(e.field) });
    }
    return d.push("separator"), d.push({ label: "Hide column", action: () => t.setColumnVisible(e.field, !1) }), d.push({
      label: "Show all columns",
      action: () => {
        this.state.columnDefs.forEach((c) => {
          c.hidden && !c._isGroupCol && !c._isPivot && !c._isCheckbox && !c._isRowNumber && t.setColumnVisible(c.field, !0);
        });
      }
    }), d;
  }
  // ----- Event delegation (clicks on rendered tbody) -----
  // Stimulus actions on tbody — wired in _buildChrome by adding data-action.
  // For simplicity we add native listeners here.
  _attachBodyListeners() {
    this._listenersAttached || (this._listenersAttached = !0, this._tbody.addEventListener("click", (e) => this._onBodyClick(e)), this._tbody.addEventListener("dblclick", (e) => this._onBodyDblClick(e)), this._tbody.addEventListener("mousedown", this._onCellMouseDown), this._tbody.addEventListener("mouseover", this._onCellMouseOver), document.addEventListener("mouseup", this._onCellMouseUp), document.addEventListener("copy", this._onCopy), this._viewport.addEventListener("scroll", this._onScroll, { passive: !0 }), this.acceptFilesValue && (this._tbody.addEventListener("dragenter", this._onCellDragEnter), this._tbody.addEventListener("dragover", this._onCellDragOver), this._tbody.addEventListener("dragleave", this._onCellDragLeave), this._tbody.addEventListener("drop", this._onCellDrop)));
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
    const t = e?.closest?.("td"), s = e?.closest?.("tr");
    if (!t || !s || s.dataset.group === "true" || s.dataset.separator === "true" || s.classList.contains("sg-detail-row") || t.classList.contains("sg-checkbox-cell") || t.classList.contains("sg-group-leaf-cell") || t.classList.contains("sg-master-expand-cell") || t.dataset.gutter === "true" || !t.dataset.colId) return null;
    const i = t.dataset.colId, o = this._colByField(i);
    return o && o.acceptFiles === !1 ? null : { td: t, tr: s, colId: i, rowId: this._coerceRowId(s.dataset.rowId), col: o };
  }
  _isFileDrag(e) {
    const t = e.dataTransfer?.types;
    return t ? Array.from(t).includes("Files") : !1;
  }
  _onBodyClick(e) {
    const t = e.target.closest("tr");
    if (!t) return;
    if (t.dataset.group === "true") {
      this.toggleGroup(t.dataset.rowId.replace(/^__g:/, ""), Number(t.dataset.groupLevel) || 0);
      return;
    }
    if (t.dataset.separator === "true" || t.classList.contains("sg-detail-row")) return;
    if (e.target.closest?.('td[data-master-expand="true"]')) {
      const d = this._coerceRowId(t.dataset.rowId);
      this.toggleDetailRow(d);
      return;
    }
    const i = e.target.closest?.('[data-tree-toggle="true"]');
    if (i && t.contains(i)) {
      const d = this._coerceRowId(t.dataset.rowId);
      this.toggleTreeRow(d);
      return;
    }
    if (e.target.closest('td[data-editing="true"]')) return;
    const o = this._coerceRowId(t.dataset.rowId), a = e.target.closest("td");
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
        const d = e.shiftKey ? "range" : e.metaKey || e.ctrlKey ? "toggle" : "replace";
        this.clearCellSelection(), this.toggleRowSelection(o, d), M(this.element, "grid:rowClicked", { rowId: o, row: this.state.rowData.find((c) => this._rowId(c) === o), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (a) {
      const d = this.state.rowData.find((u) => this._rowId(u) === o), c = a.dataset.colId;
      M(this.element, "grid:cellClicked", { rowId: o, colId: c, value: d?.[c], event: e });
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
    this.toggleRowSelection(o, l), M(this.element, "grid:rowClicked", { rowId: o, row: this.state.rowData.find((d) => this._rowId(d) === o), event: e });
  }
  // ----- Cell selection (Numbers/Sheets-style: multi-range + active cell) -----
  _cellAt(e) {
    const t = e.closest?.("td"), s = e.closest?.("tr");
    return !t || !s || s.dataset.group === "true" || s.dataset.separator === "true" || s.classList.contains("sg-detail-row") || t.classList.contains("sg-checkbox-cell") || t.classList.contains("sg-group-leaf-cell") || t.classList.contains("sg-master-expand-cell") || t.dataset.gutter === "true" || !t.dataset.colId || t.dataset.editing === "true" ? null : { rowId: this._coerceRowId(s.dataset.rowId), colId: t.dataset.colId };
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
    const t = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
    t ? t.focus = e : this._setSingleCellSel(e);
  }
  clearCellSelection() {
    this.state.cellSel = { ranges: [], activeIdx: -1 }, this._applyCellSelHighlight();
  }
  _startRowDrag(e) {
    const t = Array.from(this.state.selection).map(String), s = new Set(t.includes(String(e)) ? t : [String(e)]), i = b("div", { class: "sg-drag-ghost sg-grid" }), o = b("table"), a = b("tbody");
    let l = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((c) => {
      if (s.has(c.dataset.rowId) && l < 6) {
        const u = c.cloneNode(!0);
        u.removeAttribute("data-selected"), u.querySelectorAll("td").forEach((p) => {
          p.style.left = "", p.style.right = "", p.removeAttribute("data-pinned"), p.removeAttribute("data-cell-active"), p.removeAttribute("data-cell-range");
        }), a.appendChild(u), l += 1;
      }
    }), o.appendChild(a), i.appendChild(o), s.size > l && i.appendChild(b("div", { class: "sg-drag-ghost-more" }, `+${s.size - l} more rows`)), i.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(i);
    const d = b("div", { class: "sg-drop-indicator" });
    document.body.appendChild(d), this._rowDrag = { ids: s, ghost: i, indicator: d, dropRowId: null, dropBefore: !0 }, document.body.classList.add("sg-row-dragging");
  }
  _updateDropIndicator(e) {
    const t = Array.from(this._tbody.querySelectorAll("tr[data-row-id]"));
    let s = null, i = !0;
    for (const d of t) {
      const c = d.getBoundingClientRect();
      if (e < c.top + c.height / 2) {
        s = d, i = !0;
        break;
      }
      s = d, i = !1;
    }
    if (!s) return;
    const o = s.getBoundingClientRect(), a = this._viewport.getBoundingClientRect(), l = this._rowDrag.indicator;
    l.style.left = `${a.left}px`, l.style.width = `${a.width}px`, l.style.top = `${(i ? o.top : o.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(s.dataset.rowId), this._rowDrag.dropBefore = i;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: s, dropRowId: i, dropBefore: o } = this._rowDrag;
    if (t.remove(), s.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, i == null || e.has(String(i))) return;
    const a = this.state.rowData, l = a.filter((u) => e.has(String(this._rowId(u)))), d = a.filter((u) => !e.has(String(this._rowId(u))));
    let c = d.findIndex((u) => this._rowId(u) === i);
    c < 0 ? c = d.length : o || (c += 1), d.splice(c, 0, ...l), this.state.rowData = d, this.state.sortModel = [], this.scheduleRender("data"), M(this.element, "grid:rowDragEnd", {
      ids: l.map((u) => this._rowId(u)),
      toRowId: i,
      before: o
    });
  }
  // Toggle the active/range data-attrs on the existing cell DOM without
  // rebuilding the tbody (so in-flight mouse interactions aren't disrupted).
  _applyCellSelHighlight() {
    const e = this._computeCellSelKeys();
    this._selKeys = e, this._tbody && (this._tbody.querySelectorAll("td[data-col-id]").forEach((t) => {
      const s = t.parentElement, i = `${s && s.dataset.rowId}:${t.dataset.colId}`;
      e.active === i ? t.setAttribute("data-cell-active", "true") : t.removeAttribute("data-cell-active"), e.range && e.range.has(i) ? t.setAttribute("data-cell-range", "true") : t.removeAttribute("data-cell-range");
    }), this._renderStatusBar());
  }
  // Rectangle (display indices) for a {anchor,focus} range, or null.
  _rangeRect(e) {
    if (!e) return null;
    const t = this._displayList.pageRows, s = this._visibleCols(), i = (u) => t.findIndex((p) => this._rowId(p) === u), o = (u) => s.findIndex((p) => p.field === u), a = i(e.anchor.rowId), l = o(e.anchor.colId);
    if (a < 0 || l < 0) return null;
    const d = i(e.focus.rowId), c = o(e.focus.colId);
    return {
      r0: Math.min(a, d < 0 ? a : d),
      r1: Math.max(a, d < 0 ? a : d),
      c0: Math.min(l, c < 0 ? l : c),
      c1: Math.max(l, c < 0 ? l : c),
      rows: t,
      cols: s
    };
  }
  _activeRect() {
    return this._rangeRect(this.state.cellSel.ranges[this.state.cellSel.activeIdx]);
  }
  _cellRangeRows(e = this._activeRect()) {
    if (!e) return [];
    const t = [];
    for (let s = e.r0; s <= e.r1; s++) {
      const i = e.rows[s];
      if (!i) continue;
      const o = [];
      for (let a = e.c0; a <= e.c1; a++) {
        const l = e.cols[a];
        l && o.push(G(i, l));
      }
      t.push(o);
    }
    return t;
  }
  // Active cell key + union of all ranges' cells (active stays outlined, unfilled).
  _computeCellSelKeys() {
    const e = this._activeCell();
    if (!e) return { active: null, range: null };
    const t = `${e.rowId}:${e.colId}`, s = /* @__PURE__ */ new Set();
    for (const i of this.state.cellSel.ranges) {
      const o = this._rangeRect(i);
      if (o)
        for (let a = o.r0; a <= o.r1; a++) {
          const l = o.rows[a];
          if (l)
            for (let d = o.c0; d <= o.c1; d++) {
              const c = o.cols[d];
              if (!c) continue;
              const u = `${this._rowId(l)}:${c.field}`;
              u !== t && s.add(u);
            }
        }
    }
    return { active: t, range: s };
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
    for (const t of this.state.cellSel.ranges) {
      const s = this._rangeRect(t);
      if (s)
        for (let i = s.r0; i <= s.r1; i++) {
          const o = s.rows[i];
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
    return this._visibleCols().filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol && !e._isMasterExpand);
  }
  _moveActiveCell(e, t, s) {
    const i = this._displayList.pageRows, o = this._navCols();
    if (!i.length || !o.length) return;
    const a = (p, f, g) => Math.max(f, Math.min(p, g)), l = this._activeCell(), d = () => i.findIndex((p) => !p.__sgGroup && !p.__sgDetail && !p.__sgSeparator);
    let c = l ? i.findIndex((p) => this._rowId(p) === l.rowId) : d(), u = l ? o.findIndex((p) => p.field === l.colId) : 0;
    if (c < 0 && (c = d()), !(c < 0)) {
      if (u < 0 && (u = 0), s && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const p = this.state.cellSel.ranges[this.state.cellSel.activeIdx], f = a(i.findIndex((_) => this._rowId(_) === p.focus.rowId) + e, 0, i.length - 1), g = a(o.findIndex((_) => _.field === p.focus.colId) + t, 0, o.length - 1);
        this._extendActiveRange({ rowId: this._rowId(i[f]), colId: o[g].field });
      } else {
        let p = a(c + e, 0, i.length - 1);
        if (e !== 0) {
          for (; i[p] && (i[p].__sgGroup || i[p].__sgDetail || i[p].__sgSeparator); ) {
            const g = p + e;
            if (g < 0 || g >= i.length) break;
            p = g;
          }
          if (!i[p] || i[p].__sgGroup || i[p].__sgDetail || i[p].__sgSeparator) return;
        }
        const f = a(u + t, 0, o.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(i[p]), colId: o[f].field });
      }
      this._applyCellSelHighlight(), this._scrollActiveIntoView(), M(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    }
  }
  _selectAllCells() {
    const e = this._displayList.pageRows, t = this._navCols();
    !e.length || !t.length || (this.state.cellSel = {
      ranges: [{
        anchor: { rowId: this._rowId(e[0]), colId: t[0].field },
        focus: { rowId: this._rowId(e[e.length - 1]), colId: t[t.length - 1].field }
      }],
      activeIdx: 0
    }, this._applyCellSelHighlight(), M(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
  }
  // Clear the value of every selected, editable cell (Delete/Backspace).
  _clearSelectedCells() {
    let e = !1;
    for (const t of this.state.cellSel.ranges) {
      const s = this._rangeRect(t);
      if (s)
        for (let i = s.r0; i <= s.r1; i++) {
          const o = s.rows[i];
          if (!(!o || o.__sgGroup || o.__sgDetail || o.__sgSeparator))
            for (let a = s.c0; a <= s.c1; a++) {
              const l = s.cols[a];
              if (!l || !l.editable || l._isCheckbox || l._isRowNumber) continue;
              const d = o[l.field];
              d === "" || d == null || (o[l.field] = "", e = !0, M(this.element, "grid:cellValueChanged", { rowId: this._rowId(o), colId: l.field, oldValue: d, newValue: "" }));
            }
        }
    }
    return e && this.scheduleRender("cells"), e;
  }
  _scrollActiveIntoView() {
    this._tbody?.querySelector('td[data-cell-active="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  _onBodyDblClick(e) {
    const t = e.target.closest("tr"), s = e.target.closest("td");
    if (!t || !s || s.dataset.editing === "true") return;
    const i = this._coerceRowId(t.dataset.rowId), o = s.dataset.colId;
    this.startEditingCell(i, o);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const s = this._visibleCols().filter((p) => p.editable && !p._isCheckbox), i = this._displayList.pageRows, o = i.findIndex((p) => this._rowId(p) === t.rowId), a = s.findIndex((p) => p.field === t.colId);
    if (!s.length || !i.length || o < 0 || a < 0) {
      this.stopEditing(!1);
      return;
    }
    const l = i.length * s.length, d = (o * s.length + a + e + l) % l, c = i[Math.floor(d / s.length)], u = s[d % s.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(c), u.field), requestAnimationFrame(() => {
      this._navigatingEditor = !1;
    });
  }
  // Wire editor listeners whenever a cell mounts an input.
  // Done lazily via MutationObserver on tbody (cheap because tbody is small per page).
  // ----- Helpers -----
  _visibleCols() {
    const e = this.state.columnDefs.filter((l) => !l.hidden), t = this.state.group?.cols || [], s = this.masterDetailValue && !this.state.pivot?.mode && !t.length;
    if (this.state.pivot?.mode && this._displayList?.pivotResultColumns?.length)
      return [{
        field: "__group",
        headerName: t.length ? t.map((d) => this._colByField(d)?.headerName || d).join(" → ") : "",
        _isGroupCol: !0,
        width: t.length ? 220 : 90,
        sortable: !1,
        filter: null,
        resizable: !1
      }, ...this._displayList.pivotResultColumns];
    if (!t.length)
      return s ? [this._masterExpandCol(), ...e] : e;
    if ((this.state.group.displayType || "singleColumn") === "singleColumn") {
      const l = new Set(t);
      return [{
        field: "__group",
        headerName: "Group",
        _isGroupCol: !0,
        width: 240,
        sortable: !1,
        filter: null,
        resizable: !1
      }, ...e.filter((c) => !l.has(c.field))];
    }
    if (this.groupReorderColumnsValue === !1) return e;
    const o = t.map((l) => e.find((d) => d.field === l)).filter(Boolean), a = new Set(o);
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
  // ----- Master/detail rows -----
  _isDetailExpanded(e) {
    return this._detailExpanded.has(String(e));
  }
  // Splice a synthetic `__sgDetail` row in directly after each expanded master
  // in the page rows. Done after buildDisplayList so detail expansion stays
  // a UI concern — the model.js pipeline doesn't need to know about it.
  _withDetailRows(e) {
    if (!this.masterDetailValue || !this._detailExpanded.size || this.state.pivot?.mode || (this.state.group.cols || []).length) return e;
    const t = [];
    for (const s of e) {
      if (t.push(s), s.__sgGroup || s.__sgDetail || s.__sgSeparator) continue;
      const i = this._rowId(s);
      this._isDetailExpanded(i) && t.push({ __sgDetail: !0, master: s, masterId: i });
    }
    return t;
  }
  toggleDetailRow(e) {
    this.masterDetailValue && (this._isDetailExpanded(e) ? this.collapseDetailRow(e) : this.expandDetailRow(e));
  }
  expandDetailRow(e) {
    if (!this.masterDetailValue) return;
    const t = String(e);
    if (this._detailExpanded.has(t)) return;
    this._detailExpanded.add(t), this.scheduleRender("cells");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === t);
    M(this.element, "grid:detailRowExpanded", { rowId: e, masterRow: s });
  }
  collapseDetailRow(e) {
    if (!this.masterDetailValue) return;
    const t = String(e);
    if (!this._detailExpanded.has(t)) return;
    this._detailExpanded.delete(t), this._detailGrids.delete(t), this.scheduleRender("cells");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === t);
    M(this.element, "grid:detailRowCollapsed", { rowId: e, masterRow: s });
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
    const t = !!e;
    this.masterDetailValue !== t && (this.masterDetailValue = t, t || (this._detailExpanded.clear(), this._detailGrids.clear()), this.scheduleRender("columns"));
  }
  isMasterDetail() {
    return !!this.masterDetailValue;
  }
  toggleTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e), s = this._isTreeRowExpanded(t, 0);
    this._treeExpanded.set(t, !s), this.scheduleRender("tree");
    const i = this.state.rowData.find((o) => String(this._rowId(o)) === t);
    M(this.element, s ? "grid:treeRowCollapsed" : "grid:treeRowExpanded", { rowId: e, row: i });
  }
  expandTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !0), this.scheduleRender("tree");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === t);
    M(this.element, "grid:treeRowExpanded", { rowId: e, row: s });
  }
  collapseTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (!this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !1), this.scheduleRender("tree");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === t);
    M(this.element, "grid:treeRowCollapsed", { rowId: e, row: s });
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
    const t = !!e;
    this.treeDataValue !== t && (this.treeDataValue = t, this.state.tree.enabled = t, t || this._treeExpanded.clear(), this.scheduleRender("tree"), M(this.element, "grid:treeDataChanged", { treeData: t }));
  }
  isTreeData() {
    return !!this.state.tree?.enabled;
  }
  setTreeParentField(e) {
    const t = e || "parent_id";
    this.state.tree.parentField !== t && (this.state.tree.parentField = t, this.treeParentFieldValue = t, this.scheduleRender("tree"));
  }
  // Which leaf column hosts the tree indent + chevron? Defaults to the first
  // visible non-synthetic, non-gutter column when treeDisplayField isn't set.
  _treeDisplayColField() {
    const e = this.state.tree?.displayField;
    return e || this._visibleCols().find((i) => !i._isCheckbox && !i._isRowNumber && !i._isGroupCol && !i._isMasterExpand)?.field || null;
  }
  // Build the detail <tr>: one cell spanning the full visible width, holding a
  // padded shell that hosts either a cloned <template> or a default summary
  // pulled from the master row.
  _buildDetailRow(e, t, s) {
    const i = `__d:${e.masterId}`;
    let o = s.get(i);
    const a = String(e.masterId);
    if (o) {
      if (o.getAttribute("data-master-id") === a)
        return o.classList.remove("sg-spacer"), o;
      o = null;
    }
    o || (o = b("tr")), o.className = "sg-detail-row", o.dataset.rowId = i, o.setAttribute("data-master-id", a), o.innerHTML = "";
    const l = b("td", { colspan: String(t.length || 1), class: "sg-detail-cell" }), d = b("div", { class: "sg-detail-shell" });
    return d.style.minHeight = `${this.detailRowHeightValue}px`, l.appendChild(d), o.appendChild(l), this._populateDetailShell(d, e.master, e.masterId), o;
  }
  // Fill the detail shell. Strategy: if the grid has a detail-template value
  // pointing at an existing <template>, clone its content and run a tiny
  // data-bind pass keyed off the master row. Otherwise render a minimal
  // fallback so the panel still appears (handy when the user is wiring up
  // their first detail panel and hasn't authored a template yet).
  _populateDetailShell(e, t, s) {
    const i = this.detailTemplateValue;
    let o;
    if (i) {
      const l = document.getElementById(i);
      if (l && l.tagName === "TEMPLATE") {
        const d = l.content.cloneNode(!0);
        this._applyDetailBindings(d, t), e.appendChild(d), o = e;
      }
    }
    if (!o) {
      const l = b("div", { class: "sg-detail-fallback" }), d = Object.keys(t || {}).filter((c) => !c.startsWith("_") && !c.startsWith("__")).slice(0, 6);
      for (const c of d)
        l.append(
          b("span", { class: "sg-detail-fallback-label" }, `${c}: `),
          b("span", { class: "sg-detail-fallback-value" }, String(t[c] ?? "")),
          b("span", { class: "sg-detail-fallback-sep" }, "  ·  ")
        );
      l.lastElementChild?.remove(), e.appendChild(l);
    }
    const a = e.querySelector('[data-controller~="grid"]');
    a && this._seedNestedGrid(a, t, s), queueMicrotask(() => {
      M(this.element, "grid:detailRowMounted", {
        rowId: s,
        masterRow: t,
        detailEl: e,
        nestedGridApi: a?.gridApi || null
      });
    });
  }
  // Walk the cloned template for [data-detail-bind="<field>"] (textContent),
  // [data-detail-bind-attr="<attr>:<field>"] (attribute), and [data-detail-if="<field>"]
  // (drop the node when falsy). Tiny, on purpose — anything richer belongs in
  // the consumer's own JS via grid:detailRowMounted.
  _applyDetailBindings(e, t) {
    if (!t) return;
    e.querySelectorAll("[data-detail-bind], [data-detail-bind-attr], [data-detail-if]").forEach((i) => {
      if (i.hasAttribute("data-detail-if")) {
        const o = i.getAttribute("data-detail-if");
        if (!t[o]) {
          i.remove();
          return;
        }
      }
      if (i.hasAttribute("data-detail-bind")) {
        const o = i.getAttribute("data-detail-bind");
        i.textContent = t[o] == null ? "" : String(t[o]);
      }
      if (i.hasAttribute("data-detail-bind-attr")) {
        const o = i.getAttribute("data-detail-bind-attr"), [a, l] = o.split(":");
        a && l && i.setAttribute(a, t[l] == null ? "" : String(t[l]));
      }
    });
  }
  // Seed a nested grid with the master row's detail rows before its controller
  // boots, so its first render shows the right data without an extra round
  // through scheduleRender. Cache the inner gridApi once it appears so the
  // outer grid can refresh it later if the master data is updated.
  _seedNestedGrid(e, t, s) {
    const i = this.detailRowsKeyValue;
    if (i) {
      const o = t?.[i];
      if (Array.isArray(o))
        try {
          e.setAttribute("data-grid-row-data-value", JSON.stringify(o));
        } catch {
        }
    }
    queueMicrotask(() => {
      e.gridApi && this._detailGrids.set(String(s), e.gridApi);
    });
  }
  _pinOffsets() {
    const e = this._visibleCols(), t = {};
    let s = 0;
    for (const o of e)
      o.pinned === "left" && (t[o.field] = s, s += o.width || 150);
    const i = {};
    s = 0;
    for (let o = e.length - 1; o >= 0; o--) {
      const a = e[o];
      a.pinned === "right" && (i[a.field] = s, s += a.width || 150);
    }
    return { left: t, right: i };
  }
  _colByField(e) {
    return this.state.columnDefs.find((t) => t.field === e);
  }
  _rowId(e) {
    return e?.[this.getRowIdValue] ?? e?.id ?? e;
  }
  _coerceRowId(e) {
    if (e == null) return e;
    const t = Number(e);
    return Number.isFinite(t) && String(t) === e ? t : e;
  }
}
N(je, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: dt },
  rowHeight: { type: Number, default: ri },
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
function li(n, r) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (n[t] !== r[t]) return !1;
  return !0;
}
function di(n) {
  return n === "number" || n === "date" ? [
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "lessThan", label: "Less than" },
    { value: "greaterThan", label: "Greater than" },
    { value: "inRange", label: "In range" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" }
  ] : n === "boolean" ? [
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
function ci(n, r) {
  if (r === "number") {
    const e = Number(n);
    return Number.isFinite(e) ? e : n;
  }
  if (r === "date") return n;
  if (r === "datetime") {
    if (!n) return n;
    const e = new Date(n);
    return Number.isNaN(e.getTime()) ? n : e.toISOString();
  }
  return r === "boolean" ? n === "true" ? !0 : n === "false" ? !1 : null : n;
}
function X(n) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(n)) : String(n).replace(/["\\\n\r]/g, (r) => "\\" + r);
}
class Ke extends K {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    N(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, s = e.clientY;
      let i = !1;
      const o = (l) => {
        const d = Math.abs(l.clientX - t), c = Math.abs(l.clientY - s);
        !i && (d > 5 || c > 5) && (i = !0, document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), this._beginReorder(t));
      }, a = (l) => {
        document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), i || this.sort(l);
      };
      document.addEventListener("mousemove", o), document.addEventListener("mouseup", a);
    });
  }
  connect() {
    if (this.grid = vs(this.element, "grid", this.application), !!this.grid) {
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
    let t = null;
    if (this.cellRendererConfigValue)
      try {
        t = JSON.parse(this.cellRendererConfigValue);
      } catch (i) {
        console.warn(`[stimulus_grid] invalid cellRendererConfig JSON for ${this.fieldValue}:`, i);
      }
    let s = null;
    if (this.enumValuesValue)
      try {
        s = JSON.parse(this.enumValuesValue);
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
      cellRendererConfig: t,
      enumValues: s,
      _isCheckbox: this.checkboxValue,
      _isRowNumber: this.rowNumberValue,
      acceptFiles: e,
      sortable: this.rowNumberValue ? !1 : this.sortableValue,
      resizable: this.rowNumberValue ? !1 : this.resizableValue
    };
  }
  _beginReorder(e) {
    if (!this.grid) return;
    const t = this.element.parentElement, s = Array.from(t.children), i = s.indexOf(this.element);
    let o = i;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const a = (d) => {
      const c = d.clientX;
      let u = s.length;
      for (let p = 0; p < s.length; p++) {
        const f = s[p].getBoundingClientRect();
        if (c < f.left + f.width / 2) {
          u = p;
          break;
        }
      }
      o = u > i ? u - 1 : u;
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
    const t = e.clientX, s = this.element.offsetWidth, i = (a) => this.grid.setColumnWidth(this.fieldValue, s + (a.clientX - t)), o = () => {
      document.removeEventListener("mousemove", i), document.removeEventListener("mouseup", o), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", i), document.addEventListener("mouseup", o), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
N(Ke, "values", {
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
class Un extends K {
  connect() {
  }
}
class Wn extends K {
  connect() {
  }
}
class Xn extends K {
  connect() {
  }
}
class Ee extends K {
  constructor() {
    super(...arguments);
    N(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), s = e.paginationGetTotalPages(), i = e.paginationGetRowCount(), o = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const a = i === 0 ? 0 : t * o + 1, l = Math.min(i, a + o - 1);
        this.pageInfoTarget.textContent = i === 0 ? "0 rows" : `${a}–${l} of ${i}`;
      }
      this.hasFirstTarget && (this.firstTarget.disabled = t === 0), this.hasPrevTarget && (this.prevTarget.disabled = t === 0), this.hasNextTarget && (this.nextTarget.disabled = t >= s - 1), this.hasLastTarget && (this.lastTarget.disabled = t >= s - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(o));
    });
  }
  connect() {
    this.element.classList.add("sg-pagination-bar"), this.hasGridOutlet && this._wire(this.gridOutletElement);
  }
  disconnect() {
    this._gridEl && this._unwire(this._gridEl);
  }
  gridOutletConnected(e, t) {
    this._wire(t);
  }
  gridOutletDisconnected(e, t) {
    this._unwire(t);
  }
  _wire(e) {
    this._gridEl = e;
    for (const t of ["grid:paginationChanged", "grid:rowDataChanged", "grid:filterChanged", "grid:ready"])
      e.addEventListener(t, this._refresh);
    e.gridApi && this._refresh();
  }
  _unwire(e) {
    for (const t of ["grid:paginationChanged", "grid:rowDataChanged", "grid:filterChanged", "grid:ready"])
      e.removeEventListener(t, this._refresh);
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
    const t = parseInt(e.target.value, 10);
    Number.isFinite(t) && t > 0 && this._gridEl?.gridApi?.paginationSetPageSize(t);
  }
}
N(Ee, "outlets", ["grid"]), N(Ee, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
const $e = ["sum", "avg", "count", "min", "max"], ui = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', pi = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class Yn extends K {
  connect() {
    this.grid = this.element.closest(".sg-grid"), this._activeTab = "columns", this._collapsed = !1, this._build(), this.grid?.gridApi ? this._render() : this.grid && this.grid.addEventListener("grid:ready", () => this._render(), { once: !0 }), this._gridListener = () => this._render();
    for (const r of [
      "grid:columnRowGroupChanged",
      "grid:columnPivotChanged",
      "grid:columnValueChanged",
      "grid:pivotModeChanged",
      "grid:columnVisible",
      "grid:rowDataChanged",
      "grid:columnStateApplied"
    ]) this.grid?.addEventListener(r, this._gridListener);
  }
  disconnect() {
    if (!(!this.grid || !this._gridListener))
      for (const r of [
        "grid:columnRowGroupChanged",
        "grid:columnPivotChanged",
        "grid:columnValueChanged",
        "grid:pivotModeChanged",
        "grid:columnVisible",
        "grid:rowDataChanged",
        "grid:columnStateApplied"
      ]) this.grid.removeEventListener(r, this._gridListener);
  }
  // ----- Skeleton -----
  _build() {
    this.element.innerHTML = "", this._content = b("div", { class: "sg-side-panel-content" });
    const r = b("div", { class: "sg-side-panel-tabs" });
    this._columnsTab = b("button", {
      type: "button",
      class: "sg-side-panel-tab",
      "aria-pressed": "true",
      title: "Columns"
    }), this._columnsTab.innerHTML = ui, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), r.appendChild(this._columnsTab), this.element.append(this._content, r);
  }
  _onTabClick(r) {
    this._activeTab === r && !this._collapsed ? (this._collapsed = !0, this.element.classList.add("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", "false")) : (this._collapsed = !1, this._activeTab = r, this.element.classList.remove("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", r === "columns" ? "true" : "false"), this._render());
  }
  // ----- Helpers -----
  _api() {
    return this.grid?.gridApi;
  }
  // Real (non-synthetic) columns the user can manipulate.
  _columns() {
    return (this._api()?.getColumnDefs() || []).filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol && !e._isPivot);
  }
  _colByField(r) {
    return (this._api()?.getColumnDefs() || []).find((e) => e.field === r);
  }
  // ----- Render -----
  _render() {
    if (this._collapsed || this._activeTab !== "columns") return;
    const r = this._api();
    if (!r) return;
    this._content.innerHTML = "";
    const e = b("label", { class: "sg-panel-pivot-toggle" }), t = b("input", { type: "checkbox" });
    t.checked = r.isPivotMode(), t.addEventListener("change", () => r.setPivotMode(t.checked)), e.append(t, b("span", {}, "Pivot mode")), this._content.appendChild(e), this._content.appendChild(this._renderColumnsList()), this._content.appendChild(this._renderDropSection({
      title: "Row Groups",
      placeholder: "Drag here to group rows",
      kind: "rowGroup",
      fields: r.getRowGroupColumns()
    })), this._content.appendChild(this._renderValuesSection()), r.isPivotMode() && this._content.appendChild(this._renderDropSection({
      title: "Column Labels",
      placeholder: "Drag here to pivot columns",
      kind: "pivot",
      fields: r.getPivotColumns()
    }));
  }
  _renderColumnsList() {
    const r = this._api(), e = b("div", { class: "sg-panel-section" });
    e.appendChild(b("div", { class: "sg-panel-section-title" }, "Columns"));
    const t = b("ul", { class: "sg-column-list" });
    e.appendChild(t);
    const s = new Set(r.getRowGroupColumns()), i = new Set(r.getPivotColumns()), o = new Map(r.getValueColumns().map((a) => [a.field, a.aggFunc]));
    for (const a of this._columns()) {
      const l = b("li", { class: "sg-column-list-item", draggable: "true" });
      l.dataset.field = a.field;
      const d = b("span", { class: "sg-column-grip", "aria-hidden": "true" });
      d.innerHTML = pi;
      const c = b("input", { type: "checkbox" });
      c.checked = !a.hidden, c.addEventListener("change", () => r.setColumnVisible(a.field, c.checked));
      const u = b("span", { class: "sg-column-list-label" }, a.headerName || a.field), p = b("span", { class: "sg-column-list-tags" });
      s.has(a.field) && p.appendChild(b("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), i.has(a.field) && p.appendChild(b("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), o.has(a.field) && p.appendChild(b("span", { class: "sg-tag sg-tag-value", title: `Value (${o.get(a.field)})` }, o.get(a.field))), l.append(d, c, u, p), this._wireDragSource(l, a.field), t.appendChild(l);
    }
    return this._wireDropZone(t, "columns"), e;
  }
  _renderDropSection({ title: r, placeholder: e, kind: t, fields: s }) {
    const i = b("div", { class: "sg-panel-section sg-panel-drop" });
    i.appendChild(b("div", { class: "sg-panel-section-title" }, r));
    const o = b("div", { class: "sg-drop-zone" });
    if (o.dataset.dropKind = t, !s.length)
      o.classList.add("sg-drop-zone-empty"), o.appendChild(b("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const a of s) o.appendChild(this._renderChip(t, a));
    return this._wireDropZone(o, t), i.appendChild(o), i;
  }
  _renderValuesSection() {
    const r = this._api(), e = b("div", { class: "sg-panel-section sg-panel-drop" });
    e.appendChild(b("div", { class: "sg-panel-section-title" }, "Values"));
    const t = b("div", { class: "sg-drop-zone" });
    t.dataset.dropKind = "value";
    const s = r.getValueColumns();
    if (!s.length)
      t.classList.add("sg-drop-zone-empty"), t.appendChild(b("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
    else
      for (const { field: i, aggFunc: o } of s) t.appendChild(this._renderValueChip(i, o));
    return this._wireDropZone(t, "value"), e.appendChild(t), e;
  }
  _renderChip(r, e) {
    const t = this._colByField(e), s = b("span", { class: "sg-chip", draggable: "true" });
    return s.dataset.field = e, s.dataset.fromKind = r, s.append(
      b("span", { class: "sg-chip-label" }, t?.headerName || e),
      this._removeButton(() => this._removeFrom(r, e))
    ), this._wireDragSource(s, e), s;
  }
  _renderValueChip(r, e) {
    const t = this._api(), s = this._colByField(r), i = b("span", { class: "sg-chip sg-chip-value", draggable: "true" });
    i.dataset.field = r, i.dataset.fromKind = "value";
    const o = b("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return o.addEventListener("click", (a) => {
      a.stopPropagation();
      const l = $e.indexOf(e), d = $e[(l === -1 ? 0 : l + 1) % $e.length];
      t.setColumnAggFunc(r, d);
    }), i.append(
      o,
      b("span", { class: "sg-chip-label" }, s?.headerName || r),
      this._removeButton(() => t.removeValueColumn(r))
    ), this._wireDragSource(i, r), i;
  }
  _removeButton(r) {
    const e = b("button", { type: "button", class: "sg-chip-remove", "aria-label": "Remove", title: "Remove" });
    return e.textContent = "×", e.addEventListener("click", (t) => {
      t.stopPropagation(), r();
    }), e;
  }
  // ----- DnD plumbing -----
  _wireDragSource(r, e) {
    r.addEventListener("dragstart", (t) => {
      t.dataTransfer.effectAllowed = "move", t.dataTransfer.setData("text/plain", e), r.classList.add("sg-dragging");
    }), r.addEventListener("dragend", () => r.classList.remove("sg-dragging"));
  }
  _wireDropZone(r, e) {
    r.addEventListener("dragover", (t) => {
      t.preventDefault(), t.dataTransfer.dropEffect = "move", r.classList.add("sg-drop-over");
    }), r.addEventListener("dragleave", (t) => {
      t.target === r && r.classList.remove("sg-drop-over");
    }), r.addEventListener("drop", (t) => {
      t.preventDefault(), r.classList.remove("sg-drop-over");
      const s = t.dataTransfer.getData("text/plain");
      s && this._handleDrop(e, s);
    });
  }
  // A field lives in at most one of {rowGroup, pivot, value} at a time.
  // Dropping on a zone removes it from the others first.
  _handleDrop(r, e) {
    const t = this._api();
    if (r === "columns") {
      this._removeEverywhere(e);
      return;
    }
    this._removeEverywhere(e, r), r === "rowGroup" ? t.addRowGroupColumn(e) : r === "pivot" ? t.addPivotColumn(e) : r === "value" && t.addValueColumn(e, "sum");
  }
  _removeFrom(r, e) {
    const t = this._api();
    r === "rowGroup" ? t.removeRowGroupColumn(e) : r === "pivot" ? t.removePivotColumn(e) : r === "value" && t.removeValueColumn(e);
  }
  _removeEverywhere(r, e = null) {
    const t = this._api();
    e !== "rowGroup" && t.removeRowGroupColumn(r), e !== "pivot" && t.removePivotColumn(r), e !== "value" && t.removeValueColumn(r);
  }
}
function fi(n) {
  const r = n ?? Zn.start();
  return r.register("grid", je), r.register("header-cell", Ke), r.register("row", Un), r.register("cell", Wn), r.register("filter", Xn), r.register("pagination", Ee), r.register("side-panel", Yn), r;
}
const hi = {
  start: fi,
  GridController: je,
  HeaderCellController: Ke,
  RowController: Un,
  CellController: Wn,
  FilterController: Xn,
  PaginationController: Ee,
  SidePanelController: Yn,
  registerRenderer: x,
  getRenderer: _t,
  listRenderers: Vs,
  renderers: si
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = hi);
export {
  Wn as CellController,
  Xn as FilterController,
  je as GridController,
  Ke as HeaderCellController,
  Ee as PaginationController,
  Un as RowController,
  Yn as SidePanelController,
  hi as default,
  _t as getRenderer,
  Vs as listRenderers,
  x as registerRenderer,
  si as renderers,
  fi as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
