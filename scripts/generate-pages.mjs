import { mkdir, writeFile } from 'node:fs/promises';

// Keep the catalogue and individual pages in the same order.
const games = [
    {
        slug: 'red-dead-redemption-2',
        name: 'Red Dead Redemption 2',
        theme: 'red-dead',
        place: 'The frontier',
        background: '#211b1b',
        description: 'Long rides, changing weather, and the kind of light that makes a trail worth stopping on.',
        photo: true
    },
    {
        slug: 'cyberpunk-2077',
        name: 'Cyberpunk 2077',
        theme: 'cyberpunk',
        place: 'Night City',
        background: '#0c1a27',
        description: 'A city of hard edges and soft reflections, especially after dark and in the rain.'
    },
    {
        slug: 'uncharted-4',
        name: 'Uncharted 4: A Thief’s End',
        theme: 'uncharted',
        place: 'The long way round',
        background: '#202e31',
        description: 'Coastlines, old stone, and the quiet moments between one discovery and the next.'
    },
    {
        slug: 'assassins-creed-unity',
        name: 'Assassin’s Creed Unity',
        theme: 'unity',
        place: 'Paris',
        background: '#1b202d',
        description: 'Paris from the rooftops: dense streets, pale stone, and a city full of movement.'
    },
    {
        slug: 'assassins-creed-origins',
        name: 'Assassin’s Creed Origins',
        theme: 'origins',
        place: 'Ancient Egypt',
        background: '#303038',
        description: 'Open desert, river light, and a landscape that changes with every hour of the day.'
    },
    {
        slug: 'assassins-creed-odyssey',
        name: 'Assassin’s Creed Odyssey',
        theme: 'odyssey',
        place: 'Ancient Greece',
        background: '#1b3042',
        description: 'Bright harbours, steep paths, and the deep blue that keeps appearing beyond the hills.'
    },
    {
        slug: 'marvels-spider-man',
        name: 'Marvel’s Spider-Man',
        theme: 'spider-man',
        place: 'New York',
        background: '#20283a',
        description: 'The city seen from above, from street level, and from everywhere in between.'
    },
    {
        slug: 'marvels-spider-man-2',
        name: 'Marvel’s Spider-Man 2',
        theme: 'spider-man-2',
        place: 'New York, again',
        background: '#1a1b25',
        description: 'Familiar streets at a different pace, with more of the city waiting beyond the skyline.'
    },
    {
        slug: 'the-last-of-us-part-i',
        name: 'The Last of Us Part I',
        theme: 'last-of-us',
        place: 'Reclaimed places',
        background: '#252d29',
        description: 'The stillness of abandoned rooms, green growth, and light finding its way back in.'
    },
    {
        slug: 'the-last-of-us-part-ii',
        name: 'The Last of Us Part II',
        theme: 'last-of-us-2',
        place: 'Rain and overgrowth',
        background: '#202b2d',
        description: 'Wet streets, heavy skies, and small details that reward a second look.'
    },
    {
        slug: 'grand-theft-auto-v',
        name: 'Grand Theft Auto V',
        theme: 'gta-v',
        place: 'Los Santos',
        background: '#273c40',
        description: 'Late afternoon streets, distant hills, and the colour of a city close to the coast.'
    },
    {
        slug: 'gta-online',
        name: 'GTA Online',
        theme: 'gta-online',
        place: 'After dark',
        background: '#22213a',
        description: 'A familiar city after hours, where the lights and the pace tell another story.'
    }
];

const escapeHtml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const card = (game, index, prefix = '') => `                    <a class="game-card theme-${game.theme}${game.photo ? ' game-card-photo' : ''}" href="${prefix}games/${game.slug}.html">
                        <span class="game-card-art" aria-hidden="true"></span>
                        <span class="game-card-copy"><span class="game-card-number">${String(index + 1).padStart(2, '0')} / ${escapeHtml(game.place)}</span><strong>${escapeHtml(game.name)}</strong><span>${game.photo ? 'View the frames' : 'Explore this world'} ↗</span></span>
                    </a>`;

const catalogue = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#130f1a">
    <meta name="author" content="Aryan Sharma">
    <meta name="description" content="Browse the game worlds in Aryan Sharma’s personal screenshot collection.">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Catalogue — Elsewhere in Frames">
    <meta property="og:description" content="A catalogue of places to photograph across video game worlds.">
    <title>Catalogue — Elsewhere in Frames</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="games.css">
</head>
<body class="catalogue-page">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header" id="top">
        <div class="header-inner">
            <a class="wordmark" href="index.html">Elsewhere <span>in Frames</span></a>
            <nav class="main-nav" aria-label="Main navigation">
                <a href="index.html">Home</a>
                <a href="catalogue.html" aria-current="page">Catalogue</a>
                <a href="index.html#about">About</a>
            </nav>
            <span class="header-note">Personal game photography</span>
        </div>
    </header>
    <main id="main">
        <div class="catalogue-intro section-shell">
            <p class="section-index"><span>01</span> The catalogue</p>
            <h1>Every world has a different light.</h1>
            <p>Browse the places in the collection. The first photograph is here; the other pages will grow as I take more screenshots.</p>
        </div>
        <section class="catalogue-section section-shell" aria-label="Game worlds">
            <p class="catalogue-count">12 worlds / 1 photographed so far</p>
            <div class="game-grid">
${games.map((game, index) => card(game, index)).join('\n')}
            </div>
        </section>
    </main>
    <footer class="site-footer">
        <div class="footer-inner">
            <a class="wordmark" href="index.html">Elsewhere <span>in Frames</span></a>
            <span>Game photography by Aryan Sharma</span>
            <a href="#top">Back to top ↑</a>
        </div>
    </footer>
</body>
</html>
`;

function gamePage(game, index) {
    const previous = games[(index - 1 + games.length) % games.length];
    const next = games[(index + 1) % games.length];
    const gallery = game.photo
        ? `            <figure class="world-photo">
                <img src="../assets/featured-frame.jpeg" width="2560" height="1435" alt="Warm light over snow-capped mountains, forest, and a winding river in Red Dead Redemption 2">
                <figcaption><span>Frame 001 · Mountain country</span><span>Captured by Aryan Sharma</span></figcaption>
            </figure>`
        : `            <div class="empty-gallery">
                <strong>The first frames are on their way.</strong>
                <p>This space is ready for screenshots captured during my own playthrough.</p>
            </div>`;

    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="${game.background}">
    <meta name="author" content="Aryan Sharma">
    <meta name="description" content="${escapeHtml(game.description)} A personal game photography page by Aryan Sharma.">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(game.name)} — Elsewhere in Frames">
    <meta property="og:description" content="${escapeHtml(game.description)}">
    <title>${escapeHtml(game.name)} — Elsewhere in Frames</title>
    <link rel="stylesheet" href="../style.css">
    <link rel="stylesheet" href="../games.css">
</head>
<body class="world-page theme-${game.theme}" style="--page-bg: ${game.background}">
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
        <div class="header-inner">
            <a class="wordmark" href="../index.html">Elsewhere <span>in Frames</span></a>
            <nav class="main-nav" aria-label="Main navigation">
                <a href="../index.html">Home</a>
                <a href="../catalogue.html">Catalogue</a>
                <a href="../index.html#about">About</a>
            </nav>
            <span class="header-note">Personal game photography</span>
        </div>
    </header>
    <main id="main">
        <section class="world-hero" aria-labelledby="world-title">
            <div class="world-hero-art" aria-hidden="true"></div>
            <div class="world-hero-content">
                <nav class="breadcrumb" aria-label="Breadcrumb"><a href="../catalogue.html">Catalogue</a><span aria-hidden="true">/</span><span>${escapeHtml(game.name)}</span></nav>
                <p class="world-kicker">World ${String(index + 1).padStart(2, '0')} / ${escapeHtml(game.place)}</p>
                <h1 id="world-title">${escapeHtml(game.name)}</h1>
                <p class="world-summary">${escapeHtml(game.description)}</p>
            </div>
        </section>
        <section class="world-content section-shell" aria-labelledby="frames-title">
            <div class="world-section-heading"><h2 id="frames-title">The frames</h2><span>${game.photo ? '01 photograph' : 'Photographs coming soon'}</span></div>
${gallery}
            <nav class="world-navigation" aria-label="More worlds">
                <a href="${previous.slug}.html">← ${escapeHtml(previous.name)}</a>
                <a href="${next.slug}.html">${escapeHtml(next.name)} →</a>
            </nav>
        </section>
    </main>
    <footer class="site-footer">
        <div class="footer-inner">
            <a class="wordmark" href="../index.html">Elsewhere <span>in Frames</span></a>
            <span>Game photography by Aryan Sharma</span>
            <a href="#main">Back to top ↑</a>
        </div>
    </footer>
</body>
</html>
`;
}

await mkdir('games', { recursive: true });
await writeFile('catalogue.html', catalogue);
await Promise.all(games.map((game, index) => writeFile(`games/${game.slug}.html`, gamePage(game, index))));
