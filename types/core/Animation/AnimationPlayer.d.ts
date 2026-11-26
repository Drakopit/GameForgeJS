/**
 * Value of a track at `time` (numbers and arrays interpolate; other values step).
 * @param {{keys: any[], interpolation?: string}} track @param {number} time
 */
export function SampleTrack(track: {
    keys: any[];
    interpolation?: string;
}, time: number): any;
/**
 * Code-first entry point: an AnimationPlayer for `target`, built with Clip / Track / Event /
 * Transition and added to a level like any entity.
 * @param {any} target @param {Record<string, any>} [settings]
 */
export function Animate(target: any, settings?: Record<string, any>): AnimationPlayer;
/**
 * Keyframe animation for a scene node, with a basic state machine.
 *
 * A clip (`clips[]`) has `name`, `duration`, `loop`, `tracks` and `events`:
 * - a track animates one `property` through `keys` ([[time, value], …]) with `interpolation`
 *   "linear" (default), "smooth" or "step". Properties: position, rotation (radians, like the
 *   scene's transforms), scale, color (RGBA 0..1), opacity, any other number or array field the
 *   binding knows, and `clip`, whose string keys start a skeletal or sprite clip when reached;
 * - an event ({at, name}) is sent to `On(name, …)` listeners when its time is crossed.
 *
 * States are clips. `transitions` ([{from, to, trigger?, when?, exitTime?}]) change state on
 * `SetTrigger(name)`, when parameter conditions hold (`when: [{param, op, value}]`, op one of
 * > < >= <= == !=) or when the clip ends (`exitTime: true`); `from: "*"` means any state.
 *
 * Code first and scene first build the same object: the scene's `AnimationPlayer` component is
 * exactly the `settings` argument.
 *
 * @example
 * // Code first
 * level.AddEntity(Animate(cube)
 *     .Clip("spin", 8, { loop: true }).Track("rotation", [[0, [0, 0, 0]], [8, [0, Math.PI * 2, 0]]])
 *     .Clip("hit", 0.3).Track("color", [[0, [1, 0, 0, 1]], [0.3, [1, 1, 1, 1]]])
 *     .Transition({ from: "*", to: "hit", trigger: "hit" }).Transition({ from: "hit", to: "spin", exitTime: true }));
 * // Scene first: the same settings, from components.AnimationPlayer
 * level.AddEntity(new AnimationPlayer(node.components.AnimationPlayer, { target: cube }));
 */
export class AnimationPlayer extends Component {
    /**
     * @param {Record<string, any>} [settings] - `AnimationPlayer` component values.
     * @param {{target?: any, name?: string}} [options] - `target`: what the tracks animate (a 3D
     *   scene node, Mesh, Transform3D, 2D object, or any object with Get / Set; see Targets.js).
     */
    constructor(settings?: Record<string, any>, { target, name }?: {
        target?: any;
        name?: string;
    });
    name: string;
    target: {
        Get: (property: string) => any;
        Set: (property: string, value: any) => void;
        PlayClip: (name: string) => void;
    };
    /** @type {Map<string, Set<Function>>} */
    listeners: Map<string, Set<Function>>;
    /** @param {Record<string, any>} settings */
    Configure(settings: Record<string, any>): void;
    settings: any;
    /** @type {Map<string, any>} */
    clips: Map<string, any>;
    transitions: any;
    parameters: any;
    triggers: Set<any>;
    /** The settings (the scene's `AnimationPlayer` component values). */
    ToJSON(): any;
    /** The clip of a state, or null. @param {string} name */
    GetClip(name: string): any;
    /**
     * Adds (or replaces) a clip; the next Track / Event calls add to it.
     * @param {string} name @param {number} duration @param {{loop?: boolean}} [options]
     */
    Clip(name: string, duration: number, { loop }?: {
        loop?: boolean;
    }): this;
    building: {
        name: string;
        duration: number;
        loop: boolean;
        tracks: any[];
        events: any[];
    };
    /**
     * Adds a track to the last clip.
     * @param {string} property @param {Array<[number, any]>} keys @param {"linear"|"smooth"|"step"} [interpolation]
     */
    Track(property: string, keys: Array<[number, any]>, interpolation?: "linear" | "smooth" | "step"): this;
    /** Adds an event to the last clip. @param {number} at @param {string} name */
    Event(at: number, name: string): this;
    /** Adds a transition: {from, to, trigger?, exitTime?, when?}. @param {Record<string, any>} transition */
    Transition(transition: Record<string, any>): this;
    /** @param {string} method */
    Building(method: string): {
        name: string;
        duration: number;
        loop: boolean;
        tracks: any[];
        events: any[];
    };
    /** Switches to a state (clip) from its start. @param {string} name */
    Play(name: string): boolean;
    state: string;
    time: any;
    playing: boolean;
    Stop(): void;
    /** @param {string} name @param {any} value */
    Set(name: string, value: any): void;
    /** @param {string} name */
    SetTrigger(name: string): void;
    /** Listens to clip events and "state" changes; returns a function that stops listening. */
    On(name: any, listener: any): () => boolean;
    /** @param {string} name @param {any} [detail] */
    Send(name: string, detail?: any): void;
    /** @param {number} dt */
    OnUpdate(dt: number): void;
    /** @param {boolean} finished - The clip completed a pass this frame. */
    CheckTransitions(finished: boolean): void;
    /**
     * Applies a clip at `time` to the target; events and clip keys between `previous` and `time`
     * fire (previous = -1 includes time 0).
     */
    Sample(clip: any, time: any, previous: any): void;
}
import { Component } from "../Component.js";
