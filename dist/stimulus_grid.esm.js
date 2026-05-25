var Ft = Object.defineProperty;
var Bt = (s, i, e) => i in s ? Ft(s, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[i] = e;
var D = (s, i, e) => Bt(s, typeof i != "symbol" ? i + "" : i, e);
import { Controller as O, Application as $t } from "@hotwired/stimulus";
function I(s, i) {
  return typeof i.valueGetter == "function" ? i.valueGetter(s) : s?.[i.field];
}
function H(s, i) {
  const e = I(s, i);
  return typeof i.valueFormatter == "function" ? i.valueFormatter(e, s) : e == null ? "" : i.type === "date" && e instanceof Date ? e.toLocaleDateString() : i.type === "boolean" ? e ? "✓" : "" : String(e);
}
const $e = {
  contains: (s, i) => String(s ?? "").toLowerCase().includes(String(i ?? "").toLowerCase()),
  notContains: (s, i) => !String(s ?? "").toLowerCase().includes(String(i ?? "").toLowerCase()),
  equals: (s, i) => String(s ?? "").toLowerCase() === String(i ?? "").toLowerCase(),
  notEqual: (s, i) => String(s ?? "").toLowerCase() !== String(i ?? "").toLowerCase(),
  startsWith: (s, i) => String(s ?? "").toLowerCase().startsWith(String(i ?? "").toLowerCase()),
  endsWith: (s, i) => String(s ?? "").toLowerCase().endsWith(String(i ?? "").toLowerCase()),
  blank: (s) => s == null || s === "",
  notBlank: (s) => s != null && s !== ""
}, Ht = {
  equals: (s, i) => Number(s) === Number(i),
  notEqual: (s, i) => Number(s) !== Number(i),
  lessThan: (s, i) => Number(s) < Number(i),
  lessThanOrEqual: (s, i) => Number(s) <= Number(i),
  greaterThan: (s, i) => Number(s) > Number(i),
  greaterThanOrEqual: (s, i) => Number(s) >= Number(i),
  inRange: (s, i, e) => Number(s) >= Number(i) && Number(s) <= Number(e),
  blank: (s) => s == null || s === "",
  notBlank: (s) => s != null && s !== ""
};
function F(s) {
  if (s == null || s === "") return null;
  if (s instanceof Date) return s;
  const i = new Date(s);
  return Number.isNaN(i.valueOf()) ? null : i;
}
const zt = {
  equals: (s, i) => F(s)?.toDateString() === F(i)?.toDateString(),
  notEqual: (s, i) => F(s)?.toDateString() !== F(i)?.toDateString(),
  lessThan: (s, i) => (F(s)?.valueOf() ?? -1 / 0) < (F(i)?.valueOf() ?? 1 / 0),
  greaterThan: (s, i) => (F(s)?.valueOf() ?? 1 / 0) > (F(i)?.valueOf() ?? -1 / 0),
  inRange: (s, i, e) => {
    const t = F(s)?.valueOf();
    return t != null && t >= (F(i)?.valueOf() ?? -1 / 0) && t <= (F(e)?.valueOf() ?? 1 / 0);
  },
  blank: (s) => s == null || s === "",
  notBlank: (s) => s != null && s !== ""
}, Gt = {
  equals: (s, i) => i === "true" ? !!s : i === "false" ? !s : !0
}, Ot = {
  in: (s, i) => Array.isArray(i) && i.includes(String(s ?? ""))
}, Kt = { text: $e, number: Ht, date: zt, boolean: Gt, set: Ot };
function He(s, i, e) {
  if (!e) return !0;
  const t = e.filterType || i.filter || "text", r = (Kt[t] || $e)[e.type];
  if (!r) return !0;
  const a = I(s, i);
  return r(a, e.value, e.value2);
}
function ze(s, i, e) {
  const t = Object.entries(i || {}).filter(([, n]) => n != null);
  return t.length === 0 ? s : s.filter((n) => n && n.__sgSeparator ? !0 : t.every(([r, a]) => {
    const o = e[r];
    return o ? He(n, o, a) : !0;
  }));
}
function Ge(s, i, e) {
  if (!i) return s;
  const t = String(i).toLowerCase();
  return s.filter((n) => {
    if (n && n.__sgSeparator) return !0;
    for (const r of e) {
      const a = H(n, r);
      if (a && String(a).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function G(s, i, e) {
  if (s == null && i == null) return 0;
  if (s == null) return -1;
  if (i == null) return 1;
  if (e === "number") return Number(s) - Number(i);
  if (e === "date") {
    const t = F(s)?.valueOf() ?? 0, n = F(i)?.valueOf() ?? 0;
    return t - n;
  }
  return e === "boolean" ? s === i ? 0 : s ? 1 : -1 : String(s).localeCompare(String(i), void 0, { numeric: !0, sensitivity: "base" });
}
function qt(s, i, e) {
  if (!i || i.length === 0) return s;
  const t = (l, d) => {
    for (const { colId: c, sort: h } of i) {
      const u = e[c];
      if (!u) continue;
      const p = I(l, u), f = I(d, u), _ = typeof u.comparator == "function" ? u.comparator(p, f, l, d) : G(p, f, u.type);
      if (_ !== 0) return h === "desc" ? -_ : _;
    }
    return 0;
  };
  if (!s.some((l) => l && l.__sgSeparator)) return s.slice().sort(t);
  const r = [];
  let a = [];
  const o = () => {
    if (a.length) {
      a.sort(t);
      for (const l of a) r.push(l);
      a = [];
    }
  };
  for (const l of s)
    l && l.__sgSeparator ? (o(), r.push(l)) : a.push(l);
  return o(), r;
}
function se(s, i) {
  if (!i || !i.enabled) return { rows: s, total: s.length, pageRows: s };
  const e = s.length, t = Math.max(1, Math.ceil(e / i.pageSize)), n = Math.min(i.page, t - 1), r = n * i.pageSize, a = s.slice(r, r + i.pageSize);
  return { rows: s, total: e, totalPages: t, page: n, pageRows: a };
}
function Oe(s, i, e) {
  if (s === "count") return i.length;
  const t = i.map((r) => I(r, e));
  if (s === "first") return t.length ? t[0] : null;
  if (s === "last") return t.length ? t[t.length - 1] : null;
  const n = t.map(Number).filter((r) => !Number.isNaN(r));
  switch (s) {
    case "sum":
      return n.reduce((r, a) => r + a, 0);
    case "avg":
      return n.length ? n.reduce((r, a) => r + a, 0) / n.length : null;
    case "min":
      return n.length ? Math.min(...n) : null;
    case "max":
      return n.length ? Math.max(...n) : null;
    default:
      return null;
  }
}
function oe(s, i, e) {
  const t = {};
  for (const [n, r] of Object.entries(i || {})) {
    const a = e[n];
    a && (t[n] = Oe(r, s, a));
  }
  return t;
}
function Wt(s) {
  let i = 0, e = 0, t = 0, n = 1 / 0, r = -1 / 0;
  for (const a of s) {
    if (a == null || a === "") continue;
    i += 1;
    let o = null;
    if (typeof a == "number" && Number.isFinite(a)) o = a;
    else if (typeof a == "string" && a.trim() !== "") {
      const l = Number(a);
      Number.isFinite(l) && (o = l);
    }
    o != null && (e += 1, t += o, o < n && (n = o), o > r && (r = o));
  }
  return {
    count: i,
    sum: e ? t : null,
    avg: e ? t / e : null,
    min: e ? n : null,
    max: e ? r : null
  };
}
function Ut(s, i, e, t, n = () => !0) {
  const r = (d, c, h) => {
    const u = i[c], p = /* @__PURE__ */ new Map();
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
        aggregates: oe(_, t, e),
        leaves: _,
        children: c + 1 < i.length ? r(_, c + 1, C) : null
      };
    });
  }, a = r(s, 0, ""), o = [], l = (d) => {
    for (const c of d)
      if (o.push(c), !!n(c.groupId, c.level))
        if (c.children) l(c.children);
        else for (const h of c.leaves) o.push(h);
  };
  return l(a), { displayList: o, tree: a };
}
function Ke(s, i, e) {
  return `__p|${e.map((n) => {
    const r = s[n.field];
    return `${n.field}=${r == null ? "" : String(r)}`;
  }).join("|")}|${i.col.field}:${i.aggFunc}`;
}
function qe(s, i) {
  return i.map((e) => {
    const t = I(s, e);
    return t == null ? "" : String(t);
  }).join("");
}
function jt(s, i) {
  if (!i?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const t of s) {
    const n = qe(t, i);
    if (!e.has(n)) {
      const r = {};
      i.forEach((a) => {
        const o = I(t, a);
        r[a.field] = o ?? null;
      }), e.set(n, r);
    }
  }
  return Array.from(e.values()).sort((t, n) => {
    for (const r of i) {
      const a = G(t[r.field], n[r.field], r.type);
      if (a !== 0) return a;
    }
    return 0;
  });
}
function Xt(s, i, e) {
  if (!s.length || !i.length) return [];
  const t = [], n = i.length === 1;
  for (const r of s)
    for (const a of i) {
      const o = Ke(r, a, e), l = e.map((c) => r[c.field] == null ? "(Blank)" : String(r[c.field])).join(" · "), d = n ? l : `${l} · ${a.aggFunc}(${a.col.field})`;
      t.push({
        field: o,
        headerName: d,
        type: "number",
        width: 100,
        sortable: !0,
        filter: null,
        resizable: !1,
        _isPivot: !0,
        pivotKeys: { ...r },
        valueField: a.col.field,
        aggFunc: a.aggFunc,
        valueGetter: (c) => c?.__pivotValues?.[o] ?? null
      });
    }
  return t;
}
function Yt(s) {
  return typeof s == "string" && s.startsWith("__p|");
}
function Qt(s, i) {
  const e = Array.isArray(s) ? s.filter((t) => t && t.colId && t.sort) : [];
  return (t, n) => {
    for (const r of e) {
      const a = r.sort === "desc" ? -1 : 1;
      if (Yt(r.colId)) {
        const o = t.__pivotValues ? t.__pivotValues[r.colId] : null, l = n.__pivotValues ? n.__pivotValues[r.colId] : null, d = G(o, l, "number");
        if (d !== 0) return a * d;
        continue;
      }
      if (i && r.colId === i.field) {
        const o = G(t.value, n.value, i.type);
        if (o !== 0) return a * o;
        continue;
      }
    }
    return G(t.value, n.value, i?.type);
  };
}
function Re(s, i, e, t) {
  const n = {}, r = /* @__PURE__ */ new Map();
  for (const a of s) {
    const o = qe(a, t);
    r.has(o) || r.set(o, []), r.get(o).push(a);
  }
  for (const a of i) {
    const o = t.map((d) => {
      const c = a[d.field];
      return c == null ? "" : String(c);
    }).join(""), l = r.get(o) || [];
    for (const d of e) {
      const c = Ke(a, d, t);
      n[c] = l.length ? Oe(d.aggFunc, l, d.col) : null;
    }
  }
  return n;
}
function Zt({ rows: s, rowGroupCols: i = [], pivotCols: e, valueConfigs: t, isExpanded: n = () => !0, sortModel: r = [] }) {
  const a = jt(s, e), o = Xt(a, t, e), l = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: s.length,
    aggregates: {},
    leaves: s,
    __pivotValues: Re(s, a, t, e)
  };
  if (!i.length)
    return { columns: o, displayList: [l], tree: [], combos: a };
  const d = (p, f, _) => {
    const y = i[f], C = /* @__PURE__ */ new Map();
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
        __pivotValues: Re(x, a, t, e),
        children: f + 1 < i.length ? d(x, f + 1, R) : null
      };
    }), b = Qt(r, y);
    return v.sort(b);
  }, c = d(s, 0, ""), h = [l], u = (p) => {
    for (const f of p)
      h.push(f), n(f.groupId, f.level) && f.children && u(f.children);
  };
  return u(c), { columns: o, displayList: h, tree: c, combos: a };
}
function Jt(s, { pivotCols: i = [], valueConfigs: e = [], columnGroups: t = null } = {}) {
  if (s._isPivot && i.length && s.pivotKeys)
    return es(s, i, e);
  if (t && Array.isArray(t) && t.length && !s._isGroupCol && !s._isCheckbox && !s._isRowNumber) {
    for (const n of t)
      if (n?.children && n.children.includes(s.field))
        return [
          { kind: "group", id: `g:${n.headerName}`, label: n.headerName },
          { kind: "leaf", col: s }
        ];
  }
  return [{ kind: "leaf", col: s }];
}
function es(s, i, e) {
  const t = (e?.length || 0) > 1, n = [];
  for (let r = 0; r < i.length; r++) {
    const a = i[r].field, o = s.pivotKeys[a];
    if (r === i.length - 1 && !t)
      return n.push({ kind: "leaf", col: s, label: o == null ? "(Blank)" : String(o) }), n;
    n.push({
      kind: "group",
      id: `p:${r}:${o == null ? "" : String(o)}`,
      label: o == null ? "(Blank)" : String(o)
    });
  }
  return n.push({ kind: "leaf", col: s, label: `${s.aggFunc}(${s.valueField})` }), n;
}
function ts(s, i = {}) {
  if (!s.length) return { rows: [[]], depth: 1 };
  const e = s.map((r) => Jt(r, i).slice()), t = Math.max(1, ...e.map((r) => r.length)), n = [];
  for (let r = 0; r < t; r++) {
    const a = [];
    let o = 0;
    for (; o < e.length; ) {
      const l = e[o];
      if (r >= l.length || l[r] === null) {
        o += 1;
        continue;
      }
      const d = l[r];
      if (d.kind === "leaf") {
        a.push({ kind: "leaf", col: d.col, label: d.label, rowspan: t - r, colspan: 1 });
        for (let h = r + 1; h < t; h++) l[h] = null;
        o += 1;
        continue;
      }
      let c = o + 1;
      for (; c < e.length; ) {
        const h = e[c];
        if (r >= h.length || !h[r] || h[r].kind !== "group" || h[r].id !== d.id) break;
        let u = !0;
        for (let p = 0; p < r; p++) {
          const f = l[p]?.id ?? null, _ = h[p]?.id ?? null;
          if (f !== _) {
            u = !1;
            break;
          }
        }
        if (!u) break;
        c += 1;
      }
      a.push({ kind: "group", label: d.label, colspan: c - o, rowspan: 1 }), o = c;
    }
    n.push(a);
  }
  return { rows: n, depth: t };
}
function ss({
  rows: s,
  parentField: i = "parent_id",
  getRowId: e = (a) => a?.id,
  passesFilter: t = null,
  siblingComparator: n = null,
  isExpanded: r = () => !0
} = {}) {
  if (!Array.isArray(s) || s.length === 0)
    return { displayList: [], treeMeta: /* @__PURE__ */ new Map() };
  const a = (y) => {
    const C = e(y);
    return C == null ? null : String(C);
  }, o = /* @__PURE__ */ new Map();
  for (const y of s) {
    const C = a(y);
    C != null && o.set(C, y);
  }
  const l = /* @__PURE__ */ new Map(), d = [];
  for (const y of s) {
    const C = a(y), v = y?.[i], b = v == null ? null : String(v);
    b == null || b === C || !o.has(b) ? d.push(y) : (l.has(b) || l.set(b, []), l.get(b).push(y));
  }
  const c = t ? new Map(s.map((y) => [a(y), !!t(y)])) : null, h = /* @__PURE__ */ new Map(), u = (y, C) => {
    const v = a(y);
    if (v == null) return !1;
    if (h.has(v)) return h.get(v);
    if (C.has(v)) return !1;
    C.add(v);
    let b = !!c.get(v);
    const w = l.get(v) || [];
    for (const x of w) b = u(x, C) || b;
    return C.delete(v), h.set(v, b), b;
  };
  if (c)
    for (const y of d) u(y, /* @__PURE__ */ new Set());
  const p = [], f = /* @__PURE__ */ new Map(), _ = (y, C, v, b) => {
    const w = c ? y.filter((x) => b || h.get(a(x))) : y.slice();
    n && w.sort(n);
    for (const x of w) {
      const L = a(x);
      if (L == null || v.has(L)) continue;
      const R = l.get(L) || [], T = b || (c ? !!c.get(L) : !1), k = c ? R.filter((B) => T || h.get(a(B))) : R, E = k.length > 0, P = E && (c ? !0 : !!r(L, C));
      f.set(L, { level: C, hasChildren: E, expanded: P }), p.push(x), P && (v.add(L), _(k, C + 1, v, T), v.delete(L));
    }
  };
  return _(d, 0, /* @__PURE__ */ new Set(), !1), { displayList: p, treeMeta: f };
}
function ns(s) {
  if (s.serverSide) {
    const c = s.rowData, h = s.pagination?.pageSize || c.length || 1, u = s.serverRowCount ?? c.length, p = Math.max(1, Math.ceil(u / h)), f = Math.min(s.pagination?.page || 0, p - 1);
    return { filteredSorted: c, rows: c, total: u, totalPages: p, page: f, pageRows: c };
  }
  const i = Object.fromEntries(s.columnDefs.map((c) => [c.field, c])), e = s.columnDefs.filter((c) => !c.hidden && !c._isCheckbox), t = (s.rowGroupCols || []).filter((c) => i[c]);
  if (s.treeData && !s.pivotMode && t.length === 0) {
    const c = s.treeParentField || "parent_id", h = Object.entries(s.filterModel || {}).filter(([, x]) => x != null), u = s.quickFilter ? String(s.quickFilter).toLowerCase() : "", f = h.length > 0 || u !== "" ? (x) => {
      for (const [L, R] of h) {
        const T = i[L];
        if (T && !He(x, T, R)) return !1;
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
    } : null, _ = Array.isArray(s.sortModel) ? s.sortModel : [], y = _.length ? (x, L) => {
      for (const { colId: R, sort: T } of _) {
        const k = i[R];
        if (!k) continue;
        const E = I(x, k), P = I(L, k), B = typeof k.comparator == "function" ? k.comparator(E, P, x, L) : G(E, P, k.type);
        if (B !== 0) return T === "desc" ? -B : B;
      }
      return 0;
    } : null, C = s.getRowId || ((x) => x?.id), { displayList: v, treeMeta: b } = ss({
      rows: s.rowData,
      parentField: c,
      getRowId: C,
      passesFilter: f,
      siblingComparator: y,
      isExpanded: s.isTreeRowExpanded || (() => !0)
    }), w = se(v, s.pagination);
    return {
      tree: !0,
      treeData: !0,
      treeMeta: b,
      treeParentField: c,
      filteredSorted: v,
      ...w
    };
  }
  let n = s.rowData;
  n = ze(n, s.filterModel, i), n = Ge(n, s.quickFilter, e), n = qt(n, s.sortModel, i);
  const r = t, a = s.pivotMode ? (s.pivotCols || []).filter((c) => i[c]) : [], o = s.pivotMode ? Object.entries(s.aggModel || {}).filter(([c]) => i[c]).map(([c, h]) => ({ col: i[c], aggFunc: h })) : [];
  if (s.pivotMode && a.length && o.length) {
    const c = r.map((C) => i[C]), h = a.map((C) => i[C]), { columns: u, displayList: p, tree: f, combos: _ } = Zt({
      rows: n,
      rowGroupCols: c,
      pivotCols: h,
      valueConfigs: o,
      isExpanded: s.isGroupExpanded,
      sortModel: s.sortModel
    }), y = se(p, s.pagination);
    return {
      pivot: !0,
      pivotResultColumns: u,
      combos: _,
      grouped: !0,
      tree: f,
      leafCount: n.length,
      grandTotals: oe(n, s.aggModel, i),
      filteredSorted: p,
      ...y
    };
  }
  if (r.length) {
    const c = r.map((f) => i[f]), { displayList: h, tree: u } = Ut(
      n,
      c,
      i,
      s.aggModel,
      s.isGroupExpanded
    ), p = se(h, s.pagination);
    return {
      grouped: !0,
      tree: u,
      leafCount: n.length,
      grandTotals: oe(n, s.aggModel, i),
      filteredSorted: h,
      ...p
    };
  }
  const l = se(n, s.pagination), d = s.aggModel && Object.keys(s.aggModel).length ? oe(n, s.aggModel, i) : null;
  return { filteredSorted: n, grandTotals: d, ...l };
}
function is(s, i, e, t, n = 6) {
  const r = Math.ceil(i / e), a = Math.max(0, Math.floor(s / e) - n), o = Math.min(t, a + r + n * 2);
  return { first: a, last: o };
}
function rs(s) {
  return {
    // ---- Data ----
    setRowData(i) {
      s.setRowData(i);
    },
    getRowData() {
      return s.state.rowData.slice();
    },
    applyTransaction(i) {
      return s.applyTransaction(i);
    },
    // Server-side row model
    setRowCount(i) {
      s.setRowCount(i);
    },
    getRowCount() {
      return s.state.serverSide ? s.state.serverRowCount : s.state.rowData.length;
    },
    isServerSide() {
      return !!s.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(i) {
      s.setColumnDefs(i);
    },
    getColumnDefs() {
      return s.state.columnDefs.slice();
    },
    setColumnVisible(i, e) {
      s.setColumnVisible(i, e);
    },
    setColumnPinned(i, e) {
      s.setColumnPinned(i, e);
    },
    setColumnWidth(i, e) {
      s.setColumnWidth(i, e);
    },
    moveColumn(i, e) {
      s.moveColumn(i, e);
    },
    autoSizeColumn(i) {
      s.autoSizeColumn(i);
    },
    autoSizeAllColumns() {
      s.state.columnDefs.forEach((i) => s.autoSizeColumn(i.field));
    },
    sizeColumnsToFit() {
      s.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(i) {
      s.setSortModel(i);
    },
    getSortModel() {
      return s.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(i) {
      s.setFilterModel(i);
    },
    getFilterModel() {
      return { ...s.state.filterModel };
    },
    setColumnFilter(i, e) {
      s.setColumnFilter(i, e);
    },
    destroyFilter(i) {
      s.setColumnFilter(i, null);
    },
    setQuickFilter(i) {
      s.setQuickFilter(i);
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
    selectRow(i) {
      s.setSelected(i, !0);
    },
    deselectRow(i) {
      s.setSelected(i, !1);
    },
    getSelectedRows() {
      return s.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(s.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(i) {
      s.goToPage(i);
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
    paginationSetPageSize(i) {
      s.setPageSize(i);
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
    startEditingCell({ rowId: i, colId: e }) {
      s.startEditingCell(i, e);
    },
    stopEditing(i = !1) {
      s.stopEditing(i);
    },
    // ---- Row grouping + aggregation ----
    setRowGroupColumns(i) {
      s.setRowGroupColumns(i);
    },
    addRowGroupColumn(i) {
      s.addRowGroupColumn(i);
    },
    removeRowGroupColumn(i) {
      s.removeRowGroupColumn(i);
    },
    getRowGroupColumns() {
      return s.getRowGroupColumns();
    },
    setColumnAggFunc(i, e) {
      s.setColumnAggFunc(i, e);
    },
    expandAll() {
      s.expandAll();
    },
    collapseAll() {
      s.collapseAll();
    },
    toggleGroup(i, e) {
      s.toggleGroup(i, e);
    },
    // ---- Pivot ----
    setPivotMode(i) {
      s.setPivotMode(i);
    },
    isPivotMode() {
      return s.isPivotMode();
    },
    setPivotColumns(i) {
      s.setPivotColumns(i);
    },
    addPivotColumn(i) {
      s.addPivotColumn(i);
    },
    removePivotColumn(i) {
      s.removePivotColumn(i);
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
    setValueColumns(i) {
      s.setValueColumns(i);
    },
    addValueColumn(i, e = "sum") {
      s.addValueColumn(i, e);
    },
    removeValueColumn(i) {
      s.removeValueColumn(i);
    },
    getValueColumns() {
      return s.getValueColumns();
    },
    // ---- Column header groups (multi-row headers) ----
    setColumnGroups(i) {
      s.setColumnGroups(i);
    },
    getColumnGroups() {
      return s.getColumnGroups();
    },
    // ---- Pinned bottom row (sticky grand totals) ----
    setPinnedBottomRow(i) {
      s.setPinnedBottomRow(i);
    },
    isPinnedBottomRow() {
      return s.isPinnedBottomRow();
    },
    // ---- Tree data (self-referential parent_id) ----
    setTreeData(i) {
      s.setTreeData(i);
    },
    isTreeData() {
      return s.isTreeData();
    },
    setTreeParentField(i) {
      s.setTreeParentField(i);
    },
    expandTreeRow(i) {
      s.expandTreeRow(i);
    },
    collapseTreeRow(i) {
      s.collapseTreeRow(i);
    },
    toggleTreeRow(i) {
      s.toggleTreeRow(i);
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
    setMasterDetail(i) {
      s.setMasterDetail(i);
    },
    isMasterDetail() {
      return s.isMasterDetail();
    },
    expandDetailRow(i) {
      s.expandDetailRow(i);
    },
    collapseDetailRow(i) {
      s.collapseDetailRow(i);
    },
    toggleDetailRow(i) {
      s.toggleDetailRow(i);
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
    applyColumnState(i) {
      s.applyColumnState(i);
    },
    clearPersistedState() {
      s.clearPersistedState();
    },
    getPersistKey() {
      return s.persistKeyValue || "";
    },
    // ---- Export ----
    getDataAsCsv(i = {}) {
      return s.getDataAsCsv(i);
    },
    exportDataAsCsv(i = {}) {
      return s.exportDataAsCsv(i);
    },
    // ---- Display ----
    refreshCells(i = {}) {
      s.refresh(i);
    },
    redrawRows(i = {}) {
      s.refresh(i);
    },
    // ---- Events ----
    addEventListener(i, e) {
      s.element.addEventListener(i, e);
    },
    removeEventListener(i, e) {
      s.element.removeEventListener(i, e);
    }
  };
}
function g(s, i = {}, e = []) {
  const t = document.createElement(s);
  for (const [n, r] of Object.entries(i))
    r === !1 || r == null || (n === "class" ? t.className = r : n === "style" && typeof r == "object" ? Object.assign(t.style, r) : n.startsWith("on") && typeof r == "function" ? t.addEventListener(n.slice(2).toLowerCase(), r) : r === !0 ? t.setAttribute(n, "") : t.setAttribute(n, String(r)));
  for (const n of [].concat(e))
    n == null || n === !1 || t.appendChild(typeof n == "string" ? document.createTextNode(n) : n);
  return t;
}
function De(s, i) {
  for (const [e, t] of Object.entries(i))
    t == null || t === !1 ? s.removeAttribute(e) : t === !0 ? s.setAttribute(e, "") : s.setAttribute(e, String(t));
}
function Te(s) {
  const i = document.getElementById(s);
  return !i || i.tagName !== "TEMPLATE" ? null : i.content.firstElementChild.cloneNode(!0);
}
function S(s, i, e) {
  s.dispatchEvent(new CustomEvent(i, { detail: e, bubbles: !0 }));
}
function as(s, i, e) {
  let t = s.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(i)) {
      const r = e.getControllerForElementAndIdentifier(t, i);
      if (r) return r;
    }
    t = t.parentElement;
  }
  return null;
}
const be = /* @__PURE__ */ new Map();
function M(s, i) {
  if (typeof s != "string" || !s) throw new Error("registerRenderer: name must be a non-empty string");
  if (typeof i != "function") throw new Error("registerRenderer: fn must be a function");
  be.set(s, i);
}
function We(s) {
  return be.get(s) || null;
}
function os() {
  return Array.from(be.keys());
}
function m(s, i = {}, e = null) {
  const t = document.createElement(s);
  for (const [n, r] of Object.entries(i))
    r == null || r === !1 || (n === "class" ? t.className = r : t.setAttribute(n, r === !0 ? "" : String(r)));
  return e == null || (Array.isArray(e) ? e.forEach((n) => t.append(n)) : typeof e == "string" ? t.innerHTML = e : t.append(e)), t;
}
const V = (s) => s == null || s === "", ls = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function Ue() {
  return ({ value: s }) => {
    if (V(s)) return "";
    const i = String(s);
    return ls.test(i) ? m("a", {
      class: "sg-renderer-link",
      href: `mailto:${i}`,
      title: "Send email"
    }, document.createTextNode(i)) : m("span", { class: "sg-renderer-invalid", title: "Invalid email" }, document.createTextNode(i));
  };
}
function je({ newTab: s = !0 } = {}) {
  return ({ value: i }) => {
    if (V(i)) return "";
    const e = String(i);
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
function Xe({ defaultRegion: s = "AU" } = {}) {
  return ({ value: i }) => {
    if (V(i)) return "";
    const e = String(i).trim(), t = e.replace(/\D/g, "");
    if (!t) return document.createTextNode(e);
    let n = e;
    return s === "AU" && (/^04\d{8}$/.test(t) ? n = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : /^0[2378]\d{8}$/.test(t) ? n = `(${t.slice(0, 2)}) ${t.slice(2, 6)} ${t.slice(6)}` : /^1[38]00\d{6}$/.test(t) ? n = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : t.length === 8 && (n = `${t.slice(0, 4)} ${t.slice(4)}`)), m("a", { class: "sg-renderer-link", href: `tel:${t}` }, document.createTextNode(n));
  };
}
function Ye({ currency: s = "USD", locale: i = "en-US", decimals: e } = {}) {
  return ({ value: t, td: n }) => {
    if (n && n.classList.add("sg-renderer-number"), V(t)) return "";
    const r = Number(t);
    if (!Number.isFinite(r)) return String(t);
    const a = { style: "currency", currency: s };
    return e != null && (a.minimumFractionDigits = e, a.maximumFractionDigits = e), r.toLocaleString(i, a);
  };
}
function Qe({ decimals: s = 0, scale: i = "as-is" } = {}) {
  return ({ value: e, td: t }) => {
    if (t && t.classList.add("sg-renderer-number"), V(e)) return "";
    let n = Number(e);
    return Number.isFinite(n) ? (i === "fraction" && (n *= 100), `${n.toFixed(s)}%`) : String(e);
  };
}
function we(s) {
  if (s == null || s === "") return null;
  if (s instanceof Date) return Number.isNaN(s.valueOf()) ? null : s;
  const i = new Date(s);
  return Number.isNaN(i.valueOf()) ? null : i;
}
function Ze({ locale: s = void 0, dateStyle: i = "medium", ...e } = {}) {
  const t = new Intl.DateTimeFormat(s, { dateStyle: i, ...e });
  return ({ value: n }) => {
    const r = we(n);
    return r ? t.format(r) : "";
  };
}
function Je({ locale: s = void 0, dateStyle: i = "medium", timeStyle: e = "short", ...t } = {}) {
  const n = new Intl.DateTimeFormat(s, { dateStyle: i, timeStyle: e, ...t });
  return ({ value: r }) => {
    const a = we(r);
    return a ? n.format(a) : "";
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
function et({ locale: s = void 0, numeric: i = "auto", style: e = "long" } = {}) {
  const t = new Intl.RelativeTimeFormat(s, { numeric: i, style: e });
  return ({ value: n }) => {
    const r = we(n);
    if (!r) return "";
    const a = r.getTime() - Date.now(), o = Math.abs(a), l = me.find((h) => o < h.cutoff) || me[me.length - 1], d = Math.round(a / l.ms), c = m("span", { class: "sg-renderer-relative-time", title: r.toLocaleString() });
    return c.textContent = t.format(d, l.unit), c;
  };
}
const ds = { ms: 1, sec: 1e3, second: 1e3, min: 6e4, minute: 6e4, hr: 36e5, hour: 36e5 };
function tt({ unit: s = "ms", style: i = "compact" } = {}) {
  const e = ds[s] ?? 1;
  return ({ value: t, td: n }) => {
    if (n && n.classList.add("sg-renderer-number"), V(t)) return "";
    const r = Number(t) * e;
    if (!Number.isFinite(r)) return String(t);
    const a = r < 0 ? "-" : "", o = Math.abs(r), l = Math.floor(o / 36e5), d = Math.floor(o % 36e5 / 6e4), c = Math.floor(o % 6e4 / 1e3);
    if (i === "clock") {
      const u = (p) => String(p).padStart(2, "0");
      return a + (l > 0 ? `${u(l)}:${u(d)}:${u(c)}` : `${u(d)}:${u(c)}`);
    }
    if (i === "words") {
      const u = [];
      return l && u.push(`${l} ${l === 1 ? "hour" : "hours"}`), d && u.push(`${d} ${d === 1 ? "minute" : "minutes"}`), !l && c && u.push(`${c} ${c === 1 ? "second" : "seconds"}`), a + (u.join(" ") || "0 seconds");
    }
    const h = [];
    return l && h.push(`${l}h`), d && h.push(`${d}m`), !l && c && h.push(`${c}s`), a + (h.join(" ") || "0s");
  };
}
function st({ locale: s = void 0, decimals: i, ...e } = {}) {
  const t = { ...e };
  i != null && (t.minimumFractionDigits = i, t.maximumFractionDigits = i);
  const n = new Intl.NumberFormat(s, t);
  return ({ value: r, td: a }) => {
    if (a && a.classList.add("sg-renderer-number"), V(r)) return "";
    const o = Number(r);
    return Number.isFinite(o) ? n.format(o) : String(r);
  };
}
function nt({ locale: s = void 0, compactDisplay: i = "short", maximumFractionDigits: e = 1 } = {}) {
  const t = new Intl.NumberFormat(s, {
    notation: "compact",
    compactDisplay: i,
    maximumFractionDigits: e
  });
  return ({ value: n, td: r }) => {
    if (r && r.classList.add("sg-renderer-number"), V(n)) return "";
    const a = Number(n);
    return Number.isFinite(a) ? t.format(a) : String(n);
  };
}
function it({ binary: s = !0, decimals: i = 1, locale: e = void 0 } = {}) {
  const t = s ? 1024 : 1e3, n = s ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"], r = new Intl.NumberFormat(e, {
    minimumFractionDigits: i,
    maximumFractionDigits: i
  });
  return ({ value: a, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), V(a)) return "";
    let l = Number(a);
    if (!Number.isFinite(l)) return String(a);
    const d = l < 0 ? "-" : "";
    l = Math.abs(l);
    let c = 0;
    for (; l >= t && c < n.length - 1; )
      l /= t, c += 1;
    const h = c === 0 ? String(Math.round(l)) : r.format(l);
    return `${d}${h} ${n[c]}`;
  };
}
const cs = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on"]);
function rt(s) {
  return s === !0 || s === 1 ? !0 : s == null || s === "" || s === !1 || s === 0 ? !1 : cs.has(String(s).toLowerCase());
}
const us = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>', hs = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
function at({
  truthy: s = rt,
  nullLabel: i = "—",
  falseStyle: e = "icon"
  // 'icon' | 'hidden'
} = {}) {
  return ({ value: t }) => {
    if (t == null || t === "")
      return m("span", { class: "sg-renderer-bool-null" }, document.createTextNode(i));
    if (s(t)) {
      const r = m("span", { class: "sg-renderer-bool is-true", "aria-label": "true" });
      return r.innerHTML = us, r;
    }
    if (e === "hidden") return "";
    const n = m("span", { class: "sg-renderer-bool is-false", "aria-label": "false" });
    return n.innerHTML = hs, n;
  };
}
const ps = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>', fs = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.7 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>', gs = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M64 256a32 32 0 1 0 0-64H384V160c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9S384 364.9 384 352V320H64z"/></svg>';
function ot({
  style: s = "percent",
  // 'percent' | 'number' | 'currency'
  decimals: i = 1,
  locale: e = void 0,
  currency: t = "USD",
  inverted: n = !1,
  showSign: r = !0
} = {}) {
  let a;
  return s === "currency" ? a = new Intl.NumberFormat(e, {
    style: "currency",
    currency: t,
    minimumFractionDigits: i,
    maximumFractionDigits: i,
    signDisplay: r ? "always" : "auto"
  }) : a = new Intl.NumberFormat(e, {
    minimumFractionDigits: i,
    maximumFractionDigits: i,
    signDisplay: r ? "always" : "auto"
  }), ({ value: o, td: l }) => {
    if (l && l.classList.add("sg-renderer-number"), V(o)) return "";
    const d = Number(o);
    if (!Number.isFinite(d)) return String(o);
    let c = "is-flat", h = gs;
    const u = !n;
    d > 0 ? (c = u ? "is-up" : "is-down", h = ps) : d < 0 && (c = u ? "is-down" : "is-up", h = fs);
    const p = m("span", { class: `sg-renderer-delta ${c}` }), f = m("span", { class: "sg-renderer-delta-icon", "aria-hidden": "true" });
    f.innerHTML = h;
    const _ = s === "percent" ? `${a.format(d)}%` : a.format(d);
    return p.append(f), p.append(m("span", { class: "sg-renderer-delta-value" }, document.createTextNode(_))), p;
  };
}
function lt({ chars: s = null } = {}) {
  return ({ value: i, td: e }) => {
    if (V(i)) return "";
    const t = String(i);
    let n = t, r = !1;
    return s && t.length > s && (n = t.slice(0, s) + "…", r = !0), e && (e.classList.add("sg-renderer-truncate"), e.setAttribute("title", t)), r ? n : t;
  };
}
const ke = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>', ms = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';
function dt({ position: s = "after" } = {}) {
  return ({ value: i }) => {
    if (V(i)) return "";
    const e = String(i), t = m("span", { class: "sg-renderer-copyable" }), n = m("span", { class: "sg-renderer-copyable-value" }, document.createTextNode(e)), r = m("button", {
      type: "button",
      class: "sg-renderer-copyable-btn",
      title: "Copy",
      "aria-label": `Copy ${e}`
    });
    return r.innerHTML = ke, r.addEventListener("click", async (a) => {
      a.stopPropagation(), a.preventDefault();
      try {
        navigator.clipboard?.writeText ? await navigator.clipboard.writeText(e) : _s(e), r.innerHTML = ms, r.classList.add("is-copied"), setTimeout(() => {
          r.innerHTML = ke, r.classList.remove("is-copied");
        }, 1200);
      } catch {
      }
    }), s === "before" ? t.append(r, n) : t.append(n, r), t;
  };
}
function _s(s) {
  const i = document.createElement("textarea");
  i.value = s, i.style.position = "fixed", i.style.left = "-9999px", document.body.appendChild(i), i.select();
  try {
    document.execCommand("copy");
  } catch {
  }
  document.body.removeChild(i);
}
function ct({
  size: s = 36,
  rounded: i = "sm",
  // 'sm' = 4px, 'lg' = 8px, 'full' = circle, 'none'
  altField: e = "alt",
  clickToZoom: t = !1
} = {}) {
  const n = i === "full" ? "999px" : i === "lg" ? "8px" : i === "none" ? "0" : "4px";
  return ({ value: r, row: a }) => {
    if (V(r)) return "";
    const o = String(r), l = a?.[e] ?? "", d = m("img", {
      src: o,
      alt: l,
      class: "sg-renderer-image",
      width: String(s),
      height: String(s),
      style: `border-radius: ${n};`,
      loading: "lazy",
      decoding: "async"
    });
    return t && (d.style.cursor = "zoom-in", d.addEventListener("click", (c) => {
      c.stopPropagation(), vs(o, l);
    })), d;
  };
}
function vs(s, i) {
  const e = m("div", { class: "sg-image-zoom" }), t = () => {
    e.remove(), document.removeEventListener("keydown", n);
  }, n = (r) => {
    r.key === "Escape" && t();
  };
  e.addEventListener("click", t), document.addEventListener("keydown", n), e.append(m("img", { src: s, alt: i || "", class: "sg-image-zoom-img" })), document.body.appendChild(e);
}
function ut({
  showLabel: s = !0,
  label: i = "value",
  // 'value' | 'name' | (value, row) => string
  shape: e = "circle",
  // 'circle' | 'square'
  size: t = 14
} = {}) {
  return ({ value: n, row: r }) => {
    if (V(n)) return "";
    const a = String(n).trim(), o = m("span", { class: "sg-renderer-swatch" }), l = m("span", {
      class: `sg-renderer-swatch-chip is-${e}`,
      style: `width: ${t}px; height: ${t}px; background: ${a};`,
      "aria-hidden": "true"
    });
    if (o.append(l), s) {
      const d = typeof i == "function" ? i(n, r) : i === "name" ? r?.name ?? a : a;
      o.append(m("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(d)));
    }
    return o;
  };
}
const ys = {
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  orange: "#f97316",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#6b7280"
};
function ht({
  type: s = "line",
  // 'line' | 'area' | 'bar'
  width: i = 80,
  height: e = 24,
  color: t = "blue",
  // palette key OR raw CSS colour
  baseline: n = null,
  // null = auto-min, 0 = lock min at zero, N = lock at N
  showLast: r = !0
  // small dot on the last point (line / area only)
} = {}) {
  const a = ys[t] || t;
  return ({ value: o }) => {
    if (!Array.isArray(o) || o.length === 0) return "";
    const l = o.map(Number).filter((b) => Number.isFinite(b));
    if (l.length === 0) return "";
    const d = n ?? Math.min(...l), h = Math.max(...l, n ?? -1 / 0) - d || 1, u = 1.5, p = 2.5, f = i - u * 2, _ = e - p * 2, y = (b) => u + (l.length === 1 ? f / 2 : b / (l.length - 1) * f), C = (b) => p + _ - (b - d) / h * _;
    let v = "";
    if (s === "bar") {
      const w = Math.max(1, (f - (l.length - 1) * 1) / l.length);
      for (let x = 0; x < l.length; x++) {
        const L = l[x], R = u + x * (w + 1), T = C(L), k = p + _ - T;
        v += `<rect x="${R.toFixed(2)}" y="${T.toFixed(2)}" width="${w.toFixed(2)}" height="${k.toFixed(2)}" fill="${a}"/>`;
      }
    } else {
      let b = "";
      for (let w = 0; w < l.length; w++)
        b += `${w === 0 ? "M" : "L"} ${y(w).toFixed(2)} ${C(l[w]).toFixed(2)} `;
      if (s === "area") {
        const w = b + ` L ${y(l.length - 1).toFixed(2)} ${(p + _).toFixed(2)} L ${y(0).toFixed(2)} ${(p + _).toFixed(2)} Z`;
        v += `<path d="${w}" fill="${a}" fill-opacity="0.18" stroke="none"/>`;
      }
      if (v += `<path d="${b.trim()}" fill="none" stroke="${a}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`, r) {
        const w = y(l.length - 1), x = C(l[l.length - 1]);
        v += `<circle cx="${w.toFixed(2)}" cy="${x.toFixed(2)}" r="1.8" fill="${a}"/>`;
      }
    }
    return `<svg class="sg-renderer-sparkline is-${s}" viewBox="0 0 ${i} ${e}" width="${i}" height="${e}" preserveAspectRatio="none" aria-hidden="true">` + v + "</svg>";
  };
}
function bs(s) {
  if (typeof s != "string") return null;
  let i = s.trim().replace(/^#/, "");
  return i.length === 3 && (i = i.split("").map((e) => e + e).join("")), /^[0-9a-f]{6}$/i.test(i) ? [parseInt(i.slice(0, 2), 16), parseInt(i.slice(2, 4), 16), parseInt(i.slice(4, 6), 16)] : null;
}
function ws(s, i, e) {
  const t = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${t(s)}${t(i)}${t(e)}`;
}
function Cs(s, i, e) {
  return [s[0] + (i[0] - s[0]) * e, s[1] + (i[1] - s[1]) * e, s[2] + (i[2] - s[2]) * e];
}
function Ss([s, i, e]) {
  return 0.299 * s + 0.587 * i + 0.114 * e >= 145;
}
function pt({
  min: s = 0,
  max: i = 100,
  colors: e = ["#dcfce7", "#fef3c7", "#fecaca"],
  inverted: t = !1,
  showValue: n = !0,
  format: r = null
  // (value) => string for custom labels
} = {}) {
  const a = e.map(bs).filter(Boolean);
  if (a.length < 2) throw new Error("heatmap: need at least two valid hex colours");
  return ({ value: o, td: l }) => {
    if (l && l.classList.add("sg-renderer-heatmap"), V(o)) return "";
    let d = Number(o);
    if (!Number.isFinite(d)) return String(o);
    let c = i - s === 0 ? 0.5 : (d - s) / (i - s);
    c = Math.max(0, Math.min(1, c)), t && (c = 1 - c);
    const h = c * (a.length - 1), u = Math.min(a.length - 2, Math.floor(h)), p = h - u, f = Cs(a[u], a[u + 1], p);
    return l && (l.style.backgroundColor = ws(...f), l.style.color = Ss(f) ? "#111827" : "#ffffff"), n ? typeof r == "function" ? r(o) : String(o) : "";
  };
}
const xs = {
  // Credit card: 16 digits grouped 4-4-4-4, last 4 visible. Handles 13-19
  // digit lengths gracefully (Amex 15, others 16). Non-digits are stripped.
  "cc-last4": (s, i) => Ve(s.replace(/\D/g, ""), 4, 4, i, " "),
  // BIN + last4: show the first 6 + last 4, mask the middle (PCI-friendly).
  "cc-bin-last4": (s, i) => Ve(s.replace(/\D/g, ""), 4, 4, i, " ", 6),
  // Phone: show the last 4 digits, mask the rest as a single bullet
  // block ("•••••• 1234"). Sidesteps the country-specific 3-3-4 / 4-3-3
  // grouping ambiguity — register your own variant if you need a
  // region-specific layout.
  "phone-last4": (s, i) => {
    const e = s.replace(/\D/g, "");
    return e ? e.length <= 4 ? e : i.repeat(e.length - 4) + " " + e.slice(-4) : s;
  },
  // Email: show first char + domain ("a••••@example.com").
  email: (s, i) => {
    const e = String(s).match(/^([^@\s]+)(@.+)$/);
    return e ? e[1][0] + i.repeat(Math.max(1, e[1].length - 1)) + e[2] : s;
  },
  // SSN / ABN-style: show last 4.
  last4: (s, i) => Ls(s, 4, i)
};
function Ls(s, i, e) {
  const t = String(s);
  return t.length <= i ? t : e.repeat(t.length - i) + t.slice(-i);
}
function Ve(s, i, e, t, n, r = 0) {
  if (!s) return "";
  const a = s.length, o = s.split("").map((d, c) => c < r || c >= a - e ? d : t).join(""), l = [];
  for (let d = o.length; d > 0; d -= i)
    l.unshift(o.slice(Math.max(0, d - i), d));
  return l.join(n);
}
const As = /* @__PURE__ */ new Set(["cc-last4", "cc-bin-last4", "phone-last4", "last4"]);
function ft({
  format: s = null,
  showFirst: i = 0,
  showLast: e = 4,
  char: t = "•",
  align: n = null
  // 'left' | 'right' | null (auto)
} = {}) {
  const r = s ? xs[s] : null, a = s ? As.has(s) : !1, o = n === "right" || n !== "left" && a;
  return ({ value: l, td: d }) => {
    if (d && o && d.classList.add("sg-renderer-mask-numeric"), V(l)) return "";
    const c = String(l);
    if (r) return r(c, t);
    const h = c.slice(0, i), u = e > 0 ? c.slice(-e) : "", p = Math.max(0, c.length - i - e);
    return h + t.repeat(p) + u;
  };
}
function gt({
  query: s = null,
  caseSensitive: i = !1,
  className: e = "sg-renderer-mark"
} = {}) {
  return ({ value: t, api: n }) => {
    if (V(t)) return "";
    const r = String(t), a = s != null ? String(s) : n?.getQuickFilter?.() || "";
    return a ? Es(r, a, i, e) : document.createTextNode(r);
  };
}
function Es(s, i, e, t) {
  const n = e ? s : s.toLowerCase(), r = e ? i : i.toLowerCase(), a = document.createElement("span");
  let o = 0;
  for (; o < s.length; ) {
    const l = n.indexOf(r, o);
    if (l === -1) {
      a.appendChild(document.createTextNode(s.slice(o)));
      break;
    }
    l > o && a.appendChild(document.createTextNode(s.slice(o, l)));
    const d = document.createElement("mark");
    d.className = t, d.textContent = s.slice(l, l + i.length), a.appendChild(d), o = l + i.length;
  }
  return a;
}
function mt({ lines: s = null, separator: i = `
` } = {}) {
  return ({ value: e, td: t }) => {
    if (V(e)) return "";
    const n = String(e), r = i === `
` ? n : n.split(i).join(`
`);
    if (t) {
      t.classList.add("sg-renderer-multiline"), t.setAttribute("title", r);
      const a = t.parentElement;
      a && a.tagName === "TR" && a.classList.add("sg-has-multiline");
    }
    if (s != null && s > 0) {
      const a = document.createElement("div");
      return a.className = "sg-renderer-multiline-clamp", a.style.setProperty("--sg-clamp", String(s)), a.textContent = r, a;
    }
    return r;
  };
}
function Y(s) {
  if (s == null || !Number.isFinite(Number(s))) return "";
  let i = Number(s);
  if (i < 1024) return `${i} B`;
  const e = ["KB", "MB", "GB", "TB"];
  let t = -1;
  do
    i /= 1024, t++;
  while (i >= 1024 && t < e.length - 1);
  return `${i.toFixed(i < 10 ? 1 : 0)} ${e[t]}`;
}
const Ms = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "ico"]);
function z(s) {
  if (!s) return !1;
  if (typeof s.content_type == "string" && s.content_type.startsWith("image/")) return !0;
  const i = String(s.filename || "").split(".").pop()?.toLowerCase();
  return i ? Ms.has(i) : !1;
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
}, _t = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>', Ce = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>', Rs = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>', Ds = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 105.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>', Ts = /* @__PURE__ */ new Set(["mp3", "wav", "flac", "m4a", "ogg", "aac", "opus"]), ks = /* @__PURE__ */ new Set(["mp4", "mov", "webm", "mkv", "avi", "m4v"]);
function vt(s) {
  const i = String(s?.content_type || "").toLowerCase(), e = String(s?.filename || "").split(".").pop()?.toLowerCase() || "";
  return i.includes("pdf") || e === "pdf" ? "pdf" : i.startsWith("audio/") || Ts.has(e) ? "audio" : i.startsWith("video/") || ks.has(e) ? "video" : i.includes("zip") || ["zip", "tar", "gz", "7z", "rar"].includes(e) ? "zip" : i.includes("sheet") || i.includes("excel") || i.includes("csv") || ["xls", "xlsx", "csv", "numbers"].includes(e) ? "sheet" : i.includes("word") || i.includes("document") || ["doc", "docx", "txt", "md", "rtf"].includes(e) ? "doc" : ["js", "ts", "rb", "py", "go", "rs", "java", "json", "xml", "html", "css", "sh", "sql"].includes(e) ? "code" : "file";
}
function ge(s) {
  if (s == null || s === "") return [];
  let i = s;
  if (typeof i == "string")
    try {
      i = JSON.parse(i);
    } catch {
      return [];
    }
  return Array.isArray(i) || (i = [i]), i.filter((e) => e && (e.url || e.signed_id)).map((e, t) => ({
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
  thumbSize: s = 28,
  maxThumbs: i = 4,
  empty: e = "",
  editable: t = !1,
  accept: n = null,
  multiple: r = !0,
  download: a = !1,
  onUpload: o = null,
  onRemove: l = null
} = {}) {
  return (d) => {
    const { value: c, td: h, row: u, col: p } = d, f = ge(c);
    if (h && (h.classList.add("sg-renderer-attachments-cell"), h.dataset.attachmentCount = String(f.length), h._sgAttachments = f), f.length === 0 && !t)
      return e ? document.createTextNode(e) : "";
    const _ = m("div", { class: "sg-renderer-attachments", role: "group" }), y = f.slice(0, i), C = Math.max(0, f.length - y.length);
    if (y.forEach((v) => _.append(Vs(v, s, f, a))), C > 0) {
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
        b.stopPropagation(), Ie(h, d, { thumbSize: s, accept: n, multiple: r, onUpload: o, onRemove: l });
      }), _.append(v), Is(h, d, { onUpload: o }), h.addEventListener("dblclick", (b) => {
        b._sgAttachmentHandled || (b._sgAttachmentHandled = !0, b.stopPropagation(), Ie(h, d, { thumbSize: s, accept: n, multiple: r, onUpload: o, onRemove: l }));
      }, { once: !1 });
    }
    return _;
  };
}
function Vs(s, i, e, t) {
  const n = m("button", {
    type: "button",
    class: "sg-attach-thumb",
    title: `${s.filename}${s.byte_size != null ? " · " + Y(s.byte_size) : ""}`,
    "data-attachment-id": s.id,
    "data-attachment-kind": z(s) ? "image" : "file",
    "aria-label": s.filename,
    style: `width: ${i}px; height: ${i}px;`
  });
  if (z(s) && s.thumb_url)
    n.append(m("img", {
      src: s.thumb_url,
      alt: s.filename,
      loading: "lazy",
      decoding: "async",
      width: String(i),
      height: String(i)
    }));
  else {
    const r = vt(s), a = m("span", { class: `sg-attach-icon is-${r}`, "aria-hidden": "true" });
    a.innerHTML = pe[r] || pe.file, n.append(a);
  }
  return n.addEventListener("click", (r) => {
    if (r.stopPropagation(), z(s)) {
      const a = e.filter(z);
      bt(a.length ? a : [s], s);
    } else if (t) {
      const a = document.createElement("a");
      a.href = s.url, a.download = s.filename, document.body.appendChild(a), a.click(), a.remove();
    } else
      window.open(s.url, "_blank", "noopener,noreferrer");
  }), n;
}
let X = null;
function bt(s, i) {
  _e();
  const e = s.filter(z);
  if (e.length === 0) return;
  let t = Math.max(0, e.findIndex((p) => p.id === i?.id));
  t < 0 && (t = 0);
  const n = m("div", { class: "sg-image-zoom sg-attach-lightbox", role: "dialog", "aria-modal": "true" }), r = m("div", { class: "sg-attach-lightbox-stage" }), a = m("img", { class: "sg-image-zoom-img", alt: "" }), o = m("div", { class: "sg-attach-lightbox-caption" }), l = m("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-prev",
    "aria-label": "Previous attachment"
  }), d = m("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-next",
    "aria-label": "Next attachment"
  });
  l.innerHTML = Rs, d.innerHTML = Ds;
  function c() {
    const p = e[t];
    a.src = p.preview_url || p.url, a.alt = p.filename, o.textContent = `${p.filename}${p.byte_size != null ? " · " + Y(p.byte_size) : ""} (${t + 1}/${e.length})`, l.style.visibility = e.length > 1 ? "visible" : "hidden", d.style.visibility = e.length > 1 ? "visible" : "hidden";
  }
  function h(p) {
    t = (t + p + e.length) % e.length, c();
  }
  function u(p) {
    p.key === "Escape" ? _e() : p.key === "ArrowLeft" ? h(-1) : p.key === "ArrowRight" && h(1);
  }
  n.addEventListener("click", (p) => {
    (p.target === n || p.target === r) && _e();
  }), l.addEventListener("click", (p) => {
    p.stopPropagation(), h(-1);
  }), d.addEventListener("click", (p) => {
    p.stopPropagation(), h(1);
  }), document.addEventListener("keydown", u), r.append(l, a, d), n.append(r, o), document.body.appendChild(n), X = { overlay: n, onKey: u }, c();
}
function _e() {
  X && (document.removeEventListener("keydown", X.onKey), X.overlay.remove(), X = null);
}
let le = null;
function Is(s, i, { onUpload: e }) {
  s._sgAttachDropBound || (s._sgAttachDropBound = !0, s.addEventListener("dragover", (t) => {
    t.dataTransfer?.types?.includes("Files") && (t.preventDefault(), s.classList.add("is-drop-target"));
  }), s.addEventListener("dragleave", () => s.classList.remove("is-drop-target")), s.addEventListener("drop", async (t) => {
    if (!t.dataTransfer?.files?.length) return;
    t.preventDefault(), s.classList.remove("is-drop-target");
    const n = Array.from(t.dataTransfer.files);
    await de(s, i, n, e);
  }));
}
function Ie(s, i, e) {
  ne();
  const { thumbSize: t, accept: n, multiple: r, onUpload: a, onRemove: o } = e, l = s._sgAttachments || ge(i.value), d = m("div", { class: "sg-attach-editor", role: "dialog", "aria-modal": "false" });
  d.addEventListener("mousedown", (v) => v.stopPropagation());
  const c = m("div", { class: "sg-attach-editor-header" }, [
    m(
      "span",
      { class: "sg-attach-editor-title" },
      document.createTextNode(l.length === 1 ? "1 attachment" : `${l.length} attachments`)
    ),
    (() => {
      const v = m("button", {
        type: "button",
        class: "sg-attach-editor-close",
        "aria-label": "Close"
      });
      return v.innerHTML = Ce, v.addEventListener("click", ne), v;
    })()
  ]), h = m("div", { class: "sg-attach-editor-grid" });
  function u() {
    const v = s._sgAttachments || [];
    h.replaceChildren(), v.forEach((b) => h.append(Ns(b, s, i, o, t))), c.firstChild.textContent = v.length === 1 ? "1 attachment" : `${v.length} attachments`;
  }
  u(), s._sgAttachRepaint = u;
  const p = m("label", { class: "sg-attach-dropzone", tabindex: "0" });
  p.innerHTML = `
    <span class="sg-attach-dropzone-icon" aria-hidden="true">${_t}</span>
    <span class="sg-attach-dropzone-text">Drop files, paste, or <strong>browse</strong></span>
  `;
  const f = m("input", { type: "file", multiple: r ? "" : null, accept: n || null });
  f.style.display = "none", p.append(f), f.addEventListener("change", async () => {
    f.files?.length && (await de(s, i, Array.from(f.files), a), f.value = "", u());
  }), p.addEventListener("dragover", (v) => {
    v.dataTransfer?.types?.includes("Files") && (v.preventDefault(), p.classList.add("is-drop-target"));
  }), p.addEventListener("dragleave", () => p.classList.remove("is-drop-target")), p.addEventListener("drop", async (v) => {
    v.dataTransfer?.files?.length && (v.preventDefault(), p.classList.remove("is-drop-target"), await de(s, i, Array.from(v.dataTransfer.files), a), u());
  });
  function _(v) {
    const b = Array.from(v.clipboardData?.files || []);
    b.length !== 0 && (v.preventDefault(), de(s, i, b, a).then(u));
  }
  d.addEventListener("paste", _);
  function y(v) {
    v.key === "Escape" && ne();
  }
  function C(v) {
    !d.contains(v.target) && !s.contains(v.target) && ne();
  }
  document.addEventListener("keydown", y), setTimeout(() => document.addEventListener("mousedown", C), 0), d.append(c, h, p), document.body.appendChild(d), Se(d, s), p.focus(), le = { pop: d, onKey: y, onDocClick: C, anchor: s };
}
function ne() {
  if (!le) return;
  const { pop: s, onKey: i, onDocClick: e, anchor: t } = le;
  document.removeEventListener("keydown", i), document.removeEventListener("mousedown", e), s.remove(), t && delete t._sgAttachRepaint, le = null;
}
function Ns(s, i, e, t, n) {
  const r = m("div", { class: "sg-attach-editor-tile", "data-attachment-id": s.id }), a = m("div", {
    class: "sg-attach-editor-preview",
    style: `width: ${n * 2}px; height: ${n * 2}px;`
  });
  if (z(s) && s.thumb_url)
    a.append(m("img", {
      src: s.thumb_url,
      alt: s.filename,
      width: String(n * 2),
      height: String(n * 2)
    }));
  else {
    const d = vt(s), c = m("span", { class: `sg-attach-icon is-${d}`, "aria-hidden": "true" });
    c.innerHTML = pe[d] || pe.file, a.append(c);
  }
  const o = m("div", { class: "sg-attach-editor-meta" }, [
    m(
      "div",
      { class: "sg-attach-editor-name", title: s.filename },
      document.createTextNode(s.filename)
    ),
    m(
      "div",
      { class: "sg-attach-editor-size" },
      document.createTextNode(s.byte_size != null ? Y(s.byte_size) : "")
    )
  ]), l = m("button", {
    type: "button",
    class: "sg-attach-editor-remove",
    title: "Remove",
    "aria-label": `Remove ${s.filename}`,
    "data-sg-attach": "remove",
    "data-attachment-id": s.id
  });
  return l.innerHTML = Ce, l.addEventListener("click", async (d) => {
    d.stopPropagation(), await Ps(i, e, s, t);
  }), r.append(a, o, l), r;
}
function Se(s, i) {
  const e = i.getBoundingClientRect();
  s.style.position = "fixed", s.style.left = `${Math.max(8, Math.min(window.innerWidth - 360, e.left))}px`, window.innerHeight - e.bottom > 280 ? s.style.top = `${e.bottom + 4}px` : s.style.top = `${Math.max(8, e.top - s.offsetHeight - 4)}px`;
}
async function de(s, i, e, t) {
  if (e.length) {
    s.classList.add("is-uploading");
    try {
      let n;
      if (typeof t == "function") {
        const r = await t(e, i);
        n = Array.isArray(r) ? r : (s._sgAttachments || []).concat(Ne(e));
      } else
        n = (s._sgAttachments || []).concat(Ne(e));
      wt(s, i, ge(n));
    } finally {
      s.classList.remove("is-uploading");
    }
  }
}
async function Ps(s, i, e, t) {
  let n;
  if (typeof t == "function") {
    const r = await t(e, i);
    n = Array.isArray(r) ? r : (s._sgAttachments || []).filter((a) => a.id !== e.id);
  } else
    n = (s._sgAttachments || []).filter((r) => r.id !== e.id);
  wt(s, i, ge(n));
}
function Ne(s) {
  return s.map((i, e) => ({
    id: `local_${Date.now()}_${e}`,
    filename: i.name,
    url: URL.createObjectURL(i),
    content_type: i.type || "",
    byte_size: i.size,
    preview_url: i.type?.startsWith("image/") ? URL.createObjectURL(i) : null,
    thumb_url: i.type?.startsWith("image/") ? URL.createObjectURL(i) : null
  }));
}
function wt(s, i, e) {
  const { row: t, col: n, api: r } = i;
  t && n?.field != null && (t[n.field] = e), s._sgAttachments = e, r?.applyTransaction ? r.applyTransaction({ update: [t] }) : r?.refreshCells && r.refreshCells({ rowIds: [t?.id ?? t?._sg_id] }), s._sgAttachRepaint && s._sgAttachRepaint();
}
const Fs = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"], Ct = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory"
};
function Bs(s) {
  if (s == null || s === "") return null;
  if (typeof s == "string") return { _raw: s };
  if (typeof s != "object") return null;
  const i = s.state ? String(s.state).trim().toUpperCase() : "";
  return {
    address1: s.address1 ? String(s.address1) : "",
    address2: s.address2 ? String(s.address2) : "",
    address3: s.address3 ? String(s.address3) : "",
    suburb: s.suburb ? String(s.suburb) : "",
    state: i,
    postcode: s.postcode != null ? String(s.postcode) : "",
    country: s.country ? String(s.country) : ""
  };
}
function $s(s) {
  if (!s || s._raw) return s?._raw || "";
  const i = [s.address1, s.address2, s.address3].filter(Boolean), e = [s.suburb, s.state, s.postcode].filter(Boolean).join(" ");
  return e && i.push(e), s.country && s.country.toLowerCase() !== "australia" && i.push(s.country), i.join(`
`);
}
function St({ editable: s = !0, empty: i = "" } = {}) {
  return (e) => {
    const { value: t, td: n } = e, r = Bs(t);
    if (n && (n.classList.add("sg-renderer-address-au-cell"), n._sgAddress = r), !r) return i ? document.createTextNode(i) : "";
    s && n && !n._sgAddressEditBound && (n._sgAddressEditBound = !0, n.addEventListener("dblclick", (d) => {
      d._sgAddressHandled || (d._sgAddressHandled = !0, d.stopPropagation(), Hs(n, e));
    }));
    const a = m("div", {
      class: "sg-renderer-address-au",
      title: $s(r)
    });
    if (r._raw)
      return a.append(document.createTextNode(r._raw)), a;
    const o = [r.address1, r.address2].filter(Boolean).join(", "), l = r.suburb || r.state || r.postcode;
    return o && a.append(m("span", { class: "sg-address-au-street" }, document.createTextNode(o))), o && l && a.append(m("span", { class: "sg-address-au-sep" }, document.createTextNode(", "))), r.suburb && a.append(document.createTextNode(r.suburb)), r.state && (r.suburb && a.append(document.createTextNode(" ")), a.append(m("span", {
      class: `sg-address-au-state is-${r.state.toLowerCase()}`,
      title: Ct[r.state] || r.state
    }, document.createTextNode(r.state)))), r.postcode && ((r.suburb || r.state) && a.append(document.createTextNode(" ")), a.append(m(
      "span",
      { class: "sg-address-au-postcode" },
      document.createTextNode(r.postcode)
    ))), r.country && r.country.toLowerCase() !== "australia" && (a.append(document.createTextNode(" ")), a.append(m(
      "span",
      { class: "sg-address-au-country" },
      document.createTextNode(r.country)
    ))), a;
  };
}
let ce = null;
function Hs(s, i) {
  j();
  const e = s._sgAddress && !s._sgAddress._raw ? { ...s._sgAddress } : { address1: "", address2: "", address3: "", suburb: "", state: "", postcode: "", country: "Australia" };
  e.country || (e.country = "Australia");
  const t = m("div", { class: "sg-address-au-editor", role: "dialog", "aria-modal": "false" });
  t.addEventListener("mousedown", (E) => E.stopPropagation());
  const n = m("div", { class: "sg-address-au-editor-header" });
  n.append(
    m("span", { class: "sg-address-au-editor-title" }, document.createTextNode("Edit address"))
  );
  const r = m("form", { class: "sg-address-au-editor-form", novalidate: "novalidate" });
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
  const o = a({
    label: "Address line 1",
    name: "address1",
    value: e.address1,
    placeholder: "12 Smith Street",
    autocomplete: "address-line1"
  }), l = a({
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
    const E = !!(l.input.value.trim() || c.input.value.trim());
    d.hidden = !E, h.hidden = E;
  }
  l.input.addEventListener("input", u), h.addEventListener("click", () => {
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
  for (const E of Fs) {
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
  v.append(o.wrap), v.append(l.wrap, h), v.append(d), v.append(p.wrap, f, y.wrap), v.append(C.wrap);
  const b = m("div", { class: "sg-address-au-editor-footer" }), w = m(
    "button",
    { type: "button", class: "sg-address-au-editor-cancel" },
    document.createTextNode("Cancel")
  ), x = m(
    "button",
    { type: "submit", class: "sg-address-au-editor-save" },
    document.createTextNode("Save")
  );
  b.append(w, x), r.append(v, b), t.append(n, r);
  function L() {
    return {
      address1: o.input.value.trim(),
      address2: l.input.value.trim(),
      address3: d.hidden ? "" : c.input.value.trim(),
      suburb: p.input.value.trim(),
      state: _.value,
      postcode: y.input.value.trim(),
      country: C.input.value.trim() || "Australia"
    };
  }
  function R() {
    const E = L(), P = !E.address1 && !E.suburb && !E.state && !E.postcode;
    zs(s, i, P ? null : E), j();
  }
  r.addEventListener("submit", (E) => {
    E.preventDefault(), R();
  }), w.addEventListener("click", () => j());
  function T(E) {
    E.key === "Escape" && (E.stopPropagation(), j());
  }
  function k(E) {
    !t.contains(E.target) && !s.contains(E.target) && j();
  }
  document.addEventListener("keydown", T), setTimeout(() => document.addEventListener("mousedown", k), 0), document.body.appendChild(t), Se(t, s), u(), o.input.focus(), o.input.select(), ce = { pop: t, onKey: T, onDocClick: k };
}
function j() {
  if (!ce) return;
  const { pop: s, onKey: i, onDocClick: e } = ce;
  document.removeEventListener("keydown", i), document.removeEventListener("mousedown", e), s.remove(), ce = null;
}
function zs(s, i, e) {
  const { row: t, col: n, api: r } = i, a = t && n?.field != null ? t[n.field] : null;
  t && n?.field != null && (t[n.field] = e), s._sgAddress = e, r?.applyTransaction ? r.applyTransaction({ update: [t] }) : r?.refreshCells && r.refreshCells({ rowIds: [t?.id ?? t?._sg_id] });
  const o = s.closest('[data-controller~="grid"]');
  o && o.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
    bubbles: !0,
    detail: { rowId: t?.id ?? t?._sg_id, colId: n?.field, oldValue: a, newValue: e }
  }));
}
function xt({ color: s = "green", showValue: i = !1 } = {}) {
  return ({ value: e }) => {
    let t = Number(e);
    Number.isFinite(t) || (t = 0), t = Math.max(0, Math.min(100, t));
    const n = m("div", { class: "sg-renderer-progress" }, [
      m("div", { class: `sg-renderer-progress-fill sg-fill-${s}`, style: `width: ${t}%;` })
    ]);
    return i ? m("div", { class: "sg-renderer-progress-wrap" }, [
      n,
      m("span", { class: "sg-renderer-progress-label" }, document.createTextNode(`${Math.round(t)}%`))
    ]) : n;
  };
}
const ie = '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>';
function Lt({ max: s = 5, precision: i = 0.5 } = {}) {
  const e = i > 0 ? 1 / i : 2;
  return ({ value: t }) => {
    let n = parseFloat(t);
    Number.isFinite(n) || (n = 0), n = Math.max(0, Math.min(s, n)), n = Math.round(n * e) / e;
    const r = m("div", {
      class: "sg-renderer-stars",
      role: "img",
      "aria-label": `${n} out of ${s} stars`
    });
    for (let a = 1; a <= s; a++)
      if (n >= a)
        r.append(m("span", { class: "sg-renderer-star is-full", "aria-hidden": "true" }, ie));
      else if (n > a - 1) {
        const o = Math.round((n - (a - 1)) * 100);
        r.append(m(
          "span",
          { class: "sg-renderer-star is-partial", "aria-hidden": "true" },
          `${ie}<span class="sg-star-clip" style="width: ${o}%;">${ie}</span>`
        ));
      } else
        r.append(m("span", { class: "sg-renderer-star is-empty", "aria-hidden": "true" }, ie));
    return r;
  };
}
function At({ separator: s = "," } = {}) {
  return ({ value: i }) => {
    if (V(i)) return "";
    const e = Array.isArray(i) ? i : String(i).split(s), t = m("div", { class: "sg-renderer-tags" });
    for (const n of e) {
      const r = String(n).trim();
      r && t.append(m("span", { class: "sg-renderer-tag" }, document.createTextNode(r)));
    }
    return t;
  };
}
function Et({ showCode: s = !0, fallback: i = null } = {}) {
  return ({ value: e }) => {
    if (V(e)) return "";
    const t = String(e).trim().toUpperCase();
    if (t.length !== 2 || !/^[A-Z]{2}$/.test(t))
      return i ?? document.createTextNode(String(e));
    const n = String.fromCodePoint(
      127462 + t.charCodeAt(0) - 65,
      127462 + t.charCodeAt(1) - 65
    ), r = m("span", { class: "sg-renderer-country" });
    return r.append(m("span", { class: "sg-renderer-flag", "aria-hidden": "true" }, document.createTextNode(n))), s && r.append(m("span", { class: "sg-renderer-country-code" }, document.createTextNode(t))), r;
  };
}
function Gs(s) {
  const i = String(s).replace(/\s+/g, "");
  if (i.length !== 11 || !/^\d{11}$/.test(i)) return !1;
  const e = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19], t = parseInt(i[0], 10) - 1 + i.slice(1);
  let n = 0;
  for (let r = 0; r < 11; r++) n += parseInt(t[r], 10) * e[r];
  return n % 89 === 0;
}
function Os(s) {
  const i = String(s).replace(/\D/g, "");
  return i.length !== 11 ? String(s) : `${i.slice(0, 2)} ${i.slice(2, 5)} ${i.slice(5, 8)} ${i.slice(8)}`;
}
function Mt() {
  return ({ value: s }) => {
    if (V(s)) return "";
    if (!Gs(s))
      return m("span", { class: "sg-renderer-invalid", title: "Invalid ABN" }, document.createTextNode(String(s)));
    const i = String(s).replace(/\s+/g, "");
    return m("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/ABN/View?id=${i}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(Os(s)));
  };
}
function Rt({
  lookup: s = null,
  nameField: i = null,
  avatarField: e = null,
  windowKey: t = "__sgUsers",
  size: n = 22
} = {}) {
  return ({ value: r, row: a }) => {
    if (V(r)) return "";
    let o = null;
    if (typeof s == "function" && (o = s(r, a) || null), !o && i && (o = { name: a?.[i], avatarUrl: e ? a?.[e] : null }), !o && typeof window < "u" && window[t]) {
      const c = window[t];
      c instanceof Map ? o = c.get(r) || c.get(String(r)) || null : Array.isArray(c) && (o = c.find((h) => `${h.id}` == `${r}`) || null);
    }
    const l = o?.name ?? String(r), d = m("span", { class: "sg-renderer-avatar" });
    if (o?.avatarUrl)
      d.append(m("img", {
        class: "sg-renderer-avatar-img",
        src: o.avatarUrl,
        width: String(n),
        height: String(n),
        alt: ""
      }));
    else {
      const c = String(l).split(/\s+/).filter(Boolean).slice(0, 2).map((h) => h[0]?.toUpperCase() || "").join("");
      d.append(m("span", {
        class: "sg-renderer-avatar-initials",
        style: `width: ${n}px; height: ${n}px;`
      }, document.createTextNode(c)));
    }
    return d.append(m("span", { class: "sg-renderer-avatar-name" }, document.createTextNode(l))), d;
  };
}
const Ks = {
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
function qs(s) {
  return String(s).toLowerCase().split(/[\s_-]+/).map((i) => i && i[0].toUpperCase() + i.slice(1)).join(" ");
}
function Ws(s = {}, i = null, e = {}) {
  const { titleCase: t = !0, defaultColor: n = "gray" } = e, r = {};
  for (const [o, l] of Object.entries(s)) r[String(o).toLowerCase()] = l;
  const a = {};
  if (i) for (const [o, l] of Object.entries(i)) a[String(o).toLowerCase()] = l;
  return ({ value: o }) => {
    if (V(o)) return "";
    const l = String(o).toLowerCase(), d = r[l] || n, c = t ? qs(o) : String(o), h = m("span", { class: `sg-pill sg-pill-${d}` });
    if (i) {
      const u = a[l], p = u ? Ks[u] || u : null;
      if (p) {
        const f = m("span", { class: "sg-pill-icon", "aria-hidden": "true" });
        f.innerHTML = p, h.append(f);
      }
    }
    return h.append(m("span", { class: "sg-pill-label" }, document.createTextNode(c))), h;
  };
}
function Dt({
  truthy: s = rt,
  disabled: i = !1
} = {}) {
  return (e) => {
    const { value: t, row: n, col: r, api: a, td: o } = e;
    o && o.classList.add("sg-renderer-checkbox-cell");
    const l = m("span", { class: "sg-renderer-checkbox" }), d = m("input", {
      type: "checkbox",
      class: "sg-renderer-checkbox-input",
      disabled: i ? "" : null,
      "aria-label": r?.field || "toggle"
    });
    return t == null || t === "" ? d.indeterminate = !0 : d.checked = s(t), d.addEventListener("click", (c) => c.stopPropagation()), d.addEventListener("change", (c) => {
      if (i) {
        c.preventDefault();
        return;
      }
      const h = d.checked, u = n && r?.field != null ? n[r.field] : null;
      n && r?.field != null && (n[r.field] = h), a?.applyTransaction && a.applyTransaction({ update: [n] });
      const p = o?.closest('[data-controller~="grid"]');
      p && p.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: n?.id ?? n?._sg_id, colId: r?.field, oldValue: u, newValue: h }
      }));
    }), l.append(d), l;
  };
}
const Us = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z"/></svg>', ve = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>', js = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>', Xs = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/></svg>', Ys = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/></svg>', Qs = Ce;
function Tt(s) {
  if (s == null || s === "") return null;
  if (typeof s == "string") {
    const e = s.trim();
    if (!e) return null;
    const t = e.split("/").pop()?.match(/^[^?#]+/)?.[0] || "";
    return { url: e, filename: t || "audio", byte_size: null, duration: null };
  }
  if (typeof s != "object") return null;
  const i = s.url || s.src || s.href;
  return i ? {
    url: String(i),
    filename: s.filename || s.name || String(i).split("/").pop()?.split("?")[0] || "audio",
    byte_size: s.byte_size ?? s.byteSize ?? s.size ?? null,
    duration: Number.isFinite(s.duration) ? Number(s.duration) : null,
    content_type: s.content_type || s.contentType || s.mime_type || ""
  } : null;
}
function ue(s) {
  (!Number.isFinite(s) || s < 0) && (s = 0);
  const i = Math.floor(s), e = Math.floor(i / 3600), t = Math.floor(i % 3600 / 60), n = i % 60, r = (a) => String(a).padStart(2, "0");
  return e > 0 ? `${e}:${r(t)}:${r(n)}` : `${t}:${r(n)}`;
}
function kt({
  showFilename: s = !0,
  iconOnly: i = !1,
  empty: e = "",
  preferHowler: t = !0,
  skipSeconds: n = 10
} = {}) {
  return (r) => {
    const { value: a, td: o } = r, l = Tt(a);
    if (o && (o.classList.add("sg-renderer-audio-cell"), o._sgAudio = l, o._sgAudioOpts = { preferHowler: t, skipSeconds: n }), !l) return e ? document.createTextNode(e) : "";
    o && !o._sgAudioDblBound && (o._sgAudioDblBound = !0, o.addEventListener("dblclick", (h) => {
      h._sgAudioHandled || (h._sgAudioHandled = !0, h.stopPropagation(), h.preventDefault(), Pe(o, r));
    }));
    const d = m("div", { class: "sg-renderer-audio" }), c = m("button", {
      type: "button",
      class: "sg-audio-icon",
      title: `${l.filename}${l.byte_size != null ? " · " + Y(l.byte_size) : ""} — double-click to play`,
      "aria-label": `Play ${l.filename}`,
      "data-sg-audio": "open"
    });
    if (c.innerHTML = Us, c.addEventListener("click", (h) => {
      h.stopPropagation(), Pe(o, r);
    }), c.addEventListener("dblclick", (h) => {
      h._sgAudioHandled = !0, h.stopPropagation();
    }), d.append(c), s && !i) {
      const h = m(
        "span",
        { class: "sg-audio-name" },
        document.createTextNode(l.filename)
      );
      d.append(h), l.duration != null && d.append(m(
        "span",
        { class: "sg-audio-duration" },
        document.createTextNode(ue(l.duration))
      ));
    }
    return d;
  };
}
function Zs(s, { preferHowler: i } = {}) {
  return i && typeof window < "u" && window.Howl ? new en(s) : new Js(s);
}
class Js {
  constructor(i) {
    this.audio = new Audio(), this.audio.preload = "metadata", this.audio.src = i, this._evMap = { load: "loadedmetadata", end: "ended", play: "play", pause: "pause", error: "error" }, this._handlers = /* @__PURE__ */ new Map();
  }
  play() {
    return this.audio.play();
  }
  pause() {
    this.audio.pause();
  }
  seek(i) {
    if (i == null) return this.audio.currentTime || 0;
    this.audio.currentTime = Math.max(0, i);
  }
  duration() {
    const i = this.audio.duration;
    return Number.isFinite(i) ? i : 0;
  }
  isPlaying() {
    return !this.audio.paused && !this.audio.ended;
  }
  on(i, e) {
    const t = this._evMap[i] || i;
    this.audio.addEventListener(t, e), this._handlers.set(e, [t, e]);
  }
  off(i, e) {
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
class en {
  constructor(i) {
    this.howl = new window.Howl({ src: [i], html5: !0, preload: !0 });
  }
  play() {
    this.howl.play();
  }
  pause() {
    this.howl.pause();
  }
  seek(i) {
    if (i == null) {
      const e = this.howl.seek();
      return typeof e == "number" ? e : 0;
    }
    this.howl.seek(Math.max(0, i));
  }
  duration() {
    return this.howl.duration() || 0;
  }
  isPlaying() {
    return this.howl.playing();
  }
  on(i, e) {
    this.howl.on(i, e);
  }
  off(i, e) {
    this.howl.off(i, e);
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
function Pe(s, i) {
  re();
  const e = s._sgAudio || Tt(i.value);
  if (!e) return;
  const t = s._sgAudioOpts || { preferHowler: !0, skipSeconds: 10 }, n = Zs(e.url, t), r = m("div", { class: "sg-audio-player", role: "dialog", "aria-label": "Audio player" });
  r.addEventListener("mousedown", (A) => A.stopPropagation());
  const a = m("div", { class: "sg-audio-player-header" }), o = m(
    "div",
    { class: "sg-audio-player-name", title: e.filename },
    document.createTextNode(e.filename)
  ), l = m("div", { class: "sg-audio-player-meta" }), d = [];
  e.byte_size != null && d.push(Y(e.byte_size)), n.backendName() === "howler" && d.push("howler.js"), l.textContent = d.join(" · ");
  const c = m("button", {
    type: "button",
    class: "sg-audio-player-close",
    "aria-label": "Close player"
  });
  c.innerHTML = Qs, c.addEventListener("click", re), a.append(o, l, c);
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
  v.innerHTML = Xs;
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
  w.innerHTML = Ys, C.append(v, b, w), r.append(a, h, f, C);
  let x = e.duration ?? 0, L = !1, R = null;
  function T(A) {
    const N = Math.max(0, Math.min(100, A));
    u.style.width = N + "%", p.style.left = N + "%";
  }
  function k() {
    const A = n.seek(), N = x || n.duration() || 0;
    if (N > 0 && x !== N && (x = N, y.textContent = ue(x), h.setAttribute("aria-valuemax", String(Math.floor(x)))), !L) {
      const q = x > 0 ? A / x * 100 : 0;
      T(q), _.textContent = ue(A), h.setAttribute("aria-valuenow", String(Math.floor(A)));
    }
  }
  function E() {
    k(), n.isPlaying() ? R = requestAnimationFrame(E) : R = null;
  }
  function P() {
    R == null && (R = requestAnimationFrame(E));
  }
  function B() {
    R != null && cancelAnimationFrame(R), R = null;
  }
  const Q = () => {
    x = n.duration(), k();
  }, Z = () => {
    b.dataset.state = "playing", b.innerHTML = js, b.setAttribute("aria-label", "Pause"), P();
  }, J = () => {
    b.dataset.state = "paused", b.innerHTML = ve, b.setAttribute("aria-label", "Play"), B(), k();
  }, ee = () => {
    b.dataset.state = "paused", b.innerHTML = ve, b.setAttribute("aria-label", "Play"), B(), n.seek(0), k();
  };
  n.on("load", Q), n.on("play", Z), n.on("pause", J), n.on("end", ee), b.addEventListener("click", (A) => {
    A.stopPropagation(), n.isPlaying() ? n.pause() : n.play();
  }), v.addEventListener("click", (A) => {
    A.stopPropagation(), n.seek(Math.max(0, n.seek() - t.skipSeconds)), k();
  }), w.addEventListener("click", (A) => {
    A.stopPropagation();
    const N = n.duration();
    n.seek(Math.min(N || 1 / 0, n.seek() + t.skipSeconds)), k();
  });
  function te(A) {
    const N = h.getBoundingClientRect(), q = (A.clientX ?? 0) - N.left, $ = Math.max(0, Math.min(1, q / N.width)), Ee = n.duration() || x;
    if (!Ee) return;
    const Me = $ * Ee;
    n.seek(Me), T($ * 100), _.textContent = ue(Me);
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
    const N = n.duration() || x;
    if (!N) return;
    const q = A.shiftKey ? 30 : 5;
    let $ = null;
    A.key === "ArrowLeft" ? $ = Math.max(0, n.seek() - q) : A.key === "ArrowRight" ? $ = Math.min(N, n.seek() + q) : A.key === "Home" ? $ = 0 : A.key === "End" && ($ = N), $ != null && (A.preventDefault(), n.seek($), k());
  });
  function U(A) {
    A.key === "Escape" ? (A.preventDefault(), re()) : (A.key === " " || A.code === "Space") && r.contains(document.activeElement) && (A.preventDefault(), n.isPlaying() ? n.pause() : n.play());
  }
  function Ae(A) {
    !r.contains(A.target) && !s.contains(A.target) && re();
  }
  document.addEventListener("keydown", U), setTimeout(() => document.addEventListener("mousedown", Ae), 0), document.body.appendChild(r), Se(r, s), k(), b.focus(), he = {
    pop: r,
    backend: n,
    onKey: U,
    onDocClick: Ae,
    cleanup: () => {
      B();
      try {
        n.off("load", Q), n.off("play", Z), n.off("pause", J), n.off("end", ee);
      } catch {
      }
      n.destroy();
    }
  };
}
function re() {
  if (!he) return;
  const { pop: s, onKey: i, onDocClick: e, cleanup: t } = he;
  document.removeEventListener("keydown", i), document.removeEventListener("mousedown", e), t(), s.remove(), he = null;
}
M("email", Ue());
M("url", je());
M("phone", Xe());
M("currency", Ye());
M("percent", Qe());
M("progress-bar", xt());
M("star-rating", Lt());
M("tags", At());
M("country-flag", Et());
M("abn", Mt());
M("avatar", Rt());
M("date", Ze());
M("datetime", Je());
M("relative-time", et());
M("duration", tt());
M("number", st());
M("compact-number", nt());
M("file-size", it());
M("boolean", at());
M("delta", ot());
M("truncate", lt());
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
M("audio-attachment", kt());
const tn = {
  email: Ue,
  url: je,
  phone: Xe,
  currency: Ye,
  percent: Qe,
  progressBar: xt,
  starRating: Lt,
  tags: At,
  countryFlag: Et,
  abn: Mt,
  avatar: Rt,
  statusPill: Ws,
  date: Ze,
  datetime: Je,
  relativeTime: et,
  duration: tt,
  number: st,
  compactNumber: nt,
  fileSize: it,
  boolean: at,
  delta: ot,
  truncate: lt,
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
  audioAttachment: kt
}, sn = 32, Fe = 100, ae = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', nn = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>', rn = /* @__PURE__ */ new Set([
  "number",
  "currency",
  "percent",
  "compactNumber",
  "fileSize",
  "duration"
]), an = /* @__PURE__ */ new Set([
  "color",
  "date",
  "datetime-local",
  "time",
  "month",
  "week"
]), Be = [
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
class xe extends O {
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
      const n = this.state.group.defaultExpanded;
      return n < 0 ? !0 : t < n;
    });
    // Delegated click handler for synthetic <th>s that don't have a
    // HeaderCellController of their own (pivot result cols today). Mirrors the
    // user-defined header path: bare click toggles sort, shift-click appends to
    // a multi-sort. Resize handles / filter icons short-circuit.
    D(this, "_onSynthHeaderClick", (e) => {
      const t = e.target.closest('th[data-synth="true"][data-sortable="true"]');
      if (!t || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const n = t.getAttribute("data-field");
      n && this.toggleSort(n, e.shiftKey === !0);
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
      const n = t.getAttribute("data-field") || t.getAttribute("data-header-cell-field-value"), r = this._colByField(n);
      !r || r._isCheckbox || r._isRowNumber || r._isGroupCol || r._isPivot || (e.preventDefault(), this._showColumnMenu(r, e.clientX, e.clientY));
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
      const n = Array.from(e.dataTransfer?.files || []);
      if (!n.length) return;
      const r = this.state.rowData.find((h) => this._rowId(h) === t.rowId), a = { rowId: t.rowId, colId: t.colId, files: n, row: r, dataTransfer: e.dataTransfer }, o = new CustomEvent("grid:fileAttached", { detail: a, bubbles: !0, cancelable: !0 });
      if (!this.element.dispatchEvent(o) || !r) return;
      const d = this.attachmentsFieldValue || t.colId, c = Array.isArray(r[d]) ? r[d].slice() : [];
      for (const h of n) {
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
      r[d] = c, this.scheduleRender("cells"), S(this.element, "grid:cellValueChanged", {
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
        const r = e.target.closest?.('td[data-gutter="true"]');
        if (r) {
          const a = r.closest("tr");
          this._rowDragPending = { rowId: this._coerceRowId(a.dataset.rowId), x: e.clientX, y: e.clientY }, this._rowDragMoved = !1, document.addEventListener("mousemove", this._onRowDragMove);
          return;
        }
      }
      if (e.target.closest?.('[data-tree-toggle="true"]')) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const n = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : n ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), S(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    D(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const n = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      n && n.focus.rowId === t.rowId && n.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), S(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
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
      const n = this._activeRect();
      if (!n) return;
      const r = this._cellRangeRows(n).map((a) => a.map((o) => String(o ?? "")).join("	")).join(`
`);
      r && (e.clipboardData?.setData("text/plain", r), e.preventDefault());
    });
    D(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && this.element.contains(t)) return;
      const n = e.key, r = e.metaKey || e.ctrlKey;
      if (r && n.toLowerCase() === "a") {
        e.preventDefault(), this.rowSelectionValue !== "" ? (this.clearCellSelection(), this.deselectAll(), this.selectAll()) : this._selectAllCells();
        return;
      }
      if (r) return;
      const a = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (a[n]) {
        e.preventDefault();
        const [o, l] = a[n];
        this._moveActiveCell(o, l, e.shiftKey);
        return;
      }
      if (n === "Tab") {
        e.preventDefault(), this._moveActiveCell(0, e.shiftKey ? -1 : 1, !1);
        return;
      }
      if (n === "Enter") {
        const o = this._activeCell();
        o && (e.preventDefault(), this.startEditingCell(o.rowId, o.colId));
        return;
      }
      if (n === "Escape") {
        this.clearCellSelection();
        return;
      }
      if (n === "Delete" || n === "Backspace") {
        this._clearSelectedCells() && e.preventDefault();
        return;
      }
      if (n.length === 1 && !e.altKey) {
        const o = this._activeCell();
        if (!o) return;
        const l = this._colByField(o.colId);
        if (!l || !l.editable) return;
        e.preventDefault(), this.startEditingCell(o.rowId, o.colId, n);
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
      const n = String(e);
      if (this._treeExpanded.has(n)) return this._treeExpanded.get(n);
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
      pagination: { enabled: !1, page: 0, pageSize: Fe },
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = rs(this), queueMicrotask(() => this._initialLoad());
  }
  disconnect() {
    this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("mousemove", this._onRowDragMove), this._thead?.removeEventListener("contextmenu", this._onHeaderContextMenu), this._thead?.removeEventListener("click", this._onSynthHeaderClick), this._tbody?.removeEventListener("dragenter", this._onCellDragEnter), this._tbody?.removeEventListener("dragover", this._onCellDragOver), this._tbody?.removeEventListener("dragleave", this._onCellDragLeave), this._tbody?.removeEventListener("drop", this._onCellDrop), this._closeColumnMenu(), this._teardownPersistence(), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove(), this._resizeObserver?.disconnect(), this._resizeObserver = null;
  }
  // ----- Initial data + setup -----
  _captureInitialMarkup() {
    const e = this.element.querySelector("tbody");
    e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((t, n) => {
      if (t.hasAttribute("data-separator")) {
        const d = t.getAttribute("data-separator"), c = { __sgSeparator: !0 };
        d && d !== "" && d !== "true" && (c.variant = d);
        const h = t.getAttribute("data-label"), u = t.getAttribute("data-value");
        return h != null && (c.label = h), u != null && (c.value = u), c;
      }
      const r = {}, a = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      r[this.getRowIdValue] = a != null ? this._coerceRowId(a) : n + 1;
      const o = {};
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
        u > 1 && (o[c] = u);
      }), Object.keys(o).length && (r.__sgSpans = o);
      const l = t.getAttribute("data-row-detail-rows-value");
      if (l && this.detailRowsKeyValue)
        try {
          r[this.detailRowsKeyValue] = JSON.parse(l);
        } catch {
        }
      return r;
    }), e.innerHTML = ""), this._initialHead = this.element.querySelector("thead");
  }
  _buildChrome() {
    let e = this.element.querySelector("table");
    if (!e) {
      e = g("table");
      const n = g("thead");
      e.appendChild(n), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = g("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const n = g("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(n, e), n.appendChild(e), this._viewport = n;
    }
    if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = g("div", { class: "sg-status-bar", role: "status" }), this._statusBar.append(
      g("div", { class: "sg-status-section sg-status-left" }),
      g("div", { class: "sg-status-section sg-status-right" })
    ), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
      const n = g("div", { class: "sg-main" });
      this._viewport.parentNode.insertBefore(n, this._viewport), n.appendChild(this._viewport), this._statusBar && n.appendChild(this._statusBar), this._main = n, this._sidePanel = g("aside", {
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
    const n = this._colByField(e);
    if (!(!n || !n.filter)) {
      this._closeFilterPopover();
      {
        this._openFallbackFilterPopover(n, t);
        return;
      }
    }
  }
  _closeFilterPopover() {
    this._filterPopover && (this._filterPopover.remove(), this._filterPopover = null, document.removeEventListener("mousedown", this._onDocMouseDown));
  }
  _openFallbackFilterPopover(e, t) {
    const n = this.state.filterModel[e.field] || {}, r = ln(e.filter), a = g("div", { class: "sg-filter-popover" }), o = g("select");
    r.forEach((y) => o.append(new Option(y.label, y.value, !1, y.value === n.type)));
    const l = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", d = g("input", { type: l, value: n.value ?? "" }), c = g("input", { type: l, value: n.value2 ?? "", style: { display: "none" } }), h = () => {
      const y = o.value, C = y === "inRange", v = !(y === "blank" || y === "notBlank");
      d.style.display = v ? "" : "none", c.style.display = C ? "" : "none";
    };
    o.addEventListener("change", h), h();
    const u = g("div", { class: "sg-filter-actions" }), p = g("button", { type: "button" }, "Clear"), f = g("button", { type: "button", class: "primary" }, "Apply");
    u.append(p, f), p.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), f.addEventListener("click", () => {
      const y = o.value, C = y === "blank" || y === "notBlank" ? { filterType: e.filter, type: y } : { filterType: e.filter, type: y, value: d.value, value2: c.value || void 0 };
      this.setColumnFilter(e.field, C), this._closeFilterPopover();
    }), a.append(
      g("label", {}, "Condition"),
      o,
      d,
      c,
      u
    ), document.body.appendChild(a);
    const _ = t.getBoundingClientRect();
    a.style.left = `${_.left + window.scrollX}px`, a.style.top = `${_.bottom + window.scrollY + 2}px`, this._filterPopover = a, document.addEventListener("mousedown", this._onDocMouseDown), d.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const n = this.state.columnDefs.findIndex((d) => d.field === e.field), r = this._runtimeOverrides[e.field] || {}, a = n >= 0 ? this.state.columnDefs[n] : null, o = a ? {
      ...a.hidden != null ? { hidden: a.hidden } : {},
      ...a.pinned ? { pinned: a.pinned } : {},
      ...a.width != null ? { width: a.width } : {}
    } : {}, l = { ...e, ...r, ...o, _headerEl: t };
    if (n >= 0) {
      const d = this.state.columnDefs[n];
      if (d._headerEl === t && on(d, l)) return;
      this.state.columnDefs[n] = l;
    } else
      this.state.columnDefs.push(l);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${W(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const n = this.state.sortModel.findIndex((a) => a.colId === e);
    let r;
    n === -1 ? r = { colId: e, sort: "asc" } : this.state.sortModel[n].sort === "asc" ? r = { colId: e, sort: "desc" } : r = null, t ? (n >= 0 && this.state.sortModel.splice(n, 1), r && this.state.sortModel.push(r)) : this.state.sortModel = r ? [r] : [], this.scheduleRender("sort"), S(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
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
    const n = this.state.selection;
    this.rowSelectionValue === "single" ? (n.clear(), n.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? n.has(e) ? n.delete(e) : n.add(e) : (n.clear(), n.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), S(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(n)
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
    const n = this._displayList.filteredSorted, r = n.findIndex((d) => this._rowId(d) === e), a = n.findIndex((d) => this._rowId(d) === t);
    if (r < 0 || a < 0) return;
    const [o, l] = r <= a ? [r, a] : [a, r];
    for (let d = o; d <= l; d++)
      !n[d].__sgGroup && !n[d].__sgSeparator && this.state.selection.add(this._rowId(n[d]));
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
    const e = Object.fromEntries(this.state.columnDefs.map((r) => [r.field, r])), t = this.state.columnDefs.filter((r) => !r.hidden && !r._isCheckbox);
    let n = ze(this.state.rowData, this.state.filterModel, e);
    return n = Ge(n, this.state.quickFilter, t), n.length;
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
  startEditingCell(e, t, n = void 0) {
    const r = this.state.columnDefs.find((o) => o.field === t);
    if (!r || !r.editable) return;
    const a = this.state.rowData.find((o) => this._rowId(o) === e);
    a && (this.state.editing = { rowId: e, colId: t, originalValue: I(a, r), initialValue: n }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: n, originalValue: r, draftValue: a } = this.state.editing, o = this._tbody.querySelector(`tr[data-row-id="${W(t)}"] td[data-col-id="${W(n)}"]`);
    let l = r;
    if (!e && o) {
      const d = o.querySelector("[data-editor-input]") || o.querySelector("input,select,textarea");
      d ? l = dn(d.value, this._colByField(n)?.type) : a !== void 0 && (l = a);
    }
    if (this.state.editing = null, !e && l !== r) {
      const d = this.state.rowData.find((h) => this._rowId(h) === t), c = d[n];
      d[n] = l, S(this.element, "grid:cellValueChanged", { rowId: t, colId: n, oldValue: c, newValue: l });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const n = this._colByField(e);
    n && (n.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), S(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const n = this._colByField(e);
    if (!n) return;
    const r = t || null;
    n.pinned = r, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: r }, this._reorderForPinning(), this.scheduleRender("columns"), S(this.element, "grid:columnPinned", { colId: e, pinned: r });
  }
  setColumnWidth(e, t) {
    const n = this._colByField(e);
    if (!n) return;
    const r = Math.max(n.minWidth || 40, Math.min(n.maxWidth || 4e3, t));
    n.width = r, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: r }, this.scheduleRender("columns"), S(this.element, "grid:columnResized", { colId: e, width: r });
  }
  moveColumn(e, t) {
    const n = this.state.columnDefs.findIndex((a) => a.field === e);
    if (n < 0 || n === t) return;
    const [r] = this.state.columnDefs.splice(n, 1);
    this.state.columnDefs.splice(t, 0, r), this.scheduleRender("columns"), S(this.element, "grid:columnMoved", { colId: e, fromIndex: n, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const n = W(e), r = this._thead?.querySelector(
      `th[data-header-cell-field-value="${n}"], th[data-field="${n}"]`
    ), a = Array.from(
      this._tbody?.querySelectorAll(`td[data-col-id="${n}"]`) || []
    ).filter((l) => !l.closest("tr")?.classList?.contains("sg-spacer"));
    let o = 0;
    if ((r || a.length) && (o = this._measureColumnContentWidth(r, a)), !o) {
      const l = (t.headerName || t.field || "").length, d = this.state.rowData.slice(0, 200);
      let c = l;
      for (const h of d) {
        const u = String(H(h, t) ?? "").length;
        u > c && (c = u);
      }
      o = c * 8;
    }
    this.setColumnWidth(e, Math.min(400, Math.max(60, o + 16)));
  }
  // Build an off-screen single-column <table table-layout:auto> with clones
  // of the header + a sample of body cells, mount it inside .sg-grid so
  // scoped CSS still applies, read the natural td widths, return the max.
  _measureColumnContentWidth(e, t, n = 50) {
    const r = document.createElement("table");
    r.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;table-layout:auto;width:auto;border-collapse:separate;border-spacing:0;";
    const a = document.createElement("tbody");
    r.appendChild(a);
    const o = (d) => {
      if (!d) return;
      const c = document.createElement("tr"), h = d.cloneNode(!0);
      h.removeAttribute("style"), c.appendChild(h), a.appendChild(c);
    };
    if (o(e), t.slice(0, n).forEach(o), !a.children.length) return 0;
    this.element.appendChild(r);
    let l = 0;
    for (const d of a.children) {
      const c = d.firstElementChild;
      c && c.offsetWidth > l && (l = c.offsetWidth);
    }
    return this.element.removeChild(r), l;
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), n = t.reduce((a, o) => a + (o.width || 150), 0);
    if (n === 0) return;
    const r = e / n;
    t.forEach((a) => {
      a.width = Math.max(a.minWidth || 40, Math.floor((a.width || 150) * r));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((r) => r.pinned === "left"), t = this.state.columnDefs.filter((r) => r.pinned === "right"), n = this.state.columnDefs.filter((r) => !r.pinned);
    this.state.columnDefs = [...e, ...n, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), S(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], n = [], r = [], a = new Map(this.state.rowData.map((o) => [this._rowId(o), o]));
    return (e.remove || []).forEach((o) => {
      const l = this._rowId(o);
      a.delete(l) && r.push(o);
    }), (e.update || []).forEach((o) => {
      const l = this._rowId(o);
      a.has(l) && (a.set(l, { ...a.get(l), ...o }), n.push(o));
    }), (e.add || []).forEach((o) => {
      const l = this._rowId(o);
      a.has(l) || (a.set(l, o), t.push(o));
    }), this.state.rowData = Array.from(a.values()), this.scheduleRender("data"), S(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: n, removed: r };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const n = this.state.columnDefs.filter((l) => !l.hidden && !l._isCheckbox), r = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((l) => !l.__sgGroup && !l.__sgDetail && !l.__sgSeparator), a = (l) => /[",\n\r]/.test(l) ? `"${String(l).replace(/"/g, '""')}"` : String(l), o = [n.map((l) => a(l.headerName || l.field)).join(e)];
    for (const l of r)
      o.push(n.map((d) => a(H(l, d))).join(e));
    return o.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const n = this.getDataAsCsv(t), r = new Blob([n], { type: "text/csv;charset=utf-8" }), a = URL.createObjectURL(r), o = g("a", { href: a, download: e });
    return document.body.appendChild(o), o.click(), o.remove(), URL.revokeObjectURL(a), n;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.has("tree") || e.size === 0) && (this._displayList = ns({
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
    const e = this._visibleCols(), t = ts(e, this._headerLayoutOpts());
    t.depth > 1 ? this._renderHeaderMultiRow(e, t) : this._renderHeaderSingleRow(e), this._renderColgroup(e);
  }
  // Aggregate the options we hand to buildHeaderLayout (auto-derived pivot
  // groups when in pivot mode, plus any user-declared columnGroups).
  _headerLayoutOpts() {
    const e = { columnGroups: this.columnGroupsValue || null };
    return this.state.pivot?.mode && this._displayList?.pivot && (e.pivotCols = (this.state.pivot.cols || []).map((t) => this._colByField(t)).filter(Boolean), e.valueConfigs = Object.entries(this.state.group.aggs || {}).map(([t, n]) => ({ col: this._colByField(t), aggFunc: n })).filter((t) => t.col)), e;
  }
  _renderColgroup(e) {
    let t = this._table.querySelector("colgroup");
    t || (t = g("colgroup"), this._table.insertBefore(t, this._thead));
    const n = Array.from(t.children);
    for (e.forEach((a, o) => {
      let l = n[o];
      l || (l = g("col"), t.appendChild(l)), l.style.width = a.width ? a.width + "px" : "";
    }); t.children.length > e.length; ) t.lastElementChild.remove();
    if (e.some((a) => !a.width))
      this._table.style.width = "100%";
    else {
      const a = e.reduce((l, d) => l + (Number(d.width) || 0), 0), o = this._viewport?.clientWidth || 0;
      if (o && a < o && e.length > 0) {
        const l = t.lastElementChild, d = Number(e[e.length - 1].width) || 0, c = a - d;
        l.style.width = o - c + "px", this._table.style.width = o + "px";
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
    })(), n = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((u) => {
      const p = u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field");
      p && n.set(p, u);
    });
    const r = new Set(e.map((u) => u.field)), a = this.state.columnDefs.filter((u) => !r.has(u.field)), o = [...e, ...a], l = Array.from(t.children).map((u) => u.getAttribute("data-header-cell-field-value") || u.getAttribute("data-field")).filter(Boolean), d = o.map((u) => u.field);
    if (l.length === d.length && l.every((u, p) => u === d[p]))
      Array.from(t.children).forEach((u) => {
        u.removeAttribute("rowspan"), u.removeAttribute("colspan");
      });
    else {
      const u = [];
      for (const p of o) {
        let f = n.get(p.field);
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
      p != null && (u.style.display = r.has(p) ? "" : "none");
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
    const n = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((c) => {
      const h = c.getAttribute("data-header-cell-field-value") || c.getAttribute("data-field");
      h && n.set(h, c);
    });
    const r = [], a = new Set(e.map((c) => c.field)), o = this._pinOffsets();
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
        let f = n.get(p.field);
        if (f || (f = g("th", {
          "data-field": p.field,
          "data-synth": "true"
        }, [g("div", { class: "sg-header-content" }, [
          g("span", { class: "sg-header-label" }, u.label || p.headerName || p.field || "")
        ])])), u.label) {
          const _ = f.querySelector(".sg-header-label");
          _ && _.textContent !== u.label && (_.textContent = u.label);
        }
        f.setAttribute("rowspan", String(u.rowspan)), f.removeAttribute("colspan"), f.style.display = "", h.appendChild(f), this._applyLeafThState(f, p, o);
      }
      r.push(h);
    }
    const l = /* @__PURE__ */ new Set();
    t.rows.forEach((c) => c.forEach((h) => {
      h.kind === "leaf" && l.add(h.col.field);
    }));
    const d = this.state.columnDefs.filter(
      (c) => !a.has(c.field) && !l.has(c.field)
    );
    if (d.length) {
      const c = g("tr", { class: "sg-hidden-header-row" });
      for (const h of d) {
        let u = n.get(h.field);
        u || (u = g("th", { "data-field": h.field, "data-synth": "true" })), u.removeAttribute("rowspan"), u.removeAttribute("colspan"), c.appendChild(u);
      }
      r.push(c);
    }
    this._thead.replaceChildren(...r);
  }
  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(e, t, n) {
    const r = this.state.sortModel.find((a) => a.colId === t.field);
    De(e, {
      "data-sortable": t.sortable ? "true" : null,
      "data-filterable": t.filter ? "true" : null,
      "data-filter-active": this.state.filterModel[t.field] ? "true" : null,
      "data-sort": r?.sort || null,
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
    }), t.width && (e.style.width = t.width + "px"), e.style.left = t.pinned === "left" ? n.left[t.field] + "px" : "", e.style.right = t.pinned === "right" ? n.right[t.field] + "px" : "", this._ensureHeaderChrome(e, t, r);
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
    return typeof t == "string" && rn.has(t) ? "right" : null;
  }
  _ensureHeaderChrome(e, t, n) {
    if (t._isRowNumber) {
      e.classList.add("sg-gutter-header"), e.textContent = "";
      return;
    }
    if (t._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let l = e.querySelector('input[type="checkbox"]');
      l || (l = g("input", { type: "checkbox", "aria-label": "Select all" }), l.addEventListener("change", (h) => {
        h.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(l));
      const d = this._displayList.filteredSorted.length, c = this.state.selection.size;
      l.checked = c > 0 && c >= d, l.indeterminate = c > 0 && c < d;
      return;
    }
    let r = e.querySelector(".sg-header-content");
    if (!r) {
      const l = e.textContent.trim();
      e.textContent = "", r = g("div", { class: "sg-header-content" }, [
        g("span", { class: "sg-header-label" }, l || t.headerName || t.field || "")
      ]), e.appendChild(r);
    }
    let a = r.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (a || (a = g("span", { class: "sg-sort-icon", "aria-hidden": "true" }), a.innerHTML = ae, r.appendChild(a)), n && this.state.sortModel.length > 1) {
        let l = r.querySelector(".sg-sort-index");
        l || (l = g("span", { class: "sg-sort-index" }), r.appendChild(l)), l.textContent = String(this.state.sortModel.indexOf(n) + 1);
      } else
        r.querySelector(".sg-sort-index")?.remove();
    else a && a.remove();
    let o = r.querySelector(".sg-filter-icon");
    t.filter ? o || (o = g("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), o.innerHTML = nn, r.appendChild(o)) : o && o.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(g("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._withDetailRows(this._displayList.pageRows);
    this._selKeys = this._computeCellSelKeys();
    const n = !this.masterDetailValue && (this.virtualValue || t.length > 200);
    let r = t, a = 0;
    if (n) {
      const u = this._viewport?.clientHeight || 400, p = this.state.rowHeight, f = is(this.state.scrollTop, u, p, t.length, 8);
      a = f.first, r = t.slice(f.first, f.last);
    }
    const o = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((u) => {
      const p = u.dataset.rowId;
      p != null && o.set(p, u);
    });
    const l = document.createDocumentFragment(), d = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0;
    let c = 0;
    for (let u = 0; u < a; u++) {
      const p = t[u];
      p && !p.__sgGroup && !p.__sgDetail && !p.__sgSeparator && (c += 1);
    }
    const h = (u) => !u || u.__sgGroup || u.__sgDetail || u.__sgSeparator ? null : (c += 1, d + c);
    if (n) {
      const u = this.state.rowHeight, p = a * u, f = (t.length - a - r.length) * u;
      l.appendChild(this._spacerRow(p, e.length)), r.forEach((_) => l.appendChild(this._buildRow(_, e, o, h(_)))), l.appendChild(this._spacerRow(f, e.length));
    } else
      r.forEach((u) => l.appendChild(this._buildRow(u, e, o, h(u))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && l.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(l);
  }
  _buildPinnedBottomRow(e) {
    const t = g("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), n = this._pinOffsets(), r = this._displayList.grandTotals || {};
    let a = !1;
    for (const o of e) {
      const l = g("td", { "data-col-id": o.field, "data-pinned": o.pinned || null });
      o.pinned === "left" ? l.style.left = n.left[o.field] + "px" : o.pinned === "right" && (l.style.right = n.right[o.field] + "px");
      const d = r[o.field];
      d != null ? (l.classList.add("sg-agg-cell"), l.textContent = this._formatAggregate(d)) : !a && !o._isCheckbox && !o._isRowNumber && (l.classList.add("sg-pinned-bottom-label"), l.textContent = "Total", a = !0), t.appendChild(l);
    }
    return t;
  }
  _buildRow(e, t, n, r) {
    if (e.__sgGroup) return this._buildGroupRow(e, t, n);
    if (e.__sgDetail) return this._buildDetailRow(e, t, n);
    if (e.__sgSeparator) return this._buildSeparatorRow(e, t, n);
    const a = String(this._rowId(e));
    let o = n.get(a);
    o || (o = g("tr")), o.dataset.rowId = a, o.classList.remove("sg-spacer");
    const l = this.state.selection.has(this._rowId(e)), d = this.masterDetailValue && this._isDetailExpanded(a);
    return De(o, {
      "data-selected": l ? "true" : null,
      "data-detail-expanded": d ? "true" : null
    }), this.masterDetailValue && o.classList.add("sg-master-row"), this._renderRow(o, e, t, r), o;
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
  _buildSeparatorRow(e, t, n) {
    const r = `__s:${e.__sgSeparatorId ?? this._separatorKey(e)}`;
    let a = n.get(r);
    a || (a = g("tr")), a.dataset.rowId = r, a.dataset.separator = "true", a.className = "", a.removeAttribute("data-selected"), a.removeAttribute("data-detail-expanded");
    const o = e.variant || (e.value != null ? "summary" : e.label != null ? "heading" : "blank");
    a.classList.add("sg-separator-row", `sg-separator-${o}`), e.className && a.classList.add(e.className), a.innerHTML = "";
    const l = (h) => h._isCheckbox || h._isRowNumber || h._isGroupCol || h._isMasterExpand, c = t.filter((h) => !l(h)).length || t.length || 1;
    for (const h of t) {
      if (l(h)) {
        const p = g("td", { "data-col-id": h.field, class: "sg-separator-gutter" });
        a.appendChild(p);
        continue;
      }
      const u = g("td", {
        "data-col-id": h.field,
        colspan: String(c),
        class: "sg-separator-cell"
      });
      this._renderSeparatorContent(u, e, o), a.appendChild(u);
      break;
    }
    return a;
  }
  _renderSeparatorContent(e, t, n) {
    if (n === "blank" || n === "divider")
      return;
    const r = g("div", { class: "sg-separator-content" });
    t.label != null && r.appendChild(g("span", { class: "sg-separator-label" }, String(t.label))), t.value != null && r.appendChild(g("span", { class: "sg-separator-value" }, String(t.value))), e.appendChild(r);
  }
  _separatorKey(e) {
    return [e.variant || "", e.label || "", e.value || ""].join("|");
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const r = g("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return r.style.height = "0px", r.appendChild(g("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), r;
    }
    const n = g("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return n.style.height = e + "px", n.appendChild(g("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), n;
  }
  _renderRow(e, t, n, r) {
    e.innerHTML = "";
    const a = this._pinOffsets(), o = this._selKeys || { active: null, range: null }, l = String(this._rowId(t)), d = this._displayList?.treeMeta, c = d ? d.get(l) : null, h = c ? this._treeDisplayColField() : null, u = t && t.__sgSpans || null;
    let p = 0;
    for (let f = 0; f < n.length; f++) {
      const _ = n[f];
      if (p > 0) {
        p -= 1;
        continue;
      }
      const y = _._isRowNumber || _._isCheckbox || _._isGroupCol || _._isMasterExpand, C = u && !y ? Number(u[_.field]) : 0, v = Math.max(1, Math.min(C || 1, n.length - f));
      v > 1 && (p = v - 1);
      const b = `${l}:${_.field}`, w = g("td", {
        "data-col-id": _.field,
        "data-pinned": _.pinned || null,
        "data-cell-active": o.active === b ? "true" : null,
        "data-cell-range": o.range && o.range.has(b) ? "true" : null,
        colspan: v > 1 ? String(v) : null
      });
      if (v > 1 && w.classList.add("sg-merged-cell"), _.pinned === "left" ? w.style.left = a.left[_.field] + "px" : _.pinned === "right" && (w.style.right = a.right[_.field] + "px"), _._isRowNumber) {
        w.classList.add("sg-gutter-cell"), w.setAttribute("data-gutter", "true"), w.removeAttribute("data-cell-active"), w.removeAttribute("data-cell-range"), w.textContent = r != null ? String(r) : "", e.appendChild(w);
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
          if (T?.focus(), k || T?.select?.(), T?.type && an.has(T.type))
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
      const n = g("span", {
        class: "sg-tree-chevron",
        "data-tree-toggle": "true",
        "data-expanded": t.expanded ? "true" : "false",
        "aria-hidden": "true"
      });
      n.innerHTML = ae, e.insertBefore(n, e.firstChild);
    } else {
      const n = g("span", { class: "sg-tree-chevron sg-tree-chevron-leaf", "aria-hidden": "true" });
      e.insertBefore(n, e.firstChild);
    }
  }
  _renderCellContent(e, t, n) {
    if (n.cellRenderer) {
      const r = Te(n.cellRenderer);
      if (r) {
        const o = I(t, n), l = H(t, n);
        (r.dataset.bind || r.dataset.bindText !== void 0) && (r.textContent = r.dataset.bind ? String(t[r.dataset.bind] ?? "") : l), r.dataset.bindAttr && r.setAttribute(r.dataset.bindAttr, o), r.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((d) => {
          d.dataset.bindText !== void 0 ? d.textContent = l : d.dataset.bind && (d.textContent = String(t[d.dataset.bind] ?? "")), d.dataset.bindAttr && d.setAttribute(d.dataset.bindAttr, o);
        }), e.appendChild(r);
        return;
      }
      const a = We(n.cellRenderer);
      if (typeof a == "function") {
        const o = I(t, n), l = H(t, n), d = a({ value: o, row: t, col: n, td: e, formatted: l, api: this.element.gridApi });
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
    e.textContent = H(t, n);
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
    for (const { field: n, aggFunc: r } of e || [])
      n && r && (t[n] = r);
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
        const t = new Map(this.state.columnDefs.map((r) => [r.field, r])), n = [];
        for (const r of e.cols) {
          const a = t.get(r.field);
          a && (r.width != null && (a.width = r.width), a.pinned = r.pinned || void 0, a.hidden = !!r.hidden, t.delete(r.field), n.push(a));
        }
        for (const r of t.values()) n.push(r);
        this.state.columnDefs = n;
      }
      if (Array.isArray(e.rowGroupCols) && (this.state.group.cols = e.rowGroupCols.slice()), e.pivot && typeof e.pivot == "object" && (this.state.pivot.cols = Array.isArray(e.pivot.cols) ? e.pivot.cols.slice() : [], this.state.pivot.mode = !!e.pivot.mode), Array.isArray(e.values)) {
        const t = {};
        for (const { field: n, aggFunc: r } of e.values) n && r && (t[n] = r);
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
    for (const t of Be) this.element.addEventListener(t, e);
    this._persistBeforeUnload = () => {
      this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
    }, window.addEventListener("beforeunload", this._persistBeforeUnload);
  }
  _teardownPersistence() {
    if (this._persistListener) {
      for (const e of Be) this.element.removeEventListener(e, this._persistListener);
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
  _buildGroupRow(e, t, n) {
    const r = `__g:${e.groupId}`;
    let a = n.get(r);
    return a || (a = g("tr")), a.dataset.rowId = r, a.dataset.group = "true", a.dataset.groupLevel = String(e.level), a.className = "sg-group-row", this._renderGroupRow(a, e, t), a;
  }
  _renderGroupRow(e, t, n) {
    e.innerHTML = "";
    const r = this._pinOffsets(), a = this._isGroupExpanded(t.groupId, t.level), o = (this.state.group.displayType || "singleColumn") === "singleColumn", l = !!(this.state.pivot?.mode && this._displayList?.pivot), d = t.__pivotAll === !0, c = n.filter((p) => !p._isRowNumber && !p._isCheckbox && !p._isGroupCol), h = c.some((p) => p.field === t.field) ? t.field : c[0]?.field, u = Math.max(0, t.level);
    d && e.classList.add("sg-pivot-all-row");
    for (const p of n) {
      const f = g("td", { "data-col-id": p.field, "data-pinned": p.pinned || null });
      if (p.pinned === "left" ? f.style.left = r.left[p.field] + "px" : p.pinned === "right" && (f.style.right = r.right[p.field] + "px"), p._isRowNumber || p._isCheckbox) {
        f.classList.add(p._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(f);
        continue;
      }
      if (l || o ? p._isGroupCol : p.field === h) {
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
      } else if (l && p._isPivot) {
        const y = I(t, p);
        y != null && (f.classList.add("sg-agg-cell"), f.textContent = this._formatAggregate(y));
      } else !p._isGroupCol && t.aggregates && t.aggregates[p.field] != null && (f.classList.add("sg-agg-cell"), f.textContent = this._formatAggregate(t.aggregates[p.field]));
      e.appendChild(f);
    }
  }
  _groupValueLabel(e) {
    const t = e.value;
    if (t == null || t === "") return "(Blanks)";
    const n = this._colByField(e.field);
    return n ? H({ [e.field]: t }, n) : String(t);
  }
  _formatAggregate(e) {
    return e == null ? "" : typeof e == "number" ? Number.isInteger(e) ? String(e) : String(Math.round(e * 100) / 100) : String(e);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, t) {
    if (e.cellEditor) {
      const r = Te(e.cellEditor);
      if (r) {
        const a = r.matches?.("input,select,textarea") ? r : r.querySelector?.("[data-editor-input]") || r.querySelector?.("input,select,textarea");
        return a && (this._seedEditorValue(a, e, t), a.addEventListener("keydown", this._onEditorKey), a.addEventListener("blur", this._onEditorBlur)), { node: r, control: a };
      }
    }
    const n = this._buildEditorInput(e, t);
    return { node: n, control: n };
  }
  _seedEditorValue(e, t, n) {
    if (t.type === "date" && n) {
      const r = n instanceof Date ? n : new Date(n);
      e.value = Number.isNaN(r?.getTime?.()) ? n ?? "" : r.toISOString().slice(0, 10);
    } else if (t.type === "datetime" && n) {
      const r = n instanceof Date ? n : new Date(n);
      if (Number.isNaN(r?.getTime?.()))
        e.value = n ?? "";
      else {
        const a = r.getTimezoneOffset() * 6e4;
        e.value = new Date(r.getTime() - a).toISOString().slice(0, 16);
      }
    } else t.type === "boolean" ? e.value = n === !0 ? "true" : n === !1 ? "false" : "" : e.value = n ?? "";
  }
  // Native input type per column `type`. HTML5 already covers most of what
  // the built-in renderers need (color picker, date picker, datetime-local
  // picker, native email/url/tel validation) — we just have to ask for the
  // right input type. Anything outside the known list falls through to a
  // plain text input, which is what cellEditor templates wrap when a column
  // wants something fancier.
  _buildEditorInput(e, t) {
    let n;
    if (e.type === "number") n = g("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const r = t instanceof Date ? t : t ? new Date(t) : null, a = r ? r.toISOString().slice(0, 10) : "";
      n = g("input", { type: "date", value: a });
    } else if (e.type === "datetime") {
      const r = t instanceof Date ? t : t ? new Date(t) : null;
      let a = "";
      if (r && !Number.isNaN(r.getTime())) {
        const o = r.getTimezoneOffset() * 6e4;
        a = new Date(r.getTime() - o).toISOString().slice(0, 16);
      }
      n = g("input", { type: "datetime-local", value: a });
    } else if (e.type === "color") {
      const r = /^#[0-9a-f]{6}$/i.test(String(t ?? "")) ? t : "#000000";
      n = g("input", { type: "color", value: r });
    } else e.type === "email" ? n = g("input", { type: "email", value: t ?? "" }) : e.type === "url" ? n = g("input", { type: "url", value: t ?? "" }) : e.type === "tel" ? n = g("input", { type: "tel", value: t ?? "" }) : e.type === "boolean" ? (n = g("select"), n.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : n = g("input", { type: "text", value: t ?? "" });
    return n.addEventListener("keydown", this._onEditorKey), n.addEventListener("blur", this._onEditorBlur), n;
  }
  _renderPagination() {
    this.state.pagination.enabled;
  }
  // ----- Status bar (rows · selection · range aggregates) -----
  _renderStatusBar() {
    if (!this._statusBar) return;
    const e = this._statusBar.querySelector(".sg-status-left"), t = this._statusBar.querySelector(".sg-status-right");
    e.replaceChildren();
    const n = this.state.serverSide ? this.state.serverRowCount : this.state.rowData.length, r = this._displayList.grouped ? this._displayList.leafCount ?? this.filteredCount() : this.filteredCount();
    e.appendChild(this._statusPanel(
      "Rows",
      this._fmtInt(r),
      r !== n ? `of ${this._fmtInt(n)}` : null
    ));
    const a = this.state.selection.size;
    a > 0 && e.appendChild(this._statusPanel("Selected", this._fmtInt(a))), t.replaceChildren();
    const o = this.getRangeAggregates();
    if (o && o.count > 0) {
      const d = (this.statusBarAggsValue || []).filter((c) => c in o);
      for (const c of d) {
        const h = o[c];
        h == null && c !== "count" || t.appendChild(this._statusPanel(this._aggLabel(c), this._fmtAgg(c, h)));
      }
    }
    const l = o ? `${o.count}|${o.sum}|${o.avg}|${o.min}|${o.max}` : "";
    l !== this._lastRangeAggs && (this._lastRangeAggs = l, S(this.element, "grid:rangeAggsChanged", { aggs: o }));
  }
  _statusPanel(e, t, n = null) {
    const r = g("div", { class: "sg-status-panel" });
    return r.append(
      g("span", { class: "sg-status-label" }, `${e}:`),
      g("span", { class: "sg-status-value" }, t)
    ), n && r.appendChild(g("span", { class: "sg-status-aside" }, n)), r;
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
      const n = this._rangeRect(t);
      if (n)
        for (let r = n.r0; r <= n.r1; r++) {
          const a = n.rows[r];
          if (!(!a || a.__sgGroup || a.__sgDetail || a.__sgSeparator))
            for (let o = n.c0; o <= n.c1; o++) {
              const l = n.cols[o];
              !l || l._isCheckbox || l._isRowNumber || l._isGroupCol || l._isMasterExpand || e.push(I(a, l));
            }
        }
    }
    return e;
  }
  getRangeAggregates() {
    return this.state.cellSel.ranges.length ? Wt(this._cellRangeRawValues()) : null;
  }
  _showColumnMenu(e, t, n) {
    this._closeColumnMenu();
    const r = this._columnMenuItems(e), a = g("div", { class: "sg-column-menu", role: "menu" });
    for (const d of r) {
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
    const o = a.offsetWidth || 220, l = a.offsetHeight || 280;
    a.style.left = `${Math.min(t, window.innerWidth - o - 4)}px`, a.style.top = `${Math.min(n, window.innerHeight - l - 4)}px`, this._columnMenu = a, setTimeout(() => {
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
    const t = this.element.gridApi, n = e.headerName || e.field, r = this.state.group.cols.includes(e.field), a = this.state.pivot.cols.includes(e.field), o = this.state.group.aggs[e.field], l = e.type === "number", d = [];
    if (e.pinned !== "left" && d.push({ label: "Pin left", action: () => t.setColumnPinned(e.field, "left") }), e.pinned !== "right" && d.push({ label: "Pin right", action: () => t.setColumnPinned(e.field, "right") }), e.pinned && d.push({ label: "Unpin", action: () => t.setColumnPinned(e.field, null) }), d.push("separator"), d.push({ label: "Autosize this column", action: () => t.autoSizeColumn(e.field) }), d.push({ label: "Autosize all columns", action: () => t.autoSizeAllColumns() }), d.push("separator"), d.push(r ? { label: `Ungroup ${n}`, action: () => t.removeRowGroupColumn(e.field) } : { label: `Group by ${n}`, action: () => t.addRowGroupColumn(e.field) }), d.push(a ? { label: `Remove ${n} from pivot`, action: () => t.removePivotColumn(e.field) } : { label: `Pivot by ${n}`, action: () => {
      t.isPivotMode() || t.setPivotMode(!0), t.addPivotColumn(e.field);
    } }), l || o) {
      d.push("separator");
      for (const c of ["sum", "avg", "count", "min", "max"])
        d.push({
          label: `Aggregate: ${c}`,
          active: o === c,
          action: () => t.addValueColumn(e.field, c)
        });
      o && d.push({ label: "Remove aggregation", action: () => t.removeValueColumn(e.field) });
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
    const t = e?.closest?.("td"), n = e?.closest?.("tr");
    if (!t || !n || n.dataset.group === "true" || n.dataset.separator === "true" || n.classList.contains("sg-detail-row") || t.classList.contains("sg-checkbox-cell") || t.classList.contains("sg-group-leaf-cell") || t.classList.contains("sg-master-expand-cell") || t.dataset.gutter === "true" || !t.dataset.colId) return null;
    const r = t.dataset.colId, a = this._colByField(r);
    return a && a.acceptFiles === !1 ? null : { td: t, tr: n, colId: r, rowId: this._coerceRowId(n.dataset.rowId), col: a };
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
    const a = this._coerceRowId(t.dataset.rowId), o = e.target.closest("td");
    if (e.target.matches('input[type="checkbox"]')) {
      this.toggleRowSelection(a, "toggle");
      return;
    }
    if (o && o.dataset.gutter === "true") {
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
    if (o) {
      const d = this.state.rowData.find((h) => this._rowId(h) === a), c = o.dataset.colId;
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
    const l = e.shiftKey ? "range" : e.metaKey || e.ctrlKey || this.rowMultiSelectWithClickValue ? "toggle" : "replace";
    this.toggleRowSelection(a, l), S(this.element, "grid:rowClicked", { rowId: a, row: this.state.rowData.find((d) => this._rowId(d) === a), event: e });
  }
  // ----- Cell selection (Numbers/Sheets-style: multi-range + active cell) -----
  _cellAt(e) {
    const t = e.closest?.("td"), n = e.closest?.("tr");
    return !t || !n || n.dataset.group === "true" || n.dataset.separator === "true" || n.classList.contains("sg-detail-row") || t.classList.contains("sg-checkbox-cell") || t.classList.contains("sg-group-leaf-cell") || t.classList.contains("sg-master-expand-cell") || t.dataset.gutter === "true" || !t.dataset.colId || t.dataset.editing === "true" ? null : { rowId: this._coerceRowId(n.dataset.rowId), colId: t.dataset.colId };
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
    const t = Array.from(this.state.selection).map(String), n = new Set(t.includes(String(e)) ? t : [String(e)]), r = g("div", { class: "sg-drag-ghost sg-grid" }), a = g("table"), o = g("tbody");
    let l = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((c) => {
      if (n.has(c.dataset.rowId) && l < 6) {
        const h = c.cloneNode(!0);
        h.removeAttribute("data-selected"), h.querySelectorAll("td").forEach((u) => {
          u.style.left = "", u.style.right = "", u.removeAttribute("data-pinned"), u.removeAttribute("data-cell-active"), u.removeAttribute("data-cell-range");
        }), o.appendChild(h), l += 1;
      }
    }), a.appendChild(o), r.appendChild(a), n.size > l && r.appendChild(g("div", { class: "sg-drag-ghost-more" }, `+${n.size - l} more rows`)), r.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(r);
    const d = g("div", { class: "sg-drop-indicator" });
    document.body.appendChild(d), this._rowDrag = { ids: n, ghost: r, indicator: d, dropRowId: null, dropBefore: !0 }, document.body.classList.add("sg-row-dragging");
  }
  _updateDropIndicator(e) {
    const t = Array.from(this._tbody.querySelectorAll("tr[data-row-id]"));
    let n = null, r = !0;
    for (const d of t) {
      const c = d.getBoundingClientRect();
      if (e < c.top + c.height / 2) {
        n = d, r = !0;
        break;
      }
      n = d, r = !1;
    }
    if (!n) return;
    const a = n.getBoundingClientRect(), o = this._viewport.getBoundingClientRect(), l = this._rowDrag.indicator;
    l.style.left = `${o.left}px`, l.style.width = `${o.width}px`, l.style.top = `${(r ? a.top : a.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(n.dataset.rowId), this._rowDrag.dropBefore = r;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: n, dropRowId: r, dropBefore: a } = this._rowDrag;
    if (t.remove(), n.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, r == null || e.has(String(r))) return;
    const o = this.state.rowData, l = o.filter((h) => e.has(String(this._rowId(h)))), d = o.filter((h) => !e.has(String(this._rowId(h))));
    let c = d.findIndex((h) => this._rowId(h) === r);
    c < 0 ? c = d.length : a || (c += 1), d.splice(c, 0, ...l), this.state.rowData = d, this.state.sortModel = [], this.scheduleRender("data"), S(this.element, "grid:rowDragEnd", {
      ids: l.map((h) => this._rowId(h)),
      toRowId: r,
      before: a
    });
  }
  // Toggle the active/range data-attrs on the existing cell DOM without
  // rebuilding the tbody (so in-flight mouse interactions aren't disrupted).
  _applyCellSelHighlight() {
    const e = this._computeCellSelKeys();
    this._selKeys = e, this._tbody && (this._tbody.querySelectorAll("td[data-col-id]").forEach((t) => {
      const n = t.parentElement, r = `${n && n.dataset.rowId}:${t.dataset.colId}`;
      e.active === r ? t.setAttribute("data-cell-active", "true") : t.removeAttribute("data-cell-active"), e.range && e.range.has(r) ? t.setAttribute("data-cell-range", "true") : t.removeAttribute("data-cell-range");
    }), this._renderStatusBar());
  }
  // Rectangle (display indices) for a {anchor,focus} range, or null.
  _rangeRect(e) {
    if (!e) return null;
    const t = this._displayList.pageRows, n = this._visibleCols(), r = (h) => t.findIndex((u) => this._rowId(u) === h), a = (h) => n.findIndex((u) => u.field === h), o = r(e.anchor.rowId), l = a(e.anchor.colId);
    if (o < 0 || l < 0) return null;
    const d = r(e.focus.rowId), c = a(e.focus.colId);
    return {
      r0: Math.min(o, d < 0 ? o : d),
      r1: Math.max(o, d < 0 ? o : d),
      c0: Math.min(l, c < 0 ? l : c),
      c1: Math.max(l, c < 0 ? l : c),
      rows: t,
      cols: n
    };
  }
  _activeRect() {
    return this._rangeRect(this.state.cellSel.ranges[this.state.cellSel.activeIdx]);
  }
  _cellRangeRows(e = this._activeRect()) {
    if (!e) return [];
    const t = [];
    for (let n = e.r0; n <= e.r1; n++) {
      const r = e.rows[n];
      if (!r) continue;
      const a = [];
      for (let o = e.c0; o <= e.c1; o++) {
        const l = e.cols[o];
        l && a.push(H(r, l));
      }
      t.push(a);
    }
    return t;
  }
  // Active cell key + union of all ranges' cells (active stays outlined, unfilled).
  _computeCellSelKeys() {
    const e = this._activeCell();
    if (!e) return { active: null, range: null };
    const t = `${e.rowId}:${e.colId}`, n = /* @__PURE__ */ new Set();
    for (const r of this.state.cellSel.ranges) {
      const a = this._rangeRect(r);
      if (a)
        for (let o = a.r0; o <= a.r1; o++) {
          const l = a.rows[o];
          if (l)
            for (let d = a.c0; d <= a.c1; d++) {
              const c = a.cols[d];
              if (!c) continue;
              const h = `${this._rowId(l)}:${c.field}`;
              h !== t && n.add(h);
            }
        }
    }
    return { active: t, range: n };
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
      const n = this._rangeRect(t);
      if (n)
        for (let r = n.r0; r <= n.r1; r++) {
          const a = n.rows[r];
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
  _moveActiveCell(e, t, n) {
    const r = this._displayList.pageRows, a = this._navCols();
    if (!r.length || !a.length) return;
    const o = (u, p, f) => Math.max(p, Math.min(u, f)), l = this._activeCell(), d = () => r.findIndex((u) => !u.__sgGroup && !u.__sgDetail && !u.__sgSeparator);
    let c = l ? r.findIndex((u) => this._rowId(u) === l.rowId) : d(), h = l ? a.findIndex((u) => u.field === l.colId) : 0;
    if (c < 0 && (c = d()), !(c < 0)) {
      if (h < 0 && (h = 0), n && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const u = this.state.cellSel.ranges[this.state.cellSel.activeIdx], p = o(r.findIndex((_) => this._rowId(_) === u.focus.rowId) + e, 0, r.length - 1), f = o(a.findIndex((_) => _.field === u.focus.colId) + t, 0, a.length - 1);
        this._extendActiveRange({ rowId: this._rowId(r[p]), colId: a[f].field });
      } else {
        let u = o(c + e, 0, r.length - 1);
        if (e !== 0) {
          for (; r[u] && (r[u].__sgGroup || r[u].__sgDetail || r[u].__sgSeparator); ) {
            const f = u + e;
            if (f < 0 || f >= r.length) break;
            u = f;
          }
          if (!r[u] || r[u].__sgGroup || r[u].__sgDetail || r[u].__sgSeparator) return;
        }
        const p = o(h + t, 0, a.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(r[u]), colId: a[p].field });
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
      const n = this._rangeRect(t);
      if (n)
        for (let r = n.r0; r <= n.r1; r++) {
          const a = n.rows[r];
          if (!(!a || a.__sgGroup || a.__sgDetail || a.__sgSeparator))
            for (let o = n.c0; o <= n.c1; o++) {
              const l = n.cols[o];
              if (!l || !l.editable || l._isCheckbox || l._isRowNumber) continue;
              const d = a[l.field];
              d === "" || d == null || (a[l.field] = "", e = !0, S(this.element, "grid:cellValueChanged", { rowId: this._rowId(a), colId: l.field, oldValue: d, newValue: "" }));
            }
        }
    }
    return e && this.scheduleRender("cells"), e;
  }
  _scrollActiveIntoView() {
    this._tbody?.querySelector('td[data-cell-active="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }
  _onBodyDblClick(e) {
    const t = e.target.closest("tr"), n = e.target.closest("td");
    if (!t || !n || n.dataset.editing === "true") return;
    const r = this._coerceRowId(t.dataset.rowId), a = n.dataset.colId;
    this.startEditingCell(r, a);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const n = this._visibleCols().filter((u) => u.editable && !u._isCheckbox), r = this._displayList.pageRows, a = r.findIndex((u) => this._rowId(u) === t.rowId), o = n.findIndex((u) => u.field === t.colId);
    if (!n.length || !r.length || a < 0 || o < 0) {
      this.stopEditing(!1);
      return;
    }
    const l = r.length * n.length, d = (a * n.length + o + e + l) % l, c = r[Math.floor(d / n.length)], h = n[d % n.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(c), h.field), requestAnimationFrame(() => {
      this._navigatingEditor = !1;
    });
  }
  // Wire editor listeners whenever a cell mounts an input.
  // Done lazily via MutationObserver on tbody (cheap because tbody is small per page).
  // ----- Helpers -----
  _visibleCols() {
    const e = this.state.columnDefs.filter((l) => !l.hidden), t = this.state.group?.cols || [], n = this.masterDetailValue && !this.state.pivot?.mode && !t.length;
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
      return n ? [this._masterExpandCol(), ...e] : e;
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
    const a = t.map((l) => e.find((d) => d.field === l)).filter(Boolean), o = new Set(a);
    return [...a, ...e.filter((l) => !o.has(l))];
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
    for (const n of e) {
      if (t.push(n), n.__sgGroup || n.__sgDetail || n.__sgSeparator) continue;
      const r = this._rowId(n);
      this._isDetailExpanded(r) && t.push({ __sgDetail: !0, master: n, masterId: r });
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
    const n = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    S(this.element, "grid:detailRowExpanded", { rowId: e, masterRow: n });
  }
  collapseDetailRow(e) {
    if (!this.masterDetailValue) return;
    const t = String(e);
    if (!this._detailExpanded.has(t)) return;
    this._detailExpanded.delete(t), this._detailGrids.delete(t), this.scheduleRender("cells");
    const n = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    S(this.element, "grid:detailRowCollapsed", { rowId: e, masterRow: n });
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
    const t = String(e), n = this._isTreeRowExpanded(t, 0);
    this._treeExpanded.set(t, !n), this.scheduleRender("tree");
    const r = this.state.rowData.find((a) => String(this._rowId(a)) === t);
    S(this.element, n ? "grid:treeRowCollapsed" : "grid:treeRowExpanded", { rowId: e, row: r });
  }
  expandTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !0), this.scheduleRender("tree");
    const n = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    S(this.element, "grid:treeRowExpanded", { rowId: e, row: n });
  }
  collapseTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (!this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !1), this.scheduleRender("tree");
    const n = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    S(this.element, "grid:treeRowCollapsed", { rowId: e, row: n });
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
    return e || this._visibleCols().find((r) => !r._isCheckbox && !r._isRowNumber && !r._isGroupCol && !r._isMasterExpand)?.field || null;
  }
  // Build the detail <tr>: one cell spanning the full visible width, holding a
  // padded shell that hosts either a cloned <template> or a default summary
  // pulled from the master row.
  _buildDetailRow(e, t, n) {
    const r = `__d:${e.masterId}`;
    let a = n.get(r);
    const o = String(e.masterId);
    if (a) {
      if (a.getAttribute("data-master-id") === o)
        return a.classList.remove("sg-spacer"), a;
      a = null;
    }
    a || (a = g("tr")), a.className = "sg-detail-row", a.dataset.rowId = r, a.setAttribute("data-master-id", o), a.innerHTML = "";
    const l = g("td", { colspan: String(t.length || 1), class: "sg-detail-cell" }), d = g("div", { class: "sg-detail-shell" });
    return d.style.minHeight = `${this.detailRowHeightValue}px`, l.appendChild(d), a.appendChild(l), this._populateDetailShell(d, e.master, e.masterId), a;
  }
  // Fill the detail shell. Strategy: if the grid has a detail-template value
  // pointing at an existing <template>, clone its content and run a tiny
  // data-bind pass keyed off the master row. Otherwise render a minimal
  // fallback so the panel still appears (handy when the user is wiring up
  // their first detail panel and hasn't authored a template yet).
  _populateDetailShell(e, t, n) {
    const r = this.detailTemplateValue;
    let a;
    if (r) {
      const l = document.getElementById(r);
      if (l && l.tagName === "TEMPLATE") {
        const d = l.content.cloneNode(!0);
        this._applyDetailBindings(d, t), e.appendChild(d), a = e;
      }
    }
    if (!a) {
      const l = g("div", { class: "sg-detail-fallback" }), d = Object.keys(t || {}).filter((c) => !c.startsWith("_") && !c.startsWith("__")).slice(0, 6);
      for (const c of d)
        l.append(
          g("span", { class: "sg-detail-fallback-label" }, `${c}: `),
          g("span", { class: "sg-detail-fallback-value" }, String(t[c] ?? "")),
          g("span", { class: "sg-detail-fallback-sep" }, "  ·  ")
        );
      l.lastElementChild?.remove(), e.appendChild(l);
    }
    const o = e.querySelector('[data-controller~="grid"]');
    o && this._seedNestedGrid(o, t, n), queueMicrotask(() => {
      S(this.element, "grid:detailRowMounted", {
        rowId: n,
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
    e.querySelectorAll("[data-detail-bind], [data-detail-bind-attr], [data-detail-if]").forEach((r) => {
      if (r.hasAttribute("data-detail-if")) {
        const a = r.getAttribute("data-detail-if");
        if (!t[a]) {
          r.remove();
          return;
        }
      }
      if (r.hasAttribute("data-detail-bind")) {
        const a = r.getAttribute("data-detail-bind");
        r.textContent = t[a] == null ? "" : String(t[a]);
      }
      if (r.hasAttribute("data-detail-bind-attr")) {
        const a = r.getAttribute("data-detail-bind-attr"), [o, l] = a.split(":");
        o && l && r.setAttribute(o, t[l] == null ? "" : String(t[l]));
      }
    });
  }
  // Seed a nested grid with the master row's detail rows before its controller
  // boots, so its first render shows the right data without an extra round
  // through scheduleRender. Cache the inner gridApi once it appears so the
  // outer grid can refresh it later if the master data is updated.
  _seedNestedGrid(e, t, n) {
    const r = this.detailRowsKeyValue;
    if (r) {
      const a = t?.[r];
      if (Array.isArray(a))
        try {
          e.setAttribute("data-grid-row-data-value", JSON.stringify(a));
        } catch {
        }
    }
    queueMicrotask(() => {
      e.gridApi && this._detailGrids.set(String(n), e.gridApi);
    });
  }
  _pinOffsets() {
    const e = this._visibleCols(), t = {};
    let n = 0;
    for (const a of e)
      a.pinned === "left" && (t[a.field] = n, n += a.width || 150);
    const r = {};
    n = 0;
    for (let a = e.length - 1; a >= 0; a--) {
      const o = e[a];
      o.pinned === "right" && (r[o.field] = n, n += o.width || 150);
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
D(xe, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: Fe },
  rowHeight: { type: Number, default: sn },
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
function on(s, i) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (s[t] !== i[t]) return !1;
  return !0;
}
function ln(s) {
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
function dn(s, i) {
  if (i === "number") {
    const e = Number(s);
    return Number.isFinite(e) ? e : s;
  }
  if (i === "date") return s;
  if (i === "datetime") {
    if (!s) return s;
    const e = new Date(s);
    return Number.isNaN(e.getTime()) ? s : e.toISOString();
  }
  return i === "boolean" ? s === "true" ? !0 : s === "false" ? !1 : null : s;
}
function W(s) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(s)) : String(s).replace(/["\\\n\r]/g, (i) => "\\" + i);
}
class Le extends O {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    D(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, n = e.clientY;
      let r = !1;
      const a = (l) => {
        const d = Math.abs(l.clientX - t), c = Math.abs(l.clientY - n);
        !r && (d > 5 || c > 5) && (r = !0, document.removeEventListener("mousemove", a), document.removeEventListener("mouseup", o), this._beginReorder(t));
      }, o = (l) => {
        document.removeEventListener("mousemove", a), document.removeEventListener("mouseup", o), r || this.sort(l);
      };
      document.addEventListener("mousemove", a), document.addEventListener("mouseup", o);
    });
  }
  connect() {
    if (this.grid = as(this.element, "grid", this.application), !!this.grid) {
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
    const t = this.element.parentElement, n = Array.from(t.children), r = n.indexOf(this.element);
    let a = r;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const o = (d) => {
      const c = d.clientX;
      let h = n.length;
      for (let u = 0; u < n.length; u++) {
        const p = n[u].getBoundingClientRect();
        if (c < p.left + p.width / 2) {
          h = u;
          break;
        }
      }
      a = h > r ? h - 1 : h;
    }, l = () => {
      document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", l), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", a !== r && this.grid.moveColumn(this.fieldValue, a);
    };
    document.addEventListener("mousemove", o), document.addEventListener("mouseup", l);
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
    const t = e.clientX, n = this.element.offsetWidth, r = (o) => this.grid.setColumnWidth(this.fieldValue, n + (o.clientX - t)), a = () => {
      document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", a), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", r), document.addEventListener("mouseup", a), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
D(Le, "values", {
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
class Vt extends O {
  connect() {
  }
}
class It extends O {
  connect() {
  }
}
class Nt extends O {
  connect() {
  }
}
class fe extends O {
  constructor() {
    super(...arguments);
    D(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), n = e.paginationGetTotalPages(), r = e.paginationGetRowCount(), a = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const o = r === 0 ? 0 : t * a + 1, l = Math.min(r, o + a - 1);
        this.pageInfoTarget.textContent = r === 0 ? "0 rows" : `${o}–${l} of ${r}`;
      }
      this.hasFirstTarget && (this.firstTarget.disabled = t === 0), this.hasPrevTarget && (this.prevTarget.disabled = t === 0), this.hasNextTarget && (this.nextTarget.disabled = t >= n - 1), this.hasLastTarget && (this.lastTarget.disabled = t >= n - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(a));
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
const ye = ["sum", "avg", "count", "min", "max"], cn = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', un = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class Pt extends O {
  connect() {
    this.grid = this.element.closest(".sg-grid"), this._activeTab = "columns", this._collapsed = !1, this._build(), this.grid?.gridApi ? this._render() : this.grid && this.grid.addEventListener("grid:ready", () => this._render(), { once: !0 }), this._gridListener = () => this._render();
    for (const i of [
      "grid:columnRowGroupChanged",
      "grid:columnPivotChanged",
      "grid:columnValueChanged",
      "grid:pivotModeChanged",
      "grid:columnVisible",
      "grid:rowDataChanged",
      "grid:columnStateApplied"
    ]) this.grid?.addEventListener(i, this._gridListener);
  }
  disconnect() {
    if (!(!this.grid || !this._gridListener))
      for (const i of [
        "grid:columnRowGroupChanged",
        "grid:columnPivotChanged",
        "grid:columnValueChanged",
        "grid:pivotModeChanged",
        "grid:columnVisible",
        "grid:rowDataChanged",
        "grid:columnStateApplied"
      ]) this.grid.removeEventListener(i, this._gridListener);
  }
  // ----- Skeleton -----
  _build() {
    this.element.innerHTML = "", this._content = g("div", { class: "sg-side-panel-content" });
    const i = g("div", { class: "sg-side-panel-tabs" });
    this._columnsTab = g("button", {
      type: "button",
      class: "sg-side-panel-tab",
      "aria-pressed": "true",
      title: "Columns"
    }), this._columnsTab.innerHTML = cn, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), i.appendChild(this._columnsTab), this.element.append(this._content, i);
  }
  _onTabClick(i) {
    this._activeTab === i && !this._collapsed ? (this._collapsed = !0, this.element.classList.add("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", "false")) : (this._collapsed = !1, this._activeTab = i, this.element.classList.remove("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", i === "columns" ? "true" : "false"), this._render());
  }
  // ----- Helpers -----
  _api() {
    return this.grid?.gridApi;
  }
  // Real (non-synthetic) columns the user can manipulate.
  _columns() {
    return (this._api()?.getColumnDefs() || []).filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol && !e._isPivot);
  }
  _colByField(i) {
    return (this._api()?.getColumnDefs() || []).find((e) => e.field === i);
  }
  // ----- Render -----
  _render() {
    if (this._collapsed || this._activeTab !== "columns") return;
    const i = this._api();
    if (!i) return;
    this._content.innerHTML = "";
    const e = g("label", { class: "sg-panel-pivot-toggle" }), t = g("input", { type: "checkbox" });
    t.checked = i.isPivotMode(), t.addEventListener("change", () => i.setPivotMode(t.checked)), e.append(t, g("span", {}, "Pivot mode")), this._content.appendChild(e), this._content.appendChild(this._renderColumnsList()), this._content.appendChild(this._renderDropSection({
      title: "Row Groups",
      placeholder: "Drag here to group rows",
      kind: "rowGroup",
      fields: i.getRowGroupColumns()
    })), this._content.appendChild(this._renderValuesSection()), i.isPivotMode() && this._content.appendChild(this._renderDropSection({
      title: "Column Labels",
      placeholder: "Drag here to pivot columns",
      kind: "pivot",
      fields: i.getPivotColumns()
    }));
  }
  _renderColumnsList() {
    const i = this._api(), e = g("div", { class: "sg-panel-section" });
    e.appendChild(g("div", { class: "sg-panel-section-title" }, "Columns"));
    const t = g("ul", { class: "sg-column-list" });
    e.appendChild(t);
    const n = new Set(i.getRowGroupColumns()), r = new Set(i.getPivotColumns()), a = new Map(i.getValueColumns().map((o) => [o.field, o.aggFunc]));
    for (const o of this._columns()) {
      const l = g("li", { class: "sg-column-list-item", draggable: "true" });
      l.dataset.field = o.field;
      const d = g("span", { class: "sg-column-grip", "aria-hidden": "true" });
      d.innerHTML = un;
      const c = g("input", { type: "checkbox" });
      c.checked = !o.hidden, c.addEventListener("change", () => i.setColumnVisible(o.field, c.checked));
      const h = g("span", { class: "sg-column-list-label" }, o.headerName || o.field), u = g("span", { class: "sg-column-list-tags" });
      n.has(o.field) && u.appendChild(g("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), r.has(o.field) && u.appendChild(g("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), a.has(o.field) && u.appendChild(g("span", { class: "sg-tag sg-tag-value", title: `Value (${a.get(o.field)})` }, a.get(o.field))), l.append(d, c, h, u), this._wireDragSource(l, o.field), t.appendChild(l);
    }
    return this._wireDropZone(t, "columns"), e;
  }
  _renderDropSection({ title: i, placeholder: e, kind: t, fields: n }) {
    const r = g("div", { class: "sg-panel-section sg-panel-drop" });
    r.appendChild(g("div", { class: "sg-panel-section-title" }, i));
    const a = g("div", { class: "sg-drop-zone" });
    if (a.dataset.dropKind = t, !n.length)
      a.classList.add("sg-drop-zone-empty"), a.appendChild(g("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const o of n) a.appendChild(this._renderChip(t, o));
    return this._wireDropZone(a, t), r.appendChild(a), r;
  }
  _renderValuesSection() {
    const i = this._api(), e = g("div", { class: "sg-panel-section sg-panel-drop" });
    e.appendChild(g("div", { class: "sg-panel-section-title" }, "Values"));
    const t = g("div", { class: "sg-drop-zone" });
    t.dataset.dropKind = "value";
    const n = i.getValueColumns();
    if (!n.length)
      t.classList.add("sg-drop-zone-empty"), t.appendChild(g("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
    else
      for (const { field: r, aggFunc: a } of n) t.appendChild(this._renderValueChip(r, a));
    return this._wireDropZone(t, "value"), e.appendChild(t), e;
  }
  _renderChip(i, e) {
    const t = this._colByField(e), n = g("span", { class: "sg-chip", draggable: "true" });
    return n.dataset.field = e, n.dataset.fromKind = i, n.append(
      g("span", { class: "sg-chip-label" }, t?.headerName || e),
      this._removeButton(() => this._removeFrom(i, e))
    ), this._wireDragSource(n, e), n;
  }
  _renderValueChip(i, e) {
    const t = this._api(), n = this._colByField(i), r = g("span", { class: "sg-chip sg-chip-value", draggable: "true" });
    r.dataset.field = i, r.dataset.fromKind = "value";
    const a = g("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return a.addEventListener("click", (o) => {
      o.stopPropagation();
      const l = ye.indexOf(e), d = ye[(l === -1 ? 0 : l + 1) % ye.length];
      t.setColumnAggFunc(i, d);
    }), r.append(
      a,
      g("span", { class: "sg-chip-label" }, n?.headerName || i),
      this._removeButton(() => t.removeValueColumn(i))
    ), this._wireDragSource(r, i), r;
  }
  _removeButton(i) {
    const e = g("button", { type: "button", class: "sg-chip-remove", "aria-label": "Remove", title: "Remove" });
    return e.textContent = "×", e.addEventListener("click", (t) => {
      t.stopPropagation(), i();
    }), e;
  }
  // ----- DnD plumbing -----
  _wireDragSource(i, e) {
    i.addEventListener("dragstart", (t) => {
      t.dataTransfer.effectAllowed = "move", t.dataTransfer.setData("text/plain", e), i.classList.add("sg-dragging");
    }), i.addEventListener("dragend", () => i.classList.remove("sg-dragging"));
  }
  _wireDropZone(i, e) {
    i.addEventListener("dragover", (t) => {
      t.preventDefault(), t.dataTransfer.dropEffect = "move", i.classList.add("sg-drop-over");
    }), i.addEventListener("dragleave", (t) => {
      t.target === i && i.classList.remove("sg-drop-over");
    }), i.addEventListener("drop", (t) => {
      t.preventDefault(), i.classList.remove("sg-drop-over");
      const n = t.dataTransfer.getData("text/plain");
      n && this._handleDrop(e, n);
    });
  }
  // A field lives in at most one of {rowGroup, pivot, value} at a time.
  // Dropping on a zone removes it from the others first.
  _handleDrop(i, e) {
    const t = this._api();
    if (i === "columns") {
      this._removeEverywhere(e);
      return;
    }
    this._removeEverywhere(e, i), i === "rowGroup" ? t.addRowGroupColumn(e) : i === "pivot" ? t.addPivotColumn(e) : i === "value" && t.addValueColumn(e, "sum");
  }
  _removeFrom(i, e) {
    const t = this._api();
    i === "rowGroup" ? t.removeRowGroupColumn(e) : i === "pivot" ? t.removePivotColumn(e) : i === "value" && t.removeValueColumn(e);
  }
  _removeEverywhere(i, e = null) {
    const t = this._api();
    e !== "rowGroup" && t.removeRowGroupColumn(i), e !== "pivot" && t.removePivotColumn(i), e !== "value" && t.removeValueColumn(i);
  }
}
function hn(s) {
  const i = s ?? $t.start();
  return i.register("grid", xe), i.register("header-cell", Le), i.register("row", Vt), i.register("cell", It), i.register("filter", Nt), i.register("pagination", fe), i.register("side-panel", Pt), i;
}
const pn = {
  start: hn,
  GridController: xe,
  HeaderCellController: Le,
  RowController: Vt,
  CellController: It,
  FilterController: Nt,
  PaginationController: fe,
  SidePanelController: Pt,
  registerRenderer: M,
  getRenderer: We,
  listRenderers: os,
  renderers: tn
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = pn);
export {
  It as CellController,
  Nt as FilterController,
  xe as GridController,
  Le as HeaderCellController,
  fe as PaginationController,
  Vt as RowController,
  Pt as SidePanelController,
  pn as default,
  We as getRenderer,
  os as listRenderers,
  M as registerRenderer,
  tn as renderers,
  hn as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
