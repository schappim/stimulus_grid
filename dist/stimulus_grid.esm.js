import { Application as e, Controller as t } from "@hotwired/stimulus";
//#region src/lib/model.js
function n(e, t) {
	return typeof t.valueGetter == "function" ? t.valueGetter(e) : e?.[t.field];
}
function r(e, t) {
	let r = n(e, t);
	return typeof t.valueFormatter == "function" ? t.valueFormatter(r, e) : r == null ? "" : t.type === "date" && r instanceof Date ? r.toLocaleDateString() : t.type === "boolean" ? r ? "✓" : "" : String(r);
}
var i = {
	contains: (e, t) => String(e ?? "").toLowerCase().includes(String(t ?? "").toLowerCase()),
	notContains: (e, t) => !String(e ?? "").toLowerCase().includes(String(t ?? "").toLowerCase()),
	equals: (e, t) => String(e ?? "").toLowerCase() === String(t ?? "").toLowerCase(),
	notEqual: (e, t) => String(e ?? "").toLowerCase() !== String(t ?? "").toLowerCase(),
	startsWith: (e, t) => String(e ?? "").toLowerCase().startsWith(String(t ?? "").toLowerCase()),
	endsWith: (e, t) => String(e ?? "").toLowerCase().endsWith(String(t ?? "").toLowerCase()),
	blank: (e) => e == null || e === "",
	notBlank: (e) => e != null && e !== ""
}, a = {
	equals: (e, t) => Number(e) === Number(t),
	notEqual: (e, t) => Number(e) !== Number(t),
	lessThan: (e, t) => Number(e) < Number(t),
	lessThanOrEqual: (e, t) => Number(e) <= Number(t),
	greaterThan: (e, t) => Number(e) > Number(t),
	greaterThanOrEqual: (e, t) => Number(e) >= Number(t),
	inRange: (e, t, n) => Number(e) >= Number(t) && Number(e) <= Number(n),
	blank: (e) => e == null || e === "",
	notBlank: (e) => e != null && e !== ""
};
function o(e) {
	if (e == null || e === "") return null;
	if (e instanceof Date) return e;
	let t = new Date(e);
	return Number.isNaN(t.valueOf()) ? null : t;
}
var s = {
	text: i,
	number: a,
	date: {
		equals: (e, t) => o(e)?.toDateString() === o(t)?.toDateString(),
		notEqual: (e, t) => o(e)?.toDateString() !== o(t)?.toDateString(),
		lessThan: (e, t) => (o(e)?.valueOf() ?? -Infinity) < (o(t)?.valueOf() ?? Infinity),
		greaterThan: (e, t) => (o(e)?.valueOf() ?? Infinity) > (o(t)?.valueOf() ?? -Infinity),
		inRange: (e, t, n) => {
			let r = o(e)?.valueOf();
			return r != null && r >= (o(t)?.valueOf() ?? -Infinity) && r <= (o(n)?.valueOf() ?? Infinity);
		},
		blank: (e) => e == null || e === "",
		notBlank: (e) => e != null && e !== ""
	},
	boolean: { equals: (e, t) => t === "true" ? !!e : t === "false" ? !e : !0 },
	set: { in: (e, t) => Array.isArray(t) && t.includes(String(e ?? "")) }
};
function c(e, t, r) {
	if (!r) return !0;
	let a = (s[r.filterType || t.filter || "text"] || i)[r.type];
	return a ? a(n(e, t), r.value, r.value2) : !0;
}
function l(e, t, n) {
	let r = Object.entries(t || {}).filter(([, e]) => e != null);
	return r.length === 0 ? e : e.filter((e) => e && e.__sgSeparator ? !0 : r.every(([t, r]) => {
		let i = n[t];
		return i ? c(e, i, r) : !0;
	}));
}
function u(e, t, n) {
	if (!t) return e;
	let i = String(t).toLowerCase();
	return e.filter((e) => {
		if (e && e.__sgSeparator) return !0;
		for (let t of n) {
			let n = r(e, t);
			if (n && String(n).toLowerCase().includes(i)) return !0;
		}
		return !1;
	});
}
function d(e, t, n) {
	return e == null && t == null ? 0 : e == null ? -1 : t == null ? 1 : n === "number" ? Number(e) - Number(t) : n === "date" ? (o(e)?.valueOf() ?? 0) - (o(t)?.valueOf() ?? 0) : n === "boolean" ? e === t ? 0 : e ? 1 : -1 : String(e).localeCompare(String(t), void 0, {
		numeric: !0,
		sensitivity: "base"
	});
}
function f(e, t, r) {
	if (!t || t.length === 0) return e;
	let i = (e, i) => {
		for (let { colId: a, sort: o } of t) {
			let t = r[a];
			if (!t) continue;
			let s = n(e, t), c = n(i, t), l = typeof t.comparator == "function" ? t.comparator(s, c, e, i) : d(s, c, t.type);
			if (l !== 0) return o === "desc" ? -l : l;
		}
		return 0;
	};
	if (!e.some((e) => e && e.__sgSeparator)) return e.slice().sort(i);
	let a = [], o = [], s = () => {
		if (o.length) {
			o.sort(i);
			for (let e of o) a.push(e);
			o = [];
		}
	};
	for (let t of e) t && t.__sgSeparator ? (s(), a.push(t)) : o.push(t);
	return s(), a;
}
function p(e, t) {
	if (!t || !t.enabled) return {
		rows: e,
		total: e.length,
		pageRows: e
	};
	let n = e.length, r = Math.max(1, Math.ceil(n / t.pageSize)), i = Math.min(t.page, r - 1), a = i * t.pageSize;
	return {
		rows: e,
		total: n,
		totalPages: r,
		page: i,
		pageRows: e.slice(a, a + t.pageSize)
	};
}
function m(e, t, r) {
	if (e === "count") return t.length;
	let i = t.map((e) => n(e, r));
	if (e === "first") return i.length ? i[0] : null;
	if (e === "last") return i.length ? i[i.length - 1] : null;
	let a = i.map(Number).filter((e) => !Number.isNaN(e));
	switch (e) {
		case "sum": return a.reduce((e, t) => e + t, 0);
		case "avg": return a.length ? a.reduce((e, t) => e + t, 0) / a.length : null;
		case "min": return a.length ? Math.min(...a) : null;
		case "max": return a.length ? Math.max(...a) : null;
		default: return null;
	}
}
function h(e, t, n) {
	let r = {};
	for (let [i, a] of Object.entries(t || {})) {
		let t = n[i];
		t && (r[i] = m(a, e, t));
	}
	return r;
}
function g(e) {
	let t = 0, n = 0, r = 0, i = Infinity, a = -Infinity;
	for (let o of e) {
		if (o == null || o === "") continue;
		t += 1;
		let e = null;
		if (typeof o == "number" && Number.isFinite(o)) e = o;
		else if (typeof o == "string" && o.trim() !== "") {
			let t = Number(o);
			Number.isFinite(t) && (e = t);
		}
		e != null && (n += 1, r += e, e < i && (i = e), e > a && (a = e));
	}
	return {
		count: t,
		sum: n ? r : null,
		avg: n ? r / n : null,
		min: n ? i : null,
		max: n ? a : null
	};
}
function _(e, t, r, i, a = () => !0) {
	let o = (e, a, s) => {
		let c = t[a], l = /* @__PURE__ */ new Map();
		for (let t of e) {
			let e = n(t, c), r = e == null ? "" : String(e);
			l.has(r) || l.set(r, {
				value: e,
				rows: []
			}), l.get(r).rows.push(t);
		}
		return Array.from(l.values()).sort((e, t) => d(e.value, t.value, c.type)).map(({ value: e, rows: n }) => {
			let l = e == null ? "" : String(e), u = s ? `${s}|${c.field}=${l}` : `${c.field}=${l}`;
			return {
				__sgGroup: !0,
				level: a,
				field: c.field,
				value: e,
				groupId: u,
				count: n.length,
				aggregates: h(n, i, r),
				leaves: n,
				children: a + 1 < t.length ? o(n, a + 1, u) : null
			};
		});
	}, s = o(e, 0, ""), c = [], l = (e) => {
		for (let t of e) if (c.push(t), a(t.groupId, t.level)) if (t.children) l(t.children);
		else for (let e of t.leaves) c.push(e);
	};
	return l(s), {
		displayList: c,
		tree: s
	};
}
function v(e, t, n) {
	return `__p|${n.map((t) => {
		let n = e[t.field];
		return `${t.field}=${n == null ? "" : String(n)}`;
	}).join("|")}|${t.col.field}:${t.aggFunc}`;
}
function y(e, t) {
	return t.map((t) => {
		let r = n(e, t);
		return r == null ? "" : String(r);
	}).join("");
}
function b(e, t) {
	if (!t?.length) return [];
	let r = /* @__PURE__ */ new Map();
	for (let i of e) {
		let e = y(i, t);
		if (!r.has(e)) {
			let a = {};
			t.forEach((e) => {
				let t = n(i, e);
				a[e.field] = t ?? null;
			}), r.set(e, a);
		}
	}
	return Array.from(r.values()).sort((e, n) => {
		for (let r of t) {
			let t = d(e[r.field], n[r.field], r.type);
			if (t !== 0) return t;
		}
		return 0;
	});
}
function x(e, t, n) {
	if (!e.length || !t.length) return [];
	let r = [], i = t.length === 1;
	for (let a of e) for (let e of t) {
		let t = v(a, e, n), o = n.map((e) => a[e.field] == null ? "(Blank)" : String(a[e.field])).join(" · "), s = i ? o : `${o} · ${e.aggFunc}(${e.col.field})`;
		r.push({
			field: t,
			headerName: s,
			type: "number",
			width: 100,
			sortable: !0,
			filter: null,
			resizable: !1,
			_isPivot: !0,
			pivotKeys: { ...a },
			valueField: e.col.field,
			aggFunc: e.aggFunc,
			valueGetter: (e) => e?.__pivotValues?.[t] ?? null
		});
	}
	return r;
}
function S(e) {
	return typeof e == "string" && e.startsWith("__p|");
}
function C(e, t) {
	let n = Array.isArray(e) ? e.filter((e) => e && e.colId && e.sort) : [];
	return (e, r) => {
		for (let i of n) {
			let n = i.sort === "desc" ? -1 : 1;
			if (S(i.colId)) {
				let t = d(e.__pivotValues ? e.__pivotValues[i.colId] : null, r.__pivotValues ? r.__pivotValues[i.colId] : null, "number");
				if (t !== 0) return n * t;
				continue;
			}
			if (t && i.colId === t.field) {
				let i = d(e.value, r.value, t.type);
				if (i !== 0) return n * i;
				continue;
			}
		}
		return d(e.value, r.value, t?.type);
	};
}
function w(e, t, n, r) {
	let i = {}, a = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = y(t, r);
		a.has(e) || a.set(e, []), a.get(e).push(t);
	}
	for (let e of t) {
		let t = r.map((t) => {
			let n = e[t.field];
			return n == null ? "" : String(n);
		}).join(""), o = a.get(t) || [];
		for (let t of n) {
			let n = v(e, t, r);
			i[n] = o.length ? m(t.aggFunc, o, t.col) : null;
		}
	}
	return i;
}
function T({ rows: e, rowGroupCols: t = [], pivotCols: r, valueConfigs: i, isExpanded: a = () => !0, sortModel: o = [] }) {
	let s = b(e, r), c = x(s, i, r), l = {
		__sgGroup: !0,
		__pivotAll: !0,
		level: -1,
		field: null,
		value: "(All)",
		groupId: "__pivotAll",
		count: e.length,
		aggregates: {},
		leaves: e,
		__pivotValues: w(e, s, i, r)
	};
	if (!t.length) return {
		columns: c,
		displayList: [l],
		tree: [],
		combos: s
	};
	let u = (e, a, c) => {
		let l = t[a], d = /* @__PURE__ */ new Map();
		for (let t of e) {
			let e = n(t, l), r = e == null ? "" : String(e);
			d.has(r) || d.set(r, {
				value: e,
				rows: []
			}), d.get(r).rows.push(t);
		}
		let f = Array.from(d.values()).map(({ value: e, rows: n }) => {
			let o = e == null ? "" : String(e), d = c ? `${c}|${l.field}=${o}` : `${l.field}=${o}`;
			return {
				__sgGroup: !0,
				level: a,
				field: l.field,
				value: e,
				groupId: d,
				count: n.length,
				aggregates: {},
				leaves: n,
				__pivotValues: w(n, s, i, r),
				children: a + 1 < t.length ? u(n, a + 1, d) : null
			};
		}), p = C(o, l);
		return f.sort(p);
	}, d = u(e, 0, ""), f = [l], p = (e) => {
		for (let t of e) f.push(t), a(t.groupId, t.level) && t.children && p(t.children);
	};
	return p(d), {
		columns: c,
		displayList: f,
		tree: d,
		combos: s
	};
}
function ee(e, { pivotCols: t = [], valueConfigs: n = [], columnGroups: r = null } = {}) {
	if (e._isPivot && t.length && e.pivotKeys) return te(e, t, n);
	if (r && Array.isArray(r) && r.length && !e._isGroupCol && !e._isCheckbox && !e._isRowNumber) {
		for (let t of r) if (t?.children && t.children.includes(e.field)) return [{
			kind: "group",
			id: `g:${t.headerName}`,
			label: t.headerName
		}, {
			kind: "leaf",
			col: e
		}];
	}
	return [{
		kind: "leaf",
		col: e
	}];
}
function te(e, t, n) {
	let r = (n?.length || 0) > 1, i = [];
	for (let n = 0; n < t.length; n++) {
		let a = t[n].field, o = e.pivotKeys[a];
		if (n === t.length - 1 && !r) return i.push({
			kind: "leaf",
			col: e,
			label: o == null ? "(Blank)" : String(o)
		}), i;
		i.push({
			kind: "group",
			id: `p:${n}:${o == null ? "" : String(o)}`,
			label: o == null ? "(Blank)" : String(o)
		});
	}
	return i.push({
		kind: "leaf",
		col: e,
		label: `${e.aggFunc}(${e.valueField})`
	}), i;
}
function ne(e, t = {}) {
	if (!e.length) return {
		rows: [[]],
		depth: 1
	};
	let n = e.map((e) => ee(e, t).slice()), r = Math.max(1, ...n.map((e) => e.length)), i = [];
	for (let e = 0; e < r; e++) {
		let t = [], a = 0;
		for (; a < n.length;) {
			let i = n[a];
			if (e >= i.length || i[e] === null) {
				a += 1;
				continue;
			}
			let o = i[e];
			if (o.kind === "leaf") {
				t.push({
					kind: "leaf",
					col: o.col,
					label: o.label,
					rowspan: r - e,
					colspan: 1
				});
				for (let t = e + 1; t < r; t++) i[t] = null;
				a += 1;
				continue;
			}
			let s = a + 1;
			for (; s < n.length;) {
				let t = n[s];
				if (e >= t.length || !t[e] || t[e].kind !== "group" || t[e].id !== o.id) break;
				let r = !0;
				for (let n = 0; n < e; n++) if ((i[n]?.id ?? null) !== (t[n]?.id ?? null)) {
					r = !1;
					break;
				}
				if (!r) break;
				s += 1;
			}
			t.push({
				kind: "group",
				label: o.label,
				colspan: s - a,
				rowspan: 1
			}), a = s;
		}
		i.push(t);
	}
	return {
		rows: i,
		depth: r
	};
}
function re({ rows: e, parentField: t = "parent_id", getRowId: n = (e) => e?.id, passesFilter: r = null, siblingComparator: i = null, isExpanded: a = () => !0 } = {}) {
	if (!Array.isArray(e) || e.length === 0) return {
		displayList: [],
		treeMeta: /* @__PURE__ */ new Map()
	};
	let o = (e) => {
		let t = n(e);
		return t == null ? null : String(t);
	}, s = /* @__PURE__ */ new Map();
	for (let t of e) {
		let e = o(t);
		e != null && s.set(e, t);
	}
	let c = /* @__PURE__ */ new Map(), l = [];
	for (let n of e) {
		let e = o(n), r = n?.[t], i = r == null ? null : String(r);
		i == null || i === e || !s.has(i) ? l.push(n) : (c.has(i) || c.set(i, []), c.get(i).push(n));
	}
	let u = r ? new Map(e.map((e) => [o(e), !!r(e)])) : null, d = /* @__PURE__ */ new Map(), f = (e, t) => {
		let n = o(e);
		if (n == null) return !1;
		if (d.has(n)) return d.get(n);
		if (t.has(n)) return !1;
		t.add(n);
		let r = !!u.get(n), i = c.get(n) || [];
		for (let e of i) r = f(e, t) || r;
		return t.delete(n), d.set(n, r), r;
	};
	if (u) for (let e of l) f(e, /* @__PURE__ */ new Set());
	let p = [], m = /* @__PURE__ */ new Map(), h = (e, t, n, r) => {
		let s = u ? e.filter((e) => r || d.get(o(e))) : e.slice();
		i && s.sort(i);
		for (let e of s) {
			let i = o(e);
			if (i == null || n.has(i)) continue;
			let s = c.get(i) || [], l = r || (u ? !!u.get(i) : !1), f = u ? s.filter((e) => l || d.get(o(e))) : s, g = f.length > 0, _ = g && (u ? !0 : !!a(i, t));
			m.set(i, {
				level: t,
				hasChildren: g,
				expanded: _
			}), p.push(e), _ && (n.add(i), h(f, t + 1, n, l), n.delete(i));
		}
	};
	return h(l, 0, /* @__PURE__ */ new Set(), !1), {
		displayList: p,
		treeMeta: m
	};
}
function ie(e) {
	if (e.serverSide) {
		let t = e.rowData, n = e.pagination?.pageSize || t.length || 1, r = e.serverRowCount ?? t.length, i = Math.max(1, Math.ceil(r / n));
		return {
			filteredSorted: t,
			rows: t,
			total: r,
			totalPages: i,
			page: Math.min(e.pagination?.page || 0, i - 1),
			pageRows: t
		};
	}
	let t = Object.fromEntries(e.columnDefs.map((e) => [e.field, e])), i = e.columnDefs.filter((e) => !e.hidden && !e._isCheckbox), a = (e.rowGroupCols || []).filter((e) => t[e]);
	if (e.treeData && !e.pivotMode && a.length === 0) {
		let a = e.treeParentField || "parent_id", o = Object.entries(e.filterModel || {}).filter(([, e]) => e != null), s = e.quickFilter ? String(e.quickFilter).toLowerCase() : "", l = o.length > 0 || s !== "" ? (e) => {
			for (let [n, r] of o) {
				let i = t[n];
				if (i && !c(e, i, r)) return !1;
			}
			if (s) {
				let t = !1;
				for (let n of i) {
					let i = r(e, n);
					if (i && String(i).toLowerCase().includes(s)) {
						t = !0;
						break;
					}
				}
				if (!t) return !1;
			}
			return !0;
		} : null, u = Array.isArray(e.sortModel) ? e.sortModel : [], f = u.length ? (e, r) => {
			for (let { colId: i, sort: a } of u) {
				let o = t[i];
				if (!o) continue;
				let s = n(e, o), c = n(r, o), l = typeof o.comparator == "function" ? o.comparator(s, c, e, r) : d(s, c, o.type);
				if (l !== 0) return a === "desc" ? -l : l;
			}
			return 0;
		} : null, m = e.getRowId || ((e) => e?.id), { displayList: h, treeMeta: g } = re({
			rows: e.rowData,
			parentField: a,
			getRowId: m,
			passesFilter: l,
			siblingComparator: f,
			isExpanded: e.isTreeRowExpanded || (() => !0)
		});
		return {
			tree: !0,
			treeData: !0,
			treeMeta: g,
			treeParentField: a,
			filteredSorted: h,
			...p(h, e.pagination)
		};
	}
	let o = e.rowData;
	o = l(o, e.filterModel, t), o = u(o, e.quickFilter, i), o = f(o, e.sortModel, t);
	let s = a, m = e.pivotMode ? (e.pivotCols || []).filter((e) => t[e]) : [], g = e.pivotMode ? Object.entries(e.aggModel || {}).filter(([e]) => t[e]).map(([e, n]) => ({
		col: t[e],
		aggFunc: n
	})) : [];
	if (e.pivotMode && m.length && g.length) {
		let n = s.map((e) => t[e]), r = m.map((e) => t[e]), { columns: i, displayList: a, tree: c, combos: l } = T({
			rows: o,
			rowGroupCols: n,
			pivotCols: r,
			valueConfigs: g,
			isExpanded: e.isGroupExpanded,
			sortModel: e.sortModel
		}), u = p(a, e.pagination);
		return {
			pivot: !0,
			pivotResultColumns: i,
			combos: l,
			grouped: !0,
			tree: c,
			leafCount: o.length,
			grandTotals: h(o, e.aggModel, t),
			filteredSorted: a,
			...u
		};
	}
	if (s.length) {
		let n = s.map((e) => t[e]), { displayList: r, tree: i } = _(o, n, t, e.aggModel, e.isGroupExpanded), a = p(r, e.pagination);
		return {
			grouped: !0,
			tree: i,
			leafCount: o.length,
			grandTotals: h(o, e.aggModel, t),
			filteredSorted: r,
			...a
		};
	}
	let v = p(o, e.pagination), y = e.aggModel && Object.keys(e.aggModel).length ? h(o, e.aggModel, t) : null;
	return {
		filteredSorted: o,
		grandTotals: y,
		...v
	};
}
function ae(e, t, n, r, i = 6) {
	let a = Math.ceil(t / n), o = Math.max(0, Math.floor(e / n) - i);
	return {
		first: o,
		last: Math.min(r, o + a + i * 2)
	};
}
//#endregion
//#region src/lib/api.js
function oe(e) {
	return {
		setRowData(t) {
			e.setRowData(t);
		},
		getRowData() {
			return e.state.rowData.slice();
		},
		applyTransaction(t) {
			return e.applyTransaction(t);
		},
		setRowCount(t) {
			e.setRowCount(t);
		},
		getRowCount() {
			return e.state.serverSide ? e.state.serverRowCount : e.state.rowData.length;
		},
		isServerSide() {
			return !!e.state.serverSide;
		},
		setColumnDefs(t) {
			e.setColumnDefs(t);
		},
		getColumnDefs() {
			return e.state.columnDefs.slice();
		},
		setColumnVisible(t, n) {
			e.setColumnVisible(t, n);
		},
		setColumnPinned(t, n) {
			e.setColumnPinned(t, n);
		},
		setColumnWidth(t, n) {
			e.setColumnWidth(t, n);
		},
		moveColumn(t, n) {
			e.moveColumn(t, n);
		},
		autoSizeColumn(t) {
			e.autoSizeColumn(t);
		},
		autoSizeAllColumns() {
			e.state.columnDefs.forEach((t) => e.autoSizeColumn(t.field));
		},
		sizeColumnsToFit() {
			e.sizeColumnsToFit();
		},
		setSortModel(t) {
			e.setSortModel(t);
		},
		getSortModel() {
			return e.state.sortModel.slice();
		},
		setFilterModel(t) {
			e.setFilterModel(t);
		},
		getFilterModel() {
			return { ...e.state.filterModel };
		},
		setColumnFilter(t, n) {
			e.setColumnFilter(t, n);
		},
		destroyFilter(t) {
			e.setColumnFilter(t, null);
		},
		setQuickFilter(t) {
			e.setQuickFilter(t);
		},
		getQuickFilter() {
			return e.getQuickFilter();
		},
		selectAll() {
			e.selectAll();
		},
		deselectAll() {
			e.deselectAll();
		},
		selectRow(t) {
			e.setSelected(t, !0);
		},
		deselectRow(t) {
			e.setSelected(t, !1);
		},
		getSelectedRows() {
			return e.getSelectedRows();
		},
		getSelectedRowIds() {
			return Array.from(e.state.selection);
		},
		paginationGoToPage(t) {
			e.goToPage(t);
		},
		paginationGoToFirstPage() {
			e.goToPage(0);
		},
		paginationGoToNextPage() {
			e.goToPage(e.state.pagination.page + 1);
		},
		paginationGoToPreviousPage() {
			e.goToPage(e.state.pagination.page - 1);
		},
		paginationGoToLastPage() {
			e.goToPage(e.lastPageIndex());
		},
		paginationSetPageSize(t) {
			e.setPageSize(t);
		},
		paginationGetCurrentPage() {
			return e.state.pagination.page;
		},
		paginationGetTotalPages() {
			return e.totalPages();
		},
		paginationGetRowCount() {
			return e.filteredCount();
		},
		paginationGetPageSize() {
			return e.state.pagination.pageSize;
		},
		paginationIsEnabled() {
			return e.state.pagination.enabled;
		},
		getCellSelection() {
			return e.getCellSelectionDetail();
		},
		getCellRangeValues() {
			return e._cellRangeRows();
		},
		getCellSelectionRowIds() {
			return e.getCellSelectionRowIds();
		},
		getRangeAggregates() {
			return e.getRangeAggregates();
		},
		startEditingCell({ rowId: t, colId: n }) {
			e.startEditingCell(t, n);
		},
		stopEditing(t = !1) {
			e.stopEditing(t);
		},
		setRowGroupColumns(t) {
			e.setRowGroupColumns(t);
		},
		addRowGroupColumn(t) {
			e.addRowGroupColumn(t);
		},
		removeRowGroupColumn(t) {
			e.removeRowGroupColumn(t);
		},
		getRowGroupColumns() {
			return e.getRowGroupColumns();
		},
		setColumnAggFunc(t, n) {
			e.setColumnAggFunc(t, n);
		},
		expandAll() {
			e.expandAll();
		},
		collapseAll() {
			e.collapseAll();
		},
		toggleGroup(t, n) {
			e.toggleGroup(t, n);
		},
		setPivotMode(t) {
			e.setPivotMode(t);
		},
		isPivotMode() {
			return e.isPivotMode();
		},
		setPivotColumns(t) {
			e.setPivotColumns(t);
		},
		addPivotColumn(t) {
			e.addPivotColumn(t);
		},
		removePivotColumn(t) {
			e.removePivotColumn(t);
		},
		getPivotColumns() {
			return e.getPivotColumns();
		},
		getPivotResultColumns() {
			return (e._displayList?.pivotResultColumns || []).map((e) => ({
				field: e.field,
				headerName: e.headerName,
				pivotKeys: { ...e.pivotKeys || {} },
				valueField: e.valueField,
				aggFunc: e.aggFunc
			}));
		},
		setValueColumns(t) {
			e.setValueColumns(t);
		},
		addValueColumn(t, n = "sum") {
			e.addValueColumn(t, n);
		},
		removeValueColumn(t) {
			e.removeValueColumn(t);
		},
		getValueColumns() {
			return e.getValueColumns();
		},
		setColumnGroups(t) {
			e.setColumnGroups(t);
		},
		getColumnGroups() {
			return e.getColumnGroups();
		},
		setPinnedBottomRow(t) {
			e.setPinnedBottomRow(t);
		},
		isPinnedBottomRow() {
			return e.isPinnedBottomRow();
		},
		setTreeData(t) {
			e.setTreeData(t);
		},
		isTreeData() {
			return e.isTreeData();
		},
		setTreeParentField(t) {
			e.setTreeParentField(t);
		},
		expandTreeRow(t) {
			e.expandTreeRow(t);
		},
		collapseTreeRow(t) {
			e.collapseTreeRow(t);
		},
		toggleTreeRow(t) {
			e.toggleTreeRow(t);
		},
		expandAllTreeRows() {
			e.expandAllTreeRows();
		},
		collapseAllTreeRows() {
			e.collapseAllTreeRows();
		},
		getTreeExpandedRowIds() {
			return e.getTreeExpandedRowIds();
		},
		setMasterDetail(t) {
			e.setMasterDetail(t);
		},
		isMasterDetail() {
			return e.isMasterDetail();
		},
		expandDetailRow(t) {
			e.expandDetailRow(t);
		},
		collapseDetailRow(t) {
			e.collapseDetailRow(t);
		},
		toggleDetailRow(t) {
			e.toggleDetailRow(t);
		},
		expandAllDetails() {
			e.expandAllDetails();
		},
		collapseAllDetails() {
			e.collapseAllDetails();
		},
		getDetailExpandedRowIds() {
			return e.getDetailExpandedRowIds();
		},
		getColumnState() {
			return e.getColumnState();
		},
		applyColumnState(t) {
			e.applyColumnState(t);
		},
		clearPersistedState() {
			e.clearPersistedState();
		},
		getPersistKey() {
			return e.persistKeyValue || "";
		},
		getDataAsCsv(t = {}) {
			return e.getDataAsCsv(t);
		},
		exportDataAsCsv(t = {}) {
			return e.exportDataAsCsv(t);
		},
		refreshCells(t = {}) {
			e.refresh(t);
		},
		redrawRows(t = {}) {
			e.refresh(t);
		},
		addEventListener(t, n) {
			e.element.addEventListener(t, n);
		},
		removeEventListener(t, n) {
			e.element.removeEventListener(t, n);
		}
	};
}
//#endregion
//#region src/lib/dom.js
function E(e, t = {}, n = []) {
	let r = document.createElement(e);
	for (let [e, n] of Object.entries(t)) n === !1 || n == null || (e === "class" ? r.className = n : e === "style" && typeof n == "object" ? Object.assign(r.style, n) : e.startsWith("on") && typeof n == "function" ? r.addEventListener(e.slice(2).toLowerCase(), n) : n === !0 ? r.setAttribute(e, "") : r.setAttribute(e, String(n)));
	for (let e of [].concat(n)) e == null || e === !1 || r.appendChild(typeof e == "string" ? document.createTextNode(e) : e);
	return r;
}
function se(e, t) {
	for (let [n, r] of Object.entries(t)) r == null || r === !1 ? e.removeAttribute(n) : r === !0 ? e.setAttribute(n, "") : e.setAttribute(n, String(r));
}
function ce(e) {
	let t = document.getElementById(e);
	return !t || t.tagName !== "TEMPLATE" ? null : t.content.firstElementChild.cloneNode(!0);
}
function D(e, t, n) {
	e.dispatchEvent(new CustomEvent(t, {
		detail: n,
		bubbles: !0
	}));
}
function le(e, t, n) {
	let r = e.parentElement;
	for (; r;) {
		if ((r.getAttribute("data-controller") || "").split(/\s+/).includes(t)) {
			let e = n.getControllerForElementAndIdentifier(r, t);
			if (e) return e;
		}
		r = r.parentElement;
	}
	return null;
}
//#endregion
//#region src/lib/qr.js
var ue = [
	[
		16,
		10,
		1
	],
	[
		28,
		16,
		1
	],
	[
		44,
		26,
		1
	],
	[
		64,
		18,
		2
	],
	[
		86,
		24,
		2
	],
	[
		108,
		16,
		4
	],
	[
		124,
		18,
		4
	],
	[
		154,
		22,
		4
	],
	[
		182,
		22,
		5
	],
	[
		216,
		26,
		5
	]
], de = [
	21522,
	20773,
	24188,
	23371,
	17913,
	16590,
	20375,
	19104
], fe = /* @__PURE__ */ new Uint8Array(512), pe = /* @__PURE__ */ new Uint8Array(256);
(function() {
	let e = 1;
	for (let t = 0; t < 255; t++) fe[t] = e, pe[e] = t, e <<= 1, e & 256 && (e ^= 285);
	for (let e = 255; e < 512; e++) fe[e] = fe[e - 255];
})();
function me(e, t) {
	return e === 0 || t === 0 ? 0 : fe[pe[e] + pe[t]];
}
function he(e) {
	let t = new Uint8Array(e);
	t[e - 1] = 1;
	let n = 1;
	for (let r = 0; r < e; r++) {
		for (let r = 0; r < e; r++) t[r] = me(t[r], n), r + 1 < e && (t[r] ^= t[r + 1]);
		n = me(n, 2);
	}
	return t;
}
function ge(e, t) {
	let n = new Uint8Array(t.length);
	for (let r of e) {
		let e = r ^ n[0];
		n.copyWithin(0, 1), n[n.length - 1] = 0;
		for (let r = 0; r < t.length; r++) n[r] ^= me(t[r], e);
	}
	return n;
}
var _e = class {
	constructor() {
		this.bits = [];
	}
	append(e, t) {
		for (let n = t - 1; n >= 0; n--) this.bits.push(e >>> n & 1);
	}
	toBytes() {
		for (; this.bits.length % 8 != 0;) this.bits.push(0);
		let e = new Uint8Array(this.bits.length / 8);
		for (let t = 0; t < e.length; t++) {
			let n = 0;
			for (let e = 0; e < 8; e++) n = n << 1 | this.bits[t * 8 + e];
			e[t] = n;
		}
		return e;
	}
};
function ve(e) {
	let t = new TextEncoder().encode(String(e)), n = 0;
	for (let e = 1; e <= 10; e++) if (4 + (e < 10 ? 8 : 16) + t.length * 8 <= ue[e - 1][0] * 8) {
		n = e;
		break;
	}
	if (n === 0) throw Error(`qr: data too long for v10 ECC=M (${t.length} bytes; max 213)`);
	let [r, i, a] = ue[n - 1], o = new _e();
	o.append(4, 4), o.append(t.length, n < 10 ? 8 : 16);
	for (let e of t) o.append(e, 8);
	let s = r * 8;
	o.append(0, Math.min(4, Math.max(0, s - o.bits.length)));
	let c = o.toBytes(), l = new Uint8Array(r);
	l.set(c);
	let u = [236, 17];
	for (let e = c.length; e < r; e++) l[e] = u[(e - c.length) % 2];
	let d = Math.floor(r / a), f = r - d * a, p = [], m = he(i), h = 0;
	for (let e = 0; e < a; e++) {
		let t = e < a - f ? d : d + 1, n = l.slice(h, h + t);
		h += t, p.push({
			data: n,
			ecc: ge(n, m)
		});
	}
	let g = [], _ = d + 1;
	for (let e = 0; e < _; e++) for (let t of p) e < t.data.length && g.push(t.data[e]);
	for (let e = 0; e < i; e++) for (let t of p) g.push(t.ecc[e]);
	let v = 17 + n * 4, y = new Uint8Array(v * v), b = new Uint8Array(v * v);
	ye(y, b, v), be(y, b, v), Se(y, b, v, n), n >= 7 && Ce(y, b, v, n), Te(y, b, v, g);
	let x = 0, S = Infinity, C = new Uint8Array(y);
	for (let e = 0; e < 8; e++) {
		C.set(y), Ee(C, b, v, e), we(C, v, e);
		let t = De(C, v);
		t < S && (S = t, x = e);
	}
	return Ee(y, b, v, x), we(y, v, x), {
		size: v,
		matrix: y
	};
}
function O(e, t, n, r, i) {
	e[r * t + n] = +!!i;
}
function ye(e, t, n) {
	let r = [
		[0, 0],
		[n - 7, 0],
		[0, n - 7]
	];
	for (let [i, a] of r) for (let r = -1; r <= 7; r++) for (let o = -1; o <= 7; o++) {
		let s = i + o, c = a + r;
		s < 0 || c < 0 || s >= n || c >= n || (O(e, n, s, c, o >= 0 && o < 7 && r >= 0 && r < 7 && (o === 0 || o === 6 || r === 0 || r === 6 || o >= 2 && o <= 4 && r >= 2 && r <= 4)), t[c * n + s] = 1);
	}
	for (let e = 0; e < 9; e++) t[e * n + 8] = 1, t[8 * n + e] = 1;
	for (let e = 0; e < 8; e++) t[(n - 1 - e) * n + 8] = 1, t[8 * n + (n - 1 - e)] = 1;
	O(e, n, 8, n - 8, 1), t[(n - 8) * n + 8] = 1;
}
function be(e, t, n) {
	for (let r = 8; r < n - 8; r++) O(e, n, r, 6, r % 2 == 0), O(e, n, 6, r, r % 2 == 0), t[6 * n + r] = 1, t[r * n + 6] = 1;
}
var xe = [
	null,
	[],
	[6, 18],
	[6, 22],
	[6, 26],
	[6, 30],
	[6, 34],
	[
		6,
		22,
		38
	],
	[
		6,
		24,
		42
	],
	[
		6,
		26,
		46
	],
	[
		6,
		28,
		50
	]
];
function Se(e, t, n, r) {
	let i = xe[r];
	if (i) {
		for (let r of i) for (let a of i) if (!(a === 6 && r === 6 || a === n - 7 && r === 6 || a === 6 && r === n - 7)) for (let i = -2; i <= 2; i++) for (let o = -2; o <= 2; o++) {
			let s = Math.max(Math.abs(o), Math.abs(i)) !== 1;
			O(e, n, a + o, r + i, s), t[(r + i) * n + (a + o)] = 1;
		}
	}
}
function Ce(e, t, n, r) {
	let i = r, a = i;
	for (let e = 0; e < 12; e++) a = a << 1 ^ (a >>> 11) * 7973;
	let o = i << 12 | a;
	for (let r = 0; r < 18; r++) {
		let i = o >>> r & 1, a = Math.floor(r / 3), s = r % 3 + n - 11;
		O(e, n, a, s, i), t[s * n + a] = 1, O(e, n, s, a, i), t[a * n + s] = 1;
	}
}
function we(e, t, n) {
	let r = de[n];
	for (let n = 0; n < 15; n++) {
		let i = (r >>> n & 1) == 1;
		n < 6 ? O(e, t, 8, n, i) : n < 8 ? O(e, t, 8, n + 1, i) : n < 9 ? O(e, t, 7, 8, i) : O(e, t, 14 - n, 8, i), n < 8 ? O(e, t, t - 1 - n, 8, i) : O(e, t, 8, t - 15 + n, i);
	}
	O(e, t, 8, t - 8, 1);
}
function Te(e, t, n, r) {
	let i = 0, a = -1;
	for (let o = n - 1; o > 0; o -= 2) {
		o === 6 && o--;
		for (let s = 0; s < n; s++) {
			let c = a < 0 ? n - 1 - s : s;
			for (let a = 0; a < 2; a++) {
				let s = o - a;
				if (t[c * n + s]) continue;
				let l = i < r.length * 8 ? r[i >>> 3] >>> 7 - (i & 7) & 1 : 0;
				e[c * n + s] = l, i++;
			}
		}
		a = -a;
	}
}
function Ee(e, t, n, r) {
	for (let i = 0; i < n; i++) for (let a = 0; a < n; a++) {
		if (t[i * n + a]) continue;
		let o = !1;
		switch (r) {
			case 0:
				o = (a + i & 1) == 0;
				break;
			case 1:
				o = (i & 1) == 0;
				break;
			case 2:
				o = a % 3 == 0;
				break;
			case 3:
				o = (a + i) % 3 == 0;
				break;
			case 4:
				o = (Math.floor(i / 2) + Math.floor(a / 3) & 1) == 0;
				break;
			case 5:
				o = a * i % 2 + a * i % 3 == 0;
				break;
			case 6:
				o = (a * i % 2 + a * i % 3 & 1) == 0;
				break;
			case 7:
				o = ((a + i) % 2 + a * i % 3 & 1) == 0;
				break;
		}
		o && (e[i * n + a] ^= 1);
	}
}
function De(e, t) {
	let n = 0;
	for (let r = 0; r < t; r++) {
		let i = 1, a = -1;
		for (let o = 0; o < t; o++) {
			let s = e[r * t + o];
			s === a ? (i++, i === 5 ? n += 3 : i > 5 && (n += 1)) : (a = s, i = 1);
		}
	}
	for (let r = 0; r < t; r++) {
		let i = 1, a = -1;
		for (let o = 0; o < t; o++) {
			let s = e[o * t + r];
			s === a ? (i++, i === 5 ? n += 3 : i > 5 && (n += 1)) : (a = s, i = 1);
		}
	}
	for (let r = 0; r < t - 1; r++) for (let i = 0; i < t - 1; i++) {
		let a = e[r * t + i];
		e[r * t + i + 1] === a && e[(r + 1) * t + i] === a && e[(r + 1) * t + i + 1] === a && (n += 3);
	}
	return n;
}
function Oe({ size: e, matrix: t }, n = {}) {
	let { moduleSize: r = 4, margin: i = 2, background: a = "#fff", foreground: o = "#111827" } = n, s = (e + i * 2) * r, c = "";
	for (let n = 0; n < e; n++) for (let a = 0; a < e; a++) if (t[n * e + a]) {
		let e = (a + i) * r, t = (n + i) * r;
		c += `M${e},${t}h${r}v${r}h-${r}z`;
	}
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${s}" width="${s}" height="${s}" shape-rendering="crispEdges" aria-hidden="true"><rect width="${s}" height="${s}" fill="${a}"/><path d="${c}" fill="${o}"/></svg>`;
}
//#endregion
//#region src/lib/renderers.js
var ke = "<svg viewBox=\"0 0 640 640\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.1 297.4z\"/></svg>", Ae = /* @__PURE__ */ new Map();
function k(e, t) {
	if (typeof e != "string" || !e) throw Error("registerRenderer: name must be a non-empty string");
	if (typeof t != "function") throw Error("registerRenderer: fn must be a function");
	Ae.set(e, t);
}
function A(e) {
	return Ae.get(e) || null;
}
function je() {
	return Array.from(Ae.keys());
}
function Me(e, { copy: t, parse: n } = {}) {
	return typeof t == "function" && (e.copyValue = t), typeof n == "function" && (e.parseValue = n), e;
}
var Ne = /* @__PURE__ */ new Set([
	"1",
	"true",
	"t",
	"yes",
	"y",
	"on",
	"✓",
	"checked"
]), Pe = /* @__PURE__ */ new Set([
	"0",
	"false",
	"f",
	"no",
	"n",
	"off",
	"✗",
	"unchecked",
	"-",
	"—"
]);
function Fe(e, t) {
	let n = String(e ?? "");
	if (n === "") return "";
	switch (t?.type) {
		case "number": {
			let e = n.replace(/[,$£€¥\s]/g, "").replace(/%$/, ""), t = Number(e);
			return Number.isFinite(t) ? t : void 0;
		}
		case "boolean": {
			let e = n.trim().toLowerCase();
			return Ne.has(e) ? !0 : Pe.has(e) ? !1 : void 0;
		}
		case "date": {
			let e = new Date(n);
			return Number.isNaN(e.valueOf()) ? void 0 : n;
		}
		default: return n;
	}
}
function Ie(e, t, n) {
	return n != null && n !== "" ? n : e == null ? "" : String(e);
}
function Le(e) {
	if (e == null || e === "") return;
	let t = String(e).replace(/[,$£€¥\s]/g, "").replace(/%$/, "");
	if (t === "" || t === "-" || t === ".") return;
	let n = Number(t);
	return Number.isFinite(n) ? n : void 0;
}
function Re(e) {
	let t = String(e ?? "").trim().toLowerCase();
	if (t !== "") {
		if (Ne.has(t)) return !0;
		if (Pe.has(t)) return !1;
	}
}
function j(e, t = {}, n = null) {
	let r = document.createElement(e);
	for (let [e, n] of Object.entries(t)) n == null || n === !1 || (e === "class" ? r.className = n : r.setAttribute(e, n === !0 ? "" : String(n)));
	return n == null || (Array.isArray(n) ? n.forEach((e) => r.append(e)) : typeof n == "string" ? r.innerHTML = n : r.append(n)), r;
}
var M = (e) => e == null || e === "", ze = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function Be() {
	return ({ value: e }) => {
		if (M(e)) return "";
		let t = String(e);
		return ze.test(t) ? j("a", {
			class: "sg-renderer-link",
			href: `mailto:${t}`,
			title: "Send email"
		}, document.createTextNode(t)) : j("span", {
			class: "sg-renderer-invalid",
			title: "Invalid email"
		}, document.createTextNode(t));
	};
}
function Ve({ newTab: e = !0 } = {}) {
	return ({ value: t }) => {
		if (M(t)) return "";
		let n = String(t), r;
		try {
			r = new URL(n);
		} catch {
			return document.createTextNode(n);
		}
		return j("a", {
			class: "sg-renderer-link",
			href: n,
			target: e ? "_blank" : null,
			rel: e ? "noopener noreferrer" : null,
			title: n
		}, document.createTextNode(r.hostname + (r.pathname === "/" ? "" : r.pathname)));
	};
}
function He({ defaultRegion: e = "AU" } = {}) {
	return ({ value: t }) => {
		if (M(t)) return "";
		let n = String(t).trim(), r = n.replace(/\D/g, "");
		if (!r) return document.createTextNode(n);
		let i = n;
		return e === "AU" && (/^04\d{8}$/.test(r) ? i = `${r.slice(0, 4)} ${r.slice(4, 7)} ${r.slice(7)}` : /^0[2378]\d{8}$/.test(r) ? i = `(${r.slice(0, 2)}) ${r.slice(2, 6)} ${r.slice(6)}` : /^1[38]00\d{6}$/.test(r) ? i = `${r.slice(0, 4)} ${r.slice(4, 7)} ${r.slice(7)}` : r.length === 8 && (i = `${r.slice(0, 4)} ${r.slice(4)}`)), j("a", {
			class: "sg-renderer-link",
			href: `tel:${r}`
		}, document.createTextNode(i));
	};
}
function Ue({ currency: e = "USD", locale: t = "en-US", decimals: n } = {}) {
	return ({ value: r, td: i }) => {
		if (i && i.classList.add("sg-renderer-number"), M(r)) return "";
		let a = Number(r);
		if (!Number.isFinite(a)) return String(r);
		let o = {
			style: "currency",
			currency: e
		};
		return n != null && (o.minimumFractionDigits = n, o.maximumFractionDigits = n), a.toLocaleString(t, o);
	};
}
function We({ decimals: e = 0, scale: t = "as-is" } = {}) {
	return ({ value: n, td: r }) => {
		if (r && r.classList.add("sg-renderer-number"), M(n)) return "";
		let i = Number(n);
		return Number.isFinite(i) ? (t === "fraction" && (i *= 100), `${i.toFixed(e)}%`) : String(n);
	};
}
function N(e) {
	if (e == null || e === "") return null;
	if (e instanceof Date) return Number.isNaN(e.valueOf()) ? null : e;
	let t = new Date(e);
	return Number.isNaN(t.valueOf()) ? null : t;
}
function Ge({ locale: e = void 0, dateStyle: t = "medium", ...n } = {}) {
	let r = new Intl.DateTimeFormat(e, {
		dateStyle: t,
		...n
	});
	return ({ value: e }) => {
		let t = N(e);
		return t ? r.format(t) : "";
	};
}
function Ke({ locale: e = void 0, dateStyle: t = "medium", timeStyle: n = "short", ...r } = {}) {
	let i = new Intl.DateTimeFormat(e, {
		dateStyle: t,
		timeStyle: n,
		...r
	});
	return ({ value: e }) => {
		let t = N(e);
		return t ? i.format(t) : "";
	};
}
var qe = [
	{
		unit: "second",
		ms: 1e3,
		cutoff: 60 * 1e3
	},
	{
		unit: "minute",
		ms: 60 * 1e3,
		cutoff: 3600 * 1e3
	},
	{
		unit: "hour",
		ms: 3600 * 1e3,
		cutoff: 1440 * 60 * 1e3
	},
	{
		unit: "day",
		ms: 1440 * 60 * 1e3,
		cutoff: 10080 * 60 * 1e3
	},
	{
		unit: "week",
		ms: 10080 * 60 * 1e3,
		cutoff: 720 * 60 * 60 * 1e3
	},
	{
		unit: "month",
		ms: 720 * 60 * 60 * 1e3,
		cutoff: 365 * 24 * 60 * 60 * 1e3
	},
	{
		unit: "year",
		ms: 365 * 24 * 60 * 60 * 1e3,
		cutoff: Infinity
	}
];
function Je({ locale: e = void 0, numeric: t = "auto", style: n = "long" } = {}) {
	let r = new Intl.RelativeTimeFormat(e, {
		numeric: t,
		style: n
	});
	return ({ value: e }) => {
		let t = N(e);
		if (!t) return "";
		let n = t.getTime() - Date.now(), i = Math.abs(n), a = qe.find((e) => i < e.cutoff) || qe[qe.length - 1], o = Math.round(n / a.ms), s = j("span", {
			class: "sg-renderer-relative-time",
			title: t.toLocaleString()
		});
		return s.textContent = r.format(o, a.unit), s;
	};
}
var Ye = {
	ms: 1,
	sec: 1e3,
	second: 1e3,
	min: 6e4,
	minute: 6e4,
	hr: 36e5,
	hour: 36e5
};
function Xe({ unit: e = "ms", style: t = "compact" } = {}) {
	let n = Ye[e] ?? 1;
	return ({ value: e, td: r }) => {
		if (r && r.classList.add("sg-renderer-number"), M(e)) return "";
		let i = Number(e) * n;
		if (!Number.isFinite(i)) return String(e);
		let a = i < 0 ? "-" : "", o = Math.abs(i), s = Math.floor(o / 36e5), c = Math.floor(o % 36e5 / 6e4), l = Math.floor(o % 6e4 / 1e3);
		if (t === "clock") {
			let e = (e) => String(e).padStart(2, "0");
			return a + (s > 0 ? `${e(s)}:${e(c)}:${e(l)}` : `${e(c)}:${e(l)}`);
		}
		if (t === "words") {
			let e = [];
			return s && e.push(`${s} ${s === 1 ? "hour" : "hours"}`), c && e.push(`${c} ${c === 1 ? "minute" : "minutes"}`), !s && l && e.push(`${l} ${l === 1 ? "second" : "seconds"}`), a + (e.join(" ") || "0 seconds");
		}
		let u = [];
		return s && u.push(`${s}h`), c && u.push(`${c}m`), !s && l && u.push(`${l}s`), a + (u.join(" ") || "0s");
	};
}
function Ze({ locale: e = void 0, decimals: t, ...n } = {}) {
	let r = { ...n };
	t != null && (r.minimumFractionDigits = t, r.maximumFractionDigits = t);
	let i = new Intl.NumberFormat(e, r);
	return ({ value: e, td: t }) => {
		if (t && t.classList.add("sg-renderer-number"), M(e)) return "";
		let n = Number(e);
		return Number.isFinite(n) ? i.format(n) : String(e);
	};
}
function Qe({ locale: e = void 0, compactDisplay: t = "short", maximumFractionDigits: n = 1 } = {}) {
	let r = new Intl.NumberFormat(e, {
		notation: "compact",
		compactDisplay: t,
		maximumFractionDigits: n
	});
	return ({ value: e, td: t }) => {
		if (t && t.classList.add("sg-renderer-number"), M(e)) return "";
		let n = Number(e);
		return Number.isFinite(n) ? r.format(n) : String(e);
	};
}
function $e({ binary: e = !0, decimals: t = 1, locale: n = void 0 } = {}) {
	let r = e ? 1024 : 1e3, i = e ? [
		"B",
		"KiB",
		"MiB",
		"GiB",
		"TiB",
		"PiB"
	] : [
		"B",
		"KB",
		"MB",
		"GB",
		"TB",
		"PB"
	], a = new Intl.NumberFormat(n, {
		minimumFractionDigits: t,
		maximumFractionDigits: t
	});
	return ({ value: e, td: t }) => {
		if (t && t.classList.add("sg-renderer-number"), M(e)) return "";
		let n = Number(e);
		if (!Number.isFinite(n)) return String(e);
		let o = n < 0 ? "-" : "";
		n = Math.abs(n);
		let s = 0;
		for (; n >= r && s < i.length - 1;) n /= r, s += 1;
		return `${o}${s === 0 ? String(Math.round(n)) : a.format(n)} ${i[s]}`;
	};
}
var et = /* @__PURE__ */ new Set([
	"1",
	"true",
	"t",
	"yes",
	"y",
	"on"
]);
function tt(e) {
	return e === !0 || e === 1 ? !0 : e == null || e === "" || e === !1 || e === 0 ? !1 : et.has(String(e).toLowerCase());
}
var nt = "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z\"/></svg>", rt = "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z\"/></svg>";
function it({ truthy: e = tt, nullLabel: t = "—", falseStyle: n = "icon" } = {}) {
	return ({ value: r }) => {
		if (r == null || r === "") return j("span", { class: "sg-renderer-bool-null" }, document.createTextNode(t));
		if (e(r)) {
			let e = j("span", {
				class: "sg-renderer-bool is-true",
				"aria-label": "true"
			});
			return e.innerHTML = nt, e;
		}
		if (n === "hidden") return "";
		let i = j("span", {
			class: "sg-renderer-bool is-false",
			"aria-label": "false"
		});
		return i.innerHTML = rt, i;
	};
}
var at = "<svg viewBox=\"0 0 384 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z\"/></svg>", ot = "<svg viewBox=\"0 0 384 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.7 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z\"/></svg>", st = "<svg viewBox=\"0 0 448 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M64 256a32 32 0 1 0 0-64H384V160c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9S384 364.9 384 352V320H64z\"/></svg>";
function ct({ style: e = "percent", decimals: t = 1, locale: n = void 0, currency: r = "USD", inverted: i = !1, showSign: a = !0 } = {}) {
	let o;
	return o = e === "currency" ? new Intl.NumberFormat(n, {
		style: "currency",
		currency: r,
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		signDisplay: a ? "always" : "auto"
	}) : new Intl.NumberFormat(n, {
		minimumFractionDigits: t,
		maximumFractionDigits: t,
		signDisplay: a ? "always" : "auto"
	}), ({ value: t, td: n }) => {
		if (n && n.classList.add("sg-renderer-number"), M(t)) return "";
		let r = Number(t);
		if (!Number.isFinite(r)) return String(t);
		let a = "is-flat", s = st, c = !i;
		r > 0 ? (a = c ? "is-up" : "is-down", s = at) : r < 0 && (a = c ? "is-down" : "is-up", s = ot);
		let l = j("span", { class: `sg-renderer-delta ${a}` }), u = j("span", {
			class: "sg-renderer-delta-icon",
			"aria-hidden": "true"
		});
		u.innerHTML = s;
		let d = e === "percent" ? `${o.format(r)}%` : o.format(r);
		return l.append(u), l.append(j("span", { class: "sg-renderer-delta-value" }, document.createTextNode(d))), l;
	};
}
function lt({ chars: e = null } = {}) {
	return ({ value: t, td: n }) => {
		if (M(t)) return "";
		let r = String(t), i = r, a = !1;
		return e && r.length > e && (i = r.slice(0, e) + "…", a = !0), n && (n.classList.add("sg-renderer-truncate"), n.setAttribute("title", r)), a ? i : r;
	};
}
var ut = "<svg viewBox=\"0 0 448 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z\"/></svg>", dt = "<svg viewBox=\"0 0 448 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z\"/></svg>";
function ft({ position: e = "after" } = {}) {
	return ({ value: t }) => {
		if (M(t)) return "";
		let n = String(t), r = j("span", { class: "sg-renderer-copyable" }), i = j("span", { class: "sg-renderer-copyable-value" }, document.createTextNode(n)), a = j("button", {
			type: "button",
			class: "sg-renderer-copyable-btn",
			title: "Copy",
			"aria-label": `Copy ${n}`
		});
		return a.innerHTML = ut, a.addEventListener("click", async (e) => {
			e.stopPropagation(), e.preventDefault();
			try {
				navigator.clipboard?.writeText ? await navigator.clipboard.writeText(n) : pt(n), a.innerHTML = dt, a.classList.add("is-copied"), setTimeout(() => {
					a.innerHTML = ut, a.classList.remove("is-copied");
				}, 1200);
			} catch {}
		}), e === "before" ? r.append(a, i) : r.append(i, a), r;
	};
}
function pt(e) {
	let t = document.createElement("textarea");
	t.value = e, t.style.position = "fixed", t.style.left = "-9999px", document.body.appendChild(t), t.select();
	try {
		document.execCommand("copy");
	} catch {}
	document.body.removeChild(t);
}
function mt({ size: e = 36, rounded: t = "sm", altField: n = "alt", clickToZoom: r = !1 } = {}) {
	let i = t === "full" ? "999px" : t === "lg" ? "8px" : t === "none" ? "0" : "4px";
	return ({ value: t, row: a }) => {
		if (M(t)) return "";
		let o = String(t), s = a?.[n] ?? "", c = j("img", {
			src: o,
			alt: s,
			class: "sg-renderer-image",
			width: String(e),
			height: String(e),
			style: `border-radius: ${i};`,
			loading: "lazy",
			decoding: "async"
		});
		return r ? (c.style.cursor = "zoom-in", c.addEventListener("click", (e) => {
			e.stopPropagation(), ht(o, s);
		}), c) : c;
	};
}
function ht(e, t) {
	let n = j("div", { class: "sg-image-zoom" }), r = () => {
		n.remove(), document.removeEventListener("keydown", i);
	}, i = (e) => {
		e.key === "Escape" && r();
	};
	n.addEventListener("click", r), document.addEventListener("keydown", i), n.append(j("img", {
		src: e,
		alt: t || "",
		class: "sg-image-zoom-img"
	})), document.body.appendChild(n);
}
function gt({ showLabel: e = !0, label: t = "value", shape: n = "circle", size: r = 14 } = {}) {
	return ({ value: i, row: a }) => {
		if (M(i)) return "";
		let o = String(i).trim(), s = j("span", { class: "sg-renderer-swatch" }), c = j("span", {
			class: `sg-renderer-swatch-chip is-${n}`,
			style: `width: ${r}px; height: ${r}px; background: ${o};`,
			"aria-hidden": "true"
		});
		if (s.append(c), e) {
			let e = typeof t == "function" ? t(i, a) : t === "name" ? a?.name ?? o : o;
			s.append(j("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(e)));
		}
		return s;
	};
}
var _t = {
	blue: "#3b82f6",
	green: "#10b981",
	red: "#ef4444",
	orange: "#f97316",
	purple: "#8b5cf6",
	pink: "#ec4899",
	gray: "#6b7280"
};
function vt({ type: e = "line", width: t = 80, height: n = 24, color: r = "blue", baseline: i = null, showLast: a = !0 } = {}) {
	let o = _t[r] || r;
	return ({ value: r }) => {
		if (!Array.isArray(r) || r.length === 0) return "";
		let s = r.map(Number).filter((e) => Number.isFinite(e));
		if (s.length === 0) return "";
		let c = i ?? Math.min(...s), l = Math.max(...s, i ?? -Infinity) - c || 1, u = 1.5, d = 2.5, f = t - u * 2, p = n - d * 2, m = (e) => u + (s.length === 1 ? f / 2 : e / (s.length - 1) * f), h = (e) => d + p - (e - c) / l * p, g = "";
		if (e === "bar") {
			let e = Math.max(1, (f - (s.length - 1) * 1) / s.length);
			for (let t = 0; t < s.length; t++) {
				let n = s[t], r = u + t * (e + 1), i = h(n), a = d + p - i;
				g += `<rect x="${r.toFixed(2)}" y="${i.toFixed(2)}" width="${e.toFixed(2)}" height="${a.toFixed(2)}" fill="${o}"/>`;
			}
		} else {
			let t = "";
			for (let e = 0; e < s.length; e++) t += `${e === 0 ? "M" : "L"} ${m(e).toFixed(2)} ${h(s[e]).toFixed(2)} `;
			if (e === "area") {
				let e = t + ` L ${m(s.length - 1).toFixed(2)} ${(d + p).toFixed(2)} L ${m(0).toFixed(2)} ${(d + p).toFixed(2)} Z`;
				g += `<path d="${e}" fill="${o}" fill-opacity="0.18" stroke="none"/>`;
			}
			if (g += `<path d="${t.trim()}" fill="none" stroke="${o}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`, a) {
				let e = m(s.length - 1), t = h(s[s.length - 1]);
				g += `<circle cx="${e.toFixed(2)}" cy="${t.toFixed(2)}" r="1.8" fill="${o}"/>`;
			}
		}
		return `<svg class="sg-renderer-sparkline is-${e}" viewBox="0 0 ${t} ${n}" width="${t}" height="${n}" preserveAspectRatio="none" aria-hidden="true">` + g + "</svg>";
	};
}
function yt(e) {
	if (typeof e != "string") return null;
	let t = e.trim().replace(/^#/, "");
	return t.length === 3 && (t = t.split("").map((e) => e + e).join("")), /^[0-9a-f]{6}$/i.test(t) ? [
		parseInt(t.slice(0, 2), 16),
		parseInt(t.slice(2, 4), 16),
		parseInt(t.slice(4, 6), 16)
	] : null;
}
function bt(e, t, n) {
	let r = (e) => Math.max(0, Math.min(255, Math.round(e))).toString(16).padStart(2, "0");
	return `#${r(e)}${r(t)}${r(n)}`;
}
function xt(e, t, n) {
	return [
		e[0] + (t[0] - e[0]) * n,
		e[1] + (t[1] - e[1]) * n,
		e[2] + (t[2] - e[2]) * n
	];
}
function St([e, t, n]) {
	return .299 * e + .587 * t + .114 * n >= 145;
}
function Ct({ min: e = 0, max: t = 100, colors: n = [
	"#dcfce7",
	"#fef3c7",
	"#fecaca"
], inverted: r = !1, showValue: i = !0, format: a = null } = {}) {
	let o = n.map(yt).filter(Boolean);
	if (o.length < 2) throw Error("heatmap: need at least two valid hex colours");
	return ({ value: n, td: s }) => {
		if (s && s.classList.add("sg-renderer-heatmap"), M(n)) return "";
		let c = Number(n);
		if (!Number.isFinite(c)) return String(n);
		let l = t - e === 0 ? .5 : (c - e) / (t - e);
		l = Math.max(0, Math.min(1, l)), r && (l = 1 - l);
		let u = l * (o.length - 1), d = Math.min(o.length - 2, Math.floor(u)), f = u - d, p = xt(o[d], o[d + 1], f);
		return s && (s.style.backgroundColor = bt(...p), s.style.color = St(p) ? "#111827" : "#ffffff"), i ? typeof a == "function" ? a(n) : String(n) : "";
	};
}
var wt = {
	"cc-last4": (e, t) => Et(e.replace(/\D/g, ""), 4, 4, t, " "),
	"cc-bin-last4": (e, t) => Et(e.replace(/\D/g, ""), 4, 4, t, " ", 6),
	"phone-last4": (e, t) => {
		let n = e.replace(/\D/g, "");
		return n ? n.length <= 4 ? n : t.repeat(n.length - 4) + " " + n.slice(-4) : e;
	},
	email: (e, t) => {
		let n = String(e).match(/^([^@\s]+)(@.+)$/);
		return n ? n[1][0] + t.repeat(Math.max(1, n[1].length - 1)) + n[2] : e;
	},
	last4: (e, t) => Tt(e, 4, t)
};
function Tt(e, t, n) {
	let r = String(e);
	return r.length <= t ? r : n.repeat(r.length - t) + r.slice(-t);
}
function Et(e, t, n, r, i, a = 0) {
	if (!e) return "";
	let o = e.length, s = e.split("").map((e, t) => t < a || t >= o - n ? e : r).join(""), c = [];
	for (let e = s.length; e > 0; e -= t) c.unshift(s.slice(Math.max(0, e - t), e));
	return c.join(i);
}
var Dt = /* @__PURE__ */ new Set([
	"cc-last4",
	"cc-bin-last4",
	"phone-last4",
	"last4"
]);
function Ot({ format: e = null, showFirst: t = 0, showLast: n = 4, char: r = "•", align: i = null } = {}) {
	let a = e ? wt[e] : null, o = e ? Dt.has(e) : !1, s = i === "right" || i !== "left" && o;
	return ({ value: e, td: i }) => {
		if (i && s && i.classList.add("sg-renderer-mask-numeric"), M(e)) return "";
		let o = String(e);
		if (a) return a(o, r);
		let c = o.slice(0, t), l = n > 0 ? o.slice(-n) : "", u = Math.max(0, o.length - t - n);
		return c + r.repeat(u) + l;
	};
}
function kt({ query: e = null, caseSensitive: t = !1, className: n = "sg-renderer-mark" } = {}) {
	return ({ value: r, api: i }) => {
		if (M(r)) return "";
		let a = String(r), o = e == null ? i?.getQuickFilter?.() || "" : String(e);
		return o ? At(a, o, t, n) : document.createTextNode(a);
	};
}
function At(e, t, n, r) {
	let i = n ? e : e.toLowerCase(), a = n ? t : t.toLowerCase(), o = document.createElement("span"), s = 0;
	for (; s < e.length;) {
		let n = i.indexOf(a, s);
		if (n === -1) {
			o.appendChild(document.createTextNode(e.slice(s)));
			break;
		}
		n > s && o.appendChild(document.createTextNode(e.slice(s, n)));
		let c = document.createElement("mark");
		c.className = r, c.textContent = e.slice(n, n + t.length), o.appendChild(c), s = n + t.length;
	}
	return o;
}
function jt({ lines: e = null, separator: t = "\n" } = {}) {
	return ({ value: n, td: r }) => {
		if (M(n)) return "";
		let i = String(n), a = t === "\n" ? i : i.split(t).join("\n");
		if (r) {
			r.classList.add("sg-renderer-multiline"), r.setAttribute("title", a);
			let e = r.parentElement;
			e && e.tagName === "TR" && e.classList.add("sg-has-multiline");
		}
		if (e != null && e > 0) {
			let t = document.createElement("div");
			return t.className = "sg-renderer-multiline-clamp", t.style.setProperty("--sg-clamp", String(e)), t.textContent = a, t;
		}
		return a;
	};
}
function Mt(e) {
	if (e == null || !Number.isFinite(Number(e))) return "";
	let t = Number(e);
	if (t < 1024) return `${t} B`;
	let n = [
		"KB",
		"MB",
		"GB",
		"TB"
	], r = -1;
	do
		t /= 1024, r++;
	while (t >= 1024 && r < n.length - 1);
	return `${t.toFixed(+(t < 10))} ${n[r]}`;
}
var Nt = /* @__PURE__ */ new Set([
	"png",
	"jpg",
	"jpeg",
	"gif",
	"webp",
	"avif",
	"svg",
	"bmp",
	"ico"
]);
function P(e) {
	if (!e) return !1;
	if (typeof e.content_type == "string" && e.content_type.startsWith("image/")) return !0;
	let t = String(e.filename || "").split(".").pop()?.toLowerCase();
	return t ? Nt.has(t) : !1;
}
var Pt = {
	pdf: "<svg viewBox=\"0 0 384 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM88 304h32c30.9 0 56 25.1 56 56s-25.1 56-56 56h-16v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V320c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24h-16v48h16zm72-64c0-8.8 7.2-16 16-16h24c26.5 0 48 21.5 48 48v48c0 26.5-21.5 48-48 48H208c-8.8 0-16-7.2-16-16V320zm32 16v80h8c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16h-8z\"/></svg>",
	doc: "<svg viewBox=\"0 0 384 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM104 280c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24zm0 80c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24z\"/></svg>",
	sheet: "<svg viewBox=\"0 0 384 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zm192 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16v128c0 8.8-7.2 16-16 16H112c-8.8 0-16-7.2-16-16V272c0-8.8 7.2-16 16-16zm16 32v32h48V288H128zm80 0v32h48V288H208zm-80 64v32h48V352H128zm80 0v32h48V352H208z\"/></svg>",
	zip: "<svg viewBox=\"0 0 384 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M0 64C0 28.7 28.7 0 64 0H160V64H224V0H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM160 64v32h64V64H160zm0 96v32h64V160H160zm0 96v32h64V256H160zm0 96c-17.7 0-32 14.3-32 32v48c0 8.8 7.2 16 16 16h96c8.8 0 16-7.2 16-16V384c0-17.7-14.3-32-32-32H160z\"/></svg>",
	audio: "<svg viewBox=\"0 0 384 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM160 288c-8.8 0-16 7.2-16 16v89c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V362.5l64-21.3V388c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V304c0-5.1-2.5-10-6.6-13s-9.5-3.9-14.5-2.3L160 309.8V304c0-8.8-7.2-16-16-16z\"/></svg>",
	video: "<svg viewBox=\"0 0 384 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM64 288c0-17.7 14.3-32 32-32H224c17.7 0 32 14.3 32 32V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V288zm259.7-11.3c5.2 2.7 8.3 8 8.3 13.8v123c0 5.8-3.2 11.2-8.3 13.8s-11.3 2.3-16.1-.9L256 392.7V312l51.5-32.6c4.9-3.1 11-3.4 16.1-.8z\"/></svg>",
	code: "<svg viewBox=\"0 0 384 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM200.4 281.7c5.8 6.7 5.2 16.8-1.5 22.6L165.5 333l33.4 28.7c6.7 5.8 7.4 15.9 1.6 22.6s-15.9 7.4-22.6 1.6l-48-41.2c-3.5-3-5.5-7.4-5.5-12s2-9 5.5-12l48-41.2c6.7-5.8 16.8-5.2 22.6 1.5zM226 281.7c5.8-6.7 15.9-7.4 22.6-1.5l48 41.2c3.5 3 5.5 7.4 5.5 12s-2 9-5.5 12l-48 41.2c-6.7 5.8-16.8 5.2-22.6-1.6s-5.2-16.8 1.5-22.6L260.5 333 227.5 304.4c-6.7-5.8-7.4-15.9-1.5-22.6z\"/></svg>",
	file: "<svg viewBox=\"0 0 384 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0z\"/></svg>"
}, Ft = "<svg viewBox=\"0 0 448 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z\"/></svg>", It = "<svg viewBox=\"0 0 384 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z\"/></svg>", Lt = "<svg viewBox=\"0 0 320 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z\"/></svg>", Rt = "<svg viewBox=\"0 0 320 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 105.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z\"/></svg>", zt = /* @__PURE__ */ new Set([
	"mp3",
	"wav",
	"flac",
	"m4a",
	"ogg",
	"aac",
	"opus"
]), Bt = /* @__PURE__ */ new Set([
	"mp4",
	"mov",
	"webm",
	"mkv",
	"avi",
	"m4v"
]);
function Vt(e) {
	let t = String(e?.content_type || "").toLowerCase(), n = String(e?.filename || "").split(".").pop()?.toLowerCase() || "";
	return t.includes("pdf") || n === "pdf" ? "pdf" : t.startsWith("audio/") || zt.has(n) ? "audio" : t.startsWith("video/") || Bt.has(n) ? "video" : t.includes("zip") || [
		"zip",
		"tar",
		"gz",
		"7z",
		"rar"
	].includes(n) ? "zip" : t.includes("sheet") || t.includes("excel") || t.includes("csv") || [
		"xls",
		"xlsx",
		"csv",
		"numbers"
	].includes(n) ? "sheet" : t.includes("word") || t.includes("document") || [
		"doc",
		"docx",
		"txt",
		"md",
		"rtf"
	].includes(n) ? "doc" : [
		"js",
		"ts",
		"rb",
		"py",
		"go",
		"rs",
		"java",
		"json",
		"xml",
		"html",
		"css",
		"sh",
		"sql"
	].includes(n) ? "code" : "file";
}
function Ht(e) {
	if (e == null || e === "") return [];
	let t = e;
	if (typeof t == "string") try {
		t = JSON.parse(t);
	} catch {
		return [];
	}
	return Array.isArray(t) || (t = [t]), t.filter((e) => e && (e.url || e.signed_id)).map((e, t) => ({
		id: e.id == null ? `att_${t}` : String(e.id),
		filename: e.filename || e.name || `attachment-${t + 1}`,
		url: e.url || "#",
		content_type: e.content_type || e.contentType || e.mime_type || "",
		byte_size: e.byte_size ?? e.byteSize ?? e.size ?? null,
		preview_url: e.preview_url || e.previewUrl || (P(e) ? e.url : null),
		thumb_url: e.thumb_url || e.thumbUrl || (P(e) ? e.url : null),
		signed_id: e.signed_id || e.signedId || null
	}));
}
function Ut({ thumbSize: e = 28, maxThumbs: t = 4, empty: n = "", editable: r = !1, accept: i = null, multiple: a = !0, download: o = !1, onUpload: s = null, onRemove: c = null } = {}) {
	return (l) => {
		let { value: u, td: d, row: f, col: p } = l, m = Ht(u);
		if (d && (d.classList.add("sg-renderer-attachments-cell"), d.dataset.attachmentCount = String(m.length), d._sgAttachments = m), m.length === 0 && !r) return n ? document.createTextNode(n) : "";
		let h = j("div", {
			class: "sg-renderer-attachments",
			role: "group"
		}), g = m.slice(0, t), _ = Math.max(0, m.length - g.length);
		if (g.forEach((t) => h.append(Wt(t, e, m, o))), _ > 0) {
			let e = j("span", {
				class: "sg-attach-more",
				title: `${_} more`
			}, document.createTextNode(`+${_}`));
			e.addEventListener("click", (e) => {
				e.stopPropagation(), Kt(m, m[g.length]);
			}), h.append(e);
		}
		if (r) {
			let t = j("button", {
				type: "button",
				class: "sg-attach-add",
				title: "Add files",
				"aria-label": "Add attachments",
				"data-sg-attach": "add"
			});
			t.innerHTML = Ft, t.addEventListener("click", (t) => {
				t.stopPropagation(), Xt(d, l, {
					thumbSize: e,
					accept: i,
					multiple: a,
					onUpload: s,
					onRemove: c
				});
			}), h.append(t), Yt(d, l, { onUpload: s }), d.addEventListener("dblclick", (t) => {
				t._sgAttachmentHandled || (t._sgAttachmentHandled = !0, t.stopPropagation(), Xt(d, l, {
					thumbSize: e,
					accept: i,
					multiple: a,
					onUpload: s,
					onRemove: c
				}));
			}, { once: !1 });
		}
		return h;
	};
}
function Wt(e, t, n, r) {
	let i = j("button", {
		type: "button",
		class: "sg-attach-thumb",
		title: `${e.filename}${e.byte_size == null ? "" : " · " + Mt(e.byte_size)}`,
		"data-attachment-id": e.id,
		"data-attachment-kind": P(e) ? "image" : "file",
		"aria-label": e.filename,
		style: `width: ${t}px; height: ${t}px;`
	});
	if (P(e) && e.thumb_url) i.append(j("img", {
		src: e.thumb_url,
		alt: e.filename,
		loading: "lazy",
		decoding: "async",
		width: String(t),
		height: String(t)
	}));
	else {
		let t = Vt(e), n = j("span", {
			class: `sg-attach-icon is-${t}`,
			"aria-hidden": "true"
		});
		n.innerHTML = Pt[t] || Pt.file, i.append(n);
	}
	return i.addEventListener("click", (t) => {
		if (t.stopPropagation(), P(e)) {
			let t = n.filter(P);
			Kt(t.length ? t : [e], e);
		} else if (r) {
			let t = document.createElement("a");
			t.href = e.url, t.download = e.filename, document.body.appendChild(t), t.click(), t.remove();
		} else window.open(e.url, "_blank", "noopener,noreferrer");
	}), i;
}
var Gt = null;
function Kt(e, t) {
	qt();
	let n = e.filter(P);
	if (n.length === 0) return;
	let r = Math.max(0, n.findIndex((e) => e.id === t?.id));
	r < 0 && (r = 0);
	let i = j("div", {
		class: "sg-image-zoom sg-attach-lightbox",
		role: "dialog",
		"aria-modal": "true"
	}), a = j("div", { class: "sg-attach-lightbox-stage" }), o = j("img", {
		class: "sg-image-zoom-img",
		alt: ""
	}), s = j("div", { class: "sg-attach-lightbox-caption" }), c = j("button", {
		type: "button",
		class: "sg-attach-lightbox-nav is-prev",
		"aria-label": "Previous attachment"
	}), l = j("button", {
		type: "button",
		class: "sg-attach-lightbox-nav is-next",
		"aria-label": "Next attachment"
	});
	c.innerHTML = Lt, l.innerHTML = Rt;
	function u() {
		let e = n[r];
		o.src = e.preview_url || e.url, o.alt = e.filename, s.textContent = `${e.filename}${e.byte_size == null ? "" : " · " + Mt(e.byte_size)} (${r + 1}/${n.length})`, c.style.visibility = n.length > 1 ? "visible" : "hidden", l.style.visibility = n.length > 1 ? "visible" : "hidden";
	}
	function d(e) {
		r = (r + e + n.length) % n.length, u();
	}
	function f(e) {
		e.key === "Escape" ? qt() : e.key === "ArrowLeft" ? d(-1) : e.key === "ArrowRight" && d(1);
	}
	i.addEventListener("click", (e) => {
		(e.target === i || e.target === a) && qt();
	}), c.addEventListener("click", (e) => {
		e.stopPropagation(), d(-1);
	}), l.addEventListener("click", (e) => {
		e.stopPropagation(), d(1);
	}), document.addEventListener("keydown", f), a.append(c, o, l), i.append(a, s), document.body.appendChild(i), Gt = {
		overlay: i,
		onKey: f
	}, u();
}
function qt() {
	Gt && (document.removeEventListener("keydown", Gt.onKey), Gt.overlay.remove(), Gt = null);
}
var Jt = null;
function Yt(e, t, { onUpload: n }) {
	e._sgAttachDropBound || (e._sgAttachDropBound = !0, e.addEventListener("dragover", (t) => {
		t.dataTransfer?.types?.includes("Files") && (t.preventDefault(), e.classList.add("is-drop-target"));
	}), e.addEventListener("dragleave", () => e.classList.remove("is-drop-target")), e.addEventListener("drop", async (r) => {
		r.dataTransfer?.files?.length && (r.preventDefault(), e.classList.remove("is-drop-target"), await $t(e, t, Array.from(r.dataTransfer.files), n));
	}));
}
function Xt(e, t, n) {
	Zt();
	let { thumbSize: r, accept: i, multiple: a, onUpload: o, onRemove: s } = n, c = e._sgAttachments || Ht(t.value), l = j("div", {
		class: "sg-attach-editor",
		role: "dialog",
		"aria-modal": "false"
	});
	l.addEventListener("mousedown", (e) => e.stopPropagation());
	let u = j("div", { class: "sg-attach-editor-header" }, [j("span", { class: "sg-attach-editor-title" }, document.createTextNode(c.length === 1 ? "1 attachment" : `${c.length} attachments`)), (() => {
		let e = j("button", {
			type: "button",
			class: "sg-attach-editor-close",
			"aria-label": "Close"
		});
		return e.innerHTML = It, e.addEventListener("click", Zt), e;
	})()]), d = j("div", { class: "sg-attach-editor-grid" });
	function f() {
		let n = e._sgAttachments || [];
		d.replaceChildren(), n.forEach((n) => d.append(Qt(n, e, t, s, r))), u.firstChild.textContent = n.length === 1 ? "1 attachment" : `${n.length} attachments`;
	}
	f(), e._sgAttachRepaint = f;
	let p = j("label", {
		class: "sg-attach-dropzone",
		tabindex: "0"
	});
	p.innerHTML = `
    <span class="sg-attach-dropzone-icon" aria-hidden="true">${Ft}</span>
    <span class="sg-attach-dropzone-text">Drop files, paste, or <strong>browse</strong></span>
  `;
	let m = j("input", {
		type: "file",
		multiple: a ? "" : null,
		accept: i || null
	});
	m.style.display = "none", p.append(m), m.addEventListener("change", async () => {
		m.files?.length && (await $t(e, t, Array.from(m.files), o), m.value = "", f());
	}), p.addEventListener("dragover", (e) => {
		e.dataTransfer?.types?.includes("Files") && (e.preventDefault(), p.classList.add("is-drop-target"));
	}), p.addEventListener("dragleave", () => p.classList.remove("is-drop-target")), p.addEventListener("drop", async (n) => {
		n.dataTransfer?.files?.length && (n.preventDefault(), p.classList.remove("is-drop-target"), await $t(e, t, Array.from(n.dataTransfer.files), o), f());
	});
	function h(n) {
		let r = Array.from(n.clipboardData?.files || []);
		r.length !== 0 && (n.preventDefault(), $t(e, t, r, o).then(f));
	}
	l.addEventListener("paste", h);
	function g(e) {
		e.key === "Escape" && Zt();
	}
	function _(t) {
		!l.contains(t.target) && !e.contains(t.target) && Zt();
	}
	document.addEventListener("keydown", g), setTimeout(() => document.addEventListener("mousedown", _), 0), l.append(u, d, p), document.body.appendChild(l), F(l, e), p.focus(), Jt = {
		pop: l,
		onKey: g,
		onDocClick: _,
		anchor: e
	};
}
function Zt() {
	if (!Jt) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = Jt;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), r && delete r._sgAttachRepaint, Jt = null;
}
function Qt(e, t, n, r, i) {
	let a = j("div", {
		class: "sg-attach-editor-tile",
		"data-attachment-id": e.id
	}), o = j("div", {
		class: "sg-attach-editor-preview",
		style: `width: ${i * 2}px; height: ${i * 2}px;`
	});
	if (P(e) && e.thumb_url) o.append(j("img", {
		src: e.thumb_url,
		alt: e.filename,
		width: String(i * 2),
		height: String(i * 2)
	}));
	else {
		let t = Vt(e), n = j("span", {
			class: `sg-attach-icon is-${t}`,
			"aria-hidden": "true"
		});
		n.innerHTML = Pt[t] || Pt.file, o.append(n);
	}
	let s = j("div", { class: "sg-attach-editor-meta" }, [j("div", {
		class: "sg-attach-editor-name",
		title: e.filename
	}, document.createTextNode(e.filename)), j("div", { class: "sg-attach-editor-size" }, document.createTextNode(e.byte_size == null ? "" : Mt(e.byte_size)))]), c = j("button", {
		type: "button",
		class: "sg-attach-editor-remove",
		title: "Remove",
		"aria-label": `Remove ${e.filename}`,
		"data-sg-attach": "remove",
		"data-attachment-id": e.id
	});
	return c.innerHTML = It, c.addEventListener("click", async (i) => {
		i.stopPropagation(), await en(t, n, e, r);
	}), a.append(o, s, c), a;
}
function F(e, t) {
	e.style.position = "fixed", e.style.maxHeight = "", e.style.maxWidth = "", e.style.left = "0px", e.style.top = "0px";
	let n = e.offsetWidth, r = e.offsetHeight, i = t.getBoundingClientRect(), a = window.innerWidth, o = window.innerHeight - i.bottom - 4 - 8, s = i.top - 4 - 8, c, l;
	r <= o ? (c = i.bottom + 4, l = o) : r <= s ? (c = i.top - 4 - r, l = s) : o >= s ? (c = i.bottom + 4, l = o) : (c = 8, l = s), r > l && (e.style.maxHeight = `${Math.max(60, l)}px`, e.style.overflowY = "auto", e.style.overflowX = "hidden");
	let u = i.left, d = a - n - 8;
	u > d && (u = d), u < 8 && (u = 8), n > a - 16 && (e.style.maxWidth = `${a - 16}px`, e.style.overflowX = "auto", u = 8), e.style.left = `${Math.round(u)}px`, e.style.top = `${Math.round(Math.max(8, c))}px`;
}
async function $t(e, t, n, r) {
	if (n.length) {
		e.classList.add("is-uploading");
		try {
			let i;
			if (typeof r == "function") {
				let a = await r(n, t);
				i = Array.isArray(a) ? a : (e._sgAttachments || []).concat(tn(n));
			} else i = (e._sgAttachments || []).concat(tn(n));
			nn(e, t, Ht(i));
		} finally {
			e.classList.remove("is-uploading");
		}
	}
}
async function en(e, t, n, r) {
	let i;
	if (typeof r == "function") {
		let a = await r(n, t);
		i = Array.isArray(a) ? a : (e._sgAttachments || []).filter((e) => e.id !== n.id);
	} else i = (e._sgAttachments || []).filter((e) => e.id !== n.id);
	nn(e, t, Ht(i));
}
function tn(e) {
	return e.map((e, t) => ({
		id: `local_${Date.now()}_${t}`,
		filename: e.name,
		url: URL.createObjectURL(e),
		content_type: e.type || "",
		byte_size: e.size,
		preview_url: e.type?.startsWith("image/") ? URL.createObjectURL(e) : null,
		thumb_url: e.type?.startsWith("image/") ? URL.createObjectURL(e) : null
	}));
}
function nn(e, t, n) {
	let { row: r, col: i, api: a } = t;
	r && i?.field != null && (r[i.field] = n), e._sgAttachments = n, a?.applyTransaction ? a.applyTransaction({ update: [r] }) : a?.refreshCells && a.refreshCells({ rowIds: [r?.id ?? r?._sg_id] }), e._sgAttachRepaint && e._sgAttachRepaint();
}
var rn = [
	"NSW",
	"VIC",
	"QLD",
	"WA",
	"SA",
	"TAS",
	"ACT",
	"NT"
], an = {
	NSW: "New South Wales",
	VIC: "Victoria",
	QLD: "Queensland",
	WA: "Western Australia",
	SA: "South Australia",
	TAS: "Tasmania",
	ACT: "Australian Capital Territory",
	NT: "Northern Territory"
};
function on(e) {
	if (e == null || e === "") return null;
	if (typeof e == "string") return { _raw: e };
	if (typeof e != "object") return null;
	let t = e.state ? String(e.state).trim().toUpperCase() : "";
	return {
		address1: e.address1 ? String(e.address1) : "",
		address2: e.address2 ? String(e.address2) : "",
		address3: e.address3 ? String(e.address3) : "",
		suburb: e.suburb ? String(e.suburb) : "",
		state: t,
		postcode: e.postcode == null ? "" : String(e.postcode),
		country: e.country ? String(e.country) : ""
	};
}
function sn(e) {
	if (!e || e._raw) return e?._raw || "";
	let t = [
		e.address1,
		e.address2,
		e.address3
	].filter(Boolean), n = [
		e.suburb,
		e.state,
		e.postcode
	].filter(Boolean).join(" ");
	return n && t.push(n), e.country && e.country.toLowerCase() !== "australia" && t.push(e.country), t.join("\n");
}
function cn({ editable: e = !0, empty: t = "" } = {}) {
	return (n) => {
		let { value: r, td: i } = n, a = on(r);
		if (i && (i.classList.add("sg-renderer-address-au-cell"), i._sgAddress = a), !a) return t ? document.createTextNode(t) : "";
		e && i && !i._sgAddressEditBound && (i._sgAddressEditBound = !0, i.addEventListener("dblclick", (e) => {
			e._sgAddressHandled || (e._sgAddressHandled = !0, e.stopPropagation(), un(i, n));
		}));
		let o = j("div", {
			class: "sg-renderer-address-au",
			title: sn(a)
		});
		if (a._raw) return o.append(document.createTextNode(a._raw)), o;
		let s = [a.address1, a.address2].filter(Boolean).join(", "), c = a.suburb || a.state || a.postcode;
		return s && o.append(j("span", { class: "sg-address-au-street" }, document.createTextNode(s))), s && c && o.append(j("span", { class: "sg-address-au-sep" }, document.createTextNode(", "))), a.suburb && o.append(document.createTextNode(a.suburb)), a.state && (a.suburb && o.append(document.createTextNode(" ")), o.append(j("span", {
			class: `sg-address-au-state is-${a.state.toLowerCase()}`,
			title: an[a.state] || a.state
		}, document.createTextNode(a.state)))), a.postcode && ((a.suburb || a.state) && o.append(document.createTextNode(" ")), o.append(j("span", { class: "sg-address-au-postcode" }, document.createTextNode(a.postcode)))), a.country && a.country.toLowerCase() !== "australia" && (o.append(document.createTextNode(" ")), o.append(j("span", { class: "sg-address-au-country" }, document.createTextNode(a.country)))), o;
	};
}
var ln = null;
function un(e, t) {
	dn();
	let n = e._sgAddress && !e._sgAddress._raw ? { ...e._sgAddress } : {
		address1: "",
		address2: "",
		address3: "",
		suburb: "",
		state: "",
		postcode: "",
		country: "Australia"
	};
	n.country || (n.country = "Australia");
	let r = j("div", {
		class: "sg-address-au-editor",
		role: "dialog",
		"aria-modal": "false"
	});
	r.addEventListener("mousedown", (e) => e.stopPropagation());
	let i = j("div", { class: "sg-address-au-editor-header" });
	i.append(j("span", { class: "sg-address-au-editor-title" }, document.createTextNode("Edit address")));
	let a = j("form", {
		class: "sg-address-au-editor-form",
		novalidate: "novalidate"
	});
	function o({ label: e, name: t, type: n = "text", value: r = "", maxlength: i, inputmode: a, placeholder: o, autocomplete: s }) {
		let c = j("label", {
			class: "sg-address-au-editor-field",
			"data-field": t
		});
		c.append(j("span", { class: "sg-address-au-editor-label" }, document.createTextNode(e)));
		let l = j("input", {
			type: n,
			name: t,
			value: r || "",
			maxlength: i || null,
			inputmode: a || null,
			placeholder: o || null,
			autocomplete: s || null,
			class: "sg-address-au-editor-input"
		});
		return c.append(l), {
			wrap: c,
			input: l
		};
	}
	let s = o({
		label: "Address line 1",
		name: "address1",
		value: n.address1,
		placeholder: "12 Smith Street",
		autocomplete: "address-line1"
	}), c = o({
		label: "Address line 2",
		name: "address2",
		value: n.address2,
		placeholder: "Unit / suite (optional)",
		autocomplete: "address-line2"
	}), l = j("div", { class: "sg-address-au-editor-line3-wrap" }), u = o({
		label: "Address line 3",
		name: "address3",
		value: n.address3,
		placeholder: "Level / building (optional)",
		autocomplete: "address-line3"
	});
	l.append(u.wrap);
	let d = j("button", {
		type: "button",
		class: "sg-address-au-editor-add-line"
	}, document.createTextNode("+ Add another line"));
	function f() {
		let e = !!(c.input.value.trim() || u.input.value.trim());
		l.hidden = !e, d.hidden = e;
	}
	c.input.addEventListener("input", f), d.addEventListener("click", () => {
		l.hidden = !1, d.hidden = !0, u.input.focus();
	});
	let p = o({
		label: "Suburb",
		name: "suburb",
		value: n.suburb,
		placeholder: "Bondi",
		autocomplete: "address-level2"
	}), m = j("label", {
		class: "sg-address-au-editor-field",
		"data-field": "state"
	});
	m.append(j("span", { class: "sg-address-au-editor-label" }, document.createTextNode("State")));
	let h = j("select", {
		name: "state",
		class: "sg-address-au-editor-input sg-address-au-editor-state",
		autocomplete: "address-level1"
	});
	h.append(j("option", { value: "" }, document.createTextNode("—")));
	for (let e of rn) {
		let t = j("option", {
			value: e,
			selected: n.state === e ? "" : null
		}, document.createTextNode(`${e} — ${an[e]}`));
		h.append(t);
	}
	m.append(h);
	let g = o({
		label: "Postcode",
		name: "postcode",
		type: "text",
		value: n.postcode,
		maxlength: 4,
		inputmode: "numeric",
		placeholder: "2026",
		autocomplete: "postal-code"
	});
	g.input.classList.add("sg-address-au-editor-postcode"), g.input.addEventListener("input", () => {
		g.input.value = g.input.value.replace(/\D/g, "").slice(0, 4);
	});
	let _ = o({
		label: "Country",
		name: "country",
		value: n.country,
		autocomplete: "country-name"
	}), v = j("div", { class: "sg-address-au-editor-grid" });
	v.append(s.wrap), v.append(c.wrap, d), v.append(l), v.append(p.wrap, m, g.wrap), v.append(_.wrap);
	let y = j("div", { class: "sg-address-au-editor-footer" }), b = j("button", {
		type: "button",
		class: "sg-address-au-editor-cancel"
	}, document.createTextNode("Cancel")), x = j("button", {
		type: "submit",
		class: "sg-address-au-editor-save"
	}, document.createTextNode("Save"));
	y.append(b, x), a.append(v, y), r.append(i, a);
	function S() {
		return {
			address1: s.input.value.trim(),
			address2: c.input.value.trim(),
			address3: l.hidden ? "" : u.input.value.trim(),
			suburb: p.input.value.trim(),
			state: h.value,
			postcode: g.input.value.trim(),
			country: _.input.value.trim() || "Australia"
		};
	}
	function C() {
		let n = S();
		fn(e, t, !n.address1 && !n.suburb && !n.state && !n.postcode ? null : n), dn();
	}
	a.addEventListener("submit", (e) => {
		e.preventDefault(), C();
	}), b.addEventListener("click", () => dn());
	function w(e) {
		e.key === "Escape" && (e.stopPropagation(), dn());
	}
	function T(t) {
		!r.contains(t.target) && !e.contains(t.target) && dn();
	}
	document.addEventListener("keydown", w), setTimeout(() => document.addEventListener("mousedown", T), 0), document.body.appendChild(r), F(r, e), f(), s.input.focus(), s.input.select(), ln = {
		pop: r,
		onKey: w,
		onDocClick: T
	};
}
function dn() {
	if (!ln) return;
	let { pop: e, onKey: t, onDocClick: n } = ln;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), ln = null;
}
function fn(e, t, n) {
	let { row: r, col: i, api: a } = t, o = r && i?.field != null ? r[i.field] : null;
	r && i?.field != null && (r[i.field] = n), e._sgAddress = n, a?.applyTransaction ? a.applyTransaction({ update: [r] }) : a?.refreshCells && a.refreshCells({ rowIds: [r?.id ?? r?._sg_id] });
	let s = e.closest("[data-controller~=\"grid\"]");
	s && s.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
		bubbles: !0,
		detail: {
			rowId: r?.id ?? r?._sg_id,
			colId: i?.field,
			oldValue: o,
			newValue: n
		}
	}));
}
function pn({ color: e = "green", showValue: t = !1 } = {}) {
	return ({ value: n }) => {
		let r = Number(n);
		Number.isFinite(r) || (r = 0), r = Math.max(0, Math.min(100, r));
		let i = j("div", { class: "sg-renderer-progress" }, [j("div", {
			class: `sg-renderer-progress-fill sg-fill-${e}`,
			style: `width: ${r}%;`
		})]);
		return t ? j("div", { class: "sg-renderer-progress-wrap" }, [i, j("span", { class: "sg-renderer-progress-label" }, document.createTextNode(`${Math.round(r)}%`))]) : i;
	};
}
var mn = "<svg viewBox=\"0 0 576 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z\"/></svg>";
function hn({ max: e = 5, precision: t = .5 } = {}) {
	let n = t > 0 ? 1 / t : 2;
	return ({ value: t }) => {
		let r = parseFloat(t);
		Number.isFinite(r) || (r = 0), r = Math.max(0, Math.min(e, r)), r = Math.round(r * n) / n;
		let i = j("div", {
			class: "sg-renderer-stars",
			role: "img",
			"aria-label": `${r} out of ${e} stars`
		});
		for (let t = 1; t <= e; t++) if (r >= t) i.append(j("span", {
			class: "sg-renderer-star is-full",
			"aria-hidden": "true"
		}, mn));
		else if (r > t - 1) {
			let e = Math.round((r - (t - 1)) * 100);
			i.append(j("span", {
				class: "sg-renderer-star is-partial",
				"aria-hidden": "true"
			}, `${mn}<span class="sg-star-clip" style="width: ${e}%;">${mn}</span>`));
		} else i.append(j("span", {
			class: "sg-renderer-star is-empty",
			"aria-hidden": "true"
		}, mn));
		return i;
	};
}
function gn({ separator: e = "," } = {}) {
	return ({ value: t }) => {
		if (M(t)) return "";
		let n = Array.isArray(t) ? t : String(t).split(e), r = j("div", { class: "sg-renderer-tags" });
		for (let e of n) {
			let t = String(e).trim();
			t && r.append(j("span", { class: "sg-renderer-tag" }, document.createTextNode(t)));
		}
		return r;
	};
}
function _n({ showCode: e = !0, fallback: t = null } = {}) {
	return ({ value: n }) => {
		if (M(n)) return "";
		let r = String(n).trim().toUpperCase();
		if (r.length !== 2 || !/^[A-Z]{2}$/.test(r)) return t ?? document.createTextNode(String(n));
		let i = String.fromCodePoint(127462 + r.charCodeAt(0) - 65, 127462 + r.charCodeAt(1) - 65), a = j("span", { class: "sg-renderer-country" });
		return a.append(j("span", {
			class: "sg-renderer-flag",
			"aria-hidden": "true"
		}, document.createTextNode(i))), e && a.append(j("span", { class: "sg-renderer-country-code" }, document.createTextNode(r))), a;
	};
}
function vn(e) {
	let t = String(e).replace(/\s+/g, "");
	if (t.length !== 11 || !/^\d{11}$/.test(t)) return !1;
	let n = [
		10,
		1,
		3,
		5,
		7,
		9,
		11,
		13,
		15,
		17,
		19
	], r = parseInt(t[0], 10) - 1 + t.slice(1), i = 0;
	for (let e = 0; e < 11; e++) i += parseInt(r[e], 10) * n[e];
	return i % 89 == 0;
}
function yn(e) {
	let t = String(e).replace(/\D/g, "");
	return t.length === 11 ? `${t.slice(0, 2)} ${t.slice(2, 5)} ${t.slice(5, 8)} ${t.slice(8)}` : String(e);
}
function bn() {
	return ({ value: e }) => M(e) ? "" : vn(e) ? j("a", {
		class: "sg-renderer-link sg-renderer-mono",
		href: `https://abr.business.gov.au/ABN/View?id=${String(e).replace(/\s+/g, "")}`,
		target: "_blank",
		rel: "noopener noreferrer",
		title: "Look up on ABR"
	}, document.createTextNode(yn(e))) : j("span", {
		class: "sg-renderer-invalid",
		title: "Invalid ABN"
	}, document.createTextNode(String(e)));
}
function xn({ lookup: e = null, nameField: t = null, avatarField: n = null, windowKey: r = "__sgUsers", size: i = 22 } = {}) {
	return ({ value: a, row: o }) => {
		if (M(a)) return "";
		let s = null;
		if (typeof e == "function" && (s = e(a, o) || null), !s && t && (s = {
			name: o?.[t],
			avatarUrl: n ? o?.[n] : null
		}), !s && typeof window < "u" && window[r]) {
			let e = window[r];
			e instanceof Map ? s = e.get(a) || e.get(String(a)) || null : Array.isArray(e) && (s = e.find((e) => `${e.id}` == `${a}`) || null);
		}
		let c = s?.name ?? String(a), l = j("span", { class: "sg-renderer-avatar" });
		if (s?.avatarUrl) l.append(j("img", {
			class: "sg-renderer-avatar-img",
			src: s.avatarUrl,
			width: String(i),
			height: String(i),
			alt: ""
		}));
		else {
			let e = String(c).split(/\s+/).filter(Boolean).slice(0, 2).map((e) => e[0]?.toUpperCase() || "").join("");
			l.append(j("span", {
				class: "sg-renderer-avatar-initials",
				style: `width: ${i}px; height: ${i}px;`
			}, document.createTextNode(e)));
		}
		return l.append(j("span", { class: "sg-renderer-avatar-name" }, document.createTextNode(c))), l;
	};
}
var Sn = {
	check: "<svg viewBox=\"0 0 448 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z\"/></svg>",
	"check-circle": "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z\"/></svg>",
	"x-circle": "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z\"/></svg>",
	clock: "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120v136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z\"/></svg>",
	truck: "<svg viewBox=\"0 0 640 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M48 0C21.5 0 0 21.5 0 48V368c0 26.5 21.5 48 48 48H64c0 53 43 96 96 96s96-43 96-96H384c0 53 43 96 96 96s96-43 96-96h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V288 256 237.3c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7H416V48c0-26.5-21.5-48-48-48H48zM416 160h50.7L544 237.3V256H416V160zM112 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm368-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z\"/></svg>",
	dot: "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z\"/></svg>",
	circle: "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z\"/></svg>",
	"half-circle": "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M448 256c0-106-86-192-192-192V448c106 0 192-86 192-192z\"/></svg>",
	alert: "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M256 32C141.1 32 48 125.1 48 240V384c0 17.7 14.3 32 32 32H432c17.7 0 32-14.3 32-32V240C464 125.1 370.9 32 256 32zM232 152c0-13.3 10.7-24 24-24s24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152zM256 304a32 32 0 1 1 0 64 32 32 0 1 1 0-64z\"/></svg>",
	cart: "<svg viewBox=\"0 0 576 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z\"/></svg>"
};
function I(e) {
	return String(e).toLowerCase().split(/[\s_-]+/).map((e) => e && e[0].toUpperCase() + e.slice(1)).join(" ");
}
function Cn(e = {}, t = null, n = {}) {
	let { titleCase: r = !0, defaultColor: i = "gray" } = n, a = {};
	for (let [t, n] of Object.entries(e)) a[String(t).toLowerCase()] = n;
	let o = {};
	if (t) for (let [e, n] of Object.entries(t)) o[String(e).toLowerCase()] = n;
	return ({ value: e }) => {
		if (M(e)) return "";
		let n = String(e).toLowerCase(), s = a[n] || i, c = r ? I(e) : String(e), l = j("span", { class: `sg-pill sg-pill-${s}` });
		if (t) {
			let e = o[n], t = e ? Sn[e] || e : null;
			if (t) {
				let e = j("span", {
					class: "sg-pill-icon",
					"aria-hidden": "true"
				});
				e.innerHTML = t, l.append(e);
			}
		}
		return l.append(j("span", { class: "sg-pill-label" }, document.createTextNode(c))), l;
	};
}
function wn({ truthy: e = tt, disabled: t = !1 } = {}) {
	return (n) => {
		let { value: r, row: i, col: a, api: o, td: s } = n;
		s && s.classList.add("sg-renderer-checkbox-cell");
		let c = j("span", { class: "sg-renderer-checkbox" }), l = j("input", {
			type: "checkbox",
			class: "sg-renderer-checkbox-input",
			disabled: t ? "" : null,
			"aria-label": a?.field || "toggle"
		});
		return r == null || r === "" ? l.indeterminate = !0 : l.checked = e(r), l.addEventListener("click", (e) => e.stopPropagation()), l.addEventListener("change", (e) => {
			if (t) {
				e.preventDefault();
				return;
			}
			let n = l.checked, r = i && a?.field != null ? i[a.field] : null;
			i && a?.field != null && (i[a.field] = n), o?.applyTransaction && o.applyTransaction({ update: [i] });
			let c = s?.closest("[data-controller~=\"grid\"]");
			c && c.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
				bubbles: !0,
				detail: {
					rowId: i?.id ?? i?._sg_id,
					colId: a?.field,
					oldValue: r,
					newValue: n
				}
			}));
		}), c.append(l), c;
	};
}
var Tn = "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z\"/></svg>", En = "<svg viewBox=\"0 0 384 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z\"/></svg>", Dn = "<svg viewBox=\"0 0 320 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z\"/></svg>", On = "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z\"/></svg>", kn = "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z\"/></svg>", An = It;
function jn(e) {
	if (e == null || e === "") return null;
	if (typeof e == "string") {
		let t = e.trim();
		return t ? {
			url: t,
			filename: t.split("/").pop()?.match(/^[^?#]+/)?.[0] || "audio",
			byte_size: null,
			duration: null
		} : null;
	}
	if (typeof e != "object") return null;
	let t = e.url || e.src || e.href;
	return t ? {
		url: String(t),
		filename: e.filename || e.name || String(t).split("/").pop()?.split("?")[0] || "audio",
		byte_size: e.byte_size ?? e.byteSize ?? e.size ?? null,
		duration: Number.isFinite(e.duration) ? Number(e.duration) : null,
		content_type: e.content_type || e.contentType || e.mime_type || ""
	} : null;
}
function Mn(e) {
	(!Number.isFinite(e) || e < 0) && (e = 0);
	let t = Math.floor(e), n = Math.floor(t / 3600), r = Math.floor(t % 3600 / 60), i = t % 60, a = (e) => String(e).padStart(2, "0");
	return n > 0 ? `${n}:${a(r)}:${a(i)}` : `${r}:${a(i)}`;
}
function Nn({ showFilename: e = !0, iconOnly: t = !1, empty: n = "", preferHowler: r = !0, skipSeconds: i = 10 } = {}) {
	return (a) => {
		let { value: o, td: s } = a, c = jn(o);
		if (s && (s.classList.add("sg-renderer-audio-cell"), s._sgAudio = c, s._sgAudioOpts = {
			preferHowler: r,
			skipSeconds: i
		}), !c) return n ? document.createTextNode(n) : "";
		s && !s._sgAudioDblBound && (s._sgAudioDblBound = !0, s.addEventListener("dblclick", (e) => {
			e._sgAudioHandled || (e._sgAudioHandled = !0, e.stopPropagation(), e.preventDefault(), Rn(s, a));
		}));
		let l = j("div", { class: "sg-renderer-audio" }), u = j("button", {
			type: "button",
			class: "sg-audio-icon",
			title: `${c.filename}${c.byte_size == null ? "" : " · " + Mt(c.byte_size)} — double-click to play`,
			"aria-label": `Play ${c.filename}`,
			"data-sg-audio": "open"
		});
		if (u.innerHTML = Tn, u.addEventListener("click", (e) => {
			e.stopPropagation(), Rn(s, a);
		}), u.addEventListener("dblclick", (e) => {
			e._sgAudioHandled = !0, e.stopPropagation();
		}), l.append(u), e && !t) {
			let e = j("span", { class: "sg-audio-name" }, document.createTextNode(c.filename));
			l.append(e), c.duration != null && l.append(j("span", { class: "sg-audio-duration" }, document.createTextNode(Mn(c.duration))));
		}
		return l;
	};
}
function Pn(e, { preferHowler: t } = {}) {
	return t && typeof window < "u" && window.Howl ? new In(e) : new Fn(e);
}
var Fn = class {
	constructor(e) {
		this.audio = new Audio(), this.audio.preload = "metadata", this.audio.src = e, this._evMap = {
			load: "loadedmetadata",
			end: "ended",
			play: "play",
			pause: "pause",
			error: "error"
		}, this._handlers = /* @__PURE__ */ new Map();
	}
	play() {
		return this.audio.play();
	}
	pause() {
		this.audio.pause();
	}
	seek(e) {
		if (e == null) return this.audio.currentTime || 0;
		this.audio.currentTime = Math.max(0, e);
	}
	duration() {
		let e = this.audio.duration;
		return Number.isFinite(e) ? e : 0;
	}
	isPlaying() {
		return !this.audio.paused && !this.audio.ended;
	}
	on(e, t) {
		let n = this._evMap[e] || e;
		this.audio.addEventListener(n, t), this._handlers.set(t, [n, t]);
	}
	off(e, t) {
		let n = this._handlers.get(t);
		n && this.audio.removeEventListener(n[0], n[1]), this._handlers.delete(t);
	}
	destroy() {
		try {
			this.audio.pause();
		} catch {}
		this.audio.src = "", this._handlers.clear();
	}
	backendName() {
		return "native";
	}
}, In = class {
	constructor(e) {
		this.howl = new window.Howl({
			src: [e],
			html5: !0,
			preload: !0
		});
	}
	play() {
		this.howl.play();
	}
	pause() {
		this.howl.pause();
	}
	seek(e) {
		if (e == null) {
			let e = this.howl.seek();
			return typeof e == "number" ? e : 0;
		}
		this.howl.seek(Math.max(0, e));
	}
	duration() {
		return this.howl.duration() || 0;
	}
	isPlaying() {
		return this.howl.playing();
	}
	on(e, t) {
		this.howl.on(e, t);
	}
	off(e, t) {
		this.howl.off(e, t);
	}
	destroy() {
		try {
			this.howl.unload();
		} catch {}
	}
	backendName() {
		return "howler";
	}
}, Ln = null;
function Rn(e, t) {
	zn();
	let n = e._sgAudio || jn(t.value);
	if (!n) return;
	let r = e._sgAudioOpts || {
		preferHowler: !0,
		skipSeconds: 10
	}, i = Pn(n.url, r), a = j("div", {
		class: "sg-audio-player",
		role: "dialog",
		"aria-label": "Audio player"
	});
	a.addEventListener("mousedown", (e) => e.stopPropagation());
	let o = j("div", { class: "sg-audio-player-header" }), s = j("div", {
		class: "sg-audio-player-name",
		title: n.filename
	}, document.createTextNode(n.filename)), c = j("div", { class: "sg-audio-player-meta" }), l = [];
	n.byte_size != null && l.push(Mt(n.byte_size)), i.backendName() === "howler" && l.push("howler.js"), c.textContent = l.join(" · ");
	let u = j("button", {
		type: "button",
		class: "sg-audio-player-close",
		"aria-label": "Close player"
	});
	u.innerHTML = An, u.addEventListener("click", zn), o.append(s, c, u);
	let d = j("div", {
		class: "sg-audio-track",
		role: "slider",
		"aria-label": "Seek",
		tabindex: "0",
		"aria-valuemin": "0",
		"aria-valuemax": "0",
		"aria-valuenow": "0"
	}), f = j("div", { class: "sg-audio-track-fill" }), p = j("div", { class: "sg-audio-track-thumb" });
	d.append(f, p);
	let m = j("div", { class: "sg-audio-times" }), h = j("span", { class: "sg-audio-time-current" }, document.createTextNode("0:00")), g = j("span", { class: "sg-audio-time-total" }, document.createTextNode(n.duration ? Mn(n.duration) : "--:--"));
	m.append(h, g);
	let _ = j("div", { class: "sg-audio-transport" }), v = j("button", {
		type: "button",
		class: "sg-audio-btn sg-audio-skip",
		title: `Back ${r.skipSeconds}s`,
		"aria-label": `Back ${r.skipSeconds} seconds`
	});
	v.innerHTML = On;
	let y = j("button", {
		type: "button",
		class: "sg-audio-btn sg-audio-play",
		title: "Play / pause (Space)",
		"aria-label": "Play",
		"data-state": "paused"
	});
	y.innerHTML = En;
	let b = j("button", {
		type: "button",
		class: "sg-audio-btn sg-audio-skip",
		title: `Forward ${r.skipSeconds}s`,
		"aria-label": `Forward ${r.skipSeconds} seconds`
	});
	b.innerHTML = kn, _.append(v, y, b), a.append(o, d, m, _);
	let x = n.duration ?? 0, S = !1, C = null;
	function w(e) {
		let t = Math.max(0, Math.min(100, e));
		f.style.width = t + "%", p.style.left = t + "%";
	}
	function T() {
		let e = i.seek(), t = i.duration() || x || 0;
		t > 0 && t !== x && (x = t, g.textContent = Mn(x), d.setAttribute("aria-valuemax", String(Math.floor(x)))), S || (w(x > 0 ? e / x * 100 : 0), h.textContent = Mn(e), d.setAttribute("aria-valuenow", String(Math.floor(e))));
	}
	function ee() {
		T(), C = i.isPlaying() ? requestAnimationFrame(ee) : null;
	}
	function te() {
		C ?? (C = requestAnimationFrame(ee));
	}
	function ne() {
		C != null && cancelAnimationFrame(C), C = null;
	}
	let re = () => {
		x = i.duration(), T();
	}, ie = () => {
		y.dataset.state = "playing", y.innerHTML = Dn, y.setAttribute("aria-label", "Pause"), te();
	}, ae = () => {
		y.dataset.state = "paused", y.innerHTML = En, y.setAttribute("aria-label", "Play"), ne(), T();
	}, oe = () => {
		y.dataset.state = "paused", y.innerHTML = En, y.setAttribute("aria-label", "Play"), ne(), i.seek(0), T();
	};
	i.on("load", re), i.on("play", ie), i.on("pause", ae), i.on("end", oe), y.addEventListener("click", (e) => {
		e.stopPropagation(), i.isPlaying() ? i.pause() : i.play();
	}), v.addEventListener("click", (e) => {
		e.stopPropagation(), i.seek(Math.max(0, i.seek() - r.skipSeconds)), T();
	}), b.addEventListener("click", (e) => {
		e.stopPropagation();
		let t = i.duration();
		i.seek(Math.min(t || Infinity, i.seek() + r.skipSeconds)), T();
	});
	function E(e) {
		let t = d.getBoundingClientRect(), n = (e.clientX ?? 0) - t.left, r = Math.max(0, Math.min(1, n / t.width)), a = i.duration() || x;
		if (!a) return;
		let o = r * a;
		i.seek(o), w(r * 100), h.textContent = Mn(o);
	}
	d.addEventListener("pointerdown", (e) => {
		e.preventDefault(), S = !0, d.setPointerCapture?.(e.pointerId), d.classList.add("is-dragging"), E(e);
	}), d.addEventListener("pointermove", (e) => {
		S && E(e);
	});
	let se = (e) => {
		if (S) {
			S = !1, d.classList.remove("is-dragging");
			try {
				d.releasePointerCapture?.(e.pointerId);
			} catch {}
		}
	};
	d.addEventListener("pointerup", se), d.addEventListener("pointercancel", se), d.addEventListener("keydown", (e) => {
		let t = i.duration() || x;
		if (!t) return;
		let n = e.shiftKey ? 30 : 5, r = null;
		e.key === "ArrowLeft" ? r = Math.max(0, i.seek() - n) : e.key === "ArrowRight" ? r = Math.min(t, i.seek() + n) : e.key === "Home" ? r = 0 : e.key === "End" && (r = t), r != null && (e.preventDefault(), i.seek(r), T());
	});
	function ce(e) {
		e.key === "Escape" ? (e.preventDefault(), zn()) : (e.key === " " || e.code === "Space") && a.contains(document.activeElement) && (e.preventDefault(), i.isPlaying() ? i.pause() : i.play());
	}
	function D(t) {
		!a.contains(t.target) && !e.contains(t.target) && zn();
	}
	document.addEventListener("keydown", ce), setTimeout(() => document.addEventListener("mousedown", D), 0), document.body.appendChild(a), F(a, e), T(), y.focus(), Ln = {
		pop: a,
		backend: i,
		onKey: ce,
		onDocClick: D,
		cleanup: () => {
			ne();
			try {
				i.off("load", re), i.off("play", ie), i.off("pause", ae), i.off("end", oe);
			} catch {}
			i.destroy();
		}
	};
}
function zn() {
	if (!Ln) return;
	let { pop: e, onKey: t, onDocClick: n, cleanup: r } = Ln;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), r(), e.remove(), Ln = null;
}
function Bn({ truthy: e = tt, disabled: t = !1 } = {}) {
	return (n) => {
		let { value: r, row: i, col: a, api: o, td: s } = n;
		s && s.classList.add("sg-renderer-switch-cell");
		let c = r == null || r === "", l = !c && e(r), u = j("button", {
			type: "button",
			class: `sg-renderer-switch${l ? " is-on" : ""}${c ? " is-null" : ""}`,
			role: "switch",
			"aria-checked": c ? "mixed" : l ? "true" : "false",
			"aria-label": a?.field || "toggle",
			disabled: t ? "" : null
		});
		return u.append(j("span", {
			class: "sg-renderer-switch-thumb",
			"aria-hidden": "true"
		})), u.addEventListener("click", (e) => {
			if (e.stopPropagation(), t) return;
			let n = c ? !0 : !l, r = i && a?.field != null ? i[a.field] : null;
			i && a?.field != null && (i[a.field] = n), o?.applyTransaction && o.applyTransaction({ update: [i] });
			let u = s?.closest("[data-controller~=\"grid\"]");
			u && u.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
				bubbles: !0,
				detail: {
					rowId: i?.id ?? i?._sg_id,
					colId: a?.field,
					oldValue: r,
					newValue: n
				}
			}));
		}), u;
	};
}
var Vn = /^(https?:\/\/|mailto:)/i;
function Hn(e) {
	return String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function Un(e) {
	let t = e;
	return t = t.replace(/`([^`\n]+)`/g, (e, t) => `<code>${t}</code>`), t = t.replace(/\[([^\]\n]+)\]\(([^)\n]+)\)/g, (e, t, n) => Vn.test(n) ? `<a href="${n}" target="_blank" rel="noopener noreferrer">${t}</a>` : e), t = t.replace(/\*\*([^*\n]+)\*\*/g, "<strong>$1</strong>"), t = t.replace(/__([^_\n]+)__/g, "<strong>$1</strong>"), t = t.replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), t = t.replace(/(^|[\s(])_([^_\n]+?)_(?=[\s).,;:!?]|$)/g, "$1<em>$2</em>"), t = t.replace(/~~([^~\n]+)~~/g, "<del>$1</del>"), t;
}
function Wn(e) {
	let t = e.split("\n"), n = [], r = null, i = [], a = () => {
		r && (n.push(`<${r}>${i.map((e) => `<li>${Un(e)}</li>`).join("")}</${r}>`), r = null, i = []);
	};
	for (let e of t) {
		let t = /^\s*[-*]\s+(.+)$/.exec(e), o = /^\s*\d+\.\s+(.+)$/.exec(e);
		t ? (r && r !== "ul" && a(), r = "ul", i.push(t[1])) : o ? (r && r !== "ol" && a(), r = "ol", i.push(o[1])) : (a(), e.trim() === "" ? n.push("") : n.push(Un(e)));
	}
	return a(), n.join("<br>").replace(/(<br>){2,}/g, "<br><br>");
}
function Gn({ inline: e = !1 } = {}) {
	return ({ value: t, td: n }) => {
		if (M(t)) return "";
		let r = Hn(t), i = e ? Un(r) : Wn(r);
		if (n) {
			n.classList.add("sg-renderer-markdown-cell");
			let e = n.parentElement;
			e && e.tagName === "TR" && e.classList.add("sg-has-multiline");
		}
		let a = j("div", { class: `sg-renderer-markdown${e ? " is-inline" : ""}` });
		return a.innerHTML = i, a;
	};
}
function Kn(e) {
	return Hn(e).replace(/(&quot;(?:[^&\\]|\\.)*?&quot;)\s*:/g, "<span class=\"sg-json-key\">$1</span>:").replace(/:\s*(&quot;(?:[^&\\]|\\.)*?&quot;)/g, ": <span class=\"sg-json-string\">$1</span>").replace(/(?<=[\s:,\[])(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)(?=[\s,\]\}\n])/g, "<span class=\"sg-json-number\">$1</span>").replace(/(?<=[\s:,\[])(true|false)(?=[\s,\]\}\n])/g, "<span class=\"sg-json-bool\">$1</span>").replace(/(?<=[\s:,\[])(null)(?=[\s,\]\}\n])/g, "<span class=\"sg-json-null\">$1</span>");
}
function qn(e, t) {
	let n = Array.isArray(e), r = n ? e : Object.entries(e), i = r.slice(0, t), a = r.length - i.length, o = (e) => {
		if (e == null) return "null";
		let t = typeof e;
		return t === "string" ? e.length > 18 ? `"${e.slice(0, 15)}…"` : `"${e}"` : t === "number" || t === "boolean" ? String(e) : Array.isArray(e) ? `[${e.length}]` : t === "object" ? "{…}" : String(e);
	}, s = n ? i.map(o).join(", ") : i.map(([e, t]) => `${e}: ${o(t)}`).join(", "), c = a > 0 ? `, +${a}` : "";
	return n ? `[${s}${c}]` : `{ ${s}${c} }`;
}
function Jn({ maxKeys: e = 3, indent: t = 2 } = {}) {
	return ({ value: n, td: r }) => {
		if (n == null || n === "") return "";
		let i = n;
		if (typeof n == "string") try {
			i = JSON.parse(n);
		} catch {
			return String(n);
		}
		if (i == null) return j("span", { class: "sg-renderer-json-scalar sg-json-null" }, document.createTextNode("null"));
		if (typeof i != "object") {
			let e = typeof i, t = e === "string" ? "sg-json-string" : e === "number" ? "sg-json-number" : "sg-json-bool", n = e === "string" ? `"${i}"` : String(i);
			return j("span", { class: `sg-renderer-json-scalar ${t}` }, document.createTextNode(n));
		}
		let a = document.createElement("details");
		a.className = "sg-renderer-json";
		let o = document.createElement("summary");
		o.className = "sg-renderer-json-summary";
		let s = j("span", {
			class: "sg-renderer-json-chevron",
			"aria-hidden": "true"
		});
		s.innerHTML = ke, o.append(s), o.append(j("span", { class: "sg-renderer-json-summary-text" }, document.createTextNode(qn(i, e))));
		let c = document.createElement("pre");
		if (c.className = "sg-renderer-json-pre", c.innerHTML = Kn(JSON.stringify(i, null, t)), a.append(o, c), o.addEventListener("click", (e) => e.stopPropagation()), r) {
			r.classList.add("sg-renderer-json-cell");
			let e = r.parentElement;
			e && e.tagName === "TR" && e.classList.add("sg-has-multiline");
		}
		return a;
	};
}
function Yn({ lookup: e = null, windowKey: t = "__sgLinks", showThumb: n = !0, href: r = null, multiple: i = !1, fallback: a = (e) => String(e) } = {}) {
	return ({ value: o, row: s }) => {
		if (M(o)) return "";
		let c = i ? Array.isArray(o) ? o : String(o).split(",").map((e) => e.trim()).filter(Boolean) : [o], l = j("span", { class: "sg-renderer-linked-records" });
		for (let i of c) {
			let o = Xn(i, s, e, t);
			l.append(Zn(i, s, o, {
				showThumb: n,
				href: r,
				fallback: a
			}));
		}
		return l;
	};
}
function Xn(e, t, n, r) {
	if (typeof n == "function") return n(e, t) || null;
	if (typeof window > "u") return null;
	let i = window[r];
	return i ? i instanceof Map ? i.get(e) || i.get(String(e)) || null : typeof i == "object" ? i[e] ?? i[String(e)] ?? null : null : null;
}
function Zn(e, t, n, { showThumb: r, href: i, fallback: a }) {
	let o = n?.name ?? a(e), s = typeof i == "function" ? i(e, t, n) : n?.href || null, c = document.createElement(s ? "a" : "span");
	if (c.className = "sg-renderer-linked-record", s && (c.href = s, c.target = "_blank", c.rel = "noopener noreferrer", c.addEventListener("click", (e) => e.stopPropagation())), n?.color && c.style.setProperty("--lr-tint", n.color), r && n?.thumb) c.append(j("img", {
		src: n.thumb,
		alt: "",
		class: "sg-renderer-linked-record-thumb",
		loading: "lazy",
		decoding: "async"
	}));
	else if (r && o) {
		let e = String(o).split(/\s+/).filter(Boolean).slice(0, 2).map((e) => e[0]?.toUpperCase() || "").join("");
		e && c.append(j("span", {
			class: "sg-renderer-linked-record-initials",
			"aria-hidden": "true"
		}, document.createTextNode(e)));
	}
	return c.append(j("span", { class: "sg-renderer-linked-record-name" }, document.createTextNode(o))), c;
}
function Qn({ separator: e = ",", colorMap: t = {}, defaultColor: n = "gray" } = {}) {
	let r = {};
	for (let [e, n] of Object.entries(t)) r[String(e).toLowerCase()] = n;
	return ({ value: t }) => {
		if (M(t)) return "";
		let i = Array.isArray(t) ? t : String(t).split(e), a = j("div", { class: "sg-renderer-coloured-tags" });
		for (let e of i) {
			let t = String(e).trim();
			if (!t) continue;
			let i = r[t.toLowerCase()] || n, o = j("span", { class: "sg-renderer-coloured-tag" }, document.createTextNode(t));
			/^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/.test(i) ? o.classList.add(`sg-pill-${i}`) : (o.style.background = i, o.style.color = $n(i)), a.append(o);
		}
		return a;
	};
}
function $n(e) {
	let t = yt(e);
	return t ? St(t) ? "#1f2937" : "#ffffff" : "inherit";
}
function er(e) {
	if (e == null || e === "") return null;
	if (e instanceof Date) return Number.isNaN(e.valueOf()) ? null : {
		h: e.getHours(),
		m: e.getMinutes(),
		s: e.getSeconds()
	};
	if (typeof e == "number" && Number.isFinite(e)) {
		let t = (e % 86400 + 86400) % 86400;
		return {
			h: Math.floor(t / 3600),
			m: Math.floor(t % 3600 / 60),
			s: Math.floor(t % 60)
		};
	}
	let t = String(e).trim(), n = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/.exec(t);
	if (n) return {
		h: parseInt(n[1], 10),
		m: parseInt(n[2], 10),
		s: n[3] ? parseInt(n[3], 10) : 0
	};
	let r = new Date(t);
	return Number.isNaN(r.valueOf()) ? null : {
		h: r.getHours(),
		m: r.getMinutes(),
		s: r.getSeconds()
	};
}
function tr({ style: e = "24h", seconds: t = !1, locale: n = void 0 } = {}) {
	return ({ value: r }) => {
		let i = er(r);
		if (!i) return "";
		if (e === "12h") {
			let e = /* @__PURE__ */ new Date(0);
			return e.setHours(i.h, i.m, i.s), new Intl.DateTimeFormat(n, {
				hour: "numeric",
				minute: "2-digit",
				...t ? { second: "2-digit" } : {},
				hour12: !0
			}).format(e);
		}
		let a = (e) => String(e).padStart(2, "0"), o = t ? `:${a(i.s)}` : "";
		return `${a(i.h)}:${a(i.m)}${o}`;
	};
}
function nr(e) {
	if (Array.isArray(e)) return {
		from: e[0],
		to: e[1]
	};
	if (e && typeof e == "object") return {
		from: e.from ?? e.old ?? e.before ?? e.previous ?? null,
		to: e.to ?? e.new ?? e.after ?? e.current ?? null
	};
	let t = String(e), n = /^(.*?)\s*(?:→|->|=>|—>)\s*(.+)$/.exec(t);
	return n ? {
		from: n[1].trim(),
		to: n[2].trim()
	} : {
		from: null,
		to: t
	};
}
function rr({ style: e = "inline", arrow: t = "→", showArrow: n = !0 } = {}) {
	return ({ value: r }) => {
		if (M(r)) return "";
		let { from: i, to: a } = nr(r), o = (e) => e == null || e === "";
		if (o(i) && o(a)) return "";
		if (o(i)) return j("span", { class: "sg-renderer-diff is-added" }, j("span", { class: "sg-diff-to" }, document.createTextNode(String(a))));
		if (o(a)) return j("span", { class: "sg-renderer-diff is-removed" }, j("span", { class: "sg-diff-from" }, document.createTextNode(String(i))));
		let s = j("span", { class: `sg-renderer-diff is-${e}` });
		return s.append(j("span", { class: "sg-diff-from" }, document.createTextNode(String(i)))), n && s.append(j("span", {
			class: "sg-diff-arrow",
			"aria-hidden": "true"
		}, document.createTextNode(t))), s.append(j("span", { class: "sg-diff-to" }, document.createTextNode(String(a)))), s;
	};
}
function ir(e) {
	if (e == null || e === "") return null;
	if (Array.isArray(e)) {
		let t = Number(e[0]), n = Number(e[1]);
		return Number.isFinite(t) && Number.isFinite(n) ? {
			lat: t,
			lng: n
		} : null;
	}
	if (typeof e == "object") {
		let t = Number(e.lat ?? e.latitude), n = Number(e.lng ?? e.long ?? e.lon ?? e.longitude);
		return Number.isFinite(t) && Number.isFinite(n) ? {
			lat: t,
			lng: n
		} : null;
	}
	let t = String(e).split(",");
	if (t.length !== 2) return null;
	let n = Number(t[0].trim()), r = Number(t[1].trim());
	return Number.isFinite(n) && Number.isFinite(r) ? {
		lat: n,
		lng: r
	} : null;
}
function ar(e, t) {
	let n = e >= 0 ? 1 : -1, r = Math.abs(e), i = Math.floor(r), a = (r - i) * 60, o = Math.floor(a), s = (a - o) * 60, c = t ? n > 0 ? "N" : "S" : n > 0 ? "E" : "W";
	return `${i}°${String(o).padStart(2, "0")}'${s.toFixed(1)}"${c}`;
}
function or({ decimals: e = 4, style: t = "decimal", mapUrl: n = (e, t) => `https://www.google.com/maps?q=${e},${t}`, linkText: r = "View on Maps", staticMap: i = null, staticSize: a = 72 } = {}) {
	return ({ value: o }) => {
		let s = ir(o);
		if (!s) return "";
		let c = j("span", { class: "sg-renderer-geo" });
		if (typeof i == "function") {
			let e = i(s.lat, s.lng);
			e && c.append(j("img", {
				src: e,
				alt: "",
				class: "sg-renderer-geo-thumb",
				width: String(a),
				height: String(a),
				loading: "lazy",
				decoding: "async"
			}));
		}
		let l = t === "dms" ? `${ar(s.lat, !0)} ${ar(s.lng, !1)}` : `${s.lat.toFixed(e)}, ${s.lng.toFixed(e)}`;
		c.append(j("span", { class: "sg-renderer-geo-coords" }, document.createTextNode(l)));
		let u = n(s.lat, s.lng);
		if (u) {
			let e = j("a", {
				class: "sg-renderer-geo-link sg-renderer-link",
				href: u,
				target: "_blank",
				rel: "noopener noreferrer",
				title: "Open in maps"
			}, document.createTextNode(r));
			e.addEventListener("click", (e) => e.stopPropagation()), c.append(e);
		}
		return c;
	};
}
function sr({ moduleSize: e = 3, margin: t = 2, background: n = "#fff", foreground: r = "#111827", showText: i = !1 } = {}) {
	return ({ value: a }) => {
		if (M(a)) return "";
		let o = String(a), s;
		try {
			s = Oe(ve(o), {
				moduleSize: e,
				margin: t,
				background: n,
				foreground: r
			});
		} catch {
			return j("span", {
				class: "sg-renderer-qr-overflow",
				title: o
			}, document.createTextNode("QR · too long"));
		}
		let c = j("span", { class: "sg-renderer-qr" });
		return c.innerHTML = s, i && c.append(j("span", { class: "sg-renderer-qr-text" }, document.createTextNode(o))), c;
	};
}
function cr({ language: e = null, copy: t = !0 } = {}) {
	return ({ value: n, td: r }) => {
		if (M(n)) return "";
		let i = String(n);
		if (r) {
			r.classList.add("sg-renderer-code-cell");
			let e = r.parentElement;
			e && e.tagName === "TR" && e.classList.add("sg-has-multiline");
		}
		let a = j("div", { class: "sg-renderer-code" });
		if (e && a.append(j("span", { class: "sg-renderer-code-lang" }, document.createTextNode(String(e)))), t) {
			let e = j("button", {
				type: "button",
				class: "sg-renderer-code-copy",
				title: "Copy",
				"aria-label": "Copy code"
			});
			e.innerHTML = ut, e.addEventListener("click", async (t) => {
				t.stopPropagation();
				try {
					navigator.clipboard?.writeText ? await navigator.clipboard.writeText(i) : pt(i), e.innerHTML = dt, e.classList.add("is-copied"), setTimeout(() => {
						e.innerHTML = ut, e.classList.remove("is-copied");
					}, 1200);
				} catch {}
			}), a.append(e);
		}
		let o = j("pre", { class: "sg-renderer-code-pre" });
		return o.textContent = i, a.append(o), a;
	};
}
var lr = "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M225.8 468.2L46.9 295.4C18.9 268.2 0 230.1 0 187.8C0 117.4 56.1 60 125.7 60c25.3 0 51 9.2 70.3 25.4L256 138l60-52.6C335.3 69.2 361 60 386.3 60C455.9 60 512 117.4 512 187.8c0 42.3-18.9 80.4-46.9 107.6L286.2 468.2c-7.2 7.4-17.1 11.8-27.6 11.8c-10.5 0-20.4-4.4-27.6-11.8z\"/></svg>", ur = "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75.1c16.3-13.2 28.9-30.4 36.6-50l8.1-20.3c5-12.4 11.3-24.2 19-35.2l4.4-6.3 0 0c1.4-2 1.1-4.7-.6-6.4l0 0c-3.8-3.8-9.9-3.8-13.7 0L208.8 84.9c-3 3-7 4.7-11.3 4.7c-8.8 0-16-7.2-16-16V63.4c0-8.8 7.2-16 16-16h.5c8.8 0 16 7.2 16 16v6.2c34-2.4 71-13 100-25.6c11-4.8 22.1-9.3 33-13.6l1-.4c12-4.6 27.3-9.3 41.4-9.3z\"/></svg>", dr = "<svg viewBox=\"0 0 512 512\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75.1c16.3 13.2 28.9 30.4 36.6 50l8.1 20.3c5 12.4 11.3 24.2 19 35.2l4.4 6.3c1.4 2 1.1 4.7-.6 6.4c-3.8 3.8-9.9 3.8-13.7 0L208.8 427.1c-3-3-7-4.7-11.3-4.7c-8.8 0-16 7.2-16 16v10.2c0 8.8 7.2 16 16 16h.5c8.8 0 16-7.2 16-16v-6.2c34 2.4 71 13 100 25.6c11 4.8 22.1 9.3 33 13.6l1 .4c12 4.6 27.3 9.3 41.4 9.3z\"/></svg>", fr = [
	"😞",
	"😕",
	"😐",
	"🙂",
	"😄"
], pr = {
	star: mn,
	heart: lr
}, mr = {
	star: "#f59e0b",
	heart: "#ec4899"
};
function hr({ icon: e = "heart", max: t = 5, precision: n = .5, color: r = null } = {}) {
	if (e === "smiley") return gr({ max: t });
	if (e === "thumb") return _r();
	if (e === "nps") return vr();
	let i = pr[e] || pr.heart, a = r || mr[e] || mr.heart, o = n > 0 ? 1 / n : 2;
	return ({ value: n }) => {
		let r = parseFloat(n);
		Number.isFinite(r) || (r = 0), r = Math.max(0, Math.min(t, r)), r = Math.round(r * o) / o;
		let s = j("div", {
			class: `sg-renderer-rating is-${e}`,
			style: `--rating-color: ${a};`,
			role: "img",
			"aria-label": `${r} out of ${t}`
		});
		for (let e = 1; e <= t; e++) if (r >= e) s.append(j("span", { class: "sg-renderer-rating-glyph is-full" }, i));
		else if (r > e - 1) {
			let t = Math.round((r - (e - 1)) * 100);
			s.append(j("span", { class: "sg-renderer-rating-glyph is-partial" }, `${i}<span class="sg-rating-clip" style="width:${t}%;">${i}</span>`));
		} else s.append(j("span", { class: "sg-renderer-rating-glyph is-empty" }, i));
		return s;
	};
}
function gr({ max: e = 5 } = {}) {
	return ({ value: t }) => {
		let n = parseFloat(t);
		if (!Number.isFinite(n)) return "";
		n = Math.max(1, Math.min(e, Math.round(n)));
		let r = Math.min(fr.length - 1, Math.floor((n - 1) / (e - 1 || 1) * (fr.length - 1)));
		return j("span", {
			class: "sg-renderer-rating-smiley",
			title: `${n}/${e}`
		}, document.createTextNode(fr[r]));
	};
}
function _r() {
	return ({ value: e }) => {
		if (e == null || e === "") return "";
		let t = Number(e);
		if (!Number.isFinite(t)) return "";
		let n = j("span", { class: "sg-renderer-rating-thumb" });
		return t > 0 ? (n.classList.add("is-up"), n.title = "Thumbs up", n.innerHTML = ur) : t < 0 ? (n.classList.add("is-down"), n.title = "Thumbs down", n.innerHTML = dr) : (n.classList.add("is-neutral"), n.title = "Neutral", n.append(document.createTextNode("—"))), n;
	};
}
function vr() {
	return ({ value: e }) => {
		let t = parseFloat(e);
		if (!Number.isFinite(t)) return "";
		let n = Math.max(0, Math.min(10, Math.round(t))), r = n <= 6 ? "detractor" : n <= 8 ? "passive" : "promoter", i = r === "detractor" ? "Detractor" : r === "passive" ? "Passive" : "Promoter";
		return j("span", {
			class: `sg-renderer-rating-nps is-${r}`,
			title: `${n}/10 · ${i}`
		}, document.createTextNode(String(n)));
	};
}
var yr = [
	"#e5e7eb",
	"#d1d5db",
	"#9ca3af"
];
function br({ min: e = 0, max: t = 100, target: n = null, ranges: r = null, rangeColors: i = yr, barColor: a = "#111827", targetColor: o = "#111827", width: s = 120, height: c = 16 } = {}) {
	return ({ value: l }) => {
		let u, d, f;
		if (l && typeof l == "object" && !Array.isArray(l) ? (u = Number(l.value), d = l.target == null ? n : Number(l.target), f = l.ranges || r) : (u = Number(l), d = n, f = r), !Number.isFinite(u)) return "";
		let p = t - e || 1, m = (n) => Math.max(e, Math.min(t, n)), h = (t) => (m(t) - e) / p * s, g = [
			e,
			...f && f.length ? f.map(Number) : [e + p * .6, e + p * .8],
			t
		], _ = "";
		for (let e = 0; e < g.length - 1; e++) {
			let t = h(g[e]), n = h(g[e + 1]) - t, r = i[e] || i[i.length - 1];
			_ += `<rect x="${t.toFixed(2)}" y="0" width="${n.toFixed(2)}" height="${c}" fill="${r}"/>`;
		}
		let v = c * .42, y = (c - v) / 2;
		if (_ += `<rect x="0" y="${y.toFixed(2)}" width="${h(u).toFixed(2)}" height="${v.toFixed(2)}" fill="${a}"/>`, d != null && Number.isFinite(d)) {
			let e = h(d), t = c * .85, n = (c - t) / 2;
			_ += `<rect x="${(e - 1).toFixed(2)}" y="${n.toFixed(2)}" width="2" height="${t.toFixed(2)}" fill="${o}"/>`;
		}
		return `<svg class="sg-renderer-bullet" viewBox="0 0 ${s} ${c}" width="${s}" height="${c}" preserveAspectRatio="none" aria-hidden="true">` + _ + "</svg>";
	};
}
function xr({ size: e = 28, thickness: t = 5, color: n = "green", background: r = "#e5e7eb", showValue: i = !0, inline: a = !1 } = {}) {
	let o = _t[n] || n;
	return ({ value: n }) => {
		let s = Number(n);
		if (!Number.isFinite(s)) return "";
		s = Math.max(0, Math.min(100, s));
		let c = (e - t) / 2, l = e / 2, u = e / 2, d = 2 * Math.PI * c, f = d * (1 - s / 100), p = `<text x="${l}" y="${u + .5}" text-anchor="middle" dominant-baseline="middle" font-size="${(e * .32).toFixed(1)}" font-weight="600" fill="currentColor">${Math.round(s)}</text>`, m = `<svg class="sg-renderer-donut" viewBox="0 0 ${e} ${e}" width="${e}" height="${e}" aria-hidden="true"><circle cx="${l}" cy="${u}" r="${c}" fill="none" stroke="${r}" stroke-width="${t}"/><circle cx="${l}" cy="${u}" r="${c}" fill="none" stroke="${o}" stroke-width="${t}" stroke-dasharray="${d.toFixed(2)}" stroke-dashoffset="${f.toFixed(2)}" stroke-linecap="round" transform="rotate(-90 ${l} ${u})"/>` + (i && !a ? p : "") + "</svg>";
		return a && i ? `<span class="sg-renderer-donut-wrap">${m}<span class="sg-renderer-donut-label">${Math.round(s)}%</span></span>` : m;
	};
}
function Sr({ width: e = 120, height: t = 32, color: n = "blue", highlightMax: r = !1, gap: i = 1, binLabels: a = null, showCount: o = !1 } = {}) {
	let s = _t[n] || n;
	return ({ value: n, td: c }) => {
		if (n == null || n === "") return "";
		c && c.classList.add("sg-renderer-histogram-cell");
		let l = n, u = a;
		if (n && typeof n == "object" && !Array.isArray(n) && (l = n.counts, u = n.labels || a), !Array.isArray(l)) return "";
		let d = l.map(Number).filter(Number.isFinite);
		if (d.length === 0) return "";
		let f = Math.max(...d, 1), p = d.reduce((e, t) => e + t, 0), m = u && u.length ? 10 : 0, h = e - 2, g = t - 2 - m, _ = Math.max(1, (h - (d.length - 1) * i) / d.length), v = "";
		for (let e = 0; e < d.length; e++) {
			let t = d[e], n = t / f * g, a = 1 + e * (_ + i), o = 1 + g - n, c = r ? t === f ? 1 : .45 : .85, l = u && u[e] != null ? `${u[e]}: ${t}` : `Bin ${e + 1}: ${t}`;
			v += `<rect x="${a.toFixed(2)}" y="${o.toFixed(2)}" width="${_.toFixed(2)}" height="${n.toFixed(2)}" fill="${s}" fill-opacity="${c}"><title>${Hn(l)}</title></rect>`;
		}
		let y = "";
		if (u && u.length) for (let e = 0; e < d.length && e < u.length; e++) {
			let n = 1 + e * (_ + i) + _ / 2;
			y += `<text x="${n.toFixed(2)}" y="${(t - 1).toFixed(2)}" text-anchor="middle" font-size="7" fill="currentColor" opacity="0.65">${Hn(u[e])}</text>`;
		}
		let b = `<svg class="sg-renderer-histogram" viewBox="0 0 ${e} ${t}" width="${e}" height="${t}" preserveAspectRatio="none" aria-hidden="true">` + v + y + "</svg>";
		return o ? `<span class="sg-renderer-histogram-wrap">${b}<span class="sg-renderer-histogram-total">n=${p}</span></span>` : b;
	};
}
var Cr = {
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
}, wr = {
	red: "#ef4444",
	amber: "#f59e0b",
	green: "#10b981"
};
function Tr({ size: e = 10, thresholds: t = null, inverted: n = !1, showLabel: r = !1 } = {}) {
	return ({ value: i }) => {
		if (M(i)) return "";
		let a;
		if (t && Number.isFinite(Number(i))) {
			let e = Number(i), r = n ? t[1] : t[0], o = n ? t[0] : t[1];
			a = n ? e >= r ? "red" : e >= o ? "amber" : "green" : e <= r ? "red" : e <= o ? "amber" : "green";
		} else if (a = Cr[String(i).toLowerCase()] || null, !a) return "";
		let o = j("span", {
			class: `sg-renderer-rag is-${a}`,
			title: r ? null : a.charAt(0).toUpperCase() + a.slice(1)
		});
		return o.append(j("span", {
			class: "sg-renderer-rag-dot",
			style: `width:${e}px; height:${e}px; background:${wr[a]};`,
			"aria-label": a
		})), r && o.append(j("span", { class: "sg-renderer-rag-label" }, document.createTextNode(a.charAt(0).toUpperCase() + a.slice(1)))), o;
	};
}
function Er({ steps: e = [
	"Pending",
	"Shipped",
	"Delivered"
], color: t = "#2563eb", showLabels: n = !1 } = {}) {
	return ({ value: r, td: i }) => {
		if (M(r)) return "";
		i && i.classList.add("sg-renderer-timeline-cell");
		let a = -1;
		if (Number.isFinite(Number(r))) a = Math.max(0, Math.min(e.length - 1, Math.floor(Number(r))));
		else {
			let t = String(r).toLowerCase();
			a = e.findIndex((e) => String(e).toLowerCase() === t);
		}
		if (a < 0) return "";
		let o = j("div", {
			class: `sg-renderer-timeline${n ? " has-labels" : ""}`,
			style: `--ts-color: ${t};`,
			role: "list",
			"aria-label": `Step ${a + 1} of ${e.length}: ${e[a]}`
		});
		for (let t = 0; t < e.length; t++) {
			let r = j("span", {
				class: `sg-timeline-step is-${t < a ? "past" : t === a ? "current" : "future"}`,
				role: "listitem"
			});
			if (r.append(j("span", {
				class: "sg-timeline-dot",
				title: e[t],
				"aria-label": e[t]
			})), n && r.append(j("span", { class: "sg-timeline-label" }, document.createTextNode(e[t]))), o.append(r), t < e.length - 1) {
				let e = t < a ? "past" : "future";
				o.append(j("span", {
					class: `sg-timeline-line is-${e}`,
					"aria-hidden": "true"
				}));
			}
		}
		return o;
	};
}
var Dr = /([@#][a-zA-Z0-9_\-]+)/g;
function Or({ mentionHref: e = null, tagHref: t = null } = {}) {
	return ({ value: n }) => {
		if (M(n)) return "";
		let r = String(n), i = j("span", { class: "sg-renderer-mentions" }), a = r.split(Dr);
		for (let n of a) if (n) if (n[0] === "@") {
			let t = n.slice(1), r = typeof e == "function" ? e(t) : null;
			i.append(kr(n, r, "sg-renderer-mention"));
		} else if (n[0] === "#") {
			let e = n.slice(1), r = typeof t == "function" ? t(e) : null;
			i.append(kr(n, r, "sg-renderer-hashtag"));
		} else i.append(document.createTextNode(n));
		return i;
	};
}
function kr(e, t, n) {
	let r = t ? j("a", {
		href: t,
		target: "_blank",
		rel: "noopener noreferrer",
		class: n
	}) : j("span", { class: n });
	return t && r.addEventListener("click", (e) => e.stopPropagation()), r.append(document.createTextNode(e)), r;
}
function Ar({ chars: e = null, lines: t = null, moreLabel: n = "Read more", lessLabel: r = "Show less" } = {}) {
	return ({ value: i, td: a }) => {
		if (M(i)) return "";
		let o = String(i), s = e && o.length > e;
		if (!s && t && /\n/.test(o), !s && !t) return o;
		if (a) {
			a.classList.add("sg-renderer-expand-cell");
			let e = a.parentElement;
			e && e.tagName === "TR" && e.classList.add("sg-has-multiline");
		}
		let c = j("div", { class: "sg-renderer-expand" }), l = !1;
		if (s) {
			let t = o.slice(0, e).trimEnd() + "…", i = j("span", { class: "sg-renderer-expand-short" }, document.createTextNode(t)), a = j("span", {
				class: "sg-renderer-expand-full",
				hidden: ""
			}, document.createTextNode(o)), s = j("button", {
				type: "button",
				class: "sg-renderer-expand-toggle"
			}, document.createTextNode(n));
			s.addEventListener("click", (e) => {
				e.stopPropagation(), l = !l, i.hidden = l, a.hidden = !l, s.textContent = l ? r : n;
			}), c.append(i, a, document.createTextNode(" "), s);
		} else {
			let e = j("div", { class: "sg-renderer-expand-clamp" });
			e.style.setProperty("--sg-clamp", String(t)), e.textContent = o;
			let i = j("button", {
				type: "button",
				class: "sg-renderer-expand-toggle"
			}, document.createTextNode(n));
			i.addEventListener("click", (t) => {
				t.stopPropagation(), l = !l, e.classList.toggle("is-expanded", l), i.textContent = l ? r : n;
			}), c.append(e, i);
		}
		return c;
	};
}
function jr({ unit: e = "kilometer", unitDisplay: t = "short", decimals: n, locale: r = void 0, ...i } = {}) {
	let a = {
		style: "unit",
		unit: e,
		unitDisplay: t,
		...i
	};
	n != null && (a.minimumFractionDigits = n, a.maximumFractionDigits = n);
	let o;
	try {
		o = new Intl.NumberFormat(r, a);
	} catch {
		let e = n == null ? {} : {
			minimumFractionDigits: n,
			maximumFractionDigits: n
		};
		o = new Intl.NumberFormat(r, e);
	}
	return ({ value: e, td: t }) => {
		if (t && t.classList.add("sg-renderer-number"), M(e)) return "";
		let n = Number(e);
		return Number.isFinite(n) ? o.format(n) : String(e);
	};
}
var Mr = /^((25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(25[0-5]|2[0-4]\d|[01]?\d?\d)$/, Nr = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|:(:[0-9a-fA-F]{1,4}){1,7}|::)$/;
function Pr(e) {
	return Mr.test(e);
}
function Fr(e) {
	return Nr.test(e);
}
function Ir({ countryField: e = null } = {}) {
	return ({ value: t, row: n }) => {
		if (M(t)) return "";
		let r = String(t).trim(), i = Pr(r), a = !i && Fr(r);
		if (!i && !a) return j("span", {
			class: "sg-renderer-ip is-invalid",
			title: "Invalid IP address"
		}, document.createTextNode(r));
		let o = j("span", {
			class: `sg-renderer-ip ${a ? "is-v6" : "is-v4"}`,
			title: i ? "IPv4" : "IPv6"
		});
		if (e && n?.[e]) {
			let t = String(n[e]).trim().toUpperCase();
			if (/^[A-Z]{2}$/.test(t)) {
				let e = String.fromCodePoint(127462 + t.charCodeAt(0) - 65, 127462 + t.charCodeAt(1) - 65);
				o.append(j("span", {
					class: "sg-renderer-ip-flag",
					"aria-hidden": "true"
				}, document.createTextNode(e)));
			}
		}
		return o.append(j("span", { class: "sg-renderer-ip-text" }, document.createTextNode(r))), o;
	};
}
var Lr = {
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
function Rr({ banks: e = Lr, showBank: t = !0 } = {}) {
	return ({ value: n }) => {
		if (M(n)) return "";
		let r = String(n).trim(), i = r.replace(/\D/g, "");
		if (i.length !== 6) return j("span", {
			class: "sg-renderer-invalid",
			title: "Invalid BSB — must be 6 digits"
		}, document.createTextNode(r));
		let a = `${i.slice(0, 3)}-${i.slice(3)}`, o = e[i.slice(0, 2)], s = j("span", { class: "sg-renderer-bsb" });
		return s.append(j("span", { class: "sg-renderer-bsb-number sg-renderer-mono" }, document.createTextNode(a))), t && o && s.append(j("span", { class: "sg-renderer-bsb-bank" }, document.createTextNode(o))), s;
	};
}
function zr(e) {
	let t = String(e).replace(/\s+/g, "");
	if (t.length !== 9 || !/^\d{9}$/.test(t)) return !1;
	let n = [
		8,
		7,
		6,
		5,
		4,
		3,
		2,
		1
	], r = 0;
	for (let e = 0; e < 8; e++) r += parseInt(t[e], 10) * n[e];
	return parseInt(t[8], 10) === (10 - r % 10) % 10;
}
function Br(e) {
	let t = String(e).replace(/\D/g, "");
	return t.length === 9 ? `${t.slice(0, 3)} ${t.slice(3, 6)} ${t.slice(6)}` : String(e);
}
function Vr() {
	return ({ value: e }) => M(e) ? "" : zr(e) ? j("a", {
		class: "sg-renderer-link sg-renderer-mono",
		href: `https://abr.business.gov.au/Search/ResultsActiveASIC?SearchText=${String(e).replace(/\s+/g, "")}`,
		target: "_blank",
		rel: "noopener noreferrer",
		title: "Look up on ABR"
	}, document.createTextNode(Br(e))) : j("span", {
		class: "sg-renderer-invalid",
		title: "Invalid ACN (checksum failed)"
	}, document.createTextNode(String(e)));
}
function Hr() {
	return ({ value: e, td: t }) => {
		if (t && t.classList.add("sg-renderer-mask-numeric"), M(e)) return "";
		let n = String(e), r = n.replace(/\D/g, "");
		if (r.length < 8 || r.length > 9) return j("span", {
			class: "sg-renderer-invalid",
			title: "Invalid TFN — must be 8 or 9 digits"
		}, document.createTextNode(n));
		let i = r.slice(-3), a = r.length - 3, o = "•".repeat(a);
		return r.length === 9 ? `${o.slice(0, 3)} ${o.slice(3)} ${i}` : `${o.slice(0, 2)} ${o.slice(2)} ${i}`;
	};
}
function Ur(e) {
	if (e.length !== 10 || !/^[2-6]\d{9}$/.test(e)) return !1;
	let t = [
		1,
		3,
		7,
		9,
		1,
		3,
		7,
		9
	], n = 0;
	for (let r = 0; r < 8; r++) n += parseInt(e[r], 10) * t[r];
	return n % 10 === parseInt(e[8], 10);
}
function Wr() {
	return ({ value: e }) => {
		if (M(e)) return "";
		let t = String(e).trim().replace(/\s+/g, ""), n = /^(\d{10})(?:[\/-]?(\d))?$/.exec(t);
		if (!n || !Ur(n[1])) return j("span", {
			class: "sg-renderer-invalid",
			title: n ? "Invalid Medicare (checksum failed)" : "Invalid Medicare format"
		}, document.createTextNode(String(e)));
		let r = n[1], i = n[2], a = `${r.slice(0, 4)} ${r.slice(4, 9)} ${r.slice(9)}` + (i ? ` / ${i}` : "");
		return j("span", { class: "sg-renderer-medicare sg-renderer-mono" }, document.createTextNode(a));
	};
}
function Gr({ preload: e = "none" } = {}) {
	return ({ value: t }) => M(t) ? "" : j("audio", {
		class: "sg-renderer-audio",
		controls: "",
		preload: e,
		src: String(t).trim()
	});
}
function Kr({ width: e = 200, preload: t = "metadata" } = {}) {
	return ({ value: n }) => M(n) ? "" : j("video", {
		class: "sg-renderer-video",
		controls: "",
		preload: t,
		src: String(n).trim(),
		width: String(e)
	});
}
function qr({ sort: e = "count" } = {}) {
	return ({ value: t }) => {
		if (M(t)) return "";
		let n = [];
		if (Array.isArray(t)) n = t.map((e) => Array.isArray(e) ? e : [e.emoji ?? e.name ?? "?", e.count ?? e.n ?? 0]);
		else if (typeof t == "object") n = Object.entries(t);
		else return "";
		if (n = n.filter(([, e]) => Number.isFinite(Number(e)) && Number(e) > 0), e === "count" && n.sort((e, t) => Number(t[1]) - Number(e[1])), n.length === 0) return "";
		let r = j("span", { class: "sg-renderer-reactions" });
		for (let [e, t] of n) {
			let n = j("span", {
				class: "sg-reaction",
				title: `${t} ${e}`
			});
			n.append(j("span", { class: "sg-reaction-emoji" }, document.createTextNode(String(e)))), n.append(j("span", { class: "sg-reaction-count" }, document.createTextNode(String(t)))), r.append(n);
		}
		return r;
	};
}
function Jr({ icon: e = "💬" } = {}) {
	return ({ value: t }) => {
		if (M(t)) return "";
		let n = "", r = null;
		typeof t == "object" ? (n = t.value ?? t.text ?? "", r = t.count ?? t.comments ?? null) : Number.isFinite(Number(t)) && typeof t != "string" ? r = Number(t) : n = String(t);
		let i = j("span", { class: "sg-renderer-comment-count" });
		if (n && i.append(j("span", { class: "sg-cc-value" }, document.createTextNode(String(n)))), r != null && Number(r) > 0) {
			let t = j("span", {
				class: "sg-cc-badge",
				title: `${r} comment${Number(r) === 1 ? "" : "s"}`
			}), n = j("span", {
				class: "sg-cc-icon",
				"aria-hidden": "true"
			});
			typeof e == "string" && e.trimStart().startsWith("<svg") ? n.innerHTML = e : n.append(document.createTextNode(String(e))), t.append(n), t.append(j("span", { class: "sg-cc-num" }, document.createTextNode(String(r)))), i.append(t);
		}
		return i;
	};
}
function Yr({ locale: e = void 0 } = {}) {
	let t = new Intl.Locale(e || Intl.NumberFormat().resolvedOptions().locale).language === "en", n = t ? new Intl.PluralRules(e, { type: "ordinal" }) : null, r = {
		one: "st",
		two: "nd",
		few: "rd",
		other: "th"
	};
	return ({ value: e, td: i }) => {
		if (i && i.classList.add("sg-renderer-number"), M(e)) return "";
		let a = Number(e);
		return Number.isInteger(a) ? t ? `${a}${r[n.select(a)]}` : String(a) : String(e);
	};
}
function Xr({ one: e = "item", other: t = "items", zero: n = null, locale: r = void 0 } = {}) {
	let i = new Intl.PluralRules(r);
	return ({ value: r, td: a }) => {
		if (a && a.classList.add("sg-renderer-number"), M(r)) return "";
		let o = Number(r);
		return Number.isFinite(o) ? o === 0 && n ? `${o} ${n}` : i.select(o) === "one" ? `${o} ${e}` : `${o} ${t}` : String(r);
	};
}
var Zr = /* @__PURE__ */ new Set([
	"",
	"null",
	"nil",
	"none",
	"n/a",
	"na",
	"-",
	"—"
]);
function Qr({ placeholder: e = "—", emptyOnTokens: t = !0 } = {}) {
	return ({ value: n }) => n == null || typeof n == "string" && (n === "" || t && Zr.has(n.trim().toLowerCase())) ? j("span", {
		class: "sg-renderer-empty",
		title: "Empty"
	}, document.createTextNode(e)) : String(n);
}
function $r(e) {
	let t = 0, n = !1;
	for (let r = e.length - 1; r >= 0; r--) {
		let i = parseInt(e[r], 10);
		n && (i *= 2, i > 9 && (i -= 9)), t += i, n = !n;
	}
	return t % 10 == 0;
}
function ei(e) {
	return /^4\d{12}(\d{3,6})?$/.test(e) ? "visa" : /^(5[1-5]\d{14}|2(2[2-9]|[3-6]\d|7[01]|720)\d{12})$/.test(e) ? "mastercard" : /^3[47]\d{13}$/.test(e) ? "amex" : /^(6011\d{12,15}|65\d{14,17}|64[4-9]\d{13}|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9([01]\d|2[0-5]))\d{10,13})$/.test(e) ? "discover" : /^35(2[89]|[3-8]\d)\d{12}$/.test(e) ? "jcb" : /^3(0[0-5]|[68]\d|9\d)\d{11}$/.test(e) ? "diners" : null;
}
function ti({ mask: e = !0 } = {}) {
	return ({ value: t, td: n }) => {
		if (n && n.classList.add("sg-renderer-number"), M(t)) return "";
		let r = String(t).replace(/\D/g, ""), i = r.length >= 13 && r.length <= 19, a = i && $r(r), o = i ? ei(r) : null, s = j("span", { class: `sg-renderer-card${a ? "" : " is-invalid"}` });
		o && s.append(j("span", {
			class: `sg-renderer-card-brand is-${o}`,
			title: o[0].toUpperCase() + o.slice(1)
		}, document.createTextNode(o === "mastercard" ? "MC" : o.toUpperCase())));
		let c;
		if (!i) c = String(t);
		else {
			let t = e ? "•".repeat(r.length - 4) + r.slice(-4) : r;
			c = o === "amex" || o === "diners" ? `${t.slice(0, 4)} ${t.slice(4, 10)} ${t.slice(10)}` : t.match(/.{1,4}/g).join(" ");
		}
		return s.append(j("span", { class: "sg-renderer-card-num sg-renderer-mono" }, document.createTextNode(c))), s;
	};
}
function ni({ width: e = "70%", height: t = "12px" } = {}) {
	return ({ value: n }) => n != null && n !== "" && n !== "loading" && n !== "…" ? String(n) : j("span", {
		class: "sg-renderer-shimmer",
		style: `width: ${e}; height: ${t};`,
		"aria-label": "Loading"
	});
}
function L(e) {
	return Array.isArray(e) ? e.map((e) => e == null ? null : typeof e == "object" ? {
		value: e.value,
		label: e.label ?? String(e.value),
		color: e.color || null,
		icon: e.icon || null
	} : {
		value: e,
		label: String(e),
		color: null,
		icon: null
	}).filter(Boolean) : [];
}
function R(e, t) {
	let n = j("span", { class: "sg-renderer-select-pill" });
	return e.color ? t.test(e.color) ? n.classList.add(`sg-pill-${e.color}`) : (n.style.background = e.color, n.style.color = $n(e.color)) : n.classList.add("sg-renderer-select-pill-bare"), e.icon && n.append(j("span", {
		class: "sg-renderer-select-pill-icon",
		"aria-hidden": "true"
	}, e.icon)), n.append(j("span", { class: "sg-renderer-select-pill-label" }, document.createTextNode(e.label))), n;
}
var z = /^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/;
function ri(e, t) {
	let n = e?.col?.cellRendererConfig || null, r = e?.col?.enumValues || null;
	return {
		options: t.options.length ? t.options : n?.options || r || [],
		placeholder: n?.placeholder ?? t.placeholder,
		clearable: n?.clearable ?? t.clearable,
		colorMap: n?.colorMap ?? t.colorMap,
		editable: n?.editable ?? t.editable,
		separator: n?.separator ?? t.separator
	};
}
function ii({ options: e = [], placeholder: t = "Select…", editable: n = !0, clearable: r = !1, colorMap: i = null } = {}) {
	let a = L(e);
	if (i && typeof i == "object") for (let e of a) !e.color && Object.prototype.hasOwnProperty.call(i, e.value) && (e.color = i[e.value]);
	return (e) => {
		let { value: o, td: s } = e, c = ri(e, {
			options: a,
			placeholder: t,
			clearable: r,
			colorMap: i,
			editable: n
		}), l = a;
		if (a.length === 0 && c.options.length && (l = L(c.options), c.colorMap && typeof c.colorMap == "object")) for (let e of l) !e.color && Object.prototype.hasOwnProperty.call(c.colorMap, e.value) && (e.color = c.colorMap[e.value]);
		s && (s.classList.add("sg-renderer-select-cell"), s._sgSelectOpts = l, s._sgSelectClearable = c.clearable), c.editable && s && !s._sgSelectEditBound && (s._sgSelectEditBound = !0, s.addEventListener("dblclick", (t) => {
			t._sgSelectHandled || (t._sgSelectHandled = !0, t.stopPropagation(), oi(s, e));
		}));
		let u = l.find((e) => String(e.value) === String(o)) || null;
		return u ? R(u, z) : M(o) ? j("span", { class: "sg-renderer-select-placeholder" }, document.createTextNode(c.placeholder)) : j("span", { class: "sg-renderer-select-bare" }, document.createTextNode(String(o)));
	};
}
function B(e) {
	if (!e) return;
	let t = e.closest("[data-controller~=\"grid\"]");
	if (t) try {
		t.focus({ preventScroll: !0 });
	} catch {}
}
var ai = null;
function oi(e, t) {
	si();
	let n = e._sgSelectOpts || [], r = e._sgSelectClearable, { row: i, col: a } = t, o = i && a?.field != null ? i[a.field] : null, s = j("div", {
		class: "sg-renderer-select-popover",
		role: "listbox"
	});
	s.addEventListener("mousedown", (e) => e.stopPropagation());
	function c(n) {
		let { api: r } = t, o = i && a?.field != null ? i[a.field] : null;
		i && a?.field != null && (i[a.field] = n), r?.applyTransaction && r.applyTransaction({ update: [i] });
		let s = e.closest("[data-controller~=\"grid\"]");
		s && s.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
			bubbles: !0,
			detail: {
				rowId: i?.id ?? i?._sg_id,
				colId: a?.field,
				oldValue: o,
				newValue: n
			}
		})), si();
	}
	if (r) {
		let e = j("button", {
			type: "button",
			class: "sg-renderer-select-option sg-renderer-select-option-none",
			role: "option"
		}, document.createTextNode("(none)"));
		e.addEventListener("click", () => c(null)), s.append(e);
	}
	for (let e of n) {
		let t = j("button", {
			type: "button",
			class: `sg-renderer-select-option${String(e.value) === String(o) ? " is-selected" : ""}`,
			role: "option"
		});
		t.append(R(e, z)), t.addEventListener("click", () => c(e.value)), s.append(t);
	}
	function l(e) {
		e.key === "Escape" && (e.stopPropagation(), si());
	}
	function u(t) {
		!s.contains(t.target) && !e.contains(t.target) && si();
	}
	document.addEventListener("keydown", l), setTimeout(() => document.addEventListener("mousedown", u), 0), document.body.appendChild(s), F(s, e), ai = {
		pop: s,
		onKey: l,
		onDocClick: u,
		anchor: e
	};
}
function si() {
	if (!ai) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = ai;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), ai = null, B(r);
}
function ci(e) {
	return e == null || e === "" ? [] : Array.isArray(e) ? e.map(String) : String(e).split(",").map((e) => e.trim()).filter(Boolean);
}
function li({ options: e = [], separator: t = ",", placeholder: n = "Add tags…", editable: r = !0, colorMap: i = null } = {}) {
	let a = L(e);
	if (i && typeof i == "object") for (let e of a) !e.color && Object.prototype.hasOwnProperty.call(i, e.value) && (e.color = i[e.value]);
	return (e) => {
		let { value: o, td: s } = e, c = ri(e, {
			options: a,
			placeholder: n,
			colorMap: i,
			editable: r,
			separator: t
		}), l = a;
		if (a.length === 0 && c.options.length && (l = L(c.options), c.colorMap && typeof c.colorMap == "object")) for (let e of l) !e.color && Object.prototype.hasOwnProperty.call(c.colorMap, e.value) && (e.color = c.colorMap[e.value]);
		s && (s.classList.add("sg-renderer-multiselect-cell"), s._sgMultiOpts = l, s._sgMultiSep = c.separator), c.editable && s && !s._sgMultiEditBound && (s._sgMultiEditBound = !0, s.addEventListener("dblclick", (t) => {
			t._sgMultiHandled || (t._sgMultiHandled = !0, t.stopPropagation(), di(s, e));
		}));
		let u = ci(o);
		if (!u.length) return j("span", { class: "sg-renderer-multiselect-placeholder" }, document.createTextNode(c.placeholder));
		let d = j("div", { class: "sg-renderer-multiselect" });
		for (let e of u) {
			let t = l.find((t) => String(t.value) === String(e)) || {
				value: e,
				label: e,
				color: null,
				icon: null
			};
			d.append(R(t, z));
		}
		return d;
	};
}
var ui = null;
function di(e, t) {
	fi();
	let n = e._sgMultiOpts || [], r = e._sgMultiSep || ",", { row: i, col: a } = t, o = ci(i && a?.field != null ? i[a.field] : null), s = new Set(o), c = j("div", {
		class: "sg-renderer-multiselect-popover",
		role: "listbox",
		"aria-multiselectable": "true"
	});
	c.addEventListener("mousedown", (e) => e.stopPropagation());
	function l(e) {
		let t = s.has(String(e.value)), n = j("button", {
			type: "button",
			class: `sg-renderer-multiselect-option${t ? " is-selected" : ""}`,
			role: "option",
			"aria-selected": t ? "true" : "false"
		});
		return n.append(j("span", { class: `sg-renderer-multiselect-check${t ? " is-on" : ""}` }, document.createTextNode(t ? "✓" : ""))), n.append(R(e, z)), n.addEventListener("click", () => {
			s.has(String(e.value)) ? s.delete(String(e.value)) : s.add(String(e.value)), c.replaceChildren(), u();
		}), n;
	}
	function u() {
		for (let e of n) c.append(l(e));
	}
	u();
	function d() {
		let { api: n } = t, o = Array.from(s), c = i && a?.field != null ? i[a.field] : null, l = Array.isArray(c) || c == null ? o : o.join(r), u = c;
		i && a?.field != null && (i[a.field] = l), n?.applyTransaction && n.applyTransaction({ update: [i] });
		let d = e.closest("[data-controller~=\"grid\"]");
		d && d.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
			bubbles: !0,
			detail: {
				rowId: i?.id ?? i?._sg_id,
				colId: a?.field,
				oldValue: u,
				newValue: l
			}
		})), fi();
	}
	function f(e) {
		e.key === "Escape" && (e.stopPropagation(), fi()), e.key === "Enter" && (e.stopPropagation(), e.preventDefault(), d());
	}
	function p(t) {
		!c.contains(t.target) && !e.contains(t.target) && d();
	}
	document.addEventListener("keydown", f), setTimeout(() => document.addEventListener("mousedown", p), 0), document.body.appendChild(c), F(c, e), ui = {
		pop: c,
		onKey: f,
		onDocClick: p,
		anchor: e
	};
}
function fi() {
	if (!ui) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = ui;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), ui = null, B(r);
}
function pi({ options: e = [], placeholder: t = "Search…", editable: n = !0, allowCustom: r = !1, colorMap: i = null } = {}) {
	let a = L(e);
	if (i && typeof i == "object") for (let e of a) !e.color && Object.prototype.hasOwnProperty.call(i, e.value) && (e.color = i[e.value]);
	return (e) => {
		let { value: o, td: s } = e, c = ri(e, {
			options: a,
			placeholder: t,
			colorMap: i,
			editable: n
		}), l = e?.col?.cellRendererConfig?.allowCustom ?? r, u = a;
		if (a.length === 0 && c.options.length && (u = L(c.options), c.colorMap && typeof c.colorMap == "object")) for (let e of u) !e.color && Object.prototype.hasOwnProperty.call(c.colorMap, e.value) && (e.color = c.colorMap[e.value]);
		s && (s.classList.add("sg-renderer-combobox-cell"), s._sgComboOpts = u, s._sgComboAllowCustom = l, s._sgComboPlaceholder = c.placeholder), c.editable && s && !s._sgComboEditBound && (s._sgComboEditBound = !0, s.addEventListener("dblclick", (t) => {
			t._sgComboHandled || (t._sgComboHandled = !0, t.stopPropagation(), hi(s, e));
		}));
		let d = u.find((e) => String(e.value) === String(o)) || null;
		return d ? R(d, z) : M(o) ? j("span", { class: "sg-renderer-select-placeholder" }, document.createTextNode(c.placeholder)) : j("span", { class: "sg-renderer-select-bare" }, document.createTextNode(String(o)));
	};
}
var mi = null;
function hi(e, t) {
	gi();
	let n = e._sgComboOpts || [], r = !!e._sgComboAllowCustom, i = e._sgComboPlaceholder || "Search…", { row: a, col: o } = t, s = "", c = 0, l = j("div", {
		class: "sg-renderer-combobox-popover",
		role: "combobox"
	});
	l.addEventListener("mousedown", (e) => e.stopPropagation());
	let u = j("input", {
		type: "search",
		class: "sg-renderer-combobox-input",
		placeholder: i,
		autocomplete: "off"
	});
	l.append(u);
	let d = j("div", {
		class: "sg-renderer-combobox-list",
		role: "listbox"
	});
	l.append(d);
	function f(n) {
		let { api: r } = t, i = a && o?.field != null ? a[o.field] : null;
		a && o?.field != null && (a[o.field] = n), r?.applyTransaction && r.applyTransaction({ update: [a] });
		let s = e.closest("[data-controller~=\"grid\"]");
		s && s.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
			bubbles: !0,
			detail: {
				rowId: a?.id ?? a?._sg_id,
				colId: o?.field,
				oldValue: i,
				newValue: n
			}
		})), gi();
	}
	function p() {
		let e = s.trim().toLowerCase();
		return e ? n.filter((t) => String(t.label).toLowerCase().includes(e)) : n;
	}
	function m() {
		d.replaceChildren();
		let e = p();
		if (c >= e.length && (c = Math.max(0, e.length - 1)), e.forEach((e, t) => {
			let n = j("button", {
				type: "button",
				class: `sg-renderer-combobox-option${t === c ? " is-highlighted" : ""}`,
				role: "option",
				"aria-selected": t === c ? "true" : "false"
			});
			n.append(R(e, z)), n.addEventListener("mouseenter", () => {
				c = t, h();
			}), n.addEventListener("click", () => f(e.value)), d.append(n);
		}), e.length === 0) {
			let e = j("div", { class: "sg-renderer-combobox-empty" });
			r && s.trim() ? e.append(document.createTextNode(`Press Enter to add "${s.trim()}"`)) : e.append(document.createTextNode("No matches")), d.append(e);
		}
	}
	function h() {
		d.querySelectorAll(".sg-renderer-combobox-option").forEach((e, t) => {
			e.classList.toggle("is-highlighted", t === c), e.setAttribute("aria-selected", t === c ? "true" : "false");
		});
	}
	u.addEventListener("input", () => {
		s = u.value, c = 0, m();
	}), u.addEventListener("keydown", (e) => {
		let t = p();
		e.key === "ArrowDown" ? (e.preventDefault(), c = Math.min(t.length - 1, c + 1), h()) : e.key === "ArrowUp" ? (e.preventDefault(), c = Math.max(0, c - 1), h()) : e.key === "Enter" ? (e.preventDefault(), t[c] ? f(t[c].value) : r && s.trim() && f(s.trim())) : e.key === "Escape" && (e.stopPropagation(), gi());
	});
	function g(e) {
		e.key === "Escape" && (e.stopPropagation(), gi());
	}
	function _(t) {
		!l.contains(t.target) && !e.contains(t.target) && gi();
	}
	document.addEventListener("keydown", g), setTimeout(() => document.addEventListener("mousedown", _), 0), document.body.appendChild(l), F(l, e), m(), setTimeout(() => u.focus(), 0), mi = {
		pop: l,
		onKey: g,
		onDocClick: _,
		anchor: e
	};
}
function gi() {
	if (!mi) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = mi;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), mi = null, B(r);
}
function _i(e) {
	return e ? `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}` : "";
}
function V(e, t) {
	return e && t && e.getFullYear() === t.getFullYear() && e.getMonth() === t.getMonth() && e.getDate() === t.getDate();
}
function vi({ locale: e = void 0, dateStyle: t = "medium", editable: n = !0, empty: r = "", min: i = null, max: a = null, firstDayOfWeek: o = 1 } = {}) {
	let s = new Intl.DateTimeFormat(e, { dateStyle: t });
	return (e) => {
		let { value: t, td: c } = e, l = e?.col?.cellRendererConfig || {}, u = l.min ? N(l.min) : i ? N(i) : null, d = l.max ? N(l.max) : a ? N(a) : null, f = l.firstDayOfWeek ?? o, p = l.editable ?? n;
		c && (c.classList.add("sg-renderer-datepicker-cell"), c._sgDatePickerMin = u, c._sgDatePickerMax = d, c._sgDatePickerFdow = f), p && c && !c._sgDatePickerBound && (c._sgDatePickerBound = !0, c.addEventListener("dblclick", (t) => {
			t._sgDatePickerHandled || (t._sgDatePickerHandled = !0, t.stopPropagation(), Ci(c, e));
		}));
		let m = N(t);
		return m ? j("span", { class: "sg-renderer-datepicker-value" }, document.createTextNode(s.format(m))) : r ? document.createTextNode(r) : "";
	};
}
var yi = null, bi = [
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
], xi = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat"
];
function Si(e, t, n, r, i, a, o) {
	let s = j("div", { class: "sg-renderer-datepicker-cal" }), c = j("div", { class: "sg-renderer-datepicker-head" }), l = j("button", {
		type: "button",
		class: "sg-renderer-datepicker-nav",
		"aria-label": "Previous month"
	}, document.createTextNode("‹")), u = j("span", { class: "sg-renderer-datepicker-title" }, document.createTextNode(`${bi[t]} ${e}`)), d = j("button", {
		type: "button",
		class: "sg-renderer-datepicker-nav",
		"aria-label": "Next month"
	}, document.createTextNode("›"));
	c.append(l, u, d);
	let f = j("div", { class: "sg-renderer-datepicker-dows" });
	for (let e = 0; e < 7; e++) f.append(j("span", { class: "sg-renderer-datepicker-dow" }, document.createTextNode(xi[(e + o) % 7])));
	let p = j("div", { class: "sg-renderer-datepicker-grid" }), m = (new Date(e, t, 1).getDay() - o + 7) % 7, h = new Date(e, t, 1 - m), g = /* @__PURE__ */ new Date();
	for (let e = 0; e < 42; e++) {
		let o = new Date(h.getFullYear(), h.getMonth(), h.getDate() + e), s = o.getMonth() === t, c = V(o, n), l = V(o, g), u = i && o < i || a && o > a, d = ["sg-renderer-datepicker-day"];
		s || d.push("is-other-month"), c && d.push("is-selected"), l && d.push("is-today"), u && d.push("is-disabled");
		let f = j("button", {
			type: "button",
			class: d.join(" "),
			disabled: u ? "" : null,
			title: _i(o)
		}, document.createTextNode(String(o.getDate())));
		f.addEventListener("click", () => r(o)), p.append(f);
	}
	return s.append(c, f, p), {
		wrap: s,
		prev: l,
		next: d,
		title: u
	};
}
function Ci(e, t) {
	wi();
	let { row: n, col: r } = t, i = N(n && r?.field != null ? n[r.field] : null), a = (i || /* @__PURE__ */ new Date()).getFullYear(), o = (i || /* @__PURE__ */ new Date()).getMonth(), s = i, c = e._sgDatePickerMin || null, l = e._sgDatePickerMax || null, u = e._sgDatePickerFdow ?? 1, d = j("div", {
		class: "sg-renderer-datepicker-popover",
		role: "dialog"
	});
	d.addEventListener("mousedown", (e) => e.stopPropagation());
	function f(i) {
		let { api: a } = t, o = n && r?.field != null ? n[r.field] : null, s = i ? _i(i) : null;
		n && r?.field != null && (n[r.field] = s), a?.applyTransaction && a.applyTransaction({ update: [n] });
		let c = e.closest("[data-controller~=\"grid\"]");
		c && c.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
			bubbles: !0,
			detail: {
				rowId: n?.id ?? n?._sg_id,
				colId: r?.field,
				oldValue: o,
				newValue: s
			}
		})), wi();
	}
	function p() {
		d.replaceChildren();
		let { wrap: e, prev: t, next: n } = Si(a, o, s, f, c, l, u);
		t.addEventListener("click", () => {
			o === 0 ? (o = 11, --a) : --o, p();
		}), n.addEventListener("click", () => {
			o === 11 ? (o = 0, a += 1) : o += 1, p();
		});
		let r = j("div", { class: "sg-renderer-datepicker-footer" }), i = j("button", {
			type: "button",
			class: "sg-renderer-datepicker-today"
		}, document.createTextNode("Today"));
		i.addEventListener("click", () => f(/* @__PURE__ */ new Date()));
		let m = j("button", {
			type: "button",
			class: "sg-renderer-datepicker-clear"
		}, document.createTextNode("Clear"));
		m.addEventListener("click", () => f(null)), r.append(i, m), d.append(e, r);
	}
	function m(e) {
		e.key === "Escape" && (e.stopPropagation(), wi());
	}
	function h(t) {
		!d.contains(t.target) && !e.contains(t.target) && wi();
	}
	document.addEventListener("keydown", m), setTimeout(() => document.addEventListener("mousedown", h), 0), document.body.appendChild(d), p(), F(d, e), yi = {
		pop: d,
		onKey: m,
		onDocClick: h,
		anchor: e
	};
}
function wi() {
	if (!yi) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = yi;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), yi = null, B(r);
}
function Ti({ style: e = "24h", minuteStep: t = 5, editable: n = !0, empty: r = "—" } = {}) {
	return (i) => {
		let { value: a, td: o } = i, s = i?.col?.cellRendererConfig || {}, c = s.style ?? e, l = s.minuteStep ?? t, u = s.editable ?? n;
		o && (o.classList.add("sg-renderer-timepicker-cell"), o._sgTimePickerStyle = c, o._sgTimePickerStep = l), u && o && !o._sgTimePickerBound && (o._sgTimePickerBound = !0, o.addEventListener("dblclick", (e) => {
			e._sgTimePickerHandled || (e._sgTimePickerHandled = !0, e.stopPropagation(), Oi(o, i));
		}));
		let d = er(a);
		return d ? j("span", { class: "sg-renderer-timepicker-value" }, document.createTextNode(Ei(d, c))) : r;
	};
}
function Ei(e, t) {
	let n = String(e.m).padStart(2, "0");
	if (t === "12h") {
		let t = e.h >= 12 ? "PM" : "AM";
		return `${e.h % 12 || 12}:${n} ${t}`;
	}
	return `${String(e.h).padStart(2, "0")}:${n}`;
}
var Di = null;
function Oi(e, t) {
	ki();
	let n = e._sgTimePickerStyle || "24h", r = e._sgTimePickerStep || 5, { row: i, col: a } = t, o = er(i && a?.field != null ? i[a.field] : null) || {
		h: 9,
		m: 0,
		s: 0
	}, s = o.h, c = Math.round(o.m / r) * r;
	c >= 60 && (c = 0);
	let l = j("div", {
		class: "sg-renderer-timepicker-popover",
		role: "dialog"
	});
	l.addEventListener("mousedown", (e) => e.stopPropagation());
	function u(n) {
		let { api: r } = t, o = i && a?.field != null ? i[a.field] : null;
		i && a?.field != null && (i[a.field] = n), r?.applyTransaction && r.applyTransaction({ update: [i] });
		let s = e.closest("[data-controller~=\"grid\"]");
		s && s.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
			bubbles: !0,
			detail: {
				rowId: i?.id ?? i?._sg_id,
				colId: a?.field,
				oldValue: o,
				newValue: n
			}
		})), ki();
	}
	function d() {
		u(`${String(s).padStart(2, "0")}:${String(c).padStart(2, "0")}`);
	}
	let f = j("div", { class: "sg-renderer-timepicker-col" });
	f.append(j("div", { class: "sg-renderer-timepicker-col-label" }, document.createTextNode("Hour")));
	let p = j("div", { class: "sg-renderer-timepicker-list" });
	f.append(p);
	function m() {
		p.replaceChildren();
		let e = n === "12h" ? Array.from({ length: 12 }, (e, t) => t === 0 ? 12 : t) : Array.from({ length: 24 }, (e, t) => t);
		for (let t of e) {
			let e = n === "12h" ? s >= 12 ? t === 12 ? 12 : t + 12 : t === 12 ? 0 : t : t, r = e === s, i = j("button", {
				type: "button",
				class: `sg-renderer-timepicker-item${r ? " is-selected" : ""}`
			}, document.createTextNode(n === "12h" ? String(t) : String(t).padStart(2, "0")));
			i.addEventListener("click", () => {
				s = e, m();
			}), i.addEventListener("dblclick", () => {
				s = e, d();
			}), p.append(i), r && setTimeout(() => i.scrollIntoView({ block: "nearest" }), 0);
		}
	}
	let h = j("div", { class: "sg-renderer-timepicker-col" });
	h.append(j("div", { class: "sg-renderer-timepicker-col-label" }, document.createTextNode("Min")));
	let g = j("div", { class: "sg-renderer-timepicker-list" });
	h.append(g);
	function _() {
		g.replaceChildren();
		for (let e = 0; e < 60; e += r) {
			let t = e === c, n = j("button", {
				type: "button",
				class: `sg-renderer-timepicker-item${t ? " is-selected" : ""}`
			}, document.createTextNode(String(e).padStart(2, "0")));
			n.addEventListener("click", () => {
				c = e, _();
			}), n.addEventListener("dblclick", () => {
				c = e, d();
			}), g.append(n), t && setTimeout(() => n.scrollIntoView({ block: "nearest" }), 0);
		}
	}
	let v = j("div", { class: "sg-renderer-timepicker-cols" });
	if (v.append(f, h), n === "12h") {
		let e = j("div", { class: "sg-renderer-timepicker-col" });
		e.append(j("div", { class: "sg-renderer-timepicker-col-label" }, document.createTextNode("\xA0")));
		let t = j("div", { class: "sg-renderer-timepicker-list" });
		for (let e of ["AM", "PM"]) {
			let n = j("button", {
				type: "button",
				class: `sg-renderer-timepicker-item${e === "AM" && s < 12 || e === "PM" && s >= 12 ? " is-selected" : ""}`
			}, document.createTextNode(e));
			n.addEventListener("click", () => {
				e === "AM" && s >= 12 && (s -= 12), e === "PM" && s < 12 && (s += 12), m(), t.querySelectorAll(".sg-renderer-timepicker-item").forEach((e, t) => {
					e.classList.toggle("is-selected", t === 0 && s < 12 || t === 1 && s >= 12);
				});
			}), t.append(n);
		}
		e.append(t), v.append(e);
	}
	let y = j("div", { class: "sg-renderer-timepicker-footer" }), b = j("button", {
		type: "button",
		class: "sg-renderer-timepicker-cancel"
	}, document.createTextNode("Cancel")), x = j("button", {
		type: "button",
		class: "sg-renderer-timepicker-ok"
	}, document.createTextNode("Set")), S = j("button", {
		type: "button",
		class: "sg-renderer-timepicker-clear"
	}, document.createTextNode("Clear"));
	b.addEventListener("click", () => ki()), S.addEventListener("click", () => u(null)), x.addEventListener("click", () => d()), y.append(S, b, x), l.append(v, y);
	function C(e) {
		e.key === "Escape" && (e.stopPropagation(), ki()), e.key === "Enter" && (e.stopPropagation(), e.preventDefault(), d());
	}
	function w(t) {
		!l.contains(t.target) && !e.contains(t.target) && ki();
	}
	document.addEventListener("keydown", C), setTimeout(() => document.addEventListener("mousedown", w), 0), document.body.appendChild(l), m(), _(), F(l, e), Di = {
		pop: l,
		onKey: C,
		onDocClick: w,
		anchor: e
	};
}
function ki() {
	if (!Di) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = Di;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), Di = null, B(r);
}
function Ai(e) {
	if (e == null || e === "") return null;
	let t, n;
	if (Array.isArray(e)) [t, n] = e;
	else if (typeof e == "object") t = e.start || e.from, n = e.end || e.to;
	else if (typeof e == "string") {
		let r = e.split(/\s*\/\s*|\s*[–-]\s*/);
		[t, n] = r.length >= 2 ? r : [e, e];
	}
	let r = N(t), i = N(n);
	return !r && !i ? null : {
		start: r,
		end: i
	};
}
function ji(e, t) {
	if (!e) return "";
	let { start: n, end: r } = e;
	if (!n && !r) return "";
	if (!r || n && V(n, r)) return new Intl.DateTimeFormat(t, {
		month: "short",
		day: "numeric",
		year: "numeric"
	}).format(n);
	if (!n) return `… – ${new Intl.DateTimeFormat(t, {
		month: "short",
		day: "numeric",
		year: "numeric"
	}).format(r)}`;
	let i = n.getFullYear() === r.getFullYear();
	if (i && n.getMonth() === r.getMonth()) return `${new Intl.DateTimeFormat(t, {
		month: "short",
		day: "numeric"
	}).format(n)} – ${new Intl.DateTimeFormat(t, {
		day: "numeric",
		year: "numeric"
	}).format(r)}`;
	if (i) return `${new Intl.DateTimeFormat(t, {
		month: "short",
		day: "numeric"
	}).format(n)} – ${new Intl.DateTimeFormat(t, {
		month: "short",
		day: "numeric",
		year: "numeric"
	}).format(r)}`;
	let a = new Intl.DateTimeFormat(t, {
		month: "short",
		day: "numeric",
		year: "numeric"
	});
	return `${a.format(n)} – ${a.format(r)}`;
}
function Mi({ locale: e = void 0, editable: t = !0, empty: n = "—", firstDayOfWeek: r = 1 } = {}) {
	return (i) => {
		let { value: a, td: o } = i, s = i?.col?.cellRendererConfig || {}, c = s.firstDayOfWeek ?? r, l = s.editable ?? t;
		o && (o.classList.add("sg-renderer-daterange-cell"), o._sgRangeFdow = c), l && o && !o._sgRangeBound && (o._sgRangeBound = !0, o.addEventListener("dblclick", (e) => {
			e._sgRangeHandled || (e._sgRangeHandled = !0, e.stopPropagation(), Pi(o, i));
		}));
		let u = Ai(a);
		return u ? j("span", { class: "sg-renderer-daterange-value" }, document.createTextNode(ji(u, e))) : n;
	};
}
var Ni = null;
function Pi(e, t) {
	Fi();
	let { row: n, col: r } = t, i = Ai(n && r?.field != null ? n[r.field] : null) || {
		start: null,
		end: null
	}, a = i.start, o = i.end, s = (a || /* @__PURE__ */ new Date()).getFullYear(), c = (a || /* @__PURE__ */ new Date()).getMonth(), l = e._sgRangeFdow ?? 1, u = j("div", {
		class: "sg-renderer-daterange-popover",
		role: "dialog"
	});
	u.addEventListener("mousedown", (e) => e.stopPropagation());
	function d() {
		let { api: i } = t, s = n && r?.field != null ? n[r.field] : null, c = a || o ? {
			start: a ? _i(a) : null,
			end: o ? _i(o) : null
		} : null;
		n && r?.field != null && (n[r.field] = c), i?.applyTransaction && i.applyTransaction({ update: [n] });
		let l = e.closest("[data-controller~=\"grid\"]");
		l && l.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
			bubbles: !0,
			detail: {
				rowId: n?.id ?? n?._sg_id,
				colId: r?.field,
				oldValue: s,
				newValue: c
			}
		})), Fi();
	}
	function f(e) {
		!a || a && o ? (a = e, o = null) : e < a ? (o = a, a = e) : o = e, m();
	}
	function p(e, t) {
		let n = j("div", { class: "sg-renderer-datepicker-cal" }), r = j("div", { class: "sg-renderer-datepicker-head" }), i = j("button", {
			type: "button",
			class: "sg-renderer-datepicker-nav"
		}, document.createTextNode("‹")), s = j("span", { class: "sg-renderer-datepicker-title" }, document.createTextNode(`${bi[t]} ${e}`)), c = j("button", {
			type: "button",
			class: "sg-renderer-datepicker-nav"
		}, document.createTextNode("›"));
		r.append(i, s, c);
		let u = j("div", { class: "sg-renderer-datepicker-dows" });
		for (let e = 0; e < 7; e++) u.append(j("span", { class: "sg-renderer-datepicker-dow" }, document.createTextNode(xi[(e + l) % 7])));
		let d = j("div", { class: "sg-renderer-datepicker-grid" }), p = (new Date(e, t, 1).getDay() - l + 7) % 7, m = new Date(e, t, 1 - p), h = /* @__PURE__ */ new Date();
		for (let e = 0; e < 42; e++) {
			let n = new Date(m.getFullYear(), m.getMonth(), m.getDate() + e), r = n.getMonth() === t, i = V(n, a), s = V(n, o), c = a && o && n > a && n < o, l = V(n, h), u = ["sg-renderer-datepicker-day"];
			r || u.push("is-other-month"), (i || s) && u.push("is-selected"), c && u.push("is-in-range"), l && u.push("is-today");
			let p = j("button", {
				type: "button",
				class: u.join(" "),
				title: _i(n)
			}, document.createTextNode(String(n.getDate())));
			p.addEventListener("click", () => f(n)), d.append(p);
		}
		return n.append(r, u, d), {
			wrap: n,
			prev: i,
			next: c
		};
	}
	function m() {
		u.replaceChildren();
		let e = j("div", { class: "sg-renderer-daterange-months" }), t = c === 11 ? s + 1 : s, n = (c + 1) % 12, r = p(s, c), i = p(t, n);
		r.prev.addEventListener("click", () => {
			c === 0 ? (c = 11, --s) : --c, m();
		}), i.next.addEventListener("click", () => {
			c === 11 ? (c = 0, s += 1) : c += 1, m();
		}), r.next.style.visibility = "hidden", i.prev.style.visibility = "hidden", e.append(r.wrap, i.wrap);
		let l = j("div", { class: "sg-renderer-datepicker-footer" }), f = j("button", {
			type: "button",
			class: "sg-renderer-datepicker-clear"
		}, document.createTextNode("Clear")), h = j("button", {
			type: "button",
			class: "sg-renderer-timepicker-ok"
		}, document.createTextNode("Set"));
		f.addEventListener("click", () => {
			a = null, o = null, d();
		}), h.addEventListener("click", d), l.append(f, h), u.append(e, l);
	}
	function h(e) {
		e.key === "Escape" && (e.stopPropagation(), Fi()), e.key === "Enter" && (e.stopPropagation(), e.preventDefault(), d());
	}
	function g(t) {
		!u.contains(t.target) && !e.contains(t.target) && Fi();
	}
	document.addEventListener("keydown", h), setTimeout(() => document.addEventListener("mousedown", g), 0), document.body.appendChild(u), m(), F(u, e), Ni = {
		pop: u,
		onKey: h,
		onDocClick: g,
		anchor: e
	};
}
function Fi() {
	if (!Ni) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = Ni;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), Ni = null, B(r);
}
var Ii = [
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
function Li({ palette: e = Ii, shape: t = "circle", showLabel: n = !1, size: r = 14, editable: i = !0, empty: a = "—" } = {}) {
	return (o) => {
		let { value: s, td: c } = o, l = o?.col?.cellRendererConfig || {}, u = l.palette || e, d = l.shape ?? t, f = l.showLabel ?? n, p = l.size ?? r, m = l.editable ?? i;
		if (c && (c.classList.add("sg-renderer-colorpicker-cell"), c._sgPickerPalette = u), m && c && !c._sgPickerBound && (c._sgPickerBound = !0, c.addEventListener("dblclick", (e) => {
			e._sgPickerHandled || (e._sgPickerHandled = !0, e.stopPropagation(), zi(c, o));
		})), M(s)) return a;
		let h = j("span", { class: "sg-renderer-swatch" }), g = String(s).toLowerCase() === "#ffffff" ? " border: 1px solid #d1d5db;" : "";
		return h.append(j("span", {
			class: `sg-renderer-swatch-chip is-${d}`,
			style: `width: ${p}px; height: ${p}px; background: ${s};${g}`,
			title: s
		})), f && h.append(j("span", { class: "sg-renderer-swatch-label" }, document.createTextNode(s))), h;
	};
}
var Ri = null;
function zi(e, t) {
	Bi();
	let n = e._sgPickerPalette || Ii, { row: r, col: i } = t, a = r && i?.field != null ? r[i.field] : null, o = j("div", {
		class: "sg-renderer-colorpicker-popover",
		role: "dialog"
	});
	o.addEventListener("mousedown", (e) => e.stopPropagation());
	function s(n) {
		let { api: a } = t, o = r && i?.field != null ? r[i.field] : null;
		r && i?.field != null && (r[i.field] = n), a?.applyTransaction && a.applyTransaction({ update: [r] });
		let s = e.closest("[data-controller~=\"grid\"]");
		s && s.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
			bubbles: !0,
			detail: {
				rowId: r?.id ?? r?._sg_id,
				colId: i?.field,
				oldValue: o,
				newValue: n
			}
		})), Bi();
	}
	let c = j("div", { class: "sg-renderer-colorpicker-grid" });
	for (let e of n) {
		let t = j("button", {
			type: "button",
			class: `sg-renderer-colorpicker-swatch${String(a).toLowerCase() === String(e).toLowerCase() ? " is-selected" : ""}`,
			style: `background: ${e};`,
			title: e,
			"aria-label": e
		});
		t.addEventListener("click", () => s(e)), c.append(t);
	}
	let l = j("div", { class: "sg-renderer-colorpicker-custom" }), u = j("input", {
		type: "color",
		class: "sg-renderer-colorpicker-native",
		value: /^#[0-9a-fA-F]{6}$/.test(a || "") ? a : "#3b82f6"
	}), d = j("input", {
		type: "text",
		class: "sg-renderer-colorpicker-hex",
		value: a || "",
		placeholder: "#rrggbb"
	});
	u.addEventListener("input", () => {
		d.value = u.value;
	}), d.addEventListener("input", () => {
		/^#[0-9a-fA-F]{6}$/.test(d.value) && (u.value = d.value);
	});
	let f = j("button", {
		type: "button",
		class: "sg-renderer-timepicker-ok"
	}, document.createTextNode("Set")), p = j("button", {
		type: "button",
		class: "sg-renderer-timepicker-clear"
	}, document.createTextNode("Clear"));
	p.addEventListener("click", () => s(null)), f.addEventListener("click", () => {
		s(/^#[0-9a-fA-F]{6}$/.test(d.value) ? d.value : u.value);
	}), l.append(u, d, p, f), o.append(c, l);
	function m(e) {
		e.key === "Escape" && (e.stopPropagation(), Bi()), e.key === "Enter" && (e.stopPropagation(), s(/^#[0-9a-fA-F]{6}$/.test(d.value) ? d.value : u.value));
	}
	function h(t) {
		!o.contains(t.target) && !e.contains(t.target) && Bi();
	}
	document.addEventListener("keydown", m), setTimeout(() => document.addEventListener("mousedown", h), 0), document.body.appendChild(o), F(o, e), Ri = {
		pop: o,
		onKey: m,
		onDocClick: h,
		anchor: e
	};
}
function Bi() {
	if (!Ri) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = Ri;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), Ri = null, B(r);
}
function Vi({ lines: e = 3, rows: t = 6, cols: n = 48, separator: r = "\n", editable: i = !0, empty: a = "" } = {}) {
	return (o) => {
		let { value: s, td: c } = o, l = o?.col?.cellRendererConfig || {}, u = l.lines ?? e, d = l.rows ?? t, f = l.cols ?? n, p = l.separator ?? r, m = l.editable ?? i;
		if (c && (c.classList.add("sg-renderer-multiline"), c._sgTextareaRows = d, c._sgTextareaCols = f, c._sgTextareaSep = p), m && c && !c._sgTextareaBound && (c._sgTextareaBound = !0, c.addEventListener("dblclick", (e) => {
			e._sgTextareaHandled || (e._sgTextareaHandled = !0, e.stopPropagation(), Ui(c, o));
		})), M(s)) return a;
		let h = String(s);
		if (u != null && u > 0) {
			let e = j("div", {
				class: "sg-renderer-multiline-clamp",
				style: `--sg-multiline-lines: ${u};`,
				title: h
			});
			return e.textContent = h, e;
		}
		return h;
	};
}
var Hi = null;
function Ui(e, t) {
	H();
	let n = e._sgTextareaRows || 6, r = e._sgTextareaCols || 48, { row: i, col: a } = t, o = i && a?.field != null ? i[a.field] : "", s = j("div", {
		class: "sg-renderer-textarea-popover",
		role: "dialog"
	});
	s.addEventListener("mousedown", (e) => e.stopPropagation());
	let c = j("textarea", {
		class: "sg-renderer-textarea-input",
		rows: n,
		cols: r
	});
	c.value = o == null ? "" : String(o);
	function l() {
		let { api: n } = t, r = c.value, o = i && a?.field != null ? i[a.field] : null;
		i && a?.field != null && (i[a.field] = r), n?.applyTransaction && n.applyTransaction({ update: [i] });
		let s = e.closest("[data-controller~=\"grid\"]");
		s && s.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
			bubbles: !0,
			detail: {
				rowId: i?.id ?? i?._sg_id,
				colId: a?.field,
				oldValue: o,
				newValue: r
			}
		})), H();
	}
	let u = j("div", { class: "sg-renderer-textarea-footer" }), d = j("span", { class: "sg-renderer-textarea-hint" }, document.createTextNode("⌘/Ctrl + Enter to save · Esc to cancel")), f = j("button", {
		type: "button",
		class: "sg-renderer-timepicker-cancel"
	}, document.createTextNode("Cancel")), p = j("button", {
		type: "button",
		class: "sg-renderer-timepicker-ok"
	}, document.createTextNode("Save"));
	f.addEventListener("click", () => H()), p.addEventListener("click", l), u.append(d, f, p), s.append(c, u), c.addEventListener("keydown", (e) => {
		e.key === "Enter" && (e.metaKey || e.ctrlKey) ? (e.preventDefault(), l()) : e.key === "Escape" && (e.stopPropagation(), H());
	});
	function m(e) {
		e.key === "Escape" && (e.stopPropagation(), H());
	}
	function h(t) {
		!s.contains(t.target) && !e.contains(t.target) && H();
	}
	document.addEventListener("keydown", m), setTimeout(() => document.addEventListener("mousedown", h), 0), document.body.appendChild(s), F(s, e), setTimeout(() => {
		c.focus(), c.setSelectionRange(c.value.length, c.value.length);
	}, 0), Hi = {
		pop: s,
		onKey: m,
		onDocClick: h,
		anchor: e
	};
}
function H() {
	if (!Hi) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = Hi;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), Hi = null, B(r);
}
function Wi(e, t, n, r) {
	let i = e?.closest("[data-controller~=\"grid\"]");
	i && i.dispatchEvent(new CustomEvent("grid:rowAction", {
		bubbles: !0,
		detail: {
			action: n,
			rowId: t.row?.id ?? t.row?._sg_id,
			row: t.row,
			col: t.col,
			...r
		}
	}));
}
function Gi({ label: e = "Go", icon: t = null, variant: n = "primary", action: r = null, onClick: i = null, disabled: a = !1 } = {}) {
	return (o) => {
		let { td: s, row: c } = o, l = o?.col?.cellRendererConfig || {}, u = l.label ?? e, d = l.icon ?? t, f = l.variant ?? n, p = l.action ?? r, m = typeof a == "function" ? a(c) : l.disabled ?? a;
		s && s.classList.add("sg-renderer-action-cell");
		let h = j("button", {
			type: "button",
			class: `sg-renderer-action-btn is-${f}`,
			disabled: m ? "" : null
		});
		return d && h.append(j("span", {
			class: "sg-renderer-action-icon",
			"aria-hidden": "true"
		}, d)), h.append(j("span", { class: "sg-renderer-action-label" }, document.createTextNode(u))), h.addEventListener("click", (e) => {
			e.stopPropagation(), !m && (typeof i == "function" && i(c, o), p && Wi(s, o, p));
		}), h;
	};
}
var Ki = "<svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><circle cx=\"8\" cy=\"3\" r=\"1.5\" fill=\"currentColor\"/><circle cx=\"8\" cy=\"8\" r=\"1.5\" fill=\"currentColor\"/><circle cx=\"8\" cy=\"13\" r=\"1.5\" fill=\"currentColor\"/></svg>";
function qi({ items: e = [], icon: t = Ki, ariaLabel: n = "Open menu" } = {}) {
	return (r) => {
		let { td: i } = r, a = r?.col?.cellRendererConfig || {}, o = a.items || e, s = a.icon ?? t;
		i && (i.classList.add("sg-renderer-menu-cell"), i._sgMenuItems = o);
		let c = j("button", {
			type: "button",
			class: "sg-renderer-menu-trigger",
			"aria-label": a.ariaLabel ?? n
		}, s);
		return c.addEventListener("click", (e) => {
			e.stopPropagation(), Yi(i, r, o);
		}), c;
	};
}
var Ji = null;
function Yi(e, t, n) {
	Xi();
	let r = j("div", {
		class: "sg-renderer-menu-popover",
		role: "menu"
	});
	r.addEventListener("mousedown", (e) => e.stopPropagation());
	for (let i of n) {
		if (i === "---" || i === null) {
			r.append(j("div", {
				class: "sg-renderer-menu-sep",
				role: "separator"
			}));
			continue;
		}
		let n = typeof i == "string" ? {
			label: i,
			action: i
		} : i, a = ["sg-renderer-menu-item"];
		n.danger && a.push("is-danger"), n.disabled && a.push("is-disabled");
		let o = j("button", {
			type: "button",
			class: a.join(" "),
			role: "menuitem",
			disabled: n.disabled ? "" : null
		});
		n.icon && o.append(j("span", {
			class: "sg-renderer-menu-icon",
			"aria-hidden": "true"
		}, n.icon)), o.append(j("span", { class: "sg-renderer-menu-label" }, document.createTextNode(n.label))), n.shortcut && o.append(j("span", { class: "sg-renderer-menu-shortcut" }, document.createTextNode(n.shortcut))), o.addEventListener("click", () => {
			n.disabled || (Xi(), typeof n.onClick == "function" && n.onClick(t.row, t), n.action && Wi(e, t, n.action));
		}), r.append(o);
	}
	function i(e) {
		e.key === "Escape" && (e.stopPropagation(), Xi());
	}
	function a(t) {
		!r.contains(t.target) && !e.contains(t.target) && Xi();
	}
	document.addEventListener("keydown", i), setTimeout(() => document.addEventListener("mousedown", a), 0), document.body.appendChild(r), F(r, e), Ji = {
		pop: r,
		onKey: i,
		onDocClick: a,
		anchor: e
	};
}
function Xi() {
	if (!Ji) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = Ji;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), Ji = null, B(r);
}
function Zi({ primary: e = {
	label: "Go",
	action: null,
	icon: null
}, items: t = [], variant: n = "primary" } = {}) {
	return (r) => {
		let { td: i } = r, a = r?.col?.cellRendererConfig || {}, o = a.primary || e, s = a.items || t, c = a.variant ?? n;
		i && i.classList.add("sg-renderer-splitbtn-cell");
		let l = j("span", {
			class: `sg-renderer-splitbtn is-${c}`,
			role: "group"
		}), u = j("button", {
			type: "button",
			class: "sg-renderer-splitbtn-main"
		});
		o.icon && u.append(j("span", {
			class: "sg-renderer-action-icon",
			"aria-hidden": "true"
		}, o.icon)), u.append(j("span", { class: "sg-renderer-action-label" }, document.createTextNode(o.label))), u.addEventListener("click", (e) => {
			e.stopPropagation(), typeof o.onClick == "function" && o.onClick(r.row, r), o.action && Wi(i, r, o.action);
		});
		let d = j("button", {
			type: "button",
			class: "sg-renderer-splitbtn-caret",
			"aria-label": "More actions"
		}, document.createTextNode("▾"));
		return d.addEventListener("click", (e) => {
			e.stopPropagation(), Yi(d, r, s);
		}), l.append(u, d), l;
	};
}
var Qi = [
	{
		name: "edit",
		label: "Edit",
		icon: "✎"
	},
	{
		name: "duplicate",
		label: "Duplicate",
		icon: "⧉"
	},
	{
		name: "delete",
		label: "Delete",
		icon: "✕",
		danger: !0
	}
];
function $i({ actions: e = Qi } = {}) {
	return (t) => {
		let { td: n } = t, r = (t?.col?.cellRendererConfig || {}).actions || e;
		n && n.classList.add("sg-renderer-rowactions-cell");
		let i = j("span", { class: "sg-renderer-rowactions" });
		for (let e of r) {
			let r = j("button", {
				type: "button",
				class: `sg-renderer-rowactions-btn${e.danger ? " is-danger" : ""}`,
				title: e.label,
				"aria-label": e.label
			}, e.icon || e.label);
			r.addEventListener("click", (r) => {
				r.stopPropagation(), typeof e.onClick == "function" && e.onClick(t.row, t), e.name && Wi(n, t, e.name);
			}), i.append(r);
		}
		return i;
	};
}
var ea = "<svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><circle cx=\"6\" cy=\"3\" r=\"1.2\" fill=\"currentColor\"/><circle cx=\"10\" cy=\"3\" r=\"1.2\" fill=\"currentColor\"/><circle cx=\"6\" cy=\"8\" r=\"1.2\" fill=\"currentColor\"/><circle cx=\"10\" cy=\"8\" r=\"1.2\" fill=\"currentColor\"/><circle cx=\"6\" cy=\"13\" r=\"1.2\" fill=\"currentColor\"/><circle cx=\"10\" cy=\"13\" r=\"1.2\" fill=\"currentColor\"/></svg>";
function ta({ label: e = "Drag to reorder" } = {}) {
	return (t) => {
		let { td: n } = t;
		n && n.classList.add("sg-renderer-draghandle-cell");
		let r = j("span", {
			class: "sg-renderer-draghandle",
			title: e,
			"aria-label": e,
			role: "button",
			tabindex: 0,
			draggable: "true"
		}, ea);
		return r.addEventListener("mousedown", (e) => {
			e.stopPropagation();
			let r = n?.closest("[data-controller~=\"grid\"]");
			r && r.dispatchEvent(new CustomEvent("grid:rowDragStart", {
				bubbles: !0,
				detail: {
					rowId: t.row?.id ?? t.row?._sg_id,
					row: t.row,
					event: e
				}
			}));
		}), r;
	};
}
function na({ startAt: e = 1, padTo: t = 0 } = {}) {
	return (n) => {
		let { td: r, rowNum: i } = n, a = (typeof i == "number" ? i : e) + (e - 1);
		r && r.classList.add("sg-renderer-rownumber-cell");
		let o = t > 0 ? String(a).padStart(t, "0") : String(a);
		return j("span", { class: "sg-renderer-rownumber" }, document.createTextNode(o));
	};
}
function ra() {
	return (e) => {
		let { td: t, row: n } = e;
		t && t.classList.add("sg-renderer-expandtoggle-cell");
		let r = !!(n && n._sg_expanded), i = j("button", {
			type: "button",
			class: `sg-renderer-expandtoggle${r ? " is-open" : ""}`,
			"aria-label": r ? "Collapse row" : "Expand row",
			"aria-expanded": r ? "true" : "false"
		});
		return i.innerHTML = ke, i.addEventListener("mousedown", (e) => e.stopPropagation()), i.addEventListener("click", (e) => {
			e.stopPropagation();
			let r = !(n && n._sg_expanded);
			n && (n._sg_expanded = r), i.classList.toggle("is-open", r), i.setAttribute("aria-expanded", r ? "true" : "false"), i.setAttribute("aria-label", r ? "Collapse row" : "Expand row");
			let a = (t || i).closest("[data-controller~=\"grid\"]");
			a && a.dispatchEvent(new CustomEvent("grid:rowToggleExpand", {
				bubbles: !0,
				detail: {
					rowId: n?.id ?? n?._sg_id,
					row: n,
					expanded: r
				}
			}));
		}), i;
	};
}
var ia = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
function aa(e) {
	let t = String(e).toLowerCase();
	return t.length <= 13 ? t : `${t.slice(0, 8)}…${t.slice(-4)}`;
}
function oa({ short: e = !0, copy: t = !0 } = {}) {
	return ({ value: n, td: r }) => {
		if (M(n)) return "";
		r && r.classList.add("sg-renderer-uuid-cell");
		let i = String(n), a = ia.test(i), o = e ? aa(i) : i, s = j("span", {
			class: `sg-renderer-uuid${a ? "" : " is-invalid"}`,
			title: i
		});
		if (s.append(j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(o))), t) {
			let e = j("button", {
				type: "button",
				class: "sg-renderer-copyable-btn",
				title: "Copy",
				"aria-label": "Copy UUID"
			}, document.createTextNode("⧉"));
			e.addEventListener("click", (t) => {
				t.stopPropagation(), navigator.clipboard?.writeText && navigator.clipboard.writeText(i).then(() => {
					e.classList.add("is-copied"), setTimeout(() => e.classList.remove("is-copied"), 900);
				});
			}), s.append(e);
		}
		return s;
	};
}
var sa = /^[0-9a-f]{4,64}$/i;
function ca({ length: e = 7, href: t = null, copy: n = !0 } = {}) {
	return ({ value: r, td: i }) => {
		if (M(r)) return "";
		i && i.classList.add("sg-renderer-gitsha-cell"), i?._sgPickerPalette;
		let a = String(r).trim(), o = sa.test(a), s = o ? a.slice(0, e) : a, c = j("span", {
			class: `sg-renderer-uuid${o ? "" : " is-invalid"}`,
			title: a
		}), l = t ? j("a", {
			class: "sg-renderer-uuid-mono",
			href: typeof t == "function" ? t(a) : `${t}${a}`,
			target: "_blank",
			rel: "noopener noreferrer"
		}) : j("code", { class: "sg-renderer-uuid-mono" });
		if (l.append(document.createTextNode(s)), c.append(l), n) {
			let e = j("button", {
				type: "button",
				class: "sg-renderer-copyable-btn",
				title: "Copy",
				"aria-label": "Copy SHA"
			}, document.createTextNode("⧉"));
			e.addEventListener("click", (t) => {
				t.stopPropagation(), navigator.clipboard?.writeText && navigator.clipboard.writeText(a).then(() => {
					e.classList.add("is-copied"), setTimeout(() => e.classList.remove("is-copied"), 900);
				});
			}), c.append(e);
		}
		return c;
	};
}
var la = /^(?:[0-9a-f]{2}[:-]?){5}[0-9a-f]{2}$|^(?:[0-9a-f]{4}\.){2}[0-9a-f]{4}$/i;
function ua({ vendorLookup: e = null } = {}) {
	return ({ value: t, td: n }) => {
		if (M(t)) return "";
		n && n.classList.add("sg-renderer-mac-cell");
		let r = String(t).trim(), i = la.test(r), a = r.replace(/[^0-9a-f]/gi, "").toLowerCase(), o = a.length === 12 ? `${a.slice(0, 2)}:${a.slice(2, 4)}:${a.slice(4, 6)}:${a.slice(6, 8)}:${a.slice(8, 10)}:${a.slice(10, 12)}` : r, s = a.slice(0, 6), c = typeof e == "function" ? e(s) : null;
		return j("span", {
			class: `sg-renderer-uuid${i ? "" : " is-invalid"}`,
			title: c ? `${o} — ${c}` : o
		}, j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(o)));
	};
}
function da({ groups: e = 4, groupLen: t = 4, mask: n = !1 } = {}) {
	return ({ value: r, td: i }) => {
		if (M(r)) return "";
		i && i.classList.add("sg-renderer-license-cell");
		let a = i?._sgLicCfg || {}, o = a.groups || e, s = a.groupLen || t, c = String(r).replace(/[^a-z0-9]/gi, "").toUpperCase(), l = [];
		for (let e = 0; e < c.length; e += s) l.push(c.slice(e, e + s));
		let u = l.slice(0, o).join("-"), d = n ? u.split("-").map((e, t) => t === l.length - 1 ? e : e.replace(/./g, "•")).join("-") : u;
		return j("span", {
			class: "sg-renderer-uuid",
			title: u
		}, j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(d)));
	};
}
var fa = /^[A-HJ-NPR-Z0-9]{17}$/;
function pa({} = {}) {
	return ({ value: e, td: t }) => {
		if (M(e)) return "";
		t && t.classList.add("sg-renderer-vin-cell");
		let n = String(e).trim().toUpperCase(), r = fa.test(n), i = r ? `${n.slice(0, 3)} ${n.slice(3, 9)} ${n.slice(9)}` : n;
		return j("span", {
			class: `sg-renderer-uuid${r ? "" : " is-invalid"}`,
			title: n
		}, j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(i)));
	};
}
function ma(e) {
	return e.length === 13 ? `${e.slice(0, 3)}-${e.slice(3, 4)}-${e.slice(4, 8)}-${e.slice(8, 12)}-${e.slice(12)}` : e;
}
function ha(e) {
	return e.length === 10 ? `${e.slice(0, 1)}-${e.slice(1, 4)}-${e.slice(4, 9)}-${e.slice(9)}` : e;
}
function ga({} = {}) {
	return ({ value: e, td: t }) => {
		if (M(e)) return "";
		t && t.classList.add("sg-renderer-isbn-cell");
		let n = String(e).replace(/[^\dXx]/g, ""), r, i;
		return n.length === 13 ? (r = ma(n), i = /^\d{13}$/.test(n)) : n.length === 10 ? (r = ha(n), i = /^\d{9}[\dXx]$/.test(n)) : (r = String(e), i = !1), j("span", {
			class: `sg-renderer-uuid${i ? "" : " is-invalid"}`,
			title: String(e)
		}, j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(r)));
	};
}
var _a = /* @__PURE__ */ new Set([
	"B",
	"I",
	"EM",
	"STRONG",
	"U",
	"S",
	"DEL",
	"CODE",
	"A",
	"BR",
	"SPAN"
]);
function va(e) {
	let t = document.createElement("template");
	t.innerHTML = e;
	function n(e) {
		let t = Array.from(e.childNodes);
		for (let e of t) {
			if (e.nodeType === 3) continue;
			if (e.nodeType !== 1) {
				e.remove();
				continue;
			}
			let t = e.tagName;
			if (!_a.has(t)) {
				let t = document.createTextNode(e.textContent || "");
				e.replaceWith(t);
				continue;
			}
			[...e.attributes].forEach((n) => {
				let r = n.name.toLowerCase();
				t === "A" && r === "href" && /^(https?:|mailto:)/i.test(n.value) || e.removeAttribute(r);
			}), t === "A" && (e.setAttribute("target", "_blank"), e.setAttribute("rel", "noopener noreferrer")), n(e);
		}
	}
	return n(t.content), t.innerHTML;
}
function ya({ editable: e = !1, rows: t = 8, cols: n = 60 } = {}) {
	return (r) => {
		let { value: i, td: a } = r;
		if (a && (a.classList.add("sg-renderer-html-cell"), e && !a._sgHtmlBound && (a._sgHtmlBound = !0, a._sgTextareaRows = t, a._sgTextareaCols = n, a.addEventListener("dblclick", (e) => {
			e._sgTextareaHandled || (e._sgTextareaHandled = !0, e.stopPropagation(), Ui(a, r));
		}))), M(i)) return "";
		let o = j("span", { class: "sg-renderer-html" });
		return o.innerHTML = va(String(i)), o;
	};
}
function ba({ maxLines: e = 4, editable: t = !1, rows: n = 12, cols: r = 60 } = {}) {
	return (i) => {
		let { value: a, td: o } = i;
		if (o && (o.classList.add("sg-renderer-yaml-cell"), t && !o._sgYamlBound && (o._sgYamlBound = !0, o._sgTextareaRows = n, o._sgTextareaCols = r, o.addEventListener("dblclick", (e) => {
			e._sgTextareaHandled || (e._sgTextareaHandled = !0, e.stopPropagation(), Ui(o, i));
		}))), M(a)) return "";
		let s = typeof a == "string" ? a : JSON.stringify(a, null, 2), c = j("pre", {
			class: "sg-renderer-yaml",
			style: `--sg-multiline-lines: ${e};`,
			title: s
		});
		return c.textContent = s, c;
	};
}
function xa({ maxLines: e = 4 } = {}) {
	return ({ value: t, td: n }) => {
		if (M(t)) return "";
		n && n.classList.add("sg-renderer-xml-cell");
		let r = String(t), i = j("pre", {
			class: "sg-renderer-yaml",
			style: `--sg-multiline-lines: ${e};`,
			title: r
		});
		return i.textContent = r, i;
	};
}
var Sa = /\bhttps?:\/\/[^\s<>"']+/g, Ca = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g;
function wa({} = {}) {
	return ({ value: e, td: t }) => {
		if (M(e)) return "";
		t && t.classList.add("sg-renderer-autolink-cell");
		let n = Hn(String(e));
		n = n.replace(Sa, (e) => `<a class="sg-renderer-link" href="${e}" target="_blank" rel="noopener noreferrer">${e}</a>`), n = n.replace(Ca, (e) => `<a class="sg-renderer-link" href="mailto:${e}">${e}</a>`);
		let r = j("span", { class: "sg-renderer-autolink" });
		return r.innerHTML = n, r;
	};
}
function Ta({ revealOnHold: e = !0 } = {}) {
	return ({ value: t, td: n }) => {
		if (n && n.classList.add("sg-renderer-redacted-cell"), M(t)) return "";
		let r = String(t), i = j("span", {
			class: "sg-renderer-redacted",
			title: e ? "Hold to reveal" : ""
		});
		if (i.append(j("span", {
			class: "sg-renderer-redacted-text",
			"aria-hidden": "true"
		}, document.createTextNode(r))), e) {
			i.addEventListener("mousedown", (e) => {
				e.stopPropagation(), i.classList.add("is-revealed");
			});
			let e = () => i.classList.remove("is-revealed");
			document.addEventListener("mouseup", e), i.addEventListener("mouseleave", e);
		}
		return i;
	};
}
function Ea({} = {}) {
	return ({ value: e, td: t }) => {
		if (t && t.classList.add("sg-renderer-spoiler-cell"), M(e)) return "";
		let n = String(e), r = j("span", {
			class: "sg-renderer-spoiler",
			title: "Click to reveal"
		});
		return r.append(j("span", {
			class: "sg-renderer-spoiler-text",
			"aria-hidden": "true"
		}, document.createTextNode(n))), r.addEventListener("click", (e) => {
			e.stopPropagation(), r.classList.add("is-revealed");
		}), r;
	};
}
function Da(e, t) {
	return t === 0 ? e : Da(t, e % t);
}
function Oa(e, t = 16) {
	if (!Number.isFinite(e)) return null;
	let n = e < 0 ? "-" : "";
	e = Math.abs(e);
	let r = Math.floor(e), i = e - r;
	if (i < 1 / (t * 2)) return `${n}${r}`;
	let a = 1, o = 1, s = Infinity;
	for (let e = 1; e <= t; e++) {
		let t = Math.round(i * e), n = Math.abs(i - t / e);
		n < s && (a = t, o = e, s = n);
	}
	if (a === 0) return `${n}${r}`;
	if (a === o) return `${n}${r + 1}`;
	let c = Da(a, o), l = a / c, u = o / c;
	return r === 0 ? `${n}${l}/${u}` : `${n}${r} ${l}/${u}`;
}
function ka({ maxDenom: e = 16 } = {}) {
	return ({ value: t, td: n }) => {
		if (n && n.classList.add("sg-renderer-number"), M(t)) return "";
		let r = Number(t);
		return Number.isFinite(r) && Oa(r, e) || String(t);
	};
}
var Aa = [
	"⁰",
	"¹",
	"²",
	"³",
	"⁴",
	"⁵",
	"⁶",
	"⁷",
	"⁸",
	"⁹"
];
function ja(e) {
	return String(e).split("").map((e) => e === "-" ? "⁻" : Aa[Number(e)] || e).join("");
}
function Ma({ decimals: e = 2, pretty: t = !0 } = {}) {
	return ({ value: n, td: r }) => {
		if (r && r.classList.add("sg-renderer-number"), M(n)) return "";
		let i = Number(n);
		if (!Number.isFinite(i)) return String(n);
		if (i === 0) return "0";
		let a = Math.floor(Math.log10(Math.abs(i))), o = (i / 10 ** a).toFixed(e);
		return t ? `${o} × 10${ja(a)}` : i.toExponential(e);
	};
}
function Na({ base: e = 16, prefix: t = !0, uppercase: n = !0, pad: r = 0 } = {}) {
	let i = {
		2: "0b",
		8: "0o",
		16: "0x"
	};
	return ({ value: a, td: o }) => {
		if (o && o.classList.add("sg-renderer-number"), M(a)) return "";
		let s = Number(a);
		if (!Number.isFinite(s) || !Number.isInteger(s)) return String(a);
		let c = Math.abs(s).toString(e);
		return n && (c = c.toUpperCase()), r > 0 && (c = c.padStart(r, "0")), t && i[e] && (c = i[e] + c), (s < 0 ? "-" : "") + c;
	};
}
function Pa({ population: e = null, decimals: t = 0 } = {}) {
	return ({ value: n, row: r, col: i, td: a }) => {
		if (a && a.classList.add("sg-renderer-percentile-cell"), M(n)) return "";
		let o = Number(n);
		if (!Number.isFinite(o)) return String(n);
		let s = typeof e == "function" ? e(r, i) : e;
		if (!Array.isArray(s) || s.length === 0) return String(n);
		let c = s.slice().sort((e, t) => e - t), l = 0;
		for (let e of c) e < o && l++;
		let u = l / c.length * 100, d = j("span", { class: "sg-renderer-percentile" });
		return d.append(document.createTextNode(String(n))), d.append(j("span", { class: "sg-renderer-percentile-tag" }, document.createTextNode(`p${u.toFixed(t)}`))), d;
	};
}
function Fa({ showValue: e = !0 } = {}) {
	return ({ value: t, td: n }) => {
		if (n && n.classList.add("sg-renderer-battery-cell"), M(t)) return "";
		let r = Number(t);
		if (!Number.isFinite(r)) return String(t);
		r = Math.max(0, Math.min(100, r));
		let i = r < 15 ? "#ef4444" : r < 35 ? "#f59e0b" : "#22c55e", a = j("span", {
			class: "sg-renderer-battery",
			title: `${Math.round(r)}%`
		}), o = j("span", {
			class: "sg-renderer-battery-icon",
			"aria-hidden": "true"
		});
		return o.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 12" width="24" height="12"><rect x="0.5" y="0.5" width="20" height="11" rx="2" fill="none" stroke="#9ca3af"/><rect x="20.5" y="3" width="2.5" height="6" rx="0.5" fill="#9ca3af"/><rect x="2" y="2" width="${r / 100 * 17}" height="8" fill="${i}"/></svg>`, a.append(o), e && a.append(j("span", { class: "sg-renderer-battery-pct" }, document.createTextNode(`${Math.round(r)}%`))), a;
	};
}
function Ia({ bars: e = 4 } = {}) {
	return ({ value: t, td: n }) => {
		if (n && n.classList.add("sg-renderer-signal-cell"), M(t)) return "";
		let r = Number(t);
		if (!Number.isFinite(r)) return String(t);
		let i = Math.round(r <= e ? r : r / 100 * e), a = j("span", {
			class: "sg-renderer-signal",
			title: `${i}/${e}`
		});
		for (let t = 1; t <= e; t++) a.append(j("span", {
			class: `sg-renderer-signal-bar${t <= i ? " is-on" : ""}`,
			style: `height: ${4 + t * 2}px;`
		}));
		return a;
	};
}
var La = "<path fill=\"currentColor\" d=\"M3 6v4h3l4 3V3L6 6H3z\"/>", Ra = "<path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" d=\"M12 6.5q1 1 0 3\"/>", za = "<line x1=\"13\" y1=\"4\" x2=\"17\" y2=\"9\" stroke=\"currentColor\" stroke-width=\"1.4\"/><line x1=\"17\" y1=\"4\" x2=\"13\" y2=\"9\" stroke=\"currentColor\" stroke-width=\"1.4\"/>";
function Ba({ showValue: e = !1, editable: t = !1 } = {}) {
	return (n) => {
		let { value: r, td: i } = n;
		if (i && (i.classList.add("sg-renderer-volume-cell"), t && !i._sgVolumeBound && (i._sgVolumeBound = !0, i.addEventListener("dblclick", (e) => {
			e._sgVolumeHandled || (e._sgVolumeHandled = !0, e.stopPropagation(), Ua(i, n));
		}))), M(r)) return "";
		let a = Number(r);
		if (!Number.isFinite(a)) return String(r);
		a = Math.max(0, Math.min(100, a));
		let o = "";
		o = a === 0 ? za : a < 33 ? Ra : a < 66 ? "<path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" d=\"M12 6.5q1 1 0 3\"/><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" d=\"M14 5q2 2 0 6\"/>" : "<path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" d=\"M12 6.5q1 1 0 3\"/><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" d=\"M14 5q2 2 0 6\"/><path fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" d=\"M16 3.5q3 3 0 9\"/>";
		let s = j("span", {
			class: "sg-renderer-volume",
			title: `${Math.round(a)}%`
		}), c = j("span", {
			class: "sg-renderer-volume-icon",
			"aria-hidden": "true"
		});
		return c.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 16" width="20" height="14">${La}${o}</svg>`, s.append(c), e && s.append(j("span", { class: "sg-renderer-volume-pct" }, document.createTextNode(`${Math.round(a)}%`))), s;
	};
}
var Va = null;
function Ha() {
	if (!Va) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = Va;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), Va = null, B(r);
}
function Ua(e, t) {
	Ha();
	let { row: n, col: r } = t, i = Math.max(0, Math.min(100, Number(n && r?.field != null ? n[r.field] : 0) || 0)), a = j("div", {
		class: "sg-renderer-volume-popover",
		role: "dialog"
	});
	a.addEventListener("mousedown", (e) => e.stopPropagation());
	let o = j("input", {
		type: "range",
		min: "0",
		max: "100",
		step: "1",
		value: String(i),
		class: "sg-renderer-volume-slider"
	}), s = j("span", { class: "sg-renderer-volume-popover-value" }, document.createTextNode(`${i}%`));
	o.addEventListener("input", () => {
		s.textContent = `${o.value}%`;
	});
	function c() {
		let { api: i } = t, a = Number(o.value), s = n && r?.field != null ? n[r.field] : null;
		n && r?.field != null && (n[r.field] = a), i?.applyTransaction && i.applyTransaction({ update: [n] });
		let c = e.closest("[data-controller~=\"grid\"]");
		c && c.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
			bubbles: !0,
			detail: {
				rowId: n?.id ?? n?._sg_id,
				colId: r?.field,
				oldValue: s,
				newValue: a
			}
		})), Ha();
	}
	a.append(o, s), o.addEventListener("keydown", (e) => {
		e.key === "Enter" ? (e.preventDefault(), c()) : e.key === "Escape" && (e.stopPropagation(), Ha());
	}), o.addEventListener("change", c);
	function l(e) {
		e.key === "Escape" && (e.stopPropagation(), Ha());
	}
	function u(t) {
		!a.contains(t.target) && !e.contains(t.target) && Ha();
	}
	document.addEventListener("keydown", l), setTimeout(() => document.addEventListener("mousedown", u), 0), document.body.appendChild(a), F(a, e), setTimeout(() => o.focus(), 0), Va = {
		pop: a,
		onKey: l,
		onDocClick: u,
		anchor: e
	};
}
var Wa = [
	{
		match: /^image\//,
		icon: "🖼️"
	},
	{
		match: /^audio\//,
		icon: "🎵"
	},
	{
		match: /^video\//,
		icon: "🎬"
	},
	{
		match: /pdf$/,
		icon: "📕"
	},
	{
		match: /(zip|tar|gz|7z|rar)$/,
		icon: "🗜️"
	},
	{
		match: /(xls|xlsx|csv|sheet)$/,
		icon: "📊"
	},
	{
		match: /(doc|docx|wordprocessing)$/,
		icon: "📄"
	},
	{
		match: /(ppt|pptx|presentation)$/,
		icon: "📊"
	},
	{
		match: /(txt|md|markdown|plain)$/,
		icon: "📝"
	},
	{
		match: /(js|ts|jsx|tsx|py|rb|go|rs|java|cpp|c|h|html|css|json|yaml|yml|toml)$/,
		icon: "📜"
	}
];
function Ga(e, t) {
	let n = String(t || "").toLowerCase(), r = (e || "").toLowerCase().split(".").pop();
	for (let e of Wa) if (n && e.match.test(n) || r && e.match.test(r)) return e.icon;
	return "📎";
}
function Ka(e) {
	if (!Number.isFinite(e)) return "";
	let t = [
		"B",
		"KB",
		"MB",
		"GB",
		"TB"
	], n = 0;
	for (; e >= 1024 && n < t.length - 1;) e /= 1024, n++;
	return `${n === 0 ? e : e.toFixed(1)} ${t[n]}`;
}
function qa(e) {
	return e == null || e === "" ? null : typeof e == "string" ? {
		url: e,
		filename: e.split("/").pop()?.split("?")[0] || e
	} : {
		url: e.url || e.src || e.href,
		filename: e.filename || e.name || (e.url ? e.url.split("/").pop()?.split("?")[0] : ""),
		content_type: e.content_type || e.contentType || e.mime_type || "",
		byte_size: e.byte_size ?? e.byteSize ?? e.size
	};
}
function Ja({ showSize: e = !1 } = {}) {
	return ({ value: t, td: n }) => {
		n && n.classList.add("sg-renderer-file-cell");
		let r = qa(t);
		if (!r) return "";
		let i = Ga(r.filename, r.content_type), a = j("a", {
			class: "sg-renderer-file",
			href: r.url || "#",
			target: "_blank",
			rel: "noopener noreferrer",
			title: r.filename
		});
		return a.append(j("span", {
			class: "sg-renderer-file-icon",
			"aria-hidden": "true"
		}, document.createTextNode(i))), a.append(j("span", { class: "sg-renderer-file-name" }, document.createTextNode(r.filename || "file"))), e && r.byte_size && a.append(j("span", { class: "sg-renderer-file-size" }, document.createTextNode(Ka(r.byte_size)))), a;
	};
}
var Ya = "<svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M8 1a1 1 0 011 1v6.586l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L7 8.586V2a1 1 0 011-1zm-6 11a1 1 0 011 1v1h10v-1a1 1 0 112 0v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2a1 1 0 011-1z\"/></svg>";
function Xa({ label: e = "Download" } = {}) {
	return ({ value: t, td: n }) => {
		n && n.classList.add("sg-renderer-download-cell");
		let r = qa(t);
		if (!r) return "";
		let i = j("a", {
			class: "sg-renderer-link sg-renderer-download",
			href: r.url || "#",
			download: r.filename || "",
			title: r.filename
		}), a = j("span", {
			class: "sg-renderer-download-icon",
			"aria-hidden": "true"
		});
		a.innerHTML = Ya, i.append(a);
		let o = e;
		return r.byte_size && (o += ` (${Ka(r.byte_size)})`), i.append(j("span", {}, document.createTextNode(o))), i;
	};
}
function Za({ size: e = 18 } = {}) {
	return ({ value: t, td: n }) => {
		if (n && n.classList.add("sg-renderer-mime-icon-cell"), M(t)) return "";
		let r = typeof t == "object" ? t : {
			content_type: String(t),
			filename: String(t)
		}, i = Ga(r.filename, r.content_type);
		return j("span", {
			class: "sg-renderer-mime-icon",
			style: `font-size: ${e}px;`,
			title: r.content_type || r.filename || ""
		}, document.createTextNode(i));
	};
}
function Qa({ max: e = 5, thumbSize: t = 40, popoverThumbSize: n = 96 } = {}) {
	return (r) => {
		let { value: i, td: a } = r;
		if (a && a.classList.add("sg-renderer-gallery-cell"), M(i)) return "";
		let o = (Array.isArray(i) ? i : [i]).map((e) => typeof e == "string" ? { url: e } : e).filter((e) => e && e.url);
		if (!o.length) return "";
		a && !a._sgGalleryBound && (a._sgGalleryBound = !0, a.addEventListener("dblclick", (e) => {
			e._sgGalleryHandled || (e._sgGalleryHandled = !0, e.stopPropagation(), to(a, o, n));
		}));
		let s = j("span", { class: "sg-renderer-gallery" }), c = o.slice(0, e);
		for (let e of c) s.append(j("img", {
			src: e.url,
			alt: e.alt || "",
			class: "sg-renderer-gallery-thumb",
			loading: "lazy",
			decoding: "async",
			style: `width: ${t}px; height: ${t}px;`
		}));
		let l = o.length - c.length;
		return l > 0 && s.append(j("span", {
			class: "sg-renderer-gallery-more",
			style: `width: ${t}px; height: ${t}px; font-size: ${t / 3}px;`,
			title: o.slice(e).map((e) => e.alt).filter(Boolean).join(", ")
		}, document.createTextNode(`+${l}`))), s;
	};
}
var $a = null;
function eo() {
	if (!$a) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = $a;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), $a = null, B(r);
}
function to(e, t, n) {
	eo();
	let r = j("div", {
		class: "sg-renderer-gallery-popover",
		role: "dialog"
	});
	r.addEventListener("mousedown", (e) => e.stopPropagation());
	for (let e of t) {
		let t = j("a", {
			href: e.url,
			target: "_blank",
			rel: "noopener noreferrer",
			class: "sg-renderer-gallery-popover-item",
			title: e.alt || e.filename || ""
		});
		t.append(j("img", {
			src: e.url,
			alt: e.alt || "",
			loading: "lazy",
			decoding: "async",
			style: `width: ${n}px; height: ${n}px;`
		})), (e.alt || e.filename) && t.append(j("span", { class: "sg-renderer-gallery-popover-label" }, document.createTextNode(e.alt || e.filename))), r.append(t);
	}
	function i(e) {
		e.key === "Escape" && (e.stopPropagation(), eo());
	}
	function a(t) {
		!r.contains(t.target) && !e.contains(t.target) && eo();
	}
	document.addEventListener("keydown", i), setTimeout(() => document.addEventListener("mousedown", a), 0), document.body.appendChild(r), F(r, e), $a = {
		pop: r,
		onKey: i,
		onDocClick: a,
		anchor: e
	};
}
function no(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) t = (t << 5) - t + e.charCodeAt(n);
	return () => (t = (t * 9301 + 49297) % 233280, t / 233280);
}
function ro({ width: e = 100, height: t = 24, bars: n = 28, color: r = "#3b82f6", fill: i = !0 } = {}) {
	return ({ value: a, td: o }) => {
		if (o && o.classList.add("sg-renderer-waveform-cell"), M(a)) return "";
		let s;
		if (Array.isArray(a)) s = a.map(Number);
		else {
			let e = no(String(a));
			s = Array.from({ length: n }, () => .2 + e() * .8);
		}
		let c = Math.min(n, s.length), l = e / c, u = Math.max(.6, l * .25), d = "";
		for (let e = 0; e < c; e++) {
			let n = Math.max(.05, Math.min(1, s[e])) * t, i = e * l + u / 2, a = (t - n) / 2;
			d += `<rect x="${i.toFixed(2)}" y="${a.toFixed(2)}" width="${(l - u).toFixed(2)}" height="${n.toFixed(2)}" rx="0.6" fill="${r}"/>`;
		}
		let f = j("span", { class: `sg-renderer-waveform${i ? " is-fill" : ""}` });
		return f.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${e} ${t}" preserveAspectRatio="none" width="${i ? "100%" : String(e)}" height="${t}">${d}</svg>`, f;
	};
}
function io({ newTab: e = !0, size: t = 14, faviconUrl: n = (e) => `https://www.google.com/s2/favicons?domain=${e}&sz=64` } = {}) {
	return ({ value: r }) => {
		if (M(r)) return "";
		let i = String(r), a;
		try {
			a = new URL(i);
		} catch {
			return document.createTextNode(i);
		}
		let o = j("a", {
			class: "sg-renderer-link sg-renderer-favicon",
			href: i,
			target: e ? "_blank" : null,
			rel: e ? "noopener noreferrer" : null,
			title: i
		});
		return o.append(j("img", {
			src: n(a.hostname),
			alt: "",
			width: t,
			height: t,
			loading: "lazy",
			decoding: "async",
			class: "sg-renderer-favicon-img"
		})), o.append(j("span", { class: "sg-renderer-favicon-host" }, document.createTextNode(a.hostname + (a.pathname === "/" ? "" : a.pathname)))), o;
	};
}
function ao({ stripWww: e = !0, link: t = !0, newTab: n = !0 } = {}) {
	return ({ value: r }) => {
		if (M(r)) return "";
		let i = String(r), a;
		try {
			a = new URL(/^https?:/.test(i) ? i : `http://${i}`);
		} catch {
			return document.createTextNode(i);
		}
		let o = a.hostname;
		return e && (o = o.replace(/^www\./, "")), t ? j("a", {
			class: "sg-renderer-link",
			href: a.toString(),
			target: n ? "_blank" : null,
			rel: n ? "noopener noreferrer" : null,
			title: i
		}, document.createTextNode(o)) : o;
	};
}
var oo = {
	"twitter.com": {
		name: "Twitter",
		icon: "𝕏"
	},
	"x.com": {
		name: "X",
		icon: "𝕏"
	},
	"linkedin.com": {
		name: "LinkedIn",
		icon: "in"
	},
	"github.com": {
		name: "GitHub",
		icon: "⌥"
	},
	"youtube.com": {
		name: "YouTube",
		icon: "▶"
	},
	"instagram.com": {
		name: "Instagram",
		icon: "📷"
	},
	"mastodon.social": {
		name: "Mastodon",
		icon: "🐘"
	},
	"bsky.app": {
		name: "Bluesky",
		icon: "☁"
	},
	"threads.net": {
		name: "Threads",
		icon: "@"
	},
	"tiktok.com": {
		name: "TikTok",
		icon: "♪"
	},
	"reddit.com": {
		name: "Reddit",
		icon: "r"
	},
	"medium.com": {
		name: "Medium",
		icon: "M"
	},
	"substack.com": {
		name: "Substack",
		icon: "S"
	}
};
function so({} = {}) {
	return ({ value: e }) => {
		if (M(e)) return "";
		let t = String(e), n;
		try {
			n = new URL(/^https?:/.test(t) ? t : `https://${t}`);
		} catch {
			return document.createTextNode(t);
		}
		let r = n.hostname.replace(/^www\./, ""), i = oo[r] || Object.entries(oo).find(([e]) => r.endsWith(`.${e}`))?.[1], a = n.pathname.replace(/^\//, "").split("/")[0] || r, o = i ? `@${a}` : n.hostname + n.pathname, s = j("a", {
			class: "sg-renderer-link sg-renderer-social",
			href: n.toString(),
			target: "_blank",
			rel: "noopener noreferrer",
			title: `${i?.name || r} — ${t}`
		});
		return i && s.append(j("span", {
			class: "sg-renderer-social-icon",
			"aria-hidden": "true"
		}, document.createTextNode(i.icon))), s.append(j("span", { class: "sg-renderer-social-label" }, document.createTextNode(o))), s;
	};
}
var co = {
	auspost: {
		name: "AusPost",
		re: /^([A-Z]{2}\d{9,12}AU|[A-Z0-9]{12,14})$/,
		track: (e) => `https://auspost.com.au/mypost/track/#/details/${e}`
	},
	usps: {
		name: "USPS",
		re: /^(94|93|92|94|95)\d{20,22}$/,
		track: (e) => `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${e}`
	},
	fedex: {
		name: "FedEx",
		re: /^(\d{12}|\d{15}|\d{20})$/,
		track: (e) => `https://www.fedex.com/fedextrack/?tracknumbers=${e}`
	},
	ups: {
		name: "UPS",
		re: /^1Z[A-Z0-9]{16}$/i,
		track: (e) => `https://www.ups.com/track?tracknum=${e}`
	},
	dhl: {
		name: "DHL",
		re: /^\d{10,11}$/,
		track: (e) => `https://www.dhl.com/au-en/home/tracking/tracking-express.html?submit=1&tracking-id=${e}`
	},
	royalmail: {
		name: "Royal Mail",
		re: /^[A-Z]{2}\d{9}GB$/,
		track: (e) => `https://www.royalmail.com/track-your-item#/tracking-results/${e}`
	}
};
function lo({ carrier: e = null } = {}) {
	return ({ value: t, row: n, td: r }) => {
		if (M(t)) return "";
		r && r.classList.add("sg-renderer-tracking-cell");
		let i = String(t).trim().toUpperCase(), a = (e || n && n.carrier)?.toString().toLowerCase(), o = a ? co[a] : null;
		if (!o) {
			for (let e of Object.values(co)) if (e.re.test(i)) {
				o = e;
				break;
			}
		}
		let s = j("span", { class: "sg-renderer-tracking" });
		return o ? (s.append(j("span", { class: "sg-pill sg-pill-gray sg-renderer-tracking-carrier" }, document.createTextNode(o.name))), s.append(j("a", {
			class: "sg-renderer-link sg-renderer-uuid-mono",
			href: o.track(i),
			target: "_blank",
			rel: "noopener noreferrer"
		}, document.createTextNode(i)))) : s.append(j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(i))), s;
	};
}
function uo(e) {
	try {
		let t = new URL(e), n = t.hostname.replace(/^www\./, "");
		if (n === "youtube.com" || n === "m.youtube.com") {
			let e = t.searchParams.get("v");
			if (e) return {
				provider: "youtube",
				id: e
			};
		}
		if (n === "youtu.be") {
			let e = t.pathname.slice(1);
			if (e) return {
				provider: "youtube",
				id: e
			};
		}
		if (n === "vimeo.com") {
			let e = t.pathname.replace(/^\//, "").split("/")[0];
			if (/^\d+$/.test(e)) return {
				provider: "vimeo",
				id: e
			};
		}
		return null;
	} catch {
		return null;
	}
}
function fo({} = {}) {
	return ({ value: e, row: t, td: n }) => {
		if (M(e)) return "";
		n && n.classList.add("sg-renderer-videolink-cell");
		let r = uo(String(e));
		if (!r) return j("a", {
			class: "sg-renderer-link",
			href: String(e),
			target: "_blank",
			rel: "noopener noreferrer"
		}, document.createTextNode(String(e)));
		let i = j("a", {
			class: "sg-renderer-link sg-renderer-videolink",
			href: String(e),
			target: "_blank",
			rel: "noopener noreferrer"
		}), a = r.provider === "youtube" ? `https://i.ytimg.com/vi/${r.id}/default.jpg` : null;
		a ? i.append(j("img", {
			src: a,
			alt: "",
			class: "sg-renderer-videolink-thumb",
			loading: "lazy",
			decoding: "async"
		})) : i.append(j("span", { class: "sg-pill sg-pill-blue sg-renderer-videolink-provider" }, document.createTextNode(r.provider === "vimeo" ? "Vimeo" : "YouTube")));
		let o = t?.title || r.id;
		return i.append(j("span", { class: "sg-renderer-videolink-title" }, document.createTextNode(o))), t?.duration && i.append(j("span", { class: "sg-renderer-videolink-duration" }, document.createTextNode(String(t.duration)))), i;
	};
}
function po({ size: e = 12, color: t = "#9ca3af", label: n = "Loading" } = {}) {
	return ({ value: r }) => r != null && r !== "" && r !== "loading" && r !== "…" ? String(r) : j("span", {
		class: "sg-renderer-spinner",
		style: `width: ${e}px; height: ${e}px; border-color: ${t}; border-top-color: transparent;`,
		"aria-label": n,
		role: "progressbar"
	});
}
var mo = "<svg viewBox=\"0 0 16 16\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M8 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zm0 3a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0V5.25A.75.75 0 008 4.5zm0 6.5a1 1 0 100 2 1 1 0 000-2z\"/></svg>";
function ho({ icon: e = mo, retryLabel: t = "Retry" } = {}) {
	return (n) => {
		let { value: r, td: i } = n;
		if (M(r)) return "";
		i && i.classList.add("sg-renderer-error-cell");
		let a, o = null;
		r instanceof Error ? a = r.message : typeof r == "object" ? (a = r.message || String(r), o = r.retry) : a = String(r);
		let s = j("span", {
			class: "sg-renderer-error",
			title: a
		}), c = j("span", {
			class: "sg-renderer-error-icon",
			"aria-hidden": "true"
		});
		if (c.innerHTML = e, s.append(c), s.append(j("span", { class: "sg-renderer-error-msg" }, document.createTextNode(a))), typeof o == "function") {
			let e = j("button", {
				type: "button",
				class: "sg-renderer-error-retry"
			}, document.createTextNode(t));
			e.addEventListener("click", (e) => {
				e.stopPropagation(), o(n.row, n);
			}), s.append(e);
		}
		return s;
	};
}
var go = {
	synced: {
		color: "green",
		icon: "✓",
		label: "Synced"
	},
	syncing: {
		color: "blue",
		icon: "↻",
		label: "Syncing",
		spin: !0
	},
	pending: {
		color: "orange",
		icon: "◔",
		label: "Pending"
	},
	error: {
		color: "red",
		icon: "✕",
		label: "Sync error"
	},
	conflict: {
		color: "orange",
		icon: "⚡",
		label: "Conflict"
	},
	offline: {
		color: "gray",
		icon: "⌧",
		label: "Offline"
	}
};
function _o({} = {}) {
	return ({ value: e, td: t }) => {
		if (M(e)) return "";
		t && t.classList.add("sg-renderer-sync-cell");
		let n = go[String(e).toLowerCase()] || {
			color: "gray",
			icon: "·",
			label: String(e)
		}, r = j("span", {
			class: `sg-pill sg-pill-${n.color}`,
			title: n.label
		});
		return r.append(j("span", {
			class: `sg-renderer-sync-icon${n.spin ? " is-spinning" : ""}`,
			"aria-hidden": "true"
		}, document.createTextNode(n.icon))), r.append(j("span", { class: "sg-pill-label" }, document.createTextNode(n.label))), r;
	};
}
function vo({ timestampField: e = "updated_at", threshold: t = 3600 * 1e3, inner: n = null } = {}) {
	return (r) => {
		let { row: i, value: a, td: o } = r;
		o && o.classList.add("sg-renderer-stale-cell");
		let s = i && e ? N(i[e]) : null, c = s ? Date.now() - s.getTime() > t : !1, l = j("span", { class: `sg-renderer-stale${c ? " is-stale" : ""}` });
		if (typeof n == "function") {
			let e = n(r);
			e != null && (typeof e == "string" ? l.innerHTML = e : e instanceof Node ? l.append(e) : l.append(document.createTextNode(String(e))));
		} else l.append(document.createTextNode(a == null ? "" : String(a)));
		return c && l.append(j("span", {
			class: "sg-renderer-stale-tag",
			title: s ? `Last updated ${s.toLocaleString()}` : "stale"
		}, document.createTextNode("stale"))), l;
	};
}
function yo({ timestampField: e = "updated_at", freshFor: t = 5 * 1e3, inner: n = null } = {}) {
	return (r) => {
		let { row: i, value: a, td: o } = r;
		o && o.classList.add("sg-renderer-fresh-cell");
		let s = i && e ? N(i[e]) : null, c = s ? Date.now() - s.getTime() < t : !1, l = j("span", { class: `sg-renderer-fresh${c ? " is-fresh" : ""}` });
		if (typeof n == "function") {
			let e = n(r);
			e != null && (typeof e == "string" ? l.innerHTML = e : e instanceof Node ? l.append(e) : l.append(document.createTextNode(String(e))));
		} else l.append(document.createTextNode(a == null ? "" : String(a)));
		return c && o && setTimeout(() => l.classList.remove("is-fresh"), t), l;
	};
}
function bo(e) {
	if (e <= 0) return "expired";
	let t = Math.floor(e / 1e3), n = Math.floor(t / 86400), r = Math.floor(t % 86400 / 3600), i = Math.floor(t % 3600 / 60), a = t % 60;
	return n > 0 ? `${n}d ${r}h ${i}m` : r > 0 ? `${r}h ${i}m ${a}s` : i > 0 ? `${i}m ${a}s` : `${a}s`;
}
function xo({ interval: e = 1e3, expiredText: t = "expired" } = {}) {
	return ({ value: n, td: r }) => {
		if (r && r.classList.add("sg-renderer-countdown-cell"), M(n)) return "";
		let i = N(n);
		if (!i) return String(n);
		let a = j("span", {
			class: "sg-renderer-countdown",
			title: i.toLocaleString()
		}), o = () => {
			let e = i.getTime() - Date.now();
			a.textContent = e <= 0 ? t : bo(e), a.classList.toggle("is-expired", e <= 0);
		};
		o();
		let s = setInterval(() => {
			a.isConnected ? o() : clearInterval(s);
		}, e);
		return a;
	};
}
function So({ asOfField: e = "as_of", unit: t = "years" } = {}) {
	return ({ value: t, row: n, td: r }) => {
		if (r && r.classList.add("sg-renderer-age-cell"), M(t)) return "";
		let i = N(t);
		if (!i) return String(t);
		let a = n && e && n[e] && N(n[e]) || /* @__PURE__ */ new Date(), o = a.getFullYear() - i.getFullYear() - +(a.getMonth() < i.getMonth() || a.getMonth() === i.getMonth() && a.getDate() < i.getDate());
		return String(o);
	};
}
function Co(e) {
	let t = new Date(Date.UTC(e.getFullYear(), e.getMonth(), e.getDate()));
	t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
	let n = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
	return Math.ceil(((t - n) / 864e5 + 1) / 7);
}
function wo({ unit: e = "quarter", fiscalStartMonth: t = 7, format: n = null } = {}) {
	return ({ value: r, td: i }) => {
		if (i && i.classList.add("sg-renderer-fiscal-cell"), M(r)) return "";
		let a = N(r);
		if (!a) return String(r);
		let o;
		switch (e) {
			case "week":
				o = `W${String(Co(a)).padStart(2, "0")} ${a.getFullYear()}`;
				break;
			case "month":
				o = new Intl.DateTimeFormat(void 0, {
					month: "short",
					year: "numeric"
				}).format(a);
				break;
			case "quarter":
				o = `Q${Math.floor(a.getMonth() / 3) + 1} ${a.getFullYear()}`;
				break;
			case "fiscalYear": {
				let e = t - 1, n = a.getMonth() >= e ? a.getFullYear() + 1 : a.getFullYear();
				o = `FY${String(n).slice(-2)}`;
				break;
			}
			default: o = a.toISOString().slice(0, 10);
		}
		return typeof n == "function" && (o = n(o, a)), j("span", { class: "sg-pill sg-pill-blue" }, document.createTextNode(o));
	};
}
function To(e, t = /* @__PURE__ */ new Date()) {
	try {
		return (new Intl.DateTimeFormat("en-US", {
			timeZone: e,
			timeZoneName: "shortOffset"
		}).formatToParts(t).find((e) => e.type === "timeZoneName")?.value || "").replace(/^GMT/, "UTC");
	} catch {
		return "";
	}
}
var Eo = /* @__PURE__ */ "Pacific/Auckland.Pacific/Fiji.Australia/Sydney.Australia/Melbourne.Australia/Brisbane.Australia/Adelaide.Australia/Perth.Asia/Tokyo.Asia/Seoul.Asia/Shanghai.Asia/Singapore.Asia/Kolkata.Asia/Dubai.Europe/London.Europe/Dublin.Europe/Paris.Europe/Madrid.Europe/Berlin.Europe/Rome.Europe/Amsterdam.Africa/Johannesburg.Africa/Lagos.America/Sao_Paulo.America/Argentina/Buenos_Aires.America/New_York.America/Chicago.America/Denver.America/Phoenix.America/Los_Angeles.America/Anchorage.Pacific/Honolulu.UTC".split(".");
function Do({ withCity: e = !0, editable: t = !1, options: n = null } = {}) {
	return (r) => {
		let { value: i, td: a } = r;
		if (a && (a.classList.add("sg-renderer-tz-cell"), t && !a._sgTzBound && (a._sgTzBound = !0, a._sgSelectOpts = (n || Eo).map((e) => {
			let t = To(e);
			return {
				value: e,
				label: `${e.split("/").pop().replace(/_/g, " ")} (${t || "?"}) — ${e}`
			};
		}), a._sgSelectClearable = !1, a.addEventListener("dblclick", (e) => {
			e._sgSelectHandled || (e._sgSelectHandled = !0, e.stopPropagation(), oi(a, r));
		}))), M(i)) return "";
		let o = String(i), s = To(o), c = e ? o.split("/").pop().replace(/_/g, " ") : o, l = j("span", {
			class: "sg-renderer-tz",
			title: o
		});
		return l.append(j("span", { class: "sg-renderer-tz-city" }, document.createTextNode(c))), l.append(" "), l.append(j("span", { class: "sg-renderer-tz-offset" }, document.createTextNode(s ? `(${s})` : ""))), l;
	};
}
function Oo(e) {
	let t = String(e).trim().split(/\s+/);
	if (t.length !== 5) return null;
	let [n, r, i, a, o] = t, s = n === "*" && r === "*" && i === "*" && a === "*" && o === "*", c = /^\d+$/.test(n) && r === "*" && i === "*" && a === "*" && o === "*", l = /^\d+$/.test(n) && /^\d+$/.test(r) && i === "*" && a === "*" && o === "*", u = n === "0" && /^\*\/\d+$/.test(r) && i === "*" && a === "*" && o === "*", d = /^\d+$/.test(n) && /^\d+$/.test(r) && i === "*" && a === "*" && /^[0-6]$/.test(o), f = /^\d+$/.test(n) && /^\d+$/.test(r) && /^\d+$/.test(i) && a === "*" && o === "*";
	return s ? "Every minute" : c ? `Hourly at :${n.padStart(2, "0")}` : u ? `Every ${r.split("/")[1]} hours` : l ? `Daily at ${r.padStart(2, "0")}:${n.padStart(2, "0")}` : d ? `Weekly on ${[
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	][Number(o)]} at ${r.padStart(2, "0")}:${n.padStart(2, "0")}` : f ? `Monthly on day ${i} at ${r.padStart(2, "0")}:${n.padStart(2, "0")}` : null;
}
function ko({} = {}) {
	return ({ value: e, td: t }) => {
		if (t && t.classList.add("sg-renderer-cron-cell"), M(e)) return "";
		let n = String(e).trim(), r = Oo(n), i = j("span", { class: "sg-renderer-cron" });
		return r ? (i.append(j("span", { class: "sg-renderer-cron-human" }, document.createTextNode(r))), i.append(j("code", { class: "sg-renderer-uuid-mono sg-renderer-cron-expr" }, document.createTextNode(n)))) : i.append(j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(n))), i.title = n, i;
	};
}
function Ao({ min: e = 0, max: t = 100, width: n = 56, height: r = 32, thickness: i = 6, color: a = "#3b82f6", trackColor: o = "#e5e7eb", showValue: s = !0, format: c = null } = {}) {
	return ({ value: l, td: u }) => {
		if (u && u.classList.add("sg-renderer-gauge-cell"), M(l)) return "";
		let d = Number(l);
		if (!Number.isFinite(d)) return String(l);
		d = Math.max(e, Math.min(t, d));
		let f = (d - e) / Math.max(1e-9, t - e), p = i / 2 + 1, m = n / 2, h = r - p, g = Math.min(m - p, h - p), _ = (e) => {
			if (e <= 0) return "";
			let t = m - g, n = h, r = m, i = h - g;
			if (e >= 1) return `M ${t},${n} A ${g},${g} 0 0 1 ${r},${i} A ${g},${g} 0 0 1 ${m + g},${n}`;
			let a = Math.PI + Math.PI * e, o = m + g * Math.cos(a), s = h + g * Math.sin(a);
			return e <= .5 ? `M ${t},${n} A ${g},${g} 0 0 1 ${o},${s}` : `M ${t},${n} A ${g},${g} 0 0 1 ${r},${i} A ${g},${g} 0 0 1 ${o},${s}`;
		}, v = _(1), y = _(f), b = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		b.setAttribute("viewBox", `0 0 ${n} ${r}`), b.setAttribute("width", n), b.setAttribute("height", r);
		let x = document.createElementNS("http://www.w3.org/2000/svg", "path");
		if (x.setAttribute("d", v), x.setAttribute("stroke", o), x.setAttribute("stroke-width", i), x.setAttribute("fill", "none"), x.setAttribute("stroke-linecap", "round"), b.append(x), y) {
			let e = document.createElementNS("http://www.w3.org/2000/svg", "path");
			e.setAttribute("d", y), e.setAttribute("stroke", a), e.setAttribute("stroke-width", i), e.setAttribute("fill", "none"), e.setAttribute("stroke-linecap", "round"), b.append(e);
		}
		let S = j("span", { class: "sg-renderer-gauge" });
		if (S.append(b), s) {
			let e = c || ((e) => String(e));
			S.append(j("span", { class: "sg-renderer-gauge-value" }, document.createTextNode(e(d))));
		}
		return S;
	};
}
function jo({ width: e = 80, height: t = 18, winColor: n = "#22c55e", lossColor: r = "#ef4444", drawColor: i = "#9ca3af" } = {}) {
	return ({ value: a, td: o }) => {
		if (o && o.classList.add("sg-renderer-winloss-cell"), M(a)) return "";
		let s = Array.isArray(a) ? a : String(a).split(",").map((e) => e.trim());
		if (!s.length) return "";
		let c = e / s.length, l = Math.max(.5, c * .2), u = t / 2, d = "";
		s.forEach((e, t) => {
			let a = typeof e == "number" ? e : e === "W" || e === "w" || e === "1" || e === !0 ? 1 : e === "L" || e === "l" || e === "-1" || e === !1 ? -1 : 0, o = t * c + l / 2, s = c - l;
			a > 0 ? d += `<rect x="${o}" y="0" width="${s}" height="${u - 1}" fill="${n}"/>` : a < 0 ? d += `<rect x="${o}" y="${u + 1}" width="${s}" height="${u - 1}" fill="${r}"/>` : d += `<rect x="${o}" y="${u - .5}" width="${s}" height="1" fill="${i}"/>`;
		});
		let f = j("span", { class: "sg-renderer-winloss" });
		return f.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${e} ${t}" width="${e}" height="${t}">${d}</svg>`, f;
	};
}
function Mo({ width: e = 100, height: t = 24, color: n = "#3b82f6", showLabels: r = !1 } = {}) {
	return ({ value: i, td: a }) => {
		if (a && a.classList.add("sg-renderer-minibar-cell"), M(i)) return "";
		let o = Array.isArray(i) ? i.map((e) => typeof e == "object" ? e : { value: Number(e) }) : [];
		if (!o.length) return "";
		let s = o.map((e) => Number(e.value) || 0), c = Math.max(1, ...s), l = e / o.length, u = Math.max(1, l * .18), d = "";
		o.forEach((e, i) => {
			let a = i * l + u / 2, o = l - u, s = (Number(e.value) || 0) / c * t;
			d += `<rect x="${a}" y="${t - s}" width="${o}" height="${s}" fill="${e.color || n}"/>`, r && e.label && (d += `<text x="${a + o / 2}" y="${t - 1}" font-size="7" fill="#fff" text-anchor="middle">${String(e.label).slice(0, 3)}</text>`);
		});
		let f = j("span", { class: "sg-renderer-minibar" });
		return f.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${e} ${t}" width="${e}" height="${t}">${d}</svg>`, f;
	};
}
function No({ width: e = 100, height: t = 24, palette: n = [
	"#3b82f6",
	"#22c55e",
	"#f97316",
	"#a855f7",
	"#ef4444"
], smooth: r = !1, fill: i = !0 } = {}) {
	return ({ value: r, td: a }) => {
		if (a && a.classList.add("sg-renderer-miniline-cell"), M(r)) return "";
		let o = [];
		if (Array.isArray(r) && Array.isArray(r[0]) ? o = r.map((e, t) => ({
			color: n[t % n.length],
			data: e
		})) : r && Array.isArray(r.series) ? o = r.series.map((e, t) => ({
			color: e.color || n[t % n.length],
			data: e.data
		})) : Array.isArray(r) && (o = [{
			color: n[0],
			data: r
		}]), !o.length) return "";
		let s = o.flatMap((e) => e.data.map(Number).filter(Number.isFinite)), c = Math.max(...s), l = Math.min(...s), u = Math.max(1e-9, c - l), d = t - 1.2, f = d - 1.2, p = "";
		for (let t of o) {
			let n = t.data.map((n, r) => {
				let i = r / Math.max(1, t.data.length - 1) * e, a = d - (Number(n) - l) / u * f;
				return `${i.toFixed(2)},${a.toFixed(2)}`;
			});
			p += `<polyline fill="none" stroke="${t.color}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" points="${n.join(" ")}"/>`;
		}
		let m = j("span", { class: `sg-renderer-miniline${i ? " is-fill" : ""}` });
		return m.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${e} ${t}" preserveAspectRatio="none" width="${i ? "100%" : String(e)}" height="${String(t)}">${p}</svg>`, m;
	};
}
var Po = "<svg viewBox=\"0 0 12 12\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M6 2l4 6H2z\"/></svg>", Fo = "<svg viewBox=\"0 0 12 12\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M6 10L2 4h8z\"/></svg>", Io = "<svg viewBox=\"0 0 12 12\" aria-hidden=\"true\"><rect x=\"2\" y=\"5\" width=\"8\" height=\"2\" fill=\"currentColor\"/></svg>";
function Lo({ width: e = 60, height: t = 16, showValue: n = !0, format: r = null } = {}) {
	return ({ value: i, td: a }) => {
		if (a && a.classList.add("sg-renderer-trend-cell"), M(i)) return "";
		let o = typeof i == "object" ? i : {
			value: i,
			change: 0,
			series: []
		}, s = Number(o.change ?? 0), c = s > 0 ? "up" : s < 0 ? "down" : "flat", l = j("span", { class: `sg-renderer-trend is-${c}` }), u = j("span", {
			class: "sg-renderer-trend-icon",
			"aria-hidden": "true"
		});
		if (u.innerHTML = c === "up" ? Po : c === "down" ? Fo : Io, l.append(u), n) {
			let e = r || ((e) => `${e > 0 ? "+" : ""}${Number(e).toFixed(1)}%`);
			l.append(j("span", { class: "sg-renderer-trend-pct" }, document.createTextNode(e(s))));
		}
		if (Array.isArray(o.series) && o.series.length) {
			let n = Math.max(...o.series), r = Math.min(...o.series), i = Math.max(1e-9, n - r), a = o.series.map((n, a) => {
				let s = a / Math.max(1, o.series.length - 1) * e, c = t - (Number(n) - r) / i * t;
				return `${s.toFixed(2)},${c.toFixed(2)}`;
			}).join(" "), s = c === "up" ? "#10b981" : c === "down" ? "#ef4444" : "#9ca3af", u = j("span", { class: "sg-renderer-trend-spark" });
			u.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${e} ${t}" width="${e}" height="${t}"><polyline fill="none" stroke="${s}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" points="${a}"/></svg>`, l.append(u);
		}
		return l;
	};
}
function Ro(e, t) {
	let n = String(e).trim(), r = (t || "").toString().toUpperCase(), i = n.replace(/\D/g, "");
	switch (r) {
		case "AU":
		case "AUSTRALIA": return i.length === 4 ? i : n;
		case "US":
		case "USA":
		case "UNITED STATES": return i.length === 5 ? i : i.length === 9 ? `${i.slice(0, 5)}-${i.slice(5)}` : n;
		case "CA":
		case "CANADA": {
			let e = n.replace(/\s+/g, "").toUpperCase();
			return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(e) ? `${e.slice(0, 3)} ${e.slice(3)}` : n;
		}
		case "GB":
		case "UK":
		case "UNITED KINGDOM": {
			let e = n.replace(/\s+/g, "").toUpperCase(), t = /^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/.exec(e);
			return t ? `${t[1]} ${t[2]}` : n;
		}
		default: return n;
	}
}
function zo({ country: e = null, countryField: t = "country" } = {}) {
	return ({ value: n, row: r, td: i }) => {
		if (M(n)) return "";
		i && i.classList.add("sg-renderer-postal-cell");
		let a = Ro(n, e || (r && t ? r[t] : null));
		return j("span", {
			class: "sg-renderer-uuid",
			title: a
		}, j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(a)));
	};
}
var Bo = null;
function U() {
	if (!Bo) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = Bo;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), Bo = null, B(r);
}
function Vo(e, t) {
	U();
	let { row: n, col: r } = t, i = n && r?.field != null ? n[r.field] : null, a = {
		street: "",
		street2: "",
		city: "",
		state: "",
		zip: ""
	};
	i && typeof i == "object" ? a = {
		street: i.street || i.address1 || "",
		street2: i.street2 || i.address2 || "",
		city: i.city || "",
		state: (i.state || "").toUpperCase(),
		zip: i.zip || i.postcode || i.postal_code || ""
	} : typeof i == "string" && i.trim() && (a.street = i.trim());
	let o = j("div", {
		class: "sg-renderer-address-popover",
		role: "dialog"
	});
	o.addEventListener("mousedown", (e) => e.stopPropagation());
	let s = (e, t, n = {}) => {
		let r = j("label", { class: "sg-renderer-address-field" });
		r.append(j("span", { class: "sg-renderer-address-label" }, document.createTextNode(e)));
		let i = j("input", {
			type: "text",
			class: "sg-renderer-address-input",
			...n
		});
		return i.value = a[t] || "", i.dataset.key = t, r.append(i), {
			wrap: r,
			input: i
		};
	}, c = s("Street", "street"), l = s("Apt/Ste", "street2"), u = s("City", "city"), d = s("State", "state", { maxlength: 2 }), f = s("ZIP", "zip", { maxlength: 10 }), p = j("div", { class: "sg-renderer-address-row" });
	p.append(c.wrap);
	let m = j("div", { class: "sg-renderer-address-row" });
	m.append(l.wrap);
	let h = j("div", { class: "sg-renderer-address-row sg-renderer-address-row-3" });
	h.append(u.wrap, d.wrap, f.wrap);
	function g() {
		let { api: i } = t, a = {
			street: c.input.value.trim(),
			street2: l.input.value.trim(),
			city: u.input.value.trim(),
			state: d.input.value.trim().toUpperCase(),
			zip: f.input.value.trim()
		};
		a.street2 || delete a.street2;
		let o = n && r?.field != null ? n[r.field] : null;
		n && r?.field != null && (n[r.field] = a), i?.applyTransaction && i.applyTransaction({ update: [n] });
		let s = e.closest("[data-controller~=\"grid\"]");
		s && s.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
			bubbles: !0,
			detail: {
				rowId: n?.id ?? n?._sg_id,
				colId: r?.field,
				oldValue: o,
				newValue: a
			}
		})), U();
	}
	let _ = j("div", { class: "sg-renderer-textarea-footer" }), v = j("span", { class: "sg-renderer-textarea-hint" }, document.createTextNode("Enter to save · Esc to cancel")), y = j("button", {
		type: "button",
		class: "sg-renderer-timepicker-cancel"
	}, document.createTextNode("Cancel")), b = j("button", {
		type: "button",
		class: "sg-renderer-timepicker-ok"
	}, document.createTextNode("Save"));
	y.addEventListener("click", () => U()), b.addEventListener("click", g), _.append(v, y, b), o.append(p, m, h, _), o.addEventListener("keydown", (e) => {
		e.key === "Enter" && e.target.tagName === "INPUT" ? (e.preventDefault(), g()) : e.key === "Escape" && (e.stopPropagation(), U());
	});
	function x(e) {
		e.key === "Escape" && (e.stopPropagation(), U());
	}
	function S(t) {
		!o.contains(t.target) && !e.contains(t.target) && U();
	}
	document.addEventListener("keydown", x), setTimeout(() => document.addEventListener("mousedown", S), 0), document.body.appendChild(o), F(o, e), setTimeout(() => c.input.focus(), 0), Bo = {
		pop: o,
		onKey: x,
		onDocClick: S,
		anchor: e
	};
}
function Ho(e) {
	return e == null || e === "" ? null : typeof e == "string" ? { _raw: e.trim() } : typeof e == "object" ? {
		street: e.street || e.address1 || "",
		street2: e.street2 || e.address2 || "",
		city: e.city || "",
		state: (e.state || "").toUpperCase(),
		zip: e.zip || e.postcode || e.postal_code || ""
	} : null;
}
function Uo({ empty: e = "", editable: t = !1 } = {}) {
	return (n) => {
		let { value: r, td: i } = n;
		i && (i.classList.add("sg-renderer-address-cell"), t && !i._sgAddrBound && (i._sgAddrBound = !0, i._sgTextareaRows = 6, i._sgTextareaCols = 36, i.addEventListener("dblclick", (e) => {
			e._sgTextareaHandled || (e._sgTextareaHandled = !0, e.stopPropagation(), Vo(i, n));
		})));
		let a = Ho(r);
		if (!a) return e;
		if (a._raw) return j("span", { class: "sg-renderer-address" }, document.createTextNode(a._raw));
		let o = j("div", { class: "sg-renderer-address sg-renderer-address-us" }), s = [a.street, a.street2].filter(Boolean).join(", ");
		s && o.append(j("span", { class: "sg-address-line" }, document.createTextNode(s)));
		let c = [a.city, a.state].filter(Boolean).join(", ") + (a.zip ? ` ${a.zip}` : "");
		return c.trim() && (s && o.append(j("span", { class: "sg-address-sep" }, document.createTextNode(" · "))), o.append(j("span", { class: "sg-address-line" }, document.createTextNode(c.trim())))), o;
	};
}
function Wo(e) {
	return e == null || e === "" ? null : typeof e == "string" ? { _raw: e.trim() } : typeof e == "object" ? {
		line1: e.line1 || e.address1 || e.street || "",
		line2: e.line2 || e.address2 || e.street2 || "",
		city: e.city || "",
		region: e.region || e.state || "",
		postal_code: e.postal_code || e.postcode || e.zip || "",
		country: e.country || ""
	} : null;
}
function Go({ empty: e = "", multiline: t = !1 } = {}) {
	return ({ value: n, td: r }) => {
		r && r.classList.add("sg-renderer-address-cell");
		let i = Wo(n);
		if (!i) return e;
		if (i._raw) return j("span", { class: "sg-renderer-address" }, document.createTextNode(i._raw));
		let a = [];
		i.line1 && a.push(i.line1), i.line2 && a.push(i.line2);
		let o = [
			i.city,
			i.region,
			i.postal_code
		].filter(Boolean).join(" ");
		if (o && a.push(o), i.country && a.push(i.country), t) {
			let e = j("div", { class: "sg-renderer-address sg-renderer-address-multi" });
			return a.forEach((t, n) => {
				n > 0 && e.append(j("br")), e.append(document.createTextNode(t));
			}), e;
		}
		return j("span", { class: "sg-renderer-address" }, document.createTextNode(a.join(" · ")));
	};
}
var Ko = /* @__PURE__ */ "11011001100.11001101100.11001100110.10010011000.10010001100.10001001100.10011001000.10011000100.10001100100.11001001000.11001000100.11000100100.10110011100.10011011100.10011001110.10111001100.10011101100.10011100110.11001110010.11001011100.11001001110.11011100100.11001110100.11101101110.11101001100.11100101100.11100100110.11101100100.11100110100.11100110010.11011011000.11011000110.11000110110.10100011000.10001011000.10001000110.10110001000.10001101000.10001100010.11010001000.11000101000.11000100010.10110111000.10110001110.10001101110.10111011000.10111000110.10001110110.11101110110.11010001110.11000101110.11011101000.11011100010.11011101110.11101011000.11101000110.11100010110.11101101000.11101100010.11100011010.11101111010.11001000010.11110001010.10100110000.10100001100.10010110000.10010000110.10000101100.10000100110.10110010000.10110000100.10011010000.10011000010.10000110100.10000110010.11000010010.11001010000.11110111010.11000010100.10001111010.10100111100.10010111100.10010011110.10111100100.10011110100.10011110010.11110100100.11110010100.11110010010.11011011110.11011110110.11110110110.10101111000.10100011110.10001011110.10111101000.10111100010.11110101000.11110100010.10111011110.10111101110.11101011110.11110101110.11010000100.11010010000.11010011100".split("."), qo = 32, Jo = 104, Yo = 106;
function Xo(e) {
	let t = [Jo], n = Jo;
	for (let r = 0; r < e.length; r++) {
		let i = e.charCodeAt(r);
		if (i < 32 || i > 126) continue;
		let a = i - qo;
		t.push(a), n += a * (r + 1);
	}
	return t.push(n % 103), t.push(Yo), t.map((e) => Ko[e]).join("") + "11";
}
function Zo({ height: e = 32, showText: t = !0, moduleWidth: n = 1.4 } = {}) {
	return ({ value: r, td: i }) => {
		if (M(r)) return "";
		i && i.classList.add("sg-renderer-barcode-cell");
		let a = String(r), o = Xo(a), s = o.length * n, c = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s} ${e}" width="${s}" height="${e}" aria-label="barcode ${a}">`, l = 0, u = "";
		for (let t = 0; t < o.length; t++) o[t] === "1" && (u += `<rect x="${l}" y="0" width="${n}" height="${e}" fill="currentColor"/>`), l += n;
		let d = j("span", {
			class: "sg-renderer-barcode",
			title: a
		});
		return d.innerHTML = `${c}${u}</svg>`, t && d.append(j("span", { class: "sg-renderer-barcode-text" }, document.createTextNode(a))), d;
	};
}
var Qo = {
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
function $o({} = {}) {
	return ({ value: e, td: t }) => {
		if (M(e)) return "";
		t && t.classList.add("sg-renderer-iban-cell");
		let n = String(e).replace(/\s+/g, "").toUpperCase(), r = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(n), i = n.match(/.{1,4}/g)?.join(" ") || n, a = Qo[n.slice(0, 2)];
		return j("span", {
			class: `sg-renderer-uuid${r ? "" : " is-invalid"}`,
			title: a ? `${i} — ${a}` : i
		}, j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(i)));
	};
}
function es({} = {}) {
	return ({ value: e, td: t }) => {
		if (M(e)) return "";
		t && t.classList.add("sg-renderer-swift-cell");
		let n = String(e).replace(/\s+/g, "").toUpperCase(), r = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(n), i;
		i = r ? n.length === 8 ? `${n.slice(0, 4)} ${n.slice(4, 6)} ${n.slice(6, 8)}` : `${n.slice(0, 4)} ${n.slice(4, 6)} ${n.slice(6, 8)} ${n.slice(8, 11)}` : n;
		let a = Qo[n.slice(4, 6)];
		return j("span", {
			class: `sg-renderer-uuid${r ? "" : " is-invalid"}`,
			title: a ? `${i} — ${a}` : i
		}, j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(i)));
	};
}
function ts({} = {}) {
	return ({ value: e, td: t }) => {
		if (M(e)) return "";
		t && t.classList.add("sg-renderer-mask-numeric");
		let n = String(e).replace(/\D/g, "");
		if (n.length !== 9) return j("span", { class: "sg-renderer-uuid is-invalid" }, j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(String(e))));
		let r = `•••-••-${n.slice(5)}`;
		return j("span", {
			class: "sg-renderer-uuid",
			title: "SSN (masked)"
		}, j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(r)));
	};
}
function ns({} = {}) {
	return ({ value: e, td: t }) => {
		if (M(e)) return "";
		t && t.classList.add("sg-renderer-ein-cell");
		let n = String(e).replace(/\D/g, ""), r = n.length === 9, i = r ? `${n.slice(0, 2)}-${n.slice(2)}` : String(e);
		return j("span", {
			class: `sg-renderer-uuid${r ? "" : " is-invalid"}`,
			title: i
		}, j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(i)));
	};
}
function rs({} = {}) {
	return ({ value: e, td: t }) => {
		if (M(e)) return "";
		t && t.classList.add("sg-renderer-vat-cell");
		let n = String(e).replace(/\s+/g, "").toUpperCase(), r = /^[A-Z]{2}[A-Z0-9]{2,15}$/.test(n), i = Qo[n.slice(0, 2)];
		return j("span", {
			class: `sg-renderer-uuid${r ? "" : " is-invalid"}`,
			title: i ? `${n} — ${i}` : n
		}, j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(n)));
	};
}
var is = /^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[A-D]$/i;
function as({} = {}) {
	return ({ value: e, td: t }) => {
		if (M(e)) return "";
		t && t.classList.add("sg-renderer-nin-cell");
		let n = String(e).replace(/\s+/g, "").toUpperCase(), r = is.test(n), i = r ? `${n.slice(0, 2)} ${n.slice(2, 4)} ${n.slice(4, 6)} ${n.slice(6, 8)} ${n.slice(8)}` : n;
		return j("span", {
			class: `sg-renderer-uuid${r ? "" : " is-invalid"}`,
			title: n
		}, j("code", { class: "sg-renderer-uuid-mono" }, document.createTextNode(i)));
	};
}
var os = [
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
function ss(e) {
	let t = 0;
	for (let n = 0; n < e.length; n++) t = (t << 5) - t + e.charCodeAt(n), t |= 0;
	return Math.abs(t);
}
function cs(e) {
	return String(e || "").split(/\s+/).filter(Boolean).slice(0, 2).map((e) => (e[0] || "").toUpperCase()).join("") || "?";
}
function ls(e, t = 24) {
	let n = j("span", {
		class: "sg-renderer-avatar-stack-chip",
		style: `width: ${t}px; height: ${t}px; font-size: ${Math.round(t * .42)}px;`,
		title: e.name || e.label || ""
	});
	if (e.avatar) n.append(j("img", {
		src: e.avatar,
		alt: "",
		loading: "lazy",
		decoding: "async"
	}));
	else {
		let t = e.name || e.label || "?", r = e.color || os[ss(t) % os.length];
		n.style.background = r, n.append(j("span", { class: "sg-renderer-avatar-stack-initials" }, document.createTextNode(cs(t))));
	}
	return n;
}
function us({ max: e = 4, size: t = 24, showOverflow: n = !0 } = {}) {
	return (r) => {
		let { value: i } = r, a = r?.col?.cellRendererConfig || {}, o = a.max ?? e, s = a.size ?? t, c = a.showOverflow ?? n;
		if (M(i)) return "";
		let l = (Array.isArray(i) ? i : String(i).split(",")).map((e) => typeof e == "string" ? { name: e.trim() } : e).filter((e) => e && (e.name || e.avatar));
		if (!l.length) return "";
		let u = l.slice(0, o), d = l.length - u.length, f = j("span", { class: "sg-renderer-avatar-stack" });
		for (let e of u) f.append(ls(e, s));
		return c && d > 0 && f.append(j("span", {
			class: "sg-renderer-avatar-stack-chip is-overflow",
			style: `width: ${s}px; height: ${s}px; font-size: ${Math.round(s * .36)}px;`,
			title: l.slice(o).map((e) => e.name).filter(Boolean).join(", ")
		}, document.createTextNode(`+${d}`))), f;
	};
}
var ds = {
	online: {
		color: "#22c55e",
		label: "Online"
	},
	away: {
		color: "#f59e0b",
		label: "Away"
	},
	busy: {
		color: "#ef4444",
		label: "Busy"
	},
	dnd: {
		color: "#ef4444",
		label: "Do not disturb"
	},
	offline: {
		color: "#9ca3af",
		label: "Offline"
	},
	invisible: {
		color: "transparent",
		label: "Invisible"
	}
};
function fs({ showLabel: e = !1, size: t = 8 } = {}) {
	return (n) => {
		let { value: r } = n, i = n?.col?.cellRendererConfig || {}, a = i.showLabel ?? e, o = i.size ?? t;
		if (r == null || r === "") return "";
		let s = null;
		s = r === !0 ? "online" : r === !1 ? "offline" : typeof r == "object" ? r.status || r.state : String(r).toLowerCase();
		let c = ds[s] || ds.offline, l = typeof r == "object" && r.label || c.label, u = j("span", {
			class: "sg-renderer-presence",
			title: l
		});
		return u.append(j("span", {
			class: `sg-renderer-presence-dot is-${s}`,
			style: `width: ${o}px; height: ${o}px; background: ${c.color}; ${c.color === "transparent" ? "border: 1px solid #9ca3af;" : ""}`,
			"aria-hidden": "true"
		})), a && u.append(j("span", { class: "sg-renderer-presence-label" }, document.createTextNode(l))), u;
	};
}
function ps({ showPresence: e = !0, showAvatar: t = !0, size: n = 20, editable: r = !1, options: i = null, clearable: a = !0 } = {}) {
	return (o) => {
		let { value: s, td: c } = o, l = o?.col?.cellRendererConfig || {}, u = l.showPresence ?? e, d = l.showAvatar ?? t, f = l.size ?? n, p = l.editable ?? r, m = l.options ?? i, h = l.clearable ?? a;
		if (c && p && !c._sgAssigneeBound && (c._sgAssigneeBound = !0, c._sgAssigneeOpts = m || [], c._sgAssigneeClearable = h, c.addEventListener("dblclick", (e) => {
			e._sgAssigneeHandled || (e._sgAssigneeHandled = !0, e.stopPropagation(), gs(c, o));
		})), M(s)) return j("span", { class: "sg-renderer-assignee-empty" }, document.createTextNode("Unassigned"));
		let g = typeof s == "string" ? { name: s } : s, _ = g.name || g.label || "";
		if (!_ && !g.avatar) return "";
		let v = j("span", { class: "sg-renderer-assignee" });
		d && v.append(ls(g, f));
		let y = j("span", { class: "sg-renderer-assignee-name" }, document.createTextNode(_));
		if (u && g.presence) {
			let e = String(g.presence).toLowerCase(), t = ds[e] || ds.offline;
			y.prepend(j("span", {
				class: `sg-renderer-presence-dot is-${e}`,
				style: `width: 7px; height: 7px; background: ${t.color}; margin-right: 6px; ${t.color === "transparent" ? "border: 1px solid #9ca3af;" : ""}`,
				"aria-hidden": "true",
				title: t.label
			}));
		}
		return v.append(y), v;
	};
}
var ms = null;
function hs() {
	if (!ms) return;
	let { pop: e, onKey: t, onDocClick: n, anchor: r } = ms;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), ms = null, B(r);
}
function gs(e, t) {
	hs();
	let n = e._sgAssigneeOpts || [], r = e._sgAssigneeClearable, { row: i, col: a } = t, o = i && a?.field != null ? i[a.field] : null, s = (typeof o == "string" ? o : o?.name) || "", c = j("div", {
		class: "sg-renderer-assignee-popover",
		role: "listbox"
	});
	c.addEventListener("mousedown", (e) => e.stopPropagation());
	function l(n) {
		let { api: r } = t, o = i && a?.field != null ? i[a.field] : null;
		i && a?.field != null && (i[a.field] = n), r?.applyTransaction && r.applyTransaction({ update: [i] });
		let s = e.closest("[data-controller~=\"grid\"]");
		s && s.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
			bubbles: !0,
			detail: {
				rowId: i?.id ?? i?._sg_id,
				colId: a?.field,
				oldValue: o,
				newValue: n
			}
		})), hs();
	}
	if (r) {
		let e = j("button", {
			type: "button",
			class: "sg-renderer-assignee-option sg-renderer-assignee-option-none",
			role: "option"
		}, document.createTextNode("Unassigned"));
		e.addEventListener("click", () => l(null)), c.append(e);
	}
	if (!n.length) {
		let e = j("div", { class: "sg-renderer-assignee-option-empty" }, document.createTextNode("No people configured"));
		c.append(e);
	}
	for (let e of n) {
		let t = typeof e == "string" ? { name: e } : e, n = j("button", {
			type: "button",
			class: `sg-renderer-assignee-option${t.name === s ? " is-selected" : ""}`,
			role: "option"
		});
		n.append(ls(t, 20)), n.append(j("span", { class: "sg-renderer-assignee-option-name" }, document.createTextNode(t.name || t.label || ""))), n.addEventListener("click", () => l(t)), c.append(n);
	}
	function u(e) {
		e.key === "Escape" && (e.stopPropagation(), hs());
	}
	function d(t) {
		!c.contains(t.target) && !e.contains(t.target) && hs();
	}
	document.addEventListener("keydown", u), setTimeout(() => document.addEventListener("mousedown", d), 0), document.body.appendChild(c), F(c, e), ms = {
		pop: c,
		onKey: u,
		onDocClick: d,
		anchor: e
	};
}
function _s({ min: e = 0, max: t = 100, step: n = 1, format: r = null, color: i = "#3b82f6", editable: a = !0, range: o = !1, showValue: s = !0 } = {}) {
	return (c) => {
		let { value: l, row: u, col: d, api: f, td: p } = c, m = c?.col?.cellRendererConfig || {}, h = m.min ?? e, g = m.max ?? t, _ = m.step ?? n, v = m.range ?? o, y = r || ((e) => String(e)), b = m.showValue ?? s, x = m.color || i, S = m.editable ?? a;
		if (p && p.classList.add("sg-renderer-slider-cell"), M(l) && !v) return j("span", { class: "sg-renderer-slider-placeholder" }, document.createTextNode("—"));
		let C = j("div", { class: "sg-renderer-slider" });
		function w(e) {
			let t = u && d?.field != null ? u[d.field] : null;
			u && d?.field != null && (u[d.field] = e), f?.applyTransaction && f.applyTransaction({ update: [u] });
			let n = p?.closest("[data-controller~=\"grid\"]");
			n && n.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
				bubbles: !0,
				detail: {
					rowId: u?.id ?? u?._sg_id,
					colId: d?.field,
					oldValue: t,
					newValue: e
				}
			}));
		}
		if (v) {
			let [e, t] = Array.isArray(l) ? l : [h, g], n = Math.max(1, g - h), r = j("div", { class: "sg-renderer-slider-range-stack" }), i = j("div", { class: "sg-renderer-slider-range-rail" }), a = j("div", {
				class: "sg-renderer-slider-range-fill",
				style: `background:${x};`
			}), o = j("input", {
				type: "range",
				class: "sg-renderer-slider-input sg-renderer-slider-range-low",
				min: h,
				max: g,
				step: _,
				value: e,
				disabled: S ? null : ""
			}), s = j("input", {
				type: "range",
				class: "sg-renderer-slider-input sg-renderer-slider-range-high",
				min: h,
				max: g,
				step: _,
				value: t,
				disabled: S ? null : ""
			});
			r.style.setProperty("--sg-slider-accent", x);
			let c = j("span", { class: "sg-renderer-slider-value" }, document.createTextNode(`${y(e)} – ${y(t)}`));
			function u() {
				let e = Number(o.value), t = Number(s.value);
				e > t && ([e, t] = [t, e]);
				let r = (e - h) / n * 100, i = (t - h) / n * 100;
				a.style.left = `${r}%`, a.style.width = `${Math.max(0, i - r)}%`, c.textContent = `${y(e)} – ${y(t)}`;
			}
			function d() {
				let e = Number(o.value), t = Number(s.value);
				e > t && ([e, t] = [t, e]), u(), w([e, t]);
			}
			[o, s].forEach((e) => {
				e.addEventListener("click", (e) => e.stopPropagation()), e.addEventListener("input", u), e.addEventListener("change", d);
			}), r.append(i, a, o, s), C.append(r), b && C.append(c), u();
		} else {
			let e = Number(l), t = Number.isFinite(e) ? e : h, n = j("input", {
				type: "range",
				class: "sg-renderer-slider-input",
				min: h,
				max: g,
				step: _,
				value: t,
				disabled: S ? null : "",
				style: `accent-color: ${x};`
			}), r = j("span", { class: "sg-renderer-slider-value" }, document.createTextNode(y(t)));
			n.addEventListener("click", (e) => e.stopPropagation()), n.addEventListener("input", () => {
				r.textContent = y(Number(n.value));
			}), n.addEventListener("change", () => w(Number(n.value))), C.append(n), b && C.append(r);
		}
		return C;
	};
}
var vs = {
	NSW: {
		bg: "#1e3a8a",
		fg: "#ffffff"
	},
	VIC: {
		bg: "#1e3a8a",
		fg: "#ffffff"
	},
	QLD: {
		bg: "#7c2d12",
		fg: "#ffffff"
	},
	SA: {
		bg: "#7f1d1d",
		fg: "#ffffff"
	},
	WA: {
		bg: "#ca8a04",
		fg: "#ffffff"
	},
	TAS: {
		bg: "#14532d",
		fg: "#ffffff"
	},
	NT: {
		bg: "#9a3412",
		fg: "#ffffff"
	},
	ACT: {
		bg: "#374151",
		fg: "#facc15"
	}
}, ys = {
	NSW: {
		bg: "#fde047",
		fg: "#0f172a",
		border: "#0f172a"
	},
	VIC: {
		bg: "#ffffff",
		fg: "#1d4ed8",
		border: "#1d4ed8"
	},
	QLD: {
		bg: "#ffffff",
		fg: "#7f1d1d",
		border: "#7f1d1d"
	},
	SA: {
		bg: "#facc15",
		fg: "#0f172a",
		border: "#0f172a"
	},
	WA: {
		bg: "#fbbf24",
		fg: "#0f172a",
		border: "#0f172a"
	},
	TAS: {
		bg: "#ffffff",
		fg: "#166534",
		border: "#166534"
	},
	NT: {
		bg: "#ffffff",
		fg: "#9a3412",
		border: "#9a3412"
	},
	ACT: {
		bg: "#1f2937",
		fg: "#facc15",
		border: "#facc15"
	}
}, bs = {
	standard: {
		label: "Standard",
		uses: "state"
	},
	personalised: {
		label: "Personalised",
		bg: "#0f172a",
		fg: "#ffffff",
		border: "#0f172a"
	},
	"personalised-plus": {
		label: "Personalised Plus",
		bg: "#facc15",
		fg: "#0f172a",
		border: "#0f172a"
	},
	"personalised-red": {
		label: "Personalised (red)",
		bg: "#ffffff",
		fg: "#b91c1c",
		border: "#b91c1c"
	},
	"premium-white": {
		label: "Premium",
		bg: "#ffffff",
		fg: "#0f172a",
		border: "#0f172a"
	},
	"premium-slimline": {
		label: "Premium Slimline",
		bg: "#ffffff",
		fg: "#0f172a",
		border: "#0f172a",
		slim: !0
	},
	"premium-red": {
		label: "Premium (red)",
		bg: "#ffffff",
		fg: "#b91c1c",
		border: "#b91c1c"
	},
	"vanity-silver": {
		label: "Vanity (silver)",
		bg: "#0f172a",
		fg: "#cbd5e1",
		border: "#0f172a"
	},
	"vanity-white": {
		label: "Vanity (white)",
		bg: "#0f172a",
		fg: "#ffffff",
		border: "#0f172a"
	},
	"bright-lights": {
		label: "Bright Lights",
		bg: "#0f172a",
		fg: "#ffffff",
		border: "#ffffff"
	},
	"bright-lights-red": {
		label: "Bright Lights (red)",
		bg: "#0f172a",
		fg: "#dc2626",
		border: "#dc2626"
	},
	"bright-lights-blue": {
		label: "Bright Lights (blue)",
		bg: "#0f172a",
		fg: "#60a5fa",
		border: "#60a5fa"
	},
	"bright-lights-slim": {
		label: "Bright Lights Slimline",
		bg: "#0f172a",
		fg: "#dc2626",
		border: "#dc2626",
		slim: !0
	}
};
function xs(e, t) {
	return t && bs[t] && bs[t].bg ? bs[t] : ys[e] || {
		bg: "#f3f4f6",
		fg: "#1f2937",
		border: "#9ca3af"
	};
}
function Ss(e, t = vs) {
	let n = String(e || "").toUpperCase();
	if (!n) return null;
	let r = t[n] || {
		bg: "#6b7280",
		fg: "#ffffff"
	};
	return j("span", {
		class: "sg-renderer-state-badge",
		style: `background:${r.bg};color:${r.fg};`,
		title: n
	}, document.createTextNode(n));
}
function W(e) {
	if (!e) return null;
	let t = e instanceof Date ? e : new Date(e);
	if (Number.isNaN(t.valueOf())) return null;
	let n = new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime(), r = /* @__PURE__ */ new Date(), i = new Date(r.getFullYear(), r.getMonth(), r.getDate()).getTime();
	return Math.round((n - i) / 864e5);
}
function Cs(e) {
	return e == null ? null : e < 0 ? "is-expired" : e < 30 ? "is-soon" : e < 90 ? "is-warning" : "is-current";
}
function ws(e, { label: t = "exp" } = {}) {
	if (!e) return null;
	let n = W(e);
	if (n == null) return null;
	let r = Cs(n), i = e instanceof Date ? e : new Date(e), a = `${String(i.getMonth() + 1).padStart(2, "0")}/${i.getFullYear()}`, o = n < 0 ? `expired ${a}` : `${t} ${a}`, s = n < 0 ? `Expired ${Math.abs(n)} day${Math.abs(n) === 1 ? "" : "s"} ago` : n === 0 ? "Expires today" : `Expires in ${n} day${n === 1 ? "" : "s"}`;
	return j("span", {
		class: `sg-renderer-expiry ${r}`,
		title: s
	}, document.createTextNode(o));
}
function Ts({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && (r.classList.add("sg-renderer-licence-cell"), r._sgLicence = n, e && !r._sgLicenceEditBound && (r._sgLicenceEditBound = !0, r.addEventListener("dblclick", (e) => {
			e._sgLicenceHandled || (e._sgLicenceHandled = !0, e.stopPropagation(), Os(r, t));
		}))), M(n)) return "";
		if (typeof n == "string") return j("span", { class: "sg-renderer-compliance" }, j("span", { class: "sg-renderer-mono" }, document.createTextNode(n)));
		let i = j("span", { class: "sg-renderer-compliance" });
		n.state && i.append(Ss(n.state)), n.number && i.append(j("span", { class: "sg-renderer-mono" }, document.createTextNode(String(n.number)))), n.class && i.append(j("span", { class: "sg-renderer-compliance-class" }, document.createTextNode(String(n.class))));
		let a = ws(n.expires);
		return a && i.append(a), i;
	};
}
var Es = null;
function Ds() {
	if (!Es) return;
	let { pop: e, onKey: t, onDocClick: n } = Es;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), Es = null;
}
function Os(e, t) {
	Ds();
	let n = e._sgLicence, r = n && typeof n == "object" ? {
		state: n.state || "",
		number: n.number ?? "",
		class: n.class ?? "",
		expires: n.expires || ""
	} : {
		state: "",
		number: typeof n == "string" ? n : "",
		class: "",
		expires: ""
	}, i = j("div", {
		class: "sg-licence-editor",
		role: "dialog"
	});
	i.addEventListener("mousedown", (e) => e.stopPropagation());
	let a = j("div", { class: "sg-licence-editor-header" }, document.createTextNode("Edit licence")), o = j("form", {
		class: "sg-licence-editor-form",
		novalidate: "novalidate"
	}), s = j("div", { class: "sg-licence-editor-grid" });
	function c(e, t, n) {
		let r = j("label", {
			class: "sg-licence-editor-field",
			"data-field": t
		});
		return r.append(j("span", { class: "sg-licence-editor-label" }, document.createTextNode(e))), r.append(n), r;
	}
	let l = j("select", {
		name: "state",
		class: "sg-licence-editor-input"
	});
	l.append(j("option", { value: "" }, document.createTextNode("—")));
	for (let e of rn) l.append(j("option", {
		value: e,
		selected: r.state === e ? "" : null
	}, document.createTextNode(`${e} — ${an[e]}`)));
	let u = j("input", {
		type: "text",
		name: "number",
		class: "sg-licence-editor-input sg-renderer-mono",
		value: r.number,
		placeholder: "EC234567C"
	}), d = j("input", {
		type: "text",
		name: "class",
		class: "sg-licence-editor-input",
		value: r.class,
		placeholder: "Electrical"
	}), f = j("input", {
		type: "date",
		name: "expires",
		class: "sg-licence-editor-input",
		value: r.expires ? String(r.expires).slice(0, 10) : ""
	});
	s.append(c("State", "state", l), c("Licence #", "number", u), c("Class", "class", d), c("Expires", "expires", f));
	let p = j("div", { class: "sg-licence-editor-footer" }), m = j("button", {
		type: "button",
		class: "sg-licence-editor-cancel"
	}, document.createTextNode("Cancel")), h = j("button", {
		type: "submit",
		class: "sg-licence-editor-save"
	}, document.createTextNode("Save"));
	p.append(m, h), o.append(s, p), i.append(a, o);
	function g() {
		let n = {
			state: l.value || "",
			number: u.value.trim(),
			class: d.value.trim(),
			expires: f.value || ""
		};
		ks(e, t, !n.state && !n.number && !n.class && !n.expires ? null : n), Ds();
	}
	o.addEventListener("submit", (e) => {
		e.preventDefault(), g();
	}), m.addEventListener("click", () => Ds());
	function _(e) {
		e.key === "Escape" && (e.stopPropagation(), Ds());
	}
	function v(t) {
		!i.contains(t.target) && !e.contains(t.target) && Ds();
	}
	document.addEventListener("keydown", _), setTimeout(() => document.addEventListener("mousedown", v), 0), document.body.appendChild(i), F(i, e), u.focus(), u.select(), Es = {
		pop: i,
		onKey: _,
		onDocClick: v
	};
}
function ks(e, t, n) {
	let { row: r, col: i, api: a } = t, o = r && i?.field != null ? r[i.field] : null;
	r && i?.field != null && (r[i.field] = n), e._sgLicence = n, a?.applyTransaction && a.applyTransaction({ update: [r] });
	let s = e.closest("[data-controller~=\"grid\"]");
	s && s.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
		bubbles: !0,
		detail: {
			rowId: r?.id ?? r?._sg_id,
			colId: i?.field,
			oldValue: o,
			newValue: n
		}
	}));
}
function G({ prefix: e = null, classLabel: t = null, expiryLabel: n = "exp", editable: r = !0 } = {}) {
	return (i) => {
		let { value: a, td: o } = i;
		if (o && (o.classList.add("sg-renderer-licence-cell"), o._sgLicence = a, r && !o._sgLicenceEditBound && (o._sgLicenceEditBound = !0, o.addEventListener("dblclick", (e) => {
			e._sgLicenceHandled || (e._sgLicenceHandled = !0, e.stopPropagation(), Os(o, i));
		}))), M(a)) return "";
		let s = j("span", { class: "sg-renderer-compliance" });
		if (typeof a == "string") return e && s.append(j("span", { class: "sg-renderer-compliance-prefix" }, document.createTextNode(e))), s.append(j("span", { class: "sg-renderer-mono" }, document.createTextNode(a))), s;
		a.state ? s.append(Ss(a.state)) : e && s.append(j("span", { class: "sg-renderer-compliance-prefix" }, document.createTextNode(e))), a.number && s.append(j("span", { class: "sg-renderer-mono" }, document.createTextNode(String(a.number))));
		let c = a.class ?? t;
		c && s.append(j("span", { class: "sg-renderer-compliance-class" }, document.createTextNode(String(c))));
		let l = ws(a.expires, { label: n });
		return l && s.append(l), s;
	};
}
function As(e = {}) {
	return G({
		prefix: "CIC",
		classLabel: "White Card",
		...e
	});
}
function js(e = {}) {
	return G({
		prefix: "BC",
		classLabel: "Blue Card (QLD)",
		...e
	});
}
function Ms(e = {}) {
	return G({
		prefix: "WWCC",
		...e
	});
}
function Ns(e = {}) {
	return G({
		prefix: "HRWL",
		...e
	});
}
function Ps(e = {}) {
	return G({
		prefix: "COES",
		classLabel: "Electrical Safety",
		...e
	});
}
function Fs(e = {}) {
	return G({
		prefix: "COC",
		classLabel: "Compliance",
		...e
	});
}
function Is(e = {}) {
	return G({
		prefix: "QBCC",
		...e
	});
}
function Ls(e = {}) {
	return G({
		prefix: "VBA",
		...e
	});
}
function Rs(e = {}) {
	return G({
		prefix: "Gas",
		classLabel: "Type A",
		...e
	});
}
function zs(e = {}) {
	return G({
		prefix: "Asbestos",
		classLabel: "Class B",
		...e
	});
}
function Bs(e = {}) {
	return G({
		prefix: "ARC RHL",
		...e
	});
}
function Vs(e = {}) {
	return G({
		prefix: "PSC",
		classLabel: "Pool Safety",
		...e
	});
}
function Hs(e = {}) {
	return G({
		prefix: "T&T",
		expiryLabel: "next",
		...e
	});
}
function Us() {
	return Y({
		registered: "green",
		"not-registered": "gray",
		pending: "orange"
	}, {
		registered: "check-circle",
		"not-registered": "circle",
		pending: "clock"
	}, { title: "GST status" });
}
function Ws() {
	return Y({
		active: "green",
		cancelled: "red",
		suspended: "orange",
		pending: "gray"
	}, {
		active: "check-circle",
		cancelled: "x-circle",
		suspended: "alert",
		pending: "clock"
	}, { title: "ABN status" });
}
function Gs(e = {}) {
	return G({
		prefix: "HBCF",
		...e
	});
}
function Ks() {
	return Y({
		quoted: "gray",
		scheduled: "blue",
		dispatched: "indigo",
		"on-site": "purple",
		completed: "green",
		invoiced: "orange",
		paid: "green",
		"on-hold": "yellow",
		cancelled: "red",
		"no-show": "red"
	}, {
		quoted: "circle",
		scheduled: "clock",
		dispatched: "truck",
		"on-site": "dot",
		completed: "check-circle",
		invoiced: "cart",
		paid: "check-circle",
		"on-hold": "clock",
		cancelled: "x-circle",
		"no-show": "alert"
	}, { title: "Job status" });
}
function qs() {
	return Y({
		signed: "green",
		pending: "orange",
		expired: "red",
		missing: "red",
		"not-required": "gray"
	}, {
		signed: "check-circle",
		pending: "clock",
		expired: "alert",
		missing: "x-circle",
		"not-required": "circle"
	}, { title: "SWMS status" });
}
function Js() {
	return Y({
		completed: "green",
		approved: "green",
		"in-progress": "blue",
		open: "orange",
		"not-required": "gray"
	}, {
		completed: "check-circle",
		approved: "check-circle",
		"in-progress": "clock",
		open: "alert",
		"not-required": "circle"
	}, { title: "JSA status" });
}
function Ys() {
	return Y({
		residential: "blue",
		commercial: "indigo",
		strata: "purple",
		"real-estate": "orange",
		insurance: "pink",
		builder: "gray",
		government: "green",
		"body-corp": "purple"
	}, null, { title: "Customer type" });
}
function Xs({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && e && J(r, "suburb-postcode-au", () => q(r, t, {
			title: "Locality (AU)",
			prior: n,
			fields: [
				{
					name: "suburb",
					label: "Suburb",
					type: "text",
					span: 2,
					placeholder: "Bondi"
				},
				{
					name: "state",
					label: "State",
					type: "select",
					options: rn.map((e) => ({
						value: e,
						label: e
					}))
				},
				{
					name: "postcode",
					label: "Postcode",
					type: "text",
					mono: !0,
					placeholder: "2026",
					pattern: "\\d{4}",
					maxLength: 4
				}
			],
			toEditState: (e) => {
				if (typeof e == "string") {
					let t = e.match(/^(.*?)\s+(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s+(\d{4})$/i);
					return t ? {
						suburb: t[1].trim(),
						state: t[2].toUpperCase(),
						postcode: t[3]
					} : {
						suburb: e,
						state: "",
						postcode: ""
					};
				}
				return e && typeof e == "object" ? {
					suburb: e.suburb || "",
					state: (e.state || "").toUpperCase(),
					postcode: e.postcode == null ? "" : String(e.postcode)
				} : {
					suburb: "",
					state: "",
					postcode: ""
				};
			},
			fromEditState: (e) => !e.suburb && !e.state && !e.postcode ? null : {
				suburb: e.suburb.trim(),
				state: e.state,
				postcode: e.postcode.trim()
			}
		})), M(n)) return "";
		if (typeof n == "string") return j("span", { class: "sg-renderer-suburb-postcode-au" }, document.createTextNode(n));
		let i = j("span", { class: "sg-renderer-suburb-postcode-au" });
		return n.suburb && i.append(j("span", { class: "sg-renderer-suburb-postcode-au-suburb" }, document.createTextNode(String(n.suburb).toUpperCase()))), n.state && (n.suburb && i.append(document.createTextNode(" ")), i.append(j("span", {
			class: `sg-address-au-state is-${String(n.state).toLowerCase()}`,
			title: an[String(n.state).toUpperCase()] || n.state
		}, document.createTextNode(String(n.state).toUpperCase())))), n.postcode && ((n.suburb || n.state) && i.append(document.createTextNode(" ")), i.append(j("span", { class: "sg-renderer-suburb-postcode-au-postcode sg-renderer-mono" }, document.createTextNode(String(n.postcode))))), i;
	};
}
function Zs() {
	return Y({
		metro: "blue",
		"inner-regional": "green",
		regional: "green",
		"outer-regional": "yellow",
		remote: "orange",
		"very-remote": "red"
	}, {
		metro: "dot",
		"inner-regional": "dot",
		regional: "circle",
		"outer-regional": "circle",
		remote: "half-circle",
		"very-remote": "alert"
	}, { title: "Region" });
}
function Qs({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && e && J(r, "council-lga", () => q(r, t, {
			title: "Council LGA",
			prior: n,
			fields: [{
				name: "name",
				label: "Council",
				type: "text",
				placeholder: "Waverley"
			}, {
				name: "state",
				label: "State",
				type: "select",
				options: rn.map((e) => ({
					value: e,
					label: e
				}))
			}],
			toEditState: (e) => typeof e == "string" ? {
				name: e,
				state: ""
			} : e && typeof e == "object" ? {
				name: e.name || "",
				state: (e.state || "").toUpperCase()
			} : {
				name: "",
				state: ""
			},
			fromEditState: (e) => !e.name && !e.state ? null : e.state ? {
				name: e.name.trim(),
				state: e.state
			} : e.name.trim()
		})), M(n)) return "";
		let i = typeof n == "object" ? n : { name: String(n) }, a = j("span", { class: "sg-renderer-council-lga" });
		return i.state && a.append(Ss(i.state)), i.name && a.append(j("span", { class: "sg-renderer-council-lga-name" }, document.createTextNode(String(i.name)))), a.append(j("span", { class: "sg-renderer-council-lga-suffix" }, document.createTextNode("Council"))), a;
	};
}
function $s({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && e && J(r, "lot-plan", () => q(r, t, {
			title: "Lot plan",
			prior: n,
			fields: [
				{
					name: "lot",
					label: "Lot",
					type: "text",
					placeholder: "12"
				},
				{
					name: "planType",
					label: "Plan type",
					type: "select",
					options: [
						"DP",
						"SP",
						"CP",
						"RP"
					].map((e) => ({
						value: e,
						label: e
					}))
				},
				{
					name: "plan",
					label: "Plan #",
					type: "text",
					mono: !0,
					span: 2,
					placeholder: "456789"
				}
			],
			toEditState: (e) => {
				if (!e || typeof e == "string") return {
					lot: "",
					planType: "DP",
					plan: typeof e == "string" ? e : ""
				};
				let t = e.dp ? "DP" : e.sp ? "SP" : e.planType || "DP", n = e.dp ?? e.sp ?? e.plan ?? "";
				return {
					lot: e.lot == null ? "" : String(e.lot),
					planType: t,
					plan: n == null ? "" : String(n)
				};
			},
			fromEditState: (e) => {
				if (!e.lot && !e.plan) return null;
				let t = {};
				return e.lot && (t.lot = e.lot.trim()), e.plan && (e.planType === "DP" ? t.dp = e.plan.trim() : e.planType === "SP" ? t.sp = e.plan.trim() : (t.plan = e.plan.trim(), t.planType = e.planType || "DP")), t;
			}
		})), M(n)) return "";
		if (typeof n == "string") return j("span", { class: "sg-renderer-lot-plan" }, document.createTextNode(n));
		let i = n.lot, a = n.dp ? "DP" : n.sp ? "SP" : n.planType || "DP", o = n.dp ?? n.sp ?? n.plan;
		if (i == null && o == null) return "";
		let s = j("span", { class: "sg-renderer-lot-plan" });
		return i != null && s.append(j("span", { class: "sg-renderer-lot-plan-lot" }, document.createTextNode(`Lot ${i}`))), o != null && s.append(j("span", { class: "sg-renderer-lot-plan-plan sg-renderer-mono" }, document.createTextNode(`${a} ${o}`))), s;
	};
}
function ec({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && e && J(r, "strata-plan", () => q(r, t, {
			title: "Strata plan",
			prior: n,
			fields: [{
				name: "number",
				label: "SP number",
				type: "text",
				mono: !0,
				placeholder: "12345"
			}, {
				name: "unit",
				label: "Unit (opt)",
				type: "text",
				placeholder: "14B"
			}],
			toEditState: (e) => e == null ? {
				number: "",
				unit: ""
			} : typeof e == "object" ? {
				number: e.number == null ? "" : String(e.number),
				unit: e.unit == null ? "" : String(e.unit)
			} : {
				number: String(e).replace(/[^\d]/g, ""),
				unit: ""
			},
			fromEditState: (e) => !e.number && !e.unit ? null : e.unit ? {
				number: e.number.trim(),
				unit: e.unit.trim()
			} : e.number.trim()
		})), M(n)) return "";
		let i, a = null;
		typeof n == "object" ? (i = n.number, a = n.unit) : i = n;
		let o = String(i).replace(/[^\d]/g, "");
		if (!o) return String(n);
		let s = j("span", { class: "sg-renderer-strata-plan" });
		return s.append(j("span", { class: "sg-renderer-strata-plan-prefix" }, document.createTextNode("SP"))), s.append(j("span", { class: "sg-renderer-strata-plan-number sg-renderer-mono" }, document.createTextNode(o))), a != null && a !== "" && s.append(j("span", { class: "sg-renderer-strata-plan-unit" }, document.createTextNode(`unit ${a}`))), s;
	};
}
function tc({ unit: e = "km", locale: t = "en-AU", editable: n = !0 } = {}) {
	return (r) => {
		let { value: i, td: a } = r;
		if (a && n && J(a, "odometer", () => q(a, r, {
			title: `Odometer (${e})`,
			prior: i,
			fields: [{
				name: "reading",
				label: `Reading (${e})`,
				type: "number",
				min: 0,
				step: 1,
				span: 2
			}],
			toEditState: (e) => ({ reading: e ?? "" }),
			fromEditState: (e) => e.reading == null ? null : +e.reading
		})), M(i)) return "";
		let o = Number(i);
		if (!Number.isFinite(o)) return String(i);
		let s = j("span", { class: "sg-renderer-odometer" });
		return s.append(j("span", { class: "sg-renderer-odometer-num" }, document.createTextNode(Math.round(o).toLocaleString(t)))), s.append(j("span", { class: "sg-renderer-odometer-unit" }, document.createTextNode(e))), s;
	};
}
var nc = {
	caltex: {
		bg: "#dc2626",
		fg: "#ffffff",
		short: "Caltex"
	},
	ampol: {
		bg: "#dc2626",
		fg: "#ffffff",
		short: "Ampol"
	},
	bp: {
		bg: "#15803d",
		fg: "#ffffff",
		short: "BP"
	},
	shell: {
		bg: "#facc15",
		fg: "#0f172a",
		short: "Shell"
	},
	"7-eleven": {
		bg: "#ea580c",
		fg: "#ffffff",
		short: "7-Eleven"
	},
	united: {
		bg: "#1d4ed8",
		fg: "#ffffff",
		short: "United"
	},
	liberty: {
		bg: "#1e3a8a",
		fg: "#ffffff",
		short: "Liberty"
	},
	fleetcard: {
		bg: "#475569",
		fg: "#ffffff",
		short: "Fleetcard"
	},
	motorpass: {
		bg: "#0f172a",
		fg: "#ffffff",
		short: "Motorpass"
	}
};
function rc({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && r.classList.add("sg-renderer-fuel-card-cell"), r && e && J(r, "fuel-card", () => q(r, t, {
			title: "Fuel card",
			prior: n,
			fields: [{
				name: "provider",
				label: "Provider",
				type: "select",
				options: Object.keys(nc).map((e) => ({
					value: nc[e].short,
					label: nc[e].short
				}))
			}, {
				name: "number",
				label: "Card #",
				type: "text",
				mono: !0,
				placeholder: "7081 •••• 4421"
			}],
			toEditState: (e) => typeof e == "string" ? {
				provider: "",
				number: e
			} : e && typeof e == "object" ? {
				provider: e.provider || "",
				number: e.number || ""
			} : {
				provider: "",
				number: ""
			},
			fromEditState: (e) => !e.provider && !e.number ? null : e.provider ? {
				provider: e.provider,
				number: e.number.trim()
			} : e.number.trim()
		})), M(n)) return "";
		let i = typeof n == "object" ? n : { number: String(n) }, a = j("span", { class: "sg-renderer-fuel-card" });
		if (i.provider) {
			let e = String(i.provider).toLowerCase().replace(/[^a-z0-9]+/g, ""), t = Object.keys(nc).find((t) => e.startsWith(t.replace(/-/g, ""))) || null, n = t ? nc[t] : {
				bg: "#6b7280",
				fg: "#ffffff",
				short: i.provider
			};
			a.append(j("span", {
				class: "sg-renderer-fuel-card-badge",
				style: `background:${n.bg};color:${n.fg};`
			}, document.createTextNode(n.short)));
		}
		return i.number && a.append(j("span", { class: "sg-renderer-fuel-card-number sg-renderer-mono" }, document.createTextNode(String(i.number)))), a;
	};
}
function ic({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && e && J(r, "service-due", () => q(r, t, {
			title: "Service due",
			prior: n,
			fields: [
				{
					name: "currentKm",
					label: "Current km",
					type: "number",
					min: 0,
					step: 1
				},
				{
					name: "dueKm",
					label: "Due at km",
					type: "number",
					min: 0,
					step: 1
				},
				{
					name: "dueDate",
					label: "Due by date",
					type: "date",
					span: 2
				}
			],
			toEditState: (e) => e && typeof e == "object" ? {
				currentKm: e.currentKm ?? "",
				dueKm: e.dueKm ?? "",
				dueDate: e.dueDate ? String(e.dueDate).slice(0, 10) : ""
			} : {
				currentKm: "",
				dueKm: "",
				dueDate: ""
			},
			fromEditState: (e) => {
				if (e.currentKm == null && e.dueKm == null && !e.dueDate) return null;
				let t = {};
				return e.currentKm != null && (t.currentKm = +e.currentKm), e.dueKm != null && (t.dueKm = +e.dueKm), e.dueDate && (t.dueDate = e.dueDate), t;
			}
		})), M(n)) return "";
		let i = typeof n == "object" ? n : null;
		if (!i) return "";
		let a = +i.currentKm, o = +i.dueKm, s = Number.isFinite(a) && Number.isFinite(o) ? o - a : null, c = i.dueDate ? W(i.dueDate) : null, l = s == null ? null : s < 0 ? "is-overdue" : s < 500 ? "is-soon" : s < 2e3 ? "is-warning" : "is-current", u = c == null ? null : c < 0 ? "is-overdue" : c < 14 ? "is-soon" : c < 60 ? "is-warning" : "is-current", d = j("span", { class: `sg-renderer-service-due ${[l, u].includes("is-overdue") ? "is-overdue" : [l, u].includes("is-soon") ? "is-soon" : [l, u].includes("is-warning") ? "is-warning" : "is-current"}` });
		if (s != null) {
			let e = s < 0 ? `${Math.abs(s).toLocaleString()} km over` : `${s.toLocaleString()} km left`;
			d.append(j("span", { class: "sg-renderer-service-due-km" }, document.createTextNode(e)));
		}
		if (c != null) {
			let e = c < 0 ? `${Math.abs(c)}d over` : c === 0 ? "today" : `${c}d left`;
			d.append(j("span", { class: "sg-renderer-service-due-date" }, document.createTextNode(e)));
		}
		return d;
	};
}
function ac({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && e && J(r, "rego-status", () => q(r, t, {
			title: "Rego expiry",
			prior: n,
			fields: [{
				name: "expires",
				label: "Expires",
				type: "date",
				span: 2
			}],
			toEditState: (e) => e ? typeof e == "string" ? { expires: String(e).slice(0, 10) } : { expires: e.expires ? String(e.expires).slice(0, 10) : "" } : { expires: "" },
			fromEditState: (e) => e.expires || null
		})), M(n)) return j("span", { class: "sg-pill sg-pill-gray" }, document.createTextNode("No rego"));
		let i = W((typeof n == "object" ? n : { expires: n }).expires);
		if (i == null) return "";
		let a = i < 0 ? "red" : i < 14 ? "orange" : i < 60 ? "yellow" : "green", o = i < 0 ? `Expired ${Math.abs(i)}d ago` : i === 0 ? "Expires today" : i < 60 ? `Expires in ${i}d` : `Current (${Math.round(i / 30)}mo)`;
		return j("span", { class: `sg-pill sg-pill-${a} sg-renderer-rego-status` }, document.createTextNode(o));
	};
}
function oc({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && e && J(r, "ctp-status", () => q(r, t, {
			title: "CTP expiry",
			prior: n,
			fields: [{
				name: "expires",
				label: "Expires",
				type: "date",
				span: 2
			}],
			toEditState: (e) => e ? typeof e == "string" ? { expires: String(e).slice(0, 10) } : { expires: e.expires ? String(e.expires).slice(0, 10) : "" } : { expires: "" },
			fromEditState: (e) => e.expires || null
		})), M(n)) return j("span", { class: "sg-pill sg-pill-gray" }, document.createTextNode("No CTP"));
		let i = W((typeof n == "object" ? n : { expires: n }).expires);
		if (i == null) return "";
		let a = i < 0 ? "red" : i < 14 ? "orange" : i < 60 ? "yellow" : "green", o = i < 0 ? `CTP expired ${Math.abs(i)}d ago` : i === 0 ? "CTP expires today" : i < 60 ? `CTP ${i}d left` : `CTP current (${Math.round(i / 30)}mo)`;
		return j("span", { class: `sg-pill sg-pill-${a} sg-renderer-ctp-status` }, document.createTextNode(o));
	};
}
function sc({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && e && J(r, "rego-plate", () => q(r, t, {
			title: "Rego plate",
			prior: n,
			fields: [
				{
					name: "state",
					label: "State",
					type: "select",
					options: rn.map((e) => ({
						value: e,
						label: `${e} — ${an[e]}`
					}))
				},
				{
					name: "plate",
					label: "Plate",
					type: "text",
					mono: !0,
					placeholder: "CAB 42K"
				},
				{
					name: "style",
					label: "Plate style",
					type: "plate-style",
					span: 2,
					options: Object.entries(bs).map(([e, t]) => ({
						value: e,
						label: t.label,
						swatch: t
					})),
					sampleField: "plate"
				}
			],
			toEditState: (e) => typeof e == "string" ? {
				state: "",
				plate: e,
				style: "standard"
			} : e && typeof e == "object" ? {
				state: (e.state || "").toUpperCase(),
				plate: e.plate || "",
				style: e.style || "standard"
			} : {
				state: "",
				plate: "",
				style: "standard"
			},
			fromEditState: (e) => {
				let t = e.style && e.style !== "standard";
				if (!e.state && !e.plate && !t) return null;
				if (!e.state && !t) return e.plate.trim();
				let n = {};
				return e.state && (n.state = e.state), e.plate && (n.plate = e.plate.trim()), t && (n.style = e.style), n;
			}
		})), M(n)) return "";
		let i = "", a = "", o = "";
		typeof n == "string" ? a = n : typeof n == "object" && (i = (n.state || "").toUpperCase(), a = n.plate || "", o = n.style || "");
		let s = xs(i, o), c = j("span", {
			class: "sg-renderer-rego-plate" + (s.slim ? " is-slim" : ""),
			style: `background:${s.bg};color:${s.fg};border-color:${s.border};`,
			title: i ? `${i} plate${o && o !== "standard" ? ` · ${o}` : ""}` : "Plate"
		});
		return c.append(j("span", { class: "sg-renderer-rego-plate-text" }, document.createTextNode(String(a).toUpperCase()))), c;
	};
}
function cc({ maxAvatars: e = 4, avatarSize: t = 22, editable: n = !0 } = {}) {
	return (r) => {
		let { value: i, td: a } = r;
		if (a && n && J(a, "crew", () => q(a, r, {
			title: "Crew",
			prior: i,
			fields: [
				{
					name: "name",
					label: "Crew name",
					type: "text",
					placeholder: "Crew A"
				},
				{
					name: "leader",
					label: "Leading hand",
					type: "text",
					placeholder: "Astrid Hale"
				},
				{
					name: "members",
					label: "Members (one per line, \"Name\" or \"Name, AB\")",
					type: "textarea",
					span: 2,
					rows: 3
				},
				{
					name: "trades",
					label: "Trade mix (comma-separated)",
					type: "text",
					span: 2,
					placeholder: "Electrician, Plumber"
				}
			],
			toEditState: (e) => {
				if (typeof e == "string") return {
					name: e,
					leader: "",
					members: "",
					trades: ""
				};
				if (e && typeof e == "object") {
					let t = Array.isArray(e.members) ? e.members.map((e) => e.initials ? `${e.name || ""}, ${e.initials}` : e.name || "") : [];
					return {
						name: e.name || "",
						leader: e.leader || "",
						members: t.join("\n"),
						trades: Array.isArray(e.trades) ? e.trades.join(", ") : e.trades || ""
					};
				}
				return {
					name: "",
					leader: "",
					members: "",
					trades: ""
				};
			},
			fromEditState: (e) => {
				if (!e.name && !e.leader && !e.members.trim() && !e.trades.trim()) return null;
				let t = e.members.split("\n").map((e) => e.trim()).filter(Boolean).map((e) => {
					let [t, n] = e.split(",").map((e) => e.trim());
					return n ? {
						name: t,
						initials: n
					} : { name: t };
				}), n = e.trades.split(",").map((e) => e.trim()).filter(Boolean), r = {};
				return e.name && (r.name = e.name.trim()), e.leader && (r.leader = e.leader.trim()), t.length && (r.members = t), n.length && (r.trades = n), r;
			}
		})), M(i)) return "";
		if (typeof i == "string") return j("span", { class: "sg-renderer-crew" }, document.createTextNode(i));
		let o = j("span", { class: "sg-renderer-crew" }), s = j("span", { class: "sg-renderer-crew-head" });
		if (i.name && s.append(j("span", { class: "sg-renderer-crew-name" }, document.createTextNode(String(i.name)))), i.leader && s.append(j("span", { class: "sg-renderer-crew-leader" }, document.createTextNode(`led by ${i.leader}`))), o.append(s), Array.isArray(i.members) && i.members.length) {
			let n = j("span", { class: "sg-renderer-crew-stack" }), r = i.members.slice(0, e);
			for (let e of r) {
				let r = e.initials || (e.name ? e.name.split(/\s+/).map((e) => e[0]).join("").slice(0, 2).toUpperCase() : "?"), i = j("span", {
					class: "sg-renderer-crew-avatar",
					style: `width:${t}px;height:${t}px;font-size:${Math.round(t * .45)}px;background:hsl(${ss(e.name || r) % 360},55%,55%);`,
					title: e.name || r
				});
				e.avatar ? i.append(j("img", {
					src: e.avatar,
					alt: e.name || r,
					style: `width:${t}px;height:${t}px;border-radius:50%;display:block;`
				})) : i.append(document.createTextNode(r)), n.append(i);
			}
			let a = i.members.length - r.length;
			a > 0 && n.append(j("span", {
				class: "sg-renderer-crew-avatar is-overflow",
				style: `width:${t}px;height:${t}px;font-size:${Math.round(t * .4)}px;`
			}, document.createTextNode(`+${a}`))), o.append(n);
		}
		return Array.isArray(i.trades) && i.trades.length && o.append(j("span", { class: "sg-renderer-crew-trades" }, document.createTextNode(i.trades.join(" · ")))), o;
	};
}
function lc({ editable: e = !0 } = {}) {
	let t = [
		"licence",
		"insurance",
		"swms",
		"induction"
	];
	return (n) => {
		let { value: r, td: i } = n;
		if (i && e && J(i, "subcontractor", () => q(i, n, {
			title: "Subcontractor",
			prior: r,
			fields: [
				{
					name: "name",
					label: "Name",
					type: "text",
					span: 2
				},
				{
					name: "abn",
					label: "ABN",
					type: "text",
					mono: !0,
					span: 2
				},
				{
					name: "flags",
					label: "Compliance OK",
					type: "multiselect",
					span: 2,
					options: t.map((e) => ({
						value: e,
						label: I(e)
					}))
				}
			],
			toEditState: (e) => {
				if (typeof e == "string") return {
					name: e,
					abn: "",
					flags: []
				};
				if (e && typeof e == "object") {
					let n = t.filter((t) => e[t] !== !1);
					return {
						name: e.name || "",
						abn: e.abn || "",
						flags: n
					};
				}
				return {
					name: "",
					abn: "",
					flags: []
				};
			},
			fromEditState: (e) => {
				if (!e.name && !e.abn && !e.flags.length) return null;
				let n = {};
				e.name && (n.name = e.name.trim()), e.abn && (n.abn = e.abn.trim());
				for (let r of t) n[r] = e.flags.includes(r);
				return n;
			}
		})), M(r)) return "";
		if (typeof r == "string") return j("span", { class: "sg-renderer-subcontractor" }, document.createTextNode(r));
		let a = t.filter((e) => r[e] === !1), o = a.length === 0, s = j("span", { class: "sg-renderer-subcontractor" }), c = j("span", {
			class: `sg-renderer-subcontractor-icon ${o ? "is-ok" : a.length === 1 ? "is-warn" : "is-fail"}`,
			title: o ? "All compliance flags OK" : `Missing: ${a.join(", ")}`
		}, document.createTextNode(o ? "✓" : a.length === 1 ? "⚠" : "✗"));
		return s.append(c), r.name && s.append(j("span", { class: "sg-renderer-subcontractor-name" }, document.createTextNode(String(r.name)))), o || s.append(j("span", { class: "sg-renderer-subcontractor-fail" }, document.createTextNode(`needs: ${a.join(", ")}`))), s;
	};
}
function uc({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && e && J(r, "skill-endorsement", () => q(r, t, {
			title: "Skill endorsement",
			prior: n,
			fields: [
				{
					name: "skill",
					label: "Skill",
					type: "text",
					span: 2,
					placeholder: "Solar PV install"
				},
				{
					name: "issuer",
					label: "Issuer",
					type: "text",
					placeholder: "CEC"
				},
				{
					name: "expires",
					label: "Expires",
					type: "date"
				}
			],
			toEditState: (e) => typeof e == "string" ? {
				skill: e,
				issuer: "",
				expires: ""
			} : e && typeof e == "object" ? {
				skill: e.skill || "",
				issuer: e.issuer || "",
				expires: e.expires ? String(e.expires).slice(0, 10) : ""
			} : {
				skill: "",
				issuer: "",
				expires: ""
			},
			fromEditState: (e) => {
				if (!e.skill && !e.issuer && !e.expires) return null;
				if (e.skill && !e.issuer && !e.expires) return e.skill.trim();
				let t = {};
				return e.skill && (t.skill = e.skill.trim()), e.issuer && (t.issuer = e.issuer.trim()), e.expires && (t.expires = e.expires), t;
			}
		})), M(n)) return "";
		let i = typeof n == "object" ? n : { skill: String(n) }, a = j("span", { class: "sg-renderer-skill-endorsement" });
		i.skill && a.append(j("span", { class: "sg-renderer-skill-endorsement-name" }, document.createTextNode(String(i.skill)))), i.issuer && a.append(j("span", { class: "sg-renderer-skill-endorsement-issuer" }, document.createTextNode(`(${i.issuer})`)));
		let o = ws(i.expires);
		return o && a.append(o), a;
	};
}
var dc = {
	electrician: "⚡",
	plumber: "🔧",
	carpenter: "🪚",
	tiler: "🧱",
	painter: "🎨",
	roofer: "🏠",
	glazier: "🪟",
	hvac: "❄️",
	landscaper: "🌳",
	concreter: "🧊",
	bricklayer: "🧱",
	plasterer: "🪣",
	labourer: "🦺",
	mechanic: "🔩",
	welder: "🔥",
	steel: "⚙️",
	scaffolder: "🪜",
	earthworks: "🚜",
	solar: "☀️"
};
function fc({ icons: e = dc, editable: t = !0 } = {}) {
	return (n) => {
		let { value: r, td: i } = n;
		if (i && t && J(i, "trade-type", () => Hc(i, n, {
			title: "Trade",
			options: Object.keys(e).map((t) => ({
				value: t,
				label: I(t),
				icon: e[t]
			})),
			current: r ? String(r).toLowerCase().trim() : ""
		})), M(r)) return "";
		let a = String(r).toLowerCase().trim(), o = e[a] || e[a.split(/\s+/)[0]] || null, s = j("span", { class: "sg-renderer-trade-type" });
		return o && s.append(j("span", { class: "sg-renderer-trade-type-icon" }, document.createTextNode(o))), s.append(j("span", { class: "sg-renderer-trade-type-label" }, document.createTextNode(I(r)))), s;
	};
}
function pc({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && e && J(r, "site-induction", () => q(r, t, {
			title: "Site induction",
			prior: n,
			fields: [
				{
					name: "inducted",
					label: "Inducted",
					type: "boolean",
					checkboxLabel: "Person is inducted on this site"
				},
				{
					name: "site",
					label: "Site",
					type: "text",
					span: 2
				},
				{
					name: "expires",
					label: "Expires",
					type: "date",
					span: 2
				}
			],
			toEditState: (e) => e === !0 ? {
				inducted: !0,
				site: "",
				expires: ""
			} : e === !1 || e == null ? {
				inducted: !1,
				site: "",
				expires: ""
			} : typeof e == "object" ? {
				inducted: e.inducted !== !1,
				site: e.site || "",
				expires: e.expires ? String(e.expires).slice(0, 10) : ""
			} : {
				inducted: !1,
				site: "",
				expires: ""
			},
			fromEditState: (e) => {
				if (!e.site && !e.expires) return !!e.inducted;
				let t = { inducted: !!e.inducted };
				return e.site && (t.site = e.site.trim()), e.expires && (t.expires = e.expires), t;
			}
		})), n === !1 || n == null) return j("span", { class: "sg-pill sg-pill-red sg-renderer-site-induction" }, document.createTextNode("Not inducted"));
		if (n === !0) return j("span", { class: "sg-pill sg-pill-green sg-renderer-site-induction" }, document.createTextNode("Inducted"));
		if (typeof n == "object") {
			let e = j("span", { class: "sg-renderer-site-induction-wrap" }), t = n.inducted !== !1, r = j("span", { class: `sg-pill sg-pill-${t ? "green" : "red"} sg-renderer-site-induction` }, document.createTextNode(t ? "Inducted" : "Not inducted"));
			if (n.site && r.append(j("span", { class: "sg-renderer-site-induction-site" }, document.createTextNode(n.site))), e.append(r), t) {
				let t = ws(n.expires);
				t && e.append(t);
			}
			return e;
		}
		return String(n);
	};
}
function mc({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && e && J(r, "hazard-rating", () => q(r, t, {
			title: "Hazard rating",
			prior: n,
			fields: [{
				name: "likelihood",
				label: "Likelihood (1-5)",
				type: "number",
				min: 1,
				max: 5,
				step: 1
			}, {
				name: "consequence",
				label: "Consequence (1-5)",
				type: "number",
				min: 1,
				max: 5,
				step: 1
			}],
			toEditState: (e) => typeof e == "number" ? {
				likelihood: "",
				consequence: ""
			} : e && typeof e == "object" ? {
				likelihood: e.likelihood ?? "",
				consequence: e.consequence ?? ""
			} : {
				likelihood: "",
				consequence: ""
			},
			fromEditState: (e) => e.likelihood == null && e.consequence == null ? null : {
				likelihood: +e.likelihood || 1,
				consequence: +e.consequence || 1
			}
		})), M(n)) return "";
		let i = null, a = null, o = null;
		if (typeof n == "number" ? i = n : typeof n == "object" && (n.likelihood != null && n.consequence != null ? (a = +n.likelihood, o = +n.consequence, i = a * o) : n.score != null && (i = +n.score)), !Number.isFinite(i)) return "";
		i = Math.max(1, Math.min(25, i));
		let s = i <= 3 ? "low" : i <= 8 ? "moderate" : i <= 14 ? "high" : "extreme", c = j("span", {
			class: `sg-renderer-hazard-rating is-${s}`,
			title: a && o ? `Likelihood ${a} × Consequence ${o} = ${i} (${s})` : `Risk score ${i} (${s})`
		});
		return c.append(j("span", { class: "sg-renderer-hazard-rating-score" }, document.createTextNode(String(i)))), c.append(j("span", { class: "sg-renderer-hazard-rating-band" }, document.createTextNode(I(s)))), c;
	};
}
function hc() {
	return Y({
		"near-miss": "gray",
		"first-aid": "yellow",
		mti: "orange",
		lti: "red",
		notifiable: "red",
		fatality: "red"
	}, {
		"near-miss": "circle",
		"first-aid": "check-circle",
		mti: "alert",
		lti: "alert",
		notifiable: "alert",
		fatality: "x-circle"
	}, { title: "Incident severity" });
}
var gc = {
	"hard-hat": "⛑",
	helmet: "⛑",
	"hi-vis": "🦺",
	vest: "🦺",
	gloves: "🧤",
	boots: "🥾",
	goggles: "🥽",
	glasses: "🥽",
	"eye-pro": "🥽",
	mask: "😷",
	respirator: "😷",
	hearing: "🎧",
	"ear-pro": "🎧",
	harness: "🪢"
};
function _c({ icons: e = gc, editable: t = !0 } = {}) {
	let n = (() => {
		let t = /* @__PURE__ */ new Set(), n = [];
		for (let r of Object.keys(e)) {
			let i = e[r];
			t.has(i) || (t.add(i), n.push(r));
		}
		return n;
	})();
	return (r) => {
		let { value: i, td: a } = r;
		if (a && t && J(a, "ppe-checklist", () => q(a, r, {
			title: "PPE checklist",
			prior: i,
			fields: [{
				name: "items",
				label: "Required items",
				type: "multiselect",
				span: 2,
				options: n.map((t) => ({
					value: t,
					label: `${e[t]} ${I(t.replace("-", " "))}`
				}))
			}],
			toEditState: (e) => Array.isArray(e) ? { items: e.map((e) => String(e).toLowerCase()) } : typeof e == "string" ? { items: e.split(/\s*,\s*/).filter(Boolean).map((e) => e.toLowerCase()) } : { items: [] },
			fromEditState: (e) => e.items && e.items.length ? e.items : null
		})), M(i)) return "";
		let o = Array.isArray(i) ? i : typeof i == "string" ? i.split(/\s*,\s*/).filter(Boolean) : [];
		if (!o.length) return "";
		let s = j("span", { class: "sg-renderer-ppe-checklist" });
		for (let t of o) {
			let n = String(t).toLowerCase().trim(), r = e[n] || t;
			s.append(j("span", {
				class: "sg-renderer-ppe-item",
				title: I(n.replace("-", " "))
			}, document.createTextNode(String(r))));
		}
		return s;
	};
}
function vc({ dueDays: e = 7, editable: t = !0 } = {}) {
	let n = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	];
	return (r) => {
		let { value: i, td: a } = r;
		if (a && t && J(a, "toolbox-talk", () => q(a, r, {
			title: "Toolbox talk",
			prior: i,
			fields: [{
				name: "lastDate",
				label: "Last date",
				type: "date",
				span: 2
			}, {
				name: "topic",
				label: "Topic",
				type: "text",
				span: 2,
				placeholder: "Working at heights"
			}],
			toEditState: (e) => e ? typeof e == "string" ? {
				lastDate: String(e).slice(0, 10),
				topic: ""
			} : {
				lastDate: e.lastDate ? String(e.lastDate).slice(0, 10) : "",
				topic: e.topic || ""
			} : {
				lastDate: "",
				topic: ""
			},
			fromEditState: (e) => !e.lastDate && !e.topic ? null : e.lastDate && !e.topic ? e.lastDate : {
				lastDate: e.lastDate,
				topic: e.topic.trim()
			}
		})), M(i)) return j("span", { class: "sg-renderer-toolbox-talk is-missing" }, document.createTextNode("no record"));
		let o = typeof i == "object" ? i : { lastDate: i }, s = o.lastDate ? new Date(o.lastDate) : null;
		if (!s || Number.isNaN(s.valueOf())) return "";
		let c = Math.max(0, -W(s)), l = c > e * 2 ? "is-late" : c > e ? "is-overdue" : "is-current", u = `${s.getDate()} ${n[s.getMonth()]}`, d = c === 0 ? "today" : c === 1 ? "yesterday" : `${c}d ago`, f = j("span", { class: `sg-renderer-toolbox-talk ${l}` });
		return f.append(j("span", { class: "sg-renderer-toolbox-talk-last" }, document.createTextNode(`Last: ${u}`))), f.append(j("span", { class: "sg-renderer-toolbox-talk-ago" }, document.createTextNode(`(${d})`))), o.topic && f.append(j("span", { class: "sg-renderer-toolbox-talk-topic" }, document.createTextNode(String(o.topic)))), f;
	};
}
function yc({ editable: e = !0 } = {}) {
	let t = {
		"in-stock": "green",
		backorder: "orange",
		"out-of-stock": "red",
		"special-order": "blue"
	};
	return (n) => {
		let { value: r, td: i } = n;
		if (i && e && J(i, "materials-pick", () => q(i, n, {
			title: "Materials",
			prior: r,
			fields: [
				{
					name: "qty",
					label: "Qty",
					type: "number",
					min: 0,
					step: 1
				},
				{
					name: "sku",
					label: "SKU",
					type: "text",
					mono: !0
				},
				{
					name: "name",
					label: "Name",
					type: "text",
					span: 2
				},
				{
					name: "status",
					label: "Stock",
					type: "select",
					span: 2,
					options: Object.keys(t).map((e) => ({
						value: e,
						label: I(e.replace("-", " "))
					}))
				}
			],
			toEditState: (e) => typeof e == "string" ? {
				qty: "",
				sku: "",
				name: e,
				status: ""
			} : e && typeof e == "object" ? {
				qty: e.qty == null ? "" : e.qty,
				sku: e.sku || "",
				name: e.name || "",
				status: e.status || ""
			} : {
				qty: "",
				sku: "",
				name: "",
				status: ""
			},
			fromEditState: (e) => {
				if (!e.name && e.qty == null && !e.sku && !e.status) return null;
				let t = {};
				return e.qty != null && (t.qty = +e.qty), e.sku && (t.sku = e.sku.trim()), e.name && (t.name = e.name.trim()), e.status && (t.status = e.status), t;
			}
		})), M(r)) return "";
		let a = typeof r == "object" ? r : { name: String(r) }, o = j("span", {
			class: "sg-renderer-materials-pick",
			title: a.sku || ""
		});
		if (a.qty != null && o.append(j("span", { class: "sg-renderer-materials-pick-qty" }, document.createTextNode(`×${a.qty}`))), a.name && o.append(j("span", { class: "sg-renderer-materials-pick-name" }, document.createTextNode(String(a.name)))), a.status) {
			let e = String(a.status).toLowerCase(), n = t[e] || "gray";
			o.append(j("span", { class: `sg-pill sg-pill-${n} sg-renderer-materials-pick-stock` }, document.createTextNode(I(e.replace("-", " ")))));
		}
		return o;
	};
}
function bc({ currency: e = "AUD", locale: t = "en-AU", editable: n = !0 } = {}) {
	return (r) => {
		let { value: i, td: a } = r;
		if (a && n && J(a, "retention", () => q(a, r, {
			title: "Retention",
			prior: i,
			fields: [{
				name: "amount",
				label: "Amount",
				type: "number",
				step: .01,
				min: 0
			}, {
				name: "releaseDate",
				label: "Release date",
				type: "date"
			}],
			toEditState: (e) => typeof e == "number" ? {
				amount: e,
				releaseDate: ""
			} : e && typeof e == "object" ? {
				amount: e.amount == null ? "" : e.amount,
				releaseDate: e.releaseDate ? String(e.releaseDate).slice(0, 10) : ""
			} : {
				amount: "",
				releaseDate: ""
			},
			fromEditState: (e) => {
				if (e.amount == null && !e.releaseDate) return null;
				let t = {};
				return e.amount != null && (t.amount = +e.amount), e.releaseDate && (t.releaseDate = e.releaseDate), t;
			}
		})), M(i)) return "";
		let o = typeof i == "object" ? i : { amount: Number(i) }, s = +o.amount;
		if (!Number.isFinite(s)) return "";
		let c = j("span", { class: "sg-renderer-retention" });
		if (c.append(j("span", { class: "sg-renderer-retention-amount" }, document.createTextNode(s.toLocaleString(t, {
			style: "currency",
			currency: e
		})))), o.releaseDate) {
			let e = W(o.releaseDate);
			if (e != null) {
				let t = e < 0 ? "is-released" : e < 30 ? "is-soon" : "is-pending", n = e < 0 ? "released" : e === 0 ? "releases today" : e < 60 ? `releases in ${e}d` : `releases in ${Math.round(e / 30)}mo`;
				c.append(j("span", { class: `sg-renderer-retention-release ${t}` }, document.createTextNode(n)));
			}
		}
		return c;
	};
}
function xc() {
	return Y({
		draft: "gray",
		sent: "blue",
		viewed: "indigo",
		paid: "green",
		overdue: "red",
		disputed: "orange",
		void: "gray",
		"written-off": "gray"
	}, {
		draft: "circle",
		sent: "cart",
		viewed: "check",
		paid: "check-circle",
		overdue: "alert",
		disputed: "alert",
		void: "x-circle",
		"written-off": "x-circle"
	}, { title: "Invoice status" });
}
var Sc = [
	"COD",
	"Prepaid",
	"Net 7",
	"Net 14",
	"Net 30",
	"Net 45",
	"Net 60",
	"EOM"
];
function Cc({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && (r.classList.add("sg-renderer-payment-terms-cell"), r._sgPaymentTerms = n, e && !r._sgPaymentTermsBound && (r._sgPaymentTermsBound = !0, r.addEventListener("dblclick", (e) => {
			e._sgPaymentTermsHandled || (e._sgPaymentTermsHandled = !0, e.stopPropagation(), Ec(r, t));
		}))), M(n)) return "";
		let i, a = null;
		typeof n == "object" ? (i = n.terms || "", a = n.dueDate || null) : i = String(n);
		let o = String(i).toLowerCase().replace(/\s+/g, " ").trim(), s = a ? Date.now() > new Date(a).getTime() : !1, c = "gray";
		if (s) c = "red";
		else if (o === "cod" || o === "prepaid") c = "green";
		else if (/^net\s+(\d+)$/.test(o)) {
			let e = parseInt(o.split(" ")[1], 10);
			c = e <= 7 ? "blue" : e <= 14 ? "indigo" : e <= 30 ? "orange" : "gray";
		} else o === "eom" && (c = "orange");
		let l = o === "eom" ? "EOM" : o === "cod" ? "COD" : I(i), u = j("span", { class: `sg-pill sg-pill-${c} sg-renderer-payment-terms` }, document.createTextNode(l));
		return s && u.append(j("span", { class: "sg-renderer-payment-terms-overdue" }, document.createTextNode("overdue"))), u;
	};
}
var wc = null;
function Tc() {
	if (!wc) return;
	let { pop: e, onKey: t, onDocClick: n } = wc;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), wc = null;
}
function Ec(e, t) {
	Tc();
	let n = e._sgPaymentTerms, r = n && typeof n == "object", i = r ? n.terms || "" : typeof n == "string" ? n : "", a = r && n.dueDate || "", o = j("div", {
		class: "sg-licence-editor",
		role: "dialog"
	});
	o.addEventListener("mousedown", (e) => e.stopPropagation()), o.append(j("div", { class: "sg-licence-editor-header" }, document.createTextNode("Payment terms")));
	let s = j("form", {
		class: "sg-licence-editor-form",
		novalidate: "novalidate"
	}), c = j("div", { class: "sg-licence-editor-grid" }), l = j("label", {
		class: "sg-licence-editor-field",
		"data-field": "terms"
	});
	l.append(j("span", { class: "sg-licence-editor-label" }, document.createTextNode("Terms")));
	let u = j("select", { class: "sg-licence-editor-input" });
	for (let e of Sc) {
		let t = e.toLowerCase().trim(), n = String(i).toLowerCase().trim();
		u.append(j("option", {
			value: e,
			selected: n === t ? "" : null
		}, document.createTextNode(e)));
	}
	l.append(u);
	let d = j("label", {
		class: "sg-licence-editor-field",
		"data-field": "dueDate"
	});
	d.append(j("span", { class: "sg-licence-editor-label" }, document.createTextNode("Due date")));
	let f = j("input", {
		type: "date",
		class: "sg-licence-editor-input",
		value: a ? String(a).slice(0, 10) : ""
	});
	d.append(f), c.append(l, d);
	let p = j("div", { class: "sg-licence-editor-footer" }), m = j("button", {
		type: "button",
		class: "sg-licence-editor-cancel"
	}, document.createTextNode("Cancel")), h = j("button", {
		type: "submit",
		class: "sg-licence-editor-save"
	}, document.createTextNode("Save"));
	p.append(m, h), s.append(c, p), o.append(s);
	function g() {
		let r = u.value, i = f.value || null;
		Dc(e, t, (typeof n == "string" || n == null) && !i ? r : {
			terms: r,
			dueDate: i
		}), Tc();
	}
	s.addEventListener("submit", (e) => {
		e.preventDefault(), g();
	}), m.addEventListener("click", () => Tc());
	function _(e) {
		e.key === "Escape" && (e.stopPropagation(), Tc());
	}
	function v(t) {
		!o.contains(t.target) && !e.contains(t.target) && Tc();
	}
	document.addEventListener("keydown", _), setTimeout(() => document.addEventListener("mousedown", v), 0), document.body.appendChild(o), F(o, e), u.focus(), wc = {
		pop: o,
		onKey: _,
		onDocClick: v
	};
}
function Dc(e, t, n) {
	let { row: r, col: i, api: a } = t, o = r && i?.field != null ? r[i.field] : null;
	r && i?.field != null && (r[i.field] = n), e._sgPaymentTerms = n, a?.applyTransaction && a.applyTransaction({ update: [r] });
	let s = e.closest("[data-controller~=\"grid\"]");
	s && s.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
		bubbles: !0,
		detail: {
			rowId: r?.id ?? r?._sg_id,
			colId: i?.field,
			oldValue: o,
			newValue: n
		}
	}));
}
function Oc({ currency: e = "AUD", locale: t = "en-AU", editable: n = !0 } = {}) {
	let r = {
		charged: "orange",
		waived: "gray",
		included: "green"
	};
	return (i) => {
		let { value: a, td: o } = i;
		if (o && n && J(o, "callout-fee", () => q(o, i, {
			title: "Callout fee",
			prior: a,
			fields: [{
				name: "amount",
				label: "Amount",
				type: "number",
				step: .01,
				min: 0
			}, {
				name: "status",
				label: "Status",
				type: "select",
				options: Object.keys(r).map((e) => ({
					value: e,
					label: I(e)
				}))
			}],
			toEditState: (e) => typeof e == "number" ? {
				amount: e,
				status: "charged"
			} : typeof e == "string" ? {
				amount: "",
				status: e
			} : e && typeof e == "object" ? {
				amount: e.amount == null ? "" : e.amount,
				status: e.status || ""
			} : {
				amount: "",
				status: ""
			},
			fromEditState: (e) => e.amount == null && !e.status ? null : e.amount != null && e.status === "charged" ? e.amount : e.amount == null && e.status ? e.status : {
				amount: +e.amount,
				status: e.status || "charged"
			}
		})), M(a)) return "";
		let s = null, c = null;
		typeof a == "number" ? (s = a, c = "charged") : typeof a == "string" ? c = a.toLowerCase() : typeof a == "object" && (s = +a.amount, c = (a.status || (s ? "charged" : null) || "").toLowerCase());
		let l = j("span", { class: `sg-pill sg-pill-${r[c] || "gray"} sg-renderer-callout-fee` });
		return s != null && Number.isFinite(s) && l.append(j("span", { class: "sg-renderer-callout-fee-amount" }, document.createTextNode(s.toLocaleString(t, {
			style: "currency",
			currency: e
		})))), l.append(j("span", { class: "sg-renderer-callout-fee-label" }, document.createTextNode(c ? I(c) : "Callout"))), l;
	};
}
function kc({ width: e = 60, height: t = 60, editable: n = !0 } = {}) {
	let r = {
		before: "gray",
		during: "blue",
		after: "green"
	};
	return (i) => {
		let { value: a, td: o } = i;
		if (o && n && J(o, "job-photo", () => q(o, i, {
			title: "Job photo",
			prior: a,
			fields: [
				{
					name: "url",
					label: "Photo URL",
					type: "url",
					span: 2,
					placeholder: "https://…/photo.jpg"
				},
				{
					name: "stage",
					label: "Stage",
					type: "select",
					options: Object.keys(r).map((e) => ({
						value: e,
						label: I(e)
					}))
				},
				{
					name: "caption",
					label: "Caption",
					type: "text"
				}
			],
			toEditState: (e) => typeof e == "string" ? {
				url: e,
				stage: "",
				caption: ""
			} : e && typeof e == "object" ? {
				url: e.url || "",
				stage: e.stage || "",
				caption: e.caption || ""
			} : {
				url: "",
				stage: "",
				caption: ""
			},
			fromEditState: (e) => {
				if (!e.url) return null;
				let t = { url: e.url.trim() };
				return e.stage && (t.stage = e.stage), e.caption && (t.caption = e.caption.trim()), t;
			}
		})), M(a)) return "";
		let s = typeof a == "string" ? { url: a } : a;
		if (!s.url) return "";
		let c = j("span", { class: "sg-renderer-job-photo" }), l = j("a", {
			class: "sg-renderer-job-photo-link",
			href: s.url,
			target: "_blank",
			rel: "noopener noreferrer",
			title: s.caption || s.stage || "Open photo"
		});
		if (l.append(j("img", {
			class: "sg-renderer-job-photo-img",
			src: s.url,
			width: e,
			height: t,
			alt: s.caption || s.stage || "Job photo"
		})), s.stage) {
			let e = r[String(s.stage).toLowerCase()] || "gray";
			l.append(j("span", { class: `sg-renderer-job-photo-badge sg-pill sg-pill-${e}` }, document.createTextNode(I(s.stage))));
		}
		return c.append(l), c;
	};
}
function Ac({ width: e = 80, height: t = 32, editable: n = !0 } = {}) {
	return (r) => {
		let { value: i, td: a } = r;
		if (a && (a.classList.add("sg-renderer-signature-cell"), a._sgSignature = i, n && !a._sgSignatureEditBound && (a._sgSignatureEditBound = !0, a.addEventListener("dblclick", (e) => {
			e._sgSignatureHandled || (e._sgSignatureHandled = !0, e.stopPropagation(), Mc(a, r));
		}))), M(i)) return j("span", { class: "sg-renderer-signature is-empty" }, document.createTextNode(n ? "dbl-click to sign" : "— unsigned —"));
		let o = typeof i == "string" ? { url: i } : i;
		if (!o.url) return "";
		let s = j("span", { class: "sg-renderer-signature" }), c = j("a", {
			class: "sg-renderer-signature-link",
			href: o.url,
			target: "_blank",
			rel: "noopener noreferrer",
			title: "Open signature"
		});
		if (c.append(j("img", {
			class: "sg-renderer-signature-img",
			src: o.url,
			width: e,
			height: t,
			alt: o.signedBy ? `Signed by ${o.signedBy}` : "Signature"
		})), s.append(c), o.signedBy || o.signedAt) {
			let e = j("span", { class: "sg-renderer-signature-meta" });
			if (o.signedBy && e.append(j("span", { class: "sg-renderer-signature-by" }, document.createTextNode(String(o.signedBy)))), o.signedAt) {
				let t = new Date(o.signedAt), n = Number.isNaN(t.valueOf()) ? String(o.signedAt) : `${t.getDate()}/${t.getMonth() + 1}/${String(t.getFullYear()).slice(-2)}`;
				e.append(j("span", { class: "sg-renderer-signature-when" }, document.createTextNode(n)));
			}
			s.append(e);
		}
		return s;
	};
}
var jc = null;
function K() {
	if (!jc) return;
	let { pop: e, onKey: t, onDocClick: n } = jc;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), jc = null;
}
function Mc(e, t) {
	K();
	let n = e._sgSignature, r = n && typeof n == "object", i = r && n.signedBy || "", a = j("div", {
		class: "sg-signature-editor",
		role: "dialog"
	});
	a.addEventListener("mousedown", (e) => e.stopPropagation());
	let o = j("div", { class: "sg-signature-editor-header" }, document.createTextNode("Sign here")), s = Math.min(window.devicePixelRatio || 1, 2), c = j("canvas", {
		class: "sg-signature-editor-canvas",
		width: 380 * s,
		height: 140 * s,
		style: "width:380px;height:140px;"
	}), l = c.getContext("2d");
	l.scale(s, s), l.lineWidth = 2, l.lineCap = "round", l.lineJoin = "round", l.strokeStyle = "#111827";
	let u = !1, d = 0, f = 0, p = !1;
	function m(e) {
		let t = c.getBoundingClientRect(), n = e.touches ? e.touches[0] : e;
		return [n.clientX - t.left, n.clientY - t.top];
	}
	function h(e) {
		e.preventDefault(), u = !0, [d, f] = m(e);
	}
	function g(e) {
		if (!u) return;
		e.preventDefault();
		let [t, n] = m(e);
		l.beginPath(), l.moveTo(d, f), l.lineTo(t, n), l.stroke(), d = t, f = n, p = !0;
	}
	function _() {
		u = !1;
	}
	c.addEventListener("mousedown", h), c.addEventListener("mousemove", g), window.addEventListener("mouseup", _), c.addEventListener("touchstart", h, { passive: !1 }), c.addEventListener("touchmove", g, { passive: !1 }), c.addEventListener("touchend", _);
	let v = j("label", { class: "sg-signature-editor-by" });
	v.append(j("span", { class: "sg-signature-editor-by-label" }, document.createTextNode("Signed by")));
	let y = j("input", {
		type: "text",
		value: i,
		placeholder: "Customer name",
		class: "sg-signature-editor-by-input"
	});
	v.append(y);
	let b = j("div", { class: "sg-signature-editor-footer" }), x = j("button", {
		type: "button",
		class: "sg-signature-editor-clear"
	}, document.createTextNode("Clear")), S = j("button", {
		type: "button",
		class: "sg-signature-editor-cancel"
	}, document.createTextNode("Cancel")), C = j("button", {
		type: "button",
		class: "sg-signature-editor-save"
	}, document.createTextNode("Save"));
	b.append(x, S, C), a.append(o, c, v, b), x.addEventListener("click", () => {
		l.clearRect(0, 0, 380, 140), p = !1;
	}), S.addEventListener("click", () => K());
	function w() {
		if (!p) {
			Pc(e, t, null), K();
			return;
		}
		let i = Nc(c, s).toDataURL("image/png"), a = y.value.trim() || r && n.signedBy || "";
		Pc(e, t, (typeof n == "string" || n == null) && !a ? i : {
			url: i,
			signedBy: a || null,
			signedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
		}), K();
	}
	C.addEventListener("click", w);
	function T(e) {
		e.key === "Escape" && (e.stopPropagation(), K()), e.key === "Enter" && (e.metaKey || e.ctrlKey) && (e.preventDefault(), w());
	}
	function ee(t) {
		!a.contains(t.target) && !e.contains(t.target) && K();
	}
	document.addEventListener("keydown", T), setTimeout(() => document.addEventListener("mousedown", ee), 0), document.body.appendChild(a), F(a, e), jc = {
		pop: a,
		onKey: T,
		onDocClick: ee
	};
}
function Nc(e, t) {
	let n = e.width, r = e.height, i = e.getContext("2d").getImageData(0, 0, n, r).data, a = n, o = r, s = 0, c = 0;
	for (let e = 0; e < r; e++) for (let t = 0; t < n; t++) i[(e * n + t) * 4 + 3] > 0 && (t < a && (a = t), t > s && (s = t), e < o && (o = e), e > c && (c = e));
	if (s < a) return e;
	let l = 4 * t;
	a = Math.max(0, a - l), o = Math.max(0, o - l), s = Math.min(n - 1, s + l), c = Math.min(r - 1, c + l);
	let u = s - a + 1, d = c - o + 1, f = document.createElement("canvas");
	return f.width = u, f.height = d, f.getContext("2d").drawImage(e, a, o, u, d, 0, 0, u, d), f;
}
function Pc(e, t, n) {
	let { row: r, col: i, api: a } = t, o = r && i?.field != null ? r[i.field] : null;
	r && i?.field != null && (r[i.field] = n), e._sgSignature = n, a?.applyTransaction && a.applyTransaction({ update: [r] });
	let s = e.closest("[data-controller~=\"grid\"]");
	s && s.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
		bubbles: !0,
		detail: {
			rowId: r?.id ?? r?._sg_id,
			colId: i?.field,
			oldValue: o,
			newValue: n
		}
	}));
}
var Fc = null;
function Ic() {
	if (!Fc) return;
	let { pop: e, onKey: t, onDocClick: n } = Fc;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), Fc = null;
}
function q(e, t, n) {
	Ic();
	let { title: r = "Edit", fields: i, toEditState: a, fromEditState: o, prior: s } = n, c = a ? a(s) : s && typeof s == "object" ? { ...s } : {}, l = j("div", {
		class: "sg-licence-editor",
		role: "dialog"
	});
	l.addEventListener("mousedown", (e) => e.stopPropagation()), l.append(j("div", { class: "sg-licence-editor-header" }, document.createTextNode(r)));
	let u = j("form", {
		class: "sg-licence-editor-form",
		novalidate: "novalidate"
	}), d = j("div", { class: "sg-licence-editor-grid" }), f = {};
	for (let e of i) {
		let t = j("label", {
			class: "sg-licence-editor-field",
			"data-field": e.name
		});
		e.span && t.setAttribute("data-span", String(e.span)), e.span === 2 && (t.style.gridColumn = "1 / -1"), t.append(j("span", { class: "sg-licence-editor-label" }, document.createTextNode(e.label)));
		let n = Lc(e, c[e.name]);
		f[e.name] = n, t.append(n), d.append(t);
	}
	let p = j("div", { class: "sg-licence-editor-footer" }), m = j("button", {
		type: "button",
		class: "sg-licence-editor-cancel"
	}, document.createTextNode("Cancel")), h = j("button", {
		type: "submit",
		class: "sg-licence-editor-save"
	}, document.createTextNode("Save"));
	p.append(m, h), u.append(d, p), l.append(u);
	function g() {
		let n = {};
		for (let e of i) n[e.name] = Rc(e, f[e.name]);
		zc(e, t, o ? o(n) : n), Ic();
	}
	u.addEventListener("submit", (e) => {
		e.preventDefault(), g();
	}), m.addEventListener("click", () => Ic());
	function _(e) {
		e.key === "Escape" && (e.stopPropagation(), Ic());
	}
	function v(t) {
		!l.contains(t.target) && !e.contains(t.target) && Ic();
	}
	document.addEventListener("keydown", _), setTimeout(() => document.addEventListener("mousedown", v), 0), document.body.appendChild(l), F(l, e);
	for (let e of i) {
		let t = f[e.name];
		if (t && typeof t.focus == "function") {
			t.focus(), typeof t.select == "function" && t.select();
			break;
		}
	}
	Fc = {
		pop: l,
		onKey: _,
		onDocClick: v
	};
}
function Lc(e, t) {
	let n = "sg-licence-editor-input" + (e.mono ? " sg-renderer-mono" : "");
	if (e.type === "select") {
		let r = j("select", {
			name: e.name,
			class: n
		});
		e.allowEmpty !== !1 && r.append(j("option", { value: "" }, document.createTextNode(e.emptyLabel || "—")));
		let i = t == null ? "" : String(t);
		for (let t of e.options || []) {
			let e = t && typeof t == "object" ? t : {
				value: t,
				label: t
			};
			r.append(j("option", {
				value: String(e.value),
				selected: i === String(e.value) ? "" : null
			}, document.createTextNode(e.label)));
		}
		return r;
	}
	if (e.type === "multiselect") {
		let n = j("div", { class: "sg-composite-editor-multiselect" }), r = Array.isArray(t) ? t.map((e) => String(e).toLowerCase()) : [];
		for (let t of e.options || []) {
			let e = t && typeof t == "object" ? t : {
				value: t,
				label: t
			}, i = r.includes(String(e.value).toLowerCase()), a = j("input", {
				type: "checkbox",
				value: String(e.value),
				checked: i ? "" : null
			}), o = j("label", { class: "sg-composite-editor-multiselect-item" });
			o.append(a, j("span", {}, document.createTextNode(e.label))), n.append(o);
		}
		return n;
	}
	if (e.type === "boolean") {
		let n = j("div", { class: "sg-composite-editor-bool-wrap" }), r = j("input", {
			type: "checkbox",
			class: "sg-composite-editor-bool",
			name: e.name,
			checked: t ? "" : null
		});
		return n.append(r), e.checkboxLabel && n.append(j("span", { class: "sg-composite-editor-bool-label" }, document.createTextNode(e.checkboxLabel))), n;
	}
	if (e.type === "plate-style") {
		let n = j("div", {
			class: "sg-plate-style-picker",
			"data-name": e.name
		});
		n.dataset.value = t == null ? "" : String(t);
		for (let t of e.options || []) {
			let e = t && typeof t == "object" ? t : {
				value: t,
				label: t
			}, r = e.swatch || {}, i = j("button", {
				type: "button",
				class: "sg-plate-style-swatch" + (String(n.dataset.value) === String(e.value) ? " is-current" : ""),
				title: e.label
			});
			i.dataset.value = String(e.value);
			let a = r.bg ? `background:${r.bg};color:${r.fg};border-color:${r.border};` : "background:repeating-linear-gradient(45deg,#f3f4f6 0 6px,#e5e7eb 6px 12px);color:#1f2937;border-color:#9ca3af;";
			i.append(j("span", {
				class: "sg-plate-style-swatch-preview" + (r.slim ? " is-slim" : ""),
				style: a
			}, document.createTextNode("AB · 12"))), i.append(j("span", { class: "sg-plate-style-swatch-label" }, document.createTextNode(e.label))), i.addEventListener("click", () => {
				for (let e of n.querySelectorAll(".sg-plate-style-swatch")) e.classList.remove("is-current");
				i.classList.add("is-current"), n.dataset.value = i.dataset.value;
			}), n.append(i);
		}
		return n;
	}
	if (e.type === "textarea") {
		let r = j("textarea", {
			name: e.name,
			class: n,
			rows: String(e.rows || 2),
			placeholder: e.placeholder || ""
		});
		return t != null && (r.value = String(t)), r;
	}
	let r = {
		type: e.type === "number" ? "number" : e.type === "date" ? "date" : e.type === "datetime" ? "datetime-local" : e.type === "time" ? "time" : e.type === "url" ? "url" : "text",
		name: e.name,
		class: n,
		placeholder: e.placeholder || ""
	};
	e.min != null && (r.min = String(e.min)), e.max != null && (r.max = String(e.max)), e.step != null && (r.step = String(e.step)), e.pattern && (r.pattern = String(e.pattern)), e.maxLength != null && (r.maxlength = String(e.maxLength));
	let i = j("input", r);
	return t != null && t !== "" && (i.value = String(t)), i;
}
function Rc(e, t) {
	if (e.type === "select") return t.value || "";
	if (e.type === "multiselect") return Array.from(t.querySelectorAll("input[type=checkbox]:checked")).map((e) => e.value);
	if (e.type === "boolean") return !!t.querySelector?.("input[type=checkbox]")?.checked || !!t.checked;
	if (e.type === "textarea") return t.value;
	if (e.type === "plate-style") return t.dataset.value || "";
	if (e.type === "number") {
		let e = t.value.trim();
		if (e === "") return null;
		let n = +e;
		return Number.isFinite(n) ? n : null;
	}
	return t.value;
}
function zc(e, t, n) {
	let { row: r, col: i, api: a } = t, o = r && i?.field != null ? r[i.field] : null;
	r && i?.field != null && (r[i.field] = n), a?.applyTransaction && a.applyTransaction({ update: [r] });
	let s = e.closest("[data-controller~=\"grid\"]");
	s && s.dispatchEvent(new CustomEvent("grid:cellValueChanged", {
		bubbles: !0,
		detail: {
			rowId: r?.id ?? r?._sg_id,
			colId: i?.field,
			oldValue: o,
			newValue: n
		}
	}));
}
var Bc = null;
function Vc() {
	if (!Bc) return;
	let { pop: e, onKey: t, onDocClick: n } = Bc;
	document.removeEventListener("keydown", t), document.removeEventListener("mousedown", n), e.remove(), Bc = null;
}
function Hc(e, t, n) {
	Vc();
	let { title: r = "", options: i, current: a, allowEmpty: o = !0, emptyLabel: s = "— clear —" } = n, c = a == null ? "" : String(a), l = j("div", {
		class: "sg-select-editor",
		role: "listbox"
	});
	l.addEventListener("mousedown", (e) => e.stopPropagation()), r && l.append(j("div", { class: "sg-select-editor-header" }, document.createTextNode(r)));
	let u = j("div", { class: "sg-select-editor-list" });
	function d(n) {
		zc(e, t, n === "" ? null : n), Vc();
	}
	if (o) {
		let e = j("button", {
			type: "button",
			class: "sg-select-editor-item is-empty" + (c === "" ? " is-current" : "")
		}, document.createTextNode(s));
		e.addEventListener("click", () => d("")), u.append(e);
	}
	for (let e of i) {
		let t = e && typeof e == "object" ? e : {
			value: e,
			label: e
		}, n = j("button", {
			type: "button",
			class: "sg-select-editor-item" + (c === String(t.value) ? " is-current" : "")
		});
		t.dot && n.append(j("span", {
			class: "sg-select-editor-dot",
			style: `background:${t.dot};`
		})), t.icon && n.append(j("span", { class: "sg-select-editor-icon" }, document.createTextNode(t.icon))), n.append(j("span", { class: "sg-select-editor-label" }, document.createTextNode(t.label))), n.addEventListener("click", () => d(String(t.value))), u.append(n);
	}
	l.append(u);
	function f(e) {
		e.key === "Escape" && (e.stopPropagation(), Vc());
	}
	function p(t) {
		!l.contains(t.target) && !e.contains(t.target) && Vc();
	}
	document.addEventListener("keydown", f), setTimeout(() => document.addEventListener("mousedown", p), 0), document.body.appendChild(l), F(l, e), Bc = {
		pop: l,
		onKey: f,
		onDocClick: p
	};
}
function J(e, t, n) {
	let r = `_sgEdit_${t}_bound`;
	e[r] || (e[r] = !0, e.addEventListener("dblclick", (e) => {
		let r = `_sgEdit_${t}_handled`;
		e[r] || (e[r] = !0, e.stopPropagation(), n());
	}));
}
function Y(e, t = null, n = {}) {
	let { title: r = "Status", editable: i = !0, ...a } = n, o = Cn(e, t, a), s = Object.keys(e);
	return (e) => {
		let { td: t, value: n } = e;
		return t && i && J(t, "pill", () => Hc(t, e, {
			title: r,
			options: s.map((e) => ({
				value: e,
				label: I(e.replace(/-/g, " "))
			})),
			current: n
		})), o(e);
	};
}
function Uc({ editable: e = !0 } = {}) {
	let t = {
		critical: "red",
		major: "orange",
		minor: "yellow",
		cosmetic: "gray"
	}, n = [
		"open",
		"wip",
		"closed"
	];
	return (r) => {
		let { value: i, td: a } = r;
		if (a && e && J(a, "defect", () => q(a, r, {
			title: "Defect",
			prior: i,
			fields: [
				{
					name: "severity",
					label: "Severity",
					type: "select",
					options: Object.keys(t).map((e) => ({
						value: e,
						label: I(e)
					}))
				},
				{
					name: "status",
					label: "Status",
					type: "select",
					options: n.map((e) => ({
						value: e,
						label: I(e)
					}))
				},
				{
					name: "title",
					label: "Title",
					type: "text",
					span: 2
				}
			],
			toEditState: (e) => e && typeof e == "object" ? {
				severity: e.severity || "",
				status: e.status || "",
				title: e.title || ""
			} : {
				severity: "",
				status: "",
				title: typeof e == "string" ? e : ""
			},
			fromEditState: (e) => {
				if (!e.severity && !e.status && !e.title) return null;
				let t = {};
				return e.severity && (t.severity = e.severity), e.status && (t.status = e.status), e.title && (t.title = e.title.trim()), t;
			}
		})), M(i)) return "";
		let o = typeof i == "object" ? i : { title: String(i) }, s = j("span", { class: "sg-renderer-defect" }), c = o.severity ? String(o.severity).toLowerCase() : "minor", l = t[c] || "gray";
		if (s.append(j("span", { class: `sg-pill sg-pill-${l} sg-renderer-defect-sev` }, document.createTextNode(I(c)))), o.title && s.append(j("span", { class: "sg-renderer-defect-title" }, document.createTextNode(String(o.title)))), o.status) {
			let e = String(o.status).toLowerCase();
			s.append(j("span", { class: `sg-renderer-defect-status is-${e}` }, document.createTextNode(I(e))));
		}
		return s;
	};
}
function Wc({ currency: e = "AUD", locale: t = "en-AU", editable: n = !0 } = {}) {
	let r = {
		approved: "green",
		pending: "orange",
		rejected: "red",
		draft: "gray"
	};
	return (i) => {
		let { value: a, td: o } = i;
		if (o && n && J(o, "variation", () => q(o, i, {
			title: "Variation",
			prior: a,
			fields: [
				{
					name: "id",
					label: "ID",
					type: "text",
					placeholder: "VAR-001",
					mono: !0,
					span: 2
				},
				{
					name: "delta",
					label: "$ delta",
					type: "number",
					step: .01,
					placeholder: "2400"
				},
				{
					name: "status",
					label: "Status",
					type: "select",
					options: Object.keys(r).map((e) => ({
						value: e,
						label: I(e)
					}))
				}
			],
			toEditState: (e) => e && typeof e == "object" ? {
				id: e.id || "",
				delta: e.delta == null ? "" : e.delta,
				status: e.status || ""
			} : {
				id: typeof e == "string" ? e : "",
				delta: "",
				status: ""
			},
			fromEditState: (e) => {
				if (!e.id && e.delta == null && !e.status) return null;
				let t = {};
				return e.id && (t.id = e.id.trim()), e.delta != null && (t.delta = +e.delta), e.status && (t.status = e.status), t;
			}
		})), M(a)) return "";
		let s = typeof a == "object" ? a : { id: String(a) }, c = j("span", { class: "sg-renderer-variation" });
		if (s.id && c.append(j("span", { class: "sg-renderer-variation-id sg-renderer-mono" }, document.createTextNode(String(s.id)))), s.delta != null && Number.isFinite(+s.delta)) {
			let n = +s.delta, r = Math.abs(n).toLocaleString(t, {
				style: "currency",
				currency: e
			}), i = n > 0 ? "+" : n < 0 ? "-" : "";
			c.append(j("span", { class: `sg-renderer-variation-delta ${n >= 0 ? "is-up" : "is-down"}` }, document.createTextNode(`${i}${r}`)));
		}
		if (s.status) {
			let e = r[String(s.status).toLowerCase()] || "gray";
			c.append(j("span", { class: `sg-pill sg-pill-${e} sg-renderer-variation-status` }, document.createTextNode(I(s.status))));
		}
		return c;
	};
}
function Gc({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && e && J(r, "progress-claim", () => q(r, t, {
			title: "Progress claim",
			prior: n,
			fields: [
				{
					name: "index",
					label: "Claim #",
					type: "number",
					min: 0,
					step: 1
				},
				{
					name: "total",
					label: "Of total",
					type: "number",
					min: 0,
					step: 1
				},
				{
					name: "percent",
					label: "Percent",
					type: "number",
					min: 0,
					max: 100,
					step: 1,
					span: 2
				}
			],
			toEditState: (e) => typeof e == "number" ? {
				index: "",
				total: "",
				percent: e
			} : e && typeof e == "object" ? {
				index: e.index ?? "",
				total: e.total ?? "",
				percent: e.percent ?? ""
			} : {
				index: "",
				total: "",
				percent: ""
			},
			fromEditState: (e) => {
				let t = {};
				return e.index != null && (t.index = +e.index), e.total != null && (t.total = +e.total), e.percent != null && (t.percent = +e.percent), Object.keys(t).length ? t : null;
			}
		})), M(n)) return "";
		let i = typeof n == "object" ? n : { percent: Number(n) }, a = +i.index || null, o = +i.total || null, s = i.percent == null ? null : Number(i.percent);
		s == null && a && o && (s = a / o * 100), s != null && (s = Math.max(0, Math.min(100, s)));
		let c = j("span", { class: "sg-renderer-progress-claim" });
		if (a && o && c.append(j("span", { class: "sg-renderer-progress-claim-step" }, document.createTextNode(`Claim ${a} of ${o}`))), s != null) {
			let e = j("span", { class: "sg-renderer-progress-claim-bar" });
			e.append(j("span", {
				class: "sg-renderer-progress-claim-bar-fill",
				style: `width: ${s.toFixed(1)}%;`
			})), c.append(e), c.append(j("span", { class: "sg-renderer-progress-claim-pct" }, document.createTextNode(`${Math.round(s)}%`)));
		}
		return c;
	};
}
function Kc({ editable: e = !0 } = {}) {
	let t = [
		"blue",
		"indigo",
		"green",
		"orange",
		"red",
		"purple",
		"pink",
		"gray",
		"yellow"
	];
	return (n) => {
		let { value: r, td: i } = n;
		if (i && e && J(i, "tech-slot", () => q(i, n, {
			title: "Technician slot",
			prior: r,
			fields: [
				{
					name: "start",
					label: "Start",
					type: "time"
				},
				{
					name: "end",
					label: "End",
					type: "time"
				},
				{
					name: "label",
					label: "Label",
					type: "text",
					span: 2,
					placeholder: "J-1042 · Bondi"
				},
				{
					name: "color",
					label: "Colour",
					type: "select",
					span: 2,
					options: t.map((e) => ({
						value: e,
						label: I(e)
					}))
				}
			],
			toEditState: (e) => typeof e == "string" ? {
				start: "",
				end: "",
				label: e,
				color: "blue"
			} : e && typeof e == "object" ? {
				start: e.start || "",
				end: e.end || "",
				label: e.label || "",
				color: e.color || "blue"
			} : {
				start: "",
				end: "",
				label: "",
				color: "blue"
			},
			fromEditState: (e) => {
				if (!e.start && !e.end && !e.label) return null;
				let t = {};
				return e.start && (t.start = e.start), e.end && (t.end = e.end), e.label && (t.label = e.label.trim()), e.color && (t.color = e.color), t;
			}
		})), M(r)) return "";
		if (typeof r == "string") return j("span", { class: "sg-renderer-tech-slot sg-pill sg-pill-blue" }, document.createTextNode(r));
		let a = j("span", { class: `sg-renderer-tech-slot sg-pill sg-pill-${r.color || "blue"}` });
		if (r.start || r.end) {
			let e = [r.start, r.end].filter(Boolean).join("–");
			a.append(j("span", { class: "sg-renderer-tech-slot-time" }, document.createTextNode(e)));
		}
		return r.label && a.append(j("span", { class: "sg-renderer-tech-slot-label" }, document.createTextNode(String(r.label)))), a;
	};
}
function qc({ editable: e = !0 } = {}) {
	let t = {
		light: "#22c55e",
		moderate: "#f59e0b",
		heavy: "#ef4444"
	};
	return (n) => {
		let { value: r, td: i } = n;
		if (i && e && J(i, "travel-time", () => q(i, n, {
			title: "Travel time",
			prior: r,
			fields: [
				{
					name: "minutes",
					label: "Minutes",
					type: "number",
					min: 0,
					step: 1
				},
				{
					name: "distance",
					label: "Distance",
					type: "text",
					placeholder: "4.2 km"
				},
				{
					name: "traffic",
					label: "Traffic",
					type: "select",
					span: 2,
					options: [
						"light",
						"moderate",
						"heavy"
					].map((e) => ({
						value: e,
						label: I(e)
					}))
				}
			],
			toEditState: (e) => typeof e == "number" ? {
				minutes: e,
				distance: "",
				traffic: ""
			} : e && typeof e == "object" ? {
				minutes: e.minutes ?? "",
				distance: e.distance == null ? "" : String(e.distance),
				traffic: e.traffic || ""
			} : {
				minutes: "",
				distance: "",
				traffic: ""
			},
			fromEditState: (e) => {
				if (e.minutes == null && !e.distance && !e.traffic) return null;
				let t = { minutes: +e.minutes || 0 };
				return e.distance && (t.distance = e.distance.trim()), e.traffic && (t.traffic = e.traffic), t;
			}
		})), M(r)) return "";
		let a = null, o = null, s = null;
		if (typeof r == "number" ? a = r : typeof r == "object" && (a = +r.minutes, o = r.distance, s = r.traffic ? String(r.traffic).toLowerCase() : null), !Number.isFinite(a)) return String(r);
		let c = j("span", { class: "sg-renderer-travel-time" });
		s && t[s] && c.append(j("span", {
			class: "sg-renderer-travel-time-dot",
			title: `${s} traffic`,
			style: `background:${t[s]};`
		}));
		let l = [];
		return l.push(`${a} min`), o && l.push(String(o).includes("km") ? o : `${o} km`), c.append(j("span", { class: "sg-renderer-travel-time-text" }, document.createTextNode(l.join(" · ")))), c;
	};
}
function Jc({ maxDots: e = 10, editable: t = !0 } = {}) {
	return (n) => {
		let { value: r, td: i } = n;
		if (i && t && J(i, "route-stop", () => q(i, n, {
			title: "Route stop",
			prior: r,
			fields: [{
				name: "position",
				label: "Position",
				type: "number",
				min: 0,
				step: 1
			}, {
				name: "total",
				label: "Total",
				type: "number",
				min: 0,
				step: 1
			}],
			toEditState: (e) => Array.isArray(e) ? {
				position: e[0] ?? "",
				total: e[1] ?? ""
			} : e && typeof e == "object" ? {
				position: e.position ?? "",
				total: e.total ?? ""
			} : {
				position: typeof e == "number" ? e : "",
				total: ""
			},
			fromEditState: (e) => e.position == null && e.total == null ? null : {
				position: +e.position || 0,
				total: +e.total || 0
			}
		})), M(r)) return "";
		let a = 0, o = 0;
		if (Array.isArray(r) ? (a = +r[0] || 0, o = +r[1] || 0) : typeof r == "object" ? (a = +r.position || 0, o = +r.total || 0) : typeof r == "number" && (a = r), !o || !Number.isFinite(o)) return String(a || "");
		let s = j("span", { class: "sg-renderer-route-stop" }), c = j("span", { class: "sg-renderer-route-stop-dots" }), l = Math.min(o, e);
		for (let e = 1; e <= l; e++) c.append(j("span", { class: `sg-renderer-route-stop-dot${e <= a ? " is-on" : ""}` }));
		return s.append(c), s.append(j("span", { class: "sg-renderer-route-stop-label" }, document.createTextNode(`${a} of ${o}`))), s;
	};
}
function Yc({ now: e = () => /* @__PURE__ */ new Date(), editable: t = !0 } = {}) {
	let n = (e) => {
		let t = e.getHours(), n = e.getMinutes(), r = t >= 12 ? "pm" : "am";
		return t = t % 12 || 12, n === 0 ? `${t}${r}` : `${t}:${String(n).padStart(2, "0")}${r}`;
	}, r = [
		"Sun",
		"Mon",
		"Tue",
		"Wed",
		"Thu",
		"Fri",
		"Sat"
	], i = [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	], a = (e) => {
		if (!e) return "";
		let t = e instanceof Date ? e : new Date(e);
		if (Number.isNaN(t.valueOf())) return "";
		let n = (e) => String(e).padStart(2, "0");
		return `${t.getFullYear()}-${n(t.getMonth() + 1)}-${n(t.getDate())}T${n(t.getHours())}:${n(t.getMinutes())}`;
	};
	return (o) => {
		let { value: s, td: c } = o;
		if (c && t && J(c, "arrival-window", () => q(c, o, {
			title: "Arrival window",
			prior: s,
			fields: [{
				name: "start",
				label: "Start",
				type: "datetime",
				span: 2
			}, {
				name: "end",
				label: "End",
				type: "datetime",
				span: 2
			}],
			toEditState: (e) => !e || typeof e == "string" ? {
				start: "",
				end: ""
			} : Array.isArray(e) ? {
				start: a(e[0]),
				end: a(e[1])
			} : {
				start: a(e.start),
				end: a(e.end)
			},
			fromEditState: (e) => {
				if (!e.start && !e.end) return null;
				let t = {};
				return e.start && (t.start = new Date(e.start).toISOString()), e.end && (t.end = new Date(e.end).toISOString()), t;
			}
		})), M(s)) return "";
		let l = null, u = null;
		if (typeof s == "string") return j("span", { class: "sg-renderer-arrival-window" }, document.createTextNode(s));
		Array.isArray(s) ? [l, u] = s : typeof s == "object" && (l = s.start, u = s.end);
		let d = l ? new Date(l) : null, f = u ? new Date(u) : null;
		if (!d || Number.isNaN(d.valueOf())) return "";
		let p = e(), m = d.toDateString() === p.toDateString(), h = f && !Number.isNaN(f.valueOf()) ? `${n(d)}–${n(f)}` : n(d), g = m ? "today" : `${r[d.getDay()]} ${d.getDate()} ${i[d.getMonth()]}`, _ = "is-future", v = d.getTime(), y = f && !Number.isNaN(f.valueOf()) ? f.getTime() : v + 3600 * 1e3, b = p.getTime();
		b > y + 1800 * 1e3 ? _ = "is-late" : b > y ? _ = "is-overdue" : b >= v && (_ = "is-open");
		let x = j("span", { class: `sg-renderer-arrival-window ${_}` });
		return x.append(j("span", { class: "sg-renderer-arrival-window-time" }, document.createTextNode(h))), x.append(j("span", { class: "sg-renderer-arrival-window-date" }, document.createTextNode(g))), x;
	};
}
function Xc({ editable: e = !0 } = {}) {
	return (t) => {
		let { value: n, td: r } = t;
		if (r && e && J(r, "insurance-cert", () => q(r, t, {
			title: "Insurance certificate",
			prior: n,
			fields: [
				{
					name: "issuer",
					label: "Insurer",
					type: "text",
					placeholder: "CGU",
					span: 2
				},
				{
					name: "class",
					label: "Cover",
					type: "text",
					placeholder: "PL $20m"
				},
				{
					name: "number",
					label: "Policy #",
					type: "text",
					placeholder: "PCY-22038A",
					mono: !0
				},
				{
					name: "expires",
					label: "Expires",
					type: "date",
					span: 2
				}
			],
			toEditState: (e) => e && typeof e == "object" ? {
				issuer: e.issuer || "",
				class: e.class || "",
				number: e.number || "",
				expires: e.expires ? String(e.expires).slice(0, 10) : ""
			} : {
				issuer: "",
				class: "",
				number: typeof e == "string" ? e : "",
				expires: ""
			},
			fromEditState: (e) => {
				let t = {
					issuer: e.issuer.trim(),
					class: e.class.trim(),
					number: e.number.trim(),
					expires: e.expires || ""
				};
				return Object.values(t).every((e) => !e) ? null : t;
			}
		})), M(n)) return "";
		let i = j("span", { class: "sg-renderer-compliance" });
		if (typeof n == "string") return i.append(j("span", { class: "sg-renderer-compliance-prefix" }, document.createTextNode("Cert"))), i.append(j("span", { class: "sg-renderer-mono" }, document.createTextNode(n))), i;
		n.issuer && i.append(j("span", { class: "sg-renderer-compliance-prefix" }, document.createTextNode(String(n.issuer)))), n.class && i.append(j("span", { class: "sg-renderer-compliance-class" }, document.createTextNode(String(n.class)))), n.number && i.append(j("span", { class: "sg-renderer-mono" }, document.createTextNode(String(n.number))));
		let a = ws(n.expires);
		return a && i.append(a), i;
	};
}
var Zc = {
	pdf: "#dc2626",
	doc: "#2563eb",
	docx: "#2563eb",
	rtf: "#2563eb",
	txt: "#6b7280",
	md: "#6b7280",
	xls: "#15803d",
	xlsx: "#15803d",
	csv: "#15803d",
	numbers: "#15803d",
	ppt: "#ea580c",
	pptx: "#ea580c",
	key: "#ea580c",
	zip: "#a16207",
	tar: "#a16207",
	gz: "#a16207",
	"7z": "#a16207",
	rar: "#a16207",
	png: "#7c3aed",
	jpg: "#7c3aed",
	jpeg: "#7c3aed",
	gif: "#7c3aed",
	webp: "#7c3aed",
	svg: "#7c3aed",
	mp3: "#0891b2",
	wav: "#0891b2",
	m4a: "#0891b2",
	ogg: "#0891b2",
	mp4: "#9333ea",
	mov: "#9333ea",
	webm: "#9333ea",
	mkv: "#9333ea"
};
function Qc(e) {
	let t = e && (e.filename || e.name) ? String(e.filename || e.name) : "attachment", n = (t.includes(".") ? t.split(".").pop() : "").toLowerCase(), r = Zc[n] || "#6b7280", i = j("span", {
		class: "sg-renderer-email-thread-attachment",
		title: t
	});
	return i.append(j("span", {
		class: "sg-renderer-email-thread-attachment-icon",
		style: `background:${r};`
	}, document.createTextNode(n ? n.slice(0, 3).toUpperCase() : "FILE"))), i.append(j("span", { class: "sg-renderer-email-thread-attachment-name" }, document.createTextNode(t))), i;
}
function $c(e, t) {
	if (M(e)) return "";
	if (typeof e == "string" && !/^\d{4}-\d{2}-\d{2}/.test(e)) return e;
	let n = N(e);
	if (!n) return typeof e == "string" ? e : "";
	let r = /* @__PURE__ */ new Date();
	if (n.getFullYear() === r.getFullYear() && n.getMonth() === r.getMonth() && n.getDate() === r.getDate()) return new Intl.DateTimeFormat(t, {
		hour: "numeric",
		minute: "2-digit",
		hour12: !0
	}).format(n).toLowerCase().replace(/\s+/g, " ");
	let i = n.getFullYear() === r.getFullYear();
	return new Intl.DateTimeFormat(t, i ? {
		day: "numeric",
		month: "short"
	} : {
		day: "numeric",
		month: "short",
		year: "numeric"
	}).format(n);
}
function el(e) {
	if (M(e)) return "(unknown sender)";
	if (Array.isArray(e)) {
		let t = e.map((e) => el(e)).filter((e) => e && e !== "(unknown sender)");
		return t.length ? t.join(", ") : "(unknown sender)";
	}
	return typeof e == "string" ? e : typeof e == "object" ? e.name || e.email || "(unknown sender)" : String(e);
}
function tl({ locale: e = "en-AU" } = {}) {
	return ({ value: t, td: n }) => {
		if (M(t)) return "";
		let r = typeof t == "object" ? t : { subject: String(t) };
		if (n) {
			n.classList.add("sg-renderer-email-thread-cell");
			let e = n.parentElement;
			e && e.tagName === "TR" && e.classList.add("sg-has-multiline");
		}
		let i = ["sg-renderer-email-thread"];
		r.unread && i.push("is-unread");
		let a = j("div", { class: i.join(" ") }), o = j("div", { class: "sg-renderer-email-thread-row" }), s = j("span", { class: "sg-renderer-email-thread-from" }, document.createTextNode(el(r.from)));
		o.append(s), Number.isFinite(+r.count) && +r.count > 1 && s.append(j("span", { class: "sg-renderer-email-thread-count" }, document.createTextNode(String(+r.count))));
		let c = $c(r.time, e);
		if (c && o.append(j("span", { class: "sg-renderer-email-thread-time" }, document.createTextNode(c))), a.append(o), M(r.subject) || a.append(j("div", { class: "sg-renderer-email-thread-subject" }, document.createTextNode(String(r.subject)))), M(r.preview) || a.append(j("div", { class: "sg-renderer-email-thread-preview" }, document.createTextNode(String(r.preview)))), Array.isArray(r.attachments) && r.attachments.length) {
			let e = j("div", { class: "sg-renderer-email-thread-attachments" });
			r.attachments.forEach((t) => e.append(Qc(t))), a.append(e);
		}
		return a;
	};
}
k("email", Be()), k("url", Ve()), k("phone", He()), k("currency", Ue()), k("percent", We()), k("progress-bar", pn()), k("star-rating", hn()), k("tags", gn()), k("country-flag", _n()), k("abn", bn()), k("avatar", xn()), k("date", Ge()), k("datetime", Ke()), k("relative-time", Je()), k("duration", Xe()), k("number", Ze()), k("compact-number", Qe()), k("file-size", $e()), k("boolean", it()), k("delta", ct()), k("truncate", lt()), k("copyable", ft()), k("image", mt()), k("color-swatch", gt()), k("sparkline", vt()), k("heatmap-cell", Ct()), k("mask", Ot()), k("highlight", kt()), k("multi-line", jt()), k("attachments", Ut()), k("address-au", cn()), k("checkbox", wn()), k("switch", Bn()), k("markdown", Gn()), k("json", Jn()), k("linked-record", Yn()), k("coloured-tags", Qn()), k("time", tr()), k("diff", rr()), k("geo", or()), k("qr", sr()), k("code", cr()), k("rating", hr()), k("bullet", br()), k("donut", xr()), k("histogram", Sr()), k("rag", Tr()), k("timeline-steps", Er()), k("mention", Or()), k("expand", Ar()), k("units", jr()), k("ip-address", Ir()), k("bsb", Rr()), k("acn", Vr()), k("tfn", Hr()), k("medicare", Wr()), k("audio", Gr()), k("video", Kr()), k("reactions", qr()), k("comment-count", Jr()), k("ordinal", Yr()), k("plural", Xr()), k("empty", Qr()), k("credit-card", ti()), k("loading-shimmer", ni()), k("audio-attachment", Nn()), k("select", ii()), k("multiselect", li()), k("combobox", pi()), k("slider", _s()), k("date-picker", vi()), k("time-picker", Ti()), k("date-range", Mi()), k("color-picker", Li()), k("textarea", Vi()), k("action-button", Gi()), k("menu", qi()), k("split-button", Zi()), k("row-actions", $i()), k("drag-handle", ta()), k("row-number", na()), k("expand-toggle", ra()), k("avatar-stack", us()), k("presence", fs()), k("assignee", ps()), k("uuid", oa()), k("git-sha", ca()), k("mac-address", ua()), k("license-key", da()), k("vin", pa()), k("isbn", ga()), k("iban", $o()), k("swift", es()), k("ssn", ts()), k("ein", ns()), k("vat", rs()), k("nin", as()), k("postal-code", zo()), k("address-us", Uo()), k("address-generic", Go()), k("barcode", Zo()), k("gauge", Ao()), k("win-loss", jo()), k("mini-bar-chart", Mo()), k("mini-line-chart", No()), k("trend", Lo()), k("countdown", xo()), k("age", So()), k("fiscal-period", wo()), k("timezone", Do()), k("cron", ko()), k("spinner", po()), k("error", ho()), k("sync-status", _o()), k("stale", vo()), k("fresh", yo()), k("favicon", io()), k("domain", ao()), k("social-link", so()), k("tracking-number", lo()), k("video-link", fo()), k("file", Ja()), k("download-link", Xa()), k("mime-icon", Za()), k("gallery", Qa()), k("waveform", ro()), k("html", ya()), k("yaml", ba()), k("xml", xa()), k("autolink", wa()), k("redacted", Ta()), k("spoiler", Ea()), k("fraction", ka()), k("scientific", Ma()), k("hex", Na({ base: 16 })), k("binary", Na({ base: 2 })), k("octal", Na({ base: 8 })), k("percentile", Pa()), k("battery", Fa()), k("signal-bars", Ia()), k("volume", Ba()), k("trade-licence", Ts()), k("white-card", As()), k("blue-card", js()), k("wwcc", Ms()), k("high-risk-licence", Ns()), k("coes", Ps()), k("coc", Fs()), k("qbcc-licence", Is()), k("vba-licence", Ls()), k("gas-certificate", Rs()), k("asbestos-licence", zs()), k("refrigerant-licence", Bs()), k("pool-safety-cert", Vs()), k("test-and-tag", Hs()), k("insurance-cert", Xc()), k("gst-status", Us()), k("abn-status", Ws()), k("hbcf-cert", Gs()), k("job-status", Ks()), k("arrival-window", Yc()), k("route-stop", Jc()), k("travel-time", qc()), k("technician-slot", Kc()), k("progress-claim", Gc()), k("variation", Wc()), k("defect", Uc()), k("snag", Uc()), k("signature", Ac()), k("job-photo", kc()), k("callout-fee", Oc()), k("payment-terms", Cc()), k("invoice-status", xc()), k("retention", bc()), k("materials-pick", yc()), k("swms-status", qs()), k("jsa-status", Js()), k("toolbox-talk", vc()), k("ppe-checklist", _c()), k("incident-severity", hc()), k("hazard-rating", mc()), k("site-induction", pc()), k("trade-type", fc()), k("skill-endorsement", uc()), k("subcontractor", lc()), k("crew", cc()), k("rego-plate", sc()), k("rego-status", ac()), k("ctp-status", oc()), k("service-due", ic()), k("fuel-card", rc()), k("odometer", tc()), k("customer-type", Ys()), k("strata-plan", ec()), k("lot-plan", $s()), k("council-lga", Qs()), k("region-classifier", Zs()), k("suburb-postcode-au", Xs()), k("email-thread", tl());
var X = {
	text: {
		copy: ({ value: e }) => e == null ? "" : String(e),
		parse: (e) => String(e ?? "")
	},
	number: {
		copy: ({ value: e }) => e == null || e === "" ? "" : String(e),
		parse: Le
	},
	boolean: {
		copy: ({ value: e }) => e === !0 ? "true" : e === !1 ? "false" : e == null ? "" : String(e),
		parse: Re
	},
	date: {
		copy: ({ value: e }) => e == null || e === "" ? "" : e instanceof Date && !Number.isNaN(e.valueOf()) ? `${e.getFullYear()}-${String(e.getMonth() + 1).padStart(2, "0")}-${String(e.getDate()).padStart(2, "0")}` : String(e),
		parse: (e) => {
			let t = String(e ?? "");
			if (t === "") return "";
			let n = new Date(t);
			return Number.isNaN(n.valueOf()) ? void 0 : t;
		}
	},
	datetime: {
		copy: ({ value: e }) => e == null || e === "" ? "" : e instanceof Date && !Number.isNaN(e.valueOf()) ? e.toISOString() : String(e),
		parse: (e) => {
			let t = String(e ?? "");
			if (t === "") return "";
			let n = new Date(t);
			return Number.isNaN(n.valueOf()) ? void 0 : t;
		}
	},
	stringList: {
		copy: ({ value: e }) => Array.isArray(e) ? e.join(", ") : M(e) ? "" : String(e),
		parse: (e) => {
			let t = String(e ?? "").trim();
			return t === "" ? [] : t.split(/\s*,\s*/).filter(Boolean);
		}
	},
	numberList: {
		copy: ({ value: e }) => Array.isArray(e) ? e.join(", ") : "",
		parse: (e) => {
			let t = String(e ?? "").trim();
			if (t === "") return [];
			let n = t.split(/\s*,\s*/).filter(Boolean).map(Number);
			return n.some((e) => !Number.isFinite(e)) ? void 0 : n;
		}
	},
	json: {
		copy: ({ value: e }) => {
			if (e == null || e === "") return "";
			if (typeof e == "string") return e;
			try {
				return JSON.stringify(e);
			} catch {
				return String(e);
			}
		},
		parse: (e) => {
			let t = String(e ?? "").trim();
			if (t === "") return "";
			try {
				return JSON.parse(t);
			} catch {
				return;
			}
		}
	},
	digits: {
		copy: ({ value: e }) => e == null ? "" : String(e).trim(),
		parse: (e) => {
			let t = String(e ?? "");
			return t === "" ? "" : t.replace(/\D/g, "") || t;
		}
	}
};
function Z(e, t) {
	let n = A(e);
	n && Me(n, t);
}
Z("email", {
	copy: X.text.copy,
	parse: (e) => String(e ?? "").trim()
}), Z("url", {
	copy: X.text.copy,
	parse: (e) => String(e ?? "").trim()
}), Z("phone", X.digits), Z("currency", X.number), Z("percent", {
	copy: X.number.copy,
	parse: (e) => Le(String(e ?? "").replace(/%$/, ""))
}), Z("progress-bar", X.number), Z("star-rating", X.number), Z("tags", X.stringList), Z("country-flag", {
	copy: ({ value: e }) => e == null ? "" : String(e).trim().toUpperCase(),
	parse: (e) => {
		let t = String(e ?? "").trim().toUpperCase();
		return /^[A-Z]{2}$/.test(t) ? t : void 0;
	}
}), Z("abn", X.digits), Z("avatar", X.text), Z("date", X.date), Z("datetime", X.datetime), Z("relative-time", X.datetime), Z("duration", {
	copy: X.number.copy,
	parse: (e) => {
		let t = String(e ?? "").trim();
		if (t === "") return "";
		if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
		let n = /^(\d+):(\d+)(?::(\d+))?$/.exec(t);
		if (n) {
			let e = +n[1], t = +n[2], r = n[3] ? +n[3] : 0;
			return (n[3] ? e * 3600 + t * 60 + r : e * 60 + t) * 1e3;
		}
		let r = 0, i = !1, a = /(-?\d+(?:\.\d+)?)\s*(ms|milliseconds?|s|sec|seconds?|m|min|minutes?|h|hr|hours?|d|days?)\b/gi, o;
		for (; (o = a.exec(t)) !== null;) {
			let e = Number(o[1]), t = o[2].toLowerCase();
			t.startsWith("ms") || t.startsWith("milli") ? r += e : t === "s" || t.startsWith("sec") ? r += e * 1e3 : t === "m" || t.startsWith("min") ? r += e * 6e4 : t.startsWith("h") ? r += e * 36e5 : t.startsWith("d") && (r += e * 864e5), i = !0;
		}
		return i ? r : void 0;
	}
}), Z("number", X.number), Z("compact-number", {
	copy: X.number.copy,
	parse: (e) => {
		let t = String(e ?? "").trim();
		if (t === "") return "";
		let n = /^(-?\d+(?:\.\d+)?)\s*([kmbt])$/i.exec(t);
		if (n) {
			let e = Number(n[1]), t = n[2].toLowerCase(), r = t === "k" ? 1e3 : t === "m" ? 1e6 : t === "b" ? 1e9 : 0xe8d4a51000;
			return Number.isFinite(e) ? e * r : void 0;
		}
		return Le(t);
	}
}), Z("file-size", {
	copy: X.number.copy,
	parse: (e) => {
		let t = String(e ?? "").trim();
		if (t === "") return "";
		let n = /^(-?\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb|pb|kib|mib|gib|tib|pib)?$/i.exec(t);
		if (!n) return Le(t);
		let r = Number(n[1]);
		if (!Number.isFinite(r)) return;
		let i = (n[2] || "b").toLowerCase(), a = i.endsWith("ib") ? 1024 : 1e3, o = i.endsWith("ib") ? i.slice(0, -2) + "b" : i;
		return r * ({
			b: 1,
			kb: a,
			mb: a ** 2,
			gb: a ** 3,
			tb: a ** 4,
			pb: a ** 5
		}[o] ?? 1);
	}
}), Z("boolean", X.boolean), Z("delta", X.number), Z("truncate", X.text), Z("copyable", X.text), Z("image", {
	copy: X.text.copy,
	parse: (e) => String(e ?? "").trim()
}), Z("color-swatch", {
	copy: X.text.copy,
	parse: (e) => String(e ?? "").trim()
}), Z("sparkline", X.numberList), Z("heatmap-cell", X.number), Z("mask", X.text), Z("highlight", X.text), Z("multi-line", X.text), Z("attachments", {
	copy: X.json.copy,
	parse: (e) => {
		let t = X.json.parse(e);
		if (t !== void 0) return t === "" || t == null ? [] : Array.isArray(t) ? t : void 0;
	}
}), Z("address-au", {
	copy: ({ value: e }) => {
		if (e == null || e === "") return "";
		if (typeof e == "string") return e;
		if (typeof e != "object") return String(e);
		try {
			return JSON.stringify(e);
		} catch {
			return String(e);
		}
	},
	parse: (e) => {
		let t = String(e ?? "").trim();
		if (t === "") return null;
		if (t.startsWith("{")) try {
			return JSON.parse(t);
		} catch {}
		return t;
	}
}), Z("checkbox", X.boolean), Z("switch", X.boolean), Z("markdown", X.text), Z("json", X.json), Z("linked-record", {
	copy: ({ value: e }) => e == null || e === "" ? "" : Array.isArray(e) ? e.join(", ") : String(e),
	parse: (e) => {
		let t = String(e ?? "");
		return t === "" ? "" : t.includes(",") ? t.split(/\s*,\s*/).filter(Boolean) : t;
	}
}), Z("coloured-tags", X.stringList), Z("time", {
	copy: ({ value: e }) => e == null ? "" : String(e).trim(),
	parse: (e) => {
		let t = String(e ?? "").trim();
		if (t === "") return "";
		let n = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)$/i.exec(t);
		if (n) {
			let e = parseInt(n[1], 10), t = n[2], r = n[3];
			return n[4].toLowerCase() === "pm" && e < 12 && (e += 12), n[4].toLowerCase() === "am" && e === 12 && (e = 0), `${String(e).padStart(2, "0")}:${t}${r ? ":" + r : ""}`;
		}
		if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(t)) return t;
		if (/^\d+(\.\d+)?$/.test(t)) return Number(t);
	}
}), Z("diff", {
	copy: ({ value: e }) => {
		if (e == null || e === "") return "";
		if (typeof e == "string") return e;
		if (Array.isArray(e)) return `${e[0] ?? ""} → ${e[1] ?? ""}`;
		let t = e.from ?? e.old ?? e.before ?? e.previous ?? null, n = e.to ?? e.new ?? e.after ?? e.current ?? null;
		return t == null && n == null ? "" : `${t ?? ""} → ${n ?? ""}`;
	},
	parse: (e) => {
		let t = String(e ?? "").trim();
		if (t === "") return null;
		let n = /^(.*?)\s*(?:→|->|=>|—>)\s*(.+)$/.exec(t);
		return n ? {
			from: n[1].trim(),
			to: n[2].trim()
		} : {
			from: null,
			to: t
		};
	}
}), Z("geo", {
	copy: ({ value: e }) => e == null || e === "" ? "" : Array.isArray(e) ? `${e[0]}, ${e[1]}` : typeof e == "object" ? `${e.lat ?? e.latitude}, ${e.lng ?? e.long ?? e.lon ?? e.longitude}` : String(e),
	parse: (e) => {
		let t = String(e ?? "").trim();
		if (t === "") return null;
		let n = t.split(/\s*,\s*/);
		if (n.length !== 2) return;
		let r = Number(n[0]), i = Number(n[1]);
		if (!(!Number.isFinite(r) || !Number.isFinite(i))) return {
			lat: r,
			lng: i
		};
	}
}), Z("qr", X.text), Z("code", X.text), Z("rating", X.number), Z("bullet", X.number), Z("donut", X.number), Z("histogram", X.numberList), Z("rag", {
	copy: ({ value: e }) => e == null ? "" : String(e).trim().toLowerCase(),
	parse: (e) => {
		let t = String(e ?? "").trim();
		if (t === "") return "";
		let n = t.toLowerCase();
		if (Cr[n]) return Cr[n];
		if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
	}
}), Z("timeline-steps", X.text), Z("mention", X.text), Z("expand", X.text), Z("units", X.number), Z("ip-address", {
	copy: X.text.copy,
	parse: (e) => String(e ?? "").trim()
}), Z("bsb", X.digits), Z("acn", X.digits), Z("tfn", X.digits), Z("medicare", X.digits), Z("audio", {
	copy: X.text.copy,
	parse: (e) => String(e ?? "").trim()
}), Z("video", {
	copy: X.text.copy,
	parse: (e) => String(e ?? "").trim()
}), Z("reactions", X.json), Z("comment-count", {
	copy: ({ value: e }) => {
		if (e == null || e === "") return "";
		if (typeof e == "object") {
			let t = e.value ?? e.text ?? "", n = e.count ?? e.comments ?? null;
			return n != null && t ? `${t} (${n})` : String(n ?? t);
		}
		return String(e);
	},
	parse: (e) => {
		let t = String(e ?? "").trim();
		if (t === "") return "";
		let n = /^(.*?)\s*\((\d+)\)$/.exec(t);
		return n ? {
			value: n[1].trim(),
			count: Number(n[2])
		} : /^\d+$/.test(t) ? Number(t) : t;
	}
}), Z("ordinal", {
	copy: X.number.copy,
	parse: (e) => {
		let t = String(e ?? "").trim();
		if (t === "") return "";
		let n = /^(-?\d+)(?:st|nd|rd|th)?$/i.exec(t);
		return n ? Number(n[1]) : void 0;
	}
}), Z("plural", X.number), Z("empty", X.text), Z("credit-card", X.digits), Z("loading-shimmer", X.text), Z("audio-attachment", {
	copy: ({ value: e }) => e == null || e === "" ? "" : typeof e == "string" ? e : typeof e == "object" ? e.url || JSON.stringify(e) : String(e),
	parse: (e) => {
		let t = String(e ?? "").trim();
		if (t === "") return null;
		if (t.startsWith("{")) try {
			return JSON.parse(t);
		} catch {}
		return t;
	}
}), Z("select", {
	copy: ({ value: e }) => e == null || e === "" ? "" : String(e),
	parse: (e, t) => {
		let n = String(e ?? "");
		if (n === "") return null;
		let r = t?.col?.cellRendererConfig?.options || t?.col?.enumValues || [];
		if (!Array.isArray(r) || r.length === 0) return n;
		let i = (e) => String(e).trim().toLowerCase(), a = i(n);
		for (let e of r) {
			let t = typeof e == "object" ? e.value : e, n = typeof e == "object" ? e.label ?? t : e;
			if (i(t) === a || i(n) === a) return t;
		}
	}
}), Z("multiselect", {
	copy: ({ value: e }) => Array.isArray(e) ? e.join(", ") : M(e) ? "" : String(e),
	parse: (e, t) => {
		let n = String(e ?? "").trim();
		if (n === "") return [];
		let r = n.split(/\s*,\s*/).filter(Boolean), i = t?.col?.cellRendererConfig?.options || t?.col?.enumValues || [];
		if (!Array.isArray(i) || i.length === 0) return r;
		let a = (e) => String(e).trim().toLowerCase(), o = [];
		for (let e of r) {
			let t = a(e), n = i.find((e) => {
				let n = typeof e == "object" ? e.value : e, r = typeof e == "object" ? e.label ?? n : e;
				return a(n) === t || a(r) === t;
			});
			if (!n) return;
			o.push(typeof n == "object" ? n.value : n);
		}
		return o;
	}
}), Z("combobox", {
	copy: ({ value: e }) => e == null || e === "" ? "" : String(e),
	parse: (e, t) => {
		let n = String(e ?? "");
		if (n === "") return null;
		let r = t?.col?.cellRendererConfig?.options || t?.col?.enumValues || [], i = !!t?.col?.cellRendererConfig?.allowCustom;
		if (Array.isArray(r) && r.length > 0) {
			let e = (e) => String(e).trim().toLowerCase(), t = e(n);
			for (let n of r) {
				let r = typeof n == "object" ? n.value : n, i = typeof n == "object" ? n.label ?? r : n;
				if (e(r) === t || e(i) === t) return r;
			}
			return i ? n : void 0;
		}
		return n;
	}
}), Z("slider", X.number), Z("date-picker", X.date), Z("time-picker", {
	copy: ({ value: e }) => e == null ? "" : String(e),
	parse: (e) => {
		let t = String(e ?? "").trim();
		if (t === "") return "";
		let n = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(t);
		if (n) {
			let e = parseInt(n[1], 10);
			return n[3].toLowerCase() === "pm" && e < 12 && (e += 12), n[3].toLowerCase() === "am" && e === 12 && (e = 0), `${String(e).padStart(2, "0")}:${n[2]}`;
		}
		if (/^\d{1,2}:\d{2}$/.test(t)) {
			let [e, n] = t.split(":");
			return `${e.padStart(2, "0")}:${n}`;
		}
	}
}), Z("date-range", {
	copy: ({ value: e }) => {
		if (e == null || e === "") return "";
		let t, n;
		if (Array.isArray(e)) [t, n] = e;
		else if (typeof e == "object") t = e.start || e.from, n = e.end || e.to;
		else return String(e);
		let r = (e) => {
			if (!e) return "";
			let t = e instanceof Date ? e : new Date(e);
			return Number.isNaN(t.valueOf()) ? String(e) : `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
		};
		return `${r(t)}/${r(n)}`;
	},
	parse: (e) => {
		let t = String(e ?? "").trim();
		if (t === "") return null;
		let n = t.split(/\s*\/\s*|\s*[–]\s*|\s+-\s+/);
		if (n.length < 2) return;
		let [r, i] = n, a = (e) => e === "" || !Number.isNaN(new Date(e).valueOf());
		if (!(!a(r) || !a(i))) return [r, i];
	}
}), Z("color-picker", {
	copy: X.text.copy,
	parse: (e) => String(e ?? "").trim()
}), Z("textarea", X.text), Z("action-button", X.text), Z("menu", X.text), Z("split-button", X.text), Z("row-actions", X.text), Z("trade-licence", X.json), Z("white-card", X.json), Z("blue-card", X.json), Z("wwcc", X.json), Z("high-risk-licence", X.json), Z("coes", X.json), Z("coc", X.json), Z("qbcc-licence", X.json), Z("vba-licence", X.json), Z("gas-certificate", X.json), Z("asbestos-licence", X.json), Z("refrigerant-licence", X.json), Z("pool-safety-cert", X.json), Z("test-and-tag", X.json), Z("insurance-cert", X.json), Z("gst-status", X.text), Z("abn-status", X.text), Z("hbcf-cert", X.json), Z("job-status", X.text), Z("arrival-window", X.json), Z("route-stop", X.json), Z("travel-time", X.json), Z("technician-slot", X.json), Z("progress-claim", X.json), Z("variation", X.json), Z("defect", X.json), Z("snag", X.json), Z("signature", X.json), Z("job-photo", X.json), Z("callout-fee", X.json), Z("payment-terms", X.json), Z("invoice-status", X.text), Z("retention", X.json), Z("materials-pick", X.json), Z("swms-status", X.text), Z("jsa-status", X.text), Z("toolbox-talk", X.json), Z("ppe-checklist", X.stringList), Z("incident-severity", X.text), Z("hazard-rating", X.json), Z("site-induction", X.json), Z("trade-type", X.text), Z("skill-endorsement", X.json), Z("subcontractor", X.json), Z("crew", X.json), Z("rego-plate", X.json), Z("rego-status", X.json), Z("ctp-status", X.json), Z("service-due", X.json), Z("fuel-card", X.json), Z("odometer", X.number), Z("customer-type", X.text), Z("strata-plan", X.json), Z("lot-plan", X.json), Z("council-lga", X.json), Z("region-classifier", X.text), Z("suburb-postcode-au", X.json), Z("email-thread", X.json);
var nl = {
	email: Be,
	url: Ve,
	phone: He,
	currency: Ue,
	percent: We,
	progressBar: pn,
	starRating: hn,
	tags: gn,
	countryFlag: _n,
	abn: bn,
	avatar: xn,
	statusPill: Cn,
	date: Ge,
	datetime: Ke,
	relativeTime: Je,
	duration: Xe,
	number: Ze,
	compactNumber: Qe,
	fileSize: $e,
	boolean: it,
	delta: ct,
	truncate: lt,
	copyable: ft,
	image: mt,
	colorSwatch: gt,
	sparkline: vt,
	heatmap: Ct,
	mask: Ot,
	highlight: kt,
	multiLine: jt,
	attachments: Ut,
	addressAu: cn,
	checkbox: wn,
	switch: Bn,
	markdown: Gn,
	json: Jn,
	linkedRecord: Yn,
	colouredTags: Qn,
	time: tr,
	diff: rr,
	geo: or,
	qr: sr,
	code: cr,
	rating: hr,
	bullet: br,
	donut: xr,
	histogram: Sr,
	rag: Tr,
	timelineSteps: Er,
	mention: Or,
	expand: Ar,
	units: jr,
	ipAddress: Ir,
	bsb: Rr,
	acn: Vr,
	tfn: Hr,
	medicare: Wr,
	audio: Gr,
	video: Kr,
	reactions: qr,
	commentCount: Jr,
	ordinal: Yr,
	plural: Xr,
	empty: Qr,
	creditCard: ti,
	loadingShimmer: ni,
	audioAttachment: Nn,
	select: ii,
	multiselect: li,
	combobox: pi,
	slider: _s,
	datePicker: vi,
	timePicker: Ti,
	dateRange: Mi,
	colorPicker: Li,
	textarea: Vi,
	actionButton: Gi,
	menu: qi,
	splitButton: Zi,
	rowActions: $i,
	dragHandle: ta,
	rowNumber: na,
	expandToggle: ra,
	avatarStack: us,
	presence: fs,
	assignee: ps,
	uuid: oa,
	gitSha: ca,
	macAddress: ua,
	licenseKey: da,
	vin: pa,
	isbn: ga,
	iban: $o,
	swift: es,
	ssn: ts,
	ein: ns,
	vat: rs,
	nin: as,
	postalCode: zo,
	addressUs: Uo,
	addressGeneric: Go,
	barcode: Zo,
	gauge: Ao,
	winLoss: jo,
	miniBarChart: Mo,
	miniLineChart: No,
	trend: Lo,
	countdown: xo,
	age: So,
	fiscalPeriod: wo,
	timezone: Do,
	cron: ko,
	spinner: po,
	errorCell: ho,
	syncStatus: _o,
	staleCell: vo,
	freshCell: yo,
	favicon: io,
	domain: ao,
	socialLink: so,
	trackingNumber: lo,
	videoLink: fo,
	file: Ja,
	downloadLink: Xa,
	mimeIcon: Za,
	gallery: Qa,
	waveform: ro,
	html: ya,
	yaml: ba,
	xml: xa,
	autolink: wa,
	redacted: Ta,
	spoiler: Ea,
	fraction: ka,
	scientific: Ma,
	radix: Na,
	percentile: Pa,
	battery: Fa,
	signalBars: Ia,
	volumeIndicator: Ba,
	tradeLicence: Ts,
	whiteCard: As,
	blueCard: js,
	wwcc: Ms,
	highRiskLicence: Ns,
	coes: Ps,
	coc: Fs,
	qbccLicence: Is,
	vbaLicence: Ls,
	gasCertificate: Rs,
	asbestosLicence: zs,
	refrigerantLicence: Bs,
	poolSafetyCert: Vs,
	testAndTag: Hs,
	insuranceCert: Xc,
	gstStatus: Us,
	abnStatus: Ws,
	hbcfCert: Gs,
	jobStatus: Ks,
	arrivalWindow: Yc,
	routeStop: Jc,
	travelTime: qc,
	technicianSlot: Kc,
	progressClaim: Gc,
	variation: Wc,
	defect: Uc,
	signature: Ac,
	jobPhoto: kc,
	calloutFee: Oc,
	paymentTerms: Cc,
	invoiceStatus: xc,
	retention: bc,
	materialsPick: yc,
	swmsStatus: qs,
	jsaStatus: Js,
	toolboxTalk: vc,
	ppeChecklist: _c,
	incidentSeverity: hc,
	hazardRating: mc,
	siteInduction: pc,
	tradeType: fc,
	skillEndorsement: uc,
	subcontractor: lc,
	crew: cc,
	regoPlate: sc,
	regoStatus: ac,
	ctpStatus: oc,
	serviceDue: ic,
	fuelCard: rc,
	odometer: tc,
	customerType: Ys,
	strataPlan: ec,
	lotPlan: $s,
	councilLga: Qs,
	regionClassifier: Zs,
	suburbPostcodeAu: Xs,
	emailThread: tl
};
//#endregion
//#region \0@oxc-project+runtime@0.137.0/helpers/esm/typeof.js
function rl(e) {
	"@babel/helpers - typeof";
	return rl = typeof Symbol == "function" && typeof Symbol.iterator == "symbol" ? function(e) {
		return typeof e;
	} : function(e) {
		return e && typeof Symbol == "function" && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e;
	}, rl(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.137.0/helpers/esm/toPrimitive.js
function il(e, t) {
	if (rl(e) != "object" || !e) return e;
	var n = e[Symbol.toPrimitive];
	if (n !== void 0) {
		var r = n.call(e, t || "default");
		if (rl(r) != "object") return r;
		throw TypeError("@@toPrimitive must return a primitive value.");
	}
	return (t === "string" ? String : Number)(e);
}
//#endregion
//#region \0@oxc-project+runtime@0.137.0/helpers/esm/toPropertyKey.js
function al(e) {
	var t = il(e, "string");
	return rl(t) == "symbol" ? t : t + "";
}
//#endregion
//#region \0@oxc-project+runtime@0.137.0/helpers/esm/defineProperty.js
function Q(e, t, n) {
	return (t = al(t)) in e ? Object.defineProperty(e, t, {
		value: n,
		enumerable: !0,
		configurable: !0,
		writable: !0
	}) : e[t] = n, e;
}
//#endregion
//#region src/controllers/grid_controller.js
var ol = 32, sl = 100, cl = "<svg viewBox=\"0 0 640 640\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.2 297.3z\"/></svg>", ll = "<svg viewBox=\"0 0 640 640\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M64 157.7C64 141.3 77.3 128 93.7 128L546.4 128C562.8 128 576.1 141.3 576.1 157.7C576.1 165.6 573 173.1 567.4 178.7L400 345.9L400 546.3C400 562.7 386.7 576 370.3 576C362.4 576 354.9 572.9 349.3 567.3L247 465C242.5 460.5 240 454.4 240 448L240 345.9L72.7 178.6C67.1 173.1 64 165.5 64 157.7zM137.9 176L281 319C285.5 323.5 288 329.6 288 336L288 438.1L352 502.1L352 336C352 329.6 354.5 323.5 359 319L502 176L137.9 176z\"/></svg>", ul = /* @__PURE__ */ new Set([
	"number",
	"currency",
	"percent",
	"compactNumber",
	"fileSize",
	"duration",
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
function fl(e) {
	let t = String(e ?? "");
	return t === "" ? "" : /[\t\n\r"]/.test(t) ? `"${t.replace(/"/g, "\"\"")}"` : t;
}
function pl(e) {
	let t = [], n = [], r = "", i = !1;
	for (let a = 0; a < e.length; a++) {
		let o = e[a];
		if (i) {
			if (o === "\"") {
				if (e[a + 1] === "\"") {
					r += "\"", a++;
					continue;
				}
				i = !1;
				continue;
			}
			r += o;
		} else {
			if (o === "\"" && r === "") {
				i = !0;
				continue;
			}
			if (o === "	") {
				n.push(r), r = "";
				continue;
			}
			if (o === "\r") continue;
			if (o === "\n") {
				n.push(r), t.push(n), n = [], r = "";
				continue;
			}
			r += o;
		}
	}
	return (r !== "" || n.length > 0) && (n.push(r), t.push(n)), t;
}
var ml = [
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
], hl = class extends t {
	constructor(...e) {
		super(...e), Q(this, "_onDocMouseDown", (e) => {
			this._filterPopover && !this._filterPopover.contains(e.target) && !e.target.closest(".sg-filter-icon") && this._closeFilterPopover();
		}), Q(this, "_isGroupExpanded", (e, t) => {
			if (this._groupExpanded.has(e)) return this._groupExpanded.get(e);
			let n = this.state.group.defaultExpanded;
			return n < 0 ? !0 : t < n;
		}), Q(this, "_onSynthHeaderClick", (e) => {
			let t = e.target.closest("th[data-synth=\"true\"][data-sortable=\"true\"]");
			if (!t || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
			let n = t.getAttribute("data-field");
			n && this.toggleSort(n, e.shiftKey === !0);
		}), Q(this, "_onHeaderContextMenu", (e) => {
			let t = e.target.closest("th[data-field], th[data-header-cell-field-value]");
			if (!t) return;
			let n = t.getAttribute("data-field") || t.getAttribute("data-header-cell-field-value"), r = this._colByField(n);
			!r || r._isCheckbox || r._isRowNumber || r._isGroupCol || r._isPivot || r._isSpacer || (e.preventDefault(), this._showColumnMenu(r, e.clientX, e.clientY));
		}), Q(this, "_onDocMouseDownColumnMenu", (e) => {
			this._columnMenu && !this._columnMenu.contains(e.target) && this._closeColumnMenu();
		}), Q(this, "_onColumnMenuKey", (e) => {
			e.key === "Escape" && (e.stopPropagation(), this._closeColumnMenu());
		}), Q(this, "_onCellDragEnter", (e) => {
			if (!this._isFileDrag(e)) return;
			let t = this._dropTarget(e.target);
			t && (e.preventDefault(), this._dropHotCell && this._dropHotCell !== t.td && this._dropHotCell.classList.remove("sg-drop-target"), t.td.classList.add("sg-drop-target"), this._dropHotCell = t.td);
		}), Q(this, "_onCellDragOver", (e) => {
			if (!this._isFileDrag(e)) return;
			let t = this._dropTarget(e.target);
			t && (e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "copy"), this._dropHotCell !== t.td && (this._dropHotCell?.classList.remove("sg-drop-target"), t.td.classList.add("sg-drop-target"), this._dropHotCell = t.td));
		}), Q(this, "_onCellDragLeave", (e) => {
			this._dropHotCell && !this._dropHotCell.contains(e.relatedTarget) && (this._dropHotCell.classList.remove("sg-drop-target"), this._dropHotCell = null);
		}), Q(this, "_onCellDrop", (e) => {
			if (!this._isFileDrag(e)) return;
			let t = this._dropTarget(e.target);
			if (!t) return;
			e.preventDefault(), this._dropHotCell?.classList.remove("sg-drop-target"), this._dropHotCell = null;
			let n = Array.from(e.dataTransfer?.files || []);
			if (!n.length) return;
			let r = this.state.rowData.find((e) => this._rowId(e) === t.rowId), i = {
				rowId: t.rowId,
				colId: t.colId,
				files: n,
				row: r,
				dataTransfer: e.dataTransfer
			}, a = new CustomEvent("grid:fileAttached", {
				detail: i,
				bubbles: !0,
				cancelable: !0
			});
			if (!this.element.dispatchEvent(a) || !r) return;
			let o = this.attachmentsFieldValue || t.colId, s = Array.isArray(r[o]) ? r[o].slice() : [];
			for (let e of n) {
				let t = "";
				try {
					t = URL.createObjectURL(e);
				} catch {}
				s.push({
					id: `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
					filename: e.name,
					name: e.name,
					byte_size: e.size,
					size: e.size,
					content_type: e.type || "application/octet-stream",
					url: t,
					thumb_url: e.type?.startsWith("image/") ? t : null,
					preview_url: e.type?.startsWith("image/") ? t : null
				});
			}
			r[o] = s, this.scheduleRender("cells"), D(this.element, "grid:cellValueChanged", {
				rowId: t.rowId,
				colId: o,
				oldValue: null,
				newValue: s
			});
		}), Q(this, "_onScroll", () => {
			this.state.scrollTop = this._viewport.scrollTop, (this.virtualValue || this._displayList.pageRows.length > 200) && this.scheduleRender("scroll");
		}), Q(this, "_onCellMouseDown", (e) => {
			if (e.button !== 0) return;
			if (this.rowDragValue) {
				let t = e.target.closest?.("td[data-gutter=\"true\"]");
				if (t) {
					let n = t.closest("tr");
					this._rowDragPending = {
						rowId: this._coerceRowId(n.dataset.rowId),
						x: e.clientX,
						y: e.clientY
					}, this._rowDragMoved = !1, document.addEventListener("mousemove", this._onRowDragMove);
					return;
				}
			}
			if (e.target.closest?.("[data-tree-toggle=\"true\"]")) return;
			let t = this._cellAt(e.target);
			if (!t) return;
			let n = e.metaKey || e.ctrlKey;
			e.shiftKey && this._activeCell() ? this._extendActiveRange(t) : n ? (this._addCellRange(t), this._cellDragging = !0) : (this._setSingleCellSel(t), this._cellDragging = !0), this._cellDragMoved = !1, this._focusGrid(), this._applyCellSelHighlight(), D(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
		}), Q(this, "_onCellMouseOver", (e) => {
			if (!this._cellDragging) return;
			let t = this._cellAt(e.target);
			if (!t) return;
			let n = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
			n && n.focus.rowId === t.rowId && n.focus.colId === t.colId || (this._extendActiveRange(t), this._cellDragMoved = !0, this._applyCellSelHighlight(), D(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
		}), Q(this, "_onCellMouseUp", () => {
			this._cellDragging = !1, this._rowDragPending && (document.removeEventListener("mousemove", this._onRowDragMove), this._rowDrag && this._finishRowDrag(), this._rowDragPending = null);
		}), Q(this, "_onRowDragMove", (e) => {
			let t = this._rowDragPending;
			if (t) {
				if (!this._rowDrag) {
					if (Math.abs(e.clientY - t.y) < 5 && Math.abs(e.clientX - t.x) < 5) return;
					this._startRowDrag(t.rowId);
				}
				this._rowDrag && (this._rowDragMoved = !0, this._rowDrag.ghost.style.left = `${e.clientX + 14}px`, this._rowDrag.ghost.style.top = `${e.clientY + 10}px`, this._updateDropIndicator(e.clientY));
			}
		}), Q(this, "_onCopy", (e) => {
			if (this.state.editing) return;
			let t = document.activeElement;
			if (t && /^(input|textarea|select)$/i.test(t.tagName) && !this.element.contains(t)) return;
			let n = this._activeRect();
			if (!n) return;
			let r = this._cellRangeRows(n);
			if (!r.length) return;
			let i = r.length === 1 && r[0].length === 1 ? String(r[0][0] ?? "") : r.map((e) => e.map((e) => fl(e)).join("	")).join("\n");
			i !== "" && (e.clipboardData?.setData("text/plain", i), e.preventDefault());
		}), Q(this, "_onPaste", (e) => {
			if (!this.cellSelectionValue || this.state.editing) return;
			let t = document.activeElement;
			if (t && /^(input|textarea|select)$/i.test(t.tagName) && !this.element.contains(t)) return;
			let n = this._activeRect();
			if (!n) return;
			let r = e.clipboardData?.getData("text/plain");
			if (r == null || r === "") return;
			e.preventDefault();
			let i = pl(r);
			if (!i.length || (i.length > 1 && i[i.length - 1].length === 1 && i[i.length - 1][0] === "" && i.pop(), !i.length)) return;
			let a = i.length === 1 && i[0].length === 1, o = a ? n.r1 - n.r0 + 1 : i.length, s = a ? n.c1 - n.c0 + 1 : i[0].length, c = n.rows, l = n.cols, u = [], d = !1;
			for (let e = 0; e < o; e++) {
				let t = n.r0 + e;
				if (t >= c.length) break;
				let r = c[t];
				if (!r || r.__sgGroup || r.__sgDetail || r.__sgSeparator) continue;
				let o = a ? i[0] : i[e];
				for (let e = 0; e < s; e++) {
					let t = n.c0 + e;
					if (t >= l.length) break;
					let i = l[t];
					if (!i) continue;
					if (!i.editable || i._isCheckbox || i._isRowNumber || i._isGroupCol || i._isMasterExpand || i._isSpacer) {
						u.push({
							rowId: this._rowId(r),
							colId: i.field || "",
							reason: "not-editable"
						});
						continue;
					}
					let s = a ? o[0] : o[e] ?? "", c = this._parsePasteValue(s, r, i);
					if (c === void 0) {
						u.push({
							rowId: this._rowId(r),
							colId: i.field,
							reason: "parse-failed",
							text: s
						});
						continue;
					}
					let f = r[i.field];
					c !== f && (r[i.field] = c, d = !0, D(this.element, "grid:cellValueChanged", {
						rowId: this._rowId(r),
						colId: i.field,
						oldValue: f,
						newValue: c,
						source: "paste"
					}));
				}
			}
			d && this.scheduleRender("cells"), (u.length || d) && D(this.element, "grid:pasteApplied", {
				appliedCount: +!!d,
				rejectedCount: u.length
			}), u.length && D(this.element, "grid:pasteRejected", { rejected: u });
		}), Q(this, "_onGridKeydown", (e) => {
			if (!this.cellSelectionValue || this.state.editing) return;
			let t = document.activeElement;
			if (t && /^(input|textarea|select)$/i.test(t.tagName) && this.element.contains(t)) return;
			let n = e.key, r = e.metaKey || e.ctrlKey;
			if (r && n.toLowerCase() === "a") {
				e.preventDefault(), this.rowSelectionValue === "" ? this._selectAllCells() : (this.clearCellSelection(), this.deselectAll(), this.selectAll());
				return;
			}
			if (r) return;
			let i = {
				ArrowUp: [-1, 0],
				ArrowDown: [1, 0],
				ArrowLeft: [0, -1],
				ArrowRight: [0, 1]
			};
			if (i[n]) {
				e.preventDefault();
				let [t, r] = i[n];
				this._moveActiveCell(t, r, e.shiftKey);
				return;
			}
			if (n === "Tab") {
				e.preventDefault(), this._moveActiveCell(0, e.shiftKey ? -1 : 1, !1);
				return;
			}
			if (n === "Enter") {
				let t = this._activeCell();
				t && (e.preventDefault(), this.startEditingCell(t.rowId, t.colId));
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
				let t = this._activeCell();
				if (!t) return;
				let r = this._colByField(t.colId);
				if (!r || !r.editable) return;
				e.preventDefault(), this.startEditingCell(t.rowId, t.colId, n);
			}
		}), Q(this, "_onEditorKey", (e) => {
			this.state.editing && (e.key === "Enter" ? (e.preventDefault(), this.stopEditing(!1)) : e.key === "Escape" ? (e.preventDefault(), this.stopEditing(!0)) : e.key === "Tab" && (e.preventDefault(), this._tabToEditableCell(e.shiftKey ? -1 : 1)));
		}), Q(this, "_onEditorBlur", () => {
			this._navigatingEditor || this.state.editing && this.stopEditing(!1);
		}), Q(this, "_isTreeRowExpanded", (e, t) => {
			let n = String(e);
			if (this._treeExpanded.has(n)) return this._treeExpanded.get(n);
			let r = this.state.tree?.defaultExpanded ?? -1;
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
			cellSel: {
				ranges: [],
				activeIdx: -1
			},
			editing: null,
			pagination: {
				enabled: !1,
				page: 0,
				pageSize: sl
			},
			scrollTop: 0,
			viewportHeight: 400,
			group: {
				cols: [],
				aggs: {},
				defaultExpanded: -1
			}
		}, this._displayList = {
			filteredSorted: [],
			pageRows: [],
			total: 0,
			totalPages: 1,
			page: 0
		}, this._renderPending = !1, this._dirty = /* @__PURE__ */ new Set(), this._lastRenderedRowIds = /* @__PURE__ */ new Set(), this._runtimeOverrides = Object.create(null), this._groupExpanded = /* @__PURE__ */ new Map(), this._detailExpanded = /* @__PURE__ */ new Set(), this._detailGrids = /* @__PURE__ */ new Map(), this._treeExpanded = /* @__PURE__ */ new Map();
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
		}, this._captureInitialMarkup(), this._buildChrome(), this.element.gridApi = oe(this), queueMicrotask(() => this._initialLoad());
	}
	disconnect() {
		this.element.gridApi = null, this.element.removeEventListener("keydown", this._onGridKeydown), document.removeEventListener("mouseup", this._onCellMouseUp), document.removeEventListener("copy", this._onCopy), document.removeEventListener("paste", this._onPaste), document.removeEventListener("mousemove", this._onRowDragMove), this._thead?.removeEventListener("contextmenu", this._onHeaderContextMenu), this._thead?.removeEventListener("click", this._onSynthHeaderClick), this._tbody?.removeEventListener("dragenter", this._onCellDragEnter), this._tbody?.removeEventListener("dragover", this._onCellDragOver), this._tbody?.removeEventListener("dragleave", this._onCellDragLeave), this._tbody?.removeEventListener("drop", this._onCellDrop), this._closeColumnMenu(), this._teardownPersistence(), this._rowDrag?.ghost?.remove(), this._rowDrag?.indicator?.remove(), this._resizeObserver?.disconnect(), this._resizeObserver = null;
	}
	_captureInitialMarkup() {
		let e = this.element.querySelector("tbody");
		e && (this._initialBodyHTML = e.innerHTML, this._initialRows = Array.from(e.querySelectorAll("tr")).map((e, t) => {
			if (e.hasAttribute("data-separator")) {
				let t = e.getAttribute("data-separator"), n = { __sgSeparator: !0 };
				t && t !== "" && t !== "true" && (n.variant = t);
				let r = e.getAttribute("data-label"), i = e.getAttribute("data-value");
				return r != null && (n.label = r), i != null && (n.value = i), n;
			}
			let n = {}, r = e.getAttribute("data-row-id") || e.getAttribute("data-row-row-id-value");
			n[this.getRowIdValue] = r == null ? t + 1 : this._coerceRowId(r);
			let i = {};
			e.querySelectorAll("td").forEach((e) => {
				let t = e.getAttribute("data-cell-col-id-value") || e.getAttribute("data-col-id");
				if (!t) return;
				let r = e.getAttribute("data-cell-value");
				if (r != null) try {
					n[t] = JSON.parse(r);
				} catch {
					n[t] = r;
				}
				else n[t] = e.textContent.trim();
				let a = Number(e.getAttribute("data-spans") || e.getAttribute("colspan") || 1);
				a > 1 && (i[t] = a);
			}), Object.keys(i).length && (n.__sgSpans = i);
			let a = e.getAttribute("data-row-detail-rows-value");
			if (a && this.detailRowsKeyValue) try {
				n[this.detailRowsKeyValue] = JSON.parse(a);
			} catch {}
			return n;
		}), e.innerHTML = ""), this._initialHead = this.element.querySelector("thead");
	}
	_buildChrome() {
		let e = this.element.querySelector("table");
		if (!e) {
			e = E("table");
			let t = E("thead");
			e.appendChild(t), this.element.appendChild(e);
		}
		let t = e.querySelector("tbody");
		if (t || (t = E("tbody"), e.appendChild(t)), t.dataset.gridTarget = "body", this._tbody = t, this._table = e, this._thead = e.querySelector("thead"), e.parentElement.classList.contains("sg-body-viewport")) this._viewport = e.parentElement;
		else {
			let t = E("div", { class: "sg-body-viewport" });
			e.parentNode.insertBefore(t, e), t.appendChild(e), this._viewport = t;
		}
		if (this.domLayoutValue === "autoHeight" && (this._viewport.style.overflow = "visible", this.element.style.height = "auto"), this._footer = null, this.statusBarValue ? (this._statusBar = E("div", {
			class: "sg-status-bar",
			role: "status"
		}), this._statusBar.append(E("div", { class: "sg-status-section sg-status-left" }), E("div", { class: "sg-status-section sg-status-right" })), this.element.appendChild(this._statusBar), this._lastRangeAggs = null) : this._statusBar = null, this.sidePanelValue) {
			let e = E("div", { class: "sg-main" });
			this._viewport.parentNode.insertBefore(e, this._viewport), e.appendChild(this._viewport), this._statusBar && e.appendChild(this._statusBar), this._main = e, this._sidePanel = E("aside", {
				class: "sg-side-panel",
				"data-controller": "side-panel"
			}), this.element.appendChild(this._sidePanel), this.element.classList.add("sg-has-side-panel");
		} else this._main = null, this._sidePanel = null;
		this._thead?.addEventListener("contextmenu", this._onHeaderContextMenu), this._thead?.addEventListener("click", this._onSynthHeaderClick), typeof ResizeObserver < "u" && this._viewport && (this._resizeObserver = new ResizeObserver(() => {
			this._table?.isConnected && this._renderColgroup(this._visibleCols());
		}), this._resizeObserver.observe(this._viewport));
	}
	async _initialLoad() {
		if (this.rowDataValue && this.rowDataValue.length > 0) this.state.rowData = this.rowDataValue;
		else if (this.rowDataUrlValue) try {
			let e = await fetch(this.rowDataUrlValue);
			this.state.rowData = await e.json();
		} catch (e) {
			console.error("[stimulus_grid] failed to fetch rowDataUrl", e), this.state.rowData = [];
		}
		else this._initialRows && this._initialRows.length > 0 && (this.state.rowData = this._initialRows);
		this._dirty.add("data"), this._dirty.add("columns"), this._render(), this._attachBodyListeners(), this._restorePersistedState(), this._setupPersistence(), D(this.element, "grid:ready", { api: this.element.gridApi }), D(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
	}
	openFilterFor(e, t) {
		let n = this._colByField(e);
		if (!(!n || !n.filter) && (this._closeFilterPopover(), !vl())) {
			this._openFallbackFilterPopover(n, t);
			return;
		}
	}
	_closeFilterPopover() {
		this._filterPopover && (this._filterPopover.remove(), this._filterPopover = null, document.removeEventListener("mousedown", this._onDocMouseDown));
	}
	_openFallbackFilterPopover(e, t) {
		let n = this.state.filterModel[e.field] || {}, r = _l(e.filter), i = E("div", { class: "sg-filter-popover" }), a = E("select");
		r.forEach((e) => a.append(new Option(e.label, e.value, !1, e.value === n.type)));
		let o = e.filter === "number" ? "number" : e.filter === "date" ? "date" : "text", s = E("input", {
			type: o,
			value: n.value ?? ""
		}), c = E("input", {
			type: o,
			value: n.value2 ?? "",
			style: { display: "none" }
		}), l = () => {
			let e = a.value, t = e === "inRange", n = !(e === "blank" || e === "notBlank");
			s.style.display = n ? "" : "none", c.style.display = t ? "" : "none";
		};
		a.addEventListener("change", l), l();
		let u = E("div", { class: "sg-filter-actions" }), d = E("button", { type: "button" }, "Clear"), f = E("button", {
			type: "button",
			class: "primary"
		}, "Apply");
		u.append(d, f), d.addEventListener("click", () => {
			this.setColumnFilter(e.field, null), this._closeFilterPopover();
		}), f.addEventListener("click", () => {
			let t = a.value, n = t === "blank" || t === "notBlank" ? {
				filterType: e.filter,
				type: t
			} : {
				filterType: e.filter,
				type: t,
				value: s.value,
				value2: c.value || void 0
			};
			this.setColumnFilter(e.field, n), this._closeFilterPopover();
		}), i.append(E("label", {}, "Condition"), a, s, c, u), document.body.appendChild(i);
		let p = t.getBoundingClientRect();
		i.style.left = `${p.left + window.scrollX}px`, i.style.top = `${p.bottom + window.scrollY + 2}px`, this._filterPopover = i, document.addEventListener("mousedown", this._onDocMouseDown), s.focus();
	}
	registerColumn(e, t) {
		let n = this.state.columnDefs.findIndex((t) => t.field === e.field), r = this._runtimeOverrides[e.field] || {}, i = n >= 0 ? this.state.columnDefs[n] : null, a = i ? {
			...i.hidden == null ? {} : { hidden: i.hidden },
			...i.pinned ? { pinned: i.pinned } : {},
			...i.width == null ? {} : { width: i.width }
		} : {}, o = {
			...e,
			...r,
			...a,
			_headerEl: t
		};
		if (n >= 0) {
			let e = this.state.columnDefs[n];
			if (e._headerEl === t && gl(e, o)) return;
			this.state.columnDefs[n] = o;
		} else this.state.columnDefs.push(o);
		this.scheduleRender("columns");
	}
	unregisterColumn(e) {
		this._thead?.querySelector(`th[data-header-cell-field-value="${$(e)}"]`) || (this.state.columnDefs = this.state.columnDefs.filter((t) => t.field !== e), this.scheduleRender("columns"));
	}
	toggleSort(e, t = !1) {
		let n = this.state.sortModel.findIndex((t) => t.colId === e), r;
		r = n === -1 ? {
			colId: e,
			sort: "asc"
		} : this.state.sortModel[n].sort === "asc" ? {
			colId: e,
			sort: "desc"
		} : null, t ? (n >= 0 && this.state.sortModel.splice(n, 1), r && this.state.sortModel.push(r)) : this.state.sortModel = r ? [r] : [], this.scheduleRender("sort"), D(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
	}
	setSortModel(e) {
		this.state.sortModel = Array.isArray(e) ? e.slice() : [], this.scheduleRender("sort"), D(this.element, "grid:sortChanged", { sortModel: this.state.sortModel });
	}
	setColumnFilter(e, t) {
		t == null ? delete this.state.filterModel[e] : this.state.filterModel[e] = t, this.state.pagination.page = 0, this.scheduleRender("filter"), D(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
	}
	setFilterModel(e) {
		this.state.filterModel = { ...e || {} }, this.state.pagination.page = 0, this.scheduleRender("filter"), D(this.element, "grid:filterChanged", { filterModel: { ...this.state.filterModel } });
	}
	setQuickFilter(e) {
		let t = e == null ? "" : String(e);
		t !== this.state.quickFilter && (this.state.quickFilter = t, this.state.pagination.page = 0, this.scheduleRender("filter"), D(this.element, "grid:filterChanged", {
			filterModel: { ...this.state.filterModel },
			quickFilter: t
		}));
	}
	getQuickFilter() {
		return this.state.quickFilter;
	}
	toggleRowSelection(e, t = "single") {
		if (this.rowSelectionValue === "") return;
		let n = this.state.selection;
		this.rowSelectionValue === "single" ? (n.clear(), n.add(e)) : t === "range" && this._lastSelectedId != null ? this._selectRange(this._lastSelectedId, e) : t === "toggle" ? n.has(e) ? n.delete(e) : n.add(e) : (n.clear(), n.add(e)), this._lastSelectedId = e, this.scheduleRender("selection"), D(this.element, "grid:selectionChanged", {
			selectedRows: this.getSelectedRows(),
			selectedIds: Array.from(n)
		});
	}
	setSelected(e, t) {
		t ? this.state.selection.add(e) : this.state.selection.delete(e), this.scheduleRender("selection"), D(this.element, "grid:selectionChanged", {
			selectedRows: this.getSelectedRows(),
			selectedIds: Array.from(this.state.selection)
		});
	}
	selectAll() {
		this._displayList.filteredSorted.forEach((e) => {
			!e.__sgGroup && !e.__sgSeparator && this.state.selection.add(this._rowId(e));
		}), this.scheduleRender("selection"), D(this.element, "grid:selectionChanged", {
			selectedRows: this.getSelectedRows(),
			selectedIds: Array.from(this.state.selection)
		});
	}
	deselectAll() {
		this.state.selection.clear(), this.scheduleRender("selection"), D(this.element, "grid:selectionChanged", {
			selectedRows: [],
			selectedIds: []
		});
	}
	getSelectedRows() {
		let e = this.state.selection;
		return this.state.rowData.filter((t) => e.has(this._rowId(t)));
	}
	_selectRange(e, t) {
		let n = this._displayList.filteredSorted, r = n.findIndex((t) => this._rowId(t) === e), i = n.findIndex((e) => this._rowId(e) === t);
		if (r < 0 || i < 0) return;
		let [a, o] = r <= i ? [r, i] : [i, r];
		for (let e = a; e <= o; e++) !n[e].__sgGroup && !n[e].__sgSeparator && this.state.selection.add(this._rowId(n[e]));
	}
	goToPage(e) {
		let t = this.totalPages() - 1;
		this.state.pagination.page = Math.max(0, Math.min(e, t)), this.scheduleRender("page"), D(this.element, "grid:paginationChanged", {
			page: this.state.pagination.page,
			pageSize: this.state.pagination.pageSize,
			totalPages: this.totalPages()
		});
	}
	setPageSize(e) {
		this.state.pagination.pageSize = Math.max(1, e), this.state.pagination.page = 0, this.scheduleRender("page"), D(this.element, "grid:paginationChanged", {
			page: 0,
			pageSize: this.state.pagination.pageSize,
			totalPages: this.totalPages()
		});
	}
	totalPages() {
		if (!this.state.pagination.enabled) return 1;
		let e = this.filteredCount();
		return Math.max(1, Math.ceil(e / this.state.pagination.pageSize));
	}
	filteredCount() {
		if (this.state.serverSide) return this.state.serverRowCount;
		let e = Object.fromEntries(this.state.columnDefs.map((e) => [e.field, e])), t = this.state.columnDefs.filter((e) => !e.hidden && !e._isCheckbox), n = l(this.state.rowData, this.state.filterModel, e);
		return n = u(n, this.state.quickFilter, t), n.length;
	}
	setRowCount(e) {
		this.state.serverRowCount = Math.max(0, Number(e) || 0), this.scheduleRender("page");
	}
	lastPageIndex() {
		return this.totalPages() - 1;
	}
	startEditingCell(e, t, r = void 0) {
		let i = this.state.columnDefs.find((e) => e.field === t);
		if (!i || !i.editable) return;
		let a = this.state.rowData.find((t) => this._rowId(t) === e);
		a && (this.state.editing = {
			rowId: e,
			colId: t,
			originalValue: n(a, i),
			initialValue: r
		}, this.scheduleRender("cells"));
	}
	stopEditing(e = !1) {
		if (!this.state.editing) return;
		let { rowId: t, colId: n, originalValue: r, draftValue: i } = this.state.editing, a = this._tbody.querySelector(`tr[data-row-id="${$(t)}"] td[data-col-id="${$(n)}"]`), o = r;
		if (!e && a) {
			let e = a.firstElementChild, t = e?.matches?.("[data-editor-input],input,select,textarea") ? e : a.querySelector("[data-editor-input]") || a.querySelector("input,select,textarea");
			t ? o = yl(t.value, this._colByField(n)?.type) : i !== void 0 && (o = i);
		}
		if (this.state.editing = null, !e && o !== r) {
			let e = this.state.rowData.find((e) => this._rowId(e) === t), r = e[n];
			e[n] = o, D(this.element, "grid:cellValueChanged", {
				rowId: t,
				colId: n,
				oldValue: r,
				newValue: o
			});
		}
		this.scheduleRender("cells");
	}
	setColumnVisible(e, t) {
		let n = this._colByField(e);
		n && (n.hidden = !t, this._runtimeOverrides[e] = {
			...this._runtimeOverrides[e] || {},
			hidden: !t
		}, this.scheduleRender("columns"), D(this.element, "grid:columnVisible", {
			colId: e,
			visible: t
		}));
	}
	setColumnPinned(e, t) {
		let n = this._colByField(e);
		if (!n) return;
		let r = t || null;
		n.pinned = r, this._runtimeOverrides[e] = {
			...this._runtimeOverrides[e] || {},
			pinned: r
		}, this._reorderForPinning(), this.scheduleRender("columns"), D(this.element, "grid:columnPinned", {
			colId: e,
			pinned: r
		});
	}
	setColumnWidth(e, t) {
		let n = this._colByField(e);
		if (!n) return;
		let r = Math.max(n.minWidth || 40, Math.min(n.maxWidth || 4e3, t));
		n.width = r, this._runtimeOverrides[e] = {
			...this._runtimeOverrides[e] || {},
			width: r
		}, this.scheduleRender("columns"), D(this.element, "grid:columnResized", {
			colId: e,
			width: r
		});
	}
	moveColumn(e, t) {
		let n = this.state.columnDefs.findIndex((t) => t.field === e);
		if (n < 0 || n === t) return;
		let [r] = this.state.columnDefs.splice(n, 1);
		this.state.columnDefs.splice(t, 0, r), this.scheduleRender("columns"), D(this.element, "grid:columnMoved", {
			colId: e,
			fromIndex: n,
			toIndex: t
		});
	}
	autoSizeColumn(e) {
		let t = this._colByField(e);
		if (!t) return;
		let n = $(e), i = this._thead?.querySelector(`th[data-header-cell-field-value="${n}"], th[data-field="${n}"]`), a = Array.from(this._tbody?.querySelectorAll(`td[data-col-id="${n}"]`) || []).filter((e) => !e.closest("tr")?.classList?.contains("sg-spacer")), o = 0;
		if ((i || a.length) && (o = this._measureColumnContentWidth(i, a)), !o) {
			let e = (t.headerName || t.field || "").length, n = this.state.rowData.slice(0, 200), i = e;
			for (let e of n) {
				let n = String(r(e, t) ?? "").length;
				n > i && (i = n);
			}
			o = i * 8;
		}
		this.setColumnWidth(e, Math.min(400, Math.max(60, o + 16)));
	}
	_measureColumnContentWidth(e, t, n = 50) {
		let r = document.createElement("table");
		r.style.cssText = "position:absolute;left:-9999px;top:-9999px;visibility:hidden;table-layout:auto;width:auto;border-collapse:separate;border-spacing:0;";
		let i = document.createElement("tbody");
		r.appendChild(i);
		let a = (e) => {
			if (!e) return;
			let t = document.createElement("tr"), n = e.cloneNode(!0);
			n.removeAttribute("style"), n.removeAttribute("data-controller"), n.querySelectorAll("[data-controller]").forEach((e) => e.removeAttribute("data-controller")), t.appendChild(n), i.appendChild(t);
		};
		if (a(e), t.slice(0, n).forEach(a), !i.children.length) return 0;
		this.element.appendChild(r);
		let o = 0;
		for (let e of i.children) {
			let t = e.firstElementChild;
			t && t.offsetWidth > o && (o = t.offsetWidth);
		}
		return this.element.removeChild(r), o;
	}
	sizeColumnsToFit() {
		let e = this._viewport?.clientWidth || this.element.clientWidth || 0;
		if (!e) return;
		let t = this._visibleCols().filter((e) => !e._isSpacer), n = t.reduce((e, t) => e + (t.width || 150), 0);
		if (n === 0) return;
		let r = e / n;
		t.forEach((e) => {
			e.width = Math.max(e.minWidth || 40, Math.floor((e.width || 150) * r));
		}), this.scheduleRender("columns");
	}
	_reorderForPinning() {
		let e = this.state.columnDefs.filter((e) => e.pinned === "left"), t = this.state.columnDefs.filter((e) => e.pinned === "right"), n = this.state.columnDefs.filter((e) => !e.pinned);
		this.state.columnDefs = [
			...e,
			...n,
			...t
		];
	}
	setRowData(e) {
		let t = Array.isArray(e) ? e : [], n = this.getRowIdValue;
		t.forEach((e, t) => {
			e && (e[n] === void 0 || e[n] === null || e[n] === "") && (e[n] = t + 1);
		}), this.state.rowData = t, this.state.selection.clear(), this.state.serverSide || (this.state.pagination.page = 0), this.scheduleRender("data"), D(this.element, "grid:rowDataChanged", { rows: this.state.rowData });
	}
	applyTransaction(e) {
		let t = [], n = [], r = [], i = new Map(this.state.rowData.map((e) => [this._rowId(e), e]));
		return (e.remove || []).forEach((e) => {
			let t = this._rowId(e);
			i.delete(t) && r.push(e);
		}), (e.update || []).forEach((e) => {
			let t = this._rowId(e);
			i.has(t) && (i.set(t, {
				...i.get(t),
				...e
			}), n.push(e));
		}), (e.add || []).forEach((e) => {
			let n = this._rowId(e);
			i.has(n) || (i.set(n, e), t.push(e));
		}), this.state.rowData = Array.from(i.values()), this.scheduleRender("data"), D(this.element, "grid:rowDataChanged", { rows: this.state.rowData }), {
			added: t,
			updated: n,
			removed: r
		};
	}
	setColumnDefs(e) {
		this.state.columnDefs = e.map((e) => ({ ...e })), this.scheduleRender("columns");
	}
	refresh() {
		this.scheduleRender("cells");
	}
	getDataAsCsv({ columnSeparator: e = ",", onlySelected: t = !1 } = {}) {
		let n = this.state.columnDefs.filter((e) => !e.hidden && !e._isCheckbox), i = (t ? this.getSelectedRows() : this._displayList.filteredSorted).filter((e) => !e.__sgGroup && !e.__sgDetail && !e.__sgSeparator), a = (e) => /[",\n\r]/.test(e) ? `"${String(e).replace(/"/g, "\"\"")}"` : String(e), o = [n.map((e) => a(e.headerName || e.field)).join(e)];
		for (let t of i) o.push(n.map((e) => a(r(t, e))).join(e));
		return o.join("\n");
	}
	exportDataAsCsv({ fileName: e = "export.csv", ...t } = {}) {
		let n = this.getDataAsCsv(t), r = new Blob([n], { type: "text/csv;charset=utf-8" }), i = URL.createObjectURL(r), a = E("a", {
			href: i,
			download: e
		});
		return document.body.appendChild(a), a.click(), a.remove(), URL.revokeObjectURL(i), n;
	}
	scheduleRender(e) {
		this._dirty.add(e), !this._renderPending && (this._renderPending = !0, requestAnimationFrame(() => {
			this._renderPending = !1, this._render();
		}));
	}
	_render() {
		let e = this._dirty;
		this._dirty = /* @__PURE__ */ new Set(), (e.has("data") || e.has("filter") || e.has("sort") || e.has("page") || e.has("group") || e.has("pivot") || e.has("tree") || e.size === 0) && (this._displayList = ie({
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
			getRowId: (e) => this._rowId(e)
		})), (e.has("columns") || e.has("sort") || e.has("filter") || e.has("selection") || e.has("group") || e.has("pivot") || e.has("tree")) && this._renderHeader(), this._renderBody(), this._renderPagination(), this._renderStatusBar();
	}
	_renderHeader() {
		if (!this._thead) return;
		let e = this._visibleCols(), t = ne(e, this._headerLayoutOpts());
		t.depth > 1 ? this._renderHeaderMultiRow(e, t) : this._renderHeaderSingleRow(e), this._renderColgroup(e);
	}
	_headerLayoutOpts() {
		let e = { columnGroups: this.columnGroupsValue || null };
		return this.state.pivot?.mode && this._displayList?.pivot && (e.pivotCols = (this.state.pivot.cols || []).map((e) => this._colByField(e)).filter(Boolean), e.valueConfigs = Object.entries(this.state.group.aggs || {}).map(([e, t]) => ({
			col: this._colByField(e),
			aggFunc: t
		})).filter((e) => e.col)), e;
	}
	_renderColgroup(e) {
		let t = this._table.querySelector("colgroup");
		t || (t = E("colgroup"), this._table.insertBefore(t, this._thead));
		let n = Array.from(t.children);
		for (e.forEach((e, r) => {
			let i = n[r];
			i || (i = E("col"), t.appendChild(i)), i.style.width = e.width ? e.width + "px" : "";
		}); t.children.length > e.length;) t.lastElementChild.remove();
		let r = e.findIndex((e) => e._isSpacer), i = r >= 0 ? t.children[r] : null, a = e.filter((e) => !e._isSpacer);
		if (a.some((e) => !e.width)) i && (i.style.width = "0px"), this._table.style.width = "100%";
		else {
			let e = a.reduce((e, t) => e + (Number(t.width) || 0), 0), t = this._viewport?.clientWidth || 0, n = t && e < t ? t - e : 0;
			i && (i.style.width = n + "px"), this._table.style.width = e + n + "px";
		}
	}
	_renderHeaderSingleRow(e) {
		if (this._thead.children.length > 1) {
			let e = this._thead.firstElementChild;
			for (let t = 1; t < this._thead.children.length; t++) {
				let n = this._thead.children[t];
				Array.from(n.children).forEach((t) => {
					(t.hasAttribute("data-header-cell-field-value") || t.hasAttribute("data-field")) && e.appendChild(t);
				});
			}
			for (; this._thead.children.length > 1;) this._thead.lastElementChild.remove();
		}
		let t = this._thead.querySelector("tr") || (() => {
			let e = E("tr");
			return this._thead.appendChild(e), e;
		})(), n = /* @__PURE__ */ new Map();
		Array.from(this._thead.querySelectorAll("th")).forEach((e) => {
			let t = e.getAttribute("data-header-cell-field-value") || e.getAttribute("data-field");
			t && n.set(t, e);
		});
		let r = new Set(e.map((e) => e.field)), i = this.state.columnDefs.filter((e) => !r.has(e.field)), a = [...e, ...i], o = Array.from(t.children).map((e) => e.getAttribute("data-header-cell-field-value") || e.getAttribute("data-field")).filter(Boolean), s = a.map((e) => e.field);
		if (o.length === s.length && o.every((e, t) => e === s[t])) Array.from(t.children).forEach((e) => {
			e.removeAttribute("rowspan"), e.removeAttribute("colspan");
		});
		else {
			let e = [];
			for (let t of a) {
				let r = n.get(t.field);
				r ? (r.removeAttribute("rowspan"), r.removeAttribute("colspan")) : r = E("th", {
					"data-field": t.field,
					"data-synth": "true"
				}, [E("div", { class: "sg-header-content" }, [E("span", { class: "sg-header-label" }, t.headerName || t.field || "")])]), e.push(r);
			}
			t.replaceChildren(...e);
		}
		Array.from(t.children).forEach((e) => {
			let t = e.getAttribute("data-header-cell-field-value") || e.getAttribute("data-field");
			t != null && (e.style.display = r.has(t) ? "" : "none");
		});
		let c = this._pinOffsets();
		for (let n of e) {
			let e = t.querySelector(`th[data-header-cell-field-value="${$(n.field)}"]`) || t.querySelector(`th[data-field="${$(n.field)}"]`);
			e && this._applyLeafThState(e, n, c);
		}
	}
	_renderHeaderMultiRow(e, t) {
		let n = /* @__PURE__ */ new Map();
		Array.from(this._thead.querySelectorAll("th")).forEach((e) => {
			let t = e.getAttribute("data-header-cell-field-value") || e.getAttribute("data-field");
			t && n.set(t, e);
		});
		let r = [], i = new Set(e.map((e) => e.field)), a = this._pinOffsets();
		for (let e of t.rows) {
			let t = E("tr");
			for (let r of e) {
				if (r.kind === "group") {
					t.appendChild(E("th", {
						class: "sg-header-group",
						colspan: String(r.colspan),
						"data-group-header": "true"
					}, r.label || ""));
					continue;
				}
				let e = r.col, i = n.get(e.field);
				if (i || (i = E("th", {
					"data-field": e.field,
					"data-synth": "true"
				}, [E("div", { class: "sg-header-content" }, [E("span", { class: "sg-header-label" }, r.label || e.headerName || e.field || "")])])), r.label) {
					let e = i.querySelector(".sg-header-label");
					e && e.textContent !== r.label && (e.textContent = r.label);
				}
				i.setAttribute("rowspan", String(r.rowspan)), i.removeAttribute("colspan"), i.style.display = "", t.appendChild(i), this._applyLeafThState(i, e, a);
			}
			r.push(t);
		}
		let o = /* @__PURE__ */ new Set();
		t.rows.forEach((e) => e.forEach((e) => {
			e.kind === "leaf" && o.add(e.col.field);
		}));
		let s = this.state.columnDefs.filter((e) => !i.has(e.field) && !o.has(e.field));
		if (s.length) {
			let e = E("tr", { class: "sg-hidden-header-row" });
			for (let t of s) {
				let r = n.get(t.field);
				r || (r = E("th", {
					"data-field": t.field,
					"data-synth": "true"
				})), r.removeAttribute("rowspan"), r.removeAttribute("colspan"), e.appendChild(r);
			}
			r.push(e);
		}
		this._thead.replaceChildren(...r);
	}
	_applyLeafThState(e, t, n) {
		let r = this.state.sortModel.find((e) => e.colId === t.field);
		se(e, {
			"data-sortable": t.sortable ? "true" : null,
			"data-filterable": t.filter ? "true" : null,
			"data-filter-active": this.state.filterModel[t.field] ? "true" : null,
			"data-sort": r?.sort || null,
			"data-pinned": t.pinned || null,
			"data-type": t.type && t.type !== "text" ? t.type : null,
			"data-align": this._columnAlignment(t)
		}), t.width && (e.style.width = t.width + "px"), e.style.left = t.pinned === "left" ? n.left[t.field] + "px" : "", e.style.right = t.pinned === "right" ? n.right[t.field] + "px" : "", this._ensureHeaderChrome(e, t, r);
	}
	_columnAlignment(e) {
		if (e.headerAlign) return e.headerAlign;
		if (e.align) return e.align;
		if (e.type === "number") return "right";
		let t = e.cellRenderer;
		return typeof t == "string" && ul.has(t) ? "right" : null;
	}
	_ensureHeaderChrome(e, t, n) {
		if (t._isSpacer) {
			e.classList.add("sg-spacer-header"), e.textContent = "";
			return;
		}
		if (t._isRowNumber) {
			e.classList.add("sg-gutter-header"), e.textContent = "";
			return;
		}
		if (t._isCheckbox) {
			e.classList.add("sg-checkbox-header");
			let t = e.querySelector("input[type=\"checkbox\"]");
			t || (t = E("input", {
				type: "checkbox",
				"aria-label": "Select all"
			}), t.addEventListener("change", (e) => {
				e.target.checked ? this.selectAll() : this.deselectAll();
			}), e.textContent = "", e.appendChild(t));
			let n = this._displayList.filteredSorted.length, r = this.state.selection.size;
			t.checked = r > 0 && r >= n, t.indeterminate = r > 0 && r < n;
			return;
		}
		let r = e.querySelector(".sg-header-content");
		if (!r) {
			let n = e.textContent.trim();
			e.textContent = "", r = E("div", { class: "sg-header-content" }, [E("span", { class: "sg-header-label" }, n || t.headerName || t.field || "")]), e.appendChild(r);
		}
		let i = r.querySelector(".sg-sort-icon");
		if (t.sortable) if (i || (i = E("span", {
			class: "sg-sort-icon",
			"aria-hidden": "true"
		}), i.innerHTML = cl, r.appendChild(i)), n && this.state.sortModel.length > 1) {
			let e = r.querySelector(".sg-sort-index");
			e || (e = E("span", { class: "sg-sort-index" }), r.appendChild(e)), e.textContent = String(this.state.sortModel.indexOf(n) + 1);
		} else r.querySelector(".sg-sort-index")?.remove();
		else i && i.remove();
		let a = r.querySelector(".sg-filter-icon");
		t.filter ? a || (a = E("span", {
			class: "sg-filter-icon",
			"data-action": "click->header-cell#openFilter",
			title: "Filter"
		}), a.innerHTML = ll, r.appendChild(a)) : a && a.remove(), t.resizable !== !1 && !e.querySelector(".sg-resize-handle") && !t._isCheckbox && e.appendChild(E("span", {
			class: "sg-resize-handle",
			"data-action": "mousedown->header-cell#startResize dblclick->header-cell#autosizeColumn",
			title: "Drag to resize · Double-click to fit"
		}));
	}
	_renderBody() {
		if (!this._tbody) return;
		let e = this._visibleCols(), t = this._withDetailRows(this._displayList.pageRows);
		this._selKeys = this._computeCellSelKeys();
		let n = !this.masterDetailValue && (this.virtualValue || t.length > 200), r = t, i = 0;
		if (n) {
			let e = this._viewport?.clientHeight || 400, n = this.state.rowHeight, a = ae(this.state.scrollTop, e, n, t.length, 8);
			i = a.first, r = t.slice(a.first, a.last);
		}
		let a = /* @__PURE__ */ new Map();
		Array.from(this._tbody.children).forEach((e) => {
			let t = e.dataset.rowId;
			t != null && a.set(t, e);
		});
		let o = document.createDocumentFragment(), s = this.state.pagination.enabled ? this.state.pagination.page * this.state.pagination.pageSize : 0, c = 0;
		for (let e = 0; e < i; e++) {
			let n = t[e];
			n && !n.__sgGroup && !n.__sgDetail && !n.__sgSeparator && (c += 1);
		}
		let l = (e) => !e || e.__sgGroup || e.__sgDetail || e.__sgSeparator ? null : (c += 1, s + c);
		if (n) {
			let n = this.state.rowHeight, s = i * n, c = (t.length - i - r.length) * n;
			o.appendChild(this._spacerRow(s, e.length)), r.forEach((t) => o.appendChild(this._buildRow(t, e, a, l(t)))), o.appendChild(this._spacerRow(c, e.length));
		} else r.forEach((t) => o.appendChild(this._buildRow(t, e, a, l(t))));
		this.pinnedBottomRowValue && this._displayList.grandTotals && !this._displayList.pivot && o.appendChild(this._buildPinnedBottomRow(e)), this._tbody.replaceChildren(o);
	}
	_buildPinnedBottomRow(e) {
		let t = E("tr", {
			class: "sg-pinned-bottom-row",
			"aria-label": "Grand totals"
		}), n = this._pinOffsets(), r = this._displayList.grandTotals || {}, i = !1;
		for (let a of e) {
			if (a._isSpacer) {
				t.appendChild(E("td", {
					class: "sg-spacer-cell",
					"aria-hidden": "true"
				}));
				continue;
			}
			let e = E("td", {
				"data-col-id": a.field,
				"data-pinned": a.pinned || null
			});
			a.pinned === "left" ? e.style.left = n.left[a.field] + "px" : a.pinned === "right" && (e.style.right = n.right[a.field] + "px");
			let o = r[a.field];
			o == null ? !i && !a._isCheckbox && !a._isRowNumber && (e.classList.add("sg-pinned-bottom-label"), e.textContent = "Total", i = !0) : (e.classList.add("sg-agg-cell"), e.textContent = this._formatAggregate(o)), t.appendChild(e);
		}
		return t;
	}
	_buildRow(e, t, n, r) {
		if (e.__sgGroup) return this._buildGroupRow(e, t, n);
		if (e.__sgDetail) return this._buildDetailRow(e, t, n);
		if (e.__sgSeparator) return this._buildSeparatorRow(e, t, n);
		let i = String(this._rowId(e)), a = n.get(i);
		a || (a = E("tr")), a.dataset.rowId = i, a.classList.remove("sg-spacer");
		let o = this.state.selection.has(this._rowId(e)), s = this.masterDetailValue && this._isDetailExpanded(i);
		return se(a, {
			"data-selected": o ? "true" : null,
			"data-detail-expanded": s ? "true" : null
		}), this.masterDetailValue && a.classList.add("sg-master-row"), this._renderRow(a, e, t, r), a;
	}
	_buildSeparatorRow(e, t, n) {
		let r = `__s:${e.__sgSeparatorId ?? this._separatorKey(e)}`, i = n.get(r);
		i || (i = E("tr")), i.dataset.rowId = r, i.dataset.separator = "true", i.className = "", i.removeAttribute("data-selected"), i.removeAttribute("data-detail-expanded");
		let a = e.variant || (e.value == null ? e.label == null ? "blank" : "heading" : "summary");
		i.classList.add("sg-separator-row", `sg-separator-${a}`), e.className && i.classList.add(e.className), i.innerHTML = "";
		let o = (e) => e._isCheckbox || e._isRowNumber || e._isGroupCol || e._isMasterExpand || e._isSpacer, s = t.filter((e) => !o(e)).length || t.length || 1;
		for (let n of t) {
			if (n._isSpacer) {
				i.appendChild(E("td", {
					class: "sg-spacer-cell",
					"aria-hidden": "true"
				}));
				continue;
			}
			if (o(n)) {
				let e = E("td", {
					"data-col-id": n.field,
					class: "sg-separator-gutter"
				});
				i.appendChild(e);
				continue;
			}
			let t = E("td", {
				"data-col-id": n.field,
				colspan: String(s),
				class: "sg-separator-cell"
			});
			this._renderSeparatorContent(t, e, a), i.appendChild(t);
			break;
		}
		return i;
	}
	_renderSeparatorContent(e, t, n) {
		if (n === "blank" || n === "divider") return;
		let r = E("div", { class: "sg-separator-content" });
		t.label != null && r.appendChild(E("span", { class: "sg-separator-label" }, String(t.label))), t.value != null && r.appendChild(E("span", { class: "sg-separator-value" }, String(t.value))), e.appendChild(r);
	}
	_separatorKey(e) {
		return [
			e.variant || "",
			e.label || "",
			e.value || ""
		].join("|");
	}
	_spacerRow(e, t) {
		if (e <= 0) {
			let e = E("tr", {
				class: "sg-spacer",
				"aria-hidden": "true"
			});
			return e.style.height = "0px", e.appendChild(E("td", {
				colspan: String(t),
				style: {
					height: "0px",
					padding: "0",
					border: "0"
				}
			})), e;
		}
		let n = E("tr", {
			class: "sg-spacer",
			"aria-hidden": "true"
		});
		return n.style.height = e + "px", n.appendChild(E("td", {
			colspan: String(t),
			style: {
				height: e + "px",
				padding: "0",
				border: "0"
			}
		})), n;
	}
	_renderRow(e, t, r, i) {
		e.innerHTML = "";
		let a = this._pinOffsets(), o = this._selKeys || {
			active: null,
			range: null
		}, s = String(this._rowId(t)), c = this._displayList?.treeMeta, l = c ? c.get(s) : null, u = l ? this._treeDisplayColField() : null, d = t && t.__sgSpans || null, f = 0;
		for (let c = 0; c < r.length; c++) {
			let p = r[c];
			if (f > 0) {
				--f;
				continue;
			}
			let m = p._isRowNumber || p._isCheckbox || p._isGroupCol || p._isMasterExpand || p._isSpacer;
			if (p._isSpacer) {
				let t = E("td", {
					class: "sg-spacer-cell",
					"aria-hidden": "true"
				});
				e.appendChild(t);
				continue;
			}
			let h = d && !m ? Number(d[p.field]) : 0, g = Math.max(1, Math.min(h || 1, r.length - c));
			g > 1 && (f = g - 1);
			let _ = `${s}:${p.field}`, v = E("td", {
				"data-col-id": p.field,
				"data-pinned": p.pinned || null,
				"data-cell-active": o.active === _ ? "true" : null,
				"data-cell-range": o.range && o.range.has(_) ? "true" : null,
				colspan: g > 1 ? String(g) : null
			});
			if (g > 1 && v.classList.add("sg-merged-cell"), p.type === "number" && v.classList.add("sg-renderer-number"), p.pinned === "left" ? v.style.left = a.left[p.field] + "px" : p.pinned === "right" && (v.style.right = a.right[p.field] + "px"), p._isRowNumber) {
				v.classList.add("sg-gutter-cell"), v.setAttribute("data-gutter", "true"), v.removeAttribute("data-cell-active"), v.removeAttribute("data-cell-range"), v.textContent = i == null ? "" : String(i), e.appendChild(v);
				continue;
			}
			if (p._isCheckbox) {
				v.classList.add("sg-checkbox-cell");
				let n = E("input", { type: "checkbox" });
				n.checked = this.state.selection.has(this._rowId(t)), v.appendChild(n), e.appendChild(v);
				continue;
			}
			if (p._isGroupCol) {
				v.classList.add("sg-group-leaf-cell"), v.removeAttribute("data-cell-active"), v.removeAttribute("data-cell-range"), e.appendChild(v);
				continue;
			}
			if (p._isMasterExpand) {
				v.classList.add("sg-master-expand-cell"), v.setAttribute("data-master-expand", "true"), v.removeAttribute("data-cell-active"), v.removeAttribute("data-cell-range");
				let n = E("span", {
					class: "sg-master-expand-caret",
					"data-expanded": this._isDetailExpanded(this._rowId(t)) ? "true" : "false",
					"aria-hidden": "true"
				});
				n.innerHTML = cl, v.appendChild(n), e.appendChild(v);
				continue;
			}
			if (this.state.editing && this.state.editing.rowId === this._rowId(t) && this.state.editing.colId === p.field) {
				v.setAttribute("data-editing", "true");
				let e = this.state.editing.initialValue === void 0 ? n(t, p) : this.state.editing.initialValue, { node: r, control: i } = this._buildEditor(p, e);
				v.appendChild(r);
				let a = this.state.editing.initialValue !== void 0;
				queueMicrotask(() => {
					if (i?.focus(), a || i?.select?.(), i?.type && dl.has(i.type)) try {
						i.showPicker?.();
					} catch {}
				});
			} else this._renderCellContent(v, t, p, i);
			l && p.field === u && this._decorateTreeCell(v, l), e.appendChild(v);
		}
	}
	_decorateTreeCell(e, t) {
		if (e.classList.add("sg-tree-cell"), e.setAttribute("data-tree-level", String(t.level)), e.style.paddingLeft = `${8 + t.level * 18}px`, t.hasChildren) {
			let n = E("span", {
				class: "sg-tree-chevron",
				"data-tree-toggle": "true",
				"data-expanded": t.expanded ? "true" : "false",
				"aria-hidden": "true"
			});
			n.innerHTML = cl, e.insertBefore(n, e.firstChild);
		} else {
			let t = E("span", {
				class: "sg-tree-chevron sg-tree-chevron-leaf",
				"aria-hidden": "true"
			});
			e.insertBefore(t, e.firstChild);
		}
	}
	_renderCellContent(e, t, i, a = null) {
		if (i.cellRenderer) {
			let o = ce(i.cellRenderer);
			if (o) {
				let a = n(t, i), s = r(t, i);
				(o.dataset.bind || o.dataset.bindText !== void 0) && (o.textContent = o.dataset.bind ? String(t[o.dataset.bind] ?? "") : s), o.dataset.bindAttr && o.setAttribute(o.dataset.bindAttr, a), o.querySelectorAll("[data-bind], [data-bind-attr], [data-bind-text]").forEach((e) => {
					e.dataset.bindText === void 0 ? e.dataset.bind && (e.textContent = String(t[e.dataset.bind] ?? "")) : e.textContent = s, e.dataset.bindAttr && e.setAttribute(e.dataset.bindAttr, a);
				}), e.appendChild(o);
				return;
			}
			let s = A(i.cellRenderer);
			if (typeof s == "function") {
				let o = s({
					value: n(t, i),
					row: t,
					col: i,
					td: e,
					formatted: r(t, i),
					rowNum: a,
					api: this.element.gridApi
				});
				if (o == null) return;
				if (typeof o == "string") {
					e.innerHTML = o;
					return;
				}
				if (o instanceof Node) {
					e.appendChild(o);
					return;
				}
				e.textContent = String(o);
				return;
			}
		}
		e.textContent = r(t, i);
	}
	toggleGroup(e, t = 0) {
		this._groupExpanded.set(e, !this._isGroupExpanded(e, t)), this.scheduleRender("group"), D(this.element, "grid:groupToggled", {
			groupId: e,
			expanded: this._groupExpanded.get(e)
		});
	}
	expandAll() {
		this._groupExpanded.clear(), this.state.group.defaultExpanded = -1, this.scheduleRender("group");
	}
	collapseAll() {
		this._groupExpanded.clear(), this.state.group.defaultExpanded = 0, this.scheduleRender("group");
	}
	setRowGroupColumns(e) {
		this.state.group.cols = Array.isArray(e) ? e.slice() : [], this._groupExpanded.clear(), this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("group"), D(this.element, "grid:columnRowGroupChanged", { rowGroupCols: this.state.group.cols.slice() });
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
		t == null ? delete this.state.group.aggs[e] : this.state.group.aggs[e] = t, this.scheduleRender("group"), D(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
	}
	setPivotMode(e) {
		let t = !!e;
		this.state.pivot.mode !== t && (this.state.pivot.mode = t, this.state.selection.clear(), this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), D(this.element, "grid:pivotModeChanged", { pivot: t }));
	}
	isPivotMode() {
		return !!this.state.pivot.mode;
	}
	setPivotColumns(e) {
		this.state.pivot.cols = Array.isArray(e) ? e.slice() : [], this.clearCellSelection(), this.state.pagination.page = 0, this.scheduleRender("pivot"), D(this.element, "grid:columnPivotChanged", { pivotCols: this.state.pivot.cols.slice() });
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
	getValueColumns() {
		return Object.entries(this.state.group.aggs).map(([e, t]) => ({
			field: e,
			aggFunc: t
		}));
	}
	setValueColumns(e) {
		let t = {};
		for (let { field: n, aggFunc: r } of e || []) n && r && (t[n] = r);
		this.state.group.aggs = t, this.scheduleRender(this.state.pivot.mode ? "pivot" : "group"), D(this.element, "grid:columnValueChanged", { valueCols: this.getValueColumns() });
	}
	addValueColumn(e, t = "sum") {
		e && this.setColumnAggFunc(e, t);
	}
	removeValueColumn(e) {
		this.setColumnAggFunc(e, null);
	}
	setColumnGroups(e) {
		this.columnGroupsValue = Array.isArray(e) ? e : [], this.scheduleRender("columns"), D(this.element, "grid:columnGroupsChanged", { columnGroups: this.columnGroupsValue });
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
	getColumnState() {
		return {
			v: 1,
			cols: this.state.columnDefs.filter((e) => !e._isGroupCol && !e._isPivot).map((e) => {
				let t = { field: e.field };
				return e.width != null && (t.width = e.width), e.pinned && (t.pinned = e.pinned), e.hidden && (t.hidden = !0), t;
			}),
			rowGroupCols: this.state.group.cols.slice(),
			pivot: {
				mode: !!this.state.pivot.mode,
				cols: this.state.pivot.cols.slice()
			},
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
				let t = new Map(this.state.columnDefs.map((e) => [e.field, e])), n = [];
				for (let r of e.cols) {
					let e = t.get(r.field);
					e && (r.width != null && (e.width = r.width), e.pinned = r.pinned || void 0, e.hidden = !!r.hidden, t.delete(r.field), n.push(e));
				}
				for (let e of t.values()) n.push(e);
				this.state.columnDefs = n;
			}
			if (Array.isArray(e.rowGroupCols) && (this.state.group.cols = e.rowGroupCols.slice()), e.pivot && typeof e.pivot == "object" && (this.state.pivot.cols = Array.isArray(e.pivot.cols) ? e.pivot.cols.slice() : [], this.state.pivot.mode = !!e.pivot.mode), Array.isArray(e.values)) {
				let t = {};
				for (let { field: n, aggFunc: r } of e.values) n && r && (t[n] = r);
				this.state.group.aggs = t;
			}
			Array.isArray(e.columnGroups) && (this.columnGroupsValue = e.columnGroups), typeof e.pinnedBottomRow == "boolean" && (this.pinnedBottomRowValue = e.pinnedBottomRow), Array.isArray(e.sortModel) && (this.state.sortModel = e.sortModel.slice()), e.filterModel && typeof e.filterModel == "object" && (this.state.filterModel = { ...e.filterModel }), typeof e.quickFilter == "string" && (this.state.quickFilter = e.quickFilter);
			for (let e of [
				"columns",
				"group",
				"pivot",
				"sort",
				"filter",
				"data"
			]) this.scheduleRender(e);
			D(this.element, "grid:columnStateApplied", { state: e });
		}
	}
	_storageKey() {
		return `sgrid:${this.persistKeyValue}`;
	}
	_restorePersistedState() {
		if (!(!this.persistKeyValue || typeof localStorage > "u")) try {
			let e = localStorage.getItem(this._storageKey());
			if (!e) return;
			let t = JSON.parse(e);
			t && typeof t == "object" && this.applyColumnState(t);
		} catch (e) {
			console.warn("[stimulus_grid] failed to restore persisted state", e);
		}
	}
	_setupPersistence() {
		if (!this.persistKeyValue || typeof localStorage > "u") return;
		let e = () => {
			clearTimeout(this._persistTimer), this._persistTimer = setTimeout(() => this._persistState(), 200);
		};
		this._persistListener = e;
		for (let t of ml) this.element.addEventListener(t, e);
		this._persistBeforeUnload = () => {
			this._persistTimer && (clearTimeout(this._persistTimer), this._persistState());
		}, window.addEventListener("beforeunload", this._persistBeforeUnload);
	}
	_teardownPersistence() {
		if (this._persistListener) {
			for (let e of ml) this.element.removeEventListener(e, this._persistListener);
			this._persistBeforeUnload && (window.removeEventListener("beforeunload", this._persistBeforeUnload), this._persistBeforeUnload = null), this._persistTimer && (clearTimeout(this._persistTimer), this._persistState()), this._persistListener = null;
		}
	}
	_persistState() {
		if (!(!this.persistKeyValue || typeof localStorage > "u")) try {
			localStorage.setItem(this._storageKey(), JSON.stringify(this.getColumnState()));
		} catch (e) {
			console.warn("[stimulus_grid] failed to persist state", e);
		}
	}
	clearPersistedState() {
		if (!(!this.persistKeyValue || typeof localStorage > "u")) try {
			localStorage.removeItem(this._storageKey());
		} catch {}
	}
	_buildGroupRow(e, t, n) {
		let r = `__g:${e.groupId}`, i = n.get(r);
		return i || (i = E("tr")), i.dataset.rowId = r, i.dataset.group = "true", i.dataset.groupLevel = String(e.level), i.className = "sg-group-row", this._renderGroupRow(i, e, t), i;
	}
	_renderGroupRow(e, t, r) {
		e.innerHTML = "";
		let i = this._pinOffsets(), a = this._isGroupExpanded(t.groupId, t.level), o = (this.state.group.displayType || "singleColumn") === "singleColumn", s = !!(this.state.pivot?.mode && this._displayList?.pivot), c = t.__pivotAll === !0, l = r.filter((e) => !e._isRowNumber && !e._isCheckbox && !e._isGroupCol && !e._isSpacer), u = l.some((e) => e.field === t.field) ? t.field : l[0]?.field, d = Math.max(0, t.level);
		c && e.classList.add("sg-pivot-all-row");
		for (let l of r) {
			if (l._isSpacer) {
				e.appendChild(E("td", {
					class: "sg-spacer-cell",
					"aria-hidden": "true"
				}));
				continue;
			}
			let r = E("td", {
				"data-col-id": l.field,
				"data-pinned": l.pinned || null
			});
			if (l.pinned === "left" ? r.style.left = i.left[l.field] + "px" : l.pinned === "right" && (r.style.right = i.right[l.field] + "px"), l._isRowNumber || l._isCheckbox) {
				r.classList.add(l._isRowNumber ? "sg-gutter-cell" : "sg-checkbox-cell"), e.appendChild(r);
				continue;
			}
			if (s || o ? l._isGroupCol : l.field === u) {
				if (r.classList.add("sg-group-cell"), r.style.paddingLeft = `${8 + d * 18}px`, !c) {
					let e = E("span", {
						class: "sg-group-caret",
						"data-expanded": a ? "true" : "false",
						"aria-hidden": "true"
					});
					e.innerHTML = cl, r.appendChild(e);
				}
				r.append(E("span", { class: "sg-group-label" }, this._groupValueLabel(t)), E("span", { class: "sg-group-count" }, ` (${t.count})`));
			} else if (s && l._isPivot) {
				let e = n(t, l);
				e != null && (r.classList.add("sg-agg-cell"), r.textContent = this._formatAggregate(e));
			} else !l._isGroupCol && t.aggregates && t.aggregates[l.field] != null && (r.classList.add("sg-agg-cell"), r.textContent = this._formatAggregate(t.aggregates[l.field]));
			e.appendChild(r);
		}
	}
	_groupValueLabel(e) {
		let t = e.value;
		if (t == null || t === "") return "(Blanks)";
		let n = this._colByField(e.field);
		return n ? r({ [e.field]: t }, n) : String(t);
	}
	_formatAggregate(e) {
		return e == null ? "" : String(typeof e == "number" ? Number.isInteger(e) ? e : Math.round(e * 100) / 100 : e);
	}
	_buildEditor(e, t) {
		if (e.cellEditor) {
			let n = ce(e.cellEditor);
			if (n) {
				let r = n.matches?.("input,select,textarea,[data-editor-input]") ? n : n.querySelector?.("[data-editor-input]") || n.querySelector?.("input,select,textarea");
				return r && (this._seedEditorValue(r, e, t), r.addEventListener("keydown", this._onEditorKey), r.addEventListener("blur", this._onEditorBlur)), {
					node: n,
					control: r
				};
			}
		}
		let n = this._buildEditorInput(e, t);
		return {
			node: n,
			control: n
		};
	}
	_seedEditorValue(e, t, n) {
		if (t.type === "date" && n) {
			let t = n instanceof Date ? n : new Date(n);
			e.value = Number.isNaN(t?.getTime?.()) ? n ?? "" : t.toISOString().slice(0, 10);
		} else if (t.type === "datetime" && n) {
			let t = n instanceof Date ? n : new Date(n);
			if (Number.isNaN(t?.getTime?.())) e.value = n ?? "";
			else {
				let n = t.getTimezoneOffset() * 6e4;
				e.value = new Date(t.getTime() - n).toISOString().slice(0, 16);
			}
		} else t.type === "boolean" ? e.value = n === !0 ? "true" : n === !1 ? "false" : "" : e.value = n ?? "";
	}
	_buildEditorInput(e, t) {
		let n;
		if (e.type === "number") n = E("input", {
			type: "number",
			value: t ?? ""
		});
		else if (e.type === "date") {
			let e = t instanceof Date ? t : t ? new Date(t) : null;
			n = E("input", {
				type: "date",
				value: e ? e.toISOString().slice(0, 10) : ""
			});
		} else if (e.type === "datetime") {
			let e = t instanceof Date ? t : t ? new Date(t) : null, r = "";
			if (e && !Number.isNaN(e.getTime())) {
				let t = e.getTimezoneOffset() * 6e4;
				r = new Date(e.getTime() - t).toISOString().slice(0, 16);
			}
			n = E("input", {
				type: "datetime-local",
				value: r
			});
		} else e.type === "color" ? n = E("input", {
			type: "color",
			value: /^#[0-9a-f]{6}$/i.test(String(t ?? "")) ? t : "#000000"
		}) : e.type === "email" ? n = E("input", {
			type: "email",
			value: t ?? ""
		}) : e.type === "url" ? n = E("input", {
			type: "url",
			value: t ?? ""
		}) : e.type === "tel" ? n = E("input", {
			type: "tel",
			value: t ?? ""
		}) : e.type === "boolean" ? (n = E("select"), n.append(new Option("—", ""), new Option("true", "true", t === !0, t === !0), new Option("false", "false", t === !1, t === !1))) : n = E("input", {
			type: "text",
			value: t ?? ""
		});
		return n.addEventListener("keydown", this._onEditorKey), n.addEventListener("blur", this._onEditorBlur), n;
	}
	_renderPagination() {
		this.state.pagination.enabled;
	}
	_renderStatusBar() {
		if (!this._statusBar) return;
		let e = this._statusBar.querySelector(".sg-status-left"), t = this._statusBar.querySelector(".sg-status-right");
		e.replaceChildren();
		let n = this.state.serverSide ? this.state.serverRowCount : this.state.rowData.length, r = this._displayList.grouped ? this._displayList.leafCount ?? this.filteredCount() : this.filteredCount();
		e.appendChild(this._statusPanel("Rows", this._fmtInt(r), r === n ? null : `of ${this._fmtInt(n)}`));
		let i = this.state.selection.size;
		i > 0 && e.appendChild(this._statusPanel("Selected", this._fmtInt(i))), t.replaceChildren();
		let a = this.getRangeAggregates();
		if (a && a.count > 0) {
			let e = (this.statusBarAggsValue || []).filter((e) => e in a);
			for (let n of e) {
				let e = a[n];
				e == null && n !== "count" || t.appendChild(this._statusPanel(this._aggLabel(n), this._fmtAgg(n, e)));
			}
		}
		let o = a ? `${a.count}|${a.sum}|${a.avg}|${a.min}|${a.max}` : "";
		o !== this._lastRangeAggs && (this._lastRangeAggs = o, D(this.element, "grid:rangeAggsChanged", { aggs: a }));
	}
	_statusPanel(e, t, n = null) {
		let r = E("div", { class: "sg-status-panel" });
		return r.append(E("span", { class: "sg-status-label" }, `${e}:`), E("span", { class: "sg-status-value" }, t)), n && r.appendChild(E("span", { class: "sg-status-aside" }, n)), r;
	}
	_fmtInt(e) {
		return Number(e).toLocaleString();
	}
	_aggLabel(e) {
		return {
			count: "Count",
			sum: "Sum",
			avg: "Avg",
			min: "Min",
			max: "Max"
		}[e] || e;
	}
	_fmtAgg(e, t) {
		return t == null ? "—" : e === "count" ? this._fmtInt(t) : typeof t == "number" ? Number.isInteger(t) ? this._fmtInt(t) : (Math.round(t * 100) / 100).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}) : String(t);
	}
	_cellRangeRawValues() {
		let e = [];
		for (let t of this.state.cellSel.ranges) {
			let r = this._rangeRect(t);
			if (r) for (let t = r.r0; t <= r.r1; t++) {
				let i = r.rows[t];
				if (!(!i || i.__sgGroup || i.__sgDetail || i.__sgSeparator)) for (let t = r.c0; t <= r.c1; t++) {
					let a = r.cols[t];
					!a || a._isCheckbox || a._isRowNumber || a._isGroupCol || a._isMasterExpand || a._isSpacer || e.push(n(i, a));
				}
			}
		}
		return e;
	}
	getRangeAggregates() {
		return this.state.cellSel.ranges.length ? g(this._cellRangeRawValues()) : null;
	}
	_showColumnMenu(e, t, n) {
		this._closeColumnMenu();
		let r = this._columnMenuItems(e), i = E("div", {
			class: "sg-column-menu",
			role: "menu"
		});
		for (let e of r) {
			if (e === "separator") {
				i.appendChild(E("div", {
					class: "sg-column-menu-separator",
					role: "separator"
				}));
				continue;
			}
			let t = E("button", {
				type: "button",
				class: "sg-column-menu-item" + (e.active ? " sg-column-menu-active" : ""),
				role: "menuitem"
			});
			t.append(E("span", { class: "sg-column-menu-label" }, e.label)), e.active && t.append(E("span", {
				class: "sg-column-menu-check",
				"aria-hidden": "true"
			}, "✓")), t.addEventListener("click", () => {
				e.action(), this._closeColumnMenu();
			}), i.appendChild(t);
		}
		document.body.appendChild(i);
		let a = i.offsetWidth || 220, o = i.offsetHeight || 280;
		i.style.left = `${Math.min(t, window.innerWidth - a - 4)}px`, i.style.top = `${Math.min(n, window.innerHeight - o - 4)}px`, this._columnMenu = i, setTimeout(() => {
			document.addEventListener("mousedown", this._onDocMouseDownColumnMenu), document.addEventListener("keydown", this._onColumnMenuKey), window.addEventListener("resize", this._closeColumnMenuBound = () => this._closeColumnMenu(), { once: !0 }), window.addEventListener("scroll", this._closeColumnMenuBound, {
				once: !0,
				capture: !0
			});
		}, 0), D(this.element, "grid:columnMenuOpened", { colId: e.field });
	}
	_closeColumnMenu() {
		this._columnMenu && (this._columnMenu.remove(), this._columnMenu = null, document.removeEventListener("mousedown", this._onDocMouseDownColumnMenu), document.removeEventListener("keydown", this._onColumnMenuKey), this._closeColumnMenuBound && (window.removeEventListener("resize", this._closeColumnMenuBound), window.removeEventListener("scroll", this._closeColumnMenuBound, { capture: !0 }), this._closeColumnMenuBound = null));
	}
	_columnMenuItems(e) {
		let t = this.element.gridApi, n = e.headerName || e.field, r = this.state.group.cols.includes(e.field), i = this.state.pivot.cols.includes(e.field), a = this.state.group.aggs[e.field], o = e.type === "number", s = [];
		if (e.pinned !== "left" && s.push({
			label: "Pin left",
			action: () => t.setColumnPinned(e.field, "left")
		}), e.pinned !== "right" && s.push({
			label: "Pin right",
			action: () => t.setColumnPinned(e.field, "right")
		}), e.pinned && s.push({
			label: "Unpin",
			action: () => t.setColumnPinned(e.field, null)
		}), s.push("separator"), s.push({
			label: "Autosize this column",
			action: () => t.autoSizeColumn(e.field)
		}), s.push({
			label: "Autosize all columns",
			action: () => t.autoSizeAllColumns()
		}), s.push("separator"), s.push(r ? {
			label: `Ungroup ${n}`,
			action: () => t.removeRowGroupColumn(e.field)
		} : {
			label: `Group by ${n}`,
			action: () => t.addRowGroupColumn(e.field)
		}), s.push(i ? {
			label: `Remove ${n} from pivot`,
			action: () => t.removePivotColumn(e.field)
		} : {
			label: `Pivot by ${n}`,
			action: () => {
				t.isPivotMode() || t.setPivotMode(!0), t.addPivotColumn(e.field);
			}
		}), o || a) {
			s.push("separator");
			for (let n of [
				"sum",
				"avg",
				"count",
				"min",
				"max"
			]) s.push({
				label: `Aggregate: ${n}`,
				active: a === n,
				action: () => t.addValueColumn(e.field, n)
			});
			a && s.push({
				label: "Remove aggregation",
				action: () => t.removeValueColumn(e.field)
			});
		}
		return s.push("separator"), s.push({
			label: "Hide column",
			action: () => t.setColumnVisible(e.field, !1)
		}), s.push({
			label: "Show all columns",
			action: () => {
				this.state.columnDefs.forEach((e) => {
					e.hidden && !e._isGroupCol && !e._isPivot && !e._isCheckbox && !e._isRowNumber && t.setColumnVisible(e.field, !0);
				});
			}
		}), s;
	}
	_attachBodyListeners() {
		this._listenersAttached || (this._listenersAttached = !0, this._tbody.addEventListener("click", (e) => this._onBodyClick(e)), this._tbody.addEventListener("dblclick", (e) => this._onBodyDblClick(e)), this._tbody.addEventListener("mousedown", this._onCellMouseDown), this._tbody.addEventListener("mouseover", this._onCellMouseOver), document.addEventListener("mouseup", this._onCellMouseUp), document.addEventListener("copy", this._onCopy), document.addEventListener("paste", this._onPaste), this._viewport.addEventListener("scroll", this._onScroll, { passive: !0 }), this.acceptFilesValue && (this._tbody.addEventListener("dragenter", this._onCellDragEnter), this._tbody.addEventListener("dragover", this._onCellDragOver), this._tbody.addEventListener("dragleave", this._onCellDragLeave), this._tbody.addEventListener("drop", this._onCellDrop)));
	}
	_dropTarget(e) {
		let t = e?.closest?.("td"), n = e?.closest?.("tr");
		if (!t || !n || n.dataset.group === "true" || n.dataset.separator === "true" || n.classList.contains("sg-detail-row") || t.classList.contains("sg-checkbox-cell") || t.classList.contains("sg-group-leaf-cell") || t.classList.contains("sg-master-expand-cell") || t.dataset.gutter === "true" || !t.dataset.colId) return null;
		let r = t.dataset.colId, i = this._colByField(r);
		return i && i.acceptFiles === !1 ? null : {
			td: t,
			tr: n,
			colId: r,
			rowId: this._coerceRowId(n.dataset.rowId),
			col: i
		};
	}
	_isFileDrag(e) {
		let t = e.dataTransfer?.types;
		return t ? Array.from(t).includes("Files") : !1;
	}
	_onBodyClick(e) {
		let t = e.target.closest("tr");
		if (!t) return;
		if (t.dataset.group === "true") {
			this.toggleGroup(t.dataset.rowId.replace(/^__g:/, ""), Number(t.dataset.groupLevel) || 0);
			return;
		}
		if (t.dataset.separator === "true" || t.classList.contains("sg-detail-row")) return;
		if (e.target.closest?.("td[data-master-expand=\"true\"]")) {
			let e = this._coerceRowId(t.dataset.rowId);
			this.toggleDetailRow(e);
			return;
		}
		let n = e.target.closest?.("[data-tree-toggle=\"true\"]");
		if (n && t.contains(n)) {
			let e = this._coerceRowId(t.dataset.rowId);
			this.toggleTreeRow(e);
			return;
		}
		if (e.target.closest("td[data-editing=\"true\"]")) return;
		let r = this._coerceRowId(t.dataset.rowId), i = e.target.closest("td");
		if (i?.classList.contains("sg-spacer-cell")) return;
		if (e.target.matches("input[type=\"checkbox\"]")) {
			this.toggleRowSelection(r, "toggle");
			return;
		}
		if (i && i.dataset.gutter === "true") {
			if (this._rowDragMoved) {
				this._rowDragMoved = !1;
				return;
			}
			if (this.rowSelectionValue !== "") {
				let t = e.shiftKey ? "range" : e.metaKey || e.ctrlKey ? "toggle" : "replace";
				this.clearCellSelection(), this.toggleRowSelection(r, t), D(this.element, "grid:rowClicked", {
					rowId: r,
					row: this.state.rowData.find((e) => this._rowId(e) === r),
					event: e
				});
			}
			this._cellDragMoved = !1;
			return;
		}
		if (i) {
			let t = this.state.rowData.find((e) => this._rowId(e) === r), n = i.dataset.colId;
			D(this.element, "grid:cellClicked", {
				rowId: r,
				colId: n,
				value: t?.[n],
				event: e
			});
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
		let a = e.shiftKey ? "range" : e.metaKey || e.ctrlKey || this.rowMultiSelectWithClickValue ? "toggle" : "replace";
		this.toggleRowSelection(r, a), D(this.element, "grid:rowClicked", {
			rowId: r,
			row: this.state.rowData.find((e) => this._rowId(e) === r),
			event: e
		});
	}
	_cellAt(e) {
		let t = e.closest?.("td"), n = e.closest?.("tr");
		return !t || !n || n.dataset.group === "true" || n.dataset.separator === "true" || n.classList.contains("sg-detail-row") || t.classList.contains("sg-checkbox-cell") || t.classList.contains("sg-group-leaf-cell") || t.classList.contains("sg-master-expand-cell") || t.classList.contains("sg-spacer-cell") || t.dataset.gutter === "true" || !t.dataset.colId || t.dataset.editing === "true" ? null : {
			rowId: this._coerceRowId(n.dataset.rowId),
			colId: t.dataset.colId
		};
	}
	_activeCell() {
		let e = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
		return e ? e.anchor : null;
	}
	_setSingleCellSel(e) {
		this.state.cellSel = {
			ranges: [{
				anchor: e,
				focus: e
			}],
			activeIdx: 0
		};
	}
	_addCellRange(e) {
		this.state.cellSel.ranges.push({
			anchor: e,
			focus: e
		}), this.state.cellSel.activeIdx = this.state.cellSel.ranges.length - 1;
	}
	_extendActiveRange(e) {
		let t = this.state.cellSel.ranges[this.state.cellSel.activeIdx];
		t ? t.focus = e : this._setSingleCellSel(e);
	}
	clearCellSelection() {
		this.state.cellSel = {
			ranges: [],
			activeIdx: -1
		}, this._applyCellSelHighlight();
	}
	_startRowDrag(e) {
		let t = Array.from(this.state.selection).map(String), n = new Set(t.includes(String(e)) ? t : [String(e)]), r = E("div", { class: "sg-drag-ghost sg-grid" }), i = E("table"), a = E("tbody"), o = 0;
		this._tbody.querySelectorAll("tr[data-row-id]").forEach((e) => {
			if (n.has(e.dataset.rowId) && o < 6) {
				let t = e.cloneNode(!0);
				t.removeAttribute("data-selected"), t.querySelectorAll("td").forEach((e) => {
					e.style.left = "", e.style.right = "", e.removeAttribute("data-pinned"), e.removeAttribute("data-cell-active"), e.removeAttribute("data-cell-range");
				}), a.appendChild(t), o += 1;
			}
		}), i.appendChild(a), r.appendChild(i), n.size > o && r.appendChild(E("div", { class: "sg-drag-ghost-more" }, `+${n.size - o} more rows`)), r.style.width = `${Math.min(this._tbody.offsetWidth, 520)}px`, document.body.appendChild(r);
		let s = E("div", { class: "sg-drop-indicator" });
		document.body.appendChild(s), this._rowDrag = {
			ids: n,
			ghost: r,
			indicator: s,
			dropRowId: null,
			dropBefore: !0
		}, document.body.classList.add("sg-row-dragging");
	}
	_updateDropIndicator(e) {
		let t = Array.from(this._tbody.querySelectorAll("tr[data-row-id]")), n = null, r = !0;
		for (let i of t) {
			let t = i.getBoundingClientRect();
			if (e < t.top + t.height / 2) {
				n = i, r = !0;
				break;
			}
			n = i, r = !1;
		}
		if (!n) return;
		let i = n.getBoundingClientRect(), a = this._viewport.getBoundingClientRect(), o = this._rowDrag.indicator;
		o.style.left = `${a.left}px`, o.style.width = `${a.width}px`, o.style.top = `${(r ? i.top : i.bottom) - 1}px`, this._rowDrag.dropRowId = this._coerceRowId(n.dataset.rowId), this._rowDrag.dropBefore = r;
	}
	_finishRowDrag() {
		let { ids: e, ghost: t, indicator: n, dropRowId: r, dropBefore: i } = this._rowDrag;
		if (t.remove(), n.remove(), document.body.classList.remove("sg-row-dragging"), this._rowDrag = null, r == null || e.has(String(r))) return;
		let a = this.state.rowData, o = a.filter((t) => e.has(String(this._rowId(t)))), s = a.filter((t) => !e.has(String(this._rowId(t)))), c = s.findIndex((e) => this._rowId(e) === r);
		c < 0 ? c = s.length : i || (c += 1), s.splice(c, 0, ...o), this.state.rowData = s, this.state.sortModel = [], this.scheduleRender("data"), D(this.element, "grid:rowDragEnd", {
			ids: o.map((e) => this._rowId(e)),
			toRowId: r,
			before: i
		});
	}
	_applyCellSelHighlight() {
		let e = this._computeCellSelKeys();
		this._selKeys = e, this._tbody && (this._tbody.querySelectorAll("td[data-col-id]").forEach((t) => {
			let n = t.parentElement, r = `${n && n.dataset.rowId}:${t.dataset.colId}`;
			e.active === r ? t.setAttribute("data-cell-active", "true") : t.removeAttribute("data-cell-active"), e.range && e.range.has(r) ? t.setAttribute("data-cell-range", "true") : t.removeAttribute("data-cell-range");
		}), this._renderStatusBar());
	}
	_parsePasteValue(e, t, n) {
		if (n.cellRenderer) {
			let r = A(n.cellRenderer);
			if (r && typeof r.parseValue == "function") try {
				return r.parseValue(String(e ?? ""), {
					row: t,
					col: n,
					api: this.element.gridApi
				});
			} catch {
				return;
			}
		}
		return Fe(e, n);
	}
	_copyCellValue(e, t) {
		let i = n(e, t), a = r(e, t);
		if (t.cellRenderer) {
			let n = A(t.cellRenderer);
			if (n && typeof n.copyValue == "function") try {
				let r = n.copyValue({
					value: i,
					row: e,
					col: t,
					formatted: a,
					api: this.element.gridApi
				});
				return r == null ? "" : String(r);
			} catch {}
		}
		return Ie(i, t, a);
	}
	_rangeRect(e) {
		if (!e) return null;
		let t = this._displayList.pageRows, n = this._visibleCols(), r = (e) => t.findIndex((t) => this._rowId(t) === e), i = (e) => n.findIndex((t) => t.field === e), a = r(e.anchor.rowId), o = i(e.anchor.colId);
		if (a < 0 || o < 0) return null;
		let s = r(e.focus.rowId), c = i(e.focus.colId);
		return {
			r0: Math.min(a, s < 0 ? a : s),
			r1: Math.max(a, s < 0 ? a : s),
			c0: Math.min(o, c < 0 ? o : c),
			c1: Math.max(o, c < 0 ? o : c),
			rows: t,
			cols: n
		};
	}
	_activeRect() {
		return this._rangeRect(this.state.cellSel.ranges[this.state.cellSel.activeIdx]);
	}
	_cellRangeRows(e = this._activeRect()) {
		if (!e) return [];
		let t = [];
		for (let n = e.r0; n <= e.r1; n++) {
			let r = e.rows[n];
			if (!r) continue;
			let i = [];
			for (let t = e.c0; t <= e.c1; t++) {
				let n = e.cols[t];
				n && i.push(this._copyCellValue(r, n));
			}
			t.push(i);
		}
		return t;
	}
	_computeCellSelKeys() {
		let e = this._activeCell();
		if (!e) return {
			active: null,
			range: null
		};
		let t = `${e.rowId}:${e.colId}`, n = /* @__PURE__ */ new Set();
		for (let e of this.state.cellSel.ranges) {
			let r = this._rangeRect(e);
			if (r) for (let e = r.r0; e <= r.r1; e++) {
				let i = r.rows[e];
				if (i) for (let e = r.c0; e <= r.c1; e++) {
					let a = r.cols[e];
					if (!a) continue;
					let o = `${this._rowId(i)}:${a.field}`;
					o !== t && n.add(o);
				}
			}
		}
		return {
			active: t,
			range: n
		};
	}
	getCellSelectionDetail() {
		let e = this._activeRect();
		return {
			active: this._activeCell(),
			ranges: this.state.cellSel.ranges.length,
			rowCount: e ? e.r1 - e.r0 + 1 : 0,
			colCount: e ? e.c1 - e.c0 + 1 : 0
		};
	}
	getCellSelectionRowIds() {
		let e = /* @__PURE__ */ new Set();
		for (let t of this.state.cellSel.ranges) {
			let n = this._rangeRect(t);
			if (n) for (let t = n.r0; t <= n.r1; t++) {
				let r = n.rows[t];
				r && e.add(this._rowId(r));
			}
		}
		return Array.from(e);
	}
	_focusGrid() {
		if (document.activeElement !== this.element && !this.element.contains(document.activeElement)) try {
			this.element.focus({ preventScroll: !0 });
		} catch {}
	}
	_navCols() {
		return this._visibleCols().filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol && !e._isMasterExpand && !e._isSpacer);
	}
	_moveActiveCell(e, t, n) {
		let r = this._displayList.pageRows, i = this._navCols();
		if (!r.length || !i.length) return;
		let a = (e, t, n) => Math.max(t, Math.min(e, n)), o = this._activeCell(), s = () => r.findIndex((e) => !e.__sgGroup && !e.__sgDetail && !e.__sgSeparator), c = o ? r.findIndex((e) => this._rowId(e) === o.rowId) : s(), l = o ? i.findIndex((e) => e.field === o.colId) : 0;
		if (c < 0 && (c = s()), !(c < 0)) {
			if (l < 0 && (l = 0), n && this.state.cellSel.ranges[this.state.cellSel.activeIdx]) {
				let n = this.state.cellSel.ranges[this.state.cellSel.activeIdx], o = a(r.findIndex((e) => this._rowId(e) === n.focus.rowId) + e, 0, r.length - 1), s = a(i.findIndex((e) => e.field === n.focus.colId) + t, 0, i.length - 1);
				this._extendActiveRange({
					rowId: this._rowId(r[o]),
					colId: i[s].field
				});
			} else {
				let n = a(c + e, 0, r.length - 1);
				if (e !== 0) {
					for (; r[n] && (r[n].__sgGroup || r[n].__sgDetail || r[n].__sgSeparator);) {
						let t = n + e;
						if (t < 0 || t >= r.length) break;
						n = t;
					}
					if (!r[n] || r[n].__sgGroup || r[n].__sgDetail || r[n].__sgSeparator) return;
				}
				let o = a(l + t, 0, i.length - 1);
				this._setSingleCellSel({
					rowId: this._rowId(r[n]),
					colId: i[o].field
				});
			}
			this._applyCellSelHighlight(), this._scrollActiveIntoView(), D(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail());
		}
	}
	_selectAllCells() {
		let e = this._displayList.pageRows, t = this._navCols();
		!e.length || !t.length || (this.state.cellSel = {
			ranges: [{
				anchor: {
					rowId: this._rowId(e[0]),
					colId: t[0].field
				},
				focus: {
					rowId: this._rowId(e[e.length - 1]),
					colId: t[t.length - 1].field
				}
			}],
			activeIdx: 0
		}, this._applyCellSelHighlight(), D(this.element, "grid:cellSelectionChanged", this.getCellSelectionDetail()));
	}
	_clearSelectedCells() {
		let e = !1;
		for (let t of this.state.cellSel.ranges) {
			let n = this._rangeRect(t);
			if (n) for (let t = n.r0; t <= n.r1; t++) {
				let r = n.rows[t];
				if (!(!r || r.__sgGroup || r.__sgDetail || r.__sgSeparator)) for (let t = n.c0; t <= n.c1; t++) {
					let i = n.cols[t];
					if (!i || !i.editable || i._isCheckbox || i._isRowNumber || i._isSpacer) continue;
					let a = r[i.field];
					a === "" || a == null || (r[i.field] = "", e = !0, D(this.element, "grid:cellValueChanged", {
						rowId: this._rowId(r),
						colId: i.field,
						oldValue: a,
						newValue: ""
					}));
				}
			}
		}
		return e && this.scheduleRender("cells"), e;
	}
	_scrollActiveIntoView() {
		(this._tbody?.querySelector("td[data-cell-active=\"true\"]"))?.scrollIntoView({
			block: "nearest",
			inline: "nearest"
		});
	}
	_onBodyDblClick(e) {
		let t = e.target.closest("tr"), n = e.target.closest("td");
		if (!t || !n || n.dataset.editing === "true") return;
		let r = this._coerceRowId(t.dataset.rowId), i = n.dataset.colId;
		this.startEditingCell(r, i);
	}
	_tabToEditableCell(e) {
		let t = this.state.editing;
		if (!t) return;
		let n = this._visibleCols().filter((e) => e.editable && !e._isCheckbox), r = this._displayList.pageRows, i = r.findIndex((e) => this._rowId(e) === t.rowId), a = n.findIndex((e) => e.field === t.colId);
		if (!n.length || !r.length || i < 0 || a < 0) {
			this.stopEditing(!1);
			return;
		}
		let o = r.length * n.length, s = (i * n.length + a + e + o) % o, c = r[Math.floor(s / n.length)], l = n[s % n.length];
		this._navigatingEditor = !0, this.stopEditing(!1), this.startEditingCell(this._rowId(c), l.field), requestAnimationFrame(() => {
			this._navigatingEditor = !1;
		});
	}
	_visibleCols() {
		let e = this._visibleColsCore(), t = this._spacerCol(), n = e.findIndex((e) => e.pinned === "right");
		return n < 0 ? e.push(t) : e.splice(n, 0, t), e;
	}
	_visibleColsCore() {
		let e = this.state.columnDefs.filter((e) => !e.hidden), t = this.state.group?.cols || [], n = this.masterDetailValue && !this.state.pivot?.mode && !t.length;
		if (this.state.pivot?.mode && this._displayList?.pivotResultColumns?.length) return [{
			field: "__group",
			headerName: t.length ? t.map((e) => this._colByField(e)?.headerName || e).join(" → ") : "",
			_isGroupCol: !0,
			width: t.length ? 220 : 90,
			sortable: !1,
			filter: null,
			resizable: !1
		}, ...this._displayList.pivotResultColumns];
		if (!t.length) return n ? [this._masterExpandCol(), ...e] : e;
		if ((this.state.group.displayType || "singleColumn") === "singleColumn") {
			let n = new Set(t);
			return [{
				field: "__group",
				headerName: "Group",
				_isGroupCol: !0,
				width: 240,
				sortable: !1,
				filter: null,
				resizable: !1
			}, ...e.filter((e) => !n.has(e.field))];
		}
		if (this.groupReorderColumnsValue === !1) return e;
		let r = t.map((t) => e.find((e) => e.field === t)).filter(Boolean), i = new Set(r);
		return [...r, ...e.filter((e) => !i.has(e))];
	}
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
	_spacerCol() {
		return {
			field: "__spacer",
			headerName: "",
			_isSpacer: !0,
			width: 0,
			sortable: !1,
			filter: null,
			resizable: !1,
			editable: !1
		};
	}
	_isDetailExpanded(e) {
		return this._detailExpanded.has(String(e));
	}
	_withDetailRows(e) {
		if (!this.masterDetailValue || !this._detailExpanded.size || this.state.pivot?.mode || (this.state.group.cols || []).length) return e;
		let t = [];
		for (let n of e) {
			if (t.push(n), n.__sgGroup || n.__sgDetail || n.__sgSeparator) continue;
			let e = this._rowId(n);
			this._isDetailExpanded(e) && t.push({
				__sgDetail: !0,
				master: n,
				masterId: e
			});
		}
		return t;
	}
	toggleDetailRow(e) {
		this.masterDetailValue && (this._isDetailExpanded(e) ? this.collapseDetailRow(e) : this.expandDetailRow(e));
	}
	expandDetailRow(e) {
		if (!this.masterDetailValue) return;
		let t = String(e);
		if (this._detailExpanded.has(t)) return;
		this._detailExpanded.add(t), this.scheduleRender("cells");
		let n = this.state.rowData.find((e) => String(this._rowId(e)) === t);
		D(this.element, "grid:detailRowExpanded", {
			rowId: e,
			masterRow: n
		});
	}
	collapseDetailRow(e) {
		if (!this.masterDetailValue) return;
		let t = String(e);
		if (!this._detailExpanded.has(t)) return;
		this._detailExpanded.delete(t), this._detailGrids.delete(t), this.scheduleRender("cells");
		let n = this.state.rowData.find((e) => String(this._rowId(e)) === t);
		D(this.element, "grid:detailRowCollapsed", {
			rowId: e,
			masterRow: n
		});
	}
	expandAllDetails() {
		if (this.masterDetailValue) {
			for (let e of this.state.rowData) this._detailExpanded.add(String(this._rowId(e)));
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
		let t = !!e;
		this.masterDetailValue !== t && (this.masterDetailValue = t, t || (this._detailExpanded.clear(), this._detailGrids.clear()), this.scheduleRender("columns"));
	}
	isMasterDetail() {
		return !!this.masterDetailValue;
	}
	toggleTreeRow(e) {
		if (!this.state.tree?.enabled) return;
		let t = String(e), n = this._isTreeRowExpanded(t, 0);
		this._treeExpanded.set(t, !n), this.scheduleRender("tree");
		let r = this.state.rowData.find((e) => String(this._rowId(e)) === t);
		D(this.element, n ? "grid:treeRowCollapsed" : "grid:treeRowExpanded", {
			rowId: e,
			row: r
		});
	}
	expandTreeRow(e) {
		if (!this.state.tree?.enabled) return;
		let t = String(e);
		if (this._isTreeRowExpanded(t, 0)) return;
		this._treeExpanded.set(t, !0), this.scheduleRender("tree");
		let n = this.state.rowData.find((e) => String(this._rowId(e)) === t);
		D(this.element, "grid:treeRowExpanded", {
			rowId: e,
			row: n
		});
	}
	collapseTreeRow(e) {
		if (!this.state.tree?.enabled) return;
		let t = String(e);
		if (!this._isTreeRowExpanded(t, 0)) return;
		this._treeExpanded.set(t, !1), this.scheduleRender("tree");
		let n = this.state.rowData.find((e) => String(this._rowId(e)) === t);
		D(this.element, "grid:treeRowCollapsed", {
			rowId: e,
			row: n
		});
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
		let t = !!e;
		this.treeDataValue !== t && (this.treeDataValue = t, this.state.tree.enabled = t, t || this._treeExpanded.clear(), this.scheduleRender("tree"), D(this.element, "grid:treeDataChanged", { treeData: t }));
	}
	isTreeData() {
		return !!this.state.tree?.enabled;
	}
	setTreeParentField(e) {
		let t = e || "parent_id";
		this.state.tree.parentField !== t && (this.state.tree.parentField = t, this.treeParentFieldValue = t, this.scheduleRender("tree"));
	}
	_treeDisplayColField() {
		return this.state.tree?.displayField || this._visibleCols().find((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol && !e._isMasterExpand && !e._isSpacer)?.field || null;
	}
	_buildDetailRow(e, t, n) {
		let r = `__d:${e.masterId}`, i = n.get(r), a = String(e.masterId);
		if (i) {
			if (i.getAttribute("data-master-id") === a) return i.classList.remove("sg-spacer"), i;
			i = null;
		}
		i || (i = E("tr")), i.className = "sg-detail-row", i.dataset.rowId = r, i.setAttribute("data-master-id", a), i.innerHTML = "";
		let o = E("td", {
			colspan: String(t.length || 1),
			class: "sg-detail-cell"
		}), s = E("div", { class: "sg-detail-shell" });
		return s.style.minHeight = `${this.detailRowHeightValue}px`, o.appendChild(s), i.appendChild(o), this._populateDetailShell(s, e.master, e.masterId), i;
	}
	_populateDetailShell(e, t, n) {
		let r = this.detailTemplateValue, i;
		if (r) {
			let n = document.getElementById(r);
			if (n && n.tagName === "TEMPLATE") {
				let r = n.content.cloneNode(!0);
				this._applyDetailBindings(r, t), e.appendChild(r), i = e;
			}
		}
		if (!i) {
			let n = E("div", { class: "sg-detail-fallback" }), r = Object.keys(t || {}).filter((e) => !e.startsWith("_") && !e.startsWith("__")).slice(0, 6);
			for (let e of r) n.append(E("span", { class: "sg-detail-fallback-label" }, `${e}: `), E("span", { class: "sg-detail-fallback-value" }, String(t[e] ?? "")), E("span", { class: "sg-detail-fallback-sep" }, "  ·  "));
			n.lastElementChild?.remove(), e.appendChild(n);
		}
		let a = e.querySelector("[data-controller~=\"grid\"]");
		a && this._seedNestedGrid(a, t, n), queueMicrotask(() => {
			D(this.element, "grid:detailRowMounted", {
				rowId: n,
				masterRow: t,
				detailEl: e,
				nestedGridApi: a?.gridApi || null
			});
		});
	}
	_applyDetailBindings(e, t) {
		t && e.querySelectorAll("[data-detail-bind], [data-detail-bind-attr], [data-detail-if]").forEach((e) => {
			if (e.hasAttribute("data-detail-if") && !t[e.getAttribute("data-detail-if")]) {
				e.remove();
				return;
			}
			if (e.hasAttribute("data-detail-bind")) {
				let n = e.getAttribute("data-detail-bind");
				e.textContent = t[n] == null ? "" : String(t[n]);
			}
			if (e.hasAttribute("data-detail-bind-attr")) {
				let [n, r] = e.getAttribute("data-detail-bind-attr").split(":");
				n && r && e.setAttribute(n, t[r] == null ? "" : String(t[r]));
			}
		});
	}
	_seedNestedGrid(e, t, n) {
		let r = this.detailRowsKeyValue;
		if (r) {
			let n = t?.[r];
			if (Array.isArray(n)) try {
				e.setAttribute("data-grid-row-data-value", JSON.stringify(n));
			} catch {}
		}
		queueMicrotask(() => {
			e.gridApi && this._detailGrids.set(String(n), e.gridApi);
		});
	}
	_pinOffsets() {
		let e = this._visibleCols(), t = {}, n = 0;
		for (let r of e) r.pinned === "left" && (t[r.field] = n, n += r.width || 150);
		let r = {};
		n = 0;
		for (let t = e.length - 1; t >= 0; t--) {
			let i = e[t];
			i.pinned === "right" && (r[i.field] = n, n += i.width || 150);
		}
		return {
			left: t,
			right: r
		};
	}
	_colByField(e) {
		return this.state.columnDefs.find((t) => t.field === e);
	}
	_rowId(e) {
		return e?.[this.getRowIdValue] ?? e?.id ?? e;
	}
	_coerceRowId(e) {
		if (e == null) return e;
		let t = Number(e);
		return Number.isFinite(t) && String(t) === e ? t : e;
	}
};
Q(hl, "values", {
	rowData: {
		type: Array,
		default: []
	},
	rowDataUrl: {
		type: String,
		default: ""
	},
	rowSelection: {
		type: String,
		default: ""
	},
	rowMultiSelectWithClick: {
		type: Boolean,
		default: !1
	},
	suppressRowClickSelection: {
		type: Boolean,
		default: !1
	},
	pagination: {
		type: Boolean,
		default: !1
	},
	pageSize: {
		type: Number,
		default: sl
	},
	rowHeight: {
		type: Number,
		default: ol
	},
	headerHeight: {
		type: Number,
		default: 36
	},
	virtual: {
		type: Boolean,
		default: !1
	},
	virtualThreshold: {
		type: Number,
		default: 200
	},
	height: {
		type: String,
		default: ""
	},
	getRowId: {
		type: String,
		default: "id"
	},
	domLayout: {
		type: String,
		default: ""
	},
	serverSide: {
		type: Boolean,
		default: !1
	},
	rowCount: {
		type: Number,
		default: 0
	},
	cellSelection: {
		type: Boolean,
		default: !0
	},
	rowDrag: {
		type: Boolean,
		default: !1
	},
	rowGroupCols: {
		type: Array,
		default: []
	},
	aggFuncs: {
		type: Object,
		default: {}
	},
	groupDefaultExpanded: {
		type: Number,
		default: -1
	},
	groupReorderColumns: {
		type: Boolean,
		default: !0
	},
	groupDisplayType: {
		type: String,
		default: "singleColumn"
	},
	statusBar: {
		type: Boolean,
		default: !1
	},
	statusBarAggs: {
		type: Array,
		default: [
			"count",
			"sum",
			"avg",
			"min",
			"max"
		]
	},
	pivotMode: {
		type: Boolean,
		default: !1
	},
	pivotCols: {
		type: Array,
		default: []
	},
	sidePanel: {
		type: Boolean,
		default: !1
	},
	columnGroups: {
		type: Array,
		default: []
	},
	pinnedBottomRow: {
		type: Boolean,
		default: !1
	},
	persistKey: {
		type: String,
		default: ""
	},
	masterDetail: {
		type: Boolean,
		default: !1
	},
	detailTemplate: {
		type: String,
		default: ""
	},
	detailRowsKey: {
		type: String,
		default: ""
	},
	detailRowHeight: {
		type: Number,
		default: 240
	},
	treeData: {
		type: Boolean,
		default: !1
	},
	treeParentField: {
		type: String,
		default: "parent_id"
	},
	treeDisplayField: {
		type: String,
		default: ""
	},
	treeDefaultExpanded: {
		type: Number,
		default: -1
	},
	acceptFiles: {
		type: Boolean,
		default: !1
	},
	attachmentsField: {
		type: String,
		default: ""
	}
});
function gl(e, t) {
	for (let n of [
		"headerName",
		"type",
		"sortable",
		"filter",
		"editable",
		"width",
		"minWidth",
		"maxWidth",
		"pinned",
		"hidden",
		"resizable",
		"cellRenderer",
		"cellEditor",
		"_isCheckbox",
		"_isRowNumber"
	]) if (e[n] !== t[n]) return !1;
	return !0;
}
function _l(e) {
	return e === "number" || e === "date" ? [
		{
			value: "equals",
			label: "Equals"
		},
		{
			value: "notEqual",
			label: "Not equal"
		},
		{
			value: "lessThan",
			label: "Less than"
		},
		{
			value: "greaterThan",
			label: "Greater than"
		},
		{
			value: "inRange",
			label: "In range"
		},
		{
			value: "blank",
			label: "Blank"
		},
		{
			value: "notBlank",
			label: "Not blank"
		}
	] : e === "boolean" ? [{
		value: "equals",
		label: "Equals"
	}] : [
		{
			value: "contains",
			label: "Contains"
		},
		{
			value: "notContains",
			label: "Not contains"
		},
		{
			value: "equals",
			label: "Equals"
		},
		{
			value: "notEqual",
			label: "Not equal"
		},
		{
			value: "startsWith",
			label: "Starts with"
		},
		{
			value: "endsWith",
			label: "Ends with"
		},
		{
			value: "blank",
			label: "Blank"
		},
		{
			value: "notBlank",
			label: "Not blank"
		}
	];
}
function vl() {
	return null;
}
function yl(e, t) {
	if (t === "number") {
		let t = Number(e);
		return Number.isFinite(t) ? t : e;
	}
	if (t === "date") return e;
	if (t === "datetime") {
		if (!e) return e;
		let t = new Date(e);
		return Number.isNaN(t.getTime()) ? e : t.toISOString();
	}
	return t === "boolean" ? e === "true" ? !0 : e === "false" ? !1 : null : e;
}
function $(e) {
	return typeof CSS < "u" && CSS.escape ? CSS.escape(String(e)) : String(e).replace(/["\\\n\r]/g, (e) => "\\" + e);
}
//#endregion
//#region src/controllers/header_cell_controller.js
var bl = class extends t {
	constructor(...e) {
		super(...e), Q(this, "_onMouseDown", (e) => {
			if (e.button !== 0 || e.target.closest(".sg-resize-handle, .sg-filter-icon, .sg-reorder-handle")) return;
			let t = e.clientX, n = e.clientY, r = !1, i = (e) => {
				let o = Math.abs(e.clientX - t), s = Math.abs(e.clientY - n);
				!r && (o > 5 || s > 5) && (r = !0, document.removeEventListener("mousemove", i), document.removeEventListener("mouseup", a), this._beginReorder(t));
			}, a = (e) => {
				document.removeEventListener("mousemove", i), document.removeEventListener("mouseup", a), r || this.sort(e);
			};
			document.addEventListener("mousemove", i), document.addEventListener("mouseup", a);
		});
	}
	connect() {
		if (this.grid = le(this.element, "grid", this.application), this.grid) {
			if (!this.headerNameValue) {
				let e = this.element.textContent.trim();
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
		let t = null;
		if (this.cellRendererConfigValue) try {
			t = JSON.parse(this.cellRendererConfigValue);
		} catch (e) {
			console.warn(`[stimulus_grid] invalid cellRendererConfig JSON for ${this.fieldValue}:`, e);
		}
		let n = null;
		if (this.enumValuesValue) try {
			n = JSON.parse(this.enumValuesValue);
		} catch (e) {
			console.warn(`[stimulus_grid] invalid enumValues JSON for ${this.fieldValue}:`, e);
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
			cellRendererConfig: t,
			enumValues: n,
			_isCheckbox: this.checkboxValue,
			_isRowNumber: this.rowNumberValue,
			acceptFiles: e,
			sortable: this.rowNumberValue ? !1 : this.sortableValue,
			resizable: this.rowNumberValue ? !1 : this.resizableValue
		};
	}
	_beginReorder(e) {
		if (!this.grid) return;
		let t = this.element.parentElement, n = Array.from(t.children), r = n.indexOf(this.element), i = r;
		this.element.style.opacity = "0.5", this.element.style.background = "var(--sg-bg-hover, #eef2ff)", document.body.style.cursor = "grabbing";
		let a = (e) => {
			let t = e.clientX, a = n.length;
			for (let e = 0; e < n.length; e++) {
				let r = n[e].getBoundingClientRect();
				if (t < r.left + r.width / 2) {
					a = e;
					break;
				}
			}
			i = a > r ? a - 1 : a;
		}, o = () => {
			document.removeEventListener("mousemove", a), document.removeEventListener("mouseup", o), this.element.style.opacity = "", this.element.style.background = "", document.body.style.cursor = "", i !== r && this.grid.moveColumn(this.fieldValue, i);
		};
		document.addEventListener("mousemove", a), document.addEventListener("mouseup", o);
	}
	sort(e) {
		!this.sortableValue || !this.grid || this.grid.toggleSort(this.fieldValue, e?.shiftKey === !0);
	}
	openFilter(e) {
		e?.stopPropagation(), this.grid && this.grid.openFilterFor(this.fieldValue, this.element);
	}
	startResize(e) {
		if (!this.resizableValue || !this.grid) return;
		e.preventDefault(), e.stopPropagation();
		let t = e.clientX, n = this.element.offsetWidth, r = (e) => this.grid.setColumnWidth(this.fieldValue, n + (e.clientX - t)), i = () => {
			document.removeEventListener("mousemove", r), document.removeEventListener("mouseup", i), document.body.style.cursor = "", document.body.style.userSelect = "";
		};
		document.addEventListener("mousemove", r), document.addEventListener("mouseup", i), document.body.style.cursor = "col-resize", document.body.style.userSelect = "none";
	}
	autosizeColumn(e) {
		!this.resizableValue || !this.grid || (e.preventDefault(), e.stopPropagation(), this.grid.autoSizeColumn(this.fieldValue));
	}
};
Q(bl, "values", {
	field: String,
	headerName: {
		type: String,
		default: ""
	},
	type: {
		type: String,
		default: "text"
	},
	sortable: {
		type: Boolean,
		default: !1
	},
	filter: {
		type: String,
		default: ""
	},
	editable: {
		type: Boolean,
		default: !1
	},
	width: {
		type: Number,
		default: 0
	},
	minWidth: {
		type: Number,
		default: 40
	},
	maxWidth: {
		type: Number,
		default: 4e3
	},
	pinned: {
		type: String,
		default: ""
	},
	hidden: {
		type: Boolean,
		default: !1
	},
	resizable: {
		type: Boolean,
		default: !0
	},
	cellRenderer: {
		type: String,
		default: ""
	},
	cellEditor: {
		type: String,
		default: ""
	},
	cellRendererConfig: {
		type: String,
		default: ""
	},
	enumValues: {
		type: String,
		default: ""
	},
	checkbox: {
		type: Boolean,
		default: !1
	},
	rowNumber: {
		type: Boolean,
		default: !1
	},
	acceptFiles: {
		type: String,
		default: ""
	}
});
//#endregion
//#region src/controllers/row_controller.js
var xl = class extends t {
	connect() {}
}, Sl = class extends t {
	connect() {}
}, Cl = class extends t {
	connect() {}
}, wl = class extends t {
	constructor(...e) {
		super(...e), Q(this, "_refresh", () => {
			let e = this._gridEl?.gridApi;
			if (!e) return;
			let t = e.paginationGetCurrentPage(), n = e.paginationGetTotalPages(), r = e.paginationGetRowCount(), i = e.paginationGetPageSize() || 1;
			if (this.hasPageInfoTarget) {
				let e = r === 0 ? 0 : t * i + 1, n = Math.min(r, e + i - 1);
				this.pageInfoTarget.textContent = r === 0 ? "0 rows" : `${e}–${n} of ${r}`;
			}
			this.hasFirstTarget && (this.firstTarget.disabled = t === 0), this.hasPrevTarget && (this.prevTarget.disabled = t === 0), this.hasNextTarget && (this.nextTarget.disabled = t >= n - 1), this.hasLastTarget && (this.lastTarget.disabled = t >= n - 1), this.hasPageSizeTarget && document.activeElement !== this.pageSizeTarget && (this.pageSizeTarget.value = String(i));
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
		for (let t of [
			"grid:paginationChanged",
			"grid:rowDataChanged",
			"grid:filterChanged",
			"grid:ready"
		]) e.addEventListener(t, this._refresh);
		e.gridApi && this._refresh();
	}
	_unwire(e) {
		for (let t of [
			"grid:paginationChanged",
			"grid:rowDataChanged",
			"grid:filterChanged",
			"grid:ready"
		]) e.removeEventListener(t, this._refresh);
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
		let t = parseInt(e.target.value, 10);
		Number.isFinite(t) && t > 0 && this._gridEl?.gridApi?.paginationSetPageSize(t);
	}
};
Q(wl, "outlets", ["grid"]), Q(wl, "targets", [
	"first",
	"prev",
	"next",
	"last",
	"pageInfo",
	"pageSize"
]);
//#endregion
//#region src/controllers/side_panel_controller.js
var Tl = [
	"sum",
	"avg",
	"count",
	"min",
	"max"
], El = "<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M3 3h5v18H3V3zm6.5 0h5v18h-5V3zM16 3h5v18h-5V3z\"/></svg>", Dl = "<svg viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M8 6h2v2H8V6zm6 0h2v2h-2V6zM8 11h2v2H8v-2zm6 0h2v2h-2v-2zM8 16h2v2H8v-2zm6 0h2v2h-2v-2z\"/></svg>", Ol = class extends t {
	connect() {
		this.grid = this.element.closest(".sg-grid"), this._activeTab = "columns", this._collapsed = !1, this._build(), this.grid?.gridApi ? this._render() : this.grid && this.grid.addEventListener("grid:ready", () => this._render(), { once: !0 }), this._gridListener = () => this._render();
		for (let e of [
			"grid:columnRowGroupChanged",
			"grid:columnPivotChanged",
			"grid:columnValueChanged",
			"grid:pivotModeChanged",
			"grid:columnVisible",
			"grid:rowDataChanged",
			"grid:columnStateApplied"
		]) this.grid?.addEventListener(e, this._gridListener);
	}
	disconnect() {
		if (!(!this.grid || !this._gridListener)) for (let e of [
			"grid:columnRowGroupChanged",
			"grid:columnPivotChanged",
			"grid:columnValueChanged",
			"grid:pivotModeChanged",
			"grid:columnVisible",
			"grid:rowDataChanged",
			"grid:columnStateApplied"
		]) this.grid.removeEventListener(e, this._gridListener);
	}
	_build() {
		this.element.innerHTML = "", this._content = E("div", { class: "sg-side-panel-content" });
		let e = E("div", { class: "sg-side-panel-tabs" });
		this._columnsTab = E("button", {
			type: "button",
			class: "sg-side-panel-tab",
			"aria-pressed": "true",
			title: "Columns"
		}), this._columnsTab.innerHTML = El, this._columnsTab.addEventListener("click", () => this._onTabClick("columns")), e.appendChild(this._columnsTab), this.element.append(this._content, e);
	}
	_onTabClick(e) {
		this._activeTab === e && !this._collapsed ? (this._collapsed = !0, this.element.classList.add("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", "false")) : (this._collapsed = !1, this._activeTab = e, this.element.classList.remove("sg-side-panel-collapsed"), this._columnsTab.setAttribute("aria-pressed", e === "columns" ? "true" : "false"), this._render());
	}
	_api() {
		return this.grid?.gridApi;
	}
	_columns() {
		return (this._api()?.getColumnDefs() || []).filter((e) => !e._isCheckbox && !e._isRowNumber && !e._isGroupCol && !e._isPivot);
	}
	_colByField(e) {
		return (this._api()?.getColumnDefs() || []).find((t) => t.field === e);
	}
	_render() {
		if (this._collapsed || this._activeTab !== "columns") return;
		let e = this._api();
		if (!e) return;
		this._content.innerHTML = "";
		let t = E("label", { class: "sg-panel-pivot-toggle" }), n = E("input", { type: "checkbox" });
		n.checked = e.isPivotMode(), n.addEventListener("change", () => e.setPivotMode(n.checked)), t.append(n, E("span", {}, "Pivot mode")), this._content.appendChild(t), this._content.appendChild(this._renderColumnsList()), this._content.appendChild(this._renderDropSection({
			title: "Row Groups",
			placeholder: "Drag here to group rows",
			kind: "rowGroup",
			fields: e.getRowGroupColumns()
		})), this._content.appendChild(this._renderValuesSection()), e.isPivotMode() && this._content.appendChild(this._renderDropSection({
			title: "Column Labels",
			placeholder: "Drag here to pivot columns",
			kind: "pivot",
			fields: e.getPivotColumns()
		}));
	}
	_renderColumnsList() {
		let e = this._api(), t = E("div", { class: "sg-panel-section" });
		t.appendChild(E("div", { class: "sg-panel-section-title" }, "Columns"));
		let n = E("ul", { class: "sg-column-list" });
		t.appendChild(n);
		let r = new Set(e.getRowGroupColumns()), i = new Set(e.getPivotColumns()), a = new Map(e.getValueColumns().map((e) => [e.field, e.aggFunc]));
		for (let t of this._columns()) {
			let o = E("li", {
				class: "sg-column-list-item",
				draggable: "true"
			});
			o.dataset.field = t.field;
			let s = E("span", {
				class: "sg-column-grip",
				"aria-hidden": "true"
			});
			s.innerHTML = Dl;
			let c = E("input", { type: "checkbox" });
			c.checked = !t.hidden, c.addEventListener("change", () => e.setColumnVisible(t.field, c.checked));
			let l = E("span", { class: "sg-column-list-label" }, t.headerName || t.field), u = E("span", { class: "sg-column-list-tags" });
			r.has(t.field) && u.appendChild(E("span", {
				class: "sg-tag sg-tag-group",
				title: "Row group"
			}, "group")), i.has(t.field) && u.appendChild(E("span", {
				class: "sg-tag sg-tag-pivot",
				title: "Pivot column"
			}, "pivot")), a.has(t.field) && u.appendChild(E("span", {
				class: "sg-tag sg-tag-value",
				title: `Value (${a.get(t.field)})`
			}, a.get(t.field))), o.append(s, c, l, u), this._wireDragSource(o, t.field), n.appendChild(o);
		}
		return this._wireDropZone(n, "columns"), t;
	}
	_renderDropSection({ title: e, placeholder: t, kind: n, fields: r }) {
		let i = E("div", { class: "sg-panel-section sg-panel-drop" });
		i.appendChild(E("div", { class: "sg-panel-section-title" }, e));
		let a = E("div", { class: "sg-drop-zone" });
		if (a.dataset.dropKind = n, !r.length) a.classList.add("sg-drop-zone-empty"), a.appendChild(E("span", { class: "sg-drop-placeholder" }, t));
		else for (let e of r) a.appendChild(this._renderChip(n, e));
		return this._wireDropZone(a, n), i.appendChild(a), i;
	}
	_renderValuesSection() {
		let e = this._api(), t = E("div", { class: "sg-panel-section sg-panel-drop" });
		t.appendChild(E("div", { class: "sg-panel-section-title" }, "Values"));
		let n = E("div", { class: "sg-drop-zone" });
		n.dataset.dropKind = "value";
		let r = e.getValueColumns();
		if (!r.length) n.classList.add("sg-drop-zone-empty"), n.appendChild(E("span", { class: "sg-drop-placeholder" }, "Drag here to aggregate"));
		else for (let { field: e, aggFunc: t } of r) n.appendChild(this._renderValueChip(e, t));
		return this._wireDropZone(n, "value"), t.appendChild(n), t;
	}
	_renderChip(e, t) {
		let n = this._colByField(t), r = E("span", {
			class: "sg-chip",
			draggable: "true"
		});
		return r.dataset.field = t, r.dataset.fromKind = e, r.append(E("span", { class: "sg-chip-label" }, n?.headerName || t), this._removeButton(() => this._removeFrom(e, t))), this._wireDragSource(r, t), r;
	}
	_renderValueChip(e, t) {
		let n = this._api(), r = this._colByField(e), i = E("span", {
			class: "sg-chip sg-chip-value",
			draggable: "true"
		});
		i.dataset.field = e, i.dataset.fromKind = "value";
		let a = E("button", {
			type: "button",
			class: "sg-chip-agg",
			title: "Click to cycle: sum → avg → count → min → max"
		}, t);
		return a.addEventListener("click", (r) => {
			r.stopPropagation();
			let i = Tl.indexOf(t), a = Tl[(i === -1 ? 0 : i + 1) % Tl.length];
			n.setColumnAggFunc(e, a);
		}), i.append(a, E("span", { class: "sg-chip-label" }, r?.headerName || e), this._removeButton(() => n.removeValueColumn(e))), this._wireDragSource(i, e), i;
	}
	_removeButton(e) {
		let t = E("button", {
			type: "button",
			class: "sg-chip-remove",
			"aria-label": "Remove",
			title: "Remove"
		});
		return t.textContent = "×", t.addEventListener("click", (t) => {
			t.stopPropagation(), e();
		}), t;
	}
	_wireDragSource(e, t) {
		e.addEventListener("dragstart", (n) => {
			n.dataTransfer.effectAllowed = "move", n.dataTransfer.setData("text/plain", t), e.classList.add("sg-dragging");
		}), e.addEventListener("dragend", () => e.classList.remove("sg-dragging"));
	}
	_wireDropZone(e, t) {
		e.addEventListener("dragover", (t) => {
			t.preventDefault(), t.dataTransfer.dropEffect = "move", e.classList.add("sg-drop-over");
		}), e.addEventListener("dragleave", (t) => {
			t.target === e && e.classList.remove("sg-drop-over");
		}), e.addEventListener("drop", (n) => {
			n.preventDefault(), e.classList.remove("sg-drop-over");
			let r = n.dataTransfer.getData("text/plain");
			r && this._handleDrop(t, r);
		});
	}
	_handleDrop(e, t) {
		let n = this._api();
		if (e === "columns") {
			this._removeEverywhere(t);
			return;
		}
		this._removeEverywhere(t, e), e === "rowGroup" ? n.addRowGroupColumn(t) : e === "pivot" ? n.addPivotColumn(t) : e === "value" && n.addValueColumn(t, "sum");
	}
	_removeFrom(e, t) {
		let n = this._api();
		e === "rowGroup" ? n.removeRowGroupColumn(t) : e === "pivot" ? n.removePivotColumn(t) : e === "value" && n.removeValueColumn(t);
	}
	_removeEverywhere(e, t = null) {
		let n = this._api();
		t !== "rowGroup" && n.removeRowGroupColumn(e), t !== "pivot" && n.removePivotColumn(e), t !== "value" && n.removeValueColumn(e);
	}
};
//#endregion
//#region src/index.js
function kl(t) {
	let n = t ?? e.start();
	return n.register("grid", hl), n.register("header-cell", bl), n.register("row", xl), n.register("cell", Sl), n.register("filter", Cl), n.register("pagination", wl), n.register("side-panel", Ol), n;
}
var Al = {
	start: kl,
	GridController: hl,
	HeaderCellController: bl,
	RowController: xl,
	CellController: Sl,
	FilterController: Cl,
	PaginationController: wl,
	SidePanelController: Ol,
	registerRenderer: k,
	getRenderer: A,
	listRenderers: je,
	renderers: nl
};
typeof window < "u" && !window.__stimulusGridStarted && (window.__stimulusGridStarted = !0, window.StimulusGrid = Al);
//#endregion
export { Sl as CellController, Cl as FilterController, hl as GridController, bl as HeaderCellController, wl as PaginationController, xl as RowController, Ol as SidePanelController, Al as default, A as getRenderer, je as listRenderers, k as registerRenderer, nl as renderers, kl as start };

//# sourceMappingURL=stimulus_grid.esm.js.map