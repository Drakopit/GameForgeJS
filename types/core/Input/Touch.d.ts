/**
 * Identified multi-touch input owned by Input. Client coordinates can be converted
 * through ToScreen to match a framework Screen, including CSS scaling/letterboxing.
 * Legacy last-position accessors remain available.
 */
export class Touch {
    /** Convert client-space Vector2D to logical Screen coordinates. */
    static ToScreen(position: any, screen: any): Vector2D;
    constructor({ shared, target }?: {
        shared?: boolean;
        target?: Window & typeof globalThis;
    });
    target: Window & typeof globalThis;
    touchStartPosition: Vector2D;
    touchEndPosition: Vector2D;
    contacts: Map<any, any>;
    pendingStarts: any[];
    pendingEnds: any[];
    started: any[];
    ended: any[];
    touchStartHandler(event: any): void;
    touchMoveHandler(event: any): void;
    touchEndHandler: (event: any) => void;
    touchCancelHandler: (event: any) => void;
    blurHandler: () => void;
    handlers: {
        touchstart: (event: any) => void;
        touchmove: (event: any) => void;
        touchend: (event: any) => void;
        touchcancel: (event: any) => void;
        blur: () => void;
        resize: () => void;
    };
    EndContacts(event: any, cancelled: any): void;
    /** Latch touch edges once per engine frame; Input calls this automatically. */
    Update(): void;
    ClearFrameData(): void;
    GetActiveTouches(): any[];
    GetStartedTouches(): any[];
    GetEndedTouches(): any[];
    GetTouch(identifier: any): any;
    CancelAll(): void;
    getTouchStartPosition(): Vector2D;
    getTouchEndPosition(): Vector2D;
    Dispose(): void;
}
import { Vector2D } from '../Math/Vector2D.js';
