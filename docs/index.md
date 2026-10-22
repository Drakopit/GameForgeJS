# GameForgeJS documentation

Start with an executable project, then read the guide for the feature you
want to change. English is the canonical language for this documentation.

## Getting started

- [Zero to Hero: first lesson and complete-game goals](./getting-started/zero-to-hero.md)

- [Create a project](./getting-started/new-project.md)
- [Learn from 2D and 3D examples](./getting-started/tutorial-demos-2d-3d.md)
- [Configure input per game](./getting-started/input-config.md)
- [Gamepad aliases](./getting-started/gamepad.md)

## Guides

- [Configuration layout and ownership](./guides/configuration-layout.md)

- [Architecture and ownership](./architecture.md)
- [Components and entity behavior](./guides/components.md)
- [3D rendering](./guides/render3d.md)
- [Networking](./guides/network.md)

## Reference

- [CLI commands](./reference/cli.md)
- [Generated public API](./reference/api/index.md)
- [Advanced stage manifests](./manifests/advanced-stage-manifest.md)
- [2D hitbox manifests](./manifests/hitbox-manifest.md)

## Integration and migration

- [Repository and project migration](./migrations/repository-layout.md)
- [External 2D editor contract](./tools/world-editor-v4.md)
- [External 3D editor contract](./tools/scene-editor-3d.md)

## Maintaining the documentation

The README is an overview, tutorials teach a task, guides explain a concept,
and reference pages describe a contract. Link to the owning page instead of
copying its full instructions into several documents.

Public JSDoc is the source for generated API reference pages. Keep it next to
the exported class, function, or constant and document parameters, return
values, disposal requirements, and deprecation replacements. Regenerate with:

```sh
npm run docs
```

The showcase and generated README table use `examples/catalog.json`.
Document commands only after they are implemented, and validate starter
instructions against a generated project.
