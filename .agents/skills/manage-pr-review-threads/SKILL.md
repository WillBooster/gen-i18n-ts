---
name: manage-pr-review-threads
description: Inspect unresolved review threads for the current pull request, then reply to and resolve them as needed.
allowed-tools: Bash(bun:*), Bash(gh:*), Bash(git:*)
---

# Manage PR Review Threads

Use this skill when you need to inspect unresolved review threads and then reply to or resolve them.

## List unresolved review threads

```bash
bunx @willbooster/agent-skills@latest list-pr-review-threads
```

## Reply to and resolve review threads

```bash
bunx @willbooster/agent-skills@latest resolve-pr-review-threads <<'EOF'
{
  "replies": {
    "PRRT_kwDORiWJ-851nXBt": "Fixed in the latest update.",
    "PRRT_kwDORiWJ-851nXBu": "Kept as-is intentionally. Added clarification in the code."
  }
}
EOF
```

The JSON object must contain `replies`, keyed by review thread ID.

## Notes

- Run the commands from the repository that owns the pull request you want to inspect.
- `resolve-pr-review-threads` depends on thread IDs returned by `list-pr-review-threads`.
