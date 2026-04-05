---
name: open-pr
description: Create a pull request for the current branch in the current repository.
allowed-tools: Bash(bun:*), Bash(gh:*), Bash(git:*)
---

# Open PR workflow

Commit your changes and push them to the current branch.
Write a PR body that helps reviewers quickly understand the scope, motivation, and validation.
Include the linked issue when applicable, a concise summary of the changes, the reasoning behind them, and how they were tested.
Run the following command to open a pull request.
Finally, report the PR URL.

```bash
bunx @willbooster/agent-skills@latest open-pr <<'EOF'
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
