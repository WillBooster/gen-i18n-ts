---
name: complete-pr
description: Complete GitHub pull requests by iterating on CI and review feedback until the PR is ready.
---

First, fetch the current repository owner with `gh repo view --json owner --jq '.owner.login'`.
If the owner is `WillBooster` or `WillBoosterLab`, follow the first workflow below.
Otherwise, follow the second workflow below.

## Workflow for `WillBooster` or `WillBoosterLab` repositories

1. Read the PR body and its messages with the `fetch-pr` skill.
2. Check the results of CI (GitHub Actions) with the `check-pr-ci` skill.
3. If any workflow has failed, fix the CI issues, commit, push, and then return to step 2. Otherwise, go to step 4.
4. Fetch unresolved review threads with the `manage-pr-review-threads` skill.
5. Review each unresolved thread and decide whether it requires a code or documentation change. Validate each claim against the current codebase first, and reproduce it or check official documentation when needed instead of relying on memory. Ignore only comments that are clearly outdated, incorrect, or intentionally declined with solid reasoning.
6. If there are valid review comments to address, make only the changes supported by the validation from step 5, commit, push, and post `/gemini review` to the PR.
7. Reply to all review threads with the `manage-pr-review-threads` skill.
8. If you made any changes in step 6, wait for 5 minutes (`sleep 5m`) then return to step 2. Otherwise, stop.

## Workflow for the other repositories

1. Read the PR body and its messages with the `fetch-pr` skill.
2. Check the results of CI (GitHub Actions) with the `check-pr-ci` skill.
3. If any workflow has failed, fix the CI issues, commit, push, and then return to step 2. Otherwise, go to step 4.
4. Fetch unresolved review threads.
5. Review each unresolved thread and decide whether it requires a code or documentation change. Validate each claim against the current codebase first, and reproduce it or check official documentation when needed instead of relying on memory. Ignore only comments that are clearly outdated, incorrect, or intentionally declined with solid reasoning.
6. If there are valid review comments to address, make only the changes supported by the validation from step 5, commit, push, and then return to step 2. Otherwise, stop.
   - Do not post any message like review replies on non-WillBooster repositories.
