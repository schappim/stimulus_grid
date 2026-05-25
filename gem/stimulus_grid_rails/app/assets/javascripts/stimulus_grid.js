var dt = Object.defineProperty;
var ct = (i, n, e) => n in i ? dt(i, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[n] = e;
var M = (i, n, e) => ct(i, typeof n != "symbol" ? n + "" : n, e);
import { Controller as P, Application as ut } from "@hotwired/stimulus";
function T(i, n) {
  return typeof n.valueGetter == "function" ? n.valueGetter(i) : i?.[n.field];
}
function k(i, n) {
  const e = T(i, n);
  return typeof n.valueFormatter == "function" ? n.valueFormatter(e, i) : e == null ? "" : n.type === "date" && e instanceof Date ? e.toLocaleDateString() : n.type === "boolean" ? e ? "✓" : "" : String(e);
}
const me = {
  contains: (i, n) => String(i ?? "").toLowerCase().includes(String(n ?? "").toLowerCase()),
  notContains: (i, n) => !String(i ?? "").toLowerCase().includes(String(n ?? "").toLowerCase()),
  equals: (i, n) => String(i ?? "").toLowerCase() === String(n ?? "").toLowerCase(),
  notEqual: (i, n) => String(i ?? "").toLowerCase() !== String(n ?? "").toLowerCase(),
  startsWith: (i, n) => String(i ?? "").toLowerCase().startsWith(String(n ?? "").toLowerCase()),
  endsWith: (i, n) => String(i ?? "").toLowerCase().endsWith(String(n ?? "").toLowerCase()),
  blank: (i) => i == null || i === "",
  notBlank: (i) => i != null && i !== ""
}, ht = {
  equals: (i, n) => Number(i) === Number(n),
  notEqual: (i, n) => Number(i) !== Number(n),
  lessThan: (i, n) => Number(i) < Number(n),
  lessThanOrEqual: (i, n) => Number(i) <= Number(n),
  greaterThan: (i, n) => Number(i) > Number(n),
  greaterThanOrEqual: (i, n) => Number(i) >= Number(n),
  inRange: (i, n, e) => Number(i) >= Number(n) && Number(i) <= Number(e),
  blank: (i) => i == null || i === "",
  notBlank: (i) => i != null && i !== ""
};
function I(i) {
  if (i == null || i === "") return null;
  if (i instanceof Date) return i;
  const n = new Date(i);
  return Number.isNaN(n.valueOf()) ? null : n;
}
const pt = {
  equals: (i, n) => I(i)?.toDateString() === I(n)?.toDateString(),
  notEqual: (i, n) => I(i)?.toDateString() !== I(n)?.toDateString(),
  lessThan: (i, n) => (I(i)?.valueOf() ?? -1 / 0) < (I(n)?.valueOf() ?? 1 / 0),
  greaterThan: (i, n) => (I(i)?.valueOf() ?? 1 / 0) > (I(n)?.valueOf() ?? -1 / 0),
  inRange: (i, n, e) => {
    const t = I(i)?.valueOf();
    return t != null && t >= (I(n)?.valueOf() ?? -1 / 0) && t <= (I(e)?.valueOf() ?? 1 / 0);
  },
  blank: (i) => i == null || i === "",
  notBlank: (i) => i != null && i !== ""
}, ft = {
  equals: (i, n) => n === "true" ? !!i : n === "false" ? !i : !0
}, gt = {
  in: (i, n) => Array.isArray(n) && n.includes(String(i ?? ""))
}, mt = { text: me, number: ht, date: pt, boolean: ft, set: gt };
function _e(i, n, e) {
  if (!e) return !0;
  const t = e.filterType || n.filter || "text", r = (mt[t] || me)[e.type];
  if (!r) return !0;
  const l = T(i, n);
  return r(l, e.value, e.value2);
}
function ve(i, n, e) {
  const t = Object.entries(n || {}).filter(([, s]) => s != null);
  return t.length === 0 ? i : i.filter((s) => s && s.__sgSeparator ? !0 : t.every(([r, l]) => {
    const a = e[r];
    return a ? _e(s, a, l) : !0;
  }));
}
function we(i, n, e) {
  if (!n) return i;
  const t = String(n).toLowerCase();
  return i.filter((s) => {
    if (s && s.__sgSeparator) return !0;
    for (const r of e) {
      const l = k(s, r);
      if (l && String(l).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function F(i, n, e) {
  if (i == null && n == null) return 0;
  if (i == null) return -1;
  if (n == null) return 1;
  if (e === "number") return Number(i) - Number(n);
  if (e === "date") {
    const t = I(i)?.valueOf() ?? 0, s = I(n)?.valueOf() ?? 0;
    return t - s;
  }
  return e === "boolean" ? i === n ? 0 : i ? 1 : -1 : String(i).localeCompare(String(n), void 0, { numeric: !0, sensitivity: "base" });
}
function _t(i, n, e) {
  if (!n || n.length === 0) return i;
  const t = (o, d) => {
    for (const { colId: c, sort: h } of n) {
      const u = e[c];
      if (!u) continue;
      const p = T(o, u), g = T(d, u), m = typeof u.comparator == "function" ? u.comparator(p, g, o, d) : F(p, g, u.type);
      if (m !== 0) return h === "desc" ? -m : m;
    }
    return 0;
  };
  if (!i.some((o) => o && o.__sgSeparator)) return i.slice().sort(t);
  const r = [];
  let l = [];
  const a = () => {
    if (l.length) {
      l.sort(t);
      for (const o of l) r.push(o);
      l = [];
    }
  };
  for (const o of i)
    o && o.__sgSeparator ? (a(), r.push(o)) : l.push(o);
  return a(), r;
}
function O(i, n) {
  if (!n || !n.enabled) return { rows: i, total: i.length, pageRows: i };
  const e = i.length, t = Math.max(1, Math.ceil(e / n.pageSize)), s = Math.min(n.page, t - 1), r = s * n.pageSize, l = i.slice(r, r + n.pageSize);
  return { rows: i, total: e, totalPages: t, page: s, pageRows: l };
}
function ye(i, n, e) {
  if (i === "count") return n.length;
  const t = n.map((r) => T(r, e));
  if (i === "first") return t.length ? t[0] : null;
  if (i === "last") return t.length ? t[t.length - 1] : null;
  const s = t.map(Number).filter((r) => !Number.isNaN(r));
  switch (i) {
    case "sum":
      return s.reduce((r, l) => r + l, 0);
    case "avg":
      return s.length ? s.reduce((r, l) => r + l, 0) / s.length : null;
    case "min":
      return s.length ? Math.min(...s) : null;
    case "max":
      return s.length ? Math.max(...s) : null;
    default:
      return null;
  }
}
function W(i, n, e) {
  const t = {};
  for (const [s, r] of Object.entries(n || {})) {
    const l = e[s];
    l && (t[s] = ye(r, i, l));
  }
  return t;
}
function vt(i) {
  let n = 0, e = 0, t = 0, s = 1 / 0, r = -1 / 0;
  for (const l of i) {
    if (l == null || l === "") continue;
    n += 1;
    let a = null;
    if (typeof l == "number" && Number.isFinite(l)) a = l;
    else if (typeof l == "string" && l.trim() !== "") {
      const o = Number(l);
      Number.isFinite(o) && (a = o);
    }
    a != null && (e += 1, t += a, a < s && (s = a), a > r && (r = a));
  }
  return {
    count: n,
    sum: e ? t : null,
    avg: e ? t / e : null,
    min: e ? s : null,
    max: e ? r : null
  };
}
function wt(i, n, e, t, s = () => !0) {
  const r = (d, c, h) => {
    const u = n[c], p = /* @__PURE__ */ new Map();
    for (const g of d) {
      const m = T(g, u), v = m == null ? "" : String(m);
      p.has(v) || p.set(v, { value: m, rows: [] }), p.get(v).rows.push(g);
    }
    return Array.from(p.values()).sort((g, m) => F(g.value, m.value, u.type)).map(({ value: g, rows: m }) => {
      const v = g == null ? "" : String(g), b = h ? `${h}|${u.field}=${v}` : `${u.field}=${v}`;
      return {
        __sgGroup: !0,
        level: c,
        field: u.field,
        value: g,
        groupId: b,
        count: m.length,
        aggregates: W(m, t, e),
        leaves: m,
        children: c + 1 < n.length ? r(m, c + 1, b) : null
      };
    });
  }, l = r(i, 0, ""), a = [], o = (d) => {
    for (const c of d)
      if (a.push(c), !!s(c.groupId, c.level))
        if (c.children) o(c.children);
        else for (const h of c.leaves) a.push(h);
  };
  return o(l), { displayList: a, tree: l };
}
function be(i, n, e) {
  return `__p|${e.map((s) => {
    const r = i[s.field];
    return `${s.field}=${r == null ? "" : String(r)}`;
  }).join("|")}|${n.col.field}:${n.aggFunc}`;
}
function Ce(i, n) {
  return n.map((e) => {
    const t = T(i, e);
    return t == null ? "" : String(t);
  }).join("");
}
function yt(i, n) {
  if (!n?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const t of i) {
    const s = Ce(t, n);
    if (!e.has(s)) {
      const r = {};
      n.forEach((l) => {
        const a = T(t, l);
        r[l.field] = a ?? null;
      }), e.set(s, r);
    }
  }
  return Array.from(e.values()).sort((t, s) => {
    for (const r of n) {
      const l = F(t[r.field], s[r.field], r.type);
      if (l !== 0) return l;
    }
    return 0;
  });
}
function bt(i, n, e) {
  if (!i.length || !n.length) return [];
  const t = [], s = n.length === 1;
  for (const r of i)
    for (const l of n) {
      const a = be(r, l, e), o = e.map((c) => r[c.field] == null ? "(Blank)" : String(r[c.field])).join(" · "), d = s ? o : `${o} · ${l.aggFunc}(${l.col.field})`;
      t.push({
        field: a,
        headerName: d,
        type: "number",
        width: 100,
        sortable: !0,
        filter: null,
        resizable: !1,
        _isPivot: !0,
        pivotKeys: { ...r },
        valueField: l.col.field,
        aggFunc: l.aggFunc,
        valueGetter: (c) => c?.__pivotValues?.[a] ?? null
      });
    }
  return t;
}
function Ct(i) {
  return typeof i == "string" && i.startsWith("__p|");
}
function St(i, n) {
  const e = Array.isArray(i) ? i.filter((t) => t && t.colId && t.sort) : [];
  return (t, s) => {
    for (const r of e) {
      const l = r.sort === "desc" ? -1 : 1;
      if (Ct(r.colId)) {
        const a = t.__pivotValues ? t.__pivotValues[r.colId] : null, o = s.__pivotValues ? s.__pivotValues[r.colId] : null, d = F(a, o, "number");
        if (d !== 0) return l * d;
        continue;
      }
      if (n && r.colId === n.field) {
        const a = F(t.value, s.value, n.type);
        if (a !== 0) return l * a;
        continue;
      }
    }
    return F(t.value, s.value, n?.type);
  };
}
function ae(i, n, e, t) {
  const s = {}, r = /* @__PURE__ */ new Map();
  for (const l of i) {
    const a = Ce(l, t);
    r.has(a) || r.set(a, []), r.get(a).push(l);
  }
  for (const l of n) {
    const a = t.map((d) => {
      const c = l[d.field];
      return c == null ? "" : String(c);
    }).join(""), o = r.get(a) || [];
    for (const d of e) {
      const c = be(l, d, t);
      s[c] = o.length ? ye(d.aggFunc, o, d.col) : null;
    }
  }
  return s;
}
function xt({ rows: i, rowGroupCols: n = [], pivotCols: e, valueConfigs: t, isExpanded: s = () => !0, sortModel: r = [] }) {
  const l = yt(i, e), a = bt(l, t, e), o = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: i.length,
    aggregates: {},
    leaves: i,
    __pivotValues: ae(i, l, t, e)
  };
  if (!n.length)
    return { columns: a, displayList: [o], tree: [], combos: l };
  const d = (p, g, m) => {
    const v = n[g], b = /* @__PURE__ */ new Map();
    for (const y of p) {
      const x = T(y, v), L = x == null ? "" : String(x);
      b.has(L) || b.set(L, { value: x, rows: [] }), b.get(L).rows.push(y);
    }
    const _ = Array.from(b.values()).map(({ value: y, rows: x }) => {
      const L = y == null ? "" : String(y), E = m ? `${m}|${v.field}=${L}` : `${v.field}=${L}`;
      return {
        __sgGroup: !0,
        level: g,
        field: v.field,
        value: y,
        groupId: E,
        count: x.length,
        aggregates: {},
        leaves: x,
        __pivotValues: ae(x, l, t, e),
        children: g + 1 < n.length ? d(x, g + 1, E) : null
      };
    }), S = St(r, v);
    return _.sort(S);
  }, c = d(i, 0, ""), h = [o], u = (p) => {
    for (const g of p)
      h.push(g), s(g.groupId, g.level) && g.children && u(g.children);
  };
  return u(c), { columns: a, displayList: h, tree: c, combos: l };
}
function Lt(i, { pivotCols: n = [], valueConfigs: e = [], columnGroups: t = null } = {}) {
  if (i._isPivot && n.length && i.pivotKeys)
    return Rt(i, n, e);
  if (t && Array.isArray(t) && t.length && !i._isGroupCol && !i._isCheckbox && !i._isRowNumber) {
    for (const s of t)
      if (s?.children && s.children.includes(i.field))
        return [
          { kind: "group", id: `g:${s.headerName}`, label: s.headerName },
          { kind: "leaf", col: i }
        ];
  }
  return [{ kind: "leaf", col: i }];
}
function Rt(i, n, e) {
  const t = (e?.length || 0) > 1, s = [];
  for (let r = 0; r < n.length; r++) {
    const l = n[r].field, a = i.pivotKeys[l];
    if (r === n.length - 1 && !t)
      return s.push({ kind: "leaf", col: i, label: a == null ? "(Blank)" : String(a) }), s;
    s.push({
      kind: "group",
      id: `p:${r}:${a == null ? "" : String(a)}`,
      label: a == null ? "(Blank)" : String(a)
    });
  }
  return s.push({ kind: "leaf", col: i, label: `${i.aggFunc}(${i.valueField})` }), s;
}
function Mt(i, n = {}) {
  if (!i.length) return { rows: [[]], depth: 1 };
  const e = i.map((r) => Lt(r, n).slice()), t = Math.max(1, ...e.map((r) => r.length)), s = [];
  for (let r = 0; r < t; r++) {
    const l = [];
    let a = 0;
    for (; a < e.length; ) {
      const o = e[a];
      if (r >= o.length || o[r] === null) {
        a += 1;
        continue;
      }
      const d = o[r];
      if (d.kind === "leaf") {
        l.push({ kind: "leaf", col: d.col, label: d.label, rowspan: t - r, colspan: 1 });
        for (let h = r + 1; h < t; h++) o[h] = null;
        a += 1;
        continue;
      }
      let c = a + 1;
      for (; c < e.length; ) {
        const h = e[c];
        if (r >= h.length || !h[r] || h[r].kind !== "group" || h[r].id !== d.id) break;
        let u = !0;
        for (let p = 0; p < r; p++) {
          const g = o[p]?.id ?? null, m = h[p]?.id ?? null;
          if (g !== m) {
            u = !1;
            break;
          }
        }
        if (!u) break;
        c += 1;
      }
      l.push({ kind: "group", label: d.label, colspan: c - a, rowspan: 1 }), a = c;
    }
    s.push(l);
  }
  return { rows: s, depth: t };
}
function Dt({
  rows: i,
  parentField: n = "parent_id",
  getRowId: e = (l) => l?.id,
  passesFilter: t = null,
  siblingComparator: s = null,
  isExpanded: r = () => !0
} = {}) {
  if (!Array.isArray(i) || i.length === 0)
    return { displayList: [], treeMeta: /* @__PURE__ */ new Map() };
  const l = (v) => {
    const b = e(v);
    return b == null ? null : String(b);
  }, a = /* @__PURE__ */ new Map();
  for (const v of i) {
    const b = l(v);
    b != null && a.set(b, v);
  }
  const o = /* @__PURE__ */ new Map(), d = [];
  for (const v of i) {
    const b = l(v), _ = v?.[n], S = _ == null ? null : String(_);
    S == null || S === b || !a.has(S) ? d.push(v) : (o.has(S) || o.set(S, []), o.get(S).push(v));
  }
  const c = t ? new Map(i.map((v) => [l(v), !!t(v)])) : null, h = /* @__PURE__ */ new Map(), u = (v, b) => {
    const _ = l(v);
    if (_ == null) return !1;
    if (h.has(_)) return h.get(_);
    if (b.has(_)) return !1;
    b.add(_);
    let S = !!c.get(_);
    const y = o.get(_) || [];
    for (const x of y) S = u(x, b) || S;
    return b.delete(_), h.set(_, S), S;
  };
  if (c)
    for (const v of d) u(v, /* @__PURE__ */ new Set());
  const p = [], g = /* @__PURE__ */ new Map(), m = (v, b, _, S) => {
    const y = c ? v.filter((x) => S || h.get(l(x))) : v.slice();
    s && y.sort(s);
    for (const x of y) {
      const L = l(x);
      if (L == null || _.has(L)) continue;
      const E = o.get(L) || [], A = S || (c ? !!c.get(L) : !1), V = c ? E.filter((H) => A || h.get(l(H))) : E, B = V.length > 0, z = B && (c ? !0 : !!r(L, b));
      g.set(L, { level: b, hasChildren: B, expanded: z }), p.push(x), z && (_.add(L), m(V, b + 1, _, A), _.delete(L));
    }
  };
  return m(d, 0, /* @__PURE__ */ new Set(), !1), { displayList: p, treeMeta: g };
}
function At(i) {
  if (i.serverSide) {
    const c = i.rowData, h = i.pagination?.pageSize || c.length || 1, u = i.serverRowCount ?? c.length, p = Math.max(1, Math.ceil(u / h)), g = Math.min(i.pagination?.page || 0, p - 1);
    return { filteredSorted: c, rows: c, total: u, totalPages: p, page: g, pageRows: c };
  }
  const n = Object.fromEntries(i.columnDefs.map((c) => [c.field, c])), e = i.columnDefs.filter((c) => !c.hidden && !c._isCheckbox), t = (i.rowGroupCols || []).filter((c) => n[c]);
  if (i.treeData && !i.pivotMode && t.length === 0) {
    const c = i.treeParentField || "parent_id", h = Object.entries(i.filterModel || {}).filter(([, x]) => x != null), u = i.quickFilter ? String(i.quickFilter).toLowerCase() : "", g = h.length > 0 || u !== "" ? (x) => {
      for (const [L, E] of h) {
        const A = n[L];
        if (A && !_e(x, A, E)) return !1;
      }
      if (u) {
        let L = !1;
        for (const E of e) {
          const A = k(x, E);
          if (A && String(A).toLowerCase().includes(u)) {
            L = !0;
            break;
          }
        }
        if (!L) return !1;
      }
      return !0;
    } : null, m = Array.isArray(i.sortModel) ? i.sortModel : [], v = m.length ? (x, L) => {
      for (const { colId: E, sort: A } of m) {
        const V = n[E];
        if (!V) continue;
        const B = T(x, V), z = T(L, V), H = typeof V.comparator == "function" ? V.comparator(B, z, x, L) : F(B, z, V.type);
        if (H !== 0) return A === "desc" ? -H : H;
      }
      return 0;
    } : null, b = i.getRowId || ((x) => x?.id), { displayList: _, treeMeta: S } = Dt({
      rows: i.rowData,
      parentField: c,
      getRowId: b,
      passesFilter: g,
      siblingComparator: v,
      isExpanded: i.isTreeRowExpanded || (() => !0)
    }), y = O(_, i.pagination);
    return {
      tree: !0,
      treeData: !0,
      treeMeta: S,
      treeParentField: c,
      filteredSorted: _,
      ...y
    };
  }
  let s = i.rowData;
  s = ve(s, i.filterModel, n), s = we(s, i.quickFilter, e), s = _t(s, i.sortModel, n);
  const r = t, l = i.pivotMode ? (i.pivotCols || []).filter((c) => n[c]) : [], a = i.pivotMode ? Object.entries(i.aggModel || {}).filter(([c]) => n[c]).map(([c, h]) => ({ col: n[c], aggFunc: h })) : [];
  if (i.pivotMode && l.length && a.length) {
    const c = r.map((b) => n[b]), h = l.map((b) => n[b]), { columns: u, displayList: p, tree: g, combos: m } = xt({
      rows: s,
      rowGroupCols: c,
      pivotCols: h,
      valueConfigs: a,
      isExpanded: i.isGroupExpanded,
      sortModel: i.sortModel
    }), v = O(p, i.pagination);
    return {
      pivot: !0,
      pivotResultColumns: u,
      combos: m,
      grouped: !0,
      tree: g,
      leafCount: s.length,
      grandTotals: W(s, i.aggModel, n),
      filteredSorted: p,
      ...v
    };
  }
  if (r.length) {
    const c = r.map((g) => n[g]), { displayList: h, tree: u } = wt(
      s,
      c,
      n,
      i.aggModel,
      i.isGroupExpanded
    ), p = O(h, i.pagination);
    return {
      grouped: !0,
      tree: u,
      leafCount: s.length,
      grandTotals: W(s, i.aggModel, n),
      filteredSorted: h,
      ...p
    };
  }
  const o = O(s, i.pagination), d = i.aggModel && Object.keys(i.aggModel).length ? W(s, i.aggModel, n) : null;
  return { filteredSorted: s, grandTotals: d, ...o };
}
function Et(i, n, e, t, s = 6) {
  const r = Math.ceil(n / e), l = Math.max(0, Math.floor(i / e) - s), a = Math.min(t, l + r + s * 2);
  return { first: l, last: a };
}
function Tt(i) {
  return {
    // ---- Data ----
    setRowData(n) {
      i.setRowData(n);
    },
    getRowData() {
      return i.state.rowData.slice();
    },
    applyTransaction(n) {
      return i.applyTransaction(n);
    },
    // Server-side row model
    setRowCount(n) {
      i.setRowCount(n);
    },
    getRowCount() {
      return i.state.serverSide ? i.state.serverRowCount : i.state.rowData.length;
    },
    isServerSide() {
      return !!i.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(n) {
      i.setColumnDefs(n);
    },
    getColumnDefs() {
      return i.state.columnDefs.slice();
    },
    setColumnVisible(n, e) {
      i.setColumnVisible(n, e);
    },
    setColumnPinned(n, e) {
      i.setColumnPinned(n, e);
    },
    setColumnWidth(n, e) {
      i.setColumnWidth(n, e);
    },
    moveColumn(n, e) {
      i.moveColumn(n, e);
    },
    autoSizeColumn(n) {
      i.autoSizeColumn(n);
    },
    autoSizeAllColumns() {
      i.state.columnDefs.forEach((n) => i.autoSizeColumn(n.field));
    },
    sizeColumnsToFit() {
      i.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(n) {
      i.setSortModel(n);
    },
    getSortModel() {
      return i.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(n) {
      i.setFilterModel(n);
    },
    getFilterModel() {
      return { ...i.state.filterModel };
    },
    setColumnFilter(n, e) {
      i.setColumnFilter(n, e);
    },
    destroyFilter(n) {
      i.setColumnFilter(n, null);
    },
    setQuickFilter(n) {
      i.setQuickFilter(n);
    },
    getQuickFilter() {
      return i.getQuickFilter();
    },
    // ---- Selection ----
    selectAll() {
      i.selectAll();
    },
    deselectAll() {
      i.deselectAll();
    },
    selectRow(n) {
      i.setSelected(n, !0);
    },
    deselectRow(n) {
      i.setSelected(n, !1);
    },
    getSelectedRows() {
      return i.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(i.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(n) {
      i.goToPage(n);
    },
    paginationGoToFirstPage() {
      i.goToPage(0);
    },
    paginationGoToNextPage() {
      i.goToPage(i.state.pagination.page + 1);
    },
    paginationGoToPreviousPage() {
      i.goToPage(i.state.pagination.page - 1);
    },
    paginationGoToLastPage() {
      i.goToPage(i.lastPageIndex());
    },
    paginationSetPageSize(n) {
      i.setPageSize(n);
    },
    paginationGetCurrentPage() {
      return i.state.pagination.page;
    },
    paginationGetTotalPages() {
      return i.totalPages();
    },
    paginationGetRowCount() {
      return i.filteredCount();
    },
    paginationGetPageSize() {
      return i.state.pagination.pageSize;
    },
    paginationIsEnabled() {
      return i.state.pagination.enabled;
    },
    // ---- Cell selection ----
    getCellSelection() {
      return i.getCellSelectionDetail();
    },
    getCellRangeValues() {
      return i._cellRangeRows();
    },
    getCellSelectionRowIds() {
      return i.getCellSelectionRowIds();
    },
    getRangeAggregates() {
      return i.getRangeAggregates();
    },
    // ---- Editing ----
    startEditingCell({ rowId: n, colId: e }) {
      i.startEditingCell(n, e);
    },
    stopEditing(n = !1) {
      i.stopEditing(n);
    },
    // ---- Row grouping + aggregation ----
    setRowGroupColumns(n) {
      i.setRowGroupColumns(n);
    },
    addRowGroupColumn(n) {
      i.addRowGroupColumn(n);
    },
    removeRowGroupColumn(n) {
      i.removeRowGroupColumn(n);
    },
    getRowGroupColumns() {
      return i.getRowGroupColumns();
    },
    setColumnAggFunc(n, e) {
      i.setColumnAggFunc(n, e);
    },
    expandAll() {
      i.expandAll();
    },
    collapseAll() {
      i.collapseAll();
    },
    toggleGroup(n, e) {
      i.toggleGroup(n, e);
    },
    // ---- Pivot ----
    setPivotMode(n) {
      i.setPivotMode(n);
    },
    isPivotMode() {
      return i.isPivotMode();
    },
    setPivotColumns(n) {
      i.setPivotColumns(n);
    },
    addPivotColumn(n) {
      i.addPivotColumn(n);
    },
    removePivotColumn(n) {
      i.removePivotColumn(n);
    },
    getPivotColumns() {
      return i.getPivotColumns();
    },
    // Synthetic pivot result columns from the most recent render. Each entry
    // is { field, headerName, pivotKeys, valueField, aggFunc } — useful for
    // discovering the field id of a pivot col to feed to setSortModel / for
    // building a custom column visibility UI.
    getPivotResultColumns() {
      return (i._displayList?.pivotResultColumns || []).map((e) => ({
        field: e.field,
        headerName: e.headerName,
        pivotKeys: { ...e.pivotKeys || {} },
        valueField: e.valueField,
        aggFunc: e.aggFunc
      }));
    },
    // ---- Value columns (aggregations; shared with grouping) ----
    setValueColumns(n) {
      i.setValueColumns(n);
    },
    addValueColumn(n, e = "sum") {
      i.addValueColumn(n, e);
    },
    removeValueColumn(n) {
      i.removeValueColumn(n);
    },
    getValueColumns() {
      return i.getValueColumns();
    },
    // ---- Column header groups (multi-row headers) ----
    setColumnGroups(n) {
      i.setColumnGroups(n);
    },
    getColumnGroups() {
      return i.getColumnGroups();
    },
    // ---- Pinned bottom row (sticky grand totals) ----
    setPinnedBottomRow(n) {
      i.setPinnedBottomRow(n);
    },
    isPinnedBottomRow() {
      return i.isPinnedBottomRow();
    },
    // ---- Tree data (self-referential parent_id) ----
    setTreeData(n) {
      i.setTreeData(n);
    },
    isTreeData() {
      return i.isTreeData();
    },
    setTreeParentField(n) {
      i.setTreeParentField(n);
    },
    expandTreeRow(n) {
      i.expandTreeRow(n);
    },
    collapseTreeRow(n) {
      i.collapseTreeRow(n);
    },
    toggleTreeRow(n) {
      i.toggleTreeRow(n);
    },
    expandAllTreeRows() {
      i.expandAllTreeRows();
    },
    collapseAllTreeRows() {
      i.collapseAllTreeRows();
    },
    getTreeExpandedRowIds() {
      return i.getTreeExpandedRowIds();
    },
    // ---- Master/detail ----
    setMasterDetail(n) {
      i.setMasterDetail(n);
    },
    isMasterDetail() {
      return i.isMasterDetail();
    },
    expandDetailRow(n) {
      i.expandDetailRow(n);
    },
    collapseDetailRow(n) {
      i.collapseDetailRow(n);
    },
    toggleDetailRow(n) {
      i.toggleDetailRow(n);
    },
    expandAllDetails() {
      i.expandAllDetails();
    },
    collapseAllDetails() {
      i.collapseAllDetails();
    },
    getDetailExpandedRowIds() {
      return i.getDetailExpandedRowIds();
    },
    // ---- Column state + persistence ----
    getColumnState() {
      return i.getColumnState();
    },
    applyColumnState(n) {
      i.applyColumnState(n);
    },
    clearPersistedState() {
      i.clearPersistedState();
    },
    getPersistKey() {
      return i.persistKeyValue || "";
    },
    // ---- Export ----
    getDataAsCsv(n = {}) {
      return i.getDataAsCsv(n);
    },
    exportDataAsCsv(n = {}) {
      return i.exportDataAsCsv(n);
    },
    // ---- Display ----
    refreshCells(n = {}) {
      i.refresh(n);
    },
    redrawRows(n = {}) {
      i.refresh(n);
    },
    // ---- Events ----
    addEventListener(n, e) {
      i.element.addEventListener(n, e);
    },
    removeEventListener(n, e) {
      i.element.removeEventListener(n, e);
    }
  };
}
function f(i, n = {}, e = []) {
  const t = document.createElement(i);
  for (const [s, r] of Object.entries(n))
    r === !1 || r == null || (s === "class" ? t.className = r : s === "style" && typeof r == "object" ? Object.assign(t.style, r) : s.startsWith("on") && typeof r == "function" ? t.addEventListener(s.slice(2).toLowerCase(), r) : r === !0 ? t.setAttribute(s, "") : t.setAttribute(s, String(r)));
  for (const s of [].concat(e))
    s == null || s === !1 || t.appendChild(typeof s == "string" ? document.createTextNode(s) : s);
  return t;
}
function oe(i, n) {
  for (const [e, t] of Object.entries(n))
    t == null || t === !1 ? i.removeAttribute(e) : t === !0 ? i.setAttribute(e, "") : i.setAttribute(e, String(t));
}
function de(i) {
  const n = document.getElementById(i);
  return !n || n.tagName !== "TEMPLATE" ? null : n.content.firstElementChild.cloneNode(!0);
}
function C(i, n, e) {
  i.dispatchEvent(new CustomEvent(n, { detail: e, bubbles: !0 }));
}
function Vt(i, n, e) {
  let t = i.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(n)) {
      const r = e.getControllerForElementAndIdentifier(t, n);
      if (r) return r;
    }
    t = t.parentElement;
  }
  return null;
}
const se = /* @__PURE__ */ new Map();
function R(i, n) {
  if (typeof i != "string" || !i) throw new Error("registerRenderer: name must be a non-empty string");
  if (typeof n != "function") throw new Error("registerRenderer: fn must be a function");
  se.set(i, n);
}
function Se(i) {
  return se.get(i) || null;
}
function It() {
  return Array.from(se.keys());
}
function w(i, n = {}, e = null) {
  const t = document.createElement(i);
  for (const [s, r] of Object.entries(n))
    r == null || r === !1 || (s === "class" ? t.className = r : t.setAttribute(s, r === !0 ? "" : String(r)));
  return e == null || (Array.isArray(e) ? e.forEach((s) => t.append(s)) : typeof e == "string" ? t.innerHTML = e : t.append(e)), t;
}
const D = (i) => i == null || i === "", kt = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function xe() {
  return ({ value: i }) => {
    if (D(i)) return "";
    const n = String(i);
    return kt.test(n) ? w("a", {
      class: "sg-renderer-link",
      href: `mailto:${n}`,
      title: "Send email"
    }, document.createTextNode(n)) : w("span", { class: "sg-renderer-invalid", title: "Invalid email" }, document.createTextNode(n));
  };
}
function Le({ newTab: i = !0 } = {}) {
  return ({ value: n }) => {
    if (D(n)) return "";
    const e = String(n);
    let t;
    try {
      t = new URL(e);
    } catch {
      return document.createTextNode(e);
    }
    return w("a", {
      class: "sg-renderer-link",
      href: e,
      target: i ? "_blank" : null,
      rel: i ? "noopener noreferrer" : null,
      title: e
    }, document.createTextNode(t.hostname + (t.pathname !== "/" ? t.pathname : "")));
  };
}
function Re({ defaultRegion: i = "AU" } = {}) {
  return ({ value: n }) => {
    if (D(n)) return "";
    const e = String(n).trim(), t = e.replace(/\D/g, "");
    if (!t) return document.createTextNode(e);
    let s = e;
    return i === "AU" && (/^04\d{8}$/.test(t) ? s = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : /^0[2378]\d{8}$/.test(t) ? s = `(${t.slice(0, 2)}) ${t.slice(2, 6)} ${t.slice(6)}` : /^1[38]00\d{6}$/.test(t) ? s = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : t.length === 8 && (s = `${t.slice(0, 4)} ${t.slice(4)}`)), w("a", { class: "sg-renderer-link", href: `tel:${t}` }, document.createTextNode(s));
  };
}
function Me({ currency: i = "USD", locale: n = "en-US", decimals: e } = {}) {
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-number"), D(t)) return "";
    const r = Number(t);
    if (!Number.isFinite(r)) return String(t);
    const l = { style: "currency", currency: i };
    return e != null && (l.minimumFractionDigits = e, l.maximumFractionDigits = e), r.toLocaleString(n, l);
  };
}
function De({ decimals: i = 0, scale: n = "as-is" } = {}) {
  return ({ value: e, td: t }) => {
    if (t && t.classList.add("sg-renderer-number"), D(e)) return "";
    let s = Number(e);
    return Number.isFinite(s) ? (n === "fraction" && (s *= 100), `${s.toFixed(i)}%`) : String(e);
  };
}
function ie(i) {
  if (i == null || i === "") return null;
  if (i instanceof Date) return Number.isNaN(i.valueOf()) ? null : i;
  const n = new Date(i);
  return Number.isNaN(n.valueOf()) ? null : n;
}
function Ae({ locale: i = void 0, dateStyle: n = "medium", ...e } = {}) {
  const t = new Intl.DateTimeFormat(i, { dateStyle: n, ...e });
  return ({ value: s }) => {
    const r = ie(s);
    return r ? t.format(r) : "";
  };
}
function Ee({ locale: i = void 0, dateStyle: n = "medium", timeStyle: e = "short", ...t } = {}) {
  const s = new Intl.DateTimeFormat(i, { dateStyle: n, timeStyle: e, ...t });
  return ({ value: r }) => {
    const l = ie(r);
    return l ? s.format(l) : "";
  };
}
const J = [
  { unit: "second", ms: 1e3, cutoff: 60 * 1e3 },
  { unit: "minute", ms: 60 * 1e3, cutoff: 3600 * 1e3 },
  { unit: "hour", ms: 3600 * 1e3, cutoff: 1440 * 60 * 1e3 },
  { unit: "day", ms: 1440 * 60 * 1e3, cutoff: 10080 * 60 * 1e3 },
  { unit: "week", ms: 10080 * 60 * 1e3, cutoff: 720 * 60 * 60 * 1e3 },
  { unit: "month", ms: 720 * 60 * 60 * 1e3, cutoff: 365 * 24 * 60 * 60 * 1e3 },
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1e3, cutoff: 1 / 0 }
];
function Te({ locale: i = void 0, numeric: n = "auto", style: e = "long" } = {}) {
  const t = new Intl.RelativeTimeFormat(i, { numeric: n, style: e });
  return ({ value: s }) => {
    const r = ie(s);
    if (!r) return "";
    const l = r.getTime() - Date.now(), a = Math.abs(l), o = J.find((h) => a < h.cutoff) || J[J.length - 1], d = Math.round(l / o.ms), c = w("span", { class: "sg-renderer-relative-time", title: r.toLocaleString() });
    return c.textContent = t.format(d, o.unit), c;
  };
}
const Nt = { ms: 1, sec: 1e3, second: 1e3, min: 6e4, minute: 6e4, hr: 36e5, hour: 36e5 };
function Ve({ unit: i = "ms", style: n = "compact" } = {}) {
  const e = Nt[i] ?? 1;
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-number"), D(t)) return "";
    const r = Number(t) * e;
    if (!Number.isFinite(r)) return String(t);
    const l = r < 0 ? "-" : "", a = Math.abs(r), o = Math.floor(a / 36e5), d = Math.floor(a % 36e5 / 6e4), c = Math.floor(a % 6e4 / 1e3);
    if (n === "clock") {
      const u = (p) => String(p).padStart(2, "0");
      return l + (o > 0 ? `${u(o)}:${u(d)}:${u(c)}` : `${u(d)}:${u(c)}`);
    }
    if (n === "words") {
      const u = [];
      return o && u.push(`${o} ${o === 1 ? "hour" : "hours"}`), d && u.push(`${d} ${d === 1 ? "minute" : "minutes"}`), !o && c && u.push(`${c} ${c === 1 ? "second" : "seconds"}`), l + (u.join(" ") || "0 seconds");
    }
    const h = [];
    return o && h.push(`${o}h`), d && h.push(`${d}m`), !o && c && h.push(`${c}s`), l + (h.join(" ") || "0s");
  };
}
function Ie({ locale: i = void 0, decimals: n, ...e } = {}) {
  const t = { ...e };
  n != null && (t.minimumFractionDigits = n, t.maximumFractionDigits = n);
  const s = new Intl.NumberFormat(i, t);
  return ({ value: r, td: l }) => {
    if (l && l.classList.add("sg-renderer-number"), D(r)) return "";
    const a = Number(r);
    return Number.isFinite(a) ? s.format(a) : String(r);
  };
}
function ke({ locale: i = void 0, compactDisplay: n = "short", maximumFractionDigits: e = 1 } = {}) {
  const t = new Intl.NumberFormat(i, {
    notation: "compact",
    compactDisplay: n,
    maximumFractionDigits: e
  });
  return ({ value: s, td: r }) => {
    if (r && r.classList.add("sg-renderer-number"), D(s)) return "";
    const l = Number(s);
    return Number.isFinite(l) ? t.format(l) : String(s);
  };
}
function Ne({ binary: i = !0, decimals: n = 1, locale: e = void 0 } = {}) {
  const t = i ? 1024 : 1e3, s = i ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"], r = new Intl.NumberFormat(e, {
    minimumFractionDigits: n,
    maximumFractionDigits: n
  });
  return ({ value: l, td: a }) => {
    if (a && a.classList.add("sg-renderer-number"), D(l)) return "";
    let o = Number(l);
    if (!Number.isFinite(o)) return String(l);
    const d = o < 0 ? "-" : "";
    o = Math.abs(o);
    let c = 0;
    for (; o >= t && c < s.length - 1; )
      o /= t, c += 1;
    const h = c === 0 ? String(Math.round(o)) : r.format(o);
    return `${d}${h} ${s[c]}`;
  };
}
const Ft = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on"]);
function Pt(i) {
  return i === !0 || i === 1 ? !0 : i == null || i === "" || i === !1 || i === 0 ? !1 : Ft.has(String(i).toLowerCase());
}
const Bt = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>', $t = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
function Fe({
  truthy: i = Pt,
  nullLabel: n = "—",
  falseStyle: e = "icon"
  // 'icon' | 'hidden'
} = {}) {
  return ({ value: t }) => {
    if (t == null || t === "")
      return w("span", { class: "sg-renderer-bool-null" }, document.createTextNode(n));
    if (i(t)) {
      const r = w("span", { class: "sg-renderer-bool is-true", "aria-label": "true" });
      return r.innerHTML = Bt, r;
    }
    if (e === "hidden") return "";
    const s = w("span", { class: "sg-renderer-bool is-false", "aria-label": "false" });
    return s.innerHTML = $t, s;
  };
}
const zt = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>', Ht = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.7 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>', Gt = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M64 256a32 32 0 1 0 0-64H384V160c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9S384 364.9 384 352V320H64z"/></svg>';
function Pe({
  style: i = "percent",
  // 'percent' | 'number' | 'currency'
  decimals: n = 1,
  locale: e = void 0,
  currency: t = "USD",
  inverted: s = !1,
  showSign: r = !0
} = {}) {
  let l;
  return i === "currency" ? l = new Intl.NumberFormat(e, {
    style: "currency",
    currency: t,
    minimumFractionDigits: n,
    maximumFractionDigits: n,
    signDisplay: r ? "always" : "auto"
  }) : l = new Intl.NumberFormat(e, {
    minimumFractionDigits: n,
    maximumFractionDigits: n,
    signDisplay: r ? "always" : "auto"
  }), ({ value: a, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), D(a)) return "";
    const d = Number(a);
    if (!Number.isFinite(d)) return String(a);
    let c = "is-flat", h = Gt;
    const u = !s;
    d > 0 ? (c = u ? "is-up" : "is-down", h = zt) : d < 0 && (c = u ? "is-down" : "is-up", h = Ht);
    const p = w("span", { class: `sg-renderer-delta ${c}` }), g = w("span", { class: "sg-renderer-delta-icon", "aria-hidden": "true" });
    g.innerHTML = h;
    const m = i === "percent" ? `${l.format(d)}%` : l.format(d);
    return p.append(g), p.append(w("span", { class: "sg-renderer-delta-value" }, document.createTextNode(m))), p;
  };
}
function Be({ chars: i = null } = {}) {
  return ({ value: n, td: e }) => {
    if (D(n)) return "";
    const t = String(n);
    let s = t, r = !1;
    return i && t.length > i && (s = t.slice(0, i) + "…", r = !0), e && (e.classList.add("sg-renderer-truncate"), e.setAttribute("title", t)), r ? s : t;
  };
}
const ce = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>', Ot = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';
function $e({ position: i = "after" } = {}) {
  return ({ value: n }) => {
    if (D(n)) return "";
    const e = String(n), t = w("span", { class: "sg-renderer-copyable" }), s = w("span", { class: "sg-renderer-copyable-value" }, document.createTextNode(e)), r = w("button", {
      type: "button",
      class: "sg-renderer-copyable-btn",
      title: "Copy",
      "aria-label": `Copy ${e}`
    });
    return r.innerHTML = ce, r.addEventListener("click", async (l) => {
      l.stopPropagation(), l.preventDefault();
      try {
        navigator.clipboard?.writeText ? await navigator.clipboard.writeText(e) : Kt(e), r.innerHTML = Ot, r.classList.add("is-copied"), setTimeout(() => {
          r.innerHTML = ce, r.classList.remove("is-copied");
        }, 1200);
      } catch {
      }
    }), i === "before" ? t.append(r, s) : t.append(s, r), t;
  };
}
function Kt(i) {
  const n = document.createElement("textarea");
  n.value = i, n.style.position = "fixed", n.style.left = "-9999px", document.body.appendChild(n), n.select();
  try {
    document.execCommand("copy");
  } catch {
  }
  document.body.removeChild(n);
}
function ze({
  size: i = 36,
  rounded: n = "sm",
  // 'sm' = 4px, 'lg' = 8px, 'full' = circle, 'none'
  altField: e = "alt",
  clickToZoom: t = !1
} = {}) {
  const s = n === "full" ? "999px" : n === "lg" ? "8px" : n === "none" ? "0" : "4px";
  return ({ value: r, row: l }) => {
    if (D(r)) return "";
    const a = String(r), o = l?.[e] ?? "", d = w("img", {
      src: a,
      alt: o,
      class: "sg-renderer-image",
      width: String(i),
      height: String(i),
      style: `border-radius: ${s};`,
      loading: "lazy",
      decoding: "async"
    });
    return t && (d.style.cursor = "zoom-in", d.addEventListener("click", (c) => {
      c.stopPropagation(), qt(a, o);
    })), d;
  };
}
function qt(i, n) {
  const e = w("div", { class: "sg-image-zoom" }), t = () => {
    e.remove(), document.removeEventListener("keydown", s);
  }, s = (r) => {
    r.key === "Escape" && t();
  };
  e.addEventListener("click", t), document.addEventListener("keydown", s), e.append(w("img", { src: i, alt: n || "", class: "sg-image-zoom-img" })), document.body.appendChild(e);
}
function He({
  showLabel: i = !0,
  label: n = "value",
  // 'value' | 'name' | (value, row) => string
  shape: e = "circle",
  // 'circle' | 'square'
  size: t = 14
} = {}) {
  return ({ value: s, row: r }) => {
    if (D(s)) return "";
    const l = String(s).trim(), a = w("span", { class: "sg-renderer-swatch" }), o = w("span", {
      class: `sg-renderer-swatch-chip is-${e}`,
      style: `width: ${t}px; height: ${t}px; background: ${l};`,
      "aria-hidden": "true"
    });
    if (a.append(o), i) {
      const d = typeof n == "function" ? n(s, r) : n === "name" ? r?.name ?? l : l;
      a.append(w("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(d)));
    }
    return a;
  };
}
const jt = {
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  orange: "#f97316",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#6b7280"
};
function Ge({
  type: i = "line",
  // 'line' | 'area' | 'bar'
  width: n = 80,
  height: e = 24,
  color: t = "blue",
  // palette key OR raw CSS colour
  baseline: s = null,
  // null = auto-min, 0 = lock min at zero, N = lock at N
  showLast: r = !0
  // small dot on the last point (line / area only)
} = {}) {
  const l = jt[t] || t;
  return ({ value: a }) => {
    if (!Array.isArray(a) || a.length === 0) return "";
    const o = a.map(Number).filter((S) => Number.isFinite(S));
    if (o.length === 0) return "";
    const d = s ?? Math.min(...o), h = Math.max(...o, s ?? -1 / 0) - d || 1, u = 1.5, p = 2.5, g = n - u * 2, m = e - p * 2, v = (S) => u + (o.length === 1 ? g / 2 : S / (o.length - 1) * g), b = (S) => p + m - (S - d) / h * m;
    let _ = "";
    if (i === "bar") {
      const y = Math.max(1, (g - (o.length - 1) * 1) / o.length);
      for (let x = 0; x < o.length; x++) {
        const L = o[x], E = u + x * (y + 1), A = b(L), V = p + m - A;
        _ += `<rect x="${E.toFixed(2)}" y="${A.toFixed(2)}" width="${y.toFixed(2)}" height="${V.toFixed(2)}" fill="${l}"/>`;
      }
    } else {
      let S = "";
      for (let y = 0; y < o.length; y++)
        S += `${y === 0 ? "M" : "L"} ${v(y).toFixed(2)} ${b(o[y]).toFixed(2)} `;
      if (i === "area") {
        const y = S + ` L ${v(o.length - 1).toFixed(2)} ${(p + m).toFixed(2)} L ${v(0).toFixed(2)} ${(p + m).toFixed(2)} Z`;
        _ += `<path d="${y}" fill="${l}" fill-opacity="0.18" stroke="none"/>`;
      }
      if (_ += `<path d="${S.trim()}" fill="none" stroke="${l}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`, r) {
        const y = v(o.length - 1), x = b(o[o.length - 1]);
        _ += `<circle cx="${y.toFixed(2)}" cy="${x.toFixed(2)}" r="1.8" fill="${l}"/>`;
      }
    }
    return `<svg class="sg-renderer-sparkline is-${i}" viewBox="0 0 ${n} ${e}" width="${n}" height="${e}" preserveAspectRatio="none" aria-hidden="true">` + _ + "</svg>";
  };
}
function Wt(i) {
  if (typeof i != "string") return null;
  let n = i.trim().replace(/^#/, "");
  return n.length === 3 && (n = n.split("").map((e) => e + e).join("")), /^[0-9a-f]{6}$/i.test(n) ? [parseInt(n.slice(0, 2), 16), parseInt(n.slice(2, 4), 16), parseInt(n.slice(4, 6), 16)] : null;
}
function Ut(i, n, e) {
  const t = (s) => Math.max(0, Math.min(255, Math.round(s))).toString(16).padStart(2, "0");
  return `#${t(i)}${t(n)}${t(e)}`;
}
function Xt(i, n, e) {
  return [i[0] + (n[0] - i[0]) * e, i[1] + (n[1] - i[1]) * e, i[2] + (n[2] - i[2]) * e];
}
function Yt([i, n, e]) {
  return 0.299 * i + 0.587 * n + 0.114 * e >= 145;
}
function Oe({
  min: i = 0,
  max: n = 100,
  colors: e = ["#dcfce7", "#fef3c7", "#fecaca"],
  inverted: t = !1,
  showValue: s = !0,
  format: r = null
  // (value) => string for custom labels
} = {}) {
  const l = e.map(Wt).filter(Boolean);
  if (l.length < 2) throw new Error("heatmap: need at least two valid hex colours");
  return ({ value: a, td: o }) => {
    if (o && o.classList.add("sg-renderer-heatmap"), D(a)) return "";
    let d = Number(a);
    if (!Number.isFinite(d)) return String(a);
    let c = n - i === 0 ? 0.5 : (d - i) / (n - i);
    c = Math.max(0, Math.min(1, c)), t && (c = 1 - c);
    const h = c * (l.length - 1), u = Math.min(l.length - 2, Math.floor(h)), p = h - u, g = Xt(l[u], l[u + 1], p);
    return o && (o.style.backgroundColor = Ut(...g), o.style.color = Yt(g) ? "#111827" : "#ffffff"), s ? typeof r == "function" ? r(a) : String(a) : "";
  };
}
const Zt = {
  // Credit card: 16 digits grouped 4-4-4-4, last 4 visible. Handles 13-19
  // digit lengths gracefully (Amex 15, others 16). Non-digits are stripped.
  "cc-last4": (i, n) => ue(i.replace(/\D/g, ""), 4, 4, n, " "),
  // BIN + last4: show the first 6 + last 4, mask the middle (PCI-friendly).
  "cc-bin-last4": (i, n) => ue(i.replace(/\D/g, ""), 4, 4, n, " ", 6),
  // Phone: show the last 4 digits, mask the rest as a single bullet
  // block ("•••••• 1234"). Sidesteps the country-specific 3-3-4 / 4-3-3
  // grouping ambiguity — register your own variant if you need a
  // region-specific layout.
  "phone-last4": (i, n) => {
    const e = i.replace(/\D/g, "");
    return e ? e.length <= 4 ? e : n.repeat(e.length - 4) + " " + e.slice(-4) : i;
  },
  // Email: show first char + domain ("a••••@example.com").
  email: (i, n) => {
    const e = String(i).match(/^([^@\s]+)(@.+)$/);
    return e ? e[1][0] + n.repeat(Math.max(1, e[1].length - 1)) + e[2] : i;
  },
  // SSN / ABN-style: show last 4.
  last4: (i, n) => Qt(i, 4, n)
};
function Qt(i, n, e) {
  const t = String(i);
  return t.length <= n ? t : e.repeat(t.length - n) + t.slice(-n);
}
function ue(i, n, e, t, s, r = 0) {
  if (!i) return "";
  const l = i.length, a = i.split("").map((d, c) => c < r || c >= l - e ? d : t).join(""), o = [];
  for (let d = a.length; d > 0; d -= n)
    o.unshift(a.slice(Math.max(0, d - n), d));
  return o.join(s);
}
const Jt = /* @__PURE__ */ new Set(["cc-last4", "cc-bin-last4", "phone-last4", "last4"]);
function Ke({
  format: i = null,
  showFirst: n = 0,
  showLast: e = 4,
  char: t = "•",
  align: s = null
  // 'left' | 'right' | null (auto)
} = {}) {
  const r = i ? Zt[i] : null, l = i ? Jt.has(i) : !1, a = s === "right" || s !== "left" && l;
  return ({ value: o, td: d }) => {
    if (d && a && d.classList.add("sg-renderer-mask-numeric"), D(o)) return "";
    const c = String(o);
    if (r) return r(c, t);
    const h = c.slice(0, n), u = e > 0 ? c.slice(-e) : "", p = Math.max(0, c.length - n - e);
    return h + t.repeat(p) + u;
  };
}
function qe({
  query: i = null,
  caseSensitive: n = !1,
  className: e = "sg-renderer-mark"
} = {}) {
  return ({ value: t, api: s }) => {
    if (D(t)) return "";
    const r = String(t), l = i != null ? String(i) : s?.getQuickFilter?.() || "";
    return l ? es(r, l, n, e) : document.createTextNode(r);
  };
}
function es(i, n, e, t) {
  const s = e ? i : i.toLowerCase(), r = e ? n : n.toLowerCase(), l = document.createElement("span");
  let a = 0;
  for (; a < i.length; ) {
    const o = s.indexOf(r, a);
    if (o === -1) {
      l.appendChild(document.createTextNode(i.slice(a)));
      break;
    }
    o > a && l.appendChild(document.createTextNode(i.slice(a, o)));
    const d = document.createElement("mark");
    d.className = t, d.textContent = i.slice(o, o + n.length), l.appendChild(d), a = o + n.length;
  }
  return l;
}
function je({ lines: i = null, separator: n = `
` } = {}) {
  return ({ value: e, td: t }) => {
    if (D(e)) return "";
    const s = String(e), r = n === `
` ? s : s.split(n).join(`
`);
    if (t) {
      t.classList.add("sg-renderer-multiline"), t.setAttribute("title", r);
      const l = t.parentElement;
      l && l.tagName === "TR" && l.classList.add("sg-has-multiline");
    }
    if (i != null && i > 0) {
      const l = document.createElement("div");
      return l.className = "sg-renderer-multiline-clamp", l.style.setProperty("--sg-clamp", String(i)), l.textContent = r, l;
    }
    return r;
  };
}
function ne(i) {
  if (i == null || !Number.isFinite(Number(i))) return "";
  let n = Number(i);
  if (n < 1024) return `${n} B`;
  const e = ["KB", "MB", "GB", "TB"];
  let t = -1;
  do
    n /= 1024, t++;
  while (n >= 1024 && t < e.length - 1);
  return `${n.toFixed(n < 10 ? 1 : 0)} ${e[t]}`;
}
const ts = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "ico"]);
function N(i) {
  if (!i) return !1;
  if (typeof i.content_type == "string" && i.content_type.startsWith("image/")) return !0;
  const n = String(i.filename || "").split(".").pop()?.toLowerCase();
  return n ? ts.has(n) : !1;
}
const Y = {
  pdf: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM88 304h32c30.9 0 56 25.1 56 56s-25.1 56-56 56h-16v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V320c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24h-16v48h16zm72-64c0-8.8 7.2-16 16-16h24c26.5 0 48 21.5 48 48v48c0 26.5-21.5 48-48 48H208c-8.8 0-16-7.2-16-16V320zm32 16v80h8c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16h-8z"/></svg>',
  doc: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM104 280c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24zm0 80c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24z"/></svg>',
  sheet: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zm192 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16v128c0 8.8-7.2 16-16 16H112c-8.8 0-16-7.2-16-16V272c0-8.8 7.2-16 16-16zm16 32v32h48V288H128zm80 0v32h48V288H208zm-80 64v32h48V352H128zm80 0v32h48V352H208z"/></svg>',
  zip: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H160V64H224V0H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM160 64v32h64V64H160zm0 96v32h64V160H160zm0 96v32h64V256H160zm0 96c-17.7 0-32 14.3-32 32v48c0 8.8 7.2 16 16 16h96c8.8 0 16-7.2 16-16V384c0-17.7-14.3-32-32-32H160z"/></svg>',
  audio: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM160 288c-8.8 0-16 7.2-16 16v89c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V362.5l64-21.3V388c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V304c0-5.1-2.5-10-6.6-13s-9.5-3.9-14.5-2.3L160 309.8V304c0-8.8-7.2-16-16-16z"/></svg>',
  video: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM64 288c0-17.7 14.3-32 32-32H224c17.7 0 32 14.3 32 32V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V288zm259.7-11.3c5.2 2.7 8.3 8 8.3 13.8v123c0 5.8-3.2 11.2-8.3 13.8s-11.3 2.3-16.1-.9L256 392.7V312l51.5-32.6c4.9-3.1 11-3.4 16.1-.8z"/></svg>',
  code: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM200.4 281.7c5.8 6.7 5.2 16.8-1.5 22.6L165.5 333l33.4 28.7c6.7 5.8 7.4 15.9 1.6 22.6s-15.9 7.4-22.6 1.6l-48-41.2c-3.5-3-5.5-7.4-5.5-12s2-9 5.5-12l48-41.2c6.7-5.8 16.8-5.2 22.6 1.5zM226 281.7c5.8-6.7 15.9-7.4 22.6-1.5l48 41.2c3.5 3 5.5 7.4 5.5 12s-2 9-5.5 12l-48 41.2c-6.7 5.8-16.8 5.2-22.6-1.6s-5.2-16.8 1.5-22.6L260.5 333 227.5 304.4c-6.7-5.8-7.4-15.9-1.5-22.6z"/></svg>',
  file: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0z"/></svg>'
}, We = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>', Ue = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>', ss = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>', is = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 105.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>', ns = /* @__PURE__ */ new Set(["mp3", "wav", "flac", "m4a", "ogg", "aac", "opus"]), rs = /* @__PURE__ */ new Set(["mp4", "mov", "webm", "mkv", "avi", "m4v"]);
function Xe(i) {
  const n = String(i?.content_type || "").toLowerCase(), e = String(i?.filename || "").split(".").pop()?.toLowerCase() || "";
  return n.includes("pdf") || e === "pdf" ? "pdf" : n.startsWith("audio/") || ns.has(e) ? "audio" : n.startsWith("video/") || rs.has(e) ? "video" : n.includes("zip") || ["zip", "tar", "gz", "7z", "rar"].includes(e) ? "zip" : n.includes("sheet") || n.includes("excel") || n.includes("csv") || ["xls", "xlsx", "csv", "numbers"].includes(e) ? "sheet" : n.includes("word") || n.includes("document") || ["doc", "docx", "txt", "md", "rtf"].includes(e) ? "doc" : ["js", "ts", "rb", "py", "go", "rs", "java", "json", "xml", "html", "css", "sh", "sql"].includes(e) ? "code" : "file";
}
function Q(i) {
  if (i == null || i === "") return [];
  let n = i;
  if (typeof n == "string")
    try {
      n = JSON.parse(n);
    } catch {
      return [];
    }
  return Array.isArray(n) || (n = [n]), n.filter((e) => e && (e.url || e.signed_id)).map((e, t) => ({
    id: e.id != null ? String(e.id) : `att_${t}`,
    filename: e.filename || e.name || `attachment-${t + 1}`,
    url: e.url || "#",
    content_type: e.content_type || e.contentType || e.mime_type || "",
    byte_size: e.byte_size ?? e.byteSize ?? e.size ?? null,
    preview_url: e.preview_url || e.previewUrl || (N(e) ? e.url : null),
    thumb_url: e.thumb_url || e.thumbUrl || (N(e) ? e.url : null),
    signed_id: e.signed_id || e.signedId || null
  }));
}
function Ye({
  thumbSize: i = 28,
  maxThumbs: n = 4,
  empty: e = "",
  editable: t = !1,
  accept: s = null,
  multiple: r = !0,
  download: l = !1,
  onUpload: a = null,
  onRemove: o = null
} = {}) {
  return (d) => {
    const { value: c, td: h, row: u, col: p } = d, g = Q(c);
    if (h && (h.classList.add("sg-renderer-attachments-cell"), h.dataset.attachmentCount = String(g.length), h._sgAttachments = g), g.length === 0 && !t)
      return e ? document.createTextNode(e) : "";
    const m = w("div", { class: "sg-renderer-attachments", role: "group" }), v = g.slice(0, n), b = Math.max(0, g.length - v.length);
    if (v.forEach((_) => m.append(ls(_, i, g, l))), b > 0) {
      const _ = w(
        "span",
        { class: "sg-attach-more", title: `${b} more` },
        document.createTextNode(`+${b}`)
      );
      _.addEventListener("click", (S) => {
        S.stopPropagation(), Ze(g, g[v.length]);
      }), m.append(_);
    }
    if (t) {
      const _ = w("button", {
        type: "button",
        class: "sg-attach-add",
        title: "Add files",
        "aria-label": "Add attachments",
        "data-sg-attach": "add"
      });
      _.innerHTML = We, _.addEventListener("click", (S) => {
        S.stopPropagation(), he(h, d, { thumbSize: i, accept: s, multiple: r, onUpload: a, onRemove: o });
      }), m.append(_), as(h, d, { onUpload: a }), h.addEventListener("dblclick", (S) => {
        S._sgAttachmentHandled || (S._sgAttachmentHandled = !0, S.stopPropagation(), he(h, d, { thumbSize: i, accept: s, multiple: r, onUpload: a, onRemove: o }));
      }, { once: !1 });
    }
    return m;
  };
}
function ls(i, n, e, t) {
  const s = w("button", {
    type: "button",
    class: "sg-attach-thumb",
    title: `${i.filename}${i.byte_size != null ? " · " + ne(i.byte_size) : ""}`,
    "data-attachment-id": i.id,
    "data-attachment-kind": N(i) ? "image" : "file",
    "aria-label": i.filename,
    style: `width: ${n}px; height: ${n}px;`
  });
  if (N(i) && i.thumb_url)
    s.append(w("img", {
      src: i.thumb_url,
      alt: i.filename,
      loading: "lazy",
      decoding: "async",
      width: String(n),
      height: String(n)
    }));
  else {
    const r = Xe(i), l = w("span", { class: `sg-attach-icon is-${r}`, "aria-hidden": "true" });
    l.innerHTML = Y[r] || Y.file, s.append(l);
  }
  return s.addEventListener("click", (r) => {
    if (r.stopPropagation(), N(i)) {
      const l = e.filter(N);
      Ze(l.length ? l : [i], i);
    } else if (t) {
      const l = document.createElement("a");
      l.href = i.url, l.download = i.filename, document.body.appendChild(l), l.click(), l.remove();
    } else
      window.open(i.url, "_blank", "noopener,noreferrer");
  }), s;
}
let G = null;
function Ze(i, n) {
  ee();
  const e = i.filter(N);
  if (e.length === 0) return;
  let t = Math.max(0, e.findIndex((p) => p.id === n?.id));
  t < 0 && (t = 0);
  const s = w("div", { class: "sg-image-zoom sg-attach-lightbox", role: "dialog", "aria-modal": "true" }), r = w("div", { class: "sg-attach-lightbox-stage" }), l = w("img", { class: "sg-image-zoom-img", alt: "" }), a = w("div", { class: "sg-attach-lightbox-caption" }), o = w("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-prev",
    "aria-label": "Previous attachment"
  }), d = w("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-next",
    "aria-label": "Next attachment"
  });
  o.innerHTML = ss, d.innerHTML = is;
  function c() {
    const p = e[t];
    l.src = p.preview_url || p.url, l.alt = p.filename, a.textContent = `${p.filename}${p.byte_size != null ? " · " + ne(p.byte_size) : ""} (${t + 1}/${e.length})`, o.style.visibility = e.length > 1 ? "visible" : "hidden", d.style.visibility = e.length > 1 ? "visible" : "hidden";
  }
  function h(p) {
    t = (t + p + e.length) % e.length, c();
  }
  function u(p) {
    p.key === "Escape" ? ee() : p.key === "ArrowLeft" ? h(-1) : p.key === "ArrowRight" && h(1);
  }
  s.addEventListener("click", (p) => {
    (p.target === s || p.target === r) && ee();
  }), o.addEventListener("click", (p) => {
    p.stopPropagation(), h(-1);
  }), d.addEventListener("click", (p) => {
    p.stopPropagation(), h(1);
  }), document.addEventListener("keydown", u), r.append(o, l, d), s.append(r, a), document.body.appendChild(s), G = { overlay: s, onKey: u }, c();
}
function ee() {
  G && (document.removeEventListener("keydown", G.onKey), G.overlay.remove(), G = null);
}
let U = null;
function as(i, n, { onUpload: e }) {
  i._sgAttachDropBound || (i._sgAttachDropBound = !0, i.addEventListener("dragover", (t) => {
    t.dataTransfer?.types?.includes("Files") && (t.preventDefault(), i.classList.add("is-drop-target"));
  }), i.addEventListener("dragleave", () => i.classList.remove("is-drop-target")), i.addEventListener("drop", async (t) => {
    if (!t.dataTransfer?.files?.length) return;
    t.preventDefault(), i.classList.remove("is-drop-target");
    const s = Array.from(t.dataTransfer.files);
    await X(i, n, s, e);
  }));
}
function he(i, n, e) {
  K();
  const { thumbSize: t, accept: s, multiple: r, onUpload: l, onRemove: a } = e, o = i._sgAttachments || Q(n.value), d = w("div", { class: "sg-attach-editor", role: "dialog", "aria-modal": "false" });
  d.addEventListener("mousedown", (_) => _.stopPropagation());
  const c = w("div", { class: "sg-attach-editor-header" }, [
    w(
      "span",
      { class: "sg-attach-editor-title" },
      document.createTextNode(o.length === 1 ? "1 attachment" : `${o.length} attachments`)
    ),
    (() => {
      const _ = w("button", {
        type: "button",
        class: "sg-attach-editor-close",
        "aria-label": "Close"
      });
      return _.innerHTML = Ue, _.addEventListener("click", K), _;
    })()
  ]), h = w("div", { class: "sg-attach-editor-grid" });
  function u() {
    const _ = i._sgAttachments || [];
    h.replaceChildren(), _.forEach((S) => h.append(os(S, i, n, a, t))), c.firstChild.textContent = _.length === 1 ? "1 attachment" : `${_.length} attachments`;
  }
  u(), i._sgAttachRepaint = u;
  const p = w("label", { class: "sg-attach-dropzone", tabindex: "0" });
  p.innerHTML = `
    <span class="sg-attach-dropzone-icon" aria-hidden="true">${We}</span>
    <span class="sg-attach-dropzone-text">Drop files, paste, or <strong>browse</strong></span>
  `;
  const g = w("input", { type: "file", multiple: r ? "" : null, accept: s || null });
  g.style.display = "none", p.append(g), g.addEventListener("change", async () => {
    g.files?.length && (await X(i, n, Array.from(g.files), l), g.value = "", u());
  }), p.addEventListener("dragover", (_) => {
    _.dataTransfer?.types?.includes("Files") && (_.preventDefault(), p.classList.add("is-drop-target"));
  }), p.addEventListener("dragleave", () => p.classList.remove("is-drop-target")), p.addEventListener("drop", async (_) => {
    _.dataTransfer?.files?.length && (_.preventDefault(), p.classList.remove("is-drop-target"), await X(i, n, Array.from(_.dataTransfer.files), l), u());
  });
  function m(_) {
    const S = Array.from(_.clipboardData?.files || []);
    S.length !== 0 && (_.preventDefault(), X(i, n, S, l).then(u));
  }
  d.addEventListener("paste", m);
  function v(_) {
    _.key === "Escape" && K();
  }
  function b(_) {
    !d.contains(_.target) && !i.contains(_.target) && K();
  }
  document.addEventListener("keydown", v), setTimeout(() => document.addEventListener("mousedown", b), 0), d.append(c, h, p), document.body.appendChild(d), ds(d, i), p.focus(), U = { pop: d, onKey: v, onDocClick: b, anchor: i };
}
function K() {
  if (!U) return;
  const { pop: i, onKey: n, onDocClick: e, anchor: t } = U;
  document.removeEventListener("keydown", n), document.removeEventListener("mousedown", e), i.remove(), t && delete t._sgAttachRepaint, U = null;
}
function os(i, n, e, t, s) {
  const r = w("div", { class: "sg-attach-editor-tile", "data-attachment-id": i.id }), l = w("div", {
    class: "sg-attach-editor-preview",
    style: `width: ${s * 2}px; height: ${s * 2}px;`
  });
  if (N(i) && i.thumb_url)
    l.append(w("img", {
      src: i.thumb_url,
      alt: i.filename,
      width: String(s * 2),
      height: String(s * 2)
    }));
  else {
    const d = Xe(i), c = w("span", { class: `sg-attach-icon is-${d}`, "aria-hidden": "true" });
    c.innerHTML = Y[d] || Y.file, l.append(c);
  }
  const a = w("div", { class: "sg-attach-editor-meta" }, [
    w(
      "div",
      { class: "sg-attach-editor-name", title: i.filename },
      document.createTextNode(i.filename)
    ),
    w(
      "div",
      { class: "sg-attach-editor-size" },
      document.createTextNode(i.byte_size != null ? ne(i.byte_size) : "")
    )
  ]), o = w("button", {
    type: "button",
    class: "sg-attach-editor-remove",
    title: "Remove",
    "aria-label": `Remove ${i.filename}`,
    "data-sg-attach": "remove",
    "data-attachment-id": i.id
  });
  return o.innerHTML = Ue, o.addEventListener("click", async (d) => {
    d.stopPropagation(), await cs(n, e, i, t);
  }), r.append(l, a, o), r;
}
function ds(i, n) {
  const e = n.getBoundingClientRect();
  i.style.position = "fixed", i.style.left = `${Math.max(8, Math.min(window.innerWidth - 360, e.left))}px`, window.innerHeight - e.bottom > 280 ? i.style.top = `${e.bottom + 4}px` : i.style.top = `${Math.max(8, e.top - i.offsetHeight - 4)}px`;
}
async function X(i, n, e, t) {
  if (e.length) {
    i.classList.add("is-uploading");
    try {
      let s;
      if (typeof t == "function") {
        const r = await t(e, n);
        s = Array.isArray(r) ? r : (i._sgAttachments || []).concat(pe(e));
      } else
        s = (i._sgAttachments || []).concat(pe(e));
      Qe(i, n, Q(s));
    } finally {
      i.classList.remove("is-uploading");
    }
  }
}
async function cs(i, n, e, t) {
  let s;
  if (typeof t == "function") {
    const r = await t(e, n);
    s = Array.isArray(r) ? r : (i._sgAttachments || []).filter((l) => l.id !== e.id);
  } else
    s = (i._sgAttachments || []).filter((r) => r.id !== e.id);
  Qe(i, n, Q(s));
}
function pe(i) {
  return i.map((n, e) => ({
    id: `local_${Date.now()}_${e}`,
    filename: n.name,
    url: URL.createObjectURL(n),
    content_type: n.type || "",
    byte_size: n.size,
    preview_url: n.type?.startsWith("image/") ? URL.createObjectURL(n) : null,
    thumb_url: n.type?.startsWith("image/") ? URL.createObjectURL(n) : null
  }));
}
function Qe(i, n, e) {
  const { row: t, col: s, api: r } = n;
  t && s?.field != null && (t[s.field] = e), i._sgAttachments = e, r?.applyTransaction ? r.applyTransaction({ update: [t] }) : r?.refreshCells && r.refreshCells({ rowIds: [t?.id ?? t?._sg_id] }), i._sgAttachRepaint && i._sgAttachRepaint();
}
function Je({ color: i = "green", showValue: n = !1 } = {}) {
  return ({ value: e }) => {
    let t = Number(e);
    Number.isFinite(t) || (t = 0), t = Math.max(0, Math.min(100, t));
    const s = w("div", { class: "sg-renderer-progress" }, [
      w("div", { class: `sg-renderer-progress-fill sg-fill-${i}`, style: `width: ${t}%;` })
    ]);
    return n ? w("div", { class: "sg-renderer-progress-wrap" }, [
      s,
      w("span", { class: "sg-renderer-progress-label" }, document.createTextNode(`${Math.round(t)}%`))
    ]) : s;
  };
}
const q = '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>';
function et({ max: i = 5, precision: n = 0.5 } = {}) {
  const e = n > 0 ? 1 / n : 2;
  return ({ value: t }) => {
    let s = parseFloat(t);
    Number.isFinite(s) || (s = 0), s = Math.max(0, Math.min(i, s)), s = Math.round(s * e) / e;
    const r = w("div", {
      class: "sg-renderer-stars",
      role: "img",
      "aria-label": `${s} out of ${i} stars`
    });
    for (let l = 1; l <= i; l++)
      if (s >= l)
        r.append(w("span", { class: "sg-renderer-star is-full", "aria-hidden": "true" }, q));
      else if (s > l - 1) {
        const a = Math.round((s - (l - 1)) * 100);
        r.append(w(
          "span",
          { class: "sg-renderer-star is-partial", "aria-hidden": "true" },
          `${q}<span class="sg-star-clip" style="width: ${a}%;">${q}</span>`
        ));
      } else
        r.append(w("span", { class: "sg-renderer-star is-empty", "aria-hidden": "true" }, q));
    return r;
  };
}
function tt({ separator: i = "," } = {}) {
  return ({ value: n }) => {
    if (D(n)) return "";
    const e = Array.isArray(n) ? n : String(n).split(i), t = w("div", { class: "sg-renderer-tags" });
    for (const s of e) {
      const r = String(s).trim();
      r && t.append(w("span", { class: "sg-renderer-tag" }, document.createTextNode(r)));
    }
    return t;
  };
}
function st({ showCode: i = !0, fallback: n = null } = {}) {
  return ({ value: e }) => {
    if (D(e)) return "";
    const t = String(e).trim().toUpperCase();
    if (t.length !== 2 || !/^[A-Z]{2}$/.test(t))
      return n ?? document.createTextNode(String(e));
    const s = String.fromCodePoint(
      127462 + t.charCodeAt(0) - 65,
      127462 + t.charCodeAt(1) - 65
    ), r = w("span", { class: "sg-renderer-country" });
    return r.append(w("span", { class: "sg-renderer-flag", "aria-hidden": "true" }, document.createTextNode(s))), i && r.append(w("span", { class: "sg-renderer-country-code" }, document.createTextNode(t))), r;
  };
}
function us(i) {
  const n = String(i).replace(/\s+/g, "");
  if (n.length !== 11 || !/^\d{11}$/.test(n)) return !1;
  const e = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19], t = parseInt(n[0], 10) - 1 + n.slice(1);
  let s = 0;
  for (let r = 0; r < 11; r++) s += parseInt(t[r], 10) * e[r];
  return s % 89 === 0;
}
function hs(i) {
  const n = String(i).replace(/\D/g, "");
  return n.length !== 11 ? String(i) : `${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
}
function it() {
  return ({ value: i }) => {
    if (D(i)) return "";
    if (!us(i))
      return w("span", { class: "sg-renderer-invalid", title: "Invalid ABN" }, document.createTextNode(String(i)));
    const n = String(i).replace(/\s+/g, "");
    return w("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/ABN/View?id=${n}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(hs(i)));
  };
}
function nt({
  lookup: i = null,
  nameField: n = null,
  avatarField: e = null,
  windowKey: t = "__sgUsers",
  size: s = 22
} = {}) {
  return ({ value: r, row: l }) => {
    if (D(r)) return "";
    let a = null;
    if (typeof i == "function" && (a = i(r, l) || null), !a && n && (a = { name: l?.[n], avatarUrl: e ? l?.[e] : null }), !a && typeof window < "u" && window[t]) {
      const c = window[t];
      c instanceof Map ? a = c.get(r) || c.get(String(r)) || null : Array.isArray(c) && (a = c.find((h) => `${h.id}` == `${r}`) || null);
    }
    const o = a?.name ?? String(r), d = w("span", { class: "sg-renderer-avatar" });
    if (a?.avatarUrl)
      d.append(w("img", {
        class: "sg-renderer-avatar-img",
        src: a.avatarUrl,
        width: String(s),
        height: String(s),
        alt: ""
      }));
    else {
      const c = String(o).split(/\s+/).filter(Boolean).slice(0, 2).map((h) => h[0]?.toUpperCase() || "").join("");
      d.append(w("span", {
        class: "sg-renderer-avatar-initials",
        style: `width: ${s}px; height: ${s}px;`
      }, document.createTextNode(c)));
    }
    return d.append(w("span", { class: "sg-renderer-avatar-name" }, document.createTextNode(o))), d;
  };
}
const ps = {
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
function fs(i) {
  return String(i).toLowerCase().split(/[\s_-]+/).map((n) => n && n[0].toUpperCase() + n.slice(1)).join(" ");
}
function gs(i = {}, n = null, e = {}) {
  const { titleCase: t = !0, defaultColor: s = "gray" } = e, r = {};
  for (const [a, o] of Object.entries(i)) r[String(a).toLowerCase()] = o;
  const l = {};
  if (n) for (const [a, o] of Object.entries(n)) l[String(a).toLowerCase()] = o;
  return ({ value: a }) => {
    if (D(a)) return "";
    const o = String(a).toLowerCase(), d = r[o] || s, c = t ? fs(a) : String(a), h = w("span", { class: `sg-pill sg-pill-${d}` });
    if (n) {
      const u = l[o], p = u ? ps[u] || u : null;
      if (p) {
        const g = w("span", { class: "sg-pill-icon", "aria-hidden": "true" });
        g.innerHTML = p, h.append(g);
      }
    }
    return h.append(w("span", { class: "sg-pill-label" }, document.createTextNode(c))), h;
  };
}
R("email", xe());
R("url", Le());
R("phone", Re());
R("currency", Me());
R("percent", De());
R("progress-bar", Je());
R("star-rating", et());
R("tags", tt());
R("country-flag", st());
R("abn", it());
R("avatar", nt());
R("date", Ae());
R("datetime", Ee());
R("relative-time", Te());
R("duration", Ve());
R("number", Ie());
R("compact-number", ke());
R("file-size", Ne());
R("boolean", Fe());
R("delta", Pe());
R("truncate", Be());
R("copyable", $e());
R("image", ze());
R("color-swatch", He());
R("sparkline", Ge());
R("heatmap-cell", Oe());
R("mask", Ke());
R("highlight", qe());
R("multi-line", je());
R("attachments", Ye());
const ms = {
  email: xe,
  url: Le,
  phone: Re,
  currency: Me,
  percent: De,
  progressBar: Je,
  starRating: et,
  tags: tt,
  countryFlag: st,
  abn: it,
  avatar: nt,
  statusPill: gs,
  date: Ae,
  datetime: Ee,
  relativeTime: Te,
  duration: Ve,
  number: Ie,
  compactNumber: ke,
  fileSize: Ne,
  boolean: Fe,
  delta: Pe,
  truncate: Be,
  copyable: $e,
  image: ze,
  colorSwatch: He,
  sparkline: Ge,
  heatmap: Oe,
  mask: Ke,
  highlight: qe,
  multiLine: je,
  attachments: Ye
}, _s = 32, fe = 100, j = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', vs = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>', ws = /* @__PURE__ */ new Set([
  "color",
  "date",
  "datetime-local",
  "time",
  "month",
  "week"
]), ge = [
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
class re extends P {
  constructor() {
    super(...arguments);
    M(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    // ----- Row grouping + aggregation -----
    // A group is expanded if it has an explicit override; otherwise the
    // default-by-level applies (-1 = all, 0 = none, N = first N levels).
    M(this, "_isGroupExpanded", (e, t) => {
      if (this._groupExpanded.has(e)) return this._groupExpanded.get(e);
      const s = this.state.group.defaultExpanded;
      return s < 0 ? !0 : t < s;
    });
    // Delegated click handler for synthetic <th>s that don't have a
    // HeaderCellController of their own (pivot result cols today). Mirrors the
    // user-defined header path: bare click toggles sort, shift-click appends to
    // a multi-sort. Resize handles / filter icons short-circuit.
    M(this, "_onSynthHeaderClick", (e) => {
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
    M(this, "_onHeaderContextMenu", (e) => {
      const t = e.target.closest("th[data-field], th[data-header-cell-field-value]");
      if (!t) return;
      const s = t.getAttribute("data-field") || t.getAttribute("data-header-cell-field-value"), r = this._colByField(s);
      !r || r._isCheckbox || r._isRowNumber || r._isGroupCol || r._isPivot || (e.preventDefault(), this._showColumnMenu(r, e.clientX, e.clientY));
    });
    M(this, "_onDocMouseDownColumnMenu", (e) => {
      this._columnMenu && !this._columnMenu.contains(e.target) && this._closeColumnMenu();
    });
    M(this, "_onColumnMenuKey", (e) => {
      e.key === "Escape" && (e.stopPropagation(), this._closeColumnMenu());
    });
    M(this, "_onCellDragEnter", (e) => {
      if (!this._isFileDrag(e)) return;
      const t = this._dropTarget(e.target);
      t && (e.preventDefault(), this._dropHotCell && this._dropHotCell !== t.td && this._dropHotCell.classList.remove("sg-drop-target"), t.td.classList.add("sg-drop-target"), this._dropHotCell = t.td);
    });
    M(this, "_onCellDragOver", (e) => {
      if (!this._isFileDrag(e)) return;
      const t = this._dropTarget(e.target);
      t && (e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "copy"), this._dropHotCell !== t.td && (this._dropHotCell?.classList.remove("sg-drop-target"), t.td.classList.add("sg-drop-target"), this._dropHotCell = t.td));
    });
    M(this, "_onCellDragLeave", (e) => {
      this._dropHotCell && !this._dropHotCell.contains(e.relatedTarget) && (this._dropHotCell.classList.remove("sg-drop-target"), this._dropHotCell = null);
    });
    M(this, "_onCellDrop", (e) => {
      if (!this._isFileDrag(e)) return;
      const t = this._dropTarget(e.target);
      if (!t) return;
      e.preventDefault(), this._dropHotCell?.classList.remove("sg-drop-target"), this._dropHotCell = null;
      const s = Array.from(e.dataTransfer?.files || []);
      if (!s.length) return;
      const r = this.state.rowData.find((h) => this._rowId(h) === t.rowId), l = { rowId: t.rowId, colId: t.colId, files: s, row: r, dataTransfer: e.dataTransfer }, a = new CustomEvent("grid:fileAttached", { detail: l, bubbles: !0, cancelable: !0 });
      if (!this.element.dispatchEvent(a) || !r) return;
      const d = this.attachmentsFieldValue || t.colId, c = Array.isArray(r[d]) ? r[d].slice() : [];
      for (const h of s) {
        let u = "";
        try {
          u = URL.createObjectURL(h);
        } catch {
        }
        c.push({
          id: `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
          filename: h.name,
          name: h.name,
          byte_size: h.size,
          size: h.size,
          content_type: h.type || "application/octet-stream",
          url: u,
          thumb_url: h.type?.startsWith("image/") ? u : null,
          preview_url: h.type?.startsWith("image/") ? u : null
        });
      }
      r[d] = c, this.scheduleRender("cells"), C(this.element, "grid:cellValueChanged", {
        rowId: t.rowId,
        colId: d,
        oldValue: null,
        newValue: c
      });
    });
    M(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
    });
    M(this, "_onCellMouseDown", (e) => {
      if (e.button !== 0) return;
      if (this.rowDragValue) {
        const r = e.target.closest?.('td[data-gutter="true"]');
        if (r) {
          const l = r.closest("tr");
          this._rowDragPending = { rowId: this._coerceRowId(l.dataset.rowId), x: e.clientX, y: e.clientY }, this._rowDragMoved = !1, document.addEventListener("mousemove", this._onRowDragMove);
          return;
        }
      }
      if (e.target.closest?.('[data-tree-toggle="true"]')) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : s ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), C(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    M(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      s && s.focus.rowId === t.rowId && s.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), C(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
    });
    M(this, "_onCellMouseUp", () => {
      this._cellDragging = !1, this._rowDragPending && (document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag && this._finishRowDrag(), this._rowDragPending = null);
    });
    // ----- Row drag-and-drop (reorder) with a ghost preview -----
    M(this, "_onRowDragMove", (e) => {
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
    M(this, "_onCopy", (e) => {
      if (this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && !this.element.contains(t)) return;
      const s = this._activeRect();
      if (!s) return;
      const r = this._cellRangeRows(s).map((l) => l.map((a) => String(a ?? "")).join("	")).join(`
`);
      r && (e.clipboardData?.setData("text/plain", r), e.preventDefault());
    });
    M(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && this.element.contains(t)) return;
      const s = e.key, r = e.metaKey || e.ctrlKey;
      if (r && s.toLowerCase() === "a") {
        e.preventDefault(), this.rowSelectionValue !== "" ? (this.clearCellSelection(), this.deselectAll(), this.selectAll()) : this._selectAllCells();
        return;
      }
      if (r) return;
      const l = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (l[s]) {
        e.preventDefault();
        const [a, o] = l[s];
        this._moveActiveCell(a, o, e.shiftKey);
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
        const o = this._colByField(a.colId);
        if (!o || !o.editable) return;
        e.preventDefault(), this.startEditingCell(a.rowId, a.colId, s);
      }
    });
    M(this, "_onEditorKey", (e) => {
      this.state.editing && (e.key === "Enter" ? (e.preventDefault(), this.stopEditing(!1)) : e.key === "Escape" ? (e.preventDefault(), this.stopEditing(!0)) : e.key === "Tab" && (e.preventDefault(), this._tabToEditableCell(e.shiftKey ? -1 : 1)));
    });
    M(this, "_onEditorBlur", () => {
      this._navigatingEditor || this.state.editing && this.stopEditing(!1);
    });
    // ----- Tree data (self-referential parent_id) -----
    //
    // The model layer flattens the tree and hands us back a Map of per-row
    // metadata (level, hasChildren, expanded). The controller owns the
    // expanded/collapsed override Map; the model just calls back through
    // `isTreeRowExpanded` to ask which state a given row is in. Everything
    // else (filter, sort, paginate) flows through the normal pipeline.
    M(this, "_isTreeRowExpanded", (e, t) => {
      const s = String(e);
      if (this._treeExpanded.has(s)) return this._treeExpanded.get(s);
      const r = this.state.tree?.defaultExpanded ?? -1;
      return r < 0 ? !0 : t < r;
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
      pagination: { enabled: !1, page: 0, pageSize: fe },
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = Tt(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("mousemove", this._onRowDragMove), this._thead?.removeEventListener("contextmenu", this._onHeaderContextMenu), this._thead?.removeEventListener("click", this._onSynthHeaderClick), this._tbody?.removeEventListener("dragenter", this._onCellDragEnter), this._tbody?.removeEventListener("dragover", this._onCellDragOver), this._tbody?.removeEventListener("dragleave", this._onCellDragLeave), this._tbody?.removeEventListener("drop", this._onCellDrop), this._closeColumnMenu(), this._teardownPersistence(), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove();
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, s) => {
      if (t.hasAttribute("data-separator")) {
        const d = t.getAttribute("data-separator"), c = { __sgSeparator: !0 };
        d && d !== "" && d !== "true" && (c.variant = d);
        const h = t.getAttribute("data-label"), u = t.getAttribute("data-value");
        return h != null && (c.label = h), u != null && (c.value = u), c;
      }
      const r = {}, l = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      r[this.getRowIdValue] = l != null ? this._coerceRowId(l) : s + 1;
      const a = {};
      t.querySelectorAll("td").forEach((d) => {
        const c = d.getAttribute("data-cell-col-id-value") || d.getAttribute("data-col-id");
        if (!c) return;
        const h = d.getAttribute("data-cell-value");
        if (h != null)
          try {
            r[c] = JSON.parse(h);
          } catch {
            r[c] = h;
          }
        else
          r[c] = d.textContent.trim();
        const u = Number(d.getAttribute("data-spans") || d.getAttribute("colspan") || 1);
        u > 1 && (a[c] = u);
      }), Object.keys(a).length && (r.__sgSpans = a);
      const o = t.getAttribute("data-row-detail-rows-value");
      if (o && this.detailRowsKeyValue)
        try {
          r[this.detailRowsKeyValue] = JSON.parse(o);
        } catch {
        }
      return r;
    }), e.innerHTML = ""), this._initialHead = this.element.querySelector("thead");
  }
  _buildChrome() {
    let e = this.element.querySelector("table");
    if (!e) {
      e = f("table");
      const s = f("thead");
      e.appendChild(s), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = f("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const s = f("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(s, e), s.appendChild(e), this._viewport = s;
    }
    if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = f("div", { class: "sg-status-bar", role: "status" }), this._statusBar.append(
      f("div", { class: "sg-status-section sg-status-left" }),
      f("div", { class: "sg-status-section sg-status-right" })
    ), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
      const s = f("div", { class: "sg-main" });
      this._viewport.parentNode.insertBefore(s, this._viewport), s.appendChild(this._viewport), this._statusBar && s.appendChild(this._statusBar), this._main = s, this._sidePanel = f("aside", {
        class: "sg-side-panel",
        "data-controller": "side-panel"
      }), this.element.appendChild(this._sidePanel), this.element.classList.add("sg-has-side-panel");
    } else
      this._main = null, this._sidePanel = null;
    this._thead?.addEventListener("contextmenu", this._onHeaderContextMenu), this._thead?.addEventListener("click", this._onSynthHeaderClick);
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
    this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), this._restorePersistedState(), this._setupPersistence(), C(this.element, "grid:ready", { api: this.element.gridApi }), C(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
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
    const s = this.state.filterModel[e.field] || {}, r = bs(e.filter), l = f("div", { class: "sg-filter-popover" }), a = f("select");
    r.forEach((v) => a.append(new Option(v.label, v.value, !1, v.value === s.type)));
    const o = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", d = f("input", { type: o, value: s.value ?? "" }), c = f("input", { type: o, value: s.value2 ?? "", style: { display: "none" } }), h = () => {
      const v = a.value, b = v === "inRange", _ = !(v === "blank" || v === "notBlank");
      d.style.display = _ ? "" : "none", c.style.display = b ? "" : "none";
    };
    a.addEventListener("change", h), h();
    const u = f("div", { class: "sg-filter-actions" }), p = f("button", { type: "button" }, "Clear"), g = f("button", { type: "button", class: "primary" }, "Apply");
    u.append(p, g), p.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), g.addEventListener("click", () => {
      const v = a.value, b = v === "blank" || v === "notBlank" ? { filterType: e.filter, type: v } : { filterType: e.filter, type: v, value: d.value, value2: c.value || void 0 };
      this.setColumnFilter(e.field, b), this._closeFilterPopover();
    }), l.append(
      f("label", {}, "Condition"),
      a,
      d,
      c,
      u
    ), document.body.appendChild(l);
    const m = t.getBoundingClientRect();
    l.style.left = `${m.left + window.scrollX}px`, l.style.top = `${m.bottom + window.scrollY + 2}px`, this._filterPopover = l, document.addEventListener("mousedown", this._onDocMouseDown), d.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const s = this.state.columnDefs.findIndex((d) => d.field === e.field), r = this._runtimeOverrides[e.field] || {}, l = s >= 0 ? this.state.columnDefs[s] : null, a = l ? {
      ...l.hidden != null ? { hidden: l.hidden } : {},
      ...l.pinned ? { pinned: l.pinned } : {},
      ...l.width != null ? { width: l.width } : {}
    } : {}, o = { ...e, ...r, ...a, _headerEl: t };
    if (s >= 0) {
      const d = this.state.columnDefs[s];
      if (d._headerEl === t && ys(d, o)) return;
      this.state.columnDefs[s] = o;
    } else
      this.state.columnDefs.push(o);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${$(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const s = this.state.sortModel.findIndex((l) => l.colId === e);
    let r;
    s === -1 ? r = { colId: e, sort: "asc" } : this.state.sortModel[s].sort === "asc" ? r = { colId: e, sort: "desc" } : r = null, t ? (s >= 0 && this.state.sortModel.splice(s, 1), r && this.state.sortModel.push(r)) : this.state.sortModel = r ? [r] : [], this.scheduleRender("sort"), C(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  setSortModel(e) {
    this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), C(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  // ----- Filter -----
  setColumnFilter(e, t) {
    t == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = t, this.state.pagination.page = 0, this.scheduleRender("filter"), C(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setFilterModel(e) {
    this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), C(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setQuickFilter(e) {
    const t = e == null ? "" : String(e);
    t !== this.state.quickFilter && (this.state.quickFilter = t, this.state.pagination.page = 0, this.scheduleRender("filter"), C(this.element, "grid:filterChanged", {
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
    this.rowSelectionValue === "single" ? (s.clear(), s.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? s.has(e) ? s.delete(e) : s.add(e) : (s.clear(), s.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), C(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(s)
    });
  }
  setSelected(e, t) {
    t ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), C(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  selectAll() {
    this._displayList.filteredSorted.forEach((e) => {
      !e.__sgGroup && !e.__sgSeparator && this.state.selection.add(this._rowId(e));
    }), this.scheduleRender("selection"), C(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  deselectAll() {
    this.state.selection.clear(), this.scheduleRender("selection"), C(this.element, "grid:selectionChanged", { selectedRows: [], selectedIds: [] });
  }
  getSelectedRows() {
    const e = this.state.selection;
    return this.state.rowData.filter((t) => e.has(this._rowId(t)));
  }
  _selectRange(e, t) {
    const s = this._displayList.filteredSorted, r = s.findIndex((d) => this._rowId(d) === e), l = s.findIndex((d) => this._rowId(d) === t);
    if (r < 0 || l < 0) return;
    const [a, o] = r <= l ? [r, l] : [l, r];
    for (let d = a; d <= o; d++)
      !s[d].__sgGroup && !s[d].__sgSeparator && this.state.selection.add(this._rowId(s[d]));
  }
  // ----- Pagination -----
  goToPage(e) {
    const t = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(e, t)), this.scheduleRender("page"), C(this.element, "grid:paginationChanged", {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  setPageSize(e) {
    this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), C(this.element, "grid:paginationChanged", {
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
    const e = Object.fromEntries(this.state.columnDefs.map((r) => [r.field, r])), t = this.state.columnDefs.filter((r) => !r.hidden && !r._isCheckbox);
    let s = ve(this.state.rowData, this.state.filterModel, e);
    return s = we(s, this.state.quickFilter, t), s.length;
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
    const r = this.state.columnDefs.find((a) => a.field === t);
    if (!r || !r.editable) return;
    const l = this.state.rowData.find((a) => this._rowId(a) === e);
    l && (this.state.editing = { rowId: e, colId: t, originalValue: T(l, r), initialValue: s }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: s, originalValue: r, draftValue: l } = this.state.editing, a = this._tbody.querySelector(`tr[data-row-id="${$(t)}"] td[data-col-id="${$(s)}"]`);
    let o = r;
    if (!e && a) {
      const d = a.querySelector("[data-editor-input]") || a.querySelector("input,select,textarea");
      d ? o = Cs(d.value, this._colByField(s)?.type) : l !== void 0 && (o = l);
    }
    if (this.state.editing = null, !e && o !== r) {
      const d = this.state.rowData.find((h) => this._rowId(h) === t), c = d[s];
      d[s] = o, C(this.element, "grid:cellValueChanged", { rowId: t, colId: s, oldValue: c, newValue: o });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const s = this._colByField(e);
    s && (s.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), C(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const r = t || null;
    s.pinned = r, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: r }, this._reorderForPinning(), this.scheduleRender("columns"), C(this.element, "grid:columnPinned", { colId: e, pinned: r });
  }
  setColumnWidth(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const r = Math.max(s.minWidth || 40, Math.min(s.maxWidth || 4e3, t));
    s.width = r, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: r }, this.scheduleRender("columns"), C(this.element, "grid:columnResized", { colId: e, width: r });
  }
  moveColumn(e, t) {
    const s = this.state.columnDefs.findIndex((l) => l.field === e);
    if (s < 0 || s === t) return;
    const [r] = this.state.columnDefs.splice(s, 1);
    this.state.columnDefs.splice(t, 0, r), this.scheduleRender("columns"), C(this.element, "grid:columnMoved", { colId: e, fromIndex: s, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const s = $(e), r = this._thead?.querySelector(
      `th[data-header-cell-field-value="${s}"], th[data-field="${s}"]`
    ), l = Array.from(
      this._tbody?.querySelectorAll(`td[data-col-id="${s}"]`) || []
    ).filter((o) => !o.closest("tr")?.classList?.contains("sg-spacer"));
    let a = 0;
    if ((r || l.length) && (a = this._measureColumnContentWidth(r, l)), !a) {
      const o = (t.headerName || t.field || "").length, d = this.state.rowData.slice(0, 200);
      let c = o;
      for (const h of d) {
        const u = String(k(h, t) ?? "").length;
        u > c && (c = u);
      }
      a = c * 8;
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, a + 16)));
  }
  // Build an off-screen single-column <table table-layout:auto> with clones
  // of the header + a sample of body cells, mount it inside .sg-grid so
  // scoped CSS still applies, read the natural td widths, return the max.
  _measureColumnContentWidth(e, t, s = 50) {
    const r = document.createElement("table");
    r.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;table-layout:auto;width:auto;border-collapse:separate;border-spacing:0;";
    const l = document.createElement("tbody");
    r.appendChild(l);
    const a = (d) => {
      if (!d) return;
      const c = document.createElement("tr"), h = d.cloneNode(!0);
      h.removeAttribute("style"), c.appendChild(h), l.appendChild(c);
    };
    if (a(e), t.slice(0, s).forEach(a), !l.children.length) return 0;
    this.element.appendChild(r);
    let o = 0;
    for (const d of l.children) {
      const c = d.firstElementChild;
      c && c.offsetWidth > o && (o = c.offsetWidth);
    }
    return this.element.removeChild(r), o;
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), s = t.reduce((l, a) => l + (a.width || 150), 0);
    if (s === 0) return;
    const r = e / s;
    t.forEach((l) => {
      l.width = Math.max(l.minWidth || 40, Math.floor((l.width || 150) * r));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((r) => r.pinned === "left"), t = this.state.columnDefs.filter((r) => r.pinned === "right"), s = this.state.columnDefs.filter((r) => !r.pinned);
    this.state.columnDefs = [...e, ...s, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), C(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], s = [], r = [], l = new Map(this.state.rowData.map((a) => [this._rowId(a), a]));
    return (e.remove || []).forEach((a) => {
      const o = this._rowId(a);
      l.delete(o) && r.push(a);
    }), (e.update || []).forEach((a) => {
      const o = this._rowId(a);
      l.has(o) && (l.set(o, { ...l.get(o), ...a }), s.push(a));
    }), (e.add || []).forEach((a) => {
      const o = this._rowId(a);
      l.has(o) || (l.set(o, a), t.push(a));
    }), this.state.rowData = Array.from(l.values()), this.scheduleRender("data"), C(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: s, removed: r };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const s = this.state.columnDefs.filter((o) => !o.hidden && !o._isCheckbox), r = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((o) => !o.__sgGroup && !o.__sgDetail && !o.__sgSeparator), l = (o) => /[",\n\r]/.test(o) ? `"${String(o).replace(/"/g, '""')}"` : String(o), a = [s.map((o) => l(o.headerName || o.field)).join(e)];
    for (const o of r)
      a.push(s.map((d) => l(k(o, d))).join(e));
    return a.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const s = this.getDataAsCsv(t), r = new Blob([s], { type: "text/csv;charset=utf-8" }), l = URL.createObjectURL(r), a = f("a", { href: l, download: e });
    return document.body.appendChild(a), a.click(), a.remove(), URL.revokeObjectURL(l), s;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.has("tree") || e.size === 0) && (this._displayList = At({
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
    const e = this._visibleCols(), t = Mt(e, this._headerLayoutOpts());
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
    t || (t = f("colgroup"), this._table.insertBefore(t, this._thead));
    const s = Array.from(t.children);
    for (e.forEach((l, a) => {
      let o = s[a];
      o || (o = f("col"), t.appendChild(o)), o.style.width = l.width ? l.width + "px" : "";
    }); t.children.length > e.length; ) t.lastElementChild.remove();
    if (e.some((l) => !l.width))
      this._table.style.width = "100%";
    else {
      const l = e.reduce((a, o) => a + (Number(o.width) || 0), 0);
      this._table.style.width = l + "px";
    }
  }
  _renderHeaderSingleRow(e) {
    if (this._thead.children.length > 1) {
      const u = this._thead.firstElementChild;
      for (let p = 1; p < this._thead.children.length; p++) {
        const g = this._thead.children[p];
        Array.from(g.children).forEach((m) => {
          (m.hasAttribute("data-header-cell-field-value") || m.hasAttribute("data-field")) && u.appendChild(m);
        });
      }
      for (; this._thead.children.length > 1; ) this._thead.lastElementChild.remove();
    }
    const t = this._thead.querySelector("tr") || (() => {
      const u = f("tr");
      return this._thead.appendChild(u), u;
    })(), s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((u) => {
      const p = u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field");
      p && s.set(p, u);
    });
    const r = new Set(e.map((u) => u.field)), l = this.state.columnDefs.filter((u) => !r.has(u.field)), a = [...e, ...l], o = Array.from(t.children).map((u) => u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field")).filter(Boolean), d = a.map((u) => u.field);
    if (o.length === d.length && o.every((u, p) => u === d[p]))
      Array.from(t.children).forEach((u) => {
        u.removeAttribute("rowspan"), u.removeAttribute("colspan");
      });
    else {
      const u = [];
      for (const p of a) {
        let g = s.get(p.field);
        g ? (g.removeAttribute("rowspan"), g.removeAttribute("colspan")) : g = f("th", {
          "data-field": p.field,
          "data-synth": "true"
        }, [f("div", { class: "sg-header-content" }, [
          f("span", { class: "sg-header-label" }, p.headerName || p.field || "")
        ])]), u.push(g);
      }
      t.replaceChildren(...u);
    }
    Array.from(t.children).forEach((u) => {
      const p = u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field");
      p != null && (u.style.display = r.has(p) ? "" : "none");
    });
    const h = this._pinOffsets();
    for (const u of e) {
      const p = t.querySelector(`th[data-header-cell-field-value="${$(u.field)}"]`) || t.querySelector(`th[data-field="${$(u.field)}"]`);
      p && this._applyLeafThState(p, u, h);
    }
  }
  // Multi-row header: <thead> gets `layout.depth` rows of group headers
  // followed by the leaf headers, then one hidden row holding any registered
  // <th>s that aren't currently visible (so their controllers stay mounted).
  _renderHeaderMultiRow(e, t) {
    const s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((c) => {
      const h = c.getAttribute("data-header-cell-field-value") || c.getAttribute("data-field");
      h && s.set(h, c);
    });
    const r = [], l = new Set(e.map((c) => c.field)), a = this._pinOffsets();
    for (const c of t.rows) {
      const h = f("tr");
      for (const u of c) {
        if (u.kind === "group") {
          h.appendChild(f("th", {
            class: "sg-header-group",
            colspan: String(u.colspan),
            "data-group-header": "true"
          }, u.label || ""));
          continue;
        }
        const p = u.col;
        let g = s.get(p.field);
        if (g || (g = f("th", {
          "data-field": p.field,
          "data-synth": "true"
        }, [f("div", { class: "sg-header-content" }, [
          f("span", { class: "sg-header-label" }, u.label || p.headerName || p.field || "")
        ])])), u.label) {
          const m = g.querySelector(".sg-header-label");
          m && m.textContent !== u.label && (m.textContent = u.label);
        }
        g.setAttribute("rowspan", String(u.rowspan)), g.removeAttribute("colspan"), g.style.display = "", h.appendChild(g), this._applyLeafThState(g, p, a);
      }
      r.push(h);
    }
    const o = /* @__PURE__ */ new Set();
    t.rows.forEach((c) => c.forEach((h) => {
      h.kind === "leaf" && o.add(h.col.field);
    }));
    const d = this.state.columnDefs.filter(
      (c) => !l.has(c.field) && !o.has(c.field)
    );
    if (d.length) {
      const c = f("tr", { class: "sg-hidden-header-row" });
      for (const h of d) {
        let u = s.get(h.field);
        u || (u = f("th", { "data-field": h.field, "data-synth": "true" })), u.removeAttribute("rowspan"), u.removeAttribute("colspan"), c.appendChild(u);
      }
      r.push(c);
    }
    this._thead.replaceChildren(...r);
  }
  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(e, t, s) {
    const r = this.state.sortModel.find((l) => l.colId === t.field);
    oe(e, {
      "data-sortable": t.sortable ? "true" : null,
      "data-filterable": t.filter ? "true" : null,
      "data-filter-active": this.state.filterModel[t.field] ? "true" : null,
      "data-sort": r?.sort || null,
      "data-pinned": t.pinned || null,
      // Carry the column's value-type onto the <th> so CSS can right-align
      // numeric headers (matching the right-aligned numeric body cells from
      // currency/number/percent renderers and from the `type: 'number'`
      // formatter path).
      "data-type": t.type && t.type !== "text" ? t.type : null
    }), t.width && (e.style.width = t.width + "px"), e.style.left = t.pinned === "left" ? s.left[t.field] + "px" : "", e.style.right = t.pinned === "right" ? s.right[t.field] + "px" : "", this._ensureHeaderChrome(e, t, r);
  }
  _ensureHeaderChrome(e, t, s) {
    if (t._isRowNumber) {
      e.classList.add("sg-gutter-header"), e.textContent = "";
      return;
    }
    if (t._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let o = e.querySelector('input[type="checkbox"]');
      o || (o = f("input", { type: "checkbox", "aria-label": "Select all" }), o.addEventListener("change", (h) => {
        h.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(o));
      const d = this._displayList.filteredSorted.length, c = this.state.selection.size;
      o.checked = c > 0 && c >= d, o.indeterminate = c > 0 && c < d;
      return;
    }
    let r = e.querySelector(".sg-header-content");
    if (!r) {
      const o = e.textContent.trim();
      e.textContent = "", r = f("div", { class: "sg-header-content" }, [
        f("span", { class: "sg-header-label" }, o || t.headerName || t.field || "")
      ]), e.appendChild(r);
    }
    let l = r.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (l || (l = f("span", { class: "sg-sort-icon", "aria-hidden": "true" }), l.innerHTML = j, r.appendChild(l)), s && this.state.sortModel.length > 1) {
        let o = r.querySelector(".sg-sort-index");
        o || (o = f("span", { class: "sg-sort-index" }), r.appendChild(o)), o.textContent = String(this.state.sortModel.indexOf(s) + 1);
      } else
        r.querySelector(".sg-sort-index")?.remove();
    else l && l.remove();
    let a = r.querySelector(".sg-filter-icon");
    t.filter ? a || (a = f("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), a.innerHTML = vs, r.appendChild(a)) : a && a.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(f("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._withDetailRows(this._displayList.pageRows);
    this._selKeys = this._computeCellSelKeys();
    const s = !this.masterDetailValue && (this.virtualValue || t.length > 200);
    let r = t, l = 0;
    if (s) {
      const u = this._viewport?.clientHeight || 400, p = this.state.rowHeight, g = Et(this.state.scrollTop, u, p, t.length, 8);
      l = g.first, r = t.slice(g.first, g.last);
    }
    const a = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((u) => {
      const p = u.dataset.rowId;
      p != null && a.set(p, u);
    });
    const o = document.createDocumentFragment(), d = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0;
    let c = 0;
    for (let u = 0; u < l; u++) {
      const p = t[u];
      p && !p.__sgGroup && !p.__sgDetail && !p.__sgSeparator && (c += 1);
    }
    const h = (u) => !u || u.__sgGroup || u.__sgDetail || u.__sgSeparator ? null : (c += 1, d + c);
    if (s) {
      const u = this.state.rowHeight, p = l * u, g = (t.length - l - r.length) * u;
      o.appendChild(this._spacerRow(p, e.length)), r.forEach((m) => o.appendChild(this._buildRow(m, e, a, h(m)))), o.appendChild(this._spacerRow(g, e.length));
    } else
      r.forEach((u) => o.appendChild(this._buildRow(u, e, a, h(u))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && o.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(o);
  }
  _buildPinnedBottomRow(e) {
    const t = f("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), s = this._pinOffsets(), r = this._displayList.grandTotals || {};
    let l = !1;
    for (const a of e) {
      const o = f("td", { "data-col-id": a.field, "data-pinned": a.pinned || null });
      a.pinned === "left" ? o.style.left = s.left[a.field] + "px" : a.pinned === "right" && (o.style.right = s.right[a.field] + "px");
      const d = r[a.field];
      d != null ? (o.classList.add("sg-agg-cell"), o.textContent = this._formatAggregate(d)) : !l && !a._isCheckbox && !a._isRowNumber && (o.classList.add("sg-pinned-bottom-label"), o.textContent = "Total", l = !0), t.appendChild(o);
    }
    return t;
  }
  _buildRow(e, t, s, r) {
    if (e.__sgGroup) return this._buildGroupRow(e, t, s);
    if (e.__sgDetail) return this._buildDetailRow(e, t, s);
    if (e.__sgSeparator) return this._buildSeparatorRow(e, t, s);
    const l = String(this._rowId(e));
    let a = s.get(l);
    a || (a = f("tr")), a.dataset.rowId = l, a.classList.remove("sg-spacer");
    const o = this.state.selection.has(this._rowId(e)), d = this.masterDetailValue && this._isDetailExpanded(l);
    return oe(a, {
      "data-selected": o ? "true" : null,
      "data-detail-expanded": d ? "true" : null
    }), this.masterDetailValue && a.classList.add("sg-master-row"), this._renderRow(a, e, t, r), a;
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
    const r = `__s:${e.__sgSeparatorId ?? this._separatorKey(e)}`;
    let l = s.get(r);
    l || (l = f("tr")), l.dataset.rowId = r, l.dataset.separator = "true", l.className = "", l.removeAttribute("data-selected"), l.removeAttribute("data-detail-expanded");
    const a = e.variant || (e.value != null ? "summary" : e.label != null ? "heading" : "blank");
    l.classList.add("sg-separator-row", `sg-separator-${a}`), e.className && l.classList.add(e.className), l.innerHTML = "";
    const o = (h) => h._isCheckbox || h._isRowNumber || h._isGroupCol || h._isMasterExpand, c = t.filter((h) => !o(h)).length || t.length || 1;
    for (const h of t) {
      if (o(h)) {
        const p = f("td", { "data-col-id": h.field, class: "sg-separator-gutter" });
        l.appendChild(p);
        continue;
      }
      const u = f("td", {
        "data-col-id": h.field,
        colspan: String(c),
        class: "sg-separator-cell"
      });
      this._renderSeparatorContent(u, e, a), l.appendChild(u);
      break;
    }
    return l;
  }
  _renderSeparatorContent(e, t, s) {
    if (s === "blank" || s === "divider")
      return;
    const r = f("div", { class: "sg-separator-content" });
    t.label != null && r.appendChild(f("span", { class: "sg-separator-label" }, String(t.label))), t.value != null && r.appendChild(f("span", { class: "sg-separator-value" }, String(t.value))), e.appendChild(r);
  }
  _separatorKey(e) {
    return [e.variant || "", e.label || "", e.value || ""].join("|");
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const r = f("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return r.style.height = "0px", r.appendChild(f("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), r;
    }
    const s = f("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return s.style.height = e + "px", s.appendChild(f("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), s;
  }
  _renderRow(e, t, s, r) {
    e.innerHTML = "";
    const l = this._pinOffsets(), a = this._selKeys || { active: null, range: null }, o = String(this._rowId(t)), d = this._displayList?.treeMeta, c = d ? d.get(o) : null, h = c ? this._treeDisplayColField() : null, u = t && t.__sgSpans || null;
    let p = 0;
    for (let g = 0; g < s.length; g++) {
      const m = s[g];
      if (p > 0) {
        p -= 1;
        continue;
      }
      const v = m._isRowNumber || m._isCheckbox || m._isGroupCol || m._isMasterExpand, b = u && !v ? Number(u[m.field]) : 0, _ = Math.max(1, Math.min(b || 1, s.length - g));
      _ > 1 && (p = _ - 1);
      const S = `${o}:${m.field}`, y = f("td", {
        "data-col-id": m.field,
        "data-pinned": m.pinned || null,
        "data-cell-active": a.active === S ? "true" : null,
        "data-cell-range": a.range && a.range.has(S) ? "true" : null,
        colspan: _ > 1 ? String(_) : null
      });
      if (_ > 1 && y.classList.add("sg-merged-cell"), m.pinned === "left" ? y.style.left = l.left[m.field] + "px" : m.pinned === "right" && (y.style.right = l.right[m.field] + "px"), m._isRowNumber) {
        y.classList.add("sg-gutter-cell"), y.setAttribute("data-gutter", "true"), y.removeAttribute("data-cell-active"), y.removeAttribute("data-cell-range"), y.textContent = r != null ? String(r) : "", e.appendChild(y);
        continue;
      }
      if (m._isCheckbox) {
        y.classList.add("sg-checkbox-cell");
        const L = f("input", { type: "checkbox" });
        L.checked = this.state.selection.has(this._rowId(t)), y.appendChild(L), e.appendChild(y);
        continue;
      }
      if (m._isGroupCol) {
        y.classList.add("sg-group-leaf-cell"), y.removeAttribute("data-cell-active"), y.removeAttribute("data-cell-range"), e.appendChild(y);
        continue;
      }
      if (m._isMasterExpand) {
        y.classList.add("sg-master-expand-cell"), y.setAttribute("data-master-expand", "true"), y.removeAttribute("data-cell-active"), y.removeAttribute("data-cell-range");
        const L = this._isDetailExpanded(this._rowId(t)), E = f("span", {
          class: "sg-master-expand-caret",
          "data-expanded": L ? "true" : "false",
          "aria-hidden": "true"
        });
        E.innerHTML = j, y.appendChild(E), e.appendChild(y);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === m.field) {
        y.setAttribute("data-editing", "true");
        const L = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : T(t, m), { node: E, control: A } = this._buildEditor(m, L);
        y.appendChild(E);
        const V = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          if (A?.focus(), V || A?.select?.(), A?.type && ws.has(A.type))
            try {
              A.showPicker?.();
            } catch {
            }
        });
      } else
        this._renderCellContent(y, t, m);
      c && m.field === h && this._decorateTreeCell(y, c), e.appendChild(y);
    }
  }
  // Prepend an indent spacer + a chevron (when the row has children) to the
  // tree column's <td>. The chevron carries data-tree-toggle so the body
  // click handler can route it back to toggleTreeRow without conflicting
  // with cell selection or row click handlers.
  _decorateTreeCell(e, t) {
    if (e.classList.add("sg-tree-cell"), e.setAttribute("data-tree-level", String(t.level)), e.style.paddingLeft = `${8 + t.level * 18}px`, t.hasChildren) {
      const s = f("span", {
        class: "sg-tree-chevron",
        "data-tree-toggle": "true",
        "data-expanded": t.expanded ? "true" : "false",
        "aria-hidden": "true"
      });
      s.innerHTML = j, e.insertBefore(s, e.firstChild);
    } else {
      const s = f("span", { class: "sg-tree-chevron sg-tree-chevron-leaf", "aria-hidden": "true" });
      e.insertBefore(s, e.firstChild);
    }
  }
  _renderCellContent(e, t, s) {
    if (s.cellRenderer) {
      const r = de(s.cellRenderer);
      if (r) {
        const a = T(t, s), o = k(t, s);
        (r.dataset.bind || r.dataset.bindText !== void 0) && (r.textContent = r.dataset.bind ? String(t[r.dataset.bind] ?? "") : o), r.dataset.bindAttr && r.setAttribute(r.dataset.bindAttr, a), r.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((d) => {
          d.dataset.bindText !== void 0 ? d.textContent = o : d.dataset.bind && (d.textContent = String(t[d.dataset.bind] ?? "")), d.dataset.bindAttr && d.setAttribute(d.dataset.bindAttr, a);
        }), e.appendChild(r);
        return;
      }
      const l = Se(s.cellRenderer);
      if (typeof l == "function") {
        const a = T(t, s), o = k(t, s), d = l({ value: a, row: t, col: s, td: e, formatted: o, api: this.element.gridApi });
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
    e.textContent = k(t, s);
  }
  toggleGroup(e, t = 0) {
    this._groupExpanded.set(e, !this._isGroupExpanded(e, t)), this.scheduleRender("group"), C(this.element, "grid:groupToggled", { groupId: e, expanded: this._groupExpanded.get(e) });
  }
  expandAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = -1, this.scheduleRender("group");
  }
  collapseAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = 0, this.scheduleRender("group");
  }
  setRowGroupColumns(e) {
    this.state.group.cols = Array.isArray(e) ? e.slice() : [], this._groupExpanded.clear(), this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("group"), C(this.element, "grid:columnRowGroupChanged", { rowGroupCols: this.state.group.cols.slice() });
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
    t == null ? delete this.state.group.aggs[e] : this.state.group.aggs[e] = t, this.scheduleRender("group"), C(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  // ----- Pivot mode -----
  // Toggling pivot mode rebuilds the display list (and therefore the visible
  // column set). Clears row + cell selection since the underlying cell graph
  // changes shape entirely.
  setPivotMode(e) {
    const t = !!e;
    this.state.pivot.mode !== t && (this.state.pivot.mode = t, this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), C(this.element, "grid:pivotModeChanged", { pivot: t }));
  }
  isPivotMode() {
    return !!this.state.pivot.mode;
  }
  setPivotColumns(e) {
    this.state.pivot.cols = Array.isArray(e) ? e.slice() : [], this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), C(this.element, "grid:columnPivotChanged", { pivotCols: this.state.pivot.cols.slice() });
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
    for (const { field: s, aggFunc: r } of e || [])
      s && r && (t[s] = r);
    this.state.group.aggs = t, this.scheduleRender(this.state.pivot.mode ? "pivot" : "group"), C(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  addValueColumn(e, t = "sum") {
    e && this.setColumnAggFunc(e, t);
  }
  removeValueColumn(e) {
    this.setColumnAggFunc(e, null);
  }
  // ----- Column header groups + pinned bottom row -----
  setColumnGroups(e) {
    this.columnGroupsValue = Array.isArray(e) ? e : [], this.scheduleRender("columns"), C(this.element, "grid:columnGroupsChanged", { columnGroups: this.columnGroupsValue });
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
        const t = new Map(this.state.columnDefs.map((r) => [r.field, r])), s = [];
        for (const r of e.cols) {
          const l = t.get(r.field);
          l && (r.width != null && (l.width = r.width), l.pinned = r.pinned || void 0, l.hidden = !!r.hidden, t.delete(r.field), s.push(l));
        }
        for (const r of t.values()) s.push(r);
        this.state.columnDefs = s;
      }
      if (Array.isArray(e.rowGroupCols) && (this.state.group.cols = e.rowGroupCols.slice()), e.pivot && typeof e.pivot == "object" && (this.state.pivot.cols = Array.isArray(e.pivot.cols) ? e.pivot.cols.slice() : [], this.state.pivot.mode = !!e.pivot.mode), Array.isArray(e.values)) {
        const t = {};
        for (const { field: s, aggFunc: r } of e.values) s && r && (t[s] = r);
        this.state.group.aggs = t;
      }
      Array.isArray(e.columnGroups) && (this.columnGroupsValue = e.columnGroups), typeof e.pinnedBottomRow == "boolean" && (this.pinnedBottomRowValue = e.pinnedBottomRow), Array.isArray(e.sortModel) && (this.state.sortModel = e.sortModel.slice()), e.filterModel && typeof e.filterModel == "object" && (this.state.filterModel = { ...e.filterModel }), typeof e.quickFilter == "string" && (this.state.quickFilter = e.quickFilter);
      for (const t of ["columns", "group", "pivot", "sort", "filter", "data"])
        this.scheduleRender(t);
      C(this.element, "grid:columnStateApplied", { state: e });
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
    for (const t of ge) this.element.addEventListener(t, e);
    this._persistBeforeUnload = () => {
      this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
    }, window.addEventListener("beforeunload", this._persistBeforeUnload);
  }
  _teardownPersistence() {
    if (this._persistListener) {
      for (const e of ge) this.element.removeEventListener(e, this._persistListener);
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
    const r = `__g:${e.groupId}`;
    let l = s.get(r);
    return l || (l = f("tr")), l.dataset.rowId = r, l.dataset.group = "true", l.dataset.groupLevel = String(e.level), l.className = "sg-group-row", this._renderGroupRow(l, e, t), l;
  }
  _renderGroupRow(e, t, s) {
    e.innerHTML = "";
    const r = this._pinOffsets(), l = this._isGroupExpanded(t.groupId, t.level), a = (this.state.group.displayType || "singleColumn") === "singleColumn", o = !!(this.state.pivot?.mode && this._displayList?.pivot), d = t.__pivotAll === !0, c = s.filter((p) => !p._isRowNumber && !p._isCheckbox && !p._isGroupCol), h = c.some((p) => p.field === t.field) ? t.field : c[0]?.field, u = Math.max(0, t.level);
    d && e.classList.add("sg-pivot-all-row");
    for (const p of s) {
      const g = f("td", { "data-col-id": p.field, "data-pinned": p.pinned || null });
      if (p.pinned === "left" ? g.style.left = r.left[p.field] + "px" : p.pinned === "right" && (g.style.right = r.right[p.field] + "px"), p._isRowNumber || p._isCheckbox) {
        g.classList.add(p._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(g);
        continue;
      }
      if (o || a ? p._isGroupCol : p.field === h) {
        if (g.classList.add("sg-group-cell"), g.style.paddingLeft = `${8 + u * 18}px`, !d) {
          const v = f("span", {
            class: "sg-group-caret",
            "data-expanded": l ? "true" : "false",
            "aria-hidden": "true"
          });
          v.innerHTML = j, g.appendChild(v);
        }
        g.append(
          f("span", { class: "sg-group-label" }, this._groupValueLabel(t)),
          f("span", { class: "sg-group-count" }, ` (${t.count})`)
        );
      } else if (o && p._isPivot) {
        const v = T(t, p);
        v != null && (g.classList.add("sg-agg-cell"), g.textContent = this._formatAggregate(v));
      } else !p._isGroupCol && t.aggregates && t.aggregates[p.field] != null && (g.classList.add("sg-agg-cell"), g.textContent = this._formatAggregate(t.aggregates[p.field]));
      e.appendChild(g);
    }
  }
  _groupValueLabel(e) {
    const t = e.value;
    if (t == null || t === "") return "(Blanks)";
    const s = this._colByField(e.field);
    return s ? k({ [e.field]: t }, s) : String(t);
  }
  _formatAggregate(e) {
    return e == null ? "" : typeof e == "number" ? Number.isInteger(e) ? String(e) : String(Math.round(e * 100) / 100) : String(e);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, t) {
    if (e.cellEditor) {
      const r = de(e.cellEditor);
      if (r) {
        const l = r.matches?.("input,select,textarea") ? r : r.querySelector?.("[data-editor-input]") || r.querySelector?.("input,select,textarea");
        return l && (this._seedEditorValue(l, e, t), l.addEventListener("keydown", this._onEditorKey), l.addEventListener("blur", this._onEditorBlur)), { node: r, control: l };
      }
    }
    const s = this._buildEditorInput(e, t);
    return { node: s, control: s };
  }
  _seedEditorValue(e, t, s) {
    if (t.type === "date" && s) {
      const r = s instanceof Date ? s : new Date(s);
      e.value = Number.isNaN(r?.getTime?.()) ? s ?? "" : r.toISOString().slice(0, 10);
    } else if (t.type === "datetime" && s) {
      const r = s instanceof Date ? s : new Date(s);
      if (Number.isNaN(r?.getTime?.()))
        e.value = s ?? "";
      else {
        const l = r.getTimezoneOffset() * 6e4;
        e.value = new Date(r.getTime() - l).toISOString().slice(0, 16);
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
    if (e.type === "number") s = f("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const r = t instanceof Date ? t : t ? new Date(t) : null, l = r ? r.toISOString().slice(0, 10) : "";
      s = f("input", { type: "date", value: l });
    } else if (e.type === "datetime") {
      const r = t instanceof Date ? t : t ? new Date(t) : null;
      let l = "";
      if (r && !Number.isNaN(r.getTime())) {
        const a = r.getTimezoneOffset() * 6e4;
        l = new Date(r.getTime() - a).toISOString().slice(0, 16);
      }
      s = f("input", { type: "datetime-local", value: l });
    } else if (e.type === "color") {
      const r = /^#[0-9a-f]{6}$/i.test(String(t ?? "")) ? t : "#000000";
      s = f("input", { type: "color", value: r });
    } else e.type === "email" ? s = f("input", { type: "email", value: t ?? "" }) : e.type === "url" ? s = f("input", { type: "url", value: t ?? "" }) : e.type === "tel" ? s = f("input", { type: "tel", value: t ?? "" }) : e.type === "boolean" ? (s = f("select"), s.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : s = f("input", { type: "text", value: t ?? "" });
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
    const s = this.state.serverSide ? this.state.serverRowCount : this.state.rowData.length, r = this._displayList.grouped ? this._displayList.leafCount ?? this.filteredCount() : this.filteredCount();
    e.appendChild(this._statusPanel(
      "Rows",
      this._fmtInt(r),
      r !== s ? `of ${this._fmtInt(s)}` : null
    ));
    const l = this.state.selection.size;
    l > 0 && e.appendChild(this._statusPanel("Selected", this._fmtInt(l))), t.replaceChildren();
    const a = this.getRangeAggregates();
    if (a && a.count > 0) {
      const d = (this.statusBarAggsValue || []).filter((c) => c in a);
      for (const c of d) {
        const h = a[c];
        h == null && c !== "count" || t.appendChild(this._statusPanel(this._aggLabel(c), this._fmtAgg(c, h)));
      }
    }
    const o = a ? `${a.count}|${a.sum}|${a.avg}|${a.min}|${a.max}` : "";
    o !== this._lastRangeAggs && (this._lastRangeAggs = o, C(this.element, "grid:rangeAggsChanged", { aggs: a }));
  }
  _statusPanel(e, t, s = null) {
    const r = f("div", { class: "sg-status-panel" });
    return r.append(
      f("span", { class: "sg-status-label" }, `${e}:`),
      f("span", { class: "sg-status-value" }, t)
    ), s && r.appendChild(f("span", { class: "sg-status-aside" }, s)), r;
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
        for (let r = s.r0; r <= s.r1; r++) {
          const l = s.rows[r];
          if (!(!l || l.__sgGroup || l.__sgDetail || l.__sgSeparator))
            for (let a = s.c0; a <= s.c1; a++) {
              const o = s.cols[a];
              !o || o._isCheckbox || o._isRowNumber || o._isGroupCol || o._isMasterExpand || e.push(T(l, o));
            }
        }
    }
    return e;
  }
  getRangeAggregates() {
    return this.state.cellSel.ranges.length ? vt(this._cellRangeRawValues()) : null;
  }
  _showColumnMenu(e, t, s) {
    this._closeColumnMenu();
    const r = this._columnMenuItems(e), l = f("div", { class: "sg-column-menu", role: "menu" });
    for (const d of r) {
      if (d === "separator") {
        l.appendChild(f("div", { class: "sg-column-menu-separator", role: "separator" }));
        continue;
      }
      const c = f("button", {
        type: "button",
        class: "sg-column-menu-item" + (d.active ? " sg-column-menu-active" : ""),
        role: "menuitem"
      });
      c.append(
        f("span", { class: "sg-column-menu-label" }, d.label)
      ), d.active && c.append(f("span", { class: "sg-column-menu-check", "aria-hidden": "true" }, "✓")), c.addEventListener("click", () => {
        d.action(), this._closeColumnMenu();
      }), l.appendChild(c);
    }
    document.body.appendChild(l);
    const a = l.offsetWidth || 220, o = l.offsetHeight || 280;
    l.style.left = `${Math.min(t, window.innerWidth - a - 4)}px`, l.style.top = `${Math.min(s, window.innerHeight - o - 4)}px`, this._columnMenu = l, setTimeout(() => {
      document.addEventListener("mousedown", this._onDocMouseDownColumnMenu), document.addEventListener("keydown", this._onColumnMenuKey), window.addEventListener("resize", this._closeColumnMenuBound = () => this._closeColumnMenu(), { once: !0 }), window.addEventListener("scroll", this._closeColumnMenuBound, { once: !0, capture: !0 });
    }, 0), C(this.element, "grid:columnMenuOpened", { colId: e.field });
  }
  _closeColumnMenu() {
    this._columnMenu && (this._columnMenu.remove(), this._columnMenu = null, document.removeEventListener("mousedown", this._onDocMouseDownColumnMenu), document.removeEventListener("keydown", this._onColumnMenuKey), this._closeColumnMenuBound && (window.removeEventListener("resize", this._closeColumnMenuBound), window.removeEventListener("scroll", this._closeColumnMenuBound, { capture: !0 }), this._closeColumnMenuBound = null));
  }
  // Build the menu item list for `col` based on the current grid state. Each
  // item is { label, action, active? } or the string 'separator'. Items are
  // emitted only when they make sense (e.g. "Unpin" doesn't show on an
  // unpinned col), so the menu stays short.
  _columnMenuItems(e) {
    const t = this.element.gridApi, s = e.headerName || e.field, r = this.state.group.cols.includes(e.field), l = this.state.pivot.cols.includes(e.field), a = this.state.group.aggs[e.field], o = e.type === "number", d = [];
    if (e.pinned !== "left" && d.push({ label: "Pin left", action: () => t.setColumnPinned(e.field, "left") }), e.pinned !== "right" && d.push({ label: "Pin right", action: () => t.setColumnPinned(e.field, "right") }), e.pinned && d.push({ label: "Unpin", action: () => t.setColumnPinned(e.field, null) }), d.push("separator"), d.push({ label: "Autosize this column", action: () => t.autoSizeColumn(e.field) }), d.push({ label: "Autosize all columns", action: () => t.autoSizeAllColumns() }), d.push("separator"), d.push(r ? { label: `Ungroup ${s}`, action: () => t.removeRowGroupColumn(e.field) } : { label: `Group by ${s}`, action: () => t.addRowGroupColumn(e.field) }), d.push(l ? { label: `Remove ${s} from pivot`, action: () => t.removePivotColumn(e.field) } : { label: `Pivot by ${s}`, action: () => {
      t.isPivotMode() || t.setPivotMode(!0), t.addPivotColumn(e.field);
    } }), o || a) {
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
    const r = t.dataset.colId, l = this._colByField(r);
    return l && l.acceptFiles === !1 ? null : { td: t, tr: s, colId: r, rowId: this._coerceRowId(s.dataset.rowId), col: l };
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
    const r = e.target.closest?.('[data-tree-toggle="true"]');
    if (r && t.contains(r)) {
      const d = this._coerceRowId(t.dataset.rowId);
      this.toggleTreeRow(d);
      return;
    }
    if (e.target.closest('td[data-editing="true"]')) return;
    const l = this._coerceRowId(t.dataset.rowId), a = e.target.closest("td");
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(l, "toggle");
      return;
    }
    if (a && a.dataset.gutter === "true") {
      if (this._rowDragMoved) {
        this._rowDragMoved = !1;
        return;
      }
      if (this.rowSelectionValue !== "") {
        const d = e.shiftKey ? "range" : e.metaKey || e.ctrlKey ? "toggle" : "replace";
        this.clearCellSelection(), this.toggleRowSelection(l, d), C(this.element, "grid:rowClicked", { rowId: l, row: this.state.rowData.find((c) => this._rowId(c) === l), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (a) {
      const d = this.state.rowData.find((h) => this._rowId(h) === l), c = a.dataset.colId;
      C(this.element, "grid:cellClicked", { rowId: l, colId: c, value: d?.[c], event: e });
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
    const o = e.shiftKey ? "range" : e.metaKey || e.ctrlKey || this.rowMultiSelectWithClickValue ? "toggle" : "replace";
    this.toggleRowSelection(l, o), C(this.element, "grid:rowClicked", { rowId: l, row: this.state.rowData.find((d) => this._rowId(d) === l), event: e });
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
    const t = Array.from(this.state.selection).map(String), s = new Set(t.includes(String(e)) ? t : [String(e)]), r = f("div", { class: "sg-drag-ghost sg-grid" }), l = f("table"), a = f("tbody");
    let o = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((c) => {
      if (s.has(c.dataset.rowId) && o < 6) {
        const h = c.cloneNode(!0);
        h.removeAttribute("data-selected"), h.querySelectorAll("td").forEach((u) => {
          u.style.left = "", u.style.right = "", u.removeAttribute("data-pinned"), u.removeAttribute("data-cell-active"), u.removeAttribute("data-cell-range");
        }), a.appendChild(h), o += 1;
      }
    }), l.appendChild(a), r.appendChild(l), s.size > o && r.appendChild(f("div", { class: "sg-drag-ghost-more" }, `+${s.size - o} more rows`)), r.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(r);
    const d = f("div", { class: "sg-drop-indicator" });
    document.body.appendChild(d), this._rowDrag = { ids: s, ghost: r, indicator: d, dropRowId: null, dropBefore: !0 }, document.body.classList.add("sg-row-dragging");
  }
  _updateDropIndicator(e) {
    const t = Array.from(this._tbody.querySelectorAll("tr[data-row-id]"));
    let s = null, r = !0;
    for (const d of t) {
      const c = d.getBoundingClientRect();
      if (e < c.top + c.height / 2) {
        s = d, r = !0;
        break;
      }
      s = d, r = !1;
    }
    if (!s) return;
    const l = s.getBoundingClientRect(), a = this._viewport.getBoundingClientRect(), o = this._rowDrag.indicator;
    o.style.left = `${a.left}px`, o.style.width = `${a.width}px`, o.style.top = `${(r ? l.top : l.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(s.dataset.rowId), this._rowDrag.dropBefore = r;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: s, dropRowId: r, dropBefore: l } = this._rowDrag;
    if (t.remove(), s.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, r == null || e.has(String(r))) return;
    const a = this.state.rowData, o = a.filter((h) => e.has(String(this._rowId(h)))), d = a.filter((h) => !e.has(String(this._rowId(h))));
    let c = d.findIndex((h) => this._rowId(h) === r);
    c < 0 ? c = d.length : l || (c += 1), d.splice(c, 0, ...o), this.state.rowData = d, this.state.sortModel = [], this.scheduleRender("data"), C(this.element, "grid:rowDragEnd", {
      ids: o.map((h) => this._rowId(h)),
      toRowId: r,
      before: l
    });
  }
  // Toggle the active/range data-attrs on the existing cell DOM without
  // rebuilding the tbody (so in-flight mouse interactions aren't disrupted).
  _applyCellSelHighlight() {
    const e = this._computeCellSelKeys();
    this._selKeys = e, this._tbody && (this._tbody.querySelectorAll("td[data-col-id]").forEach((t) => {
      const s = t.parentElement, r = `${s && s.dataset.rowId}:${t.dataset.colId}`;
      e.active === r ? t.setAttribute("data-cell-active", "true") : t.removeAttribute("data-cell-active"), e.range && e.range.has(r) ? t.setAttribute("data-cell-range", "true") : t.removeAttribute("data-cell-range");
    }), this._renderStatusBar());
  }
  // Rectangle (display indices) for a {anchor,focus} range, or null.
  _rangeRect(e) {
    if (!e) return null;
    const t = this._displayList.pageRows, s = this._visibleCols(), r = (h) => t.findIndex((u) => this._rowId(u) === h), l = (h) => s.findIndex((u) => u.field === h), a = r(e.anchor.rowId), o = l(e.anchor.colId);
    if (a < 0 || o < 0) return null;
    const d = r(e.focus.rowId), c = l(e.focus.colId);
    return {
      r0: Math.min(a, d < 0 ? a : d),
      r1: Math.max(a, d < 0 ? a : d),
      c0: Math.min(o, c < 0 ? o : c),
      c1: Math.max(o, c < 0 ? o : c),
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
      const r = e.rows[s];
      if (!r) continue;
      const l = [];
      for (let a = e.c0; a <= e.c1; a++) {
        const o = e.cols[a];
        o && l.push(k(r, o));
      }
      t.push(l);
    }
    return t;
  }
  // Active cell key + union of all ranges' cells (active stays outlined, unfilled).
  _computeCellSelKeys() {
    const e = this._activeCell();
    if (!e) return { active: null, range: null };
    const t = `${e.rowId}:${e.colId}`, s = /* @__PURE__ */ new Set();
    for (const r of this.state.cellSel.ranges) {
      const l = this._rangeRect(r);
      if (l)
        for (let a = l.r0; a <= l.r1; a++) {
          const o = l.rows[a];
          if (o)
            for (let d = l.c0; d <= l.c1; d++) {
              const c = l.cols[d];
              if (!c) continue;
              const h = `${this._rowId(o)}:${c.field}`;
              h !== t && s.add(h);
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
        for (let r = s.r0; r <= s.r1; r++) {
          const l = s.rows[r];
          l && e.add(this._rowId(l));
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
    const r = this._displayList.pageRows, l = this._navCols();
    if (!r.length || !l.length) return;
    const a = (u, p, g) => Math.max(p, Math.min(u, g)), o = this._activeCell(), d = () => r.findIndex((u) => !u.__sgGroup && !u.__sgDetail && !u.__sgSeparator);
    let c = o ? r.findIndex((u) => this._rowId(u) === o.rowId) : d(), h = o ? l.findIndex((u) => u.field === o.colId) : 0;
    if (c < 0 && (c = d()), !(c < 0)) {
      if (h < 0 && (h = 0), s && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const u = this.state.cellSel.ranges[this.state.cellSel.activeIdx], p = a(r.findIndex((m) => this._rowId(m) === u.focus.rowId) + e, 0, r.length - 1), g = a(l.findIndex((m) => m.field === u.focus.colId) + t, 0, l.length - 1);
        this._extendActiveRange({ rowId: this._rowId(r[p]), colId: l[g].field });
      } else {
        let u = a(c + e, 0, r.length - 1);
        if (e !== 0) {
          for (; r[u] && (r[u].__sgGroup || r[u].__sgDetail || r[u].__sgSeparator); ) {
            const g = u + e;
            if (g < 0 || g >= r.length) break;
            u = g;
          }
          if (!r[u] || r[u].__sgGroup || r[u].__sgDetail || r[u].__sgSeparator) return;
        }
        const p = a(h + t, 0, l.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(r[u]), colId: l[p].field });
      }
      this._applyCellSelHighlight(), this._scrollActiveIntoView(), C(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
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
    }, this._applyCellSelHighlight(), C(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
  }
  // Clear the value of every selected, editable cell (Delete/Backspace).
  _clearSelectedCells() {
    let e = !1;
    for (const t of this.state.cellSel.ranges) {
      const s = this._rangeRect(t);
      if (s)
        for (let r = s.r0; r <= s.r1; r++) {
          const l = s.rows[r];
          if (!(!l || l.__sgGroup || l.__sgDetail || l.__sgSeparator))
            for (let a = s.c0; a <= s.c1; a++) {
              const o = s.cols[a];
              if (!o || !o.editable || o._isCheckbox || o._isRowNumber) continue;
              const d = l[o.field];
              d === "" || d == null || (l[o.field] = "", e = !0, C(this.element, "grid:cellValueChanged", { rowId: this._rowId(l), colId: o.field, oldValue: d, newValue: "" }));
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
    const r = this._coerceRowId(t.dataset.rowId), l = s.dataset.colId;
    this.startEditingCell(r, l);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const s = this._visibleCols().filter((u) => u.editable && !u._isCheckbox), r = this._displayList.pageRows, l = r.findIndex((u) => this._rowId(u) === t.rowId), a = s.findIndex((u) => u.field === t.colId);
    if (!s.length || !r.length || l < 0 || a < 0) {
      this.stopEditing(!1);
      return;
    }
    const o = r.length * s.length, d = (l * s.length + a + e + o) % o, c = r[Math.floor(d / s.length)], h = s[d % s.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(c), h.field), requestAnimationFrame(() => {
      this._navigatingEditor = !1;
    });
  }
  // Wire editor listeners whenever a cell mounts an input.
  // Done lazily via MutationObserver on tbody (cheap because tbody is small per page).
  // ----- Helpers -----
  _visibleCols() {
    const e = this.state.columnDefs.filter((o) => !o.hidden), t = this.state.group?.cols || [], s = this.masterDetailValue && !this.state.pivot?.mode && !t.length;
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
      const o = new Set(t);
      return [{
        field: "__group",
        headerName: "Group",
        _isGroupCol: !0,
        width: 240,
        sortable: !1,
        filter: null,
        resizable: !1
      }, ...e.filter((c) => !o.has(c.field))];
    }
    if (this.groupReorderColumnsValue === !1) return e;
    const l = t.map((o) => e.find((d) => d.field === o)).filter(Boolean), a = new Set(l);
    return [...l, ...e.filter((o) => !a.has(o))];
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
      const r = this._rowId(s);
      this._isDetailExpanded(r) && t.push({ __sgDetail: !0, master: s, masterId: r });
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
    const s = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    C(this.element, "grid:detailRowExpanded", { rowId: e, masterRow: s });
  }
  collapseDetailRow(e) {
    if (!this.masterDetailValue) return;
    const t = String(e);
    if (!this._detailExpanded.has(t)) return;
    this._detailExpanded.delete(t), this._detailGrids.delete(t), this.scheduleRender("cells");
    const s = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    C(this.element, "grid:detailRowCollapsed", { rowId: e, masterRow: s });
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
    const r = this.state.rowData.find((l) => String(this._rowId(l)) === t);
    C(this.element, s ? "grid:treeRowCollapsed" : "grid:treeRowExpanded", { rowId: e, row: r });
  }
  expandTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !0), this.scheduleRender("tree");
    const s = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    C(this.element, "grid:treeRowExpanded", { rowId: e, row: s });
  }
  collapseTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (!this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !1), this.scheduleRender("tree");
    const s = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    C(this.element, "grid:treeRowCollapsed", { rowId: e, row: s });
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
    this.treeDataValue !== t && (this.treeDataValue = t, this.state.tree.enabled = t, t || this._treeExpanded.clear(), this.scheduleRender("tree"), C(this.element, "grid:treeDataChanged", { treeData: t }));
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
    return e || this._visibleCols().find((r) => !r._isCheckbox && !r._isRowNumber && !r._isGroupCol && !r._isMasterExpand)?.field || null;
  }
  // Build the detail <tr>: one cell spanning the full visible width, holding a
  // padded shell that hosts either a cloned <template> or a default summary
  // pulled from the master row.
  _buildDetailRow(e, t, s) {
    const r = `__d:${e.masterId}`;
    let l = s.get(r);
    const a = String(e.masterId);
    if (l) {
      if (l.getAttribute("data-master-id") === a)
        return l.classList.remove("sg-spacer"), l;
      l = null;
    }
    l || (l = f("tr")), l.className = "sg-detail-row", l.dataset.rowId = r, l.setAttribute("data-master-id", a), l.innerHTML = "";
    const o = f("td", { colspan: String(t.length || 1), class: "sg-detail-cell" }), d = f("div", { class: "sg-detail-shell" });
    return d.style.minHeight = `${this.detailRowHeightValue}px`, o.appendChild(d), l.appendChild(o), this._populateDetailShell(d, e.master, e.masterId), l;
  }
  // Fill the detail shell. Strategy: if the grid has a detail-template value
  // pointing at an existing <template>, clone its content and run a tiny
  // data-bind pass keyed off the master row. Otherwise render a minimal
  // fallback so the panel still appears (handy when the user is wiring up
  // their first detail panel and hasn't authored a template yet).
  _populateDetailShell(e, t, s) {
    const r = this.detailTemplateValue;
    let l;
    if (r) {
      const o = document.getElementById(r);
      if (o && o.tagName === "TEMPLATE") {
        const d = o.content.cloneNode(!0);
        this._applyDetailBindings(d, t), e.appendChild(d), l = e;
      }
    }
    if (!l) {
      const o = f("div", { class: "sg-detail-fallback" }), d = Object.keys(t || {}).filter((c) => !c.startsWith("_") && !c.startsWith("__")).slice(0, 6);
      for (const c of d)
        o.append(
          f("span", { class: "sg-detail-fallback-label" }, `${c}: `),
          f("span", { class: "sg-detail-fallback-value" }, String(t[c] ?? "")),
          f("span", { class: "sg-detail-fallback-sep" }, "  ·  ")
        );
      o.lastElementChild?.remove(), e.appendChild(o);
    }
    const a = e.querySelector('[data-controller~="grid"]');
    a && this._seedNestedGrid(a, t, s), queueMicrotask(() => {
      C(this.element, "grid:detailRowMounted", {
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
    e.querySelectorAll("[data-detail-bind], [data-detail-bind-attr], [data-detail-if]").forEach((r) => {
      if (r.hasAttribute("data-detail-if")) {
        const l = r.getAttribute("data-detail-if");
        if (!t[l]) {
          r.remove();
          return;
        }
      }
      if (r.hasAttribute("data-detail-bind")) {
        const l = r.getAttribute("data-detail-bind");
        r.textContent = t[l] == null ? "" : String(t[l]);
      }
      if (r.hasAttribute("data-detail-bind-attr")) {
        const l = r.getAttribute("data-detail-bind-attr"), [a, o] = l.split(":");
        a && o && r.setAttribute(a, t[o] == null ? "" : String(t[o]));
      }
    });
  }
  // Seed a nested grid with the master row's detail rows before its controller
  // boots, so its first render shows the right data without an extra round
  // through scheduleRender. Cache the inner gridApi once it appears so the
  // outer grid can refresh it later if the master data is updated.
  _seedNestedGrid(e, t, s) {
    const r = this.detailRowsKeyValue;
    if (r) {
      const l = t?.[r];
      if (Array.isArray(l))
        try {
          e.setAttribute("data-grid-row-data-value", JSON.stringify(l));
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
    for (const l of e)
      l.pinned === "left" && (t[l.field] = s, s += l.width || 150);
    const r = {};
    s = 0;
    for (let l = e.length - 1; l >= 0; l--) {
      const a = e[l];
      a.pinned === "right" && (r[a.field] = s, s += a.width || 150);
    }
    return { left: t, right: r };
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
M(re, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: fe },
  rowHeight: { type: Number, default: _s },
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
function ys(i, n) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (i[t] !== n[t]) return !1;
  return !0;
}
function bs(i) {
  return i === "number" || i === "date" ? [
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "lessThan", label: "Less than" },
    { value: "greaterThan", label: "Greater than" },
    { value: "inRange", label: "In range" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" }
  ] : i === "boolean" ? [
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
function Cs(i, n) {
  if (n === "number") {
    const e = Number(i);
    return Number.isFinite(e) ? e : i;
  }
  if (n === "date") return i;
  if (n === "datetime") {
    if (!i) return i;
    const e = new Date(i);
    return Number.isNaN(e.getTime()) ? i : e.toISOString();
  }
  return n === "boolean" ? i === "true" ? !0 : i === "false" ? !1 : null : i;
}
function $(i) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(i)) : String(i).replace(/["\\\n\r]/g, (n) => "\\" + n);
}
class le extends P {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    M(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, s = e.clientY;
      let r = !1;
      const l = (o) => {
        const d = Math.abs(o.clientX - t), c = Math.abs(o.clientY - s);
        !r && (d > 5 || c > 5) && (r = !0, document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", a), this._beginReorder(t));
      }, a = (o) => {
        document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", a), r || this.sort(o);
      };
      document.addEventListener("mousemove", l), document.addEventListener("mouseup", a);
    });
  }
  connect() {
    if (this.grid = Vt(this.element, "grid", this.application), !!this.grid) {
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
    return this.acceptFilesValue === "true" ? e = !0 : this.acceptFilesValue === "false" && (e = !1), {
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
      _isCheckbox: this.checkboxValue,
      _isRowNumber: this.rowNumberValue,
      acceptFiles: e,
      sortable: this.rowNumberValue ? !1 : this.sortableValue,
      resizable: this.rowNumberValue ? !1 : this.resizableValue
    };
  }
  _beginReorder(e) {
    if (!this.grid) return;
    const t = this.element.parentElement, s = Array.from(t.children), r = s.indexOf(this.element);
    let l = r;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const a = (d) => {
      const c = d.clientX;
      let h = s.length;
      for (let u = 0; u < s.length; u++) {
        const p = s[u].getBoundingClientRect();
        if (c < p.left + p.width / 2) {
          h = u;
          break;
        }
      }
      l = h > r ? h - 1 : h;
    }, o = () => {
      document.removeEventListener("mousemove", a), document.removeEventListener("mouseup", o), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", l !== r && this.grid.moveColumn(this.fieldValue, l);
    };
    document.addEventListener("mousemove", a), document.addEventListener("mouseup", o);
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
    const t = e.clientX, s = this.element.offsetWidth, r = (a) => this.grid.setColumnWidth(this.fieldValue, s + (a.clientX - t)), l = () => {
      document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", l), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", r), document.addEventListener("mouseup", l), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
M(le, "values", {
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
  checkbox: { type: Boolean, default: !1 },
  rowNumber: { type: Boolean, default: !1 },
  // gutter: shows 1-based row number, click selects row
  // Per-column opt-out for drag-to-attach. Defaults to undefined (inherits
  // the grid-wide acceptFiles setting); explicit false suppresses the drop
  // visual + grid:fileAttached event for this column.
  acceptFiles: { type: String, default: "" }
  // '' | 'true' | 'false'
});
class rt extends P {
  connect() {
  }
}
class lt extends P {
  connect() {
  }
}
class at extends P {
  connect() {
  }
}
class Z extends P {
  constructor() {
    super(...arguments);
    M(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), s = e.paginationGetTotalPages(), r = e.paginationGetRowCount(), l = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const a = r === 0 ? 0 : t * l + 1, o = Math.min(r, a + l - 1);
        this.pageInfoTarget.textContent = r === 0 ? "0 rows" : `${a}–${o} of ${r}`;
      }
      this.hasFirstTarget && (this.firstTarget.disabled = t === 0), this.hasPrevTarget && (this.prevTarget.disabled = t === 0), this.hasNextTarget && (this.nextTarget.disabled = t >= s - 1), this.hasLastTarget && (this.lastTarget.disabled = t >= s - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(l));
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
M(Z, "outlets", ["grid"]), M(Z, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
const te = ["sum", "avg", "count", "min", "max"], Ss = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', xs = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class ot extends P {
  connect() {
    this.grid = this.element.closest(".sg-grid"), this._activeTab = "columns", this._collapsed = !1, this._build(), this.grid?.gridApi ? this._render() : this.grid && this.grid.addEventListener("grid:ready", () => this._render(), { once: !0 }), this._gridListener = () => this._render();
    for (const n of [
      "grid:columnRowGroupChanged",
      "grid:columnPivotChanged",
      "grid:columnValueChanged",
      "grid:pivotModeChanged",
      "grid:columnVisible",
      "grid:rowDataChanged",
      "grid:columnStateApplied"
    ]) this.grid?.addEventListener(n, this._gridListener);
  }
  disconnect() {
    if (!(!this.grid || !this._gridListener))
      for (const n of [
        "grid:columnRowGroupChanged",
        "grid:columnPivotChanged",
        "grid:columnValueChanged",
        "grid:pivotModeChanged",
        "grid:columnVisible",
        "grid:rowDataChanged",
        "grid:columnStateApplied"
      ]) this.grid.removeEventListener(n, this._gridListener);
  }
  // ----- Skeleton -----
  _build() {
    this.element.innerHTML = "", this._content = f("div", { class: "sg-side-panel-content" });
    const n = f("div", { class: "sg-side-panel-tabs" });
    this._columnsTab = f("button", {
      type: "button",
      class: "sg-side-panel-tab",
      "aria-pressed": "true",
      title: "Columns"
    }), this._columnsTab.innerHTML = Ss, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), n.appendChild(this._columnsTab), this.element.append(this._content, n);
  }
  _onTabClick(n) {
    this._activeTab === n && !this._collapsed ? (this._collapsed = !0, this.element.classList.add("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", "false")) : (this._collapsed = !1, this._activeTab = n, this.element.classList.remove("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", n === "columns" ? "true" : "false"), this._render());
  }
  // ----- Helpers -----
  _api() {
    return this.grid?.gridApi;
  }
  // Real (non-synthetic) columns the user can manipulate.
  _columns() {
    return (this._api()?.getColumnDefs() || []).filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol && !e._isPivot);
  }
  _colByField(n) {
    return (this._api()?.getColumnDefs() || []).find((e) => e.field === n);
  }
  // ----- Render -----
  _render() {
    if (this._collapsed || this._activeTab !== "columns") return;
    const n = this._api();
    if (!n) return;
    this._content.innerHTML = "";
    const e = f("label", { class: "sg-panel-pivot-toggle" }), t = f("input", { type: "checkbox" });
    t.checked = n.isPivotMode(), t.addEventListener("change", () => n.setPivotMode(t.checked)), e.append(t, f("span", {}, "Pivot mode")), this._content.appendChild(e), this._content.appendChild(this._renderColumnsList()), this._content.appendChild(this._renderDropSection({
      title: "Row Groups",
      placeholder: "Drag here to group rows",
      kind: "rowGroup",
      fields: n.getRowGroupColumns()
    })), this._content.appendChild(this._renderValuesSection()), n.isPivotMode() && this._content.appendChild(this._renderDropSection({
      title: "Column Labels",
      placeholder: "Drag here to pivot columns",
      kind: "pivot",
      fields: n.getPivotColumns()
    }));
  }
  _renderColumnsList() {
    const n = this._api(), e = f("div", { class: "sg-panel-section" });
    e.appendChild(f("div", { class: "sg-panel-section-title" }, "Columns"));
    const t = f("ul", { class: "sg-column-list" });
    e.appendChild(t);
    const s = new Set(n.getRowGroupColumns()), r = new Set(n.getPivotColumns()), l = new Map(n.getValueColumns().map((a) => [a.field, a.aggFunc]));
    for (const a of this._columns()) {
      const o = f("li", { class: "sg-column-list-item", draggable: "true" });
      o.dataset.field = a.field;
      const d = f("span", { class: "sg-column-grip", "aria-hidden": "true" });
      d.innerHTML = xs;
      const c = f("input", { type: "checkbox" });
      c.checked = !a.hidden, c.addEventListener("change", () => n.setColumnVisible(a.field, c.checked));
      const h = f("span", { class: "sg-column-list-label" }, a.headerName || a.field), u = f("span", { class: "sg-column-list-tags" });
      s.has(a.field) && u.appendChild(f("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), r.has(a.field) && u.appendChild(f("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), l.has(a.field) && u.appendChild(f("span", { class: "sg-tag sg-tag-value", title: `Value (${l.get(a.field)})` }, l.get(a.field))), o.append(d, c, h, u), this._wireDragSource(o, a.field), t.appendChild(o);
    }
    return this._wireDropZone(t, "columns"), e;
  }
  _renderDropSection({ title: n, placeholder: e, kind: t, fields: s }) {
    const r = f("div", { class: "sg-panel-section sg-panel-drop" });
    r.appendChild(f("div", { class: "sg-panel-section-title" }, n));
    const l = f("div", { class: "sg-drop-zone" });
    if (l.dataset.dropKind = t, !s.length)
      l.classList.add("sg-drop-zone-empty"), l.appendChild(f("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const a of s) l.appendChild(this._renderChip(t, a));
    return this._wireDropZone(l, t), r.appendChild(l), r;
  }
  _renderValuesSection() {
    const n = this._api(), e = f("div", { class: "sg-panel-section sg-panel-drop" });
    e.appendChild(f("div", { class: "sg-panel-section-title" }, "Values"));
    const t = f("div", { class: "sg-drop-zone" });
    t.dataset.dropKind = "value";
    const s = n.getValueColumns();
    if (!s.length)
      t.classList.add("sg-drop-zone-empty"), t.appendChild(f("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
    else
      for (const { field: r, aggFunc: l } of s) t.appendChild(this._renderValueChip(r, l));
    return this._wireDropZone(t, "value"), e.appendChild(t), e;
  }
  _renderChip(n, e) {
    const t = this._colByField(e), s = f("span", { class: "sg-chip", draggable: "true" });
    return s.dataset.field = e, s.dataset.fromKind = n, s.append(
      f("span", { class: "sg-chip-label" }, t?.headerName || e),
      this._removeButton(() => this._removeFrom(n, e))
    ), this._wireDragSource(s, e), s;
  }
  _renderValueChip(n, e) {
    const t = this._api(), s = this._colByField(n), r = f("span", { class: "sg-chip sg-chip-value", draggable: "true" });
    r.dataset.field = n, r.dataset.fromKind = "value";
    const l = f("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return l.addEventListener("click", (a) => {
      a.stopPropagation();
      const o = te.indexOf(e), d = te[(o === -1 ? 0 : o + 1) % te.length];
      t.setColumnAggFunc(n, d);
    }), r.append(
      l,
      f("span", { class: "sg-chip-label" }, s?.headerName || n),
      this._removeButton(() => t.removeValueColumn(n))
    ), this._wireDragSource(r, n), r;
  }
  _removeButton(n) {
    const e = f("button", { type: "button", class: "sg-chip-remove", "aria-label": "Remove", title: "Remove" });
    return e.textContent = "×", e.addEventListener("click", (t) => {
      t.stopPropagation(), n();
    }), e;
  }
  // ----- DnD plumbing -----
  _wireDragSource(n, e) {
    n.addEventListener("dragstart", (t) => {
      t.dataTransfer.effectAllowed = "move", t.dataTransfer.setData("text/plain", e), n.classList.add("sg-dragging");
    }), n.addEventListener("dragend", () => n.classList.remove("sg-dragging"));
  }
  _wireDropZone(n, e) {
    n.addEventListener("dragover", (t) => {
      t.preventDefault(), t.dataTransfer.dropEffect = "move", n.classList.add("sg-drop-over");
    }), n.addEventListener("dragleave", (t) => {
      t.target === n && n.classList.remove("sg-drop-over");
    }), n.addEventListener("drop", (t) => {
      t.preventDefault(), n.classList.remove("sg-drop-over");
      const s = t.dataTransfer.getData("text/plain");
      s && this._handleDrop(e, s);
    });
  }
  // A field lives in at most one of {rowGroup, pivot, value} at a time.
  // Dropping on a zone removes it from the others first.
  _handleDrop(n, e) {
    const t = this._api();
    if (n === "columns") {
      this._removeEverywhere(e);
      return;
    }
    this._removeEverywhere(e, n), n === "rowGroup" ? t.addRowGroupColumn(e) : n === "pivot" ? t.addPivotColumn(e) : n === "value" && t.addValueColumn(e, "sum");
  }
  _removeFrom(n, e) {
    const t = this._api();
    n === "rowGroup" ? t.removeRowGroupColumn(e) : n === "pivot" ? t.removePivotColumn(e) : n === "value" && t.removeValueColumn(e);
  }
  _removeEverywhere(n, e = null) {
    const t = this._api();
    e !== "rowGroup" && t.removeRowGroupColumn(n), e !== "pivot" && t.removePivotColumn(n), e !== "value" && t.removeValueColumn(n);
  }
}
function Ls(i) {
  const n = i ?? ut.start();
  return n.register("grid", re), n.register("header-cell", le), n.register("row", rt), n.register("cell", lt), n.register("filter", at), n.register("pagination", Z), n.register("side-panel", ot), n;
}
const Rs = {
  start: Ls,
  GridController: re,
  HeaderCellController: le,
  RowController: rt,
  CellController: lt,
  FilterController: at,
  PaginationController: Z,
  SidePanelController: ot,
  registerRenderer: R,
  getRenderer: Se,
  listRenderers: It,
  renderers: ms
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = Rs);
export {
  lt as CellController,
  at as FilterController,
  re as GridController,
  le as HeaderCellController,
  Z as PaginationController,
  rt as RowController,
  ot as SidePanelController,
  Rs as default,
  Se as getRenderer,
  It as listRenderers,
  R as registerRenderer,
  ms as renderers,
  Ls as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
