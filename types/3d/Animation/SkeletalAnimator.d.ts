/**
 * CPU glTF skeletal playback for small scenes. Owns pose and deformed geometry
 * per Model3D instance. Supports TRS tracks with LINEAR/STEP interpolation.
 * Animation libraries must use matching node names, parent names and rest poses;
 * this is compatible-rig binding, not arbitrary animation retargeting.
 */
export class SkeletalAnimator {
    constructor(model: any);
    model: any;
    pose: SkeletonPose;
    deformers: any;
    clips: Map<any, any>;
    current: any;
    time: number;
    loop: boolean;
    finished: boolean;
    /** Bind one clip from the model itself or a compatible loaded animation asset. */
    AddClip(name: any, source?: any, clipName?: any): this;
    /** Select a clip without restarting it on repeated calls for the same name. */
    Play(name: any, { loop, restart }?: {
        loop?: boolean;
        restart?: boolean;
    }): void;
    Update(dt: any): void;
    /** Sample a clip at an explicit time, useful for combat-timeline synchronization. */
    Seek(time: any): void;
    ApplyPose(): void;
}
import { SkeletonPose } from './SkeletonPose.js';
