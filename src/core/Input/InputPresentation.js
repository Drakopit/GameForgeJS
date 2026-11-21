/**
 * Per-input presentation preferences. Reads existing devices; owns no listeners.
 * Touch visibility depends on primary coarse/mobile input, never window width alone.
 */
export class InputPresentation {
    constructor(input) {
        this.input = input;
        this.profile = 'auto';
        this.touchMode = 'auto';
        this.activeProfile = 'keyboard';
        this.telemetry = null;
    }
    get TouchVisible() {
        if (this.touchMode !== 'auto')
            return this.touchMode === 'on';
        return Boolean(globalThis.matchMedia?.('(pointer: coarse)').matches
            || globalThis.navigator?.userAgentData?.mobile
            || (/Android|iPhone|iPad|Mobile/i.test(globalThis.navigator?.userAgent ?? '') && (globalThis.navigator?.maxTouchPoints ?? 0) > 0));
    }
    get Profile() { return this.profile === 'auto' ? this.activeProfile : this.profile; }
    SetProfile(profile) {
        if (typeof profile !== 'string' || !/^[a-z][a-z0-9-]{0,30}$/.test(profile))
            throw new RangeError('Invalid prompt profile.');
        this.profile = profile;
    }
    SetTouchMode(mode) {
        if (!['auto', 'on', 'off'].includes(mode))
            throw new RangeError('Unknown touch visibility mode.');
        this.touchMode = mode;
    }
    Update() {
        const input = this.input;
        for (const [index, pad] of Object.entries(input.gamepad.gamepads)) {
            const buttonEdge = pad.buttons?.some((button, key) => button.pressed && !input.gamepad.previousButtons[index]?.[key]);
            const axisEdge = pad.axes?.some((value, key) => Math.abs(value) > 0.55 && Math.abs(input.gamepad.previousAxes[index]?.[key] ?? 0) <= 0.55);
            if (buttonEdge || axisEdge)
                this.activeProfile = /sony|playstation|dualshock|dualsense|054c/i.test(pad.id ?? '') ? 'playstation'
                    : /xbox|xinput|045e/i.test(pad.id ?? '') ? 'xbox' : 'generic';
        }
        if (Object.values(input.keysDown).some(Boolean) || Object.values(input.mouse.buttonsDown).some(Boolean))
            this.activeProfile = 'keyboard';
    }
}
