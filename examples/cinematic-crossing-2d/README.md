# Cinematic Crossing 2D

A compact camera-and-sequencer lesson: a courier follows waypoints across a bridge while parallel tracks pan/zoom the native 2D Camera, fade transitions and show timed dialogue. Afterwards the same actor becomes player-controlled.

## Run and build

From the repository root:

```sh
npm ci
npm start
# Open /examples/cinematic-crossing-2d/ on the printed server address.
node cli/index.cjs build --root examples/cinematic-crossing-2d
npm run test:lessons
```

The built dist/ is portable under a hosting subpath. Only selected framework groups
are distributed. The browser uses native ES modules, zero third-party runtime
packages and no remote assets. Each class has its own file; configuration lives in config/.

## Controls

| Action | Keyboard / mouse | Gamepad | Touch |
| --- | --- | --- | --- |
| Replay | Space / Enter | A | PLAY |
| Skip | Escape | B | SKIP |
| Walk after scene | A/D / arrows | Left stick / D-pad | Virtual stick |
| Help | H | R3 | HELP |

## Read the composition in this order

1. Read [CrossingLevel](src/levels/CrossingLevel.js): it constructs Screen and Camera through the ordinary Level lifecycle.
2. [Courier](src/entities/Courier.js) composes [WaypointMotion](src/components/WaypointMotion.js), [CourierControl](src/components/CourierControl.js) and [CourierVisual](src/components/CourierVisual.js). Path traversal consumes a distance budget across short segments without overshoot.
3. [CrossingSequence](src/components/CrossingSequence.js) extends the native Timeline component. Continuous tracks own framing, magnification and fade. One-shot cues own dialogue beats. The director is an ordinary GameObject; the engine calls its updates.
4. The sequence's playing state reserves control. Completion, skip or cancellation stops path movement, clears captions/fade and restores player input. Skip samples final track values without playing unseen dialogue.
5. Camera.SetZoom changes magnification without mutating viewport size. Camera.Begin/End apply the native transform; each visual restores its Canvas state.
6. [CrossingHUD](src/ui/CrossingHUD.js) uses ActionBar, InfoPanel and VirtualStick on the same engine Screen. No HTML overlay or duplicate input listeners are created.

## Boundaries and lifecycle

Tracks sample normalized progress and may overlap. Put interpolation in MathExt/vector helpers; put game-specific control locks and caption cleanup in onFinish. Use Timeline.paused for a deliberate pause, Cancel() when leaving a scene, and Play() to replay. Timeline is clocked by its owner's lifecycle; never add a timer or second RAF.

This example teaches sequencing rather than a dialogue editor or a complete narrative game. It deliberately keeps content in config/scenario.json. The ordinary framework cleanup cancels the director and releases the screen/buttons/viewport binding.

The existing class-owned entity/component architecture is preserved. Every
component runs on the framework's lifecycle; no archetype ECS rewrite, alternate
renderer, hidden DOM gameplay UI or additional game loop is introduced.
