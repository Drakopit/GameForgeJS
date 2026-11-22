/**
 * Resolves readable controller button and axis names into browser Gamepad API indices.
 *
 * Profiles allow the same game's actions to match Xbox, PlayStation or Nintendo labels.
 */
export class GamepadAlias {
    static COMMON: Readonly<{
        LB: "button_4";
        RB: "button_5";
        LT: "button_6";
        RT: "button_7";
        L1: "button_4";
        R1: "button_5";
        L2: "button_6";
        R2: "button_7";
        BACK: "button_8";
        SELECT: "button_8";
        SHARE: "button_8";
        CREATE: "button_8";
        START: "button_9";
        MENU: "button_9";
        OPTIONS: "button_9";
        L3: "button_10";
        R3: "button_11";
        LEFT_STICK_BUTTON: "button_10";
        RIGHT_STICK_BUTTON: "button_11";
        DPAD_UP: "button_12";
        DPAD_DOWN: "button_13";
        DPAD_LEFT: "button_14";
        DPAD_RIGHT: "button_15";
        LEFT_STICK_RIGHT: "axis_0_positive";
        LEFT_STICK_LEFT: "axis_0_negative";
        LEFT_STICK_DOWN: "axis_1_positive";
        LEFT_STICK_UP: "axis_1_negative";
        RIGHT_STICK_RIGHT: "axis_2_positive";
        RIGHT_STICK_LEFT: "axis_2_negative";
        RIGHT_STICK_DOWN: "axis_3_positive";
        RIGHT_STICK_UP: "axis_3_negative";
        LEFT_X: "axis_0";
        LEFTX: "axis_0";
        LEFT_Y: "axis_1";
        LEFTY: "axis_1";
        RIGHT_X: "axis_2";
        RIGHTX: "axis_2";
        RIGHT_Y: "axis_3";
        RIGHTY: "axis_3";
    }>;
    static PROFILES: Readonly<{
        xbox: Readonly<{
            A: "button_0";
            B: "button_1";
            X: "button_2";
            Y: "button_3";
            VIEW: "button_8";
            GUIDE: "button_16";
        }>;
        playstation: Readonly<{
            X: "button_0";
            CROSS: "button_0";
            CIRCLE: "button_1";
            SQUARE: "button_2";
            TRIANGLE: "button_3";
            PS: "button_16";
        }>;
        nintendo: Readonly<{
            B: "button_0";
            A: "button_1";
            Y: "button_2";
            X: "button_3";
            L: "button_4";
            R: "button_5";
            ZL: "button_6";
            ZR: "button_7";
            MINUS: "button_8";
            PLUS: "button_9";
            HOME: "button_16";
        }>;
    }>;
    static EXPLICIT: Readonly<{
        XBOX_A: "button_0";
        XBOX_B: "button_1";
        XBOX_X: "button_2";
        XBOX_Y: "button_3";
        XBOX_LB: "button_4";
        XBOX_RB: "button_5";
        XBOX_LT: "button_6";
        XBOX_RT: "button_7";
        XBOX_VIEW: "button_8";
        XBOX_BACK: "button_8";
        XBOX_MENU: "button_9";
        XBOX_START: "button_9";
        PS_X: "button_0";
        PS_CROSS: "button_0";
        PS_CIRCLE: "button_1";
        PS_SQUARE: "button_2";
        PS_TRIANGLE: "button_3";
        PS_L1: "button_4";
        PS_R1: "button_5";
        PS_L2: "button_6";
        PS_R2: "button_7";
        PS_SHARE: "button_8";
        PS_CREATE: "button_8";
        PS_OPTIONS: "button_9";
        NINTENDO_B: "button_0";
        NINTENDO_A: "button_1";
        NINTENDO_Y: "button_2";
        NINTENDO_X: "button_3";
        NINTENDO_L: "button_4";
        NINTENDO_R: "button_5";
        NINTENDO_ZL: "button_6";
        NINTENDO_ZR: "button_7";
        NINTENDO_MINUS: "button_8";
        NINTENDO_PLUS: "button_9";
    }>;
    static Resolve(input: any, options?: {}, visited?: Set<any>): any;
    static ResolveButtonIndex(input: any, options?: {}): number;
    static ResolveAxis(input: any, options?: {}): {
        index: any;
        direction: string;
    };
    static ResolveAxisIndex(input: any, options?: {}): any;
    static IsNativeToken(input: any): boolean;
    static NormalizeNativeToken(input: any): any;
    static NormalizeAlias(input: any): any;
    static NormalizeProfile(profile: any): string;
    static NormalizeDirection(direction: any): "negative" | "positive";
    static NormalizeAliasMap(aliases?: {}): {};
}
