var us = Object.defineProperty;
var hs = (n, i, e) => i in n ? us(n, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[i] = e;
var N = (n, i, e) => hs(n, typeof i != "symbol" ? i + "" : i, e);
import { Controller as q, Application as ps } from "@hotwired/stimulus";
function V(n, i) {
  return typeof i.valueGetter == "function" ? i.valueGetter(n) : n?.[i.field];
}
function G(n, i) {
  const e = V(n, i);
  return typeof i.valueFormatter == "function" ? i.valueFormatter(e, n) : e == null ? "" : i.type === "date" && e instanceof Date ? e.toLocaleDateString() : i.type === "boolean" ? e ? "✓" : "" : String(e);
}
const Ze = {
  contains: (n, i) => String(n ?? "").toLowerCase().includes(String(i ?? "").toLowerCase()),
  notContains: (n, i) => !String(n ?? "").toLowerCase().includes(String(i ?? "").toLowerCase()),
  equals: (n, i) => String(n ?? "").toLowerCase() === String(i ?? "").toLowerCase(),
  notEqual: (n, i) => String(n ?? "").toLowerCase() !== String(i ?? "").toLowerCase(),
  startsWith: (n, i) => String(n ?? "").toLowerCase().startsWith(String(i ?? "").toLowerCase()),
  endsWith: (n, i) => String(n ?? "").toLowerCase().endsWith(String(i ?? "").toLowerCase()),
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
}, fs = {
  equals: (n, i) => Number(n) === Number(i),
  notEqual: (n, i) => Number(n) !== Number(i),
  lessThan: (n, i) => Number(n) < Number(i),
  lessThanOrEqual: (n, i) => Number(n) <= Number(i),
  greaterThan: (n, i) => Number(n) > Number(i),
  greaterThanOrEqual: (n, i) => Number(n) >= Number(i),
  inRange: (n, i, e) => Number(n) >= Number(i) && Number(n) <= Number(e),
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
};
function F(n) {
  if (n == null || n === "") return null;
  if (n instanceof Date) return n;
  const i = new Date(n);
  return Number.isNaN(i.valueOf()) ? null : i;
}
const gs = {
  equals: (n, i) => F(n)?.toDateString() === F(i)?.toDateString(),
  notEqual: (n, i) => F(n)?.toDateString() !== F(i)?.toDateString(),
  lessThan: (n, i) => (F(n)?.valueOf() ?? -1 / 0) < (F(i)?.valueOf() ?? 1 / 0),
  greaterThan: (n, i) => (F(n)?.valueOf() ?? 1 / 0) > (F(i)?.valueOf() ?? -1 / 0),
  inRange: (n, i, e) => {
    const t = F(n)?.valueOf();
    return t != null && t >= (F(i)?.valueOf() ?? -1 / 0) && t <= (F(e)?.valueOf() ?? 1 / 0);
  },
  blank: (n) => n == null || n === "",
  notBlank: (n) => n != null && n !== ""
}, ms = {
  equals: (n, i) => i === "true" ? !!n : i === "false" ? !n : !0
}, _s = {
  in: (n, i) => Array.isArray(i) && i.includes(String(n ?? ""))
}, bs = { text: Ze, number: fs, date: gs, boolean: ms, set: _s };
function Je(n, i, e) {
  if (!e) return !0;
  const t = e.filterType || i.filter || "text", r = (bs[t] || Ze)[e.type];
  if (!r) return !0;
  const o = V(n, i);
  return r(o, e.value, e.value2);
}
function et(n, i, e) {
  const t = Object.entries(i || {}).filter(([, s]) => s != null);
  return t.length === 0 ? n : n.filter((s) => s && s.__sgSeparator ? !0 : t.every(([r, o]) => {
    const a = e[r];
    return a ? Je(s, a, o) : !0;
  }));
}
function tt(n, i, e) {
  if (!i) return n;
  const t = String(i).toLowerCase();
  return n.filter((s) => {
    if (s && s.__sgSeparator) return !0;
    for (const r of e) {
      const o = G(s, r);
      if (o && String(o).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function j(n, i, e) {
  if (n == null && i == null) return 0;
  if (n == null) return -1;
  if (i == null) return 1;
  if (e === "number") return Number(n) - Number(i);
  if (e === "date") {
    const t = F(n)?.valueOf() ?? 0, s = F(i)?.valueOf() ?? 0;
    return t - s;
  }
  return e === "boolean" ? n === i ? 0 : n ? 1 : -1 : String(n).localeCompare(String(i), void 0, { numeric: !0, sensitivity: "base" });
}
function vs(n, i, e) {
  if (!i || i.length === 0) return n;
  const t = (l, d) => {
    for (const { colId: c, sort: u } of i) {
      const h = e[c];
      if (!h) continue;
      const p = V(l, h), g = V(d, h), b = typeof h.comparator == "function" ? h.comparator(p, g, l, d) : j(p, g, h.type);
      if (b !== 0) return u === "desc" ? -b : b;
    }
    return 0;
  };
  if (!n.some((l) => l && l.__sgSeparator)) return n.slice().sort(t);
  const r = [];
  let o = [];
  const a = () => {
    if (o.length) {
      o.sort(t);
      for (const l of o) r.push(l);
      o = [];
    }
  };
  for (const l of n)
    l && l.__sgSeparator ? (a(), r.push(l)) : o.push(l);
  return a(), r;
}
function re(n, i) {
  if (!i || !i.enabled) return { rows: n, total: n.length, pageRows: n };
  const e = n.length, t = Math.max(1, Math.ceil(e / i.pageSize)), s = Math.min(i.page, t - 1), r = s * i.pageSize, o = n.slice(r, r + i.pageSize);
  return { rows: n, total: e, totalPages: t, page: s, pageRows: o };
}
function st(n, i, e) {
  if (n === "count") return i.length;
  const t = i.map((r) => V(r, e));
  if (n === "first") return t.length ? t[0] : null;
  if (n === "last") return t.length ? t[t.length - 1] : null;
  const s = t.map(Number).filter((r) => !Number.isNaN(r));
  switch (n) {
    case "sum":
      return s.reduce((r, o) => r + o, 0);
    case "avg":
      return s.length ? s.reduce((r, o) => r + o, 0) / s.length : null;
    case "min":
      return s.length ? Math.min(...s) : null;
    case "max":
      return s.length ? Math.max(...s) : null;
    default:
      return null;
  }
}
function de(n, i, e) {
  const t = {};
  for (const [s, r] of Object.entries(i || {})) {
    const o = e[s];
    o && (t[s] = st(r, n, o));
  }
  return t;
}
function ys(n) {
  let i = 0, e = 0, t = 0, s = 1 / 0, r = -1 / 0;
  for (const o of n) {
    if (o == null || o === "") continue;
    i += 1;
    let a = null;
    if (typeof o == "number" && Number.isFinite(o)) a = o;
    else if (typeof o == "string" && o.trim() !== "") {
      const l = Number(o);
      Number.isFinite(l) && (a = l);
    }
    a != null && (e += 1, t += a, a < s && (s = a), a > r && (r = a));
  }
  return {
    count: i,
    sum: e ? t : null,
    avg: e ? t / e : null,
    min: e ? s : null,
    max: e ? r : null
  };
}
function ws(n, i, e, t, s = () => !0) {
  const r = (d, c, u) => {
    const h = i[c], p = /* @__PURE__ */ new Map();
    for (const g of d) {
      const b = V(g, h), v = b == null ? "" : String(b);
      p.has(v) || p.set(v, { value: b, rows: [] }), p.get(v).rows.push(g);
    }
    return Array.from(p.values()).sort((g, b) => j(g.value, b.value, h.type)).map(({ value: g, rows: b }) => {
      const v = g == null ? "" : String(g), S = u ? `${u}|${h.field}=${v}` : `${h.field}=${v}`;
      return {
        __sgGroup: !0,
        level: c,
        field: h.field,
        value: g,
        groupId: S,
        count: b.length,
        aggregates: de(b, t, e),
        leaves: b,
        children: c + 1 < i.length ? r(b, c + 1, S) : null
      };
    });
  }, o = r(n, 0, ""), a = [], l = (d) => {
    for (const c of d)
      if (a.push(c), !!s(c.groupId, c.level))
        if (c.children) l(c.children);
        else for (const u of c.leaves) a.push(u);
  };
  return l(o), { displayList: a, tree: o };
}
function nt(n, i, e) {
  return `__p|${e.map((s) => {
    const r = n[s.field];
    return `${s.field}=${r == null ? "" : String(r)}`;
  }).join("|")}|${i.col.field}:${i.aggFunc}`;
}
function it(n, i) {
  return i.map((e) => {
    const t = V(n, e);
    return t == null ? "" : String(t);
  }).join("");
}
function Cs(n, i) {
  if (!i?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const t of n) {
    const s = it(t, i);
    if (!e.has(s)) {
      const r = {};
      i.forEach((o) => {
        const a = V(t, o);
        r[o.field] = a ?? null;
      }), e.set(s, r);
    }
  }
  return Array.from(e.values()).sort((t, s) => {
    for (const r of i) {
      const o = j(t[r.field], s[r.field], r.type);
      if (o !== 0) return o;
    }
    return 0;
  });
}
function Ss(n, i, e) {
  if (!n.length || !i.length) return [];
  const t = [], s = i.length === 1;
  for (const r of n)
    for (const o of i) {
      const a = nt(r, o, e), l = e.map((c) => r[c.field] == null ? "(Blank)" : String(r[c.field])).join(" · "), d = s ? l : `${l} · ${o.aggFunc}(${o.col.field})`;
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
        valueField: o.col.field,
        aggFunc: o.aggFunc,
        valueGetter: (c) => c?.__pivotValues?.[a] ?? null
      });
    }
  return t;
}
function xs(n) {
  return typeof n == "string" && n.startsWith("__p|");
}
function Ls(n, i) {
  const e = Array.isArray(n) ? n.filter((t) => t && t.colId && t.sort) : [];
  return (t, s) => {
    for (const r of e) {
      const o = r.sort === "desc" ? -1 : 1;
      if (xs(r.colId)) {
        const a = t.__pivotValues ? t.__pivotValues[r.colId] : null, l = s.__pivotValues ? s.__pivotValues[r.colId] : null, d = j(a, l, "number");
        if (d !== 0) return o * d;
        continue;
      }
      if (i && r.colId === i.field) {
        const a = j(t.value, s.value, i.type);
        if (a !== 0) return o * a;
        continue;
      }
    }
    return j(t.value, s.value, i?.type);
  };
}
function Pe(n, i, e, t) {
  const s = {}, r = /* @__PURE__ */ new Map();
  for (const o of n) {
    const a = it(o, t);
    r.has(a) || r.set(a, []), r.get(a).push(o);
  }
  for (const o of i) {
    const a = t.map((d) => {
      const c = o[d.field];
      return c == null ? "" : String(c);
    }).join(""), l = r.get(a) || [];
    for (const d of e) {
      const c = nt(o, d, t);
      s[c] = l.length ? st(d.aggFunc, l, d.col) : null;
    }
  }
  return s;
}
function As({ rows: n, rowGroupCols: i = [], pivotCols: e, valueConfigs: t, isExpanded: s = () => !0, sortModel: r = [] }) {
  const o = Cs(n, e), a = Ss(o, t, e), l = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: n.length,
    aggregates: {},
    leaves: n,
    __pivotValues: Pe(n, o, t, e)
  };
  if (!i.length)
    return { columns: a, displayList: [l], tree: [], combos: o };
  const d = (p, g, b) => {
    const v = i[g], S = /* @__PURE__ */ new Map();
    for (const w of p) {
      const x = V(w, v), M = x == null ? "" : String(x);
      S.has(M) || S.set(M, { value: x, rows: [] }), S.get(M).rows.push(w);
    }
    const _ = Array.from(S.values()).map(({ value: w, rows: x }) => {
      const M = w == null ? "" : String(w), T = b ? `${b}|${v.field}=${M}` : `${v.field}=${M}`;
      return {
        __sgGroup: !0,
        level: g,
        field: v.field,
        value: w,
        groupId: T,
        count: x.length,
        aggregates: {},
        leaves: x,
        __pivotValues: Pe(x, o, t, e),
        children: g + 1 < i.length ? d(x, g + 1, T) : null
      };
    }), y = Ls(r, v);
    return _.sort(y);
  }, c = d(n, 0, ""), u = [l], h = (p) => {
    for (const g of p)
      u.push(g), s(g.groupId, g.level) && g.children && h(g.children);
  };
  return h(c), { columns: a, displayList: u, tree: c, combos: o };
}
function Ms(n, { pivotCols: i = [], valueConfigs: e = [], columnGroups: t = null } = {}) {
  if (n._isPivot && i.length && n.pivotKeys)
    return Es(n, i, e);
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
function Es(n, i, e) {
  const t = (e?.length || 0) > 1, s = [];
  for (let r = 0; r < i.length; r++) {
    const o = i[r].field, a = n.pivotKeys[o];
    if (r === i.length - 1 && !t)
      return s.push({ kind: "leaf", col: n, label: a == null ? "(Blank)" : String(a) }), s;
    s.push({
      kind: "group",
      id: `p:${r}:${a == null ? "" : String(a)}`,
      label: a == null ? "(Blank)" : String(a)
    });
  }
  return s.push({ kind: "leaf", col: n, label: `${n.aggFunc}(${n.valueField})` }), s;
}
function Rs(n, i = {}) {
  if (!n.length) return { rows: [[]], depth: 1 };
  const e = n.map((r) => Ms(r, i).slice()), t = Math.max(1, ...e.map((r) => r.length)), s = [];
  for (let r = 0; r < t; r++) {
    const o = [];
    let a = 0;
    for (; a < e.length; ) {
      const l = e[a];
      if (r >= l.length || l[r] === null) {
        a += 1;
        continue;
      }
      const d = l[r];
      if (d.kind === "leaf") {
        o.push({ kind: "leaf", col: d.col, label: d.label, rowspan: t - r, colspan: 1 });
        for (let u = r + 1; u < t; u++) l[u] = null;
        a += 1;
        continue;
      }
      let c = a + 1;
      for (; c < e.length; ) {
        const u = e[c];
        if (r >= u.length || !u[r] || u[r].kind !== "group" || u[r].id !== d.id) break;
        let h = !0;
        for (let p = 0; p < r; p++) {
          const g = l[p]?.id ?? null, b = u[p]?.id ?? null;
          if (g !== b) {
            h = !1;
            break;
          }
        }
        if (!h) break;
        c += 1;
      }
      o.push({ kind: "group", label: d.label, colspan: c - a, rowspan: 1 }), a = c;
    }
    s.push(o);
  }
  return { rows: s, depth: t };
}
function Ds({
  rows: n,
  parentField: i = "parent_id",
  getRowId: e = (o) => o?.id,
  passesFilter: t = null,
  siblingComparator: s = null,
  isExpanded: r = () => !0
} = {}) {
  if (!Array.isArray(n) || n.length === 0)
    return { displayList: [], treeMeta: /* @__PURE__ */ new Map() };
  const o = (v) => {
    const S = e(v);
    return S == null ? null : String(S);
  }, a = /* @__PURE__ */ new Map();
  for (const v of n) {
    const S = o(v);
    S != null && a.set(S, v);
  }
  const l = /* @__PURE__ */ new Map(), d = [];
  for (const v of n) {
    const S = o(v), _ = v?.[i], y = _ == null ? null : String(_);
    y == null || y === S || !a.has(y) ? d.push(v) : (l.has(y) || l.set(y, []), l.get(y).push(v));
  }
  const c = t ? new Map(n.map((v) => [o(v), !!t(v)])) : null, u = /* @__PURE__ */ new Map(), h = (v, S) => {
    const _ = o(v);
    if (_ == null) return !1;
    if (u.has(_)) return u.get(_);
    if (S.has(_)) return !1;
    S.add(_);
    let y = !!c.get(_);
    const w = l.get(_) || [];
    for (const x of w) y = h(x, S) || y;
    return S.delete(_), u.set(_, y), y;
  };
  if (c)
    for (const v of d) h(v, /* @__PURE__ */ new Set());
  const p = [], g = /* @__PURE__ */ new Map(), b = (v, S, _, y) => {
    const w = c ? v.filter((x) => y || u.get(o(x))) : v.slice();
    s && w.sort(s);
    for (const x of w) {
      const M = o(x);
      if (M == null || _.has(M)) continue;
      const T = l.get(M) || [], C = y || (c ? !!c.get(M) : !1), D = c ? T.filter((B) => C || u.get(o(B))) : T, E = D.length > 0, I = E && (c ? !0 : !!r(M, S));
      g.set(M, { level: S, hasChildren: E, expanded: I }), p.push(x), I && (_.add(M), b(D, S + 1, _, C), _.delete(M));
    }
  };
  return b(d, 0, /* @__PURE__ */ new Set(), !1), { displayList: p, treeMeta: g };
}
function Ts(n) {
  if (n.serverSide) {
    const c = n.rowData, u = n.pagination?.pageSize || c.length || 1, h = n.serverRowCount ?? c.length, p = Math.max(1, Math.ceil(h / u)), g = Math.min(n.pagination?.page || 0, p - 1);
    return { filteredSorted: c, rows: c, total: h, totalPages: p, page: g, pageRows: c };
  }
  const i = Object.fromEntries(n.columnDefs.map((c) => [c.field, c])), e = n.columnDefs.filter((c) => !c.hidden && !c._isCheckbox), t = (n.rowGroupCols || []).filter((c) => i[c]);
  if (n.treeData && !n.pivotMode && t.length === 0) {
    const c = n.treeParentField || "parent_id", u = Object.entries(n.filterModel || {}).filter(([, x]) => x != null), h = n.quickFilter ? String(n.quickFilter).toLowerCase() : "", g = u.length > 0 || h !== "" ? (x) => {
      for (const [M, T] of u) {
        const C = i[M];
        if (C && !Je(x, C, T)) return !1;
      }
      if (h) {
        let M = !1;
        for (const T of e) {
          const C = G(x, T);
          if (C && String(C).toLowerCase().includes(h)) {
            M = !0;
            break;
          }
        }
        if (!M) return !1;
      }
      return !0;
    } : null, b = Array.isArray(n.sortModel) ? n.sortModel : [], v = b.length ? (x, M) => {
      for (const { colId: T, sort: C } of b) {
        const D = i[T];
        if (!D) continue;
        const E = V(x, D), I = V(M, D), B = typeof D.comparator == "function" ? D.comparator(E, I, x, M) : j(E, I, D.type);
        if (B !== 0) return C === "desc" ? -B : B;
      }
      return 0;
    } : null, S = n.getRowId || ((x) => x?.id), { displayList: _, treeMeta: y } = Ds({
      rows: n.rowData,
      parentField: c,
      getRowId: S,
      passesFilter: g,
      siblingComparator: v,
      isExpanded: n.isTreeRowExpanded || (() => !0)
    }), w = re(_, n.pagination);
    return {
      tree: !0,
      treeData: !0,
      treeMeta: y,
      treeParentField: c,
      filteredSorted: _,
      ...w
    };
  }
  let s = n.rowData;
  s = et(s, n.filterModel, i), s = tt(s, n.quickFilter, e), s = vs(s, n.sortModel, i);
  const r = t, o = n.pivotMode ? (n.pivotCols || []).filter((c) => i[c]) : [], a = n.pivotMode ? Object.entries(n.aggModel || {}).filter(([c]) => i[c]).map(([c, u]) => ({ col: i[c], aggFunc: u })) : [];
  if (n.pivotMode && o.length && a.length) {
    const c = r.map((S) => i[S]), u = o.map((S) => i[S]), { columns: h, displayList: p, tree: g, combos: b } = As({
      rows: s,
      rowGroupCols: c,
      pivotCols: u,
      valueConfigs: a,
      isExpanded: n.isGroupExpanded,
      sortModel: n.sortModel
    }), v = re(p, n.pagination);
    return {
      pivot: !0,
      pivotResultColumns: h,
      combos: b,
      grouped: !0,
      tree: g,
      leafCount: s.length,
      grandTotals: de(s, n.aggModel, i),
      filteredSorted: p,
      ...v
    };
  }
  if (r.length) {
    const c = r.map((g) => i[g]), { displayList: u, tree: h } = ws(
      s,
      c,
      i,
      n.aggModel,
      n.isGroupExpanded
    ), p = re(u, n.pagination);
    return {
      grouped: !0,
      tree: h,
      leafCount: s.length,
      grandTotals: de(s, n.aggModel, i),
      filteredSorted: u,
      ...p
    };
  }
  const l = re(s, n.pagination), d = n.aggModel && Object.keys(n.aggModel).length ? de(s, n.aggModel, i) : null;
  return { filteredSorted: s, grandTotals: d, ...l };
}
function ks(n, i, e, t, s = 6) {
  const r = Math.ceil(i / e), o = Math.max(0, Math.floor(n / e) - s), a = Math.min(t, o + r + s * 2);
  return { first: o, last: a };
}
function Ns(n) {
  return {
    // ---- Data ----
    setRowData(i) {
      n.setRowData(i);
    },
    getRowData() {
      return n.state.rowData.slice();
    },
    applyTransaction(i) {
      return n.applyTransaction(i);
    },
    // Server-side row model
    setRowCount(i) {
      n.setRowCount(i);
    },
    getRowCount() {
      return n.state.serverSide ? n.state.serverRowCount : n.state.rowData.length;
    },
    isServerSide() {
      return !!n.state.serverSide;
    },
    // ---- Columns ----
    setColumnDefs(i) {
      n.setColumnDefs(i);
    },
    getColumnDefs() {
      return n.state.columnDefs.slice();
    },
    setColumnVisible(i, e) {
      n.setColumnVisible(i, e);
    },
    setColumnPinned(i, e) {
      n.setColumnPinned(i, e);
    },
    setColumnWidth(i, e) {
      n.setColumnWidth(i, e);
    },
    moveColumn(i, e) {
      n.moveColumn(i, e);
    },
    autoSizeColumn(i) {
      n.autoSizeColumn(i);
    },
    autoSizeAllColumns() {
      n.state.columnDefs.forEach((i) => n.autoSizeColumn(i.field));
    },
    sizeColumnsToFit() {
      n.sizeColumnsToFit();
    },
    // ---- Sort ----
    setSortModel(i) {
      n.setSortModel(i);
    },
    getSortModel() {
      return n.state.sortModel.slice();
    },
    // ---- Filter ----
    setFilterModel(i) {
      n.setFilterModel(i);
    },
    getFilterModel() {
      return { ...n.state.filterModel };
    },
    setColumnFilter(i, e) {
      n.setColumnFilter(i, e);
    },
    destroyFilter(i) {
      n.setColumnFilter(i, null);
    },
    setQuickFilter(i) {
      n.setQuickFilter(i);
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
    selectRow(i) {
      n.setSelected(i, !0);
    },
    deselectRow(i) {
      n.setSelected(i, !1);
    },
    getSelectedRows() {
      return n.getSelectedRows();
    },
    getSelectedRowIds() {
      return Array.from(n.state.selection);
    },
    // ---- Pagination ----
    paginationGoToPage(i) {
      n.goToPage(i);
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
    paginationSetPageSize(i) {
      n.setPageSize(i);
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
    startEditingCell({ rowId: i, colId: e }) {
      n.startEditingCell(i, e);
    },
    stopEditing(i = !1) {
      n.stopEditing(i);
    },
    // ---- Row grouping + aggregation ----
    setRowGroupColumns(i) {
      n.setRowGroupColumns(i);
    },
    addRowGroupColumn(i) {
      n.addRowGroupColumn(i);
    },
    removeRowGroupColumn(i) {
      n.removeRowGroupColumn(i);
    },
    getRowGroupColumns() {
      return n.getRowGroupColumns();
    },
    setColumnAggFunc(i, e) {
      n.setColumnAggFunc(i, e);
    },
    expandAll() {
      n.expandAll();
    },
    collapseAll() {
      n.collapseAll();
    },
    toggleGroup(i, e) {
      n.toggleGroup(i, e);
    },
    // ---- Pivot ----
    setPivotMode(i) {
      n.setPivotMode(i);
    },
    isPivotMode() {
      return n.isPivotMode();
    },
    setPivotColumns(i) {
      n.setPivotColumns(i);
    },
    addPivotColumn(i) {
      n.addPivotColumn(i);
    },
    removePivotColumn(i) {
      n.removePivotColumn(i);
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
    setValueColumns(i) {
      n.setValueColumns(i);
    },
    addValueColumn(i, e = "sum") {
      n.addValueColumn(i, e);
    },
    removeValueColumn(i) {
      n.removeValueColumn(i);
    },
    getValueColumns() {
      return n.getValueColumns();
    },
    // ---- Column header groups (multi-row headers) ----
    setColumnGroups(i) {
      n.setColumnGroups(i);
    },
    getColumnGroups() {
      return n.getColumnGroups();
    },
    // ---- Pinned bottom row (sticky grand totals) ----
    setPinnedBottomRow(i) {
      n.setPinnedBottomRow(i);
    },
    isPinnedBottomRow() {
      return n.isPinnedBottomRow();
    },
    // ---- Tree data (self-referential parent_id) ----
    setTreeData(i) {
      n.setTreeData(i);
    },
    isTreeData() {
      return n.isTreeData();
    },
    setTreeParentField(i) {
      n.setTreeParentField(i);
    },
    expandTreeRow(i) {
      n.expandTreeRow(i);
    },
    collapseTreeRow(i) {
      n.collapseTreeRow(i);
    },
    toggleTreeRow(i) {
      n.toggleTreeRow(i);
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
    setMasterDetail(i) {
      n.setMasterDetail(i);
    },
    isMasterDetail() {
      return n.isMasterDetail();
    },
    expandDetailRow(i) {
      n.expandDetailRow(i);
    },
    collapseDetailRow(i) {
      n.collapseDetailRow(i);
    },
    toggleDetailRow(i) {
      n.toggleDetailRow(i);
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
    applyColumnState(i) {
      n.applyColumnState(i);
    },
    clearPersistedState() {
      n.clearPersistedState();
    },
    getPersistKey() {
      return n.persistKeyValue || "";
    },
    // ---- Export ----
    getDataAsCsv(i = {}) {
      return n.getDataAsCsv(i);
    },
    exportDataAsCsv(i = {}) {
      return n.exportDataAsCsv(i);
    },
    // ---- Display ----
    refreshCells(i = {}) {
      n.refresh(i);
    },
    redrawRows(i = {}) {
      n.refresh(i);
    },
    // ---- Events ----
    addEventListener(i, e) {
      n.element.addEventListener(i, e);
    },
    removeEventListener(i, e) {
      n.element.removeEventListener(i, e);
    }
  };
}
function m(n, i = {}, e = []) {
  const t = document.createElement(n);
  for (const [s, r] of Object.entries(i))
    r === !1 || r == null || (s === "class" ? t.className = r : s === "style" && typeof r == "object" ? Object.assign(t.style, r) : s.startsWith("on") && typeof r == "function" ? t.addEventListener(s.slice(2).toLowerCase(), r) : r === !0 ? t.setAttribute(s, "") : t.setAttribute(s, String(r)));
  for (const s of [].concat(e))
    s == null || s === !1 || t.appendChild(typeof s == "string" ? document.createTextNode(s) : s);
  return t;
}
function Fe(n, i) {
  for (const [e, t] of Object.entries(i))
    t == null || t === !1 ? n.removeAttribute(e) : t === !0 ? n.setAttribute(e, "") : n.setAttribute(e, String(t));
}
function Be(n) {
  const i = document.getElementById(n);
  return !i || i.tagName !== "TEMPLATE" ? null : i.content.firstElementChild.cloneNode(!0);
}
function L(n, i, e) {
  n.dispatchEvent(new CustomEvent(i, { detail: e, bubbles: !0 }));
}
function Vs(n, i, e) {
  let t = n.parentElement;
  for (; t; ) {
    if ((t.getAttribute("data-controller") || "").split(/\s+/).includes(i)) {
      const r = e.getControllerForElementAndIdentifier(t, i);
      if (r) return r;
    }
    t = t.parentElement;
  }
  return null;
}
const He = [
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
], Is = [
  21522,
  20773,
  24188,
  23371,
  17913,
  16590,
  20375,
  19104
], ce = new Uint8Array(512), xe = new Uint8Array(256);
(function() {
  let i = 1;
  for (let e = 0; e < 255; e++)
    ce[e] = i, xe[i] = e, i <<= 1, i & 256 && (i ^= 285);
  for (let e = 255; e < 512; e++) ce[e] = ce[e - 255];
})();
function Le(n, i) {
  return n === 0 || i === 0 ? 0 : ce[xe[n] + xe[i]];
}
function $s(n) {
  const i = new Uint8Array(n);
  i[n - 1] = 1;
  let e = 1;
  for (let t = 0; t < n; t++) {
    for (let s = 0; s < n; s++)
      i[s] = Le(i[s], e), s + 1 < n && (i[s] ^= i[s + 1]);
    e = Le(e, 2);
  }
  return i;
}
function Ps(n, i) {
  const e = new Uint8Array(i.length);
  for (const t of n) {
    const s = t ^ e[0];
    e.copyWithin(0, 1), e[e.length - 1] = 0;
    for (let r = 0; r < i.length; r++)
      e[r] ^= Le(i[r], s);
  }
  return e;
}
class Fs {
  constructor() {
    this.bits = [];
  }
  append(i, e) {
    for (let t = e - 1; t >= 0; t--) this.bits.push(i >>> t & 1);
  }
  toBytes() {
    for (; this.bits.length % 8 !== 0; ) this.bits.push(0);
    const i = new Uint8Array(this.bits.length / 8);
    for (let e = 0; e < i.length; e++) {
      let t = 0;
      for (let s = 0; s < 8; s++) t = t << 1 | this.bits[e * 8 + s];
      i[e] = t;
    }
    return i;
  }
}
function Bs(n) {
  const i = new TextEncoder().encode(String(n));
  let e = 0;
  for (let C = 1; C <= 10; C++) {
    const E = 4 + (C < 10 ? 8 : 16) + i.length * 8, I = He[C - 1][0] * 8;
    if (E <= I) {
      e = C;
      break;
    }
  }
  if (e === 0)
    throw new Error(`qr: data too long for v10 ECC=M (${i.length} bytes; max 213)`);
  const [t, s, r] = He[e - 1], o = new Fs();
  o.append(4, 4), o.append(i.length, e < 10 ? 8 : 16);
  for (const C of i) o.append(C, 8);
  const a = t * 8;
  o.append(0, Math.min(4, Math.max(0, a - o.bits.length)));
  const l = o.toBytes(), d = new Uint8Array(t);
  d.set(l);
  const c = [236, 17];
  for (let C = l.length; C < t; C++) d[C] = c[(C - l.length) % 2];
  const u = Math.floor(t / r), h = t - u * r, p = [], g = $s(s);
  let b = 0;
  for (let C = 0; C < r; C++) {
    const D = C < r - h ? u : u + 1, E = d.slice(b, b + D);
    b += D, p.push({ data: E, ecc: Ps(E, g) });
  }
  const v = [], S = u + 1;
  for (let C = 0; C < S; C++)
    for (const D of p) C < D.data.length && v.push(D.data[C]);
  for (let C = 0; C < s; C++)
    for (const D of p) v.push(D.ecc[C]);
  const _ = 17 + e * 4, y = new Uint8Array(_ * _), w = new Uint8Array(_ * _);
  Hs(y, w, _), Gs(y, w, _), zs(y, w, _, e), e >= 7 && js(y, w, _, e), qs(y, w, _, v);
  let x = 0, M = 1 / 0;
  const T = new Uint8Array(y);
  for (let C = 0; C < 8; C++) {
    T.set(y), Oe(T, w, _, C), Ge(T, _, C);
    const D = Ks(T, _);
    D < M && (M = D, x = C);
  }
  return Oe(y, w, _, x), Ge(y, _, x), { size: _, matrix: y };
}
function $(n, i, e, t, s) {
  n[t * i + e] = s ? 1 : 0;
}
function Hs(n, i, e) {
  const t = [[0, 0], [e - 7, 0], [0, e - 7]];
  for (const [s, r] of t)
    for (let o = -1; o <= 7; o++)
      for (let a = -1; a <= 7; a++) {
        const l = s + a, d = r + o;
        if (l < 0 || d < 0 || l >= e || d >= e) continue;
        const u = a >= 0 && a < 7 && o >= 0 && o < 7 && (a === 0 || a === 6 || o === 0 || o === 6 || // outer ring
        a >= 2 && a <= 4 && o >= 2 && o <= 4);
        $(n, e, l, d, u), i[d * e + l] = 1;
      }
  for (let s = 0; s < 9; s++)
    i[s * e + 8] = 1, i[8 * e + s] = 1;
  for (let s = 0; s < 8; s++)
    i[(e - 1 - s) * e + 8] = 1, i[8 * e + (e - 1 - s)] = 1;
  $(n, e, 8, e - 8, 1), i[(e - 8) * e + 8] = 1;
}
function Gs(n, i, e) {
  for (let t = 8; t < e - 8; t++)
    $(n, e, t, 6, t % 2 === 0), $(n, e, 6, t, t % 2 === 0), i[6 * e + t] = 1, i[t * e + 6] = 1;
}
const Os = [
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
function zs(n, i, e, t) {
  const s = Os[t];
  if (s) {
    for (const r of s)
      for (const o of s)
        if (!(o === 6 && r === 6 || o === e - 7 && r === 6 || o === 6 && r === e - 7))
          for (let l = -2; l <= 2; l++)
            for (let d = -2; d <= 2; d++) {
              const c = Math.max(Math.abs(d), Math.abs(l)) !== 1;
              $(n, e, o + d, r + l, c), i[(r + l) * e + (o + d)] = 1;
            }
  }
}
function js(n, i, e, t) {
  let s = t, r = s;
  for (let a = 0; a < 12; a++)
    r = r << 1 ^ (r >>> 11) * 7973;
  const o = s << 12 | r;
  for (let a = 0; a < 18; a++) {
    const l = o >>> a & 1, d = Math.floor(a / 3), c = a % 3 + e - 11;
    $(n, e, d, c, l), i[c * e + d] = 1, $(n, e, c, d, l), i[d * e + c] = 1;
  }
}
function Ge(n, i, e) {
  const t = Is[e];
  for (let s = 0; s < 15; s++) {
    const r = (t >>> s & 1) === 1;
    s < 6 ? $(n, i, 8, s, r) : s < 8 ? $(n, i, 8, s + 1, r) : s < 9 ? $(n, i, 7, 8, r) : $(n, i, 14 - s, 8, r), s < 8 ? $(n, i, i - 1 - s, 8, r) : $(n, i, 8, i - 15 + s, r);
  }
  $(n, i, 8, i - 8, 1);
}
function qs(n, i, e, t) {
  let s = 0, r = -1;
  for (let o = e - 1; o > 0; o -= 2) {
    o === 6 && o--;
    for (let a = 0; a < e; a++) {
      const l = r < 0 ? e - 1 - a : a;
      for (let d = 0; d < 2; d++) {
        const c = o - d;
        if (i[l * e + c]) continue;
        const u = s < t.length * 8 ? t[s >>> 3] >>> 7 - (s & 7) & 1 : 0;
        n[l * e + c] = u, s++;
      }
    }
    r = -r;
  }
}
function Oe(n, i, e, t) {
  for (let s = 0; s < e; s++)
    for (let r = 0; r < e; r++) {
      if (i[s * e + r]) continue;
      let o = !1;
      switch (t) {
        case 0:
          o = (r + s & 1) === 0;
          break;
        case 1:
          o = (s & 1) === 0;
          break;
        case 2:
          o = r % 3 === 0;
          break;
        case 3:
          o = (r + s) % 3 === 0;
          break;
        case 4:
          o = (Math.floor(s / 2) + Math.floor(r / 3) & 1) === 0;
          break;
        case 5:
          o = r * s % 2 + r * s % 3 === 0;
          break;
        case 6:
          o = (r * s % 2 + r * s % 3 & 1) === 0;
          break;
        case 7:
          o = ((r + s) % 2 + r * s % 3 & 1) === 0;
          break;
      }
      o && (n[s * e + r] ^= 1);
    }
}
function Ks(n, i) {
  let e = 0;
  for (let t = 0; t < i; t++) {
    let s = 1, r = -1;
    for (let o = 0; o < i; o++) {
      const a = n[t * i + o];
      a === r ? (s++, s === 5 ? e += 3 : s > 5 && (e += 1)) : (r = a, s = 1);
    }
  }
  for (let t = 0; t < i; t++) {
    let s = 1, r = -1;
    for (let o = 0; o < i; o++) {
      const a = n[o * i + t];
      a === r ? (s++, s === 5 ? e += 3 : s > 5 && (e += 1)) : (r = a, s = 1);
    }
  }
  for (let t = 0; t < i - 1; t++)
    for (let s = 0; s < i - 1; s++) {
      const r = n[t * i + s];
      n[t * i + s + 1] === r && n[(t + 1) * i + s] === r && n[(t + 1) * i + s + 1] === r && (e += 3);
    }
  return e;
}
function Us({ size: n, matrix: i }, e = {}) {
  const {
    moduleSize: t = 4,
    margin: s = 2,
    background: r = "#fff",
    foreground: o = "#111827"
  } = e, a = (n + s * 2) * t;
  let l = "";
  for (let d = 0; d < n; d++)
    for (let c = 0; c < n; c++)
      if (i[d * n + c]) {
        const u = (c + s) * t, h = (d + s) * t;
        l += `M${u},${h}h${t}v${t}h-${t}z`;
      }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a} ${a}" width="${a}" height="${a}" shape-rendering="crispEdges" aria-hidden="true"><rect width="${a}" height="${a}" fill="${r}"/><path d="${l}" fill="${o}"/></svg>`;
}
const Ws = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.1 297.4z"/></svg>', Me = /* @__PURE__ */ new Map();
function A(n, i) {
  if (typeof n != "string" || !n) throw new Error("registerRenderer: name must be a non-empty string");
  if (typeof i != "function") throw new Error("registerRenderer: fn must be a function");
  Me.set(n, i);
}
function rt(n) {
  return Me.get(n) || null;
}
function Xs() {
  return Array.from(Me.keys());
}
function f(n, i = {}, e = null) {
  const t = document.createElement(n);
  for (const [s, r] of Object.entries(i))
    r == null || r === !1 || (s === "class" ? t.className = r : t.setAttribute(s, r === !0 ? "" : String(r)));
  return e == null || (Array.isArray(e) ? e.forEach((s) => t.append(s)) : typeof e == "string" ? t.innerHTML = e : t.append(e)), t;
}
const k = (n) => n == null || n === "", Ys = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function ot() {
  return ({ value: n }) => {
    if (k(n)) return "";
    const i = String(n);
    return Ys.test(i) ? f("a", {
      class: "sg-renderer-link",
      href: `mailto:${i}`,
      title: "Send email"
    }, document.createTextNode(i)) : f("span", { class: "sg-renderer-invalid", title: "Invalid email" }, document.createTextNode(i));
  };
}
function at({ newTab: n = !0 } = {}) {
  return ({ value: i }) => {
    if (k(i)) return "";
    const e = String(i);
    let t;
    try {
      t = new URL(e);
    } catch {
      return document.createTextNode(e);
    }
    return f("a", {
      class: "sg-renderer-link",
      href: e,
      target: n ? "_blank" : null,
      rel: n ? "noopener noreferrer" : null,
      title: e
    }, document.createTextNode(t.hostname + (t.pathname !== "/" ? t.pathname : "")));
  };
}
function lt({ defaultRegion: n = "AU" } = {}) {
  return ({ value: i }) => {
    if (k(i)) return "";
    const e = String(i).trim(), t = e.replace(/\D/g, "");
    if (!t) return document.createTextNode(e);
    let s = e;
    return n === "AU" && (/^04\d{8}$/.test(t) ? s = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : /^0[2378]\d{8}$/.test(t) ? s = `(${t.slice(0, 2)}) ${t.slice(2, 6)} ${t.slice(6)}` : /^1[38]00\d{6}$/.test(t) ? s = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : t.length === 8 && (s = `${t.slice(0, 4)} ${t.slice(4)}`)), f("a", { class: "sg-renderer-link", href: `tel:${t}` }, document.createTextNode(s));
  };
}
function dt({ currency: n = "USD", locale: i = "en-US", decimals: e } = {}) {
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-number"), k(t)) return "";
    const r = Number(t);
    if (!Number.isFinite(r)) return String(t);
    const o = { style: "currency", currency: n };
    return e != null && (o.minimumFractionDigits = e, o.maximumFractionDigits = e), r.toLocaleString(i, o);
  };
}
function ct({ decimals: n = 0, scale: i = "as-is" } = {}) {
  return ({ value: e, td: t }) => {
    if (t && t.classList.add("sg-renderer-number"), k(e)) return "";
    let s = Number(e);
    return Number.isFinite(s) ? (i === "fraction" && (s *= 100), `${s.toFixed(n)}%`) : String(e);
  };
}
function Ee(n) {
  if (n == null || n === "") return null;
  if (n instanceof Date) return Number.isNaN(n.valueOf()) ? null : n;
  const i = new Date(n);
  return Number.isNaN(i.valueOf()) ? null : i;
}
function ut({ locale: n = void 0, dateStyle: i = "medium", ...e } = {}) {
  const t = new Intl.DateTimeFormat(n, { dateStyle: i, ...e });
  return ({ value: s }) => {
    const r = Ee(s);
    return r ? t.format(r) : "";
  };
}
function ht({ locale: n = void 0, dateStyle: i = "medium", timeStyle: e = "short", ...t } = {}) {
  const s = new Intl.DateTimeFormat(n, { dateStyle: i, timeStyle: e, ...t });
  return ({ value: r }) => {
    const o = Ee(r);
    return o ? s.format(o) : "";
  };
}
const ve = [
  { unit: "second", ms: 1e3, cutoff: 60 * 1e3 },
  { unit: "minute", ms: 60 * 1e3, cutoff: 3600 * 1e3 },
  { unit: "hour", ms: 3600 * 1e3, cutoff: 1440 * 60 * 1e3 },
  { unit: "day", ms: 1440 * 60 * 1e3, cutoff: 10080 * 60 * 1e3 },
  { unit: "week", ms: 10080 * 60 * 1e3, cutoff: 720 * 60 * 60 * 1e3 },
  { unit: "month", ms: 720 * 60 * 60 * 1e3, cutoff: 365 * 24 * 60 * 60 * 1e3 },
  { unit: "year", ms: 365 * 24 * 60 * 60 * 1e3, cutoff: 1 / 0 }
];
function pt({ locale: n = void 0, numeric: i = "auto", style: e = "long" } = {}) {
  const t = new Intl.RelativeTimeFormat(n, { numeric: i, style: e });
  return ({ value: s }) => {
    const r = Ee(s);
    if (!r) return "";
    const o = r.getTime() - Date.now(), a = Math.abs(o), l = ve.find((u) => a < u.cutoff) || ve[ve.length - 1], d = Math.round(o / l.ms), c = f("span", { class: "sg-renderer-relative-time", title: r.toLocaleString() });
    return c.textContent = t.format(d, l.unit), c;
  };
}
const Qs = { ms: 1, sec: 1e3, second: 1e3, min: 6e4, minute: 6e4, hr: 36e5, hour: 36e5 };
function ft({ unit: n = "ms", style: i = "compact" } = {}) {
  const e = Qs[n] ?? 1;
  return ({ value: t, td: s }) => {
    if (s && s.classList.add("sg-renderer-number"), k(t)) return "";
    const r = Number(t) * e;
    if (!Number.isFinite(r)) return String(t);
    const o = r < 0 ? "-" : "", a = Math.abs(r), l = Math.floor(a / 36e5), d = Math.floor(a % 36e5 / 6e4), c = Math.floor(a % 6e4 / 1e3);
    if (i === "clock") {
      const h = (p) => String(p).padStart(2, "0");
      return o + (l > 0 ? `${h(l)}:${h(d)}:${h(c)}` : `${h(d)}:${h(c)}`);
    }
    if (i === "words") {
      const h = [];
      return l && h.push(`${l} ${l === 1 ? "hour" : "hours"}`), d && h.push(`${d} ${d === 1 ? "minute" : "minutes"}`), !l && c && h.push(`${c} ${c === 1 ? "second" : "seconds"}`), o + (h.join(" ") || "0 seconds");
    }
    const u = [];
    return l && u.push(`${l}h`), d && u.push(`${d}m`), !l && c && u.push(`${c}s`), o + (u.join(" ") || "0s");
  };
}
function gt({ locale: n = void 0, decimals: i, ...e } = {}) {
  const t = { ...e };
  i != null && (t.minimumFractionDigits = i, t.maximumFractionDigits = i);
  const s = new Intl.NumberFormat(n, t);
  return ({ value: r, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), k(r)) return "";
    const a = Number(r);
    return Number.isFinite(a) ? s.format(a) : String(r);
  };
}
function mt({ locale: n = void 0, compactDisplay: i = "short", maximumFractionDigits: e = 1 } = {}) {
  const t = new Intl.NumberFormat(n, {
    notation: "compact",
    compactDisplay: i,
    maximumFractionDigits: e
  });
  return ({ value: s, td: r }) => {
    if (r && r.classList.add("sg-renderer-number"), k(s)) return "";
    const o = Number(s);
    return Number.isFinite(o) ? t.format(o) : String(s);
  };
}
function _t({ binary: n = !0, decimals: i = 1, locale: e = void 0 } = {}) {
  const t = n ? 1024 : 1e3, s = n ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"], r = new Intl.NumberFormat(e, {
    minimumFractionDigits: i,
    maximumFractionDigits: i
  });
  return ({ value: o, td: a }) => {
    if (a && a.classList.add("sg-renderer-number"), k(o)) return "";
    let l = Number(o);
    if (!Number.isFinite(l)) return String(o);
    const d = l < 0 ? "-" : "";
    l = Math.abs(l);
    let c = 0;
    for (; l >= t && c < s.length - 1; )
      l /= t, c += 1;
    const u = c === 0 ? String(Math.round(l)) : r.format(l);
    return `${d}${u} ${s[c]}`;
  };
}
const Zs = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on"]);
function Re(n) {
  return n === !0 || n === 1 ? !0 : n == null || n === "" || n === !1 || n === 0 ? !1 : Zs.has(String(n).toLowerCase());
}
const Js = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>', en = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
function bt({
  truthy: n = Re,
  nullLabel: i = "—",
  falseStyle: e = "icon"
  // 'icon' | 'hidden'
} = {}) {
  return ({ value: t }) => {
    if (t == null || t === "")
      return f("span", { class: "sg-renderer-bool-null" }, document.createTextNode(i));
    if (n(t)) {
      const r = f("span", { class: "sg-renderer-bool is-true", "aria-label": "true" });
      return r.innerHTML = Js, r;
    }
    if (e === "hidden") return "";
    const s = f("span", { class: "sg-renderer-bool is-false", "aria-label": "false" });
    return s.innerHTML = en, s;
  };
}
const tn = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>', sn = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.7 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>', nn = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M64 256a32 32 0 1 0 0-64H384V160c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9S384 364.9 384 352V320H64z"/></svg>';
function vt({
  style: n = "percent",
  // 'percent' | 'number' | 'currency'
  decimals: i = 1,
  locale: e = void 0,
  currency: t = "USD",
  inverted: s = !1,
  showSign: r = !0
} = {}) {
  let o;
  return n === "currency" ? o = new Intl.NumberFormat(e, {
    style: "currency",
    currency: t,
    minimumFractionDigits: i,
    maximumFractionDigits: i,
    signDisplay: r ? "always" : "auto"
  }) : o = new Intl.NumberFormat(e, {
    minimumFractionDigits: i,
    maximumFractionDigits: i,
    signDisplay: r ? "always" : "auto"
  }), ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-number"), k(a)) return "";
    const d = Number(a);
    if (!Number.isFinite(d)) return String(a);
    let c = "is-flat", u = nn;
    const h = !s;
    d > 0 ? (c = h ? "is-up" : "is-down", u = tn) : d < 0 && (c = h ? "is-down" : "is-up", u = sn);
    const p = f("span", { class: `sg-renderer-delta ${c}` }), g = f("span", { class: "sg-renderer-delta-icon", "aria-hidden": "true" });
    g.innerHTML = u;
    const b = n === "percent" ? `${o.format(d)}%` : o.format(d);
    return p.append(g), p.append(f("span", { class: "sg-renderer-delta-value" }, document.createTextNode(b))), p;
  };
}
function yt({ chars: n = null } = {}) {
  return ({ value: i, td: e }) => {
    if (k(i)) return "";
    const t = String(i);
    let s = t, r = !1;
    return n && t.length > n && (s = t.slice(0, n) + "…", r = !0), e && (e.classList.add("sg-renderer-truncate"), e.setAttribute("title", t)), r ? s : t;
  };
}
const ge = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>', wt = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';
function Ct({ position: n = "after" } = {}) {
  return ({ value: i }) => {
    if (k(i)) return "";
    const e = String(i), t = f("span", { class: "sg-renderer-copyable" }), s = f("span", { class: "sg-renderer-copyable-value" }, document.createTextNode(e)), r = f("button", {
      type: "button",
      class: "sg-renderer-copyable-btn",
      title: "Copy",
      "aria-label": `Copy ${e}`
    });
    return r.innerHTML = ge, r.addEventListener("click", async (o) => {
      o.stopPropagation(), o.preventDefault();
      try {
        navigator.clipboard?.writeText ? await navigator.clipboard.writeText(e) : St(e), r.innerHTML = wt, r.classList.add("is-copied"), setTimeout(() => {
          r.innerHTML = ge, r.classList.remove("is-copied");
        }, 1200);
      } catch {
      }
    }), n === "before" ? t.append(r, s) : t.append(s, r), t;
  };
}
function St(n) {
  const i = document.createElement("textarea");
  i.value = n, i.style.position = "fixed", i.style.left = "-9999px", document.body.appendChild(i), i.select();
  try {
    document.execCommand("copy");
  } catch {
  }
  document.body.removeChild(i);
}
function xt({
  size: n = 36,
  rounded: i = "sm",
  // 'sm' = 4px, 'lg' = 8px, 'full' = circle, 'none'
  altField: e = "alt",
  clickToZoom: t = !1
} = {}) {
  const s = i === "full" ? "999px" : i === "lg" ? "8px" : i === "none" ? "0" : "4px";
  return ({ value: r, row: o }) => {
    if (k(r)) return "";
    const a = String(r), l = o?.[e] ?? "", d = f("img", {
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
      c.stopPropagation(), rn(a, l);
    })), d;
  };
}
function rn(n, i) {
  const e = f("div", { class: "sg-image-zoom" }), t = () => {
    e.remove(), document.removeEventListener("keydown", s);
  }, s = (r) => {
    r.key === "Escape" && t();
  };
  e.addEventListener("click", t), document.addEventListener("keydown", s), e.append(f("img", { src: n, alt: i || "", class: "sg-image-zoom-img" })), document.body.appendChild(e);
}
function Lt({
  showLabel: n = !0,
  label: i = "value",
  // 'value' | 'name' | (value, row) => string
  shape: e = "circle",
  // 'circle' | 'square'
  size: t = 14
} = {}) {
  return ({ value: s, row: r }) => {
    if (k(s)) return "";
    const o = String(s).trim(), a = f("span", { class: "sg-renderer-swatch" }), l = f("span", {
      class: `sg-renderer-swatch-chip is-${e}`,
      style: `width: ${t}px; height: ${t}px; background: ${o};`,
      "aria-hidden": "true"
    });
    if (a.append(l), n) {
      const d = typeof i == "function" ? i(s, r) : i === "name" ? r?.name ?? o : o;
      a.append(f("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(d)));
    }
    return a;
  };
}
const on = {
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  orange: "#f97316",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#6b7280"
};
function At({
  type: n = "line",
  // 'line' | 'area' | 'bar'
  width: i = 80,
  height: e = 24,
  color: t = "blue",
  // palette key OR raw CSS colour
  baseline: s = null,
  // null = auto-min, 0 = lock min at zero, N = lock at N
  showLast: r = !0
  // small dot on the last point (line / area only)
} = {}) {
  const o = on[t] || t;
  return ({ value: a }) => {
    if (!Array.isArray(a) || a.length === 0) return "";
    const l = a.map(Number).filter((y) => Number.isFinite(y));
    if (l.length === 0) return "";
    const d = s ?? Math.min(...l), u = Math.max(...l, s ?? -1 / 0) - d || 1, h = 1.5, p = 2.5, g = i - h * 2, b = e - p * 2, v = (y) => h + (l.length === 1 ? g / 2 : y / (l.length - 1) * g), S = (y) => p + b - (y - d) / u * b;
    let _ = "";
    if (n === "bar") {
      const w = Math.max(1, (g - (l.length - 1) * 1) / l.length);
      for (let x = 0; x < l.length; x++) {
        const M = l[x], T = h + x * (w + 1), C = S(M), D = p + b - C;
        _ += `<rect x="${T.toFixed(2)}" y="${C.toFixed(2)}" width="${w.toFixed(2)}" height="${D.toFixed(2)}" fill="${o}"/>`;
      }
    } else {
      let y = "";
      for (let w = 0; w < l.length; w++)
        y += `${w === 0 ? "M" : "L"} ${v(w).toFixed(2)} ${S(l[w]).toFixed(2)} `;
      if (n === "area") {
        const w = y + ` L ${v(l.length - 1).toFixed(2)} ${(p + b).toFixed(2)} L ${v(0).toFixed(2)} ${(p + b).toFixed(2)} Z`;
        _ += `<path d="${w}" fill="${o}" fill-opacity="0.18" stroke="none"/>`;
      }
      if (_ += `<path d="${y.trim()}" fill="none" stroke="${o}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`, r) {
        const w = v(l.length - 1), x = S(l[l.length - 1]);
        _ += `<circle cx="${w.toFixed(2)}" cy="${x.toFixed(2)}" r="1.8" fill="${o}"/>`;
      }
    }
    return `<svg class="sg-renderer-sparkline is-${n}" viewBox="0 0 ${i} ${e}" width="${i}" height="${e}" preserveAspectRatio="none" aria-hidden="true">` + _ + "</svg>";
  };
}
function Mt(n) {
  if (typeof n != "string") return null;
  let i = n.trim().replace(/^#/, "");
  return i.length === 3 && (i = i.split("").map((e) => e + e).join("")), /^[0-9a-f]{6}$/i.test(i) ? [parseInt(i.slice(0, 2), 16), parseInt(i.slice(2, 4), 16), parseInt(i.slice(4, 6), 16)] : null;
}
function an(n, i, e) {
  const t = (s) => Math.max(0, Math.min(255, Math.round(s))).toString(16).padStart(2, "0");
  return `#${t(n)}${t(i)}${t(e)}`;
}
function ln(n, i, e) {
  return [n[0] + (i[0] - n[0]) * e, n[1] + (i[1] - n[1]) * e, n[2] + (i[2] - n[2]) * e];
}
function Et([n, i, e]) {
  return 0.299 * n + 0.587 * i + 0.114 * e >= 145;
}
function Rt({
  min: n = 0,
  max: i = 100,
  colors: e = ["#dcfce7", "#fef3c7", "#fecaca"],
  inverted: t = !1,
  showValue: s = !0,
  format: r = null
  // (value) => string for custom labels
} = {}) {
  const o = e.map(Mt).filter(Boolean);
  if (o.length < 2) throw new Error("heatmap: need at least two valid hex colours");
  return ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-heatmap"), k(a)) return "";
    let d = Number(a);
    if (!Number.isFinite(d)) return String(a);
    let c = i - n === 0 ? 0.5 : (d - n) / (i - n);
    c = Math.max(0, Math.min(1, c)), t && (c = 1 - c);
    const u = c * (o.length - 1), h = Math.min(o.length - 2, Math.floor(u)), p = u - h, g = ln(o[h], o[h + 1], p);
    return l && (l.style.backgroundColor = an(...g), l.style.color = Et(g) ? "#111827" : "#ffffff"), s ? typeof r == "function" ? r(a) : String(a) : "";
  };
}
const dn = {
  // Credit card: 16 digits grouped 4-4-4-4, last 4 visible. Handles 13-19
  // digit lengths gracefully (Amex 15, others 16). Non-digits are stripped.
  "cc-last4": (n, i) => ze(n.replace(/\D/g, ""), 4, 4, i, " "),
  // BIN + last4: show the first 6 + last 4, mask the middle (PCI-friendly).
  "cc-bin-last4": (n, i) => ze(n.replace(/\D/g, ""), 4, 4, i, " ", 6),
  // Phone: show the last 4 digits, mask the rest as a single bullet
  // block ("•••••• 1234"). Sidesteps the country-specific 3-3-4 / 4-3-3
  // grouping ambiguity — register your own variant if you need a
  // region-specific layout.
  "phone-last4": (n, i) => {
    const e = n.replace(/\D/g, "");
    return e ? e.length <= 4 ? e : i.repeat(e.length - 4) + " " + e.slice(-4) : n;
  },
  // Email: show first char + domain ("a••••@example.com").
  email: (n, i) => {
    const e = String(n).match(/^([^@\s]+)(@.+)$/);
    return e ? e[1][0] + i.repeat(Math.max(1, e[1].length - 1)) + e[2] : n;
  },
  // SSN / ABN-style: show last 4.
  last4: (n, i) => cn(n, 4, i)
};
function cn(n, i, e) {
  const t = String(n);
  return t.length <= i ? t : e.repeat(t.length - i) + t.slice(-i);
}
function ze(n, i, e, t, s, r = 0) {
  if (!n) return "";
  const o = n.length, a = n.split("").map((d, c) => c < r || c >= o - e ? d : t).join(""), l = [];
  for (let d = a.length; d > 0; d -= i)
    l.unshift(a.slice(Math.max(0, d - i), d));
  return l.join(s);
}
const un = /* @__PURE__ */ new Set(["cc-last4", "cc-bin-last4", "phone-last4", "last4"]);
function Dt({
  format: n = null,
  showFirst: i = 0,
  showLast: e = 4,
  char: t = "•",
  align: s = null
  // 'left' | 'right' | null (auto)
} = {}) {
  const r = n ? dn[n] : null, o = n ? un.has(n) : !1, a = s === "right" || s !== "left" && o;
  return ({ value: l, td: d }) => {
    if (d && a && d.classList.add("sg-renderer-mask-numeric"), k(l)) return "";
    const c = String(l);
    if (r) return r(c, t);
    const u = c.slice(0, i), h = e > 0 ? c.slice(-e) : "", p = Math.max(0, c.length - i - e);
    return u + t.repeat(p) + h;
  };
}
function Tt({
  query: n = null,
  caseSensitive: i = !1,
  className: e = "sg-renderer-mark"
} = {}) {
  return ({ value: t, api: s }) => {
    if (k(t)) return "";
    const r = String(t), o = n != null ? String(n) : s?.getQuickFilter?.() || "";
    return o ? hn(r, o, i, e) : document.createTextNode(r);
  };
}
function hn(n, i, e, t) {
  const s = e ? n : n.toLowerCase(), r = e ? i : i.toLowerCase(), o = document.createElement("span");
  let a = 0;
  for (; a < n.length; ) {
    const l = s.indexOf(r, a);
    if (l === -1) {
      o.appendChild(document.createTextNode(n.slice(a)));
      break;
    }
    l > a && o.appendChild(document.createTextNode(n.slice(a, l)));
    const d = document.createElement("mark");
    d.className = t, d.textContent = n.slice(l, l + i.length), o.appendChild(d), a = l + i.length;
  }
  return o;
}
function kt({ lines: n = null, separator: i = `
` } = {}) {
  return ({ value: e, td: t }) => {
    if (k(e)) return "";
    const s = String(e), r = i === `
` ? s : s.split(i).join(`
`);
    if (t) {
      t.classList.add("sg-renderer-multiline"), t.setAttribute("title", r);
      const o = t.parentElement;
      o && o.tagName === "TR" && o.classList.add("sg-has-multiline");
    }
    if (n != null && n > 0) {
      const o = document.createElement("div");
      return o.className = "sg-renderer-multiline-clamp", o.style.setProperty("--sg-clamp", String(n)), o.textContent = r, o;
    }
    return r;
  };
}
function J(n) {
  if (n == null || !Number.isFinite(Number(n))) return "";
  let i = Number(n);
  if (i < 1024) return `${i} B`;
  const e = ["KB", "MB", "GB", "TB"];
  let t = -1;
  do
    i /= 1024, t++;
  while (i >= 1024 && t < e.length - 1);
  return `${i.toFixed(i < 10 ? 1 : 0)} ${e[t]}`;
}
const pn = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "ico"]);
function z(n) {
  if (!n) return !1;
  if (typeof n.content_type == "string" && n.content_type.startsWith("image/")) return !0;
  const i = String(n.filename || "").split(".").pop()?.toLowerCase();
  return i ? pn.has(i) : !1;
}
const me = {
  pdf: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM88 304h32c30.9 0 56 25.1 56 56s-25.1 56-56 56h-16v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V320c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24h-16v48h16zm72-64c0-8.8 7.2-16 16-16h24c26.5 0 48 21.5 48 48v48c0 26.5-21.5 48-48 48H208c-8.8 0-16-7.2-16-16V320zm32 16v80h8c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16h-8z"/></svg>',
  doc: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM104 280c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24zm0 80c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24z"/></svg>',
  sheet: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zm192 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16v128c0 8.8-7.2 16-16 16H112c-8.8 0-16-7.2-16-16V272c0-8.8 7.2-16 16-16zm16 32v32h48V288H128zm80 0v32h48V288H208zm-80 64v32h48V352H128zm80 0v32h48V352H208z"/></svg>',
  zip: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H160V64H224V0H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM160 64v32h64V64H160zm0 96v32h64V160H160zm0 96v32h64V256H160zm0 96c-17.7 0-32 14.3-32 32v48c0 8.8 7.2 16 16 16h96c8.8 0 16-7.2 16-16V384c0-17.7-14.3-32-32-32H160z"/></svg>',
  audio: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM160 288c-8.8 0-16 7.2-16 16v89c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V362.5l64-21.3V388c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V304c0-5.1-2.5-10-6.6-13s-9.5-3.9-14.5-2.3L160 309.8V304c0-8.8-7.2-16-16-16z"/></svg>',
  video: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM64 288c0-17.7 14.3-32 32-32H224c17.7 0 32 14.3 32 32V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V288zm259.7-11.3c5.2 2.7 8.3 8 8.3 13.8v123c0 5.8-3.2 11.2-8.3 13.8s-11.3 2.3-16.1-.9L256 392.7V312l51.5-32.6c4.9-3.1 11-3.4 16.1-.8z"/></svg>',
  code: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM200.4 281.7c5.8 6.7 5.2 16.8-1.5 22.6L165.5 333l33.4 28.7c6.7 5.8 7.4 15.9 1.6 22.6s-15.9 7.4-22.6 1.6l-48-41.2c-3.5-3-5.5-7.4-5.5-12s2-9 5.5-12l48-41.2c6.7-5.8 16.8-5.2 22.6 1.5zM226 281.7c5.8-6.7 15.9-7.4 22.6-1.5l48 41.2c3.5 3 5.5 7.4 5.5 12s-2 9-5.5 12l-48 41.2c-6.7 5.8-16.8 5.2-22.6-1.6s-5.2-16.8 1.5-22.6L260.5 333 227.5 304.4c-6.7-5.8-7.4-15.9-1.5-22.6z"/></svg>',
  file: '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0z"/></svg>'
}, Nt = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>', De = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>', fn = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>', gn = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 105.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>', mn = /* @__PURE__ */ new Set(["mp3", "wav", "flac", "m4a", "ogg", "aac", "opus"]), _n = /* @__PURE__ */ new Set(["mp4", "mov", "webm", "mkv", "avi", "m4v"]);
function Vt(n) {
  const i = String(n?.content_type || "").toLowerCase(), e = String(n?.filename || "").split(".").pop()?.toLowerCase() || "";
  return i.includes("pdf") || e === "pdf" ? "pdf" : i.startsWith("audio/") || mn.has(e) ? "audio" : i.startsWith("video/") || _n.has(e) ? "video" : i.includes("zip") || ["zip", "tar", "gz", "7z", "rar"].includes(e) ? "zip" : i.includes("sheet") || i.includes("excel") || i.includes("csv") || ["xls", "xlsx", "csv", "numbers"].includes(e) ? "sheet" : i.includes("word") || i.includes("document") || ["doc", "docx", "txt", "md", "rtf"].includes(e) ? "doc" : ["js", "ts", "rb", "py", "go", "rs", "java", "json", "xml", "html", "css", "sh", "sql"].includes(e) ? "code" : "file";
}
function be(n) {
  if (n == null || n === "") return [];
  let i = n;
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
function It({
  thumbSize: n = 28,
  maxThumbs: i = 4,
  empty: e = "",
  editable: t = !1,
  accept: s = null,
  multiple: r = !0,
  download: o = !1,
  onUpload: a = null,
  onRemove: l = null
} = {}) {
  return (d) => {
    const { value: c, td: u, row: h, col: p } = d, g = be(c);
    if (u && (u.classList.add("sg-renderer-attachments-cell"), u.dataset.attachmentCount = String(g.length), u._sgAttachments = g), g.length === 0 && !t)
      return e ? document.createTextNode(e) : "";
    const b = f("div", { class: "sg-renderer-attachments", role: "group" }), v = g.slice(0, i), S = Math.max(0, g.length - v.length);
    if (v.forEach((_) => b.append(bn(_, n, g, o))), S > 0) {
      const _ = f(
        "span",
        { class: "sg-attach-more", title: `${S} more` },
        document.createTextNode(`+${S}`)
      );
      _.addEventListener("click", (y) => {
        y.stopPropagation(), $t(g, g[v.length]);
      }), b.append(_);
    }
    if (t) {
      const _ = f("button", {
        type: "button",
        class: "sg-attach-add",
        title: "Add files",
        "aria-label": "Add attachments",
        "data-sg-attach": "add"
      });
      _.innerHTML = Nt, _.addEventListener("click", (y) => {
        y.stopPropagation(), je(u, d, { thumbSize: n, accept: s, multiple: r, onUpload: a, onRemove: l });
      }), b.append(_), vn(u, d, { onUpload: a }), u.addEventListener("dblclick", (y) => {
        y._sgAttachmentHandled || (y._sgAttachmentHandled = !0, y.stopPropagation(), je(u, d, { thumbSize: n, accept: s, multiple: r, onUpload: a, onRemove: l }));
      }, { once: !1 });
    }
    return b;
  };
}
function bn(n, i, e, t) {
  const s = f("button", {
    type: "button",
    class: "sg-attach-thumb",
    title: `${n.filename}${n.byte_size != null ? " · " + J(n.byte_size) : ""}`,
    "data-attachment-id": n.id,
    "data-attachment-kind": z(n) ? "image" : "file",
    "aria-label": n.filename,
    style: `width: ${i}px; height: ${i}px;`
  });
  if (z(n) && n.thumb_url)
    s.append(f("img", {
      src: n.thumb_url,
      alt: n.filename,
      loading: "lazy",
      decoding: "async",
      width: String(i),
      height: String(i)
    }));
  else {
    const r = Vt(n), o = f("span", { class: `sg-attach-icon is-${r}`, "aria-hidden": "true" });
    o.innerHTML = me[r] || me.file, s.append(o);
  }
  return s.addEventListener("click", (r) => {
    if (r.stopPropagation(), z(n)) {
      const o = e.filter(z);
      $t(o.length ? o : [n], n);
    } else if (t) {
      const o = document.createElement("a");
      o.href = n.url, o.download = n.filename, document.body.appendChild(o), o.click(), o.remove();
    } else
      window.open(n.url, "_blank", "noopener,noreferrer");
  }), s;
}
let Y = null;
function $t(n, i) {
  ye();
  const e = n.filter(z);
  if (e.length === 0) return;
  let t = Math.max(0, e.findIndex((p) => p.id === i?.id));
  t < 0 && (t = 0);
  const s = f("div", { class: "sg-image-zoom sg-attach-lightbox", role: "dialog", "aria-modal": "true" }), r = f("div", { class: "sg-attach-lightbox-stage" }), o = f("img", { class: "sg-image-zoom-img", alt: "" }), a = f("div", { class: "sg-attach-lightbox-caption" }), l = f("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-prev",
    "aria-label": "Previous attachment"
  }), d = f("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-next",
    "aria-label": "Next attachment"
  });
  l.innerHTML = fn, d.innerHTML = gn;
  function c() {
    const p = e[t];
    o.src = p.preview_url || p.url, o.alt = p.filename, a.textContent = `${p.filename}${p.byte_size != null ? " · " + J(p.byte_size) : ""} (${t + 1}/${e.length})`, l.style.visibility = e.length > 1 ? "visible" : "hidden", d.style.visibility = e.length > 1 ? "visible" : "hidden";
  }
  function u(p) {
    t = (t + p + e.length) % e.length, c();
  }
  function h(p) {
    p.key === "Escape" ? ye() : p.key === "ArrowLeft" ? u(-1) : p.key === "ArrowRight" && u(1);
  }
  s.addEventListener("click", (p) => {
    (p.target === s || p.target === r) && ye();
  }), l.addEventListener("click", (p) => {
    p.stopPropagation(), u(-1);
  }), d.addEventListener("click", (p) => {
    p.stopPropagation(), u(1);
  }), document.addEventListener("keydown", h), r.append(l, o, d), s.append(r, a), document.body.appendChild(s), Y = { overlay: s, onKey: h }, c();
}
function ye() {
  Y && (document.removeEventListener("keydown", Y.onKey), Y.overlay.remove(), Y = null);
}
let ue = null;
function vn(n, i, { onUpload: e }) {
  n._sgAttachDropBound || (n._sgAttachDropBound = !0, n.addEventListener("dragover", (t) => {
    t.dataTransfer?.types?.includes("Files") && (t.preventDefault(), n.classList.add("is-drop-target"));
  }), n.addEventListener("dragleave", () => n.classList.remove("is-drop-target")), n.addEventListener("drop", async (t) => {
    if (!t.dataTransfer?.files?.length) return;
    t.preventDefault(), n.classList.remove("is-drop-target");
    const s = Array.from(t.dataTransfer.files);
    await he(n, i, s, e);
  }));
}
function je(n, i, e) {
  oe();
  const { thumbSize: t, accept: s, multiple: r, onUpload: o, onRemove: a } = e, l = n._sgAttachments || be(i.value), d = f("div", { class: "sg-attach-editor", role: "dialog", "aria-modal": "false" });
  d.addEventListener("mousedown", (_) => _.stopPropagation());
  const c = f("div", { class: "sg-attach-editor-header" }, [
    f(
      "span",
      { class: "sg-attach-editor-title" },
      document.createTextNode(l.length === 1 ? "1 attachment" : `${l.length} attachments`)
    ),
    (() => {
      const _ = f("button", {
        type: "button",
        class: "sg-attach-editor-close",
        "aria-label": "Close"
      });
      return _.innerHTML = De, _.addEventListener("click", oe), _;
    })()
  ]), u = f("div", { class: "sg-attach-editor-grid" });
  function h() {
    const _ = n._sgAttachments || [];
    u.replaceChildren(), _.forEach((y) => u.append(yn(y, n, i, a, t))), c.firstChild.textContent = _.length === 1 ? "1 attachment" : `${_.length} attachments`;
  }
  h(), n._sgAttachRepaint = h;
  const p = f("label", { class: "sg-attach-dropzone", tabindex: "0" });
  p.innerHTML = `
    <span class="sg-attach-dropzone-icon" aria-hidden="true">${Nt}</span>
    <span class="sg-attach-dropzone-text">Drop files, paste, or <strong>browse</strong></span>
  `;
  const g = f("input", { type: "file", multiple: r ? "" : null, accept: s || null });
  g.style.display = "none", p.append(g), g.addEventListener("change", async () => {
    g.files?.length && (await he(n, i, Array.from(g.files), o), g.value = "", h());
  }), p.addEventListener("dragover", (_) => {
    _.dataTransfer?.types?.includes("Files") && (_.preventDefault(), p.classList.add("is-drop-target"));
  }), p.addEventListener("dragleave", () => p.classList.remove("is-drop-target")), p.addEventListener("drop", async (_) => {
    _.dataTransfer?.files?.length && (_.preventDefault(), p.classList.remove("is-drop-target"), await he(n, i, Array.from(_.dataTransfer.files), o), h());
  });
  function b(_) {
    const y = Array.from(_.clipboardData?.files || []);
    y.length !== 0 && (_.preventDefault(), he(n, i, y, o).then(h));
  }
  d.addEventListener("paste", b);
  function v(_) {
    _.key === "Escape" && oe();
  }
  function S(_) {
    !d.contains(_.target) && !n.contains(_.target) && oe();
  }
  document.addEventListener("keydown", v), setTimeout(() => document.addEventListener("mousedown", S), 0), d.append(c, u, p), document.body.appendChild(d), Te(d, n), p.focus(), ue = { pop: d, onKey: v, onDocClick: S, anchor: n };
}
function oe() {
  if (!ue) return;
  const { pop: n, onKey: i, onDocClick: e, anchor: t } = ue;
  document.removeEventListener("keydown", i), document.removeEventListener("mousedown", e), n.remove(), t && delete t._sgAttachRepaint, ue = null;
}
function yn(n, i, e, t, s) {
  const r = f("div", { class: "sg-attach-editor-tile", "data-attachment-id": n.id }), o = f("div", {
    class: "sg-attach-editor-preview",
    style: `width: ${s * 2}px; height: ${s * 2}px;`
  });
  if (z(n) && n.thumb_url)
    o.append(f("img", {
      src: n.thumb_url,
      alt: n.filename,
      width: String(s * 2),
      height: String(s * 2)
    }));
  else {
    const d = Vt(n), c = f("span", { class: `sg-attach-icon is-${d}`, "aria-hidden": "true" });
    c.innerHTML = me[d] || me.file, o.append(c);
  }
  const a = f("div", { class: "sg-attach-editor-meta" }, [
    f(
      "div",
      { class: "sg-attach-editor-name", title: n.filename },
      document.createTextNode(n.filename)
    ),
    f(
      "div",
      { class: "sg-attach-editor-size" },
      document.createTextNode(n.byte_size != null ? J(n.byte_size) : "")
    )
  ]), l = f("button", {
    type: "button",
    class: "sg-attach-editor-remove",
    title: "Remove",
    "aria-label": `Remove ${n.filename}`,
    "data-sg-attach": "remove",
    "data-attachment-id": n.id
  });
  return l.innerHTML = De, l.addEventListener("click", async (d) => {
    d.stopPropagation(), await wn(i, e, n, t);
  }), r.append(o, a, l), r;
}
function Te(n, i) {
  const e = i.getBoundingClientRect();
  n.style.position = "fixed", n.style.left = `${Math.max(8, Math.min(window.innerWidth - 360, e.left))}px`, window.innerHeight - e.bottom > 280 ? n.style.top = `${e.bottom + 4}px` : n.style.top = `${Math.max(8, e.top - n.offsetHeight - 4)}px`;
}
async function he(n, i, e, t) {
  if (e.length) {
    n.classList.add("is-uploading");
    try {
      let s;
      if (typeof t == "function") {
        const r = await t(e, i);
        s = Array.isArray(r) ? r : (n._sgAttachments || []).concat(qe(e));
      } else
        s = (n._sgAttachments || []).concat(qe(e));
      Pt(n, i, be(s));
    } finally {
      n.classList.remove("is-uploading");
    }
  }
}
async function wn(n, i, e, t) {
  let s;
  if (typeof t == "function") {
    const r = await t(e, i);
    s = Array.isArray(r) ? r : (n._sgAttachments || []).filter((o) => o.id !== e.id);
  } else
    s = (n._sgAttachments || []).filter((r) => r.id !== e.id);
  Pt(n, i, be(s));
}
function qe(n) {
  return n.map((i, e) => ({
    id: `local_${Date.now()}_${e}`,
    filename: i.name,
    url: URL.createObjectURL(i),
    content_type: i.type || "",
    byte_size: i.size,
    preview_url: i.type?.startsWith("image/") ? URL.createObjectURL(i) : null,
    thumb_url: i.type?.startsWith("image/") ? URL.createObjectURL(i) : null
  }));
}
function Pt(n, i, e) {
  const { row: t, col: s, api: r } = i;
  t && s?.field != null && (t[s.field] = e), n._sgAttachments = e, r?.applyTransaction ? r.applyTransaction({ update: [t] }) : r?.refreshCells && r.refreshCells({ rowIds: [t?.id ?? t?._sg_id] }), n._sgAttachRepaint && n._sgAttachRepaint();
}
const Cn = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"], Ft = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory"
};
function Sn(n) {
  if (n == null || n === "") return null;
  if (typeof n == "string") return { _raw: n };
  if (typeof n != "object") return null;
  const i = n.state ? String(n.state).trim().toUpperCase() : "";
  return {
    address1: n.address1 ? String(n.address1) : "",
    address2: n.address2 ? String(n.address2) : "",
    address3: n.address3 ? String(n.address3) : "",
    suburb: n.suburb ? String(n.suburb) : "",
    state: i,
    postcode: n.postcode != null ? String(n.postcode) : "",
    country: n.country ? String(n.country) : ""
  };
}
function xn(n) {
  if (!n || n._raw) return n?._raw || "";
  const i = [n.address1, n.address2, n.address3].filter(Boolean), e = [n.suburb, n.state, n.postcode].filter(Boolean).join(" ");
  return e && i.push(e), n.country && n.country.toLowerCase() !== "australia" && i.push(n.country), i.join(`
`);
}
function Bt({ editable: n = !0, empty: i = "" } = {}) {
  return (e) => {
    const { value: t, td: s } = e, r = Sn(t);
    if (s && (s.classList.add("sg-renderer-address-au-cell"), s._sgAddress = r), !r) return i ? document.createTextNode(i) : "";
    n && s && !s._sgAddressEditBound && (s._sgAddressEditBound = !0, s.addEventListener("dblclick", (d) => {
      d._sgAddressHandled || (d._sgAddressHandled = !0, d.stopPropagation(), Ln(s, e));
    }));
    const o = f("div", {
      class: "sg-renderer-address-au",
      title: xn(r)
    });
    if (r._raw)
      return o.append(document.createTextNode(r._raw)), o;
    const a = [r.address1, r.address2].filter(Boolean).join(", "), l = r.suburb || r.state || r.postcode;
    return a && o.append(f("span", { class: "sg-address-au-street" }, document.createTextNode(a))), a && l && o.append(f("span", { class: "sg-address-au-sep" }, document.createTextNode(", "))), r.suburb && o.append(document.createTextNode(r.suburb)), r.state && (r.suburb && o.append(document.createTextNode(" ")), o.append(f("span", {
      class: `sg-address-au-state is-${r.state.toLowerCase()}`,
      title: Ft[r.state] || r.state
    }, document.createTextNode(r.state)))), r.postcode && ((r.suburb || r.state) && o.append(document.createTextNode(" ")), o.append(f(
      "span",
      { class: "sg-address-au-postcode" },
      document.createTextNode(r.postcode)
    ))), r.country && r.country.toLowerCase() !== "australia" && (o.append(document.createTextNode(" ")), o.append(f(
      "span",
      { class: "sg-address-au-country" },
      document.createTextNode(r.country)
    ))), o;
  };
}
let pe = null;
function Ln(n, i) {
  X();
  const e = n._sgAddress && !n._sgAddress._raw ? { ...n._sgAddress } : { address1: "", address2: "", address3: "", suburb: "", state: "", postcode: "", country: "Australia" };
  e.country || (e.country = "Australia");
  const t = f("div", { class: "sg-address-au-editor", role: "dialog", "aria-modal": "false" });
  t.addEventListener("mousedown", (E) => E.stopPropagation());
  const s = f("div", { class: "sg-address-au-editor-header" });
  s.append(
    f("span", { class: "sg-address-au-editor-title" }, document.createTextNode("Edit address"))
  );
  const r = f("form", { class: "sg-address-au-editor-form", novalidate: "novalidate" });
  function o({ label: E, name: I, type: B = "text", value: ee = "", maxlength: te, inputmode: se, placeholder: ne, autocomplete: ie }) {
    const K = f("label", { class: "sg-address-au-editor-field", "data-field": I });
    K.append(f("span", { class: "sg-address-au-editor-label" }, document.createTextNode(E)));
    const W = f("input", {
      type: B,
      name: I,
      value: ee || "",
      maxlength: te || null,
      inputmode: se || null,
      placeholder: ne || null,
      autocomplete: ie || null,
      class: "sg-address-au-editor-input"
    });
    return K.append(W), { wrap: K, input: W };
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
  }), d = f("div", { class: "sg-address-au-editor-line3-wrap" }), c = o({
    label: "Address line 3",
    name: "address3",
    value: e.address3,
    placeholder: "Level / building (optional)",
    autocomplete: "address-line3"
  });
  d.append(c.wrap);
  const u = f("button", {
    type: "button",
    class: "sg-address-au-editor-add-line"
  }, document.createTextNode("+ Add another line"));
  function h() {
    const E = !!(l.input.value.trim() || c.input.value.trim());
    d.hidden = !E, u.hidden = E;
  }
  l.input.addEventListener("input", h), u.addEventListener("click", () => {
    d.hidden = !1, u.hidden = !0, c.input.focus();
  });
  const p = o({
    label: "Suburb",
    name: "suburb",
    value: e.suburb,
    placeholder: "Bondi",
    autocomplete: "address-level2"
  }), g = f("label", { class: "sg-address-au-editor-field", "data-field": "state" });
  g.append(f("span", { class: "sg-address-au-editor-label" }, document.createTextNode("State")));
  const b = f("select", {
    name: "state",
    class: "sg-address-au-editor-input sg-address-au-editor-state",
    autocomplete: "address-level1"
  });
  b.append(f("option", { value: "" }, document.createTextNode("—")));
  for (const E of Cn) {
    const I = f(
      "option",
      { value: E, selected: e.state === E ? "" : null },
      document.createTextNode(`${E} — ${Ft[E]}`)
    );
    b.append(I);
  }
  g.append(b);
  const v = o({
    label: "Postcode",
    name: "postcode",
    type: "text",
    value: e.postcode,
    maxlength: 4,
    inputmode: "numeric",
    placeholder: "2026",
    autocomplete: "postal-code"
  });
  v.input.classList.add("sg-address-au-editor-postcode"), v.input.addEventListener("input", () => {
    v.input.value = v.input.value.replace(/\D/g, "").slice(0, 4);
  });
  const S = o({
    label: "Country",
    name: "country",
    value: e.country,
    autocomplete: "country-name"
  }), _ = f("div", { class: "sg-address-au-editor-grid" });
  _.append(a.wrap), _.append(l.wrap, u), _.append(d), _.append(p.wrap, g, v.wrap), _.append(S.wrap);
  const y = f("div", { class: "sg-address-au-editor-footer" }), w = f(
    "button",
    { type: "button", class: "sg-address-au-editor-cancel" },
    document.createTextNode("Cancel")
  ), x = f(
    "button",
    { type: "submit", class: "sg-address-au-editor-save" },
    document.createTextNode("Save")
  );
  y.append(w, x), r.append(_, y), t.append(s, r);
  function M() {
    return {
      address1: a.input.value.trim(),
      address2: l.input.value.trim(),
      address3: d.hidden ? "" : c.input.value.trim(),
      suburb: p.input.value.trim(),
      state: b.value,
      postcode: v.input.value.trim(),
      country: S.input.value.trim() || "Australia"
    };
  }
  function T() {
    const E = M(), I = !E.address1 && !E.suburb && !E.state && !E.postcode;
    An(n, i, I ? null : E), X();
  }
  r.addEventListener("submit", (E) => {
    E.preventDefault(), T();
  }), w.addEventListener("click", () => X());
  function C(E) {
    E.key === "Escape" && (E.stopPropagation(), X());
  }
  function D(E) {
    !t.contains(E.target) && !n.contains(E.target) && X();
  }
  document.addEventListener("keydown", C), setTimeout(() => document.addEventListener("mousedown", D), 0), document.body.appendChild(t), Te(t, n), h(), a.input.focus(), a.input.select(), pe = { pop: t, onKey: C, onDocClick: D };
}
function X() {
  if (!pe) return;
  const { pop: n, onKey: i, onDocClick: e } = pe;
  document.removeEventListener("keydown", i), document.removeEventListener("mousedown", e), n.remove(), pe = null;
}
function An(n, i, e) {
  const { row: t, col: s, api: r } = i, o = t && s?.field != null ? t[s.field] : null;
  t && s?.field != null && (t[s.field] = e), n._sgAddress = e, r?.applyTransaction ? r.applyTransaction({ update: [t] }) : r?.refreshCells && r.refreshCells({ rowIds: [t?.id ?? t?._sg_id] });
  const a = n.closest('[data-controller~="grid"]');
  a && a.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
    bubbles: !0,
    detail: { rowId: t?.id ?? t?._sg_id, colId: s?.field, oldValue: o, newValue: e }
  }));
}
function Ht({ color: n = "green", showValue: i = !1 } = {}) {
  return ({ value: e }) => {
    let t = Number(e);
    Number.isFinite(t) || (t = 0), t = Math.max(0, Math.min(100, t));
    const s = f("div", { class: "sg-renderer-progress" }, [
      f("div", { class: `sg-renderer-progress-fill sg-fill-${n}`, style: `width: ${t}%;` })
    ]);
    return i ? f("div", { class: "sg-renderer-progress-wrap" }, [
      s,
      f("span", { class: "sg-renderer-progress-label" }, document.createTextNode(`${Math.round(t)}%`))
    ]) : s;
  };
}
const Q = '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>';
function Gt({ max: n = 5, precision: i = 0.5 } = {}) {
  const e = i > 0 ? 1 / i : 2;
  return ({ value: t }) => {
    let s = parseFloat(t);
    Number.isFinite(s) || (s = 0), s = Math.max(0, Math.min(n, s)), s = Math.round(s * e) / e;
    const r = f("div", {
      class: "sg-renderer-stars",
      role: "img",
      "aria-label": `${s} out of ${n} stars`
    });
    for (let o = 1; o <= n; o++)
      if (s >= o)
        r.append(f("span", { class: "sg-renderer-star is-full", "aria-hidden": "true" }, Q));
      else if (s > o - 1) {
        const a = Math.round((s - (o - 1)) * 100);
        r.append(f(
          "span",
          { class: "sg-renderer-star is-partial", "aria-hidden": "true" },
          `${Q}<span class="sg-star-clip" style="width: ${a}%;">${Q}</span>`
        ));
      } else
        r.append(f("span", { class: "sg-renderer-star is-empty", "aria-hidden": "true" }, Q));
    return r;
  };
}
function Ot({ separator: n = "," } = {}) {
  return ({ value: i }) => {
    if (k(i)) return "";
    const e = Array.isArray(i) ? i : String(i).split(n), t = f("div", { class: "sg-renderer-tags" });
    for (const s of e) {
      const r = String(s).trim();
      r && t.append(f("span", { class: "sg-renderer-tag" }, document.createTextNode(r)));
    }
    return t;
  };
}
function zt({ showCode: n = !0, fallback: i = null } = {}) {
  return ({ value: e }) => {
    if (k(e)) return "";
    const t = String(e).trim().toUpperCase();
    if (t.length !== 2 || !/^[A-Z]{2}$/.test(t))
      return i ?? document.createTextNode(String(e));
    const s = String.fromCodePoint(
      127462 + t.charCodeAt(0) - 65,
      127462 + t.charCodeAt(1) - 65
    ), r = f("span", { class: "sg-renderer-country" });
    return r.append(f("span", { class: "sg-renderer-flag", "aria-hidden": "true" }, document.createTextNode(s))), n && r.append(f("span", { class: "sg-renderer-country-code" }, document.createTextNode(t))), r;
  };
}
function Mn(n) {
  const i = String(n).replace(/\s+/g, "");
  if (i.length !== 11 || !/^\d{11}$/.test(i)) return !1;
  const e = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19], t = parseInt(i[0], 10) - 1 + i.slice(1);
  let s = 0;
  for (let r = 0; r < 11; r++) s += parseInt(t[r], 10) * e[r];
  return s % 89 === 0;
}
function En(n) {
  const i = String(n).replace(/\D/g, "");
  return i.length !== 11 ? String(n) : `${i.slice(0, 2)} ${i.slice(2, 5)} ${i.slice(5, 8)} ${i.slice(8)}`;
}
function jt() {
  return ({ value: n }) => {
    if (k(n)) return "";
    if (!Mn(n))
      return f("span", { class: "sg-renderer-invalid", title: "Invalid ABN" }, document.createTextNode(String(n)));
    const i = String(n).replace(/\s+/g, "");
    return f("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/ABN/View?id=${i}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(En(n)));
  };
}
function qt({
  lookup: n = null,
  nameField: i = null,
  avatarField: e = null,
  windowKey: t = "__sgUsers",
  size: s = 22
} = {}) {
  return ({ value: r, row: o }) => {
    if (k(r)) return "";
    let a = null;
    if (typeof n == "function" && (a = n(r, o) || null), !a && i && (a = { name: o?.[i], avatarUrl: e ? o?.[e] : null }), !a && typeof window < "u" && window[t]) {
      const c = window[t];
      c instanceof Map ? a = c.get(r) || c.get(String(r)) || null : Array.isArray(c) && (a = c.find((u) => `${u.id}` == `${r}`) || null);
    }
    const l = a?.name ?? String(r), d = f("span", { class: "sg-renderer-avatar" });
    if (a?.avatarUrl)
      d.append(f("img", {
        class: "sg-renderer-avatar-img",
        src: a.avatarUrl,
        width: String(s),
        height: String(s),
        alt: ""
      }));
    else {
      const c = String(l).split(/\s+/).filter(Boolean).slice(0, 2).map((u) => u[0]?.toUpperCase() || "").join("");
      d.append(f("span", {
        class: "sg-renderer-avatar-initials",
        style: `width: ${s}px; height: ${s}px;`
      }, document.createTextNode(c)));
    }
    return d.append(f("span", { class: "sg-renderer-avatar-name" }, document.createTextNode(l))), d;
  };
}
const Rn = {
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
function Dn(n) {
  return String(n).toLowerCase().split(/[\s_-]+/).map((i) => i && i[0].toUpperCase() + i.slice(1)).join(" ");
}
function Tn(n = {}, i = null, e = {}) {
  const { titleCase: t = !0, defaultColor: s = "gray" } = e, r = {};
  for (const [a, l] of Object.entries(n)) r[String(a).toLowerCase()] = l;
  const o = {};
  if (i) for (const [a, l] of Object.entries(i)) o[String(a).toLowerCase()] = l;
  return ({ value: a }) => {
    if (k(a)) return "";
    const l = String(a).toLowerCase(), d = r[l] || s, c = t ? Dn(a) : String(a), u = f("span", { class: `sg-pill sg-pill-${d}` });
    if (i) {
      const h = o[l], p = h ? Rn[h] || h : null;
      if (p) {
        const g = f("span", { class: "sg-pill-icon", "aria-hidden": "true" });
        g.innerHTML = p, u.append(g);
      }
    }
    return u.append(f("span", { class: "sg-pill-label" }, document.createTextNode(c))), u;
  };
}
function Kt({
  truthy: n = Re,
  disabled: i = !1
} = {}) {
  return (e) => {
    const { value: t, row: s, col: r, api: o, td: a } = e;
    a && a.classList.add("sg-renderer-checkbox-cell");
    const l = f("span", { class: "sg-renderer-checkbox" }), d = f("input", {
      type: "checkbox",
      class: "sg-renderer-checkbox-input",
      disabled: i ? "" : null,
      "aria-label": r?.field || "toggle"
    });
    return t == null || t === "" ? d.indeterminate = !0 : d.checked = n(t), d.addEventListener("click", (c) => c.stopPropagation()), d.addEventListener("change", (c) => {
      if (i) {
        c.preventDefault();
        return;
      }
      const u = d.checked, h = s && r?.field != null ? s[r.field] : null;
      s && r?.field != null && (s[r.field] = u), o?.applyTransaction && o.applyTransaction({ update: [s] });
      const p = a?.closest('[data-controller~="grid"]');
      p && p.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: s?.id ?? s?._sg_id, colId: r?.field, oldValue: h, newValue: u }
      }));
    }), l.append(d), l;
  };
}
const kn = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z"/></svg>', we = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>', Nn = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>', Vn = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/></svg>', In = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/></svg>', $n = De;
function Ut(n) {
  if (n == null || n === "") return null;
  if (typeof n == "string") {
    const e = n.trim();
    if (!e) return null;
    const t = e.split("/").pop()?.match(/^[^?#]+/)?.[0] || "";
    return { url: e, filename: t || "audio", byte_size: null, duration: null };
  }
  if (typeof n != "object") return null;
  const i = n.url || n.src || n.href;
  return i ? {
    url: String(i),
    filename: n.filename || n.name || String(i).split("/").pop()?.split("?")[0] || "audio",
    byte_size: n.byte_size ?? n.byteSize ?? n.size ?? null,
    duration: Number.isFinite(n.duration) ? Number(n.duration) : null,
    content_type: n.content_type || n.contentType || n.mime_type || ""
  } : null;
}
function Z(n) {
  (!Number.isFinite(n) || n < 0) && (n = 0);
  const i = Math.floor(n), e = Math.floor(i / 3600), t = Math.floor(i % 3600 / 60), s = i % 60, r = (o) => String(o).padStart(2, "0");
  return e > 0 ? `${e}:${r(t)}:${r(s)}` : `${t}:${r(s)}`;
}
function Wt({
  showFilename: n = !0,
  iconOnly: i = !1,
  empty: e = "",
  preferHowler: t = !0,
  skipSeconds: s = 10
} = {}) {
  return (r) => {
    const { value: o, td: a } = r, l = Ut(o);
    if (a && (a.classList.add("sg-renderer-audio-cell"), a._sgAudio = l, a._sgAudioOpts = { preferHowler: t, skipSeconds: s }), !l) return e ? document.createTextNode(e) : "";
    a && !a._sgAudioDblBound && (a._sgAudioDblBound = !0, a.addEventListener("dblclick", (u) => {
      u._sgAudioHandled || (u._sgAudioHandled = !0, u.stopPropagation(), u.preventDefault(), Ke(a, r));
    }));
    const d = f("div", { class: "sg-renderer-audio" }), c = f("button", {
      type: "button",
      class: "sg-audio-icon",
      title: `${l.filename}${l.byte_size != null ? " · " + J(l.byte_size) : ""} — double-click to play`,
      "aria-label": `Play ${l.filename}`,
      "data-sg-audio": "open"
    });
    if (c.innerHTML = kn, c.addEventListener("click", (u) => {
      u.stopPropagation(), Ke(a, r);
    }), c.addEventListener("dblclick", (u) => {
      u._sgAudioHandled = !0, u.stopPropagation();
    }), d.append(c), n && !i) {
      const u = f(
        "span",
        { class: "sg-audio-name" },
        document.createTextNode(l.filename)
      );
      d.append(u), l.duration != null && d.append(f(
        "span",
        { class: "sg-audio-duration" },
        document.createTextNode(Z(l.duration))
      ));
    }
    return d;
  };
}
function Pn(n, { preferHowler: i } = {}) {
  return i && typeof window < "u" && window.Howl ? new Bn(n) : new Fn(n);
}
class Fn {
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
class Bn {
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
let fe = null;
function Ke(n, i) {
  ae();
  const e = n._sgAudio || Ut(i.value);
  if (!e) return;
  const t = n._sgAudioOpts || { preferHowler: !0, skipSeconds: 10 }, s = Pn(e.url, t), r = f("div", { class: "sg-audio-player", role: "dialog", "aria-label": "Audio player" });
  r.addEventListener("mousedown", (R) => R.stopPropagation());
  const o = f("div", { class: "sg-audio-player-header" }), a = f(
    "div",
    { class: "sg-audio-player-name", title: e.filename },
    document.createTextNode(e.filename)
  ), l = f("div", { class: "sg-audio-player-meta" }), d = [];
  e.byte_size != null && d.push(J(e.byte_size)), s.backendName() === "howler" && d.push("howler.js"), l.textContent = d.join(" · ");
  const c = f("button", {
    type: "button",
    class: "sg-audio-player-close",
    "aria-label": "Close player"
  });
  c.innerHTML = $n, c.addEventListener("click", ae), o.append(a, l, c);
  const u = f("div", {
    class: "sg-audio-track",
    role: "slider",
    "aria-label": "Seek",
    tabindex: "0",
    "aria-valuemin": "0",
    "aria-valuemax": "0",
    "aria-valuenow": "0"
  }), h = f("div", { class: "sg-audio-track-fill" }), p = f("div", { class: "sg-audio-track-thumb" });
  u.append(h, p);
  const g = f("div", { class: "sg-audio-times" }), b = f("span", { class: "sg-audio-time-current" }, document.createTextNode("0:00")), v = f(
    "span",
    { class: "sg-audio-time-total" },
    document.createTextNode(e.duration ? Z(e.duration) : "--:--")
  );
  g.append(b, v);
  const S = f("div", { class: "sg-audio-transport" }), _ = f("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Back ${t.skipSeconds}s`,
    "aria-label": `Back ${t.skipSeconds} seconds`
  });
  _.innerHTML = Vn;
  const y = f("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-play",
    title: "Play / pause (Space)",
    "aria-label": "Play",
    "data-state": "paused"
  });
  y.innerHTML = we;
  const w = f("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Forward ${t.skipSeconds}s`,
    "aria-label": `Forward ${t.skipSeconds} seconds`
  });
  w.innerHTML = In, S.append(_, y, w), r.append(o, u, g, S);
  let x = e.duration ?? 0, M = !1, T = null;
  function C(R) {
    const P = Math.max(0, Math.min(100, R));
    h.style.width = P + "%", p.style.left = P + "%";
  }
  function D() {
    const R = s.seek(), O = s.duration() || 0 || x || 0;
    if (O > 0 && O !== x && (x = O, v.textContent = Z(x), u.setAttribute("aria-valuemax", String(Math.floor(x)))), !M) {
      const H = x > 0 ? R / x * 100 : 0;
      C(H), b.textContent = Z(R), u.setAttribute("aria-valuenow", String(Math.floor(R)));
    }
  }
  function E() {
    D(), s.isPlaying() ? T = requestAnimationFrame(E) : T = null;
  }
  function I() {
    T == null && (T = requestAnimationFrame(E));
  }
  function B() {
    T != null && cancelAnimationFrame(T), T = null;
  }
  const ee = () => {
    x = s.duration(), D();
  }, te = () => {
    y.dataset.state = "playing", y.innerHTML = Nn, y.setAttribute("aria-label", "Pause"), I();
  }, se = () => {
    y.dataset.state = "paused", y.innerHTML = we, y.setAttribute("aria-label", "Play"), B(), D();
  }, ne = () => {
    y.dataset.state = "paused", y.innerHTML = we, y.setAttribute("aria-label", "Play"), B(), s.seek(0), D();
  };
  s.on("load", ee), s.on("play", te), s.on("pause", se), s.on("end", ne), y.addEventListener("click", (R) => {
    R.stopPropagation(), s.isPlaying() ? s.pause() : s.play();
  }), _.addEventListener("click", (R) => {
    R.stopPropagation(), s.seek(Math.max(0, s.seek() - t.skipSeconds)), D();
  }), w.addEventListener("click", (R) => {
    R.stopPropagation();
    const P = s.duration();
    s.seek(Math.min(P || 1 / 0, s.seek() + t.skipSeconds)), D();
  });
  function ie(R) {
    const P = u.getBoundingClientRect(), O = (R.clientX ?? 0) - P.left, H = Math.max(0, Math.min(1, O / P.width)), Ie = s.duration() || x;
    if (!Ie) return;
    const $e = H * Ie;
    s.seek($e), C(H * 100), b.textContent = Z($e);
  }
  u.addEventListener("pointerdown", (R) => {
    R.preventDefault(), M = !0, u.setPointerCapture?.(R.pointerId), u.classList.add("is-dragging"), ie(R);
  }), u.addEventListener("pointermove", (R) => {
    M && ie(R);
  });
  const K = (R) => {
    if (M) {
      M = !1, u.classList.remove("is-dragging");
      try {
        u.releasePointerCapture?.(R.pointerId);
      } catch {
      }
    }
  };
  u.addEventListener("pointerup", K), u.addEventListener("pointercancel", K), u.addEventListener("keydown", (R) => {
    const P = s.duration() || x;
    if (!P) return;
    const O = R.shiftKey ? 30 : 5;
    let H = null;
    R.key === "ArrowLeft" ? H = Math.max(0, s.seek() - O) : R.key === "ArrowRight" ? H = Math.min(P, s.seek() + O) : R.key === "Home" ? H = 0 : R.key === "End" && (H = P), H != null && (R.preventDefault(), s.seek(H), D());
  });
  function W(R) {
    R.key === "Escape" ? (R.preventDefault(), ae()) : (R.key === " " || R.code === "Space") && r.contains(document.activeElement) && (R.preventDefault(), s.isPlaying() ? s.pause() : s.play());
  }
  function Ve(R) {
    !r.contains(R.target) && !n.contains(R.target) && ae();
  }
  document.addEventListener("keydown", W), setTimeout(() => document.addEventListener("mousedown", Ve), 0), document.body.appendChild(r), Te(r, n), D(), y.focus(), fe = {
    pop: r,
    backend: s,
    onKey: W,
    onDocClick: Ve,
    cleanup: () => {
      B();
      try {
        s.off("load", ee), s.off("play", te), s.off("pause", se), s.off("end", ne);
      } catch {
      }
      s.destroy();
    }
  };
}
function ae() {
  if (!fe) return;
  const { pop: n, onKey: i, onDocClick: e, cleanup: t } = fe;
  document.removeEventListener("keydown", i), document.removeEventListener("mousedown", e), t(), n.remove(), fe = null;
}
function Xt({
  truthy: n = Re,
  disabled: i = !1
} = {}) {
  return (e) => {
    const { value: t, row: s, col: r, api: o, td: a } = e;
    a && a.classList.add("sg-renderer-switch-cell");
    const l = t == null || t === "", d = !l && n(t), c = f("button", {
      type: "button",
      class: `sg-renderer-switch${d ? " is-on" : ""}${l ? " is-null" : ""}`,
      role: "switch",
      "aria-checked": l ? "mixed" : d ? "true" : "false",
      "aria-label": r?.field || "toggle",
      disabled: i ? "" : null
    });
    return c.append(f("span", { class: "sg-renderer-switch-thumb", "aria-hidden": "true" })), c.addEventListener("click", (u) => {
      if (u.stopPropagation(), i) return;
      const h = l ? !0 : !d, p = s && r?.field != null ? s[r.field] : null;
      s && r?.field != null && (s[r.field] = h), o?.applyTransaction && o.applyTransaction({ update: [s] });
      const g = a?.closest('[data-controller~="grid"]');
      g && g.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: s?.id ?? s?._sg_id, colId: r?.field, oldValue: p, newValue: h }
      }));
    }), c;
  };
}
const Hn = /^(https?:\/\/|mailto:)/i;
function Yt(n) {
  return String(n).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Ae(n) {
  let i = n;
  return i = i.replace(/`([^`\n]+)`/g, (e, t) => `<code>${t}</code>`), i = i.replace(/\[([^\]\n]+)\]\(([^)\n]+)\)/g, (e, t, s) => Hn.test(s) ? `<a href="${s}" target="_blank" rel="noopener noreferrer">${t}</a>` : e), i = i.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>"), i = i.replace(/__([^_\n]+)__/g, "<strong>$1</strong>"), i = i.replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), i = i.replace(/(^|[\s(])_([^_\n]+?)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), i = i.replace(/~~([^~\n]+)~~/g, "<del>$1</del>"), i;
}
function Gn(n) {
  const i = n.split(`
`), e = [];
  let t = null, s = [];
  const r = () => {
    t && (e.push(`<${t}>${s.map((o) => `<li>${Ae(o)}</li>`).join("")}</${t}>`), t = null, s = []);
  };
  for (const o of i) {
    const a = /^\s*[-*]\s+(.+)$/.exec(o), l = /^\s*\d+\.\s+(.+)$/.exec(o);
    a ? (t && t !== "ul" && r(), t = "ul", s.push(a[1])) : l ? (t && t !== "ol" && r(), t = "ol", s.push(l[1])) : (r(), o.trim() === "" ? e.push("") : e.push(Ae(o)));
  }
  return r(), e.join("<br>").replace(/(<br>){2,}/g, "<br><br>");
}
function Qt({ inline: n = !1 } = {}) {
  return ({ value: i, td: e }) => {
    if (k(i)) return "";
    const t = Yt(i), s = n ? Ae(t) : Gn(t);
    if (e) {
      e.classList.add("sg-renderer-markdown-cell");
      const o = e.parentElement;
      o && o.tagName === "TR" && o.classList.add("sg-has-multiline");
    }
    const r = f("div", { class: `sg-renderer-markdown${n ? " is-inline" : ""}` });
    return r.innerHTML = s, r;
  };
}
function On(n) {
  return Yt(n).replace(/(&quot;(?:[^&\\]|\\.)*?&quot;)\s*:/g, '<span class="sg-json-key">$1</span>:').replace(/:\s*(&quot;(?:[^&\\]|\\.)*?&quot;)/g, ': <span class="sg-json-string">$1</span>').replace(/(?<=[\s:,\[])(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)(?=[\s,\]\}\n])/g, '<span class="sg-json-number">$1</span>').replace(/(?<=[\s:,\[])(true|false)(?=[\s,\]\}\n])/g, '<span class="sg-json-bool">$1</span>').replace(/(?<=[\s:,\[])(null)(?=[\s,\]\}\n])/g, '<span class="sg-json-null">$1</span>');
}
function zn(n, i) {
  const e = Array.isArray(n), t = e ? n : Object.entries(n), s = t.slice(0, i), r = t.length - s.length, o = (d) => {
    if (d == null) return "null";
    const c = typeof d;
    return c === "string" ? d.length > 18 ? `"${d.slice(0, 15)}…"` : `"${d}"` : c === "number" || c === "boolean" ? String(d) : Array.isArray(d) ? `[${d.length}]` : c === "object" ? "{…}" : String(d);
  }, a = e ? s.map(o).join(", ") : s.map(([d, c]) => `${d}: ${o(c)}`).join(", "), l = r > 0 ? `, +${r}` : "";
  return e ? `[${a}${l}]` : `{ ${a}${l} }`;
}
function Zt({ maxKeys: n = 3, indent: i = 2 } = {}) {
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
      return f("span", { class: "sg-renderer-json-scalar sg-json-null" }, document.createTextNode("null"));
    if (typeof s != "object") {
      const d = typeof s, c = d === "string" ? "sg-json-string" : d === "number" ? "sg-json-number" : "sg-json-bool", u = d === "string" ? `"${s}"` : String(s);
      return f("span", { class: `sg-renderer-json-scalar ${c}` }, document.createTextNode(u));
    }
    const r = document.createElement("details");
    r.className = "sg-renderer-json";
    const o = document.createElement("summary");
    o.className = "sg-renderer-json-summary";
    const a = f("span", { class: "sg-renderer-json-chevron", "aria-hidden": "true" });
    a.innerHTML = Ws, o.append(a), o.append(f(
      "span",
      { class: "sg-renderer-json-summary-text" },
      document.createTextNode(zn(s, n))
    ));
    const l = document.createElement("pre");
    if (l.className = "sg-renderer-json-pre", l.innerHTML = On(JSON.stringify(s, null, i)), r.append(o, l), o.addEventListener("click", (d) => d.stopPropagation()), t) {
      t.classList.add("sg-renderer-json-cell");
      const d = t.parentElement;
      d && d.tagName === "TR" && d.classList.add("sg-has-multiline");
    }
    return r;
  };
}
function Jt({
  lookup: n = null,
  windowKey: i = "__sgLinks",
  showThumb: e = !0,
  href: t = null,
  multiple: s = !1,
  fallback: r = (o) => String(o)
} = {}) {
  return ({ value: o, row: a }) => {
    if (k(o)) return "";
    const l = s ? Array.isArray(o) ? o : String(o).split(",").map((c) => c.trim()).filter(Boolean) : [o], d = f("span", { class: "sg-renderer-linked-records" });
    for (const c of l) {
      const u = jn(c, a, n, i);
      d.append(qn(c, a, u, { showThumb: e, href: t, fallback: r }));
    }
    return d;
  };
}
function jn(n, i, e, t) {
  if (typeof e == "function") return e(n, i) || null;
  if (typeof window > "u") return null;
  const s = window[t];
  return s ? s instanceof Map ? s.get(n) || s.get(String(n)) || null : typeof s == "object" ? s[n] ?? s[String(n)] ?? null : null : null;
}
function qn(n, i, e, { showThumb: t, href: s, fallback: r }) {
  const o = e?.name ?? r(n), a = typeof s == "function" ? s(n, i, e) : e?.href || null, l = document.createElement(a ? "a" : "span");
  if (l.className = "sg-renderer-linked-record", a && (l.href = a, l.target = "_blank", l.rel = "noopener noreferrer", l.addEventListener("click", (d) => d.stopPropagation())), e?.color && l.style.setProperty("--lr-tint", e.color), t && e?.thumb)
    l.append(f("img", {
      src: e.thumb,
      alt: "",
      class: "sg-renderer-linked-record-thumb",
      loading: "lazy",
      decoding: "async"
    }));
  else if (t && o) {
    const d = String(o).split(/\s+/).filter(Boolean).slice(0, 2).map((c) => c[0]?.toUpperCase() || "").join("");
    d && l.append(f("span", {
      class: "sg-renderer-linked-record-initials",
      "aria-hidden": "true"
    }, document.createTextNode(d)));
  }
  return l.append(f(
    "span",
    { class: "sg-renderer-linked-record-name" },
    document.createTextNode(o)
  )), l;
}
function es({
  separator: n = ",",
  colorMap: i = {},
  defaultColor: e = "gray"
} = {}) {
  const t = {};
  for (const [s, r] of Object.entries(i)) t[String(s).toLowerCase()] = r;
  return ({ value: s }) => {
    if (k(s)) return "";
    const r = Array.isArray(s) ? s : String(s).split(n), o = f("div", { class: "sg-renderer-coloured-tags" });
    for (const a of r) {
      const l = String(a).trim();
      if (!l) continue;
      const d = t[l.toLowerCase()] || e, c = f(
        "span",
        { class: "sg-renderer-coloured-tag" },
        document.createTextNode(l)
      );
      /^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/.test(d) ? c.classList.add(`sg-pill-${d}`) : (c.style.background = d, c.style.color = Kn(d)), o.append(c);
    }
    return o;
  };
}
function Kn(n) {
  const i = Mt(n);
  return i ? Et(i) ? "#1f2937" : "#ffffff" : "inherit";
}
function Un(n) {
  if (n == null || n === "") return null;
  if (n instanceof Date)
    return Number.isNaN(n.valueOf()) ? null : { h: n.getHours(), m: n.getMinutes(), s: n.getSeconds() };
  if (typeof n == "number" && Number.isFinite(n)) {
    const s = (n % 86400 + 86400) % 86400;
    return { h: Math.floor(s / 3600), m: Math.floor(s % 3600 / 60), s: Math.floor(s % 60) };
  }
  const i = String(n).trim(), e = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/.exec(i);
  if (e)
    return { h: parseInt(e[1], 10), m: parseInt(e[2], 10), s: e[3] ? parseInt(e[3], 10) : 0 };
  const t = new Date(i);
  return Number.isNaN(t.valueOf()) ? null : { h: t.getHours(), m: t.getMinutes(), s: t.getSeconds() };
}
function ts({
  style: n = "24h",
  // '24h' | '12h'
  seconds: i = !1,
  locale: e = void 0
} = {}) {
  return ({ value: t }) => {
    const s = Un(t);
    if (!s) return "";
    if (n === "12h") {
      const a = /* @__PURE__ */ new Date(0);
      return a.setHours(s.h, s.m, s.s), new Intl.DateTimeFormat(e, {
        hour: "numeric",
        minute: "2-digit",
        ...i ? { second: "2-digit" } : {},
        hour12: !0
      }).format(a);
    }
    const r = (a) => String(a).padStart(2, "0"), o = i ? `:${r(s.s)}` : "";
    return `${r(s.h)}:${r(s.m)}${o}`;
  };
}
function Wn(n) {
  if (Array.isArray(n)) return { from: n[0], to: n[1] };
  if (n && typeof n == "object")
    return {
      from: n.from ?? n.old ?? n.before ?? n.previous ?? null,
      to: n.to ?? n.new ?? n.after ?? n.current ?? null
    };
  const i = String(n), e = /^(.*?)\s*(?:→|->|=>|—>)\s*(.+)$/.exec(i);
  return e ? { from: e[1].trim(), to: e[2].trim() } : { from: null, to: i };
}
function ss({
  style: n = "inline",
  // 'inline' | 'stacked'
  arrow: i = "→",
  showArrow: e = !0
} = {}) {
  return ({ value: t }) => {
    if (k(t)) return "";
    const { from: s, to: r } = Wn(t), o = (l) => l == null || l === "";
    if (o(s) && o(r)) return "";
    if (o(s))
      return f(
        "span",
        { class: "sg-renderer-diff is-added" },
        f("span", { class: "sg-diff-to" }, document.createTextNode(String(r)))
      );
    if (o(r))
      return f(
        "span",
        { class: "sg-renderer-diff is-removed" },
        f("span", { class: "sg-diff-from" }, document.createTextNode(String(s)))
      );
    const a = f("span", { class: `sg-renderer-diff is-${n}` });
    return a.append(f("span", { class: "sg-diff-from" }, document.createTextNode(String(s)))), e && a.append(f(
      "span",
      { class: "sg-diff-arrow", "aria-hidden": "true" },
      document.createTextNode(i)
    )), a.append(f("span", { class: "sg-diff-to" }, document.createTextNode(String(r)))), a;
  };
}
function Xn(n) {
  if (n == null || n === "") return null;
  if (Array.isArray(n)) {
    const s = Number(n[0]), r = Number(n[1]);
    return Number.isFinite(s) && Number.isFinite(r) ? { lat: s, lng: r } : null;
  }
  if (typeof n == "object") {
    const s = Number(n.lat ?? n.latitude), r = Number(n.lng ?? n.long ?? n.lon ?? n.longitude);
    return Number.isFinite(s) && Number.isFinite(r) ? { lat: s, lng: r } : null;
  }
  const i = String(n).split(",");
  if (i.length !== 2) return null;
  const e = Number(i[0].trim()), t = Number(i[1].trim());
  return Number.isFinite(e) && Number.isFinite(t) ? { lat: e, lng: t } : null;
}
function Ue(n, i) {
  const e = n >= 0 ? 1 : -1, t = Math.abs(n), s = Math.floor(t), r = (t - s) * 60, o = Math.floor(r), a = (r - o) * 60, l = i ? e > 0 ? "N" : "S" : e > 0 ? "E" : "W";
  return `${s}°${String(o).padStart(2, "0")}'${a.toFixed(1)}"${l}`;
}
function ns({
  decimals: n = 4,
  style: i = "decimal",
  // 'decimal' | 'dms'
  mapUrl: e = (o, a) => `https://www.google.com/maps?q=${o},${a}`,
  linkText: t = "View on Maps",
  staticMap: s = null,
  // (lat, lng) => url
  staticSize: r = 72
} = {}) {
  return ({ value: o }) => {
    const a = Xn(o);
    if (!a) return "";
    const l = f("span", { class: "sg-renderer-geo" });
    if (typeof s == "function") {
      const u = s(a.lat, a.lng);
      u && l.append(f("img", {
        src: u,
        alt: "",
        class: "sg-renderer-geo-thumb",
        width: String(r),
        height: String(r),
        loading: "lazy",
        decoding: "async"
      }));
    }
    const d = i === "dms" ? `${Ue(a.lat, !0)} ${Ue(a.lng, !1)}` : `${a.lat.toFixed(n)}, ${a.lng.toFixed(n)}`;
    l.append(f("span", { class: "sg-renderer-geo-coords" }, document.createTextNode(d)));
    const c = e(a.lat, a.lng);
    if (c) {
      const u = f("a", {
        class: "sg-renderer-geo-link sg-renderer-link",
        href: c,
        target: "_blank",
        rel: "noopener noreferrer",
        title: "Open in maps"
      }, document.createTextNode(t));
      u.addEventListener("click", (h) => h.stopPropagation()), l.append(u);
    }
    return l;
  };
}
function is({
  moduleSize: n = 3,
  margin: i = 2,
  background: e = "#fff",
  foreground: t = "#111827",
  showText: s = !1
} = {}) {
  return ({ value: r }) => {
    if (k(r)) return "";
    const o = String(r);
    let a;
    try {
      const d = Bs(o);
      a = Us(d, { moduleSize: n, margin: i, background: e, foreground: t });
    } catch {
      return f(
        "span",
        { class: "sg-renderer-qr-overflow", title: o },
        document.createTextNode("QR · too long")
      );
    }
    const l = f("span", { class: "sg-renderer-qr" });
    return l.innerHTML = a, s && l.append(f("span", { class: "sg-renderer-qr-text" }, document.createTextNode(o))), l;
  };
}
function rs({
  language: n = null,
  copy: i = !0
} = {}) {
  return ({ value: e, td: t }) => {
    if (k(e)) return "";
    const s = String(e);
    if (t) {
      t.classList.add("sg-renderer-code-cell");
      const a = t.parentElement;
      a && a.tagName === "TR" && a.classList.add("sg-has-multiline");
    }
    const r = f("div", { class: "sg-renderer-code" });
    if (n && r.append(f(
      "span",
      { class: "sg-renderer-code-lang" },
      document.createTextNode(String(n))
    )), i) {
      const a = f("button", {
        type: "button",
        class: "sg-renderer-code-copy",
        title: "Copy",
        "aria-label": "Copy code"
      });
      a.innerHTML = ge, a.addEventListener("click", async (l) => {
        l.stopPropagation();
        try {
          navigator.clipboard?.writeText ? await navigator.clipboard.writeText(s) : St(s), a.innerHTML = wt, a.classList.add("is-copied"), setTimeout(() => {
            a.innerHTML = ge, a.classList.remove("is-copied");
          }, 1200);
        } catch {
        }
      }), r.append(a);
    }
    const o = f("pre", { class: "sg-renderer-code-pre" });
    return o.textContent = s, r.append(o), r;
  };
}
const Yn = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M225.8 468.2L46.9 295.4C18.9 268.2 0 230.1 0 187.8C0 117.4 56.1 60 125.7 60c25.3 0 51 9.2 70.3 25.4L256 138l60-52.6C335.3 69.2 361 60 386.3 60C455.9 60 512 117.4 512 187.8c0 42.3-18.9 80.4-46.9 107.6L286.2 468.2c-7.2 7.4-17.1 11.8-27.6 11.8c-10.5 0-20.4-4.4-27.6-11.8z"/></svg>', Qn = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75.1c16.3-13.2 28.9-30.4 36.6-50l8.1-20.3c5-12.4 11.3-24.2 19-35.2l4.4-6.3 0 0c1.4-2 1.1-4.7-.6-6.4l0 0c-3.8-3.8-9.9-3.8-13.7 0L208.8 84.9c-3 3-7 4.7-11.3 4.7c-8.8 0-16-7.2-16-16V63.4c0-8.8 7.2-16 16-16h.5c8.8 0 16 7.2 16 16v6.2c34-2.4 71-13 100-25.6c11-4.8 22.1-9.3 33-13.6l1-.4c12-4.6 27.3-9.3 41.4-9.3z"/></svg>', Zn = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75.1c16.3 13.2 28.9 30.4 36.6 50l8.1 20.3c5 12.4 11.3 24.2 19 35.2l4.4 6.3c1.4 2 1.1 4.7-.6 6.4c-3.8 3.8-9.9 3.8-13.7 0L208.8 427.1c-3-3-7-4.7-11.3-4.7c-8.8 0-16 7.2-16 16v10.2c0 8.8 7.2 16 16 16h.5c8.8 0 16-7.2 16-16v-6.2c34 2.4 71 13 100 25.6c11 4.8 22.1 9.3 33 13.6l1 .4c12 4.6 27.3 9.3 41.4 9.3z"/></svg>', Ce = ["😞", "😕", "😐", "🙂", "😄"], We = {
  star: Q,
  heart: Yn
}, Xe = {
  star: "#f59e0b",
  heart: "#ec4899"
};
function os({
  icon: n = "heart",
  max: i = 5,
  precision: e = 0.5,
  color: t = null
} = {}) {
  if (n === "smiley") return Jn({ max: i });
  if (n === "thumb") return ei();
  if (n === "nps") return ti();
  const s = We[n] || We.heart, r = t || Xe[n] || Xe.heart, o = e > 0 ? 1 / e : 2;
  return ({ value: a }) => {
    let l = parseFloat(a);
    Number.isFinite(l) || (l = 0), l = Math.max(0, Math.min(i, l)), l = Math.round(l * o) / o;
    const d = f("div", {
      class: `sg-renderer-rating is-${n}`,
      style: `--rating-color: ${r};`,
      role: "img",
      "aria-label": `${l} out of ${i}`
    });
    for (let c = 1; c <= i; c++)
      if (l >= c)
        d.append(f("span", { class: "sg-renderer-rating-glyph is-full" }, s));
      else if (l > c - 1) {
        const u = Math.round((l - (c - 1)) * 100);
        d.append(f(
          "span",
          { class: "sg-renderer-rating-glyph is-partial" },
          `${s}<span class="sg-rating-clip" style="width:${u}%;">${s}</span>`
        ));
      } else
        d.append(f("span", { class: "sg-renderer-rating-glyph is-empty" }, s));
    return d;
  };
}
function Jn({ max: n = 5 } = {}) {
  return ({ value: i }) => {
    let e = parseFloat(i);
    if (!Number.isFinite(e)) return "";
    e = Math.max(1, Math.min(n, Math.round(e)));
    const t = Math.min(
      Ce.length - 1,
      Math.floor((e - 1) / (n - 1 || 1) * (Ce.length - 1))
    );
    return f("span", {
      class: "sg-renderer-rating-smiley",
      title: `${e}/${n}`
    }, document.createTextNode(Ce[t]));
  };
}
function ei() {
  return ({ value: n }) => {
    if (n == null || n === "") return "";
    const i = Number(n);
    if (!Number.isFinite(i)) return "";
    const e = f("span", { class: "sg-renderer-rating-thumb" });
    return i > 0 ? (e.classList.add("is-up"), e.title = "Thumbs up", e.innerHTML = Qn) : i < 0 ? (e.classList.add("is-down"), e.title = "Thumbs down", e.innerHTML = Zn) : (e.classList.add("is-neutral"), e.title = "Neutral", e.append(document.createTextNode("—"))), e;
  };
}
function ti() {
  return ({ value: n }) => {
    const i = parseFloat(n);
    if (!Number.isFinite(i)) return "";
    const e = Math.max(0, Math.min(10, Math.round(i))), t = e <= 6 ? "detractor" : e <= 8 ? "passive" : "promoter", s = t === "detractor" ? "Detractor" : t === "passive" ? "Passive" : "Promoter";
    return f("span", {
      class: `sg-renderer-rating-nps is-${t}`,
      title: `${e}/10 · ${s}`
    }, document.createTextNode(String(e)));
  };
}
A("email", ot());
A("url", at());
A("phone", lt());
A("currency", dt());
A("percent", ct());
A("progress-bar", Ht());
A("star-rating", Gt());
A("tags", Ot());
A("country-flag", zt());
A("abn", jt());
A("avatar", qt());
A("date", ut());
A("datetime", ht());
A("relative-time", pt());
A("duration", ft());
A("number", gt());
A("compact-number", mt());
A("file-size", _t());
A("boolean", bt());
A("delta", vt());
A("truncate", yt());
A("copyable", Ct());
A("image", xt());
A("color-swatch", Lt());
A("sparkline", At());
A("heatmap-cell", Rt());
A("mask", Dt());
A("highlight", Tt());
A("multi-line", kt());
A("attachments", It());
A("address-au", Bt());
A("checkbox", Kt());
A("switch", Xt());
A("markdown", Qt());
A("json", Zt());
A("linked-record", Jt());
A("coloured-tags", es());
A("time", ts());
A("diff", ss());
A("geo", ns());
A("qr", is());
A("code", rs());
A("rating", os());
A("audio-attachment", Wt());
const si = {
  email: ot,
  url: at,
  phone: lt,
  currency: dt,
  percent: ct,
  progressBar: Ht,
  starRating: Gt,
  tags: Ot,
  countryFlag: zt,
  abn: jt,
  avatar: qt,
  statusPill: Tn,
  date: ut,
  datetime: ht,
  relativeTime: pt,
  duration: ft,
  number: gt,
  compactNumber: mt,
  fileSize: _t,
  boolean: bt,
  delta: vt,
  truncate: yt,
  copyable: Ct,
  image: xt,
  colorSwatch: Lt,
  sparkline: At,
  heatmap: Rt,
  mask: Dt,
  highlight: Tt,
  multiLine: kt,
  attachments: It,
  addressAu: Bt,
  checkbox: Kt,
  switch: Xt,
  markdown: Qt,
  json: Zt,
  linkedRecord: Jt,
  colouredTags: es,
  time: ts,
  diff: ss,
  geo: ns,
  qr: is,
  code: rs,
  rating: os,
  audioAttachment: Wt
}, ni = 32, Ye = 100, le = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', ii = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>', ri = /* @__PURE__ */ new Set([
  "number",
  "currency",
  "percent",
  "compactNumber",
  "fileSize",
  "duration"
]), oi = /* @__PURE__ */ new Set([
  "color",
  "date",
  "datetime-local",
  "time",
  "month",
  "week"
]), Qe = [
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
class ke extends q {
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
      const s = t.getAttribute("data-field") || t.getAttribute("data-header-cell-field-value"), r = this._colByField(s);
      !r || r._isCheckbox || r._isRowNumber || r._isGroupCol || r._isPivot || (e.preventDefault(), this._showColumnMenu(r, e.clientX, e.clientY));
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
      const r = this.state.rowData.find((u) => this._rowId(u) === t.rowId), o = { rowId: t.rowId, colId: t.colId, files: s, row: r, dataTransfer: e.dataTransfer }, a = new CustomEvent("grid:fileAttached", { detail: o, bubbles: !0, cancelable: !0 });
      if (!this.element.dispatchEvent(a) || !r) return;
      const d = this.attachmentsFieldValue || t.colId, c = Array.isArray(r[d]) ? r[d].slice() : [];
      for (const u of s) {
        let h = "";
        try {
          h = URL.createObjectURL(u);
        } catch {
        }
        c.push({
          id: `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
          filename: u.name,
          name: u.name,
          byte_size: u.size,
          size: u.size,
          content_type: u.type || "application/octet-stream",
          url: h,
          thumb_url: u.type?.startsWith("image/") ? h : null,
          preview_url: u.type?.startsWith("image/") ? h : null
        });
      }
      r[d] = c, this.scheduleRender("cells"), L(this.element, "grid:cellValueChanged", {
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
        const r = e.target.closest?.('td[data-gutter="true"]');
        if (r) {
          const o = r.closest("tr");
          this._rowDragPending = { rowId: this._coerceRowId(o.dataset.rowId), x: e.clientX, y: e.clientY }, this._rowDragMoved = !1, document.addEventListener("mousemove", this._onRowDragMove);
          return;
        }
      }
      if (e.target.closest?.('[data-tree-toggle="true"]')) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : s ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), L(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    N(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const s = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      s && s.focus.rowId === t.rowId && s.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), L(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
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
      const r = this._cellRangeRows(s).map((o) => o.map((a) => String(a ?? "")).join("	")).join(`
`);
      r && (e.clipboardData?.setData("text/plain", r), e.preventDefault());
    });
    N(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && this.element.contains(t)) return;
      const s = e.key, r = e.metaKey || e.ctrlKey;
      if (r && s.toLowerCase() === "a") {
        e.preventDefault(), this.rowSelectionValue !== "" ? (this.clearCellSelection(), this.deselectAll(), this.selectAll()) : this._selectAllCells();
        return;
      }
      if (r) return;
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
      pagination: { enabled: !1, page: 0, pageSize: Ye },
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = Ns(this), queueMicrotask(() => this._initialLoad());
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
        const u = t.getAttribute("data-label"), h = t.getAttribute("data-value");
        return u != null && (c.label = u), h != null && (c.value = h), c;
      }
      const r = {}, o = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      r[this.getRowIdValue] = o != null ? this._coerceRowId(o) : s + 1;
      const a = {};
      t.querySelectorAll("td").forEach((d) => {
        const c = d.getAttribute("data-cell-col-id-value") || d.getAttribute("data-col-id");
        if (!c) return;
        const u = d.getAttribute("data-cell-value");
        if (u != null)
          try {
            r[c] = JSON.parse(u);
          } catch {
            r[c] = u;
          }
        else
          r[c] = d.textContent.trim();
        const h = Number(d.getAttribute("data-spans") || d.getAttribute("colspan") || 1);
        h > 1 && (a[c] = h);
      }), Object.keys(a).length && (r.__sgSpans = a);
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
      e = m("table");
      const s = m("thead");
      e.appendChild(s), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = m("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const s = m("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(s, e), s.appendChild(e), this._viewport = s;
    }
    if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = m("div", { class: "sg-status-bar", role: "status" }), this._statusBar.append(
      m("div", { class: "sg-status-section sg-status-left" }),
      m("div", { class: "sg-status-section sg-status-right" })
    ), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
      const s = m("div", { class: "sg-main" });
      this._viewport.parentNode.insertBefore(s, this._viewport), s.appendChild(this._viewport), this._statusBar && s.appendChild(this._statusBar), this._main = s, this._sidePanel = m("aside", {
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
    this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), this._restorePersistedState(), this._setupPersistence(), L(this.element, "grid:ready", { api: this.element.gridApi }), L(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
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
    const s = this.state.filterModel[e.field] || {}, r = li(e.filter), o = m("div", { class: "sg-filter-popover" }), a = m("select");
    r.forEach((v) => a.append(new Option(v.label, v.value, !1, v.value === s.type)));
    const l = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", d = m("input", { type: l, value: s.value ?? "" }), c = m("input", { type: l, value: s.value2 ?? "", style: { display: "none" } }), u = () => {
      const v = a.value, S = v === "inRange", _ = !(v === "blank" || v === "notBlank");
      d.style.display = _ ? "" : "none", c.style.display = S ? "" : "none";
    };
    a.addEventListener("change", u), u();
    const h = m("div", { class: "sg-filter-actions" }), p = m("button", { type: "button" }, "Clear"), g = m("button", { type: "button", class: "primary" }, "Apply");
    h.append(p, g), p.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), g.addEventListener("click", () => {
      const v = a.value, S = v === "blank" || v === "notBlank" ? { filterType: e.filter, type: v } : { filterType: e.filter, type: v, value: d.value, value2: c.value || void 0 };
      this.setColumnFilter(e.field, S), this._closeFilterPopover();
    }), o.append(
      m("label", {}, "Condition"),
      a,
      d,
      c,
      h
    ), document.body.appendChild(o);
    const b = t.getBoundingClientRect();
    o.style.left = `${b.left + window.scrollX}px`, o.style.top = `${b.bottom + window.scrollY + 2}px`, this._filterPopover = o, document.addEventListener("mousedown", this._onDocMouseDown), d.focus();
  }
  // ----- Column registration (called by header_cell_controller) -----
  registerColumn(e, t) {
    const s = this.state.columnDefs.findIndex((d) => d.field === e.field), r = this._runtimeOverrides[e.field] || {}, o = s >= 0 ? this.state.columnDefs[s] : null, a = o ? {
      ...o.hidden != null ? { hidden: o.hidden } : {},
      ...o.pinned ? { pinned: o.pinned } : {},
      ...o.width != null ? { width: o.width } : {}
    } : {}, l = { ...e, ...r, ...a, _headerEl: t };
    if (s >= 0) {
      const d = this.state.columnDefs[s];
      if (d._headerEl === t && ai(d, l)) return;
      this.state.columnDefs[s] = l;
    } else
      this.state.columnDefs.push(l);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${U(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const s = this.state.sortModel.findIndex((o) => o.colId === e);
    let r;
    s === -1 ? r = { colId: e, sort: "asc" } : this.state.sortModel[s].sort === "asc" ? r = { colId: e, sort: "desc" } : r = null, t ? (s >= 0 && this.state.sortModel.splice(s, 1), r && this.state.sortModel.push(r)) : this.state.sortModel = r ? [r] : [], this.scheduleRender("sort"), L(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  setSortModel(e) {
    this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), L(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
  }
  // ----- Filter -----
  setColumnFilter(e, t) {
    t == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = t, this.state.pagination.page = 0, this.scheduleRender("filter"), L(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setFilterModel(e) {
    this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), L(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
  }
  setQuickFilter(e) {
    const t = e == null ? "" : String(e);
    t !== this.state.quickFilter && (this.state.quickFilter = t, this.state.pagination.page = 0, this.scheduleRender("filter"), L(this.element, "grid:filterChanged", {
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
    this.rowSelectionValue === "single" ? (s.clear(), s.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? s.has(e) ? s.delete(e) : s.add(e) : (s.clear(), s.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), L(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(s)
    });
  }
  setSelected(e, t) {
    t ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), L(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  selectAll() {
    this._displayList.filteredSorted.forEach((e) => {
      !e.__sgGroup && !e.__sgSeparator && this.state.selection.add(this._rowId(e));
    }), this.scheduleRender("selection"), L(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(this.state.selection)
    });
  }
  deselectAll() {
    this.state.selection.clear(), this.scheduleRender("selection"), L(this.element, "grid:selectionChanged", { selectedRows: [], selectedIds: [] });
  }
  getSelectedRows() {
    const e = this.state.selection;
    return this.state.rowData.filter((t) => e.has(this._rowId(t)));
  }
  _selectRange(e, t) {
    const s = this._displayList.filteredSorted, r = s.findIndex((d) => this._rowId(d) === e), o = s.findIndex((d) => this._rowId(d) === t);
    if (r < 0 || o < 0) return;
    const [a, l] = r <= o ? [r, o] : [o, r];
    for (let d = a; d <= l; d++)
      !s[d].__sgGroup && !s[d].__sgSeparator && this.state.selection.add(this._rowId(s[d]));
  }
  // ----- Pagination -----
  goToPage(e) {
    const t = this.totalPages() - 1;
    this.state.pagination.page = Math.max(0, Math.min(e, t)), this.scheduleRender("page"), L(this.element, "grid:paginationChanged", {
      page: this.state.pagination.page,
      pageSize: this.state.pagination.pageSize,
      totalPages: this.totalPages()
    });
  }
  setPageSize(e) {
    this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), L(this.element, "grid:paginationChanged", {
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
    let s = et(this.state.rowData, this.state.filterModel, e);
    return s = tt(s, this.state.quickFilter, t), s.length;
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
    const o = this.state.rowData.find((a) => this._rowId(a) === e);
    o && (this.state.editing = { rowId: e, colId: t, originalValue: V(o, r), initialValue: s }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: s, originalValue: r, draftValue: o } = this.state.editing, a = this._tbody.querySelector(`tr[data-row-id="${U(t)}"] td[data-col-id="${U(s)}"]`);
    let l = r;
    if (!e && a) {
      const d = a.querySelector("[data-editor-input]") || a.querySelector("input,select,textarea");
      d ? l = di(d.value, this._colByField(s)?.type) : o !== void 0 && (l = o);
    }
    if (this.state.editing = null, !e && l !== r) {
      const d = this.state.rowData.find((u) => this._rowId(u) === t), c = d[s];
      d[s] = l, L(this.element, "grid:cellValueChanged", { rowId: t, colId: s, oldValue: c, newValue: l });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const s = this._colByField(e);
    s && (s.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), L(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const r = t || null;
    s.pinned = r, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: r }, this._reorderForPinning(), this.scheduleRender("columns"), L(this.element, "grid:columnPinned", { colId: e, pinned: r });
  }
  setColumnWidth(e, t) {
    const s = this._colByField(e);
    if (!s) return;
    const r = Math.max(s.minWidth || 40, Math.min(s.maxWidth || 4e3, t));
    s.width = r, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: r }, this.scheduleRender("columns"), L(this.element, "grid:columnResized", { colId: e, width: r });
  }
  moveColumn(e, t) {
    const s = this.state.columnDefs.findIndex((o) => o.field === e);
    if (s < 0 || s === t) return;
    const [r] = this.state.columnDefs.splice(s, 1);
    this.state.columnDefs.splice(t, 0, r), this.scheduleRender("columns"), L(this.element, "grid:columnMoved", { colId: e, fromIndex: s, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const s = U(e), r = this._thead?.querySelector(
      `th[data-header-cell-field-value="${s}"], th[data-field="${s}"]`
    ), o = Array.from(
      this._tbody?.querySelectorAll(`td[data-col-id="${s}"]`) || []
    ).filter((l) => !l.closest("tr")?.classList?.contains("sg-spacer"));
    let a = 0;
    if ((r || o.length) && (a = this._measureColumnContentWidth(r, o)), !a) {
      const l = (t.headerName || t.field || "").length, d = this.state.rowData.slice(0, 200);
      let c = l;
      for (const u of d) {
        const h = String(G(u, t) ?? "").length;
        h > c && (c = h);
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
    const o = document.createElement("tbody");
    r.appendChild(o);
    const a = (d) => {
      if (!d) return;
      const c = document.createElement("tr"), u = d.cloneNode(!0);
      u.removeAttribute("style"), c.appendChild(u), o.appendChild(c);
    };
    if (a(e), t.slice(0, s).forEach(a), !o.children.length) return 0;
    this.element.appendChild(r);
    let l = 0;
    for (const d of o.children) {
      const c = d.firstElementChild;
      c && c.offsetWidth > l && (l = c.offsetWidth);
    }
    return this.element.removeChild(r), l;
  }
  sizeColumnsToFit() {
    const e = this._viewport?.clientWidth || this.element.clientWidth || 0;
    if (!e) return;
    const t = this._visibleCols(), s = t.reduce((o, a) => o + (a.width || 150), 0);
    if (s === 0) return;
    const r = e / s;
    t.forEach((o) => {
      o.width = Math.max(o.minWidth || 40, Math.floor((o.width || 150) * r));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((r) => r.pinned === "left"), t = this.state.columnDefs.filter((r) => r.pinned === "right"), s = this.state.columnDefs.filter((r) => !r.pinned);
    this.state.columnDefs = [...e, ...s, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), L(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], s = [], r = [], o = new Map(this.state.rowData.map((a) => [this._rowId(a), a]));
    return (e.remove || []).forEach((a) => {
      const l = this._rowId(a);
      o.delete(l) && r.push(a);
    }), (e.update || []).forEach((a) => {
      const l = this._rowId(a);
      o.has(l) && (o.set(l, { ...o.get(l), ...a }), s.push(a));
    }), (e.add || []).forEach((a) => {
      const l = this._rowId(a);
      o.has(l) || (o.set(l, a), t.push(a));
    }), this.state.rowData = Array.from(o.values()), this.scheduleRender("data"), L(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: s, removed: r };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const s = this.state.columnDefs.filter((l) => !l.hidden && !l._isCheckbox), r = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((l) => !l.__sgGroup && !l.__sgDetail && !l.__sgSeparator), o = (l) => /[",\n\r]/.test(l) ? `"${String(l).replace(/"/g, '""')}"` : String(l), a = [s.map((l) => o(l.headerName || l.field)).join(e)];
    for (const l of r)
      a.push(s.map((d) => o(G(l, d))).join(e));
    return a.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const s = this.getDataAsCsv(t), r = new Blob([s], { type: "text/csv;charset=utf-8" }), o = URL.createObjectURL(r), a = m("a", { href: o, download: e });
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
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.has("tree") || e.size === 0) && (this._displayList = Ts({
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
    const e = this._visibleCols(), t = Rs(e, this._headerLayoutOpts());
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
    t || (t = m("colgroup"), this._table.insertBefore(t, this._thead));
    const s = Array.from(t.children);
    for (e.forEach((o, a) => {
      let l = s[a];
      l || (l = m("col"), t.appendChild(l)), l.style.width = o.width ? o.width + "px" : "";
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
      const h = this._thead.firstElementChild;
      for (let p = 1; p < this._thead.children.length; p++) {
        const g = this._thead.children[p];
        Array.from(g.children).forEach((b) => {
          (b.hasAttribute("data-header-cell-field-value") || b.hasAttribute("data-field")) && h.appendChild(b);
        });
      }
      for (; this._thead.children.length > 1; ) this._thead.lastElementChild.remove();
    }
    const t = this._thead.querySelector("tr") || (() => {
      const h = m("tr");
      return this._thead.appendChild(h), h;
    })(), s = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((h) => {
      const p = h.getAttribute("data-header-cell-field-value") || h.getAttribute("data-field");
      p && s.set(p, h);
    });
    const r = new Set(e.map((h) => h.field)), o = this.state.columnDefs.filter((h) => !r.has(h.field)), a = [...e, ...o], l = Array.from(t.children).map((h) => h.getAttribute("data-header-cell-field-value") || h.getAttribute("data-field")).filter(Boolean), d = a.map((h) => h.field);
    if (l.length === d.length && l.every((h, p) => h === d[p]))
      Array.from(t.children).forEach((h) => {
        h.removeAttribute("rowspan"), h.removeAttribute("colspan");
      });
    else {
      const h = [];
      for (const p of a) {
        let g = s.get(p.field);
        g ? (g.removeAttribute("rowspan"), g.removeAttribute("colspan")) : g = m("th", {
          "data-field": p.field,
          "data-synth": "true"
        }, [m("div", { class: "sg-header-content" }, [
          m("span", { class: "sg-header-label" }, p.headerName || p.field || "")
        ])]), h.push(g);
      }
      t.replaceChildren(...h);
    }
    Array.from(t.children).forEach((h) => {
      const p = h.getAttribute("data-header-cell-field-value") || h.getAttribute("data-field");
      p != null && (h.style.display = r.has(p) ? "" : "none");
    });
    const u = this._pinOffsets();
    for (const h of e) {
      const p = t.querySelector(`th[data-header-cell-field-value="${U(h.field)}"]`) || t.querySelector(`th[data-field="${U(h.field)}"]`);
      p && this._applyLeafThState(p, h, u);
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
    const r = [], o = new Set(e.map((c) => c.field)), a = this._pinOffsets();
    for (const c of t.rows) {
      const u = m("tr");
      for (const h of c) {
        if (h.kind === "group") {
          u.appendChild(m("th", {
            class: "sg-header-group",
            colspan: String(h.colspan),
            "data-group-header": "true"
          }, h.label || ""));
          continue;
        }
        const p = h.col;
        let g = s.get(p.field);
        if (g || (g = m("th", {
          "data-field": p.field,
          "data-synth": "true"
        }, [m("div", { class: "sg-header-content" }, [
          m("span", { class: "sg-header-label" }, h.label || p.headerName || p.field || "")
        ])])), h.label) {
          const b = g.querySelector(".sg-header-label");
          b && b.textContent !== h.label && (b.textContent = h.label);
        }
        g.setAttribute("rowspan", String(h.rowspan)), g.removeAttribute("colspan"), g.style.display = "", u.appendChild(g), this._applyLeafThState(g, p, a);
      }
      r.push(u);
    }
    const l = /* @__PURE__ */ new Set();
    t.rows.forEach((c) => c.forEach((u) => {
      u.kind === "leaf" && l.add(u.col.field);
    }));
    const d = this.state.columnDefs.filter(
      (c) => !o.has(c.field) && !l.has(c.field)
    );
    if (d.length) {
      const c = m("tr", { class: "sg-hidden-header-row" });
      for (const u of d) {
        let h = s.get(u.field);
        h || (h = m("th", { "data-field": u.field, "data-synth": "true" })), h.removeAttribute("rowspan"), h.removeAttribute("colspan"), c.appendChild(h);
      }
      r.push(c);
    }
    this._thead.replaceChildren(...r);
  }
  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(e, t, s) {
    const r = this.state.sortModel.find((o) => o.colId === t.field);
    Fe(e, {
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
    }), t.width && (e.style.width = t.width + "px"), e.style.left = t.pinned === "left" ? s.left[t.field] + "px" : "", e.style.right = t.pinned === "right" ? s.right[t.field] + "px" : "", this._ensureHeaderChrome(e, t, r);
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
    return typeof t == "string" && ri.has(t) ? "right" : null;
  }
  _ensureHeaderChrome(e, t, s) {
    if (t._isRowNumber) {
      e.classList.add("sg-gutter-header"), e.textContent = "";
      return;
    }
    if (t._isCheckbox) {
      e.classList.add("sg-checkbox-header");
      let l = e.querySelector('input[type="checkbox"]');
      l || (l = m("input", { type: "checkbox", "aria-label": "Select all" }), l.addEventListener("change", (u) => {
        u.target.checked ? this.selectAll() : this.deselectAll();
      }), e.textContent = "", e.appendChild(l));
      const d = this._displayList.filteredSorted.length, c = this.state.selection.size;
      l.checked = c > 0 && c >= d, l.indeterminate = c > 0 && c < d;
      return;
    }
    let r = e.querySelector(".sg-header-content");
    if (!r) {
      const l = e.textContent.trim();
      e.textContent = "", r = m("div", { class: "sg-header-content" }, [
        m("span", { class: "sg-header-label" }, l || t.headerName || t.field || "")
      ]), e.appendChild(r);
    }
    let o = r.querySelector(".sg-sort-icon");
    if (t.sortable)
      if (o || (o = m("span", { class: "sg-sort-icon", "aria-hidden": "true" }), o.innerHTML = le, r.appendChild(o)), s && this.state.sortModel.length > 1) {
        let l = r.querySelector(".sg-sort-index");
        l || (l = m("span", { class: "sg-sort-index" }), r.appendChild(l)), l.textContent = String(this.state.sortModel.indexOf(s) + 1);
      } else
        r.querySelector(".sg-sort-index")?.remove();
    else o && o.remove();
    let a = r.querySelector(".sg-filter-icon");
    t.filter ? a || (a = m("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), a.innerHTML = ii, r.appendChild(a)) : a && a.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(m("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._withDetailRows(this._displayList.pageRows);
    this._selKeys = this._computeCellSelKeys();
    const s = !this.masterDetailValue && (this.virtualValue || t.length > 200);
    let r = t, o = 0;
    if (s) {
      const h = this._viewport?.clientHeight || 400, p = this.state.rowHeight, g = ks(this.state.scrollTop, h, p, t.length, 8);
      o = g.first, r = t.slice(g.first, g.last);
    }
    const a = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((h) => {
      const p = h.dataset.rowId;
      p != null && a.set(p, h);
    });
    const l = document.createDocumentFragment(), d = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0;
    let c = 0;
    for (let h = 0; h < o; h++) {
      const p = t[h];
      p && !p.__sgGroup && !p.__sgDetail && !p.__sgSeparator && (c += 1);
    }
    const u = (h) => !h || h.__sgGroup || h.__sgDetail || h.__sgSeparator ? null : (c += 1, d + c);
    if (s) {
      const h = this.state.rowHeight, p = o * h, g = (t.length - o - r.length) * h;
      l.appendChild(this._spacerRow(p, e.length)), r.forEach((b) => l.appendChild(this._buildRow(b, e, a, u(b)))), l.appendChild(this._spacerRow(g, e.length));
    } else
      r.forEach((h) => l.appendChild(this._buildRow(h, e, a, u(h))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && l.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(l);
  }
  _buildPinnedBottomRow(e) {
    const t = m("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), s = this._pinOffsets(), r = this._displayList.grandTotals || {};
    let o = !1;
    for (const a of e) {
      const l = m("td", { "data-col-id": a.field, "data-pinned": a.pinned || null });
      a.pinned === "left" ? l.style.left = s.left[a.field] + "px" : a.pinned === "right" && (l.style.right = s.right[a.field] + "px");
      const d = r[a.field];
      d != null ? (l.classList.add("sg-agg-cell"), l.textContent = this._formatAggregate(d)) : !o && !a._isCheckbox && !a._isRowNumber && (l.classList.add("sg-pinned-bottom-label"), l.textContent = "Total", o = !0), t.appendChild(l);
    }
    return t;
  }
  _buildRow(e, t, s, r) {
    if (e.__sgGroup) return this._buildGroupRow(e, t, s);
    if (e.__sgDetail) return this._buildDetailRow(e, t, s);
    if (e.__sgSeparator) return this._buildSeparatorRow(e, t, s);
    const o = String(this._rowId(e));
    let a = s.get(o);
    a || (a = m("tr")), a.dataset.rowId = o, a.classList.remove("sg-spacer");
    const l = this.state.selection.has(this._rowId(e)), d = this.masterDetailValue && this._isDetailExpanded(o);
    return Fe(a, {
      "data-selected": l ? "true" : null,
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
    let o = s.get(r);
    o || (o = m("tr")), o.dataset.rowId = r, o.dataset.separator = "true", o.className = "", o.removeAttribute("data-selected"), o.removeAttribute("data-detail-expanded");
    const a = e.variant || (e.value != null ? "summary" : e.label != null ? "heading" : "blank");
    o.classList.add("sg-separator-row", `sg-separator-${a}`), e.className && o.classList.add(e.className), o.innerHTML = "";
    const l = (u) => u._isCheckbox || u._isRowNumber || u._isGroupCol || u._isMasterExpand, c = t.filter((u) => !l(u)).length || t.length || 1;
    for (const u of t) {
      if (l(u)) {
        const p = m("td", { "data-col-id": u.field, class: "sg-separator-gutter" });
        o.appendChild(p);
        continue;
      }
      const h = m("td", {
        "data-col-id": u.field,
        colspan: String(c),
        class: "sg-separator-cell"
      });
      this._renderSeparatorContent(h, e, a), o.appendChild(h);
      break;
    }
    return o;
  }
  _renderSeparatorContent(e, t, s) {
    if (s === "blank" || s === "divider")
      return;
    const r = m("div", { class: "sg-separator-content" });
    t.label != null && r.appendChild(m("span", { class: "sg-separator-label" }, String(t.label))), t.value != null && r.appendChild(m("span", { class: "sg-separator-value" }, String(t.value))), e.appendChild(r);
  }
  _separatorKey(e) {
    return [e.variant || "", e.label || "", e.value || ""].join("|");
  }
  _spacerRow(e, t) {
    if (e <= 0) {
      const r = m("tr", { class: "sg-spacer", "aria-hidden": "true" });
      return r.style.height = "0px", r.appendChild(m("td", { colspan: String(t), style: { height: "0px", padding: "0", border: "0" } })), r;
    }
    const s = m("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return s.style.height = e + "px", s.appendChild(m("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), s;
  }
  _renderRow(e, t, s, r) {
    e.innerHTML = "";
    const o = this._pinOffsets(), a = this._selKeys || { active: null, range: null }, l = String(this._rowId(t)), d = this._displayList?.treeMeta, c = d ? d.get(l) : null, u = c ? this._treeDisplayColField() : null, h = t && t.__sgSpans || null;
    let p = 0;
    for (let g = 0; g < s.length; g++) {
      const b = s[g];
      if (p > 0) {
        p -= 1;
        continue;
      }
      const v = b._isRowNumber || b._isCheckbox || b._isGroupCol || b._isMasterExpand, S = h && !v ? Number(h[b.field]) : 0, _ = Math.max(1, Math.min(S || 1, s.length - g));
      _ > 1 && (p = _ - 1);
      const y = `${l}:${b.field}`, w = m("td", {
        "data-col-id": b.field,
        "data-pinned": b.pinned || null,
        "data-cell-active": a.active === y ? "true" : null,
        "data-cell-range": a.range && a.range.has(y) ? "true" : null,
        colspan: _ > 1 ? String(_) : null
      });
      if (_ > 1 && w.classList.add("sg-merged-cell"), b.pinned === "left" ? w.style.left = o.left[b.field] + "px" : b.pinned === "right" && (w.style.right = o.right[b.field] + "px"), b._isRowNumber) {
        w.classList.add("sg-gutter-cell"), w.setAttribute("data-gutter", "true"), w.removeAttribute("data-cell-active"), w.removeAttribute("data-cell-range"), w.textContent = r != null ? String(r) : "", e.appendChild(w);
        continue;
      }
      if (b._isCheckbox) {
        w.classList.add("sg-checkbox-cell");
        const M = m("input", { type: "checkbox" });
        M.checked = this.state.selection.has(this._rowId(t)), w.appendChild(M), e.appendChild(w);
        continue;
      }
      if (b._isGroupCol) {
        w.classList.add("sg-group-leaf-cell"), w.removeAttribute("data-cell-active"), w.removeAttribute("data-cell-range"), e.appendChild(w);
        continue;
      }
      if (b._isMasterExpand) {
        w.classList.add("sg-master-expand-cell"), w.setAttribute("data-master-expand", "true"), w.removeAttribute("data-cell-active"), w.removeAttribute("data-cell-range");
        const M = this._isDetailExpanded(this._rowId(t)), T = m("span", {
          class: "sg-master-expand-caret",
          "data-expanded": M ? "true" : "false",
          "aria-hidden": "true"
        });
        T.innerHTML = le, w.appendChild(T), e.appendChild(w);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === b.field) {
        w.setAttribute("data-editing", "true");
        const M = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : V(t, b), { node: T, control: C } = this._buildEditor(b, M);
        w.appendChild(T);
        const D = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          if (C?.focus(), D || C?.select?.(), C?.type && oi.has(C.type))
            try {
              C.showPicker?.();
            } catch {
            }
        });
      } else
        this._renderCellContent(w, t, b);
      c && b.field === u && this._decorateTreeCell(w, c), e.appendChild(w);
    }
  }
  // Prepend an indent spacer + a chevron (when the row has children) to the
  // tree column's <td>. The chevron carries data-tree-toggle so the body
  // click handler can route it back to toggleTreeRow without conflicting
  // with cell selection or row click handlers.
  _decorateTreeCell(e, t) {
    if (e.classList.add("sg-tree-cell"), e.setAttribute("data-tree-level", String(t.level)), e.style.paddingLeft = `${8 + t.level * 18}px`, t.hasChildren) {
      const s = m("span", {
        class: "sg-tree-chevron",
        "data-tree-toggle": "true",
        "data-expanded": t.expanded ? "true" : "false",
        "aria-hidden": "true"
      });
      s.innerHTML = le, e.insertBefore(s, e.firstChild);
    } else {
      const s = m("span", { class: "sg-tree-chevron sg-tree-chevron-leaf", "aria-hidden": "true" });
      e.insertBefore(s, e.firstChild);
    }
  }
  _renderCellContent(e, t, s) {
    if (s.cellRenderer) {
      const r = Be(s.cellRenderer);
      if (r) {
        const a = V(t, s), l = G(t, s);
        (r.dataset.bind || r.dataset.bindText !== void 0) && (r.textContent = r.dataset.bind ? String(t[r.dataset.bind] ?? "") : l), r.dataset.bindAttr && r.setAttribute(r.dataset.bindAttr, a), r.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((d) => {
          d.dataset.bindText !== void 0 ? d.textContent = l : d.dataset.bind && (d.textContent = String(t[d.dataset.bind] ?? "")), d.dataset.bindAttr && d.setAttribute(d.dataset.bindAttr, a);
        }), e.appendChild(r);
        return;
      }
      const o = rt(s.cellRenderer);
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
    this._groupExpanded.set(e, !this._isGroupExpanded(e, t)), this.scheduleRender("group"), L(this.element, "grid:groupToggled", { groupId: e, expanded: this._groupExpanded.get(e) });
  }
  expandAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = -1, this.scheduleRender("group");
  }
  collapseAll() {
    this._groupExpanded.clear(), this.state.group.defaultExpanded = 0, this.scheduleRender("group");
  }
  setRowGroupColumns(e) {
    this.state.group.cols = Array.isArray(e) ? e.slice() : [], this._groupExpanded.clear(), this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("group"), L(this.element, "grid:columnRowGroupChanged", { rowGroupCols: this.state.group.cols.slice() });
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
    t == null ? delete this.state.group.aggs[e] : this.state.group.aggs[e] = t, this.scheduleRender("group"), L(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  // ----- Pivot mode -----
  // Toggling pivot mode rebuilds the display list (and therefore the visible
  // column set). Clears row + cell selection since the underlying cell graph
  // changes shape entirely.
  setPivotMode(e) {
    const t = !!e;
    this.state.pivot.mode !== t && (this.state.pivot.mode = t, this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), L(this.element, "grid:pivotModeChanged", { pivot: t }));
  }
  isPivotMode() {
    return !!this.state.pivot.mode;
  }
  setPivotColumns(e) {
    this.state.pivot.cols = Array.isArray(e) ? e.slice() : [], this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), L(this.element, "grid:columnPivotChanged", { pivotCols: this.state.pivot.cols.slice() });
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
    this.state.group.aggs = t, this.scheduleRender(this.state.pivot.mode ? "pivot" : "group"), L(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
  }
  addValueColumn(e, t = "sum") {
    e && this.setColumnAggFunc(e, t);
  }
  removeValueColumn(e) {
    this.setColumnAggFunc(e, null);
  }
  // ----- Column header groups + pinned bottom row -----
  setColumnGroups(e) {
    this.columnGroupsValue = Array.isArray(e) ? e : [], this.scheduleRender("columns"), L(this.element, "grid:columnGroupsChanged", { columnGroups: this.columnGroupsValue });
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
          const o = t.get(r.field);
          o && (r.width != null && (o.width = r.width), o.pinned = r.pinned || void 0, o.hidden = !!r.hidden, t.delete(r.field), s.push(o));
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
      L(this.element, "grid:columnStateApplied", { state: e });
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
    for (const t of Qe) this.element.addEventListener(t, e);
    this._persistBeforeUnload = () => {
      this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
    }, window.addEventListener("beforeunload", this._persistBeforeUnload);
  }
  _teardownPersistence() {
    if (this._persistListener) {
      for (const e of Qe) this.element.removeEventListener(e, this._persistListener);
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
    let o = s.get(r);
    return o || (o = m("tr")), o.dataset.rowId = r, o.dataset.group = "true", o.dataset.groupLevel = String(e.level), o.className = "sg-group-row", this._renderGroupRow(o, e, t), o;
  }
  _renderGroupRow(e, t, s) {
    e.innerHTML = "";
    const r = this._pinOffsets(), o = this._isGroupExpanded(t.groupId, t.level), a = (this.state.group.displayType || "singleColumn") === "singleColumn", l = !!(this.state.pivot?.mode && this._displayList?.pivot), d = t.__pivotAll === !0, c = s.filter((p) => !p._isRowNumber && !p._isCheckbox && !p._isGroupCol), u = c.some((p) => p.field === t.field) ? t.field : c[0]?.field, h = Math.max(0, t.level);
    d && e.classList.add("sg-pivot-all-row");
    for (const p of s) {
      const g = m("td", { "data-col-id": p.field, "data-pinned": p.pinned || null });
      if (p.pinned === "left" ? g.style.left = r.left[p.field] + "px" : p.pinned === "right" && (g.style.right = r.right[p.field] + "px"), p._isRowNumber || p._isCheckbox) {
        g.classList.add(p._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(g);
        continue;
      }
      if (l || a ? p._isGroupCol : p.field === u) {
        if (g.classList.add("sg-group-cell"), g.style.paddingLeft = `${8 + h * 18}px`, !d) {
          const v = m("span", {
            class: "sg-group-caret",
            "data-expanded": o ? "true" : "false",
            "aria-hidden": "true"
          });
          v.innerHTML = le, g.appendChild(v);
        }
        g.append(
          m("span", { class: "sg-group-label" }, this._groupValueLabel(t)),
          m("span", { class: "sg-group-count" }, ` (${t.count})`)
        );
      } else if (l && p._isPivot) {
        const v = V(t, p);
        v != null && (g.classList.add("sg-agg-cell"), g.textContent = this._formatAggregate(v));
      } else !p._isGroupCol && t.aggregates && t.aggregates[p.field] != null && (g.classList.add("sg-agg-cell"), g.textContent = this._formatAggregate(t.aggregates[p.field]));
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
      const r = Be(e.cellEditor);
      if (r) {
        const o = r.matches?.("input,select,textarea") ? r : r.querySelector?.("[data-editor-input]") || r.querySelector?.("input,select,textarea");
        return o && (this._seedEditorValue(o, e, t), o.addEventListener("keydown", this._onEditorKey), o.addEventListener("blur", this._onEditorBlur)), { node: r, control: o };
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
        const o = r.getTimezoneOffset() * 6e4;
        e.value = new Date(r.getTime() - o).toISOString().slice(0, 16);
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
    if (e.type === "number") s = m("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const r = t instanceof Date ? t : t ? new Date(t) : null, o = r ? r.toISOString().slice(0, 10) : "";
      s = m("input", { type: "date", value: o });
    } else if (e.type === "datetime") {
      const r = t instanceof Date ? t : t ? new Date(t) : null;
      let o = "";
      if (r && !Number.isNaN(r.getTime())) {
        const a = r.getTimezoneOffset() * 6e4;
        o = new Date(r.getTime() - a).toISOString().slice(0, 16);
      }
      s = m("input", { type: "datetime-local", value: o });
    } else if (e.type === "color") {
      const r = /^#[0-9a-f]{6}$/i.test(String(t ?? "")) ? t : "#000000";
      s = m("input", { type: "color", value: r });
    } else e.type === "email" ? s = m("input", { type: "email", value: t ?? "" }) : e.type === "url" ? s = m("input", { type: "url", value: t ?? "" }) : e.type === "tel" ? s = m("input", { type: "tel", value: t ?? "" }) : e.type === "boolean" ? (s = m("select"), s.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : s = m("input", { type: "text", value: t ?? "" });
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
    l !== this._lastRangeAggs && (this._lastRangeAggs = l, L(this.element, "grid:rangeAggsChanged", { aggs: a }));
  }
  _statusPanel(e, t, s = null) {
    const r = m("div", { class: "sg-status-panel" });
    return r.append(
      m("span", { class: "sg-status-label" }, `${e}:`),
      m("span", { class: "sg-status-value" }, t)
    ), s && r.appendChild(m("span", { class: "sg-status-aside" }, s)), r;
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
          const o = s.rows[r];
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
    return this.state.cellSel.ranges.length ? ys(this._cellRangeRawValues()) : null;
  }
  _showColumnMenu(e, t, s) {
    this._closeColumnMenu();
    const r = this._columnMenuItems(e), o = m("div", { class: "sg-column-menu", role: "menu" });
    for (const d of r) {
      if (d === "separator") {
        o.appendChild(m("div", { class: "sg-column-menu-separator", role: "separator" }));
        continue;
      }
      const c = m("button", {
        type: "button",
        class: "sg-column-menu-item" + (d.active ? " sg-column-menu-active" : ""),
        role: "menuitem"
      });
      c.append(
        m("span", { class: "sg-column-menu-label" }, d.label)
      ), d.active && c.append(m("span", { class: "sg-column-menu-check", "aria-hidden": "true" }, "✓")), c.addEventListener("click", () => {
        d.action(), this._closeColumnMenu();
      }), o.appendChild(c);
    }
    document.body.appendChild(o);
    const a = o.offsetWidth || 220, l = o.offsetHeight || 280;
    o.style.left = `${Math.min(t, window.innerWidth - a - 4)}px`, o.style.top = `${Math.min(s, window.innerHeight - l - 4)}px`, this._columnMenu = o, setTimeout(() => {
      document.addEventListener("mousedown", this._onDocMouseDownColumnMenu), document.addEventListener("keydown", this._onColumnMenuKey), window.addEventListener("resize", this._closeColumnMenuBound = () => this._closeColumnMenu(), { once: !0 }), window.addEventListener("scroll", this._closeColumnMenuBound, { once: !0, capture: !0 });
    }, 0), L(this.element, "grid:columnMenuOpened", { colId: e.field });
  }
  _closeColumnMenu() {
    this._columnMenu && (this._columnMenu.remove(), this._columnMenu = null, document.removeEventListener("mousedown", this._onDocMouseDownColumnMenu), document.removeEventListener("keydown", this._onColumnMenuKey), this._closeColumnMenuBound && (window.removeEventListener("resize", this._closeColumnMenuBound), window.removeEventListener("scroll", this._closeColumnMenuBound, { capture: !0 }), this._closeColumnMenuBound = null));
  }
  // Build the menu item list for `col` based on the current grid state. Each
  // item is { label, action, active? } or the string 'separator'. Items are
  // emitted only when they make sense (e.g. "Unpin" doesn't show on an
  // unpinned col), so the menu stays short.
  _columnMenuItems(e) {
    const t = this.element.gridApi, s = e.headerName || e.field, r = this.state.group.cols.includes(e.field), o = this.state.pivot.cols.includes(e.field), a = this.state.group.aggs[e.field], l = e.type === "number", d = [];
    if (e.pinned !== "left" && d.push({ label: "Pin left", action: () => t.setColumnPinned(e.field, "left") }), e.pinned !== "right" && d.push({ label: "Pin right", action: () => t.setColumnPinned(e.field, "right") }), e.pinned && d.push({ label: "Unpin", action: () => t.setColumnPinned(e.field, null) }), d.push("separator"), d.push({ label: "Autosize this column", action: () => t.autoSizeColumn(e.field) }), d.push({ label: "Autosize all columns", action: () => t.autoSizeAllColumns() }), d.push("separator"), d.push(r ? { label: `Ungroup ${s}`, action: () => t.removeRowGroupColumn(e.field) } : { label: `Group by ${s}`, action: () => t.addRowGroupColumn(e.field) }), d.push(o ? { label: `Remove ${s} from pivot`, action: () => t.removePivotColumn(e.field) } : { label: `Pivot by ${s}`, action: () => {
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
    const r = t.dataset.colId, o = this._colByField(r);
    return o && o.acceptFiles === !1 ? null : { td: t, tr: s, colId: r, rowId: this._coerceRowId(s.dataset.rowId), col: o };
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
        this.clearCellSelection(), this.toggleRowSelection(o, d), L(this.element, "grid:rowClicked", { rowId: o, row: this.state.rowData.find((c) => this._rowId(c) === o), event: e });
      }
      this._cellDragMoved = !1;
      return;
    }
    if (a) {
      const d = this.state.rowData.find((u) => this._rowId(u) === o), c = a.dataset.colId;
      L(this.element, "grid:cellClicked", { rowId: o, colId: c, value: d?.[c], event: e });
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
    this.toggleRowSelection(o, l), L(this.element, "grid:rowClicked", { rowId: o, row: this.state.rowData.find((d) => this._rowId(d) === o), event: e });
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
    const t = Array.from(this.state.selection).map(String), s = new Set(t.includes(String(e)) ? t : [String(e)]), r = m("div", { class: "sg-drag-ghost sg-grid" }), o = m("table"), a = m("tbody");
    let l = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((c) => {
      if (s.has(c.dataset.rowId) && l < 6) {
        const u = c.cloneNode(!0);
        u.removeAttribute("data-selected"), u.querySelectorAll("td").forEach((h) => {
          h.style.left = "", h.style.right = "", h.removeAttribute("data-pinned"), h.removeAttribute("data-cell-active"), h.removeAttribute("data-cell-range");
        }), a.appendChild(u), l += 1;
      }
    }), o.appendChild(a), r.appendChild(o), s.size > l && r.appendChild(m("div", { class: "sg-drag-ghost-more" }, `+${s.size - l} more rows`)), r.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(r);
    const d = m("div", { class: "sg-drop-indicator" });
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
    const o = s.getBoundingClientRect(), a = this._viewport.getBoundingClientRect(), l = this._rowDrag.indicator;
    l.style.left = `${a.left}px`, l.style.width = `${a.width}px`, l.style.top = `${(r ? o.top : o.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(s.dataset.rowId), this._rowDrag.dropBefore = r;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: s, dropRowId: r, dropBefore: o } = this._rowDrag;
    if (t.remove(), s.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, r == null || e.has(String(r))) return;
    const a = this.state.rowData, l = a.filter((u) => e.has(String(this._rowId(u)))), d = a.filter((u) => !e.has(String(this._rowId(u))));
    let c = d.findIndex((u) => this._rowId(u) === r);
    c < 0 ? c = d.length : o || (c += 1), d.splice(c, 0, ...l), this.state.rowData = d, this.state.sortModel = [], this.scheduleRender("data"), L(this.element, "grid:rowDragEnd", {
      ids: l.map((u) => this._rowId(u)),
      toRowId: r,
      before: o
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
    const t = this._displayList.pageRows, s = this._visibleCols(), r = (u) => t.findIndex((h) => this._rowId(h) === u), o = (u) => s.findIndex((h) => h.field === u), a = r(e.anchor.rowId), l = o(e.anchor.colId);
    if (a < 0 || l < 0) return null;
    const d = r(e.focus.rowId), c = o(e.focus.colId);
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
      const r = e.rows[s];
      if (!r) continue;
      const o = [];
      for (let a = e.c0; a <= e.c1; a++) {
        const l = e.cols[a];
        l && o.push(G(r, l));
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
    for (const r of this.state.cellSel.ranges) {
      const o = this._rangeRect(r);
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
        for (let r = s.r0; r <= s.r1; r++) {
          const o = s.rows[r];
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
    const r = this._displayList.pageRows, o = this._navCols();
    if (!r.length || !o.length) return;
    const a = (h, p, g) => Math.max(p, Math.min(h, g)), l = this._activeCell(), d = () => r.findIndex((h) => !h.__sgGroup && !h.__sgDetail && !h.__sgSeparator);
    let c = l ? r.findIndex((h) => this._rowId(h) === l.rowId) : d(), u = l ? o.findIndex((h) => h.field === l.colId) : 0;
    if (c < 0 && (c = d()), !(c < 0)) {
      if (u < 0 && (u = 0), s && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const h = this.state.cellSel.ranges[this.state.cellSel.activeIdx], p = a(r.findIndex((b) => this._rowId(b) === h.focus.rowId) + e, 0, r.length - 1), g = a(o.findIndex((b) => b.field === h.focus.colId) + t, 0, o.length - 1);
        this._extendActiveRange({ rowId: this._rowId(r[p]), colId: o[g].field });
      } else {
        let h = a(c + e, 0, r.length - 1);
        if (e !== 0) {
          for (; r[h] && (r[h].__sgGroup || r[h].__sgDetail || r[h].__sgSeparator); ) {
            const g = h + e;
            if (g < 0 || g >= r.length) break;
            h = g;
          }
          if (!r[h] || r[h].__sgGroup || r[h].__sgDetail || r[h].__sgSeparator) return;
        }
        const p = a(u + t, 0, o.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(r[h]), colId: o[p].field });
      }
      this._applyCellSelHighlight(), this._scrollActiveIntoView(), L(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
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
    }, this._applyCellSelHighlight(), L(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
  }
  // Clear the value of every selected, editable cell (Delete/Backspace).
  _clearSelectedCells() {
    let e = !1;
    for (const t of this.state.cellSel.ranges) {
      const s = this._rangeRect(t);
      if (s)
        for (let r = s.r0; r <= s.r1; r++) {
          const o = s.rows[r];
          if (!(!o || o.__sgGroup || o.__sgDetail || o.__sgSeparator))
            for (let a = s.c0; a <= s.c1; a++) {
              const l = s.cols[a];
              if (!l || !l.editable || l._isCheckbox || l._isRowNumber) continue;
              const d = o[l.field];
              d === "" || d == null || (o[l.field] = "", e = !0, L(this.element, "grid:cellValueChanged", { rowId: this._rowId(o), colId: l.field, oldValue: d, newValue: "" }));
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
    const r = this._coerceRowId(t.dataset.rowId), o = s.dataset.colId;
    this.startEditingCell(r, o);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const s = this._visibleCols().filter((h) => h.editable && !h._isCheckbox), r = this._displayList.pageRows, o = r.findIndex((h) => this._rowId(h) === t.rowId), a = s.findIndex((h) => h.field === t.colId);
    if (!s.length || !r.length || o < 0 || a < 0) {
      this.stopEditing(!1);
      return;
    }
    const l = r.length * s.length, d = (o * s.length + a + e + l) % l, c = r[Math.floor(d / s.length)], u = s[d % s.length];
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
    L(this.element, "grid:detailRowExpanded", { rowId: e, masterRow: s });
  }
  collapseDetailRow(e) {
    if (!this.masterDetailValue) return;
    const t = String(e);
    if (!this._detailExpanded.has(t)) return;
    this._detailExpanded.delete(t), this._detailGrids.delete(t), this.scheduleRender("cells");
    const s = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    L(this.element, "grid:detailRowCollapsed", { rowId: e, masterRow: s });
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
    const r = this.state.rowData.find((o) => String(this._rowId(o)) === t);
    L(this.element, s ? "grid:treeRowCollapsed" : "grid:treeRowExpanded", { rowId: e, row: r });
  }
  expandTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !0), this.scheduleRender("tree");
    const s = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    L(this.element, "grid:treeRowExpanded", { rowId: e, row: s });
  }
  collapseTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (!this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !1), this.scheduleRender("tree");
    const s = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    L(this.element, "grid:treeRowCollapsed", { rowId: e, row: s });
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
    this.treeDataValue !== t && (this.treeDataValue = t, this.state.tree.enabled = t, t || this._treeExpanded.clear(), this.scheduleRender("tree"), L(this.element, "grid:treeDataChanged", { treeData: t }));
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
    let o = s.get(r);
    const a = String(e.masterId);
    if (o) {
      if (o.getAttribute("data-master-id") === a)
        return o.classList.remove("sg-spacer"), o;
      o = null;
    }
    o || (o = m("tr")), o.className = "sg-detail-row", o.dataset.rowId = r, o.setAttribute("data-master-id", a), o.innerHTML = "";
    const l = m("td", { colspan: String(t.length || 1), class: "sg-detail-cell" }), d = m("div", { class: "sg-detail-shell" });
    return d.style.minHeight = `${this.detailRowHeightValue}px`, l.appendChild(d), o.appendChild(l), this._populateDetailShell(d, e.master, e.masterId), o;
  }
  // Fill the detail shell. Strategy: if the grid has a detail-template value
  // pointing at an existing <template>, clone its content and run a tiny
  // data-bind pass keyed off the master row. Otherwise render a minimal
  // fallback so the panel still appears (handy when the user is wiring up
  // their first detail panel and hasn't authored a template yet).
  _populateDetailShell(e, t, s) {
    const r = this.detailTemplateValue;
    let o;
    if (r) {
      const l = document.getElementById(r);
      if (l && l.tagName === "TEMPLATE") {
        const d = l.content.cloneNode(!0);
        this._applyDetailBindings(d, t), e.appendChild(d), o = e;
      }
    }
    if (!o) {
      const l = m("div", { class: "sg-detail-fallback" }), d = Object.keys(t || {}).filter((c) => !c.startsWith("_") && !c.startsWith("__")).slice(0, 6);
      for (const c of d)
        l.append(
          m("span", { class: "sg-detail-fallback-label" }, `${c}: `),
          m("span", { class: "sg-detail-fallback-value" }, String(t[c] ?? "")),
          m("span", { class: "sg-detail-fallback-sep" }, "  ·  ")
        );
      l.lastElementChild?.remove(), e.appendChild(l);
    }
    const a = e.querySelector('[data-controller~="grid"]');
    a && this._seedNestedGrid(a, t, s), queueMicrotask(() => {
      L(this.element, "grid:detailRowMounted", {
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
        const o = r.getAttribute("data-detail-if");
        if (!t[o]) {
          r.remove();
          return;
        }
      }
      if (r.hasAttribute("data-detail-bind")) {
        const o = r.getAttribute("data-detail-bind");
        r.textContent = t[o] == null ? "" : String(t[o]);
      }
      if (r.hasAttribute("data-detail-bind-attr")) {
        const o = r.getAttribute("data-detail-bind-attr"), [a, l] = o.split(":");
        a && l && r.setAttribute(a, t[l] == null ? "" : String(t[l]));
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
      const o = t?.[r];
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
    const r = {};
    s = 0;
    for (let o = e.length - 1; o >= 0; o--) {
      const a = e[o];
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
N(ke, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: Ye },
  rowHeight: { type: Number, default: ni },
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
function ai(n, i) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (n[t] !== i[t]) return !1;
  return !0;
}
function li(n) {
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
function di(n, i) {
  if (i === "number") {
    const e = Number(n);
    return Number.isFinite(e) ? e : n;
  }
  if (i === "date") return n;
  if (i === "datetime") {
    if (!n) return n;
    const e = new Date(n);
    return Number.isNaN(e.getTime()) ? n : e.toISOString();
  }
  return i === "boolean" ? n === "true" ? !0 : n === "false" ? !1 : null : n;
}
function U(n) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(n)) : String(n).replace(/["\\\n\r]/g, (i) => "\\" + i);
}
class Ne extends q {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    N(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, s = e.clientY;
      let r = !1;
      const o = (l) => {
        const d = Math.abs(l.clientX - t), c = Math.abs(l.clientY - s);
        !r && (d > 5 || c > 5) && (r = !0, document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), this._beginReorder(t));
      }, a = (l) => {
        document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), r || this.sort(l);
      };
      document.addEventListener("mousemove", o), document.addEventListener("mouseup", a);
    });
  }
  connect() {
    if (this.grid = Vs(this.element, "grid", this.application), !!this.grid) {
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
    let o = r;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const a = (d) => {
      const c = d.clientX;
      let u = s.length;
      for (let h = 0; h < s.length; h++) {
        const p = s[h].getBoundingClientRect();
        if (c < p.left + p.width / 2) {
          u = h;
          break;
        }
      }
      o = u > r ? u - 1 : u;
    }, l = () => {
      document.removeEventListener("mousemove", a), document.removeEventListener("mouseup", l), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", o !== r && this.grid.moveColumn(this.fieldValue, o);
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
    const t = e.clientX, s = this.element.offsetWidth, r = (a) => this.grid.setColumnWidth(this.fieldValue, s + (a.clientX - t)), o = () => {
      document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", o), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", r), document.addEventListener("mouseup", o), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
N(Ne, "values", {
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
class as extends q {
  connect() {
  }
}
class ls extends q {
  connect() {
  }
}
class ds extends q {
  connect() {
  }
}
class _e extends q {
  constructor() {
    super(...arguments);
    N(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), s = e.paginationGetTotalPages(), r = e.paginationGetRowCount(), o = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const a = r === 0 ? 0 : t * o + 1, l = Math.min(r, a + o - 1);
        this.pageInfoTarget.textContent = r === 0 ? "0 rows" : `${a}–${l} of ${r}`;
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
N(_e, "outlets", ["grid"]), N(_e, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
const Se = ["sum", "avg", "count", "min", "max"], ci = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', ui = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class cs extends q {
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
    this.element.innerHTML = "", this._content = m("div", { class: "sg-side-panel-content" });
    const i = m("div", { class: "sg-side-panel-tabs" });
    this._columnsTab = m("button", {
      type: "button",
      class: "sg-side-panel-tab",
      "aria-pressed": "true",
      title: "Columns"
    }), this._columnsTab.innerHTML = ci, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), i.appendChild(this._columnsTab), this.element.append(this._content, i);
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
    const e = m("label", { class: "sg-panel-pivot-toggle" }), t = m("input", { type: "checkbox" });
    t.checked = i.isPivotMode(), t.addEventListener("change", () => i.setPivotMode(t.checked)), e.append(t, m("span", {}, "Pivot mode")), this._content.appendChild(e), this._content.appendChild(this._renderColumnsList()), this._content.appendChild(this._renderDropSection({
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
    const i = this._api(), e = m("div", { class: "sg-panel-section" });
    e.appendChild(m("div", { class: "sg-panel-section-title" }, "Columns"));
    const t = m("ul", { class: "sg-column-list" });
    e.appendChild(t);
    const s = new Set(i.getRowGroupColumns()), r = new Set(i.getPivotColumns()), o = new Map(i.getValueColumns().map((a) => [a.field, a.aggFunc]));
    for (const a of this._columns()) {
      const l = m("li", { class: "sg-column-list-item", draggable: "true" });
      l.dataset.field = a.field;
      const d = m("span", { class: "sg-column-grip", "aria-hidden": "true" });
      d.innerHTML = ui;
      const c = m("input", { type: "checkbox" });
      c.checked = !a.hidden, c.addEventListener("change", () => i.setColumnVisible(a.field, c.checked));
      const u = m("span", { class: "sg-column-list-label" }, a.headerName || a.field), h = m("span", { class: "sg-column-list-tags" });
      s.has(a.field) && h.appendChild(m("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), r.has(a.field) && h.appendChild(m("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), o.has(a.field) && h.appendChild(m("span", { class: "sg-tag sg-tag-value", title: `Value (${o.get(a.field)})` }, o.get(a.field))), l.append(d, c, u, h), this._wireDragSource(l, a.field), t.appendChild(l);
    }
    return this._wireDropZone(t, "columns"), e;
  }
  _renderDropSection({ title: i, placeholder: e, kind: t, fields: s }) {
    const r = m("div", { class: "sg-panel-section sg-panel-drop" });
    r.appendChild(m("div", { class: "sg-panel-section-title" }, i));
    const o = m("div", { class: "sg-drop-zone" });
    if (o.dataset.dropKind = t, !s.length)
      o.classList.add("sg-drop-zone-empty"), o.appendChild(m("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const a of s) o.appendChild(this._renderChip(t, a));
    return this._wireDropZone(o, t), r.appendChild(o), r;
  }
  _renderValuesSection() {
    const i = this._api(), e = m("div", { class: "sg-panel-section sg-panel-drop" });
    e.appendChild(m("div", { class: "sg-panel-section-title" }, "Values"));
    const t = m("div", { class: "sg-drop-zone" });
    t.dataset.dropKind = "value";
    const s = i.getValueColumns();
    if (!s.length)
      t.classList.add("sg-drop-zone-empty"), t.appendChild(m("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
    else
      for (const { field: r, aggFunc: o } of s) t.appendChild(this._renderValueChip(r, o));
    return this._wireDropZone(t, "value"), e.appendChild(t), e;
  }
  _renderChip(i, e) {
    const t = this._colByField(e), s = m("span", { class: "sg-chip", draggable: "true" });
    return s.dataset.field = e, s.dataset.fromKind = i, s.append(
      m("span", { class: "sg-chip-label" }, t?.headerName || e),
      this._removeButton(() => this._removeFrom(i, e))
    ), this._wireDragSource(s, e), s;
  }
  _renderValueChip(i, e) {
    const t = this._api(), s = this._colByField(i), r = m("span", { class: "sg-chip sg-chip-value", draggable: "true" });
    r.dataset.field = i, r.dataset.fromKind = "value";
    const o = m("button", {
      type: "button",
      class: "sg-chip-agg",
      title: "Click to cycle: sum → avg → count → min → max"
    }, e);
    return o.addEventListener("click", (a) => {
      a.stopPropagation();
      const l = Se.indexOf(e), d = Se[(l === -1 ? 0 : l + 1) % Se.length];
      t.setColumnAggFunc(i, d);
    }), r.append(
      o,
      m("span", { class: "sg-chip-label" }, s?.headerName || i),
      this._removeButton(() => t.removeValueColumn(i))
    ), this._wireDragSource(r, i), r;
  }
  _removeButton(i) {
    const e = m("button", { type: "button", class: "sg-chip-remove", "aria-label": "Remove", title: "Remove" });
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
      const s = t.dataTransfer.getData("text/plain");
      s && this._handleDrop(e, s);
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
function hi(n) {
  const i = n ?? ps.start();
  return i.register("grid", ke), i.register("header-cell", Ne), i.register("row", as), i.register("cell", ls), i.register("filter", ds), i.register("pagination", _e), i.register("side-panel", cs), i;
}
const pi = {
  start: hi,
  GridController: ke,
  HeaderCellController: Ne,
  RowController: as,
  CellController: ls,
  FilterController: ds,
  PaginationController: _e,
  SidePanelController: cs,
  registerRenderer: A,
  getRenderer: rt,
  listRenderers: Xs,
  renderers: si
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = pi);
export {
  ls as CellController,
  ds as FilterController,
  ke as GridController,
  Ne as HeaderCellController,
  _e as PaginationController,
  as as RowController,
  cs as SidePanelController,
  pi as default,
  rt as getRenderer,
  Xs as listRenderers,
  A as registerRenderer,
  si as renderers,
  hi as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
