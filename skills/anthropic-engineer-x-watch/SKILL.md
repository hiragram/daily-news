---
name: "Anthropic Engineer X Watch"
description: "Use this skill when the user wants recent X posts from a curated list of Anthropic-affiliated engineers and researchers, gathered with X MCP search tools rather than browser automation."
---

# Anthropic Engineer X Watch

Use this skill when the task is to collect recent posts from Anthropic-affiliated individual accounts on X with `x_mcp`.

Default target accounts:
- `@bcherny`
- `@DarioAmodei`
- `@meag_han_c`
- `@felixrieseberg`
- `@adocomplete`
- `@sidbid`
- `@dickson_tsai`
- `@janleike`
- `@AmandaAskell`
- `@dmwlff`
- `@amorriscode`
- `@mikeyk`
- `@jarredsumner`
- `@The_Whole_Daisy`
- `@trq212`
- `@alexalbert__`
- `@_catwu`

Default time window:
- Last 24 hours unless the user specifies another range

## Goal

This skill is for broad monitoring of potentially important posts from individual people, not just official product announcements.

Use it to gather:
- posts that may contain product hints, launch context, rollout notes, engineering details, safety commentary, demos, or operational caveats
- posts that matter even if they are less formal than the official Anthropic accounts

This is a separate task from official-account monitoring. Do not merge or substitute it with the official account skill unless the user explicitly asks.

## Workflow

1. Use `mcp__x_mcp__.searchPostsRecent` as the default retrieval path.
   Do not use browser automation unless the user explicitly asks for it or the MCP path fails.

2. Compute the exact time window when needed.
   Use shell commands for concrete UTC timestamps:

```bash
date -u +%Y-%m-%dT%H:%M:%SZ
date -u -v-24H +%Y-%m-%dT%H:%M:%SZ
```

If the user specifies a different range, compute that exact window instead. In the response, show timestamps in the user's local timezone.

3. Use one combined search query as the default retrieval path:

```text
from:bcherny OR from:DarioAmodei OR from:meag_han_c OR from:felixrieseberg OR from:adocomplete OR from:sidbid OR from:dickson_tsai OR from:janleike OR from:AmandaAskell OR from:dmwlff OR from:amorriscode OR from:mikeyk OR from:jarredsumner OR from:The_Whole_Daisy OR from:trq212 OR from:alexalbert__ OR from:_catwu
```

4. Pass the exact UTC time window into the MCP call whenever possible.
   Use `start_time` and `end_time`, and request enough tweet fields to judge relevance:
- `created_at`
- `author_id`
- `conversation_id`
- `referenced_tweets`
- `entities`
- `in_reply_to_user_id`

5. Read returned post timestamps and collect only posts inside the requested window.
   Default behavior:
- include authored posts
- include replies when they appear relevant
- exclude reposts

6. When a candidate post is a reply, inspect the parent-post context before deciding whether to include it.
   Use the MCP payload first to answer:
- what topic the reply is responding to
- whether the topic is actually about Claude, Anthropic products, model behavior, tooling, rollout, support, or operations
- whether the reply adds meaningful information beyond generic chatter

If the parent context is unclear from the reply alone, request tweet expansions for referenced tweets. Only fall back to browser inspection if the MCP response still lacks enough context.

7. Open individual posts when needed to capture:
- exact timestamp
- full text if the timeline truncates it
- canonical post URL

8. Treat MCP timestamps and referenced-tweet payloads as the source of truth.

9. Fall back to direct profile inspection only when the MCP result is flaky, incomplete, or clearly missing required context.
    Relevant profile URLs:
- `https://x.com/bcherny`
- `https://x.com/DarioAmodei`
- `https://x.com/meag_han_c`
- `https://x.com/felixrieseberg`
- `https://x.com/adocomplete`
- `https://x.com/sidbid`
- `https://x.com/dickson_tsai`
- `https://x.com/janleike`
- `https://x.com/AmandaAskell`
- `https://x.com/dmwlff`
- `https://x.com/amorriscode`
- `https://x.com/mikeyk`
- `https://x.com/jarredsumner`
- `https://x.com/The_Whole_Daisy`
- `https://x.com/trq212`
- `https://x.com/alexalbert__`
- `https://x.com/_catwu`

## Selection Guidance

This skill is meant to gather candidate signal, not just everything verbatim.

By default:
- collect posts from the target accounts that fall within the time window
- include replies if, after checking the parent post, they contain meaningful Claude- or Anthropic-relevant information
- highlight posts that appear materially relevant to Claude, Anthropic products, model behavior, releases, tooling, safety, infrastructure, or rollout details
- if a post is clearly unrelated personal chatter, it can be omitted from the main summary and counted as scanned but not relevant
- ignore reposts even if the reposted content is relevant; prefer the original authored or reply post instead

If the user asks for exhaustive coverage, include all in-window authored posts from the monitored accounts.

If relevance is ambiguous, include the post and label it as lower-confidence rather than silently dropping it.

## X MCP Notes

- Prefer `searchPostsRecent` over browser search
- Use `searchPostsAll` only if the requested time range exceeds the recent-search window
- For replies, request referenced-tweet expansions before resorting to browser thread inspection
- If the MCP response does not include enough context to judge relevance, say so clearly
- Ignore reposts in the main summary even if they would otherwise match the query

## Output Format

Keep the output compact and decision-oriented.

- State the exact time window used, with concrete timestamps
- Provide a short section for:
  - relevant posts found
  - accounts checked with no relevant in-window posts
  - blocked or inaccessible accounts, if any
- For each included post, provide:
  - account handle
  - local timestamp
  - short relevance note
  - post text
  - X link

If no relevant posts are found, say so explicitly.

## Defaults

- Prefer Japanese if the user is writing in Japanese
- Use X MCP rather than Computer Use for retrieval
- Include relevant replies by default after checking parent context
- Exclude reposts unless the user asks otherwise
- Favor relevance over exhaustiveness unless the user asks for a complete dump
- Avoid over-summarizing; preserve the original wording of important posts when feasible

## Example Invocation

- "Use `$Anthropic Engineer X Watch` to collect important posts from the monitored Anthropic engineers from the last 24 hours."
- "Use `$Anthropic Engineer X Watch` and return every authored post from the monitored accounts from the last 24 hours."
