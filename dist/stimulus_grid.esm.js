var Be = Object.defineProperty;
var Ge = (r, n, e) => n in r ? Be(r, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[n] = e;
var x = (r, n, e) => Ge(r, typeof n != "symbol" ? n + "" : n, e);
import { Controller as N, Application as $e } from "@hotwired/stimulus";
function M(r, n) {
  return typeof n.valueGetter == "function" ? n.valueGetter(r) : r?.[n.field];
}
function k(r, n) {
  const e = M(r, n);
  return typeof n.valueFormatter == "function" ? n.valueFormatter(e, r) : e == null ? "" : n.type === "date" && e instanceof Date ? e.toLocaleDateString() : n.type === "boolean" ? e ? "✓" : "" : String(e);
}
const ne = {
  contains: (r, n) => String(r ?? "").toLowerCase().includes(String(n ?? "").toLowerCase()),
  notContains: (r, n) => !String(r ?? "").toLowerCase().includes(String(n ?? "").toLowerCase()),
  equals: (r, n) => String(r ?? "").toLowerCase() === String(n ?? "").toLowerCase(),
  notEqual: (r, n) => String(r ?? "").toLowerCase() !== String(n ?? "").toLowerCase(),
  startsWith: (r, n) => String(r ?? "").toLowerCase().startsWith(String(n ?? "").toLowerCase()),
  endsWith: (r, n) => String(r ?? "").toLowerCase().endsWith(String(n ?? "").toLowerCase()),
  blank: (r) => r == null || r === "",
  notBlank: (r) => r != null && r !== ""
}, ze = {
  equals: (r, n) => Number(r) === Number(n),
  notEqual: (r, n) => Number(r) !== Number(n),
  lessThan: (r, n) => Number(r) < Number(n),
  lessThanOrEqual: (r, n) => Number(r) <= Number(n),
  greaterThan: (r, n) => Number(r) > Number(n),
  greaterThanOrEqual: (r, n) => Number(r) >= Number(n),
  inRange: (r, n, e) => Number(r) >= Number(n) && Number(r) <= Number(e),
  blank: (r) => r == null || r === "",
  notBlank: (r) => r != null && r !== ""
};
function L(r) {
  if (r == null || r === "") return null;
  if (r instanceof Date) return r;
  const n = new Date(r);
  return Number.isNaN(n.valueOf()) ? null : n;
}
const Oe = {
  equals: (r, n) => L(r)?.toDateString() === L(n)?.toDateString(),
  notEqual: (r, n) => L(r)?.toDateString() !== L(n)?.toDateString(),
  lessThan: (r, n) => (L(r)?.valueOf() ?? -1 / 0) < (L(n)?.valueOf() ?? 1 / 0),
  greaterThan: (r, n) => (L(r)?.valueOf() ?? 1 / 0) > (L(n)?.valueOf() ?? -1 / 0),
  inRange: (r, n, e) => {
    const t = L(r)?.valueOf();
    return t != null && t >= (L(n)?.valueOf() ?? -1 / 0) && t <= (L(e)?.valueOf() ?? 1 / 0);
  },
  blank: (r) => r == null || r === "",
  notBlank: (r) => r != null && r !== ""
}, He = {
  equals: (r, n) => n === "true" ? !!r : n === "false" ? !r : !0
}, qe = {
  in: (r, n) => Array.isArray(n) && n.includes(String(r ?? ""))
}, Ke = { text: ne, number: ze, date: Oe, boolean: He, set: qe };
function re(r, n, e) {
  if (!e) return !0;
  const t = e.filterType || n.filter || "text", i = (Ke[t] || ne)[e.type];
  if (!i) return !0;
  const l = M(r, n);
  return i(l, e.value, e.value2);
}
function le(r, n, e) {
  const t = Object.entries(n || {}).filter(([, s]) => s != null);
  return t.length === 0 ? r : r.filter((s) => t.every(([i, l]) => {
    const o = e[i];
    return o ? re(s, o, l) : !0;
  }));
}
function oe(r, n, e) {
  if (!n) return r;
  const t = String(n).toLowerCase();
  return r.filter((s) => {
    for (const i of e) {
      const l = k(s, i);
      if (l && String(l).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function P(r, n, e) {
  if (r == null && n == null) return 0;
  if (r == null) return -1;
  if (n == null) return 1;
  if (e === "number") return Number(r) - Number(n);
  if (e === "date") {
    const t = L(r)?.valueOf() ?? 0, s = L(n)?.valueOf() ?? 0;
    return t - s;
  }
  return e === "boolean" ? r === n ? 0 : r ? 1 : -1 : String(r).localeCompare(String(n), void 0, { numeric: !0, sensitivity: "base" });
}
function We(r, n, e) {
  if (!n || n.length === 0) return r;
  const t = r.slice();
  return t.sort((s, i) => {
    for (const { colId: l, sort: o } of n) {
      const a = e[l];
      if (!a) continue;
      const d = M(s, a), u = M(i, a), h = typeof a.comparator == "function" ? a.comparator(d, u, s, i) : P(d, u, a.type);
      if (h !== 0) return o === "desc" ? -h : h;
    }
    return 0;
  }), t;
}
function z(r, n) {
  if (!n || !n.enabled) return { rows: r, total: r.length, pageRows: r };
  const e = r.length, t = Math.max(1, Math.ceil(e / n.pageSize)), s = Math.min(n.page, t - 1), i = s * n.pageSize, l = r.slice(i, i + n.pageSize);
  return { rows: r, total: e, totalPages: t, page: s, pageRows: l };
}
function ae(r, n, e) {
  if (r === "count") return n.length;
  const t = n.map((i) => M(i, e));
  if (r === "first") return t.length ? t[0] : null;
  if (r === "last") return t.length ? t[t.length - 1] : null;
  const s = t.map(Number).filter((i) => !Number.isNaN(i));
  switch (r) {
    case "sum":
      return s.reduce((i, l) => i + l, 0);
    case "avg":
      return s.length ? s.reduce((i, l) => i + l, 0) / s.length : null;
    case "min":
      return s.length ? Math.min(...s) : null;
    case "max":
      return s.length ? Math.max(...s) : null;
    default:
      return null;
  }
}
function q(r, n, e) {
  const t = {};
  for (const [s, i] of Object.entries(n || {})) {
    const l = e[s];
    l && (t[s] = ae(i, r, l));
  }
  return t;
}
function je(r) {
  let n = 0, e = 0, t = 0, s = 1 / 0, i = -1 / 0;
  for (const l of r) {
    if (l == null || l === "") continue;
    n += 1;
    let o = null;
    if (typeof l == "number" && Number.isFinite(l)) o = l;
    else if (typeof l == "string" && l.trim() !== "") {
      const a = Number(l);
      Number.isFinite(a) && (o = a);
    }
    o != null && (e += 1, t += o, o < s && (s = o), o > i && (i = o));
  }
  return {
    count: n,
    sum: e ? t : null,
    avg: e ? t / e : null,
    min: e ? s : null,
    max: e ? i : null
  };
}
function Ue(r, n, e, t, s = () => !0) {
  const i = (d, u, h) => {
    const c = n[u], g = /* @__PURE__ */ new Map();
    for (const f of d) {
      const v = M(f, c), m = v == null ? "" : String(v);
      g.has(m) || g.set(m, { value: v, rows: [] }), g.get(m).rows.push(f);
    }
    return Array.from(g.values()).sort((f, v) => P(f.value, v.value, c.type)).map(({ value: f, rows: v }) => {
      const m = f == null ? "" : String(f), w = h ? `${h}|${c.field}=${m}` : `${c.field}=${m}`;
      return {
        __sgGroup: !0,
        level: u,
        field: c.field,
        value: f,
        groupId: w,
        count: v.length,
        aggregates: q(v, t, e),
        leaves: v,
        children: u + 1 < n.length ? i(v, u + 1, w) : null
      };
    });
  }, l = i(r, 0, ""), o = [], a = (d) => {
    for (const u of d)
      if (o.push(u), !!s(u.groupId, u.level))
        if (u.children) a(u.children);
        else for (const h of u.leaves) o.push(h);
  };
  return a(l), { displayList: o, tree: l };
}
function de(r, n, e) {
  return `__p|${e.map((s) => {
    const i = r[s.field];
    return `${s.field}=${i == null ? "" : String(i)}`;
  }).join("|")}|${n.col.field}:${n.aggFunc}`;
}
function ue(r, n) {
  return n.map((e) => {
    const t = M(r, e);
    return t == null ? "" : String(t);
  }).join("");
}
function Xe(r, n) {
  if (!n?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const t of r) {
    const s = ue(t, n);
    if (!e.has(s)) {
      const i = {};
      n.forEach((l) => {
        const o = M(t, l);
        i[l.field] = o ?? null;
      }), e.set(s, i);
    }
  }
  return Array.from(e.values()).sort((t, s) => {
    for (const i of n) {
      const l = P(t[i.field], s[i.field], i.type);
      if (l !== 0) return l;
    }
    return 0;
  });
}
function Ye(r, n, e) {
  if (!r.length || !n.length) return [];
  const t = [], s = n.length === 1;
  for (const i of r)
    for (const l of n) {
      const o = de(i, l, e), a = e.map((u) => i[u.field] == null ? "(Blank)" : String(i[u.field])).join(" · "), d = s ? a : `${a} · ${l.aggFunc}(${l.col.field})`;
      t.push({
        field: o,
        headerName: d,
        type: "number",
        width: 100,
        sortable: !0,
        filter: null,
        resizable: !1,
        _isPivot: !0,
        pivotKeys: { ...i },
        valueField: l.col.field,
        aggFunc: l.aggFunc,
        valueGetter: (u) => u?.__pivotValues?.[o] ?? null
      });
    }
  return t;
}
function Qe(r) {
  return typeof r == "string" && r.startsWith("__p|");
}
function Ze(r, n) {
  const e = Array.isArray(r) ? r.filter((t) => t && t.colId && t.sort) : [];
  return (t, s) => {
    for (const i of e) {
      const l = i.sort === "desc" ? -1 : 1;
      if (Qe(i.colId)) {
        const o = t.__pivotValues ? t.__pivotValues[i.colId] : null, a = s.__pivotValues ? s.__pivotValues[i.colId] : null, d = P(o, a, "number");
        if (d !== 0) return l * d;
        continue;
      }
      if (n && i.colId === n.field) {
        const o = P(t.value, s.value, n.type);
        if (o !== 0) return l * o;
        continue;
      }
    }
    return P(t.value, s.value, n?.type);
  };
}
function Z(r, n, e, t) {
  const s = {}, i = /* @__PURE__ */ new Map();
  for (const l of r) {
    const o = ue(l, t);
    i.has(o) || i.set(o, []), i.get(o).push(l);
  }
  for (const l of n) {
    const o = t.map((d) => {
      const u = l[d.field];
      return u == null ? "" : String(u);
    }).join(""), a = i.get(o) || [];
    for (const d of e) {
      const u = de(l, d, t);
      s[u] = a.length ? ae(d.aggFunc, a, d.col) : null;
    }
  }
  return s;
}
function Je({ rows: r, rowGroupCols: n = [], pivotCols: e, valueConfigs: t, isExpanded: s = () => !0, sortModel: i = [] }) {
  const l = Xe(r, e), o = Ye(l, t, e), a = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: r.length,
    aggregates: {},
    leaves: r,
    __pivotValues: Z(r, l, t, e)
  };
  if (!n.length)
    return { columns: o, displayList: [a], tree: [], combos: l };
  const d = (g, f, v) => {
    const m = n[f], w = /* @__PURE__ */ new Map();
    for (const A of g) {
      const y = M(A, m), S = y == null ? "" : String(y);
      w.has(S) || w.set(S, { value: y, rows: [] }), w.get(S).rows.push(A);
    }
    const b = Array.from(w.values()).map(({ value: A, rows: y }) => {
      const S = A == null ? "" : String(A), I = v ? `${v}|${m.field}=${S}` : `${m.field}=${S}`;
      return {
        __sgGroup: !0,
        level: f,
        field: m.field,
        value: A,
        groupId: I,
        count: y.length,
        aggregates: {},
        leaves: y,
        __pivotValues: Z(y, l, t, e),
        children: f + 1 < n.length ? d(y, f + 1, I) : null
      };
    }), D = Ze(i, m);
    return b.sort(D);
  }, u = d(r, 0, ""), h = [a], c = (g) => {
    for (const f of g)
      h.push(f), s(f.groupId, f.level) && f.children && c(f.children);
  };
  return c(u), { columns: o, displayList: h, tree: u, combos: l };
}
function et(r, { pivotCols: n = [], valueConfigs: e = [], columnGroups: t = null } = {}) {
  if (r._isPivot && n.length && r.pivotKeys)
    return tt(r, n, e);
  if (t && Array.isArray(t) && t.length && !r._isGroupCol && !r._isCheckbox && !r._isRowNumber) {
    for (const s of t)
      if (s?.children && s.children.includes(r.field))
        return [
          { kind: "group", id: `g:${s.headerName}`, label: s.headerName },
          { kind: "leaf", col: r }
        ];
  }
  return [{ kind: "leaf", col: r }];
}
function tt(r, n, e) {
  const t = (e?.length || 0) > 1, s = [];
  for (let i = 0; i < n.length; i++) {
    const l = n[i].field, o = r.pivotKeys[l];
    if (i === n.length - 1 && !t)
      return s.push({ kind: "leaf", col: r, label: o == null ? "(Blank)" : String(o) }), s;
    s.push({
      kind: "group",
      id: `p:${i}:${o == null ? "" : String(o)}`,
      label: o == null ? "(Blank)" : String(o)
    });
  }
  return s.push({ kind: "leaf", col: r, label: `${r.aggFunc}(${r.valueField})` }), s;
}
function st(r, n = {}) {
  if (!r.length) return { rows: [[]], depth: 1 };
  const e = r.map((i) => et(i, n).slice()), t = Math.max(1, ...e.map((i) => i.length)), s = [];
  for (let i = 0; i < t; i++) {
    const l = [];
    let o = 0;
    for (; o < e.length; ) {
      const a = e[o];
      if (i >= a.length || a[i] === null) {
        o += 1;
        continue;
      }
      const d = a[i];
      if (d.kind === "leaf") {
        l.push({ kind: "leaf", col: d.col, label: d.label, rowspan: t - i, colspan: 1 });
        for (let h = i + 1; h < t; h++) a[h] = null;
        o += 1;
        continue;
      }
      let u = o + 1;
      for (; u < e.length; ) {
        const h = e[u];
        if (i >= h.length || !h[i] || h[i].kind !== "group" || h[i].id !== d.id) break;
        let c = !0;
        for (let g = 0; g < i; g++) {
          const f = a[g]?.id ?? null, v = h[g]?.id ?? null;
          if (f !== v) {
            c = !1;
            break;
          }
        }
        if (!c) break;
        u += 1;
      }
      l.push({ kind: "group", label: d.label, colspan: u - o, rowspan: 1 }), o = u;
    }
    s.push(l);
  }
  return { rows: s, depth: t };
}
function it({
  rows: r,
  parentField: n = "parent_id",
  getRowId: e = (l) => l?.id,
  passesFilter: t = null,
  siblingComparator: s = null,
  isExpanded: i = () => !0
} = {}) {
  if (!Array.isArray(r) || r.length === 0)
    return { displayList: [], treeMeta: /* @__PURE__ */ new Map() };
  const l = (m) => {
    const w = e(m);
    return w == null ? null : String(w);
  }, o = /* @__PURE__ */ new Map();
  for (const m of r) {
    const w = l(m);
    w != null && o.set(w, m);
  }
  const a = /* @__PURE__ */ new Map(), d = [];
  for (const m of r) {
    const w = l(m), b = m?.[n], D = b == null ? null : String(b);
    D == null || D === w || !o.has(D) ? d.push(m) : (a.has(D) || a.set(D, []), a.get(D).push(m));
  }
  const u = t ? new Map(r.map((m) => [l(m), !!t(m)])) : null, h = /* @__PURE__ */ new Map(), c = (m, w) => {
    const b = l(m);
    if (b == null) return !1;
    if (h.has(b)) return h.get(b);
    if (w.has(b)) return !1;
    w.add(b);
    let D = !!u.get(b);
    const A = a.get(b) || [];
    for (const y of A) D = c(y, w) || D;
    return w.delete(b), h.set(b, D), D;
  };
  if (u)
    for (const m of d) c(m, /* @__PURE__ */ new Set());
  const g = [], f = /* @__PURE__ */ new Map(), v = (m, w, b, D) => {
    const A = u ? m.filter((y) => D || h.get(l(y))) : m.slice();
    s && A.sort(s);
    for (const y of A) {
      const S = l(y);
      if (S == null || b.has(S)) continue;
      const I = a.get(S) || [], T = D || (u ? !!u.get(S) : !1), V = u ? I.filter((G) => T || h.get(l(G))) : I, F = V.length > 0, B = F && (u ? !0 : !!i(S, w));
      f.set(S, { level: w, hasChildren: F, expanded: B }), g.push(y), B && (b.add(S), v(V, w + 1, b, T), b.delete(S));
    }
  };
  return v(d, 0, /* @__PURE__ */ new Set(), !1), { displayList: g, treeMeta: f };
}
function nt(r) {
  if (r.serverSide) {
    const u = r.rowData, h = r.pagination?.pageSize || u.length || 1, c = r.serverRowCount ?? u.length, g = Math.max(1, Math.ceil(c / h)), f = Math.min(r.pagination?.page || 0, g - 1);
    return { filteredSorted: u, rows: u, total: c, totalPages: g, page: f, pageRows: u };
  }
  const n = Object.fromEntries(r.columnDefs.map((u) => [u.field, u])), e = r.columnDefs.filter((u) => !u.hidden && !u._isCheckbox), t = (r.rowGroupCols || []).filter((u) => n[u]);
  if (r.treeData && !r.pivotMode && t.length === 0) {
    const u = r.treeParentField || "parent_id", h = Object.entries(r.filterModel || {}).filter(([, y]) => y != null), c = r.quickFilter ? String(r.quickFilter).toLowerCase() : "", f = h.length > 0 || c !== "" ? (y) => {
      for (const [S, I] of h) {
        const T = n[S];
        if (T && !re(y, T, I)) return !1;
      }
      if (c) {
        let S = !1;
        for (const I of e) {
          const T = k(y, I);
          if (T && String(T).toLowerCase().includes(c)) {
            S = !0;
            break;
          }
        }
        if (!S) return !1;
      }
      return !0;
    } : null, v = Array.isArray(r.sortModel) ? r.sortModel : [], m = v.length ? (y, S) => {
      for (const { colId: I, sort: T } of v) {
        const V = n[I];
        if (!V) continue;
        const F = M(y, V), B = M(S, V), G = typeof V.comparator == "function" ? V.comparator(F, B, y, S) : P(F, B, V.type);
        if (G !== 0) return T === "desc" ? -G : G;
      }
      return 0;
    } : null, w = r.getRowId || ((y) => y?.id), { displayList: b, treeMeta: D } = it({
      rows: r.rowData,
      parentField: u,
      getRowId: w,
      passesFilter: f,
      siblingComparator: m,
      isExpanded: r.isTreeRowExpanded || (() => !0)
    }), A = z(b, r.pagination);
    return {
      tree: !0,
      treeData: !0,
      treeMeta: D,
      treeParentField: u,
      filteredSorted: b,
      ...A
    };
  }
  let s = r.rowData;
  s = le(s, r.filterModel, n), s = oe(s, r.quickFilter, e), s = We(s, r.sortModel, n);
  const i = t, l = r.pivotMode ? (r.pivotCols || []).filter((u) => n[u]) : [], o = r.pivotMode ? Object.entries(r.aggModel || {}).filter(([u]) => n[u]).map(([u, h]) => ({ col: n[u], aggFunc: h })) : [];
  if (r.pivotMode && l.length && o.length) {
    const u = i.map((w) => n[w]), h = l.map((w) => n[w]), { columns: c, displayList: g, tree: f, combos: v } = Je({
      rows: s,
      rowGroupCols: u,
      pivotCols: h,
      valueConfigs: o,
      isExpanded: r.isGroupExpanded,
      sortModel: r.sortModel
    }), m = z(g, r.pagination);
    return {
      pivot: !0,
      pivotResultColumns: c,
      combos: v,
      grouped: !0,
      tree: f,
      leafCount: s.length,
      grandTotals: q(s, r.aggModel, n),
      filteredSorted: g,
      ...m
    };
  }
  if (i.length) {
    const u = i.map((f) => n[f]), { displayList: h, tree: c } = Ue(
      s,
      u,
      n,
      r.aggModel,
      r.isGroupExpanded
    ), g = z(h, r.pagination);
    return {
      grouped: !0,
      tree: c,
      leafCount: s.length,
      grandTotals: q(s, r.aggModel, n),
      filteredSorted: h,
      ...g
    };
  }
  const a = z(s, r.pagination), d = r.aggModel && Object.keys(r.aggModel).length ? q(s, r.aggModel, n) : null;
  return { filteredSorted: s, grandTotals: d, ...a };
}
function rt(r, n, e, t, s = 6) {
  const i = Math.ceil(n / e), l = Math.max(0, Math.floor(r / e) - s), o = Math.min(t, l + i + s * 2);
  return { first: l, last: o };
}
function lt(r) {
  return {
    // ---- Data ----
    setRowData(n) {
      r.setRowData(n);
    },
    getRowData() {
      return r.state.rowData.slice();
    },
    applyTransaction(n) {
      return r.applyTransaction(n);
    },
    // Server-side row model
    setRowCount(n) {
      r.setRowCount(n);
    },
    getRowCount() {
      return r.state.serverSide ? r.state.serverRowCount : r.state.rowData.length;
    },
    isServerSide() {
      return !!r.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(n) {
      r.setColumnDefs(n);
    },
    getColumnDefs() {
      return r.state.columnDefs.slice();
    },
    setColumnVisible(n, e) {
      r.setColumnVisible(n, e);
    },
    setColumnPinned(n, e) {
      r.setColumnPinned(n, e);
    },
    setColumnWidth(n, e) {
      r.setColumnWidth(n, e);
    },
    moveColumn(n, e) {
      r.moveColumn(n, e);
    },
    autoSizeColumn(n) {
      r.autoSizeColumn(n);
    },
    autoSizeAllColumns() {
      r.state.columnDefs.forEach((n) => r.autoSizeColumn(n.field));
    },
    sizeColumnsToFit() {
      r.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(n) {
      r.setSortModel(n);
    },
    getSortModel() {
      return r.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(n) {
      r.setFilterModel(n);
    },
    getFilterModel() {
      return { ...r.state.filterModel };
    },
    setColumnFilter(n, e) {
      r.setColumnFilter(n, e);
    },
    destroyFilter(n) {
      r.setColumnFilter(n, null);
    },
    setQuickFilter(n) {
      r.setQuickFilter(n);
    },
    getQuickFilter() {
      return r.getQuickFilter();
    },
    // ---- Selection ----
    selectAll() {
      r.selectAll();
    },
    deselectAll() {
      r.deselectAll();
    },
    selectRow(n) {
      r.setSelected(n, !0);
    },
    deselectRow(n) {
      r.setSelected(n, !1);
    },
    getSelectedRows() {
      return r.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(r.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(n) {
      r.goToPage(n);
    },
    paginationGoToFirstPage() {
      r.goToPage(0);
    },
    paginationGoToNextPage() {
      r.goToPage(r.state.pagination.page + 1);
    },
    paginationGoToPreviousPage() {
      r.goToPage(r.state.pagination.page - 1);
    },
    paginationGoToLastPage() {
      r.goToPage(r.lastPageIndex());
    },
    paginationSetPageSize(n) {
      r.setPageSize(n);
    },
    paginationGetCurrentPage() {
      return r.state.pagination.page;
    },
    paginationGetTotalPages() {
      return r.totalPages();
    },
    paginationGetRowCount() {
      return r.filteredCount();
    },
    paginationGetPageSize() {
      return r.state.pagination.pageSize;
    },
    paginationIsEnabled() {
      return r.state.pagination.enabled;
    },
    // ---- Cell selection ----
    getCellSelection() {
      return r.getCellSelectionDetail();
    },
    getCellRangeValues() {
      return r._cellRangeRows();
    },
    getCellSelectionRowIds() {
      return r.getCellSelectionRowIds();
    },
    getRangeAggregates() {
      return r.getRangeAggregates();
    },
    // ---- Editing ----
    startEditingCell({ rowId: n, colId: e }) {
      r.startEditingCell(n, e);
    },
    stopEditing(n = !1) {
      r.stopEditing(n);
    },
    // ---- Row grouping + aggregation ----
    setRowGroupColumns(n) {
      r.setRowGroupColumns(n);
    },
    addRowGroupColumn(n) {
      r.addRowGroupColumn(n);
    },
    removeRowGroupColumn(n) {
      r.removeRowGroupColumn(n);
    },
    getRowGroupColumns() {
      return r.getRowGroupColumns();
    },
    setColumnAggFunc(n, e) {
      r.setColumnAggFunc(n, e);
    },
    expandAll() {
      r.expandAll();
    },
    collapseAll() {
      r.collapseAll();
    },
    toggleGroup(n, e) {
      r.toggleGroup(n, e);
    },
    // ---- Pivot ----
    setPivotMode(n) {
      r.setPivotMode(n);
    },
    isPivotMode() {
      return r.isPivotMode();
    },
    setPivotColumns(n) {
      r.setPivotColumns(n);
    },
    addPivotColumn(n) {
      r.addPivotColumn(n);
    },
    removePivotColumn(n) {
      r.removePivotColumn(n);
    },
    getPivotColumns() {
      return r.getPivotColumns();
    },
    // Synthetic pivot result columns from the most recent render. Each entry
    // is { field, headerName, pivotKeys, valueField, aggFunc } — useful for
    // discovering the field id of a pivot col to feed to setSortModel / for
    // building a custom column visibility UI.
    getPivotResultColumns() {
      return (r._displayList?.pivotResultColumns || []).map((e) => ({
        field: e.field,
        headerName: e.headerName,
        pivotKeys: { ...e.pivotKeys || {} },
        valueField: e.valueField,
        aggFunc: e.aggFunc
      }));
    },
    // ---- Value columns (aggregations; shared with grouping) ----
    setValueColumns(n) {
      r.setValueColumns(n);
    },
    addValueColumn(n, e = "sum") {
      r.addValueColumn(n, e);
    },
    removeValueColumn(n) {
      r.removeValueColumn(n);
    },
    getValueColumns() {
      return r.getValueColumns();
    },
    // ---- Column header groups (multi-row headers) ----
    setColumnGroups(n) {
      r.setColumnGroups(n);
    },
    getColumnGroups() {
      return r.getColumnGroups();
    },
    // ---- Pinned bottom row (sticky grand totals) ----
    setPinnedBottomRow(n) {
      r.setPinnedBottomRow(n);
    },
    isPinnedBottomRow() {
      return r.isPinnedBottomRow();
    },
    // ---- Tree data (self-referential parent_id) ----
    setTreeData(n) {
      r.setTreeData(n);
    },
    isTreeData() {
      return r.isTreeData();
    },
    setTreeParentField(n) {
      r.setTreeParentField(n);
    },
    expandTreeRow(n) {
      r.expandTreeRow(n);
    },
    collapseTreeRow(n) {
      r.collapseTreeRow(n);
    },
    toggleTreeRow(n) {
      r.toggleTreeRow(n);
    },
    expandAllTreeRows() {
      r.expandAllTreeRows();
    },
    collapseAllTreeRows() {
      r.collapseAllTreeRows();
    },
    getTreeExpandedRowIds() {
      return r.getTreeExpandedRowIds();
    },
    // ---- Master/detail ----
    setMasterDetail(n) {
      r.setMasterDetail(n);
    },
    isMasterDetail() {
      return r.isMasterDetail();
    },
    expandDetailRow(n) {
      r.expandDetailRow(n);
    },
    collapseDetailRow(n) {
      r.collapseDetailRow(n);
    },
    toggleDetailRow(n) {
      r.toggleDetailRow(n);
    },
    expandAllDetails() {
      r.expandAllDetails();
    },
    collapseAllDetails() {
      r.collapseAllDetails();
    },
    getDetailExpandedRowIds() {
      return r.getDetailExpandedRowIds();
    },
    // ---- Column state + persistence ----
    getColumnState() {
      return r.getColumnState();
    },
    applyColumnState(n) {
      r.applyColumnState(n);
    },
    clearPersistedState() {
      r.clearPersistedState();
    },
    getPersistKey() {
      return r.persistKeyValue || "";
    },
    // ---- Export ----
    getDataAsCsv(n = {}) {
      return r.getDataAsCsv(n);
    },
    exportDataAsCsv(n = {}) {
      return r.exportDataAsCsv(n);
    },
    // ---- Display ----
    refreshCells(n = {}) {
      r.refresh(n);
    },
    redrawRows(n = {}) {
      r.refresh(n);
    },
    // ---- Events ----
    addEventListener(n, e) {
      r.element.addEventListener(n, e);
    },
    removeEventListener(n, e) {
      r.element.removeEventListener(n, e);
    }
  };
}
function p(r, n = {}, e = []) {
  const t = document.createElement(r);
  for (const [s, i] of Object.entries(n))
    i === !1 || i == null || (s === "class" ? t.className = i : s === "style" && typeof i == "object" ? Object.assign(t.style, i) : s.startsWith("on") && typeof i == "function" ? t.addEventListener(s.slice(2).toLowerCase(), i) : i === !0 ? t.setAttribute(s, "") : t.setAttribute(s, String(i)));
  for (const s of [].concat(e))
    s == null || s === !1 || t.appendChild(typeof s == "string" ? document.createTextNode(s) : s);
  return t;
}
function J(r, n) {
  for (const [e, t] of Object.entries(n))
    t == null || t === !1 ? r.removeAttribute(e) : t === !0 ? r.setAttribute(e, "") : r.setAttribute(e, String(t));
}
function ee(r) {
  const n = document.getElementById(r);
  return !n || n.tagName !== "TEMPLATE" ? null : n.content.firstElementChild.cloneNode(!0);
}
function _(r, n, e) {
  r.dispatchEvent(new CustomEvent(n, { detail: e, bubbles: !0 }));
}
function ot(r, n, e) {
  let t = r.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(n)) {
      const i = e.getControllerForElementAndIdentifier(t, n);
      if (i) return i;
    }
    t = t.parentElement;
  }
  return null;
}
const U = /* @__PURE__ */ new Map();
function R(r, n) {
  if (typeof r != "string" || !r) throw new Error("registerRenderer: name must be a non-empty string");
  if (typeof n != "function") throw new Error("registerRenderer: fn must be a function");
  U.set(r, n);
}
function ce(r) {
  return U.get(r) || null;
}
function at() {
  return Array.from(U.keys());
}
function C(r, n = {}, e = null) {
  const t = document.createElement(r);
  for (const [s, i] of Object.entries(n))
    i == null || i === !1 || (s === "class" ? t.className = i : t.setAttribute(s, i === !0 ? "" : String(i)));
  return e == null || (Array.isArray(e) ? e.forEach((s) => t.append(s)) : typeof e == "string" ? t.innerHTML = e : t.append(e)), t;
}
const E = (r) => r == null || r === "", dt = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function he() {
  return ({ value: r }) => {
    if (E(r)) return "";
    const n = String(r);
    return dt.test(n) ? C("a", {
      class: "sg-renderer-link",
      href: `mailto:${n}`,
      title: "Send email"
    }, document.createTextNode(n)) : C("span", { class: "sg-renderer-invalid", title: "Invalid email" }, document.createTextNode(n));
  };
}
function pe({ newTab: r = !0 } = {}) {
  return ({ value: n }) => {
    if (E(n)) return "";
    const e = String(n);
    let t;
    try {
      t = new URL(e);
    } catch {
      return document.createTextNode(e);
    }
    return C("a", {
      class: "sg-renderer-link",
      href: e,
      target: r ? "_blank" : null,
      rel: r ? "noopener noreferrer" : null,
      title: e
    }, document.createTextNode(t.hostname + (t.pathname !== "/" ? t.pathname : "")));
  };
}
function fe({ defaultRegion: r = "AU" } = {}) {
  return ({ value: n }) => {
    if (E(n)) return "";
    const e = String(n).trim(), t = e.replace(/\D/g, "");
    if (!t) return document.createTextNode(e);
    let s = e;
    return r === "AU" && (/^04\d{8}$/.test(t) ? s = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : /^0[2378]\d{8}$/.test(t) ? s = `(${t.slice(0, 2)}) ${t.slice(2, 6)} ${t.slice(6)}` : /^1[38]00\d{6}$/.test(t) ? s = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : t.length === 8 && (s = `${t.slice(0, 4)} ${t.slice(4)}`)), C("a", { class: "sg-renderer-link", href: `tel:${t}` }, document.createTextNode(s));
  };
}
function ge({ currency: r = "USD", locale: n = "en-US", decimals: e } = {}) {
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-number"), E(t)) return "";
    const i = Number(t);
    if (!Number.isFinite(i)) return String(t);
    const l = { style: "currency", currency: r };
    return e != null && (l.minimumFractionDigits = e, l.maximumFractionDigits = e), i.toLocaleString(n, l);
  };
}
function me({ decimals: r = 0, scale: n = "as-is" } = {}) {
  return ({ value: e, td: t }) => {
    if (t && t.classList.add("sg-renderer-number"), E(e)) return "";
    let s = Number(e);
    return Number.isFinite(s) ? (n === "fraction" && (s *= 100), `${s.toFixed(r)}%`) : String(e);
  };
}
function X(r) {
  if (r == null || r === "") return null;
  if (r instanceof Date) return Number.isNaN(r.valueOf()) ? null : r;
  const n = new Date(r);
  return Number.isNaN(n.valueOf()) ? null : n;
}
function _e({ locale: r = void 0, dateStyle: n = "medium", ...e } = {}) {
  const t = new Intl.DateTimeFormat(r, { dateStyle: n, ...e });
  return ({ value: s }) => {
    const i = X(s);
    return i ? t.format(i) : "";
  };
}
function ve({ locale: r = void 0, dateStyle: n = "medium", timeStyle: e = "short", ...t } = {}) {
  const s = new Intl.DateTimeFormat(r, { dateStyle: n, timeStyle: e, ...t });
  return ({ value: i }) => {
    const l = X(i);
    return l ? s.format(l) : "";
  };
}
const W = [
  { unit: "second", ms: 1e3, cutoff: 60 * 1e3 },
  { unit: "minute", ms: 60 * 1e3, cutoff: 3600 * 1e3 },
  { unit: "hour", ms: 3600 * 1e3, cutoff: 1440 * 60 * 1e3 },
  { unit: "day", ms: 1440 * 60 * 1e3, cutoff: 10080 * 60 * 1e3 },
  { unit: "week", ms: 10080 * 60 * 1e3, cutoff: 720 * 60 * 60 * 1e3 },
  { unit: "month", ms: 720 * 60 * 60 * 1e3, cutoff: 365 * 24 * 60 * 60 * 1e3 },
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1e3, cutoff: 1 / 0 }
];
function we({ locale: r = void 0, numeric: n = "auto", style: e = "long" } = {}) {
  const t = new Intl.RelativeTimeFormat(r, { numeric: n, style: e });
  return ({ value: s }) => {
    const i = X(s);
    if (!i) return "";
    const l = i.getTime() - Date.now(), o = Math.abs(l), a = W.find((h) => o < h.cutoff) || W[W.length - 1], d = Math.round(l / a.ms), u = C("span", { class: "sg-renderer-relative-time", title: i.toLocaleString() });
    return u.textContent = t.format(d, a.unit), u;
  };
}
const ut = { ms: 1, sec: 1e3, second: 1e3, min: 6e4, minute: 6e4, hr: 36e5, hour: 36e5 };
function Ce({ unit: r = "ms", style: n = "compact" } = {}) {
  const e = ut[r] ?? 1;
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-number"), E(t)) return "";
    const i = Number(t) * e;
    if (!Number.isFinite(i)) return String(t);
    const l = i < 0 ? "-" : "", o = Math.abs(i), a = Math.floor(o / 36e5), d = Math.floor(o % 36e5 / 6e4), u = Math.floor(o % 6e4 / 1e3);
    if (n === "clock") {
      const c = (g) => String(g).padStart(2, "0");
      return l + (a > 0 ? `${c(a)}:${c(d)}:${c(u)}` : `${c(d)}:${c(u)}`);
    }
    if (n === "words") {
      const c = [];
      return a && c.push(`${a} ${a === 1 ? "hour" : "hours"}`), d && c.push(`${d} ${d === 1 ? "minute" : "minutes"}`), !a && u && c.push(`${u} ${u === 1 ? "second" : "seconds"}`), l + (c.join(" ") || "0 seconds");
    }
    const h = [];
    return a && h.push(`${a}h`), d && h.push(`${d}m`), !a && u && h.push(`${u}s`), l + (h.join(" ") || "0s");
  };
}
function be({ locale: r = void 0, decimals: n, ...e } = {}) {
  const t = { ...e };
  n != null && (t.minimumFractionDigits = n, t.maximumFractionDigits = n);
  const s = new Intl.NumberFormat(r, t);
  return ({ value: i, td: l }) => {
    if (l && l.classList.add("sg-renderer-number"), E(i)) return "";
    const o = Number(i);
    return Number.isFinite(o) ? s.format(o) : String(i);
  };
}
function ye({ locale: r = void 0, compactDisplay: n = "short", maximumFractionDigits: e = 1 } = {}) {
  const t = new Intl.NumberFormat(r, {
    notation: "compact",
    compactDisplay: n,
    maximumFractionDigits: e
  });
  return ({ value: s, td: i }) => {
    if (i && i.classList.add("sg-renderer-number"), E(s)) return "";
    const l = Number(s);
    return Number.isFinite(l) ? t.format(l) : String(s);
  };
}
function Se({ binary: r = !0, decimals: n = 1, locale: e = void 0 } = {}) {
  const t = r ? 1024 : 1e3, s = r ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"], i = new Intl.NumberFormat(e, {
    minimumFractionDigits: n,
    maximumFractionDigits: n
  });
  return ({ value: l, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), E(l)) return "";
    let a = Number(l);
    if (!Number.isFinite(a)) return String(l);
    const d = a < 0 ? "-" : "";
    a = Math.abs(a);
    let u = 0;
    for (; a >= t && u < s.length - 1; )
      a /= t, u += 1;
    const h = u === 0 ? String(Math.round(a)) : i.format(a);
    return `${d}${h} ${s[u]}`;
  };
}
const ct = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on"]);
function ht(r) {
  return r === !0 || r === 1 ? !0 : r == null || r === "" || r === !1 || r === 0 ? !1 : ct.has(String(r).toLowerCase());
}
const pt = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>', ft = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
function xe({
  truthy: r = ht,
  nullLabel: n = "—",
  falseStyle: e = "icon"
  // 'icon' | 'hidden'
} = {}) {
  return ({ value: t }) => {
    if (t == null || t === "")
      return C("span", { class: "sg-renderer-bool-null" }, document.createTextNode(n));
    if (r(t)) {
      const i = C("span", { class: "sg-renderer-bool is-true", "aria-label": "true" });
      return i.innerHTML = pt, i;
    }
    if (e === "hidden") return "";
    const s = C("span", { class: "sg-renderer-bool is-false", "aria-label": "false" });
    return s.innerHTML = ft, s;
  };
}
const gt = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>', mt = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.7 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>', _t = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M64 256a32 32 0 1 0 0-64H384V160c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9S384 364.9 384 352V320H64z"/></svg>';
function Re({
  style: r = "percent",
  // 'percent' | 'number' | 'currency'
  decimals: n = 1,
  locale: e = void 0,
  currency: t = "USD",
  inverted: s = !1,
  showSign: i = !0
} = {}) {
  let l;
  return r === "currency" ? l = new Intl.NumberFormat(e, {
    style: "currency",
    currency: t,
    minimumFractionDigits: n,
    maximumFractionDigits: n,
    signDisplay: i ? "always" : "auto"
  }) : l = new Intl.NumberFormat(e, {
    minimumFractionDigits: n,
    maximumFractionDigits: n,
    signDisplay: i ? "always" : "auto"
  }), ({ value: o, td: a }) => {
    if (a && a.classList.add("sg-renderer-number"), E(o)) return "";
    const d = Number(o);
    if (!Number.isFinite(d)) return String(o);
    let u = "is-flat", h = _t;
    const c = !s;
    d > 0 ? (u = c ? "is-up" : "is-down", h = gt) : d < 0 && (u = c ? "is-down" : "is-up", h = mt);
    const g = C("span", { class: `sg-renderer-delta ${u}` }), f = C("span", { class: "sg-renderer-delta-icon", "aria-hidden": "true" });
    f.innerHTML = h;
    const v = r === "percent" ? `${l.format(d)}%` : l.format(d);
    return g.append(f), g.append(C("span", { class: "sg-renderer-delta-value" }, document.createTextNode(v))), g;
  };
}
function De({ chars: r = null } = {}) {
  return ({ value: n, td: e }) => {
    if (E(n)) return "";
    const t = String(n);
    let s = t, i = !1;
    return r && t.length > r && (s = t.slice(0, r) + "…", i = !0), e && (e.classList.add("sg-renderer-truncate"), e.setAttribute("title", t)), i ? s : t;
  };
}
const te = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>', vt = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';
function Me({ position: r = "after" } = {}) {
  return ({ value: n }) => {
    if (E(n)) return "";
    const e = String(n), t = C("span", { class: "sg-renderer-copyable" }), s = C("span", { class: "sg-renderer-copyable-value" }, document.createTextNode(e)), i = C("button", {
      type: "button",
      class: "sg-renderer-copyable-btn",
      title: "Copy",
      "aria-label": `Copy ${e}`
    });
    return i.innerHTML = te, i.addEventListener("click", async (l) => {
      l.stopPropagation(), l.preventDefault();
      try {
        navigator.clipboard?.writeText ? await navigator.clipboard.writeText(e) : wt(e), i.innerHTML = vt, i.classList.add("is-copied"), setTimeout(() => {
          i.innerHTML = te, i.classList.remove("is-copied");
        }, 1200);
      } catch {
      }
    }), r === "before" ? t.append(i, s) : t.append(s, i), t;
  };
}
function wt(r) {
  const n = document.createElement("textarea");
  n.value = r, n.style.position = "fixed", n.style.left = "-9999px", document.body.appendChild(n), n.select();
  try {
    document.execCommand("copy");
  } catch {
  }
  document.body.removeChild(n);
}
function Ee({ color: r = "green", showValue: n = !1 } = {}) {
  return ({ value: e }) => {
    let t = Number(e);
    Number.isFinite(t) || (t = 0), t = Math.max(0, Math.min(100, t));
    const s = C("div", { class: "sg-renderer-progress" }, [
      C("div", { class: `sg-renderer-progress-fill sg-fill-${r}`, style: `width: ${t}%;` })
    ]);
    return n ? C("div", { class: "sg-renderer-progress-wrap" }, [
      s,
      C("span", { class: "sg-renderer-progress-label" }, document.createTextNode(`${Math.round(t)}%`))
    ]) : s;
  };
}
const O = '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>';
function Ae({ max: r = 5, precision: n = 0.5 } = {}) {
  const e = n > 0 ? 1 / n : 2;
  return ({ value: t }) => {
    let s = parseFloat(t);
    Number.isFinite(s) || (s = 0), s = Math.max(0, Math.min(r, s)), s = Math.round(s * e) / e;
    const i = C("div", {
      class: "sg-renderer-stars",
      role: "img",
      "aria-label": `${s} out of ${r} stars`
    });
    for (let l = 1; l <= r; l++)
      if (s >= l)
        i.append(C("span", { class: "sg-renderer-star is-full", "aria-hidden": "true" }, O));
      else if (s > l - 1) {
        const o = Math.round((s - (l - 1)) * 100);
        i.append(C(
          "span",
          { class: "sg-renderer-star is-partial", "aria-hidden": "true" },
          `${O}<span class="sg-star-clip" style="width: ${o}%;">${O}</span>`
        ));
      } else
        i.append(C("span", { class: "sg-renderer-star is-empty", "aria-hidden": "true" }, O));
    return i;
  };
}
function Le({ separator: r = "," } = {}) {
  return ({ value: n }) => {
    if (E(n)) return "";
    const e = Array.isArray(n) ? n : String(n).split(r), t = C("div", { class: "sg-renderer-tags" });
    for (const s of e) {
      const i = String(s).trim();
      i && t.append(C("span", { class: "sg-renderer-tag" }, document.createTextNode(i)));
    }
    return t;
  };
}
function Ie({ showCode: r = !0, fallback: n = null } = {}) {
  return ({ value: e }) => {
    if (E(e)) return "";
    const t = String(e).trim().toUpperCase();
    if (t.length !== 2 || !/^[A-Z]{2}$/.test(t))
      return n ?? document.createTextNode(String(e));
    const s = String.fromCodePoint(
      127462 + t.charCodeAt(0) - 65,
      127462 + t.charCodeAt(1) - 65
    ), i = C("span", { class: "sg-renderer-country" });
    return i.append(C("span", { class: "sg-renderer-flag", "aria-hidden": "true" }, document.createTextNode(s))), r && i.append(C("span", { class: "sg-renderer-country-code" }, document.createTextNode(t))), i;
  };
}
function Ct(r) {
  const n = String(r).replace(/\s+/g, "");
  if (n.length !== 11 || !/^\d{11}$/.test(n)) return !1;
  const e = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19], t = parseInt(n[0], 10) - 1 + n.slice(1);
  let s = 0;
  for (let i = 0; i < 11; i++) s += parseInt(t[i], 10) * e[i];
  return s % 89 === 0;
}
function bt(r) {
  const n = String(r).replace(/\D/g, "");
  return n.length !== 11 ? String(r) : `${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
}
function Te() {
  return ({ value: r }) => {
    if (E(r)) return "";
    if (!Ct(r))
      return C("span", { class: "sg-renderer-invalid", title: "Invalid ABN" }, document.createTextNode(String(r)));
    const n = String(r).replace(/\s+/g, "");
    return C("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/ABN/View?id=${n}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(bt(r)));
  };
}
function Ve({
  lookup: r = null,
  nameField: n = null,
  avatarField: e = null,
  windowKey: t = "__sgUsers",
  size: s = 22
} = {}) {
  return ({ value: i, row: l }) => {
    if (E(i)) return "";
    let o = null;
    if (typeof r == "function" && (o = r(i, l) || null), !o && n && (o = { name: l?.[n], avatarUrl: e ? l?.[e] : null }), !o && typeof window < "u" && window[t]) {
      const u = window[t];
      u instanceof Map ? o = u.get(i) || u.get(String(i)) || null : Array.isArray(u) && (o = u.find((h) => `${h.id}` == `${i}`) || null);
    }
    const a = o?.name ?? String(i), d = C("span", { class: "sg-renderer-avatar" });
    if (o?.avatarUrl)
      d.append(C("img", {
        class: "sg-renderer-avatar-img",
        src: o.avatarUrl,
        width: String(s),
        height: String(s),
        alt: ""
      }));
    else {
      const u = String(a).split(/\s+/).filter(Boolean).slice(0, 2).map((h) => h[0]?.toUpperCase() || "").join("");
      d.append(C("span", {
        class: "sg-renderer-avatar-initials",
        style: `width: ${s}px; height: ${s}px;`
      }, document.createTextNode(u)));
    }
    return d.append(C("span", { class: "sg-renderer-avatar-name" }, document.createTextNode(a))), d;
  };
}
const yt = {
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
function St(r) {
  return String(r).toLowerCase().split(/[\s_-]+/).map((n) => n && n[0].toUpperCase() + n.slice(1)).join(" ");
}
function xt(r = {}, n = null, e = {}) {
  const { titleCase: t = !0, defaultColor: s = "gray" } = e, i = {};
  for (const [o, a] of Object.entries(r)) i[String(o).toLowerCase()] = a;
  const l = {};
  if (n) for (const [o, a] of Object.entries(n)) l[String(o).toLowerCase()] = a;
  return ({ value: o }) => {
    if (E(o)) return "";
    const a = String(o).toLowerCase(), d = i[a] || s, u = t ? St(o) : String(o), h = C("span", { class: `sg-pill sg-pill-${d}` });
    if (n) {
      const c = l[a], g = c ? yt[c] || c : null;
      if (g) {
        const f = C("span", { class: "sg-pill-icon", "aria-hidden": "true" });
        f.innerHTML = g, h.append(f);
      }
    }
    return h.append(C("span", { class: "sg-pill-label" }, document.createTextNode(u))), h;
  };
}
R("email", he());
R("url", pe());
R("phone", fe());
R("currency", ge());
R("percent", me());
R("progress-bar", Ee());
R("star-rating", Ae());
R("tags", Le());
R("country-flag", Ie());
R("abn", Te());
R("avatar", Ve());
R("date", _e());
R("datetime", ve());
R("relative-time", we());
R("duration", Ce());
R("number", be());
R("compact-number", ye());
R("file-size", Se());
R("boolean", xe());
R("delta", Re());
R("truncate", De());
R("copyable", Me());
const Rt = {
  email: he,
  url: pe,
  phone: fe,
  currency: ge,
  percent: me,
  progressBar: Ee,
  starRating: Ae,
  tags: Le,
  countryFlag: Ie,
  abn: Te,
  avatar: Ve,
  statusPill: xt,
  date: _e,
  datetime: ve,
  relativeTime: we,
  duration: Ce,
  number: be,
  compactNumber: ye,
  fileSize: Se,
  boolean: xe,
  delta: Re,
  truncate: De,
  copyable: Me
}, Dt = 32, se = 100, H = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', Mt = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>', ie = [
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
class Y extends N {
  constructor() {
    super(...arguments);
    x(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    // ----- Row grouping + aggregation -----
    // A group is expanded if it has an explicit override; otherwise the
    // default-by-level applies (-1 = all, 0 = none, N = first N levels).
    x(this, "_isGroupExpanded", (e, t) => {
      if (this._groupExpanded.has(e)) return this._groupExpanded.get(e);
      const s = this.state.group.defaultExpanded;
      return s < 0 ? !0 : t < s;
    });
    // Delegated click handler for synthetic <th>s that don't have a
    // HeaderCellController of their own (pivot result cols today). Mirrors the
    // user-defined header path: bare click toggles sort, shift-click appends to
    // a multi-sort. Resize handles / filter icons short-circuit.
    x(this, "_onSynthHeaderClick", (e) => {
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
    x(this, "_onHeaderContextMenu", (e) => {
      const t = e.target.closest("th[data-field], th[data-header-cell-field-value]");
      if (!t) return;
      const s = t.getAttribute("data-field") || t.getAttribute("data-header-cell-field-value"), i = this._colByField(s);
      !i || i._isCheckbox || i._isRowNumber || i._isGroupCol || i._isPivot || (e.preventDefault(), this._showColumnMenu(i, e.clientX, e.clientY));
    });
    x(this, "_onDocMouseDownColumnMenu", (e) => {
      this._columnMenu && !this._columnMenu.contains(e.target) && this._closeColumnMenu();
    });
    x(this, "_onColumnMenuKey", (e) => {
      e.key === "Escape" && (e.stopPropagation(), this._closeColumnMenu());
    });
    x(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
    });
    x(this, "_onCellMouseDown", (e) => {
      if (e.button !== 0) return;
      if (this.rowDragValue) {
        const i = e.target.closest?.('td[data-gutter="true"]');
        if (i) {
          const l = i.closest("tr");
          this._rowDragPending = { rowId: this._coerceRowId(l.dataset.rowId), x: e.clientX, y: e.clientY }, this._rowDragMoved = !1, document.addEventListener("mousemove", this._onRowDragMove);
          return;
        }
      }
      if (e.target.closest?.('[data-tree-toggle="true"]')) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : s ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), _(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    x(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      s && s.focus.rowId === t.rowId && s.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), _(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
    });
    x(this, "_onCellMouseUp", () => {
      this._cellDragging = !1, this._rowDragPending && (document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag && this._finishRowDrag(), this._rowDragPending = null);
    });
    // ----- Row drag-and-drop (reorder) with a ghost preview -----
    x(this, "_onRowDragMove", (e) => {
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
    x(this, "_onCopy", (e) => {
      if (this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && !this.element.contains(t)) return;
      const s = this._activeRect();
      if (!s) return;
      const i = this._cellRangeRows(s).map((l) => l.map((o) => String(o ?? "")).join("	")).join(`
`);
      i && (e.clipboardData?.setData("text/plain", i), e.preventDefault());
    });
    x(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && this.element.contains(t)) return;
      const s = e.key, i = e.metaKey || e.ctrlKey;
      if (i && s.toLowerCase() === "a") {
        e.preventDefault(), this.rowSelectionValue !== "" ? (this.clearCellSelection(), this.deselectAll(), this.selectAll()) : this._selectAllCells();
        return;
      }
      if (i) return;
      const l = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (l[s]) {
        e.preventDefault();
        const [o, a] = l[s];
        this._moveActiveCell(o, a, e.shiftKey);
        return;
      }
      if (s === "Tab") {
        e.preventDefault(), this._moveActiveCell(0, e.shiftKey ? -1 : 1, !1);
        return;
      }
      if (s === "Enter") {
        const o = this._activeCell();
        o && (e.preventDefault(), this.startEditingCell(o.rowId, o.colId));
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
        const o = this._activeCell();
        if (!o) return;
        const a = this._colByField(o.colId);
        if (!a || !a.editable) return;
        e.preventDefault(), this.startEditingCell(o.rowId, o.colId, s);
      }
    });
    x(this, "_onEditorKey", (e) => {
      this.state.editing && (e.key === "Enter" ? (e.preventDefault(), this.stopEditing(!1)) : e.key === "Escape" ? (e.preventDefault(), this.stopEditing(!0)) : e.key === "Tab" && (e.preventDefault(), this._tabToEditableCell(e.shiftKey ? -1 : 1)));
    });
    x(this, "_onEditorBlur", () => {
      this._navigatingEditor || this.state.editing && this.stopEditing(!1);
    });
    // ----- Tree data (self-referential parent_id) -----
    //
    // The model layer flattens the tree and hands us back a Map of per-row
    // metadata (level, hasChildren, expanded). The controller owns the
    // expanded/collapsed override Map; the model just calls back through
    // `isTreeRowExpanded` to ask which state a given row is in. Everything
    // else (filter, sort, paginate) flows through the normal pipeline.
    x(this, "_isTreeRowExpanded", (e, t) => {
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
      pagination: { enabled: !1, page: 0, pageSize: se },
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = lt(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("mousemove", this._onRowDragMove), this._thead?.removeEventListener("contextmenu", this._onHeaderContextMenu), this._thead?.removeEventListener("click", this._onSynthHeaderClick), this._closeColumnMenu(), this._teardownPersistence(), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove();
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, s) => {
      const i = {}, l = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      i[this.getRowIdValue] = l != null ? this._coerceRowId(l) : s + 1, t.querySelectorAll("td").forEach((a) => {
        const d = a.getAttribute("data-cell-col-id-value") || a.getAttribute("data-col-id");
        d && (i[d] = a.textContent.trim());
      });
      const o = t.getAttribute("data-row-detail-rows-value");
      if (o && this.detailRowsKeyValue)
        try {
          i[this.detailRowsKeyValue] = JSON.parse(o);
        } catch {
        }
      return i;
    }), e.innerHTML = ""), this._initialHead = this.element.querySelector("thead");
  }
  _buildChrome() {
    let e = this.element.querySelector("table");
    if (!e) {
      e = p("table");
      const s = p("thead");
      e.appendChild(s), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = p("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const s = p("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(s, e), s.appendChild(e), this._viewport = s;
    }
    if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = p("div", { class: "sg-status-bar", role: "status" }), this._statusBar.append(
      p("div", { class: "sg-status-section sg-status-left" }),
      p("div", { class: "sg-status-section sg-status-right" })
    ), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
      const s = p("div", { class: "sg-main" });
      this._viewport.parentNode.insertBefore(s, this._viewport), s.appendChild(this._viewport), this._statusBar && s.appendChild(this._statusBar), this._main = s, this._sidePanel = p("aside", {
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
    this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), this._restorePersistedState(), this._setupPersistence(), _(this.element, "grid:ready", { api: this.element.gridApi }), _(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
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
    const s = this.state.filterModel[e.field] || {}, i = At(e.filter), l = p("div", { class: "sg-filter-popover" }), o = p("select");
    i.forEach((m) => o.append(new Option(m.label, m.value, !1, m.value === s.type)));
    const a = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", d = p("input", { type: a, value: s.value ?? "" }), u = p("input", { type: a, value: s.value2 ?? "", style: { display: "none" } }), h = () => {
      const m = o.value, w = m === "inRange", b = !(m === "blank" || m === "notBlank");
      d.style.display = b ? "" : "none", u.style.display = w ? "" : "none";
    };
    o.addEventListener("change", h), h();
    const c = p("div", { class: "sg-filter-actions" }), g = p("button", { type: "button" }, "Clear"), f = p("button", { type: "button", class: "primary" }, "Apply");
    c.append(g, f), g.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), f.addEventListener("click", () => {
      const m = o.value, w = m === "blank" || m === "notBlank" ? { filterType: e.filter, type: m } : { filterType: e.filter, type: m, value: d.value, value2: u.value || void 0 };
      this.setColumnFilter(e.field, w), this._closeFilterPopover();
    }), l.append(
      p("label", {}, "Condition"),
      o,
      d,
      u,
      c
    ), document.body.appendChild(l);
    const v = t.getBoundingClientRect();
    l.style.left = `${v.left + window.scrollX}px`, l.style.top = `${v.bottom + window.scrollY + 2}px`, this._filterPopover = l, document.addEventListener("mousedown", this._onDocMouseDown), d.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const s = this.state.columnDefs.findIndex((d) => d.field === e.field), i = this._runtimeOverrides[e.field] || {}, l = s >= 0 ? this.state.columnDefs[s] : null, o = l ? {
      ...l.hidden != null ? { hidden: l.hidden } : {},
      ...l.pinned ? { pinned: l.pinned } : {},
      ...l.width != null ? { width: l.width } : {}
    } : {}, a = { ...e, ...i, ...o, _headerEl: t };
    if (s >= 0) {
      const d = this.state.columnDefs[s];
      if (d._headerEl === t && Et(d, a)) return;
      this.state.columnDefs[s] = a;
    } else
      this.state.columnDefs.push(a);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${$(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const s = this.state.sortModel.findIndex((l) => l.colId === e);
    let i;
    s === -1 ? i = { colId: e, sort: "asc" } : this.state.sortModel[s].sort === "asc" ? i = { colId: e, sort: "desc" } : i = null, t ? (s >= 0 && this.state.sortModel.splice(s, 1), i && this.state.sortModel.push(i)) : this.state.sortModel = i ? [i] : [], this.scheduleRender("sort"), _(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  setSortModel(e) {
    this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), _(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  // ----- Filter -----
  setColumnFilter(e, t) {
    t == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = t, this.state.pagination.page = 0, this.scheduleRender("filter"), _(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setFilterModel(e) {
    this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), _(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setQuickFilter(e) {
    const t = e == null ? "" : String(e);
    t !== this.state.quickFilter && (this.state.quickFilter = t, this.state.pagination.page = 0, this.scheduleRender("filter"), _(this.element, "grid:filterChanged", {
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
    this.rowSelectionValue === "single" ? (s.clear(), s.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? s.has(e) ? s.delete(e) : s.add(e) : (s.clear(), s.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), _(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(s)
    });
  }
  setSelected(e, t) {
    t ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), _(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  selectAll() {
    this._displayList.filteredSorted.forEach((e) => {
      e.__sgGroup || this.state.selection.add(this._rowId(e));
    }), this.scheduleRender("selection"), _(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  deselectAll() {
    this.state.selection.clear(), this.scheduleRender("selection"), _(this.element, "grid:selectionChanged", { selectedRows: [], selectedIds: [] });
  }
  getSelectedRows() {
    const e = this.state.selection;
    return this.state.rowData.filter((t) => e.has(this._rowId(t)));
  }
  _selectRange(e, t) {
    const s = this._displayList.filteredSorted, i = s.findIndex((d) => this._rowId(d) === e), l = s.findIndex((d) => this._rowId(d) === t);
    if (i < 0 || l < 0) return;
    const [o, a] = i <= l ? [i, l] : [l, i];
    for (let d = o; d <= a; d++)
      s[d].__sgGroup || this.state.selection.add(this._rowId(s[d]));
  }
  // ----- Pagination -----
  goToPage(e) {
    const t = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(e, t)), this.scheduleRender("page"), _(this.element, "grid:paginationChanged", {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  setPageSize(e) {
    this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), _(this.element, "grid:paginationChanged", {
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
    let s = le(this.state.rowData, this.state.filterModel, e);
    return s = oe(s, this.state.quickFilter, t), s.length;
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
    const i = this.state.columnDefs.find((o) => o.field === t);
    if (!i || !i.editable) return;
    const l = this.state.rowData.find((o) => this._rowId(o) === e);
    l && (this.state.editing = { rowId: e, colId: t, originalValue: M(l, i), initialValue: s }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: s, originalValue: i, draftValue: l } = this.state.editing, o = this._tbody.querySelector(`tr[data-row-id="${$(t)}"] td[data-col-id="${$(s)}"]`);
    let a = i;
    if (!e && o) {
      const d = o.querySelector("[data-editor-input]") || o.querySelector("input,select,textarea");
      d ? a = Lt(d.value, this._colByField(s)?.type) : l !== void 0 && (a = l);
    }
    if (this.state.editing = null, !e && a !== i) {
      const d = this.state.rowData.find((h) => this._rowId(h) === t), u = d[s];
      d[s] = a, _(this.element, "grid:cellValueChanged", { rowId: t, colId: s, oldValue: u, newValue: a });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const s = this._colByField(e);
    s && (s.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), _(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const i = t || null;
    s.pinned = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: i }, this._reorderForPinning(), this.scheduleRender("columns"), _(this.element, "grid:columnPinned", { colId: e, pinned: i });
  }
  setColumnWidth(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const i = Math.max(s.minWidth || 40, Math.min(s.maxWidth || 4e3, t));
    s.width = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: i }, this.scheduleRender("columns"), _(this.element, "grid:columnResized", { colId: e, width: i });
  }
  moveColumn(e, t) {
    const s = this.state.columnDefs.findIndex((l) => l.field === e);
    if (s < 0 || s === t) return;
    const [i] = this.state.columnDefs.splice(s, 1);
    this.state.columnDefs.splice(t, 0, i), this.scheduleRender("columns"), _(this.element, "grid:columnMoved", { colId: e, fromIndex: s, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const s = (t.headerName || t.field || "").length, i = this.state.rowData.slice(0, 200);
    let l = s;
    for (const o of i) {
      const a = String(k(o, t) ?? "").length;
      a > l && (l = a);
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, l * 8 + 24)));
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), s = t.reduce((l, o) => l + (o.width || 150), 0);
    if (s === 0) return;
    const i = e / s;
    t.forEach((l) => {
      l.width = Math.max(l.minWidth || 40, Math.floor((l.width || 150) * i));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((i) => i.pinned === "left"), t = this.state.columnDefs.filter((i) => i.pinned === "right"), s = this.state.columnDefs.filter((i) => !i.pinned);
    this.state.columnDefs = [...e, ...s, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), _(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], s = [], i = [], l = new Map(this.state.rowData.map((o) => [this._rowId(o), o]));
    return (e.remove || []).forEach((o) => {
      const a = this._rowId(o);
      l.delete(a) && i.push(o);
    }), (e.update || []).forEach((o) => {
      const a = this._rowId(o);
      l.has(a) && (l.set(a, { ...l.get(a), ...o }), s.push(o));
    }), (e.add || []).forEach((o) => {
      const a = this._rowId(o);
      l.has(a) || (l.set(a, o), t.push(o));
    }), this.state.rowData = Array.from(l.values()), this.scheduleRender("data"), _(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: s, removed: i };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const s = this.state.columnDefs.filter((a) => !a.hidden && !a._isCheckbox), i = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((a) => !a.__sgGroup && !a.__sgDetail), l = (a) => /[",\n\r]/.test(a) ? `"${String(a).replace(/"/g, '""')}"` : String(a), o = [s.map((a) => l(a.headerName || a.field)).join(e)];
    for (const a of i)
      o.push(s.map((d) => l(k(a, d))).join(e));
    return o.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const s = this.getDataAsCsv(t), i = new Blob([s], { type: "text/csv;charset=utf-8" }), l = URL.createObjectURL(i), o = p("a", { href: l, download: e });
    return document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(l), s;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.has("tree") || e.size === 0) && (this._displayList = nt({
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
    const e = this._visibleCols(), t = st(e, this._headerLayoutOpts());
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
    t || (t = p("colgroup"), this._table.insertBefore(t, this._thead));
    const s = Array.from(t.children);
    for (e.forEach((i, l) => {
      let o = s[l];
      o || (o = p("col"), t.appendChild(o)), o.style.width = i.width ? i.width + "px" : "";
    }); t.children.length > e.length; ) t.lastElementChild.remove();
  }
  _renderHeaderSingleRow(e) {
    if (this._thead.children.length > 1) {
      const c = this._thead.firstElementChild;
      for (let g = 1; g < this._thead.children.length; g++) {
        const f = this._thead.children[g];
        Array.from(f.children).forEach((v) => {
          (v.hasAttribute("data-header-cell-field-value") || v.hasAttribute("data-field")) && c.appendChild(v);
        });
      }
      for (; this._thead.children.length > 1; ) this._thead.lastElementChild.remove();
    }
    const t = this._thead.querySelector("tr") || (() => {
      const c = p("tr");
      return this._thead.appendChild(c), c;
    })(), s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((c) => {
      const g = c.getAttribute("data-header-cell-field-value") || c.getAttribute("data-field");
      g && s.set(g, c);
    });
    const i = new Set(e.map((c) => c.field)), l = this.state.columnDefs.filter((c) => !i.has(c.field)), o = [...e, ...l], a = Array.from(t.children).map((c) => c.getAttribute("data-header-cell-field-value") || c.getAttribute("data-field")).filter(Boolean), d = o.map((c) => c.field);
    if (a.length === d.length && a.every((c, g) => c === d[g]))
      Array.from(t.children).forEach((c) => {
        c.removeAttribute("rowspan"), c.removeAttribute("colspan");
      });
    else {
      const c = [];
      for (const g of o) {
        let f = s.get(g.field);
        f ? (f.removeAttribute("rowspan"), f.removeAttribute("colspan")) : f = p("th", {
          "data-field": g.field,
          "data-synth": "true"
        }, [p("div", { class: "sg-header-content" }, [
          p("span", { class: "sg-header-label" }, g.headerName || g.field || "")
        ])]), c.push(f);
      }
      t.replaceChildren(...c);
    }
    Array.from(t.children).forEach((c) => {
      const g = c.getAttribute("data-header-cell-field-value") || c.getAttribute("data-field");
      g != null && (c.style.display = i.has(g) ? "" : "none");
    });
    const h = this._pinOffsets();
    for (const c of e) {
      const g = t.querySelector(`th[data-header-cell-field-value="${$(c.field)}"]`) || t.querySelector(`th[data-field="${$(c.field)}"]`);
      g && this._applyLeafThState(g, c, h);
    }
  }
  // Multi-row header: <thead> gets `layout.depth` rows of group headers
  // followed by the leaf headers, then one hidden row holding any registered
  // <th>s that aren't currently visible (so their controllers stay mounted).
  _renderHeaderMultiRow(e, t) {
    const s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((u) => {
      const h = u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field");
      h && s.set(h, u);
    });
    const i = [], l = new Set(e.map((u) => u.field)), o = this._pinOffsets();
    for (const u of t.rows) {
      const h = p("tr");
      for (const c of u) {
        if (c.kind === "group") {
          h.appendChild(p("th", {
            class: "sg-header-group",
            colspan: String(c.colspan),
            "data-group-header": "true"
          }, c.label || ""));
          continue;
        }
        const g = c.col;
        let f = s.get(g.field);
        if (f || (f = p("th", {
          "data-field": g.field,
          "data-synth": "true"
        }, [p("div", { class: "sg-header-content" }, [
          p("span", { class: "sg-header-label" }, c.label || g.headerName || g.field || "")
        ])])), c.label) {
          const v = f.querySelector(".sg-header-label");
          v && v.textContent !== c.label && (v.textContent = c.label);
        }
        f.setAttribute("rowspan", String(c.rowspan)), f.removeAttribute("colspan"), f.style.display = "", h.appendChild(f), this._applyLeafThState(f, g, o);
      }
      i.push(h);
    }
    const a = /* @__PURE__ */ new Set();
    t.rows.forEach((u) => u.forEach((h) => {
      h.kind === "leaf" && a.add(h.col.field);
    }));
    const d = this.state.columnDefs.filter(
      (u) => !l.has(u.field) && !a.has(u.field)
    );
    if (d.length) {
      const u = p("tr", { class: "sg-hidden-header-row" });
      for (const h of d) {
        let c = s.get(h.field);
        c || (c = p("th", { "data-field": h.field, "data-synth": "true" })), c.removeAttribute("rowspan"), c.removeAttribute("colspan"), u.appendChild(c);
      }
      i.push(u);
    }
    this._thead.replaceChildren(...i);
  }
  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(e, t, s) {
    const i = this.state.sortModel.find((l) => l.colId === t.field);
    J(e, {
      "data-sortable": t.sortable ? "true" : null,
      "data-filterable": t.filter ? "true" : null,
      "data-filter-active": this.state.filterModel[t.field] ? "true" : null,
      "data-sort": i?.sort || null,
      "data-pinned": t.pinned || null
    }), t.width && (e.style.width = t.width + "px"), e.style.left = t.pinned === "left" ? s.left[t.field] + "px" : "", e.style.right = t.pinned === "right" ? s.right[t.field] + "px" : "", this._ensureHeaderChrome(e, t, i);
  }
  _ensureHeaderChrome(e, t, s) {
    if (t._isRowNumber) {
      e.classList.add("sg-gutter-header"), e.textContent = "";
      return;
    }
    if (t._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let a = e.querySelector('input[type="checkbox"]');
      a || (a = p("input", { type: "checkbox", "aria-label": "Select all" }), a.addEventListener("change", (h) => {
        h.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(a));
      const d = this._displayList.filteredSorted.length, u = this.state.selection.size;
      a.checked = u > 0 && u >= d, a.indeterminate = u > 0 && u < d;
      return;
    }
    let i = e.querySelector(".sg-header-content");
    if (!i) {
      const a = e.textContent.trim();
      e.textContent = "", i = p("div", { class: "sg-header-content" }, [
        p("span", { class: "sg-header-label" }, a || t.headerName || t.field || "")
      ]), e.appendChild(i);
    }
    let l = i.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (l || (l = p("span", { class: "sg-sort-icon", "aria-hidden": "true" }), l.innerHTML = H, i.appendChild(l)), s && this.state.sortModel.length > 1) {
        let a = i.querySelector(".sg-sort-index");
        a || (a = p("span", { class: "sg-sort-index" }), i.appendChild(a)), a.textContent = String(this.state.sortModel.indexOf(s) + 1);
      } else
        i.querySelector(".sg-sort-index")?.remove();
    else l && l.remove();
    let o = i.querySelector(".sg-filter-icon");
    t.filter ? o || (o = p("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), o.innerHTML = Mt, i.appendChild(o)) : o && o.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(p("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._withDetailRows(this._displayList.pageRows);
    this._selKeys = this._computeCellSelKeys();
    const s = !this.masterDetailValue && (this.virtualValue || t.length > 200);
    let i = t, l = 0;
    if (s) {
      const h = this._viewport?.clientHeight || 400, c = this.state.rowHeight, g = rt(this.state.scrollTop, h, c, t.length, 8);
      l = g.first, i = t.slice(g.first, g.last);
    }
    const o = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((h) => {
      const c = h.dataset.rowId;
      c != null && o.set(c, h);
    });
    const a = document.createDocumentFragment(), d = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0, u = (h) => d + l + h + 1;
    if (s) {
      const h = this.state.rowHeight, c = l * h, g = (t.length - l - i.length) * h;
      a.appendChild(this._spacerRow(c, e.length)), i.forEach((f, v) => a.appendChild(this._buildRow(f, e, o, u(v)))), a.appendChild(this._spacerRow(g, e.length));
    } else
      i.forEach((h, c) => a.appendChild(this._buildRow(h, e, o, u(c))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && a.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(a);
  }
  _buildPinnedBottomRow(e) {
    const t = p("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), s = this._pinOffsets(), i = this._displayList.grandTotals || {};
    let l = !1;
    for (const o of e) {
      const a = p("td", { "data-col-id": o.field, "data-pinned": o.pinned || null });
      o.pinned === "left" ? a.style.left = s.left[o.field] + "px" : o.pinned === "right" && (a.style.right = s.right[o.field] + "px");
      const d = i[o.field];
      d != null ? (a.classList.add("sg-agg-cell"), a.textContent = this._formatAggregate(d)) : !l && !o._isCheckbox && !o._isRowNumber && (a.classList.add("sg-pinned-bottom-label"), a.textContent = "Total", l = !0), t.appendChild(a);
    }
    return t;
  }
  _buildRow(e, t, s, i) {
    if (e.__sgGroup) return this._buildGroupRow(e, t, s);
    if (e.__sgDetail) return this._buildDetailRow(e, t, s);
    const l = String(this._rowId(e));
    let o = s.get(l);
    o || (o = p("tr")), o.dataset.rowId = l, o.classList.remove("sg-spacer");
    const a = this.state.selection.has(this._rowId(e)), d = this.masterDetailValue && this._isDetailExpanded(l);
    return J(o, {
      "data-selected": a ? "true" : null,
      "data-detail-expanded": d ? "true" : null
    }), this.masterDetailValue && o.classList.add("sg-master-row"), this._renderRow(o, e, t, i), o;
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const i = p("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return i.style.height = "0px", i.appendChild(p("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), i;
    }
    const s = p("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return s.style.height = e + "px", s.appendChild(p("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), s;
  }
  _renderRow(e, t, s, i) {
    e.innerHTML = "";
    const l = this._pinOffsets(), o = this._selKeys || { active: null, range: null }, a = String(this._rowId(t)), d = this._displayList?.treeMeta, u = d ? d.get(a) : null, h = u ? this._treeDisplayColField() : null;
    for (const c of s) {
      const g = `${a}:${c.field}`, f = p("td", {
        "data-col-id": c.field,
        "data-pinned": c.pinned || null,
        "data-cell-active": o.active === g ? "true" : null,
        "data-cell-range": o.range && o.range.has(g) ? "true" : null
      });
      if (c.pinned === "left" ? f.style.left = l.left[c.field] + "px" : c.pinned === "right" && (f.style.right = l.right[c.field] + "px"), c._isRowNumber) {
        f.classList.add("sg-gutter-cell"), f.setAttribute("data-gutter", "true"), f.removeAttribute("data-cell-active"), f.removeAttribute("data-cell-range"), f.textContent = i != null ? String(i) : "", e.appendChild(f);
        continue;
      }
      if (c._isCheckbox) {
        f.classList.add("sg-checkbox-cell");
        const m = p("input", { type: "checkbox" });
        m.checked = this.state.selection.has(this._rowId(t)), f.appendChild(m), e.appendChild(f);
        continue;
      }
      if (c._isGroupCol) {
        f.classList.add("sg-group-leaf-cell"), f.removeAttribute("data-cell-active"), f.removeAttribute("data-cell-range"), e.appendChild(f);
        continue;
      }
      if (c._isMasterExpand) {
        f.classList.add("sg-master-expand-cell"), f.setAttribute("data-master-expand", "true"), f.removeAttribute("data-cell-active"), f.removeAttribute("data-cell-range");
        const m = this._isDetailExpanded(this._rowId(t)), w = p("span", {
          class: "sg-master-expand-caret",
          "data-expanded": m ? "true" : "false",
          "aria-hidden": "true"
        });
        w.innerHTML = H, f.appendChild(w), e.appendChild(f);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === c.field) {
        f.setAttribute("data-editing", "true");
        const m = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : M(t, c), { node: w, control: b } = this._buildEditor(c, m);
        f.appendChild(w);
        const D = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          b?.focus(), D || b?.select?.();
        });
      } else
        this._renderCellContent(f, t, c);
      u && c.field === h && this._decorateTreeCell(f, u), e.appendChild(f);
    }
  }
  // Prepend an indent spacer + a chevron (when the row has children) to the
  // tree column's <td>. The chevron carries data-tree-toggle so the body
  // click handler can route it back to toggleTreeRow without conflicting
  // with cell selection or row click handlers.
  _decorateTreeCell(e, t) {
    if (e.classList.add("sg-tree-cell"), e.setAttribute("data-tree-level", String(t.level)), e.style.paddingLeft = `${8 + t.level * 18}px`, t.hasChildren) {
      const s = p("span", {
        class: "sg-tree-chevron",
        "data-tree-toggle": "true",
        "data-expanded": t.expanded ? "true" : "false",
        "aria-hidden": "true"
      });
      s.innerHTML = H, e.insertBefore(s, e.firstChild);
    } else {
      const s = p("span", { class: "sg-tree-chevron sg-tree-chevron-leaf", "aria-hidden": "true" });
      e.insertBefore(s, e.firstChild);
    }
  }
  _renderCellContent(e, t, s) {
    if (s.cellRenderer) {
      const i = ee(s.cellRenderer);
      if (i) {
        const o = M(t, s), a = k(t, s);
        (i.dataset.bind || i.dataset.bindText !== void 0) && (i.textContent = i.dataset.bind ? String(t[i.dataset.bind] ?? "") : a), i.dataset.bindAttr && i.setAttribute(i.dataset.bindAttr, o), i.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((d) => {
          d.dataset.bindText !== void 0 ? d.textContent = a : d.dataset.bind && (d.textContent = String(t[d.dataset.bind] ?? "")), d.dataset.bindAttr && d.setAttribute(d.dataset.bindAttr, o);
        }), e.appendChild(i);
        return;
      }
      const l = ce(s.cellRenderer);
      if (typeof l == "function") {
        const o = M(t, s), a = k(t, s), d = l({ value: o, row: t, col: s, td: e, formatted: a });
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
    this._groupExpanded.set(e, !this._isGroupExpanded(e, t)), this.scheduleRender("group"), _(this.element, "grid:groupToggled", { groupId: e, expanded: this._groupExpanded.get(e) });
  }
  expandAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = -1, this.scheduleRender("group");
  }
  collapseAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = 0, this.scheduleRender("group");
  }
  setRowGroupColumns(e) {
    this.state.group.cols = Array.isArray(e) ? e.slice() : [], this._groupExpanded.clear(), this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("group"), _(this.element, "grid:columnRowGroupChanged", { rowGroupCols: this.state.group.cols.slice() });
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
    t == null ? delete this.state.group.aggs[e] : this.state.group.aggs[e] = t, this.scheduleRender("group"), _(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  // ----- Pivot mode -----
  // Toggling pivot mode rebuilds the display list (and therefore the visible
  // column set). Clears row + cell selection since the underlying cell graph
  // changes shape entirely.
  setPivotMode(e) {
    const t = !!e;
    this.state.pivot.mode !== t && (this.state.pivot.mode = t, this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), _(this.element, "grid:pivotModeChanged", { pivot: t }));
  }
  isPivotMode() {
    return !!this.state.pivot.mode;
  }
  setPivotColumns(e) {
    this.state.pivot.cols = Array.isArray(e) ? e.slice() : [], this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), _(this.element, "grid:columnPivotChanged", { pivotCols: this.state.pivot.cols.slice() });
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
    this.state.group.aggs = t, this.scheduleRender(this.state.pivot.mode ? "pivot" : "group"), _(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  addValueColumn(e, t = "sum") {
    e && this.setColumnAggFunc(e, t);
  }
  removeValueColumn(e) {
    this.setColumnAggFunc(e, null);
  }
  // ----- Column header groups + pinned bottom row -----
  setColumnGroups(e) {
    this.columnGroupsValue = Array.isArray(e) ? e : [], this.scheduleRender("columns"), _(this.element, "grid:columnGroupsChanged", { columnGroups: this.columnGroupsValue });
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
          const l = t.get(i.field);
          l && (i.width != null && (l.width = i.width), l.pinned = i.pinned || void 0, l.hidden = !!i.hidden, t.delete(i.field), s.push(l));
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
      _(this.element, "grid:columnStateApplied", { state: e });
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
    for (const t of ie) this.element.addEventListener(t, e);
    this._persistBeforeUnload = () => {
      this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
    }, window.addEventListener("beforeunload", this._persistBeforeUnload);
  }
  _teardownPersistence() {
    if (this._persistListener) {
      for (const e of ie) this.element.removeEventListener(e, this._persistListener);
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
    let l = s.get(i);
    return l || (l = p("tr")), l.dataset.rowId = i, l.dataset.group = "true", l.dataset.groupLevel = String(e.level), l.className = "sg-group-row", this._renderGroupRow(l, e, t), l;
  }
  _renderGroupRow(e, t, s) {
    e.innerHTML = "";
    const i = this._pinOffsets(), l = this._isGroupExpanded(t.groupId, t.level), o = (this.state.group.displayType || "singleColumn") === "singleColumn", a = !!(this.state.pivot?.mode && this._displayList?.pivot), d = t.__pivotAll === !0, u = s.filter((g) => !g._isRowNumber && !g._isCheckbox && !g._isGroupCol), h = u.some((g) => g.field === t.field) ? t.field : u[0]?.field, c = Math.max(0, t.level);
    d && e.classList.add("sg-pivot-all-row");
    for (const g of s) {
      const f = p("td", { "data-col-id": g.field, "data-pinned": g.pinned || null });
      if (g.pinned === "left" ? f.style.left = i.left[g.field] + "px" : g.pinned === "right" && (f.style.right = i.right[g.field] + "px"), g._isRowNumber || g._isCheckbox) {
        f.classList.add(g._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(f);
        continue;
      }
      if (a || o ? g._isGroupCol : g.field === h) {
        if (f.classList.add("sg-group-cell"), f.style.paddingLeft = `${8 + c * 18}px`, !d) {
          const m = p("span", {
            class: "sg-group-caret",
            "data-expanded": l ? "true" : "false",
            "aria-hidden": "true"
          });
          m.innerHTML = H, f.appendChild(m);
        }
        f.append(
          p("span", { class: "sg-group-label" }, this._groupValueLabel(t)),
          p("span", { class: "sg-group-count" }, ` (${t.count})`)
        );
      } else if (a && g._isPivot) {
        const m = M(t, g);
        m != null && (f.classList.add("sg-agg-cell"), f.textContent = this._formatAggregate(m));
      } else !g._isGroupCol && t.aggregates && t.aggregates[g.field] != null && (f.classList.add("sg-agg-cell"), f.textContent = this._formatAggregate(t.aggregates[g.field]));
      e.appendChild(f);
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
      const i = ee(e.cellEditor);
      if (i) {
        const l = i.matches?.("input,select,textarea") ? i : i.querySelector?.("[data-editor-input]") || i.querySelector?.("input,select,textarea");
        return l && (this._seedEditorValue(l, e, t), l.addEventListener("keydown", this._onEditorKey), l.addEventListener("blur", this._onEditorBlur)), { node: i, control: l };
      }
    }
    const s = this._buildEditorInput(e, t);
    return { node: s, control: s };
  }
  _seedEditorValue(e, t, s) {
    if (t.type === "date" && s) {
      const i = s instanceof Date ? s : new Date(s);
      e.value = Number.isNaN(i?.getTime?.()) ? s ?? "" : i.toISOString().slice(0, 10);
    } else t.type === "boolean" ? e.value = s === !0 ? "true" : s === !1 ? "false" : "" : e.value = s ?? "";
  }
  _buildEditorInput(e, t) {
    let s;
    if (e.type === "number") s = p("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const i = t instanceof Date ? t : t ? new Date(t) : null, l = i ? i.toISOString().slice(0, 10) : "";
      s = p("input", { type: "date", value: l });
    } else e.type === "boolean" ? (s = p("select"), s.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : s = p("input", { type: "text", value: t ?? "" });
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
    const l = this.state.selection.size;
    l > 0 && e.appendChild(this._statusPanel("Selected", this._fmtInt(l))), t.replaceChildren();
    const o = this.getRangeAggregates();
    if (o && o.count > 0) {
      const d = (this.statusBarAggsValue || []).filter((u) => u in o);
      for (const u of d) {
        const h = o[u];
        h == null && u !== "count" || t.appendChild(this._statusPanel(this._aggLabel(u), this._fmtAgg(u, h)));
      }
    }
    const a = o ? `${o.count}|${o.sum}|${o.avg}|${o.min}|${o.max}` : "";
    a !== this._lastRangeAggs && (this._lastRangeAggs = a, _(this.element, "grid:rangeAggsChanged", { aggs: o }));
  }
  _statusPanel(e, t, s = null) {
    const i = p("div", { class: "sg-status-panel" });
    return i.append(
      p("span", { class: "sg-status-label" }, `${e}:`),
      p("span", { class: "sg-status-value" }, t)
    ), s && i.appendChild(p("span", { class: "sg-status-aside" }, s)), i;
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
          const l = s.rows[i];
          if (!(!l || l.__sgGroup || l.__sgDetail))
            for (let o = s.c0; o <= s.c1; o++) {
              const a = s.cols[o];
              !a || a._isCheckbox || a._isRowNumber || a._isGroupCol || a._isMasterExpand || e.push(M(l, a));
            }
        }
    }
    return e;
  }
  getRangeAggregates() {
    return this.state.cellSel.ranges.length ? je(this._cellRangeRawValues()) : null;
  }
  _showColumnMenu(e, t, s) {
    this._closeColumnMenu();
    const i = this._columnMenuItems(e), l = p("div", { class: "sg-column-menu", role: "menu" });
    for (const d of i) {
      if (d === "separator") {
        l.appendChild(p("div", { class: "sg-column-menu-separator", role: "separator" }));
        continue;
      }
      const u = p("button", {
        type: "button",
        class: "sg-column-menu-item" + (d.active ? " sg-column-menu-active" : ""),
        role: "menuitem"
      });
      u.append(
        p("span", { class: "sg-column-menu-label" }, d.label)
      ), d.active && u.append(p("span", { class: "sg-column-menu-check", "aria-hidden": "true" }, "✓")), u.addEventListener("click", () => {
        d.action(), this._closeColumnMenu();
      }), l.appendChild(u);
    }
    document.body.appendChild(l);
    const o = l.offsetWidth || 220, a = l.offsetHeight || 280;
    l.style.left = `${Math.min(t, window.innerWidth - o - 4)}px`, l.style.top = `${Math.min(s, window.innerHeight - a - 4)}px`, this._columnMenu = l, setTimeout(() => {
      document.addEventListener("mousedown", this._onDocMouseDownColumnMenu), document.addEventListener("keydown", this._onColumnMenuKey), window.addEventListener("resize", this._closeColumnMenuBound = () => this._closeColumnMenu(), { once: !0 }), window.addEventListener("scroll", this._closeColumnMenuBound, { once: !0, capture: !0 });
    }, 0), _(this.element, "grid:columnMenuOpened", { colId: e.field });
  }
  _closeColumnMenu() {
    this._columnMenu && (this._columnMenu.remove(), this._columnMenu = null, document.removeEventListener("mousedown", this._onDocMouseDownColumnMenu), document.removeEventListener("keydown", this._onColumnMenuKey), this._closeColumnMenuBound && (window.removeEventListener("resize", this._closeColumnMenuBound), window.removeEventListener("scroll", this._closeColumnMenuBound, { capture: !0 }), this._closeColumnMenuBound = null));
  }
  // Build the menu item list for `col` based on the current grid state. Each
  // item is { label, action, active? } or the string 'separator'. Items are
  // emitted only when they make sense (e.g. "Unpin" doesn't show on an
  // unpinned col), so the menu stays short.
  _columnMenuItems(e) {
    const t = this.element.gridApi, s = e.headerName || e.field, i = this.state.group.cols.includes(e.field), l = this.state.pivot.cols.includes(e.field), o = this.state.group.aggs[e.field], a = e.type === "number", d = [];
    if (e.pinned !== "left" && d.push({ label: "Pin left", action: () => t.setColumnPinned(e.field, "left") }), e.pinned !== "right" && d.push({ label: "Pin right", action: () => t.setColumnPinned(e.field, "right") }), e.pinned && d.push({ label: "Unpin", action: () => t.setColumnPinned(e.field, null) }), d.push("separator"), d.push({ label: "Autosize this column", action: () => t.autoSizeColumn(e.field) }), d.push({ label: "Autosize all columns", action: () => t.autoSizeAllColumns() }), d.push("separator"), d.push(i ? { label: `Ungroup ${s}`, action: () => t.removeRowGroupColumn(e.field) } : { label: `Group by ${s}`, action: () => t.addRowGroupColumn(e.field) }), d.push(l ? { label: `Remove ${s} from pivot`, action: () => t.removePivotColumn(e.field) } : { label: `Pivot by ${s}`, action: () => {
      t.isPivotMode() || t.setPivotMode(!0), t.addPivotColumn(e.field);
    } }), a || o) {
      d.push("separator");
      for (const u of ["sum", "avg", "count", "min", "max"])
        d.push({
          label: `Aggregate: ${u}`,
          active: o === u,
          action: () => t.addValueColumn(e.field, u)
        });
      o && d.push({ label: "Remove aggregation", action: () => t.removeValueColumn(e.field) });
    }
    return d.push("separator"), d.push({ label: "Hide column", action: () => t.setColumnVisible(e.field, !1) }), d.push({
      label: "Show all columns",
      action: () => {
        this.state.columnDefs.forEach((u) => {
          u.hidden && !u._isGroupCol && !u._isPivot && !u._isCheckbox && !u._isRowNumber && t.setColumnVisible(u.field, !0);
        });
      }
    }), d;
  }
  // ----- Event delegation (clicks on rendered tbody) -----
  // Stimulus actions on tbody — wired in _buildChrome by adding data-action.
  // For simplicity we add native listeners here.
  _attachBodyListeners() {
    this._listenersAttached || (this._listenersAttached = !0, this._tbody.addEventListener("click", (e) => this._onBodyClick(e)), this._tbody.addEventListener("dblclick", (e) => this._onBodyDblClick(e)), this._tbody.addEventListener("mousedown", this._onCellMouseDown), this._tbody.addEventListener("mouseover", this._onCellMouseOver), document.addEventListener("mouseup", this._onCellMouseUp), document.addEventListener("copy", this._onCopy), this._viewport.addEventListener("scroll", this._onScroll, { passive: !0 }));
  }
  _onBodyClick(e) {
    const t = e.target.closest("tr");
    if (!t) return;
    if (t.dataset.group === "true") {
      this.toggleGroup(t.dataset.rowId.replace(/^__g:/, ""), Number(t.dataset.groupLevel) || 0);
      return;
    }
    if (t.classList.contains("sg-detail-row")) return;
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
    const l = this._coerceRowId(t.dataset.rowId), o = e.target.closest("td");
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(l, "toggle");
      return;
    }
    if (o && o.dataset.gutter === "true") {
      if (this._rowDragMoved) {
        this._rowDragMoved = !1;
        return;
      }
      if (this.rowSelectionValue !== "") {
        const d = e.shiftKey ? "range" : e.metaKey || e.ctrlKey ? "toggle" : "replace";
        this.clearCellSelection(), this.toggleRowSelection(l, d), _(this.element, "grid:rowClicked", { rowId: l, row: this.state.rowData.find((u) => this._rowId(u) === l), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (o) {
      const d = this.state.rowData.find((h) => this._rowId(h) === l), u = o.dataset.colId;
      _(this.element, "grid:cellClicked", { rowId: l, colId: u, value: d?.[u], event: e });
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
    const a = e.shiftKey ? "range" : e.metaKey || e.ctrlKey || this.rowMultiSelectWithClickValue ? "toggle" : "replace";
    this.toggleRowSelection(l, a), _(this.element, "grid:rowClicked", { rowId: l, row: this.state.rowData.find((d) => this._rowId(d) === l), event: e });
  }
  // ----- Cell selection (Numbers/Sheets-style: multi-range + active cell) -----
  _cellAt(e) {
    const t = e.closest?.("td"), s = e.closest?.("tr");
    return !t || !s || s.dataset.group === "true" || s.classList.contains("sg-detail-row") || t.classList.contains("sg-checkbox-cell") || t.classList.contains("sg-group-leaf-cell") || t.classList.contains("sg-master-expand-cell") || t.dataset.gutter === "true" || !t.dataset.colId || t.dataset.editing === "true" ? null : { rowId: this._coerceRowId(s.dataset.rowId), colId: t.dataset.colId };
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
    const t = Array.from(this.state.selection).map(String), s = new Set(t.includes(String(e)) ? t : [String(e)]), i = p("div", { class: "sg-drag-ghost sg-grid" }), l = p("table"), o = p("tbody");
    let a = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((u) => {
      if (s.has(u.dataset.rowId) && a < 6) {
        const h = u.cloneNode(!0);
        h.removeAttribute("data-selected"), h.querySelectorAll("td").forEach((c) => {
          c.style.left = "", c.style.right = "", c.removeAttribute("data-pinned"), c.removeAttribute("data-cell-active"), c.removeAttribute("data-cell-range");
        }), o.appendChild(h), a += 1;
      }
    }), l.appendChild(o), i.appendChild(l), s.size > a && i.appendChild(p("div", { class: "sg-drag-ghost-more" }, `+${s.size - a} more rows`)), i.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(i);
    const d = p("div", { class: "sg-drop-indicator" });
    document.body.appendChild(d), this._rowDrag = { ids: s, ghost: i, indicator: d, dropRowId: null, dropBefore: !0 }, document.body.classList.add("sg-row-dragging");
  }
  _updateDropIndicator(e) {
    const t = Array.from(this._tbody.querySelectorAll("tr[data-row-id]"));
    let s = null, i = !0;
    for (const d of t) {
      const u = d.getBoundingClientRect();
      if (e < u.top + u.height / 2) {
        s = d, i = !0;
        break;
      }
      s = d, i = !1;
    }
    if (!s) return;
    const l = s.getBoundingClientRect(), o = this._viewport.getBoundingClientRect(), a = this._rowDrag.indicator;
    a.style.left = `${o.left}px`, a.style.width = `${o.width}px`, a.style.top = `${(i ? l.top : l.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(s.dataset.rowId), this._rowDrag.dropBefore = i;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: s, dropRowId: i, dropBefore: l } = this._rowDrag;
    if (t.remove(), s.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, i == null || e.has(String(i))) return;
    const o = this.state.rowData, a = o.filter((h) => e.has(String(this._rowId(h)))), d = o.filter((h) => !e.has(String(this._rowId(h))));
    let u = d.findIndex((h) => this._rowId(h) === i);
    u < 0 ? u = d.length : l || (u += 1), d.splice(u, 0, ...a), this.state.rowData = d, this.state.sortModel = [], this.scheduleRender("data"), _(this.element, "grid:rowDragEnd", {
      ids: a.map((h) => this._rowId(h)),
      toRowId: i,
      before: l
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
    const t = this._displayList.pageRows, s = this._visibleCols(), i = (h) => t.findIndex((c) => this._rowId(c) === h), l = (h) => s.findIndex((c) => c.field === h), o = i(e.anchor.rowId), a = l(e.anchor.colId);
    if (o < 0 || a < 0) return null;
    const d = i(e.focus.rowId), u = l(e.focus.colId);
    return {
      r0: Math.min(o, d < 0 ? o : d),
      r1: Math.max(o, d < 0 ? o : d),
      c0: Math.min(a, u < 0 ? a : u),
      c1: Math.max(a, u < 0 ? a : u),
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
      const l = [];
      for (let o = e.c0; o <= e.c1; o++) {
        const a = e.cols[o];
        a && l.push(k(i, a));
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
    for (const i of this.state.cellSel.ranges) {
      const l = this._rangeRect(i);
      if (l)
        for (let o = l.r0; o <= l.r1; o++) {
          const a = l.rows[o];
          if (a)
            for (let d = l.c0; d <= l.c1; d++) {
              const u = l.cols[d];
              if (!u) continue;
              const h = `${this._rowId(a)}:${u.field}`;
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
        for (let i = s.r0; i <= s.r1; i++) {
          const l = s.rows[i];
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
    const i = this._displayList.pageRows, l = this._navCols();
    if (!i.length || !l.length) return;
    const o = (c, g, f) => Math.max(g, Math.min(c, f)), a = this._activeCell(), d = () => i.findIndex((c) => !c.__sgGroup && !c.__sgDetail);
    let u = a ? i.findIndex((c) => this._rowId(c) === a.rowId) : d(), h = a ? l.findIndex((c) => c.field === a.colId) : 0;
    if (u < 0 && (u = d()), !(u < 0)) {
      if (h < 0 && (h = 0), s && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const c = this.state.cellSel.ranges[this.state.cellSel.activeIdx], g = o(i.findIndex((v) => this._rowId(v) === c.focus.rowId) + e, 0, i.length - 1), f = o(l.findIndex((v) => v.field === c.focus.colId) + t, 0, l.length - 1);
        this._extendActiveRange({ rowId: this._rowId(i[g]), colId: l[f].field });
      } else {
        let c = o(u + e, 0, i.length - 1);
        if (e !== 0) {
          for (; i[c] && (i[c].__sgGroup || i[c].__sgDetail); ) {
            const f = c + e;
            if (f < 0 || f >= i.length) break;
            c = f;
          }
          if (!i[c] || i[c].__sgGroup || i[c].__sgDetail) return;
        }
        const g = o(h + t, 0, l.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(i[c]), colId: l[g].field });
      }
      this._applyCellSelHighlight(), this._scrollActiveIntoView(), _(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
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
    }, this._applyCellSelHighlight(), _(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
  }
  // Clear the value of every selected, editable cell (Delete/Backspace).
  _clearSelectedCells() {
    let e = !1;
    for (const t of this.state.cellSel.ranges) {
      const s = this._rangeRect(t);
      if (s)
        for (let i = s.r0; i <= s.r1; i++) {
          const l = s.rows[i];
          if (!(!l || l.__sgGroup || l.__sgDetail))
            for (let o = s.c0; o <= s.c1; o++) {
              const a = s.cols[o];
              if (!a || !a.editable || a._isCheckbox || a._isRowNumber) continue;
              const d = l[a.field];
              d === "" || d == null || (l[a.field] = "", e = !0, _(this.element, "grid:cellValueChanged", { rowId: this._rowId(l), colId: a.field, oldValue: d, newValue: "" }));
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
    const i = this._coerceRowId(t.dataset.rowId), l = s.dataset.colId;
    this.startEditingCell(i, l);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const s = this._visibleCols().filter((c) => c.editable && !c._isCheckbox), i = this._displayList.pageRows, l = i.findIndex((c) => this._rowId(c) === t.rowId), o = s.findIndex((c) => c.field === t.colId);
    if (!s.length || !i.length || l < 0 || o < 0) {
      this.stopEditing(!1);
      return;
    }
    const a = i.length * s.length, d = (l * s.length + o + e + a) % a, u = i[Math.floor(d / s.length)], h = s[d % s.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(u), h.field), requestAnimationFrame(() => {
      this._navigatingEditor = !1;
    });
  }
  // Wire editor listeners whenever a cell mounts an input.
  // Done lazily via MutationObserver on tbody (cheap because tbody is small per page).
  // ----- Helpers -----
  _visibleCols() {
    const e = this.state.columnDefs.filter((a) => !a.hidden), t = this.state.group?.cols || [], s = this.masterDetailValue && !this.state.pivot?.mode && !t.length;
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
      const a = new Set(t);
      return [{
        field: "__group",
        headerName: "Group",
        _isGroupCol: !0,
        width: 240,
        sortable: !1,
        filter: null,
        resizable: !1
      }, ...e.filter((u) => !a.has(u.field))];
    }
    if (this.groupReorderColumnsValue === !1) return e;
    const l = t.map((a) => e.find((d) => d.field === a)).filter(Boolean), o = new Set(l);
    return [...l, ...e.filter((a) => !o.has(a))];
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
      if (t.push(s), s.__sgGroup || s.__sgDetail) continue;
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
    _(this.element, "grid:detailRowExpanded", { rowId: e, masterRow: s });
  }
  collapseDetailRow(e) {
    if (!this.masterDetailValue) return;
    const t = String(e);
    if (!this._detailExpanded.has(t)) return;
    this._detailExpanded.delete(t), this._detailGrids.delete(t), this.scheduleRender("cells");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === t);
    _(this.element, "grid:detailRowCollapsed", { rowId: e, masterRow: s });
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
    const i = this.state.rowData.find((l) => String(this._rowId(l)) === t);
    _(this.element, s ? "grid:treeRowCollapsed" : "grid:treeRowExpanded", { rowId: e, row: i });
  }
  expandTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !0), this.scheduleRender("tree");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === t);
    _(this.element, "grid:treeRowExpanded", { rowId: e, row: s });
  }
  collapseTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (!this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !1), this.scheduleRender("tree");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === t);
    _(this.element, "grid:treeRowCollapsed", { rowId: e, row: s });
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
    this.treeDataValue !== t && (this.treeDataValue = t, this.state.tree.enabled = t, t || this._treeExpanded.clear(), this.scheduleRender("tree"), _(this.element, "grid:treeDataChanged", { treeData: t }));
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
    let l = s.get(i);
    const o = String(e.masterId);
    if (l) {
      if (l.getAttribute("data-master-id") === o)
        return l.classList.remove("sg-spacer"), l;
      l = null;
    }
    l || (l = p("tr")), l.className = "sg-detail-row", l.dataset.rowId = i, l.setAttribute("data-master-id", o), l.innerHTML = "";
    const a = p("td", { colspan: String(t.length || 1), class: "sg-detail-cell" }), d = p("div", { class: "sg-detail-shell" });
    return d.style.minHeight = `${this.detailRowHeightValue}px`, a.appendChild(d), l.appendChild(a), this._populateDetailShell(d, e.master, e.masterId), l;
  }
  // Fill the detail shell. Strategy: if the grid has a detail-template value
  // pointing at an existing <template>, clone its content and run a tiny
  // data-bind pass keyed off the master row. Otherwise render a minimal
  // fallback so the panel still appears (handy when the user is wiring up
  // their first detail panel and hasn't authored a template yet).
  _populateDetailShell(e, t, s) {
    const i = this.detailTemplateValue;
    let l;
    if (i) {
      const a = document.getElementById(i);
      if (a && a.tagName === "TEMPLATE") {
        const d = a.content.cloneNode(!0);
        this._applyDetailBindings(d, t), e.appendChild(d), l = e;
      }
    }
    if (!l) {
      const a = p("div", { class: "sg-detail-fallback" }), d = Object.keys(t || {}).filter((u) => !u.startsWith("_") && !u.startsWith("__")).slice(0, 6);
      for (const u of d)
        a.append(
          p("span", { class: "sg-detail-fallback-label" }, `${u}: `),
          p("span", { class: "sg-detail-fallback-value" }, String(t[u] ?? "")),
          p("span", { class: "sg-detail-fallback-sep" }, "  ·  ")
        );
      a.lastElementChild?.remove(), e.appendChild(a);
    }
    const o = e.querySelector('[data-controller~="grid"]');
    o && this._seedNestedGrid(o, t, s), queueMicrotask(() => {
      _(this.element, "grid:detailRowMounted", {
        rowId: s,
        masterRow: t,
        detailEl: e,
        nestedGridApi: o?.gridApi || null
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
        const l = i.getAttribute("data-detail-if");
        if (!t[l]) {
          i.remove();
          return;
        }
      }
      if (i.hasAttribute("data-detail-bind")) {
        const l = i.getAttribute("data-detail-bind");
        i.textContent = t[l] == null ? "" : String(t[l]);
      }
      if (i.hasAttribute("data-detail-bind-attr")) {
        const l = i.getAttribute("data-detail-bind-attr"), [o, a] = l.split(":");
        o && a && i.setAttribute(o, t[a] == null ? "" : String(t[a]));
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
      const l = t?.[i];
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
    const i = {};
    s = 0;
    for (let l = e.length - 1; l >= 0; l--) {
      const o = e[l];
      o.pinned === "right" && (i[o.field] = s, s += o.width || 150);
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
x(Y, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: se },
  rowHeight: { type: Number, default: Dt },
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
  treeDefaultExpanded: { type: Number, default: -1 }
  // -1 all expanded · 0 only roots · N first-N levels expanded
});
function Et(r, n) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (r[t] !== n[t]) return !1;
  return !0;
}
function At(r) {
  return r === "number" || r === "date" ? [
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "lessThan", label: "Less than" },
    { value: "greaterThan", label: "Greater than" },
    { value: "inRange", label: "In range" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" }
  ] : r === "boolean" ? [
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
function Lt(r, n) {
  if (n === "number") {
    const e = Number(r);
    return Number.isFinite(e) ? e : r;
  }
  return n === "date" ? r : n === "boolean" ? r === "true" ? !0 : r === "false" ? !1 : null : r;
}
function $(r) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(r)) : String(r).replace(/["\\\n\r]/g, (n) => "\\" + n);
}
class Q extends N {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    x(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, s = e.clientY;
      let i = !1;
      const l = (a) => {
        const d = Math.abs(a.clientX - t), u = Math.abs(a.clientY - s);
        !i && (d > 5 || u > 5) && (i = !0, document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", o), this._beginReorder(t));
      }, o = (a) => {
        document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", o), i || this.sort(a);
      };
      document.addEventListener("mousemove", l), document.addEventListener("mouseup", o);
    });
  }
  connect() {
    if (this.grid = ot(this.element, "grid", this.application), !!this.grid) {
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
      _isCheckbox: this.checkboxValue,
      _isRowNumber: this.rowNumberValue,
      sortable: this.rowNumberValue ? !1 : this.sortableValue,
      resizable: this.rowNumberValue ? !1 : this.resizableValue
    };
  }
  _beginReorder(e) {
    if (!this.grid) return;
    const t = this.element.parentElement, s = Array.from(t.children), i = s.indexOf(this.element);
    let l = i;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const o = (d) => {
      const u = d.clientX;
      let h = s.length;
      for (let c = 0; c < s.length; c++) {
        const g = s[c].getBoundingClientRect();
        if (u < g.left + g.width / 2) {
          h = c;
          break;
        }
      }
      l = h > i ? h - 1 : h;
    }, a = () => {
      document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", l !== i && this.grid.moveColumn(this.fieldValue, l);
    };
    document.addEventListener("mousemove", o), document.addEventListener("mouseup", a);
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
    const t = e.clientX, s = this.element.offsetWidth, i = (o) => this.grid.setColumnWidth(this.fieldValue, s + (o.clientX - t)), l = () => {
      document.removeEventListener("mousemove", i), document.removeEventListener("mouseup", l), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", i), document.addEventListener("mouseup", l), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
x(Q, "values", {
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
  rowNumber: { type: Boolean, default: !1 }
  // gutter: shows 1-based row number, click selects row
});
class ke extends N {
  connect() {
  }
}
class Pe extends N {
  connect() {
  }
}
class Ne extends N {
  connect() {
  }
}
class K extends N {
  constructor() {
    super(...arguments);
    x(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), s = e.paginationGetTotalPages(), i = e.paginationGetRowCount(), l = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const o = i === 0 ? 0 : t * l + 1, a = Math.min(i, o + l - 1);
        this.pageInfoTarget.textContent = i === 0 ? "0 rows" : `${o}–${a} of ${i}`;
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
x(K, "outlets", ["grid"]), x(K, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
const j = ["sum", "avg", "count", "min", "max"], It = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', Tt = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class Fe extends N {
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
    this.element.innerHTML = "", this._content = p("div", { class: "sg-side-panel-content" });
    const n = p("div", { class: "sg-side-panel-tabs" });
    this._columnsTab = p("button", {
      type: "button",
      class: "sg-side-panel-tab",
      "aria-pressed": "true",
      title: "Columns"
    }), this._columnsTab.innerHTML = It, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), n.appendChild(this._columnsTab), this.element.append(this._content, n);
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
    const e = p("label", { class: "sg-panel-pivot-toggle" }), t = p("input", { type: "checkbox" });
    t.checked = n.isPivotMode(), t.addEventListener("change", () => n.setPivotMode(t.checked)), e.append(t, p("span", {}, "Pivot mode")), this._content.appendChild(e), this._content.appendChild(this._renderColumnsList()), this._content.appendChild(this._renderDropSection({
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
    const n = this._api(), e = p("div", { class: "sg-panel-section" });
    e.appendChild(p("div", { class: "sg-panel-section-title" }, "Columns"));
    const t = p("ul", { class: "sg-column-list" });
    e.appendChild(t);
    const s = new Set(n.getRowGroupColumns()), i = new Set(n.getPivotColumns()), l = new Map(n.getValueColumns().map((o) => [o.field, o.aggFunc]));
    for (const o of this._columns()) {
      const a = p("li", { class: "sg-column-list-item", draggable: "true" });
      a.dataset.field = o.field;
      const d = p("span", { class: "sg-column-grip", "aria-hidden": "true" });
      d.innerHTML = Tt;
      const u = p("input", { type: "checkbox" });
      u.checked = !o.hidden, u.addEventListener("change", () => n.setColumnVisible(o.field, u.checked));
      const h = p("span", { class: "sg-column-list-label" }, o.headerName || o.field), c = p("span", { class: "sg-column-list-tags" });
      s.has(o.field) && c.appendChild(p("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), i.has(o.field) && c.appendChild(p("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), l.has(o.field) && c.appendChild(p("span", { class: "sg-tag sg-tag-value", title: `Value (${l.get(o.field)})` }, l.get(o.field))), a.append(d, u, h, c), this._wireDragSource(a, o.field), t.appendChild(a);
    }
    return this._wireDropZone(t, "columns"), e;
  }
  _renderDropSection({ title: n, placeholder: e, kind: t, fields: s }) {
    const i = p("div", { class: "sg-panel-section sg-panel-drop" });
    i.appendChild(p("div", { class: "sg-panel-section-title" }, n));
    const l = p("div", { class: "sg-drop-zone" });
    if (l.dataset.dropKind = t, !s.length)
      l.classList.add("sg-drop-zone-empty"), l.appendChild(p("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const o of s) l.appendChild(this._renderChip(t, o));
    return this._wireDropZone(l, t), i.appendChild(l), i;
  }
  _renderValuesSection() {
    const n = this._api(), e = p("div", { class: "sg-panel-section sg-panel-drop" });
    e.appendChild(p("div", { class: "sg-panel-section-title" }, "Values"));
    const t = p("div", { class: "sg-drop-zone" });
    t.dataset.dropKind = "value";
    const s = n.getValueColumns();
    if (!s.length)
      t.classList.add("sg-drop-zone-empty"), t.appendChild(p("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
    else
      for (const { field: i, aggFunc: l } of s) t.appendChild(this._renderValueChip(i, l));
    return this._wireDropZone(t, "value"), e.appendChild(t), e;
  }
  _renderChip(n, e) {
    const t = this._colByField(e), s = p("span", { class: "sg-chip", draggable: "true" });
    return s.dataset.field = e, s.dataset.fromKind = n, s.append(
      p("span", { class: "sg-chip-label" }, t?.headerName || e),
      this._removeButton(() => this._removeFrom(n, e))
    ), this._wireDragSource(s, e), s;
  }
  _renderValueChip(n, e) {
    const t = this._api(), s = this._colByField(n), i = p("span", { class: "sg-chip sg-chip-value", draggable: "true" });
    i.dataset.field = n, i.dataset.fromKind = "value";
    const l = p("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return l.addEventListener("click", (o) => {
      o.stopPropagation();
      const a = j.indexOf(e), d = j[(a === -1 ? 0 : a + 1) % j.length];
      t.setColumnAggFunc(n, d);
    }), i.append(
      l,
      p("span", { class: "sg-chip-label" }, s?.headerName || n),
      this._removeButton(() => t.removeValueColumn(n))
    ), this._wireDragSource(i, n), i;
  }
  _removeButton(n) {
    const e = p("button", { type: "button", class: "sg-chip-remove", "aria-label": "Remove", title: "Remove" });
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
function Vt(r) {
  const n = r ?? $e.start();
  return n.register("grid", Y), n.register("header-cell", Q), n.register("row", ke), n.register("cell", Pe), n.register("filter", Ne), n.register("pagination", K), n.register("side-panel", Fe), n;
}
const kt = {
  start: Vt,
  GridController: Y,
  HeaderCellController: Q,
  RowController: ke,
  CellController: Pe,
  FilterController: Ne,
  PaginationController: K,
  SidePanelController: Fe,
  registerRenderer: R,
  getRenderer: ce,
  listRenderers: at,
  renderers: Rt
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = kt);
export {
  Pe as CellController,
  Ne as FilterController,
  Y as GridController,
  Q as HeaderCellController,
  K as PaginationController,
  ke as RowController,
  Fe as SidePanelController,
  kt as default,
  ce as getRenderer,
  at as listRenderers,
  R as registerRenderer,
  Rt as renderers,
  Vt as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
