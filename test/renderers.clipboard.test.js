// @vitest-environment jsdom
//
// Unit tests for the renderer copy/paste contract. Verifies that each
// built-in renderer's registered instance carries `copyValue` /
// `parseValue` and that they round-trip the values the renderer is meant
// to display.
//
// These tests don't drive a real grid — they pull the renderer instance
// out of the registry and call its clipboard hooks directly. The grid-
// level paste flow is exercised separately in renderers.attachments.test.js
// (the attachments editor) and via the demo pages.

import { describe, it, expect } from 'vitest';
import {
  getRenderer,
  withClipboard,
  defaultParseValue,
  defaultCopyValue,
} from '../src/lib/renderers.js';

// Helper: minimal ctx the clipboard hooks expect. Real grid passes
// { value, row, col, td, formatted, api }; renderers only read what they
// need (mostly value + col.cellRendererConfig).
function ctx(value, col = {}) {
  return { value, row: {}, col };
}

/* ------------------------------------------------------------------ *
 * Core contract                                                       *
 * ------------------------------------------------------------------ */

describe('clipboard contract — defaults', () => {
  it('defaultCopyValue prefers formatted, falls back to value', () => {
    expect(defaultCopyValue(42, {}, '$42.00')).toBe('$42.00');
    expect(defaultCopyValue(42, {}, '')).toBe('42');
    expect(defaultCopyValue(null, {}, '')).toBe('');
  });

  it('defaultParseValue passes text through by default', () => {
    expect(defaultParseValue('hello', {})).toBe('hello');
    expect(defaultParseValue('', {})).toBe('');
  });

  it('defaultParseValue coerces by column type', () => {
    expect(defaultParseValue('42', { type: 'number' })).toBe(42);
    expect(defaultParseValue('foo', { type: 'number' })).toBeUndefined();

    expect(defaultParseValue('yes', { type: 'boolean' })).toBe(true);
    expect(defaultParseValue('no', { type: 'boolean' })).toBe(false);
    expect(defaultParseValue('maybe', { type: 'boolean' })).toBeUndefined();

    expect(defaultParseValue('2026-05-25', { type: 'date' })).toBe('2026-05-25');
    expect(defaultParseValue('not-a-date', { type: 'date' })).toBeUndefined();
  });

  it('withClipboard attaches copy / parse to a function', () => {
    const fn = () => null;
    const out = withClipboard(fn, {
      copy:  ({ value }) => `c:${value}`,
      parse: (text) => `p:${text}`,
    });
    expect(out).toBe(fn);            // mutates in place
    expect(fn.copyValue({ value: 7 })).toBe('c:7');
    expect(fn.parseValue('x')).toBe('p:x');
  });

  it('withClipboard ignores non-function hook values', () => {
    const fn = () => null;
    withClipboard(fn, { copy: 'not-a-fn', parse: undefined });
    expect(fn.copyValue).toBeUndefined();
    expect(fn.parseValue).toBeUndefined();
  });
});

/* ------------------------------------------------------------------ *
 * Built-in registrations — sanity                                     *
 * ------------------------------------------------------------------ */

describe('every registered built-in has copyValue + parseValue', () => {
  // The list mirrors the registerRenderer block at the bottom of
  // renderers.js. If a new built-in lands without clipboard wiring,
  // this test fails — that's the point.
  const NAMES = [
    'email', 'url', 'phone', 'currency', 'percent', 'progress-bar',
    'star-rating', 'tags', 'country-flag', 'abn', 'avatar', 'date',
    'datetime', 'relative-time', 'duration', 'number', 'compact-number',
    'file-size', 'boolean', 'delta', 'truncate', 'copyable', 'image',
    'color-swatch', 'sparkline', 'heatmap-cell', 'mask', 'highlight',
    'multi-line', 'attachments', 'address-au', 'checkbox', 'switch',
    'markdown', 'json', 'linked-record', 'coloured-tags', 'time', 'diff',
    'geo', 'qr', 'code', 'rating', 'bullet', 'donut', 'histogram', 'rag',
    'timeline-steps', 'mention', 'expand', 'units', 'ip-address', 'bsb',
    'acn', 'tfn', 'medicare', 'audio', 'video', 'reactions',
    'comment-count', 'ordinal', 'plural', 'empty', 'credit-card',
    'loading-shimmer', 'audio-attachment', 'select', 'multiselect',
    'combobox', 'slider', 'date-picker', 'time-picker', 'date-range',
  ];

  it.each(NAMES)('%s renderer carries copy + parse', (name) => {
    const fn = getRenderer(name);
    expect(fn, `getRenderer('${name}')`).toBeTruthy();
    expect(typeof fn.copyValue, `${name}.copyValue`).toBe('function');
    expect(typeof fn.parseValue, `${name}.parseValue`).toBe('function');
  });
});

/* ------------------------------------------------------------------ *
 * Round-trip suites — one per value-shape category                    *
 * ------------------------------------------------------------------ */

describe('numeric renderers round-trip', () => {
  it.each([
    ['currency', 1234.5,        '1234.5',        '$1,234.50'],
    ['number',   42,            '42',            '42'],
    ['percent',  87,            '87',            '87%'],
    ['delta',   -3.2,           '-3.2',          '-3.2%'],
    ['rating',   4.5,           '4.5',           '4.5'],
    ['bullet',   72,            '72',            '72'],
    ['donut',    65,            '65',            '65'],
    ['progress-bar', 50,        '50',            '50'],
    ['star-rating', 3,          '3',             '3'],
    ['heatmap-cell', 25,        '25',            '25'],
    ['units',    99,            '99',            '99'],
    ['slider',   30,            '30',            '30'],
  ])('%s — copy(%s) → %s; parse(%s) → number', (name, value, copyExpected, pastedInput) => {
    const fn = getRenderer(name);
    expect(fn.copyValue(ctx(value))).toBe(copyExpected);
    const parsed = fn.parseValue(pastedInput);
    expect(typeof parsed).toBe('number');
  });

  it('currency rejects non-numeric paste', () => {
    expect(getRenderer('currency').parseValue('not a number')).toBeUndefined();
  });

  it('compact-number expands K / M / B / T', () => {
    const fn = getRenderer('compact-number');
    expect(fn.parseValue('1.2K')).toBe(1200);
    expect(fn.parseValue('3.4M')).toBe(3_400_000);
    expect(fn.parseValue('2B')).toBe(2_000_000_000);
    expect(fn.parseValue('1T')).toBe(1_000_000_000_000);
    expect(fn.parseValue('42')).toBe(42);                  // plain number still works
  });

  it('file-size accepts unit suffixes (decimal + binary)', () => {
    const fn = getRenderer('file-size');
    expect(fn.parseValue('1024')).toBe(1024);
    expect(fn.parseValue('1 KB')).toBe(1000);
    expect(fn.parseValue('1 KiB')).toBe(1024);
    expect(fn.parseValue('4.5 MB')).toBe(4_500_000);
    expect(fn.parseValue('2 GiB')).toBe(2 * 1024 ** 3);
  });

  it('ordinal accepts both bare numbers and ordinal suffixes', () => {
    const fn = getRenderer('ordinal');
    expect(fn.parseValue('1')).toBe(1);
    expect(fn.parseValue('1st')).toBe(1);
    expect(fn.parseValue('22nd')).toBe(22);
    expect(fn.parseValue('103rd')).toBe(103);
    expect(fn.parseValue('999th')).toBe(999);
  });
});

describe('boolean renderers round-trip', () => {
  it.each(['boolean', 'checkbox', 'switch'])('%s — copy/parse the standard truthy set', (name) => {
    const fn = getRenderer(name);
    expect(fn.copyValue(ctx(true))).toBe('true');
    expect(fn.copyValue(ctx(false))).toBe('false');
    expect(fn.copyValue(ctx(null))).toBe('');

    for (const truthy of ['true', 'yes', 'y', '1', 'on', '✓', 't']) {
      expect(fn.parseValue(truthy), `truthy ${truthy}`).toBe(true);
    }
    for (const falsy of ['false', 'no', 'n', '0', 'off', '✗', '—']) {
      expect(fn.parseValue(falsy), `falsy ${falsy}`).toBe(false);
    }
    expect(fn.parseValue('maybe')).toBeUndefined();
  });
});

describe('date renderers round-trip', () => {
  it('date copies Date → YYYY-MM-DD and parses ISO back', () => {
    const fn = getRenderer('date');
    const d = new Date(2026, 4, 25);                // May 25, 2026 local
    expect(fn.copyValue(ctx(d))).toBe('2026-05-25');
    expect(fn.parseValue('2026-05-25')).toBe('2026-05-25');
    expect(fn.parseValue('not-a-date')).toBeUndefined();
  });

  it('date passes string values through as-is on copy', () => {
    const fn = getRenderer('date');
    expect(fn.copyValue(ctx('2026-05-25'))).toBe('2026-05-25');
  });

  it('datetime copies Date → ISO and parses any Date-acceptable string', () => {
    const fn = getRenderer('datetime');
    const d = new Date('2026-05-25T09:30:00Z');
    expect(fn.copyValue(ctx(d))).toBe('2026-05-25T09:30:00.000Z');
    expect(fn.parseValue('2026-05-25T09:30:00Z')).toBe('2026-05-25T09:30:00Z');
  });

  it('time normalises 12h and 24h forms', () => {
    const fn = getRenderer('time');
    expect(fn.parseValue('9:30')).toBe('9:30');
    expect(fn.parseValue('09:30')).toBe('09:30');
    expect(fn.parseValue('3:45 PM')).toBe('15:45');
    expect(fn.parseValue('12:00 AM')).toBe('00:00');
    expect(fn.parseValue('not a time')).toBeUndefined();
  });

  it('time-picker zero-pads 24h output', () => {
    const fn = getRenderer('time-picker');
    expect(fn.parseValue('9:30')).toBe('09:30');
    expect(fn.parseValue('3:45 PM')).toBe('15:45');
  });

  it('date-range copies "start/end"; parses back', () => {
    const fn = getRenderer('date-range');
    expect(fn.copyValue(ctx(['2026-06-01', '2026-06-07']))).toBe('2026-06-01/2026-06-07');
    expect(fn.parseValue('2026-06-01/2026-06-07')).toEqual(['2026-06-01', '2026-06-07']);
    expect(fn.parseValue('2026-06-01 – 2026-06-07')).toEqual(['2026-06-01', '2026-06-07']);
    expect(fn.parseValue('garbage / also garbage')).toBeUndefined();
  });

  it('duration accepts bare ms, h:m:s, and human shorthand', () => {
    const fn = getRenderer('duration');
    expect(fn.parseValue('60000')).toBe(60000);
    expect(fn.parseValue('1:30')).toBe(90_000);
    expect(fn.parseValue('1:00:00')).toBe(3_600_000);
    expect(fn.parseValue('2h 5m')).toBe(2 * 3_600_000 + 5 * 60_000);
    expect(fn.parseValue('1 hour 30 minutes')).toBe(3_600_000 + 30 * 60_000);
    expect(fn.parseValue('not a duration')).toBeUndefined();
  });
});

describe('list renderers round-trip', () => {
  it('tags split / join via comma', () => {
    const fn = getRenderer('tags');
    expect(fn.copyValue(ctx(['ruby', 'rails']))).toBe('ruby, rails');
    expect(fn.parseValue('ruby, rails')).toEqual(['ruby', 'rails']);
    expect(fn.parseValue('')).toEqual([]);
  });

  it('coloured-tags share the list contract', () => {
    const fn = getRenderer('coloured-tags');
    expect(fn.parseValue('p0, p1, p2')).toEqual(['p0', 'p1', 'p2']);
  });

  it('sparkline / histogram parse number lists; reject mixed types', () => {
    const spark = getRenderer('sparkline');
    expect(spark.copyValue(ctx([1, 2, 3]))).toBe('1, 2, 3');
    expect(spark.parseValue('1, 2, 3')).toEqual([1, 2, 3]);
    expect(spark.parseValue('1, foo, 3')).toBeUndefined();

    const hist = getRenderer('histogram');
    expect(hist.parseValue('5, 10, 15')).toEqual([5, 10, 15]);
  });
});

describe('object renderers round-trip via JSON', () => {
  it('json copies stringified; parses back', () => {
    const fn = getRenderer('json');
    expect(fn.copyValue(ctx({ a: 1, b: [2, 3] }))).toBe('{"a":1,"b":[2,3]}');
    expect(fn.parseValue('{"a":1}')).toEqual({ a: 1 });
    expect(fn.parseValue('not json')).toBeUndefined();
  });

  it('json passes strings through unchanged on copy', () => {
    const fn = getRenderer('json');
    expect(fn.copyValue(ctx('{"a":1}'))).toBe('{"a":1}');
  });

  it('attachments require array — JSON object alone is rejected', () => {
    const fn = getRenderer('attachments');
    expect(fn.parseValue('[{"id":1,"filename":"a.png","url":"/a.png"}]')).toEqual([
      { id: 1, filename: 'a.png', url: '/a.png' },
    ]);
    expect(fn.parseValue('{}')).toBeUndefined();
    expect(fn.parseValue('')).toEqual([]);
  });

  it('reactions round-trip JSON or object shape', () => {
    const fn = getRenderer('reactions');
    expect(fn.copyValue(ctx({ '👍': 3 }))).toBe('{"👍":3}');
    expect(fn.parseValue('{"👍":3}')).toEqual({ '👍': 3 });
  });

  it('address-au round-trips JSON OR falls into _raw for free-form text', () => {
    const fn = getRenderer('address-au');
    const addr = { address1: '12 Smith St', suburb: 'Bondi', state: 'NSW', postcode: '2026' };
    const copied = fn.copyValue(ctx(addr));
    expect(JSON.parse(copied)).toEqual(addr);
    expect(fn.parseValue(copied)).toEqual(addr);
    expect(fn.parseValue('1 Sesame St, Somewhere NSW 2000')).toBe('1 Sesame St, Somewhere NSW 2000');
  });

  it('geo parses "lat, lng"; rejects malformed', () => {
    const fn = getRenderer('geo');
    expect(fn.copyValue(ctx({ lat: -33.86, lng: 151.21 }))).toBe('-33.86, 151.21');
    expect(fn.parseValue('-33.86, 151.21')).toEqual({ lat: -33.86, lng: 151.21 });
    expect(fn.parseValue('not a coord')).toBeUndefined();
  });

  it('diff round-trips "from → to"', () => {
    const fn = getRenderer('diff');
    expect(fn.copyValue(ctx({ from: 'pending', to: 'shipped' }))).toBe('pending → shipped');
    expect(fn.parseValue('pending → shipped')).toEqual({ from: 'pending', to: 'shipped' });
    expect(fn.parseValue('pending -> shipped')).toEqual({ from: 'pending', to: 'shipped' });
  });
});

describe('select / multiselect / combobox match against options', () => {
  const col = (options) => ({ cellRendererConfig: { options } });

  it('select matches by value (case-insensitive)', () => {
    const fn = getRenderer('select');
    expect(fn.parseValue('low', { col: col(['Low', 'Medium', 'High']) })).toBe('Low');
    expect(fn.parseValue('HIGH', { col: col(['Low', 'Medium', 'High']) })).toBe('High');
    expect(fn.parseValue('extreme', { col: col(['Low', 'Medium', 'High']) })).toBeUndefined();
  });

  it('select matches by label when option is { value, label }', () => {
    const fn = getRenderer('select');
    const options = [
      { value: 'p0', label: 'Critical' },
      { value: 'p1', label: 'High' },
    ];
    expect(fn.parseValue('Critical', { col: col(options) })).toBe('p0');
    expect(fn.parseValue('p1', { col: col(options) })).toBe('p1');
  });

  it('select with no options passes value through as text', () => {
    const fn = getRenderer('select');
    expect(fn.parseValue('anything', { col: {} })).toBe('anything');
  });

  it('multiselect splits + matches every token; rejects on any unknown', () => {
    const fn = getRenderer('multiselect');
    const options = ['Ruby', 'JS', 'CSS'];
    expect(fn.parseValue('Ruby, JS', { col: col(options) })).toEqual(['Ruby', 'JS']);
    expect(fn.parseValue('ruby, js, css', { col: col(options) })).toEqual(['Ruby', 'JS', 'CSS']);
    expect(fn.parseValue('Ruby, Go', { col: col(options) })).toBeUndefined();
  });

  it('combobox honours allowCustom for free-form pastes', () => {
    const fn = getRenderer('combobox');
    const strict = { cellRendererConfig: { options: ['Sydney', 'Melbourne'] } };
    const loose  = { cellRendererConfig: { options: ['Sydney', 'Melbourne'], allowCustom: true } };
    expect(fn.parseValue('Sydney', { col: strict })).toBe('Sydney');
    expect(fn.parseValue('Hobart', { col: strict })).toBeUndefined();
    expect(fn.parseValue('Hobart', { col: loose })).toBe('Hobart');
  });
});

describe('digit-stripping renderers', () => {
  it('abn / acn / bsb / tfn / medicare / credit-card all strip non-digits on parse', () => {
    for (const name of ['abn', 'acn', 'bsb', 'tfn', 'medicare', 'credit-card']) {
      const fn = getRenderer(name);
      expect(fn.parseValue('1234 5678 9'), name).toBe('123456789');
      expect(fn.parseValue('11-222-333'), name).toBe('11222333');
      expect(fn.parseValue(''), name).toBe('');
    }
  });

  it('phone strips non-digits too', () => {
    const fn = getRenderer('phone');
    expect(fn.parseValue('+61 4 1234 5678')).toBe('61412345678');
    expect(fn.parseValue('(02) 9999 1234')).toBe('0299991234');
  });
});

describe('text-shape renderers', () => {
  it.each(['email', 'url', 'image', 'color-swatch', 'audio', 'video', 'color-picker', 'ip-address'])(
    '%s trims pasted text', (name) => {
    const fn = getRenderer(name);
    expect(fn.parseValue('  https://example.com  ')).toBe('https://example.com');
  });

  it.each(['truncate', 'copyable', 'mask', 'highlight', 'multi-line', 'markdown', 'code',
           'qr', 'mention', 'expand', 'timeline-steps', 'empty', 'loading-shimmer',
           'avatar', 'textarea'])('%s passes text through as-is', (name) => {
    const fn = getRenderer(name);
    expect(fn.copyValue(ctx('hello'))).toBe('hello');
    expect(fn.parseValue('hello')).toBe('hello');
  });

  it('country-flag validates ISO 2-letter format', () => {
    const fn = getRenderer('country-flag');
    expect(fn.copyValue(ctx('au'))).toBe('AU');
    expect(fn.parseValue('au')).toBe('AU');
    expect(fn.parseValue('Australia')).toBeUndefined();
    expect(fn.parseValue('XYZ')).toBeUndefined();
  });
});

describe('rag — token map + numeric thresholds', () => {
  it('canonicalises aliases to red / amber / green', () => {
    const fn = getRenderer('rag');
    expect(fn.parseValue('Red')).toBe('red');
    expect(fn.parseValue('HIGH')).toBe('red');
    expect(fn.parseValue('passive')).toBe('amber');
    expect(fn.parseValue('promoter')).toBe('green');
    expect(fn.parseValue('not-a-token')).toBeUndefined();
  });

  it('accepts numeric values (renderer maps them via thresholds at display)', () => {
    expect(getRenderer('rag').parseValue('72')).toBe(72);
  });
});

describe('comment-count round-trip', () => {
  it('copies "text (N)" for object shape', () => {
    const fn = getRenderer('comment-count');
    expect(fn.copyValue(ctx({ value: 'Hello', count: 3 }))).toBe('Hello (3)');
    expect(fn.parseValue('Hello (3)')).toEqual({ value: 'Hello', count: 3 });
    expect(fn.parseValue('42')).toBe(42);
  });
});

describe('linked-record handles both single and multi forms', () => {
  it('single key passes through; CSV splits to array', () => {
    const fn = getRenderer('linked-record');
    expect(fn.parseValue('123')).toBe('123');
    expect(fn.parseValue('1, 2, 3')).toEqual(['1', '2', '3']);
  });
});

describe('blank-value behaviour', () => {
  // Spot-check across renderer categories.
  it.each([
    'currency', 'number', 'boolean', 'date', 'datetime', 'tags',
    'sparkline', 'json', 'select', 'multiselect',
  ])('%s copy(null) → empty string', (name) => {
    expect(getRenderer(name).copyValue(ctx(null))).toBe('');
    expect(getRenderer(name).copyValue(ctx(''))).toBe('');
  });
});
