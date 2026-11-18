import { HUDFrame, InfoPanel } from 'gameforgejs/2d';

export class RendererHUD {
    constructor(ui) {
        this.frame = new HUDFrame(ui.Draw);
        this.help = new InfoPanel(ui.Draw, { title: 'RENDERER FIELD GUIDE', lines: [
            'Manifest-loaded models, textures and normal maps.',
            'Directional light, ambient lighting and shadow mapping.',
            'The camera and sphere animate through the level update.',
            'H / Start: toggle this guide. Rendering continues.',
        ] });
    }

    Draw(level) {
        this.frame.Panel({ x: 16, y: 16, width: 470, height: 80 });
        this.frame.Text('RENDERER SHOWCASE', 32, 44, { size: 21, color: this.frame.theme.gold, weight: 700 });
        this.frame.Text(`WebGL2 / lighting / normal maps / shadows    ${level.FPS} FPS`, 32, 67, { size: 12 });
        this.frame.Text('H / Start: field guide', 32, 83, { size: 11, color: this.frame.theme.muted });
        this.help.OnDrawn();
    }
}
