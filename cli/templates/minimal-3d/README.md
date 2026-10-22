# __PROJECT_NAME__

Run `gameforge serve --root .` using the CLI that created this project. `enginePath` refers to that local package; no download or editable runtime copy is needed.

For an independent installation, run `npm pack` in the engine package and `npm install --ignore-scripts /path/to/gameforgejs-1.0.0.tgz` here. Then use `npm run dev` or `npm run build`. The installed runtime takes precedence over `enginePath`.

The game starts in `main.js` through `BootstrapGame` and registers the `Level3D` subclass in `src/levels/FirstLevel.js`. Edit its `BuildScene()` method to change the cube. The template uses the public 3D scene, mesh and material APIs. A WebGL2-capable browser is required.

Use `gameforge add audio`, `gameforge add network`, or `gameforge generate entity Player`. Preview mutations with `--dry-run`. Keep custom modules separate from generated `src/modules.js`. `gameforge update --to 1` applies known local schema migrations only.

`gameforge build` creates portable `dist/` output. Test it with `gameforge serve --root dist --base /game/`. The `@engine/` directory is a generated distribution asset; engine source remains in its package.
