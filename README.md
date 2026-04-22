# Daily News Site

This directory is a GitHub Pages-ready static site.

## Files

- `index.html`: the site homepage and latest issue entry point
- `reports/index.html`: archive page
- `reports/YYYY-MM-DD/index.html`: daily permalink pages
- `assets/styles.css`: shared page styles

## Publish to GitHub Pages

1. Push these files into the root of `hiragram/daily-news`
2. In GitHub, open `Settings > Pages`
3. Set:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
4. Save

The site will then be available at:

- `https://hiragram.github.io/daily-news/`

Daily permalinks will look like:

- `https://hiragram.github.io/daily-news/reports/2026-04-22/`

If you later rename the repo to `hiragram.github.io`, it can live at:

- `https://hiragram.github.io/`
