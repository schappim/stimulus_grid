var Ps = Object.defineProperty;
var Vs = (t, s, e) => s in t ? Ps(t, s, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[s] = e;
var I = (t, s, e) => Vs(t, typeof s != "symbol" ? s + "" : s, e);
import { Controller as re, Application as Is } from "@hotwired/stimulus";
function z(t, s) {
  return typeof s.valueGetter == "function" ? s.valueGetter(t) : t?.[s.field];
}
function ee(t, s) {
  const e = z(t, s);
  return typeof s.valueFormatter == "function" ? s.valueFormatter(e, t) : e == null ? "" : s.type === "date" && e instanceof Date ? e.toLocaleDateString() : s.type === "boolean" ? e ? "✓" : "" : String(e);
}
const Rt = {
  contains: (t, s) => String(t ?? "").toLowerCase().includes(String(s ?? "").toLowerCase()),
  notContains: (t, s) => !String(t ?? "").toLowerCase().includes(String(s ?? "").toLowerCase()),
  equals: (t, s) => String(t ?? "").toLowerCase() === String(s ?? "").toLowerCase(),
  notEqual: (t, s) => String(t ?? "").toLowerCase() !== String(s ?? "").toLowerCase(),
  startsWith: (t, s) => String(t ?? "").toLowerCase().startsWith(String(s ?? "").toLowerCase()),
  endsWith: (t, s) => String(t ?? "").toLowerCase().endsWith(String(s ?? "").toLowerCase()),
  blank: (t) => t == null || t === "",
  notBlank: (t) => t != null && t !== ""
}, Fs = {
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
function K(t) {
  if (t == null || t === "") return null;
  if (t instanceof Date) return t;
  const s = new Date(t);
  return Number.isNaN(s.valueOf()) ? null : s;
}
const Bs = {
  equals: (t, s) => K(t)?.toDateString() === K(s)?.toDateString(),
  notEqual: (t, s) => K(t)?.toDateString() !== K(s)?.toDateString(),
  lessThan: (t, s) => (K(t)?.valueOf() ?? -1 / 0) < (K(s)?.valueOf() ?? 1 / 0),
  greaterThan: (t, s) => (K(t)?.valueOf() ?? 1 / 0) > (K(s)?.valueOf() ?? -1 / 0),
  inRange: (t, s, e) => {
    const n = K(t)?.valueOf();
    return n != null && n >= (K(s)?.valueOf() ?? -1 / 0) && n <= (K(e)?.valueOf() ?? 1 / 0);
  },
  blank: (t) => t == null || t === "",
  notBlank: (t) => t != null && t !== ""
}, Hs = {
  equals: (t, s) => s === "true" ? !!t : s === "false" ? !t : !0
}, Os = {
  in: (t, s) => Array.isArray(s) && s.includes(String(t ?? ""))
}, Gs = { text: Rt, number: Fs, date: Bs, boolean: Hs, set: Os };
function $t(t, s, e) {
  if (!e) return !0;
  const n = e.filterType || s.filter || "text", i = (Gs[n] || Rt)[e.type];
  if (!i) return !0;
  const o = z(t, s);
  return i(o, e.value, e.value2);
}
function Pt(t, s, e) {
  const n = Object.entries(s || {}).filter(([, r]) => r != null);
  return n.length === 0 ? t : t.filter((r) => r && r.__sgSeparator ? !0 : n.every(([i, o]) => {
    const a = e[i];
    return a ? $t(r, a, o) : !0;
  }));
}
function Vt(t, s, e) {
  if (!s) return t;
  const n = String(s).toLowerCase();
  return t.filter((r) => {
    if (r && r.__sgSeparator) return !0;
    for (const i of e) {
      const o = ee(r, i);
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
    const n = K(t)?.valueOf() ?? 0, r = K(s)?.valueOf() ?? 0;
    return n - r;
  }
  return e === "boolean" ? t === s ? 0 : t ? 1 : -1 : String(t).localeCompare(String(s), void 0, { numeric: !0, sensitivity: "base" });
}
function zs(t, s, e) {
  if (!s || s.length === 0) return t;
  const n = (l, c) => {
    for (const { colId: d, sort: u } of s) {
      const p = e[d];
      if (!p) continue;
      const g = z(l, p), h = z(c, p), y = typeof p.comparator == "function" ? p.comparator(g, h, l, c) : se(g, h, p.type);
      if (y !== 0) return u === "desc" ? -y : y;
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
function we(t, s) {
  if (!s || !s.enabled) return { rows: t, total: t.length, pageRows: t };
  const e = t.length, n = Math.max(1, Math.ceil(e / s.pageSize)), r = Math.min(s.page, n - 1), i = r * s.pageSize, o = t.slice(i, i + s.pageSize);
  return { rows: t, total: e, totalPages: n, page: r, pageRows: o };
}
function It(t, s, e) {
  if (t === "count") return s.length;
  const n = s.map((i) => z(i, e));
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
function Te(t, s, e) {
  const n = {};
  for (const [r, i] of Object.entries(s || {})) {
    const o = e[r];
    o && (n[r] = It(i, t, o));
  }
  return n;
}
function js(t) {
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
function Ks(t, s, e, n, r = () => !0) {
  const i = (c, d, u) => {
    const p = s[d], g = /* @__PURE__ */ new Map();
    for (const h of c) {
      const y = z(h, p), m = y == null ? "" : String(y);
      g.has(m) || g.set(m, { value: y, rows: [] }), g.get(m).rows.push(h);
    }
    return Array.from(g.values()).sort((h, y) => se(h.value, y.value, p.type)).map(({ value: h, rows: y }) => {
      const m = h == null ? "" : String(h), w = u ? `${u}|${p.field}=${m}` : `${p.field}=${m}`;
      return {
        __sgGroup: !0,
        level: d,
        field: p.field,
        value: h,
        groupId: w,
        count: y.length,
        aggregates: Te(y, n, e),
        leaves: y,
        children: d + 1 < s.length ? i(y, d + 1, w) : null
      };
    });
  }, o = i(t, 0, ""), a = [], l = (c) => {
    for (const d of c)
      if (a.push(d), !!r(d.groupId, d.level))
        if (d.children) l(d.children);
        else for (const u of d.leaves) a.push(u);
  };
  return l(o), { displayList: a, tree: o };
}
function Ft(t, s, e) {
  return `__p|${e.map((r) => {
    const i = t[r.field];
    return `${r.field}=${i == null ? "" : String(i)}`;
  }).join("|")}|${s.col.field}:${s.aggFunc}`;
}
function Bt(t, s) {
  return s.map((e) => {
    const n = z(t, e);
    return n == null ? "" : String(n);
  }).join("");
}
function qs(t, s) {
  if (!s?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const n of t) {
    const r = Bt(n, s);
    if (!e.has(r)) {
      const i = {};
      s.forEach((o) => {
        const a = z(n, o);
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
function Us(t, s, e) {
  if (!t.length || !s.length) return [];
  const n = [], r = s.length === 1;
  for (const i of t)
    for (const o of s) {
      const a = Ft(i, o, e), l = e.map((d) => i[d.field] == null ? "(Blank)" : String(i[d.field])).join(" · "), c = r ? l : `${l} · ${o.aggFunc}(${o.col.field})`;
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
function Ws(t) {
  return typeof t == "string" && t.startsWith("__p|");
}
function Ys(t, s) {
  const e = Array.isArray(t) ? t.filter((n) => n && n.colId && n.sort) : [];
  return (n, r) => {
    for (const i of e) {
      const o = i.sort === "desc" ? -1 : 1;
      if (Ws(i.colId)) {
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
function bt(t, s, e, n) {
  const r = {}, i = /* @__PURE__ */ new Map();
  for (const o of t) {
    const a = Bt(o, n);
    i.has(a) || i.set(a, []), i.get(a).push(o);
  }
  for (const o of s) {
    const a = n.map((c) => {
      const d = o[c.field];
      return d == null ? "" : String(d);
    }).join(""), l = i.get(a) || [];
    for (const c of e) {
      const d = Ft(o, c, n);
      r[d] = l.length ? It(c.aggFunc, l, c.col) : null;
    }
  }
  return r;
}
function Xs({ rows: t, rowGroupCols: s = [], pivotCols: e, valueConfigs: n, isExpanded: r = () => !0, sortModel: i = [] }) {
  const o = qs(t, e), a = Us(o, n, e), l = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: t.length,
    aggregates: {},
    leaves: t,
    __pivotValues: bt(t, o, n, e)
  };
  if (!s.length)
    return { columns: a, displayList: [l], tree: [], combos: o };
  const c = (g, h, y) => {
    const m = s[h], w = /* @__PURE__ */ new Map();
    for (const C of g) {
      const S = z(C, m), T = S == null ? "" : String(S);
      w.has(T) || w.set(T, { value: S, rows: [] }), w.get(T).rows.push(C);
    }
    const b = Array.from(w.values()).map(({ value: C, rows: S }) => {
      const T = C == null ? "" : String(C), D = y ? `${y}|${m.field}=${T}` : `${m.field}=${T}`;
      return {
        __sgGroup: !0,
        level: h,
        field: m.field,
        value: C,
        groupId: D,
        count: S.length,
        aggregates: {},
        leaves: S,
        __pivotValues: bt(S, o, n, e),
        children: h + 1 < s.length ? c(S, h + 1, D) : null
      };
    }), _ = Ys(i, m);
    return b.sort(_);
  }, d = c(t, 0, ""), u = [l], p = (g) => {
    for (const h of g)
      u.push(h), r(h.groupId, h.level) && h.children && p(h.children);
  };
  return p(d), { columns: a, displayList: u, tree: d, combos: o };
}
function Js(t, { pivotCols: s = [], valueConfigs: e = [], columnGroups: n = null } = {}) {
  if (t._isPivot && s.length && t.pivotKeys)
    return Qs(t, s, e);
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
function Qs(t, s, e) {
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
function Zs(t, s = {}) {
  if (!t.length) return { rows: [[]], depth: 1 };
  const e = t.map((i) => Js(i, s).slice()), n = Math.max(1, ...e.map((i) => i.length)), r = [];
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
        for (let u = i + 1; u < n; u++) l[u] = null;
        a += 1;
        continue;
      }
      let d = a + 1;
      for (; d < e.length; ) {
        const u = e[d];
        if (i >= u.length || !u[i] || u[i].kind !== "group" || u[i].id !== c.id) break;
        let p = !0;
        for (let g = 0; g < i; g++) {
          const h = l[g]?.id ?? null, y = u[g]?.id ?? null;
          if (h !== y) {
            p = !1;
            break;
          }
        }
        if (!p) break;
        d += 1;
      }
      o.push({ kind: "group", label: c.label, colspan: d - a, rowspan: 1 }), a = d;
    }
    r.push(o);
  }
  return { rows: r, depth: n };
}
function er({
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
    const w = e(m);
    return w == null ? null : String(w);
  }, a = /* @__PURE__ */ new Map();
  for (const m of t) {
    const w = o(m);
    w != null && a.set(w, m);
  }
  const l = /* @__PURE__ */ new Map(), c = [];
  for (const m of t) {
    const w = o(m), b = m?.[s], _ = b == null ? null : String(b);
    _ == null || _ === w || !a.has(_) ? c.push(m) : (l.has(_) || l.set(_, []), l.get(_).push(m));
  }
  const d = n ? new Map(t.map((m) => [o(m), !!n(m)])) : null, u = /* @__PURE__ */ new Map(), p = (m, w) => {
    const b = o(m);
    if (b == null) return !1;
    if (u.has(b)) return u.get(b);
    if (w.has(b)) return !1;
    w.add(b);
    let _ = !!d.get(b);
    const C = l.get(b) || [];
    for (const S of C) _ = p(S, w) || _;
    return w.delete(b), u.set(b, _), _;
  };
  if (d)
    for (const m of c) p(m, /* @__PURE__ */ new Set());
  const g = [], h = /* @__PURE__ */ new Map(), y = (m, w, b, _) => {
    const C = d ? m.filter((S) => _ || u.get(o(S))) : m.slice();
    r && C.sort(r);
    for (const S of C) {
      const T = o(S);
      if (T == null || b.has(T)) continue;
      const D = l.get(T) || [], x = _ || (d ? !!d.get(T) : !1), L = d ? D.filter((V) => x || u.get(o(V))) : D, A = L.length > 0, R = A && (d ? !0 : !!i(T, w));
      h.set(T, { level: w, hasChildren: A, expanded: R }), g.push(S), R && (b.add(T), y(L, w + 1, b, x), b.delete(T));
    }
  };
  return y(c, 0, /* @__PURE__ */ new Set(), !1), { displayList: g, treeMeta: h };
}
function tr(t) {
  if (t.serverSide) {
    const d = t.rowData, u = t.pagination?.pageSize || d.length || 1, p = t.serverRowCount ?? d.length, g = Math.max(1, Math.ceil(p / u)), h = Math.min(t.pagination?.page || 0, g - 1);
    return { filteredSorted: d, rows: d, total: p, totalPages: g, page: h, pageRows: d };
  }
  const s = Object.fromEntries(t.columnDefs.map((d) => [d.field, d])), e = t.columnDefs.filter((d) => !d.hidden && !d._isCheckbox), n = (t.rowGroupCols || []).filter((d) => s[d]);
  if (t.treeData && !t.pivotMode && n.length === 0) {
    const d = t.treeParentField || "parent_id", u = Object.entries(t.filterModel || {}).filter(([, S]) => S != null), p = t.quickFilter ? String(t.quickFilter).toLowerCase() : "", h = u.length > 0 || p !== "" ? (S) => {
      for (const [T, D] of u) {
        const x = s[T];
        if (x && !$t(S, x, D)) return !1;
      }
      if (p) {
        let T = !1;
        for (const D of e) {
          const x = ee(S, D);
          if (x && String(x).toLowerCase().includes(p)) {
            T = !0;
            break;
          }
        }
        if (!T) return !1;
      }
      return !0;
    } : null, y = Array.isArray(t.sortModel) ? t.sortModel : [], m = y.length ? (S, T) => {
      for (const { colId: D, sort: x } of y) {
        const L = s[D];
        if (!L) continue;
        const A = z(S, L), R = z(T, L), V = typeof L.comparator == "function" ? L.comparator(A, R, S, T) : se(A, R, L.type);
        if (V !== 0) return x === "desc" ? -V : V;
      }
      return 0;
    } : null, w = t.getRowId || ((S) => S?.id), { displayList: b, treeMeta: _ } = er({
      rows: t.rowData,
      parentField: d,
      getRowId: w,
      passesFilter: h,
      siblingComparator: m,
      isExpanded: t.isTreeRowExpanded || (() => !0)
    }), C = we(b, t.pagination);
    return {
      tree: !0,
      treeData: !0,
      treeMeta: _,
      treeParentField: d,
      filteredSorted: b,
      ...C
    };
  }
  let r = t.rowData;
  r = Pt(r, t.filterModel, s), r = Vt(r, t.quickFilter, e), r = zs(r, t.sortModel, s);
  const i = n, o = t.pivotMode ? (t.pivotCols || []).filter((d) => s[d]) : [], a = t.pivotMode ? Object.entries(t.aggModel || {}).filter(([d]) => s[d]).map(([d, u]) => ({ col: s[d], aggFunc: u })) : [];
  if (t.pivotMode && o.length && a.length) {
    const d = i.map((w) => s[w]), u = o.map((w) => s[w]), { columns: p, displayList: g, tree: h, combos: y } = Xs({
      rows: r,
      rowGroupCols: d,
      pivotCols: u,
      valueConfigs: a,
      isExpanded: t.isGroupExpanded,
      sortModel: t.sortModel
    }), m = we(g, t.pagination);
    return {
      pivot: !0,
      pivotResultColumns: p,
      combos: y,
      grouped: !0,
      tree: h,
      leafCount: r.length,
      grandTotals: Te(r, t.aggModel, s),
      filteredSorted: g,
      ...m
    };
  }
  if (i.length) {
    const d = i.map((h) => s[h]), { displayList: u, tree: p } = Ks(
      r,
      d,
      s,
      t.aggModel,
      t.isGroupExpanded
    ), g = we(u, t.pagination);
    return {
      grouped: !0,
      tree: p,
      leafCount: r.length,
      grandTotals: Te(r, t.aggModel, s),
      filteredSorted: u,
      ...g
    };
  }
  const l = we(r, t.pagination), c = t.aggModel && Object.keys(t.aggModel).length ? Te(r, t.aggModel, s) : null;
  return { filteredSorted: r, grandTotals: c, ...l };
}
function nr(t, s, e, n, r = 6) {
  const i = Math.ceil(s / e), o = Math.max(0, Math.floor(t / e) - r), a = Math.min(n, o + i + r * 2);
  return { first: o, last: a };
}
function sr(t) {
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
function v(t, s = {}, e = []) {
  const n = document.createElement(t);
  for (const [r, i] of Object.entries(s))
    i === !1 || i == null || (r === "class" ? n.className = i : r === "style" && typeof i == "object" ? Object.assign(n.style, i) : r.startsWith("on") && typeof i == "function" ? n.addEventListener(r.slice(2).toLowerCase(), i) : i === !0 ? n.setAttribute(r, "") : n.setAttribute(r, String(i)));
  for (const r of [].concat(e))
    r == null || r === !1 || n.appendChild(typeof r == "string" ? document.createTextNode(r) : r);
  return n;
}
function yt(t, s) {
  for (const [e, n] of Object.entries(s))
    n == null || n === !1 ? t.removeAttribute(e) : n === !0 ? t.setAttribute(e, "") : t.setAttribute(e, String(n));
}
function _t(t) {
  const s = document.getElementById(t);
  return !s || s.tagName !== "TEMPLATE" ? null : s.content.firstElementChild.cloneNode(!0);
}
function P(t, s, e) {
  t.dispatchEvent(new CustomEvent(s, { detail: e, bubbles: !0 }));
}
function rr(t, s, e) {
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
const wt = [
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
], ir = [
  21522,
  20773,
  24188,
  23371,
  17913,
  16590,
  20375,
  19104
], Me = new Uint8Array(512), st = new Uint8Array(256);
(function() {
  let s = 1;
  for (let e = 0; e < 255; e++)
    Me[e] = s, st[s] = e, s <<= 1, s & 256 && (s ^= 285);
  for (let e = 255; e < 512; e++) Me[e] = Me[e - 255];
})();
function rt(t, s) {
  return t === 0 || s === 0 ? 0 : Me[st[t] + st[s]];
}
function or(t) {
  const s = new Uint8Array(t);
  s[t - 1] = 1;
  let e = 1;
  for (let n = 0; n < t; n++) {
    for (let r = 0; r < t; r++)
      s[r] = rt(s[r], e), r + 1 < t && (s[r] ^= s[r + 1]);
    e = rt(e, 2);
  }
  return s;
}
function ar(t, s) {
  const e = new Uint8Array(s.length);
  for (const n of t) {
    const r = n ^ e[0];
    e.copyWithin(0, 1), e[e.length - 1] = 0;
    for (let i = 0; i < s.length; i++)
      e[i] ^= rt(s[i], r);
  }
  return e;
}
class lr {
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
function cr(t) {
  const s = new TextEncoder().encode(String(t));
  let e = 0;
  for (let x = 1; x <= 10; x++) {
    const A = 4 + (x < 10 ? 8 : 16) + s.length * 8, R = wt[x - 1][0] * 8;
    if (A <= R) {
      e = x;
      break;
    }
  }
  if (e === 0)
    throw new Error(`qr: data too long for v10 ECC=M (${s.length} bytes; max 213)`);
  const [n, r, i] = wt[e - 1], o = new lr();
  o.append(4, 4), o.append(s.length, e < 10 ? 8 : 16);
  for (const x of s) o.append(x, 8);
  const a = n * 8;
  o.append(0, Math.min(4, Math.max(0, a - o.bits.length)));
  const l = o.toBytes(), c = new Uint8Array(n);
  c.set(l);
  const d = [236, 17];
  for (let x = l.length; x < n; x++) c[x] = d[(x - l.length) % 2];
  const u = Math.floor(n / i), p = n - u * i, g = [], h = or(r);
  let y = 0;
  for (let x = 0; x < i; x++) {
    const L = x < i - p ? u : u + 1, A = c.slice(y, y + L);
    y += L, g.push({ data: A, ecc: ar(A, h) });
  }
  const m = [], w = u + 1;
  for (let x = 0; x < w; x++)
    for (const L of g) x < L.data.length && m.push(L.data[x]);
  for (let x = 0; x < r; x++)
    for (const L of g) m.push(L.ecc[x]);
  const b = 17 + e * 4, _ = new Uint8Array(b * b), C = new Uint8Array(b * b);
  dr(_, C, b), ur(_, C, b), fr(_, C, b, e), e >= 7 && gr(_, C, b, e), hr(_, C, b, m);
  let S = 0, T = 1 / 0;
  const D = new Uint8Array(_);
  for (let x = 0; x < 8; x++) {
    D.set(_), Ct(D, C, b, x), vt(D, b, x);
    const L = mr(D, b);
    L < T && (T = L, S = x);
  }
  return Ct(_, C, b, S), vt(_, b, S), { size: b, matrix: _ };
}
function j(t, s, e, n, r) {
  t[n * s + e] = r ? 1 : 0;
}
function dr(t, s, e) {
  const n = [[0, 0], [e - 7, 0], [0, e - 7]];
  for (const [r, i] of n)
    for (let o = -1; o <= 7; o++)
      for (let a = -1; a <= 7; a++) {
        const l = r + a, c = i + o;
        if (l < 0 || c < 0 || l >= e || c >= e) continue;
        const u = a >= 0 && a < 7 && o >= 0 && o < 7 && (a === 0 || a === 6 || o === 0 || o === 6 || // outer ring
        a >= 2 && a <= 4 && o >= 2 && o <= 4);
        j(t, e, l, c, u), s[c * e + l] = 1;
      }
  for (let r = 0; r < 9; r++)
    s[r * e + 8] = 1, s[8 * e + r] = 1;
  for (let r = 0; r < 8; r++)
    s[(e - 1 - r) * e + 8] = 1, s[8 * e + (e - 1 - r)] = 1;
  j(t, e, 8, e - 8, 1), s[(e - 8) * e + 8] = 1;
}
function ur(t, s, e) {
  for (let n = 8; n < e - 8; n++)
    j(t, e, n, 6, n % 2 === 0), j(t, e, 6, n, n % 2 === 0), s[6 * e + n] = 1, s[n * e + 6] = 1;
}
const pr = [
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
function fr(t, s, e, n) {
  const r = pr[n];
  if (r) {
    for (const i of r)
      for (const o of r)
        if (!(o === 6 && i === 6 || o === e - 7 && i === 6 || o === 6 && i === e - 7))
          for (let l = -2; l <= 2; l++)
            for (let c = -2; c <= 2; c++) {
              const d = Math.max(Math.abs(c), Math.abs(l)) !== 1;
              j(t, e, o + c, i + l, d), s[(i + l) * e + (o + c)] = 1;
            }
  }
}
function gr(t, s, e, n) {
  let r = n, i = r;
  for (let a = 0; a < 12; a++)
    i = i << 1 ^ (i >>> 11) * 7973;
  const o = r << 12 | i;
  for (let a = 0; a < 18; a++) {
    const l = o >>> a & 1, c = Math.floor(a / 3), d = a % 3 + e - 11;
    j(t, e, c, d, l), s[d * e + c] = 1, j(t, e, d, c, l), s[c * e + d] = 1;
  }
}
function vt(t, s, e) {
  const n = ir[e];
  for (let r = 0; r < 15; r++) {
    const i = (n >>> r & 1) === 1;
    r < 6 ? j(t, s, 8, r, i) : r < 8 ? j(t, s, 8, r + 1, i) : r < 9 ? j(t, s, 7, 8, i) : j(t, s, 14 - r, 8, i), r < 8 ? j(t, s, s - 1 - r, 8, i) : j(t, s, 8, s - 15 + r, i);
  }
  j(t, s, 8, s - 8, 1);
}
function hr(t, s, e, n) {
  let r = 0, i = -1;
  for (let o = e - 1; o > 0; o -= 2) {
    o === 6 && o--;
    for (let a = 0; a < e; a++) {
      const l = i < 0 ? e - 1 - a : a;
      for (let c = 0; c < 2; c++) {
        const d = o - c;
        if (s[l * e + d]) continue;
        const u = r < n.length * 8 ? n[r >>> 3] >>> 7 - (r & 7) & 1 : 0;
        t[l * e + d] = u, r++;
      }
    }
    i = -i;
  }
}
function Ct(t, s, e, n) {
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
function mr(t, s) {
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
function br({ size: t, matrix: s }, e = {}) {
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
        const u = (d + r) * n, p = (c + r) * n;
        l += `M${u},${p}h${n}v${n}h-${n}z`;
      }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a} ${a}" width="${a}" height="${a}" shape-rendering="crispEdges" aria-hidden="true"><rect width="${a}" height="${a}" fill="${i}"/><path d="${l}" fill="${o}"/></svg>`;
}
const yr = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.1 297.4z"/></svg>', at = /* @__PURE__ */ new Map();
function k(t, s) {
  if (typeof t != "string" || !t) throw new Error("registerRenderer: name must be a non-empty string");
  if (typeof s != "function") throw new Error("registerRenderer: fn must be a function");
  at.set(t, s);
}
function be(t) {
  return at.get(t) || null;
}
function _r() {
  return Array.from(at.keys());
}
function wr(t, { copy: s, parse: e } = {}) {
  return typeof s == "function" && (t.copyValue = s), typeof e == "function" && (t.parseValue = e), t;
}
const Ht = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on", "✓", "checked"]), Ot = /* @__PURE__ */ new Set(["0", "false", "f", "no", "n", "off", "✗", "unchecked", "-", "—"]);
function vr(t, s) {
  const e = String(t ?? "");
  if (e === "") return "";
  switch (s?.type) {
    case "number": {
      const n = e.replace(/[,$£€¥\s]/g, "").replace(/%$/, ""), r = Number(n);
      return Number.isFinite(r) ? r : void 0;
    }
    case "boolean": {
      const n = e.trim().toLowerCase();
      return Ht.has(n) ? !0 : Ot.has(n) ? !1 : void 0;
    }
    case "date": {
      const n = new Date(e);
      return Number.isNaN(n.valueOf()) ? void 0 : e;
    }
    default:
      return e;
  }
}
function Cr(t, s, e) {
  return e != null && e !== "" ? e : t == null ? "" : String(t);
}
function We(t) {
  if (t == null || t === "") return;
  const s = String(t).replace(/[,$£€¥\s]/g, "").replace(/%$/, "");
  if (s === "" || s === "-" || s === ".") return;
  const e = Number(s);
  return Number.isFinite(e) ? e : void 0;
}
function Sr(t) {
  const s = String(t ?? "").trim().toLowerCase();
  if (s !== "") {
    if (Ht.has(s)) return !0;
    if (Ot.has(s)) return !1;
  }
}
function f(t, s = {}, e = null) {
  const n = document.createElement(t);
  for (const [r, i] of Object.entries(s))
    i == null || i === !1 || (r === "class" ? n.className = i : n.setAttribute(r, i === !0 ? "" : String(i)));
  return e == null || (Array.isArray(e) ? e.forEach((r) => n.append(r)) : typeof e == "string" ? n.innerHTML = e : n.append(e)), n;
}
const $ = (t) => t == null || t === "", xr = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function Gt() {
  return ({ value: t }) => {
    if ($(t)) return "";
    const s = String(t);
    return xr.test(s) ? f("a", {
      class: "sg-renderer-link",
      href: `mailto:${s}`,
      title: "Send email"
    }, document.createTextNode(s)) : f("span", { class: "sg-renderer-invalid", title: "Invalid email" }, document.createTextNode(s));
  };
}
function zt({ newTab: t = !0 } = {}) {
  return ({ value: s }) => {
    if ($(s)) return "";
    const e = String(s);
    let n;
    try {
      n = new URL(e);
    } catch {
      return document.createTextNode(e);
    }
    return f("a", {
      class: "sg-renderer-link",
      href: e,
      target: t ? "_blank" : null,
      rel: t ? "noopener noreferrer" : null,
      title: e
    }, document.createTextNode(n.hostname + (n.pathname !== "/" ? n.pathname : "")));
  };
}
function jt({ defaultRegion: t = "AU" } = {}) {
  return ({ value: s }) => {
    if ($(s)) return "";
    const e = String(s).trim(), n = e.replace(/\D/g, "");
    if (!n) return document.createTextNode(e);
    let r = e;
    return t === "AU" && (/^04\d{8}$/.test(n) ? r = `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}` : /^0[2378]\d{8}$/.test(n) ? r = `(${n.slice(0, 2)}) ${n.slice(2, 6)} ${n.slice(6)}` : /^1[38]00\d{6}$/.test(n) ? r = `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}` : n.length === 8 && (r = `${n.slice(0, 4)} ${n.slice(4)}`)), f("a", { class: "sg-renderer-link", href: `tel:${n}` }, document.createTextNode(r));
  };
}
function Kt({ currency: t = "USD", locale: s = "en-US", decimals: e } = {}) {
  return ({ value: n, td: r }) => {
    if (r && r.classList.add("sg-renderer-number"), $(n)) return "";
    const i = Number(n);
    if (!Number.isFinite(i)) return String(n);
    const o = { style: "currency", currency: t };
    return e != null && (o.minimumFractionDigits = e, o.maximumFractionDigits = e), i.toLocaleString(s, o);
  };
}
function qt({ decimals: t = 0, scale: s = "as-is" } = {}) {
  return ({ value: e, td: n }) => {
    if (n && n.classList.add("sg-renderer-number"), $(e)) return "";
    let r = Number(e);
    return Number.isFinite(r) ? (s === "fraction" && (r *= 100), `${r.toFixed(t)}%`) : String(e);
  };
}
function X(t) {
  if (t == null || t === "") return null;
  if (t instanceof Date) return Number.isNaN(t.valueOf()) ? null : t;
  const s = new Date(t);
  return Number.isNaN(s.valueOf()) ? null : s;
}
function Ut({ locale: t = void 0, dateStyle: s = "medium", ...e } = {}) {
  const n = new Intl.DateTimeFormat(t, { dateStyle: s, ...e });
  return ({ value: r }) => {
    const i = X(r);
    return i ? n.format(i) : "";
  };
}
function Wt({ locale: t = void 0, dateStyle: s = "medium", timeStyle: e = "short", ...n } = {}) {
  const r = new Intl.DateTimeFormat(t, { dateStyle: s, timeStyle: e, ...n });
  return ({ value: i }) => {
    const o = X(i);
    return o ? r.format(o) : "";
  };
}
const Je = [
  { unit: "second", ms: 1e3, cutoff: 60 * 1e3 },
  { unit: "minute", ms: 60 * 1e3, cutoff: 3600 * 1e3 },
  { unit: "hour", ms: 3600 * 1e3, cutoff: 1440 * 60 * 1e3 },
  { unit: "day", ms: 1440 * 60 * 1e3, cutoff: 10080 * 60 * 1e3 },
  { unit: "week", ms: 10080 * 60 * 1e3, cutoff: 720 * 60 * 60 * 1e3 },
  { unit: "month", ms: 720 * 60 * 60 * 1e3, cutoff: 365 * 24 * 60 * 60 * 1e3 },
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1e3, cutoff: 1 / 0 }
];
function Yt({ locale: t = void 0, numeric: s = "auto", style: e = "long" } = {}) {
  const n = new Intl.RelativeTimeFormat(t, { numeric: s, style: e });
  return ({ value: r }) => {
    const i = X(r);
    if (!i) return "";
    const o = i.getTime() - Date.now(), a = Math.abs(o), l = Je.find((u) => a < u.cutoff) || Je[Je.length - 1], c = Math.round(o / l.ms), d = f("span", { class: "sg-renderer-relative-time", title: i.toLocaleString() });
    return d.textContent = n.format(c, l.unit), d;
  };
}
const Lr = { ms: 1, sec: 1e3, second: 1e3, min: 6e4, minute: 6e4, hr: 36e5, hour: 36e5 };
function Xt({ unit: t = "ms", style: s = "compact" } = {}) {
  const e = Lr[t] ?? 1;
  return ({ value: n, td: r }) => {
    if (r && r.classList.add("sg-renderer-number"), $(n)) return "";
    const i = Number(n) * e;
    if (!Number.isFinite(i)) return String(n);
    const o = i < 0 ? "-" : "", a = Math.abs(i), l = Math.floor(a / 36e5), c = Math.floor(a % 36e5 / 6e4), d = Math.floor(a % 6e4 / 1e3);
    if (s === "clock") {
      const p = (g) => String(g).padStart(2, "0");
      return o + (l > 0 ? `${p(l)}:${p(c)}:${p(d)}` : `${p(c)}:${p(d)}`);
    }
    if (s === "words") {
      const p = [];
      return l && p.push(`${l} ${l === 1 ? "hour" : "hours"}`), c && p.push(`${c} ${c === 1 ? "minute" : "minutes"}`), !l && d && p.push(`${d} ${d === 1 ? "second" : "seconds"}`), o + (p.join(" ") || "0 seconds");
    }
    const u = [];
    return l && u.push(`${l}h`), c && u.push(`${c}m`), !l && d && u.push(`${d}s`), o + (u.join(" ") || "0s");
  };
}
function Jt({ locale: t = void 0, decimals: s, ...e } = {}) {
  const n = { ...e };
  s != null && (n.minimumFractionDigits = s, n.maximumFractionDigits = s);
  const r = new Intl.NumberFormat(t, n);
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), $(i)) return "";
    const a = Number(i);
    return Number.isFinite(a) ? r.format(a) : String(i);
  };
}
function Qt({ locale: t = void 0, compactDisplay: s = "short", maximumFractionDigits: e = 1 } = {}) {
  const n = new Intl.NumberFormat(t, {
    notation: "compact",
    compactDisplay: s,
    maximumFractionDigits: e
  });
  return ({ value: r, td: i }) => {
    if (i && i.classList.add("sg-renderer-number"), $(r)) return "";
    const o = Number(r);
    return Number.isFinite(o) ? n.format(o) : String(r);
  };
}
function Zt({ binary: t = !0, decimals: s = 1, locale: e = void 0 } = {}) {
  const n = t ? 1024 : 1e3, r = t ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"], i = new Intl.NumberFormat(e, {
    minimumFractionDigits: s,
    maximumFractionDigits: s
  });
  return ({ value: o, td: a }) => {
    if (a && a.classList.add("sg-renderer-number"), $(o)) return "";
    let l = Number(o);
    if (!Number.isFinite(l)) return String(o);
    const c = l < 0 ? "-" : "";
    l = Math.abs(l);
    let d = 0;
    for (; l >= n && d < r.length - 1; )
      l /= n, d += 1;
    const u = d === 0 ? String(Math.round(l)) : i.format(l);
    return `${c}${u} ${r[d]}`;
  };
}
const kr = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on"]);
function lt(t) {
  return t === !0 || t === 1 ? !0 : t == null || t === "" || t === !1 || t === 0 ? !1 : kr.has(String(t).toLowerCase());
}
const Er = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>', Ar = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
function en({
  truthy: t = lt,
  nullLabel: s = "—",
  falseStyle: e = "icon"
  // 'icon' | 'hidden'
} = {}) {
  return ({ value: n }) => {
    if (n == null || n === "")
      return f("span", { class: "sg-renderer-bool-null" }, document.createTextNode(s));
    if (t(n)) {
      const i = f("span", { class: "sg-renderer-bool is-true", "aria-label": "true" });
      return i.innerHTML = Er, i;
    }
    if (e === "hidden") return "";
    const r = f("span", { class: "sg-renderer-bool is-false", "aria-label": "false" });
    return r.innerHTML = Ar, r;
  };
}
const Tr = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>', Mr = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.7 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>', Dr = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M64 256a32 32 0 1 0 0-64H384V160c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9S384 364.9 384 352V320H64z"/></svg>';
function tn({
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
    if (l && l.classList.add("sg-renderer-number"), $(a)) return "";
    const c = Number(a);
    if (!Number.isFinite(c)) return String(a);
    let d = "is-flat", u = Dr;
    const p = !r;
    c > 0 ? (d = p ? "is-up" : "is-down", u = Tr) : c < 0 && (d = p ? "is-down" : "is-up", u = Mr);
    const g = f("span", { class: `sg-renderer-delta ${d}` }), h = f("span", { class: "sg-renderer-delta-icon", "aria-hidden": "true" });
    h.innerHTML = u;
    const y = t === "percent" ? `${o.format(c)}%` : o.format(c);
    return g.append(h), g.append(f("span", { class: "sg-renderer-delta-value" }, document.createTextNode(y))), g;
  };
}
function nn({ chars: t = null } = {}) {
  return ({ value: s, td: e }) => {
    if ($(s)) return "";
    const n = String(s);
    let r = n, i = !1;
    return t && n.length > t && (r = n.slice(0, t) + "…", i = !0), e && (e.classList.add("sg-renderer-truncate"), e.setAttribute("title", n)), i ? r : n;
  };
}
const je = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>', sn = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';
function rn({ position: t = "after" } = {}) {
  return ({ value: s }) => {
    if ($(s)) return "";
    const e = String(s), n = f("span", { class: "sg-renderer-copyable" }), r = f("span", { class: "sg-renderer-copyable-value" }, document.createTextNode(e)), i = f("button", {
      type: "button",
      class: "sg-renderer-copyable-btn",
      title: "Copy",
      "aria-label": `Copy ${e}`
    });
    return i.innerHTML = je, i.addEventListener("click", async (o) => {
      o.stopPropagation(), o.preventDefault();
      try {
        navigator.clipboard?.writeText ? await navigator.clipboard.writeText(e) : on(e), i.innerHTML = sn, i.classList.add("is-copied"), setTimeout(() => {
          i.innerHTML = je, i.classList.remove("is-copied");
        }, 1200);
      } catch {
      }
    }), t === "before" ? n.append(i, r) : n.append(r, i), n;
  };
}
function on(t) {
  const s = document.createElement("textarea");
  s.value = t, s.style.position = "fixed", s.style.left = "-9999px", document.body.appendChild(s), s.select();
  try {
    document.execCommand("copy");
  } catch {
  }
  document.body.removeChild(s);
}
function an({
  size: t = 36,
  rounded: s = "sm",
  // 'sm' = 4px, 'lg' = 8px, 'full' = circle, 'none'
  altField: e = "alt",
  clickToZoom: n = !1
} = {}) {
  const r = s === "full" ? "999px" : s === "lg" ? "8px" : s === "none" ? "0" : "4px";
  return ({ value: i, row: o }) => {
    if ($(i)) return "";
    const a = String(i), l = o?.[e] ?? "", c = f("img", {
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
      d.stopPropagation(), Nr(a, l);
    })), c;
  };
}
function Nr(t, s) {
  const e = f("div", { class: "sg-image-zoom" }), n = () => {
    e.remove(), document.removeEventListener("keydown", r);
  }, r = (i) => {
    i.key === "Escape" && n();
  };
  e.addEventListener("click", n), document.addEventListener("keydown", r), e.append(f("img", { src: t, alt: s || "", class: "sg-image-zoom-img" })), document.body.appendChild(e);
}
function ln({
  showLabel: t = !0,
  label: s = "value",
  // 'value' | 'name' | (value, row) => string
  shape: e = "circle",
  // 'circle' | 'square'
  size: n = 14
} = {}) {
  return ({ value: r, row: i }) => {
    if ($(r)) return "";
    const o = String(r).trim(), a = f("span", { class: "sg-renderer-swatch" }), l = f("span", {
      class: `sg-renderer-swatch-chip is-${e}`,
      style: `width: ${n}px; height: ${n}px; background: ${o};`,
      "aria-hidden": "true"
    });
    if (a.append(l), t) {
      const c = typeof s == "function" ? s(r, i) : s === "name" ? i?.name ?? o : o;
      a.append(f("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(c)));
    }
    return a;
  };
}
const ct = {
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  orange: "#f97316",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#6b7280"
};
function cn({
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
  const o = ct[n] || n;
  return ({ value: a }) => {
    if (!Array.isArray(a) || a.length === 0) return "";
    const l = a.map(Number).filter((_) => Number.isFinite(_));
    if (l.length === 0) return "";
    const c = r ?? Math.min(...l), u = Math.max(...l, r ?? -1 / 0) - c || 1, p = 1.5, g = 2.5, h = s - p * 2, y = e - g * 2, m = (_) => p + (l.length === 1 ? h / 2 : _ / (l.length - 1) * h), w = (_) => g + y - (_ - c) / u * y;
    let b = "";
    if (t === "bar") {
      const C = Math.max(1, (h - (l.length - 1) * 1) / l.length);
      for (let S = 0; S < l.length; S++) {
        const T = l[S], D = p + S * (C + 1), x = w(T), L = g + y - x;
        b += `<rect x="${D.toFixed(2)}" y="${x.toFixed(2)}" width="${C.toFixed(2)}" height="${L.toFixed(2)}" fill="${o}"/>`;
      }
    } else {
      let _ = "";
      for (let C = 0; C < l.length; C++)
        _ += `${C === 0 ? "M" : "L"} ${m(C).toFixed(2)} ${w(l[C]).toFixed(2)} `;
      if (t === "area") {
        const C = _ + ` L ${m(l.length - 1).toFixed(2)} ${(g + y).toFixed(2)} L ${m(0).toFixed(2)} ${(g + y).toFixed(2)} Z`;
        b += `<path d="${C}" fill="${o}" fill-opacity="0.18" stroke="none"/>`;
      }
      if (b += `<path d="${_.trim()}" fill="none" stroke="${o}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`, i) {
        const C = m(l.length - 1), S = w(l[l.length - 1]);
        b += `<circle cx="${C.toFixed(2)}" cy="${S.toFixed(2)}" r="1.8" fill="${o}"/>`;
      }
    }
    return `<svg class="sg-renderer-sparkline is-${t}" viewBox="0 0 ${s} ${e}" width="${s}" height="${e}" preserveAspectRatio="none" aria-hidden="true">` + b + "</svg>";
  };
}
function dn(t) {
  if (typeof t != "string") return null;
  let s = t.trim().replace(/^#/, "");
  return s.length === 3 && (s = s.split("").map((e) => e + e).join("")), /^[0-9a-f]{6}$/i.test(s) ? [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)] : null;
}
function Rr(t, s, e) {
  const n = (r) => Math.max(0, Math.min(255, Math.round(r))).toString(16).padStart(2, "0");
  return `#${n(t)}${n(s)}${n(e)}`;
}
function $r(t, s, e) {
  return [t[0] + (s[0] - t[0]) * e, t[1] + (s[1] - t[1]) * e, t[2] + (s[2] - t[2]) * e];
}
function un([t, s, e]) {
  return 0.299 * t + 0.587 * s + 0.114 * e >= 145;
}
function pn({
  min: t = 0,
  max: s = 100,
  colors: e = ["#dcfce7", "#fef3c7", "#fecaca"],
  inverted: n = !1,
  showValue: r = !0,
  format: i = null
  // (value) => string for custom labels
} = {}) {
  const o = e.map(dn).filter(Boolean);
  if (o.length < 2) throw new Error("heatmap: need at least two valid hex colours");
  return ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-heatmap"), $(a)) return "";
    let c = Number(a);
    if (!Number.isFinite(c)) return String(a);
    let d = s - t === 0 ? 0.5 : (c - t) / (s - t);
    d = Math.max(0, Math.min(1, d)), n && (d = 1 - d);
    const u = d * (o.length - 1), p = Math.min(o.length - 2, Math.floor(u)), g = u - p, h = $r(o[p], o[p + 1], g);
    return l && (l.style.backgroundColor = Rr(...h), l.style.color = un(h) ? "#111827" : "#ffffff"), r ? typeof i == "function" ? i(a) : String(a) : "";
  };
}
const Pr = {
  // Credit card: 16 digits grouped 4-4-4-4, last 4 visible. Handles 13-19
  // digit lengths gracefully (Amex 15, others 16). Non-digits are stripped.
  "cc-last4": (t, s) => St(t.replace(/\D/g, ""), 4, 4, s, " "),
  // BIN + last4: show the first 6 + last 4, mask the middle (PCI-friendly).
  "cc-bin-last4": (t, s) => St(t.replace(/\D/g, ""), 4, 4, s, " ", 6),
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
  last4: (t, s) => Vr(t, 4, s)
};
function Vr(t, s, e) {
  const n = String(t);
  return n.length <= s ? n : e.repeat(n.length - s) + n.slice(-s);
}
function St(t, s, e, n, r, i = 0) {
  if (!t) return "";
  const o = t.length, a = t.split("").map((c, d) => d < i || d >= o - e ? c : n).join(""), l = [];
  for (let c = a.length; c > 0; c -= s)
    l.unshift(a.slice(Math.max(0, c - s), c));
  return l.join(r);
}
const Ir = /* @__PURE__ */ new Set(["cc-last4", "cc-bin-last4", "phone-last4", "last4"]);
function fn({
  format: t = null,
  showFirst: s = 0,
  showLast: e = 4,
  char: n = "•",
  align: r = null
  // 'left' | 'right' | null (auto)
} = {}) {
  const i = t ? Pr[t] : null, o = t ? Ir.has(t) : !1, a = r === "right" || r !== "left" && o;
  return ({ value: l, td: c }) => {
    if (c && a && c.classList.add("sg-renderer-mask-numeric"), $(l)) return "";
    const d = String(l);
    if (i) return i(d, n);
    const u = d.slice(0, s), p = e > 0 ? d.slice(-e) : "", g = Math.max(0, d.length - s - e);
    return u + n.repeat(g) + p;
  };
}
function gn({
  query: t = null,
  caseSensitive: s = !1,
  className: e = "sg-renderer-mark"
} = {}) {
  return ({ value: n, api: r }) => {
    if ($(n)) return "";
    const i = String(n), o = t != null ? String(t) : r?.getQuickFilter?.() || "";
    return o ? Fr(i, o, s, e) : document.createTextNode(i);
  };
}
function Fr(t, s, e, n) {
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
function hn({ lines: t = null, separator: s = `
` } = {}) {
  return ({ value: e, td: n }) => {
    if ($(e)) return "";
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
function _e(t) {
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
const Br = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "ico"]);
function ne(t) {
  if (!t) return !1;
  if (typeof t.content_type == "string" && t.content_type.startsWith("image/")) return !0;
  const s = String(t.filename || "").split(".").pop()?.toLowerCase();
  return s ? Br.has(s) : !1;
}
const Ke = {
  pdf: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM88 304h32c30.9 0 56 25.1 56 56s-25.1 56-56 56h-16v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V320c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24h-16v48h16zm72-64c0-8.8 7.2-16 16-16h24c26.5 0 48 21.5 48 48v48c0 26.5-21.5 48-48 48H208c-8.8 0-16-7.2-16-16V320zm32 16v80h8c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16h-8z"/></svg>',
  doc: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM104 280c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24zm0 80c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24z"/></svg>',
  sheet: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zm192 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16v128c0 8.8-7.2 16-16 16H112c-8.8 0-16-7.2-16-16V272c0-8.8 7.2-16 16-16zm16 32v32h48V288H128zm80 0v32h48V288H208zm-80 64v32h48V352H128zm80 0v32h48V352H208z"/></svg>',
  zip: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H160V64H224V0H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM160 64v32h64V64H160zm0 96v32h64V160H160zm0 96v32h64V256H160zm0 96c-17.7 0-32 14.3-32 32v48c0 8.8 7.2 16 16 16h96c8.8 0 16-7.2 16-16V384c0-17.7-14.3-32-32-32H160z"/></svg>',
  audio: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM160 288c-8.8 0-16 7.2-16 16v89c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V362.5l64-21.3V388c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V304c0-5.1-2.5-10-6.6-13s-9.5-3.9-14.5-2.3L160 309.8V304c0-8.8-7.2-16-16-16z"/></svg>',
  video: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM64 288c0-17.7 14.3-32 32-32H224c17.7 0 32 14.3 32 32V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V288zm259.7-11.3c5.2 2.7 8.3 8 8.3 13.8v123c0 5.8-3.2 11.2-8.3 13.8s-11.3 2.3-16.1-.9L256 392.7V312l51.5-32.6c4.9-3.1 11-3.4 16.1-.8z"/></svg>',
  code: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM200.4 281.7c5.8 6.7 5.2 16.8-1.5 22.6L165.5 333l33.4 28.7c6.7 5.8 7.4 15.9 1.6 22.6s-15.9 7.4-22.6 1.6l-48-41.2c-3.5-3-5.5-7.4-5.5-12s2-9 5.5-12l48-41.2c6.7-5.8 16.8-5.2 22.6 1.5zM226 281.7c5.8-6.7 15.9-7.4 22.6-1.5l48 41.2c3.5 3 5.5 7.4 5.5 12s-2 9-5.5 12l-48 41.2c-6.7 5.8-16.8 5.2-22.6-1.6s-5.2-16.8 1.5-22.6L260.5 333 227.5 304.4c-6.7-5.8-7.4-15.9-1.5-22.6z"/></svg>',
  file: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0z"/></svg>'
}, mn = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>', dt = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>', Hr = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>', Or = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 105.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>', Gr = /* @__PURE__ */ new Set(["mp3", "wav", "flac", "m4a", "ogg", "aac", "opus"]), zr = /* @__PURE__ */ new Set(["mp4", "mov", "webm", "mkv", "avi", "m4v"]);
function bn(t) {
  const s = String(t?.content_type || "").toLowerCase(), e = String(t?.filename || "").split(".").pop()?.toLowerCase() || "";
  return s.includes("pdf") || e === "pdf" ? "pdf" : s.startsWith("audio/") || Gr.has(e) ? "audio" : s.startsWith("video/") || zr.has(e) ? "video" : s.includes("zip") || ["zip", "tar", "gz", "7z", "rar"].includes(e) ? "zip" : s.includes("sheet") || s.includes("excel") || s.includes("csv") || ["xls", "xlsx", "csv", "numbers"].includes(e) ? "sheet" : s.includes("word") || s.includes("document") || ["doc", "docx", "txt", "md", "rtf"].includes(e) ? "doc" : ["js", "ts", "rb", "py", "go", "rs", "java", "json", "xml", "html", "css", "sh", "sql"].includes(e) ? "code" : "file";
}
function Ye(t) {
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
    preview_url: e.preview_url || e.previewUrl || (ne(e) ? e.url : null),
    thumb_url: e.thumb_url || e.thumbUrl || (ne(e) ? e.url : null),
    signed_id: e.signed_id || e.signedId || null
  }));
}
function yn({
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
    const { value: d, td: u, row: p, col: g } = c, h = Ye(d);
    if (u && (u.classList.add("sg-renderer-attachments-cell"), u.dataset.attachmentCount = String(h.length), u._sgAttachments = h), h.length === 0 && !n)
      return e ? document.createTextNode(e) : "";
    const y = f("div", { class: "sg-renderer-attachments", role: "group" }), m = h.slice(0, s), w = Math.max(0, h.length - m.length);
    if (m.forEach((b) => y.append(jr(b, t, h, o))), w > 0) {
      const b = f(
        "span",
        { class: "sg-attach-more", title: `${w} more` },
        document.createTextNode(`+${w}`)
      );
      b.addEventListener("click", (_) => {
        _.stopPropagation(), _n(h, h[m.length]);
      }), y.append(b);
    }
    if (n) {
      const b = f("button", {
        type: "button",
        class: "sg-attach-add",
        title: "Add files",
        "aria-label": "Add attachments",
        "data-sg-attach": "add"
      });
      b.innerHTML = mn, b.addEventListener("click", (_) => {
        _.stopPropagation(), xt(u, c, { thumbSize: t, accept: r, multiple: i, onUpload: a, onRemove: l });
      }), y.append(b), Kr(u, c, { onUpload: a }), u.addEventListener("dblclick", (_) => {
        _._sgAttachmentHandled || (_._sgAttachmentHandled = !0, _.stopPropagation(), xt(u, c, { thumbSize: t, accept: r, multiple: i, onUpload: a, onRemove: l }));
      }, { once: !1 });
    }
    return y;
  };
}
function jr(t, s, e, n) {
  const r = f("button", {
    type: "button",
    class: "sg-attach-thumb",
    title: `${t.filename}${t.byte_size != null ? " · " + _e(t.byte_size) : ""}`,
    "data-attachment-id": t.id,
    "data-attachment-kind": ne(t) ? "image" : "file",
    "aria-label": t.filename,
    style: `width: ${s}px; height: ${s}px;`
  });
  if (ne(t) && t.thumb_url)
    r.append(f("img", {
      src: t.thumb_url,
      alt: t.filename,
      loading: "lazy",
      decoding: "async",
      width: String(s),
      height: String(s)
    }));
  else {
    const i = bn(t), o = f("span", { class: `sg-attach-icon is-${i}`, "aria-hidden": "true" });
    o.innerHTML = Ke[i] || Ke.file, r.append(o);
  }
  return r.addEventListener("click", (i) => {
    if (i.stopPropagation(), ne(t)) {
      const o = e.filter(ne);
      _n(o.length ? o : [t], t);
    } else if (n) {
      const o = document.createElement("a");
      o.href = t.url, o.download = t.filename, document.body.appendChild(o), o.click(), o.remove();
    } else
      window.open(t.url, "_blank", "noopener,noreferrer");
  }), r;
}
let ge = null;
function _n(t, s) {
  Qe();
  const e = t.filter(ne);
  if (e.length === 0) return;
  let n = Math.max(0, e.findIndex((g) => g.id === s?.id));
  n < 0 && (n = 0);
  const r = f("div", { class: "sg-image-zoom sg-attach-lightbox", role: "dialog", "aria-modal": "true" }), i = f("div", { class: "sg-attach-lightbox-stage" }), o = f("img", { class: "sg-image-zoom-img", alt: "" }), a = f("div", { class: "sg-attach-lightbox-caption" }), l = f("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-prev",
    "aria-label": "Previous attachment"
  }), c = f("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-next",
    "aria-label": "Next attachment"
  });
  l.innerHTML = Hr, c.innerHTML = Or;
  function d() {
    const g = e[n];
    o.src = g.preview_url || g.url, o.alt = g.filename, a.textContent = `${g.filename}${g.byte_size != null ? " · " + _e(g.byte_size) : ""} (${n + 1}/${e.length})`, l.style.visibility = e.length > 1 ? "visible" : "hidden", c.style.visibility = e.length > 1 ? "visible" : "hidden";
  }
  function u(g) {
    n = (n + g + e.length) % e.length, d();
  }
  function p(g) {
    g.key === "Escape" ? Qe() : g.key === "ArrowLeft" ? u(-1) : g.key === "ArrowRight" && u(1);
  }
  r.addEventListener("click", (g) => {
    (g.target === r || g.target === i) && Qe();
  }), l.addEventListener("click", (g) => {
    g.stopPropagation(), u(-1);
  }), c.addEventListener("click", (g) => {
    g.stopPropagation(), u(1);
  }), document.addEventListener("keydown", p), i.append(l, o, c), r.append(i, a), document.body.appendChild(r), ge = { overlay: r, onKey: p }, d();
}
function Qe() {
  ge && (document.removeEventListener("keydown", ge.onKey), ge.overlay.remove(), ge = null);
}
let De = null;
function Kr(t, s, { onUpload: e }) {
  t._sgAttachDropBound || (t._sgAttachDropBound = !0, t.addEventListener("dragover", (n) => {
    n.dataTransfer?.types?.includes("Files") && (n.preventDefault(), t.classList.add("is-drop-target"));
  }), t.addEventListener("dragleave", () => t.classList.remove("is-drop-target")), t.addEventListener("drop", async (n) => {
    if (!n.dataTransfer?.files?.length) return;
    n.preventDefault(), t.classList.remove("is-drop-target");
    const r = Array.from(n.dataTransfer.files);
    await Ne(t, s, r, e);
  }));
}
function xt(t, s, e) {
  ve();
  const { thumbSize: n, accept: r, multiple: i, onUpload: o, onRemove: a } = e, l = t._sgAttachments || Ye(s.value), c = f("div", { class: "sg-attach-editor", role: "dialog", "aria-modal": "false" });
  c.addEventListener("mousedown", (b) => b.stopPropagation());
  const d = f("div", { class: "sg-attach-editor-header" }, [
    f(
      "span",
      { class: "sg-attach-editor-title" },
      document.createTextNode(l.length === 1 ? "1 attachment" : `${l.length} attachments`)
    ),
    (() => {
      const b = f("button", {
        type: "button",
        class: "sg-attach-editor-close",
        "aria-label": "Close"
      });
      return b.innerHTML = dt, b.addEventListener("click", ve), b;
    })()
  ]), u = f("div", { class: "sg-attach-editor-grid" });
  function p() {
    const b = t._sgAttachments || [];
    u.replaceChildren(), b.forEach((_) => u.append(qr(_, t, s, a, n))), d.firstChild.textContent = b.length === 1 ? "1 attachment" : `${b.length} attachments`;
  }
  p(), t._sgAttachRepaint = p;
  const g = f("label", { class: "sg-attach-dropzone", tabindex: "0" });
  g.innerHTML = `
    <span class="sg-attach-dropzone-icon" aria-hidden="true">${mn}</span>
    <span class="sg-attach-dropzone-text">Drop files, paste, or <strong>browse</strong></span>
  `;
  const h = f("input", { type: "file", multiple: i ? "" : null, accept: r || null });
  h.style.display = "none", g.append(h), h.addEventListener("change", async () => {
    h.files?.length && (await Ne(t, s, Array.from(h.files), o), h.value = "", p());
  }), g.addEventListener("dragover", (b) => {
    b.dataTransfer?.types?.includes("Files") && (b.preventDefault(), g.classList.add("is-drop-target"));
  }), g.addEventListener("dragleave", () => g.classList.remove("is-drop-target")), g.addEventListener("drop", async (b) => {
    b.dataTransfer?.files?.length && (b.preventDefault(), g.classList.remove("is-drop-target"), await Ne(t, s, Array.from(b.dataTransfer.files), o), p());
  });
  function y(b) {
    const _ = Array.from(b.clipboardData?.files || []);
    _.length !== 0 && (b.preventDefault(), Ne(t, s, _, o).then(p));
  }
  c.addEventListener("paste", y);
  function m(b) {
    b.key === "Escape" && ve();
  }
  function w(b) {
    !c.contains(b.target) && !t.contains(b.target) && ve();
  }
  document.addEventListener("keydown", m), setTimeout(() => document.addEventListener("mousedown", w), 0), c.append(d, u, g), document.body.appendChild(c), U(c, t), g.focus(), De = { pop: c, onKey: m, onDocClick: w, anchor: t };
}
function ve() {
  if (!De) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = De;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), n && delete n._sgAttachRepaint, De = null;
}
function qr(t, s, e, n, r) {
  const i = f("div", { class: "sg-attach-editor-tile", "data-attachment-id": t.id }), o = f("div", {
    class: "sg-attach-editor-preview",
    style: `width: ${r * 2}px; height: ${r * 2}px;`
  });
  if (ne(t) && t.thumb_url)
    o.append(f("img", {
      src: t.thumb_url,
      alt: t.filename,
      width: String(r * 2),
      height: String(r * 2)
    }));
  else {
    const c = bn(t), d = f("span", { class: `sg-attach-icon is-${c}`, "aria-hidden": "true" });
    d.innerHTML = Ke[c] || Ke.file, o.append(d);
  }
  const a = f("div", { class: "sg-attach-editor-meta" }, [
    f(
      "div",
      { class: "sg-attach-editor-name", title: t.filename },
      document.createTextNode(t.filename)
    ),
    f(
      "div",
      { class: "sg-attach-editor-size" },
      document.createTextNode(t.byte_size != null ? _e(t.byte_size) : "")
    )
  ]), l = f("button", {
    type: "button",
    class: "sg-attach-editor-remove",
    title: "Remove",
    "aria-label": `Remove ${t.filename}`,
    "data-sg-attach": "remove",
    "data-attachment-id": t.id
  });
  return l.innerHTML = dt, l.addEventListener("click", async (c) => {
    c.stopPropagation(), await Ur(s, e, t, n);
  }), i.append(o, a, l), i;
}
function U(t, s) {
  const e = s.getBoundingClientRect();
  t.style.position = "fixed", t.style.left = `${Math.max(8, Math.min(window.innerWidth - 360, e.left))}px`, window.innerHeight - e.bottom > 280 ? t.style.top = `${e.bottom + 4}px` : t.style.top = `${Math.max(8, e.top - t.offsetHeight - 4)}px`;
}
async function Ne(t, s, e, n) {
  if (e.length) {
    t.classList.add("is-uploading");
    try {
      let r;
      if (typeof n == "function") {
        const i = await n(e, s);
        r = Array.isArray(i) ? i : (t._sgAttachments || []).concat(Lt(e));
      } else
        r = (t._sgAttachments || []).concat(Lt(e));
      wn(t, s, Ye(r));
    } finally {
      t.classList.remove("is-uploading");
    }
  }
}
async function Ur(t, s, e, n) {
  let r;
  if (typeof n == "function") {
    const i = await n(e, s);
    r = Array.isArray(i) ? i : (t._sgAttachments || []).filter((o) => o.id !== e.id);
  } else
    r = (t._sgAttachments || []).filter((i) => i.id !== e.id);
  wn(t, s, Ye(r));
}
function Lt(t) {
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
function wn(t, s, e) {
  const { row: n, col: r, api: i } = s;
  n && r?.field != null && (n[r.field] = e), t._sgAttachments = e, i?.applyTransaction ? i.applyTransaction({ update: [n] }) : i?.refreshCells && i.refreshCells({ rowIds: [n?.id ?? n?._sg_id] }), t._sgAttachRepaint && t._sgAttachRepaint();
}
const Wr = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"], vn = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory"
};
function Yr(t) {
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
function Xr(t) {
  if (!t || t._raw) return t?._raw || "";
  const s = [t.address1, t.address2, t.address3].filter(Boolean), e = [t.suburb, t.state, t.postcode].filter(Boolean).join(" ");
  return e && s.push(e), t.country && t.country.toLowerCase() !== "australia" && s.push(t.country), s.join(`
`);
}
function Cn({ editable: t = !0, empty: s = "" } = {}) {
  return (e) => {
    const { value: n, td: r } = e, i = Yr(n);
    if (r && (r.classList.add("sg-renderer-address-au-cell"), r._sgAddress = i), !i) return s ? document.createTextNode(s) : "";
    t && r && !r._sgAddressEditBound && (r._sgAddressEditBound = !0, r.addEventListener("dblclick", (c) => {
      c._sgAddressHandled || (c._sgAddressHandled = !0, c.stopPropagation(), Jr(r, e));
    }));
    const o = f("div", {
      class: "sg-renderer-address-au",
      title: Xr(i)
    });
    if (i._raw)
      return o.append(document.createTextNode(i._raw)), o;
    const a = [i.address1, i.address2].filter(Boolean).join(", "), l = i.suburb || i.state || i.postcode;
    return a && o.append(f("span", { class: "sg-address-au-street" }, document.createTextNode(a))), a && l && o.append(f("span", { class: "sg-address-au-sep" }, document.createTextNode(", "))), i.suburb && o.append(document.createTextNode(i.suburb)), i.state && (i.suburb && o.append(document.createTextNode(" ")), o.append(f("span", {
      class: `sg-address-au-state is-${i.state.toLowerCase()}`,
      title: vn[i.state] || i.state
    }, document.createTextNode(i.state)))), i.postcode && ((i.suburb || i.state) && o.append(document.createTextNode(" ")), o.append(f(
      "span",
      { class: "sg-address-au-postcode" },
      document.createTextNode(i.postcode)
    ))), i.country && i.country.toLowerCase() !== "australia" && (o.append(document.createTextNode(" ")), o.append(f(
      "span",
      { class: "sg-address-au-country" },
      document.createTextNode(i.country)
    ))), o;
  };
}
let Re = null;
function Jr(t, s) {
  ue();
  const e = t._sgAddress && !t._sgAddress._raw ? { ...t._sgAddress } : { address1: "", address2: "", address3: "", suburb: "", state: "", postcode: "", country: "Australia" };
  e.country || (e.country = "Australia");
  const n = f("div", { class: "sg-address-au-editor", role: "dialog", "aria-modal": "false" });
  n.addEventListener("mousedown", (A) => A.stopPropagation());
  const r = f("div", { class: "sg-address-au-editor-header" });
  r.append(
    f("span", { class: "sg-address-au-editor-title" }, document.createTextNode("Edit address"))
  );
  const i = f("form", { class: "sg-address-au-editor-form", novalidate: "novalidate" });
  function o({ label: A, name: R, type: V = "text", value: B = "", maxlength: H, inputmode: F, placeholder: W, autocomplete: Q }) {
    const q = f("label", { class: "sg-address-au-editor-field", "data-field": R });
    q.append(f("span", { class: "sg-address-au-editor-label" }, document.createTextNode(A)));
    const Z = f("input", {
      type: V,
      name: R,
      value: B || "",
      maxlength: H || null,
      inputmode: F || null,
      placeholder: W || null,
      autocomplete: Q || null,
      class: "sg-address-au-editor-input"
    });
    return q.append(Z), { wrap: q, input: Z };
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
  }), c = f("div", { class: "sg-address-au-editor-line3-wrap" }), d = o({
    label: "Address line 3",
    name: "address3",
    value: e.address3,
    placeholder: "Level / building (optional)",
    autocomplete: "address-line3"
  });
  c.append(d.wrap);
  const u = f("button", {
    type: "button",
    class: "sg-address-au-editor-add-line"
  }, document.createTextNode("+ Add another line"));
  function p() {
    const A = !!(l.input.value.trim() || d.input.value.trim());
    c.hidden = !A, u.hidden = A;
  }
  l.input.addEventListener("input", p), u.addEventListener("click", () => {
    c.hidden = !1, u.hidden = !0, d.input.focus();
  });
  const g = o({
    label: "Suburb",
    name: "suburb",
    value: e.suburb,
    placeholder: "Bondi",
    autocomplete: "address-level2"
  }), h = f("label", { class: "sg-address-au-editor-field", "data-field": "state" });
  h.append(f("span", { class: "sg-address-au-editor-label" }, document.createTextNode("State")));
  const y = f("select", {
    name: "state",
    class: "sg-address-au-editor-input sg-address-au-editor-state",
    autocomplete: "address-level1"
  });
  y.append(f("option", { value: "" }, document.createTextNode("—")));
  for (const A of Wr) {
    const R = f(
      "option",
      { value: A, selected: e.state === A ? "" : null },
      document.createTextNode(`${A} — ${vn[A]}`)
    );
    y.append(R);
  }
  h.append(y);
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
  const w = o({
    label: "Country",
    name: "country",
    value: e.country,
    autocomplete: "country-name"
  }), b = f("div", { class: "sg-address-au-editor-grid" });
  b.append(a.wrap), b.append(l.wrap, u), b.append(c), b.append(g.wrap, h, m.wrap), b.append(w.wrap);
  const _ = f("div", { class: "sg-address-au-editor-footer" }), C = f(
    "button",
    { type: "button", class: "sg-address-au-editor-cancel" },
    document.createTextNode("Cancel")
  ), S = f(
    "button",
    { type: "submit", class: "sg-address-au-editor-save" },
    document.createTextNode("Save")
  );
  _.append(C, S), i.append(b, _), n.append(r, i);
  function T() {
    return {
      address1: a.input.value.trim(),
      address2: l.input.value.trim(),
      address3: c.hidden ? "" : d.input.value.trim(),
      suburb: g.input.value.trim(),
      state: y.value,
      postcode: m.input.value.trim(),
      country: w.input.value.trim() || "Australia"
    };
  }
  function D() {
    const A = T(), R = !A.address1 && !A.suburb && !A.state && !A.postcode;
    Qr(t, s, R ? null : A), ue();
  }
  i.addEventListener("submit", (A) => {
    A.preventDefault(), D();
  }), C.addEventListener("click", () => ue());
  function x(A) {
    A.key === "Escape" && (A.stopPropagation(), ue());
  }
  function L(A) {
    !n.contains(A.target) && !t.contains(A.target) && ue();
  }
  document.addEventListener("keydown", x), setTimeout(() => document.addEventListener("mousedown", L), 0), document.body.appendChild(n), U(n, t), p(), a.input.focus(), a.input.select(), Re = { pop: n, onKey: x, onDocClick: L };
}
function ue() {
  if (!Re) return;
  const { pop: t, onKey: s, onDocClick: e } = Re;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Re = null;
}
function Qr(t, s, e) {
  const { row: n, col: r, api: i } = s, o = n && r?.field != null ? n[r.field] : null;
  n && r?.field != null && (n[r.field] = e), t._sgAddress = e, i?.applyTransaction ? i.applyTransaction({ update: [n] }) : i?.refreshCells && i.refreshCells({ rowIds: [n?.id ?? n?._sg_id] });
  const a = t.closest('[data-controller~="grid"]');
  a && a.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
    bubbles: !0,
    detail: { rowId: n?.id ?? n?._sg_id, colId: r?.field, oldValue: o, newValue: e }
  }));
}
function Sn({ color: t = "green", showValue: s = !1 } = {}) {
  return ({ value: e }) => {
    let n = Number(e);
    Number.isFinite(n) || (n = 0), n = Math.max(0, Math.min(100, n));
    const r = f("div", { class: "sg-renderer-progress" }, [
      f("div", { class: `sg-renderer-progress-fill sg-fill-${t}`, style: `width: ${n}%;` })
    ]);
    return s ? f("div", { class: "sg-renderer-progress-wrap" }, [
      r,
      f("span", { class: "sg-renderer-progress-label" }, document.createTextNode(`${Math.round(n)}%`))
    ]) : r;
  };
}
const he = '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>';
function xn({ max: t = 5, precision: s = 0.5 } = {}) {
  const e = s > 0 ? 1 / s : 2;
  return ({ value: n }) => {
    let r = parseFloat(n);
    Number.isFinite(r) || (r = 0), r = Math.max(0, Math.min(t, r)), r = Math.round(r * e) / e;
    const i = f("div", {
      class: "sg-renderer-stars",
      role: "img",
      "aria-label": `${r} out of ${t} stars`
    });
    for (let o = 1; o <= t; o++)
      if (r >= o)
        i.append(f("span", { class: "sg-renderer-star is-full", "aria-hidden": "true" }, he));
      else if (r > o - 1) {
        const a = Math.round((r - (o - 1)) * 100);
        i.append(f(
          "span",
          { class: "sg-renderer-star is-partial", "aria-hidden": "true" },
          `${he}<span class="sg-star-clip" style="width: ${a}%;">${he}</span>`
        ));
      } else
        i.append(f("span", { class: "sg-renderer-star is-empty", "aria-hidden": "true" }, he));
    return i;
  };
}
function Ln({ separator: t = "," } = {}) {
  return ({ value: s }) => {
    if ($(s)) return "";
    const e = Array.isArray(s) ? s : String(s).split(t), n = f("div", { class: "sg-renderer-tags" });
    for (const r of e) {
      const i = String(r).trim();
      i && n.append(f("span", { class: "sg-renderer-tag" }, document.createTextNode(i)));
    }
    return n;
  };
}
function kn({ showCode: t = !0, fallback: s = null } = {}) {
  return ({ value: e }) => {
    if ($(e)) return "";
    const n = String(e).trim().toUpperCase();
    if (n.length !== 2 || !/^[A-Z]{2}$/.test(n))
      return s ?? document.createTextNode(String(e));
    const r = String.fromCodePoint(
      127462 + n.charCodeAt(0) - 65,
      127462 + n.charCodeAt(1) - 65
    ), i = f("span", { class: "sg-renderer-country" });
    return i.append(f("span", { class: "sg-renderer-flag", "aria-hidden": "true" }, document.createTextNode(r))), t && i.append(f("span", { class: "sg-renderer-country-code" }, document.createTextNode(n))), i;
  };
}
function Zr(t) {
  const s = String(t).replace(/\s+/g, "");
  if (s.length !== 11 || !/^\d{11}$/.test(s)) return !1;
  const e = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19], n = parseInt(s[0], 10) - 1 + s.slice(1);
  let r = 0;
  for (let i = 0; i < 11; i++) r += parseInt(n[i], 10) * e[i];
  return r % 89 === 0;
}
function ei(t) {
  const s = String(t).replace(/\D/g, "");
  return s.length !== 11 ? String(t) : `${s.slice(0, 2)} ${s.slice(2, 5)} ${s.slice(5, 8)} ${s.slice(8)}`;
}
function En() {
  return ({ value: t }) => {
    if ($(t)) return "";
    if (!Zr(t))
      return f("span", { class: "sg-renderer-invalid", title: "Invalid ABN" }, document.createTextNode(String(t)));
    const s = String(t).replace(/\s+/g, "");
    return f("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/ABN/View?id=${s}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(ei(t)));
  };
}
function An({
  lookup: t = null,
  nameField: s = null,
  avatarField: e = null,
  windowKey: n = "__sgUsers",
  size: r = 22
} = {}) {
  return ({ value: i, row: o }) => {
    if ($(i)) return "";
    let a = null;
    if (typeof t == "function" && (a = t(i, o) || null), !a && s && (a = { name: o?.[s], avatarUrl: e ? o?.[e] : null }), !a && typeof window < "u" && window[n]) {
      const d = window[n];
      d instanceof Map ? a = d.get(i) || d.get(String(i)) || null : Array.isArray(d) && (a = d.find((u) => `${u.id}` == `${i}`) || null);
    }
    const l = a?.name ?? String(i), c = f("span", { class: "sg-renderer-avatar" });
    if (a?.avatarUrl)
      c.append(f("img", {
        class: "sg-renderer-avatar-img",
        src: a.avatarUrl,
        width: String(r),
        height: String(r),
        alt: ""
      }));
    else {
      const d = String(l).split(/\s+/).filter(Boolean).slice(0, 2).map((u) => u[0]?.toUpperCase() || "").join("");
      c.append(f("span", {
        class: "sg-renderer-avatar-initials",
        style: `width: ${r}px; height: ${r}px;`
      }, document.createTextNode(d)));
    }
    return c.append(f("span", { class: "sg-renderer-avatar-name" }, document.createTextNode(l))), c;
  };
}
const ti = {
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
function ni(t) {
  return String(t).toLowerCase().split(/[\s_-]+/).map((s) => s && s[0].toUpperCase() + s.slice(1)).join(" ");
}
function si(t = {}, s = null, e = {}) {
  const { titleCase: n = !0, defaultColor: r = "gray" } = e, i = {};
  for (const [a, l] of Object.entries(t)) i[String(a).toLowerCase()] = l;
  const o = {};
  if (s) for (const [a, l] of Object.entries(s)) o[String(a).toLowerCase()] = l;
  return ({ value: a }) => {
    if ($(a)) return "";
    const l = String(a).toLowerCase(), c = i[l] || r, d = n ? ni(a) : String(a), u = f("span", { class: `sg-pill sg-pill-${c}` });
    if (s) {
      const p = o[l], g = p ? ti[p] || p : null;
      if (g) {
        const h = f("span", { class: "sg-pill-icon", "aria-hidden": "true" });
        h.innerHTML = g, u.append(h);
      }
    }
    return u.append(f("span", { class: "sg-pill-label" }, document.createTextNode(d))), u;
  };
}
function Tn({
  truthy: t = lt,
  disabled: s = !1
} = {}) {
  return (e) => {
    const { value: n, row: r, col: i, api: o, td: a } = e;
    a && a.classList.add("sg-renderer-checkbox-cell");
    const l = f("span", { class: "sg-renderer-checkbox" }), c = f("input", {
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
      const u = c.checked, p = r && i?.field != null ? r[i.field] : null;
      r && i?.field != null && (r[i.field] = u), o?.applyTransaction && o.applyTransaction({ update: [r] });
      const g = a?.closest('[data-controller~="grid"]');
      g && g.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: r?.id ?? r?._sg_id, colId: i?.field, oldValue: p, newValue: u }
      }));
    }), l.append(c), l;
  };
}
const ri = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z"/></svg>', Ze = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>', ii = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>', oi = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/></svg>', ai = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/></svg>', li = dt;
function Mn(t) {
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
function me(t) {
  (!Number.isFinite(t) || t < 0) && (t = 0);
  const s = Math.floor(t), e = Math.floor(s / 3600), n = Math.floor(s % 3600 / 60), r = s % 60, i = (o) => String(o).padStart(2, "0");
  return e > 0 ? `${e}:${i(n)}:${i(r)}` : `${n}:${i(r)}`;
}
function Dn({
  showFilename: t = !0,
  iconOnly: s = !1,
  empty: e = "",
  preferHowler: n = !0,
  skipSeconds: r = 10
} = {}) {
  return (i) => {
    const { value: o, td: a } = i, l = Mn(o);
    if (a && (a.classList.add("sg-renderer-audio-cell"), a._sgAudio = l, a._sgAudioOpts = { preferHowler: n, skipSeconds: r }), !l) return e ? document.createTextNode(e) : "";
    a && !a._sgAudioDblBound && (a._sgAudioDblBound = !0, a.addEventListener("dblclick", (u) => {
      u._sgAudioHandled || (u._sgAudioHandled = !0, u.stopPropagation(), u.preventDefault(), kt(a, i));
    }));
    const c = f("div", { class: "sg-renderer-audio" }), d = f("button", {
      type: "button",
      class: "sg-audio-icon",
      title: `${l.filename}${l.byte_size != null ? " · " + _e(l.byte_size) : ""} — double-click to play`,
      "aria-label": `Play ${l.filename}`,
      "data-sg-audio": "open"
    });
    if (d.innerHTML = ri, d.addEventListener("click", (u) => {
      u.stopPropagation(), kt(a, i);
    }), d.addEventListener("dblclick", (u) => {
      u._sgAudioHandled = !0, u.stopPropagation();
    }), c.append(d), t && !s) {
      const u = f(
        "span",
        { class: "sg-audio-name" },
        document.createTextNode(l.filename)
      );
      c.append(u), l.duration != null && c.append(f(
        "span",
        { class: "sg-audio-duration" },
        document.createTextNode(me(l.duration))
      ));
    }
    return c;
  };
}
function ci(t, { preferHowler: s } = {}) {
  return s && typeof window < "u" && window.Howl ? new ui(t) : new di(t);
}
class di {
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
class ui {
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
let $e = null;
function kt(t, s) {
  Ce();
  const e = t._sgAudio || Mn(s.value);
  if (!e) return;
  const n = t._sgAudioOpts || { preferHowler: !0, skipSeconds: 10 }, r = ci(e.url, n), i = f("div", { class: "sg-audio-player", role: "dialog", "aria-label": "Audio player" });
  i.addEventListener("mousedown", (N) => N.stopPropagation());
  const o = f("div", { class: "sg-audio-player-header" }), a = f(
    "div",
    { class: "sg-audio-player-name", title: e.filename },
    document.createTextNode(e.filename)
  ), l = f("div", { class: "sg-audio-player-meta" }), c = [];
  e.byte_size != null && c.push(_e(e.byte_size)), r.backendName() === "howler" && c.push("howler.js"), l.textContent = c.join(" · ");
  const d = f("button", {
    type: "button",
    class: "sg-audio-player-close",
    "aria-label": "Close player"
  });
  d.innerHTML = li, d.addEventListener("click", Ce), o.append(a, l, d);
  const u = f("div", {
    class: "sg-audio-track",
    role: "slider",
    "aria-label": "Seek",
    tabindex: "0",
    "aria-valuemin": "0",
    "aria-valuemax": "0",
    "aria-valuenow": "0"
  }), p = f("div", { class: "sg-audio-track-fill" }), g = f("div", { class: "sg-audio-track-thumb" });
  u.append(p, g);
  const h = f("div", { class: "sg-audio-times" }), y = f("span", { class: "sg-audio-time-current" }, document.createTextNode("0:00")), m = f(
    "span",
    { class: "sg-audio-time-total" },
    document.createTextNode(e.duration ? me(e.duration) : "--:--")
  );
  h.append(y, m);
  const w = f("div", { class: "sg-audio-transport" }), b = f("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Back ${n.skipSeconds}s`,
    "aria-label": `Back ${n.skipSeconds} seconds`
  });
  b.innerHTML = oi;
  const _ = f("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-play",
    title: "Play / pause (Space)",
    "aria-label": "Play",
    "data-state": "paused"
  });
  _.innerHTML = Ze;
  const C = f("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Forward ${n.skipSeconds}s`,
    "aria-label": `Forward ${n.skipSeconds} seconds`
  });
  C.innerHTML = ai, w.append(b, _, C), i.append(o, u, h, w);
  let S = e.duration ?? 0, T = !1, D = null;
  function x(N) {
    const G = Math.max(0, Math.min(100, N));
    p.style.width = G + "%", g.style.left = G + "%";
  }
  function L() {
    const N = r.seek(), J = r.duration() || 0 || S || 0;
    if (J > 0 && J !== S && (S = J, m.textContent = me(S), u.setAttribute("aria-valuemax", String(Math.floor(S)))), !T) {
      const Y = S > 0 ? N / S * 100 : 0;
      x(Y), y.textContent = me(N), u.setAttribute("aria-valuenow", String(Math.floor(N)));
    }
  }
  function A() {
    L(), r.isPlaying() ? D = requestAnimationFrame(A) : D = null;
  }
  function R() {
    D == null && (D = requestAnimationFrame(A));
  }
  function V() {
    D != null && cancelAnimationFrame(D), D = null;
  }
  const B = () => {
    S = r.duration(), L();
  }, H = () => {
    _.dataset.state = "playing", _.innerHTML = ii, _.setAttribute("aria-label", "Pause"), R();
  }, F = () => {
    _.dataset.state = "paused", _.innerHTML = Ze, _.setAttribute("aria-label", "Play"), V(), L();
  }, W = () => {
    _.dataset.state = "paused", _.innerHTML = Ze, _.setAttribute("aria-label", "Play"), V(), r.seek(0), L();
  };
  r.on("load", B), r.on("play", H), r.on("pause", F), r.on("end", W), _.addEventListener("click", (N) => {
    N.stopPropagation(), r.isPlaying() ? r.pause() : r.play();
  }), b.addEventListener("click", (N) => {
    N.stopPropagation(), r.seek(Math.max(0, r.seek() - n.skipSeconds)), L();
  }), C.addEventListener("click", (N) => {
    N.stopPropagation();
    const G = r.duration();
    r.seek(Math.min(G || 1 / 0, r.seek() + n.skipSeconds)), L();
  });
  function Q(N) {
    const G = u.getBoundingClientRect(), J = (N.clientX ?? 0) - G.left, Y = Math.max(0, Math.min(1, J / G.width)), ht = r.duration() || S;
    if (!ht) return;
    const mt = Y * ht;
    r.seek(mt), x(Y * 100), y.textContent = me(mt);
  }
  u.addEventListener("pointerdown", (N) => {
    N.preventDefault(), T = !0, u.setPointerCapture?.(N.pointerId), u.classList.add("is-dragging"), Q(N);
  }), u.addEventListener("pointermove", (N) => {
    T && Q(N);
  });
  const q = (N) => {
    if (T) {
      T = !1, u.classList.remove("is-dragging");
      try {
        u.releasePointerCapture?.(N.pointerId);
      } catch {
      }
    }
  };
  u.addEventListener("pointerup", q), u.addEventListener("pointercancel", q), u.addEventListener("keydown", (N) => {
    const G = r.duration() || S;
    if (!G) return;
    const J = N.shiftKey ? 30 : 5;
    let Y = null;
    N.key === "ArrowLeft" ? Y = Math.max(0, r.seek() - J) : N.key === "ArrowRight" ? Y = Math.min(G, r.seek() + J) : N.key === "Home" ? Y = 0 : N.key === "End" && (Y = G), Y != null && (N.preventDefault(), r.seek(Y), L());
  });
  function Z(N) {
    N.key === "Escape" ? (N.preventDefault(), Ce()) : (N.key === " " || N.code === "Space") && i.contains(document.activeElement) && (N.preventDefault(), r.isPlaying() ? r.pause() : r.play());
  }
  function O(N) {
    !i.contains(N.target) && !t.contains(N.target) && Ce();
  }
  document.addEventListener("keydown", Z), setTimeout(() => document.addEventListener("mousedown", O), 0), document.body.appendChild(i), U(i, t), L(), _.focus(), $e = {
    pop: i,
    backend: r,
    onKey: Z,
    onDocClick: O,
    cleanup: () => {
      V();
      try {
        r.off("load", B), r.off("play", H), r.off("pause", F), r.off("end", W);
      } catch {
      }
      r.destroy();
    }
  };
}
function Ce() {
  if (!$e) return;
  const { pop: t, onKey: s, onDocClick: e, cleanup: n } = $e;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), n(), t.remove(), $e = null;
}
function Nn({
  truthy: t = lt,
  disabled: s = !1
} = {}) {
  return (e) => {
    const { value: n, row: r, col: i, api: o, td: a } = e;
    a && a.classList.add("sg-renderer-switch-cell");
    const l = n == null || n === "", c = !l && t(n), d = f("button", {
      type: "button",
      class: `sg-renderer-switch${c ? " is-on" : ""}${l ? " is-null" : ""}`,
      role: "switch",
      "aria-checked": l ? "mixed" : c ? "true" : "false",
      "aria-label": i?.field || "toggle",
      disabled: s ? "" : null
    });
    return d.append(f("span", { class: "sg-renderer-switch-thumb", "aria-hidden": "true" })), d.addEventListener("click", (u) => {
      if (u.stopPropagation(), s) return;
      const p = l ? !0 : !c, g = r && i?.field != null ? r[i.field] : null;
      r && i?.field != null && (r[i.field] = p), o?.applyTransaction && o.applyTransaction({ update: [r] });
      const h = a?.closest('[data-controller~="grid"]');
      h && h.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: r?.id ?? r?._sg_id, colId: i?.field, oldValue: g, newValue: p }
      }));
    }), d;
  };
}
const pi = /^(https?:\/\/|mailto:)/i;
function qe(t) {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function it(t) {
  let s = t;
  return s = s.replace(/`([^`\n]+)`/g, (e, n) => `<code>${n}</code>`), s = s.replace(/\[([^\]\n]+)\]\(([^)\n]+)\)/g, (e, n, r) => pi.test(r) ? `<a href="${r}" target="_blank" rel="noopener noreferrer">${n}</a>` : e), s = s.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>"), s = s.replace(/__([^_\n]+)__/g, "<strong>$1</strong>"), s = s.replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), s = s.replace(/(^|[\s(])_([^_\n]+?)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), s = s.replace(/~~([^~\n]+)~~/g, "<del>$1</del>"), s;
}
function fi(t) {
  const s = t.split(`
`), e = [];
  let n = null, r = [];
  const i = () => {
    n && (e.push(`<${n}>${r.map((o) => `<li>${it(o)}</li>`).join("")}</${n}>`), n = null, r = []);
  };
  for (const o of s) {
    const a = /^\s*[-*]\s+(.+)$/.exec(o), l = /^\s*\d+\.\s+(.+)$/.exec(o);
    a ? (n && n !== "ul" && i(), n = "ul", r.push(a[1])) : l ? (n && n !== "ol" && i(), n = "ol", r.push(l[1])) : (i(), o.trim() === "" ? e.push("") : e.push(it(o)));
  }
  return i(), e.join("<br>").replace(/(<br>){2,}/g, "<br><br>");
}
function Rn({ inline: t = !1 } = {}) {
  return ({ value: s, td: e }) => {
    if ($(s)) return "";
    const n = qe(s), r = t ? it(n) : fi(n);
    if (e) {
      e.classList.add("sg-renderer-markdown-cell");
      const o = e.parentElement;
      o && o.tagName === "TR" && o.classList.add("sg-has-multiline");
    }
    const i = f("div", { class: `sg-renderer-markdown${t ? " is-inline" : ""}` });
    return i.innerHTML = r, i;
  };
}
function gi(t) {
  return qe(t).replace(/(&quot;(?:[^&\\]|\\.)*?&quot;)\s*:/g, '<span class="sg-json-key">$1</span>:').replace(/:\s*(&quot;(?:[^&\\]|\\.)*?&quot;)/g, ': <span class="sg-json-string">$1</span>').replace(/(?<=[\s:,\[])(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)(?=[\s,\]\}\n])/g, '<span class="sg-json-number">$1</span>').replace(/(?<=[\s:,\[])(true|false)(?=[\s,\]\}\n])/g, '<span class="sg-json-bool">$1</span>').replace(/(?<=[\s:,\[])(null)(?=[\s,\]\}\n])/g, '<span class="sg-json-null">$1</span>');
}
function hi(t, s) {
  const e = Array.isArray(t), n = e ? t : Object.entries(t), r = n.slice(0, s), i = n.length - r.length, o = (c) => {
    if (c == null) return "null";
    const d = typeof c;
    return d === "string" ? c.length > 18 ? `"${c.slice(0, 15)}…"` : `"${c}"` : d === "number" || d === "boolean" ? String(c) : Array.isArray(c) ? `[${c.length}]` : d === "object" ? "{…}" : String(c);
  }, a = e ? r.map(o).join(", ") : r.map(([c, d]) => `${c}: ${o(d)}`).join(", "), l = i > 0 ? `, +${i}` : "";
  return e ? `[${a}${l}]` : `{ ${a}${l} }`;
}
function $n({ maxKeys: t = 3, indent: s = 2 } = {}) {
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
      return f("span", { class: "sg-renderer-json-scalar sg-json-null" }, document.createTextNode("null"));
    if (typeof r != "object") {
      const c = typeof r, d = c === "string" ? "sg-json-string" : c === "number" ? "sg-json-number" : "sg-json-bool", u = c === "string" ? `"${r}"` : String(r);
      return f("span", { class: `sg-renderer-json-scalar ${d}` }, document.createTextNode(u));
    }
    const i = document.createElement("details");
    i.className = "sg-renderer-json";
    const o = document.createElement("summary");
    o.className = "sg-renderer-json-summary";
    const a = f("span", { class: "sg-renderer-json-chevron", "aria-hidden": "true" });
    a.innerHTML = yr, o.append(a), o.append(f(
      "span",
      { class: "sg-renderer-json-summary-text" },
      document.createTextNode(hi(r, t))
    ));
    const l = document.createElement("pre");
    if (l.className = "sg-renderer-json-pre", l.innerHTML = gi(JSON.stringify(r, null, s)), i.append(o, l), o.addEventListener("click", (c) => c.stopPropagation()), n) {
      n.classList.add("sg-renderer-json-cell");
      const c = n.parentElement;
      c && c.tagName === "TR" && c.classList.add("sg-has-multiline");
    }
    return i;
  };
}
function Pn({
  lookup: t = null,
  windowKey: s = "__sgLinks",
  showThumb: e = !0,
  href: n = null,
  multiple: r = !1,
  fallback: i = (o) => String(o)
} = {}) {
  return ({ value: o, row: a }) => {
    if ($(o)) return "";
    const l = r ? Array.isArray(o) ? o : String(o).split(",").map((d) => d.trim()).filter(Boolean) : [o], c = f("span", { class: "sg-renderer-linked-records" });
    for (const d of l) {
      const u = mi(d, a, t, s);
      c.append(bi(d, a, u, { showThumb: e, href: n, fallback: i }));
    }
    return c;
  };
}
function mi(t, s, e, n) {
  if (typeof e == "function") return e(t, s) || null;
  if (typeof window > "u") return null;
  const r = window[n];
  return r ? r instanceof Map ? r.get(t) || r.get(String(t)) || null : typeof r == "object" ? r[t] ?? r[String(t)] ?? null : null : null;
}
function bi(t, s, e, { showThumb: n, href: r, fallback: i }) {
  const o = e?.name ?? i(t), a = typeof r == "function" ? r(t, s, e) : e?.href || null, l = document.createElement(a ? "a" : "span");
  if (l.className = "sg-renderer-linked-record", a && (l.href = a, l.target = "_blank", l.rel = "noopener noreferrer", l.addEventListener("click", (c) => c.stopPropagation())), e?.color && l.style.setProperty("--lr-tint", e.color), n && e?.thumb)
    l.append(f("img", {
      src: e.thumb,
      alt: "",
      class: "sg-renderer-linked-record-thumb",
      loading: "lazy",
      decoding: "async"
    }));
  else if (n && o) {
    const c = String(o).split(/\s+/).filter(Boolean).slice(0, 2).map((d) => d[0]?.toUpperCase() || "").join("");
    c && l.append(f("span", {
      class: "sg-renderer-linked-record-initials",
      "aria-hidden": "true"
    }, document.createTextNode(c)));
  }
  return l.append(f(
    "span",
    { class: "sg-renderer-linked-record-name" },
    document.createTextNode(o)
  )), l;
}
function Vn({
  separator: t = ",",
  colorMap: s = {},
  defaultColor: e = "gray"
} = {}) {
  const n = {};
  for (const [r, i] of Object.entries(s)) n[String(r).toLowerCase()] = i;
  return ({ value: r }) => {
    if ($(r)) return "";
    const i = Array.isArray(r) ? r : String(r).split(t), o = f("div", { class: "sg-renderer-coloured-tags" });
    for (const a of i) {
      const l = String(a).trim();
      if (!l) continue;
      const c = n[l.toLowerCase()] || e, d = f(
        "span",
        { class: "sg-renderer-coloured-tag" },
        document.createTextNode(l)
      );
      /^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/.test(c) ? d.classList.add(`sg-pill-${c}`) : (d.style.background = c, d.style.color = In(c)), o.append(d);
    }
    return o;
  };
}
function In(t) {
  const s = dn(t);
  return s ? un(s) ? "#1f2937" : "#ffffff" : "inherit";
}
function ut(t) {
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
function Fn({
  style: t = "24h",
  // '24h' | '12h'
  seconds: s = !1,
  locale: e = void 0
} = {}) {
  return ({ value: n }) => {
    const r = ut(n);
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
function yi(t) {
  if (Array.isArray(t)) return { from: t[0], to: t[1] };
  if (t && typeof t == "object")
    return {
      from: t.from ?? t.old ?? t.before ?? t.previous ?? null,
      to: t.to ?? t.new ?? t.after ?? t.current ?? null
    };
  const s = String(t), e = /^(.*?)\s*(?:→|->|=>|—>)\s*(.+)$/.exec(s);
  return e ? { from: e[1].trim(), to: e[2].trim() } : { from: null, to: s };
}
function Bn({
  style: t = "inline",
  // 'inline' | 'stacked'
  arrow: s = "→",
  showArrow: e = !0
} = {}) {
  return ({ value: n }) => {
    if ($(n)) return "";
    const { from: r, to: i } = yi(n), o = (l) => l == null || l === "";
    if (o(r) && o(i)) return "";
    if (o(r))
      return f(
        "span",
        { class: "sg-renderer-diff is-added" },
        f("span", { class: "sg-diff-to" }, document.createTextNode(String(i)))
      );
    if (o(i))
      return f(
        "span",
        { class: "sg-renderer-diff is-removed" },
        f("span", { class: "sg-diff-from" }, document.createTextNode(String(r)))
      );
    const a = f("span", { class: `sg-renderer-diff is-${t}` });
    return a.append(f("span", { class: "sg-diff-from" }, document.createTextNode(String(r)))), e && a.append(f(
      "span",
      { class: "sg-diff-arrow", "aria-hidden": "true" },
      document.createTextNode(s)
    )), a.append(f("span", { class: "sg-diff-to" }, document.createTextNode(String(i)))), a;
  };
}
function _i(t) {
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
function Et(t, s) {
  const e = t >= 0 ? 1 : -1, n = Math.abs(t), r = Math.floor(n), i = (n - r) * 60, o = Math.floor(i), a = (i - o) * 60, l = s ? e > 0 ? "N" : "S" : e > 0 ? "E" : "W";
  return `${r}°${String(o).padStart(2, "0")}'${a.toFixed(1)}"${l}`;
}
function Hn({
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
    const a = _i(o);
    if (!a) return "";
    const l = f("span", { class: "sg-renderer-geo" });
    if (typeof r == "function") {
      const u = r(a.lat, a.lng);
      u && l.append(f("img", {
        src: u,
        alt: "",
        class: "sg-renderer-geo-thumb",
        width: String(i),
        height: String(i),
        loading: "lazy",
        decoding: "async"
      }));
    }
    const c = s === "dms" ? `${Et(a.lat, !0)} ${Et(a.lng, !1)}` : `${a.lat.toFixed(t)}, ${a.lng.toFixed(t)}`;
    l.append(f("span", { class: "sg-renderer-geo-coords" }, document.createTextNode(c)));
    const d = e(a.lat, a.lng);
    if (d) {
      const u = f("a", {
        class: "sg-renderer-geo-link sg-renderer-link",
        href: d,
        target: "_blank",
        rel: "noopener noreferrer",
        title: "Open in maps"
      }, document.createTextNode(n));
      u.addEventListener("click", (p) => p.stopPropagation()), l.append(u);
    }
    return l;
  };
}
function On({
  moduleSize: t = 3,
  margin: s = 2,
  background: e = "#fff",
  foreground: n = "#111827",
  showText: r = !1
} = {}) {
  return ({ value: i }) => {
    if ($(i)) return "";
    const o = String(i);
    let a;
    try {
      const c = cr(o);
      a = br(c, { moduleSize: t, margin: s, background: e, foreground: n });
    } catch {
      return f(
        "span",
        { class: "sg-renderer-qr-overflow", title: o },
        document.createTextNode("QR · too long")
      );
    }
    const l = f("span", { class: "sg-renderer-qr" });
    return l.innerHTML = a, r && l.append(f("span", { class: "sg-renderer-qr-text" }, document.createTextNode(o))), l;
  };
}
function Gn({
  language: t = null,
  copy: s = !0
} = {}) {
  return ({ value: e, td: n }) => {
    if ($(e)) return "";
    const r = String(e);
    if (n) {
      n.classList.add("sg-renderer-code-cell");
      const a = n.parentElement;
      a && a.tagName === "TR" && a.classList.add("sg-has-multiline");
    }
    const i = f("div", { class: "sg-renderer-code" });
    if (t && i.append(f(
      "span",
      { class: "sg-renderer-code-lang" },
      document.createTextNode(String(t))
    )), s) {
      const a = f("button", {
        type: "button",
        class: "sg-renderer-code-copy",
        title: "Copy",
        "aria-label": "Copy code"
      });
      a.innerHTML = je, a.addEventListener("click", async (l) => {
        l.stopPropagation();
        try {
          navigator.clipboard?.writeText ? await navigator.clipboard.writeText(r) : on(r), a.innerHTML = sn, a.classList.add("is-copied"), setTimeout(() => {
            a.innerHTML = je, a.classList.remove("is-copied");
          }, 1200);
        } catch {
        }
      }), i.append(a);
    }
    const o = f("pre", { class: "sg-renderer-code-pre" });
    return o.textContent = r, i.append(o), i;
  };
}
const wi = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M225.8 468.2L46.9 295.4C18.9 268.2 0 230.1 0 187.8C0 117.4 56.1 60 125.7 60c25.3 0 51 9.2 70.3 25.4L256 138l60-52.6C335.3 69.2 361 60 386.3 60C455.9 60 512 117.4 512 187.8c0 42.3-18.9 80.4-46.9 107.6L286.2 468.2c-7.2 7.4-17.1 11.8-27.6 11.8c-10.5 0-20.4-4.4-27.6-11.8z"/></svg>', vi = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75.1c16.3-13.2 28.9-30.4 36.6-50l8.1-20.3c5-12.4 11.3-24.2 19-35.2l4.4-6.3 0 0c1.4-2 1.1-4.7-.6-6.4l0 0c-3.8-3.8-9.9-3.8-13.7 0L208.8 84.9c-3 3-7 4.7-11.3 4.7c-8.8 0-16-7.2-16-16V63.4c0-8.8 7.2-16 16-16h.5c8.8 0 16 7.2 16 16v6.2c34-2.4 71-13 100-25.6c11-4.8 22.1-9.3 33-13.6l1-.4c12-4.6 27.3-9.3 41.4-9.3z"/></svg>', Ci = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75.1c16.3 13.2 28.9 30.4 36.6 50l8.1 20.3c5 12.4 11.3 24.2 19 35.2l4.4 6.3c1.4 2 1.1 4.7-.6 6.4c-3.8 3.8-9.9 3.8-13.7 0L208.8 427.1c-3-3-7-4.7-11.3-4.7c-8.8 0-16 7.2-16 16v10.2c0 8.8 7.2 16 16 16h.5c8.8 0 16-7.2 16-16v-6.2c34 2.4 71 13 100 25.6c11 4.8 22.1 9.3 33 13.6l1 .4c12 4.6 27.3 9.3 41.4 9.3z"/></svg>', et = ["😞", "😕", "😐", "🙂", "😄"], At = {
  star: he,
  heart: wi
}, Tt = {
  star: "#f59e0b",
  heart: "#ec4899"
};
function zn({
  icon: t = "heart",
  max: s = 5,
  precision: e = 0.5,
  color: n = null
} = {}) {
  if (t === "smiley") return Si({ max: s });
  if (t === "thumb") return xi();
  if (t === "nps") return Li();
  const r = At[t] || At.heart, i = n || Tt[t] || Tt.heart, o = e > 0 ? 1 / e : 2;
  return ({ value: a }) => {
    let l = parseFloat(a);
    Number.isFinite(l) || (l = 0), l = Math.max(0, Math.min(s, l)), l = Math.round(l * o) / o;
    const c = f("div", {
      class: `sg-renderer-rating is-${t}`,
      style: `--rating-color: ${i};`,
      role: "img",
      "aria-label": `${l} out of ${s}`
    });
    for (let d = 1; d <= s; d++)
      if (l >= d)
        c.append(f("span", { class: "sg-renderer-rating-glyph is-full" }, r));
      else if (l > d - 1) {
        const u = Math.round((l - (d - 1)) * 100);
        c.append(f(
          "span",
          { class: "sg-renderer-rating-glyph is-partial" },
          `${r}<span class="sg-rating-clip" style="width:${u}%;">${r}</span>`
        ));
      } else
        c.append(f("span", { class: "sg-renderer-rating-glyph is-empty" }, r));
    return c;
  };
}
function Si({ max: t = 5 } = {}) {
  return ({ value: s }) => {
    let e = parseFloat(s);
    if (!Number.isFinite(e)) return "";
    e = Math.max(1, Math.min(t, Math.round(e)));
    const n = Math.min(
      et.length - 1,
      Math.floor((e - 1) / (t - 1 || 1) * (et.length - 1))
    );
    return f("span", {
      class: "sg-renderer-rating-smiley",
      title: `${e}/${t}`
    }, document.createTextNode(et[n]));
  };
}
function xi() {
  return ({ value: t }) => {
    if (t == null || t === "") return "";
    const s = Number(t);
    if (!Number.isFinite(s)) return "";
    const e = f("span", { class: "sg-renderer-rating-thumb" });
    return s > 0 ? (e.classList.add("is-up"), e.title = "Thumbs up", e.innerHTML = vi) : s < 0 ? (e.classList.add("is-down"), e.title = "Thumbs down", e.innerHTML = Ci) : (e.classList.add("is-neutral"), e.title = "Neutral", e.append(document.createTextNode("—"))), e;
  };
}
function Li() {
  return ({ value: t }) => {
    const s = parseFloat(t);
    if (!Number.isFinite(s)) return "";
    const e = Math.max(0, Math.min(10, Math.round(s))), n = e <= 6 ? "detractor" : e <= 8 ? "passive" : "promoter", r = n === "detractor" ? "Detractor" : n === "passive" ? "Passive" : "Promoter";
    return f("span", {
      class: `sg-renderer-rating-nps is-${n}`,
      title: `${e}/10 · ${r}`
    }, document.createTextNode(String(e)));
  };
}
const ki = ["#e5e7eb", "#d1d5db", "#9ca3af"];
function jn({
  min: t = 0,
  max: s = 100,
  target: e = null,
  ranges: n = null,
  // [a] | [a, b] | [a, b, c]
  rangeColors: r = ki,
  barColor: i = "#111827",
  targetColor: o = "#111827",
  width: a = 120,
  height: l = 16
} = {}) {
  return ({ value: c }) => {
    let d, u, p;
    if (c && typeof c == "object" && !Array.isArray(c) ? (d = Number(c.value), u = c.target != null ? Number(c.target) : e, p = c.ranges || n) : (d = Number(c), u = e, p = n), !Number.isFinite(d)) return "";
    const g = s - t || 1, h = (S) => Math.max(t, Math.min(s, S)), y = (S) => (h(S) - t) / g * a, m = p && p.length ? p.map(Number) : [t + g * 0.6, t + g * 0.8], w = [t, ...m, s];
    let b = "";
    for (let S = 0; S < w.length - 1; S++) {
      const T = y(w[S]), D = y(w[S + 1]) - T, x = r[S] || r[r.length - 1];
      b += `<rect x="${T.toFixed(2)}" y="0" width="${D.toFixed(2)}" height="${l}" fill="${x}"/>`;
    }
    const _ = l * 0.42, C = (l - _) / 2;
    if (b += `<rect x="0" y="${C.toFixed(2)}" width="${y(d).toFixed(2)}" height="${_.toFixed(2)}" fill="${i}"/>`, u != null && Number.isFinite(u)) {
      const S = y(u), T = l * 0.85, D = (l - T) / 2;
      b += `<rect x="${(S - 1).toFixed(2)}" y="${D.toFixed(2)}" width="2" height="${T.toFixed(2)}" fill="${o}"/>`;
    }
    return `<svg class="sg-renderer-bullet" viewBox="0 0 ${a} ${l}" width="${a}" height="${l}" preserveAspectRatio="none" aria-hidden="true">` + b + "</svg>";
  };
}
function Kn({
  size: t = 28,
  thickness: s = 5,
  color: e = "green",
  background: n = "#e5e7eb",
  showValue: r = !0,
  inline: i = !1
} = {}) {
  const o = ct[e] || e;
  return ({ value: a }) => {
    let l = Number(a);
    if (!Number.isFinite(l)) return "";
    l = Math.max(0, Math.min(100, l));
    const c = (t - s) / 2, d = t / 2, u = t / 2, p = 2 * Math.PI * c, g = p * (1 - l / 100), h = `<text x="${d}" y="${u + 0.5}" text-anchor="middle" dominant-baseline="middle" font-size="${(t * 0.32).toFixed(1)}" font-weight="600" fill="currentColor">${Math.round(l)}</text>`, y = `<svg class="sg-renderer-donut" viewBox="0 0 ${t} ${t}" width="${t}" height="${t}" aria-hidden="true"><circle cx="${d}" cy="${u}" r="${c}" fill="none" stroke="${n}" stroke-width="${s}"/><circle cx="${d}" cy="${u}" r="${c}" fill="none" stroke="${o}" stroke-width="${s}" stroke-dasharray="${p.toFixed(2)}" stroke-dashoffset="${g.toFixed(2)}" stroke-linecap="round" transform="rotate(-90 ${d} ${u})"/>` + (r && !i ? h : "") + "</svg>";
    return i && r ? `<span class="sg-renderer-donut-wrap">${y}<span class="sg-renderer-donut-label">${Math.round(l)}%</span></span>` : y;
  };
}
function qn({
  width: t = 120,
  height: s = 32,
  color: e = "blue",
  highlightMax: n = !1,
  gap: r = 1,
  binLabels: i = null,
  showCount: o = !1
} = {}) {
  const a = ct[e] || e;
  return ({ value: l, td: c }) => {
    if (l == null || l === "") return "";
    c && c.classList.add("sg-renderer-histogram-cell");
    let d = l, u = i;
    if (l && typeof l == "object" && !Array.isArray(l) && (d = l.counts, u = l.labels || i), !Array.isArray(d)) return "";
    const p = d.map(Number).filter(Number.isFinite);
    if (p.length === 0) return "";
    const g = Math.max(...p, 1), h = p.reduce((x, L) => x + L, 0), y = u && u.length ? 10 : 0, m = 1, w = 1, b = t - m * 2, _ = s - w * 2 - y, C = Math.max(1, (b - (p.length - 1) * r) / p.length);
    let S = "";
    for (let x = 0; x < p.length; x++) {
      const L = p[x], A = L / g * _, R = m + x * (C + r), V = w + _ - A, B = n ? L === g ? 1 : 0.45 : 0.85, H = u && u[x] != null ? `${u[x]}: ${L}` : `Bin ${x + 1}: ${L}`;
      S += `<rect x="${R.toFixed(2)}" y="${V.toFixed(2)}" width="${C.toFixed(2)}" height="${A.toFixed(2)}" fill="${a}" fill-opacity="${B}"><title>${qe(H)}</title></rect>`;
    }
    let T = "";
    if (u && u.length)
      for (let x = 0; x < p.length && x < u.length; x++) {
        const L = m + x * (C + r) + C / 2;
        T += `<text x="${L.toFixed(2)}" y="${(s - 1).toFixed(2)}" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.65">${qe(u[x])}</text>`;
      }
    const D = `<svg class="sg-renderer-histogram" viewBox="0 0 ${t} ${s}" width="${t}" height="${s}" preserveAspectRatio="none" aria-hidden="true">` + S + T + "</svg>";
    return o ? `<span class="sg-renderer-histogram-wrap">${D}<span class="sg-renderer-histogram-total">n=${h}</span></span>` : D;
  };
}
const ot = {
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
}, Ei = { red: "#ef4444", amber: "#f59e0b", green: "#10b981" };
function Un({
  size: t = 10,
  thresholds: s = null,
  inverted: e = !1,
  showLabel: n = !1
} = {}) {
  return ({ value: r }) => {
    if ($(r)) return "";
    let i;
    if (s && Number.isFinite(Number(r))) {
      const a = Number(r), l = e ? s[1] : s[0], c = e ? s[0] : s[1];
      e ? i = a >= l ? "red" : a >= c ? "amber" : "green" : i = a <= l ? "red" : a <= c ? "amber" : "green";
    } else if (i = ot[String(r).toLowerCase()] || null, !i) return "";
    const o = f("span", {
      class: `sg-renderer-rag is-${i}`,
      title: n ? null : i.charAt(0).toUpperCase() + i.slice(1)
    });
    return o.append(f("span", {
      class: "sg-renderer-rag-dot",
      style: `width:${t}px; height:${t}px; background:${Ei[i]};`,
      "aria-label": i
    })), n && o.append(f(
      "span",
      { class: "sg-renderer-rag-label" },
      document.createTextNode(i.charAt(0).toUpperCase() + i.slice(1))
    )), o;
  };
}
function Wn({
  steps: t = ["Pending", "Shipped", "Delivered"],
  color: s = "#2563eb",
  showLabels: e = !1
} = {}) {
  return ({ value: n, td: r }) => {
    if ($(n)) return "";
    r && r.classList.add("sg-renderer-timeline-cell");
    let i = -1;
    if (Number.isFinite(Number(n)))
      i = Math.max(0, Math.min(t.length - 1, Math.floor(Number(n))));
    else {
      const a = String(n).toLowerCase();
      i = t.findIndex((l) => String(l).toLowerCase() === a);
    }
    if (i < 0) return "";
    const o = f("div", {
      class: `sg-renderer-timeline${e ? " has-labels" : ""}`,
      style: `--ts-color: ${s};`,
      role: "list",
      "aria-label": `Step ${i + 1} of ${t.length}: ${t[i]}`
    });
    for (let a = 0; a < t.length; a++) {
      const l = a < i ? "past" : a === i ? "current" : "future", c = f("span", { class: `sg-timeline-step is-${l}`, role: "listitem" });
      if (c.append(f("span", { class: "sg-timeline-dot", title: t[a], "aria-label": t[a] })), e && c.append(f("span", { class: "sg-timeline-label" }, document.createTextNode(t[a]))), o.append(c), a < t.length - 1) {
        const d = a < i ? "past" : "future";
        o.append(f("span", { class: `sg-timeline-line is-${d}`, "aria-hidden": "true" }));
      }
    }
    return o;
  };
}
const Ai = /([@#][a-zA-Z0-9_\-]+)/g;
function Yn({
  mentionHref: t = null,
  tagHref: s = null
} = {}) {
  return ({ value: e }) => {
    if ($(e)) return "";
    const n = String(e), r = f("span", { class: "sg-renderer-mentions" }), i = n.split(Ai);
    for (const o of i)
      if (o)
        if (o[0] === "@") {
          const a = o.slice(1), l = typeof t == "function" ? t(a) : null;
          r.append(Mt(o, l, "sg-renderer-mention"));
        } else if (o[0] === "#") {
          const a = o.slice(1), l = typeof s == "function" ? s(a) : null;
          r.append(Mt(o, l, "sg-renderer-hashtag"));
        } else
          r.append(document.createTextNode(o));
    return r;
  };
}
function Mt(t, s, e) {
  const n = s ? f("a", { href: s, target: "_blank", rel: "noopener noreferrer", class: e }) : f("span", { class: e });
  return s && n.addEventListener("click", (r) => r.stopPropagation()), n.append(document.createTextNode(t)), n;
}
function Xn({
  chars: t = null,
  lines: s = null,
  moreLabel: e = "Read more",
  lessLabel: n = "Show less"
} = {}) {
  return ({ value: r, td: i }) => {
    if ($(r)) return "";
    const o = String(r), a = t && o.length > t;
    if (!a && !s) return o;
    if (i) {
      i.classList.add("sg-renderer-expand-cell");
      const d = i.parentElement;
      d && d.tagName === "TR" && d.classList.add("sg-has-multiline");
    }
    const l = f("div", { class: "sg-renderer-expand" });
    let c = !1;
    if (a) {
      const d = o.slice(0, t).trimEnd() + "…", u = f(
        "span",
        { class: "sg-renderer-expand-short" },
        document.createTextNode(d)
      ), p = f(
        "span",
        { class: "sg-renderer-expand-full", hidden: "" },
        document.createTextNode(o)
      ), g = f(
        "button",
        { type: "button", class: "sg-renderer-expand-toggle" },
        document.createTextNode(e)
      );
      g.addEventListener("click", (h) => {
        h.stopPropagation(), c = !c, u.hidden = c, p.hidden = !c, g.textContent = c ? n : e;
      }), l.append(u, p, document.createTextNode(" "), g);
    } else {
      const d = f("div", { class: "sg-renderer-expand-clamp" });
      d.style.setProperty("--sg-clamp", String(s)), d.textContent = o;
      const u = f(
        "button",
        { type: "button", class: "sg-renderer-expand-toggle" },
        document.createTextNode(e)
      );
      u.addEventListener("click", (p) => {
        p.stopPropagation(), c = !c, d.classList.toggle("is-expanded", c), u.textContent = c ? n : e;
      }), l.append(d, u);
    }
    return l;
  };
}
function Jn({
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
    if (l && l.classList.add("sg-renderer-number"), $(a)) return "";
    const c = Number(a);
    return Number.isFinite(c) ? o.format(c) : String(a);
  };
}
const Ti = /^((25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(25[0-5]|2[0-4]\d|[01]?\d?\d)$/, Mi = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|:(:[0-9a-fA-F]{1,4}){1,7}|::)$/;
function Di(t) {
  return Ti.test(t);
}
function Ni(t) {
  return Mi.test(t);
}
function Qn({
  countryField: t = null
} = {}) {
  return ({ value: s, row: e }) => {
    if ($(s)) return "";
    const n = String(s).trim(), r = Di(n), i = !r && Ni(n);
    if (!r && !i)
      return f("span", {
        class: "sg-renderer-ip is-invalid",
        title: "Invalid IP address"
      }, document.createTextNode(n));
    const o = f("span", {
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
        o.append(f("span", {
          class: "sg-renderer-ip-flag",
          "aria-hidden": "true"
        }, document.createTextNode(l)));
      }
    }
    return o.append(f(
      "span",
      { class: "sg-renderer-ip-text" },
      document.createTextNode(n)
    )), o;
  };
}
const Ri = {
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
function Zn({
  banks: t = Ri,
  showBank: s = !0
} = {}) {
  return ({ value: e }) => {
    if ($(e)) return "";
    const n = String(e).trim(), r = n.replace(/\D/g, "");
    if (r.length !== 6)
      return f("span", {
        class: "sg-renderer-invalid",
        title: "Invalid BSB — must be 6 digits"
      }, document.createTextNode(n));
    const i = `${r.slice(0, 3)}-${r.slice(3)}`, o = r.slice(0, 2), a = t[o], l = f("span", { class: "sg-renderer-bsb" });
    return l.append(f(
      "span",
      { class: "sg-renderer-bsb-number sg-renderer-mono" },
      document.createTextNode(i)
    )), s && a && l.append(f(
      "span",
      { class: "sg-renderer-bsb-bank" },
      document.createTextNode(a)
    )), l;
  };
}
function $i(t) {
  const s = String(t).replace(/\s+/g, "");
  if (s.length !== 9 || !/^\d{9}$/.test(s)) return !1;
  const e = [8, 7, 6, 5, 4, 3, 2, 1];
  let n = 0;
  for (let r = 0; r < 8; r++) n += parseInt(s[r], 10) * e[r];
  return parseInt(s[8], 10) === (10 - n % 10) % 10;
}
function Pi(t) {
  const s = String(t).replace(/\D/g, "");
  return s.length !== 9 ? String(t) : `${s.slice(0, 3)} ${s.slice(3, 6)} ${s.slice(6)}`;
}
function es() {
  return ({ value: t }) => {
    if ($(t)) return "";
    if (!$i(t))
      return f("span", {
        class: "sg-renderer-invalid",
        title: "Invalid ACN (checksum failed)"
      }, document.createTextNode(String(t)));
    const s = String(t).replace(/\s+/g, "");
    return f("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/Search/ResultsActiveASIC?SearchText=${s}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(Pi(t)));
  };
}
function ts() {
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-mask-numeric"), $(t)) return "";
    const e = String(t), n = e.replace(/\D/g, "");
    if (n.length < 8 || n.length > 9)
      return f("span", {
        class: "sg-renderer-invalid",
        title: "Invalid TFN — must be 8 or 9 digits"
      }, document.createTextNode(e));
    const r = n.slice(-3), i = n.length - 3, o = "•".repeat(i);
    return n.length === 9 ? `${o.slice(0, 3)} ${o.slice(3)} ${r}` : `${o.slice(0, 2)} ${o.slice(2)} ${r}`;
  };
}
function Vi(t) {
  if (t.length !== 10 || !/^[2-6]\d{9}$/.test(t)) return !1;
  const s = [1, 3, 7, 9, 1, 3, 7, 9];
  let e = 0;
  for (let n = 0; n < 8; n++) e += parseInt(t[n], 10) * s[n];
  return e % 10 === parseInt(t[8], 10);
}
function ns() {
  return ({ value: t }) => {
    if ($(t)) return "";
    const s = String(t).trim().replace(/\s+/g, ""), e = /^(\d{10})(?:[\/-]?(\d))?$/.exec(s);
    if (!e || !Vi(e[1]))
      return f("span", {
        class: "sg-renderer-invalid",
        title: e ? "Invalid Medicare (checksum failed)" : "Invalid Medicare format"
      }, document.createTextNode(String(t)));
    const n = e[1], r = e[2], i = `${n.slice(0, 4)} ${n.slice(4, 9)} ${n.slice(9)}` + (r ? ` / ${r}` : "");
    return f(
      "span",
      { class: "sg-renderer-medicare sg-renderer-mono" },
      document.createTextNode(i)
    );
  };
}
function ss({ preload: t = "none" } = {}) {
  return ({ value: s }) => $(s) ? "" : f("audio", {
    class: "sg-renderer-audio",
    controls: "",
    preload: t,
    src: String(s).trim()
  });
}
function rs({ width: t = 200, preload: s = "metadata" } = {}) {
  return ({ value: e }) => $(e) ? "" : f("video", {
    class: "sg-renderer-video",
    controls: "",
    preload: s,
    src: String(e).trim(),
    width: String(t)
  });
}
function is({ sort: t = "count" } = {}) {
  return ({ value: s }) => {
    if ($(s)) return "";
    let e = [];
    if (Array.isArray(s))
      e = s.map((r) => Array.isArray(r) ? r : [r.emoji ?? r.name ?? "?", r.count ?? r.n ?? 0]);
    else if (typeof s == "object")
      e = Object.entries(s);
    else
      return "";
    if (e = e.filter(([, r]) => Number.isFinite(Number(r)) && Number(r) > 0), t === "count" && e.sort((r, i) => Number(i[1]) - Number(r[1])), e.length === 0) return "";
    const n = f("span", { class: "sg-renderer-reactions" });
    for (const [r, i] of e) {
      const o = f("span", { class: "sg-reaction", title: `${i} ${r}` });
      o.append(f("span", { class: "sg-reaction-emoji" }, document.createTextNode(String(r)))), o.append(f("span", { class: "sg-reaction-count" }, document.createTextNode(String(i)))), n.append(o);
    }
    return n;
  };
}
function os({ icon: t = "💬" } = {}) {
  return ({ value: s }) => {
    if ($(s)) return "";
    let e = "", n = null;
    typeof s == "object" ? (e = s.value ?? s.text ?? "", n = s.count ?? s.comments ?? null) : Number.isFinite(Number(s)) && typeof s != "string" ? n = Number(s) : e = String(s);
    const r = f("span", { class: "sg-renderer-comment-count" });
    if (e && r.append(f("span", { class: "sg-cc-value" }, document.createTextNode(String(e)))), n != null && Number(n) > 0) {
      const i = f("span", {
        class: "sg-cc-badge",
        title: `${n} comment${Number(n) === 1 ? "" : "s"}`
      }), o = f("span", { class: "sg-cc-icon", "aria-hidden": "true" });
      typeof t == "string" && t.trimStart().startsWith("<svg") ? o.innerHTML = t : o.append(document.createTextNode(String(t))), i.append(o), i.append(f("span", { class: "sg-cc-num" }, document.createTextNode(String(n)))), r.append(i);
    }
    return r;
  };
}
function as({ locale: t = void 0 } = {}) {
  const e = new Intl.Locale(t || Intl.NumberFormat().resolvedOptions().locale).language === "en", n = e ? new Intl.PluralRules(t, { type: "ordinal" }) : null, r = { one: "st", two: "nd", few: "rd", other: "th" };
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), $(i)) return "";
    const a = Number(i);
    return Number.isInteger(a) ? e ? `${a}${r[n.select(a)]}` : String(a) : String(i);
  };
}
function ls({
  one: t = "item",
  other: s = "items",
  zero: e = null,
  locale: n = void 0
} = {}) {
  const r = new Intl.PluralRules(n);
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), $(i)) return "";
    const a = Number(i);
    return Number.isFinite(a) ? a === 0 && e ? `${a} ${e}` : r.select(a) === "one" ? `${a} ${t}` : `${a} ${s}` : String(i);
  };
}
const Ii = /* @__PURE__ */ new Set(["", "null", "nil", "none", "n/a", "na", "-", "—"]);
function cs({
  placeholder: t = "—",
  emptyOnTokens: s = !0
} = {}) {
  return ({ value: e }) => e == null || typeof e == "string" && (e === "" || s && Ii.has(e.trim().toLowerCase())) ? f(
    "span",
    { class: "sg-renderer-empty", title: "Empty" },
    document.createTextNode(t)
  ) : String(e);
}
function Fi(t) {
  let s = 0, e = !1;
  for (let n = t.length - 1; n >= 0; n--) {
    let r = parseInt(t[n], 10);
    e && (r *= 2, r > 9 && (r -= 9)), s += r, e = !e;
  }
  return s % 10 === 0;
}
function Bi(t) {
  return /^4\d{12}(\d{3,6})?$/.test(t) ? "visa" : /^(5[1-5]\d{14}|2(2[2-9]|[3-6]\d|7[01]|720)\d{12})$/.test(t) ? "mastercard" : /^3[47]\d{13}$/.test(t) ? "amex" : /^(6011\d{12,15}|65\d{14,17}|64[4-9]\d{13}|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9([01]\d|2[0-5]))\d{10,13})$/.test(t) ? "discover" : /^35(2[89]|[3-8]\d)\d{12}$/.test(t) ? "jcb" : /^3(0[0-5]|[68]\d|9\d)\d{11}$/.test(t) ? "diners" : null;
}
function ds({ mask: t = !0 } = {}) {
  return ({ value: s, td: e }) => {
    if (e && e.classList.add("sg-renderer-number"), $(s)) return "";
    const n = String(s).replace(/\D/g, ""), r = n.length >= 13 && n.length <= 19, i = r && Fi(n), o = r ? Bi(n) : null, a = f("span", { class: `sg-renderer-card${i ? "" : " is-invalid"}` });
    o && a.append(f("span", {
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
    return a.append(f(
      "span",
      { class: "sg-renderer-card-num sg-renderer-mono" },
      document.createTextNode(l)
    )), a;
  };
}
function us({
  width: t = "70%",
  height: s = "12px"
} = {}) {
  return ({ value: e }) => e != null && e !== "" && e !== "loading" && e !== "…" ? String(e) : f("span", {
    class: "sg-renderer-shimmer",
    style: `width: ${t}; height: ${s};`,
    "aria-label": "Loading"
  });
}
function le(t) {
  return Array.isArray(t) ? t.map((s) => s == null ? null : typeof s == "object" ? { value: s.value, label: s.label ?? String(s.value), color: s.color || null, icon: s.icon || null } : { value: s, label: String(s), color: null, icon: null }).filter(Boolean) : [];
}
function ce(t, s) {
  const e = f("span", { class: "sg-renderer-select-pill" });
  return t.color ? s.test(t.color) ? e.classList.add(`sg-pill-${t.color}`) : (e.style.background = t.color, e.style.color = In(t.color)) : e.classList.add("sg-renderer-select-pill-bare"), t.icon && e.append(f("span", { class: "sg-renderer-select-pill-icon", "aria-hidden": "true" }, t.icon)), e.append(f(
    "span",
    { class: "sg-renderer-select-pill-label" },
    document.createTextNode(t.label)
  )), e;
}
const de = /^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/;
function pt(t, s) {
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
function ps({
  options: t = [],
  placeholder: s = "Select…",
  editable: e = !0,
  clearable: n = !1,
  colorMap: r = null
} = {}) {
  const i = le(t);
  if (r && typeof r == "object")
    for (const o of i)
      !o.color && Object.prototype.hasOwnProperty.call(r, o.value) && (o.color = r[o.value]);
  return (o) => {
    const { value: a, td: l } = o, c = pt(o, { options: i, placeholder: s, clearable: n, colorMap: r, editable: e });
    let d = i;
    if (i.length === 0 && c.options.length && (d = le(c.options), c.colorMap && typeof c.colorMap == "object"))
      for (const p of d)
        !p.color && Object.prototype.hasOwnProperty.call(c.colorMap, p.value) && (p.color = c.colorMap[p.value]);
    l && (l.classList.add("sg-renderer-select-cell"), l._sgSelectOpts = d, l._sgSelectClearable = c.clearable), c.editable && l && !l._sgSelectEditBound && (l._sgSelectEditBound = !0, l.addEventListener("dblclick", (p) => {
      p._sgSelectHandled || (p._sgSelectHandled = !0, p.stopPropagation(), Hi(l, o));
    }));
    const u = d.find((p) => String(p.value) === String(a)) || null;
    return u ? ce(u, de) : $(a) ? f(
      "span",
      { class: "sg-renderer-select-placeholder" },
      document.createTextNode(c.placeholder)
    ) : f("span", { class: "sg-renderer-select-bare" }, document.createTextNode(String(a)));
  };
}
function te(t) {
  if (!t) return;
  const s = t.closest('[data-controller~="grid"]');
  if (s)
    try {
      s.focus({ preventScroll: !0 });
    } catch {
    }
}
let Pe = null;
function Hi(t, s) {
  Se();
  const e = t._sgSelectOpts || [], n = t._sgSelectClearable, { row: r, col: i } = s, o = r && i?.field != null ? r[i.field] : null, a = f("div", { class: "sg-renderer-select-popover", role: "listbox" });
  a.addEventListener("mousedown", (u) => u.stopPropagation());
  function l(u) {
    const { api: p } = s, g = r && i?.field != null ? r[i.field] : null;
    r && i?.field != null && (r[i.field] = u), p?.applyTransaction && p.applyTransaction({ update: [r] });
    const h = t.closest('[data-controller~="grid"]');
    h && h.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: r?.id ?? r?._sg_id, colId: i?.field, oldValue: g, newValue: u }
    })), Se();
  }
  if (n) {
    const u = f("button", {
      type: "button",
      class: "sg-renderer-select-option sg-renderer-select-option-none",
      role: "option"
    }, document.createTextNode("(none)"));
    u.addEventListener("click", () => l(null)), a.append(u);
  }
  for (const u of e) {
    const p = f("button", {
      type: "button",
      class: `sg-renderer-select-option${String(u.value) === String(o) ? " is-selected" : ""}`,
      role: "option"
    });
    p.append(ce(u, de)), p.addEventListener("click", () => l(u.value)), a.append(p);
  }
  function c(u) {
    u.key === "Escape" && (u.stopPropagation(), Se());
  }
  function d(u) {
    !a.contains(u.target) && !t.contains(u.target) && Se();
  }
  document.addEventListener("keydown", c), setTimeout(() => document.addEventListener("mousedown", d), 0), document.body.appendChild(a), U(a, t), Pe = { pop: a, onKey: c, onDocClick: d, anchor: t };
}
function Se() {
  if (!Pe) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Pe;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Pe = null, te(n);
}
function fs(t) {
  return t == null || t === "" ? [] : Array.isArray(t) ? t.map(String) : String(t).split(",").map((s) => s.trim()).filter(Boolean);
}
function gs({
  options: t = [],
  separator: s = ",",
  placeholder: e = "Add tags…",
  editable: n = !0,
  colorMap: r = null
} = {}) {
  const i = le(t);
  if (r && typeof r == "object")
    for (const o of i)
      !o.color && Object.prototype.hasOwnProperty.call(r, o.value) && (o.color = r[o.value]);
  return (o) => {
    const { value: a, td: l } = o, c = pt(o, { options: i, placeholder: e, colorMap: r, editable: n, separator: s });
    let d = i;
    if (i.length === 0 && c.options.length && (d = le(c.options), c.colorMap && typeof c.colorMap == "object"))
      for (const g of d)
        !g.color && Object.prototype.hasOwnProperty.call(c.colorMap, g.value) && (g.color = c.colorMap[g.value]);
    l && (l.classList.add("sg-renderer-multiselect-cell"), l._sgMultiOpts = d, l._sgMultiSep = c.separator), c.editable && l && !l._sgMultiEditBound && (l._sgMultiEditBound = !0, l.addEventListener("dblclick", (g) => {
      g._sgMultiHandled || (g._sgMultiHandled = !0, g.stopPropagation(), Oi(l, o));
    }));
    const u = fs(a);
    if (!u.length)
      return f(
        "span",
        { class: "sg-renderer-multiselect-placeholder" },
        document.createTextNode(c.placeholder)
      );
    const p = f("div", { class: "sg-renderer-multiselect" });
    for (const g of u) {
      const h = d.find((y) => String(y.value) === String(g)) || { label: g, color: null, icon: null };
      p.append(ce(h, de));
    }
    return p;
  };
}
let Ve = null;
function Oi(t, s) {
  tt();
  const e = t._sgMultiOpts || [], n = t._sgMultiSep || ",", { row: r, col: i } = s, o = fs(r && i?.field != null ? r[i.field] : null), a = new Set(o), l = f("div", { class: "sg-renderer-multiselect-popover", role: "listbox", "aria-multiselectable": "true" });
  l.addEventListener("mousedown", (h) => h.stopPropagation());
  function c(h) {
    const y = a.has(String(h.value)), m = f("button", {
      type: "button",
      class: `sg-renderer-multiselect-option${y ? " is-selected" : ""}`,
      role: "option",
      "aria-selected": y ? "true" : "false"
    });
    return m.append(f(
      "span",
      { class: `sg-renderer-multiselect-check${y ? " is-on" : ""}` },
      document.createTextNode(y ? "✓" : "")
    )), m.append(ce(h, de)), m.addEventListener("click", () => {
      a.has(String(h.value)) ? a.delete(String(h.value)) : a.add(String(h.value)), l.replaceChildren(), d();
    }), m;
  }
  function d() {
    for (const h of e) l.append(c(h));
  }
  d();
  function u() {
    const { api: h } = s, y = Array.from(a), m = r && i?.field != null ? r[i.field] : null, w = Array.isArray(m) || m == null ? y : y.join(n), b = m;
    r && i?.field != null && (r[i.field] = w), h?.applyTransaction && h.applyTransaction({ update: [r] });
    const _ = t.closest('[data-controller~="grid"]');
    _ && _.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: r?.id ?? r?._sg_id, colId: i?.field, oldValue: b, newValue: w }
    })), tt();
  }
  function p(h) {
    h.key === "Escape" && (h.stopPropagation(), tt()), h.key === "Enter" && (h.stopPropagation(), h.preventDefault(), u());
  }
  function g(h) {
    !l.contains(h.target) && !t.contains(h.target) && u();
  }
  document.addEventListener("keydown", p), setTimeout(() => document.addEventListener("mousedown", g), 0), document.body.appendChild(l), U(l, t), Ve = { pop: l, onKey: p, onDocClick: g, anchor: t };
}
function tt() {
  if (!Ve) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Ve;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Ve = null, te(n);
}
function hs({
  options: t = [],
  placeholder: s = "Search…",
  editable: e = !0,
  allowCustom: n = !1,
  colorMap: r = null
} = {}) {
  const i = le(t);
  if (r && typeof r == "object")
    for (const o of i)
      !o.color && Object.prototype.hasOwnProperty.call(r, o.value) && (o.color = r[o.value]);
  return (o) => {
    const { value: a, td: l } = o, c = pt(o, { options: i, placeholder: s, colorMap: r, editable: e }), d = o?.col?.cellRendererConfig?.allowCustom ?? n;
    let u = i;
    if (i.length === 0 && c.options.length && (u = le(c.options), c.colorMap && typeof c.colorMap == "object"))
      for (const g of u)
        !g.color && Object.prototype.hasOwnProperty.call(c.colorMap, g.value) && (g.color = c.colorMap[g.value]);
    l && (l.classList.add("sg-renderer-combobox-cell"), l._sgComboOpts = u, l._sgComboAllowCustom = d, l._sgComboPlaceholder = c.placeholder), c.editable && l && !l._sgComboEditBound && (l._sgComboEditBound = !0, l.addEventListener("dblclick", (g) => {
      g._sgComboHandled || (g._sgComboHandled = !0, g.stopPropagation(), Gi(l, o));
    }));
    const p = u.find((g) => String(g.value) === String(a)) || null;
    return p ? ce(p, de) : $(a) ? f(
      "span",
      { class: "sg-renderer-select-placeholder" },
      document.createTextNode(c.placeholder)
    ) : f("span", { class: "sg-renderer-select-bare" }, document.createTextNode(String(a)));
  };
}
let Ie = null;
function Gi(t, s) {
  pe();
  const e = t._sgComboOpts || [], n = !!t._sgComboAllowCustom, r = t._sgComboPlaceholder || "Search…", { row: i, col: o } = s;
  let a = "", l = 0;
  const c = f("div", { class: "sg-renderer-combobox-popover", role: "combobox" });
  c.addEventListener("mousedown", (b) => b.stopPropagation());
  const d = f("input", {
    type: "search",
    class: "sg-renderer-combobox-input",
    placeholder: r,
    autocomplete: "off"
  });
  c.append(d);
  const u = f("div", { class: "sg-renderer-combobox-list", role: "listbox" });
  c.append(u);
  function p(b) {
    const { api: _ } = s, C = i && o?.field != null ? i[o.field] : null;
    i && o?.field != null && (i[o.field] = b), _?.applyTransaction && _.applyTransaction({ update: [i] });
    const S = t.closest('[data-controller~="grid"]');
    S && S.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: i?.id ?? i?._sg_id, colId: o?.field, oldValue: C, newValue: b }
    })), pe();
  }
  function g() {
    const b = a.trim().toLowerCase();
    return b ? e.filter((_) => String(_.label).toLowerCase().includes(b)) : e;
  }
  function h() {
    u.replaceChildren();
    const b = g();
    if (l >= b.length && (l = Math.max(0, b.length - 1)), b.forEach((_, C) => {
      const S = f("button", {
        type: "button",
        class: `sg-renderer-combobox-option${C === l ? " is-highlighted" : ""}`,
        role: "option",
        "aria-selected": C === l ? "true" : "false"
      });
      S.append(ce(_, de)), S.addEventListener("mouseenter", () => {
        l = C, y();
      }), S.addEventListener("click", () => p(_.value)), u.append(S);
    }), b.length === 0) {
      const _ = f("div", { class: "sg-renderer-combobox-empty" });
      n && a.trim() ? _.append(document.createTextNode(`Press Enter to add "${a.trim()}"`)) : _.append(document.createTextNode("No matches")), u.append(_);
    }
  }
  function y() {
    u.querySelectorAll(".sg-renderer-combobox-option").forEach((b, _) => {
      b.classList.toggle("is-highlighted", _ === l), b.setAttribute("aria-selected", _ === l ? "true" : "false");
    });
  }
  d.addEventListener("input", () => {
    a = d.value, l = 0, h();
  }), d.addEventListener("keydown", (b) => {
    const _ = g();
    b.key === "ArrowDown" ? (b.preventDefault(), l = Math.min(_.length - 1, l + 1), y()) : b.key === "ArrowUp" ? (b.preventDefault(), l = Math.max(0, l - 1), y()) : b.key === "Enter" ? (b.preventDefault(), _[l] ? p(_[l].value) : n && a.trim() && p(a.trim())) : b.key === "Escape" && (b.stopPropagation(), pe());
  });
  function m(b) {
    b.key === "Escape" && (b.stopPropagation(), pe());
  }
  function w(b) {
    !c.contains(b.target) && !t.contains(b.target) && pe();
  }
  document.addEventListener("keydown", m), setTimeout(() => document.addEventListener("mousedown", w), 0), document.body.appendChild(c), U(c, t), h(), setTimeout(() => d.focus(), 0), Ie = { pop: c, onKey: m, onDocClick: w, anchor: t };
}
function pe() {
  if (!Ie) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Ie;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Ie = null, te(n);
}
function ye(t) {
  if (!t) return "";
  const s = t.getFullYear(), e = String(t.getMonth() + 1).padStart(2, "0"), n = String(t.getDate()).padStart(2, "0");
  return `${s}-${e}-${n}`;
}
function ae(t, s) {
  return t && s && t.getFullYear() === s.getFullYear() && t.getMonth() === s.getMonth() && t.getDate() === s.getDate();
}
function ms({
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
    const { value: c, td: d } = l, u = l?.col?.cellRendererConfig || {}, p = u.min ? X(u.min) : r ? X(r) : null, g = u.max ? X(u.max) : i ? X(i) : null, h = u.firstDayOfWeek ?? o, y = u.editable ?? e;
    d && (d.classList.add("sg-renderer-datepicker-cell"), d._sgDatePickerMin = p, d._sgDatePickerMax = g, d._sgDatePickerFdow = h), y && d && !d._sgDatePickerBound && (d._sgDatePickerBound = !0, d.addEventListener("dblclick", (w) => {
      w._sgDatePickerHandled || (w._sgDatePickerHandled = !0, w.stopPropagation(), ji(d, l));
    }));
    const m = X(c);
    return m ? f(
      "span",
      { class: "sg-renderer-datepicker-value" },
      document.createTextNode(a.format(m))
    ) : n ? document.createTextNode(n) : "";
  };
}
let Fe = null;
const bs = [
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
], ys = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function zi(t, s, e, n, r, i, o) {
  const a = f("div", { class: "sg-renderer-datepicker-cal" }), l = f("div", { class: "sg-renderer-datepicker-head" }), c = f(
    "button",
    { type: "button", class: "sg-renderer-datepicker-nav", "aria-label": "Previous month" },
    document.createTextNode("‹")
  ), d = f(
    "span",
    { class: "sg-renderer-datepicker-title" },
    document.createTextNode(`${bs[s]} ${t}`)
  ), u = f(
    "button",
    { type: "button", class: "sg-renderer-datepicker-nav", "aria-label": "Next month" },
    document.createTextNode("›")
  );
  l.append(c, d, u);
  const p = f("div", { class: "sg-renderer-datepicker-dows" });
  for (let b = 0; b < 7; b++)
    p.append(f(
      "span",
      { class: "sg-renderer-datepicker-dow" },
      document.createTextNode(ys[(b + o) % 7])
    ));
  const g = f("div", { class: "sg-renderer-datepicker-grid" }), y = (new Date(t, s, 1).getDay() - o + 7) % 7, m = new Date(t, s, 1 - y), w = /* @__PURE__ */ new Date();
  for (let b = 0; b < 42; b++) {
    const _ = new Date(m.getFullYear(), m.getMonth(), m.getDate() + b), C = _.getMonth() === s, S = ae(_, e), T = ae(_, w), D = r && _ < r || i && _ > i, x = ["sg-renderer-datepicker-day"];
    C || x.push("is-other-month"), S && x.push("is-selected"), T && x.push("is-today"), D && x.push("is-disabled");
    const L = f("button", {
      type: "button",
      class: x.join(" "),
      disabled: D ? "" : null,
      title: ye(_)
    }, document.createTextNode(String(_.getDate())));
    L.addEventListener("click", () => n(_)), g.append(L);
  }
  return a.append(l, p, g), { wrap: a, prev: c, next: u, title: d };
}
function ji(t, s) {
  xe();
  const { row: e, col: n } = s, r = X(e && n?.field != null ? e[n.field] : null);
  let i = (r || /* @__PURE__ */ new Date()).getFullYear(), o = (r || /* @__PURE__ */ new Date()).getMonth(), a = r;
  const l = t._sgDatePickerMin || null, c = t._sgDatePickerMax || null, d = t._sgDatePickerFdow ?? 1, u = f("div", { class: "sg-renderer-datepicker-popover", role: "dialog" });
  u.addEventListener("mousedown", (m) => m.stopPropagation());
  function p(m) {
    const { api: w } = s, b = e && n?.field != null ? e[n.field] : null, _ = m ? ye(m) : null;
    e && n?.field != null && (e[n.field] = _), w?.applyTransaction && w.applyTransaction({ update: [e] });
    const C = t.closest('[data-controller~="grid"]');
    C && C.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: e?.id ?? e?._sg_id, colId: n?.field, oldValue: b, newValue: _ }
    })), xe();
  }
  function g() {
    u.replaceChildren();
    const { wrap: m, prev: w, next: b } = zi(i, o, a, p, l, c, d);
    w.addEventListener("click", () => {
      o === 0 ? (o = 11, i -= 1) : o -= 1, g();
    }), b.addEventListener("click", () => {
      o === 11 ? (o = 0, i += 1) : o += 1, g();
    });
    const _ = f("div", { class: "sg-renderer-datepicker-footer" }), C = f(
      "button",
      { type: "button", class: "sg-renderer-datepicker-today" },
      document.createTextNode("Today")
    );
    C.addEventListener("click", () => p(/* @__PURE__ */ new Date()));
    const S = f(
      "button",
      { type: "button", class: "sg-renderer-datepicker-clear" },
      document.createTextNode("Clear")
    );
    S.addEventListener("click", () => p(null)), _.append(C, S), u.append(m, _);
  }
  function h(m) {
    m.key === "Escape" && (m.stopPropagation(), xe());
  }
  function y(m) {
    !u.contains(m.target) && !t.contains(m.target) && xe();
  }
  document.addEventListener("keydown", h), setTimeout(() => document.addEventListener("mousedown", y), 0), document.body.appendChild(u), g(), U(u, t), Fe = { pop: u, onKey: h, onDocClick: y, anchor: t };
}
function xe() {
  if (!Fe) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Fe;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Fe = null, te(n);
}
function _s({
  style: t = "24h",
  // '24h' | '12h'
  minuteStep: s = 5,
  editable: e = !0,
  empty: n = "—"
} = {}) {
  return (r) => {
    const { value: i, td: o } = r, a = r?.col?.cellRendererConfig || {}, l = a.style ?? t, c = a.minuteStep ?? s, d = a.editable ?? e;
    o && (o.classList.add("sg-renderer-timepicker-cell"), o._sgTimePickerStyle = l, o._sgTimePickerStep = c), d && o && !o._sgTimePickerBound && (o._sgTimePickerBound = !0, o.addEventListener("dblclick", (p) => {
      p._sgTimePickerHandled || (p._sgTimePickerHandled = !0, p.stopPropagation(), qi(o, r));
    }));
    const u = ut(i);
    return u ? f(
      "span",
      { class: "sg-renderer-timepicker-value" },
      document.createTextNode(Ki(u, l))
    ) : n;
  };
}
function Ki(t, s) {
  const e = String(t.m).padStart(2, "0");
  if (s === "12h") {
    const n = t.h >= 12 ? "PM" : "AM";
    return `${t.h % 12 || 12}:${e} ${n}`;
  }
  return `${String(t.h).padStart(2, "0")}:${e}`;
}
let Be = null;
function qi(t, s) {
  fe();
  const e = t._sgTimePickerStyle || "24h", n = t._sgTimePickerStep || 5, { row: r, col: i } = s, o = ut(r && i?.field != null ? r[i.field] : null) || { h: 9, m: 0 };
  let a = o.h, l = Math.round(o.m / n) * n;
  l >= 60 && (l = 0);
  const c = f("div", { class: "sg-renderer-timepicker-popover", role: "dialog" });
  c.addEventListener("mousedown", (L) => L.stopPropagation());
  function d(L) {
    const { api: A } = s, R = r && i?.field != null ? r[i.field] : null;
    r && i?.field != null && (r[i.field] = L), A?.applyTransaction && A.applyTransaction({ update: [r] });
    const V = t.closest('[data-controller~="grid"]');
    V && V.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: r?.id ?? r?._sg_id, colId: i?.field, oldValue: R, newValue: L }
    })), fe();
  }
  function u() {
    const L = String(a).padStart(2, "0"), A = String(l).padStart(2, "0");
    d(`${L}:${A}`);
  }
  const p = f("div", { class: "sg-renderer-timepicker-col" });
  p.append(f(
    "div",
    { class: "sg-renderer-timepicker-col-label" },
    document.createTextNode("Hour")
  ));
  const g = f("div", { class: "sg-renderer-timepicker-list" });
  p.append(g);
  function h() {
    g.replaceChildren();
    const L = e === "12h" ? Array.from({ length: 12 }, (A, R) => R === 0 ? 12 : R) : Array.from({ length: 24 }, (A, R) => R);
    for (const A of L) {
      const R = e === "12h" ? a >= 12 ? A === 12 ? 12 : A + 12 : A === 12 ? 0 : A : A, V = R === a, B = f("button", {
        type: "button",
        class: `sg-renderer-timepicker-item${V ? " is-selected" : ""}`
      }, document.createTextNode(e === "12h" ? String(A) : String(A).padStart(2, "0")));
      B.addEventListener("click", () => {
        a = R, h();
      }), B.addEventListener("dblclick", () => {
        a = R, u();
      }), g.append(B), V && setTimeout(() => B.scrollIntoView({ block: "nearest" }), 0);
    }
  }
  const y = f("div", { class: "sg-renderer-timepicker-col" });
  y.append(f(
    "div",
    { class: "sg-renderer-timepicker-col-label" },
    document.createTextNode("Min")
  ));
  const m = f("div", { class: "sg-renderer-timepicker-list" });
  y.append(m);
  function w() {
    m.replaceChildren();
    for (let L = 0; L < 60; L += n) {
      const A = L === l, R = f("button", {
        type: "button",
        class: `sg-renderer-timepicker-item${A ? " is-selected" : ""}`
      }, document.createTextNode(String(L).padStart(2, "0")));
      R.addEventListener("click", () => {
        l = L, w();
      }), R.addEventListener("dblclick", () => {
        l = L, u();
      }), m.append(R), A && setTimeout(() => R.scrollIntoView({ block: "nearest" }), 0);
    }
  }
  const b = f("div", { class: "sg-renderer-timepicker-cols" });
  if (b.append(p, y), e === "12h") {
    const L = f("div", { class: "sg-renderer-timepicker-col" });
    L.append(f(
      "div",
      { class: "sg-renderer-timepicker-col-label" },
      document.createTextNode(" ")
    ));
    const A = f("div", { class: "sg-renderer-timepicker-list" });
    for (const R of ["AM", "PM"]) {
      const V = R === "AM" && a < 12 || R === "PM" && a >= 12, B = f("button", {
        type: "button",
        class: `sg-renderer-timepicker-item${V ? " is-selected" : ""}`
      }, document.createTextNode(R));
      B.addEventListener("click", () => {
        R === "AM" && a >= 12 && (a -= 12), R === "PM" && a < 12 && (a += 12), h(), A.querySelectorAll(".sg-renderer-timepicker-item").forEach((H, F) => {
          H.classList.toggle("is-selected", F === 0 && a < 12 || F === 1 && a >= 12);
        });
      }), A.append(B);
    }
    L.append(A), b.append(L);
  }
  const _ = f("div", { class: "sg-renderer-timepicker-footer" }), C = f(
    "button",
    { type: "button", class: "sg-renderer-timepicker-cancel" },
    document.createTextNode("Cancel")
  ), S = f(
    "button",
    { type: "button", class: "sg-renderer-timepicker-ok" },
    document.createTextNode("Set")
  ), T = f(
    "button",
    { type: "button", class: "sg-renderer-timepicker-clear" },
    document.createTextNode("Clear")
  );
  C.addEventListener("click", () => fe()), T.addEventListener("click", () => d(null)), S.addEventListener("click", () => u()), _.append(T, C, S), c.append(b, _);
  function D(L) {
    L.key === "Escape" && (L.stopPropagation(), fe()), L.key === "Enter" && (L.stopPropagation(), L.preventDefault(), u());
  }
  function x(L) {
    !c.contains(L.target) && !t.contains(L.target) && fe();
  }
  document.addEventListener("keydown", D), setTimeout(() => document.addEventListener("mousedown", x), 0), document.body.appendChild(c), h(), w(), U(c, t), Be = { pop: c, onKey: D, onDocClick: x, anchor: t };
}
function fe() {
  if (!Be) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Be;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Be = null, te(n);
}
function ws(t) {
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
  const n = X(s), r = X(e);
  return !n && !r ? null : { start: n, end: r };
}
function Ui(t, s) {
  if (!t) return "";
  const { start: e, end: n } = t;
  if (!e && !n) return "";
  if (!n || e && ae(e, n))
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
function vs({
  locale: t = void 0,
  editable: s = !0,
  empty: e = "—",
  firstDayOfWeek: n = 1
} = {}) {
  return (r) => {
    const { value: i, td: o } = r, a = r?.col?.cellRendererConfig || {}, l = a.firstDayOfWeek ?? n, c = a.editable ?? s;
    o && (o.classList.add("sg-renderer-daterange-cell"), o._sgRangeFdow = l), c && o && !o._sgRangeBound && (o._sgRangeBound = !0, o.addEventListener("dblclick", (u) => {
      u._sgRangeHandled || (u._sgRangeHandled = !0, u.stopPropagation(), Wi(o, r));
    }));
    const d = ws(i);
    return d ? f(
      "span",
      { class: "sg-renderer-daterange-value" },
      document.createTextNode(Ui(d, t))
    ) : e;
  };
}
let He = null;
function Wi(t, s) {
  Le();
  const { row: e, col: n } = s, r = ws(e && n?.field != null ? e[n.field] : null) || { start: null, end: null };
  let i = r.start, o = r.end, a = (i || /* @__PURE__ */ new Date()).getFullYear(), l = (i || /* @__PURE__ */ new Date()).getMonth();
  const c = t._sgRangeFdow ?? 1, d = f("div", { class: "sg-renderer-daterange-popover", role: "dialog" });
  d.addEventListener("mousedown", (w) => w.stopPropagation());
  function u() {
    const { api: w } = s, b = e && n?.field != null ? e[n.field] : null, _ = i || o ? { start: i ? ye(i) : null, end: o ? ye(o) : null } : null;
    e && n?.field != null && (e[n.field] = _), w?.applyTransaction && w.applyTransaction({ update: [e] });
    const C = t.closest('[data-controller~="grid"]');
    C && C.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: e?.id ?? e?._sg_id, colId: n?.field, oldValue: b, newValue: _ }
    })), Le();
  }
  function p(w) {
    !i || i && o ? (i = w, o = null) : w < i ? (o = i, i = w) : o = w, h();
  }
  function g(w, b) {
    const _ = f("div", { class: "sg-renderer-datepicker-cal" }), C = f("div", { class: "sg-renderer-datepicker-head" }), S = f(
      "button",
      { type: "button", class: "sg-renderer-datepicker-nav" },
      document.createTextNode("‹")
    ), T = f(
      "span",
      { class: "sg-renderer-datepicker-title" },
      document.createTextNode(`${bs[b]} ${w}`)
    ), D = f(
      "button",
      { type: "button", class: "sg-renderer-datepicker-nav" },
      document.createTextNode("›")
    );
    C.append(S, T, D);
    const x = f("div", { class: "sg-renderer-datepicker-dows" });
    for (let H = 0; H < 7; H++)
      x.append(f(
        "span",
        { class: "sg-renderer-datepicker-dow" },
        document.createTextNode(ys[(H + c) % 7])
      ));
    const L = f("div", { class: "sg-renderer-datepicker-grid" }), R = (new Date(w, b, 1).getDay() - c + 7) % 7, V = new Date(w, b, 1 - R), B = /* @__PURE__ */ new Date();
    for (let H = 0; H < 42; H++) {
      const F = new Date(V.getFullYear(), V.getMonth(), V.getDate() + H), W = F.getMonth() === b, Q = ae(F, i), q = ae(F, o), Z = i && o && F > i && F < o, O = ae(F, B), N = ["sg-renderer-datepicker-day"];
      W || N.push("is-other-month"), (Q || q) && N.push("is-selected"), Z && N.push("is-in-range"), O && N.push("is-today");
      const G = f(
        "button",
        { type: "button", class: N.join(" "), title: ye(F) },
        document.createTextNode(String(F.getDate()))
      );
      G.addEventListener("click", () => p(F)), L.append(G);
    }
    return _.append(C, x, L), { wrap: _, prev: S, next: D };
  }
  function h() {
    d.replaceChildren();
    const w = f("div", { class: "sg-renderer-daterange-months" }), b = l === 11 ? a + 1 : a, _ = (l + 1) % 12, C = g(a, l), S = g(b, _);
    C.prev.addEventListener("click", () => {
      l === 0 ? (l = 11, a -= 1) : l -= 1, h();
    }), S.next.addEventListener("click", () => {
      l === 11 ? (l = 0, a += 1) : l += 1, h();
    }), C.next.style.visibility = "hidden", S.prev.style.visibility = "hidden", w.append(C.wrap, S.wrap);
    const T = f("div", { class: "sg-renderer-datepicker-footer" }), D = f(
      "button",
      { type: "button", class: "sg-renderer-datepicker-clear" },
      document.createTextNode("Clear")
    ), x = f(
      "button",
      { type: "button", class: "sg-renderer-timepicker-ok" },
      document.createTextNode("Set")
    );
    D.addEventListener("click", () => {
      i = null, o = null, u();
    }), x.addEventListener("click", u), T.append(D, x), d.append(w, T);
  }
  function y(w) {
    w.key === "Escape" && (w.stopPropagation(), Le()), w.key === "Enter" && (w.stopPropagation(), w.preventDefault(), u());
  }
  function m(w) {
    !d.contains(w.target) && !t.contains(w.target) && Le();
  }
  document.addEventListener("keydown", y), setTimeout(() => document.addEventListener("mousedown", m), 0), document.body.appendChild(d), h(), U(d, t), He = { pop: d, onKey: y, onDocClick: m, anchor: t };
}
function Le() {
  if (!He) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = He;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), He = null, te(n);
}
const Cs = [
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
function Ss({
  palette: t = Cs,
  shape: s = "circle",
  showLabel: e = !1,
  size: n = 14,
  editable: r = !0,
  empty: i = "—"
} = {}) {
  return (o) => {
    const { value: a, td: l } = o, c = o?.col?.cellRendererConfig || {}, d = c.palette || t, u = c.shape ?? s, p = c.showLabel ?? e, g = c.size ?? n, h = c.editable ?? r;
    if (l && (l.classList.add("sg-renderer-colorpicker-cell"), l._sgPickerPalette = d), h && l && !l._sgPickerBound && (l._sgPickerBound = !0, l.addEventListener("dblclick", (w) => {
      w._sgPickerHandled || (w._sgPickerHandled = !0, w.stopPropagation(), Yi(l, o));
    })), $(a)) return i;
    const y = f("span", { class: "sg-renderer-swatch" }), m = String(a).toLowerCase() === "#ffffff" ? " border: 1px solid #d1d5db;" : "";
    return y.append(f("span", {
      class: `sg-renderer-swatch-chip is-${u}`,
      style: `width: ${g}px; height: ${g}px; background: ${a};${m}`,
      title: a
    })), p && y.append(f("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(a))), y;
  };
}
let Oe = null;
function Yi(t, s) {
  ke();
  const e = t._sgPickerPalette || Cs, { row: n, col: r } = s, i = n && r?.field != null ? n[r.field] : null, o = f("div", { class: "sg-renderer-colorpicker-popover", role: "dialog" });
  o.addEventListener("mousedown", (m) => m.stopPropagation());
  function a(m) {
    const { api: w } = s, b = n && r?.field != null ? n[r.field] : null;
    n && r?.field != null && (n[r.field] = m), w?.applyTransaction && w.applyTransaction({ update: [n] });
    const _ = t.closest('[data-controller~="grid"]');
    _ && _.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: n?.id ?? n?._sg_id, colId: r?.field, oldValue: b, newValue: m }
    })), ke();
  }
  const l = f("div", { class: "sg-renderer-colorpicker-grid" });
  for (const m of e) {
    const w = String(i).toLowerCase() === String(m).toLowerCase(), b = f("button", {
      type: "button",
      class: `sg-renderer-colorpicker-swatch${w ? " is-selected" : ""}`,
      style: `background: ${m};`,
      title: m,
      "aria-label": m
    });
    b.addEventListener("click", () => a(m)), l.append(b);
  }
  const c = f("div", { class: "sg-renderer-colorpicker-custom" }), d = f("input", {
    type: "color",
    class: "sg-renderer-colorpicker-native",
    value: /^#[0-9a-fA-F]{6}$/.test(i || "") ? i : "#3b82f6"
  }), u = f("input", {
    type: "text",
    class: "sg-renderer-colorpicker-hex",
    value: i || "",
    placeholder: "#rrggbb"
  });
  d.addEventListener("input", () => {
    u.value = d.value;
  }), u.addEventListener("input", () => {
    /^#[0-9a-fA-F]{6}$/.test(u.value) && (d.value = u.value);
  });
  const p = f(
    "button",
    { type: "button", class: "sg-renderer-timepicker-ok" },
    document.createTextNode("Set")
  ), g = f(
    "button",
    { type: "button", class: "sg-renderer-timepicker-clear" },
    document.createTextNode("Clear")
  );
  g.addEventListener("click", () => a(null)), p.addEventListener("click", () => {
    const m = /^#[0-9a-fA-F]{6}$/.test(u.value) ? u.value : d.value;
    a(m);
  }), c.append(d, u, g, p), o.append(l, c);
  function h(m) {
    if (m.key === "Escape" && (m.stopPropagation(), ke()), m.key === "Enter") {
      m.stopPropagation();
      const w = /^#[0-9a-fA-F]{6}$/.test(u.value) ? u.value : d.value;
      a(w);
    }
  }
  function y(m) {
    !o.contains(m.target) && !t.contains(m.target) && ke();
  }
  document.addEventListener("keydown", h), setTimeout(() => document.addEventListener("mousedown", y), 0), document.body.appendChild(o), U(o, t), Oe = { pop: o, onKey: h, onDocClick: y, anchor: t };
}
function ke() {
  if (!Oe) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Oe;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Oe = null, te(n);
}
function xs({
  lines: t = 3,
  rows: s = 6,
  cols: e = 48,
  separator: n = `
`,
  editable: r = !0,
  empty: i = ""
} = {}) {
  return (o) => {
    const { value: a, td: l } = o, c = o?.col?.cellRendererConfig || {}, d = c.lines ?? t, u = c.rows ?? s, p = c.cols ?? e, g = c.separator ?? n, h = c.editable ?? r;
    if (l && (l.classList.add("sg-renderer-multiline"), l._sgTextareaRows = u, l._sgTextareaCols = p, l._sgTextareaSep = g), h && l && !l._sgTextareaBound && (l._sgTextareaBound = !0, l.addEventListener("dblclick", (m) => {
      m._sgTextareaHandled || (m._sgTextareaHandled = !0, m.stopPropagation(), Xi(l, o));
    })), $(a)) return i;
    const y = String(a);
    if (d != null && d > 0) {
      const m = f("div", {
        class: "sg-renderer-multiline-clamp",
        style: `--sg-multiline-lines: ${d};`,
        title: y
      });
      return m.textContent = y, m;
    }
    return y;
  };
}
let Ge = null;
function Xi(t, s) {
  ie();
  const e = t._sgTextareaRows || 6, n = t._sgTextareaCols || 48, { row: r, col: i } = s, o = r && i?.field != null ? r[i.field] : "", a = f("div", { class: "sg-renderer-textarea-popover", role: "dialog" });
  a.addEventListener("mousedown", (m) => m.stopPropagation());
  const l = f("textarea", { class: "sg-renderer-textarea-input", rows: e, cols: n });
  l.value = o == null ? "" : String(o);
  function c() {
    const { api: m } = s, w = l.value, b = r && i?.field != null ? r[i.field] : null;
    r && i?.field != null && (r[i.field] = w), m?.applyTransaction && m.applyTransaction({ update: [r] });
    const _ = t.closest('[data-controller~="grid"]');
    _ && _.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: r?.id ?? r?._sg_id, colId: i?.field, oldValue: b, newValue: w }
    })), ie();
  }
  const d = f("div", { class: "sg-renderer-textarea-footer" }), u = f(
    "span",
    { class: "sg-renderer-textarea-hint" },
    document.createTextNode("⌘/Ctrl + Enter to save · Esc to cancel")
  ), p = f(
    "button",
    { type: "button", class: "sg-renderer-timepicker-cancel" },
    document.createTextNode("Cancel")
  ), g = f(
    "button",
    { type: "button", class: "sg-renderer-timepicker-ok" },
    document.createTextNode("Save")
  );
  p.addEventListener("click", () => ie()), g.addEventListener("click", c), d.append(u, p, g), a.append(l, d), l.addEventListener("keydown", (m) => {
    m.key === "Enter" && (m.metaKey || m.ctrlKey) ? (m.preventDefault(), c()) : m.key === "Escape" && (m.stopPropagation(), ie());
  });
  function h(m) {
    m.key === "Escape" && (m.stopPropagation(), ie());
  }
  function y(m) {
    !a.contains(m.target) && !t.contains(m.target) && ie();
  }
  document.addEventListener("keydown", h), setTimeout(() => document.addEventListener("mousedown", y), 0), document.body.appendChild(a), U(a, t), setTimeout(() => {
    l.focus(), l.setSelectionRange(l.value.length, l.value.length);
  }, 0), Ge = { pop: a, onKey: h, onDocClick: y, anchor: t };
}
function ie() {
  if (!Ge) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = Ge;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), Ge = null, te(n);
}
function Xe(t, s, e, n) {
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
function Ls({
  label: t = "Go",
  icon: s = null,
  variant: e = "primary",
  action: n = null,
  onClick: r = null,
  disabled: i = !1
} = {}) {
  return (o) => {
    const { td: a, row: l } = o, c = o?.col?.cellRendererConfig || {}, d = c.label ?? t, u = c.icon ?? s, p = c.variant ?? e, g = c.action ?? n, h = typeof i == "function" ? i(l) : c.disabled ?? i;
    a && a.classList.add("sg-renderer-action-cell");
    const y = f("button", {
      type: "button",
      class: `sg-renderer-action-btn is-${p}`,
      disabled: h ? "" : null
    });
    return u && y.append(f("span", { class: "sg-renderer-action-icon", "aria-hidden": "true" }, u)), y.append(f("span", { class: "sg-renderer-action-label" }, document.createTextNode(d))), y.addEventListener("click", (m) => {
      m.stopPropagation(), !h && (typeof r == "function" && r(l, o), g && Xe(a, o, g));
    }), y;
  };
}
const Ji = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="3" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="13" r="1.5" fill="currentColor"/></svg>';
function ks({
  items: t = [],
  icon: s = Ji,
  ariaLabel: e = "Open menu"
} = {}) {
  return (n) => {
    const { td: r } = n, i = n?.col?.cellRendererConfig || {}, o = i.items || t, a = i.icon ?? s;
    r && (r.classList.add("sg-renderer-menu-cell"), r._sgMenuItems = o);
    const l = f("button", {
      type: "button",
      class: "sg-renderer-menu-trigger",
      "aria-label": i.ariaLabel ?? e
    }, a);
    return l.addEventListener("click", (c) => {
      c.stopPropagation(), Es(r, n, o);
    }), l;
  };
}
let ze = null;
function Es(t, s, e) {
  Ee();
  const n = f("div", { class: "sg-renderer-menu-popover", role: "menu" });
  n.addEventListener("mousedown", (o) => o.stopPropagation());
  for (const o of e) {
    if (o === "---" || o === null) {
      n.append(f("div", { class: "sg-renderer-menu-sep", role: "separator" }));
      continue;
    }
    const a = typeof o == "string" ? { label: o, action: o } : o, l = ["sg-renderer-menu-item"];
    a.danger && l.push("is-danger"), a.disabled && l.push("is-disabled");
    const c = f("button", {
      type: "button",
      class: l.join(" "),
      role: "menuitem",
      disabled: a.disabled ? "" : null
    });
    a.icon && c.append(f("span", { class: "sg-renderer-menu-icon", "aria-hidden": "true" }, a.icon)), c.append(f("span", { class: "sg-renderer-menu-label" }, document.createTextNode(a.label))), a.shortcut && c.append(f("span", { class: "sg-renderer-menu-shortcut" }, document.createTextNode(a.shortcut))), c.addEventListener("click", () => {
      a.disabled || (Ee(), typeof a.onClick == "function" && a.onClick(s.row, s), a.action && Xe(t, s, a.action));
    }), n.append(c);
  }
  function r(o) {
    o.key === "Escape" && (o.stopPropagation(), Ee());
  }
  function i(o) {
    !n.contains(o.target) && !t.contains(o.target) && Ee();
  }
  document.addEventListener("keydown", r), setTimeout(() => document.addEventListener("mousedown", i), 0), document.body.appendChild(n), U(n, t), ze = { pop: n, onKey: r, onDocClick: i, anchor: t };
}
function Ee() {
  if (!ze) return;
  const { pop: t, onKey: s, onDocClick: e, anchor: n } = ze;
  document.removeEventListener("keydown", s), document.removeEventListener("mousedown", e), t.remove(), ze = null, te(n);
}
function As({
  primary: t = { label: "Go", action: null, icon: null },
  items: s = [],
  variant: e = "primary"
} = {}) {
  return (n) => {
    const { td: r } = n, i = n?.col?.cellRendererConfig || {}, o = i.primary || t, a = i.items || s, l = i.variant ?? e;
    r && r.classList.add("sg-renderer-splitbtn-cell");
    const c = f("span", { class: `sg-renderer-splitbtn is-${l}`, role: "group" }), d = f("button", { type: "button", class: "sg-renderer-splitbtn-main" });
    o.icon && d.append(f("span", { class: "sg-renderer-action-icon", "aria-hidden": "true" }, o.icon)), d.append(f("span", { class: "sg-renderer-action-label" }, document.createTextNode(o.label))), d.addEventListener("click", (p) => {
      p.stopPropagation(), typeof o.onClick == "function" && o.onClick(n.row, n), o.action && Xe(r, n, o.action);
    });
    const u = f(
      "button",
      { type: "button", class: "sg-renderer-splitbtn-caret", "aria-label": "More actions" },
      document.createTextNode("▾")
    );
    return u.addEventListener("click", (p) => {
      p.stopPropagation(), Es(u, n, a);
    }), c.append(d, u), c;
  };
}
const Qi = [
  { name: "edit", label: "Edit", icon: "✎" },
  { name: "duplicate", label: "Duplicate", icon: "⧉" },
  { name: "delete", label: "Delete", icon: "✕", danger: !0 }
];
function Ts({
  actions: t = Qi
} = {}) {
  return (s) => {
    const { td: e } = s, r = (s?.col?.cellRendererConfig || {}).actions || t;
    e && e.classList.add("sg-renderer-rowactions-cell");
    const i = f("span", { class: "sg-renderer-rowactions" });
    for (const o of r) {
      const a = f("button", {
        type: "button",
        class: `sg-renderer-rowactions-btn${o.danger ? " is-danger" : ""}`,
        title: o.label,
        "aria-label": o.label
      }, o.icon || o.label);
      a.addEventListener("click", (l) => {
        l.stopPropagation(), typeof o.onClick == "function" && o.onClick(s.row, s), o.name && Xe(e, s, o.name);
      }), i.append(a);
    }
    return i;
  };
}
function Ms({
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
    const { value: c, row: d, col: u, api: p, td: g } = l, h = l?.col?.cellRendererConfig || {}, y = h.min ?? t, m = h.max ?? s, w = h.step ?? e, b = h.range ?? o, _ = n || ((L) => String(L)), C = h.showValue ?? a, S = h.color || r, T = h.editable ?? i;
    if (g && g.classList.add("sg-renderer-slider-cell"), $(c) && !b)
      return f(
        "span",
        { class: "sg-renderer-slider-placeholder" },
        document.createTextNode("—")
      );
    const D = f("div", { class: "sg-renderer-slider" });
    function x(L) {
      const A = d && u?.field != null ? d[u.field] : null;
      d && u?.field != null && (d[u.field] = L), p?.applyTransaction && p.applyTransaction({ update: [d] });
      const R = g?.closest('[data-controller~="grid"]');
      R && R.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: d?.id ?? d?._sg_id, colId: u?.field, oldValue: A, newValue: L }
      }));
    }
    if (b) {
      let q = function() {
        let O = Number(F.value), N = Number(W.value);
        O > N && ([O, N] = [N, O]);
        const G = (O - y) / R * 100, J = (N - y) / R * 100;
        H.style.left = `${G}%`, H.style.width = `${Math.max(0, J - G)}%`, Q.textContent = `${_(O)} – ${_(N)}`;
      }, Z = function() {
        let O = Number(F.value), N = Number(W.value);
        O > N && ([O, N] = [N, O]), q(), x([O, N]);
      };
      const [L, A] = Array.isArray(c) ? c : [y, m], R = Math.max(1, m - y), V = f("div", { class: "sg-renderer-slider-range-stack" }), B = f("div", { class: "sg-renderer-slider-range-rail" }), H = f("div", { class: "sg-renderer-slider-range-fill", style: `background:${S};` }), F = f("input", {
        type: "range",
        class: "sg-renderer-slider-input sg-renderer-slider-range-low",
        min: y,
        max: m,
        step: w,
        value: L,
        disabled: T ? null : ""
      }), W = f("input", {
        type: "range",
        class: "sg-renderer-slider-input sg-renderer-slider-range-high",
        min: y,
        max: m,
        step: w,
        value: A,
        disabled: T ? null : ""
      });
      V.style.setProperty("--sg-slider-accent", S);
      const Q = f(
        "span",
        { class: "sg-renderer-slider-value" },
        document.createTextNode(`${_(L)} – ${_(A)}`)
      );
      [F, W].forEach((O) => {
        O.addEventListener("click", (N) => N.stopPropagation()), O.addEventListener("input", q), O.addEventListener("change", Z);
      }), V.append(B, H, F, W), D.append(V), C && D.append(Q), q();
    } else {
      const L = Number(c), A = Number.isFinite(L) ? L : y, R = f("input", {
        type: "range",
        class: "sg-renderer-slider-input",
        min: y,
        max: m,
        step: w,
        value: A,
        disabled: T ? null : "",
        style: `accent-color: ${S};`
      }), V = f(
        "span",
        { class: "sg-renderer-slider-value" },
        document.createTextNode(_(A))
      );
      R.addEventListener("click", (B) => B.stopPropagation()), R.addEventListener("input", () => {
        V.textContent = _(Number(R.value));
      }), R.addEventListener("change", () => x(Number(R.value))), D.append(R), C && D.append(V);
    }
    return D;
  };
}
k("email", Gt());
k("url", zt());
k("phone", jt());
k("currency", Kt());
k("percent", qt());
k("progress-bar", Sn());
k("star-rating", xn());
k("tags", Ln());
k("country-flag", kn());
k("abn", En());
k("avatar", An());
k("date", Ut());
k("datetime", Wt());
k("relative-time", Yt());
k("duration", Xt());
k("number", Jt());
k("compact-number", Qt());
k("file-size", Zt());
k("boolean", en());
k("delta", tn());
k("truncate", nn());
k("copyable", rn());
k("image", an());
k("color-swatch", ln());
k("sparkline", cn());
k("heatmap-cell", pn());
k("mask", fn());
k("highlight", gn());
k("multi-line", hn());
k("attachments", yn());
k("address-au", Cn());
k("checkbox", Tn());
k("switch", Nn());
k("markdown", Rn());
k("json", $n());
k("linked-record", Pn());
k("coloured-tags", Vn());
k("time", Fn());
k("diff", Bn());
k("geo", Hn());
k("qr", On());
k("code", Gn());
k("rating", zn());
k("bullet", jn());
k("donut", Kn());
k("histogram", qn());
k("rag", Un());
k("timeline-steps", Wn());
k("mention", Yn());
k("expand", Xn());
k("units", Jn());
k("ip-address", Qn());
k("bsb", Zn());
k("acn", es());
k("tfn", ts());
k("medicare", ns());
k("audio", ss());
k("video", rs());
k("reactions", is());
k("comment-count", os());
k("ordinal", as());
k("plural", ls());
k("empty", cs());
k("credit-card", ds());
k("loading-shimmer", us());
k("audio-attachment", Dn());
k("select", ps());
k("multiselect", gs());
k("combobox", hs());
k("slider", Ms());
k("date-picker", ms());
k("time-picker", _s());
k("date-range", vs());
k("color-picker", Ss());
k("textarea", xs());
k("action-button", Ls());
k("menu", ks());
k("split-button", As());
k("row-actions", Ts());
const M = {
  // Plain text. The 99% case.
  text: {
    copy: ({ value: t }) => t == null ? "" : String(t),
    parse: (t) => String(t ?? "")
  },
  // Numeric — strips currency / percent / commas before Number().
  number: {
    copy: ({ value: t }) => t == null || t === "" ? "" : String(t),
    parse: We
  },
  // Boolean — true / false / yes / no / 1 / 0 / on / off / ✓ / ✗.
  boolean: {
    copy: ({ value: t }) => t === !0 ? "true" : t === !1 ? "false" : t == null ? "" : String(t),
    parse: Sr
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
    copy: ({ value: t }) => Array.isArray(t) ? t.join(", ") : $(t) ? "" : String(t),
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
  const e = be(t);
  e && wr(e, s);
}
E("email", { copy: M.text.copy, parse: (t) => String(t ?? "").trim() });
E("url", { copy: M.text.copy, parse: (t) => String(t ?? "").trim() });
E("phone", M.digits);
E("currency", M.number);
E("percent", {
  copy: M.number.copy,
  parse: (t) => We(String(t ?? "").replace(/%$/, ""))
});
E("progress-bar", M.number);
E("star-rating", M.number);
E("tags", M.stringList);
E("country-flag", {
  copy: ({ value: t }) => t == null ? "" : String(t).trim().toUpperCase(),
  parse: (t) => {
    const s = String(t ?? "").trim().toUpperCase();
    return /^[A-Z]{2}$/.test(s) ? s : void 0;
  }
});
E("abn", M.digits);
E("avatar", M.text);
E("date", M.date);
E("datetime", M.datetime);
E("relative-time", M.datetime);
E("duration", {
  copy: M.number.copy,
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
E("number", M.number);
E("compact-number", {
  copy: M.number.copy,
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return "";
    const e = /^(-?\d+(?:\.\d+)?)\s*([kmbt])$/i.exec(s);
    if (e) {
      const n = Number(e[1]), r = e[2].toLowerCase(), i = r === "k" ? 1e3 : r === "m" ? 1e6 : r === "b" ? 1e9 : 1e12;
      return Number.isFinite(n) ? n * i : void 0;
    }
    return We(s);
  }
});
E("file-size", {
  copy: M.number.copy,
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return "";
    const e = /^(-?\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb|pb|kib|mib|gib|tib|pib)?$/i.exec(s);
    if (!e) return We(s);
    const n = Number(e[1]);
    if (!Number.isFinite(n)) return;
    const r = (e[2] || "b").toLowerCase(), i = r.endsWith("ib") ? 1024 : 1e3, o = r.endsWith("ib") ? r.slice(0, -2) + "b" : r, a = { b: 1, kb: i, mb: i ** 2, gb: i ** 3, tb: i ** 4, pb: i ** 5 };
    return n * (a[o] ?? 1);
  }
});
E("boolean", M.boolean);
E("delta", M.number);
E("truncate", M.text);
E("copyable", M.text);
E("image", { copy: M.text.copy, parse: (t) => String(t ?? "").trim() });
E("color-swatch", { copy: M.text.copy, parse: (t) => String(t ?? "").trim() });
E("sparkline", M.numberList);
E("heatmap-cell", M.number);
E("mask", M.text);
E("highlight", M.text);
E("multi-line", M.text);
E("attachments", {
  copy: M.json.copy,
  parse: (t) => {
    const s = M.json.parse(t);
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
E("checkbox", M.boolean);
E("switch", M.boolean);
E("markdown", M.text);
E("json", M.json);
E("linked-record", {
  copy: ({ value: t }) => t == null || t === "" ? "" : Array.isArray(t) ? t.join(", ") : String(t),
  parse: (t) => {
    const s = String(t ?? "");
    return s === "" ? "" : s.includes(",") ? s.split(/\s*,\s*/).filter(Boolean) : s;
  }
});
E("coloured-tags", M.stringList);
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
E("qr", M.text);
E("code", M.text);
E("rating", M.number);
E("bullet", M.number);
E("donut", M.number);
E("histogram", M.numberList);
E("rag", {
  // RAG_TOKENS lookup keeps "high" / "low" / "critical" / "ok" /
  // "passive" / "detractor" all parseable to the three canonical bands.
  copy: ({ value: t }) => t == null ? "" : String(t).trim().toLowerCase(),
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return "";
    const e = s.toLowerCase();
    if (ot[e]) return ot[e];
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  }
});
E("timeline-steps", M.text);
E("mention", M.text);
E("expand", M.text);
E("units", M.number);
E("ip-address", { copy: M.text.copy, parse: (t) => String(t ?? "").trim() });
E("bsb", M.digits);
E("acn", M.digits);
E("tfn", M.digits);
E("medicare", M.digits);
E("audio", { copy: M.text.copy, parse: (t) => String(t ?? "").trim() });
E("video", { copy: M.text.copy, parse: (t) => String(t ?? "").trim() });
E("reactions", M.json);
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
  copy: M.number.copy,
  parse: (t) => {
    const s = String(t ?? "").trim();
    if (s === "") return "";
    const e = /^(-?\d+)(?:st|nd|rd|th)?$/i.exec(s);
    return e ? Number(e[1]) : void 0;
  }
});
E("plural", M.number);
E("empty", M.text);
E("credit-card", M.digits);
E("loading-shimmer", M.text);
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
  copy: ({ value: t }) => Array.isArray(t) ? t.join(", ") : $(t) ? "" : String(t),
  parse: (t, s) => {
    const e = String(t ?? "").trim();
    if (e === "") return [];
    const n = e.split(/\s*,\s*/).filter(Boolean), r = s?.col?.cellRendererConfig?.options || s?.col?.enumValues || [];
    if (!Array.isArray(r) || r.length === 0) return n;
    const i = (a) => String(a).trim().toLowerCase(), o = [];
    for (const a of n) {
      const l = i(a), c = r.find((d) => {
        const u = typeof d == "object" ? d.value : d, p = typeof d == "object" ? d.label ?? u : d;
        return i(u) === l || i(p) === l;
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
E("slider", M.number);
E("date-picker", M.date);
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
    const e = s.split(/\s*\/\s*|\s*[–-]\s*/);
    if (e.length < 2) return;
    const [n, r] = e, i = (o) => o === "" || !Number.isNaN(new Date(o).valueOf());
    if (!(!i(n) || !i(r)))
      return [n, r];
  }
});
E("color-picker", { copy: M.text.copy, parse: (t) => String(t ?? "").trim() });
E("textarea", M.text);
E("action-button", M.text);
E("menu", M.text);
E("split-button", M.text);
E("row-actions", M.text);
const Zi = {
  email: Gt,
  url: zt,
  phone: jt,
  currency: Kt,
  percent: qt,
  progressBar: Sn,
  starRating: xn,
  tags: Ln,
  countryFlag: kn,
  abn: En,
  avatar: An,
  statusPill: si,
  date: Ut,
  datetime: Wt,
  relativeTime: Yt,
  duration: Xt,
  number: Jt,
  compactNumber: Qt,
  fileSize: Zt,
  boolean: en,
  delta: tn,
  truncate: nn,
  copyable: rn,
  image: an,
  colorSwatch: ln,
  sparkline: cn,
  heatmap: pn,
  mask: fn,
  highlight: gn,
  multiLine: hn,
  attachments: yn,
  addressAu: Cn,
  checkbox: Tn,
  switch: Nn,
  markdown: Rn,
  json: $n,
  linkedRecord: Pn,
  colouredTags: Vn,
  time: Fn,
  diff: Bn,
  geo: Hn,
  qr: On,
  code: Gn,
  rating: zn,
  bullet: jn,
  donut: Kn,
  histogram: qn,
  rag: Un,
  timelineSteps: Wn,
  mention: Yn,
  expand: Xn,
  units: Jn,
  ipAddress: Qn,
  bsb: Zn,
  acn: es,
  tfn: ts,
  medicare: ns,
  audio: ss,
  video: rs,
  reactions: is,
  commentCount: os,
  ordinal: as,
  plural: ls,
  empty: cs,
  creditCard: ds,
  loadingShimmer: us,
  audioAttachment: Dn,
  select: ps,
  multiselect: gs,
  combobox: hs,
  slider: Ms,
  datePicker: ms,
  timePicker: _s,
  dateRange: vs,
  colorPicker: Ss,
  textarea: xs,
  actionButton: Ls,
  menu: ks,
  splitButton: As,
  rowActions: Ts
}, eo = 32, Dt = 100, Ae = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', to = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>', no = /* @__PURE__ */ new Set([
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
]), so = /* @__PURE__ */ new Set([
  "color",
  "date",
  "datetime-local",
  "time",
  "month",
  "week"
]);
function ro(t) {
  const s = String(t ?? "");
  return s === "" ? "" : /[\t\n\r"]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function io(t) {
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
const Nt = [
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
class ft extends re {
  constructor() {
    super(...arguments);
    I(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    // ----- Row grouping + aggregation -----
    // A group is expanded if it has an explicit override; otherwise the
    // default-by-level applies (-1 = all, 0 = none, N = first N levels).
    I(this, "_isGroupExpanded", (e, n) => {
      if (this._groupExpanded.has(e)) return this._groupExpanded.get(e);
      const r = this.state.group.defaultExpanded;
      return r < 0 ? !0 : n < r;
    });
    // Delegated click handler for synthetic <th>s that don't have a
    // HeaderCellController of their own (pivot result cols today). Mirrors the
    // user-defined header path: bare click toggles sort, shift-click appends to
    // a multi-sort. Resize handles / filter icons short-circuit.
    I(this, "_onSynthHeaderClick", (e) => {
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
    I(this, "_onHeaderContextMenu", (e) => {
      const n = e.target.closest("th[data-field], th[data-header-cell-field-value]");
      if (!n) return;
      const r = n.getAttribute("data-field") || n.getAttribute("data-header-cell-field-value"), i = this._colByField(r);
      !i || i._isCheckbox || i._isRowNumber || i._isGroupCol || i._isPivot || (e.preventDefault(), this._showColumnMenu(i, e.clientX, e.clientY));
    });
    I(this, "_onDocMouseDownColumnMenu", (e) => {
      this._columnMenu && !this._columnMenu.contains(e.target) && this._closeColumnMenu();
    });
    I(this, "_onColumnMenuKey", (e) => {
      e.key === "Escape" && (e.stopPropagation(), this._closeColumnMenu());
    });
    I(this, "_onCellDragEnter", (e) => {
      if (!this._isFileDrag(e)) return;
      const n = this._dropTarget(e.target);
      n && (e.preventDefault(), this._dropHotCell && this._dropHotCell !== n.td && this._dropHotCell.classList.remove("sg-drop-target"), n.td.classList.add("sg-drop-target"), this._dropHotCell = n.td);
    });
    I(this, "_onCellDragOver", (e) => {
      if (!this._isFileDrag(e)) return;
      const n = this._dropTarget(e.target);
      n && (e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "copy"), this._dropHotCell !== n.td && (this._dropHotCell?.classList.remove("sg-drop-target"), n.td.classList.add("sg-drop-target"), this._dropHotCell = n.td));
    });
    I(this, "_onCellDragLeave", (e) => {
      this._dropHotCell && !this._dropHotCell.contains(e.relatedTarget) && (this._dropHotCell.classList.remove("sg-drop-target"), this._dropHotCell = null);
    });
    I(this, "_onCellDrop", (e) => {
      if (!this._isFileDrag(e)) return;
      const n = this._dropTarget(e.target);
      if (!n) return;
      e.preventDefault(), this._dropHotCell?.classList.remove("sg-drop-target"), this._dropHotCell = null;
      const r = Array.from(e.dataTransfer?.files || []);
      if (!r.length) return;
      const i = this.state.rowData.find((u) => this._rowId(u) === n.rowId), o = { rowId: n.rowId, colId: n.colId, files: r, row: i, dataTransfer: e.dataTransfer }, a = new CustomEvent("grid:fileAttached", { detail: o, bubbles: !0, cancelable: !0 });
      if (!this.element.dispatchEvent(a) || !i) return;
      const c = this.attachmentsFieldValue || n.colId, d = Array.isArray(i[c]) ? i[c].slice() : [];
      for (const u of r) {
        let p = "";
        try {
          p = URL.createObjectURL(u);
        } catch {
        }
        d.push({
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
      i[c] = d, this.scheduleRender("cells"), P(this.element, "grid:cellValueChanged", {
        rowId: n.rowId,
        colId: c,
        oldValue: null,
        newValue: d
      });
    });
    I(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
    });
    I(this, "_onCellMouseDown", (e) => {
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
    I(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const n = this._cellAt(e.target);
      if (!n) return;
      const r = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      r && r.focus.rowId === n.rowId && r.focus.colId === n.colId || (this._extendActiveRange(n), this._cellDragMoved = !0, this._applyCellSelHighlight(), P(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
    });
    I(this, "_onCellMouseUp", () => {
      this._cellDragging = !1, this._rowDragPending && (document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag && this._finishRowDrag(), this._rowDragPending = null);
    });
    // ----- Row drag-and-drop (reorder) with a ghost preview -----
    I(this, "_onRowDragMove", (e) => {
      const n = this._rowDragPending;
      if (n) {
        if (!this._rowDrag) {
          if (Math.abs(e.clientY - n.y) < 5 && Math.abs(e.clientX - n.x) < 5) return;
          this._startRowDrag(n.rowId);
        }
        this._rowDrag && (this._rowDragMoved = !0, this._rowDrag.ghost.style.left = `${e.clientX + 14}px`, this._rowDrag.ghost.style.top = `${e.clientY + 10}px`, this._updateDropIndicator(e.clientY));
      }
    });
    // Copy the active cell range to the clipboard as TSV. Cells that contain
    // tabs, newlines, or double-quotes are wrapped in "…" with embedded "
    // doubled — the same rule Excel / Sheets / Numbers use, so a multi-line
    // markdown cell round-trips through the clipboard intact.
    I(this, "_onCopy", (e) => {
      if (this.state.editing) return;
      const n = document.activeElement;
      if (n && /^(input|textarea|select)$/i.test(n.tagName) && !this.element.contains(n)) return;
      const r = this._activeRect();
      if (!r) return;
      const i = this._cellRangeRows(r).map((o) => o.map((a) => ro(a)).join("	")).join(`
`);
      i !== "" && (e.clipboardData?.setData("text/plain", i), e.preventDefault());
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
    I(this, "_onPaste", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const n = document.activeElement;
      if (n && /^(input|textarea|select)$/i.test(n.tagName) && !this.element.contains(n)) return;
      const r = this._activeRect();
      if (!r) return;
      const i = e.clipboardData?.getData("text/plain");
      if (i == null || i === "") return;
      e.preventDefault();
      const o = io(i);
      if (!o.length || (o.length > 1 && o[o.length - 1].length === 1 && o[o.length - 1][0] === "" && o.pop(), !o.length)) return;
      const a = o.length === 1 && o[0].length === 1, l = a ? r.r1 - r.r0 + 1 : o.length, c = a ? r.c1 - r.c0 + 1 : o[0].length, d = r.rows, u = r.cols, p = [];
      let g = !1;
      for (let h = 0; h < l; h++) {
        const y = r.r0 + h;
        if (y >= d.length) break;
        const m = d[y];
        if (!m || m.__sgGroup || m.__sgDetail || m.__sgSeparator) continue;
        const w = a ? o[0] : o[h];
        for (let b = 0; b < c; b++) {
          const _ = r.c0 + b;
          if (_ >= u.length) break;
          const C = u[_];
          if (!C) continue;
          if (!C.editable || C._isCheckbox || C._isRowNumber || C._isGroupCol || C._isMasterExpand) {
            p.push({ rowId: this._rowId(m), colId: C.field || "", reason: "not-editable" });
            continue;
          }
          const S = a ? w[0] : w[b] ?? "", T = this._parsePasteValue(S, m, C);
          if (T === void 0) {
            p.push({ rowId: this._rowId(m), colId: C.field, reason: "parse-failed", text: S });
            continue;
          }
          const D = m[C.field];
          T !== D && (m[C.field] = T, g = !0, P(this.element, "grid:cellValueChanged", {
            rowId: this._rowId(m),
            colId: C.field,
            oldValue: D,
            newValue: T,
            source: "paste"
          }));
        }
      }
      g && this.scheduleRender("cells"), (p.length || g) && P(this.element, "grid:pasteApplied", { appliedCount: g ? 1 : 0, rejectedCount: p.length }), p.length && P(this.element, "grid:pasteRejected", { rejected: p });
    });
    I(this, "_onGridKeydown", (e) => {
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
    I(this, "_onEditorKey", (e) => {
      this.state.editing && (e.key === "Enter" ? (e.preventDefault(), this.stopEditing(!1)) : e.key === "Escape" ? (e.preventDefault(), this.stopEditing(!0)) : e.key === "Tab" && (e.preventDefault(), this._tabToEditableCell(e.shiftKey ? -1 : 1)));
    });
    I(this, "_onEditorBlur", () => {
      this._navigatingEditor || this.state.editing && this.stopEditing(!1);
    });
    // ----- Tree data (self-referential parent_id) -----
    //
    // The model layer flattens the tree and hands us back a Map of per-row
    // metadata (level, hasChildren, expanded). The controller owns the
    // expanded/collapsed override Map; the model just calls back through
    // `isTreeRowExpanded` to ask which state a given row is in. Everything
    // else (filter, sort, paginate) flows through the normal pipeline.
    I(this, "_isTreeRowExpanded", (e, n) => {
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
      pagination: { enabled: !1, page: 0, pageSize: Dt },
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = sr(this), queueMicrotask(() => this._initialLoad());
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
        const u = n.getAttribute("data-label"), p = n.getAttribute("data-value");
        return u != null && (d.label = u), p != null && (d.value = p), d;
      }
      const i = {}, o = n.getAttribute("data-row-id") || n.getAttribute("data-row-row-id-value");
      i[this.getRowIdValue] = o != null ? this._coerceRowId(o) : r + 1;
      const a = {};
      n.querySelectorAll("td").forEach((c) => {
        const d = c.getAttribute("data-cell-col-id-value") || c.getAttribute("data-col-id");
        if (!d) return;
        const u = c.getAttribute("data-cell-value");
        if (u != null)
          try {
            i[d] = JSON.parse(u);
          } catch {
            i[d] = u;
          }
        else
          i[d] = c.textContent.trim();
        const p = Number(c.getAttribute("data-spans") || c.getAttribute("colspan") || 1);
        p > 1 && (a[d] = p);
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
      e = v("table");
      const r = v("thead");
      e.appendChild(r), this.element.appendChild(e);
    }
    let n = e.querySelector("tbody");
    if (n || (n = v("tbody"), e.appendChild(n)), n.dataset.gridTarget = "body", this._tbody = n, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const r = v("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(r, e), r.appendChild(e), this._viewport = r;
    }
    if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = v("div", { class: "sg-status-bar", role: "status" }), this._statusBar.append(
      v("div", { class: "sg-status-section sg-status-left" }),
      v("div", { class: "sg-status-section sg-status-right" })
    ), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
      const r = v("div", { class: "sg-main" });
      this._viewport.parentNode.insertBefore(r, this._viewport), r.appendChild(this._viewport), this._statusBar && r.appendChild(this._statusBar), this._main = r, this._sidePanel = v("aside", {
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
    const r = this.state.filterModel[e.field] || {}, i = ao(e.filter), o = v("div", { class: "sg-filter-popover" }), a = v("select");
    i.forEach((m) => a.append(new Option(m.label, m.value, !1, m.value === r.type)));
    const l = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", c = v("input", { type: l, value: r.value ?? "" }), d = v("input", { type: l, value: r.value2 ?? "", style: { display: "none" } }), u = () => {
      const m = a.value, w = m === "inRange", b = !(m === "blank" || m === "notBlank");
      c.style.display = b ? "" : "none", d.style.display = w ? "" : "none";
    };
    a.addEventListener("change", u), u();
    const p = v("div", { class: "sg-filter-actions" }), g = v("button", { type: "button" }, "Clear"), h = v("button", { type: "button", class: "primary" }, "Apply");
    p.append(g, h), g.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), h.addEventListener("click", () => {
      const m = a.value, w = m === "blank" || m === "notBlank" ? { filterType: e.filter, type: m } : { filterType: e.filter, type: m, value: c.value, value2: d.value || void 0 };
      this.setColumnFilter(e.field, w), this._closeFilterPopover();
    }), o.append(
      v("label", {}, "Condition"),
      a,
      c,
      d,
      p
    ), document.body.appendChild(o);
    const y = n.getBoundingClientRect();
    o.style.left = `${y.left + window.scrollX}px`, o.style.top = `${y.bottom + window.scrollY + 2}px`, this._filterPopover = o, document.addEventListener("mousedown", this._onDocMouseDown), c.focus();
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
      if (c._headerEl === n && oo(c, l)) return;
      this.state.columnDefs[r] = l;
    } else
      this.state.columnDefs.push(l);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${oe(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((n) => n.field !== e), this.scheduleRender("columns"));
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
    let r = Pt(this.state.rowData, this.state.filterModel, e);
    return r = Vt(r, this.state.quickFilter, n), r.length;
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
    o && (this.state.editing = { rowId: e, colId: n, originalValue: z(o, i), initialValue: r }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: n, colId: r, originalValue: i, draftValue: o } = this.state.editing, a = this._tbody.querySelector(`tr[data-row-id="${oe(n)}"] td[data-col-id="${oe(r)}"]`);
    let l = i;
    if (!e && a) {
      const c = a.firstElementChild, d = c?.matches?.("[data-editor-input],input,select,textarea") ? c : a.querySelector("[data-editor-input]") || a.querySelector("input,select,textarea");
      d ? l = lo(d.value, this._colByField(r)?.type) : o !== void 0 && (l = o);
    }
    if (this.state.editing = null, !e && l !== i) {
      const c = this.state.rowData.find((u) => this._rowId(u) === n), d = c[r];
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
    const r = oe(e), i = this._thead?.querySelector(
      `th[data-header-cell-field-value="${r}"], th[data-field="${r}"]`
    ), o = Array.from(
      this._tbody?.querySelectorAll(`td[data-col-id="${r}"]`) || []
    ).filter((l) => !l.closest("tr")?.classList?.contains("sg-spacer"));
    let a = 0;
    if ((i || o.length) && (a = this._measureColumnContentWidth(i, o)), !a) {
      const l = (n.headerName || n.field || "").length, c = this.state.rowData.slice(0, 200);
      let d = l;
      for (const u of c) {
        const p = String(ee(u, n) ?? "").length;
        p > d && (d = p);
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
      const d = document.createElement("tr"), u = c.cloneNode(!0);
      u.removeAttribute("style"), d.appendChild(u), o.appendChild(d);
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
    const n = this._visibleCols(), r = n.reduce((o, a) => o + (a.width || 150), 0);
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
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), P(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
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
      a.push(r.map((c) => o(ee(l, c))).join(e));
    return a.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...n } = {}) {
    const r = this.getDataAsCsv(n), i = new Blob([r], { type: "text/csv;charset=utf-8" }), o = URL.createObjectURL(i), a = v("a", { href: o, download: e });
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
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.has("tree") || e.size === 0) && (this._displayList = tr({
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
    const e = this._visibleCols(), n = Zs(e, this._headerLayoutOpts());
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
    n || (n = v("colgroup"), this._table.insertBefore(n, this._thead));
    const r = Array.from(n.children);
    for (e.forEach((o, a) => {
      let l = r[a];
      l || (l = v("col"), n.appendChild(l)), l.style.width = o.width ? o.width + "px" : "";
    }); n.children.length > e.length; ) n.lastElementChild.remove();
    if (e.some((o) => !o.width))
      this._table.style.width = "100%";
    else {
      const o = e.reduce((l, c) => l + (Number(c.width) || 0), 0), a = this._viewport?.clientWidth || 0;
      if (a && o < a && e.length > 0) {
        const l = n.lastElementChild, c = Number(e[e.length - 1].width) || 0, d = o - c;
        l.style.width = a - d + "px", this._table.style.width = a + "px";
      } else
        this._table.style.width = o + "px";
    }
  }
  _renderHeaderSingleRow(e) {
    if (this._thead.children.length > 1) {
      const p = this._thead.firstElementChild;
      for (let g = 1; g < this._thead.children.length; g++) {
        const h = this._thead.children[g];
        Array.from(h.children).forEach((y) => {
          (y.hasAttribute("data-header-cell-field-value") || y.hasAttribute("data-field")) && p.appendChild(y);
        });
      }
      for (; this._thead.children.length > 1; ) this._thead.lastElementChild.remove();
    }
    const n = this._thead.querySelector("tr") || (() => {
      const p = v("tr");
      return this._thead.appendChild(p), p;
    })(), r = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((p) => {
      const g = p.getAttribute("data-header-cell-field-value") || p.getAttribute("data-field");
      g && r.set(g, p);
    });
    const i = new Set(e.map((p) => p.field)), o = this.state.columnDefs.filter((p) => !i.has(p.field)), a = [...e, ...o], l = Array.from(n.children).map((p) => p.getAttribute("data-header-cell-field-value") || p.getAttribute("data-field")).filter(Boolean), c = a.map((p) => p.field);
    if (l.length === c.length && l.every((p, g) => p === c[g]))
      Array.from(n.children).forEach((p) => {
        p.removeAttribute("rowspan"), p.removeAttribute("colspan");
      });
    else {
      const p = [];
      for (const g of a) {
        let h = r.get(g.field);
        h ? (h.removeAttribute("rowspan"), h.removeAttribute("colspan")) : h = v("th", {
          "data-field": g.field,
          "data-synth": "true"
        }, [v("div", { class: "sg-header-content" }, [
          v("span", { class: "sg-header-label" }, g.headerName || g.field || "")
        ])]), p.push(h);
      }
      n.replaceChildren(...p);
    }
    Array.from(n.children).forEach((p) => {
      const g = p.getAttribute("data-header-cell-field-value") || p.getAttribute("data-field");
      g != null && (p.style.display = i.has(g) ? "" : "none");
    });
    const u = this._pinOffsets();
    for (const p of e) {
      const g = n.querySelector(`th[data-header-cell-field-value="${oe(p.field)}"]`) || n.querySelector(`th[data-field="${oe(p.field)}"]`);
      g && this._applyLeafThState(g, p, u);
    }
  }
  // Multi-row header: <thead> gets `layout.depth` rows of group headers
  // followed by the leaf headers, then one hidden row holding any registered
  // <th>s that aren't currently visible (so their controllers stay mounted).
  _renderHeaderMultiRow(e, n) {
    const r = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((d) => {
      const u = d.getAttribute("data-header-cell-field-value") || d.getAttribute("data-field");
      u && r.set(u, d);
    });
    const i = [], o = new Set(e.map((d) => d.field)), a = this._pinOffsets();
    for (const d of n.rows) {
      const u = v("tr");
      for (const p of d) {
        if (p.kind === "group") {
          u.appendChild(v("th", {
            class: "sg-header-group",
            colspan: String(p.colspan),
            "data-group-header": "true"
          }, p.label || ""));
          continue;
        }
        const g = p.col;
        let h = r.get(g.field);
        if (h || (h = v("th", {
          "data-field": g.field,
          "data-synth": "true"
        }, [v("div", { class: "sg-header-content" }, [
          v("span", { class: "sg-header-label" }, p.label || g.headerName || g.field || "")
        ])])), p.label) {
          const y = h.querySelector(".sg-header-label");
          y && y.textContent !== p.label && (y.textContent = p.label);
        }
        h.setAttribute("rowspan", String(p.rowspan)), h.removeAttribute("colspan"), h.style.display = "", u.appendChild(h), this._applyLeafThState(h, g, a);
      }
      i.push(u);
    }
    const l = /* @__PURE__ */ new Set();
    n.rows.forEach((d) => d.forEach((u) => {
      u.kind === "leaf" && l.add(u.col.field);
    }));
    const c = this.state.columnDefs.filter(
      (d) => !o.has(d.field) && !l.has(d.field)
    );
    if (c.length) {
      const d = v("tr", { class: "sg-hidden-header-row" });
      for (const u of c) {
        let p = r.get(u.field);
        p || (p = v("th", { "data-field": u.field, "data-synth": "true" })), p.removeAttribute("rowspan"), p.removeAttribute("colspan"), d.appendChild(p);
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
    yt(e, {
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
    return typeof n == "string" && no.has(n) ? "right" : null;
  }
  _ensureHeaderChrome(e, n, r) {
    if (n._isRowNumber) {
      e.classList.add("sg-gutter-header"), e.textContent = "";
      return;
    }
    if (n._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let l = e.querySelector('input[type="checkbox"]');
      l || (l = v("input", { type: "checkbox", "aria-label": "Select all" }), l.addEventListener("change", (u) => {
        u.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(l));
      const c = this._displayList.filteredSorted.length, d = this.state.selection.size;
      l.checked = d > 0 && d >= c, l.indeterminate = d > 0 && d < c;
      return;
    }
    let i = e.querySelector(".sg-header-content");
    if (!i) {
      const l = e.textContent.trim();
      e.textContent = "", i = v("div", { class: "sg-header-content" }, [
        v("span", { class: "sg-header-label" }, l || n.headerName || n.field || "")
      ]), e.appendChild(i);
    }
    let o = i.querySelector(".sg-sort-icon");
    if (n.sortable)
      if (o || (o = v("span", { class: "sg-sort-icon", "aria-hidden": "true" }), o.innerHTML = Ae, i.appendChild(o)), r && this.state.sortModel.length > 1) {
        let l = i.querySelector(".sg-sort-index");
        l || (l = v("span", { class: "sg-sort-index" }), i.appendChild(l)), l.textContent = String(this.state.sortModel.indexOf(r) + 1);
      } else
        i.querySelector(".sg-sort-index")?.remove();
    else o && o.remove();
    let a = i.querySelector(".sg-filter-icon");
    n.filter ? a || (a = v("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), a.innerHTML = to, i.appendChild(a)) : a && a.remove(), n.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !n._isCheckbox && e.appendChild(v("span", {
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
      const p = this._viewport?.clientHeight || 400, g = this.state.rowHeight, h = nr(this.state.scrollTop, p, g, n.length, 8);
      o = h.first, i = n.slice(h.first, h.last);
    }
    const a = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((p) => {
      const g = p.dataset.rowId;
      g != null && a.set(g, p);
    });
    const l = document.createDocumentFragment(), c = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0;
    let d = 0;
    for (let p = 0; p < o; p++) {
      const g = n[p];
      g && !g.__sgGroup && !g.__sgDetail && !g.__sgSeparator && (d += 1);
    }
    const u = (p) => !p || p.__sgGroup || p.__sgDetail || p.__sgSeparator ? null : (d += 1, c + d);
    if (r) {
      const p = this.state.rowHeight, g = o * p, h = (n.length - o - i.length) * p;
      l.appendChild(this._spacerRow(g, e.length)), i.forEach((y) => l.appendChild(this._buildRow(y, e, a, u(y)))), l.appendChild(this._spacerRow(h, e.length));
    } else
      i.forEach((p) => l.appendChild(this._buildRow(p, e, a, u(p))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && l.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(l);
  }
  _buildPinnedBottomRow(e) {
    const n = v("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), r = this._pinOffsets(), i = this._displayList.grandTotals || {};
    let o = !1;
    for (const a of e) {
      const l = v("td", { "data-col-id": a.field, "data-pinned": a.pinned || null });
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
    a || (a = v("tr")), a.dataset.rowId = o, a.classList.remove("sg-spacer");
    const l = this.state.selection.has(this._rowId(e)), c = this.masterDetailValue && this._isDetailExpanded(o);
    return yt(a, {
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
    o || (o = v("tr")), o.dataset.rowId = i, o.dataset.separator = "true", o.className = "", o.removeAttribute("data-selected"), o.removeAttribute("data-detail-expanded");
    const a = e.variant || (e.value != null ? "summary" : e.label != null ? "heading" : "blank");
    o.classList.add("sg-separator-row", `sg-separator-${a}`), e.className && o.classList.add(e.className), o.innerHTML = "";
    const l = (u) => u._isCheckbox || u._isRowNumber || u._isGroupCol || u._isMasterExpand, d = n.filter((u) => !l(u)).length || n.length || 1;
    for (const u of n) {
      if (l(u)) {
        const g = v("td", { "data-col-id": u.field, class: "sg-separator-gutter" });
        o.appendChild(g);
        continue;
      }
      const p = v("td", {
        "data-col-id": u.field,
        colspan: String(d),
        class: "sg-separator-cell"
      });
      this._renderSeparatorContent(p, e, a), o.appendChild(p);
      break;
    }
    return o;
  }
  _renderSeparatorContent(e, n, r) {
    if (r === "blank" || r === "divider")
      return;
    const i = v("div", { class: "sg-separator-content" });
    n.label != null && i.appendChild(v("span", { class: "sg-separator-label" }, String(n.label))), n.value != null && i.appendChild(v("span", { class: "sg-separator-value" }, String(n.value))), e.appendChild(i);
  }
  _separatorKey(e) {
    return [e.variant || "", e.label || "", e.value || ""].join("|");
  }
  _spacerRow(e, n) {
    if (e <= 0) {
      const i = v("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return i.style.height = "0px", i.appendChild(v("td", { colspan: String(n), style: { height: "0px", padding: "0", border: "0" } })), i;
    }
    const r = v("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return r.style.height = e + "px", r.appendChild(v("td", { colspan: String(n), style: { height: e + "px", padding: "0", border: "0" } })), r;
  }
  _renderRow(e, n, r, i) {
    e.innerHTML = "";
    const o = this._pinOffsets(), a = this._selKeys || { active: null, range: null }, l = String(this._rowId(n)), c = this._displayList?.treeMeta, d = c ? c.get(l) : null, u = d ? this._treeDisplayColField() : null, p = n && n.__sgSpans || null;
    let g = 0;
    for (let h = 0; h < r.length; h++) {
      const y = r[h];
      if (g > 0) {
        g -= 1;
        continue;
      }
      const m = y._isRowNumber || y._isCheckbox || y._isGroupCol || y._isMasterExpand, w = p && !m ? Number(p[y.field]) : 0, b = Math.max(1, Math.min(w || 1, r.length - h));
      b > 1 && (g = b - 1);
      const _ = `${l}:${y.field}`, C = v("td", {
        "data-col-id": y.field,
        "data-pinned": y.pinned || null,
        "data-cell-active": a.active === _ ? "true" : null,
        "data-cell-range": a.range && a.range.has(_) ? "true" : null,
        colspan: b > 1 ? String(b) : null
      });
      if (b > 1 && C.classList.add("sg-merged-cell"), y.pinned === "left" ? C.style.left = o.left[y.field] + "px" : y.pinned === "right" && (C.style.right = o.right[y.field] + "px"), y._isRowNumber) {
        C.classList.add("sg-gutter-cell"), C.setAttribute("data-gutter", "true"), C.removeAttribute("data-cell-active"), C.removeAttribute("data-cell-range"), C.textContent = i != null ? String(i) : "", e.appendChild(C);
        continue;
      }
      if (y._isCheckbox) {
        C.classList.add("sg-checkbox-cell");
        const T = v("input", { type: "checkbox" });
        T.checked = this.state.selection.has(this._rowId(n)), C.appendChild(T), e.appendChild(C);
        continue;
      }
      if (y._isGroupCol) {
        C.classList.add("sg-group-leaf-cell"), C.removeAttribute("data-cell-active"), C.removeAttribute("data-cell-range"), e.appendChild(C);
        continue;
      }
      if (y._isMasterExpand) {
        C.classList.add("sg-master-expand-cell"), C.setAttribute("data-master-expand", "true"), C.removeAttribute("data-cell-active"), C.removeAttribute("data-cell-range");
        const T = this._isDetailExpanded(this._rowId(n)), D = v("span", {
          class: "sg-master-expand-caret",
          "data-expanded": T ? "true" : "false",
          "aria-hidden": "true"
        });
        D.innerHTML = Ae, C.appendChild(D), e.appendChild(C);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(n) && this.state.editing.colId === y.field) {
        C.setAttribute("data-editing", "true");
        const T = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : z(n, y), { node: D, control: x } = this._buildEditor(y, T);
        C.appendChild(D);
        const L = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          if (x?.focus(), L || x?.select?.(), x?.type && so.has(x.type))
            try {
              x.showPicker?.();
            } catch {
            }
        });
      } else
        this._renderCellContent(C, n, y);
      d && y.field === u && this._decorateTreeCell(C, d), e.appendChild(C);
    }
  }
  // Prepend an indent spacer + a chevron (when the row has children) to the
  // tree column's <td>. The chevron carries data-tree-toggle so the body
  // click handler can route it back to toggleTreeRow without conflicting
  // with cell selection or row click handlers.
  _decorateTreeCell(e, n) {
    if (e.classList.add("sg-tree-cell"), e.setAttribute("data-tree-level", String(n.level)), e.style.paddingLeft = `${8 + n.level * 18}px`, n.hasChildren) {
      const r = v("span", {
        class: "sg-tree-chevron",
        "data-tree-toggle": "true",
        "data-expanded": n.expanded ? "true" : "false",
        "aria-hidden": "true"
      });
      r.innerHTML = Ae, e.insertBefore(r, e.firstChild);
    } else {
      const r = v("span", { class: "sg-tree-chevron sg-tree-chevron-leaf", "aria-hidden": "true" });
      e.insertBefore(r, e.firstChild);
    }
  }
  _renderCellContent(e, n, r) {
    if (r.cellRenderer) {
      const i = _t(r.cellRenderer);
      if (i) {
        const a = z(n, r), l = ee(n, r);
        (i.dataset.bind || i.dataset.bindText !== void 0) && (i.textContent = i.dataset.bind ? String(n[i.dataset.bind] ?? "") : l), i.dataset.bindAttr && i.setAttribute(i.dataset.bindAttr, a), i.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((c) => {
          c.dataset.bindText !== void 0 ? c.textContent = l : c.dataset.bind && (c.textContent = String(n[c.dataset.bind] ?? "")), c.dataset.bindAttr && c.setAttribute(c.dataset.bindAttr, a);
        }), e.appendChild(i);
        return;
      }
      const o = be(r.cellRenderer);
      if (typeof o == "function") {
        const a = z(n, r), l = ee(n, r), c = o({ value: a, row: n, col: r, td: e, formatted: l, api: this.element.gridApi });
        if (c == null) return;
        if (typeof c == "string") {
          e.innerHTML = c;
          return;
        }
        if (c instanceof Node) {
          e.appendChild(c);
          return;
        }
        e.textContent = String(c);
        return;
      }
    }
    e.textContent = ee(n, r);
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
    for (const n of Nt) this.element.addEventListener(n, e);
    this._persistBeforeUnload = () => {
      this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
    }, window.addEventListener("beforeunload", this._persistBeforeUnload);
  }
  _teardownPersistence() {
    if (this._persistListener) {
      for (const e of Nt) this.element.removeEventListener(e, this._persistListener);
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
    return o || (o = v("tr")), o.dataset.rowId = i, o.dataset.group = "true", o.dataset.groupLevel = String(e.level), o.className = "sg-group-row", this._renderGroupRow(o, e, n), o;
  }
  _renderGroupRow(e, n, r) {
    e.innerHTML = "";
    const i = this._pinOffsets(), o = this._isGroupExpanded(n.groupId, n.level), a = (this.state.group.displayType || "singleColumn") === "singleColumn", l = !!(this.state.pivot?.mode && this._displayList?.pivot), c = n.__pivotAll === !0, d = r.filter((g) => !g._isRowNumber && !g._isCheckbox && !g._isGroupCol), u = d.some((g) => g.field === n.field) ? n.field : d[0]?.field, p = Math.max(0, n.level);
    c && e.classList.add("sg-pivot-all-row");
    for (const g of r) {
      const h = v("td", { "data-col-id": g.field, "data-pinned": g.pinned || null });
      if (g.pinned === "left" ? h.style.left = i.left[g.field] + "px" : g.pinned === "right" && (h.style.right = i.right[g.field] + "px"), g._isRowNumber || g._isCheckbox) {
        h.classList.add(g._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(h);
        continue;
      }
      if (l || a ? g._isGroupCol : g.field === u) {
        if (h.classList.add("sg-group-cell"), h.style.paddingLeft = `${8 + p * 18}px`, !c) {
          const m = v("span", {
            class: "sg-group-caret",
            "data-expanded": o ? "true" : "false",
            "aria-hidden": "true"
          });
          m.innerHTML = Ae, h.appendChild(m);
        }
        h.append(
          v("span", { class: "sg-group-label" }, this._groupValueLabel(n)),
          v("span", { class: "sg-group-count" }, ` (${n.count})`)
        );
      } else if (l && g._isPivot) {
        const m = z(n, g);
        m != null && (h.classList.add("sg-agg-cell"), h.textContent = this._formatAggregate(m));
      } else !g._isGroupCol && n.aggregates && n.aggregates[g.field] != null && (h.classList.add("sg-agg-cell"), h.textContent = this._formatAggregate(n.aggregates[g.field]));
      e.appendChild(h);
    }
  }
  _groupValueLabel(e) {
    const n = e.value;
    if (n == null || n === "") return "(Blanks)";
    const r = this._colByField(e.field);
    return r ? ee({ [e.field]: n }, r) : String(n);
  }
  _formatAggregate(e) {
    return e == null ? "" : typeof e == "number" ? Number.isInteger(e) ? String(e) : String(Math.round(e * 100) / 100) : String(e);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, n) {
    if (e.cellEditor) {
      const i = _t(e.cellEditor);
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
    if (e.type === "number") r = v("input", { type: "number", value: n ?? "" });
    else if (e.type === "date") {
      const i = n instanceof Date ? n : n ? new Date(n) : null, o = i ? i.toISOString().slice(0, 10) : "";
      r = v("input", { type: "date", value: o });
    } else if (e.type === "datetime") {
      const i = n instanceof Date ? n : n ? new Date(n) : null;
      let o = "";
      if (i && !Number.isNaN(i.getTime())) {
        const a = i.getTimezoneOffset() * 6e4;
        o = new Date(i.getTime() - a).toISOString().slice(0, 16);
      }
      r = v("input", { type: "datetime-local", value: o });
    } else if (e.type === "color") {
      const i = /^#[0-9a-f]{6}$/i.test(String(n ?? "")) ? n : "#000000";
      r = v("input", { type: "color", value: i });
    } else e.type === "email" ? r = v("input", { type: "email", value: n ?? "" }) : e.type === "url" ? r = v("input", { type: "url", value: n ?? "" }) : e.type === "tel" ? r = v("input", { type: "tel", value: n ?? "" }) : e.type === "boolean" ? (r = v("select"), r.append(
      new Option("—", ""),
      new Option("true", "true", n === !0, n === !0),
      new Option("false", "false", n === !1, n === !1)
    )) : r = v("input", { type: "text", value: n ?? "" });
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
        const u = a[d];
        u == null && d !== "count" || n.appendChild(this._statusPanel(this._aggLabel(d), this._fmtAgg(d, u)));
      }
    }
    const l = a ? `${a.count}|${a.sum}|${a.avg}|${a.min}|${a.max}` : "";
    l !== this._lastRangeAggs && (this._lastRangeAggs = l, P(this.element, "grid:rangeAggsChanged", { aggs: a }));
  }
  _statusPanel(e, n, r = null) {
    const i = v("div", { class: "sg-status-panel" });
    return i.append(
      v("span", { class: "sg-status-label" }, `${e}:`),
      v("span", { class: "sg-status-value" }, n)
    ), r && i.appendChild(v("span", { class: "sg-status-aside" }, r)), i;
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
              !l || l._isCheckbox || l._isRowNumber || l._isGroupCol || l._isMasterExpand || e.push(z(o, l));
            }
        }
    }
    return e;
  }
  getRangeAggregates() {
    return this.state.cellSel.ranges.length ? js(this._cellRangeRawValues()) : null;
  }
  _showColumnMenu(e, n, r) {
    this._closeColumnMenu();
    const i = this._columnMenuItems(e), o = v("div", { class: "sg-column-menu", role: "menu" });
    for (const c of i) {
      if (c === "separator") {
        o.appendChild(v("div", { class: "sg-column-menu-separator", role: "separator" }));
        continue;
      }
      const d = v("button", {
        type: "button",
        class: "sg-column-menu-item" + (c.active ? " sg-column-menu-active" : ""),
        role: "menuitem"
      });
      d.append(
        v("span", { class: "sg-column-menu-label" }, c.label)
      ), c.active && d.append(v("span", { class: "sg-column-menu-check", "aria-hidden": "true" }, "✓")), d.addEventListener("click", () => {
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
      const c = this.state.rowData.find((u) => this._rowId(u) === o), d = a.dataset.colId;
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
    return !n || !r || r.dataset.group === "true" || r.dataset.separator === "true" || r.classList.contains("sg-detail-row") || n.classList.contains("sg-checkbox-cell") || n.classList.contains("sg-group-leaf-cell") || n.classList.contains("sg-master-expand-cell") || n.dataset.gutter === "true" || !n.dataset.colId || n.dataset.editing === "true" ? null : { rowId: this._coerceRowId(r.dataset.rowId), colId: n.dataset.colId };
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
    const n = Array.from(this.state.selection).map(String), r = new Set(n.includes(String(e)) ? n : [String(e)]), i = v("div", { class: "sg-drag-ghost sg-grid" }), o = v("table"), a = v("tbody");
    let l = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((d) => {
      if (r.has(d.dataset.rowId) && l < 6) {
        const u = d.cloneNode(!0);
        u.removeAttribute("data-selected"), u.querySelectorAll("td").forEach((p) => {
          p.style.left = "", p.style.right = "", p.removeAttribute("data-pinned"), p.removeAttribute("data-cell-active"), p.removeAttribute("data-cell-range");
        }), a.appendChild(u), l += 1;
      }
    }), o.appendChild(a), i.appendChild(o), r.size > l && i.appendChild(v("div", { class: "sg-drag-ghost-more" }, `+${r.size - l} more rows`)), i.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(i);
    const c = v("div", { class: "sg-drop-indicator" });
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
    const a = this.state.rowData, l = a.filter((u) => e.has(String(this._rowId(u)))), c = a.filter((u) => !e.has(String(this._rowId(u))));
    let d = c.findIndex((u) => this._rowId(u) === i);
    d < 0 ? d = c.length : o || (d += 1), c.splice(d, 0, ...l), this.state.rowData = c, this.state.sortModel = [], this.scheduleRender("data"), P(this.element, "grid:rowDragEnd", {
      ids: l.map((u) => this._rowId(u)),
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
      const i = be(r.cellRenderer);
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
    return vr(e, r);
  }
  // The clipboard-bound flip side of _parsePasteValue. Returns a string;
  // empty string is fine ("…\t\t…"). Renderer-defined `copyValue` wins;
  // otherwise we use the model's formatted display string (existing
  // behaviour — keeps non-renderer columns identical to v0).
  _copyCellValue(e, n) {
    const r = z(e, n), i = ee(e, n);
    if (n.cellRenderer) {
      const o = be(n.cellRenderer);
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
    return Cr(r, n, i);
  }
  // Rectangle (display indices) for a {anchor,focus} range, or null.
  _rangeRect(e) {
    if (!e) return null;
    const n = this._displayList.pageRows, r = this._visibleCols(), i = (u) => n.findIndex((p) => this._rowId(p) === u), o = (u) => r.findIndex((p) => p.field === u), a = i(e.anchor.rowId), l = o(e.anchor.colId);
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
              const u = `${this._rowId(l)}:${d.field}`;
              u !== n && r.add(u);
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
    return this._visibleCols().filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol && !e._isMasterExpand);
  }
  _moveActiveCell(e, n, r) {
    const i = this._displayList.pageRows, o = this._navCols();
    if (!i.length || !o.length) return;
    const a = (p, g, h) => Math.max(g, Math.min(p, h)), l = this._activeCell(), c = () => i.findIndex((p) => !p.__sgGroup && !p.__sgDetail && !p.__sgSeparator);
    let d = l ? i.findIndex((p) => this._rowId(p) === l.rowId) : c(), u = l ? o.findIndex((p) => p.field === l.colId) : 0;
    if (d < 0 && (d = c()), !(d < 0)) {
      if (u < 0 && (u = 0), r && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const p = this.state.cellSel.ranges[this.state.cellSel.activeIdx], g = a(i.findIndex((y) => this._rowId(y) === p.focus.rowId) + e, 0, i.length - 1), h = a(o.findIndex((y) => y.field === p.focus.colId) + n, 0, o.length - 1);
        this._extendActiveRange({ rowId: this._rowId(i[g]), colId: o[h].field });
      } else {
        let p = a(d + e, 0, i.length - 1);
        if (e !== 0) {
          for (; i[p] && (i[p].__sgGroup || i[p].__sgDetail || i[p].__sgSeparator); ) {
            const h = p + e;
            if (h < 0 || h >= i.length) break;
            p = h;
          }
          if (!i[p] || i[p].__sgGroup || i[p].__sgDetail || i[p].__sgSeparator) return;
        }
        const g = a(u + n, 0, o.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(i[p]), colId: o[g].field });
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
              if (!l || !l.editable || l._isCheckbox || l._isRowNumber) continue;
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
    const r = this._visibleCols().filter((p) => p.editable && !p._isCheckbox), i = this._displayList.pageRows, o = i.findIndex((p) => this._rowId(p) === n.rowId), a = r.findIndex((p) => p.field === n.colId);
    if (!r.length || !i.length || o < 0 || a < 0) {
      this.stopEditing(!1);
      return;
    }
    const l = i.length * r.length, c = (o * r.length + a + e + l) % l, d = i[Math.floor(c / r.length)], u = r[c % r.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(d), u.field), requestAnimationFrame(() => {
      this._navigatingEditor = !1;
    });
  }
  // Wire editor listeners whenever a cell mounts an input.
  // Done lazily via MutationObserver on tbody (cheap because tbody is small per page).
  // ----- Helpers -----
  _visibleCols() {
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
    return e || this._visibleCols().find((i) => !i._isCheckbox && !i._isRowNumber && !i._isGroupCol && !i._isMasterExpand)?.field || null;
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
    o || (o = v("tr")), o.className = "sg-detail-row", o.dataset.rowId = i, o.setAttribute("data-master-id", a), o.innerHTML = "";
    const l = v("td", { colspan: String(n.length || 1), class: "sg-detail-cell" }), c = v("div", { class: "sg-detail-shell" });
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
      const l = v("div", { class: "sg-detail-fallback" }), c = Object.keys(n || {}).filter((d) => !d.startsWith("_") && !d.startsWith("__")).slice(0, 6);
      for (const d of c)
        l.append(
          v("span", { class: "sg-detail-fallback-label" }, `${d}: `),
          v("span", { class: "sg-detail-fallback-value" }, String(n[d] ?? "")),
          v("span", { class: "sg-detail-fallback-sep" }, "  ·  ")
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
I(ft, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: Dt },
  rowHeight: { type: Number, default: eo },
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
function oo(t, s) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const n of e) if (t[n] !== s[n]) return !1;
  return !0;
}
function ao(t) {
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
function lo(t, s) {
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
function oe(t) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(t)) : String(t).replace(/["\\\n\r]/g, (s) => "\\" + s);
}
class gt extends re {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    I(this, "_onMouseDown", (e) => {
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
    if (this.grid = rr(this.element, "grid", this.application), !!this.grid) {
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
      let u = r.length;
      for (let p = 0; p < r.length; p++) {
        const g = r[p].getBoundingClientRect();
        if (d < g.left + g.width / 2) {
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
    const n = e.clientX, r = this.element.offsetWidth, i = (a) => this.grid.setColumnWidth(this.fieldValue, r + (a.clientX - n)), o = () => {
      document.removeEventListener("mousemove", i), document.removeEventListener("mouseup", o), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", i), document.addEventListener("mouseup", o), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
I(gt, "values", {
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
class Ds extends re {
  connect() {
  }
}
class Ns extends re {
  connect() {
  }
}
class Rs extends re {
  connect() {
  }
}
class Ue extends re {
  constructor() {
    super(...arguments);
    I(this, "_refresh", () => {
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
I(Ue, "outlets", ["grid"]), I(Ue, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
const nt = ["sum", "avg", "count", "min", "max"], co = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', uo = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class $s extends re {
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
    this.element.innerHTML = "", this._content = v("div", { class: "sg-side-panel-content" });
    const s = v("div", { class: "sg-side-panel-tabs" });
    this._columnsTab = v("button", {
      type: "button",
      class: "sg-side-panel-tab",
      "aria-pressed": "true",
      title: "Columns"
    }), this._columnsTab.innerHTML = co, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), s.appendChild(this._columnsTab), this.element.append(this._content, s);
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
    const e = v("label", { class: "sg-panel-pivot-toggle" }), n = v("input", { type: "checkbox" });
    n.checked = s.isPivotMode(), n.addEventListener("change", () => s.setPivotMode(n.checked)), e.append(n, v("span", {}, "Pivot mode")), this._content.appendChild(e), this._content.appendChild(this._renderColumnsList()), this._content.appendChild(this._renderDropSection({
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
    const s = this._api(), e = v("div", { class: "sg-panel-section" });
    e.appendChild(v("div", { class: "sg-panel-section-title" }, "Columns"));
    const n = v("ul", { class: "sg-column-list" });
    e.appendChild(n);
    const r = new Set(s.getRowGroupColumns()), i = new Set(s.getPivotColumns()), o = new Map(s.getValueColumns().map((a) => [a.field, a.aggFunc]));
    for (const a of this._columns()) {
      const l = v("li", { class: "sg-column-list-item", draggable: "true" });
      l.dataset.field = a.field;
      const c = v("span", { class: "sg-column-grip", "aria-hidden": "true" });
      c.innerHTML = uo;
      const d = v("input", { type: "checkbox" });
      d.checked = !a.hidden, d.addEventListener("change", () => s.setColumnVisible(a.field, d.checked));
      const u = v("span", { class: "sg-column-list-label" }, a.headerName || a.field), p = v("span", { class: "sg-column-list-tags" });
      r.has(a.field) && p.appendChild(v("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), i.has(a.field) && p.appendChild(v("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), o.has(a.field) && p.appendChild(v("span", { class: "sg-tag sg-tag-value", title: `Value (${o.get(a.field)})` }, o.get(a.field))), l.append(c, d, u, p), this._wireDragSource(l, a.field), n.appendChild(l);
    }
    return this._wireDropZone(n, "columns"), e;
  }
  _renderDropSection({ title: s, placeholder: e, kind: n, fields: r }) {
    const i = v("div", { class: "sg-panel-section sg-panel-drop" });
    i.appendChild(v("div", { class: "sg-panel-section-title" }, s));
    const o = v("div", { class: "sg-drop-zone" });
    if (o.dataset.dropKind = n, !r.length)
      o.classList.add("sg-drop-zone-empty"), o.appendChild(v("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const a of r) o.appendChild(this._renderChip(n, a));
    return this._wireDropZone(o, n), i.appendChild(o), i;
  }
  _renderValuesSection() {
    const s = this._api(), e = v("div", { class: "sg-panel-section sg-panel-drop" });
    e.appendChild(v("div", { class: "sg-panel-section-title" }, "Values"));
    const n = v("div", { class: "sg-drop-zone" });
    n.dataset.dropKind = "value";
    const r = s.getValueColumns();
    if (!r.length)
      n.classList.add("sg-drop-zone-empty"), n.appendChild(v("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
    else
      for (const { field: i, aggFunc: o } of r) n.appendChild(this._renderValueChip(i, o));
    return this._wireDropZone(n, "value"), e.appendChild(n), e;
  }
  _renderChip(s, e) {
    const n = this._colByField(e), r = v("span", { class: "sg-chip", draggable: "true" });
    return r.dataset.field = e, r.dataset.fromKind = s, r.append(
      v("span", { class: "sg-chip-label" }, n?.headerName || e),
      this._removeButton(() => this._removeFrom(s, e))
    ), this._wireDragSource(r, e), r;
  }
  _renderValueChip(s, e) {
    const n = this._api(), r = this._colByField(s), i = v("span", { class: "sg-chip sg-chip-value", draggable: "true" });
    i.dataset.field = s, i.dataset.fromKind = "value";
    const o = v("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return o.addEventListener("click", (a) => {
      a.stopPropagation();
      const l = nt.indexOf(e), c = nt[(l === -1 ? 0 : l + 1) % nt.length];
      n.setColumnAggFunc(s, c);
    }), i.append(
      o,
      v("span", { class: "sg-chip-label" }, r?.headerName || s),
      this._removeButton(() => n.removeValueColumn(s))
    ), this._wireDragSource(i, s), i;
  }
  _removeButton(s) {
    const e = v("button", { type: "button", class: "sg-chip-remove", "aria-label": "Remove", title: "Remove" });
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
function po(t) {
  const s = t ?? Is.start();
  return s.register("grid", ft), s.register("header-cell", gt), s.register("row", Ds), s.register("cell", Ns), s.register("filter", Rs), s.register("pagination", Ue), s.register("side-panel", $s), s;
}
const fo = {
  start: po,
  GridController: ft,
  HeaderCellController: gt,
  RowController: Ds,
  CellController: Ns,
  FilterController: Rs,
  PaginationController: Ue,
  SidePanelController: $s,
  registerRenderer: k,
  getRenderer: be,
  listRenderers: _r,
  renderers: Zi
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = fo);
export {
  Ns as CellController,
  Rs as FilterController,
  ft as GridController,
  gt as HeaderCellController,
  Ue as PaginationController,
  Ds as RowController,
  $s as SidePanelController,
  fo as default,
  be as getRenderer,
  _r as listRenderers,
  k as registerRenderer,
  Zi as renderers,
  po as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
