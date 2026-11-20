import { HUDFrame, InputHelpPanel as InfoPanel } from 'gameforgejs/2d';
import { Vector3D } from 'gameforgejs/core';

export class RendererHUD {
    constructor(ui) {
        this.frame = new HUDFrame(ui.Draw);
        this.help = new InfoPanel(ui.Draw, { title: 'RENDERER FIELD GUIDE', lines: [] });
    }

    Draw(level) {
        this.frame.Panel({ x: 16, y: 16, width: 470, height: 112 });
        this.frame.Text('RENDERER SHOWCASE', 32, 44, { size: 21, color: this.frame.theme.gold, weight: 700 });
        this.frame.Text(`WebGL2 / lighting / normal maps / shadows    ${level.FPS} FPS`, 32, 67, { size: 12 });
        this.help.DrawAction('HELP',32,80);
        this.help.DrawAction('WEATHER',192,80);
        for(const mesh of level.gallery.meshes){
            const world=Vector3D.FromArray(mesh.transform.position);world.y+=0.8;
            const point=level.camera.Project(world,level.ui.Screen.Width,level.ui.Screen.Height);
            if(point.visible)this.frame.Text(mesh.name.toUpperCase(),point.x,point.y,{size:11,align:'center',color:this.frame.theme.gold});
        }
        this.help.OnDrawn();
    }
}
