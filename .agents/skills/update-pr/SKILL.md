---
name: update-pr
description: Update the pull request body for the current branch in the current repository.
allowed-tools: Bash(bun:*), Bash(gh:*), Bash(git:*)
---

# Update PR workflow

Write the complete replacement PR body so it reflects the current scope, motivation, and validation.
Because updating replaces the existing body, include the full desired text, not just a diff.
Run the following command to update the pull request body.
Finally, report the pull request URL.

```bash
bunx @willbooster/agent-skills@latest update-pr <<'EOF'
Close #<issue>

## Summary

- What changed
- Key scope or affected area
- Any notable tradeoff or limitation

## Why

- Problem being solved
- Reason this approach was chosen

## Testing

- Exact commands run
- Manual verification steps if relevant

## Notes (if needed)

- Breaking changes, rollout concerns, screenshots, or follow-up work
EOF
```
