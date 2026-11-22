/**
 * Responsive Canvas action buttons. Keyboard/gamepad bindings stay in game config.
 * Layout before input/drawing; Dispose releases each native button's handler.
 */
export class ActionBar {
    /** @param {import('../Window/Screen.js').Screen} screen @param {import('../Graphics/Draw.js').Draw} draw @param {{label:string|(()=>string), run:()=>void, touchOnly?:boolean, visible?:boolean|(()=>boolean)}[]} actions */
    constructor(screen: import("../Window/Screen.js").Screen, draw: import("../Graphics/Draw.js").Draw, actions: {
        label: string | (() => string);
        run: () => void;
        touchOnly?: boolean;
        visible?: boolean | (() => boolean);
    }[]);
    screen: import("../index.js").Screen;
    frame: HUDFrame;
    buttons: {
        button: Button;
        label: string | (() => string);
        run: () => void;
        touchOnly?: boolean;
        visible?: boolean | (() => boolean);
    }[];
    Layout(): void;
    Draw(): void;
    Dispose(): void;
}
import { HUDFrame } from './HUDFrame.js';
import { Button } from './Button.js';
