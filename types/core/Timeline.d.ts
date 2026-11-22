/**
 * Reusable, engine-clocked sequence of parallel tracks and one-shot cues.
 * A track samples normalized progress; a cue runs once when its time is crossed.
 * Skip applies track endpoints without playing unvisited cues. Completion always
 * releases game-owned control locks through onFinish, including cancellation.
 */
export class Timeline extends Component {
    /**
     * @param {{duration:number, tracks?: {start:number,duration:number,sample:(progress:number)=>void}[], cues?: {at:number,run:()=>void}[], onFinish?:(reason:'completed'|'skipped'|'cancelled')=>void}} options
     */
    constructor({ duration, tracks, cues, onFinish }: {
        duration: number;
        tracks?: {
            start: number;
            duration: number;
            sample: (progress: number) => void;
        }[];
        cues?: {
            at: number;
            run: () => void;
        }[];
        onFinish?: (reason: "completed" | "skipped" | "cancelled") => void;
    });
    duration: number;
    tracks: {
        start: number;
        duration: number;
        sample: (progress: number) => void;
    }[];
    cues: {
        at: number;
        run: () => void;
    }[];
    onFinish: (reason: "completed" | "skipped" | "cancelled") => void;
    time: number;
    playing: boolean;
    paused: boolean;
    nextCue: number;
    Play(): void;
    /** @param {number} dt */
    OnUpdate(dt: number): void;
    /** @param {number} previous */
    Sample(previous: number): void;
    FireCues(): void;
    Skip(): void;
    Cancel(): void;
    /** @param {'completed'|'skipped'|'cancelled'} reason */
    Finish(reason: "completed" | "skipped" | "cancelled"): void;
}
import { Component } from './Component.js';
