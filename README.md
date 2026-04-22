# Daily News Site

This repository is the canonical home for the Daily Claude News project.

The generated site lives in `site/` locally and is deployed to GitHub Pages with GitHub Actions.
Do not edit files in `site/` directly.

## Source of truth

- `site-src/assets/styles.css`: shared site styles
- `site-src/schema/*.schema.json`: JSON schema definitions
- `site-src/content/site.json`: site-level metadata
- `site-src/content/reports/*.json`: daily report data
- `skills/`: watch, report, and HTML-report skills used to produce the content
- `scripts/validate-content.mjs`: schema validation
- `scripts/build-site.mjs`: renderer
- `.github/workflows/pages.yml`: GitHub Pages build and deploy workflow

## Local workflow

1. Validate content with `node scripts/validate-content.mjs`
2. Build the site with `node scripts/build-site.mjs`

## Publish to GitHub Pages

1. In GitHub, open `Settings > Pages`
2. Set the source to `GitHub Actions`
3. Push to `main` or run the workflow manually

The workflow will:

1. Validate `site-src/content/*.json` against the JSON schemas
2. Build the site into `site/`
3. Upload the generated artifact
4. Deploy it to GitHub Pages

The site will then be available at:

- `https://hiragram.github.io/daily-news/`

Daily permalinks will look like:

- `https://hiragram.github.io/daily-news/reports/2026-04-22/`

## Notes

- `site/` is ignored and should not be committed
- The source of truth is `site-src/`, `scripts/`, and `skills/`
