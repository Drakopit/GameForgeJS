/** Instance-local glTF node transforms, independent of the shared loaded asset. */
export class SkeletonPose {
    constructor(nodes: any);
    nodes: any;
    world: any;
    parents: any;
    Reset(): void;
    local: any;
    UpdateWorld(): void;
}
