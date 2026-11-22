/**
 * Web Audio service. New games own an instance; the lazy static accessor supports older games.
 */
export class AudioManager {
    static _instance: any;
    static set instance(value: any);
    static get instance(): any;
    context: any;
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
     * Plays a one-shot sound effect.
     * Creates a source and releases its audio nodes when playback ends.
     */
    PlaySFX(audioBuffer: any, localVolume?: number): void;
    /**
     * Replaces the current background track and starts looping playback.
     */
    PlayBGM(audioBuffer: any, localVolume?: number): void;
    StopBGM(): void;
    Dispose(): Promise<void>;
}
