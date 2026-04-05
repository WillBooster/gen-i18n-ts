---
name: simplify-pr-gemini
description: Use Gemini CLI to simplify the current pull request by safely reducing unnecessary scope, complexity, and noise while preserving the intended outcome.
allowed-tools: Bash(bunx:*)
---

# PR simplification workflow

1. Run the following command with a 1-hour timeout (DO NOT STOP THE COMMAND BEFORE 1 HOUR ELAPSES): `bunx @willbooster/agent-skills@latest simplify --agent gemini`
2. Report on the simplification results.
