# Elsewhere in Frames

A personal game photography site by Aryan Sharma. It collects screenshots I take while exploring video game worlds, starting with a landscape frame from Red Dead Redemption 2.

![A mountain landscape captured in-game](assets/featured-frame.jpeg)

## View the site

Open `index.html` in a browser. The site is plain HTML and CSS, with no build step or dependencies.

## What is here

- A featured Red Dead Redemption 2 photograph, stored locally in `assets/featured-frame.jpeg`
- A homepage with selected worlds and a link to the full catalogue
- Twelve individual game pages with palettes inspired by their settings
- A clear holding state on pages awaiting photographs from my own collection

The layout adapts to desktop and mobile screens. Navigation works with a keyboard, images have descriptive text, and reduced-motion preferences are respected.

## Project files

- `index.html` — homepage content and metadata
- `catalogue.html` — the complete list of game worlds
- `games/` — individual game pages
- `style.css` — shared layout and typography
- `games.css` — catalogue, game page, and theme styles
- `scripts/generate-pages.mjs` — source for the catalogue and game pages
- `assets/featured-frame.jpeg` — original in-game capture

All photographs featured on the site are captured by Aryan Sharma.

## Updating the collection

Edit the game details in `scripts/generate-pages.mjs`, then run `node scripts/generate-pages.mjs` from the project root to refresh the catalogue and game pages. The generated HTML is checked in, so viewing the site never requires Node.
