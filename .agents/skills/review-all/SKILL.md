---
name: review-all
description: Run Codex, Claude Code, and Gemini CLI reviews against the current branch concurrently, deduplicate the findings, and report only the review comments that are still valid for the current codebase.
allowed-tools: Bash(bunx:*), Task
---

# Review workflow

1. Run the following command with a 1-hour timeout (DO NOT STOP THE COMMAND BEFORE 1 HOUR ELAPSES): `bunx @willbooster/agent-skills@latest review --agent all`
2. Treat the combined output as a set of candidate comments returned by Codex, Claude Code, and Gemini CLI running concurrently.
3. Merge the returned review results into a single candidate comment set, deduplicating comments that point to the same underlying issue.
4. Judge whether each candidate comment is still valid in the current codebase.
5. Report only the comments you judged valid. If none remain, respond with exactly: `There is no concern.`
