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

export const renderers = {
  email, url, phone, currency, percent, progressBar, starRating, tags,
  countryFlag, abn, avatar, statusPill,
  date, datetime, relativeTime, duration,
};
