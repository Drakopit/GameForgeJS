/**
 * Parses data-driven collision, hurtbox and hitbox definitions for animated entities.
 *
 * @param {Object} [data={}] - Box manifest loaded from game assets.
 */
export class BoxManifest2D {
    constructor(data?: {});
    data: {};
    scale: any;
    origin: any;
    /**
     * Finds active boxes for a type, animation and current frame.
     * @param {string} type - `collision`, `hurt` or `hit`.
     * @param {string} [animationName="*"] - Active animation.
     * @param {number} [frame=0] - Active animation frame.
     * @returns {Object[]} Matching local box definitions.
     */
    GetBoxes(type: string, animationName?: string, frame?: number): any[];
    #private;
}
