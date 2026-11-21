# Responsive viewports and demo audit

The native `GameViewport` owns presentation. Games keep their existing `Screen`,
`ScreenUI`, `Level` and ECS lifecycle; there is no second resize loop, canvas
factory or external layout dependency. Configure presentation in
`config/game.config.json`, not in per-demo HTML canvas rules.

## Choose one mode

For a game authored against fixed world/HUD coordinates:

```json
"screen": {
  "width": 960,
  "height": 540,
  "responsive": { "mode": "contain" }
}
```

`contain` preserves the aspect ratio and fits the canvas inside the visible
viewport and device safe areas. Empty space is intentional. CSS uses dynamic
viewport height, so browser bars and rotation do not require a custom listener.
This preserves old gameplay coordinates; it does not turn a desktop HUD into a
mobile HUD or provide missing touch controls.

For an interface/world designed to reflow, use `"mode": "adaptive"` and bind
the native Screen once in `OnStart`:

```js
this.releaseViewport = GameViewport.Bind(this.screen, {
    minWidth: 360,
    maxWidth: 1200,
    onResize: () => this.hud.Layout(),
});
```

Call `this.releaseViewport()` in `OnExit`. `Bind` updates logical dimensions,
tracks `visualViewport` resize/scroll and safe areas, and invokes the callback
after resize. Use `screen.Width`/`Height` for layout. Configuration chooses
presentation; the binding makes reflow explicit because the framework cannot
guess how a game's arena, camera or HUD should change.

For 3D overlays, `GameViewport.Align(worldScreen, uiScreen)` copies presentation
styles while leaving UI stacking order intact. Update camera aspect after a
logical resize. Aether Observatory demonstrates this composition.

## Keep an authored arena inside an adaptive interface

`ResponsiveLayout` is a small pure math helper, not a DOM service:

```js
const layout = new ResponsiveLayout(960, 540);
const view = layout.Fit(screen.Width, screen.Height, { reserveBottom: 180 });
const pointer = layout.ToWorld(Touch.ToScreen(contact.position, screen), view);
```

The returned `x`, `y`, `scale`, `width` and `height` describe a centered,
aspect-preserving rectangle above the reserved control area. Draw the authored
arena under a saved context transform and restore it before drawing adaptive
HUD/touch UI. Fighting's `FightingViewport` shows the complete adapter, including
pointer conversion and lifecycle cleanup. Reserve space only when touch controls
are visible. `Input.instance.presentation.TouchVisible` handles automatic mobile
detection and explicit menu settings; a narrow desktop window alone is not mobile.

## Audit — 20 November 2026

All 20 entry scenes pass automated desktop (1280×800), portrait (390×844),
landscape (844×390), aspect-ratio, canvas bounds, 3D/UI alignment, Help invocation
and disposal checks. These 60 view checks establish presentation behavior, not
complete mobile playthroughs. Dedicated gameplay suites exercise the supported
touch flows separately; emulated devices do not replace physical-device QA.

| Demo | Presentation | Input / remaining debt |
| --- | --- | --- |
| Highland Tactics 3D | Adaptive | Keyboard/gamepad/touch terrain picking and action/facing menus; CT and full skirmish outcomes covered by regression tests. |
| Aether Observatory 3D | Adaptive | Touch stick, jump, camera/tour controls; needs named-device GPU/frame-budget measurements. |
| Cinematic Crossing 2D | Adaptive | Touch play/skip/replay; a focused cinematic, not a campaign. |
| Route Atlas 2D | Adaptive | Touch node selection, enter/back and trial controls; campaign stages remain small demonstrations. |
| Boss Patterns 2D | Adaptive | Touch move/fire/dash and help; needs longer balance and accessibility playtests. |
| Storm Foundry 2D | Adaptive | Touch interactions and live controls; heavy preset still needs physical mobile performance budgets. |
| Toon Adventure 3D | Contain | Keyboard/gamepad; needs touch traversal/combat and a HUD reflow before claiming mobile gameplay. Complete adventure/course remains unfinished. |
| Platformer 2D | Adaptive | Keyboard/gamepad plus native stick/jump, responsive camera/HUD and reserved touch area. |
| Movement Collision 2D | Contain | Keyboard/gamepad; needs touch movement and responsive information density. |
| Component Adventure 2D | Contain | Keyboard/gamepad; needs touch actions and HUD reflow. |
| Platform Adventure 2D | Contain | Keyboard/gamepad; needs touch menus/gameplay and full authored campaign. |
| Tactical RPG 2D | Contain | Keyboard/gamepad; needs deliberate touch tile/command selection and larger targets. |
| Fighting 2D | Adaptive arena + HUD | Keyboard, stable two-controller seats, touch menus, movement, jump, guard and four attacks. Frame-accurate fighting expansion remains planned. |
| Puzzle Battle 2D | Adaptive | Keyboard/gamepad and native touch actions, pause/retry/result, responsive board/HUD layout. |
| Renderer 3D | Contain | Keyboard/gamepad; needs touch camera controls and larger mobile HUD. |
| Solar System 3D | Contain | Keyboard/gamepad; needs touch orbit/zoom and readable mobile labels. |
| Sky Trail 3D | Contain | Keyboard/gamepad menu and gameplay; removed conflicting HTML aspect overrides. Needs touch menu/traversal and HUD reflow. |
| Online Sandbox 2D | Adaptive | Touch lobby, chat, stick/actions and safe areas covered by dedicated multiplayer tests. Public hosting availability is a separate deployment concern. |
| Addons 2D | Contain | Automatic parallax/state-machine demonstration; no player controls promised. Information text needs mobile sizing. |
| Touch Garden 2D | Contain, portrait design | Dedicated touch gestures/pads and rotation tests; pads follow explicit visibility policy. Landscape uses letterboxing. |

The next mobile slice should be **Sky Trail**, then **Toon**, rather than adding
unrelated pads to every legacy example. Each slice must cover menus, help,
gameplay, pause/restart, safe areas and both orientations together.

## Reproduce the checks

```sh
npm run test:viewport
npm run test:fighting
npm run test:online
npm run test:touch
npm run test:lessons
```

The viewport audit writes `test-results/viewport-audit.json`. The Sky Trail issue
was an HTML `!important` aspect rule whose selector depended on canvas buffer
width; WebGL resizes that buffer, so scene and overlay could acquire different
ratios. Core presentation now owns both instead of duplicating CSS per example.
