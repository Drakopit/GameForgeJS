# Toon sandbox: lakes and warp gates

This checkpoint expands `examples/toon-adventure-3d` into a 48 × 50 world. It keeps
the introductory courtyard shallows and adds Azure Lake (14 × 18) and Moonwater
Lake (14 × 18), open banks, paths, scenery and a ScreenUI minimap. The existing
five encounters remain active; clearing them does not stop exploration.

## Try the route

1. Run `npm start` and open `/examples/toon-adventure-3d/index.html`.
2. Move with WASD/arrows or the left stick/D-pad. H/Start opens the engine field guide.
3. Walk west from the courtyard spawn into the cyan ring at (-4.5, 3.5).
   You arrive beside Azure Lake at (-6, -12).
4. Stay on the destination: it does not bounce you back, even after the cooldown.
5. Step clear of the ring, then re-enter to return. The HUD identifies the destination.
6. Follow the trail north to the violet gate at (4, -10). It connects to Moonwater
   Lake at (6, -31). The minimap marks water, pads and the player.
7. Enter an open lake bank to wade. Water slows movement and follows footsteps with
   ripple rings. R/top face button resets combat, position, water contact and travel.

Coordinates above are world X/Z. Travel does not respawn sentries or reset HP.
These are automatic paired warp pads inspired by classic online RPG map transitions;
there is no network server, destination selection menu or copied Ragnarok asset.

## Files and ownership

- `data/Lakes.js` reuses the pond definition, with wider grids and longer waves.
- `data/WarpSettings.js` owns IDs, destinations, trigger radius, cooldown and visuals.
- `entities/WarpPoint.js` owns a reusable ring mesh and light-colored beacons.
- `components/WarpTravel.js` extends Component, attaches to the explorer, and runs
  once from the level's existing fixed update after physics. It is detached on exit.
- `ToonRoomLevel` owns water, pads, components and scene cleanup. It does not create
  another loop, input device, screen or renderer.
- `ToonRoomHUD` uses HUDFrame on ScreenUI for the minimap, notices and help.

The component requires a live actor, resolves the destination by ID, clears velocity
and attack intent, and locks the arrival pad until the player leaves it. A short
cooldown also prevents travel between immediately adjacent pads. Defeat blocks travel.

Water remains opaque, shallow and walkable. Swimming, deep-water navigation,
reflection/refraction and authored terrain shorelines remain future work. The simple
rectangular lake meshes demonstrate composition rather than a full terrain editor.

The browser integration checks both lake contacts, both directions of a warp pair,
arrival locking, death/reset behavior, stable physics ownership and WebGL errors in
source and portable builds. Run `npm run test:browser`.
