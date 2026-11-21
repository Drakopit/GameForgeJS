# __PROJECT_NAME__

Run `gameforge serve --root .` using the CLI that created this project. The local `enginePath` in `gameforge.project.json` lets the development server use that runtime without downloading or copying engine sources.

For an independent installation, run `npm pack` in the engine package and `npm install --ignore-scripts /path/to/gameforgejs-1.0.0.tgz` here. Then use `npm run dev` or `npm run build`. The installed `node_modules/gameforgejs` runtime takes precedence over `enginePath`.

Move the square with arrow keys or WASD. The game starts in `main.js` through `BootstrapGame`, registers `src/levels/FirstLevel.js`, and composes the `GameObject`-based player with `AddEntity`. Start editing `src/entities/Player.js`. Runtime settings are in `game.config.json`; assets are listed in `resources.json`.

`gameforge add audio` or `gameforge add network` updates the generated `src/modules.js` registry. Put custom modules in separate files. Preview writes with `--dry-run`.

`gameforge generate level FirstLevel` creates a class in `src/levels/`; register it deliberately in `main.js` when it is ready. `gameforge update --to 1` applies only known local project-schema migrations.

`gameforge build` produces a portable `dist/` with a generated `@engine/` runtime. Test prefix hosting with `gameforge serve --root dist --base /game/`. Do not edit generated runtime copies in `dist/`.
