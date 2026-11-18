# Repository management

## Branch roles

- `master`: the published repository snapshot and GitHub Pages source (`/`).
- `feature/modularize-framework`: the current development line. Keep it until the
  modularization roadmap is complete; integrate master before publishing to it.
- `release`: retained historical release line. It contains a commit outside the
  active development ancestry and is not removed based on age alone.
- New work branches use `codex/<short-purpose>` when an isolated branch is needed.
  Reuse the current checkout for a continuation of its existing work.

Before deleting a branch, fetch/prune remotes, inspect open pull requests, compare
ancestry and check linked worktrees. A stale name is not evidence that its work can
be discarded. Remove merged branches with `git branch -d` and explicit remote
ref deletions. Never rewrite shared history or force-push as routine cleanup.

## Audit on 2026-11-18

No open pull requests were returned for the repository. The following old feature
refs were entirely contained in the active development line, with zero unique
commits, and were removed:

| Branch | Removed refs | Preserved tip |
| --- | --- | --- |
| feature/Core3D-Extention | Local and origin | a917b0008abef2dfd9de8c082e592cc596b9e076 |
| feature/refactor-and-fix | Local | e10475a125c87870c0ae3cb2ec3a1040a08598ee |
| feature/ECS-Hybrid | origin | 357299d1b8a42d75cf19bade184df3ff31e93ecb |
| feature/components | origin | 5685c24d7099cf4d7f3c8f23e62dabaa9a96cc42 |
| feature/load-model | origin | 87c7affab10aeca319bbbaa0650b9f584718d9cb |

These commits remain in development history. Before removing refs, a complete
verified bundle was created at the ignored local path
`test-results/repository-before-cleanup-2026-11-18.bundle`. The bundle is a local
recovery aid, not an additional branch or a published artifact. Git internals and
local agent checkpoint refs are not treated as project branches.

## Directory ownership

| Directory | Tracked purpose |
| --- | --- |
| src/ | Framework runtime and addon source |
| examples/ | Game-owned code/assets; configuration lives in each demo's config/ |
| cli/ | Offline development and distribution tools |
| scripts/ | Repository validation and documentation generation |
| tests/ | Repeatable automated checks and browser scenarios |
| docs/ | Tutorials, conventions, roadmap and generated API reference |
| site/ | Presentation stylesheet and curated screenshots |

Keep the landing index.html and demo launcher Main.html at the root for the
existing Pages routes. Build outputs belong in ignored dist/, publish/ or build/;
screenshots, scratch runners and browser results belong in ignored test-results/.
Do not move engine assets without updating the consumers and editor manifests.
Reusable test runners belong under tests/ and have a package.json script.

## Publish

Run check, tests, docs:check, test:site and relevant browser scenarios before
publication. Integrate the latest origin/master without dropping its commits,
push the development snapshot, then fast-forward master to the tested integration.
GitHub Pages currently builds master at the repository root. Confirm the Pages
build commit and fetch the deployed page before reporting it published. Preserve
runtime/demo source paths so the demo launcher and documentation continue working.
