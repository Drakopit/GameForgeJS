/** Data-authored action help with native sprite prompts and compact input settings. */
export class InputHelpPanel extends InfoPanel {
    constructor(draw: any, options?: {});
    screen: any;
    page: number;
    playerRows: any;
    data: any;
    registry: InputPromptRegistry;
    atlas: InputPromptAtlas;
    buttons: {
        button: Button;
        id: string;
        run: () => void;
    }[];
    _visible: any;
    DrawAction(action: any, x: any, y: any): void;
    DrawRow(id: any, x: any, y: any): void;
    Dispose(): void;
}
import { InfoPanel } from './InfoPanel.js';
import { InputPromptRegistry } from './InputPromptRegistry.js';
import { InputPromptAtlas } from './InputPromptAtlas.js';
import { Button } from './Button.js';
