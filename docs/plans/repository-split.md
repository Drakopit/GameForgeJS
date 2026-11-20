# GameForgeJS: standalone runtime and companion repositories

Status: proposal based on the inspected checkout, 20 November 2026. No extraction,
repository creation, history rewrite or package publication has been performed.
Storm Foundry is implemented in the current layout so existing builds keep working.

## Decision

Keep one cohesive runtime package and its public subpath exports. Separate products
and deployment lifecycles, not every class into a repository. Preserve
BootstrapGame → Module → Level → GameObject/Component. The distribution manifest
selects files; it is not a replacement for class modules or the engine lifecycle.
The current entity/component architecture is not an archetype ECS.

Apply the dependency/config/build principles of [The Twelve-Factor App](https://12factor.net/)
to the surrounding applications. A framework library is not a deployed SaaS process;
it does not need environment variables for math, stateless entity storage or a
mandatory service container. Browser configuration is public data, never a place
for server secrets. The online server currently holds stateful rooms in memory;
extracting it does not magically make it horizontally scalable or persistent.

## What actually exists today

| Area | Current coupling that extraction must address |
| --- | --- |
| Runtime | `src/core`, `2d`, `3d`, `network`, `compat` use relative source imports; browser runtime has no external packages. |
| npm package | Root is private, version `1.0.0`, ships both `src` and `cli`; Acorn is a dependency used by tooling. Zero browser dependencies is not yet a standalone dependency-free npm manifest. |
| CLI | `cli/lib/project.cjs` derives ENGINE_ROOT from its own directory. It checks a project's direct node_modules and enginePath; workspace hoisting/independent CLI installation needs a real package resolver. |
| Demos | Source import maps point at `../../src`; each has its own config, package selection and assets. Production builds already copy selected runtime groups and are portable. |
| Addons | Three built-ins under `src/addons`; CLI package selection hardcodes their names. External versioned addon package resolution is not implemented yet. |
| Site | Root index, site resources, Main launcher, examples/showcase, catalog, screenshots and example URLs are coordinated in this repository. |
| Server | The .NET csproj copies world.rules.json from the online example; Docker copies it from that same sibling path. The parity harness also references the in-tree server project. |
| Tests/docs | Project checks, generated API docs and browser suites share repository-root assumptions. They must be divided by owner, not copied verbatim. |
| Editor | Project/workspace metadata and editor integration checks exist. No desktop editor application source was found in this checkout; do not invent an extraction of absent code. |

## Proposed repositories and ownership

Names and npm scopes below are proposed, not claims that repositories/packages or
namespace ownership already exist.

| Repository | Owns | Consumes / publishes |
| --- | --- | --- |
| **GameForgeJS** | Pure runtime `src/core`, `2d`, `3d`, `network`, `compat`; public API/types; runtime unit tests; small conformance fixtures; generated API documentation and release notes. | One `gameforgejs` package, with `dependencies: {}` and no required peers, tools, site, backend or editor. |
| **GameForgeJS-Tooling** | CLI, publisher, minimal project templates, package/build validation, editor adapters and CLI integration tests. | Proposed `@gameforgejs/cli`; optional Node tools may use Acorn and other explicitly declared dependencies. Resolves a game's installed runtime package. |
| **GameForgeJS-Showcases** | Games including Storm Foundry, Toon/ABS, Platform Adventure and online client; owned assets/licenses; tutorial/Zero-to-Hero materials; visual/integration tests and captures. | Exact runtime/CLI versions, with internal workspaces for individual example projects. Publishes portable demo artifacts and a versioned catalog. |
| **GameForgeJS-Website** | Presentation/i18n, gallery/launcher, branding, website tests and deployment. | Consumes released showcase artifacts/catalog and runtime API documentation. No builds from a sibling runtime checkout. |
| **GameForgeJS-Addons** | Separate packages for parallax, platformer and state machines; addon tests/guides and reusable future mechanics. | `@gameforgejs/addon-*` packages with a compatible runtime peer and an exact runtime devDependency for tests. No copied framework classes. |
| **GameForgeJS-OnlineServer** | Authoritative server, protocol/rules contracts, .NET simulation tests, Docker/deployment configuration. | Versioned container image and immutable protocol/rule fixtures. Browser network module stays in core; game server code does not. |

If a maintained desktop editor is later included, give it **GameForgeJS-Editor**
and its own release/dependency lifecycle. It consumes Tooling's documented adapter
contracts and runtime public APIs. It must not patch or vendor the runtime as its
primary integration mechanism.

```text
GameForgeJS runtime package
    ↑ public APIs / one runtime identity
    ├─ Tooling + minimal templates
    ├─ Addon packages (peer runtime)
    └─ Showcase projects ── JSON/WSS contract ── OnlineServer image
            ↓ portable, versioned artifacts
         Website / gallery

Optional Editor → documented Tooling adapters + public runtime
```

The runtime has no reverse dependency on any of these consumers. Cross-repository
relative filesystem imports, Git submodules and shared editable runtime copies are
not part of this design.

## Package, version and development contracts

Retain `gameforgejs/core`, `/2d`, `/3d`, `/network`, `/compat` public imports. Keep
the src layout initially so the existing build copier can adapt incrementally.
The standalone runtime package contains only src, generated declaration files,
license/readme and package metadata. Its npm manifest has no CLI bin or external
runtime dependencies. Check namespace ownership before publishing; if the name is
unavailable, use a verified scope and migrate aliases deliberately.

The private checkout's 1.0.0 is not evidence of a stable public release. Proposed
first extracted release: **1.0.0-alpha.1**, then release candidates and 1.0.0 after
the extraction conformance gates. These versions are examples for a future release,
not installable packages delivered by this change. Consumers pin exact versions:

```json
{
  "dependencies": { "gameforgejs": "1.0.0-alpha.1" },
  "devDependencies": { "@gameforgejs/cli": "1.0.0-alpha.1" }
}
```

Commit consumer lockfiles and use npm ci in CI. Runtime, CLI, addons and backend
version independently; record a tested compatibility table. Addons declare a peer
range such as `^1.0.0-alpha.1` plus the exact tested runtime in devDependencies.
Use normal SemVer: removing bundled addon exports or changing lifecycle contracts
requires a major release after the stable line exists.

### Local linking without a permanent mega-workspace

Keep repositories as sibling checkouts. Showcases may use workspaces internally;
do not commit sibling paths into release manifests or consumer lockfiles.

```text
dev/
  GameForgeJS/
  GameForgeJS-Tooling/
  GameForgeJS-Showcases/   package.json → workspaces: ["projects/*"]
  artifacts/
```

For active runtime work, from the future showcase workspace root:

```sh
npm install --no-save --package-lock=false ../GameForgeJS
# Tooling resolves gameforgejs via Node package resolution from each project,
# including parent node_modules directories; it never guesses a sibling checkout.
```

An alternative is npm link: run `npm link` in runtime, then `npm link gameforgejs
--no-save --package-lock=false` in the consumer. It is convenient for editing but
has global/symlink state; do not use it as a release test. Maintain one runtime
identity so instanceof, singleton Input and modules cannot split across copies.
See [npm link](https://docs.npmjs.com/cli/npm-link/).

The release gate uses a real tarball instead of linking. Today the installed-pack
CLI test already proves this installation/build route for the combined package:

```sh
# Runtime/package checkout; artifacts is an existing sibling output directory.
npm pack --pack-destination ../artifacts
# In an independent game, install the produced tarball (actual filename/version).
npm install --save-exact ../artifacts/gameforgejs-1.0.0-alpha.1.tgz
npx gameforge build
```

After CLI extraction, install its separately produced tarball as a devDependency
before the last command. CI checks the packed runtime/CLI, not just source imports.
Source development uses project-local `./@engine/` import-map routes served by the
CLI; published games retain equivalent relative routes. The current ../../src
maps must be migrated before games leave this checkout. The website consumes
build outputs, so it does not need a special development server for 15 sibling
source projects. [npm install and lockfiles](https://docs.npmjs.com/cli/install/).

## Safe migration sequence and acceptance gates

1. **Freeze a reproducible baseline.** Tag the agreed commit, record all current
   Pages URLs/aliases and collect source + portable screenshots, input tests and
   package installation tests. Pin tooling and build versions. No deletion yet.
2. **Make the runtime package separable in place.** Generate/publicly export types,
   remove CLI/parser dependencies from the future runtime manifest, constrain the
   pack allowlist and run imports in a clean consumer with no browser globals.
   Keep tiny API/conformance examples, not large showcase assets, in core tests.
3. **Extract Tooling first.** Replace its own-repository engine fallback with explicit
   package resolution from the game, then its Node resolution parents. Preserve
   explicit --engine and legacy project layouts during transition. Minimal templates
   use versioned package dependencies and ./@engine maps. Prove offline tarball
   install/build, source serving, dry runs, prefix hosting and safe output checks.
4. **Cut the server/rules coupling.** Put authoritative rules and a schema/version
   in OnlineServer/contracts, with a checksum in released fixtures. Ship the same
   immutable version with the client. Make the server/Docker build independent of
   examples paths, and the parity harness independent of a sibling csproj. Add a
   rules hash/version handshake before allowing different game-rule releases to
   connect silently. Keep a single instance until shared room state is designed.
5. **Extract Showcases.** Preserve each project's local configs/assets/provenance;
   change only dependency/import routes, then prove all public demos from installed
   packages under root and prefix URLs. Put common showcase tooling at its workspace
   root; games do not import each other's source/assets. Move tutorial content by
   topic after a link inventory; do not filter out the whole docs tree blindly.
6. **Extract Website.** Consume showcase catalog/capture/build artifacts by release
   version/hash. Preserve the existing drakopit.github.io/GameForgeJS URL during a
   transition: keep a Pages deployment branch in the existing repository, generated
   from the Website pipeline, then redirects for old Main aliases and demo URLs.
   Runtime master no longer needs website files. Avoid redirect loops and retain
   query strings (room/server) and hash anchors in invitations.
7. **Extract addons one at a time.** The current CLI's fixed addon list does not
   support this yet. Add a versioned addon-package resolver/manifest schema with v1
   compatibility first. Publish the same classes, importing only public runtime
   entrypoints. Update games to canonical addon package imports and verify shared
   class identity. Retain old bundled exports in a compatibility release until a
   deliberate major removal; never make core depend on addons to forward them.
8. **Prune the active core tree last.** Remove companion folders by ordinary commits
   only after replacement URLs/artifacts and installation tests pass. Keep the old
   tag as rollback. Do not force-push rewritten history over the shared repository.

Each stage is independently reviewable. Rollback means restoring the previous
package/artifact version and deployment, not manually copying engine files between
repositories. No editor, account, database or website should be required to test
or use the runtime.

## History-preserving extraction

Use a fresh clone per new repository. git-filter-repo retains the relevant author/
file history but creates new commit IDs. Export its commit-map as a migration
artifact. Before filtering, inventory legacy path renames from the existing
repository-layout migration and `git log --all --name-status --find-renames`.
Path filters do not automatically follow old directory names, so include those
paths when full pre-rename history matters. See the tool's
[official documentation](https://github.com/newren/git-filter-repo/blob/main/Documentation/git-filter-repo.txt).

For example, only in a **new disposable clone**, after installing git-filter-repo:

```sh
git clone https://github.com/Drakopit/GameForgeJS.git GameForgeJS-Showcases-extract
cd GameForgeJS-Showcases-extract
git filter-repo --path examples/ --path-rename examples/:projects/
# This minimal example preserves the current examples path history. Add the
# inventoried old paths to the filter for earlier renamed directories as needed.
# Remove/move the gallery launcher from projects/showcase in a normal follow-up
# commit; its final owner is Website. Repair manifests and tests before pushing.
```

Build a similarly explicit path list for each repository; tests and documentation
often contain mixed concerns and require an ordinary split commit after filtering.
Do not run these commands in the working checkout or use --force to bypass the
fresh-clone safeguard. Set the new remote only after inspecting files and history.

Preserving the existing core history means historical heavy blobs remain in Git,
even after the active tree is clean. npm artifacts stay small via the allowlist;
partial/shallow clones can reduce checkout cost. A physical history shrink would
be a separate disruptive migration, not a prerequisite for a focused core repo.

## Trade-offs and checks

| Choice | Benefit | Cost / mitigation |
| --- | --- | --- |
| One runtime package, public subpaths | One version/class identity; simple zero-dependency browser runtime | Group-level distribution is not symbol tree shaking; retain honest package-size reporting. |
| Independent product repos | Clear owners, small packages, isolated server/site deploys | Cross-repo changes need pinned prereleases and a compatibility matrix. |
| Internal showcase workspaces | Shared dev tools without duplicated engines | CLI must resolve hoisted packages correctly; no implicit sibling fallback. |
| Tarballs as release gate | Catches missing files/types and private-path imports | Slower than links; use links for iteration, tarballs for CI/release. |
| Versioned static demo artifacts | Site deploys independently; old examples stay playable | Store artifact provenance/checksums and refresh captures deliberately. |
| Addon peers | No duplicate runtime or reverse dependency | Breaking changes need tested peer ranges and coordinated upgrades. |

Core CI: zero external runtime imports, package allowlist, strict public types,
unit tests, singleton/class-identity conformance and a clean tarball consumer.
Tooling CI: real installed packages, prefix builds and no sibling-directory access.
Showcase CI: strict demo types, physics/particle invariants, bounded stress and
desktop/gamepad/touch/browser cleanup. Website CI: versioned artifact links, images,
i18n and old-route redirects. Server CI: protocol/rules hash, rate/authority tests
and the same deterministic physics fixtures used by the web client.
