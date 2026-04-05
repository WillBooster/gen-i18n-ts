---
name: review-fix-claude
description: Run Claude Code review against the current branch, fix only the review comments that are still valid for the current codebase, and leave invalid comments unchanged.
allowed-tools: Bash(bunx:*)
---

# Review workflow

1. Run the following command with a 1-hour timeout (DO NOT STOP THE COMMAND BEFORE 1 HOUR ELAPSES): `bunx @willbooster/agent-skills@latest review --agent claude`
2. Treat the returned review results as the candidate comment set to process. If the command returns `There is no concern.`, quit without modifying code.
3. Determine whether each candidate comment is still valid for the current codebase.
4. Fix only the valid comments, leaving invalid comments unchanged.
5. If you made any code changes, commit and push them to the current branch.
6. If you fixed any valid comments, return to step 1. Otherwise, quit the workflow.
