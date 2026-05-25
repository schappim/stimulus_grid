var wn = Object.defineProperty;
var Cn = (s, i, e) => i in s ? wn(s, i, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[i] = e;
var N = (s, i, e) => Cn(s, typeof i != "symbol" ? i + "" : i, e);
import { Controller as q, Application as xn } from "@hotwired/stimulus";
function V(s, i) {
  return typeof i.valueGetter == "function" ? i.valueGetter(s) : s?.[i.field];
}
function G(s, i) {
  const e = V(s, i);
  return typeof i.valueFormatter == "function" ? i.valueFormatter(e, s) : e == null ? "" : i.type === "date" && e instanceof Date ? e.toLocaleDateString() : i.type === "boolean" ? e ? "✓" : "" : String(e);
}
const tt = {
  contains: (s, i) => String(s ?? "").toLowerCase().includes(String(i ?? "").toLowerCase()),
  notContains: (s, i) => !String(s ?? "").toLowerCase().includes(String(i ?? "").toLowerCase()),
  equals: (s, i) => String(s ?? "").toLowerCase() === String(i ?? "").toLowerCase(),
  notEqual: (s, i) => String(s ?? "").toLowerCase() !== String(i ?? "").toLowerCase(),
  startsWith: (s, i) => String(s ?? "").toLowerCase().startsWith(String(i ?? "").toLowerCase()),
  endsWith: (s, i) => String(s ?? "").toLowerCase().endsWith(String(i ?? "").toLowerCase()),
  blank: (s) => s == null || s === "",
  notBlank: (s) => s != null && s !== ""
}, Sn = {
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
function B(s) {
  if (s == null || s === "") return null;
  if (s instanceof Date) return s;
  const i = new Date(s);
  return Number.isNaN(i.valueOf()) ? null : i;
}
const Ln = {
  equals: (s, i) => B(s)?.toDateString() === B(i)?.toDateString(),
  notEqual: (s, i) => B(s)?.toDateString() !== B(i)?.toDateString(),
  lessThan: (s, i) => (B(s)?.valueOf() ?? -1 / 0) < (B(i)?.valueOf() ?? 1 / 0),
  greaterThan: (s, i) => (B(s)?.valueOf() ?? 1 / 0) > (B(i)?.valueOf() ?? -1 / 0),
  inRange: (s, i, e) => {
    const t = B(s)?.valueOf();
    return t != null && t >= (B(i)?.valueOf() ?? -1 / 0) && t <= (B(e)?.valueOf() ?? 1 / 0);
  },
  blank: (s) => s == null || s === "",
  notBlank: (s) => s != null && s !== ""
}, An = {
  equals: (s, i) => i === "true" ? !!s : i === "false" ? !s : !0
}, Mn = {
  in: (s, i) => Array.isArray(i) && i.includes(String(s ?? ""))
}, En = { text: tt, number: Sn, date: Ln, boolean: An, set: Mn };
function nt(s, i, e) {
  if (!e) return !0;
  const t = e.filterType || i.filter || "text", r = (En[t] || tt)[e.type];
  if (!r) return !0;
  const o = V(s, i);
  return r(o, e.value, e.value2);
}
function st(s, i, e) {
  const t = Object.entries(i || {}).filter(([, n]) => n != null);
  return t.length === 0 ? s : s.filter((n) => n && n.__sgSeparator ? !0 : t.every(([r, o]) => {
    const a = e[r];
    return a ? nt(n, a, o) : !0;
  }));
}
function it(s, i, e) {
  if (!i) return s;
  const t = String(i).toLowerCase();
  return s.filter((n) => {
    if (n && n.__sgSeparator) return !0;
    for (const r of e) {
      const o = G(n, r);
      if (o && String(o).toLowerCase().includes(t)) return !0;
    }
    return !1;
  });
}
function j(s, i, e) {
  if (s == null && i == null) return 0;
  if (s == null) return -1;
  if (i == null) return 1;
  if (e === "number") return Number(s) - Number(i);
  if (e === "date") {
    const t = B(s)?.valueOf() ?? 0, n = B(i)?.valueOf() ?? 0;
    return t - n;
  }
  return e === "boolean" ? s === i ? 0 : s ? 1 : -1 : String(s).localeCompare(String(i), void 0, { numeric: !0, sensitivity: "base" });
}
function Rn(s, i, e) {
  if (!i || i.length === 0) return s;
  const t = (l, d) => {
    for (const { colId: c, sort: u } of i) {
      const p = e[c];
      if (!p) continue;
      const h = V(l, p), g = V(d, p), _ = typeof p.comparator == "function" ? p.comparator(h, g, l, d) : j(h, g, p.type);
      if (_ !== 0) return u === "desc" ? -_ : _;
    }
    return 0;
  };
  if (!s.some((l) => l && l.__sgSeparator)) return s.slice().sort(t);
  const r = [];
  let o = [];
  const a = () => {
    if (o.length) {
      o.sort(t);
      for (const l of o) r.push(l);
      o = [];
    }
  };
  for (const l of s)
    l && l.__sgSeparator ? (a(), r.push(l)) : o.push(l);
  return a(), r;
}
function re(s, i) {
  if (!i || !i.enabled) return { rows: s, total: s.length, pageRows: s };
  const e = s.length, t = Math.max(1, Math.ceil(e / i.pageSize)), n = Math.min(i.page, t - 1), r = n * i.pageSize, o = s.slice(r, r + i.pageSize);
  return { rows: s, total: e, totalPages: t, page: n, pageRows: o };
}
function rt(s, i, e) {
  if (s === "count") return i.length;
  const t = i.map((r) => V(r, e));
  if (s === "first") return t.length ? t[0] : null;
  if (s === "last") return t.length ? t[t.length - 1] : null;
  const n = t.map(Number).filter((r) => !Number.isNaN(r));
  switch (s) {
    case "sum":
      return n.reduce((r, o) => r + o, 0);
    case "avg":
      return n.length ? n.reduce((r, o) => r + o, 0) / n.length : null;
    case "min":
      return n.length ? Math.min(...n) : null;
    case "max":
      return n.length ? Math.max(...n) : null;
    default:
      return null;
  }
}
function de(s, i, e) {
  const t = {};
  for (const [n, r] of Object.entries(i || {})) {
    const o = e[n];
    o && (t[n] = rt(r, s, o));
  }
  return t;
}
function Dn(s) {
  let i = 0, e = 0, t = 0, n = 1 / 0, r = -1 / 0;
  for (const o of s) {
    if (o == null || o === "") continue;
    i += 1;
    let a = null;
    if (typeof o == "number" && Number.isFinite(o)) a = o;
    else if (typeof o == "string" && o.trim() !== "") {
      const l = Number(o);
      Number.isFinite(l) && (a = l);
    }
    a != null && (e += 1, t += a, a < n && (n = a), a > r && (r = a));
  }
  return {
    count: i,
    sum: e ? t : null,
    avg: e ? t / e : null,
    min: e ? n : null,
    max: e ? r : null
  };
}
function Tn(s, i, e, t, n = () => !0) {
  const r = (d, c, u) => {
    const p = i[c], h = /* @__PURE__ */ new Map();
    for (const g of d) {
      const _ = V(g, p), y = _ == null ? "" : String(_);
      h.has(y) || h.set(y, { value: _, rows: [] }), h.get(y).rows.push(g);
    }
    return Array.from(h.values()).sort((g, _) => j(g.value, _.value, p.type)).map(({ value: g, rows: _ }) => {
      const y = g == null ? "" : String(g), S = u ? `${u}|${p.field}=${y}` : `${p.field}=${y}`;
      return {
        __sgGroup: !0,
        level: c,
        field: p.field,
        value: g,
        groupId: S,
        count: _.length,
        aggregates: de(_, t, e),
        leaves: _,
        children: c + 1 < i.length ? r(_, c + 1, S) : null
      };
    });
  }, o = r(s, 0, ""), a = [], l = (d) => {
    for (const c of d)
      if (a.push(c), !!n(c.groupId, c.level))
        if (c.children) l(c.children);
        else for (const u of c.leaves) a.push(u);
  };
  return l(o), { displayList: a, tree: o };
}
function ot(s, i, e) {
  return `__p|${e.map((n) => {
    const r = s[n.field];
    return `${n.field}=${r == null ? "" : String(r)}`;
  }).join("|")}|${i.col.field}:${i.aggFunc}`;
}
function at(s, i) {
  return i.map((e) => {
    const t = V(s, e);
    return t == null ? "" : String(t);
  }).join("");
}
function kn(s, i) {
  if (!i?.length) return [];
  const e = /* @__PURE__ */ new Map();
  for (const t of s) {
    const n = at(t, i);
    if (!e.has(n)) {
      const r = {};
      i.forEach((o) => {
        const a = V(t, o);
        r[o.field] = a ?? null;
      }), e.set(n, r);
    }
  }
  return Array.from(e.values()).sort((t, n) => {
    for (const r of i) {
      const o = j(t[r.field], n[r.field], r.type);
      if (o !== 0) return o;
    }
    return 0;
  });
}
function Nn(s, i, e) {
  if (!s.length || !i.length) return [];
  const t = [], n = i.length === 1;
  for (const r of s)
    for (const o of i) {
      const a = ot(r, o, e), l = e.map((c) => r[c.field] == null ? "(Blank)" : String(r[c.field])).join(" · "), d = n ? l : `${l} · ${o.aggFunc}(${o.col.field})`;
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
function $n(s) {
  return typeof s == "string" && s.startsWith("__p|");
}
function Vn(s, i) {
  const e = Array.isArray(s) ? s.filter((t) => t && t.colId && t.sort) : [];
  return (t, n) => {
    for (const r of e) {
      const o = r.sort === "desc" ? -1 : 1;
      if ($n(r.colId)) {
        const a = t.__pivotValues ? t.__pivotValues[r.colId] : null, l = n.__pivotValues ? n.__pivotValues[r.colId] : null, d = j(a, l, "number");
        if (d !== 0) return o * d;
        continue;
      }
      if (i && r.colId === i.field) {
        const a = j(t.value, n.value, i.type);
        if (a !== 0) return o * a;
        continue;
      }
    }
    return j(t.value, n.value, i?.type);
  };
}
function Be(s, i, e, t) {
  const n = {}, r = /* @__PURE__ */ new Map();
  for (const o of s) {
    const a = at(o, t);
    r.has(a) || r.set(a, []), r.get(a).push(o);
  }
  for (const o of i) {
    const a = t.map((d) => {
      const c = o[d.field];
      return c == null ? "" : String(c);
    }).join(""), l = r.get(a) || [];
    for (const d of e) {
      const c = ot(o, d, t);
      n[c] = l.length ? rt(d.aggFunc, l, d.col) : null;
    }
  }
  return n;
}
function In({ rows: s, rowGroupCols: i = [], pivotCols: e, valueConfigs: t, isExpanded: n = () => !0, sortModel: r = [] }) {
  const o = kn(s, e), a = Nn(o, t, e), l = {
    __sgGroup: !0,
    __pivotAll: !0,
    level: -1,
    field: null,
    value: "(All)",
    groupId: "__pivotAll",
    count: s.length,
    aggregates: {},
    leaves: s,
    __pivotValues: Be(s, o, t, e)
  };
  if (!i.length)
    return { columns: a, displayList: [l], tree: [], combos: o };
  const d = (h, g, _) => {
    const y = i[g], S = /* @__PURE__ */ new Map();
    for (const w of h) {
      const x = V(w, y), L = x == null ? "" : String(x);
      S.has(L) || S.set(L, { value: x, rows: [] }), S.get(L).rows.push(w);
    }
    const b = Array.from(S.values()).map(({ value: w, rows: x }) => {
      const L = w == null ? "" : String(w), D = _ ? `${_}|${y.field}=${L}` : `${y.field}=${L}`;
      return {
        __sgGroup: !0,
        level: g,
        field: y.field,
        value: w,
        groupId: D,
        count: x.length,
        aggregates: {},
        leaves: x,
        __pivotValues: Be(x, o, t, e),
        children: g + 1 < i.length ? d(x, g + 1, D) : null
      };
    }), v = Vn(r, y);
    return b.sort(v);
  }, c = d(s, 0, ""), u = [l], p = (h) => {
    for (const g of h)
      u.push(g), n(g.groupId, g.level) && g.children && p(g.children);
  };
  return p(c), { columns: a, displayList: u, tree: c, combos: o };
}
function Fn(s, { pivotCols: i = [], valueConfigs: e = [], columnGroups: t = null } = {}) {
  if (s._isPivot && i.length && s.pivotKeys)
    return Pn(s, i, e);
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
function Pn(s, i, e) {
  const t = (e?.length || 0) > 1, n = [];
  for (let r = 0; r < i.length; r++) {
    const o = i[r].field, a = s.pivotKeys[o];
    if (r === i.length - 1 && !t)
      return n.push({ kind: "leaf", col: s, label: a == null ? "(Blank)" : String(a) }), n;
    n.push({
      kind: "group",
      id: `p:${r}:${a == null ? "" : String(a)}`,
      label: a == null ? "(Blank)" : String(a)
    });
  }
  return n.push({ kind: "leaf", col: s, label: `${s.aggFunc}(${s.valueField})` }), n;
}
function Bn(s, i = {}) {
  if (!s.length) return { rows: [[]], depth: 1 };
  const e = s.map((r) => Fn(r, i).slice()), t = Math.max(1, ...e.map((r) => r.length)), n = [];
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
        let p = !0;
        for (let h = 0; h < r; h++) {
          const g = l[h]?.id ?? null, _ = u[h]?.id ?? null;
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
    n.push(o);
  }
  return { rows: n, depth: t };
}
function Hn({
  rows: s,
  parentField: i = "parent_id",
  getRowId: e = (o) => o?.id,
  passesFilter: t = null,
  siblingComparator: n = null,
  isExpanded: r = () => !0
} = {}) {
  if (!Array.isArray(s) || s.length === 0)
    return { displayList: [], treeMeta: /* @__PURE__ */ new Map() };
  const o = (y) => {
    const S = e(y);
    return S == null ? null : String(S);
  }, a = /* @__PURE__ */ new Map();
  for (const y of s) {
    const S = o(y);
    S != null && a.set(S, y);
  }
  const l = /* @__PURE__ */ new Map(), d = [];
  for (const y of s) {
    const S = o(y), b = y?.[i], v = b == null ? null : String(b);
    v == null || v === S || !a.has(v) ? d.push(y) : (l.has(v) || l.set(v, []), l.get(v).push(y));
  }
  const c = t ? new Map(s.map((y) => [o(y), !!t(y)])) : null, u = /* @__PURE__ */ new Map(), p = (y, S) => {
    const b = o(y);
    if (b == null) return !1;
    if (u.has(b)) return u.get(b);
    if (S.has(b)) return !1;
    S.add(b);
    let v = !!c.get(b);
    const w = l.get(b) || [];
    for (const x of w) v = p(x, S) || v;
    return S.delete(b), u.set(b, v), v;
  };
  if (c)
    for (const y of d) p(y, /* @__PURE__ */ new Set());
  const h = [], g = /* @__PURE__ */ new Map(), _ = (y, S, b, v) => {
    const w = c ? y.filter((x) => v || u.get(o(x))) : y.slice();
    n && w.sort(n);
    for (const x of w) {
      const L = o(x);
      if (L == null || b.has(L)) continue;
      const D = l.get(L) || [], C = v || (c ? !!c.get(L) : !1), E = c ? D.filter((F) => C || u.get(o(F))) : D, R = E.length > 0, $ = R && (c ? !0 : !!r(L, S));
      g.set(L, { level: S, hasChildren: R, expanded: $ }), h.push(x), $ && (b.add(L), _(E, S + 1, b, C), b.delete(L));
    }
  };
  return _(d, 0, /* @__PURE__ */ new Set(), !1), { displayList: h, treeMeta: g };
}
function Gn(s) {
  if (s.serverSide) {
    const c = s.rowData, u = s.pagination?.pageSize || c.length || 1, p = s.serverRowCount ?? c.length, h = Math.max(1, Math.ceil(p / u)), g = Math.min(s.pagination?.page || 0, h - 1);
    return { filteredSorted: c, rows: c, total: p, totalPages: h, page: g, pageRows: c };
  }
  const i = Object.fromEntries(s.columnDefs.map((c) => [c.field, c])), e = s.columnDefs.filter((c) => !c.hidden && !c._isCheckbox), t = (s.rowGroupCols || []).filter((c) => i[c]);
  if (s.treeData && !s.pivotMode && t.length === 0) {
    const c = s.treeParentField || "parent_id", u = Object.entries(s.filterModel || {}).filter(([, x]) => x != null), p = s.quickFilter ? String(s.quickFilter).toLowerCase() : "", g = u.length > 0 || p !== "" ? (x) => {
      for (const [L, D] of u) {
        const C = i[L];
        if (C && !nt(x, C, D)) return !1;
      }
      if (p) {
        let L = !1;
        for (const D of e) {
          const C = G(x, D);
          if (C && String(C).toLowerCase().includes(p)) {
            L = !0;
            break;
          }
        }
        if (!L) return !1;
      }
      return !0;
    } : null, _ = Array.isArray(s.sortModel) ? s.sortModel : [], y = _.length ? (x, L) => {
      for (const { colId: D, sort: C } of _) {
        const E = i[D];
        if (!E) continue;
        const R = V(x, E), $ = V(L, E), F = typeof E.comparator == "function" ? E.comparator(R, $, x, L) : j(R, $, E.type);
        if (F !== 0) return C === "desc" ? -F : F;
      }
      return 0;
    } : null, S = s.getRowId || ((x) => x?.id), { displayList: b, treeMeta: v } = Hn({
      rows: s.rowData,
      parentField: c,
      getRowId: S,
      passesFilter: g,
      siblingComparator: y,
      isExpanded: s.isTreeRowExpanded || (() => !0)
    }), w = re(b, s.pagination);
    return {
      tree: !0,
      treeData: !0,
      treeMeta: v,
      treeParentField: c,
      filteredSorted: b,
      ...w
    };
  }
  let n = s.rowData;
  n = st(n, s.filterModel, i), n = it(n, s.quickFilter, e), n = Rn(n, s.sortModel, i);
  const r = t, o = s.pivotMode ? (s.pivotCols || []).filter((c) => i[c]) : [], a = s.pivotMode ? Object.entries(s.aggModel || {}).filter(([c]) => i[c]).map(([c, u]) => ({ col: i[c], aggFunc: u })) : [];
  if (s.pivotMode && o.length && a.length) {
    const c = r.map((S) => i[S]), u = o.map((S) => i[S]), { columns: p, displayList: h, tree: g, combos: _ } = In({
      rows: n,
      rowGroupCols: c,
      pivotCols: u,
      valueConfigs: a,
      isExpanded: s.isGroupExpanded,
      sortModel: s.sortModel
    }), y = re(h, s.pagination);
    return {
      pivot: !0,
      pivotResultColumns: p,
      combos: _,
      grouped: !0,
      tree: g,
      leafCount: n.length,
      grandTotals: de(n, s.aggModel, i),
      filteredSorted: h,
      ...y
    };
  }
  if (r.length) {
    const c = r.map((g) => i[g]), { displayList: u, tree: p } = Tn(
      n,
      c,
      i,
      s.aggModel,
      s.isGroupExpanded
    ), h = re(u, s.pagination);
    return {
      grouped: !0,
      tree: p,
      leafCount: n.length,
      grandTotals: de(n, s.aggModel, i),
      filteredSorted: u,
      ...h
    };
  }
  const l = re(n, s.pagination), d = s.aggModel && Object.keys(s.aggModel).length ? de(n, s.aggModel, i) : null;
  return { filteredSorted: n, grandTotals: d, ...l };
}
function On(s, i, e, t, n = 6) {
  const r = Math.ceil(i / e), o = Math.max(0, Math.floor(s / e) - n), a = Math.min(t, o + r + n * 2);
  return { first: o, last: a };
}
function zn(s) {
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
function m(s, i = {}, e = []) {
  const t = document.createElement(s);
  for (const [n, r] of Object.entries(i))
    r === !1 || r == null || (n === "class" ? t.className = r : n === "style" && typeof r == "object" ? Object.assign(t.style, r) : n.startsWith("on") && typeof r == "function" ? t.addEventListener(n.slice(2).toLowerCase(), r) : r === !0 ? t.setAttribute(n, "") : t.setAttribute(n, String(r)));
  for (const n of [].concat(e))
    n == null || n === !1 || t.appendChild(typeof n == "string" ? document.createTextNode(n) : n);
  return t;
}
function He(s, i) {
  for (const [e, t] of Object.entries(i))
    t == null || t === !1 ? s.removeAttribute(e) : t === !0 ? s.setAttribute(e, "") : s.setAttribute(e, String(t));
}
function Ge(s) {
  const i = document.getElementById(s);
  return !i || i.tagName !== "TEMPLATE" ? null : i.content.firstElementChild.cloneNode(!0);
}
function M(s, i, e) {
  s.dispatchEvent(new CustomEvent(i, { detail: e, bubbles: !0 }));
}
function jn(s, i, e) {
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
const Oe = [
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
], qn = [
  21522,
  20773,
  24188,
  23371,
  17913,
  16590,
  20375,
  19104
], ce = new Uint8Array(512), Le = new Uint8Array(256);
(function() {
  let i = 1;
  for (let e = 0; e < 255; e++)
    ce[e] = i, Le[i] = e, i <<= 1, i & 256 && (i ^= 285);
  for (let e = 255; e < 512; e++) ce[e] = ce[e - 255];
})();
function Ae(s, i) {
  return s === 0 || i === 0 ? 0 : ce[Le[s] + Le[i]];
}
function Kn(s) {
  const i = new Uint8Array(s);
  i[s - 1] = 1;
  let e = 1;
  for (let t = 0; t < s; t++) {
    for (let n = 0; n < s; n++)
      i[n] = Ae(i[n], e), n + 1 < s && (i[n] ^= i[n + 1]);
    e = Ae(e, 2);
  }
  return i;
}
function Un(s, i) {
  const e = new Uint8Array(i.length);
  for (const t of s) {
    const n = t ^ e[0];
    e.copyWithin(0, 1), e[e.length - 1] = 0;
    for (let r = 0; r < i.length; r++)
      e[r] ^= Ae(i[r], n);
  }
  return e;
}
class Wn {
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
      for (let n = 0; n < 8; n++) t = t << 1 | this.bits[e * 8 + n];
      i[e] = t;
    }
    return i;
  }
}
function Xn(s) {
  const i = new TextEncoder().encode(String(s));
  let e = 0;
  for (let C = 1; C <= 10; C++) {
    const R = 4 + (C < 10 ? 8 : 16) + i.length * 8, $ = Oe[C - 1][0] * 8;
    if (R <= $) {
      e = C;
      break;
    }
  }
  if (e === 0)
    throw new Error(`qr: data too long for v10 ECC=M (${i.length} bytes; max 213)`);
  const [t, n, r] = Oe[e - 1], o = new Wn();
  o.append(4, 4), o.append(i.length, e < 10 ? 8 : 16);
  for (const C of i) o.append(C, 8);
  const a = t * 8;
  o.append(0, Math.min(4, Math.max(0, a - o.bits.length)));
  const l = o.toBytes(), d = new Uint8Array(t);
  d.set(l);
  const c = [236, 17];
  for (let C = l.length; C < t; C++) d[C] = c[(C - l.length) % 2];
  const u = Math.floor(t / r), p = t - u * r, h = [], g = Kn(n);
  let _ = 0;
  for (let C = 0; C < r; C++) {
    const E = C < r - p ? u : u + 1, R = d.slice(_, _ + E);
    _ += E, h.push({ data: R, ecc: Un(R, g) });
  }
  const y = [], S = u + 1;
  for (let C = 0; C < S; C++)
    for (const E of h) C < E.data.length && y.push(E.data[C]);
  for (let C = 0; C < n; C++)
    for (const E of h) y.push(E.ecc[C]);
  const b = 17 + e * 4, v = new Uint8Array(b * b), w = new Uint8Array(b * b);
  Yn(v, w, b), Qn(v, w, b), Jn(v, w, b, e), e >= 7 && es(v, w, b, e), ts(v, w, b, y);
  let x = 0, L = 1 / 0;
  const D = new Uint8Array(v);
  for (let C = 0; C < 8; C++) {
    D.set(v), je(D, w, b, C), ze(D, b, C);
    const E = ns(D, b);
    E < L && (L = E, x = C);
  }
  return je(v, w, b, x), ze(v, b, x), { size: b, matrix: v };
}
function I(s, i, e, t, n) {
  s[t * i + e] = n ? 1 : 0;
}
function Yn(s, i, e) {
  const t = [[0, 0], [e - 7, 0], [0, e - 7]];
  for (const [n, r] of t)
    for (let o = -1; o <= 7; o++)
      for (let a = -1; a <= 7; a++) {
        const l = n + a, d = r + o;
        if (l < 0 || d < 0 || l >= e || d >= e) continue;
        const u = a >= 0 && a < 7 && o >= 0 && o < 7 && (a === 0 || a === 6 || o === 0 || o === 6 || // outer ring
        a >= 2 && a <= 4 && o >= 2 && o <= 4);
        I(s, e, l, d, u), i[d * e + l] = 1;
      }
  for (let n = 0; n < 9; n++)
    i[n * e + 8] = 1, i[8 * e + n] = 1;
  for (let n = 0; n < 8; n++)
    i[(e - 1 - n) * e + 8] = 1, i[8 * e + (e - 1 - n)] = 1;
  I(s, e, 8, e - 8, 1), i[(e - 8) * e + 8] = 1;
}
function Qn(s, i, e) {
  for (let t = 8; t < e - 8; t++)
    I(s, e, t, 6, t % 2 === 0), I(s, e, 6, t, t % 2 === 0), i[6 * e + t] = 1, i[t * e + 6] = 1;
}
const Zn = [
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
function Jn(s, i, e, t) {
  const n = Zn[t];
  if (n) {
    for (const r of n)
      for (const o of n)
        if (!(o === 6 && r === 6 || o === e - 7 && r === 6 || o === 6 && r === e - 7))
          for (let l = -2; l <= 2; l++)
            for (let d = -2; d <= 2; d++) {
              const c = Math.max(Math.abs(d), Math.abs(l)) !== 1;
              I(s, e, o + d, r + l, c), i[(r + l) * e + (o + d)] = 1;
            }
  }
}
function es(s, i, e, t) {
  let n = t, r = n;
  for (let a = 0; a < 12; a++)
    r = r << 1 ^ (r >>> 11) * 7973;
  const o = n << 12 | r;
  for (let a = 0; a < 18; a++) {
    const l = o >>> a & 1, d = Math.floor(a / 3), c = a % 3 + e - 11;
    I(s, e, d, c, l), i[c * e + d] = 1, I(s, e, c, d, l), i[d * e + c] = 1;
  }
}
function ze(s, i, e) {
  const t = qn[e];
  for (let n = 0; n < 15; n++) {
    const r = (t >>> n & 1) === 1;
    n < 6 ? I(s, i, 8, n, r) : n < 8 ? I(s, i, 8, n + 1, r) : n < 9 ? I(s, i, 7, 8, r) : I(s, i, 14 - n, 8, r), n < 8 ? I(s, i, i - 1 - n, 8, r) : I(s, i, 8, i - 15 + n, r);
  }
  I(s, i, 8, i - 8, 1);
}
function ts(s, i, e, t) {
  let n = 0, r = -1;
  for (let o = e - 1; o > 0; o -= 2) {
    o === 6 && o--;
    for (let a = 0; a < e; a++) {
      const l = r < 0 ? e - 1 - a : a;
      for (let d = 0; d < 2; d++) {
        const c = o - d;
        if (i[l * e + c]) continue;
        const u = n < t.length * 8 ? t[n >>> 3] >>> 7 - (n & 7) & 1 : 0;
        s[l * e + c] = u, n++;
      }
    }
    r = -r;
  }
}
function je(s, i, e, t) {
  for (let n = 0; n < e; n++)
    for (let r = 0; r < e; r++) {
      if (i[n * e + r]) continue;
      let o = !1;
      switch (t) {
        case 0:
          o = (r + n & 1) === 0;
          break;
        case 1:
          o = (n & 1) === 0;
          break;
        case 2:
          o = r % 3 === 0;
          break;
        case 3:
          o = (r + n) % 3 === 0;
          break;
        case 4:
          o = (Math.floor(n / 2) + Math.floor(r / 3) & 1) === 0;
          break;
        case 5:
          o = r * n % 2 + r * n % 3 === 0;
          break;
        case 6:
          o = (r * n % 2 + r * n % 3 & 1) === 0;
          break;
        case 7:
          o = ((r + n) % 2 + r * n % 3 & 1) === 0;
          break;
      }
      o && (s[n * e + r] ^= 1);
    }
}
function ns(s, i) {
  let e = 0;
  for (let t = 0; t < i; t++) {
    let n = 1, r = -1;
    for (let o = 0; o < i; o++) {
      const a = s[t * i + o];
      a === r ? (n++, n === 5 ? e += 3 : n > 5 && (e += 1)) : (r = a, n = 1);
    }
  }
  for (let t = 0; t < i; t++) {
    let n = 1, r = -1;
    for (let o = 0; o < i; o++) {
      const a = s[o * i + t];
      a === r ? (n++, n === 5 ? e += 3 : n > 5 && (e += 1)) : (r = a, n = 1);
    }
  }
  for (let t = 0; t < i - 1; t++)
    for (let n = 0; n < i - 1; n++) {
      const r = s[t * i + n];
      s[t * i + n + 1] === r && s[(t + 1) * i + n] === r && s[(t + 1) * i + n + 1] === r && (e += 3);
    }
  return e;
}
function ss({ size: s, matrix: i }, e = {}) {
  const {
    moduleSize: t = 4,
    margin: n = 2,
    background: r = "#fff",
    foreground: o = "#111827"
  } = e, a = (s + n * 2) * t;
  let l = "";
  for (let d = 0; d < s; d++)
    for (let c = 0; c < s; c++)
      if (i[d * s + c]) {
        const u = (c + n) * t, p = (d + n) * t;
        l += `M${u},${p}h${t}v${t}h-${t}z`;
      }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a} ${a}" width="${a}" height="${a}" shape-rendering="crispEdges" aria-hidden="true"><rect width="${a}" height="${a}" fill="${r}"/><path d="${l}" fill="${o}"/></svg>`;
}
const is = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.1 297.4z"/></svg>', Ee = /* @__PURE__ */ new Map();
function A(s, i) {
  if (typeof s != "string" || !s) throw new Error("registerRenderer: name must be a non-empty string");
  if (typeof i != "function") throw new Error("registerRenderer: fn must be a function");
  Ee.set(s, i);
}
function lt(s) {
  return Ee.get(s) || null;
}
function rs() {
  return Array.from(Ee.keys());
}
function f(s, i = {}, e = null) {
  const t = document.createElement(s);
  for (const [n, r] of Object.entries(i))
    r == null || r === !1 || (n === "class" ? t.className = r : t.setAttribute(n, r === !0 ? "" : String(r)));
  return e == null || (Array.isArray(e) ? e.forEach((n) => t.append(n)) : typeof e == "string" ? t.innerHTML = e : t.append(e)), t;
}
const k = (s) => s == null || s === "", os = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function dt() {
  return ({ value: s }) => {
    if (k(s)) return "";
    const i = String(s);
    return os.test(i) ? f("a", {
      class: "sg-renderer-link",
      href: `mailto:${i}`,
      title: "Send email"
    }, document.createTextNode(i)) : f("span", { class: "sg-renderer-invalid", title: "Invalid email" }, document.createTextNode(i));
  };
}
function ct({ newTab: s = !0 } = {}) {
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
      target: s ? "_blank" : null,
      rel: s ? "noopener noreferrer" : null,
      title: e
    }, document.createTextNode(t.hostname + (t.pathname !== "/" ? t.pathname : "")));
  };
}
function ut({ defaultRegion: s = "AU" } = {}) {
  return ({ value: i }) => {
    if (k(i)) return "";
    const e = String(i).trim(), t = e.replace(/\D/g, "");
    if (!t) return document.createTextNode(e);
    let n = e;
    return s === "AU" && (/^04\d{8}$/.test(t) ? n = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : /^0[2378]\d{8}$/.test(t) ? n = `(${t.slice(0, 2)}) ${t.slice(2, 6)} ${t.slice(6)}` : /^1[38]00\d{6}$/.test(t) ? n = `${t.slice(0, 4)} ${t.slice(4, 7)} ${t.slice(7)}` : t.length === 8 && (n = `${t.slice(0, 4)} ${t.slice(4)}`)), f("a", { class: "sg-renderer-link", href: `tel:${t}` }, document.createTextNode(n));
  };
}
function pt({ currency: s = "USD", locale: i = "en-US", decimals: e } = {}) {
  return ({ value: t, td: n }) => {
    if (n && n.classList.add("sg-renderer-number"), k(t)) return "";
    const r = Number(t);
    if (!Number.isFinite(r)) return String(t);
    const o = { style: "currency", currency: s };
    return e != null && (o.minimumFractionDigits = e, o.maximumFractionDigits = e), r.toLocaleString(i, o);
  };
}
function ht({ decimals: s = 0, scale: i = "as-is" } = {}) {
  return ({ value: e, td: t }) => {
    if (t && t.classList.add("sg-renderer-number"), k(e)) return "";
    let n = Number(e);
    return Number.isFinite(n) ? (i === "fraction" && (n *= 100), `${n.toFixed(s)}%`) : String(e);
  };
}
function Re(s) {
  if (s == null || s === "") return null;
  if (s instanceof Date) return Number.isNaN(s.valueOf()) ? null : s;
  const i = new Date(s);
  return Number.isNaN(i.valueOf()) ? null : i;
}
function ft({ locale: s = void 0, dateStyle: i = "medium", ...e } = {}) {
  const t = new Intl.DateTimeFormat(s, { dateStyle: i, ...e });
  return ({ value: n }) => {
    const r = Re(n);
    return r ? t.format(r) : "";
  };
}
function gt({ locale: s = void 0, dateStyle: i = "medium", timeStyle: e = "short", ...t } = {}) {
  const n = new Intl.DateTimeFormat(s, { dateStyle: i, timeStyle: e, ...t });
  return ({ value: r }) => {
    const o = Re(r);
    return o ? n.format(o) : "";
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
function mt({ locale: s = void 0, numeric: i = "auto", style: e = "long" } = {}) {
  const t = new Intl.RelativeTimeFormat(s, { numeric: i, style: e });
  return ({ value: n }) => {
    const r = Re(n);
    if (!r) return "";
    const o = r.getTime() - Date.now(), a = Math.abs(o), l = ve.find((u) => a < u.cutoff) || ve[ve.length - 1], d = Math.round(o / l.ms), c = f("span", { class: "sg-renderer-relative-time", title: r.toLocaleString() });
    return c.textContent = t.format(d, l.unit), c;
  };
}
const as = { ms: 1, sec: 1e3, second: 1e3, min: 6e4, minute: 6e4, hr: 36e5, hour: 36e5 };
function _t({ unit: s = "ms", style: i = "compact" } = {}) {
  const e = as[s] ?? 1;
  return ({ value: t, td: n }) => {
    if (n && n.classList.add("sg-renderer-number"), k(t)) return "";
    const r = Number(t) * e;
    if (!Number.isFinite(r)) return String(t);
    const o = r < 0 ? "-" : "", a = Math.abs(r), l = Math.floor(a / 36e5), d = Math.floor(a % 36e5 / 6e4), c = Math.floor(a % 6e4 / 1e3);
    if (i === "clock") {
      const p = (h) => String(h).padStart(2, "0");
      return o + (l > 0 ? `${p(l)}:${p(d)}:${p(c)}` : `${p(d)}:${p(c)}`);
    }
    if (i === "words") {
      const p = [];
      return l && p.push(`${l} ${l === 1 ? "hour" : "hours"}`), d && p.push(`${d} ${d === 1 ? "minute" : "minutes"}`), !l && c && p.push(`${c} ${c === 1 ? "second" : "seconds"}`), o + (p.join(" ") || "0 seconds");
    }
    const u = [];
    return l && u.push(`${l}h`), d && u.push(`${d}m`), !l && c && u.push(`${c}s`), o + (u.join(" ") || "0s");
  };
}
function bt({ locale: s = void 0, decimals: i, ...e } = {}) {
  const t = { ...e };
  i != null && (t.minimumFractionDigits = i, t.maximumFractionDigits = i);
  const n = new Intl.NumberFormat(s, t);
  return ({ value: r, td: o }) => {
    if (o && o.classList.add("sg-renderer-number"), k(r)) return "";
    const a = Number(r);
    return Number.isFinite(a) ? n.format(a) : String(r);
  };
}
function yt({ locale: s = void 0, compactDisplay: i = "short", maximumFractionDigits: e = 1 } = {}) {
  const t = new Intl.NumberFormat(s, {
    notation: "compact",
    compactDisplay: i,
    maximumFractionDigits: e
  });
  return ({ value: n, td: r }) => {
    if (r && r.classList.add("sg-renderer-number"), k(n)) return "";
    const o = Number(n);
    return Number.isFinite(o) ? t.format(o) : String(n);
  };
}
function vt({ binary: s = !0, decimals: i = 1, locale: e = void 0 } = {}) {
  const t = s ? 1024 : 1e3, n = s ? ["B", "KiB", "MiB", "GiB", "TiB", "PiB"] : ["B", "KB", "MB", "GB", "TB", "PB"], r = new Intl.NumberFormat(e, {
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
    for (; l >= t && c < n.length - 1; )
      l /= t, c += 1;
    const u = c === 0 ? String(Math.round(l)) : r.format(l);
    return `${d}${u} ${n[c]}`;
  };
}
const ls = /* @__PURE__ */ new Set(["1", "true", "t", "yes", "y", "on"]);
function De(s) {
  return s === !0 || s === 1 ? !0 : s == null || s === "" || s === !1 || s === 0 ? !1 : ls.has(String(s).toLowerCase());
}
const ds = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>', cs = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';
function wt({
  truthy: s = De,
  nullLabel: i = "—",
  falseStyle: e = "icon"
  // 'icon' | 'hidden'
} = {}) {
  return ({ value: t }) => {
    if (t == null || t === "")
      return f("span", { class: "sg-renderer-bool-null" }, document.createTextNode(i));
    if (s(t)) {
      const r = f("span", { class: "sg-renderer-bool is-true", "aria-label": "true" });
      return r.innerHTML = ds, r;
    }
    if (e === "hidden") return "";
    const n = f("span", { class: "sg-renderer-bool is-false", "aria-label": "false" });
    return n.innerHTML = cs, n;
  };
}
const us = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>', ps = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.7 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>', hs = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M64 256a32 32 0 1 0 0-64H384V160c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9S384 364.9 384 352V320H64z"/></svg>';
function Ct({
  style: s = "percent",
  // 'percent' | 'number' | 'currency'
  decimals: i = 1,
  locale: e = void 0,
  currency: t = "USD",
  inverted: n = !1,
  showSign: r = !0
} = {}) {
  let o;
  return s === "currency" ? o = new Intl.NumberFormat(e, {
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
    let c = "is-flat", u = hs;
    const p = !n;
    d > 0 ? (c = p ? "is-up" : "is-down", u = us) : d < 0 && (c = p ? "is-down" : "is-up", u = ps);
    const h = f("span", { class: `sg-renderer-delta ${c}` }), g = f("span", { class: "sg-renderer-delta-icon", "aria-hidden": "true" });
    g.innerHTML = u;
    const _ = s === "percent" ? `${o.format(d)}%` : o.format(d);
    return h.append(g), h.append(f("span", { class: "sg-renderer-delta-value" }, document.createTextNode(_))), h;
  };
}
function xt({ chars: s = null } = {}) {
  return ({ value: i, td: e }) => {
    if (k(i)) return "";
    const t = String(i);
    let n = t, r = !1;
    return s && t.length > s && (n = t.slice(0, s) + "…", r = !0), e && (e.classList.add("sg-renderer-truncate"), e.setAttribute("title", t)), r ? n : t;
  };
}
const ge = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>', St = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';
function Lt({ position: s = "after" } = {}) {
  return ({ value: i }) => {
    if (k(i)) return "";
    const e = String(i), t = f("span", { class: "sg-renderer-copyable" }), n = f("span", { class: "sg-renderer-copyable-value" }, document.createTextNode(e)), r = f("button", {
      type: "button",
      class: "sg-renderer-copyable-btn",
      title: "Copy",
      "aria-label": `Copy ${e}`
    });
    return r.innerHTML = ge, r.addEventListener("click", async (o) => {
      o.stopPropagation(), o.preventDefault();
      try {
        navigator.clipboard?.writeText ? await navigator.clipboard.writeText(e) : At(e), r.innerHTML = St, r.classList.add("is-copied"), setTimeout(() => {
          r.innerHTML = ge, r.classList.remove("is-copied");
        }, 1200);
      } catch {
      }
    }), s === "before" ? t.append(r, n) : t.append(n, r), t;
  };
}
function At(s) {
  const i = document.createElement("textarea");
  i.value = s, i.style.position = "fixed", i.style.left = "-9999px", document.body.appendChild(i), i.select();
  try {
    document.execCommand("copy");
  } catch {
  }
  document.body.removeChild(i);
}
function Mt({
  size: s = 36,
  rounded: i = "sm",
  // 'sm' = 4px, 'lg' = 8px, 'full' = circle, 'none'
  altField: e = "alt",
  clickToZoom: t = !1
} = {}) {
  const n = i === "full" ? "999px" : i === "lg" ? "8px" : i === "none" ? "0" : "4px";
  return ({ value: r, row: o }) => {
    if (k(r)) return "";
    const a = String(r), l = o?.[e] ?? "", d = f("img", {
      src: a,
      alt: l,
      class: "sg-renderer-image",
      width: String(s),
      height: String(s),
      style: `border-radius: ${n};`,
      loading: "lazy",
      decoding: "async"
    });
    return t && (d.style.cursor = "zoom-in", d.addEventListener("click", (c) => {
      c.stopPropagation(), fs(a, l);
    })), d;
  };
}
function fs(s, i) {
  const e = f("div", { class: "sg-image-zoom" }), t = () => {
    e.remove(), document.removeEventListener("keydown", n);
  }, n = (r) => {
    r.key === "Escape" && t();
  };
  e.addEventListener("click", t), document.addEventListener("keydown", n), e.append(f("img", { src: s, alt: i || "", class: "sg-image-zoom-img" })), document.body.appendChild(e);
}
function Et({
  showLabel: s = !0,
  label: i = "value",
  // 'value' | 'name' | (value, row) => string
  shape: e = "circle",
  // 'circle' | 'square'
  size: t = 14
} = {}) {
  return ({ value: n, row: r }) => {
    if (k(n)) return "";
    const o = String(n).trim(), a = f("span", { class: "sg-renderer-swatch" }), l = f("span", {
      class: `sg-renderer-swatch-chip is-${e}`,
      style: `width: ${t}px; height: ${t}px; background: ${o};`,
      "aria-hidden": "true"
    });
    if (a.append(l), s) {
      const d = typeof i == "function" ? i(n, r) : i === "name" ? r?.name ?? o : o;
      a.append(f("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(d)));
    }
    return a;
  };
}
const Te = {
  blue: "#3b82f6",
  green: "#10b981",
  red: "#ef4444",
  orange: "#f97316",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gray: "#6b7280"
};
function Rt({
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
  const o = Te[t] || t;
  return ({ value: a }) => {
    if (!Array.isArray(a) || a.length === 0) return "";
    const l = a.map(Number).filter((v) => Number.isFinite(v));
    if (l.length === 0) return "";
    const d = n ?? Math.min(...l), u = Math.max(...l, n ?? -1 / 0) - d || 1, p = 1.5, h = 2.5, g = i - p * 2, _ = e - h * 2, y = (v) => p + (l.length === 1 ? g / 2 : v / (l.length - 1) * g), S = (v) => h + _ - (v - d) / u * _;
    let b = "";
    if (s === "bar") {
      const w = Math.max(1, (g - (l.length - 1) * 1) / l.length);
      for (let x = 0; x < l.length; x++) {
        const L = l[x], D = p + x * (w + 1), C = S(L), E = h + _ - C;
        b += `<rect x="${D.toFixed(2)}" y="${C.toFixed(2)}" width="${w.toFixed(2)}" height="${E.toFixed(2)}" fill="${o}"/>`;
      }
    } else {
      let v = "";
      for (let w = 0; w < l.length; w++)
        v += `${w === 0 ? "M" : "L"} ${y(w).toFixed(2)} ${S(l[w]).toFixed(2)} `;
      if (s === "area") {
        const w = v + ` L ${y(l.length - 1).toFixed(2)} ${(h + _).toFixed(2)} L ${y(0).toFixed(2)} ${(h + _).toFixed(2)} Z`;
        b += `<path d="${w}" fill="${o}" fill-opacity="0.18" stroke="none"/>`;
      }
      if (b += `<path d="${v.trim()}" fill="none" stroke="${o}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`, r) {
        const w = y(l.length - 1), x = S(l[l.length - 1]);
        b += `<circle cx="${w.toFixed(2)}" cy="${x.toFixed(2)}" r="1.8" fill="${o}"/>`;
      }
    }
    return `<svg class="sg-renderer-sparkline is-${s}" viewBox="0 0 ${i} ${e}" width="${i}" height="${e}" preserveAspectRatio="none" aria-hidden="true">` + b + "</svg>";
  };
}
function Dt(s) {
  if (typeof s != "string") return null;
  let i = s.trim().replace(/^#/, "");
  return i.length === 3 && (i = i.split("").map((e) => e + e).join("")), /^[0-9a-f]{6}$/i.test(i) ? [parseInt(i.slice(0, 2), 16), parseInt(i.slice(2, 4), 16), parseInt(i.slice(4, 6), 16)] : null;
}
function gs(s, i, e) {
  const t = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  return `#${t(s)}${t(i)}${t(e)}`;
}
function ms(s, i, e) {
  return [s[0] + (i[0] - s[0]) * e, s[1] + (i[1] - s[1]) * e, s[2] + (i[2] - s[2]) * e];
}
function Tt([s, i, e]) {
  return 0.299 * s + 0.587 * i + 0.114 * e >= 145;
}
function kt({
  min: s = 0,
  max: i = 100,
  colors: e = ["#dcfce7", "#fef3c7", "#fecaca"],
  inverted: t = !1,
  showValue: n = !0,
  format: r = null
  // (value) => string for custom labels
} = {}) {
  const o = e.map(Dt).filter(Boolean);
  if (o.length < 2) throw new Error("heatmap: need at least two valid hex colours");
  return ({ value: a, td: l }) => {
    if (l && l.classList.add("sg-renderer-heatmap"), k(a)) return "";
    let d = Number(a);
    if (!Number.isFinite(d)) return String(a);
    let c = i - s === 0 ? 0.5 : (d - s) / (i - s);
    c = Math.max(0, Math.min(1, c)), t && (c = 1 - c);
    const u = c * (o.length - 1), p = Math.min(o.length - 2, Math.floor(u)), h = u - p, g = ms(o[p], o[p + 1], h);
    return l && (l.style.backgroundColor = gs(...g), l.style.color = Tt(g) ? "#111827" : "#ffffff"), n ? typeof r == "function" ? r(a) : String(a) : "";
  };
}
const _s = {
  // Credit card: 16 digits grouped 4-4-4-4, last 4 visible. Handles 13-19
  // digit lengths gracefully (Amex 15, others 16). Non-digits are stripped.
  "cc-last4": (s, i) => qe(s.replace(/\D/g, ""), 4, 4, i, " "),
  // BIN + last4: show the first 6 + last 4, mask the middle (PCI-friendly).
  "cc-bin-last4": (s, i) => qe(s.replace(/\D/g, ""), 4, 4, i, " ", 6),
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
  last4: (s, i) => bs(s, 4, i)
};
function bs(s, i, e) {
  const t = String(s);
  return t.length <= i ? t : e.repeat(t.length - i) + t.slice(-i);
}
function qe(s, i, e, t, n, r = 0) {
  if (!s) return "";
  const o = s.length, a = s.split("").map((d, c) => c < r || c >= o - e ? d : t).join(""), l = [];
  for (let d = a.length; d > 0; d -= i)
    l.unshift(a.slice(Math.max(0, d - i), d));
  return l.join(n);
}
const ys = /* @__PURE__ */ new Set(["cc-last4", "cc-bin-last4", "phone-last4", "last4"]);
function Nt({
  format: s = null,
  showFirst: i = 0,
  showLast: e = 4,
  char: t = "•",
  align: n = null
  // 'left' | 'right' | null (auto)
} = {}) {
  const r = s ? _s[s] : null, o = s ? ys.has(s) : !1, a = n === "right" || n !== "left" && o;
  return ({ value: l, td: d }) => {
    if (d && a && d.classList.add("sg-renderer-mask-numeric"), k(l)) return "";
    const c = String(l);
    if (r) return r(c, t);
    const u = c.slice(0, i), p = e > 0 ? c.slice(-e) : "", h = Math.max(0, c.length - i - e);
    return u + t.repeat(h) + p;
  };
}
function $t({
  query: s = null,
  caseSensitive: i = !1,
  className: e = "sg-renderer-mark"
} = {}) {
  return ({ value: t, api: n }) => {
    if (k(t)) return "";
    const r = String(t), o = s != null ? String(s) : n?.getQuickFilter?.() || "";
    return o ? vs(r, o, i, e) : document.createTextNode(r);
  };
}
function vs(s, i, e, t) {
  const n = e ? s : s.toLowerCase(), r = e ? i : i.toLowerCase(), o = document.createElement("span");
  let a = 0;
  for (; a < s.length; ) {
    const l = n.indexOf(r, a);
    if (l === -1) {
      o.appendChild(document.createTextNode(s.slice(a)));
      break;
    }
    l > a && o.appendChild(document.createTextNode(s.slice(a, l)));
    const d = document.createElement("mark");
    d.className = t, d.textContent = s.slice(l, l + i.length), o.appendChild(d), a = l + i.length;
  }
  return o;
}
function Vt({ lines: s = null, separator: i = `
` } = {}) {
  return ({ value: e, td: t }) => {
    if (k(e)) return "";
    const n = String(e), r = i === `
` ? n : n.split(i).join(`
`);
    if (t) {
      t.classList.add("sg-renderer-multiline"), t.setAttribute("title", r);
      const o = t.parentElement;
      o && o.tagName === "TR" && o.classList.add("sg-has-multiline");
    }
    if (s != null && s > 0) {
      const o = document.createElement("div");
      return o.className = "sg-renderer-multiline-clamp", o.style.setProperty("--sg-clamp", String(s)), o.textContent = r, o;
    }
    return r;
  };
}
function te(s) {
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
const ws = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "webp", "avif", "svg", "bmp", "ico"]);
function z(s) {
  if (!s) return !1;
  if (typeof s.content_type == "string" && s.content_type.startsWith("image/")) return !0;
  const i = String(s.filename || "").split(".").pop()?.toLowerCase();
  return i ? ws.has(i) : !1;
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
}, It = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>', ke = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>', Cs = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>', xs = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 105.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>', Ss = /* @__PURE__ */ new Set(["mp3", "wav", "flac", "m4a", "ogg", "aac", "opus"]), Ls = /* @__PURE__ */ new Set(["mp4", "mov", "webm", "mkv", "avi", "m4v"]);
function Ft(s) {
  const i = String(s?.content_type || "").toLowerCase(), e = String(s?.filename || "").split(".").pop()?.toLowerCase() || "";
  return i.includes("pdf") || e === "pdf" ? "pdf" : i.startsWith("audio/") || Ss.has(e) ? "audio" : i.startsWith("video/") || Ls.has(e) ? "video" : i.includes("zip") || ["zip", "tar", "gz", "7z", "rar"].includes(e) ? "zip" : i.includes("sheet") || i.includes("excel") || i.includes("csv") || ["xls", "xlsx", "csv", "numbers"].includes(e) ? "sheet" : i.includes("word") || i.includes("document") || ["doc", "docx", "txt", "md", "rtf"].includes(e) ? "doc" : ["js", "ts", "rb", "py", "go", "rs", "java", "json", "xml", "html", "css", "sh", "sql"].includes(e) ? "code" : "file";
}
function ye(s) {
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
function Pt({
  thumbSize: s = 28,
  maxThumbs: i = 4,
  empty: e = "",
  editable: t = !1,
  accept: n = null,
  multiple: r = !0,
  download: o = !1,
  onUpload: a = null,
  onRemove: l = null
} = {}) {
  return (d) => {
    const { value: c, td: u, row: p, col: h } = d, g = ye(c);
    if (u && (u.classList.add("sg-renderer-attachments-cell"), u.dataset.attachmentCount = String(g.length), u._sgAttachments = g), g.length === 0 && !t)
      return e ? document.createTextNode(e) : "";
    const _ = f("div", { class: "sg-renderer-attachments", role: "group" }), y = g.slice(0, i), S = Math.max(0, g.length - y.length);
    if (y.forEach((b) => _.append(As(b, s, g, o))), S > 0) {
      const b = f(
        "span",
        { class: "sg-attach-more", title: `${S} more` },
        document.createTextNode(`+${S}`)
      );
      b.addEventListener("click", (v) => {
        v.stopPropagation(), Bt(g, g[y.length]);
      }), _.append(b);
    }
    if (t) {
      const b = f("button", {
        type: "button",
        class: "sg-attach-add",
        title: "Add files",
        "aria-label": "Add attachments",
        "data-sg-attach": "add"
      });
      b.innerHTML = It, b.addEventListener("click", (v) => {
        v.stopPropagation(), Ke(u, d, { thumbSize: s, accept: n, multiple: r, onUpload: a, onRemove: l });
      }), _.append(b), Ms(u, d, { onUpload: a }), u.addEventListener("dblclick", (v) => {
        v._sgAttachmentHandled || (v._sgAttachmentHandled = !0, v.stopPropagation(), Ke(u, d, { thumbSize: s, accept: n, multiple: r, onUpload: a, onRemove: l }));
      }, { once: !1 });
    }
    return _;
  };
}
function As(s, i, e, t) {
  const n = f("button", {
    type: "button",
    class: "sg-attach-thumb",
    title: `${s.filename}${s.byte_size != null ? " · " + te(s.byte_size) : ""}`,
    "data-attachment-id": s.id,
    "data-attachment-kind": z(s) ? "image" : "file",
    "aria-label": s.filename,
    style: `width: ${i}px; height: ${i}px;`
  });
  if (z(s) && s.thumb_url)
    n.append(f("img", {
      src: s.thumb_url,
      alt: s.filename,
      loading: "lazy",
      decoding: "async",
      width: String(i),
      height: String(i)
    }));
  else {
    const r = Ft(s), o = f("span", { class: `sg-attach-icon is-${r}`, "aria-hidden": "true" });
    o.innerHTML = me[r] || me.file, n.append(o);
  }
  return n.addEventListener("click", (r) => {
    if (r.stopPropagation(), z(s)) {
      const o = e.filter(z);
      Bt(o.length ? o : [s], s);
    } else if (t) {
      const o = document.createElement("a");
      o.href = s.url, o.download = s.filename, document.body.appendChild(o), o.click(), o.remove();
    } else
      window.open(s.url, "_blank", "noopener,noreferrer");
  }), n;
}
let Z = null;
function Bt(s, i) {
  we();
  const e = s.filter(z);
  if (e.length === 0) return;
  let t = Math.max(0, e.findIndex((h) => h.id === i?.id));
  t < 0 && (t = 0);
  const n = f("div", { class: "sg-image-zoom sg-attach-lightbox", role: "dialog", "aria-modal": "true" }), r = f("div", { class: "sg-attach-lightbox-stage" }), o = f("img", { class: "sg-image-zoom-img", alt: "" }), a = f("div", { class: "sg-attach-lightbox-caption" }), l = f("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-prev",
    "aria-label": "Previous attachment"
  }), d = f("button", {
    type: "button",
    class: "sg-attach-lightbox-nav is-next",
    "aria-label": "Next attachment"
  });
  l.innerHTML = Cs, d.innerHTML = xs;
  function c() {
    const h = e[t];
    o.src = h.preview_url || h.url, o.alt = h.filename, a.textContent = `${h.filename}${h.byte_size != null ? " · " + te(h.byte_size) : ""} (${t + 1}/${e.length})`, l.style.visibility = e.length > 1 ? "visible" : "hidden", d.style.visibility = e.length > 1 ? "visible" : "hidden";
  }
  function u(h) {
    t = (t + h + e.length) % e.length, c();
  }
  function p(h) {
    h.key === "Escape" ? we() : h.key === "ArrowLeft" ? u(-1) : h.key === "ArrowRight" && u(1);
  }
  n.addEventListener("click", (h) => {
    (h.target === n || h.target === r) && we();
  }), l.addEventListener("click", (h) => {
    h.stopPropagation(), u(-1);
  }), d.addEventListener("click", (h) => {
    h.stopPropagation(), u(1);
  }), document.addEventListener("keydown", p), r.append(l, o, d), n.append(r, a), document.body.appendChild(n), Z = { overlay: n, onKey: p }, c();
}
function we() {
  Z && (document.removeEventListener("keydown", Z.onKey), Z.overlay.remove(), Z = null);
}
let ue = null;
function Ms(s, i, { onUpload: e }) {
  s._sgAttachDropBound || (s._sgAttachDropBound = !0, s.addEventListener("dragover", (t) => {
    t.dataTransfer?.types?.includes("Files") && (t.preventDefault(), s.classList.add("is-drop-target"));
  }), s.addEventListener("dragleave", () => s.classList.remove("is-drop-target")), s.addEventListener("drop", async (t) => {
    if (!t.dataTransfer?.files?.length) return;
    t.preventDefault(), s.classList.remove("is-drop-target");
    const n = Array.from(t.dataTransfer.files);
    await pe(s, i, n, e);
  }));
}
function Ke(s, i, e) {
  oe();
  const { thumbSize: t, accept: n, multiple: r, onUpload: o, onRemove: a } = e, l = s._sgAttachments || ye(i.value), d = f("div", { class: "sg-attach-editor", role: "dialog", "aria-modal": "false" });
  d.addEventListener("mousedown", (b) => b.stopPropagation());
  const c = f("div", { class: "sg-attach-editor-header" }, [
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
      return b.innerHTML = ke, b.addEventListener("click", oe), b;
    })()
  ]), u = f("div", { class: "sg-attach-editor-grid" });
  function p() {
    const b = s._sgAttachments || [];
    u.replaceChildren(), b.forEach((v) => u.append(Es(v, s, i, a, t))), c.firstChild.textContent = b.length === 1 ? "1 attachment" : `${b.length} attachments`;
  }
  p(), s._sgAttachRepaint = p;
  const h = f("label", { class: "sg-attach-dropzone", tabindex: "0" });
  h.innerHTML = `
    <span class="sg-attach-dropzone-icon" aria-hidden="true">${It}</span>
    <span class="sg-attach-dropzone-text">Drop files, paste, or <strong>browse</strong></span>
  `;
  const g = f("input", { type: "file", multiple: r ? "" : null, accept: n || null });
  g.style.display = "none", h.append(g), g.addEventListener("change", async () => {
    g.files?.length && (await pe(s, i, Array.from(g.files), o), g.value = "", p());
  }), h.addEventListener("dragover", (b) => {
    b.dataTransfer?.types?.includes("Files") && (b.preventDefault(), h.classList.add("is-drop-target"));
  }), h.addEventListener("dragleave", () => h.classList.remove("is-drop-target")), h.addEventListener("drop", async (b) => {
    b.dataTransfer?.files?.length && (b.preventDefault(), h.classList.remove("is-drop-target"), await pe(s, i, Array.from(b.dataTransfer.files), o), p());
  });
  function _(b) {
    const v = Array.from(b.clipboardData?.files || []);
    v.length !== 0 && (b.preventDefault(), pe(s, i, v, o).then(p));
  }
  d.addEventListener("paste", _);
  function y(b) {
    b.key === "Escape" && oe();
  }
  function S(b) {
    !d.contains(b.target) && !s.contains(b.target) && oe();
  }
  document.addEventListener("keydown", y), setTimeout(() => document.addEventListener("mousedown", S), 0), d.append(c, u, h), document.body.appendChild(d), Ne(d, s), h.focus(), ue = { pop: d, onKey: y, onDocClick: S, anchor: s };
}
function oe() {
  if (!ue) return;
  const { pop: s, onKey: i, onDocClick: e, anchor: t } = ue;
  document.removeEventListener("keydown", i), document.removeEventListener("mousedown", e), s.remove(), t && delete t._sgAttachRepaint, ue = null;
}
function Es(s, i, e, t, n) {
  const r = f("div", { class: "sg-attach-editor-tile", "data-attachment-id": s.id }), o = f("div", {
    class: "sg-attach-editor-preview",
    style: `width: ${n * 2}px; height: ${n * 2}px;`
  });
  if (z(s) && s.thumb_url)
    o.append(f("img", {
      src: s.thumb_url,
      alt: s.filename,
      width: String(n * 2),
      height: String(n * 2)
    }));
  else {
    const d = Ft(s), c = f("span", { class: `sg-attach-icon is-${d}`, "aria-hidden": "true" });
    c.innerHTML = me[d] || me.file, o.append(c);
  }
  const a = f("div", { class: "sg-attach-editor-meta" }, [
    f(
      "div",
      { class: "sg-attach-editor-name", title: s.filename },
      document.createTextNode(s.filename)
    ),
    f(
      "div",
      { class: "sg-attach-editor-size" },
      document.createTextNode(s.byte_size != null ? te(s.byte_size) : "")
    )
  ]), l = f("button", {
    type: "button",
    class: "sg-attach-editor-remove",
    title: "Remove",
    "aria-label": `Remove ${s.filename}`,
    "data-sg-attach": "remove",
    "data-attachment-id": s.id
  });
  return l.innerHTML = ke, l.addEventListener("click", async (d) => {
    d.stopPropagation(), await Rs(i, e, s, t);
  }), r.append(o, a, l), r;
}
function Ne(s, i) {
  const e = i.getBoundingClientRect();
  s.style.position = "fixed", s.style.left = `${Math.max(8, Math.min(window.innerWidth - 360, e.left))}px`, window.innerHeight - e.bottom > 280 ? s.style.top = `${e.bottom + 4}px` : s.style.top = `${Math.max(8, e.top - s.offsetHeight - 4)}px`;
}
async function pe(s, i, e, t) {
  if (e.length) {
    s.classList.add("is-uploading");
    try {
      let n;
      if (typeof t == "function") {
        const r = await t(e, i);
        n = Array.isArray(r) ? r : (s._sgAttachments || []).concat(Ue(e));
      } else
        n = (s._sgAttachments || []).concat(Ue(e));
      Ht(s, i, ye(n));
    } finally {
      s.classList.remove("is-uploading");
    }
  }
}
async function Rs(s, i, e, t) {
  let n;
  if (typeof t == "function") {
    const r = await t(e, i);
    n = Array.isArray(r) ? r : (s._sgAttachments || []).filter((o) => o.id !== e.id);
  } else
    n = (s._sgAttachments || []).filter((r) => r.id !== e.id);
  Ht(s, i, ye(n));
}
function Ue(s) {
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
function Ht(s, i, e) {
  const { row: t, col: n, api: r } = i;
  t && n?.field != null && (t[n.field] = e), s._sgAttachments = e, r?.applyTransaction ? r.applyTransaction({ update: [t] }) : r?.refreshCells && r.refreshCells({ rowIds: [t?.id ?? t?._sg_id] }), s._sgAttachRepaint && s._sgAttachRepaint();
}
const Ds = ["NSW", "VIC", "QLD", "WA", "SA", "TAS", "ACT", "NT"], Gt = {
  NSW: "New South Wales",
  VIC: "Victoria",
  QLD: "Queensland",
  WA: "Western Australia",
  SA: "South Australia",
  TAS: "Tasmania",
  ACT: "Australian Capital Territory",
  NT: "Northern Territory"
};
function Ts(s) {
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
function ks(s) {
  if (!s || s._raw) return s?._raw || "";
  const i = [s.address1, s.address2, s.address3].filter(Boolean), e = [s.suburb, s.state, s.postcode].filter(Boolean).join(" ");
  return e && i.push(e), s.country && s.country.toLowerCase() !== "australia" && i.push(s.country), i.join(`
`);
}
function Ot({ editable: s = !0, empty: i = "" } = {}) {
  return (e) => {
    const { value: t, td: n } = e, r = Ts(t);
    if (n && (n.classList.add("sg-renderer-address-au-cell"), n._sgAddress = r), !r) return i ? document.createTextNode(i) : "";
    s && n && !n._sgAddressEditBound && (n._sgAddressEditBound = !0, n.addEventListener("dblclick", (d) => {
      d._sgAddressHandled || (d._sgAddressHandled = !0, d.stopPropagation(), Ns(n, e));
    }));
    const o = f("div", {
      class: "sg-renderer-address-au",
      title: ks(r)
    });
    if (r._raw)
      return o.append(document.createTextNode(r._raw)), o;
    const a = [r.address1, r.address2].filter(Boolean).join(", "), l = r.suburb || r.state || r.postcode;
    return a && o.append(f("span", { class: "sg-address-au-street" }, document.createTextNode(a))), a && l && o.append(f("span", { class: "sg-address-au-sep" }, document.createTextNode(", "))), r.suburb && o.append(document.createTextNode(r.suburb)), r.state && (r.suburb && o.append(document.createTextNode(" ")), o.append(f("span", {
      class: `sg-address-au-state is-${r.state.toLowerCase()}`,
      title: Gt[r.state] || r.state
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
let he = null;
function Ns(s, i) {
  Q();
  const e = s._sgAddress && !s._sgAddress._raw ? { ...s._sgAddress } : { address1: "", address2: "", address3: "", suburb: "", state: "", postcode: "", country: "Australia" };
  e.country || (e.country = "Australia");
  const t = f("div", { class: "sg-address-au-editor", role: "dialog", "aria-modal": "false" });
  t.addEventListener("mousedown", (R) => R.stopPropagation());
  const n = f("div", { class: "sg-address-au-editor-header" });
  n.append(
    f("span", { class: "sg-address-au-editor-title" }, document.createTextNode("Edit address"))
  );
  const r = f("form", { class: "sg-address-au-editor-form", novalidate: "novalidate" });
  function o({ label: R, name: $, type: F = "text", value: K = "", maxlength: U, inputmode: ne, placeholder: se, autocomplete: ie }) {
    const W = f("label", { class: "sg-address-au-editor-field", "data-field": $ });
    W.append(f("span", { class: "sg-address-au-editor-label" }, document.createTextNode(R)));
    const Y = f("input", {
      type: F,
      name: $,
      value: K || "",
      maxlength: U || null,
      inputmode: ne || null,
      placeholder: se || null,
      autocomplete: ie || null,
      class: "sg-address-au-editor-input"
    });
    return W.append(Y), { wrap: W, input: Y };
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
  function p() {
    const R = !!(l.input.value.trim() || c.input.value.trim());
    d.hidden = !R, u.hidden = R;
  }
  l.input.addEventListener("input", p), u.addEventListener("click", () => {
    d.hidden = !1, u.hidden = !0, c.input.focus();
  });
  const h = o({
    label: "Suburb",
    name: "suburb",
    value: e.suburb,
    placeholder: "Bondi",
    autocomplete: "address-level2"
  }), g = f("label", { class: "sg-address-au-editor-field", "data-field": "state" });
  g.append(f("span", { class: "sg-address-au-editor-label" }, document.createTextNode("State")));
  const _ = f("select", {
    name: "state",
    class: "sg-address-au-editor-input sg-address-au-editor-state",
    autocomplete: "address-level1"
  });
  _.append(f("option", { value: "" }, document.createTextNode("—")));
  for (const R of Ds) {
    const $ = f(
      "option",
      { value: R, selected: e.state === R ? "" : null },
      document.createTextNode(`${R} — ${Gt[R]}`)
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
  const S = o({
    label: "Country",
    name: "country",
    value: e.country,
    autocomplete: "country-name"
  }), b = f("div", { class: "sg-address-au-editor-grid" });
  b.append(a.wrap), b.append(l.wrap, u), b.append(d), b.append(h.wrap, g, y.wrap), b.append(S.wrap);
  const v = f("div", { class: "sg-address-au-editor-footer" }), w = f(
    "button",
    { type: "button", class: "sg-address-au-editor-cancel" },
    document.createTextNode("Cancel")
  ), x = f(
    "button",
    { type: "submit", class: "sg-address-au-editor-save" },
    document.createTextNode("Save")
  );
  v.append(w, x), r.append(b, v), t.append(n, r);
  function L() {
    return {
      address1: a.input.value.trim(),
      address2: l.input.value.trim(),
      address3: d.hidden ? "" : c.input.value.trim(),
      suburb: h.input.value.trim(),
      state: _.value,
      postcode: y.input.value.trim(),
      country: S.input.value.trim() || "Australia"
    };
  }
  function D() {
    const R = L(), $ = !R.address1 && !R.suburb && !R.state && !R.postcode;
    $s(s, i, $ ? null : R), Q();
  }
  r.addEventListener("submit", (R) => {
    R.preventDefault(), D();
  }), w.addEventListener("click", () => Q());
  function C(R) {
    R.key === "Escape" && (R.stopPropagation(), Q());
  }
  function E(R) {
    !t.contains(R.target) && !s.contains(R.target) && Q();
  }
  document.addEventListener("keydown", C), setTimeout(() => document.addEventListener("mousedown", E), 0), document.body.appendChild(t), Ne(t, s), p(), a.input.focus(), a.input.select(), he = { pop: t, onKey: C, onDocClick: E };
}
function Q() {
  if (!he) return;
  const { pop: s, onKey: i, onDocClick: e } = he;
  document.removeEventListener("keydown", i), document.removeEventListener("mousedown", e), s.remove(), he = null;
}
function $s(s, i, e) {
  const { row: t, col: n, api: r } = i, o = t && n?.field != null ? t[n.field] : null;
  t && n?.field != null && (t[n.field] = e), s._sgAddress = e, r?.applyTransaction ? r.applyTransaction({ update: [t] }) : r?.refreshCells && r.refreshCells({ rowIds: [t?.id ?? t?._sg_id] });
  const a = s.closest('[data-controller~="grid"]');
  a && a.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
    bubbles: !0,
    detail: { rowId: t?.id ?? t?._sg_id, colId: n?.field, oldValue: o, newValue: e }
  }));
}
function zt({ color: s = "green", showValue: i = !1 } = {}) {
  return ({ value: e }) => {
    let t = Number(e);
    Number.isFinite(t) || (t = 0), t = Math.max(0, Math.min(100, t));
    const n = f("div", { class: "sg-renderer-progress" }, [
      f("div", { class: `sg-renderer-progress-fill sg-fill-${s}`, style: `width: ${t}%;` })
    ]);
    return i ? f("div", { class: "sg-renderer-progress-wrap" }, [
      n,
      f("span", { class: "sg-renderer-progress-label" }, document.createTextNode(`${Math.round(t)}%`))
    ]) : n;
  };
}
const J = '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>';
function jt({ max: s = 5, precision: i = 0.5 } = {}) {
  const e = i > 0 ? 1 / i : 2;
  return ({ value: t }) => {
    let n = parseFloat(t);
    Number.isFinite(n) || (n = 0), n = Math.max(0, Math.min(s, n)), n = Math.round(n * e) / e;
    const r = f("div", {
      class: "sg-renderer-stars",
      role: "img",
      "aria-label": `${n} out of ${s} stars`
    });
    for (let o = 1; o <= s; o++)
      if (n >= o)
        r.append(f("span", { class: "sg-renderer-star is-full", "aria-hidden": "true" }, J));
      else if (n > o - 1) {
        const a = Math.round((n - (o - 1)) * 100);
        r.append(f(
          "span",
          { class: "sg-renderer-star is-partial", "aria-hidden": "true" },
          `${J}<span class="sg-star-clip" style="width: ${a}%;">${J}</span>`
        ));
      } else
        r.append(f("span", { class: "sg-renderer-star is-empty", "aria-hidden": "true" }, J));
    return r;
  };
}
function qt({ separator: s = "," } = {}) {
  return ({ value: i }) => {
    if (k(i)) return "";
    const e = Array.isArray(i) ? i : String(i).split(s), t = f("div", { class: "sg-renderer-tags" });
    for (const n of e) {
      const r = String(n).trim();
      r && t.append(f("span", { class: "sg-renderer-tag" }, document.createTextNode(r)));
    }
    return t;
  };
}
function Kt({ showCode: s = !0, fallback: i = null } = {}) {
  return ({ value: e }) => {
    if (k(e)) return "";
    const t = String(e).trim().toUpperCase();
    if (t.length !== 2 || !/^[A-Z]{2}$/.test(t))
      return i ?? document.createTextNode(String(e));
    const n = String.fromCodePoint(
      127462 + t.charCodeAt(0) - 65,
      127462 + t.charCodeAt(1) - 65
    ), r = f("span", { class: "sg-renderer-country" });
    return r.append(f("span", { class: "sg-renderer-flag", "aria-hidden": "true" }, document.createTextNode(n))), s && r.append(f("span", { class: "sg-renderer-country-code" }, document.createTextNode(t))), r;
  };
}
function Vs(s) {
  const i = String(s).replace(/\s+/g, "");
  if (i.length !== 11 || !/^\d{11}$/.test(i)) return !1;
  const e = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19], t = parseInt(i[0], 10) - 1 + i.slice(1);
  let n = 0;
  for (let r = 0; r < 11; r++) n += parseInt(t[r], 10) * e[r];
  return n % 89 === 0;
}
function Is(s) {
  const i = String(s).replace(/\D/g, "");
  return i.length !== 11 ? String(s) : `${i.slice(0, 2)} ${i.slice(2, 5)} ${i.slice(5, 8)} ${i.slice(8)}`;
}
function Ut() {
  return ({ value: s }) => {
    if (k(s)) return "";
    if (!Vs(s))
      return f("span", { class: "sg-renderer-invalid", title: "Invalid ABN" }, document.createTextNode(String(s)));
    const i = String(s).replace(/\s+/g, "");
    return f("a", {
      class: "sg-renderer-link sg-renderer-mono",
      href: `https://abr.business.gov.au/ABN/View?id=${i}`,
      target: "_blank",
      rel: "noopener noreferrer",
      title: "Look up on ABR"
    }, document.createTextNode(Is(s)));
  };
}
function Wt({
  lookup: s = null,
  nameField: i = null,
  avatarField: e = null,
  windowKey: t = "__sgUsers",
  size: n = 22
} = {}) {
  return ({ value: r, row: o }) => {
    if (k(r)) return "";
    let a = null;
    if (typeof s == "function" && (a = s(r, o) || null), !a && i && (a = { name: o?.[i], avatarUrl: e ? o?.[e] : null }), !a && typeof window < "u" && window[t]) {
      const c = window[t];
      c instanceof Map ? a = c.get(r) || c.get(String(r)) || null : Array.isArray(c) && (a = c.find((u) => `${u.id}` == `${r}`) || null);
    }
    const l = a?.name ?? String(r), d = f("span", { class: "sg-renderer-avatar" });
    if (a?.avatarUrl)
      d.append(f("img", {
        class: "sg-renderer-avatar-img",
        src: a.avatarUrl,
        width: String(n),
        height: String(n),
        alt: ""
      }));
    else {
      const c = String(l).split(/\s+/).filter(Boolean).slice(0, 2).map((u) => u[0]?.toUpperCase() || "").join("");
      d.append(f("span", {
        class: "sg-renderer-avatar-initials",
        style: `width: ${n}px; height: ${n}px;`
      }, document.createTextNode(c)));
    }
    return d.append(f("span", { class: "sg-renderer-avatar-name" }, document.createTextNode(l))), d;
  };
}
const Fs = {
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
function Ps(s) {
  return String(s).toLowerCase().split(/[\s_-]+/).map((i) => i && i[0].toUpperCase() + i.slice(1)).join(" ");
}
function Bs(s = {}, i = null, e = {}) {
  const { titleCase: t = !0, defaultColor: n = "gray" } = e, r = {};
  for (const [a, l] of Object.entries(s)) r[String(a).toLowerCase()] = l;
  const o = {};
  if (i) for (const [a, l] of Object.entries(i)) o[String(a).toLowerCase()] = l;
  return ({ value: a }) => {
    if (k(a)) return "";
    const l = String(a).toLowerCase(), d = r[l] || n, c = t ? Ps(a) : String(a), u = f("span", { class: `sg-pill sg-pill-${d}` });
    if (i) {
      const p = o[l], h = p ? Fs[p] || p : null;
      if (h) {
        const g = f("span", { class: "sg-pill-icon", "aria-hidden": "true" });
        g.innerHTML = h, u.append(g);
      }
    }
    return u.append(f("span", { class: "sg-pill-label" }, document.createTextNode(c))), u;
  };
}
function Xt({
  truthy: s = De,
  disabled: i = !1
} = {}) {
  return (e) => {
    const { value: t, row: n, col: r, api: o, td: a } = e;
    a && a.classList.add("sg-renderer-checkbox-cell");
    const l = f("span", { class: "sg-renderer-checkbox" }), d = f("input", {
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
      const u = d.checked, p = n && r?.field != null ? n[r.field] : null;
      n && r?.field != null && (n[r.field] = u), o?.applyTransaction && o.applyTransaction({ update: [n] });
      const h = a?.closest('[data-controller~="grid"]');
      h && h.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: n?.id ?? n?._sg_id, colId: r?.field, oldValue: p, newValue: u }
      }));
    }), l.append(d), l;
  };
}
const Hs = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z"/></svg>', Ce = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>', Gs = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>', Os = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/></svg>', zs = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/></svg>', js = ke;
function Yt(s) {
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
function ee(s) {
  (!Number.isFinite(s) || s < 0) && (s = 0);
  const i = Math.floor(s), e = Math.floor(i / 3600), t = Math.floor(i % 3600 / 60), n = i % 60, r = (o) => String(o).padStart(2, "0");
  return e > 0 ? `${e}:${r(t)}:${r(n)}` : `${t}:${r(n)}`;
}
function Qt({
  showFilename: s = !0,
  iconOnly: i = !1,
  empty: e = "",
  preferHowler: t = !0,
  skipSeconds: n = 10
} = {}) {
  return (r) => {
    const { value: o, td: a } = r, l = Yt(o);
    if (a && (a.classList.add("sg-renderer-audio-cell"), a._sgAudio = l, a._sgAudioOpts = { preferHowler: t, skipSeconds: n }), !l) return e ? document.createTextNode(e) : "";
    a && !a._sgAudioDblBound && (a._sgAudioDblBound = !0, a.addEventListener("dblclick", (u) => {
      u._sgAudioHandled || (u._sgAudioHandled = !0, u.stopPropagation(), u.preventDefault(), We(a, r));
    }));
    const d = f("div", { class: "sg-renderer-audio" }), c = f("button", {
      type: "button",
      class: "sg-audio-icon",
      title: `${l.filename}${l.byte_size != null ? " · " + te(l.byte_size) : ""} — double-click to play`,
      "aria-label": `Play ${l.filename}`,
      "data-sg-audio": "open"
    });
    if (c.innerHTML = Hs, c.addEventListener("click", (u) => {
      u.stopPropagation(), We(a, r);
    }), c.addEventListener("dblclick", (u) => {
      u._sgAudioHandled = !0, u.stopPropagation();
    }), d.append(c), s && !i) {
      const u = f(
        "span",
        { class: "sg-audio-name" },
        document.createTextNode(l.filename)
      );
      d.append(u), l.duration != null && d.append(f(
        "span",
        { class: "sg-audio-duration" },
        document.createTextNode(ee(l.duration))
      ));
    }
    return d;
  };
}
function qs(s, { preferHowler: i } = {}) {
  return i && typeof window < "u" && window.Howl ? new Us(s) : new Ks(s);
}
class Ks {
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
class Us {
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
function We(s, i) {
  ae();
  const e = s._sgAudio || Yt(i.value);
  if (!e) return;
  const t = s._sgAudioOpts || { preferHowler: !0, skipSeconds: 10 }, n = qs(e.url, t), r = f("div", { class: "sg-audio-player", role: "dialog", "aria-label": "Audio player" });
  r.addEventListener("mousedown", (T) => T.stopPropagation());
  const o = f("div", { class: "sg-audio-player-header" }), a = f(
    "div",
    { class: "sg-audio-player-name", title: e.filename },
    document.createTextNode(e.filename)
  ), l = f("div", { class: "sg-audio-player-meta" }), d = [];
  e.byte_size != null && d.push(te(e.byte_size)), n.backendName() === "howler" && d.push("howler.js"), l.textContent = d.join(" · ");
  const c = f("button", {
    type: "button",
    class: "sg-audio-player-close",
    "aria-label": "Close player"
  });
  c.innerHTML = js, c.addEventListener("click", ae), o.append(a, l, c);
  const u = f("div", {
    class: "sg-audio-track",
    role: "slider",
    "aria-label": "Seek",
    tabindex: "0",
    "aria-valuemin": "0",
    "aria-valuemax": "0",
    "aria-valuenow": "0"
  }), p = f("div", { class: "sg-audio-track-fill" }), h = f("div", { class: "sg-audio-track-thumb" });
  u.append(p, h);
  const g = f("div", { class: "sg-audio-times" }), _ = f("span", { class: "sg-audio-time-current" }, document.createTextNode("0:00")), y = f(
    "span",
    { class: "sg-audio-time-total" },
    document.createTextNode(e.duration ? ee(e.duration) : "--:--")
  );
  g.append(_, y);
  const S = f("div", { class: "sg-audio-transport" }), b = f("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Back ${t.skipSeconds}s`,
    "aria-label": `Back ${t.skipSeconds} seconds`
  });
  b.innerHTML = Os;
  const v = f("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-play",
    title: "Play / pause (Space)",
    "aria-label": "Play",
    "data-state": "paused"
  });
  v.innerHTML = Ce;
  const w = f("button", {
    type: "button",
    class: "sg-audio-btn sg-audio-skip",
    title: `Forward ${t.skipSeconds}s`,
    "aria-label": `Forward ${t.skipSeconds} seconds`
  });
  w.innerHTML = zs, S.append(b, v, w), r.append(o, u, g, S);
  let x = e.duration ?? 0, L = !1, D = null;
  function C(T) {
    const P = Math.max(0, Math.min(100, T));
    p.style.width = P + "%", h.style.left = P + "%";
  }
  function E() {
    const T = n.seek(), O = n.duration() || 0 || x || 0;
    if (O > 0 && O !== x && (x = O, y.textContent = ee(x), u.setAttribute("aria-valuemax", String(Math.floor(x)))), !L) {
      const H = x > 0 ? T / x * 100 : 0;
      C(H), _.textContent = ee(T), u.setAttribute("aria-valuenow", String(Math.floor(T)));
    }
  }
  function R() {
    E(), n.isPlaying() ? D = requestAnimationFrame(R) : D = null;
  }
  function $() {
    D == null && (D = requestAnimationFrame(R));
  }
  function F() {
    D != null && cancelAnimationFrame(D), D = null;
  }
  const K = () => {
    x = n.duration(), E();
  }, U = () => {
    v.dataset.state = "playing", v.innerHTML = Gs, v.setAttribute("aria-label", "Pause"), $();
  }, ne = () => {
    v.dataset.state = "paused", v.innerHTML = Ce, v.setAttribute("aria-label", "Play"), F(), E();
  }, se = () => {
    v.dataset.state = "paused", v.innerHTML = Ce, v.setAttribute("aria-label", "Play"), F(), n.seek(0), E();
  };
  n.on("load", K), n.on("play", U), n.on("pause", ne), n.on("end", se), v.addEventListener("click", (T) => {
    T.stopPropagation(), n.isPlaying() ? n.pause() : n.play();
  }), b.addEventListener("click", (T) => {
    T.stopPropagation(), n.seek(Math.max(0, n.seek() - t.skipSeconds)), E();
  }), w.addEventListener("click", (T) => {
    T.stopPropagation();
    const P = n.duration();
    n.seek(Math.min(P || 1 / 0, n.seek() + t.skipSeconds)), E();
  });
  function ie(T) {
    const P = u.getBoundingClientRect(), O = (T.clientX ?? 0) - P.left, H = Math.max(0, Math.min(1, O / P.width)), Fe = n.duration() || x;
    if (!Fe) return;
    const Pe = H * Fe;
    n.seek(Pe), C(H * 100), _.textContent = ee(Pe);
  }
  u.addEventListener("pointerdown", (T) => {
    T.preventDefault(), L = !0, u.setPointerCapture?.(T.pointerId), u.classList.add("is-dragging"), ie(T);
  }), u.addEventListener("pointermove", (T) => {
    L && ie(T);
  });
  const W = (T) => {
    if (L) {
      L = !1, u.classList.remove("is-dragging");
      try {
        u.releasePointerCapture?.(T.pointerId);
      } catch {
      }
    }
  };
  u.addEventListener("pointerup", W), u.addEventListener("pointercancel", W), u.addEventListener("keydown", (T) => {
    const P = n.duration() || x;
    if (!P) return;
    const O = T.shiftKey ? 30 : 5;
    let H = null;
    T.key === "ArrowLeft" ? H = Math.max(0, n.seek() - O) : T.key === "ArrowRight" ? H = Math.min(P, n.seek() + O) : T.key === "Home" ? H = 0 : T.key === "End" && (H = P), H != null && (T.preventDefault(), n.seek(H), E());
  });
  function Y(T) {
    T.key === "Escape" ? (T.preventDefault(), ae()) : (T.key === " " || T.code === "Space") && r.contains(document.activeElement) && (T.preventDefault(), n.isPlaying() ? n.pause() : n.play());
  }
  function Ie(T) {
    !r.contains(T.target) && !s.contains(T.target) && ae();
  }
  document.addEventListener("keydown", Y), setTimeout(() => document.addEventListener("mousedown", Ie), 0), document.body.appendChild(r), Ne(r, s), E(), v.focus(), fe = {
    pop: r,
    backend: n,
    onKey: Y,
    onDocClick: Ie,
    cleanup: () => {
      F();
      try {
        n.off("load", K), n.off("play", U), n.off("pause", ne), n.off("end", se);
      } catch {
      }
      n.destroy();
    }
  };
}
function ae() {
  if (!fe) return;
  const { pop: s, onKey: i, onDocClick: e, cleanup: t } = fe;
  document.removeEventListener("keydown", i), document.removeEventListener("mousedown", e), t(), s.remove(), fe = null;
}
function Zt({
  truthy: s = De,
  disabled: i = !1
} = {}) {
  return (e) => {
    const { value: t, row: n, col: r, api: o, td: a } = e;
    a && a.classList.add("sg-renderer-switch-cell");
    const l = t == null || t === "", d = !l && s(t), c = f("button", {
      type: "button",
      class: `sg-renderer-switch${d ? " is-on" : ""}${l ? " is-null" : ""}`,
      role: "switch",
      "aria-checked": l ? "mixed" : d ? "true" : "false",
      "aria-label": r?.field || "toggle",
      disabled: i ? "" : null
    });
    return c.append(f("span", { class: "sg-renderer-switch-thumb", "aria-hidden": "true" })), c.addEventListener("click", (u) => {
      if (u.stopPropagation(), i) return;
      const p = l ? !0 : !d, h = n && r?.field != null ? n[r.field] : null;
      n && r?.field != null && (n[r.field] = p), o?.applyTransaction && o.applyTransaction({ update: [n] });
      const g = a?.closest('[data-controller~="grid"]');
      g && g.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
        bubbles: !0,
        detail: { rowId: n?.id ?? n?._sg_id, colId: r?.field, oldValue: h, newValue: p }
      }));
    }), c;
  };
}
const Ws = /^(https?:\/\/|mailto:)/i;
function _e(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Me(s) {
  let i = s;
  return i = i.replace(/`([^`\n]+)`/g, (e, t) => `<code>${t}</code>`), i = i.replace(/\[([^\]\n]+)\]\(([^)\n]+)\)/g, (e, t, n) => Ws.test(n) ? `<a href="${n}" target="_blank" rel="noopener noreferrer">${t}</a>` : e), i = i.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>"), i = i.replace(/__([^_\n]+)__/g, "<strong>$1</strong>"), i = i.replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), i = i.replace(/(^|[\s(])_([^_\n]+?)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), i = i.replace(/~~([^~\n]+)~~/g, "<del>$1</del>"), i;
}
function Xs(s) {
  const i = s.split(`
`), e = [];
  let t = null, n = [];
  const r = () => {
    t && (e.push(`<${t}>${n.map((o) => `<li>${Me(o)}</li>`).join("")}</${t}>`), t = null, n = []);
  };
  for (const o of i) {
    const a = /^\s*[-*]\s+(.+)$/.exec(o), l = /^\s*\d+\.\s+(.+)$/.exec(o);
    a ? (t && t !== "ul" && r(), t = "ul", n.push(a[1])) : l ? (t && t !== "ol" && r(), t = "ol", n.push(l[1])) : (r(), o.trim() === "" ? e.push("") : e.push(Me(o)));
  }
  return r(), e.join("<br>").replace(/(<br>){2,}/g, "<br><br>");
}
function Jt({ inline: s = !1 } = {}) {
  return ({ value: i, td: e }) => {
    if (k(i)) return "";
    const t = _e(i), n = s ? Me(t) : Xs(t);
    if (e) {
      e.classList.add("sg-renderer-markdown-cell");
      const o = e.parentElement;
      o && o.tagName === "TR" && o.classList.add("sg-has-multiline");
    }
    const r = f("div", { class: `sg-renderer-markdown${s ? " is-inline" : ""}` });
    return r.innerHTML = n, r;
  };
}
function Ys(s) {
  return _e(s).replace(/(&quot;(?:[^&\\]|\\.)*?&quot;)\s*:/g, '<span class="sg-json-key">$1</span>:').replace(/:\s*(&quot;(?:[^&\\]|\\.)*?&quot;)/g, ': <span class="sg-json-string">$1</span>').replace(/(?<=[\s:,\[])(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)(?=[\s,\]\}\n])/g, '<span class="sg-json-number">$1</span>').replace(/(?<=[\s:,\[])(true|false)(?=[\s,\]\}\n])/g, '<span class="sg-json-bool">$1</span>').replace(/(?<=[\s:,\[])(null)(?=[\s,\]\}\n])/g, '<span class="sg-json-null">$1</span>');
}
function Qs(s, i) {
  const e = Array.isArray(s), t = e ? s : Object.entries(s), n = t.slice(0, i), r = t.length - n.length, o = (d) => {
    if (d == null) return "null";
    const c = typeof d;
    return c === "string" ? d.length > 18 ? `"${d.slice(0, 15)}…"` : `"${d}"` : c === "number" || c === "boolean" ? String(d) : Array.isArray(d) ? `[${d.length}]` : c === "object" ? "{…}" : String(d);
  }, a = e ? n.map(o).join(", ") : n.map(([d, c]) => `${d}: ${o(c)}`).join(", "), l = r > 0 ? `, +${r}` : "";
  return e ? `[${a}${l}]` : `{ ${a}${l} }`;
}
function en({ maxKeys: s = 3, indent: i = 2 } = {}) {
  return ({ value: e, td: t }) => {
    if (e == null || e === "") return "";
    let n = e;
    if (typeof e == "string")
      try {
        n = JSON.parse(e);
      } catch {
        return String(e);
      }
    if (n == null)
      return f("span", { class: "sg-renderer-json-scalar sg-json-null" }, document.createTextNode("null"));
    if (typeof n != "object") {
      const d = typeof n, c = d === "string" ? "sg-json-string" : d === "number" ? "sg-json-number" : "sg-json-bool", u = d === "string" ? `"${n}"` : String(n);
      return f("span", { class: `sg-renderer-json-scalar ${c}` }, document.createTextNode(u));
    }
    const r = document.createElement("details");
    r.className = "sg-renderer-json";
    const o = document.createElement("summary");
    o.className = "sg-renderer-json-summary";
    const a = f("span", { class: "sg-renderer-json-chevron", "aria-hidden": "true" });
    a.innerHTML = is, o.append(a), o.append(f(
      "span",
      { class: "sg-renderer-json-summary-text" },
      document.createTextNode(Qs(n, s))
    ));
    const l = document.createElement("pre");
    if (l.className = "sg-renderer-json-pre", l.innerHTML = Ys(JSON.stringify(n, null, i)), r.append(o, l), o.addEventListener("click", (d) => d.stopPropagation()), t) {
      t.classList.add("sg-renderer-json-cell");
      const d = t.parentElement;
      d && d.tagName === "TR" && d.classList.add("sg-has-multiline");
    }
    return r;
  };
}
function tn({
  lookup: s = null,
  windowKey: i = "__sgLinks",
  showThumb: e = !0,
  href: t = null,
  multiple: n = !1,
  fallback: r = (o) => String(o)
} = {}) {
  return ({ value: o, row: a }) => {
    if (k(o)) return "";
    const l = n ? Array.isArray(o) ? o : String(o).split(",").map((c) => c.trim()).filter(Boolean) : [o], d = f("span", { class: "sg-renderer-linked-records" });
    for (const c of l) {
      const u = Zs(c, a, s, i);
      d.append(Js(c, a, u, { showThumb: e, href: t, fallback: r }));
    }
    return d;
  };
}
function Zs(s, i, e, t) {
  if (typeof e == "function") return e(s, i) || null;
  if (typeof window > "u") return null;
  const n = window[t];
  return n ? n instanceof Map ? n.get(s) || n.get(String(s)) || null : typeof n == "object" ? n[s] ?? n[String(s)] ?? null : null : null;
}
function Js(s, i, e, { showThumb: t, href: n, fallback: r }) {
  const o = e?.name ?? r(s), a = typeof n == "function" ? n(s, i, e) : e?.href || null, l = document.createElement(a ? "a" : "span");
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
function nn({
  separator: s = ",",
  colorMap: i = {},
  defaultColor: e = "gray"
} = {}) {
  const t = {};
  for (const [n, r] of Object.entries(i)) t[String(n).toLowerCase()] = r;
  return ({ value: n }) => {
    if (k(n)) return "";
    const r = Array.isArray(n) ? n : String(n).split(s), o = f("div", { class: "sg-renderer-coloured-tags" });
    for (const a of r) {
      const l = String(a).trim();
      if (!l) continue;
      const d = t[l.toLowerCase()] || e, c = f(
        "span",
        { class: "sg-renderer-coloured-tag" },
        document.createTextNode(l)
      );
      /^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/.test(d) ? c.classList.add(`sg-pill-${d}`) : (c.style.background = d, c.style.color = ei(d)), o.append(c);
    }
    return o;
  };
}
function ei(s) {
  const i = Dt(s);
  return i ? Tt(i) ? "#1f2937" : "#ffffff" : "inherit";
}
function ti(s) {
  if (s == null || s === "") return null;
  if (s instanceof Date)
    return Number.isNaN(s.valueOf()) ? null : { h: s.getHours(), m: s.getMinutes(), s: s.getSeconds() };
  if (typeof s == "number" && Number.isFinite(s)) {
    const n = (s % 86400 + 86400) % 86400;
    return { h: Math.floor(n / 3600), m: Math.floor(n % 3600 / 60), s: Math.floor(n % 60) };
  }
  const i = String(s).trim(), e = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/.exec(i);
  if (e)
    return { h: parseInt(e[1], 10), m: parseInt(e[2], 10), s: e[3] ? parseInt(e[3], 10) : 0 };
  const t = new Date(i);
  return Number.isNaN(t.valueOf()) ? null : { h: t.getHours(), m: t.getMinutes(), s: t.getSeconds() };
}
function sn({
  style: s = "24h",
  // '24h' | '12h'
  seconds: i = !1,
  locale: e = void 0
} = {}) {
  return ({ value: t }) => {
    const n = ti(t);
    if (!n) return "";
    if (s === "12h") {
      const a = /* @__PURE__ */ new Date(0);
      return a.setHours(n.h, n.m, n.s), new Intl.DateTimeFormat(e, {
        hour: "numeric",
        minute: "2-digit",
        ...i ? { second: "2-digit" } : {},
        hour12: !0
      }).format(a);
    }
    const r = (a) => String(a).padStart(2, "0"), o = i ? `:${r(n.s)}` : "";
    return `${r(n.h)}:${r(n.m)}${o}`;
  };
}
function ni(s) {
  if (Array.isArray(s)) return { from: s[0], to: s[1] };
  if (s && typeof s == "object")
    return {
      from: s.from ?? s.old ?? s.before ?? s.previous ?? null,
      to: s.to ?? s.new ?? s.after ?? s.current ?? null
    };
  const i = String(s), e = /^(.*?)\s*(?:→|->|=>|—>)\s*(.+)$/.exec(i);
  return e ? { from: e[1].trim(), to: e[2].trim() } : { from: null, to: i };
}
function rn({
  style: s = "inline",
  // 'inline' | 'stacked'
  arrow: i = "→",
  showArrow: e = !0
} = {}) {
  return ({ value: t }) => {
    if (k(t)) return "";
    const { from: n, to: r } = ni(t), o = (l) => l == null || l === "";
    if (o(n) && o(r)) return "";
    if (o(n))
      return f(
        "span",
        { class: "sg-renderer-diff is-added" },
        f("span", { class: "sg-diff-to" }, document.createTextNode(String(r)))
      );
    if (o(r))
      return f(
        "span",
        { class: "sg-renderer-diff is-removed" },
        f("span", { class: "sg-diff-from" }, document.createTextNode(String(n)))
      );
    const a = f("span", { class: `sg-renderer-diff is-${s}` });
    return a.append(f("span", { class: "sg-diff-from" }, document.createTextNode(String(n)))), e && a.append(f(
      "span",
      { class: "sg-diff-arrow", "aria-hidden": "true" },
      document.createTextNode(i)
    )), a.append(f("span", { class: "sg-diff-to" }, document.createTextNode(String(r)))), a;
  };
}
function si(s) {
  if (s == null || s === "") return null;
  if (Array.isArray(s)) {
    const n = Number(s[0]), r = Number(s[1]);
    return Number.isFinite(n) && Number.isFinite(r) ? { lat: n, lng: r } : null;
  }
  if (typeof s == "object") {
    const n = Number(s.lat ?? s.latitude), r = Number(s.lng ?? s.long ?? s.lon ?? s.longitude);
    return Number.isFinite(n) && Number.isFinite(r) ? { lat: n, lng: r } : null;
  }
  const i = String(s).split(",");
  if (i.length !== 2) return null;
  const e = Number(i[0].trim()), t = Number(i[1].trim());
  return Number.isFinite(e) && Number.isFinite(t) ? { lat: e, lng: t } : null;
}
function Xe(s, i) {
  const e = s >= 0 ? 1 : -1, t = Math.abs(s), n = Math.floor(t), r = (t - n) * 60, o = Math.floor(r), a = (r - o) * 60, l = i ? e > 0 ? "N" : "S" : e > 0 ? "E" : "W";
  return `${n}°${String(o).padStart(2, "0")}'${a.toFixed(1)}"${l}`;
}
function on({
  decimals: s = 4,
  style: i = "decimal",
  // 'decimal' | 'dms'
  mapUrl: e = (o, a) => `https://www.google.com/maps?q=${o},${a}`,
  linkText: t = "View on Maps",
  staticMap: n = null,
  // (lat, lng) => url
  staticSize: r = 72
} = {}) {
  return ({ value: o }) => {
    const a = si(o);
    if (!a) return "";
    const l = f("span", { class: "sg-renderer-geo" });
    if (typeof n == "function") {
      const u = n(a.lat, a.lng);
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
    const d = i === "dms" ? `${Xe(a.lat, !0)} ${Xe(a.lng, !1)}` : `${a.lat.toFixed(s)}, ${a.lng.toFixed(s)}`;
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
      u.addEventListener("click", (p) => p.stopPropagation()), l.append(u);
    }
    return l;
  };
}
function an({
  moduleSize: s = 3,
  margin: i = 2,
  background: e = "#fff",
  foreground: t = "#111827",
  showText: n = !1
} = {}) {
  return ({ value: r }) => {
    if (k(r)) return "";
    const o = String(r);
    let a;
    try {
      const d = Xn(o);
      a = ss(d, { moduleSize: s, margin: i, background: e, foreground: t });
    } catch {
      return f(
        "span",
        { class: "sg-renderer-qr-overflow", title: o },
        document.createTextNode("QR · too long")
      );
    }
    const l = f("span", { class: "sg-renderer-qr" });
    return l.innerHTML = a, n && l.append(f("span", { class: "sg-renderer-qr-text" }, document.createTextNode(o))), l;
  };
}
function ln({
  language: s = null,
  copy: i = !0
} = {}) {
  return ({ value: e, td: t }) => {
    if (k(e)) return "";
    const n = String(e);
    if (t) {
      t.classList.add("sg-renderer-code-cell");
      const a = t.parentElement;
      a && a.tagName === "TR" && a.classList.add("sg-has-multiline");
    }
    const r = f("div", { class: "sg-renderer-code" });
    if (s && r.append(f(
      "span",
      { class: "sg-renderer-code-lang" },
      document.createTextNode(String(s))
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
          navigator.clipboard?.writeText ? await navigator.clipboard.writeText(n) : At(n), a.innerHTML = St, a.classList.add("is-copied"), setTimeout(() => {
            a.innerHTML = ge, a.classList.remove("is-copied");
          }, 1200);
        } catch {
        }
      }), r.append(a);
    }
    const o = f("pre", { class: "sg-renderer-code-pre" });
    return o.textContent = n, r.append(o), r;
  };
}
const ii = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M225.8 468.2L46.9 295.4C18.9 268.2 0 230.1 0 187.8C0 117.4 56.1 60 125.7 60c25.3 0 51 9.2 70.3 25.4L256 138l60-52.6C335.3 69.2 361 60 386.3 60C455.9 60 512 117.4 512 187.8c0 42.3-18.9 80.4-46.9 107.6L286.2 468.2c-7.2 7.4-17.1 11.8-27.6 11.8c-10.5 0-20.4-4.4-27.6-11.8z"/></svg>', ri = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75.1c16.3-13.2 28.9-30.4 36.6-50l8.1-20.3c5-12.4 11.3-24.2 19-35.2l4.4-6.3 0 0c1.4-2 1.1-4.7-.6-6.4l0 0c-3.8-3.8-9.9-3.8-13.7 0L208.8 84.9c-3 3-7 4.7-11.3 4.7c-8.8 0-16-7.2-16-16V63.4c0-8.8 7.2-16 16-16h.5c8.8 0 16 7.2 16 16v6.2c34-2.4 71-13 100-25.6c11-4.8 22.1-9.3 33-13.6l1-.4c12-4.6 27.3-9.3 41.4-9.3z"/></svg>', oi = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75.1c16.3 13.2 28.9 30.4 36.6 50l8.1 20.3c5 12.4 11.3 24.2 19 35.2l4.4 6.3c1.4 2 1.1 4.7-.6 6.4c-3.8 3.8-9.9 3.8-13.7 0L208.8 427.1c-3-3-7-4.7-11.3-4.7c-8.8 0-16 7.2-16 16v10.2c0 8.8 7.2 16 16 16h.5c8.8 0 16-7.2 16-16v-6.2c34 2.4 71 13 100 25.6c11 4.8 22.1 9.3 33 13.6l1 .4c12 4.6 27.3 9.3 41.4 9.3z"/></svg>', xe = ["😞", "😕", "😐", "🙂", "😄"], Ye = {
  star: J,
  heart: ii
}, Qe = {
  star: "#f59e0b",
  heart: "#ec4899"
};
function dn({
  icon: s = "heart",
  max: i = 5,
  precision: e = 0.5,
  color: t = null
} = {}) {
  if (s === "smiley") return ai({ max: i });
  if (s === "thumb") return li();
  if (s === "nps") return di();
  const n = Ye[s] || Ye.heart, r = t || Qe[s] || Qe.heart, o = e > 0 ? 1 / e : 2;
  return ({ value: a }) => {
    let l = parseFloat(a);
    Number.isFinite(l) || (l = 0), l = Math.max(0, Math.min(i, l)), l = Math.round(l * o) / o;
    const d = f("div", {
      class: `sg-renderer-rating is-${s}`,
      style: `--rating-color: ${r};`,
      role: "img",
      "aria-label": `${l} out of ${i}`
    });
    for (let c = 1; c <= i; c++)
      if (l >= c)
        d.append(f("span", { class: "sg-renderer-rating-glyph is-full" }, n));
      else if (l > c - 1) {
        const u = Math.round((l - (c - 1)) * 100);
        d.append(f(
          "span",
          { class: "sg-renderer-rating-glyph is-partial" },
          `${n}<span class="sg-rating-clip" style="width:${u}%;">${n}</span>`
        ));
      } else
        d.append(f("span", { class: "sg-renderer-rating-glyph is-empty" }, n));
    return d;
  };
}
function ai({ max: s = 5 } = {}) {
  return ({ value: i }) => {
    let e = parseFloat(i);
    if (!Number.isFinite(e)) return "";
    e = Math.max(1, Math.min(s, Math.round(e)));
    const t = Math.min(
      xe.length - 1,
      Math.floor((e - 1) / (s - 1 || 1) * (xe.length - 1))
    );
    return f("span", {
      class: "sg-renderer-rating-smiley",
      title: `${e}/${s}`
    }, document.createTextNode(xe[t]));
  };
}
function li() {
  return ({ value: s }) => {
    if (s == null || s === "") return "";
    const i = Number(s);
    if (!Number.isFinite(i)) return "";
    const e = f("span", { class: "sg-renderer-rating-thumb" });
    return i > 0 ? (e.classList.add("is-up"), e.title = "Thumbs up", e.innerHTML = ri) : i < 0 ? (e.classList.add("is-down"), e.title = "Thumbs down", e.innerHTML = oi) : (e.classList.add("is-neutral"), e.title = "Neutral", e.append(document.createTextNode("—"))), e;
  };
}
function di() {
  return ({ value: s }) => {
    const i = parseFloat(s);
    if (!Number.isFinite(i)) return "";
    const e = Math.max(0, Math.min(10, Math.round(i))), t = e <= 6 ? "detractor" : e <= 8 ? "passive" : "promoter", n = t === "detractor" ? "Detractor" : t === "passive" ? "Passive" : "Promoter";
    return f("span", {
      class: `sg-renderer-rating-nps is-${t}`,
      title: `${e}/10 · ${n}`
    }, document.createTextNode(String(e)));
  };
}
const ci = ["#e5e7eb", "#d1d5db", "#9ca3af"];
function cn({
  min: s = 0,
  max: i = 100,
  target: e = null,
  ranges: t = null,
  // [a] | [a, b] | [a, b, c]
  rangeColors: n = ci,
  barColor: r = "#111827",
  targetColor: o = "#111827",
  width: a = 120,
  height: l = 16
} = {}) {
  return ({ value: d }) => {
    let c, u, p;
    if (d && typeof d == "object" && !Array.isArray(d) ? (c = Number(d.value), u = d.target != null ? Number(d.target) : e, p = d.ranges || t) : (c = Number(d), u = e, p = t), !Number.isFinite(c)) return "";
    const h = i - s || 1, g = (x) => Math.max(s, Math.min(i, x)), _ = (x) => (g(x) - s) / h * a, y = p && p.length ? p.map(Number) : [s + h * 0.6, s + h * 0.8], S = [s, ...y, i];
    let b = "";
    for (let x = 0; x < S.length - 1; x++) {
      const L = _(S[x]), D = _(S[x + 1]) - L, C = n[x] || n[n.length - 1];
      b += `<rect x="${L.toFixed(2)}" y="0" width="${D.toFixed(2)}" height="${l}" fill="${C}"/>`;
    }
    const v = l * 0.42, w = (l - v) / 2;
    if (b += `<rect x="0" y="${w.toFixed(2)}" width="${_(c).toFixed(2)}" height="${v.toFixed(2)}" fill="${r}"/>`, u != null && Number.isFinite(u)) {
      const x = _(u), L = l * 0.85, D = (l - L) / 2;
      b += `<rect x="${(x - 1).toFixed(2)}" y="${D.toFixed(2)}" width="2" height="${L.toFixed(2)}" fill="${o}"/>`;
    }
    return `<svg class="sg-renderer-bullet" viewBox="0 0 ${a} ${l}" width="${a}" height="${l}" preserveAspectRatio="none" aria-hidden="true">` + b + "</svg>";
  };
}
function un({
  size: s = 28,
  thickness: i = 5,
  color: e = "green",
  background: t = "#e5e7eb",
  showValue: n = !0,
  inline: r = !1
} = {}) {
  const o = Te[e] || e;
  return ({ value: a }) => {
    let l = Number(a);
    if (!Number.isFinite(l)) return "";
    l = Math.max(0, Math.min(100, l));
    const d = (s - i) / 2, c = s / 2, u = s / 2, p = 2 * Math.PI * d, h = p * (1 - l / 100), g = `<text x="${c}" y="${u + 0.5}" text-anchor="middle" dominant-baseline="middle" font-size="${(s * 0.32).toFixed(1)}" font-weight="600" fill="currentColor">${Math.round(l)}</text>`, _ = `<svg class="sg-renderer-donut" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" aria-hidden="true"><circle cx="${c}" cy="${u}" r="${d}" fill="none" stroke="${t}" stroke-width="${i}"/><circle cx="${c}" cy="${u}" r="${d}" fill="none" stroke="${o}" stroke-width="${i}" stroke-dasharray="${p.toFixed(2)}" stroke-dashoffset="${h.toFixed(2)}" stroke-linecap="round" transform="rotate(-90 ${c} ${u})"/>` + (n && !r ? g : "") + "</svg>";
    return r && n ? `<span class="sg-renderer-donut-wrap">${_}<span class="sg-renderer-donut-label">${Math.round(l)}%</span></span>` : _;
  };
}
function pn({
  width: s = 120,
  height: i = 32,
  color: e = "blue",
  highlightMax: t = !1,
  gap: n = 1,
  binLabels: r = null,
  showCount: o = !1
} = {}) {
  const a = Te[e] || e;
  return ({ value: l, td: d }) => {
    if (l == null || l === "") return "";
    d && d.classList.add("sg-renderer-histogram-cell");
    let c = l, u = r;
    if (l && typeof l == "object" && !Array.isArray(l) && (c = l.counts, u = l.labels || r), !Array.isArray(c)) return "";
    const p = c.map(Number).filter(Number.isFinite);
    if (p.length === 0) return "";
    const h = Math.max(...p, 1), g = p.reduce((C, E) => C + E, 0), _ = u && u.length ? 10 : 0, y = 1, S = 1, b = s - y * 2, v = i - S * 2 - _, w = Math.max(1, (b - (p.length - 1) * n) / p.length);
    let x = "";
    for (let C = 0; C < p.length; C++) {
      const E = p[C], R = E / h * v, $ = y + C * (w + n), F = S + v - R, K = t ? E === h ? 1 : 0.45 : 0.85, U = u && u[C] != null ? `${u[C]}: ${E}` : `Bin ${C + 1}: ${E}`;
      x += `<rect x="${$.toFixed(2)}" y="${F.toFixed(2)}" width="${w.toFixed(2)}" height="${R.toFixed(2)}" fill="${a}" fill-opacity="${K}"><title>${_e(U)}</title></rect>`;
    }
    let L = "";
    if (u && u.length)
      for (let C = 0; C < p.length && C < u.length; C++) {
        const E = y + C * (w + n) + w / 2;
        L += `<text x="${E.toFixed(2)}" y="${(i - 1).toFixed(2)}" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.65">${_e(u[C])}</text>`;
      }
    const D = `<svg class="sg-renderer-histogram" viewBox="0 0 ${s} ${i}" width="${s}" height="${i}" preserveAspectRatio="none" aria-hidden="true">` + x + L + "</svg>";
    return o ? `<span class="sg-renderer-histogram-wrap">${D}<span class="sg-renderer-histogram-total">n=${g}</span></span>` : D;
  };
}
const ui = {
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
}, pi = { red: "#ef4444", amber: "#f59e0b", green: "#10b981" };
function hn({
  size: s = 10,
  thresholds: i = null,
  inverted: e = !1,
  showLabel: t = !1
} = {}) {
  return ({ value: n }) => {
    if (k(n)) return "";
    let r;
    if (i && Number.isFinite(Number(n))) {
      const a = Number(n), l = e ? i[1] : i[0], d = e ? i[0] : i[1];
      e ? r = a >= l ? "red" : a >= d ? "amber" : "green" : r = a <= l ? "red" : a <= d ? "amber" : "green";
    } else if (r = ui[String(n).toLowerCase()] || null, !r) return "";
    const o = f("span", {
      class: `sg-renderer-rag is-${r}`,
      title: t ? null : r.charAt(0).toUpperCase() + r.slice(1)
    });
    return o.append(f("span", {
      class: "sg-renderer-rag-dot",
      style: `width:${s}px; height:${s}px; background:${pi[r]};`,
      "aria-label": r
    })), t && o.append(f(
      "span",
      { class: "sg-renderer-rag-label" },
      document.createTextNode(r.charAt(0).toUpperCase() + r.slice(1))
    )), o;
  };
}
function fn({
  steps: s = ["Pending", "Shipped", "Delivered"],
  color: i = "#2563eb",
  showLabels: e = !1
} = {}) {
  return ({ value: t, td: n }) => {
    if (k(t)) return "";
    n && n.classList.add("sg-renderer-timeline-cell");
    let r = -1;
    if (Number.isFinite(Number(t)))
      r = Math.max(0, Math.min(s.length - 1, Math.floor(Number(t))));
    else {
      const a = String(t).toLowerCase();
      r = s.findIndex((l) => String(l).toLowerCase() === a);
    }
    if (r < 0) return "";
    const o = f("div", {
      class: `sg-renderer-timeline${e ? " has-labels" : ""}`,
      style: `--ts-color: ${i};`,
      role: "list",
      "aria-label": `Step ${r + 1} of ${s.length}: ${s[r]}`
    });
    for (let a = 0; a < s.length; a++) {
      const l = a < r ? "past" : a === r ? "current" : "future", d = f("span", { class: `sg-timeline-step is-${l}`, role: "listitem" });
      if (d.append(f("span", { class: "sg-timeline-dot", title: s[a], "aria-label": s[a] })), e && d.append(f("span", { class: "sg-timeline-label" }, document.createTextNode(s[a]))), o.append(d), a < s.length - 1) {
        const c = a < r ? "past" : "future";
        o.append(f("span", { class: `sg-timeline-line is-${c}`, "aria-hidden": "true" }));
      }
    }
    return o;
  };
}
const hi = /([@#][a-zA-Z0-9_\-]+)/g;
function gn({
  mentionHref: s = null,
  tagHref: i = null
} = {}) {
  return ({ value: e }) => {
    if (k(e)) return "";
    const t = String(e), n = f("span", { class: "sg-renderer-mentions" }), r = t.split(hi);
    for (const o of r)
      if (o)
        if (o[0] === "@") {
          const a = o.slice(1), l = typeof s == "function" ? s(a) : null;
          n.append(Ze(o, l, "sg-renderer-mention"));
        } else if (o[0] === "#") {
          const a = o.slice(1), l = typeof i == "function" ? i(a) : null;
          n.append(Ze(o, l, "sg-renderer-hashtag"));
        } else
          n.append(document.createTextNode(o));
    return n;
  };
}
function Ze(s, i, e) {
  const t = i ? f("a", { href: i, target: "_blank", rel: "noopener noreferrer", class: e }) : f("span", { class: e });
  return i && t.addEventListener("click", (n) => n.stopPropagation()), t.append(document.createTextNode(s)), t;
}
function mn({
  chars: s = null,
  lines: i = null,
  moreLabel: e = "Read more",
  lessLabel: t = "Show less"
} = {}) {
  return ({ value: n, td: r }) => {
    if (k(n)) return "";
    const o = String(n), a = s && o.length > s;
    if (!a && !i) return o;
    if (r) {
      r.classList.add("sg-renderer-expand-cell");
      const c = r.parentElement;
      c && c.tagName === "TR" && c.classList.add("sg-has-multiline");
    }
    const l = f("div", { class: "sg-renderer-expand" });
    let d = !1;
    if (a) {
      const c = o.slice(0, s).trimEnd() + "…", u = f(
        "span",
        { class: "sg-renderer-expand-short" },
        document.createTextNode(c)
      ), p = f(
        "span",
        { class: "sg-renderer-expand-full", hidden: "" },
        document.createTextNode(o)
      ), h = f(
        "button",
        { type: "button", class: "sg-renderer-expand-toggle" },
        document.createTextNode(e)
      );
      h.addEventListener("click", (g) => {
        g.stopPropagation(), d = !d, u.hidden = d, p.hidden = !d, h.textContent = d ? t : e;
      }), l.append(u, p, document.createTextNode(" "), h);
    } else {
      const c = f("div", { class: "sg-renderer-expand-clamp" });
      c.style.setProperty("--sg-clamp", String(i)), c.textContent = o;
      const u = f(
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
A("email", dt());
A("url", ct());
A("phone", ut());
A("currency", pt());
A("percent", ht());
A("progress-bar", zt());
A("star-rating", jt());
A("tags", qt());
A("country-flag", Kt());
A("abn", Ut());
A("avatar", Wt());
A("date", ft());
A("datetime", gt());
A("relative-time", mt());
A("duration", _t());
A("number", bt());
A("compact-number", yt());
A("file-size", vt());
A("boolean", wt());
A("delta", Ct());
A("truncate", xt());
A("copyable", Lt());
A("image", Mt());
A("color-swatch", Et());
A("sparkline", Rt());
A("heatmap-cell", kt());
A("mask", Nt());
A("highlight", $t());
A("multi-line", Vt());
A("attachments", Pt());
A("address-au", Ot());
A("checkbox", Xt());
A("switch", Zt());
A("markdown", Jt());
A("json", en());
A("linked-record", tn());
A("coloured-tags", nn());
A("time", sn());
A("diff", rn());
A("geo", on());
A("qr", an());
A("code", ln());
A("rating", dn());
A("bullet", cn());
A("donut", un());
A("histogram", pn());
A("rag", hn());
A("timeline-steps", fn());
A("mention", gn());
A("expand", mn());
A("audio-attachment", Qt());
const fi = {
  email: dt,
  url: ct,
  phone: ut,
  currency: pt,
  percent: ht,
  progressBar: zt,
  starRating: jt,
  tags: qt,
  countryFlag: Kt,
  abn: Ut,
  avatar: Wt,
  statusPill: Bs,
  date: ft,
  datetime: gt,
  relativeTime: mt,
  duration: _t,
  number: bt,
  compactNumber: yt,
  fileSize: vt,
  boolean: wt,
  delta: Ct,
  truncate: xt,
  copyable: Lt,
  image: Mt,
  colorSwatch: Et,
  sparkline: Rt,
  heatmap: kt,
  mask: Nt,
  highlight: $t,
  multiLine: Vt,
  attachments: Pt,
  addressAu: Ot,
  checkbox: Xt,
  switch: Zt,
  markdown: Jt,
  json: en,
  linkedRecord: tn,
  colouredTags: nn,
  time: sn,
  diff: rn,
  geo: on,
  qr: an,
  code: ln,
  rating: dn,
  bullet: cn,
  donut: un,
  histogram: pn,
  rag: hn,
  timelineSteps: fn,
  mention: gn,
  expand: mn,
  audioAttachment: Qt
}, gi = 32, Je = 100, le = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z"/></svg>', mi = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z"/></svg>', _i = /* @__PURE__ */ new Set([
  "number",
  "currency",
  "percent",
  "compactNumber",
  "fileSize",
  "duration"
]), bi = /* @__PURE__ */ new Set([
  "color",
  "date",
  "datetime-local",
  "time",
  "month",
  "week"
]), et = [
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
class $e extends q {
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
      const n = this.state.group.defaultExpanded;
      return n < 0 ? !0 : t < n;
    });
    // Delegated click handler for synthetic <th>s that don't have a
    // HeaderCellController of their own (pivot result cols today). Mirrors the
    // user-defined header path: bare click toggles sort, shift-click appends to
    // a multi-sort. Resize handles / filter icons short-circuit.
    N(this, "_onSynthHeaderClick", (e) => {
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
    N(this, "_onHeaderContextMenu", (e) => {
      const t = e.target.closest("th[data-field], th[data-header-cell-field-value]");
      if (!t) return;
      const n = t.getAttribute("data-field") || t.getAttribute("data-header-cell-field-value"), r = this._colByField(n);
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
      const n = Array.from(e.dataTransfer?.files || []);
      if (!n.length) return;
      const r = this.state.rowData.find((u) => this._rowId(u) === t.rowId), o = { rowId: t.rowId, colId: t.colId, files: n, row: r, dataTransfer: e.dataTransfer }, a = new CustomEvent("grid:fileAttached", { detail: o, bubbles: !0, cancelable: !0 });
      if (!this.element.dispatchEvent(a) || !r) return;
      const d = this.attachmentsFieldValue || t.colId, c = Array.isArray(r[d]) ? r[d].slice() : [];
      for (const u of n) {
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
      r[d] = c, this.scheduleRender("cells"), M(this.element, "grid:cellValueChanged", {
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
      const n = e.metaKey || e.ctrlKey;
      e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : n ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), M(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
    });
    N(this, "_onCellMouseOver", (e) => {
      if (!this._cellDragging) return;
      const t = this._cellAt(e.target);
      if (!t) return;
      const n = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
      n && n.focus.rowId === t.rowId && n.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), M(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
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
      const n = this._activeRect();
      if (!n) return;
      const r = this._cellRangeRows(n).map((o) => o.map((a) => String(a ?? "")).join("	")).join(`
`);
      r && (e.clipboardData?.setData("text/plain", r), e.preventDefault());
    });
    N(this, "_onGridKeydown", (e) => {
      if (!this.cellSelectionValue || this.state.editing) return;
      const t = document.activeElement;
      if (t && /^(input|textarea|select)$/i.test(t.tagName) && this.element.contains(t)) return;
      const n = e.key, r = e.metaKey || e.ctrlKey;
      if (r && n.toLowerCase() === "a") {
        e.preventDefault(), this.rowSelectionValue !== "" ? (this.clearCellSelection(), this.deselectAll(), this.selectAll()) : this._selectAllCells();
        return;
      }
      if (r) return;
      const o = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
      if (o[n]) {
        e.preventDefault();
        const [a, l] = o[n];
        this._moveActiveCell(a, l, e.shiftKey);
        return;
      }
      if (n === "Tab") {
        e.preventDefault(), this._moveActiveCell(0, e.shiftKey ? -1 : 1, !1);
        return;
      }
      if (n === "Enter") {
        const a = this._activeCell();
        a && (e.preventDefault(), this.startEditingCell(a.rowId, a.colId));
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
        const a = this._activeCell();
        if (!a) return;
        const l = this._colByField(a.colId);
        if (!l || !l.editable) return;
        e.preventDefault(), this.startEditingCell(a.rowId, a.colId, n);
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
      pagination: { enabled: !1, page: 0, pageSize: Je },
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
    }, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = zn(this), queueMicrotask(() => this._initialLoad());
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
        const u = t.getAttribute("data-label"), p = t.getAttribute("data-value");
        return u != null && (c.label = u), p != null && (c.value = p), c;
      }
      const r = {}, o = t.getAttribute("data-row-id") || t.getAttribute("data-row-row-id-value");
      r[this.getRowIdValue] = o != null ? this._coerceRowId(o) : n + 1;
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
        const p = Number(d.getAttribute("data-spans") || d.getAttribute("colspan") || 1);
        p > 1 && (a[c] = p);
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
      const n = m("thead");
      e.appendChild(n), this.element.appendChild(e);
    }
    let t = e.querySelector("tbody");
    if (t || (t = m("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport"))
      this._viewport = e.parentElement;
    else {
      const n = m("div", { class: "sg-body-viewport" });
      e.parentNode.insertBefore(n, e), n.appendChild(e), this._viewport = n;
    }
    if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = m("div", { class: "sg-status-bar", role: "status" }), this._statusBar.append(
      m("div", { class: "sg-status-section sg-status-left" }),
      m("div", { class: "sg-status-section sg-status-right" })
    ), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
      const n = m("div", { class: "sg-main" });
      this._viewport.parentNode.insertBefore(n, this._viewport), n.appendChild(this._viewport), this._statusBar && n.appendChild(this._statusBar), this._main = n, this._sidePanel = m("aside", {
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
    const n = this.state.filterModel[e.field] || {}, r = vi(e.filter), o = m("div", { class: "sg-filter-popover" }), a = m("select");
    r.forEach((y) => a.append(new Option(y.label, y.value, !1, y.value === n.type)));
    const l = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", d = m("input", { type: l, value: n.value ?? "" }), c = m("input", { type: l, value: n.value2 ?? "", style: { display: "none" } }), u = () => {
      const y = a.value, S = y === "inRange", b = !(y === "blank" || y === "notBlank");
      d.style.display = b ? "" : "none", c.style.display = S ? "" : "none";
    };
    a.addEventListener("change", u), u();
    const p = m("div", { class: "sg-filter-actions" }), h = m("button", { type: "button" }, "Clear"), g = m("button", { type: "button", class: "primary" }, "Apply");
    p.append(h, g), h.addEventListener("click", () => {
      this.setColumnFilter(e.field, null), this._closeFilterPopover();
    }), g.addEventListener("click", () => {
      const y = a.value, S = y === "blank" || y === "notBlank" ? { filterType: e.filter, type: y } : { filterType: e.filter, type: y, value: d.value, value2: c.value || void 0 };
      this.setColumnFilter(e.field, S), this._closeFilterPopover();
    }), o.append(
      m("label", {}, "Condition"),
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
    const n = this.state.columnDefs.findIndex((d) => d.field === e.field), r = this._runtimeOverrides[e.field] || {}, o = n >= 0 ? this.state.columnDefs[n] : null, a = o ? {
      ...o.hidden != null ? { hidden: o.hidden } : {},
      ...o.pinned ? { pinned: o.pinned } : {},
      ...o.width != null ? { width: o.width } : {}
    } : {}, l = { ...e, ...r, ...a, _headerEl: t };
    if (n >= 0) {
      const d = this.state.columnDefs[n];
      if (d._headerEl === t && yi(d, l)) return;
      this.state.columnDefs[n] = l;
    } else
      this.state.columnDefs.push(l);
    this.scheduleRender("columns");
  }
  unregisterColumn(e) {
    this._thead?.querySelector(`th[data-header-cell-field-value="${X(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns"));
  }
  // ----- Sort -----
  toggleSort(e, t = !1) {
    const n = this.state.sortModel.findIndex((o) => o.colId === e);
    let r;
    n === -1 ? r = { colId: e, sort: "asc" } : this.state.sortModel[n].sort === "asc" ? r = { colId: e, sort: "desc" } : r = null, t ? (n >= 0 && this.state.sortModel.splice(n, 1), r && this.state.sortModel.push(r)) : this.state.sortModel = r ? [r] : [], this.scheduleRender("sort"), M(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
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
    const n = this.state.selection;
    this.rowSelectionValue === "single" ? (n.clear(), n.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? n.has(e) ? n.delete(e) : n.add(e) : (n.clear(), n.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), M(this.element, "grid:selectionChanged", {
      selectedRows: this.getSelectedRows(),
      selectedIds: Array.from(n)
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
    const n = this._displayList.filteredSorted, r = n.findIndex((d) => this._rowId(d) === e), o = n.findIndex((d) => this._rowId(d) === t);
    if (r < 0 || o < 0) return;
    const [a, l] = r <= o ? [r, o] : [o, r];
    for (let d = a; d <= l; d++)
      !n[d].__sgGroup && !n[d].__sgSeparator && this.state.selection.add(this._rowId(n[d]));
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
    const e = Object.fromEntries(this.state.columnDefs.map((r) => [r.field, r])), t = this.state.columnDefs.filter((r) => !r.hidden && !r._isCheckbox);
    let n = st(this.state.rowData, this.state.filterModel, e);
    return n = it(n, this.state.quickFilter, t), n.length;
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
    const r = this.state.columnDefs.find((a) => a.field === t);
    if (!r || !r.editable) return;
    const o = this.state.rowData.find((a) => this._rowId(a) === e);
    o && (this.state.editing = { rowId: e, colId: t, originalValue: V(o, r), initialValue: n }, this.scheduleRender("cells"));
  }
  stopEditing(e = !1) {
    if (!this.state.editing) return;
    const { rowId: t, colId: n, originalValue: r, draftValue: o } = this.state.editing, a = this._tbody.querySelector(`tr[data-row-id="${X(t)}"] td[data-col-id="${X(n)}"]`);
    let l = r;
    if (!e && a) {
      const d = a.querySelector("[data-editor-input]") || a.querySelector("input,select,textarea");
      d ? l = wi(d.value, this._colByField(n)?.type) : o !== void 0 && (l = o);
    }
    if (this.state.editing = null, !e && l !== r) {
      const d = this.state.rowData.find((u) => this._rowId(u) === t), c = d[n];
      d[n] = l, M(this.element, "grid:cellValueChanged", { rowId: t, colId: n, oldValue: c, newValue: l });
    }
    this.scheduleRender("cells");
  }
  // ----- Column-level mutations from API or interactions -----
  setColumnVisible(e, t) {
    const n = this._colByField(e);
    n && (n.hidden = !t, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, hidden: !t }, this.scheduleRender("columns"), M(this.element, "grid:columnVisible", { colId: e, visible: t }));
  }
  setColumnPinned(e, t) {
    const n = this._colByField(e);
    if (!n) return;
    const r = t || null;
    n.pinned = r, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, pinned: r }, this._reorderForPinning(), this.scheduleRender("columns"), M(this.element, "grid:columnPinned", { colId: e, pinned: r });
  }
  setColumnWidth(e, t) {
    const n = this._colByField(e);
    if (!n) return;
    const r = Math.max(n.minWidth || 40, Math.min(n.maxWidth || 4e3, t));
    n.width = r, this._runtimeOverrides[e] = { ...this._runtimeOverrides[e] || {}, width: r }, this.scheduleRender("columns"), M(this.element, "grid:columnResized", { colId: e, width: r });
  }
  moveColumn(e, t) {
    const n = this.state.columnDefs.findIndex((o) => o.field === e);
    if (n < 0 || n === t) return;
    const [r] = this.state.columnDefs.splice(n, 1);
    this.state.columnDefs.splice(t, 0, r), this.scheduleRender("columns"), M(this.element, "grid:columnMoved", { colId: e, fromIndex: n, toIndex: t });
  }
  autoSizeColumn(e) {
    const t = this._colByField(e);
    if (!t) return;
    const n = X(e), r = this._thead?.querySelector(
      `th[data-header-cell-field-value="${n}"], th[data-field="${n}"]`
    ), o = Array.from(
      this._tbody?.querySelectorAll(`td[data-col-id="${n}"]`) || []
    ).filter((l) => !l.closest("tr")?.classList?.contains("sg-spacer"));
    let a = 0;
    if ((r || o.length) && (a = this._measureColumnContentWidth(r, o)), !a) {
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
  _measureColumnContentWidth(e, t, n = 50) {
    const r = document.createElement("table");
    r.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;table-layout:auto;width:auto;border-collapse:separate;border-spacing:0;";
    const o = document.createElement("tbody");
    r.appendChild(o);
    const a = (d) => {
      if (!d) return;
      const c = document.createElement("tr"), u = d.cloneNode(!0);
      u.removeAttribute("style"), c.appendChild(u), o.appendChild(c);
    };
    if (a(e), t.slice(0, n).forEach(a), !o.children.length) return 0;
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
    const t = this._visibleCols(), n = t.reduce((o, a) => o + (a.width || 150), 0);
    if (n === 0) return;
    const r = e / n;
    t.forEach((o) => {
      o.width = Math.max(o.minWidth || 40, Math.floor((o.width || 150) * r));
    }), this.scheduleRender("columns");
  }
  _reorderForPinning() {
    const e = this.state.columnDefs.filter((r) => r.pinned === "left"), t = this.state.columnDefs.filter((r) => r.pinned === "right"), n = this.state.columnDefs.filter((r) => !r.pinned);
    this.state.columnDefs = [...e, ...n, ...t];
  }
  // ----- Data mutations -----
  setRowData(e) {
    this.state.rowData = Array.isArray(e) ? e : [], this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), M(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
  }
  applyTransaction(e) {
    const t = [], n = [], r = [], o = new Map(this.state.rowData.map((a) => [this._rowId(a), a]));
    return (e.remove || []).forEach((a) => {
      const l = this._rowId(a);
      o.delete(l) && r.push(a);
    }), (e.update || []).forEach((a) => {
      const l = this._rowId(a);
      o.has(l) && (o.set(l, { ...o.get(l), ...a }), n.push(a));
    }), (e.add || []).forEach((a) => {
      const l = this._rowId(a);
      o.has(l) || (o.set(l, a), t.push(a));
    }), this.state.rowData = Array.from(o.values()), this.scheduleRender("data"), M(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), { added: t, updated: n, removed: r };
  }
  setColumnDefs(e) {
    this.state.columnDefs = e.map((t) => ({ ...t })), this.scheduleRender("columns");
  }
  refresh() {
    this.scheduleRender("cells");
  }
  // ----- Export -----
  getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
    const n = this.state.columnDefs.filter((l) => !l.hidden && !l._isCheckbox), r = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((l) => !l.__sgGroup && !l.__sgDetail && !l.__sgSeparator), o = (l) => /[",\n\r]/.test(l) ? `"${String(l).replace(/"/g, '""')}"` : String(l), a = [n.map((l) => o(l.headerName || l.field)).join(e)];
    for (const l of r)
      a.push(n.map((d) => o(G(l, d))).join(e));
    return a.join(`
`);
  }
  exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
    const n = this.getDataAsCsv(t), r = new Blob([n], { type: "text/csv;charset=utf-8" }), o = URL.createObjectURL(r), a = m("a", { href: o, download: e });
    return document.body.appendChild(a), a.click(), a.remove(), URL.revokeObjectURL(o), n;
  }
  // ----- Render pipeline -----
  scheduleRender(e) {
    this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
      this._renderPending = !1, this._render();
    }));
  }
  _render() {
    const e = this._dirty;
    this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.has("tree") || e.size === 0) && (this._displayList = Gn({
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
    const e = this._visibleCols(), t = Bn(e, this._headerLayoutOpts());
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
    t || (t = m("colgroup"), this._table.insertBefore(t, this._thead));
    const n = Array.from(t.children);
    for (e.forEach((o, a) => {
      let l = n[a];
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
      const p = this._thead.firstElementChild;
      for (let h = 1; h < this._thead.children.length; h++) {
        const g = this._thead.children[h];
        Array.from(g.children).forEach((_) => {
          (_.hasAttribute("data-header-cell-field-value") || _.hasAttribute("data-field")) && p.appendChild(_);
        });
      }
      for (; this._thead.children.length > 1; ) this._thead.lastElementChild.remove();
    }
    const t = this._thead.querySelector("tr") || (() => {
      const p = m("tr");
      return this._thead.appendChild(p), p;
    })(), n = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((p) => {
      const h = p.getAttribute("data-header-cell-field-value") || p.getAttribute("data-field");
      h && n.set(h, p);
    });
    const r = new Set(e.map((p) => p.field)), o = this.state.columnDefs.filter((p) => !r.has(p.field)), a = [...e, ...o], l = Array.from(t.children).map((p) => p.getAttribute("data-header-cell-field-value") || p.getAttribute("data-field")).filter(Boolean), d = a.map((p) => p.field);
    if (l.length === d.length && l.every((p, h) => p === d[h]))
      Array.from(t.children).forEach((p) => {
        p.removeAttribute("rowspan"), p.removeAttribute("colspan");
      });
    else {
      const p = [];
      for (const h of a) {
        let g = n.get(h.field);
        g ? (g.removeAttribute("rowspan"), g.removeAttribute("colspan")) : g = m("th", {
          "data-field": h.field,
          "data-synth": "true"
        }, [m("div", { class: "sg-header-content" }, [
          m("span", { class: "sg-header-label" }, h.headerName || h.field || "")
        ])]), p.push(g);
      }
      t.replaceChildren(...p);
    }
    Array.from(t.children).forEach((p) => {
      const h = p.getAttribute("data-header-cell-field-value") || p.getAttribute("data-field");
      h != null && (p.style.display = r.has(h) ? "" : "none");
    });
    const u = this._pinOffsets();
    for (const p of e) {
      const h = t.querySelector(`th[data-header-cell-field-value="${X(p.field)}"]`) || t.querySelector(`th[data-field="${X(p.field)}"]`);
      h && this._applyLeafThState(h, p, u);
    }
  }
  // Multi-row header: <thead> gets `layout.depth` rows of group headers
  // followed by the leaf headers, then one hidden row holding any registered
  // <th>s that aren't currently visible (so their controllers stay mounted).
  _renderHeaderMultiRow(e, t) {
    const n = /* @__PURE__ */ new Map();
    Array.from(this._thead.querySelectorAll("th")).forEach((c) => {
      const u = c.getAttribute("data-header-cell-field-value") || c.getAttribute("data-field");
      u && n.set(u, c);
    });
    const r = [], o = new Set(e.map((c) => c.field)), a = this._pinOffsets();
    for (const c of t.rows) {
      const u = m("tr");
      for (const p of c) {
        if (p.kind === "group") {
          u.appendChild(m("th", {
            class: "sg-header-group",
            colspan: String(p.colspan),
            "data-group-header": "true"
          }, p.label || ""));
          continue;
        }
        const h = p.col;
        let g = n.get(h.field);
        if (g || (g = m("th", {
          "data-field": h.field,
          "data-synth": "true"
        }, [m("div", { class: "sg-header-content" }, [
          m("span", { class: "sg-header-label" }, p.label || h.headerName || h.field || "")
        ])])), p.label) {
          const _ = g.querySelector(".sg-header-label");
          _ && _.textContent !== p.label && (_.textContent = p.label);
        }
        g.setAttribute("rowspan", String(p.rowspan)), g.removeAttribute("colspan"), g.style.display = "", u.appendChild(g), this._applyLeafThState(g, h, a);
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
        let p = n.get(u.field);
        p || (p = m("th", { "data-field": u.field, "data-synth": "true" })), p.removeAttribute("rowspan"), p.removeAttribute("colspan"), c.appendChild(p);
      }
      r.push(c);
    }
    this._thead.replaceChildren(...r);
  }
  // Shared leaf-th state updates (sort/filter/pin attrs + chrome). Called from
  // both the single-row and multi-row paths so the per-leaf behaviour stays
  // identical regardless of header depth.
  _applyLeafThState(e, t, n) {
    const r = this.state.sortModel.find((o) => o.colId === t.field);
    He(e, {
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
    return typeof t == "string" && _i.has(t) ? "right" : null;
  }
  _ensureHeaderChrome(e, t, n) {
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
      if (o || (o = m("span", { class: "sg-sort-icon", "aria-hidden": "true" }), o.innerHTML = le, r.appendChild(o)), n && this.state.sortModel.length > 1) {
        let l = r.querySelector(".sg-sort-index");
        l || (l = m("span", { class: "sg-sort-index" }), r.appendChild(l)), l.textContent = String(this.state.sortModel.indexOf(n) + 1);
      } else
        r.querySelector(".sg-sort-index")?.remove();
    else o && o.remove();
    let a = r.querySelector(".sg-filter-icon");
    t.filter ? a || (a = m("span", {
      class: "sg-filter-icon",
      "data-action": "click->header-cell#openFilter",
      title: "Filter"
    }), a.innerHTML = mi, r.appendChild(a)) : a && a.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(m("span", {
      class: "sg-resize-handle",
      "data-action": "mousedown->header-cell#startResize"
    }));
  }
  _renderBody() {
    if (!this._tbody) return;
    const e = this._visibleCols(), t = this._withDetailRows(this._displayList.pageRows);
    this._selKeys = this._computeCellSelKeys();
    const n = !this.masterDetailValue && (this.virtualValue || t.length > 200);
    let r = t, o = 0;
    if (n) {
      const p = this._viewport?.clientHeight || 400, h = this.state.rowHeight, g = On(this.state.scrollTop, p, h, t.length, 8);
      o = g.first, r = t.slice(g.first, g.last);
    }
    const a = /* @__PURE__ */ new Map();
    Array.from(this._tbody.children).forEach((p) => {
      const h = p.dataset.rowId;
      h != null && a.set(h, p);
    });
    const l = document.createDocumentFragment(), d = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0;
    let c = 0;
    for (let p = 0; p < o; p++) {
      const h = t[p];
      h && !h.__sgGroup && !h.__sgDetail && !h.__sgSeparator && (c += 1);
    }
    const u = (p) => !p || p.__sgGroup || p.__sgDetail || p.__sgSeparator ? null : (c += 1, d + c);
    if (n) {
      const p = this.state.rowHeight, h = o * p, g = (t.length - o - r.length) * p;
      l.appendChild(this._spacerRow(h, e.length)), r.forEach((_) => l.appendChild(this._buildRow(_, e, a, u(_)))), l.appendChild(this._spacerRow(g, e.length));
    } else
      r.forEach((p) => l.appendChild(this._buildRow(p, e, a, u(p))));
    this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && l.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(l);
  }
  _buildPinnedBottomRow(e) {
    const t = m("tr", { class: "sg-pinned-bottom-row", "aria-label": "Grand totals" }), n = this._pinOffsets(), r = this._displayList.grandTotals || {};
    let o = !1;
    for (const a of e) {
      const l = m("td", { "data-col-id": a.field, "data-pinned": a.pinned || null });
      a.pinned === "left" ? l.style.left = n.left[a.field] + "px" : a.pinned === "right" && (l.style.right = n.right[a.field] + "px");
      const d = r[a.field];
      d != null ? (l.classList.add("sg-agg-cell"), l.textContent = this._formatAggregate(d)) : !o && !a._isCheckbox && !a._isRowNumber && (l.classList.add("sg-pinned-bottom-label"), l.textContent = "Total", o = !0), t.appendChild(l);
    }
    return t;
  }
  _buildRow(e, t, n, r) {
    if (e.__sgGroup) return this._buildGroupRow(e, t, n);
    if (e.__sgDetail) return this._buildDetailRow(e, t, n);
    if (e.__sgSeparator) return this._buildSeparatorRow(e, t, n);
    const o = String(this._rowId(e));
    let a = n.get(o);
    a || (a = m("tr")), a.dataset.rowId = o, a.classList.remove("sg-spacer");
    const l = this.state.selection.has(this._rowId(e)), d = this.masterDetailValue && this._isDetailExpanded(o);
    return He(a, {
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
  _buildSeparatorRow(e, t, n) {
    const r = `__s:${e.__sgSeparatorId ?? this._separatorKey(e)}`;
    let o = n.get(r);
    o || (o = m("tr")), o.dataset.rowId = r, o.dataset.separator = "true", o.className = "", o.removeAttribute("data-selected"), o.removeAttribute("data-detail-expanded");
    const a = e.variant || (e.value != null ? "summary" : e.label != null ? "heading" : "blank");
    o.classList.add("sg-separator-row", `sg-separator-${a}`), e.className && o.classList.add(e.className), o.innerHTML = "";
    const l = (u) => u._isCheckbox || u._isRowNumber || u._isGroupCol || u._isMasterExpand, c = t.filter((u) => !l(u)).length || t.length || 1;
    for (const u of t) {
      if (l(u)) {
        const h = m("td", { "data-col-id": u.field, class: "sg-separator-gutter" });
        o.appendChild(h);
        continue;
      }
      const p = m("td", {
        "data-col-id": u.field,
        colspan: String(c),
        class: "sg-separator-cell"
      });
      this._renderSeparatorContent(p, e, a), o.appendChild(p);
      break;
    }
    return o;
  }
  _renderSeparatorContent(e, t, n) {
    if (n === "blank" || n === "divider")
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
    const n = m("tr", { class: "sg-spacer", "aria-hidden": "true" });
    return n.style.height = e + "px", n.appendChild(m("td", { colspan: String(t), style: { height: e + "px", padding: "0", border: "0" } })), n;
  }
  _renderRow(e, t, n, r) {
    e.innerHTML = "";
    const o = this._pinOffsets(), a = this._selKeys || { active: null, range: null }, l = String(this._rowId(t)), d = this._displayList?.treeMeta, c = d ? d.get(l) : null, u = c ? this._treeDisplayColField() : null, p = t && t.__sgSpans || null;
    let h = 0;
    for (let g = 0; g < n.length; g++) {
      const _ = n[g];
      if (h > 0) {
        h -= 1;
        continue;
      }
      const y = _._isRowNumber || _._isCheckbox || _._isGroupCol || _._isMasterExpand, S = p && !y ? Number(p[_.field]) : 0, b = Math.max(1, Math.min(S || 1, n.length - g));
      b > 1 && (h = b - 1);
      const v = `${l}:${_.field}`, w = m("td", {
        "data-col-id": _.field,
        "data-pinned": _.pinned || null,
        "data-cell-active": a.active === v ? "true" : null,
        "data-cell-range": a.range && a.range.has(v) ? "true" : null,
        colspan: b > 1 ? String(b) : null
      });
      if (b > 1 && w.classList.add("sg-merged-cell"), _.pinned === "left" ? w.style.left = o.left[_.field] + "px" : _.pinned === "right" && (w.style.right = o.right[_.field] + "px"), _._isRowNumber) {
        w.classList.add("sg-gutter-cell"), w.setAttribute("data-gutter", "true"), w.removeAttribute("data-cell-active"), w.removeAttribute("data-cell-range"), w.textContent = r != null ? String(r) : "", e.appendChild(w);
        continue;
      }
      if (_._isCheckbox) {
        w.classList.add("sg-checkbox-cell");
        const L = m("input", { type: "checkbox" });
        L.checked = this.state.selection.has(this._rowId(t)), w.appendChild(L), e.appendChild(w);
        continue;
      }
      if (_._isGroupCol) {
        w.classList.add("sg-group-leaf-cell"), w.removeAttribute("data-cell-active"), w.removeAttribute("data-cell-range"), e.appendChild(w);
        continue;
      }
      if (_._isMasterExpand) {
        w.classList.add("sg-master-expand-cell"), w.setAttribute("data-master-expand", "true"), w.removeAttribute("data-cell-active"), w.removeAttribute("data-cell-range");
        const L = this._isDetailExpanded(this._rowId(t)), D = m("span", {
          class: "sg-master-expand-caret",
          "data-expanded": L ? "true" : "false",
          "aria-hidden": "true"
        });
        D.innerHTML = le, w.appendChild(D), e.appendChild(w);
        continue;
      }
      if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === _.field) {
        w.setAttribute("data-editing", "true");
        const L = this.state.editing.initialValue !== void 0 ? this.state.editing.initialValue : V(t, _), { node: D, control: C } = this._buildEditor(_, L);
        w.appendChild(D);
        const E = this.state.editing.initialValue !== void 0;
        queueMicrotask(() => {
          if (C?.focus(), E || C?.select?.(), C?.type && bi.has(C.type))
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
      const n = m("span", {
        class: "sg-tree-chevron",
        "data-tree-toggle": "true",
        "data-expanded": t.expanded ? "true" : "false",
        "aria-hidden": "true"
      });
      n.innerHTML = le, e.insertBefore(n, e.firstChild);
    } else {
      const n = m("span", { class: "sg-tree-chevron sg-tree-chevron-leaf", "aria-hidden": "true" });
      e.insertBefore(n, e.firstChild);
    }
  }
  _renderCellContent(e, t, n) {
    if (n.cellRenderer) {
      const r = Ge(n.cellRenderer);
      if (r) {
        const a = V(t, n), l = G(t, n);
        (r.dataset.bind || r.dataset.bindText !== void 0) && (r.textContent = r.dataset.bind ? String(t[r.dataset.bind] ?? "") : l), r.dataset.bindAttr && r.setAttribute(r.dataset.bindAttr, a), r.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((d) => {
          d.dataset.bindText !== void 0 ? d.textContent = l : d.dataset.bind && (d.textContent = String(t[d.dataset.bind] ?? "")), d.dataset.bindAttr && d.setAttribute(d.dataset.bindAttr, a);
        }), e.appendChild(r);
        return;
      }
      const o = lt(n.cellRenderer);
      if (typeof o == "function") {
        const a = V(t, n), l = G(t, n), d = o({ value: a, row: t, col: n, td: e, formatted: l, api: this.element.gridApi });
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
    e.textContent = G(t, n);
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
    for (const { field: n, aggFunc: r } of e || [])
      n && r && (t[n] = r);
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
        const t = new Map(this.state.columnDefs.map((r) => [r.field, r])), n = [];
        for (const r of e.cols) {
          const o = t.get(r.field);
          o && (r.width != null && (o.width = r.width), o.pinned = r.pinned || void 0, o.hidden = !!r.hidden, t.delete(r.field), n.push(o));
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
    for (const t of et) this.element.addEventListener(t, e);
    this._persistBeforeUnload = () => {
      this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
    }, window.addEventListener("beforeunload", this._persistBeforeUnload);
  }
  _teardownPersistence() {
    if (this._persistListener) {
      for (const e of et) this.element.removeEventListener(e, this._persistListener);
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
    let o = n.get(r);
    return o || (o = m("tr")), o.dataset.rowId = r, o.dataset.group = "true", o.dataset.groupLevel = String(e.level), o.className = "sg-group-row", this._renderGroupRow(o, e, t), o;
  }
  _renderGroupRow(e, t, n) {
    e.innerHTML = "";
    const r = this._pinOffsets(), o = this._isGroupExpanded(t.groupId, t.level), a = (this.state.group.displayType || "singleColumn") === "singleColumn", l = !!(this.state.pivot?.mode && this._displayList?.pivot), d = t.__pivotAll === !0, c = n.filter((h) => !h._isRowNumber && !h._isCheckbox && !h._isGroupCol), u = c.some((h) => h.field === t.field) ? t.field : c[0]?.field, p = Math.max(0, t.level);
    d && e.classList.add("sg-pivot-all-row");
    for (const h of n) {
      const g = m("td", { "data-col-id": h.field, "data-pinned": h.pinned || null });
      if (h.pinned === "left" ? g.style.left = r.left[h.field] + "px" : h.pinned === "right" && (g.style.right = r.right[h.field] + "px"), h._isRowNumber || h._isCheckbox) {
        g.classList.add(h._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(g);
        continue;
      }
      if (l || a ? h._isGroupCol : h.field === u) {
        if (g.classList.add("sg-group-cell"), g.style.paddingLeft = `${8 + p * 18}px`, !d) {
          const y = m("span", {
            class: "sg-group-caret",
            "data-expanded": o ? "true" : "false",
            "aria-hidden": "true"
          });
          y.innerHTML = le, g.appendChild(y);
        }
        g.append(
          m("span", { class: "sg-group-label" }, this._groupValueLabel(t)),
          m("span", { class: "sg-group-count" }, ` (${t.count})`)
        );
      } else if (l && h._isPivot) {
        const y = V(t, h);
        y != null && (g.classList.add("sg-agg-cell"), g.textContent = this._formatAggregate(y));
      } else !h._isGroupCol && t.aggregates && t.aggregates[h.field] != null && (g.classList.add("sg-agg-cell"), g.textContent = this._formatAggregate(t.aggregates[h.field]));
      e.appendChild(g);
    }
  }
  _groupValueLabel(e) {
    const t = e.value;
    if (t == null || t === "") return "(Blanks)";
    const n = this._colByField(e.field);
    return n ? G({ [e.field]: t }, n) : String(t);
  }
  _formatAggregate(e) {
    return e == null ? "" : typeof e == "number" ? Number.isInteger(e) ? String(e) : String(Math.round(e * 100) / 100) : String(e);
  }
  // Returns { node, control }: the element to mount and the focusable control
  // whose value is read on commit. A column may supply a custom editor via a
  // <template> (col.cellEditor); otherwise a type-appropriate input is built.
  _buildEditor(e, t) {
    if (e.cellEditor) {
      const r = Ge(e.cellEditor);
      if (r) {
        const o = r.matches?.("input,select,textarea") ? r : r.querySelector?.("[data-editor-input]") || r.querySelector?.("input,select,textarea");
        return o && (this._seedEditorValue(o, e, t), o.addEventListener("keydown", this._onEditorKey), o.addEventListener("blur", this._onEditorBlur)), { node: r, control: o };
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
        const o = r.getTimezoneOffset() * 6e4;
        e.value = new Date(r.getTime() - o).toISOString().slice(0, 16);
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
    if (e.type === "number") n = m("input", { type: "number", value: t ?? "" });
    else if (e.type === "date") {
      const r = t instanceof Date ? t : t ? new Date(t) : null, o = r ? r.toISOString().slice(0, 10) : "";
      n = m("input", { type: "date", value: o });
    } else if (e.type === "datetime") {
      const r = t instanceof Date ? t : t ? new Date(t) : null;
      let o = "";
      if (r && !Number.isNaN(r.getTime())) {
        const a = r.getTimezoneOffset() * 6e4;
        o = new Date(r.getTime() - a).toISOString().slice(0, 16);
      }
      n = m("input", { type: "datetime-local", value: o });
    } else if (e.type === "color") {
      const r = /^#[0-9a-f]{6}$/i.test(String(t ?? "")) ? t : "#000000";
      n = m("input", { type: "color", value: r });
    } else e.type === "email" ? n = m("input", { type: "email", value: t ?? "" }) : e.type === "url" ? n = m("input", { type: "url", value: t ?? "" }) : e.type === "tel" ? n = m("input", { type: "tel", value: t ?? "" }) : e.type === "boolean" ? (n = m("select"), n.append(
      new Option("—", ""),
      new Option("true", "true", t === !0, t === !0),
      new Option("false", "false", t === !1, t === !1)
    )) : n = m("input", { type: "text", value: t ?? "" });
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
  _statusPanel(e, t, n = null) {
    const r = m("div", { class: "sg-status-panel" });
    return r.append(
      m("span", { class: "sg-status-label" }, `${e}:`),
      m("span", { class: "sg-status-value" }, t)
    ), n && r.appendChild(m("span", { class: "sg-status-aside" }, n)), r;
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
          const o = n.rows[r];
          if (!(!o || o.__sgGroup || o.__sgDetail || o.__sgSeparator))
            for (let a = n.c0; a <= n.c1; a++) {
              const l = n.cols[a];
              !l || l._isCheckbox || l._isRowNumber || l._isGroupCol || l._isMasterExpand || e.push(V(o, l));
            }
        }
    }
    return e;
  }
  getRangeAggregates() {
    return this.state.cellSel.ranges.length ? Dn(this._cellRangeRawValues()) : null;
  }
  _showColumnMenu(e, t, n) {
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
    o.style.left = `${Math.min(t, window.innerWidth - a - 4)}px`, o.style.top = `${Math.min(n, window.innerHeight - l - 4)}px`, this._columnMenu = o, setTimeout(() => {
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
    const t = this.element.gridApi, n = e.headerName || e.field, r = this.state.group.cols.includes(e.field), o = this.state.pivot.cols.includes(e.field), a = this.state.group.aggs[e.field], l = e.type === "number", d = [];
    if (e.pinned !== "left" && d.push({ label: "Pin left", action: () => t.setColumnPinned(e.field, "left") }), e.pinned !== "right" && d.push({ label: "Pin right", action: () => t.setColumnPinned(e.field, "right") }), e.pinned && d.push({ label: "Unpin", action: () => t.setColumnPinned(e.field, null) }), d.push("separator"), d.push({ label: "Autosize this column", action: () => t.autoSizeColumn(e.field) }), d.push({ label: "Autosize all columns", action: () => t.autoSizeAllColumns() }), d.push("separator"), d.push(r ? { label: `Ungroup ${n}`, action: () => t.removeRowGroupColumn(e.field) } : { label: `Group by ${n}`, action: () => t.addRowGroupColumn(e.field) }), d.push(o ? { label: `Remove ${n} from pivot`, action: () => t.removePivotColumn(e.field) } : { label: `Pivot by ${n}`, action: () => {
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
    const t = e?.closest?.("td"), n = e?.closest?.("tr");
    if (!t || !n || n.dataset.group === "true" || n.dataset.separator === "true" || n.classList.contains("sg-detail-row") || t.classList.contains("sg-checkbox-cell") || t.classList.contains("sg-group-leaf-cell") || t.classList.contains("sg-master-expand-cell") || t.dataset.gutter === "true" || !t.dataset.colId) return null;
    const r = t.dataset.colId, o = this._colByField(r);
    return o && o.acceptFiles === !1 ? null : { td: t, tr: n, colId: r, rowId: this._coerceRowId(n.dataset.rowId), col: o };
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
    const t = Array.from(this.state.selection).map(String), n = new Set(t.includes(String(e)) ? t : [String(e)]), r = m("div", { class: "sg-drag-ghost sg-grid" }), o = m("table"), a = m("tbody");
    let l = 0;
    this._tbody.querySelectorAll("tr[data-row-id]").forEach((c) => {
      if (n.has(c.dataset.rowId) && l < 6) {
        const u = c.cloneNode(!0);
        u.removeAttribute("data-selected"), u.querySelectorAll("td").forEach((p) => {
          p.style.left = "", p.style.right = "", p.removeAttribute("data-pinned"), p.removeAttribute("data-cell-active"), p.removeAttribute("data-cell-range");
        }), a.appendChild(u), l += 1;
      }
    }), o.appendChild(a), r.appendChild(o), n.size > l && r.appendChild(m("div", { class: "sg-drag-ghost-more" }, `+${n.size - l} more rows`)), r.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(r);
    const d = m("div", { class: "sg-drop-indicator" });
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
    const o = n.getBoundingClientRect(), a = this._viewport.getBoundingClientRect(), l = this._rowDrag.indicator;
    l.style.left = `${a.left}px`, l.style.width = `${a.width}px`, l.style.top = `${(r ? o.top : o.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(n.dataset.rowId), this._rowDrag.dropBefore = r;
  }
  _finishRowDrag() {
    const { ids: e, ghost: t, indicator: n, dropRowId: r, dropBefore: o } = this._rowDrag;
    if (t.remove(), n.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, r == null || e.has(String(r))) return;
    const a = this.state.rowData, l = a.filter((u) => e.has(String(this._rowId(u)))), d = a.filter((u) => !e.has(String(this._rowId(u))));
    let c = d.findIndex((u) => this._rowId(u) === r);
    c < 0 ? c = d.length : o || (c += 1), d.splice(c, 0, ...l), this.state.rowData = d, this.state.sortModel = [], this.scheduleRender("data"), M(this.element, "grid:rowDragEnd", {
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
      const n = t.parentElement, r = `${n && n.dataset.rowId}:${t.dataset.colId}`;
      e.active === r ? t.setAttribute("data-cell-active", "true") : t.removeAttribute("data-cell-active"), e.range && e.range.has(r) ? t.setAttribute("data-cell-range", "true") : t.removeAttribute("data-cell-range");
    }), this._renderStatusBar());
  }
  // Rectangle (display indices) for a {anchor,focus} range, or null.
  _rangeRect(e) {
    if (!e) return null;
    const t = this._displayList.pageRows, n = this._visibleCols(), r = (u) => t.findIndex((p) => this._rowId(p) === u), o = (u) => n.findIndex((p) => p.field === u), a = r(e.anchor.rowId), l = o(e.anchor.colId);
    if (a < 0 || l < 0) return null;
    const d = r(e.focus.rowId), c = o(e.focus.colId);
    return {
      r0: Math.min(a, d < 0 ? a : d),
      r1: Math.max(a, d < 0 ? a : d),
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
    const t = `${e.rowId}:${e.colId}`, n = /* @__PURE__ */ new Set();
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
              u !== t && n.add(u);
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
          const o = n.rows[r];
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
  _moveActiveCell(e, t, n) {
    const r = this._displayList.pageRows, o = this._navCols();
    if (!r.length || !o.length) return;
    const a = (p, h, g) => Math.max(h, Math.min(p, g)), l = this._activeCell(), d = () => r.findIndex((p) => !p.__sgGroup && !p.__sgDetail && !p.__sgSeparator);
    let c = l ? r.findIndex((p) => this._rowId(p) === l.rowId) : d(), u = l ? o.findIndex((p) => p.field === l.colId) : 0;
    if (c < 0 && (c = d()), !(c < 0)) {
      if (u < 0 && (u = 0), n && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
        const p = this.state.cellSel.ranges[this.state.cellSel.activeIdx], h = a(r.findIndex((_) => this._rowId(_) === p.focus.rowId) + e, 0, r.length - 1), g = a(o.findIndex((_) => _.field === p.focus.colId) + t, 0, o.length - 1);
        this._extendActiveRange({ rowId: this._rowId(r[h]), colId: o[g].field });
      } else {
        let p = a(c + e, 0, r.length - 1);
        if (e !== 0) {
          for (; r[p] && (r[p].__sgGroup || r[p].__sgDetail || r[p].__sgSeparator); ) {
            const g = p + e;
            if (g < 0 || g >= r.length) break;
            p = g;
          }
          if (!r[p] || r[p].__sgGroup || r[p].__sgDetail || r[p].__sgSeparator) return;
        }
        const h = a(u + t, 0, o.length - 1);
        this._setSingleCellSel({ rowId: this._rowId(r[p]), colId: o[h].field });
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
      const n = this._rangeRect(t);
      if (n)
        for (let r = n.r0; r <= n.r1; r++) {
          const o = n.rows[r];
          if (!(!o || o.__sgGroup || o.__sgDetail || o.__sgSeparator))
            for (let a = n.c0; a <= n.c1; a++) {
              const l = n.cols[a];
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
    const t = e.target.closest("tr"), n = e.target.closest("td");
    if (!t || !n || n.dataset.editing === "true") return;
    const r = this._coerceRowId(t.dataset.rowId), o = n.dataset.colId;
    this.startEditingCell(r, o);
  }
  // Commit the current editor and open the editor on the next (dir=1) or
  // previous (dir=-1) editable cell in reading order, wrapping within the
  // current page. RAILS.md §9 — Tab/Shift+Tab cell navigation.
  _tabToEditableCell(e) {
    const t = this.state.editing;
    if (!t) return;
    const n = this._visibleCols().filter((p) => p.editable && !p._isCheckbox), r = this._displayList.pageRows, o = r.findIndex((p) => this._rowId(p) === t.rowId), a = n.findIndex((p) => p.field === t.colId);
    if (!n.length || !r.length || o < 0 || a < 0) {
      this.stopEditing(!1);
      return;
    }
    const l = r.length * n.length, d = (o * n.length + a + e + l) % l, c = r[Math.floor(d / n.length)], u = n[d % n.length];
    this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(c), u.field), requestAnimationFrame(() => {
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
    M(this.element, "grid:detailRowExpanded", { rowId: e, masterRow: n });
  }
  collapseDetailRow(e) {
    if (!this.masterDetailValue) return;
    const t = String(e);
    if (!this._detailExpanded.has(t)) return;
    this._detailExpanded.delete(t), this._detailGrids.delete(t), this.scheduleRender("cells");
    const n = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    M(this.element, "grid:detailRowCollapsed", { rowId: e, masterRow: n });
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
    const r = this.state.rowData.find((o) => String(this._rowId(o)) === t);
    M(this.element, n ? "grid:treeRowCollapsed" : "grid:treeRowExpanded", { rowId: e, row: r });
  }
  expandTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !0), this.scheduleRender("tree");
    const n = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    M(this.element, "grid:treeRowExpanded", { rowId: e, row: n });
  }
  collapseTreeRow(e) {
    if (!this.state.tree?.enabled) return;
    const t = String(e);
    if (!this._isTreeRowExpanded(t, 0)) return;
    this._treeExpanded.set(t, !1), this.scheduleRender("tree");
    const n = this.state.rowData.find((r) => String(this._rowId(r)) === t);
    M(this.element, "grid:treeRowCollapsed", { rowId: e, row: n });
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
    return e || this._visibleCols().find((r) => !r._isCheckbox && !r._isRowNumber && !r._isGroupCol && !r._isMasterExpand)?.field || null;
  }
  // Build the detail <tr>: one cell spanning the full visible width, holding a
  // padded shell that hosts either a cloned <template> or a default summary
  // pulled from the master row.
  _buildDetailRow(e, t, n) {
    const r = `__d:${e.masterId}`;
    let o = n.get(r);
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
  _populateDetailShell(e, t, n) {
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
    a && this._seedNestedGrid(a, t, n), queueMicrotask(() => {
      M(this.element, "grid:detailRowMounted", {
        rowId: n,
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
  _seedNestedGrid(e, t, n) {
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
      e.gridApi && this._detailGrids.set(String(n), e.gridApi);
    });
  }
  _pinOffsets() {
    const e = this._visibleCols(), t = {};
    let n = 0;
    for (const o of e)
      o.pinned === "left" && (t[o.field] = n, n += o.width || 150);
    const r = {};
    n = 0;
    for (let o = e.length - 1; o >= 0; o--) {
      const a = e[o];
      a.pinned === "right" && (r[a.field] = n, n += a.width || 150);
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
N($e, "values", {
  rowData: { type: Array, default: [] },
  rowDataUrl: { type: String, default: "" },
  rowSelection: { type: String, default: "" },
  // '', 'single', 'multiple'
  rowMultiSelectWithClick: { type: Boolean, default: !1 },
  suppressRowClickSelection: { type: Boolean, default: !1 },
  pagination: { type: Boolean, default: !1 },
  pageSize: { type: Number, default: Je },
  rowHeight: { type: Number, default: gi },
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
function yi(s, i) {
  const e = ["headerName", "type", "sortable", "filter", "editable", "width", "minWidth", "maxWidth", "pinned", "hidden", "resizable", "cellRenderer", "cellEditor", "_isCheckbox", "_isRowNumber"];
  for (const t of e) if (s[t] !== i[t]) return !1;
  return !0;
}
function vi(s) {
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
function wi(s, i) {
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
function X(s) {
  return typeof CSS < "u" && CSS.escape ? CSS.escape(String(s)) : String(s).replace(/["\\\n\r]/g, (i) => "\\" + i);
}
class Ve extends q {
  constructor() {
    super(...arguments);
    /* Single mousedown handler: distinguishes a bare click (→ sort) from a drag
     * that moves past a small pixel threshold (→ column reorder). Lets us keep
     * sort + reorder on the same header without a separate drag handle. */
    N(this, "_onMouseDown", (e) => {
      if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
      const t = e.clientX, n = e.clientY;
      let r = !1;
      const o = (l) => {
        const d = Math.abs(l.clientX - t), c = Math.abs(l.clientY - n);
        !r && (d > 5 || c > 5) && (r = !0, document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), this._beginReorder(t));
      }, a = (l) => {
        document.removeEventListener("mousemove", o), document.removeEventListener("mouseup", a), r || this.sort(l);
      };
      document.addEventListener("mousemove", o), document.addEventListener("mouseup", a);
    });
  }
  connect() {
    if (this.grid = jn(this.element, "grid", this.application), !!this.grid) {
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
    let o = r;
    this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
    const a = (d) => {
      const c = d.clientX;
      let u = n.length;
      for (let p = 0; p < n.length; p++) {
        const h = n[p].getBoundingClientRect();
        if (c < h.left + h.width / 2) {
          u = p;
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
    const t = e.clientX, n = this.element.offsetWidth, r = (a) => this.grid.setColumnWidth(this.fieldValue, n + (a.clientX - t)), o = () => {
      document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", o), document.body.style.cursor = "", document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", r), document.addEventListener("mouseup", o), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
  }
}
N(Ve, "values", {
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
class _n extends q {
  connect() {
  }
}
class bn extends q {
  connect() {
  }
}
class yn extends q {
  connect() {
  }
}
class be extends q {
  constructor() {
    super(...arguments);
    N(this, "_refresh", () => {
      const e = this._gridEl?.gridApi;
      if (!e) return;
      const t = e.paginationGetCurrentPage(), n = e.paginationGetTotalPages(), r = e.paginationGetRowCount(), o = e.paginationGetPageSize() || 1;
      if (this.hasPageInfoTarget) {
        const a = r === 0 ? 0 : t * o + 1, l = Math.min(r, a + o - 1);
        this.pageInfoTarget.textContent = r === 0 ? "0 rows" : `${a}–${l} of ${r}`;
      }
      this.hasFirstTarget && (this.firstTarget.disabled = t === 0), this.hasPrevTarget && (this.prevTarget.disabled = t === 0), this.hasNextTarget && (this.nextTarget.disabled = t >= n - 1), this.hasLastTarget && (this.lastTarget.disabled = t >= n - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(o));
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
N(be, "outlets", ["grid"]), N(be, "targets", ["first", "prev", "next", "last", "pageInfo", "pageSize"]);
const Se = ["sum", "avg", "count", "min", "max"], Ci = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z"/></svg>', xi = '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z"/></svg>';
class vn extends q {
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
    }), this._columnsTab.innerHTML = Ci, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), i.appendChild(this._columnsTab), this.element.append(this._content, i);
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
    const n = new Set(i.getRowGroupColumns()), r = new Set(i.getPivotColumns()), o = new Map(i.getValueColumns().map((a) => [a.field, a.aggFunc]));
    for (const a of this._columns()) {
      const l = m("li", { class: "sg-column-list-item", draggable: "true" });
      l.dataset.field = a.field;
      const d = m("span", { class: "sg-column-grip", "aria-hidden": "true" });
      d.innerHTML = xi;
      const c = m("input", { type: "checkbox" });
      c.checked = !a.hidden, c.addEventListener("change", () => i.setColumnVisible(a.field, c.checked));
      const u = m("span", { class: "sg-column-list-label" }, a.headerName || a.field), p = m("span", { class: "sg-column-list-tags" });
      n.has(a.field) && p.appendChild(m("span", { class: "sg-tag sg-tag-group", title: "Row group" }, "group")), r.has(a.field) && p.appendChild(m("span", { class: "sg-tag sg-tag-pivot", title: "Pivot column" }, "pivot")), o.has(a.field) && p.appendChild(m("span", { class: "sg-tag sg-tag-value", title: `Value (${o.get(a.field)})` }, o.get(a.field))), l.append(d, c, u, p), this._wireDragSource(l, a.field), t.appendChild(l);
    }
    return this._wireDropZone(t, "columns"), e;
  }
  _renderDropSection({ title: i, placeholder: e, kind: t, fields: n }) {
    const r = m("div", { class: "sg-panel-section sg-panel-drop" });
    r.appendChild(m("div", { class: "sg-panel-section-title" }, i));
    const o = m("div", { class: "sg-drop-zone" });
    if (o.dataset.dropKind = t, !n.length)
      o.classList.add("sg-drop-zone-empty"), o.appendChild(m("span", { class: "sg-drop-placeholder" }, e));
    else
      for (const a of n) o.appendChild(this._renderChip(t, a));
    return this._wireDropZone(o, t), r.appendChild(o), r;
  }
  _renderValuesSection() {
    const i = this._api(), e = m("div", { class: "sg-panel-section sg-panel-drop" });
    e.appendChild(m("div", { class: "sg-panel-section-title" }, "Values"));
    const t = m("div", { class: "sg-drop-zone" });
    t.dataset.dropKind = "value";
    const n = i.getValueColumns();
    if (!n.length)
      t.classList.add("sg-drop-zone-empty"), t.appendChild(m("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
    else
      for (const { field: r, aggFunc: o } of n) t.appendChild(this._renderValueChip(r, o));
    return this._wireDropZone(t, "value"), e.appendChild(t), e;
  }
  _renderChip(i, e) {
    const t = this._colByField(e), n = m("span", { class: "sg-chip", draggable: "true" });
    return n.dataset.field = e, n.dataset.fromKind = i, n.append(
      m("span", { class: "sg-chip-label" }, t?.headerName || e),
      this._removeButton(() => this._removeFrom(i, e))
    ), this._wireDragSource(n, e), n;
  }
  _renderValueChip(i, e) {
    const t = this._api(), n = this._colByField(i), r = m("span", { class: "sg-chip sg-chip-value", draggable: "true" });
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
      m("span", { class: "sg-chip-label" }, n?.headerName || i),
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
function Si(s) {
  const i = s ?? xn.start();
  return i.register("grid", $e), i.register("header-cell", Ve), i.register("row", _n), i.register("cell", bn), i.register("filter", yn), i.register("pagination", be), i.register("side-panel", vn), i;
}
const Li = {
  start: Si,
  GridController: $e,
  HeaderCellController: Ve,
  RowController: _n,
  CellController: bn,
  FilterController: yn,
  PaginationController: be,
  SidePanelController: vn,
  registerRenderer: A,
  getRenderer: lt,
  listRenderers: rs,
  renderers: fi
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = Li);
export {
  bn as CellController,
  yn as FilterController,
  $e as GridController,
  Ve as HeaderCellController,
  be as PaginationController,
  _n as RowController,
  vn as SidePanelController,
  Li as default,
  lt as getRenderer,
  rs as listRenderers,
  A as registerRenderer,
  fi as renderers,
  Si as start
};
//# sourceMappingURL=stimulus_grid.esm.js.map
