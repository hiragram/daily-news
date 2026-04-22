---
name: "Claude Official X Watch"
description: "Use this skill when the user wants recent Claude-related updates from official X accounts, especially posts from `@AnthropicAI`, `@ClaudeAI`, and `@ClaudeDevs`, using X MCP search tools instead of browser automation."
---

# Claude Official X Watch

Use this skill when the task is to fetch recent Claude-related updates from official X accounts with `x_mcp`.

Default target accounts:
- `@AnthropicAI`
- `@ClaudeAI`
- `@ClaudeDevs`

Default time window:
- Last 24 hours unless the user specifies another range

## Workflow

1. Use `mcp__x_mcp__.searchPostsRecent` as the default retrieval path.
   Do not use browser automation unless the user explicitly asks for it or the MCP path fails.

2. Compute the exact time window in UTC when needed.
   Use a shell command for exact timestamps:

```bash
date -u +%Y-%m-%dT%H:%M:%SZ
date -u -v-24H +%Y-%m-%dT%H:%M:%SZ
```

If the user gives a different range, compute that exact UTC start and end instead. In the response, convert timestamps to the user's local timezone.

3. Query the official accounts with one combined search:

```text
from:AnthropicAI OR from:ClaudeAI OR from:ClaudeDevs
```

4. Pass the exact UTC time window into the MCP call whenever possible.
   Use `start_time` and `end_time` for the requested range, and request `created_at`, `author_id`, `referenced_tweets`, and `entities` in the tweet fields.

5. Read the returned post timestamps and collect only posts inside the requested time window.
   Default behavior:
- Use main posts only
- Exclude replies unless the user asks to include them
- Exclude reposts unless the user asks to include them

6. Open individual posts only when needed to capture:
- exact timestamp
- full post text if the timeline truncates it
- canonical post URL

7. Treat MCP timestamps and payloads as the source of truth.
   Prefer API fields over browser-visible relative times.

8. For "Claude-related" requests:
- Always include posts from `@ClaudeAI`
- Always include posts from `@ClaudeDevs`
- For `@AnthropicAI`, include posts in the window and note whether any are clearly about Claude, Claude Code, Opus, Sonnet, or related Claude products
- If there are no matching posts, say so explicitly

## X MCP Notes

- Prefer `searchPostsRecent` over browser search
- Use `searchPostsAll` only if the user asks for a period beyond the recent-search window
- If the MCP result excludes needed context, request expansions for referenced tweets and authors
- If the MCP path fails or lacks required data, report that clearly before falling back to browser inspection

## Output Format

Keep the answer compact and easy to scan.

- State the exact time window used, with concrete timestamps
- Group results by account
- For each post, include:
  - local timestamp
  - post text
  - X link
- If there are zero posts, say `0件`

When the user asks for "latest information", prefer the user's local timezone in the response and avoid relative-only wording like "today" without dates.

## Defaults

- Exclude replies and reposts unless the user asks to include them
- Prefer Japanese if the user is writing in Japanese
- Do not over-summarize a single post; show the actual text when feasible
- Use X MCP rather than Computer Use for retrieval

## Example Invocation

- "Use `$Claude Official X Watch` to get posts from `@AnthropicAI` and `@ClaudeAI` from the last 24 hours."
- "Use `$Claude Official X Watch` to get posts from `@AnthropicAI`, `@ClaudeAI`, and `@ClaudeDevs` from the last 24 hours."
- "Use `$Claude Official X Watch` and include replies for the last 7 days."
