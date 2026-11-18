# Code conventions for games and framework extensions

Use the established classes before introducing a new abstraction. Each substantial
entity, component, state and UI widget belongs in its own file. Level classes own
scene composition, progression and lifecycle, while collaborators receive explicit
scene/physics/definition dependencies.

## Mathematics and semantic vectors

Use MathExt.Lerp for scalars, MathExt.LerpAngle for the shortest arc in radians and
Vector3D.Lerp for vector interpolation. Factors clamp to 0..1. Vector interpolation
returns a fresh vector and never mutates its endpoints. Angle interpolation keeps
continuity around its starting angle, so a result can exceed PI at the wrap.

```js
import { MathExt, Vector3D } from 'gameforgejs/core';

const position = Vector3D.FromArray(mesh.transform.position);
position.y = MathExt.Lerp(position.y, targetHeight, follow);
mesh.transform.SetPosition(position.x, position.y, position.z);

const velocity = Vector3D.FromArray(body.velocity);
velocity.x = desiredSpeed;
velocity.ToArray(body.velocity);
```

Use .x/.y/.z for spatial logic. Convert arrays at renderer, collider, manifest and
physics boundaries, and write mutations back explicitly. FromArray returns a copy;
it is not a live view. Typed vertex buffers, matrices, joint weights, index lists,
color channels and arbitrary iteration still use indices: these are packed data,
not gameplay vectors. Do not attach aliases to Array.prototype or change all
physics/renderer buffer contracts merely to improve demo readability.

## Named tuning values

Put player-tunable values in the owning course/encounter definition. Keep documented
defaults for external course manifests, so adding a setting does not invalidate old
maps. Presentation layout and style belong to their widget or presentation settings.

Sky Trail uses data/TrailSettings.js for movement defaults, menu timing/orbit, run
rules and scenery proportions. Toon ABS uses Encounter.js for combat parameters,
Pond.js for contact rules and PresentationSettings.js for camera, title and wave
settings. Constants are grouped by owner, not collected into one global settings bag.

Name durations with Seconds and distinguish speeds, thresholds, distances and
radians. Zero, one, dimension counts and mathematical identities need no invented
names. Geometry data and authored coordinates remain in their existing manifests.

Validate behavior when moving tuning values: angular wrapping, interpolation
mutation, analog magnitude, jump buffering, moving-platform carry, reset and cleanup
are contracts. Avoid tests that only check for the spelling of a constant.
