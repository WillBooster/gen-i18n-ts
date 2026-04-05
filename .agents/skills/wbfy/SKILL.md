---
name: wbfy
description: Apply `wbfy` to the current repository.
allowed-tools: Bash(bun:*), Bash(gh:*), Bash(git:*), Bash(yarn:*)
---

# wbfy application workflow

1. Run `yarn start <directory_path_of_target_repo>` in `~/ghq/github.com/WillBooster/wbfy`.
2. Run `yarn check-for-ai` or `bun check-for-ai` in the target repository, not in `wbfy`.
3. If any check fails, do one of the following:
   - Fix the target repository, then go back to step 2.
   - If the failure comes from `wbfy`, fix `~/ghq/github.com/WillBooster/wbfy`, commit and push the change, open a PR in the `wbfy` repository, then go back to step 1.
4. Commit and push any change in the target repository, then open a PR there.
