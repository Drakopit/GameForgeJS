/**
 * A scene node's `AudioSource`: plays a clip from resources.json (`assets.audios[clip]`) as music
 * (one track at a time, crossfaded) or as a sound (2D, or positional from the node when `spatial`).
 *
 * @example
 * const source = new AudioSource({ clip: "theme", mode: "music", fade: 2 }, { audio, assets });
 * level.AddEntity(source); // plays on start; source.Stop() / source.Play()
 */
export class AudioSource extends Component {
    /**
     * @param {Record<string, any>} [settings] - `AudioSource` component values.
     * @param {{audio?: any, assets?: any, position?: (() => number[])|null, name?: string}} [options]
     *   `audio`: the game's AudioManager; `position`: the node's world position (for spatial sounds).
     */
    constructor(settings?: Record<string, any>, { audio, assets, position, name }?: {
        audio?: any;
        assets?: any;
        position?: (() => number[]) | null;
        name?: string;
    });
    name: string;
    settings: any;
    audio: any;
    assets: any;
    position: () => number[];
    /** @type {any} */ handle: any;
    missing: boolean;
    /** The decoded clip, or null while it is missing or still loading. */
    Clip(): any;
    get playing(): any;
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
