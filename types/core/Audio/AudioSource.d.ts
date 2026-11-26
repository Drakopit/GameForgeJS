/**
 * A scene node's `AudioSource`: plays a clip from resources.json (`assets.audios[clip]`) as music
 * (one track at a time, crossfaded) or as a sound (2D, or positional from the node when `spatial`).
 *
 * Added to a level, it uses the level's audio service and assets; the scene's `AudioSource`
 * component is exactly `settings`.
 *
 * @example
 * level.AddEntity(new AudioSource({ clip: "theme", mode: "music", fade: 2 })); // plays on start
 * level.AddEntity(new AudioSource({ clip: "fire", loop: true, spatial: true }, { target: torch }));
 */
export class AudioSource extends Component {
    /**
     * @param {Record<string, any>} [settings] - `AudioSource` component values.
     * @param {{audio?: any, assets?: any, target?: any, name?: string}} [options]
     *   `audio` / `assets`: default to the level's; `target`: where a spatial sound plays from
     *   (a node, Transform3D, 2D object, [x, y, z] or a function; see Targets.js).
     */
    constructor(settings?: Record<string, any>, { audio, assets, target, name }?: {
        audio?: any;
        assets?: any;
        target?: any;
        name?: string;
    });
    name: string;
    settings: any;
    audio: any;
    assets: any;
    target: any;
    /** @type {any} */ handle: any;
    missing: boolean;
    /** The decoded clip, or null while it is missing or still loading. */
    Clip(): any;
    get playing(): any;
    OnStart(context: any): void;
    /** World position of the target (spatial sounds). */
    Position(): number[];
    ToJSON(): any;
    /** Starts the clip (restarts a sound; a music source fades in over the current track). */
    Play(): any;
    /** @param {{fade?: number}} [options] */
    Stop({ fade }?: {
        fade?: number;
    }): void;
    /** @param {number} volume */
    SetVolume(volume: number): void;
    OnUpdate(): void;
}
import { Component } from "../Component.js";
