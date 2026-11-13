# KayKit character assets

Copied from the user-provided GameDev Resources library. Originals were not
modified. Kay Lousberg created these assets; the bundled license texts declare
CC0. `provenance.json` records the source-relative paths and SHA-256 of each copy.

- `knight.glb`: Adventurers 2.0, Knight, with embedded texture.
- `skeleton.glb`: Skeletons 1.1, Skeleton Warrior, with embedded texture.
- `general.glb`, `movement.glb`: Adventurers 2.0 Rig_Medium animation libraries.
- `melee.glb`: Character Animations 1.1 Rig_Medium melee library.

These are unchanged GLB copies, including library clips not yet used by the demo.
The demo binds compatible animation channels by bone name and checks their rest
transforms. Do not assume other rigs can be substituted without validation.

The current encounter uses an unarmed punch clip. No sword has been attached,
and the gameplay hit area remains a separate, visible rectangular indicator.

## Forest scenery

`forest/` contains three unchanged glTF models (tree, rock, bush), their `.bin`
buffers and shared `forest_texture.png`, copied from KayKit Forest Nature Pack
1.0 FREE. The original CC0 license is in `forest/License.txt`; source-relative
paths and hashes are in `provenance.json`. No conversion or remote download was used.
