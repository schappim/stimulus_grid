var ti = Object.defineProperty;
var ni = (t, r, e) => r in t ? ti(t, r, { enumerable: !0, configurable: !0, writable: !0, value: e }) : t[r] = e;
var V = (t, r, e) => ni(t, typeof r != "symbol" ? r + "" : r, e);
import { Controller as se, Application as ri } from "@hotwired/stimulus";
function z(t, r) {
  return typeof r.valueGetter == "function" ? r.valueGetter(t) : t?.[r.field];
}
function ee(t, r) {
  const e = z(t, r);
  return typeof r.valueFormatter == "function" ? r.valueFormatter(e, t) : e == null ? "" : r.type === "date" && e instanceof Date ? e.toLocaleDateString() : r.type === "boolean" ? e ? "✓" : "" : String(e);
}
const Gt = {
  contains: (t, r) => String(t ?? "").toLowerCase().includes(String(r ?? "").toLowerCase()),
  notContains: (t, r) => !String(t ?? "").toLowerCase().includes(String(r ?? "").toLowerCase()),
  equals: (t, r) => String(t ?? "").toLowerCase() === String(r ?? "").toLowerCase(),
  notEqual: (t, r) => String(t ?? "").toLowerCase() !== String(r ?? "").toLowerCase(),
  startsWith: (t, r) => String(t ?? "").toLowerCase().startsWith(String(r ?? "").toLowerCase()),
  endsWith: (t, r) => String(t ?? "").toLowerCase().endsWith(String(r ?? "").toLowerCase()),
  blank: (t) => t == null || t === "",
  notBlank: (t) => t != null && t !== ""
}, si = {
  equals: (t, r) => Number(t) === Number(r),
  notEqual: (t, r) => Number(t) !== Number(r),
  lessThan: (t, r) => Number(t) < Number(r),
  lessThanOrEqual: (t, r) => Number(t) <= Number(r),
  greaterThan: (t, r) => Number(t) > Number(r),
  greaterThanOrEqual: (t, r) => Number(t) >= Number(r),
  inRange: (t, r, e) => Number(t) >= Number(r) && Number(t) <= Number(e),
  blank: (t) => t == null || t === "",
  notBlank: (t) => t != null && t !== ""
};
function K(t) {
  if (t == null || t === "") return null;
  if (t instanceof Date) return t;
  const r = new Date(t);
  return Number.isNaN(r.valueOf()) ? null : r;
}
const ii = {
  equals: (t, r) => K(t)?.toDateString() === K(r)?.toDateString(),
  notEqual: (t, r) => K(t)?.toDateString() !== K(r)?.toDateString(),
  lessThan: (t, r) => (K(t)?.valueOf() ?? -1 / 0) < (K(r)?.valueOf() ?? 1 / 0),
  greaterThan: (t, r) => (K(t)?.valueOf() ?? 1 / 0) > (K(r)?.valueOf() ?? -1 / 0),
  inRange: (t, r, e) => {
    const n = K(t)?.valueOf();
    return n != null && n >= (K(r)?.valueOf() ?? -1 / 0) && n <= (K(e)?.valueOf() ?? 1 / 0);
  },
  blank: (t) => t == null || t === "",
  notBlank: (t) => t != null && t !== ""
}, oi = {
  equals: (t, r) => r === "true" ? !!t : r === "false" ? !t : !0
}, ai = {
  in: (t, r) => Array.isArray(r) && r.includes(String(t ?? ""))
}, li = { text: Gt, number: si, date: ii, boolean: oi, set: ai };
function zt(t, r, e) {
  if (!e) return !0;
  const n = e.filterType || r.filter || "text", i = (li[n] || Gt)[e.type];
  if (!i) return !0;
  const o = z(t, r);
  return i(o, e.value, e.value2);
}
function jt(t, r, e) {
  const n = Object.entries(r || {}).filter(([, s]) => s != null);
  return n.length === 0 ? t : t.filter((s) => s && s.__sgSeparator ? !0 : n.every(([i, o]) => {
    const a = e[i];
    return a ? zt(s, a, o) : !0;
  }));
}
function Ut(t, r, e) {
  if (!r) return t;
  const n = String(r).toLowerCase();
  return t.filter((s) => {
    if (s && s.__sgSeparator) return !0;
    for (const i of e) {
      const o = ee(s, i);
      if (o && String(o).toLowerCase().includes(n)) return !0;
    }
    return !1;
  });
}
function re(t, r, e) {
  if (t == null && r == null) return 0;
  if (t == null) return -1;
  if (r == null) return 1;
  if (e === "number") return Number(t) - Number(r);
  if (e === "date") {
    const n = K(t)?.valueOf() ?? 0, s = K(r)?.valueOf() ?? 0;
    return n - s;
  }
  return e === "boolean" ? t === r ? 0 : t ? 1 : -1 : String(t).localeCompare(String(r), void 0, { numeric: !0, sensitivity: "base" });
}
function ci(t, r, e) {
  if (!r || r.length === 0) return t;
  const n = (l, c) => {
    for (const { colId: d, sort: p } of r) {
      const f = e[d];
      if (!f) continue;
      const g = z(l, f), h = z(c, f), b = typeof f.comparator == "function" ? f.comparator(g, h, l, c) : re(g, h, f.type);
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
function ve(t, r) {
  if (!r || !r.enabled) return { rows: t, total: t.length, pageRows: t };
  const e = t.length, n = Math.max(1, Math.ceil(e / r.pageSize)), s = Math.min(r.page, n - 1), i = s * r.pageSize, o = t.slice(i, i + r.pageSize);
  return { rows: t, total: e, totalPages: n, page: s, pageRows: o };
}
function Kt(t, r, e) {
  if (t === "count") return r.length;
  const n = r.map((i) => z(i, e));
  if (t === "first") return n.length ? n[0] : null;
  if (t === "last") return n.length ? n[n.length - 1] : null;
  const s = n.map(Number).filter((i) => !Number.isNaN(i));
  switch (t) {
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
function Te(t, r, e) {
  const n = {};
  for (const [s, i] of Object.entries(r || {})) {
    const o = e[s];
    o && (n[s] = Kt(i, t, o));
  }
  return n;
}
function di(t) {
  let r = 0, e = 0, n = 0, s = 1 / 0, i = -1 / 0;
  for (const o of t) {
    if (o == null || o === "") continue;
    r += 1;
    let a = null;
    if (typeof o == "number" && Number.isFinite(o)) a = o;
    else if (typeof o == "string" && o.trim() !== "") {
      const l = Number(o);
      Number.isFinite(l) && (a = l);
    }
    a != null && (e += 1, n += a, a < s && (s = a), a > i && (i = a));
  }
  return {
    count: r,
    sum: e ? n : null,
    avg: e ? n / e : null,
    min: e ? s : null,
    max: e ? i : null
  };
}
function ui(t, r, e, n, s = () => !0) {
  const i = (c, d, p) => {
    const f = r[d], g = /* @__PURE__ */ new Map();
    for (const h of c) {
      const b = z(h, f), m = b == null ? "" : String(b);
      g.has(m) || g.set(m, { value: b, rows: [] }), g.get(m).rows.push(h);
    }
    return Array.from(g.values()).sort((h, b) => re(h.value, b.value, f.type)).map(({ value: h, rows: b }) => {
      const m = h == null ? "" : String(h), _ = p ? `${p}|${f.field}=${m}` : `${f.field}=${m}`;
      return {
        __sgGroup: !0,
        level: d,
        field: f.field,
        value: h,
        groupId: _,
        count: b.length,
        aggregates: Te(b, n, e),
        leaves: b,
        children: d + 1 < r.length ? i(b, d + 1, _) : null
      };
    });
  }, o = i(t, 0, ""), a = [], l = (c) => {
    for (const d of c)
      if (a.push(d), !!s(d.groupId, d.level))
        if (d.children) l(d.children);
        else for (const p of d.leaves) a.push(p);
  };
  return l(o), { displayList: a, tree: o };
}
function qt(t, r, e) {
  return `__p|${e.map((s) => {
    const i = t[s.field];
    return `${s.field}=${i == null ? "" : String(i)}`;
  }).join("|")}|${r.col.field}:${r.aggFunc}`;
}
function Wt(t, r) {
  return r.map((e) => {
    const n = z(t, e);
    return n == null ? "" : String(n);
  }).join("");
}
function pi(t, r) {
  if (!r?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const n of t) {
    const s = Wt(n, r);
    if (!e.has(s)) {
      const i = {};
      r.forEach((o) => {
        const a = z(n, o);
        i[o.field] = a ?? null;
      }), e.set(s, i);
    }
  }
  return Array.from(e.values()).sort((n, s) => {
    for (const i of r) {
      const o = re(n[i.field], s[i.field], i.type);
      if (o !== 0) return o;
    }
    return 0;
  });
}
function fi(t, r, e) {
  if (!t.length || !r.length) return [];
  const n = [], s = r.length === 1;
  for (const i of t)
    for (const o of r) {
      const a = qt(i, o, e), l = e.map((d) => i[d.field] == null ? "(Blank)" : String(i[d.field])).join(" · "), c = s ? l : `${l} · ${o.aggFunc}(${o.col.field})`;
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
function gi(t) {
  return typeof t == "string" && t.startsWith("__p|");
}
function hi(t, r) {
  const e = Array.isArray(t) ? t.filter((n) => n && n.colId && n.sort) : [];
  return (n, s) => {
    for (const i of e) {
      const o = i.sort === "desc" ? -1 : 1;
      if (gi(i.colId)) {
        const a = n.__pivotValues ? n.__pivotValues[i.colId] : null, l = s.__pivotValues ? s.__pivotValues[i.colId] : null, c = re(a, l, "number");
        if (c !== 0) return o * c;
        continue;
      }
      if (r && i.colId === r.field) {
        const a = re(n.value, s.value, r.type);
        if (a !== 0) return o * a;
        continue;
      }
    }
    return re(n.value, s.value, r?.type);
  };
}
function vt(t, r, e, n) {
  const s = {}, i = /* @__PURE__ */ new Map();
  for (const o of t) {
    const a = Wt(o, n);
    i.has(a) || i.set(a, []), i.get(a).push(o);
  }
  for (const o of r) {
    const a = n.map((c) => {
      const d = o[c.field];
      return d == null ? "" : String(d);
    }).join(""), l = i.get(a) || [];
    for (const c of e) {
      const d = qt(o, c, n);
      s[d] = l.length ? Kt(c.aggFunc, l, c.col) : null;
    }
  }
  return s;
}
function mi({ rows: t, rowGroupCols: r = [], pivotCols: e, valueConfigs: n, isExpanded: s = () => !0, sortModel: i = [] }) {
  const o = pi(t, e), a = fi(o, n, e), l = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: t.length,
    aggregates: {},
    leaves: t,
    __pivotValues: vt(t, o, n, e)
  };
  if (!r.length)
    return { columns: a, displayList: [l], tree: [], combos: o };
  const c = (g, h, b) => {
    const m = r[h], _ = /* @__PURE__ */ new Map();
    for (const C of g) {
      const k = z(C, m), T = k == null ? "" : String(k);
      _.has(T) || _.set(T, { value: k, rows: [] }), _.get(T).rows.push(C);
    }
    const y = Array.from(_.values()).map(({ value: C, rows: k }) => {
      const T = C == null ? "" : String(C), M = b ? `${b}|${m.field}=${T}` : `${m.field}=${T}`;
      return {
        __sgGroup: !0,
        level: h,
        field: m.field,
        value: C,
        groupId: M,
        count: k.length,
        aggregates: {},
        leaves: k,
        __pivotValues: vt(k, o, n, e),
        children: h + 1 < r.length ? c(k, h + 1, M) : null
      };
    }), w = hi(i, m);
    return y.sort(w);
  }, d = c(t, 0, ""), p = [l], f = (g) => {
    for (const h of g)
      p.push(h), s(h.groupId, h.level) && h.children && f(h.children);
  };
  return f(d), { columns: a, displayList: p, tree: d, combos: o };
}
function bi(t, { pivotCols: r = [], valueConfigs: e = [], columnGroups: n = null } = {}) {
  if (t._isPivot && r.length && t.pivotKeys)
    return yi(t, r, e);
  if (n && Array.isArray(n) && n.length && !t._isGroupCol && !t._isCheckbox && !t._isRowNumber) {
    for (const s of n)
      if (s?.children && s.children.includes(t.field))
        return [
          { kind: "group", id: `g:${s.headerName}`, label: s.headerName },
          { kind: "leaf", col: t }
        ];
  }
  return [{ kind: "leaf", col: t }];
}
function yi(t, r, e) {
  const n = (e?.length || 0) > 1, s = [];
  for (let i = 0; i < r.length; i++) {
    const o = r[i].field, a = t.pivotKeys[o];
    if (i === r.length - 1 && !n)
      return s.push({ kind: "leaf", col: t, label: a == null ? "(Blank)" : String(a) }), s;
    s.push({
      kind: "group",
      id: `p:${i}:${a == null ? "" : String(a)}`,
      label: a == null ? "(Blank)" : String(a)
    });
  }
  return s.push({ kind: "leaf", col: t, label: `${t.aggFunc}(${t.valueField})` }), s;
}
function wi(t, r = {}) {
  if (!t.length) return { rows: [[]], depth: 1 };
  const e = t.map((i) => bi(i, r).slice()), n = Math.max(1, ...e.map((i) => i.length)), s = [];
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
    s.push(o);
  }
  return { rows: s, depth: n };
}
function _i({
  rows: t,
  parentField: r = "parent_id",
  getRowId: e = (o) => o?.id,
  passesFilter: n = null,
  siblingComparator: s = null,
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
    const _ = o(m), y = m?.[r], w = y == null ? null : String(y);
    w == null || w === _ || !a.has(w) ? c.push(m) : (l.has(w) || l.set(w, []), l.get(w).push(m));
  }
  const d = n ? new Map(t.map((m) => [o(m), !!n(m)])) : null, p = /* @__PURE__ */ new Map(), f = (m, _) => {
    const y = o(m);
    if (y == null) return !1;
    if (p.has(y)) return p.get(y);
    if (_.has(y)) return !1;
    _.add(y);
    let w = !!d.get(y);
    const C = l.get(y) || [];
    for (const k of C) w = f(k, _) || w;
    return _.delete(y), p.set(y, w), w;
  };
  if (d)
    for (const m of c) f(m, /* @__PURE__ */ new Set());
  const g = [], h = /* @__PURE__ */ new Map(), b = (m, _, y, w) => {
    const C = d ? m.filter((k) => w || p.get(o(k))) : m.slice();
    s && C.sort(s);
    for (const k of C) {
      const T = o(k);
      if (T == null || y.has(T)) continue;
      const M = l.get(T) || [], $ = w || (d ? !!d.get(T) : !1), L = d ? M.filter((P) => $ || p.get(o(P))) : M, E = L.length > 0, D = E && (d ? !0 : !!i(T, _));
      h.set(T, { level: _, hasChildren: E, expanded: D }), g.push(k), D && (y.add(T), b(L, _ + 1, y, $), y.delete(T));
    }
  };
  return b(c, 0, /* @__PURE__ */ new Set(), !1), { displayList: g, treeMeta: h };
}
function vi(t) {
  if (t.serverSide) {
    const d = t.rowData, p = t.pagination?.pageSize || d.length || 1, f = t.serverRowCount ?? d.length, g = Math.max(1, Math.ceil(f / p)), h = Math.min(t.pagination?.page || 0, g - 1);
    return { filteredSorted: d, rows: d, total: f, totalPages: g, page: h, pageRows: d };
  }
  const r = Object.fromEntries(t.columnDefs.map((d) => [d.field, d])), e = t.columnDefs.filter((d) => !d.hidden && !d._isCheckbox), n = (t.rowGroupCols || []).filter((d) => r[d]);
  if (t.treeData && !t.pivotMode && n.length === 0) {
    const d = t.treeParentField || "parent_id", p = Object.entries(t.filterModel || {}).filter(([, k]) => k != null), f = t.quickFilter ? String(t.quickFilter).toLowerCase() : "", h = p.length > 0 || f !== "" ? (k) => {
      for (const [T, M] of p) {
        const $ = r[T];
        if ($ && !zt(k, $, M)) return !1;
      }
      if (f) {
        let T = !1;
        for (const M of e) {
          const $ = ee(k, M);
          if ($ && String($).toLowerCase().includes(f)) {
            T = !0;
            break;
          }
        }
        if (!T) return !1;
      }
      return !0;
    } : null, b = Array.isArray(t.sortModel) ? t.sortModel : [], m = b.length ? (k, T) => {
      for (const { colId: M, sort: $ } of b) {
        const L = r[M];
        if (!L) continue;
        const E = z(k, L), D = z(T, L), P = typeof L.comparator == "function" ? L.comparator(E, D, k, T) : re(E, D, L.type);
        if (P !== 0) return $ === "desc" ? -P : P;
      }
      return 0;
    } : null, _ = t.getRowId || ((k) => k?.id), { displayList: y, treeMeta: w } = _i({
      rows: t.rowData,
      parentField: d,
      getRowId: _,
      passesFilter: h,
      siblingComparator: m,
      isExpanded: t.isTreeRowExpanded || (() => !0)
    }), C = ve(y, t.pagination);
    return {
      tree: !0,
      treeData: !0,
      treeMeta: w,
      treeParentField: d,
      filteredSorted: y,
      ...C
    };
  }
  let s = t.rowData;
  s = jt(s, t.filterModel, r), s = Ut(s, t.quickFilter, e), s = ci(s, t.sortModel, r);
  const i = n, o = t.pivotMode ? (t.pivotCols || []).filter((d) => r[d]) : [], a = t.pivotMode ? Object.entries(t.aggModel || {}).filter(([d]) => r[d]).map(([d, p]) => ({ col: r[d], aggFunc: p })) : [];
  if (t.pivotMode && o.length && a.length) {
    const d = i.map((_) => r[_]), p = o.map((_) => r[_]), { columns: f, displayList: g, tree: h, combos: b } = mi({
      rows: s,
      rowGroupCols: d,
      pivotCols: p,
      valueConfigs: a,
      isExpanded: t.isGroupExpanded,
      sortModel: t.sortModel
    }), m = ve(g, t.pagination);
    return {
      pivot: !0,
      pivotResultColumns: f,
      combos: b,
      grouped: !0,
      tree: h,
      leafCount: s.length,
      grandTotals: Te(s, t.aggModel, r),
      filteredSorted: g,
      ...m
    };
  }
  if (i.length) {
    const d = i.map((h) => r[h]), { displayList: p, tree: f } = ui(
      s,
      d,
      r,
      t.aggModel,
      t.isGroupExpanded
    ), g = ve(p, t.pagination);
    return {
      grouped: !0,
      tree: f,
      leafCount: s.length,
      grandTotals: Te(s, t.aggModel, r),
      filteredSorted: p,
      ...g
    };
  }
  const l = ve(s, t.pagination), c = t.aggModel && Object.keys(t.aggModel).length ? Te(s, t.aggModel, r) : null;
  return { filteredSorted: s, grandTotals: c, ...l };
}
function Ci(t, r, e, n, s = 6) {
  const i = Math.ceil(r / e), o = Math.max(0, Math.floor(t / e) - s), a = Math.min(n, o + i + s * 2);
  return { first: o, last: a };
}
function xi(t) {
  return {
    // ---- Data ----
    setRowData(r) {
      t.setRowData(r);
    },
    getRowData() {
      return t.state.rowData.slice();
    },
    applyTransaction(r) {
      return t.applyTransaction(r);
    },
    // Server-side row model
    setRowCount(r) {
      t.setRowCount(r);
    },
    getRowCount() {
      return t.state.serverSide ? t.state.serverRowCount : t.state.rowData.length;
    },
    isServerSide() {
      return !!t.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(r) {
      t.setColumnDefs(r);
    },
    getColumnDefs() {
      return t.state.columnDefs.slice();
    },
    setColumnVisible(r, e) {
      t.setColumnVisible(r, e);
    },
    setColumnPinned(r, e) {
      t.setColumnPinned(r, e);
    },
    setColumnWidth(r, e) {
      t.setColumnWidth(r, e);
    },
    moveColumn(r, e) {
      t.moveColumn(r, e);
    },
    autoSizeColumn(r) {
      t.autoSizeColumn(r);
    },
    autoSizeAllColumns() {
      t.state.columnDefs.forEach((r) => t.autoSizeColumn(r.field));
    },
    sizeColumnsToFit() {
      t.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(r) {
      t.setSortModel(r);
    },
    getSortModel() {
      return t.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(r) {
      t.setFilterModel(r);
    },
    getFilterModel() {
      return { ...t.state.filterModel };
    },
    setColumnFilter(r, e) {
      t.setColumnFilter(r, e);
    },
    destroyFilter(r) {
      t.setColumnFilter(r, null);
    },
    setQuickFilter(r) {
      t.setQuickFilter(r);
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
    selectRow(r) {
      t.setSelected(r, !0);
    },
    deselectRow(r) {
      t.setSelected(r, !1);
    },
    getSelectedRows() {
      return t.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(t.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(r) {
      t.goToPage(r);
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
    paginationSetPageSize(r) {
      t.setPageSize(r);
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
    startEditingCell({ rowId: r, colId: e }) {
      t.startEditingCell(r, e);
    },
    stopEditing(r = !1) {
      t.stopEditing(r);
    },
    // ---- Row grouping + aggregation ----
    setRowGroupColumns(r) {
      t.setRowGroupColumns(r);
    },
    addRowGroupColumn(r) {
      t.addRowGroupColumn(r);
    },
    removeRowGroupColumn(r) {
      t.removeRowGroupColumn(r);
    },
    getRowGroupColumns() {
      return t.getRowGroupColumns();
    },
    setColumnAggFunc(r, e) {
      t.setColumnAggFunc(r, e);
    },
    expandAll() {
      t.expandAll();
    },
    collapseAll() {
      t.collapseAll();
    },
    toggleGroup(r, e) {
      t.toggleGroup(r, e);
    },
    // ---- Pivot ----
    setPivotMode(r) {
      t.setPivotMode(r);
    },
    isPivotMode() {
      return t.isPivotMode();
    },
    setPivotColumns(r) {
      t.setPivotColumns(r);
    },
    addPivotColumn(r) {
      t.addPivotColumn(r);
    },
    removePivotColumn(r) {
      t.removePivotColumn(r);
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
    setValueColumns(r) {
      t.setValueColumns(r);
    },
    addValueColumn(r, e = "sum") {
      t.addValueColumn(r, e);
    },
    removeValueColumn(r) {
      t.removeValueColumn(r);
    },
    getValueColumns() {
      return t.getValueColumns();
    },
    // ---- Column header groups (multi-row headers) ----
    setColumnGroups(r) {
      t.setColumnGroups(r);
    },
    getColumnGroups() {
      return t.getColumnGroups();
    },
    // ---- Pinned bottom row (sticky grand totals) ----
    setPinnedBottomRow(r) {
      t.setPinnedBottomRow(r);
    },
    isPinnedBottomRow() {
      return t.isPinnedBottomRow();
    },
    // ---- Tree data (self-referential parent_id) ----
    setTreeData(r) {
      t.setTreeData(r);
    },
    isTreeData() {
      return t.isTreeData();
    },
    setTreeParentField(r) {
      t.setTreeParentField(r);
    },
    expandTreeRow(r) {
      t.expandTreeRow(r);
    },
    collapseTreeRow(r) {
      t.collapseTreeRow(r);
    },
    toggleTreeRow(r) {
      t.toggleTreeRow(r);
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
    setMasterDetail(r) {
      t.setMasterDetail(r);
    },
    isMasterDetail() {
      return t.isMasterDetail();
    },
    expandDetailRow(r) {
      t.expandDetailRow(r);
    },
    collapseDetailRow(r) {
      t.collapseDetailRow(r);
    },
    toggleDetailRow(r) {
      t.toggleDetailRow(r);
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
    applyColumnState(r) {
      t.applyColumnState(r);
    },
    clearPersistedState() {
      t.clearPersistedState();
    },
    getPersistKey() {
      return t.persistKeyValue || "";
    },
    // ---- Export ----
    getDataAsCsv(r = {}) {
      return t.getDataAsCsv(r);
    },
    exportDataAsCsv(r = {}) {
      return t.exportDataAsCsv(r);
    },
    // ---- Display ----
    refreshCells(r = {}) {
      t.refresh(r);
    },
    redrawRows(r = {}) {
      t.refresh(r);
    },
    // ---- Events ----
    addEventListener(r, e) {
      t.element.addEventListener(r, e);
    },
    removeEventListener(r, e) {
      t.element.removeEventListener(r, e);
    }
  };
}
function x(t, r = {}, e = []) {
  const n = document.createElement(t);
  for (const [s, i] of Object.entries(r))
    i === !1 || i == null || (s === "class" ? n.className = i : s === "style" && typeof i == "object" ? Object.assign(n.style, i) : s.startsWith("on") && typeof i == "function" ? n.addEventListener(s.slice(2).toLowerCase(), i) : i === !0 ? n.setAttribute(s, "") : n.setAttribute(s, String(i)));
  for (const s of [].concat(e))
    s == null || s === !1 || n.appendChild(typeof s == "string" ? document.createTextNode(s) : s);
  return n;
}
function Ct(t, r) {
  for (const [e, n] of Object.entries(r))
    n == null || n === !1 ? t.removeAttribute(e) : n === !0 ? t.setAttribute(e, "") : t.setAttribute(e, String(n));
}
function xt(t) {
  const r = document.getElementById(t);
  return !r || r.tagName !== "TEMPLATE" ? null : r.content.firstElementChild.cloneNode(!0);
}
function I(t, r, e) {
  t.dispatchEvent(new CustomEvent(r, { detail: e, bubbles: !0 }));
}
function Si(t, r, e) {
  let n = t.parentElement;
  for (; n; ) {
    if ((n.getAttribute("data-controller") || "").split(/\s+/).includes(r)) {
      const i = e.getControllerForElementAndIdentifier(n, r);
      if (i) return i;
    }
    n = n.parentElement;
  }
  return null;
}
const St = [
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
], Li = [
  21522,
  20773,
  24188,
  23371,
  17913,
  16590,
  20375,
  19104
], Ne = new Uint8Array(512), ot = new Uint8Array(256);
(function() {
  let r = 1;
  for (let e = 0; e < 255; e++)
    Ne[e] = r, ot[r] = e, r <<= 1, r & 256 && (r ^= 285);
  for (let e = 255; e < 512; e++) Ne[e] = Ne[e - 255];
})();
function at(t, r) {
  return t === 0 || r === 0 ? 0 : Ne[ot[t] + ot[r]];
}
function ki(t) {
  const r = new Uint8Array(t);
  r[t - 1] = 1;
  let e = 1;
  for (let n = 0; n < t; n++) {
    for (let s = 0; s < t; s++)
      r[s] = at(r[s], e), s + 1 < t && (r[s] ^= r[s + 1]);
    e = at(e, 2);
  }
  return r;
}
function $i(t, r) {
  const e = new Uint8Array(r.length);
  for (const n of t) {
    const s = n ^ e[0];
    e.copyWithin(0, 1), e[e.length - 1] = 0;
    for (let i = 0; i < r.length; i++)
      e[i] ^= at(r[i], s);
  }
  return e;
}
class Ei {
  constructor() {
    this.bits = [];
  }
  append(r, e) {
    for (let n = e - 1; n >= 0; n--) this.bits.push(r >>> n & 1);
  }
  toBytes() {
    for (; this.bits.length % 8 !== 0; ) this.bits.push(0);
    const r = new Uint8Array(this.bits.length / 8);
    for (let e = 0; e < r.length; e++) {
      let n = 0;
      for (let s = 0; s < 8; s++) n = n << 1 | this.bits[e * 8 + s];
      r[e] = n;
    }
    return r;
  }
}
function Ai(t) {
  const r = new TextEncoder().encode(String(t));
  let e = 0;
  for (let $ = 1; $ <= 10; $++) {
    const E = 4 + ($ < 10 ? 8 : 16) + r.length * 8, D = St[$ - 1][0] * 8;
    if (E <= D) {
      e = $;
      break;
    }
  }
  if (e === 0)
    throw new Error(`qr: data too long for v10 ECC=M (${r.length} bytes; max 213)`);
  const [n, s, i] = St[e - 1], o = new Ei();
  o.append(4, 4), o.append(r.length, e < 10 ? 8 : 16);
  for (const $ of r) o.append($, 8);
  const a = n * 8;
  o.append(0, Math.min(4, Math.max(0, a - o.bits.length)));
  const l = o.toBytes(), c = new Uint8Array(n);
  c.set(l);
  const d = [236, 17];
  for (let $ = l.length; $ < n; $++) c[$] = d[($ - l.length) % 2];
  const p = Math.floor(n / i), f = n - p * i, g = [], h = ki(s);
  let b = 0;
  for (let $ = 0; $ < i; $++) {
    const L = $ < i - f ? p : p + 1, E = c.slice(b, b + L);
    b += L, g.push({ data: E, ecc: $i(E, h) });
  }
  const m = [], _ = p + 1;
  for (let $ = 0; $ < _; $++)
    for (const L of g) $ < L.data.length && m.push(L.data[$]);
  for (let $ = 0; $ < s; $++)
    for (const L of g) m.push(L.ecc[$]);
  const y = 17 + e * 4, w = new Uint8Array(y * y), C = new Uint8Array(y * y);
  Ti(w, C, y), Ni(w, C, y), Di(w, C, y, e), e >= 7 && Ri(w, C, y, e), Ii(w, C, y, m);
  let k = 0, T = 1 / 0;
  const M = new Uint8Array(w);
  for (let $ = 0; $ < 8; $++) {
    M.set(w), kt(M, C, y, $), Lt(M, y, $);
    const L = Pi(M, y);
    L < T && (T = L, k = $);
  }
  return kt(w, C, y, k), Lt(w, y, k), { size: y, matrix: w };
}
function U(t, r, e, n, s) {
  t[n * r + e] = s ? 1 : 0;
}
function Ti(t, r, e) {
  const n = [[0, 0], [e - 7, 0], [0, e - 7]];
  for (const [s, i] of n)
    for (let o = -1; o <= 7; o++)
      for (let a = -1; a <= 7; a++) {
        const l = s + a, c = i + o;
        if (l < 0 || c < 0 || l >= e || c >= e) continue;
        const p = a >= 0 && a < 7 && o >= 0 && o < 7 && (a === 0 || a === 6 || o === 0 || o === 6 || // outer ring
        a >= 2 && a <= 4 && o >= 2 && o <= 4);
        U(t, e, l, c, p), r[c * e + l] = 1;
      }
  for (let s = 0; s < 9; s++)
    r[s * e + 8] = 1, r[8 * e + s] = 1;
  for (let s = 0; s < 8; s++)
    r[(e - 1 - s) * e + 8] = 1, r[8 * e + (e - 1 - s)] = 1;
  U(t, e, 8, e - 8, 1), r[(e - 8) * e + 8] = 1;
}
function Ni(t, r, e) {
  for (let n = 8; n < e - 8; n++)
    U(t, e, n, 6, n % 2 === 0), U(t, e, 6, n, n % 2 === 0), r[6 * e + n] = 1, r[n * e + 6] = 1;
}
const Mi = [
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
function Di(t, r, e, n) {
  const s = Mi[n];
  if (s) {
    for (const i of s)
      for (const o of s)
        if (!(o === 6 && i === 6 || o === e - 7 && i === 6 || o === 6 && i === e - 7))
          for (let l = -2; l <= 2; l++)
            for (let c = -2; c <= 2; c++) {
              const d = Math.max(Math.abs(c), Math.abs(l)) !== 1;
              U(t, e, o + c, i + l, d), r[(i + l) * e + (o + c)] = 1;
            }
  }
}
function Ri(t, r, e, n) {
  let s = n, i = s;
  for (let a = 0; a < 12; a++)
    i = i << 1 ^ (i >>> 11) * 7973;
  const o = s << 12 | i;
  for (let a = 0; a < 18; a++) {
    const l = o >>> a & 1, c = Math.floor(a / 3), d = a % 3 + e - 11;
    U(t, e, c, d, l), r[d * e + c] = 1, U(t, e, d, c, l), r[c * e + d] = 1;
  }
}
function Lt(t, r, e) {
  const n = Li[e];
  for (let s = 0; s < 15; s++) {
    const i = (n >>> s & 1) === 1;
    s < 6 ? U(t, r, 8, s, i) : s < 8 ? U(t, r, 8, s + 1, i) : s < 9 ? U(t, r, 7, 8, i) : U(t, r, 14 - s, 8, i), s < 8 ? U(t, r, r - 1 - s, 8, i) : U(t, r, 8, r - 15 + s, i);
  }
  U(t, r, 8, r - 8, 1);
}
function Ii(t, r, e, n) {
  let s = 0, i = -1;
  for (let o = e - 1; o > 0; o -= 2) {
    o === 6 && o--;
    for (let a = 0; a < e; a++) {
      const l = i < 0 ? e - 1 - a : a;
      for (let c = 0; c < 2; c++) {
        const d = o - c;
        if (r[l * e + d]) continue;
        const p = s < n.length * 8 ? n[s >>> 3] >>> 7 - (s & 7) & 1 : 0;
        t[l * e + d] = p, s++;
      }
    }
    i = -i;
  }
}
function kt(t, r, e, n) {
  for (let s = 0; s < e; s++)
    for (let i = 0; i < e; i++) {
      if (r[s * e + i]) continue;
      let o = !1;
      switch (n) {
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
      o && (t[s * e + i] ^= 1);
    }
}
function Pi(t, r) {
  let e = 0;
  for (let n = 0; n < r; n++) {
    let s = 1, i = -1;
    for (let o = 0; o < r; o++) {
      const a = t[n * r + o];
      a === i ? (s++, s === 5 ? e += 3 : s > 5 && (e += 1)) : (i = a, s = 1);
    }
  }
  for (let n = 0; n < r; n++) {
    let s = 1, i = -1;
    for (let o = 0; o < r; o++) {
      const a = t[o * r + n];
      a === i ? (s++, s === 5 ? e += 3 : s > 5 && (e += 1)) : (i = a, s = 1);
    }
  }
  for (let n = 0; n < r - 1; n++)
    for (let s = 0; s < r - 1; s++) {
      const i = t[n * r + s];
      t[n * r + s + 1] === i && t[(n + 1) * r + s] === i && t[(n + 1) * r + s + 1] === i && (e += 3);
    }
  return e;
}
function Vi({ size: t, matrix: r }, e = {}) {
  const {
    moduleSize: n = 4,
    margin: s = 2,
    background: i = "#fff",
    foreground: o = "#111827"
  } = e, a = (t + s * 2) * n;
  let l = "";
  for (let c = 0; c < t; c++)
    for (let d = 0; d < t; d++)
      if (r[c * t + d]) {
        const p = (d + s) * n, f = (c + s) * n;
        l += `M${p},${f}h${n}v${n}h-${n}z`;
      }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a} ${a}" width="${a}" height="${a}" shape-rendering="crispEdges" aria-hidden="true"><rect width="${a}" height="${a}" fill="${i}"/><path d="${l}" fill="${o}"/></svg>`;
}
const Yt = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.1 297.4z"/></svg>', dt = /* @__PURE__ */ new Map();
function v(t, r) {
  if (typeof t != "string" || !t) throw new Error("registerRenderer: name must be a non-empty string");
  if (typeof r != "function") throw new Error("registerRenderer: fn must be a function");
  dt.set(t, r);
}
function be(t) {
  return dt.get(t) || null;
}
function Fi() {
  return Array.from(dt.keys());
}
function Bi(t, { copy: r, parse: e } = {}) {
  return typeof r == "function" && (t.copyValue = r), typeof e == "function" && (t.parseValue = e), t;
}
const Zt = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on", "✓", "checked"]), Xt = /* @__PURE__ */ new Set(["0", "false", "f", "no", "n", "off", "✗", "unchecked", "-", "—"]);
function Hi(t, r) {
  const e = String(t ?? "");
  if (e === "") return "";
  switch (r?.type) {
    case "number": {
      const n = e.replace(/[,$£€¥\s]/g, "").replace(/%$/, ""), s = Number(n);
      return Number.isFinite(s) ? s : void 0;
    }
    case "boolean": {
      const n = e.trim().toLowerCase();
      return Zt.has(n) ? !0 : Xt.has(n) ? !1 : void 0;
    }
    case "date": {
      const n = new Date(e);
      return Number.isNaN(n.valueOf()) ? void 0 : e;
    }
    default:
      return e;
  }
}
function Oi(t, r, e) {
  return e != null && e !== "" ? e : t == null ? "" : String(t);
}
function Ye(t) {
  if (t == null || t === "") return;
  const r = String(t).replace(/[,$£€¥\s]/g, "").replace(/%$/, "");
  if (r === "" || r === "-" || r === ".") return;
  const e = Number(r);
  return Number.isFinite(e) ? e : void 0;
}
function Gi(t) {
  const r = String(t ?? "").trim().toLowerCase();
  if (r !== "") {
    if (Zt.has(r)) return !0;
    if (Xt.has(r)) return !1;
  }
}
function u(t, r = {}, e = null) {
  const n = document.createElement(t);
  for (const [s, i] of Object.entries(r))
    i == null || i === !1 || (s === "class" ? n.className = i : n.setAttribute(s, i === !0 ? "" : String(i)));
  return e == null || (Array.isArray(e) ? e.forEach((s) => n.append(s)) : typeof e == "string" ? n.innerHTML = e : n.append(e)), n;
}
const S = (t) => t == null || t === "", zi = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function Jt() {
  return ({ value: t }) => {
    if (S(t)) return "";
    const r = String(t);
    return zi.test(r) ? u("a", {
      class: "sg-renderer-link",
      href: `mailto:${r}`,
      title: "Send email"
    }, document.createTextNode(r)) : u("span", { class: "sg-renderer-invalid", title: "Invalid email" }, document.createTextNode(r));
  };
}
function Qt({ newTab: t = !0 } = {}) {
  return ({ value: r }) => {
    if (S(r)) return "";
    const e = String(r);
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
function en({ defaultRegion: t = "AU" } = {}) {
  return ({ value: r }) => {
    if (S(r)) return "";
    const e = String(r).trim(), n = e.replace(/\D/g, "");
    if (!n) return document.createTextNode(e);
    let s = e;
    return t === "AU" && (/^04\d{8}$/.test(n) ? s = `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}` : /^0[2378]\d{8}$/.test(n) ? s = `(${n.slice(0, 2)}) ${n.slice(2, 6)} ${n.slice(6)}` : /^1[38]00\d{6}$/.test(n) ? s = `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}` : n.length === 8 && (s = `${n.slice(0, 4)} ${n.slice(4)}`)), u("a", { class: "sg-renderer-link", href: `tel:${n}` }, document.createTextNode(s));
  };
}
function tn({ currency: t = "USD", locale: r = "en-US", decimals: e } = {}) {
  return ({ value: n, td: s }) => {
    if (s && s.classList.add("sg-renderer-number"), S(n)) return "";
    const i = Number(n);
    if (!Number.isFinite(i)) return String(n);
    const o = { style: "currency", currency: t };
    return e != null && (o.minimumFractionDigits = e, o.maximumFractionDigits = e), i.toLocaleString(r, o);
  };
}
function nn({ decimals: t = 0, scale: r = "as-is" } = {}) {
  return ({ value: e, td: n }) => {
    if (n && n.classList.add("sg-renderer-number"), S(e)) return "";
    let s = Number(e);
    return Number.isFinite(s) ? (r === "fraction" && (s *= 100), `${s.toFixed(t)}%`) : String(e);
  };
}
function j(t) {
  if (t == null || t === "") return null;
  if (t instanceof Date) return Number.isNaN(t.valueOf()) ? null : t;
  const r = new Date(t);
  return Number.isNaN(r.valueOf()) ? null : r;
}
function rn({ locale: t = void 0, dateStyle: r = "medium", ...e } = {}) {
  const n = new Intl.DateTimeFormat(t, { dateStyle: r, ...e });
  return ({ value: s }) => {
    const i = j(s);
    return i ? n.format(i) : "";
  };
}
function sn({ locale: t = void 0, dateStyle: r = "medium", timeStyle: e = "short", ...n } = {}) {
  const s = new Intl.DateTimeFormat(t, { dateStyle: r, timeStyle: e, ...n });
  return ({ value: i }) => {
    const o = j(i);
    return o ? s.format(o) : "";
  };
}
const Qe = [
  { unit: "second", ms: 1e3, cutoff: 60 * 1e3 },
  { unit: "minute", ms: 60 * 1e3, cutoff: 3600 * 1e3 },
  { unit: "hour", ms: 3600 * 1e3, cutoff: 1440 * 60 * 1e3 },
  { unit: "day", ms: 1440 * 60 * 1e3, cutoff: 10080 * 60 * 1e3 },
  { unit: "week", ms: 10080 * 60 * 1e3, cutoff: 720 * 60 * 60 * 1e3 },
  { unit: "month", ms: 720 * 60 * 60 * 1e3, cutoff: 365 * 24 * 60 * 60 * 1e3 },
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1e3, cutoff: 1 / 0 }
];
function on({ locale: t = void 0, numeric: r = "auto", style: e = "long" } = {}) {
  const n = new Intl.RelativeTimeFormat(t, { numeric: r, style: e });
  return ({ value: s }) => {
    const i = j(s);
    if (!i) return "";
    const o = i.getTime() - Date.now(), a = Math.abs(o), l = Qe.find((p) => a < p.cutoff) || Qe[Qe.length - 1], c = Math.round(o / l.ms), d = u("span", { class: "sg-renderer-relative-time", title: i.toLocaleString() });
    return d.textContent = n.format(c, l.unit), d;
  };
}
const ji = { ms: 1, sec: 1e3, second: 1e3, min: 6e4, minute: 6e4, hr: 36e5, hour: 36e5 };
function an({ unit: t = "ms", style: r = "compact" } = {}) {
  const e = ji[t] ?? 1;
  return ({ value: n, td: s }) => {
    if (s && s.classList.add("sg-renderer-number"), S(n)) return "";
    const i = Number(n) * e;
    if (!Number.isFinite(i)) return String(n);
    const o = i < 0 ? "-" : "", a = Math.abs(i), l = Math.floor(a / 36e5), c = Math.floor(a % 36e5 / 6e4), d = Math.floor(a % 6e4 / 1e3);
    if (r === "clock") {
      const f = (g) => String(g).padStart(2, "0");
      return o + (l > 0 ? `${f(l)}:${f(c)}:${f(d)}` : `${f(c)}:${f(d)}`);
    }
    if (r === "words") {
      const f = [];
      return l && f.push(`${l} ${l === 1 ? "hour" : "hours"}`), c && f.push(`${c} ${c === 1 ? "minute" : "minutes"}`), !l && d && f.push(`${d} ${d === 1 ? "second" : "seconds"}`), o + (f.join(" ") || "0 seconds");
    }
    const p = [];
    return l && p.push(`${l}h`), c && p.push(`${c}m`), !l && d && p.push(`${d}s`), o + (p.join(" ") || "0s");
  };
}
function ln({ locale: t = void 0, decimals: r, ...e } = {}) {
  const n = { ...e };
  r != null && (n.minimumFractionDigits = r, n.maximumFractionDigits = r);
  const s = new Intl.NumberFormat(t, n);
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), S(i)) return "";
    const a = Number(i);
    return Number.isFinite(a) ? s.format(a) : String(i);
  };
}
function cn({ locale: t = void 0, compactDisplay: r = "short", maximumFractionDigits: e = 1 } = {}) {
  const n = new Intl.NumberFormat(t, {
    notation: "compact",
    compactDisplay: r,
    maximumFractionDigits: e
  });
  return ({ value: s, td: i }) => {
    if (i && i.classList.add("sg-renderer-number"), S(s)) return "";
    const o = Number(s);
    return Number.isFinite(o) ? n.format(o) : String(s);
  };
}
function dn({ binary: t = !0, decimals: r = 1, locale: e = void 0 } = {}) {
  const n = t ? 1024 : 1e3, s = t ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"], i = new Intl.NumberFormat(e, {
    minimumFractionDigits: r,
    maximumFractionDigits: r
  });
  return ({ value: o, td: a }) => {
    if (a && a.classList.add("sg-renderer-number"), S(o)) return "";
    let l = Number(o);
    if (!Number.isFinite(l)) return String(o);
    const c = l < 0 ? "-" : "";
    l = Math.abs(l);
    let d = 0;
    for (; l >= n && d < s.length - 1; )
      l /= n, d += 1;
    const p = d === 0 ? String(Math.round(l)) : i.format(l);
    return `${c}${p} ${s[d]}`;
  };
}
const Ui = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on"]);
function ut(t) {
  return t === !0 || t === 1 ? !0 : t == null || t === "" || t === !1 || t === 0 ? !1 : Ui.has(String(t).toLowerCase());
}
const Ki = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>', qi = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
function un({
  truthy: t = ut,
  nullLabel: r = "—",
  falseStyle: e = "icon"
  // 'icon' | 'hidden'
} = {}) {
  return ({ value: n }) => {
    if (n == null || n === "")
      return u("span", { class: "sg-renderer-bool-null" }, document.createTextNode(r));
    if (t(n)) {
      const i = u("span", { class: "sg-renderer-bool is-true", "aria-label": "true" });
      return i.innerHTML = Ki, i;
    }
    if (e === "hidden") return "";
    const s = u("span", { class: "sg-renderer-bool is-false", "aria-label": "false" });
    return s.innerHTML = qi, s;
  };
}
const Wi = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>', Yi = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.7 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>', Zi = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M64 256a32 32 0 1 0 0-64H384V160c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9S384 364.9 384 352V320H64z"/></svg>';
function pn({
  style: t = "percent",
  // 'percent' | 'number' | 'currency'
  decimals: r = 1,
  locale: e = void 0,
  currency: n = "USD",
  inverted: s = !1,
  showSign: i = !0
} = {}) {
  let o;
  return t === "currency" ? o = new Intl.NumberFormat(e, {
    style: "currency",
    currency: n,
    minimumFractionDigits: r,
    maximumFractionDigits: r,
    signDisplay: i ? "always" : "auto"
  }) : o = new Intl.NumberFormat(e, {
    minimumFractionDigits: r,
    maximumFractionDigits: r,
    signDisplay: i ? "always" : "auto"
  }), ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-number"), S(a)) return "";
    const c = Number(a);
    if (!Number.isFinite(c)) return String(a);
    let d = "is-flat", p = Zi;
    const f = !s;
    c > 0 ? (d = f ? "is-up" : "is-down", p = Wi) : c < 0 && (d = f ? "is-down" : "is-up", p = Yi);
    const g = u("span", { class: `sg-renderer-delta ${d}` }), h = u("span", { class: "sg-renderer-delta-icon", "aria-hidden": "true" });
    h.innerHTML = p;
    const b = t === "percent" ? `${o.format(c)}%` : o.format(c);
    return g.append(h), g.append(u("span", { class: "sg-renderer-delta-value" }, document.createTextNode(b))), g;
  };
}
function fn({ chars: t = null } = {}) {
  return ({ value: r, td: e }) => {
    if (S(r)) return "";
    const n = String(r);
    let s = n, i = !1;
    return t && n.length > t && (s = n.slice(0, t) + "…", i = !0), e && (e.classList.add("sg-renderer-truncate"), e.setAttribute("title", n)), i ? s : n;
  };
}
const Ue = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>', gn = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';
function hn({ position: t = "after" } = {}) {
  return ({ value: r }) => {
    if (S(r)) return "";
    const e = String(r), n = u("span", { class: "sg-renderer-copyable" }), s = u("span", { class: "sg-renderer-copyable-value" }, document.createTextNode(e)), i = u("button", {
      type: "button",
      class: "sg-renderer-copyable-btn",
      title: "Copy",
      "aria-label": `Copy ${e}`
    });
    return i.innerHTML = Ue, i.addEventListener("click", async (o) => {
      o.stopPropagation(), o.preventDefault();
      try {
        navigator.clipboard?.writeText ? await navigator.clipboard.writeText(e) : mn(e), i.innerHTML = gn, i.classList.add("is-copied"), setTimeout(() => {
          i.innerHTML = Ue, i.classList.remove("is-copied");
        }, 1200);
      } catch {
      }
    }), t === "before" ? n.append(i, s) : n.append(s, i), n;
  };
}
function mn(t) {
  const r = document.createElement("textarea");
  r.value = t, r.style.position = "fixed", r.style.left = "-9999px", document.body.appendChild(r), r.select();
  try {
    document.execCommand("copy");
  } catch {
  }
  document.body.removeChild(r);
}
function bn({
  size: t = 36,
  rounded: r = "sm",
  // 'sm' = 4px, 'lg' = 8px, 'full' = circle, 'none'
  altField: e = "alt",
  clickToZoom: n = !1
} = {}) {
  const s = r === "full" ? "999px" : r === "lg" ? "8px" : r === "none" ? "0" : "4px";
  return ({ value: i, row: o }) => {
    if (S(i)) return "";
    const a = String(i), l = o?.[e] ?? "", c = u("img", {
      src: a,
      alt: l,
      class: "sg-renderer-image",
      width: String(t),
      height: String(t),
      style: `border-radius: ${s};`,
      loading: "lazy",
      decoding: "async"
    });
    return n && (c.style.cursor = "zoom-in", c.addEventListener("click", (d) => {
      d.stopPropagation(), Xi(a, l);
    })), c;
  };
}
function Xi(t, r) {
  const e = u("div", { class: "sg-image-zoom" }), n = () => {
    e.remove(), document.removeEventListener("keydown", s);
  }, s = (i) => {
    i.key === "Escape" && n();
  };
  e.addEventListener("click", n), document.addEventListener("keydown", s), e.append(u("img", { src: t, alt: r || "", class: "sg-image-zoom-img" })), document.body.appendChild(e);
}
function yn({
  showLabel: t = !0,
  label: r = "value",
  // 'value' | 'name' | (value, row) => string
  shape: e = "circle",
  // 'circle' | 'square'
  size: n = 14
} = {}) {
  return ({ value: s, row: i }) => {
    if (S(s)) return "";
    const o = String(s).trim(), a = u("span", { class: "sg-renderer-swatch" }), l = u("span", {
      class: `sg-renderer-swatch-chip is-${e}`,
      style: `width: ${n}px; height: ${n}px; background: ${o};`,
      "aria-hidden": "true"
    });
    if (a.append(l), t) {
      const c = typeof r == "function" ? r(s, i) : r === "name" ? i?.name ?? o : o;
      a.append(u("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(c)));
    }
    return a;
  };
}
const pt = {
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  orange: "#f97316",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#6b7280"
};
function wn({
  type: t = "line",
  // 'line' | 'area' | 'bar'
  width: r = 80,
  height: e = 24,
  color: n = "blue",
  // palette key OR raw CSS colour
  baseline: s = null,
  // null = auto-min, 0 = lock min at zero, N = lock at N
  showLast: i = !0
  // small dot on the last point (line / area only)
} = {}) {
  const o = pt[n] || n;
  return ({ value: a }) => {
    if (!Array.isArray(a) || a.length === 0) return "";
    const l = a.map(Number).filter((w) => Number.isFinite(w));
    if (l.length === 0) return "";
    const c = s ?? Math.min(...l), p = Math.max(...l, s ?? -1 / 0) - c || 1, f = 1.5, g = 2.5, h = r - f * 2, b = e - g * 2, m = (w) => f + (l.length === 1 ? h / 2 : w / (l.length - 1) * h), _ = (w) => g + b - (w - c) / p * b;
    let y = "";
    if (t === "bar") {
      const C = Math.max(1, (h - (l.length - 1) * 1) / l.length);
      for (let k = 0; k < l.length; k++) {
        const T = l[k], M = f + k * (C + 1), $ = _(T), L = g + b - $;
        y += `<rect x="${M.toFixed(2)}" y="${$.toFixed(2)}" width="${C.toFixed(2)}" height="${L.toFixed(2)}" fill="${o}"/>`;
      }
    } else {
      let w = "";
      for (let C = 0; C < l.length; C++)
        w += `${C === 0 ? "M" : "L"} ${m(C).toFixed(2)} ${_(l[C]).toFixed(2)} `;
      if (t === "area") {
        const C = w + ` L ${m(l.length - 1).toFixed(2)} ${(g + b).toFixed(2)} L ${m(0).toFixed(2)} ${(g + b).toFixed(2)} Z`;
        y += `<path d="${C}" fill="${o}" fill-opacity="0.18" stroke="none"/>`;
      }
      if (y += `<path d="${w.trim()}" fill="none" stroke="${o}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`, i) {
        const C = m(l.length - 1), k = _(l[l.length - 1]);
        y += `<circle cx="${C.toFixed(2)}" cy="${k.toFixed(2)}" r="1.8" fill="${o}"/>`;
      }
    }
    return `<svg class="sg-renderer-sparkline is-${t}" viewBox="0 0 ${r} ${e}" width="${r}" height="${e}" preserveAspectRatio="none" aria-hidden="true">` + y + "</svg>";
  };
}
function _n(t) {
  if (typeof t != "string") return null;
  let r = t.trim().replace(/^#/, "");
  return r.length === 3 && (r = r.split("").map((e) => e + e).join("")), /^[0-9a-f]{6}$/i.test(r) ? [parseInt(r.slice(0, 2), 16), parseInt(r.slice(2, 4), 16), parseInt(r.slice(4, 6), 16)] : null;
}
function Ji(t, r, e) {
  const n = (s) => Math.max(0, Math.min(255, Math.round(s))).toString(16).padStart(2, "0");
  return `#${n(t)}${n(r)}${n(e)}`;
}
function Qi(t, r, e) {
  return [t[0] + (r[0] - t[0]) * e, t[1] + (r[1] - t[1]) * e, t[2] + (r[2] - t[2]) * e];
}
function vn([t, r, e]) {
  return 0.299 * t + 0.587 * r + 0.114 * e >= 145;
}
function Cn({
  min: t = 0,
  max: r = 100,
  colors: e = ["#dcfce7", "#fef3c7", "#fecaca"],
  inverted: n = !1,
  showValue: s = !0,
  format: i = null
  // (value) => string for custom labels
} = {}) {
  const o = e.map(_n).filter(Boolean);
  if (o.length < 2) throw new Error("heatmap: need at least two valid hex colours");
  return ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-heatmap"), S(a)) return "";
    let c = Number(a);
    if (!Number.isFinite(c)) return String(a);
    let d = r - t === 0 ? 0.5 : (c - t) / (r - t);
    d = Math.max(0, Math.min(1, d)), n && (d = 1 - d);
    const p = d * (o.length - 1), f = Math.min(o.length - 2, Math.floor(p)), g = p - f, h = Qi(o[f], o[f + 1], g);
    return l && (l.style.backgroundColor = Ji(...h), l.style.color = vn(h) ? "#111827" : "#ffffff"), s ? typeof i == "function" ? i(a) : String(a) : "";
  };
}
const eo = {
  // Credit card: 16 digits grouped 4-4-4-4, last 4 visible. Handles 13-19
  // digit lengths gracefully (Amex 15, others 16). Non-digits are stripped.
  "cc-last4": (t, r) => $t(t.replace(/\D/g, ""), 4, 4, r, " "),
  // BIN + last4: show the first 6 + last 4, mask the middle (PCI-friendly).
  "cc-bin-last4": (t, r) => $t(t.replace(/\D/g, ""), 4, 4, r, " ", 6),
  // Phone: show the last 4 digits, mask the rest as a single bullet
  // block ("•••••• 1234"). Sidesteps the country-specific 3-3-4 / 4-3-3
  // grouping ambiguity — register your own variant if you need a
  // region-specific layout.
  "phone-last4": (t, r) => {
    const e = t.replace(/\D/g, "");
    return e ? e.length <= 4 ? e : r.repeat(e.length - 4) + " " + e.slice(-4) : t;
  },
  // Email: show first char + domain ("a••••@example.com").
  email: (t, r) => {
    const e = String(t).match(/^([^@\s]+)(@.+)$/);
    return e ? e[1][0] + r.repeat(Math.max(1, e[1].length - 1)) + e[2] : t;
  },
  // SSN / ABN-style: show last 4.
  last4: (t, r) => to(t, 4, r)
};
function to(t, r, e) {
  const n = String(t);
  return n.length <= r ? n : e.repeat(n.length - r) + n.slice(-r);
}
function $t(t, r, e, n, s, i = 0) {
  if (!t) return "";
  const o = t.length, a = t.split("").map((c, d) => d < i || d >= o - e ? c : n).join(""), l = [];
  for (let c = a.length; c > 0; c -= r)
    l.unshift(a.slice(Math.max(0, c - r), c));
  return l.join(s);
}
const no = /* @__PURE__ */ new Set(["cc-last4", "cc-bin-last4", "phone-last4", "last4"]);
function xn({
  format: t = null,
  showFirst: r = 0,
  showLast: e = 4,
  char: n = "•",
  align: s = null
  // 'left' | 'right' | null (auto)
} = {}) {
  const i = t ? eo[t] : null, o = t ? no.has(t) : !1, a = s === "right" || s !== "left" && o;
  return ({ value: l, td: c }) => {
    if (c && a && c.classList.add("sg-renderer-mask-numeric"), S(l)) return "";
    const d = String(l);
    if (i) return i(d, n);
    const p = d.slice(0, r), f = e > 0 ? d.slice(-e) : "", g = Math.max(0, d.length - r - e);
    return p + n.repeat(g) + f;
  };
}
function Sn({
  query: t = null,
  caseSensitive: r = !1,
  className: e = "sg-renderer-mark"
} = {}) {
  return ({ value: n, api: s }) => {
    if (S(n)) return "";
    const i = String(n), o = t != null ? String(t) : s?.getQuickFilter?.() || "";
    return o ? ro(i, o, r, e) : document.createTextNode(i);
  };
}
function ro(t, r, e, n) {
  const s = e ? t : t.toLowerCase(), i = e ? r : r.toLowerCase(), o = document.createElement("span");
  let a = 0;
  for (; a < t.length; ) {
    const l = s.indexOf(i, a);
    if (l === -1) {
      o.appendChild(document.createTextNode(t.slice(a)));
      break;
    }
    l > a && o.appendChild(document.createTextNode(t.slice(a, l)));
    const c = document.createElement("mark");
    c.className = n, c.textContent = t.slice(l, l + r.length), o.appendChild(c), a = l + r.length;
  }
  return o;
}
function Ln({ lines: t = null, separator: r = `
` } = {}) {
  return ({ value: e, td: n }) => {
    if (S(e)) return "";
    const s = String(e), i = r === `
` ? s : s.split(r).join(`
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
  let r = Number(t);
  if (r < 1024) return `${r} B`;
  const e = ["KB", "MB", "GB", "TB"];
  let n = -1;
  do
    r /= 1024, n++;
  while (r >= 1024 && n < e.length - 1);
  return `${r.toFixed(r < 10 ? 1 : 0)} ${e[n]}`;
}
const so = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "ico"]);
function ne(t) {
  if (!t) return !1;
  if (typeof t.content_type == "string" && t.content_type.startsWith("image/")) return !0;
  const r = String(t.filename || "").split(".").pop()?.toLowerCase();
  return r ? so.has(r) : !1;
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
}, kn = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>', ft = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>', io = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>', oo = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 105.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>', ao = /* @__PURE__ */ new Set(["mp3", "wav", "flac", "m4a", "ogg", "aac", "opus"]), lo = /* @__PURE__ */ new Set(["mp4", "mov", "webm", "mkv", "avi", "m4v"]);
function $n(t) {
  const r = String(t?.content_type || "").toLowerCase(), e = String(t?.filename || "").split(".").pop()?.toLowerCase() || "";
  return r.includes("pdf") || e === "pdf" ? "pdf" : r.startsWith("audio/") || ao.has(e) ? "audio" : r.startsWith("video/") || lo.has(e) ? "video" : r.includes("zip") || ["zip", "tar", "gz", "7z", "rar"].includes(e) ? "zip" : r.includes("sheet") || r.includes("excel") || r.includes("csv") || ["xls", "xlsx", "csv", "numbers"].includes(e) ? "sheet" : r.includes("word") || r.includes("document") || ["doc", "docx", "txt", "md", "rtf"].includes(e) ? "doc" : ["js", "ts", "rb", "py", "go", "rs", "java", "json", "xml", "html", "css", "sh", "sql"].includes(e) ? "code" : "file";
}
function Ze(t) {
  if (t == null || t === "") return [];
  let r = t;
  if (typeof r == "string")
    try {
      r = JSON.parse(r);
    } catch {
      return [];
    }
  return Array.isArray(r) || (r = [r]), r.filter((e) => e && (e.url || e.signed_id)).map((e, n) => ({
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
function En({
  thumbSize: t = 28,
  maxThumbs: r = 4,
  empty: e = "",
  editable: n = !1,
  accept: s = null,
  multiple: i = !0,
  download: o = !1,
  onUpload: a = null,
  onRemove: l = null
} = {}) {
  return (c) => {
    const { value: d, td: p, row: f, col: g } = c, h = Ze(d);
    if (p && (p.classList.add("sg-renderer-attachments-cell"), p.dataset.attachmentCount = String(h.length), p._sgAttachments = h), h.length === 0 && !n)
      return e ? document.createTextNode(e) : "";
    const b = u("div", { class: "sg-renderer-attachments", role: "group" }), m = h.slice(0, r), _ = Math.max(0, h.length - m.length);
    if (m.forEach((y) => b.append(co(y, t, h, o))), _ > 0) {
      const y = u(
        "span",
        { class: "sg-attach-more", title: `${_} more` },
        document.createTextNode(`+${_}`)
      );
      y.addEventListener("click", (w) => {
        w.stopPropagation(), An(h, h[m.length]);
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
      y.innerHTML = kn, y.addEventListener("click", (w) => {
        w.stopPropagation(), Et(p, c, { thumbSize: t, accept: s, multiple: i, onUpload: a, onRemove: l });
      }), b.append(y), uo(p, c, { onUpload: a }), p.addEventListener("dblclick", (w) => {
        w._sgAttachmentHandled || (w._sgAttachmentHandled = !0, w.stopPropagation(), Et(p, c, { thumbSize: t, accept: s, multiple: i, onUpload: a, onRemove: l }));
      }, { once: !1 });
    }
    return b;
  };
}
function co(t, r, e, n) {
  const s = u("button", {
    type: "button",
    class: "sg-attach-thumb",
    title: `${t.filename}${t.byte_size != null ? " · " + _e(t.byte_size) : ""}`,
    "data-attachment-id": t.id,
    "data-attachment-kind": ne(t) ? "image" : "file",
    "aria-label": t.filename,
    style: `width: ${r}px; height: ${r}px;`
  });
  if (ne(t) && t.thumb_url)
    s.append(u("img", {
      src: t.thumb_url,
      alt: t.filename,
      loading: "lazy",
      decoding: "async",
      width: String(r),
      height: String(r)
    }));
  else {
    const i = $n(t), o = u("span", { class: `sg-attach-icon is-${i}`, "aria-hidden": "true" });
    o.innerHTML = Ke[i] || Ke.file, s.append(o);
  }
  return s.addEventListener("click", (i) => {
    if (i.stopPropagation(), ne(t)) {
      const o = e.filter(ne);
      An(o.length ? o : [t], t);
    } else if (n) {
      const o = document.createElement("a");
      o.href = t.url, o.download = t.filename, document.body.appendChild(o), o.click(), o.remove();
    } else
      window.open(t.url, "_blank", "noopener,noreferrer");
  }), s;
}
let ge = null;
function An(t, r) {
  et();
  const e = t.filter(ne);
  if (e.length === 0) return;
  let n = Math.max(0, e.findIndex((g) => g.id === r?.id));
  n < 0 && (n = 0);
  const s = u("div", { class: "sg-image-zoom sg-attach-lightbox", role: "dialog", "aria-modal": "true" }), i = u("div", { class: "sg-attach-lightbox-stage" }), o = u("img", { class: "sg-image-zoom-img", alt: "" }), a = u("div", { class: "sg-attach-lightbox-caption" }), l = u("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-prev",
    "aria-label": "Previous attachment"
  }), c = u("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-next",
    "aria-label": "Next attachment"
  });
  l.innerHTML = io, c.innerHTML = oo;
  function d() {
    const g = e[n];
    o.src = g.preview_url || g.url, o.alt = g.filename, a.textContent = `${g.filename}${g.byte_size != null ? " · " + _e(g.byte_size) : ""} (${n + 1}/${e.length})`, l.style.visibility = e.length > 1 ? "visible" : "hidden", c.style.visibility = e.length > 1 ? "visible" : "hidden";
  }
  function p(g) {
    n = (n + g + e.length) % e.length, d();
  }
  function f(g) {
    g.key === "Escape" ? et() : g.key === "ArrowLeft" ? p(-1) : g.key === "ArrowRight" && p(1);
  }
  s.addEventListener("click", (g) => {
    (g.target === s || g.target === i) && et();
  }), l.addEventListener("click", (g) => {
    g.stopPropagation(), p(-1);
  }), c.addEventListener("click", (g) => {
    g.stopPropagation(), p(1);
  }), document.addEventListener("keydown", f), i.append(l, o, c), s.append(i, a), document.body.appendChild(s), ge = { overlay: s, onKey: f }, d();
}
function et() {
  ge && (document.removeEventListener("keydown", ge.onKey), ge.overlay.remove(), ge = null);
}
let Me = null;
function uo(t, r, { onUpload: e }) {
  t._sgAttachDropBound || (t._sgAttachDropBound = !0, t.addEventListener("dragover", (n) => {
    n.dataTransfer?.types?.includes("Files") && (n.preventDefault(), t.classList.add("is-drop-target"));
  }), t.addEventListener("dragleave", () => t.classList.remove("is-drop-target")), t.addEventListener("drop", async (n) => {
    if (!n.dataTransfer?.files?.length) return;
    n.preventDefault(), t.classList.remove("is-drop-target");
    const s = Array.from(n.dataTransfer.files);
    await De(t, r, s, e);
  }));
}
function Et(t, r, e) {
  Ce();
  const { thumbSize: n, accept: s, multiple: i, onUpload: o, onRemove: a } = e, l = t._sgAttachments || Ze(r.value), c = u("div", { class: "sg-attach-editor", role: "dialog", "aria-modal": "false" });
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
      return y.innerHTML = ft, y.addEventListener("click", Ce), y;
    })()
  ]), p = u("div", { class: "sg-attach-editor-grid" });
  function f() {
    const y = t._sgAttachments || [];
    p.replaceChildren(), y.forEach((w) => p.append(po(w, t, r, a, n))), d.firstChild.textContent = y.length === 1 ? "1 attachment" : `${y.length} attachments`;
  }
  f(), t._sgAttachRepaint = f;
  const g = u("label", { class: "sg-attach-dropzone", tabindex: "0" });
  g.innerHTML = `
    <span class="sg-attach-dropzone-icon" aria-hidden="true">${kn}</span>
    <span class="sg-attach-dropzone-text">Drop files, paste, or <strong>browse</strong></span>
  `;
  const h = u("input", { type: "file", multiple: i ? "" : null, accept: s || null });
  h.style.display = "none", g.append(h), h.addEventListener("change", async () => {
    h.files?.length && (await De(t, r, Array.from(h.files), o), h.value = "", f());
  }), g.addEventListener("dragover", (y) => {
    y.dataTransfer?.types?.includes("Files") && (y.preventDefault(), g.classList.add("is-drop-target"));
  }), g.addEventListener("dragleave", () => g.classList.remove("is-drop-target")), g.addEventListener("drop", async (y) => {
    y.dataTransfer?.files?.length && (y.preventDefault(), g.classList.remove("is-drop-target"), await De(t, r, Array.from(y.dataTransfer.files), o), f());
  });
  function b(y) {
    const w = Array.from(y.clipboardData?.files || []);
    w.length !== 0 && (y.preventDefault(), De(t, r, w, o).then(f));
  }
  c.addEventListener("paste", b);
  function m(y) {
    y.key === "Escape" && Ce();
  }
  function _(y) {
    !c.contains(y.target) && !t.contains(y.target) && Ce();
  }
  document.addEventListener("keydown", m), setTimeout(() => document.addEventListener("mousedown", _), 0), c.append(d, p, g), document.body.appendChild(c), W(c, t), g.focus(), Me = { pop: c, onKey: m, onDocClick: _, anchor: t };
}
function Ce() {
  if (!Me) return;
  const { pop: t, onKey: r, onDocClick: e, anchor: n } = Me;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), t.remove(), n && delete n._sgAttachRepaint, Me = null;
}
function po(t, r, e, n, s) {
  const i = u("div", { class: "sg-attach-editor-tile", "data-attachment-id": t.id }), o = u("div", {
    class: "sg-attach-editor-preview",
    style: `width: ${s * 2}px; height: ${s * 2}px;`
  });
  if (ne(t) && t.thumb_url)
    o.append(u("img", {
      src: t.thumb_url,
      alt: t.filename,
      width: String(s * 2),
      height: String(s * 2)
    }));
  else {
    const c = $n(t), d = u("span", { class: `sg-attach-icon is-${c}`, "aria-hidden": "true" });
    d.innerHTML = Ke[c] || Ke.file, o.append(d);
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
      document.createTextNode(t.byte_size != null ? _e(t.byte_size) : "")
    )
  ]), l = u("button", {
    type: "button",
    class: "sg-attach-editor-remove",
    title: "Remove",
    "aria-label": `Remove ${t.filename}`,
    "data-sg-attach": "remove",
    "data-attachment-id": t.id
  });
  return l.innerHTML = ft, l.addEventListener("click", async (c) => {
    c.stopPropagation(), await fo(r, e, t, n);
  }), i.append(o, a, l), i;
}
function W(t, r) {
  const e = r.getBoundingClientRect();
  t.style.position = "fixed", t.style.left = `${Math.max(8, Math.min(window.innerWidth - 360, e.left))}px`, window.innerHeight - e.bottom > 280 ? t.style.top = `${e.bottom + 4}px` : t.style.top = `${Math.max(8, e.top - t.offsetHeight - 4)}px`;
}
async function De(t, r, e, n) {
  if (e.length) {
    t.classList.add("is-uploading");
    try {
      let s;
      if (typeof n == "function") {
        const i = await n(e, r);
        s = Array.isArray(i) ? i : (t._sgAttachments || []).concat(At(e));
      } else
        s = (t._sgAttachments || []).concat(At(e));
      Tn(t, r, Ze(s));
    } finally {
      t.classList.remove("is-uploading");
    }
  }
}
async function fo(t, r, e, n) {
  let s;
  if (typeof n == "function") {
    const i = await n(e, r);
    s = Array.isArray(i) ? i : (t._sgAttachments || []).filter((o) => o.id !== e.id);
  } else
    s = (t._sgAttachments || []).filter((i) => i.id !== e.id);
  Tn(t, r, Ze(s));
}
function At(t) {
  return t.map((r, e) => ({
    id: `local_${Date.now()}_${e}`,
    filename: r.name,
    url: URL.createObjectURL(r),
    content_type: r.type || "",
    byte_size: r.size,
    preview_url: r.type?.startsWith("image/") ? URL.createObjectURL(r) : null,
    thumb_url: r.type?.startsWith("image/") ? URL.createObjectURL(r) : null
  }));
}
function Tn(t, r, e) {
  const { row: n, col: s, api: i } = r;
  n && s?.field != null && (n[s.field] = e), t._sgAttachments = e, i?.applyTransaction ? i.applyTransaction({ update: [n] }) : i?.refreshCells && i.refreshCells({ rowIds: [n?.id ?? n?._sg_id] }), t._sgAttachRepaint && t._sgAttachRepaint();
}
const go = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"], Nn = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory"
};
function ho(t) {
  if (t == null || t === "") return null;
  if (typeof t == "string") return { _raw: t };
  if (typeof t != "object") return null;
  const r = t.state ? String(t.state).trim().toUpperCase() : "";
  return {
    address1: t.address1 ? String(t.address1) : "",
    address2: t.address2 ? String(t.address2) : "",
    address3: t.address3 ? String(t.address3) : "",
    suburb: t.suburb ? String(t.suburb) : "",
    state: r,
    postcode: t.postcode != null ? String(t.postcode) : "",
    country: t.country ? String(t.country) : ""
  };
}
function mo(t) {
  if (!t || t._raw) return t?._raw || "";
  const r = [t.address1, t.address2, t.address3].filter(Boolean), e = [t.suburb, t.state, t.postcode].filter(Boolean).join(" ");
  return e && r.push(e), t.country && t.country.toLowerCase() !== "australia" && r.push(t.country), r.join(`
`);
}
function Mn({ editable: t = !0, empty: r = "" } = {}) {
  return (e) => {
    const { value: n, td: s } = e, i = ho(n);
    if (s && (s.classList.add("sg-renderer-address-au-cell"), s._sgAddress = i), !i) return r ? document.createTextNode(r) : "";
    t && s && !s._sgAddressEditBound && (s._sgAddressEditBound = !0, s.addEventListener("dblclick", (c) => {
      c._sgAddressHandled || (c._sgAddressHandled = !0, c.stopPropagation(), bo(s, e));
    }));
    const o = u("div", {
      class: "sg-renderer-address-au",
      title: mo(i)
    });
    if (i._raw)
      return o.append(document.createTextNode(i._raw)), o;
    const a = [i.address1, i.address2].filter(Boolean).join(", "), l = i.suburb || i.state || i.postcode;
    return a && o.append(u("span", { class: "sg-address-au-street" }, document.createTextNode(a))), a && l && o.append(u("span", { class: "sg-address-au-sep" }, document.createTextNode(", "))), i.suburb && o.append(document.createTextNode(i.suburb)), i.state && (i.suburb && o.append(document.createTextNode(" ")), o.append(u("span", {
      class: `sg-address-au-state is-${i.state.toLowerCase()}`,
      title: Nn[i.state] || i.state
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
let Re = null;
function bo(t, r) {
  ue();
  const e = t._sgAddress && !t._sgAddress._raw ? { ...t._sgAddress } : { address1: "", address2: "", address3: "", suburb: "", state: "", postcode: "", country: "Australia" };
  e.country || (e.country = "Australia");
  const n = u("div", { class: "sg-address-au-editor", role: "dialog", "aria-modal": "false" });
  n.addEventListener("mousedown", (E) => E.stopPropagation());
  const s = u("div", { class: "sg-address-au-editor-header" });
  s.append(
    u("span", { class: "sg-address-au-editor-title" }, document.createTextNode("Edit address"))
  );
  const i = u("form", { class: "sg-address-au-editor-form", novalidate: "novalidate" });
  function o({ label: E, name: D, type: P = "text", value: F = "", maxlength: B, inputmode: H, placeholder: Y, autocomplete: J }) {
    const q = u("label", { class: "sg-address-au-editor-field", "data-field": D });
    q.append(u("span", { class: "sg-address-au-editor-label" }, document.createTextNode(E)));
    const Q = u("input", {
      type: P,
      name: D,
      value: F || "",
      maxlength: B || null,
      inputmode: H || null,
      placeholder: Y || null,
      autocomplete: J || null,
      class: "sg-address-au-editor-input"
    });
    return q.append(Q), { wrap: q, input: Q };
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
    const E = !!(l.input.value.trim() || d.input.value.trim());
    c.hidden = !E, p.hidden = E;
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
  for (const E of go) {
    const D = u(
      "option",
      { value: E, selected: e.state === E ? "" : null },
      document.createTextNode(`${E} — ${Nn[E]}`)
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
  const w = u("div", { class: "sg-address-au-editor-footer" }), C = u(
    "button",
    { type: "button", class: "sg-address-au-editor-cancel" },
    document.createTextNode("Cancel")
  ), k = u(
    "button",
    { type: "submit", class: "sg-address-au-editor-save" },
    document.createTextNode("Save")
  );
  w.append(C, k), i.append(y, w), n.append(s, i);
  function T() {
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
  function M() {
    const E = T(), D = !E.address1 && !E.suburb && !E.state && !E.postcode;
    yo(t, r, D ? null : E), ue();
  }
  i.addEventListener("submit", (E) => {
    E.preventDefault(), M();
  }), C.addEventListener("click", () => ue());
  function $(E) {
    E.key === "Escape" && (E.stopPropagation(), ue());
  }
  function L(E) {
    !n.contains(E.target) && !t.contains(E.target) && ue();
  }
  document.addEventListener("keydown", $), setTimeout(() => document.addEventListener("mousedown", L), 0), document.body.appendChild(n), W(n, t), f(), a.input.focus(), a.input.select(), Re = { pop: n, onKey: $, onDocClick: L };
}
function ue() {
  if (!Re) return;
  const { pop: t, onKey: r, onDocClick: e } = Re;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), t.remove(), Re = null;
}
function yo(t, r, e) {
  const { row: n, col: s, api: i } = r, o = n && s?.field != null ? n[s.field] : null;
  n && s?.field != null && (n[s.field] = e), t._sgAddress = e, i?.applyTransaction ? i.applyTransaction({ update: [n] }) : i?.refreshCells && i.refreshCells({ rowIds: [n?.id ?? n?._sg_id] });
  const a = t.closest('[data-controller~="grid"]');
  a && a.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
    bubbles: !0,
    detail: { rowId: n?.id ?? n?._sg_id, colId: s?.field, oldValue: o, newValue: e }
  }));
}
function Dn({ color: t = "green", showValue: r = !1 } = {}) {
  return ({ value: e }) => {
    let n = Number(e);
    Number.isFinite(n) || (n = 0), n = Math.max(0, Math.min(100, n));
    const s = u("div", { class: "sg-renderer-progress" }, [
      u("div", { class: `sg-renderer-progress-fill sg-fill-${t}`, style: `width: ${n}%;` })
    ]);
    return r ? u("div", { class: "sg-renderer-progress-wrap" }, [
      s,
      u("span", { class: "sg-renderer-progress-label" }, document.createTextNode(`${Math.round(n)}%`))
    ]) : s;
  };
}
const he = '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>';
function Rn({ max: t = 5, precision: r = 0.5 } = {}) {
  const e = r > 0 ? 1 / r : 2;
  return ({ value: n }) => {
    let s = parseFloat(n);
    Number.isFinite(s) || (s = 0), s = Math.max(0, Math.min(t, s)), s = Math.round(s * e) / e;
    const i = u("div", {
      class: "sg-renderer-stars",
      role: "img",
      "aria-label": `${s} out of ${t} stars`
    });
    for (let o = 1; o <= t; o++)
      if (s >= o)
        i.append(u("span", { class: "sg-renderer-star is-full", "aria-hidden": "true" }, he));
      else if (s > o - 1) {
        const a = Math.round((s - (o - 1)) * 100);
        i.append(u(
          "span",
          { class: "sg-renderer-star is-partial", "aria-hidden": "true" },
          `${he}<span class="sg-star-clip" style="width: ${a}%;">${he}</span>`
        ));
      } else
        i.append(u("span", { class: "sg-renderer-star is-empty", "aria-hidden": "true" }, he));
    return i;
  };
}
function In({ separator: t = "," } = {}) {
  return ({ value: r }) => {
    if (S(r)) return "";
    const e = Array.isArray(r) ? r : String(r).split(t), n = u("div", { class: "sg-renderer-tags" });
    for (const s of e) {
      const i = String(s).trim();
      i && n.append(u("span", { class: "sg-renderer-tag" }, document.createTextNode(i)));
    }
    return n;
  };
}
function Pn({ showCode: t = !0, fallback: r = null } = {}) {
  return ({ value: e }) => {
    if (S(e)) return "";
    const n = String(e).trim().toUpperCase();
    if (n.length !== 2 || !/^[A-Z]{2}$/.test(n))
      return r ?? document.createTextNode(String(e));
    const s = String.fromCodePoint(
      127462 + n.charCodeAt(0) - 65,
      127462 + n.charCodeAt(1) - 65
    ), i = u("span", { class: "sg-renderer-country" });
    return i.append(u("span", { class: "sg-renderer-flag", "aria-hidden": "true" }, document.createTextNode(s))), t && i.append(u("span", { class: "sg-renderer-country-code" }, document.createTextNode(n))), i;
  };
}
function wo(t) {
  const r = String(t).replace(/\s+/g, "");
  if (r.length !== 11 || !/^\d{11}$/.test(r)) return !1;
  const e = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19], n = parseInt(r[0], 10) - 1 + r.slice(1);
  let s = 0;
  for (let i = 0; i < 11; i++) s += parseInt(n[i], 10) * e[i];
  return s % 89 === 0;
}
function _o(t) {
  const r = String(t).replace(/\D/g, "");
  return r.length !== 11 ? String(t) : `${r.slice(0, 2)} ${r.slice(2, 5)} ${r.slice(5, 8)} ${r.slice(8)}`;
}
function Vn() {
  return ({ value: t }) => {
    if (S(t)) return "";
    if (!wo(t))
      return u("span", { class: "sg-renderer-invalid", title: "Invalid ABN" }, document.createTextNode(String(t)));
    const r = String(t).replace(/\s+/g, "");
    return u("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/ABN/View?id=${r}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(_o(t)));
  };
}
function Fn({
  lookup: t = null,
  nameField: r = null,
  avatarField: e = null,
  windowKey: n = "__sgUsers",
  size: s = 22
} = {}) {
  return ({ value: i, row: o }) => {
    if (S(i)) return "";
    let a = null;
    if (typeof t == "function" && (a = t(i, o) || null), !a && r && (a = { name: o?.[r], avatarUrl: e ? o?.[e] : null }), !a && typeof window < "u" && window[n]) {
      const d = window[n];
      d instanceof Map ? a = d.get(i) || d.get(String(i)) || null : Array.isArray(d) && (a = d.find((p) => `${p.id}` == `${i}`) || null);
    }
    const l = a?.name ?? String(i), c = u("span", { class: "sg-renderer-avatar" });
    if (a?.avatarUrl)
      c.append(u("img", {
        class: "sg-renderer-avatar-img",
        src: a.avatarUrl,
        width: String(s),
        height: String(s),
        alt: ""
      }));
    else {
      const d = String(l).split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("");
      c.append(u("span", {
        class: "sg-renderer-avatar-initials",
        style: `width: ${s}px; height: ${s}px;`
      }, document.createTextNode(d)));
    }
    return c.append(u("span", { class: "sg-renderer-avatar-name" }, document.createTextNode(l))), c;
  };
}
const vo = {
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
function Co(t) {
  return String(t).toLowerCase().split(/[\s_-]+/).map((r) => r && r[0].toUpperCase() + r.slice(1)).join(" ");
}
function xo(t = {}, r = null, e = {}) {
  const { titleCase: n = !0, defaultColor: s = "gray" } = e, i = {};
  for (const [a, l] of Object.entries(t)) i[String(a).toLowerCase()] = l;
  const o = {};
  if (r) for (const [a, l] of Object.entries(r)) o[String(a).toLowerCase()] = l;
  return ({ value: a }) => {
    if (S(a)) return "";
    const l = String(a).toLowerCase(), c = i[l] || s, d = n ? Co(a) : String(a), p = u("span", { class: `sg-pill sg-pill-${c}` });
    if (r) {
      const f = o[l], g = f ? vo[f] || f : null;
      if (g) {
        const h = u("span", { class: "sg-pill-icon", "aria-hidden": "true" });
        h.innerHTML = g, p.append(h);
      }
    }
    return p.append(u("span", { class: "sg-pill-label" }, document.createTextNode(d))), p;
  };
}
function Bn({
  truthy: t = ut,
  disabled: r = !1
} = {}) {
  return (e) => {
    const { value: n, row: s, col: i, api: o, td: a } = e;
    a && a.classList.add("sg-renderer-checkbox-cell");
    const l = u("span", { class: "sg-renderer-checkbox" }), c = u("input", {
      type: "checkbox",
      class: "sg-renderer-checkbox-input",
      disabled: r ? "" : null,
      "aria-label": i?.field || "toggle"
    });
    return n == null || n === "" ? c.indeterminate = !0 : c.checked = t(n), c.addEventListener("click", (d) => d.stopPropagation()), c.addEventListener("change", (d) => {
      if (r) {
        d.preventDefault();
        return;
      }
      const p = c.checked, f = s && i?.field != null ? s[i.field] : null;
      s && i?.field != null && (s[i.field] = p), o?.applyTransaction && o.applyTransaction({ update: [s] });
      const g = a?.closest('[data-controller~="grid"]');
      g && g.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: s?.id ?? s?._sg_id, colId: i?.field, oldValue: f, newValue: p }
      }));
    }), l.append(c), l;
  };
}
const So = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z"/></svg>', tt = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>', Lo = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>', ko = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/></svg>', $o = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/></svg>', Eo = ft;
function Hn(t) {
  if (t == null || t === "") return null;
  if (typeof t == "string") {
    const e = t.trim();
    if (!e) return null;
    const n = e.split("/").pop()?.match(/^[^?#]+/)?.[0] || "";
    return { url: e, filename: n || "audio", byte_size: null, duration: null };
  }
  if (typeof t != "object") return null;
  const r = t.url || t.src || t.href;
  return r ? {
    url: String(r),
    filename: t.filename || t.name || String(r).split("/").pop()?.split("?")[0] || "audio",
    byte_size: t.byte_size ?? t.byteSize ?? t.size ?? null,
    duration: Number.isFinite(t.duration) ? Number(t.duration) : null,
    content_type: t.content_type || t.contentType || t.mime_type || ""
  } : null;
}
function me(t) {
  (!Number.isFinite(t) || t < 0) && (t = 0);
  const r = Math.floor(t), e = Math.floor(r / 3600), n = Math.floor(r % 3600 / 60), s = r % 60, i = (o) => String(o).padStart(2, "0");
  return e > 0 ? `${e}:${i(n)}:${i(s)}` : `${n}:${i(s)}`;
}
function On({
  showFilename: t = !0,
  iconOnly: r = !1,
  empty: e = "",
  preferHowler: n = !0,
  skipSeconds: s = 10
} = {}) {
  return (i) => {
    const { value: o, td: a } = i, l = Hn(o);
    if (a && (a.classList.add("sg-renderer-audio-cell"), a._sgAudio = l, a._sgAudioOpts = { preferHowler: n, skipSeconds: s }), !l) return e ? document.createTextNode(e) : "";
    a && !a._sgAudioDblBound && (a._sgAudioDblBound = !0, a.addEventListener("dblclick", (p) => {
      p._sgAudioHandled || (p._sgAudioHandled = !0, p.stopPropagation(), p.preventDefault(), Tt(a, i));
    }));
    const c = u("div", { class: "sg-renderer-audio" }), d = u("button", {
      type: "button",
      class: "sg-audio-icon",
      title: `${l.filename}${l.byte_size != null ? " · " + _e(l.byte_size) : ""} — double-click to play`,
      "aria-label": `Play ${l.filename}`,
      "data-sg-audio": "open"
    });
    if (d.innerHTML = So, d.addEventListener("click", (p) => {
      p.stopPropagation(), Tt(a, i);
    }), d.addEventListener("dblclick", (p) => {
      p._sgAudioHandled = !0, p.stopPropagation();
    }), c.append(d), t && !r) {
      const p = u(
        "span",
        { class: "sg-audio-name" },
        document.createTextNode(l.filename)
      );
      c.append(p), l.duration != null && c.append(u(
        "span",
        { class: "sg-audio-duration" },
        document.createTextNode(me(l.duration))
      ));
    }
    return c;
  };
}
function Ao(t, { preferHowler: r } = {}) {
  return r && typeof window < "u" && window.Howl ? new No(t) : new To(t);
}
class To {
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
    const n = this._evMap[r] || r;
    this.audio.addEventListener(n, e), this._handlers.set(e, [n, e]);
  }
  off(r, e) {
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
class No {
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
let Ie = null;
function Tt(t, r) {
  xe();
  const e = t._sgAudio || Hn(r.value);
  if (!e) return;
  const n = t._sgAudioOpts || { preferHowler: !0, skipSeconds: 10 }, s = Ao(e.url, n), i = u("div", { class: "sg-audio-player", role: "dialog", "aria-label": "Audio player" });
  i.addEventListener("mousedown", (R) => R.stopPropagation());
  const o = u("div", { class: "sg-audio-player-header" }), a = u(
    "div",
    { class: "sg-audio-player-name", title: e.filename },
    document.createTextNode(e.filename)
  ), l = u("div", { class: "sg-audio-player-meta" }), c = [];
  e.byte_size != null && c.push(_e(e.byte_size)), s.backendName() === "howler" && c.push("howler.js"), l.textContent = c.join(" · ");
  const d = u("button", {
    type: "button",
    class: "sg-audio-player-close",
    "aria-label": "Close player"
  });
  d.innerHTML = Eo, d.addEventListener("click", xe), o.append(a, l, d);
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
    document.createTextNode(e.duration ? me(e.duration) : "--:--")
  );
  h.append(b, m);
  const _ = u("div", { class: "sg-audio-transport" }), y = u("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Back ${n.skipSeconds}s`,
    "aria-label": `Back ${n.skipSeconds} seconds`
  });
  y.innerHTML = ko;
  const w = u("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-play",
    title: "Play / pause (Space)",
    "aria-label": "Play",
    "data-state": "paused"
  });
  w.innerHTML = tt;
  const C = u("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Forward ${n.skipSeconds}s`,
    "aria-label": `Forward ${n.skipSeconds} seconds`
  });
  C.innerHTML = $o, _.append(y, w, C), i.append(o, p, h, _);
  let k = e.duration ?? 0, T = !1, M = null;
  function $(R) {
    const G = Math.max(0, Math.min(100, R));
    f.style.width = G + "%", g.style.left = G + "%";
  }
  function L() {
    const R = s.seek(), X = s.duration() || 0 || k || 0;
    if (X > 0 && X !== k && (k = X, m.textContent = me(k), p.setAttribute("aria-valuemax", String(Math.floor(k)))), !T) {
      const Z = k > 0 ? R / k * 100 : 0;
      $(Z), b.textContent = me(R), p.setAttribute("aria-valuenow", String(Math.floor(R)));
    }
  }
  function E() {
    L(), s.isPlaying() ? M = requestAnimationFrame(E) : M = null;
  }
  function D() {
    M == null && (M = requestAnimationFrame(E));
  }
  function P() {
    M != null && cancelAnimationFrame(M), M = null;
  }
  const F = () => {
    k = s.duration(), L();
  }, B = () => {
    w.dataset.state = "playing", w.innerHTML = Lo, w.setAttribute("aria-label", "Pause"), D();
  }, H = () => {
    w.dataset.state = "paused", w.innerHTML = tt, w.setAttribute("aria-label", "Play"), P(), L();
  }, Y = () => {
    w.dataset.state = "paused", w.innerHTML = tt, w.setAttribute("aria-label", "Play"), P(), s.seek(0), L();
  };
  s.on("load", F), s.on("play", B), s.on("pause", H), s.on("end", Y), w.addEventListener("click", (R) => {
    R.stopPropagation(), s.isPlaying() ? s.pause() : s.play();
  }), y.addEventListener("click", (R) => {
    R.stopPropagation(), s.seek(Math.max(0, s.seek() - n.skipSeconds)), L();
  }), C.addEventListener("click", (R) => {
    R.stopPropagation();
    const G = s.duration();
    s.seek(Math.min(G || 1 / 0, s.seek() + n.skipSeconds)), L();
  });
  function J(R) {
    const G = p.getBoundingClientRect(), X = (R.clientX ?? 0) - G.left, Z = Math.max(0, Math.min(1, X / G.width)), wt = s.duration() || k;
    if (!wt) return;
    const _t = Z * wt;
    s.seek(_t), $(Z * 100), b.textContent = me(_t);
  }
  p.addEventListener("pointerdown", (R) => {
    R.preventDefault(), T = !0, p.setPointerCapture?.(R.pointerId), p.classList.add("is-dragging"), J(R);
  }), p.addEventListener("pointermove", (R) => {
    T && J(R);
  });
  const q = (R) => {
    if (T) {
      T = !1, p.classList.remove("is-dragging");
      try {
        p.releasePointerCapture?.(R.pointerId);
      } catch {
      }
    }
  };
  p.addEventListener("pointerup", q), p.addEventListener("pointercancel", q), p.addEventListener("keydown", (R) => {
    const G = s.duration() || k;
    if (!G) return;
    const X = R.shiftKey ? 30 : 5;
    let Z = null;
    R.key === "ArrowLeft" ? Z = Math.max(0, s.seek() - X) : R.key === "ArrowRight" ? Z = Math.min(G, s.seek() + X) : R.key === "Home" ? Z = 0 : R.key === "End" && (Z = G), Z != null && (R.preventDefault(), s.seek(Z), L());
  });
  function Q(R) {
    R.key === "Escape" ? (R.preventDefault(), xe()) : (R.key === " " || R.code === "Space") && i.contains(document.activeElement) && (R.preventDefault(), s.isPlaying() ? s.pause() : s.play());
  }
  function O(R) {
    !i.contains(R.target) && !t.contains(R.target) && xe();
  }
  document.addEventListener("keydown", Q), setTimeout(() => document.addEventListener("mousedown", O), 0), document.body.appendChild(i), W(i, t), L(), w.focus(), Ie = {
    pop: i,
    backend: s,
    onKey: Q,
    onDocClick: O,
    cleanup: () => {
      P();
      try {
        s.off("load", F), s.off("play", B), s.off("pause", H), s.off("end", Y);
      } catch {
      }
      s.destroy();
    }
  };
}
function xe() {
  if (!Ie) return;
  const { pop: t, onKey: r, onDocClick: e, cleanup: n } = Ie;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), n(), t.remove(), Ie = null;
}
function Gn({
  truthy: t = ut,
  disabled: r = !1
} = {}) {
  return (e) => {
    const { value: n, row: s, col: i, api: o, td: a } = e;
    a && a.classList.add("sg-renderer-switch-cell");
    const l = n == null || n === "", c = !l && t(n), d = u("button", {
      type: "button",
      class: `sg-renderer-switch${c ? " is-on" : ""}${l ? " is-null" : ""}`,
      role: "switch",
      "aria-checked": l ? "mixed" : c ? "true" : "false",
      "aria-label": i?.field || "toggle",
      disabled: r ? "" : null
    });
    return d.append(u("span", { class: "sg-renderer-switch-thumb", "aria-hidden": "true" })), d.addEventListener("click", (p) => {
      if (p.stopPropagation(), r) return;
      const f = l ? !0 : !c, g = s && i?.field != null ? s[i.field] : null;
      s && i?.field != null && (s[i.field] = f), o?.applyTransaction && o.applyTransaction({ update: [s] });
      const h = a?.closest('[data-controller~="grid"]');
      h && h.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: s?.id ?? s?._sg_id, colId: i?.field, oldValue: g, newValue: f }
      }));
    }), d;
  };
}
const Mo = /^(https?:\/\/|mailto:)/i;
function we(t) {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function lt(t) {
  let r = t;
  return r = r.replace(/`([^`\n]+)`/g, (e, n) => `<code>${n}</code>`), r = r.replace(/\[([^\]\n]+)\]\(([^)\n]+)\)/g, (e, n, s) => Mo.test(s) ? `<a href="${s}" target="_blank" rel="noopener noreferrer">${n}</a>` : e), r = r.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>"), r = r.replace(/__([^_\n]+)__/g, "<strong>$1</strong>"), r = r.replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), r = r.replace(/(^|[\s(])_([^_\n]+?)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), r = r.replace(/~~([^~\n]+)~~/g, "<del>$1</del>"), r;
}
function Do(t) {
  const r = t.split(`
`), e = [];
  let n = null, s = [];
  const i = () => {
    n && (e.push(`<${n}>${s.map((o) => `<li>${lt(o)}</li>`).join("")}</${n}>`), n = null, s = []);
  };
  for (const o of r) {
    const a = /^\s*[-*]\s+(.+)$/.exec(o), l = /^\s*\d+\.\s+(.+)$/.exec(o);
    a ? (n && n !== "ul" && i(), n = "ul", s.push(a[1])) : l ? (n && n !== "ol" && i(), n = "ol", s.push(l[1])) : (i(), o.trim() === "" ? e.push("") : e.push(lt(o)));
  }
  return i(), e.join("<br>").replace(/(<br>){2,}/g, "<br><br>");
}
function zn({ inline: t = !1 } = {}) {
  return ({ value: r, td: e }) => {
    if (S(r)) return "";
    const n = we(r), s = t ? lt(n) : Do(n);
    if (e) {
      e.classList.add("sg-renderer-markdown-cell");
      const o = e.parentElement;
      o && o.tagName === "TR" && o.classList.add("sg-has-multiline");
    }
    const i = u("div", { class: `sg-renderer-markdown${t ? " is-inline" : ""}` });
    return i.innerHTML = s, i;
  };
}
function Ro(t) {
  return we(t).replace(/(&quot;(?:[^&\\]|\\.)*?&quot;)\s*:/g, '<span class="sg-json-key">$1</span>:').replace(/:\s*(&quot;(?:[^&\\]|\\.)*?&quot;)/g, ': <span class="sg-json-string">$1</span>').replace(/(?<=[\s:,\[])(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)(?=[\s,\]\}\n])/g, '<span class="sg-json-number">$1</span>').replace(/(?<=[\s:,\[])(true|false)(?=[\s,\]\}\n])/g, '<span class="sg-json-bool">$1</span>').replace(/(?<=[\s:,\[])(null)(?=[\s,\]\}\n])/g, '<span class="sg-json-null">$1</span>');
}
function Io(t, r) {
  const e = Array.isArray(t), n = e ? t : Object.entries(t), s = n.slice(0, r), i = n.length - s.length, o = (c) => {
    if (c == null) return "null";
    const d = typeof c;
    return d === "string" ? c.length > 18 ? `"${c.slice(0, 15)}…"` : `"${c}"` : d === "number" || d === "boolean" ? String(c) : Array.isArray(c) ? `[${c.length}]` : d === "object" ? "{…}" : String(c);
  }, a = e ? s.map(o).join(", ") : s.map(([c, d]) => `${c}: ${o(d)}`).join(", "), l = i > 0 ? `, +${i}` : "";
  return e ? `[${a}${l}]` : `{ ${a}${l} }`;
}
function jn({ maxKeys: t = 3, indent: r = 2 } = {}) {
  return ({ value: e, td: n }) => {
    if (e == null || e === "") return "";
    let s = e;
    if (typeof e == "string")
      try {
        s = JSON.parse(e);
      } catch {
        return String(e);
      }
    if (s == null)
      return u("span", { class: "sg-renderer-json-scalar sg-json-null" }, document.createTextNode("null"));
    if (typeof s != "object") {
      const c = typeof s, d = c === "string" ? "sg-json-string" : c === "number" ? "sg-json-number" : "sg-json-bool", p = c === "string" ? `"${s}"` : String(s);
      return u("span", { class: `sg-renderer-json-scalar ${d}` }, document.createTextNode(p));
    }
    const i = document.createElement("details");
    i.className = "sg-renderer-json";
    const o = document.createElement("summary");
    o.className = "sg-renderer-json-summary";
    const a = u("span", { class: "sg-renderer-json-chevron", "aria-hidden": "true" });
    a.innerHTML = Yt, o.append(a), o.append(u(
      "span",
      { class: "sg-renderer-json-summary-text" },
      document.createTextNode(Io(s, t))
    ));
    const l = document.createElement("pre");
    if (l.className = "sg-renderer-json-pre", l.innerHTML = Ro(JSON.stringify(s, null, r)), i.append(o, l), o.addEventListener("click", (c) => c.stopPropagation()), n) {
      n.classList.add("sg-renderer-json-cell");
      const c = n.parentElement;
      c && c.tagName === "TR" && c.classList.add("sg-has-multiline");
    }
    return i;
  };
}
function Un({
  lookup: t = null,
  windowKey: r = "__sgLinks",
  showThumb: e = !0,
  href: n = null,
  multiple: s = !1,
  fallback: i = (o) => String(o)
} = {}) {
  return ({ value: o, row: a }) => {
    if (S(o)) return "";
    const l = s ? Array.isArray(o) ? o : String(o).split(",").map((d) => d.trim()).filter(Boolean) : [o], c = u("span", { class: "sg-renderer-linked-records" });
    for (const d of l) {
      const p = Po(d, a, t, r);
      c.append(Vo(d, a, p, { showThumb: e, href: n, fallback: i }));
    }
    return c;
  };
}
function Po(t, r, e, n) {
  if (typeof e == "function") return e(t, r) || null;
  if (typeof window > "u") return null;
  const s = window[n];
  return s ? s instanceof Map ? s.get(t) || s.get(String(t)) || null : typeof s == "object" ? s[t] ?? s[String(t)] ?? null : null : null;
}
function Vo(t, r, e, { showThumb: n, href: s, fallback: i }) {
  const o = e?.name ?? i(t), a = typeof s == "function" ? s(t, r, e) : e?.href || null, l = document.createElement(a ? "a" : "span");
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
function Kn({
  separator: t = ",",
  colorMap: r = {},
  defaultColor: e = "gray"
} = {}) {
  const n = {};
  for (const [s, i] of Object.entries(r)) n[String(s).toLowerCase()] = i;
  return ({ value: s }) => {
    if (S(s)) return "";
    const i = Array.isArray(s) ? s : String(s).split(t), o = u("div", { class: "sg-renderer-coloured-tags" });
    for (const a of i) {
      const l = String(a).trim();
      if (!l) continue;
      const c = n[l.toLowerCase()] || e, d = u(
        "span",
        { class: "sg-renderer-coloured-tag" },
        document.createTextNode(l)
      );
      /^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/.test(c) ? d.classList.add(`sg-pill-${c}`) : (d.style.background = c, d.style.color = qn(c)), o.append(d);
    }
    return o;
  };
}
function qn(t) {
  const r = _n(t);
  return r ? vn(r) ? "#1f2937" : "#ffffff" : "inherit";
}
function gt(t) {
  if (t == null || t === "") return null;
  if (t instanceof Date)
    return Number.isNaN(t.valueOf()) ? null : { h: t.getHours(), m: t.getMinutes(), s: t.getSeconds() };
  if (typeof t == "number" && Number.isFinite(t)) {
    const s = (t % 86400 + 86400) % 86400;
    return { h: Math.floor(s / 3600), m: Math.floor(s % 3600 / 60), s: Math.floor(s % 60) };
  }
  const r = String(t).trim(), e = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/.exec(r);
  if (e)
    return { h: parseInt(e[1], 10), m: parseInt(e[2], 10), s: e[3] ? parseInt(e[3], 10) : 0 };
  const n = new Date(r);
  return Number.isNaN(n.valueOf()) ? null : { h: n.getHours(), m: n.getMinutes(), s: n.getSeconds() };
}
function Wn({
  style: t = "24h",
  // '24h' | '12h'
  seconds: r = !1,
  locale: e = void 0
} = {}) {
  return ({ value: n }) => {
    const s = gt(n);
    if (!s) return "";
    if (t === "12h") {
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
function Fo(t) {
  if (Array.isArray(t)) return { from: t[0], to: t[1] };
  if (t && typeof t == "object")
    return {
      from: t.from ?? t.old ?? t.before ?? t.previous ?? null,
      to: t.to ?? t.new ?? t.after ?? t.current ?? null
    };
  const r = String(t), e = /^(.*?)\s*(?:→|->|=>|—>)\s*(.+)$/.exec(r);
  return e ? { from: e[1].trim(), to: e[2].trim() } : { from: null, to: r };
}
function Yn({
  style: t = "inline",
  // 'inline' | 'stacked'
  arrow: r = "→",
  showArrow: e = !0
} = {}) {
  return ({ value: n }) => {
    if (S(n)) return "";
    const { from: s, to: i } = Fo(n), o = (l) => l == null || l === "";
    if (o(s) && o(i)) return "";
    if (o(s))
      return u(
        "span",
        { class: "sg-renderer-diff is-added" },
        u("span", { class: "sg-diff-to" }, document.createTextNode(String(i)))
      );
    if (o(i))
      return u(
        "span",
        { class: "sg-renderer-diff is-removed" },
        u("span", { class: "sg-diff-from" }, document.createTextNode(String(s)))
      );
    const a = u("span", { class: `sg-renderer-diff is-${t}` });
    return a.append(u("span", { class: "sg-diff-from" }, document.createTextNode(String(s)))), e && a.append(u(
      "span",
      { class: "sg-diff-arrow", "aria-hidden": "true" },
      document.createTextNode(r)
    )), a.append(u("span", { class: "sg-diff-to" }, document.createTextNode(String(i)))), a;
  };
}
function Bo(t) {
  if (t == null || t === "") return null;
  if (Array.isArray(t)) {
    const s = Number(t[0]), i = Number(t[1]);
    return Number.isFinite(s) && Number.isFinite(i) ? { lat: s, lng: i } : null;
  }
  if (typeof t == "object") {
    const s = Number(t.lat ?? t.latitude), i = Number(t.lng ?? t.long ?? t.lon ?? t.longitude);
    return Number.isFinite(s) && Number.isFinite(i) ? { lat: s, lng: i } : null;
  }
  const r = String(t).split(",");
  if (r.length !== 2) return null;
  const e = Number(r[0].trim()), n = Number(r[1].trim());
  return Number.isFinite(e) && Number.isFinite(n) ? { lat: e, lng: n } : null;
}
function Nt(t, r) {
  const e = t >= 0 ? 1 : -1, n = Math.abs(t), s = Math.floor(n), i = (n - s) * 60, o = Math.floor(i), a = (i - o) * 60, l = r ? e > 0 ? "N" : "S" : e > 0 ? "E" : "W";
  return `${s}°${String(o).padStart(2, "0")}'${a.toFixed(1)}"${l}`;
}
function Zn({
  decimals: t = 4,
  style: r = "decimal",
  // 'decimal' | 'dms'
  mapUrl: e = (o, a) => `https://www.google.com/maps?q=${o},${a}`,
  linkText: n = "View on Maps",
  staticMap: s = null,
  // (lat, lng) => url
  staticSize: i = 72
} = {}) {
  return ({ value: o }) => {
    const a = Bo(o);
    if (!a) return "";
    const l = u("span", { class: "sg-renderer-geo" });
    if (typeof s == "function") {
      const p = s(a.lat, a.lng);
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
    const c = r === "dms" ? `${Nt(a.lat, !0)} ${Nt(a.lng, !1)}` : `${a.lat.toFixed(t)}, ${a.lng.toFixed(t)}`;
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
function Xn({
  moduleSize: t = 3,
  margin: r = 2,
  background: e = "#fff",
  foreground: n = "#111827",
  showText: s = !1
} = {}) {
  return ({ value: i }) => {
    if (S(i)) return "";
    const o = String(i);
    let a;
    try {
      const c = Ai(o);
      a = Vi(c, { moduleSize: t, margin: r, background: e, foreground: n });
    } catch {
      return u(
        "span",
        { class: "sg-renderer-qr-overflow", title: o },
        document.createTextNode("QR · too long")
      );
    }
    const l = u("span", { class: "sg-renderer-qr" });
    return l.innerHTML = a, s && l.append(u("span", { class: "sg-renderer-qr-text" }, document.createTextNode(o))), l;
  };
}
function Jn({
  language: t = null,
  copy: r = !0
} = {}) {
  return ({ value: e, td: n }) => {
    if (S(e)) return "";
    const s = String(e);
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
    )), r) {
      const a = u("button", {
        type: "button",
        class: "sg-renderer-code-copy",
        title: "Copy",
        "aria-label": "Copy code"
      });
      a.innerHTML = Ue, a.addEventListener("click", async (l) => {
        l.stopPropagation();
        try {
          navigator.clipboard?.writeText ? await navigator.clipboard.writeText(s) : mn(s), a.innerHTML = gn, a.classList.add("is-copied"), setTimeout(() => {
            a.innerHTML = Ue, a.classList.remove("is-copied");
          }, 1200);
        } catch {
        }
      }), i.append(a);
    }
    const o = u("pre", { class: "sg-renderer-code-pre" });
    return o.textContent = s, i.append(o), i;
  };
}
const Ho = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M225.8 468.2L46.9 295.4C18.9 268.2 0 230.1 0 187.8C0 117.4 56.1 60 125.7 60c25.3 0 51 9.2 70.3 25.4L256 138l60-52.6C335.3 69.2 361 60 386.3 60C455.9 60 512 117.4 512 187.8c0 42.3-18.9 80.4-46.9 107.6L286.2 468.2c-7.2 7.4-17.1 11.8-27.6 11.8c-10.5 0-20.4-4.4-27.6-11.8z"/></svg>', Oo = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75.1c16.3-13.2 28.9-30.4 36.6-50l8.1-20.3c5-12.4 11.3-24.2 19-35.2l4.4-6.3 0 0c1.4-2 1.1-4.7-.6-6.4l0 0c-3.8-3.8-9.9-3.8-13.7 0L208.8 84.9c-3 3-7 4.7-11.3 4.7c-8.8 0-16-7.2-16-16V63.4c0-8.8 7.2-16 16-16h.5c8.8 0 16 7.2 16 16v6.2c34-2.4 71-13 100-25.6c11-4.8 22.1-9.3 33-13.6l1-.4c12-4.6 27.3-9.3 41.4-9.3z"/></svg>', Go = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75.1c16.3 13.2 28.9 30.4 36.6 50l8.1 20.3c5 12.4 11.3 24.2 19 35.2l4.4 6.3c1.4 2 1.1 4.7-.6 6.4c-3.8 3.8-9.9 3.8-13.7 0L208.8 427.1c-3-3-7-4.7-11.3-4.7c-8.8 0-16 7.2-16 16v10.2c0 8.8 7.2 16 16 16h.5c8.8 0 16-7.2 16-16v-6.2c34 2.4 71 13 100 25.6c11 4.8 22.1 9.3 33 13.6l1 .4c12 4.6 27.3 9.3 41.4 9.3z"/></svg>', nt = ["😞", "😕", "😐", "🙂", "😄"], Mt = {
  star: he,
  heart: Ho
}, Dt = {
  star: "#f59e0b",
  heart: "#ec4899"
};
function Qn({
  icon: t = "heart",
  max: r = 5,
  precision: e = 0.5,
  color: n = null
} = {}) {
  if (t === "smiley") return zo({ max: r });
  if (t === "thumb") return jo();
  if (t === "nps") return Uo();
  const s = Mt[t] || Mt.heart, i = n || Dt[t] || Dt.heart, o = e > 0 ? 1 / e : 2;
  return ({ value: a }) => {
    let l = parseFloat(a);
    Number.isFinite(l) || (l = 0), l = Math.max(0, Math.min(r, l)), l = Math.round(l * o) / o;
    const c = u("div", {
      class: `sg-renderer-rating is-${t}`,
      style: `--rating-color: ${i};`,
      role: "img",
      "aria-label": `${l} out of ${r}`
    });
    for (let d = 1; d <= r; d++)
      if (l >= d)
        c.append(u("span", { class: "sg-renderer-rating-glyph is-full" }, s));
      else if (l > d - 1) {
        const p = Math.round((l - (d - 1)) * 100);
        c.append(u(
          "span",
          { class: "sg-renderer-rating-glyph is-partial" },
          `${s}<span class="sg-rating-clip" style="width:${p}%;">${s}</span>`
        ));
      } else
        c.append(u("span", { class: "sg-renderer-rating-glyph is-empty" }, s));
    return c;
  };
}
function zo({ max: t = 5 } = {}) {
  return ({ value: r }) => {
    let e = parseFloat(r);
    if (!Number.isFinite(e)) return "";
    e = Math.max(1, Math.min(t, Math.round(e)));
    const n = Math.min(
      nt.length - 1,
      Math.floor((e - 1) / (t - 1 || 1) * (nt.length - 1))
    );
    return u("span", {
      class: "sg-renderer-rating-smiley",
      title: `${e}/${t}`
    }, document.createTextNode(nt[n]));
  };
}
function jo() {
  return ({ value: t }) => {
    if (t == null || t === "") return "";
    const r = Number(t);
    if (!Number.isFinite(r)) return "";
    const e = u("span", { class: "sg-renderer-rating-thumb" });
    return r > 0 ? (e.classList.add("is-up"), e.title = "Thumbs up", e.innerHTML = Oo) : r < 0 ? (e.classList.add("is-down"), e.title = "Thumbs down", e.innerHTML = Go) : (e.classList.add("is-neutral"), e.title = "Neutral", e.append(document.createTextNode("—"))), e;
  };
}
function Uo() {
  return ({ value: t }) => {
    const r = parseFloat(t);
    if (!Number.isFinite(r)) return "";
    const e = Math.max(0, Math.min(10, Math.round(r))), n = e <= 6 ? "detractor" : e <= 8 ? "passive" : "promoter", s = n === "detractor" ? "Detractor" : n === "passive" ? "Passive" : "Promoter";
    return u("span", {
      class: `sg-renderer-rating-nps is-${n}`,
      title: `${e}/10 · ${s}`
    }, document.createTextNode(String(e)));
  };
}
const Ko = ["#e5e7eb", "#d1d5db", "#9ca3af"];
function er({
  min: t = 0,
  max: r = 100,
  target: e = null,
  ranges: n = null,
  // [a] | [a, b] | [a, b, c]
  rangeColors: s = Ko,
  barColor: i = "#111827",
  targetColor: o = "#111827",
  width: a = 120,
  height: l = 16
} = {}) {
  return ({ value: c }) => {
    let d, p, f;
    if (c && typeof c == "object" && !Array.isArray(c) ? (d = Number(c.value), p = c.target != null ? Number(c.target) : e, f = c.ranges || n) : (d = Number(c), p = e, f = n), !Number.isFinite(d)) return "";
    const g = r - t || 1, h = (k) => Math.max(t, Math.min(r, k)), b = (k) => (h(k) - t) / g * a, m = f && f.length ? f.map(Number) : [t + g * 0.6, t + g * 0.8], _ = [t, ...m, r];
    let y = "";
    for (let k = 0; k < _.length - 1; k++) {
      const T = b(_[k]), M = b(_[k + 1]) - T, $ = s[k] || s[s.length - 1];
      y += `<rect x="${T.toFixed(2)}" y="0" width="${M.toFixed(2)}" height="${l}" fill="${$}"/>`;
    }
    const w = l * 0.42, C = (l - w) / 2;
    if (y += `<rect x="0" y="${C.toFixed(2)}" width="${b(d).toFixed(2)}" height="${w.toFixed(2)}" fill="${i}"/>`, p != null && Number.isFinite(p)) {
      const k = b(p), T = l * 0.85, M = (l - T) / 2;
      y += `<rect x="${(k - 1).toFixed(2)}" y="${M.toFixed(2)}" width="2" height="${T.toFixed(2)}" fill="${o}"/>`;
    }
    return `<svg class="sg-renderer-bullet" viewBox="0 0 ${a} ${l}" width="${a}" height="${l}" preserveAspectRatio="none" aria-hidden="true">` + y + "</svg>";
  };
}
function tr({
  size: t = 28,
  thickness: r = 5,
  color: e = "green",
  background: n = "#e5e7eb",
  showValue: s = !0,
  inline: i = !1
} = {}) {
  const o = pt[e] || e;
  return ({ value: a }) => {
    let l = Number(a);
    if (!Number.isFinite(l)) return "";
    l = Math.max(0, Math.min(100, l));
    const c = (t - r) / 2, d = t / 2, p = t / 2, f = 2 * Math.PI * c, g = f * (1 - l / 100), h = `<text x="${d}" y="${p + 0.5}" text-anchor="middle" dominant-baseline="middle" font-size="${(t * 0.32).toFixed(1)}" font-weight="600" fill="currentColor">${Math.round(l)}</text>`, b = `<svg class="sg-renderer-donut" viewBox="0 0 ${t} ${t}" width="${t}" height="${t}" aria-hidden="true"><circle cx="${d}" cy="${p}" r="${c}" fill="none" stroke="${n}" stroke-width="${r}"/><circle cx="${d}" cy="${p}" r="${c}" fill="none" stroke="${o}" stroke-width="${r}" stroke-dasharray="${f.toFixed(2)}" stroke-dashoffset="${g.toFixed(2)}" stroke-linecap="round" transform="rotate(-90 ${d} ${p})"/>` + (s && !i ? h : "") + "</svg>";
    return i && s ? `<span class="sg-renderer-donut-wrap">${b}<span class="sg-renderer-donut-label">${Math.round(l)}%</span></span>` : b;
  };
}
function nr({
  width: t = 120,
  height: r = 32,
  color: e = "blue",
  highlightMax: n = !1,
  gap: s = 1,
  binLabels: i = null,
  showCount: o = !1
} = {}) {
  const a = pt[e] || e;
  return ({ value: l, td: c }) => {
    if (l == null || l === "") return "";
    c && c.classList.add("sg-renderer-histogram-cell");
    let d = l, p = i;
    if (l && typeof l == "object" && !Array.isArray(l) && (d = l.counts, p = l.labels || i), !Array.isArray(d)) return "";
    const f = d.map(Number).filter(Number.isFinite);
    if (f.length === 0) return "";
    const g = Math.max(...f, 1), h = f.reduce(($, L) => $ + L, 0), b = p && p.length ? 10 : 0, m = 1, _ = 1, y = t - m * 2, w = r - _ * 2 - b, C = Math.max(1, (y - (f.length - 1) * s) / f.length);
    let k = "";
    for (let $ = 0; $ < f.length; $++) {
      const L = f[$], E = L / g * w, D = m + $ * (C + s), P = _ + w - E, F = n ? L === g ? 1 : 0.45 : 0.85, B = p && p[$] != null ? `${p[$]}: ${L}` : `Bin ${$ + 1}: ${L}`;
      k += `<rect x="${D.toFixed(2)}" y="${P.toFixed(2)}" width="${C.toFixed(2)}" height="${E.toFixed(2)}" fill="${a}" fill-opacity="${F}"><title>${we(B)}</title></rect>`;
    }
    let T = "";
    if (p && p.length)
      for (let $ = 0; $ < f.length && $ < p.length; $++) {
        const L = m + $ * (C + s) + C / 2;
        T += `<text x="${L.toFixed(2)}" y="${(r - 1).toFixed(2)}" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.65">${we(p[$])}</text>`;
      }
    const M = `<svg class="sg-renderer-histogram" viewBox="0 0 ${t} ${r}" width="${t}" height="${r}" preserveAspectRatio="none" aria-hidden="true">` + k + T + "</svg>";
    return o ? `<span class="sg-renderer-histogram-wrap">${M}<span class="sg-renderer-histogram-total">n=${h}</span></span>` : M;
  };
}
const ct = {
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
}, qo = { red: "#ef4444", amber: "#f59e0b", green: "#10b981" };
function rr({
  size: t = 10,
  thresholds: r = null,
  inverted: e = !1,
  showLabel: n = !1
} = {}) {
  return ({ value: s }) => {
    if (S(s)) return "";
    let i;
    if (r && Number.isFinite(Number(s))) {
      const a = Number(s), l = e ? r[1] : r[0], c = e ? r[0] : r[1];
      e ? i = a >= l ? "red" : a >= c ? "amber" : "green" : i = a <= l ? "red" : a <= c ? "amber" : "green";
    } else if (i = ct[String(s).toLowerCase()] || null, !i) return "";
    const o = u("span", {
      class: `sg-renderer-rag is-${i}`,
      title: n ? null : i.charAt(0).toUpperCase() + i.slice(1)
    });
    return o.append(u("span", {
      class: "sg-renderer-rag-dot",
      style: `width:${t}px; height:${t}px; background:${qo[i]};`,
      "aria-label": i
    })), n && o.append(u(
      "span",
      { class: "sg-renderer-rag-label" },
      document.createTextNode(i.charAt(0).toUpperCase() + i.slice(1))
    )), o;
  };
}
function sr({
  steps: t = ["Pending", "Shipped", "Delivered"],
  color: r = "#2563eb",
  showLabels: e = !1
} = {}) {
  return ({ value: n, td: s }) => {
    if (S(n)) return "";
    s && s.classList.add("sg-renderer-timeline-cell");
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
      style: `--ts-color: ${r};`,
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
const Wo = /([@#][a-zA-Z0-9_\-]+)/g;
function ir({
  mentionHref: t = null,
  tagHref: r = null
} = {}) {
  return ({ value: e }) => {
    if (S(e)) return "";
    const n = String(e), s = u("span", { class: "sg-renderer-mentions" }), i = n.split(Wo);
    for (const o of i)
      if (o)
        if (o[0] === "@") {
          const a = o.slice(1), l = typeof t == "function" ? t(a) : null;
          s.append(Rt(o, l, "sg-renderer-mention"));
        } else if (o[0] === "#") {
          const a = o.slice(1), l = typeof r == "function" ? r(a) : null;
          s.append(Rt(o, l, "sg-renderer-hashtag"));
        } else
          s.append(document.createTextNode(o));
    return s;
  };
}
function Rt(t, r, e) {
  const n = r ? u("a", { href: r, target: "_blank", rel: "noopener noreferrer", class: e }) : u("span", { class: e });
  return r && n.addEventListener("click", (s) => s.stopPropagation()), n.append(document.createTextNode(t)), n;
}
function or({
  chars: t = null,
  lines: r = null,
  moreLabel: e = "Read more",
  lessLabel: n = "Show less"
} = {}) {
  return ({ value: s, td: i }) => {
    if (S(s)) return "";
    const o = String(s), a = t && o.length > t;
    if (!a && !r) return o;
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
      d.style.setProperty("--sg-clamp", String(r)), d.textContent = o;
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
function ar({
  unit: t = "kilometer",
  unitDisplay: r = "short",
  decimals: e,
  locale: n = void 0,
  ...s
} = {}) {
  const i = { style: "unit", unit: t, unitDisplay: r, ...s };
  e != null && (i.minimumFractionDigits = e, i.maximumFractionDigits = e);
  let o;
  try {
    o = new Intl.NumberFormat(n, i);
  } catch {
    const l = e != null ? { minimumFractionDigits: e, maximumFractionDigits: e } : {};
    o = new Intl.NumberFormat(n, l);
  }
  return ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-number"), S(a)) return "";
    const c = Number(a);
    return Number.isFinite(c) ? o.format(c) : String(a);
  };
}
const Yo = /^((25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(25[0-5]|2[0-4]\d|[01]?\d?\d)$/, Zo = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|:(:[0-9a-fA-F]{1,4}){1,7}|::)$/;
function Xo(t) {
  return Yo.test(t);
}
function Jo(t) {
  return Zo.test(t);
}
function lr({
  countryField: t = null
} = {}) {
  return ({ value: r, row: e }) => {
    if (S(r)) return "";
    const n = String(r).trim(), s = Xo(n), i = !s && Jo(n);
    if (!s && !i)
      return u("span", {
        class: "sg-renderer-ip is-invalid",
        title: "Invalid IP address"
      }, document.createTextNode(n));
    const o = u("span", {
      class: `sg-renderer-ip ${i ? "is-v6" : "is-v4"}`,
      title: s ? "IPv4" : "IPv6"
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
const Qo = {
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
function cr({
  banks: t = Qo,
  showBank: r = !0
} = {}) {
  return ({ value: e }) => {
    if (S(e)) return "";
    const n = String(e).trim(), s = n.replace(/\D/g, "");
    if (s.length !== 6)
      return u("span", {
        class: "sg-renderer-invalid",
        title: "Invalid BSB — must be 6 digits"
      }, document.createTextNode(n));
    const i = `${s.slice(0, 3)}-${s.slice(3)}`, o = s.slice(0, 2), a = t[o], l = u("span", { class: "sg-renderer-bsb" });
    return l.append(u(
      "span",
      { class: "sg-renderer-bsb-number sg-renderer-mono" },
      document.createTextNode(i)
    )), r && a && l.append(u(
      "span",
      { class: "sg-renderer-bsb-bank" },
      document.createTextNode(a)
    )), l;
  };
}
function ea(t) {
  const r = String(t).replace(/\s+/g, "");
  if (r.length !== 9 || !/^\d{9}$/.test(r)) return !1;
  const e = [8, 7, 6, 5, 4, 3, 2, 1];
  let n = 0;
  for (let s = 0; s < 8; s++) n += parseInt(r[s], 10) * e[s];
  return parseInt(r[8], 10) === (10 - n % 10) % 10;
}
function ta(t) {
  const r = String(t).replace(/\D/g, "");
  return r.length !== 9 ? String(t) : `${r.slice(0, 3)} ${r.slice(3, 6)} ${r.slice(6)}`;
}
function dr() {
  return ({ value: t }) => {
    if (S(t)) return "";
    if (!ea(t))
      return u("span", {
        class: "sg-renderer-invalid",
        title: "Invalid ACN (checksum failed)"
      }, document.createTextNode(String(t)));
    const r = String(t).replace(/\s+/g, "");
    return u("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/Search/ResultsActiveASIC?SearchText=${r}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(ta(t)));
  };
}
function ur() {
  return ({ value: t, td: r }) => {
    if (r && r.classList.add("sg-renderer-mask-numeric"), S(t)) return "";
    const e = String(t), n = e.replace(/\D/g, "");
    if (n.length < 8 || n.length > 9)
      return u("span", {
        class: "sg-renderer-invalid",
        title: "Invalid TFN — must be 8 or 9 digits"
      }, document.createTextNode(e));
    const s = n.slice(-3), i = n.length - 3, o = "•".repeat(i);
    return n.length === 9 ? `${o.slice(0, 3)} ${o.slice(3)} ${s}` : `${o.slice(0, 2)} ${o.slice(2)} ${s}`;
  };
}
function na(t) {
  if (t.length !== 10 || !/^[2-6]\d{9}$/.test(t)) return !1;
  const r = [1, 3, 7, 9, 1, 3, 7, 9];
  let e = 0;
  for (let n = 0; n < 8; n++) e += parseInt(t[n], 10) * r[n];
  return e % 10 === parseInt(t[8], 10);
}
function pr() {
  return ({ value: t }) => {
    if (S(t)) return "";
    const r = String(t).trim().replace(/\s+/g, ""), e = /^(\d{10})(?:[\/-]?(\d))?$/.exec(r);
    if (!e || !na(e[1]))
      return u("span", {
        class: "sg-renderer-invalid",
        title: e ? "Invalid Medicare (checksum failed)" : "Invalid Medicare format"
      }, document.createTextNode(String(t)));
    const n = e[1], s = e[2], i = `${n.slice(0, 4)} ${n.slice(4, 9)} ${n.slice(9)}` + (s ? ` / ${s}` : "");
    return u(
      "span",
      { class: "sg-renderer-medicare sg-renderer-mono" },
      document.createTextNode(i)
    );
  };
}
function fr({ preload: t = "none" } = {}) {
  return ({ value: r }) => S(r) ? "" : u("audio", {
    class: "sg-renderer-audio",
    controls: "",
    preload: t,
    src: String(r).trim()
  });
}
function gr({ width: t = 200, preload: r = "metadata" } = {}) {
  return ({ value: e }) => S(e) ? "" : u("video", {
    class: "sg-renderer-video",
    controls: "",
    preload: r,
    src: String(e).trim(),
    width: String(t)
  });
}
function hr({ sort: t = "count" } = {}) {
  return ({ value: r }) => {
    if (S(r)) return "";
    let e = [];
    if (Array.isArray(r))
      e = r.map((s) => Array.isArray(s) ? s : [s.emoji ?? s.name ?? "?", s.count ?? s.n ?? 0]);
    else if (typeof r == "object")
      e = Object.entries(r);
    else
      return "";
    if (e = e.filter(([, s]) => Number.isFinite(Number(s)) && Number(s) > 0), t === "count" && e.sort((s, i) => Number(i[1]) - Number(s[1])), e.length === 0) return "";
    const n = u("span", { class: "sg-renderer-reactions" });
    for (const [s, i] of e) {
      const o = u("span", { class: "sg-reaction", title: `${i} ${s}` });
      o.append(u("span", { class: "sg-reaction-emoji" }, document.createTextNode(String(s)))), o.append(u("span", { class: "sg-reaction-count" }, document.createTextNode(String(i)))), n.append(o);
    }
    return n;
  };
}
function mr({ icon: t = "💬" } = {}) {
  return ({ value: r }) => {
    if (S(r)) return "";
    let e = "", n = null;
    typeof r == "object" ? (e = r.value ?? r.text ?? "", n = r.count ?? r.comments ?? null) : Number.isFinite(Number(r)) && typeof r != "string" ? n = Number(r) : e = String(r);
    const s = u("span", { class: "sg-renderer-comment-count" });
    if (e && s.append(u("span", { class: "sg-cc-value" }, document.createTextNode(String(e)))), n != null && Number(n) > 0) {
      const i = u("span", {
        class: "sg-cc-badge",
        title: `${n} comment${Number(n) === 1 ? "" : "s"}`
      }), o = u("span", { class: "sg-cc-icon", "aria-hidden": "true" });
      typeof t == "string" && t.trimStart().startsWith("<svg") ? o.innerHTML = t : o.append(document.createTextNode(String(t))), i.append(o), i.append(u("span", { class: "sg-cc-num" }, document.createTextNode(String(n)))), s.append(i);
    }
    return s;
  };
}
function br({ locale: t = void 0 } = {}) {
  const e = new Intl.Locale(t || Intl.NumberFormat().resolvedOptions().locale).language === "en", n = e ? new Intl.PluralRules(t, { type: "ordinal" }) : null, s = { one: "st", two: "nd", few: "rd", other: "th" };
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), S(i)) return "";
    const a = Number(i);
    return Number.isInteger(a) ? e ? `${a}${s[n.select(a)]}` : String(a) : String(i);
  };
}
function yr({
  one: t = "item",
  other: r = "items",
  zero: e = null,
  locale: n = void 0
} = {}) {
  const s = new Intl.PluralRules(n);
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), S(i)) return "";
    const a = Number(i);
    return Number.isFinite(a) ? a === 0 && e ? `${a} ${e}` : s.select(a) === "one" ? `${a} ${t}` : `${a} ${r}` : String(i);
  };
}
const ra = /* @__PURE__ */ new Set(["", "null", "nil", "none", "n/a", "na", "-", "—"]);
function wr({
  placeholder: t = "—",
  emptyOnTokens: r = !0
} = {}) {
  return ({ value: e }) => e == null || typeof e == "string" && (e === "" || r && ra.has(e.trim().toLowerCase())) ? u(
    "span",
    { class: "sg-renderer-empty", title: "Empty" },
    document.createTextNode(t)
  ) : String(e);
}
function sa(t) {
  let r = 0, e = !1;
  for (let n = t.length - 1; n >= 0; n--) {
    let s = parseInt(t[n], 10);
    e && (s *= 2, s > 9 && (s -= 9)), r += s, e = !e;
  }
  return r % 10 === 0;
}
function ia(t) {
  return /^4\d{12}(\d{3,6})?$/.test(t) ? "visa" : /^(5[1-5]\d{14}|2(2[2-9]|[3-6]\d|7[01]|720)\d{12})$/.test(t) ? "mastercard" : /^3[47]\d{13}$/.test(t) ? "amex" : /^(6011\d{12,15}|65\d{14,17}|64[4-9]\d{13}|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9([01]\d|2[0-5]))\d{10,13})$/.test(t) ? "discover" : /^35(2[89]|[3-8]\d)\d{12}$/.test(t) ? "jcb" : /^3(0[0-5]|[68]\d|9\d)\d{11}$/.test(t) ? "diners" : null;
}
function _r({ mask: t = !0 } = {}) {
  return ({ value: r, td: e }) => {
    if (e && e.classList.add("sg-renderer-number"), S(r)) return "";
    const n = String(r).replace(/\D/g, ""), s = n.length >= 13 && n.length <= 19, i = s && sa(n), o = s ? ia(n) : null, a = u("span", { class: `sg-renderer-card${i ? "" : " is-invalid"}` });
    o && a.append(u("span", {
      class: `sg-renderer-card-brand is-${o}`,
      title: o[0].toUpperCase() + o.slice(1)
    }, document.createTextNode(o === "mastercard" ? "MC" : o.toUpperCase())));
    let l;
    if (!s)
      l = String(r);
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
function vr({
  width: t = "70%",
  height: r = "12px"
} = {}) {
  return ({ value: e }) => e != null && e !== "" && e !== "loading" && e !== "…" ? String(e) : u("span", {
    class: "sg-renderer-shimmer",
    style: `width: ${t}; height: ${r};`,
    "aria-label": "Loading"
  });
}
function le(t) {
  return Array.isArray(t) ? t.map((r) => r == null ? null : typeof r == "object" ? { value: r.value, label: r.label ?? String(r.value), color: r.color || null, icon: r.icon || null } : { value: r, label: String(r), color: null, icon: null }).filter(Boolean) : [];
}
function ce(t, r) {
  const e = u("span", { class: "sg-renderer-select-pill" });
  return t.color ? r.test(t.color) ? e.classList.add(`sg-pill-${t.color}`) : (e.style.background = t.color, e.style.color = qn(t.color)) : e.classList.add("sg-renderer-select-pill-bare"), t.icon && e.append(u("span", { class: "sg-renderer-select-pill-icon", "aria-hidden": "true" }, t.icon)), e.append(u(
    "span",
    { class: "sg-renderer-select-pill-label" },
    document.createTextNode(t.label)
  )), e;
}
const de = /^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/;
function ht(t, r) {
  const e = t?.col?.cellRendererConfig || null, n = t?.col?.enumValues || null;
  return {
    options: r.options.length ? r.options : e?.options || n || [],
    placeholder: e?.placeholder ?? r.placeholder,
    clearable: e?.clearable ?? r.clearable,
    colorMap: e?.colorMap ?? r.colorMap,
    editable: e?.editable ?? r.editable,
    separator: e?.separator ?? r.separator
  };
}
function Cr({
  options: t = [],
  placeholder: r = "Select…",
  editable: e = !0,
  clearable: n = !1,
  colorMap: s = null
} = {}) {
  const i = le(t);
  if (s && typeof s == "object")
    for (const o of i)
      !o.color && Object.prototype.hasOwnProperty.call(s, o.value) && (o.color = s[o.value]);
  return (o) => {
    const { value: a, td: l } = o, c = ht(o, { options: i, placeholder: r, clearable: n, colorMap: s, editable: e });
    let d = i;
    if (i.length === 0 && c.options.length && (d = le(c.options), c.colorMap && typeof c.colorMap == "object"))
      for (const f of d)
        !f.color && Object.prototype.hasOwnProperty.call(c.colorMap, f.value) && (f.color = c.colorMap[f.value]);
    l && (l.classList.add("sg-renderer-select-cell"), l._sgSelectOpts = d, l._sgSelectClearable = c.clearable), c.editable && l && !l._sgSelectEditBound && (l._sgSelectEditBound = !0, l.addEventListener("dblclick", (f) => {
      f._sgSelectHandled || (f._sgSelectHandled = !0, f.stopPropagation(), oa(l, o));
    }));
    const p = d.find((f) => String(f.value) === String(a)) || null;
    return p ? ce(p, de) : S(a) ? u(
      "span",
      { class: "sg-renderer-select-placeholder" },
      document.createTextNode(c.placeholder)
    ) : u("span", { class: "sg-renderer-select-bare" }, document.createTextNode(String(a)));
  };
}
function te(t) {
  if (!t) return;
  const r = t.closest('[data-controller~="grid"]');
  if (r)
    try {
      r.focus({ preventScroll: !0 });
    } catch {
    }
}
let Pe = null;
function oa(t, r) {
  Se();
  const e = t._sgSelectOpts || [], n = t._sgSelectClearable, { row: s, col: i } = r, o = s && i?.field != null ? s[i.field] : null, a = u("div", { class: "sg-renderer-select-popover", role: "listbox" });
  a.addEventListener("mousedown", (p) => p.stopPropagation());
  function l(p) {
    const { api: f } = r, g = s && i?.field != null ? s[i.field] : null;
    s && i?.field != null && (s[i.field] = p), f?.applyTransaction && f.applyTransaction({ update: [s] });
    const h = t.closest('[data-controller~="grid"]');
    h && h.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: s?.id ?? s?._sg_id, colId: i?.field, oldValue: g, newValue: p }
    })), Se();
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
    f.append(ce(p, de)), f.addEventListener("click", () => l(p.value)), a.append(f);
  }
  function c(p) {
    p.key === "Escape" && (p.stopPropagation(), Se());
  }
  function d(p) {
    !a.contains(p.target) && !t.contains(p.target) && Se();
  }
  document.addEventListener("keydown", c), setTimeout(() => document.addEventListener("mousedown", d), 0), document.body.appendChild(a), W(a, t), Pe = { pop: a, onKey: c, onDocClick: d, anchor: t };
}
function Se() {
  if (!Pe) return;
  const { pop: t, onKey: r, onDocClick: e, anchor: n } = Pe;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), t.remove(), Pe = null, te(n);
}
function xr(t) {
  return t == null || t === "" ? [] : Array.isArray(t) ? t.map(String) : String(t).split(",").map((r) => r.trim()).filter(Boolean);
}
function Sr({
  options: t = [],
  separator: r = ",",
  placeholder: e = "Add tags…",
  editable: n = !0,
  colorMap: s = null
} = {}) {
  const i = le(t);
  if (s && typeof s == "object")
    for (const o of i)
      !o.color && Object.prototype.hasOwnProperty.call(s, o.value) && (o.color = s[o.value]);
  return (o) => {
    const { value: a, td: l } = o, c = ht(o, { options: i, placeholder: e, colorMap: s, editable: n, separator: r });
    let d = i;
    if (i.length === 0 && c.options.length && (d = le(c.options), c.colorMap && typeof c.colorMap == "object"))
      for (const g of d)
        !g.color && Object.prototype.hasOwnProperty.call(c.colorMap, g.value) && (g.color = c.colorMap[g.value]);
    l && (l.classList.add("sg-renderer-multiselect-cell"), l._sgMultiOpts = d, l._sgMultiSep = c.separator), c.editable && l && !l._sgMultiEditBound && (l._sgMultiEditBound = !0, l.addEventListener("dblclick", (g) => {
      g._sgMultiHandled || (g._sgMultiHandled = !0, g.stopPropagation(), aa(l, o));
    }));
    const p = xr(a);
    if (!p.length)
      return u(
        "span",
        { class: "sg-renderer-multiselect-placeholder" },
        document.createTextNode(c.placeholder)
      );
    const f = u("div", { class: "sg-renderer-multiselect" });
    for (const g of p) {
      const h = d.find((b) => String(b.value) === String(g)) || { label: g, color: null, icon: null };
      f.append(ce(h, de));
    }
    return f;
  };
}
let Ve = null;
function aa(t, r) {
  rt();
  const e = t._sgMultiOpts || [], n = t._sgMultiSep || ",", { row: s, col: i } = r, o = xr(s && i?.field != null ? s[i.field] : null), a = new Set(o), l = u("div", { class: "sg-renderer-multiselect-popover", role: "listbox", "aria-multiselectable": "true" });
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
    )), m.append(ce(h, de)), m.addEventListener("click", () => {
      a.has(String(h.value)) ? a.delete(String(h.value)) : a.add(String(h.value)), l.replaceChildren(), d();
    }), m;
  }
  function d() {
    for (const h of e) l.append(c(h));
  }
  d();
  function p() {
    const { api: h } = r, b = Array.from(a), m = s && i?.field != null ? s[i.field] : null, _ = Array.isArray(m) || m == null ? b : b.join(n), y = m;
    s && i?.field != null && (s[i.field] = _), h?.applyTransaction && h.applyTransaction({ update: [s] });
    const w = t.closest('[data-controller~="grid"]');
    w && w.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: s?.id ?? s?._sg_id, colId: i?.field, oldValue: y, newValue: _ }
    })), rt();
  }
  function f(h) {
    h.key === "Escape" && (h.stopPropagation(), rt()), h.key === "Enter" && (h.stopPropagation(), h.preventDefault(), p());
  }
  function g(h) {
    !l.contains(h.target) && !t.contains(h.target) && p();
  }
  document.addEventListener("keydown", f), setTimeout(() => document.addEventListener("mousedown", g), 0), document.body.appendChild(l), W(l, t), Ve = { pop: l, onKey: f, onDocClick: g, anchor: t };
}
function rt() {
  if (!Ve) return;
  const { pop: t, onKey: r, onDocClick: e, anchor: n } = Ve;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), t.remove(), Ve = null, te(n);
}
function Lr({
  options: t = [],
  placeholder: r = "Search…",
  editable: e = !0,
  allowCustom: n = !1,
  colorMap: s = null
} = {}) {
  const i = le(t);
  if (s && typeof s == "object")
    for (const o of i)
      !o.color && Object.prototype.hasOwnProperty.call(s, o.value) && (o.color = s[o.value]);
  return (o) => {
    const { value: a, td: l } = o, c = ht(o, { options: i, placeholder: r, colorMap: s, editable: e }), d = o?.col?.cellRendererConfig?.allowCustom ?? n;
    let p = i;
    if (i.length === 0 && c.options.length && (p = le(c.options), c.colorMap && typeof c.colorMap == "object"))
      for (const g of p)
        !g.color && Object.prototype.hasOwnProperty.call(c.colorMap, g.value) && (g.color = c.colorMap[g.value]);
    l && (l.classList.add("sg-renderer-combobox-cell"), l._sgComboOpts = p, l._sgComboAllowCustom = d, l._sgComboPlaceholder = c.placeholder), c.editable && l && !l._sgComboEditBound && (l._sgComboEditBound = !0, l.addEventListener("dblclick", (g) => {
      g._sgComboHandled || (g._sgComboHandled = !0, g.stopPropagation(), la(l, o));
    }));
    const f = p.find((g) => String(g.value) === String(a)) || null;
    return f ? ce(f, de) : S(a) ? u(
      "span",
      { class: "sg-renderer-select-placeholder" },
      document.createTextNode(c.placeholder)
    ) : u("span", { class: "sg-renderer-select-bare" }, document.createTextNode(String(a)));
  };
}
let Fe = null;
function la(t, r) {
  pe();
  const e = t._sgComboOpts || [], n = !!t._sgComboAllowCustom, s = t._sgComboPlaceholder || "Search…", { row: i, col: o } = r;
  let a = "", l = 0;
  const c = u("div", { class: "sg-renderer-combobox-popover", role: "combobox" });
  c.addEventListener("mousedown", (y) => y.stopPropagation());
  const d = u("input", {
    type: "search",
    class: "sg-renderer-combobox-input",
    placeholder: s,
    autocomplete: "off"
  });
  c.append(d);
  const p = u("div", { class: "sg-renderer-combobox-list", role: "listbox" });
  c.append(p);
  function f(y) {
    const { api: w } = r, C = i && o?.field != null ? i[o.field] : null;
    i && o?.field != null && (i[o.field] = y), w?.applyTransaction && w.applyTransaction({ update: [i] });
    const k = t.closest('[data-controller~="grid"]');
    k && k.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: i?.id ?? i?._sg_id, colId: o?.field, oldValue: C, newValue: y }
    })), pe();
  }
  function g() {
    const y = a.trim().toLowerCase();
    return y ? e.filter((w) => String(w.label).toLowerCase().includes(y)) : e;
  }
  function h() {
    p.replaceChildren();
    const y = g();
    if (l >= y.length && (l = Math.max(0, y.length - 1)), y.forEach((w, C) => {
      const k = u("button", {
        type: "button",
        class: `sg-renderer-combobox-option${C === l ? " is-highlighted" : ""}`,
        role: "option",
        "aria-selected": C === l ? "true" : "false"
      });
      k.append(ce(w, de)), k.addEventListener("mouseenter", () => {
        l = C, b();
      }), k.addEventListener("click", () => f(w.value)), p.append(k);
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
    y.key === "ArrowDown" ? (y.preventDefault(), l = Math.min(w.length - 1, l + 1), b()) : y.key === "ArrowUp" ? (y.preventDefault(), l = Math.max(0, l - 1), b()) : y.key === "Enter" ? (y.preventDefault(), w[l] ? f(w[l].value) : n && a.trim() && f(a.trim())) : y.key === "Escape" && (y.stopPropagation(), pe());
  });
  function m(y) {
    y.key === "Escape" && (y.stopPropagation(), pe());
  }
  function _(y) {
    !c.contains(y.target) && !t.contains(y.target) && pe();
  }
  document.addEventListener("keydown", m), setTimeout(() => document.addEventListener("mousedown", _), 0), document.body.appendChild(c), W(c, t), h(), setTimeout(() => d.focus(), 0), Fe = { pop: c, onKey: m, onDocClick: _, anchor: t };
}
function pe() {
  if (!Fe) return;
  const { pop: t, onKey: r, onDocClick: e, anchor: n } = Fe;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), t.remove(), Fe = null, te(n);
}
function ye(t) {
  if (!t) return "";
  const r = t.getFullYear(), e = String(t.getMonth() + 1).padStart(2, "0"), n = String(t.getDate()).padStart(2, "0");
  return `${r}-${e}-${n}`;
}
function ae(t, r) {
  return t && r && t.getFullYear() === r.getFullYear() && t.getMonth() === r.getMonth() && t.getDate() === r.getDate();
}
function kr({
  locale: t = void 0,
  dateStyle: r = "medium",
  editable: e = !0,
  empty: n = "",
  min: s = null,
  max: i = null,
  firstDayOfWeek: o = 1
  // 0 = Sunday, 1 = Monday (default)
} = {}) {
  const a = new Intl.DateTimeFormat(t, { dateStyle: r });
  return (l) => {
    const { value: c, td: d } = l, p = l?.col?.cellRendererConfig || {}, f = p.min ? j(p.min) : s ? j(s) : null, g = p.max ? j(p.max) : i ? j(i) : null, h = p.firstDayOfWeek ?? o, b = p.editable ?? e;
    d && (d.classList.add("sg-renderer-datepicker-cell"), d._sgDatePickerMin = f, d._sgDatePickerMax = g, d._sgDatePickerFdow = h), b && d && !d._sgDatePickerBound && (d._sgDatePickerBound = !0, d.addEventListener("dblclick", (_) => {
      _._sgDatePickerHandled || (_._sgDatePickerHandled = !0, _.stopPropagation(), da(d, l));
    }));
    const m = j(c);
    return m ? u(
      "span",
      { class: "sg-renderer-datepicker-value" },
      document.createTextNode(a.format(m))
    ) : n ? document.createTextNode(n) : "";
  };
}
let Be = null;
const $r = [
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
], Er = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
function ca(t, r, e, n, s, i, o) {
  const a = u("div", { class: "sg-renderer-datepicker-cal" }), l = u("div", { class: "sg-renderer-datepicker-head" }), c = u(
    "button",
    { type: "button", class: "sg-renderer-datepicker-nav", "aria-label": "Previous month" },
    document.createTextNode("‹")
  ), d = u(
    "span",
    { class: "sg-renderer-datepicker-title" },
    document.createTextNode(`${$r[r]} ${t}`)
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
      document.createTextNode(Er[(y + o) % 7])
    ));
  const g = u("div", { class: "sg-renderer-datepicker-grid" }), b = (new Date(t, r, 1).getDay() - o + 7) % 7, m = new Date(t, r, 1 - b), _ = /* @__PURE__ */ new Date();
  for (let y = 0; y < 42; y++) {
    const w = new Date(m.getFullYear(), m.getMonth(), m.getDate() + y), C = w.getMonth() === r, k = ae(w, e), T = ae(w, _), M = s && w < s || i && w > i, $ = ["sg-renderer-datepicker-day"];
    C || $.push("is-other-month"), k && $.push("is-selected"), T && $.push("is-today"), M && $.push("is-disabled");
    const L = u("button", {
      type: "button",
      class: $.join(" "),
      disabled: M ? "" : null,
      title: ye(w)
    }, document.createTextNode(String(w.getDate())));
    L.addEventListener("click", () => n(w)), g.append(L);
  }
  return a.append(l, f, g), { wrap: a, prev: c, next: p, title: d };
}
function da(t, r) {
  Le();
  const { row: e, col: n } = r, s = j(e && n?.field != null ? e[n.field] : null);
  let i = (s || /* @__PURE__ */ new Date()).getFullYear(), o = (s || /* @__PURE__ */ new Date()).getMonth(), a = s;
  const l = t._sgDatePickerMin || null, c = t._sgDatePickerMax || null, d = t._sgDatePickerFdow ?? 1, p = u("div", { class: "sg-renderer-datepicker-popover", role: "dialog" });
  p.addEventListener("mousedown", (m) => m.stopPropagation());
  function f(m) {
    const { api: _ } = r, y = e && n?.field != null ? e[n.field] : null, w = m ? ye(m) : null;
    e && n?.field != null && (e[n.field] = w), _?.applyTransaction && _.applyTransaction({ update: [e] });
    const C = t.closest('[data-controller~="grid"]');
    C && C.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: e?.id ?? e?._sg_id, colId: n?.field, oldValue: y, newValue: w }
    })), Le();
  }
  function g() {
    p.replaceChildren();
    const { wrap: m, prev: _, next: y } = ca(i, o, a, f, l, c, d);
    _.addEventListener("click", () => {
      o === 0 ? (o = 11, i -= 1) : o -= 1, g();
    }), y.addEventListener("click", () => {
      o === 11 ? (o = 0, i += 1) : o += 1, g();
    });
    const w = u("div", { class: "sg-renderer-datepicker-footer" }), C = u(
      "button",
      { type: "button", class: "sg-renderer-datepicker-today" },
      document.createTextNode("Today")
    );
    C.addEventListener("click", () => f(/* @__PURE__ */ new Date()));
    const k = u(
      "button",
      { type: "button", class: "sg-renderer-datepicker-clear" },
      document.createTextNode("Clear")
    );
    k.addEventListener("click", () => f(null)), w.append(C, k), p.append(m, w);
  }
  function h(m) {
    m.key === "Escape" && (m.stopPropagation(), Le());
  }
  function b(m) {
    !p.contains(m.target) && !t.contains(m.target) && Le();
  }
  document.addEventListener("keydown", h), setTimeout(() => document.addEventListener("mousedown", b), 0), document.body.appendChild(p), g(), W(p, t), Be = { pop: p, onKey: h, onDocClick: b, anchor: t };
}
function Le() {
  if (!Be) return;
  const { pop: t, onKey: r, onDocClick: e, anchor: n } = Be;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), t.remove(), Be = null, te(n);
}
function Ar({
  style: t = "24h",
  // '24h' | '12h'
  minuteStep: r = 5,
  editable: e = !0,
  empty: n = "—"
} = {}) {
  return (s) => {
    const { value: i, td: o } = s, a = s?.col?.cellRendererConfig || {}, l = a.style ?? t, c = a.minuteStep ?? r, d = a.editable ?? e;
    o && (o.classList.add("sg-renderer-timepicker-cell"), o._sgTimePickerStyle = l, o._sgTimePickerStep = c), d && o && !o._sgTimePickerBound && (o._sgTimePickerBound = !0, o.addEventListener("dblclick", (f) => {
      f._sgTimePickerHandled || (f._sgTimePickerHandled = !0, f.stopPropagation(), pa(o, s));
    }));
    const p = gt(i);
    return p ? u(
      "span",
      { class: "sg-renderer-timepicker-value" },
      document.createTextNode(ua(p, l))
    ) : n;
  };
}
function ua(t, r) {
  const e = String(t.m).padStart(2, "0");
  if (r === "12h") {
    const n = t.h >= 12 ? "PM" : "AM";
    return `${t.h % 12 || 12}:${e} ${n}`;
  }
  return `${String(t.h).padStart(2, "0")}:${e}`;
}
let He = null;
function pa(t, r) {
  fe();
  const e = t._sgTimePickerStyle || "24h", n = t._sgTimePickerStep || 5, { row: s, col: i } = r, o = gt(s && i?.field != null ? s[i.field] : null) || { h: 9, m: 0 };
  let a = o.h, l = Math.round(o.m / n) * n;
  l >= 60 && (l = 0);
  const c = u("div", { class: "sg-renderer-timepicker-popover", role: "dialog" });
  c.addEventListener("mousedown", (L) => L.stopPropagation());
  function d(L) {
    const { api: E } = r, D = s && i?.field != null ? s[i.field] : null;
    s && i?.field != null && (s[i.field] = L), E?.applyTransaction && E.applyTransaction({ update: [s] });
    const P = t.closest('[data-controller~="grid"]');
    P && P.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: s?.id ?? s?._sg_id, colId: i?.field, oldValue: D, newValue: L }
    })), fe();
  }
  function p() {
    const L = String(a).padStart(2, "0"), E = String(l).padStart(2, "0");
    d(`${L}:${E}`);
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
    const L = e === "12h" ? Array.from({ length: 12 }, (E, D) => D === 0 ? 12 : D) : Array.from({ length: 24 }, (E, D) => D);
    for (const E of L) {
      const D = e === "12h" ? a >= 12 ? E === 12 ? 12 : E + 12 : E === 12 ? 0 : E : E, P = D === a, F = u("button", {
        type: "button",
        class: `sg-renderer-timepicker-item${P ? " is-selected" : ""}`
      }, document.createTextNode(e === "12h" ? String(E) : String(E).padStart(2, "0")));
      F.addEventListener("click", () => {
        a = D, h();
      }), F.addEventListener("dblclick", () => {
        a = D, p();
      }), g.append(F), P && setTimeout(() => F.scrollIntoView({ block: "nearest" }), 0);
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
    for (let L = 0; L < 60; L += n) {
      const E = L === l, D = u("button", {
        type: "button",
        class: `sg-renderer-timepicker-item${E ? " is-selected" : ""}`
      }, document.createTextNode(String(L).padStart(2, "0")));
      D.addEventListener("click", () => {
        l = L, _();
      }), D.addEventListener("dblclick", () => {
        l = L, p();
      }), m.append(D), E && setTimeout(() => D.scrollIntoView({ block: "nearest" }), 0);
    }
  }
  const y = u("div", { class: "sg-renderer-timepicker-cols" });
  if (y.append(f, b), e === "12h") {
    const L = u("div", { class: "sg-renderer-timepicker-col" });
    L.append(u(
      "div",
      { class: "sg-renderer-timepicker-col-label" },
      document.createTextNode(" ")
    ));
    const E = u("div", { class: "sg-renderer-timepicker-list" });
    for (const D of ["AM", "PM"]) {
      const P = D === "AM" && a < 12 || D === "PM" && a >= 12, F = u("button", {
        type: "button",
        class: `sg-renderer-timepicker-item${P ? " is-selected" : ""}`
      }, document.createTextNode(D));
      F.addEventListener("click", () => {
        D === "AM" && a >= 12 && (a -= 12), D === "PM" && a < 12 && (a += 12), h(), E.querySelectorAll(".sg-renderer-timepicker-item").forEach((B, H) => {
          B.classList.toggle("is-selected", H === 0 && a < 12 || H === 1 && a >= 12);
        });
      }), E.append(F);
    }
    L.append(E), y.append(L);
  }
  const w = u("div", { class: "sg-renderer-timepicker-footer" }), C = u(
    "button",
    { type: "button", class: "sg-renderer-timepicker-cancel" },
    document.createTextNode("Cancel")
  ), k = u(
    "button",
    { type: "button", class: "sg-renderer-timepicker-ok" },
    document.createTextNode("Set")
  ), T = u(
    "button",
    { type: "button", class: "sg-renderer-timepicker-clear" },
    document.createTextNode("Clear")
  );
  C.addEventListener("click", () => fe()), T.addEventListener("click", () => d(null)), k.addEventListener("click", () => p()), w.append(T, C, k), c.append(y, w);
  function M(L) {
    L.key === "Escape" && (L.stopPropagation(), fe()), L.key === "Enter" && (L.stopPropagation(), L.preventDefault(), p());
  }
  function $(L) {
    !c.contains(L.target) && !t.contains(L.target) && fe();
  }
  document.addEventListener("keydown", M), setTimeout(() => document.addEventListener("mousedown", $), 0), document.body.appendChild(c), h(), _(), W(c, t), He = { pop: c, onKey: M, onDocClick: $, anchor: t };
}
function fe() {
  if (!He) return;
  const { pop: t, onKey: r, onDocClick: e, anchor: n } = He;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), t.remove(), He = null, te(n);
}
function Tr(t) {
  if (t == null || t === "") return null;
  let r, e;
  if (Array.isArray(t))
    [r, e] = t;
  else if (typeof t == "object")
    r = t.start || t.from, e = t.end || t.to;
  else if (typeof t == "string") {
    const i = t.split(/\s*\/\s*|\s*[–-]\s*/);
    [r, e] = i.length >= 2 ? i : [t, t];
  }
  const n = j(r), s = j(e);
  return !n && !s ? null : { start: n, end: s };
}
function fa(t, r) {
  if (!t) return "";
  const { start: e, end: n } = t;
  if (!e && !n) return "";
  if (!n || e && ae(e, n))
    return new Intl.DateTimeFormat(r, { month: "short", day: "numeric", year: "numeric" }).format(e);
  if (!e)
    return `… – ${new Intl.DateTimeFormat(r, { month: "short", day: "numeric", year: "numeric" }).format(n)}`;
  const s = e.getFullYear() === n.getFullYear();
  if (s && e.getMonth() === n.getMonth()) {
    const a = new Intl.DateTimeFormat(r, { month: "short", day: "numeric" }).format(e), l = new Intl.DateTimeFormat(r, { day: "numeric", year: "numeric" }).format(n);
    return `${a} – ${l}`;
  }
  if (s) {
    const a = new Intl.DateTimeFormat(r, { month: "short", day: "numeric" }).format(e), l = new Intl.DateTimeFormat(r, { month: "short", day: "numeric", year: "numeric" }).format(n);
    return `${a} – ${l}`;
  }
  const o = new Intl.DateTimeFormat(r, { month: "short", day: "numeric", year: "numeric" });
  return `${o.format(e)} – ${o.format(n)}`;
}
function Nr({
  locale: t = void 0,
  editable: r = !0,
  empty: e = "—",
  firstDayOfWeek: n = 1
} = {}) {
  return (s) => {
    const { value: i, td: o } = s, a = s?.col?.cellRendererConfig || {}, l = a.firstDayOfWeek ?? n, c = a.editable ?? r;
    o && (o.classList.add("sg-renderer-daterange-cell"), o._sgRangeFdow = l), c && o && !o._sgRangeBound && (o._sgRangeBound = !0, o.addEventListener("dblclick", (p) => {
      p._sgRangeHandled || (p._sgRangeHandled = !0, p.stopPropagation(), ga(o, s));
    }));
    const d = Tr(i);
    return d ? u(
      "span",
      { class: "sg-renderer-daterange-value" },
      document.createTextNode(fa(d, t))
    ) : e;
  };
}
let Oe = null;
function ga(t, r) {
  ke();
  const { row: e, col: n } = r, s = Tr(e && n?.field != null ? e[n.field] : null) || { start: null, end: null };
  let i = s.start, o = s.end, a = (i || /* @__PURE__ */ new Date()).getFullYear(), l = (i || /* @__PURE__ */ new Date()).getMonth();
  const c = t._sgRangeFdow ?? 1, d = u("div", { class: "sg-renderer-daterange-popover", role: "dialog" });
  d.addEventListener("mousedown", (_) => _.stopPropagation());
  function p() {
    const { api: _ } = r, y = e && n?.field != null ? e[n.field] : null, w = i || o ? { start: i ? ye(i) : null, end: o ? ye(o) : null } : null;
    e && n?.field != null && (e[n.field] = w), _?.applyTransaction && _.applyTransaction({ update: [e] });
    const C = t.closest('[data-controller~="grid"]');
    C && C.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: e?.id ?? e?._sg_id, colId: n?.field, oldValue: y, newValue: w }
    })), ke();
  }
  function f(_) {
    !i || i && o ? (i = _, o = null) : _ < i ? (o = i, i = _) : o = _, h();
  }
  function g(_, y) {
    const w = u("div", { class: "sg-renderer-datepicker-cal" }), C = u("div", { class: "sg-renderer-datepicker-head" }), k = u(
      "button",
      { type: "button", class: "sg-renderer-datepicker-nav" },
      document.createTextNode("‹")
    ), T = u(
      "span",
      { class: "sg-renderer-datepicker-title" },
      document.createTextNode(`${$r[y]} ${_}`)
    ), M = u(
      "button",
      { type: "button", class: "sg-renderer-datepicker-nav" },
      document.createTextNode("›")
    );
    C.append(k, T, M);
    const $ = u("div", { class: "sg-renderer-datepicker-dows" });
    for (let B = 0; B < 7; B++)
      $.append(u(
        "span",
        { class: "sg-renderer-datepicker-dow" },
        document.createTextNode(Er[(B + c) % 7])
      ));
    const L = u("div", { class: "sg-renderer-datepicker-grid" }), D = (new Date(_, y, 1).getDay() - c + 7) % 7, P = new Date(_, y, 1 - D), F = /* @__PURE__ */ new Date();
    for (let B = 0; B < 42; B++) {
      const H = new Date(P.getFullYear(), P.getMonth(), P.getDate() + B), Y = H.getMonth() === y, J = ae(H, i), q = ae(H, o), Q = i && o && H > i && H < o, O = ae(H, F), R = ["sg-renderer-datepicker-day"];
      Y || R.push("is-other-month"), (J || q) && R.push("is-selected"), Q && R.push("is-in-range"), O && R.push("is-today");
      const G = u(
        "button",
        { type: "button", class: R.join(" "), title: ye(H) },
        document.createTextNode(String(H.getDate()))
      );
      G.addEventListener("click", () => f(H)), L.append(G);
    }
    return w.append(C, $, L), { wrap: w, prev: k, next: M };
  }
  function h() {
    d.replaceChildren();
    const _ = u("div", { class: "sg-renderer-daterange-months" }), y = l === 11 ? a + 1 : a, w = (l + 1) % 12, C = g(a, l), k = g(y, w);
    C.prev.addEventListener("click", () => {
      l === 0 ? (l = 11, a -= 1) : l -= 1, h();
    }), k.next.addEventListener("click", () => {
      l === 11 ? (l = 0, a += 1) : l += 1, h();
    }), C.next.style.visibility = "hidden", k.prev.style.visibility = "hidden", _.append(C.wrap, k.wrap);
    const T = u("div", { class: "sg-renderer-datepicker-footer" }), M = u(
      "button",
      { type: "button", class: "sg-renderer-datepicker-clear" },
      document.createTextNode("Clear")
    ), $ = u(
      "button",
      { type: "button", class: "sg-renderer-timepicker-ok" },
      document.createTextNode("Set")
    );
    M.addEventListener("click", () => {
      i = null, o = null, p();
    }), $.addEventListener("click", p), T.append(M, $), d.append(_, T);
  }
  function b(_) {
    _.key === "Escape" && (_.stopPropagation(), ke()), _.key === "Enter" && (_.stopPropagation(), _.preventDefault(), p());
  }
  function m(_) {
    !d.contains(_.target) && !t.contains(_.target) && ke();
  }
  document.addEventListener("keydown", b), setTimeout(() => document.addEventListener("mousedown", m), 0), document.body.appendChild(d), h(), W(d, t), Oe = { pop: d, onKey: b, onDocClick: m, anchor: t };
}
function ke() {
  if (!Oe) return;
  const { pop: t, onKey: r, onDocClick: e, anchor: n } = Oe;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), t.remove(), Oe = null, te(n);
}
const Mr = [
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
function Dr({
  palette: t = Mr,
  shape: r = "circle",
  showLabel: e = !1,
  size: n = 14,
  editable: s = !0,
  empty: i = "—"
} = {}) {
  return (o) => {
    const { value: a, td: l } = o, c = o?.col?.cellRendererConfig || {}, d = c.palette || t, p = c.shape ?? r, f = c.showLabel ?? e, g = c.size ?? n, h = c.editable ?? s;
    if (l && (l.classList.add("sg-renderer-colorpicker-cell"), l._sgPickerPalette = d), h && l && !l._sgPickerBound && (l._sgPickerBound = !0, l.addEventListener("dblclick", (_) => {
      _._sgPickerHandled || (_._sgPickerHandled = !0, _.stopPropagation(), ha(l, o));
    })), S(a)) return i;
    const b = u("span", { class: "sg-renderer-swatch" }), m = String(a).toLowerCase() === "#ffffff" ? " border: 1px solid #d1d5db;" : "";
    return b.append(u("span", {
      class: `sg-renderer-swatch-chip is-${p}`,
      style: `width: ${g}px; height: ${g}px; background: ${a};${m}`,
      title: a
    })), f && b.append(u("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(a))), b;
  };
}
let Ge = null;
function ha(t, r) {
  $e();
  const e = t._sgPickerPalette || Mr, { row: n, col: s } = r, i = n && s?.field != null ? n[s.field] : null, o = u("div", { class: "sg-renderer-colorpicker-popover", role: "dialog" });
  o.addEventListener("mousedown", (m) => m.stopPropagation());
  function a(m) {
    const { api: _ } = r, y = n && s?.field != null ? n[s.field] : null;
    n && s?.field != null && (n[s.field] = m), _?.applyTransaction && _.applyTransaction({ update: [n] });
    const w = t.closest('[data-controller~="grid"]');
    w && w.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: n?.id ?? n?._sg_id, colId: s?.field, oldValue: y, newValue: m }
    })), $e();
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
    if (m.key === "Escape" && (m.stopPropagation(), $e()), m.key === "Enter") {
      m.stopPropagation();
      const _ = /^#[0-9a-fA-F]{6}$/.test(p.value) ? p.value : d.value;
      a(_);
    }
  }
  function b(m) {
    !o.contains(m.target) && !t.contains(m.target) && $e();
  }
  document.addEventListener("keydown", h), setTimeout(() => document.addEventListener("mousedown", b), 0), document.body.appendChild(o), W(o, t), Ge = { pop: o, onKey: h, onDocClick: b, anchor: t };
}
function $e() {
  if (!Ge) return;
  const { pop: t, onKey: r, onDocClick: e, anchor: n } = Ge;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), t.remove(), Ge = null, te(n);
}
function Rr({
  lines: t = 3,
  rows: r = 6,
  cols: e = 48,
  separator: n = `
`,
  editable: s = !0,
  empty: i = ""
} = {}) {
  return (o) => {
    const { value: a, td: l } = o, c = o?.col?.cellRendererConfig || {}, d = c.lines ?? t, p = c.rows ?? r, f = c.cols ?? e, g = c.separator ?? n, h = c.editable ?? s;
    if (l && (l.classList.add("sg-renderer-multiline"), l._sgTextareaRows = p, l._sgTextareaCols = f, l._sgTextareaSep = g), h && l && !l._sgTextareaBound && (l._sgTextareaBound = !0, l.addEventListener("dblclick", (m) => {
      m._sgTextareaHandled || (m._sgTextareaHandled = !0, m.stopPropagation(), ma(l, o));
    })), S(a)) return i;
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
let ze = null;
function ma(t, r) {
  ie();
  const e = t._sgTextareaRows || 6, n = t._sgTextareaCols || 48, { row: s, col: i } = r, o = s && i?.field != null ? s[i.field] : "", a = u("div", { class: "sg-renderer-textarea-popover", role: "dialog" });
  a.addEventListener("mousedown", (m) => m.stopPropagation());
  const l = u("textarea", { class: "sg-renderer-textarea-input", rows: e, cols: n });
  l.value = o == null ? "" : String(o);
  function c() {
    const { api: m } = r, _ = l.value, y = s && i?.field != null ? s[i.field] : null;
    s && i?.field != null && (s[i.field] = _), m?.applyTransaction && m.applyTransaction({ update: [s] });
    const w = t.closest('[data-controller~="grid"]');
    w && w.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
      bubbles: !0,
      detail: { rowId: s?.id ?? s?._sg_id, colId: i?.field, oldValue: y, newValue: _ }
    })), ie();
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
  f.addEventListener("click", () => ie()), g.addEventListener("click", c), d.append(p, f, g), a.append(l, d), l.addEventListener("keydown", (m) => {
    m.key === "Enter" && (m.metaKey || m.ctrlKey) ? (m.preventDefault(), c()) : m.key === "Escape" && (m.stopPropagation(), ie());
  });
  function h(m) {
    m.key === "Escape" && (m.stopPropagation(), ie());
  }
  function b(m) {
    !a.contains(m.target) && !t.contains(m.target) && ie();
  }
  document.addEventListener("keydown", h), setTimeout(() => document.addEventListener("mousedown", b), 0), document.body.appendChild(a), W(a, t), setTimeout(() => {
    l.focus(), l.setSelectionRange(l.value.length, l.value.length);
  }, 0), ze = { pop: a, onKey: h, onDocClick: b, anchor: t };
}
function ie() {
  if (!ze) return;
  const { pop: t, onKey: r, onDocClick: e, anchor: n } = ze;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), t.remove(), ze = null, te(n);
}
function Xe(t, r, e, n) {
  const s = t?.closest('[data-controller~="grid"]');
  s && s.dispatchEvent(new CustomEvent("grid:rowAction", {
    bubbles: !0,
    detail: {
      action: e,
      rowId: r.row?.id ?? r.row?._sg_id,
      row: r.row,
      col: r.col,
      ...n
    }
  }));
}
function Ir({
  label: t = "Go",
  icon: r = null,
  variant: e = "primary",
  action: n = null,
  onClick: s = null,
  disabled: i = !1
} = {}) {
  return (o) => {
    const { td: a, row: l } = o, c = o?.col?.cellRendererConfig || {}, d = c.label ?? t, p = c.icon ?? r, f = c.variant ?? e, g = c.action ?? n, h = typeof i == "function" ? i(l) : c.disabled ?? i;
    a && a.classList.add("sg-renderer-action-cell");
    const b = u("button", {
      type: "button",
      class: `sg-renderer-action-btn is-${f}`,
      disabled: h ? "" : null
    });
    return p && b.append(u("span", { class: "sg-renderer-action-icon", "aria-hidden": "true" }, p)), b.append(u("span", { class: "sg-renderer-action-label" }, document.createTextNode(d))), b.addEventListener("click", (m) => {
      m.stopPropagation(), !h && (typeof s == "function" && s(l, o), g && Xe(a, o, g));
    }), b;
  };
}
const ba = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="3" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="13" r="1.5" fill="currentColor"/></svg>';
function Pr({
  items: t = [],
  icon: r = ba,
  ariaLabel: e = "Open menu"
} = {}) {
  return (n) => {
    const { td: s } = n, i = n?.col?.cellRendererConfig || {}, o = i.items || t, a = i.icon ?? r;
    s && (s.classList.add("sg-renderer-menu-cell"), s._sgMenuItems = o);
    const l = u("button", {
      type: "button",
      class: "sg-renderer-menu-trigger",
      "aria-label": i.ariaLabel ?? e
    }, a);
    return l.addEventListener("click", (c) => {
      c.stopPropagation(), Vr(s, n, o);
    }), l;
  };
}
let je = null;
function Vr(t, r, e) {
  Ee();
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
      a.disabled || (Ee(), typeof a.onClick == "function" && a.onClick(r.row, r), a.action && Xe(t, r, a.action));
    }), n.append(c);
  }
  function s(o) {
    o.key === "Escape" && (o.stopPropagation(), Ee());
  }
  function i(o) {
    !n.contains(o.target) && !t.contains(o.target) && Ee();
  }
  document.addEventListener("keydown", s), setTimeout(() => document.addEventListener("mousedown", i), 0), document.body.appendChild(n), W(n, t), je = { pop: n, onKey: s, onDocClick: i, anchor: t };
}
function Ee() {
  if (!je) return;
  const { pop: t, onKey: r, onDocClick: e, anchor: n } = je;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), t.remove(), je = null, te(n);
}
function Fr({
  primary: t = { label: "Go", action: null, icon: null },
  items: r = [],
  variant: e = "primary"
} = {}) {
  return (n) => {
    const { td: s } = n, i = n?.col?.cellRendererConfig || {}, o = i.primary || t, a = i.items || r, l = i.variant ?? e;
    s && s.classList.add("sg-renderer-splitbtn-cell");
    const c = u("span", { class: `sg-renderer-splitbtn is-${l}`, role: "group" }), d = u("button", { type: "button", class: "sg-renderer-splitbtn-main" });
    o.icon && d.append(u("span", { class: "sg-renderer-action-icon", "aria-hidden": "true" }, o.icon)), d.append(u("span", { class: "sg-renderer-action-label" }, document.createTextNode(o.label))), d.addEventListener("click", (f) => {
      f.stopPropagation(), typeof o.onClick == "function" && o.onClick(n.row, n), o.action && Xe(s, n, o.action);
    });
    const p = u(
      "button",
      { type: "button", class: "sg-renderer-splitbtn-caret", "aria-label": "More actions" },
      document.createTextNode("▾")
    );
    return p.addEventListener("click", (f) => {
      f.stopPropagation(), Vr(p, n, a);
    }), c.append(d, p), c;
  };
}
const ya = [
  { name: "edit", label: "Edit", icon: "✎" },
  { name: "duplicate", label: "Duplicate", icon: "⧉" },
  { name: "delete", label: "Delete", icon: "✕", danger: !0 }
];
function Br({
  actions: t = ya
} = {}) {
  return (r) => {
    const { td: e } = r, s = (r?.col?.cellRendererConfig || {}).actions || t;
    e && e.classList.add("sg-renderer-rowactions-cell");
    const i = u("span", { class: "sg-renderer-rowactions" });
    for (const o of s) {
      const a = u("button", {
        type: "button",
        class: `sg-renderer-rowactions-btn${o.danger ? " is-danger" : ""}`,
        title: o.label,
        "aria-label": o.label
      }, o.icon || o.label);
      a.addEventListener("click", (l) => {
        l.stopPropagation(), typeof o.onClick == "function" && o.onClick(r.row, r), o.name && Xe(e, r, o.name);
      }), i.append(a);
    }
    return i;
  };
}
const wa = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="6" cy="3" r="1.2" fill="currentColor"/><circle cx="10" cy="3" r="1.2" fill="currentColor"/><circle cx="6" cy="8" r="1.2" fill="currentColor"/><circle cx="10" cy="8" r="1.2" fill="currentColor"/><circle cx="6" cy="13" r="1.2" fill="currentColor"/><circle cx="10" cy="13" r="1.2" fill="currentColor"/></svg>';
function Hr({ label: t = "Drag to reorder" } = {}) {
  return (r) => {
    const { td: e } = r;
    e && e.classList.add("sg-renderer-draghandle-cell");
    const n = u("span", {
      class: "sg-renderer-draghandle",
      title: t,
      "aria-label": t,
      role: "button",
      tabindex: 0,
      draggable: "true"
    }, wa);
    return n.addEventListener("mousedown", (s) => {
      s.stopPropagation();
      const i = e?.closest('[data-controller~="grid"]');
      i && i.dispatchEvent(new CustomEvent("grid:rowDragStart", {
        bubbles: !0,
        detail: { rowId: r.row?.id ?? r.row?._sg_id, row: r.row, event: s }
      }));
    }), n;
  };
}
function Or({ startAt: t = 1, padTo: r = 0 } = {}) {
  return (e) => {
    const { td: n, row: s } = e;
    let i = s && typeof s._sg_idx == "number" ? s._sg_idx + 1 : null;
    if (i == null && n) {
      const a = n.closest("tr"), l = a?.parentElement;
      if (a && l) {
        const d = Array.from(l.querySelectorAll("tr")).indexOf(a);
        d >= 0 && (i = d + 1);
      }
    }
    i == null && (i = t), n && n.classList.add("sg-renderer-rownumber-cell");
    const o = r > 0 ? String(i).padStart(r, "0") : String(i);
    return u("span", { class: "sg-renderer-rownumber" }, document.createTextNode(o));
  };
}
function Gr() {
  return (t) => {
    const { td: r, row: e } = t;
    r && r.classList.add("sg-renderer-expandtoggle-cell");
    const n = !!(e && e._sg_expanded), s = u("button", {
      type: "button",
      class: `sg-renderer-expandtoggle${n ? " is-open" : ""}`,
      "aria-label": n ? "Collapse row" : "Expand row",
      "aria-expanded": n ? "true" : "false"
    }, Yt);
    return s.addEventListener("click", (i) => {
      i.stopPropagation();
      const o = !n;
      e && (e._sg_expanded = o), s.classList.toggle("is-open", o), s.setAttribute("aria-expanded", o ? "true" : "false"), s.setAttribute("aria-label", o ? "Collapse row" : "Expand row");
      const a = r?.closest('[data-controller~="grid"]');
      a && a.dispatchEvent(new CustomEvent("grid:rowToggleExpand", {
        bubbles: !0,
        detail: { rowId: e?.id ?? e?._sg_id, row: e, expanded: o }
      }));
    }), s;
  };
}
const _a = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
function va(t) {
  const r = String(t).toLowerCase();
  return r.length <= 13 ? r : `${r.slice(0, 8)}…${r.slice(-4)}`;
}
function zr({ short: t = !0, copy: r = !0 } = {}) {
  return ({ value: e, td: n }) => {
    if (S(e)) return "";
    n && n.classList.add("sg-renderer-uuid-cell");
    const s = String(e), i = _a.test(s), o = t ? va(s) : s, a = u("span", {
      class: `sg-renderer-uuid${i ? "" : " is-invalid"}`,
      title: s
    });
    if (a.append(u(
      "code",
      { class: "sg-renderer-uuid-mono" },
      document.createTextNode(o)
    )), r) {
      const l = u("button", {
        type: "button",
        class: "sg-renderer-copyable-btn",
        title: "Copy",
        "aria-label": "Copy UUID"
      }, document.createTextNode("⧉"));
      l.addEventListener("click", (c) => {
        c.stopPropagation(), navigator.clipboard?.writeText && navigator.clipboard.writeText(s).then(() => {
          l.classList.add("is-copied"), setTimeout(() => l.classList.remove("is-copied"), 900);
        });
      }), a.append(l);
    }
    return a;
  };
}
const Ca = /^[0-9a-f]{4,64}$/i;
function jr({ length: t = 7, href: r = null, copy: e = !0 } = {}) {
  return ({ value: n, td: s }) => {
    if (S(n)) return "";
    s && s.classList.add("sg-renderer-gitsha-cell"), s?._sgPickerPalette;
    const i = String(n).trim(), o = Ca.test(i), a = o ? i.slice(0, t) : i, l = u("span", {
      class: `sg-renderer-uuid${o ? "" : " is-invalid"}`,
      title: i
    }), c = r ? u("a", { class: "sg-renderer-uuid-mono", href: typeof r == "function" ? r(i) : `${r}${i}`, target: "_blank", rel: "noopener noreferrer" }) : u("code", { class: "sg-renderer-uuid-mono" });
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
const xa = /^(?:[0-9a-f]{2}[:-]?){5}[0-9a-f]{2}$|^(?:[0-9a-f]{4}\.){2}[0-9a-f]{4}$/i;
function Ur({ vendorLookup: t = null } = {}) {
  return ({ value: r, td: e }) => {
    if (S(r)) return "";
    e && e.classList.add("sg-renderer-mac-cell");
    const n = String(r).trim(), s = xa.test(n), i = n.replace(/[^0-9a-f]/gi, "").toLowerCase(), o = i.length === 12 ? `${i.slice(0, 2)}:${i.slice(2, 4)}:${i.slice(4, 6)}:${i.slice(6, 8)}:${i.slice(8, 10)}:${i.slice(10, 12)}` : n, a = i.slice(0, 6), l = typeof t == "function" ? t(a) : null;
    return u("span", {
      class: `sg-renderer-uuid${s ? "" : " is-invalid"}`,
      title: l ? `${o} — ${l}` : o
    }, u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(o)));
  };
}
function Kr({ groups: t = 4, groupLen: r = 4, mask: e = !1 } = {}) {
  return ({ value: n, td: s }) => {
    if (S(n)) return "";
    s && s.classList.add("sg-renderer-license-cell");
    const i = s?._sgLicCfg || {}, o = i.groups || t, a = i.groupLen || r, l = String(n).replace(/[^a-z0-9]/gi, "").toUpperCase(), c = [];
    for (let f = 0; f < l.length; f += a) c.push(l.slice(f, f + a));
    const d = c.slice(0, o).join("-"), p = e ? d.split("-").map((f, g) => g === c.length - 1 ? f : f.replace(/./g, "•")).join("-") : d;
    return u(
      "span",
      { class: "sg-renderer-uuid", title: d },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(p))
    );
  };
}
const Sa = /^[A-HJ-NPR-Z0-9]{17}$/;
function qr({} = {}) {
  return ({ value: t, td: r }) => {
    if (S(t)) return "";
    r && r.classList.add("sg-renderer-vin-cell");
    const e = String(t).trim().toUpperCase(), n = Sa.test(e), s = n ? `${e.slice(0, 3)} ${e.slice(3, 9)} ${e.slice(9)}` : e;
    return u(
      "span",
      { class: `sg-renderer-uuid${n ? "" : " is-invalid"}`, title: e },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(s))
    );
  };
}
function La(t) {
  return t.length !== 13 ? t : `${t.slice(0, 3)}-${t.slice(3, 4)}-${t.slice(4, 8)}-${t.slice(8, 12)}-${t.slice(12)}`;
}
function ka(t) {
  return t.length !== 10 ? t : `${t.slice(0, 1)}-${t.slice(1, 4)}-${t.slice(4, 9)}-${t.slice(9)}`;
}
function Wr({} = {}) {
  return ({ value: t, td: r }) => {
    if (S(t)) return "";
    r && r.classList.add("sg-renderer-isbn-cell");
    const e = String(t).replace(/[^\dXx]/g, "");
    let n, s;
    return e.length === 13 ? (n = La(e), s = /^\d{13}$/.test(e)) : e.length === 10 ? (n = ka(e), s = /^\d{9}[\dXx]$/.test(e)) : (n = String(t), s = !1), u(
      "span",
      { class: `sg-renderer-uuid${s ? "" : " is-invalid"}`, title: String(t) },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(n))
    );
  };
}
const $a = /* @__PURE__ */ new Set(["B", "I", "EM", "STRONG", "U", "S", "DEL", "CODE", "A", "BR", "SPAN"]);
function Ea(t) {
  const r = document.createElement("template");
  r.innerHTML = t;
  function e(n) {
    const s = Array.from(n.childNodes);
    for (const i of s) {
      if (i.nodeType === 3) continue;
      if (i.nodeType !== 1) {
        i.remove();
        continue;
      }
      const o = i.tagName;
      if (!$a.has(o)) {
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
  return e(r.content), r.innerHTML;
}
function Yr({} = {}) {
  return ({ value: t, td: r }) => {
    if (S(t)) return "";
    r && r.classList.add("sg-renderer-html-cell");
    const e = u("span", { class: "sg-renderer-html" });
    return e.innerHTML = Ea(String(t)), e;
  };
}
function Zr({ maxLines: t = 4 } = {}) {
  return ({ value: r, td: e }) => {
    if (S(r)) return "";
    e && e.classList.add("sg-renderer-yaml-cell");
    const n = typeof r == "string" ? r : JSON.stringify(r, null, 2), s = u("pre", {
      class: "sg-renderer-yaml",
      style: `--sg-multiline-lines: ${t};`,
      title: n
    });
    return s.textContent = n, s;
  };
}
function Xr({ maxLines: t = 4 } = {}) {
  return ({ value: r, td: e }) => {
    if (S(r)) return "";
    e && e.classList.add("sg-renderer-xml-cell");
    const n = String(r), s = u("pre", {
      class: "sg-renderer-yaml",
      // share the yaml mono style
      style: `--sg-multiline-lines: ${t};`,
      title: n
    });
    return s.textContent = n, s;
  };
}
const Aa = /\bhttps?:\/\/[^\s<>"']+/g, Ta = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g;
function Jr({} = {}) {
  return ({ value: t, td: r }) => {
    if (S(t)) return "";
    r && r.classList.add("sg-renderer-autolink-cell");
    let e = we(String(t));
    e = e.replace(Aa, (s) => `<a class="sg-renderer-link" href="${s}" target="_blank" rel="noopener noreferrer">${s}</a>`), e = e.replace(Ta, (s) => `<a class="sg-renderer-link" href="mailto:${s}">${s}</a>`);
    const n = u("span", { class: "sg-renderer-autolink" });
    return n.innerHTML = e, n;
  };
}
function Qr({
  revealOnHold: t = !0
} = {}) {
  return ({ value: r, td: e }) => {
    if (e && e.classList.add("sg-renderer-redacted-cell"), S(r)) return "";
    const n = String(r), s = u("span", { class: "sg-renderer-redacted", title: t ? "Hold to reveal" : "" });
    if (s.append(u(
      "span",
      { class: "sg-renderer-redacted-text", "aria-hidden": "true" },
      document.createTextNode(n)
    )), t) {
      s.addEventListener("mousedown", (o) => {
        o.stopPropagation(), s.classList.add("is-revealed");
      });
      const i = () => s.classList.remove("is-revealed");
      document.addEventListener("mouseup", i), s.addEventListener("mouseleave", i);
    }
    return s;
  };
}
function es({} = {}) {
  return ({ value: t, td: r }) => {
    if (r && r.classList.add("sg-renderer-spoiler-cell"), S(t)) return "";
    const e = String(t), n = u("span", { class: "sg-renderer-spoiler", title: "Click to reveal" });
    return n.append(u(
      "span",
      { class: "sg-renderer-spoiler-text", "aria-hidden": "true" },
      document.createTextNode(e)
    )), n.addEventListener("click", (s) => {
      s.stopPropagation(), n.classList.add("is-revealed");
    }), n;
  };
}
function ts(t, r) {
  return r === 0 ? t : ts(r, t % r);
}
function Na(t, r = 16) {
  if (!Number.isFinite(t)) return null;
  const e = t < 0 ? "-" : "";
  t = Math.abs(t);
  const n = Math.floor(t), s = t - n;
  if (s < 1 / (r * 2)) return `${e}${n}`;
  let i = 1, o = 1, a = 1 / 0;
  for (let p = 1; p <= r; p++) {
    const f = Math.round(s * p), g = Math.abs(s - f / p);
    g < a && (i = f, o = p, a = g);
  }
  if (i === 0) return `${e}${n}`;
  if (i === o) return `${e}${n + 1}`;
  const l = ts(i, o), c = i / l, d = o / l;
  return n === 0 ? `${e}${c}/${d}` : `${e}${n} ${c}/${d}`;
}
function ns({ maxDenom: t = 16 } = {}) {
  return ({ value: r, td: e }) => {
    if (e && e.classList.add("sg-renderer-number"), S(r)) return "";
    const n = Number(r);
    return Number.isFinite(n) && Na(n, t) || String(r);
  };
}
const Ma = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
function Da(t) {
  return String(t).split("").map((r) => r === "-" ? "⁻" : Ma[Number(r)] || r).join("");
}
function rs({
  decimals: t = 2,
  pretty: r = !0
} = {}) {
  return ({ value: e, td: n }) => {
    if (n && n.classList.add("sg-renderer-number"), S(e)) return "";
    const s = Number(e);
    if (!Number.isFinite(s)) return String(e);
    if (s === 0) return "0";
    const i = Math.floor(Math.log10(Math.abs(s))), a = (s / Math.pow(10, i)).toFixed(t);
    return r ? `${a} × 10${Da(i)}` : s.toExponential(t);
  };
}
function Je({
  base: t = 16,
  prefix: r = !0,
  uppercase: e = !0,
  pad: n = 0
} = {}) {
  const s = { 2: "0b", 8: "0o", 16: "0x" };
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), S(i)) return "";
    const a = Number(i);
    if (!Number.isFinite(a) || !Number.isInteger(a)) return String(i);
    let l = Math.abs(a).toString(t);
    return e && (l = l.toUpperCase()), n > 0 && (l = l.padStart(n, "0")), r && s[t] && (l = s[t] + l), (a < 0 ? "-" : "") + l;
  };
}
function ss({
  population: t = null,
  decimals: r = 0
} = {}) {
  return ({ value: e, row: n, col: s, td: i }) => {
    if (i && i.classList.add("sg-renderer-percentile-cell"), S(e)) return "";
    const o = Number(e);
    if (!Number.isFinite(o)) return String(e);
    const a = typeof t == "function" ? t(n, s) : t;
    if (!Array.isArray(a) || a.length === 0) return String(e);
    const l = a.slice().sort((f, g) => f - g);
    let c = 0;
    for (const f of l) f < o && c++;
    const d = c / l.length * 100, p = u("span", { class: "sg-renderer-percentile" });
    return p.append(document.createTextNode(String(e))), p.append(u(
      "span",
      { class: "sg-renderer-percentile-tag" },
      document.createTextNode(`p${d.toFixed(r)}`)
    )), p;
  };
}
function is({
  showValue: t = !0
} = {}) {
  return ({ value: r, td: e }) => {
    if (e && e.classList.add("sg-renderer-battery-cell"), S(r)) return "";
    let n = Number(r);
    if (!Number.isFinite(n)) return String(r);
    n = Math.max(0, Math.min(100, n));
    const s = n < 15 ? "#ef4444" : n < 35 ? "#f59e0b" : "#22c55e", i = u("span", { class: "sg-renderer-battery", title: `${Math.round(n)}%` }), o = u("span", { class: "sg-renderer-battery-icon", "aria-hidden": "true" });
    return o.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 12" width="24" height="12"><rect x="0.5" y="0.5" width="20" height="11" rx="2" fill="none" stroke="#9ca3af"/><rect x="20.5" y="3" width="2.5" height="6" rx="0.5" fill="#9ca3af"/><rect x="2" y="2" width="${n / 100 * 17}" height="8" fill="${s}"/></svg>`, i.append(o), t && i.append(u(
      "span",
      { class: "sg-renderer-battery-pct" },
      document.createTextNode(`${Math.round(n)}%`)
    )), i;
  };
}
function os({
  bars: t = 4
} = {}) {
  return ({ value: r, td: e }) => {
    if (e && e.classList.add("sg-renderer-signal-cell"), S(r)) return "";
    const n = Number(r);
    if (!Number.isFinite(n)) return String(r);
    const s = n <= t ? Math.round(n) : Math.round(n / 100 * t), i = u("span", { class: "sg-renderer-signal", title: `${s}/${t}` });
    for (let o = 1; o <= t; o++)
      i.append(u("span", {
        class: `sg-renderer-signal-bar${o <= s ? " is-on" : ""}`,
        style: `height: ${4 + o * 2}px;`
      }));
    return i;
  };
}
const Ra = '<path fill="currentColor" d="M3 6v4h3l4 3V3L6 6H3z"/>', st = '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M12 6.5q1 1 0 3"/>', It = '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M14 5q2 2 0 6"/>', Ia = '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M16 3.5q3 3 0 9"/>', Pa = '<line x1="13" y1="4" x2="17" y2="9" stroke="currentColor" stroke-width="1.4"/><line x1="17" y1="4" x2="13" y2="9" stroke="currentColor" stroke-width="1.4"/>';
function as({
  showValue: t = !1
} = {}) {
  return ({ value: r, td: e }) => {
    if (e && e.classList.add("sg-renderer-volume-cell"), S(r)) return "";
    let n = Number(r);
    if (!Number.isFinite(n)) return String(r);
    n = Math.max(0, Math.min(100, n));
    let s = "";
    n === 0 ? s = Pa : n < 33 ? s = st : n < 66 ? s = st + It : s = st + It + Ia;
    const i = u("span", { class: "sg-renderer-volume", title: `${Math.round(n)}%` }), o = u("span", { class: "sg-renderer-volume-icon", "aria-hidden": "true" });
    return o.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 16" width="20" height="14">${Ra}${s}</svg>`, i.append(o), t && i.append(u(
      "span",
      { class: "sg-renderer-volume-pct" },
      document.createTextNode(`${Math.round(n)}%`)
    )), i;
  };
}
const Va = [
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
function ls(t, r) {
  const e = String(r || "").toLowerCase(), n = (t || "").toLowerCase().split(".").pop();
  for (const s of Va)
    if (e && s.match.test(e) || n && s.match.test(n)) return s.icon;
  return "📎";
}
function cs(t) {
  if (!Number.isFinite(t)) return "";
  const r = ["B", "KB", "MB", "GB", "TB"];
  let e = 0;
  for (; t >= 1024 && e < r.length - 1; )
    t /= 1024, e++;
  return `${e === 0 ? t : t.toFixed(1)} ${r[e]}`;
}
function ds(t) {
  return t == null || t === "" ? null : typeof t == "string" ? { url: t, filename: t.split("/").pop()?.split("?")[0] || t } : {
    url: t.url || t.src || t.href,
    filename: t.filename || t.name || (t.url ? t.url.split("/").pop()?.split("?")[0] : ""),
    content_type: t.content_type || t.contentType || t.mime_type || "",
    byte_size: t.byte_size ?? t.byteSize ?? t.size
  };
}
function us({
  showSize: t = !1
} = {}) {
  return ({ value: r, td: e }) => {
    e && e.classList.add("sg-renderer-file-cell");
    const n = ds(r);
    if (!n) return "";
    const s = ls(n.filename, n.content_type), i = u("a", {
      class: "sg-renderer-file",
      href: n.url || "#",
      target: "_blank",
      rel: "noopener noreferrer",
      title: n.filename
    });
    return i.append(u(
      "span",
      { class: "sg-renderer-file-icon", "aria-hidden": "true" },
      document.createTextNode(s)
    )), i.append(u(
      "span",
      { class: "sg-renderer-file-name" },
      document.createTextNode(n.filename || "file")
    )), t && n.byte_size && i.append(u(
      "span",
      { class: "sg-renderer-file-size" },
      document.createTextNode(cs(n.byte_size))
    )), i;
  };
}
const Fa = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1a1 1 0 011 1v6.586l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L7 8.586V2a1 1 0 011-1zm-6 11a1 1 0 011 1v1h10v-1a1 1 0 112 0v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2a1 1 0 011-1z"/></svg>';
function ps({
  label: t = "Download"
} = {}) {
  return ({ value: r, td: e }) => {
    e && e.classList.add("sg-renderer-download-cell");
    const n = ds(r);
    if (!n) return "";
    const s = u("a", {
      class: "sg-renderer-link sg-renderer-download",
      href: n.url || "#",
      download: n.filename || "",
      title: n.filename
    }), i = u("span", { class: "sg-renderer-download-icon", "aria-hidden": "true" });
    i.innerHTML = Fa, s.append(i);
    let o = t;
    return n.byte_size && (o += ` (${cs(n.byte_size)})`), s.append(u("span", {}, document.createTextNode(o))), s;
  };
}
function fs({ size: t = 18 } = {}) {
  return ({ value: r, td: e }) => {
    if (e && e.classList.add("sg-renderer-mime-icon-cell"), S(r)) return "";
    const n = typeof r == "object" ? r : { content_type: String(r), filename: String(r) }, s = ls(n.filename, n.content_type);
    return u("span", {
      class: "sg-renderer-mime-icon",
      style: `font-size: ${t}px;`,
      title: n.content_type || n.filename || ""
    }, document.createTextNode(s));
  };
}
function gs({
  max: t = 5,
  thumbSize: r = 40
} = {}) {
  return ({ value: e, td: n }) => {
    if (n && n.classList.add("sg-renderer-gallery-cell"), S(e)) return "";
    const s = (Array.isArray(e) ? e : [e]).map((l) => typeof l == "string" ? { url: l } : l).filter((l) => l && l.url);
    if (!s.length) return "";
    const i = u("span", { class: "sg-renderer-gallery" }), o = s.slice(0, t);
    for (const l of o)
      i.append(u("img", {
        src: l.url,
        alt: l.alt || "",
        class: "sg-renderer-gallery-thumb",
        loading: "lazy",
        decoding: "async",
        style: `width: ${r}px; height: ${r}px;`
      }));
    const a = s.length - o.length;
    return a > 0 && i.append(u("span", {
      class: "sg-renderer-gallery-more",
      style: `width: ${r}px; height: ${r}px; font-size: ${r / 3}px;`,
      title: s.slice(t).map((l) => l.alt).filter(Boolean).join(", ")
    }, document.createTextNode(`+${a}`))), i;
  };
}
function Ba(t) {
  let r = 0;
  for (let e = 0; e < t.length; e++) r = (r << 5) - r + t.charCodeAt(e);
  return () => (r = (r * 9301 + 49297) % 233280, r / 233280);
}
function hs({
  width: t = 100,
  height: r = 24,
  bars: e = 28,
  color: n = "#3b82f6"
} = {}) {
  return ({ value: s, td: i }) => {
    if (i && i.classList.add("sg-renderer-waveform-cell"), S(s)) return "";
    let o;
    if (Array.isArray(s))
      o = s.map(Number);
    else {
      const f = Ba(String(s));
      o = Array.from({ length: e }, () => 0.2 + f() * 0.8);
    }
    const a = Math.min(e, o.length), l = t / a, c = Math.max(0.6, l * 0.25);
    let d = "";
    for (let f = 0; f < a; f++) {
      const h = Math.max(0.05, Math.min(1, o[f])) * r, b = f * l + c / 2, m = (r - h) / 2;
      d += `<rect x="${b.toFixed(2)}" y="${m.toFixed(2)}" width="${(l - c).toFixed(2)}" height="${h.toFixed(2)}" rx="0.6" fill="${n}"/>`;
    }
    const p = u("span", { class: "sg-renderer-waveform" });
    return p.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${r}" width="${t}" height="${r}">${d}</svg>`, p;
  };
}
function ms({
  newTab: t = !0,
  size: r = 14,
  faviconUrl: e = (n) => `https://www.google.com/s2/favicons?domain=${n}&sz=64`
} = {}) {
  return ({ value: n }) => {
    if (S(n)) return "";
    const s = String(n);
    let i;
    try {
      i = new URL(s);
    } catch {
      return document.createTextNode(s);
    }
    const o = u("a", {
      class: "sg-renderer-link sg-renderer-favicon",
      href: s,
      target: t ? "_blank" : null,
      rel: t ? "noopener noreferrer" : null,
      title: s
    });
    return o.append(u("img", {
      src: e(i.hostname),
      alt: "",
      width: r,
      height: r,
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
function bs({
  stripWww: t = !0,
  link: r = !0,
  newTab: e = !0
} = {}) {
  return ({ value: n }) => {
    if (S(n)) return "";
    const s = String(n);
    let i;
    try {
      i = new URL(/^https?:/.test(s) ? s : `http://${s}`);
    } catch {
      return document.createTextNode(s);
    }
    let o = i.hostname;
    return t && (o = o.replace(/^www\./, "")), r ? u("a", {
      class: "sg-renderer-link",
      href: i.toString(),
      target: e ? "_blank" : null,
      rel: e ? "noopener noreferrer" : null,
      title: s
    }, document.createTextNode(o)) : o;
  };
}
const Pt = {
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
function ys({} = {}) {
  return ({ value: t }) => {
    if (S(t)) return "";
    const r = String(t);
    let e;
    try {
      e = new URL(/^https?:/.test(r) ? r : `https://${r}`);
    } catch {
      return document.createTextNode(r);
    }
    const n = e.hostname.replace(/^www\./, ""), s = Pt[n] || Object.entries(Pt).find(([l]) => n.endsWith(`.${l}`))?.[1], i = e.pathname.replace(/^\//, "").split("/")[0] || n, o = s ? `@${i}` : e.hostname + e.pathname, a = u("a", {
      class: "sg-renderer-link sg-renderer-social",
      href: e.toString(),
      target: "_blank",
      rel: "noopener noreferrer",
      title: `${s?.name || n} — ${r}`
    });
    return s && a.append(u(
      "span",
      { class: "sg-renderer-social-icon", "aria-hidden": "true" },
      document.createTextNode(s.icon)
    )), a.append(u(
      "span",
      { class: "sg-renderer-social-label" },
      document.createTextNode(o)
    )), a;
  };
}
const Vt = {
  auspost: { name: "AusPost", re: /^([A-Z]{2}\d{9,12}AU|[A-Z0-9]{12,14})$/, track: (t) => `https://auspost.com.au/mypost/track/#/details/${t}` },
  usps: { name: "USPS", re: /^(94|93|92|94|95)\d{20,22}$/, track: (t) => `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${t}` },
  fedex: { name: "FedEx", re: /^(\d{12}|\d{15}|\d{20})$/, track: (t) => `https://www.fedex.com/fedextrack/?tracknumbers=${t}` },
  ups: { name: "UPS", re: /^1Z[A-Z0-9]{16}$/i, track: (t) => `https://www.ups.com/track?tracknum=${t}` },
  dhl: { name: "DHL", re: /^\d{10,11}$/, track: (t) => `https://www.dhl.com/au-en/home/tracking/tracking-express.html?submit=1&tracking-id=${t}` },
  royalmail: { name: "Royal Mail", re: /^[A-Z]{2}\d{9}GB$/, track: (t) => `https://www.royalmail.com/track-your-item#/tracking-results/${t}` }
};
function ws({
  carrier: t = null
} = {}) {
  return ({ value: r, row: e, td: n }) => {
    if (S(r)) return "";
    n && n.classList.add("sg-renderer-tracking-cell");
    const s = String(r).trim().toUpperCase(), i = (t || e && e.carrier)?.toString().toLowerCase();
    let o = i ? Vt[i] : null;
    if (!o) {
      for (const l of Object.values(Vt))
        if (l.re.test(s)) {
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
      href: o.track(s),
      target: "_blank",
      rel: "noopener noreferrer"
    }, document.createTextNode(s)))) : a.append(u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(s))), a;
  };
}
function Ha(t) {
  try {
    const r = new URL(t), e = r.hostname.replace(/^www\./, "");
    if (e === "youtube.com" || e === "m.youtube.com") {
      const n = r.searchParams.get("v");
      if (n) return { provider: "youtube", id: n };
    }
    if (e === "youtu.be") {
      const n = r.pathname.slice(1);
      if (n) return { provider: "youtube", id: n };
    }
    if (e === "vimeo.com") {
      const n = r.pathname.replace(/^\//, "").split("/")[0];
      if (/^\d+$/.test(n)) return { provider: "vimeo", id: n };
    }
    return null;
  } catch {
    return null;
  }
}
function _s({} = {}) {
  return ({ value: t, row: r, td: e }) => {
    if (S(t)) return "";
    e && e.classList.add("sg-renderer-videolink-cell");
    const n = Ha(String(t));
    if (!n) return u(
      "a",
      { class: "sg-renderer-link", href: String(t), target: "_blank", rel: "noopener noreferrer" },
      document.createTextNode(String(t))
    );
    const s = u("a", {
      class: "sg-renderer-link sg-renderer-videolink",
      href: String(t),
      target: "_blank",
      rel: "noopener noreferrer"
    }), i = n.provider === "youtube" ? `https://i.ytimg.com/vi/${n.id}/default.jpg` : null;
    i ? s.append(u("img", {
      src: i,
      alt: "",
      class: "sg-renderer-videolink-thumb",
      loading: "lazy",
      decoding: "async"
    })) : s.append(u(
      "span",
      { class: "sg-pill sg-pill-blue sg-renderer-videolink-provider" },
      document.createTextNode(n.provider === "vimeo" ? "Vimeo" : "YouTube")
    ));
    const o = r?.title || n.id;
    return s.append(u(
      "span",
      { class: "sg-renderer-videolink-title" },
      document.createTextNode(o)
    )), r?.duration && s.append(u(
      "span",
      { class: "sg-renderer-videolink-duration" },
      document.createTextNode(String(r.duration))
    )), s;
  };
}
function vs({
  size: t = 12,
  color: r = "#9ca3af",
  label: e = "Loading"
} = {}) {
  return ({ value: n }) => n != null && n !== "" && n !== "loading" && n !== "…" ? String(n) : u("span", {
    class: "sg-renderer-spinner",
    style: `width: ${t}px; height: ${t}px; border-color: ${r}; border-top-color: transparent;`,
    "aria-label": e,
    role: "progressbar"
  });
}
const Oa = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zm0 3a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0V5.25A.75.75 0 008 4.5zm0 6.5a1 1 0 100 2 1 1 0 000-2z"/></svg>';
function Cs({
  icon: t = Oa,
  retryLabel: r = "Retry"
} = {}) {
  return (e) => {
    const { value: n, td: s } = e;
    if (S(n)) return "";
    s && s.classList.add("sg-renderer-error-cell");
    let i, o = null;
    n instanceof Error ? i = n.message : typeof n == "object" ? (i = n.message || String(n), o = n.retry) : i = String(n);
    const a = u("span", { class: "sg-renderer-error", title: i }), l = u("span", { class: "sg-renderer-error-icon", "aria-hidden": "true" });
    if (l.innerHTML = t, a.append(l), a.append(u("span", { class: "sg-renderer-error-msg" }, document.createTextNode(i))), typeof o == "function") {
      const c = u(
        "button",
        { type: "button", class: "sg-renderer-error-retry" },
        document.createTextNode(r)
      );
      c.addEventListener("click", (d) => {
        d.stopPropagation(), o(e.row, e);
      }), a.append(c);
    }
    return a;
  };
}
const Ga = {
  synced: { color: "green", icon: "✓", label: "Synced" },
  syncing: { color: "blue", icon: "↻", label: "Syncing", spin: !0 },
  pending: { color: "orange", icon: "◔", label: "Pending" },
  error: { color: "red", icon: "✕", label: "Sync error" },
  conflict: { color: "orange", icon: "⚡", label: "Conflict" },
  offline: { color: "gray", icon: "⌧", label: "Offline" }
};
function xs({} = {}) {
  return ({ value: t, td: r }) => {
    if (S(t)) return "";
    r && r.classList.add("sg-renderer-sync-cell");
    const e = String(t).toLowerCase(), n = Ga[e] || { color: "gray", icon: "·", label: String(t) }, s = u("span", { class: `sg-pill sg-pill-${n.color}`, title: n.label });
    return s.append(u("span", {
      class: `sg-renderer-sync-icon${n.spin ? " is-spinning" : ""}`,
      "aria-hidden": "true"
    }, document.createTextNode(n.icon))), s.append(u("span", { class: "sg-pill-label" }, document.createTextNode(n.label))), s;
  };
}
function Ss({
  timestampField: t = "updated_at",
  threshold: r = 3600 * 1e3,
  // 1 hour
  inner: e = null
  // wrap value via this child renderer
} = {}) {
  return (n) => {
    const { row: s, value: i, td: o } = n;
    o && o.classList.add("sg-renderer-stale-cell");
    const a = s && t ? j(s[t]) : null, l = a ? Date.now() - a.getTime() > r : !1, c = u("span", { class: `sg-renderer-stale${l ? " is-stale" : ""}` });
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
function Ls({
  timestampField: t = "updated_at",
  freshFor: r = 5 * 1e3,
  inner: e = null
} = {}) {
  return (n) => {
    const { row: s, value: i, td: o } = n;
    o && o.classList.add("sg-renderer-fresh-cell");
    const a = s && t ? j(s[t]) : null, l = a ? Date.now() - a.getTime() < r : !1, c = u("span", { class: `sg-renderer-fresh${l ? " is-fresh" : ""}` });
    if (typeof e == "function") {
      const d = e(n);
      d != null && (typeof d == "string" ? c.innerHTML = d : d instanceof Node ? c.append(d) : c.append(document.createTextNode(String(d))));
    } else
      c.append(document.createTextNode(i == null ? "" : String(i)));
    return l && o && setTimeout(() => c.classList.remove("is-fresh"), r), c;
  };
}
function za(t) {
  if (t <= 0) return "expired";
  const r = Math.floor(t / 1e3), e = Math.floor(r / 86400), n = Math.floor(r % 86400 / 3600), s = Math.floor(r % 3600 / 60), i = r % 60;
  return e > 0 ? `${e}d ${n}h ${s}m` : n > 0 ? `${n}h ${s}m ${i}s` : s > 0 ? `${s}m ${i}s` : `${i}s`;
}
function ks({
  interval: t = 1e3,
  expiredText: r = "expired"
} = {}) {
  return ({ value: e, td: n }) => {
    if (n && n.classList.add("sg-renderer-countdown-cell"), S(e)) return "";
    const s = j(e);
    if (!s) return String(e);
    const i = u("span", { class: "sg-renderer-countdown", title: s.toLocaleString() });
    function o() {
      const c = s.getTime() - Date.now();
      i.textContent = c <= 0 ? r : za(c), i.classList.toggle("is-expired", c <= 0);
    }
    o();
    const a = setInterval(o, t), l = () => clearInterval(a);
    if (typeof MutationObserver == "function" && n) {
      const c = new MutationObserver(() => {
        document.body.contains(i) || (l(), c.disconnect());
      });
      c.observe(document.body, { childList: !0, subtree: !0 });
    }
    return i;
  };
}
function $s({
  asOfField: t = "as_of",
  unit: r = "years"
} = {}) {
  return ({ value: e, row: n, td: s }) => {
    if (s && s.classList.add("sg-renderer-age-cell"), S(e)) return "";
    const i = j(e);
    if (!i) return String(e);
    const o = n && t && n[t] ? j(n[t]) || /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(), a = o.getFullYear() - i.getFullYear() - (o.getMonth() < i.getMonth() || o.getMonth() === i.getMonth() && o.getDate() < i.getDate() ? 1 : 0);
    return String(a);
  };
}
function ja(t) {
  const r = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate()));
  r.setUTCDate(r.getUTCDate() + 4 - (r.getUTCDay() || 7));
  const e = new Date(Date.UTC(r.getUTCFullYear(), 0, 1));
  return Math.ceil(((r - e) / 864e5 + 1) / 7);
}
function Es({
  unit: t = "quarter",
  fiscalStartMonth: r = 7,
  format: e = null
} = {}) {
  return ({ value: n, td: s }) => {
    if (s && s.classList.add("sg-renderer-fiscal-cell"), S(n)) return "";
    const i = j(n);
    if (!i) return String(n);
    let o;
    switch (t) {
      case "week":
        o = `W${String(ja(i)).padStart(2, "0")} ${i.getFullYear()}`;
        break;
      case "month":
        o = new Intl.DateTimeFormat(void 0, { month: "short", year: "numeric" }).format(i);
        break;
      case "quarter": {
        o = `Q${Math.floor(i.getMonth() / 3) + 1} ${i.getFullYear()}`;
        break;
      }
      case "fiscalYear": {
        const a = r - 1, l = i.getMonth() >= a ? i.getFullYear() + 1 : i.getFullYear();
        o = `FY${String(l).slice(-2)}`;
        break;
      }
      default:
        o = i.toISOString().slice(0, 10);
    }
    return typeof e == "function" && (o = e(o, i)), u("span", { class: "sg-pill sg-pill-blue" }, document.createTextNode(o));
  };
}
function Ua(t, r = /* @__PURE__ */ new Date()) {
  try {
    return (new Intl.DateTimeFormat("en-US", { timeZone: t, timeZoneName: "shortOffset" }).formatToParts(r).find((i) => i.type === "timeZoneName")?.value || "").replace(/^GMT/, "UTC");
  } catch {
    return "";
  }
}
function As({
  withCity: t = !0
} = {}) {
  return ({ value: r, td: e }) => {
    if (e && e.classList.add("sg-renderer-tz-cell"), S(r)) return "";
    const n = String(r), s = Ua(n), i = t ? n.split("/").pop().replace(/_/g, " ") : n;
    return u(
      "span",
      { class: "sg-renderer-tz", title: n },
      u("span", { class: "sg-renderer-tz-city" }, document.createTextNode(i)),
      " ",
      u("span", { class: "sg-renderer-tz-offset" }, document.createTextNode(s ? `(${s})` : ""))
    );
  };
}
function Ka(t) {
  const r = String(t).trim().split(/\s+/);
  if (r.length !== 5) return null;
  const [e, n, s, i, o] = r, a = e === "*" && n === "*" && s === "*" && i === "*" && o === "*", l = /^\d+$/.test(e) && n === "*" && s === "*" && i === "*" && o === "*", c = /^\d+$/.test(e) && /^\d+$/.test(n) && s === "*" && i === "*" && o === "*", d = e === "0" && /^\*\/\d+$/.test(n) && s === "*" && i === "*" && o === "*", p = /^\d+$/.test(e) && /^\d+$/.test(n) && s === "*" && i === "*" && /^[0-6]$/.test(o), f = /^\d+$/.test(e) && /^\d+$/.test(n) && /^\d+$/.test(s) && i === "*" && o === "*", g = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return a ? "Every minute" : l ? `Hourly at :${e.padStart(2, "0")}` : d ? `Every ${n.split("/")[1]} hours` : c ? `Daily at ${n.padStart(2, "0")}:${e.padStart(2, "0")}` : p ? `Weekly on ${g[Number(o)]} at ${n.padStart(2, "0")}:${e.padStart(2, "0")}` : f ? `Monthly on day ${s} at ${n.padStart(2, "0")}:${e.padStart(2, "0")}` : null;
}
function Ts({} = {}) {
  return ({ value: t, td: r }) => {
    if (r && r.classList.add("sg-renderer-cron-cell"), S(t)) return "";
    const e = String(t).trim(), n = Ka(e), s = u("span", { class: "sg-renderer-cron" });
    return n ? (s.append(u("span", { class: "sg-renderer-cron-human" }, document.createTextNode(n))), s.append(u(
      "code",
      { class: "sg-renderer-uuid-mono sg-renderer-cron-expr" },
      document.createTextNode(e)
    ))) : s.append(u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(e))), s.title = e, s;
  };
}
function Ns({
  min: t = 0,
  max: r = 100,
  width: e = 56,
  height: n = 32,
  thickness: s = 6,
  color: i = "#3b82f6",
  trackColor: o = "#e5e7eb",
  showValue: a = !0,
  format: l = null
} = {}) {
  return ({ value: c, td: d }) => {
    if (d && d.classList.add("sg-renderer-gauge-cell"), S(c)) return "";
    let p = Number(c);
    if (!Number.isFinite(p)) return String(c);
    p = Math.max(t, Math.min(r, p));
    const f = (p - t) / Math.max(1e-9, r - t), g = e / 2, h = n, b = Math.min(g - s / 2, h - s / 2), m = Math.PI, _ = m + Math.PI * f, y = g + b * Math.cos(m), w = h + b * Math.sin(m), C = g + b * Math.cos(_), k = h + b * Math.sin(_), T = f > 0.5 ? 1 : 0, M = `M ${g - b},${h} A ${b},${b} 0 0 1 ${g + b},${h}`, $ = `M ${y},${w} A ${b},${b} 0 ${T} 1 ${C},${k}`, L = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    L.setAttribute("viewBox", `0 0 ${e} ${n + 2}`), L.setAttribute("width", e), L.setAttribute("height", n + 2);
    const E = document.createElementNS("http://www.w3.org/2000/svg", "path");
    E.setAttribute("d", M), E.setAttribute("stroke", o), E.setAttribute("stroke-width", s), E.setAttribute("fill", "none"), E.setAttribute("stroke-linecap", "round");
    const D = document.createElementNS("http://www.w3.org/2000/svg", "path");
    D.setAttribute("d", $), D.setAttribute("stroke", i), D.setAttribute("stroke-width", s), D.setAttribute("fill", "none"), D.setAttribute("stroke-linecap", "round"), L.append(E, D);
    const P = u("span", { class: "sg-renderer-gauge" });
    if (P.append(L), a) {
      const F = l || ((B) => String(B));
      P.append(u(
        "span",
        { class: "sg-renderer-gauge-value" },
        document.createTextNode(F(p))
      ));
    }
    return P;
  };
}
function Ms({
  width: t = 80,
  height: r = 18,
  winColor: e = "#22c55e",
  lossColor: n = "#ef4444",
  drawColor: s = "#9ca3af"
} = {}) {
  return ({ value: i, td: o }) => {
    if (o && o.classList.add("sg-renderer-winloss-cell"), S(i)) return "";
    const a = Array.isArray(i) ? i : String(i).split(",").map((g) => g.trim());
    if (!a.length) return "";
    const l = t / a.length, c = Math.max(0.5, l * 0.2), d = r / 2;
    let p = "";
    a.forEach((g, h) => {
      const b = typeof g == "number" ? g : g === "W" || g === "w" || g === "1" || g === !0 ? 1 : g === "L" || g === "l" || g === "-1" || g === !1 ? -1 : 0, m = h * l + c / 2, _ = l - c;
      b > 0 ? p += `<rect x="${m}" y="0" width="${_}" height="${d - 1}" fill="${e}"/>` : b < 0 ? p += `<rect x="${m}" y="${d + 1}" width="${_}" height="${d - 1}" fill="${n}"/>` : p += `<rect x="${m}" y="${d - 0.5}" width="${_}" height="1" fill="${s}"/>`;
    });
    const f = u("span", { class: "sg-renderer-winloss" });
    return f.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${r}" width="${t}" height="${r}">${p}</svg>`, f;
  };
}
function Ds({
  width: t = 100,
  height: r = 24,
  color: e = "#3b82f6",
  showLabels: n = !1
} = {}) {
  return ({ value: s, td: i }) => {
    if (i && i.classList.add("sg-renderer-minibar-cell"), S(s)) return "";
    const o = Array.isArray(s) ? s.map((h) => typeof h == "object" ? h : { value: Number(h) }) : [];
    if (!o.length) return "";
    const a = o.map((h) => Number(h.value) || 0), l = Math.max(1, ...a), c = o.length, d = t / c, p = Math.max(1, d * 0.18);
    let f = "";
    o.forEach((h, b) => {
      const m = b * d + p / 2, _ = d - p, w = (Number(h.value) || 0) / l * r;
      f += `<rect x="${m}" y="${r - w}" width="${_}" height="${w}" fill="${h.color || e}"/>`, n && h.label && (f += `<text x="${m + _ / 2}" y="${r - 1}" font-size="7" fill="#fff" text-anchor="middle">${String(h.label).slice(0, 3)}</text>`);
    });
    const g = u("span", { class: "sg-renderer-minibar" });
    return g.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${r}" width="${t}" height="${r}">${f}</svg>`, g;
  };
}
function Rs({
  width: t = 100,
  height: r = 24,
  palette: e = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ef4444"],
  smooth: n = !1
} = {}) {
  return ({ value: s, td: i }) => {
    if (i && i.classList.add("sg-renderer-miniline-cell"), S(s)) return "";
    let o = [];
    if (Array.isArray(s) && Array.isArray(s[0]) ? o = s.map((g, h) => ({ color: e[h % e.length], data: g })) : s && Array.isArray(s.series) ? o = s.series.map((g, h) => ({ color: g.color || e[h % e.length], data: g.data })) : Array.isArray(s) && (o = [{ color: e[0], data: s }]), !o.length) return "";
    const a = o.flatMap((g) => g.data.map(Number).filter(Number.isFinite)), l = Math.max(...a), c = Math.min(...a), d = Math.max(1e-9, l - c);
    let p = "";
    for (const g of o) {
      const h = g.data.map((b, m) => {
        const _ = m / Math.max(1, g.data.length - 1) * t, y = r - (Number(b) - c) / d * r;
        return `${_.toFixed(2)},${y.toFixed(2)}`;
      });
      p += `<polyline fill="none" stroke="${g.color}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" points="${h.join(" ")}"/>`;
    }
    const f = u("span", { class: "sg-renderer-miniline" });
    return f.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${r}" width="${t}" height="${r}">${p}</svg>`, f;
  };
}
const qa = '<svg viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M6 2l4 6H2z"/></svg>', Wa = '<svg viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M6 10L2 4h8z"/></svg>', Ya = '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="5" width="8" height="2" fill="currentColor"/></svg>';
function Is({
  width: t = 60,
  height: r = 16,
  showValue: e = !0,
  format: n = null
} = {}) {
  return ({ value: s, td: i }) => {
    if (i && i.classList.add("sg-renderer-trend-cell"), S(s)) return "";
    const o = typeof s == "object" ? s : { change: 0, series: [] }, a = Number(o.change ?? 0), l = a > 0 ? "up" : a < 0 ? "down" : "flat", c = u("span", { class: `sg-renderer-trend is-${l}` }), d = u("span", { class: "sg-renderer-trend-icon", "aria-hidden": "true" });
    if (d.innerHTML = l === "up" ? qa : l === "down" ? Wa : Ya, c.append(d), e) {
      const p = n || ((f) => `${f > 0 ? "+" : ""}${Number(f).toFixed(1)}%`);
      c.append(u(
        "span",
        { class: "sg-renderer-trend-pct" },
        document.createTextNode(p(a))
      ));
    }
    if (Array.isArray(o.series) && o.series.length) {
      const p = Math.max(...o.series), f = Math.min(...o.series), g = Math.max(1e-9, p - f), h = o.series.map((_, y) => {
        const w = y / Math.max(1, o.series.length - 1) * t, C = r - (Number(_) - f) / g * r;
        return `${w.toFixed(2)},${C.toFixed(2)}`;
      }).join(" "), b = l === "up" ? "#10b981" : l === "down" ? "#ef4444" : "#9ca3af", m = u("span", { class: "sg-renderer-trend-spark" });
      m.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${r}" width="${t}" height="${r}"><polyline fill="none" stroke="${b}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" points="${h}"/></svg>`, c.append(m);
    }
    return c;
  };
}
function Za(t, r) {
  const e = String(t).trim(), n = (r || "").toString().toUpperCase(), s = e.replace(/\D/g, "");
  switch (n) {
    case "AU":
    case "AUSTRALIA":
      return s.length === 4 ? s : e;
    case "US":
    case "USA":
    case "UNITED STATES":
      return s.length === 5 ? s : s.length === 9 ? `${s.slice(0, 5)}-${s.slice(5)}` : e;
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
function Ps({
  country: t = null,
  countryField: r = "country"
} = {}) {
  return ({ value: e, row: n, td: s }) => {
    if (S(e)) return "";
    s && s.classList.add("sg-renderer-postal-cell");
    const i = t || (n && r ? n[r] : null), o = Za(e, i);
    return u(
      "span",
      { class: "sg-renderer-uuid", title: o },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(o))
    );
  };
}
function Xa(t) {
  return t == null || t === "" ? null : typeof t == "string" ? { _raw: t.trim() } : typeof t != "object" ? null : {
    street: t.street || t.address1 || "",
    street2: t.street2 || t.address2 || "",
    city: t.city || "",
    state: (t.state || "").toUpperCase(),
    zip: t.zip || t.postcode || t.postal_code || ""
  };
}
function Vs({ empty: t = "" } = {}) {
  return ({ value: r, td: e }) => {
    e && e.classList.add("sg-renderer-address-cell");
    const n = Xa(r);
    if (!n) return t;
    if (n._raw)
      return u("span", { class: "sg-renderer-address" }, document.createTextNode(n._raw));
    const s = u("div", { class: "sg-renderer-address sg-renderer-address-us" }), i = [n.street, n.street2].filter(Boolean).join(", ");
    i && s.append(u("span", { class: "sg-address-line" }, document.createTextNode(i)));
    const o = [n.city, n.state].filter(Boolean).join(", ") + (n.zip ? ` ${n.zip}` : "");
    return o.trim() && (i && s.append(u("span", { class: "sg-address-sep" }, document.createTextNode(" · "))), s.append(u("span", { class: "sg-address-line" }, document.createTextNode(o.trim())))), s;
  };
}
function Ja(t) {
  return t == null || t === "" ? null : typeof t == "string" ? { _raw: t.trim() } : typeof t != "object" ? null : {
    line1: t.line1 || t.address1 || t.street || "",
    line2: t.line2 || t.address2 || t.street2 || "",
    city: t.city || "",
    region: t.region || t.state || "",
    postal_code: t.postal_code || t.postcode || t.zip || "",
    country: t.country || ""
  };
}
function Fs({ empty: t = "", multiline: r = !1 } = {}) {
  return ({ value: e, td: n }) => {
    n && n.classList.add("sg-renderer-address-cell");
    const s = Ja(e);
    if (!s) return t;
    if (s._raw) return u("span", { class: "sg-renderer-address" }, document.createTextNode(s._raw));
    const i = [];
    s.line1 && i.push(s.line1), s.line2 && i.push(s.line2);
    const o = [s.city, s.region, s.postal_code].filter(Boolean).join(" ");
    if (o && i.push(o), s.country && i.push(s.country), r) {
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
const Qa = [
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
], el = 32, Ft = 104, tl = 106;
function nl(t) {
  const r = [Ft];
  let e = Ft;
  for (let n = 0; n < t.length; n++) {
    const s = t.charCodeAt(n);
    if (s < 32 || s > 126) continue;
    const i = s - el;
    r.push(i), e += i * (n + 1);
  }
  return r.push(e % 103), r.push(tl), r.map((n) => Qa[n]).join("") + "11";
}
function Bs({
  height: t = 32,
  showText: r = !0,
  moduleWidth: e = 1.4
} = {}) {
  return ({ value: n, td: s }) => {
    if (S(n)) return "";
    s && s.classList.add("sg-renderer-barcode-cell");
    const i = String(n), o = nl(i), a = o.length * e, l = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a} ${t}" width="${a}" height="${t}" aria-label="barcode ${i}">`;
    let c = 0, d = "";
    for (let f = 0; f < o.length; f++)
      o[f] === "1" && (d += `<rect x="${c}" y="0" width="${e}" height="${t}" fill="currentColor"/>`), c += e;
    const p = u("span", { class: "sg-renderer-barcode", title: i });
    return p.innerHTML = `${l}${d}</svg>`, r && p.append(u(
      "span",
      { class: "sg-renderer-barcode-text" },
      document.createTextNode(i)
    )), p;
  };
}
const mt = {
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
function Hs({} = {}) {
  return ({ value: t, td: r }) => {
    if (S(t)) return "";
    r && r.classList.add("sg-renderer-iban-cell");
    const e = String(t).replace(/\s+/g, "").toUpperCase(), n = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(e), s = e.match(/.{1,4}/g)?.join(" ") || e, i = e.slice(0, 2), o = mt[i];
    return u(
      "span",
      { class: `sg-renderer-uuid${n ? "" : " is-invalid"}`, title: o ? `${s} — ${o}` : s },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(s))
    );
  };
}
function Os({} = {}) {
  return ({ value: t, td: r }) => {
    if (S(t)) return "";
    r && r.classList.add("sg-renderer-swift-cell");
    const e = String(t).replace(/\s+/g, "").toUpperCase(), n = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(e);
    let s;
    n ? s = e.length === 8 ? `${e.slice(0, 4)} ${e.slice(4, 6)} ${e.slice(6, 8)}` : `${e.slice(0, 4)} ${e.slice(4, 6)} ${e.slice(6, 8)} ${e.slice(8, 11)}` : s = e;
    const i = e.slice(4, 6), o = mt[i];
    return u(
      "span",
      { class: `sg-renderer-uuid${n ? "" : " is-invalid"}`, title: o ? `${s} — ${o}` : s },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(s))
    );
  };
}
function Gs({} = {}) {
  return ({ value: t, td: r }) => {
    if (S(t)) return "";
    r && r.classList.add("sg-renderer-mask-numeric");
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
function zs({} = {}) {
  return ({ value: t, td: r }) => {
    if (S(t)) return "";
    r && r.classList.add("sg-renderer-ein-cell");
    const e = String(t).replace(/\D/g, ""), n = e.length === 9, s = n ? `${e.slice(0, 2)}-${e.slice(2)}` : String(t);
    return u(
      "span",
      { class: `sg-renderer-uuid${n ? "" : " is-invalid"}`, title: s },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(s))
    );
  };
}
function js({} = {}) {
  return ({ value: t, td: r }) => {
    if (S(t)) return "";
    r && r.classList.add("sg-renderer-vat-cell");
    const e = String(t).replace(/\s+/g, "").toUpperCase(), n = /^[A-Z]{2}[A-Z0-9]{2,15}$/.test(e), s = e.slice(0, 2), i = mt[s];
    return u(
      "span",
      { class: `sg-renderer-uuid${n ? "" : " is-invalid"}`, title: i ? `${e} — ${i}` : e },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(e))
    );
  };
}
const rl = /^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[A-D]$/i;
function Us({} = {}) {
  return ({ value: t, td: r }) => {
    if (S(t)) return "";
    r && r.classList.add("sg-renderer-nin-cell");
    const e = String(t).replace(/\s+/g, "").toUpperCase(), n = rl.test(e), s = n ? `${e.slice(0, 2)} ${e.slice(2, 4)} ${e.slice(4, 6)} ${e.slice(6, 8)} ${e.slice(8)}` : e;
    return u(
      "span",
      { class: `sg-renderer-uuid${n ? "" : " is-invalid"}`, title: e },
      u("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(s))
    );
  };
}
const Bt = [
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
function sl(t) {
  let r = 0;
  for (let e = 0; e < t.length; e++)
    r = (r << 5) - r + t.charCodeAt(e), r |= 0;
  return Math.abs(r);
}
function il(t) {
  return String(t).split(/\s+/).filter(Boolean).slice(0, 2).map((r) => (r[0] || "").toUpperCase()).join("") || "?";
}
function Ks(t, r = 24) {
  const e = u("span", {
    class: "sg-renderer-avatar-stack-chip",
    style: `width: ${r}px; height: ${r}px; font-size: ${Math.round(r * 0.42)}px;`,
    title: t.name || t.label || ""
  });
  if (t.avatar)
    e.append(u("img", { src: t.avatar, alt: "", loading: "lazy", decoding: "async" }));
  else {
    const n = t.name || t.label || "?", s = t.color || Bt[sl(n) % Bt.length];
    e.style.background = s, e.append(u(
      "span",
      { class: "sg-renderer-avatar-stack-initials" },
      document.createTextNode(il(n))
    ));
  }
  return e;
}
function qs({
  max: t = 4,
  size: r = 24,
  showOverflow: e = !0
} = {}) {
  return (n) => {
    const { value: s } = n, i = n?.col?.cellRendererConfig || {}, o = i.max ?? t, a = i.size ?? r, l = i.showOverflow ?? e;
    if (S(s)) return "";
    const c = (Array.isArray(s) ? s : String(s).split(",")).map((g) => typeof g == "string" ? { name: g.trim() } : g).filter((g) => g && (g.name || g.avatar));
    if (!c.length) return "";
    const d = c.slice(0, o), p = c.length - d.length, f = u("span", { class: "sg-renderer-avatar-stack" });
    for (const g of d) f.append(Ks(g, a));
    return l && p > 0 && f.append(u("span", {
      class: "sg-renderer-avatar-stack-chip is-overflow",
      style: `width: ${a}px; height: ${a}px; font-size: ${Math.round(a * 0.36)}px;`,
      title: c.slice(o).map((g) => g.name).filter(Boolean).join(", ")
    }, document.createTextNode(`+${p}`))), f;
  };
}
const qe = {
  online: { color: "#22c55e", label: "Online" },
  away: { color: "#f59e0b", label: "Away" },
  busy: { color: "#ef4444", label: "Busy" },
  dnd: { color: "#ef4444", label: "Do not disturb" },
  offline: { color: "#9ca3af", label: "Offline" },
  invisible: { color: "transparent", label: "Invisible" }
};
function Ws({
  showLabel: t = !1,
  size: r = 8
} = {}) {
  return (e) => {
    const { value: n } = e, s = e?.col?.cellRendererConfig || {}, i = s.showLabel ?? t, o = s.size ?? r;
    if (n == null || n === "") return "";
    let a = null;
    n === !0 ? a = "online" : n === !1 ? a = "offline" : typeof n == "object" ? a = n.status || n.state : a = String(n).toLowerCase();
    const l = qe[a] || qe.offline, c = typeof n == "object" && n.label || l.label, d = u("span", { class: "sg-renderer-presence", title: c });
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
function Ys({
  showPresence: t = !0,
  showAvatar: r = !0,
  size: e = 20
} = {}) {
  return (n) => {
    const { value: s } = n, i = n?.col?.cellRendererConfig || {}, o = i.showPresence ?? t, a = i.showAvatar ?? r, l = i.size ?? e;
    if (S(s)) return u(
      "span",
      { class: "sg-renderer-assignee-empty" },
      document.createTextNode("Unassigned")
    );
    const c = typeof s == "string" ? { name: s } : s, d = c.name || c.label || "";
    if (!d && !c.avatar) return "";
    const p = u("span", { class: "sg-renderer-assignee" });
    a && p.append(Ks(c, l));
    const f = u(
      "span",
      { class: "sg-renderer-assignee-name" },
      document.createTextNode(d)
    );
    if (o && c.presence) {
      const g = String(c.presence).toLowerCase(), h = qe[g] || qe.offline;
      f.prepend(u("span", {
        class: `sg-renderer-presence-dot is-${g}`,
        style: `width: 7px; height: 7px; background: ${h.color}; margin-right: 6px; ${h.color === "transparent" ? "border: 1px solid #9ca3af;" : ""}`,
        "aria-hidden": "true",
        title: h.label
      }));
    }
    return p.append(f), p;
  };
}
function Zs({
  min: t = 0,
  max: r = 100,
  step: e = 1,
  format: n = null,
  color: s = "#3b82f6",
  editable: i = !0,
  range: o = !1,
  showValue: a = !0
} = {}) {
  return (l) => {
    const { value: c, row: d, col: p, api: f, td: g } = l, h = l?.col?.cellRendererConfig || {}, b = h.min ?? t, m = h.max ?? r, _ = h.step ?? e, y = h.range ?? o, w = n || ((L) => String(L)), C = h.showValue ?? a, k = h.color || s, T = h.editable ?? i;
    if (g && g.classList.add("sg-renderer-slider-cell"), S(c) && !y)
      return u(
        "span",
        { class: "sg-renderer-slider-placeholder" },
        document.createTextNode("—")
      );
    const M = u("div", { class: "sg-renderer-slider" });
    function $(L) {
      const E = d && p?.field != null ? d[p.field] : null;
      d && p?.field != null && (d[p.field] = L), f?.applyTransaction && f.applyTransaction({ update: [d] });
      const D = g?.closest('[data-controller~="grid"]');
      D && D.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: d?.id ?? d?._sg_id, colId: p?.field, oldValue: E, newValue: L }
      }));
    }
    if (y) {
      let q = function() {
        let O = Number(H.value), R = Number(Y.value);
        O > R && ([O, R] = [R, O]);
        const G = (O - b) / D * 100, X = (R - b) / D * 100;
        B.style.left = `${G}%`, B.style.width = `${Math.max(0, X - G)}%`, J.textContent = `${w(O)} – ${w(R)}`;
      }, Q = function() {
        let O = Number(H.value), R = Number(Y.value);
        O > R && ([O, R] = [R, O]), q(), $([O, R]);
      };
      const [L, E] = Array.isArray(c) ? c : [b, m], D = Math.max(1, m - b), P = u("div", { class: "sg-renderer-slider-range-stack" }), F = u("div", { class: "sg-renderer-slider-range-rail" }), B = u("div", { class: "sg-renderer-slider-range-fill", style: `background:${k};` }), H = u("input", {
        type: "range",
        class: "sg-renderer-slider-input sg-renderer-slider-range-low",
        min: b,
        max: m,
        step: _,
        value: L,
        disabled: T ? null : ""
      }), Y = u("input", {
        type: "range",
        class: "sg-renderer-slider-input sg-renderer-slider-range-high",
        min: b,
        max: m,
        step: _,
        value: E,
        disabled: T ? null : ""
      });
      P.style.setProperty("--sg-slider-accent", k);
      const J = u(
        "span",
        { class: "sg-renderer-slider-value" },
        document.createTextNode(`${w(L)} – ${w(E)}`)
      );
      [H, Y].forEach((O) => {
        O.addEventListener("click", (R) => R.stopPropagation()), O.addEventListener("input", q), O.addEventListener("change", Q);
      }), P.append(F, B, H, Y), M.append(P), C && M.append(J), q();
    } else {
      const L = Number(c), E = Number.isFinite(L) ? L : b, D = u("input", {
        type: "range",
        class: "sg-renderer-slider-input",
        min: b,
        max: m,
        step: _,
        value: E,
        disabled: T ? null : "",
        style: `accent-color: ${k};`
      }), P = u(
        "span",
        { class: "sg-renderer-slider-value" },
        document.createTextNode(w(E))
      );
      D.addEventListener("click", (F) => F.stopPropagation()), D.addEventListener("input", () => {
        P.textContent = w(Number(D.value));
      }), D.addEventListener("change", () => $(Number(D.value))), M.append(D), C && M.append(P);
    }
    return M;
  };
}
v("email", Jt());
v("url", Qt());
v("phone", en());
v("currency", tn());
v("percent", nn());
v("progress-bar", Dn());
v("star-rating", Rn());
v("tags", In());
v("country-flag", Pn());
v("abn", Vn());
v("avatar", Fn());
v("date", rn());
v("datetime", sn());
v("relative-time", on());
v("duration", an());
v("number", ln());
v("compact-number", cn());
v("file-size", dn());
v("boolean", un());
v("delta", pn());
v("truncate", fn());
v("copyable", hn());
v("image", bn());
v("color-swatch", yn());
v("sparkline", wn());
v("heatmap-cell", Cn());
v("mask", xn());
v("highlight", Sn());
v("multi-line", Ln());
v("attachments", En());
v("address-au", Mn());
v("checkbox", Bn());
v("switch", Gn());
v("markdown", zn());
v("json", jn());
v("linked-record", Un());
v("coloured-tags", Kn());
v("time", Wn());
v("diff", Yn());
v("geo", Zn());
v("qr", Xn());
v("code", Jn());
v("rating", Qn());
v("bullet", er());
v("donut", tr());
v("histogram", nr());
v("rag", rr());
v("timeline-steps", sr());
v("mention", ir());
v("expand", or());
v("units", ar());
v("ip-address", lr());
v("bsb", cr());
v("acn", dr());
v("tfn", ur());
v("medicare", pr());
v("audio", fr());
v("video", gr());
v("reactions", hr());
v("comment-count", mr());
v("ordinal", br());
v("plural", yr());
v("empty", wr());
v("credit-card", _r());
v("loading-shimmer", vr());
v("audio-attachment", On());
v("select", Cr());
v("multiselect", Sr());
v("combobox", Lr());
v("slider", Zs());
v("date-picker", kr());
v("time-picker", Ar());
v("date-range", Nr());
v("color-picker", Dr());
v("textarea", Rr());
v("action-button", Ir());
v("menu", Pr());
v("split-button", Fr());
v("row-actions", Br());
v("drag-handle", Hr());
v("row-number", Or());
v("expand-toggle", Gr());
v("avatar-stack", qs());
v("presence", Ws());
v("assignee", Ys());
v("uuid", zr());
v("git-sha", jr());
v("mac-address", Ur());
v("license-key", Kr());
v("vin", qr());
v("isbn", Wr());
v("iban", Hs());
v("swift", Os());
v("ssn", Gs());
v("ein", zs());
v("vat", js());
v("nin", Us());
v("postal-code", Ps());
v("address-us", Vs());
v("address-generic", Fs());
v("barcode", Bs());
v("gauge", Ns());
v("win-loss", Ms());
v("mini-bar-chart", Ds());
v("mini-line-chart", Rs());
v("trend", Is());
v("countdown", ks());
v("age", $s());
v("fiscal-period", Es());
v("timezone", As());
v("cron", Ts());
v("spinner", vs());
v("error", Cs());
v("sync-status", xs());
v("stale", Ss());
v("fresh", Ls());
v("favicon", ms());
v("domain", bs());
v("social-link", ys());
v("tracking-number", ws());
v("video-link", _s());
v("file", us());
v("download-link", ps());
v("mime-icon", fs());
v("gallery", gs());
v("waveform", hs());
v("html", Yr());
v("yaml", Zr());
v("xml", Xr());
v("autolink", Jr());
v("redacted", Qr());
v("spoiler", es());
v("fraction", ns());
v("scientific", rs());
v("hex", Je({ base: 16 }));
v("binary", Je({ base: 2 }));
v("octal", Je({ base: 8 }));
v("percentile", ss());
v("battery", is());
v("signal-bars", os());
v("volume", as());
const N = {
  // Plain text. The 99% case.
  text: {
    copy: ({ value: t }) => t == null ? "" : String(t),
    parse: (t) => String(t ?? "")
  },
  // Numeric — strips currency / percent / commas before Number().
  number: {
    copy: ({ value: t }) => t == null || t === "" ? "" : String(t),
    parse: Ye
  },
  // Boolean — true / false / yes / no / 1 / 0 / on / off / ✓ / ✗.
  boolean: {
    copy: ({ value: t }) => t === !0 ? "true" : t === !1 ? "false" : t == null ? "" : String(t),
    parse: Gi
  },
  // ISO date (YYYY-MM-DD). Date objects normalise to ISO on copy;
  // already-string values round-trip as supplied so existing
  // "2026-05-25" strings come back exactly as they went out.
  date: {
    copy: ({ value: t }) => {
      if (t == null || t === "") return "";
      if (t instanceof Date && !Number.isNaN(t.valueOf())) {
        const r = t.getFullYear(), e = String(t.getMonth() + 1).padStart(2, "0"), n = String(t.getDate()).padStart(2, "0");
        return `${r}-${e}-${n}`;
      }
      return String(t);
    },
    parse: (t) => {
      const r = String(t ?? "");
      if (r === "") return "";
      const e = new Date(r);
      return Number.isNaN(e.valueOf()) ? void 0 : r;
    }
  },
  // ISO datetime (full ISO 8601).
  datetime: {
    copy: ({ value: t }) => t == null || t === "" ? "" : t instanceof Date && !Number.isNaN(t.valueOf()) ? t.toISOString() : String(t),
    parse: (t) => {
      const r = String(t ?? "");
      if (r === "") return "";
      const e = new Date(r);
      return Number.isNaN(e.valueOf()) ? void 0 : r;
    }
  },
  // Comma-separated strings. Preserves array-ness if the original was
  // an array (the renderer's display call has its own normalisation).
  stringList: {
    copy: ({ value: t }) => Array.isArray(t) ? t.join(", ") : S(t) ? "" : String(t),
    parse: (t) => {
      const r = String(t ?? "").trim();
      return r === "" ? [] : r.split(/\s*,\s*/).filter(Boolean);
    }
  },
  // Comma-separated numbers (sparkline / histogram).
  numberList: {
    copy: ({ value: t }) => Array.isArray(t) ? t.join(", ") : "",
    parse: (t) => {
      const r = String(t ?? "").trim();
      if (r === "") return [];
      const e = r.split(/\s*,\s*/).filter(Boolean).map(Number);
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
      const r = String(t ?? "").trim();
      if (r === "") return "";
      try {
        return JSON.parse(r);
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
      const r = String(t ?? "");
      return r === "" ? "" : r.replace(/\D/g, "") || r;
    }
  }
};
function A(t, r) {
  const e = be(t);
  e && Bi(e, r);
}
A("email", { copy: N.text.copy, parse: (t) => String(t ?? "").trim() });
A("url", { copy: N.text.copy, parse: (t) => String(t ?? "").trim() });
A("phone", N.digits);
A("currency", N.number);
A("percent", {
  copy: N.number.copy,
  parse: (t) => Ye(String(t ?? "").replace(/%$/, ""))
});
A("progress-bar", N.number);
A("star-rating", N.number);
A("tags", N.stringList);
A("country-flag", {
  copy: ({ value: t }) => t == null ? "" : String(t).trim().toUpperCase(),
  parse: (t) => {
    const r = String(t ?? "").trim().toUpperCase();
    return /^[A-Z]{2}$/.test(r) ? r : void 0;
  }
});
A("abn", N.digits);
A("avatar", N.text);
A("date", N.date);
A("datetime", N.datetime);
A("relative-time", N.datetime);
A("duration", {
  copy: N.number.copy,
  // Accept either a bare number ("125000") OR a human form ("2h 5m" /
  // "02:05:00"). The parsed value is in milliseconds — most columns
  // already use that; the renderer's `unit` option converts on display.
  parse: (t) => {
    const r = String(t ?? "").trim();
    if (r === "") return "";
    if (/^-?\d+(\.\d+)?$/.test(r)) return Number(r);
    const e = /^(\d+):(\d+)(?::(\d+))?$/.exec(r);
    if (e) {
      const a = +e[1], l = +e[2], c = e[3] ? +e[3] : 0;
      return (e[3] ? a * 3600 + l * 60 + c : a * 60 + l) * 1e3;
    }
    let n = 0, s = !1;
    const i = /(-?\d+(?:\.\d+)?)\s*(ms|milliseconds?|s|sec|seconds?|m|min|minutes?|h|hr|hours?|d|days?)\b/gi;
    let o;
    for (; (o = i.exec(r)) !== null; ) {
      const a = Number(o[1]), l = o[2].toLowerCase();
      l.startsWith("ms") || l.startsWith("milli") ? n += a : l === "s" || l.startsWith("sec") ? n += a * 1e3 : l === "m" || l.startsWith("min") ? n += a * 6e4 : l.startsWith("h") ? n += a * 36e5 : l.startsWith("d") && (n += a * 864e5), s = !0;
    }
    return s ? n : void 0;
  }
});
A("number", N.number);
A("compact-number", {
  copy: N.number.copy,
  parse: (t) => {
    const r = String(t ?? "").trim();
    if (r === "") return "";
    const e = /^(-?\d+(?:\.\d+)?)\s*([kmbt])$/i.exec(r);
    if (e) {
      const n = Number(e[1]), s = e[2].toLowerCase(), i = s === "k" ? 1e3 : s === "m" ? 1e6 : s === "b" ? 1e9 : 1e12;
      return Number.isFinite(n) ? n * i : void 0;
    }
    return Ye(r);
  }
});
A("file-size", {
  copy: N.number.copy,
  parse: (t) => {
    const r = String(t ?? "").trim();
    if (r === "") return "";
    const e = /^(-?\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb|pb|kib|mib|gib|tib|pib)?$/i.exec(r);
    if (!e) return Ye(r);
    const n = Number(e[1]);
    if (!Number.isFinite(n)) return;
    const s = (e[2] || "b").toLowerCase(), i = s.endsWith("ib") ? 1024 : 1e3, o = s.endsWith("ib") ? s.slice(0, -2) + "b" : s, a = { b: 1, kb: i, mb: i ** 2, gb: i ** 3, tb: i ** 4, pb: i ** 5 };
    return n * (a[o] ?? 1);
  }
});
A("boolean", N.boolean);
A("delta", N.number);
A("truncate", N.text);
A("copyable", N.text);
A("image", { copy: N.text.copy, parse: (t) => String(t ?? "").trim() });
A("color-swatch", { copy: N.text.copy, parse: (t) => String(t ?? "").trim() });
A("sparkline", N.numberList);
A("heatmap-cell", N.number);
A("mask", N.text);
A("highlight", N.text);
A("multi-line", N.text);
A("attachments", {
  copy: N.json.copy,
  parse: (t) => {
    const r = N.json.parse(t);
    if (r !== void 0)
      return r === "" || r == null ? [] : Array.isArray(r) ? r : void 0;
  }
});
A("address-au", {
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
    const r = String(t ?? "").trim();
    if (r === "") return null;
    if (r.startsWith("{"))
      try {
        return JSON.parse(r);
      } catch {
      }
    return r;
  }
});
A("checkbox", N.boolean);
A("switch", N.boolean);
A("markdown", N.text);
A("json", N.json);
A("linked-record", {
  copy: ({ value: t }) => t == null || t === "" ? "" : Array.isArray(t) ? t.join(", ") : String(t),
  parse: (t) => {
    const r = String(t ?? "");
    return r === "" ? "" : r.includes(",") ? r.split(/\s*,\s*/).filter(Boolean) : r;
  }
});
A("coloured-tags", N.stringList);
A("time", {
  copy: ({ value: t }) => t == null ? "" : String(t).trim(),
  parse: (t) => {
    const r = String(t ?? "").trim();
    if (r === "") return "";
    const e = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)$/i.exec(r);
    if (e) {
      let n = parseInt(e[1], 10);
      const s = e[2], i = e[3];
      return e[4].toLowerCase() === "pm" && n < 12 && (n += 12), e[4].toLowerCase() === "am" && n === 12 && (n = 0), `${String(n).padStart(2, "0")}:${s}${i ? ":" + i : ""}`;
    }
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(r)) return r;
    if (/^\d+(\.\d+)?$/.test(r)) return Number(r);
  }
});
A("diff", {
  copy: ({ value: t }) => {
    if (t == null || t === "") return "";
    if (typeof t == "string") return t;
    if (Array.isArray(t)) return `${t[0] ?? ""} → ${t[1] ?? ""}`;
    const r = t.from ?? t.old ?? t.before ?? t.previous ?? null, e = t.to ?? t.new ?? t.after ?? t.current ?? null;
    return r == null && e == null ? "" : `${r ?? ""} → ${e ?? ""}`;
  },
  parse: (t) => {
    const r = String(t ?? "").trim();
    if (r === "") return null;
    const e = /^(.*?)\s*(?:→|->|=>|—>)\s*(.+)$/.exec(r);
    return e ? { from: e[1].trim(), to: e[2].trim() } : { from: null, to: r };
  }
});
A("geo", {
  copy: ({ value: t }) => {
    if (t == null || t === "") return "";
    if (Array.isArray(t)) return `${t[0]}, ${t[1]}`;
    if (typeof t == "object") {
      const r = t.lat ?? t.latitude, e = t.lng ?? t.long ?? t.lon ?? t.longitude;
      return `${r}, ${e}`;
    }
    return String(t);
  },
  parse: (t) => {
    const r = String(t ?? "").trim();
    if (r === "") return null;
    const e = r.split(/\s*,\s*/);
    if (e.length !== 2) return;
    const n = Number(e[0]), s = Number(e[1]);
    if (!(!Number.isFinite(n) || !Number.isFinite(s)))
      return { lat: n, lng: s };
  }
});
A("qr", N.text);
A("code", N.text);
A("rating", N.number);
A("bullet", N.number);
A("donut", N.number);
A("histogram", N.numberList);
A("rag", {
  // RAG_TOKENS lookup keeps "high" / "low" / "critical" / "ok" /
  // "passive" / "detractor" all parseable to the three canonical bands.
  copy: ({ value: t }) => t == null ? "" : String(t).trim().toLowerCase(),
  parse: (t) => {
    const r = String(t ?? "").trim();
    if (r === "") return "";
    const e = r.toLowerCase();
    if (ct[e]) return ct[e];
    if (/^-?\d+(\.\d+)?$/.test(r)) return Number(r);
  }
});
A("timeline-steps", N.text);
A("mention", N.text);
A("expand", N.text);
A("units", N.number);
A("ip-address", { copy: N.text.copy, parse: (t) => String(t ?? "").trim() });
A("bsb", N.digits);
A("acn", N.digits);
A("tfn", N.digits);
A("medicare", N.digits);
A("audio", { copy: N.text.copy, parse: (t) => String(t ?? "").trim() });
A("video", { copy: N.text.copy, parse: (t) => String(t ?? "").trim() });
A("reactions", N.json);
A("comment-count", {
  copy: ({ value: t }) => {
    if (t == null || t === "") return "";
    if (typeof t == "object") {
      const r = t.value ?? t.text ?? "", e = t.count ?? t.comments ?? null;
      return e != null && r ? `${r} (${e})` : e != null ? String(e) : String(r);
    }
    return String(t);
  },
  parse: (t) => {
    const r = String(t ?? "").trim();
    if (r === "") return "";
    const e = /^(.*?)\s*\((\d+)\)$/.exec(r);
    return e ? { value: e[1].trim(), count: Number(e[2]) } : /^\d+$/.test(r) ? Number(r) : r;
  }
});
A("ordinal", {
  copy: N.number.copy,
  parse: (t) => {
    const r = String(t ?? "").trim();
    if (r === "") return "";
    const e = /^(-?\d+)(?:st|nd|rd|th)?$/i.exec(r);
    return e ? Number(e[1]) : void 0;
  }
});
A("plural", N.number);
A("empty", N.text);
A("credit-card", N.digits);
A("loading-shimmer", N.text);
A("audio-attachment", {
  copy: ({ value: t }) => t == null || t === "" ? "" : typeof t == "string" ? t : typeof t == "object" ? t.url || JSON.stringify(t) : String(t),
  parse: (t) => {
    const r = String(t ?? "").trim();
    if (r === "") return null;
    if (r.startsWith("{"))
      try {
        return JSON.parse(r);
      } catch {
      }
    return r;
  }
});
A("select", {
  copy: ({ value: t }) => t == null || t === "" ? "" : String(t),
  parse: (t, r) => {
    const e = String(t ?? "");
    if (e === "") return null;
    const n = r?.col?.cellRendererConfig?.options || r?.col?.enumValues || [];
    if (!Array.isArray(n) || n.length === 0) return e;
    const s = (o) => String(o).trim().toLowerCase(), i = s(e);
    for (const o of n) {
      const a = typeof o == "object" ? o.value : o, l = typeof o == "object" ? o.label ?? a : o;
      if (s(a) === i || s(l) === i) return a;
    }
  }
});
A("multiselect", {
  copy: ({ value: t }) => Array.isArray(t) ? t.join(", ") : S(t) ? "" : String(t),
  parse: (t, r) => {
    const e = String(t ?? "").trim();
    if (e === "") return [];
    const n = e.split(/\s*,\s*/).filter(Boolean), s = r?.col?.cellRendererConfig?.options || r?.col?.enumValues || [];
    if (!Array.isArray(s) || s.length === 0) return n;
    const i = (a) => String(a).trim().toLowerCase(), o = [];
    for (const a of n) {
      const l = i(a), c = s.find((d) => {
        const p = typeof d == "object" ? d.value : d, f = typeof d == "object" ? d.label ?? p : d;
        return i(p) === l || i(f) === l;
      });
      if (!c) return;
      o.push(typeof c == "object" ? c.value : c);
    }
    return o;
  }
});
A("combobox", {
  copy: ({ value: t }) => t == null || t === "" ? "" : String(t),
  parse: (t, r) => {
    const e = String(t ?? "");
    if (e === "") return null;
    const n = r?.col?.cellRendererConfig?.options || r?.col?.enumValues || [], s = !!r?.col?.cellRendererConfig?.allowCustom;
    if (Array.isArray(n) && n.length > 0) {
      const i = (a) => String(a).trim().toLowerCase(), o = i(e);
      for (const a of n) {
        const l = typeof a == "object" ? a.value : a, c = typeof a == "object" ? a.label ?? l : a;
        if (i(l) === o || i(c) === o) return l;
      }
      return s ? e : void 0;
    }
    return e;
  }
});
A("slider", N.number);
A("date-picker", N.date);
A("time-picker", {
  // The picker commits HH:MM (24-hour) regardless of display style, so
  // clipboard round-trips do the same.
  copy: ({ value: t }) => t == null ? "" : String(t),
  parse: (t) => {
    const r = String(t ?? "").trim();
    if (r === "") return "";
    const e = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(r);
    if (e) {
      let n = parseInt(e[1], 10);
      return e[3].toLowerCase() === "pm" && n < 12 && (n += 12), e[3].toLowerCase() === "am" && n === 12 && (n = 0), `${String(n).padStart(2, "0")}:${e[2]}`;
    }
    if (/^\d{1,2}:\d{2}$/.test(r)) {
      const [n, s] = r.split(":");
      return `${n.padStart(2, "0")}:${s}`;
    }
  }
});
A("date-range", {
  copy: ({ value: t }) => {
    if (t == null || t === "") return "";
    let r, e;
    if (Array.isArray(t)) [r, e] = t;
    else if (typeof t == "object")
      r = t.start || t.from, e = t.end || t.to;
    else return String(t);
    const n = (s) => {
      if (!s) return "";
      const i = s instanceof Date ? s : new Date(s);
      if (Number.isNaN(i.valueOf())) return String(s);
      const o = i.getFullYear(), a = String(i.getMonth() + 1).padStart(2, "0"), l = String(i.getDate()).padStart(2, "0");
      return `${o}-${a}-${l}`;
    };
    return `${n(r)}/${n(e)}`;
  },
  parse: (t) => {
    const r = String(t ?? "").trim();
    if (r === "") return null;
    const e = r.split(/\s*\/\s*|\s*[–]\s*|\s+-\s+/);
    if (e.length < 2) return;
    const [n, s] = e, i = (o) => o === "" || !Number.isNaN(new Date(o).valueOf());
    if (!(!i(n) || !i(s)))
      return [n, s];
  }
});
A("color-picker", { copy: N.text.copy, parse: (t) => String(t ?? "").trim() });
A("textarea", N.text);
A("action-button", N.text);
A("menu", N.text);
A("split-button", N.text);
A("row-actions", N.text);
const ol = {
  email: Jt,
  url: Qt,
  phone: en,
  currency: tn,
  percent: nn,
  progressBar: Dn,
  starRating: Rn,
  tags: In,
  countryFlag: Pn,
  abn: Vn,
  avatar: Fn,
  statusPill: xo,
  date: rn,
  datetime: sn,
  relativeTime: on,
  duration: an,
  number: ln,
  compactNumber: cn,
  fileSize: dn,
  boolean: un,
  delta: pn,
  truncate: fn,
  copyable: hn,
  image: bn,
  colorSwatch: yn,
  sparkline: wn,
  heatmap: Cn,
  mask: xn,
  highlight: Sn,
  multiLine: Ln,
  attachments: En,
  addressAu: Mn,
  checkbox: Bn,
  switch: Gn,
  markdown: zn,
  json: jn,
  linkedRecord: Un,
  colouredTags: Kn,
  time: Wn,
  diff: Yn,
  geo: Zn,
  qr: Xn,
  code: Jn,
  rating: Qn,
  bullet: er,
  donut: tr,
  histogram: nr,
  rag: rr,
  timelineSteps: sr,
  mention: ir,
  expand: or,
  units: ar,
  ipAddress: lr,
  bsb: cr,
  acn: dr,
  tfn: ur,
  medicare: pr,
  audio: fr,
  video: gr,
  reactions: hr,
  commentCount: mr,
  ordinal: br,
  plural: yr,
  empty: wr,
  creditCard: _r,
  loadingShimmer: vr,
  audioAttachment: On,
  select: Cr,
  multiselect: Sr,
  combobox: Lr,
  slider: Zs,
  datePicker: kr,
  timePicker: Ar,
  dateRange: Nr,
  colorPicker: Dr,
  textarea: Rr,
  actionButton: Ir,
  menu: Pr,
  splitButton: Fr,
  rowActions: Br,
  dragHandle: Hr,
  rowNumber: Or,
  expandToggle: Gr,
  avatarStack: qs,
  presence: Ws,
  assignee: Ys,
  uuid: zr,
  gitSha: jr,
  macAddress: Ur,
  licenseKey: Kr,
  vin: qr,
  isbn: Wr,
  iban: Hs,
  swift: Os,
  ssn: Gs,
  ein: zs,
  vat: js,
  nin: Us,
  postalCode: Ps,
  addressUs: Vs,
  addressGeneric: Fs,
  barcode: Bs,
  gauge: Ns,
  winLoss: Ms,
  miniBarChart: Ds,
  miniLineChart: Rs,
  trend: Is,
  countdown: ks,
  age: $s,
  fiscalPeriod: Es,
  timezone: As,
  cron: Ts,
  spinner: vs,
  errorCell: Cs,
  syncStatus: xs,
  staleCell: Ss,
  freshCell: Ls,
  favicon: ms,
  domain: bs,
  socialLink: ys,
  trackingNumber: ws,
  videoLink: _s,
  file: us,
  downloadLink: ps,
  mimeIcon: fs,
  gallery: gs,
  waveform: hs,
  html: Yr,
  yaml: Zr,
  xml: Xr,
  autolink: Jr,
  redacted: Qr,
  spoiler: es,
  fraction: ns,
  scientific: rs,
  radix: Je,
  percentile: ss,
  battery: is,
  signalBars: os,
  volumeIndicator: as
}, al = 32, Ht = 100, Ae = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', ll = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>', cl = /* @__PURE__ */ new Set([
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
]), dl = /* @__PURE__ */ new Set([
  "color",
  "date",
  "datetime-local",
  "time",
  "month",
  "week"
]);
function ul(t) {
  const r = String(t ?? "");
  return r === "" ? "" : /[\t\n\r"]/.test(r) ? `"${r.replace(/"/g, '""')}"` : r;
}
function pl(t) {
  const r = [];
  let e = [], n = "", s = !1;
  for (let i = 0; i < t.length; i++) {
    const o = t[i];
    if (s) {
      if (o === '"') {
        if (t[i + 1] === '"') {
          n += '"', i++;
          continue;
        }
        s = !1;
        continue;
      }
      n += o;
    } else {
      if (o === '"' && n === "") {
        s = !0;
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
        e.push(n), r.push(e), e = [], n = "";
        continue;
      }
      n += o;
    }
  }
  return (n !== "" || e.length > 0) && (e.push(n), r.push(e)), r;
}
const Ot = [
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
class bt extends se {
  constructor() {
    super(...arguments);
    V(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    // ----- Row grouping + aggregation -----
    // A group is expanded if it has an explicit override; otherwise the
    // default-by-level applies (-1 = all, 0 = none, N = first N levels).
    V(this, "_isGroupExpanded", (e, n) => {
      if (this._groupExpanded.has(e)) return this._groupExpanded.get(e);
      const s = this.state.group.defaultExpanded;
      return s < 0 ? !0 : n < s;
    });
    // Delegated click handler for synthetic <th>s that don't have a
    // HeaderCellController of their own (pivot result cols today). Mirrors the
    // user-defined header path: bare click toggles sort, shift-click appends to
    // a multi-sort. Resize handles / filter icons short-circuit.
    V(this, "_onSynthHeaderClick", (e) => {
      const n = e.target.closest('th[data-synth="true"][data-sortable="true"]');
      if (!n || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const s = n.getAttribute("data-field");
      s && this.toggleSort(s, e.shiftKey === !0);
    });
    // ----- Right-click column menu -----
    //
    // contextmenu on a leaf <th> opens a fixed-positioned popup with quick
    // actions for that column: pin/unpin (left|right), autosize, group/pivot
    // toggles, aggregate selector, and hide. Synthetic columns (gutter,
    // checkbox, auto-Group, pivot result) suppress the menu — they're owned by
    // the grid and shouldn't be poked through this surface.
    V(this, "_onHeaderContextMenu", (e) => {
      const n = e.target.closest("th[data-field], th[data-header-cell-field-value]");
      if (!n) return;
      const s = n.getAttribute("data-field") || n.getAttribute("data-header-cell-field-value"), i = this._colByField(s);
      !i || i._isCheckbox || i._isRowNumber || i._isGroupCol || i._isPivot || (e.preventDefault(), this._showColumnMenu(i, e.clientX, e.clientY));
    });
    V(this, "_onDocMouseDownColumnMenu", (e) => {
      this._columnMenu && !this._columnMenu.contains(e.target) && this._closeColumnMenu();
    });
    V(this, "_onColumnMenuKey", (e) => {
      e.key === "Escape" && (e.stopPropagation(), this._closeColumnMenu());
    });
    V(this, "_onCellDragEnter", (e) => {
      if (!this._isFileDrag(e)) return;
      const n = this._dropTarget(e.target);
      n && (e.preventDefault(), this._dropHotCell && this._dropHotCell !== n.td && this._dropHotCell.classList.remove("sg-drop-target"), n.td.classList.add("sg-drop-target"), this._dropHotCell = n.td);
    });
    V(this, "_onCellDragOver", (e) => {
      if (!this._isFileDrag(e)) return;
      const n = this._dropTarget(e.target);
      n && (e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "copy"), this._dropHotCell !== n.td && (this._dropHotCell?.classList.remove("sg-drop-target"), n.td.classList.add("sg-drop-target"), this._dropHotCell = n.td));
    });
    V(this, "_onCellDragLeave", (e) => {
      this._dropHotCell && !this._dropHotCell.contains(e.relatedTarget) && (this._dropHotCell.classList.remove("sg-drop-target"), this._dropHotCell = null);
    });
    V(this, "_onCellDrop", (e) => {
      if (!this._isFileDrag(e)) return;
      const n = this._dropTarget(e.target);
      if (!n) return;
      e.preventDefault(), this._dropHotCell?.classList.remove("sg-drop-target"), this._dropHotCell = null;
      const s = Array.from(e.dataTransfer?.files || []);
      if (!s.length) return;
      const i = this.state.rowData.find((p) => this._rowId(p) === n.rowId), o = { rowId: n.rowId, colId: n.colId, files: s, row: i, dataTransfer: e.dataTransfer }, a = new CustomEvent("grid:fileAttached", { detail: o, bubbles: !0, cancelable: !0 });
      if (!this.element.dispatchEvent(a) || !i) return;
      const c = this.attachmentsFieldValue || n.colId, d = Array.isArray(i[c]) ? i[c].slice() : [];
      for (const p of s) {
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
      i[c] = d, this.scheduleRender("cells"), I(this.element, "grid:cellValueChanged", {
        rowId: n.rowId,
        colId: c,
        oldValue: null,
        newValue: d
      });
    });
    V(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
    });
    V(this, "_onCellMouseDown", (e) => {
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
      const s = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(n) : s ? (this._addCellRange(n), this._cellDragging = !0) : (this._setSingleCellSel(n), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), I(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    V(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const n = this._cellAt(e.target);
      if (!n) return;
      const s = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      s && s.focus.rowId === n.rowId && s.focus.colId === n.colId || (this._extendActiveRange(n), this._cellDragMoved = !0, this._applyCellSelHighlight(), I(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
    });
    V(this, "_onCellMouseUp", () => {
      this._cellDragging = !1, this._rowDragPending && (document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag && this._finishRowDrag(), this._rowDragPending = null);
    });
    // ----- Row drag-and-drop (reorder) with a ghost preview -----
    V(this, "_onRowDragMove", (e) => {
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
    V(this, "_onCopy", (e) => {
      if (this.state.editing) return;
      const n = document.activeElement;
      if (n && /^(input|textarea|select)$/i.test(n.tagName) && !this.element.contains(n)) return;
      const s = this._activeRect();
      if (!s) return;
      const i = this._cellRangeRows(s).map((o) => o.map((a) => ul(a)).join("	")).join(`
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
    V(this, "_onPaste", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const n = document.activeElement;
      if (n && /^(input|textarea|select)$/i.test(n.tagName) && !this.element.contains(n)) return;
      const s = this._activeRect();
      if (!s) return;
      const i = e.clipboardData?.getData("text/plain");
      if (i == null || i === "") return;
      e.preventDefault();
      const o = pl(i);
      if (!o.length || (o.length > 1 && o[o.length - 1].length === 1 && o[o.length - 1][0] === "" && o.pop(), !o.length)) return;
      const a = o.length === 1 && o[0].length === 1, l = a ? s.r1 - s.r0 + 1 : o.length, c = a ? s.c1 - s.c0 + 1 : o[0].length, d = s.rows, p = s.cols, f = [];
      let g = !1;
      for (let h = 0; h < l; h++) {
        const b = s.r0 + h;
        if (b >= d.length) break;
        const m = d[b];
        if (!m || m.__sgGroup || m.__sgDetail || m.__sgSeparator) continue;
        const _ = a ? o[0] : o[h];
        for (let y = 0; y < c; y++) {
          const w = s.c0 + y;
          if (w >= p.length) break;
          const C = p[w];
          if (!C) continue;
          if (!C.editable || C._isCheckbox || C._isRowNumber || C._isGroupCol || C._isMasterExpand) {
            f.push({ rowId: this._rowId(m), colId: C.field || "", reason: "not-editable" });
            continue;
          }
          const k = a ? _[0] : _[y] ?? "", T = this._parsePasteValue(k, m, C);
          if (T === void 0) {
            f.push({ rowId: this._rowId(m), colId: C.field, reason: "parse-failed", text: k });
            continue;
          }
          const M = m[C.field];
          T !== M && (m[C.field] = T, g = !0, I(this.element, "grid:cellValueChanged", {
            rowId: this._rowId(m),
            colId: C.field,
            oldValue: M,
            newValue: T,
            source: "paste"
          }));
        }
      }
      g && this.scheduleRender("cells"), (f.length || g) && I(this.element, "grid:pasteApplied", { appliedCount: g ? 1 : 0, rejectedCount: f.length }), f.length && I(this.element, "grid:pasteRejected", { rejected: f });
    });
    V(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const n = document.activeElement;
      if (n && /^(input|textarea|select)$/i.test(n.tagName) && this.element.contains(n)) return;
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
    V(this, "_onEditorKey", (e) => {
      this.state.editing && (e.key === "Enter" ? (e.preventDefault(), this.stopEditing(!1)) : e.key === "Escape" ? (e.preventDefault(), this.stopEditing(!0)) : e.key === "Tab" && (e.preventDefault(), this._tabToEditableCell(e.shiftKey ? -1 : 1)));
    });
    V(this, "_onEditorBlur", () => {
      this._navigatingEditor || this.state.editing && this.stopEditing(!1);
    });
    // ----- Tree data (self-referential parent_id) -----
    //
    // The model layer flattens the tree and hands us back a Map of per-row
    // metadata (level, hasChildren, expanded). The controller owns the
    // expanded/collapsed override Map; the model just calls back through
    // `isTreeRowExpanded` to ask which state a given row is in. Everything
    // else (filter, sort, paginate) flows through the normal pipeline.
    V(this, "_isTreeRowExpanded", (e, n) => {
      const s = String(e);
      if (this._treeExpanded.has(s)) return this._treeExpanded.get(s);
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
      pagination: { enabled: !1, page: 0, pageSize: Ht },
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = xi(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("paste", this._onPaste), document.removeEventListener("mousemove", this._onRowDragMove), this._thead?.removeEventListener("contextmenu", this._onHeaderContextMenu), this._thead?.removeEventListener("click", this._onSynthHeaderClick), this._tbody?.removeEventListener("dragenter", this._onCellDragEnter), this._tbody?.removeEventListener("dragover", this._onCellDragOver), this._tbody?.removeEventListener("dragleave", this._onCellDragLeave), this._tbody?.removeEventListener("drop", this._onCellDrop), this._closeColumnMenu(), this._teardownPersistence(), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove(), this._resizeObserver?.disconnect(), this._resizeObserver = null;
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((n, s) => {
      if (n.hasAttribute("data-separator")) {
        const c = n.getAttribute("data-separator"), d = { __sgSeparator: !0 };
        c && c !== "" && c !== "true" && (d.variant = c);
        const p = n.getAttribute("data-label"), f = n.getAttribute("data-value");
        return p != null && (d.label = p), f != null && (d.value = f), d;
      }
      const i = {}, o = n.getAttribute("data-row-id") || n.getAttribute("data-row-row-id-value");
      i[this.getRowIdValue] = o != null ? this._coerceRowId(o) : s + 1;
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
      e = x("table");
      const s = x("thead");
      e.appendChild(s), this.element.appendChild(e);
    }
    let n = e.querySelector("tbody");
    if (n || (n = x("tbody"), e.appendChild(n)), n.dataset.gridTarget = "body", this._tbody = n, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const s = x("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(s, e), s.appendChild(e), this._viewport = s;
    }
    if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = x("div", { class: "sg-status-bar", role: "status" }), this._statusBar.append(
      x("div", { class: "sg-status-section sg-status-left" }),
      x("div", { class: "sg-status-section sg-status-right" })
    ), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
      const s = x("div", { class: "sg-main" });
      this._viewport.parentNode.insertBefore(s, this._viewport), s.appendChild(this._viewport), this._statusBar && s.appendChild(this._statusBar), this._main = s, this._sidePanel = x("aside", {
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
    this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), this._restorePersistedState(), this._setupPersistence(), I(this.element, "grid:ready", { api: this.element.gridApi }), I(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  // Filter UI bridge — implemented by filter_controller, but the grid is the
  // single source of truth so it brokers the popover.
  openFilterFor(e, n) {
    const s = this._colByField(e);
    if (!(!s || !s.filter)) {
      this._closeFilterPopover();
      {
        this._openFallbackFilterPopover(s, n);
        return;
      }
    }
  }
  _closeFilterPopover() {
    this._filterPopover && (this._filterPopover.remove(), this._filterPopover = null, document.removeEventListener("mousedown", this._onDocMouseDown));
  }
  _openFallbackFilterPopover(e, n) {
    const s = this.state.filterModel[e.field] || {}, i = gl(e.filter), o = x("div", { class: "sg-filter-popover" }), a = x("select");
    i.forEach((m) => a.append(new Option(m.label, m.value, !1, m.value === s.type)));
    const l = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", c = x("input", { type: l, value: s.value ?? "" }), d = x("input", { type: l, value: s.value2 ?? "", style: { display: "none" } }), p = () => {
      const m = a.value, _ = m === "inRange", y = !(m === "blank" || m === "notBlank");
      c.style.display = y ? "" : "none", d.style.display = _ ? "" : "none";
    };
    a.addEventListener("change", p), p();
    const f = x("div", { class: "sg-filter-actions" }), g = x("button", { type: "button" }, "Clear"), h = x("button", { type: "button", class: "primary" }, "Apply");
    f.append(g, h), g.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), h.addEventListener("click", () => {
      const m = a.value, _ = m === "blank" || m === "notBlank" ? { filterType: e.filter, type: m } : { filterType: e.filter, type: m, value: c.value, value2: d.value || void 0 };
      this.setColumnFilter(e.field, _), this._closeFilterPopover();
    }), o.append(
      x("label", {}, "Condition"),
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
    const s = this.state.columnDefs.findIndex((c) => c.field === e.field), i = this._runtimeOverrides[e.field] || {}, o = s >= 0 ? this.state.columnDefs[s] : null, a = o ? {
      ...o.hidden != null ? { hidden: o.hidden } : {},
      ...o.pinned ? { pinned: o.pinned } : {},
      ...o.width != null ? { width: o.width } : {}
    } : {}, l = { ...e, ...i, ...a, _headerEl: n };
    if (s >= 0) {
      const c = this.state.columnDefs[s];
      if (c._headerEl === n && fl(c, l)) return;
      this.state.columnDefs[s] = l;
    } else
      this.state.columnDefs.push(l);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${oe(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((n) => n.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, n = !1) {
    const s = this.state.sortModel.findIndex((o) => o.colId === e);
    let i;
    s === -1 ? i = { colId: e, sort: "asc" } : this.state.sortModel[s].sort === "asc" ? i = { colId: e, sort: "desc" } : i = null, n ? (s >= 0 && this.state.sortModel.splice(s, 1), i && this.state.sortModel.push(i)) : this.state.sortModel = i ? [i] : [], this.scheduleRender("sort"), I(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  setSortModel(e) {
    this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), I(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  // ----- Filter -----
  setColumnFilter(e, n) {
    n == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = n, this.state.pagination.page = 0, this.scheduleRender("filter"), I(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setFilterModel(e) {
    this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), I(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setQuickFilter(e) {
    const n = e == null ? "" : String(e);
    n !== this.state.quickFilter && (this.state.quickFilter = n, this.state.pagination.page = 0, this.scheduleRender("filter"), I(this.element, "grid:filterChanged", {
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
    const s = this.state.selection;
    this.rowSelectionValue === "single" ? (s.clear(), s.add(e)) : n === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : n === "toggle" ? s.has(e) ? s.delete(e) : s.add(e) : (s.clear(), s.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), I(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(s)
    });
  }
  setSelected(e, n) {
    n ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), I(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  selectAll() {
    this._displayList.filteredSorted.forEach((e) => {
      !e.__sgGroup && !e.__sgSeparator && this.state.selection.add(this._rowId(e));
    }), this.scheduleRender("selection"), I(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  deselectAll() {
    this.state.selection.clear(), this.scheduleRender("selection"), I(this.element, "grid:selectionChanged", { selectedRows: [], selectedIds: [] });
  }
  getSelectedRows() {
    const e = this.state.selection;
    return this.state.rowData.filter((n) => e.has(this._rowId(n)));
  }
  _selectRange(e, n) {
    const s = this._displayList.filteredSorted, i = s.findIndex((c) => this._rowId(c) === e), o = s.findIndex((c) => this._rowId(c) === n);
    if (i < 0 || o < 0) return;
    const [a, l] = i <= o ? [i, o] : [o, i];
    for (let c = a; c <= l; c++)
      !s[c].__sgGroup && !s[c].__sgSeparator && this.state.selection.add(this._rowId(s[c]));
  }
  // ----- Pagination -----
  goToPage(e) {
    const n = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(e, n)), this.scheduleRender("page"), I(this.element, "grid:paginationChanged", {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  setPageSize(e) {
    this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), I(this.element, "grid:paginationChanged", {
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
    let s = jt(this.state.rowData, this.state.filterModel, e);
    return s = Ut(s, this.state.quickFilter, n), s.length;
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
  startEditingCell(e, n, s = void 0) {
    const i = this.state.columnDefs.find((a) => a.field === n);
    if (!i || !i.editable) return;
    const o = this.state.rowData.find((a) => this._rowId(a) === e);
    o && (this.state.editing = { rowId: e, colId: n, originalValue: z(o, i), initialValue: s }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: n, colId: s, originalValue: i, draftValue: o } = this.state.editing, a = this._tbody.querySelector(`tr[data-row-id="${oe(n)}"] td[data-col-id="${oe(s)}"]`);
    let l = i;
    if (!e && a) {
      const c = a.firstElementChild, d = c?.matches?.("[data-editor-input],input,select,textarea") ? c : a.querySelector("[data-editor-input]") || a.querySelector("input,select,textarea");
      d ? l = hl(d.value, this._colByField(s)?.type) : o !== void 0 && (l = o);
    }
    if (this.state.editing = null, !e && l !== i) {
      const c = this.state.rowData.find((p) => this._rowId(p) === n), d = c[s];
      c[s] = l, I(this.element, "grid:cellValueChanged", { rowId: n, colId: s, oldValue: d, newValue: l });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, n) {
    const s = this._colByField(e);
    s && (s.hidden = !n, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !n }, this.scheduleRender("columns"), I(this.element, "grid:columnVisible", { colId: e, visible: n }));
  }
  setColumnPinned(e, n) {
    const s = this._colByField(e);
    if (!s) return;
    const i = n || null;
    s.pinned = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: i }, this._reorderForPinning(), this.scheduleRender("columns"), I(this.element, "grid:columnPinned", { colId: e, pinned: i });
  }
  setColumnWidth(e, n) {
    const s = this._colByField(e);
    if (!s) return;
    const i = Math.max(s.minWidth || 40, Math.min(s.maxWidth || 4e3, n));
    s.width = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: i }, this.scheduleRender("columns"), I(this.element, "grid:columnResized", { colId: e, width: i });
  }
  moveColumn(e, n) {
    const s = this.state.columnDefs.findIndex((o) => o.field === e);
    if (s < 0 || s === n) return;
    const [i] = this.state.columnDefs.splice(s, 1);
    this.state.columnDefs.splice(n, 0, i), this.scheduleRender("columns"), I(this.element, "grid:columnMoved", { colId: e, fromIndex: s, toIndex: n });
  }
  autoSizeColumn(e) {
    const n = this._colByField(e);
    if (!n) return;
    const s = oe(e), i = this._thead?.querySelector(
      `th[data-header-cell-field-value="${s}"], th[data-field="${s}"]`
    ), o = Array.from(
      this._tbody?.querySelectorAll(`td[data-col-id="${s}"]`) || []
    ).filter((l) => !l.closest("tr")?.classList?.contains("sg-spacer"));
    let a = 0;
    if ((i || o.length) && (a = this._measureColumnContentWidth(i, o)), !a) {
      const l = (n.headerName || n.field || "").length, c = this.state.rowData.slice(0, 200);
      let d = l;
      for (const p of c) {
        const f = String(ee(p, n) ?? "").length;
        f > d && (d = f);
      }
      a = d * 8;
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, a + 16)));
  }
  // Build an off-screen single-column <table table-layout:auto> with clones
  // of the header + a sample of body cells, mount it inside .sg-grid so
  // scoped CSS still applies, read the natural td widths, return the max.
  _measureColumnContentWidth(e, n, s = 50) {
    const i = document.createElement("table");
    i.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;table-layout:auto;width:auto;border-collapse:separate;border-spacing:0;";
    const o = document.createElement("tbody");
    i.appendChild(o);
    const a = (c) => {
      if (!c) return;
      const d = document.createElement("tr"), p = c.cloneNode(!0);
      p.removeAttribute("style"), d.appendChild(p), o.appendChild(d);
    };
    if (a(e), n.slice(0, s).forEach(a), !o.children.length) return 0;
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
    const n = this._visibleCols(), s = n.reduce((o, a) => o + (a.width || 150), 0);
    if (s === 0) return;
    const i = e / s;
    n.forEach((o) => {
      o.width = Math.max(o.minWidth || 40, Math.floor((o.width || 150) * i));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((i) => i.pinned === "left"), n = this.state.columnDefs.filter((i) => i.pinned === "right"), s = this.state.columnDefs.filter((i) => !i.pinned);
    this.state.columnDefs = [...e, ...s, ...n];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), I(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const n = [], s = [], i = [], o = new Map(this.state.rowData.map((a) => [this._rowId(a), a]));
    return (e.remove || []).forEach((a) => {
      const l = this._rowId(a);
      o.delete(l) && i.push(a);
    }), (e.update || []).forEach((a) => {
      const l = this._rowId(a);
      o.has(l) && (o.set(l, { ...o.get(l), ...a }), s.push(a));
    }), (e.add || []).forEach((a) => {
      const l = this._rowId(a);
      o.has(l) || (o.set(l, a), n.push(a));
    }), this.state.rowData = Array.from(o.values()), this.scheduleRender("data"), I(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: n, updated: s, removed: i };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((n) => ({ ...n })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: n = !1 } = {}) {
    const s = this.state.columnDefs.filter((l) => !l.hidden && !l._isCheckbox), i = (n ? this.getSelectedRows() : this._displayList.filteredSorted).filter((l) => !l.__sgGroup && !l.__sgDetail && !l.__sgSeparator), o = (l) => /[",\n\r]/.test(l) ? `"${String(l).replace(/"/g, '""')}"` : String(l), a = [s.map((l) => o(l.headerName || l.field)).join(e)];
    for (const l of i)
      a.push(s.map((c) => o(ee(l, c))).join(e));
    return a.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...n } = {}) {
    const s = this.getDataAsCsv(n), i = new Blob([s], { type: "text/csv;charset=utf-8" }), o = URL.createObjectURL(i), a = x("a", { href: o, download: e });
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
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.has("tree") || e.size === 0) && (this._displayList = vi({
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
    const e = this._visibleCols(), n = wi(e, this._headerLayoutOpts());
    n.depth > 1 ? this._renderHeaderMultiRow(e, n) : this._renderHeaderSingleRow(e), this._renderColgroup(e);
  }
  // Aggregate the options we hand to buildHeaderLayout (auto-derived pivot
  // groups when in pivot mode, plus any user-declared columnGroups).
  _headerLayoutOpts() {
    const e = { columnGroups: this.columnGroupsValue || null };
    return this.state.pivot?.mode && this._displayList?.pivot && (e.pivotCols = (this.state.pivot.cols || []).map((n) => this._colByField(n)).filter(Boolean), e.valueConfigs = Object.entries(this.state.group.aggs || {}).map(([n, s]) => ({ col: this._colByField(n), aggFunc: s })).filter((n) => n.col)), e;
  }
  _renderColgroup(e) {
    let n = this._table.querySelector("colgroup");
    n || (n = x("colgroup"), this._table.insertBefore(n, this._thead));
    const s = Array.from(n.children);
    for (e.forEach((o, a) => {
      let l = s[a];
      l || (l = x("col"), n.appendChild(l)), l.style.width = o.width ? o.width + "px" : "";
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
      const f = x("tr");
      return this._thead.appendChild(f), f;
    })(), s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((f) => {
      const g = f.getAttribute("data-header-cell-field-value") || f.getAttribute("data-field");
      g && s.set(g, f);
    });
    const i = new Set(e.map((f) => f.field)), o = this.state.columnDefs.filter((f) => !i.has(f.field)), a = [...e, ...o], l = Array.from(n.children).map((f) => f.getAttribute("data-header-cell-field-value") || f.getAttribute("data-field")).filter(Boolean), c = a.map((f) => f.field);
    if (l.length === c.length && l.every((f, g) => f === c[g]))
      Array.from(n.children).forEach((f) => {
        f.removeAttribute("rowspan"), f.removeAttribute("colspan");
      });
    else {
      const f = [];
      for (const g of a) {
        let h = s.get(g.field);
        h ? (h.removeAttribute("rowspan"), h.removeAttribute("colspan")) : h = x("th", {
          "data-field": g.field,
          "data-synth": "true"
        }, [x("div", { class: "sg-header-content" }, [
          x("span", { class: "sg-header-label" }, g.headerName || g.field || "")
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
      const g = n.querySelector(`th[data-header-cell-field-value="${oe(f.field)}"]`) || n.querySelector(`th[data-field="${oe(f.field)}"]`);
      g && this._applyLeafThState(g, f, p);
    }
  }
  // Multi-row header: <thead> gets `layout.depth` rows of group headers
  // followed by the leaf headers, then one hidden row holding any registered
  // <th>s that aren't currently visible (so their controllers stay mounted).
  _renderHeaderMultiRow(e, n) {
    const s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((d) => {
      const p = d.getAttribute("data-header-cell-field-value") || d.getAttribute("data-field");
      p && s.set(p, d);
    });
    const i = [], o = new Set(e.map((d) => d.field)), a = this._pinOffsets();
    for (const d of n.rows) {
      const p = x("tr");
      for (const f of d) {
        if (f.kind === "group") {
          p.appendChild(x("th", {
            class: "sg-header-group",
            colspan: String(f.colspan),
            "data-group-header": "true"
          }, f.label || ""));
          continue;
        }
        const g = f.col;
        let h = s.get(g.field);
        if (h || (h = x("th", {
          "data-field": g.field,
          "data-synth": "true"
        }, [x("div", { class: "sg-header-content" }, [
          x("span", { class: "sg-header-label" }, f.label || g.headerName || g.field || "")
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
      const d = x("tr", { class: "sg-hidden-header-row" });
      for (const p of c) {
        let f = s.get(p.field);
        f || (f = x("th", { "data-field": p.field, "data-synth": "true" })), f.removeAttribute("rowspan"), f.removeAttribute("colspan"), d.appendChild(f);
      }
      i.push(d);
    }
    this._thead.replaceChildren(...i);
  }
  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(e, n, s) {
    const i = this.state.sortModel.find((o) => o.colId === n.field);
    Ct(e, {
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
    }), n.width && (e.style.width = n.width + "px"), e.style.left = n.pinned === "left" ? s.left[n.field] + "px" : "", e.style.right = n.pinned === "right" ? s.right[n.field] + "px" : "", this._ensureHeaderChrome(e, n, i);
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
    return typeof n == "string" && cl.has(n) ? "right" : null;
  }
  _ensureHeaderChrome(e, n, s) {
    if (n._isRowNumber) {
      e.classList.add("sg-gutter-header"), e.textContent = "";
      return;
    }
    if (n._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let l = e.querySelector('input[type="checkbox"]');
      l || (l = x("input", { type: "checkbox", "aria-label": "Select all" }), l.addEventListener("change", (p) => {
        p.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(l));
      const c = this._displayList.filteredSorted.length, d = this.state.selection.size;
      l.checked = d > 0 && d >= c, l.indeterminate = d > 0 && d < c;
      return;
    }
    let i = e.querySelector(".sg-header-content");
    if (!i) {
      const l = e.textContent.trim();
      e.textContent = "", i = x("div", { class: "sg-header-content" }, [
        x("span", { class: "sg-header-label" }, l || n.headerName || n.field || "")
      ]), e.appendChild(i);
    }
    let o = i.querySelector(".sg-sort-icon");
    if (n.sortable)
      if (o || (o = x("span", { class: "sg-sort-icon", "aria-hidden": "true" }), o.innerHTML = Ae, i.appendChild(o)), s && this.state.sortModel.length > 1) {
        let l = i.querySelector(".sg-sort-index");
        l || (l = x("span", { class: "sg-sort-index" }), i.appendChild(l)), l.textContent = String(this.state.sortModel.indexOf(s) + 1);
      } else
        i.querySelector(".sg-sort-index")?.remove();
    else o && o.remove();
    let a = i.querySelector(".sg-filter-icon");
    n.filter ? a || (a = x("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), a.innerHTML = ll, i.appendChild(a)) : a && a.remove(), n.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !n._isCheckbox && e.appendChild(x("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), n = this._withDetailRows(this._displayList.pageRows);
    this._selKeys = this._computeCellSelKeys();
    const s = !this.masterDetailValue && (this.virtualValue || n.length > 200);
    let i = n, o = 0;
    if (s) {
      const f = this._viewport?.clientHeight || 400, g = this.state.rowHeight, h = Ci(this.state.scrollTop, f, g, n.length, 8);
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
    if (s) {
      const f = this.state.rowHeight, g = o * f, h = (n.length - o - i.length) * f;
      l.appendChild(this._spacerRow(g, e.length)), i.forEach((b) => l.appendChild(this._buildRow(b, e, a, p(b)))), l.appendChild(this._spacerRow(h, e.length));
    } else
      i.forEach((f) => l.appendChild(this._buildRow(f, e, a, p(f))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && l.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(l);
  }
  _buildPinnedBottomRow(e) {
    const n = x("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), s = this._pinOffsets(), i = this._displayList.grandTotals || {};
    let o = !1;
    for (const a of e) {
      const l = x("td", { "data-col-id": a.field, "data-pinned": a.pinned || null });
      a.pinned === "left" ? l.style.left = s.left[a.field] + "px" : a.pinned === "right" && (l.style.right = s.right[a.field] + "px");
      const c = i[a.field];
      c != null ? (l.classList.add("sg-agg-cell"), l.textContent = this._formatAggregate(c)) : !o && !a._isCheckbox && !a._isRowNumber && (l.classList.add("sg-pinned-bottom-label"), l.textContent = "Total", o = !0), n.appendChild(l);
    }
    return n;
  }
  _buildRow(e, n, s, i) {
    if (e.__sgGroup) return this._buildGroupRow(e, n, s);
    if (e.__sgDetail) return this._buildDetailRow(e, n, s);
    if (e.__sgSeparator) return this._buildSeparatorRow(e, n, s);
    const o = String(this._rowId(e));
    let a = s.get(o);
    a || (a = x("tr")), a.dataset.rowId = o, a.classList.remove("sg-spacer");
    const l = this.state.selection.has(this._rowId(e)), c = this.masterDetailValue && this._isDetailExpanded(o);
    return Ct(a, {
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
  _buildSeparatorRow(e, n, s) {
    const i = `__s:${e.__sgSeparatorId ?? this._separatorKey(e)}`;
    let o = s.get(i);
    o || (o = x("tr")), o.dataset.rowId = i, o.dataset.separator = "true", o.className = "", o.removeAttribute("data-selected"), o.removeAttribute("data-detail-expanded");
    const a = e.variant || (e.value != null ? "summary" : e.label != null ? "heading" : "blank");
    o.classList.add("sg-separator-row", `sg-separator-${a}`), e.className && o.classList.add(e.className), o.innerHTML = "";
    const l = (p) => p._isCheckbox || p._isRowNumber || p._isGroupCol || p._isMasterExpand, d = n.filter((p) => !l(p)).length || n.length || 1;
    for (const p of n) {
      if (l(p)) {
        const g = x("td", { "data-col-id": p.field, class: "sg-separator-gutter" });
        o.appendChild(g);
        continue;
      }
      const f = x("td", {
        "data-col-id": p.field,
        colspan: String(d),
        class: "sg-separator-cell"
      });
      this._renderSeparatorContent(f, e, a), o.appendChild(f);
      break;
    }
    return o;
  }
  _renderSeparatorContent(e, n, s) {
    if (s === "blank" || s === "divider")
      return;
    const i = x("div", { class: "sg-separator-content" });
    n.label != null && i.appendChild(x("span", { class: "sg-separator-label" }, String(n.label))), n.value != null && i.appendChild(x("span", { class: "sg-separator-value" }, String(n.value))), e.appendChild(i);
  }
  _separatorKey(e) {
    return [e.variant || "", e.label || "", e.value || ""].join("|");
  }
  _spacerRow(e, n) {
    if (e <= 0) {
      const i = x("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return i.style.height = "0px", i.appendChild(x("td", { colspan: String(n), style: { height: "0px", padding: "0", border: "0" } })), i;
    }
    const s = x("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return s.style.height = e + "px", s.appendChild(x("td", { colspan: String(n), style: { height: e + "px", padding: "0", border: "0" } })), s;
  }
  _renderRow(e, n, s, i) {
    e.innerHTML = "";
    const o = this._pinOffsets(), a = this._selKeys || { active: null, range: null }, l = String(this._rowId(n)), c = this._displayList?.treeMeta, d = c ? c.get(l) : null, p = d ? this._treeDisplayColField() : null, f = n && n.__sgSpans || null;
    let g = 0;
    for (let h = 0; h < s.length; h++) {
      const b = s[h];
      if (g > 0) {
        g -= 1;
        continue;
      }
      const m = b._isRowNumber || b._isCheckbox || b._isGroupCol || b._isMasterExpand, _ = f && !m ? Number(f[b.field]) : 0, y = Math.max(1, Math.min(_ || 1, s.length - h));
      y > 1 && (g = y - 1);
      const w = `${l}:${b.field}`, C = x("td", {
        "data-col-id": b.field,
        "data-pinned": b.pinned || null,
        "data-cell-active": a.active === w ? "true" : null,
        "data-cell-range": a.range && a.range.has(w) ? "true" : null,
        colspan: y > 1 ? String(y) : null
      });
      if (y > 1 && C.classList.add("sg-merged-cell"), b.pinned === "left" ? C.style.left = o.left[b.field] + "px" : b.pinned === "right" && (C.style.right = o.right[b.field] + "px"), b._isRowNumber) {
        C.classList.add("sg-gutter-cell"), C.setAttribute("data-gutter", "true"), C.removeAttribute("data-cell-active"), C.removeAttribute("data-cell-range"), C.textContent = i != null ? String(i) : "", e.appendChild(C);
        continue;
      }
      if (b._isCheckbox) {
        C.classList.add("sg-checkbox-cell");
        const T = x("input", { type: "checkbox" });
        T.checked = this.state.selection.has(this._rowId(n)), C.appendChild(T), e.appendChild(C);
        continue;
      }
      if (b._isGroupCol) {
        C.classList.add("sg-group-leaf-cell"), C.removeAttribute("data-cell-active"), C.removeAttribute("data-cell-range"), e.appendChild(C);
        continue;
      }
      if (b._isMasterExpand) {
        C.classList.add("sg-master-expand-cell"), C.setAttribute("data-master-expand", "true"), C.removeAttribute("data-cell-active"), C.removeAttribute("data-cell-range");
        const T = this._isDetailExpanded(this._rowId(n)), M = x("span", {
          class: "sg-master-expand-caret",
          "data-expanded": T ? "true" : "false",
          "aria-hidden": "true"
        });
        M.innerHTML = Ae, C.appendChild(M), e.appendChild(C);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(n) && this.state.editing.colId === b.field) {
        C.setAttribute("data-editing", "true");
        const T = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : z(n, b), { node: M, control: $ } = this._buildEditor(b, T);
        C.appendChild(M);
        const L = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          if ($?.focus(), L || $?.select?.(), $?.type && dl.has($.type))
            try {
              $.showPicker?.();
            } catch {
            }
        });
      } else
        this._renderCellContent(C, n, b);
      d && b.field === p && this._decorateTreeCell(C, d), e.appendChild(C);
    }
  }
  // Prepend an indent spacer + a chevron (when the row has children) to the
  // tree column's <td>. The chevron carries data-tree-toggle so the body
  // click handler can route it back to toggleTreeRow without conflicting
  // with cell selection or row click handlers.
  _decorateTreeCell(e, n) {
    if (e.classList.add("sg-tree-cell"), e.setAttribute("data-tree-level", String(n.level)), e.style.paddingLeft = `${8 + n.level * 18}px`, n.hasChildren) {
      const s = x("span", {
        class: "sg-tree-chevron",
        "data-tree-toggle": "true",
        "data-expanded": n.expanded ? "true" : "false",
        "aria-hidden": "true"
      });
      s.innerHTML = Ae, e.insertBefore(s, e.firstChild);
    } else {
      const s = x("span", { class: "sg-tree-chevron sg-tree-chevron-leaf", "aria-hidden": "true" });
      e.insertBefore(s, e.firstChild);
    }
  }
  _renderCellContent(e, n, s) {
    if (s.cellRenderer) {
      const i = xt(s.cellRenderer);
      if (i) {
        const a = z(n, s), l = ee(n, s);
        (i.dataset.bind || i.dataset.bindText !== void 0) && (i.textContent = i.dataset.bind ? String(n[i.dataset.bind] ?? "") : l), i.dataset.bindAttr && i.setAttribute(i.dataset.bindAttr, a), i.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((c) => {
          c.dataset.bindText !== void 0 ? c.textContent = l : c.dataset.bind && (c.textContent = String(n[c.dataset.bind] ?? "")), c.dataset.bindAttr && c.setAttribute(c.dataset.bindAttr, a);
        }), e.appendChild(i);
        return;
      }
      const o = be(s.cellRenderer);
      if (typeof o == "function") {
        const a = z(n, s), l = ee(n, s), c = o({ value: a, row: n, col: s, td: e, formatted: l, api: this.element.gridApi });
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
    e.textContent = ee(n, s);
  }
  toggleGroup(e, n = 0) {
    this._groupExpanded.set(e, !this._isGroupExpanded(e, n)), this.scheduleRender("group"), I(this.element, "grid:groupToggled", { groupId: e, expanded: this._groupExpanded.get(e) });
  }
  expandAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = -1, this.scheduleRender("group");
  }
  collapseAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = 0, this.scheduleRender("group");
  }
  setRowGroupColumns(e) {
    this.state.group.cols = Array.isArray(e) ? e.slice() : [], this._groupExpanded.clear(), this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("group"), I(this.element, "grid:columnRowGroupChanged", { rowGroupCols: this.state.group.cols.slice() });
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
    n == null ? delete this.state.group.aggs[e] : this.state.group.aggs[e] = n, this.scheduleRender("group"), I(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  // ----- Pivot mode -----
  // Toggling pivot mode rebuilds the display list (and therefore the visible
  // column set). Clears row + cell selection since the underlying cell graph
  // changes shape entirely.
  setPivotMode(e) {
    const n = !!e;
    this.state.pivot.mode !== n && (this.state.pivot.mode = n, this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), I(this.element, "grid:pivotModeChanged", { pivot: n }));
  }
  isPivotMode() {
    return !!this.state.pivot.mode;
  }
  setPivotColumns(e) {
    this.state.pivot.cols = Array.isArray(e) ? e.slice() : [], this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), I(this.element, "grid:columnPivotChanged", { pivotCols: this.state.pivot.cols.slice() });
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
    for (const { field: s, aggFunc: i } of e || [])
      s && i && (n[s] = i);
    this.state.group.aggs = n, this.scheduleRender(this.state.pivot.mode ? "pivot" : "group"), I(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  addValueColumn(e, n = "sum") {
    e && this.setColumnAggFunc(e, n);
  }
  removeValueColumn(e) {
    this.setColumnAggFunc(e, null);
  }
  // ----- Column header groups + pinned bottom row -----
  setColumnGroups(e) {
    this.columnGroupsValue = Array.isArray(e) ? e : [], this.scheduleRender("columns"), I(this.element, "grid:columnGroupsChanged", { columnGroups: this.columnGroupsValue });
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
        const n = new Map(this.state.columnDefs.map((i) => [i.field, i])), s = [];
        for (const i of e.cols) {
          const o = n.get(i.field);
          o && (i.width != null && (o.width = i.width), o.pinned = i.pinned || void 0, o.hidden = !!i.hidden, n.delete(i.field), s.push(o));
        }
        for (const i of n.values()) s.push(i);
        this.state.columnDefs = s;
      }
      if (Array.isArray(e.rowGroupCols) && (this.state.group.cols = e.rowGroupCols.slice()), e.pivot && typeof e.pivot == "object" && (this.state.pivot.cols = Array.isArray(e.pivot.cols) ? e.pivot.cols.slice() : [], this.state.pivot.mode = !!e.pivot.mode), Array.isArray(e.values)) {
        const n = {};
        for (const { field: s, aggFunc: i } of e.values) s && i && (n[s] = i);
        this.state.group.aggs = n;
      }
      Array.isArray(e.columnGroups) && (this.columnGroupsValue = e.columnGroups), typeof e.pinnedBottomRow == "boolean" && (this.pinnedBottomRowValue = e.pinnedBottomRow), Array.isArray(e.sortModel) && (this.state.sortModel = e.sortModel.slice()), e.filterModel && typeof e.filterModel == "object" && (this.state.filterModel = { ...e.filterModel }), typeof e.quickFilter == "string" && (this.state.quickFilter = e.quickFilter);
      for (const n of ["columns", "group", "pivot", "sort", "filter", "data"])
        this.scheduleRender(n);
      I(this.element, "grid:columnStateApplied", { state: e });
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
    for (const n of Ot) this.element.addEventListener(n, e);
    this._persistBeforeUnload = () => {
      this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
    }, window.addEventListener("beforeunload", this._persistBeforeUnload);
  }
  _teardownPersistence() {
    if (this._persistListener) {
      for (const e of Ot) this.element.removeEventListener(e, this._persistListener);
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
  _buildGroupRow(e, n, s) {
    const i = `__g:${e.groupId}`;
    let o = s.get(i);
    return o || (o = x("tr")), o.dataset.rowId = i, o.dataset.group = "true", o.dataset.groupLevel = String(e.level), o.className = "sg-group-row", this._renderGroupRow(o, e, n), o;
  }
  _renderGroupRow(e, n, s) {
    e.innerHTML = "";
    const i = this._pinOffsets(), o = this._isGroupExpanded(n.groupId, n.level), a = (this.state.group.displayType || "singleColumn") === "singleColumn", l = !!(this.state.pivot?.mode && this._displayList?.pivot), c = n.__pivotAll === !0, d = s.filter((g) => !g._isRowNumber && !g._isCheckbox && !g._isGroupCol), p = d.some((g) => g.field === n.field) ? n.field : d[0]?.field, f = Math.max(0, n.level);
    c && e.classList.add("sg-pivot-all-row");
    for (const g of s) {
      const h = x("td", { "data-col-id": g.field, "data-pinned": g.pinned || null });
      if (g.pinned === "left" ? h.style.left = i.left[g.field] + "px" : g.pinned === "right" && (h.style.right = i.right[g.field] + "px"), g._isRowNumber || g._isCheckbox) {
        h.classList.add(g._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(h);
        continue;
      }
      if (l || a ? g._isGroupCol : g.field === p) {
        if (h.classList.add("sg-group-cell"), h.style.paddingLeft = `${8 + f * 18}px`, !c) {
          const m = x("span", {
            class: "sg-group-caret",
            "data-expanded": o ? "true" : "false",
            "aria-hidden": "true"
          });
          m.innerHTML = Ae, h.appendChild(m);
        }
        h.append(
          x("span", { class: "sg-group-label" }, this._groupValueLabel(n)),
          x("span", { class: "sg-group-count" }, ` (${n.count})`)
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
    const s = this._colByField(e.field);
    return s ? ee({ [e.field]: n }, s) : String(n);
  }
  _formatAggregate(e) {
    return e == null ? "" : typeof e == "number" ? Number.isInteger(e) ? String(e) : String(Math.round(e * 100) / 100) : String(e);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, n) {
    if (e.cellEditor) {
      const i = xt(e.cellEditor);
      if (i) {
        const o = i.matches?.("input,select,textarea,[data-editor-input]") ? i : i.querySelector?.("[data-editor-input]") || i.querySelector?.("input,select,textarea");
        return o && (this._seedEditorValue(o, e, n), o.addEventListener("keydown", this._onEditorKey), o.addEventListener("blur", this._onEditorBlur)), { node: i, control: o };
      }
    }
    const s = this._buildEditorInput(e, n);
    return { node: s, control: s };
  }
  _seedEditorValue(e, n, s) {
    if (n.type === "date" && s) {
      const i = s instanceof Date ? s : new Date(s);
      e.value = Number.isNaN(i?.getTime?.()) ? s ?? "" : i.toISOString().slice(0, 10);
    } else if (n.type === "datetime" && s) {
      const i = s instanceof Date ? s : new Date(s);
      if (Number.isNaN(i?.getTime?.()))
        e.value = s ?? "";
      else {
        const o = i.getTimezoneOffset() * 6e4;
        e.value = new Date(i.getTime() - o).toISOString().slice(0, 16);
      }
    } else n.type === "boolean" ? e.value = s === !0 ? "true" : s === !1 ? "false" : "" : e.value = s ?? "";
  }
  // Native input type per column `type`. HTML5 already covers most of what
  // the built-in renderers need (color picker, date picker, datetime-local
  // picker, native email/url/tel validation) — we just have to ask for the
  // right input type. Anything outside the known list falls through to a
  // plain text input, which is what cellEditor templates wrap when a column
  // wants something fancier.
  _buildEditorInput(e, n) {
    let s;
    if (e.type === "number") s = x("input", { type: "number", value: n ?? "" });
    else if (e.type === "date") {
      const i = n instanceof Date ? n : n ? new Date(n) : null, o = i ? i.toISOString().slice(0, 10) : "";
      s = x("input", { type: "date", value: o });
    } else if (e.type === "datetime") {
      const i = n instanceof Date ? n : n ? new Date(n) : null;
      let o = "";
      if (i && !Number.isNaN(i.getTime())) {
        const a = i.getTimezoneOffset() * 6e4;
        o = new Date(i.getTime() - a).toISOString().slice(0, 16);
      }
      s = x("input", { type: "datetime-local", value: o });
    } else if (e.type === "color") {
      const i = /^#[0-9a-f]{6}$/i.test(String(n ?? "")) ? n : "#000000";
      s = x("input", { type: "color", value: i });
    } else e.type === "email" ? s = x("input", { type: "email", value: n ?? "" }) : e.type === "url" ? s = x("input", { type: "url", value: n ?? "" }) : e.type === "tel" ? s = x("input", { type: "tel", value: n ?? "" }) : e.type === "boolean" ? (s = x("select"), s.append(
      new Option("—", ""),
      new Option("true", "true", n === !0, n === !0),
      new Option("false", "false", n === !1, n === !1)
    )) : s = x("input", { type: "text", value: n ?? "" });
    return s.addEventListener("keydown", this._onEditorKey), s.addEventListener("blur", this._onEditorBlur), s;
  }
  _renderPagination() {
    this.state.pagination.enabled;
  }
  // ----- Status bar (rows · selection · range aggregates) -----
  _renderStatusBar() {
    if (!this._statusBar) return;
    const e = this._statusBar.querySelector(".sg-status-left"), n = this._statusBar.querySelector(".sg-status-right");
    e.replaceChildren();
    const s = this.state.serverSide ? this.state.serverRowCount : this.state.rowData.length, i = this._displayList.grouped ? this._displayList.leafCount ?? this.filteredCount() : this.filteredCount();
    e.appendChild(this._statusPanel(
      "Rows",
      this._fmtInt(i),
      i !== s ? `of ${this._fmtInt(s)}` : null
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
    l !== this._lastRangeAggs && (this._lastRangeAggs = l, I(this.element, "grid:rangeAggsChanged", { aggs: a }));
  }
  _statusPanel(e, n, s = null) {
    const i = x("div", { class: "sg-status-panel" });
    return i.append(
      x("span", { class: "sg-status-label" }, `${e}:`),
      x("span", { class: "sg-status-value" }, n)
    ), s && i.appendChild(x("span", { class: "sg-status-aside" }, s)), i;
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
      const s = this._rangeRect(n);
      if (s)
        for (let i = s.r0; i <= s.r1; i++) {
          const o = s.rows[i];
          if (!(!o || o.__sgGroup || o.__sgDetail || o.__sgSeparator))
            for (let a = s.c0; a <= s.c1; a++) {
              const l = s.cols[a];
              !l || l._isCheckbox || l._isRowNumber || l._isGroupCol || l._isMasterExpand || e.push(z(o, l));
            }
        }
    }
    return e;
  }
  getRangeAggregates() {
    return this.state.cellSel.ranges.length ? di(this._cellRangeRawValues()) : null;
  }
  _showColumnMenu(e, n, s) {
    this._closeColumnMenu();
    const i = this._columnMenuItems(e), o = x("div", { class: "sg-column-menu", role: "menu" });
    for (const c of i) {
      if (c === "separator") {
        o.appendChild(x("div", { class: "sg-column-menu-separator", role: "separator" }));
        continue;
      }
      const d = x("button", {
        type: "button",
        class: "sg-column-menu-item" + (c.active ? " sg-column-menu-active" : ""),
        role: "menuitem"
      });
      d.append(
        x("span", { class: "sg-column-menu-label" }, c.label)
      ), c.active && d.append(x("span", { class: "sg-column-menu-check", "aria-hidden": "true" }, "✓")), d.addEventListener("click", () => {
        c.action(), this._closeColumnMenu();
      }), o.appendChild(d);
    }
    document.body.appendChild(o);
    const a = o.offsetWidth || 220, l = o.offsetHeight || 280;
    o.style.left = `${Math.min(n, window.innerWidth - a - 4)}px`, o.style.top = `${Math.min(s, window.innerHeight - l - 4)}px`, this._columnMenu = o, setTimeout(() => {
      document.addEventListener("mousedown", this._onDocMouseDownColumnMenu), document.addEventListener("keydown", this._onColumnMenuKey), window.addEventListener("resize", this._closeColumnMenuBound = () => this._closeColumnMenu(), { once: !0 }), window.addEventListener("scroll", this._closeColumnMenuBound, { once: !0, capture: !0 });
    }, 0), I(this.element, "grid:columnMenuOpened", { colId: e.field });
  }
  _closeColumnMenu() {
    this._columnMenu && (this._columnMenu.remove(), this._columnMenu = null, document.removeEventListener("mousedown", this._onDocMouseDownColumnMenu), document.removeEventListener("keydown", this._onColumnMenuKey), this._closeColumnMenuBound && (window.removeEventListener("resize", this._closeColumnMenuBound), window.removeEventListener("scroll", this._closeColumnMenuBound, { capture: !0 }), this._closeColumnMenuBound = null));
  }
  // Build the menu item list for `col` based on the current grid state. Each
  // item is { label, action, active? } or the string 'separator'. Items are
  // emitted only when they make sense (e.g. "Unpin" doesn't show on an
  // unpinned col), so the menu stays short.
  _columnMenuItems(e) {
    const n = this.element.gridApi, s = e.headerName || e.field, i = this.state.group.cols.includes(e.field), o = this.state.pivot.cols.includes(e.field), a = this.state.group.aggs[e.field], l = e.type === "number", c = [];
    if (e.pinned !== "left" && c.push({ label: "Pin left", action: () => n.setColumnPinned(e.field, "left") }), e.pinned !== "right" && c.push({ label: "Pin right", action: () => n.setColumnPinned(e.field, "right") }), e.pinned && c.push({ label: "Unpin", action: () => n.setColumnPinned(e.field, null) }), c.push("separator"), c.push({ label: "Autosize this column", action: () => n.autoSizeColumn(e.field) }), c.push({ label: "Autosize all columns", action: () => n.autoSizeAllColumns() }), c.push("separator"), c.push(i ? { label: `Ungroup ${s}`, action: () => n.removeRowGroupColumn(e.field) } : { label: `Group by ${s}`, action: () => n.addRowGroupColumn(e.field) }), c.push(o ? { label: `Remove ${s} from pivot`, action: () => n.removePivotColumn(e.field) } : { label: `Pivot by ${s}`, action: () => {
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
    const n = e?.closest?.("td"), s = e?.closest?.("tr");
    if (!n || !s || s.dataset.group === "true" || s.dataset.separator === "true" || s.classList.contains("sg-detail-row") || n.classList.contains("sg-checkbox-cell") || n.classList.contains("sg-group-leaf-cell") || n.classList.contains("sg-master-expand-cell") || n.dataset.gutter === "true" || !n.dataset.colId) return null;
    const i = n.dataset.colId, o = this._colByField(i);
    return o && o.acceptFiles === !1 ? null : { td: n, tr: s, colId: i, rowId: this._coerceRowId(s.dataset.rowId), col: o };
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
        this.clearCellSelection(), this.toggleRowSelection(o, c), I(this.element, "grid:rowClicked", { rowId: o, row: this.state.rowData.find((d) => this._rowId(d) === o), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (a) {
      const c = this.state.rowData.find((p) => this._rowId(p) === o), d = a.dataset.colId;
      I(this.element, "grid:cellClicked", { rowId: o, colId: d, value: c?.[d], event: e });
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
    this.toggleRowSelection(o, l), I(this.element, "grid:rowClicked", { rowId: o, row: this.state.rowData.find((c) => this._rowId(c) === o), event: e });
  }
  // ----- Cell selection (Numbers/Sheets-style: multi-range + active cell) -----
  _cellAt(e) {
    const n = e.closest?.("td"), s = e.closest?.("tr");
    return !n || !s || s.dataset.group === "true" || s.dataset.separator === "true" || s.classList.contains("sg-detail-row") || n.classList.contains("sg-checkbox-cell") || n.classList.contains("sg-group-leaf-cell") || n.classList.contains("sg-master-expand-cell") || n.dataset.gutter === "true" || !n.dataset.colId || n.dataset.editing === "true" ? null : { rowId: this._coerceRowId(s.dataset.rowId), colId: n.dataset.colId };
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
    const n = Array.from(this.state.selection).map(String), s = new Set(n.includes(String(e)) ? n : [String(e)]), i = x("div", { class: "sg-drag-ghost sg-grid" }), o = x("table"), a = x("tbody");
    let l = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((d) => {
      if (s.has(d.dataset.rowId) && l < 6) {
        const p = d.cloneNode(!0);
        p.removeAttribute("data-selected"), p.querySelectorAll("td").forEach((f) => {
          f.style.left = "", f.style.right = "", f.removeAttribute("data-pinned"), f.removeAttribute("data-cell-active"), f.removeAttribute("data-cell-range");
        }), a.appendChild(p), l += 1;
      }
    }), o.appendChild(a), i.appendChild(o), s.size > l && i.appendChild(x("div", { class: "sg-drag-ghost-more" }, `+${s.size - l} more rows`)), i.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(i);
    const c = x("div", { class: "sg-drop-indicator" });
    document.body.appendChild(c), this._rowDrag = { ids: s, ghost: i, indicator: c, dropRowId: null, dropBefore: !0 }, document.body.classList.add("sg-row-dragging");
  }
  _updateDropIndicator(e) {
    const n = Array.from(this._tbody.querySelectorAll("tr[data-row-id]"));
    let s = null, i = !0;
    for (const c of n) {
      const d = c.getBoundingClientRect();
      if (e < d.top + d.height / 2) {
        s = c, i = !0;
        break;
      }
      s = c, i = !1;
    }
    if (!s) return;
    const o = s.getBoundingClientRect(), a = this._viewport.getBoundingClientRect(), l = this._rowDrag.indicator;
    l.style.left = `${a.left}px`, l.style.width = `${a.width}px`, l.style.top = `${(i ? o.top : o.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(s.dataset.rowId), this._rowDrag.dropBefore = i;
  }
  _finishRowDrag() {
    const { ids: e, ghost: n, indicator: s, dropRowId: i, dropBefore: o } = this._rowDrag;
    if (n.remove(), s.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, i == null || e.has(String(i))) return;
    const a = this.state.rowData, l = a.filter((p) => e.has(String(this._rowId(p)))), c = a.filter((p) => !e.has(String(this._rowId(p))));
    let d = c.findIndex((p) => this._rowId(p) === i);
    d < 0 ? d = c.length : o || (d += 1), c.splice(d, 0, ...l), this.state.rowData = c, this.state.sortModel = [], this.scheduleRender("data"), I(this.element, "grid:rowDragEnd", {
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
      const s = n.parentElement, i = `${s && s.dataset.rowId}:${n.dataset.colId}`;
      e.active === i ? n.setAttribute("data-cell-active", "true") : n.removeAttribute("data-cell-active"), e.range && e.range.has(i) ? n.setAttribute("data-cell-range", "true") : n.removeAttribute("data-cell-range");
    }), this._renderStatusBar());
  }
  // Resolve a single cell's pasted text → value (or `undefined` to reject).
  // Renderer-defined `parseValue` wins; otherwise we fall back to the type-
  // aware default that knows how to coerce numbers, booleans, dates.
  _parsePasteValue(e, n, s) {
    if (s.cellRenderer) {
      const i = be(s.cellRenderer);
      if (i && typeof i.parseValue == "function")
        try {
          return i.parseValue(String(e ?? ""), {
            row: n,
            col: s,
            api: this.element.gridApi
          });
        } catch {
          return;
        }
    }
    return Hi(e, s);
  }
  // The clipboard-bound flip side of _parsePasteValue. Returns a string;
  // empty string is fine ("…\t\t…"). Renderer-defined `copyValue` wins;
  // otherwise we use the model's formatted display string (existing
  // behaviour — keeps non-renderer columns identical to v0).
  _copyCellValue(e, n) {
    const s = z(e, n), i = ee(e, n);
    if (n.cellRenderer) {
      const o = be(n.cellRenderer);
      if (o && typeof o.copyValue == "function")
        try {
          const a = o.copyValue({
            value: s,
            row: e,
            col: n,
            formatted: i,
            api: this.element.gridApi
          });
          return a == null ? "" : String(a);
        } catch {
        }
    }
    return Oi(s, n, i);
  }
  // Rectangle (display indices) for a {anchor,focus} range, or null.
  _rangeRect(e) {
    if (!e) return null;
    const n = this._displayList.pageRows, s = this._visibleCols(), i = (p) => n.findIndex((f) => this._rowId(f) === p), o = (p) => s.findIndex((f) => f.field === p), a = i(e.anchor.rowId), l = o(e.anchor.colId);
    if (a < 0 || l < 0) return null;
    const c = i(e.focus.rowId), d = o(e.focus.colId);
    return {
      r0: Math.min(a, c < 0 ? a : c),
      r1: Math.max(a, c < 0 ? a : c),
      c0: Math.min(l, d < 0 ? l : d),
      c1: Math.max(l, d < 0 ? l : d),
      rows: n,
      cols: s
    };
  }
  _activeRect() {
    return this._rangeRect(this.state.cellSel.ranges[this.state.cellSel.activeIdx]);
  }
  _cellRangeRows(e = this._activeRect()) {
    if (!e) return [];
    const n = [];
    for (let s = e.r0; s <= e.r1; s++) {
      const i = e.rows[s];
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
    const n = `${e.rowId}:${e.colId}`, s = /* @__PURE__ */ new Set();
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
              p !== n && s.add(p);
            }
        }
    }
    return { active: n, range: s };
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
      const s = this._rangeRect(n);
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
  _moveActiveCell(e, n, s) {
    const i = this._displayList.pageRows, o = this._navCols();
    if (!i.length || !o.length) return;
    const a = (f, g, h) => Math.max(g, Math.min(f, h)), l = this._activeCell(), c = () => i.findIndex((f) => !f.__sgGroup && !f.__sgDetail && !f.__sgSeparator);
    let d = l ? i.findIndex((f) => this._rowId(f) === l.rowId) : c(), p = l ? o.findIndex((f) => f.field === l.colId) : 0;
    if (d < 0 && (d = c()), !(d < 0)) {
      if (p < 0 && (p = 0), s && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
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
      this._applyCellSelHighlight(), this._scrollActiveIntoView(), I(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
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
    }, this._applyCellSelHighlight(), I(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
  }
  // Clear the value of every selected, editable cell (Delete/Backspace).
  _clearSelectedCells() {
    let e = !1;
    for (const n of this.state.cellSel.ranges) {
      const s = this._rangeRect(n);
      if (s)
        for (let i = s.r0; i <= s.r1; i++) {
          const o = s.rows[i];
          if (!(!o || o.__sgGroup || o.__sgDetail || o.__sgSeparator))
            for (let a = s.c0; a <= s.c1; a++) {
              const l = s.cols[a];
              if (!l || !l.editable || l._isCheckbox || l._isRowNumber) continue;
              const c = o[l.field];
              c === "" || c == null || (o[l.field] = "", e = !0, I(this.element, "grid:cellValueChanged", { rowId: this._rowId(o), colId: l.field, oldValue: c, newValue: "" }));
            }
        }
    }
    return e && this.scheduleRender("cells"), e;
  }
  _scrollActiveIntoView() {
    this._tbody?.querySelector('td[data-cell-active="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  _onBodyDblClick(e) {
    const n = e.target.closest("tr"), s = e.target.closest("td");
    if (!n || !s || s.dataset.editing === "true") return;
    const i = this._coerceRowId(n.dataset.rowId), o = s.dataset.colId;
    this.startEditingCell(i, o);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const n = this.state.editing;
    if (!n) return;
    const s = this._visibleCols().filter((f) => f.editable && !f._isCheckbox), i = this._displayList.pageRows, o = i.findIndex((f) => this._rowId(f) === n.rowId), a = s.findIndex((f) => f.field === n.colId);
    if (!s.length || !i.length || o < 0 || a < 0) {
      this.stopEditing(!1);
      return;
    }
    const l = i.length * s.length, c = (o * s.length + a + e + l) % l, d = i[Math.floor(c / s.length)], p = s[c % s.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(d), p.field), requestAnimationFrame(() => {
      this._navigatingEditor = !1;
    });
  }
  // Wire editor listeners whenever a cell mounts an input.
  // Done lazily via MutationObserver on tbody (cheap because tbody is small per page).
  // ----- Helpers -----
  _visibleCols() {
    const e = this.state.columnDefs.filter((l) => !l.hidden), n = this.state.group?.cols || [], s = this.masterDetailValue && !this.state.pivot?.mode && !n.length;
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
      return s ? [this._masterExpandCol(), ...e] : e;
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
    for (const s of e) {
      if (n.push(s), s.__sgGroup || s.__sgDetail || s.__sgSeparator) continue;
      const i = this._rowId(s);
      this._isDetailExpanded(i) && n.push({ __sgDetail: !0, master: s, masterId: i });
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
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === n);
    I(this.element, "grid:detailRowExpanded", { rowId: e, masterRow: s });
  }
  collapseDetailRow(e) {
    if (!this.masterDetailValue) return;
    const n = String(e);
    if (!this._detailExpanded.has(n)) return;
    this._detailExpanded.delete(n), this._detailGrids.delete(n), this.scheduleRender("cells");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === n);
    I(this.element, "grid:detailRowCollapsed", { rowId: e, masterRow: s });
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
    const n = String(e), s = this._isTreeRowExpanded(n, 0);
    this._treeExpanded.set(n, !s), this.scheduleRender("tree");
    const i = this.state.rowData.find((o) => String(this._rowId(o)) === n);
    I(this.element, s ? "grid:treeRowCollapsed" : "grid:treeRowExpanded", { rowId: e, row: i });
  }
  expandTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const n = String(e);
    if (this._isTreeRowExpanded(n, 0)) return;
    this._treeExpanded.set(n, !0), this.scheduleRender("tree");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === n);
    I(this.element, "grid:treeRowExpanded", { rowId: e, row: s });
  }
  collapseTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const n = String(e);
    if (!this._isTreeRowExpanded(n, 0)) return;
    this._treeExpanded.set(n, !1), this.scheduleRender("tree");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === n);
    I(this.element, "grid:treeRowCollapsed", { rowId: e, row: s });
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
    this.treeDataValue !== n && (this.treeDataValue = n, this.state.tree.enabled = n, n || this._treeExpanded.clear(), this.scheduleRender("tree"), I(this.element, "grid:treeDataChanged", { treeData: n }));
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
  _buildDetailRow(e, n, s) {
    const i = `__d:${e.masterId}`;
    let o = s.get(i);
    const a = String(e.masterId);
    if (o) {
      if (o.getAttribute("data-master-id") === a)
        return o.classList.remove("sg-spacer"), o;
      o = null;
    }
    o || (o = x("tr")), o.className = "sg-detail-row", o.dataset.rowId = i, o.setAttribute("data-master-id", a), o.innerHTML = "";
    const l = x("td", { colspan: String(n.length || 1), class: "sg-detail-cell" }), c = x("div", { class: "sg-detail-shell" });
    return c.style.minHeight = `${this.detailRowHeightValue}px`, l.appendChild(c), o.appendChild(l), this._populateDetailShell(c, e.master, e.masterId), o;
  }
  // Fill the detail shell. Strategy: if the grid has a detail-template value
  // pointing at an existing <template>, clone its content and run a tiny
  // data-bind pass keyed off the master row. Otherwise render a minimal
  // fallback so the panel still appears (handy when the user is wiring up
  // their first detail panel and hasn't authored a template yet).
  _populateDetailShell(e, n, s) {
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
      const l = x("div", { class: "sg-detail-fallback" }), c = Object.keys(n || {}).filter((d) => !d.startsWith("_") && !d.startsWith("__")).slice(0, 6);
      for (const d of c)
        l.append(
          x("span", { class: "sg-detail-fallback-label" }, `${d}: `),
          x("span", { class: "sg-detail-fallback-value" }, String(n[d] ?? "")),
          x("span", { class: "sg-detail-fallback-sep" }, "  ·  ")
        );
      l.lastElementChild?.remove(), e.appendChild(l);
    }
    const a = e.querySelector('[data-controller~="grid"]');
    a && this._seedNestedGrid(a, n, s), queueMicrotask(() => {
      I(this.element, "grid:detailRowMounted", {
        rowId: s,
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
  _seedNestedGrid(e, n, s) {
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
      e.gridApi && this._detailGrids.set(String(s), e.gridApi);
    });
  }
  _pinOffsets() {
    const e = this._visibleCols(), n = {};
    let s = 0;
    for (const o of e)
      o.pinned === "left" && (n[o.field] = s, s += o.width || 150);
    const i = {};
    s = 0;
    for (let o = e.length - 1; o >= 0; o--) {
      const a = e[o];
      a.pinned === "right" && (i[a.field] = s, s += a.width || 150);
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
V(bt, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: Ht },
  rowHeight: { type: Number, default: al },
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
function fl(t, r) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const n of e) if (t[n] !== r[n]) return !1;
  return !0;
}
function gl(t) {
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
function hl(t, r) {
  if (r === "number") {
    const e = Number(t);
    return Number.isFinite(e) ? e : t;
  }
  if (r === "date") return t;
  if (r === "datetime") {
    if (!t) return t;
    const e = new Date(t);
    return Number.isNaN(e.getTime()) ? t : e.toISOString();
  }
  return r === "boolean" ? t === "true" ? !0 : t === "false" ? !1 : null : t;
}
function oe(t) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(t)) : String(t).replace(/["\\\n\r]/g, (r) => "\\" + r);
}
class yt extends se {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    V(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const n = e.clientX, s = e.clientY;
      let i = !1;
      const o = (l) => {
        const c = Math.abs(l.clientX - n), d = Math.abs(l.clientY - s);
        !i && (c > 5 || d > 5) && (i = !0, document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), this._beginReorder(n));
      }, a = (l) => {
        document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), i || this.sort(l);
      };
      document.addEventListener("mousemove", o), document.addEventListener("mouseup", a);
    });
  }
  connect() {
    if (this.grid = Si(this.element, "grid", this.application), !!this.grid) {
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
      cellRendererConfig: n,
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
    const n = this.element.parentElement, s = Array.from(n.children), i = s.indexOf(this.element);
    let o = i;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const a = (c) => {
      const d = c.clientX;
      let p = s.length;
      for (let f = 0; f < s.length; f++) {
        const g = s[f].getBoundingClientRect();
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
    const n = e.clientX, s = this.element.offsetWidth, i = (a) => this.grid.setColumnWidth(this.fieldValue, s + (a.clientX - n)), o = () => {
      document.removeEventListener("mousemove", i), document.removeEventListener("mouseup", o), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", i), document.addEventListener("mouseup", o), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
V(yt, "values", {
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
class Xs extends se {
  connect() {
  }
}
class Js extends se {
  connect() {
  }
}
class Qs extends se {
  connect() {
  }
}
class We extends se {
  constructor() {
    super(...arguments);
    V(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const n = e.paginationGetCurrentPage(), s = e.paginationGetTotalPages(), i = e.paginationGetRowCount(), o = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const a = i === 0 ? 0 : n * o + 1, l = Math.min(i, a + o - 1);
        this.pageInfoTarget.textContent = i === 0 ? "0 rows" : `${a}–${l} of ${i}`;
      }
      this.hasFirstTarget && (this.firstTarget.disabled = n === 0), this.hasPrevTarget && (this.prevTarget.disabled = n === 0), this.hasNextTarget && (this.nextTarget.disabled = n >= s - 1), this.hasLastTarget && (this.lastTarget.disabled = n >= s - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(o));
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
V(We, "outlets", ["grid"]), V(We, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
const it = ["sum", "avg", "count", "min", "max"], ml = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', bl = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class ei extends se {
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
    this.element.innerHTML = "", this._content = x("div", { class: "sg-side-panel-content" });
    const r = x("div", { class: "sg-side-panel-tabs" });
    this._columnsTab = x("button", {
      type: "button",
      class: "sg-side-panel-tab",
      "aria-pressed": "true",
      title: "Columns"
    }), this._columnsTab.innerHTML = ml, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), r.appendChild(this._columnsTab), this.element.append(this._content, r);
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
    const e = x("label", { class: "sg-panel-pivot-toggle" }), n = x("input", { type: "checkbox" });
    n.checked = r.isPivotMode(), n.addEventListener("change", () => r.setPivotMode(n.checked)), e.append(n, x("span", {}, "Pivot mode")), this._content.appendChild(e), this._content.appendChild(this._renderColumnsList()), this._content.appendChild(this._renderDropSection({
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
    const r = this._api(), e = x("div", { class: "sg-panel-section" });
    e.appendChild(x("div", { class: "sg-panel-section-title" }, "Columns"));
    const n = x("ul", { class: "sg-column-list" });
    e.appendChild(n);
    const s = new Set(r.getRowGroupColumns()), i = new Set(r.getPivotColumns()), o = new Map(r.getValueColumns().map((a) => [a.field, a.aggFunc]));
    for (const a of this._columns()) {
      const l = x("li", { class: "sg-column-list-item", draggable: "true" });
      l.dataset.field = a.field;
      const c = x("span", { class: "sg-column-grip", "aria-hidden": "true" });
      c.innerHTML = bl;
      const d = x("input", { type: "checkbox" });
      d.checked = !a.hidden, d.addEventListener("change", () => r.setColumnVisible(a.field, d.checked));
      const p = x("span", { class: "sg-column-list-label" }, a.headerName || a.field), f = x("span", { class: "sg-column-list-tags" });
      s.has(a.field) && f.appendChild(x("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), i.has(a.field) && f.appendChild(x("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), o.has(a.field) && f.appendChild(x("span", { class: "sg-tag sg-tag-value", title: `Value (${o.get(a.field)})` }, o.get(a.field))), l.append(c, d, p, f), this._wireDragSource(l, a.field), n.appendChild(l);
    }
    return this._wireDropZone(n, "columns"), e;
  }
  _renderDropSection({ title: r, placeholder: e, kind: n, fields: s }) {
    const i = x("div", { class: "sg-panel-section sg-panel-drop" });
    i.appendChild(x("div", { class: "sg-panel-section-title" }, r));
    const o = x("div", { class: "sg-drop-zone" });
    if (o.dataset.dropKind = n, !s.length)
      o.classList.add("sg-drop-zone-empty"), o.appendChild(x("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const a of s) o.appendChild(this._renderChip(n, a));
    return this._wireDropZone(o, n), i.appendChild(o), i;
  }
  _renderValuesSection() {
    const r = this._api(), e = x("div", { class: "sg-panel-section sg-panel-drop" });
    e.appendChild(x("div", { class: "sg-panel-section-title" }, "Values"));
    const n = x("div", { class: "sg-drop-zone" });
    n.dataset.dropKind = "value";
    const s = r.getValueColumns();
    if (!s.length)
      n.classList.add("sg-drop-zone-empty"), n.appendChild(x("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
    else
      for (const { field: i, aggFunc: o } of s) n.appendChild(this._renderValueChip(i, o));
    return this._wireDropZone(n, "value"), e.appendChild(n), e;
  }
  _renderChip(r, e) {
    const n = this._colByField(e), s = x("span", { class: "sg-chip", draggable: "true" });
    return s.dataset.field = e, s.dataset.fromKind = r, s.append(
      x("span", { class: "sg-chip-label" }, n?.headerName || e),
      this._removeButton(() => this._removeFrom(r, e))
    ), this._wireDragSource(s, e), s;
  }
  _renderValueChip(r, e) {
    const n = this._api(), s = this._colByField(r), i = x("span", { class: "sg-chip sg-chip-value", draggable: "true" });
    i.dataset.field = r, i.dataset.fromKind = "value";
    const o = x("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return o.addEventListener("click", (a) => {
      a.stopPropagation();
      const l = it.indexOf(e), c = it[(l === -1 ? 0 : l + 1) % it.length];
      n.setColumnAggFunc(r, c);
    }), i.append(
      o,
      x("span", { class: "sg-chip-label" }, s?.headerName || r),
      this._removeButton(() => n.removeValueColumn(r))
    ), this._wireDragSource(i, r), i;
  }
  _removeButton(r) {
    const e = x("button", { type: "button", class: "sg-chip-remove", "aria-label": "Remove", title: "Remove" });
    return e.textContent = "×", e.addEventListener("click", (n) => {
      n.stopPropagation(), r();
    }), e;
  }
  // ----- DnD plumbing -----
  _wireDragSource(r, e) {
    r.addEventListener("dragstart", (n) => {
      n.dataTransfer.effectAllowed = "move", n.dataTransfer.setData("text/plain", e), r.classList.add("sg-dragging");
    }), r.addEventListener("dragend", () => r.classList.remove("sg-dragging"));
  }
  _wireDropZone(r, e) {
    r.addEventListener("dragover", (n) => {
      n.preventDefault(), n.dataTransfer.dropEffect = "move", r.classList.add("sg-drop-over");
    }), r.addEventListener("dragleave", (n) => {
      n.target === r && r.classList.remove("sg-drop-over");
    }), r.addEventListener("drop", (n) => {
      n.preventDefault(), r.classList.remove("sg-drop-over");
      const s = n.dataTransfer.getData("text/plain");
      s && this._handleDrop(e, s);
    });
  }
  // A field lives in at most one of {rowGroup, pivot, value} at a time.
  // Dropping on a zone removes it from the others first.
  _handleDrop(r, e) {
    const n = this._api();
    if (r === "columns") {
      this._removeEverywhere(e);
      return;
    }
    this._removeEverywhere(e, r), r === "rowGroup" ? n.addRowGroupColumn(e) : r === "pivot" ? n.addPivotColumn(e) : r === "value" && n.addValueColumn(e, "sum");
  }
  _removeFrom(r, e) {
    const n = this._api();
    r === "rowGroup" ? n.removeRowGroupColumn(e) : r === "pivot" ? n.removePivotColumn(e) : r === "value" && n.removeValueColumn(e);
  }
  _removeEverywhere(r, e = null) {
    const n = this._api();
    e !== "rowGroup" && n.removeRowGroupColumn(r), e !== "pivot" && n.removePivotColumn(r), e !== "value" && n.removeValueColumn(r);
  }
}
function yl(t) {
  const r = t ?? ri.start();
  return r.register("grid", bt), r.register("header-cell", yt), r.register("row", Xs), r.register("cell", Js), r.register("filter", Qs), r.register("pagination", We), r.register("side-panel", ei), r;
}
const wl = {
  start: yl,
  GridController: bt,
  HeaderCellController: yt,
  RowController: Xs,
  CellController: Js,
  FilterController: Qs,
  PaginationController: We,
  SidePanelController: ei,
  registerRenderer: v,
  getRenderer: be,
  listRenderers: Fi,
  renderers: ol
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = wl);
export {
  Js as CellController,
  Qs as FilterController,
  bt as GridController,
  yt as HeaderCellController,
  We as PaginationController,
  Xs as RowController,
  ei as SidePanelController,
  wl as default,
  be as getRenderer,
  Fi as listRenderers,
  v as registerRenderer,
  ol as renderers,
  yl as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
