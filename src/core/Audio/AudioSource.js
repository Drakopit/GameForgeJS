// @ts-check
import { Component } from "../Component.js";
import { SceneComponents } from "../Scene/SceneComponents.js";

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
    constructor(settings = {}, { audio = null, assets = null, position = null, name = "" } = {}) {
        super();
        this.name = name;
        this.settings = SceneComponents.Resolve("AudioSource", settings);
        this.audio = audio;
        this.assets = assets;
        this.position = position;
        /** @type {any} */ this.handle = null;
        this.missing = false;
    }

    /** The decoded clip, or null while it is missing or still loading. */
    Clip() {
        const name = this.settings.clip;
        return name ? this.assets?.audios?.[name] ?? null : null;
    }

    get playing() {
        if (!this.handle) return false;
        return this.settings.mode === "music" ? this.audio?.music === this.handle : this.audio?.activeSources?.has(this.handle.source) ?? false;
    }

    OnStart() {
        if (this.settings.playOnStart) this.Play();
    }

    /** Starts the clip (restarts a sound; a music source fades in over the current track). */
    Play() {
        const buffer = this.Clip();
        this.missing = !buffer;
        if (!buffer || !this.audio) return null;
        const s = this.settings;
        if (s.mode === "music") {
            this.handle = this.audio.PlayMusic(buffer, { volume: s.volume, fade: s.fade, loop: true });
        } else {
            this.handle?.Stop?.();
            this.handle = this.audio.PlaySound(buffer, {
                volume: s.volume, pitch: s.pitch, loop: s.loop,
                position: s.spatial ? this.position?.() ?? [0, 0, 0] : null,
                minDistance: s.minDistance, maxDistance: s.maxDistance,
            });
        }
        return this.handle;
    }

    /** @param {{fade?: number}} [options] */
    Stop({ fade = this.settings.fade } = {}) {
        if (!this.handle) return;
        if (this.settings.mode === "music") {
            if (this.audio?.music === this.handle) this.audio.StopMusic({ fade });
        } else {
            this.handle.Stop?.();
        }
        this.handle = null;
    }

    /** @param {number} volume */
    SetVolume(volume) {
        this.settings.volume = volume;
        if (this.settings.mode === "music") { if (this.audio?.music === this.handle) this.audio.SetMusicVolume(volume, 0); }
        else this.handle?.SetVolume?.(volume);
    }

    OnUpdate() {
        if (this.settings.spatial && this.handle?.SetPosition && this.position) this.handle.SetPosition(this.position());
    }

    OnDestroy() {
        this.Stop({ fade: 0 });
        this.audio = this.assets = this.position = null;
    }
}
