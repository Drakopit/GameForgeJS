/**
 * Repeating image layer drawn through an existing Screen. Owns only its offsets.
 * Supply an image or assets service; shared bootstrap assets remain the default.
 * The caller drives hooks and owns the screen, camera and image lifetime.
 */
export class ParallaxLayer2D {
    constructor(screen: any, config?: {}, { image, assets }?: {
        assets?: any;
    });
    screen: any;
    config: {
        x: 0;
        y: 0;
        scale: 1;
        scrollRatioX: 0;
        scrollRatioY: 0;
        repeatX: true;
        repeatY: false;
        opacity: 1;
        speedX: 0;
        speedY: 0;
    };
    image: any;
    offsetX: number;
    offsetY: number;
    OnUpdate(dt?: number): void;
    OnDrawn(camera?: any): void;
    RepeatStart(value: any, size: any): number;
    Dispose(): void;
}
