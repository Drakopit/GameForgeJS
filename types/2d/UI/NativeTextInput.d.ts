/** Platform text-entry bridge. TextBox owns all visible rendering and its lifetime. */
export class NativeTextInput {
    constructor(owner: any);
    owner: any;
    element: HTMLInputElement;
    onInput: () => void;
    onKey: (event: any) => void;
    onKeyUp: (event: any) => any;
    onBlur: () => any;
    Focus(): void;
    Position(): void;
    Dispose(): void;
}
