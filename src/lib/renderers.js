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
registerRenderer('audio-attachment', audioAttachment());

export const renderers = {
  email, url, phone, currency, percent, progressBar, starRating, tags,
  countryFlag, abn, avatar, statusPill,
  date, datetime, relativeTime, duration,
  number, compactNumber, fileSize,
  boolean, delta,
  truncate, copyable, image, colorSwatch, sparkline,
  heatmap, mask, highlight, multiLine, attachments, addressAu,
  checkbox, switch: switchRenderer, markdown, json, linkedRecord, colouredTags, time,
  diff, audioAttachment,
};
