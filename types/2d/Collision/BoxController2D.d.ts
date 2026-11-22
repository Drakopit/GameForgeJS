/**
 * Resolves an entity's manifest-defined collision, hurt and attack boxes in world space.
 *
 * @param {GameObject} owner - Animated entity that supplies position and facing.
 * @param {Object|BoxManifest2D} [manifestData={}] - Box definitions.
 */
export class BoxController2D {
    constructor(owner: any, manifestData?: {});
    owner: any;
    manifest: BoxManifest2D;
    hitMemory: Set<any>;
    previousAnimationName: any;
    GetCollisionBoxes(): any[];
    GetHurtBoxes(): any[];
    /**
     * Returns active attack boxes for the current animation frame.
     * @returns {Object[]} World-space hitboxes.
     */
    GetHitBoxes(): any[];
    GetWorldBoxes(type: any, animationName?: any, frame?: any): any[];
    GetAnimationName(): any;
    GetFrame(): any;
    HasHit(hitbox: any, target: any): boolean;
    MarkHit(hitbox: any, target: any): void;
    ResetHitMemory(): void;
    DrawDebug(draw: any, options?: {}): void;
    #private;
}
import { BoxManifest2D } from "./BoxManifest2D.js";
