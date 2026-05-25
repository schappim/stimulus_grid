/* Built-in cell renderers + a tiny registry.
 *
 * stimulus_grid's primary rendering path is the HTML `<template>` clone with
 * `data-bind`/`data-bind-attr` — perfect for shaped layouts. Some cases (URL
 * detection, currency formatting, ABN checksums, status pills with colour
 * maps) want a small function instead of a template. This module is that
 * function layer.
 *
 * A renderer is `(ctx) => HTMLElement | string | void`, where `ctx` is
 * `{ value, row, col, td, formatted }`. Return an element/string and we drop
 * it into the cell; return nothing and the renderer is assumed to have
 * mutated `td` directly. The grid resolves `col.cellRenderer` first as a
 * `<template>` id; when no template exists with that id, it falls through to
 * `getRenderer(name)` here.
 *
 * `statusPill(colorMap, iconMap?)` builds renderers in the badge-with-colour
 * family — the shape every "status" column in this codebase converges on.
 * Pass it once at app boot under whatever name fits ("subscription",
 * "fulfillment", "shipping-method", …) and reference that name from your
 * `<th>` markup. */

// Shared right-facing chevron — the same glyph the sort header, tree
// expand control, and master/detail caret use. Keeping it inline here
// (vs importing from grid_controller.js) avoids a controller→lib cycle
// and lets renderers run in isolation in tests.
const SG_CHEVRON_SVG = '<svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M471.1 297.4C483.6 309.9 483.6 330.2 471.1 342.7L279.1 534.7C266.6 547.2 246.3 547.2 233.8 534.7C221.3 522.2 221.3 501.9 233.8 489.4L403.2 320L233.9 150.6C221.4 138.1 221.4 117.8 233.9 105.3C246.4 92.8 266.7 92.8 279.2 105.3L471.1 297.4z"/></svg>';

import { encodeQR, qrToSVG } from './qr.js';

const REGISTRY = new Map();

export function registerRenderer(name, fn) {
  if (typeof name !== 'string' || !name) throw new Error('registerRenderer: name must be a non-empty string');
  if (typeof fn !== 'function') throw new Error('registerRenderer: fn must be a function');
  REGISTRY.set(name, fn);
}

export function getRenderer(name) {
  return REGISTRY.get(name) || null;
}

export function listRenderers() {
  return Array.from(REGISTRY.keys());
}

/* ---------- clipboard contract: copyValue + parseValue --------------
 *
 * Cell renderers are display-only — they take a raw value and return a
 * DOM node. For copy/paste round-trips, a renderer may ALSO declare:
 *
 *   fn.copyValue(ctx)            → string written to the clipboard
 *   fn.parseValue(text, ctx)     → coerced value (or `undefined` to skip)
 *
 * The grid's Cmd/Ctrl+C handler reads `copyValue` first, falling back to
 * `formatValue(row, col)`. Cmd/Ctrl+V parses each pasted cell through the
 * column's `parseValue`, then writes the result (firing the same
 * `grid:cellValueChanged` event the inline editor uses).
 *
 * Returning `undefined` from `parseValue` rejects the value — the grid
 * skips that cell and includes it in `grid:pasteRejected.detail.rejected`
 * so apps can surface a toast. Returning anything else (including the raw
 * text) commits it; renderers with built-in validation (abn, acn,
 * credit-card …) deliberately commit raw text so their invalid-styling
 * surfaces to the user instead of silently dropping the paste. */

// Helper: attach copy/parse to a renderer factory's result. Returns the
// same function for chaining at the end of `currency(…)`-style factories.
function withClipboard(fn, { copy, parse } = {}) {
  if (typeof copy  === 'function') fn.copyValue  = copy;
  if (typeof parse === 'function') fn.parseValue = parse;
  return fn;
}

const BOOL_TRUTHY_STRINGS = new Set(['1', 'true', 't', 'yes', 'y', 'on', '✓', 'checked']);
const BOOL_FALSY_STRINGS  = new Set(['0', 'false', 'f', 'no', 'n', 'off', '✗', 'unchecked', '-', '—']);

// Default parser used when a column has no renderer (or its renderer
// hasn't opted into parseValue). Exported so grid_controller can call it
// from its paste handler — keeps the type-coercion logic in one place.
export function defaultParseValue(text, col) {
  const s = String(text ?? '');
  if (s === '') return '';
  switch (col?.type) {
    case 'number': {
      const cleaned = s.replace(/[,$£€¥\s]/g, '').replace(/%$/, '');
      const n = Number(cleaned);
      return Number.isFinite(n) ? n : undefined;
    }
    case 'boolean': {
      const k = s.trim().toLowerCase();
      if (BOOL_TRUTHY_STRINGS.has(k)) return true;
      if (BOOL_FALSY_STRINGS.has(k))  return false;
      return undefined;
    }
    case 'date': {
      const d = new Date(s);
      return Number.isNaN(d.valueOf()) ? undefined : s;
    }
    default:
      return s;
  }
}

// Default copy used when a renderer hasn't opted into copyValue. The
// grid passes the already-computed `formatted` (from model.formatValue)
// so this stays a one-liner — kept here so renderers can compose
// ("formatted, plus an extra annotation").
export function defaultCopyValue(value, _col, formatted) {
  if (formatted != null && formatted !== '') return formatted;
  return value == null ? '' : String(value);
}

// Helpers — shared between several built-in renderers' parseValue impls.

// Strip currency / percent / thousands-separator noise to a bare number.
function parseNumeric(text) {
  if (text == null || text === '') return undefined;
  const cleaned = String(text).replace(/[,$£€¥\s]/g, '').replace(/%$/, '');
  if (cleaned === '' || cleaned === '-' || cleaned === '.') return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

// Parse "true" / "false" / "1" / "0" / "yes" / "✓" — same set as the
// boolean renderer's defaultIsTruthy plus an explicit falsy match.
function parseBooleanText(text) {
  const k = String(text ?? '').trim().toLowerCase();
  if (k === '') return undefined;
  if (BOOL_TRUTHY_STRINGS.has(k)) return true;
  if (BOOL_FALSY_STRINGS.has(k))  return false;
  return undefined;
}

// Small utility: create an element with attrs + (optional) text or children.
function h(tag, attrs = {}, content = null) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') node.className = v;
    else node.setAttribute(k, v === true ? '' : String(v));
  }
  if (content == null) return node;
  if (Array.isArray(content)) content.forEach((c) => node.append(c));
  else if (typeof content === 'string') node.innerHTML = content;
  else node.append(content);
  return node;
}

const isBlank = (v) => v == null || v === '';

/* ---------- email ----------------------------------------------------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function email() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const text = String(value);
    if (!EMAIL_RE.test(text)) {
      return h('span', { class: 'sg-renderer-invalid', title: 'Invalid email' }, document.createTextNode(text));
    }
    return h('a', {
      class: 'sg-renderer-link',
      href: `mailto:${text}`,
      title: 'Send email',
    }, document.createTextNode(text));
  };
}

/* ---------- url ------------------------------------------------------- */

export function url({ newTab = true } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const text = String(value);
    let parsed;
    try { parsed = new URL(text); } catch { return document.createTextNode(text); }
    return h('a', {
      class: 'sg-renderer-link',
      href: text,
      target: newTab ? '_blank' : null,
      rel: newTab ? 'noopener noreferrer' : null,
      title: text,
    }, document.createTextNode(parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : '')));
  };
}

/* ---------- phone ---------------------------------------------------- */

// Light AU-friendly phone formatter — no libphonenumber dependency. Falls back
// to "tel:<digits>" with the original value as visible text for anything we
// can't confidently format. Override with your own renderer for full
// international parsing.
export function phone({ defaultRegion = 'AU' } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const text = String(value).trim();
    const digits = text.replace(/\D/g, '');
    if (!digits) return document.createTextNode(text);
    let display = text;
    if (defaultRegion === 'AU') {
      // Mobile: 04xx xxx xxx (10 digits starting 04)
      if (/^04\d{8}$/.test(digits)) {
        display = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
      } else if (/^0[2378]\d{8}$/.test(digits)) {
        // Landline: (0X) XXXX XXXX
        display = `(${digits.slice(0, 2)}) ${digits.slice(2, 6)} ${digits.slice(6)}`;
      } else if (/^1[38]00\d{6}$/.test(digits)) {
        // 1300/1800: 1300 XXX XXX
        display = `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
      } else if (digits.length === 8) {
        display = `${digits.slice(0, 4)} ${digits.slice(4)}`;
      }
    }
    return h('a', { class: 'sg-renderer-link', href: `tel:${digits}` }, document.createTextNode(display));
  };
}

/* ---------- currency / percent --------------------------------------- */

export function currency({ currency: ccy = 'USD', locale = 'en-US', decimals } = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    const opts = { style: 'currency', currency: ccy };
    if (decimals != null) { opts.minimumFractionDigits = decimals; opts.maximumFractionDigits = decimals; }
    return n.toLocaleString(locale, opts);
  };
}

export function percent({ decimals = 0, scale = 'as-is' } = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    let n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    if (scale === 'fraction') n *= 100;          // 0.42 → 42%
    return `${n.toFixed(decimals)}%`;
  };
}

/* ---------- date / datetime / relative-time / duration ------------- */

// Coerce a string/number/Date into a Date or null. Mirrors model.js#toDate
// behaviour so renderers and sort/filter agree on what counts as a date.
function toDate(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) return Number.isNaN(v.valueOf()) ? null : v;
  const d = new Date(v);
  return Number.isNaN(d.valueOf()) ? null : d;
}

export function date({ locale = undefined, dateStyle = 'medium', ...opts } = {}) {
  // Build the formatter once at registration time, not per cell — Intl
  // formatters are cheap to use but expensive to construct.
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle, ...opts });
  return ({ value }) => {
    const d = toDate(value);
    return d ? fmt.format(d) : '';
  };
}

export function datetime({ locale = undefined, dateStyle = 'medium', timeStyle = 'short', ...opts } = {}) {
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle, timeStyle, ...opts });
  return ({ value }) => {
    const d = toDate(value);
    return d ? fmt.format(d) : '';
  };
}

// "3 days ago" / "in 2 hours". Computed at render time against Date.now(),
// so the value moves naturally as the grid re-renders. The original date
// goes in a title= attribute so users can hover for the exact timestamp.
// Auto-refresh (per-cell timer) is intentionally not built in — schedule
// it from outside if you need ticking timestamps.
const REL_THRESHOLDS = [
  { unit: 'second', ms: 1000,             cutoff: 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000,        cutoff: 60 * 60 * 1000 },
  { unit: 'hour',   ms: 60 * 60 * 1000,   cutoff: 24 * 60 * 60 * 1000 },
  { unit: 'day',    ms: 24 * 60 * 60 * 1000, cutoff: 7 * 24 * 60 * 60 * 1000 },
  { unit: 'week',   ms: 7 * 24 * 60 * 60 * 1000, cutoff: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'month',  ms: 30 * 24 * 60 * 60 * 1000, cutoff: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'year',   ms: 365 * 24 * 60 * 60 * 1000, cutoff: Infinity },
];

export function relativeTime({ locale = undefined, numeric = 'auto', style = 'long' } = {}) {
  const fmt = new Intl.RelativeTimeFormat(locale, { numeric, style });
  return ({ value }) => {
    const d = toDate(value);
    if (!d) return '';
    const diffMs = d.getTime() - Date.now();
    const abs = Math.abs(diffMs);
    const slot = REL_THRESHOLDS.find((t) => abs < t.cutoff) || REL_THRESHOLDS[REL_THRESHOLDS.length - 1];
    const n = Math.round(diffMs / slot.ms);
    const span = h('span', { class: 'sg-renderer-relative-time', title: d.toLocaleString() });
    span.textContent = fmt.format(n, slot.unit);
    return span;
  };
}

// `unit` of the input value: 'ms' | 'sec' | 'min'. `style` controls output
// shape: 'compact' = "2h 14m" (drops zero parts), 'clock' = "02:14:32" (or
// "14:32" without an hours part), 'words' = "2 hours 14 minutes".
const DURATION_UNIT_MS = { ms: 1, sec: 1000, second: 1000, min: 60000, minute: 60000, hr: 3600000, hour: 3600000 };

export function duration({ unit = 'ms', style = 'compact' } = {}) {
  const factor = DURATION_UNIT_MS[unit] ?? 1;
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    const ms = Number(value) * factor;
    if (!Number.isFinite(ms)) return String(value);
    const sign = ms < 0 ? '-' : '';
    const total = Math.abs(ms);
    const hrs  = Math.floor(total / 3600000);
    const mins = Math.floor((total % 3600000) / 60000);
    const secs = Math.floor((total % 60000) / 1000);
    if (style === 'clock') {
      const pad = (n) => String(n).padStart(2, '0');
      return sign + (hrs > 0 ? `${pad(hrs)}:${pad(mins)}:${pad(secs)}` : `${pad(mins)}:${pad(secs)}`);
    }
    if (style === 'words') {
      const parts = [];
      if (hrs)  parts.push(`${hrs} ${hrs === 1 ? 'hour' : 'hours'}`);
      if (mins) parts.push(`${mins} ${mins === 1 ? 'minute' : 'minutes'}`);
      if (!hrs && secs) parts.push(`${secs} ${secs === 1 ? 'second' : 'seconds'}`);
      return sign + (parts.join(' ') || '0 seconds');
    }
    const parts = [];
    if (hrs)  parts.push(`${hrs}h`);
    if (mins) parts.push(`${mins}m`);
    if (!hrs && secs) parts.push(`${secs}s`);
    return sign + (parts.join(' ') || '0s');
  };
}

/* ---------- number / compact-number / file-size --------------------- */

// Plain number — comma-grouped, configurable decimals. Sibling to
// currency/percent — same right-aligned tabular-nums treatment so columns
// of numbers line up at the decimal.
export function number({ locale = undefined, decimals, ...opts } = {}) {
  const fmtOpts = { ...opts };
  if (decimals != null) {
    fmtOpts.minimumFractionDigits = decimals;
    fmtOpts.maximumFractionDigits = decimals;
  }
  const fmt = new Intl.NumberFormat(locale, fmtOpts);
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    return fmt.format(n);
  };
}

// Compact: 1,234,567 → "1.2M". `compactDisplay: 'short'` is the default
// (1.2K / 3.4M / 1.2B); pass 'long' for "1.2 million" via Intl.
export function compactNumber({ locale = undefined, compactDisplay = 'short', maximumFractionDigits = 1 } = {}) {
  const fmt = new Intl.NumberFormat(locale, {
    notation: 'compact', compactDisplay, maximumFractionDigits,
  });
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    return fmt.format(n);
  };
}

// File size — bytes → KB / MB / GB / TB / PB. Uses 1024 ('binary', default,
// matches macOS / Windows on-disk display) or 1000 ('decimal', matches
// disk-manufacturer marketing). `decimals` default 1; set to 0 for
// "234 KB" instead of "234.0 KB".
export function fileSize({ binary = true, decimals = 1, locale = undefined } = {}) {
  const base = binary ? 1024 : 1000;
  const units = binary
    ? ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB']
    : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const fmt = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  });
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    let n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    const sign = n < 0 ? '-' : '';
    n = Math.abs(n);
    let idx = 0;
    while (n >= base && idx < units.length - 1) { n /= base; idx += 1; }
    // Bytes never want decimals — "143 B" reads cleaner than "143.0 B".
    const formatted = idx === 0 ? String(Math.round(n)) : fmt.format(n);
    return `${sign}${formatted} ${units[idx]}`;
  };
}

/* ---------- boolean ------------------------------------------------- */

// Treats any "truthy-looking" value as true: literal true, 1, "1", "y",
// "yes", "t", "true", "on" (case-insensitive). Everything else that isn't
// blank (null / undefined / "") counts as false. Pass `truthy` to override
// — e.g. truthy: (v) => v === 'ACTIVE' for column-specific semantics.
const BOOL_TRUTHY = new Set(['1', 'true', 't', 'yes', 'y', 'on']);
function defaultIsTruthy(v) {
  if (v === true || v === 1) return true;
  if (v == null || v === '' || v === false || v === 0) return false;
  return BOOL_TRUTHY.has(String(v).toLowerCase());
}

const BOOL_CHECK_SVG = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>';
const BOOL_X_SVG     = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>';

// Visual boolean: filled green check / hollow red X, with a dash for
// null/undefined. Drops the text-only ✓ that the type='boolean'
// formatValue path uses. Pass `nullLabel` to override the dash (e.g.
// 'N/A', '—'); pass `falseStyle: 'hidden'` if a false cell should just
// be blank instead of showing the red X.
export function boolean({
  truthy = defaultIsTruthy,
  nullLabel = '—',
  falseStyle = 'icon',                  // 'icon' | 'hidden'
} = {}) {
  return ({ value }) => {
    if (value == null || value === '') {
      return h('span', { class: 'sg-renderer-bool-null' }, document.createTextNode(nullLabel));
    }
    if (truthy(value)) {
      const node = h('span', { class: 'sg-renderer-bool is-true', 'aria-label': 'true' });
      node.innerHTML = BOOL_CHECK_SVG;
      return node;
    }
    if (falseStyle === 'hidden') return '';
    const node = h('span', { class: 'sg-renderer-bool is-false', 'aria-label': 'false' });
    node.innerHTML = BOOL_X_SVG;
    return node;
  };
}

/* ---------- delta / change ------------------------------------------ */

// Signed value with an up/down arrow and green/red text — the dashboard
// staple for "+12.5% vs last week". `style` controls the suffix: 'percent'
// adds %, 'number' renders the raw number, 'currency' formats as money.
// `inverted: true` flips the colour semantics (positive = red, negative =
// green) — useful for "error rate" or "churn" columns where a fall is good.
const ARROW_UP    = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/></svg>';
const ARROW_DOWN  = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M169.4 470.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 370.7 224 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 306.7L54.6 265.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"/></svg>';
const ARROW_RIGHT = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M64 256a32 32 0 1 0 0-64H384V160c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l96 96c12.5 12.5 12.5 32.8 0 45.3l-96 96c-9.2 9.2-22.9 11.9-34.9 6.9S384 364.9 384 352V320H64z"/></svg>';

export function delta({
  style = 'percent',                  // 'percent' | 'number' | 'currency'
  decimals = 1,
  locale = undefined,
  currency: ccy = 'USD',
  inverted = false,
  showSign = true,
} = {}) {
  let fmt;
  if (style === 'currency') {
    fmt = new Intl.NumberFormat(locale, {
      style: 'currency', currency: ccy,
      minimumFractionDigits: decimals, maximumFractionDigits: decimals,
      signDisplay: showSign ? 'always' : 'auto',
    });
  } else {
    fmt = new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals, maximumFractionDigits: decimals,
      signDisplay: showSign ? 'always' : 'auto',
    });
  }
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    let dirClass = 'is-flat', arrow = ARROW_RIGHT;
    const positiveGood = !inverted;
    if (n > 0) { dirClass = positiveGood ? 'is-up' : 'is-down'; arrow = ARROW_UP; }
    else if (n < 0) { dirClass = positiveGood ? 'is-down' : 'is-up'; arrow = ARROW_DOWN; }
    const wrap = h('span', { class: `sg-renderer-delta ${dirClass}` });
    const ic = h('span', { class: 'sg-renderer-delta-icon', 'aria-hidden': 'true' });
    ic.innerHTML = arrow;
    const label = style === 'percent' ? `${fmt.format(n)}%` : fmt.format(n);
    wrap.append(ic);
    wrap.append(h('span', { class: 'sg-renderer-delta-value' }, document.createTextNode(label)));
    return wrap;
  };
}

/* ---------- truncate / copyable ------------------------------------- */

// Long-text column with single-line ellipsis and the full value in the
// title attribute so users can hover for the rest. `chars` clips by
// character count; leave it null for pure CSS overflow (cell width
// decides). Setting `chars` to a number returns a "Foo bar baz…" string
// when the value exceeds that length.
export function truncate({ chars = null } = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    const text = String(value);
    let display = text;
    let clipped = false;
    if (chars && text.length > chars) {
      display = text.slice(0, chars) + '…';
      clipped = true;
    }
    if (td) {
      td.classList.add('sg-renderer-truncate');
      td.setAttribute('title', text);
    }
    if (clipped) {
      return display;
    }
    // Pure CSS path — let .sg-renderer-truncate cap at the cell width.
    return text;
  };
}

const COPY_SVG = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M384 336H192c-8.8 0-16-7.2-16-16V64c0-8.8 7.2-16 16-16h140.1L400 115.9V320c0 8.8-7.2 16-16 16zM192 384H384c35.3 0 64-28.7 64-64V115.9c0-12.7-5.1-24.9-14.1-33.9L366.1 14.1c-9-9-21.2-14.1-33.9-14.1H192c-35.3 0-64 28.7-64 64V320c0 35.3 28.7 64 64 64zM64 128c-35.3 0-64 28.7-64 64V448c0 35.3 28.7 64 64 64H256c35.3 0 64-28.7 64-64V416H272v32c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192c0-8.8 7.2-16 16-16H96V128H64z"/></svg>';
const COPY_OK_SVG = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>';

// Value + a tiny copy-to-clipboard button. On click, copies the cell value
// to the clipboard via navigator.clipboard.writeText and briefly swaps the
// icon to a check mark. Falls back to a textarea-execCommand hack on
// browsers without the Clipboard API (rare in 2026, but cheap insurance).
// The cell's text content is unchanged — useful in cell selection / copy
// flows that read textContent.
export function copyable({ position = 'after' } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const text = String(value);
    const wrap = h('span', { class: 'sg-renderer-copyable' });
    const label = h('span', { class: 'sg-renderer-copyable-value' }, document.createTextNode(text));
    const btn = h('button', {
      type: 'button',
      class: 'sg-renderer-copyable-btn',
      title: 'Copy',
      'aria-label': `Copy ${text}`,
    });
    btn.innerHTML = COPY_SVG;
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
        else fallbackCopy(text);
        btn.innerHTML = COPY_OK_SVG;
        btn.classList.add('is-copied');
        setTimeout(() => {
          btn.innerHTML = COPY_SVG;
          btn.classList.remove('is-copied');
        }, 1200);
      } catch (err) { /* swallow — UI feedback is the failure signal */ }
    });
    if (position === 'before') { wrap.append(btn, label); }
    else { wrap.append(label, btn); }
    return wrap;
  };
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (_) { /* swallow */ }
  document.body.removeChild(ta);
}

/* ---------- image (thumbnail) --------------------------------------- */

// Small inline thumbnail. The cell value is the image URL; `alt` is read
// from `row[altField]` (default 'alt') so screen readers get meaningful
// text. Pass `clickToZoom: true` for a lightweight click → centred
// fullscreen overlay (close with click or Escape) — no library, no
// portal, no React.
export function image({
  size = 36,
  rounded = 'sm',                  // 'sm' = 4px, 'lg' = 8px, 'full' = circle, 'none'
  altField = 'alt',
  clickToZoom = false,
} = {}) {
  const radius = rounded === 'full' ? '999px'
               : rounded === 'lg'   ? '8px'
               : rounded === 'none' ? '0'
               : '4px';
  return ({ value, row }) => {
    if (isBlank(value)) return '';
    const src = String(value);
    const alt = row?.[altField] ?? '';
    const img = h('img', {
      src,
      alt,
      class: 'sg-renderer-image',
      width: String(size),
      height: String(size),
      style: `border-radius: ${radius};`,
      loading: 'lazy',
      decoding: 'async',
    });
    if (!clickToZoom) return img;
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', (e) => {
      e.stopPropagation();
      openImageZoom(src, alt);
    });
    return img;
  };
}

function openImageZoom(src, alt) {
  const overlay = h('div', { class: 'sg-image-zoom' });
  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  };
  const onKey = (e) => { if (e.key === 'Escape') close(); };
  overlay.addEventListener('click', close);
  document.addEventListener('keydown', onKey);
  overlay.append(h('img', { src, alt: alt || '', class: 'sg-image-zoom-img' }));
  document.body.appendChild(overlay);
}

/* ---------- color swatch -------------------------------------------- */

// Coloured chip + label. Accepts any CSS colour the browser groks: hex
// (#f59e0b, #f5b), rgb()/rgba()/hsl()/hsla(), named colours, oklch(),
// etc. — we pass it straight to background-color and let the engine
// validate. `showLabel: false` for a label-less swatch (great for
// dense palette previews); `label: 'name'|'value'|fn` controls what
// text appears beside the chip (default 'value' — just the cell value).
export function colorSwatch({
  showLabel = true,
  label = 'value',                       // 'value' | 'name' | (value, row) => string
  shape = 'circle',                      // 'circle' | 'square'
  size = 14,
} = {}) {
  return ({ value, row }) => {
    if (isBlank(value)) return '';
    const color = String(value).trim();
    const wrap = h('span', { class: 'sg-renderer-swatch' });
    const chip = h('span', {
      class: `sg-renderer-swatch-chip is-${shape}`,
      style: `width: ${size}px; height: ${size}px; background: ${color};`,
      'aria-hidden': 'true',
    });
    wrap.append(chip);
    if (showLabel) {
      const text = typeof label === 'function' ? label(value, row)
                 : label === 'name' ? (row?.name ?? color) : color;
      wrap.append(h('span', { class: 'sg-renderer-swatch-label' }, document.createTextNode(text)));
    }
    return wrap;
  };
}

/* ---------- sparkline ----------------------------------------------- */

// Mini SVG line / area / bar chart from a numeric array. Auto-scales the
// y-axis to [min, max] across the values (or pass `baseline: 0` to lock
// the min at zero — better for "did we go up from nothing?" stories).
// Pure SVG with sensible defaults: 80×24, soft stroke + transparent
// fill for `line`; filled wash under the stroke for `area`; even-width
// bars for `bar`. Last point gets a small dot. Width / height / colour
// configurable.
const SPARK_COLORS = {
  blue:   '#3b82f6',
  green:  '#10b981',
  red:    '#ef4444',
  orange: '#f97316',
  purple: '#8b5cf6',
  pink:   '#ec4899',
  gray:   '#6b7280',
};

export function sparkline({
  type = 'line',                    // 'line' | 'area' | 'bar'
  width = 80,
  height = 24,
  color = 'blue',                   // palette key OR raw CSS colour
  baseline = null,                  // null = auto-min, 0 = lock min at zero, N = lock at N
  showLast = true,                  // small dot on the last point (line / area only)
} = {}) {
  const stroke = SPARK_COLORS[color] || color;
  return ({ value }) => {
    if (!Array.isArray(value) || value.length === 0) return '';
    const data = value.map(Number).filter((n) => Number.isFinite(n));
    if (data.length === 0) return '';

    const minVal = baseline != null ? baseline : Math.min(...data);
    const maxVal = Math.max(...data, baseline != null ? baseline : -Infinity);
    const range = (maxVal - minVal) || 1;             // avoid divide-by-zero on flatlines

    // Inset by a couple of pixels on every side so stroke ends + dot
    // edges don't clip against the viewBox.
    const padX = 1.5, padY = 2.5;
    const w = width  - padX * 2;
    const ph = height - padY * 2;
    const xAt = (i) => padX + (data.length === 1 ? w / 2 : (i / (data.length - 1)) * w);
    const yAt = (v) => padY + ph - ((v - minVal) / range) * ph;

    let inner = '';
    if (type === 'bar') {
      const barGap = 1;
      const barW = Math.max(1, (w - (data.length - 1) * barGap) / data.length);
      for (let i = 0; i < data.length; i++) {
        const v = data[i];
        const x = padX + i * (barW + barGap);
        const y = yAt(v);
        const bh = padY + ph - y;
        inner += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barW.toFixed(2)}" height="${bh.toFixed(2)}" fill="${stroke}"/>`;
      }
    } else {
      let path = '';
      for (let i = 0; i < data.length; i++) {
        path += `${i === 0 ? 'M' : 'L'} ${xAt(i).toFixed(2)} ${yAt(data[i]).toFixed(2)} `;
      }
      if (type === 'area') {
        const areaPath = path
          + ` L ${xAt(data.length - 1).toFixed(2)} ${(padY + ph).toFixed(2)}`
          + ` L ${xAt(0).toFixed(2)} ${(padY + ph).toFixed(2)} Z`;
        inner += `<path d="${areaPath}" fill="${stroke}" fill-opacity="0.18" stroke="none"/>`;
      }
      inner += `<path d="${path.trim()}" fill="none" stroke="${stroke}" stroke-width="1.4"`
            +  ` stroke-linecap="round" stroke-linejoin="round"/>`;
      if (showLast) {
        const lx = xAt(data.length - 1);
        const ly = yAt(data[data.length - 1]);
        inner += `<circle cx="${lx.toFixed(2)}" cy="${ly.toFixed(2)}" r="1.8" fill="${stroke}"/>`;
      }
    }
    // Return the SVG as an HTML string so the grid sets it via innerHTML
    // on the cell — keeps the SVG in the correct namespace without us
    // having to fiddle with document.createElementNS.
    return `<svg class="sg-renderer-sparkline is-${type}" viewBox="0 0 ${width} ${height}"`
         + ` width="${width}" height="${height}" preserveAspectRatio="none" aria-hidden="true">`
         + inner
         + `</svg>`;
  };
}

/* ---------- heatmap cell -------------------------------------------- */

// Parse "#rrggbb" / "#rgb" into [r, g, b]. Returns null for anything else
// (named colours, rgba(), oklch() — those don't interpolate sensibly with
// channel-mixing math and are out of scope for the heatmap mapper).
function hexToRgb(hex) {
  if (typeof hex !== 'string') return null;
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex(r, g, b) {
  const h = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}
// Mix two RGB triples by a 0-1 ratio (0 = first, 1 = second).
function mixRgb(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}
// W3C-friendly approximation of perceived luminance, used to pick a
// readable text colour against the heatmap background.
function isLightRgb([r, g, b]) {
  return (0.299 * r + 0.587 * g + 0.114 * b) >= 145;
}

// Map a value to one of N colour stops by linear interpolation. Default
// palette is the spreadsheet classic (green low → yellow mid → red high).
// `inverted: true` flips the mapping (green high → red low) — handy for
// "lower is better" columns. Text colour is auto-picked (#111 on light
// fills, #fff on dark fills) so the cell stays readable.
export function heatmap({
  min = 0,
  max = 100,
  colors = ['#dcfce7', '#fef3c7', '#fecaca'],
  inverted = false,
  showValue = true,
  format = null,                     // (value) => string for custom labels
} = {}) {
  const stops = colors.map(hexToRgb).filter(Boolean);
  if (stops.length < 2) throw new Error('heatmap: need at least two valid hex colours');
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-heatmap');
    if (isBlank(value)) return '';
    let n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    let t = (max - min) === 0 ? 0.5 : (n - min) / (max - min);
    t = Math.max(0, Math.min(1, t));
    if (inverted) t = 1 - t;
    // Position t across (stops.length - 1) segments; pick the segment, then
    // mix its two endpoints by the within-segment fraction.
    const seg = t * (stops.length - 1);
    const i = Math.min(stops.length - 2, Math.floor(seg));
    const local = seg - i;
    const rgb = mixRgb(stops[i], stops[i + 1], local);
    if (td) {
      td.style.backgroundColor = rgbToHex(...rgb);
      td.style.color = isLightRgb(rgb) ? '#111827' : '#ffffff';
    }
    if (!showValue) return '';
    if (typeof format === 'function') return format(value);
    return String(value);
  };
}

/* ---------- mask (sensitive data) ----------------------------------- */

// Common shorthand formats — the right "shape" for a given kind of value.
// Pass `format: 'cc-last4'` (or any of the keys below) to skip the manual
// showFirst/showLast/separator wiring.
const MASK_FORMATS = {
  // Credit card: 16 digits grouped 4-4-4-4, last 4 visible. Handles 13-19
  // digit lengths gracefully (Amex 15, others 16). Non-digits are stripped.
  'cc-last4': (text, char) => groupedMask(text.replace(/\D/g, ''), 4, 4, char, ' '),
  // BIN + last4: show the first 6 + last 4, mask the middle (PCI-friendly).
  'cc-bin-last4': (text, char) => groupedMask(text.replace(/\D/g, ''), 4, 4, char, ' ', 6),
  // Phone: show the last 4 digits, mask the rest as a single bullet
  // block ("•••••• 1234"). Sidesteps the country-specific 3-3-4 / 4-3-3
  // grouping ambiguity — register your own variant if you need a
  // region-specific layout.
  'phone-last4': (text, char) => {
    const d = text.replace(/\D/g, '');
    if (!d) return text;
    if (d.length <= 4) return d;
    return char.repeat(d.length - 4) + ' ' + d.slice(-4);
  },
  // Email: show first char + domain ("a••••@example.com").
  'email': (text, char) => {
    const m = String(text).match(/^([^@\s]+)(@.+)$/);
    if (!m) return text;
    return m[1][0] + char.repeat(Math.max(1, m[1].length - 1)) + m[2];
  },
  // SSN / ABN-style: show last 4.
  'last4': (text, char) => maskAllButLast(text, 4, char),
};

function maskAllButLast(text, n, char) {
  const t = String(text);
  if (t.length <= n) return t;
  return char.repeat(t.length - n) + t.slice(-n);
}

// Group a digit string into chunks (default 4 wide) with a separator
// between groups, mask everything except the leading `showFirst` digits
// and the trailing `showLast` digits. Grouping is right-aligned so the
// last `showLast` characters always form a clean trailing block —
// matters for Amex (15 digits) and other non-multiple-of-4 lengths.
function groupedMask(digits, groupSize, showLast, char, sep, showFirst = 0) {
  if (!digits) return '';
  const total = digits.length;
  const masked = digits.split('').map((d, i) => {
    if (i < showFirst) return d;
    if (i >= total - showLast) return d;
    return char;
  }).join('');
  const out = [];
  for (let end = masked.length; end > 0; end -= groupSize) {
    out.unshift(masked.slice(Math.max(0, end - groupSize), end));
  }
  return out.join(sep);
}

// Numeric formats — masked digits live in tabular columns and read
// cleaner right-aligned with a monospace face so the bullets line up
// vertically column-to-column.
const MASK_NUMERIC_FORMATS = new Set(['cc-last4', 'cc-bin-last4', 'phone-last4', 'last4']);

// Mask a value for display. Either pass a `format` preset (cc-last4,
// cc-bin-last4, phone-last4, email, last4) or a generic
// { showFirst, showLast, char } config. Blank values render blank.
// `align` overrides auto-detection: pass `'right'` to force right-align
// on a generic mask, or `'left'` to suppress right-align on a numeric
// preset.
export function mask({
  format = null,
  showFirst = 0,
  showLast = 4,
  char = '•',
  align = null,                     // 'left' | 'right' | null (auto)
} = {}) {
  const preset = format ? MASK_FORMATS[format] : null;
  const autoNumeric = format ? MASK_NUMERIC_FORMATS.has(format) : false;
  const rightAlign = align === 'right' || (align !== 'left' && autoNumeric);
  return ({ value, td }) => {
    if (td && rightAlign) td.classList.add('sg-renderer-mask-numeric');
    if (isBlank(value)) return '';
    const text = String(value);
    if (preset) return preset(text, char);
    const head = text.slice(0, showFirst);
    const tail = showLast > 0 ? text.slice(-showLast) : '';
    const middleLen = Math.max(0, text.length - showFirst - showLast);
    return head + char.repeat(middleLen) + tail;
  };
}

/* ---------- highlight (quickFilter matches) ------------------------- */

// Wrap matches of the active quick-filter (or any explicit `query`) in
// <mark> tags so users can see *why* a row was matched. Reads the live
// query from the gridApi we pass into every renderer call, so it updates
// naturally on every quickFilter change (the grid re-renders rows, the
// renderer re-runs).
//
// Defaults to case-insensitive matching; pass `{ caseSensitive: true }`
// for case-sensitive. The HTML `<mark>` element is the right primitive
// here — accessible, styleable, and what every search tool reaches for.
export function highlight({
  query = null,
  caseSensitive = false,
  className = 'sg-renderer-mark',
} = {}) {
  return ({ value, api }) => {
    if (isBlank(value)) return '';
    const text = String(value);
    const q = query != null ? String(query) : (api?.getQuickFilter?.() || '');
    if (!q) return document.createTextNode(text);
    return wrapHighlightMatches(text, q, caseSensitive, className);
  };
}

function wrapHighlightMatches(text, q, caseSensitive, className) {
  const haystack = caseSensitive ? text : text.toLowerCase();
  const needle   = caseSensitive ? q    : q.toLowerCase();
  const wrap = document.createElement('span');
  let i = 0;
  while (i < text.length) {
    const idx = haystack.indexOf(needle, i);
    if (idx === -1) {
      wrap.appendChild(document.createTextNode(text.slice(i)));
      break;
    }
    if (idx > i) wrap.appendChild(document.createTextNode(text.slice(i, idx)));
    const mark = document.createElement('mark');
    mark.className = className;
    mark.textContent = text.slice(idx, idx + q.length);
    wrap.appendChild(mark);
    i = idx + q.length;
  }
  return wrap;
}

/* ---------- multi-line --------------------------------------------- */

// Preserve "\n" newlines in the cell + optionally line-clamp to N lines
// with an ellipsis. The full value still goes into title= so users can
// hover for the rest. The grid uses a fixed row height by default; for
// 2-3 lines of text bump data-grid-row-height-value on the grid element
// to a number that fits (e.g. 64 for two lines, 80 for three).
export function multiLine({ lines = null, separator = '\n' } = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    const raw = String(value);
    const text = separator === '\n' ? raw : raw.split(separator).join('\n');
    if (td) {
      td.classList.add('sg-renderer-multiline');
      td.setAttribute('title', text);
      // Mark the row so every cell in it can share the same vertical-align
      // (top). Otherwise short cells (SHA, Author) center vertically while
      // the multi-line text starts at the top — visually misaligned.
      const tr = td.parentElement;
      if (tr && tr.tagName === 'TR') tr.classList.add('sg-has-multiline');
    }
    // For the clamp variant we mount an inner wrapper that owns the
    // -webkit-box / -webkit-line-clamp styles. Putting those on the <td>
    // directly changes its display from `table-cell` to `-webkit-box`,
    // which collapses the cell to its content height and breaks the
    // row-height that the longest cell would otherwise enforce.
    if (lines != null && lines > 0) {
      const inner = document.createElement('div');
      inner.className = 'sg-renderer-multiline-clamp';
      inner.style.setProperty('--sg-clamp', String(lines));
      inner.textContent = text;
      return inner;
    }
    // Plain multi-line: white-space:pre-line on the TD lets text wrap on
    // \n; cell-selection copy still grabs the raw text.
    return text;
  };
}

/* ---------- attachments (Active Storage / Airtable-style) ----------- */

// Compact byte-size formatter (1234 → "1.2 KB") used in attachment titles
// and the editor popover. We don't reuse `fileSize()` here — that one
// returns a renderer, this is a one-shot helper.
function formatBytes(n) {
  if (n == null || !Number.isFinite(Number(n))) return '';
  let bytes = Number(n);
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let i = -1;
  do { bytes /= 1024; i++; } while (bytes >= 1024 && i < units.length - 1);
  return `${bytes.toFixed(bytes < 10 ? 1 : 0)} ${units[i]}`;
}

// Is this attachment an image we can show inline? Treats any image/*
// content type as previewable; falls back to filename extension when the
// content_type is missing or generic (octet-stream upload, etc).
const IMG_EXT = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'bmp', 'ico']);
function isImageAttachment(a) {
  if (!a) return false;
  if (typeof a.content_type === 'string' && a.content_type.startsWith('image/')) return true;
  const ext = String(a.filename || '').split('.').pop()?.toLowerCase();
  return ext ? IMG_EXT.has(ext) : false;
}

// Small icon family for non-image file kinds. Keeps the renderer
// dependency-free (no font-awesome import). Generic "file" is the
// fallback when nothing else matches.
const ATTACH_ICONS = {
  pdf:    '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM88 304h32c30.9 0 56 25.1 56 56s-25.1 56-56 56h-16v32c0 8.8-7.2 16-16 16s-16-7.2-16-16V320c0-8.8 7.2-16 16-16zm32 80c13.3 0 24-10.7 24-24s-10.7-24-24-24h-16v48h16zm72-64c0-8.8 7.2-16 16-16h24c26.5 0 48 21.5 48 48v48c0 26.5-21.5 48-48 48H208c-8.8 0-16-7.2-16-16V320zm32 16v80h8c8.8 0 16-7.2 16-16v-48c0-8.8-7.2-16-16-16h-8z"/></svg>',
  doc:    '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM104 280c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24zm0 80c0-13.3 10.7-24 24-24h128c13.3 0 24 10.7 24 24s-10.7 24-24 24H128c-13.3 0-24-10.7-24-24z"/></svg>',
  sheet:  '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zm192 0V128H384L256 0zM112 256H272c8.8 0 16 7.2 16 16v128c0 8.8-7.2 16-16 16H112c-8.8 0-16-7.2-16-16V272c0-8.8 7.2-16 16-16zm16 32v32h48V288H128zm80 0v32h48V288H208zm-80 64v32h48V352H128zm80 0v32h48V352H208z"/></svg>',
  zip:    '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H160V64H224V0H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM160 64v32h64V64H160zm0 96v32h64V160H160zm0 96v32h64V256H160zm0 96c-17.7 0-32 14.3-32 32v48c0 8.8 7.2 16 16 16h96c8.8 0 16-7.2 16-16V384c0-17.7-14.3-32-32-32H160z"/></svg>',
  audio:  '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM160 288c-8.8 0-16 7.2-16 16v89c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V362.5l64-21.3V388c-5-1.9-10.4-3-16-3c-25.4 0-48 18.1-48 44s22.6 44 48 44s48-18.1 48-44V304c0-5.1-2.5-10-6.6-13s-9.5-3.9-14.5-2.3L160 309.8V304c0-8.8-7.2-16-16-16z"/></svg>',
  video:  '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm384 64H256V0L384 128zM64 288c0-17.7 14.3-32 32-32H224c17.7 0 32 14.3 32 32V416c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V288zm259.7-11.3c5.2 2.7 8.3 8 8.3 13.8v123c0 5.8-3.2 11.2-8.3 13.8s-11.3 2.3-16.1-.9L256 392.7V312l51.5-32.6c4.9-3.1 11-3.4 16.1-.8z"/></svg>',
  code:   '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM200.4 281.7c5.8 6.7 5.2 16.8-1.5 22.6L165.5 333l33.4 28.7c6.7 5.8 7.4 15.9 1.6 22.6s-15.9 7.4-22.6 1.6l-48-41.2c-3.5-3-5.5-7.4-5.5-12s2-9 5.5-12l48-41.2c6.7-5.8 16.8-5.2 22.6 1.5zM226 281.7c5.8-6.7 15.9-7.4 22.6-1.5l48 41.2c3.5 3 5.5 7.4 5.5 12s-2 9-5.5 12l-48 41.2c-6.7 5.8-16.8 5.2-22.6-1.6s-5.2-16.8 1.5-22.6L260.5 333 227.5 304.4c-6.7-5.8-7.4-15.9-1.5-22.6z"/></svg>',
  file:   '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0z"/></svg>',
};
const ATTACH_PLUS = '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>';
const ATTACH_X    = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>';
const ATTACH_PREV = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"/></svg>';
const ATTACH_NEXT = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 105.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"/></svg>';

const AUDIO_EXT = new Set(['mp3', 'wav', 'flac', 'm4a', 'ogg', 'aac', 'opus']);
const VIDEO_EXT = new Set(['mp4', 'mov', 'webm', 'mkv', 'avi', 'm4v']);
function iconKeyFor(a) {
  const ct = String(a?.content_type || '').toLowerCase();
  const ext = String(a?.filename || '').split('.').pop()?.toLowerCase() || '';
  if (ct.includes('pdf') || ext === 'pdf') return 'pdf';
  if (ct.startsWith('audio/') || AUDIO_EXT.has(ext)) return 'audio';
  if (ct.startsWith('video/') || VIDEO_EXT.has(ext)) return 'video';
  if (ct.includes('zip') || ['zip', 'tar', 'gz', '7z', 'rar'].includes(ext)) return 'zip';
  if (ct.includes('sheet') || ct.includes('excel') || ct.includes('csv')
      || ['xls', 'xlsx', 'csv', 'numbers'].includes(ext)) return 'sheet';
  if (ct.includes('word') || ct.includes('document') || ['doc', 'docx', 'txt', 'md', 'rtf'].includes(ext)) return 'doc';
  if (['js', 'ts', 'rb', 'py', 'go', 'rs', 'java', 'json', 'xml', 'html', 'css', 'sh', 'sql'].includes(ext)) return 'code';
  return 'file';
}

// Coerce assorted cell value shapes into a clean Attachment array.
// Accepts: an array (already shaped), a single object, a JSON string, null.
// Strips entries missing both url and signed_id (they have nothing useful
// to render or commit).
function normaliseAttachments(value) {
  if (value == null || value === '') return [];
  let list = value;
  if (typeof list === 'string') {
    try { list = JSON.parse(list); }
    catch { return []; }
  }
  if (!Array.isArray(list)) list = [list];
  return list.filter((a) => a && (a.url || a.signed_id))
    .map((a, i) => ({
      id: a.id != null ? String(a.id) : `att_${i}`,
      filename: a.filename || a.name || `attachment-${i + 1}`,
      url: a.url || '#',
      content_type: a.content_type || a.contentType || a.mime_type || '',
      byte_size: a.byte_size ?? a.byteSize ?? a.size ?? null,
      preview_url: a.preview_url || a.previewUrl || (isImageAttachment(a) ? a.url : null),
      thumb_url: a.thumb_url || a.thumbUrl || (isImageAttachment(a) ? a.url : null),
      signed_id: a.signed_id || a.signedId || null,
    }));
}

// Airtable-style attachments cell. Renders a horizontal strip of small
// thumbnails (images) and file chips (non-images); clicking an image
// opens a centred lightbox with prev/next; clicking a non-image opens
// the file in a new tab (or downloads when `download: true`).
//
// When `editable: true` (set on the column AND on the renderer), a
// dblclick opens a popover anchored to the cell with:
//   • a grid of larger thumbs/chips, each with an × remove button
//   • a drop zone that accepts drag-drop, click-to-pick, and paste
//   • a Done button to dismiss
//
// `onUpload(files, ctx) → Promise<Attachment[]>` is called when files
// are added; the returned array is the new full attachment list. If
// `onUpload` is omitted, the renderer falls back to URL.createObjectURL
// for local-only previews — fine for demos, not for persistence.
//
// `onRemove(attachment, ctx) → Promise<Attachment[] | void>` is called
// when × is clicked; return the new list, or void to let the renderer
// drop it locally.
export function attachments({
  thumbSize = 28,
  maxThumbs = 4,
  empty = '',
  editable = false,
  accept = null,
  multiple = true,
  download = false,
  onUpload = null,
  onRemove = null,
} = {}) {
  return (ctx) => {
    const { value, td, row, col } = ctx;
    const list = normaliseAttachments(value);
    if (td) {
      td.classList.add('sg-renderer-attachments-cell');
      td.dataset.attachmentCount = String(list.length);
      // Stash the live attachment array on the cell for the editor popover
      // to read; we re-attach on every render so it stays in sync.
      td._sgAttachments = list;
    }
    if (list.length === 0 && !editable) {
      return empty ? document.createTextNode(empty) : '';
    }
    const wrap = h('div', { class: 'sg-renderer-attachments', role: 'group' });
    const shown = list.slice(0, maxThumbs);
    const overflow = Math.max(0, list.length - shown.length);
    shown.forEach((att) => wrap.append(buildAttachmentThumb(att, thumbSize, list, download)));
    if (overflow > 0) {
      const more = h('span', { class: 'sg-attach-more', title: `${overflow} more` },
        document.createTextNode(`+${overflow}`));
      more.addEventListener('click', (e) => {
        e.stopPropagation();
        openAttachmentLightbox(list, list[shown.length]);
      });
      wrap.append(more);
    }
    if (editable) {
      const add = h('button', {
        type: 'button',
        class: 'sg-attach-add',
        title: 'Add files',
        'aria-label': 'Add attachments',
        'data-sg-attach': 'add',
      });
      add.innerHTML = ATTACH_PLUS;
      add.addEventListener('click', (e) => {
        e.stopPropagation();
        openAttachmentEditor(td, ctx, { thumbSize, accept, multiple, onUpload, onRemove });
      });
      wrap.append(add);
      // Drag-drop directly onto the cell when editable.
      bindCellDropZone(td, ctx, { onUpload });
      // Dblclick anywhere in the cell also opens the editor (matches the
      // grid's "dblclick to edit" affordance, but without going through
      // the standard cell editor — attachments isn't a scalar value).
      td.addEventListener('dblclick', (e) => {
        if (e._sgAttachmentHandled) return;
        e._sgAttachmentHandled = true;
        e.stopPropagation();
        openAttachmentEditor(td, ctx, { thumbSize, accept, multiple, onUpload, onRemove });
      }, { once: false });
    }
    return wrap;
  };
}

function buildAttachmentThumb(att, size, allInCell, download) {
  const btn = h('button', {
    type: 'button',
    class: 'sg-attach-thumb',
    title: `${att.filename}${att.byte_size != null ? ' · ' + formatBytes(att.byte_size) : ''}`,
    'data-attachment-id': att.id,
    'data-attachment-kind': isImageAttachment(att) ? 'image' : 'file',
    'aria-label': att.filename,
    style: `width: ${size}px; height: ${size}px;`,
  });
  if (isImageAttachment(att) && att.thumb_url) {
    btn.append(h('img', {
      src: att.thumb_url, alt: att.filename, loading: 'lazy', decoding: 'async',
      width: String(size), height: String(size),
    }));
  } else {
    const kind = iconKeyFor(att);
    const ic = h('span', { class: `sg-attach-icon is-${kind}`, 'aria-hidden': 'true' });
    ic.innerHTML = ATTACH_ICONS[kind] || ATTACH_ICONS.file;
    btn.append(ic);
  }
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isImageAttachment(att)) {
      // Show all image attachments in the cell as a carousel; the click
      // target becomes the initial frame.
      const images = allInCell.filter(isImageAttachment);
      openAttachmentLightbox(images.length ? images : [att], att);
    } else if (download) {
      // <button> can't carry download=; spawn a real anchor for one click.
      const a = document.createElement('a');
      a.href = att.url; a.download = att.filename;
      document.body.appendChild(a); a.click(); a.remove();
    } else {
      window.open(att.url, '_blank', 'noopener,noreferrer');
    }
  });
  return btn;
}

// ----- Lightbox (image carousel) -----

let activeLightbox = null;

function openAttachmentLightbox(list, current) {
  closeAttachmentLightbox();                       // single-instance — replace any open one
  const images = list.filter(isImageAttachment);
  if (images.length === 0) return;
  let idx = Math.max(0, images.findIndex((a) => a.id === current?.id));
  if (idx < 0) idx = 0;

  const overlay = h('div', { class: 'sg-image-zoom sg-attach-lightbox', role: 'dialog', 'aria-modal': 'true' });
  const stage = h('div', { class: 'sg-attach-lightbox-stage' });
  const img = h('img', { class: 'sg-image-zoom-img', alt: '' });
  const caption = h('div', { class: 'sg-attach-lightbox-caption' });
  const prev = h('button', { type: 'button', class: 'sg-attach-lightbox-nav is-prev',
                             'aria-label': 'Previous attachment' });
  const next = h('button', { type: 'button', class: 'sg-attach-lightbox-nav is-next',
                             'aria-label': 'Next attachment' });
  prev.innerHTML = ATTACH_PREV; next.innerHTML = ATTACH_NEXT;

  function paint() {
    const a = images[idx];
    img.src = a.preview_url || a.url;
    img.alt = a.filename;
    caption.textContent = `${a.filename}${a.byte_size != null ? ' · ' + formatBytes(a.byte_size) : ''} (${idx + 1}/${images.length})`;
    prev.style.visibility = images.length > 1 ? 'visible' : 'hidden';
    next.style.visibility = images.length > 1 ? 'visible' : 'hidden';
  }
  function step(d) { idx = (idx + d + images.length) % images.length; paint(); }
  function onKey(e) {
    if (e.key === 'Escape') closeAttachmentLightbox();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  }
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === stage) closeAttachmentLightbox();
  });
  prev.addEventListener('click', (e) => { e.stopPropagation(); step(-1); });
  next.addEventListener('click', (e) => { e.stopPropagation(); step(1); });
  document.addEventListener('keydown', onKey);

  stage.append(prev, img, next);
  overlay.append(stage, caption);
  document.body.appendChild(overlay);
  activeLightbox = { overlay, onKey };
  paint();
}

function closeAttachmentLightbox() {
  if (!activeLightbox) return;
  document.removeEventListener('keydown', activeLightbox.onKey);
  activeLightbox.overlay.remove();
  activeLightbox = null;
}

// ----- Editor popover (upload / remove) -----

let activeAttachmentEditor = null;

function bindCellDropZone(td, ctx, { onUpload }) {
  if (td._sgAttachDropBound) return;
  td._sgAttachDropBound = true;
  td.addEventListener('dragover', (e) => {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
    td.classList.add('is-drop-target');
  });
  td.addEventListener('dragleave', () => td.classList.remove('is-drop-target'));
  td.addEventListener('drop', async (e) => {
    if (!e.dataTransfer?.files?.length) return;
    e.preventDefault();
    td.classList.remove('is-drop-target');
    const files = Array.from(e.dataTransfer.files);
    await applyAttachmentUpload(td, ctx, files, onUpload);
  });
}

function openAttachmentEditor(anchor, ctx, opts) {
  closeAttachmentEditor();
  const { thumbSize, accept, multiple, onUpload, onRemove } = opts;
  const list = anchor._sgAttachments || normaliseAttachments(ctx.value);

  const pop = h('div', { class: 'sg-attach-editor', role: 'dialog', 'aria-modal': 'false' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  const header = h('div', { class: 'sg-attach-editor-header' }, [
    h('span', { class: 'sg-attach-editor-title' },
      document.createTextNode(list.length === 1 ? '1 attachment' : `${list.length} attachments`)),
    (() => {
      const close = h('button', { type: 'button', class: 'sg-attach-editor-close',
                                  'aria-label': 'Close' });
      close.innerHTML = ATTACH_X;
      close.addEventListener('click', closeAttachmentEditor);
      return close;
    })(),
  ]);
  const grid = h('div', { class: 'sg-attach-editor-grid' });
  function paintGrid() {
    const items = anchor._sgAttachments || [];
    grid.replaceChildren();
    items.forEach((att) => grid.append(buildEditorTile(att, anchor, ctx, onRemove, thumbSize)));
    header.firstChild.textContent =
      items.length === 1 ? '1 attachment' : `${items.length} attachments`;
  }
  paintGrid();
  anchor._sgAttachRepaint = paintGrid;

  // Drop / pick zone.
  const zone = h('label', { class: 'sg-attach-dropzone', tabindex: '0' });
  zone.innerHTML = `
    <span class="sg-attach-dropzone-icon" aria-hidden="true">${ATTACH_PLUS}</span>
    <span class="sg-attach-dropzone-text">Drop files, paste, or <strong>browse</strong></span>
  `;
  const fileInput = h('input', { type: 'file', multiple: multiple ? '' : null, accept: accept || null });
  fileInput.style.display = 'none';
  zone.append(fileInput);
  fileInput.addEventListener('change', async () => {
    if (!fileInput.files?.length) return;
    await applyAttachmentUpload(anchor, ctx, Array.from(fileInput.files), onUpload);
    fileInput.value = '';                          // allow same-file re-pick
    paintGrid();
  });
  zone.addEventListener('dragover', (e) => {
    if (!e.dataTransfer?.types?.includes('Files')) return;
    e.preventDefault();
    zone.classList.add('is-drop-target');
  });
  zone.addEventListener('dragleave', () => zone.classList.remove('is-drop-target'));
  zone.addEventListener('drop', async (e) => {
    if (!e.dataTransfer?.files?.length) return;
    e.preventDefault();
    zone.classList.remove('is-drop-target');
    await applyAttachmentUpload(anchor, ctx, Array.from(e.dataTransfer.files), onUpload);
    paintGrid();
  });

  // Paste support (only fires while the popover has focus).
  function onPaste(e) {
    const files = Array.from(e.clipboardData?.files || []);
    if (files.length === 0) return;
    e.preventDefault();
    applyAttachmentUpload(anchor, ctx, files, onUpload).then(paintGrid);
  }
  pop.addEventListener('paste', onPaste);

  // Escape closes; outside-click closes.
  function onKey(e) { if (e.key === 'Escape') closeAttachmentEditor(); }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeAttachmentEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  pop.append(header, grid, zone);
  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  zone.focus();
  activeAttachmentEditor = { pop, onKey, onDocClick, anchor };
}

function closeAttachmentEditor() {
  if (!activeAttachmentEditor) return;
  const { pop, onKey, onDocClick, anchor } = activeAttachmentEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  if (anchor) delete anchor._sgAttachRepaint;
  activeAttachmentEditor = null;
}

function buildEditorTile(att, anchor, ctx, onRemove, thumbSize) {
  const tile = h('div', { class: 'sg-attach-editor-tile', 'data-attachment-id': att.id });
  const preview = h('div', { class: 'sg-attach-editor-preview',
                              style: `width: ${thumbSize * 2}px; height: ${thumbSize * 2}px;` });
  if (isImageAttachment(att) && att.thumb_url) {
    preview.append(h('img', { src: att.thumb_url, alt: att.filename,
                              width: String(thumbSize * 2), height: String(thumbSize * 2) }));
  } else {
    const kind = iconKeyFor(att);
    const ic = h('span', { class: `sg-attach-icon is-${kind}`, 'aria-hidden': 'true' });
    ic.innerHTML = ATTACH_ICONS[kind] || ATTACH_ICONS.file;
    preview.append(ic);
  }
  const meta = h('div', { class: 'sg-attach-editor-meta' }, [
    h('div', { class: 'sg-attach-editor-name', title: att.filename },
      document.createTextNode(att.filename)),
    h('div', { class: 'sg-attach-editor-size' },
      document.createTextNode(att.byte_size != null ? formatBytes(att.byte_size) : '')),
  ]);
  const x = h('button', {
    type: 'button', class: 'sg-attach-editor-remove',
    title: 'Remove', 'aria-label': `Remove ${att.filename}`,
    'data-sg-attach': 'remove', 'data-attachment-id': att.id,
  });
  x.innerHTML = ATTACH_X;
  x.addEventListener('click', async (e) => {
    e.stopPropagation();
    await applyAttachmentRemove(anchor, ctx, att, onRemove);
  });
  tile.append(preview, meta, x);
  return tile;
}

// Position the popover under (or above, if no room) the anchor cell.
function positionPopover(pop, anchor) {
  const rect = anchor.getBoundingClientRect();
  pop.style.position = 'fixed';
  pop.style.left = `${Math.max(8, Math.min(window.innerWidth - 360, rect.left))}px`;
  const below = window.innerHeight - rect.bottom;
  if (below > 280) pop.style.top = `${rect.bottom + 4}px`;
  else             pop.style.top = `${Math.max(8, rect.top - pop.offsetHeight - 4)}px`;
}

// ----- Commit helpers -----

async function applyAttachmentUpload(td, ctx, files, onUpload) {
  if (!files.length) return;
  td.classList.add('is-uploading');
  try {
    let next;
    if (typeof onUpload === 'function') {
      const result = await onUpload(files, ctx);
      next = Array.isArray(result) ? result : (td._sgAttachments || []).concat(localAttachmentsFromFiles(files));
    } else {
      next = (td._sgAttachments || []).concat(localAttachmentsFromFiles(files));
    }
    commitAttachmentList(td, ctx, normaliseAttachments(next));
  } finally {
    td.classList.remove('is-uploading');
  }
}

async function applyAttachmentRemove(td, ctx, att, onRemove) {
  let next;
  if (typeof onRemove === 'function') {
    const result = await onRemove(att, ctx);
    next = Array.isArray(result)
      ? result
      : (td._sgAttachments || []).filter((a) => a.id !== att.id);
  } else {
    next = (td._sgAttachments || []).filter((a) => a.id !== att.id);
  }
  commitAttachmentList(td, ctx, normaliseAttachments(next));
}

// Build local-only Attachment objects from raw File handles. Object URLs
// are revoked when the cell re-renders — the grid drops the old node,
// browsers GC the URL.
function localAttachmentsFromFiles(files) {
  return files.map((f, i) => ({
    id: `local_${Date.now()}_${i}`,
    filename: f.name,
    url: URL.createObjectURL(f),
    content_type: f.type || '',
    byte_size: f.size,
    preview_url: f.type?.startsWith('image/') ? URL.createObjectURL(f) : null,
    thumb_url: f.type?.startsWith('image/') ? URL.createObjectURL(f) : null,
  }));
}

// Write the new list back through the grid API. Updates the row data
// (so future re-renders stay in sync) and asks the api to re-render the
// affected row. Falls back to mutating the row and patching the cell
// directly when api.applyTransaction isn't available.
function commitAttachmentList(td, ctx, list) {
  const { row, col, api } = ctx;
  if (row && col?.field != null) row[col.field] = list;
  td._sgAttachments = list;
  if (api?.applyTransaction) {
    api.applyTransaction({ update: [row] });
  } else if (api?.refreshCells) {
    api.refreshCells({ rowIds: [row?.id ?? row?._sg_id] });
  }
  if (td._sgAttachRepaint) td._sgAttachRepaint();
}

/* ---------- address-au (formatted AU street address) ----------------
 *
 * Value shape: an object describing an Australian address.
 *
 *   {
 *     address1: '12 Smith Street',
 *     address2: 'Unit 4',          // optional
 *     address3: 'Level 2',         // optional, only shown if address2 set
 *     suburb:   'Bondi',
 *     state:    'NSW',
 *     postcode: '2026',
 *     country:  'Australia',       // optional, defaults to Australia
 *   }
 *
 * Plain strings are passed through verbatim (escape hatch).
 *
 * Display: `address1, suburb [STATE] postcode` with the state rendered
 * as a small colour-coded badge (the colour scheme nods at each state's
 * traditional sporting / coat-of-arms palette: NSW sky-blue, VIC navy,
 * QLD maroon, WA gold, SA red, TAS forest green, ACT gold, NT ochre).
 *
 * Click-to-edit: dblclick opens a popover with a multi-field form
 * (address1 / address2 / + another line / suburb / state / postcode /
 * country). Commits via `api.applyTransaction({ update: [row] })`. Set
 * `{ editable: false }` to render display-only. */

const AU_STATES = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
const AU_STATE_NAMES = {
  NSW: 'New South Wales', VIC: 'Victoria', QLD: 'Queensland',
  WA: 'Western Australia', SA: 'South Australia', TAS: 'Tasmania',
  ACT: 'Australian Capital Territory', NT: 'Northern Territory',
};

function normaliseAddressAu(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'string') return { _raw: v };
  if (typeof v !== 'object') return null;
  const state = v.state ? String(v.state).trim().toUpperCase() : '';
  return {
    address1: v.address1 ? String(v.address1) : '',
    address2: v.address2 ? String(v.address2) : '',
    address3: v.address3 ? String(v.address3) : '',
    suburb:   v.suburb   ? String(v.suburb)   : '',
    state,
    postcode: v.postcode != null ? String(v.postcode) : '',
    country:  v.country  ? String(v.country)  : '',
  };
}

function formatAddressAuLine(a) {
  if (!a) return '';
  if (a._raw) return a._raw;
  const left = a.address1 || '';
  const right = [a.suburb, a.state, a.postcode].filter(Boolean).join(' ');
  if (!left && !right) return '';
  return [left, right].filter(Boolean).join(', ');
}

function formatAddressAuMultiline(a) {
  if (!a || a._raw) return a?._raw || '';
  const lines = [a.address1, a.address2, a.address3].filter(Boolean);
  const cityLine = [a.suburb, a.state, a.postcode].filter(Boolean).join(' ');
  if (cityLine) lines.push(cityLine);
  if (a.country && a.country.toLowerCase() !== 'australia') lines.push(a.country);
  return lines.join('\n');
}

export function addressAu({ editable = true, empty = '' } = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    const a = normaliseAddressAu(value);
    if (td) {
      td.classList.add('sg-renderer-address-au-cell');
      td._sgAddress = a;
    }
    if (!a) return empty ? document.createTextNode(empty) : '';

    if (editable && td && !td._sgAddressEditBound) {
      td._sgAddressEditBound = true;
      td.addEventListener('dblclick', (e) => {
        if (e._sgAddressHandled) return;
        e._sgAddressHandled = true;
        e.stopPropagation();
        openAddressAuEditor(td, ctx);
      });
    }

    const wrap = h('div', {
      class: 'sg-renderer-address-au',
      title: formatAddressAuMultiline(a),
    });
    if (a._raw) {
      wrap.append(document.createTextNode(a._raw));
      return wrap;
    }

    const street = [a.address1, a.address2].filter(Boolean).join(', ');
    const hasTail = a.suburb || a.state || a.postcode;
    if (street) {
      wrap.append(h('span', { class: 'sg-address-au-street' }, document.createTextNode(street)));
    }
    if (street && hasTail) {
      wrap.append(h('span', { class: 'sg-address-au-sep' }, document.createTextNode(', ')));
    }
    if (a.suburb) wrap.append(document.createTextNode(a.suburb));
    if (a.state) {
      if (a.suburb) wrap.append(document.createTextNode(' '));
      wrap.append(h('span', {
        class: `sg-address-au-state is-${a.state.toLowerCase()}`,
        title: AU_STATE_NAMES[a.state] || a.state,
      }, document.createTextNode(a.state)));
    }
    if (a.postcode) {
      if (a.suburb || a.state) wrap.append(document.createTextNode(' '));
      wrap.append(h('span', { class: 'sg-address-au-postcode' },
        document.createTextNode(a.postcode)));
    }
    if (a.country && a.country.toLowerCase() !== 'australia') {
      wrap.append(document.createTextNode(' '));
      wrap.append(h('span', { class: 'sg-address-au-country' },
        document.createTextNode(a.country)));
    }
    return wrap;
  };
}

let activeAddressEditor = null;

function openAddressAuEditor(anchor, ctx) {
  closeAddressAuEditor();
  const current = anchor._sgAddress && !anchor._sgAddress._raw
    ? { ...anchor._sgAddress }
    : { address1: '', address2: '', address3: '', suburb: '', state: '', postcode: '', country: 'Australia' };
  if (!current.country) current.country = 'Australia';

  const pop = h('div', { class: 'sg-address-au-editor', role: 'dialog', 'aria-modal': 'false' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  const header = h('div', { class: 'sg-address-au-editor-header' });
  header.append(
    h('span', { class: 'sg-address-au-editor-title' }, document.createTextNode('Edit address')),
  );

  const form = h('form', { class: 'sg-address-au-editor-form', novalidate: 'novalidate' });

  function field({ label, name, type = 'text', value = '', maxlength, inputmode, placeholder, autocomplete }) {
    const wrap = h('label', { class: 'sg-address-au-editor-field', 'data-field': name });
    wrap.append(h('span', { class: 'sg-address-au-editor-label' }, document.createTextNode(label)));
    const input = h('input', {
      type,
      name,
      value: value || '',
      maxlength: maxlength || null,
      inputmode: inputmode || null,
      placeholder: placeholder || null,
      autocomplete: autocomplete || null,
      class: 'sg-address-au-editor-input',
    });
    wrap.append(input);
    return { wrap, input };
  }

  const f1 = field({ label: 'Address line 1', name: 'address1', value: current.address1,
                     placeholder: '12 Smith Street', autocomplete: 'address-line1' });
  const f2 = field({ label: 'Address line 2', name: 'address2', value: current.address2,
                     placeholder: 'Unit / suite (optional)', autocomplete: 'address-line2' });

  const line3Wrap = h('div', { class: 'sg-address-au-editor-line3-wrap' });
  const f3 = field({ label: 'Address line 3', name: 'address3', value: current.address3,
                     placeholder: 'Level / building (optional)', autocomplete: 'address-line3' });
  line3Wrap.append(f3.wrap);

  const addLine3 = h('button', {
    type: 'button',
    class: 'sg-address-au-editor-add-line',
  }, document.createTextNode('+ Add another line'));

  function syncLine3Visibility() {
    const showLine3 = !!(f2.input.value.trim() || f3.input.value.trim());
    line3Wrap.hidden = !showLine3;
    addLine3.hidden = showLine3;
  }
  f2.input.addEventListener('input', syncLine3Visibility);
  addLine3.addEventListener('click', () => {
    line3Wrap.hidden = false;
    addLine3.hidden = true;
    f3.input.focus();
  });

  const suburb = field({ label: 'Suburb', name: 'suburb', value: current.suburb,
                         placeholder: 'Bondi', autocomplete: 'address-level2' });

  const stateWrap = h('label', { class: 'sg-address-au-editor-field', 'data-field': 'state' });
  stateWrap.append(h('span', { class: 'sg-address-au-editor-label' }, document.createTextNode('State')));
  const stateSel = h('select', { name: 'state', class: 'sg-address-au-editor-input sg-address-au-editor-state',
                                  autocomplete: 'address-level1' });
  stateSel.append(h('option', { value: '' }, document.createTextNode('—')));
  for (const s of AU_STATES) {
    const opt = h('option', { value: s, selected: current.state === s ? '' : null },
                  document.createTextNode(`${s} — ${AU_STATE_NAMES[s]}`));
    stateSel.append(opt);
  }
  stateWrap.append(stateSel);

  const postcode = field({ label: 'Postcode', name: 'postcode', type: 'text',
                           value: current.postcode, maxlength: 4,
                           inputmode: 'numeric', placeholder: '2026',
                           autocomplete: 'postal-code' });
  postcode.input.classList.add('sg-address-au-editor-postcode');
  postcode.input.addEventListener('input', () => {
    postcode.input.value = postcode.input.value.replace(/\D/g, '').slice(0, 4);
  });

  const country = field({ label: 'Country', name: 'country', value: current.country,
                          autocomplete: 'country-name' });

  const grid = h('div', { class: 'sg-address-au-editor-grid' });
  grid.append(f1.wrap);                     // row 1: full width
  grid.append(f2.wrap, addLine3);           // row 2: line2 + add-line button
  grid.append(line3Wrap);                   // row 3 (conditional)
  grid.append(suburb.wrap, stateWrap, postcode.wrap);  // row 4: 3 cols
  grid.append(country.wrap);                // row 5: full width

  const footer = h('div', { class: 'sg-address-au-editor-footer' });
  const cancel = h('button', { type: 'button', class: 'sg-address-au-editor-cancel' },
                   document.createTextNode('Cancel'));
  const save = h('button', { type: 'submit', class: 'sg-address-au-editor-save' },
                 document.createTextNode('Save'));
  footer.append(cancel, save);

  form.append(grid, footer);
  pop.append(header, form);

  function readForm() {
    return {
      address1: f1.input.value.trim(),
      address2: f2.input.value.trim(),
      address3: line3Wrap.hidden ? '' : f3.input.value.trim(),
      suburb:   suburb.input.value.trim(),
      state:    stateSel.value,
      postcode: postcode.input.value.trim(),
      country:  country.input.value.trim() || 'Australia',
    };
  }

  function commit() {
    const next = readForm();
    const allEmpty = !next.address1 && !next.suburb && !next.state && !next.postcode;
    commitAddressAu(anchor, ctx, allEmpty ? null : next);
    closeAddressAuEditor();
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); commit(); });
  cancel.addEventListener('click', () => closeAddressAuEditor());

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeAddressAuEditor(); }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeAddressAuEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  syncLine3Visibility();
  f1.input.focus();
  f1.input.select();
  activeAddressEditor = { pop, onKey, onDocClick };
}

function closeAddressAuEditor() {
  if (!activeAddressEditor) return;
  const { pop, onKey, onDocClick } = activeAddressEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeAddressEditor = null;
}

function commitAddressAu(td, ctx, next) {
  const { row, col, api } = ctx;
  const oldValue = row && col?.field != null ? row[col.field] : null;
  if (row && col?.field != null) row[col.field] = next;
  td._sgAddress = next;
  if (api?.applyTransaction) {
    api.applyTransaction({ update: [row] });
  } else if (api?.refreshCells) {
    api.refreshCells({ rowIds: [row?.id ?? row?._sg_id] });
  }
  // Mirror the standard editor's contract so consumers can persist.
  const grid = td.closest('[data-controller~="grid"]');
  if (grid) {
    grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
      bubbles: true,
      detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
    }));
  }
}

/* ---------- progress bar -------------------------------------------- */

export function progressBar({ color = 'green', showValue = false } = {}) {
  return ({ value }) => {
    let n = Number(value);
    if (!Number.isFinite(n)) n = 0;
    n = Math.max(0, Math.min(100, n));
    const bar = h('div', { class: 'sg-renderer-progress' }, [
      h('div', { class: `sg-renderer-progress-fill sg-fill-${color}`, style: `width: ${n}%;` }),
    ]);
    if (!showValue) return bar;
    return h('div', { class: 'sg-renderer-progress-wrap' }, [
      bar,
      h('span', { class: 'sg-renderer-progress-label' }, document.createTextNode(`${Math.round(n)}%`)),
    ]);
  };
}

/* ---------- star rating --------------------------------------------- */

// Single filled-star glyph (FontAwesome 6.5) used across all three states.
// "Empty" stars are the same silhouette in grey; "half" stars layer an
// amber-clipped copy on top of a grey copy. Sharing one glyph keeps the
// silhouettes aligned and avoids the visual artefact of an outline ring
// letting the cell background show through the star's interior.
const STAR_SVG = '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"/></svg>';

export function starRating({ max = 5, precision = 0.5 } = {}) {
  // Snap the input to the requested precision (0.5 = halves, 0.25 = quarters,
  // 0.1 = tenths, 0.01 = hundredths, etc.). The clip width on partial stars
  // is computed from the snapped value, so any fraction renders cleanly.
  const step = precision > 0 ? 1 / precision : 2;
  return ({ value }) => {
    let n = parseFloat(value);
    if (!Number.isFinite(n)) n = 0;
    n = Math.max(0, Math.min(max, n));
    n = Math.round(n * step) / step;
    const wrap = h('div', {
      class: 'sg-renderer-stars',
      role: 'img',
      'aria-label': `${n} out of ${max} stars`,
    });
    for (let i = 1; i <= max; i++) {
      if (n >= i) {
        // Full: solid glyph in amber.
        wrap.append(h('span', { class: 'sg-renderer-star is-full', 'aria-hidden': 'true' }, STAR_SVG));
      } else if (n > i - 1) {
        // Partial: grey silhouette behind + amber silhouette clipped to the
        // fractional width on top. .sg-star-clip is overflow:hidden so the
        // inner SVG stays at natural size — no squashed scale at any fraction.
        const pct = Math.round((n - (i - 1)) * 100);
        wrap.append(h('span', { class: 'sg-renderer-star is-partial', 'aria-hidden': 'true' },
          `${STAR_SVG}<span class="sg-star-clip" style="width: ${pct}%;">${STAR_SVG}</span>`));
      } else {
        // Empty: solid silhouette in grey.
        wrap.append(h('span', { class: 'sg-renderer-star is-empty', 'aria-hidden': 'true' }, STAR_SVG));
      }
    }
    return wrap;
  };
}

/* ---------- tags (CSV → chips) -------------------------------------- */

export function tags({ separator = ',' } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const list = Array.isArray(value) ? value : String(value).split(separator);
    const wrap = h('div', { class: 'sg-renderer-tags' });
    for (const t of list) {
      const text = String(t).trim();
      if (!text) continue;
      wrap.append(h('span', { class: 'sg-renderer-tag' }, document.createTextNode(text)));
    }
    return wrap;
  };
}

/* ---------- country flag (2-letter ISO → emoji) --------------------- */

export function countryFlag({ showCode = true, fallback = null } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const code = String(value).trim().toUpperCase();
    if (code.length !== 2 || !/^[A-Z]{2}$/.test(code)) {
      return fallback != null ? fallback : document.createTextNode(String(value));
    }
    const flag = String.fromCodePoint(
      0x1F1E6 + code.charCodeAt(0) - 65,
      0x1F1E6 + code.charCodeAt(1) - 65,
    );
    const wrap = h('span', { class: 'sg-renderer-country' });
    wrap.append(h('span', { class: 'sg-renderer-flag', 'aria-hidden': 'true' }, document.createTextNode(flag)));
    if (showCode) {
      wrap.append(h('span', { class: 'sg-renderer-country-code' }, document.createTextNode(code)));
    }
    return wrap;
  };
}

/* ---------- ABN (Australian Business Number) ------------------------ */

function validateABN(input) {
  const digits = String(input).replace(/\s+/g, '');
  if (digits.length !== 11 || !/^\d{11}$/.test(digits)) return false;
  const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
  const adjusted = (parseInt(digits[0], 10) - 1) + digits.slice(1);
  let total = 0;
  for (let i = 0; i < 11; i++) total += parseInt(adjusted[i], 10) * weights[i];
  return total % 89 === 0;
}

function formatABN(input) {
  const digits = String(input).replace(/\D/g, '');
  if (digits.length !== 11) return String(input);
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
}

export function abn() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    if (!validateABN(value)) {
      return h('span', { class: 'sg-renderer-invalid', title: 'Invalid ABN' }, document.createTextNode(String(value)));
    }
    const digits = String(value).replace(/\s+/g, '');
    return h('a', {
      class: 'sg-renderer-link sg-renderer-mono',
      href: `https://abr.business.gov.au/ABN/View?id=${digits}`,
      target: '_blank',
      rel: 'noopener noreferrer',
      title: 'Look up on ABR',
    }, document.createTextNode(formatABN(value)));
  };
}

/* ---------- avatar (image + name) ----------------------------------- */

// Looks up the row's avatar source from one of several conventions, in order:
//   1. opts.lookup(value, row) → { name, avatarUrl } | null
//   2. row[opts.nameField]      / row[opts.avatarField]
//   3. window[opts.windowKey] — a Map or Array keyed by value (default
//      window.__sgUsers); each entry is { id, name, avatarUrl }
// Falls back to the raw value when nothing matches.
export function avatar({
  lookup = null,
  nameField = null,
  avatarField = null,
  windowKey = '__sgUsers',
  size = 22,
} = {}) {
  return ({ value, row }) => {
    if (isBlank(value)) return '';
    let entry = null;
    if (typeof lookup === 'function') entry = lookup(value, row) || null;
    if (!entry && nameField) {
      entry = { name: row?.[nameField], avatarUrl: avatarField ? row?.[avatarField] : null };
    }
    if (!entry && typeof window !== 'undefined' && window[windowKey]) {
      const src = window[windowKey];
      if (src instanceof Map) entry = src.get(value) || src.get(String(value)) || null;
      else if (Array.isArray(src)) entry = src.find((u) => `${u.id}` === `${value}`) || null;
    }
    const name = entry?.name ?? String(value);
    const wrap = h('span', { class: 'sg-renderer-avatar' });
    if (entry?.avatarUrl) {
      wrap.append(h('img', {
        class: 'sg-renderer-avatar-img',
        src: entry.avatarUrl,
        width: String(size),
        height: String(size),
        alt: '',
      }));
    } else {
      // Initials fallback when there's no image — first letters of name parts.
      const initials = String(name).split(/\s+/).filter(Boolean).slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || '').join('');
      wrap.append(h('span', {
        class: 'sg-renderer-avatar-initials',
        style: `width: ${size}px; height: ${size}px;`,
      }, document.createTextNode(initials)));
    }
    wrap.append(h('span', { class: 'sg-renderer-avatar-name' }, document.createTextNode(name)));
    return wrap;
  };
}

/* ---------- statusPill (badge with optional icon) -------------------
 *
 * The badge/pill renderer behind subscription / fulfillment / shipping /
 * sales-channel / supplier-order status columns. Pass a colour map keyed by
 * the cell value's lower-cased form; optionally an icon map (icon names from
 * the built-in set or your own SVG strings). The cell renders as a coloured
 * pill with a title-cased label.
 *
 * Example:
 *   registerRenderer('subscription', statusPill({
 *     subscribed: 'green', unsubscribed: 'yellow', 'not-subscribed': 'gray',
 *   }))
 *
 * With icons:
 *   registerRenderer('fulfillment', statusPill({
 *     fulfilled: 'gray', delivered: 'green', 'in-transit': 'blue',
 *     pending: 'yellow', rejected: 'red',
 *   }, {
 *     fulfilled: 'check-circle', delivered: 'check', 'in-transit': 'truck',
 *     pending: 'clock', rejected: 'x-circle',
 *   }))
 *
 * Pass `{ titleCase: false }` to render labels verbatim instead of
 * Title Casing them. */
const ICON_SVG = {
  'check':         '<svg viewBox="0 0 448 512" aria-hidden="true"><path fill="currentColor" d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>',
  'check-circle':  '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335.1 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>',
  'x-circle':      '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"/></svg>',
  'clock':         '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120v136c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>',
  'truck':         '<svg viewBox="0 0 640 512" aria-hidden="true"><path fill="currentColor" d="M48 0C21.5 0 0 21.5 0 48V368c0 26.5 21.5 48 48 48H64c0 53 43 96 96 96s96-43 96-96H384c0 53 43 96 96 96s96-43 96-96h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V288 256 237.3c0-17-6.7-33.3-18.7-45.3L512 114.7c-12-12-28.3-18.7-45.3-18.7H416V48c0-26.5-21.5-48-48-48H48zM416 160h50.7L544 237.3V256H416V160zM112 416a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm368-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>',
  'dot':           '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z"/></svg>',
  'circle':        '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>',
  'half-circle':   '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M448 256c0-106-86-192-192-192V448c106 0 192-86 192-192z"/></svg>',
  'alert':         '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M256 32C141.1 32 48 125.1 48 240V384c0 17.7 14.3 32 32 32H432c17.7 0 32-14.3 32-32V240C464 125.1 370.9 32 256 32zM232 152c0-13.3 10.7-24 24-24s24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152zM256 304a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>',
  'cart':          '<svg viewBox="0 0 576 512" aria-hidden="true"><path fill="currentColor" d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>',
};

function titleCaseStr(s) {
  return String(s).toLowerCase().split(/[\s_-]+/)
    .map((w) => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ');
}

export function statusPill(colorMap = {}, iconMap = null, opts = {}) {
  const { titleCase = true, defaultColor = 'gray' } = opts;
  // Normalise keys to lowercase once so lookups don't repeat the work per cell.
  const cmap = {};
  for (const [k, v] of Object.entries(colorMap)) cmap[String(k).toLowerCase()] = v;
  const imap = {};
  if (iconMap) for (const [k, v] of Object.entries(iconMap)) imap[String(k).toLowerCase()] = v;
  return ({ value }) => {
    if (isBlank(value)) return '';
    const key = String(value).toLowerCase();
    const color = cmap[key] || defaultColor;
    const label = titleCase ? titleCaseStr(value) : String(value);
    const pill = h('span', { class: `sg-pill sg-pill-${color}` });
    if (iconMap) {
      const iconName = imap[key];
      const svg = iconName ? (ICON_SVG[iconName] || iconName) : null;
      if (svg) {
        const ic = h('span', { class: 'sg-pill-icon', 'aria-hidden': 'true' });
        ic.innerHTML = svg;
        pill.append(ic);
      }
    }
    pill.append(h('span', { class: 'sg-pill-label' }, document.createTextNode(label)));
    return pill;
  };
}

/* ---------- checkbox (interactive boolean) --------------------------
 *
 * The interactive sibling of `boolean`. Renders a native-styled
 * checkbox that flips the underlying value on click; null / undefined /
 * '' shows as indeterminate (the "we don't know yet" state). Commits
 * via `api.applyTransaction({ update: [row] })` and dispatches
 * `grid:cellValueChanged` so consumers can persist the change.
 *
 *   registerRenderer('done', checkbox());
 *   <th data-header-cell-cell-renderer-value="done">Done</th>
 *
 * Pass `{ disabled: true }` for a read-only checkbox (still indicates
 * state, but click is a no-op). For a fully read-only ✓/✗ glyph, use
 * `boolean` instead. */
export function checkbox({
  truthy = defaultIsTruthy,
  disabled = false,
} = {}) {
  return (ctx) => {
    const { value, row, col, api, td } = ctx;
    if (td) td.classList.add('sg-renderer-checkbox-cell');
    const wrap = h('span', { class: 'sg-renderer-checkbox' });
    const input = h('input', {
      type: 'checkbox',
      class: 'sg-renderer-checkbox-input',
      disabled: disabled ? '' : null,
      'aria-label': col?.field || 'toggle',
    });
    if (value == null || value === '') {
      input.indeterminate = true;
    } else {
      input.checked = truthy(value);
    }
    // Stop the click from bubbling to the cell's selection/edit handlers —
    // a checkbox click means "toggle me", not "begin editing this cell".
    input.addEventListener('click', (e) => e.stopPropagation());
    input.addEventListener('change', (e) => {
      if (disabled) { e.preventDefault(); return; }
      const next = input.checked;
      const oldValue = row && col?.field != null ? row[col.field] : null;
      if (row && col?.field != null) row[col.field] = next;
      if (api?.applyTransaction) api.applyTransaction({ update: [row] });
      const grid = td?.closest('[data-controller~="grid"]');
      if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
        bubbles: true,
        detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
      }));
    });
    wrap.append(input);
    return wrap;
  };
}

/* ---------- audio attachment (player popover) -----------------------
 *
 * Single-file audio attachment with a popover player. Cell renders as a
 * compact play-circle icon (optionally with the filename next to it);
 * double-click opens a centred-on-the-cell popover with play/pause,
 * a draggable scrub bar, current / total time, and ±10s skip buttons.
 *
 *   <th data-header-cell-cell-renderer-value="audio-attachment">Recording</th>
 *
 * Value shapes accepted (normalised by `normaliseAudio` below):
 *
 *   "https://…/call.mp3"             // plain URL string
 *   { url, filename?, byte_size?, duration? }
 *
 * Howler.js integration is opt-in by presence: if `window.Howl` is
 * defined when the player opens, we delegate playback / scrubbing /
 * duration to it (gives consistent cross-browser behaviour, codec
 * fallbacks, and the `playing()` / `seek()` getters). Otherwise we use
 * a plain HTMLAudioElement — same scrub/play semantics, no dependency.
 *
 * The renderer doesn't preload audio on cell render — only when the
 * popover opens. That keeps a grid of 100 phone calls from issuing 100
 * range requests on page load. */

const AUDIO_ICON_PLAY_CIRCLE = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z"/></svg>';
const AUDIO_PLAY_SVG = '<svg viewBox="0 0 384 512" aria-hidden="true"><path fill="currentColor" d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/></svg>';
const AUDIO_PAUSE_SVG = '<svg viewBox="0 0 320 512" aria-hidden="true"><path fill="currentColor" d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"/></svg>';
const AUDIO_BACK10_SVG  = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M125.7 160H176c17.7 0 32 14.3 32 32s-14.3 32-32 32H48c-17.7 0-32-14.3-32-32V64c0-17.7 14.3-32 32-32s32 14.3 32 32v51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z"/></svg>';
const AUDIO_FWD10_SVG   = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M386.3 160H336c-17.7 0-32 14.3-32 32s14.3 32 32 32H464c17.7 0 32-14.3 32-32V64c0-17.7-14.3-32-32-32s-32 14.3-32 32v51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/></svg>';
const AUDIO_X_SVG = ATTACH_X;
const AUDIO_VOLUME_SVG = '<svg viewBox="0 0 640 512" aria-hidden="true"><path fill="currentColor" d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/></svg>';

const AUDIO_EXT_RE = /\.(mp3|wav|m4a|aac|ogg|opus|flac|webm)(\?.*)?$/i;

function normaliseAudio(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'string') {
    const url = value.trim();
    if (!url) return null;
    const m = url.split('/').pop()?.match(/^[^?#]+/)?.[0] || '';
    return { url, filename: m || 'audio', byte_size: null, duration: null };
  }
  if (typeof value !== 'object') return null;
  const url = value.url || value.src || value.href;
  if (!url) return null;
  return {
    url: String(url),
    filename: value.filename || value.name || (String(url).split('/').pop()?.split('?')[0] || 'audio'),
    byte_size: value.byte_size ?? value.byteSize ?? value.size ?? null,
    duration: Number.isFinite(value.duration) ? Number(value.duration) : null,
    content_type: value.content_type || value.contentType || value.mime_type || '',
  };
}

function formatAudioTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const total = Math.floor(sec);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

export function audioAttachment({
  showFilename = true,
  iconOnly = false,
  empty = '',
  preferHowler = true,
  skipSeconds = 10,
} = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    const audio = normaliseAudio(value);
    if (td) {
      td.classList.add('sg-renderer-audio-cell');
      td._sgAudio = audio;
      td._sgAudioOpts = { preferHowler, skipSeconds };
    }
    if (!audio) return empty ? document.createTextNode(empty) : '';

    if (td && !td._sgAudioDblBound) {
      td._sgAudioDblBound = true;
      td.addEventListener('dblclick', (e) => {
        if (e._sgAudioHandled) return;
        e._sgAudioHandled = true;
        e.stopPropagation();
        e.preventDefault();
        openAudioPlayer(td, ctx);
      });
    }

    const wrap = h('div', { class: 'sg-renderer-audio' });
    const btn = h('button', {
      type: 'button',
      class: 'sg-audio-icon',
      title: `${audio.filename}${audio.byte_size != null ? ' · ' + formatBytes(audio.byte_size) : ''} — double-click to play`,
      'aria-label': `Play ${audio.filename}`,
      'data-sg-audio': 'open',
    });
    btn.innerHTML = AUDIO_ICON_PLAY_CIRCLE;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openAudioPlayer(td, ctx);
    });
    btn.addEventListener('dblclick', (e) => {
      // Mark as handled so the cell-level dblclick listener doesn't
      // open the player a second time on the same gesture.
      e._sgAudioHandled = true;
      e.stopPropagation();
    });
    wrap.append(btn);

    if (showFilename && !iconOnly) {
      const label = h('span', { class: 'sg-audio-name' },
        document.createTextNode(audio.filename));
      wrap.append(label);
      if (audio.duration != null) {
        wrap.append(h('span', { class: 'sg-audio-duration' },
          document.createTextNode(formatAudioTime(audio.duration))));
      }
    }
    return wrap;
  };
}

// ----- Player abstraction (Howler if available, else <audio>) -----
//
// Both backends expose the same tiny surface: load, play, pause, seek
// (getter/setter), duration, on/off, isPlaying, destroy. The popover
// code below only talks through this interface — swapping backends is
// just a `new`.

function createAudioBackend(url, { preferHowler } = {}) {
  if (preferHowler && typeof window !== 'undefined' && window.Howl) {
    return new HowlerBackend(url);
  }
  return new NativeAudioBackend(url);
}

class NativeAudioBackend {
  constructor(url) {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.audio.src = url;
    this._evMap = { load: 'loadedmetadata', end: 'ended', play: 'play', pause: 'pause', error: 'error' };
    this._handlers = new Map();
  }
  play() { return this.audio.play(); }
  pause() { this.audio.pause(); }
  seek(s) {
    if (s == null) return this.audio.currentTime || 0;
    this.audio.currentTime = Math.max(0, s);
  }
  duration() {
    const d = this.audio.duration;
    return Number.isFinite(d) ? d : 0;
  }
  isPlaying() { return !this.audio.paused && !this.audio.ended; }
  on(event, fn) {
    const ev = this._evMap[event] || event;
    this.audio.addEventListener(ev, fn);
    this._handlers.set(fn, [ev, fn]);
  }
  off(event, fn) {
    const pair = this._handlers.get(fn);
    if (pair) this.audio.removeEventListener(pair[0], pair[1]);
    this._handlers.delete(fn);
  }
  destroy() {
    try { this.audio.pause(); } catch (_) { /* */ }
    this.audio.src = '';
    this._handlers.clear();
  }
  backendName() { return 'native'; }
}

class HowlerBackend {
  constructor(url) {
    // html5:true is what unlocks scrubbing on long files (Web Audio API
    // route loads the whole buffer upfront — fine for SFX, bad for a
    // 20-minute phone call).
    this.howl = new window.Howl({ src: [url], html5: true, preload: true });
  }
  play() { this.howl.play(); }
  pause() { this.howl.pause(); }
  seek(s) {
    if (s == null) {
      const v = this.howl.seek();
      return typeof v === 'number' ? v : 0;
    }
    this.howl.seek(Math.max(0, s));
  }
  duration() { return this.howl.duration() || 0; }
  isPlaying() { return this.howl.playing(); }
  on(event, fn) { this.howl.on(event, fn); }
  off(event, fn) { this.howl.off(event, fn); }
  destroy() { try { this.howl.unload(); } catch (_) { /* */ } }
  backendName() { return 'howler'; }
}

// ----- Player popover -----

let activeAudioPlayer = null;

function openAudioPlayer(anchor, ctx) {
  closeAudioPlayer();
  const audio = anchor._sgAudio || normaliseAudio(ctx.value);
  if (!audio) return;
  const opts = anchor._sgAudioOpts || { preferHowler: true, skipSeconds: 10 };
  const backend = createAudioBackend(audio.url, opts);

  const pop = h('div', { class: 'sg-audio-player', role: 'dialog', 'aria-label': 'Audio player' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  // Header — filename + meta + close.
  const header = h('div', { class: 'sg-audio-player-header' });
  const name = h('div', { class: 'sg-audio-player-name', title: audio.filename },
    document.createTextNode(audio.filename));
  const meta = h('div', { class: 'sg-audio-player-meta' });
  const metaParts = [];
  if (audio.byte_size != null) metaParts.push(formatBytes(audio.byte_size));
  if (backend.backendName() === 'howler') metaParts.push('howler.js');
  meta.textContent = metaParts.join(' · ');
  const close = h('button', { type: 'button', class: 'sg-audio-player-close',
                              'aria-label': 'Close player' });
  close.innerHTML = AUDIO_X_SVG;
  close.addEventListener('click', closeAudioPlayer);
  header.append(name, meta, close);

  // Scrubber: track + fill + thumb. Click anywhere on the track to seek;
  // pointerdown on the thumb (or anywhere) starts a drag that follows the
  // pointer until release.
  const track = h('div', { class: 'sg-audio-track', role: 'slider',
                            'aria-label': 'Seek', tabindex: '0',
                            'aria-valuemin': '0', 'aria-valuemax': '0', 'aria-valuenow': '0' });
  const fill  = h('div', { class: 'sg-audio-track-fill' });
  const thumb = h('div', { class: 'sg-audio-track-thumb' });
  track.append(fill, thumb);

  const times = h('div', { class: 'sg-audio-times' });
  const cur = h('span', { class: 'sg-audio-time-current' }, document.createTextNode('0:00'));
  const tot = h('span', { class: 'sg-audio-time-total' },
    document.createTextNode(audio.duration ? formatAudioTime(audio.duration) : '--:--'));
  times.append(cur, tot);

  // Transport: back-10 / play / fwd-10.
  const transport = h('div', { class: 'sg-audio-transport' });
  const back = h('button', { type: 'button', class: 'sg-audio-btn sg-audio-skip',
                              title: `Back ${opts.skipSeconds}s`,
                              'aria-label': `Back ${opts.skipSeconds} seconds` });
  back.innerHTML = AUDIO_BACK10_SVG;
  const play = h('button', { type: 'button', class: 'sg-audio-btn sg-audio-play',
                              title: 'Play / pause (Space)',
                              'aria-label': 'Play', 'data-state': 'paused' });
  play.innerHTML = AUDIO_PLAY_SVG;
  const fwd = h('button', { type: 'button', class: 'sg-audio-btn sg-audio-skip',
                             title: `Forward ${opts.skipSeconds}s`,
                             'aria-label': `Forward ${opts.skipSeconds} seconds` });
  fwd.innerHTML = AUDIO_FWD10_SVG;
  transport.append(back, play, fwd);

  pop.append(header, track, times, transport);

  // ----- State + rendering loop -----

  let duration = audio.duration ?? 0;
  let dragging = false;
  let rafHandle = null;

  function setPercent(pct) {
    const p = Math.max(0, Math.min(100, pct));
    fill.style.width = p + '%';
    thumb.style.left = p + '%';
  }
  function paint() {
    const t = backend.seek();
    // Prefer the backend's reported duration once it lands (truth), but fall
    // back to whatever the cell value supplied so the time display isn't
    // stuck on "--:--" while the audio is still loading.
    const backendDur = backend.duration() || 0;
    const d = backendDur || duration || 0;
    if (d > 0 && d !== duration) {
      duration = d;
      tot.textContent = formatAudioTime(duration);
      track.setAttribute('aria-valuemax', String(Math.floor(duration)));
    }
    if (!dragging) {
      const pct = duration > 0 ? (t / duration) * 100 : 0;
      setPercent(pct);
      cur.textContent = formatAudioTime(t);
      track.setAttribute('aria-valuenow', String(Math.floor(t)));
    }
  }
  function tick() {
    paint();
    if (backend.isPlaying()) rafHandle = requestAnimationFrame(tick);
    else rafHandle = null;
  }
  function startTick() {
    if (rafHandle == null) rafHandle = requestAnimationFrame(tick);
  }
  function stopTick() {
    if (rafHandle != null) cancelAnimationFrame(rafHandle);
    rafHandle = null;
  }

  // ----- Backend events -----

  const onLoad = () => { duration = backend.duration(); paint(); };
  const onPlay = () => {
    play.dataset.state = 'playing';
    play.innerHTML = AUDIO_PAUSE_SVG;
    play.setAttribute('aria-label', 'Pause');
    startTick();
  };
  const onPause = () => {
    play.dataset.state = 'paused';
    play.innerHTML = AUDIO_PLAY_SVG;
    play.setAttribute('aria-label', 'Play');
    stopTick();
    paint();
  };
  const onEnd = () => {
    play.dataset.state = 'paused';
    play.innerHTML = AUDIO_PLAY_SVG;
    play.setAttribute('aria-label', 'Play');
    stopTick();
    // Reset the scrubber to start so a second click on play replays.
    backend.seek(0);
    paint();
  };
  backend.on('load', onLoad);
  backend.on('play', onPlay);
  backend.on('pause', onPause);
  backend.on('end', onEnd);

  // ----- Controls -----

  play.addEventListener('click', (e) => {
    e.stopPropagation();
    if (backend.isPlaying()) backend.pause();
    else backend.play();
  });
  back.addEventListener('click', (e) => {
    e.stopPropagation();
    backend.seek(Math.max(0, backend.seek() - opts.skipSeconds));
    paint();
  });
  fwd.addEventListener('click', (e) => {
    e.stopPropagation();
    const d = backend.duration();
    backend.seek(Math.min(d || Infinity, backend.seek() + opts.skipSeconds));
    paint();
  });

  // Scrubbing — click track or drag the thumb. We use pointer events so
  // a single handler covers mouse + touch + pen.
  function seekFromPointer(e) {
    const rect = track.getBoundingClientRect();
    const x = (e.clientX ?? 0) - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    const d = backend.duration() || duration;
    if (!d) return;
    const t = pct * d;
    backend.seek(t);
    setPercent(pct * 100);
    cur.textContent = formatAudioTime(t);
  }
  track.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    dragging = true;
    track.setPointerCapture?.(e.pointerId);
    track.classList.add('is-dragging');
    seekFromPointer(e);
  });
  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    seekFromPointer(e);
  });
  const endDrag = (e) => {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    try { track.releasePointerCapture?.(e.pointerId); } catch (_) { /* */ }
  };
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  // Keyboard on the focused track: arrow keys + Home/End scrub.
  track.addEventListener('keydown', (e) => {
    const d = backend.duration() || duration;
    if (!d) return;
    const step = e.shiftKey ? 30 : 5;
    let next = null;
    if (e.key === 'ArrowLeft')      next = Math.max(0, backend.seek() - step);
    else if (e.key === 'ArrowRight') next = Math.min(d, backend.seek() + step);
    else if (e.key === 'Home')       next = 0;
    else if (e.key === 'End')        next = d;
    if (next != null) {
      e.preventDefault();
      backend.seek(next);
      paint();
    }
  });

  // ----- Lifecycle: keyboard + outside click + close -----

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeAudioPlayer(); }
    else if (e.key === ' ' || e.code === 'Space') {
      // Space toggles play, but only when the popover (or descendants)
      // has focus — otherwise it would steal the page's space scroll.
      if (pop.contains(document.activeElement)) {
        e.preventDefault();
        if (backend.isPlaying()) backend.pause(); else backend.play();
      }
    }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeAudioPlayer();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);

  // Some browsers fire 'loadedmetadata' before we wire the listener (cached
  // audio). Paint immediately so the popover isn't blank during that race.
  paint();
  play.focus();

  activeAudioPlayer = {
    pop, backend, onKey, onDocClick,
    cleanup: () => {
      stopTick();
      try {
        backend.off('load', onLoad);
        backend.off('play', onPlay);
        backend.off('pause', onPause);
        backend.off('end', onEnd);
      } catch (_) { /* */ }
      backend.destroy();
    },
  };
}

function closeAudioPlayer() {
  if (!activeAudioPlayer) return;
  const { pop, onKey, onDocClick, cleanup } = activeAudioPlayer;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  cleanup();
  pop.remove();
  activeAudioPlayer = null;
}

/* ---------- switch (interactive boolean, pill style) ----------------
 *
 * Same data semantics as `checkbox` — same `truthy` recogniser, same
 * commit-and-dispatch contract — but rendered as a sliding on/off pill
 * (iOS / Material). Useful when the column reads better as a control
 * affordance ("Enabled? On / Off") than as a logical flag (`true /
 * false`). Null / undefined renders the pill in a neutral middle
 * position with a dimmed thumb. */
export function switchRenderer({
  truthy = defaultIsTruthy,
  disabled = false,
} = {}) {
  return (ctx) => {
    const { value, row, col, api, td } = ctx;
    if (td) td.classList.add('sg-renderer-switch-cell');
    const isNull = value == null || value === '';
    const checked = !isNull && truthy(value);
    const wrap = h('button', {
      type: 'button',
      class: `sg-renderer-switch${checked ? ' is-on' : ''}${isNull ? ' is-null' : ''}`,
      role: 'switch',
      'aria-checked': isNull ? 'mixed' : (checked ? 'true' : 'false'),
      'aria-label': col?.field || 'toggle',
      disabled: disabled ? '' : null,
    });
    wrap.append(h('span', { class: 'sg-renderer-switch-thumb', 'aria-hidden': 'true' }));
    wrap.addEventListener('click', (e) => {
      e.stopPropagation();
      if (disabled) return;
      // Null cycles to true on first click — feels more useful than cycling
      // null → false → true (two clicks to "turn on" is annoying).
      const next = isNull ? true : !checked;
      const oldValue = row && col?.field != null ? row[col.field] : null;
      if (row && col?.field != null) row[col.field] = next;
      if (api?.applyTransaction) api.applyTransaction({ update: [row] });
      const grid = td?.closest('[data-controller~="grid"]');
      if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
        bubbles: true,
        detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
      }));
    });
    return wrap;
  };
}

/* ---------- markdown (inline subset) -------------------------------
 *
 * A tiny, dependency-free Markdown subset for cells holding descriptions,
 * comments, or release-note blurbs. Inline marks: `**bold**`, `*italic*`,
 * `` `code` ``, `~~strike~~`, `[text](url)` for http/https/mailto only
 * (other schemes are dropped to neutralise `javascript:` injection).
 * Block level: `- ` and `* ` bulleted lists, `1. ` ordered lists.
 *
 *   <th data-header-cell-cell-renderer-value="markdown">Notes</th>
 *
 * For single-line headings, captions, or one-liner notes pass
 * `{ inline: true }` to skip the block parse (no lists, no <br>s).
 *
 * Safety: we escape the raw value to HTML entities *first*, then run
 * the regex transforms — so user `<script>` literally becomes `&lt;script&gt;`
 * and the markdown transforms only ever emit a whitelisted tag set. */
const MD_LINK_SAFE_RE = /^(https?:\/\/|mailto:)/i;

function mdEscapeHTML(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function mdInline(escaped) {
  let out = escaped;
  // Inline code — backticks. Pull these out first so their contents
  // aren't re-parsed for bold/italic/etc.
  out = out.replace(/`([^`\n]+)`/g, (_, body) => `<code>${body}</code>`);
  // Links — whitelist http/https/mailto only.
  out = out.replace(/\[([^\]\n]+)\]\(([^)\n]+)\)/g, (m, text, url) => {
    return MD_LINK_SAFE_RE.test(url)
      ? `<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`
      : m;     // leave unrecognised schemes verbatim — never emit a link
  });
  // Bold — ** or __
  out = out.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_\n]+)__/g, '<strong>$1</strong>');
  // Italic — * or _ (require a non-alnum boundary so "snake_case" survives).
  out = out.replace(/(^|[\s(])\*([^*\n]+?)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  out = out.replace(/(^|[\s(])_([^_\n]+?)_(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  // Strikethrough.
  out = out.replace(/~~([^~\n]+)~~/g, '<del>$1</del>');
  return out;
}

function mdBlock(escaped) {
  const lines = escaped.split('\n');
  const out = [];
  let list = null;                              // 'ul' | 'ol' | null
  let buf = [];
  const flush = () => {
    if (!list) return;
    out.push(`<${list}>${buf.map((b) => `<li>${mdInline(b)}</li>`).join('')}</${list}>`);
    list = null; buf = [];
  };
  for (const line of lines) {
    const ulM = /^\s*[-*]\s+(.+)$/.exec(line);
    const olM = /^\s*\d+\.\s+(.+)$/.exec(line);
    if (ulM) {
      if (list && list !== 'ul') flush();
      list = 'ul'; buf.push(ulM[1]);
    } else if (olM) {
      if (list && list !== 'ol') flush();
      list = 'ol'; buf.push(olM[1]);
    } else {
      flush();
      if (line.trim() === '') out.push('');
      else out.push(mdInline(line));
    }
  }
  flush();
  // Join non-list runs with <br>; blank lines collapse to a single break
  // so a "paragraph gap" reads as one extra newline visually, not two.
  return out.join('<br>').replace(/(<br>){2,}/g, '<br><br>');
}

export function markdown({ inline = false } = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    const escaped = mdEscapeHTML(value);
    const html = inline ? mdInline(escaped) : mdBlock(escaped);
    if (td) {
      td.classList.add('sg-renderer-markdown-cell');
      const tr = td.parentElement;
      if (tr && tr.tagName === 'TR') tr.classList.add('sg-has-multiline');
    }
    const wrap = h('div', { class: `sg-renderer-markdown${inline ? ' is-inline' : ''}` });
    wrap.innerHTML = html;
    return wrap;
  };
}

/* ---------- json (collapsible pretty-print) -------------------------
 *
 * Audit-log payloads, API-response columns, debug dashboards. The
 * collapsed form is a one-line summary — `{ a: 1, b: "foo", +2 }` /
 * `[1, 2, 3, +5]` — clickable to expand into a fully indented,
 * lightly syntax-highlighted block. Uses native `<details>` for the
 * disclosure UX so screen readers + keyboard nav already work.
 *
 *   <th data-header-cell-cell-renderer-value="json">Payload</th>
 *
 * Accepts an object/array directly OR a JSON string (we'll parse it).
 * Anything that isn't valid JSON passes through as text. */
function jsonHighlight(text) {
  return mdEscapeHTML(text)
    .replace(/(&quot;(?:[^&\\]|\\.)*?&quot;)\s*:/g, '<span class="sg-json-key">$1</span>:')
    .replace(/:\s*(&quot;(?:[^&\\]|\\.)*?&quot;)/g, ': <span class="sg-json-string">$1</span>')
    .replace(/(?<=[\s:,\[])(-?\d+(?:\.\d+)?(?:e[-+]?\d+)?)(?=[\s,\]\}\n])/g, '<span class="sg-json-number">$1</span>')
    .replace(/(?<=[\s:,\[])(true|false)(?=[\s,\]\}\n])/g, '<span class="sg-json-bool">$1</span>')
    .replace(/(?<=[\s:,\[])(null)(?=[\s,\]\}\n])/g, '<span class="sg-json-null">$1</span>');
}

function jsonSummary(data, maxItems) {
  const isArr = Array.isArray(data);
  const entries = isArr ? data : Object.entries(data);
  const shown = entries.slice(0, maxItems);
  const overflow = entries.length - shown.length;
  const fmt = (v) => {
    if (v == null) return 'null';
    const t = typeof v;
    if (t === 'string') return v.length > 18 ? `"${v.slice(0, 15)}…"` : `"${v}"`;
    if (t === 'number' || t === 'boolean') return String(v);
    if (Array.isArray(v)) return `[${v.length}]`;
    if (t === 'object') return `{…}`;
    return String(v);
  };
  const inner = isArr
    ? shown.map(fmt).join(', ')
    : shown.map(([k, v]) => `${k}: ${fmt(v)}`).join(', ');
  const tail = overflow > 0 ? `, +${overflow}` : '';
  return isArr ? `[${inner}${tail}]` : `{ ${inner}${tail} }`;
}

export function json({ maxKeys = 3, indent = 2 } = {}) {
  return ({ value, td }) => {
    if (value == null || value === '') return '';
    let data = value;
    if (typeof value === 'string') {
      try { data = JSON.parse(value); }
      catch { return String(value); }    // not JSON — pass through verbatim
    }
    if (data == null) {
      return h('span', { class: 'sg-renderer-json-scalar sg-json-null' }, document.createTextNode('null'));
    }
    if (typeof data !== 'object') {
      const t = typeof data;
      const cls = t === 'string' ? 'sg-json-string' : t === 'number' ? 'sg-json-number' : 'sg-json-bool';
      const txt = t === 'string' ? `"${data}"` : String(data);
      return h('span', { class: `sg-renderer-json-scalar ${cls}` }, document.createTextNode(txt));
    }
    const details = document.createElement('details');
    details.className = 'sg-renderer-json';
    const sum = document.createElement('summary');
    sum.className = 'sg-renderer-json-summary';
    // Use the project chevron (same glyph the sort + tree + master/detail
    // headers use). CSS rotates it 90° when the <details> is open.
    const chev = h('span', { class: 'sg-renderer-json-chevron', 'aria-hidden': 'true' });
    chev.innerHTML = SG_CHEVRON_SVG;
    sum.append(chev);
    sum.append(h('span', { class: 'sg-renderer-json-summary-text' },
      document.createTextNode(jsonSummary(data, maxKeys))));
    const pre = document.createElement('pre');
    pre.className = 'sg-renderer-json-pre';
    pre.innerHTML = jsonHighlight(JSON.stringify(data, null, indent));
    details.append(sum, pre);
    // Clicks on the summary toggle the details; stop propagation so the
    // grid's cell-edit / row-select handlers don't fire alongside.
    sum.addEventListener('click', (e) => e.stopPropagation());
    if (td) {
      td.classList.add('sg-renderer-json-cell');
      const tr = td.parentElement;
      if (tr && tr.tagName === 'TR') tr.classList.add('sg-has-multiline');
    }
    return details;
  };
}

/* ---------- linkedRecord (foreign-key chip) -------------------------
 *
 * Airtable / Notion-style relationship chip: the cell value is a key,
 * the renderer resolves that key to a display name (+ optional avatar /
 * tint / outbound link) via a lookup function or a global map. Mirrors
 * `avatar`'s lookup contract:
 *
 *   1. opts.lookup(value, row) — full control
 *   2. window[opts.windowKey]  — a Map / object keyed by the FK
 *   3. opts.fallback(value)    — last-resort string formatter
 *
 *   registerRenderer('owner', linkedRecord({
 *     lookup: (id) => USERS.get(id),
 *     href:   (id) => `/users/${id}`,
 *   }))
 *
 * Pass `multiple: true` for array-of-keys columns (one chip per key);
 * pass a per-entry `color` (any CSS colour) and the chip background
 * tints to match — useful for project / status / tag-linked records. */
export function linkedRecord({
  lookup = null,
  windowKey = '__sgLinks',
  showThumb = true,
  href = null,
  multiple = false,
  fallback = (v) => String(v),
} = {}) {
  return ({ value, row }) => {
    if (isBlank(value)) return '';
    const keys = multiple
      ? (Array.isArray(value) ? value : String(value).split(',').map((s) => s.trim()).filter(Boolean))
      : [value];
    const wrap = h('span', { class: 'sg-renderer-linked-records' });
    for (const k of keys) {
      const entry = resolveLinkedRecord(k, row, lookup, windowKey);
      wrap.append(buildLinkedRecordChip(k, row, entry, { showThumb, href, fallback }));
    }
    return wrap;
  };
}

function resolveLinkedRecord(value, row, lookup, windowKey) {
  if (typeof lookup === 'function') return lookup(value, row) || null;
  if (typeof window === 'undefined') return null;
  const src = window[windowKey];
  if (!src) return null;
  if (src instanceof Map) return src.get(value) || src.get(String(value)) || null;
  if (typeof src === 'object') return src[value] ?? src[String(value)] ?? null;
  return null;
}

function buildLinkedRecordChip(value, row, entry, { showThumb, href, fallback }) {
  const name = entry?.name ?? fallback(value);
  const url = typeof href === 'function' ? href(value, row, entry) : (entry?.href || null);
  const chip = document.createElement(url ? 'a' : 'span');
  chip.className = 'sg-renderer-linked-record';
  if (url) {
    chip.href = url;
    chip.target = '_blank';
    chip.rel = 'noopener noreferrer';
    chip.addEventListener('click', (e) => e.stopPropagation());
  }
  if (entry?.color) chip.style.setProperty('--lr-tint', entry.color);
  if (showThumb && entry?.thumb) {
    chip.append(h('img', {
      src: entry.thumb, alt: '', class: 'sg-renderer-linked-record-thumb',
      loading: 'lazy', decoding: 'async',
    }));
  } else if (showThumb && name) {
    const initials = String(name).split(/\s+/).filter(Boolean).slice(0, 2)
      .map((w) => w[0]?.toUpperCase() || '').join('');
    if (initials) {
      chip.append(h('span', {
        class: 'sg-renderer-linked-record-initials', 'aria-hidden': 'true',
      }, document.createTextNode(initials)));
    }
  }
  chip.append(h('span', { class: 'sg-renderer-linked-record-name' },
    document.createTextNode(name)));
  return chip;
}

/* ---------- colouredTags (per-value tint, multi-select) -------------
 *
 * `tags` paints every chip the same neutral colour. This sibling does
 * what Notion / Airtable do — each value can opt into a colour from the
 * grid's palette (gray | red | orange | yellow | green | blue | indigo |
 * purple | pink, plus per-value override via raw CSS colour). Unknown
 * values fall back to `defaultColor`.
 *
 *   registerRenderer('priority', colouredTags({
 *     colorMap: { p0: 'red', p1: 'orange', p2: 'yellow', p3: 'green', p4: 'gray' },
 *   }))
 *
 * Same CSV / array input contract as `tags`. */
export function colouredTags({
  separator = ',',
  colorMap = {},
  defaultColor = 'gray',
} = {}) {
  // Lower-case the colour-map keys once so per-cell lookups don't repeat
  // the work — input data may be sloppy ("VIP" / "vip" / "Vip" all match).
  const cmap = {};
  for (const [k, v] of Object.entries(colorMap)) cmap[String(k).toLowerCase()] = v;
  return ({ value }) => {
    if (isBlank(value)) return '';
    const list = Array.isArray(value) ? value : String(value).split(separator);
    const wrap = h('div', { class: 'sg-renderer-coloured-tags' });
    for (const t of list) {
      const text = String(t).trim();
      if (!text) continue;
      const colour = cmap[text.toLowerCase()] || defaultColor;
      // Palette name → sg-pill-* class; raw CSS colour (#hex, oklch(), …)
      // sets the background inline (with a contrast-aware foreground).
      const chip = h('span', { class: 'sg-renderer-coloured-tag' },
        document.createTextNode(text));
      if (/^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/.test(colour)) {
        chip.classList.add(`sg-pill-${colour}`);
      } else {
        chip.style.background = colour;
        chip.style.color = readableForeground(colour);
      }
      wrap.append(chip);
    }
    return wrap;
  };
}

// Pick black or white text for a given background colour. Only honours
// #hex inputs (named colours / oklch / rgb() we can't introspect without
// a canvas; in those cases we just leave the existing colour and hope
// the user's palette is sensible — the named-colour path above is the
// recommended option).
function readableForeground(bg) {
  const rgb = hexToRgb(bg);
  if (!rgb) return 'inherit';
  return isLightRgb(rgb) ? '#1f2937' : '#ffffff';
}

/* ---------- time (HH:MM[:SS]) ---------------------------------------
 *
 * `date` / `datetime` already exist; this is the time-of-day-only sibling.
 * Accepts:
 *   - "HH:MM" / "HH:MM:SS" / "HH:MM:SS.sss"  (parsed verbatim)
 *   - a full ISO date / Date object         (HH:MM[:SS] extracted)
 *   - a number of seconds since midnight    (e.g. 3661 → 01:01:01)
 *
 *   <th data-header-cell-cell-renderer-value="time">Start</th>
 *
 * `style: '12h'` for 1:30 PM display; `seconds: true` adds the trailing
 * `:SS` block. Locale is honoured via `Intl.DateTimeFormat` when present. */
function toTime(v) {
  if (v == null || v === '') return null;
  if (v instanceof Date) {
    if (Number.isNaN(v.valueOf())) return null;
    return { h: v.getHours(), m: v.getMinutes(), s: v.getSeconds() };
  }
  if (typeof v === 'number' && Number.isFinite(v)) {
    // Seconds since midnight; > 86400 wraps.
    const total = ((v % 86400) + 86400) % 86400;
    return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: Math.floor(total % 60) };
  }
  const s = String(v).trim();
  // Pure HH:MM[:SS][.sss] — no date part.
  const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?$/.exec(s);
  if (m) {
    return { h: parseInt(m[1], 10), m: parseInt(m[2], 10), s: m[3] ? parseInt(m[3], 10) : 0 };
  }
  // Fall back to Date parsing — covers "2026-05-25T09:14:48Z" etc.
  const d = new Date(s);
  if (Number.isNaN(d.valueOf())) return null;
  return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() };
}

export function time({
  style = '24h',                 // '24h' | '12h'
  seconds = false,
  locale = undefined,
} = {}) {
  return ({ value }) => {
    const t = toTime(value);
    if (!t) return '';
    if (style === '12h') {
      // Use Intl for the AM/PM marker so it localises (en-US: AM/PM,
      // ja-JP: 午前/午後). Build a Date so we don't reimplement Intl.
      const d = new Date(0); d.setHours(t.h, t.m, t.s);
      const fmt = new Intl.DateTimeFormat(locale, {
        hour: 'numeric',
        minute: '2-digit',
        ...(seconds ? { second: '2-digit' } : {}),
        hour12: true,
      });
      return fmt.format(d);
    }
    const pad = (n) => String(n).padStart(2, '0');
    const tail = seconds ? `:${pad(t.s)}` : '';
    return `${pad(t.h)}:${pad(t.m)}${tail}`;
  };
}

/* ---------- diff (old → new) ----------------------------------------
 *
 * Audit-log and change-history columns. Accepts:
 *
 *   { from, to }   /  { old, new }  /  { before, after }  /  { previous, current }
 *   [from, to]
 *   "from → to"    (also accepts `->`, `=>`, `—>` arrows)
 *
 *   <th data-header-cell-cell-renderer-value="diff">Change</th>
 *
 * One-sided diffs (null on either side) render as a single coloured
 * value with a `+ ` / `− ` prefix — saves emitting a confusing
 * "null → new" / "old → null". Pass `style: 'stacked'` for vertically
 * stacked from / to rows. */
function parseDiffValue(value) {
  if (Array.isArray(value)) return { from: value[0], to: value[1] };
  if (value && typeof value === 'object') {
    return {
      from: value.from ?? value.old    ?? value.before ?? value.previous ?? null,
      to:   value.to   ?? value.new    ?? value.after  ?? value.current  ?? null,
    };
  }
  const s = String(value);
  const m = /^(.*?)\s*(?:→|->|=>|—>)\s*(.+)$/.exec(s);
  if (m) return { from: m[1].trim(), to: m[2].trim() };
  return { from: null, to: s };
}

export function diff({
  style = 'inline',                // 'inline' | 'stacked'
  arrow = '→',
  showArrow = true,
} = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const { from, to } = parseDiffValue(value);
    const blank = (v) => v == null || v === '';
    if (blank(from) && blank(to)) return '';
    if (blank(from)) {
      return h('span', { class: 'sg-renderer-diff is-added' },
        h('span', { class: 'sg-diff-to' }, document.createTextNode(String(to))));
    }
    if (blank(to)) {
      return h('span', { class: 'sg-renderer-diff is-removed' },
        h('span', { class: 'sg-diff-from' }, document.createTextNode(String(from))));
    }
    const wrap = h('span', { class: `sg-renderer-diff is-${style}` });
    wrap.append(h('span', { class: 'sg-diff-from' }, document.createTextNode(String(from))));
    if (showArrow) {
      wrap.append(h('span', { class: 'sg-diff-arrow', 'aria-hidden': 'true' },
        document.createTextNode(arrow)));
    }
    wrap.append(h('span', { class: 'sg-diff-to' }, document.createTextNode(String(to))));
    return wrap;
  };
}

/* ---------- geo (latitude / longitude) ------------------------------
 *
 * Lat-lng pair, formatted as either decimal degrees ("33.8688, 151.2093")
 * or sexagesimal DMS ("33°52'07.7\"S 151°12'33.5\"E"), with a small
 * "View on Maps" link. Plug an optional `staticMap(lat, lng) => url`
 * function to paint a tile thumbnail beside the coords (Mapbox /
 * Google Static Maps / OpenStreetMap tiles — your choice of provider).
 *
 *   <th data-header-cell-cell-renderer-value="geo">Coordinates</th>
 *
 * Value shapes accepted: `[lat, lng]`, `{ lat, lng }` (also `latitude`/
 * `longitude`, `lon`/`long`), or `"lat,lng"` string. */
function parseLatLng(v) {
  if (v == null || v === '') return null;
  if (Array.isArray(v)) {
    const lat = Number(v[0]), lng = Number(v[1]);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  }
  if (typeof v === 'object') {
    const lat = Number(v.lat ?? v.latitude);
    const lng = Number(v.lng ?? v.long ?? v.lon ?? v.longitude);
    return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  }
  const parts = String(v).split(',');
  if (parts.length !== 2) return null;
  const lat = Number(parts[0].trim()), lng = Number(parts[1].trim());
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function geoToDMS(decimal, isLat) {
  const sign = decimal >= 0 ? 1 : -1;
  const abs = Math.abs(decimal);
  const deg = Math.floor(abs);
  const minF = (abs - deg) * 60;
  const min = Math.floor(minF);
  const sec = (minF - min) * 60;
  const dir = isLat ? (sign > 0 ? 'N' : 'S') : (sign > 0 ? 'E' : 'W');
  return `${deg}°${String(min).padStart(2, '0')}'${sec.toFixed(1)}"${dir}`;
}

export function geo({
  decimals = 4,
  style = 'decimal',                // 'decimal' | 'dms'
  mapUrl = (lat, lng) => `https://www.google.com/maps?q=${lat},${lng}`,
  linkText = 'View on Maps',
  staticMap = null,                 // (lat, lng) => url
  staticSize = 72,
} = {}) {
  return ({ value }) => {
    const ll = parseLatLng(value);
    if (!ll) return '';
    const wrap = h('span', { class: 'sg-renderer-geo' });
    if (typeof staticMap === 'function') {
      const tileUrl = staticMap(ll.lat, ll.lng);
      if (tileUrl) {
        wrap.append(h('img', {
          src: tileUrl, alt: '', class: 'sg-renderer-geo-thumb',
          width: String(staticSize), height: String(staticSize),
          loading: 'lazy', decoding: 'async',
        }));
      }
    }
    const text = style === 'dms'
      ? `${geoToDMS(ll.lat, true)} ${geoToDMS(ll.lng, false)}`
      : `${ll.lat.toFixed(decimals)}, ${ll.lng.toFixed(decimals)}`;
    wrap.append(h('span', { class: 'sg-renderer-geo-coords' }, document.createTextNode(text)));
    const url = mapUrl(ll.lat, ll.lng);
    if (url) {
      const link = h('a', {
        class: 'sg-renderer-geo-link sg-renderer-link',
        href: url,
        target: '_blank',
        rel: 'noopener noreferrer',
        title: 'Open in maps',
      }, document.createTextNode(linkText));
      link.addEventListener('click', (e) => e.stopPropagation());
      wrap.append(link);
    }
    return wrap;
  };
}

/* ---------- qr (QR code SVG) ----------------------------------------
 *
 * Inline SVG QR code from the cell value. Pure-JS encoder lives in
 * `lib/qr.js` — Reed-Solomon over GF(2^8), versions 1-10, ECC level
 * Medium (~15% recovery), byte mode. Capacity tops out at 213 bytes
 * (UTF-8); longer values fall back to a muted "…too long" placeholder.
 *
 *   <th data-header-cell-cell-renderer-value="qr">Pay link</th>
 *
 * `moduleSize` controls pixel-per-module; `margin` (in modules) is the
 * quiet zone the spec requires (≥ 4 in production; 2 is fine for cell
 * thumbnails that aren't going to be scanned via a damp pub camera). */
export function qr({
  moduleSize = 3,
  margin = 2,
  background = '#fff',
  foreground = '#111827',
  showText = false,
} = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const text = String(value);
    let svg;
    try {
      const enc = encodeQR(text);
      svg = qrToSVG(enc, { moduleSize, margin, background, foreground });
    } catch (_e) {
      // Over-capacity payload (>213 UTF-8 bytes). Render a muted fallback
      // so the cell still communicates "there's data here, it just can't
      // fit into a QR".
      return h('span', { class: 'sg-renderer-qr-overflow', title: text },
        document.createTextNode('QR · too long'));
    }
    const wrap = h('span', { class: 'sg-renderer-qr' });
    wrap.innerHTML = svg;
    if (showText) {
      wrap.append(h('span', { class: 'sg-renderer-qr-text' }, document.createTextNode(text)));
    }
    return wrap;
  };
}

/* ---------- code (monospace snippet) --------------------------------
 *
 * Code-like cell values that deserve a monospace face, dark chrome,
 * and an optional copy button. Different from `copyable`: this one
 * styles the value AS code (dark pre block, syntax-friendly background)
 * rather than as a styled label with a copy chip.
 *
 *   <th data-header-cell-cell-renderer-value="code">Snippet</th>
 *
 * Pass `language: 'sql' | 'sh' | 'js' | …` to surface a small uppercase
 * label in the top-right of the block. `copy: false` removes the copy
 * button (e.g. when the value is sensitive enough that we don't want
 * one-click copying). */
export function code({
  language = null,
  copy = true,
} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    const text = String(value);
    if (td) {
      td.classList.add('sg-renderer-code-cell');
      const tr = td.parentElement;
      if (tr && tr.tagName === 'TR') tr.classList.add('sg-has-multiline');
    }
    const wrap = h('div', { class: 'sg-renderer-code' });
    if (language) {
      wrap.append(h('span', { class: 'sg-renderer-code-lang' },
        document.createTextNode(String(language))));
    }
    if (copy) {
      const btn = h('button', {
        type: 'button',
        class: 'sg-renderer-code-copy',
        title: 'Copy',
        'aria-label': 'Copy code',
      });
      btn.innerHTML = COPY_SVG;
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
          else fallbackCopy(text);
          btn.innerHTML = COPY_OK_SVG;
          btn.classList.add('is-copied');
          setTimeout(() => {
            btn.innerHTML = COPY_SVG;
            btn.classList.remove('is-copied');
          }, 1200);
        } catch (_) { /* UI feedback is the failure signal */ }
      });
      wrap.append(btn);
    }
    const pre = h('pre', { class: 'sg-renderer-code-pre' });
    pre.textContent = text;
    wrap.append(pre);
    return wrap;
  };
}

/* ---------- rating (configurable icon) ------------------------------
 *
 * The generic sibling of `star-rating`: same fractional-fill engine,
 * different glyph. Icons:
 *
 *   icon: 'star'    — same as the existing `star-rating` renderer
 *   icon: 'heart'   — pink filled heart (likes / favourites)
 *   icon: 'thumb'   — binary thumb-up / down (value > 0 / < 0 / 0)
 *   icon: 'smiley'  — single emoji face on a 1-N scale (1 = sad … N = ecstatic)
 *   icon: 'nps'     — single 0-10 chip with detractor / passive / promoter
 *                     colour bands (red / amber / green)
 *
 *   registerRenderer('hearts', rating({ icon: 'heart', max: 5 }))
 *   registerRenderer('csat',   rating({ icon: 'smiley', max: 5 }))
 *   registerRenderer('nps',    rating({ icon: 'nps' }))
 *
 * For `thumb`: value > 0 → up, < 0 → down, 0/null → muted shrug.
 * For `nps`: 0-6 → red (Detractor), 7-8 → amber (Passive), 9-10 → green
 * (Promoter). Score is title-tooltipped with the band label. */
const RATING_HEART_SVG = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M225.8 468.2L46.9 295.4C18.9 268.2 0 230.1 0 187.8C0 117.4 56.1 60 125.7 60c25.3 0 51 9.2 70.3 25.4L256 138l60-52.6C335.3 69.2 361 60 386.3 60C455.9 60 512 117.4 512 187.8c0 42.3-18.9 80.4-46.9 107.6L286.2 468.2c-7.2 7.4-17.1 11.8-27.6 11.8c-10.5 0-20.4-4.4-27.6-11.8z"/></svg>';
const RATING_THUMB_UP_SVG = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 32.9c26 5.2 42.9 30.5 37.7 56.5l-2.3 11.4c-5.3 26.7-15.1 52.1-28.8 75.2H464c26.5 0 48 21.5 48 48c0 18.5-10.5 34.6-25.9 42.6C497 275.4 504 288.9 504 304c0 23.4-16.8 42.9-38.9 47.1c4.4 7.3 6.9 15.8 6.9 24.9c0 21.3-13.9 39.4-33.1 45.6c.7 3.3 1.1 6.8 1.1 10.4c0 26.5-21.5 48-48 48H294.5c-19 0-37.5-5.6-53.3-16.1l-38.5-25.7C176 420.4 160 390.4 160 358.3V320 272 247.1c0-29.2 13.3-56.7 36-75.1c16.3-13.2 28.9-30.4 36.6-50l8.1-20.3c5-12.4 11.3-24.2 19-35.2l4.4-6.3 0 0c1.4-2 1.1-4.7-.6-6.4l0 0c-3.8-3.8-9.9-3.8-13.7 0L208.8 84.9c-3 3-7 4.7-11.3 4.7c-8.8 0-16-7.2-16-16V63.4c0-8.8 7.2-16 16-16h.5c8.8 0 16 7.2 16 16v6.2c34-2.4 71-13 100-25.6c11-4.8 22.1-9.3 33-13.6l1-.4c12-4.6 27.3-9.3 41.4-9.3z"/></svg>';
const RATING_THUMB_DOWN_SVG = '<svg viewBox="0 0 512 512" aria-hidden="true"><path fill="currentColor" d="M313.4 479.1c26-5.2 42.9-30.5 37.7-56.5l-2.3-11.4c-5.3-26.7-15.1-52.1-28.8-75.2H464c26.5 0 48-21.5 48-48c0-18.5-10.5-34.6-25.9-42.6C497 236.6 504 223.1 504 208c0-23.4-16.8-42.9-38.9-47.1c4.4-7.3 6.9-15.8 6.9-24.9c0-21.3-13.9-39.4-33.1-45.6c.7-3.3 1.1-6.8 1.1-10.4c0-26.5-21.5-48-48-48H294.5c-19 0-37.5 5.6-53.3 16.1L202.7 73.8C176 91.6 160 121.6 160 153.7V192v48 24.9c0 29.2 13.3 56.7 36 75.1c16.3 13.2 28.9 30.4 36.6 50l8.1 20.3c5 12.4 11.3 24.2 19 35.2l4.4 6.3c1.4 2 1.1 4.7-.6 6.4c-3.8 3.8-9.9 3.8-13.7 0L208.8 427.1c-3-3-7-4.7-11.3-4.7c-8.8 0-16 7.2-16 16v10.2c0 8.8 7.2 16 16 16h.5c8.8 0 16-7.2 16-16v-6.2c34 2.4 71 13 100 25.6c11 4.8 22.1 9.3 33 13.6l1 .4c12 4.6 27.3 9.3 41.4 9.3z"/></svg>';

const RATING_SMILEYS = ['😞', '😕', '😐', '🙂', '😄'];

const RATING_GLYPHS = {
  star:  STAR_SVG,
  heart: RATING_HEART_SVG,
};
const RATING_TINTS = {
  star:  '#f59e0b',
  heart: '#ec4899',
};

export function rating({
  icon = 'heart',
  max = 5,
  precision = 0.5,
  color = null,
} = {}) {
  if (icon === 'smiley') return ratingSmiley({ max });
  if (icon === 'thumb')  return ratingThumb();
  if (icon === 'nps')    return ratingNps();
  // Scaled glyph rating (heart / star / arbitrary).
  const glyph = RATING_GLYPHS[icon] || RATING_GLYPHS.heart;
  const tint  = color || RATING_TINTS[icon] || RATING_TINTS.heart;
  const step = precision > 0 ? 1 / precision : 2;
  return ({ value }) => {
    let n = parseFloat(value);
    if (!Number.isFinite(n)) n = 0;
    n = Math.max(0, Math.min(max, n));
    n = Math.round(n * step) / step;
    const wrap = h('div', {
      class: `sg-renderer-rating is-${icon}`,
      style: `--rating-color: ${tint};`,
      role: 'img',
      'aria-label': `${n} out of ${max}`,
    });
    for (let i = 1; i <= max; i++) {
      if (n >= i) {
        wrap.append(h('span', { class: 'sg-renderer-rating-glyph is-full' }, glyph));
      } else if (n > i - 1) {
        // Same outline-behind / clipped-fill technique star-rating uses for halves.
        const pct = Math.round((n - (i - 1)) * 100);
        wrap.append(h('span', { class: 'sg-renderer-rating-glyph is-partial' },
          `${glyph}<span class="sg-rating-clip" style="width:${pct}%;">${glyph}</span>`));
      } else {
        wrap.append(h('span', { class: 'sg-renderer-rating-glyph is-empty' }, glyph));
      }
    }
    return wrap;
  };
}

function ratingSmiley({ max = 5 } = {}) {
  return ({ value }) => {
    let n = parseFloat(value);
    if (!Number.isFinite(n)) return '';
    n = Math.max(1, Math.min(max, Math.round(n)));
    // Map an arbitrary 1-N onto the 5 face glyphs.
    const idx = Math.min(RATING_SMILEYS.length - 1,
      Math.floor((n - 1) / (max - 1 || 1) * (RATING_SMILEYS.length - 1)));
    return h('span', {
      class: 'sg-renderer-rating-smiley',
      title: `${n}/${max}`,
    }, document.createTextNode(RATING_SMILEYS[idx]));
  };
}

function ratingThumb() {
  return ({ value }) => {
    if (value == null || value === '') return '';
    const v = Number(value);
    if (!Number.isFinite(v)) return '';
    const wrap = h('span', { class: 'sg-renderer-rating-thumb' });
    if (v > 0) {
      wrap.classList.add('is-up');
      wrap.title = 'Thumbs up';
      wrap.innerHTML = RATING_THUMB_UP_SVG;
    } else if (v < 0) {
      wrap.classList.add('is-down');
      wrap.title = 'Thumbs down';
      wrap.innerHTML = RATING_THUMB_DOWN_SVG;
    } else {
      wrap.classList.add('is-neutral');
      wrap.title = 'Neutral';
      wrap.append(document.createTextNode('—'));
    }
    return wrap;
  };
}

function ratingNps() {
  return ({ value }) => {
    const n = parseFloat(value);
    if (!Number.isFinite(n)) return '';
    const score = Math.max(0, Math.min(10, Math.round(n)));
    const band = score <= 6 ? 'detractor' : score <= 8 ? 'passive' : 'promoter';
    const label = band === 'detractor' ? 'Detractor' : band === 'passive' ? 'Passive' : 'Promoter';
    return h('span', {
      class: `sg-renderer-rating-nps is-${band}`,
      title: `${score}/10 · ${label}`,
    }, document.createTextNode(String(score)));
  };
}

/* ---------- bullet (range bar) --------------------------------------
 *
 * Stephen Few's bullet chart — qualitative bands behind a value bar, a
 * vertical tick for the target. Lighter / heavier / heaviest grey bands
 * (or your own palette) show the "poor / satisfactory / good" range; a
 * thin black bar shows the value; a vertical tick marks the target.
 *
 *   registerRenderer('q3', bullet({
 *     min: 0, max: 100, target: 80, ranges: [50, 70],
 *   }))
 *
 * Accepts either a plain number, or `{ value, target, ranges }` for
 * per-row overrides — handy when each row has its own target. */
const BULLET_DEFAULT_COLORS = ['#e5e7eb', '#d1d5db', '#9ca3af'];

export function bullet({
  min = 0,
  max = 100,
  target = null,
  ranges = null,                  // [a] | [a, b] | [a, b, c]
  rangeColors = BULLET_DEFAULT_COLORS,
  barColor = '#111827',
  targetColor = '#111827',
  width = 120,
  height = 16,
} = {}) {
  return ({ value }) => {
    let v, t, rgs;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      v   = Number(value.value);
      t   = value.target != null ? Number(value.target) : target;
      rgs = value.ranges || ranges;
    } else {
      v   = Number(value);
      t   = target;
      rgs = ranges;
    }
    if (!Number.isFinite(v)) return '';

    const range = max - min || 1;
    const clamp = (n) => Math.max(min, Math.min(max, n));
    const at = (n) => ((clamp(n) - min) / range) * width;

    // Default thresholds at 60% / 80% — the canonical bullet chart bands.
    const stops = rgs && rgs.length ? rgs.map(Number) : [min + range * 0.6, min + range * 0.8];
    const fullStops = [min, ...stops, max];

    let inner = '';
    for (let i = 0; i < fullStops.length - 1; i++) {
      const x = at(fullStops[i]);
      const w = at(fullStops[i + 1]) - x;
      const fill = rangeColors[i] || rangeColors[rangeColors.length - 1];
      inner += `<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${height}" fill="${fill}"/>`;
    }
    // Value bar — middle half of the row height, leaving the bands as a
    // backdrop top and bottom (Few's signature aesthetic).
    const barH = height * 0.42;
    const barY = (height - barH) / 2;
    inner += `<rect x="0" y="${barY.toFixed(2)}" width="${at(v).toFixed(2)}" height="${barH.toFixed(2)}" fill="${barColor}"/>`;
    if (t != null && Number.isFinite(t)) {
      const tx = at(t);
      const tickH = height * 0.85;
      const tickY = (height - tickH) / 2;
      inner += `<rect x="${(tx - 1).toFixed(2)}" y="${tickY.toFixed(2)}" width="2" height="${tickH.toFixed(2)}" fill="${targetColor}"/>`;
    }
    return `<svg class="sg-renderer-bullet" viewBox="0 0 ${width} ${height}"`
         + ` width="${width}" height="${height}" preserveAspectRatio="none" aria-hidden="true">`
         + inner
         + `</svg>`;
  };
}

/* ---------- donut (single-percentage circular chart) ---------------
 *
 * Sibling of `progress-bar` for circular display. A thin ring with the
 * filled portion in an accent colour, painted via stroke-dasharray
 * starting at 12 o'clock and going clockwise. Optional centred or
 * adjacent label shows the percentage as text.
 *
 *   registerRenderer('completion', donut({ color: 'green', showValue: true }))
 *
 * Pass `inline: true` for a label-beside-donut layout (better when the
 * cell is wide and you want the number prominent); the default keeps
 * the label tucked inside the ring for compact cells. */
export function donut({
  size = 28,
  thickness = 5,
  color = 'green',
  background = '#e5e7eb',
  showValue = true,
  inline = false,
} = {}) {
  const stroke = SPARK_COLORS[color] || color;
  return ({ value }) => {
    let n = Number(value);
    if (!Number.isFinite(n)) return '';
    n = Math.max(0, Math.min(100, n));
    const r = (size - thickness) / 2;
    const cx = size / 2, cy = size / 2;
    const circumference = 2 * Math.PI * r;
    const offset = circumference * (1 - n / 100);

    const labelInside =
      `<text x="${cx}" y="${cy + 0.5}" text-anchor="middle" dominant-baseline="middle"`
      + ` font-size="${(size * 0.32).toFixed(1)}" font-weight="600" fill="currentColor">${Math.round(n)}</text>`;
    const svg =
      `<svg class="sg-renderer-donut" viewBox="0 0 ${size} ${size}"`
      + ` width="${size}" height="${size}" aria-hidden="true">`
      + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${background}" stroke-width="${thickness}"/>`
      + `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${stroke}" stroke-width="${thickness}"`
      + ` stroke-dasharray="${circumference.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"`
      + ` stroke-linecap="round" transform="rotate(-90 ${cx} ${cy})"/>`
      + (showValue && !inline ? labelInside : '')
      + `</svg>`;
    if (inline && showValue) {
      return `<span class="sg-renderer-donut-wrap">${svg}`
           + `<span class="sg-renderer-donut-label">${Math.round(n)}%</span>`
           + `</span>`;
    }
    return svg;
  };
}

/* ---------- histogram (distribution bars) ---------------------------
 *
 * Sibling of `sparkline({ type: 'bar' })` for *distribution* columns
 * — the bars are framed as bin counts rather than a time series, so
 * each bar carries a `<title>` tooltip ("Bin 3: 12") that surfaces on
 * hover. Pass `highlightMax: true` to fade non-maximum bars so the
 * mode stands out at a glance, and `binLabels` for axis ticks below
 * each bar.
 *
 *   registerRenderer('latency', histogram({
 *     binLabels: ['<50', '50-100', '100-200', '200-500', '500+'],
 *     color: 'orange', highlightMax: true,
 *   }))
 *
 * Accepts the same array-of-numbers cell value shape as sparkline.
 * Pass `{ counts, labels }` as the cell value for per-row labels. */
export function histogram({
  width = 120,
  height = 32,
  color = 'blue',
  highlightMax = false,
  gap = 1,
  binLabels = null,
  showCount = false,
} = {}) {
  const fill = SPARK_COLORS[color] || color;
  return ({ value, td }) => {
    if (value == null || value === '') return '';
    if (td) td.classList.add('sg-renderer-histogram-cell');
    let data = value, labels = binLabels;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      data = value.counts;
      labels = value.labels || binLabels;
    }
    if (!Array.isArray(data)) return '';
    const numbers = data.map(Number).filter(Number.isFinite);
    if (numbers.length === 0) return '';
    const max = Math.max(...numbers, 1);
    const total = numbers.reduce((a, b) => a + b, 0);

    const labelH = labels && labels.length ? 10 : 0;
    const padX = 1, padY = 1;
    const w = width - padX * 2;
    const ph = height - padY * 2 - labelH;
    const barW = Math.max(1, (w - (numbers.length - 1) * gap) / numbers.length);

    let bars = '';
    for (let i = 0; i < numbers.length; i++) {
      const v = numbers[i];
      const bh = (v / max) * ph;
      const x = padX + i * (barW + gap);
      const y = padY + ph - bh;
      const opacity = highlightMax ? (v === max ? 1 : 0.45) : 0.85;
      const titleText = labels && labels[i] != null ? `${labels[i]}: ${v}` : `Bin ${i + 1}: ${v}`;
      bars += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${barW.toFixed(2)}" height="${bh.toFixed(2)}"`
            + ` fill="${fill}" fill-opacity="${opacity}"><title>${mdEscapeHTML(titleText)}</title></rect>`;
    }
    let ticks = '';
    if (labels && labels.length) {
      for (let i = 0; i < numbers.length && i < labels.length; i++) {
        const x = padX + i * (barW + gap) + barW / 2;
        ticks += `<text x="${x.toFixed(2)}" y="${(height - 1).toFixed(2)}" text-anchor="middle"`
              +  ` font-size="7" fill="currentColor" opacity="0.65">${mdEscapeHTML(labels[i])}</text>`;
      }
    }
    const svg = `<svg class="sg-renderer-histogram" viewBox="0 0 ${width} ${height}"`
              + ` width="${width}" height="${height}" preserveAspectRatio="none" aria-hidden="true">`
              + bars + ticks + `</svg>`;
    if (showCount) {
      return `<span class="sg-renderer-histogram-wrap">${svg}`
           + `<span class="sg-renderer-histogram-total">n=${total}</span></span>`;
    }
    return svg;
  };
}

/* ---------- rag (red / amber / green dot) ---------------------------
 *
 * Pure traffic-light status — a single coloured dot, no label. Different
 * from `statusPill` (which is a labelled pill in any of nine colours):
 * `rag` is the project-management / risk-dashboard primitive where the
 * column header IS the label and the cells just need a single
 * unambiguous colour signal.
 *
 *   registerRenderer('risk', rag())   // value: 'red' / 'amber' / 'green'
 *
 * Accepts:
 *   - the literal strings 'red' / 'amber' / 'green' (also 'r' / 'a' / 'g',
 *     'detractor' / 'passive' / 'promoter', 'critical' / 'warn' / 'ok',
 *     'high' / 'medium' / 'low')
 *   - a numeric value paired with `thresholds: [redMax, amberMax]`
 *     ( v ≤ redMax → red, v ≤ amberMax → amber, else → green )
 *
 * `inverted: true` flips the threshold mapping for "lower is better"
 * columns (e.g. error rates). `showLabel: true` adds a small text label
 * beside the dot. */
const RAG_TOKENS = {
  red:        'red',  r: 'red',  critical: 'red',  high: 'red',  detractor: 'red', danger: 'red',
  amber:      'amber', a: 'amber', warn:    'amber', medium: 'amber', passive: 'amber', yellow: 'amber',
  green:      'green', g: 'green', ok:       'green', low:    'green', promoter: 'green', safe: 'green',
};
const RAG_COLORS = { red: '#ef4444', amber: '#f59e0b', green: '#10b981' };

export function rag({
  size = 10,
  thresholds = null,
  inverted = false,
  showLabel = false,
} = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    let key;
    if (thresholds && Number.isFinite(Number(value))) {
      const n = Number(value);
      const lower = inverted ? thresholds[1] : thresholds[0];
      const upper = inverted ? thresholds[0] : thresholds[1];
      if (inverted) {
        key = n >= lower ? 'red' : n >= upper ? 'amber' : 'green';
      } else {
        key = n <= lower ? 'red' : n <= upper ? 'amber' : 'green';
      }
    } else {
      key = RAG_TOKENS[String(value).toLowerCase()] || null;
      if (!key) return '';
    }
    const wrap = h('span', {
      class: `sg-renderer-rag is-${key}`,
      title: showLabel ? null : (key.charAt(0).toUpperCase() + key.slice(1)),
    });
    wrap.append(h('span', {
      class: 'sg-renderer-rag-dot',
      style: `width:${size}px; height:${size}px; background:${RAG_COLORS[key]};`,
      'aria-label': key,
    }));
    if (showLabel) {
      wrap.append(h('span', { class: 'sg-renderer-rag-label' },
        document.createTextNode(key.charAt(0).toUpperCase() + key.slice(1))));
    }
    return wrap;
  };
}

/* ---------- timelineSteps (ordered status progression) --------------
 *
 * Order-status / progress columns where the value is one of an ordered
 * set of steps: "Pending → Picked → Shipped → Delivered". Past steps
 * fill solid; the current step gets a halo ring; future steps stay
 * hollow / muted. Connecting lines between steps go solid behind past
 * steps and muted between future ones.
 *
 *   registerRenderer('shipment', timelineSteps({
 *     steps: ['Pending', 'Picked', 'Shipped', 'Delivered'],
 *     showLabels: true,
 *   }))
 *
 * Value can be the step *name* (case-insensitive) or the 0-based index. */
export function timelineSteps({
  steps = ['Pending', 'Shipped', 'Delivered'],
  color = '#2563eb',
  showLabels = false,
} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-timeline-cell');
    let curIdx = -1;
    if (Number.isFinite(Number(value))) {
      curIdx = Math.max(0, Math.min(steps.length - 1, Math.floor(Number(value))));
    } else {
      const v = String(value).toLowerCase();
      curIdx = steps.findIndex((s) => String(s).toLowerCase() === v);
    }
    if (curIdx < 0) return '';

    const wrap = h('div', {
      class: `sg-renderer-timeline${showLabels ? ' has-labels' : ''}`,
      style: `--ts-color: ${color};`,
      role: 'list',
      'aria-label': `Step ${curIdx + 1} of ${steps.length}: ${steps[curIdx]}`,
    });
    for (let i = 0; i < steps.length; i++) {
      const state = i < curIdx ? 'past' : i === curIdx ? 'current' : 'future';
      const step = h('span', { class: `sg-timeline-step is-${state}`, role: 'listitem' });
      step.append(h('span', { class: 'sg-timeline-dot', title: steps[i], 'aria-label': steps[i] }));
      if (showLabels) {
        step.append(h('span', { class: 'sg-timeline-label' }, document.createTextNode(steps[i])));
      }
      wrap.append(step);
      if (i < steps.length - 1) {
        const lineState = i < curIdx ? 'past' : 'future';
        wrap.append(h('span', { class: `sg-timeline-line is-${lineState}`, 'aria-hidden': 'true' }));
      }
    }
    return wrap;
  };
}

/* ---------- mention (@user / #tag chips) ----------------------------
 *
 * Parses `@username` and `#tag` markers inside free text into styled
 * inline chips — chat / activity-feed / notification columns. Optional
 * `mentionHref(name)` / `tagHref(tag)` callbacks turn the chips into
 * <a> elements opening in a new tab.
 *
 *   registerRenderer('comment', mention({
 *     mentionHref: (name) => `/users/${name}`,
 *     tagHref:     (tag)  => `/labels/${tag}`,
 *   }))
 *
 * Markers: `@[a-zA-Z0-9_-]+` and `#[a-zA-Z0-9_-]+`. Anything else
 * passes through as plain text. */
const MENTION_RE = /([@#][a-zA-Z0-9_\-]+)/g;

export function mention({
  mentionHref = null,
  tagHref = null,
} = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const text = String(value);
    const wrap = h('span', { class: 'sg-renderer-mentions' });
    const parts = text.split(MENTION_RE);
    for (const part of parts) {
      if (!part) continue;
      if (part[0] === '@') {
        const name = part.slice(1);
        const url = typeof mentionHref === 'function' ? mentionHref(name) : null;
        wrap.append(buildMentionChip(part, url, 'sg-renderer-mention'));
      } else if (part[0] === '#') {
        const tag = part.slice(1);
        const url = typeof tagHref === 'function' ? tagHref(tag) : null;
        wrap.append(buildMentionChip(part, url, 'sg-renderer-hashtag'));
      } else {
        wrap.append(document.createTextNode(part));
      }
    }
    return wrap;
  };
}

function buildMentionChip(text, url, cls) {
  const node = url
    ? h('a', { href: url, target: '_blank', rel: 'noopener noreferrer', class: cls })
    : h('span', { class: cls });
  if (url) node.addEventListener('click', (e) => e.stopPropagation());
  node.append(document.createTextNode(text));
  return node;
}

/* ---------- expand (click-to-expand long text) ----------------------
 *
 * Different from `truncate` (single-line ellipsis at cell width with
 * the full value in the title attribute) and `multi-line` (preserves
 * newlines, optional line-clamp): `expand` adds an in-cell "Read more"
 * / "Show less" toggle that opens the full value right there, no
 * hover, no tooltip, no popover.
 *
 *   registerRenderer('descr', expand({ lines: 2 }))
 *   registerRenderer('story', expand({ chars: 180 }))
 *
 * Pass either `lines: N` (CSS line-clamp at N lines) or `chars: N`
 * (clip at character count, hides the remainder behind the toggle).
 * Strings short enough to fit render as plain text with no toggle. */
export function expand({
  chars = null,
  lines = null,
  moreLabel = 'Read more',
  lessLabel = 'Show less',
} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    const text = String(value);
    const useChars = chars && text.length > chars;
    const useLines = !useChars && lines && /\n/.test(text);
    // Plain pass-through when nothing's clipped.
    if (!useChars && !lines) return text;
    if (td) {
      td.classList.add('sg-renderer-expand-cell');
      const tr = td.parentElement;
      if (tr && tr.tagName === 'TR') tr.classList.add('sg-has-multiline');
    }
    const wrap = h('div', { class: 'sg-renderer-expand' });
    let expanded = false;
    if (useChars) {
      const shortText = text.slice(0, chars).trimEnd() + '…';
      const shortEl = h('span', { class: 'sg-renderer-expand-short' },
        document.createTextNode(shortText));
      const fullEl = h('span', { class: 'sg-renderer-expand-full', hidden: '' },
        document.createTextNode(text));
      const toggle = h('button', { type: 'button', class: 'sg-renderer-expand-toggle' },
        document.createTextNode(moreLabel));
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        expanded = !expanded;
        shortEl.hidden = expanded;
        fullEl.hidden = !expanded;
        toggle.textContent = expanded ? lessLabel : moreLabel;
      });
      wrap.append(shortEl, fullEl, document.createTextNode(' '), toggle);
    } else {
      // Lines variant — line-clamp until expanded.
      const inner = h('div', { class: 'sg-renderer-expand-clamp' });
      inner.style.setProperty('--sg-clamp', String(lines));
      inner.textContent = text;
      const toggle = h('button', { type: 'button', class: 'sg-renderer-expand-toggle' },
        document.createTextNode(moreLabel));
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        expanded = !expanded;
        inner.classList.toggle('is-expanded', expanded);
        toggle.textContent = expanded ? lessLabel : moreLabel;
      });
      wrap.append(inner, toggle);
    }
    return wrap;
  };
}

/* ---------- units (Intl.NumberFormat unit-style) --------------------
 *
 * Distance, temperature, weight, volume, file-system… — anything that
 * `Intl.NumberFormat({ style: 'unit', unit: '…' })` supports. Locale-
 * aware: en-US shows "12 km", de-DE shows "12 km" (same here), fr-CA
 * shows "12 km", ja-JP shows "12 キロメートル" with `unitDisplay: 'long'`.
 *
 *   registerRenderer('distance', units({ unit: 'kilometer' }))
 *   registerRenderer('weight',   units({ unit: 'kilogram', decimals: 1 }))
 *   registerRenderer('hot',      units({ unit: 'celsius',  decimals: 1 }))
 *
 * Supported units include: kilometer / mile / meter / centimeter,
 * celsius / fahrenheit, kilogram / pound / gram, liter / gallon,
 * second / minute / hour, gigabyte / megabyte / byte, etc. — full
 * list: https://github.com/unicode-org/cldr/blob/main/common/validity/unit.xml */
export function units({
  unit = 'kilometer',
  unitDisplay = 'short',
  decimals,
  locale = undefined,
  ...opts
} = {}) {
  const fmtOpts = { style: 'unit', unit, unitDisplay, ...opts };
  if (decimals != null) {
    fmtOpts.minimumFractionDigits = decimals;
    fmtOpts.maximumFractionDigits = decimals;
  }
  let fmt;
  try {
    fmt = new Intl.NumberFormat(locale, fmtOpts);
  } catch (_) {
    // Older / restricted runtimes might not know a given CLDR unit.
    // Fall back to formatting the number alone + appending the raw unit
    // identifier so the cell still communicates a useful value.
    const fallbackOpts = decimals != null
      ? { minimumFractionDigits: decimals, maximumFractionDigits: decimals }
      : {};
    fmt = new Intl.NumberFormat(locale, fallbackOpts);
  }
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    return fmt.format(n);
  };
}

/* ---------- ipAddress (IPv4 / IPv6) ---------------------------------
 *
 * Monospace IP address with light validation. Invalid IPs render in
 * red. Optional `countryField` reads a 2-letter ISO code from the same
 * row and prepends the country emoji flag (sibling to `country-flag`).
 *
 *   registerRenderer('client_ip', ipAddress({ countryField: 'country' }))
 *
 * Validation is the standard regex pair — strict enough to reject
 * "1.2.3.4.5" and "a.b.c.d", lax enough not to choke on common IPv6
 * shorthand like `::1` and `2001:db8::1`. */
const IPV4_RE = /^((25[0-5]|2[0-4]\d|[01]?\d?\d)\.){3}(25[0-5]|2[0-4]\d|[01]?\d?\d)$/;
// IPv6 regex courtesy of OWASP's recommended pattern (simplified to
// reject mixed v4-tail forms — the column is for ops dashboards, not
// transport-layer correctness, so the simpler test reads cleaner).
const IPV6_RE = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|:(:[0-9a-fA-F]{1,4}){1,7}|::)$/;

function isValidIPv4(s) { return IPV4_RE.test(s); }
function isValidIPv6(s) { return IPV6_RE.test(s); }

export function ipAddress({
  countryField = null,
} = {}) {
  return ({ value, row }) => {
    if (isBlank(value)) return '';
    const text = String(value).trim();
    const isV4 = isValidIPv4(text);
    const isV6 = !isV4 && isValidIPv6(text);
    if (!isV4 && !isV6) {
      return h('span', {
        class: 'sg-renderer-ip is-invalid',
        title: 'Invalid IP address',
      }, document.createTextNode(text));
    }
    const wrap = h('span', {
      class: `sg-renderer-ip ${isV6 ? 'is-v6' : 'is-v4'}`,
      title: isV4 ? 'IPv4' : 'IPv6',
    });
    if (countryField && row?.[countryField]) {
      const code = String(row[countryField]).trim().toUpperCase();
      if (/^[A-Z]{2}$/.test(code)) {
        const flag = String.fromCodePoint(
          0x1F1E6 + code.charCodeAt(0) - 65,
          0x1F1E6 + code.charCodeAt(1) - 65,
        );
        wrap.append(h('span', {
          class: 'sg-renderer-ip-flag', 'aria-hidden': 'true',
        }, document.createTextNode(flag)));
      }
    }
    wrap.append(h('span', { class: 'sg-renderer-ip-text' },
      document.createTextNode(text)));
    return wrap;
  };
}

/* ---------- AU identifier siblings: bsb / acn / tfn / medicare ------
 *
 * Companions to the existing `abn` and `address-au` renderers. Each
 * follows the same shape: validate → format → optional lookup link.
 * Invalid values render in red so a bad import surfaces immediately.
 *
 *   registerRenderer('bsb',      bsb())
 *   registerRenderer('acn',      acn())
 *   registerRenderer('tfn',      tfn())
 *   registerRenderer('medicare', medicare()) */

// BSB — Bank-State-Branch. 6 digits formatted XXX-XXX; the first 2 digits
// identify the bank. The lookup map only covers the most common AU banks
// — pass your own `banks` to extend, or `showBank: false` to suppress
// the bank-name annotation entirely.
const BSB_BANKS = {
  '01': 'ANZ',         '03': 'Westpac',     '06': 'CBA',         '08': 'NAB',
  '11': 'St.George',   '12': 'BankSA',      '18': 'Macquarie',   '76': 'BoQ',
  '80': 'Cuscal',      '93': 'RBA',         '94': 'Bendigo',     '96': 'Citibank',
  '53': 'PayPal AU',   '63': 'Bendigo',     '73': 'AMP',         '92': 'Beyond Bank',
  '07': 'Westpac',     '09': 'NAB',
};

export function bsb({
  banks = BSB_BANKS,
  showBank = true,
} = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const text = String(value).trim();
    const digits = text.replace(/\D/g, '');
    if (digits.length !== 6) {
      return h('span', {
        class: 'sg-renderer-invalid', title: 'Invalid BSB — must be 6 digits',
      }, document.createTextNode(text));
    }
    const formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    const code = digits.slice(0, 2);
    const bank = banks[code];
    const wrap = h('span', { class: 'sg-renderer-bsb' });
    wrap.append(h('span', { class: 'sg-renderer-bsb-number sg-renderer-mono' },
      document.createTextNode(formatted)));
    if (showBank && bank) {
      wrap.append(h('span', { class: 'sg-renderer-bsb-bank' },
        document.createTextNode(bank)));
    }
    return wrap;
  };
}

// ACN — Australian Company Number. 9 digits with a mod-10 checksum:
// positions 1-8 multiplied by weights [8,7,6,5,4,3,2,1], summed, then
// (10 - sum%10) % 10 = position 9. Formatted XXX XXX XXX. Valid values
// link to the ASIC search on the ABR site.
function validateACN(input) {
  const digits = String(input).replace(/\s+/g, '');
  if (digits.length !== 9 || !/^\d{9}$/.test(digits)) return false;
  const weights = [8, 7, 6, 5, 4, 3, 2, 1];
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += parseInt(digits[i], 10) * weights[i];
  return parseInt(digits[8], 10) === (10 - sum % 10) % 10;
}
function formatACN(input) {
  const digits = String(input).replace(/\D/g, '');
  if (digits.length !== 9) return String(input);
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function acn() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    if (!validateACN(value)) {
      return h('span', {
        class: 'sg-renderer-invalid', title: 'Invalid ACN (checksum failed)',
      }, document.createTextNode(String(value)));
    }
    const digits = String(value).replace(/\s+/g, '');
    return h('a', {
      class: 'sg-renderer-link sg-renderer-mono',
      href: `https://abr.business.gov.au/Search/ResultsActiveASIC?SearchText=${digits}`,
      target: '_blank',
      rel: 'noopener noreferrer',
      title: 'Look up on ABR',
    }, document.createTextNode(formatACN(value)));
  };
}

// TFN — Tax File Number. Legally never displayed in full (Privacy Act +
// ATO guidance) — this renderer ALWAYS masks all but the last 3 digits.
// 9-digit (current) and 8-digit (historical) formats both supported.
// Anything outside that range renders red.
export function tfn() {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-mask-numeric');
    if (isBlank(value)) return '';
    const text = String(value);
    const digits = text.replace(/\D/g, '');
    if (digits.length < 8 || digits.length > 9) {
      return h('span', {
        class: 'sg-renderer-invalid', title: 'Invalid TFN — must be 8 or 9 digits',
      }, document.createTextNode(text));
    }
    const last3 = digits.slice(-3);
    const maskedLen = digits.length - 3;
    const masked = '•'.repeat(maskedLen);
    const formatted = digits.length === 9
      ? `${masked.slice(0, 3)} ${masked.slice(3)} ${last3}`
      : `${masked.slice(0, 2)} ${masked.slice(2)} ${last3}`;
    return formatted;
  };
}

// Medicare card number — 10 digits with a mod-10 checksum (positions 1-8
// × weights [1,3,7,9,1,3,7,9], sum mod 10 = position 9). Optional
// trailing IRN (Individual Reference Number) digit separated by `/` or
// `-`. Formatted XXXX XXXXX X [/ N].
function validateMedicare(digits) {
  if (digits.length !== 10) return false;
  if (!/^[2-6]\d{9}$/.test(digits)) return false;
  const weights = [1, 3, 7, 9, 1, 3, 7, 9];
  let sum = 0;
  for (let i = 0; i < 8; i++) sum += parseInt(digits[i], 10) * weights[i];
  return (sum % 10) === parseInt(digits[8], 10);
}

export function medicare() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const raw = String(value).trim().replace(/\s+/g, '');
    const m = /^(\d{10})(?:[\/-]?(\d))?$/.exec(raw);
    if (!m || !validateMedicare(m[1])) {
      return h('span', {
        class: 'sg-renderer-invalid',
        title: m ? 'Invalid Medicare (checksum failed)' : 'Invalid Medicare format',
      }, document.createTextNode(String(value)));
    }
    const card = m[1], irn = m[2];
    const formatted = `${card.slice(0, 4)} ${card.slice(4, 9)} ${card.slice(9)}`
      + (irn ? ` / ${irn}` : '');
    return h('span', { class: 'sg-renderer-medicare sg-renderer-mono' },
      document.createTextNode(formatted));
  };
}

/* ---------- audio / video (inline native players) -------------------
 *
 * Simpler sibling to `audio-attachment` (popover w/ scrub bar + Howler
 * integration): just drop the value's URL into a native `<audio>` /
 * `<video>` element with controls. The browser handles playback, fmt
 * detection, codec fallback, accessibility hooks, etc. — no JS state.
 *
 *   <th data-header-cell-cell-renderer-value="audio">Voicemail</th>
 *
 * `preload` defaults to 'none' (audio) / 'metadata' (video) so a grid
 * of 100 media URLs doesn't fire 100 range requests on render. */
export function audio({ preload = 'none' } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    return h('audio', {
      class: 'sg-renderer-audio',
      controls: '',
      preload,
      src: String(value).trim(),
    });
  };
}

export function video({ width = 200, preload = 'metadata' } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    return h('video', {
      class: 'sg-renderer-video',
      controls: '',
      preload,
      src: String(value).trim(),
      width: String(width),
    });
  };
}

/* ---------- reactions (emoji + count strip) -------------------------
 *
 * Slack / Notion / Linear-style reactions row. Value can be an object
 * `{ '👍': 3, '❤️': 1 }` or an array of `{ emoji, count }` or
 * `[emoji, count]` tuples. Zero / negative counts are dropped. By
 * default sorted by count desc — pass `sort: 'order'` to keep the
 * input order. */
export function reactions({ sort = 'count' } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    let entries = [];
    if (Array.isArray(value)) {
      entries = value.map((e) => Array.isArray(e) ? e
        : [e.emoji ?? e.name ?? '?', e.count ?? e.n ?? 0]);
    } else if (typeof value === 'object') {
      entries = Object.entries(value);
    } else { return ''; }
    entries = entries.filter(([, n]) => Number.isFinite(Number(n)) && Number(n) > 0);
    if (sort === 'count') entries.sort((a, b) => Number(b[1]) - Number(a[1]));
    if (entries.length === 0) return '';
    const wrap = h('span', { class: 'sg-renderer-reactions' });
    for (const [emoji, count] of entries) {
      const chip = h('span', { class: 'sg-reaction', title: `${count} ${emoji}` });
      chip.append(h('span', { class: 'sg-reaction-emoji' }, document.createTextNode(String(emoji))));
      chip.append(h('span', { class: 'sg-reaction-count' }, document.createTextNode(String(count))));
      wrap.append(chip);
    }
    return wrap;
  };
}

/* ---------- commentCount (value + 💬 N badge) -----------------------
 *
 * Title / description columns paired with a discussion-thread length.
 * Cell value can be:
 *   - a plain number → renders just "💬 N"
 *   - an object `{ value, count }` → renders the value + adjacent badge
 *
 * `icon` defaults to 💬; pass any emoji / SVG string for theming. */
export function commentCount({ icon = '💬' } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    let text = '', count = null;
    if (typeof value === 'object') {
      text = value.value ?? value.text ?? '';
      count = value.count ?? value.comments ?? null;
    } else if (Number.isFinite(Number(value)) && typeof value !== 'string') {
      count = Number(value);
    } else {
      text = String(value);
    }
    const wrap = h('span', { class: 'sg-renderer-comment-count' });
    if (text) {
      wrap.append(h('span', { class: 'sg-cc-value' }, document.createTextNode(String(text))));
    }
    if (count != null && Number(count) > 0) {
      const badge = h('span', {
        class: 'sg-cc-badge',
        title: `${count} comment${Number(count) === 1 ? '' : 's'}`,
      });
      // `icon` accepts an emoji / single character as text OR a raw
      // SVG string (anything starting with "<svg"). The SVG path goes
      // through innerHTML so its namespace + attributes are honoured.
      const iconEl = h('span', { class: 'sg-cc-icon', 'aria-hidden': 'true' });
      if (typeof icon === 'string' && icon.trimStart().startsWith('<svg')) {
        iconEl.innerHTML = icon;
      } else {
        iconEl.append(document.createTextNode(String(icon)));
      }
      badge.append(iconEl);
      badge.append(h('span', { class: 'sg-cc-num' }, document.createTextNode(String(count))));
      wrap.append(badge);
    }
    return wrap;
  };
}

/* ---------- ordinal (1st / 2nd / 3rd) -------------------------------
 *
 * `Intl.PluralRules({ type: 'ordinal' })` + an English suffix table.
 * Defaults to the browser locale; pass `locale: 'en-US'` (or any
 * en-* tag) to lock in English suffixes. Non-English locales fall
 * back to the bare number (ordinal indicators vary widely — `1°`,
 * `1ª`, `1er`, `1ère`, … — so we don't try to encode them generically). */
export function ordinal({ locale = undefined } = {}) {
  // Resolve once at registration time so subsequent rows are cheap.
  const resolved = new Intl.Locale(locale || Intl.NumberFormat().resolvedOptions().locale);
  const isEnglish = resolved.language === 'en';
  const pr = isEnglish ? new Intl.PluralRules(locale, { type: 'ordinal' }) : null;
  const SUFFIX = { one: 'st', two: 'nd', few: 'rd', other: 'th' };
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    const n = Number(value);
    if (!Number.isInteger(n)) return String(value);
    if (!isEnglish) return String(n);
    return `${n}${SUFFIX[pr.select(n)]}`;
  };
}

/* ---------- plural (count + plural-sensitive label) -----------------
 *
 * Count + noun via `Intl.PluralRules`. The default cardinal mapping
 * is English-style binary (one / other) — pass `zero` for an explicit
 * zero label ("0 items" reads fine but "no items" sometimes reads
 * better), and use locale-specific pluralisation via the `locale`
 * option for languages with richer plural rules (Russian, Arabic, …). */
export function plural({
  one = 'item',
  other = 'items',
  zero = null,
  locale = undefined,
} = {}) {
  const pr = new Intl.PluralRules(locale);
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    if (n === 0 && zero) return `${n} ${zero}`;
    return pr.select(n) === 'one' ? `${n} ${one}` : `${n} ${other}`;
  };
}

/* ---------- empty (explicit blank placeholder) ----------------------
 *
 * The grid normally renders blank cells as empty TDs. This wraps non-
 * empty values verbatim AND turns null / '' / 'N/A' / 'NULL' into a
 * styleable placeholder span — useful when a column needs to advertise
 * "this is intentionally blank" vs "there's no data yet". */
const EMPTY_TOKENS = new Set(['', 'null', 'nil', 'none', 'n/a', 'na', '-', '—']);

export function empty({
  placeholder = '—',
  emptyOnTokens = true,
} = {}) {
  return ({ value }) => {
    const isEmpty = value == null
      || (typeof value === 'string'
          && (value === '' || (emptyOnTokens && EMPTY_TOKENS.has(value.trim().toLowerCase()))));
    if (isEmpty) {
      return h('span', { class: 'sg-renderer-empty', title: 'Empty' },
        document.createTextNode(placeholder));
    }
    return String(value);
  };
}

/* ---------- creditCard (Luhn + brand + masked display) --------------
 *
 * Display credit-card numbers with brand detection (Visa / MC / Amex /
 * Discover / JCB / Diners) and Luhn validation. Defaults to MASKED
 * display (last 4 visible) — pass `mask: false` only when the cell is
 * genuinely supposed to be reading the full PAN, which is almost
 * never in a UI.
 *
 * Brand is determined by the IIN prefix and length. Invalid numbers
 * (failed Luhn, wrong length) render with a red strike-through. */
function luhnCheck(digits) {
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

function detectCardBrand(d) {
  if (/^4\d{12}(\d{3,6})?$/.test(d)) return 'visa';                  // 13/16/19
  if (/^(5[1-5]\d{14}|2(2[2-9]|[3-6]\d|7[01]|720)\d{12})$/.test(d)) return 'mastercard';
  if (/^3[47]\d{13}$/.test(d)) return 'amex';
  if (/^(6011\d{12,15}|65\d{14,17}|64[4-9]\d{13}|622(12[6-9]|1[3-9]\d|[2-8]\d{2}|9([01]\d|2[0-5]))\d{10,13})$/.test(d)) return 'discover';
  if (/^35(2[89]|[3-8]\d)\d{12}$/.test(d)) return 'jcb';
  if (/^3(0[0-5]|[68]\d|9\d)\d{11}$/.test(d)) return 'diners';
  return null;
}

export function creditCard({ mask = true } = {}) {
  return ({ value, td }) => {
    // Numeric-identifier columns read better right-aligned with the rest of
    // the financial columns. The same .sg-renderer-number hook the currency
    // / number renderers use does the work — right-align + tabular nums.
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    const digits = String(value).replace(/\D/g, '');
    const lenOk = digits.length >= 13 && digits.length <= 19;
    const valid = lenOk && luhnCheck(digits);
    const brand = lenOk ? detectCardBrand(digits) : null;
    const wrap = h('span', { class: `sg-renderer-card${valid ? '' : ' is-invalid'}` });
    if (brand) {
      wrap.append(h('span', {
        class: `sg-renderer-card-brand is-${brand}`,
        title: brand[0].toUpperCase() + brand.slice(1),
      }, document.createTextNode(brand === 'mastercard' ? 'MC' : brand.toUpperCase())));
    }
    let display;
    if (!lenOk) {
      display = String(value);
    } else {
      const shown = mask ? '•'.repeat(digits.length - 4) + digits.slice(-4) : digits;
      // Amex / Diners group 4-6-5; everything else 4-4-4-4 (or 4-4-4-4-4 for 19-digit).
      if (brand === 'amex' || brand === 'diners') {
        display = `${shown.slice(0, 4)} ${shown.slice(4, 10)} ${shown.slice(10)}`;
      } else {
        display = shown.match(/.{1,4}/g).join(' ');
      }
    }
    wrap.append(h('span', { class: 'sg-renderer-card-num sg-renderer-mono' },
      document.createTextNode(display)));
    return wrap;
  };
}

/* ---------- loadingShimmer (async placeholder) ----------------------
 *
 * Animated shimmer placeholder for cells whose value hasn't loaded
 * yet. Treats null / undefined / '' / 'loading' as the "still
 * fetching" sentinel; anything else renders verbatim. Pair it with
 * server-side row models or async data hydration. */
export function loadingShimmer({
  width = '70%',
  height = '12px',
} = {}) {
  return ({ value }) => {
    if (value != null && value !== '' && value !== 'loading' && value !== '…') {
      return String(value);
    }
    return h('span', {
      class: 'sg-renderer-shimmer',
      style: `width: ${width}; height: ${height};`,
      'aria-label': 'Loading',
    });
  };
}

/* ---------- select / dropdown (single-choice popover editor) ---------
 *
 * Fixed-list inline editor: cell shows the current value (with optional
 * colour-tinted pill from a colorMap); double-click opens a popover with
 * the option list, single click on an option commits and closes.
 *
 *   registerRenderer('priority', renderers.select({
 *     options: ['Low', 'Medium', 'High', 'Critical'],
 *     colorMap: { Low: 'gray', Medium: 'blue', High: 'orange', Critical: 'red' },
 *   }));
 *
 * `options` may be an array of strings, or `{ value, label, color }`
 * objects. The cell value is stored as the option's `value` (or the
 * string itself if a bare array). `clearable: true` adds a "(none)"
 * row at the top. */
function normaliseSelectOptions(options) {
  if (!Array.isArray(options)) return [];
  return options.map((o) => {
    if (o == null) return null;
    if (typeof o === 'object') return { value: o.value, label: o.label ?? String(o.value), color: o.color || null, icon: o.icon || null };
    return { value: o, label: String(o), color: null, icon: null };
  }).filter(Boolean);
}

function buildSelectPill(opt, palette) {
  const pill = h('span', { class: 'sg-renderer-select-pill' });
  if (opt.color) {
    if (palette.test(opt.color)) pill.classList.add(`sg-pill-${opt.color}`);
    else { pill.style.background = opt.color; pill.style.color = readableForeground(opt.color); }
  } else {
    pill.classList.add('sg-renderer-select-pill-bare');
  }
  if (opt.icon) {
    pill.append(h('span', { class: 'sg-renderer-select-pill-icon', 'aria-hidden': 'true' }, opt.icon));
  }
  pill.append(h('span', { class: 'sg-renderer-select-pill-label' },
    document.createTextNode(opt.label)));
  return pill;
}

const SG_PALETTE_RE = /^(gray|red|orange|yellow|green|blue|indigo|purple|pink)$/;

// Merge column-level renderer config (from server-side Rails column DSL
// or HTML data-attrs) on top of the registration-time defaults. Lets a
// single `registerRenderer('select', renderers.select())` call serve any
// number of columns that supply their own options via the column def.
function resolveSelectConfig(ctx, defaults) {
  const cfg = ctx?.col?.cellRendererConfig || null;
  // Rails columns of type :enum surface a JSON array under
  // `data-enum-values` even without an explicit renderer config — read
  // it via the standard col path if the renderer ever needs it. Here we
  // pick up either the explicit `options` list or fall back to enum_values.
  const enumValues = ctx?.col?.enumValues || null;
  return {
    options:     defaults.options.length ? defaults.options : (cfg?.options || enumValues || []),
    placeholder: cfg?.placeholder ?? defaults.placeholder,
    clearable:   cfg?.clearable   ?? defaults.clearable,
    colorMap:    cfg?.colorMap    ?? defaults.colorMap,
    editable:    cfg?.editable    ?? defaults.editable,
    separator:   cfg?.separator   ?? defaults.separator,
  };
}

export function select({
  options = [],
  placeholder = 'Select…',
  editable = true,
  clearable = false,
  colorMap = null,
} = {}) {
  const baseOpts = normaliseSelectOptions(options);
  if (colorMap && typeof colorMap === 'object') {
    for (const o of baseOpts) {
      if (!o.color && Object.prototype.hasOwnProperty.call(colorMap, o.value)) o.color = colorMap[o.value];
    }
  }
  return (ctx) => {
    const { value, td } = ctx;
    // Per-cell config resolution lets a single registered renderer power
    // many columns whose options come from the server's column DSL.
    const cfg = resolveSelectConfig(ctx, { options: baseOpts, placeholder, clearable, colorMap, editable });
    let opts = baseOpts;
    if (baseOpts.length === 0 && cfg.options.length) {
      opts = normaliseSelectOptions(cfg.options);
      if (cfg.colorMap && typeof cfg.colorMap === 'object') {
        for (const o of opts) {
          if (!o.color && Object.prototype.hasOwnProperty.call(cfg.colorMap, o.value)) o.color = cfg.colorMap[o.value];
        }
      }
    }
    if (td) {
      td.classList.add('sg-renderer-select-cell');
      td._sgSelectOpts = opts;
      td._sgSelectClearable = cfg.clearable;
    }

    if (cfg.editable && td && !td._sgSelectEditBound) {
      td._sgSelectEditBound = true;
      td.addEventListener('dblclick', (e) => {
        if (e._sgSelectHandled) return;
        e._sgSelectHandled = true;
        e.stopPropagation();
        openSelectEditor(td, ctx);
      });
    }

    const current = opts.find((o) => String(o.value) === String(value)) || null;
    if (!current) {
      if (isBlank(value)) {
        return h('span', { class: 'sg-renderer-select-placeholder' },
          document.createTextNode(cfg.placeholder));
      }
      // Value not in options — show raw text faintly so user knows it's out of list.
      const tag = h('span', { class: 'sg-renderer-select-bare' }, document.createTextNode(String(value)));
      return tag;
    }
    return buildSelectPill(current, SG_PALETTE_RE);
  };
}

// Return focus to the grid after a popover-editor closes so the grid's
// keyboard handler (arrow keys, Tab, Enter) keeps working without the
// user clicking the cell again. The grid's keyboard handler refuses to
// move when focus is inside an <input>, which our popovers are; the
// fix is just to focus the grid element on close.
function refocusGrid(anchor) {
  if (!anchor) return;
  const grid = anchor.closest('[data-controller~="grid"]');
  if (!grid) return;
  try { grid.focus({ preventScroll: true }); } catch { /* ignore */ }
}

let activeSelectEditor = null;

function openSelectEditor(anchor, ctx) {
  closeSelectEditor();
  const opts = anchor._sgSelectOpts || [];
  const clearable = anchor._sgSelectClearable;
  const { row, col } = ctx;
  const current = row && col?.field != null ? row[col.field] : null;

  const pop = h('div', { class: 'sg-renderer-select-popover', role: 'listbox' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  function commit(next) {
    const { api } = ctx;
    const oldValue = row && col?.field != null ? row[col.field] : null;
    if (row && col?.field != null) row[col.field] = next;
    if (api?.applyTransaction) api.applyTransaction({ update: [row] });
    const grid = anchor.closest('[data-controller~="grid"]');
    if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
      bubbles: true,
      detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
    }));
    closeSelectEditor();
  }

  if (clearable) {
    const noneRow = h('button', {
      type: 'button',
      class: 'sg-renderer-select-option sg-renderer-select-option-none',
      role: 'option',
    }, document.createTextNode('(none)'));
    noneRow.addEventListener('click', () => commit(null));
    pop.append(noneRow);
  }

  for (const opt of opts) {
    const row = h('button', {
      type: 'button',
      class: `sg-renderer-select-option${String(opt.value) === String(current) ? ' is-selected' : ''}`,
      role: 'option',
    });
    row.append(buildSelectPill(opt, SG_PALETTE_RE));
    row.addEventListener('click', () => commit(opt.value));
    pop.append(row);
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeSelectEditor(); }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeSelectEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  activeSelectEditor = { pop, onKey, onDocClick, anchor };
}

function closeSelectEditor() {
  if (!activeSelectEditor) return;
  const { pop, onKey, onDocClick, anchor } = activeSelectEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeSelectEditor = null;
  refocusGrid(anchor);
}

/* ---------- multiselect (multi-choice popover editor) ---------------
 *
 * Pickable sibling to `tags` / `colouredTags`. Display reuses the
 * coloured-tags chip; popover is the same as `select` but rows toggle
 * instead of commit-and-close. Confirm on outside-click / Escape /
 * Enter — multiple ticks per popover open.
 *
 *   registerRenderer('skills', renderers.multiselect({
 *     options: ['Ruby', 'Rails', 'JS', 'Stimulus', 'CSS', 'Postgres'],
 *     colorMap: { Ruby: 'red', Rails: 'red', JS: 'yellow', Postgres: 'blue' },
 *   }));
 *
 * Cell value is an array of option `value`s. Comma-separated strings
 * are also accepted on input (auto-coerced to array on the way in). */
function normaliseMultiselectValue(value) {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) return value.map(String);
  return String(value).split(',').map((s) => s.trim()).filter(Boolean);
}

export function multiselect({
  options = [],
  separator = ',',
  placeholder = 'Add tags…',
  editable = true,
  colorMap = null,
} = {}) {
  const baseOpts = normaliseSelectOptions(options);
  if (colorMap && typeof colorMap === 'object') {
    for (const o of baseOpts) {
      if (!o.color && Object.prototype.hasOwnProperty.call(colorMap, o.value)) o.color = colorMap[o.value];
    }
  }
  return (ctx) => {
    const { value, td } = ctx;
    const cfg = resolveSelectConfig(ctx, { options: baseOpts, placeholder, colorMap, editable, separator });
    let opts = baseOpts;
    if (baseOpts.length === 0 && cfg.options.length) {
      opts = normaliseSelectOptions(cfg.options);
      if (cfg.colorMap && typeof cfg.colorMap === 'object') {
        for (const o of opts) {
          if (!o.color && Object.prototype.hasOwnProperty.call(cfg.colorMap, o.value)) o.color = cfg.colorMap[o.value];
        }
      }
    }
    if (td) {
      td.classList.add('sg-renderer-multiselect-cell');
      td._sgMultiOpts = opts;
      td._sgMultiSep = cfg.separator;
    }

    if (cfg.editable && td && !td._sgMultiEditBound) {
      td._sgMultiEditBound = true;
      td.addEventListener('dblclick', (e) => {
        if (e._sgMultiHandled) return;
        e._sgMultiHandled = true;
        e.stopPropagation();
        openMultiselectEditor(td, ctx);
      });
    }

    const list = normaliseMultiselectValue(value);
    if (!list.length) {
      return h('span', { class: 'sg-renderer-multiselect-placeholder' },
        document.createTextNode(cfg.placeholder));
    }
    const wrap = h('div', { class: 'sg-renderer-multiselect' });
    for (const v of list) {
      const opt = opts.find((o) => String(o.value) === String(v)) || { value: v, label: v, color: null, icon: null };
      wrap.append(buildSelectPill(opt, SG_PALETTE_RE));
    }
    return wrap;
  };
}

let activeMultiselectEditor = null;

function openMultiselectEditor(anchor, ctx) {
  closeMultiselectEditor();
  const opts = anchor._sgMultiOpts || [];
  const sep = anchor._sgMultiSep || ',';
  const { row, col } = ctx;
  const initial = normaliseMultiselectValue(row && col?.field != null ? row[col.field] : null);
  const picked = new Set(initial);

  const pop = h('div', { class: 'sg-renderer-multiselect-popover', role: 'listbox', 'aria-multiselectable': 'true' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  function renderRow(opt) {
    const isOn = picked.has(String(opt.value));
    const rowEl = h('button', {
      type: 'button',
      class: `sg-renderer-multiselect-option${isOn ? ' is-selected' : ''}`,
      role: 'option',
      'aria-selected': isOn ? 'true' : 'false',
    });
    rowEl.append(h('span', { class: `sg-renderer-multiselect-check${isOn ? ' is-on' : ''}` },
      document.createTextNode(isOn ? '✓' : '')));
    rowEl.append(buildSelectPill(opt, SG_PALETTE_RE));
    rowEl.addEventListener('click', () => {
      if (picked.has(String(opt.value))) picked.delete(String(opt.value));
      else picked.add(String(opt.value));
      pop.replaceChildren();
      build();
    });
    return rowEl;
  }

  function build() {
    for (const opt of opts) pop.append(renderRow(opt));
  }
  build();

  function commit() {
    const { api } = ctx;
    const next = Array.from(picked);
    // Preserve original input shape: array stays array; CSV stays CSV.
    const original = row && col?.field != null ? row[col.field] : null;
    const out = Array.isArray(original) || original == null ? next : next.join(sep);
    const oldValue = original;
    if (row && col?.field != null) row[col.field] = out;
    if (api?.applyTransaction) api.applyTransaction({ update: [row] });
    const grid = anchor.closest('[data-controller~="grid"]');
    if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
      bubbles: true,
      detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: out },
    }));
    closeMultiselectEditor();
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeMultiselectEditor(); }
    if (e.key === 'Enter')  { e.stopPropagation(); e.preventDefault(); commit(); }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) commit();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  activeMultiselectEditor = { pop, onKey, onDocClick, anchor };
}

function closeMultiselectEditor() {
  if (!activeMultiselectEditor) return;
  const { pop, onKey, onDocClick, anchor } = activeMultiselectEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeMultiselectEditor = null;
  refocusGrid(anchor);
}

/* ---------- combobox (typeahead-filtered single-choice popover) -----
 *
 * Type-to-filter sibling of `select`. Same display (pill + placeholder)
 * but the popover has a search input at the top and the list filters as
 * you type. Highlighted row commits on Enter; arrow-keys move highlight.
 *
 *   registerRenderer('city', renderers.combobox({
 *     options: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', ...],
 *     allowCustom: false,
 *   }));
 *
 * `allowCustom: true` lets users commit a typed value that doesn't match
 * any option (a free-form combobox). Per-cell config honoured the same
 * way as select() — `data-header-cell-cell-renderer-config-value` JSON. */
export function combobox({
  options = [],
  placeholder = 'Search…',
  editable = true,
  allowCustom = false,
  colorMap = null,
} = {}) {
  const baseOpts = normaliseSelectOptions(options);
  if (colorMap && typeof colorMap === 'object') {
    for (const o of baseOpts) {
      if (!o.color && Object.prototype.hasOwnProperty.call(colorMap, o.value)) o.color = colorMap[o.value];
    }
  }
  return (ctx) => {
    const { value, td } = ctx;
    const cfg = resolveSelectConfig(ctx, { options: baseOpts, placeholder, colorMap, editable });
    const allow = ctx?.col?.cellRendererConfig?.allowCustom ?? allowCustom;
    let opts = baseOpts;
    if (baseOpts.length === 0 && cfg.options.length) {
      opts = normaliseSelectOptions(cfg.options);
      if (cfg.colorMap && typeof cfg.colorMap === 'object') {
        for (const o of opts) {
          if (!o.color && Object.prototype.hasOwnProperty.call(cfg.colorMap, o.value)) o.color = cfg.colorMap[o.value];
        }
      }
    }
    if (td) {
      td.classList.add('sg-renderer-combobox-cell');
      td._sgComboOpts = opts;
      td._sgComboAllowCustom = allow;
      td._sgComboPlaceholder = cfg.placeholder;
    }

    if (cfg.editable && td && !td._sgComboEditBound) {
      td._sgComboEditBound = true;
      td.addEventListener('dblclick', (e) => {
        if (e._sgComboHandled) return;
        e._sgComboHandled = true;
        e.stopPropagation();
        openComboboxEditor(td, ctx);
      });
    }

    const current = opts.find((o) => String(o.value) === String(value)) || null;
    if (!current) {
      if (isBlank(value)) {
        return h('span', { class: 'sg-renderer-select-placeholder' },
          document.createTextNode(cfg.placeholder));
      }
      return h('span', { class: 'sg-renderer-select-bare' }, document.createTextNode(String(value)));
    }
    return buildSelectPill(current, SG_PALETTE_RE);
  };
}

let activeComboboxEditor = null;

function openComboboxEditor(anchor, ctx) {
  closeComboboxEditor();
  const opts = anchor._sgComboOpts || [];
  const allowCustom = !!anchor._sgComboAllowCustom;
  const placeholder = anchor._sgComboPlaceholder || 'Search…';
  const { row, col } = ctx;
  let query = '';
  let highlight = 0;

  const pop = h('div', { class: 'sg-renderer-combobox-popover', role: 'combobox' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  const input = h('input', {
    type: 'search',
    class: 'sg-renderer-combobox-input',
    placeholder,
    autocomplete: 'off',
  });
  pop.append(input);
  const list = h('div', { class: 'sg-renderer-combobox-list', role: 'listbox' });
  pop.append(list);

  function commit(next) {
    const { api } = ctx;
    const oldValue = row && col?.field != null ? row[col.field] : null;
    if (row && col?.field != null) row[col.field] = next;
    if (api?.applyTransaction) api.applyTransaction({ update: [row] });
    const grid = anchor.closest('[data-controller~="grid"]');
    if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
      bubbles: true,
      detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
    }));
    closeComboboxEditor();
  }

  function filtered() {
    const q = query.trim().toLowerCase();
    if (!q) return opts;
    return opts.filter((o) => String(o.label).toLowerCase().includes(q));
  }

  function rebuild() {
    list.replaceChildren();
    const matches = filtered();
    if (highlight >= matches.length) highlight = Math.max(0, matches.length - 1);
    matches.forEach((opt, i) => {
      const row = h('button', {
        type: 'button',
        class: `sg-renderer-combobox-option${i === highlight ? ' is-highlighted' : ''}`,
        role: 'option',
        'aria-selected': i === highlight ? 'true' : 'false',
      });
      row.append(buildSelectPill(opt, SG_PALETTE_RE));
      row.addEventListener('mouseenter', () => { highlight = i; updateHighlights(); });
      row.addEventListener('click', () => commit(opt.value));
      list.append(row);
    });
    if (matches.length === 0) {
      const msg = h('div', { class: 'sg-renderer-combobox-empty' });
      if (allowCustom && query.trim()) {
        msg.append(document.createTextNode(`Press Enter to add "${query.trim()}"`));
      } else {
        msg.append(document.createTextNode('No matches'));
      }
      list.append(msg);
    }
  }

  function updateHighlights() {
    list.querySelectorAll('.sg-renderer-combobox-option').forEach((el, i) => {
      el.classList.toggle('is-highlighted', i === highlight);
      el.setAttribute('aria-selected', i === highlight ? 'true' : 'false');
    });
  }

  input.addEventListener('input', () => { query = input.value; highlight = 0; rebuild(); });
  input.addEventListener('keydown', (e) => {
    const matches = filtered();
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlight = Math.min(matches.length - 1, highlight + 1);
      updateHighlights();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlight = Math.max(0, highlight - 1);
      updateHighlights();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matches[highlight]) commit(matches[highlight].value);
      else if (allowCustom && query.trim()) commit(query.trim());
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      closeComboboxEditor();
    }
  });

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeComboboxEditor(); }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeComboboxEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  rebuild();
  setTimeout(() => input.focus(), 0);
  activeComboboxEditor = { pop, onKey, onDocClick, anchor };
}

function closeComboboxEditor() {
  if (!activeComboboxEditor) return;
  const { pop, onKey, onDocClick, anchor } = activeComboboxEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeComboboxEditor = null;
  refocusGrid(anchor);
}

/* ---------- date-picker (calendar popover editor) ------------------
 *
 * Display shows the date formatted via the same Intl pipeline as
 * `date()`. Double-click opens a calendar grid popover; clicking a day
 * commits the new ISO date via grid:cellValueChanged. Today is
 * highlighted; arrows navigate months.
 *
 *   registerRenderer('start_date', renderers.datePicker({
 *     dateStyle: 'medium',
 *     min: '2020-01-01', max: '2030-12-31',
 *   }));
 *
 * For pure display use the existing `date` renderer — datePicker is
 * the editable sibling. */
function ymd(d) {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}
function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear()
                && a.getMonth() === b.getMonth()
                && a.getDate() === b.getDate();
}

export function datePicker({
  locale = undefined,
  dateStyle = 'medium',
  editable = true,
  empty = '',
  min = null,
  max = null,
  firstDayOfWeek = 1,            // 0 = Sunday, 1 = Monday (default)
} = {}) {
  const fmt = new Intl.DateTimeFormat(locale, { dateStyle });
  return (ctx) => {
    const { value, td } = ctx;
    const cfg = ctx?.col?.cellRendererConfig || {};
    const minD = cfg.min ? toDate(cfg.min) : (min ? toDate(min) : null);
    const maxD = cfg.max ? toDate(cfg.max) : (max ? toDate(max) : null);
    const fdow = cfg.firstDayOfWeek ?? firstDayOfWeek;
    const ed   = cfg.editable ?? editable;

    if (td) {
      td.classList.add('sg-renderer-datepicker-cell');
      td._sgDatePickerMin = minD;
      td._sgDatePickerMax = maxD;
      td._sgDatePickerFdow = fdow;
    }

    if (ed && td && !td._sgDatePickerBound) {
      td._sgDatePickerBound = true;
      td.addEventListener('dblclick', (e) => {
        if (e._sgDatePickerHandled) return;
        e._sgDatePickerHandled = true;
        e.stopPropagation();
        openDatePickerEditor(td, ctx);
      });
    }

    const d = toDate(value);
    if (!d) return empty ? document.createTextNode(empty) : '';
    return h('span', { class: 'sg-renderer-datepicker-value' },
      document.createTextNode(fmt.format(d)));
  };
}

let activeDatePickerEditor = null;
const DP_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
const DP_DOW    = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildCalendar(viewYear, viewMonth, selected, onPick, minD, maxD, fdow) {
  const wrap = h('div', { class: 'sg-renderer-datepicker-cal' });
  const head = h('div', { class: 'sg-renderer-datepicker-head' });
  const prev = h('button', { type: 'button', class: 'sg-renderer-datepicker-nav', 'aria-label': 'Previous month' },
    document.createTextNode('‹'));
  const title = h('span', { class: 'sg-renderer-datepicker-title' },
    document.createTextNode(`${DP_MONTHS[viewMonth]} ${viewYear}`));
  const next = h('button', { type: 'button', class: 'sg-renderer-datepicker-nav', 'aria-label': 'Next month' },
    document.createTextNode('›'));
  head.append(prev, title, next);

  const dows = h('div', { class: 'sg-renderer-datepicker-dows' });
  for (let i = 0; i < 7; i++) {
    dows.append(h('span', { class: 'sg-renderer-datepicker-dow' },
      document.createTextNode(DP_DOW[(i + fdow) % 7])));
  }

  const grid = h('div', { class: 'sg-renderer-datepicker-grid' });
  const first = new Date(viewYear, viewMonth, 1);
  const startDow = (first.getDay() - fdow + 7) % 7;
  const start = new Date(viewYear, viewMonth, 1 - startDow);
  const today = new Date();
  for (let i = 0; i < 42; i++) {
    const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    const inMonth = cur.getMonth() === viewMonth;
    const isSel = sameDay(cur, selected);
    const isToday = sameDay(cur, today);
    const disabled = (minD && cur < minD) || (maxD && cur > maxD);
    const cls = ['sg-renderer-datepicker-day'];
    if (!inMonth) cls.push('is-other-month');
    if (isSel)    cls.push('is-selected');
    if (isToday)  cls.push('is-today');
    if (disabled) cls.push('is-disabled');
    const btn = h('button', {
      type: 'button',
      class: cls.join(' '),
      disabled: disabled ? '' : null,
      title: ymd(cur),
    }, document.createTextNode(String(cur.getDate())));
    btn.addEventListener('click', () => onPick(cur));
    grid.append(btn);
  }
  wrap.append(head, dows, grid);
  return { wrap, prev, next, title };
}

function openDatePickerEditor(anchor, ctx) {
  closeDatePickerEditor();
  const { row, col } = ctx;
  const current = toDate(row && col?.field != null ? row[col.field] : null);
  let viewYear = (current || new Date()).getFullYear();
  let viewMonth = (current || new Date()).getMonth();
  let selected = current;
  const minD = anchor._sgDatePickerMin || null;
  const maxD = anchor._sgDatePickerMax || null;
  const fdow = anchor._sgDatePickerFdow ?? 1;

  const pop = h('div', { class: 'sg-renderer-datepicker-popover', role: 'dialog' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  function commit(d) {
    const { api } = ctx;
    const oldValue = row && col?.field != null ? row[col.field] : null;
    const out = d ? ymd(d) : null;
    if (row && col?.field != null) row[col.field] = out;
    if (api?.applyTransaction) api.applyTransaction({ update: [row] });
    const grid = anchor.closest('[data-controller~="grid"]');
    if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
      bubbles: true,
      detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: out },
    }));
    closeDatePickerEditor();
  }

  function render() {
    pop.replaceChildren();
    const { wrap, prev, next } = buildCalendar(viewYear, viewMonth, selected, commit, minD, maxD, fdow);
    prev.addEventListener('click', () => {
      if (viewMonth === 0) { viewMonth = 11; viewYear -= 1; } else viewMonth -= 1;
      render();
    });
    next.addEventListener('click', () => {
      if (viewMonth === 11) { viewMonth = 0; viewYear += 1; } else viewMonth += 1;
      render();
    });
    const footer = h('div', { class: 'sg-renderer-datepicker-footer' });
    const today = h('button', { type: 'button', class: 'sg-renderer-datepicker-today' },
      document.createTextNode('Today'));
    today.addEventListener('click', () => commit(new Date()));
    const clear = h('button', { type: 'button', class: 'sg-renderer-datepicker-clear' },
      document.createTextNode('Clear'));
    clear.addEventListener('click', () => commit(null));
    footer.append(today, clear);
    pop.append(wrap, footer);
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeDatePickerEditor(); }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeDatePickerEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  render();
  positionPopover(pop, anchor);
  activeDatePickerEditor = { pop, onKey, onDocClick, anchor };
}

function closeDatePickerEditor() {
  if (!activeDatePickerEditor) return;
  const { pop, onKey, onDocClick, anchor } = activeDatePickerEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeDatePickerEditor = null;
  refocusGrid(anchor);
}

/* ---------- time-picker (HH:MM popover editor) ---------------------
 *
 * Display sibling to the existing `time` renderer; opens a compact
 * popover with hour + minute (+ optional AM/PM) wheels. Use for
 * appointment times, deadlines, daily schedules.
 *
 *   registerRenderer('start', renderers.timePicker({
 *     style: '12h',
 *     minuteStep: 15,
 *   }));
 *
 * Commits ISO-ish "HH:MM" (24-hour) regardless of display style — the
 * canonical wire shape matches the existing `time` renderer's input. */
export function timePicker({
  style = '24h',                  // '24h' | '12h'
  minuteStep = 5,
  editable = true,
  empty = '—',
} = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    const cfg = ctx?.col?.cellRendererConfig || {};
    const st = cfg.style ?? style;
    const ms = cfg.minuteStep ?? minuteStep;
    const ed = cfg.editable ?? editable;

    if (td) {
      td.classList.add('sg-renderer-timepicker-cell');
      td._sgTimePickerStyle = st;
      td._sgTimePickerStep = ms;
    }

    if (ed && td && !td._sgTimePickerBound) {
      td._sgTimePickerBound = true;
      td.addEventListener('dblclick', (e) => {
        if (e._sgTimePickerHandled) return;
        e._sgTimePickerHandled = true;
        e.stopPropagation();
        openTimePickerEditor(td, ctx);
      });
    }

    const t = toTime(value);
    if (!t) return empty;
    return h('span', { class: 'sg-renderer-timepicker-value' },
      document.createTextNode(formatTimeForPicker(t, st)));
  };
}

function formatTimeForPicker(t, style) {
  const m = String(t.m).padStart(2, '0');
  if (style === '12h') {
    const ampm = t.h >= 12 ? 'PM' : 'AM';
    const h12 = (t.h % 12) || 12;
    return `${h12}:${m} ${ampm}`;
  }
  return `${String(t.h).padStart(2, '0')}:${m}`;
}

let activeTimePickerEditor = null;

function openTimePickerEditor(anchor, ctx) {
  closeTimePickerEditor();
  const style = anchor._sgTimePickerStyle || '24h';
  const step = anchor._sgTimePickerStep || 5;
  const { row, col } = ctx;
  const start = toTime(row && col?.field != null ? row[col.field] : null) || { h: 9, m: 0, s: 0 };
  let h24 = start.h;
  let mm = Math.round(start.m / step) * step;
  if (mm >= 60) mm = 0;

  const pop = h('div', { class: 'sg-renderer-timepicker-popover', role: 'dialog' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  function commit(value) {
    const { api } = ctx;
    const oldValue = row && col?.field != null ? row[col.field] : null;
    if (row && col?.field != null) row[col.field] = value;
    if (api?.applyTransaction) api.applyTransaction({ update: [row] });
    const grid = anchor.closest('[data-controller~="grid"]');
    if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
      bubbles: true,
      detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: value },
    }));
    closeTimePickerEditor();
  }

  function commitCurrent() {
    const hh = String(h24).padStart(2, '0');
    const m  = String(mm).padStart(2, '0');
    commit(`${hh}:${m}`);
  }

  const hoursWrap = h('div', { class: 'sg-renderer-timepicker-col' });
  hoursWrap.append(h('div', { class: 'sg-renderer-timepicker-col-label' },
    document.createTextNode('Hour')));
  const hoursList = h('div', { class: 'sg-renderer-timepicker-list' });
  hoursWrap.append(hoursList);

  function renderHours() {
    hoursList.replaceChildren();
    const range = style === '12h' ? Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i)) : Array.from({ length: 24 }, (_, i) => i);
    for (const h12 of range) {
      const value24 = style === '12h'
        ? (h24 >= 12 ? (h12 === 12 ? 12 : h12 + 12) : (h12 === 12 ? 0 : h12))
        : h12;
      const sel = value24 === h24;
      const btn = h('button', {
        type: 'button',
        class: `sg-renderer-timepicker-item${sel ? ' is-selected' : ''}`,
      }, document.createTextNode(style === '12h' ? String(h12) : String(h12).padStart(2, '0')));
      btn.addEventListener('click', () => { h24 = value24; renderHours(); });
      btn.addEventListener('dblclick', () => { h24 = value24; commitCurrent(); });
      hoursList.append(btn);
      if (sel) setTimeout(() => btn.scrollIntoView({ block: 'nearest' }), 0);
    }
  }

  const minutesWrap = h('div', { class: 'sg-renderer-timepicker-col' });
  minutesWrap.append(h('div', { class: 'sg-renderer-timepicker-col-label' },
    document.createTextNode('Min')));
  const minutesList = h('div', { class: 'sg-renderer-timepicker-list' });
  minutesWrap.append(minutesList);

  function renderMinutes() {
    minutesList.replaceChildren();
    for (let i = 0; i < 60; i += step) {
      const sel = i === mm;
      const btn = h('button', {
        type: 'button',
        class: `sg-renderer-timepicker-item${sel ? ' is-selected' : ''}`,
      }, document.createTextNode(String(i).padStart(2, '0')));
      btn.addEventListener('click', () => { mm = i; renderMinutes(); });
      btn.addEventListener('dblclick', () => { mm = i; commitCurrent(); });
      minutesList.append(btn);
      if (sel) setTimeout(() => btn.scrollIntoView({ block: 'nearest' }), 0);
    }
  }

  const cols = h('div', { class: 'sg-renderer-timepicker-cols' });
  cols.append(hoursWrap, minutesWrap);
  if (style === '12h') {
    const ampmWrap = h('div', { class: 'sg-renderer-timepicker-col' });
    ampmWrap.append(h('div', { class: 'sg-renderer-timepicker-col-label' },
      document.createTextNode(' ')));
    const ampmList = h('div', { class: 'sg-renderer-timepicker-list' });
    for (const ap of ['AM', 'PM']) {
      const sel = (ap === 'AM' && h24 < 12) || (ap === 'PM' && h24 >= 12);
      const btn = h('button', {
        type: 'button',
        class: `sg-renderer-timepicker-item${sel ? ' is-selected' : ''}`,
      }, document.createTextNode(ap));
      btn.addEventListener('click', () => {
        if (ap === 'AM' && h24 >= 12) h24 -= 12;
        if (ap === 'PM' && h24 < 12)  h24 += 12;
        renderHours();
        ampmList.querySelectorAll('.sg-renderer-timepicker-item').forEach((e, i) => {
          e.classList.toggle('is-selected', (i === 0 && h24 < 12) || (i === 1 && h24 >= 12));
        });
      });
      ampmList.append(btn);
    }
    ampmWrap.append(ampmList);
    cols.append(ampmWrap);
  }

  const footer = h('div', { class: 'sg-renderer-timepicker-footer' });
  const cancel = h('button', { type: 'button', class: 'sg-renderer-timepicker-cancel' },
    document.createTextNode('Cancel'));
  const ok = h('button', { type: 'button', class: 'sg-renderer-timepicker-ok' },
    document.createTextNode('Set'));
  const clear = h('button', { type: 'button', class: 'sg-renderer-timepicker-clear' },
    document.createTextNode('Clear'));
  cancel.addEventListener('click', () => closeTimePickerEditor());
  clear.addEventListener('click', () => commit(null));
  ok.addEventListener('click', () => commitCurrent());
  footer.append(clear, cancel, ok);

  pop.append(cols, footer);

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeTimePickerEditor(); }
    if (e.key === 'Enter')  { e.stopPropagation(); e.preventDefault(); commitCurrent(); }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeTimePickerEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  renderHours();
  renderMinutes();
  positionPopover(pop, anchor);
  activeTimePickerEditor = { pop, onKey, onDocClick, anchor };
}

function closeTimePickerEditor() {
  if (!activeTimePickerEditor) return;
  const { pop, onKey, onDocClick, anchor } = activeTimePickerEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeTimePickerEditor = null;
  refocusGrid(anchor);
}

/* ---------- date-range (two-calendar popover) ----------------------
 *
 * Display "Jun 4 – Jun 18" (or "Jun 4 – Jul 2" / "Jun 4 2026 – Jul 2 2027"
 * when the dates span months / years). Double-click opens a dual-calendar
 * popover: click start, click end. Stores `[startISO, endISO]`.
 *
 *   registerRenderer('booking', renderers.dateRange());
 *
 * Accepts arrays `[start, end]`, ISO strings `start/end`, or an object
 * `{ start, end }` on the way in. */
function normaliseDateRange(value) {
  if (value == null || value === '') return null;
  let start, end;
  if (Array.isArray(value)) {
    [start, end] = value;
  } else if (typeof value === 'object') {
    start = value.start || value.from;
    end   = value.end   || value.to;
  } else if (typeof value === 'string') {
    const m = value.split(/\s*\/\s*|\s*[–-]\s*/);
    [start, end] = m.length >= 2 ? m : [value, value];
  }
  const s = toDate(start);
  const e = toDate(end);
  if (!s && !e) return null;
  return { start: s, end: e };
}

function formatDateRange(range, locale) {
  if (!range) return '';
  const { start, end } = range;
  if (!start && !end) return '';
  if (!end || (start && sameDay(start, end))) {
    return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(start);
  }
  if (!start) {
    return `… – ${new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(end)}`;
  }
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  if (sameMonth) {
    const left  = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(start);
    const right = new Intl.DateTimeFormat(locale, { day: 'numeric', year: 'numeric' }).format(end);
    return `${left} – ${right}`;
  }
  if (sameYear) {
    const left  = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(start);
    const right = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(end);
    return `${left} – ${right}`;
  }
  const fmt = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${fmt.format(start)} – ${fmt.format(end)}`;
}

export function dateRange({
  locale = undefined,
  editable = true,
  empty = '—',
  firstDayOfWeek = 1,
} = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    const cfg = ctx?.col?.cellRendererConfig || {};
    const fdow = cfg.firstDayOfWeek ?? firstDayOfWeek;
    const ed = cfg.editable ?? editable;

    if (td) {
      td.classList.add('sg-renderer-daterange-cell');
      td._sgRangeFdow = fdow;
    }

    if (ed && td && !td._sgRangeBound) {
      td._sgRangeBound = true;
      td.addEventListener('dblclick', (e) => {
        if (e._sgRangeHandled) return;
        e._sgRangeHandled = true;
        e.stopPropagation();
        openDateRangeEditor(td, ctx);
      });
    }

    const range = normaliseDateRange(value);
    if (!range) return empty;
    return h('span', { class: 'sg-renderer-daterange-value' },
      document.createTextNode(formatDateRange(range, locale)));
  };
}

let activeDateRangeEditor = null;

function openDateRangeEditor(anchor, ctx) {
  closeDateRangeEditor();
  const { row, col } = ctx;
  const initial = normaliseDateRange(row && col?.field != null ? row[col.field] : null) || { start: null, end: null };
  let start = initial.start;
  let end = initial.end;
  let viewYear = (start || new Date()).getFullYear();
  let viewMonth = (start || new Date()).getMonth();
  const fdow = anchor._sgRangeFdow ?? 1;

  const pop = h('div', { class: 'sg-renderer-daterange-popover', role: 'dialog' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  function commit() {
    const { api } = ctx;
    const oldValue = row && col?.field != null ? row[col.field] : null;
    const next = start || end
      ? { start: start ? ymd(start) : null, end: end ? ymd(end) : null }
      : null;
    if (row && col?.field != null) row[col.field] = next;
    if (api?.applyTransaction) api.applyTransaction({ update: [row] });
    const grid = anchor.closest('[data-controller~="grid"]');
    if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
      bubbles: true,
      detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
    }));
    closeDateRangeEditor();
  }

  function onPick(d) {
    if (!start || (start && end)) {
      start = d; end = null;
    } else if (d < start) {
      end = start; start = d;
    } else {
      end = d;
    }
    render();
  }

  function buildRangeCalendar(year, month) {
    const wrap = h('div', { class: 'sg-renderer-datepicker-cal' });
    const head = h('div', { class: 'sg-renderer-datepicker-head' });
    const prev = h('button', { type: 'button', class: 'sg-renderer-datepicker-nav' },
      document.createTextNode('‹'));
    const title = h('span', { class: 'sg-renderer-datepicker-title' },
      document.createTextNode(`${DP_MONTHS[month]} ${year}`));
    const next = h('button', { type: 'button', class: 'sg-renderer-datepicker-nav' },
      document.createTextNode('›'));
    head.append(prev, title, next);

    const dows = h('div', { class: 'sg-renderer-datepicker-dows' });
    for (let i = 0; i < 7; i++) {
      dows.append(h('span', { class: 'sg-renderer-datepicker-dow' },
        document.createTextNode(DP_DOW[(i + fdow) % 7])));
    }

    const grid = h('div', { class: 'sg-renderer-datepicker-grid' });
    const firstOfMonth = new Date(year, month, 1);
    const startDow = (firstOfMonth.getDay() - fdow + 7) % 7;
    const startD = new Date(year, month, 1 - startDow);
    const today = new Date();
    for (let i = 0; i < 42; i++) {
      const cur = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate() + i);
      const inMonth = cur.getMonth() === month;
      const isStart = sameDay(cur, start);
      const isEnd   = sameDay(cur, end);
      const inRange = start && end && cur > start && cur < end;
      const isToday = sameDay(cur, today);
      const cls = ['sg-renderer-datepicker-day'];
      if (!inMonth) cls.push('is-other-month');
      if (isStart || isEnd) cls.push('is-selected');
      if (inRange) cls.push('is-in-range');
      if (isToday)  cls.push('is-today');
      const btn = h('button', { type: 'button', class: cls.join(' '), title: ymd(cur) },
        document.createTextNode(String(cur.getDate())));
      btn.addEventListener('click', () => onPick(cur));
      grid.append(btn);
    }
    wrap.append(head, dows, grid);
    return { wrap, prev, next };
  }

  function render() {
    pop.replaceChildren();
    const months = h('div', { class: 'sg-renderer-daterange-months' });
    const ny = viewMonth === 11 ? viewYear + 1 : viewYear;
    const nm = (viewMonth + 1) % 12;
    const left  = buildRangeCalendar(viewYear, viewMonth);
    const right = buildRangeCalendar(ny, nm);
    left.prev.addEventListener('click', () => {
      if (viewMonth === 0) { viewMonth = 11; viewYear -= 1; } else viewMonth -= 1;
      render();
    });
    right.next.addEventListener('click', () => {
      if (viewMonth === 11) { viewMonth = 0; viewYear += 1; } else viewMonth += 1;
      render();
    });
    // Hide the unused inner nav buttons so users don't think they paginate the
    // already-paired panel (left's `next` and right's `prev`).
    left.next.style.visibility = 'hidden';
    right.prev.style.visibility = 'hidden';
    months.append(left.wrap, right.wrap);
    const footer = h('div', { class: 'sg-renderer-datepicker-footer' });
    const clearBtn = h('button', { type: 'button', class: 'sg-renderer-datepicker-clear' },
      document.createTextNode('Clear'));
    const okBtn    = h('button', { type: 'button', class: 'sg-renderer-timepicker-ok' },
      document.createTextNode('Set'));
    clearBtn.addEventListener('click', () => { start = null; end = null; commit(); });
    okBtn.addEventListener('click', commit);
    footer.append(clearBtn, okBtn);
    pop.append(months, footer);
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeDateRangeEditor(); }
    if (e.key === 'Enter')  { e.stopPropagation(); e.preventDefault(); commit(); }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeDateRangeEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  render();
  positionPopover(pop, anchor);
  activeDateRangeEditor = { pop, onKey, onDocClick, anchor };
}

function closeDateRangeEditor() {
  if (!activeDateRangeEditor) return;
  const { pop, onKey, onDocClick, anchor } = activeDateRangeEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeDateRangeEditor = null;
  refocusGrid(anchor);
}

/* ---------- color-picker (swatch grid popover) ---------------------
 *
 * Editable sibling of `colorSwatch`. Display uses the same chip; a
 * double-click opens a popover with a curated palette grid + a native
 * `<input type="color">` for custom values + a hex text field.
 *
 *   registerRenderer('tint', renderers.colorPicker({
 *     palette: ['#ef4444', '#f97316', '#eab308', ...],
 *     shape: 'square',
 *     showLabel: true,
 *   })); */
const DEFAULT_COLOR_PALETTE = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#6b7280',
  '#1f2937', '#ffffff',
];

export function colorPicker({
  palette = DEFAULT_COLOR_PALETTE,
  shape = 'circle',
  showLabel = false,
  size = 14,
  editable = true,
  empty = '—',
} = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    const cfg = ctx?.col?.cellRendererConfig || {};
    const pal = cfg.palette || palette;
    const sp = cfg.shape ?? shape;
    const sl = cfg.showLabel ?? showLabel;
    const sz = cfg.size ?? size;
    const ed = cfg.editable ?? editable;

    if (td) {
      td.classList.add('sg-renderer-colorpicker-cell');
      td._sgPickerPalette = pal;
    }

    if (ed && td && !td._sgPickerBound) {
      td._sgPickerBound = true;
      td.addEventListener('dblclick', (e) => {
        if (e._sgPickerHandled) return;
        e._sgPickerHandled = true;
        e.stopPropagation();
        openColorPickerEditor(td, ctx);
      });
    }

    if (isBlank(value)) return empty;
    const wrap = h('span', { class: 'sg-renderer-swatch' });
    // .sg-renderer-swatch-chip in CSS intentionally has no fixed size — the
    // colorSwatch renderer also sets width/height inline per-cell. Without
    // these the chip collapses to a dot.
    const extra = String(value).toLowerCase() === '#ffffff' ? ' border: 1px solid #d1d5db;' : '';
    wrap.append(h('span', {
      class: `sg-renderer-swatch-chip is-${sp}`,
      style: `width: ${sz}px; height: ${sz}px; background: ${value};${extra}`,
      title: value,
    }));
    if (sl) {
      wrap.append(h('span', { class: 'sg-renderer-swatch-label' }, document.createTextNode(value)));
    }
    return wrap;
  };
}

let activeColorPickerEditor = null;

function openColorPickerEditor(anchor, ctx) {
  closeColorPickerEditor();
  const palette = anchor._sgPickerPalette || DEFAULT_COLOR_PALETTE;
  const { row, col } = ctx;
  const currentVal = row && col?.field != null ? row[col.field] : null;

  const pop = h('div', { class: 'sg-renderer-colorpicker-popover', role: 'dialog' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  function commit(value) {
    const { api } = ctx;
    const oldValue = row && col?.field != null ? row[col.field] : null;
    if (row && col?.field != null) row[col.field] = value;
    if (api?.applyTransaction) api.applyTransaction({ update: [row] });
    const grid = anchor.closest('[data-controller~="grid"]');
    if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
      bubbles: true,
      detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: value },
    }));
    closeColorPickerEditor();
  }

  const grid = h('div', { class: 'sg-renderer-colorpicker-grid' });
  for (const c of palette) {
    const sel = String(currentVal).toLowerCase() === String(c).toLowerCase();
    const sw = h('button', {
      type: 'button',
      class: `sg-renderer-colorpicker-swatch${sel ? ' is-selected' : ''}`,
      style: `background: ${c};`,
      title: c,
      'aria-label': c,
    });
    sw.addEventListener('click', () => commit(c));
    grid.append(sw);
  }

  const customRow = h('div', { class: 'sg-renderer-colorpicker-custom' });
  const native = h('input', { type: 'color', class: 'sg-renderer-colorpicker-native',
                              value: /^#[0-9a-fA-F]{6}$/.test(currentVal || '') ? currentVal : '#3b82f6' });
  const hex = h('input', { type: 'text', class: 'sg-renderer-colorpicker-hex',
                           value: currentVal || '', placeholder: '#rrggbb' });
  native.addEventListener('input', () => { hex.value = native.value; });
  hex.addEventListener('input', () => {
    if (/^#[0-9a-fA-F]{6}$/.test(hex.value)) native.value = hex.value;
  });
  const okBtn = h('button', { type: 'button', class: 'sg-renderer-timepicker-ok' },
    document.createTextNode('Set'));
  const clearBtn = h('button', { type: 'button', class: 'sg-renderer-timepicker-clear' },
    document.createTextNode('Clear'));
  clearBtn.addEventListener('click', () => commit(null));
  okBtn.addEventListener('click', () => {
    const v = /^#[0-9a-fA-F]{6}$/.test(hex.value) ? hex.value : native.value;
    commit(v);
  });

  customRow.append(native, hex, clearBtn, okBtn);

  pop.append(grid, customRow);

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeColorPickerEditor(); }
    if (e.key === 'Enter')  {
      e.stopPropagation();
      const v = /^#[0-9a-fA-F]{6}$/.test(hex.value) ? hex.value : native.value;
      commit(v);
    }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeColorPickerEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  activeColorPickerEditor = { pop, onKey, onDocClick, anchor };
}

function closeColorPickerEditor() {
  if (!activeColorPickerEditor) return;
  const { pop, onKey, onDocClick, anchor } = activeColorPickerEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeColorPickerEditor = null;
  refocusGrid(anchor);
}

/* ---------- textarea (multi-line popover editor) -------------------
 *
 * Companion to `multi-line`. Display behaves like the multi-line
 * renderer (clamped at N lines). Double-click opens a popover with a
 * resizable textarea; Cmd/Ctrl+Enter or "Save" commits, Escape cancels.
 *
 *   registerRenderer('notes', renderers.textarea({
 *     lines: 3,
 *     rows: 6,
 *   })); */
export function textarea({
  lines = 3,
  rows = 6,
  cols = 48,
  separator = '\n',
  editable = true,
  empty = '',
} = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    const cfg = ctx?.col?.cellRendererConfig || {};
    const ll = cfg.lines ?? lines;
    const rr = cfg.rows ?? rows;
    const cc = cfg.cols ?? cols;
    const sep = cfg.separator ?? separator;
    const ed = cfg.editable ?? editable;

    if (td) {
      td.classList.add('sg-renderer-multiline');
      td._sgTextareaRows = rr;
      td._sgTextareaCols = cc;
      td._sgTextareaSep = sep;
    }

    if (ed && td && !td._sgTextareaBound) {
      td._sgTextareaBound = true;
      td.addEventListener('dblclick', (e) => {
        if (e._sgTextareaHandled) return;
        e._sgTextareaHandled = true;
        e.stopPropagation();
        openTextareaEditor(td, ctx);
      });
    }

    if (isBlank(value)) return empty;
    const text = String(value);
    if (ll != null && ll > 0) {
      const block = h('div', {
        class: 'sg-renderer-multiline-clamp',
        style: `--sg-multiline-lines: ${ll};`,
        title: text,
      });
      block.textContent = text;
      return block;
    }
    return text;
  };
}

let activeTextareaEditor = null;

function openTextareaEditor(anchor, ctx) {
  closeTextareaEditor();
  const rows = anchor._sgTextareaRows || 6;
  const cols = anchor._sgTextareaCols || 48;
  const { row, col } = ctx;
  const start = row && col?.field != null ? row[col.field] : '';

  const pop = h('div', { class: 'sg-renderer-textarea-popover', role: 'dialog' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  const ta = h('textarea', { class: 'sg-renderer-textarea-input', rows, cols });
  ta.value = start == null ? '' : String(start);

  function commit() {
    const { api } = ctx;
    const next = ta.value;
    const oldValue = row && col?.field != null ? row[col.field] : null;
    if (row && col?.field != null) row[col.field] = next;
    if (api?.applyTransaction) api.applyTransaction({ update: [row] });
    const grid = anchor.closest('[data-controller~="grid"]');
    if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
      bubbles: true,
      detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
    }));
    closeTextareaEditor();
  }

  const footer = h('div', { class: 'sg-renderer-textarea-footer' });
  const hint   = h('span', { class: 'sg-renderer-textarea-hint' },
    document.createTextNode('⌘/Ctrl + Enter to save · Esc to cancel'));
  const cancel = h('button', { type: 'button', class: 'sg-renderer-timepicker-cancel' },
    document.createTextNode('Cancel'));
  const save   = h('button', { type: 'button', class: 'sg-renderer-timepicker-ok' },
    document.createTextNode('Save'));
  cancel.addEventListener('click', () => closeTextareaEditor());
  save.addEventListener('click', commit);
  footer.append(hint, cancel, save);

  pop.append(ta, footer);

  ta.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      closeTextareaEditor();
    }
  });

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeTextareaEditor(); }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeTextareaEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 0);
  activeTextareaEditor = { pop, onKey, onDocClick, anchor };
}

function closeTextareaEditor() {
  if (!activeTextareaEditor) return;
  const { pop, onKey, onDocClick, anchor } = activeTextareaEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeTextareaEditor = null;
  refocusGrid(anchor);
}

/* ---------- action-button (single per-row button) -------------------
 *
 * Render a single inline button per row that fires either a callback
 * (`onClick(row, ctx)`) or dispatches a `grid:rowAction` custom event
 * with a configured `action` name. The grid stays "thin" — actual side
 * effects live in the consuming code.
 *
 *   registerRenderer('row-archive', renderers.actionButton({
 *     label: 'Archive', icon: '📦', variant: 'secondary',
 *     onClick: (row) => archiveRow(row),
 *   }));
 *
 * Variants: 'primary' | 'secondary' | 'danger' | 'ghost'. */
function dispatchRowAction(td, ctx, name, payload) {
  const grid = td?.closest('[data-controller~="grid"]');
  if (!grid) return;
  grid.dispatchEvent(new CustomEvent('grid:rowAction', {
    bubbles: true,
    detail: {
      action: name,
      rowId: ctx.row?.id ?? ctx.row?._sg_id,
      row: ctx.row,
      col: ctx.col,
      ...payload,
    },
  }));
}

export function actionButton({
  label = 'Go',
  icon = null,
  variant = 'primary',
  action = null,
  onClick = null,
  disabled = false,
} = {}) {
  return (ctx) => {
    const { td, row } = ctx;
    const cfg = ctx?.col?.cellRendererConfig || {};
    const lab = cfg.label ?? label;
    const ic  = cfg.icon  ?? icon;
    const vr  = cfg.variant ?? variant;
    const act = cfg.action ?? action;
    const dis = (typeof disabled === 'function') ? disabled(row) : (cfg.disabled ?? disabled);

    if (td) td.classList.add('sg-renderer-action-cell');
    const btn = h('button', {
      type: 'button',
      class: `sg-renderer-action-btn is-${vr}`,
      disabled: dis ? '' : null,
    });
    if (ic) btn.append(h('span', { class: 'sg-renderer-action-icon', 'aria-hidden': 'true' }, ic));
    btn.append(h('span', { class: 'sg-renderer-action-label' }, document.createTextNode(lab)));
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dis) return;
      if (typeof onClick === 'function') onClick(row, ctx);
      if (act) dispatchRowAction(td, ctx, act);
    });
    return btn;
  };
}

/* ---------- menu (kebab/overflow row-action menu) -------------------
 *
 * Single kebab icon per row; click opens a popover with a configured
 * list of items. Each item commits via callback or `grid:rowAction`.
 *
 *   registerRenderer('actions', renderers.menu({
 *     items: [
 *       { label: 'Edit',     action: 'edit',     icon: '✎' },
 *       { label: 'Duplicate', action: 'duplicate' },
 *       { label: 'Archive',  action: 'archive' },
 *       '---',
 *       { label: 'Delete',   action: 'delete',   danger: true },
 *     ],
 *   })); */
const SG_KEBAB_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="3" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="13" r="1.5" fill="currentColor"/></svg>';

export function menu({
  items = [],
  icon = SG_KEBAB_SVG,
  ariaLabel = 'Open menu',
} = {}) {
  return (ctx) => {
    const { td } = ctx;
    const cfg = ctx?.col?.cellRendererConfig || {};
    const its = cfg.items || items;
    const ic = cfg.icon ?? icon;
    if (td) {
      td.classList.add('sg-renderer-menu-cell');
      td._sgMenuItems = its;
    }
    const btn = h('button', {
      type: 'button',
      class: 'sg-renderer-menu-trigger',
      'aria-label': cfg.ariaLabel ?? ariaLabel,
    }, ic);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      openMenuPopover(td, ctx, its);
    });
    return btn;
  };
}

let activeMenuPopover = null;

function openMenuPopover(anchor, ctx, items) {
  closeMenuPopover();
  const pop = h('div', { class: 'sg-renderer-menu-popover', role: 'menu' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  for (const item of items) {
    if (item === '---' || item === null) {
      pop.append(h('div', { class: 'sg-renderer-menu-sep', role: 'separator' }));
      continue;
    }
    const it = typeof item === 'string' ? { label: item, action: item } : item;
    const cls = ['sg-renderer-menu-item'];
    if (it.danger) cls.push('is-danger');
    if (it.disabled) cls.push('is-disabled');
    const row = h('button', {
      type: 'button',
      class: cls.join(' '),
      role: 'menuitem',
      disabled: it.disabled ? '' : null,
    });
    if (it.icon) row.append(h('span', { class: 'sg-renderer-menu-icon', 'aria-hidden': 'true' }, it.icon));
    row.append(h('span', { class: 'sg-renderer-menu-label' }, document.createTextNode(it.label)));
    if (it.shortcut) {
      row.append(h('span', { class: 'sg-renderer-menu-shortcut' }, document.createTextNode(it.shortcut)));
    }
    row.addEventListener('click', () => {
      if (it.disabled) return;
      closeMenuPopover();
      if (typeof it.onClick === 'function') it.onClick(ctx.row, ctx);
      if (it.action) dispatchRowAction(anchor, ctx, it.action);
    });
    pop.append(row);
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeMenuPopover(); }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeMenuPopover();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  activeMenuPopover = { pop, onKey, onDocClick, anchor };
}

function closeMenuPopover() {
  if (!activeMenuPopover) return;
  const { pop, onKey, onDocClick, anchor } = activeMenuPopover;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeMenuPopover = null;
  refocusGrid(anchor);
}

/* ---------- split-button (primary + dropdown caret) -----------------
 *
 * Two halves: left fires the primary action; right opens a menu popover
 * for secondary actions.
 *
 *   registerRenderer('publish', renderers.splitButton({
 *     primary: { label: 'Publish', action: 'publish' },
 *     items:   [ { label: 'Schedule…', action: 'schedule' },
 *                { label: 'Save draft', action: 'save_draft' } ],
 *   })); */
export function splitButton({
  primary = { label: 'Go', action: null, icon: null },
  items = [],
  variant = 'primary',
} = {}) {
  return (ctx) => {
    const { td } = ctx;
    const cfg = ctx?.col?.cellRendererConfig || {};
    const p = cfg.primary || primary;
    const its = cfg.items || items;
    const vr = cfg.variant ?? variant;

    if (td) td.classList.add('sg-renderer-splitbtn-cell');
    const group = h('span', { class: `sg-renderer-splitbtn is-${vr}`, role: 'group' });
    const mainBtn = h('button', { type: 'button', class: 'sg-renderer-splitbtn-main' });
    if (p.icon) mainBtn.append(h('span', { class: 'sg-renderer-action-icon', 'aria-hidden': 'true' }, p.icon));
    mainBtn.append(h('span', { class: 'sg-renderer-action-label' }, document.createTextNode(p.label)));
    mainBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof p.onClick === 'function') p.onClick(ctx.row, ctx);
      if (p.action) dispatchRowAction(td, ctx, p.action);
    });
    const caret = h('button', { type: 'button', class: 'sg-renderer-splitbtn-caret', 'aria-label': 'More actions' },
      document.createTextNode('▾'));
    caret.addEventListener('click', (e) => {
      e.stopPropagation();
      openMenuPopover(caret, ctx, its);
    });
    group.append(mainBtn, caret);
    return group;
  };
}

/* ---------- row-actions (edit / delete / archive icon trio) ---------
 *
 * Convenience renderer for the common "small icon buttons at the end
 * of a row" pattern. Default trio is edit + duplicate + delete; pass
 * `actions: [...]` to override. Each action fires onClick(row) and/or
 * dispatches `grid:rowAction` with the action name.
 *
 *   registerRenderer('row-ops', renderers.rowActions());
 *   registerRenderer('row-ops', renderers.rowActions({
 *     actions: [
 *       { name: 'edit', label: 'Edit',  icon: '✎' },
 *       { name: 'star', label: 'Star',  icon: '★' },
 *     ],
 *   })); */
const ROW_ACTIONS_DEFAULT = [
  { name: 'edit',      label: 'Edit',      icon: '✎' },
  { name: 'duplicate', label: 'Duplicate', icon: '⧉' },
  { name: 'delete',    label: 'Delete',    icon: '✕', danger: true },
];

export function rowActions({
  actions = ROW_ACTIONS_DEFAULT,
} = {}) {
  return (ctx) => {
    const { td } = ctx;
    const cfg = ctx?.col?.cellRendererConfig || {};
    const list = cfg.actions || actions;
    if (td) td.classList.add('sg-renderer-rowactions-cell');
    const wrap = h('span', { class: 'sg-renderer-rowactions' });
    for (const a of list) {
      const btn = h('button', {
        type: 'button',
        class: `sg-renderer-rowactions-btn${a.danger ? ' is-danger' : ''}`,
        title: a.label,
        'aria-label': a.label,
      }, a.icon || a.label);
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof a.onClick === 'function') a.onClick(ctx.row, ctx);
        if (a.name) dispatchRowAction(td, ctx, a.name);
      });
      wrap.append(btn);
    }
    return wrap;
  };
}

/* ---------- drag-handle (row reorder grip) -------------------------
 *
 * Six-dot grip icon. The grid's existing row-drag implementation lives
 * on the gutter; this is a standalone primitive for grids that prefer
 * an in-column handle. Sets `cursor: grab` on the cell; dispatches a
 * `grid:rowDragStart` event with the row id on mousedown so consumers
 * can wire up reorder behaviour. */
const SG_DRAG_HANDLE_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true">' +
  '<circle cx="6" cy="3" r="1.2" fill="currentColor"/>' +
  '<circle cx="10" cy="3" r="1.2" fill="currentColor"/>' +
  '<circle cx="6" cy="8" r="1.2" fill="currentColor"/>' +
  '<circle cx="10" cy="8" r="1.2" fill="currentColor"/>' +
  '<circle cx="6" cy="13" r="1.2" fill="currentColor"/>' +
  '<circle cx="10" cy="13" r="1.2" fill="currentColor"/>' +
  '</svg>';

export function dragHandle({ label = 'Drag to reorder' } = {}) {
  return (ctx) => {
    const { td } = ctx;
    if (td) td.classList.add('sg-renderer-draghandle-cell');
    const btn = h('span', {
      class: 'sg-renderer-draghandle',
      title: label,
      'aria-label': label,
      role: 'button',
      tabindex: 0,
      draggable: 'true',
    }, SG_DRAG_HANDLE_SVG);
    btn.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      const grid = td?.closest('[data-controller~="grid"]');
      if (grid) grid.dispatchEvent(new CustomEvent('grid:rowDragStart', {
        bubbles: true,
        detail: { rowId: ctx.row?.id ?? ctx.row?._sg_id, row: ctx.row, event: e },
      }));
    });
    return btn;
  };
}

/* ---------- row-number (sequential 1..N) ---------------------------
 *
 * Render the row's 1-based index. Sources the number from `row._sg_idx`
 * when present (the grid's renderer pipeline sets this on every cell
 * call), falling back to walking the DOM for the row's nth-of-type
 * position so it works in any grid even without that hint.
 *
 *   registerRenderer('row-number', renderers.rowNumber());
 *   <th data-header-cell-cell-renderer-value="row-number" ...>#</th>
 */
export function rowNumber({ startAt = 1, padTo = 0 } = {}) {
  return (ctx) => {
    const { td, rowNum } = ctx;
    const base = typeof rowNum === 'number' ? rowNum : startAt;
    const n = base + (startAt - 1);
    if (td) td.classList.add('sg-renderer-rownumber-cell');
    const txt = padTo > 0 ? String(n).padStart(padTo, '0') : String(n);
    return h('span', { class: 'sg-renderer-rownumber' }, document.createTextNode(txt));
  };
}

/* ---------- expand-toggle (master/detail caret) --------------------
 *
 * Standalone chevron renderer. Clicks dispatch `grid:rowToggleExpand`
 * with the row id; expanded/collapsed state is stored on the row as
 * `row._sg_expanded` (truthy = expanded). Mirrors the existing
 * master/detail caret behaviour but as a portable column primitive
 * — use it for tree views, nested lists, "show more" cells. */
export function expandToggle() {
  return (ctx) => {
    const { td, row } = ctx;
    if (td) td.classList.add('sg-renderer-expandtoggle-cell');
    const expanded = !!(row && row._sg_expanded);
    const btn = h('button', {
      type: 'button',
      class: `sg-renderer-expandtoggle${expanded ? ' is-open' : ''}`,
      'aria-label': expanded ? 'Collapse row' : 'Expand row',
      'aria-expanded': expanded ? 'true' : 'false',
    });
    btn.innerHTML = SG_CHEVRON_SVG;
    btn.addEventListener('mousedown', (e) => e.stopPropagation());
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cur = !!(row && row._sg_expanded);
      const next = !cur;
      if (row) row._sg_expanded = next;
      btn.classList.toggle('is-open', next);
      btn.setAttribute('aria-expanded', next ? 'true' : 'false');
      btn.setAttribute('aria-label', next ? 'Collapse row' : 'Expand row');
      const grid = (td || btn).closest('[data-controller~="grid"]');
      if (grid) grid.dispatchEvent(new CustomEvent('grid:rowToggleExpand', {
        bubbles: true,
        detail: { rowId: row?.id ?? row?._sg_id, row, expanded: next },
      }));
    });
    return btn;
  };
}

/* ---------- uuid (short-form + copy) -------------------------------
 *
 * Renders a UUID v4 (or any other 36-char form) as a monospace chip
 * with a "first-segment…last-segment" abbreviation by default. Tooltip
 * shows the full value; click copies it. Use `full: true` for the
 * untruncated form.
 *
 *   registerRenderer('uuid', renderers.uuid({ short: true })); */
const UUID_RE = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;

function shortUuid(v) {
  const s = String(v).toLowerCase();
  if (s.length <= 13) return s;
  return `${s.slice(0, 8)}…${s.slice(-4)}`;
}

export function uuid({ short = true, copy = true } = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-uuid-cell');
    const text = String(value);
    const valid = UUID_RE.test(text);
    const display = (short ? shortUuid(text) : text);
    const wrap = h('span', {
      class: `sg-renderer-uuid${valid ? '' : ' is-invalid'}`,
      title: text,
    });
    wrap.append(h('code', { class: 'sg-renderer-uuid-mono' },
      document.createTextNode(display)));
    if (copy) {
      const btn = h('button', {
        type: 'button',
        class: 'sg-renderer-copyable-btn',
        title: 'Copy',
        'aria-label': 'Copy UUID',
      }, document.createTextNode('⧉'));
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            btn.classList.add('is-copied');
            setTimeout(() => btn.classList.remove('is-copied'), 900);
          });
        }
      });
      wrap.append(btn);
    }
    return wrap;
  };
}

/* ---------- git-sha (commit hash abbreviation) ---------------------
 *
 * Render full or 40-char Git SHA as a 7-character short hash by default.
 * Optional `href` builds a clickable link to the commit (e.g.
 * `https://github.com/foo/bar/commit/{sha}`).
 *
 *   registerRenderer('git-sha', renderers.gitSha({
 *     length: 7,
 *     href: (sha) => `https://github.com/foo/bar/commit/${sha}`,
 *   })); */
const GIT_SHA_RE = /^[0-9a-f]{4,64}$/i;

export function gitSha({ length = 7, href = null, copy = true } = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-gitsha-cell');
    const cfg = td?._sgPickerPalette;       // unused; left for symmetry
    const text = String(value).trim();
    const valid = GIT_SHA_RE.test(text);
    const short = valid ? text.slice(0, length) : text;
    const wrap = h('span', {
      class: `sg-renderer-uuid${valid ? '' : ' is-invalid'}`,
      title: text,
    });
    const inner = href
      ? h('a', { class: 'sg-renderer-uuid-mono', href: typeof href === 'function' ? href(text) : `${href}${text}`, target: '_blank', rel: 'noopener noreferrer' })
      : h('code', { class: 'sg-renderer-uuid-mono' });
    inner.append(document.createTextNode(short));
    wrap.append(inner);
    if (copy) {
      const btn = h('button', {
        type: 'button',
        class: 'sg-renderer-copyable-btn',
        title: 'Copy',
        'aria-label': 'Copy SHA',
      }, document.createTextNode('⧉'));
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            btn.classList.add('is-copied');
            setTimeout(() => btn.classList.remove('is-copied'), 900);
          });
        }
      });
      wrap.append(btn);
    }
    return wrap;
  };
}

/* ---------- mac-address (xx:xx:xx:xx:xx:xx) ------------------------
 *
 * Normalises common forms (xx-xx-xx-xx-xx-xx, xxxxxxxxxxxx, xxxx.xxxx.xxxx)
 * to colon-separated lowercase. Looks up the OUI (first 3 octets) as the
 * tooltip when a vendor lookup is provided.
 *
 *   registerRenderer('mac', renderers.macAddress()); */
const MAC_RE = /^(?:[0-9a-f]{2}[:-]?){5}[0-9a-f]{2}$|^(?:[0-9a-f]{4}\.){2}[0-9a-f]{4}$/i;

export function macAddress({ vendorLookup = null } = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-mac-cell');
    const raw = String(value).trim();
    const valid = MAC_RE.test(raw);
    const hex = raw.replace(/[^0-9a-f]/gi, '').toLowerCase();
    const formatted = hex.length === 12
      ? `${hex.slice(0,2)}:${hex.slice(2,4)}:${hex.slice(4,6)}:${hex.slice(6,8)}:${hex.slice(8,10)}:${hex.slice(10,12)}`
      : raw;
    const oui = hex.slice(0, 6);
    const vendor = typeof vendorLookup === 'function' ? vendorLookup(oui) : null;
    return h('span', {
      class: `sg-renderer-uuid${valid ? '' : ' is-invalid'}`,
      title: vendor ? `${formatted} — ${vendor}` : formatted,
    }, h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(formatted)));
  };
}

/* ---------- license-key (XXXX-XXXX-XXXX-XXXX format) ---------------
 *
 * Normalise a license/serial key into uppercase groups separated by `-`.
 * `groups: 4` default; per-cell config `{ groups, groupLen }` overrides. */
export function licenseKey({ groups = 4, groupLen = 4, mask = false } = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-license-cell');
    const cfg = td?._sgLicCfg || {};
    const g = cfg.groups || groups;
    const gl = cfg.groupLen || groupLen;
    const cleaned = String(value).replace(/[^a-z0-9]/gi, '').toUpperCase();
    const parts = [];
    for (let i = 0; i < cleaned.length; i += gl) parts.push(cleaned.slice(i, i + gl));
    const text = parts.slice(0, g).join('-');
    const displayed = mask
      ? text.split('-').map((p, i) => i === parts.length - 1 ? p : p.replace(/./g, '•')).join('-')
      : text;
    return h('span', { class: 'sg-renderer-uuid', title: text },
      h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(displayed)));
  };
}

/* ---------- vin (Vehicle Identification Number, 17 chars) ----------
 *
 * Renders the 17-character VIN in three semantic blocks: WMI (1-3) +
 * VDS (4-9) + VIS (10-17). Invalid lengths get the .is-invalid tint
 * but still render. */
const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;

export function vin({} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-vin-cell');
    const text = String(value).trim().toUpperCase();
    const valid = VIN_RE.test(text);
    const display = valid ? `${text.slice(0,3)} ${text.slice(3,9)} ${text.slice(9)}` : text;
    return h('span', { class: `sg-renderer-uuid${valid ? '' : ' is-invalid'}`, title: text },
      h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(display)));
  };
}

/* ---------- isbn (10 or 13 digit book identifier) ------------------
 *
 * Renders an ISBN-10 (e.g. 0-306-40615-2) or ISBN-13 (e.g.
 * 978-3-16-148410-0) with conventional hyphenation. */
function formatIsbn13(d) {
  if (d.length !== 13) return d;
  return `${d.slice(0,3)}-${d.slice(3,4)}-${d.slice(4,8)}-${d.slice(8,12)}-${d.slice(12)}`;
}
function formatIsbn10(d) {
  if (d.length !== 10) return d;
  return `${d.slice(0,1)}-${d.slice(1,4)}-${d.slice(4,9)}-${d.slice(9)}`;
}

export function isbn({} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-isbn-cell');
    const text = String(value).replace(/[^\dXx]/g, '');
    let display, valid;
    if (text.length === 13) { display = formatIsbn13(text); valid = /^\d{13}$/.test(text); }
    else if (text.length === 10) { display = formatIsbn10(text); valid = /^\d{9}[\dXx]$/.test(text); }
    else { display = String(value); valid = false; }
    return h('span', { class: `sg-renderer-uuid${valid ? '' : ' is-invalid'}`, title: String(value) },
      h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(display)));
  };
}

/* ---------- html (sanitized HTML preview) --------------------------
 *
 * Limited safe HTML preview — sanitises by serialising/re-parsing
 * through a permissive but explicit allowlist. Handles `<b>`, `<i>`,
 * `<em>`, `<strong>`, `<u>`, `<s>`, `<code>`, `<a>` (http/https/mailto
 * only), `<br>`. Everything else is stripped. */
const HTML_ALLOWED_TAGS = new Set(['B','I','EM','STRONG','U','S','DEL','CODE','A','BR','SPAN']);
function sanitizeHtml(input) {
  const tpl = document.createElement('template');
  tpl.innerHTML = input;
  function walk(node) {
    const kids = Array.from(node.childNodes);
    for (const k of kids) {
      if (k.nodeType === 3) continue; // text
      if (k.nodeType !== 1) { k.remove(); continue; }
      const tag = k.tagName;
      if (!HTML_ALLOWED_TAGS.has(tag)) {
        // Unwrap: replace with its children (so the text survives).
        const txt = document.createTextNode(k.textContent || '');
        k.replaceWith(txt);
        continue;
      }
      // Strip every attribute except href on <a>.
      [...k.attributes].forEach((a) => {
        const name = a.name.toLowerCase();
        if (tag === 'A' && name === 'href') {
          if (!/^(https?:|mailto:)/i.test(a.value)) k.removeAttribute(name);
        } else {
          k.removeAttribute(name);
        }
      });
      if (tag === 'A') {
        k.setAttribute('target', '_blank');
        k.setAttribute('rel', 'noopener noreferrer');
      }
      walk(k);
    }
  }
  walk(tpl.content);
  return tpl.innerHTML;
}

export function html({ editable = false, rows = 8, cols = 60 } = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    if (td) {
      td.classList.add('sg-renderer-html-cell');
      if (editable && !td._sgHtmlBound) {
        td._sgHtmlBound = true;
        td._sgTextareaRows = rows;
        td._sgTextareaCols = cols;
        td.addEventListener('dblclick', (e) => {
          if (e._sgTextareaHandled) return;
          e._sgTextareaHandled = true;
          e.stopPropagation();
          openTextareaEditor(td, ctx);
        });
      }
    }
    if (isBlank(value)) return '';
    const wrap = h('span', { class: 'sg-renderer-html' });
    wrap.innerHTML = sanitizeHtml(String(value));
    return wrap;
  };
}

/* ---------- yaml / xml (mono preview) ------------------------------
 *
 * Plain-text mono preview. We don't lex YAML/XML for syntax highlighting
 * (that pushes past the "no heavy deps" line) — but we do clamp to a
 * fixed height with overflow ellipsis so a 50-line config doesn't
 * blow out the row. */
export function yaml({ maxLines = 4, editable = false, rows = 12, cols = 60 } = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    if (td) {
      td.classList.add('sg-renderer-yaml-cell');
      if (editable && !td._sgYamlBound) {
        td._sgYamlBound = true;
        td._sgTextareaRows = rows;
        td._sgTextareaCols = cols;
        td.addEventListener('dblclick', (e) => {
          if (e._sgTextareaHandled) return;
          e._sgTextareaHandled = true;
          e.stopPropagation();
          openTextareaEditor(td, ctx);
        });
      }
    }
    if (isBlank(value)) return '';
    const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
    const block = h('pre', {
      class: 'sg-renderer-yaml',
      style: `--sg-multiline-lines: ${maxLines};`,
      title: text,
    });
    block.textContent = text;
    return block;
  };
}

export function xml({ maxLines = 4 } = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-xml-cell');
    const text = String(value);
    const block = h('pre', {
      class: 'sg-renderer-yaml',          // share the yaml mono style
      style: `--sg-multiline-lines: ${maxLines};`,
      title: text,
    });
    block.textContent = text;
    return block;
  };
}

/* ---------- autolink (auto-linkify URLs / emails in plain text) ----
 *
 * Turn bare URLs / emails inside plain text into `<a>` links. Safe by
 * design: text is HTML-escaped first, then a regex inserts anchors. */
const AUTOLINK_URL_RE   = /\bhttps?:\/\/[^\s<>"']+/g;
const AUTOLINK_EMAIL_RE = /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g;

export function autolink({} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-autolink-cell');
    let s = mdEscapeHTML(String(value));
    s = s.replace(AUTOLINK_URL_RE, (u) => `<a class="sg-renderer-link" href="${u}" target="_blank" rel="noopener noreferrer">${u}</a>`);
    s = s.replace(AUTOLINK_EMAIL_RE, (e) => `<a class="sg-renderer-link" href="mailto:${e}">${e}</a>`);
    const wrap = h('span', { class: 'sg-renderer-autolink' });
    wrap.innerHTML = s;
    return wrap;
  };
}

/* ---------- redacted (black-bar redaction) -------------------------
 *
 * Render the value as a black bar of approximately the same width.
 * Click to reveal (briefly) — releases mousedown to re-redact. Useful
 * for sensitive PII previews where the operator wants a peek without
 * actually exposing the field. */
export function redacted({
  revealOnHold = true,
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-redacted-cell');
    if (isBlank(value)) return '';
    const text = String(value);
    const bar = h('span', { class: 'sg-renderer-redacted', title: revealOnHold ? 'Hold to reveal' : '' });
    bar.append(h('span', { class: 'sg-renderer-redacted-text', 'aria-hidden': 'true' },
      document.createTextNode(text)));
    if (revealOnHold) {
      bar.addEventListener('mousedown', (e) => { e.stopPropagation(); bar.classList.add('is-revealed'); });
      const off = () => bar.classList.remove('is-revealed');
      document.addEventListener('mouseup', off);
      bar.addEventListener('mouseleave', off);
    }
    return bar;
  };
}

/* ---------- spoiler (click-to-reveal) ------------------------------
 *
 * Like redacted but commits to the revealed state on click — Discord /
 * Reddit pattern. Re-redacting needs a row re-render. */
export function spoiler({} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-spoiler-cell');
    if (isBlank(value)) return '';
    const text = String(value);
    const wrap = h('span', { class: 'sg-renderer-spoiler', title: 'Click to reveal' });
    wrap.append(h('span', { class: 'sg-renderer-spoiler-text', 'aria-hidden': 'true' },
      document.createTextNode(text)));
    wrap.addEventListener('click', (e) => {
      e.stopPropagation();
      wrap.classList.add('is-revealed');
    });
    return wrap;
  };
}

/* ---------- fraction (decimal → fraction display) ------------------
 *
 * Convert a decimal value to its closest fraction at a maximum
 * denominator (default 16). Used for inches, cooking measures, baking. */
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function decimalToFraction(n, maxDenom = 16) {
  if (!Number.isFinite(n)) return null;
  const sign = n < 0 ? '-' : '';
  n = Math.abs(n);
  const whole = Math.floor(n);
  const frac = n - whole;
  if (frac < 1 / (maxDenom * 2)) return `${sign}${whole}`;
  let bestNum = 1, bestDen = 1, bestDiff = Infinity;
  for (let d = 1; d <= maxDenom; d++) {
    const num = Math.round(frac * d);
    const diff = Math.abs(frac - num / d);
    if (diff < bestDiff) { bestNum = num; bestDen = d; bestDiff = diff; }
  }
  if (bestNum === 0) return `${sign}${whole}`;
  if (bestNum === bestDen) return `${sign}${whole + 1}`;
  const g = gcd(bestNum, bestDen);
  const num = bestNum / g, den = bestDen / g;
  return whole === 0 ? `${sign}${num}/${den}` : `${sign}${whole} ${num}/${den}`;
}

export function fraction({ maxDenom = 16 } = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    return decimalToFraction(n, maxDenom) || String(value);
  };
}

/* ---------- scientific (1.23 × 10^6 notation) ----------------------
 *
 * Render a number in scientific notation: 1234567 → "1.23e+6" (default)
 * or "1.23 × 10⁶" (pretty mode). */
const SUPER_DIGITS = ['⁰','¹','²','³','⁴','⁵','⁶','⁷','⁸','⁹'];
function toSuper(n) {
  return String(n).split('').map((c) => c === '-' ? '⁻' : SUPER_DIGITS[Number(c)] || c).join('');
}

export function scientific({
  decimals = 2,
  pretty = true,
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    if (n === 0) return '0';
    const exp = Math.floor(Math.log10(Math.abs(n)));
    const mant = n / Math.pow(10, exp);
    const m = mant.toFixed(decimals);
    if (pretty) return `${m} × 10${toSuper(exp)}`;
    return n.toExponential(decimals);
  };
}

/* ---------- hex / binary / octal -----------------------------------
 *
 * Render an integer in another base. `prefix: true` adds the conventional
 * 0x / 0b / 0o prefix. */
export function radix({
  base = 16,
  prefix = true,
  uppercase = true,
  pad = 0,
} = {}) {
  const PREFIX = { 2: '0b', 8: '0o', 16: '0x' };
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-number');
    if (isBlank(value)) return '';
    const n = Number(value);
    if (!Number.isFinite(n) || !Number.isInteger(n)) return String(value);
    let s = Math.abs(n).toString(base);
    if (uppercase) s = s.toUpperCase();
    if (pad > 0) s = s.padStart(pad, '0');
    if (prefix && PREFIX[base]) s = PREFIX[base] + s;
    return (n < 0 ? '-' : '') + s;
  };
}

/* ---------- percentile (p50 / p95 tag) -----------------------------
 *
 * Show a value with its percentile rank within a population. Pass a
 * `population` array (or a function `population: (row, col) => arr`)
 * for context; the renderer computes percentile rank and renders
 * "n (p47)". Defaults to compact decimals on the percentile. */
export function percentile({
  population = null,
  decimals = 0,
} = {}) {
  return ({ value, row, col, td }) => {
    if (td) td.classList.add('sg-renderer-percentile-cell');
    if (isBlank(value)) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    const pop = typeof population === 'function' ? population(row, col) : population;
    if (!Array.isArray(pop) || pop.length === 0) return String(value);
    const sorted = pop.slice().sort((a, b) => a - b);
    let lower = 0;
    for (const v of sorted) if (v < n) lower++;
    const pct = (lower / sorted.length) * 100;
    const wrap = h('span', { class: 'sg-renderer-percentile' });
    wrap.append(document.createTextNode(String(value)));
    wrap.append(h('span', { class: 'sg-renderer-percentile-tag' },
      document.createTextNode(`p${pct.toFixed(decimals)}`)));
    return wrap;
  };
}

/* ---------- battery (multi-state icon) -----------------------------
 *
 * Visual battery indicator: 0..100 percent → bars. Red below 15%, amber
 * below 35%, green otherwise. */
export function battery({
  showValue = true,
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-battery-cell');
    if (isBlank(value)) return '';
    let n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    n = Math.max(0, Math.min(100, n));
    const color = n < 15 ? '#ef4444' : n < 35 ? '#f59e0b' : '#22c55e';
    const wrap = h('span', { class: 'sg-renderer-battery', title: `${Math.round(n)}%` });
    const ic = h('span', { class: 'sg-renderer-battery-icon', 'aria-hidden': 'true' });
    ic.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 12" width="24" height="12"><rect x="0.5" y="0.5" width="20" height="11" rx="2" fill="none" stroke="#9ca3af"/><rect x="20.5" y="3" width="2.5" height="6" rx="0.5" fill="#9ca3af"/><rect x="2" y="2" width="${(n / 100) * 17}" height="8" fill="${color}"/></svg>`;
    wrap.append(ic);
    if (showValue) wrap.append(h('span', { class: 'sg-renderer-battery-pct' },
      document.createTextNode(`${Math.round(n)}%`)));
    return wrap;
  };
}

/* ---------- signal-bars (0-4 indicator) ----------------------------
 *
 * 4-bar cellular/wifi signal icon. Accepts a 0-100 strength value or a
 * 0-4 bar count. */
export function signalBars({
  bars = 4,
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-signal-cell');
    if (isBlank(value)) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    const active = n <= bars ? Math.round(n) : Math.round((n / 100) * bars);
    const wrap = h('span', { class: 'sg-renderer-signal', title: `${active}/${bars}` });
    for (let i = 1; i <= bars; i++) {
      wrap.append(h('span', {
        class: `sg-renderer-signal-bar${i <= active ? ' is-on' : ''}`,
        style: `height: ${4 + i * 2}px;`,
      }));
    }
    return wrap;
  };
}

/* ---------- volume-indicator (0..100 speaker glyph) ----------------
 *
 * Speaker icon with 0/1/2/3 sound-wave arcs depending on level. Mute
 * (0 or `null`) renders the muted glyph. */
const VOL_BASE = '<path fill="currentColor" d="M3 6v4h3l4 3V3L6 6H3z"/>';
const VOL_W1 = '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M12 6.5q1 1 0 3"/>';
const VOL_W2 = '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M14 5q2 2 0 6"/>';
const VOL_W3 = '<path fill="none" stroke="currentColor" stroke-width="1.4" d="M16 3.5q3 3 0 9"/>';
const VOL_MUTE = '<line x1="13" y1="4" x2="17" y2="9" stroke="currentColor" stroke-width="1.4"/><line x1="17" y1="4" x2="13" y2="9" stroke="currentColor" stroke-width="1.4"/>';

export function volumeIndicator({
  showValue = false,
  editable = false,
} = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    if (td) {
      td.classList.add('sg-renderer-volume-cell');
      if (editable && !td._sgVolumeBound) {
        td._sgVolumeBound = true;
        td.addEventListener('dblclick', (e) => {
          if (e._sgVolumeHandled) return;
          e._sgVolumeHandled = true;
          e.stopPropagation();
          openVolumeEditor(td, ctx);
        });
      }
    }
    if (isBlank(value)) return '';
    let n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    n = Math.max(0, Math.min(100, n));
    let waves = '';
    if (n === 0) waves = VOL_MUTE;
    else if (n < 33)  waves = VOL_W1;
    else if (n < 66)  waves = VOL_W1 + VOL_W2;
    else              waves = VOL_W1 + VOL_W2 + VOL_W3;
    const wrap = h('span', { class: 'sg-renderer-volume', title: `${Math.round(n)}%` });
    const ic = h('span', { class: 'sg-renderer-volume-icon', 'aria-hidden': 'true' });
    ic.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 16" width="20" height="14">${VOL_BASE}${waves}</svg>`;
    wrap.append(ic);
    if (showValue) wrap.append(h('span', { class: 'sg-renderer-volume-pct' },
      document.createTextNode(`${Math.round(n)}%`)));
    return wrap;
  };
}

let activeVolumeEditor = null;
function closeVolumeEditor() {
  if (!activeVolumeEditor) return;
  const { pop, onKey, onDocClick, anchor } = activeVolumeEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeVolumeEditor = null;
  refocusGrid(anchor);
}

function openVolumeEditor(anchor, ctx) {
  closeVolumeEditor();
  const { row, col } = ctx;
  const start = Math.max(0, Math.min(100, Number(row && col?.field != null ? row[col.field] : 0) || 0));

  const pop = h('div', { class: 'sg-renderer-volume-popover', role: 'dialog' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  const slider = h('input', { type: 'range', min: '0', max: '100', step: '1', value: String(start),
    class: 'sg-renderer-volume-slider' });
  const label = h('span', { class: 'sg-renderer-volume-popover-value' },
    document.createTextNode(`${start}%`));
  slider.addEventListener('input', () => { label.textContent = `${slider.value}%`; });

  function commit() {
    const { api } = ctx;
    const next = Number(slider.value);
    const oldValue = row && col?.field != null ? row[col.field] : null;
    if (row && col?.field != null) row[col.field] = next;
    if (api?.applyTransaction) api.applyTransaction({ update: [row] });
    const grid = anchor.closest('[data-controller~="grid"]');
    if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
      bubbles: true,
      detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
    }));
    closeVolumeEditor();
  }

  pop.append(slider, label);

  slider.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); commit(); }
    else if (e.key === 'Escape') { e.stopPropagation(); closeVolumeEditor(); }
  });
  slider.addEventListener('change', commit);

  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); closeVolumeEditor(); } }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeVolumeEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  setTimeout(() => slider.focus(), 0);
  activeVolumeEditor = { pop, onKey, onDocClick, anchor };
}

/* ---------- file (single file + mime-type icon) --------------------
 *
 * Single-file sibling to the multi-file `attachments` renderer. Value
 * is either a string URL, or `{ url, filename?, content_type?, byte_size? }`.
 * Icon is selected from the file extension or MIME prefix; filename
 * is displayed alongside. */
const MIME_ICONS = [
  { match: /^image\//,                           icon: '🖼️' },
  { match: /^audio\//,                           icon: '🎵' },
  { match: /^video\//,                           icon: '🎬' },
  { match: /pdf$/,                               icon: '📕' },
  { match: /(zip|tar|gz|7z|rar)$/,               icon: '🗜️' },
  { match: /(xls|xlsx|csv|sheet)$/,              icon: '📊' },
  { match: /(doc|docx|wordprocessing)$/,         icon: '📄' },
  { match: /(ppt|pptx|presentation)$/,           icon: '📊' },
  { match: /(txt|md|markdown|plain)$/,           icon: '📝' },
  { match: /(js|ts|jsx|tsx|py|rb|go|rs|java|cpp|c|h|html|css|json|yaml|yml|toml)$/, icon: '📜' },
];

function iconForFile(filename, content_type) {
  const mime = String(content_type || '').toLowerCase();
  const ext  = (filename || '').toLowerCase().split('.').pop();
  for (const r of MIME_ICONS) {
    if (mime && r.match.test(mime)) return r.icon;
    if (ext && r.match.test(ext))   return r.icon;
  }
  return '📎';
}

function fmtBytes(n) {
  if (!Number.isFinite(n)) return '';
  const u = ['B', 'KB', 'MB', 'GB', 'TB'];
  let i = 0;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${i === 0 ? n : n.toFixed(1)} ${u[i]}`;
}

function normaliseFile(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'string') return { url: v, filename: v.split('/').pop()?.split('?')[0] || v };
  return {
    url: v.url || v.src || v.href,
    filename: v.filename || v.name || (v.url ? v.url.split('/').pop()?.split('?')[0] : ''),
    content_type: v.content_type || v.contentType || v.mime_type || '',
    byte_size: v.byte_size ?? v.byteSize ?? v.size,
  };
}

export function file({
  showSize = false,
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-file-cell');
    const f = normaliseFile(value);
    if (!f) return '';
    const icon = iconForFile(f.filename, f.content_type);
    const wrap = h('a', {
      class: 'sg-renderer-file',
      href: f.url || '#',
      target: '_blank',
      rel: 'noopener noreferrer',
      title: f.filename,
    });
    wrap.append(h('span', { class: 'sg-renderer-file-icon', 'aria-hidden': 'true' },
      document.createTextNode(icon)));
    wrap.append(h('span', { class: 'sg-renderer-file-name' },
      document.createTextNode(f.filename || 'file')));
    if (showSize && f.byte_size) {
      wrap.append(h('span', { class: 'sg-renderer-file-size' },
        document.createTextNode(fmtBytes(f.byte_size))));
    }
    return wrap;
  };
}

/* ---------- download-link ('Download (1.2 MB)' button) -------------
 *
 * Inline anchor with a download icon + filename + human-readable size. */
const SG_DOWNLOAD_SVG = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1a1 1 0 011 1v6.586l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L7 8.586V2a1 1 0 011-1zm-6 11a1 1 0 011 1v1h10v-1a1 1 0 112 0v2a1 1 0 01-1 1H2a1 1 0 01-1-1v-2a1 1 0 011-1z"/></svg>';

export function downloadLink({
  label = 'Download',
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-download-cell');
    const f = normaliseFile(value);
    if (!f) return '';
    const wrap = h('a', {
      class: 'sg-renderer-link sg-renderer-download',
      href: f.url || '#',
      download: f.filename || '',
      title: f.filename,
    });
    const ic = h('span', { class: 'sg-renderer-download-icon', 'aria-hidden': 'true' });
    ic.innerHTML = SG_DOWNLOAD_SVG;
    wrap.append(ic);
    let labelText = label;
    if (f.byte_size) labelText += ` (${fmtBytes(f.byte_size)})`;
    wrap.append(h('span', {}, document.createTextNode(labelText)));
    return wrap;
  };
}

/* ---------- mime-icon (icon only, no filename) ---------------------
 *
 * Just the emoji glyph, large size. Useful as a gutter column for a
 * file-listing grid where the filename lives elsewhere. */
export function mimeIcon({ size = 18 } = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-mime-icon-cell');
    if (isBlank(value)) return '';
    const f = typeof value === 'object' ? value : { content_type: String(value), filename: String(value) };
    const icon = iconForFile(f.filename, f.content_type);
    return h('span', {
      class: 'sg-renderer-mime-icon',
      style: `font-size: ${size}px;`,
      title: f.content_type || f.filename || '',
    }, document.createTextNode(icon));
  };
}

/* ---------- gallery (multi-image strip / carousel) -----------------
 *
 * Multi-image strip. Distinct from `attachments` (which expects mixed
 * file types and renders kind-tinted chips); `gallery` is purely
 * image-shape: an array of `{ url, alt? }` or just URL strings.
 * Renders up to `max` thumbnails inline with a `+N` chip for overflow. */
export function gallery({
  max = 5,
  thumbSize = 40,
  popoverThumbSize = 96,
} = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    if (td) td.classList.add('sg-renderer-gallery-cell');
    if (isBlank(value)) return '';
    const list = (Array.isArray(value) ? value : [value])
      .map((i) => typeof i === 'string' ? { url: i } : i)
      .filter((i) => i && i.url);
    if (!list.length) return '';
    if (td && !td._sgGalleryBound) {
      td._sgGalleryBound = true;
      td.addEventListener('dblclick', (e) => {
        if (e._sgGalleryHandled) return;
        e._sgGalleryHandled = true;
        e.stopPropagation();
        openGalleryPopover(td, list, popoverThumbSize);
      });
    }
    const wrap = h('span', { class: 'sg-renderer-gallery' });
    const visible = list.slice(0, max);
    for (const img of visible) {
      wrap.append(h('img', {
        src: img.url,
        alt: img.alt || '',
        class: 'sg-renderer-gallery-thumb',
        loading: 'lazy', decoding: 'async',
        style: `width: ${thumbSize}px; height: ${thumbSize}px;`,
      }));
    }
    const overflow = list.length - visible.length;
    if (overflow > 0) {
      wrap.append(h('span', {
        class: 'sg-renderer-gallery-more',
        style: `width: ${thumbSize}px; height: ${thumbSize}px; font-size: ${thumbSize / 3}px;`,
        title: list.slice(max).map((i) => i.alt).filter(Boolean).join(', '),
      }, document.createTextNode(`+${overflow}`)));
    }
    return wrap;
  };
}

let activeGalleryPopover = null;
function closeGalleryPopover() {
  if (!activeGalleryPopover) return;
  const { pop, onKey, onDocClick, anchor } = activeGalleryPopover;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeGalleryPopover = null;
  refocusGrid(anchor);
}

function openGalleryPopover(anchor, list, thumb) {
  closeGalleryPopover();
  const pop = h('div', { class: 'sg-renderer-gallery-popover', role: 'dialog' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());
  for (const img of list) {
    const a = h('a', {
      href: img.url, target: '_blank', rel: 'noopener noreferrer',
      class: 'sg-renderer-gallery-popover-item',
      title: img.alt || img.filename || '',
    });
    a.append(h('img', {
      src: img.url, alt: img.alt || '',
      loading: 'lazy', decoding: 'async',
      style: `width: ${thumb}px; height: ${thumb}px;`,
    }));
    if (img.alt || img.filename) {
      a.append(h('span', { class: 'sg-renderer-gallery-popover-label' },
        document.createTextNode(img.alt || img.filename)));
    }
    pop.append(a);
  }

  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); closeGalleryPopover(); } }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeGalleryPopover();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  activeGalleryPopover = { pop, onKey, onDocClick, anchor };
}

/* ---------- waveform (audio-only viz) ------------------------------
 *
 * Static waveform glyph for audio rows. Expects either an array of
 * normalised amplitudes (0..1) or a URL — when given a URL, renders a
 * "best-effort" deterministic waveform seeded by the URL string so it
 * doesn't need to fetch the audio. */
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) - h) + seed.charCodeAt(i);
  return () => {
    h = (h * 9301 + 49297) % 233280;
    return h / 233280;
  };
}

export function waveform({
  width = 100,
  height = 24,
  bars = 28,
  color = '#3b82f6',
  fill = true,
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-waveform-cell');
    if (isBlank(value)) return '';
    let amps;
    if (Array.isArray(value)) {
      amps = value.map(Number);
    } else {
      const rand = seededRandom(String(value));
      amps = Array.from({ length: bars }, () => 0.2 + rand() * 0.8);
    }
    const n = Math.min(bars, amps.length);
    const barW = width / n;
    const gap  = Math.max(0.6, barW * 0.25);
    let body = '';
    for (let i = 0; i < n; i++) {
      const a = Math.max(0.05, Math.min(1, amps[i]));
      const bh = a * height;
      const x = i * barW + gap / 2;
      const y = (height - bh) / 2;
      body += `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${(barW - gap).toFixed(2)}" height="${bh.toFixed(2)}" rx="0.6" fill="${color}"/>`;
    }
    const wrap = h('span', { class: `sg-renderer-waveform${fill ? ' is-fill' : ''}` });
    const svgW = fill ? '100%' : String(width);
    wrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" width="${svgW}" height="${height}">${body}</svg>`;
    return wrap;
  };
}

/* ---------- favicon (URL + Google s2 favicon thumbnail) ------------
 *
 * Sibling to `url`. Renders a small favicon next to the link text. Uses
 * Google's public s2 service by default — pass `faviconUrl: (host) =>
 * ...` to point at your own proxy. */
export function favicon({
  newTab = true,
  size = 14,
  faviconUrl = (host) => `https://www.google.com/s2/favicons?domain=${host}&sz=64`,
} = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const text = String(value);
    let parsed;
    try { parsed = new URL(text); } catch { return document.createTextNode(text); }
    const wrap = h('a', {
      class: 'sg-renderer-link sg-renderer-favicon',
      href: text,
      target: newTab ? '_blank' : null,
      rel: newTab ? 'noopener noreferrer' : null,
      title: text,
    });
    wrap.append(h('img', {
      src: faviconUrl(parsed.hostname),
      alt: '', width: size, height: size, loading: 'lazy', decoding: 'async',
      class: 'sg-renderer-favicon-img',
    }));
    wrap.append(h('span', { class: 'sg-renderer-favicon-host' },
      document.createTextNode(parsed.hostname + (parsed.pathname !== '/' ? parsed.pathname : ''))));
    return wrap;
  };
}

/* ---------- domain (host-only extract) ------------------------------
 *
 * Show just the hostname (with `www.` optionally stripped). Linkable. */
export function domain({
  stripWww = true,
  link = true,
  newTab = true,
} = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const text = String(value);
    let parsed;
    try { parsed = new URL(/^https?:/.test(text) ? text : `http://${text}`); }
    catch { return document.createTextNode(text); }
    let host = parsed.hostname;
    if (stripWww) host = host.replace(/^www\./, '');
    if (!link) return host;
    return h('a', {
      class: 'sg-renderer-link',
      href: parsed.toString(),
      target: newTab ? '_blank' : null,
      rel: newTab ? 'noopener noreferrer' : null,
      title: text,
    }, document.createTextNode(host));
  };
}

/* ---------- social-link (auto-detect twitter / linkedin / github / etc) */
const SOCIAL_HOSTS = {
  'twitter.com':    { name: 'Twitter',   icon: '𝕏' },
  'x.com':          { name: 'X',         icon: '𝕏' },
  'linkedin.com':   { name: 'LinkedIn',  icon: 'in' },
  'github.com':     { name: 'GitHub',    icon: '⌥' },
  'youtube.com':    { name: 'YouTube',   icon: '▶' },
  'instagram.com':  { name: 'Instagram', icon: '📷' },
  'mastodon.social':{ name: 'Mastodon',  icon: '🐘' },
  'bsky.app':       { name: 'Bluesky',   icon: '☁' },
  'threads.net':    { name: 'Threads',   icon: '@' },
  'tiktok.com':     { name: 'TikTok',    icon: '♪' },
  'reddit.com':     { name: 'Reddit',    icon: 'r' },
  'medium.com':     { name: 'Medium',    icon: 'M' },
  'substack.com':   { name: 'Substack',  icon: 'S' },
};

export function socialLink({} = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const text = String(value);
    let parsed;
    try { parsed = new URL(/^https?:/.test(text) ? text : `https://${text}`); }
    catch { return document.createTextNode(text); }
    const host = parsed.hostname.replace(/^www\./, '');
    const def = SOCIAL_HOSTS[host] || Object.entries(SOCIAL_HOSTS).find(([k]) => host.endsWith(`.${k}`))?.[1];
    const label = parsed.pathname.replace(/^\//, '').split('/')[0] || host;
    const linkText = def ? `@${label}` : (parsed.hostname + parsed.pathname);
    const wrap = h('a', {
      class: 'sg-renderer-link sg-renderer-social',
      href: parsed.toString(),
      target: '_blank',
      rel: 'noopener noreferrer',
      title: `${def?.name || host} — ${text}`,
    });
    if (def) wrap.append(h('span', { class: 'sg-renderer-social-icon', 'aria-hidden': 'true' },
      document.createTextNode(def.icon)));
    wrap.append(h('span', { class: 'sg-renderer-social-label' },
      document.createTextNode(linkText)));
    return wrap;
  };
}

/* ---------- tracking-number (courier-aware) ------------------------
 *
 * Renders a tracking number with carrier badge + a deep-link to the
 * carrier's tracking page. Pattern-matches AusPost / USPS / FedEx /
 * UPS / DHL / Royal Mail; pass `carrier` explicitly when the format
 * isn't unique enough. */
const CARRIERS = {
  auspost:    { name: 'AusPost', re: /^([A-Z]{2}\d{9,12}AU|[A-Z0-9]{12,14})$/, track: (n) => `https://auspost.com.au/mypost/track/#/details/${n}` },
  usps:       { name: 'USPS',    re: /^(94|93|92|94|95)\d{20,22}$/,           track: (n) => `https://tools.usps.com/go/TrackConfirmAction?qtc_tLabels1=${n}` },
  fedex:      { name: 'FedEx',   re: /^(\d{12}|\d{15}|\d{20})$/,              track: (n) => `https://www.fedex.com/fedextrack/?tracknumbers=${n}` },
  ups:        { name: 'UPS',     re: /^1Z[A-Z0-9]{16}$/i,                      track: (n) => `https://www.ups.com/track?tracknum=${n}` },
  dhl:        { name: 'DHL',     re: /^\d{10,11}$/,                            track: (n) => `https://www.dhl.com/au-en/home/tracking/tracking-express.html?submit=1&tracking-id=${n}` },
  royalmail:  { name: 'Royal Mail', re: /^[A-Z]{2}\d{9}GB$/,                   track: (n) => `https://www.royalmail.com/track-your-item#/tracking-results/${n}` },
};

export function trackingNumber({
  carrier = null,
} = {}) {
  return ({ value, row, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-tracking-cell');
    const num = String(value).trim().toUpperCase();
    const carrierKey = (carrier || (row && row.carrier))?.toString().toLowerCase();
    let def = carrierKey ? CARRIERS[carrierKey] : null;
    if (!def) {
      for (const c of Object.values(CARRIERS)) {
        if (c.re.test(num)) { def = c; break; }
      }
    }
    const wrap = h('span', { class: 'sg-renderer-tracking' });
    if (def) {
      wrap.append(h('span', { class: 'sg-pill sg-pill-gray sg-renderer-tracking-carrier' },
        document.createTextNode(def.name)));
      wrap.append(h('a', {
        class: 'sg-renderer-link sg-renderer-uuid-mono',
        href: def.track(num), target: '_blank', rel: 'noopener noreferrer',
      }, document.createTextNode(num)));
    } else {
      wrap.append(h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(num)));
    }
    return wrap;
  };
}

/* ---------- youtube / vimeo (thumb + duration) ---------------------
 *
 * Renders a small thumbnail + title for a YouTube or Vimeo URL. Title
 * comes from `row.title` when present; otherwise the video id. */
function parseVideoUrl(text) {
  try {
    const u = new URL(text);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const v = u.searchParams.get('v');
      if (v) return { provider: 'youtube', id: v };
    }
    if (host === 'youtu.be') {
      const v = u.pathname.slice(1);
      if (v) return { provider: 'youtube', id: v };
    }
    if (host === 'vimeo.com') {
      const v = u.pathname.replace(/^\//, '').split('/')[0];
      if (/^\d+$/.test(v)) return { provider: 'vimeo', id: v };
    }
    return null;
  } catch { return null; }
}

export function videoLink({} = {}) {
  return ({ value, row, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-videolink-cell');
    const parsed = parseVideoUrl(String(value));
    if (!parsed) return h('a', { class: 'sg-renderer-link', href: String(value), target: '_blank', rel: 'noopener noreferrer' },
      document.createTextNode(String(value)));
    const wrap = h('a', {
      class: 'sg-renderer-link sg-renderer-videolink',
      href: String(value), target: '_blank', rel: 'noopener noreferrer',
    });
    const thumbSrc = parsed.provider === 'youtube'
      ? `https://i.ytimg.com/vi/${parsed.id}/default.jpg`
      : null;
    if (thumbSrc) {
      wrap.append(h('img', {
        src: thumbSrc, alt: '',
        class: 'sg-renderer-videolink-thumb',
        loading: 'lazy', decoding: 'async',
      }));
    } else {
      wrap.append(h('span', { class: 'sg-pill sg-pill-blue sg-renderer-videolink-provider' },
        document.createTextNode(parsed.provider === 'vimeo' ? 'Vimeo' : 'YouTube')));
    }
    const title = (row?.title) || parsed.id;
    wrap.append(h('span', { class: 'sg-renderer-videolink-title' },
      document.createTextNode(title)));
    if (row?.duration) {
      wrap.append(h('span', { class: 'sg-renderer-videolink-duration' },
        document.createTextNode(String(row.duration))));
    }
    return wrap;
  };
}

/* ---------- spinner (async loading indicator) ----------------------
 *
 * Renders an inline CSS spinner when the cell value matches the loading
 * sentinel (null / '' / 'loading' / '…'); otherwise renders the value
 * verbatim. Sibling to loadingShimmer but a compact dot/spinner glyph
 * instead of a full-width skeleton block. */
export function spinner({
  size = 12,
  color = '#9ca3af',
  label = 'Loading',
} = {}) {
  return ({ value }) => {
    if (value != null && value !== '' && value !== 'loading' && value !== '…') {
      return String(value);
    }
    return h('span', {
      class: 'sg-renderer-spinner',
      style: `width: ${size}px; height: ${size}px; border-color: ${color}; border-top-color: transparent;`,
      'aria-label': label,
      role: 'progressbar',
    });
  };
}

/* ---------- error-cell (error pill) -------------------------------
 *
 * Renders the value as an error chip — red icon + message + retry
 * affordance. Value can be a string (the message), Error instance, or
 * { message, retry: () => ... }.
 *
 *   <th data-header-cell-cell-renderer-value="error">Status</th>
 */
const ERROR_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 1.5a6.5 6.5 0 110 13 6.5 6.5 0 010-13zm0 3a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0V5.25A.75.75 0 008 4.5zm0 6.5a1 1 0 100 2 1 1 0 000-2z"/></svg>';

export function errorCell({
  icon = ERROR_ICON,
  retryLabel = 'Retry',
} = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-error-cell');
    let message, retry = null;
    if (value instanceof Error) message = value.message;
    else if (typeof value === 'object') { message = value.message || String(value); retry = value.retry; }
    else message = String(value);

    const wrap = h('span', { class: 'sg-renderer-error', title: message });
    const ico = h('span', { class: 'sg-renderer-error-icon', 'aria-hidden': 'true' });
    ico.innerHTML = icon;
    wrap.append(ico);
    wrap.append(h('span', { class: 'sg-renderer-error-msg' }, document.createTextNode(message)));
    if (typeof retry === 'function') {
      const btn = h('button', { type: 'button', class: 'sg-renderer-error-retry' },
        document.createTextNode(retryLabel));
      btn.addEventListener('click', (e) => { e.stopPropagation(); retry(ctx.row, ctx); });
      wrap.append(btn);
    }
    return wrap;
  };
}

/* ---------- sync-status (live sync pill) ---------------------------
 *
 * Display the current sync state of a row/record: synced, syncing,
 * conflict, error, offline. */
const SYNC_STATES = {
  synced:   { color: 'green', icon: '✓', label: 'Synced' },
  syncing:  { color: 'blue',  icon: '↻', label: 'Syncing', spin: true },
  pending:  { color: 'orange', icon: '◔', label: 'Pending' },
  error:    { color: 'red',   icon: '✕', label: 'Sync error' },
  conflict: { color: 'orange', icon: '⚡', label: 'Conflict' },
  offline:  { color: 'gray',  icon: '⌧', label: 'Offline' },
};

export function syncStatus({} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-sync-cell');
    const state = String(value).toLowerCase();
    const def = SYNC_STATES[state] || { color: 'gray', icon: '·', label: String(value) };
    const pill = h('span', { class: `sg-pill sg-pill-${def.color}`, title: def.label });
    pill.append(h('span', {
      class: `sg-renderer-sync-icon${def.spin ? ' is-spinning' : ''}`,
      'aria-hidden': 'true',
    }, document.createTextNode(def.icon)));
    pill.append(h('span', { class: 'sg-pill-label' }, document.createTextNode(def.label)));
    return pill;
  };
}

/* ---------- stale-cell (muted value + 'stale' tag) ----------------
 *
 * Pair with a sibling timestamp column: if the value is older than
 * `threshold` ms (relative to now or `row.as_of`), render it muted and
 * append a "stale" tag.
 *
 *   registerRenderer('stale', renderers.staleCell({
 *     timestampField: 'updated_at',
 *     threshold: 30 * 60 * 1000,    // 30 min
 *   })); */
export function staleCell({
  timestampField = 'updated_at',
  threshold = 60 * 60 * 1000,     // 1 hour
  inner = null,                    // wrap value via this child renderer
} = {}) {
  return (ctx) => {
    const { row, value, td } = ctx;
    if (td) td.classList.add('sg-renderer-stale-cell');
    const ts = row && timestampField ? toDate(row[timestampField]) : null;
    const isStale = ts ? (Date.now() - ts.getTime()) > threshold : false;
    const wrap = h('span', { class: `sg-renderer-stale${isStale ? ' is-stale' : ''}` });
    if (typeof inner === 'function') {
      const res = inner(ctx);
      if (res != null) {
        if (typeof res === 'string') wrap.innerHTML = res;
        else if (res instanceof Node) wrap.append(res);
        else wrap.append(document.createTextNode(String(res)));
      }
    } else {
      wrap.append(document.createTextNode(value == null ? '' : String(value)));
    }
    if (isStale) {
      wrap.append(h('span', { class: 'sg-renderer-stale-tag', title: ts ? `Last updated ${ts.toLocaleString()}` : 'stale' },
        document.createTextNode('stale')));
    }
    return wrap;
  };
}

/* ---------- fresh-cell (just-updated highlight) -------------------
 *
 * Inverse of stale-cell. Adds a brief yellow highlight when the row's
 * timestamp field is within `freshFor` ms of now. The highlight is
 * applied as a CSS class that fades the background out via transition;
 * removing the class after `freshFor` ms means subsequent renders are
 * unhighlighted. */
export function freshCell({
  timestampField = 'updated_at',
  freshFor = 5 * 1000,
  inner = null,
} = {}) {
  return (ctx) => {
    const { row, value, td } = ctx;
    if (td) td.classList.add('sg-renderer-fresh-cell');
    const ts = row && timestampField ? toDate(row[timestampField]) : null;
    const fresh = ts ? (Date.now() - ts.getTime()) < freshFor : false;
    const wrap = h('span', { class: `sg-renderer-fresh${fresh ? ' is-fresh' : ''}` });
    if (typeof inner === 'function') {
      const res = inner(ctx);
      if (res != null) {
        if (typeof res === 'string') wrap.innerHTML = res;
        else if (res instanceof Node) wrap.append(res);
        else wrap.append(document.createTextNode(String(res)));
      }
    } else {
      wrap.append(document.createTextNode(value == null ? '' : String(value)));
    }
    if (fresh && td) {
      setTimeout(() => wrap.classList.remove('is-fresh'), freshFor);
    }
    return wrap;
  };
}

/* ---------- countdown (live-ticking remaining time) ----------------
 *
 * Live "T-minus" ticker against a target time. The cell schedules a
 * 1-second interval to update itself; the interval is cleared if the
 * cell is removed from the DOM (MutationObserver on the parent body).
 *
 *   registerRenderer('expires', renderers.countdown()); */
function fmtCountdown(ms) {
  if (ms <= 0) return 'expired';
  const total = Math.floor(ms / 1000);
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function countdown({
  interval = 1000,
  expiredText = 'expired',
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-countdown-cell');
    if (isBlank(value)) return '';
    const target = toDate(value);
    if (!target) return String(value);
    const span = h('span', { class: 'sg-renderer-countdown', title: target.toLocaleString() });
    const tick = () => {
      const ms = target.getTime() - Date.now();
      span.textContent = ms <= 0 ? expiredText : fmtCountdown(ms);
      span.classList.toggle('is-expired', ms <= 0);
    };
    tick();
    // Self-stopping interval: once the span has been mounted, each tick
    // verifies it's still attached. Avoids leaking timers for cells whose
    // td was replaced by a re-render or scrolled out of a virtual window.
    const id = setInterval(() => {
      if (span.isConnected) tick();
      else clearInterval(id);
    }, interval);
    return span;
  };
}

/* ---------- age (DOB → integer years) ------------------------------
 *
 * Computes age in years from a date-of-birth value against `now()` (or
 * the row's `as_of` field when present). */
export function age({
  asOfField = 'as_of',
  unit = 'years',
} = {}) {
  return ({ value, row, td }) => {
    if (td) td.classList.add('sg-renderer-age-cell');
    if (isBlank(value)) return '';
    const dob = toDate(value);
    if (!dob) return String(value);
    const ref = row && asOfField && row[asOfField] ? toDate(row[asOfField]) || new Date() : new Date();
    const years = ref.getFullYear() - dob.getFullYear() -
      ((ref.getMonth() < dob.getMonth() ||
        (ref.getMonth() === dob.getMonth() && ref.getDate() < dob.getDate())) ? 1 : 0);
    return String(years);
  };
}

/* ---------- fiscal-period (week / quarter / fiscal-year tag) -------
 *
 * Renders a date as the period it belongs to. `unit: 'week' | 'quarter'
 * | 'month' | 'fiscalYear'`. `fiscalStartMonth` (1-12, default 7 for
 * AU FY) controls the fiscal-year boundary. */
function isoWeek(d) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil((((t - yearStart) / 86400000) + 1) / 7);
}

export function fiscalPeriod({
  unit = 'quarter',
  fiscalStartMonth = 7,
  format = null,
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-fiscal-cell');
    if (isBlank(value)) return '';
    const d = toDate(value);
    if (!d) return String(value);
    let display;
    switch (unit) {
      case 'week':
        display = `W${String(isoWeek(d)).padStart(2, '0')} ${d.getFullYear()}`;
        break;
      case 'month':
        display = new Intl.DateTimeFormat(undefined, { month: 'short', year: 'numeric' }).format(d);
        break;
      case 'quarter': {
        const q = Math.floor(d.getMonth() / 3) + 1;
        display = `Q${q} ${d.getFullYear()}`;
        break;
      }
      case 'fiscalYear': {
        const fyStart = fiscalStartMonth - 1;
        const fy = d.getMonth() >= fyStart ? d.getFullYear() + 1 : d.getFullYear();
        display = `FY${String(fy).slice(-2)}`;
        break;
      }
      default:
        display = d.toISOString().slice(0, 10);
    }
    if (typeof format === 'function') display = format(display, d);
    return h('span', { class: 'sg-pill sg-pill-blue' }, document.createTextNode(display));
  };
}

/* ---------- timezone (TZ + offset display) -------------------------
 *
 * Renders an IANA tz name (e.g. `Australia/Sydney`) with its current
 * UTC offset. Pass `withCity: true` to extract the city from the tz
 * string for a friendlier "Sydney (UTC+10)" form. */
function tzOffsetFor(tz, ref = new Date()) {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
    const parts = fmt.formatToParts(ref);
    const off = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    // Normalise to "UTC±H[H][:MM]".
    return off.replace(/^GMT/, 'UTC');
  } catch {
    return '';
  }
}

const COMMON_TIMEZONES = [
  'Pacific/Auckland', 'Pacific/Fiji',
  'Australia/Sydney', 'Australia/Melbourne', 'Australia/Brisbane', 'Australia/Adelaide', 'Australia/Perth',
  'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Kolkata', 'Asia/Dubai',
  'Europe/London', 'Europe/Dublin', 'Europe/Paris', 'Europe/Madrid', 'Europe/Berlin', 'Europe/Rome', 'Europe/Amsterdam',
  'Africa/Johannesburg', 'Africa/Lagos',
  'America/Sao_Paulo', 'America/Argentina/Buenos_Aires',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Phoenix', 'America/Los_Angeles', 'America/Anchorage', 'Pacific/Honolulu',
  'UTC',
];

export function timezone({
  withCity = true,
  editable = false,
  options = null,
} = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    if (td) {
      td.classList.add('sg-renderer-tz-cell');
      if (editable && !td._sgTzBound) {
        td._sgTzBound = true;
        const list = options || COMMON_TIMEZONES;
        td._sgSelectOpts = list.map((tz) => {
          const off = tzOffsetFor(tz);
          const city = tz.split('/').pop().replace(/_/g, ' ');
          return { value: tz, label: `${city} (${off || '?'}) — ${tz}` };
        });
        td._sgSelectClearable = false;
        td.addEventListener('dblclick', (e) => {
          if (e._sgSelectHandled) return;
          e._sgSelectHandled = true;
          e.stopPropagation();
          openSelectEditor(td, ctx);
        });
      }
    }
    if (isBlank(value)) return '';
    const tz = String(value);
    const off = tzOffsetFor(tz);
    const city = withCity ? tz.split('/').pop().replace(/_/g, ' ') : tz;
    const wrap = h('span', { class: 'sg-renderer-tz', title: tz });
    wrap.append(h('span', { class: 'sg-renderer-tz-city' }, document.createTextNode(city)));
    wrap.append(' ');
    wrap.append(h('span', { class: 'sg-renderer-tz-offset' }, document.createTextNode(off ? `(${off})` : '')));
    return wrap;
  };
}

/* ---------- cron (human-readable schedule) -------------------------
 *
 * Translates a 5-field cron string (M H DOM MON DOW) into a one-line
 * human description for common patterns. Falls back to the raw
 * expression in a monospace chip when the pattern isn't recognised. */
function humanCron(expr) {
  const parts = String(expr).trim().split(/\s+/);
  if (parts.length !== 5) return null;
  const [m, h, dom, mon, dow] = parts;
  const everyMin   = m === '*' && h === '*' && dom === '*' && mon === '*' && dow === '*';
  const hourly     = /^\d+$/.test(m) && h === '*' && dom === '*' && mon === '*' && dow === '*';
  const daily      = /^\d+$/.test(m) && /^\d+$/.test(h) && dom === '*' && mon === '*' && dow === '*';
  const everyNHour = m === '0' && /^\*\/\d+$/.test(h) && dom === '*' && mon === '*' && dow === '*';
  const weekly     = /^\d+$/.test(m) && /^\d+$/.test(h) && dom === '*' && mon === '*' && /^[0-6]$/.test(dow);
  const monthly    = /^\d+$/.test(m) && /^\d+$/.test(h) && /^\d+$/.test(dom) && mon === '*' && dow === '*';
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (everyMin)   return 'Every minute';
  if (hourly)     return `Hourly at :${m.padStart(2, '0')}`;
  if (everyNHour) return `Every ${h.split('/')[1]} hours`;
  if (daily)      return `Daily at ${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  if (weekly)     return `Weekly on ${DAYS[Number(dow)]} at ${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  if (monthly)    return `Monthly on day ${dom} at ${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  return null;
}

export function cron({} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-cron-cell');
    if (isBlank(value)) return '';
    const expr = String(value).trim();
    const human = humanCron(expr);
    const wrap = h('span', { class: 'sg-renderer-cron' });
    if (human) {
      wrap.append(h('span', { class: 'sg-renderer-cron-human' }, document.createTextNode(human)));
      wrap.append(h('code', { class: 'sg-renderer-uuid-mono sg-renderer-cron-expr' },
        document.createTextNode(expr)));
    } else {
      wrap.append(h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(expr)));
    }
    wrap.title = expr;
    return wrap;
  };
}

/* ---------- gauge (semicircular KPI dial) --------------------------
 *
 * Half-doughnut "KPI gauge". Same arithmetic as `donut` but only sweeps
 * 180° so the bottom half is empty (the classic speedometer look). Use
 * for goal vs target, capacity %, or any single 0..max metric. */
export function gauge({
  min = 0,
  max = 100,
  width = 56,
  height = 32,
  thickness = 6,
  color = '#3b82f6',
  trackColor = '#e5e7eb',
  showValue = true,
  format = null,
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-gauge-cell');
    if (isBlank(value)) return '';
    let v = Number(value);
    if (!Number.isFinite(v)) return String(value);
    v = Math.max(min, Math.min(max, v));
    const frac = (v - min) / Math.max(1e-9, (max - min));
    const pad = thickness / 2 + 1;
    const cx = width / 2;
    const cy = height - pad;
    const r = Math.min(cx - pad, cy - pad);
    // Arc from left endpoint (angle π) sweeping clockwise (visually) along
    // the TOP semicircle. Split at the apex (cx, cy-r) so the chord is
    // never a diameter — that degenerate case makes SVG flip the arc's
    // visual hemisphere when the partial sweep is short.
    const buildArc = (f) => {
      if (f <= 0) return '';
      const lx = cx - r, ly = cy;             // left endpoint
      const ax = cx,     ay = cy - r;         // apex (top centre)
      if (f >= 1) {
        const rx = cx + r;
        return `M ${lx},${ly} A ${r},${r} 0 0 1 ${ax},${ay} A ${r},${r} 0 0 1 ${rx},${ly}`;
      }
      const ang = Math.PI + Math.PI * f;
      const ex = cx + r * Math.cos(ang);
      const ey = cy + r * Math.sin(ang);
      if (f <= 0.5) return `M ${lx},${ly} A ${r},${r} 0 0 1 ${ex},${ey}`;
      return `M ${lx},${ly} A ${r},${r} 0 0 1 ${ax},${ay} A ${r},${r} 0 0 1 ${ex},${ey}`;
    };
    const bgArc = buildArc(1);
    const fgArc = buildArc(frac);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    bg.setAttribute('d', bgArc);
    bg.setAttribute('stroke', trackColor);
    bg.setAttribute('stroke-width', thickness);
    bg.setAttribute('fill', 'none');
    bg.setAttribute('stroke-linecap', 'round');
    svg.append(bg);
    if (fgArc) {
      const fg = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      fg.setAttribute('d', fgArc);
      fg.setAttribute('stroke', color);
      fg.setAttribute('stroke-width', thickness);
      fg.setAttribute('fill', 'none');
      fg.setAttribute('stroke-linecap', 'round');
      svg.append(fg);
    }
    const wrap = h('span', { class: 'sg-renderer-gauge' });
    wrap.append(svg);
    if (showValue) {
      const fmt = format || ((n) => String(n));
      wrap.append(h('span', { class: 'sg-renderer-gauge-value' },
        document.createTextNode(fmt(v))));
    }
    return wrap;
  };
}

/* ---------- win-loss (Tufte-style binary sparkline) ----------------
 *
 * Bars-above-zero (wins) and bars-below-zero (losses), 1-pixel gap
 * between. Accepts an array of +/-1 (or any truthy/falsy / positive /
 * negative numeric sequence). */
export function winLoss({
  width = 80,
  height = 18,
  winColor = '#22c55e',
  lossColor = '#ef4444',
  drawColor = '#9ca3af',
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-winloss-cell');
    if (isBlank(value)) return '';
    const arr = Array.isArray(value) ? value : String(value).split(',').map((s) => s.trim());
    if (!arr.length) return '';
    const barW = width / arr.length;
    const gap = Math.max(0.5, barW * 0.2);
    const halfH = height / 2;
    let body = '';
    arr.forEach((v, i) => {
      const n = typeof v === 'number' ? v : (v === 'W' || v === 'w' || v === '1' || v === true ? 1 : v === 'L' || v === 'l' || v === '-1' || v === false ? -1 : 0);
      const x = i * barW + gap / 2;
      const bw = barW - gap;
      if (n > 0) {
        body += `<rect x="${x}" y="0" width="${bw}" height="${halfH - 1}" fill="${winColor}"/>`;
      } else if (n < 0) {
        body += `<rect x="${x}" y="${halfH + 1}" width="${bw}" height="${halfH - 1}" fill="${lossColor}"/>`;
      } else {
        // Draw: small centered tick.
        body += `<rect x="${x}" y="${halfH - 0.5}" width="${bw}" height="1" fill="${drawColor}"/>`;
      }
    });
    const wrap = h('span', { class: 'sg-renderer-winloss' });
    wrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>`;
    return wrap;
  };
}

/* ---------- mini-bar-chart (categorical bars) ----------------------
 *
 * Categorical mini bar chart. Distinct from `histogram` (frequency
 * distribution); this one renders an array of `{ label, value }` or a
 * plain number array as individual bars with optional labels. */
export function miniBarChart({
  width = 100,
  height = 24,
  color = '#3b82f6',
  showLabels = false,
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-minibar-cell');
    if (isBlank(value)) return '';
    const entries = Array.isArray(value)
      ? value.map((v) => typeof v === 'object' ? v : { value: Number(v) })
      : [];
    if (!entries.length) return '';
    const vals = entries.map((e) => Number(e.value) || 0);
    const maxV = Math.max(1, ...vals);
    const n = entries.length;
    const barW = width / n;
    const gap = Math.max(1, barW * 0.18);
    let body = '';
    entries.forEach((e, i) => {
      const x = i * barW + gap / 2;
      const bw = barW - gap;
      const v = Number(e.value) || 0;
      const bh = (v / maxV) * height;
      body += `<rect x="${x}" y="${height - bh}" width="${bw}" height="${bh}" fill="${e.color || color}"/>`;
      if (showLabels && e.label) {
        body += `<text x="${x + bw/2}" y="${height - 1}" font-size="7" fill="#fff" text-anchor="middle">${String(e.label).slice(0,3)}</text>`;
      }
    });
    const wrap = h('span', { class: 'sg-renderer-minibar' });
    wrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">${body}</svg>`;
    return wrap;
  };
}

/* ---------- mini-line-chart (multi-series) -------------------------
 *
 * Multi-series mini line chart. Distinct from `sparkline` (single
 * series). Accepts either `[[s1...], [s2...]]` (arrays of series) or
 * `{ series: [{ color, data }, ...] }` for per-series colour. */
export function miniLineChart({
  width = 100,
  height = 24,
  palette = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#ef4444'],
  smooth = false,
  fill = true,
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-miniline-cell');
    if (isBlank(value)) return '';
    let series = [];
    if (Array.isArray(value) && Array.isArray(value[0])) {
      series = value.map((s, i) => ({ color: palette[i % palette.length], data: s }));
    } else if (value && Array.isArray(value.series)) {
      series = value.series.map((s, i) => ({ color: s.color || palette[i % palette.length], data: s.data }));
    } else if (Array.isArray(value)) {
      series = [{ color: palette[0], data: value }];
    }
    if (!series.length) return '';
    const all = series.flatMap((s) => s.data.map(Number).filter(Number.isFinite));
    const max = Math.max(...all);
    const min = Math.min(...all);
    const span = Math.max(1e-9, max - min);
    // Inset by stroke half-width so the polyline doesn't clip at the
    // top (where y=0 for the max sample) or bottom (where y=height for
    // the min sample). preserveAspectRatio="none" stretches the
    // viewBox to the cell size but doesn't affect stroke width, so the
    // inset only needs to account for the unscaled stroke.
    const pad = 1.2;
    const yMax = pad;
    const yMin = height - pad;
    const yRange = yMin - yMax;
    let body = '';
    for (const s of series) {
      const pts = s.data.map((v, i) => {
        const x = (i / Math.max(1, s.data.length - 1)) * width;
        const y = yMin - ((Number(v) - min) / span) * yRange;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      });
      body += `<polyline fill="none" stroke="${s.color}" stroke-width="1.4" stroke-linejoin="round" stroke-linecap="round" points="${pts.join(' ')}"/>`;
    }
    const wrap = h('span', { class: `sg-renderer-miniline${fill ? ' is-fill' : ''}` });
    const svgW = fill ? '100%' : String(width);
    const svgH = String(height);
    wrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" width="${svgW}" height="${svgH}">${body}</svg>`;
    return wrap;
  };
}

/* ---------- trend (arrow + delta% + sparkline combined) -------------
 *
 * Combined primitive: arrow + % delta + tiny sparkline. Expects either
 * a row with separate fields, or an object `{ value, change, series }`.
 * Delta colour: green up / red down / muted flat. */
const TREND_UP   = '<svg viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M6 2l4 6H2z"/></svg>';
const TREND_DOWN = '<svg viewBox="0 0 12 12" aria-hidden="true"><path fill="currentColor" d="M6 10L2 4h8z"/></svg>';
const TREND_FLAT = '<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2" y="5" width="8" height="2" fill="currentColor"/></svg>';

export function trend({
  width = 60,
  height = 16,
  showValue = true,
  format = null,
} = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-trend-cell');
    if (isBlank(value)) return '';
    const v = typeof value === 'object' ? value : { value, change: 0, series: [] };
    const change = Number(v.change ?? 0);
    const dir = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
    const wrap = h('span', { class: `sg-renderer-trend is-${dir}` });
    const icon = h('span', { class: 'sg-renderer-trend-icon', 'aria-hidden': 'true' });
    icon.innerHTML = dir === 'up' ? TREND_UP : dir === 'down' ? TREND_DOWN : TREND_FLAT;
    wrap.append(icon);
    if (showValue) {
      const fmt = format || ((n) => `${n > 0 ? '+' : ''}${Number(n).toFixed(1)}%`);
      wrap.append(h('span', { class: 'sg-renderer-trend-pct' },
        document.createTextNode(fmt(change))));
    }
    if (Array.isArray(v.series) && v.series.length) {
      const max = Math.max(...v.series);
      const min = Math.min(...v.series);
      const span = Math.max(1e-9, max - min);
      const pts = v.series.map((n, i) => {
        const x = (i / Math.max(1, v.series.length - 1)) * width;
        const y = height - ((Number(n) - min) / span) * height;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      }).join(' ');
      const stroke = dir === 'up' ? '#10b981' : dir === 'down' ? '#ef4444' : '#9ca3af';
      const spark = h('span', { class: 'sg-renderer-trend-spark' });
      spark.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}"><polyline fill="none" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round" stroke-linecap="round" points="${pts}"/></svg>`;
      wrap.append(spark);
    }
    return wrap;
  };
}

/* ---------- postal-code (country-aware formatting) -----------------
 *
 * Country-aware postal-code renderer. Pass `country` from a column or
 * per-row via `countryField: 'country'` for sibling-cell lookup. AU
 * pads to 4 digits, US shows 5-or-5+4 zip, UK splits SW1A 1AA into two
 * groups, CA inserts the space between the 3-char halves. */
function formatPostalCode(value, country) {
  const raw = String(value).trim();
  const cc = (country || '').toString().toUpperCase();
  const digits = raw.replace(/\D/g, '');
  switch (cc) {
    case 'AU': case 'AUSTRALIA':
      return digits.length === 4 ? digits : raw;
    case 'US': case 'USA': case 'UNITED STATES':
      if (digits.length === 5) return digits;
      if (digits.length === 9) return `${digits.slice(0,5)}-${digits.slice(5)}`;
      return raw;
    case 'CA': case 'CANADA': {
      const t = raw.replace(/\s+/g, '').toUpperCase();
      return /^[A-Z]\d[A-Z]\d[A-Z]\d$/.test(t) ? `${t.slice(0,3)} ${t.slice(3)}` : raw;
    }
    case 'GB': case 'UK': case 'UNITED KINGDOM': {
      const t = raw.replace(/\s+/g, '').toUpperCase();
      const m = /^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/.exec(t);
      return m ? `${m[1]} ${m[2]}` : raw;
    }
    default:
      return raw;
  }
}

export function postalCode({
  country = null,
  countryField = 'country',
} = {}) {
  return ({ value, row, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-postal-cell');
    const cc = country || (row && countryField ? row[countryField] : null);
    const display = formatPostalCode(value, cc);
    return h('span', { class: 'sg-renderer-uuid', title: display },
      h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(display)));
  };
}

/* ---------- address-us (US address renderer) ------------------------
 *
 * Mirror of address-au but without the heavy popover editor — display
 * only, with the conventional two-line "Street / City, ST ZIP" layout.
 * Value can be a string (rendered verbatim) or an object with
 * `street`, `street2`, `city`, `state`, `zip`. */
let activeAddressUsEditor = null;

function closeAddressUsEditor() {
  if (!activeAddressUsEditor) return;
  const { pop, onKey, onDocClick, anchor } = activeAddressUsEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeAddressUsEditor = null;
  refocusGrid(anchor);
}

function openAddressUsEditor(anchor, ctx) {
  closeAddressUsEditor();
  const { row, col } = ctx;
  const start = row && col?.field != null ? row[col.field] : null;
  let seed = { street: '', street2: '', city: '', state: '', zip: '' };
  if (start && typeof start === 'object') {
    seed = {
      street:  start.street  || start.address1 || '',
      street2: start.street2 || start.address2 || '',
      city:    start.city    || '',
      state:   (start.state  || '').toUpperCase(),
      zip:     start.zip     || start.postcode || start.postal_code || '',
    };
  } else if (typeof start === 'string' && start.trim()) {
    seed.street = start.trim();
  }

  const pop = h('div', { class: 'sg-renderer-address-popover', role: 'dialog' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  const mkField = (label, key, opts = {}) => {
    const wrap = h('label', { class: 'sg-renderer-address-field' });
    wrap.append(h('span', { class: 'sg-renderer-address-label' }, document.createTextNode(label)));
    const input = h('input', { type: 'text', class: 'sg-renderer-address-input', ...opts });
    input.value = seed[key] || '';
    input.dataset.key = key;
    wrap.append(input);
    return { wrap, input };
  };

  const street  = mkField('Street',   'street');
  const street2 = mkField('Apt/Ste',  'street2');
  const city    = mkField('City',     'city');
  const state   = mkField('State',    'state', { maxlength: 2 });
  const zip     = mkField('ZIP',      'zip',   { maxlength: 10 });

  const row1 = h('div', { class: 'sg-renderer-address-row' });
  row1.append(street.wrap);
  const row2 = h('div', { class: 'sg-renderer-address-row' });
  row2.append(street2.wrap);
  const row3 = h('div', { class: 'sg-renderer-address-row sg-renderer-address-row-3' });
  row3.append(city.wrap, state.wrap, zip.wrap);

  function commit() {
    const { api } = ctx;
    const next = {
      street:  street.input.value.trim(),
      street2: street2.input.value.trim(),
      city:    city.input.value.trim(),
      state:   state.input.value.trim().toUpperCase(),
      zip:     zip.input.value.trim(),
    };
    if (!next.street2) delete next.street2;
    const oldValue = row && col?.field != null ? row[col.field] : null;
    if (row && col?.field != null) row[col.field] = next;
    if (api?.applyTransaction) api.applyTransaction({ update: [row] });
    const grid = anchor.closest('[data-controller~="grid"]');
    if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
      bubbles: true,
      detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
    }));
    closeAddressUsEditor();
  }

  const footer = h('div', { class: 'sg-renderer-textarea-footer' });
  const hint   = h('span', { class: 'sg-renderer-textarea-hint' },
    document.createTextNode('Enter to save · Esc to cancel'));
  const cancel = h('button', { type: 'button', class: 'sg-renderer-timepicker-cancel' },
    document.createTextNode('Cancel'));
  const save   = h('button', { type: 'button', class: 'sg-renderer-timepicker-ok' },
    document.createTextNode('Save'));
  cancel.addEventListener('click', () => closeAddressUsEditor());
  save.addEventListener('click', commit);
  footer.append(hint, cancel, save);

  pop.append(row1, row2, row3, footer);

  pop.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault();
      commit();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      closeAddressUsEditor();
    }
  });

  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); closeAddressUsEditor(); } }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeAddressUsEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  setTimeout(() => street.input.focus(), 0);
  activeAddressUsEditor = { pop, onKey, onDocClick, anchor };
}

function normaliseAddressUs(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'string') return { _raw: value.trim() };
  if (typeof value !== 'object') return null;
  return {
    street: value.street || value.address1 || '',
    street2: value.street2 || value.address2 || '',
    city: value.city || '',
    state: (value.state || '').toUpperCase(),
    zip: value.zip || value.postcode || value.postal_code || '',
  };
}

export function addressUs({ empty = '', editable = false } = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    if (td) {
      td.classList.add('sg-renderer-address-cell');
      if (editable && !td._sgAddrBound) {
        td._sgAddrBound = true;
        td._sgTextareaRows = 6;
        td._sgTextareaCols = 36;
        td.addEventListener('dblclick', (e) => {
          if (e._sgTextareaHandled) return;
          e._sgTextareaHandled = true;
          e.stopPropagation();
          openAddressUsEditor(td, ctx);
        });
      }
    }
    const a = normaliseAddressUs(value);
    if (!a) return empty;
    if (a._raw) {
      return h('span', { class: 'sg-renderer-address' }, document.createTextNode(a._raw));
    }
    const wrap = h('div', { class: 'sg-renderer-address sg-renderer-address-us' });
    const street = [a.street, a.street2].filter(Boolean).join(', ');
    if (street) wrap.append(h('span', { class: 'sg-address-line' }, document.createTextNode(street)));
    const tail = [a.city, a.state].filter(Boolean).join(', ') + (a.zip ? ` ${a.zip}` : '');
    if (tail.trim()) {
      if (street) wrap.append(h('span', { class: 'sg-address-sep' }, document.createTextNode(' · ')));
      wrap.append(h('span', { class: 'sg-address-line' }, document.createTextNode(tail.trim())));
    }
    return wrap;
  };
}

/* ---------- address-generic (any-country plain renderer) ------------
 *
 * Renders a `{ line1, line2, city, region, postal_code, country }` shape
 * into a single-line address with sensible separators. Falls back to a
 * verbatim string when given one. */
function normaliseAddressGeneric(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'string') return { _raw: v.trim() };
  if (typeof v !== 'object') return null;
  return {
    line1: v.line1 || v.address1 || v.street || '',
    line2: v.line2 || v.address2 || v.street2 || '',
    city:  v.city || '',
    region: v.region || v.state || '',
    postal_code: v.postal_code || v.postcode || v.zip || '',
    country: v.country || '',
  };
}

export function addressGeneric({ empty = '', multiline = false } = {}) {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-address-cell');
    const a = normaliseAddressGeneric(value);
    if (!a) return empty;
    if (a._raw) return h('span', { class: 'sg-renderer-address' }, document.createTextNode(a._raw));
    const lines = [];
    if (a.line1) lines.push(a.line1);
    if (a.line2) lines.push(a.line2);
    const tail = [a.city, a.region, a.postal_code].filter(Boolean).join(' ');
    if (tail) lines.push(tail);
    if (a.country) lines.push(a.country);
    if (multiline) {
      const wrap = h('div', { class: 'sg-renderer-address sg-renderer-address-multi' });
      lines.forEach((l, i) => {
        if (i > 0) wrap.append(h('br'));
        wrap.append(document.createTextNode(l));
      });
      return wrap;
    }
    return h('span', { class: 'sg-renderer-address' },
      document.createTextNode(lines.join(' · ')));
  };
}

/* ---------- barcode (Code-128 inline SVG) ---------------------------
 *
 * Renders an inline Code-128 barcode for short alphanumeric strings.
 * Implements only Code-128B (printable ASCII 32-126) — covers the
 * common SKU / serial / tracking-id case without a heavy dep. For
 * EAN-13 / UPC etc., use a dedicated lib. */
const CODE128_PATTERNS = [
  '11011001100','11001101100','11001100110','10010011000','10010001100',
  '10001001100','10011001000','10011000100','10001100100','11001001000',
  '11001000100','11000100100','10110011100','10011011100','10011001110',
  '10111001100','10011101100','10011100110','11001110010','11001011100',
  '11001001110','11011100100','11001110100','11101101110','11101001100',
  '11100101100','11100100110','11101100100','11100110100','11100110010',
  '11011011000','11011000110','11000110110','10100011000','10001011000',
  '10001000110','10110001000','10001101000','10001100010','11010001000',
  '11000101000','11000100010','10110111000','10110001110','10001101110',
  '10111011000','10111000110','10001110110','11101110110','11010001110',
  '11000101110','11011101000','11011100010','11011101110','11101011000',
  '11101000110','11100010110','11101101000','11101100010','11100011010',
  '11101111010','11001000010','11110001010','10100110000','10100001100',
  '10010110000','10010000110','10000101100','10000100110','10110010000',
  '10110000100','10011010000','10011000010','10000110100','10000110010',
  '11000010010','11001010000','11110111010','11000010100','10001111010',
  '10100111100','10010111100','10010011110','10111100100','10011110100',
  '10011110010','11110100100','11110010100','11110010010','11011011110',
  '11011110110','11110110110','10101111000','10100011110','10001011110',
  '10111101000','10111100010','11110101000','11110100010','10111011110',
  '10111101110','11101011110','11110101110','11010000100','11010010000',
  '11010011100',
];
const CODE128B_OFFSET = 32; // ASCII 32 (' ') = pattern index 0 in Code-128 B
const CODE128_START_B  = 104;
const CODE128_STOP     = 106;

function code128Patterns(text) {
  const codes = [CODE128_START_B];
  let checksum = CODE128_START_B;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code < 32 || code > 126) continue;     // skip non-printable
    const val = code - CODE128B_OFFSET;
    codes.push(val);
    checksum += val * (i + 1);
  }
  codes.push(checksum % 103);
  codes.push(CODE128_STOP);
  return codes.map((c) => CODE128_PATTERNS[c]).join('') + '11';
}

export function barcode({
  height = 32,
  showText = true,
  moduleWidth = 1.4,
} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-barcode-cell');
    const text = String(value);
    const bits = code128Patterns(text);
    const width = bits.length * moduleWidth;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-label="barcode ${text}">`;
    let x = 0;
    let body = '';
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] === '1') {
        body += `<rect x="${x}" y="0" width="${moduleWidth}" height="${height}" fill="currentColor"/>`;
      }
      x += moduleWidth;
    }
    const wrap = h('span', { class: 'sg-renderer-barcode', title: text });
    wrap.innerHTML = `${svg}${body}</svg>`;
    if (showText) {
      wrap.append(h('span', { class: 'sg-renderer-barcode-text' },
        document.createTextNode(text)));
    }
    return wrap;
  };
}

/* ---------- iban (International Bank Account Number) ---------------
 *
 * Renders IBAN in standard 4-char groups (e.g. "GB29 NWBK 6016 1331
 * 9268 19"). Country prefix (first 2 letters) gets a soft tint and the
 * tooltip resolves to the country's full name when known. */
const IBAN_COUNTRIES = {
  AT: 'Austria', AU: 'Australia', BE: 'Belgium', CH: 'Switzerland',
  DE: 'Germany', DK: 'Denmark', ES: 'Spain', FI: 'Finland', FR: 'France',
  GB: 'United Kingdom', IE: 'Ireland', IT: 'Italy', NL: 'Netherlands',
  NO: 'Norway', NZ: 'New Zealand', PT: 'Portugal', SE: 'Sweden', US: 'United States',
};

export function iban({} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-iban-cell');
    const text = String(value).replace(/\s+/g, '').toUpperCase();
    const valid = /^[A-Z]{2}\d{2}[A-Z0-9]{1,30}$/.test(text);
    const grouped = text.match(/.{1,4}/g)?.join(' ') || text;
    const cc = text.slice(0, 2);
    const country = IBAN_COUNTRIES[cc];
    return h('span', { class: `sg-renderer-uuid${valid ? '' : ' is-invalid'}`, title: country ? `${grouped} — ${country}` : grouped },
      h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(grouped)));
  };
}

/* ---------- swift / bic (8 or 11 char bank code) -------------------
 *
 * Renders an ISO 9362 SWIFT/BIC code as bank(4) country(2) location(2) +
 * optional branch(3). Country code tooltip when known. */
export function swift({} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-swift-cell');
    const text = String(value).replace(/\s+/g, '').toUpperCase();
    const valid = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(text);
    let display;
    if (valid) {
      display = text.length === 8
        ? `${text.slice(0,4)} ${text.slice(4,6)} ${text.slice(6,8)}`
        : `${text.slice(0,4)} ${text.slice(4,6)} ${text.slice(6,8)} ${text.slice(8,11)}`;
    } else {
      display = text;
    }
    const cc = text.slice(4, 6);
    const country = IBAN_COUNTRIES[cc];
    return h('span', { class: `sg-renderer-uuid${valid ? '' : ' is-invalid'}`, title: country ? `${display} — ${country}` : display },
      h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(display)));
  };
}

/* ---------- ssn (US Social Security Number, always masked) ----------
 *
 * Mirrors the TFN renderer's behaviour for the US. Displays the
 * trailing 4 digits with leading digits masked: `•••-••-1234`. */
export function ssn({} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-mask-numeric');
    const digits = String(value).replace(/\D/g, '');
    if (digits.length !== 9) {
      return h('span', { class: 'sg-renderer-uuid is-invalid' },
        h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(String(value))));
    }
    const masked = `•••-••-${digits.slice(5)}`;
    return h('span', { class: 'sg-renderer-uuid', title: 'SSN (masked)' },
      h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(masked)));
  };
}

/* ---------- ein (US Employer Identification Number) ----------------
 *
 * 9-digit US tax ID rendered as XX-XXXXXXX. */
export function ein({} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-ein-cell');
    const digits = String(value).replace(/\D/g, '');
    const valid = digits.length === 9;
    const display = valid ? `${digits.slice(0,2)}-${digits.slice(2)}` : String(value);
    return h('span', { class: `sg-renderer-uuid${valid ? '' : ' is-invalid'}`, title: display },
      h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(display)));
  };
}

/* ---------- vat (EU VAT number) -------------------------------------
 *
 * 2-letter country prefix + national VAT digits. Country tooltip when
 * known. */
export function vat({} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-vat-cell');
    const text = String(value).replace(/\s+/g, '').toUpperCase();
    const valid = /^[A-Z]{2}[A-Z0-9]{2,15}$/.test(text);
    const cc = text.slice(0, 2);
    const country = IBAN_COUNTRIES[cc];
    return h('span', { class: `sg-renderer-uuid${valid ? '' : ' is-invalid'}`, title: country ? `${text} — ${country}` : text },
      h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(text)));
  };
}

/* ---------- nin (UK National Insurance Number) ---------------------
 *
 * 9-character UK NIN — 2 letters, 6 digits, 1 letter (A-D). Formatted
 * as "AB 12 34 56 C". */
const NIN_RE = /^[A-CEGHJ-PR-TW-Z][A-CEGHJ-NPR-TW-Z]\d{6}[A-D]$/i;

export function nin({} = {}) {
  return ({ value, td }) => {
    if (isBlank(value)) return '';
    if (td) td.classList.add('sg-renderer-nin-cell');
    const text = String(value).replace(/\s+/g, '').toUpperCase();
    const valid = NIN_RE.test(text);
    const display = valid
      ? `${text.slice(0,2)} ${text.slice(2,4)} ${text.slice(4,6)} ${text.slice(6,8)} ${text.slice(8)}`
      : text;
    return h('span', { class: `sg-renderer-uuid${valid ? '' : ' is-invalid'}`, title: text },
      h('code', { class: 'sg-renderer-uuid-mono' }, document.createTextNode(display)));
  };
}

/* ---------- avatar-stack (overlapping avatars + overflow counter) ---
 *
 * Linear / Jira / GitHub-style overlapping avatar pile with a `+N`
 * counter when the list exceeds `max`. Each entry can be a string (used
 * as both initials seed + tooltip) or an object `{ name, avatar, url,
 * color }`.
 *
 *   registerRenderer('contributors', renderers.avatarStack({ max: 4 }));
 *
 * Initials fall back to the first letter of each space-separated name
 * part (up to 2 letters). A deterministic palette tints initials avatars
 * so the same name always gets the same colour. */
const AVATAR_PALETTE = ['#ef4444', '#f97316', '#f59e0b', '#22c55e',
                        '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
                        '#ec4899', '#14b8a6'];

function hashName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) - h) + name.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function initialsFromName(name) {
  return String(name || '').split(/\s+/).filter(Boolean).slice(0, 2)
    .map((w) => (w[0] || '').toUpperCase()).join('') || '?';
}

function buildAvatarChip(person, size = 24) {
  const wrap = h('span', {
    class: 'sg-renderer-avatar-stack-chip',
    style: `width: ${size}px; height: ${size}px; font-size: ${Math.round(size * 0.42)}px;`,
    title: person.name || person.label || '',
  });
  if (person.avatar) {
    wrap.append(h('img', { src: person.avatar, alt: '', loading: 'lazy', decoding: 'async' }));
  } else {
    const seed = person.name || person.label || '?';
    const color = person.color || AVATAR_PALETTE[hashName(seed) % AVATAR_PALETTE.length];
    wrap.style.background = color;
    wrap.append(h('span', { class: 'sg-renderer-avatar-stack-initials' },
      document.createTextNode(initialsFromName(seed))));
  }
  return wrap;
}

export function avatarStack({
  max = 4,
  size = 24,
  showOverflow = true,
} = {}) {
  return (ctx) => {
    const { value } = ctx;
    const cfg = ctx?.col?.cellRendererConfig || {};
    const mx = cfg.max ?? max;
    const sz = cfg.size ?? size;
    const sh = cfg.showOverflow ?? showOverflow;
    if (isBlank(value)) return '';
    const list = (Array.isArray(value) ? value : String(value).split(','))
      .map((p) => typeof p === 'string' ? { name: p.trim() } : p)
      .filter((p) => p && (p.name || p.avatar));
    if (!list.length) return '';
    const visible = list.slice(0, mx);
    const overflow = list.length - visible.length;
    const wrap = h('span', { class: 'sg-renderer-avatar-stack' });
    for (const p of visible) wrap.append(buildAvatarChip(p, sz));
    if (sh && overflow > 0) {
      wrap.append(h('span', {
        class: 'sg-renderer-avatar-stack-chip is-overflow',
        style: `width: ${sz}px; height: ${sz}px; font-size: ${Math.round(sz * 0.36)}px;`,
        title: list.slice(mx).map((p) => p.name).filter(Boolean).join(', '),
      }, document.createTextNode(`+${overflow}`)));
    }
    return wrap;
  };
}

/* ---------- presence (online / away / offline dot) ------------------
 *
 * Coloured circular dot for live presence state. Accepts:
 *   - 'online' | 'away' | 'offline' | 'dnd' | 'busy' | 'invisible'
 *   - boolean (true = online, false = offline)
 *   - object { status: '...', label?: '...' }
 *
 *   registerRenderer('presence', renderers.presence({ showLabel: true })); */
const PRESENCE_STATES = {
  online:    { color: '#22c55e', label: 'Online' },
  away:      { color: '#f59e0b', label: 'Away' },
  busy:      { color: '#ef4444', label: 'Busy' },
  dnd:       { color: '#ef4444', label: 'Do not disturb' },
  offline:   { color: '#9ca3af', label: 'Offline' },
  invisible: { color: 'transparent', label: 'Invisible' },
};

export function presence({
  showLabel = false,
  size = 8,
} = {}) {
  return (ctx) => {
    const { value } = ctx;
    const cfg = ctx?.col?.cellRendererConfig || {};
    const sl = cfg.showLabel ?? showLabel;
    const sz = cfg.size ?? size;
    if (value == null || value === '') return '';
    let state = null;
    if (value === true)        state = 'online';
    else if (value === false)  state = 'offline';
    else if (typeof value === 'object') state = value.status || value.state;
    else state = String(value).toLowerCase();
    const def = PRESENCE_STATES[state] || PRESENCE_STATES.offline;
    const label = (typeof value === 'object' ? (value.label || def.label) : def.label);
    const wrap = h('span', { class: 'sg-renderer-presence', title: label });
    wrap.append(h('span', {
      class: `sg-renderer-presence-dot is-${state}`,
      style: `width: ${sz}px; height: ${sz}px; background: ${def.color}; ${def.color === 'transparent' ? 'border: 1px solid #9ca3af;' : ''}`,
      'aria-hidden': 'true',
    }));
    if (sl) {
      wrap.append(h('span', { class: 'sg-renderer-presence-label' },
        document.createTextNode(label)));
    }
    return wrap;
  };
}

/* ---------- assignee (avatar + name + status combined) -------------
 *
 * Single-cell combined "who's on this" primitive. Avatar (with initials
 * fallback) + name + presence dot. Accepts:
 *   { name, avatar?, url?, presence? }
 *   "Just a Name"  (initials-only avatar, no presence)
 *
 *   registerRenderer('assignee', renderers.assignee({ showPresence: true })); */
export function assignee({
  showPresence = true,
  showAvatar = true,
  size = 20,
  editable = false,
  options = null,
  clearable = true,
} = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    const cfg = ctx?.col?.cellRendererConfig || {};
    const sp = cfg.showPresence ?? showPresence;
    const sa = cfg.showAvatar ?? showAvatar;
    const sz = cfg.size ?? size;
    const ed = cfg.editable ?? editable;
    const opts = cfg.options ?? options;
    const clr = cfg.clearable ?? clearable;
    if (td && ed && !td._sgAssigneeBound) {
      td._sgAssigneeBound = true;
      td._sgAssigneeOpts = opts || [];
      td._sgAssigneeClearable = clr;
      td.addEventListener('dblclick', (e) => {
        if (e._sgAssigneeHandled) return;
        e._sgAssigneeHandled = true;
        e.stopPropagation();
        openAssigneeEditor(td, ctx);
      });
    }
    if (isBlank(value)) return h('span', { class: 'sg-renderer-assignee-empty' },
      document.createTextNode('Unassigned'));
    const person = typeof value === 'string' ? { name: value } : value;
    const name = person.name || person.label || '';
    if (!name && !person.avatar) return '';
    const wrap = h('span', { class: 'sg-renderer-assignee' });
    if (sa) wrap.append(buildAvatarChip(person, sz));
    const text = h('span', { class: 'sg-renderer-assignee-name' },
      document.createTextNode(name));
    if (sp && person.presence) {
      const state = String(person.presence).toLowerCase();
      const def = PRESENCE_STATES[state] || PRESENCE_STATES.offline;
      text.prepend(h('span', {
        class: `sg-renderer-presence-dot is-${state}`,
        style: `width: 7px; height: 7px; background: ${def.color}; margin-right: 6px; ${def.color === 'transparent' ? 'border: 1px solid #9ca3af;' : ''}`,
        'aria-hidden': 'true',
        title: def.label,
      }));
    }
    wrap.append(text);
    return wrap;
  };
}

let activeAssigneeEditor = null;

function closeAssigneeEditor() {
  if (!activeAssigneeEditor) return;
  const { pop, onKey, onDocClick, anchor } = activeAssigneeEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeAssigneeEditor = null;
  refocusGrid(anchor);
}

function openAssigneeEditor(anchor, ctx) {
  closeAssigneeEditor();
  const opts = anchor._sgAssigneeOpts || [];
  const clearable = anchor._sgAssigneeClearable;
  const { row, col } = ctx;
  const current = row && col?.field != null ? row[col.field] : null;
  const currentName = (typeof current === 'string' ? current : current?.name) || '';

  const pop = h('div', { class: 'sg-renderer-assignee-popover', role: 'listbox' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  function commit(next) {
    const { api } = ctx;
    const oldValue = row && col?.field != null ? row[col.field] : null;
    if (row && col?.field != null) row[col.field] = next;
    if (api?.applyTransaction) api.applyTransaction({ update: [row] });
    const grid = anchor.closest('[data-controller~="grid"]');
    if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
      bubbles: true,
      detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
    }));
    closeAssigneeEditor();
  }

  if (clearable) {
    const none = h('button', { type: 'button', class: 'sg-renderer-assignee-option sg-renderer-assignee-option-none', role: 'option' },
      document.createTextNode('Unassigned'));
    none.addEventListener('click', () => commit(null));
    pop.append(none);
  }

  if (!opts.length) {
    const empty = h('div', { class: 'sg-renderer-assignee-option-empty' },
      document.createTextNode('No people configured'));
    pop.append(empty);
  }

  for (const person of opts) {
    const p = typeof person === 'string' ? { name: person } : person;
    const btn = h('button', {
      type: 'button',
      class: `sg-renderer-assignee-option${p.name === currentName ? ' is-selected' : ''}`,
      role: 'option',
    });
    btn.append(buildAvatarChip(p, 20));
    btn.append(h('span', { class: 'sg-renderer-assignee-option-name' },
      document.createTextNode(p.name || p.label || '')));
    btn.addEventListener('click', () => commit(p));
    pop.append(btn);
  }

  function onKey(e) { if (e.key === 'Escape') { e.stopPropagation(); closeAssigneeEditor(); } }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeAssigneeEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  activeAssigneeEditor = { pop, onKey, onDocClick, anchor };
}

/* ---------- slider (inline range input) ----------------------------
 *
 * Cell renders as a horizontal range track with a value bubble at the
 * far right. Drag the thumb to change the value live; releasing commits
 * via grid:cellValueChanged. Use for numeric columns where a precise
 * decimal isn't important but a sense of "how full" matters — volume,
 * confidence, satisfaction, allocation %.
 *
 *   registerRenderer('confidence', renderers.slider({
 *     min: 0, max: 100, step: 5, format: (v) => `${v}%`,
 *   }));
 *
 * Range mode (`range: true`) accepts a `[low, high]` array value and
 * renders two thumbs. Per-cell config (`cellRendererConfig: { min, max,
 * step, range }`) honoured for Rails-driven columns. */
export function slider({
  min = 0,
  max = 100,
  step = 1,
  format = null,
  color = '#3b82f6',
  editable = true,
  range = false,
  showValue = true,
} = {}) {
  return (ctx) => {
    const { value, row, col, api, td } = ctx;
    const cfg = ctx?.col?.cellRendererConfig || {};
    const lo = cfg.min ?? min;
    const hi = cfg.max ?? max;
    const sp = cfg.step ?? step;
    const isRange = cfg.range ?? range;
    const fmt = format || ((v) => String(v));
    const show = cfg.showValue ?? showValue;
    const accent = cfg.color || color;
    const ed = cfg.editable ?? editable;

    if (td) td.classList.add('sg-renderer-slider-cell');

    if (isBlank(value) && !isRange) {
      return h('span', { class: 'sg-renderer-slider-placeholder' },
        document.createTextNode('—'));
    }

    const wrap = h('div', { class: 'sg-renderer-slider' });

    function dispatch(next) {
      const oldValue = row && col?.field != null ? row[col.field] : null;
      if (row && col?.field != null) row[col.field] = next;
      if (api?.applyTransaction) api.applyTransaction({ update: [row] });
      const grid = td?.closest('[data-controller~="grid"]');
      if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
        bubbles: true,
        detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
      }));
    }

    if (isRange) {
      // Custom track + two transparent native inputs overlaid: the native
      // accent-color treatment fills from min to value, which produces a
      // confusing double-paint when two range inputs share a stack. We
      // hide the native tracks entirely and paint our own fill between
      // the low and high thumbs.
      const [a, b] = Array.isArray(value) ? value : [lo, hi];
      const span = Math.max(1, hi - lo);
      const stack = h('div', { class: 'sg-renderer-slider-range-stack' });
      const rail = h('div', { class: 'sg-renderer-slider-range-rail' });
      const fill = h('div', { class: 'sg-renderer-slider-range-fill', style: `background:${accent};` });
      const lowInput = h('input', {
        type: 'range', class: 'sg-renderer-slider-input sg-renderer-slider-range-low',
        min: lo, max: hi, step: sp, value: a,
        disabled: ed ? null : '',
      });
      const highInput = h('input', {
        type: 'range', class: 'sg-renderer-slider-input sg-renderer-slider-range-high',
        min: lo, max: hi, step: sp, value: b,
        disabled: ed ? null : '',
      });
      // The custom CSS thumb reads --sg-slider-accent for its fill; set it
      // here so the thumb tracks the configured colour without an inline
      // style override per element.
      stack.style.setProperty('--sg-slider-accent', accent);
      const label = h('span', { class: 'sg-renderer-slider-value' },
        document.createTextNode(`${fmt(a)} – ${fmt(b)}`));

      function paint() {
        let l = Number(lowInput.value); let r = Number(highInput.value);
        if (l > r) [l, r] = [r, l];
        const lpct = ((l - lo) / span) * 100;
        const rpct = ((r - lo) / span) * 100;
        fill.style.left  = `${lpct}%`;
        fill.style.width = `${Math.max(0, rpct - lpct)}%`;
        label.textContent = `${fmt(l)} – ${fmt(r)}`;
      }
      function commit() {
        let l = Number(lowInput.value); let r = Number(highInput.value);
        if (l > r) [l, r] = [r, l];
        paint();
        dispatch([l, r]);
      }
      [lowInput, highInput].forEach((i) => {
        i.addEventListener('click', (e) => e.stopPropagation());
        i.addEventListener('input', paint);
        i.addEventListener('change', commit);
      });
      stack.append(rail, fill, lowInput, highInput);
      wrap.append(stack);
      if (show) wrap.append(label);
      paint();
    } else {
      const n = Number(value);
      const safe = Number.isFinite(n) ? n : lo;
      const input = h('input', {
        type: 'range', class: 'sg-renderer-slider-input',
        min: lo, max: hi, step: sp, value: safe,
        disabled: ed ? null : '',
        style: `accent-color: ${accent};`,
      });
      const label = h('span', { class: 'sg-renderer-slider-value' },
        document.createTextNode(fmt(safe)));
      input.addEventListener('click', (e) => e.stopPropagation());
      input.addEventListener('input', () => { label.textContent = fmt(Number(input.value)); });
      input.addEventListener('change', () => dispatch(Number(input.value)));
      wrap.append(input);
      if (show) wrap.append(label);
    }
    return wrap;
  };
}

/* ---------- AU FSM / tradie compliance & dispatch ------------------
 *
 * Renderers for field-service-management and Australian-trades-specific
 * data shapes — compliance / licence cards with expiry banding, dispatch
 * workflow pills, vehicle rego plates, etc. Most share two helpers:
 *
 *   stateBadge(state)        — coloured AU state tag (NSW/VIC/…)
 *   expiryBadge(when, opts)  — "exp 12/2026" pill with traffic-light
 *                              colour based on days remaining
 *
 * Cell values are typically objects (`{ number, state, expires, class }`)
 * but each factory falls back gracefully when given a plain string. */

// Calmer palette for state badges adjacent to a licence number.
const AU_STATE_BADGE = {
  NSW: { bg: '#1e3a8a', fg: '#ffffff' },
  VIC: { bg: '#1e3a8a', fg: '#ffffff' },
  QLD: { bg: '#7c2d12', fg: '#ffffff' },
  SA:  { bg: '#7f1d1d', fg: '#ffffff' },
  WA:  { bg: '#ca8a04', fg: '#ffffff' },
  TAS: { bg: '#14532d', fg: '#ffffff' },
  NT:  { bg: '#9a3412', fg: '#ffffff' },
  ACT: { bg: '#374151', fg: '#facc15' },
};

// Approximate "look" of each state's current general-issue rego plate.
const AU_REGO_PLATE = {
  NSW: { bg: '#fde047', fg: '#0f172a', border: '#0f172a' },
  VIC: { bg: '#ffffff', fg: '#1d4ed8', border: '#1d4ed8' },
  QLD: { bg: '#ffffff', fg: '#7f1d1d', border: '#7f1d1d' },
  SA:  { bg: '#facc15', fg: '#0f172a', border: '#0f172a' },
  WA:  { bg: '#fbbf24', fg: '#0f172a', border: '#0f172a' },
  TAS: { bg: '#ffffff', fg: '#166534', border: '#166534' },
  NT:  { bg: '#ffffff', fg: '#9a3412', border: '#9a3412' },
  ACT: { bg: '#1f2937', fg: '#facc15', border: '#facc15' },
};

function stateBadge(state, palette = AU_STATE_BADGE) {
  const k = String(state || '').toUpperCase();
  if (!k) return null;
  const c = palette[k] || { bg: '#6b7280', fg: '#ffffff' };
  return h('span', {
    class: 'sg-renderer-state-badge',
    style: `background:${c.bg};color:${c.fg};`,
    title: k,
  }, document.createTextNode(k));
}

function daysUntil(when) {
  if (!when) return null;
  const d = when instanceof Date ? when : new Date(when);
  if (Number.isNaN(d.valueOf())) return null;
  // Day-to-day comparison — a same-day expiry counts as 0, not -1.
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const now = new Date();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((a - b) / 86400000);
}

function expiryClass(days) {
  if (days == null) return null;
  if (days < 0)   return 'is-expired';
  if (days < 30)  return 'is-soon';
  if (days < 90)  return 'is-warning';
  return 'is-current';
}

function expiryBadge(when, { label = 'exp' } = {}) {
  if (!when) return null;
  const days = daysUntil(when);
  if (days == null) return null;
  const klass = expiryClass(days);
  const d = when instanceof Date ? when : new Date(when);
  const fmt = `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  const text = days < 0 ? `expired ${fmt}` : `${label} ${fmt}`;
  const titleText = days < 0
    ? `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`
    : days === 0 ? 'Expires today'
    : `Expires in ${days} day${days === 1 ? '' : 's'}`;
  return h('span', {
    class: `sg-renderer-expiry ${klass}`,
    title: titleText,
  }, document.createTextNode(text));
}

/* ---------- trade-licence ------------------------------------------
 *
 * Australian contractor licence. Each state has its own scheme (NSW LIC,
 * QBCC, VBA, SA CBS, Service Tasmania) and number format — this renderer
 * accepts the common-denominator shape and surfaces expiry colour-coded:
 *
 *   value: {
 *     number: 'EC234567C',           // licence number
 *     state:  'NSW',                  // jurisdiction (NSW/VIC/QLD/…)
 *     class:  'Electrical',           // trade class (optional)
 *     expires: '2026-12-31',          // ISO date (optional)
 *   }
 *
 * A plain string is rendered as the licence number alone (no state or
 * expiry colouring). When `editable` (default true) is on, double-click
 * opens a four-field popover (state / number / class / expiry) that
 * commits via `grid:cellValueChanged` — same contract as the inline
 * editor and the address-au editor. */
export function tradeLicence({ editable = true } = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    if (td) {
      td.classList.add('sg-renderer-licence-cell');
      td._sgLicence = value;
      if (editable && !td._sgLicenceEditBound) {
        td._sgLicenceEditBound = true;
        td.addEventListener('dblclick', (e) => {
          if (e._sgLicenceHandled) return;
          e._sgLicenceHandled = true;
          e.stopPropagation();
          openLicenceEditor(td, ctx);
        });
      }
    }
    if (isBlank(value)) return '';
    if (typeof value === 'string') {
      return h('span', { class: 'sg-renderer-compliance' },
        h('span', { class: 'sg-renderer-mono' }, document.createTextNode(value)));
    }
    const wrap = h('span', { class: 'sg-renderer-compliance' });
    if (value.state)  wrap.append(stateBadge(value.state));
    if (value.number) wrap.append(h('span', { class: 'sg-renderer-mono' },
      document.createTextNode(String(value.number))));
    if (value.class)  wrap.append(h('span', { class: 'sg-renderer-compliance-class' },
      document.createTextNode(String(value.class))));
    const exp = expiryBadge(value.expires);
    if (exp) wrap.append(exp);
    return wrap;
  };
}

let activeLicenceEditor = null;
function closeLicenceEditor() {
  if (!activeLicenceEditor) return;
  const { pop, onKey, onDocClick } = activeLicenceEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeLicenceEditor = null;
}

function openLicenceEditor(anchor, ctx) {
  closeLicenceEditor();
  const raw = anchor._sgLicence;
  const start = (raw && typeof raw === 'object')
    ? { state: raw.state || '', number: raw.number ?? '', class: raw.class ?? '', expires: raw.expires || '' }
    : { state: '', number: typeof raw === 'string' ? raw : '', class: '', expires: '' };

  const pop = h('div', { class: 'sg-licence-editor', role: 'dialog' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  const header = h('div', { class: 'sg-licence-editor-header' },
    document.createTextNode('Edit licence'));

  const form = h('form', { class: 'sg-licence-editor-form', novalidate: 'novalidate' });
  const grid = h('div', { class: 'sg-licence-editor-grid' });

  function field(label, name, child) {
    const w = h('label', { class: 'sg-licence-editor-field', 'data-field': name });
    w.append(h('span', { class: 'sg-licence-editor-label' }, document.createTextNode(label)));
    w.append(child);
    return w;
  }

  const stateSel = h('select', { name: 'state', class: 'sg-licence-editor-input' });
  stateSel.append(h('option', { value: '' }, document.createTextNode('—')));
  for (const s of AU_STATES) {
    stateSel.append(h('option', { value: s, selected: start.state === s ? '' : null },
      document.createTextNode(`${s} — ${AU_STATE_NAMES[s]}`)));
  }
  const numberInput = h('input', { type: 'text', name: 'number',
    class: 'sg-licence-editor-input sg-renderer-mono',
    value: start.number, placeholder: 'EC234567C' });
  const classInput = h('input', { type: 'text', name: 'class',
    class: 'sg-licence-editor-input',
    value: start.class, placeholder: 'Electrical' });
  const expiresInput = h('input', { type: 'date', name: 'expires',
    class: 'sg-licence-editor-input',
    value: start.expires ? String(start.expires).slice(0, 10) : '' });

  grid.append(
    field('State', 'state', stateSel),
    field('Licence #', 'number', numberInput),
    field('Class', 'class', classInput),
    field('Expires', 'expires', expiresInput),
  );

  const footer = h('div', { class: 'sg-licence-editor-footer' });
  const cancel = h('button', { type: 'button', class: 'sg-licence-editor-cancel' },
    document.createTextNode('Cancel'));
  const save = h('button', { type: 'submit', class: 'sg-licence-editor-save' },
    document.createTextNode('Save'));
  footer.append(cancel, save);

  form.append(grid, footer);
  pop.append(header, form);

  function commit() {
    const next = {
      state:   stateSel.value || '',
      number:  numberInput.value.trim(),
      class:   classInput.value.trim(),
      expires: expiresInput.value || '',
    };
    const allEmpty = !next.state && !next.number && !next.class && !next.expires;
    commitLicence(anchor, ctx, allEmpty ? null : next);
    closeLicenceEditor();
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); commit(); });
  cancel.addEventListener('click', () => closeLicenceEditor());

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeLicenceEditor(); }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeLicenceEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  numberInput.focus();
  numberInput.select();
  activeLicenceEditor = { pop, onKey, onDocClick };
}

function commitLicence(td, ctx, next) {
  const { row, col, api } = ctx;
  const oldValue = row && col?.field != null ? row[col.field] : null;
  if (row && col?.field != null) row[col.field] = next;
  td._sgLicence = next;
  if (api?.applyTransaction) api.applyTransaction({ update: [row] });
  const grid = td.closest('[data-controller~="grid"]');
  if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
    bubbles: true,
    detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
  }));
}

/* ---------- complianceCard (shared shape for licence/cert renderers)
 *
 * The shape every AU compliance card converges on: an optional state /
 * issuer badge, a monospaced ID number, an optional class/category line,
 * and a colour-banded expiry pill. The same four-field popover (state /
 * number / class / expiry) that backs trade-licence is reused for every
 * card the factory builds.
 *
 * Value shape (all keys optional):
 *   { state, number, class, expires }
 *
 * Plain strings render as the bare ID. */
function complianceCard({
  prefix = null, classLabel = null, expiryLabel = 'exp', editable = true,
} = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    if (td) {
      td.classList.add('sg-renderer-licence-cell');
      td._sgLicence = value;
      if (editable && !td._sgLicenceEditBound) {
        td._sgLicenceEditBound = true;
        td.addEventListener('dblclick', (e) => {
          if (e._sgLicenceHandled) return;
          e._sgLicenceHandled = true;
          e.stopPropagation();
          openLicenceEditor(td, ctx);
        });
      }
    }
    if (isBlank(value)) return '';
    const wrap = h('span', { class: 'sg-renderer-compliance' });
    if (typeof value === 'string') {
      if (prefix) wrap.append(h('span', { class: 'sg-renderer-compliance-prefix' },
        document.createTextNode(prefix)));
      wrap.append(h('span', { class: 'sg-renderer-mono' }, document.createTextNode(value)));
      return wrap;
    }
    if (value.state) wrap.append(stateBadge(value.state));
    else if (prefix) wrap.append(h('span', { class: 'sg-renderer-compliance-prefix' },
      document.createTextNode(prefix)));
    if (value.number) wrap.append(h('span', { class: 'sg-renderer-mono' },
      document.createTextNode(String(value.number))));
    const cls = value.class ?? classLabel;
    if (cls) wrap.append(h('span', { class: 'sg-renderer-compliance-class' },
      document.createTextNode(String(cls))));
    const exp = expiryBadge(value.expires, { label: expiryLabel });
    if (exp) wrap.append(exp);
    return wrap;
  };
}

// Construction Induction Card (CIC, "White Card"). Required on every
// site — issued by RTOs nationally so the state is the holder's, not the
// card's. Plain string is also accepted (just the card number).
export function whiteCard(opts = {}) {
  return complianceCard({ prefix: 'CIC', classLabel: 'White Card', ...opts });
}

// Working With Children — QLD Blue Card (issued by Blue Card Services).
// 8-digit positive notice number with "general" / "exempt" classification.
export function blueCard(opts = {}) {
  return complianceCard({ prefix: 'BC', classLabel: 'Blue Card (QLD)', ...opts });
}

// Working With Children Check — NSW / VIC / SA / WA / TAS / NT / ACT.
// Each state has a different prefix; the state badge surfaces which.
// Pass `state` to drive the badge colour and the source-of-issue.
export function wwcc(opts = {}) {
  return complianceCard({ prefix: 'WWCC', ...opts });
}

// High-Risk Work Licence — national; SafeWork issues. The `class` field
// carries the two-letter code (SI scaffolding intermediate, WP boom/EWP,
// DG dogging, RB rigging basic, CN non-slewing crane, LF forklift …).
export function highRiskLicence(opts = {}) {
  return complianceCard({ prefix: 'HRWL', ...opts });
}

// VIC Certificate of Electrical Safety (COES). Lodged by REC / LEW
// after every prescribed electrical job — issued via ESV.
export function coes(opts = {}) {
  return complianceCard({ prefix: 'COES', classLabel: 'Electrical Safety', ...opts });
}

// NSW / SA / WA Certificate of Compliance — Electrical Work. The non-VIC
// equivalent of COES. Format and lodgement scheme varies per state, but
// the cell shape is identical (state badge + cert number + expiry).
export function coc(opts = {}) {
  return complianceCard({ prefix: 'COC', classLabel: 'Compliance', ...opts });
}

// Queensland Building & Construction Commission licence. Up to 7-digit
// number; `class` is the scope (Open Builder, Plumbing, Drainage, etc.).
// Renewal is annual.
export function qbccLicence(opts = {}) {
  return complianceCard({ prefix: 'QBCC', ...opts });
}

// Victorian Building Authority — registered building practitioner.
// Number is a 4–6 digit registration ID; `class` is the category
// (Builder, Plumbing, Surveyor, …). Renews every 5 years.
export function vbaLicence(opts = {}) {
  return complianceCard({ prefix: 'VBA', ...opts });
}

// Gas Work Authorisation / Compliance Certificate. State-issued (ESV
// VIC, Energy Safe SA, etc.). `class` differentiates Type A (commercial
// appliances) from Type B (industrial) work scope.
export function gasCertificate(opts = {}) {
  return complianceCard({ prefix: 'Gas', classLabel: 'Type A', ...opts });
}

// Asbestos removal licence — SafeWork-issued, state-based.
// `class` = Class A (friable) / Class B (non-friable). Class A unlocks
// far higher-risk work and demands stricter air-monitoring.
export function asbestosLicence(opts = {}) {
  return complianceCard({ prefix: 'Asbestos', classLabel: 'Class B', ...opts });
}

// ARC Refrigerant Handling Licence (RHL). Federal scheme — no state
// badge. `class` = Full / Restricted / Trainee. AU-RxxxxxxxL format.
export function refrigerantLicence(opts = {}) {
  return complianceCard({ prefix: 'ARC RHL', ...opts });
}

// QLD Form 23 — Pool Safety Inspector. QBCC-issued. Renews every 2 years.
export function poolSafetyCert(opts = {}) {
  return complianceCard({ prefix: 'PSC', classLabel: 'Pool Safety', ...opts });
}

// AS/NZS 3760 Test & Tag. Tracks the last-tested and next-due date for
// portable electrical equipment. `class` typically carries the tag
// colour (Red Q1 / Yellow Q2 / Blue Q3 / Green Q4) which spreads test
// dates across the year for audit-friendly cohort batches.
export function testAndTag(opts = {}) {
  return complianceCard({ prefix: 'T&T', expiryLabel: 'next', ...opts });
}

// GST registration status (pairs with the existing `abn` renderer).
// Value: 'registered' / 'not-registered' / 'pending'. Drives whether a
// quote/invoice template shows GST line items.
export function gstStatus() {
  return statusPill({
    registered: 'green', 'not-registered': 'gray', pending: 'orange',
  }, { registered: 'check-circle', 'not-registered': 'circle', pending: 'clock' });
}

// ABN compliance status — pairs with the existing `abn` format renderer
// to surface live ABR-lookup state. Value: 'active' / 'cancelled' /
// 'suspended' / 'pending'.
export function abnStatus() {
  return statusPill({
    active: 'green', cancelled: 'red', suspended: 'orange', pending: 'gray',
  }, { active: 'check-circle', cancelled: 'x-circle', suspended: 'alert', pending: 'clock' });
}

// NSW Home Building Compensation Fund (icare HBCF). Mandatory cover on
// any residential reno over $20k. Annual project-level cert.
export function hbcfCert(opts = {}) {
  return complianceCard({ prefix: 'HBCF', ...opts });
}

/* ---------- AU FSM dispatch / job workflow renderers ----------------
 *
 * Job lifecycle pills, customer-promised arrival windows, route
 * positions, milestone progress claims, defects, invoice status — the
 * vocabulary of every tradie dispatch board. */

// Job lifecycle status pill. Canonical workflow:
//   quoted → scheduled → dispatched → on-site → completed → invoiced → paid
// plus off-path states: on-hold / cancelled / no-show.
export function jobStatus() {
  return statusPill({
    quoted: 'gray', scheduled: 'blue', dispatched: 'indigo', 'on-site': 'purple',
    completed: 'green', invoiced: 'orange', paid: 'green',
    'on-hold': 'yellow', cancelled: 'red', 'no-show': 'red',
  }, {
    quoted: 'circle', scheduled: 'clock', dispatched: 'truck', 'on-site': 'dot',
    completed: 'check-circle', invoiced: 'cart', paid: 'check-circle',
    'on-hold': 'clock', cancelled: 'x-circle', 'no-show': 'alert',
  });
}

/* ---------- arrival-window ----------------------------------------
 *
 * Customer-promised arrival window — the time slot the dispatcher
 * quoted ("between 8 and 10 in the morning"). Renders as:
 *
 *   8–10am Tue 27 May
 *
 * Colour bands:
 *   green  — window still in the future
 *   blue   — window currently open (we're inside it)
 *   amber  — overdue by < 30 min
 *   red    — overdue by ≥ 30 min, or whole window has passed
 *
 * Value shapes:
 *   { start, end }              ISO datetime / Date / parseable string
 *   [start, end]                tuple form
 *   string                      printed as-is (no colour band) */
/* ---------- AU FSM safety / WHS renderers ---------------------------
 *
 * SWMS / JSA / toolbox talks / PPE / incidents / hazards / inductions —
 * the documentation that has to be in order before any tradie sets foot
 * on a high-risk site. */

// Safe Work Method Statement status. Required for every HRCW activity.
//   value: 'signed' | 'pending' | 'expired' | 'missing' | 'not-required'
export function swmsStatus() {
  return statusPill({
    signed: 'green', pending: 'orange', expired: 'red',
    missing: 'red', 'not-required': 'gray',
  }, {
    signed: 'check-circle', pending: 'clock', expired: 'alert',
    missing: 'x-circle', 'not-required': 'circle',
  });
}

// Job Safety Analysis state — pre-task hazard walkthrough record.
//   value: 'completed' | 'in-progress' | 'open' | 'approved' | 'not-required'
export function jsaStatus() {
  return statusPill({
    completed: 'green', approved: 'green', 'in-progress': 'blue',
    open: 'orange', 'not-required': 'gray',
  }, {
    completed: 'check-circle', approved: 'check-circle', 'in-progress': 'clock',
    open: 'alert', 'not-required': 'circle',
  });
}

/* ---------- AU FSM people / trades renderers ----------------------
 *
 * The cell shapes that hang off "who's working" — trade icons, skill
 * endorsements, subcontractor compliance roll-ups, crew composites. */

/* ---------- AU FSM fleet / vehicle renderers ----------------------
 *
 * Rego plates, rego currency, CTP / green-slip, service-due, fuel
 * cards, odometer readings — the fleet-management vocabulary. */

/* ---------- AU FSM customer / property renderers ------------------
 *
 * Customer category, AU cadastral property identifiers (strata-plan,
 * lot-plan), council areas, suburb formatting — the cell shapes hung
 * off "where is this work" and "who is paying". */

// Customer category pill. Drives invoice template selection, tax
// treatment, comms tone, …
//   value: 'residential' | 'commercial' | 'strata' | 'real-estate'
//        | 'insurance' | 'builder' | 'government' | 'body-corp'
export function customerType() {
  return statusPill({
    residential: 'blue', commercial: 'indigo', strata: 'purple',
    'real-estate': 'orange', insurance: 'pink', builder: 'gray',
    government: 'green', 'body-corp': 'purple',
  });
}

/* ---------- region-classifier -------------------------------------
 *
 * Metro / Regional / Remote / Very remote pill — drives travel rate
 * multipliers and after-hours surcharges on quotes. Mirrors the ABS
 * Remoteness Areas classification, simplified to four bands.
 *
 *   value: 'metro' | 'regional' | 'remote' | 'very-remote'
 *        | 'outer-regional' | 'inner-regional' */
export function regionClassifier() {
  return statusPill({
    metro: 'blue', 'inner-regional': 'green', regional: 'green',
    'outer-regional': 'yellow', remote: 'orange', 'very-remote': 'red',
  }, {
    metro: 'dot', 'inner-regional': 'dot', regional: 'circle',
    'outer-regional': 'circle', remote: 'half-circle', 'very-remote': 'alert',
  });
}

/* ---------- council-lga -------------------------------------------
 *
 * Local Government Area badge. The jurisdiction that drives building
 * approvals / DAs / certifier rules — every quote needs it.
 *
 *   value: 'Waverley'                              shorthand
 *        | { name: 'Waverley', state: 'NSW' }      full */
export function councilLga() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const v = typeof value === 'object' ? value : { name: String(value) };
    const wrap = h('span', { class: 'sg-renderer-council-lga' });
    if (v.state) wrap.append(stateBadge(v.state));
    if (v.name) wrap.append(h('span', { class: 'sg-renderer-council-lga-name' },
      document.createTextNode(String(v.name))));
    wrap.append(h('span', { class: 'sg-renderer-council-lga-suffix' },
      document.createTextNode('Council')));
    return wrap;
  };
}

/* ---------- lot-plan ----------------------------------------------
 *
 * AU lot-plan cadastral identifier — "Lot 12 DP 456789" / "Lot 4 SP
 * 4421" formatting. Pass:
 *
 *   { lot, dp }                  → Deposited Plan
 *   { lot, sp }                  → Strata Plan
 *   { lot, plan, planType }      → generic / other state schemes
 *   'Lot 12 DP 456789'           → string passes through */
export function lotPlan() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    if (typeof value === 'string') return h('span', { class: 'sg-renderer-lot-plan' },
      document.createTextNode(value));
    const lot = value.lot;
    const planType = value.dp ? 'DP' : value.sp ? 'SP' : value.planType || 'DP';
    const plan = value.dp ?? value.sp ?? value.plan;
    if (lot == null && plan == null) return '';
    const wrap = h('span', { class: 'sg-renderer-lot-plan' });
    if (lot != null) {
      wrap.append(h('span', { class: 'sg-renderer-lot-plan-lot' },
        document.createTextNode(`Lot ${lot}`)));
    }
    if (plan != null) {
      wrap.append(h('span', { class: 'sg-renderer-lot-plan-plan sg-renderer-mono' },
        document.createTextNode(`${planType} ${plan}`)));
    }
    return wrap;
  };
}

// AU strata-plan identifier — "SP 12345" formatting. Strata plans are
// the cadastral document number used to identify a strata-titled
// development. Value: number / string / { number, unit? }.
export function strataPlan() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    let number, unit = null;
    if (typeof value === 'object') { number = value.number; unit = value.unit; }
    else number = value;
    const digits = String(number).replace(/[^\d]/g, '');
    if (!digits) return String(value);
    const wrap = h('span', { class: 'sg-renderer-strata-plan' });
    wrap.append(h('span', { class: 'sg-renderer-strata-plan-prefix' },
      document.createTextNode('SP')));
    wrap.append(h('span', { class: 'sg-renderer-strata-plan-number sg-renderer-mono' },
      document.createTextNode(digits)));
    if (unit != null && unit !== '') wrap.append(h('span', { class: 'sg-renderer-strata-plan-unit' },
      document.createTextNode(`unit ${unit}`)));
    return wrap;
  };
}

/* ---------- odometer ----------------------------------------------
 *
 * Odometer reading — pretty-formatted number with the "km" unit
 * suffix (set `unit: 'mi'` to override). Whole numbers only on the
 * grid; fractional km dropped. */
export function odometer({ unit = 'km', locale = 'en-AU' } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value);
    const wrap = h('span', { class: 'sg-renderer-odometer' });
    wrap.append(h('span', { class: 'sg-renderer-odometer-num' },
      document.createTextNode(Math.round(n).toLocaleString(locale))));
    wrap.append(h('span', { class: 'sg-renderer-odometer-unit' },
      document.createTextNode(unit)));
    return wrap;
  };
}

/* ---------- fuel-card ---------------------------------------------
 *
 * Fuel-card identifier with provider badge + masked card number.
 *
 *   value: { provider, number }    e.g. { provider: 'Caltex StarCard', number: '7081 •••• 4421' } */
const FUEL_CARD_BADGES = {
  caltex:   { bg: '#dc2626', fg: '#ffffff', short: 'Caltex' },
  ampol:    { bg: '#dc2626', fg: '#ffffff', short: 'Ampol' },
  bp:       { bg: '#15803d', fg: '#ffffff', short: 'BP' },
  shell:    { bg: '#facc15', fg: '#0f172a', short: 'Shell' },
  '7-eleven': { bg: '#ea580c', fg: '#ffffff', short: '7-Eleven' },
  united:   { bg: '#1d4ed8', fg: '#ffffff', short: 'United' },
  liberty:  { bg: '#1e3a8a', fg: '#ffffff', short: 'Liberty' },
  fleetcard:{ bg: '#475569', fg: '#ffffff', short: 'Fleetcard' },
  motorpass:{ bg: '#0f172a', fg: '#ffffff', short: 'Motorpass' },
};
export function fuelCard() {
  return ({ value, td }) => {
    if (td) td.classList.add('sg-renderer-fuel-card-cell');
    if (isBlank(value)) return '';
    const v = typeof value === 'object' ? value : { number: String(value) };
    const wrap = h('span', { class: 'sg-renderer-fuel-card' });
    if (v.provider) {
      const k = String(v.provider).toLowerCase().replace(/[^a-z0-9]+/g, '');
      // Find a badge that contains this normalised key.
      const badgeKey = Object.keys(FUEL_CARD_BADGES).find((b) => k.startsWith(b.replace(/-/g, ''))) || null;
      const def = badgeKey ? FUEL_CARD_BADGES[badgeKey] : { bg: '#6b7280', fg: '#ffffff', short: v.provider };
      wrap.append(h('span', {
        class: 'sg-renderer-fuel-card-badge',
        style: `background:${def.bg};color:${def.fg};`,
      }, document.createTextNode(def.short)));
    }
    if (v.number) wrap.append(h('span', { class: 'sg-renderer-fuel-card-number sg-renderer-mono' },
      document.createTextNode(String(v.number))));
    return wrap;
  };
}

/* ---------- service-due -------------------------------------------
 *
 * Vehicle service-due indicator. Vehicle services come due on the
 * earlier of km or time — this renderer shows both deltas and colours
 * by whichever is closer (or already over).
 *
 *   value: { currentKm, dueKm, dueDate } */
export function serviceDue() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const v = typeof value === 'object' ? value : null;
    if (!v) return '';
    const cur = +v.currentKm;
    const dKm = +v.dueKm;
    const kmLeft = Number.isFinite(cur) && Number.isFinite(dKm) ? dKm - cur : null;
    const dayLeft = v.dueDate ? daysUntil(v.dueDate) : null;
    // Determine band — whichever is most-overdue or closest.
    const kmBand = kmLeft == null ? null
                 : kmLeft < 0 ? 'is-overdue'
                 : kmLeft < 500 ? 'is-soon'
                 : kmLeft < 2000 ? 'is-warning'
                 : 'is-current';
    const dayBand = dayLeft == null ? null
                  : dayLeft < 0 ? 'is-overdue'
                  : dayLeft < 14 ? 'is-soon'
                  : dayLeft < 60 ? 'is-warning'
                  : 'is-current';
    const band = [kmBand, dayBand].includes('is-overdue') ? 'is-overdue'
               : [kmBand, dayBand].includes('is-soon')    ? 'is-soon'
               : [kmBand, dayBand].includes('is-warning') ? 'is-warning'
               : 'is-current';
    const wrap = h('span', { class: `sg-renderer-service-due ${band}` });
    if (kmLeft != null) {
      const label = kmLeft < 0 ? `${Math.abs(kmLeft).toLocaleString()} km over`
                  : `${kmLeft.toLocaleString()} km left`;
      wrap.append(h('span', { class: 'sg-renderer-service-due-km' },
        document.createTextNode(label)));
    }
    if (dayLeft != null) {
      const label = dayLeft < 0 ? `${Math.abs(dayLeft)}d over`
                  : dayLeft === 0 ? 'today'
                  : `${dayLeft}d left`;
      wrap.append(h('span', { class: 'sg-renderer-service-due-date' },
        document.createTextNode(label)));
    }
    return wrap;
  };
}

// Vehicle rego currency. Value: ISO date string (the rego expiry) or
// `{ expires }`. Renders "Rego current/expires in N days/expired" pill
// in traffic-light colour.
export function regoStatus() {
  return ({ value }) => {
    if (isBlank(value)) return h('span', { class: 'sg-pill sg-pill-gray' },
      document.createTextNode('No rego'));
    const v = typeof value === 'object' ? value : { expires: value };
    const days = daysUntil(v.expires);
    if (days == null) return '';
    const cls = days < 0 ? 'red' : days < 14 ? 'orange' : days < 60 ? 'yellow' : 'green';
    const label = days < 0 ? `Expired ${Math.abs(days)}d ago`
                : days === 0 ? 'Expires today'
                : days < 60 ? `Expires in ${days}d`
                : `Current (${Math.round(days / 30)}mo)`;
    return h('span', { class: `sg-pill sg-pill-${cls} sg-renderer-rego-status` },
      document.createTextNode(label));
  };
}

// CTP / Green Slip currency. Same shape as rego-status — separate
// renderer because the two often live side-by-side on a fleet card
// and the label needs to read "CTP".
export function ctpStatus() {
  return ({ value }) => {
    if (isBlank(value)) return h('span', { class: 'sg-pill sg-pill-gray' },
      document.createTextNode('No CTP'));
    const v = typeof value === 'object' ? value : { expires: value };
    const days = daysUntil(v.expires);
    if (days == null) return '';
    const cls = days < 0 ? 'red' : days < 14 ? 'orange' : days < 60 ? 'yellow' : 'green';
    const label = days < 0 ? `CTP expired ${Math.abs(days)}d ago`
                : days === 0 ? 'CTP expires today'
                : days < 60 ? `CTP ${days}d left`
                : `CTP current (${Math.round(days / 30)}mo)`;
    return h('span', { class: `sg-pill sg-pill-${cls} sg-renderer-ctp-status` },
      document.createTextNode(label));
  };
}

// AU vehicle registration plate with state-coloured background. The
// palette mimics each state's current general-issue plate (NSW
// yellow/black, VIC blue/white, QLD maroon/white, etc.). Value:
//   string                  → unknown state, neutral plate
//   { state, plate }        → coloured to match the state */
export function regoPlate() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    let state = '', plate = '';
    if (typeof value === 'string') plate = value;
    else if (typeof value === 'object') { state = (value.state || '').toUpperCase(); plate = value.plate || ''; }
    const c = AU_REGO_PLATE[state] || { bg: '#f3f4f6', fg: '#1f2937', border: '#9ca3af' };
    const wrap = h('span', {
      class: 'sg-renderer-rego-plate',
      style: `background:${c.bg};color:${c.fg};border-color:${c.border};`,
      title: state ? `${state} plate` : 'Plate',
    });
    wrap.append(h('span', { class: 'sg-renderer-rego-plate-text' },
      document.createTextNode(String(plate).toUpperCase())));
    return wrap;
  };
}

/* ---------- crew --------------------------------------------------
 *
 * Team / leading hand composite. Shows leading-hand name + tiny avatar
 * stack of members + a trade-mix line.
 *
 *   value: {
 *     name:    'Crew A',
 *     leader:  'Astrid Hale',
 *     members: [{ name, avatar?, initials? }, …],
 *     trades:  ['Electrician', 'Plumber', …],
 *   } */
export function crew({ maxAvatars = 4, avatarSize = 22 } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    if (typeof value === 'string') return h('span', { class: 'sg-renderer-crew' },
      document.createTextNode(value));
    const wrap = h('span', { class: 'sg-renderer-crew' });
    // Name + leader
    const head = h('span', { class: 'sg-renderer-crew-head' });
    if (value.name) head.append(h('span', { class: 'sg-renderer-crew-name' },
      document.createTextNode(String(value.name))));
    if (value.leader) head.append(h('span', { class: 'sg-renderer-crew-leader' },
      document.createTextNode(`led by ${value.leader}`)));
    wrap.append(head);
    // Avatar stack
    if (Array.isArray(value.members) && value.members.length) {
      const stack = h('span', { class: 'sg-renderer-crew-stack' });
      const visible = value.members.slice(0, maxAvatars);
      for (const m of visible) {
        const initials = m.initials || (m.name ? m.name.split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase() : '?');
        const avatar = h('span', {
          class: 'sg-renderer-crew-avatar',
          style: `width:${avatarSize}px;height:${avatarSize}px;font-size:${Math.round(avatarSize * 0.45)}px;background:hsl(${hashName(m.name || initials) % 360},55%,55%);`,
          title: m.name || initials,
        });
        if (m.avatar) {
          avatar.append(h('img', { src: m.avatar, alt: m.name || initials,
            style: `width:${avatarSize}px;height:${avatarSize}px;border-radius:50%;display:block;` }));
        } else {
          avatar.append(document.createTextNode(initials));
        }
        stack.append(avatar);
      }
      const overflow = value.members.length - visible.length;
      if (overflow > 0) {
        stack.append(h('span', {
          class: 'sg-renderer-crew-avatar is-overflow',
          style: `width:${avatarSize}px;height:${avatarSize}px;font-size:${Math.round(avatarSize * 0.4)}px;`,
        }, document.createTextNode(`+${overflow}`)));
      }
      wrap.append(stack);
    }
    // Trade mix
    if (Array.isArray(value.trades) && value.trades.length) {
      wrap.append(h('span', { class: 'sg-renderer-crew-trades' },
        document.createTextNode(value.trades.join(' · '))));
    }
    return wrap;
  };
}

/* ---------- subcontractor -----------------------------------------
 *
 * Composite "can we send this sub today?" roll-up. Combines licence /
 * insurance / SWMS / induction flags into a single ✓ / ⚠ / ✗ pill,
 * with the name as primary text and the failing-thing as a caption.
 *
 *   value: {
 *     name: 'Bondi Roofing Pty Ltd',
 *     abn: '53004085616',
 *     licence:   true,                 // OK?
 *     insurance: true,
 *     swms:      false,                // ← red flag
 *     induction: true,
 *   } */
export function subcontractor() {
  const FLAGS = ['licence', 'insurance', 'swms', 'induction'];
  return ({ value }) => {
    if (isBlank(value)) return '';
    if (typeof value === 'string') return h('span', { class: 'sg-renderer-subcontractor' },
      document.createTextNode(value));
    const failed = FLAGS.filter((k) => value[k] === false);
    const ok = failed.length === 0;
    const wrap = h('span', { class: 'sg-renderer-subcontractor' });
    const icon = h('span', {
      class: `sg-renderer-subcontractor-icon ${ok ? 'is-ok' : failed.length === 1 ? 'is-warn' : 'is-fail'}`,
      title: ok ? 'All compliance flags OK'
                : `Missing: ${failed.join(', ')}`,
    }, document.createTextNode(ok ? '✓' : failed.length === 1 ? '⚠' : '✗'));
    wrap.append(icon);
    if (value.name) wrap.append(h('span', { class: 'sg-renderer-subcontractor-name' },
      document.createTextNode(String(value.name))));
    if (!ok) wrap.append(h('span', { class: 'sg-renderer-subcontractor-fail' },
      document.createTextNode(`needs: ${failed.join(', ')}`)));
    return wrap;
  };
}

/* ---------- skill-endorsement -------------------------------------
 *
 * A holder × competency record with an optional expiry. Shows the skill
 * name and (if dated) an "exp 11/2027" pill in expiry colour.
 *
 *   value: 'Solar PV install'
 *        | { skill: 'Solar PV install', expires: '2027-11-30', issuer?: 'CEC' } */
export function skillEndorsement() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const v = typeof value === 'object' ? value : { skill: String(value) };
    const wrap = h('span', { class: 'sg-renderer-skill-endorsement' });
    if (v.skill) wrap.append(h('span', { class: 'sg-renderer-skill-endorsement-name' },
      document.createTextNode(String(v.skill))));
    if (v.issuer) wrap.append(h('span', { class: 'sg-renderer-skill-endorsement-issuer' },
      document.createTextNode(`(${v.issuer})`)));
    const exp = expiryBadge(v.expires);
    if (exp) wrap.append(exp);
    return wrap;
  };
}

// Trade-type pill with category icon. The 12 common AU site trades are
// pre-mapped; anything else falls through as a plain text pill.
const TRADE_ICONS = {
  electrician: '⚡', plumber: '🔧', carpenter: '🪚', tiler: '🧱',
  painter: '🎨', roofer: '🏠', glazier: '🪟', hvac: '❄️',
  landscaper: '🌳', concreter: '🧊', bricklayer: '🧱', plasterer: '🪣',
  labourer: '🦺', mechanic: '🔩', welder: '🔥', steel: '⚙️',
  scaffolder: '🪜', earthworks: '🚜', solar: '☀️',
};
export function tradeType({ icons = TRADE_ICONS } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const k = String(value).toLowerCase().trim();
    const ic = icons[k] || icons[k.split(/\s+/)[0]] || null;
    const wrap = h('span', { class: 'sg-renderer-trade-type' });
    if (ic) wrap.append(h('span', { class: 'sg-renderer-trade-type-icon' },
      document.createTextNode(ic)));
    wrap.append(h('span', { class: 'sg-renderer-trade-type-label' },
      document.createTextNode(titleCaseStr(value))));
    return wrap;
  };
}

/* ---------- site-induction ----------------------------------------
 *
 * Site induction record for a person × site pair. Two-stage pill:
 * inducted ✓ + (optional) expiry colour band.
 *
 *   value: bool                              shorthand: inducted true / not
 *        | { inducted, site?, expires? } */
export function siteInduction() {
  return ({ value }) => {
    if (value === false || value === null || value === undefined) {
      return h('span', { class: 'sg-pill sg-pill-red sg-renderer-site-induction' },
        document.createTextNode('Not inducted'));
    }
    if (value === true) {
      return h('span', { class: 'sg-pill sg-pill-green sg-renderer-site-induction' },
        document.createTextNode('Inducted'));
    }
    if (typeof value === 'object') {
      const wrap = h('span', { class: 'sg-renderer-site-induction-wrap' });
      const inducted = value.inducted !== false;
      const pill = h('span', {
        class: `sg-pill sg-pill-${inducted ? 'green' : 'red'} sg-renderer-site-induction`,
      }, document.createTextNode(inducted ? 'Inducted' : 'Not inducted'));
      if (value.site) pill.append(h('span', { class: 'sg-renderer-site-induction-site' },
        document.createTextNode(value.site)));
      wrap.append(pill);
      if (inducted) {
        const exp = expiryBadge(value.expires);
        if (exp) wrap.append(exp);
      }
      return wrap;
    }
    return String(value);
  };
}

/* ---------- hazard-rating ------------------------------------------
 *
 * Risk-matrix score from a 5×5 likelihood × consequence grid (the de-facto
 * AS/NZS ISO 31000-aligned matrix every site uses). Renders the raw
 * score with the matrix's band colour:
 *
 *    1- 3  green   low
 *    4- 8  yellow  moderate
 *    9-14  orange  high
 *   15-25  red     extreme
 *
 *   value: number (1-25)
 *        | { likelihood, consequence }
 *        | { score, band? } */
export function hazardRating() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    let score = null, L = null, C = null;
    if (typeof value === 'number') score = value;
    else if (typeof value === 'object') {
      if (value.likelihood != null && value.consequence != null) {
        L = +value.likelihood; C = +value.consequence;
        score = L * C;
      } else if (value.score != null) score = +value.score;
    }
    if (!Number.isFinite(score)) return '';
    score = Math.max(1, Math.min(25, score));
    const band = score <= 3 ? 'low'
               : score <= 8 ? 'moderate'
               : score <= 14 ? 'high'
               : 'extreme';
    const wrap = h('span', {
      class: `sg-renderer-hazard-rating is-${band}`,
      title: L && C ? `Likelihood ${L} × Consequence ${C} = ${score} (${band})`
                    : `Risk score ${score} (${band})`,
    });
    wrap.append(h('span', { class: 'sg-renderer-hazard-rating-score' },
      document.createTextNode(String(score))));
    wrap.append(h('span', { class: 'sg-renderer-hazard-rating-band' },
      document.createTextNode(titleCaseStr(band))));
    return wrap;
  };
}

/* ---------- incident-severity --------------------------------------
 *
 * Incident classification pill. Values track Safe Work Australia's
 * categorisation for notifiable incidents:
 *
 *   near-miss   gray   no harm but plausible
 *   first-aid   yellow on-site treatment only
 *   mti         orange Medical Treatment Injury (>first aid)
 *   lti         red    Lost Time Injury (≥1 shift off)
 *   notifiable  red    statutory regulator-notifiable event
 *   fatality    red    work-related fatality */
export function incidentSeverity() {
  return statusPill({
    'near-miss': 'gray', 'first-aid': 'yellow', mti: 'orange',
    lti: 'red', notifiable: 'red', fatality: 'red',
  }, {
    'near-miss': 'circle', 'first-aid': 'check-circle', mti: 'alert',
    lti: 'alert', notifiable: 'alert', fatality: 'x-circle',
  });
}

/* ---------- ppe-checklist -----------------------------------------
 *
 * Inline icon strip for required Personal Protective Equipment. Value
 * is an array of PPE keys; items not in the canonical set fall through
 * as their key text. Default key set:
 *
 *   hard-hat   ⛑      mask        😷
 *   hi-vis     🦺      hearing     🎧
 *   gloves     🧤      goggles     🥽
 *   boots      🥾      harness     🪢 */
const PPE_ICONS = {
  'hard-hat': '⛑', 'helmet': '⛑',
  'hi-vis':   '🦺', 'vest': '🦺',
  'gloves':   '🧤',
  'boots':    '🥾',
  'goggles':  '🥽', 'glasses': '🥽', 'eye-pro': '🥽',
  'mask':     '😷', 'respirator': '😷',
  'hearing':  '🎧', 'ear-pro': '🎧',
  'harness':  '🪢',
};
export function ppeChecklist({ icons = PPE_ICONS } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const list = Array.isArray(value) ? value
               : typeof value === 'string' ? value.split(/\s*,\s*/).filter(Boolean)
               : [];
    if (!list.length) return '';
    const wrap = h('span', { class: 'sg-renderer-ppe-checklist' });
    for (const raw of list) {
      const k = String(raw).toLowerCase().trim();
      const glyph = icons[k] || raw;
      wrap.append(h('span', {
        class: 'sg-renderer-ppe-item', title: titleCaseStr(k.replace('-', ' ')),
      }, document.createTextNode(String(glyph))));
    }
    return wrap;
  };
}

/* ---------- toolbox-talk -------------------------------------------
 *
 * Last toolbox-talk attendance record. "Last: 14 May (12d ago)" with
 * traffic-light colour by overdue threshold (most builders want weekly,
 * default `dueDays: 7`).
 *
 *   value: ISO date string | { lastDate, topic? } */
export function toolboxTalk({ dueDays = 7 } = {}) {
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return ({ value }) => {
    if (isBlank(value)) return h('span', { class: 'sg-renderer-toolbox-talk is-missing' },
      document.createTextNode('no record'));
    const v = typeof value === 'object' ? value : { lastDate: value };
    const d = v.lastDate ? new Date(v.lastDate) : null;
    if (!d || Number.isNaN(d.valueOf())) return '';
    const days = Math.max(0, -daysUntil(d));         // days since
    const cls = days > dueDays * 2 ? 'is-late'
              : days > dueDays      ? 'is-overdue'
              : 'is-current';
    const lastLabel = `${d.getDate()} ${MON[d.getMonth()]}`;
    const agoLabel = days === 0 ? 'today' : days === 1 ? 'yesterday' : `${days}d ago`;
    const wrap = h('span', { class: `sg-renderer-toolbox-talk ${cls}` });
    wrap.append(h('span', { class: 'sg-renderer-toolbox-talk-last' },
      document.createTextNode(`Last: ${lastLabel}`)));
    wrap.append(h('span', { class: 'sg-renderer-toolbox-talk-ago' },
      document.createTextNode(`(${agoLabel})`)));
    if (v.topic) wrap.append(h('span', { class: 'sg-renderer-toolbox-talk-topic' },
      document.createTextNode(String(v.topic))));
    return wrap;
  };
}

/* ---------- materials-pick ----------------------------------------
 *
 * Materials pick-list line. Value:
 *   { sku, name, qty, status }
 *     status: 'in-stock' | 'backorder' | 'out-of-stock' | 'special-order'
 *
 * Renders qty + name (+ sku in tooltip) with a stock-status pill. */
export function materialsPick() {
  const STOCK_COLOR = {
    'in-stock': 'green', 'backorder': 'orange',
    'out-of-stock': 'red', 'special-order': 'blue',
  };
  return ({ value }) => {
    if (isBlank(value)) return '';
    const v = (typeof value === 'object') ? value : { name: String(value) };
    const wrap = h('span', { class: 'sg-renderer-materials-pick', title: v.sku || '' });
    if (v.qty != null) wrap.append(h('span', { class: 'sg-renderer-materials-pick-qty' },
      document.createTextNode(`×${v.qty}`)));
    if (v.name) wrap.append(h('span', { class: 'sg-renderer-materials-pick-name' },
      document.createTextNode(String(v.name))));
    if (v.status) {
      const k = String(v.status).toLowerCase();
      const color = STOCK_COLOR[k] || 'gray';
      wrap.append(h('span', {
        class: `sg-pill sg-pill-${color} sg-renderer-materials-pick-stock`,
      }, document.createTextNode(titleCaseStr(k.replace('-', ' ')))));
    }
    return wrap;
  };
}

/* ---------- retention --------------------------------------------
 *
 * Retention dollar amount + release-date countdown. Common on
 * commercial-build progress claims (5-10% held back per claim until
 * defects liability period ends).
 *
 *   value: { amount, releaseDate } */
export function retention({ currency = 'AUD', locale = 'en-AU' } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const v = (typeof value === 'object') ? value : { amount: Number(value) };
    const amt = +v.amount;
    if (!Number.isFinite(amt)) return '';
    const wrap = h('span', { class: 'sg-renderer-retention' });
    wrap.append(h('span', { class: 'sg-renderer-retention-amount' },
      document.createTextNode(amt.toLocaleString(locale, { style: 'currency', currency }))));
    if (v.releaseDate) {
      const days = daysUntil(v.releaseDate);
      if (days != null) {
        const cls = days < 0 ? 'is-released' : days < 30 ? 'is-soon' : 'is-pending';
        const text = days < 0 ? 'released'
                   : days === 0 ? 'releases today'
                   : days < 60  ? `releases in ${days}d`
                   : `releases in ${Math.round(days / 30)}mo`;
        wrap.append(h('span', { class: `sg-renderer-retention-release ${cls}` },
          document.createTextNode(text)));
      }
    }
    return wrap;
  };
}

/* ---------- invoice-status ----------------------------------------
 *
 * Invoice lifecycle pill. Canonical states:
 *   draft → sent → viewed → paid
 * plus exception states: overdue / disputed / void / written-off. */
export function invoiceStatus() {
  return statusPill({
    draft: 'gray', sent: 'blue', viewed: 'indigo', paid: 'green',
    overdue: 'red', disputed: 'orange', void: 'gray', 'written-off': 'gray',
  }, {
    draft: 'circle', sent: 'cart', viewed: 'check', paid: 'check-circle',
    overdue: 'alert', disputed: 'alert', void: 'x-circle', 'written-off': 'x-circle',
  });
}

/* ---------- payment-terms -----------------------------------------
 *
 * Invoice payment terms pill — Net 7 / Net 14 / Net 30 / EOM / COD /
 * Prepaid. If the value carries a `dueDate`, overdue invoices flip
 * the pill colour to red.
 *
 *   value: 'net 30' | 'cod' | 'eom' | …
 *        | { terms: 'net 30', dueDate: '2026-06-15' }
 *
 * Double-click opens a two-field popover (terms select + due-date
 * picker) and commits via `grid:cellValueChanged`. Plain-string values
 * stay strings on save (unless a due date is added). */
const PAYMENT_TERMS_OPTIONS = [
  'COD', 'Prepaid', 'Net 7', 'Net 14', 'Net 30', 'Net 45', 'Net 60', 'EOM',
];
export function paymentTerms({ editable = true } = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    if (td) {
      td.classList.add('sg-renderer-payment-terms-cell');
      td._sgPaymentTerms = value;
      if (editable && !td._sgPaymentTermsBound) {
        td._sgPaymentTermsBound = true;
        td.addEventListener('dblclick', (e) => {
          if (e._sgPaymentTermsHandled) return;
          e._sgPaymentTermsHandled = true;
          e.stopPropagation();
          openPaymentTermsEditor(td, ctx);
        });
      }
    }
    if (isBlank(value)) return '';
    let terms, dueDate = null;
    if (typeof value === 'object') { terms = value.terms || ''; dueDate = value.dueDate || null; }
    else terms = String(value);
    const k = String(terms).toLowerCase().replace(/\s+/g, ' ').trim();
    const isOverdue = dueDate ? Date.now() > new Date(dueDate).getTime() : false;
    let color = 'gray';
    if (isOverdue) color = 'red';
    else if (k === 'cod' || k === 'prepaid') color = 'green';
    else if (/^net\s+(\d+)$/.test(k)) {
      const days = parseInt(k.split(' ')[1], 10);
      color = days <= 7 ? 'blue' : days <= 14 ? 'indigo' : days <= 30 ? 'orange' : 'gray';
    } else if (k === 'eom') color = 'orange';
    const label = k === 'eom' ? 'EOM' : k === 'cod' ? 'COD' : titleCaseStr(terms);
    const pill = h('span', { class: `sg-pill sg-pill-${color} sg-renderer-payment-terms` },
      document.createTextNode(label));
    if (isOverdue) {
      pill.append(h('span', { class: 'sg-renderer-payment-terms-overdue' },
        document.createTextNode('overdue')));
    }
    return pill;
  };
}

let activePaymentTermsEditor = null;
function closePaymentTermsEditor() {
  if (!activePaymentTermsEditor) return;
  const { pop, onKey, onDocClick } = activePaymentTermsEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activePaymentTermsEditor = null;
}

function openPaymentTermsEditor(anchor, ctx) {
  closePaymentTermsEditor();
  const prior = anchor._sgPaymentTerms;
  const wasObj = prior && typeof prior === 'object';
  const startTerms = wasObj ? (prior.terms || '') : (typeof prior === 'string' ? prior : '');
  const startDue = wasObj ? (prior.dueDate || '') : '';

  const pop = h('div', { class: 'sg-licence-editor', role: 'dialog' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());
  pop.append(h('div', { class: 'sg-licence-editor-header' },
    document.createTextNode('Payment terms')));

  const form = h('form', { class: 'sg-licence-editor-form', novalidate: 'novalidate' });
  const grid = h('div', { class: 'sg-licence-editor-grid' });

  // Terms select
  const termsWrap = h('label', { class: 'sg-licence-editor-field', 'data-field': 'terms' });
  termsWrap.append(h('span', { class: 'sg-licence-editor-label' },
    document.createTextNode('Terms')));
  const termsSel = h('select', { class: 'sg-licence-editor-input' });
  for (const t of PAYMENT_TERMS_OPTIONS) {
    const k = t.toLowerCase().trim();
    const startK = String(startTerms).toLowerCase().trim();
    termsSel.append(h('option', { value: t, selected: startK === k ? '' : null },
      document.createTextNode(t)));
  }
  termsWrap.append(termsSel);

  // Due date input
  const dueWrap = h('label', { class: 'sg-licence-editor-field', 'data-field': 'dueDate' });
  dueWrap.append(h('span', { class: 'sg-licence-editor-label' },
    document.createTextNode('Due date')));
  const dueInput = h('input', { type: 'date', class: 'sg-licence-editor-input',
    value: startDue ? String(startDue).slice(0, 10) : '' });
  dueWrap.append(dueInput);

  grid.append(termsWrap, dueWrap);

  const footer = h('div', { class: 'sg-licence-editor-footer' });
  const cancel = h('button', { type: 'button', class: 'sg-licence-editor-cancel' },
    document.createTextNode('Cancel'));
  const save = h('button', { type: 'submit', class: 'sg-licence-editor-save' },
    document.createTextNode('Save'));
  footer.append(cancel, save);

  form.append(grid, footer);
  pop.append(form);

  function commit() {
    const t = termsSel.value;
    const d = dueInput.value || null;
    // Preserve shape: if input was a plain string AND there's no due
    // date, keep it a string. Otherwise emit the object form.
    const next = (typeof prior === 'string' || prior == null) && !d
      ? t
      : { terms: t, dueDate: d };
    commitPaymentTerms(anchor, ctx, next);
    closePaymentTermsEditor();
  }
  form.addEventListener('submit', (e) => { e.preventDefault(); commit(); });
  cancel.addEventListener('click', () => closePaymentTermsEditor());

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closePaymentTermsEditor(); }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closePaymentTermsEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  termsSel.focus();
  activePaymentTermsEditor = { pop, onKey, onDocClick };
}

function commitPaymentTerms(td, ctx, next) {
  const { row, col, api } = ctx;
  const oldValue = row && col?.field != null ? row[col.field] : null;
  if (row && col?.field != null) row[col.field] = next;
  td._sgPaymentTerms = next;
  if (api?.applyTransaction) api.applyTransaction({ update: [row] });
  const grid = td.closest('[data-controller~="grid"]');
  if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
    bubbles: true,
    detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
  }));
}

/* ---------- callout-fee -------------------------------------------
 *
 * Service-call / callout fee indicator. Three modes:
 *
 *   number       → "$120 callout" pill (orange)
 *   'waived'     → "Waived" pill (gray)
 *   'included'   → "Included" pill (green)
 *   'charged'    → "Charged" pill (orange) — when no dollar amount known
 *   { amount, status? }  → both together; status overrides colour */
export function calloutFee({ currency = 'AUD', locale = 'en-AU' } = {}) {
  const STATUS_COLOR = { charged: 'orange', waived: 'gray', included: 'green' };
  return ({ value }) => {
    if (isBlank(value)) return '';
    let amount = null, status = null;
    if (typeof value === 'number') { amount = value; status = 'charged'; }
    else if (typeof value === 'string') status = value.toLowerCase();
    else if (typeof value === 'object') { amount = +value.amount; status = (value.status || (amount ? 'charged' : null) || '').toLowerCase(); }
    const color = STATUS_COLOR[status] || 'gray';
    const pill = h('span', { class: `sg-pill sg-pill-${color} sg-renderer-callout-fee` });
    if (amount != null && Number.isFinite(amount)) {
      pill.append(h('span', { class: 'sg-renderer-callout-fee-amount' },
        document.createTextNode(amount.toLocaleString(locale, { style: 'currency', currency }))));
    }
    pill.append(h('span', { class: 'sg-renderer-callout-fee-label' },
      document.createTextNode(status ? titleCaseStr(status) : 'Callout')));
    return pill;
  };
}

/* ---------- job-photo ---------------------------------------------
 *
 * Job site photo with a Before / During / After badge in the corner.
 * Value: URL string, or `{ url, stage, caption? }`. Stage drives the
 * badge colour (gray / blue / green). */
export function jobPhoto({ width = 60, height = 60 } = {}) {
  const STAGE_COLOR = { before: 'gray', during: 'blue', after: 'green' };
  return ({ value }) => {
    if (isBlank(value)) return '';
    const v = typeof value === 'string' ? { url: value } : value;
    if (!v.url) return '';
    const wrap = h('span', { class: 'sg-renderer-job-photo' });
    const link = h('a', {
      class: 'sg-renderer-job-photo-link', href: v.url,
      target: '_blank', rel: 'noopener noreferrer',
      title: v.caption || v.stage || 'Open photo',
    });
    link.append(h('img', {
      class: 'sg-renderer-job-photo-img', src: v.url,
      width, height, alt: v.caption || v.stage || 'Job photo',
    }));
    if (v.stage) {
      const k = String(v.stage).toLowerCase();
      const color = STAGE_COLOR[k] || 'gray';
      link.append(h('span', {
        class: `sg-renderer-job-photo-badge sg-pill sg-pill-${color}`,
      }, document.createTextNode(titleCaseStr(v.stage))));
    }
    wrap.append(link);
    return wrap;
  };
}

/* ---------- signature ---------------------------------------------
 *
 * Customer sign-off image preview + signature pad editor.
 *
 *   value: URL string  | { url, signedBy?, signedAt? }   (image data URI works)
 *
 * Read mode: 80×32 thumbnail. Click → open the full image in a new tab.
 *
 * Edit mode (default on): double-click the cell → popover signature pad.
 * Mouse + touch + stylus all draw; "Clear" wipes, "Save" trims to the
 * inked bounds, downsamples to a PNG data URI, and commits via
 * `grid:cellValueChanged`. The committed value has the same shape the
 * cell came in with (string → string, object → object); the renderer
 * preserves `signedBy` from the prior value and stamps `signedAt`
 * with the current ISO date. */
export function signature({ width = 80, height = 32, editable = true } = {}) {
  return (ctx) => {
    const { value, td } = ctx;
    if (td) {
      td.classList.add('sg-renderer-signature-cell');
      td._sgSignature = value;
      if (editable && !td._sgSignatureEditBound) {
        td._sgSignatureEditBound = true;
        td.addEventListener('dblclick', (e) => {
          if (e._sgSignatureHandled) return;
          e._sgSignatureHandled = true;
          e.stopPropagation();
          openSignatureEditor(td, ctx);
        });
      }
    }
    if (isBlank(value)) return h('span', { class: 'sg-renderer-signature is-empty' },
      document.createTextNode(editable ? 'dbl-click to sign' : '— unsigned —'));
    const v = typeof value === 'string' ? { url: value } : value;
    if (!v.url) return '';
    const wrap = h('span', { class: 'sg-renderer-signature' });
    const link = h('a', {
      class: 'sg-renderer-signature-link', href: v.url,
      target: '_blank', rel: 'noopener noreferrer',
      title: 'Open signature',
    });
    link.append(h('img', {
      class: 'sg-renderer-signature-img', src: v.url,
      width, height, alt: v.signedBy ? `Signed by ${v.signedBy}` : 'Signature',
    }));
    wrap.append(link);
    if (v.signedBy || v.signedAt) {
      const meta = h('span', { class: 'sg-renderer-signature-meta' });
      if (v.signedBy) meta.append(h('span', { class: 'sg-renderer-signature-by' },
        document.createTextNode(String(v.signedBy))));
      if (v.signedAt) {
        const d = new Date(v.signedAt);
        const fmt = Number.isNaN(d.valueOf()) ? String(v.signedAt)
          : `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`;
        meta.append(h('span', { class: 'sg-renderer-signature-when' },
          document.createTextNode(fmt)));
      }
      wrap.append(meta);
    }
    return wrap;
  };
}

let activeSignatureEditor = null;
function closeSignatureEditor() {
  if (!activeSignatureEditor) return;
  const { pop, onKey, onDocClick } = activeSignatureEditor;
  document.removeEventListener('keydown', onKey);
  document.removeEventListener('mousedown', onDocClick);
  pop.remove();
  activeSignatureEditor = null;
}

function openSignatureEditor(anchor, ctx) {
  closeSignatureEditor();
  const prior = anchor._sgSignature;
  const wasObj = prior && typeof prior === 'object';
  const startBy = wasObj ? (prior.signedBy || '') : '';

  // Popover scaffold.
  const pop = h('div', { class: 'sg-signature-editor', role: 'dialog' });
  pop.addEventListener('mousedown', (e) => e.stopPropagation());

  const header = h('div', { class: 'sg-signature-editor-header' },
    document.createTextNode('Sign here'));

  // Drawing surface — render at 2× CSS pixels for crisp output on HiDPI.
  const CSS_W = 380, CSS_H = 140;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const canvas = h('canvas', {
    class: 'sg-signature-editor-canvas',
    width: CSS_W * DPR, height: CSS_H * DPR,
    style: `width:${CSS_W}px;height:${CSS_H}px;`,
  });
  const ctx2d = canvas.getContext('2d');
  ctx2d.scale(DPR, DPR);
  ctx2d.lineWidth = 2;
  ctx2d.lineCap = 'round';
  ctx2d.lineJoin = 'round';
  ctx2d.strokeStyle = '#111827';

  let drawing = false, lastX = 0, lastY = 0, inked = false;
  function coords(e) {
    const r = canvas.getBoundingClientRect();
    const p = e.touches ? e.touches[0] : e;
    return [p.clientX - r.left, p.clientY - r.top];
  }
  function start(e) {
    e.preventDefault();
    drawing = true;
    [lastX, lastY] = coords(e);
  }
  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const [x, y] = coords(e);
    ctx2d.beginPath();
    ctx2d.moveTo(lastX, lastY);
    ctx2d.lineTo(x, y);
    ctx2d.stroke();
    lastX = x; lastY = y;
    inked = true;
  }
  function end() { drawing = false; }
  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  window.addEventListener('mouseup', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);

  // Signed-by row.
  const byWrap = h('label', { class: 'sg-signature-editor-by' });
  byWrap.append(h('span', { class: 'sg-signature-editor-by-label' },
    document.createTextNode('Signed by')));
  const byInput = h('input', { type: 'text', value: startBy,
    placeholder: 'Customer name',
    class: 'sg-signature-editor-by-input' });
  byWrap.append(byInput);

  // Footer.
  const footer = h('div', { class: 'sg-signature-editor-footer' });
  const clear = h('button', { type: 'button', class: 'sg-signature-editor-clear' },
    document.createTextNode('Clear'));
  const cancel = h('button', { type: 'button', class: 'sg-signature-editor-cancel' },
    document.createTextNode('Cancel'));
  const save = h('button', { type: 'button', class: 'sg-signature-editor-save' },
    document.createTextNode('Save'));
  footer.append(clear, cancel, save);

  pop.append(header, canvas, byWrap, footer);

  clear.addEventListener('click', () => {
    ctx2d.clearRect(0, 0, CSS_W, CSS_H);
    inked = false;
  });
  cancel.addEventListener('click', () => closeSignatureEditor());

  function commit() {
    if (!inked) {                       // empty pad → store null
      commitSignature(anchor, ctx, null);
      closeSignatureEditor();
      return;
    }
    // Trim to inked bounds so the saved image is tight.
    const trimmed = trimSignatureCanvas(canvas, DPR);
    const url = trimmed.toDataURL('image/png');
    // Preserve prior shape: string in → string out; object in → object out.
    const signedBy = byInput.value.trim() || (wasObj ? prior.signedBy || '' : '');
    const next = (typeof prior === 'string' || prior == null) && !signedBy
      ? url
      : { url, signedBy: signedBy || null, signedAt: new Date().toISOString().slice(0, 10) };
    commitSignature(anchor, ctx, next);
    closeSignatureEditor();
  }
  save.addEventListener('click', commit);

  function onKey(e) {
    if (e.key === 'Escape') { e.stopPropagation(); closeSignatureEditor(); }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); commit(); }
  }
  function onDocClick(e) {
    if (!pop.contains(e.target) && !anchor.contains(e.target)) closeSignatureEditor();
  }
  document.addEventListener('keydown', onKey);
  setTimeout(() => document.addEventListener('mousedown', onDocClick), 0);

  document.body.appendChild(pop);
  positionPopover(pop, anchor);
  activeSignatureEditor = { pop, onKey, onDocClick };
}

function trimSignatureCanvas(source, dpr) {
  // Scan pixel alpha to find the bounding box, then copy into a new canvas
  // sized to that box (+ small padding) so saved PNGs don't carry a sea of
  // transparent pixels around a tiny squiggle.
  const w = source.width, h = source.height;
  const data = source.getContext('2d').getImageData(0, 0, w, h).data;
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 0) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < minX) return source;       // empty pad — return as-is
  const pad = 4 * dpr;
  minX = Math.max(0, minX - pad); minY = Math.max(0, minY - pad);
  maxX = Math.min(w - 1, maxX + pad); maxY = Math.min(h - 1, maxY + pad);
  const tw = maxX - minX + 1, th = maxY - minY + 1;
  const out = document.createElement('canvas');
  out.width = tw; out.height = th;
  out.getContext('2d').drawImage(source, minX, minY, tw, th, 0, 0, tw, th);
  return out;
}

function commitSignature(td, ctx, next) {
  const { row, col, api } = ctx;
  const oldValue = row && col?.field != null ? row[col.field] : null;
  if (row && col?.field != null) row[col.field] = next;
  td._sgSignature = next;
  if (api?.applyTransaction) api.applyTransaction({ update: [row] });
  const grid = td.closest('[data-controller~="grid"]');
  if (grid) grid.dispatchEvent(new CustomEvent('grid:cellValueChanged', {
    bubbles: true,
    detail: { rowId: row?.id ?? row?._sg_id, colId: col?.field, oldValue, newValue: next },
  }));
}

/* ---------- defect / snag -----------------------------------------
 *
 * Snag-list item. Severity pill + short description.
 *
 *   value: { severity, title, status? }
 *     severity: 'critical' | 'major' | 'minor' | 'cosmetic'
 *     status:   'open' | 'closed' | 'wip'              (optional)
 *
 * Aliased as `snag` because the two terms get used interchangeably
 * across QA / PC inspection reports. */
export function defect() {
  const SEV_COLOR = { critical: 'red', major: 'orange', minor: 'yellow', cosmetic: 'gray' };
  return ({ value }) => {
    if (isBlank(value)) return '';
    const v = (typeof value === 'object') ? value : { title: String(value) };
    const wrap = h('span', { class: 'sg-renderer-defect' });
    const sev = v.severity ? String(v.severity).toLowerCase() : 'minor';
    const color = SEV_COLOR[sev] || 'gray';
    wrap.append(h('span', {
      class: `sg-pill sg-pill-${color} sg-renderer-defect-sev`,
    }, document.createTextNode(titleCaseStr(sev))));
    if (v.title) wrap.append(h('span', { class: 'sg-renderer-defect-title' },
      document.createTextNode(String(v.title))));
    if (v.status) {
      const st = String(v.status).toLowerCase();
      wrap.append(h('span', { class: `sg-renderer-defect-status is-${st}` },
        document.createTextNode(titleCaseStr(st))));
    }
    return wrap;
  };
}

/* ---------- variation ---------------------------------------------
 *
 * Variation order on a job. ID + dollar delta (signed) + status chip.
 *
 *   value: {
 *     id: 'VAR-001',
 *     delta: 2400,                          // signed AUD; negative = credit
 *     status: 'approved' | 'pending' | 'rejected' | 'draft',
 *   } */
export function variation({ currency = 'AUD', locale = 'en-AU' } = {}) {
  const STATUS_COLOR = { approved: 'green', pending: 'orange', rejected: 'red', draft: 'gray' };
  return ({ value }) => {
    if (isBlank(value)) return '';
    const v = (typeof value === 'object') ? value : { id: String(value) };
    const wrap = h('span', { class: 'sg-renderer-variation' });
    if (v.id) wrap.append(h('span', { class: 'sg-renderer-variation-id sg-renderer-mono' },
      document.createTextNode(String(v.id))));
    if (v.delta != null && Number.isFinite(+v.delta)) {
      const n = +v.delta;
      const fmt = Math.abs(n).toLocaleString(locale, { style: 'currency', currency });
      const sign = n > 0 ? '+' : n < 0 ? '-' : '';
      wrap.append(h('span', {
        class: `sg-renderer-variation-delta ${n >= 0 ? 'is-up' : 'is-down'}`,
      }, document.createTextNode(`${sign}${fmt}`)));
    }
    if (v.status) {
      const k = String(v.status).toLowerCase();
      const color = STATUS_COLOR[k] || 'gray';
      wrap.append(h('span', {
        class: `sg-pill sg-pill-${color} sg-renderer-variation-status`,
      }, document.createTextNode(titleCaseStr(v.status))));
    }
    return wrap;
  };
}

/* ---------- progress-claim ----------------------------------------
 *
 * Milestone progress claim. "Claim 2 of 5 · 40%" with a thin bar that
 * fills proportionally. Value: { index, total, percent } — percent is
 * 0-100, default = index/total * 100. */
export function progressClaim() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const v = (typeof value === 'object') ? value : { percent: Number(value) };
    const idx = +v.index || null;
    const tot = +v.total || null;
    let pct = v.percent != null ? Number(v.percent) : null;
    if (pct == null && idx && tot) pct = (idx / tot) * 100;
    if (pct != null) pct = Math.max(0, Math.min(100, pct));
    const wrap = h('span', { class: 'sg-renderer-progress-claim' });
    if (idx && tot) wrap.append(h('span', { class: 'sg-renderer-progress-claim-step' },
      document.createTextNode(`Claim ${idx} of ${tot}`)));
    if (pct != null) {
      const bar = h('span', { class: 'sg-renderer-progress-claim-bar' });
      bar.append(h('span', {
        class: 'sg-renderer-progress-claim-bar-fill',
        style: `width: ${pct.toFixed(1)}%;`,
      }));
      wrap.append(bar);
      wrap.append(h('span', { class: 'sg-renderer-progress-claim-pct' },
        document.createTextNode(`${Math.round(pct)}%`)));
    }
    return wrap;
  };
}

/* ---------- technician-slot ---------------------------------------
 *
 * Colour-coded calendar slot in a roster/dispatch grid. Same shape as
 * the chips in any week-view scheduler.
 *
 *   value: {
 *     start: '08:00', end: '10:30',  // HH:MM (string)
 *     label: 'J-1042 · Bondi',       // job ref / customer / etc.
 *     color: 'blue',                  // pill colour family
 *   } */
export function technicianSlot() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    if (typeof value === 'string') {
      return h('span', { class: 'sg-renderer-tech-slot sg-pill sg-pill-blue' },
        document.createTextNode(value));
    }
    const color = value.color || 'blue';
    const wrap = h('span', { class: `sg-renderer-tech-slot sg-pill sg-pill-${color}` });
    if (value.start || value.end) {
      const win = [value.start, value.end].filter(Boolean).join('–');
      wrap.append(h('span', { class: 'sg-renderer-tech-slot-time' },
        document.createTextNode(win)));
    }
    if (value.label) wrap.append(h('span', { class: 'sg-renderer-tech-slot-label' },
      document.createTextNode(String(value.label))));
    return wrap;
  };
}

/* ---------- travel-time -------------------------------------------
 *
 * ETA from the previous stop. Value: bare number (minutes), or
 * `{ minutes, distance?, traffic? }` where `traffic` is
 * 'light' | 'moderate' | 'heavy'. Renders "12 min · 4.2 km" with the
 * traffic-light icon coloured by congestion. */
export function travelTime() {
  const TRAFFIC_DOT = { light: '#22c55e', moderate: '#f59e0b', heavy: '#ef4444' };
  return ({ value }) => {
    if (isBlank(value)) return '';
    let minutes = null, distance = null, traffic = null;
    if (typeof value === 'number') minutes = value;
    else if (typeof value === 'object') {
      minutes = +value.minutes;
      distance = value.distance;
      traffic = value.traffic ? String(value.traffic).toLowerCase() : null;
    }
    if (!Number.isFinite(minutes)) return String(value);
    const wrap = h('span', { class: 'sg-renderer-travel-time' });
    if (traffic && TRAFFIC_DOT[traffic]) {
      wrap.append(h('span', {
        class: 'sg-renderer-travel-time-dot',
        title: `${traffic} traffic`,
        style: `background:${TRAFFIC_DOT[traffic]};`,
      }));
    }
    const parts = [];
    parts.push(`${minutes} min`);
    if (distance) parts.push(String(distance).includes('km') ? distance : `${distance} km`);
    wrap.append(h('span', { class: 'sg-renderer-travel-time-text' },
      document.createTextNode(parts.join(' · '))));
    return wrap;
  };
}

/* ---------- route-stop --------------------------------------------
 *
 * Position-in-route indicator for dispatch boards. "Stop 3 of 7" with a
 * row of dots that fill up to the current position. Useful next to a
 * day's run of jobs so the dispatcher can see how far through the
 * route each tech is at a glance.
 *
 * Value: { position, total } (1-based) — or [position, total]. */
export function routeStop({ maxDots = 10 } = {}) {
  return ({ value }) => {
    if (isBlank(value)) return '';
    let pos = 0, total = 0;
    if (Array.isArray(value)) { pos = +value[0] || 0; total = +value[1] || 0; }
    else if (typeof value === 'object') { pos = +value.position || 0; total = +value.total || 0; }
    else if (typeof value === 'number') pos = value;
    if (!total || !Number.isFinite(total)) return String(pos || '');
    const wrap = h('span', { class: 'sg-renderer-route-stop' });
    const dots = h('span', { class: 'sg-renderer-route-stop-dots' });
    const visible = Math.min(total, maxDots);
    for (let i = 1; i <= visible; i++) {
      dots.append(h('span', {
        class: `sg-renderer-route-stop-dot${i <= pos ? ' is-on' : ''}`,
      }));
    }
    wrap.append(dots);
    wrap.append(h('span', { class: 'sg-renderer-route-stop-label' },
      document.createTextNode(`${pos} of ${total}`)));
    return wrap;
  };
}

export function arrivalWindow({ now = () => new Date() } = {}) {
  const fmt12 = (d) => {
    let h = d.getHours();
    const m = d.getMinutes();
    const ap = h >= 12 ? 'pm' : 'am';
    h = h % 12 || 12;
    return m === 0 ? `${h}${ap}` : `${h}:${String(m).padStart(2, '0')}${ap}`;
  };
  const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return ({ value }) => {
    if (isBlank(value)) return '';
    let start = null, end = null;
    if (typeof value === 'string') {
      return h('span', { class: 'sg-renderer-arrival-window' },
        document.createTextNode(value));
    }
    if (Array.isArray(value)) { [start, end] = value; }
    else if (typeof value === 'object') { start = value.start; end = value.end; }
    const sd = start ? new Date(start) : null;
    const ed = end ? new Date(end) : null;
    if (!sd || Number.isNaN(sd.valueOf())) return '';
    const today = now();
    const sameDay = sd.toDateString() === today.toDateString();
    const winLabel = ed && !Number.isNaN(ed.valueOf())
      ? `${fmt12(sd)}–${fmt12(ed)}`
      : fmt12(sd);
    const dateLabel = sameDay
      ? 'today'
      : `${DOW[sd.getDay()]} ${sd.getDate()} ${MON[sd.getMonth()]}`;
    let cls = 'is-future';
    const startMs = sd.getTime();
    const endMs = ed && !Number.isNaN(ed.valueOf()) ? ed.getTime() : startMs + 60 * 60 * 1000;
    const nowMs = today.getTime();
    if (nowMs > endMs + 30 * 60 * 1000) cls = 'is-late';
    else if (nowMs > endMs)             cls = 'is-overdue';
    else if (nowMs >= startMs)          cls = 'is-open';
    const wrap = h('span', { class: `sg-renderer-arrival-window ${cls}` });
    wrap.append(h('span', { class: 'sg-renderer-arrival-window-time' },
      document.createTextNode(winLabel)));
    wrap.append(h('span', { class: 'sg-renderer-arrival-window-date' },
      document.createTextNode(dateLabel)));
    return wrap;
  };
}

/* ---------- insurance-cert ----------------------------------------
 *
 * Insurance Certificate of Currency. Shape differs from the other
 * compliance cards — the issuing badge is the *insurer name* rather
 * than an AU state. `class` carries the policy type (PL / PI / WC /
 * Tools); `number` is the policy number; `issuer` is the insurer.
 *
 *   value: {
 *     issuer:  'CGU',                  // insurer name
 *     class:   'PL $20m',              // policy type + cover
 *     number:  'PCY-22038A',           // policy number
 *     expires: '2026-11-30',           // ISO date
 *   } */
export function insuranceCert() {
  return ({ value }) => {
    if (isBlank(value)) return '';
    const wrap = h('span', { class: 'sg-renderer-compliance' });
    if (typeof value === 'string') {
      wrap.append(h('span', { class: 'sg-renderer-compliance-prefix' },
        document.createTextNode('Cert')));
      wrap.append(h('span', { class: 'sg-renderer-mono' }, document.createTextNode(value)));
      return wrap;
    }
    if (value.issuer) wrap.append(h('span', { class: 'sg-renderer-compliance-prefix' },
      document.createTextNode(String(value.issuer))));
    if (value.class) wrap.append(h('span', { class: 'sg-renderer-compliance-class' },
      document.createTextNode(String(value.class))));
    if (value.number) wrap.append(h('span', { class: 'sg-renderer-mono' },
      document.createTextNode(String(value.number))));
    const exp = expiryBadge(value.expires);
    if (exp) wrap.append(exp);
    return wrap;
  };
}

// Pre-register every parameter-less built-in under its plain name so users can
// reference them without an explicit registerRenderer() call at boot. Anything
// that *needs* config (statusPill, currency w/ non-USD, percent w/ scale) is
// available via the named exports above.
registerRenderer('email',         email());
registerRenderer('url',           url());
registerRenderer('phone',         phone());
registerRenderer('currency',      currency());
registerRenderer('percent',       percent());
registerRenderer('progress-bar',  progressBar());
registerRenderer('star-rating',   starRating());
registerRenderer('tags',          tags());
registerRenderer('country-flag',  countryFlag());
registerRenderer('abn',           abn());
registerRenderer('avatar',        avatar());
registerRenderer('date',          date());
registerRenderer('datetime',      datetime());
registerRenderer('relative-time', relativeTime());
registerRenderer('duration',      duration());
registerRenderer('number',         number());
registerRenderer('compact-number', compactNumber());
registerRenderer('file-size',      fileSize());
registerRenderer('boolean',        boolean());
registerRenderer('delta',          delta());
registerRenderer('truncate',       truncate());
registerRenderer('copyable',       copyable());
registerRenderer('image',          image());
registerRenderer('color-swatch',   colorSwatch());
registerRenderer('sparkline',      sparkline());
registerRenderer('heatmap-cell',   heatmap());
registerRenderer('mask',           mask());
registerRenderer('highlight',      highlight());
registerRenderer('multi-line',     multiLine());
registerRenderer('attachments',    attachments());
registerRenderer('address-au',     addressAu());
registerRenderer('checkbox',       checkbox());
registerRenderer('switch',         switchRenderer());
registerRenderer('markdown',       markdown());
registerRenderer('json',           json());
registerRenderer('linked-record',  linkedRecord());
registerRenderer('coloured-tags',  colouredTags());
registerRenderer('time',           time());
registerRenderer('diff',           diff());
registerRenderer('geo',            geo());
registerRenderer('qr',             qr());
registerRenderer('code',           code());
registerRenderer('rating',         rating());
registerRenderer('bullet',         bullet());
registerRenderer('donut',          donut());
registerRenderer('histogram',      histogram());
registerRenderer('rag',            rag());
registerRenderer('timeline-steps', timelineSteps());
registerRenderer('mention',        mention());
registerRenderer('expand',         expand());
registerRenderer('units',          units());
registerRenderer('ip-address',     ipAddress());
registerRenderer('bsb',            bsb());
registerRenderer('acn',            acn());
registerRenderer('tfn',            tfn());
registerRenderer('medicare',       medicare());
registerRenderer('audio',          audio());
registerRenderer('video',          video());
registerRenderer('reactions',      reactions());
registerRenderer('comment-count',  commentCount());
registerRenderer('ordinal',        ordinal());
registerRenderer('plural',         plural());
registerRenderer('empty',          empty());
registerRenderer('credit-card',    creditCard());
registerRenderer('loading-shimmer', loadingShimmer());
registerRenderer('audio-attachment', audioAttachment());
registerRenderer('select',           select());
registerRenderer('multiselect',       multiselect());
registerRenderer('combobox',          combobox());
registerRenderer('slider',            slider());
registerRenderer('date-picker',       datePicker());
registerRenderer('time-picker',       timePicker());
registerRenderer('date-range',        dateRange());
registerRenderer('color-picker',      colorPicker());
registerRenderer('textarea',          textarea());
registerRenderer('action-button',     actionButton());
registerRenderer('menu',              menu());
registerRenderer('split-button',      splitButton());
registerRenderer('row-actions',       rowActions());
registerRenderer('drag-handle',       dragHandle());
registerRenderer('row-number',        rowNumber());
registerRenderer('expand-toggle',     expandToggle());
registerRenderer('avatar-stack',      avatarStack());
registerRenderer('presence',          presence());
registerRenderer('assignee',          assignee());
registerRenderer('uuid',              uuid());
registerRenderer('git-sha',           gitSha());
registerRenderer('mac-address',       macAddress());
registerRenderer('license-key',       licenseKey());
registerRenderer('vin',               vin());
registerRenderer('isbn',              isbn());
registerRenderer('iban',              iban());
registerRenderer('swift',             swift());
registerRenderer('ssn',               ssn());
registerRenderer('ein',               ein());
registerRenderer('vat',               vat());
registerRenderer('nin',               nin());
registerRenderer('postal-code',       postalCode());
registerRenderer('address-us',        addressUs());
registerRenderer('address-generic',   addressGeneric());
registerRenderer('barcode',           barcode());
registerRenderer('gauge',             gauge());
registerRenderer('win-loss',          winLoss());
registerRenderer('mini-bar-chart',    miniBarChart());
registerRenderer('mini-line-chart',   miniLineChart());
registerRenderer('trend',             trend());
registerRenderer('countdown',         countdown());
registerRenderer('age',               age());
registerRenderer('fiscal-period',     fiscalPeriod());
registerRenderer('timezone',          timezone());
registerRenderer('cron',              cron());
registerRenderer('spinner',           spinner());
registerRenderer('error',             errorCell());
registerRenderer('sync-status',       syncStatus());
registerRenderer('stale',             staleCell());
registerRenderer('fresh',             freshCell());
registerRenderer('favicon',           favicon());
registerRenderer('domain',            domain());
registerRenderer('social-link',       socialLink());
registerRenderer('tracking-number',   trackingNumber());
registerRenderer('video-link',        videoLink());
registerRenderer('file',              file());
registerRenderer('download-link',     downloadLink());
registerRenderer('mime-icon',         mimeIcon());
registerRenderer('gallery',           gallery());
registerRenderer('waveform',          waveform());
registerRenderer('html',              html());
registerRenderer('yaml',              yaml());
registerRenderer('xml',               xml());
registerRenderer('autolink',          autolink());
registerRenderer('redacted',          redacted());
registerRenderer('spoiler',           spoiler());
registerRenderer('fraction',          fraction());
registerRenderer('scientific',        scientific());
registerRenderer('hex',               radix({ base: 16 }));
registerRenderer('binary',            radix({ base: 2 }));
registerRenderer('octal',             radix({ base: 8 }));
registerRenderer('percentile',        percentile());
registerRenderer('battery',           battery());
registerRenderer('signal-bars',       signalBars());
registerRenderer('volume',            volumeIndicator());
registerRenderer('trade-licence',     tradeLicence());
registerRenderer('white-card',        whiteCard());
registerRenderer('blue-card',         blueCard());
registerRenderer('wwcc',              wwcc());
registerRenderer('high-risk-licence', highRiskLicence());
registerRenderer('coes',              coes());
registerRenderer('coc',               coc());
registerRenderer('qbcc-licence',      qbccLicence());
registerRenderer('vba-licence',       vbaLicence());
registerRenderer('gas-certificate',   gasCertificate());
registerRenderer('asbestos-licence',  asbestosLicence());
registerRenderer('refrigerant-licence', refrigerantLicence());
registerRenderer('pool-safety-cert',  poolSafetyCert());
registerRenderer('test-and-tag',      testAndTag());
registerRenderer('insurance-cert',    insuranceCert());
registerRenderer('gst-status',        gstStatus());
registerRenderer('abn-status',        abnStatus());
registerRenderer('hbcf-cert',         hbcfCert());
registerRenderer('job-status',        jobStatus());
registerRenderer('arrival-window',    arrivalWindow());
registerRenderer('route-stop',        routeStop());
registerRenderer('travel-time',       travelTime());
registerRenderer('technician-slot',   technicianSlot());
registerRenderer('progress-claim',    progressClaim());
registerRenderer('variation',         variation());
registerRenderer('defect',            defect());
registerRenderer('snag',              defect());      // alias — same shape, different vocabulary
registerRenderer('signature',         signature());
registerRenderer('job-photo',         jobPhoto());
registerRenderer('callout-fee',       calloutFee());
registerRenderer('payment-terms',     paymentTerms());
registerRenderer('invoice-status',    invoiceStatus());
registerRenderer('retention',         retention());
registerRenderer('materials-pick',    materialsPick());
registerRenderer('swms-status',       swmsStatus());
registerRenderer('jsa-status',        jsaStatus());
registerRenderer('toolbox-talk',      toolboxTalk());
registerRenderer('ppe-checklist',     ppeChecklist());
registerRenderer('incident-severity', incidentSeverity());
registerRenderer('hazard-rating',     hazardRating());
registerRenderer('site-induction',    siteInduction());
registerRenderer('trade-type',        tradeType());
registerRenderer('skill-endorsement', skillEndorsement());
registerRenderer('subcontractor',     subcontractor());
registerRenderer('crew',              crew());
registerRenderer('rego-plate',        regoPlate());
registerRenderer('rego-status',       regoStatus());
registerRenderer('ctp-status',        ctpStatus());
registerRenderer('service-due',       serviceDue());
registerRenderer('fuel-card',         fuelCard());
registerRenderer('odometer',          odometer());
registerRenderer('customer-type',     customerType());
registerRenderer('strata-plan',       strataPlan());
registerRenderer('lot-plan',          lotPlan());
registerRenderer('council-lga',       councilLga());
registerRenderer('region-classifier', regionClassifier());

/* ---------- built-in clipboard wiring -------------------------------
 *
 * Every entry attaches `copyValue` / `parseValue` to the renderer
 * instance that `registerRenderer('…', factory())` placed in the
 * registry above. Users who register their OWN factory instance — e.g.
 * `registerRenderer('eur', currency({ currency: 'EUR' }))` — can either
 * use `withClipboard()` to attach a matching pair OR rely on the
 * column-type fallback the grid uses when a renderer has no
 * copyValue / parseValue defined.
 *
 * For renderers whose behaviour depends on configuration (select /
 * multiselect / combobox / rag), parse functions read from
 * `ctx.col.cellRendererConfig` / `ctx.col.enumValues` at parse time —
 * the same path the render functions use, so the wiring works for any
 * column without per-instance refitting.
 *
 * `withClipboard` is re-exported so external code can attach the same
 * round-trip semantics to custom renderers it builds. */

export { withClipboard };

// Small kit of reusable clipboard pairs. Each is named after the value
// shape it handles, not the renderer that uses it — so the reader can
// see exactly what the round-trip contract is.
const clip = {
  // Plain text. The 99% case.
  text: {
    copy:  ({ value }) => value == null ? '' : String(value),
    parse: (text) => String(text ?? ''),
  },
  // Numeric — strips currency / percent / commas before Number().
  number: {
    copy:  ({ value }) => value == null || value === '' ? '' : String(value),
    parse: parseNumeric,
  },
  // Boolean — true / false / yes / no / 1 / 0 / on / off / ✓ / ✗.
  boolean: {
    copy:  ({ value }) => value === true ? 'true'
                       : value === false ? 'false'
                       : value == null   ? ''
                       : String(value),
    parse: parseBooleanText,
  },
  // ISO date (YYYY-MM-DD). Date objects normalise to ISO on copy;
  // already-string values round-trip as supplied so existing
  // "2026-05-25" strings come back exactly as they went out.
  date: {
    copy: ({ value }) => {
      if (value == null || value === '') return '';
      if (value instanceof Date && !Number.isNaN(value.valueOf())) {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      return String(value);
    },
    parse: (text) => {
      const s = String(text ?? '');
      if (s === '') return '';
      const d = new Date(s);
      return Number.isNaN(d.valueOf()) ? undefined : s;
    },
  },
  // ISO datetime (full ISO 8601).
  datetime: {
    copy: ({ value }) => {
      if (value == null || value === '') return '';
      if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString();
      return String(value);
    },
    parse: (text) => {
      const s = String(text ?? '');
      if (s === '') return '';
      const d = new Date(s);
      return Number.isNaN(d.valueOf()) ? undefined : s;
    },
  },
  // Comma-separated strings. Preserves array-ness if the original was
  // an array (the renderer's display call has its own normalisation).
  stringList: {
    copy:  ({ value }) => Array.isArray(value) ? value.join(', ')
                       : isBlank(value)        ? ''
                       : String(value),
    parse: (text) => {
      const s = String(text ?? '').trim();
      if (s === '') return [];
      return s.split(/\s*,\s*/).filter(Boolean);
    },
  },
  // Comma-separated numbers (sparkline / histogram).
  numberList: {
    copy: ({ value }) => Array.isArray(value) ? value.join(', ') : '',
    parse: (text) => {
      const s = String(text ?? '').trim();
      if (s === '') return [];
      const parts = s.split(/\s*,\s*/).filter(Boolean).map(Number);
      return parts.some((n) => !Number.isFinite(n)) ? undefined : parts;
    },
  },
  // JSON for object / array values. Non-JSON text passes through as a
  // string — the renderer may still know what to do with it.
  json: {
    copy: ({ value }) => {
      if (value == null || value === '') return '';
      if (typeof value === 'string') return value;
      try { return JSON.stringify(value); }
      catch (_) { return String(value); }
    },
    parse: (text) => {
      const s = String(text ?? '').trim();
      if (s === '') return '';
      try { return JSON.parse(s); }
      catch (_) { return undefined; }
    },
  },
  // Strip non-digit chars on parse; pass the raw value through on copy
  // (renderer formats it). Used by abn / acn / bsb / medicare /
  // credit-card / phone — anything where the persisted form is digits.
  digits: {
    copy:  ({ value }) => value == null ? '' : String(value).trim(),
    parse: (text) => {
      const s = String(text ?? '');
      if (s === '') return '';
      const digits = s.replace(/\D/g, '');
      return digits || s;          // keep raw if no digits — renderer marks invalid
    },
  },
};

// Per-renderer wiring. Each line attaches one pair to one registered
// renderer. Listed in the same order as the registerRenderer block above
// so any omission is obvious at a glance.
function wireBuiltin(name, pair) {
  const fn = getRenderer(name);
  if (fn) withClipboard(fn, pair);
}

wireBuiltin('email',          { copy: clip.text.copy, parse: (t) => String(t ?? '').trim() });
wireBuiltin('url',            { copy: clip.text.copy, parse: (t) => String(t ?? '').trim() });
wireBuiltin('phone',          clip.digits);
wireBuiltin('currency',       clip.number);
wireBuiltin('percent',        {
  copy:  clip.number.copy,
  parse: (text) => parseNumeric(String(text ?? '').replace(/%$/, '')),
});
wireBuiltin('progress-bar',   clip.number);
wireBuiltin('star-rating',    clip.number);
wireBuiltin('tags',           clip.stringList);
wireBuiltin('country-flag',   {
  copy:  ({ value }) => value == null ? '' : String(value).trim().toUpperCase(),
  parse: (text) => {
    const k = String(text ?? '').trim().toUpperCase();
    return /^[A-Z]{2}$/.test(k) ? k : undefined;
  },
});
wireBuiltin('abn',            clip.digits);
wireBuiltin('avatar',         clip.text);
wireBuiltin('date',           clip.date);
wireBuiltin('datetime',       clip.datetime);
wireBuiltin('relative-time',  clip.datetime);
wireBuiltin('duration',       {
  copy:  clip.number.copy,
  // Accept either a bare number ("125000") OR a human form ("2h 5m" /
  // "02:05:00"). The parsed value is in milliseconds — most columns
  // already use that; the renderer's `unit` option converts on display.
  parse: (text) => {
    const s = String(text ?? '').trim();
    if (s === '') return '';
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    const colon = /^(\d+):(\d+)(?::(\d+))?$/.exec(s);
    if (colon) {
      const a = +colon[1], b = +colon[2], c = colon[3] ? +colon[3] : 0;
      const totalSec = colon[3] ? a * 3600 + b * 60 + c : a * 60 + b;
      return totalSec * 1000;
    }
    let ms = 0; let touched = false;
    const re = /(-?\d+(?:\.\d+)?)\s*(ms|milliseconds?|s|sec|seconds?|m|min|minutes?|h|hr|hours?|d|days?)\b/gi;
    let m;
    while ((m = re.exec(s)) !== null) {
      const n = Number(m[1]); const u = m[2].toLowerCase();
      if (u.startsWith('ms') || u.startsWith('milli'))     ms += n;
      else if (u === 's' || u.startsWith('sec'))           ms += n * 1000;
      else if (u === 'm' || u.startsWith('min'))           ms += n * 60_000;
      else if (u.startsWith('h'))                          ms += n * 3_600_000;
      else if (u.startsWith('d'))                          ms += n * 86_400_000;
      touched = true;
    }
    return touched ? ms : undefined;
  },
});
wireBuiltin('number',         clip.number);
wireBuiltin('compact-number', {
  copy:  clip.number.copy,
  parse: (text) => {
    const s = String(text ?? '').trim();
    if (s === '') return '';
    const m = /^(-?\d+(?:\.\d+)?)\s*([kmbt])$/i.exec(s);
    if (m) {
      const n = Number(m[1]);
      const unit = m[2].toLowerCase();
      const mult = unit === 'k' ? 1e3 : unit === 'm' ? 1e6 : unit === 'b' ? 1e9 : 1e12;
      return Number.isFinite(n) ? n * mult : undefined;
    }
    return parseNumeric(s);
  },
});
wireBuiltin('file-size',      {
  copy:  clip.number.copy,
  parse: (text) => {
    const s = String(text ?? '').trim();
    if (s === '') return '';
    const m = /^(-?\d+(?:\.\d+)?)\s*(b|kb|mb|gb|tb|pb|kib|mib|gib|tib|pib)?$/i.exec(s);
    if (!m) return parseNumeric(s);
    const n = Number(m[1]);
    if (!Number.isFinite(n)) return undefined;
    const unit = (m[2] || 'b').toLowerCase();
    const base = unit.endsWith('ib') ? 1024 : 1000;
    const k = unit.endsWith('ib') ? unit.slice(0, -2) + 'b' : unit;
    const map = { b: 1, kb: base, mb: base ** 2, gb: base ** 3, tb: base ** 4, pb: base ** 5 };
    return n * (map[k] ?? 1);
  },
});
wireBuiltin('boolean',        clip.boolean);
wireBuiltin('delta',          clip.number);
wireBuiltin('truncate',       clip.text);
wireBuiltin('copyable',       clip.text);
wireBuiltin('image',          { copy: clip.text.copy, parse: (t) => String(t ?? '').trim() });
wireBuiltin('color-swatch',   { copy: clip.text.copy, parse: (t) => String(t ?? '').trim() });
wireBuiltin('sparkline',      clip.numberList);
wireBuiltin('heatmap-cell',   clip.number);
wireBuiltin('mask',           clip.text);
wireBuiltin('highlight',      clip.text);
wireBuiltin('multi-line',     clip.text);
wireBuiltin('attachments',    {
  copy:  clip.json.copy,
  parse: (text) => {
    const out = clip.json.parse(text);
    if (out === undefined) return undefined;
    if (out === '' || out == null) return [];
    return Array.isArray(out) ? out : undefined;
  },
});
wireBuiltin('address-au',     {
  copy: ({ value }) => {
    if (value == null || value === '') return '';
    if (typeof value === 'string') return value;
    if (typeof value !== 'object') return String(value);
    try { return JSON.stringify(value); }
    catch (_) { return String(value); }
  },
  parse: (text) => {
    const s = String(text ?? '').trim();
    if (s === '') return null;
    if (s.startsWith('{')) {
      try { return JSON.parse(s); }
      catch (_) { /* fall through — renderer treats raw text as _raw */ }
    }
    return s;
  },
});
wireBuiltin('checkbox',       clip.boolean);
wireBuiltin('switch',         clip.boolean);
wireBuiltin('markdown',       clip.text);
wireBuiltin('json',           clip.json);
wireBuiltin('linked-record',  {
  copy:  ({ value }) => {
    if (value == null || value === '') return '';
    if (Array.isArray(value)) return value.join(', ');
    return String(value);
  },
  parse: (text) => {
    const s = String(text ?? '');
    if (s === '') return '';
    return s.includes(',') ? s.split(/\s*,\s*/).filter(Boolean) : s;
  },
});
wireBuiltin('coloured-tags',  clip.stringList);
wireBuiltin('time',           {
  copy:  ({ value }) => value == null ? '' : String(value).trim(),
  parse: (text) => {
    const s = String(text ?? '').trim();
    if (s === '') return '';
    const m12 = /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)$/i.exec(s);
    if (m12) {
      let h = parseInt(m12[1], 10);
      const mn = m12[2]; const sec = m12[3];
      if (m12[4].toLowerCase() === 'pm' && h < 12) h += 12;
      if (m12[4].toLowerCase() === 'am' && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${mn}${sec ? ':' + sec : ''}`;
    }
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) return s;
    if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
    return undefined;
  },
});
wireBuiltin('diff',           {
  copy: ({ value }) => {
    if (value == null || value === '') return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return `${value[0] ?? ''} → ${value[1] ?? ''}`;
    const from = value.from ?? value.old ?? value.before ?? value.previous ?? null;
    const to   = value.to   ?? value.new ?? value.after  ?? value.current  ?? null;
    if (from == null && to == null) return '';
    return `${from ?? ''} → ${to ?? ''}`;
  },
  parse: (text) => {
    const s = String(text ?? '').trim();
    if (s === '') return null;
    const m = /^(.*?)\s*(?:→|->|=>|—>)\s*(.+)$/.exec(s);
    if (m) return { from: m[1].trim(), to: m[2].trim() };
    return { from: null, to: s };
  },
});
wireBuiltin('geo',            {
  copy: ({ value }) => {
    if (value == null || value === '') return '';
    if (Array.isArray(value)) return `${value[0]}, ${value[1]}`;
    if (typeof value === 'object') {
      const lat = value.lat ?? value.latitude;
      const lng = value.lng ?? value.long ?? value.lon ?? value.longitude;
      return `${lat}, ${lng}`;
    }
    return String(value);
  },
  parse: (text) => {
    const s = String(text ?? '').trim();
    if (s === '') return null;
    const parts = s.split(/\s*,\s*/);
    if (parts.length !== 2) return undefined;
    const lat = Number(parts[0]), lng = Number(parts[1]);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
    return { lat, lng };
  },
});
wireBuiltin('qr',             clip.text);
wireBuiltin('code',           clip.text);
wireBuiltin('rating',         clip.number);
wireBuiltin('bullet',         clip.number);
wireBuiltin('donut',          clip.number);
wireBuiltin('histogram',      clip.numberList);
wireBuiltin('rag',            {
  // RAG_TOKENS lookup keeps "high" / "low" / "critical" / "ok" /
  // "passive" / "detractor" all parseable to the three canonical bands.
  copy:  ({ value }) => value == null ? '' : String(value).trim().toLowerCase(),
  parse: (text) => {
    const s = String(text ?? '').trim();
    if (s === '') return '';
    const k = s.toLowerCase();
    if (RAG_TOKENS[k]) return RAG_TOKENS[k];
    if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
    return undefined;
  },
});
wireBuiltin('timeline-steps', clip.text);
wireBuiltin('mention',        clip.text);
wireBuiltin('expand',         clip.text);
wireBuiltin('units',          clip.number);
wireBuiltin('ip-address',     { copy: clip.text.copy, parse: (t) => String(t ?? '').trim() });
wireBuiltin('bsb',            clip.digits);
wireBuiltin('acn',            clip.digits);
wireBuiltin('tfn',            clip.digits);
wireBuiltin('medicare',       clip.digits);
wireBuiltin('audio',          { copy: clip.text.copy, parse: (t) => String(t ?? '').trim() });
wireBuiltin('video',          { copy: clip.text.copy, parse: (t) => String(t ?? '').trim() });
wireBuiltin('reactions',      clip.json);
wireBuiltin('comment-count',  {
  copy:  ({ value }) => {
    if (value == null || value === '') return '';
    if (typeof value === 'object') {
      const text = value.value ?? value.text ?? '';
      const count = value.count ?? value.comments ?? null;
      if (count != null && text) return `${text} (${count})`;
      if (count != null) return String(count);
      return String(text);
    }
    return String(value);
  },
  parse: (text) => {
    const s = String(text ?? '').trim();
    if (s === '') return '';
    const m = /^(.*?)\s*\((\d+)\)$/.exec(s);
    if (m) return { value: m[1].trim(), count: Number(m[2]) };
    if (/^\d+$/.test(s)) return Number(s);
    return s;
  },
});
wireBuiltin('ordinal',        {
  copy:  clip.number.copy,
  parse: (text) => {
    const s = String(text ?? '').trim();
    if (s === '') return '';
    const m = /^(-?\d+)(?:st|nd|rd|th)?$/i.exec(s);
    return m ? Number(m[1]) : undefined;
  },
});
wireBuiltin('plural',         clip.number);
wireBuiltin('empty',          clip.text);
wireBuiltin('credit-card',    clip.digits);
wireBuiltin('loading-shimmer', clip.text);
wireBuiltin('audio-attachment', {
  copy: ({ value }) => {
    if (value == null || value === '') return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') return value.url || JSON.stringify(value);
    return String(value);
  },
  parse: (text) => {
    const s = String(text ?? '').trim();
    if (s === '') return null;
    if (s.startsWith('{')) {
      try { return JSON.parse(s); }
      catch (_) { /* fall through */ }
    }
    return s;
  },
});
// select / multiselect / combobox read options from
// ctx.col.cellRendererConfig at parse time — the same path the renderer
// uses at render time. A column wired through Rails' column DSL (which
// writes cellRendererConfig.options) round-trips through copy/paste
// without per-renderer config plumbing.
wireBuiltin('select',         {
  copy:  ({ value }) => value == null || value === '' ? '' : String(value),
  parse: (text, ctx) => {
    const s = String(text ?? '');
    if (s === '') return null;
    const opts = ctx?.col?.cellRendererConfig?.options || ctx?.col?.enumValues || [];
    if (!Array.isArray(opts) || opts.length === 0) return s;
    const norm = (v) => String(v).trim().toLowerCase();
    const k = norm(s);
    for (const o of opts) {
      const value = typeof o === 'object' ? o.value : o;
      const label = typeof o === 'object' ? (o.label ?? value) : o;
      if (norm(value) === k || norm(label) === k) return value;
    }
    return undefined;
  },
});
wireBuiltin('multiselect',    {
  copy: ({ value }) => Array.isArray(value) ? value.join(', ')
                     : isBlank(value)        ? ''
                     : String(value),
  parse: (text, ctx) => {
    const s = String(text ?? '').trim();
    if (s === '') return [];
    const tokens = s.split(/\s*,\s*/).filter(Boolean);
    const opts = ctx?.col?.cellRendererConfig?.options || ctx?.col?.enumValues || [];
    if (!Array.isArray(opts) || opts.length === 0) return tokens;
    const norm = (v) => String(v).trim().toLowerCase();
    const out = [];
    for (const t of tokens) {
      const k = norm(t);
      const match = opts.find((o) => {
        const value = typeof o === 'object' ? o.value : o;
        const label = typeof o === 'object' ? (o.label ?? value) : o;
        return norm(value) === k || norm(label) === k;
      });
      if (!match) return undefined;   // any unmatchable token → reject the whole paste
      out.push(typeof match === 'object' ? match.value : match);
    }
    return out;
  },
});
wireBuiltin('combobox',       {
  copy:  ({ value }) => value == null || value === '' ? '' : String(value),
  parse: (text, ctx) => {
    const s = String(text ?? '');
    if (s === '') return null;
    const opts = ctx?.col?.cellRendererConfig?.options || ctx?.col?.enumValues || [];
    const allowCustom = !!ctx?.col?.cellRendererConfig?.allowCustom;
    if (Array.isArray(opts) && opts.length > 0) {
      const norm = (v) => String(v).trim().toLowerCase();
      const k = norm(s);
      for (const o of opts) {
        const value = typeof o === 'object' ? o.value : o;
        const label = typeof o === 'object' ? (o.label ?? value) : o;
        if (norm(value) === k || norm(label) === k) return value;
      }
      return allowCustom ? s : undefined;
    }
    return s;
  },
});
wireBuiltin('slider',         clip.number);
wireBuiltin('date-picker',    clip.date);
wireBuiltin('time-picker',    {
  // The picker commits HH:MM (24-hour) regardless of display style, so
  // clipboard round-trips do the same.
  copy: ({ value }) => value == null ? '' : String(value),
  parse: (text) => {
    const s = String(text ?? '').trim();
    if (s === '') return '';
    const m12 = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(s);
    if (m12) {
      let h = parseInt(m12[1], 10);
      if (m12[3].toLowerCase() === 'pm' && h < 12) h += 12;
      if (m12[3].toLowerCase() === 'am' && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${m12[2]}`;
    }
    if (/^\d{1,2}:\d{2}$/.test(s)) {
      const [h, m] = s.split(':');
      return `${h.padStart(2, '0')}:${m}`;
    }
    return undefined;
  },
});
wireBuiltin('date-range',     {
  copy: ({ value }) => {
    if (value == null || value === '') return '';
    let start, end;
    if (Array.isArray(value)) [start, end] = value;
    else if (typeof value === 'object') { start = value.start || value.from; end = value.end || value.to; }
    else return String(value);
    const fmt = (d) => {
      if (!d) return '';
      const dt = d instanceof Date ? d : new Date(d);
      if (Number.isNaN(dt.valueOf())) return String(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    return `${fmt(start)}/${fmt(end)}`;
  },
  parse: (text) => {
    const s = String(text ?? '').trim();
    if (s === '') return null;
    // Split on "/" OR an en-dash OR a space-padded hyphen. We mustn't
    // split on a bare "-" — that lives inside ISO dates ("2026-06-01").
    const parts = s.split(/\s*\/\s*|\s*[–]\s*|\s+-\s+/);
    if (parts.length < 2) return undefined;
    const [start, end] = parts;
    const check = (p) => p === '' || !Number.isNaN(new Date(p).valueOf());
    if (!check(start) || !check(end)) return undefined;
    return [start, end];
  },
});
wireBuiltin('color-picker',   { copy: clip.text.copy, parse: (t) => String(t ?? '').trim() });
wireBuiltin('textarea',       clip.text);
// action-button / menu / split-button / row-actions are action triggers,
// not data — they don't carry a meaningful cell value. Wired as plain
// text so the cell still copies a sensible string (the value, if any)
// and pastes don't blow up.
wireBuiltin('action-button',  clip.text);
wireBuiltin('menu',           clip.text);
wireBuiltin('split-button',   clip.text);
wireBuiltin('row-actions',    clip.text);
wireBuiltin('trade-licence',  clip.json);
wireBuiltin('white-card',     clip.json);
wireBuiltin('blue-card',      clip.json);
wireBuiltin('wwcc',           clip.json);
wireBuiltin('high-risk-licence', clip.json);
wireBuiltin('coes',           clip.json);
wireBuiltin('coc',            clip.json);
wireBuiltin('qbcc-licence',   clip.json);
wireBuiltin('vba-licence',    clip.json);
wireBuiltin('gas-certificate', clip.json);
wireBuiltin('asbestos-licence', clip.json);
wireBuiltin('refrigerant-licence', clip.json);
wireBuiltin('pool-safety-cert', clip.json);
wireBuiltin('test-and-tag',   clip.json);
wireBuiltin('insurance-cert', clip.json);
wireBuiltin('gst-status',     clip.text);
wireBuiltin('abn-status',     clip.text);
wireBuiltin('hbcf-cert',      clip.json);
wireBuiltin('job-status',     clip.text);
wireBuiltin('arrival-window', clip.json);
wireBuiltin('route-stop',     clip.json);
wireBuiltin('travel-time',    clip.json);
wireBuiltin('technician-slot', clip.json);
wireBuiltin('progress-claim', clip.json);
wireBuiltin('variation',      clip.json);
wireBuiltin('defect',         clip.json);
wireBuiltin('snag',           clip.json);
wireBuiltin('signature',      clip.json);
wireBuiltin('job-photo',      clip.json);
wireBuiltin('callout-fee',    clip.json);
wireBuiltin('payment-terms',  clip.json);
wireBuiltin('invoice-status', clip.text);
wireBuiltin('retention',      clip.json);
wireBuiltin('materials-pick', clip.json);
wireBuiltin('swms-status',    clip.text);
wireBuiltin('jsa-status',     clip.text);
wireBuiltin('toolbox-talk',   clip.json);
wireBuiltin('ppe-checklist',  clip.stringList);
wireBuiltin('incident-severity', clip.text);
wireBuiltin('hazard-rating',  clip.json);
wireBuiltin('site-induction', clip.json);
wireBuiltin('trade-type',     clip.text);
wireBuiltin('skill-endorsement', clip.json);
wireBuiltin('subcontractor',  clip.json);
wireBuiltin('crew',           clip.json);
wireBuiltin('rego-plate',     clip.json);
wireBuiltin('rego-status',    clip.json);
wireBuiltin('ctp-status',     clip.json);
wireBuiltin('service-due',    clip.json);
wireBuiltin('fuel-card',      clip.json);
wireBuiltin('odometer',       clip.number);
wireBuiltin('customer-type',  clip.text);
wireBuiltin('strata-plan',    clip.json);
wireBuiltin('lot-plan',       clip.json);
wireBuiltin('council-lga',    clip.json);
wireBuiltin('region-classifier', clip.text);

export const renderers = {
  email, url, phone, currency, percent, progressBar, starRating, tags,
  countryFlag, abn, avatar, statusPill,
  date, datetime, relativeTime, duration,
  number, compactNumber, fileSize,
  boolean, delta,
  truncate, copyable, image, colorSwatch, sparkline,
  heatmap, mask, highlight, multiLine, attachments, addressAu,
  checkbox, switch: switchRenderer, markdown, json, linkedRecord, colouredTags, time,
  diff, geo, qr, code, rating, bullet, donut, histogram, rag, timelineSteps,
  mention, expand, units, ipAddress, bsb, acn, tfn, medicare,
  audio, video, reactions, commentCount, ordinal, plural, empty, creditCard,
  loadingShimmer, audioAttachment,
  select, multiselect, combobox, slider, datePicker, timePicker, dateRange,
  colorPicker, textarea,
  actionButton, menu, splitButton, rowActions,
  dragHandle, rowNumber, expandToggle,
  avatarStack, presence, assignee,
  uuid, gitSha, macAddress, licenseKey, vin, isbn,
  iban, swift, ssn, ein, vat, nin,
  postalCode, addressUs, addressGeneric, barcode,
  gauge, winLoss, miniBarChart, miniLineChart, trend,
  countdown, age, fiscalPeriod, timezone, cron,
  spinner, errorCell, syncStatus, staleCell, freshCell,
  favicon, domain, socialLink, trackingNumber, videoLink,
  file, downloadLink, mimeIcon, gallery, waveform,
  html, yaml, xml, autolink, redacted, spoiler,
  fraction, scientific, radix, percentile,
  battery, signalBars, volumeIndicator,
  tradeLicence, whiteCard, blueCard, wwcc, highRiskLicence, coes, coc,
  qbccLicence, vbaLicence, gasCertificate, asbestosLicence, refrigerantLicence,
  poolSafetyCert, testAndTag, insuranceCert,
  gstStatus, abnStatus, hbcfCert,
  jobStatus, arrivalWindow, routeStop, travelTime, technicianSlot, progressClaim,
  variation, defect, signature, jobPhoto, calloutFee, paymentTerms, invoiceStatus,
  retention, materialsPick,
  swmsStatus, jsaStatus, toolboxTalk, ppeChecklist, incidentSeverity, hazardRating,
  siteInduction,
  tradeType, skillEndorsement, subcontractor, crew,
  regoPlate, regoStatus, ctpStatus, serviceDue, fuelCard, odometer,
  customerType, strataPlan, lotPlan, councilLga, regionClassifier,
};
