---
name: "Claude News Report"
description: "Use this skill when the user wants a final integrated report about recent Claude-related news, based on upstream collection skills such as official X watch, engineer X watch, official blog watch, and Claude Code release watch."
---

# Claude News Report

Use this skill when the task is to turn multiple Claude-related watch results into one stable final report.

This skill is not a primary collection skill.
Its job is synthesis, prioritization, and formatting.

Default upstream inputs:
- `$Claude Official X Watch`
- `$Anthropic Engineer X Watch`
- `$Anthropic Blog Watch`
- `$Claude Code Release Watch`

Default time window:
- Inherit the window from the upstream watches
- If the upstream steps used different windows, call that out explicitly before summarizing

## Goal

Produce a final report that is:
- stable in structure
- compact enough to scan quickly
- explicit about what is official vs. inferred vs. anecdotal
- useful for daily monitoring

The output should read like an operator report, not a raw dump.

## Workflow

1. Gather the outputs from the upstream watch skills first.
   Do not invent items that were not observed in those sources.

2. Normalize the time window.
   State the exact start and end timestamps in the user's local timezone.

3. Deduplicate overlapping items.
   Common examples:
- the same feature appears in both an official X post and an engineer reply
- a release note and a social post refer to the same shipping change
- the same article appears in both Anthropic News and Claude Blog navigation

4. Classify each candidate item into one primary bucket:
- `Official News`
- `Implementation Signals`
- `New Blog Posts / Releases`
- `Noise / Excluded`

Use these definitions:
- `Official News`: direct announcements from official Anthropic or Claude channels
- `Implementation Signals`: engineer comments, bug-fix replies, rollout hints, operational notes, usage-limit clarifications, UX changes, or shipping intent that is not a formal announcement
- `New Blog Posts / Releases`: official posts on Anthropic or Claude sites, or official Claude Code releases on GitHub
- `Noise / Excluded`: unrelated chatter, low-signal complaints without new information, reposts, duplicates, or items outside the time window

5. Apply a confidence label when needed.
   Use:
- `High`: directly stated by an official source or release page
- `Medium`: directly stated by an Anthropic-affiliated engineer or researcher
- `Low`: relevant but ambiguous, incomplete, or based on limited reply context

6. Prioritize the final report by impact, not source order.
   Within each section, sort by:
- direct product shipping news
- meaningful operational changes
- bug fixes or near-term fixes
- lower-signal commentary

7. If there are no items in a section, say so explicitly.
   Do not silently omit major sections.

## Writing Rules

- Prefer Japanese if the user is writing in Japanese
- Keep the top summary very short
- Avoid breathless wording
- Avoid copying long source text verbatim
- Distinguish clearly between facts and interpretation
- When making an inference, label it as inference
- Use concrete dates and times, not only relative terms like "today"

## Required Output Format

Use this section order unless the user explicitly requests another format.

### 1. 調査窓

State:
- start timestamp
- end timestamp
- timezone
- upstream sources used

### 2. 要点

Write 2 to 4 bullets only.

Each bullet should be one of:
- a major official announcement
- a meaningful product or rollout signal
- a clear "no new official posts/releases" statement when that absence matters

### 3. 公式ニュース

List only direct official announcements from:
- `@AnthropicAI`
- `@ClaudeAI`
- `@ClaudeDevs`
- Anthropic official pages
- Claude official blog

For each item include:
- local timestamp or date
- one-line summary
- source link

If none:
- write `0件`

### 4. 実装・運用シグナル

Summarize non-official but relevant signals from Anthropic-affiliated individuals.

For each item include:
- account
- local timestamp
- concise relevance note
- source link
- confidence if not high

If there are many low-value replies, compress them into one sentence rather than listing each separately.

### 5. 新規ブログ / リリース

Split this section into two short blocks:
- `ブログ`
- `Claude Code リリース`

For each item include:
- date or datetime
- title or version
- short summary
- source link

If none:
- write `0件`

### 6. ノイズ・除外

Briefly note what was excluded and why.
Examples:
- unrelated personal chatter
- duplicate references
- user complaints without new product information
- items outside the requested window

Keep this section short.

### 7. ソース

Provide a flat list of the exact URLs used for the final report.

## Compression Guidance

When the news volume is low:
- keep the whole report short
- prefer explicit `0件` lines

When the news volume is high:
- keep all sections
- compress repetitive engineer replies into grouped summaries
- do not let the report become a transcript dump

## Example Invocation

- "Use `$Claude News Report` to turn the outputs of the four Claude watch skills into one final daily report."
- "Use `$Claude News Report` and keep the final report in a stable operator-style format for daily monitoring."
