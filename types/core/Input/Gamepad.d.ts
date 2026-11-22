/**
 * Low-level browser gamepad state. Events are useful notifications, but the
 * current state is always reconciled from navigator.getGamepads() each frame.
 */
export class GamePad {
    static instance: any;
    constructor({ shared, target }?: {
        shared?: boolean;
        target?: Window & typeof globalThis;
    });
    target: Window & typeof globalThis;
    gamepads: {};
    previousButtons: {};
    previousAxes: {};
    deadzone: number;
    activationHintShown: boolean;
    connectedHandler: (event: any) => void;
    disconnectedHandler: (event: any) => void;
    Dispose(): void;
    Update(): void;
    LateUpdate(): void;
    ReadBrowserGamepads(): any[];
    RegisterGamepad(pad: any, index?: any): void;
    UnregisterGamepad(index: any): void;
    EnsurePreviousState(index: any, pad: any): void;
    ShowActivationHint(): void;
    IsConnected(padIndex?: number): boolean;
    GetConnectedIndices(): number[];
    GetButton(buttonIndex: any, padIndex?: number): boolean;
    GetButtonDown(buttonIndex: any, padIndex?: number): boolean;
    GetButtonUp(buttonIndex: any, padIndex?: number): any;
    GetAxis(axisIndex: any, padIndex?: number): any;
    GetAxisDown(axisIndex: any, direction: any, padIndex?: number, threshold?: number): boolean;
    GetAxisUp(axisIndex: any, direction: any, padIndex?: number, threshold?: number): boolean;
    IsButtonPressed(button: any): boolean;
    ApplyDeadzone(value: any): any;
}
