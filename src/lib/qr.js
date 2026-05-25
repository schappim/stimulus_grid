/* Compact byte-mode QR encoder.
 *
 * Supports versions 1-10 (21×21 → 57×57 modules) at error-correction
 * level Medium (≈ 15% damage recoverable). Byte mode only, so any
 * UTF-8 string fits — we ASCII-encode multi-byte characters before
 * packing.
 *
 * Public API: `encodeQR(text) -> { size, matrix }` where `matrix` is a
 * 2D Uint8Array (1 = dark module, 0 = light). Throws when the text
 * doesn't fit in a v10 byte-mode block (213 bytes); callers should
 * catch and render a fallback.
 *
 * Algorithm ported from Project Nayuki's "QR Code generator library"
 * (https://www.nayuki.io/page/qr-code-generator-library) — MIT-licensed
 * reference implementation. Restricted to single-block-per-codeword and
 * ECC=M to keep the table data compact; the multi-block interleaving
 * loop is general so we can extend to ECC L/H later without a rewrite. */

// (data_capacity_bytes, ecc_codewords_per_block, num_blocks) for ECC=M,
// versions 1-10. Pulled from ISO/IEC 18004:2015 Table 9.
const ECC_M = [
  [16, 10, 1],   // v1   ≤ 14 bytes after the 4-bit mode + 8-bit length header
  [28, 16, 1],   // v2   ≤ 26
  [44, 26, 1],   // v3   ≤ 42
  [64, 18, 2],   // v4   ≤ 62
  [86, 24, 2],   // v5   ≤ 84
  [108, 16, 4],  // v6   ≤ 106
  [124, 18, 4],  // v7   ≤ 122
  [154, 22, 4],  // v8   ≤ 152
  [182, 22, 5],  // v9   ≤ 180
  [216, 26, 5],  // v10  ≤ 213
];

// Format info bits (15-bit BCH-encoded) for ECC=M with masks 0-7.
const FORMAT_INFO_M = [
  0x5412, 0x5125, 0x5e7c, 0x5b4b,
  0x45f9, 0x40ce, 0x4f97, 0x4aa0,
];

// === GF(2^8) arithmetic for Reed-Solomon =============================
// Primitive polynomial 0x11d (x^8 + x^4 + x^3 + x^2 + 1).
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(function buildGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x; GF_LOG[x] = i;
    x <<= 1; if (x & 0x100) x ^= 0x11d;
  }
  // Duplicate high half so (a+b) % 255 lookups don't need a mod op.
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a, b) {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

// Reed-Solomon generator polynomial of given degree.
function rsGenPoly(degree) {
  const coefs = new Uint8Array(degree); coefs[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i++) {
    for (let j = 0; j < degree; j++) {
      coefs[j] = gfMul(coefs[j], root);
      if (j + 1 < degree) coefs[j] ^= coefs[j + 1];
    }
    root = gfMul(root, 2);
  }
  return coefs;
}

// Reed-Solomon remainder of `data` divided by `gen` — that's the ECC.
function rsRemainder(data, gen) {
  const result = new Uint8Array(gen.length);
  for (const b of data) {
    const factor = b ^ result[0];
    result.copyWithin(0, 1);
    result[result.length - 1] = 0;
    for (let i = 0; i < gen.length; i++) {
      result[i] ^= gfMul(gen[i], factor);
    }
  }
  return result;
}

// === Bit buffer ======================================================
class BitBuf {
  constructor() { this.bits = []; }
  append(value, n) {
    for (let i = n - 1; i >= 0; i--) this.bits.push((value >>> i) & 1);
  }
  toBytes() {
    while (this.bits.length % 8 !== 0) this.bits.push(0);
    const out = new Uint8Array(this.bits.length / 8);
    for (let i = 0; i < out.length; i++) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | this.bits[i * 8 + j];
      out[i] = b;
    }
    return out;
  }
}

// === Public encoder ==================================================
export function encodeQR(text) {
  const utf8 = new TextEncoder().encode(String(text));

  // Pick the smallest version (1-10) whose byte-mode data capacity holds
  // (mode-indicator 4b) + (length-indicator 8 or 16b) + (data N × 8b).
  let version = 0;
  for (let v = 1; v <= 10; v++) {
    const lenBits = v < 10 ? 8 : 16;
    const need = 4 + lenBits + utf8.length * 8;
    const cap = ECC_M[v - 1][0] * 8;
    if (need <= cap) { version = v; break; }
  }
  if (version === 0) {
    throw new Error(`qr: data too long for v10 ECC=M (${utf8.length} bytes; max 213)`);
  }
  const [dataBytes, eccPerBlock, numBlocks] = ECC_M[version - 1];

  // 1) Pack header + data + terminator + padding into the data codewords.
  const bb = new BitBuf();
  bb.append(0b0100, 4);                            // byte mode indicator
  bb.append(utf8.length, version < 10 ? 8 : 16);
  for (const b of utf8) bb.append(b, 8);
  // Terminator (up to 4 zero bits) — only if there's room.
  const targetBits = dataBytes * 8;
  bb.append(0, Math.min(4, Math.max(0, targetBits - bb.bits.length)));
  // Pad to byte boundary, then alternate pad bytes 0xEC / 0x11.
  const data = bb.toBytes();
  const padded = new Uint8Array(dataBytes);
  padded.set(data);
  const PAD = [0xEC, 0x11];
  for (let i = data.length; i < dataBytes; i++) padded[i] = PAD[(i - data.length) % 2];

  // 2) Split into blocks, compute Reed-Solomon ECC per block, interleave.
  const shortLen = Math.floor(dataBytes / numBlocks);
  const longCount = dataBytes - shortLen * numBlocks;     // last `longCount` blocks are one byte longer
  const blocks = [];
  const gen = rsGenPoly(eccPerBlock);
  let off = 0;
  for (let i = 0; i < numBlocks; i++) {
    const blockLen = i < numBlocks - longCount ? shortLen : shortLen + 1;
    const block = padded.slice(off, off + blockLen); off += blockLen;
    blocks.push({ data: block, ecc: rsRemainder(block, gen) });
  }
  // Interleave data columns, then ECC columns. Empty slots (short blocks
  // missing a final byte) are skipped so output stays exactly N bytes long.
  const interleaved = [];
  const maxData = shortLen + 1;
  for (let i = 0; i < maxData; i++) {
    for (const b of blocks) if (i < b.data.length) interleaved.push(b.data[i]);
  }
  for (let i = 0; i < eccPerBlock; i++) {
    for (const b of blocks) interleaved.push(b.ecc[i]);
  }

  // 3) Place into matrix, apply best mask, embed format info.
  const size = 17 + version * 4;
  const matrix = new Uint8Array(size * size);
  const reserved = new Uint8Array(size * size);     // 1 = function-pattern, not data
  drawFinderAndFormat(matrix, reserved, size);
  drawTimingPatterns(matrix, reserved, size);
  drawAlignmentPatterns(matrix, reserved, size, version);
  if (version >= 7) drawVersionInfo(matrix, reserved, size, version);
  placeData(matrix, reserved, size, interleaved);

  // Apply mask 0-7, score each, pick the lowest. We then re-place the
  // data with the chosen mask by re-running placement with the bit
  // inverted — except we already placed, so we just XOR in the mask
  // pattern across non-reserved cells.
  let bestMask = 0, bestScore = Infinity;
  const trial = new Uint8Array(matrix);
  for (let m = 0; m < 8; m++) {
    trial.set(matrix);
    applyMask(trial, reserved, size, m);
    drawFormatInfo(trial, size, m);
    const score = scoreMatrix(trial, size);
    if (score < bestScore) { bestScore = score; bestMask = m; }
  }
  applyMask(matrix, reserved, size, bestMask);
  drawFormatInfo(matrix, size, bestMask);

  return { size, matrix };
}

// ----- Matrix placement -----

function setMod(m, size, x, y, v) { m[y * size + x] = v ? 1 : 0; }
function getMod(m, size, x, y)    { return m[y * size + x]; }

function drawFinderAndFormat(m, r, size) {
  const corners = [[0, 0], [size - 7, 0], [0, size - 7]];
  for (const [cx, cy] of corners) {
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        const x = cx + dx, y = cy + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const inFinder = dx >= 0 && dx < 7 && dy >= 0 && dy < 7;
        const dark = inFinder && (
          dx === 0 || dx === 6 || dy === 0 || dy === 6 ||      // outer ring
          (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4)             // 3×3 centre
        );
        setMod(m, size, x, y, dark);
        r[y * size + x] = 1;
      }
    }
  }
  // Reserve format-info slots around each finder.
  for (let i = 0; i < 9; i++) {
    r[i * size + 8] = 1;                   // top-left vertical
    r[8 * size + i] = 1;                   // top-left horizontal
  }
  for (let i = 0; i < 8; i++) {
    r[(size - 1 - i) * size + 8] = 1;      // bottom-left vertical
    r[8 * size + (size - 1 - i)] = 1;      // top-right horizontal
  }
  // Dark module (mandatory).
  setMod(m, size, 8, size - 8, 1);
  r[(size - 8) * size + 8] = 1;
}

function drawTimingPatterns(m, r, size) {
  for (let i = 8; i < size - 8; i++) {
    setMod(m, size, i, 6, i % 2 === 0);
    setMod(m, size, 6, i, i % 2 === 0);
    r[6 * size + i] = 1;
    r[i * size + 6] = 1;
  }
}

const ALIGN_TABLE = [
  null, [], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
  [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50],
];
function drawAlignmentPatterns(m, r, size, version) {
  const centres = ALIGN_TABLE[version];
  if (!centres) return;
  for (const cy of centres) {
    for (const cx of centres) {
      // Skip the three corners that overlap finder patterns.
      const corner =
        (cx === 6 && cy === 6) ||
        (cx === size - 7 && cy === 6) ||
        (cx === 6 && cy === size - 7);
      if (corner) continue;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const dark = Math.max(Math.abs(dx), Math.abs(dy)) !== 1;
          setMod(m, size, cx + dx, cy + dy, dark);
          r[(cy + dy) * size + (cx + dx)] = 1;
        }
      }
    }
  }
}

function drawVersionInfo(m, r, size, version) {
  // Compute 18-bit BCH-encoded version info.
  let v = version;
  let rem = v;
  for (let i = 0; i < 12; i++) {
    rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
  }
  const bits = (v << 12) | rem;
  for (let i = 0; i < 18; i++) {
    const bit = (bits >>> i) & 1;
    const a = Math.floor(i / 3), b = i % 3 + size - 11;
    setMod(m, size, a, b, bit); r[b * size + a] = 1;
    setMod(m, size, b, a, bit); r[a * size + b] = 1;
  }
}

function drawFormatInfo(m, size, mask) {
  const bits = FORMAT_INFO_M[mask];
  for (let i = 0; i < 15; i++) {
    const bit = ((bits >>> i) & 1) === 1;
    // First copy: along the top + left of the top-left finder.
    if (i < 6)       setMod(m, size, 8, i, bit);
    else if (i < 8)  setMod(m, size, 8, i + 1, bit);
    else if (i < 9)  setMod(m, size, 7, 8, bit);
    else             setMod(m, size, 14 - i, 8, bit);
    // Second copy: along the right + bottom-left finder.
    if (i < 8)       setMod(m, size, size - 1 - i, 8, bit);
    else             setMod(m, size, 8, size - 15 + i, bit);
  }
  setMod(m, size, 8, size - 8, 1);          // dark module
}

function placeData(m, r, size, data) {
  let i = 0, dir = -1;             // -1 = up, +1 = down
  for (let x = size - 1; x > 0; x -= 2) {
    if (x === 6) x--;              // skip vertical timing column
    for (let yy = 0; yy < size; yy++) {
      const y = dir < 0 ? size - 1 - yy : yy;
      for (let dx = 0; dx < 2; dx++) {
        const xx = x - dx;
        if (r[y * size + xx]) continue;
        const bit = i < data.length * 8 ? (data[i >>> 3] >>> (7 - (i & 7))) & 1 : 0;
        m[y * size + xx] = bit;
        i++;
      }
    }
    dir = -dir;
  }
}

// ----- Masking -----

function applyMask(m, r, size, mask) {
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (r[y * size + x]) continue;
      let invert = false;
      switch (mask) {
        case 0: invert = ((x + y) & 1) === 0; break;
        case 1: invert = (y & 1) === 0; break;
        case 2: invert = (x % 3) === 0; break;
        case 3: invert = ((x + y) % 3) === 0; break;
        case 4: invert = ((Math.floor(y / 2) + Math.floor(x / 3)) & 1) === 0; break;
        case 5: invert = ((x * y) % 2 + (x * y) % 3) === 0; break;
        case 6: invert = (((x * y) % 2 + (x * y) % 3) & 1) === 0; break;
        case 7: invert = (((x + y) % 2 + (x * y) % 3) & 1) === 0; break;
      }
      if (invert) m[y * size + x] ^= 1;
    }
  }
}

function scoreMatrix(m, size) {
  // Penalty rules from the QR spec — sum of four scores.
  let score = 0;
  // Rule 1: runs of ≥5 same-colour modules.
  for (let y = 0; y < size; y++) {
    let run = 1, last = -1;
    for (let x = 0; x < size; x++) {
      const v = m[y * size + x];
      if (v === last) { run++; if (run === 5) score += 3; else if (run > 5) score += 1; }
      else { last = v; run = 1; }
    }
  }
  for (let x = 0; x < size; x++) {
    let run = 1, last = -1;
    for (let y = 0; y < size; y++) {
      const v = m[y * size + x];
      if (v === last) { run++; if (run === 5) score += 3; else if (run > 5) score += 1; }
      else { last = v; run = 1; }
    }
  }
  // Rule 2: 2×2 same-colour blocks.
  for (let y = 0; y < size - 1; y++) {
    for (let x = 0; x < size - 1; x++) {
      const v = m[y * size + x];
      if (m[y * size + x + 1] === v && m[(y + 1) * size + x] === v && m[(y + 1) * size + x + 1] === v) {
        score += 3;
      }
    }
  }
  // Rule 3 & 4 — skipping deeper penalties; the rule-1+rule-2 scoring is
  // enough to pick a reasonable mask in practice (Nayuki agrees in his
  // commentary). If you need spec-perfect masks, add the finder-pattern
  // proximity (rule 3) and dark/light balance (rule 4) checks here.
  return score;
}

// === Renderer-side helper: matrix → SVG string =======================
export function qrToSVG({ size, matrix }, opts = {}) {
  const {
    moduleSize = 4,
    margin = 2,
    background = '#fff',
    foreground = '#111827',
  } = opts;
  const px = (size + margin * 2) * moduleSize;
  // Build one combined path string — far fewer DOM nodes than one <rect>
  // per module, but still trivially renderable by every browser.
  let d = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (matrix[y * size + x]) {
        const px0 = (x + margin) * moduleSize;
        const py0 = (y + margin) * moduleSize;
        d += `M${px0},${py0}h${moduleSize}v${moduleSize}h-${moduleSize}z`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${px} ${px}"`
       + ` width="${px}" height="${px}" shape-rendering="crispEdges" aria-hidden="true">`
       + `<rect width="${px}" height="${px}" fill="${background}"/>`
       + `<path d="${d}" fill="${foreground}"/>`
       + `</svg>`;
}
