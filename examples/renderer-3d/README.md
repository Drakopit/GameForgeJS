# Renderer Showcase 3D

A rain-soaked basin with real-time planar reflections, wet stone and timber, polished metal, moving lights, and distance fog.

## Run and publish

From the repository root:

```sh
node cli/index.cjs serve
# Open /examples/renderer-3d/index.html on the printed server address.
node cli/index.cjs build --root examples/renderer-3d
node cli/index.cjs serve --root examples/renderer-3d/dist
```

The launcher also accepts `Main.html?demo=renderer-3d`.

## Controls

Open Render controls from the canvas, press H, or use gamepad Start. Drag the camera, light, and rain sliders. With keyboard or gamepad, use up/down to select, left/right to adjust, and Enter or the south face button to toggle. Cycle Basin to inspect polished metal, rough stone, and wood up close. The panel also controls light animation, the reflection pass, and telemetry. T or the left shoulder button toggles rain.

## Structure and ownership

- main.js uses BootstrapGame and declares the level order.
- src/modules/RendererModule.js composes the project's framework services and level classes.
- src/levels/ and optional src/screens/ own scene construction and transitions.
- SurfaceGallery composes native meshes and ECS weather. The level configures the camera and lights. Rain impacts feed the surface ripple buffer and the wetness component changes material response over time.
- Screen/Level3D own the canvases; HUDs draw through the framework. No second loop is created.
- config/game.config.json owns window, input and game settings.
- config/resources.json owns resource loading relative to that file.
- config/gameforge.project.json owns CLI/editor metadata.
- config/gameforgejs.package.json selects runtime groups: core, 2d, 3d; addons: none.

Keep assets and their license/provenance files with this project. Model, texture and
editor references are relative to their owner; this example does not import code
or assets from another demo. Build output stays in ignored dist/.

See the [examples catalog](../README.md) for learning order, scope and architecture
conventions. The integration suite loads both source and portable builds; complete
human gameplay testing and device-specific performance checks remain separate.
