/**
 * Canvas slider using Input-owned mouse and identified touch contacts. The owner
 * supplies layout/drawing, calls OnUpdate and can Adjust for keyboard/gamepad.
 * No DOM node, input device, listener or loop is created.
 */
export class Slider {
    /** @param {{Canvas: HTMLCanvasElement}} screen @param {{min: number, max: number, step?: number, value?: number, onChange?: (value: number) => void}} options */
    constructor(screen: {
        Canvas: HTMLCanvasElement;
    }, { min, max, step, value, onChange }: {
        min: number;
        max: number;
        step?: number;
        value?: number;
        onChange?: (value: number) => void;
    });
    screen: {
        Canvas: HTMLCanvasElement;
    };
    min: number;
    max: number;
    step: number;
    value: number;
    onChange: (value: number) => void;
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    /** @type {number | null} */ finger: number | null;
    mouseCaptured: boolean;
    /** @param {{x: number, y: number}} point */
    Contains(point: {
        x: number;
        y: number;
    }): boolean;
    /** @param {number} value */
    SetValue(value: number): void;
    /** @param {number} direction */
    Adjust(direction: number): void;
    /** @param {number} x */
    SetFromPoint(x: number): void;
    OnUpdate(): void;
    Cancel(): void;
}
