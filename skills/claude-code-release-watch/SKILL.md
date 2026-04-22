---
name: "Claude Code Release Watch"
description: "Use this skill when the user wants recent Claude Code release notes from the official GitHub releases page, especially to check whether a new release was published and what changed."
---

# Claude Code Release Watch

Use this skill when the task is to check Claude Code's official release notes on GitHub.

Prefer the GitHub CLI for release metadata and release-note bodies when `gh` is available and authenticated.
Use the web path only as a fallback when `gh` is unavailable or clearly incomplete.

Default target page:
- `https://github.com/anthropics/claude-code/releases`

Default time window:
- Last 24 hours unless the user specifies another range

## Workflow

1. Use `gh` as the default retrieval path when available.
   Prefer GitHub CLI output over summaries or mirrors because it exposes exact publish timestamps and full release bodies more reliably than the rendered web page.

   Default commands:

```bash
gh release list -R anthropics/claude-code --limit 10
gh release view -R anthropics/claude-code <tag> --json tagName,name,isDraft,isPrerelease,publishedAt,url,body
```

   If `gh` is unavailable, unauthenticated, or returns incomplete data, fall back to the official GitHub Releases web pages.

2. Compute the exact time window when needed.
   Use shell commands for concrete UTC timestamps:

```bash
date -u +%Y-%m-%dT%H:%M:%SZ
date -u -v-24H +%Y-%m-%dT%H:%M:%SZ
```

If the user specifies a different range, compute that exact window instead. In the response, show timestamps in the user's local timezone when possible.

3. Inspect the newest release entries.
   If using `gh`, start from `gh release list`.
   If using the fallback path, open the releases page and inspect the newest release entries.
   Capture for each candidate release:
- version tag
- publish date or datetime
- release URL
- visible summary or notes excerpt

4. Open the individual release detail when needed.
   Prefer `gh release view` for this step.
   Use it to capture:
- exact release title
- full release notes
- clearer publish metadata

For release note extraction:
- read the complete `What's changed` list on the release detail page
- do not stop at a short excerpt if the page exposes a fuller list
- preserve the full set of visible changes for in-window releases

5. Include only releases whose publish time or publish date falls inside the requested window.
   If only a date is available and no time is shown, state that the inclusion is based on the visible publication date.
   If two or more releases fall inside the window, keep all of them and order them newest first.

6. Treat GitHub release metadata as the source of truth.
   Prefer `gh release view` fields such as `publishedAt`, `isDraft`, and `isPrerelease`.
   If you had to use the web fallback, treat the official release page and release note page as the source of truth there.

7. If no in-window releases exist, say so explicitly.

## Selection Guidance

By default:
- include official releases from the GitHub releases page
- include prereleases only if they appear in the requested window, and label them clearly
- do not infer releases from commits, tags, or issues when the release page does not show them

If the newest release is older than the requested window, stop there unless the user asked for a longer range.

## Retrieval Notes

- Prefer `gh` over page scraping whenever possible
- Prefer the official GitHub releases page and release detail pages only when `gh` is unavailable or insufficient
- If GitHub shows both relative and absolute times, prefer the absolute timestamp
- Keep quotes short; summarize the notes in your own words
- If the release notes are long, extract only the main user-facing changes

## Output Format

Keep the output compact and easy to scan.

- State the exact time window used, with concrete timestamps
- If there is a new release, provide one entry per in-window release:
  - version
  - local date or datetime
  - prerelease status if relevant
  - complete list of visible changes from the release page
  - link
- If there are no new releases, say `0件`

## Defaults

- Prefer Japanese if the user is writing in Japanese
- Prefer `gh` for release retrieval
- Fall back to `web` rather than browser automation when `gh` cannot provide the needed data
- Prefer GitHub release metadata over third-party reporting
- Avoid long quotations; summarize in your own words
- When preparing website data, classify the release-note items into:
  - `新機能`
  - `変更`
  - `修正`
- Do not collapse the tail of the list into vague text like `ほか複数の修正`
- If a bullet is visible on the release page, include it somewhere in the final structured output
- When multiple releases appear in the requested window, preserve them as separate releases instead of merging their notes into one flat list

## Example Invocation

- "Use `$Claude Code Release Watch` to check whether Claude Code shipped a new release in the last 24 hours."
- "Use `$Claude Code Release Watch` to summarize the newest Claude Code release notes from GitHub."
