# Input sprites, visibility and native feedback

Gameplay still reads Input/ActionManager and components on the normal engine
lifecycle. Prompt artwork and touch visibility are presentation preferences; they
do not change a game's physical bindings or create another input device/loop.

## One binding source, data-authored help

Each example loads config/prompts.json through its existing resource manifest.
Rows reference logical actions in config/game.config.json:

```json
{
  "schemaVersion": 1,
  "title": "My game / Controls",
  "rows": [
    { "label": "Move", "actions": ["UP", "LEFT", "DOWN", "RIGHT"] },
    { "label": "Jump", "actions": ["JUMP"] }
  ]
}
```

InputPromptRegistry reads the actual ActionManager bindings. It resolves gamepad
aliases to physical button/axis tokens **before** choosing artwork. Thus an action
bound to button_0 shows Xbox A, PlayStation Cross or generic button 1 without
changing how it plays. PS4 and PS5 share the PlayStation symbol family. Unknown
controller IDs use generic artwork; the profile selector can override detection.

Keyboard letters/arrows/keycaps, stick directions and PlayStation shapes are native
descriptors in src/2d/UI/InputGlyphs.js. InputPromptAtlas rasterizes them into
cached offscreen Canvas sprites and blits them with drawImage. No icon font,
remote image request, external package or per-frame glyph rasterization is used.
Unknown inputs show a deliberate fallback. Action labels stay beside icons so
color alone is never the instruction.

Override descriptors in prompts.json without modifying the widget:

```json
{
  "glyphs": {
    "profiles": {
      "keyboard": { "KeyP": { "shape": "key", "label": "P", "color": "#ffd987" } },
      "playstation": { "button_0": { "shape": "circle", "symbol": "cross", "color": "#ffffff" } }
    }
  }
}
```

An external sprite sheet is optional: a descriptor can provide an `image` asset
name, a `source` rectangle with x/y/width/height and an `ariaLabel`. Declare that
image in the game's resource manifest so the existing portable build copies it.
Missing images fall back to the native descriptor rendering.

Legacy adapters can reference configuration paths through a row's `sources`:
keyboard/gamepad arrays contain paths to the real bindings. Fighting Arena uses
this to read fighting.controls directly; it does not maintain a second binding
table for its help. Small explicit `rules` arrays are available for genuinely
unmapped presentation controls, not as a replacement for ActionManager bindings.

InputHelpPanel paginates rows on short screens, supports keyboard/Xbox/PlayStation/
generic profiles, and provides touch mode, sound mute and a close button. Native
Canvas Buttons own their pointer handlers; the HUD/level disposes the panel and
atlas on exit. The existing InfoPanel remains available for ordinary prose.

## Touch controls appear only when appropriate

Input owns one InputPresentation. `TouchVisible` is true in auto mode for a
primary coarse pointer/mobile device, or when explicitly enabled. Window width
alone and a fine-pointer laptop's touch-point count do not turn desktop pads on.
Touch mode is session-local across levels; a new game starts in auto mode.

- auto: follow device capability;
- on: explicit desktop/mobile opt-in;
- off: hide pads and cancel their input, including on mobile.

VirtualStick reads this policy for both input and drawing. ActionBar actions
marked touchOnly hide and disable their hit regions together. Ordinary menu,
lab and replay buttons remain normal mouse-accessible UI; they are not virtual
gamepad controls. Online Sandbox's pause menu exposes the same visibility rule.
Touch Garden and the fighting adapter apply it to their custom controls as well.

Keyboard/gamepad availability is not a claim that every historical demo is fully
mobile-playable. The newer lessons, FX playground, Touch Garden, Online Sandbox
and Fighting Arena have implemented touch interactions; existing genre demos
without touch gameplay keep their keyboard/gamepad workflow and visual help.

## Owned sound effects

SoundEffects is an ordinary Component over the game's AudioManager service.
Attach it to an owned entity and call Play from gameplay events. Its native
oscillator cues use short gain envelopes, a shared master route, a voice cap and
per-cue throttling driven by engine dt. JSON config.audio.cues overrides tune
frequency/endFrequency, duration, volume and wave.

The new examples connect footsteps/jumps, selection, collection, impact,
telegraphs and transitions to real gameplay events. Storm Foundry listens to prop
contacts and user FX events; it does not play a sound for every rain particle.
Mute preserves master volume. Suspended audio drops cues rather than accumulating
an autoplay burst; first user gestures unlock the existing context. A component
never closes a borrowed AudioManager; game disposal stops sources and closes it.
See [MDN's Web Audio guidance](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices).

## Catalog navigation

examples/catalog.json owns entries and categories.json owns category definitions.
`npm run catalog` generates stable grouped HTML on the presentation page;
`npm run catalog:check` detects drift. Filters hide groups only after an explicit
choice. Cards point directly at examples, so selecting one never renders an
intermediate list or initializes an extra canvas.

Main.html and examples/showcase/index.html remain compatibility routers. Known
aliases preserve the remaining query/hash; an empty/unknown selection returns to
the categorized landing page. The old listing implementation is removed.

## Verification commands

```sh
npm run check
npm run test:presentation
npm run test:lessons
npm run test:fighting
npm run test:touch
npm run test:foundry
npm run test:site
npm run test:browser
```

Presentation tests exercise direct launch, filters, art profiles, narrow desktop
versus mobile policy, explicit opt-in/off, responsive help, actual audio signal,
mute and cleanup. Fighting tests additionally cover sparse controller slots,
stable seats after disconnect/reconnect, touchscreen menus and simultaneous
movement/power. Physical hardware certification and the remaining complete-game
playthroughs are tracked in the [readiness evaluation](../plans/zero-to-hero-readiness.md).
