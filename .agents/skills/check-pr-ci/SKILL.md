---
name: check-pr-ci
description: Check the latest test-related CI results for the current pull request.
allowed-tools: Bash(bun:*), Bash(gh:*), Bash(git:*)
---

# Check PR CI

Run the following command with 1 hour timeout to inspect the latest CI status: `bunx @willbooster/agent-skills@latest check-pr-ci`
It classifies the latest result of each workflow as `successful`, `running`, or `failed`.
