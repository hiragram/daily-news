---
name: "Claude News HTML Report"
description: "Use this skill when the user wants a structured daily Claude news payload for the website, based on the Claude watch skills, written as JSON that conforms to the site's report schema rather than as freeform HTML."
---

# Claude News HTML Report

Use this skill when the task is to produce the website-ready daily report payload for Daily Claude News.

This skill does not render HTML directly.
Its job is to produce a JSON document that matches the site's schema so the build pipeline can render the page with the shared template.

Default upstream inputs:
- `$Claude Official X Watch`
- `$Anthropic Engineer X Watch`
- `$Anthropic Blog Watch`
- `$Claude Code Release Watch`
- `$Claude News Report` if a text summary already exists

## Goal

Create one daily report JSON file for:

- `site-src/content/reports/YYYY-MM-DD.json`

The file must conform to:

- `site-src/schema/report.schema.json`

Do not output prose-first reports when this skill is used.
The primary deliverable is valid JSON for the site generator.

## Workflow

1. Gather the outputs from the upstream watch skills first.
   Do not invent items that were not observed in the upstream results.

2. Determine the issue date.
   By default, use the report date in the user's local timezone.
   The filename and the JSON `date` field must match exactly in `YYYY-MM-DD` format.

3. Read these files before producing the payload:
- `site-src/schema/report.schema.json`
- `site-src/content/reports/` for recent examples when helpful

4. Normalize and deduplicate candidate items.
   Prefer one canonical item per underlying news event.

5. Map the observed results into the schema fields.

Required top-level fields:
- `date`
- `windowLabel`
- `archiveTitle`
- `archiveSummary`
- `latestSummary`
- `summaryBullets`
- `officialNews`
- `officialZeroStates`
- `signals`
- `releasePanels`
- `exclusions`
- `sources`

6. Keep HTML usage minimal and intentional.
   Some string fields may include short inline HTML because the renderer intentionally allows it.
   This is mainly for:
- `<strong>`
- `<code>`

Do not put large HTML fragments into the JSON.
Do not embed whole cards, sections, or arbitrary markup.

7. Validate before finalizing.
   Always run:

```bash
node scripts/validate-content.mjs
```

If validation fails, fix the JSON instead of relaxing the schema.

8. If the user wants the site regenerated as part of the task, also run:

```bash
node scripts/build-site.mjs
```

## Field Guidance

### `archiveTitle`

- Short, stable, English-friendly title for archive cards
- Keep it compact
- Avoid dates in the title

### `archiveSummary`

- One short sentence for archive listings
- Focus on the highest-signal items only

### `latestSummary`

- One short sentence for the homepage's latest-issue card
- Slightly more descriptive than `archiveSummary` is fine

### `summaryBullets`

- Usually 2 to 4 items
- High-signal only
- Can contain short inline HTML like `<strong>` or `<code>`

### `officialNews`

- Use for direct announcements from official Anthropic or Claude channels
- If there are zero official items, use an empty array and rely on `officialZeroStates`

### `officialZeroStates`

- Required even when official posts exist
- Use it to record important absences such as:
  - no new `@AnthropicAI` posts
  - no new `@ClaudeAI` posts
  - no new official blog posts

### `signals`

- Non-official but relevant product, rollout, fix, or ops signals from Anthropic-affiliated individuals
- Keep low-value replies out unless they add new information

### `releasePanels`

- Usually exactly two panels:
  - `ブログ`
  - `Claude Code リリース`
- Use `headline: "0件"` when there is no new item
- For Claude Code releases, use `releases` when one or more in-window releases exist
- Keep the releases in newest-first order
- Each release entry should carry its own:
  - `version`
  - `publishedAt`
  - `summary`
  - `sections` or `details`
  - `url` and `urlLabel` when available
- For a single release, still prefer the `releases` array so the shape stays stable
- Within each release entry, prefer `sections` over a flat `details` list when the release page has multiple bullets
- The target section titles are:
  - `新機能`
  - `変更`
  - `修正`
- Translate each release-note bullet into Japanese one by one
- Do not summarize a long release as `ほか複数の修正`
- If the release page shows a bullet, include that bullet in one of the release sections
- If two or more Claude Code versions shipped inside the window, include all of them rather than collapsing to the latest one

### `exclusions`

- Short list of what was intentionally omitted
- Keep it concise

### `sources`

- Flat list of exact source URLs used in the final report
- Prefer primary links only

## Writing Rules

- Prefer Japanese if the user is writing in Japanese
- Use concrete dates and times
- Avoid hype
- Distinguish official news from engineer-level signals
- Keep summaries compact because the renderer already provides structure

## Output Rules

When editing the repo directly:
- write or update `site-src/content/reports/YYYY-MM-DD.json`
- keep property names and shapes exactly aligned with the schema
- do not hand-edit generated files in `site/` unless the user explicitly asks

When replying in chat:
- briefly state which JSON file was created or updated
- mention whether validation passed
- mention whether the site was rebuilt

## Example Invocation

- "Use `$Claude News HTML Report` to convert today's Claude watch results into a schema-valid website report JSON."
- "Use `$Claude News HTML Report` to create `site-src/content/reports/2026-04-23.json` and rebuild the site."
