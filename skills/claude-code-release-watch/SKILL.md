---
name: "Claude Code Release Watch"
description: "Use this skill when the user wants recent Claude Code release notes from the official GitHub releases page, especially to check whether a new release was published and what changed."
---

# Claude Code Release Watch

Use this skill when the task is to check Claude Code's official release notes on GitHub.

Always use the GitHub CLI for release metadata and release-note bodies.
For this repo's automation workflow, run `gh` outside the sandbox because sandboxed network access can return stale or incomplete GitHub results.
Do not fall back to `web`, browser automation, or Chrome inspection for Claude Code releases.

Default target page:
- `https://github.com/anthropics/claude-code/releases`

Default time window:
- Last 24 hours unless the user specifies another range

## Workflow

1. Use `gh` as the required retrieval path.
   Prefer GitHub CLI output because it exposes exact publish timestamps and full release bodies more reliably than rendered GitHub web pages.
   In this automation, `gh` must be executed outside the sandbox.

   Default commands:

```bash
gh release list -R anthropics/claude-code --limit 10
gh release view -R anthropics/claude-code <tag> --json tagName,name,isDraft,isPrerelease,publishedAt,url,body
```

   If sandboxed `gh` fails, rerun it outside the sandbox.
   If outside-the-sandbox `gh` is unavailable, unauthenticated, or incomplete, stop and report the block instead of falling back to `web` or browser inspection.

2. Compute the exact time window when needed.
   Use shell commands for concrete UTC timestamps:

```bash
date -u +%Y-%m-%dT%H:%M:%SZ
date -u -v-24H +%Y-%m-%dT%H:%M:%SZ
```

If the user specifies a different range, compute that exact window instead. In the response, show timestamps in the user's local timezone when possible.

3. Inspect the newest release entries from `gh release list`.
   Capture for each candidate release:
- version tag
- publish date or datetime
- release URL
- release metadata from GitHub CLI

4. Open the individual release detail when needed.
   Use `gh release view` for this step.
   Capture:
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

6. Treat GitHub CLI release metadata as the source of truth.
   Use `gh release view` fields such as `publishedAt`, `isDraft`, and `isPrerelease`.
   Do not override `gh` with what a cached or stale web page appears to show.

7. If no in-window releases exist, say so explicitly.

## Selection Guidance

By default:
- include official releases from the GitHub releases page
- include prereleases only if they appear in the requested window, and label them clearly
- do not infer releases from commits, tags, or issues when the release page does not show them

If the newest release is older than the requested window, stop there unless the user asked for a longer range.

## Retrieval Notes

- Always use `gh` outside the sandbox for this workflow
- Do not use page scraping, `web`, or Computer Use / Chrome as fallback paths for Claude Code releases
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
- Always run `gh` outside the sandbox for release retrieval in this repo's automation
- If `gh` cannot provide the needed data outside the sandbox, report the failure instead of falling back
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
