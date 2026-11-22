/**
 * Per-input presentation preferences. Reads existing devices; owns no listeners.
 * Touch visibility depends on primary coarse/mobile input, never window width alone.
 */
export class InputPresentation {
    constructor(input: any);
    input: any;
    profile: string;
    touchMode: string;
    activeProfile: string;
    telemetry: any;
    get TouchVisible(): boolean;
    get Profile(): string;
    SetProfile(profile: any): void;
    SetTouchMode(mode: any): void;
    Update(): void;
}
