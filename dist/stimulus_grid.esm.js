var re = Object.defineProperty;
var ae = (l, n, e) => n in l ? re(l, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : l[n] = e;
var S = (l, n, e) => ae(l, typeof n != "symbol" ? n + "" : n, e);
import { Controller as P, Application as de } from "@hotwired/stimulus";
function x(l, n) {
  return typeof n.valueGetter == "function" ? n.valueGetter(l) : l?.[n.field];
}
function I(l, n) {
  const e = x(l, n);
  return typeof n.valueFormatter == "function" ? n.valueFormatter(e, l) : e == null ? "" : n.type === "date" && e instanceof Date ? e.toLocaleDateString() : n.type === "boolean" ? e ? "✓" : "" : String(e);
}
const Y = {
  contains: (l, n) => String(l ?? "").toLowerCase().includes(String(n ?? "").toLowerCase()),
  notContains: (l, n) => !String(l ?? "").toLowerCase().includes(String(n ?? "").toLowerCase()),
  equals: (l, n) => String(l ?? "").toLowerCase() === String(n ?? "").toLowerCase(),
  notEqual: (l, n) => String(l ?? "").toLowerCase() !== String(n ?? "").toLowerCase(),
  startsWith: (l, n) => String(l ?? "").toLowerCase().startsWith(String(n ?? "").toLowerCase()),
  endsWith: (l, n) => String(l ?? "").toLowerCase().endsWith(String(n ?? "").toLowerCase()),
  blank: (l) => l == null || l === "",
  notBlank: (l) => l != null && l !== ""
}, ue = {
  equals: (l, n) => Number(l) === Number(n),
  notEqual: (l, n) => Number(l) !== Number(n),
  lessThan: (l, n) => Number(l) < Number(n),
  lessThanOrEqual: (l, n) => Number(l) <= Number(n),
  greaterThan: (l, n) => Number(l) > Number(n),
  greaterThanOrEqual: (l, n) => Number(l) >= Number(n),
  inRange: (l, n, e) => Number(l) >= Number(n) && Number(l) <= Number(e),
  blank: (l) => l == null || l === "",
  notBlank: (l) => l != null && l !== ""
};
function E(l) {
  if (l == null || l === "") return null;
  if (l instanceof Date) return l;
  const n = new Date(l);
  return Number.isNaN(n.valueOf()) ? null : n;
}
const ce = {
  equals: (l, n) => E(l)?.toDateString() === E(n)?.toDateString(),
  notEqual: (l, n) => E(l)?.toDateString() !== E(n)?.toDateString(),
  lessThan: (l, n) => (E(l)?.valueOf() ?? -1 / 0) < (E(n)?.valueOf() ?? 1 / 0),
  greaterThan: (l, n) => (E(l)?.valueOf() ?? 1 / 0) > (E(n)?.valueOf() ?? -1 / 0),
  inRange: (l, n, e) => {
    const t = E(l)?.valueOf();
    return t != null && t >= (E(n)?.valueOf() ?? -1 / 0) && t <= (E(e)?.valueOf() ?? 1 / 0);
  },
  blank: (l) => l == null || l === "",
  notBlank: (l) => l != null && l !== ""
}, he = {
  equals: (l, n) => n === "true" ? !!l : n === "false" ? !l : !0
}, pe = {
  in: (l, n) => Array.isArray(n) && n.includes(String(l ?? ""))
}, fe = { text: Y, number: ue, date: ce, boolean: he, set: pe };
function Q(l, n, e) {
  if (!e) return !0;
  const t = e.filterType || n.filter || "text", i = (fe[t] || Y)[e.type];
  if (!i) return !0;
  const o = x(l, n);
  return i(o, e.value, e.value2);
}
function Z(l, n, e) {
  const t = Object.entries(n || {}).filter(([, s]) => s != null);
  return t.length === 0 ? l : l.filter((s) => t.every(([i, o]) => {
    const r = e[i];
    return r ? Q(s, r, o) : !0;
  }));
}
function J(l, n, e) {
  if (!n) return l;
  const t = String(n).toLowerCase();
  return l.filter((s) => {
    for (const i of e) {
      const o = I(s, i);
      if (o && String(o).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function V(l, n, e) {
  if (l == null && n == null) return 0;
  if (l == null) return -1;
  if (n == null) return 1;
  if (e === "number") return Number(l) - Number(n);
  if (e === "date") {
    const t = E(l)?.valueOf() ?? 0, s = E(n)?.valueOf() ?? 0;
    return t - s;
  }
  return e === "boolean" ? l === n ? 0 : l ? 1 : -1 : String(l).localeCompare(String(n), void 0, { numeric: !0, sensitivity: "base" });
}
function ge(l, n, e) {
  if (!n || n.length === 0) return l;
  const t = l.slice();
  return t.sort((s, i) => {
    for (const { colId: o, sort: r } of n) {
      const a = e[o];
      if (!a) continue;
      const u = x(s, a), d = x(i, a), h = typeof a.comparator == "function" ? a.comparator(u, d, s, i) : V(u, d, a.type);
      if (h !== 0) return r === "desc" ? -h : h;
    }
    return 0;
  }), t;
}
function B(l, n) {
  if (!n || !n.enabled) return { rows: l, total: l.length, pageRows: l };
  const e = l.length, t = Math.max(1, Math.ceil(e / n.pageSize)), s = Math.min(n.page, t - 1), i = s * n.pageSize, o = l.slice(i, i + n.pageSize);
  return { rows: l, total: e, totalPages: t, page: s, pageRows: o };
}
function ee(l, n, e) {
  if (l === "count") return n.length;
  const t = n.map((i) => x(i, e));
  if (l === "first") return t.length ? t[0] : null;
  if (l === "last") return t.length ? t[t.length - 1] : null;
  const s = t.map(Number).filter((i) => !Number.isNaN(i));
  switch (l) {
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
function z(l, n, e) {
  const t = {};
  for (const [s, i] of Object.entries(n || {})) {
    const o = e[s];
    o && (t[s] = ee(i, l, o));
  }
  return t;
}
function me(l) {
  let n = 0, e = 0, t = 0, s = 1 / 0, i = -1 / 0;
  for (const o of l) {
    if (o == null || o === "") continue;
    n += 1;
    let r = null;
    if (typeof o == "number" && Number.isFinite(o)) r = o;
    else if (typeof o == "string" && o.trim() !== "") {
      const a = Number(o);
      Number.isFinite(a) && (r = a);
    }
    r != null && (e += 1, t += r, r < s && (s = r), r > i && (i = r));
  }
  return {
    count: n,
    sum: e ? t : null,
    avg: e ? t / e : null,
    min: e ? s : null,
    max: e ? i : null
  };
}
function _e(l, n, e, t, s = () => !0) {
  const i = (u, d, h) => {
    const c = n[d], g = /* @__PURE__ */ new Map();
    for (const f of u) {
      const v = x(f, c), m = v == null ? "" : String(v);
      g.has(m) || g.set(m, { value: v, rows: [] }), g.get(m).rows.push(f);
    }
    return Array.from(g.values()).sort((f, v) => V(f.value, v.value, c.type)).map(({ value: f, rows: v }) => {
      const m = f == null ? "" : String(f), w = h ? `${h}|${c.field}=${m}` : `${c.field}=${m}`;
      return {
        __sgGroup: !0,
        level: d,
        field: c.field,
        value: f,
        groupId: w,
        count: v.length,
        aggregates: z(v, t, e),
        leaves: v,
        children: d + 1 < n.length ? i(v, d + 1, w) : null
      };
    });
  }, o = i(l, 0, ""), r = [], a = (u) => {
    for (const d of u)
      if (r.push(d), !!s(d.groupId, d.level))
        if (d.children) a(d.children);
        else for (const h of d.leaves) r.push(h);
  };
  return a(o), { displayList: r, tree: o };
}
function te(l, n, e) {
  return `__p|${e.map((s) => {
    const i = l[s.field];
    return `${s.field}=${i == null ? "" : String(i)}`;
  }).join("|")}|${n.col.field}:${n.aggFunc}`;
}
function se(l, n) {
  return n.map((e) => {
    const t = x(l, e);
    return t == null ? "" : String(t);
  }).join("");
}
function ve(l, n) {
  if (!n?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const t of l) {
    const s = se(t, n);
    if (!e.has(s)) {
      const i = {};
      n.forEach((o) => {
        const r = x(t, o);
        i[o.field] = r ?? null;
      }), e.set(s, i);
    }
  }
  return Array.from(e.values()).sort((t, s) => {
    for (const i of n) {
      const o = V(t[i.field], s[i.field], i.type);
      if (o !== 0) return o;
    }
    return 0;
  });
}
function we(l, n, e) {
  if (!l.length || !n.length) return [];
  const t = [], s = n.length === 1;
  for (const i of l)
    for (const o of n) {
      const r = te(i, o, e), a = e.map((d) => i[d.field] == null ? "(Blank)" : String(i[d.field])).join(" · "), u = s ? a : `${a} · ${o.aggFunc}(${o.col.field})`;
      t.push({
        field: r,
        headerName: u,
        type: "number",
        width: 100,
        sortable: !0,
        filter: null,
        resizable: !1,
        _isPivot: !0,
        pivotKeys: { ...i },
        valueField: o.col.field,
        aggFunc: o.aggFunc,
        valueGetter: (d) => d?.__pivotValues?.[r] ?? null
      });
    }
  return t;
}
function Ce(l) {
  return typeof l == "string" && l.startsWith("__p|");
}
function ye(l, n) {
  const e = Array.isArray(l) ? l.filter((t) => t && t.colId && t.sort) : [];
  return (t, s) => {
    for (const i of e) {
      const o = i.sort === "desc" ? -1 : 1;
      if (Ce(i.colId)) {
        const r = t.__pivotValues ? t.__pivotValues[i.colId] : null, a = s.__pivotValues ? s.__pivotValues[i.colId] : null, u = V(r, a, "number");
        if (u !== 0) return o * u;
        continue;
      }
      if (n && i.colId === n.field) {
        const r = V(t.value, s.value, n.type);
        if (r !== 0) return o * r;
        continue;
      }
    }
    return V(t.value, s.value, n?.type);
  };
}
function H(l, n, e, t) {
  const s = {}, i = /* @__PURE__ */ new Map();
  for (const o of l) {
    const r = se(o, t);
    i.has(r) || i.set(r, []), i.get(r).push(o);
  }
  for (const o of n) {
    const r = t.map((u) => {
      const d = o[u.field];
      return d == null ? "" : String(d);
    }).join(""), a = i.get(r) || [];
    for (const u of e) {
      const d = te(o, u, t);
      s[d] = a.length ? ee(u.aggFunc, a, u.col) : null;
    }
  }
  return s;
}
function be({ rows: l, rowGroupCols: n = [], pivotCols: e, valueConfigs: t, isExpanded: s = () => !0, sortModel: i = [] }) {
  const o = ve(l, e), r = we(o, t, e), a = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: l.length,
    aggregates: {},
    leaves: l,
    __pivotValues: H(l, o, t, e)
  };
  if (!n.length)
    return { columns: r, displayList: [a], tree: [], combos: o };
  const u = (g, f, v) => {
    const m = n[f], w = /* @__PURE__ */ new Map();
    for (const D of g) {
      const y = x(D, m), b = y == null ? "" : String(y);
      w.has(b) || w.set(b, { value: y, rows: [] }), w.get(b).rows.push(D);
    }
    const C = Array.from(w.values()).map(({ value: D, rows: y }) => {
      const b = D == null ? "" : String(D), M = v ? `${v}|${m.field}=${b}` : `${m.field}=${b}`;
      return {
        __sgGroup: !0,
        level: f,
        field: m.field,
        value: D,
        groupId: M,
        count: y.length,
        aggregates: {},
        leaves: y,
        __pivotValues: H(y, o, t, e),
        children: f + 1 < n.length ? u(y, f + 1, M) : null
      };
    }), R = ye(i, m);
    return C.sort(R);
  }, d = u(l, 0, ""), h = [a], c = (g) => {
    for (const f of g)
      h.push(f), s(f.groupId, f.level) && f.children && c(f.children);
  };
  return c(d), { columns: r, displayList: h, tree: d, combos: o };
}
function Se(l, { pivotCols: n = [], valueConfigs: e = [], columnGroups: t = null } = {}) {
  if (l._isPivot && n.length && l.pivotKeys)
    return Re(l, n, e);
  if (t && Array.isArray(t) && t.length && !l._isGroupCol && !l._isCheckbox && !l._isRowNumber) {
    for (const s of t)
      if (s?.children && s.children.includes(l.field))
        return [
          { kind: "group", id: `g:${s.headerName}`, label: s.headerName },
          { kind: "leaf", col: l }
        ];
  }
  return [{ kind: "leaf", col: l }];
}
function Re(l, n, e) {
  const t = (e?.length || 0) > 1, s = [];
  for (let i = 0; i < n.length; i++) {
    const o = n[i].field, r = l.pivotKeys[o];
    if (i === n.length - 1 && !t)
      return s.push({ kind: "leaf", col: l, label: r == null ? "(Blank)" : String(r) }), s;
    s.push({
      kind: "group",
      id: `p:${i}:${r == null ? "" : String(r)}`,
      label: r == null ? "(Blank)" : String(r)
    });
  }
  return s.push({ kind: "leaf", col: l, label: `${l.aggFunc}(${l.valueField})` }), s;
}
function xe(l, n = {}) {
  if (!l.length) return { rows: [[]], depth: 1 };
  const e = l.map((i) => Se(i, n).slice()), t = Math.max(1, ...e.map((i) => i.length)), s = [];
  for (let i = 0; i < t; i++) {
    const o = [];
    let r = 0;
    for (; r < e.length; ) {
      const a = e[r];
      if (i >= a.length || a[i] === null) {
        r += 1;
        continue;
      }
      const u = a[i];
      if (u.kind === "leaf") {
        o.push({ kind: "leaf", col: u.col, label: u.label, rowspan: t - i, colspan: 1 });
        for (let h = i + 1; h < t; h++) a[h] = null;
        r += 1;
        continue;
      }
      let d = r + 1;
      for (; d < e.length; ) {
        const h = e[d];
        if (i >= h.length || !h[i] || h[i].kind !== "group" || h[i].id !== u.id) break;
        let c = !0;
        for (let g = 0; g < i; g++) {
          const f = a[g]?.id ?? null, v = h[g]?.id ?? null;
          if (f !== v) {
            c = !1;
            break;
          }
        }
        if (!c) break;
        d += 1;
      }
      o.push({ kind: "group", label: u.label, colspan: d - r, rowspan: 1 }), r = d;
    }
    s.push(o);
  }
  return { rows: s, depth: t };
}
function De({
  rows: l,
  parentField: n = "parent_id",
  getRowId: e = (o) => o?.id,
  passesFilter: t = null,
  siblingComparator: s = null,
  isExpanded: i = () => !0
} = {}) {
  if (!Array.isArray(l) || l.length === 0)
    return { displayList: [], treeMeta: /* @__PURE__ */ new Map() };
  const o = (m) => {
    const w = e(m);
    return w == null ? null : String(w);
  }, r = /* @__PURE__ */ new Map();
  for (const m of l) {
    const w = o(m);
    w != null && r.set(w, m);
  }
  const a = /* @__PURE__ */ new Map(), u = [];
  for (const m of l) {
    const w = o(m), C = m?.[n], R = C == null ? null : String(C);
    R == null || R === w || !r.has(R) ? u.push(m) : (a.has(R) || a.set(R, []), a.get(R).push(m));
  }
  const d = t ? new Map(l.map((m) => [o(m), !!t(m)])) : null, h = /* @__PURE__ */ new Map(), c = (m, w) => {
    const C = o(m);
    if (C == null) return !1;
    if (h.has(C)) return h.get(C);
    if (w.has(C)) return !1;
    w.add(C);
    let R = !!d.get(C);
    const D = a.get(C) || [];
    for (const y of D) R = c(y, w) || R;
    return w.delete(C), h.set(C, R), R;
  };
  if (d)
    for (const m of u) c(m, /* @__PURE__ */ new Set());
  const g = [], f = /* @__PURE__ */ new Map(), v = (m, w, C, R) => {
    const D = d ? m.filter((y) => R || h.get(o(y))) : m.slice();
    s && D.sort(s);
    for (const y of D) {
      const b = o(y);
      if (b == null || C.has(b)) continue;
      const M = a.get(b) || [], A = R || (d ? !!d.get(b) : !1), L = d ? M.filter((F) => A || h.get(o(F))) : M, k = L.length > 0, T = k && (d ? !0 : !!i(b, w));
      f.set(b, { level: w, hasChildren: k, expanded: T }), g.push(y), T && (C.add(b), v(L, w + 1, C, A), C.delete(b));
    }
  };
  return v(u, 0, /* @__PURE__ */ new Set(), !1), { displayList: g, treeMeta: f };
}
function Ee(l) {
  if (l.serverSide) {
    const d = l.rowData, h = l.pagination?.pageSize || d.length || 1, c = l.serverRowCount ?? d.length, g = Math.max(1, Math.ceil(c / h)), f = Math.min(l.pagination?.page || 0, g - 1);
    return { filteredSorted: d, rows: d, total: c, totalPages: g, page: f, pageRows: d };
  }
  const n = Object.fromEntries(l.columnDefs.map((d) => [d.field, d])), e = l.columnDefs.filter((d) => !d.hidden && !d._isCheckbox), t = (l.rowGroupCols || []).filter((d) => n[d]);
  if (l.treeData && !l.pivotMode && t.length === 0) {
    const d = l.treeParentField || "parent_id", h = Object.entries(l.filterModel || {}).filter(([, y]) => y != null), c = l.quickFilter ? String(l.quickFilter).toLowerCase() : "", f = h.length > 0 || c !== "" ? (y) => {
      for (const [b, M] of h) {
        const A = n[b];
        if (A && !Q(y, A, M)) return !1;
      }
      if (c) {
        let b = !1;
        for (const M of e) {
          const A = I(y, M);
          if (A && String(A).toLowerCase().includes(c)) {
            b = !0;
            break;
          }
        }
        if (!b) return !1;
      }
      return !0;
    } : null, v = Array.isArray(l.sortModel) ? l.sortModel : [], m = v.length ? (y, b) => {
      for (const { colId: M, sort: A } of v) {
        const L = n[M];
        if (!L) continue;
        const k = x(y, L), T = x(b, L), F = typeof L.comparator == "function" ? L.comparator(k, T, y, b) : V(k, T, L.type);
        if (F !== 0) return A === "desc" ? -F : F;
      }
      return 0;
    } : null, w = l.getRowId || ((y) => y?.id), { displayList: C, treeMeta: R } = De({
      rows: l.rowData,
      parentField: d,
      getRowId: w,
      passesFilter: f,
      siblingComparator: m,
      isExpanded: l.isTreeRowExpanded || (() => !0)
    }), D = B(C, l.pagination);
    return {
      tree: !0,
      treeData: !0,
      treeMeta: R,
      treeParentField: d,
      filteredSorted: C,
      ...D
    };
  }
  let s = l.rowData;
  s = Z(s, l.filterModel, n), s = J(s, l.quickFilter, e), s = ge(s, l.sortModel, n);
  const i = t, o = l.pivotMode ? (l.pivotCols || []).filter((d) => n[d]) : [], r = l.pivotMode ? Object.entries(l.aggModel || {}).filter(([d]) => n[d]).map(([d, h]) => ({ col: n[d], aggFunc: h })) : [];
  if (l.pivotMode && o.length && r.length) {
    const d = i.map((w) => n[w]), h = o.map((w) => n[w]), { columns: c, displayList: g, tree: f, combos: v } = be({
      rows: s,
      rowGroupCols: d,
      pivotCols: h,
      valueConfigs: r,
      isExpanded: l.isGroupExpanded,
      sortModel: l.sortModel
    }), m = B(g, l.pagination);
    return {
      pivot: !0,
      pivotResultColumns: c,
      combos: v,
      grouped: !0,
      tree: f,
      leafCount: s.length,
      grandTotals: z(s, l.aggModel, n),
      filteredSorted: g,
      ...m
    };
  }
  if (i.length) {
    const d = i.map((f) => n[f]), { displayList: h, tree: c } = _e(
      s,
      d,
      n,
      l.aggModel,
      l.isGroupExpanded
    ), g = B(h, l.pagination);
    return {
      grouped: !0,
      tree: c,
      leafCount: s.length,
      grandTotals: z(s, l.aggModel, n),
      filteredSorted: h,
      ...g
    };
  }
  const a = B(s, l.pagination), u = l.aggModel && Object.keys(l.aggModel).length ? z(s, l.aggModel, n) : null;
  return { filteredSorted: s, grandTotals: u, ...a };
}
function Me(l, n, e, t, s = 6) {
  const i = Math.ceil(n / e), o = Math.max(0, Math.floor(l / e) - s), r = Math.min(t, o + i + s * 2);
  return { first: o, last: r };
}
function Ae(l) {
  return {
    // ---- Data ----
    setRowData(n) {
      l.setRowData(n);
    },
    getRowData() {
      return l.state.rowData.slice();
    },
    applyTransaction(n) {
      return l.applyTransaction(n);
    },
    // Server-side row model
    setRowCount(n) {
      l.setRowCount(n);
    },
    getRowCount() {
      return l.state.serverSide ? l.state.serverRowCount : l.state.rowData.length;
    },
    isServerSide() {
      return !!l.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(n) {
      l.setColumnDefs(n);
    },
    getColumnDefs() {
      return l.state.columnDefs.slice();
    },
    setColumnVisible(n, e) {
      l.setColumnVisible(n, e);
    },
    setColumnPinned(n, e) {
      l.setColumnPinned(n, e);
    },
    setColumnWidth(n, e) {
      l.setColumnWidth(n, e);
    },
    moveColumn(n, e) {
      l.moveColumn(n, e);
    },
    autoSizeColumn(n) {
      l.autoSizeColumn(n);
    },
    autoSizeAllColumns() {
      l.state.columnDefs.forEach((n) => l.autoSizeColumn(n.field));
    },
    sizeColumnsToFit() {
      l.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(n) {
      l.setSortModel(n);
    },
    getSortModel() {
      return l.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(n) {
      l.setFilterModel(n);
    },
    getFilterModel() {
      return { ...l.state.filterModel };
    },
    setColumnFilter(n, e) {
      l.setColumnFilter(n, e);
    },
    destroyFilter(n) {
      l.setColumnFilter(n, null);
    },
    setQuickFilter(n) {
      l.setQuickFilter(n);
    },
    getQuickFilter() {
      return l.getQuickFilter();
    },
    // ---- Selection ----
    selectAll() {
      l.selectAll();
    },
    deselectAll() {
      l.deselectAll();
    },
    selectRow(n) {
      l.setSelected(n, !0);
    },
    deselectRow(n) {
      l.setSelected(n, !1);
    },
    getSelectedRows() {
      return l.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(l.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(n) {
      l.goToPage(n);
    },
    paginationGoToFirstPage() {
      l.goToPage(0);
    },
    paginationGoToNextPage() {
      l.goToPage(l.state.pagination.page + 1);
    },
    paginationGoToPreviousPage() {
      l.goToPage(l.state.pagination.page - 1);
    },
    paginationGoToLastPage() {
      l.goToPage(l.lastPageIndex());
    },
    paginationSetPageSize(n) {
      l.setPageSize(n);
    },
    paginationGetCurrentPage() {
      return l.state.pagination.page;
    },
    paginationGetTotalPages() {
      return l.totalPages();
    },
    paginationGetRowCount() {
      return l.filteredCount();
    },
    paginationGetPageSize() {
      return l.state.pagination.pageSize;
    },
    paginationIsEnabled() {
      return l.state.pagination.enabled;
    },
    // ---- Cell selection ----
    getCellSelection() {
      return l.getCellSelectionDetail();
    },
    getCellRangeValues() {
      return l._cellRangeRows();
    },
    getCellSelectionRowIds() {
      return l.getCellSelectionRowIds();
    },
    getRangeAggregates() {
      return l.getRangeAggregates();
    },
    // ---- Editing ----
    startEditingCell({ rowId: n, colId: e }) {
      l.startEditingCell(n, e);
    },
    stopEditing(n = !1) {
      l.stopEditing(n);
    },
    // ---- Row grouping + aggregation ----
    setRowGroupColumns(n) {
      l.setRowGroupColumns(n);
    },
    addRowGroupColumn(n) {
      l.addRowGroupColumn(n);
    },
    removeRowGroupColumn(n) {
      l.removeRowGroupColumn(n);
    },
    getRowGroupColumns() {
      return l.getRowGroupColumns();
    },
    setColumnAggFunc(n, e) {
      l.setColumnAggFunc(n, e);
    },
    expandAll() {
      l.expandAll();
    },
    collapseAll() {
      l.collapseAll();
    },
    toggleGroup(n, e) {
      l.toggleGroup(n, e);
    },
    // ---- Pivot ----
    setPivotMode(n) {
      l.setPivotMode(n);
    },
    isPivotMode() {
      return l.isPivotMode();
    },
    setPivotColumns(n) {
      l.setPivotColumns(n);
    },
    addPivotColumn(n) {
      l.addPivotColumn(n);
    },
    removePivotColumn(n) {
      l.removePivotColumn(n);
    },
    getPivotColumns() {
      return l.getPivotColumns();
    },
    // Synthetic pivot result columns from the most recent render. Each entry
    // is { field, headerName, pivotKeys, valueField, aggFunc } — useful for
    // discovering the field id of a pivot col to feed to setSortModel / for
    // building a custom column visibility UI.
    getPivotResultColumns() {
      return (l._displayList?.pivotResultColumns || []).map((e) => ({
        field: e.field,
        headerName: e.headerName,
        pivotKeys: { ...e.pivotKeys || {} },
        valueField: e.valueField,
        aggFunc: e.aggFunc
      }));
    },
    // ---- Value columns (aggregations; shared with grouping) ----
    setValueColumns(n) {
      l.setValueColumns(n);
    },
    addValueColumn(n, e = "sum") {
      l.addValueColumn(n, e);
    },
    removeValueColumn(n) {
      l.removeValueColumn(n);
    },
    getValueColumns() {
      return l.getValueColumns();
    },
    // ---- Column header groups (multi-row headers) ----
    setColumnGroups(n) {
      l.setColumnGroups(n);
    },
    getColumnGroups() {
      return l.getColumnGroups();
    },
    // ---- Pinned bottom row (sticky grand totals) ----
    setPinnedBottomRow(n) {
      l.setPinnedBottomRow(n);
    },
    isPinnedBottomRow() {
      return l.isPinnedBottomRow();
    },
    // ---- Tree data (self-referential parent_id) ----
    setTreeData(n) {
      l.setTreeData(n);
    },
    isTreeData() {
      return l.isTreeData();
    },
    setTreeParentField(n) {
      l.setTreeParentField(n);
    },
    expandTreeRow(n) {
      l.expandTreeRow(n);
    },
    collapseTreeRow(n) {
      l.collapseTreeRow(n);
    },
    toggleTreeRow(n) {
      l.toggleTreeRow(n);
    },
    expandAllTreeRows() {
      l.expandAllTreeRows();
    },
    collapseAllTreeRows() {
      l.collapseAllTreeRows();
    },
    getTreeExpandedRowIds() {
      return l.getTreeExpandedRowIds();
    },
    // ---- Master/detail ----
    setMasterDetail(n) {
      l.setMasterDetail(n);
    },
    isMasterDetail() {
      return l.isMasterDetail();
    },
    expandDetailRow(n) {
      l.expandDetailRow(n);
    },
    collapseDetailRow(n) {
      l.collapseDetailRow(n);
    },
    toggleDetailRow(n) {
      l.toggleDetailRow(n);
    },
    expandAllDetails() {
      l.expandAllDetails();
    },
    collapseAllDetails() {
      l.collapseAllDetails();
    },
    getDetailExpandedRowIds() {
      return l.getDetailExpandedRowIds();
    },
    // ---- Column state + persistence ----
    getColumnState() {
      return l.getColumnState();
    },
    applyColumnState(n) {
      l.applyColumnState(n);
    },
    clearPersistedState() {
      l.clearPersistedState();
    },
    getPersistKey() {
      return l.persistKeyValue || "";
    },
    // ---- Export ----
    getDataAsCsv(n = {}) {
      return l.getDataAsCsv(n);
    },
    exportDataAsCsv(n = {}) {
      return l.exportDataAsCsv(n);
    },
    // ---- Display ----
    refreshCells(n = {}) {
      l.refresh(n);
    },
    redrawRows(n = {}) {
      l.refresh(n);
    },
    // ---- Events ----
    addEventListener(n, e) {
      l.element.addEventListener(n, e);
    },
    removeEventListener(n, e) {
      l.element.removeEventListener(n, e);
    }
  };
}
function p(l, n = {}, e = []) {
  const t = document.createElement(l);
  for (const [s, i] of Object.entries(n))
    i === !1 || i == null || (s === "class" ? t.className = i : s === "style" && typeof i == "object" ? Object.assign(t.style, i) : s.startsWith("on") && typeof i == "function" ? t.addEventListener(s.slice(2).toLowerCase(), i) : i === !0 ? t.setAttribute(s, "") : t.setAttribute(s, String(i)));
  for (const s of [].concat(e))
    s == null || s === !1 || t.appendChild(typeof s == "string" ? document.createTextNode(s) : s);
  return t;
}
function W(l, n) {
  for (const [e, t] of Object.entries(n))
    t == null || t === !1 ? l.removeAttribute(e) : t === !0 ? l.setAttribute(e, "") : l.setAttribute(e, String(t));
}
function j(l) {
  const n = document.getElementById(l);
  return !n || n.tagName !== "TEMPLATE" ? null : n.content.firstElementChild.cloneNode(!0);
}
function _(l, n, e) {
  l.dispatchEvent(new CustomEvent(n, { detail: e, bubbles: !0 }));
}
function Le(l, n, e) {
  let t = l.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(n)) {
      const i = e.getControllerForElementAndIdentifier(t, n);
      if (i) return i;
    }
    t = t.parentElement;
  }
  return null;
}
const Ie = 32, U = 100, N = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', Ve = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>', X = [
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
class $ extends P {
  constructor() {
    super(...arguments);
    S(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    // ----- Row grouping + aggregation -----
    // A group is expanded if it has an explicit override; otherwise the
    // default-by-level applies (-1 = all, 0 = none, N = first N levels).
    S(this, "_isGroupExpanded", (e, t) => {
      if (this._groupExpanded.has(e)) return this._groupExpanded.get(e);
      const s = this.state.group.defaultExpanded;
      return s < 0 ? !0 : t < s;
    });
    // Delegated click handler for synthetic <th>s that don't have a
    // HeaderCellController of their own (pivot result cols today). Mirrors the
    // user-defined header path: bare click toggles sort, shift-click appends to
    // a multi-sort. Resize handles / filter icons short-circuit.
    S(this, "_onSynthHeaderClick", (e) => {
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
    S(this, "_onHeaderContextMenu", (e) => {
      const t = e.target.closest("th[data-field], th[data-header-cell-field-value]");
      if (!t) return;
      const s = t.getAttribute("data-field") || t.getAttribute("data-header-cell-field-value"), i = this._colByField(s);
      !i || i._isCheckbox || i._isRowNumber || i._isGroupCol || i._isPivot || (e.preventDefault(), this._showColumnMenu(i, e.clientX, e.clientY));
    });
    S(this, "_onDocMouseDownColumnMenu", (e) => {
      this._columnMenu && !this._columnMenu.contains(e.target) && this._closeColumnMenu();
    });
    S(this, "_onColumnMenuKey", (e) => {
      e.key === "Escape" && (e.stopPropagation(), this._closeColumnMenu());
    });
    S(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
    });
    S(this, "_onCellMouseDown", (e) => {
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
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : s ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), _(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    S(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      s && s.focus.rowId === t.rowId && s.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), _(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
    });
    S(this, "_onCellMouseUp", () => {
      this._cellDragging = !1, this._rowDragPending && (document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag && this._finishRowDrag(), this._rowDragPending = null);
    });
    // ----- Row drag-and-drop (reorder) with a ghost preview -----
    S(this, "_onRowDragMove", (e) => {
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
    S(this, "_onCopy", (e) => {
      if (this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && !this.element.contains(t)) return;
      const s = this._activeRect();
      if (!s) return;
      const i = this._cellRangeRows(s).map((o) => o.map((r) => String(r ?? "")).join("	")).join(`
`);
      i && (e.clipboardData?.setData("text/plain", i), e.preventDefault());
    });
    S(this, "_onGridKeydown", (e) => {
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
        const [r, a] = o[s];
        this._moveActiveCell(r, a, e.shiftKey);
        return;
      }
      if (s === "Tab") {
        e.preventDefault(), this._moveActiveCell(0, e.shiftKey ? -1 : 1, !1);
        return;
      }
      if (s === "Enter") {
        const r = this._activeCell();
        r && (e.preventDefault(), this.startEditingCell(r.rowId, r.colId));
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
        const r = this._activeCell();
        if (!r) return;
        const a = this._colByField(r.colId);
        if (!a || !a.editable) return;
        e.preventDefault(), this.startEditingCell(r.rowId, r.colId, s);
      }
    });
    S(this, "_onEditorKey", (e) => {
      this.state.editing && (e.key === "Enter" ? (e.preventDefault(), this.stopEditing(!1)) : e.key === "Escape" ? (e.preventDefault(), this.stopEditing(!0)) : e.key === "Tab" && (e.preventDefault(), this._tabToEditableCell(e.shiftKey ? -1 : 1)));
    });
    S(this, "_onEditorBlur", () => {
      this._navigatingEditor || this.state.editing && this.stopEditing(!1);
    });
    // ----- Tree data (self-referential parent_id) -----
    //
    // The model layer flattens the tree and hands us back a Map of per-row
    // metadata (level, hasChildren, expanded). The controller owns the
    // expanded/collapsed override Map; the model just calls back through
    // `isTreeRowExpanded` to ask which state a given row is in. Everything
    // else (filter, sort, paginate) flows through the normal pipeline.
    S(this, "_isTreeRowExpanded", (e, t) => {
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
      pagination: { enabled: !1, page: 0, pageSize: U },
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = Ae(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("mousemove", this._onRowDragMove), this._thead?.removeEventListener("contextmenu", this._onHeaderContextMenu), this._thead?.removeEventListener("click", this._onSynthHeaderClick), this._closeColumnMenu(), this._teardownPersistence(), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove();
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, s) => {
      const i = {}, o = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      i[this.getRowIdValue] = o != null ? this._coerceRowId(o) : s + 1, t.querySelectorAll("td").forEach((a) => {
        const u = a.getAttribute("data-cell-col-id-value") || a.getAttribute("data-col-id");
        u && (i[u] = a.textContent.trim());
      });
      const r = t.getAttribute("data-row-detail-rows-value");
      if (r && this.detailRowsKeyValue)
        try {
          i[this.detailRowsKeyValue] = JSON.parse(r);
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
    const s = this.state.filterModel[e.field] || {}, i = ke(e.filter), o = p("div", { class: "sg-filter-popover" }), r = p("select");
    i.forEach((m) => r.append(new Option(m.label, m.value, !1, m.value === s.type)));
    const a = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", u = p("input", { type: a, value: s.value ?? "" }), d = p("input", { type: a, value: s.value2 ?? "", style: { display: "none" } }), h = () => {
      const m = r.value, w = m === "inRange", C = !(m === "blank" || m === "notBlank");
      u.style.display = C ? "" : "none", d.style.display = w ? "" : "none";
    };
    r.addEventListener("change", h), h();
    const c = p("div", { class: "sg-filter-actions" }), g = p("button", { type: "button" }, "Clear"), f = p("button", { type: "button", class: "primary" }, "Apply");
    c.append(g, f), g.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), f.addEventListener("click", () => {
      const m = r.value, w = m === "blank" || m === "notBlank" ? { filterType: e.filter, type: m } : { filterType: e.filter, type: m, value: u.value, value2: d.value || void 0 };
      this.setColumnFilter(e.field, w), this._closeFilterPopover();
    }), o.append(
      p("label", {}, "Condition"),
      r,
      u,
      d,
      c
    ), document.body.appendChild(o);
    const v = t.getBoundingClientRect();
    o.style.left = `${v.left + window.scrollX}px`, o.style.top = `${v.bottom + window.scrollY + 2}px`, this._filterPopover = o, document.addEventListener("mousedown", this._onDocMouseDown), u.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const s = this.state.columnDefs.findIndex((u) => u.field === e.field), i = this._runtimeOverrides[e.field] || {}, o = s >= 0 ? this.state.columnDefs[s] : null, r = o ? {
      ...o.hidden != null ? { hidden: o.hidden } : {},
      ...o.pinned ? { pinned: o.pinned } : {},
      ...o.width != null ? { width: o.width } : {}
    } : {}, a = { ...e, ...i, ...r, _headerEl: t };
    if (s >= 0) {
      const u = this.state.columnDefs[s];
      if (u._headerEl === t && Pe(u, a)) return;
      this.state.columnDefs[s] = a;
    } else
      this.state.columnDefs.push(a);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${G(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const s = this.state.sortModel.findIndex((o) => o.colId === e);
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
    const s = this._displayList.filteredSorted, i = s.findIndex((u) => this._rowId(u) === e), o = s.findIndex((u) => this._rowId(u) === t);
    if (i < 0 || o < 0) return;
    const [r, a] = i <= o ? [i, o] : [o, i];
    for (let u = r; u <= a; u++)
      s[u].__sgGroup || this.state.selection.add(this._rowId(s[u]));
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
    let s = Z(this.state.rowData, this.state.filterModel, e);
    return s = J(s, this.state.quickFilter, t), s.length;
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
    const i = this.state.columnDefs.find((r) => r.field === t);
    if (!i || !i.editable) return;
    const o = this.state.rowData.find((r) => this._rowId(r) === e);
    o && (this.state.editing = { rowId: e, colId: t, originalValue: x(o, i), initialValue: s }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: s, originalValue: i, draftValue: o } = this.state.editing, r = this._tbody.querySelector(`tr[data-row-id="${G(t)}"] td[data-col-id="${G(s)}"]`);
    let a = i;
    if (!e && r) {
      const u = r.querySelector("[data-editor-input]") || r.querySelector("input,select,textarea");
      u ? a = Te(u.value, this._colByField(s)?.type) : o !== void 0 && (a = o);
    }
    if (this.state.editing = null, !e && a !== i) {
      const u = this.state.rowData.find((h) => this._rowId(h) === t), d = u[s];
      u[s] = a, _(this.element, "grid:cellValueChanged", { rowId: t, colId: s, oldValue: d, newValue: a });
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
    const s = this.state.columnDefs.findIndex((o) => o.field === e);
    if (s < 0 || s === t) return;
    const [i] = this.state.columnDefs.splice(s, 1);
    this.state.columnDefs.splice(t, 0, i), this.scheduleRender("columns"), _(this.element, "grid:columnMoved", { colId: e, fromIndex: s, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const s = (t.headerName || t.field || "").length, i = this.state.rowData.slice(0, 200);
    let o = s;
    for (const r of i) {
      const a = String(I(r, t) ?? "").length;
      a > o && (o = a);
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, o * 8 + 24)));
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), s = t.reduce((o, r) => o + (r.width || 150), 0);
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
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), _(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], s = [], i = [], o = new Map(this.state.rowData.map((r) => [this._rowId(r), r]));
    return (e.remove || []).forEach((r) => {
      const a = this._rowId(r);
      o.delete(a) && i.push(r);
    }), (e.update || []).forEach((r) => {
      const a = this._rowId(r);
      o.has(a) && (o.set(a, { ...o.get(a), ...r }), s.push(r));
    }), (e.add || []).forEach((r) => {
      const a = this._rowId(r);
      o.has(a) || (o.set(a, r), t.push(r));
    }), this.state.rowData = Array.from(o.values()), this.scheduleRender("data"), _(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: s, removed: i };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const s = this.state.columnDefs.filter((a) => !a.hidden && !a._isCheckbox), i = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((a) => !a.__sgGroup && !a.__sgDetail), o = (a) => /[",\n\r]/.test(a) ? `"${String(a).replace(/"/g, '""')}"` : String(a), r = [s.map((a) => o(a.headerName || a.field)).join(e)];
    for (const a of i)
      r.push(s.map((u) => o(I(a, u))).join(e));
    return r.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const s = this.getDataAsCsv(t), i = new Blob([s], { type: "text/csv;charset=utf-8" }), o = URL.createObjectURL(i), r = p("a", { href: o, download: e });
    return document.body.appendChild(r), r.click(), r.remove(), URL.revokeObjectURL(o), s;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.has("tree") || e.size === 0) && (this._displayList = Ee({
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
    const e = this._visibleCols(), t = xe(e, this._headerLayoutOpts());
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
    for (e.forEach((i, o) => {
      let r = s[o];
      r || (r = p("col"), t.appendChild(r)), r.style.width = i.width ? i.width + "px" : "";
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
    const i = new Set(e.map((c) => c.field)), o = this.state.columnDefs.filter((c) => !i.has(c.field)), r = [...e, ...o], a = Array.from(t.children).map((c) => c.getAttribute("data-header-cell-field-value") || c.getAttribute("data-field")).filter(Boolean), u = r.map((c) => c.field);
    if (a.length === u.length && a.every((c, g) => c === u[g]))
      Array.from(t.children).forEach((c) => {
        c.removeAttribute("rowspan"), c.removeAttribute("colspan");
      });
    else {
      const c = [];
      for (const g of r) {
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
      const g = t.querySelector(`th[data-header-cell-field-value="${G(c.field)}"]`) || t.querySelector(`th[data-field="${G(c.field)}"]`);
      g && this._applyLeafThState(g, c, h);
    }
  }
  // Multi-row header: <thead> gets `layout.depth` rows of group headers
  // followed by the leaf headers, then one hidden row holding any registered
  // <th>s that aren't currently visible (so their controllers stay mounted).
  _renderHeaderMultiRow(e, t) {
    const s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((d) => {
      const h = d.getAttribute("data-header-cell-field-value") || d.getAttribute("data-field");
      h && s.set(h, d);
    });
    const i = [], o = new Set(e.map((d) => d.field)), r = this._pinOffsets();
    for (const d of t.rows) {
      const h = p("tr");
      for (const c of d) {
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
        f.setAttribute("rowspan", String(c.rowspan)), f.removeAttribute("colspan"), f.style.display = "", h.appendChild(f), this._applyLeafThState(f, g, r);
      }
      i.push(h);
    }
    const a = /* @__PURE__ */ new Set();
    t.rows.forEach((d) => d.forEach((h) => {
      h.kind === "leaf" && a.add(h.col.field);
    }));
    const u = this.state.columnDefs.filter(
      (d) => !o.has(d.field) && !a.has(d.field)
    );
    if (u.length) {
      const d = p("tr", { class: "sg-hidden-header-row" });
      for (const h of u) {
        let c = s.get(h.field);
        c || (c = p("th", { "data-field": h.field, "data-synth": "true" })), c.removeAttribute("rowspan"), c.removeAttribute("colspan"), d.appendChild(c);
      }
      i.push(d);
    }
    this._thead.replaceChildren(...i);
  }
  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(e, t, s) {
    const i = this.state.sortModel.find((o) => o.colId === t.field);
    W(e, {
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
      const u = this._displayList.filteredSorted.length, d = this.state.selection.size;
      a.checked = d > 0 && d >= u, a.indeterminate = d > 0 && d < u;
      return;
    }
    let i = e.querySelector(".sg-header-content");
    if (!i) {
      const a = e.textContent.trim();
      e.textContent = "", i = p("div", { class: "sg-header-content" }, [
        p("span", { class: "sg-header-label" }, a || t.headerName || t.field || "")
      ]), e.appendChild(i);
    }
    let o = i.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (o || (o = p("span", { class: "sg-sort-icon", "aria-hidden": "true" }), o.innerHTML = N, i.appendChild(o)), s && this.state.sortModel.length > 1) {
        let a = i.querySelector(".sg-sort-index");
        a || (a = p("span", { class: "sg-sort-index" }), i.appendChild(a)), a.textContent = String(this.state.sortModel.indexOf(s) + 1);
      } else
        i.querySelector(".sg-sort-index")?.remove();
    else o && o.remove();
    let r = i.querySelector(".sg-filter-icon");
    t.filter ? r || (r = p("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), r.innerHTML = Ve, i.appendChild(r)) : r && r.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(p("span", {
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
      const h = this._viewport?.clientHeight || 400, c = this.state.rowHeight, g = Me(this.state.scrollTop, h, c, t.length, 8);
      o = g.first, i = t.slice(g.first, g.last);
    }
    const r = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((h) => {
      const c = h.dataset.rowId;
      c != null && r.set(c, h);
    });
    const a = document.createDocumentFragment(), u = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0, d = (h) => u + o + h + 1;
    if (s) {
      const h = this.state.rowHeight, c = o * h, g = (t.length - o - i.length) * h;
      a.appendChild(this._spacerRow(c, e.length)), i.forEach((f, v) => a.appendChild(this._buildRow(f, e, r, d(v)))), a.appendChild(this._spacerRow(g, e.length));
    } else
      i.forEach((h, c) => a.appendChild(this._buildRow(h, e, r, d(c))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && a.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(a);
  }
  _buildPinnedBottomRow(e) {
    const t = p("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), s = this._pinOffsets(), i = this._displayList.grandTotals || {};
    let o = !1;
    for (const r of e) {
      const a = p("td", { "data-col-id": r.field, "data-pinned": r.pinned || null });
      r.pinned === "left" ? a.style.left = s.left[r.field] + "px" : r.pinned === "right" && (a.style.right = s.right[r.field] + "px");
      const u = i[r.field];
      u != null ? (a.classList.add("sg-agg-cell"), a.textContent = this._formatAggregate(u)) : !o && !r._isCheckbox && !r._isRowNumber && (a.classList.add("sg-pinned-bottom-label"), a.textContent = "Total", o = !0), t.appendChild(a);
    }
    return t;
  }
  _buildRow(e, t, s, i) {
    if (e.__sgGroup) return this._buildGroupRow(e, t, s);
    if (e.__sgDetail) return this._buildDetailRow(e, t, s);
    const o = String(this._rowId(e));
    let r = s.get(o);
    r || (r = p("tr")), r.dataset.rowId = o, r.classList.remove("sg-spacer");
    const a = this.state.selection.has(this._rowId(e)), u = this.masterDetailValue && this._isDetailExpanded(o);
    return W(r, {
      "data-selected": a ? "true" : null,
      "data-detail-expanded": u ? "true" : null
    }), this.masterDetailValue && r.classList.add("sg-master-row"), this._renderRow(r, e, t, i), r;
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
    const o = this._pinOffsets(), r = this._selKeys || { active: null, range: null }, a = String(this._rowId(t)), u = this._displayList?.treeMeta, d = u ? u.get(a) : null, h = d ? this._treeDisplayColField() : null;
    for (const c of s) {
      const g = `${a}:${c.field}`, f = p("td", {
        "data-col-id": c.field,
        "data-pinned": c.pinned || null,
        "data-cell-active": r.active === g ? "true" : null,
        "data-cell-range": r.range && r.range.has(g) ? "true" : null
      });
      if (c.pinned === "left" ? f.style.left = o.left[c.field] + "px" : c.pinned === "right" && (f.style.right = o.right[c.field] + "px"), c._isRowNumber) {
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
        w.innerHTML = N, f.appendChild(w), e.appendChild(f);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === c.field) {
        f.setAttribute("data-editing", "true");
        const m = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : x(t, c), { node: w, control: C } = this._buildEditor(c, m);
        f.appendChild(w);
        const R = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          C?.focus(), R || C?.select?.();
        });
      } else
        this._renderCellContent(f, t, c);
      d && c.field === h && this._decorateTreeCell(f, d), e.appendChild(f);
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
      s.innerHTML = N, e.insertBefore(s, e.firstChild);
    } else {
      const s = p("span", { class: "sg-tree-chevron sg-tree-chevron-leaf", "aria-hidden": "true" });
      e.insertBefore(s, e.firstChild);
    }
  }
  _renderCellContent(e, t, s) {
    if (s.cellRenderer) {
      const i = j(s.cellRenderer);
      if (i) {
        const o = x(t, s), r = I(t, s);
        (i.dataset.bind || i.dataset.bindText !== void 0) && (i.textContent = i.dataset.bind ? String(t[i.dataset.bind] ?? "") : r), i.dataset.bindAttr && i.setAttribute(i.dataset.bindAttr, o), i.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((a) => {
          a.dataset.bindText !== void 0 ? a.textContent = r : a.dataset.bind && (a.textContent = String(t[a.dataset.bind] ?? "")), a.dataset.bindAttr && a.setAttribute(a.dataset.bindAttr, o);
        }), e.appendChild(i);
        return;
      }
    }
    e.textContent = I(t, s);
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
    for (const t of X) this.element.addEventListener(t, e);
    this._persistBeforeUnload = () => {
      this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
    }, window.addEventListener("beforeunload", this._persistBeforeUnload);
  }
  _teardownPersistence() {
    if (this._persistListener) {
      for (const e of X) this.element.removeEventListener(e, this._persistListener);
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
    return o || (o = p("tr")), o.dataset.rowId = i, o.dataset.group = "true", o.dataset.groupLevel = String(e.level), o.className = "sg-group-row", this._renderGroupRow(o, e, t), o;
  }
  _renderGroupRow(e, t, s) {
    e.innerHTML = "";
    const i = this._pinOffsets(), o = this._isGroupExpanded(t.groupId, t.level), r = (this.state.group.displayType || "singleColumn") === "singleColumn", a = !!(this.state.pivot?.mode && this._displayList?.pivot), u = t.__pivotAll === !0, d = s.filter((g) => !g._isRowNumber && !g._isCheckbox && !g._isGroupCol), h = d.some((g) => g.field === t.field) ? t.field : d[0]?.field, c = Math.max(0, t.level);
    u && e.classList.add("sg-pivot-all-row");
    for (const g of s) {
      const f = p("td", { "data-col-id": g.field, "data-pinned": g.pinned || null });
      if (g.pinned === "left" ? f.style.left = i.left[g.field] + "px" : g.pinned === "right" && (f.style.right = i.right[g.field] + "px"), g._isRowNumber || g._isCheckbox) {
        f.classList.add(g._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(f);
        continue;
      }
      if (a || r ? g._isGroupCol : g.field === h) {
        if (f.classList.add("sg-group-cell"), f.style.paddingLeft = `${8 + c * 18}px`, !u) {
          const m = p("span", {
            class: "sg-group-caret",
            "data-expanded": o ? "true" : "false",
            "aria-hidden": "true"
          });
          m.innerHTML = N, f.appendChild(m);
        }
        f.append(
          p("span", { class: "sg-group-label" }, this._groupValueLabel(t)),
          p("span", { class: "sg-group-count" }, ` (${t.count})`)
        );
      } else if (a && g._isPivot) {
        const m = x(t, g);
        m != null && (f.classList.add("sg-agg-cell"), f.textContent = this._formatAggregate(m));
      } else !g._isGroupCol && t.aggregates && t.aggregates[g.field] != null && (f.classList.add("sg-agg-cell"), f.textContent = this._formatAggregate(t.aggregates[g.field]));
      e.appendChild(f);
    }
  }
  _groupValueLabel(e) {
    const t = e.value;
    if (t == null || t === "") return "(Blanks)";
    const s = this._colByField(e.field);
    return s ? I({ [e.field]: t }, s) : String(t);
  }
  _formatAggregate(e) {
    return e == null ? "" : typeof e == "number" ? Number.isInteger(e) ? String(e) : String(Math.round(e * 100) / 100) : String(e);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, t) {
    if (e.cellEditor) {
      const i = j(e.cellEditor);
      if (i) {
        const o = i.matches?.("input,select,textarea") ? i : i.querySelector?.("[data-editor-input]") || i.querySelector?.("input,select,textarea");
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
    } else t.type === "boolean" ? e.value = s === !0 ? "true" : s === !1 ? "false" : "" : e.value = s ?? "";
  }
  _buildEditorInput(e, t) {
    let s;
    if (e.type === "number") s = p("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const i = t instanceof Date ? t : t ? new Date(t) : null, o = i ? i.toISOString().slice(0, 10) : "";
      s = p("input", { type: "date", value: o });
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
    const o = this.state.selection.size;
    o > 0 && e.appendChild(this._statusPanel("Selected", this._fmtInt(o))), t.replaceChildren();
    const r = this.getRangeAggregates();
    if (r && r.count > 0) {
      const u = (this.statusBarAggsValue || []).filter((d) => d in r);
      for (const d of u) {
        const h = r[d];
        h == null && d !== "count" || t.appendChild(this._statusPanel(this._aggLabel(d), this._fmtAgg(d, h)));
      }
    }
    const a = r ? `${r.count}|${r.sum}|${r.avg}|${r.min}|${r.max}` : "";
    a !== this._lastRangeAggs && (this._lastRangeAggs = a, _(this.element, "grid:rangeAggsChanged", { aggs: r }));
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
          const o = s.rows[i];
          if (!(!o || o.__sgGroup || o.__sgDetail))
            for (let r = s.c0; r <= s.c1; r++) {
              const a = s.cols[r];
              !a || a._isCheckbox || a._isRowNumber || a._isGroupCol || a._isMasterExpand || e.push(x(o, a));
            }
        }
    }
    return e;
  }
  getRangeAggregates() {
    return this.state.cellSel.ranges.length ? me(this._cellRangeRawValues()) : null;
  }
  _showColumnMenu(e, t, s) {
    this._closeColumnMenu();
    const i = this._columnMenuItems(e), o = p("div", { class: "sg-column-menu", role: "menu" });
    for (const u of i) {
      if (u === "separator") {
        o.appendChild(p("div", { class: "sg-column-menu-separator", role: "separator" }));
        continue;
      }
      const d = p("button", {
        type: "button",
        class: "sg-column-menu-item" + (u.active ? " sg-column-menu-active" : ""),
        role: "menuitem"
      });
      d.append(
        p("span", { class: "sg-column-menu-label" }, u.label)
      ), u.active && d.append(p("span", { class: "sg-column-menu-check", "aria-hidden": "true" }, "✓")), d.addEventListener("click", () => {
        u.action(), this._closeColumnMenu();
      }), o.appendChild(d);
    }
    document.body.appendChild(o);
    const r = o.offsetWidth || 220, a = o.offsetHeight || 280;
    o.style.left = `${Math.min(t, window.innerWidth - r - 4)}px`, o.style.top = `${Math.min(s, window.innerHeight - a - 4)}px`, this._columnMenu = o, setTimeout(() => {
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
    const t = this.element.gridApi, s = e.headerName || e.field, i = this.state.group.cols.includes(e.field), o = this.state.pivot.cols.includes(e.field), r = this.state.group.aggs[e.field], a = e.type === "number", u = [];
    if (e.pinned !== "left" && u.push({ label: "Pin left", action: () => t.setColumnPinned(e.field, "left") }), e.pinned !== "right" && u.push({ label: "Pin right", action: () => t.setColumnPinned(e.field, "right") }), e.pinned && u.push({ label: "Unpin", action: () => t.setColumnPinned(e.field, null) }), u.push("separator"), u.push({ label: "Autosize this column", action: () => t.autoSizeColumn(e.field) }), u.push({ label: "Autosize all columns", action: () => t.autoSizeAllColumns() }), u.push("separator"), u.push(i ? { label: `Ungroup ${s}`, action: () => t.removeRowGroupColumn(e.field) } : { label: `Group by ${s}`, action: () => t.addRowGroupColumn(e.field) }), u.push(o ? { label: `Remove ${s} from pivot`, action: () => t.removePivotColumn(e.field) } : { label: `Pivot by ${s}`, action: () => {
      t.isPivotMode() || t.setPivotMode(!0), t.addPivotColumn(e.field);
    } }), a || r) {
      u.push("separator");
      for (const d of ["sum", "avg", "count", "min", "max"])
        u.push({
          label: `Aggregate: ${d}`,
          active: r === d,
          action: () => t.addValueColumn(e.field, d)
        });
      r && u.push({ label: "Remove aggregation", action: () => t.removeValueColumn(e.field) });
    }
    return u.push("separator"), u.push({ label: "Hide column", action: () => t.setColumnVisible(e.field, !1) }), u.push({
      label: "Show all columns",
      action: () => {
        this.state.columnDefs.forEach((d) => {
          d.hidden && !d._isGroupCol && !d._isPivot && !d._isCheckbox && !d._isRowNumber && t.setColumnVisible(d.field, !0);
        });
      }
    }), u;
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
      const u = this._coerceRowId(t.dataset.rowId);
      this.toggleDetailRow(u);
      return;
    }
    const i = e.target.closest?.('[data-tree-toggle="true"]');
    if (i && t.contains(i)) {
      const u = this._coerceRowId(t.dataset.rowId);
      this.toggleTreeRow(u);
      return;
    }
    if (e.target.closest('td[data-editing="true"]')) return;
    const o = this._coerceRowId(t.dataset.rowId), r = e.target.closest("td");
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(o, "toggle");
      return;
    }
    if (r && r.dataset.gutter === "true") {
      if (this._rowDragMoved) {
        this._rowDragMoved = !1;
        return;
      }
      if (this.rowSelectionValue !== "") {
        const u = e.shiftKey ? "range" : e.metaKey || e.ctrlKey ? "toggle" : "replace";
        this.clearCellSelection(), this.toggleRowSelection(o, u), _(this.element, "grid:rowClicked", { rowId: o, row: this.state.rowData.find((d) => this._rowId(d) === o), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (r) {
      const u = this.state.rowData.find((h) => this._rowId(h) === o), d = r.dataset.colId;
      _(this.element, "grid:cellClicked", { rowId: o, colId: d, value: u?.[d], event: e });
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
    this.toggleRowSelection(o, a), _(this.element, "grid:rowClicked", { rowId: o, row: this.state.rowData.find((u) => this._rowId(u) === o), event: e });
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
    const t = Array.from(this.state.selection).map(String), s = new Set(t.includes(String(e)) ? t : [String(e)]), i = p("div", { class: "sg-drag-ghost sg-grid" }), o = p("table"), r = p("tbody");
    let a = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((d) => {
      if (s.has(d.dataset.rowId) && a < 6) {
        const h = d.cloneNode(!0);
        h.removeAttribute("data-selected"), h.querySelectorAll("td").forEach((c) => {
          c.style.left = "", c.style.right = "", c.removeAttribute("data-pinned"), c.removeAttribute("data-cell-active"), c.removeAttribute("data-cell-range");
        }), r.appendChild(h), a += 1;
      }
    }), o.appendChild(r), i.appendChild(o), s.size > a && i.appendChild(p("div", { class: "sg-drag-ghost-more" }, `+${s.size - a} more rows`)), i.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(i);
    const u = p("div", { class: "sg-drop-indicator" });
    document.body.appendChild(u), this._rowDrag = { ids: s, ghost: i, indicator: u, dropRowId: null, dropBefore: !0 }, document.body.classList.add("sg-row-dragging");
  }
  _updateDropIndicator(e) {
    const t = Array.from(this._tbody.querySelectorAll("tr[data-row-id]"));
    let s = null, i = !0;
    for (const u of t) {
      const d = u.getBoundingClientRect();
      if (e < d.top + d.height / 2) {
        s = u, i = !0;
        break;
      }
      s = u, i = !1;
    }
    if (!s) return;
    const o = s.getBoundingClientRect(), r = this._viewport.getBoundingClientRect(), a = this._rowDrag.indicator;
    a.style.left = `${r.left}px`, a.style.width = `${r.width}px`, a.style.top = `${(i ? o.top : o.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(s.dataset.rowId), this._rowDrag.dropBefore = i;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: s, dropRowId: i, dropBefore: o } = this._rowDrag;
    if (t.remove(), s.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, i == null || e.has(String(i))) return;
    const r = this.state.rowData, a = r.filter((h) => e.has(String(this._rowId(h)))), u = r.filter((h) => !e.has(String(this._rowId(h))));
    let d = u.findIndex((h) => this._rowId(h) === i);
    d < 0 ? d = u.length : o || (d += 1), u.splice(d, 0, ...a), this.state.rowData = u, this.state.sortModel = [], this.scheduleRender("data"), _(this.element, "grid:rowDragEnd", {
      ids: a.map((h) => this._rowId(h)),
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
    const t = this._displayList.pageRows, s = this._visibleCols(), i = (h) => t.findIndex((c) => this._rowId(c) === h), o = (h) => s.findIndex((c) => c.field === h), r = i(e.anchor.rowId), a = o(e.anchor.colId);
    if (r < 0 || a < 0) return null;
    const u = i(e.focus.rowId), d = o(e.focus.colId);
    return {
      r0: Math.min(r, u < 0 ? r : u),
      r1: Math.max(r, u < 0 ? r : u),
      c0: Math.min(a, d < 0 ? a : d),
      c1: Math.max(a, d < 0 ? a : d),
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
      for (let r = e.c0; r <= e.c1; r++) {
        const a = e.cols[r];
        a && o.push(I(i, a));
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
        for (let r = o.r0; r <= o.r1; r++) {
          const a = o.rows[r];
          if (a)
            for (let u = o.c0; u <= o.c1; u++) {
              const d = o.cols[u];
              if (!d) continue;
              const h = `${this._rowId(a)}:${d.field}`;
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
    const r = (c, g, f) => Math.max(g, Math.min(c, f)), a = this._activeCell(), u = () => i.findIndex((c) => !c.__sgGroup && !c.__sgDetail);
    let d = a ? i.findIndex((c) => this._rowId(c) === a.rowId) : u(), h = a ? o.findIndex((c) => c.field === a.colId) : 0;
    if (d < 0 && (d = u()), !(d < 0)) {
      if (h < 0 && (h = 0), s && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const c = this.state.cellSel.ranges[this.state.cellSel.activeIdx], g = r(i.findIndex((v) => this._rowId(v) === c.focus.rowId) + e, 0, i.length - 1), f = r(o.findIndex((v) => v.field === c.focus.colId) + t, 0, o.length - 1);
        this._extendActiveRange({ rowId: this._rowId(i[g]), colId: o[f].field });
      } else {
        let c = r(d + e, 0, i.length - 1);
        if (e !== 0) {
          for (; i[c] && (i[c].__sgGroup || i[c].__sgDetail); ) {
            const f = c + e;
            if (f < 0 || f >= i.length) break;
            c = f;
          }
          if (!i[c] || i[c].__sgGroup || i[c].__sgDetail) return;
        }
        const g = r(h + t, 0, o.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(i[c]), colId: o[g].field });
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
          const o = s.rows[i];
          if (!(!o || o.__sgGroup || o.__sgDetail))
            for (let r = s.c0; r <= s.c1; r++) {
              const a = s.cols[r];
              if (!a || !a.editable || a._isCheckbox || a._isRowNumber) continue;
              const u = o[a.field];
              u === "" || u == null || (o[a.field] = "", e = !0, _(this.element, "grid:cellValueChanged", { rowId: this._rowId(o), colId: a.field, oldValue: u, newValue: "" }));
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
    const s = this._visibleCols().filter((c) => c.editable && !c._isCheckbox), i = this._displayList.pageRows, o = i.findIndex((c) => this._rowId(c) === t.rowId), r = s.findIndex((c) => c.field === t.colId);
    if (!s.length || !i.length || o < 0 || r < 0) {
      this.stopEditing(!1);
      return;
    }
    const a = i.length * s.length, u = (o * s.length + r + e + a) % a, d = i[Math.floor(u / s.length)], h = s[u % s.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(d), h.field), requestAnimationFrame(() => {
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
        headerName: t.length ? t.map((u) => this._colByField(u)?.headerName || u).join(" → ") : "",
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
      }, ...e.filter((d) => !a.has(d.field))];
    }
    if (this.groupReorderColumnsValue === !1) return e;
    const o = t.map((a) => e.find((u) => u.field === a)).filter(Boolean), r = new Set(o);
    return [...o, ...e.filter((a) => !r.has(a))];
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
    const i = this.state.rowData.find((o) => String(this._rowId(o)) === t);
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
    let o = s.get(i);
    const r = String(e.masterId);
    if (o) {
      if (o.getAttribute("data-master-id") === r)
        return o.classList.remove("sg-spacer"), o;
      o = null;
    }
    o || (o = p("tr")), o.className = "sg-detail-row", o.dataset.rowId = i, o.setAttribute("data-master-id", r), o.innerHTML = "";
    const a = p("td", { colspan: String(t.length || 1), class: "sg-detail-cell" }), u = p("div", { class: "sg-detail-shell" });
    return u.style.minHeight = `${this.detailRowHeightValue}px`, a.appendChild(u), o.appendChild(a), this._populateDetailShell(u, e.master, e.masterId), o;
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
      const a = document.getElementById(i);
      if (a && a.tagName === "TEMPLATE") {
        const u = a.content.cloneNode(!0);
        this._applyDetailBindings(u, t), e.appendChild(u), o = e;
      }
    }
    if (!o) {
      const a = p("div", { class: "sg-detail-fallback" }), u = Object.keys(t || {}).filter((d) => !d.startsWith("_") && !d.startsWith("__")).slice(0, 6);
      for (const d of u)
        a.append(
          p("span", { class: "sg-detail-fallback-label" }, `${d}: `),
          p("span", { class: "sg-detail-fallback-value" }, String(t[d] ?? "")),
          p("span", { class: "sg-detail-fallback-sep" }, "  ·  ")
        );
      a.lastElementChild?.remove(), e.appendChild(a);
    }
    const r = e.querySelector('[data-controller~="grid"]');
    r && this._seedNestedGrid(r, t, s), queueMicrotask(() => {
      _(this.element, "grid:detailRowMounted", {
        rowId: s,
        masterRow: t,
        detailEl: e,
        nestedGridApi: r?.gridApi || null
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
        const o = i.getAttribute("data-detail-bind-attr"), [r, a] = o.split(":");
        r && a && i.setAttribute(r, t[a] == null ? "" : String(t[a]));
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
      const r = e[o];
      r.pinned === "right" && (i[r.field] = s, s += r.width || 150);
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
S($, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: U },
  rowHeight: { type: Number, default: Ie },
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
function Pe(l, n) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (l[t] !== n[t]) return !1;
  return !0;
}
function ke(l) {
  return l === "number" || l === "date" ? [
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "lessThan", label: "Less than" },
    { value: "greaterThan", label: "Greater than" },
    { value: "inRange", label: "In range" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" }
  ] : l === "boolean" ? [
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
function Te(l, n) {
  if (n === "number") {
    const e = Number(l);
    return Number.isFinite(e) ? e : l;
  }
  return n === "date" ? l : n === "boolean" ? l === "true" ? !0 : l === "false" ? !1 : null : l;
}
function G(l) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(l)) : String(l).replace(/["\\\n\r]/g, (n) => "\\" + n);
}
class K extends P {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    S(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, s = e.clientY;
      let i = !1;
      const o = (a) => {
        const u = Math.abs(a.clientX - t), d = Math.abs(a.clientY - s);
        !i && (u > 5 || d > 5) && (i = !0, document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", r), this._beginReorder(t));
      }, r = (a) => {
        document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", r), i || this.sort(a);
      };
      document.addEventListener("mousemove", o), document.addEventListener("mouseup", r);
    });
  }
  connect() {
    if (this.grid = Le(this.element, "grid", this.application), !!this.grid) {
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
    let o = i;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const r = (u) => {
      const d = u.clientX;
      let h = s.length;
      for (let c = 0; c < s.length; c++) {
        const g = s[c].getBoundingClientRect();
        if (d < g.left + g.width / 2) {
          h = c;
          break;
        }
      }
      o = h > i ? h - 1 : h;
    }, a = () => {
      document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", a), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", o !== i && this.grid.moveColumn(this.fieldValue, o);
    };
    document.addEventListener("mousemove", r), document.addEventListener("mouseup", a);
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
    const t = e.clientX, s = this.element.offsetWidth, i = (r) => this.grid.setColumnWidth(this.fieldValue, s + (r.clientX - t)), o = () => {
      document.removeEventListener("mousemove", i), document.removeEventListener("mouseup", o), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", i), document.addEventListener("mouseup", o), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
S(K, "values", {
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
class ie extends P {
  connect() {
  }
}
class ne extends P {
  connect() {
  }
}
class le extends P {
  connect() {
  }
}
class O extends P {
  constructor() {
    super(...arguments);
    S(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), s = e.paginationGetTotalPages(), i = e.paginationGetRowCount(), o = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const r = i === 0 ? 0 : t * o + 1, a = Math.min(i, r + o - 1);
        this.pageInfoTarget.textContent = i === 0 ? "0 rows" : `${r}–${a} of ${i}`;
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
S(O, "outlets", ["grid"]), S(O, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
const q = ["sum", "avg", "count", "min", "max"], Fe = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', Ge = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class oe extends P {
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
    }), this._columnsTab.innerHTML = Fe, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), n.appendChild(this._columnsTab), this.element.append(this._content, n);
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
    const s = new Set(n.getRowGroupColumns()), i = new Set(n.getPivotColumns()), o = new Map(n.getValueColumns().map((r) => [r.field, r.aggFunc]));
    for (const r of this._columns()) {
      const a = p("li", { class: "sg-column-list-item", draggable: "true" });
      a.dataset.field = r.field;
      const u = p("span", { class: "sg-column-grip", "aria-hidden": "true" });
      u.innerHTML = Ge;
      const d = p("input", { type: "checkbox" });
      d.checked = !r.hidden, d.addEventListener("change", () => n.setColumnVisible(r.field, d.checked));
      const h = p("span", { class: "sg-column-list-label" }, r.headerName || r.field), c = p("span", { class: "sg-column-list-tags" });
      s.has(r.field) && c.appendChild(p("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), i.has(r.field) && c.appendChild(p("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), o.has(r.field) && c.appendChild(p("span", { class: "sg-tag sg-tag-value", title: `Value (${o.get(r.field)})` }, o.get(r.field))), a.append(u, d, h, c), this._wireDragSource(a, r.field), t.appendChild(a);
    }
    return this._wireDropZone(t, "columns"), e;
  }
  _renderDropSection({ title: n, placeholder: e, kind: t, fields: s }) {
    const i = p("div", { class: "sg-panel-section sg-panel-drop" });
    i.appendChild(p("div", { class: "sg-panel-section-title" }, n));
    const o = p("div", { class: "sg-drop-zone" });
    if (o.dataset.dropKind = t, !s.length)
      o.classList.add("sg-drop-zone-empty"), o.appendChild(p("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const r of s) o.appendChild(this._renderChip(t, r));
    return this._wireDropZone(o, t), i.appendChild(o), i;
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
      for (const { field: i, aggFunc: o } of s) t.appendChild(this._renderValueChip(i, o));
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
    const o = p("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return o.addEventListener("click", (r) => {
      r.stopPropagation();
      const a = q.indexOf(e), u = q[(a === -1 ? 0 : a + 1) % q.length];
      t.setColumnAggFunc(n, u);
    }), i.append(
      o,
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
function Be(l) {
  const n = l ?? de.start();
  return n.register("grid", $), n.register("header-cell", K), n.register("row", ie), n.register("cell", ne), n.register("filter", le), n.register("pagination", O), n.register("side-panel", oe), n;
}
const Ne = {
  start: Be,
  GridController: $,
  HeaderCellController: K,
  RowController: ie,
  CellController: ne,
  FilterController: le,
  PaginationController: O,
  SidePanelController: oe
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = Ne);
export {
  ne as CellController,
  le as FilterController,
  $ as GridController,
  K as HeaderCellController,
  O as PaginationController,
  ie as RowController,
  oe as SidePanelController,
  Ne as default,
  Be as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
