// @ts-check
import { Component } from "../Component.js";
import { SceneComponents } from "../Scene/SceneComponents.js";
import { TargetPosition } from "../Scene/Targets.js";

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
    constructor(settings = {}, { audio = null, assets = null, target = null, name = "" } = {}) {
        super();
        this.name = name;
        this.settings = SceneComponents.Resolve("AudioSource", settings);
        this.audio = audio;
        this.assets = assets;
        this.target = target;
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

    OnStart(context) {
        this.audio ??= context?.services?.get?.("audio") ?? context?.assets?.audio ?? null;
        this.assets ??= context?.assets ?? null;
        if (this.settings.playOnStart) this.Play();
    }

    /** World position of the target (spatial sounds). */
    Position() {
        return TargetPosition(this.target) ?? [0, 0, 0];
    }

    ToJSON() {
        return structuredClone(this.settings);
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
                position: s.spatial ? this.Position() : null,
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
        if (this.settings.spatial && this.handle?.SetPosition && this.target) this.handle.SetPosition(this.Position());
    }

    OnDestroy() {
        this.Stop({ fade: 0 });
        this.audio = this.assets = this.target = null;
    }
}
