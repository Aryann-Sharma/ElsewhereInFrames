# Elsewhere in Frames

A personal game photography site by Aryan Sharma. These are screenshots I took while exploring game worlds and stopping for the scenes that caught my eye.

![A mountain landscape from Red Dead Redemption 2](assets/featured-frame.jpeg)

## Browse the site

The homepage leads to a catalogue of 15 worlds covering 16 games. GTA 5 & Online brings both sets of photographs together; the other games have their own pages. Select a frame to open it in the full-screen viewer. Use the on-screen arrows or the left and right arrow keys to move through a gallery; press Escape to return to the page. The featured photograph on the homepage opens in the same viewer.

The collection currently holds 176 photographs, including Red Dead Redemption 2, Cyberpunk 2077, Ghost of Tsushima, the Assassin’s Creed games, and The Last of Us. The pages use colours drawn from each setting while keeping the photographs at the centre.

I captured every photograph on the site while playing.

## Credits and image use

© 2026 Aryan Sharma for the site's original design and writing. I captured the screenshots during play; the game content and trademarks remain with their respective owners. This is an unofficial fan project.

The repository does not grant a general reuse license for its images. Please ask me before republishing one of my captures.

The credit appears in the footer of every page. This public repository contains the JPEGs shown on the site, including the larger gallery files and their previews, so those copies can be downloaded. The original PNG archive is not included.

## Run it locally

The site uses plain HTML, CSS, and JavaScript, so there is no build step. Open `index.html` directly in a browser. If you use a local static file server, point it at the repository root. The homepage is `/` and the catalogue is `/catalogue.html`.

## Project layout

| Path | Purpose |
| --- | --- |
| `index.html` | Homepage and selected games |
| `catalogue.html` | Complete game catalogue |
| `games/` | Gallery pages and a redirect from the former GTA Online page |
| `style.css` and `games.css` | Shared layout and game themes |
| `assets/screenshots/` | Full-size photographs and smaller previews |
| `assets/screenshots/manifest.json` | Image list used to build the galleries |
| `scripts/generate-pages.mjs` | Game details and page generator |
| `scripts/photo-viewer.js` | Full-screen photograph navigation |
| `scripts/import-screenshots.ps1` | Screenshot archive importer for Windows PowerShell |
| `tests/site.test.mjs` | Catalogue, gallery, and link checks |

## Update the collection

The catalogue and game pages are generated and checked into the repository. To change a game's title, description, theme, or cover photograph, edit `scripts/generate-pages.mjs`, then run:

```sh
node scripts/generate-pages.mjs
node --test tests/site.test.mjs
```

To add screenshots from an archive, first update the folder mappings in `scripts/import-screenshots.ps1` and add a matching game entry in `scripts/generate-pages.mjs` if the game is new. The importer expects PNG files under `eif/<game folder>/` inside the archive. From the repository root, run it in Windows PowerShell:

```powershell
.\scripts\import-screenshots.ps1 -ArchivePath "C:\path\to\screenshots.zip"
node scripts/generate-pages.mjs
node --test tests/site.test.mjs
```

The importer writes full-size JPEGs, smaller previews, and the image manifest. Review the generated pages and images before committing them. Pull requests and updates to `main` run the same tests automatically.

Release history is in [CHANGELOG.md](CHANGELOG.md).
