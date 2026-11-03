import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

function element() {
    const listeners = new Map();
    const classes = new Set();
    return {
        addEventListener(type, listener) { listeners.set(type, listener); },
        fire(type, event = {}) { listeners.get(type)?.(event); },
        classList: {
            add(name) { classes.add(name); },
            remove(name) { classes.delete(name); }
        },
        blur() {},
        focus() {}
    };
}

test('viewer keeps keyboard navigation and accepts horizontal touch swipes', async () => {
    const frames = Array.from({ length: 3 }, (_, index) => ({
        href: `https://example.test/frame-${index + 1}.jpg`,
        querySelector() { return { alt: `Frame ${index + 1}` }; },
        focus() {}
    }));
    const gallery = element();
    gallery.querySelectorAll = () => frames;

    const image = { removeAttribute(name) { delete this[name]; } };
    const previous = element();
    const next = element();
    const close = element();
    const count = { textContent: '' };
    const viewer = element();
    viewer.querySelector = (selector) => ({
        '.viewer-image': image,
        '.viewer-previous': previous,
        '.viewer-next': next,
        '.viewer-close': close,
        '.viewer-count': count
    })[selector] ?? null;
    viewer.showModal = () => { viewer.open = true; };
    viewer.close = () => { viewer.open = false; viewer.fire('close'); };

    const document = {
        querySelector: (selector) => selector === '.photo-grid, .featured-frame' ? gallery : viewer,
        body: element()
    };
    const source = await readFile(join(import.meta.dirname, '..', 'scripts', 'photo-viewer.js'), 'utf8');
    runInNewContext(source, { document, setTimeout: () => 1, clearTimeout() {} });

    gallery.fire('click', {
        target: { closest: () => frames[0] },
        preventDefault() {}
    });
    assert.equal(image.src, frames[0].href);
    assert.equal(previous.disabled, true);

    viewer.fire('touchstart', { touches: [{ clientX: 220, clientY: 100 }] });
    viewer.fire('touchend', { changedTouches: [{ clientX: 130, clientY: 108 }] });
    assert.equal(image.src, frames[1].href);

    viewer.fire('touchstart', { touches: [{ clientX: 200, clientY: 100 }] });
    viewer.fire('touchend', { changedTouches: [{ clientX: 110, clientY: 185 }] });
    assert.equal(image.src, frames[1].href, 'a diagonal gesture should not turn the page');

    viewer.fire('keydown', { key: 'ArrowRight', preventDefault() {} });
    assert.equal(image.src, frames[2].href);
    assert.equal(next.disabled, true);

    viewer.fire('touchstart', { touches: [{ clientX: 110, clientY: 100 }] });
    viewer.fire('touchend', { changedTouches: [{ clientX: 200, clientY: 100 }] });
    assert.equal(image.src, frames[1].href);
});
