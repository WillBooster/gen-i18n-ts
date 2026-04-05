---
name: review-claude
description: Run Claude Code review against the current branch and report only the review comments that are still valid for the current codebase, without applying fixes.
allowed-tools: Bash(bunx:*)
---

# Review workflow

1. Run the following command with a 1-hour timeout (DO NOT STOP THE COMMAND BEFORE 1 HOUR ELAPSES): `bunx @willbooster/agent-skills@latest review --agent claude`
2. Report on the review results.
