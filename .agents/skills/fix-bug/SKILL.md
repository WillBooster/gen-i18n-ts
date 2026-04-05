---
name: fix-bug
description: Fix a reported bug by first enhancing tests until the bug is reproduced, then fixing the implementation, and finally confirming the enhanced tests pass.
---

# Bug fix workflow

1. Understand the reported bug precisely.
   - Identify the expected behavior, the actual behavior, and the smallest scope that reproduces the problem.
2. Inspect the existing tests and locate the best place to extend them.
   - Prefer enhancing an existing focused test file over adding a broad new one.
3. Before modifying tests, gather debugging evidence that helps explain the failure mode.
   - Use logging, screenshots, traces, or other lightweight diagnostics that fit the stack.
4. Enhance the tests until they reproduce the bug.
   - If a relevant test already fails for the bug, keep it as the reproduction and tighten it only if needed.
   - Stop once the reproduction is minimal, reliable, and clearly tied to the reported bug.
5. Fix the implementation without weakening the new or existing assertions.
   - Keep the code change as small and cohesive as possible.
6. Run the enhanced tests and confirm they pass with the fix in place.
7. If the repository workflow requires broader verification, run the relevant checks after the targeted tests pass.
8. Summarize the root cause, the test enhancement, and the implementation fix.
