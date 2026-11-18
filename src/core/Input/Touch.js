import { Vector2D } from '../Math/Vector2D.js';
import { TouchContact } from './TouchContact.js';

/**
 * Identified multi-touch input owned by Input. Client coordinates can be converted
 * through ToScreen to match a framework Screen, including CSS scaling/letterboxing.
 * Legacy last-position accessors remain available.
 */
export class Touch {
    constructor({ shared = true, target = globalThis.window } = {}) {
        if (shared && Touch.instance) return Touch.instance;
        this.target = target;
        this.touchStartPosition = new Vector2D();
        this.touchEndPosition = new Vector2D();
        this.contacts = new Map();
        this.pendingStarts = [];
        this.pendingEnds = [];
        this.started = [];
        this.ended = [];
        this.touchStartHandler = this.touchStartHandler.bind(this);
        this.touchMoveHandler = this.touchMoveHandler.bind(this);
        this.touchEndHandler = event => this.EndContacts(event, false);
        this.touchCancelHandler = event => this.EndContacts(event, true);
        this.blurHandler = () => this.CancelAll();
        this.handlers = {
            touchstart: this.touchStartHandler, touchmove: this.touchMoveHandler,
            touchend: this.touchEndHandler, touchcancel: this.touchCancelHandler, blur: this.blurHandler, resize: this.blurHandler,
        };
        for (const [name, handler] of Object.entries(this.handlers)) target?.addEventListener(name, handler, { passive: true });
        if (shared) Touch.instance = this;
    }

    touchStartHandler(event) {
        for (const point of Array.from(event.changedTouches ?? event.touches ?? [])) {
            const position = new Vector2D(point.clientX, point.clientY);
            const contact = new TouchContact(point.identifier ?? 0, position);
            this.contacts.set(contact.identifier, contact);
            this.pendingStarts.push(contact.Clone());
            this.touchStartPosition.Copy(position);
        }
    }

    touchMoveHandler(event) {
        for (const point of Array.from(event.changedTouches ?? event.touches ?? [])) {
            const contact = this.contacts.get(point.identifier ?? 0);
            if (!contact) continue;
            contact.position.Set(point.clientX, point.clientY);
            this.touchStartPosition.Copy(contact.position);
        }
    }

    EndContacts(event, cancelled) {
        for (const point of Array.from(event.changedTouches ?? [])) {
            const contact = this.contacts.get(point.identifier ?? 0);
            if (!contact) continue;
            contact.position.Set(point.clientX, point.clientY);
            contact.cancelled = cancelled;
            this.pendingEnds.push(contact.Clone());
            this.touchEndPosition.Copy(contact.position);
            this.contacts.delete(contact.identifier);
        }
    }

    /** Latch touch edges once per engine frame; Input calls this automatically. */
    Update() {
        this.started = this.pendingStarts;
        this.ended = this.pendingEnds;
        this.pendingStarts = [];
        this.pendingEnds = [];
    }

    ClearFrameData() { this.started = []; this.ended = []; }
    GetActiveTouches() { return [...this.contacts.values()].map(contact => contact.Clone()); }
    GetStartedTouches() { return this.started.map(contact => contact.Clone()); }
    GetEndedTouches() { return this.ended.map(contact => contact.Clone()); }
    GetTouch(identifier) { return this.contacts.get(identifier)?.Clone() ?? null; }

    CancelAll() {
        for (const contact of this.contacts.values()) {
            const ended = contact.Clone();
            ended.cancelled = true;
            this.pendingEnds.push(ended);
        }
        this.contacts.clear();
    }

    /** Convert client-space Vector2D to logical Screen coordinates. */
    static ToScreen(position, screen) {
        const canvas = screen.Canvas;
        const bounds = canvas.getBoundingClientRect();
        if (bounds.width <= 0 || bounds.height <= 0) throw new Error('Touch.ToScreen requires a visible screen.');
        return new Vector2D((position.x - bounds.left) * canvas.width / bounds.width,
            (position.y - bounds.top) * canvas.height / bounds.height);
    }

    getTouchStartPosition() { return this.touchStartPosition; }
    getTouchEndPosition() { return this.touchEndPosition; }

    Dispose() {
        for (const [name, handler] of Object.entries(this.handlers)) this.target?.removeEventListener(name, handler);
        this.contacts.clear();
        this.pendingStarts = []; this.pendingEnds = [];
        this.ClearFrameData();
        if (Touch.instance === this) Touch.instance = null;
    }
}
