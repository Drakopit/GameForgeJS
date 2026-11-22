/** Rasterizes descriptor art once and blits cached native Canvas sprites thereafter. */
export class InputPromptAtlas {
    constructor(assets?: any);
    assets: any;
    tiles: Map<any, any>;
    Draw(ctx: any, descriptor: any, x: any, y: any, size?: number): void;
    Create(glyph: any): CanvasRenderTarget;
    Dispose(): void;
}
import { CanvasRenderTarget } from '../Graphics/CanvasRenderTarget.js';
