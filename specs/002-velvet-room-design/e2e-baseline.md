# 001 e2e baseline (quickstart V0)

Commit `db9f07f` (the last commit before any restyling), in a throwaway git worktree, Chromium in the
devcontainer (`PW_NO_SANDBOX=1`), `pnpm test:e2e`.

**Result: 17 passed, 0 failed.** 001's e2e tests had no failures before this feature, so any failure
after restyling is a regression from 002.

Note: the worktree's `playwright.config.ts` was edited (throwaway only) to use ports 4361/4362 and to
disable the sandbox, because commit `db9f07f` predates `E2E_PORT` and `PW_NO_SANDBOX`.

After feature 002 (this branch): `pnpm test:e2e` runs 80 tests, all passing (these 17 plus the new
room, responsive, a11y-at-390 and empty-gallery checks).
