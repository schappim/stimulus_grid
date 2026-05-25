var yt = Object.defineProperty;
var Ct = (s, r, e) => r in s ? yt(s, r, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[r] = e;
var E = (s, r, e) => Ct(s, typeof r != "symbol" ? r + "" : r, e);
import { Controller as z, Application as St } from "@hotwired/stimulus";
function V(s, r) {
  return typeof r.valueGetter == "function" ? r.valueGetter(s) : s?.[r.field];
}
function P(s, r) {
  const e = V(s, r);
  return typeof r.valueFormatter == "function" ? r.valueFormatter(e, s) : e == null ? "" : r.type === "date" && e instanceof Date ? e.toLocaleDateString() : r.type === "boolean" ? e ? "✓" : "" : String(e);
}
const be = {
  contains: (s, r) => String(s ?? "").toLowerCase().includes(String(r ?? "").toLowerCase()),
  notContains: (s, r) => !String(s ?? "").toLowerCase().includes(String(r ?? "").toLowerCase()),
  equals: (s, r) => String(s ?? "").toLowerCase() === String(r ?? "").toLowerCase(),
  notEqual: (s, r) => String(s ?? "").toLowerCase() !== String(r ?? "").toLowerCase(),
  startsWith: (s, r) => String(s ?? "").toLowerCase().startsWith(String(r ?? "").toLowerCase()),
  endsWith: (s, r) => String(s ?? "").toLowerCase().endsWith(String(r ?? "").toLowerCase()),
  blank: (s) => s == null || s === "",
  notBlank: (s) => s != null && s !== ""
}, xt = {
  equals: (s, r) => Number(s) === Number(r),
  notEqual: (s, r) => Number(s) !== Number(r),
  lessThan: (s, r) => Number(s) < Number(r),
  lessThanOrEqual: (s, r) => Number(s) <= Number(r),
  greaterThan: (s, r) => Number(s) > Number(r),
  greaterThanOrEqual: (s, r) => Number(s) >= Number(r),
  inRange: (s, r, e) => Number(s) >= Number(r) && Number(s) <= Number(e),
  blank: (s) => s == null || s === "",
  notBlank: (s) => s != null && s !== ""
};
function k(s) {
  if (s == null || s === "") return null;
  if (s instanceof Date) return s;
  const r = new Date(s);
  return Number.isNaN(r.valueOf()) ? null : r;
}
const Lt = {
  equals: (s, r) => k(s)?.toDateString() === k(r)?.toDateString(),
  notEqual: (s, r) => k(s)?.toDateString() !== k(r)?.toDateString(),
  lessThan: (s, r) => (k(s)?.valueOf() ?? -1 / 0) < (k(r)?.valueOf() ?? 1 / 0),
  greaterThan: (s, r) => (k(s)?.valueOf() ?? 1 / 0) > (k(r)?.valueOf() ?? -1 / 0),
  inRange: (s, r, e) => {
    const t = k(s)?.valueOf();
    return t != null && t >= (k(r)?.valueOf() ?? -1 / 0) && t <= (k(e)?.valueOf() ?? 1 / 0);
  },
  blank: (s) => s == null || s === "",
  notBlank: (s) => s != null && s !== ""
}, At = {
  equals: (s, r) => r === "true" ? !!s : r === "false" ? !s : !0
}, Rt = {
  in: (s, r) => Array.isArray(r) && r.includes(String(s ?? ""))
}, Et = { text: be, number: xt, date: Lt, boolean: At, set: Rt };
function ye(s, r, e) {
  if (!e) return !0;
  const t = e.filterType || r.filter || "text", n = (Et[t] || be)[e.type];
  if (!n) return !0;
  const l = V(s, r);
  return n(l, e.value, e.value2);
}
function Ce(s, r, e) {
  const t = Object.entries(r || {}).filter(([, i]) => i != null);
  return t.length === 0 ? s : s.filter((i) => i && i.__sgSeparator ? !0 : t.every(([n, l]) => {
    const a = e[n];
    return a ? ye(i, a, l) : !0;
  }));
}
function Se(s, r, e) {
  if (!r) return s;
  const t = String(r).toLowerCase();
  return s.filter((i) => {
    if (i && i.__sgSeparator) return !0;
    for (const n of e) {
      const l = P(i, n);
      if (l && String(l).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function $(s, r, e) {
  if (s == null && r == null) return 0;
  if (s == null) return -1;
  if (r == null) return 1;
  if (e === "number") return Number(s) - Number(r);
  if (e === "date") {
    const t = k(s)?.valueOf() ?? 0, i = k(r)?.valueOf() ?? 0;
    return t - i;
  }
  return e === "boolean" ? s === r ? 0 : s ? 1 : -1 : String(s).localeCompare(String(r), void 0, { numeric: !0, sensitivity: "base" });
}
function Dt(s, r, e) {
  if (!r || r.length === 0) return s;
  const t = (o, d) => {
    for (const { colId: c, sort: h } of r) {
      const u = e[c];
      if (!u) continue;
      const p = V(o, u), g = V(d, u), _ = typeof u.comparator == "function" ? u.comparator(p, g, o, d) : $(p, g, u.type);
      if (_ !== 0) return h === "desc" ? -_ : _;
    }
    return 0;
  };
  if (!s.some((o) => o && o.__sgSeparator)) return s.slice().sort(t);
  const n = [];
  let l = [];
  const a = () => {
    if (l.length) {
      l.sort(t);
      for (const o of l) n.push(o);
      l = [];
    }
  };
  for (const o of s)
    o && o.__sgSeparator ? (a(), n.push(o)) : l.push(o);
  return a(), n;
}
function K(s, r) {
  if (!r || !r.enabled) return { rows: s, total: s.length, pageRows: s };
  const e = s.length, t = Math.max(1, Math.ceil(e / r.pageSize)), i = Math.min(r.page, t - 1), n = i * r.pageSize, l = s.slice(n, n + r.pageSize);
  return { rows: s, total: e, totalPages: t, page: i, pageRows: l };
}
function xe(s, r, e) {
  if (s === "count") return r.length;
  const t = r.map((n) => V(n, e));
  if (s === "first") return t.length ? t[0] : null;
  if (s === "last") return t.length ? t[t.length - 1] : null;
  const i = t.map(Number).filter((n) => !Number.isNaN(n));
  switch (s) {
    case "sum":
      return i.reduce((n, l) => n + l, 0);
    case "avg":
      return i.length ? i.reduce((n, l) => n + l, 0) / i.length : null;
    case "min":
      return i.length ? Math.min(...i) : null;
    case "max":
      return i.length ? Math.max(...i) : null;
    default:
      return null;
  }
}
function U(s, r, e) {
  const t = {};
  for (const [i, n] of Object.entries(r || {})) {
    const l = e[i];
    l && (t[i] = xe(n, s, l));
  }
  return t;
}
function Mt(s) {
  let r = 0, e = 0, t = 0, i = 1 / 0, n = -1 / 0;
  for (const l of s) {
    if (l == null || l === "") continue;
    r += 1;
    let a = null;
    if (typeof l == "number" && Number.isFinite(l)) a = l;
    else if (typeof l == "string" && l.trim() !== "") {
      const o = Number(l);
      Number.isFinite(o) && (a = o);
    }
    a != null && (e += 1, t += a, a < i && (i = a), a > n && (n = a));
  }
  return {
    count: r,
    sum: e ? t : null,
    avg: e ? t / e : null,
    min: e ? i : null,
    max: e ? n : null
  };
}
function Tt(s, r, e, t, i = () => !0) {
  const n = (d, c, h) => {
    const u = r[c], p = /* @__PURE__ */ new Map();
    for (const g of d) {
      const _ = V(g, u), w = _ == null ? "" : String(_);
      p.has(w) || p.set(w, { value: _, rows: [] }), p.get(w).rows.push(g);
    }
    return Array.from(p.values()).sort((g, _) => $(g.value, _.value, u.type)).map(({ value: g, rows: _ }) => {
      const w = g == null ? "" : String(g), y = h ? `${h}|${u.field}=${w}` : `${u.field}=${w}`;
      return {
        __sgGroup: !0,
        level: c,
        field: u.field,
        value: g,
        groupId: y,
        count: _.length,
        aggregates: U(_, t, e),
        leaves: _,
        children: c + 1 < r.length ? n(_, c + 1, y) : null
      };
    });
  }, l = n(s, 0, ""), a = [], o = (d) => {
    for (const c of d)
      if (a.push(c), !!i(c.groupId, c.level))
        if (c.children) o(c.children);
        else for (const h of c.leaves) a.push(h);
  };
  return o(l), { displayList: a, tree: l };
}
function Le(s, r, e) {
  return `__p|${e.map((i) => {
    const n = s[i.field];
    return `${i.field}=${n == null ? "" : String(n)}`;
  }).join("|")}|${r.col.field}:${r.aggFunc}`;
}
function Ae(s, r) {
  return r.map((e) => {
    const t = V(s, e);
    return t == null ? "" : String(t);
  }).join("");
}
function Vt(s, r) {
  if (!r?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const t of s) {
    const i = Ae(t, r);
    if (!e.has(i)) {
      const n = {};
      r.forEach((l) => {
        const a = V(t, l);
        n[l.field] = a ?? null;
      }), e.set(i, n);
    }
  }
  return Array.from(e.values()).sort((t, i) => {
    for (const n of r) {
      const l = $(t[n.field], i[n.field], n.type);
      if (l !== 0) return l;
    }
    return 0;
  });
}
function It(s, r, e) {
  if (!s.length || !r.length) return [];
  const t = [], i = r.length === 1;
  for (const n of s)
    for (const l of r) {
      const a = Le(n, l, e), o = e.map((c) => n[c.field] == null ? "(Blank)" : String(n[c.field])).join(" · "), d = i ? o : `${o} · ${l.aggFunc}(${l.col.field})`;
      t.push({
        field: a,
        headerName: d,
        type: "number",
        width: 100,
        sortable: !0,
        filter: null,
        resizable: !1,
        _isPivot: !0,
        pivotKeys: { ...n },
        valueField: l.col.field,
        aggFunc: l.aggFunc,
        valueGetter: (c) => c?.__pivotValues?.[a] ?? null
      });
    }
  return t;
}
function kt(s) {
  return typeof s == "string" && s.startsWith("__p|");
}
function Nt(s, r) {
  const e = Array.isArray(s) ? s.filter((t) => t && t.colId && t.sort) : [];
  return (t, i) => {
    for (const n of e) {
      const l = n.sort === "desc" ? -1 : 1;
      if (kt(n.colId)) {
        const a = t.__pivotValues ? t.__pivotValues[n.colId] : null, o = i.__pivotValues ? i.__pivotValues[n.colId] : null, d = $(a, o, "number");
        if (d !== 0) return l * d;
        continue;
      }
      if (r && n.colId === r.field) {
        const a = $(t.value, i.value, r.type);
        if (a !== 0) return l * a;
        continue;
      }
    }
    return $(t.value, i.value, r?.type);
  };
}
function ue(s, r, e, t) {
  const i = {}, n = /* @__PURE__ */ new Map();
  for (const l of s) {
    const a = Ae(l, t);
    n.has(a) || n.set(a, []), n.get(a).push(l);
  }
  for (const l of r) {
    const a = t.map((d) => {
      const c = l[d.field];
      return c == null ? "" : String(c);
    }).join(""), o = n.get(a) || [];
    for (const d of e) {
      const c = Le(l, d, t);
      i[c] = o.length ? xe(d.aggFunc, o, d.col) : null;
    }
  }
  return i;
}
function Pt({ rows: s, rowGroupCols: r = [], pivotCols: e, valueConfigs: t, isExpanded: i = () => !0, sortModel: n = [] }) {
  const l = Vt(s, e), a = It(l, t, e), o = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: s.length,
    aggregates: {},
    leaves: s,
    __pivotValues: ue(s, l, t, e)
  };
  if (!r.length)
    return { columns: a, displayList: [o], tree: [], combos: l };
  const d = (p, g, _) => {
    const w = r[g], y = /* @__PURE__ */ new Map();
    for (const b of p) {
      const x = V(b, w), L = x == null ? "" : String(x);
      y.has(L) || y.set(L, { value: x, rows: [] }), y.get(L).rows.push(b);
    }
    const v = Array.from(y.values()).map(({ value: b, rows: x }) => {
      const L = b == null ? "" : String(b), T = _ ? `${_}|${w.field}=${L}` : `${w.field}=${L}`;
      return {
        __sgGroup: !0,
        level: g,
        field: w.field,
        value: b,
        groupId: T,
        count: x.length,
        aggregates: {},
        leaves: x,
        __pivotValues: ue(x, l, t, e),
        children: g + 1 < r.length ? d(x, g + 1, T) : null
      };
    }), C = Nt(n, w);
    return v.sort(C);
  }, c = d(s, 0, ""), h = [o], u = (p) => {
    for (const g of p)
      h.push(g), i(g.groupId, g.level) && g.children && u(g.children);
  };
  return u(c), { columns: a, displayList: h, tree: c, combos: l };
}
function Ft(s, { pivotCols: r = [], valueConfigs: e = [], columnGroups: t = null } = {}) {
  if (s._isPivot && r.length && s.pivotKeys)
    return Bt(s, r, e);
  if (t && Array.isArray(t) && t.length && !s._isGroupCol && !s._isCheckbox && !s._isRowNumber) {
    for (const i of t)
      if (i?.children && i.children.includes(s.field))
        return [
          { kind: "group", id: `g:${i.headerName}`, label: i.headerName },
          { kind: "leaf", col: s }
        ];
  }
  return [{ kind: "leaf", col: s }];
}
function Bt(s, r, e) {
  const t = (e?.length || 0) > 1, i = [];
  for (let n = 0; n < r.length; n++) {
    const l = r[n].field, a = s.pivotKeys[l];
    if (n === r.length - 1 && !t)
      return i.push({ kind: "leaf", col: s, label: a == null ? "(Blank)" : String(a) }), i;
    i.push({
      kind: "group",
      id: `p:${n}:${a == null ? "" : String(a)}`,
      label: a == null ? "(Blank)" : String(a)
    });
  }
  return i.push({ kind: "leaf", col: s, label: `${s.aggFunc}(${s.valueField})` }), i;
}
function $t(s, r = {}) {
  if (!s.length) return { rows: [[]], depth: 1 };
  const e = s.map((n) => Ft(n, r).slice()), t = Math.max(1, ...e.map((n) => n.length)), i = [];
  for (let n = 0; n < t; n++) {
    const l = [];
    let a = 0;
    for (; a < e.length; ) {
      const o = e[a];
      if (n >= o.length || o[n] === null) {
        a += 1;
        continue;
      }
      const d = o[n];
      if (d.kind === "leaf") {
        l.push({ kind: "leaf", col: d.col, label: d.label, rowspan: t - n, colspan: 1 });
        for (let h = n + 1; h < t; h++) o[h] = null;
        a += 1;
        continue;
      }
      let c = a + 1;
      for (; c < e.length; ) {
        const h = e[c];
        if (n >= h.length || !h[n] || h[n].kind !== "group" || h[n].id !== d.id) break;
        let u = !0;
        for (let p = 0; p < n; p++) {
          const g = o[p]?.id ?? null, _ = h[p]?.id ?? null;
          if (g !== _) {
            u = !1;
            break;
          }
        }
        if (!u) break;
        c += 1;
      }
      l.push({ kind: "group", label: d.label, colspan: c - a, rowspan: 1 }), a = c;
    }
    i.push(l);
  }
  return { rows: i, depth: t };
}
function zt({
  rows: s,
  parentField: r = "parent_id",
  getRowId: e = (l) => l?.id,
  passesFilter: t = null,
  siblingComparator: i = null,
  isExpanded: n = () => !0
} = {}) {
  if (!Array.isArray(s) || s.length === 0)
    return { displayList: [], treeMeta: /* @__PURE__ */ new Map() };
  const l = (w) => {
    const y = e(w);
    return y == null ? null : String(y);
  }, a = /* @__PURE__ */ new Map();
  for (const w of s) {
    const y = l(w);
    y != null && a.set(y, w);
  }
  const o = /* @__PURE__ */ new Map(), d = [];
  for (const w of s) {
    const y = l(w), v = w?.[r], C = v == null ? null : String(v);
    C == null || C === y || !a.has(C) ? d.push(w) : (o.has(C) || o.set(C, []), o.get(C).push(w));
  }
  const c = t ? new Map(s.map((w) => [l(w), !!t(w)])) : null, h = /* @__PURE__ */ new Map(), u = (w, y) => {
    const v = l(w);
    if (v == null) return !1;
    if (h.has(v)) return h.get(v);
    if (y.has(v)) return !1;
    y.add(v);
    let C = !!c.get(v);
    const b = o.get(v) || [];
    for (const x of b) C = u(x, y) || C;
    return y.delete(v), h.set(v, C), C;
  };
  if (c)
    for (const w of d) u(w, /* @__PURE__ */ new Set());
  const p = [], g = /* @__PURE__ */ new Map(), _ = (w, y, v, C) => {
    const b = c ? w.filter((x) => C || h.get(l(x))) : w.slice();
    i && b.sort(i);
    for (const x of b) {
      const L = l(x);
      if (L == null || v.has(L)) continue;
      const T = o.get(L) || [], M = C || (c ? !!c.get(L) : !1), I = c ? T.filter((B) => M || h.get(l(B))) : T, A = I.length > 0, N = A && (c ? !0 : !!n(L, y));
      g.set(L, { level: y, hasChildren: A, expanded: N }), p.push(x), N && (v.add(L), _(I, y + 1, v, M), v.delete(L));
    }
  };
  return _(d, 0, /* @__PURE__ */ new Set(), !1), { displayList: p, treeMeta: g };
}
function Ht(s) {
  if (s.serverSide) {
    const c = s.rowData, h = s.pagination?.pageSize || c.length || 1, u = s.serverRowCount ?? c.length, p = Math.max(1, Math.ceil(u / h)), g = Math.min(s.pagination?.page || 0, p - 1);
    return { filteredSorted: c, rows: c, total: u, totalPages: p, page: g, pageRows: c };
  }
  const r = Object.fromEntries(s.columnDefs.map((c) => [c.field, c])), e = s.columnDefs.filter((c) => !c.hidden && !c._isCheckbox), t = (s.rowGroupCols || []).filter((c) => r[c]);
  if (s.treeData && !s.pivotMode && t.length === 0) {
    const c = s.treeParentField || "parent_id", h = Object.entries(s.filterModel || {}).filter(([, x]) => x != null), u = s.quickFilter ? String(s.quickFilter).toLowerCase() : "", g = h.length > 0 || u !== "" ? (x) => {
      for (const [L, T] of h) {
        const M = r[L];
        if (M && !ye(x, M, T)) return !1;
      }
      if (u) {
        let L = !1;
        for (const T of e) {
          const M = P(x, T);
          if (M && String(M).toLowerCase().includes(u)) {
            L = !0;
            break;
          }
        }
        if (!L) return !1;
      }
      return !0;
    } : null, _ = Array.isArray(s.sortModel) ? s.sortModel : [], w = _.length ? (x, L) => {
      for (const { colId: T, sort: M } of _) {
        const I = r[T];
        if (!I) continue;
        const A = V(x, I), N = V(L, I), B = typeof I.comparator == "function" ? I.comparator(A, N, x, L) : $(A, N, I.type);
        if (B !== 0) return M === "desc" ? -B : B;
      }
      return 0;
    } : null, y = s.getRowId || ((x) => x?.id), { displayList: v, treeMeta: C } = zt({
      rows: s.rowData,
      parentField: c,
      getRowId: y,
      passesFilter: g,
      siblingComparator: w,
      isExpanded: s.isTreeRowExpanded || (() => !0)
    }), b = K(v, s.pagination);
    return {
      tree: !0,
      treeData: !0,
      treeMeta: C,
      treeParentField: c,
      filteredSorted: v,
      ...b
    };
  }
  let i = s.rowData;
  i = Ce(i, s.filterModel, r), i = Se(i, s.quickFilter, e), i = Dt(i, s.sortModel, r);
  const n = t, l = s.pivotMode ? (s.pivotCols || []).filter((c) => r[c]) : [], a = s.pivotMode ? Object.entries(s.aggModel || {}).filter(([c]) => r[c]).map(([c, h]) => ({ col: r[c], aggFunc: h })) : [];
  if (s.pivotMode && l.length && a.length) {
    const c = n.map((y) => r[y]), h = l.map((y) => r[y]), { columns: u, displayList: p, tree: g, combos: _ } = Pt({
      rows: i,
      rowGroupCols: c,
      pivotCols: h,
      valueConfigs: a,
      isExpanded: s.isGroupExpanded,
      sortModel: s.sortModel
    }), w = K(p, s.pagination);
    return {
      pivot: !0,
      pivotResultColumns: u,
      combos: _,
      grouped: !0,
      tree: g,
      leafCount: i.length,
      grandTotals: U(i, s.aggModel, r),
      filteredSorted: p,
      ...w
    };
  }
  if (n.length) {
    const c = n.map((g) => r[g]), { displayList: h, tree: u } = Tt(
      i,
      c,
      r,
      s.aggModel,
      s.isGroupExpanded
    ), p = K(h, s.pagination);
    return {
      grouped: !0,
      tree: u,
      leafCount: i.length,
      grandTotals: U(i, s.aggModel, r),
      filteredSorted: h,
      ...p
    };
  }
  const o = K(i, s.pagination), d = s.aggModel && Object.keys(s.aggModel).length ? U(i, s.aggModel, r) : null;
  return { filteredSorted: i, grandTotals: d, ...o };
}
function Gt(s, r, e, t, i = 6) {
  const n = Math.ceil(r / e), l = Math.max(0, Math.floor(s / e) - i), a = Math.min(t, l + n + i * 2);
  return { first: l, last: a };
}
function Ot(s) {
  return {
    // ---- Data ----
    setRowData(r) {
      s.setRowData(r);
    },
    getRowData() {
      return s.state.rowData.slice();
    },
    applyTransaction(r) {
      return s.applyTransaction(r);
    },
    // Server-side row model
    setRowCount(r) {
      s.setRowCount(r);
    },
    getRowCount() {
      return s.state.serverSide ? s.state.serverRowCount : s.state.rowData.length;
    },
    isServerSide() {
      return !!s.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(r) {
      s.setColumnDefs(r);
    },
    getColumnDefs() {
      return s.state.columnDefs.slice();
    },
    setColumnVisible(r, e) {
      s.setColumnVisible(r, e);
    },
    setColumnPinned(r, e) {
      s.setColumnPinned(r, e);
    },
    setColumnWidth(r, e) {
      s.setColumnWidth(r, e);
    },
    moveColumn(r, e) {
      s.moveColumn(r, e);
    },
    autoSizeColumn(r) {
      s.autoSizeColumn(r);
    },
    autoSizeAllColumns() {
      s.state.columnDefs.forEach((r) => s.autoSizeColumn(r.field));
    },
    sizeColumnsToFit() {
      s.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(r) {
      s.setSortModel(r);
    },
    getSortModel() {
      return s.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(r) {
      s.setFilterModel(r);
    },
    getFilterModel() {
      return { ...s.state.filterModel };
    },
    setColumnFilter(r, e) {
      s.setColumnFilter(r, e);
    },
    destroyFilter(r) {
      s.setColumnFilter(r, null);
    },
    setQuickFilter(r) {
      s.setQuickFilter(r);
    },
    getQuickFilter() {
      return s.getQuickFilter();
    },
    // ---- Selection ----
    selectAll() {
      s.selectAll();
    },
    deselectAll() {
      s.deselectAll();
    },
    selectRow(r) {
      s.setSelected(r, !0);
    },
    deselectRow(r) {
      s.setSelected(r, !1);
    },
    getSelectedRows() {
      return s.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(s.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(r) {
      s.goToPage(r);
    },
    paginationGoToFirstPage() {
      s.goToPage(0);
    },
    paginationGoToNextPage() {
      s.goToPage(s.state.pagination.page + 1);
    },
    paginationGoToPreviousPage() {
      s.goToPage(s.state.pagination.page - 1);
    },
    paginationGoToLastPage() {
      s.goToPage(s.lastPageIndex());
    },
    paginationSetPageSize(r) {
      s.setPageSize(r);
    },
    paginationGetCurrentPage() {
      return s.state.pagination.page;
    },
    paginationGetTotalPages() {
      return s.totalPages();
    },
    paginationGetRowCount() {
      return s.filteredCount();
    },
    paginationGetPageSize() {
      return s.state.pagination.pageSize;
    },
    paginationIsEnabled() {
      return s.state.pagination.enabled;
    },
    // ---- Cell selection ----
    getCellSelection() {
      return s.getCellSelectionDetail();
    },
    getCellRangeValues() {
      return s._cellRangeRows();
    },
    getCellSelectionRowIds() {
      return s.getCellSelectionRowIds();
    },
    getRangeAggregates() {
      return s.getRangeAggregates();
    },
    // ---- Editing ----
    startEditingCell({ rowId: r, colId: e }) {
      s.startEditingCell(r, e);
    },
    stopEditing(r = !1) {
      s.stopEditing(r);
    },
    // ---- Row grouping + aggregation ----
    setRowGroupColumns(r) {
      s.setRowGroupColumns(r);
    },
    addRowGroupColumn(r) {
      s.addRowGroupColumn(r);
    },
    removeRowGroupColumn(r) {
      s.removeRowGroupColumn(r);
    },
    getRowGroupColumns() {
      return s.getRowGroupColumns();
    },
    setColumnAggFunc(r, e) {
      s.setColumnAggFunc(r, e);
    },
    expandAll() {
      s.expandAll();
    },
    collapseAll() {
      s.collapseAll();
    },
    toggleGroup(r, e) {
      s.toggleGroup(r, e);
    },
    // ---- Pivot ----
    setPivotMode(r) {
      s.setPivotMode(r);
    },
    isPivotMode() {
      return s.isPivotMode();
    },
    setPivotColumns(r) {
      s.setPivotColumns(r);
    },
    addPivotColumn(r) {
      s.addPivotColumn(r);
    },
    removePivotColumn(r) {
      s.removePivotColumn(r);
    },
    getPivotColumns() {
      return s.getPivotColumns();
    },
    // Synthetic pivot result columns from the most recent render. Each entry
    // is { field, headerName, pivotKeys, valueField, aggFunc } — useful for
    // discovering the field id of a pivot col to feed to setSortModel / for
    // building a custom column visibility UI.
    getPivotResultColumns() {
      return (s._displayList?.pivotResultColumns || []).map((e) => ({
        field: e.field,
        headerName: e.headerName,
        pivotKeys: { ...e.pivotKeys || {} },
        valueField: e.valueField,
        aggFunc: e.aggFunc
      }));
    },
    // ---- Value columns (aggregations; shared with grouping) ----
    setValueColumns(r) {
      s.setValueColumns(r);
    },
    addValueColumn(r, e = "sum") {
      s.addValueColumn(r, e);
    },
    removeValueColumn(r) {
      s.removeValueColumn(r);
    },
    getValueColumns() {
      return s.getValueColumns();
    },
    // ---- Column header groups (multi-row headers) ----
    setColumnGroups(r) {
      s.setColumnGroups(r);
    },
    getColumnGroups() {
      return s.getColumnGroups();
    },
    // ---- Pinned bottom row (sticky grand totals) ----
    setPinnedBottomRow(r) {
      s.setPinnedBottomRow(r);
    },
    isPinnedBottomRow() {
      return s.isPinnedBottomRow();
    },
    // ---- Tree data (self-referential parent_id) ----
    setTreeData(r) {
      s.setTreeData(r);
    },
    isTreeData() {
      return s.isTreeData();
    },
    setTreeParentField(r) {
      s.setTreeParentField(r);
    },
    expandTreeRow(r) {
      s.expandTreeRow(r);
    },
    collapseTreeRow(r) {
      s.collapseTreeRow(r);
    },
    toggleTreeRow(r) {
      s.toggleTreeRow(r);
    },
    expandAllTreeRows() {
      s.expandAllTreeRows();
    },
    collapseAllTreeRows() {
      s.collapseAllTreeRows();
    },
    getTreeExpandedRowIds() {
      return s.getTreeExpandedRowIds();
    },
    // ---- Master/detail ----
    setMasterDetail(r) {
      s.setMasterDetail(r);
    },
    isMasterDetail() {
      return s.isMasterDetail();
    },
    expandDetailRow(r) {
      s.expandDetailRow(r);
    },
    collapseDetailRow(r) {
      s.collapseDetailRow(r);
    },
    toggleDetailRow(r) {
      s.toggleDetailRow(r);
    },
    expandAllDetails() {
      s.expandAllDetails();
    },
    collapseAllDetails() {
      s.collapseAllDetails();
    },
    getDetailExpandedRowIds() {
      return s.getDetailExpandedRowIds();
    },
    // ---- Column state + persistence ----
    getColumnState() {
      return s.getColumnState();
    },
    applyColumnState(r) {
      s.applyColumnState(r);
    },
    clearPersistedState() {
      s.clearPersistedState();
    },
    getPersistKey() {
      return s.persistKeyValue || "";
    },
    // ---- Export ----
    getDataAsCsv(r = {}) {
      return s.getDataAsCsv(r);
    },
    exportDataAsCsv(r = {}) {
      return s.exportDataAsCsv(r);
    },
    // ---- Display ----
    refreshCells(r = {}) {
      s.refresh(r);
    },
    redrawRows(r = {}) {
      s.refresh(r);
    },
    // ---- Events ----
    addEventListener(r, e) {
      s.element.addEventListener(r, e);
    },
    removeEventListener(r, e) {
      s.element.removeEventListener(r, e);
    }
  };
}
function f(s, r = {}, e = []) {
  const t = document.createElement(s);
  for (const [i, n] of Object.entries(r))
    n === !1 || n == null || (i === "class" ? t.className = n : i === "style" && typeof n == "object" ? Object.assign(t.style, n) : i.startsWith("on") && typeof n == "function" ? t.addEventListener(i.slice(2).toLowerCase(), n) : n === !0 ? t.setAttribute(i, "") : t.setAttribute(i, String(n)));
  for (const i of [].concat(e))
    i == null || i === !1 || t.appendChild(typeof i == "string" ? document.createTextNode(i) : i);
  return t;
}
function he(s, r) {
  for (const [e, t] of Object.entries(r))
    t == null || t === !1 ? s.removeAttribute(e) : t === !0 ? s.setAttribute(e, "") : s.setAttribute(e, String(t));
}
function pe(s) {
  const r = document.getElementById(s);
  return !r || r.tagName !== "TEMPLATE" ? null : r.content.firstElementChild.cloneNode(!0);
}
function S(s, r, e) {
  s.dispatchEvent(new CustomEvent(r, { detail: e, bubbles: !0 }));
}
function Kt(s, r, e) {
  let t = s.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(r)) {
      const n = e.getControllerForElementAndIdentifier(t, r);
      if (n) return n;
    }
    t = t.parentElement;
  }
  return null;
}
const re = /* @__PURE__ */ new Map();
function R(s, r) {
  if (typeof s != "string" || !s) throw new Error("registerRenderer: name must be a non-empty string");
  if (typeof r != "function") throw new Error("registerRenderer: fn must be a function");
  re.set(s, r);
}
function Re(s) {
  return re.get(s) || null;
}
function qt() {
  return Array.from(re.keys());
}
function m(s, r = {}, e = null) {
  const t = document.createElement(s);
  for (const [i, n] of Object.entries(r))
    n == null || n === !1 || (i === "class" ? t.className = n : t.setAttribute(i, n === !0 ? "" : String(n)));
  return e == null || (Array.isArray(e) ? e.forEach((i) => t.append(i)) : typeof e == "string" ? t.innerHTML = e : t.append(e)), t;
}
const D = (s) => s == null || s === "", Wt = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function Ee() {
  return ({ value: s }) => {
    if (D(s)) return "";
    const r = String(s);
    return Wt.test(r) ? m("a", {
      class: "sg-renderer-link",
      href: `mailto:${r}`,
      title: "Send email"
    }, document.createTextNode(r)) : m("span", { class: "sg-renderer-invalid", title: "Invalid email" }, document.createTextNode(r));
  };
}
function De({ newTab: s = !0 } = {}) {
  return ({ value: r }) => {
    if (D(r)) return "";
    const e = String(r);
    let t;
    try {
      t = new URL(e);
    } catch {
      return document.createTextNode(e);
    }
    return m("a", {
      class: "sg-renderer-link",
      href: e,
      target: s ? "_blank" : null,
      rel: s ? "noopener noreferrer" : null,
      title: e
    }, document.createTextNode(t.hostname + (t.pathname !== "/" ? t.pathname : "")));
  };
}
function Me({ defaultRegion: s = "AU" } = {}) {
  return ({ value: r }) => {
    if (D(r)) return "";
    const e = String(r).trim(), t = e.replace(/\D/g, "");
    if (!t) return document.createTextNode(e);
    let i = e;
    return s === "AU" && (/^04\d{8}$/.test(t) ? i = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : /^0[2378]\d{8}$/.test(t) ? i = `(${t.slice(0, 2)}) ${t.slice(2, 6)} ${t.slice(6)}` : /^1[38]00\d{6}$/.test(t) ? i = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : t.length === 8 && (i = `${t.slice(0, 4)} ${t.slice(4)}`)), m("a", { class: "sg-renderer-link", href: `tel:${t}` }, document.createTextNode(i));
  };
}
function Te({ currency: s = "USD", locale: r = "en-US", decimals: e } = {}) {
  return ({ value: t, td: i }) => {
    if (i && i.classList.add("sg-renderer-number"), D(t)) return "";
    const n = Number(t);
    if (!Number.isFinite(n)) return String(t);
    const l = { style: "currency", currency: s };
    return e != null && (l.minimumFractionDigits = e, l.maximumFractionDigits = e), n.toLocaleString(r, l);
  };
}
function Ve({ decimals: s = 0, scale: r = "as-is" } = {}) {
  return ({ value: e, td: t }) => {
    if (t && t.classList.add("sg-renderer-number"), D(e)) return "";
    let i = Number(e);
    return Number.isFinite(i) ? (r === "fraction" && (i *= 100), `${i.toFixed(s)}%`) : String(e);
  };
}
function le(s) {
  if (s == null || s === "") return null;
  if (s instanceof Date) return Number.isNaN(s.valueOf()) ? null : s;
  const r = new Date(s);
  return Number.isNaN(r.valueOf()) ? null : r;
}
function Ie({ locale: s = void 0, dateStyle: r = "medium", ...e } = {}) {
  const t = new Intl.DateTimeFormat(s, { dateStyle: r, ...e });
  return ({ value: i }) => {
    const n = le(i);
    return n ? t.format(n) : "";
  };
}
function ke({ locale: s = void 0, dateStyle: r = "medium", timeStyle: e = "short", ...t } = {}) {
  const i = new Intl.DateTimeFormat(s, { dateStyle: r, timeStyle: e, ...t });
  return ({ value: n }) => {
    const l = le(n);
    return l ? i.format(l) : "";
  };
}
const se = [
  { unit: "second", ms: 1e3, cutoff: 60 * 1e3 },
  { unit: "minute", ms: 60 * 1e3, cutoff: 3600 * 1e3 },
  { unit: "hour", ms: 3600 * 1e3, cutoff: 1440 * 60 * 1e3 },
  { unit: "day", ms: 1440 * 60 * 1e3, cutoff: 10080 * 60 * 1e3 },
  { unit: "week", ms: 10080 * 60 * 1e3, cutoff: 720 * 60 * 60 * 1e3 },
  { unit: "month", ms: 720 * 60 * 60 * 1e3, cutoff: 365 * 24 * 60 * 60 * 1e3 },
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1e3, cutoff: 1 / 0 }
];
function Ne({ locale: s = void 0, numeric: r = "auto", style: e = "long" } = {}) {
  const t = new Intl.RelativeTimeFormat(s, { numeric: r, style: e });
  return ({ value: i }) => {
    const n = le(i);
    if (!n) return "";
    const l = n.getTime() - Date.now(), a = Math.abs(l), o = se.find((h) => a < h.cutoff) || se[se.length - 1], d = Math.round(l / o.ms), c = m("span", { class: "sg-renderer-relative-time", title: n.toLocaleString() });
    return c.textContent = t.format(d, o.unit), c;
  };
}
const jt = { ms: 1, sec: 1e3, second: 1e3, min: 6e4, minute: 6e4, hr: 36e5, hour: 36e5 };
function Pe({ unit: s = "ms", style: r = "compact" } = {}) {
  const e = jt[s] ?? 1;
  return ({ value: t, td: i }) => {
    if (i && i.classList.add("sg-renderer-number"), D(t)) return "";
    const n = Number(t) * e;
    if (!Number.isFinite(n)) return String(t);
    const l = n < 0 ? "-" : "", a = Math.abs(n), o = Math.floor(a / 36e5), d = Math.floor(a % 36e5 / 6e4), c = Math.floor(a % 6e4 / 1e3);
    if (r === "clock") {
      const u = (p) => String(p).padStart(2, "0");
      return l + (o > 0 ? `${u(o)}:${u(d)}:${u(c)}` : `${u(d)}:${u(c)}`);
    }
    if (r === "words") {
      const u = [];
      return o && u.push(`${o} ${o === 1 ? "hour" : "hours"}`), d && u.push(`${d} ${d === 1 ? "minute" : "minutes"}`), !o && c && u.push(`${c} ${c === 1 ? "second" : "seconds"}`), l + (u.join(" ") || "0 seconds");
    }
    const h = [];
    return o && h.push(`${o}h`), d && h.push(`${d}m`), !o && c && h.push(`${c}s`), l + (h.join(" ") || "0s");
  };
}
function Fe({ locale: s = void 0, decimals: r, ...e } = {}) {
  const t = { ...e };
  r != null && (t.minimumFractionDigits = r, t.maximumFractionDigits = r);
  const i = new Intl.NumberFormat(s, t);
  return ({ value: n, td: l }) => {
    if (l && l.classList.add("sg-renderer-number"), D(n)) return "";
    const a = Number(n);
    return Number.isFinite(a) ? i.format(a) : String(n);
  };
}
function Be({ locale: s = void 0, compactDisplay: r = "short", maximumFractionDigits: e = 1 } = {}) {
  const t = new Intl.NumberFormat(s, {
    notation: "compact",
    compactDisplay: r,
    maximumFractionDigits: e
  });
  return ({ value: i, td: n }) => {
    if (n && n.classList.add("sg-renderer-number"), D(i)) return "";
    const l = Number(i);
    return Number.isFinite(l) ? t.format(l) : String(i);
  };
}
function $e({ binary: s = !0, decimals: r = 1, locale: e = void 0 } = {}) {
  const t = s ? 1024 : 1e3, i = s ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"], n = new Intl.NumberFormat(e, {
    minimumFractionDigits: r,
    maximumFractionDigits: r
  });
  return ({ value: l, td: a }) => {
    if (a && a.classList.add("sg-renderer-number"), D(l)) return "";
    let o = Number(l);
    if (!Number.isFinite(o)) return String(l);
    const d = o < 0 ? "-" : "";
    o = Math.abs(o);
    let c = 0;
    for (; o >= t && c < i.length - 1; )
      o /= t, c += 1;
    const h = c === 0 ? String(Math.round(o)) : n.format(o);
    return `${d}${h} ${i[c]}`;
  };
}
const Ut = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on"]);
function Xt(s) {
  return s === !0 || s === 1 ? !0 : s == null || s === "" || s === !1 || s === 0 ? !1 : Ut.has(String(s).toLowerCase());
}
const Yt = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>', Qt = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
function ze({
  truthy: s = Xt,
  nullLabel: r = "—",
  falseStyle: e = "icon"
  // 'icon' | 'hidden'
} = {}) {
  return ({ value: t }) => {
    if (t == null || t === "")
      return m("span", { class: "sg-renderer-bool-null" }, document.createTextNode(r));
    if (s(t)) {
      const n = m("span", { class: "sg-renderer-bool is-true", "aria-label": "true" });
      return n.innerHTML = Yt, n;
    }
    if (e === "hidden") return "";
    const i = m("span", { class: "sg-renderer-bool is-false", "aria-label": "false" });
    return i.innerHTML = Qt, i;
  };
}
const Zt = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>', Jt = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.7 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>', es = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M64 256a32 32 0 1 0 0-64H384V160c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9S384 364.9 384 352V320H64z"/></svg>';
function He({
  style: s = "percent",
  // 'percent' | 'number' | 'currency'
  decimals: r = 1,
  locale: e = void 0,
  currency: t = "USD",
  inverted: i = !1,
  showSign: n = !0
} = {}) {
  let l;
  return s === "currency" ? l = new Intl.NumberFormat(e, {
    style: "currency",
    currency: t,
    minimumFractionDigits: r,
    maximumFractionDigits: r,
    signDisplay: n ? "always" : "auto"
  }) : l = new Intl.NumberFormat(e, {
    minimumFractionDigits: r,
    maximumFractionDigits: r,
    signDisplay: n ? "always" : "auto"
  }), ({ value: a, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), D(a)) return "";
    const d = Number(a);
    if (!Number.isFinite(d)) return String(a);
    let c = "is-flat", h = es;
    const u = !i;
    d > 0 ? (c = u ? "is-up" : "is-down", h = Zt) : d < 0 && (c = u ? "is-down" : "is-up", h = Jt);
    const p = m("span", { class: `sg-renderer-delta ${c}` }), g = m("span", { class: "sg-renderer-delta-icon", "aria-hidden": "true" });
    g.innerHTML = h;
    const _ = s === "percent" ? `${l.format(d)}%` : l.format(d);
    return p.append(g), p.append(m("span", { class: "sg-renderer-delta-value" }, document.createTextNode(_))), p;
  };
}
function Ge({ chars: s = null } = {}) {
  return ({ value: r, td: e }) => {
    if (D(r)) return "";
    const t = String(r);
    let i = t, n = !1;
    return s && t.length > s && (i = t.slice(0, s) + "…", n = !0), e && (e.classList.add("sg-renderer-truncate"), e.setAttribute("title", t)), n ? i : t;
  };
}
const fe = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>', ts = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';
function Oe({ position: s = "after" } = {}) {
  return ({ value: r }) => {
    if (D(r)) return "";
    const e = String(r), t = m("span", { class: "sg-renderer-copyable" }), i = m("span", { class: "sg-renderer-copyable-value" }, document.createTextNode(e)), n = m("button", {
      type: "button",
      class: "sg-renderer-copyable-btn",
      title: "Copy",
      "aria-label": `Copy ${e}`
    });
    return n.innerHTML = fe, n.addEventListener("click", async (l) => {
      l.stopPropagation(), l.preventDefault();
      try {
        navigator.clipboard?.writeText ? await navigator.clipboard.writeText(e) : ss(e), n.innerHTML = ts, n.classList.add("is-copied"), setTimeout(() => {
          n.innerHTML = fe, n.classList.remove("is-copied");
        }, 1200);
      } catch {
      }
    }), s === "before" ? t.append(n, i) : t.append(i, n), t;
  };
}
function ss(s) {
  const r = document.createElement("textarea");
  r.value = s, r.style.position = "fixed", r.style.left = "-9999px", document.body.appendChild(r), r.select();
  try {
    document.execCommand("copy");
  } catch {
  }
  document.body.removeChild(r);
}
function Ke({
  size: s = 36,
  rounded: r = "sm",
  // 'sm' = 4px, 'lg' = 8px, 'full' = circle, 'none'
  altField: e = "alt",
  clickToZoom: t = !1
} = {}) {
  const i = r === "full" ? "999px" : r === "lg" ? "8px" : r === "none" ? "0" : "4px";
  return ({ value: n, row: l }) => {
    if (D(n)) return "";
    const a = String(n), o = l?.[e] ?? "", d = m("img", {
      src: a,
      alt: o,
      class: "sg-renderer-image",
      width: String(s),
      height: String(s),
      style: `border-radius: ${i};`,
      loading: "lazy",
      decoding: "async"
    });
    return t && (d.style.cursor = "zoom-in", d.addEventListener("click", (c) => {
      c.stopPropagation(), is(a, o);
    })), d;
  };
}
function is(s, r) {
  const e = m("div", { class: "sg-image-zoom" }), t = () => {
    e.remove(), document.removeEventListener("keydown", i);
  }, i = (n) => {
    n.key === "Escape" && t();
  };
  e.addEventListener("click", t), document.addEventListener("keydown", i), e.append(m("img", { src: s, alt: r || "", class: "sg-image-zoom-img" })), document.body.appendChild(e);
}
function qe({
  showLabel: s = !0,
  label: r = "value",
  // 'value' | 'name' | (value, row) => string
  shape: e = "circle",
  // 'circle' | 'square'
  size: t = 14
} = {}) {
  return ({ value: i, row: n }) => {
    if (D(i)) return "";
    const l = String(i).trim(), a = m("span", { class: "sg-renderer-swatch" }), o = m("span", {
      class: `sg-renderer-swatch-chip is-${e}`,
      style: `width: ${t}px; height: ${t}px; background: ${l};`,
      "aria-hidden": "true"
    });
    if (a.append(o), s) {
      const d = typeof r == "function" ? r(i, n) : r === "name" ? n?.name ?? l : l;
      a.append(m("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(d)));
    }
    return a;
  };
}
const ns = {
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  orange: "#f97316",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#6b7280"
};
function We({
  type: s = "line",
  // 'line' | 'area' | 'bar'
  width: r = 80,
  height: e = 24,
  color: t = "blue",
  // palette key OR raw CSS colour
  baseline: i = null,
  // null = auto-min, 0 = lock min at zero, N = lock at N
  showLast: n = !0
  // small dot on the last point (line / area only)
} = {}) {
  const l = ns[t] || t;
  return ({ value: a }) => {
    if (!Array.isArray(a) || a.length === 0) return "";
    const o = a.map(Number).filter((C) => Number.isFinite(C));
    if (o.length === 0) return "";
    const d = i ?? Math.min(...o), h = Math.max(...o, i ?? -1 / 0) - d || 1, u = 1.5, p = 2.5, g = r - u * 2, _ = e - p * 2, w = (C) => u + (o.length === 1 ? g / 2 : C / (o.length - 1) * g), y = (C) => p + _ - (C - d) / h * _;
    let v = "";
    if (s === "bar") {
      const b = Math.max(1, (g - (o.length - 1) * 1) / o.length);
      for (let x = 0; x < o.length; x++) {
        const L = o[x], T = u + x * (b + 1), M = y(L), I = p + _ - M;
        v += `<rect x="${T.toFixed(2)}" y="${M.toFixed(2)}" width="${b.toFixed(2)}" height="${I.toFixed(2)}" fill="${l}"/>`;
      }
    } else {
      let C = "";
      for (let b = 0; b < o.length; b++)
        C += `${b === 0 ? "M" : "L"} ${w(b).toFixed(2)} ${y(o[b]).toFixed(2)} `;
      if (s === "area") {
        const b = C + ` L ${w(o.length - 1).toFixed(2)} ${(p + _).toFixed(2)} L ${w(0).toFixed(2)} ${(p + _).toFixed(2)} Z`;
        v += `<path d="${b}" fill="${l}" fill-opacity="0.18" stroke="none"/>`;
      }
      if (v += `<path d="${C.trim()}" fill="none" stroke="${l}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`, n) {
        const b = w(o.length - 1), x = y(o[o.length - 1]);
        v += `<circle cx="${b.toFixed(2)}" cy="${x.toFixed(2)}" r="1.8" fill="${l}"/>`;
      }
    }
    return `<svg class="sg-renderer-sparkline is-${s}" viewBox="0 0 ${r} ${e}" width="${r}" height="${e}" preserveAspectRatio="none" aria-hidden="true">` + v + "</svg>";
  };
}
function rs(s) {
  if (typeof s != "string") return null;
  let r = s.trim().replace(/^#/, "");
  return r.length === 3 && (r = r.split("").map((e) => e + e).join("")), /^[0-9a-f]{6}$/i.test(r) ? [parseInt(r.slice(0, 2), 16), parseInt(r.slice(2, 4), 16), parseInt(r.slice(4, 6), 16)] : null;
}
function ls(s, r, e) {
  const t = (i) => Math.max(0, Math.min(255, Math.round(i))).toString(16).padStart(2, "0");
  return `#${t(s)}${t(r)}${t(e)}`;
}
function as(s, r, e) {
  return [s[0] + (r[0] - s[0]) * e, s[1] + (r[1] - s[1]) * e, s[2] + (r[2] - s[2]) * e];
}
function os([s, r, e]) {
  return 0.299 * s + 0.587 * r + 0.114 * e >= 145;
}
function je({
  min: s = 0,
  max: r = 100,
  colors: e = ["#dcfce7", "#fef3c7", "#fecaca"],
  inverted: t = !1,
  showValue: i = !0,
  format: n = null
  // (value) => string for custom labels
} = {}) {
  const l = e.map(rs).filter(Boolean);
  if (l.length < 2) throw new Error("heatmap: need at least two valid hex colours");
  return ({ value: a, td: o }) => {
    if (o && o.classList.add("sg-renderer-heatmap"), D(a)) return "";
    let d = Number(a);
    if (!Number.isFinite(d)) return String(a);
    let c = r - s === 0 ? 0.5 : (d - s) / (r - s);
    c = Math.max(0, Math.min(1, c)), t && (c = 1 - c);
    const h = c * (l.length - 1), u = Math.min(l.length - 2, Math.floor(h)), p = h - u, g = as(l[u], l[u + 1], p);
    return o && (o.style.backgroundColor = ls(...g), o.style.color = os(g) ? "#111827" : "#ffffff"), i ? typeof n == "function" ? n(a) : String(a) : "";
  };
}
const ds = {
  // Credit card: 16 digits grouped 4-4-4-4, last 4 visible. Handles 13-19
  // digit lengths gracefully (Amex 15, others 16). Non-digits are stripped.
  "cc-last4": (s, r) => ge(s.replace(/\D/g, ""), 4, 4, r, " "),
  // BIN + last4: show the first 6 + last 4, mask the middle (PCI-friendly).
  "cc-bin-last4": (s, r) => ge(s.replace(/\D/g, ""), 4, 4, r, " ", 6),
  // Phone: show the last 4 digits, mask the rest as a single bullet
  // block ("•••••• 1234"). Sidesteps the country-specific 3-3-4 / 4-3-3
  // grouping ambiguity — register your own variant if you need a
  // region-specific layout.
  "phone-last4": (s, r) => {
    const e = s.replace(/\D/g, "");
    return e ? e.length <= 4 ? e : r.repeat(e.length - 4) + " " + e.slice(-4) : s;
  },
  // Email: show first char + domain ("a••••@example.com").
  email: (s, r) => {
    const e = String(s).match(/^([^@\s]+)(@.+)$/);
    return e ? e[1][0] + r.repeat(Math.max(1, e[1].length - 1)) + e[2] : s;
  },
  // SSN / ABN-style: show last 4.
  last4: (s, r) => cs(s, 4, r)
};
function cs(s, r, e) {
  const t = String(s);
  return t.length <= r ? t : e.repeat(t.length - r) + t.slice(-r);
}
function ge(s, r, e, t, i, n = 0) {
  if (!s) return "";
  const l = s.length, a = s.split("").map((d, c) => c < n || c >= l - e ? d : t).join(""), o = [];
  for (let d = a.length; d > 0; d -= r)
    o.unshift(a.slice(Math.max(0, d - r), d));
  return o.join(i);
}
const us = /* @__PURE__ */ new Set(["cc-last4", "cc-bin-last4", "phone-last4", "last4"]);
function Ue({
  format: s = null,
  showFirst: r = 0,
  showLast: e = 4,
  char: t = "•",
  align: i = null
  // 'left' | 'right' | null (auto)
} = {}) {
  const n = s ? ds[s] : null, l = s ? us.has(s) : !1, a = i === "right" || i !== "left" && l;
  return ({ value: o, td: d }) => {
    if (d && a && d.classList.add("sg-renderer-mask-numeric"), D(o)) return "";
    const c = String(o);
    if (n) return n(c, t);
    const h = c.slice(0, r), u = e > 0 ? c.slice(-e) : "", p = Math.max(0, c.length - r - e);
    return h + t.repeat(p) + u;
  };
}
function Xe({
  query: s = null,
  caseSensitive: r = !1,
  className: e = "sg-renderer-mark"
} = {}) {
  return ({ value: t, api: i }) => {
    if (D(t)) return "";
    const n = String(t), l = s != null ? String(s) : i?.getQuickFilter?.() || "";
    return l ? hs(n, l, r, e) : document.createTextNode(n);
  };
}
function hs(s, r, e, t) {
  const i = e ? s : s.toLowerCase(), n = e ? r : r.toLowerCase(), l = document.createElement("span");
  let a = 0;
  for (; a < s.length; ) {
    const o = i.indexOf(n, a);
    if (o === -1) {
      l.appendChild(document.createTextNode(s.slice(a)));
      break;
    }
    o > a && l.appendChild(document.createTextNode(s.slice(a, o)));
    const d = document.createElement("mark");
    d.className = t, d.textContent = s.slice(o, o + r.length), l.appendChild(d), a = o + r.length;
  }
  return l;
}
function Ye({ lines: s = null, separator: r = `
` } = {}) {
  return ({ value: e, td: t }) => {
    if (D(e)) return "";
    const i = String(e), n = r === `
` ? i : i.split(r).join(`
`);
    if (t) {
      t.classList.add("sg-renderer-multiline"), t.setAttribute("title", n);
      const l = t.parentElement;
      l && l.tagName === "TR" && l.classList.add("sg-has-multiline");
    }
    if (s != null && s > 0) {
      const l = document.createElement("div");
      return l.className = "sg-renderer-multiline-clamp", l.style.setProperty("--sg-clamp", String(s)), l.textContent = n, l;
    }
    return n;
  };
}
function ae(s) {
  if (s == null || !Number.isFinite(Number(s))) return "";
  let r = Number(s);
  if (r < 1024) return `${r} B`;
  const e = ["KB", "MB", "GB", "TB"];
  let t = -1;
  do
    r /= 1024, t++;
  while (r >= 1024 && t < e.length - 1);
  return `${r.toFixed(r < 10 ? 1 : 0)} ${e[t]}`;
}
const ps = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "ico"]);
function F(s) {
  if (!s) return !1;
  if (typeof s.content_type == "string" && s.content_type.startsWith("image/")) return !0;
  const r = String(s.filename || "").split(".").pop()?.toLowerCase();
  return r ? ps.has(r) : !1;
}
const Z = {
  pdf: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM88 304h32c30.9 0 56 25.1 56 56s-25.1 56-56 56h-16v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V320c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24h-16v48h16zm72-64c0-8.8 7.2-16 16-16h24c26.5 0 48 21.5 48 48v48c0 26.5-21.5 48-48 48H208c-8.8 0-16-7.2-16-16V320zm32 16v80h8c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16h-8z"/></svg>',
  doc: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM104 280c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24zm0 80c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24z"/></svg>',
  sheet: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zm192 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16v128c0 8.8-7.2 16-16 16H112c-8.8 0-16-7.2-16-16V272c0-8.8 7.2-16 16-16zm16 32v32h48V288H128zm80 0v32h48V288H208zm-80 64v32h48V352H128zm80 0v32h48V352H208z"/></svg>',
  zip: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H160V64H224V0H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM160 64v32h64V64H160zm0 96v32h64V160H160zm0 96v32h64V256H160zm0 96c-17.7 0-32 14.3-32 32v48c0 8.8 7.2 16 16 16h96c8.8 0 16-7.2 16-16V384c0-17.7-14.3-32-32-32H160z"/></svg>',
  audio: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM160 288c-8.8 0-16 7.2-16 16v89c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V362.5l64-21.3V388c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V304c0-5.1-2.5-10-6.6-13s-9.5-3.9-14.5-2.3L160 309.8V304c0-8.8-7.2-16-16-16z"/></svg>',
  video: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM64 288c0-17.7 14.3-32 32-32H224c17.7 0 32 14.3 32 32V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V288zm259.7-11.3c5.2 2.7 8.3 8 8.3 13.8v123c0 5.8-3.2 11.2-8.3 13.8s-11.3 2.3-16.1-.9L256 392.7V312l51.5-32.6c4.9-3.1 11-3.4 16.1-.8z"/></svg>',
  code: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM200.4 281.7c5.8 6.7 5.2 16.8-1.5 22.6L165.5 333l33.4 28.7c6.7 5.8 7.4 15.9 1.6 22.6s-15.9 7.4-22.6 1.6l-48-41.2c-3.5-3-5.5-7.4-5.5-12s2-9 5.5-12l48-41.2c6.7-5.8 16.8-5.2 22.6 1.5zM226 281.7c5.8-6.7 15.9-7.4 22.6-1.5l48 41.2c3.5 3 5.5 7.4 5.5 12s-2 9-5.5 12l-48 41.2c-6.7 5.8-16.8 5.2-22.6-1.6s-5.2-16.8 1.5-22.6L260.5 333 227.5 304.4c-6.7-5.8-7.4-15.9-1.5-22.6z"/></svg>',
  file: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0z"/></svg>'
}, Qe = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>', Ze = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>', fs = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>', gs = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 105.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>', ms = /* @__PURE__ */ new Set(["mp3", "wav", "flac", "m4a", "ogg", "aac", "opus"]), _s = /* @__PURE__ */ new Set(["mp4", "mov", "webm", "mkv", "avi", "m4v"]);
function Je(s) {
  const r = String(s?.content_type || "").toLowerCase(), e = String(s?.filename || "").split(".").pop()?.toLowerCase() || "";
  return r.includes("pdf") || e === "pdf" ? "pdf" : r.startsWith("audio/") || ms.has(e) ? "audio" : r.startsWith("video/") || _s.has(e) ? "video" : r.includes("zip") || ["zip", "tar", "gz", "7z", "rar"].includes(e) ? "zip" : r.includes("sheet") || r.includes("excel") || r.includes("csv") || ["xls", "xlsx", "csv", "numbers"].includes(e) ? "sheet" : r.includes("word") || r.includes("document") || ["doc", "docx", "txt", "md", "rtf"].includes(e) ? "doc" : ["js", "ts", "rb", "py", "go", "rs", "java", "json", "xml", "html", "css", "sh", "sql"].includes(e) ? "code" : "file";
}
function ee(s) {
  if (s == null || s === "") return [];
  let r = s;
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
    preview_url: e.preview_url || e.previewUrl || (F(e) ? e.url : null),
    thumb_url: e.thumb_url || e.thumbUrl || (F(e) ? e.url : null),
    signed_id: e.signed_id || e.signedId || null
  }));
}
function et({
  thumbSize: s = 28,
  maxThumbs: r = 4,
  empty: e = "",
  editable: t = !1,
  accept: i = null,
  multiple: n = !0,
  download: l = !1,
  onUpload: a = null,
  onRemove: o = null
} = {}) {
  return (d) => {
    const { value: c, td: h, row: u, col: p } = d, g = ee(c);
    if (h && (h.classList.add("sg-renderer-attachments-cell"), h.dataset.attachmentCount = String(g.length), h._sgAttachments = g), g.length === 0 && !t)
      return e ? document.createTextNode(e) : "";
    const _ = m("div", { class: "sg-renderer-attachments", role: "group" }), w = g.slice(0, r), y = Math.max(0, g.length - w.length);
    if (w.forEach((v) => _.append(vs(v, s, g, l))), y > 0) {
      const v = m(
        "span",
        { class: "sg-attach-more", title: `${y} more` },
        document.createTextNode(`+${y}`)
      );
      v.addEventListener("click", (C) => {
        C.stopPropagation(), tt(g, g[w.length]);
      }), _.append(v);
    }
    if (t) {
      const v = m("button", {
        type: "button",
        class: "sg-attach-add",
        title: "Add files",
        "aria-label": "Add attachments",
        "data-sg-attach": "add"
      });
      v.innerHTML = Qe, v.addEventListener("click", (C) => {
        C.stopPropagation(), me(h, d, { thumbSize: s, accept: i, multiple: n, onUpload: a, onRemove: o });
      }), _.append(v), ws(h, d, { onUpload: a }), h.addEventListener("dblclick", (C) => {
        C._sgAttachmentHandled || (C._sgAttachmentHandled = !0, C.stopPropagation(), me(h, d, { thumbSize: s, accept: i, multiple: n, onUpload: a, onRemove: o }));
      }, { once: !1 });
    }
    return _;
  };
}
function vs(s, r, e, t) {
  const i = m("button", {
    type: "button",
    class: "sg-attach-thumb",
    title: `${s.filename}${s.byte_size != null ? " · " + ae(s.byte_size) : ""}`,
    "data-attachment-id": s.id,
    "data-attachment-kind": F(s) ? "image" : "file",
    "aria-label": s.filename,
    style: `width: ${r}px; height: ${r}px;`
  });
  if (F(s) && s.thumb_url)
    i.append(m("img", {
      src: s.thumb_url,
      alt: s.filename,
      loading: "lazy",
      decoding: "async",
      width: String(r),
      height: String(r)
    }));
  else {
    const n = Je(s), l = m("span", { class: `sg-attach-icon is-${n}`, "aria-hidden": "true" });
    l.innerHTML = Z[n] || Z.file, i.append(l);
  }
  return i.addEventListener("click", (n) => {
    if (n.stopPropagation(), F(s)) {
      const l = e.filter(F);
      tt(l.length ? l : [s], s);
    } else if (t) {
      const l = document.createElement("a");
      l.href = s.url, l.download = s.filename, document.body.appendChild(l), l.click(), l.remove();
    } else
      window.open(s.url, "_blank", "noopener,noreferrer");
  }), i;
}
let O = null;
function tt(s, r) {
  ie();
  const e = s.filter(F);
  if (e.length === 0) return;
  let t = Math.max(0, e.findIndex((p) => p.id === r?.id));
  t < 0 && (t = 0);
  const i = m("div", { class: "sg-image-zoom sg-attach-lightbox", role: "dialog", "aria-modal": "true" }), n = m("div", { class: "sg-attach-lightbox-stage" }), l = m("img", { class: "sg-image-zoom-img", alt: "" }), a = m("div", { class: "sg-attach-lightbox-caption" }), o = m("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-prev",
    "aria-label": "Previous attachment"
  }), d = m("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-next",
    "aria-label": "Next attachment"
  });
  o.innerHTML = fs, d.innerHTML = gs;
  function c() {
    const p = e[t];
    l.src = p.preview_url || p.url, l.alt = p.filename, a.textContent = `${p.filename}${p.byte_size != null ? " · " + ae(p.byte_size) : ""} (${t + 1}/${e.length})`, o.style.visibility = e.length > 1 ? "visible" : "hidden", d.style.visibility = e.length > 1 ? "visible" : "hidden";
  }
  function h(p) {
    t = (t + p + e.length) % e.length, c();
  }
  function u(p) {
    p.key === "Escape" ? ie() : p.key === "ArrowLeft" ? h(-1) : p.key === "ArrowRight" && h(1);
  }
  i.addEventListener("click", (p) => {
    (p.target === i || p.target === n) && ie();
  }), o.addEventListener("click", (p) => {
    p.stopPropagation(), h(-1);
  }), d.addEventListener("click", (p) => {
    p.stopPropagation(), h(1);
  }), document.addEventListener("keydown", u), n.append(o, l, d), i.append(n, a), document.body.appendChild(i), O = { overlay: i, onKey: u }, c();
}
function ie() {
  O && (document.removeEventListener("keydown", O.onKey), O.overlay.remove(), O = null);
}
let X = null;
function ws(s, r, { onUpload: e }) {
  s._sgAttachDropBound || (s._sgAttachDropBound = !0, s.addEventListener("dragover", (t) => {
    t.dataTransfer?.types?.includes("Files") && (t.preventDefault(), s.classList.add("is-drop-target"));
  }), s.addEventListener("dragleave", () => s.classList.remove("is-drop-target")), s.addEventListener("drop", async (t) => {
    if (!t.dataTransfer?.files?.length) return;
    t.preventDefault(), s.classList.remove("is-drop-target");
    const i = Array.from(t.dataTransfer.files);
    await Y(s, r, i, e);
  }));
}
function me(s, r, e) {
  q();
  const { thumbSize: t, accept: i, multiple: n, onUpload: l, onRemove: a } = e, o = s._sgAttachments || ee(r.value), d = m("div", { class: "sg-attach-editor", role: "dialog", "aria-modal": "false" });
  d.addEventListener("mousedown", (v) => v.stopPropagation());
  const c = m("div", { class: "sg-attach-editor-header" }, [
    m(
      "span",
      { class: "sg-attach-editor-title" },
      document.createTextNode(o.length === 1 ? "1 attachment" : `${o.length} attachments`)
    ),
    (() => {
      const v = m("button", {
        type: "button",
        class: "sg-attach-editor-close",
        "aria-label": "Close"
      });
      return v.innerHTML = Ze, v.addEventListener("click", q), v;
    })()
  ]), h = m("div", { class: "sg-attach-editor-grid" });
  function u() {
    const v = s._sgAttachments || [];
    h.replaceChildren(), v.forEach((C) => h.append(bs(C, s, r, a, t))), c.firstChild.textContent = v.length === 1 ? "1 attachment" : `${v.length} attachments`;
  }
  u(), s._sgAttachRepaint = u;
  const p = m("label", { class: "sg-attach-dropzone", tabindex: "0" });
  p.innerHTML = `
    <span class="sg-attach-dropzone-icon" aria-hidden="true">${Qe}</span>
    <span class="sg-attach-dropzone-text">Drop files, paste, or <strong>browse</strong></span>
  `;
  const g = m("input", { type: "file", multiple: n ? "" : null, accept: i || null });
  g.style.display = "none", p.append(g), g.addEventListener("change", async () => {
    g.files?.length && (await Y(s, r, Array.from(g.files), l), g.value = "", u());
  }), p.addEventListener("dragover", (v) => {
    v.dataTransfer?.types?.includes("Files") && (v.preventDefault(), p.classList.add("is-drop-target"));
  }), p.addEventListener("dragleave", () => p.classList.remove("is-drop-target")), p.addEventListener("drop", async (v) => {
    v.dataTransfer?.files?.length && (v.preventDefault(), p.classList.remove("is-drop-target"), await Y(s, r, Array.from(v.dataTransfer.files), l), u());
  });
  function _(v) {
    const C = Array.from(v.clipboardData?.files || []);
    C.length !== 0 && (v.preventDefault(), Y(s, r, C, l).then(u));
  }
  d.addEventListener("paste", _);
  function w(v) {
    v.key === "Escape" && q();
  }
  function y(v) {
    !d.contains(v.target) && !s.contains(v.target) && q();
  }
  document.addEventListener("keydown", w), setTimeout(() => document.addEventListener("mousedown", y), 0), d.append(c, h, p), document.body.appendChild(d), st(d, s), p.focus(), X = { pop: d, onKey: w, onDocClick: y, anchor: s };
}
function q() {
  if (!X) return;
  const { pop: s, onKey: r, onDocClick: e, anchor: t } = X;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), s.remove(), t && delete t._sgAttachRepaint, X = null;
}
function bs(s, r, e, t, i) {
  const n = m("div", { class: "sg-attach-editor-tile", "data-attachment-id": s.id }), l = m("div", {
    class: "sg-attach-editor-preview",
    style: `width: ${i * 2}px; height: ${i * 2}px;`
  });
  if (F(s) && s.thumb_url)
    l.append(m("img", {
      src: s.thumb_url,
      alt: s.filename,
      width: String(i * 2),
      height: String(i * 2)
    }));
  else {
    const d = Je(s), c = m("span", { class: `sg-attach-icon is-${d}`, "aria-hidden": "true" });
    c.innerHTML = Z[d] || Z.file, l.append(c);
  }
  const a = m("div", { class: "sg-attach-editor-meta" }, [
    m(
      "div",
      { class: "sg-attach-editor-name", title: s.filename },
      document.createTextNode(s.filename)
    ),
    m(
      "div",
      { class: "sg-attach-editor-size" },
      document.createTextNode(s.byte_size != null ? ae(s.byte_size) : "")
    )
  ]), o = m("button", {
    type: "button",
    class: "sg-attach-editor-remove",
    title: "Remove",
    "aria-label": `Remove ${s.filename}`,
    "data-sg-attach": "remove",
    "data-attachment-id": s.id
  });
  return o.innerHTML = Ze, o.addEventListener("click", async (d) => {
    d.stopPropagation(), await ys(r, e, s, t);
  }), n.append(l, a, o), n;
}
function st(s, r) {
  const e = r.getBoundingClientRect();
  s.style.position = "fixed", s.style.left = `${Math.max(8, Math.min(window.innerWidth - 360, e.left))}px`, window.innerHeight - e.bottom > 280 ? s.style.top = `${e.bottom + 4}px` : s.style.top = `${Math.max(8, e.top - s.offsetHeight - 4)}px`;
}
async function Y(s, r, e, t) {
  if (e.length) {
    s.classList.add("is-uploading");
    try {
      let i;
      if (typeof t == "function") {
        const n = await t(e, r);
        i = Array.isArray(n) ? n : (s._sgAttachments || []).concat(_e(e));
      } else
        i = (s._sgAttachments || []).concat(_e(e));
      it(s, r, ee(i));
    } finally {
      s.classList.remove("is-uploading");
    }
  }
}
async function ys(s, r, e, t) {
  let i;
  if (typeof t == "function") {
    const n = await t(e, r);
    i = Array.isArray(n) ? n : (s._sgAttachments || []).filter((l) => l.id !== e.id);
  } else
    i = (s._sgAttachments || []).filter((n) => n.id !== e.id);
  it(s, r, ee(i));
}
function _e(s) {
  return s.map((r, e) => ({
    id: `local_${Date.now()}_${e}`,
    filename: r.name,
    url: URL.createObjectURL(r),
    content_type: r.type || "",
    byte_size: r.size,
    preview_url: r.type?.startsWith("image/") ? URL.createObjectURL(r) : null,
    thumb_url: r.type?.startsWith("image/") ? URL.createObjectURL(r) : null
  }));
}
function it(s, r, e) {
  const { row: t, col: i, api: n } = r;
  t && i?.field != null && (t[i.field] = e), s._sgAttachments = e, n?.applyTransaction ? n.applyTransaction({ update: [t] }) : n?.refreshCells && n.refreshCells({ rowIds: [t?.id ?? t?._sg_id] }), s._sgAttachRepaint && s._sgAttachRepaint();
}
const Cs = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"], nt = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory"
};
function Ss(s) {
  if (s == null || s === "") return null;
  if (typeof s == "string") return { _raw: s };
  if (typeof s != "object") return null;
  const r = s.state ? String(s.state).trim().toUpperCase() : "";
  return {
    address1: s.address1 ? String(s.address1) : "",
    address2: s.address2 ? String(s.address2) : "",
    address3: s.address3 ? String(s.address3) : "",
    suburb: s.suburb ? String(s.suburb) : "",
    state: r,
    postcode: s.postcode != null ? String(s.postcode) : "",
    country: s.country ? String(s.country) : ""
  };
}
function xs(s) {
  if (!s || s._raw) return s?._raw || "";
  const r = [s.address1, s.address2, s.address3].filter(Boolean), e = [s.suburb, s.state, s.postcode].filter(Boolean).join(" ");
  return e && r.push(e), s.country && s.country.toLowerCase() !== "australia" && r.push(s.country), r.join(`
`);
}
function rt({ editable: s = !0, empty: r = "" } = {}) {
  return (e) => {
    const { value: t, td: i } = e, n = Ss(t);
    if (i && (i.classList.add("sg-renderer-address-au-cell"), i._sgAddress = n), !n) return r ? document.createTextNode(r) : "";
    s && i && !i._sgAddressEditBound && (i._sgAddressEditBound = !0, i.addEventListener("dblclick", (d) => {
      d._sgAddressHandled || (d._sgAddressHandled = !0, d.stopPropagation(), Ls(i, e));
    }));
    const l = m("div", {
      class: "sg-renderer-address-au",
      title: xs(n)
    });
    if (n._raw)
      return l.append(document.createTextNode(n._raw)), l;
    const a = [n.address1, n.address2].filter(Boolean).join(", "), o = n.suburb || n.state || n.postcode;
    return a && l.append(m("span", { class: "sg-address-au-street" }, document.createTextNode(a))), a && o && l.append(m("span", { class: "sg-address-au-sep" }, document.createTextNode(", "))), n.suburb && l.append(document.createTextNode(n.suburb)), n.state && (n.suburb && l.append(document.createTextNode(" ")), l.append(m("span", {
      class: `sg-address-au-state is-${n.state.toLowerCase()}`,
      title: nt[n.state] || n.state
    }, document.createTextNode(n.state)))), n.postcode && ((n.suburb || n.state) && l.append(document.createTextNode(" ")), l.append(m(
      "span",
      { class: "sg-address-au-postcode" },
      document.createTextNode(n.postcode)
    ))), n.country && n.country.toLowerCase() !== "australia" && (l.append(document.createTextNode(" ")), l.append(m(
      "span",
      { class: "sg-address-au-country" },
      document.createTextNode(n.country)
    ))), l;
  };
}
let Q = null;
function Ls(s, r) {
  G();
  const e = s._sgAddress && !s._sgAddress._raw ? { ...s._sgAddress } : { address1: "", address2: "", address3: "", suburb: "", state: "", postcode: "", country: "Australia" };
  e.country || (e.country = "Australia");
  const t = m("div", { class: "sg-address-au-editor", role: "dialog", "aria-modal": "false" });
  t.addEventListener("mousedown", (A) => A.stopPropagation());
  const i = m("div", { class: "sg-address-au-editor-header" });
  i.append(
    m("span", { class: "sg-address-au-editor-title" }, document.createTextNode("Edit address"))
  );
  const n = m("form", { class: "sg-address-au-editor-form", novalidate: "novalidate" });
  function l({ label: A, name: N, type: B = "text", value: mt = "", maxlength: _t, inputmode: vt, placeholder: wt, autocomplete: bt }) {
    const te = m("label", { class: "sg-address-au-editor-field", "data-field": N });
    te.append(m("span", { class: "sg-address-au-editor-label" }, document.createTextNode(A)));
    const ce = m("input", {
      type: B,
      name: N,
      value: mt || "",
      maxlength: _t || null,
      inputmode: vt || null,
      placeholder: wt || null,
      autocomplete: bt || null,
      class: "sg-address-au-editor-input"
    });
    return te.append(ce), { wrap: te, input: ce };
  }
  const a = l({
    label: "Address line 1",
    name: "address1",
    value: e.address1,
    placeholder: "12 Smith Street",
    autocomplete: "address-line1"
  }), o = l({
    label: "Address line 2",
    name: "address2",
    value: e.address2,
    placeholder: "Unit / suite (optional)",
    autocomplete: "address-line2"
  }), d = m("div", { class: "sg-address-au-editor-line3-wrap" }), c = l({
    label: "Address line 3",
    name: "address3",
    value: e.address3,
    placeholder: "Level / building (optional)",
    autocomplete: "address-line3"
  });
  d.append(c.wrap);
  const h = m("button", {
    type: "button",
    class: "sg-address-au-editor-add-line"
  }, document.createTextNode("+ Add another line"));
  function u() {
    const A = !!(o.input.value.trim() || c.input.value.trim());
    d.hidden = !A, h.hidden = A;
  }
  o.input.addEventListener("input", u), h.addEventListener("click", () => {
    d.hidden = !1, h.hidden = !0, c.input.focus();
  });
  const p = l({
    label: "Suburb",
    name: "suburb",
    value: e.suburb,
    placeholder: "Bondi",
    autocomplete: "address-level2"
  }), g = m("label", { class: "sg-address-au-editor-field", "data-field": "state" });
  g.append(m("span", { class: "sg-address-au-editor-label" }, document.createTextNode("State")));
  const _ = m("select", {
    name: "state",
    class: "sg-address-au-editor-input sg-address-au-editor-state",
    autocomplete: "address-level1"
  });
  _.append(m("option", { value: "" }, document.createTextNode("—")));
  for (const A of Cs) {
    const N = m(
      "option",
      { value: A, selected: e.state === A ? "" : null },
      document.createTextNode(`${A} — ${nt[A]}`)
    );
    _.append(N);
  }
  g.append(_);
  const w = l({
    label: "Postcode",
    name: "postcode",
    type: "text",
    value: e.postcode,
    maxlength: 4,
    inputmode: "numeric",
    placeholder: "2026",
    autocomplete: "postal-code"
  });
  w.input.classList.add("sg-address-au-editor-postcode"), w.input.addEventListener("input", () => {
    w.input.value = w.input.value.replace(/\D/g, "").slice(0, 4);
  });
  const y = l({
    label: "Country",
    name: "country",
    value: e.country,
    autocomplete: "country-name"
  }), v = m("div", { class: "sg-address-au-editor-grid" });
  v.append(a.wrap), v.append(o.wrap, h), v.append(d), v.append(p.wrap, g, w.wrap), v.append(y.wrap);
  const C = m("div", { class: "sg-address-au-editor-footer" }), b = m(
    "button",
    { type: "button", class: "sg-address-au-editor-cancel" },
    document.createTextNode("Cancel")
  ), x = m(
    "button",
    { type: "submit", class: "sg-address-au-editor-save" },
    document.createTextNode("Save")
  );
  C.append(b, x), n.append(v, C), t.append(i, n);
  function L() {
    return {
      address1: a.input.value.trim(),
      address2: o.input.value.trim(),
      address3: d.hidden ? "" : c.input.value.trim(),
      suburb: p.input.value.trim(),
      state: _.value,
      postcode: w.input.value.trim(),
      country: y.input.value.trim() || "Australia"
    };
  }
  function T() {
    const A = L(), N = !A.address1 && !A.suburb && !A.state && !A.postcode;
    As(s, r, N ? null : A), G();
  }
  n.addEventListener("submit", (A) => {
    A.preventDefault(), T();
  }), b.addEventListener("click", () => G());
  function M(A) {
    A.key === "Escape" && (A.stopPropagation(), G());
  }
  function I(A) {
    !t.contains(A.target) && !s.contains(A.target) && G();
  }
  document.addEventListener("keydown", M), setTimeout(() => document.addEventListener("mousedown", I), 0), document.body.appendChild(t), st(t, s), u(), a.input.focus(), a.input.select(), Q = { pop: t, onKey: M, onDocClick: I };
}
function G() {
  if (!Q) return;
  const { pop: s, onKey: r, onDocClick: e } = Q;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), s.remove(), Q = null;
}
function As(s, r, e) {
  const { row: t, col: i, api: n } = r, l = t && i?.field != null ? t[i.field] : null;
  t && i?.field != null && (t[i.field] = e), s._sgAddress = e, n?.applyTransaction ? n.applyTransaction({ update: [t] }) : n?.refreshCells && n.refreshCells({ rowIds: [t?.id ?? t?._sg_id] });
  const a = s.closest('[data-controller~="grid"]');
  a && a.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
    bubbles: !0,
    detail: { rowId: t?.id ?? t?._sg_id, colId: i?.field, oldValue: l, newValue: e }
  }));
}
function lt({ color: s = "green", showValue: r = !1 } = {}) {
  return ({ value: e }) => {
    let t = Number(e);
    Number.isFinite(t) || (t = 0), t = Math.max(0, Math.min(100, t));
    const i = m("div", { class: "sg-renderer-progress" }, [
      m("div", { class: `sg-renderer-progress-fill sg-fill-${s}`, style: `width: ${t}%;` })
    ]);
    return r ? m("div", { class: "sg-renderer-progress-wrap" }, [
      i,
      m("span", { class: "sg-renderer-progress-label" }, document.createTextNode(`${Math.round(t)}%`))
    ]) : i;
  };
}
const W = '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>';
function at({ max: s = 5, precision: r = 0.5 } = {}) {
  const e = r > 0 ? 1 / r : 2;
  return ({ value: t }) => {
    let i = parseFloat(t);
    Number.isFinite(i) || (i = 0), i = Math.max(0, Math.min(s, i)), i = Math.round(i * e) / e;
    const n = m("div", {
      class: "sg-renderer-stars",
      role: "img",
      "aria-label": `${i} out of ${s} stars`
    });
    for (let l = 1; l <= s; l++)
      if (i >= l)
        n.append(m("span", { class: "sg-renderer-star is-full", "aria-hidden": "true" }, W));
      else if (i > l - 1) {
        const a = Math.round((i - (l - 1)) * 100);
        n.append(m(
          "span",
          { class: "sg-renderer-star is-partial", "aria-hidden": "true" },
          `${W}<span class="sg-star-clip" style="width: ${a}%;">${W}</span>`
        ));
      } else
        n.append(m("span", { class: "sg-renderer-star is-empty", "aria-hidden": "true" }, W));
    return n;
  };
}
function ot({ separator: s = "," } = {}) {
  return ({ value: r }) => {
    if (D(r)) return "";
    const e = Array.isArray(r) ? r : String(r).split(s), t = m("div", { class: "sg-renderer-tags" });
    for (const i of e) {
      const n = String(i).trim();
      n && t.append(m("span", { class: "sg-renderer-tag" }, document.createTextNode(n)));
    }
    return t;
  };
}
function dt({ showCode: s = !0, fallback: r = null } = {}) {
  return ({ value: e }) => {
    if (D(e)) return "";
    const t = String(e).trim().toUpperCase();
    if (t.length !== 2 || !/^[A-Z]{2}$/.test(t))
      return r ?? document.createTextNode(String(e));
    const i = String.fromCodePoint(
      127462 + t.charCodeAt(0) - 65,
      127462 + t.charCodeAt(1) - 65
    ), n = m("span", { class: "sg-renderer-country" });
    return n.append(m("span", { class: "sg-renderer-flag", "aria-hidden": "true" }, document.createTextNode(i))), s && n.append(m("span", { class: "sg-renderer-country-code" }, document.createTextNode(t))), n;
  };
}
function Rs(s) {
  const r = String(s).replace(/\s+/g, "");
  if (r.length !== 11 || !/^\d{11}$/.test(r)) return !1;
  const e = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19], t = parseInt(r[0], 10) - 1 + r.slice(1);
  let i = 0;
  for (let n = 0; n < 11; n++) i += parseInt(t[n], 10) * e[n];
  return i % 89 === 0;
}
function Es(s) {
  const r = String(s).replace(/\D/g, "");
  return r.length !== 11 ? String(s) : `${r.slice(0, 2)} ${r.slice(2, 5)} ${r.slice(5, 8)} ${r.slice(8)}`;
}
function ct() {
  return ({ value: s }) => {
    if (D(s)) return "";
    if (!Rs(s))
      return m("span", { class: "sg-renderer-invalid", title: "Invalid ABN" }, document.createTextNode(String(s)));
    const r = String(s).replace(/\s+/g, "");
    return m("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/ABN/View?id=${r}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(Es(s)));
  };
}
function ut({
  lookup: s = null,
  nameField: r = null,
  avatarField: e = null,
  windowKey: t = "__sgUsers",
  size: i = 22
} = {}) {
  return ({ value: n, row: l }) => {
    if (D(n)) return "";
    let a = null;
    if (typeof s == "function" && (a = s(n, l) || null), !a && r && (a = { name: l?.[r], avatarUrl: e ? l?.[e] : null }), !a && typeof window < "u" && window[t]) {
      const c = window[t];
      c instanceof Map ? a = c.get(n) || c.get(String(n)) || null : Array.isArray(c) && (a = c.find((h) => `${h.id}` == `${n}`) || null);
    }
    const o = a?.name ?? String(n), d = m("span", { class: "sg-renderer-avatar" });
    if (a?.avatarUrl)
      d.append(m("img", {
        class: "sg-renderer-avatar-img",
        src: a.avatarUrl,
        width: String(i),
        height: String(i),
        alt: ""
      }));
    else {
      const c = String(o).split(/\s+/).filter(Boolean).slice(0, 2).map((h) => h[0]?.toUpperCase() || "").join("");
      d.append(m("span", {
        class: "sg-renderer-avatar-initials",
        style: `width: ${i}px; height: ${i}px;`
      }, document.createTextNode(c)));
    }
    return d.append(m("span", { class: "sg-renderer-avatar-name" }, document.createTextNode(o))), d;
  };
}
const Ds = {
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
function Ms(s) {
  return String(s).toLowerCase().split(/[\s_-]+/).map((r) => r && r[0].toUpperCase() + r.slice(1)).join(" ");
}
function Ts(s = {}, r = null, e = {}) {
  const { titleCase: t = !0, defaultColor: i = "gray" } = e, n = {};
  for (const [a, o] of Object.entries(s)) n[String(a).toLowerCase()] = o;
  const l = {};
  if (r) for (const [a, o] of Object.entries(r)) l[String(a).toLowerCase()] = o;
  return ({ value: a }) => {
    if (D(a)) return "";
    const o = String(a).toLowerCase(), d = n[o] || i, c = t ? Ms(a) : String(a), h = m("span", { class: `sg-pill sg-pill-${d}` });
    if (r) {
      const u = l[o], p = u ? Ds[u] || u : null;
      if (p) {
        const g = m("span", { class: "sg-pill-icon", "aria-hidden": "true" });
        g.innerHTML = p, h.append(g);
      }
    }
    return h.append(m("span", { class: "sg-pill-label" }, document.createTextNode(c))), h;
  };
}
R("email", Ee());
R("url", De());
R("phone", Me());
R("currency", Te());
R("percent", Ve());
R("progress-bar", lt());
R("star-rating", at());
R("tags", ot());
R("country-flag", dt());
R("abn", ct());
R("avatar", ut());
R("date", Ie());
R("datetime", ke());
R("relative-time", Ne());
R("duration", Pe());
R("number", Fe());
R("compact-number", Be());
R("file-size", $e());
R("boolean", ze());
R("delta", He());
R("truncate", Ge());
R("copyable", Oe());
R("image", Ke());
R("color-swatch", qe());
R("sparkline", We());
R("heatmap-cell", je());
R("mask", Ue());
R("highlight", Xe());
R("multi-line", Ye());
R("attachments", et());
R("address-au", rt());
const Vs = {
  email: Ee,
  url: De,
  phone: Me,
  currency: Te,
  percent: Ve,
  progressBar: lt,
  starRating: at,
  tags: ot,
  countryFlag: dt,
  abn: ct,
  avatar: ut,
  statusPill: Ts,
  date: Ie,
  datetime: ke,
  relativeTime: Ne,
  duration: Pe,
  number: Fe,
  compactNumber: Be,
  fileSize: $e,
  boolean: ze,
  delta: He,
  truncate: Ge,
  copyable: Oe,
  image: Ke,
  colorSwatch: qe,
  sparkline: We,
  heatmap: je,
  mask: Ue,
  highlight: Xe,
  multiLine: Ye,
  attachments: et,
  addressAu: rt
}, Is = 32, ve = 100, j = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', ks = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>', Ns = /* @__PURE__ */ new Set([
  "color",
  "date",
  "datetime-local",
  "time",
  "month",
  "week"
]), we = [
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
class oe extends z {
  constructor() {
    super(...arguments);
    E(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    // ----- Row grouping + aggregation -----
    // A group is expanded if it has an explicit override; otherwise the
    // default-by-level applies (-1 = all, 0 = none, N = first N levels).
    E(this, "_isGroupExpanded", (e, t) => {
      if (this._groupExpanded.has(e)) return this._groupExpanded.get(e);
      const i = this.state.group.defaultExpanded;
      return i < 0 ? !0 : t < i;
    });
    // Delegated click handler for synthetic <th>s that don't have a
    // HeaderCellController of their own (pivot result cols today). Mirrors the
    // user-defined header path: bare click toggles sort, shift-click appends to
    // a multi-sort. Resize handles / filter icons short-circuit.
    E(this, "_onSynthHeaderClick", (e) => {
      const t = e.target.closest('th[data-synth="true"][data-sortable="true"]');
      if (!t || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const i = t.getAttribute("data-field");
      i && this.toggleSort(i, e.shiftKey === !0);
    });
    // ----- Right-click column menu -----
    //
    // contextmenu on a leaf <th> opens a fixed-positioned popup with quick
    // actions for that column: pin/unpin (left|right), autosize, group/pivot
    // toggles, aggregate selector, and hide. Synthetic columns (gutter,
    // checkbox, auto-Group, pivot result) suppress the menu — they're owned by
    // the grid and shouldn't be poked through this surface.
    E(this, "_onHeaderContextMenu", (e) => {
      const t = e.target.closest("th[data-field], th[data-header-cell-field-value]");
      if (!t) return;
      const i = t.getAttribute("data-field") || t.getAttribute("data-header-cell-field-value"), n = this._colByField(i);
      !n || n._isCheckbox || n._isRowNumber || n._isGroupCol || n._isPivot || (e.preventDefault(), this._showColumnMenu(n, e.clientX, e.clientY));
    });
    E(this, "_onDocMouseDownColumnMenu", (e) => {
      this._columnMenu && !this._columnMenu.contains(e.target) && this._closeColumnMenu();
    });
    E(this, "_onColumnMenuKey", (e) => {
      e.key === "Escape" && (e.stopPropagation(), this._closeColumnMenu());
    });
    E(this, "_onCellDragEnter", (e) => {
      if (!this._isFileDrag(e)) return;
      const t = this._dropTarget(e.target);
      t && (e.preventDefault(), this._dropHotCell && this._dropHotCell !== t.td && this._dropHotCell.classList.remove("sg-drop-target"), t.td.classList.add("sg-drop-target"), this._dropHotCell = t.td);
    });
    E(this, "_onCellDragOver", (e) => {
      if (!this._isFileDrag(e)) return;
      const t = this._dropTarget(e.target);
      t && (e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "copy"), this._dropHotCell !== t.td && (this._dropHotCell?.classList.remove("sg-drop-target"), t.td.classList.add("sg-drop-target"), this._dropHotCell = t.td));
    });
    E(this, "_onCellDragLeave", (e) => {
      this._dropHotCell && !this._dropHotCell.contains(e.relatedTarget) && (this._dropHotCell.classList.remove("sg-drop-target"), this._dropHotCell = null);
    });
    E(this, "_onCellDrop", (e) => {
      if (!this._isFileDrag(e)) return;
      const t = this._dropTarget(e.target);
      if (!t) return;
      e.preventDefault(), this._dropHotCell?.classList.remove("sg-drop-target"), this._dropHotCell = null;
      const i = Array.from(e.dataTransfer?.files || []);
      if (!i.length) return;
      const n = this.state.rowData.find((h) => this._rowId(h) === t.rowId), l = { rowId: t.rowId, colId: t.colId, files: i, row: n, dataTransfer: e.dataTransfer }, a = new CustomEvent("grid:fileAttached", { detail: l, bubbles: !0, cancelable: !0 });
      if (!this.element.dispatchEvent(a) || !n) return;
      const d = this.attachmentsFieldValue || t.colId, c = Array.isArray(n[d]) ? n[d].slice() : [];
      for (const h of i) {
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
      n[d] = c, this.scheduleRender("cells"), S(this.element, "grid:cellValueChanged", {
        rowId: t.rowId,
        colId: d,
        oldValue: null,
        newValue: c
      });
    });
    E(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
    });
    E(this, "_onCellMouseDown", (e) => {
      if (e.button !== 0) return;
      if (this.rowDragValue) {
        const n = e.target.closest?.('td[data-gutter="true"]');
        if (n) {
          const l = n.closest("tr");
          this._rowDragPending = { rowId: this._coerceRowId(l.dataset.rowId), x: e.clientX, y: e.clientY }, this._rowDragMoved = !1, document.addEventListener("mousemove", this._onRowDragMove);
          return;
        }
      }
      if (e.target.closest?.('[data-tree-toggle="true"]')) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const i = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : i ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), S(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    E(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const i = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      i && i.focus.rowId === t.rowId && i.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), S(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
    });
    E(this, "_onCellMouseUp", () => {
      this._cellDragging = !1, this._rowDragPending && (document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag && this._finishRowDrag(), this._rowDragPending = null);
    });
    // ----- Row drag-and-drop (reorder) with a ghost preview -----
    E(this, "_onRowDragMove", (e) => {
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
    E(this, "_onCopy", (e) => {
      if (this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && !this.element.contains(t)) return;
      const i = this._activeRect();
      if (!i) return;
      const n = this._cellRangeRows(i).map((l) => l.map((a) => String(a ?? "")).join("	")).join(`
`);
      n && (e.clipboardData?.setData("text/plain", n), e.preventDefault());
    });
    E(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && this.element.contains(t)) return;
      const i = e.key, n = e.metaKey || e.ctrlKey;
      if (n && i.toLowerCase() === "a") {
        e.preventDefault(), this.rowSelectionValue !== "" ? (this.clearCellSelection(), this.deselectAll(), this.selectAll()) : this._selectAllCells();
        return;
      }
      if (n) return;
      const l = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (l[i]) {
        e.preventDefault();
        const [a, o] = l[i];
        this._moveActiveCell(a, o, e.shiftKey);
        return;
      }
      if (i === "Tab") {
        e.preventDefault(), this._moveActiveCell(0, e.shiftKey ? -1 : 1, !1);
        return;
      }
      if (i === "Enter") {
        const a = this._activeCell();
        a && (e.preventDefault(), this.startEditingCell(a.rowId, a.colId));
        return;
      }
      if (i === "Escape") {
        this.clearCellSelection();
        return;
      }
      if (i === "Delete" || i === "Backspace") {
        this._clearSelectedCells() && e.preventDefault();
        return;
      }
      if (i.length === 1 && !e.altKey) {
        const a = this._activeCell();
        if (!a) return;
        const o = this._colByField(a.colId);
        if (!o || !o.editable) return;
        e.preventDefault(), this.startEditingCell(a.rowId, a.colId, i);
      }
    });
    E(this, "_onEditorKey", (e) => {
      this.state.editing && (e.key === "Enter" ? (e.preventDefault(), this.stopEditing(!1)) : e.key === "Escape" ? (e.preventDefault(), this.stopEditing(!0)) : e.key === "Tab" && (e.preventDefault(), this._tabToEditableCell(e.shiftKey ? -1 : 1)));
    });
    E(this, "_onEditorBlur", () => {
      this._navigatingEditor || this.state.editing && this.stopEditing(!1);
    });
    // ----- Tree data (self-referential parent_id) -----
    //
    // The model layer flattens the tree and hands us back a Map of per-row
    // metadata (level, hasChildren, expanded). The controller owns the
    // expanded/collapsed override Map; the model just calls back through
    // `isTreeRowExpanded` to ask which state a given row is in. Everything
    // else (filter, sort, paginate) flows through the normal pipeline.
    E(this, "_isTreeRowExpanded", (e, t) => {
      const i = String(e);
      if (this._treeExpanded.has(i)) return this._treeExpanded.get(i);
      const n = this.state.tree?.defaultExpanded ?? -1;
      return n < 0 ? !0 : t < n;
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
      pagination: { enabled: !1, page: 0, pageSize: ve },
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = Ot(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("mousemove", this._onRowDragMove), this._thead?.removeEventListener("contextmenu", this._onHeaderContextMenu), this._thead?.removeEventListener("click", this._onSynthHeaderClick), this._tbody?.removeEventListener("dragenter", this._onCellDragEnter), this._tbody?.removeEventListener("dragover", this._onCellDragOver), this._tbody?.removeEventListener("dragleave", this._onCellDragLeave), this._tbody?.removeEventListener("drop", this._onCellDrop), this._closeColumnMenu(), this._teardownPersistence(), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove(), this._resizeObserver?.disconnect(), this._resizeObserver = null;
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, i) => {
      if (t.hasAttribute("data-separator")) {
        const d = t.getAttribute("data-separator"), c = { __sgSeparator: !0 };
        d && d !== "" && d !== "true" && (c.variant = d);
        const h = t.getAttribute("data-label"), u = t.getAttribute("data-value");
        return h != null && (c.label = h), u != null && (c.value = u), c;
      }
      const n = {}, l = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      n[this.getRowIdValue] = l != null ? this._coerceRowId(l) : i + 1;
      const a = {};
      t.querySelectorAll("td").forEach((d) => {
        const c = d.getAttribute("data-cell-col-id-value") || d.getAttribute("data-col-id");
        if (!c) return;
        const h = d.getAttribute("data-cell-value");
        if (h != null)
          try {
            n[c] = JSON.parse(h);
          } catch {
            n[c] = h;
          }
        else
          n[c] = d.textContent.trim();
        const u = Number(d.getAttribute("data-spans") || d.getAttribute("colspan") || 1);
        u > 1 && (a[c] = u);
      }), Object.keys(a).length && (n.__sgSpans = a);
      const o = t.getAttribute("data-row-detail-rows-value");
      if (o && this.detailRowsKeyValue)
        try {
          n[this.detailRowsKeyValue] = JSON.parse(o);
        } catch {
        }
      return n;
    }), e.innerHTML = ""), this._initialHead = this.element.querySelector("thead");
  }
  _buildChrome() {
    let e = this.element.querySelector("table");
    if (!e) {
      e = f("table");
      const i = f("thead");
      e.appendChild(i), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = f("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const i = f("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(i, e), i.appendChild(e), this._viewport = i;
    }
    if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = f("div", { class: "sg-status-bar", role: "status" }), this._statusBar.append(
      f("div", { class: "sg-status-section sg-status-left" }),
      f("div", { class: "sg-status-section sg-status-right" })
    ), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
      const i = f("div", { class: "sg-main" });
      this._viewport.parentNode.insertBefore(i, this._viewport), i.appendChild(this._viewport), this._statusBar && i.appendChild(this._statusBar), this._main = i, this._sidePanel = f("aside", {
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
    this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), this._restorePersistedState(), this._setupPersistence(), S(this.element, "grid:ready", { api: this.element.gridApi }), S(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  // Filter UI bridge — implemented by filter_controller, but the grid is the
  // single source of truth so it brokers the popover.
  openFilterFor(e, t) {
    const i = this._colByField(e);
    if (!(!i || !i.filter)) {
      this._closeFilterPopover();
      {
        this._openFallbackFilterPopover(i, t);
        return;
      }
    }
  }
  _closeFilterPopover() {
    this._filterPopover && (this._filterPopover.remove(), this._filterPopover = null, document.removeEventListener("mousedown", this._onDocMouseDown));
  }
  _openFallbackFilterPopover(e, t) {
    const i = this.state.filterModel[e.field] || {}, n = Fs(e.filter), l = f("div", { class: "sg-filter-popover" }), a = f("select");
    n.forEach((w) => a.append(new Option(w.label, w.value, !1, w.value === i.type)));
    const o = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", d = f("input", { type: o, value: i.value ?? "" }), c = f("input", { type: o, value: i.value2 ?? "", style: { display: "none" } }), h = () => {
      const w = a.value, y = w === "inRange", v = !(w === "blank" || w === "notBlank");
      d.style.display = v ? "" : "none", c.style.display = y ? "" : "none";
    };
    a.addEventListener("change", h), h();
    const u = f("div", { class: "sg-filter-actions" }), p = f("button", { type: "button" }, "Clear"), g = f("button", { type: "button", class: "primary" }, "Apply");
    u.append(p, g), p.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), g.addEventListener("click", () => {
      const w = a.value, y = w === "blank" || w === "notBlank" ? { filterType: e.filter, type: w } : { filterType: e.filter, type: w, value: d.value, value2: c.value || void 0 };
      this.setColumnFilter(e.field, y), this._closeFilterPopover();
    }), l.append(
      f("label", {}, "Condition"),
      a,
      d,
      c,
      u
    ), document.body.appendChild(l);
    const _ = t.getBoundingClientRect();
    l.style.left = `${_.left + window.scrollX}px`, l.style.top = `${_.bottom + window.scrollY + 2}px`, this._filterPopover = l, document.addEventListener("mousedown", this._onDocMouseDown), d.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const i = this.state.columnDefs.findIndex((d) => d.field === e.field), n = this._runtimeOverrides[e.field] || {}, l = i >= 0 ? this.state.columnDefs[i] : null, a = l ? {
      ...l.hidden != null ? { hidden: l.hidden } : {},
      ...l.pinned ? { pinned: l.pinned } : {},
      ...l.width != null ? { width: l.width } : {}
    } : {}, o = { ...e, ...n, ...a, _headerEl: t };
    if (i >= 0) {
      const d = this.state.columnDefs[i];
      if (d._headerEl === t && Ps(d, o)) return;
      this.state.columnDefs[i] = o;
    } else
      this.state.columnDefs.push(o);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${H(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const i = this.state.sortModel.findIndex((l) => l.colId === e);
    let n;
    i === -1 ? n = { colId: e, sort: "asc" } : this.state.sortModel[i].sort === "asc" ? n = { colId: e, sort: "desc" } : n = null, t ? (i >= 0 && this.state.sortModel.splice(i, 1), n && this.state.sortModel.push(n)) : this.state.sortModel = n ? [n] : [], this.scheduleRender("sort"), S(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  setSortModel(e) {
    this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), S(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  // ----- Filter -----
  setColumnFilter(e, t) {
    t == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = t, this.state.pagination.page = 0, this.scheduleRender("filter"), S(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setFilterModel(e) {
    this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), S(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setQuickFilter(e) {
    const t = e == null ? "" : String(e);
    t !== this.state.quickFilter && (this.state.quickFilter = t, this.state.pagination.page = 0, this.scheduleRender("filter"), S(this.element, "grid:filterChanged", {
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
    const i = this.state.selection;
    this.rowSelectionValue === "single" ? (i.clear(), i.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? i.has(e) ? i.delete(e) : i.add(e) : (i.clear(), i.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), S(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(i)
    });
  }
  setSelected(e, t) {
    t ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), S(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  selectAll() {
    this._displayList.filteredSorted.forEach((e) => {
      !e.__sgGroup && !e.__sgSeparator && this.state.selection.add(this._rowId(e));
    }), this.scheduleRender("selection"), S(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  deselectAll() {
    this.state.selection.clear(), this.scheduleRender("selection"), S(this.element, "grid:selectionChanged", { selectedRows: [], selectedIds: [] });
  }
  getSelectedRows() {
    const e = this.state.selection;
    return this.state.rowData.filter((t) => e.has(this._rowId(t)));
  }
  _selectRange(e, t) {
    const i = this._displayList.filteredSorted, n = i.findIndex((d) => this._rowId(d) === e), l = i.findIndex((d) => this._rowId(d) === t);
    if (n < 0 || l < 0) return;
    const [a, o] = n <= l ? [n, l] : [l, n];
    for (let d = a; d <= o; d++)
      !i[d].__sgGroup && !i[d].__sgSeparator && this.state.selection.add(this._rowId(i[d]));
  }
  // ----- Pagination -----
  goToPage(e) {
    const t = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(e, t)), this.scheduleRender("page"), S(this.element, "grid:paginationChanged", {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  setPageSize(e) {
    this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), S(this.element, "grid:paginationChanged", {
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
    const e = Object.fromEntries(this.state.columnDefs.map((n) => [n.field, n])), t = this.state.columnDefs.filter((n) => !n.hidden && !n._isCheckbox);
    let i = Ce(this.state.rowData, this.state.filterModel, e);
    return i = Se(i, this.state.quickFilter, t), i.length;
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
  startEditingCell(e, t, i = void 0) {
    const n = this.state.columnDefs.find((a) => a.field === t);
    if (!n || !n.editable) return;
    const l = this.state.rowData.find((a) => this._rowId(a) === e);
    l && (this.state.editing = { rowId: e, colId: t, originalValue: V(l, n), initialValue: i }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: i, originalValue: n, draftValue: l } = this.state.editing, a = this._tbody.querySelector(`tr[data-row-id="${H(t)}"] td[data-col-id="${H(i)}"]`);
    let o = n;
    if (!e && a) {
      const d = a.querySelector("[data-editor-input]") || a.querySelector("input,select,textarea");
      d ? o = Bs(d.value, this._colByField(i)?.type) : l !== void 0 && (o = l);
    }
    if (this.state.editing = null, !e && o !== n) {
      const d = this.state.rowData.find((h) => this._rowId(h) === t), c = d[i];
      d[i] = o, S(this.element, "grid:cellValueChanged", { rowId: t, colId: i, oldValue: c, newValue: o });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const i = this._colByField(e);
    i && (i.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), S(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const i = this._colByField(e);
    if (!i) return;
    const n = t || null;
    i.pinned = n, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: n }, this._reorderForPinning(), this.scheduleRender("columns"), S(this.element, "grid:columnPinned", { colId: e, pinned: n });
  }
  setColumnWidth(e, t) {
    const i = this._colByField(e);
    if (!i) return;
    const n = Math.max(i.minWidth || 40, Math.min(i.maxWidth || 4e3, t));
    i.width = n, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: n }, this.scheduleRender("columns"), S(this.element, "grid:columnResized", { colId: e, width: n });
  }
  moveColumn(e, t) {
    const i = this.state.columnDefs.findIndex((l) => l.field === e);
    if (i < 0 || i === t) return;
    const [n] = this.state.columnDefs.splice(i, 1);
    this.state.columnDefs.splice(t, 0, n), this.scheduleRender("columns"), S(this.element, "grid:columnMoved", { colId: e, fromIndex: i, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const i = H(e), n = this._thead?.querySelector(
      `th[data-header-cell-field-value="${i}"], th[data-field="${i}"]`
    ), l = Array.from(
      this._tbody?.querySelectorAll(`td[data-col-id="${i}"]`) || []
    ).filter((o) => !o.closest("tr")?.classList?.contains("sg-spacer"));
    let a = 0;
    if ((n || l.length) && (a = this._measureColumnContentWidth(n, l)), !a) {
      const o = (t.headerName || t.field || "").length, d = this.state.rowData.slice(0, 200);
      let c = o;
      for (const h of d) {
        const u = String(P(h, t) ?? "").length;
        u > c && (c = u);
      }
      a = c * 8;
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, a + 16)));
  }
  // Build an off-screen single-column <table table-layout:auto> with clones
  // of the header + a sample of body cells, mount it inside .sg-grid so
  // scoped CSS still applies, read the natural td widths, return the max.
  _measureColumnContentWidth(e, t, i = 50) {
    const n = document.createElement("table");
    n.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;table-layout:auto;width:auto;border-collapse:separate;border-spacing:0;";
    const l = document.createElement("tbody");
    n.appendChild(l);
    const a = (d) => {
      if (!d) return;
      const c = document.createElement("tr"), h = d.cloneNode(!0);
      h.removeAttribute("style"), c.appendChild(h), l.appendChild(c);
    };
    if (a(e), t.slice(0, i).forEach(a), !l.children.length) return 0;
    this.element.appendChild(n);
    let o = 0;
    for (const d of l.children) {
      const c = d.firstElementChild;
      c && c.offsetWidth > o && (o = c.offsetWidth);
    }
    return this.element.removeChild(n), o;
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), i = t.reduce((l, a) => l + (a.width || 150), 0);
    if (i === 0) return;
    const n = e / i;
    t.forEach((l) => {
      l.width = Math.max(l.minWidth || 40, Math.floor((l.width || 150) * n));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((n) => n.pinned === "left"), t = this.state.columnDefs.filter((n) => n.pinned === "right"), i = this.state.columnDefs.filter((n) => !n.pinned);
    this.state.columnDefs = [...e, ...i, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), S(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], i = [], n = [], l = new Map(this.state.rowData.map((a) => [this._rowId(a), a]));
    return (e.remove || []).forEach((a) => {
      const o = this._rowId(a);
      l.delete(o) && n.push(a);
    }), (e.update || []).forEach((a) => {
      const o = this._rowId(a);
      l.has(o) && (l.set(o, { ...l.get(o), ...a }), i.push(a));
    }), (e.add || []).forEach((a) => {
      const o = this._rowId(a);
      l.has(o) || (l.set(o, a), t.push(a));
    }), this.state.rowData = Array.from(l.values()), this.scheduleRender("data"), S(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: i, removed: n };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const i = this.state.columnDefs.filter((o) => !o.hidden && !o._isCheckbox), n = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((o) => !o.__sgGroup && !o.__sgDetail && !o.__sgSeparator), l = (o) => /[",\n\r]/.test(o) ? `"${String(o).replace(/"/g, '""')}"` : String(o), a = [i.map((o) => l(o.headerName || o.field)).join(e)];
    for (const o of n)
      a.push(i.map((d) => l(P(o, d))).join(e));
    return a.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const i = this.getDataAsCsv(t), n = new Blob([i], { type: "text/csv;charset=utf-8" }), l = URL.createObjectURL(n), a = f("a", { href: l, download: e });
    return document.body.appendChild(a), a.click(), a.remove(), URL.revokeObjectURL(l), i;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.has("tree") || e.size === 0) && (this._displayList = Ht({
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
    const e = this._visibleCols(), t = $t(e, this._headerLayoutOpts());
    t.depth > 1 ? this._renderHeaderMultiRow(e, t) : this._renderHeaderSingleRow(e), this._renderColgroup(e);
  }
  // Aggregate the options we hand to buildHeaderLayout (auto-derived pivot
  // groups when in pivot mode, plus any user-declared columnGroups).
  _headerLayoutOpts() {
    const e = { columnGroups: this.columnGroupsValue || null };
    return this.state.pivot?.mode && this._displayList?.pivot && (e.pivotCols = (this.state.pivot.cols || []).map((t) => this._colByField(t)).filter(Boolean), e.valueConfigs = Object.entries(this.state.group.aggs || {}).map(([t, i]) => ({ col: this._colByField(t), aggFunc: i })).filter((t) => t.col)), e;
  }
  _renderColgroup(e) {
    let t = this._table.querySelector("colgroup");
    t || (t = f("colgroup"), this._table.insertBefore(t, this._thead));
    const i = Array.from(t.children);
    for (e.forEach((l, a) => {
      let o = i[a];
      o || (o = f("col"), t.appendChild(o)), o.style.width = l.width ? l.width + "px" : "";
    }); t.children.length > e.length; ) t.lastElementChild.remove();
    if (e.some((l) => !l.width))
      this._table.style.width = "100%";
    else {
      const l = e.reduce((o, d) => o + (Number(d.width) || 0), 0), a = this._viewport?.clientWidth || 0;
      if (a && l < a && e.length > 0) {
        const o = t.lastElementChild, d = Number(e[e.length - 1].width) || 0, c = l - d;
        o.style.width = a - c + "px", this._table.style.width = a + "px";
      } else
        this._table.style.width = l + "px";
    }
  }
  _renderHeaderSingleRow(e) {
    if (this._thead.children.length > 1) {
      const u = this._thead.firstElementChild;
      for (let p = 1; p < this._thead.children.length; p++) {
        const g = this._thead.children[p];
        Array.from(g.children).forEach((_) => {
          (_.hasAttribute("data-header-cell-field-value") || _.hasAttribute("data-field")) && u.appendChild(_);
        });
      }
      for (; this._thead.children.length > 1; ) this._thead.lastElementChild.remove();
    }
    const t = this._thead.querySelector("tr") || (() => {
      const u = f("tr");
      return this._thead.appendChild(u), u;
    })(), i = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((u) => {
      const p = u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field");
      p && i.set(p, u);
    });
    const n = new Set(e.map((u) => u.field)), l = this.state.columnDefs.filter((u) => !n.has(u.field)), a = [...e, ...l], o = Array.from(t.children).map((u) => u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field")).filter(Boolean), d = a.map((u) => u.field);
    if (o.length === d.length && o.every((u, p) => u === d[p]))
      Array.from(t.children).forEach((u) => {
        u.removeAttribute("rowspan"), u.removeAttribute("colspan");
      });
    else {
      const u = [];
      for (const p of a) {
        let g = i.get(p.field);
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
      p != null && (u.style.display = n.has(p) ? "" : "none");
    });
    const h = this._pinOffsets();
    for (const u of e) {
      const p = t.querySelector(`th[data-header-cell-field-value="${H(u.field)}"]`) || t.querySelector(`th[data-field="${H(u.field)}"]`);
      p && this._applyLeafThState(p, u, h);
    }
  }
  // Multi-row header: <thead> gets `layout.depth` rows of group headers
  // followed by the leaf headers, then one hidden row holding any registered
  // <th>s that aren't currently visible (so their controllers stay mounted).
  _renderHeaderMultiRow(e, t) {
    const i = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((c) => {
      const h = c.getAttribute("data-header-cell-field-value") || c.getAttribute("data-field");
      h && i.set(h, c);
    });
    const n = [], l = new Set(e.map((c) => c.field)), a = this._pinOffsets();
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
        let g = i.get(p.field);
        if (g || (g = f("th", {
          "data-field": p.field,
          "data-synth": "true"
        }, [f("div", { class: "sg-header-content" }, [
          f("span", { class: "sg-header-label" }, u.label || p.headerName || p.field || "")
        ])])), u.label) {
          const _ = g.querySelector(".sg-header-label");
          _ && _.textContent !== u.label && (_.textContent = u.label);
        }
        g.setAttribute("rowspan", String(u.rowspan)), g.removeAttribute("colspan"), g.style.display = "", h.appendChild(g), this._applyLeafThState(g, p, a);
      }
      n.push(h);
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
        let u = i.get(h.field);
        u || (u = f("th", { "data-field": h.field, "data-synth": "true" })), u.removeAttribute("rowspan"), u.removeAttribute("colspan"), c.appendChild(u);
      }
      n.push(c);
    }
    this._thead.replaceChildren(...n);
  }
  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(e, t, i) {
    const n = this.state.sortModel.find((l) => l.colId === t.field);
    he(e, {
      "data-sortable": t.sortable ? "true" : null,
      "data-filterable": t.filter ? "true" : null,
      "data-filter-active": this.state.filterModel[t.field] ? "true" : null,
      "data-sort": n?.sort || null,
      "data-pinned": t.pinned || null,
      // Carry the column's value-type onto the <th> so CSS can right-align
      // numeric headers (matching the right-aligned numeric body cells from
      // currency/number/percent renderers and from the `type: 'number'`
      // formatter path).
      "data-type": t.type && t.type !== "text" ? t.type : null
    }), t.width && (e.style.width = t.width + "px"), e.style.left = t.pinned === "left" ? i.left[t.field] + "px" : "", e.style.right = t.pinned === "right" ? i.right[t.field] + "px" : "", this._ensureHeaderChrome(e, t, n);
  }
  _ensureHeaderChrome(e, t, i) {
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
    let n = e.querySelector(".sg-header-content");
    if (!n) {
      const o = e.textContent.trim();
      e.textContent = "", n = f("div", { class: "sg-header-content" }, [
        f("span", { class: "sg-header-label" }, o || t.headerName || t.field || "")
      ]), e.appendChild(n);
    }
    let l = n.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (l || (l = f("span", { class: "sg-sort-icon", "aria-hidden": "true" }), l.innerHTML = j, n.appendChild(l)), i && this.state.sortModel.length > 1) {
        let o = n.querySelector(".sg-sort-index");
        o || (o = f("span", { class: "sg-sort-index" }), n.appendChild(o)), o.textContent = String(this.state.sortModel.indexOf(i) + 1);
      } else
        n.querySelector(".sg-sort-index")?.remove();
    else l && l.remove();
    let a = n.querySelector(".sg-filter-icon");
    t.filter ? a || (a = f("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), a.innerHTML = ks, n.appendChild(a)) : a && a.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(f("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._withDetailRows(this._displayList.pageRows);
    this._selKeys = this._computeCellSelKeys();
    const i = !this.masterDetailValue && (this.virtualValue || t.length > 200);
    let n = t, l = 0;
    if (i) {
      const u = this._viewport?.clientHeight || 400, p = this.state.rowHeight, g = Gt(this.state.scrollTop, u, p, t.length, 8);
      l = g.first, n = t.slice(g.first, g.last);
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
    if (i) {
      const u = this.state.rowHeight, p = l * u, g = (t.length - l - n.length) * u;
      o.appendChild(this._spacerRow(p, e.length)), n.forEach((_) => o.appendChild(this._buildRow(_, e, a, h(_)))), o.appendChild(this._spacerRow(g, e.length));
    } else
      n.forEach((u) => o.appendChild(this._buildRow(u, e, a, h(u))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && o.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(o);
  }
  _buildPinnedBottomRow(e) {
    const t = f("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), i = this._pinOffsets(), n = this._displayList.grandTotals || {};
    let l = !1;
    for (const a of e) {
      const o = f("td", { "data-col-id": a.field, "data-pinned": a.pinned || null });
      a.pinned === "left" ? o.style.left = i.left[a.field] + "px" : a.pinned === "right" && (o.style.right = i.right[a.field] + "px");
      const d = n[a.field];
      d != null ? (o.classList.add("sg-agg-cell"), o.textContent = this._formatAggregate(d)) : !l && !a._isCheckbox && !a._isRowNumber && (o.classList.add("sg-pinned-bottom-label"), o.textContent = "Total", l = !0), t.appendChild(o);
    }
    return t;
  }
  _buildRow(e, t, i, n) {
    if (e.__sgGroup) return this._buildGroupRow(e, t, i);
    if (e.__sgDetail) return this._buildDetailRow(e, t, i);
    if (e.__sgSeparator) return this._buildSeparatorRow(e, t, i);
    const l = String(this._rowId(e));
    let a = i.get(l);
    a || (a = f("tr")), a.dataset.rowId = l, a.classList.remove("sg-spacer");
    const o = this.state.selection.has(this._rowId(e)), d = this.masterDetailValue && this._isDetailExpanded(l);
    return he(a, {
      "data-selected": o ? "true" : null,
      "data-detail-expanded": d ? "true" : null
    }), this.masterDetailValue && a.classList.add("sg-master-row"), this._renderRow(a, e, t, n), a;
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
  _buildSeparatorRow(e, t, i) {
    const n = `__s:${e.__sgSeparatorId ?? this._separatorKey(e)}`;
    let l = i.get(n);
    l || (l = f("tr")), l.dataset.rowId = n, l.dataset.separator = "true", l.className = "", l.removeAttribute("data-selected"), l.removeAttribute("data-detail-expanded");
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
  _renderSeparatorContent(e, t, i) {
    if (i === "blank" || i === "divider")
      return;
    const n = f("div", { class: "sg-separator-content" });
    t.label != null && n.appendChild(f("span", { class: "sg-separator-label" }, String(t.label))), t.value != null && n.appendChild(f("span", { class: "sg-separator-value" }, String(t.value))), e.appendChild(n);
  }
  _separatorKey(e) {
    return [e.variant || "", e.label || "", e.value || ""].join("|");
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const n = f("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return n.style.height = "0px", n.appendChild(f("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), n;
    }
    const i = f("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return i.style.height = e + "px", i.appendChild(f("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), i;
  }
  _renderRow(e, t, i, n) {
    e.innerHTML = "";
    const l = this._pinOffsets(), a = this._selKeys || { active: null, range: null }, o = String(this._rowId(t)), d = this._displayList?.treeMeta, c = d ? d.get(o) : null, h = c ? this._treeDisplayColField() : null, u = t && t.__sgSpans || null;
    let p = 0;
    for (let g = 0; g < i.length; g++) {
      const _ = i[g];
      if (p > 0) {
        p -= 1;
        continue;
      }
      const w = _._isRowNumber || _._isCheckbox || _._isGroupCol || _._isMasterExpand, y = u && !w ? Number(u[_.field]) : 0, v = Math.max(1, Math.min(y || 1, i.length - g));
      v > 1 && (p = v - 1);
      const C = `${o}:${_.field}`, b = f("td", {
        "data-col-id": _.field,
        "data-pinned": _.pinned || null,
        "data-cell-active": a.active === C ? "true" : null,
        "data-cell-range": a.range && a.range.has(C) ? "true" : null,
        colspan: v > 1 ? String(v) : null
      });
      if (v > 1 && b.classList.add("sg-merged-cell"), _.pinned === "left" ? b.style.left = l.left[_.field] + "px" : _.pinned === "right" && (b.style.right = l.right[_.field] + "px"), _._isRowNumber) {
        b.classList.add("sg-gutter-cell"), b.setAttribute("data-gutter", "true"), b.removeAttribute("data-cell-active"), b.removeAttribute("data-cell-range"), b.textContent = n != null ? String(n) : "", e.appendChild(b);
        continue;
      }
      if (_._isCheckbox) {
        b.classList.add("sg-checkbox-cell");
        const L = f("input", { type: "checkbox" });
        L.checked = this.state.selection.has(this._rowId(t)), b.appendChild(L), e.appendChild(b);
        continue;
      }
      if (_._isGroupCol) {
        b.classList.add("sg-group-leaf-cell"), b.removeAttribute("data-cell-active"), b.removeAttribute("data-cell-range"), e.appendChild(b);
        continue;
      }
      if (_._isMasterExpand) {
        b.classList.add("sg-master-expand-cell"), b.setAttribute("data-master-expand", "true"), b.removeAttribute("data-cell-active"), b.removeAttribute("data-cell-range");
        const L = this._isDetailExpanded(this._rowId(t)), T = f("span", {
          class: "sg-master-expand-caret",
          "data-expanded": L ? "true" : "false",
          "aria-hidden": "true"
        });
        T.innerHTML = j, b.appendChild(T), e.appendChild(b);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === _.field) {
        b.setAttribute("data-editing", "true");
        const L = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : V(t, _), { node: T, control: M } = this._buildEditor(_, L);
        b.appendChild(T);
        const I = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          if (M?.focus(), I || M?.select?.(), M?.type && Ns.has(M.type))
            try {
              M.showPicker?.();
            } catch {
            }
        });
      } else
        this._renderCellContent(b, t, _);
      c && _.field === h && this._decorateTreeCell(b, c), e.appendChild(b);
    }
  }
  // Prepend an indent spacer + a chevron (when the row has children) to the
  // tree column's <td>. The chevron carries data-tree-toggle so the body
  // click handler can route it back to toggleTreeRow without conflicting
  // with cell selection or row click handlers.
  _decorateTreeCell(e, t) {
    if (e.classList.add("sg-tree-cell"), e.setAttribute("data-tree-level", String(t.level)), e.style.paddingLeft = `${8 + t.level * 18}px`, t.hasChildren) {
      const i = f("span", {
        class: "sg-tree-chevron",
        "data-tree-toggle": "true",
        "data-expanded": t.expanded ? "true" : "false",
        "aria-hidden": "true"
      });
      i.innerHTML = j, e.insertBefore(i, e.firstChild);
    } else {
      const i = f("span", { class: "sg-tree-chevron sg-tree-chevron-leaf", "aria-hidden": "true" });
      e.insertBefore(i, e.firstChild);
    }
  }
  _renderCellContent(e, t, i) {
    if (i.cellRenderer) {
      const n = pe(i.cellRenderer);
      if (n) {
        const a = V(t, i), o = P(t, i);
        (n.dataset.bind || n.dataset.bindText !== void 0) && (n.textContent = n.dataset.bind ? String(t[n.dataset.bind] ?? "") : o), n.dataset.bindAttr && n.setAttribute(n.dataset.bindAttr, a), n.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((d) => {
          d.dataset.bindText !== void 0 ? d.textContent = o : d.dataset.bind && (d.textContent = String(t[d.dataset.bind] ?? "")), d.dataset.bindAttr && d.setAttribute(d.dataset.bindAttr, a);
        }), e.appendChild(n);
        return;
      }
      const l = Re(i.cellRenderer);
      if (typeof l == "function") {
        const a = V(t, i), o = P(t, i), d = l({ value: a, row: t, col: i, td: e, formatted: o, api: this.element.gridApi });
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
    e.textContent = P(t, i);
  }
  toggleGroup(e, t = 0) {
    this._groupExpanded.set(e, !this._isGroupExpanded(e, t)), this.scheduleRender("group"), S(this.element, "grid:groupToggled", { groupId: e, expanded: this._groupExpanded.get(e) });
  }
  expandAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = -1, this.scheduleRender("group");
  }
  collapseAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = 0, this.scheduleRender("group");
  }
  setRowGroupColumns(e) {
    this.state.group.cols = Array.isArray(e) ? e.slice() : [], this._groupExpanded.clear(), this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("group"), S(this.element, "grid:columnRowGroupChanged", { rowGroupCols: this.state.group.cols.slice() });
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
    t == null ? delete this.state.group.aggs[e] : this.state.group.aggs[e] = t, this.scheduleRender("group"), S(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  // ----- Pivot mode -----
  // Toggling pivot mode rebuilds the display list (and therefore the visible
  // column set). Clears row + cell selection since the underlying cell graph
  // changes shape entirely.
  setPivotMode(e) {
    const t = !!e;
    this.state.pivot.mode !== t && (this.state.pivot.mode = t, this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), S(this.element, "grid:pivotModeChanged", { pivot: t }));
  }
  isPivotMode() {
    return !!this.state.pivot.mode;
  }
  setPivotColumns(e) {
    this.state.pivot.cols = Array.isArray(e) ? e.slice() : [], this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), S(this.element, "grid:columnPivotChanged", { pivotCols: this.state.pivot.cols.slice() });
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
    for (const { field: i, aggFunc: n } of e || [])
      i && n && (t[i] = n);
    this.state.group.aggs = t, this.scheduleRender(this.state.pivot.mode ? "pivot" : "group"), S(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  addValueColumn(e, t = "sum") {
    e && this.setColumnAggFunc(e, t);
  }
  removeValueColumn(e) {
    this.setColumnAggFunc(e, null);
  }
  // ----- Column header groups + pinned bottom row -----
  setColumnGroups(e) {
    this.columnGroupsValue = Array.isArray(e) ? e : [], this.scheduleRender("columns"), S(this.element, "grid:columnGroupsChanged", { columnGroups: this.columnGroupsValue });
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
        const t = new Map(this.state.columnDefs.map((n) => [n.field, n])), i = [];
        for (const n of e.cols) {
          const l = t.get(n.field);
          l && (n.width != null && (l.width = n.width), l.pinned = n.pinned || void 0, l.hidden = !!n.hidden, t.delete(n.field), i.push(l));
        }
        for (const n of t.values()) i.push(n);
        this.state.columnDefs = i;
      }
      if (Array.isArray(e.rowGroupCols) && (this.state.group.cols = e.rowGroupCols.slice()), e.pivot && typeof e.pivot == "object" && (this.state.pivot.cols = Array.isArray(e.pivot.cols) ? e.pivot.cols.slice() : [], this.state.pivot.mode = !!e.pivot.mode), Array.isArray(e.values)) {
        const t = {};
        for (const { field: i, aggFunc: n } of e.values) i && n && (t[i] = n);
        this.state.group.aggs = t;
      }
      Array.isArray(e.columnGroups) && (this.columnGroupsValue = e.columnGroups), typeof e.pinnedBottomRow == "boolean" && (this.pinnedBottomRowValue = e.pinnedBottomRow), Array.isArray(e.sortModel) && (this.state.sortModel = e.sortModel.slice()), e.filterModel && typeof e.filterModel == "object" && (this.state.filterModel = { ...e.filterModel }), typeof e.quickFilter == "string" && (this.state.quickFilter = e.quickFilter);
      for (const t of ["columns", "group", "pivot", "sort", "filter", "data"])
        this.scheduleRender(t);
      S(this.element, "grid:columnStateApplied", { state: e });
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
    for (const t of we) this.element.addEventListener(t, e);
    this._persistBeforeUnload = () => {
      this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
    }, window.addEventListener("beforeunload", this._persistBeforeUnload);
  }
  _teardownPersistence() {
    if (this._persistListener) {
      for (const e of we) this.element.removeEventListener(e, this._persistListener);
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
  _buildGroupRow(e, t, i) {
    const n = `__g:${e.groupId}`;
    let l = i.get(n);
    return l || (l = f("tr")), l.dataset.rowId = n, l.dataset.group = "true", l.dataset.groupLevel = String(e.level), l.className = "sg-group-row", this._renderGroupRow(l, e, t), l;
  }
  _renderGroupRow(e, t, i) {
    e.innerHTML = "";
    const n = this._pinOffsets(), l = this._isGroupExpanded(t.groupId, t.level), a = (this.state.group.displayType || "singleColumn") === "singleColumn", o = !!(this.state.pivot?.mode && this._displayList?.pivot), d = t.__pivotAll === !0, c = i.filter((p) => !p._isRowNumber && !p._isCheckbox && !p._isGroupCol), h = c.some((p) => p.field === t.field) ? t.field : c[0]?.field, u = Math.max(0, t.level);
    d && e.classList.add("sg-pivot-all-row");
    for (const p of i) {
      const g = f("td", { "data-col-id": p.field, "data-pinned": p.pinned || null });
      if (p.pinned === "left" ? g.style.left = n.left[p.field] + "px" : p.pinned === "right" && (g.style.right = n.right[p.field] + "px"), p._isRowNumber || p._isCheckbox) {
        g.classList.add(p._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(g);
        continue;
      }
      if (o || a ? p._isGroupCol : p.field === h) {
        if (g.classList.add("sg-group-cell"), g.style.paddingLeft = `${8 + u * 18}px`, !d) {
          const w = f("span", {
            class: "sg-group-caret",
            "data-expanded": l ? "true" : "false",
            "aria-hidden": "true"
          });
          w.innerHTML = j, g.appendChild(w);
        }
        g.append(
          f("span", { class: "sg-group-label" }, this._groupValueLabel(t)),
          f("span", { class: "sg-group-count" }, ` (${t.count})`)
        );
      } else if (o && p._isPivot) {
        const w = V(t, p);
        w != null && (g.classList.add("sg-agg-cell"), g.textContent = this._formatAggregate(w));
      } else !p._isGroupCol && t.aggregates && t.aggregates[p.field] != null && (g.classList.add("sg-agg-cell"), g.textContent = this._formatAggregate(t.aggregates[p.field]));
      e.appendChild(g);
    }
  }
  _groupValueLabel(e) {
    const t = e.value;
    if (t == null || t === "") return "(Blanks)";
    const i = this._colByField(e.field);
    return i ? P({ [e.field]: t }, i) : String(t);
  }
  _formatAggregate(e) {
    return e == null ? "" : typeof e == "number" ? Number.isInteger(e) ? String(e) : String(Math.round(e * 100) / 100) : String(e);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, t) {
    if (e.cellEditor) {
      const n = pe(e.cellEditor);
      if (n) {
        const l = n.matches?.("input,select,textarea") ? n : n.querySelector?.("[data-editor-input]") || n.querySelector?.("input,select,textarea");
        return l && (this._seedEditorValue(l, e, t), l.addEventListener("keydown", this._onEditorKey), l.addEventListener("blur", this._onEditorBlur)), { node: n, control: l };
      }
    }
    const i = this._buildEditorInput(e, t);
    return { node: i, control: i };
  }
  _seedEditorValue(e, t, i) {
    if (t.type === "date" && i) {
      const n = i instanceof Date ? i : new Date(i);
      e.value = Number.isNaN(n?.getTime?.()) ? i ?? "" : n.toISOString().slice(0, 10);
    } else if (t.type === "datetime" && i) {
      const n = i instanceof Date ? i : new Date(i);
      if (Number.isNaN(n?.getTime?.()))
        e.value = i ?? "";
      else {
        const l = n.getTimezoneOffset() * 6e4;
        e.value = new Date(n.getTime() - l).toISOString().slice(0, 16);
      }
    } else t.type === "boolean" ? e.value = i === !0 ? "true" : i === !1 ? "false" : "" : e.value = i ?? "";
  }
  // Native input type per column `type`. HTML5 already covers most of what
  // the built-in renderers need (color picker, date picker, datetime-local
  // picker, native email/url/tel validation) — we just have to ask for the
  // right input type. Anything outside the known list falls through to a
  // plain text input, which is what cellEditor templates wrap when a column
  // wants something fancier.
  _buildEditorInput(e, t) {
    let i;
    if (e.type === "number") i = f("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const n = t instanceof Date ? t : t ? new Date(t) : null, l = n ? n.toISOString().slice(0, 10) : "";
      i = f("input", { type: "date", value: l });
    } else if (e.type === "datetime") {
      const n = t instanceof Date ? t : t ? new Date(t) : null;
      let l = "";
      if (n && !Number.isNaN(n.getTime())) {
        const a = n.getTimezoneOffset() * 6e4;
        l = new Date(n.getTime() - a).toISOString().slice(0, 16);
      }
      i = f("input", { type: "datetime-local", value: l });
    } else if (e.type === "color") {
      const n = /^#[0-9a-f]{6}$/i.test(String(t ?? "")) ? t : "#000000";
      i = f("input", { type: "color", value: n });
    } else e.type === "email" ? i = f("input", { type: "email", value: t ?? "" }) : e.type === "url" ? i = f("input", { type: "url", value: t ?? "" }) : e.type === "tel" ? i = f("input", { type: "tel", value: t ?? "" }) : e.type === "boolean" ? (i = f("select"), i.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : i = f("input", { type: "text", value: t ?? "" });
    return i.addEventListener("keydown", this._onEditorKey), i.addEventListener("blur", this._onEditorBlur), i;
  }
  _renderPagination() {
    this.state.pagination.enabled;
  }
  // ----- Status bar (rows · selection · range aggregates) -----
  _renderStatusBar() {
    if (!this._statusBar) return;
    const e = this._statusBar.querySelector(".sg-status-left"), t = this._statusBar.querySelector(".sg-status-right");
    e.replaceChildren();
    const i = this.state.serverSide ? this.state.serverRowCount : this.state.rowData.length, n = this._displayList.grouped ? this._displayList.leafCount ?? this.filteredCount() : this.filteredCount();
    e.appendChild(this._statusPanel(
      "Rows",
      this._fmtInt(n),
      n !== i ? `of ${this._fmtInt(i)}` : null
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
    o !== this._lastRangeAggs && (this._lastRangeAggs = o, S(this.element, "grid:rangeAggsChanged", { aggs: a }));
  }
  _statusPanel(e, t, i = null) {
    const n = f("div", { class: "sg-status-panel" });
    return n.append(
      f("span", { class: "sg-status-label" }, `${e}:`),
      f("span", { class: "sg-status-value" }, t)
    ), i && n.appendChild(f("span", { class: "sg-status-aside" }, i)), n;
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
      const i = this._rangeRect(t);
      if (i)
        for (let n = i.r0; n <= i.r1; n++) {
          const l = i.rows[n];
          if (!(!l || l.__sgGroup || l.__sgDetail || l.__sgSeparator))
            for (let a = i.c0; a <= i.c1; a++) {
              const o = i.cols[a];
              !o || o._isCheckbox || o._isRowNumber || o._isGroupCol || o._isMasterExpand || e.push(V(l, o));
            }
        }
    }
    return e;
  }
  getRangeAggregates() {
    return this.state.cellSel.ranges.length ? Mt(this._cellRangeRawValues()) : null;
  }
  _showColumnMenu(e, t, i) {
    this._closeColumnMenu();
    const n = this._columnMenuItems(e), l = f("div", { class: "sg-column-menu", role: "menu" });
    for (const d of n) {
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
    l.style.left = `${Math.min(t, window.innerWidth - a - 4)}px`, l.style.top = `${Math.min(i, window.innerHeight - o - 4)}px`, this._columnMenu = l, setTimeout(() => {
      document.addEventListener("mousedown", this._onDocMouseDownColumnMenu), document.addEventListener("keydown", this._onColumnMenuKey), window.addEventListener("resize", this._closeColumnMenuBound = () => this._closeColumnMenu(), { once: !0 }), window.addEventListener("scroll", this._closeColumnMenuBound, { once: !0, capture: !0 });
    }, 0), S(this.element, "grid:columnMenuOpened", { colId: e.field });
  }
  _closeColumnMenu() {
    this._columnMenu && (this._columnMenu.remove(), this._columnMenu = null, document.removeEventListener("mousedown", this._onDocMouseDownColumnMenu), document.removeEventListener("keydown", this._onColumnMenuKey), this._closeColumnMenuBound && (window.removeEventListener("resize", this._closeColumnMenuBound), window.removeEventListener("scroll", this._closeColumnMenuBound, { capture: !0 }), this._closeColumnMenuBound = null));
  }
  // Build the menu item list for `col` based on the current grid state. Each
  // item is { label, action, active? } or the string 'separator'. Items are
  // emitted only when they make sense (e.g. "Unpin" doesn't show on an
  // unpinned col), so the menu stays short.
  _columnMenuItems(e) {
    const t = this.element.gridApi, i = e.headerName || e.field, n = this.state.group.cols.includes(e.field), l = this.state.pivot.cols.includes(e.field), a = this.state.group.aggs[e.field], o = e.type === "number", d = [];
    if (e.pinned !== "left" && d.push({ label: "Pin left", action: () => t.setColumnPinned(e.field, "left") }), e.pinned !== "right" && d.push({ label: "Pin right", action: () => t.setColumnPinned(e.field, "right") }), e.pinned && d.push({ label: "Unpin", action: () => t.setColumnPinned(e.field, null) }), d.push("separator"), d.push({ label: "Autosize this column", action: () => t.autoSizeColumn(e.field) }), d.push({ label: "Autosize all columns", action: () => t.autoSizeAllColumns() }), d.push("separator"), d.push(n ? { label: `Ungroup ${i}`, action: () => t.removeRowGroupColumn(e.field) } : { label: `Group by ${i}`, action: () => t.addRowGroupColumn(e.field) }), d.push(l ? { label: `Remove ${i} from pivot`, action: () => t.removePivotColumn(e.field) } : { label: `Pivot by ${i}`, action: () => {
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
    const t = e?.closest?.("td"), i = e?.closest?.("tr");
    if (!t || !i || i.dataset.group === "true" || i.dataset.separator === "true" || i.classList.contains("sg-detail-row") || t.classList.contains("sg-checkbox-cell") || t.classList.contains("sg-group-leaf-cell") || t.classList.contains("sg-master-expand-cell") || t.dataset.gutter === "true" || !t.dataset.colId) return null;
    const n = t.dataset.colId, l = this._colByField(n);
    return l && l.acceptFiles === !1 ? null : { td: t, tr: i, colId: n, rowId: this._coerceRowId(i.dataset.rowId), col: l };
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
    const n = e.target.closest?.('[data-tree-toggle="true"]');
    if (n && t.contains(n)) {
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
        this.clearCellSelection(), this.toggleRowSelection(l, d), S(this.element, "grid:rowClicked", { rowId: l, row: this.state.rowData.find((c) => this._rowId(c) === l), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (a) {
      const d = this.state.rowData.find((h) => this._rowId(h) === l), c = a.dataset.colId;
      S(this.element, "grid:cellClicked", { rowId: l, colId: c, value: d?.[c], event: e });
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
    this.toggleRowSelection(l, o), S(this.element, "grid:rowClicked", { rowId: l, row: this.state.rowData.find((d) => this._rowId(d) === l), event: e });
  }
  // ----- Cell selection (Numbers/Sheets-style: multi-range + active cell) -----
  _cellAt(e) {
    const t = e.closest?.("td"), i = e.closest?.("tr");
    return !t || !i || i.dataset.group === "true" || i.dataset.separator === "true" || i.classList.contains("sg-detail-row") || t.classList.contains("sg-checkbox-cell") || t.classList.contains("sg-group-leaf-cell") || t.classList.contains("sg-master-expand-cell") || t.dataset.gutter === "true" || !t.dataset.colId || t.dataset.editing === "true" ? null : { rowId: this._coerceRowId(i.dataset.rowId), colId: t.dataset.colId };
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
    const t = Array.from(this.state.selection).map(String), i = new Set(t.includes(String(e)) ? t : [String(e)]), n = f("div", { class: "sg-drag-ghost sg-grid" }), l = f("table"), a = f("tbody");
    let o = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((c) => {
      if (i.has(c.dataset.rowId) && o < 6) {
        const h = c.cloneNode(!0);
        h.removeAttribute("data-selected"), h.querySelectorAll("td").forEach((u) => {
          u.style.left = "", u.style.right = "", u.removeAttribute("data-pinned"), u.removeAttribute("data-cell-active"), u.removeAttribute("data-cell-range");
        }), a.appendChild(h), o += 1;
      }
    }), l.appendChild(a), n.appendChild(l), i.size > o && n.appendChild(f("div", { class: "sg-drag-ghost-more" }, `+${i.size - o} more rows`)), n.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(n);
    const d = f("div", { class: "sg-drop-indicator" });
    document.body.appendChild(d), this._rowDrag = { ids: i, ghost: n, indicator: d, dropRowId: null, dropBefore: !0 }, document.body.classList.add("sg-row-dragging");
  }
  _updateDropIndicator(e) {
    const t = Array.from(this._tbody.querySelectorAll("tr[data-row-id]"));
    let i = null, n = !0;
    for (const d of t) {
      const c = d.getBoundingClientRect();
      if (e < c.top + c.height / 2) {
        i = d, n = !0;
        break;
      }
      i = d, n = !1;
    }
    if (!i) return;
    const l = i.getBoundingClientRect(), a = this._viewport.getBoundingClientRect(), o = this._rowDrag.indicator;
    o.style.left = `${a.left}px`, o.style.width = `${a.width}px`, o.style.top = `${(n ? l.top : l.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(i.dataset.rowId), this._rowDrag.dropBefore = n;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: i, dropRowId: n, dropBefore: l } = this._rowDrag;
    if (t.remove(), i.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, n == null || e.has(String(n))) return;
    const a = this.state.rowData, o = a.filter((h) => e.has(String(this._rowId(h)))), d = a.filter((h) => !e.has(String(this._rowId(h))));
    let c = d.findIndex((h) => this._rowId(h) === n);
    c < 0 ? c = d.length : l || (c += 1), d.splice(c, 0, ...o), this.state.rowData = d, this.state.sortModel = [], this.scheduleRender("data"), S(this.element, "grid:rowDragEnd", {
      ids: o.map((h) => this._rowId(h)),
      toRowId: n,
      before: l
    });
  }
  // Toggle the active/range data-attrs on the existing cell DOM without
  // rebuilding the tbody (so in-flight mouse interactions aren't disrupted).
  _applyCellSelHighlight() {
    const e = this._computeCellSelKeys();
    this._selKeys = e, this._tbody && (this._tbody.querySelectorAll("td[data-col-id]").forEach((t) => {
      const i = t.parentElement, n = `${i && i.dataset.rowId}:${t.dataset.colId}`;
      e.active === n ? t.setAttribute("data-cell-active", "true") : t.removeAttribute("data-cell-active"), e.range && e.range.has(n) ? t.setAttribute("data-cell-range", "true") : t.removeAttribute("data-cell-range");
    }), this._renderStatusBar());
  }
  // Rectangle (display indices) for a {anchor,focus} range, or null.
  _rangeRect(e) {
    if (!e) return null;
    const t = this._displayList.pageRows, i = this._visibleCols(), n = (h) => t.findIndex((u) => this._rowId(u) === h), l = (h) => i.findIndex((u) => u.field === h), a = n(e.anchor.rowId), o = l(e.anchor.colId);
    if (a < 0 || o < 0) return null;
    const d = n(e.focus.rowId), c = l(e.focus.colId);
    return {
      r0: Math.min(a, d < 0 ? a : d),
      r1: Math.max(a, d < 0 ? a : d),
      c0: Math.min(o, c < 0 ? o : c),
      c1: Math.max(o, c < 0 ? o : c),
      rows: t,
      cols: i
    };
  }
  _activeRect() {
    return this._rangeRect(this.state.cellSel.ranges[this.state.cellSel.activeIdx]);
  }
  _cellRangeRows(e = this._activeRect()) {
    if (!e) return [];
    const t = [];
    for (let i = e.r0; i <= e.r1; i++) {
      const n = e.rows[i];
      if (!n) continue;
      const l = [];
      for (let a = e.c0; a <= e.c1; a++) {
        const o = e.cols[a];
        o && l.push(P(n, o));
      }
      t.push(l);
    }
    return t;
  }
  // Active cell key + union of all ranges' cells (active stays outlined, unfilled).
  _computeCellSelKeys() {
    const e = this._activeCell();
    if (!e) return { active: null, range: null };
    const t = `${e.rowId}:${e.colId}`, i = /* @__PURE__ */ new Set();
    for (const n of this.state.cellSel.ranges) {
      const l = this._rangeRect(n);
      if (l)
        for (let a = l.r0; a <= l.r1; a++) {
          const o = l.rows[a];
          if (o)
            for (let d = l.c0; d <= l.c1; d++) {
              const c = l.cols[d];
              if (!c) continue;
              const h = `${this._rowId(o)}:${c.field}`;
              h !== t && i.add(h);
            }
        }
    }
    return { active: t, range: i };
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
      const i = this._rangeRect(t);
      if (i)
        for (let n = i.r0; n <= i.r1; n++) {
          const l = i.rows[n];
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
  _moveActiveCell(e, t, i) {
    const n = this._displayList.pageRows, l = this._navCols();
    if (!n.length || !l.length) return;
    const a = (u, p, g) => Math.max(p, Math.min(u, g)), o = this._activeCell(), d = () => n.findIndex((u) => !u.__sgGroup && !u.__sgDetail && !u.__sgSeparator);
    let c = o ? n.findIndex((u) => this._rowId(u) === o.rowId) : d(), h = o ? l.findIndex((u) => u.field === o.colId) : 0;
    if (c < 0 && (c = d()), !(c < 0)) {
      if (h < 0 && (h = 0), i && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const u = this.state.cellSel.ranges[this.state.cellSel.activeIdx], p = a(n.findIndex((_) => this._rowId(_) === u.focus.rowId) + e, 0, n.length - 1), g = a(l.findIndex((_) => _.field === u.focus.colId) + t, 0, l.length - 1);
        this._extendActiveRange({ rowId: this._rowId(n[p]), colId: l[g].field });
      } else {
        let u = a(c + e, 0, n.length - 1);
        if (e !== 0) {
          for (; n[u] && (n[u].__sgGroup || n[u].__sgDetail || n[u].__sgSeparator); ) {
            const g = u + e;
            if (g < 0 || g >= n.length) break;
            u = g;
          }
          if (!n[u] || n[u].__sgGroup || n[u].__sgDetail || n[u].__sgSeparator) return;
        }
        const p = a(h + t, 0, l.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(n[u]), colId: l[p].field });
      }
      this._applyCellSelHighlight(), this._scrollActiveIntoView(), S(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
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
    }, this._applyCellSelHighlight(), S(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
  }
  // Clear the value of every selected, editable cell (Delete/Backspace).
  _clearSelectedCells() {
    let e = !1;
    for (const t of this.state.cellSel.ranges) {
      const i = this._rangeRect(t);
      if (i)
        for (let n = i.r0; n <= i.r1; n++) {
          const l = i.rows[n];
          if (!(!l || l.__sgGroup || l.__sgDetail || l.__sgSeparator))
            for (let a = i.c0; a <= i.c1; a++) {
              const o = i.cols[a];
              if (!o || !o.editable || o._isCheckbox || o._isRowNumber) continue;
              const d = l[o.field];
              d === "" || d == null || (l[o.field] = "", e = !0, S(this.element, "grid:cellValueChanged", { rowId: this._rowId(l), colId: o.field, oldValue: d, newValue: "" }));
            }
        }
    }
    return e && this.scheduleRender("cells"), e;
  }
  _scrollActiveIntoView() {
    this._tbody?.querySelector('td[data-cell-active="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  _onBodyDblClick(e) {
    const t = e.target.closest("tr"), i = e.target.closest("td");
    if (!t || !i || i.dataset.editing === "true") return;
    const n = this._coerceRowId(t.dataset.rowId), l = i.dataset.colId;
    this.startEditingCell(n, l);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const i = this._visibleCols().filter((u) => u.editable && !u._isCheckbox), n = this._displayList.pageRows, l = n.findIndex((u) => this._rowId(u) === t.rowId), a = i.findIndex((u) => u.field === t.colId);
    if (!i.length || !n.length || l < 0 || a < 0) {
      this.stopEditing(!1);
      return;
    }
    const o = n.length * i.length, d = (l * i.length + a + e + o) % o, c = n[Math.floor(d / i.length)], h = i[d % i.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(c), h.field), requestAnimationFrame(() => {
      this._navigatingEditor = !1;
    });
  }
  // Wire editor listeners whenever a cell mounts an input.
  // Done lazily via MutationObserver on tbody (cheap because tbody is small per page).
  // ----- Helpers -----
  _visibleCols() {
    const e = this.state.columnDefs.filter((o) => !o.hidden), t = this.state.group?.cols || [], i = this.masterDetailValue && !this.state.pivot?.mode && !t.length;
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
      return i ? [this._masterExpandCol(), ...e] : e;
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
    for (const i of e) {
      if (t.push(i), i.__sgGroup || i.__sgDetail || i.__sgSeparator) continue;
      const n = this._rowId(i);
      this._isDetailExpanded(n) && t.push({ __sgDetail: !0, master: i, masterId: n });
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
    const i = this.state.rowData.find((n) => String(this._rowId(n)) === t);
    S(this.element, "grid:detailRowExpanded", { rowId: e, masterRow: i });
  }
  collapseDetailRow(e) {
    if (!this.masterDetailValue) return;
    const t = String(e);
    if (!this._detailExpanded.has(t)) return;
    this._detailExpanded.delete(t), this._detailGrids.delete(t), this.scheduleRender("cells");
    const i = this.state.rowData.find((n) => String(this._rowId(n)) === t);
    S(this.element, "grid:detailRowCollapsed", { rowId: e, masterRow: i });
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
    const t = String(e), i = this._isTreeRowExpanded(t, 0);
    this._treeExpanded.set(t, !i), this.scheduleRender("tree");
    const n = this.state.rowData.find((l) => String(this._rowId(l)) === t);
    S(this.element, i ? "grid:treeRowCollapsed" : "grid:treeRowExpanded", { rowId: e, row: n });
  }
  expandTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !0), this.scheduleRender("tree");
    const i = this.state.rowData.find((n) => String(this._rowId(n)) === t);
    S(this.element, "grid:treeRowExpanded", { rowId: e, row: i });
  }
  collapseTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (!this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !1), this.scheduleRender("tree");
    const i = this.state.rowData.find((n) => String(this._rowId(n)) === t);
    S(this.element, "grid:treeRowCollapsed", { rowId: e, row: i });
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
    this.treeDataValue !== t && (this.treeDataValue = t, this.state.tree.enabled = t, t || this._treeExpanded.clear(), this.scheduleRender("tree"), S(this.element, "grid:treeDataChanged", { treeData: t }));
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
    return e || this._visibleCols().find((n) => !n._isCheckbox && !n._isRowNumber && !n._isGroupCol && !n._isMasterExpand)?.field || null;
  }
  // Build the detail <tr>: one cell spanning the full visible width, holding a
  // padded shell that hosts either a cloned <template> or a default summary
  // pulled from the master row.
  _buildDetailRow(e, t, i) {
    const n = `__d:${e.masterId}`;
    let l = i.get(n);
    const a = String(e.masterId);
    if (l) {
      if (l.getAttribute("data-master-id") === a)
        return l.classList.remove("sg-spacer"), l;
      l = null;
    }
    l || (l = f("tr")), l.className = "sg-detail-row", l.dataset.rowId = n, l.setAttribute("data-master-id", a), l.innerHTML = "";
    const o = f("td", { colspan: String(t.length || 1), class: "sg-detail-cell" }), d = f("div", { class: "sg-detail-shell" });
    return d.style.minHeight = `${this.detailRowHeightValue}px`, o.appendChild(d), l.appendChild(o), this._populateDetailShell(d, e.master, e.masterId), l;
  }
  // Fill the detail shell. Strategy: if the grid has a detail-template value
  // pointing at an existing <template>, clone its content and run a tiny
  // data-bind pass keyed off the master row. Otherwise render a minimal
  // fallback so the panel still appears (handy when the user is wiring up
  // their first detail panel and hasn't authored a template yet).
  _populateDetailShell(e, t, i) {
    const n = this.detailTemplateValue;
    let l;
    if (n) {
      const o = document.getElementById(n);
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
    a && this._seedNestedGrid(a, t, i), queueMicrotask(() => {
      S(this.element, "grid:detailRowMounted", {
        rowId: i,
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
    e.querySelectorAll("[data-detail-bind], [data-detail-bind-attr], [data-detail-if]").forEach((n) => {
      if (n.hasAttribute("data-detail-if")) {
        const l = n.getAttribute("data-detail-if");
        if (!t[l]) {
          n.remove();
          return;
        }
      }
      if (n.hasAttribute("data-detail-bind")) {
        const l = n.getAttribute("data-detail-bind");
        n.textContent = t[l] == null ? "" : String(t[l]);
      }
      if (n.hasAttribute("data-detail-bind-attr")) {
        const l = n.getAttribute("data-detail-bind-attr"), [a, o] = l.split(":");
        a && o && n.setAttribute(a, t[o] == null ? "" : String(t[o]));
      }
    });
  }
  // Seed a nested grid with the master row's detail rows before its controller
  // boots, so its first render shows the right data without an extra round
  // through scheduleRender. Cache the inner gridApi once it appears so the
  // outer grid can refresh it later if the master data is updated.
  _seedNestedGrid(e, t, i) {
    const n = this.detailRowsKeyValue;
    if (n) {
      const l = t?.[n];
      if (Array.isArray(l))
        try {
          e.setAttribute("data-grid-row-data-value", JSON.stringify(l));
        } catch {
        }
    }
    queueMicrotask(() => {
      e.gridApi && this._detailGrids.set(String(i), e.gridApi);
    });
  }
  _pinOffsets() {
    const e = this._visibleCols(), t = {};
    let i = 0;
    for (const l of e)
      l.pinned === "left" && (t[l.field] = i, i += l.width || 150);
    const n = {};
    i = 0;
    for (let l = e.length - 1; l >= 0; l--) {
      const a = e[l];
      a.pinned === "right" && (n[a.field] = i, i += a.width || 150);
    }
    return { left: t, right: n };
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
E(oe, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: ve },
  rowHeight: { type: Number, default: Is },
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
function Ps(s, r) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (s[t] !== r[t]) return !1;
  return !0;
}
function Fs(s) {
  return s === "number" || s === "date" ? [
    { value: "equals", label: "Equals" },
    { value: "notEqual", label: "Not equal" },
    { value: "lessThan", label: "Less than" },
    { value: "greaterThan", label: "Greater than" },
    { value: "inRange", label: "In range" },
    { value: "blank", label: "Blank" },
    { value: "notBlank", label: "Not blank" }
  ] : s === "boolean" ? [
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
function Bs(s, r) {
  if (r === "number") {
    const e = Number(s);
    return Number.isFinite(e) ? e : s;
  }
  if (r === "date") return s;
  if (r === "datetime") {
    if (!s) return s;
    const e = new Date(s);
    return Number.isNaN(e.getTime()) ? s : e.toISOString();
  }
  return r === "boolean" ? s === "true" ? !0 : s === "false" ? !1 : null : s;
}
function H(s) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(s)) : String(s).replace(/["\\\n\r]/g, (r) => "\\" + r);
}
class de extends z {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    E(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, i = e.clientY;
      let n = !1;
      const l = (o) => {
        const d = Math.abs(o.clientX - t), c = Math.abs(o.clientY - i);
        !n && (d > 5 || c > 5) && (n = !0, document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", a), this._beginReorder(t));
      }, a = (o) => {
        document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", a), n || this.sort(o);
      };
      document.addEventListener("mousemove", l), document.addEventListener("mouseup", a);
    });
  }
  connect() {
    if (this.grid = Kt(this.element, "grid", this.application), !!this.grid) {
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
    const t = this.element.parentElement, i = Array.from(t.children), n = i.indexOf(this.element);
    let l = n;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const a = (d) => {
      const c = d.clientX;
      let h = i.length;
      for (let u = 0; u < i.length; u++) {
        const p = i[u].getBoundingClientRect();
        if (c < p.left + p.width / 2) {
          h = u;
          break;
        }
      }
      l = h > n ? h - 1 : h;
    }, o = () => {
      document.removeEventListener("mousemove", a), document.removeEventListener("mouseup", o), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", l !== n && this.grid.moveColumn(this.fieldValue, l);
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
    const t = e.clientX, i = this.element.offsetWidth, n = (a) => this.grid.setColumnWidth(this.fieldValue, i + (a.clientX - t)), l = () => {
      document.removeEventListener("mousemove", n), document.removeEventListener("mouseup", l), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", n), document.addEventListener("mouseup", l), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
E(de, "values", {
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
class ht extends z {
  connect() {
  }
}
class pt extends z {
  connect() {
  }
}
class ft extends z {
  connect() {
  }
}
class J extends z {
  constructor() {
    super(...arguments);
    E(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), i = e.paginationGetTotalPages(), n = e.paginationGetRowCount(), l = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const a = n === 0 ? 0 : t * l + 1, o = Math.min(n, a + l - 1);
        this.pageInfoTarget.textContent = n === 0 ? "0 rows" : `${a}–${o} of ${n}`;
      }
      this.hasFirstTarget && (this.firstTarget.disabled = t === 0), this.hasPrevTarget && (this.prevTarget.disabled = t === 0), this.hasNextTarget && (this.nextTarget.disabled = t >= i - 1), this.hasLastTarget && (this.lastTarget.disabled = t >= i - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(l));
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
E(J, "outlets", ["grid"]), E(J, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
const ne = ["sum", "avg", "count", "min", "max"], $s = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', zs = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class gt extends z {
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
    this.element.innerHTML = "", this._content = f("div", { class: "sg-side-panel-content" });
    const r = f("div", { class: "sg-side-panel-tabs" });
    this._columnsTab = f("button", {
      type: "button",
      class: "sg-side-panel-tab",
      "aria-pressed": "true",
      title: "Columns"
    }), this._columnsTab.innerHTML = $s, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), r.appendChild(this._columnsTab), this.element.append(this._content, r);
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
    const e = f("label", { class: "sg-panel-pivot-toggle" }), t = f("input", { type: "checkbox" });
    t.checked = r.isPivotMode(), t.addEventListener("change", () => r.setPivotMode(t.checked)), e.append(t, f("span", {}, "Pivot mode")), this._content.appendChild(e), this._content.appendChild(this._renderColumnsList()), this._content.appendChild(this._renderDropSection({
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
    const r = this._api(), e = f("div", { class: "sg-panel-section" });
    e.appendChild(f("div", { class: "sg-panel-section-title" }, "Columns"));
    const t = f("ul", { class: "sg-column-list" });
    e.appendChild(t);
    const i = new Set(r.getRowGroupColumns()), n = new Set(r.getPivotColumns()), l = new Map(r.getValueColumns().map((a) => [a.field, a.aggFunc]));
    for (const a of this._columns()) {
      const o = f("li", { class: "sg-column-list-item", draggable: "true" });
      o.dataset.field = a.field;
      const d = f("span", { class: "sg-column-grip", "aria-hidden": "true" });
      d.innerHTML = zs;
      const c = f("input", { type: "checkbox" });
      c.checked = !a.hidden, c.addEventListener("change", () => r.setColumnVisible(a.field, c.checked));
      const h = f("span", { class: "sg-column-list-label" }, a.headerName || a.field), u = f("span", { class: "sg-column-list-tags" });
      i.has(a.field) && u.appendChild(f("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), n.has(a.field) && u.appendChild(f("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), l.has(a.field) && u.appendChild(f("span", { class: "sg-tag sg-tag-value", title: `Value (${l.get(a.field)})` }, l.get(a.field))), o.append(d, c, h, u), this._wireDragSource(o, a.field), t.appendChild(o);
    }
    return this._wireDropZone(t, "columns"), e;
  }
  _renderDropSection({ title: r, placeholder: e, kind: t, fields: i }) {
    const n = f("div", { class: "sg-panel-section sg-panel-drop" });
    n.appendChild(f("div", { class: "sg-panel-section-title" }, r));
    const l = f("div", { class: "sg-drop-zone" });
    if (l.dataset.dropKind = t, !i.length)
      l.classList.add("sg-drop-zone-empty"), l.appendChild(f("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const a of i) l.appendChild(this._renderChip(t, a));
    return this._wireDropZone(l, t), n.appendChild(l), n;
  }
  _renderValuesSection() {
    const r = this._api(), e = f("div", { class: "sg-panel-section sg-panel-drop" });
    e.appendChild(f("div", { class: "sg-panel-section-title" }, "Values"));
    const t = f("div", { class: "sg-drop-zone" });
    t.dataset.dropKind = "value";
    const i = r.getValueColumns();
    if (!i.length)
      t.classList.add("sg-drop-zone-empty"), t.appendChild(f("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
    else
      for (const { field: n, aggFunc: l } of i) t.appendChild(this._renderValueChip(n, l));
    return this._wireDropZone(t, "value"), e.appendChild(t), e;
  }
  _renderChip(r, e) {
    const t = this._colByField(e), i = f("span", { class: "sg-chip", draggable: "true" });
    return i.dataset.field = e, i.dataset.fromKind = r, i.append(
      f("span", { class: "sg-chip-label" }, t?.headerName || e),
      this._removeButton(() => this._removeFrom(r, e))
    ), this._wireDragSource(i, e), i;
  }
  _renderValueChip(r, e) {
    const t = this._api(), i = this._colByField(r), n = f("span", { class: "sg-chip sg-chip-value", draggable: "true" });
    n.dataset.field = r, n.dataset.fromKind = "value";
    const l = f("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return l.addEventListener("click", (a) => {
      a.stopPropagation();
      const o = ne.indexOf(e), d = ne[(o === -1 ? 0 : o + 1) % ne.length];
      t.setColumnAggFunc(r, d);
    }), n.append(
      l,
      f("span", { class: "sg-chip-label" }, i?.headerName || r),
      this._removeButton(() => t.removeValueColumn(r))
    ), this._wireDragSource(n, r), n;
  }
  _removeButton(r) {
    const e = f("button", { type: "button", class: "sg-chip-remove", "aria-label": "Remove", title: "Remove" });
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
      const i = t.dataTransfer.getData("text/plain");
      i && this._handleDrop(e, i);
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
function Hs(s) {
  const r = s ?? St.start();
  return r.register("grid", oe), r.register("header-cell", de), r.register("row", ht), r.register("cell", pt), r.register("filter", ft), r.register("pagination", J), r.register("side-panel", gt), r;
}
const Gs = {
  start: Hs,
  GridController: oe,
  HeaderCellController: de,
  RowController: ht,
  CellController: pt,
  FilterController: ft,
  PaginationController: J,
  SidePanelController: gt,
  registerRenderer: R,
  getRenderer: Re,
  listRenderers: qt,
  renderers: Vs
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = Gs);
export {
  pt as CellController,
  ft as FilterController,
  oe as GridController,
  de as HeaderCellController,
  J as PaginationController,
  ht as RowController,
  gt as SidePanelController,
  Gs as default,
  Re as getRenderer,
  qt as listRenderers,
  R as registerRenderer,
  Vs as renderers,
  Hs as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
