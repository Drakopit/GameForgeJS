import { Draw, InputHelpPanel as InfoPanel } from 'gameforgejs/2d';

export class FightingHelp extends InfoPanel {
    constructor(screen) {
        super(new Draw(screen), { title: 'GUIA DE COMBATE / H ou Start', x: 100, y: 112, width: 760, lines: [] });
    }
}
