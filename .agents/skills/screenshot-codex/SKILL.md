---
name: screenshot-codex
description: Run Codex to take a screenshot for a specific page.
allowed-tools: Bash(bunx:*)
---

# Screenshot workflow

1. Run the following command with a 1-hour timeout (DO NOT STOP THE COMMAND BEFORE 1 HOUR ELAPSES): `bunx @willbooster/agent-skills@latest screenshot --agent codex <initial-url> <page-name> <description>`
   - `<initial-url>`: Initial URL to open before navigating
   - `<page-name>`: Page name to navigate to from the initial page
   - `<description>`: Description of the part to capture in the screenshot
2. Report the screenshot file path returned by the agent.
