# Aether Observatory 3D

Explore connected floating islands with native WebGL2 geometry, directional shadows, hemisphere/ambient lighting, distance fog and orbiting meshes. A skippable 3D camera sequence introduces the scene. No models, textures, scripts or fonts are downloaded.

## Run and build

From the repository root:

```sh
npm ci
npm start
# Open /examples/aether-observatory-3d/ on the printed server address.
node cli/index.cjs build --root examples/aether-observatory-3d
npm run test:lessons
```

The built dist/ is portable under a hosting subpath. Only selected framework groups
are distributed. The browser uses native ES modules, zero third-party runtime
packages and no remote assets. Each class has its own file; configuration lives in config/.

## Controls

| Action | Keyboard / mouse | Gamepad | Touch |
| --- | --- | --- | --- |
| Move | WASD / arrows | Left stick / D-pad | Left virtual stick |
| Jump | Space / Enter | A | JUMP |
| Look | Right mouse drag; Q/E | Right stick | Swipe right side |
| Camera mode | C | Y | CAMERA |
| Cinematic | TOUR button; Escape skips | B skips | TOUR / SKIP |
| Respawn / help | R / H | Select / R3 | Fall recovery / HELP |
| Optional telemetry | T | RB | STATS |

## Read the composition in this order

1. Start with [ObservatoryLevel](src/levels/ObservatoryLevel.js). Level3D owns the WebGL renderer, Scene3D, physics and transparent ScreenUI. The game creates no replacement renderer or loop.
2. Read [ObservatoryWorld](src/entities/ObservatoryWorld.js): shared primitive geometry/materials build the environment; static boxes register with PhysicsWorld3D. Collider sizes are explicit world dimensions.
3. [MeshActor](src/entities/MeshActor.js) composes [MeshBinding](src/components/MeshBinding.js), which registers/removes native scene/physics objects. GameObject supplies the established component lifecycle; its 2D position is unused here. Mesh Transform3D remains canonical.
4. [ExplorerMotion](src/components/ExplorerMotion.js) controls Rigidbody3D velocity on fixed updates. Vector3D conversions happen only at native array boundaries; the xz swizzle reads planar speed. PhysicsWorld3D handles sphere/axis-aligned-box contacts.
5. [OrbitMotion](src/components/OrbitMotion.js) animates each fixture/mote with engine delta time. Shared geometry avoids repeated GPU uploads.
6. [ObservatoryCamera](src/components/ObservatoryCamera.js) blends chase/free-orbit poses. [ObservatoryTour](src/components/ObservatoryTour.js) uses parallel Timeline tracks for camera translation, target and FOV; cues set captions. Skip and completion return camera ownership automatically.
7. [ObservatoryHUD](src/ui/ObservatoryHUD.js) exposes keyboard/gamepad/touch through Input, ActionManager, VirtualStick and native Canvas buttons. GameViewport aligns both canvases with safe insets.

## Boundaries and lifecycle

The native renderer now conservatively culls transformed mesh bounds, sorts opaque front-to-back and transparent back-to-front, and disables transparent depth writes. stats counts main-pass visible/culled meshes and triangles, not shadow draw calls. Bounds refresh on Geometry3D.MarkUpdated(), including skeletal deformation. Set mesh.frustumCulled = false for geometry with unknown CPU bounds.

Scene fog is optional and supports native Standard/Toon/Unlit materials; custom celestial shaders remain responsible for their own atmosphere. The scene uses ~260 meshes, shared low-poly geometry, bounded motes and a 1024px shadow map. This is a capability example, not a benchmark or a claim of AAA performance.

PhysicsWorld3D is the existing sphere-versus-axis-aligned-box solver, not a general angular rigid-body simulator. Bridge colliders deliberately match that support. Waterfalls are stylized transparent geometry, not fluid simulation. Thin blended surfaces can still exhibit the usual object-centre sorting limitations. Renderer/GPU resources, bodies, buttons and viewport observers are released on exit.

The existing class-owned entity/component architecture is preserved. Every
component runs on the framework's lifecycle; no archetype ECS rewrite, alternate
renderer, hidden DOM gameplay UI or additional game loop is introduced.
