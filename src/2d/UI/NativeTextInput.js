import { Input } from '../../core/Input/Input.js';

/** Platform text-entry bridge. TextBox owns all visible rendering and its lifetime. */
export class NativeTextInput {
    constructor(owner) {
        this.owner = owner;
        this.element = document.createElement('input');
        this.element.dataset.gameforgeInput = 'true';
        this.element.type = 'text';
        this.element.autocomplete = 'off';
        this.element.setAttribute('aria-label', owner.placeholder || 'Game text input');
        this.element.enterKeyHint = 'send';
        this.element.maxLength = owner.maxLength;
        this.element.value = owner.text;
        Object.assign(this.element.style, { position: 'fixed', width: '1px', height: '1px',
            opacity: '0', padding: '0', border: '0', fontSize: '16px', pointerEvents: 'none' });
        this.onInput = () => { owner.text = this.element.value.slice(0, owner.maxLength); owner.ResetCaretBlink(); };
        this.onKey = event => {
            event.stopPropagation();
            if (event.isComposing) return;
            if (event.key === 'Enter') { event.preventDefault(); owner.onSubmit?.(owner.text); }
            if (event.key === 'Escape') { event.preventDefault(); owner.SetActive(false); }
        };
        this.onKeyUp = event => event.stopPropagation();
        this.onBlur = () => owner.SetActive(false);
        this.element.addEventListener('input', this.onInput);
        this.element.addEventListener('keydown', this.onKey);
        this.element.addEventListener('keyup', this.onKeyUp);
        this.element.addEventListener('blur', this.onBlur);
        document.body.append(this.element);
    }
    Focus() {
        Input.ClearKeyboard();
        this.Position();
        this.element.focus({ preventScroll: true });
    }
    Position() {
        const canvas = this.owner.screen.Canvas;
        const bounds = canvas.getBoundingClientRect();
        this.element.style.left = `${bounds.left + this.owner.rect.x * bounds.width / canvas.width}px`;
        this.element.style.top = `${bounds.top + this.owner.rect.y * bounds.height / canvas.height}px`;
    }
    Dispose() {
        this.element.removeEventListener('input', this.onInput);
        this.element.removeEventListener('keydown', this.onKey);
        this.element.removeEventListener('keyup', this.onKeyUp);
        this.element.removeEventListener('blur', this.onBlur);
        this.element.remove();
    }
}
