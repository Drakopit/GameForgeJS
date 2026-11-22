/**
 * Canvas-rendered chat panel composed from GameForgeJS drawing and text input APIs.
 *
 * The window is transport-neutral: connect it to `ChatManager` or any local
 * message source through `onMessageSubmitted` and `addMessage`.
 *
 * @param {Screen} screen - Canvas screen used for drawing and pointer coordinates.
 * @param {Object} [options] - Window position, size and message limits.
 */
export class ChatWindow {
    constructor(screen: any, { x, y, width, height, title, maxMessages, maxLength, }?: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        title?: string;
        maxMessages?: number;
        maxLength?: number;
    });
    screen: any;
    draw: Draw;
    mouse: any;
    rect: Rectangle;
    title: string;
    maxMessages: number;
    messages: any[];
    submitListeners: any[];
    input: TextBox;
    handleKeyDown: (event: any) => void;
    get IsTyping(): boolean;
    /**
     * Registers a handler for text confirmed by the player.
     * @param {Function} callback - Handler receiving the submitted string.
     * @returns {Function} Unsubscribe callback.
     */
    onMessageSubmitted(callback: Function): Function;
    /**
     * Appends a normalized message for rendering.
     * @param {Object} message - Message containing `text`, name and optional system flag.
     * @returns {void}
     */
    addMessage(message: any): void;
    OnUpdate(dt: any): void;
    OnDrawn(): void;
    DrawMessages(ctx: any): void;
    HandleKeyDown(event: any): void;
    ContainsPoint(point: any, rect?: Rectangle): boolean;
    IsPointerOver(): boolean;
    TrimToWidth(text: any, width: any): any;
    /**
     * Removes input listeners when a scene closes.
     * @returns {void}
     */
    Dispose(): void;
}
import { Draw } from "../Graphics/Draw.js";
import { Rectangle } from "../Graphics/Rectangle.js";
import { TextBox } from "./TextBox.js";
