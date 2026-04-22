---
name: "Anthropic Blog Watch"
description: "Use this skill when the user wants recent updates from Anthropic's official websites, especially new posts from the Engineering, Research, News, and Claude blog pages."
---

# Anthropic Blog Watch

Use this skill when the task is to check Anthropic's official sites for newly published articles.

Default target pages:
- `https://www.anthropic.com/engineering`
- `https://www.anthropic.com/research`
- `https://www.anthropic.com/news`
- `https://claude.com/blog`

Default time window:
- Last 24 hours unless the user specifies another range

## Workflow

1. Use the `web` tool as the default retrieval path.
   Prefer official page contents over third-party coverage.

2. Compute the exact time window when needed.
   Use shell commands for concrete UTC timestamps:

```bash
date -u +%Y-%m-%dT%H:%M:%SZ
date -u -v-24H +%Y-%m-%dT%H:%M:%SZ
```

If the user specifies a different range, compute that exact window instead. In the response, show timestamps in the user's local timezone when possible.

3. Open each target page and inspect the article listing.
   Capture for each candidate article:
- title
- publish date if shown
- URL
- short summary or excerpt if available

4. Treat the official page as the source of truth for whether an article exists.
   If the listing omits a usable date, open the article page and inspect metadata or visible publish information.

5. Include only articles whose publish time or publish date falls inside the requested window.
   If only a date is available and no time is shown, state that the inclusion is based on the visible publication date.

6. Prefer explicit source attribution.
   Link the exact article URL and the section page used to discover it.

7. If a section has no new in-window articles, say so explicitly.

## Selection Guidance

By default:
- include all new official articles from the four target pages
- do not infer unpublished launches or rumors from navigation changes alone
- if the same article appears on more than one target page, report it once and note the duplicate listing if relevant

If relevance is ambiguous, include the article and label the uncertainty rather than silently dropping it.

## Web Notes

- Use only the official Anthropic and Claude domains unless the user asks for broader coverage
- Prefer the page's visible article list before opening many individual pages
- If the site uses relative dates or weak metadata, mention that limitation clearly
- If an article page has stronger metadata than the list page, prefer the article page for the final timestamp call

## Output Format

Keep the output compact and easy to scan.

- State the exact time window used, with concrete timestamps
- Group results by section:
  - Engineering
  - Research
  - News
  - Claude Blog
- For each included article, provide:
  - local date or datetime if available
  - title
  - short summary
  - link
- If a section has zero new posts, say `0件`

## Defaults

- Prefer Japanese if the user is writing in Japanese
- Use the `web` tool rather than browser automation
- Prefer official listings and article pages over search engine summaries
- Avoid long quotations; summarize in your own words

## Example Invocation

- "Use `$Anthropic Blog Watch` to check whether Anthropic published any new official articles in the last 24 hours."
- "Use `$Anthropic Blog Watch` to list new posts from engineering, research, news, and the Claude blog in the last 7 days."
