import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { copyFile, mkdtemp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(join(root, 'assets/screenshots/manifest.json'), 'utf8'));
const slugs = Object.keys(manifest);
const pages = ['index.html', 'catalogue.html', ...slugs.map((slug) => `games/${slug}.html`)];

function localReferences(html) {
    return [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);
}

test('catalogue and galleries match the screenshot collection', async () => {
    const catalogue = await readFile(join(root, 'catalogue.html'), 'utf8');
    const catalogueSlugs = [...catalogue.matchAll(/class="game-card [^"]+" href="games\/([^/]+)\.html"/g)]
        .map((match) => match[1]);

    assert.equal(catalogueSlugs.length, slugs.length);
    assert.deepEqual([...catalogueSlugs].sort(), [...slugs].sort());
    assert.match(catalogue, new RegExp(`${slugs.length} worlds / 176 photographs`));
    assert.doesNotMatch(catalogue, /marvels-spider-man-2|Marvel.s Spider-Man 2/i);

    let photoCount = 0;
    for (const slug of slugs) {
        const html = await readFile(join(root, 'games', `${slug}.html`), 'utf8');
        const frames = manifest[slug];
        photoCount += frames.length;

        assert.equal((html.match(/class="photo-item"/g) ?? []).length, frames.length, slug);
        assert.match(html, /href="\.\.\/catalogue\.html"/, `${slug} needs a catalogue link`);
        assert.match(html, /alt="Screenshot from [^"]+, frame 1"/, `${slug} needs descriptive gallery text`);

        for (const frame of frames) {
            assert.ok(html.includes(`href="../${frame.full}"`), `${slug}: missing full image ${frame.full}`);
            assert.ok(html.includes(`src="../${frame.thumb}"`), `${slug}: missing preview ${frame.thumb}`);
        }
    }
    assert.equal(photoCount, 176);
});

test('checked-in catalogue and game pages match the page generator', async () => {
    const temporaryRoot = await mkdtemp(join(tmpdir(), 'elsewhere-pages-'));
    try {
        await mkdir(join(temporaryRoot, 'scripts'));
        await mkdir(join(temporaryRoot, 'assets', 'screenshots'), { recursive: true });
        await copyFile(join(root, 'scripts', 'generate-pages.mjs'), join(temporaryRoot, 'scripts', 'generate-pages.mjs'));
        await copyFile(join(root, 'assets', 'screenshots', 'manifest.json'), join(temporaryRoot, 'assets', 'screenshots', 'manifest.json'));

        const generated = spawnSync(process.execPath, ['scripts/generate-pages.mjs'], {
            cwd: temporaryRoot,
            encoding: 'utf8'
        });
        assert.equal(generated.status, 0, generated.stderr);

        for (const page of pages.slice(1)) {
            const expected = await readFile(join(temporaryRoot, page), 'utf8');
            const actual = await readFile(join(root, page), 'utf8');
            assert.equal(actual.replaceAll('\r\n', '\n'), expected.replaceAll('\r\n', '\n'), page);
        }
    } finally {
        await rm(temporaryRoot, { recursive: true, force: true });
    }
});

test('all local navigation and image requests resolve over HTTP', async () => {
    const contentTypes = {
        '.css': 'text/css',
        '.html': 'text/html',
        '.jpeg': 'image/jpeg',
        '.jpg': 'image/jpeg',
        '.json': 'application/json'
    };
    const server = createServer(async (request, response) => {
        try {
            const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
            const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
            if (!file.startsWith(`${root}${sep}`)) {
                response.writeHead(403).end();
                return;
            }
            const details = await stat(file);
            if (!details.isFile()) {
                response.writeHead(404).end();
                return;
            }
            response.writeHead(200, {
                'content-type': contentTypes[extname(file)] ?? 'application/octet-stream',
                'content-length': details.size
            });
            if (request.method === 'HEAD') response.end();
            else createReadStream(file).pipe(response);
        } catch {
            response.writeHead(404).end();
        }
    });

    await new Promise((ready) => server.listen(0, '127.0.0.1', ready));
    try {
        const base = `http://127.0.0.1:${server.address().port}/`;
        const htmlByPath = new Map();
        const resources = new Set();
        const anchors = [];

        for (const page of pages) {
            const url = new URL(page, base);
            const response = await fetch(url);
            assert.equal(response.status, 200, page);
            assert.match(response.headers.get('content-type'), /text\/html/, page);
            const html = await response.text();
            assert.match(html, /<title>[^<]+<\/title>/, page);
            htmlByPath.set(url.pathname, html);

            for (const reference of localReferences(html)) {
                const destination = new URL(reference, url);
                if (destination.origin !== url.origin) continue;
                resources.add(destination.pathname);
                if (destination.hash) anchors.push([page, destination.pathname, decodeURIComponent(destination.hash.slice(1))]);
            }
        }

        for (const [page, pathname, id] of anchors) {
            const target = htmlByPath.get(pathname);
            assert.ok(target, `${page}: missing page for #${id}`);
            assert.ok(target.includes(`id="${id}"`), `${page}: missing #${id} in ${pathname}`);
        }

        for (const pathname of resources) {
            const response = await fetch(new URL(pathname, base), { method: 'HEAD' });
            assert.equal(response.status, 200, pathname);
            assert.ok(Number(response.headers.get('content-length')) > 0, pathname);
            if (/\.(?:jpe?g)$/i.test(pathname)) {
                assert.match(response.headers.get('content-type'), /image\/jpeg/, pathname);
            }
        }

        assert.ok(resources.size > 350, 'expected to check the gallery assets as well as page links');
    } finally {
        await new Promise((closed) => server.close(closed));
    }
});
