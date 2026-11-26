export class AudioManager {
    static _instance: any;
    static set instance(value: any);
    static get instance(): any;
    context: any;
    /** @type {any} The game's AssetManager: clips can be played by resources.json name. */
    assets: any;
    masterGain: any;
    analyserNode: any;
    currentBGM: any;
    currentBGMGain: any;
    isInitialized: boolean;
    resumeAudio: any;
    activeSources: Set<any>;
    volume: number;
    muted: boolean;
    maxVoices: number;
    /** @type {{buffer: AudioBuffer, source: AudioBufferSourceNode, gain: GainNode, volume: number}|null} */
    music: {
        buffer: AudioBuffer;
        source: AudioBufferSourceNode;
        gain: GainNode;
        volume: number;
    } | null;
    Initialize(): void;
    SetGlobalVolume(volume: any): void;
    /** Mute preserves the chosen master volume. */
    SetMuted(muted: any): void;
    /**
     * Native, bounded synthesised feedback. Suspended audio is dropped, never
     * queued for a burst after unlock. Returns whether a voice actually started.
     */
    PlayTone({ frequency, endFrequency, duration, volume, wave }?: {
        frequency?: number;
        endFrequency?: any;
        duration?: number;
        volume?: number;
        wave?: string;
    }): boolean;
    /**
     * Plays a one-shot sound effect (kept for older games; see PlaySound).
     */
    /**
     * A clip: an AudioBuffer as it is, or a name from resources.json audios (`assets.audios[name]`,
     * with the game's AssetManager as `assets`). @param {AudioBuffer|string|null} clip
     * @returns {AudioBuffer|null}
     */
    Clip(clip: AudioBuffer | string | null): AudioBuffer | null;
    PlaySFX(audioBuffer: any, localVolume?: number): {
        source: AudioBufferSourceNode;
        gain: GainNode;
        panner: PannerNode | null;
        SetPosition: (position: number[]) => void;
        SetVolume: (volume: number) => void;
        Stop: () => void;
    };
    /**
     * Plays a sound: 2D, or positional when `position` is given (an [x, y, z] point heard from
     * the listener, see SetListener). A suspended context drops one-shots instead of queueing a
     * burst for later; looping sounds start and are heard once audio unlocks.
     * @param {AudioBuffer|string} buffer - Decoded clip, or its resources.json name.
     * @param {{volume?: number, pitch?: number, loop?: boolean, position?: number[]|null, minDistance?: number, maxDistance?: number, force?: boolean}} [options]
     * @returns {{source: AudioBufferSourceNode, gain: GainNode, panner: PannerNode|null, SetPosition: (position: number[]) => void, SetVolume: (volume: number) => void, Stop: () => void}|null}
     */
    PlaySound(buffer: AudioBuffer | string, { volume, pitch, loop, position, minDistance, maxDistance, force }?: {
        volume?: number;
        pitch?: number;
        loop?: boolean;
        position?: number[] | null;
        minDistance?: number;
        maxDistance?: number;
        force?: boolean;
    }): {
        source: AudioBufferSourceNode;
        gain: GainNode;
        panner: PannerNode | null;
        SetPosition: (position: number[]) => void;
        SetVolume: (volume: number) => void;
        Stop: () => void;
    } | null;
    /**
     * Where the listener stands (usually the camera): positional sounds pan and fade from here.
     * @param {number[]} position @param {number[]} [forward] @param {number[]} [up]
     */
    SetListener(position: number[], forward?: number[], up?: number[]): void;
    /**
     * Starts a music track, crossfading from the current one over `fade` seconds (0 cuts).
     * Playing the track that is already on only changes its volume.
     * @param {AudioBuffer|string} buffer - Decoded clip, or its resources.json name.
     * @param {{volume?: number, fade?: number, loop?: boolean}} [options]
     * @example
     * audio.PlayMusic("theme", { fade: 1.5 });
     */
    PlayMusic(buffer: AudioBuffer | string, { volume, fade, loop }?: {
        volume?: number;
        fade?: number;
        loop?: boolean;
    }): {
        buffer: AudioBuffer;
        source: AudioBufferSourceNode;
        gain: GainNode;
        volume: number;
    };
    /** @param {number} volume @param {number} [fade] - Seconds. */
    SetMusicVolume(volume: number, fade?: number): void;
    /** Stops the music, fading out over `fade` seconds (0 stops at once). */
    StopMusic({ fade }?: {
        fade?: number;
    }): void;
    /**
     * Replaces the current background track and starts looping playback (older games; see PlayMusic).
     */
    PlayBGM(audioBuffer: any, localVolume?: number): {
        buffer: AudioBuffer;
        source: AudioBufferSourceNode;
        gain: GainNode;
        volume: number;
    };
    StopBGM(): void;
    Dispose(): Promise<void>;
}
