var Bt = Object.defineProperty;
var $t = (n, r, e) => r in n ? Bt(n, r, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[r] = e;
var D = (n, r, e) => $t(n, typeof r != "symbol" ? r + "" : r, e);
import { Controller as O, Application as Ht } from "@hotwired/stimulus";
function I(n, r) {
  return typeof r.valueGetter == "function" ? r.valueGetter(n) : n?.[r.field];
}
function H(n, r) {
  const e = I(n, r);
  return typeof r.valueFormatter == "function" ? r.valueFormatter(e, n) : e == null ? "" : r.type === "date" && e instanceof Date ? e.toLocaleDateString() : r.type === "boolean" ? e ? "✓" : "" : String(e);
}
const He = {
  contains: (n, r) => String(n ?? "").toLowerCase().includes(String(r ?? "").toLowerCase()),
  notContains: (n, r) => !String(n ?? "").toLowerCase().includes(String(r ?? "").toLowerCase()),
  equals: (n, r) => String(n ?? "").toLowerCase() === String(r ?? "").toLowerCase(),
  notEqual: (n, r) => String(n ?? "").toLowerCase() !== String(r ?? "").toLowerCase(),
  startsWith: (n, r) => String(n ?? "").toLowerCase().startsWith(String(r ?? "").toLowerCase()),
  endsWith: (n, r) => String(n ?? "").toLowerCase().endsWith(String(r ?? "").toLowerCase()),
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
}, zt = {
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
function F(n) {
  if (n == null || n === "") return null;
  if (n instanceof Date) return n;
  const r = new Date(n);
  return Number.isNaN(r.valueOf()) ? null : r;
}
const Gt = {
  equals: (n, r) => F(n)?.toDateString() === F(r)?.toDateString(),
  notEqual: (n, r) => F(n)?.toDateString() !== F(r)?.toDateString(),
  lessThan: (n, r) => (F(n)?.valueOf() ?? -1 / 0) < (F(r)?.valueOf() ?? 1 / 0),
  greaterThan: (n, r) => (F(n)?.valueOf() ?? 1 / 0) > (F(r)?.valueOf() ?? -1 / 0),
  inRange: (n, r, e) => {
    const t = F(n)?.valueOf();
    return t != null && t >= (F(r)?.valueOf() ?? -1 / 0) && t <= (F(e)?.valueOf() ?? 1 / 0);
  },
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
}, Ot = {
  equals: (n, r) => r === "true" ? !!n : r === "false" ? !n : !0
}, Kt = {
  in: (n, r) => Array.isArray(r) && r.includes(String(n ?? ""))
}, qt = { text: He, number: zt, date: Gt, boolean: Ot, set: Kt };
function ze(n, r, e) {
  if (!e) return !0;
  const t = e.filterType || r.filter || "text", i = (qt[t] || He)[e.type];
  if (!i) return !0;
  const a = I(n, r);
  return i(a, e.value, e.value2);
}
function Ge(n, r, e) {
  const t = Object.entries(r || {}).filter(([, s]) => s != null);
  return t.length === 0 ? n : n.filter((s) => s && s.__sgSeparator ? !0 : t.every(([i, a]) => {
    const l = e[i];
    return l ? ze(s, l, a) : !0;
  }));
}
function Oe(n, r, e) {
  if (!r) return n;
  const t = String(r).toLowerCase();
  return n.filter((s) => {
    if (s && s.__sgSeparator) return !0;
    for (const i of e) {
      const a = H(s, i);
      if (a && String(a).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function G(n, r, e) {
  if (n == null && r == null) return 0;
  if (n == null) return -1;
  if (r == null) return 1;
  if (e === "number") return Number(n) - Number(r);
  if (e === "date") {
    const t = F(n)?.valueOf() ?? 0, s = F(r)?.valueOf() ?? 0;
    return t - s;
  }
  return e === "boolean" ? n === r ? 0 : n ? 1 : -1 : String(n).localeCompare(String(r), void 0, { numeric: !0, sensitivity: "base" });
}
function Wt(n, r, e) {
  if (!r || r.length === 0) return n;
  const t = (o, d) => {
    for (const { colId: c, sort: h } of r) {
      const u = e[c];
      if (!u) continue;
      const p = I(o, u), f = I(d, u), _ = typeof u.comparator == "function" ? u.comparator(p, f, o, d) : G(p, f, u.type);
      if (_ !== 0) return h === "desc" ? -_ : _;
    }
    return 0;
  };
  if (!n.some((o) => o && o.__sgSeparator)) return n.slice().sort(t);
  const i = [];
  let a = [];
  const l = () => {
    if (a.length) {
      a.sort(t);
      for (const o of a) i.push(o);
      a = [];
    }
  };
  for (const o of n)
    o && o.__sgSeparator ? (l(), i.push(o)) : a.push(o);
  return l(), i;
}
function se(n, r) {
  if (!r || !r.enabled) return { rows: n, total: n.length, pageRows: n };
  const e = n.length, t = Math.max(1, Math.ceil(e / r.pageSize)), s = Math.min(r.page, t - 1), i = s * r.pageSize, a = n.slice(i, i + r.pageSize);
  return { rows: n, total: e, totalPages: t, page: s, pageRows: a };
}
function Ke(n, r, e) {
  if (n === "count") return r.length;
  const t = r.map((i) => I(i, e));
  if (n === "first") return t.length ? t[0] : null;
  if (n === "last") return t.length ? t[t.length - 1] : null;
  const s = t.map(Number).filter((i) => !Number.isNaN(i));
  switch (n) {
    case "sum":
      return s.reduce((i, a) => i + a, 0);
    case "avg":
      return s.length ? s.reduce((i, a) => i + a, 0) / s.length : null;
    case "min":
      return s.length ? Math.min(...s) : null;
    case "max":
      return s.length ? Math.max(...s) : null;
    default:
      return null;
  }
}
function le(n, r, e) {
  const t = {};
  for (const [s, i] of Object.entries(r || {})) {
    const a = e[s];
    a && (t[s] = Ke(i, n, a));
  }
  return t;
}
function Ut(n) {
  let r = 0, e = 0, t = 0, s = 1 / 0, i = -1 / 0;
  for (const a of n) {
    if (a == null || a === "") continue;
    r += 1;
    let l = null;
    if (typeof a == "number" && Number.isFinite(a)) l = a;
    else if (typeof a == "string" && a.trim() !== "") {
      const o = Number(a);
      Number.isFinite(o) && (l = o);
    }
    l != null && (e += 1, t += l, l < s && (s = l), l > i && (i = l));
  }
  return {
    count: r,
    sum: e ? t : null,
    avg: e ? t / e : null,
    min: e ? s : null,
    max: e ? i : null
  };
}
function jt(n, r, e, t, s = () => !0) {
  const i = (d, c, h) => {
    const u = r[c], p = /* @__PURE__ */ new Map();
    for (const f of d) {
      const _ = I(f, u), y = _ == null ? "" : String(_);
      p.has(y) || p.set(y, { value: _, rows: [] }), p.get(y).rows.push(f);
    }
    return Array.from(p.values()).sort((f, _) => G(f.value, _.value, u.type)).map(({ value: f, rows: _ }) => {
      const y = f == null ? "" : String(f), C = h ? `${h}|${u.field}=${y}` : `${u.field}=${y}`;
      return {
        __sgGroup: !0,
        level: c,
        field: u.field,
        value: f,
        groupId: C,
        count: _.length,
        aggregates: le(_, t, e),
        leaves: _,
        children: c + 1 < r.length ? i(_, c + 1, C) : null
      };
    });
  }, a = i(n, 0, ""), l = [], o = (d) => {
    for (const c of d)
      if (l.push(c), !!s(c.groupId, c.level))
        if (c.children) o(c.children);
        else for (const h of c.leaves) l.push(h);
  };
  return o(a), { displayList: l, tree: a };
}
function qe(n, r, e) {
  return `__p|${e.map((s) => {
    const i = n[s.field];
    return `${s.field}=${i == null ? "" : String(i)}`;
  }).join("|")}|${r.col.field}:${r.aggFunc}`;
}
function We(n, r) {
  return r.map((e) => {
    const t = I(n, e);
    return t == null ? "" : String(t);
  }).join("");
}
function Xt(n, r) {
  if (!r?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const t of n) {
    const s = We(t, r);
    if (!e.has(s)) {
      const i = {};
      r.forEach((a) => {
        const l = I(t, a);
        i[a.field] = l ?? null;
      }), e.set(s, i);
    }
  }
  return Array.from(e.values()).sort((t, s) => {
    for (const i of r) {
      const a = G(t[i.field], s[i.field], i.type);
      if (a !== 0) return a;
    }
    return 0;
  });
}
function Yt(n, r, e) {
  if (!n.length || !r.length) return [];
  const t = [], s = r.length === 1;
  for (const i of n)
    for (const a of r) {
      const l = qe(i, a, e), o = e.map((c) => i[c.field] == null ? "(Blank)" : String(i[c.field])).join(" · "), d = s ? o : `${o} · ${a.aggFunc}(${a.col.field})`;
      t.push({
        field: l,
        headerName: d,
        type: "number",
        width: 100,
        sortable: !0,
        filter: null,
        resizable: !1,
        _isPivot: !0,
        pivotKeys: { ...i },
        valueField: a.col.field,
        aggFunc: a.aggFunc,
        valueGetter: (c) => c?.__pivotValues?.[l] ?? null
      });
    }
  return t;
}
function Qt(n) {
  return typeof n == "string" && n.startsWith("__p|");
}
function Zt(n, r) {
  const e = Array.isArray(n) ? n.filter((t) => t && t.colId && t.sort) : [];
  return (t, s) => {
    for (const i of e) {
      const a = i.sort === "desc" ? -1 : 1;
      if (Qt(i.colId)) {
        const l = t.__pivotValues ? t.__pivotValues[i.colId] : null, o = s.__pivotValues ? s.__pivotValues[i.colId] : null, d = G(l, o, "number");
        if (d !== 0) return a * d;
        continue;
      }
      if (r && i.colId === r.field) {
        const l = G(t.value, s.value, r.type);
        if (l !== 0) return a * l;
        continue;
      }
    }
    return G(t.value, s.value, r?.type);
  };
}
function De(n, r, e, t) {
  const s = {}, i = /* @__PURE__ */ new Map();
  for (const a of n) {
    const l = We(a, t);
    i.has(l) || i.set(l, []), i.get(l).push(a);
  }
  for (const a of r) {
    const l = t.map((d) => {
      const c = a[d.field];
      return c == null ? "" : String(c);
    }).join(""), o = i.get(l) || [];
    for (const d of e) {
      const c = qe(a, d, t);
      s[c] = o.length ? Ke(d.aggFunc, o, d.col) : null;
    }
  }
  return s;
}
function Jt({ rows: n, rowGroupCols: r = [], pivotCols: e, valueConfigs: t, isExpanded: s = () => !0, sortModel: i = [] }) {
  const a = Xt(n, e), l = Yt(a, t, e), o = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: n.length,
    aggregates: {},
    leaves: n,
    __pivotValues: De(n, a, t, e)
  };
  if (!r.length)
    return { columns: l, displayList: [o], tree: [], combos: a };
  const d = (p, f, _) => {
    const y = r[f], C = /* @__PURE__ */ new Map();
    for (const w of p) {
      const x = I(w, y), L = x == null ? "" : String(x);
      C.has(L) || C.set(L, { value: x, rows: [] }), C.get(L).rows.push(w);
    }
    const v = Array.from(C.values()).map(({ value: w, rows: x }) => {
      const L = w == null ? "" : String(w), R = _ ? `${_}|${y.field}=${L}` : `${y.field}=${L}`;
      return {
        __sgGroup: !0,
        level: f,
        field: y.field,
        value: w,
        groupId: R,
        count: x.length,
        aggregates: {},
        leaves: x,
        __pivotValues: De(x, a, t, e),
        children: f + 1 < r.length ? d(x, f + 1, R) : null
      };
    }), b = Zt(i, y);
    return v.sort(b);
  }, c = d(n, 0, ""), h = [o], u = (p) => {
    for (const f of p)
      h.push(f), s(f.groupId, f.level) && f.children && u(f.children);
  };
  return u(c), { columns: l, displayList: h, tree: c, combos: a };
}
function es(n, { pivotCols: r = [], valueConfigs: e = [], columnGroups: t = null } = {}) {
  if (n._isPivot && r.length && n.pivotKeys)
    return ts(n, r, e);
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
function ts(n, r, e) {
  const t = (e?.length || 0) > 1, s = [];
  for (let i = 0; i < r.length; i++) {
    const a = r[i].field, l = n.pivotKeys[a];
    if (i === r.length - 1 && !t)
      return s.push({ kind: "leaf", col: n, label: l == null ? "(Blank)" : String(l) }), s;
    s.push({
      kind: "group",
      id: `p:${i}:${l == null ? "" : String(l)}`,
      label: l == null ? "(Blank)" : String(l)
    });
  }
  return s.push({ kind: "leaf", col: n, label: `${n.aggFunc}(${n.valueField})` }), s;
}
function ss(n, r = {}) {
  if (!n.length) return { rows: [[]], depth: 1 };
  const e = n.map((i) => es(i, r).slice()), t = Math.max(1, ...e.map((i) => i.length)), s = [];
  for (let i = 0; i < t; i++) {
    const a = [];
    let l = 0;
    for (; l < e.length; ) {
      const o = e[l];
      if (i >= o.length || o[i] === null) {
        l += 1;
        continue;
      }
      const d = o[i];
      if (d.kind === "leaf") {
        a.push({ kind: "leaf", col: d.col, label: d.label, rowspan: t - i, colspan: 1 });
        for (let h = i + 1; h < t; h++) o[h] = null;
        l += 1;
        continue;
      }
      let c = l + 1;
      for (; c < e.length; ) {
        const h = e[c];
        if (i >= h.length || !h[i] || h[i].kind !== "group" || h[i].id !== d.id) break;
        let u = !0;
        for (let p = 0; p < i; p++) {
          const f = o[p]?.id ?? null, _ = h[p]?.id ?? null;
          if (f !== _) {
            u = !1;
            break;
          }
        }
        if (!u) break;
        c += 1;
      }
      a.push({ kind: "group", label: d.label, colspan: c - l, rowspan: 1 }), l = c;
    }
    s.push(a);
  }
  return { rows: s, depth: t };
}
function ns({
  rows: n,
  parentField: r = "parent_id",
  getRowId: e = (a) => a?.id,
  passesFilter: t = null,
  siblingComparator: s = null,
  isExpanded: i = () => !0
} = {}) {
  if (!Array.isArray(n) || n.length === 0)
    return { displayList: [], treeMeta: /* @__PURE__ */ new Map() };
  const a = (y) => {
    const C = e(y);
    return C == null ? null : String(C);
  }, l = /* @__PURE__ */ new Map();
  for (const y of n) {
    const C = a(y);
    C != null && l.set(C, y);
  }
  const o = /* @__PURE__ */ new Map(), d = [];
  for (const y of n) {
    const C = a(y), v = y?.[r], b = v == null ? null : String(v);
    b == null || b === C || !l.has(b) ? d.push(y) : (o.has(b) || o.set(b, []), o.get(b).push(y));
  }
  const c = t ? new Map(n.map((y) => [a(y), !!t(y)])) : null, h = /* @__PURE__ */ new Map(), u = (y, C) => {
    const v = a(y);
    if (v == null) return !1;
    if (h.has(v)) return h.get(v);
    if (C.has(v)) return !1;
    C.add(v);
    let b = !!c.get(v);
    const w = o.get(v) || [];
    for (const x of w) b = u(x, C) || b;
    return C.delete(v), h.set(v, b), b;
  };
  if (c)
    for (const y of d) u(y, /* @__PURE__ */ new Set());
  const p = [], f = /* @__PURE__ */ new Map(), _ = (y, C, v, b) => {
    const w = c ? y.filter((x) => b || h.get(a(x))) : y.slice();
    s && w.sort(s);
    for (const x of w) {
      const L = a(x);
      if (L == null || v.has(L)) continue;
      const R = o.get(L) || [], T = b || (c ? !!c.get(L) : !1), k = c ? R.filter((B) => T || h.get(a(B))) : R, E = k.length > 0, P = E && (c ? !0 : !!i(L, C));
      f.set(L, { level: C, hasChildren: E, expanded: P }), p.push(x), P && (v.add(L), _(k, C + 1, v, T), v.delete(L));
    }
  };
  return _(d, 0, /* @__PURE__ */ new Set(), !1), { displayList: p, treeMeta: f };
}
function is(n) {
  if (n.serverSide) {
    const c = n.rowData, h = n.pagination?.pageSize || c.length || 1, u = n.serverRowCount ?? c.length, p = Math.max(1, Math.ceil(u / h)), f = Math.min(n.pagination?.page || 0, p - 1);
    return { filteredSorted: c, rows: c, total: u, totalPages: p, page: f, pageRows: c };
  }
  const r = Object.fromEntries(n.columnDefs.map((c) => [c.field, c])), e = n.columnDefs.filter((c) => !c.hidden && !c._isCheckbox), t = (n.rowGroupCols || []).filter((c) => r[c]);
  if (n.treeData && !n.pivotMode && t.length === 0) {
    const c = n.treeParentField || "parent_id", h = Object.entries(n.filterModel || {}).filter(([, x]) => x != null), u = n.quickFilter ? String(n.quickFilter).toLowerCase() : "", f = h.length > 0 || u !== "" ? (x) => {
      for (const [L, R] of h) {
        const T = r[L];
        if (T && !ze(x, T, R)) return !1;
      }
      if (u) {
        let L = !1;
        for (const R of e) {
          const T = H(x, R);
          if (T && String(T).toLowerCase().includes(u)) {
            L = !0;
            break;
          }
        }
        if (!L) return !1;
      }
      return !0;
    } : null, _ = Array.isArray(n.sortModel) ? n.sortModel : [], y = _.length ? (x, L) => {
      for (const { colId: R, sort: T } of _) {
        const k = r[R];
        if (!k) continue;
        const E = I(x, k), P = I(L, k), B = typeof k.comparator == "function" ? k.comparator(E, P, x, L) : G(E, P, k.type);
        if (B !== 0) return T === "desc" ? -B : B;
      }
      return 0;
    } : null, C = n.getRowId || ((x) => x?.id), { displayList: v, treeMeta: b } = ns({
      rows: n.rowData,
      parentField: c,
      getRowId: C,
      passesFilter: f,
      siblingComparator: y,
      isExpanded: n.isTreeRowExpanded || (() => !0)
    }), w = se(v, n.pagination);
    return {
      tree: !0,
      treeData: !0,
      treeMeta: b,
      treeParentField: c,
      filteredSorted: v,
      ...w
    };
  }
  let s = n.rowData;
  s = Ge(s, n.filterModel, r), s = Oe(s, n.quickFilter, e), s = Wt(s, n.sortModel, r);
  const i = t, a = n.pivotMode ? (n.pivotCols || []).filter((c) => r[c]) : [], l = n.pivotMode ? Object.entries(n.aggModel || {}).filter(([c]) => r[c]).map(([c, h]) => ({ col: r[c], aggFunc: h })) : [];
  if (n.pivotMode && a.length && l.length) {
    const c = i.map((C) => r[C]), h = a.map((C) => r[C]), { columns: u, displayList: p, tree: f, combos: _ } = Jt({
      rows: s,
      rowGroupCols: c,
      pivotCols: h,
      valueConfigs: l,
      isExpanded: n.isGroupExpanded,
      sortModel: n.sortModel
    }), y = se(p, n.pagination);
    return {
      pivot: !0,
      pivotResultColumns: u,
      combos: _,
      grouped: !0,
      tree: f,
      leafCount: s.length,
      grandTotals: le(s, n.aggModel, r),
      filteredSorted: p,
      ...y
    };
  }
  if (i.length) {
    const c = i.map((f) => r[f]), { displayList: h, tree: u } = jt(
      s,
      c,
      r,
      n.aggModel,
      n.isGroupExpanded
    ), p = se(h, n.pagination);
    return {
      grouped: !0,
      tree: u,
      leafCount: s.length,
      grandTotals: le(s, n.aggModel, r),
      filteredSorted: h,
      ...p
    };
  }
  const o = se(s, n.pagination), d = n.aggModel && Object.keys(n.aggModel).length ? le(s, n.aggModel, r) : null;
  return { filteredSorted: s, grandTotals: d, ...o };
}
function rs(n, r, e, t, s = 6) {
  const i = Math.ceil(r / e), a = Math.max(0, Math.floor(n / e) - s), l = Math.min(t, a + i + s * 2);
  return { first: a, last: l };
}
function as(n) {
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
function g(n, r = {}, e = []) {
  const t = document.createElement(n);
  for (const [s, i] of Object.entries(r))
    i === !1 || i == null || (s === "class" ? t.className = i : s === "style" && typeof i == "object" ? Object.assign(t.style, i) : s.startsWith("on") && typeof i == "function" ? t.addEventListener(s.slice(2).toLowerCase(), i) : i === !0 ? t.setAttribute(s, "") : t.setAttribute(s, String(i)));
  for (const s of [].concat(e))
    s == null || s === !1 || t.appendChild(typeof s == "string" ? document.createTextNode(s) : s);
  return t;
}
function Te(n, r) {
  for (const [e, t] of Object.entries(r))
    t == null || t === !1 ? n.removeAttribute(e) : t === !0 ? n.setAttribute(e, "") : n.setAttribute(e, String(t));
}
function ke(n) {
  const r = document.getElementById(n);
  return !r || r.tagName !== "TEMPLATE" ? null : r.content.firstElementChild.cloneNode(!0);
}
function S(n, r, e) {
  n.dispatchEvent(new CustomEvent(r, { detail: e, bubbles: !0 }));
}
function ls(n, r, e) {
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
const be = /* @__PURE__ */ new Map();
function M(n, r) {
  if (typeof n != "string" || !n) throw new Error("registerRenderer: name must be a non-empty string");
  if (typeof r != "function") throw new Error("registerRenderer: fn must be a function");
  be.set(n, r);
}
function Ue(n) {
  return be.get(n) || null;
}
function os() {
  return Array.from(be.keys());
}
function m(n, r = {}, e = null) {
  const t = document.createElement(n);
  for (const [s, i] of Object.entries(r))
    i == null || i === !1 || (s === "class" ? t.className = i : t.setAttribute(s, i === !0 ? "" : String(i)));
  return e == null || (Array.isArray(e) ? e.forEach((s) => t.append(s)) : typeof e == "string" ? t.innerHTML = e : t.append(e)), t;
}
const V = (n) => n == null || n === "", ds = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function je() {
  return ({ value: n }) => {
    if (V(n)) return "";
    const r = String(n);
    return ds.test(r) ? m("a", {
      class: "sg-renderer-link",
      href: `mailto:${r}`,
      title: "Send email"
    }, document.createTextNode(r)) : m("span", { class: "sg-renderer-invalid", title: "Invalid email" }, document.createTextNode(r));
  };
}
function Xe({ newTab: n = !0 } = {}) {
  return ({ value: r }) => {
    if (V(r)) return "";
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
      target: n ? "_blank" : null,
      rel: n ? "noopener noreferrer" : null,
      title: e
    }, document.createTextNode(t.hostname + (t.pathname !== "/" ? t.pathname : "")));
  };
}
function Ye({ defaultRegion: n = "AU" } = {}) {
  return ({ value: r }) => {
    if (V(r)) return "";
    const e = String(r).trim(), t = e.replace(/\D/g, "");
    if (!t) return document.createTextNode(e);
    let s = e;
    return n === "AU" && (/^04\d{8}$/.test(t) ? s = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : /^0[2378]\d{8}$/.test(t) ? s = `(${t.slice(0, 2)}) ${t.slice(2, 6)} ${t.slice(6)}` : /^1[38]00\d{6}$/.test(t) ? s = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : t.length === 8 && (s = `${t.slice(0, 4)} ${t.slice(4)}`)), m("a", { class: "sg-renderer-link", href: `tel:${t}` }, document.createTextNode(s));
  };
}
function Qe({ currency: n = "USD", locale: r = "en-US", decimals: e } = {}) {
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-number"), V(t)) return "";
    const i = Number(t);
    if (!Number.isFinite(i)) return String(t);
    const a = { style: "currency", currency: n };
    return e != null && (a.minimumFractionDigits = e, a.maximumFractionDigits = e), i.toLocaleString(r, a);
  };
}
function Ze({ decimals: n = 0, scale: r = "as-is" } = {}) {
  return ({ value: e, td: t }) => {
    if (t && t.classList.add("sg-renderer-number"), V(e)) return "";
    let s = Number(e);
    return Number.isFinite(s) ? (r === "fraction" && (s *= 100), `${s.toFixed(n)}%`) : String(e);
  };
}
function we(n) {
  if (n == null || n === "") return null;
  if (n instanceof Date) return Number.isNaN(n.valueOf()) ? null : n;
  const r = new Date(n);
  return Number.isNaN(r.valueOf()) ? null : r;
}
function Je({ locale: n = void 0, dateStyle: r = "medium", ...e } = {}) {
  const t = new Intl.DateTimeFormat(n, { dateStyle: r, ...e });
  return ({ value: s }) => {
    const i = we(s);
    return i ? t.format(i) : "";
  };
}
function et({ locale: n = void 0, dateStyle: r = "medium", timeStyle: e = "short", ...t } = {}) {
  const s = new Intl.DateTimeFormat(n, { dateStyle: r, timeStyle: e, ...t });
  return ({ value: i }) => {
    const a = we(i);
    return a ? s.format(a) : "";
  };
}
const me = [
  { unit: "second", ms: 1e3, cutoff: 60 * 1e3 },
  { unit: "minute", ms: 60 * 1e3, cutoff: 3600 * 1e3 },
  { unit: "hour", ms: 3600 * 1e3, cutoff: 1440 * 60 * 1e3 },
  { unit: "day", ms: 1440 * 60 * 1e3, cutoff: 10080 * 60 * 1e3 },
  { unit: "week", ms: 10080 * 60 * 1e3, cutoff: 720 * 60 * 60 * 1e3 },
  { unit: "month", ms: 720 * 60 * 60 * 1e3, cutoff: 365 * 24 * 60 * 60 * 1e3 },
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1e3, cutoff: 1 / 0 }
];
function tt({ locale: n = void 0, numeric: r = "auto", style: e = "long" } = {}) {
  const t = new Intl.RelativeTimeFormat(n, { numeric: r, style: e });
  return ({ value: s }) => {
    const i = we(s);
    if (!i) return "";
    const a = i.getTime() - Date.now(), l = Math.abs(a), o = me.find((h) => l < h.cutoff) || me[me.length - 1], d = Math.round(a / o.ms), c = m("span", { class: "sg-renderer-relative-time", title: i.toLocaleString() });
    return c.textContent = t.format(d, o.unit), c;
  };
}
const cs = { ms: 1, sec: 1e3, second: 1e3, min: 6e4, minute: 6e4, hr: 36e5, hour: 36e5 };
function st({ unit: n = "ms", style: r = "compact" } = {}) {
  const e = cs[n] ?? 1;
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-number"), V(t)) return "";
    const i = Number(t) * e;
    if (!Number.isFinite(i)) return String(t);
    const a = i < 0 ? "-" : "", l = Math.abs(i), o = Math.floor(l / 36e5), d = Math.floor(l % 36e5 / 6e4), c = Math.floor(l % 6e4 / 1e3);
    if (r === "clock") {
      const u = (p) => String(p).padStart(2, "0");
      return a + (o > 0 ? `${u(o)}:${u(d)}:${u(c)}` : `${u(d)}:${u(c)}`);
    }
    if (r === "words") {
      const u = [];
      return o && u.push(`${o} ${o === 1 ? "hour" : "hours"}`), d && u.push(`${d} ${d === 1 ? "minute" : "minutes"}`), !o && c && u.push(`${c} ${c === 1 ? "second" : "seconds"}`), a + (u.join(" ") || "0 seconds");
    }
    const h = [];
    return o && h.push(`${o}h`), d && h.push(`${d}m`), !o && c && h.push(`${c}s`), a + (h.join(" ") || "0s");
  };
}
function nt({ locale: n = void 0, decimals: r, ...e } = {}) {
  const t = { ...e };
  r != null && (t.minimumFractionDigits = r, t.maximumFractionDigits = r);
  const s = new Intl.NumberFormat(n, t);
  return ({ value: i, td: a }) => {
    if (a && a.classList.add("sg-renderer-number"), V(i)) return "";
    const l = Number(i);
    return Number.isFinite(l) ? s.format(l) : String(i);
  };
}
function it({ locale: n = void 0, compactDisplay: r = "short", maximumFractionDigits: e = 1 } = {}) {
  const t = new Intl.NumberFormat(n, {
    notation: "compact",
    compactDisplay: r,
    maximumFractionDigits: e
  });
  return ({ value: s, td: i }) => {
    if (i && i.classList.add("sg-renderer-number"), V(s)) return "";
    const a = Number(s);
    return Number.isFinite(a) ? t.format(a) : String(s);
  };
}
function rt({ binary: n = !0, decimals: r = 1, locale: e = void 0 } = {}) {
  const t = n ? 1024 : 1e3, s = n ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"], i = new Intl.NumberFormat(e, {
    minimumFractionDigits: r,
    maximumFractionDigits: r
  });
  return ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-number"), V(a)) return "";
    let o = Number(a);
    if (!Number.isFinite(o)) return String(a);
    const d = o < 0 ? "-" : "";
    o = Math.abs(o);
    let c = 0;
    for (; o >= t && c < s.length - 1; )
      o /= t, c += 1;
    const h = c === 0 ? String(Math.round(o)) : i.format(o);
    return `${d}${h} ${s[c]}`;
  };
}
const us = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on"]);
function Ce(n) {
  return n === !0 || n === 1 ? !0 : n == null || n === "" || n === !1 || n === 0 ? !1 : us.has(String(n).toLowerCase());
}
const hs = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>', ps = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
function at({
  truthy: n = Ce,
  nullLabel: r = "—",
  falseStyle: e = "icon"
  // 'icon' | 'hidden'
} = {}) {
  return ({ value: t }) => {
    if (t == null || t === "")
      return m("span", { class: "sg-renderer-bool-null" }, document.createTextNode(r));
    if (n(t)) {
      const i = m("span", { class: "sg-renderer-bool is-true", "aria-label": "true" });
      return i.innerHTML = hs, i;
    }
    if (e === "hidden") return "";
    const s = m("span", { class: "sg-renderer-bool is-false", "aria-label": "false" });
    return s.innerHTML = ps, s;
  };
}
const fs = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>', gs = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.7 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>', ms = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M64 256a32 32 0 1 0 0-64H384V160c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9S384 364.9 384 352V320H64z"/></svg>';
function lt({
  style: n = "percent",
  // 'percent' | 'number' | 'currency'
  decimals: r = 1,
  locale: e = void 0,
  currency: t = "USD",
  inverted: s = !1,
  showSign: i = !0
} = {}) {
  let a;
  return n === "currency" ? a = new Intl.NumberFormat(e, {
    style: "currency",
    currency: t,
    minimumFractionDigits: r,
    maximumFractionDigits: r,
    signDisplay: i ? "always" : "auto"
  }) : a = new Intl.NumberFormat(e, {
    minimumFractionDigits: r,
    maximumFractionDigits: r,
    signDisplay: i ? "always" : "auto"
  }), ({ value: l, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), V(l)) return "";
    const d = Number(l);
    if (!Number.isFinite(d)) return String(l);
    let c = "is-flat", h = ms;
    const u = !s;
    d > 0 ? (c = u ? "is-up" : "is-down", h = fs) : d < 0 && (c = u ? "is-down" : "is-up", h = gs);
    const p = m("span", { class: `sg-renderer-delta ${c}` }), f = m("span", { class: "sg-renderer-delta-icon", "aria-hidden": "true" });
    f.innerHTML = h;
    const _ = n === "percent" ? `${a.format(d)}%` : a.format(d);
    return p.append(f), p.append(m("span", { class: "sg-renderer-delta-value" }, document.createTextNode(_))), p;
  };
}
function ot({ chars: n = null } = {}) {
  return ({ value: r, td: e }) => {
    if (V(r)) return "";
    const t = String(r);
    let s = t, i = !1;
    return n && t.length > n && (s = t.slice(0, n) + "…", i = !0), e && (e.classList.add("sg-renderer-truncate"), e.setAttribute("title", t)), i ? s : t;
  };
}
const Ve = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>', _s = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';
function dt({ position: n = "after" } = {}) {
  return ({ value: r }) => {
    if (V(r)) return "";
    const e = String(r), t = m("span", { class: "sg-renderer-copyable" }), s = m("span", { class: "sg-renderer-copyable-value" }, document.createTextNode(e)), i = m("button", {
      type: "button",
      class: "sg-renderer-copyable-btn",
      title: "Copy",
      "aria-label": `Copy ${e}`
    });
    return i.innerHTML = Ve, i.addEventListener("click", async (a) => {
      a.stopPropagation(), a.preventDefault();
      try {
        navigator.clipboard?.writeText ? await navigator.clipboard.writeText(e) : vs(e), i.innerHTML = _s, i.classList.add("is-copied"), setTimeout(() => {
          i.innerHTML = Ve, i.classList.remove("is-copied");
        }, 1200);
      } catch {
      }
    }), n === "before" ? t.append(i, s) : t.append(s, i), t;
  };
}
function vs(n) {
  const r = document.createElement("textarea");
  r.value = n, r.style.position = "fixed", r.style.left = "-9999px", document.body.appendChild(r), r.select();
  try {
    document.execCommand("copy");
  } catch {
  }
  document.body.removeChild(r);
}
function ct({
  size: n = 36,
  rounded: r = "sm",
  // 'sm' = 4px, 'lg' = 8px, 'full' = circle, 'none'
  altField: e = "alt",
  clickToZoom: t = !1
} = {}) {
  const s = r === "full" ? "999px" : r === "lg" ? "8px" : r === "none" ? "0" : "4px";
  return ({ value: i, row: a }) => {
    if (V(i)) return "";
    const l = String(i), o = a?.[e] ?? "", d = m("img", {
      src: l,
      alt: o,
      class: "sg-renderer-image",
      width: String(n),
      height: String(n),
      style: `border-radius: ${s};`,
      loading: "lazy",
      decoding: "async"
    });
    return t && (d.style.cursor = "zoom-in", d.addEventListener("click", (c) => {
      c.stopPropagation(), ys(l, o);
    })), d;
  };
}
function ys(n, r) {
  const e = m("div", { class: "sg-image-zoom" }), t = () => {
    e.remove(), document.removeEventListener("keydown", s);
  }, s = (i) => {
    i.key === "Escape" && t();
  };
  e.addEventListener("click", t), document.addEventListener("keydown", s), e.append(m("img", { src: n, alt: r || "", class: "sg-image-zoom-img" })), document.body.appendChild(e);
}
function ut({
  showLabel: n = !0,
  label: r = "value",
  // 'value' | 'name' | (value, row) => string
  shape: e = "circle",
  // 'circle' | 'square'
  size: t = 14
} = {}) {
  return ({ value: s, row: i }) => {
    if (V(s)) return "";
    const a = String(s).trim(), l = m("span", { class: "sg-renderer-swatch" }), o = m("span", {
      class: `sg-renderer-swatch-chip is-${e}`,
      style: `width: ${t}px; height: ${t}px; background: ${a};`,
      "aria-hidden": "true"
    });
    if (l.append(o), n) {
      const d = typeof r == "function" ? r(s, i) : r === "name" ? i?.name ?? a : a;
      l.append(m("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(d)));
    }
    return l;
  };
}
const bs = {
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  orange: "#f97316",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#6b7280"
};
function ht({
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
  const a = bs[t] || t;
  return ({ value: l }) => {
    if (!Array.isArray(l) || l.length === 0) return "";
    const o = l.map(Number).filter((b) => Number.isFinite(b));
    if (o.length === 0) return "";
    const d = s ?? Math.min(...o), h = Math.max(...o, s ?? -1 / 0) - d || 1, u = 1.5, p = 2.5, f = r - u * 2, _ = e - p * 2, y = (b) => u + (o.length === 1 ? f / 2 : b / (o.length - 1) * f), C = (b) => p + _ - (b - d) / h * _;
    let v = "";
    if (n === "bar") {
      const w = Math.max(1, (f - (o.length - 1) * 1) / o.length);
      for (let x = 0; x < o.length; x++) {
        const L = o[x], R = u + x * (w + 1), T = C(L), k = p + _ - T;
        v += `<rect x="${R.toFixed(2)}" y="${T.toFixed(2)}" width="${w.toFixed(2)}" height="${k.toFixed(2)}" fill="${a}"/>`;
      }
    } else {
      let b = "";
      for (let w = 0; w < o.length; w++)
        b += `${w === 0 ? "M" : "L"} ${y(w).toFixed(2)} ${C(o[w]).toFixed(2)} `;
      if (n === "area") {
        const w = b + ` L ${y(o.length - 1).toFixed(2)} ${(p + _).toFixed(2)} L ${y(0).toFixed(2)} ${(p + _).toFixed(2)} Z`;
        v += `<path d="${w}" fill="${a}" fill-opacity="0.18" stroke="none"/>`;
      }
      if (v += `<path d="${b.trim()}" fill="none" stroke="${a}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`, i) {
        const w = y(o.length - 1), x = C(o[o.length - 1]);
        v += `<circle cx="${w.toFixed(2)}" cy="${x.toFixed(2)}" r="1.8" fill="${a}"/>`;
      }
    }
    return `<svg class="sg-renderer-sparkline is-${n}" viewBox="0 0 ${r} ${e}" width="${r}" height="${e}" preserveAspectRatio="none" aria-hidden="true">` + v + "</svg>";
  };
}
function ws(n) {
  if (typeof n != "string") return null;
  let r = n.trim().replace(/^#/, "");
  return r.length === 3 && (r = r.split("").map((e) => e + e).join("")), /^[0-9a-f]{6}$/i.test(r) ? [parseInt(r.slice(0, 2), 16), parseInt(r.slice(2, 4), 16), parseInt(r.slice(4, 6), 16)] : null;
}
function Cs(n, r, e) {
  const t = (s) => Math.max(0, Math.min(255, Math.round(s))).toString(16).padStart(2, "0");
  return `#${t(n)}${t(r)}${t(e)}`;
}
function Ss(n, r, e) {
  return [n[0] + (r[0] - n[0]) * e, n[1] + (r[1] - n[1]) * e, n[2] + (r[2] - n[2]) * e];
}
function xs([n, r, e]) {
  return 0.299 * n + 0.587 * r + 0.114 * e >= 145;
}
function pt({
  min: n = 0,
  max: r = 100,
  colors: e = ["#dcfce7", "#fef3c7", "#fecaca"],
  inverted: t = !1,
  showValue: s = !0,
  format: i = null
  // (value) => string for custom labels
} = {}) {
  const a = e.map(ws).filter(Boolean);
  if (a.length < 2) throw new Error("heatmap: need at least two valid hex colours");
  return ({ value: l, td: o }) => {
    if (o && o.classList.add("sg-renderer-heatmap"), V(l)) return "";
    let d = Number(l);
    if (!Number.isFinite(d)) return String(l);
    let c = r - n === 0 ? 0.5 : (d - n) / (r - n);
    c = Math.max(0, Math.min(1, c)), t && (c = 1 - c);
    const h = c * (a.length - 1), u = Math.min(a.length - 2, Math.floor(h)), p = h - u, f = Ss(a[u], a[u + 1], p);
    return o && (o.style.backgroundColor = Cs(...f), o.style.color = xs(f) ? "#111827" : "#ffffff"), s ? typeof i == "function" ? i(l) : String(l) : "";
  };
}
const Ls = {
  // Credit card: 16 digits grouped 4-4-4-4, last 4 visible. Handles 13-19
  // digit lengths gracefully (Amex 15, others 16). Non-digits are stripped.
  "cc-last4": (n, r) => Ie(n.replace(/\D/g, ""), 4, 4, r, " "),
  // BIN + last4: show the first 6 + last 4, mask the middle (PCI-friendly).
  "cc-bin-last4": (n, r) => Ie(n.replace(/\D/g, ""), 4, 4, r, " ", 6),
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
  last4: (n, r) => As(n, 4, r)
};
function As(n, r, e) {
  const t = String(n);
  return t.length <= r ? t : e.repeat(t.length - r) + t.slice(-r);
}
function Ie(n, r, e, t, s, i = 0) {
  if (!n) return "";
  const a = n.length, l = n.split("").map((d, c) => c < i || c >= a - e ? d : t).join(""), o = [];
  for (let d = l.length; d > 0; d -= r)
    o.unshift(l.slice(Math.max(0, d - r), d));
  return o.join(s);
}
const Es = /* @__PURE__ */ new Set(["cc-last4", "cc-bin-last4", "phone-last4", "last4"]);
function ft({
  format: n = null,
  showFirst: r = 0,
  showLast: e = 4,
  char: t = "•",
  align: s = null
  // 'left' | 'right' | null (auto)
} = {}) {
  const i = n ? Ls[n] : null, a = n ? Es.has(n) : !1, l = s === "right" || s !== "left" && a;
  return ({ value: o, td: d }) => {
    if (d && l && d.classList.add("sg-renderer-mask-numeric"), V(o)) return "";
    const c = String(o);
    if (i) return i(c, t);
    const h = c.slice(0, r), u = e > 0 ? c.slice(-e) : "", p = Math.max(0, c.length - r - e);
    return h + t.repeat(p) + u;
  };
}
function gt({
  query: n = null,
  caseSensitive: r = !1,
  className: e = "sg-renderer-mark"
} = {}) {
  return ({ value: t, api: s }) => {
    if (V(t)) return "";
    const i = String(t), a = n != null ? String(n) : s?.getQuickFilter?.() || "";
    return a ? Ms(i, a, r, e) : document.createTextNode(i);
  };
}
function Ms(n, r, e, t) {
  const s = e ? n : n.toLowerCase(), i = e ? r : r.toLowerCase(), a = document.createElement("span");
  let l = 0;
  for (; l < n.length; ) {
    const o = s.indexOf(i, l);
    if (o === -1) {
      a.appendChild(document.createTextNode(n.slice(l)));
      break;
    }
    o > l && a.appendChild(document.createTextNode(n.slice(l, o)));
    const d = document.createElement("mark");
    d.className = t, d.textContent = n.slice(o, o + r.length), a.appendChild(d), l = o + r.length;
  }
  return a;
}
function mt({ lines: n = null, separator: r = `
` } = {}) {
  return ({ value: e, td: t }) => {
    if (V(e)) return "";
    const s = String(e), i = r === `
` ? s : s.split(r).join(`
`);
    if (t) {
      t.classList.add("sg-renderer-multiline"), t.setAttribute("title", i);
      const a = t.parentElement;
      a && a.tagName === "TR" && a.classList.add("sg-has-multiline");
    }
    if (n != null && n > 0) {
      const a = document.createElement("div");
      return a.className = "sg-renderer-multiline-clamp", a.style.setProperty("--sg-clamp", String(n)), a.textContent = i, a;
    }
    return i;
  };
}
function Y(n) {
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
const Rs = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "ico"]);
function z(n) {
  if (!n) return !1;
  if (typeof n.content_type == "string" && n.content_type.startsWith("image/")) return !0;
  const r = String(n.filename || "").split(".").pop()?.toLowerCase();
  return r ? Rs.has(r) : !1;
}
const pe = {
  pdf: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM88 304h32c30.9 0 56 25.1 56 56s-25.1 56-56 56h-16v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V320c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24h-16v48h16zm72-64c0-8.8 7.2-16 16-16h24c26.5 0 48 21.5 48 48v48c0 26.5-21.5 48-48 48H208c-8.8 0-16-7.2-16-16V320zm32 16v80h8c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16h-8z"/></svg>',
  doc: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM104 280c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24zm0 80c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24z"/></svg>',
  sheet: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zm192 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16v128c0 8.8-7.2 16-16 16H112c-8.8 0-16-7.2-16-16V272c0-8.8 7.2-16 16-16zm16 32v32h48V288H128zm80 0v32h48V288H208zm-80 64v32h48V352H128zm80 0v32h48V352H208z"/></svg>',
  zip: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H160V64H224V0H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM160 64v32h64V64H160zm0 96v32h64V160H160zm0 96v32h64V256H160zm0 96c-17.7 0-32 14.3-32 32v48c0 8.8 7.2 16 16 16h96c8.8 0 16-7.2 16-16V384c0-17.7-14.3-32-32-32H160z"/></svg>',
  audio: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM160 288c-8.8 0-16 7.2-16 16v89c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V362.5l64-21.3V388c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V304c0-5.1-2.5-10-6.6-13s-9.5-3.9-14.5-2.3L160 309.8V304c0-8.8-7.2-16-16-16z"/></svg>',
  video: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM64 288c0-17.7 14.3-32 32-32H224c17.7 0 32 14.3 32 32V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V288zm259.7-11.3c5.2 2.7 8.3 8 8.3 13.8v123c0 5.8-3.2 11.2-8.3 13.8s-11.3 2.3-16.1-.9L256 392.7V312l51.5-32.6c4.9-3.1 11-3.4 16.1-.8z"/></svg>',
  code: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM200.4 281.7c5.8 6.7 5.2 16.8-1.5 22.6L165.5 333l33.4 28.7c6.7 5.8 7.4 15.9 1.6 22.6s-15.9 7.4-22.6 1.6l-48-41.2c-3.5-3-5.5-7.4-5.5-12s2-9 5.5-12l48-41.2c6.7-5.8 16.8-5.2 22.6 1.5zM226 281.7c5.8-6.7 15.9-7.4 22.6-1.5l48 41.2c3.5 3 5.5 7.4 5.5 12s-2 9-5.5 12l-48 41.2c-6.7 5.8-16.8 5.2-22.6-1.6s-5.2-16.8 1.5-22.6L260.5 333 227.5 304.4c-6.7-5.8-7.4-15.9-1.5-22.6z"/></svg>',
  file: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0z"/></svg>'
}, _t = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>', Se = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>', Ds = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>', Ts = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 105.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>', ks = /* @__PURE__ */ new Set(["mp3", "wav", "flac", "m4a", "ogg", "aac", "opus"]), Vs = /* @__PURE__ */ new Set(["mp4", "mov", "webm", "mkv", "avi", "m4v"]);
function vt(n) {
  const r = String(n?.content_type || "").toLowerCase(), e = String(n?.filename || "").split(".").pop()?.toLowerCase() || "";
  return r.includes("pdf") || e === "pdf" ? "pdf" : r.startsWith("audio/") || ks.has(e) ? "audio" : r.startsWith("video/") || Vs.has(e) ? "video" : r.includes("zip") || ["zip", "tar", "gz", "7z", "rar"].includes(e) ? "zip" : r.includes("sheet") || r.includes("excel") || r.includes("csv") || ["xls", "xlsx", "csv", "numbers"].includes(e) ? "sheet" : r.includes("word") || r.includes("document") || ["doc", "docx", "txt", "md", "rtf"].includes(e) ? "doc" : ["js", "ts", "rb", "py", "go", "rs", "java", "json", "xml", "html", "css", "sh", "sql"].includes(e) ? "code" : "file";
}
function ge(n) {
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
function yt({
  thumbSize: n = 28,
  maxThumbs: r = 4,
  empty: e = "",
  editable: t = !1,
  accept: s = null,
  multiple: i = !0,
  download: a = !1,
  onUpload: l = null,
  onRemove: o = null
} = {}) {
  return (d) => {
    const { value: c, td: h, row: u, col: p } = d, f = ge(c);
    if (h && (h.classList.add("sg-renderer-attachments-cell"), h.dataset.attachmentCount = String(f.length), h._sgAttachments = f), f.length === 0 && !t)
      return e ? document.createTextNode(e) : "";
    const _ = m("div", { class: "sg-renderer-attachments", role: "group" }), y = f.slice(0, r), C = Math.max(0, f.length - y.length);
    if (y.forEach((v) => _.append(Is(v, n, f, a))), C > 0) {
      const v = m(
        "span",
        { class: "sg-attach-more", title: `${C} more` },
        document.createTextNode(`+${C}`)
      );
      v.addEventListener("click", (b) => {
        b.stopPropagation(), bt(f, f[y.length]);
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
      v.innerHTML = _t, v.addEventListener("click", (b) => {
        b.stopPropagation(), Ne(h, d, { thumbSize: n, accept: s, multiple: i, onUpload: l, onRemove: o });
      }), _.append(v), Ns(h, d, { onUpload: l }), h.addEventListener("dblclick", (b) => {
        b._sgAttachmentHandled || (b._sgAttachmentHandled = !0, b.stopPropagation(), Ne(h, d, { thumbSize: n, accept: s, multiple: i, onUpload: l, onRemove: o }));
      }, { once: !1 });
    }
    return _;
  };
}
function Is(n, r, e, t) {
  const s = m("button", {
    type: "button",
    class: "sg-attach-thumb",
    title: `${n.filename}${n.byte_size != null ? " · " + Y(n.byte_size) : ""}`,
    "data-attachment-id": n.id,
    "data-attachment-kind": z(n) ? "image" : "file",
    "aria-label": n.filename,
    style: `width: ${r}px; height: ${r}px;`
  });
  if (z(n) && n.thumb_url)
    s.append(m("img", {
      src: n.thumb_url,
      alt: n.filename,
      loading: "lazy",
      decoding: "async",
      width: String(r),
      height: String(r)
    }));
  else {
    const i = vt(n), a = m("span", { class: `sg-attach-icon is-${i}`, "aria-hidden": "true" });
    a.innerHTML = pe[i] || pe.file, s.append(a);
  }
  return s.addEventListener("click", (i) => {
    if (i.stopPropagation(), z(n)) {
      const a = e.filter(z);
      bt(a.length ? a : [n], n);
    } else if (t) {
      const a = document.createElement("a");
      a.href = n.url, a.download = n.filename, document.body.appendChild(a), a.click(), a.remove();
    } else
      window.open(n.url, "_blank", "noopener,noreferrer");
  }), s;
}
let X = null;
function bt(n, r) {
  _e();
  const e = n.filter(z);
  if (e.length === 0) return;
  let t = Math.max(0, e.findIndex((p) => p.id === r?.id));
  t < 0 && (t = 0);
  const s = m("div", { class: "sg-image-zoom sg-attach-lightbox", role: "dialog", "aria-modal": "true" }), i = m("div", { class: "sg-attach-lightbox-stage" }), a = m("img", { class: "sg-image-zoom-img", alt: "" }), l = m("div", { class: "sg-attach-lightbox-caption" }), o = m("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-prev",
    "aria-label": "Previous attachment"
  }), d = m("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-next",
    "aria-label": "Next attachment"
  });
  o.innerHTML = Ds, d.innerHTML = Ts;
  function c() {
    const p = e[t];
    a.src = p.preview_url || p.url, a.alt = p.filename, l.textContent = `${p.filename}${p.byte_size != null ? " · " + Y(p.byte_size) : ""} (${t + 1}/${e.length})`, o.style.visibility = e.length > 1 ? "visible" : "hidden", d.style.visibility = e.length > 1 ? "visible" : "hidden";
  }
  function h(p) {
    t = (t + p + e.length) % e.length, c();
  }
  function u(p) {
    p.key === "Escape" ? _e() : p.key === "ArrowLeft" ? h(-1) : p.key === "ArrowRight" && h(1);
  }
  s.addEventListener("click", (p) => {
    (p.target === s || p.target === i) && _e();
  }), o.addEventListener("click", (p) => {
    p.stopPropagation(), h(-1);
  }), d.addEventListener("click", (p) => {
    p.stopPropagation(), h(1);
  }), document.addEventListener("keydown", u), i.append(o, a, d), s.append(i, l), document.body.appendChild(s), X = { overlay: s, onKey: u }, c();
}
function _e() {
  X && (document.removeEventListener("keydown", X.onKey), X.overlay.remove(), X = null);
}
let oe = null;
function Ns(n, r, { onUpload: e }) {
  n._sgAttachDropBound || (n._sgAttachDropBound = !0, n.addEventListener("dragover", (t) => {
    t.dataTransfer?.types?.includes("Files") && (t.preventDefault(), n.classList.add("is-drop-target"));
  }), n.addEventListener("dragleave", () => n.classList.remove("is-drop-target")), n.addEventListener("drop", async (t) => {
    if (!t.dataTransfer?.files?.length) return;
    t.preventDefault(), n.classList.remove("is-drop-target");
    const s = Array.from(t.dataTransfer.files);
    await de(n, r, s, e);
  }));
}
function Ne(n, r, e) {
  ne();
  const { thumbSize: t, accept: s, multiple: i, onUpload: a, onRemove: l } = e, o = n._sgAttachments || ge(r.value), d = m("div", { class: "sg-attach-editor", role: "dialog", "aria-modal": "false" });
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
      return v.innerHTML = Se, v.addEventListener("click", ne), v;
    })()
  ]), h = m("div", { class: "sg-attach-editor-grid" });
  function u() {
    const v = n._sgAttachments || [];
    h.replaceChildren(), v.forEach((b) => h.append(Ps(b, n, r, l, t))), c.firstChild.textContent = v.length === 1 ? "1 attachment" : `${v.length} attachments`;
  }
  u(), n._sgAttachRepaint = u;
  const p = m("label", { class: "sg-attach-dropzone", tabindex: "0" });
  p.innerHTML = `
    <span class="sg-attach-dropzone-icon" aria-hidden="true">${_t}</span>
    <span class="sg-attach-dropzone-text">Drop files, paste, or <strong>browse</strong></span>
  `;
  const f = m("input", { type: "file", multiple: i ? "" : null, accept: s || null });
  f.style.display = "none", p.append(f), f.addEventListener("change", async () => {
    f.files?.length && (await de(n, r, Array.from(f.files), a), f.value = "", u());
  }), p.addEventListener("dragover", (v) => {
    v.dataTransfer?.types?.includes("Files") && (v.preventDefault(), p.classList.add("is-drop-target"));
  }), p.addEventListener("dragleave", () => p.classList.remove("is-drop-target")), p.addEventListener("drop", async (v) => {
    v.dataTransfer?.files?.length && (v.preventDefault(), p.classList.remove("is-drop-target"), await de(n, r, Array.from(v.dataTransfer.files), a), u());
  });
  function _(v) {
    const b = Array.from(v.clipboardData?.files || []);
    b.length !== 0 && (v.preventDefault(), de(n, r, b, a).then(u));
  }
  d.addEventListener("paste", _);
  function y(v) {
    v.key === "Escape" && ne();
  }
  function C(v) {
    !d.contains(v.target) && !n.contains(v.target) && ne();
  }
  document.addEventListener("keydown", y), setTimeout(() => document.addEventListener("mousedown", C), 0), d.append(c, h, p), document.body.appendChild(d), xe(d, n), p.focus(), oe = { pop: d, onKey: y, onDocClick: C, anchor: n };
}
function ne() {
  if (!oe) return;
  const { pop: n, onKey: r, onDocClick: e, anchor: t } = oe;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), n.remove(), t && delete t._sgAttachRepaint, oe = null;
}
function Ps(n, r, e, t, s) {
  const i = m("div", { class: "sg-attach-editor-tile", "data-attachment-id": n.id }), a = m("div", {
    class: "sg-attach-editor-preview",
    style: `width: ${s * 2}px; height: ${s * 2}px;`
  });
  if (z(n) && n.thumb_url)
    a.append(m("img", {
      src: n.thumb_url,
      alt: n.filename,
      width: String(s * 2),
      height: String(s * 2)
    }));
  else {
    const d = vt(n), c = m("span", { class: `sg-attach-icon is-${d}`, "aria-hidden": "true" });
    c.innerHTML = pe[d] || pe.file, a.append(c);
  }
  const l = m("div", { class: "sg-attach-editor-meta" }, [
    m(
      "div",
      { class: "sg-attach-editor-name", title: n.filename },
      document.createTextNode(n.filename)
    ),
    m(
      "div",
      { class: "sg-attach-editor-size" },
      document.createTextNode(n.byte_size != null ? Y(n.byte_size) : "")
    )
  ]), o = m("button", {
    type: "button",
    class: "sg-attach-editor-remove",
    title: "Remove",
    "aria-label": `Remove ${n.filename}`,
    "data-sg-attach": "remove",
    "data-attachment-id": n.id
  });
  return o.innerHTML = Se, o.addEventListener("click", async (d) => {
    d.stopPropagation(), await Fs(r, e, n, t);
  }), i.append(a, l, o), i;
}
function xe(n, r) {
  const e = r.getBoundingClientRect();
  n.style.position = "fixed", n.style.left = `${Math.max(8, Math.min(window.innerWidth - 360, e.left))}px`, window.innerHeight - e.bottom > 280 ? n.style.top = `${e.bottom + 4}px` : n.style.top = `${Math.max(8, e.top - n.offsetHeight - 4)}px`;
}
async function de(n, r, e, t) {
  if (e.length) {
    n.classList.add("is-uploading");
    try {
      let s;
      if (typeof t == "function") {
        const i = await t(e, r);
        s = Array.isArray(i) ? i : (n._sgAttachments || []).concat(Pe(e));
      } else
        s = (n._sgAttachments || []).concat(Pe(e));
      wt(n, r, ge(s));
    } finally {
      n.classList.remove("is-uploading");
    }
  }
}
async function Fs(n, r, e, t) {
  let s;
  if (typeof t == "function") {
    const i = await t(e, r);
    s = Array.isArray(i) ? i : (n._sgAttachments || []).filter((a) => a.id !== e.id);
  } else
    s = (n._sgAttachments || []).filter((i) => i.id !== e.id);
  wt(n, r, ge(s));
}
function Pe(n) {
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
function wt(n, r, e) {
  const { row: t, col: s, api: i } = r;
  t && s?.field != null && (t[s.field] = e), n._sgAttachments = e, i?.applyTransaction ? i.applyTransaction({ update: [t] }) : i?.refreshCells && i.refreshCells({ rowIds: [t?.id ?? t?._sg_id] }), n._sgAttachRepaint && n._sgAttachRepaint();
}
const Bs = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"], Ct = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory"
};
function $s(n) {
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
function Hs(n) {
  if (!n || n._raw) return n?._raw || "";
  const r = [n.address1, n.address2, n.address3].filter(Boolean), e = [n.suburb, n.state, n.postcode].filter(Boolean).join(" ");
  return e && r.push(e), n.country && n.country.toLowerCase() !== "australia" && r.push(n.country), r.join(`
`);
}
function St({ editable: n = !0, empty: r = "" } = {}) {
  return (e) => {
    const { value: t, td: s } = e, i = $s(t);
    if (s && (s.classList.add("sg-renderer-address-au-cell"), s._sgAddress = i), !i) return r ? document.createTextNode(r) : "";
    n && s && !s._sgAddressEditBound && (s._sgAddressEditBound = !0, s.addEventListener("dblclick", (d) => {
      d._sgAddressHandled || (d._sgAddressHandled = !0, d.stopPropagation(), zs(s, e));
    }));
    const a = m("div", {
      class: "sg-renderer-address-au",
      title: Hs(i)
    });
    if (i._raw)
      return a.append(document.createTextNode(i._raw)), a;
    const l = [i.address1, i.address2].filter(Boolean).join(", "), o = i.suburb || i.state || i.postcode;
    return l && a.append(m("span", { class: "sg-address-au-street" }, document.createTextNode(l))), l && o && a.append(m("span", { class: "sg-address-au-sep" }, document.createTextNode(", "))), i.suburb && a.append(document.createTextNode(i.suburb)), i.state && (i.suburb && a.append(document.createTextNode(" ")), a.append(m("span", {
      class: `sg-address-au-state is-${i.state.toLowerCase()}`,
      title: Ct[i.state] || i.state
    }, document.createTextNode(i.state)))), i.postcode && ((i.suburb || i.state) && a.append(document.createTextNode(" ")), a.append(m(
      "span",
      { class: "sg-address-au-postcode" },
      document.createTextNode(i.postcode)
    ))), i.country && i.country.toLowerCase() !== "australia" && (a.append(document.createTextNode(" ")), a.append(m(
      "span",
      { class: "sg-address-au-country" },
      document.createTextNode(i.country)
    ))), a;
  };
}
let ce = null;
function zs(n, r) {
  j();
  const e = n._sgAddress && !n._sgAddress._raw ? { ...n._sgAddress } : { address1: "", address2: "", address3: "", suburb: "", state: "", postcode: "", country: "Australia" };
  e.country || (e.country = "Australia");
  const t = m("div", { class: "sg-address-au-editor", role: "dialog", "aria-modal": "false" });
  t.addEventListener("mousedown", (E) => E.stopPropagation());
  const s = m("div", { class: "sg-address-au-editor-header" });
  s.append(
    m("span", { class: "sg-address-au-editor-title" }, document.createTextNode("Edit address"))
  );
  const i = m("form", { class: "sg-address-au-editor-form", novalidate: "novalidate" });
  function a({ label: E, name: P, type: B = "text", value: Q = "", maxlength: Z, inputmode: J, placeholder: ee, autocomplete: te }) {
    const K = m("label", { class: "sg-address-au-editor-field", "data-field": P });
    K.append(m("span", { class: "sg-address-au-editor-label" }, document.createTextNode(E)));
    const U = m("input", {
      type: B,
      name: P,
      value: Q || "",
      maxlength: Z || null,
      inputmode: J || null,
      placeholder: ee || null,
      autocomplete: te || null,
      class: "sg-address-au-editor-input"
    });
    return K.append(U), { wrap: K, input: U };
  }
  const l = a({
    label: "Address line 1",
    name: "address1",
    value: e.address1,
    placeholder: "12 Smith Street",
    autocomplete: "address-line1"
  }), o = a({
    label: "Address line 2",
    name: "address2",
    value: e.address2,
    placeholder: "Unit / suite (optional)",
    autocomplete: "address-line2"
  }), d = m("div", { class: "sg-address-au-editor-line3-wrap" }), c = a({
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
    const E = !!(o.input.value.trim() || c.input.value.trim());
    d.hidden = !E, h.hidden = E;
  }
  o.input.addEventListener("input", u), h.addEventListener("click", () => {
    d.hidden = !1, h.hidden = !0, c.input.focus();
  });
  const p = a({
    label: "Suburb",
    name: "suburb",
    value: e.suburb,
    placeholder: "Bondi",
    autocomplete: "address-level2"
  }), f = m("label", { class: "sg-address-au-editor-field", "data-field": "state" });
  f.append(m("span", { class: "sg-address-au-editor-label" }, document.createTextNode("State")));
  const _ = m("select", {
    name: "state",
    class: "sg-address-au-editor-input sg-address-au-editor-state",
    autocomplete: "address-level1"
  });
  _.append(m("option", { value: "" }, document.createTextNode("—")));
  for (const E of Bs) {
    const P = m(
      "option",
      { value: E, selected: e.state === E ? "" : null },
      document.createTextNode(`${E} — ${Ct[E]}`)
    );
    _.append(P);
  }
  f.append(_);
  const y = a({
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
  const C = a({
    label: "Country",
    name: "country",
    value: e.country,
    autocomplete: "country-name"
  }), v = m("div", { class: "sg-address-au-editor-grid" });
  v.append(l.wrap), v.append(o.wrap, h), v.append(d), v.append(p.wrap, f, y.wrap), v.append(C.wrap);
  const b = m("div", { class: "sg-address-au-editor-footer" }), w = m(
    "button",
    { type: "button", class: "sg-address-au-editor-cancel" },
    document.createTextNode("Cancel")
  ), x = m(
    "button",
    { type: "submit", class: "sg-address-au-editor-save" },
    document.createTextNode("Save")
  );
  b.append(w, x), i.append(v, b), t.append(s, i);
  function L() {
    return {
      address1: l.input.value.trim(),
      address2: o.input.value.trim(),
      address3: d.hidden ? "" : c.input.value.trim(),
      suburb: p.input.value.trim(),
      state: _.value,
      postcode: y.input.value.trim(),
      country: C.input.value.trim() || "Australia"
    };
  }
  function R() {
    const E = L(), P = !E.address1 && !E.suburb && !E.state && !E.postcode;
    Gs(n, r, P ? null : E), j();
  }
  i.addEventListener("submit", (E) => {
    E.preventDefault(), R();
  }), w.addEventListener("click", () => j());
  function T(E) {
    E.key === "Escape" && (E.stopPropagation(), j());
  }
  function k(E) {
    !t.contains(E.target) && !n.contains(E.target) && j();
  }
  document.addEventListener("keydown", T), setTimeout(() => document.addEventListener("mousedown", k), 0), document.body.appendChild(t), xe(t, n), u(), l.input.focus(), l.input.select(), ce = { pop: t, onKey: T, onDocClick: k };
}
function j() {
  if (!ce) return;
  const { pop: n, onKey: r, onDocClick: e } = ce;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), n.remove(), ce = null;
}
function Gs(n, r, e) {
  const { row: t, col: s, api: i } = r, a = t && s?.field != null ? t[s.field] : null;
  t && s?.field != null && (t[s.field] = e), n._sgAddress = e, i?.applyTransaction ? i.applyTransaction({ update: [t] }) : i?.refreshCells && i.refreshCells({ rowIds: [t?.id ?? t?._sg_id] });
  const l = n.closest('[data-controller~="grid"]');
  l && l.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
    bubbles: !0,
    detail: { rowId: t?.id ?? t?._sg_id, colId: s?.field, oldValue: a, newValue: e }
  }));
}
function xt({ color: n = "green", showValue: r = !1 } = {}) {
  return ({ value: e }) => {
    let t = Number(e);
    Number.isFinite(t) || (t = 0), t = Math.max(0, Math.min(100, t));
    const s = m("div", { class: "sg-renderer-progress" }, [
      m("div", { class: `sg-renderer-progress-fill sg-fill-${n}`, style: `width: ${t}%;` })
    ]);
    return r ? m("div", { class: "sg-renderer-progress-wrap" }, [
      s,
      m("span", { class: "sg-renderer-progress-label" }, document.createTextNode(`${Math.round(t)}%`))
    ]) : s;
  };
}
const ie = '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>';
function Lt({ max: n = 5, precision: r = 0.5 } = {}) {
  const e = r > 0 ? 1 / r : 2;
  return ({ value: t }) => {
    let s = parseFloat(t);
    Number.isFinite(s) || (s = 0), s = Math.max(0, Math.min(n, s)), s = Math.round(s * e) / e;
    const i = m("div", {
      class: "sg-renderer-stars",
      role: "img",
      "aria-label": `${s} out of ${n} stars`
    });
    for (let a = 1; a <= n; a++)
      if (s >= a)
        i.append(m("span", { class: "sg-renderer-star is-full", "aria-hidden": "true" }, ie));
      else if (s > a - 1) {
        const l = Math.round((s - (a - 1)) * 100);
        i.append(m(
          "span",
          { class: "sg-renderer-star is-partial", "aria-hidden": "true" },
          `${ie}<span class="sg-star-clip" style="width: ${l}%;">${ie}</span>`
        ));
      } else
        i.append(m("span", { class: "sg-renderer-star is-empty", "aria-hidden": "true" }, ie));
    return i;
  };
}
function At({ separator: n = "," } = {}) {
  return ({ value: r }) => {
    if (V(r)) return "";
    const e = Array.isArray(r) ? r : String(r).split(n), t = m("div", { class: "sg-renderer-tags" });
    for (const s of e) {
      const i = String(s).trim();
      i && t.append(m("span", { class: "sg-renderer-tag" }, document.createTextNode(i)));
    }
    return t;
  };
}
function Et({ showCode: n = !0, fallback: r = null } = {}) {
  return ({ value: e }) => {
    if (V(e)) return "";
    const t = String(e).trim().toUpperCase();
    if (t.length !== 2 || !/^[A-Z]{2}$/.test(t))
      return r ?? document.createTextNode(String(e));
    const s = String.fromCodePoint(
      127462 + t.charCodeAt(0) - 65,
      127462 + t.charCodeAt(1) - 65
    ), i = m("span", { class: "sg-renderer-country" });
    return i.append(m("span", { class: "sg-renderer-flag", "aria-hidden": "true" }, document.createTextNode(s))), n && i.append(m("span", { class: "sg-renderer-country-code" }, document.createTextNode(t))), i;
  };
}
function Os(n) {
  const r = String(n).replace(/\s+/g, "");
  if (r.length !== 11 || !/^\d{11}$/.test(r)) return !1;
  const e = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19], t = parseInt(r[0], 10) - 1 + r.slice(1);
  let s = 0;
  for (let i = 0; i < 11; i++) s += parseInt(t[i], 10) * e[i];
  return s % 89 === 0;
}
function Ks(n) {
  const r = String(n).replace(/\D/g, "");
  return r.length !== 11 ? String(n) : `${r.slice(0, 2)} ${r.slice(2, 5)} ${r.slice(5, 8)} ${r.slice(8)}`;
}
function Mt() {
  return ({ value: n }) => {
    if (V(n)) return "";
    if (!Os(n))
      return m("span", { class: "sg-renderer-invalid", title: "Invalid ABN" }, document.createTextNode(String(n)));
    const r = String(n).replace(/\s+/g, "");
    return m("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/ABN/View?id=${r}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(Ks(n)));
  };
}
function Rt({
  lookup: n = null,
  nameField: r = null,
  avatarField: e = null,
  windowKey: t = "__sgUsers",
  size: s = 22
} = {}) {
  return ({ value: i, row: a }) => {
    if (V(i)) return "";
    let l = null;
    if (typeof n == "function" && (l = n(i, a) || null), !l && r && (l = { name: a?.[r], avatarUrl: e ? a?.[e] : null }), !l && typeof window < "u" && window[t]) {
      const c = window[t];
      c instanceof Map ? l = c.get(i) || c.get(String(i)) || null : Array.isArray(c) && (l = c.find((h) => `${h.id}` == `${i}`) || null);
    }
    const o = l?.name ?? String(i), d = m("span", { class: "sg-renderer-avatar" });
    if (l?.avatarUrl)
      d.append(m("img", {
        class: "sg-renderer-avatar-img",
        src: l.avatarUrl,
        width: String(s),
        height: String(s),
        alt: ""
      }));
    else {
      const c = String(o).split(/\s+/).filter(Boolean).slice(0, 2).map((h) => h[0]?.toUpperCase() || "").join("");
      d.append(m("span", {
        class: "sg-renderer-avatar-initials",
        style: `width: ${s}px; height: ${s}px;`
      }, document.createTextNode(c)));
    }
    return d.append(m("span", { class: "sg-renderer-avatar-name" }, document.createTextNode(o))), d;
  };
}
const qs = {
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
function Ws(n) {
  return String(n).toLowerCase().split(/[\s_-]+/).map((r) => r && r[0].toUpperCase() + r.slice(1)).join(" ");
}
function Us(n = {}, r = null, e = {}) {
  const { titleCase: t = !0, defaultColor: s = "gray" } = e, i = {};
  for (const [l, o] of Object.entries(n)) i[String(l).toLowerCase()] = o;
  const a = {};
  if (r) for (const [l, o] of Object.entries(r)) a[String(l).toLowerCase()] = o;
  return ({ value: l }) => {
    if (V(l)) return "";
    const o = String(l).toLowerCase(), d = i[o] || s, c = t ? Ws(l) : String(l), h = m("span", { class: `sg-pill sg-pill-${d}` });
    if (r) {
      const u = a[o], p = u ? qs[u] || u : null;
      if (p) {
        const f = m("span", { class: "sg-pill-icon", "aria-hidden": "true" });
        f.innerHTML = p, h.append(f);
      }
    }
    return h.append(m("span", { class: "sg-pill-label" }, document.createTextNode(c))), h;
  };
}
function Dt({
  truthy: n = Ce,
  disabled: r = !1
} = {}) {
  return (e) => {
    const { value: t, row: s, col: i, api: a, td: l } = e;
    l && l.classList.add("sg-renderer-checkbox-cell");
    const o = m("span", { class: "sg-renderer-checkbox" }), d = m("input", {
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
      const h = d.checked, u = s && i?.field != null ? s[i.field] : null;
      s && i?.field != null && (s[i.field] = h), a?.applyTransaction && a.applyTransaction({ update: [s] });
      const p = l?.closest('[data-controller~="grid"]');
      p && p.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: s?.id ?? s?._sg_id, colId: i?.field, oldValue: u, newValue: h }
      }));
    }), o.append(d), o;
  };
}
const js = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z"/></svg>', ve = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>', Xs = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>', Ys = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/></svg>', Qs = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/></svg>', Zs = Se;
function Tt(n) {
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
function ue(n) {
  (!Number.isFinite(n) || n < 0) && (n = 0);
  const r = Math.floor(n), e = Math.floor(r / 3600), t = Math.floor(r % 3600 / 60), s = r % 60, i = (a) => String(a).padStart(2, "0");
  return e > 0 ? `${e}:${i(t)}:${i(s)}` : `${t}:${i(s)}`;
}
function kt({
  showFilename: n = !0,
  iconOnly: r = !1,
  empty: e = "",
  preferHowler: t = !0,
  skipSeconds: s = 10
} = {}) {
  return (i) => {
    const { value: a, td: l } = i, o = Tt(a);
    if (l && (l.classList.add("sg-renderer-audio-cell"), l._sgAudio = o, l._sgAudioOpts = { preferHowler: t, skipSeconds: s }), !o) return e ? document.createTextNode(e) : "";
    l && !l._sgAudioDblBound && (l._sgAudioDblBound = !0, l.addEventListener("dblclick", (h) => {
      h._sgAudioHandled || (h._sgAudioHandled = !0, h.stopPropagation(), h.preventDefault(), Fe(l, i));
    }));
    const d = m("div", { class: "sg-renderer-audio" }), c = m("button", {
      type: "button",
      class: "sg-audio-icon",
      title: `${o.filename}${o.byte_size != null ? " · " + Y(o.byte_size) : ""} — double-click to play`,
      "aria-label": `Play ${o.filename}`,
      "data-sg-audio": "open"
    });
    if (c.innerHTML = js, c.addEventListener("click", (h) => {
      h.stopPropagation(), Fe(l, i);
    }), c.addEventListener("dblclick", (h) => {
      h._sgAudioHandled = !0, h.stopPropagation();
    }), d.append(c), n && !r) {
      const h = m(
        "span",
        { class: "sg-audio-name" },
        document.createTextNode(o.filename)
      );
      d.append(h), o.duration != null && d.append(m(
        "span",
        { class: "sg-audio-duration" },
        document.createTextNode(ue(o.duration))
      ));
    }
    return d;
  };
}
function Js(n, { preferHowler: r } = {}) {
  return r && typeof window < "u" && window.Howl ? new tn(n) : new en(n);
}
class en {
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
class tn {
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
let he = null;
function Fe(n, r) {
  re();
  const e = n._sgAudio || Tt(r.value);
  if (!e) return;
  const t = n._sgAudioOpts || { preferHowler: !0, skipSeconds: 10 }, s = Js(e.url, t), i = m("div", { class: "sg-audio-player", role: "dialog", "aria-label": "Audio player" });
  i.addEventListener("mousedown", (A) => A.stopPropagation());
  const a = m("div", { class: "sg-audio-player-header" }), l = m(
    "div",
    { class: "sg-audio-player-name", title: e.filename },
    document.createTextNode(e.filename)
  ), o = m("div", { class: "sg-audio-player-meta" }), d = [];
  e.byte_size != null && d.push(Y(e.byte_size)), s.backendName() === "howler" && d.push("howler.js"), o.textContent = d.join(" · ");
  const c = m("button", {
    type: "button",
    class: "sg-audio-player-close",
    "aria-label": "Close player"
  });
  c.innerHTML = Zs, c.addEventListener("click", re), a.append(l, o, c);
  const h = m("div", {
    class: "sg-audio-track",
    role: "slider",
    "aria-label": "Seek",
    tabindex: "0",
    "aria-valuemin": "0",
    "aria-valuemax": "0",
    "aria-valuenow": "0"
  }), u = m("div", { class: "sg-audio-track-fill" }), p = m("div", { class: "sg-audio-track-thumb" });
  h.append(u, p);
  const f = m("div", { class: "sg-audio-times" }), _ = m("span", { class: "sg-audio-time-current" }, document.createTextNode("0:00")), y = m("span", { class: "sg-audio-time-total" }, document.createTextNode("--:--"));
  f.append(_, y);
  const C = m("div", { class: "sg-audio-transport" }), v = m("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Back ${t.skipSeconds}s`,
    "aria-label": `Back ${t.skipSeconds} seconds`
  });
  v.innerHTML = Ys;
  const b = m("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-play",
    title: "Play / pause (Space)",
    "aria-label": "Play",
    "data-state": "paused"
  });
  b.innerHTML = ve;
  const w = m("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Forward ${t.skipSeconds}s`,
    "aria-label": `Forward ${t.skipSeconds} seconds`
  });
  w.innerHTML = Qs, C.append(v, b, w), i.append(a, h, f, C);
  let x = e.duration ?? 0, L = !1, R = null;
  function T(A) {
    const N = Math.max(0, Math.min(100, A));
    u.style.width = N + "%", p.style.left = N + "%";
  }
  function k() {
    const A = s.seek(), N = x || s.duration() || 0;
    if (N > 0 && x !== N && (x = N, y.textContent = ue(x), h.setAttribute("aria-valuemax", String(Math.floor(x)))), !L) {
      const q = x > 0 ? A / x * 100 : 0;
      T(q), _.textContent = ue(A), h.setAttribute("aria-valuenow", String(Math.floor(A)));
    }
  }
  function E() {
    k(), s.isPlaying() ? R = requestAnimationFrame(E) : R = null;
  }
  function P() {
    R == null && (R = requestAnimationFrame(E));
  }
  function B() {
    R != null && cancelAnimationFrame(R), R = null;
  }
  const Q = () => {
    x = s.duration(), k();
  }, Z = () => {
    b.dataset.state = "playing", b.innerHTML = Xs, b.setAttribute("aria-label", "Pause"), P();
  }, J = () => {
    b.dataset.state = "paused", b.innerHTML = ve, b.setAttribute("aria-label", "Play"), B(), k();
  }, ee = () => {
    b.dataset.state = "paused", b.innerHTML = ve, b.setAttribute("aria-label", "Play"), B(), s.seek(0), k();
  };
  s.on("load", Q), s.on("play", Z), s.on("pause", J), s.on("end", ee), b.addEventListener("click", (A) => {
    A.stopPropagation(), s.isPlaying() ? s.pause() : s.play();
  }), v.addEventListener("click", (A) => {
    A.stopPropagation(), s.seek(Math.max(0, s.seek() - t.skipSeconds)), k();
  }), w.addEventListener("click", (A) => {
    A.stopPropagation();
    const N = s.duration();
    s.seek(Math.min(N || 1 / 0, s.seek() + t.skipSeconds)), k();
  });
  function te(A) {
    const N = h.getBoundingClientRect(), q = (A.clientX ?? 0) - N.left, $ = Math.max(0, Math.min(1, q / N.width)), Me = s.duration() || x;
    if (!Me) return;
    const Re = $ * Me;
    s.seek(Re), T($ * 100), _.textContent = ue(Re);
  }
  h.addEventListener("pointerdown", (A) => {
    A.preventDefault(), L = !0, h.setPointerCapture?.(A.pointerId), h.classList.add("is-dragging"), te(A);
  }), h.addEventListener("pointermove", (A) => {
    L && te(A);
  });
  const K = (A) => {
    if (L) {
      L = !1, h.classList.remove("is-dragging");
      try {
        h.releasePointerCapture?.(A.pointerId);
      } catch {
      }
    }
  };
  h.addEventListener("pointerup", K), h.addEventListener("pointercancel", K), h.addEventListener("keydown", (A) => {
    const N = s.duration() || x;
    if (!N) return;
    const q = A.shiftKey ? 30 : 5;
    let $ = null;
    A.key === "ArrowLeft" ? $ = Math.max(0, s.seek() - q) : A.key === "ArrowRight" ? $ = Math.min(N, s.seek() + q) : A.key === "Home" ? $ = 0 : A.key === "End" && ($ = N), $ != null && (A.preventDefault(), s.seek($), k());
  });
  function U(A) {
    A.key === "Escape" ? (A.preventDefault(), re()) : (A.key === " " || A.code === "Space") && i.contains(document.activeElement) && (A.preventDefault(), s.isPlaying() ? s.pause() : s.play());
  }
  function Ee(A) {
    !i.contains(A.target) && !n.contains(A.target) && re();
  }
  document.addEventListener("keydown", U), setTimeout(() => document.addEventListener("mousedown", Ee), 0), document.body.appendChild(i), xe(i, n), k(), b.focus(), he = {
    pop: i,
    backend: s,
    onKey: U,
    onDocClick: Ee,
    cleanup: () => {
      B();
      try {
        s.off("load", Q), s.off("play", Z), s.off("pause", J), s.off("end", ee);
      } catch {
      }
      s.destroy();
    }
  };
}
function re() {
  if (!he) return;
  const { pop: n, onKey: r, onDocClick: e, cleanup: t } = he;
  document.removeEventListener("keydown", r), document.removeEventListener("mousedown", e), t(), n.remove(), he = null;
}
function Vt({
  truthy: n = Ce,
  disabled: r = !1
} = {}) {
  return (e) => {
    const { value: t, row: s, col: i, api: a, td: l } = e;
    l && l.classList.add("sg-renderer-switch-cell");
    const o = t == null || t === "", d = !o && n(t), c = m("button", {
      type: "button",
      class: `sg-renderer-switch${d ? " is-on" : ""}${o ? " is-null" : ""}`,
      role: "switch",
      "aria-checked": o ? "mixed" : d ? "true" : "false",
      "aria-label": i?.field || "toggle",
      disabled: r ? "" : null
    });
    return c.append(m("span", { class: "sg-renderer-switch-thumb", "aria-hidden": "true" })), c.addEventListener("click", (h) => {
      if (h.stopPropagation(), r) return;
      const u = o ? !0 : !d, p = s && i?.field != null ? s[i.field] : null;
      s && i?.field != null && (s[i.field] = u), a?.applyTransaction && a.applyTransaction({ update: [s] });
      const f = l?.closest('[data-controller~="grid"]');
      f && f.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: s?.id ?? s?._sg_id, colId: i?.field, oldValue: p, newValue: u }
      }));
    }), c;
  };
}
M("email", je());
M("url", Xe());
M("phone", Ye());
M("currency", Qe());
M("percent", Ze());
M("progress-bar", xt());
M("star-rating", Lt());
M("tags", At());
M("country-flag", Et());
M("abn", Mt());
M("avatar", Rt());
M("date", Je());
M("datetime", et());
M("relative-time", tt());
M("duration", st());
M("number", nt());
M("compact-number", it());
M("file-size", rt());
M("boolean", at());
M("delta", lt());
M("truncate", ot());
M("copyable", dt());
M("image", ct());
M("color-swatch", ut());
M("sparkline", ht());
M("heatmap-cell", pt());
M("mask", ft());
M("highlight", gt());
M("multi-line", mt());
M("attachments", yt());
M("address-au", St());
M("checkbox", Dt());
M("switch", Vt());
M("audio-attachment", kt());
const sn = {
  email: je,
  url: Xe,
  phone: Ye,
  currency: Qe,
  percent: Ze,
  progressBar: xt,
  starRating: Lt,
  tags: At,
  countryFlag: Et,
  abn: Mt,
  avatar: Rt,
  statusPill: Us,
  date: Je,
  datetime: et,
  relativeTime: tt,
  duration: st,
  number: nt,
  compactNumber: it,
  fileSize: rt,
  boolean: at,
  delta: lt,
  truncate: ot,
  copyable: dt,
  image: ct,
  colorSwatch: ut,
  sparkline: ht,
  heatmap: pt,
  mask: ft,
  highlight: gt,
  multiLine: mt,
  attachments: yt,
  addressAu: St,
  checkbox: Dt,
  switch: Vt,
  audioAttachment: kt
}, nn = 32, Be = 100, ae = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', rn = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>', an = /* @__PURE__ */ new Set([
  "number",
  "currency",
  "percent",
  "compactNumber",
  "fileSize",
  "duration"
]), ln = /* @__PURE__ */ new Set([
  "color",
  "date",
  "datetime-local",
  "time",
  "month",
  "week"
]), $e = [
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
class Le extends O {
  constructor() {
    super(...arguments);
    D(this, "_onDocMouseDown", (e) => {
      this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
    });
    // ----- Row grouping + aggregation -----
    // A group is expanded if it has an explicit override; otherwise the
    // default-by-level applies (-1 = all, 0 = none, N = first N levels).
    D(this, "_isGroupExpanded", (e, t) => {
      if (this._groupExpanded.has(e)) return this._groupExpanded.get(e);
      const s = this.state.group.defaultExpanded;
      return s < 0 ? !0 : t < s;
    });
    // Delegated click handler for synthetic <th>s that don't have a
    // HeaderCellController of their own (pivot result cols today). Mirrors the
    // user-defined header path: bare click toggles sort, shift-click appends to
    // a multi-sort. Resize handles / filter icons short-circuit.
    D(this, "_onSynthHeaderClick", (e) => {
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
    D(this, "_onHeaderContextMenu", (e) => {
      const t = e.target.closest("th[data-field], th[data-header-cell-field-value]");
      if (!t) return;
      const s = t.getAttribute("data-field") || t.getAttribute("data-header-cell-field-value"), i = this._colByField(s);
      !i || i._isCheckbox || i._isRowNumber || i._isGroupCol || i._isPivot || (e.preventDefault(), this._showColumnMenu(i, e.clientX, e.clientY));
    });
    D(this, "_onDocMouseDownColumnMenu", (e) => {
      this._columnMenu && !this._columnMenu.contains(e.target) && this._closeColumnMenu();
    });
    D(this, "_onColumnMenuKey", (e) => {
      e.key === "Escape" && (e.stopPropagation(), this._closeColumnMenu());
    });
    D(this, "_onCellDragEnter", (e) => {
      if (!this._isFileDrag(e)) return;
      const t = this._dropTarget(e.target);
      t && (e.preventDefault(), this._dropHotCell && this._dropHotCell !== t.td && this._dropHotCell.classList.remove("sg-drop-target"), t.td.classList.add("sg-drop-target"), this._dropHotCell = t.td);
    });
    D(this, "_onCellDragOver", (e) => {
      if (!this._isFileDrag(e)) return;
      const t = this._dropTarget(e.target);
      t && (e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "copy"), this._dropHotCell !== t.td && (this._dropHotCell?.classList.remove("sg-drop-target"), t.td.classList.add("sg-drop-target"), this._dropHotCell = t.td));
    });
    D(this, "_onCellDragLeave", (e) => {
      this._dropHotCell && !this._dropHotCell.contains(e.relatedTarget) && (this._dropHotCell.classList.remove("sg-drop-target"), this._dropHotCell = null);
    });
    D(this, "_onCellDrop", (e) => {
      if (!this._isFileDrag(e)) return;
      const t = this._dropTarget(e.target);
      if (!t) return;
      e.preventDefault(), this._dropHotCell?.classList.remove("sg-drop-target"), this._dropHotCell = null;
      const s = Array.from(e.dataTransfer?.files || []);
      if (!s.length) return;
      const i = this.state.rowData.find((h) => this._rowId(h) === t.rowId), a = { rowId: t.rowId, colId: t.colId, files: s, row: i, dataTransfer: e.dataTransfer }, l = new CustomEvent("grid:fileAttached", { detail: a, bubbles: !0, cancelable: !0 });
      if (!this.element.dispatchEvent(l) || !i) return;
      const d = this.attachmentsFieldValue || t.colId, c = Array.isArray(i[d]) ? i[d].slice() : [];
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
      i[d] = c, this.scheduleRender("cells"), S(this.element, "grid:cellValueChanged", {
        rowId: t.rowId,
        colId: d,
        oldValue: null,
        newValue: c
      });
    });
    D(this, "_onScroll", () => {
      this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
    });
    D(this, "_onCellMouseDown", (e) => {
      if (e.button !== 0) return;
      if (this.rowDragValue) {
        const i = e.target.closest?.('td[data-gutter="true"]');
        if (i) {
          const a = i.closest("tr");
          this._rowDragPending = { rowId: this._coerceRowId(a.dataset.rowId), x: e.clientX, y: e.clientY }, this._rowDragMoved = !1, document.addEventListener("mousemove", this._onRowDragMove);
          return;
        }
      }
      if (e.target.closest?.('[data-tree-toggle="true"]')) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : s ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), S(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    D(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      s && s.focus.rowId === t.rowId && s.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), S(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
    });
    D(this, "_onCellMouseUp", () => {
      this._cellDragging = !1, this._rowDragPending && (document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag && this._finishRowDrag(), this._rowDragPending = null);
    });
    // ----- Row drag-and-drop (reorder) with a ghost preview -----
    D(this, "_onRowDragMove", (e) => {
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
    D(this, "_onCopy", (e) => {
      if (this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && !this.element.contains(t)) return;
      const s = this._activeRect();
      if (!s) return;
      const i = this._cellRangeRows(s).map((a) => a.map((l) => String(l ?? "")).join("	")).join(`
`);
      i && (e.clipboardData?.setData("text/plain", i), e.preventDefault());
    });
    D(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && this.element.contains(t)) return;
      const s = e.key, i = e.metaKey || e.ctrlKey;
      if (i && s.toLowerCase() === "a") {
        e.preventDefault(), this.rowSelectionValue !== "" ? (this.clearCellSelection(), this.deselectAll(), this.selectAll()) : this._selectAllCells();
        return;
      }
      if (i) return;
      const a = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (a[s]) {
        e.preventDefault();
        const [l, o] = a[s];
        this._moveActiveCell(l, o, e.shiftKey);
        return;
      }
      if (s === "Tab") {
        e.preventDefault(), this._moveActiveCell(0, e.shiftKey ? -1 : 1, !1);
        return;
      }
      if (s === "Enter") {
        const l = this._activeCell();
        l && (e.preventDefault(), this.startEditingCell(l.rowId, l.colId));
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
        const l = this._activeCell();
        if (!l) return;
        const o = this._colByField(l.colId);
        if (!o || !o.editable) return;
        e.preventDefault(), this.startEditingCell(l.rowId, l.colId, s);
      }
    });
    D(this, "_onEditorKey", (e) => {
      this.state.editing && (e.key === "Enter" ? (e.preventDefault(), this.stopEditing(!1)) : e.key === "Escape" ? (e.preventDefault(), this.stopEditing(!0)) : e.key === "Tab" && (e.preventDefault(), this._tabToEditableCell(e.shiftKey ? -1 : 1)));
    });
    D(this, "_onEditorBlur", () => {
      this._navigatingEditor || this.state.editing && this.stopEditing(!1);
    });
    // ----- Tree data (self-referential parent_id) -----
    //
    // The model layer flattens the tree and hands us back a Map of per-row
    // metadata (level, hasChildren, expanded). The controller owns the
    // expanded/collapsed override Map; the model just calls back through
    // `isTreeRowExpanded` to ask which state a given row is in. Everything
    // else (filter, sort, paginate) flows through the normal pipeline.
    D(this, "_isTreeRowExpanded", (e, t) => {
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
      pagination: { enabled: !1, page: 0, pageSize: Be },
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = as(this), queueMicrotask(() => this._initialLoad());
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
        const h = t.getAttribute("data-label"), u = t.getAttribute("data-value");
        return h != null && (c.label = h), u != null && (c.value = u), c;
      }
      const i = {}, a = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      i[this.getRowIdValue] = a != null ? this._coerceRowId(a) : s + 1;
      const l = {};
      t.querySelectorAll("td").forEach((d) => {
        const c = d.getAttribute("data-cell-col-id-value") || d.getAttribute("data-col-id");
        if (!c) return;
        const h = d.getAttribute("data-cell-value");
        if (h != null)
          try {
            i[c] = JSON.parse(h);
          } catch {
            i[c] = h;
          }
        else
          i[c] = d.textContent.trim();
        const u = Number(d.getAttribute("data-spans") || d.getAttribute("colspan") || 1);
        u > 1 && (l[c] = u);
      }), Object.keys(l).length && (i.__sgSpans = l);
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
      e = g("table");
      const s = g("thead");
      e.appendChild(s), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = g("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const s = g("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(s, e), s.appendChild(e), this._viewport = s;
    }
    if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = g("div", { class: "sg-status-bar", role: "status" }), this._statusBar.append(
      g("div", { class: "sg-status-section sg-status-left" }),
      g("div", { class: "sg-status-section sg-status-right" })
    ), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
      const s = g("div", { class: "sg-main" });
      this._viewport.parentNode.insertBefore(s, this._viewport), s.appendChild(this._viewport), this._statusBar && s.appendChild(this._statusBar), this._main = s, this._sidePanel = g("aside", {
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
    const s = this.state.filterModel[e.field] || {}, i = dn(e.filter), a = g("div", { class: "sg-filter-popover" }), l = g("select");
    i.forEach((y) => l.append(new Option(y.label, y.value, !1, y.value === s.type)));
    const o = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", d = g("input", { type: o, value: s.value ?? "" }), c = g("input", { type: o, value: s.value2 ?? "", style: { display: "none" } }), h = () => {
      const y = l.value, C = y === "inRange", v = !(y === "blank" || y === "notBlank");
      d.style.display = v ? "" : "none", c.style.display = C ? "" : "none";
    };
    l.addEventListener("change", h), h();
    const u = g("div", { class: "sg-filter-actions" }), p = g("button", { type: "button" }, "Clear"), f = g("button", { type: "button", class: "primary" }, "Apply");
    u.append(p, f), p.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), f.addEventListener("click", () => {
      const y = l.value, C = y === "blank" || y === "notBlank" ? { filterType: e.filter, type: y } : { filterType: e.filter, type: y, value: d.value, value2: c.value || void 0 };
      this.setColumnFilter(e.field, C), this._closeFilterPopover();
    }), a.append(
      g("label", {}, "Condition"),
      l,
      d,
      c,
      u
    ), document.body.appendChild(a);
    const _ = t.getBoundingClientRect();
    a.style.left = `${_.left + window.scrollX}px`, a.style.top = `${_.bottom + window.scrollY + 2}px`, this._filterPopover = a, document.addEventListener("mousedown", this._onDocMouseDown), d.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const s = this.state.columnDefs.findIndex((d) => d.field === e.field), i = this._runtimeOverrides[e.field] || {}, a = s >= 0 ? this.state.columnDefs[s] : null, l = a ? {
      ...a.hidden != null ? { hidden: a.hidden } : {},
      ...a.pinned ? { pinned: a.pinned } : {},
      ...a.width != null ? { width: a.width } : {}
    } : {}, o = { ...e, ...i, ...l, _headerEl: t };
    if (s >= 0) {
      const d = this.state.columnDefs[s];
      if (d._headerEl === t && on(d, o)) return;
      this.state.columnDefs[s] = o;
    } else
      this.state.columnDefs.push(o);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${W(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const s = this.state.sortModel.findIndex((a) => a.colId === e);
    let i;
    s === -1 ? i = { colId: e, sort: "asc" } : this.state.sortModel[s].sort === "asc" ? i = { colId: e, sort: "desc" } : i = null, t ? (s >= 0 && this.state.sortModel.splice(s, 1), i && this.state.sortModel.push(i)) : this.state.sortModel = i ? [i] : [], this.scheduleRender("sort"), S(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
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
    const s = this.state.selection;
    this.rowSelectionValue === "single" ? (s.clear(), s.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? s.has(e) ? s.delete(e) : s.add(e) : (s.clear(), s.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), S(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(s)
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
    const s = this._displayList.filteredSorted, i = s.findIndex((d) => this._rowId(d) === e), a = s.findIndex((d) => this._rowId(d) === t);
    if (i < 0 || a < 0) return;
    const [l, o] = i <= a ? [i, a] : [a, i];
    for (let d = l; d <= o; d++)
      !s[d].__sgGroup && !s[d].__sgSeparator && this.state.selection.add(this._rowId(s[d]));
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
    const e = Object.fromEntries(this.state.columnDefs.map((i) => [i.field, i])), t = this.state.columnDefs.filter((i) => !i.hidden && !i._isCheckbox);
    let s = Ge(this.state.rowData, this.state.filterModel, e);
    return s = Oe(s, this.state.quickFilter, t), s.length;
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
    const i = this.state.columnDefs.find((l) => l.field === t);
    if (!i || !i.editable) return;
    const a = this.state.rowData.find((l) => this._rowId(l) === e);
    a && (this.state.editing = { rowId: e, colId: t, originalValue: I(a, i), initialValue: s }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: s, originalValue: i, draftValue: a } = this.state.editing, l = this._tbody.querySelector(`tr[data-row-id="${W(t)}"] td[data-col-id="${W(s)}"]`);
    let o = i;
    if (!e && l) {
      const d = l.querySelector("[data-editor-input]") || l.querySelector("input,select,textarea");
      d ? o = cn(d.value, this._colByField(s)?.type) : a !== void 0 && (o = a);
    }
    if (this.state.editing = null, !e && o !== i) {
      const d = this.state.rowData.find((h) => this._rowId(h) === t), c = d[s];
      d[s] = o, S(this.element, "grid:cellValueChanged", { rowId: t, colId: s, oldValue: c, newValue: o });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const s = this._colByField(e);
    s && (s.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), S(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const i = t || null;
    s.pinned = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: i }, this._reorderForPinning(), this.scheduleRender("columns"), S(this.element, "grid:columnPinned", { colId: e, pinned: i });
  }
  setColumnWidth(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const i = Math.max(s.minWidth || 40, Math.min(s.maxWidth || 4e3, t));
    s.width = i, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: i }, this.scheduleRender("columns"), S(this.element, "grid:columnResized", { colId: e, width: i });
  }
  moveColumn(e, t) {
    const s = this.state.columnDefs.findIndex((a) => a.field === e);
    if (s < 0 || s === t) return;
    const [i] = this.state.columnDefs.splice(s, 1);
    this.state.columnDefs.splice(t, 0, i), this.scheduleRender("columns"), S(this.element, "grid:columnMoved", { colId: e, fromIndex: s, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const s = W(e), i = this._thead?.querySelector(
      `th[data-header-cell-field-value="${s}"], th[data-field="${s}"]`
    ), a = Array.from(
      this._tbody?.querySelectorAll(`td[data-col-id="${s}"]`) || []
    ).filter((o) => !o.closest("tr")?.classList?.contains("sg-spacer"));
    let l = 0;
    if ((i || a.length) && (l = this._measureColumnContentWidth(i, a)), !l) {
      const o = (t.headerName || t.field || "").length, d = this.state.rowData.slice(0, 200);
      let c = o;
      for (const h of d) {
        const u = String(H(h, t) ?? "").length;
        u > c && (c = u);
      }
      l = c * 8;
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, l + 16)));
  }
  // Build an off-screen single-column <table table-layout:auto> with clones
  // of the header + a sample of body cells, mount it inside .sg-grid so
  // scoped CSS still applies, read the natural td widths, return the max.
  _measureColumnContentWidth(e, t, s = 50) {
    const i = document.createElement("table");
    i.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;table-layout:auto;width:auto;border-collapse:separate;border-spacing:0;";
    const a = document.createElement("tbody");
    i.appendChild(a);
    const l = (d) => {
      if (!d) return;
      const c = document.createElement("tr"), h = d.cloneNode(!0);
      h.removeAttribute("style"), c.appendChild(h), a.appendChild(c);
    };
    if (l(e), t.slice(0, s).forEach(l), !a.children.length) return 0;
    this.element.appendChild(i);
    let o = 0;
    for (const d of a.children) {
      const c = d.firstElementChild;
      c && c.offsetWidth > o && (o = c.offsetWidth);
    }
    return this.element.removeChild(i), o;
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), s = t.reduce((a, l) => a + (l.width || 150), 0);
    if (s === 0) return;
    const i = e / s;
    t.forEach((a) => {
      a.width = Math.max(a.minWidth || 40, Math.floor((a.width || 150) * i));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((i) => i.pinned === "left"), t = this.state.columnDefs.filter((i) => i.pinned === "right"), s = this.state.columnDefs.filter((i) => !i.pinned);
    this.state.columnDefs = [...e, ...s, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), S(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], s = [], i = [], a = new Map(this.state.rowData.map((l) => [this._rowId(l), l]));
    return (e.remove || []).forEach((l) => {
      const o = this._rowId(l);
      a.delete(o) && i.push(l);
    }), (e.update || []).forEach((l) => {
      const o = this._rowId(l);
      a.has(o) && (a.set(o, { ...a.get(o), ...l }), s.push(l));
    }), (e.add || []).forEach((l) => {
      const o = this._rowId(l);
      a.has(o) || (a.set(o, l), t.push(l));
    }), this.state.rowData = Array.from(a.values()), this.scheduleRender("data"), S(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: s, removed: i };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const s = this.state.columnDefs.filter((o) => !o.hidden && !o._isCheckbox), i = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((o) => !o.__sgGroup && !o.__sgDetail && !o.__sgSeparator), a = (o) => /[",\n\r]/.test(o) ? `"${String(o).replace(/"/g, '""')}"` : String(o), l = [s.map((o) => a(o.headerName || o.field)).join(e)];
    for (const o of i)
      l.push(s.map((d) => a(H(o, d))).join(e));
    return l.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const s = this.getDataAsCsv(t), i = new Blob([s], { type: "text/csv;charset=utf-8" }), a = URL.createObjectURL(i), l = g("a", { href: a, download: e });
    return document.body.appendChild(l), l.click(), l.remove(), URL.revokeObjectURL(a), s;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.has("tree") || e.size === 0) && (this._displayList = is({
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
    const e = this._visibleCols(), t = ss(e, this._headerLayoutOpts());
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
    t || (t = g("colgroup"), this._table.insertBefore(t, this._thead));
    const s = Array.from(t.children);
    for (e.forEach((a, l) => {
      let o = s[l];
      o || (o = g("col"), t.appendChild(o)), o.style.width = a.width ? a.width + "px" : "";
    }); t.children.length > e.length; ) t.lastElementChild.remove();
    if (e.some((a) => !a.width))
      this._table.style.width = "100%";
    else {
      const a = e.reduce((o, d) => o + (Number(d.width) || 0), 0), l = this._viewport?.clientWidth || 0;
      if (l && a < l && e.length > 0) {
        const o = t.lastElementChild, d = Number(e[e.length - 1].width) || 0, c = a - d;
        o.style.width = l - c + "px", this._table.style.width = l + "px";
      } else
        this._table.style.width = a + "px";
    }
  }
  _renderHeaderSingleRow(e) {
    if (this._thead.children.length > 1) {
      const u = this._thead.firstElementChild;
      for (let p = 1; p < this._thead.children.length; p++) {
        const f = this._thead.children[p];
        Array.from(f.children).forEach((_) => {
          (_.hasAttribute("data-header-cell-field-value") || _.hasAttribute("data-field")) && u.appendChild(_);
        });
      }
      for (; this._thead.children.length > 1; ) this._thead.lastElementChild.remove();
    }
    const t = this._thead.querySelector("tr") || (() => {
      const u = g("tr");
      return this._thead.appendChild(u), u;
    })(), s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((u) => {
      const p = u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field");
      p && s.set(p, u);
    });
    const i = new Set(e.map((u) => u.field)), a = this.state.columnDefs.filter((u) => !i.has(u.field)), l = [...e, ...a], o = Array.from(t.children).map((u) => u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field")).filter(Boolean), d = l.map((u) => u.field);
    if (o.length === d.length && o.every((u, p) => u === d[p]))
      Array.from(t.children).forEach((u) => {
        u.removeAttribute("rowspan"), u.removeAttribute("colspan");
      });
    else {
      const u = [];
      for (const p of l) {
        let f = s.get(p.field);
        f ? (f.removeAttribute("rowspan"), f.removeAttribute("colspan")) : f = g("th", {
          "data-field": p.field,
          "data-synth": "true"
        }, [g("div", { class: "sg-header-content" }, [
          g("span", { class: "sg-header-label" }, p.headerName || p.field || "")
        ])]), u.push(f);
      }
      t.replaceChildren(...u);
    }
    Array.from(t.children).forEach((u) => {
      const p = u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field");
      p != null && (u.style.display = i.has(p) ? "" : "none");
    });
    const h = this._pinOffsets();
    for (const u of e) {
      const p = t.querySelector(`th[data-header-cell-field-value="${W(u.field)}"]`) || t.querySelector(`th[data-field="${W(u.field)}"]`);
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
    const i = [], a = new Set(e.map((c) => c.field)), l = this._pinOffsets();
    for (const c of t.rows) {
      const h = g("tr");
      for (const u of c) {
        if (u.kind === "group") {
          h.appendChild(g("th", {
            class: "sg-header-group",
            colspan: String(u.colspan),
            "data-group-header": "true"
          }, u.label || ""));
          continue;
        }
        const p = u.col;
        let f = s.get(p.field);
        if (f || (f = g("th", {
          "data-field": p.field,
          "data-synth": "true"
        }, [g("div", { class: "sg-header-content" }, [
          g("span", { class: "sg-header-label" }, u.label || p.headerName || p.field || "")
        ])])), u.label) {
          const _ = f.querySelector(".sg-header-label");
          _ && _.textContent !== u.label && (_.textContent = u.label);
        }
        f.setAttribute("rowspan", String(u.rowspan)), f.removeAttribute("colspan"), f.style.display = "", h.appendChild(f), this._applyLeafThState(f, p, l);
      }
      i.push(h);
    }
    const o = /* @__PURE__ */ new Set();
    t.rows.forEach((c) => c.forEach((h) => {
      h.kind === "leaf" && o.add(h.col.field);
    }));
    const d = this.state.columnDefs.filter(
      (c) => !a.has(c.field) && !o.has(c.field)
    );
    if (d.length) {
      const c = g("tr", { class: "sg-hidden-header-row" });
      for (const h of d) {
        let u = s.get(h.field);
        u || (u = g("th", { "data-field": h.field, "data-synth": "true" })), u.removeAttribute("rowspan"), u.removeAttribute("colspan"), c.appendChild(u);
      }
      i.push(c);
    }
    this._thead.replaceChildren(...i);
  }
  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(e, t, s) {
    const i = this.state.sortModel.find((a) => a.colId === t.field);
    Te(e, {
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
    return typeof t == "string" && an.has(t) ? "right" : null;
  }
  _ensureHeaderChrome(e, t, s) {
    if (t._isRowNumber) {
      e.classList.add("sg-gutter-header"), e.textContent = "";
      return;
    }
    if (t._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let o = e.querySelector('input[type="checkbox"]');
      o || (o = g("input", { type: "checkbox", "aria-label": "Select all" }), o.addEventListener("change", (h) => {
        h.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(o));
      const d = this._displayList.filteredSorted.length, c = this.state.selection.size;
      o.checked = c > 0 && c >= d, o.indeterminate = c > 0 && c < d;
      return;
    }
    let i = e.querySelector(".sg-header-content");
    if (!i) {
      const o = e.textContent.trim();
      e.textContent = "", i = g("div", { class: "sg-header-content" }, [
        g("span", { class: "sg-header-label" }, o || t.headerName || t.field || "")
      ]), e.appendChild(i);
    }
    let a = i.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (a || (a = g("span", { class: "sg-sort-icon", "aria-hidden": "true" }), a.innerHTML = ae, i.appendChild(a)), s && this.state.sortModel.length > 1) {
        let o = i.querySelector(".sg-sort-index");
        o || (o = g("span", { class: "sg-sort-index" }), i.appendChild(o)), o.textContent = String(this.state.sortModel.indexOf(s) + 1);
      } else
        i.querySelector(".sg-sort-index")?.remove();
    else a && a.remove();
    let l = i.querySelector(".sg-filter-icon");
    t.filter ? l || (l = g("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), l.innerHTML = rn, i.appendChild(l)) : l && l.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(g("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._withDetailRows(this._displayList.pageRows);
    this._selKeys = this._computeCellSelKeys();
    const s = !this.masterDetailValue && (this.virtualValue || t.length > 200);
    let i = t, a = 0;
    if (s) {
      const u = this._viewport?.clientHeight || 400, p = this.state.rowHeight, f = rs(this.state.scrollTop, u, p, t.length, 8);
      a = f.first, i = t.slice(f.first, f.last);
    }
    const l = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((u) => {
      const p = u.dataset.rowId;
      p != null && l.set(p, u);
    });
    const o = document.createDocumentFragment(), d = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0;
    let c = 0;
    for (let u = 0; u < a; u++) {
      const p = t[u];
      p && !p.__sgGroup && !p.__sgDetail && !p.__sgSeparator && (c += 1);
    }
    const h = (u) => !u || u.__sgGroup || u.__sgDetail || u.__sgSeparator ? null : (c += 1, d + c);
    if (s) {
      const u = this.state.rowHeight, p = a * u, f = (t.length - a - i.length) * u;
      o.appendChild(this._spacerRow(p, e.length)), i.forEach((_) => o.appendChild(this._buildRow(_, e, l, h(_)))), o.appendChild(this._spacerRow(f, e.length));
    } else
      i.forEach((u) => o.appendChild(this._buildRow(u, e, l, h(u))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && o.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(o);
  }
  _buildPinnedBottomRow(e) {
    const t = g("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), s = this._pinOffsets(), i = this._displayList.grandTotals || {};
    let a = !1;
    for (const l of e) {
      const o = g("td", { "data-col-id": l.field, "data-pinned": l.pinned || null });
      l.pinned === "left" ? o.style.left = s.left[l.field] + "px" : l.pinned === "right" && (o.style.right = s.right[l.field] + "px");
      const d = i[l.field];
      d != null ? (o.classList.add("sg-agg-cell"), o.textContent = this._formatAggregate(d)) : !a && !l._isCheckbox && !l._isRowNumber && (o.classList.add("sg-pinned-bottom-label"), o.textContent = "Total", a = !0), t.appendChild(o);
    }
    return t;
  }
  _buildRow(e, t, s, i) {
    if (e.__sgGroup) return this._buildGroupRow(e, t, s);
    if (e.__sgDetail) return this._buildDetailRow(e, t, s);
    if (e.__sgSeparator) return this._buildSeparatorRow(e, t, s);
    const a = String(this._rowId(e));
    let l = s.get(a);
    l || (l = g("tr")), l.dataset.rowId = a, l.classList.remove("sg-spacer");
    const o = this.state.selection.has(this._rowId(e)), d = this.masterDetailValue && this._isDetailExpanded(a);
    return Te(l, {
      "data-selected": o ? "true" : null,
      "data-detail-expanded": d ? "true" : null
    }), this.masterDetailValue && l.classList.add("sg-master-row"), this._renderRow(l, e, t, i), l;
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
    let a = s.get(i);
    a || (a = g("tr")), a.dataset.rowId = i, a.dataset.separator = "true", a.className = "", a.removeAttribute("data-selected"), a.removeAttribute("data-detail-expanded");
    const l = e.variant || (e.value != null ? "summary" : e.label != null ? "heading" : "blank");
    a.classList.add("sg-separator-row", `sg-separator-${l}`), e.className && a.classList.add(e.className), a.innerHTML = "";
    const o = (h) => h._isCheckbox || h._isRowNumber || h._isGroupCol || h._isMasterExpand, c = t.filter((h) => !o(h)).length || t.length || 1;
    for (const h of t) {
      if (o(h)) {
        const p = g("td", { "data-col-id": h.field, class: "sg-separator-gutter" });
        a.appendChild(p);
        continue;
      }
      const u = g("td", {
        "data-col-id": h.field,
        colspan: String(c),
        class: "sg-separator-cell"
      });
      this._renderSeparatorContent(u, e, l), a.appendChild(u);
      break;
    }
    return a;
  }
  _renderSeparatorContent(e, t, s) {
    if (s === "blank" || s === "divider")
      return;
    const i = g("div", { class: "sg-separator-content" });
    t.label != null && i.appendChild(g("span", { class: "sg-separator-label" }, String(t.label))), t.value != null && i.appendChild(g("span", { class: "sg-separator-value" }, String(t.value))), e.appendChild(i);
  }
  _separatorKey(e) {
    return [e.variant || "", e.label || "", e.value || ""].join("|");
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const i = g("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return i.style.height = "0px", i.appendChild(g("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), i;
    }
    const s = g("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return s.style.height = e + "px", s.appendChild(g("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), s;
  }
  _renderRow(e, t, s, i) {
    e.innerHTML = "";
    const a = this._pinOffsets(), l = this._selKeys || { active: null, range: null }, o = String(this._rowId(t)), d = this._displayList?.treeMeta, c = d ? d.get(o) : null, h = c ? this._treeDisplayColField() : null, u = t && t.__sgSpans || null;
    let p = 0;
    for (let f = 0; f < s.length; f++) {
      const _ = s[f];
      if (p > 0) {
        p -= 1;
        continue;
      }
      const y = _._isRowNumber || _._isCheckbox || _._isGroupCol || _._isMasterExpand, C = u && !y ? Number(u[_.field]) : 0, v = Math.max(1, Math.min(C || 1, s.length - f));
      v > 1 && (p = v - 1);
      const b = `${o}:${_.field}`, w = g("td", {
        "data-col-id": _.field,
        "data-pinned": _.pinned || null,
        "data-cell-active": l.active === b ? "true" : null,
        "data-cell-range": l.range && l.range.has(b) ? "true" : null,
        colspan: v > 1 ? String(v) : null
      });
      if (v > 1 && w.classList.add("sg-merged-cell"), _.pinned === "left" ? w.style.left = a.left[_.field] + "px" : _.pinned === "right" && (w.style.right = a.right[_.field] + "px"), _._isRowNumber) {
        w.classList.add("sg-gutter-cell"), w.setAttribute("data-gutter", "true"), w.removeAttribute("data-cell-active"), w.removeAttribute("data-cell-range"), w.textContent = i != null ? String(i) : "", e.appendChild(w);
        continue;
      }
      if (_._isCheckbox) {
        w.classList.add("sg-checkbox-cell");
        const L = g("input", { type: "checkbox" });
        L.checked = this.state.selection.has(this._rowId(t)), w.appendChild(L), e.appendChild(w);
        continue;
      }
      if (_._isGroupCol) {
        w.classList.add("sg-group-leaf-cell"), w.removeAttribute("data-cell-active"), w.removeAttribute("data-cell-range"), e.appendChild(w);
        continue;
      }
      if (_._isMasterExpand) {
        w.classList.add("sg-master-expand-cell"), w.setAttribute("data-master-expand", "true"), w.removeAttribute("data-cell-active"), w.removeAttribute("data-cell-range");
        const L = this._isDetailExpanded(this._rowId(t)), R = g("span", {
          class: "sg-master-expand-caret",
          "data-expanded": L ? "true" : "false",
          "aria-hidden": "true"
        });
        R.innerHTML = ae, w.appendChild(R), e.appendChild(w);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === _.field) {
        w.setAttribute("data-editing", "true");
        const L = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : I(t, _), { node: R, control: T } = this._buildEditor(_, L);
        w.appendChild(R);
        const k = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          if (T?.focus(), k || T?.select?.(), T?.type && ln.has(T.type))
            try {
              T.showPicker?.();
            } catch {
            }
        });
      } else
        this._renderCellContent(w, t, _);
      c && _.field === h && this._decorateTreeCell(w, c), e.appendChild(w);
    }
  }
  // Prepend an indent spacer + a chevron (when the row has children) to the
  // tree column's <td>. The chevron carries data-tree-toggle so the body
  // click handler can route it back to toggleTreeRow without conflicting
  // with cell selection or row click handlers.
  _decorateTreeCell(e, t) {
    if (e.classList.add("sg-tree-cell"), e.setAttribute("data-tree-level", String(t.level)), e.style.paddingLeft = `${8 + t.level * 18}px`, t.hasChildren) {
      const s = g("span", {
        class: "sg-tree-chevron",
        "data-tree-toggle": "true",
        "data-expanded": t.expanded ? "true" : "false",
        "aria-hidden": "true"
      });
      s.innerHTML = ae, e.insertBefore(s, e.firstChild);
    } else {
      const s = g("span", { class: "sg-tree-chevron sg-tree-chevron-leaf", "aria-hidden": "true" });
      e.insertBefore(s, e.firstChild);
    }
  }
  _renderCellContent(e, t, s) {
    if (s.cellRenderer) {
      const i = ke(s.cellRenderer);
      if (i) {
        const l = I(t, s), o = H(t, s);
        (i.dataset.bind || i.dataset.bindText !== void 0) && (i.textContent = i.dataset.bind ? String(t[i.dataset.bind] ?? "") : o), i.dataset.bindAttr && i.setAttribute(i.dataset.bindAttr, l), i.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((d) => {
          d.dataset.bindText !== void 0 ? d.textContent = o : d.dataset.bind && (d.textContent = String(t[d.dataset.bind] ?? "")), d.dataset.bindAttr && d.setAttribute(d.dataset.bindAttr, l);
        }), e.appendChild(i);
        return;
      }
      const a = Ue(s.cellRenderer);
      if (typeof a == "function") {
        const l = I(t, s), o = H(t, s), d = a({ value: l, row: t, col: s, td: e, formatted: o, api: this.element.gridApi });
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
    e.textContent = H(t, s);
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
    for (const { field: s, aggFunc: i } of e || [])
      s && i && (t[s] = i);
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
        const t = new Map(this.state.columnDefs.map((i) => [i.field, i])), s = [];
        for (const i of e.cols) {
          const a = t.get(i.field);
          a && (i.width != null && (a.width = i.width), a.pinned = i.pinned || void 0, a.hidden = !!i.hidden, t.delete(i.field), s.push(a));
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
    for (const t of $e) this.element.addEventListener(t, e);
    this._persistBeforeUnload = () => {
      this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
    }, window.addEventListener("beforeunload", this._persistBeforeUnload);
  }
  _teardownPersistence() {
    if (this._persistListener) {
      for (const e of $e) this.element.removeEventListener(e, this._persistListener);
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
    let a = s.get(i);
    return a || (a = g("tr")), a.dataset.rowId = i, a.dataset.group = "true", a.dataset.groupLevel = String(e.level), a.className = "sg-group-row", this._renderGroupRow(a, e, t), a;
  }
  _renderGroupRow(e, t, s) {
    e.innerHTML = "";
    const i = this._pinOffsets(), a = this._isGroupExpanded(t.groupId, t.level), l = (this.state.group.displayType || "singleColumn") === "singleColumn", o = !!(this.state.pivot?.mode && this._displayList?.pivot), d = t.__pivotAll === !0, c = s.filter((p) => !p._isRowNumber && !p._isCheckbox && !p._isGroupCol), h = c.some((p) => p.field === t.field) ? t.field : c[0]?.field, u = Math.max(0, t.level);
    d && e.classList.add("sg-pivot-all-row");
    for (const p of s) {
      const f = g("td", { "data-col-id": p.field, "data-pinned": p.pinned || null });
      if (p.pinned === "left" ? f.style.left = i.left[p.field] + "px" : p.pinned === "right" && (f.style.right = i.right[p.field] + "px"), p._isRowNumber || p._isCheckbox) {
        f.classList.add(p._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(f);
        continue;
      }
      if (o || l ? p._isGroupCol : p.field === h) {
        if (f.classList.add("sg-group-cell"), f.style.paddingLeft = `${8 + u * 18}px`, !d) {
          const y = g("span", {
            class: "sg-group-caret",
            "data-expanded": a ? "true" : "false",
            "aria-hidden": "true"
          });
          y.innerHTML = ae, f.appendChild(y);
        }
        f.append(
          g("span", { class: "sg-group-label" }, this._groupValueLabel(t)),
          g("span", { class: "sg-group-count" }, ` (${t.count})`)
        );
      } else if (o && p._isPivot) {
        const y = I(t, p);
        y != null && (f.classList.add("sg-agg-cell"), f.textContent = this._formatAggregate(y));
      } else !p._isGroupCol && t.aggregates && t.aggregates[p.field] != null && (f.classList.add("sg-agg-cell"), f.textContent = this._formatAggregate(t.aggregates[p.field]));
      e.appendChild(f);
    }
  }
  _groupValueLabel(e) {
    const t = e.value;
    if (t == null || t === "") return "(Blanks)";
    const s = this._colByField(e.field);
    return s ? H({ [e.field]: t }, s) : String(t);
  }
  _formatAggregate(e) {
    return e == null ? "" : typeof e == "number" ? Number.isInteger(e) ? String(e) : String(Math.round(e * 100) / 100) : String(e);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, t) {
    if (e.cellEditor) {
      const i = ke(e.cellEditor);
      if (i) {
        const a = i.matches?.("input,select,textarea") ? i : i.querySelector?.("[data-editor-input]") || i.querySelector?.("input,select,textarea");
        return a && (this._seedEditorValue(a, e, t), a.addEventListener("keydown", this._onEditorKey), a.addEventListener("blur", this._onEditorBlur)), { node: i, control: a };
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
        const a = i.getTimezoneOffset() * 6e4;
        e.value = new Date(i.getTime() - a).toISOString().slice(0, 16);
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
    if (e.type === "number") s = g("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const i = t instanceof Date ? t : t ? new Date(t) : null, a = i ? i.toISOString().slice(0, 10) : "";
      s = g("input", { type: "date", value: a });
    } else if (e.type === "datetime") {
      const i = t instanceof Date ? t : t ? new Date(t) : null;
      let a = "";
      if (i && !Number.isNaN(i.getTime())) {
        const l = i.getTimezoneOffset() * 6e4;
        a = new Date(i.getTime() - l).toISOString().slice(0, 16);
      }
      s = g("input", { type: "datetime-local", value: a });
    } else if (e.type === "color") {
      const i = /^#[0-9a-f]{6}$/i.test(String(t ?? "")) ? t : "#000000";
      s = g("input", { type: "color", value: i });
    } else e.type === "email" ? s = g("input", { type: "email", value: t ?? "" }) : e.type === "url" ? s = g("input", { type: "url", value: t ?? "" }) : e.type === "tel" ? s = g("input", { type: "tel", value: t ?? "" }) : e.type === "boolean" ? (s = g("select"), s.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : s = g("input", { type: "text", value: t ?? "" });
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
    const a = this.state.selection.size;
    a > 0 && e.appendChild(this._statusPanel("Selected", this._fmtInt(a))), t.replaceChildren();
    const l = this.getRangeAggregates();
    if (l && l.count > 0) {
      const d = (this.statusBarAggsValue || []).filter((c) => c in l);
      for (const c of d) {
        const h = l[c];
        h == null && c !== "count" || t.appendChild(this._statusPanel(this._aggLabel(c), this._fmtAgg(c, h)));
      }
    }
    const o = l ? `${l.count}|${l.sum}|${l.avg}|${l.min}|${l.max}` : "";
    o !== this._lastRangeAggs && (this._lastRangeAggs = o, S(this.element, "grid:rangeAggsChanged", { aggs: l }));
  }
  _statusPanel(e, t, s = null) {
    const i = g("div", { class: "sg-status-panel" });
    return i.append(
      g("span", { class: "sg-status-label" }, `${e}:`),
      g("span", { class: "sg-status-value" }, t)
    ), s && i.appendChild(g("span", { class: "sg-status-aside" }, s)), i;
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
          const a = s.rows[i];
          if (!(!a || a.__sgGroup || a.__sgDetail || a.__sgSeparator))
            for (let l = s.c0; l <= s.c1; l++) {
              const o = s.cols[l];
              !o || o._isCheckbox || o._isRowNumber || o._isGroupCol || o._isMasterExpand || e.push(I(a, o));
            }
        }
    }
    return e;
  }
  getRangeAggregates() {
    return this.state.cellSel.ranges.length ? Ut(this._cellRangeRawValues()) : null;
  }
  _showColumnMenu(e, t, s) {
    this._closeColumnMenu();
    const i = this._columnMenuItems(e), a = g("div", { class: "sg-column-menu", role: "menu" });
    for (const d of i) {
      if (d === "separator") {
        a.appendChild(g("div", { class: "sg-column-menu-separator", role: "separator" }));
        continue;
      }
      const c = g("button", {
        type: "button",
        class: "sg-column-menu-item" + (d.active ? " sg-column-menu-active" : ""),
        role: "menuitem"
      });
      c.append(
        g("span", { class: "sg-column-menu-label" }, d.label)
      ), d.active && c.append(g("span", { class: "sg-column-menu-check", "aria-hidden": "true" }, "✓")), c.addEventListener("click", () => {
        d.action(), this._closeColumnMenu();
      }), a.appendChild(c);
    }
    document.body.appendChild(a);
    const l = a.offsetWidth || 220, o = a.offsetHeight || 280;
    a.style.left = `${Math.min(t, window.innerWidth - l - 4)}px`, a.style.top = `${Math.min(s, window.innerHeight - o - 4)}px`, this._columnMenu = a, setTimeout(() => {
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
    const t = this.element.gridApi, s = e.headerName || e.field, i = this.state.group.cols.includes(e.field), a = this.state.pivot.cols.includes(e.field), l = this.state.group.aggs[e.field], o = e.type === "number", d = [];
    if (e.pinned !== "left" && d.push({ label: "Pin left", action: () => t.setColumnPinned(e.field, "left") }), e.pinned !== "right" && d.push({ label: "Pin right", action: () => t.setColumnPinned(e.field, "right") }), e.pinned && d.push({ label: "Unpin", action: () => t.setColumnPinned(e.field, null) }), d.push("separator"), d.push({ label: "Autosize this column", action: () => t.autoSizeColumn(e.field) }), d.push({ label: "Autosize all columns", action: () => t.autoSizeAllColumns() }), d.push("separator"), d.push(i ? { label: `Ungroup ${s}`, action: () => t.removeRowGroupColumn(e.field) } : { label: `Group by ${s}`, action: () => t.addRowGroupColumn(e.field) }), d.push(a ? { label: `Remove ${s} from pivot`, action: () => t.removePivotColumn(e.field) } : { label: `Pivot by ${s}`, action: () => {
      t.isPivotMode() || t.setPivotMode(!0), t.addPivotColumn(e.field);
    } }), o || l) {
      d.push("separator");
      for (const c of ["sum", "avg", "count", "min", "max"])
        d.push({
          label: `Aggregate: ${c}`,
          active: l === c,
          action: () => t.addValueColumn(e.field, c)
        });
      l && d.push({ label: "Remove aggregation", action: () => t.removeValueColumn(e.field) });
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
    const i = t.dataset.colId, a = this._colByField(i);
    return a && a.acceptFiles === !1 ? null : { td: t, tr: s, colId: i, rowId: this._coerceRowId(s.dataset.rowId), col: a };
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
    const a = this._coerceRowId(t.dataset.rowId), l = e.target.closest("td");
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(a, "toggle");
      return;
    }
    if (l && l.dataset.gutter === "true") {
      if (this._rowDragMoved) {
        this._rowDragMoved = !1;
        return;
      }
      if (this.rowSelectionValue !== "") {
        const d = e.shiftKey ? "range" : e.metaKey || e.ctrlKey ? "toggle" : "replace";
        this.clearCellSelection(), this.toggleRowSelection(a, d), S(this.element, "grid:rowClicked", { rowId: a, row: this.state.rowData.find((c) => this._rowId(c) === a), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (l) {
      const d = this.state.rowData.find((h) => this._rowId(h) === a), c = l.dataset.colId;
      S(this.element, "grid:cellClicked", { rowId: a, colId: c, value: d?.[c], event: e });
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
    this.toggleRowSelection(a, o), S(this.element, "grid:rowClicked", { rowId: a, row: this.state.rowData.find((d) => this._rowId(d) === a), event: e });
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
    const t = Array.from(this.state.selection).map(String), s = new Set(t.includes(String(e)) ? t : [String(e)]), i = g("div", { class: "sg-drag-ghost sg-grid" }), a = g("table"), l = g("tbody");
    let o = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((c) => {
      if (s.has(c.dataset.rowId) && o < 6) {
        const h = c.cloneNode(!0);
        h.removeAttribute("data-selected"), h.querySelectorAll("td").forEach((u) => {
          u.style.left = "", u.style.right = "", u.removeAttribute("data-pinned"), u.removeAttribute("data-cell-active"), u.removeAttribute("data-cell-range");
        }), l.appendChild(h), o += 1;
      }
    }), a.appendChild(l), i.appendChild(a), s.size > o && i.appendChild(g("div", { class: "sg-drag-ghost-more" }, `+${s.size - o} more rows`)), i.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(i);
    const d = g("div", { class: "sg-drop-indicator" });
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
    const a = s.getBoundingClientRect(), l = this._viewport.getBoundingClientRect(), o = this._rowDrag.indicator;
    o.style.left = `${l.left}px`, o.style.width = `${l.width}px`, o.style.top = `${(i ? a.top : a.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(s.dataset.rowId), this._rowDrag.dropBefore = i;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: s, dropRowId: i, dropBefore: a } = this._rowDrag;
    if (t.remove(), s.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, i == null || e.has(String(i))) return;
    const l = this.state.rowData, o = l.filter((h) => e.has(String(this._rowId(h)))), d = l.filter((h) => !e.has(String(this._rowId(h))));
    let c = d.findIndex((h) => this._rowId(h) === i);
    c < 0 ? c = d.length : a || (c += 1), d.splice(c, 0, ...o), this.state.rowData = d, this.state.sortModel = [], this.scheduleRender("data"), S(this.element, "grid:rowDragEnd", {
      ids: o.map((h) => this._rowId(h)),
      toRowId: i,
      before: a
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
    const t = this._displayList.pageRows, s = this._visibleCols(), i = (h) => t.findIndex((u) => this._rowId(u) === h), a = (h) => s.findIndex((u) => u.field === h), l = i(e.anchor.rowId), o = a(e.anchor.colId);
    if (l < 0 || o < 0) return null;
    const d = i(e.focus.rowId), c = a(e.focus.colId);
    return {
      r0: Math.min(l, d < 0 ? l : d),
      r1: Math.max(l, d < 0 ? l : d),
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
      const i = e.rows[s];
      if (!i) continue;
      const a = [];
      for (let l = e.c0; l <= e.c1; l++) {
        const o = e.cols[l];
        o && a.push(H(i, o));
      }
      t.push(a);
    }
    return t;
  }
  // Active cell key + union of all ranges' cells (active stays outlined, unfilled).
  _computeCellSelKeys() {
    const e = this._activeCell();
    if (!e) return { active: null, range: null };
    const t = `${e.rowId}:${e.colId}`, s = /* @__PURE__ */ new Set();
    for (const i of this.state.cellSel.ranges) {
      const a = this._rangeRect(i);
      if (a)
        for (let l = a.r0; l <= a.r1; l++) {
          const o = a.rows[l];
          if (o)
            for (let d = a.c0; d <= a.c1; d++) {
              const c = a.cols[d];
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
        for (let i = s.r0; i <= s.r1; i++) {
          const a = s.rows[i];
          a && e.add(this._rowId(a));
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
    const i = this._displayList.pageRows, a = this._navCols();
    if (!i.length || !a.length) return;
    const l = (u, p, f) => Math.max(p, Math.min(u, f)), o = this._activeCell(), d = () => i.findIndex((u) => !u.__sgGroup && !u.__sgDetail && !u.__sgSeparator);
    let c = o ? i.findIndex((u) => this._rowId(u) === o.rowId) : d(), h = o ? a.findIndex((u) => u.field === o.colId) : 0;
    if (c < 0 && (c = d()), !(c < 0)) {
      if (h < 0 && (h = 0), s && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const u = this.state.cellSel.ranges[this.state.cellSel.activeIdx], p = l(i.findIndex((_) => this._rowId(_) === u.focus.rowId) + e, 0, i.length - 1), f = l(a.findIndex((_) => _.field === u.focus.colId) + t, 0, a.length - 1);
        this._extendActiveRange({ rowId: this._rowId(i[p]), colId: a[f].field });
      } else {
        let u = l(c + e, 0, i.length - 1);
        if (e !== 0) {
          for (; i[u] && (i[u].__sgGroup || i[u].__sgDetail || i[u].__sgSeparator); ) {
            const f = u + e;
            if (f < 0 || f >= i.length) break;
            u = f;
          }
          if (!i[u] || i[u].__sgGroup || i[u].__sgDetail || i[u].__sgSeparator) return;
        }
        const p = l(h + t, 0, a.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(i[u]), colId: a[p].field });
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
      const s = this._rangeRect(t);
      if (s)
        for (let i = s.r0; i <= s.r1; i++) {
          const a = s.rows[i];
          if (!(!a || a.__sgGroup || a.__sgDetail || a.__sgSeparator))
            for (let l = s.c0; l <= s.c1; l++) {
              const o = s.cols[l];
              if (!o || !o.editable || o._isCheckbox || o._isRowNumber) continue;
              const d = a[o.field];
              d === "" || d == null || (a[o.field] = "", e = !0, S(this.element, "grid:cellValueChanged", { rowId: this._rowId(a), colId: o.field, oldValue: d, newValue: "" }));
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
    const i = this._coerceRowId(t.dataset.rowId), a = s.dataset.colId;
    this.startEditingCell(i, a);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const s = this._visibleCols().filter((u) => u.editable && !u._isCheckbox), i = this._displayList.pageRows, a = i.findIndex((u) => this._rowId(u) === t.rowId), l = s.findIndex((u) => u.field === t.colId);
    if (!s.length || !i.length || a < 0 || l < 0) {
      this.stopEditing(!1);
      return;
    }
    const o = i.length * s.length, d = (a * s.length + l + e + o) % o, c = i[Math.floor(d / s.length)], h = s[d % s.length];
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
    const a = t.map((o) => e.find((d) => d.field === o)).filter(Boolean), l = new Set(a);
    return [...a, ...e.filter((o) => !l.has(o))];
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
    S(this.element, "grid:detailRowExpanded", { rowId: e, masterRow: s });
  }
  collapseDetailRow(e) {
    if (!this.masterDetailValue) return;
    const t = String(e);
    if (!this._detailExpanded.has(t)) return;
    this._detailExpanded.delete(t), this._detailGrids.delete(t), this.scheduleRender("cells");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === t);
    S(this.element, "grid:detailRowCollapsed", { rowId: e, masterRow: s });
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
    const i = this.state.rowData.find((a) => String(this._rowId(a)) === t);
    S(this.element, s ? "grid:treeRowCollapsed" : "grid:treeRowExpanded", { rowId: e, row: i });
  }
  expandTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !0), this.scheduleRender("tree");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === t);
    S(this.element, "grid:treeRowExpanded", { rowId: e, row: s });
  }
  collapseTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (!this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !1), this.scheduleRender("tree");
    const s = this.state.rowData.find((i) => String(this._rowId(i)) === t);
    S(this.element, "grid:treeRowCollapsed", { rowId: e, row: s });
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
    return e || this._visibleCols().find((i) => !i._isCheckbox && !i._isRowNumber && !i._isGroupCol && !i._isMasterExpand)?.field || null;
  }
  // Build the detail <tr>: one cell spanning the full visible width, holding a
  // padded shell that hosts either a cloned <template> or a default summary
  // pulled from the master row.
  _buildDetailRow(e, t, s) {
    const i = `__d:${e.masterId}`;
    let a = s.get(i);
    const l = String(e.masterId);
    if (a) {
      if (a.getAttribute("data-master-id") === l)
        return a.classList.remove("sg-spacer"), a;
      a = null;
    }
    a || (a = g("tr")), a.className = "sg-detail-row", a.dataset.rowId = i, a.setAttribute("data-master-id", l), a.innerHTML = "";
    const o = g("td", { colspan: String(t.length || 1), class: "sg-detail-cell" }), d = g("div", { class: "sg-detail-shell" });
    return d.style.minHeight = `${this.detailRowHeightValue}px`, o.appendChild(d), a.appendChild(o), this._populateDetailShell(d, e.master, e.masterId), a;
  }
  // Fill the detail shell. Strategy: if the grid has a detail-template value
  // pointing at an existing <template>, clone its content and run a tiny
  // data-bind pass keyed off the master row. Otherwise render a minimal
  // fallback so the panel still appears (handy when the user is wiring up
  // their first detail panel and hasn't authored a template yet).
  _populateDetailShell(e, t, s) {
    const i = this.detailTemplateValue;
    let a;
    if (i) {
      const o = document.getElementById(i);
      if (o && o.tagName === "TEMPLATE") {
        const d = o.content.cloneNode(!0);
        this._applyDetailBindings(d, t), e.appendChild(d), a = e;
      }
    }
    if (!a) {
      const o = g("div", { class: "sg-detail-fallback" }), d = Object.keys(t || {}).filter((c) => !c.startsWith("_") && !c.startsWith("__")).slice(0, 6);
      for (const c of d)
        o.append(
          g("span", { class: "sg-detail-fallback-label" }, `${c}: `),
          g("span", { class: "sg-detail-fallback-value" }, String(t[c] ?? "")),
          g("span", { class: "sg-detail-fallback-sep" }, "  ·  ")
        );
      o.lastElementChild?.remove(), e.appendChild(o);
    }
    const l = e.querySelector('[data-controller~="grid"]');
    l && this._seedNestedGrid(l, t, s), queueMicrotask(() => {
      S(this.element, "grid:detailRowMounted", {
        rowId: s,
        masterRow: t,
        detailEl: e,
        nestedGridApi: l?.gridApi || null
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
        const a = i.getAttribute("data-detail-if");
        if (!t[a]) {
          i.remove();
          return;
        }
      }
      if (i.hasAttribute("data-detail-bind")) {
        const a = i.getAttribute("data-detail-bind");
        i.textContent = t[a] == null ? "" : String(t[a]);
      }
      if (i.hasAttribute("data-detail-bind-attr")) {
        const a = i.getAttribute("data-detail-bind-attr"), [l, o] = a.split(":");
        l && o && i.setAttribute(l, t[o] == null ? "" : String(t[o]));
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
      const a = t?.[i];
      if (Array.isArray(a))
        try {
          e.setAttribute("data-grid-row-data-value", JSON.stringify(a));
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
    for (const a of e)
      a.pinned === "left" && (t[a.field] = s, s += a.width || 150);
    const i = {};
    s = 0;
    for (let a = e.length - 1; a >= 0; a--) {
      const l = e[a];
      l.pinned === "right" && (i[l.field] = s, s += l.width || 150);
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
D(Le, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: Be },
  rowHeight: { type: Number, default: nn },
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
function on(n, r) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (n[t] !== r[t]) return !1;
  return !0;
}
function dn(n) {
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
function cn(n, r) {
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
function W(n) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(n)) : String(n).replace(/["\\\n\r]/g, (r) => "\\" + r);
}
class Ae extends O {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    D(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, s = e.clientY;
      let i = !1;
      const a = (o) => {
        const d = Math.abs(o.clientX - t), c = Math.abs(o.clientY - s);
        !i && (d > 5 || c > 5) && (i = !0, document.removeEventListener("mousemove", a), document.removeEventListener("mouseup", l), this._beginReorder(t));
      }, l = (o) => {
        document.removeEventListener("mousemove", a), document.removeEventListener("mouseup", l), i || this.sort(o);
      };
      document.addEventListener("mousemove", a), document.addEventListener("mouseup", l);
    });
  }
  connect() {
    if (this.grid = ls(this.element, "grid", this.application), !!this.grid) {
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
    const t = this.element.parentElement, s = Array.from(t.children), i = s.indexOf(this.element);
    let a = i;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const l = (d) => {
      const c = d.clientX;
      let h = s.length;
      for (let u = 0; u < s.length; u++) {
        const p = s[u].getBoundingClientRect();
        if (c < p.left + p.width / 2) {
          h = u;
          break;
        }
      }
      a = h > i ? h - 1 : h;
    }, o = () => {
      document.removeEventListener("mousemove", l), document.removeEventListener("mouseup", o), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", a !== i && this.grid.moveColumn(this.fieldValue, a);
    };
    document.addEventListener("mousemove", l), document.addEventListener("mouseup", o);
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
    const t = e.clientX, s = this.element.offsetWidth, i = (l) => this.grid.setColumnWidth(this.fieldValue, s + (l.clientX - t)), a = () => {
      document.removeEventListener("mousemove", i), document.removeEventListener("mouseup", a), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", i), document.addEventListener("mouseup", a), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
D(Ae, "values", {
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
class It extends O {
  connect() {
  }
}
class Nt extends O {
  connect() {
  }
}
class Pt extends O {
  connect() {
  }
}
class fe extends O {
  constructor() {
    super(...arguments);
    D(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), s = e.paginationGetTotalPages(), i = e.paginationGetRowCount(), a = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const l = i === 0 ? 0 : t * a + 1, o = Math.min(i, l + a - 1);
        this.pageInfoTarget.textContent = i === 0 ? "0 rows" : `${l}–${o} of ${i}`;
      }
      this.hasFirstTarget && (this.firstTarget.disabled = t === 0), this.hasPrevTarget && (this.prevTarget.disabled = t === 0), this.hasNextTarget && (this.nextTarget.disabled = t >= s - 1), this.hasLastTarget && (this.lastTarget.disabled = t >= s - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(a));
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
D(fe, "outlets", ["grid"]), D(fe, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
const ye = ["sum", "avg", "count", "min", "max"], un = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', hn = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class Ft extends O {
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
    this.element.innerHTML = "", this._content = g("div", { class: "sg-side-panel-content" });
    const r = g("div", { class: "sg-side-panel-tabs" });
    this._columnsTab = g("button", {
      type: "button",
      class: "sg-side-panel-tab",
      "aria-pressed": "true",
      title: "Columns"
    }), this._columnsTab.innerHTML = un, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), r.appendChild(this._columnsTab), this.element.append(this._content, r);
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
    const e = g("label", { class: "sg-panel-pivot-toggle" }), t = g("input", { type: "checkbox" });
    t.checked = r.isPivotMode(), t.addEventListener("change", () => r.setPivotMode(t.checked)), e.append(t, g("span", {}, "Pivot mode")), this._content.appendChild(e), this._content.appendChild(this._renderColumnsList()), this._content.appendChild(this._renderDropSection({
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
    const r = this._api(), e = g("div", { class: "sg-panel-section" });
    e.appendChild(g("div", { class: "sg-panel-section-title" }, "Columns"));
    const t = g("ul", { class: "sg-column-list" });
    e.appendChild(t);
    const s = new Set(r.getRowGroupColumns()), i = new Set(r.getPivotColumns()), a = new Map(r.getValueColumns().map((l) => [l.field, l.aggFunc]));
    for (const l of this._columns()) {
      const o = g("li", { class: "sg-column-list-item", draggable: "true" });
      o.dataset.field = l.field;
      const d = g("span", { class: "sg-column-grip", "aria-hidden": "true" });
      d.innerHTML = hn;
      const c = g("input", { type: "checkbox" });
      c.checked = !l.hidden, c.addEventListener("change", () => r.setColumnVisible(l.field, c.checked));
      const h = g("span", { class: "sg-column-list-label" }, l.headerName || l.field), u = g("span", { class: "sg-column-list-tags" });
      s.has(l.field) && u.appendChild(g("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), i.has(l.field) && u.appendChild(g("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), a.has(l.field) && u.appendChild(g("span", { class: "sg-tag sg-tag-value", title: `Value (${a.get(l.field)})` }, a.get(l.field))), o.append(d, c, h, u), this._wireDragSource(o, l.field), t.appendChild(o);
    }
    return this._wireDropZone(t, "columns"), e;
  }
  _renderDropSection({ title: r, placeholder: e, kind: t, fields: s }) {
    const i = g("div", { class: "sg-panel-section sg-panel-drop" });
    i.appendChild(g("div", { class: "sg-panel-section-title" }, r));
    const a = g("div", { class: "sg-drop-zone" });
    if (a.dataset.dropKind = t, !s.length)
      a.classList.add("sg-drop-zone-empty"), a.appendChild(g("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const l of s) a.appendChild(this._renderChip(t, l));
    return this._wireDropZone(a, t), i.appendChild(a), i;
  }
  _renderValuesSection() {
    const r = this._api(), e = g("div", { class: "sg-panel-section sg-panel-drop" });
    e.appendChild(g("div", { class: "sg-panel-section-title" }, "Values"));
    const t = g("div", { class: "sg-drop-zone" });
    t.dataset.dropKind = "value";
    const s = r.getValueColumns();
    if (!s.length)
      t.classList.add("sg-drop-zone-empty"), t.appendChild(g("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
    else
      for (const { field: i, aggFunc: a } of s) t.appendChild(this._renderValueChip(i, a));
    return this._wireDropZone(t, "value"), e.appendChild(t), e;
  }
  _renderChip(r, e) {
    const t = this._colByField(e), s = g("span", { class: "sg-chip", draggable: "true" });
    return s.dataset.field = e, s.dataset.fromKind = r, s.append(
      g("span", { class: "sg-chip-label" }, t?.headerName || e),
      this._removeButton(() => this._removeFrom(r, e))
    ), this._wireDragSource(s, e), s;
  }
  _renderValueChip(r, e) {
    const t = this._api(), s = this._colByField(r), i = g("span", { class: "sg-chip sg-chip-value", draggable: "true" });
    i.dataset.field = r, i.dataset.fromKind = "value";
    const a = g("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return a.addEventListener("click", (l) => {
      l.stopPropagation();
      const o = ye.indexOf(e), d = ye[(o === -1 ? 0 : o + 1) % ye.length];
      t.setColumnAggFunc(r, d);
    }), i.append(
      a,
      g("span", { class: "sg-chip-label" }, s?.headerName || r),
      this._removeButton(() => t.removeValueColumn(r))
    ), this._wireDragSource(i, r), i;
  }
  _removeButton(r) {
    const e = g("button", { type: "button", class: "sg-chip-remove", "aria-label": "Remove", title: "Remove" });
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
function pn(n) {
  const r = n ?? Ht.start();
  return r.register("grid", Le), r.register("header-cell", Ae), r.register("row", It), r.register("cell", Nt), r.register("filter", Pt), r.register("pagination", fe), r.register("side-panel", Ft), r;
}
const fn = {
  start: pn,
  GridController: Le,
  HeaderCellController: Ae,
  RowController: It,
  CellController: Nt,
  FilterController: Pt,
  PaginationController: fe,
  SidePanelController: Ft,
  registerRenderer: M,
  getRenderer: Ue,
  listRenderers: os,
  renderers: sn
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = fn);
export {
  Nt as CellController,
  Pt as FilterController,
  Le as GridController,
  Ae as HeaderCellController,
  fe as PaginationController,
  It as RowController,
  Ft as SidePanelController,
  fn as default,
  Ue as getRenderer,
  os as listRenderers,
  M as registerRenderer,
  sn as renderers,
  pn as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
