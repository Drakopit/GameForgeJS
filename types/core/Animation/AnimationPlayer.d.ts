/**
 * Value of a track at `time` (numbers and arrays interpolate; other values step).
 * @param {{keys: any[], interpolation?: string}} track @param {number} time
 */
export function SampleTrack(track: {
    keys: any[];
    interpolation?: string;
}, time: number): any;
/**
 * Keyframe animation for a scene node, with a basic state machine.
 *
 * A clip (`Animation.clips[]`) has `name`, `duration`, `loop`, `tracks` and `events`:
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
 * @example
 * const player = new AnimationPlayer(node.components.Animation, { target: AnimationPlayer.Bind(mesh.transform, { meshes: [mesh] }) });
 * player.SetTrigger("hit");
 * player.On("footstep", () => sounds.Play("step"));
 */
export class AnimationPlayer extends Component {
    /**
     * A target for 3D nodes (a Transform3D and its meshes) or 2D objects (x / y, rotation, scale,
     * color, alpha fields): position / rotation / scale / color / opacity, any other field by name,
     * and `clip` through the object's `animator` (sprite) or `skeletal` animator.
     * @param {any} object - Transform3D, or a 2D game object.
     * @param {{meshes?: any[], animator?: any}} [options]
     */
    static Bind(object: any, { meshes, animator }?: {
        meshes?: any[];
        animator?: any;
    }): {
        Get(property: any): any;
        Set(property: any, value: any): any;
        PlayClip(name: any): void;
    };
    /**
     * @param {Record<string, any>} [settings] - `Animation` component values.
     * @param {{target?: {Get?: (property: string) => any, Set: (property: string, value: any) => void, PlayClip?: (name: string) => void}|null, name?: string}} [options]
     */
    constructor(settings?: Record<string, any>, { target, name }?: {
        target?: {
            Get?: (property: string) => any;
            Set: (property: string, value: any) => void;
            PlayClip?: (name: string) => void;
        } | null;
        name?: string;
    });
    name: string;
    target: {
        Get?: (property: string) => any;
        Set: (property: string, value: any) => void;
        PlayClip?: (name: string) => void;
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
    /** The clip of a state, or null. @param {string} name */
    Clip(name: string): any;
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
