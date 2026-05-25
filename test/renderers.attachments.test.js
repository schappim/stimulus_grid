// @vitest-environment jsdom
//
// Unit tests for the `attachments` renderer. Runs under jsdom because the
// renderer is DOM-coupled — it constructs nodes, attaches listeners, and
// mounts the lightbox / editor overlays on <body>.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { attachments } from '../src/lib/renderers.js';

// Mock browser bits jsdom doesn't ship.
beforeEach(() => {
  globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock');
});
afterEach(() => {
  document.body.replaceChildren();
});

/* Build a minimal cell + row context the renderer expects. */
function cellCtx(value, opts = {}) {
  const td = document.createElement('td');
  td.dataset.colId = 'files';
  const row = { id: 1, files: value, ...opts.row };
  const col = { field: 'files' };
  const api = {
    applyTransaction: vi.fn(),
  };
  return { value, row, col, td, api };
}

/* Pre-canned attachment shapes used across tests. */
const png = (id = 'p1') => ({
  id, filename: `${id}.png`, url: `data:image/png;base64,iVBORw0K=`,
  content_type: 'image/png', byte_size: 1024,
});
const pdf = (id = 'd1') => ({
  id, filename: `${id}.pdf`, url: `/files/${id}.pdf`,
  content_type: 'application/pdf', byte_size: 12345,
});

describe('attachments renderer — read-only', () => {
  const render = (value, opts = {}) => {
    const fn = attachments(opts);
    const ctx = cellCtx(value);
    const node = fn(ctx);
    if (node) ctx.td.appendChild(node);
    return ctx.td;
  };

  it('returns empty for null / undefined / empty array (non-editable)', () => {
    expect(render(null).textContent).toBe('');
    expect(render([]).textContent).toBe('');
    expect(render('').textContent).toBe('');
    expect(render(null).dataset.attachmentCount).toBe('0');
  });

  it('renders one thumb per image', () => {
    const td = render([png('a'), png('b')]);
    expect(td.dataset.attachmentCount).toBe('2');
    const thumbs = td.querySelectorAll('.sg-attach-thumb');
    expect(thumbs.length).toBe(2);
    expect(thumbs[0].dataset.attachmentKind).toBe('image');
    expect(thumbs[0].querySelector('img')).toBeTruthy();
  });

  it('renders an icon (not <img>) for non-image attachments', () => {
    const td = render([pdf('x')]);
    const thumb = td.querySelector('.sg-attach-thumb');
    expect(thumb.dataset.attachmentKind).toBe('file');
    expect(thumb.querySelector('img')).toBeFalsy();
    expect(thumb.querySelector('.sg-attach-icon.is-pdf')).toBeTruthy();
  });

  it('collapses past maxThumbs into a +N chip', () => {
    const value = Array.from({ length: 7 }, (_, i) => png(`p${i}`));
    const td = render(value, { maxThumbs: 4 });
    expect(td.querySelectorAll('.sg-attach-thumb').length).toBe(4);
    const more = td.querySelector('.sg-attach-more');
    expect(more).toBeTruthy();
    expect(more.textContent).toBe('+3');
  });

  it('renders a custom empty string when value is empty and `empty` is set', () => {
    const td = render([], { empty: 'No files' });
    expect(td.textContent).toBe('No files');
  });

  it('coerces a JSON string value into attachments', () => {
    const td = render(JSON.stringify([png('a')]));
    expect(td.querySelectorAll('.sg-attach-thumb').length).toBe(1);
  });

  it('drops items missing both url and signed_id', () => {
    const td = render([png('a'), { id: 'x', filename: 'broken.png' }, pdf('b')]);
    expect(td.querySelectorAll('.sg-attach-thumb').length).toBe(2);
  });

  it('falls back to filename extension to detect image kind when content_type is missing', () => {
    const td = render([{ id: 'q', filename: 'photo.JPG', url: '/photo.JPG' }]);
    expect(td.querySelector('.sg-attach-thumb').dataset.attachmentKind).toBe('image');
  });

  it('classifies common file extensions into kind-specific icons', () => {
    const cases = [
      ['report.pdf',  'is-pdf'],
      ['notes.docx',  'is-doc'],
      ['data.xlsx',   'is-sheet'],
      ['bundle.zip',  'is-zip'],
      ['song.mp3',    'is-audio'],
      ['clip.mp4',    'is-video'],
      ['script.js',   'is-code'],
      ['mystery.bin', 'is-file'],
    ];
    for (const [filename, kindClass] of cases) {
      const td = render([{ id: 'x', filename, url: `/${filename}` }]);
      const icon = td.querySelector('.sg-attach-icon');
      expect(icon?.classList.contains(kindClass), `${filename} → ${kindClass}`).toBe(true);
    }
  });

  it('does not show the + add button when editable=false', () => {
    expect(render([png('a')]).querySelector('.sg-attach-add')).toBeFalsy();
  });
});

describe('attachments renderer — editable', () => {
  it('renders the + button for empty cells when editable=true', () => {
    const fn = attachments({ editable: true });
    const ctx = cellCtx([]);
    const node = fn(ctx);
    if (node) ctx.td.appendChild(node);
    expect(ctx.td.querySelector('.sg-attach-add')).toBeTruthy();
  });

  it('opens an editor popover on the + button click and lists tiles', async () => {
    const fn = attachments({ editable: true });
    const ctx = cellCtx([png('a'), pdf('b')]);
    document.body.appendChild(ctx.td);
    const node = fn(ctx);
    ctx.td.appendChild(node);

    ctx.td.querySelector('.sg-attach-add').click();
    const editor = document.querySelector('.sg-attach-editor');
    expect(editor).toBeTruthy();
    expect(editor.querySelectorAll('.sg-attach-editor-tile').length).toBe(2);
    expect(editor.querySelector('.sg-attach-editor-title').textContent).toBe('2 attachments');
  });

  it('removes a tile when × is clicked and updates the underlying row', () => {
    const fn = attachments({ editable: true });
    const ctx = cellCtx([png('a'), pdf('b')]);
    document.body.appendChild(ctx.td);
    const node = fn(ctx);
    ctx.td.appendChild(node);

    ctx.td.querySelector('.sg-attach-add').click();
    document.querySelector('.sg-attach-editor-tile [data-sg-attach="remove"]').click();

    // The renderer mutates row[col.field] in-place.
    expect(ctx.row.files.length).toBe(1);
    expect(ctx.row.files[0].id).toBe('b');
    // ...and asks the api to re-render the affected row.
    expect(ctx.api.applyTransaction).toHaveBeenCalled();
  });

  it('calls the onRemove callback (if supplied) and uses its return value', async () => {
    const onRemove = vi.fn(async () => [pdf('b')]);   // return new full list
    const fn = attachments({ editable: true, onRemove });
    const ctx = cellCtx([png('a'), pdf('b')]);
    document.body.appendChild(ctx.td);
    const node = fn(ctx);
    ctx.td.appendChild(node);

    ctx.td.querySelector('.sg-attach-add').click();
    document.querySelector('.sg-attach-editor-tile [data-sg-attach="remove"]').click();
    await Promise.resolve();
    await Promise.resolve();   // settle the async onRemove + applyAttachmentRemove

    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onRemove.mock.calls[0][0].id).toBe('a');
  });

  it('closes the editor on Escape', () => {
    const fn = attachments({ editable: true });
    const ctx = cellCtx([png('a')]);
    document.body.appendChild(ctx.td);
    ctx.td.appendChild(fn(ctx));
    ctx.td.querySelector('.sg-attach-add').click();
    expect(document.querySelector('.sg-attach-editor')).toBeTruthy();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('.sg-attach-editor')).toBeFalsy();
  });
});

describe('attachments renderer — lightbox', () => {
  it('opens the lightbox when an image thumb is clicked', () => {
    const fn = attachments();
    const ctx = cellCtx([png('a'), png('b'), pdf('c')]);
    document.body.appendChild(ctx.td);
    ctx.td.appendChild(fn(ctx));
    ctx.td.querySelector('.sg-attach-thumb').click();
    const box = document.querySelector('.sg-attach-lightbox');
    expect(box).toBeTruthy();
    expect(box.querySelector('.sg-attach-lightbox-caption').textContent).toContain('(1/2)');
  });

  it('navigates the carousel with ArrowRight / ArrowLeft', () => {
    const fn = attachments();
    const ctx = cellCtx([png('a'), png('b'), png('c')]);
    document.body.appendChild(ctx.td);
    ctx.td.appendChild(fn(ctx));
    ctx.td.querySelector('.sg-attach-thumb').click();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(document.querySelector('.sg-attach-lightbox-caption').textContent).toContain('(2/3)');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(document.querySelector('.sg-attach-lightbox-caption').textContent).toContain('(1/3)');
  });

  it('Escape closes the lightbox', () => {
    const fn = attachments();
    const ctx = cellCtx([png('a')]);
    document.body.appendChild(ctx.td);
    ctx.td.appendChild(fn(ctx));
    ctx.td.querySelector('.sg-attach-thumb').click();
    expect(document.querySelector('.sg-attach-lightbox')).toBeTruthy();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('.sg-attach-lightbox')).toBeFalsy();
  });

  it('does NOT open the lightbox for a non-image-only cell', () => {
    const fn = attachments();
    const ctx = cellCtx([pdf('p')]);
    document.body.appendChild(ctx.td);
    ctx.td.appendChild(fn(ctx));
    // For a file (not image), the click opens window.open — which jsdom
    // stubs to a noop. Verify no lightbox appears.
    const origOpen = window.open;
    window.open = vi.fn();
    ctx.td.querySelector('.sg-attach-thumb').click();
    expect(document.querySelector('.sg-attach-lightbox')).toBeFalsy();
    expect(window.open).toHaveBeenCalled();
    window.open = origOpen;
  });
});
