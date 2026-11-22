/** @deprecated Use `DirectionalLight` from `gameforgejs/3d`. */
export class DirectionalLight3D {
    constructor({ direction, color, intensity, ambientStrength, }?: {
        direction?: number[];
        color?: number[];
        intensity?: number;
        ambientStrength?: number;
    });
    direction: number[];
    color: number[];
    intensity: number;
    ambientStrength: number;
    SetDirection(direction: any): void;
    GetUniforms(): {
        direction: number[];
        color: number[];
        intensity: number;
        ambientStrength: number;
    };
    #private;
}
