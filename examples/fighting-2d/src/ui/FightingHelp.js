import { Draw, InfoPanel } from 'gameforgejs/2d';

export class FightingHelp extends InfoPanel {
    constructor(screen) {
        super(new Draw(screen), { title: 'GUIA DE COMBATE / H ou Start', x: 100, y: 112, width: 760, lines: [
            'P1: A/D mover · W saltar · S defender · toque duplo para dash.',
            'P1: J/Z golpe leve · K/X pesado · L/C esfera de energia · U/Q super.',
            'P2: setas · 1/2/3 golpes/esfera · 0 super (também no numpad).',
            'Gamepad: analógico/D-pad · A/↑ salto · ↓/LB defesa · X leve · Y pesado.',
            'Gamepad: RB esfera de energia · RT super. Versus: um controle por jogador.',
            'A esfera é gratuita e recarrega. O super usa 50 EN; você começa com 50.',
            'Acerte leve → pesado → esfera: o buffer ajuda a encadear os golpes.',
            'Defenda de frente, salte sobre poderes e puna a recuperação do rival.',
            'H/Start fecha a ajuda. Esc/Select volta ao menu. O combate continua.',
        ] });
    }
}
