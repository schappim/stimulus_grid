# Cell renderers — implementation plan

A checklist of cell renderers to ship into `stimulus_grid`'s built-in
`src/lib/renderers.js` registry, in priority order. Each one gets:

1. Implementation in `src/lib/renderers.js`
2. Default registration at the bottom of that file (plain-name handle)
3. CSS in `src/styles/grid.css` (under the existing `.sg-renderer-*` scope)
4. Re-export inside the `renderers` object literal (and the per-name `export`)
5. Row in the SKILL.md built-in-renderers table
6. A numbered demo at `demo/NN-name.html`
7. Entry added to `demo/index.html`
8. `npm run build:lib` so the demo's `dist/` reference resolves
9. One commit per renderer (`feat(renderers): name — short description`)

> Currently shipping (do not duplicate): email, url, phone, currency, percent,
> number, compact-number, file-size, duration, date, datetime, relative-time,
> boolean, status-pill, progress-bar, star-rating, delta, sparkline, heatmap,
> color-swatch, truncate, copyable, mask, highlight, multi-line, tags,
> country-flag, image, attachments, avatar, abn, address-au.

---

## Tier 1 — biggest gaps (most-requested missing primitives)

- [x] **35 — `checkbox`** Interactive boolean toggle (click to flip). Commits via `applyTransaction`. Distinct from the read-only `boolean` icon renderer.
- [x] **36 — `switch`** Same semantics as `checkbox` but rendered as an on/off pill switch.
- [x] **37 — `audio-attachment`** (landed via parallel work) Howler-powered audio player popover with scrub bar, ±10s skips, volume + close.
- [x] **38 — `markdown`** Render `**bold**`, `*italic*`, `[links](…)`, `` `code` ``, lists. Tiny dependency-free parser.
- [x] **39 — `json`** Pretty-print + collapsible preview for object/array values. Truncates to first N keys with a "+N more" toggle.
- [x] **40 — `linked-record`** Airtable-style FK chip — resolves the value via a lookup map / function to a display name (and optional thumbnail).
- [x] **41 — `coloured-tags`** Per-value colour-mapped multi-select chips (Notion / Airtable convention). Sibling to `tags`.
- [x] **42 — `time`** HH:MM (or HH:MM:SS) — formats a time string or Date. Sibling to `date` / `datetime`.
- [x] **43 — `diff`** `old → new` before/after rendering. For audit-log columns; configurable arrow / colour.
- [ ] **44 — `geo`** Lat-lng pair → small "View on Maps" link + DMS / decimal display + optional static-thumb hook.
- [ ] **45 — `qr`** Inline SVG QR code from the cell value. Pure JS (Reed-Solomon + matrix).
- [ ] **46 — `code`** Monospace code snippet with optional language hint + copy button. No syntax-highlighter dep.

## Tier 2 — refinements / variants

- [ ] **47 — `rating` (configurable icon)** Hearts / thumbs / smiley / NPS bands. Same engine as `star-rating` but with a swappable glyph + colour band map.
- [ ] **48 — `bullet`** Bullet-chart range bar — value on a min-max axis with optional target band marker.
- [ ] **49 — `donut`** Single-percentage donut chart (sibling to `progress-bar`).
- [ ] **50 — `histogram`** Frequency bars from an array (sibling to `sparkline`).
- [ ] **51 — `rag`** Pure red / amber / green dot — no label. Risk-dashboard primitive.
- [ ] **52 — `timeline-steps`** Ordered status progression ("Pending → Shipped → Delivered") with current step highlighted.
- [ ] **53 — `mention`** Parses `@user` and `#tag` inside long text into styled chips.
- [ ] **54 — `expand`** Click-to-expand long text in-place (vs `truncate`'s clip-with-hover-tooltip).
- [ ] **55 — `units`** Distance / temperature / weight formatter ("12 km", "23 °C", "1.4 kg"). Locale-aware unit conversion.
- [ ] **56 — `ip-address`** IPv4 / IPv6 validation + monospace formatting + optional country flag from the cell value.

## Tier 3 — AU-niche identifiers (consistent with `phone(AU)`, `abn`, `address-au`)

- [ ] **57 — `bsb`** Bank-State-Branch, 6 digits as `XXX-XXX`, with optional bank-name lookup.
- [ ] **58 — `acn`** Australian Company Number, 9 digits with checksum (mod-10 weights `8,7,6,5,4,3,2,1`), formatted `XXX XXX XXX`. Links to ASIC.
- [ ] **59 — `tfn`** Tax File Number — always masked (regulatory rule), last 3 visible. Read-only by design.
- [ ] **60 — `medicare`** 10-digit Medicare number, optional IRN suffix, formatted `XXXX XXXXX X / N`.

## Tier 4 — lower priority / niche

- [ ] **61 — `audio`** Inline `<audio controls>` player from a URL (lightweight sibling to `audio-attachment`).
- [ ] **62 — `video`** Inline `<video controls>` player from a URL.
- [ ] **63 — `reactions`** 👍 3 ❤️ 1 strip from an object/array of emoji counts.
- [ ] **64 — `comment-count`** Value + small "💬 N" badge.
- [ ] **65 — `ordinal`** "1st / 2nd / 3rd" for ranking columns. Locale-aware where possible.
- [ ] **66 — `plural`** Count + plural-sensitive label ("0 items / 1 item / 2 items"), driven by `Intl.PluralRules`.
- [ ] **67 — `empty`** Explicit styleable null/blank renderer with a configurable placeholder.
- [ ] **68 — `credit-card`** Luhn-validated + brand-detected (Visa/MC/Amex/Discover/JCB) formatted card display.
- [ ] **69 — `loading-shimmer`** Placeholder shimmer cell for async-loaded rows.
